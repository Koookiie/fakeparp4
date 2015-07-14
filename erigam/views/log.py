from flask import (
    Blueprint,
    g,
    redirect,
    url_for,
    abort,
    request
)

from sqlalchemy.orm.exc import NoResultFound

from erigam.lib import ARCHIVE_PERIOD, get_time, validate_chat_url
from erigam.lib.archive import archive_chat
from erigam.lib.request_methods import use_db
from erigam.lib.model import Log

blueprint = Blueprint('log', __name__)

# Logs

@blueprint.route('/logs/save', methods=['POST'])
@blueprint.route('/chat/<chat_url>/save_log')
@use_db
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
        archive_chat(g.redis, g.sql, chat)
        g.redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))
    else:
        archive_chat(g.redis, g.sql, chat)
        g.redis.hset('chat.'+chat+'.meta', 'type', 'saved')
        g.redis.zadd('archive-queue', chat, get_time(ARCHIVE_PERIOD))
    return redirect(url_for('chat.view_log', chat=chat))

@blueprint.route('/log/id/<logid>')
@use_db
def getLogByID(logid=None):
    if not logid:
        return redirect(url_for("main.home"))

    try:
        log = g.sql.query(Log.url).filter(Log.id == logid).one()
    except NoResultFound:
        abort(404)

    return redirect(url_for("chat.view_log", chat=log.url))
