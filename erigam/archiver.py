#!/usr/bin/python

from redis import Redis
import time
import datetime

from erigam.lib import ARCHIVE_PERIOD, get_time
from erigam.lib.archive import archive_chat, delete_chat_session, delete_session
from erigam.lib.model import sm, Ban
import sqlalchemy.exc
import os

if __name__ == '__main__':

    print "Archiving script started."
    redis = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))

    current_time = datetime.datetime.utcnow()

    while True:

        new_time = datetime.datetime.utcnow()

        # Every minute
        if new_time.minute != current_time.minute:
            print "running archiving"
            sql = sm()

            # Expire IP bans.
            sql.query(Ban).filter(Ban.expires < datetime.datetime.utcnow()).delete()

            # Archive chats.
            for chat in redis.zrangebyscore('archive-queue', 0, get_time()):
                try:
                    print "archiving chat: ", chat
                    archive_chat(redis, sql, chat)
                except (sqlalchemy.exc.IntegrityError, sqlalchemy.exc.ProgrammingError, sqlalchemy.exc.TimeoutError):
                    print "sql error, reconnecting."
                    sql.close()
                    sql = sm()
                    pass
                online = redis.scard('chat.'+chat+'.online')
                idle = redis.scard('chat.'+chat+'.idle')
                # Stop archiving if no-one is online any more.
                if online + idle == 0:
                    redis.zrem('archive-queue', chat)
                else:
                    redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))

            # Delete chat-sessions.
            for chat_session in redis.zrangebyscore('chat-sessions', 0, get_time()):
                print "deleting chat session: ", chat_session
                delete_chat_session(redis, *chat_session.split('/'))

            # Delete sessions.
            for session_id in redis.zrangebyscore('all-sessions', 0, get_time()):
                print "deleting session: ", session_id
                delete_session(redis, session_id)

            sql.close()
            del sql

        current_time = new_time

        time.sleep(1)
