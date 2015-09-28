try:
    import ujson as json
except:
    import json
import re

from flask import request
from uuid import uuid4

from erigam.lib import DELETE_SESSION_PERIOD, get_time
from erigam.lib.characters import CHARACTER_DETAILS

CASE_OPTIONS = {
    'normal': 'Normal',
    'upper': 'UPPER CASE',
    'lower': 'adaptive lower',
    'title': 'Title Case',
    'inverted': 'iNVERTED',
    'alternating': 'AlTeRnAtInG CaSe',
    'alt-lines': 'alternating LINES',
    'proper': 'Proper grammar',
    'first-caps': 'First letter caps'
}

CHARACTER_DEFAULTS = {
    'character': 'anonymous/other',
    'acronym': '??',
    'name': 'anonymous',
    'color': '000000',
    'quirk_prefix': '',
    'quirk_suffix': '',
    'case': 'normal',
    'replacements': '[]'
}


META_DEFAULTS = {
    'group': 'user'
}

class Session(object):

    def __init__(self, redis, session_id=None, chat=None):

        self.redis = redis
        self.chat = None
        self.session_id = session_id or str(uuid4())
        self.globalmod = redis.sismember('global-mods', self.session_id)
        self.ip = request.headers.get('X-Forwarded-For', request.remote_addr)

        self.original_prefix = 'session.'+self.session_id
        self.original_meta_prefix = self.original_prefix+'.meta'

        # Load metadata and character data.
        if chat is not None:
            self.set_chat(chat)
        else:
            self.prefix = self.original_prefix
            self.meta_prefix = self.original_meta_prefix
            self.meta = get_or_create(redis, self.original_meta_prefix, lambda: META_DEFAULTS)
            self.character = get_or_create(
                redis,
                self.prefix,
                lambda: CHARACTER_DEFAULTS
            )

        # Old data transation hack
        if 'character' not in self.character:
            self.character['character'] = 'anonymous/other'

        # Fill in missing fields from the characters dict.
        self.character = fill_in_data(self.character)

        redis.zadd('all-sessions', self.session_id, get_time(DELETE_SESSION_PERIOD))
        if chat is not None:
            redis.zadd('chat-sessions', self.chat+'/'+self.session_id, get_time(DELETE_SESSION_PERIOD))

    def json_info(self):
        # Unpack the replacement info.
        unpacked_character = dict(self.character)
        unpacked_character['replacements'] = json.loads(unpacked_character['replacements'])
        return {'meta': self.meta, 'character': unpacked_character}

    def save(self, form):
        self.save_character(form)
        self.save_pickiness(form)

    def save_character(self, form):

        character = self.character

        old_acronym = character['acronym']
        old_name = character['name']
        old_color = character['color']

        # Truncate acronym to 15 characters.
        character['acronym'] = form['acronym'][:15]

        # Validate name
        if len(form['name']) > 0:
            # Truncate name to 50 characters.
            character['name'] = form['name'][:50]
        else:
            raise ValueError("name")

        # Validate colour
        if re.compile('^[0-9a-fA-F]{6}$').search(form['color']):
            character['color'] = form['color']
        else:
            raise ValueError("color")

        # Validate character
        if form['character'].lower() in CHARACTER_DETAILS.keys():
            character['character'] = form['character']
        else:
            raise ValueError("character")

        character['quirk_prefix'] = form['quirk_prefix'][:1500]
        character['quirk_suffix'] = form['quirk_suffix'][:1500]

        # Validate case
        if form['case'] in list(CASE_OPTIONS.keys()):
            character['case'] = form['case']
        else:
            raise ValueError("case")

        replacements = list(zip(form.getlist('quirk_from'), form.getlist('quirk_to')))
        # Strip out any rows where from is blank or the same as to.
        replacements = [_ for _ in replacements if _[0] != '' and _[0] != _[1]]
        # And encode as JSON.
        character['replacements'] = json.dumps(replacements)

        saved_character = dict(character)
        pipe = self.redis.pipeline()
        pipe.delete(self.prefix)
        pipe.hmset(self.prefix, saved_character)
        pipe.execute()

        # Chat-related things.
        if self.chat is not None:
            if character['name'] != old_name or character['acronym'] != old_acronym:
                if self.meta['group'] == 'silent':
                    return None
                else:
                    return '%s [%s] is now %s [%s]. ~~ %s ~~' % (old_name, old_acronym, character['name'], character['acronym'], self.meta['counter'])
            elif character['color'] != old_color:
                return None

    def save_pickiness(self, form):
        # Para/NSFW
        option_key = self.prefix+'.picky-options'
        for option in ['para', 'nsfw']:
            if option in form and form[option] in ['0', '1']:
                self.redis.hset(option_key, option, int(form[option]))
            else:
                self.redis.hdel(option_key, option)

    def set_chat(self, chat):
        self.chat = chat
        self.prefix = self.original_prefix+'.chat.'+chat
        self.meta_prefix = self.original_meta_prefix+'.'+chat
        self.meta = get_or_create(
            self.redis,
            self.meta_prefix,
            lambda: new_chat_metadata(self.redis, chat, self.session_id)
        )
        self.character = get_or_create(
            self.redis,
            self.original_prefix,
            lambda: CHARACTER_DEFAULTS
        )
        self.character = fill_in_data(self.character)

    def set_group(self, group):
        self.meta['group'] = group
        self.redis.hset(self.meta_prefix, 'group', group)

def get_or_create(redis, key, default):
    data = redis.hgetall(key)
    if data is None or len(data) == 0:
        data = default()
        redis.hmset(key, data)
    return data

def new_chat_metadata(redis, chat, session_id):
    # This can be overloaded as a general hook for joining a chat for the first time.
    if redis.sismember('global-mods', session_id):
        metadata = {'group': 'globalmod'}
    elif redis.hget('chat.'+chat+'.meta', 'autosilence') == '1':
        metadata = {'group': 'silent'}
    else:
        metadata = dict(META_DEFAULTS)
    metadata['counter'] = redis.hincrby('chat.'+chat+'.meta', 'counter', 1)
    redis.hset('chat.'+chat+'.counters', metadata['counter'], session_id)
    redis.sadd('session.'+session_id+'.chats', chat)
    return metadata

def fill_in_data(character_data):
    # Erigam transition hack
    if 'character' not in character_data:
        character_data['character'] = 'anonymous/other'

    if len(character_data) < len(CHARACTER_DETAILS[character_data['character']])+1:
        new_character_data = dict(CHARACTER_DETAILS[character_data['character']])
        new_character_data.update(character_data)
        return new_character_data
    return character_data
