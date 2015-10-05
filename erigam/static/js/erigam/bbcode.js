define("erigam/bbcode", ['jquery', 'erigam/helpers'], function($, helpers) {
	"use strict";

	var tag_properties = {bgcolor: "background-color", color: "color", font: "font-family", bshadow: "box-shadow", tshadow: "text-shadow"};

	return {
		encode: function(text, admin) {
			return this.raw_encode(helpers.html_encode(text), admin);
		},
		raw_encode: function(text, admin) {
			var self = this;

			text = text.replace(/(\[br\])+/g, "<br>");
			return text.replace(/(https?:\/\/\S+)|\[([A-Za-z]+)(?:=([^\]]+))?\]([\s\S]*?)\[\/\2\]/g, function(str, url, tag, attribute, content) {
				if (url) {
					var suffix = "";
					// Exclude a trailing closing bracket if there isn't an opening bracket.
					if (url[url.length - 1] == ")" && url.indexOf("(") == -1) {
						url = url.substr(0, url.length-1);
						suffix = ")";
					}
					return $("<a>").attr({href: url, target: "_blank"}).text(url)[0].outerHTML + suffix;
				}
				tag = tag.toLowerCase();
				if (attribute) {
					switch (tag) {
						case "bgcolor":
						case "color":
						case "font":
							return $("<span>").css(tag_properties[tag], attribute).html(self.raw_encode(content, admin))[0].outerHTML;
						case "bshadow":
						case "tshadow":
							return $("<span>").css(tag_properties[tag], attribute).html(self.raw_encode(content, admin))[0].outerHTML;
						case "url":
							if (attribute.substr(0, 7) == "http://" || attribute.substr(0, 8) == "https://") {
								return $("<a>").attr({href: attribute, target: "_blank"}).html(self.raw_encode(content, admin))[0].outerHTML;
							}
							break;
					}
				} else {
					switch (tag) {
						case "b":
						case "del":
						case "i":
						case "sub":
						case "sup":
						case "u":
						case "s":
							return "<" + tag + ">" + self.raw_encode(content, admin) + "</" + tag + ">";
						case "spoiler":
							return "<label class=\"spoiler\"><input type=\"checkbox\"><span>SPOILER</span> <span>" + self.raw_encode(content, admin) + "</span></label>";
						case "raw":
							return content;
						case "audio":
							// _autoplay_ must be replaced because of how creating the string puts the element in the DOM.
							return window.legacy_bbcode || admin ? $("<audio>").attr("src", content).attr("_autoplay_", "autoplay").attr("controls", "controls").attr("preload", "none")[0].outerHTML.replace("_autoplay_", "autoplay") : self.raw_encode(content, admin);
						case "img":
							return window.legacy_bbcode || admin ? $("<img>").attr("src", content).attr("width", 300).css("max-width", "100%")[0].outerHTML : self.raw_encode(content, admin);
					}
				}
				return "[" + tag + (attribute ? "=" + attribute : "") + "]" + self.raw_encode(content, admin) + "[/" + tag + "]";
			});
		},
		remove: function(text) {
			var self = this;

			text = text.replace(/(\[br\])+/g, "");
			return text.replace(/\[([A-Za-z]+)(?:=[^\]]+)?\]([\s\S]*?)\[\/\1\]/g, function(str, tag, content) {
				return self.remove(content);
			});
		}
	};
});
