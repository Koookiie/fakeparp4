#!/usr/bin/python
from redis import Redis
import uuid
import time

from erigam.lib.api import chatapi
from erigam.lib.model import sm, Message
from erigam.lib.messages import send_message
from erigam.lib.request_methods import redis_pool

OPTION_LABELS = {
    'para0': u'script style',
    'para1': u'paragraph style',
    'nsfw0': u'safe for work',
    'nsfw1': u'not safe for work',
}

def check_compatibility(first, second):
    selected_options = []
    for option in ["para", "nsfw"]:
        first_option = first['options'].get(option)
        second_option = second['options'].get(option)
        if (
            first_option is not None
            and second_option is not None
            and first_option != second_option
        ):
            return False, None
        if first_option is not None:
            selected_options.append(option+first_option)
        elif second_option is not None:
            selected_options.append(option+second_option)

    return True, selected_options

if __name__ == '__main__':

    db = sm()
    redis = Redis(connection_pool=redis_pool)

    while True:
        searchers = redis.zrange('searchers', 0, -1)

        if len(searchers) >= 2:  # if there aren't at least 2 people, there can't be matches

            all_chars = redis.smembers('all-chars')
            sessions = [{
                'id': session_id,
                'options': redis.hgetall('session.'+session_id+'.picky-options'),
            } for session_id in searchers]

            already_matched = set()
            for n in range(len(sessions)):
                for m in range(n+1, len(sessions)):
                    print sessions[n]['id'], sessions[m]['id']
                    if (
                        sessions[n]['id'] not in already_matched
                        and sessions[m]['id'] not in already_matched
                    ):
                        compatible, selected_options = check_compatibility(sessions[n], sessions[m])
                        if not compatible:
                            print compatible, selected_options
                            continue
                        chat = str(uuid.uuid4()).replace('-', '')
                        print 'Match found, sending to %s.' % chat
                        print '%s: options %s' % (sessions[n]['id'], sessions[n]['options'])
                        print '%s: options %s' % (sessions[m]['id'], sessions[m]['options'])
                        log = chatapi.create_chat(db, redis, chat, 'saved')
                        if len(selected_options) > 0:
                            option_text = u', '.join(OPTION_LABELS[_] for _ in selected_options)
                            send_message(db, redis, Message(
                                log_id=log.id,
                                type=u"message",
                                counter=-1,
                                text=u"This is a {option} chat.".format(option=option_text)
                            ))
                        redis.hset('session.'+sessions[n]['id']+'.match', 'chat', chat)
                        redis.hset('session.'+sessions[m]['id']+'.match', 'chat', chat)
                        redis.hset('session.'+sessions[n]['id']+'.match', 'log', log.id)
                        redis.hset('session.'+sessions[m]['id']+'.match', 'log', log.id)
                        redis.zrem('searchers', sessions[n]['id'])
                        redis.zrem('searchers', sessions[m]['id'])
                        already_matched.add(sessions[n]['id'])
                        already_matched.add(sessions[m]['id'])

        time.sleep(1)
