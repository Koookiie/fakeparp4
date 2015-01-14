
$(document).ready(function() {

	// jQuery :focus selector? 
	jQuery.expr[':'].focus = function( elem ) {
		return elem === document.activeElement && ( elem.type || elem.href );
	};

	// You need cookies to use this site.
	if (document.cookie=="") {
		$('<p class="error">').text("It seems you have cookies disabled. Unfortunately cookies are essential for MSPARP to work, so you'll need to either enable them or add an exception in order to use MSPARP.").appendTo(document.body);
	}

	// Home URL params
	if (getURLParameter('m')) {
		$('#'+getURLParameter('m')).click();
	}

	// Skip directly to the errors
	if (group_chat_error == 1) {
		$('#group_chat').click();
	}

	var config = $('#character-config');

	// Supposed to update the bottom preview box
	function updatePreview() {
		// Color + Acronym
		$('#color-preview').css('color', '#'+config.find('input[name="color"]').val());
		var acronym = config.find('input[name="acronym"]').val();
		$('#color-preview #acronym').text(acronym+(acronym.length>0?': ':''));

		// Text
		var name = $("select.character-select").val();
		config.find('#color-preview #quote').text(characters[name]['quote']);
		if (name=="kankri") {
			$.get('/static/txt/seri9usly_this_is_fucking_ridicul9us.txt', function(reply) {
				config.find('#color-preview #quote').text(reply);
			});
		}
	}

	config.find('input').change(updatePreview).keyup(updatePreview);
	updatePreview();

	$('.menuopt').click(function(e) {
		e.preventDefault();

		var id = $(this).attr('id');

		// Remove the old active classes
		$('.active').removeClass('active');
		$('.opting').removeClass('sopting');

		// Add active clesses to the current elements
		$("."+id).addClass('sopting');;
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

	// Hide the replacements tab.
	$('div.defaults-off').hide();

	// Toggle replacements
	$('#typetog').click(function() {
		$('#typing-quirks').slideToggle();
		$('#typing-quirks2').slideToggle();
	});

});
