#!/usr/bin/python
from redis import Redis
import uuid
import time
import os
import json

from erigam.lib import api
from erigam.lib.model import sm, Message
from erigam.lib.messages import send_message
from erigam.lib.request_methods import redis_pool


OPTION_LABELS = {
    'para0': 'script style',
    'para1': 'paragraph style',
    'nsfw0': 'safe for work',
    'nsfw1': 'not safe for work',
}

def check_compatibility(first, second):
    selected_options = []
    for option in ["para", "nsfw"]:
        first_option = first['options'].get(option)
        second_option = second['options'].get(option)
        if (
            first_option is not None
            and second_option is not None
            and first_option!=second_option
        ):
            return False, selected_options
        if first_option is not None:
            selected_options.append(option+first_option)
        elif second_option is not None:
            selected_options.append(option+second_option)
    blacklist_compatible = True

    for item in first['blacklist']:
        if item.lower() in second['meta']['acronym'].lower():
            blacklist_compatible = False
            break
        if item.lower() in second['meta']['name'].lower():
            blacklist_compatible = False
            break
        if item.lower() in second['meta']['quirk_prefix'].lower():
            blacklist_compatible = False
            break
        if item.lower() in second['meta']['quirk_suffix'].lower():
            blacklist_compatible = False
            break
    
    for item in second['blacklist']:
        if not blacklist_compatible:
            break
        if item.lower() in first['meta']['acronym'].lower():
            blacklist_compatible = False
            break
        if item.lower() in first['meta']['name'].lower():
            blacklist_compatible = False
            break
        if item.lower() in first['meta']['quirk_prefix'].lower():
            blacklist_compatible = False
            break
        if item.lower() in first['meta']['quirk_suffix'].lower():
            blacklist_compatible = False
            break
    
    compatible = first['char'] in second['wanted_chars'] and second['char'] in first['wanted_chars'] and blacklist_compatible
    if first['lastmatched'] == None or second['lastmatched'] == None:
        pass
    elif first['lastmatched'] == second['id'] and second['lastmatched'] == first['id']:
        return False, selected_options
    return compatible, selected_options

if __name__=='__main__': 

    db = sm()
    redis = Redis(connection_pool=redis_pool)

    while True:
        searchers = redis.zrange('searchers', 0, -1)
        
        if len(searchers)>=2: # if there aren't at least 2 people, there can't be matches

            all_chars = redis.smembers('all-chars')
            sessions = [{
                'id': session_id,
                'char': redis.hget('session.'+session_id, 'character'),
                'meta': redis.hgetall('session.'+session_id),
                'wanted_chars': redis.smembers('session.'+session_id+'.picky') or all_chars,
                'options': redis.hgetall('session.'+session_id+'.picky-options'),
                'blacklist': redis.smembers('session.'+session_id+'.picky-blacklist') or set(),
                'lastmatched': redis.get('session.'+session_id+'.matched'),
            } for session_id in searchers]

            already_matched = set()
            for n in range(len(sessions)):
                for m in range(n+1, len(sessions)):
                    if (
                        sessions[n]['id'] not in already_matched
                        and sessions[m]['id'] not in already_matched
                    ):
                        compatible, selected_options = check_compatibility(sessions[n], sessions[m])
                        if not compatible:
                            continue
                        else:
                            print("Match found between %s and %s" % (sessions[n]['id'], sessions[m]['id']))
                        chat = str(uuid.uuid4()).replace('-','')
                        redis.hset('chat.'+chat+'.meta', 'type', 'unsaved')
                        log = api.chat.create(db, redis, chat, 'saved')
                        if len(selected_options)>0:
                            option_text = ', '.join([OPTION_LABELS[o] for o in selected_options])
                            send_message(db, redis, Message(
                                log_id=log.id,
                                type="message",
                                counter=-1,
                                text='This is a '+option_text+' chat.'
                            ))
                        matchdata = {
                            "chat": chat,
                            "log": log.id
                        }
                        redis.set('session.'+sessions[n]['id']+'.match', json.dumps(matchdata))
                        redis.set('session.'+sessions[m]['id']+'.match', json.dumps(matchdata))
                        redis.zrem('searchers', sessions[n]['id'])
                        redis.zrem('searchers', sessions[m]['id'])
                        already_matched.add(sessions[n]['id'])
                        already_matched.add(sessions[m]['id'])
                        redis.setex('session.'+sessions[n]['id']+'.matched', 60, sessions[m]['id'])
                        redis.setex('session.'+sessions[m]['id']+'.matched', 60, sessions[n]['id'])

        time.sleep(1)

