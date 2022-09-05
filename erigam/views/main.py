import json
from flask import Blueprint, g, request, render_template, redirect, url_for, jsonify, abort

from erigam.lib import SEARCH_PERIOD, get_time
from erigam.lib import api
from erigam.lib.characters import CHARACTER_GROUPS, CHARACTERS
from erigam.lib.sessions import CASE_OPTIONS
from erigam.lib.request_methods import use_db

blueprint = Blueprint('main', __name__)

# Helper functions

def show_homepage(error):
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

    return render_template('front/frontpage.html',
        error=error,
        replacements=json.loads(g.user.character['replacements']),
        tag_text=g.redis.get(g.user.prefix+'.tag-text') or "",
        picky_options=g.redis.hgetall(g.user.prefix+'.picky-options') or {},
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        users_searching=g.redis.zcard('searchers'),
        users_chatting=g.redis.scard('sessions-chatting'),
        active_pub=public_chats,
        message=g.redis.get('front_message') or "Blame Nepeat",
    )

@blueprint.route("/")
def home():
    return show_homepage(None)

# Searching

@blueprint.route('/search', methods=['POST'])
def foundYet():
    target = g.redis.hgetall('session.'+g.user.session_id+'.match')
    if target:
        g.redis.delete('session.'+g.user.session_id+'.match')
        return jsonify(target)
    else:
        g.redis.zadd('searchers', g.user.session_id, get_time(SEARCH_PERIOD*2))
        abort(404)

@blueprint.route('/stop_search', methods=['POST'])
def quitSearching():
    g.redis.zrem('searchers', g.user.session_id)
    return 'ok'

# Save

@blueprint.route('/save', methods=['POST'])
@use_db
def save():
    try:
        if 'character' in request.form:
            g.user.save_character(request.form)
        if 'para' in request.form or 'nsfw' in request.form:
            g.user.save_pickiness(request.form)
        if 'create' in request.form:
            if g.redis.hexists('punish-scene', g.user.ip):
                raise ValueError('pandamode')
            log = api.chat.create(g.sql, g.redis, request.form['chaturl'], 'group')
            return redirect(url_for('chat.chat', chat_url=log.url))
        elif 'tags' in request.form:
            g.user.save_pickiness(request.form)
    except ValueError as e:
        return show_homepage(e.args[0])

    if 'search' in request.form:
        return redirect(url_for('chat.chat'))
    else:
        return redirect(url_for('main.home'))
