# This Python file uses the following encoding: utf-8
import os
import re
import random
from multiprocessing import Process, Queue
import argparse

from sqlalchemy import and_, create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound

from lib.model import Log, LogPage
from lib.messages import parse_line

parser = argparse.ArgumentParser(description='log search')

parser.add_argument('--chat', help='which chat to search', required=True)
parser.add_argument('--line', help='text to search', required=True)

args = parser.parse_args()

chat = args.chat

engine = create_engine('mysql://msparp:SfPAAhnAJb5xven4@localhost/msparp', convert_unicode=True, pool_recycle=3600)
sm = sessionmaker(autocommit=False,
                  autoflush=False,
                  bind=engine)

q = Queue()
sql = sm()
log = sql.query(Log).filter(Log.url == chat).one()

# https://stackoverflow.com/questions/1855095/how-to-create-a-zip-archive-of-a-directory-in-python
def zipdir(path, zip, chat):
    for root, dirs, files in os.walk(path):
        for file in files:
            zip.write(os.path.join(root, file), '%s/%s' % (chat, file))

def searchWorker():
    mysql = sm()
    for current_page in iter(q.get, '<<STOP>>'):
        try:
            log_page = mysql.query(LogPage).filter(and_(LogPage.log_id == log.id, LogPage.number == current_page)).one()
        except NoResultFound:
            print "Page %s not found." % (current_page)
            continue

        # Pages end with a line break, so the last line is blank.
        try:
            lines = log_page.content.split('\n')[0:-1]
            lines = map(lambda _: parse_line(_, 0), lines)
        except:
            continue
        for line in lines:
            if args.line.lower() in line['line'].lower():
                line['line'] = re.sub(args.line, '\033[38;5;%dm%s\033[0m' % (random.randint(1, 255), args.line), line['line'], flags=re.I)
                try:
                    acronym, message = line['line'].split(":", 2)
                    line['line'] = "\033[38;5;%dm%s\033[0m: %s" % (random.randint(1, 255), acronym, message)
                except:
                    pass
                #line['line'] = re.sub(args.line, '\033[92m%s\033[0m' % (args.line), line['line'], flags=re.I)
                print "\033[38;5;%dm[Page %s]\033[0m %s" % (random.randint(1, 255), current_page, line['line'])
                #print "\033[94m[Page %s]\033[0m %s" % (current_page, line['line'])
procs = []

# queues up all the pages to export
for x in range(1, log.page_count + 1):
    q.put(x)

# range defines how many threads to start
for i in range(7):
    p = Process(target=searchWorker)
    p.daemon = True
    procs.append(p)
    p.start()
    q.put('<<STOP>>')


for p in procs:
    p.join()
