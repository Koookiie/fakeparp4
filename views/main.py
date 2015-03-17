try:
    import ujson as json
except:
    import json
from flask import Blueprint, g, request, render_template, redirect, url_for, jsonify, abort

from lib import SEARCH_PERIOD, ARCHIVE_PERIOD, get_time, validate_chat_url
from lib.archive import archive_chat, get_or_create_log
from lib.characters import CHARACTER_GROUPS, CHARACTERS
from lib.sessions import CASE_OPTIONS
from lib.request_methods import use_db

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

@use_db
@blueprint.route('/save', methods=['POST'])
def save():
    try:
        if 'character' in request.form:
            g.user.save_character(request.form)
        if 'save_pickiness' in request.form:
            g.user.save_pickiness(request.form)
        if 'create' in request.form:
            chat = request.form['chaturl']
            mod_pass = request.form['mod_pass']
            if g.redis.exists('chat.'+chat+'.counter') or g.redis.exists('chat.'+chat+'.meta') or g.redis.exists('chat.'+chat):
                raise ValueError('chaturl_taken')
            # USE VALIDATE_CHAT_URL
            if not validate_chat_url(chat):
                raise ValueError('chaturl_invalid')
            if mod_pass == '':
                raise ValueError('password_invalid')
            g.user.set_chat(chat)
            if g.user.meta['group'] != 'globalmod':
                g.user.set_group('mod')
            g.redis.hmset('chat.'+chat+'.meta', {'type': 'group', 'public': '0'})
            g.redis.hset('chat.'+chat+'.counter', 'modPass', mod_pass)

            get_or_create_log(g.redis, g.mysql, chat, 'group')
            g.mysql.commit()
            return redirect(url_for('chat.chat', chat_url=chat))
        elif 'tags' in request.form:
            g.user.save_pickiness(request.form)
    except ValueError as e:
        return show_homepage(e.args[0])

    if 'search' in request.form:
        return redirect(url_for('chat.chat'))
    else:
        return redirect(url_for('main.home'))

# Logs

@use_db
@blueprint.route('/logs/save', methods=['POST'])
@blueprint.route('/chat/<chat_url>/save_log')
def save_log(chat_url=None):
    if 'chat' in request.form:
        if not validate_chat_url(request.form['chat']):
            abort(400)
        chat = request.form['chat']
    elif chat_url is not None:
        if not validate_chat_url(chat_url):
            abort(400)
        chat = chat_url
    chat_type = g.redis.hget('chat.'+chat+'.meta', 'type')
    if chat_type not in ['unsaved', 'saved']:
        log_id = archive_chat(g.redis, g.mysql, chat)
        g.redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))
    else:
        log_id = archive_chat(g.redis, g.mysql, chat)
        g.redis.hset('chat.'+chat+'.meta', 'type', 'saved')
        g.redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))
    return redirect(url_for('chat.view_log', chat=chat))
