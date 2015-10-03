define("erigam/views/home", ['jquery', 'erigam/characters', 'bootstrap'], function($, characters) {
	"use strict";

	function getURLParameter(name) {
		return decodeURI(
			(RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
		);
	}

	var text_preview_container = $('#color-preview');

	// You need cookies to use this site.
	if (document.cookie === "") {
		$('<p class="error">').text("It seems you have cookies disabled. Unfortunately cookies are essential for MSPARP to work, so you'll need to either enable them or add an exception in order to use MSPARP.").appendTo(document.body);
	}

	var config = $('#character-config');

	// Supposed to update the bottom preview box
	function updatePreview() {
		// Acronym

		var acronym = config.find('input[name="acronym"]').val();
		$('#color-preview #acronym').text(acronym+(acronym.length>0?': ':''));

		// Text

		var name = $("select.character-select").val();
		config.find('#color-preview #quote').text(characters[name].quote);
		if (name=="kankri") {
			$.get('/static/txt/seri9usly_this_is_fucking_ridicul9us.txt', function(reply) {
				config.find('#color-preview #quote').text(reply);
			});
		}

		// Color
		update_color(color_hex_input.val());
	}

	config.find('input').change(updatePreview).keyup(updatePreview);

	$('.menuopt').click(function(e) {
		e.preventDefault();

		var id = $(this).attr('id');

		// Remove the old active classes
		$('.active').removeClass('active');
		$('.opting').removeClass('sopting');

		// Add active clesses to the current elements
		$("."+id).addClass('sopting');
		$(this).parent().addClass('active');
		window.history.pushState("", $('title').html, "/?m="+id);
	});

	$('select[name="character"]').change(function() {
		if(characters[this.value]) {
			updatePreview();
			$('#character-config').show();
			$('#typing-quirks').show();
		}
	});

	// Toggle replacements
	$('#typetog').click(function() {
		$('#typing-quirks').slideToggle();
		$('#typing-quirks2').slideToggle();
	});

	// Home URL params
	if (getURLParameter('m')) {
		console.log(getURLParameter('m'));
		$('#'+getURLParameter('m')).click();
	}

	// Color and color_hex
	var color_input = $("#color_input").change(function() {
		update_color(this.value.substr(1));
	});

	var color_hex_input = $("#color_input_hex").keyup(function() {
		if (this.value.length == 6) {
			update_color(this.value);
		}
	});

	function update_color(color) {
		color_input.val("#" + color);
		color_hex_input.val(color);
		text_preview_container.css("color", "#" + color);
	}

	return {
		init: function(err) {
			// Open groups page if error.
			if (err) $('#group_chat').click();

			updatePreview();
		}
	};
});
