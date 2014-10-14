import sys
from redis import Redis
from archive import archive_chat, get_or_create_log
from model import sm
from sqlalchemy.exc import IntegrityError, InvalidRequestError

redis = Redis()
mysql = sm()

chat_url = sys.argv[2]

print 'Archiving '+chat_url

if sys.argv[1]=='save':
    try:
        archive_chat(redis, mysql, chat_url)
        print chat_url+' archived'
    except(IntegrityError, InvalidRequestError):
        print chat_url+' failed'
        pass