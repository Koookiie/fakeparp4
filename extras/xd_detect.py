#!/usr/bin/python

from redis import Redis
import json
import time
import os

from lib.api import disconnect

db = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))
pubsub = db.pubsub()
pubsub.psubscribe('channel.*')

for message in pubsub.listen():
    try:
        data = json.loads(message['data'])
        for line in data['messages']:
            if line['counter'] < 1:
                continue
            decoded_line = line['line'].decode("utf8").lower()
            if u'xd' in decoded_line:
                time.sleep(1)
                chat_url = message['channel'][8:]
                session_id = db.hget('chat.%s.counters' % chat_url, line['counter'])
                db.publish('channel.'+chat_url+'.'+session_id, '{"exit":"kick"}')
                disconnect(db, chat_url, session_id, "----------------------------------------- SCENE DETECTED, KICKING -----------------------------------------")
                print 'Scene detected in', chat_url
                print line['line']
                break
    except:
        pass
