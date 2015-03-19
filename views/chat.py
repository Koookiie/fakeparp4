import datetime
from time import mktime
from webhelpers import paginate
from sqlalchemy import and_
from sqlalchemy.orm.exc import NoResultFound

from flask import (
    Blueprint,
    request,
    abort,
    render_template,
    g,
    url_for
)

from lib import (
    OUBLIETTE_ID,
    ARCHIVE_PERIOD,
    get_time
)

from lib.model import (
    Log,
    LogPage,
    Chat,
    ChatSession
)

from lib.request_methods import use_db
from lib.messages import parse_line
from lib.characters import CHARACTER_GROUPS, CHARACTERS
from lib.sessions import CASE_OPTIONS

blueprint = Blueprint('chat', __name__)

@use_db
@blueprint.route('/')
@blueprint.route('/<chat_url>')
def chat(chat_url=None):
    if chat_url is None:
        chat_meta = {'type': 'unsaved'}
        existing_lines = []
        latest_num = -1
    else:
        if g.redis.zrank('ip-bans', chat_url+'/'+g.user.ip) is not None:
            if chat_url == OUBLIETTE_ID:
                abort(403)
            chat_url = OUBLIETTE_ID
        # Check if chat exists
        chat_meta = g.redis.hgetall('chat.'+chat_url+'.meta')
        # Convert topic to unicode.
        if 'topic' in chat_meta.keys():
            chat_meta['topic'] = unicode(chat_meta['topic'], encoding='utf8')
        # Try to load the chat from mysql if it doesn't exist in redis.
        if len(chat_meta) == 0:
            try:
                mysql_log = g.mysql.query(Log).filter(Log.url == chat_url).one()
                mysql_chat = g.mysql.query(Chat).filter(Chat.log_id == mysql_log.id).one()
                chat_meta = {
                    "type": mysql_chat.type,
                    "counter": mysql_chat.counter,
                    "public": "0",
                }
                if mysql_chat.topic is not None and mysql_chat.topic != "":
                    chat_meta["topic"] = mysql_chat.topic
                if mysql_chat.background is not None and mysql_chat.background != "":
                    chat_meta["background"] = mysql_chat.background

                g.redis.hmset('chat.'+chat_url+'.meta', chat_meta)
                for mysql_session in g.mysql.query(ChatSession).filter(ChatSession.log_id == mysql_log.id):
                    g.redis.hset('chat.'+chat_url+'.counters', mysql_session.counter, mysql_session.session_id)
                    g.redis.hmset('session.'+mysql_session.session_id+'.meta.'+chat_url, {
                        "counter": mysql_session.counter,
                        "group": mysql_session.group,
                    })
                    g.redis.hmset('session.'+mysql_session.session_id+'.chat.'+chat_url, {
                        "character": mysql_session.character,
                        "name": mysql_session.name,
                        "acronym": mysql_session.acronym,
                        "color": mysql_session.color,
                        "case": mysql_session.case,
                        "replacements": mysql_session.replacements,
                        "quirk_prefix": mysql_session.quirk_prefix,
                        "quirk_suffix": mysql_session.quirk_suffix,
                    })
                    g.redis.sadd('session.'+mysql_session.session_id+'.chats', chat_url)
                    g.redis.zadd('chat-sessions', chat_url+'/'+mysql_session.session_id, mktime(mysql_session.expiry_time.timetuple()))
            except NoResultFound:
                abort(404)
        # Make sure it's in the archive queue.
        if g.redis.zscore('archive-queue', chat_url) is None:
            g.redis.zadd('archive-queue', chat_url, get_time(ARCHIVE_PERIOD))

        # Load chat-based session data.
        g.user.set_chat(chat_url)
        existing_lines = [parse_line(line, 0) for line in g.redis.lrange('chat.'+chat_url, 0, -1)]
        latest_num = len(existing_lines)-1

    if 'counter' in g.user.meta:
        highlight = g.redis.hget("chat.%s.highlights" % (chat_url), g.user.meta['counter'])
    else:
        highlight = None

    return render_template(
        'chat.html',
        user=g.user,
        character_dict=g.user.json_info(),
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        chat=chat_url,
        chat_meta=chat_meta,
        lines=existing_lines,
        latest_num=latest_num,
        legacy_bbcode=g.redis.sismember('use-legacy-bbcode', chat_url),
        highlight=highlight
    )

@use_db
@blueprint.route('/<chat>/log')
def view_log(chat=None):

    # Decide whether or not to put a continue link in.
    continuable = g.redis.hget('chat.'+chat+'.meta', 'type') is not None

    try:
        log = g.mysql.query(Log).filter(Log.url == chat).one()
    except:
        abort(404)

    current_page = request.args.get('page') or log.page_count
    mode = request.args.get('mode') or 'normal'

    try:
        log_page = g.mysql.query(LogPage).filter(and_(LogPage.log_id == log.id, LogPage.number == current_page)).one()
    except NoResultFound:
        abort(404)

    url_generator = paginate.PageURL(url_for('chat.view_log', chat=chat), {'page': current_page})

    # It's only one row per page and we want to fetch them via both log id and
    # page number rather than slicing, so we'll just give it an empty list and
    # override the count.
    paginator = paginate.Page([], page=current_page, items_per_page=1, item_count=log.page_count, url=url_generator)

    # Pages end with a line break, so the last line is blank.
    lines = log_page.content.split('\n')[0:-1]
    lines = map(lambda _: parse_line(_, 0), lines)

    for line in lines:
        line['datetime'] = datetime.datetime.fromtimestamp(line['timestamp'])

    return render_template('log.html',
        chat=chat,
        lines=lines,
        continuable=continuable,
        current_page=current_page,
        mode=mode,
        paginator=paginator,
        legacy_bbcode=g.redis.sismember('use-legacy-bbcode', chat)

    )

@blueprint.route('/<chat>/unban', methods=['GET', 'POST'])
def unbanPage(chat=None):
    if chat is None or not g.redis.hgetall("chat."+chat+".meta"):
        abort(403)

    result = None

    if g.user.globalmod or g.redis.hget("session."+g.user.session_id+".meta."+chat, 'group') == 'mod':
        pass
    else:
        return render_template('admin_denied.html')

    if "timestamp" in request.form:
        unbanTS = request.form['timestamp']
        ban = g.redis.zrangebyscore("ip-bans", unbanTS, unbanTS)
        if ban:
            banstring = ban[0]
            g.redis.hdel("ban-reasons", banstring)
            g.redis.zrem("ip-bans", banstring)
            result = "Unbanned!"

    raw_bans = g.redis.zrange("ip-bans", 0, -1, withscores=True)
    ban_reasons = g.redis.hgetall('ban-reasons')

    bans = []
    for chat_ip, expiry in raw_bans:
        bchat, ip = chat_ip.split('/')
        if bchat != chat:
            continue
        bans.append({
            "ip": ip,
            "timestamp": expiry,
            "date": datetime.datetime.fromtimestamp(expiry - 2592000),
            "reason": ban_reasons.get(chat_ip, '').decode('utf-8'),
        })

    return render_template('admin_unban.html',
        lines=bans,
        result=result,
        chat=chat,
        page='unban'
    )

@blueprint.route('/<chat>/mods')
def manageMods(chat):
    chat_session = g.redis.hgetall("session."+g.user.session_id+".meta."+chat)
    if chat_session['group'] != 'globalmod':
        return render_template('admin_denied.html')
    counters = g.redis.hgetall("chat."+chat+".counters")
    mods = []
    if request.args.get('showusers', None) is not None:
        show = ('globalmod', 'mod', 'mod2', 'mod3', 'user')
    else:
        show = ('globalmod', 'mod', 'mod2', 'mod3')
    for counter, session_id in counters.items():
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
        'chatmods.html',
        modstatus=mods,
        chat=chat,
        page='mods',
    )
