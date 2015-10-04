import json

from flask import (
    Blueprint,
    request,
    abort,
    render_template,
    g,
    redirect,
    url_for
)

from erigam.lib import (
    OUBLIETTE_ID,
    ARCHIVE_PERIOD,
    get_time
)

from erigam.lib.model import (
    Log,
    Ban,
    Message
)

from erigam.lib.characters import CHARACTER_GROUPS, CHARACTERS
from erigam.lib.sessions import CASE_OPTIONS
from erigam.lib import api
from erigam.lib.request_methods import use_db

blueprint = Blueprint('chat', __name__)

@blueprint.route('/')
@blueprint.route('/<chat_url>')
@use_db
def chat(chat_url=None):
    if chat_url is None:
        chat_meta = {'type': 'unsaved'}
        messages = []
        latest_num = -1
        log = None
    else:
        if g.sql.query(Ban).filter(Ban.url == chat_url).filter(Ban.ip == g.user.ip).scalar() is not None:
            if chat_url == OUBLIETTE_ID:
                abort(403)
            chat_url = OUBLIETTE_ID
        # Check if chat exists
        chat_meta = g.redis.hgetall('chat.'+chat_url+'.meta')

        # Try to load the chat from sql if it doesn't exist in redis.
        if len(chat_meta) == 0 or g.redis.exists("chat."+chat_url+".regen"):
            chat_meta = api.chat.load_chat(g.sql, g.redis, chat_url)
            g.redis.delete("chat."+chat_url+".regen")

        # Make sure it's in the archive queue.
        if g.redis.zscore('archive-queue', chat_url) is None:
            g.redis.zadd('archive-queue', chat_url, get_time(ARCHIVE_PERIOD))

        # Load chat-based session data.
        g.user.set_chat(chat_url)

        # Load the last 50 lines of chat
        log = g.sql.query(Log).filter(Log.url == chat_url).one()
        messages = g.sql.query(Message).filter(
            Message.log_id == log.id,
        ).order_by(
            Message.timestamp.desc(),
        ).limit(50).all()
        messages.reverse()

        latest_num = messages[-1].id if len(messages) > 0 else 0

    meta = {
        "user": g.user.json_info(),
        "chat": chat_url,
        "chat_meta": chat_meta,
        "latest_num": latest_num,
        "log_id": log.id if log else None
    }

    return render_template(
        'chat.html',
        user=g.user,
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        messages=messages,
        meta=meta,
        legacy_bbcode=g.redis.sismember('use-legacy-bbcode', chat_url)
    )

@blueprint.route('/<chat>/unban', methods=['GET', 'POST'])
@use_db
def unban(chat=None):
    if chat is None or not g.redis.hgetall("chat."+chat+".meta"):
        abort(403)

    result = None

    if not g.user.globalmod and g.redis.hget("session."+g.user.session_id+".meta."+chat, 'group') not in ('mod', 'globalmod'):
        return render_template('admin_denied.html')

    if "banid" in request.form:
        api.bans.unban(g.sql, chat, request.form['banid'])
        return redirect(url_for("chat.unban", chat=chat))

    bans = g.sql.query(Ban).filter(Ban.url == chat).order_by(Ban.id).all()

    return render_template('mod/unban.html',
        bans=bans,
        result=result,
        chat=chat
    )

@blueprint.route('/<chat>/mods')
def manageMods(chat):
    chat_session = g.redis.hgetall("session."+g.user.session_id+".meta."+chat)
    if not chat_session or chat_session['group'] != 'globalmod':
        return render_template('admin_denied.html')
    counters = g.redis.hgetall("chat."+chat+".counters")
    mods = []
    if request.args.get('showusers', None) is not None:
        show = ('globalmod', 'mod', 'mod2', 'mod3', 'user')
    else:
        show = ('globalmod', 'mod', 'mod2', 'mod3')
    for counter, session_id in list(counters.items()):
        group = g.redis.hget("session."+session_id+".meta."+chat, 'group')
        if group in show:
            data = g.redis.hgetall("session."+session_id+".chat."+chat)
            name = data.get('name', "anonymous/missingdata")
            acronym = data.get('acronym', "??")
            is_you = session_id == g.user.session_id
            #  [0] = Counter [1] = Group [2] = Name [3] = Acronym [4] = is_you
            mods.append((counter, group, name, acronym, is_you))
    mods.sort(key=lambda tup: int(tup[0]))
    return render_template(
        'mod/mods.html',
        modstatus=mods,
        chat=chat,
        page='mods',
    )
