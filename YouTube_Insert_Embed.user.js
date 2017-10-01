// ==UserScript==
// @name        YouTube: Insert Embed
// @namespace   youtubeInsertEmbed
// @version     1.0
// @include     http://*youtube.com/*
// @include     https://*youtube.com/*
// @exclude     https://*.youtube.com/embed*
// @grant       none
// ==/UserScript==

var menuItemHtml = '<li id="GMYt_insertEmbed">'+
	'<style>#GMYt_insertEmbed button:before {width: 16px; height: 16px; margin-left: -2px; margin-right: 12px; background: url(data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20style%3D%22fill%3D%23000000%22%20enable-background%3D%22new%200%200%201000%201000%22%20viewBox%3D%220%200%201000%201000%22%20y%3D%220px%22%20x%3D%220px%22%20version%3D%221.1%22%3E%3Cpath%20d%3D%22M%20990%2C500.1%20C%20990%2C770.6%20770.6%2C990%20500%2C990%20362.4%2C990%20238.9%2C932.6%20150%2C841.2%20V%20920%20c%200%2C23.2%20-18.8%2C42%20-42%2C42%20-23.2%2C0%20-42%2C-18.8%20-42%2C-42%20V%20724%20c%200%2C-23.2%2018.8%2C-42%2042%2C-42%20h%20196%20c%2023.2%2C0%2042%2C18.8%2042%2C42%200%2C23.2%20-18.8%2C42%20-42%2C42%20H%20194.9%20c%2074.3%2C85.4%20183%2C140%20305.1%2C140%20224.2%2C0%20406%2C-181.8%20406%2C-406%200%2C-4.7%201.29574%2C-10.24787%201.19574%2C-21.58294%20l%202.07819%2C-11.84834%20c%209.59147%2C-14.7782%2022.3218%2C-9.51659%2040.6218%2C-9.51659%2018.2%2C0%2032.82607%2C-0.52227%2038.72607%2C15.67773%20L%20989.3%2C486%20c%200.1%2C4.7%200.7%2C9.3%200.7%2C14.1%20z%20M%20892%2C318%20H%20696%20c%20-23.2%2C0%20-42%2C-18.8%20-42%2C-42%200%2C-23.2%2018.8%2C-42%2042%2C-42%20H%20805.3%20C%20730.9%2C148.6%20622.1%2C94%20500%2C94%20280.5%2C94%20102.1%2C268.3%2094.7%2C486%20H%2094.043602%20C%2093.930806%2C520.20948%2070.3%2C514%2052%2C514%2033.8%2C514%2011.159968%2C516.94915%2010.904265%2C499.74408%20L%2010.7%2C486%20c%200.1%2C-2.6%200.5%2C-5%200.6%2C-7.6%20-0.3%2C-2.2%201.543602%2C-5.99573%201.543602%2C-8.29573%20C%2012.843602%2C465.00427%2011.2%2C462.1%2012.9%2C457.5%2034.6%2C207%20243.8%2C10%20500%2C10%20637.3%2C10%20761.2%2C66.8%20850%2C157.9%20V%2080%20c%200%2C-23.2%2018.8%2C-42%2042%2C-42%2023.2%2C0%2042%2C18.8%2042%2C42%20v%20196%20c%200%2C23.2%20-18.8%2C42%20-42%2C42%20z%22%20%2F%3E%3C%2Fsvg%3E) center no-repeat;}</style>'+
	'<button data-orientation="horizontal" data-position="topright" class="yt-ui-menu-item has-icon yt-uix-menu-close-on-select" type="button">'+
		'<span class="yt-ui-menu-item-label">Insert Embed</span>'+
	'</button>'+
'</li>';

var iconPreloadHtml = '<img style="display: none" src="data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3Adc%3D%22http%3A%2F%2Fpurl.org%2Fdc%2Felements%2F1.1%2F%22%20xmlns%3Ardf%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xml%3Aspace%3D%22preserve%22%20style%3D%22fill%3D%23000000%22%20enable-background%3D%22new%200%200%201000%201000%22%20viewBox%3D%220%200%201000%201000%22%20y%3D%220px%22%20x%3D%220px%22%20version%3D%221.1%22%3E%3Cpath%20d%3D%22M%20990%2C500.1%20C%20990%2C770.6%20770.6%2C990%20500%2C990%20362.4%2C990%20238.9%2C932.6%20150%2C841.2%20V%20920%20c%200%2C23.2%20-18.8%2C42%20-42%2C42%20-23.2%2C0%20-42%2C-18.8%20-42%2C-42%20V%20724%20c%200%2C-23.2%2018.8%2C-42%2042%2C-42%20h%20196%20c%2023.2%2C0%2042%2C18.8%2042%2C42%200%2C23.2%20-18.8%2C42%20-42%2C42%20H%20194.9%20c%2074.3%2C85.4%20183%2C140%20305.1%2C140%20224.2%2C0%20406%2C-181.8%20406%2C-406%200%2C-4.7%201.29574%2C-10.24787%201.19574%2C-21.58294%20l%202.07819%2C-11.84834%20c%209.59147%2C-14.7782%2022.3218%2C-9.51659%2040.6218%2C-9.51659%2018.2%2C0%2032.82607%2C-0.52227%2038.72607%2C15.67773%20L%20989.3%2C486%20c%200.1%2C4.7%200.7%2C9.3%200.7%2C14.1%20z%20M%20892%2C318%20H%20696%20c%20-23.2%2C0%20-42%2C-18.8%20-42%2C-42%200%2C-23.2%2018.8%2C-42%2042%2C-42%20H%20805.3%20C%20730.9%2C148.6%20622.1%2C94%20500%2C94%20280.5%2C94%20102.1%2C268.3%2094.7%2C486%20H%2094.043602%20C%2093.930806%2C520.20948%2070.3%2C514%2052%2C514%2033.8%2C514%2011.159968%2C516.94915%2010.904265%2C499.74408%20L%2010.7%2C486%20c%200.1%2C-2.6%200.5%2C-5%200.6%2C-7.6%20-0.3%2C-2.2%201.543602%2C-5.99573%201.543602%2C-8.29573%20C%2012.843602%2C465.00427%2011.2%2C462.1%2012.9%2C457.5%2034.6%2C207%20243.8%2C10%20500%2C10%20637.3%2C10%20761.2%2C66.8%20850%2C157.9%20V%2080%20c%200%2C-23.2%2018.8%2C-42%2042%2C-42%2023.2%2C0%2042%2C18.8%2042%2C42%20v%20196%20c%200%2C23.2%20-18.8%2C42%20-42%2C42%20z%22%20%2F%3E%3C%2Fsvg%3E">';

function getUrlParameter(parameter) {
	regexString = parameter + '=.*?(?=$|&)';
	regex = new RegExp(regexString);
	
	var resultParameter = regex.exec(window.location.href);
	
	if (resultParameter) {
		return resultParameter[0];
	}
}

function isWatchPage() {
	return !!(window.location.href.indexOf('youtube.com/watch') + 1);
}

function generateEmbedCode() {
	var embedTemplate = '<iframe id="<iframeId>" src="https://www.youtube.com/embed/<videoId>?<playlistId>&rel=0&autoplay=1&enablejsapi=1&showinfo=0&origin=https://www.youtube.com" style="width:100%;height:100%" frameborder="0" allowfullscreen></iframe>'
	var iframeId = 'GM_YtEmbedPlayer';
	var playlistId = getUrlParameter('list');
	var videoId = getUrlParameter('v');
	
	if (!videoId) {
		throw new TypeError('Invalid Video Id');
	}
	
	var embedCode = embedTemplate.replace('<iframeId>', iframeId);
	embedCode = embedCode.replace('<videoId>', videoId.replace('v=', ''));
	if (playlistId) {
		embedCode = embedCode.replace('<playlistId>', playlistId)
		embedCode = embedCode.replace('showinfo=0', 'showinfo=1')
	} else {
		embedCode = embedCode.replace('<playlistId>', '')
	}
	
	return embedCode;
}

function insertEmbed() {
	var ytPlayer = document.getElementById('movie_player');
	
	var embedPlayer = document.createElement('div');
	embedPlayer.innerHTML = generateEmbedCode();
	embedPlayer = embedPlayer.firstElementChild;
	
	if (ytPlayer) {
		ytPlayer.stopVideo();
	}
	
	var playerContainer = document.getElementById('player-mole-container');
	playerContainer.GMYtPreviousDisplayProp = playerContainer.style.display;
	playerContainer.style.display = 'none';
	
	var playlistContainer = document.getElementById('placeholder-playlist');
	playlistContainer.GMYtPreviousDisplayProp = playlistContainer.style.display;
	playlistContainer.style.display = 'none';
	
	document.getElementById('placeholder-player').firstElementChild.appendChild(embedPlayer);
}

function removeEmbed() {
	var embedPlayer = document.getElementById('GM_YtEmbedPlayer');
	var playerContainer = document.getElementById('player-mole-container');
	var playlistContainer = document.getElementById('placeholder-playlist');
	
	if (embedPlayer) {
		embedPlayer.remove();
	}
	
	if (playerContainer) {
		if (playerContainer.GMYtPreviousDisplayProp != null) {
			playerContainer.style.display = playerContainer.GMYtPreviousDisplayProp;
			delete playerContainer.GMYtPreviousDisplayProp;
		}
	}
	
	if (playlistContainer) {
		if (playlistContainer.GMYtPreviousDisplayProp != null) {
			playlistContainer.style.display = playlistContainer.GMYtPreviousDisplayProp;
			delete playlistContainer.GMYtPreviousDisplayProp;
		}
	}
}

function toggleEmbed() {
	var embedPlayer = document.getElementById('GM_YtEmbedPlayer');
	
	if (embedPlayer) {
		removeEmbed();
		
		var ytPlayer = document.getElementById('movie_player');
		if (ytPlayer) {
			ytPlayer.playVideo();
		}
	} else {
		insertEmbed();
	}
}

function menuHandler() {
	if (!document.getElementById('GMYt_insertEmbed')) {
		var menu = document.createElement('ul');
		menu.innerHTML = menuItemHtml;
		menu = menu.firstElementChild;
		
		document.getElementById('action-panel-overflow-menu').appendChild(menu);
		
		menu.addEventListener('click', toggleEmbed);
	}
}

function preloadIcon(parent) {
	var icon = document.createElement('div');
	icon.innerHTML = iconPreloadHtml;
	icon = icon.firstElementChild;
	
	parent.appendChild(icon);
}

function init() {
	if (!isWatchPage()) {
		return;
	}
	
	var panelOverflowButton = document.getElementById('action-panel-overflow-button');
	if (!panelOverflowButton.GMYtInsertEmbedMenuHandler) {
		panelOverflowButton.GMYtInsertEmbedMenuHandler = menuHandler;
		panelOverflowButton.addEventListener('click', panelOverflowButton.GMYtInsertEmbedMenuHandler);
		
		preloadIcon(panelOverflowButton);
	}
}

document.addEventListener('spfrequest', function() {
	if (isWatchPage()) {
		removeEmbed();
	}
});

document.addEventListener('spfdone', function() {
	init();
});

init();