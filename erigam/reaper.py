#!/usr/bin/python

from redis import Redis
import time
import os

from erigam.lib import get_time, LONGPOLL_TIMEOUT_PERIOD
from erigam.lib.api import disconnect
from erigam.lib.characters import CHARACTER_DETAILS

if __name__ == '__main__':

    redis = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))

    while True:

        # Send blank messages to avoid socket timeouts.
        for chat in redis.zrangebyscore('longpoll-timeout', 0, get_time()):
            redis.publish("channel.%s" % chat, "{\"messages\":[]}")

            online = redis.scard('chat.'+chat+'.online')
            idle = redis.scard('chat.'+chat+'.idle')

            if online + idle == 0:
                redis.zrem("longpoll-timeout", chat)
            else:
                redis.zadd("longpoll-timeout", chat, get_time(LONGPOLL_TIMEOUT_PERIOD))

        for dead in redis.zrangebyscore('chats-alive', 0, get_time()):
            chat, session = dead.split('/')
            disconnect_message = None
            if redis.hget('session.'+session+'.meta.'+chat, 'group') != 'silent':
                session_name = redis.hget('session.'+session+'.chat.'+chat, 'name')
                if session_name is None:
                    session_name = CHARACTER_DETAILS[redis.hget('session.'+session+'.chat.'+chat, 'character')]['name']
                disconnect_message = '%s\'s connection timed out. Please don\'t quit straight away; they could be back.' % (session_name)
            disconnect(redis, chat, session, disconnect_message)
            print 'dead', dead

        for dead in redis.zrangebyscore('searchers', 0, get_time()):
            print 'reaping searcher', dead
            redis.zrem('searchers', dead)

        time.sleep(1)
