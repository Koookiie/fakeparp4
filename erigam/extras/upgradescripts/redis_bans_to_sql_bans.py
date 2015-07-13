from redis import Redis
import os
import datetime

from erigam.lib.model import sm, Ban

r = Redis(host=os.environ['REDIS_HOST'], port=int(os.environ['REDIS_PORT']), db=int(os.environ['REDIS_DB']))
sql = sm()

bans = r.zrange("ip-bans", 0, -1, withscores=True)
ban_reasons = r.hgetall("ban-reasons")

print "%s bans in Redis. %s ban reasons in Redis." % (len(bans), len(ban_reasons))

for ban, expiry in bans:
    date = datetime.datetime.fromtimestamp(int(expiry))
    chat, ip = ban.split("/", 1)
    sql.add(Ban(
        url=chat,
        ip=ip,
        name="Imported ban",
        counter=1,
        reason=ban_reasons.get(ban, ""),
        expires=date
    ))
    sql.commit()
    print "Ban for %s in chat %s imported." % (ip, chat)

print "Import complete."
