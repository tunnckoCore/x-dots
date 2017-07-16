/*
 * Looper for YouTube
 * http://looperforyoutube.alvinhkh.com
 * Copyright (c) 2011-2016, AlvinHKH
 * http://alvinhkh.com
 * All rights reserved.
 */

to_be_translate = {
	"title": {
		"type": "title",
		"i18n": "extension_name"
	},
	"extension_name": {
		"type": "id",
		"i18n": "extension_name"
	},
	"text_welcome_translation": {
		"type": "id",
		"i18n": "text_welcome_translation",
		"html": true
	},
	"text_support": {
		"type": "id",
		"i18n": "text_support",
		"html": true
	},
	"option_button": {
		"type": "option"
	},
	"option_button_icon": {
		"type": "id"
	},
	"option_button_iconandtext": {
		"type": "id"
	},
	"option_button_text": {
		"type": "id"
	},
	"option_loop_manual": {
		"type": "option",
		"i18n": "option_manual_loop"
	},
	"option_loop_savestate": {
		"type": "option",
		"i18n": "option_savestate_loop"
	},
	"option_loop_auto": {
		"type": "option",
		"i18n": "option_auto_loop"
	},
	"ytShortcut": {
		"type": "option",
		"i18n": "option_keyboard_shortcut_loop"
	},
	"ytLoopPanel": {
		"type": "option",
		"i18n": "option_advanced_panel"
	},
	"title_extra_features": {
		"type": "id",
	},
	"ytShortcut_Pause": {
		"type": "option",
		"i18n": "option_keyboard_shortcut_pause"
	},
	"ytPlayerSize": {
		"type": "option",
		"i18n": "option_auto_player_size"
	},
	"option_small_size": {
		"type": "id"
	},
	"option_large_size": {
		"type": "id"
	},
	"option_full_size": {
		"type": "id"
	},
	"ytQuality": {
		"type": "option",
		"i18n": "option_auto_quality"
	},
	"option_auto": {
		"type": "id"
	},
	"text_experimental": {
		"type": "id"
	},
	"option_show_changelog": {
		"type": "option"
	},
	"text_not_compatible": {
		"type": "id"
	},
	"oldchrome-19": {
		"type": "id",
		"i18n": "text_outdate_chrome",
	},
	"title_feedback": {
		"type": "id"
	},
	"text_feedback": {
		"type": "id"
	},
	"chrome_web_store": {
		"type": "id"
	},
	"title_share": {
		"type": "id"
	},
	"twitter": {
		"type": "twitter",
		"i18n": "tweet"
	},
	"title_changelog": {
		"type": "id"
	},
	"text_full_changelog": {
		"type": "id"
	},
	"text_extension_by": {
		"type": "id"
	},
	"text_version": {
		"type": "id"
	},
}
/*
 * Function to translate to_be_translate
 */
var message = chrome.i18n.getMessage;
function translation(translate) {
	for (var element in translate) {
		var _element = null,
			type = translate[element].type,
			i18n = translate[element].i18n,
			isHtml = translate[element].html == true ? true : false;
		i18n = (i18n == null || i18n == "") ? element.toString() : i18n;
		switch (type) {
		case 'title':
			document.title = message(i18n);
			break;
		case 'twitter':
			_element = document.getElementById(element);
			_element.getElementsByClassName('twitter-share-button')[0].setAttribute('data-text', message(i18n));
			break;
		case 'option':
			_element = document.getElementById(element);
			if (_element && _element.parentElement)
			_element.parentElement.getElementsByTagName('span')[0].innerText = message(i18n);
			break;
		case 'id':
		default:
			_element = document.getElementById(element);
            if (_element != null)
			if (isHtml) {
				_element.innerHTML = message(i18n);
			} else {
				_element.innerText = message(i18n);
			}
			break;
		}
	}
}
/*
 * Function to show save message
 */
function showMessage(msg) {
	msg = msg ? msg : message('message_saved');
	document.getElementById('message_text').innerText = msg;
	setTimeout(function (){document.getElementById('message_text').innerHTML = "&nbsp;";}, 1000);
}

window.addEventListener ('DOMContentLoaded', function() {

if (self.location.search != '?embedded' || navigator.userAgent.match(/OPR\//) != null)
	document.body.className = document.body.className.replace(/( )?embedded/g, '');
if (self.location.search != '?embedded') {
	var element = document.createElement("link");
	if (typeof(element) != "undefined") {
		element.setAttribute("rel", "stylesheet");
		element.setAttribute("type", "text/css");
		element.setAttribute("media", "all");
		element.setAttribute("href", "options_input.css");
		document.getElementsByTagName("head")[0].appendChild(element);
	}
}

translation(to_be_translate);

// Get Options From Chrome-Sync via Chrome Storage API
try {
	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			var newValue;
			if (storageChange.newValue) {
				newValue = storageChange.newValue.toString();
			}
			if (key == 'ytAutoLoop') {
				document.getElementById('option_loop_manual').checked = false;
				document.getElementById('option_loop_savestate').checked = false;
				document.getElementById('option_loop_auto').checked = false;
				switch (newValue) {
				case 'true':
				case true:
					document.getElementById('option_loop_auto').checked = true;
					break;
				case 'saveState':
					document.getElementById('option_loop_savestate').checked = true;
					break;
				case 'false':
				case false:
				default:
					document.getElementById('option_loop_manual').checked = true;
					break;
				}
			}
			if (key == 'option_button' && document.getElementById(key))
				document.getElementById(key).value = newValue;
			if (key == 'ytShortcut' && document.getElementById(key))
				document.getElementById(key).checked = (newValue == 'true');
			if (key == 'ytLoopPanel' && document.getElementById(key))
				document.getElementById(key).checked = (newValue == 'true');
			if (key == 'ytShortcut_Pause' && document.getElementById(key))
				document.getElementById(key).checked = (newValue == 'true');
			if (key == 'ytPlayerSizeEnable' && document.getElementById(key))
				document.getElementById(key).checked = (newValue == 'true');
			if (key == 'ytPlayerSize' && document.getElementById(key))
				document.getElementById(key).value = newValue;
			if (key == 'ytQuality' && document.getElementById(key))
				document.getElementById(key).value = newValue;
			if (key == 'option_show_changelog' && document.getElementById(key))
				document.getElementById(key).checked = (newValue == 'true');
		}
	});
	chrome.storage.sync.get(null, function(value){
		switch(value['ytAutoLoop']) {
			case 'true':
			case 'false':
			case 'saveState':
				sessionStorage['option_auto_loop'] = value['ytAutoLoop']; 
				break;
			default: 
				sessionStorage['option_auto_loop'] = 'false'; 
				break;
		}
		switch(value['option_button']) {
			case 'all':
			case 'icon':
			case 'text':
				sessionStorage['option_button'] = value['option_button']; 
				break;
			default: 
				sessionStorage['option_button'] = 'all'; 
				break;
		}
		sessionStorage['ytShortcut'] = value['ytShortcut'] ? ( value['ytShortcut']=='false' ? 'false' : 'true' ) : 'true';
		sessionStorage['ytLoopPanel'] = value['ytLoopPanel'] ? ( value['ytLoopPanel']=='false' ? 'false' : 'true' ) : 'true';
		sessionStorage['ytShortcut_Pause'] = value['ytShortcut_Pause'] ? ( value['ytShortcut_Pause']=='true' ? 'true' : 'false' ) : 'false';
		sessionStorage['ytPlayerSizeEnable'] = value['ytPlayerSizeEnable'] ? ( value['ytPlayerSizeEnable']=='true' ? 'true' : 'false' ) : 'false';
		switch(value['ytPlayerSize']) {
			case 'fullsize':
			case 'wide':
			case 'normal':
				sessionStorage['ytPlayerSize'] = value['ytPlayerSize']; 
				break;
            case 'wider':
                sessionStorage['ytPlayerSize'] = 'wide';
			default: 
				sessionStorage['ytPlayerSize'] = 'normal'; 
				break;
		}
		switch(value['ytQuality']) {
			case 'highres':
			case 'hd1440':
			case 'hd1080':
			case 'hd720':
			case 'large':
			case 'medium':
			case 'small':
			case 'tiny':
				sessionStorage['ytQuality'] = value['ytQuality']; 
				break;
			default: 
				sessionStorage['ytQuality'] = 'default'; 
				break;
		}
		sessionStorage['option_show_changelog'] = value['option_show_changelog'] ? ( value['option_show_changelog']=='false' ? 'false' : 'true' ) : 'true';
		
		// Reset Sync Storage
		chrome.storage.sync.clear();
		chrome.storage.sync.set({
			ytAutoLoop: sessionStorage['option_auto_loop'],
			option_button: sessionStorage['option_button'],
			ytShortcut: sessionStorage['ytShortcut'],
			ytLoopPanel: sessionStorage['ytLoopPanel'],
			ytShortcut_Pause: sessionStorage['ytShortcut_Pause'],
			ytPlayerSizeEnable: sessionStorage['ytPlayerSizeEnable'],
			ytPlayerSize: sessionStorage['ytPlayerSize'],
			ytQuality: sessionStorage['ytQuality'],
			option_show_changelog: sessionStorage['option_show_changelog']
		}, function(){});
	});
} catch (e) {
	console.log('ERROR: YOUR BROWSER DO NOT SUPPORT CHROME.STORAGE API');
}

// Links
document.getElementById('support_page').href = 'http://looperforyoutube.alvinhkh.com/support';

// Click Actions - Save Options
document.getElementById('option_loop_manual').addEventListener ('click', function(){
	var id = 'option_loop_manual',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytAutoLoop: newValue.toString()}, showMessage);
}, false);
document.getElementById('option_loop_savestate').addEventListener ('click', function(){
	var id = 'option_loop_savestate',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytAutoLoop: newValue.toString()}, showMessage);
}, false);
document.getElementById('option_loop_auto').addEventListener ('click', function(){
	var id = 'option_loop_auto',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytAutoLoop: newValue.toString()}, showMessage);
}, false);
document.getElementById('option_button').addEventListener ('change', function(){
	var id = 'option_button',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	switch(newValue) {
		case 'all':
		case 'icon':
		case 'text':
			break; 
		default: 
			newValue = 'all'; 
			break;
	}
	if(chrome.storage) chrome.storage.sync.set({option_button: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytShortcut').addEventListener ('click', function(){
	var id = 'ytShortcut',
		newValue = document.getElementById(id).checked;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytShortcut: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytLoopPanel').addEventListener ('click', function(){
	var id = 'ytLoopPanel',
		newValue = document.getElementById(id).checked;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytLoopPanel: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytShortcut_Pause').addEventListener ('click', function(){
	var id = 'ytShortcut_Pause',
		newValue = document.getElementById(id).checked;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytShortcut_Pause: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytPlayerSizeEnable').addEventListener ('click', function(){
	var id = 'ytPlayerSizeEnable',
		newValue = document.getElementById(id).checked;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({ytPlayerSizeEnable: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytPlayerSize').addEventListener ('change', function(){
	var id = 'ytPlayerSize',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	switch(newValue) {
		case 'fullsize':
		case 'wide':
		case 'normal':
			break;
		default: 
			newValue = 'normal'; 
			break;
	}
	if(chrome.storage) chrome.storage.sync.set({ytPlayerSize: newValue.toString()}, showMessage);
}, false);
document.getElementById('ytQuality').addEventListener ('change', function(){
	var id = 'ytQuality',
		newValue = document.getElementById(id).value;
	if (!document.getElementById(id)) return false;
	switch(newValue) {
		case 'highres':
		case 'hd1440':
		case 'hd1080':
		case 'hd720':
		case 'large':
		case 'medium':
		case 'small':
		case 'tiny':
			break; 
		default: 
			newValue = 'default'; 
			break;
	}
	if(chrome.storage) chrome.storage.sync.set({ytQuality: newValue.toString()}, showMessage);
}, false);
document.getElementById('option_show_changelog').addEventListener ('click', function(){
	var id = 'option_show_changelog',
		newValue = document.getElementById(id).checked;
	if (!document.getElementById(id)) return false;
	if(chrome.storage) chrome.storage.sync.set({option_show_changelog: newValue.toString()}, showMessage);
}, false);

if (typeof ( chrome.runtime ) == 'object' && typeof ( chrome.runtime.getManifest ) == 'function') {
	// Get Version Number
	document.getElementById('version').innerText = chrome.runtime.getManifest().version;
	document.getElementById('versionGroup').style.display = 'inline';
	// Hide Old Chrome Message
	document.getElementById('text_outdate_chrome').style.display = 'none';
}

// Google Plus One Button
var _gponelang = 'en'; window.___gcfg = {lang: _gponelang}; (function() { var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true; po.src = 'https://apis.google.com/js/plusone.js'; var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s); })();

}, false);