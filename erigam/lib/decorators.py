from flask import g, render_template, abort
from functools import wraps
from erigam.lib import get_time, PING_PERIOD
from erigam.lib import api
from erigam.lib.request_methods import db_connect, get_log

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not g.user.globalmod:
            return render_template('admin_denied.html')
        return f(*args, **kwargs)
    return decorated_function

def mark_alive(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if hasattr(g.user, "chat") and g.user.chat is None:
            abort(400)

        if api.state.get_online_state(g.redis, g.user.chat, g.user.session_id) == "offline":
            db_connect()
            get_log()
            g.joining = api.state.join(g.sql, g.redis, g.log, g.user)
        else:
            g.redis.zadd('chats-alive', g.user.chat+'/'+g.user.session_id, get_time(PING_PERIOD*2))
            g.joining = False
        return f(*args, **kwargs)
    return decorated_function
