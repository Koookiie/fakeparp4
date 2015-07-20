from time import mktime
from flask import abort, g
from erigam.lib import validate_chat_url
from erigam.lib.archive import get_or_create_log
from erigam.lib.model import Log, Chat, ChatSession
from sqlalchemy.orm.exc import NoResultFound

def create_chat(sql, redis, url, chattype="group"):
    if sql.query(Log).filter(Log.url == url).scalar():
        raise ValueError('chaturl_taken')

    if not validate_chat_url(url):
        raise ValueError('chaturl_invalid')

    log, c = get_or_create_log(redis, sql, url, chattype)

    # Commit here because matchmaker cannot commit
    sql.commit()

    if chattype == "group":
        g.user.set_chat(url)
        if g.user.meta['group'] != 'globalmod':
            g.user.set_group('mod')

    redis.hmset('chat.'+url+'.meta', {'type': chattype, 'public': '0'})

    return log

def load_chat(sql, redis, chat):
    redis.delete("chat."+chat+".regen")
    try:
        sql_log = sql.query(Log).filter(Log.url == chat).one()
        sql_chat = sql.query(Chat).filter(Chat.log_id == sql_log.id).one()
        chat_meta = {
            "type": sql_chat.type,
            "counter": sql_chat.counter,
            "public": "0",
        }
        if sql_chat.topic is not None and sql_chat.topic != "":
            chat_meta["topic"] = sql_chat.topic

        if sql_chat.background is not None and sql_chat.background != "":
            chat_meta["background"] = sql_chat.background

        redis.hmset('chat.'+chat+'.meta', chat_meta)
        for sql_session in sql.query(ChatSession).filter(ChatSession.log_id == sql_log.id):
            redis.hset('chat.'+chat+'.counters', sql_session.counter, sql_session.session_id)
            redis.hmset('session.'+sql_session.session_id+'.meta.'+chat, {
                "counter": sql_session.counter,
                "group": sql_session.group,
            })
            redis.hmset('session.'+sql_session.session_id+'.chat.'+chat, {
                "character": sql_session.character,
                "name": sql_session.name,
                "acronym": sql_session.acronym,
                "color": sql_session.color,
                "case": sql_session.case,
                "replacements": sql_session.replacements,
                "quirk_prefix": sql_session.quirk_prefix,
                "quirk_suffix": sql_session.quirk_suffix,
            })
            redis.sadd('session.'+sql_session.session_id+'.chats', chat)
            redis.zadd('chat-sessions', chat+'/'+sql_session.session_id, mktime(sql_session.expiry_time.timetuple()))
    except NoResultFound:
        abort(404)

    return chat_meta
