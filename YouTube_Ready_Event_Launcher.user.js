// ==UserScript==
// @name        YouTube: Ready Event Launcher
// @namespace   youtubeReadyEventLauncher
// @version     1.0
// @include     http://*youtube.com*
// @include     https://*youtube.com*
// @grant       none
// @run-at      document-start
// ==/UserScript==

function chainFunctionGenerator(defaultFunctionArg, chainNameArg) {
//Implement: function priorities (implies multiple link lists)
	var chain = function() {
		if (chain.useExternalArgsAsChainData) {
			var chainData = arguments;
		} else {
			var chainData = undefined;
		}
		
		for (var i = 0; i < chain.links.length; i++) {
			if(chain.links[i].tryCatchExec) {
				try {
					chainData = chain.links[i].linkFunction.apply(this, chainData);
					chainData = [chainData];
				} catch(ex) {
					console.log(ex.message);
				}
			} else {
				chainData = chain.links[i].linkFunction.apply(this, chainData);
				chainData = [chainData];
			}
		}
		
		if (chain.defaultFunction) {
			chainData = chain.defaultFunction.apply(this, arguments);
		}
		
		return chainData;
	}
	
	chain.nameId = chainNameArg;
	chain.links = [];
	chain.defaultFunction = defaultFunctionArg;
	
	chain.useExternalArgsAsChainData = true;
	
	chain._link = function(functionArg, nameArg, tryCatchExecArg) {
		this.name = nameArg;
		this.linkFunction = functionArg;
		this.tryCatchExec = tryCatchExecArg;
	};
	
	chain.add = function(functionArg, name, tryCatchExec) {
		chain.links.push(new chain._link(functionArg, name, tryCatchExec));
	};
	
	chain.remove = function(position) {
		chain.links.splice(position, 1);
	};
	
	chain.insertAt = function(position, functionArg, name, tryCatchExec) {
		var insFunction = new chain._link(functionArg, name, tryCatchExec);
		chain.links.splice(position, 0, insFunction);
	};
	
	return chain;
}

function elementSelector(videoApi) {
	var ytVideoId = videoApi.getUpdatedConfigurationData().attrs.id;
	var videoElement = document.getElementById(ytVideoId);
	var selectedFlag = 'GMYtSelected';
	
	if(!videoElement[selectedFlag]) {
		return videoElement;
	}
}

function eventLauncher(element) {
	var selectedFlag = 'GMYtSelected';
	var GMYtReadyEventName = 'GMYtPlayerReady';
	
	event = new CustomEvent(GMYtReadyEventName, {bubbles: true, cancelable: true});
	element.dispatchEvent(event);
	element[selectedFlag] = true;
}

var chainFunctionId = 'readyEventGenerator';

var setOnYouTubePlayerReady = true;
var chainFunction = window.onYouTubePlayerReady;
while (chainFunction) {
	if (chainFunction.nameId == chainFunctionId) {
		setOnYouTubePlayerReady = false;
		break;
	}
	
	chainFunction = chainFunction.defaultFunction;
}

if (setOnYouTubePlayerReady) {
	window.onYouTubePlayerReady = chainFunctionGenerator(window.onYouTubePlayerReady, chainFunctionId);
	window.onYouTubePlayerReady.add(elementSelector, 'elementSelector', false);
	window.onYouTubePlayerReady.add(eventLauncher, 'eventLauncher', false);
}

window.addEventListener('GMYtAddEventListenerReplaced', function(evt) {
	if ((evt.target.getAttribute('class').indexOf('html5-video-player') + 1)) {
		evt.target.addEventListener('onStateChange', (function() {
			var target = evt.target;
			
			var listener = function() {
				target.removeEventListener('onStateChange', listener);
				target.dispatchEvent(new CustomEvent('GMYtPlayerFirstStateChange', {bubbles: true, cancelable: true}));
			}
			
			return listener;
		})());
	}
});

//Capture player's custom events
HTMLDivElement.prototype._addEventListener = HTMLDivElement.prototype.addEventListener;
Object.defineProperty(HTMLDivElement.prototype, 'addEventListener', {configurable: true, enumerable: true,
	get: function() {
		return this._addEventListener;
	},

	set: function(val) {
		this._customEventListeners = [];
		this._addEventListener = (function() {
			var modAddEventListener = val;
			return function() {
				this._customEventListeners.push(arguments);
				modAddEventListener.apply(this, arguments);
			}
		})();
		
		this.dispatchEvent(new CustomEvent('GMYtAddEventListenerReplaced', {bubbles: true, cancelable: true}));
	}
});

HTMLDivElement.prototype._removeEventListener = HTMLDivElement.prototype.removeEventListener;
Object.defineProperty(HTMLDivElement.prototype, 'removeEventListener', {configurable: true, enumerable: true,
	get: function() {
		return this._removeEventListener;
	},

	set: function(val) {
		this._removeEventListener = (function() {
			var modRemoveEventListener = val;
			return function() {
				if (this._customEventListeners) {
					cusLisLoop: for (var celLength = this._customEventListeners.length, i = 0; i < celLength; i++) {
						if (arguments.length == this._customEventListeners[i].length) {
							for (var argLength = arguments.length, j = 0; j < argLength; j++) {
								if (arguments[j] !== this._customEventListeners[i][j]) {
									continue cusLisLoop;
								}
							}
							
							this._customEventListeners.splice(i, 1);
							break;
						}
					}
				}
				
				modRemoveEventListener.apply(this, arguments);
			}
		})();
		
		this.dispatchEvent(new CustomEvent('GMYtRemoveEventListenerReplaced', {bubbles: true, cancelable: true}));
	}
});