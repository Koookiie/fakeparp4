try:
    import ujson as json
except:
    import json
import random
import re
import requests

from flask import g, request
from uuid import uuid4

from lib import DELETE_SESSION_PERIOD, get_time, DogeNotPaidException
from messages import send_message

CASE_OPTIONS = {
    'normal': 'Normal',
    'upper': 'UPPER CASE',
    'lower': 'lower case',
    'title': 'Title Case',
    'inverted': 'iNVERTED',
    'alternating': 'AlTeRnAtInG'
}

CHARACTER_DEFAULTS = {
    'acronym': '??',
    'name': 'anonymous',
    'color': '000000',
    'quirk_prefix': '',
    'quirk_suffix': '',
    'case': 'normal',
    'replacements': '[]'
}

def erigam_defaults():
    return random.choice([{
        'acronym': 'TC',
        'name': 'terminallyCapricious',
        'color': '2B0057',
        'quirk_prefix': '',
        'case': 'alternating',
        'replacements': '[]'
    }, {
        'acronym': 'CA',
        'name': 'caligulasAquarium',
        'color': '6A006A',
        'quirk_prefix': '',
        'case': 'normal',
        'replacements': '[["V", "VV"], ["v", "vv"], ["W", "WW"], ["w", "ww"]]'
    }])

META_DEFAULTS = {
    'group': 'user'
}

class Session(object):

    def __init__(self, redis, session_id=None, chat=None):

        self.redis = redis
        self.session_id = session_id or str(uuid4())
        self.chat = chat

        original_prefix = 'session.'+self.session_id
        original_meta_prefix = original_prefix+'.meta'

        # Load metadata and character data.
        if chat is not None:
            self.prefix = original_prefix+'.chat.'+chat
            self.meta_prefix = original_meta_prefix+'.'+chat
            self.meta = get_or_create(
                redis,
                self.meta_prefix,
                lambda: new_chat_metadata(redis, chat, session_id)
            )
            self.character = get_or_create(
                redis,
                self.prefix,
                lambda: get_or_create(
                    redis,
                    original_prefix,
                    lambda: dict(erigam_defaults())
                )
            )
        else:
            self.prefix = original_prefix
            self.meta_prefix = original_meta_prefix
            self.meta = get_or_create(redis, original_meta_prefix, lambda: META_DEFAULTS)
            self.character = get_or_create(
                redis,
                self.prefix,
                lambda: dict(erigam_defaults())
            )

        # Character encodings are stupid.
        self.unicodify()

        redis.zadd('all-sessions', self.session_id, get_time(DELETE_SESSION_PERIOD))
        if chat is not None:
            redis.zadd('chat-sessions', self.chat+'/'+self.session_id, get_time(DELETE_SESSION_PERIOD))

    def unicodify(self):
        for key in self.meta.keys():
            try:
                self.meta[key] = unicode(self.meta[key], encoding='utf-8')
            except TypeError:
                # Don't care if it's already unicode.
                pass
        for key in self.character.keys():
            try:
                self.character[key] = unicode(self.character[key], encoding='utf-8')
            except TypeError:
                # Don't care if it's already unicode.
                pass

    def json_info(self):
        # Unpack the replacement info.
        unpacked_character = dict(self.character)
        unpacked_character['replacements'] = json.loads(unpacked_character['replacements'])
        return { 'meta': self.meta, 'character': unpacked_character }

    def save(self, form):
        self.save_character(form)
        self.save_pickiness(form)

    def save_character(self, form):

        redis = self.redis
        character = self.character

        old_acronym = character['acronym']
        old_name = character['name']
        old_color = character['color']

        # Truncate acronym to 15 characters.
        character['acronym'] = form['acronym'][:15]

        # Validate name
        if len(form['name'])>0:
            # Truncate name to 50 characters.
            character['name'] = form['name'][:50]
        else:
            raise ValueError("name")

        # Validate colour
        if re.compile('^[0-9a-fA-F]{6}$').search(form['color']):
            character['color'] = form['color']
        else:
            raise ValueError("color")

        character['quirk_prefix'] = form['quirk_prefix'][:1500]
        character['quirk_suffix'] = form['quirk_suffix'][:1500]

        # Validate case
        if form['case'] in CASE_OPTIONS.keys():
            character['case'] = form['case']
        else:
            raise ValueError("case")

        replacements = zip(form.getlist('quirk_from'), form.getlist('quirk_to'))
        # Strip out any rows where from is blank or the same as to.
        replacements = [_ for _ in replacements if _[0]!='' and _[0]!=_[1]]
        # And encode as JSON.
        character['replacements'] = json.dumps(replacements)

        saved_character = dict(character)
        pipe = redis.pipeline()
        pipe.delete(self.prefix)
        pipe.hmset(self.prefix, saved_character)
        pipe.execute()

        # Chat-related things.
        if self.chat is not None:
            if character['name']!=old_name or character['acronym']!=old_acronym:
                if self.meta['group']=='silent':
                    user_change_message = None
                else:
                    user_change_message = '%s [%s] is now %s [%s].' % (old_name, old_acronym, character['name'], character['acronym'])
                send_message(redis, request.form['chat'], -1, 'user_change', user_change_message)
            elif character['color']!=old_color:
                send_message(redis, request.form['chat'], -1, 'user_change', None)

    def save_pickiness(self, form):
        # Tags
        tag_text = form['tags'][:500]
        pipe = self.redis.pipeline()
        pipe.set(self.prefix+'.tag-text', tag_text)
        pipe.delete(self.prefix+'.tags')
        pipe.sadd(self.prefix+'.tags', *(tag.lower().strip() for tag in form['tags'].split(",")))
        pipe.execute()
        # Other options
        option_key = self.prefix+'.picky-options'
        for option in ['para', 'nsfw']:
            if option in form and form[option] in ['0', '1', '2']:
                self.redis.hset(option_key, option+'2', int(form[option]))
            else:
                self.redis.hset(option_key, option+'2', 2)
        for option in ['para', 'nsfw']:
            if option in form and form[option] in ['0', '1']:
                self.redis.hset(option_key, option, int(form[option]))
            else:
                self.redis.hdel(option_key, option)

    def set_chat(self, chat):
        if self.chat is None:
            # XXX This is pretty much just cut and pasted from __init__().
            self.chat = chat
            self.prefix = self.prefix+'.chat.'+chat
            self.meta_prefix = self.meta_prefix+'.'+chat
            self.meta = get_or_create(
                self.redis,
                self.meta_prefix,
                lambda: new_chat_metadata(self.redis, chat, self.session_id)
            )
            self.character = get_or_create(
                self.redis,
                self.prefix,
                lambda: self.character
            )
            self.unicodify()

    def set_group(self, group):
        self.meta['group'] = group
        self.redis.hset(self.meta_prefix, 'group', group)


def get_or_create(redis, key, default):
    data = redis.hgetall(key)
    if data is None or len(data)==0:
        data = default()
        redis.hmset(key, data)
    return data

def new_chat_metadata(redis, chat, session_id):
    # This can be overloaded as a general hook for joining a chat for the first time.
    if redis.sismember('global-mods', session_id):
        metadata = { 'group': 'globalmod' }
    elif redis.hget('chat.'+chat+'.meta', 'autosilence')=='1':
        metadata = { 'group': 'silent' }
    else:
        metadata = dict(META_DEFAULTS)
    if redis.hget('chat.'+chat+'.meta', 'doge')=='1':
        send_address = redis.hget('session.'+session_id+'.meta', 'doge_send_address')
        if send_address is None:
            r = requests.post("http://rcx2.scorpiaproductions.co.uk/eridoge/new")
            if r.status_code==200:
                send_address = r.text
                redis.hset('session.'+session_id+'.meta', 'doge_send_address', send_address)
                raise DogeNotPaidException(send_address)
        else:
            if requests.post("http://rcx2.scorpiaproductions.co.uk/eridoge/verify/%s" % send_address).status_code!=204:
                raise DogeNotPaidException(send_address)
            redis.hdel('session.'+session_id+'.meta', 'doge_send_address')
    metadata['counter'] = redis.hincrby('chat.'+chat+'.meta', 'counter', 1)
    redis.hset('chat.'+chat+'.counters', metadata['counter'], session_id)
    redis.sadd('session.'+session_id+'.chats', chat)
    return metadata
