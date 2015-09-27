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
		}
	};
});
