// ==UserScript==
// @name        YouTube: Playlist Autoplay Control
// @namespace   youtubePlAutoplayControl
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// ==/UserScript==

var buttonElement = '<button id="GMYt_plAutoplayControl" data-button-toggle="true" title="Autoplay" type="button" class="yt-uix-button yt-uix-button-size-default yt-uix-button-player-controls yt-uix-button-empty yt-uix-button-has-icon yt-uix-button-opacity yt-uix-tooltip yt-uix-tooltip" data-tooltip-text="Autoplay">'+
	'<span class="yt-uix-button-icon-wrapper">'+
		'<span class="yt-uix-button-icon yt-sprite" style="width: 24px; height: 24px; background: url(data:image/svg+xml;charset=utf-8,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20xmlns%3Aa%3D%22http%3A%2F%2Fns.adobe.com%2FAdobeSVGViewerExtensions%2F3.0%2F%22%20%20fill%3D%22%23FFFFFF%22%20viewBox%3D%22-0.709%20-0.235%20213%2071%22%20enable-background%3D%22new%20-0.709%20-0.235%20213%2071%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20points%3D%220%2C26.488%200%2C44.144%20167.747%2C44.144%20167.747%2C70.631%20211.89%2C35.316%20167.747%2C0%20167.747%2C26.488%20%22%2F%3E%3C%2Fsvg%3E) center no-repeat;"></span>'+
		//'<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"  fill="#FFFFFF" viewBox="-0.709 -0.235 213 71" enable-background="new -0.709 -0.235 213 71" xml:space="preserve"><polygon points="0,26.488 0,44.144 167.747,44.144 167.747,70.631 211.89,35.316 167.747,0 167.747,26.488 "/></svg>'+
	'</span>'+
'</button>';

function updateButton(button, status) {
	var toggledClass = 'yt-uix-button-toggled';
	
	if (status) {
		button.classList.add(toggledClass);
	} else {
		button.classList.remove(toggledClass);
	}
}

function isWatchPage() {
	return !!(window.location.href.indexOf('youtube.com/watch') + 1);
}

function hasUrlParameter(parameter) {
	return !!(window.location.href.indexOf(parameter + '=') + 1);
}

function getUrlParameter(parameter) {
	regexString = parameter + '=.*?(?=$|&)';
	regex = new RegExp(regexString);
	
	var resultParameter = regex.exec(window.location.href);
	
	if (resultParameter) {
		return resultParameter[0];
	}
}

function autoplayController(player, playlistId) {
	this._ytPlayer = player;
	this._defaultStatus = true;
	this._playlistId = null;
	this._autoplayEvent = null;
	
	this._autoplayEventRegex = /ytPlayeronStateChangeplayer/;
	this._autoplayEventType = 'onStateChange';
	
	Object.defineProperty(this, 'autoplayEnabled', {
		enumarable: true,
		configurable: true,
		get: function() {
			return !this._autoplayEvent;
		},
		set: function(val) {
			if (val) {
				this._enableAutoplay();
			} else {
				this._disableAutoplay();
			}
		}
	});
	
	Object.defineProperty(this, 'playlistId', {
		enumerable: true,
		configurable: true,
		get: function() {
			return this._playlistId;
		},
		set: function(val) {
			this._playlistId = val;
			this.resetStatus();
		}
	});
	
	this.toggleStatus = function() {
		this.autoplayEnabled = !this.autoplayEnabled;
		return this.autoplayEnabled;
	};
	
	this.resetStatus = function() {
		this.autoplayEnabled = this._defaultStatus;
		return this.autoplayEnabled;
	};
	
	this._enableAutoplay = function() {
		if (this._autoplayEvent == null) {
			return;
		}
		
		this._ytPlayer.addEventListener.apply(this._ytPlayer, this._autoplayEvent);
		this._autoplayEvent = null;
	};
	
	this._disableAutoplay = function() {
		if (this._autoplayEvent != null) {
			return;
		}
		
		for (var i = 0; i < this._ytPlayer._customEventListeners.length; i++) {
			if (this._ytPlayer._customEventListeners[i][0] == this._autoplayEventType) {
				if(this._autoplayEventRegex.test(this._ytPlayer._customEventListeners[i][1])) {
					this._autoplayEvent = this._ytPlayer._customEventListeners[i];
					break;
				}
			}
		}
		
		if (this._autoplayEvent != null) {
			this._ytPlayer.removeEventListener.apply(this._ytPlayer, this._autoplayEvent);
		}
	}
	
	this.playlistId = playlistId;
}

function init() {
	var ytPlayer = document.getElementById('movie_player');
	
	if (isWatchPage() && hasUrlParameter('list')) {
		var button = document.createElement('div');
		button.innerHTML = buttonElement;
		button = button.firstElementChild;
		button.addEventListener('click', function(evt) {
			var status = document.getElementById('movie_player').GMYtPlAutoplaySwitch.toggleStatus();
			updateButton(this, status);
			
			evt.preventDefault();
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		});
		
		document.getElementsByClassName('playlist-nav-controls')[0].appendChild(button);
		
		var playlistId = getUrlParameter('list').split('=')[1];
		
		if (ytPlayer.GMYtPlAutoplaySwitch) {
			if (playlistId != ytPlayer.GMYtPlAutoplaySwitch.playlistId) {
				ytPlayer.GMYtPlAutoplaySwitch.playlistId = playlistId;
			}
		} else {
			ytPlayer.GMYtPlAutoplaySwitch = new autoplayController(ytPlayer, playlistId);
		}
		
		updateButton(button, ytPlayer.GMYtPlAutoplaySwitch.autoplayEnabled)
	} else {
		if (!!ytPlayer) {
			if (ytPlayer.GMYtPlAutoplaySwitch) {
				ytPlayer.GMYtPlAutoplaySwitch.resetStatus();
				delete ytPlayer.GMYtPlAutoplaySwitch;
			}
		}
	}
}

document.addEventListener('spfdone', init);

init();