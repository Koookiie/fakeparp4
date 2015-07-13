import json
from flask import (
    Blueprint,
    g,
    request,
    render_template,
    redirect,
    url_for
)

from erigam.lib.decorators import require_admin
from erigam.lib.model import Ban

blueprint = Blueprint('admin', __name__)

@blueprint.route("/changemessages", methods=['GET', 'POST'])
@require_admin
def change_messages():

    if 'front_message' in request.form:
        front_message = request.form['front_message']
        g.redis.set('front_message', front_message)

    front_message = g.redis.get('front_message')

    return render_template('admin/changemsg.html',
        front_message=front_message,
        page="changemsg",
    )

@blueprint.route("/broadcast", methods=['GET', 'POST'])
@require_admin
def global_broadcast():
    result = None

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

    return render_template('admin/broadcast.html',
        result=result,
        page="broadcast",
    )

@blueprint.route('/allbans', methods=['GET', 'POST'])
@require_admin
def admin_allbans():
    sort = request.args.get('sort', "id")

    if "banid" in request.form:
        # Exequte ban delete
        ban = g.sql.query(Ban).filter(Ban.id == request.form['banid']).scalar()
        if ban:
            g.sql.delete(ban)
            return redirect(url_for("admin.admin_allbans"))

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
def show_allchats():
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
        chats=sessions,
        page="allchats",
    )

@blueprint.route('/panda', methods=['GET', 'POST'])
@require_admin
def admin_panda():
    result = None

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

    return render_template('admin/panda.html',
        lines=pandas,
        result=result,
        page="panda"
    )
