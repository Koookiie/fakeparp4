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

function cmobile() {
	if (navigator.userAgent.indexOf('Android')!=-1 || navigator.userAgent.indexOf('iPhone')!=-1 || navigator.userAgent.indexOf('Nintendo 3DS')!=-1 || navigator.userAgent.indexOf('Nintendo DSi')!=-1 || window.innerWidth<=500) {
		return true;
	} else {
		return false;
	}
}

function removeItem(item, array) {
	array.splice($.inArray(item, array), 1);
}

$(document).ready(function() {

	if (cmobile()) $(document.body).addClass('mobile');

	$(window).resize(function() {
		if (cmobile()){
			$(document.body).addClass('mobile');
		} else {
			$(document.body).removeClass('mobile');
		}
	});


	var quote = quotes[Math.floor(Math.random()*quotes.length)];
	$('#quote').html(quote);

	function isiPhone(){
		return (
			(navigator.platform.indexOf("iPhone") != -1) ||
			(navigator.platform.indexOf("iPod") != -1)
		);
	}
	if(isiPhone()) {
		$('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />');
	}

	$('.typetog').click(function() {
		$('#typing-quirks').slideToggle();
		$('#typing-quirks2').slideToggle();
	});

});
