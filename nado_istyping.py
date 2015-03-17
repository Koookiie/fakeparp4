import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.gen
import ujson as json
from tornadoredis import Client
import re

print "WS Server started!"

session_validator = re.compile('^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
wsclients = set()

class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self, chat):
        self.client = Client()
        self.chat = chat
        self.redis_listen("chat:"+str(self.chat))
        self.remote_ip = self.request.headers.get('X-Forwarded-For', self.request.headers.get('X-Real-Ip', self.request.remote_ip))
        self.session = self.get_cookie("session", None)
        wsclients.add(self)

    @tornado.gen.coroutine
    def on_message(self, msg):
        if self.session is None or session_validator.match(self.session) is None:
            return

        try:
            message = json.loads(msg)
        except ValueError:
            print "Error: %s" % (msg)
            return

        if 'a' in message and 'c' in message:
            if message["a"] not in ("typing", "stopped_typing"):
                return

            try:
                counter = int(message['c'])
            except TypeError:
                return

            self.client.publish("chat:"+str(self.chat), json.dumps({
                "a": message["a"],  # action
                "c": counter  # counter
            }))

    def on_close(self):
        self.redis_client.unsubscribe("chat:"+str(self.chat))
        wsclients.discard(self)

    @tornado.gen.coroutine
    def redis_listen(self, channel):
        self.redis_client = Client()
        yield tornado.gen.Task(self.redis_client.subscribe, channel)
        self.redis_client.listen(self.on_redis_message, self.on_redis_unsubscribe)

    def on_redis_message(self, message):
        try:
            if message.kind == "message":
                self.write_message(message.body)
        except tornado.websocket.WebSocketClosedError:
            pass

    def on_redis_unsubscribe(self, callback):
        self.redis_client.disconnect()
        self.client.disconnect()

settings = dict(
    debug=True,
    gzip=True,
)

application = tornado.web.Application([
    (r'/([^/]+)', WSHandler),
], **settings)


if __name__ == "__main__":
    application.autoreload = True
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(8081)
    tornado.ioloop.IOLoop.instance().start()
