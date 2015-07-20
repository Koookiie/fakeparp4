import datetime
from math import ceil

from flask import (
    Blueprint,
    g,
    redirect,
    url_for,
    abort,
    request,
    render_template
)

from webhelpers import paginate
from sqlalchemy import and_, func
from sqlalchemy.orm.exc import NoResultFound

from erigam.lib import validate_chat_url
from erigam.lib.model import Log, Message

blueprint = Blueprint('log', __name__)

# Logs

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

    return redirect(url_for('log.view_log', chat=chat))

@blueprint.route('/log/id/<logid>')
def getLogByID(logid=None):
    if not logid:
        return redirect(url_for("main.home"))

    try:
        logid = int(logid)
    except ValueError:
        abort(404)

    try:
        log = g.sql.query(Log.url).filter(Log.id == logid).one()
    except NoResultFound:
        abort(404)

    return redirect(url_for("log.view_log", chat=log.url))

@blueprint.route('/chat/<chat>/log')
@blueprint.route('/chat/<chat>/log/<int:page>')
def view_log(chat=None, page=None):
    try:
        log = g.sql.query(Log).filter(Log.url == chat).one()
    except:
        abort(404)

    message_count = g.sql.query(func.count('*')).select_from(Message).filter(
        Message.log_id == log.id,
    ).scalar()

    messages_per_page = 200

    if page is None:
        # Default to last page.
        page = int(ceil(float(message_count) / messages_per_page))
        # The previous calculation doesn't work if pages have no messages.
        if page < 1:
            page = 1

    messages = g.sql.query(Message).filter(
        Message.log_id == log.id
    ).order_by(Message.id)

    messages = messages.limit(messages_per_page).offset((page - 1) * messages_per_page).all()

    if len(messages) == 0 and page != 1:
        return redirect(url_for("log.view_log", chat=chat))

    paginator = paginate.Page(
        [],
        page=page,
        items_per_page=messages_per_page,
        item_count=message_count,
        url=lambda page: url_for("log.view_log", chat=chat, page=page)
    )

    return render_template('log.html',
        chat=chat,
        messages=messages,
        paginator=paginator,
        legacy_bbcode=g.redis.sismember('use-legacy-bbcode', chat)
    )
