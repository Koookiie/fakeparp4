from flask import abort
from erigam.lib import get_time, ARCHIVE_PERIOD, PING_PERIOD
from erigam.lib.messages import send_message, send_userlist
from erigam.lib.model import Ban, Message

def join(sql, redis, log, session):
    # Check IP bans.
    if sql.query(Ban).filter(Ban.url == log.url).filter(Ban.ip == session.ip).scalar() is not None:
        abort(403)

    # Make sure it's in the archive queue.
    if redis.zscore('archive-queue', log.url) is None:
        redis.zadd('archive-queue', log.url, get_time(ARCHIVE_PERIOD))

    # Set user state.
    redis.sadd('chat.'+log.url+'.online', session.session_id)

    if session.meta['group'] == 'silent':
        send_userlist(redis, log)
    else:
        join_message = '%s [%s] joined chat. ~~ %s ~~' % (session.character['name'], session.character['acronym'], session.meta['counter'])
        send_message(sql, redis, Message(
            log_id=log.id,
            type="user_change",
            counter=-1,
            text=join_message
        ))
    redis.sadd('sessions-chatting', session.session_id)
    redis.zadd('chats-alive', log.url+'/'+session.session_id, get_time(PING_PERIOD*2))
    return True

def disconnect(sql, redis, log, session_id, disconnect_message=None):
    online_state = get_online_state(redis, log.url, session_id)
    redis.srem('chat.'+log.url+'.'+online_state, session_id)
    redis.zrem('chats-alive', log.url+'/'+session_id)
    redis.srem('sessions-chatting', session_id)
    if online_state != 'offline':
        if disconnect_message:
            send_message(sql, redis, Message(
                log_id=log.id,
                type="user_change",
                counter=-1,
                text=disconnect_message
            ))
        else:
            send_userlist(redis, log)

def get_online_state(redis, chat, session_id):
    pipeline = redis.pipeline()
    pipeline.sismember('chat.'+chat+'.online', session_id)
    pipeline.sismember('chat.'+chat+'.idle', session_id)
    online, idle = pipeline.execute()
    if online:
        return 'online'
    elif idle:
        return 'idle'
    return 'offline'
