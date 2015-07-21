from flask import g, render_template, jsonify
from functools import wraps
from erigam.lib import get_time, PING_PERIOD
from erigam.lib.api import join, get_online_state
from erigam.lib.request_methods import db_connect, get_log

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Create DB object if it does not exist.
        if not g.user.globalmod:
            return render_template('admin_denied.html')
        return f(*args, **kwargs)
    return decorated_function

def mark_alive(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if hasattr(g, "chat_type"):
            if get_online_state(g.redis, g.user.chat, g.user.session_id) == "offline":
                db_connect()
                get_log()
                g.joining = join(g.sql, g.redis, g.log, g.user, g.chat_type)
            else:
                g.redis.zadd('chats-alive', g.user.chat+'/'+g.user.session_id, get_time(PING_PERIOD*2))
                g.joining = False
        else:
            # Abort 500 just in case chat_type or log isn't defined
            return jsonify({"error": "nochat"}), 500

        return f(*args, **kwargs)
    return decorated_function
