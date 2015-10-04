import datetime

from erigam.lib.api import state
from erigam.lib.model import Log, Ban, Message
from erigam.lib.messages import send_message

def ban(sql, redis, chat, ip, user=None, reason=None, message=None):
    newban = Ban(
        url=chat,
        ip=ip,
        expires=datetime.datetime.utcnow() + datetime.timedelta(weeks=3)
    )

    if reason:
        newban.reason = reason

    if user:
        newban.counter = user['counter']
        newban.name = user['name']

    sql.add(newban)

    log = sql.query(Log).filter(Log.url == chat).scalar()

    if log and user:
        session = user['session']
        redis.publish('channel.' + chat + '.' + session, '{"exit":"ban"}')

        if redis.sismember('chat.'+chat+'.online', session) or redis.sismember('chat.'+chat+'.idle', session):
            state.disconnect(sql, redis, log, session, message)
        else:
            send_message(sql, redis, Message(
                log_id=log.id,
                type="user_change",
                counter=-1,
                text=message
            ))

def unban(sql, chat=None, banid=None):
    query = sql.query(Ban)

    if not chat and not banid:
        return

    if chat:
        query = query.filter(Ban.url == chat)

    if banid:
        query = query.filter(Ban.id == banid)

    query.delete()
