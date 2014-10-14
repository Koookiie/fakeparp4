import os
import sys
from gevent.socket import getfqdn, socket, AF_UNIX
from gevent.wsgi import WSGIServer
from gevent import monkey; monkey.patch_socket()

try:
    if sys.argv[1]=='main':
        from main import app
    elif sys.argv[1]=='chat0':
        from chat import app
    elif sys.argv[1]=='chat1':
        from chat import app
    elif sys.argv[1]=='chat2':
        from chat import app
    elif sys.argv[1]=='chat3':
        from chat import app
except ImportError:
    sys.exit("Usage: python run_server.py (main|chat) [--debug]")

if '--debug' in sys.argv:
    app.debug = True

socket_path = '/tmp/'+sys.argv[1]+'.sock'

# Delete the socket file if it already exists.
try:
    os.remove(socket_path)
except OSError:
    pass

sock = socket(AF_UNIX)
sock.bind(socket_path)
sock.setblocking(0)
sock.listen(2048)

os.chmod(socket_path, 0777)

http_server = WSGIServer(sock, app)
# yeah this is a hack.
# double the hacks
http_server.environ['SERVER_NAME'] = "erigam.tk"
http_server.serve_forever()

