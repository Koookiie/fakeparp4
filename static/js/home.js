var quotes = [
    'Oh god how did this get here I am not good with computer D:',
    'HELP! I HAVE A SNOWGLOBE IN MY BUTT!',
    'Eww purple.',
    'Purple is my favorite color OwO',
    'How do rp',
    'Instructions weren\'t clear enough I got my dick caught in a ceiling fan',
    'Instructions were perfectly clear I still got my dick caught in a ceiling fan',
    'Dang! It didn\'t work!',
    'What the hell?',
    'Gee I hope the site works today.',
    'brb going to fuck a cabbage',
    'help i have a karry stuck in my anus',
    '#blamekarry',
];

$(document).ready(function() {

    var quote = quotes[Math.floor(Math.random()*quotes.length)];
    $('#topquote').html(quote);

    jQuery.expr[':'].focus = function( elem ) {
      return elem === document.activeElement && ( elem.type || elem.href );
    };

    $('#frontform').submit(function() {
        if ($("#groupsub, #modpass").is(":focus")) {
            $('#frontform').append('<input type="hidden" name="create" value="Create Chat Room">');
        }
    });

    if (document.cookie=="") {

        $('<p class="error">').text("It seems you have cookies disabled. Unfortunately cookies are essential for MSPARP to work, so you'll need to either enable them or add an exception in order to use MSPARP.").appendTo(document.body);

    }

    var settingUp = true;
    var config = $('#character-config');

    function updatePreview() {
        $('#color-preview').css('color', '#'+config.find('input[name="color"]').val());
        var acronym = config.find('input[name="acronym"]').val();
        $('#color-preview #acronym').text(acronym+(acronym.length>0?': ':''));
    }

        var idsel;
        var classel;
        $('.menuopt').click(function(e) {
            e.preventDefault(); 
            idsel = $(this).attr('id');
            classel = "."+idsel;
            $('.active').removeClass('active');
            $(this).parent().addClass('active');
            $('.opting').removeClass('sopting');
            $(classel).addClass('sopting');
            window.history.pushState("", $('title').html, "/?m="+idsel);
            if (idsel == "main") {
                window.history.pushState("", $('title').html, "/");
            }
            console.log(this);
        });

        $('.add').click(function() {
            window.history.pushState("", $('title').html, "/");
        });

        function getURLParameter(name) {
            return decodeURI(
                (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
            );
        }

        if (getURLParameter('m')) {
            $('#'+getURLParameter('m')).click();
        }

        if (group_chat_error == 1) {
            $('#group_chat').click();
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

    var name = $("select.character-select").attr('value');

    $('input[name="picky"]').change(function() {
        if($(this).is(':checked')) {
            $('#picky-matches').show();
        } else {
            $('#picky-matches').hide();
            $('#picky-matches input').removeAttr('checked').removeAttr('indeterminate');
        }
    }).change();

    $('button.show-button').click(function() {
        $('#'+$(this).attr('data-target')).show();
        $(this).hide();
        return false;
    });

    $('label.picky-header input').click(function() {
        var checks = $(this.parentNode).next('div.picky-group').find('input');
        if (this.checked) {
            checks.attr('checked','checked');
        } else {
            checks.val([]);
        }
    });

    function setGroupInput(groupDiv) {
        var label = $(groupDiv).prev('label.picky-header').find('input')[0];
        var group = $(groupDiv).find('input');
        var groupChecked = $(groupDiv).find('input:checked');
        if (groupChecked.length==0) {
            $(label).removeAttr('checked').removeAttr('indeterminate');
        } else if (groupChecked.length==group.length) {
            $(label).removeAttr('indeterminate').attr('checked','checked');
        } else {
            $(label).removeAttr('checked').attr('indeterminate','indeterminate');
        }
    }

    var pickyGroups = $('div.picky-group');
    for (i=0; i<pickyGroups.length; i++) {
        setGroupInput(pickyGroups[i]);
    }

    $('div.picky-group input').click(function() {
        setGroupInput(this.parentNode.parentNode);
    });

    $('div.defaults-off').hide();
    settingUp=false;

    $('.typetog').click(function() {
        $('#typing-quirks').slideToggle();
        $('#typing-quirks2').slideToggle();
    });

});
