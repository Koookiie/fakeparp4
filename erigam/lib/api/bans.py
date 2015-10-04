from erigam.lib.model import Ban

def unban(sql, chat=None, banid=None):
    query = sql.query(Ban)

    if chat:
        query = query.filter(Ban.url == chat)

    if banid:
        query = query.filter(Ban.id == banid)

    return query.delete()
