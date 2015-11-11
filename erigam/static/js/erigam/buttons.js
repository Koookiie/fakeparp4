define("erigam/buttons", ['jquery', 'erigam/settings', 'erigam/bbcode', 'erigam/helpers'], function($, settings, bbcode, helpers) {
	"use strict";

	var STATE_URL = "/chat_ajax/state";
	var FLAG_URL = "/chat_ajax/flag";

	return {
		init_chat: function() {
			/* Autosilence, NSFW, Publicity buttons */

			$('.metatog').click(function() {
				var data = {'chat': settings.get("chat", true)};
				// Convert to integer then string.
				if ($(this).hasClass("active")) {
					data[this.id] = '0';
					$(this).removeClass('active');
				} else {
					data[this.id] = '1';
					$(this).addClass('active');
				}

				$.post(FLAG_URL, data);
			});

			// Setting toggles
			$('.sysnot').click(function() {
				if (this.checked) {
					settings.set("sysnot", 1);
					$('.system').hide();
					$('.globalann').hide();
				} else {
					settings.set("sysnot", 0);
					$('.system').show();
					$('.globalann').show();
				}

				require(['erigam/messages'], function(messages) {
					messages.scroll_bottom();
				});
			});

			$('.bbcodeon').click(function() {
				var x = this.checked ? settings.set("bbcodeon", 1) : settings.set("bbcodeon", 0);
			});

			$('.audioset').click(function() {
				var x = this.checked ? settings.set("audioset", 1) : settings.set("audioset", 0);
				helpers.update_meta();
			});

			$('.bgset').click(function() {
				var x = this.checked ? settings.set("bgset", 1) : settings.set("bgset", 0);
				helpers.update_meta();
			});
		
			$("input.ttsset").prop("checked", settings.get("tts") ? true : false);

			// Idle / Online
			$('#idleButton').click(function() {
				var state = settings.get("state", true);
				var new_state = (state == 'idle' ? 'online' : 'idle');

				$.post(STATE_URL, {'chat': settings.get("chat", true), 'state': new_state}, function(data) {
					settings.set("state", new_state);
				});
			});

			$('#conversation .text').each(function() {
				var admin = $(this).hasClass("admin");
				var line = settings.get("bbcodeon") ? bbcode.raw_encode($(this).html(), admin) : bbcode.remove($(this).html());

				$(this).html(line);
			});

			if ($('#topic').length !== 0) {
				var text = settings.get("bbcodeon") ? bbcode.raw_encode($('#topic').html()) : bbcode.remove($('#topic').html());

				$('#topic').html(text);
			}
		}
	};
});