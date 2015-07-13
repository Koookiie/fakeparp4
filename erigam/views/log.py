from flask import (
    Blueprint,
    g,
    redirect,
    url_for,
    abort
)

from erigam.lib.request_methods import use_db
from erigam.lib.model import Log

from sqlalchemy.orm.exc import NoResultFound

blueprint = Blueprint('log', __name__)

# Logs

@blueprint.route('/id/<logid>')
@use_db
def getLogByID(logid=None):
    if not logid:
        return redirect(url_for("main.home"))

    try:
        log = g.mysql.query(Log.url).filter(Log.id == logid).one()
    except NoResultFound:
        abort(404)

    return redirect(url_for("chat.view_log", chat=log.url))
