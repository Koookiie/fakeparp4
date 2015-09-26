from flask import (
    Blueprint,
    g,
    request,
    make_response,
    jsonify,
    abort
)

from erigam.lib import (
    CHAT_FLAGS
)

from erigam.lib.api import disconnect, get_online_state

from erigam.lib.groups import (
    MOD_GROUPS,
    GROUP_RANKS,
    MINIMUM_RANKS
)

from erigam.lib.messages import (
    send_message,
    send_userlist,
    get_userlists
)

from erigam.lib.model import Ban, Message

from erigam.lib.characters import CHARACTER_DETAILS
from erigam.lib.punishments import punish
from erigam.lib.decorators import mark_alive, require_admin
from erigam.lib.request_methods import (
    use_db_chat,
    db_commit,
    disconnect_sql
)

import datetime
import json

blueprint = Blueprint('backend', __name__)

# Views

@blueprint.route('/post', methods=['POST'])
@mark_alive
@use_db_chat
def postMessage():
    chat = request.form['chat']
    if 'line' in request.form and g.user.meta['group'] != 'silent':
        # Remove linebreaks and truncate to 1500 characters.
        line = request.form['line'].replace('\n', ' ')[:1500]

        if g.redis.hexists('punish-scene', g.user.ip):
            line = punish(g.redis, g.user.session_id, chat, line)

        send_message(g.sql, g.redis, Message(
            log_id=g.log.id,
            type="message",
            counter=g.user.meta['counter'],
            color=g.user.character['color'],
            acronym=g.user.character['acronym'],
            text=line
        ))

    # Mod options.
    if g.user.meta['group'] in MOD_GROUPS:
        if 'set_group' in request.form and 'counter' in request.form:
            set_group = request.form['set_group']
            set_session_id = g.redis.hget('chat.'+chat+'.counters', request.form['counter']) or abort(400)
            ss_key = 'session.'+set_session_id+'.chat.'+chat
            ss_meta_key = 'session.'+set_session_id+'.meta.'+chat
            current_group = g.redis.hget(ss_meta_key, 'group')
            # You can't promote people to or demote people from a group higher than your own.
            if (
                GROUP_RANKS[current_group] > GROUP_RANKS[g.user.meta['group']]
                or GROUP_RANKS[set_group] > GROUP_RANKS[g.user.meta['group']]
            ):
                return 'ok'
            if current_group != set_group and set_group in list(GROUP_RANKS.keys()):
                g.redis.hset(ss_meta_key, 'group', set_group)
                set_message = None
                # XXX make a function for fetching name and acronym?
                # Convert the name and acronym to unicode.
                ss_character = g.redis.hget(ss_key, 'character') or 'anonymous/other'
                set_session_name = g.redis.hget(ss_key, 'name') or CHARACTER_DETAILS[ss_character]['name']
                set_session_acronym = g.redis.hget(ss_key, 'acronym') or CHARACTER_DETAILS[ss_character]['acronym']

                if set_group == 'globalmod':
                    set_message = '{name} [{acronym}] set {set_name} [{set_acronym}] to Global Moderator. How the hell did this just happen?'
                elif set_group == 'mod':
                    set_message = '{name} [{acronym}] set {set_name} [{set_acronym}] to Professional Wet Blanket. They can now silence, kick and ban other users.'
                elif set_group == 'mod2':
                    set_message = '{name} [{acronym}] set {set_name} [{set_acronym}] to Bum\'s Rusher. They can now silence and kick other users.'
                elif set_group == 'mod3':
                    set_message = '{name} [{acronym}] set {set_name} [{set_acronym}] to Amateur Gavel-Slinger. They can now silence other users.'
                elif set_group == 'user':
                    if current_group in MOD_GROUPS:
                        set_message = '{name} [{acronym}] removed moderator status from {set_name} [{set_acronym}].'
                    else:
                        set_message = '{name} [{acronym}] unsilenced {set_name} [{set_acronym}].'
                elif set_group == 'silent':
                    set_message = '{name} [{acronym}] silenced {set_name} [{set_acronym}].'

                if set_message is not None:
                    set_message = set_message.format(
                        name=g.user.character['name'],
                        acronym=g.user.character['acronym'],
                        set_name=set_session_name,
                        set_acronym=set_session_acronym
                    )
                send_message(g.sql, g.redis, Message(
                    log_id=g.log.id,
                    type="user_change",
                    counter=-1,
                    text=set_message
                ))
        if 'user_action' in request.form and 'counter' in request.form and request.form['user_action'] in MINIMUM_RANKS:
            # Check if we're high enough to perform this action.
            if GROUP_RANKS[g.user.meta['group']] < MINIMUM_RANKS[request.form['user_action']]:
                return 'ok'
            their_session_id = g.redis.hget('chat.'+chat+'.counters', request.form['counter']) or abort(400)
            their_group = g.redis.hget('session.'+their_session_id+'.meta.'+chat, 'group')
            # Check if we're high enough to affect the other user.
            if GROUP_RANKS[g.user.meta['group']] < GROUP_RANKS[their_group]:
                return 'ok'
            # XXX make a function for fetching name and acronym?
            # Fetch their name and convert to unicode.
            their_chat_key = 'session.'+their_session_id+'.chat.'+chat
            their_character = g.redis.hget(their_chat_key, 'character')
            their_session_name = g.redis.hget(their_chat_key, 'name') or CHARACTER_DETAILS[their_character]['name']
            their_session_acronym = g.redis.hget(their_chat_key, 'acronym') or CHARACTER_DETAILS[their_character]['acronym']

            if request.form['user_action'] == 'kick':
                g.redis.publish('channel.'+chat+'.'+their_session_id, '{"exit":"kick"}')
                disconnect(g.sql, g.redis, g.log, their_session_id, "%s [%s] kicked %s [%s] from the chat." % (
                    g.user.character['name'],
                    g.user.character['acronym'],
                    their_session_name,
                    their_session_acronym
                ))

            # Don't ban people from the oubliette because that'll just put us in an infinite loop.
            elif request.form['user_action'] == 'ip_ban' and chat != 'theoubliette':
                their_ip_address = g.redis.hget('session.'+their_session_id+'.meta', 'last_ip')

                if their_ip_address is None:
                    return jsonify({"error": "baduser"}), 500

                g.sql.add(Ban(
                    url=chat,
                    ip=their_ip_address,
                    name=their_session_name,
                    counter=request.form['counter'],
                    expires=datetime.datetime.utcnow() + datetime.timedelta(weeks=3),
                    reason=request.form.get('reason', "")[:1500]
                ))

                g.redis.publish('channel.'+chat+'.'+their_session_id, '{"exit":"ban"}')

                ban_message = "%s [%s] IP banned %s [%s]. " % (
                              g.user.character['name'],
                              g.user.character['acronym'],
                              their_session_name,
                              their_session_acronym,
                )

                if 'reason' in request.form:
                    ban_message = ban_message + " Reason: %s" % (request.form['reason'][:1500])

                if g.redis.sismember('chat.'+chat+'.online', their_session_id) or g.redis.sismember('chat.'+chat+'.idle', their_session_id):
                    disconnect(g.sql, g.redis, g.log, their_session_id, ban_message)
                else:
                    send_message(g.sql, g.redis, Message(
                        log_id=g.log.id,
                        type="user_change",
                        counter=-1,
                        text=ban_message
                    ))

        if 'topic' in request.form:
            if request.form['topic'] != '':
                truncated_topic = request.form['topic'].replace('\n', ' ')[:1500]
                g.redis.hset('chat.'+chat+'.meta', 'topic', truncated_topic)
                topic_message = '%s changed the conversation topic to "%s".' % (
                    g.user.character['name'],
                    truncated_topic
                )
            else:
                g.redis.hdel('chat.'+chat+'.meta', 'topic')
                topic_message = '%s removed the conversation topic.' % (g.user.character['name'])
            send_message(g.sql, g.redis, Message(
                log_id=g.log.id,
                type="meta_change",
                counter=-1,
                text=topic_message
            ))
        if 'background' in request.form:
            if request.form['background'] != '':
                background_url = request.form['background'].strip()[:1500]
                g.redis.hset('chat.'+chat+'.meta', 'background', background_url)
                g.redis.sadd("chat-backgrounds", chat)
                background_message = '%s [%s] changed the conversation background to "%s".' % (
                    g.user.character['name'],
                    g.user.character['acronym'],
                    background_url
                )
            else:
                g.redis.hdel('chat.'+chat+'.meta', 'background')
                background_message = '%s [%s] removed the conversation background.' % (g.user.character['name'], g.user.character['acronym'])
                g.redis.srem("chat-backgrounds", chat)
            send_message(g.sql, g.redis, Message(
                log_id=g.log.id,
                type="meta_change",
                counter=-1,
                text=background_message
            ))

        if 'audio' in request.form:
            if request.form['audio'] != '':
                audio_url = request.form['audio'].strip()[:1500]
                g.redis.hset('chat.'+chat+'.meta', 'audio', audio_url)
                audio_message = '%s changed the conversation audio to "%s".' % (
                    g.user.character['name'],
                    audio_url
                )
            else:
                g.redis.hdel('chat.'+chat+'.meta', 'audio')
                audio_message = '%s removed the conversation audio.' % (g.user.character['name'])

            send_message(g.sql, g.redis, Message(
                log_id=g.log.id,
                type="meta_change",
                counter=-1,
                text=audio_message
            ))

    return 'ok'

@blueprint.route('/flag', methods=['POST'])
@mark_alive
@use_db_chat
def set_flag():
    for flag in CHAT_FLAGS:
        if flag in request.form:
            if request.form[flag] == '1':
                g.redis.hset('chat.'+g.log.url+'.meta', flag, '1')
                if flag == 'public':
                    g.redis.sadd("public-chats", g.log.url)
            else:
                g.redis.hdel('chat.'+g.log.url+'.meta', flag)
                if flag == 'public':
                    g.redis.srem("public-chats", g.log.url)
            send_message(g.sql, g.redis, Message(
                log_id=g.log.id,
                type="meta_change",
                counter=-1,
                text='%s changed the %s settings.' % (g.user.character['name'], flag)
            ))

    return '', 204

@blueprint.route('/highlight', methods=['POST'])
@mark_alive
@use_db_chat
def saveHighlight():
    try:
        counter = request.form['counter']
        if counter != "":
            counter = int(counter)
    except (ValueError, TypeError):
        return jsonify({"error": "badcounter"}), 500

    if counter != "":
        g.redis.hset("chat.%s.highlights" % (g.log.url), g.user.meta['counter'], counter)
    else:
        g.redis.hdel("chat.%s.highlights" % (g.log.url), g.user.meta['counter'])

    return '', 204

@blueprint.route('/ping', methods=['POST'])
@mark_alive
def pingServer():
    return '', 204

@blueprint.route('/messages', methods=['POST'])
@mark_alive
def getMessages():
    try:
        after = int(request.form["after"])
    except (KeyError, ValueError):
        after = 0

    # Look for stored messages first, and only subscribe if there aren't any.
    messages = g.redis.zrangebyscore("chat:%s" % int(request.form["log_id"]), "(%s" % after, "+inf")

    if "joining" in request.form or (hasattr("g", "joining") and g.joining):
        message_dict = {
            "messages": [],
        }

        # Send online and idle lists
        message_dict['online'], message_dict['idle'] = get_userlists(g.redis, g.user.chat)

        # Newly created matchmaker chats don't know the counter, so we send it here.
        message_dict['counter'] = g.user.meta['counter']

        # Add on the currently highlighted user if it exists.
        highlight = g.redis.hget("chat.%s.highlights" % (g.user.chat), g.user.meta['counter'])
        if highlight:
            message_dict['highlight'] = highlight

        # Send chat meta list to ensure flags and other things are set.
        message_dict['meta'] = g.redis.hgetall('chat.'+g.user.chat+'.meta')

        return jsonify(message_dict)
    elif len(messages) != 0:
        message_dict = {"messages": [json.loads(_) for _ in messages]}
        return jsonify(message_dict)

    g.pubsub = g.redis.pubsub()

    # Main channel.
    g.pubsub.subscribe('channel.'+g.user.chat)

    # Self channel.
    # Used for kicking, banning and events directed towards the user.
    g.pubsub.subscribe('channel.'+g.user.chat+'.'+g.user.session_id)

    # Get rid of the database connection here so we're not hanging onto it
    # while waiting for the redis message.
    db_commit()
    disconnect_sql()

    for msg in g.pubsub.listen():
        if msg['type'] == 'message':
            # The pubsub channel sends us a JSON string, so we return that instead of using jsonify.
            resp = make_response(msg['data'])
            resp.headers['Content-type'] = 'application/json'
            return resp

@blueprint.route('/quit', methods=['POST'])
@use_db_chat
def quitChatting():
    disconnect_message = '%s [%s] disconnected.' % (g.user.character['name'], g.user.character['acronym']) if g.user.meta['group'] != 'silent' else None
    disconnect(g.sql, g.redis, g.log, g.user.session_id, disconnect_message)
    return 'ok'

@blueprint.route('/save', methods=['POST'])
@mark_alive
@use_db_chat
def save():
    try:
        message = g.user.save_character(request.form)
        if message:
            send_message(g.sql, g.redis, Message(
                log_id=g.log.id,
                type="user_change",
                counter=-1,
                text=message
            ))
        else:
            send_userlist(g.redis, g.log)
    except ValueError:
        abort(400)
    return 'ok'

@blueprint.route('/state', methods=['POST'])
@mark_alive
@use_db_chat
def change_state():
    state = request.form['state']
    if state not in ['idle', 'online']:
        abort(500)

    current_state = get_online_state(g.redis, g.log.url, g.user.session_id)

    if state != current_state:
        g.redis.smove('chat.'+g.log.url+'.'+current_state, 'chat.'+g.log.url+'.'+state, g.user.session_id)

    # Update userlist.
    send_userlist(g.redis, g.log)

    return '', 204


# Globalmod stuff.

@blueprint.route('/ip_lookup', methods=['POST'])
@require_admin
def ip_lookup():
    chat = request.form['chat']
    counter = request.form['counter']
    theircookie = g.redis.hget("chat."+chat+".counters", counter)
    ip = g.redis.hget("session."+theircookie+".meta", "last_ip")

    return ip
