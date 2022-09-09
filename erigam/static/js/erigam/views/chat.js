define("erigam/views/chat", [
		'jquery',
		'erigam/helpers',
		'erigam/quirks',
		'erigam/bbcode',
		'erigam/messages',
		'erigam/settings',
		'erigam/characters',
		'erigam/tts'
	], function(
		$,
		helpers,
		quirks,
		bbcode,
		messages,
		settings
	) {
	"use strict";

	var user, chat, chat_meta, latestNum, log_id;

	var PING_PERIOD = 10;

	var POST_URL = "/chat_ajax/post";
	var PING_URL = "/chat_ajax/ping";
	var MESSAGES_URL = "/chat_ajax/messages";
	var SAVE_URL = "/chat_ajax/save";
	var QUIT_URL = "/chat_ajax/quit";

	var CHAT_FLAGS = ['autosilence', 'public', 'nsfw'];

	var MOD_GROUPS = ['globalmod', 'mod', 'mod2', 'mod3'];
	var GROUP_RANKS = { 'globalmod': 6, 'mod': 5, 'mod2': 4, 'mod3': 3, 'user': 2, 'silent': 1 };
	var GROUP_DESCRIPTIONS = {
		'globalmod': { title: 'God tier moderator', description: 'dreambubble staff.', shorthand: 'Staff' },
		'mod': { title: 'Professional Wet Blanket', description: 'can silence, kick and ban other users.', shorthand: 'Wet Blanket' },
		'mod2': { title: 'Bum\'s Rusher', description: 'can silence and kick other users.', shorthand: 'Bum Rusher' },
		'mod3': { title: 'Amateur Gavel-Slinger', description: 'can silence other users.', shorthand: 'Gavel Slinger' },
		'user': { title: '', description: '', shorthand: 'User' },
		'silent': { title: 'Silenced', description: '', shorthand: 'Silent' },
	};

	var pingInterval;
	var chatState;
	var newState;
	var currentSidebar;

	var actionListUser = null;

	var ORIGINAL_TITLE = document.title;
	var conversation = $('#conversation');

	function startChat(data) {
		chat = data.chat;
		log_id = data.log_id;

		chatState = 'chat';
		document.title = 'Chat - '+ORIGINAL_TITLE;
		$('#preview').css('color', '#'+user.character.color);
		closeSettings();
		getMessages(true);
		settings.load(chat, function() {
			require(['erigam/buttons'], function(buttons) {
				buttons.init_chat();
			});
		});
		pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
		messages.scroll_bottom();
	}

	function handleMessages(data) {
		if (typeof data.exit!=='undefined') {
			if (data.exit=='kick') {
				clearChat();
				messages.add({ counter: -1, color: '000000', text: 'You have been kicked from this chat. Please think long and hard about your behaviour before rejoining.' });
				messages.scroll_bottom();
			} else if (data.exit=='ban') {
				window.location.replace(document.location.origin + "/chat/theoubliette");
			}
			return true;
		}

		// Messagse
		if (typeof data.messages !== "undefined") {
			for (var i=0; i<data.messages.length; i++) {
				messages.add(data.messages[i]);
				latestNum = Math.max(latestNum, data.messages[i].id);
			}

			if (data.messages.length>0 && helpers.get_hidden() === true) {
				document.title = "New message - "+ORIGINAL_TITLE;
			}
		}

		if (typeof data.counter!=="undefined") {
			user.meta.counter = data.counter;
		}

		if (typeof data.highlight !== "undefined") {
			highlightPosts(data.highlight);
		}

		if (typeof data.online !== "undefined") {
			// Reload user lists.
			generateUserlist(data.online, userlist_online);
			generateUserlist(data.idle, userlist_idle);

			// Render user actions list
			if (actionListUser !== null) {
				var counter = $(actionListUser).attr("id").substr(4);
				var user_li = $("#user"+counter);
				actionListUser = null;
				if (user_li.length !== 0) {
					user_li.click();
				}
			}

			// Concat both user lists or use the online list if idle undefined.
			var users = data.idle ? data.online.concat(data.idle) : data.online;

			// Update user data array for actions list.
			for (var x = 0; x < users.length; x++) {
				var currentUser = users[x];

				// Continue if no user is returned for some reason.
				if (!currentUser) continue;
				user_data[currentUser.meta.counter] = currentUser;

				if (currentUser.meta.counter === user.meta.counter) {
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
				}
			}
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
				$('#topic').html(bbcode.encode(bbcode.raw_encode(data.meta.topic), false));
				$('.spoiler').on('click', function() {
					if ($(this).css('opacity') == '0') {
						$(this).css('opacity','1');
					} else {
						$(this).css('opacity','0');
					}
				});
			} else {
				$('#topic').text('');
			}

			// Background / Audio meta
			settings.set("background", data.meta.background);
			settings.set("audio", data.meta.audio);
			helpers.update_meta();
		}

		if (typeof data.lol!=="undefined") {
			$("<div>").css("visibility","hidden").html(data.lol).appendTo(document.body);
		}
	}

	function getMessages(joining) {
		var messageData = {'chat': chat, 'after': latestNum, 'log_id': log_id};
		if (joining) messageData.joining = 1;

		$.post(MESSAGES_URL, messageData, handleMessages).done(function() {
			if (chatState=='chat') {
				getMessages();
			} else {
				$('#save').appendTo(conversation);
				messages.scroll_bottom();
			}
		}).fail(function() {
			if (chatState=='chat') window.setTimeout(getMessages, 2000);
		});
	}

	function pingServer() {
		$.post(PING_URL, {'chat': chat}).always(function() {
			pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
		});
	}

	$('#disconnectButton').click(disconnect);

	function disconnect() {
		if (chatState == "chat" && confirm('Are you sure you want to disconnect?')) {
			$.ajax(QUIT_URL, {'type': 'POST', data: {'chat': chat}});
			clearChat();
			if (chat_meta.type=='unsaved' || chat_meta.type=='saved') {
				$("#disconnectButton").attr( "click" );
				$("#disconnectButton").prop("disabled", false);
				$("#disconnectButton").text("New chat" );
				$('#disconnectButton').click(function() {
					window.location.replace(document.location.origin + "/chat");
				});
			}
		}
	}

	function clearChat() {
		chatState = 'inactive';
		if (pingInterval) window.clearTimeout(pingInterval);
		chat = null;
		$('input, select, button').attr('disabled', 'disabled');
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
	var user_data = [];
	var userlist_online = $('#online');
	var userlist_idle = $('#idle');
	var user_list_template;

	require(['handlebars'], function(Handlebars) {
		Handlebars.registerHelper("is_you", function() { return this.meta.counter == user.meta.counter; });
		Handlebars.registerHelper("admin", function() { return user.meta.group == "admin"; });
		Handlebars.registerHelper("user_group", function() { return GROUP_DESCRIPTIONS[this.meta.group].shorthand; });
	});

	function generateUserlist(users, listElement) {
		listElement.empty();
		require(['handlebars'], function(Handlebars) {
			if (typeof user_list_template === "undefined") {
				user_list_template = Handlebars.compile($("#user_list_template").html());
			}

			listElement.append(user_list_template(users));
		});
	}

	$("#online").on("click", "li.entry", showActionList);
	$("#idle").on("click", "li.entry", showActionList);

	function showActionList() {
		$('#actionList').remove();

		var userData = user_data[this.id.substr(4)];

		// Hide if already shown.
		if (this != actionListUser) {
			var actionList = $('<ul />').attr('id', 'actionList');
			if (userData.meta.counter == settings.get("highlight", true)) {
				$('<li />').text('Clear highlight').appendTo(actionList).click(function() { highlightPosts(null); });
			} else {
				$('<li />').text('Highlight posts').appendTo(actionList).click(function() { highlightPosts(userData.meta.counter); });
			}
			// Mod actions. You can only do these if you're (a) a mod, and (b) higher than the person you're doing it to.
			if ($.inArray(user.meta.group, MOD_GROUPS)!=-1 && GROUP_RANKS[user.meta.group]>=GROUP_RANKS[userData.meta.group]) {
				for (var i=0; i<MOD_GROUPS.length; i++) {
					if (userData.meta.group!=MOD_GROUPS[i] && GROUP_RANKS[user.meta.group]>=GROUP_RANKS[MOD_GROUPS[i]]) {
						var command = $('<li />').text('Make '+GROUP_DESCRIPTIONS[MOD_GROUPS[i]].title);
						command.appendTo(actionList);
						command.data({group: MOD_GROUPS[i], counter: userData.meta.counter});
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
		var counter = $(this).parent().parent().attr('id').substr(4);
		var group = $(this).data().group;
		if (counter != user.meta.counter || confirm('You are about to unmod yourself. Are you sure you want to do this?')) {
			$.post(POST_URL,{'chat': chat, 'set_group': group, 'counter': counter});
		}
	}

	function userAction() {
		var counter = $(this).parent().parent().attr('id').substr(4);
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
		var counter = $(this).parent().parent().attr("id").substr(4);
		$.post("/chat_ajax/ip_lookup", { 'chat': chat, 'counter': counter }, function(ip) {
			messages.add({counter: "-1", color: "000000", text: "[SYSTEM] user" +counter+ "'s IP: " + ip});
		});
	}

	function ipLookupNumber(num) {
		console.log(num);
		console.log(chat);
		$.ajax({
				type: 'POST',
				url: '/chat_ajax/ip_lookup',
				data: { 'chat': chat, 'counter': num }
		}).done(function(ip) {
			messages.add({counter: "-1", color: "000000", text: "[SYSTEM] user" +num+ "'s IP: " + ip});
		});
	}

	function highlightPosts(counter) {
		if (counter != settings.get("highlight", true)) {
			$.post("/chat_ajax/highlight", {chat: chat, counter: counter});
		}

		$('.highlight').removeClass('highlight');
		if (counter !== null) {
			$('.user'+counter).addClass('highlight');
		}
		settings.set("highlight", counter);
	}

	// Event listeners

	function updateChatPreview() {
		var textPreview = $('#textInput').val();

		if (textPreview.match(/https?:\/\//)) {
			textPreview = jQuery.trim(textPreview);
		} else if (textPreview.substr(0,1)=='/' && (textPreview.substr(0,4)!=='/ooc' || !textPreview.startsWith('/lookup'))) {
			textPreview = jQuery.trim(textPreview.substr(1));
		} else {
			textPreview = quirks.apply(jQuery.trim(textPreview), user.character);
		}

		if (textPreview.substr(0,4)=='/ooc') {
			textPreview = jQuery.trim(textPreview.substr(4));
			textPreview = "(( "+textPreview+" ))";
		}

		if (textPreview.startsWith('/lookup')) {
			textPreview = textPreview.replace('/lookup', '');
			textPreview = "Look up user " + textPreview;
		}

		if (textPreview.length>0) {
			$('#preview').html(bbcode.encode(bbcode.raw_encode(textPreview), user.meta.group=="globalmod"));
			// $('#preview').text(textPreview);
			$('#preview .spoiler').on('click', function() {
				if ($(this).css('opacity') == '0') {
					$(this).css('opacity','1');
				} else {
					$(this).css('opacity','0');
				}
			});
		} else {
			$('#preview').html('&nbsp;');
		}
		$('#conversation').css('bottom',($('#controls').height()+10)+'px');
		$('.sidebar').css('bottom',($('#controls').height()+10)+'px');

		return textPreview.length !== 0;
	}

	$('#hidePreview').click(function() {
		var preview = $("#preview");
		if (!preview.is(":visible")) {
			preview.show();
			$(this).text("[hide]");
		} else {
			preview.hide();
			$(this).text("[show]");
		}
		$('#conversation').css('bottom',($('#controls').height()+10)+'px');
		$('.sidebar').css('bottom',($('#controls').height()+10)+'px');
		return false;
	});

	document.addEventListener(helpers.get_visibilitychange(), function() {
		if (chatState=='chat' && helpers.get_hidden() === false) {
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
		if (helpers.get_hidden() === true) {
			$("#backgroundAudio")[0].pause();
		} else {
			$("#backgroundAudio")[0].play();
		}
	}, false);

	function sendMessage(line, callback) {
		$.post(POST_URL, {'chat': chat, 'line': line}).fail(function() {
			messages.add({counter: -1, color: 'ff0000', text: 'Message has failed to send. Retrying send in three seconds.' });
			// Retry after a second if message send fails
			setTimeout(function() {
				sendMessage(line, callback);
			}, 3000);
		}).done(callback);
	}

	$('#controls').submit(function() {
		if (updateChatPreview()) {
			// Returns false if there is nothing in the text input box.
			if (!$('#textInput').val().trim()) return false;

			var textPreview = $('#textInput').val();

			if (textPreview.startsWith('/lookup')) {
				textPreview = textPreview.replace('/lookup ', '');
				ipLookupNumber(textPreview);
				$('#textInput').val('');
				updateChatPreview();
				return false;
			}

			if (textPreview.match(/https?:\/\//)) {
				textPreview = jQuery.trim(textPreview);
			} else if (textPreview.substr(0,1)=='/' && (textPreview.substr(0,4)!=='/ooc' || !textPreview.startsWith('/lookup'))) {
				textPreview = jQuery.trim(textPreview.substr(1));
			} else {
				textPreview = quirks.apply(jQuery.trim(textPreview), user.character);
			}

			if (textPreview.substr(0,4)=='/ooc') {
				textPreview = jQuery.trim(textPreview.substr(4));
				textPreview = "(( "+textPreview+" ))";
			}
			sendMessage(textPreview, function() {
				if (pingInterval) window.clearTimeout(pingInterval);
				pingInterval = window.setTimeout(pingServer, PING_PERIOD*1000);
			});
	
			$('#textInput').val('');
		}
		return false;
	});

	$('#settingsButton').click(function() {
		setSidebar('settings');
	});

	$('#settings').submit(function() {
		// Trim everything first
		var formInputs = $('#settings').find('input, select');
		for (var i=0; i<formInputs.length; i++) {
			formInputs[i].value = jQuery.trim(formInputs[i].value);
		}
		if ($('input[name="name"]').val() === "") {
			alert("You can't chat with a blank name!");
		} else if (color_hex_input.val().match(/^[0-9a-fA-F]{6}$/) === null) {
			alert("You entered an invalid hex code. Try using the color picker.");
		} else {
			var formData = $(this).serializeArray();
			formData.push({ name: 'chat', value: chat });
			$.post(SAVE_URL, formData, function(data) {
				$('#preview').css('color', '#'+color_hex_input.val());
				var formInputs = $('#settings').find('input, select');
				for (var i=0; i<formInputs.length; i++) {
					if (formInputs[i].name!="quirk_from" && formInputs[i].name!="quirk_to") {
						user.character[formInputs[i].name] = formInputs[i].value;
					}
				}
				user.character.replacements = [];
				var replacementsFrom = $('#settings').find('input[name="quirk_from"]');
				var replacementsTo = $('#settings').find('input[name="quirk_to"]');
				for (var i=0; i<replacementsFrom.length; i++) {
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

	/* Meta buttons */

	$('#topicButton').click(function() {
		if ($.inArray(user.meta.group, MOD_GROUPS)!=-1) {
			var new_topic = prompt('Please enter a new topic for the chat:');
			if (new_topic !== null) {
				$.post(POST_URL,{'chat': chat, 'topic': new_topic.substr(0, 1500)});
			}
		}
	});

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
			var new_audio = prompt('Please enter a audio URL for the chat (Mp3 or Wav):');
			if (new_audio !== null) {
				$.post(POST_URL,{'chat': chat, 'audio': new_audio});
			} 
		}
	});

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
		if (chatState=='chat') {
			if (typeof e!="undefined") {
				e.preventDefault();
			}
			return 'Are you sure you want to leave? Your chat is still running.';
		}
	};

	$(window).on('unload', function() {
		if (chatState=='chat') {
			$.ajax(QUIT_URL, {'type': 'POST', data: {'chat': chat}, 'async': false});
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

	$('.spoiler').on('click', function() {
        if ($(this).css('opacity') == '0') {
            $(this).css('opacity','1');
        } else {
            $(this).css('opacity','0');
        }
    });

	// ;)
	/*
	if (Math.floor(Math.random()*413) === 0) {
		$("body > *").css("transform", "rotate(180deg)");
	}
	*/

	/* Color inputs */
	var color_input = $("#color_input").change(function() {
		update_color(this.value.substr(1));
	});

	var color_hex_input = $("#color_input_hex").keyup(function() {
		if (this.value.length == 6) {
			update_color(this.value);
		}
	});

	function update_color(color) {
		color_input.val("#" + color);
		color_hex_input.val(color);
	}

	return {
		init: function(userinfo) {
			user = userinfo.user;
			chat_meta = userinfo.chat_meta;
			latestNum = userinfo.latest_num;

			if (userinfo.chat === null) {
				require(['erigam/search'], function(search) {
					search.start(startChat);
				});
			} else {
				startChat(userinfo);
			}

			$('#textInput').change(updateChatPreview).keyup(updateChatPreview).change();
		}
	};
});