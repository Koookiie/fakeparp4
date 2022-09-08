import json
from collections import defaultdict
from flask import Blueprint, g, request, render_template, make_response, redirect, url_for, jsonify, abort

from erigam.lib import SEARCH_PERIOD, get_time, api, validate_chat_url
from erigam.lib.characters import CHARACTER_GROUPS, CHARACTERS
from erigam.lib.sessions import CASE_OPTIONS
from erigam.lib.request_methods import use_db
from erigam.lib.archive import get_or_create_log

blueprint = Blueprint('main', __name__)

# Helper functions

def show_homepage(error):
    print(g.redis.smembers(g.user.prefix+'.picky'))
    return render_template('front/frontpage.html',
        error=error,
        replacements=json.loads(g.user.character['replacements']),
        tag_text=g.redis.get(g.user.prefix+'.tag-text') or "",
        picky=g.redis.smembers(g.user.prefix+'.picky') or set(),
        picky_options=g.redis.hgetall(g.user.prefix+'.picky-options') or {},
        blacklist=g.redis.smembers(g.user.prefix+'.picky-blacklist') or set(),
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        users_searching=g.redis.zcard('searchers'),
        users_chatting=g.redis.scard('sessions-chatting'),
        message=g.redis.get('front_message') or "Blame Hex",
    )

@blueprint.route("/")
def home():
    return show_homepage(None)

# Groupchats
@blueprint.route("/chats")
def get_chats():
    public_chats = []

    for chat in g.redis.smembers("public-chats"):
        metadata = g.redis.hgetall('chat.'+chat+'.meta')

        # Update NSFW to boolean
        metadata['nsfw'] = metadata.get('nsfw') == "1"

        # Number of online and idle users
        active = g.redis.scard('chat.'+chat+'.online')
        idle = g.redis.scard('chat.'+chat+'.idle')

        # Update the dict
        data = {
            "active": active,
            "idle": idle,
            "url": chat,
            "total_online": active + idle
        }

        metadata.update(data)

        public_chats.append(metadata)

    public_chats = sorted(public_chats, key=lambda k: k['total_online'])
    public_chats = public_chats[::-1]

    return render_template('front/groups.html',
        active_pub=public_chats
    )

# Searching

@blueprint.route('/search', methods=['POST'])
def foundYet():
    target=g.redis.get('session.'+g.user.session_id+'.match')
    if target:
        g.redis.delete('session.'+g.user.session_id+'.match')
        return jsonify(json.loads(target))
    else:
        g.redis.zadd('searchers', {g.user.session_id: get_time(SEARCH_PERIOD*2)})
        abort(404)

@blueprint.route('/stop_search', methods=['POST'])
def quitSearching():
    g.redis.zrem('searchers', g.user.session_id)
    return 'ok'

@blueprint.route('/save', methods=['POST'])
@use_db
def save():
    try:
        if 'character' in request.form:
            g.user.save_character(request.form)
        if 'save_pickiness' in request.form:
            g.user.save_pickiness(request.form)
        if 'create' in request.form:
            chat = request.form['chaturl']
            if g.redis.exists('chat.'+chat+'.meta'):
                raise ValueError('chaturl_taken')
            # USE VALIDATE_CHAT_URL
            if not validate_chat_url(chat):
                raise ValueError('chaturl_invalid')
            g.user.set_chat(chat)
            if g.user.meta['group']!='globalmod':
                g.user.set_group('mod')
            g.redis.hset('chat.'+chat+'.meta', 'type', 'group')
            log, c = get_or_create_log(g.sql, chat, "group")
            g.sql.commit()
            return redirect(url_for('chat.chat') + chat)
    except ValueError as e:
        return show_homepage(e.args[0])

    if 'search' in request.form:
        return redirect(url_for('chat.chat'))
    else:
        return redirect(url_for('main.home'))

# Character bar

@blueprint.route("/charinfo.json")
def getusers():
    if g.redis.exists("cache.usercounts"):
        resp = make_response(g.redis.get("cache.usercounts"))
        resp.headers['Content-type'] = 'application/json'
        return resp

    chars = defaultdict(lambda: 0)

    sessions = g.redis.zrange("chats-alive", 0, -1)

    for x in sessions:
        chat, cookie = x.split("/", 1)
        char = g.redis.hget("session.%s.chat.%s" % (cookie, chat), "character")
        if char is not None:
            chars[char] += 1

    g.redis.set("cache.usercounts", json.dumps(chars))
    g.redis.expire("cache.usercounts", 30)

    return jsonify(chars)
