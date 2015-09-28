define("erigam/search", ['jquery'], function($) {
	var ORIGINAL_TITLE = document.title;
	var SEARCH_URL = "/search";
	var SEARCH_QUIT_URL = "/stop_search";

	var searching = true;

	return {
		start: function(callback) {
			var self = this;

			document.title = 'Searching - '+ORIGINAL_TITLE;
			$('#conversation').addClass('search');

			$.post(SEARCH_URL, {}, function(data) {
				searching = false;
				if (typeof window.history.replaceState != "undefined") {
					window.history.replaceState('', '', '/chat/' + data.chat);
				} else {
					window.location.replace('/chat/' + data.chat);
				}

				callback({
					chat: data.chat,
					log_id: data.log
				});
			}).always(function() {
				if (searching === true) {
					window.setTimeout(function() {
						self.start(callback);
					}, 1000);
				} else {
					$('#conversation').removeClass('search');
				}
			});

			$(window).unload(function() {
				if (searching) $.ajax(SEARCH_QUIT_URL, { "type": "POST", "async": false });
			});
		}
	};
});