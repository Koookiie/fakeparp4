import datetime
import redis
import os

from erigam.lib.model import sm, engine, Log, LogPage, Message
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound

r = redis.Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))
sql = sm()

print "%s LogPages in database. %s logs in database." % (
    sql.query(func.count('*')).select_from(LogPage).scalar(),
    sql.query(func.count('*')).select_from(Log).scalar()
)

logs = sql.query(Log).order_by(Log.id).all()

def parse_line(log, line):
    parts = line.split(',', 4)

    try:
        timestamp = datetime.datetime.fromtimestamp(int(parts[0]))
    except (ValueError, TypeError):
        timestamp = datetime.datetime.today()

    try:
        counter = int(parts[1])
    except ValueError:
        counter = -1

    if parts[2] not in ["message", "user_change", "meta_change", "ic", "ooc", "me"]:
        msgtype = "message"
    else:
        msgtype = parts[2]

    if len(parts[3]) != 6:
        color = "000000"
    else:
        color = parts[3]

    return {
        "log_id": log.id,
        "timestamp": timestamp,
        "type": msgtype,
        "counter": counter,
        "color": color,
        "acronym": "",
        "name": "",
        "text": parts[4]
    }

conn = engine.connect()

for log in logs:
    for number in xrange(log.page_count):
        number = number + 1
        print "[{chat}] Converting page {page}/{total}".format(
            chat=log.url,
            page=number,
            total=log.page_count
        )

        try:
            page = sql.query(LogPage).filter(LogPage.log_id == log.id).filter(LogPage.number == number).one()
        except NoResultFound:
            print "Page could not be found for page {page} of {chat}".format(
                page=number,
                chat=log.url
            )
            continue

        if not page.content.strip():
            print "Chat {chat} is empty.".format(chat=log.url)
            continue

        try:
            conn.execute(
                Message.__table__.insert(),
                [parse_line(log, line) for line in page.content.split("\n")[0:-1]]
            )
        except IntegrityError as e:
            print "Encountered exception for chat {chat}: {exception}".format(
                chat=log.url,
                exception=e
            )

    print "Completed!"
    print "-"*60


print "Converting redis based lines"
chats = set()

for key in r.keys("chat.*"):
    if len(key.split(".")) == 2:
        chats.add(key)

for x in chats:
    url = x.split(".")[1]
    try:
        log = sql.query(Log).filter(Log.url == url)
    except NoResultFound:
        print "Log could not be found for chat {chat}".format(chat=url)
        continue
    lines = r.lrange("chat."+url, 0, -1)

    conn.execute(
        Message.__table__.insert(),
        [parse_line(log, line) for line in lines]
    )
    print "Redis lines for chat {chat} converted.".format(chat=url)
