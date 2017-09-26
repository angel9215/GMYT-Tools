// ==UserScript==
// @name        YouTube: Remove Autoplay
// @namespace   youtubeRemoveAutoplay
// @description Disables the autoplay function
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// ==/UserScript==

document.addEventListener('spfdone', function() {
	document.getElementById('autoplay-checkbox').parentElement.remove();
});

document.getElementById('autoplay-checkbox').parentElement.remove();
