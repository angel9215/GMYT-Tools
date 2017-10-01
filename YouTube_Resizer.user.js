// ==UserScript==
// @name        YouTube: Resizer
// @namespace   yoututbeResizer
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// @run-at      document-start
// ==/UserScript==

function eventThrottler(time, functionArg) {
	this.timeout = null;
	this.throttleTime = time;
	this.eventFunction = functionArg;
	this.timeoutFunction;
	
	this.runEvent = (function(homeArg) {
		var home = homeArg;
		
		return function(evt) {
			if (home.timeout == null) {
				home.timeout = setTimeout((function(evt, element) {
					this.timeout = null;
					
					if (this.timeoutFunction) {
						this.timeoutFunction.apply(this, evt, element);
					}
				}).bind(home, evt, this), home.time);
				
				home.eventFunction.apply(this, evt);
			}
		}
	})(this);
}

function TranslateMouseEvent(player) {
	this.ytPlayer = player;
	
	this._translateEvent = function(originElement, destinationWidth, destinationHeight, evt) {
		var clickX = evt.clientX;
		var clickY = evt.clientY;
		
		var originElementRect = originElement.getBoundingClientRect();
		
		var xScale = originElementRect.width / destinationWidth;
		var yScale = originElementRect.height / destinationHeight;
		
		var elementClickX = clickX - originElementRect.x;
		var elementClickY = clickY - originElementRect.y;
		
		var destinationClickX = elementClickX / xScale;
		var destinationClickY = elementClickY / yScale;
		
		var changeX = elementClickX - destinationClickX;
		var changeY =  elementClickY - destinationClickY;
		
		var eventInit = {
			screenX: evt.screenX - changeX,
			screenY: evt.screenY - changeY,
			clientX: evt.clientX - changeX,
			clientY: evt.clientY - changeY,
			ctrlKey: evt.ctrlKey,
			shiftKey: evt.shiftKey,
			altKey: evt.altKey,
			metaKey: evt.metaKey,
			button: evt.button,
			buttons: evt.buttons,
			relatedTarget: evt.relatedTarget,
			bubbles: true,
			cancellable: true
		}
		
		return new MouseEvent(evt.type, eventInit);
	}
	
	this.redispatchEvent = function(evt) {
		if (!!evt.translated) {
			return;
		}
		
		var eventTarget = evt.target;
		var playerSize = this.ytPlayer.getPlayerSize();
		var newMouseEvent = this._translateEvent(this.ytPlayer, playerSize.width, playerSize.height, evt);
		
		newMouseEvent.translated = true;
		
		evt.preventDefault();
		evt.stopPropagation();
		evt.stopImmediatePropagation();
		
		eventTarget.dispatchEvent(newMouseEvent);
	}
}

function GMYtResizer(styleElement) {
	this.stylesheet = styleElement;
	
	this.relTargetPageWidth = .9;
	this.relContentWidth = .66;
	this.relSidebarWidth = .33;
	this.spacerSize = 10;
	
	this._playerHtmlTree = '<div class="player-width player-height"></div>';
	this._theatherMPlayerHtmlTree = '<div class="watch-wide watch-stage-mode"><div class="player-width player-height"></div></div>';
	this._playerSelector = '.player-width.player-height';
	
	this._headerElementId = 'masthead-positioner';
	
	this._cssRulesTemplate = '@media screen and (min-width: 1294px) and (min-height: 630px) {' +
	'#watch7-content {'+
	'	width: <contentWidth>;'+
	'}'+
	'#page.watch .content-alignment {'+
	'	max-width: <pageWidth>;'+
	'}'+
	'#watch7-preview {'+
	'	margin-top: -<playerHeight>;'+
	'}'+
	'#player-playlist .watch-playlist {'+
	'	left: <sidebarMargin>;'+
	'}'+
	'#watch7-sidebar {'+
	'	margin-left: <sidebarMargin>;'+
	'	top: calc(-<playerHeight> + 370px - 10px);'+
	'}'+
	'body .player-width {'+
	'	width: <playerWidth>;'+
	'}'+
	'body .player-height {'+
	'	height: <playerHeight>;'+
	'}'+
	'#player-api.player-api.player-width.player-height {'+
	'	width: <originalPlayerWidth>;'+
	'	height: <originalPlayerHeight>;'+
	'	transform-origin: 0 0;'+
	'	transform: scale(<playerScale>);'+
	'	'+
	'}'+
	'body .watch-stage-mode .player-width {'+
	'	width: <theaterMPlayerWidth>;'+
	'	left: calc(-<theaterMPlayerWidth> / 2);'+
	'}'+
	'body .watch-stage-mode .player-height {'+
	'	height: <theaterMPlayerHeight>;'+
	'}'+
	'.watch-stage-mode #player-playlist .watch-playlist {'+
	'	top: calc(<theaterMPlayerHeight> - 370px + 10px);'+
	'}'+
	'.watch-stage-mode #player-api.player-api.player-width.player-height {'+
	'	width: <originalTheaterMPlayerWidth>;'+
	'	height: <originalTheaterMPlayerHeight>;'+
	'	transform-origin: 0 0;'+
	'	transform: scale(<theaterMPlayerScale>);'+
	'	'+
	'}'+
	'}';
	
	this._getElementCss = function(htmlTreeString, elementSelector, property) {
		var temporaryElement = document.createElement('div');
		
		temporaryElement.innerHTML = htmlTreeString;
		
		selectedElement = temporaryElement.querySelector(elementSelector);
		
		var cssRules = getComputedStyle(selectedElement);
		
		if (property) {
			return cssRules[property];
		} else {
			return cssRules;
		}
	};
	
	this._replace = function(source, replaceList) {
		//Expects a list of objects each with a key and value properties (both strings)
		//Keys use a '<placeholder>' format
		//[{key:'<placeholder>', value: 'val'}]
		//The source uses the same placeholder format
		//source = 'Replace <me>'
		var result = source;
		
		var replaceExp;
		for (var i = 0; i < replaceList.length; i++) {
			replaceExp = new RegExp(replaceList[i].key, 'g');
			result = result.replace(replaceExp, replaceList[i].value);
		}
		
		return result;
	};
	
	this._calculateTargetProperties = function(viewportWidth, viewportHeight, playerWidth, playerHeight, theaterMPlayerWidth, theaterMPlayerHeight) {
		var pageTargetWidth = viewportWidth * this.relTargetPageWidth;
		var contentTargetWidth = (pageTargetWidth * this.relContentWidth) - this.spacerSize;
		var sidebarTargetWidth = pageTargetWidth * this.relSidebarWidth;
		var sidebarTargetMargin = contentTargetWidth + this.spacerSize;
		
		var viewportAspectRation = viewportWidth / viewportHeight;
		var playerAspectRatio = playerWidth / playerHeight;
		var theaterMPlayerAspectRatio = theaterMPlayerWidth / theaterMPlayerHeight;
		
		var theaterMPlayerTargetWidth, theaterMPlayerTargetHeight, theaterMPlayerTargetScale;
		if (viewportAspectRation > theaterMPlayerAspectRatio) {
			theaterMPlayerTargetHeight = viewportHeight;
			theaterMPlayerTargetWidth =  theaterMPlayerTargetHeight * theaterMPlayerAspectRatio;
		} else {
			theaterMPlayerTargetWidth = viewportWidth;
			theaterMPlayerTargetHeight = theaterMPlayerTargetWidth / theaterMPlayerAspectRatio;
		}
		theaterMPlayerTargetScale = theaterMPlayerTargetWidth / theaterMPlayerWidth;
		
		var playerTargetwidth = contentTargetWidth;
		var playerTargetHeight = playerTargetwidth / playerAspectRatio;
		var playerTargetScale = playerTargetwidth / playerWidth;
		
		return {pageWidth: Math.round(pageTargetWidth), contentWidth: Math.round(contentTargetWidth), sidebarWidth: Math.round(sidebarTargetWidth), sidebarMargin: Math.round(sidebarTargetMargin),
				theaterMPlayerWidth: Math.round(theaterMPlayerTargetWidth), theaterMPlayerHeight: Math.round(theaterMPlayerTargetHeight), theaterMPlayerScale: theaterMPlayerTargetScale,
				playerWidth: Math.round(playerTargetwidth), playerHeight: Math.round(playerTargetHeight), playerScale: playerTargetScale};
	}
	
	this.updateStylesheet = function() {
		var playerStyles = this._getElementCss(this._playerHtmlTree, this._playerSelector);
		var theaterMPlayerStyles = this._getElementCss(this._theatherMPlayerHtmlTree, this._playerSelector);
		
		var headerStyles = getComputedStyle(document.getElementById(this._headerElementId));
		
		var playerWidth = Number.parseInt(playerStyles.width);
		var playerHeight = Number.parseInt(playerStyles.height);
		var theaterMPlayerWidth = Number.parseInt(theaterMPlayerStyles.width);
		var theaterMPlayerHeight = Number.parseInt(theaterMPlayerStyles.height);
		
		var headerHeight = Number.parseInt(headerStyles.height);
		
		var targetProperties = this._calculateTargetProperties(document.documentElement.clientWidth, (document.documentElement.clientHeight - headerHeight), playerWidth, playerHeight, theaterMPlayerWidth, theaterMPlayerHeight);
		
		var replaceList = [{key: '<pageWidth>', value: targetProperties.pageWidth + 'px'},
		{key: '<contentWidth>', value: targetProperties.contentWidth + 'px'},
		{key: '<sidebarWidth>', value: targetProperties.sidebarWidth + 'px'},
		{key: '<sidebarMargin>', value: targetProperties.sidebarMargin + 'px'},
		{key: '<theaterMPlayerWidth>', value: targetProperties.theaterMPlayerWidth + 'px'},
		{key: '<theaterMPlayerHeight>', value: targetProperties.theaterMPlayerHeight + 'px'},
		{key: '<theaterMPlayerScale>', value: targetProperties.theaterMPlayerScale + ''},
		{key: '<playerWidth>', value: targetProperties.playerWidth + 'px'},
		{key: '<playerHeight>', value: targetProperties.playerHeight + 'px'},
		{key: '<playerScale>', value: targetProperties.playerScale + ''},
		{key: '<originalPlayerWidth>', value: playerWidth + 'px'},
		{key: '<originalPlayerHeight>', value: playerHeight + 'px'},
		{key: '<originalTheaterMPlayerWidth>', value: theaterMPlayerWidth + 'px'},
		{key: '<originalTheaterMPlayerHeight>', value: theaterMPlayerHeight + 'px'},
		];
		
		var cssRules = this._replace(this._cssRulesTemplate, replaceList);
		
		this.stylesheet.textContent = cssRules;
	}
}

document.addEventListener("DOMContentLoaded", function() {
	var stylesheet = document.getElementById('GM_YtResizer');
	
	if (!stylesheet) {
		stylesheet = document.createElement('style');
		stylesheet.setAttribute('id', 'GM_YtResizer');
		document.head.appendChild(stylesheet);
		
		stylesheet.GM_YtResizer = new GMYtResizer(stylesheet);
		
		var boundStylesheetUpdate = stylesheet.GM_YtResizer.updateStylesheet.bind(stylesheet.GM_YtResizer);
		
		document.addEventListener('spfdone', boundStylesheetUpdate);
		
		var reziseThrottler = new eventThrottler(150, boundStylesheetUpdate);
		reziseThrottler.timeoutFunction = boundStylesheetUpdate;
		
		window.addEventListener('resize', reziseThrottler.runEvent);
		
		document.addEventListener('GMYtPlayerReady', function(evt) {
			if (evt.target.getAttribute('id') == 'movie_player') {
				if (evt.target.GMYtMouseTranslate) {
					return;
				}
				
				var eventTranslator = new TranslateMouseEvent(evt.target);
				
				evt.target.getElementsByClassName('ytp-progress-bar-container')[0].addEventListener('mouseover', eventTranslator.redispatchEvent.bind(eventTranslator), true);
				evt.target.getElementsByClassName('ytp-progress-bar-container')[0].addEventListener('mousemove', eventTranslator.redispatchEvent.bind(eventTranslator), true);
				evt.target.getElementsByClassName('ytp-progress-bar-container')[0].addEventListener('mouseout', eventTranslator.redispatchEvent.bind(eventTranslator), true);
				
				evt.target.getElementsByClassName('ytp-progress-bar-container')[0].addEventListener('mousedown', eventTranslator.redispatchEvent.bind(eventTranslator), true);
				
				evt.target.GMYtMouseTranslate = true;
			}
		});
	}
	
	if (stylesheet) {
		stylesheet.GM_YtResizer.updateStylesheet();
	}
});