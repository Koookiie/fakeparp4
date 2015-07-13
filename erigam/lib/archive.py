import datetime
from sqlalchemy.orm.exc import NoResultFound, FlushError
from sqlalchemy.exc import IntegrityError, DataError
import traceback
import sys
from characters import CHARACTER_DETAILS
from erigam.lib.model import Chat, ChatSession, Log, LogPage

def get_or_create_log(redis, sql, chat_url, chat_type='saved'):
    # Find existing Log, LogPage and Chat or create new ones.
    # If the Log doesn't exist, create Log, LogPage and Chat.
    # If the LogPage doesn't exist, create LogPage.
    # If the Chat doesn't exist, create Chat.
    try:
        log = sql.query(Log).filter(Log.url == chat_url).one()
        try:
            latest_page_query = sql.query(LogPage).filter(LogPage.log_id == log.id).order_by(LogPage.number.asc())
            latest_page = latest_page_query[-1]
            # XXX Is IndexError the right exception?
        except IndexError:
            latest_page = new_page(sql, log)
        try:
            chat = sql.query(Chat).filter(Chat.log_id == log.id).one()
        except NoResultFound:
            chat = Chat(log_id=log.id, type=chat_type)
            sql.add(chat)
            sql.flush()
    except NoResultFound:
        log = Log(url=chat_url)
        sql.add(log)
        sql.flush()
        latest_page = new_page(sql, log)
        chat = Chat(log_id=log.id, type=chat_type)
        sql.add(chat)
        sql.flush()
    return log, latest_page, chat

def new_page(sql, log, last=0):
    new_page_number = last+1
    latest_page = LogPage(log_id=log.id, number=new_page_number, content=u'')
    sql.add(latest_page)
    sql.flush()
    log.page_count = new_page_number
    return latest_page

def archive_chat(redis, sql, chat_url):
    log, latest_page, chat = get_or_create_log(redis, sql, chat_url)
    # If the chat hasn't saved since the last archive, skip it.
    if redis.llen('chat.'+chat_url) == 0:
        return log.id
    # Metadata
    meta = redis.hgetall('chat.'+chat_url+'.meta')
    chat.type = meta.get('type', 'group')
    chat.counter = meta.get('counter', 1)
    chat.topic = meta.get('topic', None)
    chat.background = meta.get('background', None)
    # Sessions
    sql_sessions = sql.query(ChatSession).filter(ChatSession.log_id == log.id)
    #print "sql sessions", sql_sessions
    redis_sessions = redis.hgetall('chat.'+chat_url+'.counters')
    t = [(k, redis_sessions[k]) for k in redis_sessions]
    t.sort()
    redis_sessions = {}
    for k, v in t:
        if v in redis_sessions.values():
            print "Duplicate session found, ignoring"
            continue
        redis_sessions[k] = v

    #print "redis sessions", redis_sessions
    # Update the sessions which are already in the database.
    try:
        for sql_session in sql_sessions:
            default_character = CHARACTER_DETAILS[sql_session.character]
            redis_session = redis.hgetall('session.'+sql_session.session_id+'.chat.'+chat_url)
            redis_session_meta = redis.hgetall('session.'+sql_session.session_id+'.meta.'+chat_url)
            # Delete the session from sql if it's been deleted from redis.
            if len(redis_session) == 0 or len(redis_session_meta) == 0:
                sql.delete(sql_session)
                continue
            expiry_time = datetime.datetime.fromtimestamp(
                redis.zscore('chat-sessions', chat_url+'/'+sql_session.session_id) or 0
            )
            sql_session.expiry_time = expiry_time
            sql_session.group = redis_session_meta.get('group', 'user')
            sql_session.character = redis_session.get('character', 'anonymous/other')
            sql_session.name = redis_session.get('name', default_character['name'])
            sql_session.acronym = redis_session.get('acronym', default_character['acronym'])
            sql_session.color = redis_session.get('color', default_character['color'])
            sql_session.case = redis_session.get('case', default_character['case'])
            sql_session.replacements = redis_session.get('replacements', default_character['replacements'])
            sql_session.quirk_prefix = redis_session.get('quirk_prefix', '')[:1500]
            sql_session.quirk_suffix = redis_session.get('quirk_suffix', '')[:1500]
            try:
                del redis_sessions[str(sql_session.counter)]
            except KeyError:
                print "=== KeyError for SQL session %s ===" % (sql_session.counter)
    except (UnicodeDecodeError, TypeError, KeyError):
        print "=== Error encountered. Not updating this existing session."
        print traceback.print_exc()
        print "=========================================================="
    # And create the ones which aren't.
    for counter, session_id in redis_sessions.items():
        try:
            redis_session = redis.hgetall('session.'+session_id+'.chat.'+chat_url)
            redis_session_meta = redis.hgetall('session.'+session_id+'.meta.'+chat_url)
            # Sometimes the counter list contains sessions that have already been deleted.
            # If this is one of them, skip it.
            if len(redis_session) == 0 or len(redis_session_meta) == 0:
                continue
            expiry_time = datetime.datetime.fromtimestamp(
                redis.zscore('chat-sessions', chat_url+'/'+session_id) or 0
            )
            default_character = CHARACTER_DETAILS[redis_session.get('character', 'anonymous/other')]
            #print "about to add chatsession log.id", log.id, "session id", session_id
            sql_session = ChatSession(
                log_id=log.id,
                session_id=session_id,
                counter=counter,
                expiry_time=expiry_time,
                group=redis_session_meta['group'],
                character=redis_session.get('character', 'anonymous/other'),
                name=redis_session.get('name', default_character['name'])[:100],
                acronym=redis_session.get('acronym', default_character['acronym'])[:15],
                color=redis_session.get('color', default_character['color'])[:6],
                case=redis_session.get('case', default_character['case']),
                replacements=redis_session.get('replacements', default_character['replacements']),
                quirk_prefix=redis_session.get('quirk_prefix', '')[:1500],
                quirk_suffix=redis_session.get('quirk_suffix', '')[:1500],
            )
            sql.merge(sql_session)
            try:
                sql.flush()
            except (IntegrityError, FlushError) as e:
                reason = e.message
                print "=== Error inside loop: ", reason
                sql.rollback()
            except DataError as e:
                print "=== Unicode error. Removing session %s in chat %s" % (session_id, chat_url)
                sql.rollback()
                delete_chat_session(redis, chat_url, session_id)
        except (TypeError, KeyError, UnicodeDecodeError):
            print "=== Error encountered. Skipping this key."
            print '-'*60
            traceback.print_exc(file=sys.stdout)
            print '-'*60
        try:
            sql.flush()
        except (IntegrityError, FlushError) as e:
            reason = e.message
            print "=== Error: ", reason
            sql.rollback()
    # Text
    # XXX MAKE REALLY REALLY REALLY GODDAMN SURE THIS WORKS WITH MINUS NUMBERS
    # XXX FOR GOD'S SAKE
    lines = redis.lrange('chat.'+chat_url, 0, -1)
    for line in lines:
        # Create a new page if the line won't fit on this one.
        #if len(latest_page.content.encode('utf8'))+len(line)>65535:
        if len(latest_page.content.encode('utf8'))+len(line) > 65535:
            print "creating a new page"
            latest_page = latest_page = new_page(sql, log, latest_page.number)
            print "page "+str(latest_page.number)
        latest_page.content += unicode(line, encoding='utf8')+'\n'
    log.time_saved = datetime.datetime.now()
    sql.commit()
    # Don't delete from redis until we've successfully committed.
    redis.ltrim('chat.'+chat_url, len(lines), -1)
    return log.id

def delete_chat_session(redis, chat_url, session_id):
    counter = redis.hget('session.'+session_id+'.meta.'+chat_url, 'counter')
    pipe = redis.pipeline()
    pipe.hdel('chat.'+chat_url+'.counters', counter)
    pipe.delete('session.'+session_id+'.chat.'+chat_url)
    pipe.delete('session.'+session_id+'.meta.'+chat_url)
    pipe.srem('session.'+session_id+'.chats', chat_url)
    pipe.zrem('chat-sessions', chat_url+'/'+session_id)
    pipe.execute()

def delete_chat(redis, sql, chat_url):

    # XXX PIPELINE THIS???

    # Delete metadata first because it's used to check whether a chat exists.
    redis.delete('chat.'+chat_url+'.meta')

    redis.delete('chat.'+chat_url+'.online')
    redis.delete('chat.'+chat_url+'.idle')

    for session_id in redis.hvals('chat.'+chat_url+'.counters'):
        redis.srem('session.'+session_id+'.chats', chat_url)
        redis.delete('session.'+session_id+'.chat.'+chat_url)
        redis.delete('session.'+session_id+'.meta.'+chat_url)
        redis.zrem('chat-sessions', chat_url+'/'+session_id)

    redis.delete('chat.'+chat_url+'.counters')
    redis.delete('chat.'+chat_url)
    redis.srem("public-chats", chat_url)

def delete_session(redis, session_id):

    for chat in redis.smembers('session.'+session_id+'.chats'):
        delete_chat_session(redis, chat, session_id)

    redis.delete('session.'+session_id)
    redis.delete('session.'+session_id+'.meta')
    redis.zrem('all-sessions', session_id)
