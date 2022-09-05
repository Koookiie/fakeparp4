import json

from erigam.lib import get_time, LONGPOLL_TIMEOUT_PERIOD
from erigam.lib.characters import CHARACTER_DETAILS

FULL_CHARACTER_LENGTH = len(CHARACTER_DETAILS['anonymous/other'])+1

def send_message(db, redis, message):

    db.add(message)
    db.flush()

    message_dict = message.to_dict()

    # Cache before sending.
    cache_key = "chat:%s" % message.log_id
    redis.zadd(cache_key, {json.dumps(message_dict): message.id})
    redis.zremrangebyrank(cache_key, 0, -51)

    # Prepare pubsub message
    redis_message = {
        "messages": [message_dict],
    }

    if message.type == 'user_change':
        redis_message['online'], redis_message['idle'] = get_userlists(redis, message.log.url)

    if message.type == 'meta_change':
        redis_message['meta'] = redis.hgetall('chat.'+message.log.url+'.meta')

    redis.publish("channel.%s" % message.log.url, json.dumps(redis_message))
    redis.zadd('longpoll-timeout', {message.log.url: get_time(LONGPOLL_TIMEOUT_PERIOD)})

def send_userlist(redis, log):
    redis_message = {
        "messages": []
    }

    redis_message['online'], redis_message['idle'] = get_userlists(redis, log.url)

    redis.publish("channel.%s" % log.url, json.dumps(redis_message))

def get_userlists(redis, chat):

    ratelimit = redis.incr("chat:" + chat + ":ratelimit")
    if ratelimit > 25:
        return [{
            'character': 'anonymous/other',
            'acronym': 'RATELIMIT',
            'name': 'REFRESH LIMITED. PLEASE REFRESH',
            'color': '000000',
            'quirk_prefix': '',
            'quirk_suffix': '',
            'case': 'normal',
            'replacements': '[]'
        }], []

    pipe = redis.pipeline()
    pipe.smembers('chat.'+chat+'.online')
    pipe.smembers('chat.'+chat+'.idle')
    redis.expire("chat:" + chat + ":ratelimit", 1)
    sessions_online, sessions_idle = pipe.execute()

    online = get_sublist(redis, chat, sessions_online)
    idle = get_sublist(redis, chat, sessions_idle)

    return online, idle

def get_sublist(redis, chat, sessions):
    sublist = []
    sl_pipe = redis.pipeline()
    for session in sessions:
        sl_pipe.hgetall('session.'+session+'.chat.'+chat)
        sl_pipe.hgetall('session.'+session+'.meta.'+chat)
        session_character, session_meta = sl_pipe.execute()
        if len(session_character) < FULL_CHARACTER_LENGTH:
            new_session_character = dict(CHARACTER_DETAILS[session_character.get('character', 'anonymous/other')])
            new_session_character.update(session_character)
            session_character = new_session_character
        if session_character and session_meta:
            if len(session_character) > 16:
                session_character = dict(CHARACTER_DETAILS['anonymous/other'])

            sublist.append({
                'character': session_character,
                'meta': session_meta,
            })
    sublist.sort(key=lambda _: _['character']['name'].lower())
    return sublist
