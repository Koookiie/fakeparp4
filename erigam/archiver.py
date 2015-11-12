#!/usr/bin/python

from redis import Redis
import time
import datetime

from erigam.lib import ARCHIVE_PERIOD, get_time
from erigam.lib.archive import archive_chat, delete_chat_session, delete_session
from erigam.lib.model import sm, Ban
from erigam.lib.request_methods import redis_pool

if __name__ == '__main__':

    db = sm()

    print("Archiving script started.")
    redis = Redis(connection_pool=redis_pool)

    current_time = datetime.datetime.utcnow()

    while True:

        new_time = datetime.datetime.utcnow()

        # Every minute
        if new_time.minute != current_time.minute:
            print("running archiving")

            # Expire IP bans.
            db.query(Ban).filter(Ban.expires < datetime.datetime.utcnow()).delete()
            db.commit()

            # Archive chats.
            for chat in redis.zrangebyscore('archive-queue', 0, get_time()):
                print("archiving chat: ", chat)
                archive_chat(redis, db, chat)

                online = redis.scard('chat.'+chat+'.online')
                idle = redis.scard('chat.'+chat+'.idle')
                # Stop archiving if no-one is online any more.
                if online + idle == 0:
                    redis.zrem('archive-queue', chat)
                else:
                    redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))

            # Delete chat-sessions.
            for chat_session in redis.zrangebyscore('chat-sessions', 0, get_time()):
                print("deleting chat session: ", chat_session)
                delete_chat_session(redis, *chat_session.split('/'))

            # Delete sessions.
            for session_id in redis.zrangebyscore('all-sessions', 0, get_time()):
                print("deleting session: ", session_id)
                delete_session(redis, session_id)

        current_time = new_time

        time.sleep(1)
