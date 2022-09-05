import time

from collections import defaultdict
from redis import Redis

from erigam.lib.messages import send_message
from erigam.lib.request_methods import redis_pool
from erigam.lib.model import sm

db = Redis(connection_pool=redis_pool)
sql = sm()

chat_history = []

while True:
    chats = defaultdict(set)
    for chat_session in db.zrange("chats-alive", 0, -1):
        chat, session = chat_session.split("/")
        chats[chat].add(session)
    chat_history.append(chats)
    if len(chat_history) == 6:
        for chat, sessions in sorted(chat_history[-1].items()):
            # Ignore chats which have autosilence on.
            if db.hget("chat.%s.meta" % chat, "autosilence") is not None:
                continue
            change = len(sessions)-len(chat_history[0][chat])
            if change != 0:
                print(chat, change)
            if change >= 8:
                # Silence all sessions which have entered recently.
                for session in sessions-chat_history[0][chat]:
                    db.hset('session.%s.meta.%s' % (session, chat), 'group', 'silent')
                # Activate autosilence.
                db.hset("chat.%s.meta" % chat, "autosilence", 1)
                # Send a message out.
                # XXX NEEDS TO BE META_CHANGE TOO.
                log = sql.query(Log).filter(Log.url == chat).scalar()
                send_message(sql, redis, Message(
                    log_id=log.id,
                    type="user_change",
                    counter=-1,
                    text="----------------------------------------- SPAM DETECTED, SILENCING -----------------------------------------"
                ))
                print('Spam detected in', chat)
        print()
        del chat_history[0]
    time.sleep(1)
