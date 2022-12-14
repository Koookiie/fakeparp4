define("erigam/views/home", ['jquery', 'erigam/characters', 'erigam/charinfo'], function($, characters) {
	"use strict";

	// You need cookies to use this site.
	if (!window.navigator.cookieEnabled) {
		$('<p class="error">').text("It seems you have cookies disabled. Unfortunately cookies are essential for MSPARP to work, so you'll need to either enable them or add an exception in order to use MSPARP.").appendTo(document.body);
	}

	var settingUp = true;
	var config = $('#character-config');

	var storage = (function() {
	  var uid = new Date;
	  var result;
	  try {
		localStorage.setItem(uid, uid);
		result = localStorage.getItem(uid) == uid;
		localStorage.removeItem(uid);
		return result && localStorage;
	  } catch (exception) {}
	}());
	
	function updatePreview() {
		$('#color-preview').css('color', '#'+config.find('input[name="color"]').val());
		var acronym = config.find('input[name="acronym"]').val();
		$('#color-preview #acronym').text(acronym+(acronym.length>0?': ':''));
	}

	$('select[name="character"]').change(function() {
		if(characters[this.value]) {
			var newCharacter = characters[this.value];
			config.find('#color-preview #quote').text(newCharacter['quote']);
			if (this.value=="kankri") {
				$.get('/static/txt/seri9usly_this_is_fucking_ridicul9us.txt', function(reply) {
					config.find('#color-preview #quote').text(reply);
				});
			}
			updatePreview();
			if(!settingUp) {
				$('#character-config').show();
				$('#typing-quirks').show();
				$('button.show-button[data-target="character-config"]').hide();
				$('button.show-button[data-target="typing-quirks"]').hide();
			}
		}
	});

	config.find('input').change(updatePreview).keyup(updatePreview);
	updatePreview();

	var name = $(".character-select[name=character]").val();
	config.find('#color-preview #quote').text(characters[name]['quote']);
	if (name=="kankri") {
		$.get('/static/txt/seri9usly_this_is_fucking_ridicul9us.txt', function(reply) {
			config.find('#color-preview #quote').text(reply);
		});
	}

	if (storage){
		if (localStorage.pstyle == 'text'){
				$('input[name="astext"]').prop('checked',true);
				disablePicky('#picky-text');
				enablePicky('#picky-icon');
				$('#picky-icon').hide();
				$('#picky-text').show();
			} else {
				disablePicky('#picky-icon');
				enablePicky('#picky-text');
				$('#picky-icon').show();
				$('#picky-text').hide();
			}
		if (localStorage.isonline == 'display'){
			$('#isonlineblock').show()
		}else{
			$('#isonlineblock').hide()
		}
	}
	
	$('input[name="astext"]').change(function() {
		if($(this).is(':checked')) {
			disablePicky('#picky-icon');
			enablePicky('#picky-text');
			$('#picky-icon').hide();
			$('#picky-text').show();
			if (storage){
				localStorage.setItem('pstyle', 'text');
			}
		} else {
			disablePicky('#picky-text');
			enablePicky('#picky-icon');
			$('#picky-icon').show();
			$('#picky-text').hide();
			if (storage){
				localStorage.setItem('pstyle', 'icon');
			}
		}
	}).change();
		
	if(storage){	
		if (localStorage.creppy == 'creppy'){
			$('head').append('<link rel="stylesheet" id="creppyid" href="/static/css/mscreppy.css?41101" type="text/css" />');
			$('input[name="enablecreppy"]').prop('checked',true);
			$('.hidecreppy').show();
			}
		else {
			$('.hidecreppy').hide();
		}
	}
	
	$('input[name="enablecreppy"]').change(function() {
		if($(this).is(':checked')) {
			$('head').append('<link rel="stylesheet" id="creppyid" href="/static/css/mscreppy.css?41101" type="text/css" />');
			$('.hidecreppy').show();
			if (storage){
				localStorage.setItem('creppy', 'creppy');
			}
			} else {
				$("#creppyid").prop('disabled', true);
				$("#creppyid").remove();
				$('.hidecreppy').hide();
			if (storage){
				localStorage.setItem('creppy', '');
			}
		}
	}).change();


	if(storage){	
		if (localStorage.charbar == 'enabled'){
		    $('input[name="headerchar"]').prop('checked',true);
			$('#charbar').addClass("show");
		}
	}
		
	$('input[name="headerchar"]').change(function() {
		if($(this).is(':checked')) {
			$('#charbar').addClass("show");
			if (storage){
				localStorage.setItem('charbar', 'enabled');
			}
		} else {
			$('#charbar').removeClass("show");
			if (storage){
				localStorage.setItem('charbar', '');
			}
		}
	}).change();

		
	if (storage){	
		if (localStorage.dfall == 'downfall'){
			$('input[name="toggledownfall"]').prop('checked',true);
		}

		$('body').addClass(localStorage.dfall);
	}
		
	$('input[name="toggledownfall"]').change(function() {
		if($(this).is(':checked')) {
			$('body').addClass('downfall');
			if (storage){
				localStorage.setItem('dfall', 'downfall');
			}
			} else {
			$('body').removeClass('downfall');
			if (storage){
				localStorage.setItem('dfall', '');
			}
		}
	}).change();
		
	if (storage){
		if (localStorage.wopt == 'wrapopt'){
			$('input[name="wrapbutton"]').prop('checked',true);
		}
	
		$('.optionswrap').addClass(localStorage.wopt);
	}
	
	$('input[name="wrapbutton"]').change(function() {
		if($(this).is(':checked')) {
			$('.optionswrap').addClass('wrapopt');
			if (storage){
				localStorage.setItem('wopt', 'wrapopt');
			}
		} else {
			$('.optionswrap').removeClass('wrapopt');
			if (storage){
				localStorage.setItem('wopt', '');
			}
		}
	}).change();
		
		
		
	function disablePicky(pickyid) {
		var pickyInputs = $(pickyid + ' input');
		for (var i=0; i<pickyInputs.length; i++) {
			$(pickyInputs[i]).prop('disabled', true);
		}
	}
	
	function enablePicky(pickyid) {
		var pickyInputs = $(pickyid + ' input');
		for (var i=0; i<pickyInputs.length; i++) {
			$(pickyInputs[i]).prop('disabled', false);
		}
	}
	
	$('.isonlinetoggle').click(function() {
		if (storage){
			if (localStorage.isonline == 'display'){
				localStorage.setItem('isonline', '');
				$('#isonlineblock').hide()
			} else {
				localStorage.setItem('isonline', 'display');
				$('#isonlineblock').show()
			}
		} else {
			$('#isonlineblock').toggle()
		}
	});

	function updateIsonline() {
		$('#isonlineblock .isonlinechar').hide();
		if(!($('input[name="picky"]')).is(':checked')) {
			$('#isonlineblock .isonlinechar').show();
			$('#isonlineblock span[data-count="0"]').hide();
        } else {
			var pickySync = $('#picky-icon input[class="butty"]')
			var i=0;
			for (i=0; i<pickySync.length; i++) {
				if($(pickySync[i]).is(':checked')) {
					var client = $('#isonlineblock span[data-char="' + $(pickySync[i]).attr('name') + '"]');
					if(client.data("count") == 0){
						client.hide();
					} else {
						client.show();
					}
				}	
			}
		}
	}
	
	$('#picky-matches input').change(function() {
		if(settingUp) {
			return;
		}
		var pickyGroup = $('input[id="' + $(this).attr('data-group') + '"]')
		var pickyChars = null;
		if(pickyGroup.length == 0) {
			pickyChars = $('input[data-group="' + $(this).attr('id') +'"]');
		} else {
			pickyChars = $('input[data-group="' + $(this).attr('data-group') + '"]');
		}

		if(pickyChars.length == 0) {
			pickyChars = $('input[data-group="'+ $(this).attr('id') +'"]');
		}
		if(pickyChars.length == 0) {
			return;
		}

		var charSync = $('input[name="'+ $(this).attr('name') +'"]');
		var groupSync = $('input[id="'+ $(this).attr('id') + '"]');
		var isChecked = $(this).prop('checked');

		charSync.each(function() {
			$(this).prop('checked', isChecked);
		});

		groupSync.each(function() {
			$(this).prop('checked', isChecked);
		});

		if(pickyGroup.length == 0) {
			if($(this).prop('checked')){
				pickyChars.prop('checked', true);
			} else {
				pickyChars.prop('checked', false);
			}
		} else {
			var allChecked = true;
			pickyChars.each(function() {
				if($(this).is(':checked') == false) {
					allChecked = false;
					return;
				}
			});
			if(allChecked) {
				pickyGroup.prop('checked', true);
			} else {
				pickyGroup.prop('checked', false);
			}
		}
		updateIsonline();
	}).change();
	
	$('input[name="picky"]').change(function() {
		if($(this).is(':checked')) {
		    $('#isonlineblock .isonlinechar').hide();
			$('#isonlineblock .iofiltered').show();
			$('#picky-matches').show();
			if (storage){
				if (localStorage.pstyle == 'text'){
						$('input[name="astext"]').prop('checked',true);
					}
				}
		} else {
			$('#isonlineblock .isonlinechar').show();
			$('#isonlineblock .iofiltered').hide();
			$('#picky-matches').hide();
			$('#picky-matches input').removeAttr('checked').removeAttr('indeterminate');
		}
		updateIsonline();
	}).change();

	$('button.show-button').click(function() {
		$('#'+$(this).attr('data-target')).show();
		$(this).hide();
		return false;
	});

	$('.menubutton').click(function() {
		$('#nav').toggleClass('is-open');
	});
	
	$('label.picky-header input').click(function() {
		var checks = $(this.parentNode.parentNode).next('div.picky-group').find('input');
		if (this.checked) {
			for (var i=0; i<checks.length; i++) {
			var pickySync = $('input[name="'+ $(checks[i]).attr('name') +'"]')
				pickySync.attr('checked','checked');
			}
		}
		 else {
			for (var i=0; i<checks.length; i++) {
			var pickySync = $('input[name="'+ $(checks[i]).attr('name') +'"]')
				pickySync.val([]);
			}
		}
		updateIsonline();
	});

	if (storage){
		$('#container').addClass(localStorage.hdpi);
	}
	
	$('.hdpidisable').click(function() {
		$('#container').addClass('hdpi-disabled');
		if (storage){
		localStorage.setItem('hdpi', 'hdpi-disabled');
		}
	});
	
	$('.hdpienable').click(function() {
		$('#container').removeClass('hdpi-disabled');
		if (storage){
		localStorage.setItem('hdpi', '');
		}
	});

	$('div.defaults-off').hide();

	function deleteBlacklistItem(e) {
		$(this.parentNode).remove();
		var container = $("#blacklistValues");
		if(container.children().length == 0) {
			addBlacklistItem();
		}
		return false;
	}

	function addBlacklistItem(e, item) {
		var newItem = $('<li><input type="text" name="blacklist" size="31"><a href="#" class="deleteBlacklistItem">x</a></li>');
		if (item) {
			var input = $(newItem).find('input');
			input.value = item;
		}
		$(newItem).find('.deleteBlacklistItem').click(deleteBlacklistItem);
		$(newItem).appendTo('#blacklistValues');
		return false;
	}

	function clearBlacklist() {
		$('#blacklistValues').empty();
		addBlacklistItem();
		return false;
	}

	$('.deleteBlacklistItem').click(deleteBlacklistItem);
	$('#addBlacklistItem').click(addBlacklistItem);
	$('#clearBlacklist').click(clearBlacklist);

	settingUp=false;

	return {
		init: function(err) {
			// Open groups page if error.
			if (err) $('#group_chat').click();

			updatePreview();
		}
	};
});
