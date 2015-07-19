from flask import Flask

from erigam.lib.request_methods import (
    populate_all_chars,
    connect_db,
    create_session,
    set_cookie,
    db_commit,
    disconnect_redis,
    disconnect_sql
)

from erigam.views import (
    main,
    backend,
    chat,
    admin,
    log
)

app = Flask(__name__)

# Pre and post request stuff
app.before_first_request(populate_all_chars)
app.before_request(connect_db)
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

# Register Blueprints
app.register_blueprint(main.blueprint)
app.register_blueprint(backend.blueprint, url_prefix='/chat_ajax')
app.register_blueprint(chat.blueprint, url_prefix='/chat')
app.register_blueprint(admin.blueprint, url_prefix='/admin')
app.register_blueprint(log.blueprint)
