// ==UserScript==
// @name        YouTube: Ready Event Launcher
// @description Generates custom events during youtube player's initialization
// @namespace   youtubeReadyEventLauncher
// @version     1.0
// @include     http://*youtube.com*
// @include     https://*youtube.com*
// @grant       none
// @run-at      document-start
// ==/UserScript==

function chainFunctionGenerator(defaultFunctionArg, chainNameArg) {
//Returns a modified function that runs the 'links'(functions) added to it, after running the links it runs an optional default function
//The arguments and return values are chained, the return value of a link passed as an argument to the next
	var chain = function() {
		if (chain.useExternalArgsAsChainData) {
			var chainData = arguments;
		} else {
			var chainData = undefined;
		}
		
		for (var i = 0; i < chain.links.length; i++) {
			try {
				chainData = chain.links[i].linkFunction.apply(this, chainData);
				chainData = [chainData];
			} catch(ex) {
				console.log(ex.message);
				
				if(!chain.links[i].continueOnException) {
					break;
				}
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
	//If enabled the first link gets the arguments passed to the function
	
	chain._link = function(functionArg, nameArg, continueOnExceptionArg) {
		this.name = nameArg;
		this.linkFunction = functionArg;
		this.continueOnException = continueOnExceptionArg;
	};
	
	chain.add = function(functionArg, name, continueOnException) {
	//Adds a new 'link', takes a function, a name, and a boolean indicating if the chain will continue executing if an exception happens
	//Returns the position of the 'link' in the chain
		retrun (chain.links.push(new chain._link(functionArg, name, continueOnException)) - 1);
	};
	
	chain.remove = function(position) {
	//Removes a 'link' from the specified position
		chain.links.splice(position, 1);
	};
	
	chain.insertAt = function(position, functionArg, name, continueOnException) {
	//Inserts a new link at the specified position, takes the same arguments as the 'add' method
		var insFunction = new chain._link(functionArg, name, continueOnException);
		chain.links.splice(position, 0, insFunction);
	};
	
	return chain;
}

function elementSelector(videoApi) {
//Takes the argument passed to 'onYoutubePlayerReady', uses the configuration to determine the caller video, and if it was not previously selected passes it to the next link in the chain
	var ytVideoId = videoApi.getUpdatedConfigurationData().attrs.id;
	var videoElement = document.getElementById(ytVideoId);
	var selectedFlag = 'GMYtSelected';
	
	if(!videoElement[selectedFlag]) {
		return videoElement;
	}
}

function eventLauncher(element) {
//Generates the custom event 'GMYtPlayerReady' on the selected video and flags it as selected
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
//Listens to the custom event 'GMYtAddEventListenerReplaced', checks if the element where the event was generated is a valid youtube video and raises a custom event 'GMYtPlayerFirstStateChange' 
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
