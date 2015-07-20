from flask import g, render_template, jsonify
from functools import wraps
from erigam.lib.api import ping

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
        if hasattr(g, "chat_type") and hasattr(g, "log"):
            g.joining = ping(g.sql, g.redis, g.log, g.user, g.chat_type)
        else:
            # Abort 500 just in case chat_type or log isn't defined
            return jsonify({"error": "nochat"}), 500

        return f(*args, **kwargs)
    return decorated_function
