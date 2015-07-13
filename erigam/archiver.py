#!/usr/bin/python

from redis import Redis
import time
import datetime

from erigam.lib import ARCHIVE_PERIOD, get_time
from erigam.lib.archive import archive_chat, delete_chat_session, delete_chat, delete_session
from erigam.lib.messages import send_message
from erigam.lib.model import sm, Ban
import sqlalchemy.exc
import os

if __name__ == '__main__':

    print "Archiving script started."
    redis = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))

    current_time = datetime.datetime.now()

    while True:

        new_time = datetime.datetime.now()

        # Every minute
        if new_time.minute != current_time.minute:
            print "running archiving"
            mysql = sm()

            # Send blank messages to avoid socket timeouts.
            for chat in redis.zrangebyscore('longpoll-timeout', 0, get_time()):
                send_message(redis, chat, -1, "message")

            # Expire IP bans.
            mysql.query(Ban).filter(Ban.expires < datetime.utcnow()).delete()

            # Archive chats.
            for chat in redis.zrangebyscore('archive-queue', 0, get_time()):
                try:
                    print "archiving chat: ", chat
                    archive_chat(redis, mysql, chat)
                except (sqlalchemy.exc.IntegrityError, sqlalchemy.exc.ProgrammingError, sqlalchemy.exc.TimeoutError):
                    print "sql error, reconnecting."
                    mysql.close()
                    mysql = sm()
                    pass
                pipe = redis.pipeline()
                pipe.scard('chat.'+chat+'.online')
                pipe.scard('chat.'+chat+'.idle')
                online, idle = pipe.execute()
                # Delete if no-one is online any more.
                if online+idle == 0:
                    delete_chat(redis, mysql, chat)
                    redis.zrem('archive-queue', chat)
                else:
                    redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))

            # Delete chat-sessions.
            for chat_session in redis.zrangebyscore('chat-sessions', 0, get_time()):
                print "deleting chat session: ", chat_session
                delete_chat_session(redis, *chat_session.split('/'))

            # Delete chats.
            for chat in redis.zrangebyscore('delete-queue', 0, get_time()):
                delete_chat(redis, mysql, chat)
                redis.zrem('delete-queue', chat)

            # Delete sessions.
            for session_id in redis.zrangebyscore('all-sessions', 0, get_time()):
                print "deleting session: ", session_id
                delete_session(redis, session_id)

            mysql.close()
            del mysql

        current_time = new_time

        time.sleep(1)
