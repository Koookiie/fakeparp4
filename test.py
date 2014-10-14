import redis
import json

r = redis.Redis()
chats = set()
ca = r.zrange("chats-alive", 0, -1)
for x in ca:
    chat, session = x.split("/")
    chats.add(chat)

for chat in chats:
    r.publish("channel."+chat, json.dumps({
        "exit": "kick"
    }))
