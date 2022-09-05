import logging
import os
import traceback

from flask import Flask, request, render_template

from erigam.lib.request_methods import (
    connect_redis,
    create_session,
    set_cookie,
    db_commit,
    disconnect_redis,
    disconnect_sql,
    cache_breaker
)

from erigam.views import (
    main,
    backend,
    chat,
    admin,
    log
)

app = Flask(__name__)

# Cache breaking
app.url_defaults(cache_breaker)

# Pre and post request stuff
app.before_request(connect_redis)
app.before_request(create_session)
app.after_request(set_cookie)
app.after_request(db_commit)
app.teardown_request(disconnect_redis)
app.teardown_request(disconnect_sql)

# Flask settings
app.url_map.strict_slashes = False

# Jinja settings
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True

# Throw tracebacks to console
app.config["SENTRY_PRIVATE_DSN"] = os.environ.get("SENTRY_PRIVATE_DSN", None)
app.config["SENTRY_PUBLIC_DSN"] = os.environ.get("SENTRY_PUBLIC_DSN", None)
app.config['PROPAGATE_EXCEPTIONS'] = True

if 'DEBUG' in os.environ:
    app.config['DEBUG'] = True

# Sentry
if app.config["SENTRY_PRIVATE_DSN"]:  # pragma: no cover
    from raven.contrib.flask import Sentry
    app.config["SENTRY_INCLUDE_PATHS"] = ["erigam"]
    sentry = Sentry(app,
        dsn=app.config["SENTRY_PRIVATE_DSN"],
        logging=True,
        level=logging.ERROR,
    )
    logging.getLogger("sentry.errors.uncaught").setLevel(logging.CRITICAL)
else:
    sentry = None

# Register Blueprints
app.register_blueprint(main.blueprint)
app.register_blueprint(backend.blueprint, url_prefix='/chat_ajax')
app.register_blueprint(chat.blueprint, url_prefix='/chat')
app.register_blueprint(admin.blueprint, url_prefix='/admin')
app.register_blueprint(log.blueprint)

# Error handlers
@app.errorhandler(404)
def notfound_error(e):
    return render_template("errors/404.html"), 404

if not app.config['DEBUG']:
    @app.errorhandler(Exception)
    def production_error(e):
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            if 'debug' not in request.args and 'debug' not in request.form:
                raise

        return render_template("errors/exception.html",
            traceback=traceback.format_exc()
        ), 500
