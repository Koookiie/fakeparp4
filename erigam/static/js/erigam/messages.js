define("erigam/messages", ['jquery', 'erigam/settings', 'erigam/bbcode'], function($, settings, bbcode) {
	"use strict";

	var conversation = $('#conversation');

	return {
		at_bottom: function() {
			var current_scroll = conversation.scrollTop() + conversation.height();
			var max_scroll = conversation[0].scrollHeight;
			return max_scroll - current_scroll < 30;
		},
		scroll_bottom: function(bottom) {
			conversation.scrollTop(conversation[0].scrollHeight);
		},
		add: function(msg) {
			var message;
			var msgClass;
			var at_bottom = this.at_bottom();

			if (msg.counter == -1) {
				msgClass = 'system';
			} else {
				msgClass = 'user'+msg.counter;
			}

			if (msg.acronym) msg.text = msg.acronym + ": " + msg.text;

			if (settings.get("bbcodeon") == 1) {
				message = bbcode.encode(msg.text, msg.admin);
			} else {
				message = bbcode.remove(msg.text);
			}

			var mp = $('<p>').addClass(msgClass).addClass("message").attr('title', msgClass).css('color', '#'+msg.color);
			mp.append($("<span>").addClass("text").html(message));

			// Timestamp
			var date = new Date(msg.timestamp * 1000);
			var timestamp = $("<span>").addClass("timestamp").text(date.toLocaleTimeString()).appendTo(mp);
			if (!settings.get('timestamp')) timestamp.css("display", "none");

			// Highlighting
			if (settings.get("highlight", true) == msg.counter) mp.addClass('highlight');

			mp.appendTo(conversation);

			// Hide system
			if (settings.get("sysnot") && msgClass == 'system') $('.system').hide();

			if (at_bottom) this.scroll_bottom();

			return mp;
		}
	};
});
