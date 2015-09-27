define("erigam", [], function() {
	"use strict";

	return {
		chat: function(userinfo) {
			require(["erigam/chat"], function(app) {
				app.init(userinfo);
			});
		}
	};
});
