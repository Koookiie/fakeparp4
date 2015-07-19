import datetime

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
from sqlalchemy import and_
from sqlalchemy.orm.exc import NoResultFound

from erigam.lib import ARCHIVE_PERIOD, get_time, validate_chat_url
from erigam.lib.archive import archive_chat
from erigam.lib.request_methods import use_db
from erigam.lib.model import Log, LogPage
from erigam.lib.messages import parse_line

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
    return redirect(url_for('log.view_log', chat=chat))

@blueprint.route('/log/id/<logid>')
@use_db
def getLogByID(logid=None):
    if not logid:
        return redirect(url_for("main.home"))

    try:
        log = g.sql.query(Log.url).filter(Log.id == logid).one()
    except NoResultFound:
        abort(404)

    return redirect(url_for("log.view_log", chat=log.url))

@blueprint.route('/chat/<chat>/log')
@use_db
def view_log(chat=None):
    try:
        log = g.sql.query(Log).filter(Log.url == chat).one()
    except:
        abort(404)

    current_page = request.args.get('page') or log.page_count

    try:
        log_page = g.sql.query(LogPage).filter(and_(LogPage.log_id == log.id, LogPage.number == current_page)).one()
    except NoResultFound:
        abort(404)

    url_generator = paginate.PageURL(url_for('log.view_log', chat=chat), {'page': current_page})

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
        current_page=current_page,
        paginator=paginator,
        legacy_bbcode=g.redis.sismember('use-legacy-bbcode', chat)

    )
