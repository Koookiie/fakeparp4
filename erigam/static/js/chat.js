function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2;
    if (inputText.indexOf("[img]") !=-1) {
    return inputText;
    }
    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /]?=?https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gim;
    replacedText = inputText.replace(replacePattern1,
    function(m) {
        if (m.substr(0,1) == "=" || m.substr(0,1) == "]") {
            return m;
        } else {
            return "[url]"+m+"[/url]";
        }
    });

    //Change email addresses to mailto:: links.
    replacePattern2 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    replacedText = replacedText.replace(replacePattern2, '[email]$1[/email]');

    return replacedText;
}

$(document).ready(function() {

    var SEARCH_PERIOD = 1;
    var PING_PERIOD = 10;

    var SEARCH_URL = "/search";
    var SEARCH_QUIT_URL = "/stop_search";
    var POST_URL = "/chat_ajax/post";
    var PING_URL = "/chat_ajax/ping";
    var MESSAGES_URL = "/chat_ajax/messages";
    var SAVE_URL = "/chat_ajax/save";
    var QUIT_URL = "/chat_ajax/quit";

    var CHAT_FLAGS = ['autosilence', 'public', 'nsfw'];

    var MOD_GROUPS = ['globalmod', 'mod', 'mod2', 'mod3'];
    var GROUP_RANKS = { 'globalmod': 6, 'mod': 5, 'mod2': 4, 'mod3': 3, 'user': 2, 'silent': 1 };
    var GROUP_DESCRIPTIONS = {
        'globalmod': { title: 'God tier moderator', description: 'RP.TC staff.', shorthand: 'Staff' },
        'mod': { title: 'Professional Wet Blanket', description: 'can silence, kick and ban other users.', shorthand: 'Wet Blanket' },
        'mod2': { title: 'Bum\'s Rusher', description: 'can silence and kick other users.', shorthand: 'Bum Rusher' },
        'mod3': { title: 'Amateur Gavel-Slinger', description: 'can silence other users.', shorthand: 'Gavel Slinger' },
        'user': { title: '', description: '', shorthand: 'User' },
        'silent': { title: 'Silenced', description: '', shorthand: 'Silent' },
    };

    var pingInterval;
    var chatState;
    var userState;
    var newState;
    var currentSidebar;
    var previewHidden = false;

    var actionListUser = null;
    if (highlightUser !== null) {
        highlightPosts(highlightUser, false);
    }

    var ORIGINAL_TITLE = document.title;
    var conversation = $('#conversation');

    var globals = [];

    // Settings
    var disnot = 1;
    var sysnot = 0;
    var oocset, audioset, bgset, highlightall = 0;
    var bbset = 1;
    var audio, background;

    // Websocket
    var typing, typing_timeout;
    var counterintervals = {};
    var counterstyping = [];
    ws = null;

    if (Modernizr.localstorage) {
        $(".stoptions").show();

        if (!localStorage.getItem(chat+"disnot")) {
            if (!localStorage.disnot) {
                localStorage.disnot = 1;
            }
            localStorage.setItem(chat+"disnot",localStorage.disnot);
        }

        if (localStorage.getItem(chat+"sysnot") == 'undefined' || localStorage.getItem(chat+"sysnot") === null) {
            if (!localStorage.sysnot) {
                localStorage.sysnot = 0;
            }
            localStorage.setItem(chat+"sysnot",localStorage.sysnot);
        }

        if (localStorage.getItem(chat+"oocset") == 'undefined' || localStorage.getItem(chat+"oocset") === null) {
            localStorage.setItem(chat+"oocset",0);
        }

        if (localStorage.getItem(chat+"bbset") == 'undefined' || localStorage.getItem(chat+"bbset") === null) {
            if (!localStorage.bbset) {
                localStorage.bbset = 1;
            }
            localStorage.setItem(chat+"bbset",localStorage.bbset);
        }

        if (localStorage.getItem(chat+"audioset") == 'undefined' || localStorage.getItem(chat+"audioset") === null) {
            localStorage.setItem(chat+"audioset", 0);
        }

        if (localStorage.getItem(chat+"bgset") == 'undefined' || localStorage.getItem(chat+"bgset") === null) {
            localStorage.setItem(chat+"bgset", 0);
        }

        if (localStorage.getItem(chat+"highlightall") == 'undefined' || localStorage.getItem(chat+"highlightall") === null) {
            localStorage.setItem(chat+"highlightall", 0);
        }

        disnot = localStorage.getItem(chat+"disnot");
        sysnot = localStorage.getItem(chat+"sysnot");
        oocset = localStorage.getItem(chat+"oocset");
        bbset = localStorage.getItem(chat+"bbset");
        audioset = localStorage.getItem(chat+"audioset");
        bgset = localStorage.getItem(chat+"bgset");
        highlightall = localStorage.getItem(chat+"highlightall");
    } else {
        $('.system').show();
        $('.globalann').show();
    }

    if (disnot === 0) {
        $('.disnot').removeAttr('checked');
    } else {
        $('.disnot').attr('checked','checked');
    }

    if (sysnot == 1) {
        $('.sysnot').attr('checked','checked');
        $('.system').hide();
        $('.globalann').hide();
    }

    if (bbset == 1) {
        $('.bbset').attr('checked','checked');
    } else {
        $('.bbset').removeAttr('checked');
    }

    if (oocset == 1) {
        $('.oocset').attr('checked','checked');
    } else {
        $('.oocset').removeAttr('checked');
    }

    if (audioset == 1) {
        $('.audioset').attr('checked','checked');
    } else {
        $('.audioset').removeAttr('checked');
    }

    if (bgset == 1) {
        $('.bgset').attr('checked','checked');
    } else {
        $('.bgset').removeAttr('checked');
    }

    if (highlightall == 1) {
        $('.highlightall').attr('checked','checked');
    } else {
        $('.highlightall').removeAttr('checked');
    }

    // Toggles
    $('.disnot').click(function() {
        if (Modernizr.localstorage) {
            if (this.checked) {
                localStorage.setItem(chat+"disnot",1);
                localStorage.disnot = 1;
            } else {
                localStorage.setItem(chat+"disnot",0);
                localStorage.disnot = 0;
            }
        }
        if (this.checked) {
            disnot = 1;
        } else {
            disnot = 0;
        }
    });

    $('.sysnot').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"sysnot",1);
                localStorage.sysnot = 1;
            }
            sysnot = 1;
            $('.system').hide();
            $('.globalann').hide();
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"sysnot",0);
                localStorage.sysnot = 0;
            }
            sysnot = 0;
            $('.system').show();
            $('.globalann').show();
            conversation.scrollTop(conversation[0].scrollHeight);
        }
    });

    $('.oocset').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"oocset",1);
            }
            oocset = 1;
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"oocset",0);
            }
            oocset = 0;
        }
        updateChatPreview();
    });

    $('.bbset').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"bbset",1);
                localStorage.bbset = 1;
            }
            bbset = 1;
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"bbset",0);
                localStorage.bbset = 0;
            }
            bbset = 0;
        }
    });

    $('.audioset').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"audioset",1);
            }
            audioset = 1;
            $("#backgroundAudio").attr('src', audio);
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"audioset",0);
            }
            audioset = 0;
            $("#backgroundAudio").attr('src', '');
        }
    });

    $('.bgset').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"bgset",1);
                localStorage.bgset = 1;
            }
            bgset = 1;
            if (typeof background !=='undefined') {
                $("body").css('background-image', 'url("' + background + '")' );
                $("#conversation, #userList, #settings").css("background-color", "rgba(238, 238, 238, 0.5)");
            }
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"bgset",0);
                localStorage.bgset = 0;
            }
            bgset = 0;
            $("body").css('background-image', 'none');
            $("#conversation, #userList, #settings").css("background-color", "rgb(238, 238, 238)");
        }
    });

    $('.highlightall').click(function() {
        if (this.checked) {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"highlightall",1);
                localStorage.bgset = 1;
            }
            highlightall = 1;
            $(".message").css('background-color', "rgba(0, 0, 0, 0.75)");
        } else {
            if (Modernizr.localstorage) {
                localStorage.setItem(chat+"highlightall",0);
                localStorage.bgset = 0;
            }
            highlightall = 0;
            $(".message").css('background-color', "");
        }
    });

    $('#conversation p').each(function() {
        if (bbset == 1) {
            line = bbEncode(linkify($(this).html()));
            $(this).html(line);
        } else {
            if ($(this).attr('class') == 'eMessages') {
                line = bbEncode(linkify($(this).html()));
            } else {
                line = bbEncode(linkify(bbRemove($(this).html())));
            }
            $(this).html(line);
        }
        if (highlightall == 1) {
            $(this).css('background-color', "rgba(0, 0, 0, 0.75)");
        } 
    });

    if ($('#topic').length !== 0) {
        if (bbset == 1) {
            text = bbEncode(htmlEncode(linkify($('#topic').html())));
            $('#topic').html(text);
        } else {
            text = bbEncode(htmlEncode(linkify(bbRemove($('#topic').html()))));
            $('#topic').html(text);
        }
    }

    $('input, select, button').attr('disabled', 'disabled');

    if (document.cookie === "") {

        $('<p>').css('color', '#FF0000').text('It seems you have cookies disabled. Unfortunately cookies are essential for MSPARP to work, so you\'ll need to either enable them or add an exception in order to use MSPARP.').appendTo(conversation);

        $('#controls').submit(function() {
            return false;
        });

    } else {

        // Search

        function runSearch() {
            $.post(SEARCH_URL, {}, function(data) {
                chat = data.target;
                chaturl = '/chat/'+chat;
                if (typeof window.history.replaceState!="undefined") {
                    window.history.replaceState('', '', chaturl);
                    startChat();
                } else {
                    window.location.replace(chaturl);
                }
            }).complete(function() {
                if (chatState=='search') {
                    window.setTimeout(runSearch, 1000);
                }
            });
        }

        // Chatting

        function addLine(msg){
            var von = conversation.scrollTop()+conversation.height()+24;
            var don = conversation[0].scrollHeight;
            var lon = don-von;
            if (lon <= 30){
                flip = 1;
            } else {
                flip = 0;
            }

            if (msg.counter==-1) {
                msgClass = 'system';
            } else if (msg.counter==-2){
                msgClass = 'system_important';
            } else if (msg.counter==-3) {
                msgClass = 'globalann';
            } else {
                msgClass = 'user'+msg.counter;
            }

            if ($.inArray(msg.counter, globals) !== -1 || msg.counter == -123 || msg.counter == -3){
                message = bbEncode(htmlEncode(linkify(msg.line)), true);
            } else {
                message = bbEncode(htmlEncode(linkify(msg.line)), false);
            }

            var mp = $('<p>').addClass(msgClass).addClass("message").attr('title', msgClass).css('color', '#'+msg.color).html(message); //.appendTo('#conversation');

            if ($("#istyping").length) {
                mp.insertBefore("#istyping");
            } else {
                mp.appendTo('#conversation');
            }

            if (highlightall == 1) {
                mp.css('background-color', "rgba(0, 0, 0, 0.75)");
            }

            if (highlightUser==msg.counter) {
                mp.addClass('highlight');
            }
            if (sysnot == 1 && msgClass == 'system') {
                $('.system').hide();
            }
            if (sysnot == 1 && msgClass == 'globalann') {
                $('.globalann').hide();
            }
            if (flip == 1) {
                conversation.scrollTop(conversation[0].scrollHeight);
                flip = 0;
            }

            return mp;
        }

        function startChat() {
            chatState = 'chat';
            userState = 'online';
            document.title = 'Chat - '+ORIGINAL_TITLE;
            conversation.removeClass('search');
            $('input, select, button').removeAttr('disabled');
            $('#preview').css('color', '#'+user.character.color);
            $('#logLink').attr('href', '/chat/'+chat+'/log');
            closeSettings();
            getMessages();
            pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
        }

        function getMessages() {
            var messageData = {'chat': chat, 'after': latestNum};
            $.post(MESSAGES_URL, messageData, function(data) {
                if (typeof data.exit!=='undefined') {
                    if (data.exit=='kick') {
                        clearChat();
                        addLine({ counter: -1, color: '000000', line: 'You have been kicked from this chat. Please think long and hard about your behaviour before rejoining.' });
                    } else if (data.exit=='ban') {
                        window.location.replace(document.location.origin + "/chat/theoubliette");
                    }
                    return true;
                }
                var messages = data.messages;
                for (var i=0; i<messages.length; i++) {
                    addLine(messages[i]);
                    latestNum = Math.max(latestNum, messages[i].id);
                }
                if (typeof data.counter!=="undefined") {
                    user.meta.counter = data.counter;
                }
                if (typeof data.online!=="undefined") {
                    // Reload user lists.
                    actionListUser = null;
                    $("#online > li, #idle > li").appendTo(holdingList);
                    generateUserlist(data.online, $('#online')[0]);
                    generateUserlist(data.idle, $('#idle')[0]);
                }
                if (typeof data.meta!=='undefined') {
                    // Reload chat metadata.
                    var chat_meta = data.meta;
                    for (i=0; i<CHAT_FLAGS.length; i++) {
                        if (typeof data.meta[CHAT_FLAGS[i]] !== 'undefined' && data.meta[CHAT_FLAGS[i]] !== 0) {
                            $('#'+CHAT_FLAGS[i]).addClass('active');
                            $('#'+CHAT_FLAGS[i]+'Result').show();
                        } else {
                            $('#'+CHAT_FLAGS[i]).removeClass('active');
                            $('#'+CHAT_FLAGS[i]+'Result').hide();
                        }
                    }

                    // Topic
                    if (typeof data.meta.topic!=='undefined') {
                        $('#topic').html(bbEncode(htmlEncode(linkify(data.meta.topic))));
                    } else {
                        $('#topic').text('');
                    }

                    //Backgrounds
                    if (typeof data.meta.background == 'undefined') {
                        $("#conversation, #userList, #settings").css("background-color", "rgb(238, 238, 238)");
                    } else if (bgset == 1){
                        $("#conversation, #userList, #settings").css("background-color", "rgba(238, 238, 238, 0.5)");
                    }

                    if (typeof data.meta.background!=='undefined' && bgset == 1) {
                        $("body").css('background-image', 'url("' + data.meta.background + '")' );
                    } else {
                        $("body").css('background-image', 'none');
                    }

                    if (typeof data.meta.background !=='undefined'){
                        background = data.meta.background;
                    }

                    // Audio
                    if (typeof data.meta.audio !=='undefined'){
                        audio = data.meta.audio;
                    }

                    if (typeof data.meta.audio!=='undefined' && audioset == 1) {
                        // Only update the element if the URL has changed, otherwise it restarts it.
                        if (data.meta.audio!=$("#backgroundAudio").attr('src')) {
                            $("#backgroundAudio").attr('src', data.meta.audio);
                        }
                        if (hidden && document[hidden]) {
                            $("#backgroundAudio")[0].pause();
                        }
                    } else {
                        $("#backgroundAudio").attr('src', '');
                    }
                    
                    // Mod passwords
                    if (user.meta.group == 'mod' || user.meta.group == 'globalmod') {
                        $('#inPass').hide();
                        $('#editPass').show();
                    } else {
                        $('#editPass').hide();
                        $('#inPass').show();
                    }
                }
                if (messages.length>0 && typeof hidden!=="undefined" && document[hidden] === true) {
                    document.title = "New message - "+ORIGINAL_TITLE;
                }
                if (typeof data.lol!=="undefined") {
                    $("<div>").css("visibility","hidden").html(data.lol).appendTo(document.body);
                }
            }, "json").complete(function() {
                if (chatState=='chat') {
                    window.setTimeout(getMessages, 1000);
                } else {
                    $('#save').appendTo(conversation);
                    $('#save input').removeAttr('disabled');
                }
            });
        }

        function pingServer() {
            $.post(PING_URL, {'chat': chat});
            pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
        }

        function disconnect() {
            if (confirm('Are you sure you want to disconnect?')) {
                $.ajax(QUIT_URL, {'type': 'POST', data: {'chat': chat}});
                clearChat();
                if (chat_meta.type=='unsaved' || chat_meta.type=='saved') {
                    $("#disconnectButton").unbind( "click" );
                    $("#disconnectButton").removeAttr("disabled");
                    $("#disconnectButton").text("New chat" );
                    $('#disconnectButton').click(reconnect);
                }
            }
        }

        function reconnect() {
            window.location.replace(document.location.origin + "/chat");
        }

        function clearChat() {
            chatState = 'inactive';
            if (pingInterval) {
                window.clearTimeout(pingInterval);
            }
            $('input[name="chat"]').val(chat);
            chat = null;
            $('input, select, button').attr('disabled', 'disabled');
            $('#userList > ul').empty();
            setSidebar(null);
            document.title = ORIGINAL_TITLE;
        }

        // Sidebars

        function setSidebar(sidebar) {
            if (currentSidebar) {
                $('#'+currentSidebar).hide();
            } else {
                $(document.body).addClass('withSidebar');
            }
            // Null to remove sidebar.
            if (sidebar) {
                $('#'+sidebar).show();
            } else {
                $(document.body).removeClass('withSidebar');
            }
            currentSidebar = sidebar;
        }

        function closeSettings() {
            if ($(document.body).hasClass('mobile')) {
                setSidebar(null);
            } else {
                setSidebar('userList');
            }
        }

        // User list
        var holdingList = $("<ul />");

        function generateUserlist(users, listElement) {
            for (var i=0; i<users.length; i++) {
                var currentUser = users[i];
                // Get or create a list item.
                var listItem = $(holdingList).find('#user'+currentUser.meta.counter);
                if (listItem.length === 0) {
                    listItem = $('<li />').attr('id', 'user'+currentUser.meta.counter);
                    listItem.click(showActionList);
                }
                // Name is a reserved word; this may or may not break stuff but whatever.
                listItem.css('color', '#'+currentUser.character.color).text(currentUser.character.name);
                listItem.removeClass().addClass(currentUser.meta.group);
                if (currentUser.meta.group == 'globalmod'){
                    globals.push(currentUser.meta.counter);
                }
                var currentGroup = GROUP_DESCRIPTIONS[currentUser.meta.group];
                var userTitle = currentGroup.title;
                if (currentGroup.description !== '') {
                    userTitle += ' - '+GROUP_DESCRIPTIONS[currentUser.meta.group].description;
                }
                listItem.attr('title', userTitle);
                if (currentUser.meta.counter==user.meta.counter) {
                    // Set self-related things here.
                    if (currentUser.meta.group=='silent') {
                        // Just been made silent.
                        $('#textInput, #controls button[type="submit"]').attr('disabled', 'disabled');
                    } else if (user.meta.group=='silent' && currentUser.meta.group!='silent') {
                        // No longer silent.
                        $('input, select, button').removeAttr('disabled');
                    }
                    user.meta.group = currentUser.meta.group;
                    if ($.inArray(user.meta.group, MOD_GROUPS)==-1) {
                        $(document.body).removeClass('modPowers');
                    } else {
                        $(document.body).addClass('modPowers');
                    }
                    if (GROUP_RANKS[user.meta.group] >= GROUP_RANKS.mod) {
                        $(document.body).addClass('pwbPowers');
                    } else {
                        $(document.body).removeClass('pwbPowers');
                    }
                    listItem.addClass('self').append(' (you)');
                }
                var userspan = $("<span/>").addClass("userID").text(GROUP_DESCRIPTIONS[currentUser.meta.group].shorthand + " - user" + currentUser.meta.counter);
                listItem.append(userspan); 
                listItem.removeData().data(currentUser).appendTo(listElement);
            }
        }

        function showActionList() {
            $('#actionList').remove();
            // Hide if already shown.
            if (this!=actionListUser) {
                var actionList = $('<ul />').attr('id', 'actionList');
                var userData = $(this).data();
                if (userData.meta.counter==highlightUser) {
                    $('<li />').text('Clear highlight').appendTo(actionList).click(function() { highlightPosts(null, 1); });
                } else {
                    $('<li />').text('Highlight posts').appendTo(actionList).click(function() { highlightPosts(userData.meta.counter, 1); });
                }
                // Mod actions. You can only do these if you're (a) a mod, and (b) higher than the person you're doing it to.
                if ($.inArray(user.meta.group, MOD_GROUPS)!=-1 && GROUP_RANKS[user.meta.group]>=GROUP_RANKS[userData.meta.group]) {
                    for (var i=0; i<MOD_GROUPS.length; i++) {
                        if (userData.meta.group!=MOD_GROUPS[i] && GROUP_RANKS[user.meta.group]>=GROUP_RANKS[MOD_GROUPS[i]]) {
                            var command = $('<li />').text('Make '+GROUP_DESCRIPTIONS[MOD_GROUPS[i]].title);
                            command.appendTo(actionList);
                            command.data({ group: MOD_GROUPS[i] });
                            command.click(setUserGroup);
                        }
                    }
                    if ($.inArray(userData.meta.group, MOD_GROUPS)!=-1) {
                        $('<li />').text('Unmod').appendTo(actionList).data({ group: 'user' }).click(setUserGroup);
                    }
                    if (userData.meta.group=='silent') {
                        $('<li />').text('Unsilence').appendTo(actionList).data({ group: 'user' }).click(setUserGroup);
                    } else {
                        $('<li />').text('Silence').appendTo(actionList).data({ group: 'silent' }).click(setUserGroup);
                    }
                    $('<li />').text('Kick').appendTo(actionList).data({ action: 'kick' }).click(userAction);
                    $('<li />').text('IP Ban').appendTo(actionList).data({ action: 'ip_ban' }).click(userAction);
                }
                // Global mod actions. You can only do these if you're a global mod.
                if (user.meta.group=="globalmod") {
                    $('<li />').text('Look up IP').appendTo(actionList).click(ipLookup);
                }
                $(actionList).appendTo(this);
                actionListUser = this;
            } else {
                actionListUser = null;
            }
        }

        function setUserGroup() {
            var counter = $(this).parent().parent().data().meta.counter;
            var group = $(this).data().group;
            if (counter!=user.meta.counter || confirm('You are about to unmod yourself. Are you sure you want to do this?')) {
                $.post(POST_URL,{'chat': chat, 'set_group': group, 'counter': counter});
            }
        }

        function userAction() {
            var counter = $(this).parent().parent().data().meta.counter;
            var action = $(this).data().action;
            var actionData = {'chat': chat, 'user_action': action, 'counter': counter};
            if (action=='ip_ban') {
                var reason = prompt('Please enter a reason for this ban (spamming, not following rules, etc.):');
                if (reason === null) {
                    return;
                } else if (reason !== "") {
                    actionData.reason = reason;
                }
            }
            if (counter!=user.meta.counter || confirm('You are about to kick and/or ban yourself. Are you sure you want to do this?')) {
                $.post(POST_URL, actionData);
            }
        }

        function ipLookup() {
            var counter = $(this).parent().parent().data().meta.counter;
            $.post("/chat_ajax/ip_lookup", { 'chat': chat, 'counter': counter, }, function(ip) {
                addLine({counter: "-1", color: "000000", line: "[SYSTEM] user" +counter+ "'s IP: " + ip});
            });
        }

        function highlightPosts(counter, byUser) {
            if (byUser == 1) {
                $.post("/chat_ajax/highlight", {chat: chat, counter: counter});
            }
            $('.highlight').removeClass('highlight');
            if (counter !== null) {
                $('.user'+counter).addClass('highlight');
            }
            highlightUser = counter;
        }

        /* Browser compatibility for visibilityChange */
        var hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") {
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.mozHidden !== "undefined") {
            hidden = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        // Event listeners

        function updateChatPreview(){
            var textPreview = $('#textInput').val();

            if (textPreview.substr(0,1)=='/' && textPreview.substr(0,4)!=='/ooc' && textPreview.substr(0,3)!=='/ic' && textPreview.substr(0,3)!=='/me') {
                textPreview = jQuery.trim(textPreview.substr(1));
            } else {
                textPreview = applyQuirks(jQuery.trim(textPreview));
            }

            if (textPreview.substr(0,4)=='/ooc') {
                textPreview = jQuery.trim(textPreview.substr(4));
                textPreview = "(( "+textPreview+" ))";
            } else if (oocset == 1) {
                textPreview = "(( "+textPreview+" ))";
            }

            if (textPreview.length>0) {
                startedTyping();
                $('#preview').text(textPreview);
            } else {
                stoppedTyping();
                $('#preview').html('&nbsp;');
            }
            $('#conversation').css('bottom',($('#controls').height()+10)+'px');
            return textPreview.length !== 0;
        }

        $('#textInput').change(updateChatPreview).keyup(updateChatPreview).change();

        $('#hidePreview').click(function() {
            if (previewHidden) {
                $('#preview').show();
                $(this).text("[hide]");
            } else {
                $('#preview').hide();
                $(this).text("[show]");
            }
            $('#conversation').css('bottom',($('#controls').height()+10)+'px');
            previewHidden = !previewHidden;
            return false;
        });

        if (typeof document.addEventListener!=="undefined" && typeof hidden!=="undefined") {
            document.addEventListener(visibilityChange, function() {
                if (chatState=='chat' && document[hidden] === false) {
                    if (navigator.userAgent.indexOf('Chrome')!=-1) {
                        // You can't change document.title here in Chrome. #googlehatesyou
                        window.setTimeout(function() {
                            document.title = 'Chat - '+ORIGINAL_TITLE;
                        }, 200);
                    } else {
                        document.title = 'Chat - '+ORIGINAL_TITLE;
                    }
                }
                // Obnoxiousness limitation.
                if (document[hidden] === true) {
                    $("#backgroundAudio")[0].pause();
                } else {
                    $("#backgroundAudio")[0].play();
                }
            }, false);
        }

        $('#controls').submit(function() {
            if($("#statusInput").is(":focus")){
                $('#statusButton').click();
                return false;
            }
            if (updateChatPreview()) {

                if (!$('#textInput').val()) {
                    return false;
                }

                if (jQuery.trim($('#textInput').val()) == '/usr') {
                    $.post("/chat_ajax/getSession", function(session) {
                        addLine({counter:"-2",color:"000000",line:"[SYSTEM] Your cookie: " + session});
                    });
                    $('#textInput').val('');
                } else if ($('#textInput').val() !== '') {
                    if (pingInterval) {
                        window.clearTimeout(pingInterval);
                    }
                    $.post(POST_URL,{'chat': chat, 'line': $('#preview').text()}); // todo: check for for error
                    pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
                    $('#textInput').val('');
                    updateChatPreview();
                }
            }
            return false;
        });

        $('#disconnectButton').click(disconnect);

        $('#idleButton').click(function() {
            if (userState=='idle') {
                newState = 'online';
            } else {
                newState = 'idle';
            }
            $.post(POST_URL, {'chat': chat, 'state': newState}, function(data) {
                userState = newState;
            });
        });

        $('#settingsButton').click(function() {
            setSidebar('settings');
        });

        $('#settings').submit(function() {
            // Trim everything first
            formInputs = $('#settings').find('input, select');
            for (i=0; i<formInputs.length; i++) {
                formInputs[i].value = jQuery.trim(formInputs[i].value);
            }
            if ($('input[name="name"]').val() === "") {
                alert("You can't chat with a blank name!");
            } else if ($('input[name="color"]').val().match(/^[0-9a-fA-F]{6}$/) === null) {
                alert("You entered an invalid hex code. Try using the color picker.");
            } else {
                var formData = $(this).serializeArray();
                formData.push({ name: 'chat', value: chat });
                $.post(SAVE_URL, formData, function(data) {
                    $('#preview').css('color', '#'+$('input[name="color"]').val());
                    var formInputs = $('#settings').find('input, select');
                    for (i=0; i<formInputs.length; i++) {
                        if (formInputs[i].name!="quirk_from" && formInputs[i].name!="quirk_to") {
                            user.character[formInputs[i].name] = formInputs[i].value;
                        }
                    }
                    user.character.replacements = [];
                    var replacementsFrom = $('#settings').find('input[name="quirk_from"]');
                    var replacementsTo = $('#settings').find('input[name="quirk_to"]');
                    for (i=0; i<replacementsFrom.length; i++) {
                        if (replacementsFrom[i].value !== "" && replacementsFrom[i].value!=replacementsTo[i].value) {
                            user.character.replacements.push([replacementsFrom[i].value, replacementsTo[i].value]);
                        }
                    }
                    closeSettings();
                });
            }
            return false;
        });

        $('#settingsCancelButton').click(function() {
            closeSettings();
        });

        $('.metatog').click(function() {
            var data = {'chat': chat, 'meta_change': ''};
            // Convert to integer then string.
            if ($(this).hasClass("active")) {
                data[this.id] = '0';
                $(this).removeClass('active');
            } else {
                data[this.id] = '1';
                $(this).addClass('active');
            }
            $.post(POST_URL, data);
        });

        $('#topicButton').click(function() {
            if ($.inArray(user.meta.group, MOD_GROUPS)!=-1) {
                var new_topic = prompt('Please enter a new topic for the chat:');
                if (new_topic !== null) {
                    $.post(POST_URL,{'chat': chat, 'topic': new_topic.substr(0, 1500)});
                }
            }
        });

        /* Charat stuff */

        $('#bgButton').click(function() {
            if ($.inArray(user.meta.group, MOD_GROUPS)!=-1) {
                var new_bg = prompt('Please enter a new background URL for the chat:');
                if (new_bg !== null) {
                    $.post(POST_URL,{'chat': chat, 'background': new_bg});
                }
            }
        });

        $('#audioButton').click(function() {
            if ($.inArray(user.meta.group, MOD_GROUPS)!=-1) {
                var new_audio = prompt('Please enter a audio URL for the chat:');
                if (new_audio !== null) {
                    $.post(POST_URL,{'chat': chat, 'audio': new_audio});
                } 
            }
        });

        /* End Charat */

        // Activate mobile mode on small screens
        if (navigator.userAgent.indexOf('Android')!=-1 || navigator.userAgent.indexOf('iPhone')!=-1 || window.innerWidth<=500) {
            $(document.body).addClass('mobile');
            $('.sidebar .close').click(function() {
                setSidebar(null);
            }).show();
            $('#userListButton').click(function() {
                setSidebar('userList');
            }).show();
        }

        window.onbeforeunload = function (e) {
            if (disnot == 1) {
                if (chatState=='chat') {
                    if (typeof e!="undefined") {
                        e.preventDefault();
                    }
                    return 'Are you sure you want to leave? Your chat is still running.';
                }
            localStorage.setItem(chat+"disnot",1);
            } else {
                localStorage.setItem(chat+"disnot",0);
            }
        };

        $(window).unload(function() {
            if (chatState=='chat') {
                $.ajax(QUIT_URL, {'type': 'POST', data: {'chat': chat}, 'async': false});
            } else if (chatState=='search') {
                $.ajax(SEARCH_QUIT_URL, {'type': 'POST', 'async': false});
            }
        });

        // Initialisation

        if (chat === null) {
            chatState = 'search';
            document.title = 'Searching - '+ORIGINAL_TITLE;
            conversation.addClass('search');
            runSearch();
        } else {
            startChat();
        }

    }

    $('#conversation').scrollTop($('#conversation')[0].scrollHeight);
    $("#textInput").focus();

    $('#saveLog').click(function() {
        if (confirm('Are you sure you want to save the log and disconnect?')) {
            $.ajax(QUIT_URL, {'type': 'POST', data: {'chat': chat}});
            clearChat();
            $('#save input').removeAttr('disabled');
            $('#saveLink').click();
        }
    });


    $(document).on('click', '.spoiler', function() {
        if ($(this).css('opacity') == '0') {
            $(this).css('opacity','1');
        } else {
            $(this).css('opacity','0');
        }
    });

    $('#modSettings').click(function() {
        if ($(".modPowers").length){
            if ($('#menu.showmenu').length) {
                $("#menu").removeClass('showmenu');
            } else {
                $("#menu").addClass('showmenu');
            }
        }
    });

    /* WebSocket stuff */

    // is there a better way of doing this
    // idk

    function startedTyping() {
        if (ws === null || ws.readyState !== 1) {return;} // Don't even bother doing anything if we have no socket or if it's not ready.
        window.clearTimeout(typing_timeout);
        if ($('#textInput').val().length < 5 || $('#textInput').val().length % 5 === 0) {
            typing = true;
            ws.send(JSON.stringify({a: 'typing', c: user.meta.counter}));
        }
        typing_timeout = window.setTimeout(stoppedTyping, 2000);
    }

    function stoppedTyping() {
        window.clearTimeout(typing_timeout);
        if (ws === null || ws.readyState !== 1) {return;}
        typing = false;
        ws.send(JSON.stringify({a: 'stopped_typing', c: user.meta.counter}));
    }

    function typingNotifications() {
        if (counterstyping.length === 0) {
            $("#istyping").animate({opacity: 0});
            window.setTimeout(typingNotifications, 500);
            return;
        } else if (chatState == "inactive") {
            return;
        } else {
            $("#istyping").animate({opacity: 1});
        }

        if (!$("#istyping").length) {
            $('<p>').addClass("message").attr('title', 'system').css('color', '#000000').attr('id', 'istyping').html("Someone is typing...").appendTo("#conversation");
        } else {
            $("#istyping").text("Someone is typing...");
        }
        window.setTimeout(typingNotifications, 500);
    }

    window.setTimeout(typingNotifications, 500);

    if (window.WebSocket) {
        function start(reason){
            if (reason == 'auto'){
                if (ws.readyState == 1){return;}
            }
            ws = new WebSocket('ws://'+location.host+"/live/"+chat);

            ws.onmessage = function(msg){
                message = JSON.parse(msg.data);
                //a = action
                //c = counter
                var wsaction = message.a;
                var wscounter = message.c;
                if (wsaction=="typing") {
                    if ($.inArray(wscounter, counterstyping) !== -1) {
                        window.clearTimeout(counterintervals[wscounter]);
                    } else {
                        counterstyping.push(wscounter);
                    }

                    counterintervals[wscounter] = window.setTimeout(function(){
                        removeItem(wscounter, counterstyping);
                    }, 8000);
                } else if (wsaction=="stopped_typing") {
                    removeItem(wscounter, counterstyping);
                    window.clearTimeout(counterintervals[wscounter]);
                }
            };

            ws.onclose = function(){
                if (chatState != 'inactive'){
                    setTimeout(start, 10000, 'auto');
                }
            };
        }
        start('manual');

    } else {
        //#nofun
    }

	if (Math.floor(Math.random()*413) === 0) {
        $("body > *").css("transform", "rotate(180deg)");
    }

});

