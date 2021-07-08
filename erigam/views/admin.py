import json
from flask import (
    Blueprint,
    g,
    request,
    render_template,
    redirect,
    url_for
)

from erigam.lib import api
from erigam.lib.decorators import require_admin
from erigam.lib.model import Ban
from erigam.lib.request_methods import use_db

blueprint = Blueprint('admin', __name__)

@blueprint.route("/changemessages", methods=['GET', 'POST'])
@require_admin
def messages():
    if 'front_message' in request.form:
        front_message = request.form['front_message']
        g.redis.set('front_message', front_message)
    else:
        front_message = g.redis.get('front_message')

    return render_template('admin/changemsg.html',
        front_message=front_message
    )

@blueprint.route("/broadcast", methods=['GET', 'POST'])
@require_admin
def broadcast():
    if 'line' in request.form:
        color = request.form.get('color', "000000")
        line = request.form.get('line', None)
        confirm = bool(request.form.get('confirm', False))

        if confirm is True:
            if line in ('\n', '\r\n', '', ' '):
                result = '<div class="alert alert-danger"> <strong> Global cannot be blank! </strong> </div>'
            else:
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
                            "counter": -2,
                            "type": "global",
                            "acronym": "",
                            "text": line
                        }
                    ]
                }

                for chat in chats:
                    message['messages'][0]['id'] = g.redis.llen("chat."+chat)-1
                    g.redis.publish("channel."+chat, json.dumps(message))

                result = '<div class="alert alert-success"> <strong> Global sent! </strong> <br> %s </div>' % (line)
        else:
            result = '<div class="alert alert-danger"> <strong> Confirm checkbox not checked. </strong> </div>'
    else:
        result = ""

    return render_template('admin/broadcast.html',
        result=result
    )

@blueprint.route('/allbans', methods=['GET', 'POST'])
@require_admin
@use_db
def all_bans():
    sort = request.args.get('sort', "id")

    if "banid" in request.form:
        # Exequte ban delete
        api.bans.unban(g.sql, banid=request.form['banid'])
        return redirect(url_for("admin.all_bans"))

    sorts = {
        "chat": Ban.url,
        "ip": Ban.ip,
        "id": Ban.id
    }

    if sort not in sorts:
        sort = "id"

    bans = g.sql.query(Ban).order_by(sorts[sort]).all()

    return render_template('admin/allbans.html',
        bans=bans,
        sort=sort
    )

@blueprint.route('/allchats')
@require_admin
def all_chats():
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

    return render_template('admin/allchats.html',
        chats=sessions
    )

@blueprint.route('/panda', methods=['GET', 'POST'])
@require_admin
def panda():
    result = None

    try:
        extrapunishments = json.loads(g.redis.get("panda:additions"))
    except TypeError:
        extrapunishments = []

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

    if 'pandaFrom' in request.form and 'pandaTo' in request.form:
        extrapunishments.append([request.form['pandaFrom'], request.form['pandaTo']])
        g.redis.set("panda:additions", json.dumps(extrapunishments))

    pandas = g.redis.hgetall('punish-scene')

    return render_template('admin/panda.html',
        lines=pandas,
        result=result,
        extrapunishments=extrapunishments
    )

@blueprint.route('/vpnbans', methods=['GET'])
@require_admin
@use_db
def vpn_bans():
    bans = g.redis.smembers('vpn-ips')

    return render_template('admin/vpnbans.html',
        bans=bans
    )