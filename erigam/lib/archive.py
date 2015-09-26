import datetime
from sqlalchemy.orm.exc import NoResultFound, FlushError
from sqlalchemy.exc import IntegrityError, DataError
import traceback
import sys
from erigam.lib.characters import CHARACTER_DETAILS
from erigam.lib.model import Chat, ChatSession, Log

def get_or_create_log(sql, chat_url, chat_type='saved'):
    # Find existing Log and Chat or create new ones.
    # If the Log doesn't exist, create Log and Chat.
    # If the Chat doesn't exist, create Chat.
    try:
        log = sql.query(Log).filter(Log.url == chat_url).one()
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
        chat = Chat(log_id=log.id, type=chat_type)
        sql.add(chat)
        sql.flush()
    return log, chat

def archive_chat(redis, sql, chat_url):
    log, chat = get_or_create_log(sql, chat_url)
    # If the chat hasn't saved since the last archive, skip it.
    if redis.llen('chat.'+chat_url) == 0:
        return log.id

    # Metadata
    meta = redis.hgetall('chat.'+chat_url+'.meta')
    chat.type = meta.get('type', 'group')
    chat.counter = meta.get('counter', 1)
    chat.topic = meta.get('topic', None)
    chat.background = meta.get('background', None)

    # SQL sessions
    sql_sessions = sql.query(ChatSession).filter(ChatSession.log_id == log.id)

    # Redis sessions
    redis_sessions = {}

    # Remove duplicate sessions from the list of counters
    for key, value in redis.hgetall('chat.'+chat_url+'.counters').items():
        if value in list(redis_sessions.values()):
            print("Duplicate session found, ignoring")
            continue
        redis_sessions[key] = value

    # Update the sessions which are already in the database.
    try:
        for sql_session in sql_sessions:
            redis_session = redis.hgetall('session.'+sql_session.session_id+'.chat.'+chat_url)
            redis_session_meta = redis.hgetall('session.'+sql_session.session_id+'.meta.'+chat_url)

            # Character defaults
            default_character = CHARACTER_DETAILS.get(redis_session.get('character'), 'anonymous/other')

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
                print("=== SQL session %s does not exist in redis counters list ===" % (sql_session.counter))
    except (UnicodeDecodeError, TypeError, KeyError):
        print("=== Error encountered. Not updating this existing session.")
        print(traceback.print_exc())
        print("==========================================================")
    # And create the ones which aren't.
    for counter, session_id in list(redis_sessions.items()):
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
                print("=== Error inside loop: ", reason)
                sql.rollback()
            except DataError as e:
                print("=== Unicode error. Removing session %s in chat %s" % (session_id, chat_url))
                sql.rollback()
                delete_chat_session(redis, chat_url, session_id)
        except (TypeError, KeyError, UnicodeDecodeError):
            print("=== Error encountered. Skipping this key.")
            print('-'*60)
            traceback.print_exc(file=sys.stdout)
            print('-'*60)
        try:
            sql.flush()
        except (IntegrityError, FlushError) as e:
            reason = e.message
            print("=== Error: ", reason)
            sql.rollback()

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

def delete_session(redis, session_id):

    for chat in redis.smembers('session.'+session_id+'.chats'):
        delete_chat_session(redis, chat, session_id)

    redis.delete('session.'+session_id)
    redis.delete('session.'+session_id+'.meta')
    redis.zrem('all-sessions', session_id)
