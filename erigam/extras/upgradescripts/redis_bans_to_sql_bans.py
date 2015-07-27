from redis import Redis
import datetime

from erigam.lib.model import sm, Ban
from erigam.lib.request_methods import redis_pool

r = Redis(connection_pool=redis_pool)
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
