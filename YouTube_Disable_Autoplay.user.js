// ==UserScript==
// @name        YouTube: Disable Autoplay
// @namespace   youtubeDisableAutoplay
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// ==/UserScript==

function hideUpNext() {
	document.getElementsByClassName('watch-sidebar-separation-line')[0].style.display = 'none';
	document.getElementsByClassName('watch-sidebar-head')[0].style.display = 'none';
}

function removeAutoplay() {
	var autoplayButton = document.getElementById('autoplay-checkbox').parentElement;
	var autoplayContainer = autoplayButton.parentElement;
	
	autoplayButton.remove();
	autoplayContainer.style.display = 'none';
	
	hideUpNext();
}


document.addEventListener('spfdone', removeAutoplay);

removeAutoplay();