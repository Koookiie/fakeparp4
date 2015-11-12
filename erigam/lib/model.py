from sqlalchemy import create_engine
from sqlalchemy.orm import backref, relation, scoped_session, sessionmaker
from sqlalchemy.schema import Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, ForeignKey, Integer, String, Unicode, UnicodeText, DateTime, Enum, Boolean

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
    type = Column(Enum("unsaved", "saved", "group", "deleted", name="chats_type"), nullable=False, default="saved")
    counter = Column(Integer, nullable=False, default=1)
    topic = Column(UnicodeText, nullable=True)
    background = Column(UnicodeText, nullable=True)

class ChatSession(Base):
    __tablename__ = 'chat_sessions'

    log_id = Column(Integer, ForeignKey('logs.id'), primary_key=True)
    session_id = Column(String(36), primary_key=True)
    counter = Column(Integer, nullable=False)
    expiry_time = Column(DateTime(), nullable=False, default=now)
    group = Column(Enum("silent", "user", "mod3", "mod2", "mod", "globalmod", name="chat_sessions_group"), nullable=False, default="user")
    # XXX UTF-8 ISSUES WITH LENGTH?!
    # XXX also check these lengths
    character = Column(Unicode(100), nullable=False, default="anonymous/other")
    name = Column(Unicode(100), nullable=False, default="Anonymous")
    acronym = Column(Unicode(15), nullable=False, default="")
    color = Column(Unicode(6), nullable=False, default="000000")
    case = Column(Unicode(35), nullable=False, default="normal")
    replacements = Column(UnicodeText, nullable=False, default="[]")
    quirk_prefix = Column(Unicode(1500), nullable=False, default="")
    quirk_suffix = Column(Unicode(1500), nullable=False, default="")

class Ban(Base):
    __tablename__ = 'bans'
    id = Column(Integer, primary_key=True)
    url = Column(String(100), ForeignKey('logs.url'), primary_key=True)
    ip = Column(Unicode, nullable=False)
    name = Column(Unicode(100))
    counter = Column(Integer)
    reason = Column(UnicodeText)
    created = Column(DateTime(), nullable=False, default=now)
    expires = Column(DateTime(), nullable=False)

class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True)
    log_id = Column(Integer, ForeignKey('logs.id'), nullable=False)
    admin = Column(Boolean, default=False)

    timestamp = Column(DateTime(), nullable=False, default=now)

    type = Column(Enum(
        "message",
        "user_change",
        "meta_change",
        "ic",
        "ooc",
        "me",
        name="messages_type",
    ), nullable=False, default="ic")

    counter = Column(Integer, nullable=False)

    color = Column(Unicode(6), nullable=False, default="000000")

    acronym = Column(Unicode(15), nullable=False, default="")

    name = Column(Unicode(100), nullable=False, default="")

    text = Column(UnicodeText, nullable=False)

    def to_dict(self, include_user=False):
        md = {
            "id": self.id,
            "admin": self.admin,
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
