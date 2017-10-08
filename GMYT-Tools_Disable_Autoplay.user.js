// ==UserScript==
// @name        GMYT-Tools: Disable Autoplay
// @description Disables autoplay and removes autoplay button from youtube's watch page
// @namespace   gmYtDisableAutoplay
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// ==/UserScript==

function hideUpNext() {
//Hides the separation line and title for the 'Up next' item
	document.getElementsByClassName('watch-sidebar-separation-line')[0].style.display = 'none';
	document.getElementsByClassName('watch-sidebar-head')[0].style.display = 'none';
}

function removeAutoplay() {
//Removes the autoplay button and hides the 'Up next' elements
	var autoplayButton = document.getElementById('autoplay-checkbox').parentElement;
	var autoplayContainer = autoplayButton.parentElement;
	
	autoplayButton.remove();
	autoplayContainer.style.display = 'none';
	
	hideUpNext();
}


document.addEventListener('spfdone', removeAutoplay);

removeAutoplay();
