import os
import requests
import sys
from flask import g, request, abort, current_app
from redis import ConnectionPool, Redis

from erigam.lib import validate_chat_url, session_validator
from erigam.lib.archive import get_or_create_log
from erigam.lib.model import sm
from erigam.lib.sessions import Session
from functools import wraps

# Connection pooling. This takes far too much effort.
redis_pool = ConnectionPool(
    host=os.environ.get('REDIS_PORT_6379_TCP_ADDR', os.environ.get('REDIS_HOST', '127.0.0.1')),
    password=os.environ.get('REDIS_PASSWORD', ''),
    port=int(os.environ.get('REDIS_PORT_6379_TCP_PORT', os.environ.get('REDIS_PORT', 6379))),
    db=int(os.environ.get('REDIS_DB', 0)),
    decode_responses=True
)

# VPN checking

def checkIP(ip):
	#change this variable to your email address
	contactEmail="hecksadecimal@outlook.com"
	#if probability from getIPIntel is grater than this value, return 1
	maxProbability=0.99
	timeout=5.00
	#if you wish to use flags or json format, edit the request below
	result = requests.get("http://check.getipintel.net/check.php?ip="+ip+"&contact="+contactEmail, timeout=timeout)
	if (result.status_code != 200) or (float(result.content) < 0):
		sys.stderr.write("An error occured while querying GetIPIntel")
	if (float(result.content) > maxProbability):
		return 1;
	else:
		return 0;

# Before request

def connect_redis():
    if request.endpoint == "static":
        g.redis = None
        return

    # Connect to Redis
    g.redis = Redis(connection_pool=redis_pool)

def create_session():
    if request.endpoint == "static":
        return

    # Do not bother allowing the user in if they are globalbanned.
    if g.redis.sismember("globalbans", request.headers.get('X-Forwarded-For', request.remote_addr)):
        abort(403)
    
    # VPN prevention
    if g.redis.sismember("vpn-ips", request.headers.get('X-Forwarded-For', request.remote_addr)):
        abort(403)
    elif not g.redis.sismember("cleared-ips", request.headers.get('X-Forwarded-For', request.remote_addr)):
        if checkIP(request.headers.get('X-Forwarded-For', request.remote_addr)):
            g.redis.sadd("vpn-ips", request.headers.get('X-Forwarded-For', request.remote_addr))
            abort(403)
        else:
            g.redis.sadd("cleared-ips", request.headers.get('X-Forwarded-For', request.remote_addr))

    # Create a user object, using session ID.

    session_id = request.cookies.get('session', None)
    chat = request.form.get('chat', None)

    if chat and validate_chat_url(chat):
        if session_id is None or session_validator.match(session_id) is None:
            abort(400)

        # Abort 404 if the chat metadata does not exist.
        if not g.redis.exists('chat.'+chat+'.meta'):
            abort(404)

        g.user = Session(g.redis, session_id, chat)
    else:
        g.user = Session(g.redis, session_id)

    # Log their IP address.
    g.redis.hset('session.'+g.user.session_id+'.meta', 'last_ip', g.user.ip)


# After request

def set_cookie(response):
    try:
        # Global domain session cookie
        response.set_cookie('session', g.user.session_id,
            httponly=True,
            max_age=365*24*60*60,
            domain="." + os.environ.get("BASE_DOMAIN", "dreambubble.xyz")
        )

        response.set_cookie('session', g.user.session_id,
            httponly=True,
            max_age=365*24*60*60
        )
    except AttributeError:
        # That isn't gonna work if we don't have a user object, just ignore it.
        pass
    return response

# Shamlessly copy and pasted from newparp. Original comments after the cut

# Disconnect is run on every request and commit is run on every successful
# request.

# They skip if there isn't a database connection because not all requests will
# be connecting to the database.

def db_connect():
    if not hasattr(g, "sql"):
        g.sql = sm()


def use_db(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        db_connect()
        return f(*args, **kwargs)
    return decorated_function

def use_db_chat(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        db_connect()
        get_log()
        return f(*args, **kwargs)
    return decorated_function

def get_log():
    if hasattr(g.user, "chat") and g.user.chat is None:
        abort(400)

    g.log, g.chat = get_or_create_log(g.sql, g.user.chat)

def db_commit(response=None):
    # Don't commit on 4xx and 5xx.
    if response is not None and response.status[0] not in {"2", "3"}:
        return response

    if hasattr(g, "sql"):
        g.sql.commit()
    return response

def disconnect_sql(response=None):
    if hasattr(g, "sql"):
        g.sql.close()
        del g.sql

    return response

def disconnect_redis(response=None):
    if hasattr(g, "pubsub"):
        g.pubsub.close()
        del g.pubsub

    if hasattr(g, "redis"):
        del g.redis

    return response

file_hashes = {}

def cache_breaker(endpoint, values):
    if 'static' == endpoint or endpoint.endswith('.static'):
        filename = values.get('filename')
        if filename:
            if '.' in endpoint:
                blueprint = endpoint.rsplit('.', 1)[0]
            else:
                blueprint = request.blueprint

            if blueprint:
                static_folder = current_app.blueprints[blueprint].static_folder or current_app.static_folder
            else:
                static_folder = current_app.static_folder

            values['q'] = static_file_hash(os.path.join(static_folder, filename))

def static_file_hash(filename):
    if filename not in file_hashes:
        file_hashes[filename] = int(os.stat(filename).st_mtime)

    return file_hashes[filename]
