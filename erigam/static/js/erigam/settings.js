define("erigam/settings", ['jquery', 'erigam/helpers', 'erigam/bbcode'], function($, helpers, bbcode) {
	"use strict";

	var settings = {
		chat: "",
		sysnot: 0,
		bbcodeon: 1,
		audioset: 0,
		bgset: 0,
		tts: 0,
		timestamps: 0
	};
	var temp_storage = {};

	return {
		debug: function() {
			console.groupCollapsed("%c[DEBUG]%c %s", 'color: red', 'color: black', "Settings");
			console.log("Settings", settings);
			console.log("Temporary", temp_storage);
			console.log("Chat", settings.chat);
			console.groupEnd();
		},
		load: function (chat, callback) {
			var self = this;

			$(".stoptions").show();

			// Set and load defaults from local storage.
			if (helpers.check_localstorage()) {
				for (var key in settings) {
					if (!localStorage.getItem(chat + key)) localStorage.setItem(chat + key, settings[key]);
					settings[key] = localStorage.getItem(chat + key);
				}
			}

			settings.chat = chat;

			// Handle the loaded settings

			if (self.get("sysnot")) {
				$('.sysnot').attr('checked', 'checked');
				$('.system').hide();
				$('.globalann').hide();
			}

			if (self.get("bbcodeon")) $('.bbcodeon').attr('checked', 'checked');
			if (self.get("audioset")) $('.audioset').attr('checked', 'checked');
			if (self.get("bgset")) $('.bgset').attr('checked', 'checked');
			if (!self.get("timestamps")) {
				$(".timestamp").css("display", "none");
			}

			if (callback && typeof callback === "function") callback();
		},

		set: function(key, value) {
			if (settings[key]) {
				if (helpers.check_localstorage()) localStorage.setItem(settings.chat + key, value);
				settings[key] = value;
			} else {
				temp_storage[key] = value;
			}
		},

		get: function(key, raw) {
			var value;
			if (window.debug) this.debug();

			if (settings[key]) {
				value = settings[key];
			} else {
				value = temp_storage[key];
			}

			if (raw === true) return value;
			return value == "1";
		}
	};
});
