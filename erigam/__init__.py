import os

from flask import Flask

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
app.config['PROPAGATE_EXCEPTIONS'] = True

if 'DEBUG' in os.environ:
    app.config['DEBUG'] = True

# Register Blueprints
app.register_blueprint(main.blueprint)
app.register_blueprint(backend.blueprint, url_prefix='/chat_ajax')
app.register_blueprint(chat.blueprint, url_prefix='/chat')
app.register_blueprint(admin.blueprint, url_prefix='/admin')
app.register_blueprint(log.blueprint)
