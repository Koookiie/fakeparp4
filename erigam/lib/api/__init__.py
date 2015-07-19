from flask import abort, g
from erigam.lib import get_time, ARCHIVE_PERIOD, PING_PERIOD
from erigam.lib.messages import send_message, send_userlist
from erigam.lib.model import Ban, Message

def ping(redis, chat, session, chat_type):
    online_state = get_online_state(redis, chat, session.session_id)
    if online_state == 'offline':
        # Check IP bans.
        if g.sql.query(Ban).filter(Ban.url == chat).filter(Ban.ip == session.ip).scalar() is not None:
            abort(403)

        # Otherwise make sure it's in the archive queue.
        elif redis.zscore('archive-queue', chat) is None:
            redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))

        # Set user state.
        redis.sadd('chat.'+chat+'.online', session.session_id)

        if session.meta['group'] == 'silent':
            send_userlist(redis, g.log)
        else:
            join_message = '%s [%s] joined chat. ~~ %s ~~' % (session.character['name'], session.character['acronym'], session.meta['counter'])
            send_message(g.sql, redis, Message(
                log_id=g.log.id,
                type="user_change",
                counter=-1,
                text=join_message
            ))
        redis.sadd('sessions-chatting', session.session_id)
        redis.zadd('chats-alive', chat+'/'+session.session_id, get_time(PING_PERIOD*2))
        return True
    redis.zadd('chats-alive', chat+'/'+session.session_id, get_time(PING_PERIOD*2))
    return False

def disconnect(redis, chat, session_id, disconnect_message=None):
    online_state = get_online_state(redis, chat, session_id)
    redis.srem('chat.'+chat+'.'+online_state, session_id)
    redis.zrem('chats-alive', chat+'/'+session_id)
    redis.srem('sessions-chatting', session_id)
    if online_state != 'offline':
        if disconnect_message:
            send_message(g.sql, redis, Message(
                log_id=g.log.id,
                type="user_change",
                counter=-1,
                text=disconnect_message
            ))
        else:
            send_userlist(redis, g.log)

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
