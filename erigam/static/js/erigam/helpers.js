define("erigam/helpers", ['jquery'], function($) {
	"use strict";

	var states = {};

	/* Browser compatibility for visibilityChange */
	var hidden, visibility_change;
	if (typeof document.hidden !== "undefined") {
		hidden = "hidden";
		visibility_change = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
		hidden = "mozHidden";
		visibility_change = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibility_change = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibility_change = "webkitvisibilitychange";
	}

	return {
		check_localstorage: function() {
			if (states.localstorage) return states.localstorage;

			try {
				localStorage.setItem('erigam', 'erigam');
				localStorage.removeItem('erigam');
				states.localstorage = true;
				return true;
			} catch (e) {
				states.localstorage = false;
				return false;
			}
		},
		html_encode: function(value) {
			return $('<div/>').text(value).html();
		},
		get_hidden: function() {
			if (document[hidden]) return document[hidden];

			return false;
		},
		get_visibilitychange: function() {
			return visibility_change;
		},
		update_meta: function() {
			var self = this;

			require(['erigam/settings'], function(settings) {
				var background = settings.get("background", true);
				var audio = settings.get("audio", true);

				if (settings.get('bgset') && background) {
					$("#conversation, #userList, #settings").css("background-color", "rgba(238, 238, 238, 0.5)");
					$("body").css('background-image', 'url("' + background + '")' );
				} else {
					$("#conversation, #userList, #settings").css("background-color", "rgb(238, 238, 238)");
					$("body").css('background-image', 'none');
				}

				if (settings.get('audioset') && audio) {
					// Only update the element if the URL has changed, otherwise it restarts it.
					if (audio != $("#backgroundAudio").attr('src')) {
						$("#backgroundAudio").attr('src', audio);
					}
					if (self.get_hidden()) {
						$("#backgroundAudio")[0].pause();
					}
				} else {
					$("#backgroundAudio").attr('src', '');
				}
			});
		}
	};
});
