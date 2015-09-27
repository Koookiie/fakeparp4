define("erigam", [], function() {
	"use strict";

	return {
		chat: function(userinfo) {
			require(["erigam/views/chat"], function(app) {
				app.init(userinfo);
			});
		},
		logpage: function(url) {
			require(["erigam/views/log"], function(app) {
				app.init(url);
			});
		}
	};
});
