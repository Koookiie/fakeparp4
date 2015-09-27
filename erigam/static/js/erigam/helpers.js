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
		linkify: function(inputText) {
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
