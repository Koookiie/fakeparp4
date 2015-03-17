from functools import wraps
from flask import g, request, abort
from redis import ConnectionPool, Redis

from lib import validate_chat_url
from characters import CHARACTER_DETAILS
from model import sm
from sessions import Session

# Connection pooling. This takes far too much effort.
redis_pool = ConnectionPool(host="localhost", port=6379)

# Application start

def populate_all_chars():
    redis = Redis()
    pipe = redis.pipeline()
    pipe.delete('all-chars')
    pipe.sadd('all-chars', *CHARACTER_DETAILS.keys())
    pipe.execute()
    del pipe
    del redis

# SQL functions

def use_db(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Create DB object if it does not exist.
        if not hasattr(g, "mysql"):
            g.mysql = sm()

        return f(*args, **kwargs)
    return decorated_function

# Before request

def connect_db():
    # Connect to Redis
    g.redis = Redis(connection_pool=redis_pool)

    # Connect to SQL
    g.mysql = sm()

def create_session():
    # Do not bother allowing the user in if they are globalbanned.
    if request.headers['X-Forwarded-For'] in g.redis.smembers("globalbans"):
        abort(403)

    # Create a user object, using session ID.
    if 'chat' in request.form and validate_chat_url(request.form['chat']):
        chat = request.form['chat']

        session_id = request.cookies.get('session', None)
        if session_id is None:
            abort(400)
        g.user = Session(g.redis, session_id, chat)

        # Chat type
        g.chat_type = g.redis.hget('chat.'+chat+'.meta', 'type')
        if g.chat_type is None:
            abort(404)
    else:
        session_id = request.cookies.get('session', None)
        g.user = Session(g.redis, session_id)

# After request

def set_cookie(response):
    try:
        response.set_cookie('session', g.user.session_id, max_age=365*24*60*60, domain=".terminallycapricio.us")
        response.set_cookie('session', g.user.session_id, max_age=365*24*60*60)
    except AttributeError:
        # That isn't gonna work if we don't have a user object, just ignore it.
        pass
    return response

def disconnect_db(response):
    # Close and delete Redis PubSubs
    if hasattr(g, "pubsub"):
        g.pubsub.close()
        del g.pubsub

    # Delete Redis object
    del g.redis

    # Close SQL
    if hasattr(g, "mysql"):
        g.mysql.close()
        del g.mysql

    return response
