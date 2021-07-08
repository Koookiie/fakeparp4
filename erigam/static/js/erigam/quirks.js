define("erigam/quirks", [], function() {
	"use strict";

	var dev_user_safe_bbcode = true;
	var dev_user_smart_quirk = false;
	var smart_quirk_mode = "script";
	var dev_user_smart_action_delimiter = "*";
	var dev_user_smart_dialogue_delimiter = "\"";

	return {
		apply: function(text, character) {
			
			if (dev_user_safe_bbcode == "true") {
				// as they are case sensitive, save URLs to array to survive this step
				var url_matches = text.match(/\[url=([^\]]+?)\]/gi);
				// save [raw] content so quirks don't apply to it at all; greedy so [raw] inside [raw] works
				var re = /\[raw\](.*)\[\/raw\]/gi;
				var raw_content = false;
				if (match = re.exec(text)) {
					raw_content = match[1];
				}
				text = text.replace(re, "\ufe5drawc\ufe5e");
				// selectively replace [BBCode] tag wrapping with unicode placeholders to do negative lookaheads without e.g. Terezi's quirk breaking
				// to be consistent, use same rules here that are used for BBCode removal, except recursive to catch stacked tags
				var re = /\[([A-Za-z]+)(=[^\]]+)?\]([\s\S]*?)\[(\/\1)\]/ig;
				while (re.exec(text)) {
					text = text.replace(re, "\ufe5d$1$2\ufe5e$3\ufe5d$4\ufe5e");
				}
				// also wrap [br] tags
				text = text.replace(/\[([bB][rR])\]/g, "\ufe5d$1\ufe5e");
			}
			
			// Break up text into chunks for smartquirking
			var text_chunks = new Array();
			
			if (dev_user_smart_quirk == "true") {
				if (smart_quirk_mode == "paragraph") { text_chunks = text.split(dev_user_smart_dialogue_delimiter); }
				if (smart_quirk_mode == "script") { text_chunks = text.split(dev_user_smart_action_delimiter); }
			} else {
				text_chunks[0] = text;
				smart_quirk_mode = "script";
			}
			
			var final_text = "";
			var chunks_number = text_chunks.length;
			for (var i = 0; i < chunks_number; i++) {
				// Apply case and quirk only between appropriate delimiters
				if ((i % 2 == 0 &&  smart_quirk_mode == "script") || (i % 2 !== 0 &&  smart_quirk_mode == "paragraph")) {
					// Case options.
					// ["case"] instead of .case because .case breaks some phones and stuff.
					switch (character["case"]) {
						case "lower":
							// Adaptive lower
							// Part 1: convert words to lower case if they have at least one lower case letter in them.
							text_chunks[i] = text_chunks[i].replace(/\w*[a-z]+\w*/g, function(str) { return str.toLowerCase(); });
							// Part 2: convert lone capital letters (eg. I) to lower case.
							// Find single capital letters with adjacent lower case ones, potentially looping in case they overlap.
							text_chunks[i] = text_chunks[i].replace(/(^|[a-z])(\W*[A-Z]\W*([a-z]|$))+/g, function(str) { return str.toLowerCase(); });
							// Part 3: also catch I... I [...], or other punctuation cases.
							text_chunks[i] = text_chunks[i].replace(/(^|[a-z])(\W*I[\W.,!?]*I\W*([a-z]|$))+/g, function(str) { return str.toLowerCase(); });
							break;
						case "upper":
							text_chunks[i] = text_chunks[i].toUpperCase();
							break;
						case "title":
							// Capitalise the first letter at the beginning, and after a word break if it's not an apostrophe.
							text_chunks[i] = text_chunks[i].toLowerCase().replace(/(^|[^']\b)\w/g, function(str) { return str.toUpperCase(); });
							break;
						case "inverted":
							// Lower case the first letter at the beginning, the first letter of each sentence, and lone Is.
							text_chunks[i] = text_chunks[i].toUpperCase().replace(/^.|[,.?!]\s+\w|\bI\b/g, function(str){ return str.toLowerCase(); });
							break;
						case "alternating":
							// Pick up pairs of letters (optionally with whitespace in between) and capitalise the first in each pair.
							text_chunks[i] = text_chunks[i].toLowerCase().replace(/(\w)\W*\w?/g, function(str, p1){ return str.replace(p1, p1.toUpperCase()); });
							break;
						case "alt-lines":
							text_chunks[i] = last_alternating_line ? text_chunks[i].toUpperCase() : text_chunks[i].toLowerCase();
							break;
						case "proper":
							// Capitalise the first letter at the beginning, the first letter of each sentence, and lone Is.
							text_chunks[i] = text_chunks[i].replace(/(^|[^.][.?!]\s+)(\w)/g, function(str, p1, p2){ return p1 + p2.toUpperCase(); });
							text_chunks[i] = text_chunks[i].replace(/\bi\b/g, "I");
							break;
						case "first-letter":
							// Part 1: same as adaptive lower.
							text_chunks[i] = text_chunks[i].replace(/\w*[a-z]+\w*/g, function(str) { return str.toLowerCase(); });
							text_chunks[i] = text_chunks[i].replace(/(^|[a-z])(\W*[A-Z]\W*([a-z]|$))+/g, function(str) { return str.toLowerCase(); });
							// Part 2: capitalise the first letter at the beginning and the first letter of each sentence.
							text_chunks[i] = text_chunks[i].replace(/(^|[^.][.?!]\s+)(\w)/g, function(str, p1, p2){ return p1 + p2.toUpperCase(); });
							break;
					}
					// Ordinary replacements. Escape any regex control characters before replacing.
					character.replacements.forEach(function(replacement) {
						RegExp.quote = function(str) {return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"); }
						if (dev_user_safe_bbcode == "true") { 
							// if safe_bbcode is on, exclude quirking within custom [brackets]
							var re = new RegExp("(?![^\ufe5d\ufe5e]*\ufe5e)" + RegExp.quote(replacement[0]) + "(?![^\ufe5d\ufe5e]*\ufe5e)", "g");
						} else {
							var re = new RegExp(RegExp.quote(replacement[0]), "g");
						}
						text_chunks[i] = text_chunks[i].replace(re, replacement[1]);
					});
					// Regex replacements
					/*
					character.regexes.forEach(function(replacement) {
						try {
							if (dev_user_safe_bbcode == "true") { 
								// if safe_bbcode is on, exclude quirking within custom [brackets]
								var re = new RegExp("(?![^\ufe5d\ufe5e]*\ufe5e)" + replacement[0] + "(?![^\ufe5d\ufe5e]*\ufe5e)", "g");
							} else {
								var re = new RegExp(replacement[0], "g");
							}
							// allow regex quirks to case matched element via $U and $L
							if (replacement[1] == "$U") {
								text_chunks[i] = text_chunks[i].replace(re, function(str) { return str.toUpperCase(); });
							} else if (replacement[1] == "$L") {
								text_chunks[i] = text_chunks[i].replace(re, function(str) { return str.toLowerCase(); });
							} else {
								text_chunks[i] = text_chunks[i].replace(re, replacement[1]);
							}
						} catch (e) {
							text_chunks[i] = "A young person stands in their bedroom. They don't know Regexp.";
							return;
						}
					});
					*/
					// Prefix and suffix, add in delimiter for quirked paragraph text, respect smart quirk wrap setting
					if (smart_quirk_mode == "paragraph" && text_chunks[i] != "") {
						if (dev_user_wrap_smart_quirks == "true") {
							final_text = final_text + dev_user_smart_dialogue_delimiter + character.quirk_prefix + text_chunks[i] + character.quirk_suffix + dev_user_smart_dialogue_delimiter;
						} else {
							final_text = final_text + dev_user_smart_dialogue_delimiter + text_chunks[i] + dev_user_smart_dialogue_delimiter;
						}
					}
					if (smart_quirk_mode == "script" && text_chunks[i] != "") {
						// strip whitespace if present to allow normal action delimiter spacing
						if (dev_user_wrap_smart_quirks == "true") {
							final_text = final_text + character.quirk_prefix + text_chunks[i].replace(/^\s|\s$/,"") + character.quirk_suffix;
						} else {
							final_text = final_text + text_chunks[i].replace(/^\s|\s$/,"");
						}
					}
				} else {
					// If quirking should not apply, add the plain text; add in delimiter for unquirked script text
					if (smart_quirk_mode == "script" && text_chunks[i] != "") { final_text = final_text + " " + dev_user_smart_action_delimiter + text_chunks[i] + dev_user_smart_action_delimiter + " "; }
					else { final_text = final_text + text_chunks[i]; }
				}
			}
			// add in prefix and suffix if it should be global
			if (dev_user_wrap_smart_quirks !== "true") { final_text = character.quirk_prefix + final_text + character.quirk_suffix }
			
			if (dev_user_safe_bbcode == "true") {
				// now that we are safe, replace temporary unicode brackets with coding ones again
				final_text = final_text.replace(/\ufe5d/g, "[").replace(/\ufe5e/g,"]");
				
				// begin by removing empty tags
				var re2 = /\[([A-Za-z]+)(=[^\]]+)?\](\s+)?\[\/\1\]/ig;
				final_text = final_text.replace(re2, "$3");
				// only get more involved if we have nested/potentially problematic tags, from quirks or otherwise
				if (/\[[^\/\]]+\][^\[\]]*?\[[^\/\]]+\]/.test(final_text)) {
					// attempt to catch improperly stacked colour, bgcolor and font tags  
					var re = /(\[(color|bgcolor|font)=([#\w\d\s'-.,()]+)\])(([\s\S](?!\[\/\2\]))*?)(\[\2=[#\w\d\s'-.,()]+\])([\s\S]*?)(\[\/\2\])/i;
					while (re.test(final_text)) {
						// close and reopen tags
						final_text = final_text.replace(re, "$1$4[/$2]$6$7$8[$2=$3]");
						// strip empty tags
						final_text = final_text.replace(re2, "$3");
					}
					// escape [br]s and [rawc] again for this step so they aren't picked up as non matching
					final_text = final_text.replace(/\[(br|rawc)\]/gi, "\ufe5d$1\ufe5e");
					// fix intersecting tags
					var re = /(\[([A-Za-z]+)(=[^\]]+)?\])(([\s\S](?!\[\/\2\]))*?)\[([A-Za-z]+)(=[^\]]+)?\](([\s\S](?!\[\/\6\]))*?)(\[\/\2\])(.*?)(\[\/\6\])/i;
					var panic = 0;
					while (match = re.exec(final_text)) {
						// strip empty tags
						final_text = final_text.replace(re2, "$3");
						panic++
						if (match[4].indexOf(match[1]) !== -1) {
							// strip empty tags
							final_text = final_text.replace(re2, "$3");
							console.log("BREAK: Stacking cannot be recovered.");
							break;
						} else if (panic > 50) {
							// strip empty tags
							final_text = final_text.replace(re2, "$3");
							console.log("BREAK: Too many BBCode intersection issues.");
							break;
						}
						// close and reopen tags
						final_text = final_text.replace(re, "$1$4[$6$7]$8[/$6]$10[$6$7]$11$12" ); 
						// strip empty tags
						final_text = final_text.replace(re2, "$3");
					}
					// make [br]s coding again
					final_text = final_text.replace(/\ufe5d/g, "[").replace(/\ufe5e/g,"]");
				}
				// reinsert original [raw] content
				if (raw_content !== false) {
					final_text = final_text.replace(/\[rawc\]/i, "[raw]" + raw_content + "[/raw]");
				}
				// this is also where we replace URLs with original casing
				if (url_matches !== null) {
					var urls_number = url_matches.length;
					for (var u = 0; u < urls_number; u++) {
						var re = new RegExp(url_matches[u].replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "ig");
						final_text = final_text.replace(re, url_matches[u]);
					}
				}
			}
			return final_text;
		}
	};
});
