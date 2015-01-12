try:
    import ujson as json
except:
    import json
import datetime
from flask import Flask, g, request, render_template, redirect, url_for, jsonify, abort
from random import randint
from sqlalchemy import and_
from sqlalchemy.orm.exc import NoResultFound
from time import mktime
from webhelpers import paginate
from socket import inet_aton

from lib import SEARCH_PERIOD, ARCHIVE_PERIOD, OUBLIETTE_ID, get_time, validate_chat_url, DogeNotPaidException
from lib.archive import archive_chat, get_or_create_log
from lib.characters import CHARACTER_GROUPS, CHARACTERS
from lib.messages import parse_line
from lib.model import Chat, ChatSession, Log, LogPage
from lib.request_methods import populate_all_chars, connect_redis, connect_mysql, create_normal_session, set_cookie, disconnect_redis, disconnect_mysql
from lib.sessions import CASE_OPTIONS

app = Flask(__name__)

# Jinja settings
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True

# Pre and post request stuff
app.before_first_request(populate_all_chars)
app.before_request(connect_redis)
app.before_request(connect_mysql)
app.before_request(create_normal_session)
app.after_request(set_cookie)
app.after_request(disconnect_redis)
app.after_request(disconnect_mysql)

# Helper functions

def show_homepage(error):
    sessions = []
    pipe = g.redis.pipeline()

    for chat in g.redis.smembers("public-chats"):
        metadata = g.redis.hgetall('chat.'+chat+'.meta')
        pipe.scard('chat.'+chat+'.online')
        pipe.scard('chat.'+chat+'.idle')
        metadata['active'], metadata['idle'] = pipe.execute()
        metadata['url'] = chat
        metadata['total_online'] = metadata['active'] + metadata['idle']
        metadata['nsfw'] = metadata.get('nsfw') == "1"
        if 'topic' in metadata:
            metadata['topic'] = unicode(metadata['topic'], encoding='utf8')
        sessions.append(metadata)

    sessions = sorted(sessions, key=lambda k: k['total_online'])
    sessions = sessions[::-1]

    searchers = g.redis.zrange('searchers', 0, -1)
    sess = [{
        'id': session_id,
        'tags': g.redis.smembers('session.'+session_id+'.tags'),
    } for session_id in searchers]

    tagsets = []

    for nums in sess:
        tagsets.append(list(nums['tags']))

    tags = []

    for tagset in tagsets:
        for tag in tagset:
            tags.append(tag)

    for tag in tags:
        if tag == '' or tag[:1] == '-':
            tags.remove(tag)

    if len(tags) != 0:
        tagzero = 1
    else:
        tagzero = 0

    tagset = ', '.join(sorted(tags))

    return render_template('frontpage.html',
        error=error,
        user=g.user,
        replacements=json.loads(g.user.character['replacements']),
        tag_text=g.redis.get(g.user.prefix+'.tag-text') or "",
        picky_options=g.redis.hgetall(g.user.prefix+'.picky-options') or {},
        case_options=CASE_OPTIONS,
        groups=CHARACTER_GROUPS,
        characters=CHARACTERS,
        default_char=g.user.character['character'],
        users_searching=g.redis.zcard('searchers'),
        users_chatting=g.redis.scard('sessions-chatting'),
        active_pub=sessions,
        tagset=tagset,
        tagshow=tagzero,
        message=g.redis.get('front_message') or "Blame Nepeat",
    )

# Chat

@app.route('/chat/')
@app.route('/chat')
@app.route('/chat/<chat_url>/')
@app.route('/chat/<chat_url>')
def chat(chat_url=None):

    if chat_url is None:
        chat_meta = { 'type': 'unsaved' }
        existing_lines = []
        latest_num = -1
    else:
        #if g.redis.zrank('ip-bans', chat_url+'/'+request.headers['CF-Connecting-IP']) is not None:
        if g.redis.zrank('ip-bans', chat_url+'/'+request.headers['X-Forwarded-For']) is not None:
            if chat_url==OUBLIETTE_ID:
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
        try:
            g.user.set_chat(chat_url)
        except DogeNotPaidException as e:
            return render_template('doge_not_paid.html', address=e.message)
        existing_lines = [parse_line(line, 0) for line in g.redis.lrange('chat.'+chat_url, 0, -1)]
        latest_num = len(existing_lines)-1

    if g.redis.sismember('use-legacy-bbcode', chat_url):
        legacy_bbcode = True
    else:
        legacy_bbcode = False

    if g.redis.sismember('chat-backgrounds', chat_url):
        chatbackground = str(g.redis.hget('chat.'+chat_url+'.meta', 'background'))
    else:
        chatbackground = None

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
        #lines=existing_lines[-200:],
        lines=existing_lines,
        latest_num=latest_num,
        legacy_bbcode=legacy_bbcode,
        chatbackground=chatbackground,
        highlight=highlight,
        rnum=randint(1, 1000),
    )

# Searching

@app.route('/search', methods=['POST'])
def foundYet():
    target=g.redis.get('session.'+g.user.session_id+'.match')
    if target:
        g.redis.delete('session.'+g.user.session_id+'.match')
        return jsonify(target=target)
    else:
        g.redis.zadd('searchers', g.user.session_id, get_time(SEARCH_PERIOD*2))
        abort(404)

@app.route('/stop_search', methods=['POST'])
def quitSearching():
    g.redis.zrem('searchers', g.user.session_id)
    return 'ok'

# Save

@app.route('/save', methods=['POST'])
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
            if g.user.meta['group']!='globalmod':
                g.user.set_group('mod')
            g.redis.hmset('chat.'+chat+'.meta', {'type': 'group', 'public': '0'})
            g.redis.hset('chat.'+chat+'.counter', 'modPass', mod_pass)

            get_or_create_log(g.redis, g.mysql, chat, 'group')
            g.mysql.commit()
            return redirect(url_for('chat', chat_url=chat))
        elif 'tags' in request.form:
            g.user.save_pickiness(request.form)
    except ValueError as e:
        return show_homepage(e.args[0])

    if 'search' in request.form:
        return redirect(url_for('chat'))
    else:
        return redirect(url_for('configure'))

# Logs
@app.route('/logs/group/<chat>')
def old_view_log(chat):
    return redirect(url_for('view_log', chat=chat))

@app.route('/logs/save', methods=['POST'])
@app.route('/chat/<chat_url>/save_log')
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
    return redirect(url_for('view_log', chat=chat))

@app.route('/logs/<log_id>')
def view_log_by_id(log_id=None):
    log = g.mysql.query(Log).filter(Log.id==log_id).one()
    if log.url is not None:
        return redirect(url_for('view_log', chat=log.url))
    abort(404)

@app.route('/chat/<chat>/log')
def view_log(chat=None):

    # Decide whether or not to put a continue link in.
    continuable = g.redis.hget('chat.'+chat+'.meta', 'type') is not None

    try:
        log = g.mysql.query(Log).filter(Log.url==chat).one()
    except:
        abort(404)

    current_page = request.args.get('page') or log.page_count
    mode = request.args.get('mode') or 'normal'

    try:
        log_page = g.mysql.query(LogPage).filter(and_(LogPage.log_id==log.id, LogPage.number==current_page)).one()
    except NoResultFound:
        abort(404)

    url_generator = paginate.PageURL(url_for('view_log', chat=chat), {'page': current_page})

    # It's only one row per page and we want to fetch them via both log id and
    # page number rather than slicing, so we'll just give it an empty list and
    # override the count.
    paginator = paginate.Page([], page=current_page, items_per_page=1, item_count=log.page_count, url=url_generator)

    # Pages end with a line break, so the last line is blank.
    lines = log_page.content.split('\n')[0:-1]
    lines = map(lambda _: parse_line(_, 0), lines)

    for line in lines:
        line['datetime'] = datetime.datetime.fromtimestamp(line['timestamp'])

    legacy_bbcode = g.redis.sismember('use-legacy-bbcode', chat)

    return render_template('log.html',
        chat=chat,
        lines=lines,
        continuable=continuable,
        current_page=current_page,
        mode=mode,
        paginator=paginator,
        legacy_bbcode=legacy_bbcode
    )

@app.route('/chat/<chat>/unban', methods=['GET', 'POST'])
def unbanPage(chat=None):
    if chat is None or not g.redis.hgetall("chat."+chat+".meta"):
        abort(403)

    result = None

    if g.redis.sismember('global-mods', g.user.session_id):
        isglobal = True
    elif g.redis.hget("session."+g.user.session_id+".meta."+chat, 'group') == 'mod':
        isglobal = False
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
        isglobal=isglobal,
        page='unban'
    )

@app.route('/chat/<chat>/mods')
def manageMods(chat):
    chat_session = g.redis.hgetall("session."+g.user.session_id+".meta."+chat)
    if "group" not in chat_session or chat_session['group'] != 'globalmod':
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
            #[0] = Counter [1] = Group [2] = Name [3] = Acronym [4] = is_you
            mods.append((counter, group, name, acronym, is_you))
    mods.sort(key=lambda tup: int(tup[0]))
    return render_template(
        'chatmods.html',
        modstatus=mods,
        chat=chat,
        page='mods',
    )

@app.route("/admin/changemessages", methods=['GET', 'POST'])
def change_messages():

    if not g.redis.sismember('global-mods', g.user.session_id):
        return render_template('admin_denied.html')

    if 'front_message' in request.form:
        front_message = request.form['front_message']
        g.redis.set('front_message', front_message)

    front_message = g.redis.get('front_message')

    return render_template('admin_changemsg.html',
        front_message=front_message,
        page="changemsg",
    )

@app.route("/admin/broadcast", methods=['GET', 'POST'])
def global_broadcast():
    result = None

    if not g.redis.sismember('global-mods', g.user.session_id):
        return render_template('admin_denied.html')

    if 'line' in request.form:
        color = request.form.get('color', "000000")
        line = request.form.get('line', None)
        confirm = bool(request.form.get('confirm', False))
        serious = bool(request.form.get('serious', False))

        if serious is True:
            counter = -123
        else:
            counter = -3

        if confirm is True:
            if line in ('\n', '\r\n', '', ' '):
                result = '<div class="alert alert-danger"> <strong> Global cannot be blank! </strong> </div>'
            else:
                pipe = g.redis.pipeline()
                chats = set()
                chat_sessions = g.redis.zrange('chats-alive', 0, -1)
                for chat_session in chat_sessions:
                    chat, user = chat_session.split("/")
                    chats.add(chat)
                message = {
                    "messages": [
                        {
                            "color": color,
                            "timestamp": 0,
                            "counter": counter,
                            "type": "global",
                            "line": line
                        }
                    ]
                }

                for chat in chats:
                    message['messages'][0]['id'] = g.redis.llen("chat."+chat)-1
                    pipe.publish("channel."+chat, json.dumps(message))

                pipe.execute()
                result = '<div class="alert alert-success"> <strong> Global sent! </strong> <br> %s </div>' % (line)
        else:
            result = '<div class="alert alert-danger"> <strong> Confirm checkbox not checked. </strong> </div>'

    return render_template('admin_globalbroadcast.html',
        result=result,
        page="broadcast",
    )


@app.route('/admin/allbans', methods=['GET', 'POST'])
def admin_allbans():
    sort = request.args.get('sort', None)
    result = None

    if g.redis.sismember('global-mods', g.user.session_id):
        pass
    else:
        return render_template('admin_denied.html')

    if "ip" in request.form and "chat" in request.form:
        chat = request.form['chat']
        unbanIP = request.form['ip']
        banstring = "%s/%s" % (chat, unbanIP)
        g.redis.hdel("ban-reasons", banstring)
        g.redis.zrem("ip-bans", banstring)
        result = "Unbanned %s!" % (unbanIP)

    bans = g.redis.zrange("ip-bans", "0", "-1")

    if sort == 'chat':
        bans.sort(key=lambda tup: tup.split('/')[0])
        sort = 'chat'
    elif sort == 'ip':
        bans.sort(key=lambda tup: inet_aton(tup.split('/')[1]))
        sort = 'ip'
    else:
        bans.sort(key=lambda tup: inet_aton(tup.split('/')[1]))
        sort = 'ip'

    return render_template('global_allbans.html',
        lines=bans,
        result=result,
        page='allbans',
        sort=sort
    )

@app.route('/admin/allchats')
def show_allchats():
    if g.redis.sismember('global-mods', g.user.session_id):
        pass
    else:
        #i can't fucking spell ok
        return "denid"
    pipe = g.redis.pipeline()
    sessions = []
    chats = set()

    chats_alive = g.redis.zrange("chats-alive", 0, -1)
    for x in chats_alive:
        chat = x.split("/")[0]
        chats.add(chat)

    for chat in chats:
        metadata = g.redis.hgetall('chat.'+chat+'.meta')
        if metadata['type'] in ('unsaved', 'saved'):
            continue

        pipe.scard('chat.'+chat+'.online')
        pipe.scard('chat.'+chat+'.idle')
        online, idle = pipe.execute()

        metadata.update({'url': chat})
        metadata.update({'active': online})
        metadata.update({'idle': idle})
        metadata.update({'total_online': idle+online})
        if 'topic' not in metadata:
            metadata.update({'topic': ''})
        sessions.append(metadata)
    sessions = sorted(sessions, key=lambda k: k['total_online'])
    sessions = sessions[::-1]

    return render_template('admin_allchats.html',
        chats=sessions,
        page="allchats",
    )

@app.route('/admin/panda', methods=['GET', 'POST'])
def admin_panda():
    result = None
    if not g.redis.sismember('global-mods', g.user.session_id):
        return render_template('admin_denied.html')

    if "ip" in request.form:
        ip = request.form['ip']
        action = request.form.get("action", None)
        reason = request.form.get("reason", "No reason.")

        if action == "add":
            g.redis.hset("punish-scene", ip, reason)
            result = "Panda added on %s!" % (ip)
        elif action == "remove":
            g.redis.hdel("punish-scene", ip)
            result = "Panda removed on %s!" % (ip)

    pandas = g.redis.hgetall('punish-scene')

    return render_template('global_globalpanda.html',
        lines=pandas,
        result=result,
        page="panda"
    )

#Home

@app.route("/")
def configure():
    return show_homepage(None)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8889, debug=True)
