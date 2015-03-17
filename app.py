from flask import Flask

from lib.request_methods import (
    populate_all_chars,
    connect_db,
    create_session,
    set_cookie,
    disconnect_db
)

from views import (
    chat,
    main,
    admin
)

app = Flask(__name__)

# Pre and post request stuff
app.before_first_request(populate_all_chars)
app.before_request(connect_db)
app.before_request(create_session)
app.after_request(set_cookie)
app.after_request(disconnect_db)

# Flask settings
app.url_map.strict_slashes = False

# Jinja settings
app.jinja_env.trim_blocks = True
app.jinja_env.lstrip_blocks = True

# Register Blueprints
app.register_blueprint(main.blueprint)
app.register_blueprint(chat.blueprint, url_prefix='/chat_ajax')
app.register_blueprint(admin.blueprint, url_prefix='/admin')

# Debug
if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0", debug=True, threaded=True)
