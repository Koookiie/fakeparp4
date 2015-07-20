from sqlalchemy import create_engine
from sqlalchemy.orm import backref, relation, scoped_session, sessionmaker
from sqlalchemy.schema import Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, ForeignKey, Integer, String, Unicode, UnicodeText, DateTime, Enum

import datetime
import os
import time

def now():
    return datetime.datetime.now()

engine = create_engine(os.environ['SQL_URL'], client_encoding='utf8', pool_recycle=3600)
sm = sessionmaker(autocommit=False,
                  autoflush=False,
                  bind=engine)

base_session = scoped_session(sm)

Base = declarative_base()
Base.query = base_session.query_property()

def init_db():
    Base.metadata.create_all(bind=engine)

class Log(Base):
    __tablename__ = 'logs'

    id = Column(Integer, primary_key=True)
    url = Column(String(100), unique=True)
    page_count = Column(Integer, default=1)
    time_created = Column(DateTime(), nullable=False, default=now)
    time_saved = Column(DateTime(), nullable=False, default=now)

class LogPage(Base):
    __tablename__ = 'log_pages'

    log_id = Column(Integer, ForeignKey('logs.id'), primary_key=True)
    number = Column(Integer, primary_key=True, autoincrement=False)
    content = Column(UnicodeText, nullable=False)

class Chat(Base):
    __tablename__ = 'chats'

    log_id = Column(Integer, ForeignKey('logs.id'), primary_key=True)
    type = Column(Enum(u"unsaved", u"saved", u"group", u"deleted", name=u"chats_type"), nullable=False, default=u"saved")
    counter = Column(Integer, nullable=False, default=1)
    topic = Column(UnicodeText, nullable=True)
    background = Column(UnicodeText, nullable=True)

class ChatSession(Base):
    __tablename__ = 'chat_sessions'

    log_id = Column(Integer, ForeignKey('logs.id'), primary_key=True)
    session_id = Column(String(36), primary_key=True)
    counter = Column(Integer, nullable=False)
    expiry_time = Column(DateTime(), nullable=False, default=now)
    group = Column(Enum(u"silent", u"user", u"mod3", u"mod2", u"mod", u"globalmod", name=u"chat_sessions_group"), nullable=False, default=u"user")
    # XXX UTF-8 ISSUES WITH LENGTH?!
    # XXX also check these lengths
    character = Column(Unicode(100), nullable=False, default=u"anonymous/other")
    name = Column(Unicode(100), nullable=False, default=u"Anonymous")
    acronym = Column(Unicode(15), nullable=False, default=u"")
    color = Column(Unicode(6), nullable=False, default=u"000000")
    case = Column(Unicode(35), nullable=False, default=u"normal")
    replacements = Column(UnicodeText, nullable=False, default=u"[]")
    quirk_prefix = Column(Unicode(1500), nullable=False, default=u"")
    quirk_suffix = Column(Unicode(1500), nullable=False, default=u"")

class Ban(Base):
    __tablename__ = 'bans'
    id = Column(Integer, primary_key=True)
    url = Column(String(100), ForeignKey('logs.url'), primary_key=True)
    ip = Column(Unicode, nullable=False)
    name = Column(Unicode(100))
    counter = Column(Integer)
    reason = Column(UnicodeText)
    expires = Column(DateTime(), nullable=False)

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    log_id = Column(Integer, ForeignKey('logs.id'), nullable=False)

    timestamp = Column(DateTime(), nullable=False, default=now)

    type = Column(Enum(
        u"message",
        u"user_change",
        u"meta_change",
        u"ic",
        u"ooc",
        u"me",
        name=u"messages_type",
    ), nullable=False, default=u"ic")

    counter = Column(Integer, nullable=False)

    color = Column(Unicode(6), nullable=False, default=u"000000")

    acronym = Column(Unicode(15), nullable=False, default=u"")

    name = Column(Unicode(100), nullable=False, default=u"")

    text = Column(UnicodeText, nullable=False)

    def to_dict(self, include_user=False):
        md = {
            "id": self.id,
            "counter": self.counter,
            "timestamp": time.mktime(self.timestamp.timetuple()),
            "type": self.type,
            "color": self.color,
            "acronym": self.acronym,
            "name": self.name,
            "text": self.text,
        }

        return md

# Index to make log rendering easier.
Index("messages_log_id", Message.log_id, Message.timestamp)

Log.pages = relation(LogPage, backref='log')
Log.chat = relation(Chat, backref='log', uselist=False)
Log.sessions = relation(ChatSession, backref='log')
Log.bans = relation(Ban, backref='log')

Message.log = relation(Log)
