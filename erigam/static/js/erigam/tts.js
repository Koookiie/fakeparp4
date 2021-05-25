define("erigam/tts", ['jquery', 'erigam/helpers', 'erigam/settings'], function($, helpers, settings) {
	"use strict";

	if('speechSynthesis' in window) {
		var speechUtteranceChunker = function (utt, settings, callback) {
			settings = settings || {};

			var text = settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text;

			var chunkLength = (settings && settings.chunkLength) || 100;
			var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
			var chunkArr = text.match(pattRegex) || [text];

			if (chunkArr[0] === undefined || chunkArr[0].length <= 2) {
				//call once all text has been spoken...
				if (callback !== undefined) return callback();
			}
			var chunk = chunkArr[0];
			var newUtt = new SpeechSynthesisUtterance(chunk);

			// Voice
			newUtt.voice = utt.voice;

			var x;
			for (x in utt) {
				if (utt.hasOwnProperty(x) && x !== 'text') {
						newUtt[x] = utt[x];
				}
			}
			newUtt.addEventListener('end', function () {
				if (speechUtteranceChunker.cancel) {
					speechUtteranceChunker.cancel = false;
					return;
				}
				settings.offset = settings.offset || 0;
				settings.offset += chunk.length - 1;
				speechUtteranceChunker(utt, settings, callback);
			});

			if (settings.modifier) settings.modifier(newUtt);

			console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
			//placing the speak invocation inside a callback fixes ordering and onend issues.
			setTimeout(function() {
				speechSynthesis.speak(newUtt);
			}, 0);
		};
	}

	$('#conversation').bind('DOMNodeInserted DOMNodeRemoved DOMSubTreeModified', function(event) {
		// Disable TTS if there is no localstorage or is unchecked.
		if (!helpers.check_localstorage()) return;
		if (!settings.get("tts")) return;

		if (event.target.nodeName != "P") {
			console.log($('#conversation > p:last-child').text());
			return;
		}

		var text = $(event.target).find('.text').text();
		text = text.substring(text.indexOf(":") + 1);
		text = text.replace(/[^\x00-\x7F]/g, "");

		var utterance = new SpeechSynthesisUtterance(text);
		var voiceArr = speechSynthesis.getVoices();

		utterance.voice = voiceArr[Math.floor(Math.random()*voiceArr.length)];
		if (utterance.voice && utterance.voice.name) console.log("Random voice: ", utterance.voice.name);

		speechUtteranceChunker(utterance, {}, function() {
			console.log('done speaking: ', text);
		});

	});

	$(".ttsset").click(function() {
		var x = this.checked ? settings.set("tts", 1) : settings.set("tts", 0);
	});
});
