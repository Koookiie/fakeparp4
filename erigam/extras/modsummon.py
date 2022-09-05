import time
import json
import requests
import os

from collections import defaultdict
from redis import Redis

from erigam.lib.request_methods import redis_pool

db = Redis(connection_pool=redis_pool)
pubsub = db.pubsub()
pubsub.psubscribe('channel.*')

url = os.environ.get('DISCORD_WEBHOOK')

for msg in pubsub.listen():
    if type(msg['data']) is str:
        data = json.loads(msg['data'])
        if 'messages' not in data:
            continue

        for message in data['messages']:
            if message['type'] == 'message' and message['counter'] != -1:
                encoded_msg = message['text'].encode('utf-8')
                channel = msg['channel'][len('channel.'):]

                if "modsummon" in encoded_msg.decode('utf-8').lower():
                    print("MODSUMMON IN " + channel)
                    print(encoded_msg)

                    if url is not None:
                        data = {
                            "content": None,
                            "username": "Dreambubble Modsummon"
                        }

                        domain = os.environ.get("BASE_DOMAIN", "dreambubble.xyz")

                        data["embeds"] = [{
                            "title": "Message Content",
                            "description": encoded_msg.decode('utf-8'),
                            "color": None,
                            "author": {
                                "name": channel,
                                "url": "https://"+ domain +"/chat/" + channel
                            }}
                        ]

                        result = requests.post(url, json=data)
                        try:
                            result.raise_for_status()
                        except requests.exceptions.HTTPError as err:
                            print(err)
                        else:
                            print("Sent payload to discord channel")