define("erigam/tts", ['jquery', 'erigam/helpers'], function($, helpers) {
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
		// Disable TTS if there is no localstorage
		if (!helpers.check_localstorage()) return;

		if (localStorage.getItem("tts") == 'undefined' || localStorage.getItem("tts") === null) {
			localStorage.setItem("tts", 0);
		}

		if (localStorage.getItem("tts") === "0") return;

		if (event.target.nodeName != "P") {
			console.log($('#conversation > p:last-child').text());
			return;
		}

		var text = $('#conversation > p:last-child').text();
		text = text.substring(text.indexOf(":") + 1);

		var utterance = new SpeechSynthesisUtterance(text);
		var voiceArr = speechSynthesis.getVoices();

		utterance.voice = voiceArr[Math.floor(Math.random()*voiceArr.length)];
		if (utterance.voice && utterance.voice.name) console.log("Random voice: ", utterance.voice.name);

		speechUtteranceChunker(utterance, {}, function() {
			console.log('done speaking: ', text);
		});

	});

	$(".ttsset").click(function(){
		if (this.checked) {
			localStorage.setItem("tts", 1);
		} else {
			localStorage.setItem("tts", 0);
		}
	});

	var init = function() {
		var state = localStorage.getItem("tts") == "1" ? true : false;
		$("input.ttsset").prop("checked", state);
	}();
});
