#!/usr/bin/python

from redis import Redis
import time
import os

from lib import get_time
from lib.api import disconnect
from lib.characters import CHARACTER_DETAILS

if __name__ == '__main__':

    redis = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))

    while True:

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
