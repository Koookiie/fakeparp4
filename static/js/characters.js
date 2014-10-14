var characterKeys = ['acronym', 'name', 'color', 'quirk_prefix', 'case'];

function deleteReplacement(e) {
	$(this.parentNode).remove();
	return false;
}

function addReplacement(e, from, to) {
	newItem = $('<li><input class="form-control quirks" type="text" name="quirk_from" size="4"> to <input class="form-control quirks" type="text" name="quirk_to" size="4"> <a href="#" class="btn btn-danger deleteReplacement">Remove</a></li>');
	if (from && to) {
		var inputs = $(newItem).find('input');
		inputs[0].value = from;
		inputs[1].value = to;
	}
	$(newItem).find('.deleteReplacement').click(deleteReplacement);
	$(newItem).appendTo('#replacementList');
	return false;
}

function clearReplacements(e) {
	$('#replacementList').empty();
	return false;
}

$(document).ready(function() {

	$('.deleteReplacement').click(deleteReplacement);
	$('#addReplacement').click(addReplacement);
	$('#clearReplacements').click(clearReplacements);

	$('select[name="character"]').change(function() {
		if (characters[this.value]) {
			var newCharacter = characters[this.value];
			for (i=0; i<characterKeys.length; i++) {
				$('input[name="'+characterKeys[i]+'"], select[name="'+characterKeys[i]+'"]').val(newCharacter[characterKeys[i]]);
			}
			clearReplacements(null);
			if (newCharacter['replacements'].length>0) {
				for (i=0; i<newCharacter['replacements'].length; i++) {
					addReplacement(null, newCharacter['replacements'][i][0], newCharacter['replacements'][i][1]);
				}
			} else {
				addReplacement();
			}
		}
	});
        if (navigator.userAgent.indexOf('Android')!=-1 || navigator.userAgent.indexOf('iPhone')!=-1 || window.innerWidth<=500) {
            $(document.body).addClass('mobile');
        } else {
    	var colorBox = $('input[name="color"]');
    	colorBox.ColorPicker({
    		onSubmit: function(hsb, hex, rgb, el) {
    			$(el).val(hex);
    			$(el).ColorPickerHide();
    		},
    		onBeforeShow: function () {
    			$(this).ColorPickerSetColor(this.value);
    		},
    		onChange: function (hsb, hex, rgb) {
    			colorBox.val(hex);
    			// This doesn't do anything in the chat window.
    			$('#color-preview').css('color', '#' + hex);
    		}
    	}).bind('keyup', function() {
    		$(this).ColorPickerSetColor(this.value);
    	});
        }
});