define("erigam", [], function() {
	"use strict";

	return {
		chat: function(userinfo) {
			require(["erigam/views/chat"], function(app) {
				app.init(userinfo);
			});
		}
	};
});
