// ==UserScript==
// @name        YouTube: Volume Fixer
// @namespace   youtubeVolumeFixer
// @version     1.0
// @include     http://*youtube.com*
// @include     https://*youtube.com*
// @grant       none
// @run-at      document-start
// ==/UserScript==

document.addEventListener('GMYtPlayerFirstStateChange', function(evt) {
	var videoElement = evt.target.getElementsByClassName('html5-main-video')[0];
	var volProp = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'volume');
	
	var getVolume = (function() {
		var ytVideoElement = evt.target;
		
		return function() {
			var volume = ytVideoElement.getVolume() / 100;
			
			if (Number.isFinite(volume)) {
				return volume;
			} else {
				return 1;
			}
		}
	})();
	
	Object.defineProperty(videoElement, '_volume', volProp);
	
	Object.defineProperty(videoElement, 'volume', {
		enumerable: true, configurable: true,
		
		set: function(val) {
			this._volume = getVolume();
			this._normalizedVolume = val;
		},
		
		get: function() {
				if (this._normalizedVolume == null) {
					return 1;
				}
				else {
					return this._normalizedVolume;
				}
		}
	});
	
	//videoElement.volume = videoElement.volume;
});