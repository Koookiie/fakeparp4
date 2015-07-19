import datetime
from erigam.lib.model import sm, Log, LogPage, Message
from sqlalchemy import func
from sqlalchemy.orm.exc import NoResultFound

sql = sm()

print "%s LogPages in database. %s logs in database." % (
    sql.query(func.count('*')).select_from(LogPage).scalar(),
    sql.query(func.count('*')).select_from(Log).scalar()
)

logs = sql.query(Log).order_by(Log.id).all()

for log in logs:
    print "Beginning convert for log {id} ({friendly})".format(
        id=log.id,
        friendly=log.url
    )

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

        for line in page.content.split("\n")[0:-1]:
            parts = line.split(',', 4)

            try:
                timestamp = datetime.datetime.fromtimestamp(int(parts[0]))
            except (ValueError, TypeError):
                timestamp = datetime.datetime.today()

            try:
                counter = int(parts[1])
            except ValueError:
                counter = -1

            sql.add(Message(
                log_id=log.id,
                timestamp=timestamp,
                type=parts[2],
                counter=counter,
                color=parts[3],
                text=parts[4]
            ))
        sql.commit()

    print "Completed!"
    print "-"*60
