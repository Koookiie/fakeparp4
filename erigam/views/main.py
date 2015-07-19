try:
    import ujson as json
except:
    import json
from flask import Blueprint, g, request, render_template, redirect, url_for, jsonify, abort

from erigam.lib import SEARCH_PERIOD, get_time, validate_chat_url
from erigam.lib.archive import get_or_create_log
from erigam.lib.characters import CHARACTER_GROUPS, CHARACTERS
from erigam.lib.sessions import CASE_OPTIONS

blueprint = Blueprint('main', __name__)

# Helper functions

def show_homepage(error):
    sessions = []

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

        sessions.append(metadata)

    sessions = sorted(sessions, key=lambda k: k['total_online'])
    sessions = sessions[::-1]

    return render_template('frontpage.html',
        error=error,
        replacements=json.loads(g.user.character['replacements']),
        tag_text=g.redis.get(g.user.prefix+'.tag-text') or "",
        picky_options=g.redis.hgetall(g.user.prefix+'.picky-options') or {},
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        users_searching=g.redis.zcard('searchers'),
        users_chatting=g.redis.scard('sessions-chatting'),
        active_pub=sessions,
        message=g.redis.get('front_message') or "Blame Nepeat",
    )

@blueprint.route("/")
def home():
    return show_homepage(None)

# Searching

@blueprint.route('/search', methods=['POST'])
def foundYet():
    target = g.redis.get('session.'+g.user.session_id+'.match')
    if target:
        g.redis.delete('session.'+g.user.session_id+'.match')
        return jsonify(target=target)
    else:
        g.redis.zadd('searchers', g.user.session_id, get_time(SEARCH_PERIOD*2))
        abort(404)

@blueprint.route('/stop_search', methods=['POST'])
def quitSearching():
    g.redis.zrem('searchers', g.user.session_id)
    return 'ok'

# Save

@blueprint.route('/save', methods=['POST'])
def save():
    try:
        if 'character' in request.form:
            g.user.save_character(request.form)
        if 'para' in request.form or 'nsfw' in request.form:
            g.user.save_pickiness(request.form)
        if 'create' in request.form:
            chat = request.form['chaturl']
            if g.redis.exists('chat.'+chat+'.meta') or g.redis.exists('chat.'+chat):
                raise ValueError('chaturl_taken')
            # USE VALIDATE_CHAT_URL
            if not validate_chat_url(chat):
                raise ValueError('chaturl_invalid')
            g.user.set_chat(chat)
            if g.user.meta['group'] != 'globalmod':
                g.user.set_group('mod')
            g.redis.hmset('chat.'+chat+'.meta', {'type': 'group', 'public': '0'})

            get_or_create_log(g.redis, g.sql, chat, 'group')
            return redirect(url_for('chat.chat', chat_url=chat))
        elif 'tags' in request.form:
            g.user.save_pickiness(request.form)
    except ValueError as e:
        return show_homepage(e.args[0])

    if 'search' in request.form:
        return redirect(url_for('chat.chat'))
    else:
        return redirect(url_for('main.home'))
