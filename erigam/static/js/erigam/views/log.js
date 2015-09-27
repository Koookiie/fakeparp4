define("erigam/views/log", ['jquery', 'erigam/bbcode'], function($, bbcode) {
	return {
		init: function(url) {
			var bbcodeon = localStorage.getItem(url+"bbcodeon") || 1;

			$('#archiveConversation p').each(function() {
				var line;
				if (bbcodeon == 1) {
					line = bbcode.encode($(this).html());
					$(this).html(line);
				} else {
					line = bbcode.remove($(this).html());
					$(this).text(line);
				}
			});
		}
	};
});