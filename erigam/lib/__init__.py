import re
import time

# Timeout period for searchers.
SEARCH_PERIOD = 1

# Timeout period for chats.
PING_PERIOD = 15

# Period in which to send blank messages to avoid socket timeouts - 25 seconds.
LONGPOLL_TIMEOUT_PERIOD = 25

# Period in which saved chats are archived - 30 minutes.
ARCHIVE_PERIOD = 1800

# Time after which unsaved chats are deleted - 24 hours.
DELETE_UNSAVED_PERIOD = 86400

# Time after which saved chats are deleted - 30 days.
DELETE_SAVED_PERIOD = 2592000

# Time after which chat session data is deleted - 30 days.
DELETE_CHAT_SESSION_PERIOD = 2592000

# Time after which global session data is deleted - 30 days.
DELETE_SESSION_PERIOD = 2592000

OUBLIETTE_ID = 'theoubliette'

CHAT_FLAGS = ['autosilence', 'public', 'nsfw']

def get_time(offset=0):
    return int(time.time())+offset

chat_validator = re.compile('^[-a-zA-Z0-9_]+$')
session_validator = re.compile('^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')

def validate_chat_url(url):
    if len(url) <= 100:
        return chat_validator.match(url)
    return False
