/*
 * Looper for YouTube
 * http://looperforyoutube.alvinhkh.com
 * Copyright (c) 2011-2017, AlvinHKH
 * http://alvinhkh.com
 * All rights reserved.
 */

var chromePage = "", 
  chromeInIncognito = false;
if (chrome.extension) {
  chromePage = chrome.extension.getURL('');
  chromeInIncognito = chrome.extension.inIncognitoContext;
}

// Check whether new version is installed
if (typeof(chrome.runtime) == 'object') {
  var thisVersion = chrome.runtime.getManifest().version;
  if (localStorage['yt-loop-show-changelog'] == "true" && localStorage['yt-loop-version'] && localStorage['yt-loop-version'] != thisVersion.toString()) {
    // check version number, if they are different, show changelog
    var changelog_url = "http://looperforyoutube.alvinhkh.com/changelog/updated";
    window.open(changelog_url, "changelogWindow");
  }
  // save current extension version
  localStorage['yt-loop-version'] = thisVersion;
}

function inject(func) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.appendChild(document.createTextNode("var chromePage = \"" + chromePage + "\";\n"));
  script.appendChild(document.createTextNode("var inIncognito = " + chromeInIncognito + ";\n"));
  script.appendChild(document.createTextNode("var player_reference;\n"));
  script.appendChild(document.createTextNode("if (typeof onYouTubePlayerReady != 'function'){onYouTubePlayerReady = function (player){player_reference = player;}}\n"));
  script.appendChild(document.createTextNode("(" + func + ")();"));
  document.addEventListener("DOMContentLoaded", function(event) { 
    document.body.appendChild(script);
  });
}

inject(function() {

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
var clog = console.log;
var cinfo = console.log;

function getCookieValue(a, b) {
  b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}

ytl = {
  
logging: [],
log: function() {
  var input = '';
  for (var i = 0; i < arguments.length; i++)
    input += arguments[i] + " ";
  if (ytl.isDebug) {
    clog.apply(console, ["[LOOPER FOR YOUTUBE]", input]);
    ytl.logging.push(input);
  }
},
info: function() {
  var input = '';
  for (var i = 0; i < arguments.length; i++)
    input += arguments[i] + " ";
  cinfo.apply(console, ["[LOOPER FOR YOUTUBE]", input]);
  ytl.logging.push(input);
},

isDebug: (localStorage['yt-loop-debug'] == 'true' ? true : false),
setDebug: function(bool) {
  if (bool == true) {
    localStorage['yt-loop-debug'] = true;
  } else {
    localStorage['yt-loop-debug'] = false;
    localStorage.removeItem('yt-loop-debug');
  }
  window.location.reload();
},

setVisitorCookies: function(value, reload) {
  ytl.log('Set YouTube Visitor as', (value == '' ? undefined : value));
  document.cookie="VISITOR_INFO1_LIVE=" + value + "; path=/; domain=.youtube.com";
  if (reload == true) {
    window.location.reload();
  }
},

/*
 * Initialise variables holders
 */
initialiseVariables: function() {
  ytl.log('Initialise Variables');

  // Static Variables
  ytl.layout = '';
  ytl.optionPage = chromePage ? chromePage + 'options.html' : null;
  ytl.qualityLevels = new Array("highres", "hd1440", "hd1080", "hd720", "large", "medium", "small", "tiny");
  ytl.session = sessionStorage;
  ytl.storage = localStorage;
  
  // Element Holders
  ytl.button = null;
  ytl.buttonContainer = null;
  ytl.buttonicon = null;
  ytl.buttoncontent = null;
  ytl.likebutton = null;
  ytl.sharebutton = null;
  ytl.panel = null;
  ytl.panelContainer = null;
  ytl.player = null;
  ytl.slider = null;
  ytl.sliderBar = null;
  
  // Event Holder
  ytl.getReadyTimes = 0;
  ytl.playAction = null;
  
  // Event Boolean
  ytl.autoPlayListenerAttach = false;
  ytl.setLoopEventloaded = false;
  ytl.urlChecked = false;
  ytl.windowResized = false;
  
  // Session Variables
  ytl.session['yt-duration'] = 0;
  ytl.session['yt-player-size'] = 'normal';
  ytl.session['yt-player-size-initial'] = 'normal';
  ytl.session['yt-loop'] = false;
  ytl.session['yt-loop-attached'] = false;
  ytl.session['yt-loop-autoclick'] = false;
  ytl.session['yt-loop-count'] = 10;
  ytl.session['yt-loop-th'] = 0;
  ytl.session['yt-loop-time'] = 0;
  ytl.session['yt-loop-timer'] = 10;
  ytl.session['yt-loop-incount'] = false;
  ytl.session['yt-loop-playlist-endplay'] = false;
  ytl.session['yt-loop-intimer'] = false;
  ytl.session['yt-loop-inportion'] = false;
  ytl.session['yt-loop-portion'] = JSON.stringify([]);
},

/*
 * Function to get locale strings from each message.json file
 * Limitation: Cannot idenfity placeholder in message.json
 */
localeFetch: function (locale, prefix) {
  locale = locale.replace("-", "_");
  var file = chromePage + "_locales/" + locale + "/messages.json";
  prefix = prefix ? prefix + "_" : "script_";
  var return_message = {};
  var xhr = new XMLHttpRequest();
  xhr.open("GET", file, false);
  xhr.onreadystatechange = function() {
    if(this.status == 200 && this.readyState == 4 && this.responseText != "") {
      var messages = JSON.parse(this.responseText);
      var return_array = {};
      for (var name in messages) {
        var regex = new RegExp("^" + prefix + "(.*)$", "g");
        if (name.match(regex)) {
          var attr = name.replace(regex, "$1");
          if (attr && messages[name] && messages[name].message != null) {
            return_array[attr] = messages[name].message;
          }
        }
      }
      return_message = return_array;
    }
  };
  try {
    xhr.send();
  }
  catch (e) {
  }
  return return_message;
},

/*
 * Corrent lang to the right locale
 */
getCorrectLocale: function (lang) {
  lang = lang.replace(/-/g,'_');
  switch (lang) {
  case "fr_CA":
    return "fr";
    break;
  case "pt":
  case "pt_PT":
    return "pt_BR";
    break;
  case "zh":
    return "zh_CN";
    break;
  case "en_GB":
  case "en_US":
    return "en";
    break;
  default:
    return lang;
  }
},

/*
 * Get translated text
 */
i18n: function (s) {
  // Initialise i18n Variables
  if (ytl.i18n == undefined)
    ytl.i18n = {};
  if (ytl.i18n['en'] == undefined)
    ytl.i18n['en'] = {};
  if (Object.keys(ytl.i18n['en']).length < 1)
    ytl.i18n['en'] = ytl.localeFetch("en");
  if (ytl.lang != undefined) {
    if (ytl.i18n[ytl.lang] == undefined)
      ytl.i18n[ytl.lang] = {};
    if (ytl.lang && Object.keys(ytl.i18n[ytl.lang]).length < 1)
      ytl.i18n[ytl.lang] = ytl.localeFetch(ytl.lang);
  }
  // Translate
  var r = '';
  if (r = ytl.i18n[ytl.lang][s]) {
    return r;
  } else if (ytl.i18n[ytl.lang][s] == '') {
    return '';
  } else if (r = ytl.i18n['en'][s]) {
    return r;
  } else {
    return '';
  }
},

/*
 * set all event listeners
 */
setEventListener: function () {
  window.removeEventListener('message', ytl.messageAction, false);
  window.addEventListener('message', ytl.messageAction, false);
  
  document.removeEventListener('keydown', ytl.keydownAction, false);
  document.addEventListener('keydown', ytl.keydownAction, false);
  
  if (ytl.playerObserver) ytl.playerObserver.disconnect();
  ytl.playerObserver = new MutationObserver(function (mutations) {
    mutations.forEach(ytl.observePlayerSize);
  });
  
  if (document.getElementsByTagName('ytd-app').length > 0) {
    ytl.playerObserver.observe(document.getElementsByTagName('ytd-app')[0], { attributes: true, subtree: false });
  } else if (document.getElementsByTagName('ytg-watch-page').length > 0) {
    ytl.playerObserver.observe(document.getElementsByTagName('ytg-watch-page')[0], { attributes: true, subtree: false });
  } else if (document.getElementById('page')) {
    ytl.playerObserver.observe(document.getElementById('page'), { attributes: true, subtree: false });
  } else if (document.getElementById('app')) {
    ytl.playerObserver.observe(document.getElementById('app'), { attributes: true, subtree: false });
  } else if (ytl.isDebug) {
    console.log('[LOOPER FOR YOUTUBE]', 'fail to find dom to observe player size change.');
  }
  
  window.removeEventListener('resize', ytl.windowResizedAction, false);
  window.addEventListener('resize', ytl.windowResizedAction, false);  
},

/*
 * set all variables related to elements
 */
setVariables: function () {
try {  
  ytl.lang = (
    yt.prefs.UserPrefs.prefs_.hl
    || document.documentElement.getAttribute("lang")
    || getCookieValue('PREF').replace(/^.*&?hl=([^&]*)&?.*$/i, '$1')
  ).replace(/-/g,'_');
  ytl.lang = ytl.getCorrectLocale(ytl.lang);
  ytl.player = ytl.getVariable('player');
  ytl.likebutton = document.getElementById('watch-like');
  ytl.layout = '2015';
  if (document.getElementsByTagName('ytd-video-primary-info-renderer').length > 0) {
    // 2017
    ytl.layout = '2017';
    ytl.buttonContainer = document.getElementsByClassName('ytd-video-primary-info-renderer')[0];
    if (ytl.buttonContainer.getElementsByTagName('ytd-menu-renderer').length > 0) {
      ytl.buttonContainer = ytl.buttonContainer.getElementsByTagName('ytd-menu-renderer')[0];
    }
    ytl.panelContainer = document.getElementsByTagName('ytd-video-secondary-info-renderer')[0].parentNode;
  } else if (document.getElementsByTagName('ytg-watch-footer').length > 0) {
    // 2016 Gaming
    ytl.layout = '2016';
    ytl.buttonContainer = document.getElementsByTagName('ytg-watch-footer')[0];
    if (ytl.buttonContainer.getElementsByClassName('actions').length > 0) {
      ytl.buttonContainer = ytl.buttonContainer.getElementsByClassName('actions')[0];
    }
    ytl.panelContainer = document.getElementsByTagName('ytg-watch-footer')[0];
  } else {
    // 2015
    ytl.buttonContainer = document.getElementById('watch8-secondary-actions');
    ytl.panelContainer = document.getElementById('watch8-action-panels') || document.getElementById('watch-action-panels');
    if (ytl.buttonContainer != null && ytl.buttonContainer.getElementsByClassName('action-panel-trigger-share').length > 0) {
      ytl.sharebutton = ytl.buttonContainer.getElementsByClassName('action-panel-trigger-share')[0];
    }
  }
} catch (e) {
  if(ytl.isDebug) console.debug('[LOOPER FOR YOUTUBE]', 'Error: '+e.message);
} finally {
  if (document.body != null) {
    document.body.className = document.body.className.replace(/( )?(ytl-201\d)/g, '');
    document.body.className += " ytl-" + ytl.layout;
  }
  ytl.setEventListener();
}
},

getUrlVars: function(s) {
  var v = {};  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,k,e) { v[k] = e;  });  return v[s] ? decodeURIComponent(v[s]) : null;
},

replaceUrlVar: function (s, value) {
  if(value==null || value == undefined) {
    window.history.replaceState(null, null, 
      window.location.href.replace(/([?&])+([^=&?]+)=([^&]*)/gi, function(o,m,k,e) { 
        if(k==s) if(m=='?') return m; else return ''; 
        else return m+k+'='+e; 
      })
    );
    return;
  }
  if(ytl.getUrlVars(s)) {
    window.history.replaceState(null, null, 
      window.location.href.replace(/([?&])+([^=&?]+)=([^&]*)/gi, function(o,m,k,e) { 
        if(k==s) return m+k+'='+value; 
        else return m+k+'='+e; 
      })
    );
  }
  else window.history.replaceState(null, null, window.location.href+'&'+s+'='+value); 
},

checkIf: function (c) {
  switch (c) {
    case 'inloop': return (ytl.session['yt-loop'] == 'true');
    case 'inloopPrevious': return (ytl.storage['yt-loop'] == 'true');
    case 'incount': return (ytl.session['yt-loop-incount'] == 'true' && ytl.getVariable('loopCount') > 0);
    case 'incountPrevious': return (ytl.storage['yt-loop-incount'] == 'true' && ytl.getVariable('loopCountPrevious') > 0);
    case 'intimer': return (ytl.session['yt-loop-intimer'] == 'true' && ytl.getVariable('loopTimer') > 0);
    case 'intimerPrevious': return (ytl.storage['yt-loop-intimer'] == 'true' && ytl.getVariable('loopTimerPrevious') > 0);
    case 'inportion': return (ytl.session['yt-loop-inportion'] == 'true');
    case 'loopdisplay': return ( (ytl.player!=null) && (ytl.button!=null) && (ytl.panel!=null) && (ytl.player.addEventListener!=null) && (document.getElementById('loop-button')!=null) && (document.getElementById('action-panel-loop')!=null) );
    case 'buttonDisable': if(ytl.likebutton) return (ytl.likebutton.getAttribute('disabled') && ytl.likebutton.getAttribute('disabled').toLowerCase() == 'true' && ytl.likebutton != 'null'); else return false;
    case 'playerSizeInitial': return ytl.session['yt-player-size-initial'];
    case 'playlistExist': {
      if (ytl.layout == '2017' || ytl.layout == '2016') {
        return ytl.player.getPlaylist() && ytl.player.getPlaylist().length > 0;
      } else {
        return document.getElementById('watch-appbar-playlist') && ( !isNaN(Number(yt.config_.LIST_AUTO_PLAY_VALUE)) && Number(yt.config_.LIST_AUTO_PLAY_VALUE) >= 1 );
      }
    }
    case 'autoPlay': {
      if (ytl.ytAutoPlay() != null)
        return ytl.ytAutoPlay().checked;
      return false;
    }
    case 'autoPlayInitial': return (ytl.session['yt-autoplay-initial'] == 'true');
    case 'playlist-queue':
      var list = document.getElementsByClassName('watch-queue-items-list')[0];
      if (list) {
        return (list.childNodes.length > 0);
      }
      return false;
    case 'playlist-endplay': return (ytl.session['yt-loop-playlist-endplay'] == 'true');
    case 'playlist-endplayPrevious': return (ytl.storage['yt-loop-playlist-endplay'] == 'true');
    case 'url-loopCount': return (ytl.getUrlVars('loop') > 0 ? true : false);
    case 'url-loopTimer': return (ytl.getUrlVars('timer') > 0 ? true : false);
    case 'url-starttime': return (ytl.getUrlVars('start') ? true : false);
    case 'url-endtime': return (ytl.getUrlVars('end') ? true : false);
    case 'check-always': return false;
    case 'check-usually':
      return ytl.checkIf('check-always') || 
      ytl.checkIf('inportion') || 
      document.getElementsByClassName('video-stream').length > 0;
  }
},
getOption: function (o) {
  switch (o) {
  case 'autoLoop': 
    return (ytl.storage['yt-auto-loop'] == 'true');
  case 'buttonIcon':
    switch (ytl.storage['yt-loop-button']) {
      case 'all':
      case 'icon':
        return true;
      case 'text':
        return false;
        break;
    }
    return true;
    return (ytl.storage['yt-loop-icon'] == 'true');
  case 'buttonText':
    switch (ytl.storage['yt-loop-button']) {
      case 'all':
      case 'text':
        return true;
      case 'icon':
        return false;
        break;
    }
    return true;
  case 'defaultShowPanel':
    return ytl.getOption('showPanel');
  case 'playerSize':
    return (ytl.storage['yt-player-size'] ? ytl.storage['yt-player-size'] : 'normal');
  case 'playerSizeEnable':
    return (ytl.storage['yt-player-resize'] == 'true');
  case 'quality':
    switch (ytl.storage['yt-quality']) {
      case 'highres':
      case 'hd1440':
      case 'hd1080':
      case 'hd720':
      case 'large':
      case 'medium':
      case 'small':
      case 'tiny':
        return ytl.storage['yt-quality'];
        break;
    }
    return 'default';
  case 'saveStateLoop':
    return (ytl.storage['yt-auto-loop'] == 'saveState');
  case 'shortcut':
    return (ytl.storage['yt-loop-shortcut'] == 'true');
  case 'shortcut-pause':
    return (ytl.storage['yt-pause-shortcut'] == 'true');
  case 'showPanel':
    return (ytl.storage['yt-loop-options'] == 'true');
  }
},
getVariable: function (c, i) {
  switch (c) {
    case 'player':
      if (typeof player_reference === 'object' && typeof player_reference.getDuration == 'function') {
        if (ytl.isDebug) ytl.log('Player Object', 'player_reference from onYouTubePlayerReady');
        return player_reference;
      } else if (typeof window.yt.config_.PLAYER_REFERENCE === 'object') {
        if (ytl.isDebug) ytl.log('Player Object', 'yt.config_.PLAYER_REFERENCE');
        return window.yt.config_.PLAYER_REFERENCE;
      } else if (document.getElementById('movie_player') != null) {
        if (ytl.getReadyTimes > 10) {
          if (ytl.isDebug) ytl.log('Player Object', 'movie_player');
          return document.getElementById('movie_player');
        }
        return;
      } else if (typeof document.getElementsByClassName('html5-video-player')[0] === 'object') {
        if (ytl.isDebug) ytl.log('Player Object', 'html5-video-player');
        return document.getElementsByClassName('html5-video-player')[0];
      } else {
        return;
      }
    case 'loopCount':
      return Number(ytl.session['yt-loop-count']);
    case 'loopCounter':
      return Number(ytl.session['yt-loop-th']);
    case 'loopCountPrevious':
      return Number(ytl.storage['yt-loop-count']);
    case 'loopTime':
      return Number(ytl.session['yt-loop-time']);
    case 'loopTimer':
      return Number(ytl.session['yt-loop-timer']);
    case 'loopTimerPrevious':
      return Number(ytl.storage['yt-loop-timer']);
    case 'starttime':
      var i = i == null || i <= 0 ? 0 : i;
      var data = JSON.parse(ytl.session['yt-loop-portion']);
      if (data.length > i && data[i].start) {
        return parseInt(data[i].start);
      } else {
        return 0;
      }
    case 'endtime':
      var i = i == null || i <= 0 ? 0 : i;
      var data = JSON.parse(ytl.session['yt-loop-portion']);
      if (data.length > i && data[i].end) {
        return parseInt(data[i].end);
      } else {
        return 0;
      }
    case 'input-starttime':
      var starttime = document.getElementById('loop-start-time-0');
      return ytl.getSeconds(starttime.value);
    case 'input-endtime':
      var endtime = document.getElementById('loop-end-time-0');
      return ytl.getSeconds(endtime.value);
    case 'currenttime':
      return  (ytl.player.getCurrentTime != undefined) ? ytl.player.getCurrentTime() : false;
    case 'duration':
      return (ytl.player.getDuration != undefined) ? ytl.player.getDuration() : false;
    case 'playerstate':
      return (ytl.player.getPlayerState != undefined) ? ytl.player.getPlayerState() : false;
    case 'url-loopCount':
      return ytl.checkIf('url-loopCount') ? Number(ytl.getUrlVars('loop')) : Number(false);
    case 'url-loopTimer':
      return ytl.checkIf('url-loopTimer') ? Number(ytl.getUrlVars('timer')) : Number(false);
    case 'url-starttime':
      return ytl.checkIf('url-starttime') ? Math.floor(ytl.getSeconds(ytl.getUrlVars('start'))) : Number(false);
    case 'url-endtime':
      return ytl.checkIf('url-endtime') ? Math.floor(ytl.getSeconds(ytl.getUrlVars('end'))) : Number(false);
    case 'quality':
      return (ytl.player.getPlaybackQuality != undefined && ytl.qualityLevels.indexOf(ytl.player.getPlaybackQuality()) > 0) ? ytl.player.getPlaybackQuality() : false;
    case 'qualitySet':
      return ytl.session['yt-quality-set'];
    case 'availableQuality':
      return (ytl.player.getAvailableQualityLevels != undefined && ytl.player.getAvailableQualityLevels() != '') ? ytl.player.getAvailableQualityLevels() : [];
    case 'highestQuality':
      return (ytl.player.getAvailableQualityLevels != undefined && ytl.player.getAvailableQualityLevels() != '') ? ytl.player.getAvailableQualityLevels()[0] : false;
    case 'lowestQuality':
      return (ytl.player.getAvailableQualityLevels != undefined && ytl.player.getAvailableQualityLevels() != '') ? ytl.player.getAvailableQualityLevels()[ytl.player.getAvailableQualityLevels().length-2] : false;
  }
},
    
setVariable: function (variable, i, value) {
  switch (variable) {
    case 'starttime':
      var i = i == null || i <= 0 ? 0 : i;
      var portion = JSON.parse(ytl.session['yt-loop-portion']);
      if (portion.length > i && portion[i].start) {
        portion[i].start = value;
      } else {
        portion = [{start: value, end: ytl.getVariable('endtime', i)}];
      }
      ytl.session['yt-loop-portion'] = JSON.stringify(portion);
      break;
    case 'endtime':
      var i = i == null || i <= 0 ? 0 : i;
      var portion = JSON.parse(ytl.session['yt-loop-portion']);
      if (portion.length > i && portion[i].end) {
        portion[i].end = value;
      } else {
        portion = [{start: ytl.getVariable('starttime', i), end: value}];
      }
      ytl.session['yt-loop-portion'] = JSON.stringify(portion);
      break;
  }
},

getTime: function (i) {
  var num = Math.abs(i).toFixed(2).toString().split('.');
  var digit = (num.length > 1 && Number(num[1]) != 0) ? num[1] : '';
  i = Math.floor(i);
  var s = Math.floor(i % 60).toFixed(),
    m = Math.floor(i % (60 * 60) / 60).toFixed(),
    h = Math.floor(i / (60 * 60)).toFixed();
  s = (s < 10 ? '0' : '') + s;
  m = (m < 10 ? '0' : '') + m;
  h = (h == 0 ? '' : (h < 10 ? '0' : '') + h);
  return (h!='' ? h+':' : '') + m + ':' + s + (digit!='' ? '.'+digit : '');
},
getSeconds: function (t) {
  t = t.split(':');
  if (t.length>3||t.length<1) return 0;
  if (t.length == 3) {
    h = Number(t[0]); m = Number(t[1]); s = Number(t[2]);
  } else if (t.length == 2) {
    h = 0; m = Number(t[0]); s = Number(t[1]);
  } else {
    h = 0; m = 0; s = Number(t[0]);
  }
  return (h * 60 * 60) + (m * 60) + s;
},

updateButton: function() {
  var buttonType = ytl.getOption('buttonText') ? 'paper-button' : 'paper-icon-button';
  var button = document.createElement(buttonType);
  button.setAttribute('id', 'loop-toggle');
  button.setAttribute('class', 'style-scope ytd-toggle-button-renderer style-default');
  if (ytl.getOption('buttonIcon')) {
    var iconContainer = document.createElement('span');
    iconContainer.setAttribute('class', 'icon-container style-scope ' + buttonType);
    var icon = document.createElement('iron-icon');
    icon.setAttribute('class', 'style-scope ' + buttonType);
    //icon.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope iron-icon"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" class="style-scope iron-icon"></path></g></svg>';
    icon.innerHTML = '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" class="style-scope iron-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope iron-icon"> <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" class="style-scope iron-icon"></path> </g></svg>';
    var labelContainer = document.createElement('span');
    labelContainer.setAttribute('class', 'label-container');
    var label_auto = document.createElement('label');
    var label_disabled = document.createElement('label');
    var label_enabled = document.createElement('label');
    label_auto.className = 'auto';
    label_auto.innerText = 'A';
    labelContainer.appendChild(label_auto);
    label_disabled.className = 'disabled';
    label_disabled.innerText = '';
    labelContainer.appendChild(label_disabled);
    label_enabled.className = 'enabled';
    label_enabled.innerText = '✔';
    labelContainer.appendChild(label_enabled);
    
    iconContainer.appendChild(icon);
    iconContainer.appendChild(labelContainer);
    while (button.firstChild) {
      button.removeChild(button.firstChild);
    }
    button.appendChild(iconContainer);
  }
  if (ytl.getOption('buttonText')) {
    var text = document.createElement('yt-formatted-string');
    text.setAttribute('class', 'style-scope ytd-toggle-button-renderer style-default');
    text.innerText = ytl.i18n('button_text');
    button.appendChild(text);
  }
  return button;
},

setButton: function() {
  if(ytl.button && document.getElementById('loop-button')) return;
  if(ytl.buttonContainer == null) return;
  if (document.getElementById('loop-button')) {
    document.getElementById('loop-button').remove();
  }
  
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    
    var renderer = document.createElement('ytd-toggle-button-renderer');
    renderer.setAttribute('id', 'loop-button');
    renderer.setAttribute('class', 'loop-button');
    renderer.appendChild(ytl.updateButton());
    //var tooltip = document.createElement('paper-tooltip');
    //tooltip.setAttribute('class', 'style-scope ytd-toggle-button-renderer');
    //tooltip.innerText = ytl.i18n('button_hover');
    //renderer.appendChild(tooltip);
    renderer.addEventListener ('click', ytl.buttonAction);
    while (document.getElementById('loop-button')) {
      document.getElementById('loop-button').remove();
    }
    ytl.buttonContainer.insertBefore(renderer, ytl.buttonContainer.childNodes.length > 2 ? ytl.buttonContainer.childNodes[2] : ytl.buttonContainer.firstChild);
    ytl.button = document.getElementById('loop-button');
    
  } else {
    
    var button = document.createElement('button'), 
    icon_wrapper = document.createElement('span'),
    icon = document.createElement('span'),
    icon_valign = document.createElement('span'), 
    label_auto = document.createElement('label'),
    label_disabled = document.createElement('label'),
    label_enabled = document.createElement('label'),
    buttonContent = document.createElement('span'),
      buttonClassName = '';
      var disable = ytl.checkIf('buttonDisable');
    if (ytl.sharebutton != null)
      buttonClassName = ytl.sharebutton.getAttribute('class').replace('action-panel-trigger-share', '').replace('yt-uix-button-has-icon', '').replace('no-icon-markup', '').replace('pause-resume-autoplay', '');
    button.setAttribute('id', 'loop-button');
    button.setAttribute('class', 'loop-button ' + buttonClassName);
    button.setAttribute('type','button');
    if(!disable) button.setAttribute('title', ytl.i18n('button_hover'));
    button.setAttribute('onclick', ';return false;');
    button.setAttribute('data-trigger-for', 'action-panel-loop');
    button.setAttribute('data-button-toggle', 'true');
    button.setAttribute('role','button');
    if(disable) button.setAttribute('disabled', disable);
    icon_wrapper.className = 'yt-uix-button-icon-wrapper';
    icon.setAttribute('id', 'loop-button-icon');
    icon.className = 'yt-uix-button-icon yt-sprite';
    label_auto.className = 'auto';
    label_auto.innerText = 'A';
    icon.appendChild(label_auto);
    label_disabled.className = 'disabled';
    label_disabled.innerText = 'X';
    icon.appendChild(label_disabled);
    label_enabled.className = 'enabled';
    label_enabled.innerText = '✔';
    icon.appendChild(label_enabled);
    icon_wrapper.appendChild(icon);
    button.appendChild(icon_wrapper);
    buttonContent.id = 'loop-button-content';
    buttonContent.className = 'yt-uix-button-content';
    buttonContent.innerText = ytl.i18n('button_text');
    button.appendChild(buttonContent);
    button.addEventListener ('click', ytl.buttonAction);
    while (document.getElementById('loop-button')) {
      document.getElementById('loop-button').remove();
    }
    ytl.buttonContainer.insertBefore(button, ytl.buttonContainer.childNodes.length > 2 ? ytl.buttonContainer.childNodes[2] : ytl.buttonContainer.firstChild);
    
    ytl.button = document.getElementById('loop-button');
    ytl.buttonicon = document.getElementById('loop-button-icon');
    ytl.buttoncontent = document.getElementById('loop-button-content');
    
  }
},
buttonClick: function (s) { ytl.log('Button Click - Done'); if(ytl.button) return ytl.button.click(); },

setInfoPanel: function () {
  // show loop count and timer
  var info = document.createElement('div');
  info.className = 'loop-panel-info-container';
  
  var count = document.createElement('span');
  var counter = document.createElement('span');
  counter.id = 'loop-counter';
  count.appendChild(document.createTextNode(ytl.i18n('played_times')));
  count.appendChild(counter);
  count.appendChild(document.createTextNode(ytl.i18n('times_played')));
  
  var timer = document.createElement('span');
  var time = document.createElement('span');
  time.id = 'loop-timerTime';
  timer.appendChild(document.createTextNode(ytl.i18n('played_minutes')));
  timer.appendChild(time);
  timer.appendChild(document.createTextNode(ytl.i18n('minutes_played')));
  
  info.appendChild(count);
    if (ytl.isDebug) {
      info.appendChild(document.createTextNode(ytl.i18n('and')));
      info.appendChild(timer);
    }
  return info;
},
setCountInputPanel: function () {
  // Set loop count
  var count = document.createElement('div');
  count.className = 'loop-panel-count-container';
  var countCheckboxContainer = document.createElement('span');
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    var countCheckbox = document.createElement('paper-checkbox');
  } else {
    countCheckboxContainer.className = 'yt-uix-form-input-checkbox-container';
    var countCheckbox = document.createElement('input');
    countCheckbox.type = 'checkbox';
    countCheckbox.className = 'yt-uix-form-input-checkbox';
  }
  countCheckbox.name = 'loop-count-enable';
  countCheckbox.id = 'loop-count-checkbox';
  var countCheckboxElement = document.createElement('span');
  countCheckboxElement.className = 'yt-uix-form-input-checkbox-element';
  countCheckboxContainer.appendChild(countCheckbox);
  countCheckboxContainer.appendChild(countCheckboxElement);
  var countCheckboxLabel1 = document.createElement('label'),
    countCheckboxLabel2 = document.createElement('label');
  countCheckboxLabel1.setAttribute('for', 'loop-count-checkbox');
  countCheckboxLabel2.setAttribute('for', 'loop-count-checkbox');
  countCheckboxLabel1.innerText = ' '+ytl.i18n('loop_for_times');
  countCheckboxLabel2.innerText = ytl.i18n('times_loop');
  var countInput = document.createElement('input');
  countInput.type = 'text';
  countInput.id = 'loop-count';
  countInput.className = 'yt-uix-form-input-text';
  countInput.value = 10;
  countInput.maxlength = 4;
  
  count.appendChild(countCheckboxContainer);
  count.appendChild(countCheckboxLabel1);
  count.appendChild(countInput);
  count.appendChild(countCheckboxLabel2);
  
  var maxTimes = 999;
  countInput.addEventListener ('change', function() { 
    var t = Math.round(Number(countInput.value));
    if (ytl.getOption('showPanel') && t>=0) {
      ytl.session['yt-loop-count'] = t;
      ytl.storage['yt-loop-count'] = t;
    }
    countInput.value = ytl.getVariable('loopCount');
    if(ytl.checkIf('incount')) ytl.replaceUrlVar('loop', ytl.getVariable('loopCount'));
    ytl.checkAutoPlay();
    if(!ytl.checkIf('incount')) countCheckbox.click();
  }, false);
  countInput.addEventListener ('keydown', function(e){ 
    var k = e.keyCode, t = Math.round(Number(countInput.value));
    if (!ytl.getOption('showPanel')) return;
    if ( k == 38 || k == 40 ) {
      if ( k == 38 ) t += 1; else if ( k == 40 ) t-=1;
      if (t < 1) t = maxTimes;
      var count = ( t>0 && t<=maxTimes ) ? t : 1;
      ytl.session['yt-loop-count'] = count;
      ytl.storage['yt-loop-count'] = count;
      countInput.value = ytl.getVariable('loopCount').toFixed(0);
      if(ytl.checkIf('incount')) ytl.replaceUrlVar('loop', ytl.getVariable('loopCount'));
      ytl.checkAutoPlay();
    }
  }, false);
  countInput.addEventListener ('wheel', function(e){ 
    if (!ytl.getOption('showPanel')) return;
        if (countInput != document.activeElement) return;
    var t = Math.round(Number(countInput.value));
    e.preventDefault();
    t += (e.wheelDelta / 120);
    t = t.toFixed(0);
    var count = ( t>0 && t<=maxTimes ) ? t : 1;
    ytl.session['yt-loop-count'] = count;
    ytl.storage['yt-loop-count'] = count;
    
    countInput.value = ytl.getVariable('loopCount').toFixed(0);
    if(ytl.checkIf('incount')) ytl.replaceUrlVar('loop', ytl.getVariable('loopCount'));
    ytl.checkAutoPlay();
  }, false);
  countInput.addEventListener ('click', function(e){ 
    if (!ytl.getOption('showPanel')) return;
    if (countInput != document.activeElement) return;
    this.select();
  }, false);
  countCheckbox.addEventListener ('click', function(e) { 
    if (e.which==2) return;
    if (ytl.getOption('showPanel'))
    if (countCheckbox.checked) { 
      ytl.session['yt-loop-incount'] = true;
      ytl.storage['yt-loop-incount'] = true;
      ytl.replaceUrlVar('loop', ytl.checkIf('incount') ? ytl.getVariable('loopCount') : null);
      ytl.checkAutoPlay();
      return;
    }
    ytl.session['yt-loop-incount'] = false;
    ytl.storage['yt-loop-incount'] = false;
    ytl.replaceUrlVar('loop', null);
    ytl.checkAutoPlay();
    return;
  }, false);
  
  return count;
},

setTimerPanel: function () {
  var timer = document.createElement('div');
  timer.className = 'loop-panel-timer-container';
  var timerCheckboxContainer = document.createElement('span');
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    var timerCheckbox = document.createElement('paper-checkbox');
  } else {
    timerCheckboxContainer.className = 'yt-uix-form-input-checkbox-container';
    var timerCheckbox = document.createElement('input');
    timerCheckbox.type = 'checkbox';
    timerCheckbox.id = 'loop-timer-checkbox';
  }
  timerCheckbox.name = 'loop-timer-enable';
  timerCheckbox.className = 'yt-uix-form-input-checkbox';
  var timerCheckboxElement = document.createElement('span');
  timerCheckboxElement.className = 'yt-uix-form-input-checkbox-element';
  timerCheckboxContainer.appendChild(timerCheckbox);
  timerCheckboxContainer.appendChild(timerCheckboxElement);
  var timerCheckboxLabel1 = document.createElement('label'),
    timerCheckboxLabel2 = document.createElement('label');
  timerCheckboxLabel1.setAttribute('for', 'loop-timer-checkbox');
  timerCheckboxLabel2.setAttribute('for', 'loop-timer-checkbox');
  timerCheckboxLabel1.innerText = ' ' + ytl.i18n('loop_for_minutes');
  timerCheckboxLabel2.innerText = ytl.i18n('minutes_loop');
  var timerInput = document.createElement('input');
  timerInput.type = 'text';
  timerInput.id = 'loop-timer';
  timerInput.className = 'yt-uix-form-input-text';
  timerInput.value = 10;
  timerInput.maxlength = 4;
  
  timer.appendChild(timerCheckboxContainer);
  timer.appendChild(timerCheckboxLabel1);
  timer.appendChild(timerInput);
  timer.appendChild(timerCheckboxLabel2);
  
  var maxTimes = 1440;
  timerInput.addEventListener ('change', function() { 
    var t = Math.round(Number(timerInput.value));
    if (ytl.getOption('showPanel') && t>=0) {
      ytl.session['yt-loop-timer'] = t;
      ytl.storage['yt-loop-timer'] = t;
    }
    timerInput.value = ytl.getVariable('loopTimer');
    if (ytl.checkIf('intimer')) ytl.replaceUrlVar('timer', ytl.getVariable('loopTimer'));
    ytl.checkAutoPlay();
    if(!ytl.checkIf('intimer')) timerCheckbox.click();
  }, false);
  timerInput.addEventListener ('keydown', function(e){ 
    var k = e.keyCode, t = Math.round(Number(timerInput.value));
    if(!ytl.getOption('showPanel')) return;
    if ( k == 38 || k == 40 ) {
      if ( k == 38 ) t += 1; else if ( k == 40 ) t-=1;
      if (t < 1) t = maxTimes;
      var timer = ( t>0 && t<=maxTimes ) ? t : 1
      ytl.session['yt-loop-timer'] = timer;
      ytl.storage['yt-loop-timer'] = timer;
      timerInput.value = ytl.getVariable('loopTimer').toFixed(0);
      if(ytl.checkIf('intimer')) ytl.replaceUrlVar('timer', ytl.getVariable('loopTimer'));
      ytl.checkAutoPlay();
    }
  }, false);
  timerInput.addEventListener ('wheel', function(e){ 
    if(!ytl.getOption('showPanel')) return;
        if (timerInput != document.activeElement) return;
    var t = Math.round(Number(timerInput.value));
    e.preventDefault();
    t += (e.wheelDelta / 120);
    t = t.toFixed(0);
    var timer = ( t>0 && t<=maxTimes ) ? t : 1;
    ytl.session['yt-loop-timer'] = timer;
    ytl.storage['yt-loop-timer'] = timer;
    
    timerInput.value = ytl.getVariable('loopTimer').toFixed(0);
    if(ytl.checkIf('intimer')) ytl.replaceUrlVar('timer', ytl.getVariable('loopTimer'));
    ytl.checkAutoPlay();
  }, false);
  timerInput.addEventListener ('click', function(e){ 
    if (!ytl.getOption('showPanel')) return;
    if (timerInput != document.activeElement) return;
    this.select();
  }, false);
  timerCheckbox.addEventListener ('click', function(e) { 
    if (e.which==2) return;
    if(ytl.getOption('showPanel'))
    if(timerCheckbox.checked) { 
      ytl.session['yt-loop-intimer'] = true;
      ytl.storage['yt-loop-intimer'] = true;
      ytl.replaceUrlVar('timer', ytl.checkIf('intimer') ? ytl.getVariable('loopTimer') : null);
      ytl.checkAutoPlay();
      return;
    }
    ytl.session['yt-loop-intimer'] = false;
    ytl.storage['yt-loop-intimer'] = false;
    ytl.replaceUrlVar('timer', null);
    ytl.checkAutoPlay();
    return;
  }, false);
  
  return timer;
},

setEndPanel: function () {
  //
  var end = document.createElement('div');
  end.id = end.className = 'loop-panel-end-container';
  var countEndContainer = document.createElement('span');
  countEndContainer.id = 'loop-count-end';
  countEndContainer.className = 'yt-uix-button-group';
  countEndContainer.setAttribute('data-button-toggle-group', 'required');
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    var countEndStopButton = document.createElement('paper-button'),
      countEndPlayButton = document.createElement('paper-button');
  } else {
    var countEndStopButton = document.createElement('button'),
      countEndPlayButton = document.createElement('button');
    countEndStopButton.type = countEndPlayButton.type = 'button';
    countEndStopButton.role = countEndPlayButton.role = 'button';
    countEndStopButton.className = countEndPlayButton.className = 'yt-uix-button yt-uix-button-hh-text yt-uix-button-default yt-uix-button-short';
    countEndStopButton.className += ' yt-uix-button-toggled';
    countEndStopButton.setAttribute('data-button-toggle', 'true');
    countEndPlayButton.setAttribute('data-button-toggle', 'true');
  }
  countEndStopButton.id = 'loop-playlist-end-stop';
  countEndPlayButton.id = 'loop-playlist-end-play';
  countEndStopButton.className += ' start';
  countEndPlayButton.className += ' end';
  var countEndStopSpan = document.createElement('span'),
    countEndPlaySpan = document.createElement('span');
  countEndStopSpan.className = countEndPlaySpan.className = 'yt-uix-button-content';
  countEndStopSpan.innerText = ytl.i18n('stop_video');
  countEndPlaySpan.innerText = ytl.i18n('continue_to_play_playlist');
  countEndStopButton.appendChild(countEndStopSpan);
  countEndPlayButton.appendChild(countEndPlaySpan);
  countEndContainer.appendChild(countEndStopButton);
  countEndContainer.appendChild(countEndPlayButton);
  
  countEndStopButton.addEventListener ('click', function(e) { 
    if (e.which==2) return;
    if (ytl.getOption('showPanel') && ytl.checkIf('playlistExist')) { 
      ytl.session['yt-loop-playlist-endplay'] = false; 
      ytl.storage['yt-loop-playlist-endplay'] = false;
      countEndStopButton.className = countEndStopButton.className.replace(/( )?active/, '');
      countEndPlayButton.className = countEndPlayButton.className.replace(/( )?active/, '');
      countEndStopButton.className += ' active';
    }
    return;
  }, false);
  countEndPlayButton.addEventListener ('click', function(e) { 
    if (e.which==2) return;
    if (ytl.getOption('showPanel') && ytl.checkIf('playlistExist')) {
      ytl.session['yt-loop-playlist-endplay'] = true; 
      ytl.storage['yt-loop-playlist-endplay'] = true;
      countEndStopButton.className = countEndStopButton.className.replace(/( )?active/, '');
      countEndPlayButton.className = countEndPlayButton.className.replace(/( )?active/, '');
      countEndPlayButton.className += ' active';
    }
    return;
  }, false);
  
  end.appendChild(countEndContainer);
  return end;
},

setPortionPanel: function (panel) {
  // Set Portion Input
  var portion = document.createElement('div');
  portion.id = portion.className = 'loop-panel-portion-container';
  
  var portionCheckboxContainer = document.createElement('span');
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    var portionCheckbox = document.createElement('paper-checkbox');
    portionCheckbox.className = 'loop-portion-checkbox';
  } else {
    portionCheckboxContainer.className = 'yt-uix-form-input-checkbox-container';
    var portionCheckbox = document.createElement('input');
    portionCheckbox.type = 'checkbox';
    portionCheckbox.className = 'loop-portion-checkbox yt-uix-form-input-checkbox';
  }
  portionCheckbox.id = 'loop-portion-checkbox';
  portionCheckbox.name = 'loop-portion-enable';
  portionCheckboxContainer.appendChild(portionCheckbox);
  var portionCheckboxElement = document.createElement('span');
  portionCheckboxElement.className = 'yt-uix-form-input-checkbox-element';
  portionCheckboxContainer.appendChild(portionCheckboxElement);
  var portionCheckboxLabel1 = document.createElement('label'),
    portionCheckboxLabel2 = document.createElement('label'),
    portionCheckboxLabel3 = document.createElement('label'),
    portionCheckboxLabel4 = document.createElement('label');
  portionCheckboxLabel1.setAttribute('for', 'loop-portion-checkbox');
  portionCheckboxLabel2.setAttribute('for', 'loop-portion-checkbox');
  portionCheckboxLabel3.setAttribute('for', 'loop-portion-checkbox');
  portionCheckboxLabel4.setAttribute('for', 'loop-portion-checkbox');
  portionCheckboxLabel1.innerText = ' '+ytl.i18n('loop_in_portion_start');
  portionCheckboxLabel2.innerText = ytl.i18n('from');
  portionCheckboxLabel3.innerText = ytl.i18n('to');
  portionCheckboxLabel4.innerText = ytl.i18n('loop_in_portion_end');
  var startTime = document.createElement('input'), 
    endTime = document.createElement('input');
  startTime.type = endTime.type = 'text';
  startTime.className = endTime.className = 'yt-uix-form-input-text';
  startTime.value = endTime.value = '0';
  startTime.title = endTime.title = ytl.i18n('double_click_to_get_current_time');
  startTime.id = 'loop-start-time-0';
  endTime.id = 'loop-end-time-0';
  
  portion.appendChild(portionCheckboxContainer);
  portion.appendChild(portionCheckboxLabel1);
  portion.appendChild(portionCheckboxLabel2);
  portion.appendChild(startTime);
  portion.appendChild(portionCheckboxLabel3);
  portion.appendChild(endTime);
  portion.appendChild(portionCheckboxLabel4);

  // Set Slider
  var slider = document.createElement('div');
  slider.id = 'loop-slider-0';
  slider.className = 'loop-slider';
  var padding = document.createElement('div');
  padding.id = 'loop-slider-padding-0';
  padding.className = 'loop-slider-padding';
  padding.title = ytl.i18n('double_click_to_start_loop_in_portion');
  var startPoint = document.createElement('div');
  startPoint.className = 'loop-slider-pointer slider-start';
  var endPoint = document.createElement('div');
  endPoint.className = 'loop-slider-pointer slider-end';
  
  var arrow_start = document.createElement('div');
  arrow_start.className = 'loop-slider-arrow';
  var arrow_end = document.createElement('div');
  arrow_end.className = 'loop-slider-arrow';
  var timestamp_start = document.createElement('input');
  var timestamp_end = document.createElement('input');
  timestamp_start.type = timestamp_end.type = 'text';
  timestamp_start.className = timestamp_end.className = 'html5-progress-tooltip-timestamp';
  timestamp_start.value = timestamp_end.value = '00:00';
  timestamp_start.disabled = timestamp_end.disabled = 'true';
  timestamp_start.id = 'loop-slider-start-time-0';
  timestamp_start.className += ' loop-slider-timestamp';
  timestamp_end.id = 'loop-slider-end-time-0';
  timestamp_end.className += ' loop-slider-timestamp';
  var tooltip_start = document.createElement('div');
  var tooltip_end = document.createElement('div');
  tooltip_start.className = tooltip_end.className = 'loop-slider-tooltip html5-progress-tooltip';
  tooltip_start.title = tooltip_end.title = ytl.i18n('double_click_to_get_current_time');
  tooltip_start.className += ' slider-start';
  tooltip_end.className += ' slider-end';
  tooltip_start.appendChild(arrow_start);
  tooltip_start.appendChild(timestamp_start);
  tooltip_end.appendChild(arrow_end);
  tooltip_end.appendChild(timestamp_end);
  
  padding.appendChild(tooltip_start);
  padding.appendChild(startPoint);
  padding.appendChild(tooltip_end);
  padding.appendChild(endPoint);
  slider.appendChild(padding);
  
  var sliderContainer = document.createElement('div');
  sliderContainer.id = sliderContainer.className = 'loop-panel-slider-container';
  sliderContainer.appendChild(slider);
  
  // Add to Panel
  if (panel) {
    panel.appendChild(portion); 
    panel.appendChild(sliderContainer); 
  } else return false;

  // Event for input start time (change, key, mouse wheel)
  startTime.addEventListener('change', function(){
    var i = i == null || i <= 0 ? 0 : i;
    var duration = ytl.getVariable('duration'), t = ytl.getVariable('input-starttime');
    if(t<0) { startTime.value = ytl.getTime(0); ytl.replaceUrlVar('start', ytl.getVariable('starttime', i)); return; }
    if(t>=duration) { startTime.value = ytl.getTime(ytl.getVariable('starttime', i)); ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i))); return; }
    if (ytl.getOption('showPanel') && t<ytl.getVariable('endtime', i)) {
      ytl.setVariable('starttime', i, t);
    }
    startTime.value = ytl.getTime(ytl.getVariable('starttime', i));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
    ytl.sliderDisplay(i);
    if(!ytl.checkIf('inportion')) portionCheckbox.click();
  }, false);
  startTime.addEventListener ('keydown', function(e){ 
  var i = i == null || i <= 0 ? 0 : i;
  var k = e.keyCode, t = ytl.getVariable('starttime', i);
  if(!ytl.getOption('showPanel')) return;
  if ( k == 38 || k == 40 ) {
    if ( k == 38 ) t += 1; else if ( k == 40 ) t-=1;
    if ( t<ytl.getVariable('endtime', i) && t>=i ) {
      ytl.setVariable('starttime', i, t);
    }
    startTime.value = ytl.getTime(ytl.getVariable('starttime', i));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
    ytl.sliderDisplay(i);
  }
  }, false);
  startTime.addEventListener ('wheel', function(e){ 
    if (!ytl.getOption('showPanel')) return;
        if (startTime != document.activeElement) return;
    var i = i == null || i <= 0 ? 0 : i;
    var t = ytl.getVariable('starttime', i);
    e.preventDefault();
    t = t + Math.round(e.wheelDelta / 120);
    if ( t<ytl.getVariable('endtime', i) && t>=0 ) {
      ytl.setVariable('starttime', i, t);
    }
    startTime.value = ytl.getTime(ytl.getVariable('starttime', i));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
    ytl.sliderDisplay(i);
  }, false);
  startTime.addEventListener ('click', function(e){ 
    if (!ytl.getOption('showPanel')) return;
    if (startTime != document.activeElement) return;
    this.select();
  }, false);

  // Event for input end time (change, key, mouse wheel)
  endTime.addEventListener('change', function(){
    var i = i == null || i <= 0 ? 0 : i;
    var duration = ytl.getVariable('duration'), t = ytl.getVariable('input-endtime');
    if (t < 0) {
      endTime.value = ytl.getTime(ytl.getVariable('endtime', i));
      ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
      return;
    }
    if (t >= duration) t = duration;
    if (ytl.getOption('showPanel') && t>ytl.getVariable('starttime', i)) {
      ytl.setVariable('endtime', i, t);
    }
    endTime.value = ytl.getTime(ytl.getVariable('endtime', i));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
    ytl.sliderDisplay(i);
    if(!ytl.checkIf('inportion')) portionCheckbox.click();
  }, false);
  endTime.addEventListener('click', function(e){
    if (e.which==2) return;
    var i = i == null || i <= 0 ? 0 : i;
    if (isNaN(ytl.getVariable('endtime', i))) {
      ytl.setVariable('endtime', i, Math.floor(ytl.getVariable('duration')).toFixed(0));
      endTime.value = ytl.getTime(ytl.getVariable('endtime', i));
      if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
      ytl.sliderDisplay(i);
    }
    return;
  }, false);
  endTime.addEventListener('keydown', function(e){ 
      var i = i == null || i <= 0 ? 0 : i;
      var k = e.keyCode, t = ytl.getVariable('endtime', i);
      if(!ytl.getOption('showPanel')) return;
      if ( k == 38 || k == 40 ) {
        if ( k == 38 ) t += 1; else if ( k == 40 ) t-=1;
        if ( t<=ytl.getVariable('duration') && t>ytl.getVariable('starttime', i) ) {
          ytl.setVariable('endtime', i, t);
        }
        endTime.value = ytl.getTime(ytl.getVariable('endtime', i));
        if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
        ytl.sliderDisplay(i);
      }
  }, false);
  endTime.addEventListener('wheel', function(e){ 
    if(!ytl.getOption('showPanel')) return;
        if (endTime != document.activeElement) return;
    var i = i == null || i <= 0 ? 0 : i;
    var t = ytl.getVariable('endtime', i);
    e.preventDefault();
    t = t + Math.round(e.wheelDelta / 120);
    if ( t<=ytl.getVariable('duration') && t>ytl.getVariable('starttime', i) && t>=0 ) {
      ytl.setVariable('endtime', i, t);
    }
    endTime.value = ytl.getTime(ytl.getVariable('endtime', i));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
    ytl.sliderDisplay(i);
  }, false);
  endTime.addEventListener('click', function(e){ 
    if (!ytl.getOption('showPanel')) return;
    if (endTime != document.activeElement) return;
    this.select();
  }, false);

  // Event for Slider Actions
  startPoint.addEventListener('mousedown', function (event) {
    if (event.which == 2) return;
    window.addEventListener('mousemove', movingStartTime, false);
  }, false);
  endPoint.addEventListener('mousedown', function (event){
    if (event.which == 2) return;
    window.addEventListener('mousemove', movingEndTime, false);
  }, false);
  tooltip_start.addEventListener('mousedown', function (event) {
    if (event.which == 2) return;
    window.addEventListener('mousemove', movingStartTime, false);
  }, false);
  tooltip_end.addEventListener('mousedown', function (event){
    if (event.which == 2) return;
    window.addEventListener('mousemove', movingEndTime, false);
  }, false);
  window.addEventListener('mouseup', stopMove, false);
  function stopMove(event){
    if (event.which == 2) return;
    window.removeEventListener('mousemove', movingStartTime, false);
    window.removeEventListener('mousemove', movingEndTime, false);
    var i = i == null || i <= 0 ? 0 : i;
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
    ytl.sliderDisplay(i);
  }
  function movingStartTime(event){
    // Function for moving start time in slider
    var i = i == null || i <= 0 ? 0 : i;
    startPoint.style.zIndex = 11;
    endPoint.style.zIndex = 10;
    tooltip_start.style.zIndex = 11;
    tooltip_end.style.zIndex = 10;
    var _container = ytl.panel;
    var _containerOffsetLeft = 0;
    while (_container.offsetParent != null) {
      _containerOffsetLeft += _container.offsetLeft;
      _container = _container.offsetParent;
    }
    var duration = ytl.getVariable('duration');
    var pos = (((event.pageX-slider.offsetLeft-_containerOffsetLeft) / slider.offsetWidth) * 100 ).toFixed(4);
    if ( pos < 0 || pos > 100 ) return false;
    if ( parseInt(pos)+parseInt(padding.style.marginRight) > 99 ) return false;
    t = (parseInt(pos)/100*duration).toFixed(0);
    if ( t >= duration || t < 0 ) {
      t = 0;
    }
    ytl.setVariable('starttime', i, t);
    ytl.sliderDisplay(i);
  }
  function movingEndTime(event){
    // Function for moving end time in slider
    var i = i == null || i <= 0 ? 0 : i;
    startPoint.style.zIndex = 10;
    endPoint.style.zIndex = 11;
    tooltip_start.style.zIndex = 10;
    tooltip_end.style.zIndex = 11;
    var _container = ytl.panel;
    var _containerOffsetLeft = 0;
    while (_container.offsetParent != null) {
      _containerOffsetLeft += _container.offsetLeft;
      _container = _container.offsetParent;
    }
    var duration = ytl.getVariable('duration'),
      pos = (((slider.offsetWidth-event.pageX+slider.offsetLeft+_containerOffsetLeft) / slider.offsetWidth) * 100 ).toFixed(4);
    if ( pos < 0 || pos > 100 ) return false;
    if ( parseInt(pos)+parseInt(padding.style.marginLeft) > 99 ) return false;
    t = ((1-parseInt(pos)/100)*duration).toFixed(0);
    if ( t > duration || t <= ytl.getVariable('starttime', i) ) {
      t = duration
    }
    ytl.setVariable('endtime', i, t);
    ytl.sliderDisplay(i);
  }
  
  // Event to get current time
  function startTimeGetCurrent (e){
    e.stopPropagation();
    var i = i == null || i <= 0 ? 0 : i;
    var t = Math.floor(ytl.getVariable('currenttime'));
    if (ytl.getOption('showPanel')&&t<ytl.getVariable('endtime', i)) {
      ytl.setVariable('starttime', i, t);
    }
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
    ytl.sliderDisplay(i);
  }
  function endTimeGetCurrent (e){
    e.stopPropagation();
    var i = i == null || i <= 0 ? 0 : i;
    var t = Math.floor(ytl.getVariable('currenttime'));
    if (ytl.getOption('showPanel')&&t>ytl.getVariable('starttime', i)) {
      ytl.setVariable('endtime', i, t);
    }
    if(ytl.checkIf('inportion')) ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
    ytl.sliderDisplay(i);
  }
  startTime.addEventListener('dblclick', startTimeGetCurrent, false);
  tooltip_start.addEventListener('dblclick', startTimeGetCurrent, false);
  endTime.addEventListener('dblclick', endTimeGetCurrent, false);
  tooltip_end.addEventListener('dblclick', endTimeGetCurrent, false);
  
  // Event for toggle loop in portion
  portionCheckbox.addEventListener('click', function(e) {
    if (e.which==2) return;
    e.stopPropagation();
    var i = i == null || i <= 0 ? 0 : i;
    if (ytl.getOption('showPanel'))
    if (portionCheckbox.checked) {
      ytl.session['yt-loop-inportion'] = true;
      ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
      ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
      ytl.sliderDisplay(i);
      ytl.loopAction();
      return;
    }
    ytl.session['yt-loop-inportion'] = false;
    ytl.replaceUrlVar('start', null);
    ytl.replaceUrlVar('end', null);
    ytl.sliderDisplay(i);
    return;
  }, false);
  slider.addEventListener('dblclick', function(e) {
    if (e.which == 2) return;
    e.stopPropagation(); e.preventDefault();
    var i = i == null || i <= 0 ? 0 : i;
    if(ytl.getOption('showPanel'))
    if(ytl.checkIf('inportion') == false){
      ytl.session['yt-loop-inportion'] = true;
      ytl.replaceUrlVar('start', ytl.getTime(ytl.getVariable('starttime', i)));
      ytl.replaceUrlVar('end', ytl.getTime(ytl.getVariable('endtime', i)));
      ytl.loopAction();
      ytl.sliderDisplay(i);
      return;
    }
    ytl.session['yt-loop-inportion'] = false;
    ytl.replaceUrlVar('start', null);
    ytl.replaceUrlVar('end', null);
    ytl.sliderDisplay(i);
    return;
  }, false);
},
sliderDisplay: function (i) {
  var i = i == null || i <= 0 ? 0 : i;
  if(!ytl.slider||!ytl.sliderBar) return false;
  var duration = ytl.getVariable('duration'),
    starttime = ytl.getVariable('starttime', i),
    endtime = ytl.getVariable('endtime', i);
  ytl.sliderBar.style.marginLeft = (starttime/duration*100).toFixed(4) + '%';
  ytl.sliderBar.style.marginRight = ((1-(endtime/duration))*100).toFixed(4) + '%';
  ytl.sliderBar.style.background = ytl.checkIf('inportion') ? '#cc181e' : '#757575' ;
  document.getElementById('loop-portion-checkbox').checked = ytl.checkIf('inportion');
  document.getElementById('loop-start-time-' + i).value = ytl.getTime(starttime);
  document.getElementById('loop-end-time-' + i).value = ytl.getTime(endtime);
  document.getElementById('loop-slider-start-time-' + i).value = ytl.getTime(starttime);
  document.getElementById('loop-slider-end-time-' + i).value = ytl.getTime(endtime); 
},
setPanel: function() {
  if(ytl.panel && document.getElementById('action-panel-loop')) return;
  if(ytl.panelContainer==null) return;
  if (document.getElementById('action-panel-loop')) {
    document.getElementById('action-panel-loop').remove();
  }
  var content = document.createElement('div');
  content.setAttribute('id', 'action-panel-loop');
  var panelInsert = ytl.panelContainer.childNodes[0];
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    content.setAttribute('class', 'loop-panel');
  } else {
    content.setAttribute('class', 'action-panel-content hid');
    content.setAttribute('data-panel-loaded', 'true');
  }
    
  if(document.getElementById('watch-like'))
    document.getElementById('watch-like').addEventListener('click', function(e){
      if (e.which==2) return;
      ytl.panelDisplay('isfalse');
    });
  if (document.getElementById('action-panel-dismiss'))
    document.getElementById('action-panel-dismiss').addEventListener('click', function(e){
      if (e.which==2) return;
      ytl.panelDisplay('isfalse');
    });
  
  var option = document.createElement('div');
  option.className = 'loop-panel-optionslink-container';
  var optionsLink = document.createElement('a');
  optionsLink.setAttribute('id', 'options-page-link');
  optionsLink.setAttribute('href', ytl.optionPage);
  optionsLink.setAttribute('target', '_blank');
  optionsLink.innerText = ytl.i18n('options');
  if(ytl.optionPage && !inIncognito) option.appendChild(optionsLink);
  
  var tipsContainer = document.createElement('div');
  tipsContainer.id = 'loop-panel-tips-container';
  tipsContainer.style.textAlign = 'center';
  if (ytl.optionPage && !inIncognito && ytl.storage['ytl-hide-information'] != 'true') {
    var tipsSpace = document.createElement('div');
    tipsSpace.style.height = '12px';
    tipsContainer.appendChild(tipsSpace);
    var tipsContent = document.createElement('div');
    tipsContent.style.lineHeight = '16px';
    var tipsLink = document.createElement('a');
    tipsLink.setAttribute('href', ytl.optionPage);
    tipsLink.setAttribute('target', '_blank');
    tipsLink.style.color = '#A9382E';
    tipsLink.innerText = '** ' + ytl.i18n('information');
    var tipsHide = document.createElement('a');
    tipsHide.style.color = '#999';
    tipsHide.innerText = '(' + ytl.i18n('hide_info') + ')';
    tipsHide.addEventListener('click', function(e) {
      if (e.which == 2) return;
      ytl.storage['ytl-hide-information'] = true;
      tipsContainer.style.display = 'none';
    });
    tipsContent.appendChild(tipsLink);
    tipsContent.appendChild(document.createTextNode('  '));
    tipsContent.appendChild(tipsHide);
    tipsContainer.appendChild(tipsContent);
  }
  
  content.appendChild(option);
  content.appendChild(ytl.setInfoPanel());
  content.appendChild(ytl.setCountInputPanel());
  if (ytl.isDebug) {
    content.appendChild(ytl.setTimerPanel());
  }
  content.appendChild(ytl.setEndPanel());
  ytl.setPortionPanel(content);
  content.appendChild(tipsContainer);
  if (ytl.layout == '2017') {
    panelInsert.insertBefore(content, panelInsert.firstChild);
  } else if (ytl.layout == '2016') {
    panelInsert.parentNode.insertBefore(content, panelInsert.parentNode.childNodes.length > 1 ? panelInsert.parentNode.childNodes[1] : panelInsert.parentNode.firstChild);
  } else {
    panelInsert.parentNode.appendChild(content);
  }

  ytl.panel = document.getElementById('action-panel-loop');
  ytl.slider = document.getElementById('loop-slider-0');
  ytl.sliderBar = document.getElementById('loop-slider-padding-0');
},

setQuality: function (args) {
  var setQualityCount = 0;
  sessionStorage['loadVideoById'] = args && args.loadVideoById == true ? true : false;
  ytl.setQualityAction = function() {
    if (ytl.player == null) return false;
    if (ytl.getVariable('quality') == false) return false;
    if (ytl.isDebug) ytl.log('Quality before setQuality:', ytl.getVariable('quality'), setQualityCount);
    clearTimeout(ytl.setQualityAction);
    var setQualityAs = '';
    if (ytl.getOption('quality')) {
      setQualityAs = ytl.getOption('quality');
      if (setQualityAs != "default") {
        if ( ytl.qualityLevels.indexOf(ytl.getVariable('highestQuality')) > ytl.qualityLevels.indexOf(ytl.getOption('quality')) ) {
          // Set the highest quality available
          setQualityAs = ytl.getVariable('highestQuality');
        } else if ( ytl.qualityLevels.indexOf(ytl.getVariable('lowestQuality')) < ytl.qualityLevels.indexOf(ytl.getOption('quality')) ) {
          // Set the lowest quality available
          setQualityAs = ytl.getVariable('lowestQuality');
        }
        if ( ytl.qualityLevels.indexOf(ytl.getVariable('quality')) < ytl.qualityLevels.indexOf(ytl.getOption('quality')) ) {
          // Quality willing to set is worse than current quality
          // As-of Sept-2014, YouTube unable to handle this quality change
          // use loadVideoById as a workaround
          sessionStorage['loadVideoById'] = true;
        }
      }
    }
    ytl.session['yt-quality-set'] = setQualityAs;
    
    if (setQualityAs == false) {
      if (ytl.isDebug) ytl.log('Error: invalid quality level');
      if (ytl.getVariable('availableQuality').indexOf(ytl.getOption('quality')) > 0) {
        setQualityAs = ytl.getOption('quality');
        ytl.session['yt-quality-set'] = setQualityAs;
      } else {
        clearTimeout(ytl.setQualityAction);
        return false;
      }
    } else if (setQualityAs == ytl.getVariable('quality')) {
      // Nothing to do
      if (ytl.isDebug) ytl.log('PlaybackQuality Done.');
      clearTimeout(ytl.setQualityAction);
      setQualityCount = 0;
      return true;
    }
    
    /*if (sessionStorage['loadVideoById'] == "true" && setQualityCount < 1) {
      // Using loadVideoById API to reload video in certain quality
      sessionStorage['loadVideoById'] = false;
      if (typeof ytl.player.loadVideoById === 'function' && typeof ytl.player.getVideoData === 'function' && ytl.player.getVideoData().video_id) {
        var setTimeAs = 0;
        if (ytl.getVariable('currenttime') && parseInt(ytl.getVariable('currenttime')) > 0) {
          setTimeAs = parseInt(ytl.getVariable('currenttime'));
        } else {
          if (ytl.isDebug) ytl.log('Unable to get current time:', ytl.getVariable('currenttime'));
          setTimeAs = 1;
        }
        if (ytl.player.getPlaylistId() != null) {
          // In playlist
          //if (ytl.isDebug) ytl.log('Set Quality using loadPlaylist:', setQualityAs);
          //ytl.player.loadPlaylist({
          //  list: ytl.player.getPlaylistId(), 
          //  index: ytl.player.getPlaylistIndex(), 
          //  startSeconds: setTimeAs,
          //  suggestedQuality: setQualityAs
          //});
        } else {
          if (ytl.isDebug) ytl.log('Set Quality using loadVideoById:', setQualityAs);
          ytl.player.loadVideoById(ytl.player.getVideoData().video_id, setTimeAs, setQualityAs);
        }
      } else {
        if (ytl.isDebug) ytl.log('Error: unable to set Playback Quality using loadVideoById api');
      }
      setTimeout(ytl.setQualityAction, 1000);
    } else */
    if (setQualityCount > 5) {
      clearTimeout(ytl.setQualityAction);
      if (ytl.isDebug) ytl.log('Stop trying to set Playback Quality');
    } else {
      if (typeof ytl.player.setPlaybackQuality === 'function' && typeof ytl.player.getPlayerState === 'function' && ytl.player.getPlayerState() != -1) {
        if (ytl.isDebug) ytl.log('Set Quality using setPlaybackQuality:', setQualityAs);
        ytl.player.setPlaybackQuality(setQualityAs);
        
        if ( ytl.qualityLevels.indexOf(ytl.getVariable('highestQuality')) < ytl.qualityLevels.indexOf(ytl.getVariable('quality'))
          && ytl.qualityLevels.indexOf(ytl.getVariable('lowestQuality')) > ytl.qualityLevels.indexOf(ytl.getVariable('quality'))
          && (ytl.getOption('quality') != "default")
          && (ytl.getOption('quality') != ytl.getVariable('quality'))
        ) {
          
        } else if (ytl.getVariable('availableQuality').indexOf(setQualityAs) > 0 && setQualityAs != ytl.getVariable('quality')) {
          // Quality willing to set is available but not set
        } else {
          // Success
          if (ytl.isDebug) ytl.log('PlaybackQuality Done.');
          clearTimeout(ytl.setQualityAction);
        }
      } else {
        if (ytl.isDebug) ytl.log('Error: missing PlaybackQuality function');
      }
      setTimeout(ytl.setQualityAction, 1000);
    }
    
    if (ytl.isDebug) ytl.log('Quality after setQuality:', ytl.getVariable('quality'));
    setQualityCount++;
  }
  ytl.setQualityAction();
},
setPlayerSize: function(e) {
  if (ytl.player==null) return false;
  
  var _body = document.getElementById('body');
  var _page = document.getElementById('page');
  var _container = document.getElementById('watch7-container');
  var _player = document.getElementById('player-legacy') || document.getElementById('player');
  var _placeholder = document.getElementById('placeholder-player');
  
  if (_body==null) return false;
  if (_player==null) return false;
  if (_container==null) return false;
  if (ytl.getOption('playerSizeEnable') != true ) return false;

  _page.className = _page.className.replace(/( )?watch-(non-)?stage-mode/g, '').replace(/( )?watch-wide/g, '');
  _container.className = _container.className.replace(/( )?watch-wide/g, '');
    _player.className = _player.className.replace(/( )?watch-full/g, '');
  if (_placeholder != null) {
    _placeholder.className = _placeholder.className.replace(/( )?watch-full/g, '');
  }
  
  if (ytl.checkIf('playlist-queue')) {
    _page.className += ' watch-non-stage-mode';
        _player.className = _player.className.replace(/( )?watch-medium/g, '')
    _player.className += ' watch-small';
    if (_placeholder != null) {
        _placeholder.className = _placeholder.className.replace(/( )?watch-medium/g, '')
          _placeholder.className += ' watch-small';
    }
    document.cookie = "wide=0; path=/; domain=.youtube.com";
    setTimeout(function(){document.body.dataset.playerSize = 'small';}, 500);
    return;
  }
    
  if (ytl.getOption('playerSize') == 'normal') {
    _page.className += ' watch-non-stage-mode';
    _player.className += ' watch-small';
    if (_placeholder != null) {
      _placeholder.className += ' watch-small';
    }
    document.cookie = "wide=0; path=/; domain=.youtube.com";
    setTimeout(function(){document.body.dataset.playerSize = 'small';}, 500);
  } else if (ytl.getOption('playerSize') == 'wide' || ytl.getOption('playerSize') == 'fullsize') {
    _page.className += ' watch-stage-mode';
    if (_page.className.match('watch-wide') == null)
      _page.className += ' watch-wide';
    if (_container.className.match('watch-wide') == null)
      _container.className += ' watch-wide';
    if (ytl.getOption('playerSize') == 'fullsize' && _player.className.match('watch-full') == null) {
      _player.className = _player.className.replace(/( )?(watch-small|watch-full)/g, '');
      _player.className += ' watch-full';
      if (_placeholder != null) {
        _placeholder.className = _placeholder.className.replace(/( )?(watch-small|watch-full)/g, '');
        _placeholder.className += ' watch-full';
      }
    }
    if (ytl.getOption('playerSize') == 'wide' && _player.className.match('watch-medium') == null) {
      _player.className += ' watch-medium';
      if (_placeholder != null) {
        _placeholder.className += ' watch-medium';
      }
    }
    document.cookie = "wide=1; path=/; domain=.youtube.com";
    setTimeout(function(){document.body.dataset.playerSize = 'large';}, 500);
  }
  setTimeout(ytl.setFullWindowPlayerContent, 500);
},
setFullWindowPlayerContent: function() {
  var _player = document.getElementById('player-legacy') || document.getElementById('player');
  var _placeholder = document.getElementById('placeholder-player');
  var _container = document.getElementById('watch7-container');
    if (ytl.getOption('playerSize') == 'fullsize' && 
        document.getElementsByTagName('html')[0].className.match('content-snap-width-skinny-mode') == null && // new responsive mobile layout
        _player != null && _player.className.match('watch-full') != null &&
        ytl.session['yt-player-size'] != 'normal'
    ) {
        // Player Size
      if (document.getElementsByClassName('html5-video-player').length > 0) {
        if (document.getElementsByTagName('html')[0].getAttribute('data-player-size') != 'fullscreen' || document.getElementsByClassName('ytp-fullscreen').length < 1) {
          document.getElementsByClassName('html5-video-container')[0].style.width = document.getElementsByClassName('html5-video-player')[0].offsetWidth + 'px';
          document.getElementsByClassName('html5-video-container')[0].style.height = document.getElementsByClassName('html5-video-player')[0].offsetHeight + 'px';
        } else {
            document.getElementsByClassName('html5-video-container')[0].style.width = 'initial';
            document.getElementsByClassName('html5-video-container')[0].style.height = 'initial';
        }
      }
      if (_container != null) {
        if (_container.className.match('watch-wide') == null)
          _container.className += ' watch-wide';
      }
      if (_placeholder != null) {
          _placeholder.className = _placeholder.className.replace(/( )?(watch-small|watch-full)/g, '');
        _placeholder.className += ' watch-full';
      }
        // New YouTube Control UI
        if (document.getElementsByClassName('ytp-chrome-bottom').length > 0 && document.getElementsByClassName('html5-video-player').length > 0) {
            if (document.getElementsByClassName('ytp-fullscreen').length < 1) {
                document.getElementsByClassName('ytp-chrome-bottom')[0].style.left = 'initial';
                var _left = (document.getElementsByClassName('html5-video-player')[0].offsetWidth - document.getElementsByClassName('ytp-chrome-bottom')[0].offsetWidth)/2;
                document.getElementsByClassName('ytp-chrome-bottom')[0].style.marginLeft = (_left > 0 ? _left : 0) + 'px';
                setTimeout(function() {
                    var _left = (document.getElementsByClassName('html5-video-player')[0].offsetWidth - document.getElementsByClassName('ytp-chrome-bottom')[0].offsetWidth)/2;
                    if (document.getElementsByClassName('ytp-preview').length > 0)
                        document.getElementsByClassName('ytp-preview')[0].style.marginLeft = (_left > 0 ? _left : 0) + 'px';       
                }, 500);
            } else {
                document.getElementsByClassName('ytp-chrome-bottom')[0].style.left = '12px';
                document.getElementsByClassName('ytp-chrome-bottom')[0].style.marginLeft = 'initial';
                if (document.getElementsByClassName('ytp-preview').length > 0)
                document.getElementsByClassName('ytp-preview')[0].style.marginLeft = 'initial';  
            }
        }
        // Annotations
      if (document.getElementsByClassName('video-annotations').length > 0 && document.getElementsByClassName('html5-video-container').length > 0 && document.getElementsByClassName('video-stream').length > 0) {
        if (document.getElementsByTagName('html')[0].getAttribute('data-player-size') != 'fullscreen' || document.getElementsByClassName('ytp-fullscreen').length < 1) {
          var predictVideoHeight = ( document.getElementsByClassName('video-stream')[0].offsetWidth / parseInt(document.getElementsByClassName('video-stream')[0].style.width) ) * parseInt(document.getElementsByClassName('video-stream')[0].style.height);
          var VideoHeight = predictVideoHeight;
          var offsetVideoHeight = document.getElementsByClassName('video-stream')[0].offsetHeight;
          if (offsetVideoHeight > (predictVideoHeight / 2)) {
            document.getElementsByClassName('video-annotations')[0].style.top = ((offsetVideoHeight - predictVideoHeight) / 2) + 'px';
          } else {
            document.getElementsByClassName('video-annotations')[0].style.top = 'initial';
            VideoHeight = document.getElementsByClassName('video-stream')[0].offsetHeight;
          }
          document.getElementsByClassName('video-annotations')[0].style.WebkitTransform = 'scale(' + (document.getElementsByClassName('video-stream')[0].offsetWidth/parseInt(document.getElementsByClassName('video-stream')[0].style.width)) + ',' + (VideoHeight/parseInt(document.getElementsByClassName('video-stream')[0].style.height)) + ')';
                document.getElementsByClassName('video-annotations')[0].style.width = 'initial';
                document.getElementsByClassName('video-annotations')[0].style.marginLeft = (document.getElementsByClassName('html5-video-container')[0].offsetWidth - document.getElementsByClassName('video-stream')[0].offsetWidth)/2 + 'px';
        }
      }
        // Playlist
        if (document.getElementById('watch-appbar-playlist') && document.getElementsByClassName('html5-video-container').length > 0) {
            var _top = 360;
            if (document.getElementsByClassName('ytp-chrome-bottom').length == 0) {
                // Old Control UI
                _top = 390;
            }
            document.getElementById('watch-appbar-playlist').style.top = (document.getElementsByClassName('html5-video-container')[0].offsetHeight-_top) + 'px';
            var p_height = document.getElementById('watch-appbar-playlist').getElementsByClassName('main-content')[0].offsetHeight;
            if (p_height < 360) p_height = 360;
            document.getElementById('watch-appbar-playlist').style.setProperty('height', p_height + 'px', 'important');
        }
    } else {
        // Player Size
      if (document.getElementsByClassName('html5-video-container').length > 0) {
        document.getElementsByClassName('html5-video-container')[0].style.width = 'initial';
        document.getElementsByClassName('html5-video-container')[0].style.height = 'initial';
      }
      if (_player != null) {
        _player.className = _player.className.replace(/( )?(watch-full)/g, '');
      }
      if (_container != null) {
        _container.className = _container.className.replace(/( )?(watch-wide)/g, '');
      }
      if (_placeholder != null) {
        _placeholder.className = _placeholder.className.replace(/( )?(watch-full)/g, '');
      }
        // New YouTube Control UI
        if (document.getElementsByClassName('ytp-chrome-bottom').length > 0) {
            document.getElementsByClassName('ytp-chrome-bottom')[0].style.left = '12px';
            document.getElementsByClassName('ytp-chrome-bottom')[0].style.marginLeft = 'initial';
            if (document.getElementsByClassName('ytp-preview').length > 0)
            document.getElementsByClassName('ytp-preview')[0].style.marginLeft = 'initial';  
        }
        // Annotations
      if (document.getElementsByClassName('video-annotations').length > 0) {
            document.getElementsByClassName('video-annotations')[0].style.top = 'initial';
            document.getElementsByClassName('video-annotations')[0].style.width = 'initial';
            document.getElementsByClassName('video-annotations')[0].style.marginLeft = 'initial';
            document.getElementsByClassName('video-annotations')[0].style.WebkitTransform = 'initial';
      }
        // Playlist
        if (document.getElementById('watch-appbar-playlist')) {
            document.getElementById('watch-appbar-playlist').style.setProperty('top', null);
            document.getElementById('watch-appbar-playlist').style.setProperty('height', null);
        }
    }
},
windowResizedAction: function (e) {
  if (e && e.type && e.type == 'resize') {
    if (ytl.session['yt-player-size'] == 'normal') return false;
    ytl.setPlayerSize();
    ytl.log('Window resized.');
  }
},
observePlayerSize: function (mutation) {
  if (mutation && mutation.target && mutation.target.getAttribute('id') == 'page') {
        var _player = document.getElementById('player-legacy') || document.getElementById('player');
    var _currentSize;
        if (mutation.target.className.match('watch-non-stage-mode') != null) {
            _currentSize = 'normal';
        } else {
        if (_player.className.match('watch-small') != null) {
          _currentSize = 'normal';
        } else if (_player.className.match('watch-full') != null) {
          _currentSize = 'fullsize';
        } else if (_player.className.match('watch-medium') != null) {
          _currentSize = 'wide';
        } else {
          _currentSize = 'normal';
        }
        }
        if (ytl.session['yt-player-size'] != _currentSize) {
            setTimeout(ytl.setFullWindowPlayerContent, 100);
            ytl.log('Player resized.');
        }
    ytl.session['yt-player-size'] = _currentSize;
  }
},
setAutoLoop: function () {
  var autoLoopInterval = setInterval(function() {
    if (ytl.player==null) return false;
    if (!ytl.button) return false;
    // 
    clickButton = false;
    if (ytl.getOption('saveStateLoop')) {
      ytl.log('SaveStateLoop - Check');
      if (ytl.checkIf('inloop') != ytl.checkIf('inloopPrevious')) {
        clickButton = true;
        if (ytl.checkIf('playlist-endplayPrevious')) {
          if (ytl.checkIf('incountPrevious')) {
            ytl.session['yt-loop-incount'] = true;
            ytl.session['yt-loop-count'] = ytl.getVariable('loopCountPrevious');
          }
          if (ytl.checkIf('intimerPrevious')) {
            ytl.session['yt-loop-intimer'] = true;
            ytl.session['yt-loop-timer'] = ytl.getVariable('loopTimerPrevious');
          }
        }
      }
    } else if (ytl.getOption('autoLoop')) {
      ytl.log('AutoLoop - Check');
      if (!ytl.checkIf('inloop'))
        clickButton = true;
    }
    if (clickButton == true) {
      ytl.log('Toggle Click Button Action');
      if (typeof ytl.player.getPlayerState === 'function' && ytl.player.getPlayerState() != -1) {
        clearInterval(autoLoopInterval);
        ytl.session['yt-loop-autoclick'] = true;
        ytl.buttonClick();
      } else {
        ytl.log('Video is not started (maybe on ads).');
      }
    } else {
      clearInterval(autoLoopInterval);
    }
    ytl.buttonDisplay();
  }, 500);
},
setUrlLoop: function () {
  if(!ytl.button) return false;
  if (ytl.urlChecked == false) {
    ytl.urlChecked = true;
    if (ytl.checkIf('url-loopCount')) {
      ytl.log('URL - Loop '+ytl.getVariable('url-loopCount')+' times');
      ytl.session['yt-loop-count'] = ytl.getVariable('url-loopCount');
      ytl.storage['yt-loop-count'] = ytl.getVariable('url-loopCount');
      if (ytl.getVariable('url-loopCount')>1) {
        ytl.session['yt-loop-incount'] = true;
        ytl.storage['yt-loop-incount'] = true;
      }
    }
    if (ytl.checkIf('url-loopTimer')) {
      ytl.log('URL - Loop '+ytl.getVariable('url-loopTimer')+' minutes');
      ytl.session['yt-loop-timer'] = ytl.getVariable('url-loopTimer');
      ytl.storage['yt-loop-timer'] = ytl.getVariable('url-loopTimer');
      if (ytl.getVariable('url-loopTimer')>0) {
        ytl.session['yt-loop-intimer'] = true;
        ytl.storage['yt-loop-intimer'] = true;
      }
    }
    if (ytl.checkIf('url-starttime') || ytl.checkIf('url-endtime')) {
      var duration = ytl.getVariable('duration'), t = null;
      if(ytl.checkIf('url-starttime')) {
        var t = ytl.getVariable('url-starttime');
        if ( t >= 0 ) {
          if(t>=duration) t = 0;
          if( t<ytl.getVariable('endtime', 0) && (
            ytl.checkIf('url-endtime') && t<ytl.getVariable('url-endtime') ||
            !ytl.checkIf('url-endtime') )
          ) {
            ytl.setVariable('starttime', 0, t);
            ytl.session['yt-loop-inportion'] = true;
          }
        }
        ytl.log('URL - Loop in Portion - ST:' + ytl.getVariable('starttime', 0), ytl.session['yt-loop-portion']);
      }
      if(ytl.checkIf('url-endtime')) {
        var t = ytl.getVariable('url-endtime');
        if ( t >= 0 ) {
          if(t>=duration) t = duration;
          if( t>ytl.getVariable('starttime', 0) && (
            ytl.checkIf('url-starttime') && t>ytl.getVariable('url-starttime') ||
            !ytl.checkIf('url-starttime') )
          ) {
            ytl.setVariable('endtime', 0, t);
            ytl.session['yt-loop-inportion'] = true;
          }
        }
        ytl.log('URL - Loop in Portion - ET:' + ytl.getVariable('endtime', 0), ytl.session['yt-loop-portion']);
      }
    }
    if( (ytl.checkIf('url-loopCount')||ytl.checkIf('url-starttime')||ytl.checkIf('url-endtime')) && !ytl.checkIf('inloop') && !ytl.getOption('autoLoop') ) {
      ytl.session['yt-loop-autoclick'] = true;
      ytl.buttonClick();
    }
    ytl.loopAction();
  }
},
setLoopTime: function () {
  clearInterval(ytl.loopTimerAction);
  ytl.loopTimerAction = setInterval( function() {
        if (ytl.getVariable('playerstate') == 1)
    ytl.session['yt-loop-time'] = ytl.getVariable('loopTime') + 1;
    if (document.getElementById('loop-timerTime'))
      document.getElementById('loop-timerTime').innerText = ytl.getVariable('loopTime');
    if ( ytl.checkIf('inloop') && ytl.checkIf('intimer') && ytl.getVariable('loopTime') >= ytl.getVariable('loopTimer') ) {
      if (ytl.checkIf('playlist-endplay')) {
        ytl.player.nextVideo();
      } else {
        ytl.player.pauseVideo();
        ytl.player.seekTo(ytl.getVariable('starttime', 0), false);
      }
      ytl.log('Looped - in timer (loopTimerAction)');
    }
  }, 60000); // every minute
},

loopAction: function (s) {
  clearTimeout(ytl.playAction);
  
  if (s!=undefined) ytl.session['yt-loop-attached'] = true;
  if ( ytl.getVariable('endtime', 0) == '0' || ytl.getVariable('endtime', 0) == 'false' || (ytl.getVariable('endtime', 0) == ytl.session['yt-duration'] && Number(ytl.session['yt-duration']) != ytl.getVariable('duration')) ) {
    ytl.setVariable('endtime', 0, Math.floor(ytl.getVariable('duration')).toFixed(0));
  }
  if ( ytl.session['yt-duration'] == '0' || ytl.session['yt-duration'] == 'false' || Number(ytl.session['yt-duration']) != ytl.getVariable('duration') ) {
    ytl.session['yt-duration'] = ytl.getVariable('duration');
  }
  if (s && s.eventPhase) s = s.eventPhase;
  
  if (ytl.isDebug) console.log('[LOOPER FOR YOUTUBE]', ytl.checkIf('inloop'), 'at', ytl.getVariable('currenttime'), 'playerState:', s, ytl.getVariable('playerstate'));
  
  if ( ytl.checkIf('inloop') ) 
  ytl.playAction = setTimeout( function() {
    if ( ytl.getVariable('duration') == 0 ) {
      ytl.log('Error: duration is zero');
      return false;
    }
    
    if ( ytl.checkIf('inportion') && (ytl.getVariable('playerstate') > -1 || s > -1) ) {
      // Loop in Portion
      if(
        (ytl.getVariable('currenttime') >= ytl.getVariable('endtime', 0) - 0.1 && ytl.getVariable('currenttime') <= ytl.getVariable('endtime', 0) + 0.1) ||
        (ytl.getVariable('currenttime') > ytl.getVariable('endtime', 0) - 0.1) ||
        (ytl.getVariable('starttime', 0) > ytl.getVariable('currenttime') + 0.1)
      ) {
        if ( !ytl.checkIf('incount') || 
          ( ytl.checkIf('incount') && ytl.getVariable('loopCount') > ytl.getVariable('loopCounter') ) 
        ) {
          if(!(ytl.getVariable('starttime', 0) >= ytl.getVariable('currenttime')))
            ytl.session['yt-loop-th'] = ytl.getVariable('loopCounter')+1;
          ytl.player.pauseVideo();
          ytl.player.seekTo(ytl.getVariable('starttime', 0), true);
          ytl.player.playVideo();
          ytl.log('Looped - in portion');
        } else { 
          // Loop in count
          if (ytl.checkIf('playlistExist') && ytl.checkIf('playlist-endplay')) {
            // play next video in playlist
            ytl.player.nextVideo();
          } else {
            ytl.player.pauseVideo();
            ytl.player.seekTo(ytl.getVariable('starttime', 0), true);
          }
          ytl.log('Looped - in portion & count');
        }
        ytl.panelAction();
      }
    } else if ( ytl.checkIf('intimer') && ytl.getVariable('loopTime') >= ytl.getVariable('loopTimer') ) {
      // Loop in timer
      if ( ytl.getVariable('currenttime') > ytl.getVariable('starttime', 0) ) {
        if (ytl.checkIf('playlistExist') && ytl.checkIf('playlist-endplay')) {
          // play next video in playlist
          ytl.player.nextVideo();
        } else {
          ytl.stopAutoPlay();
          ytl.player.pauseVideo();
          ytl.player.seekTo(ytl.getVariable('starttime', 0), false);
        }
        ytl.log('Looped - in timer');
      } else {
        ytl.session['yt-loop-intimer'] = false;
        ytl.storage['yt-loop-intimer'] = false;
      }
      ytl.panelAction();
    } else if ( ytl.getVariable('currenttime') >= ytl.getVariable('duration') - 1 && (ytl.getVariable('playerstate') > -1 || s > -1) ) { 
      if( 
        !ytl.checkIf('incount') || 
        ( ytl.checkIf('incount') && ytl.getVariable('loopCount') > ytl.getVariable('loopCounter') ) 
      ){
        // Normal Loop
        ytl.stopAutoPlay();
        ytl.player.pauseVideo();
        ytl.player.seekTo(0, true);
        ytl.player.playVideo();
        ytl.checkAutoPlay();
        ytl.session['yt-loop-th'] = ytl.getVariable('loopCounter')+1;
        ytl.log('Looped - normal');
      } else if( ytl.checkIf('incount') && ytl.getVariable('loopCount') <= ytl.getVariable('loopCounter') ){
        // Loop in count
        if (ytl.checkIf('playlistExist') && ytl.checkIf('playlist-endplay')) {
          // play next video in playlist
          ytl.player.nextVideo();
        } else {
          ytl.stopAutoPlay();
          ytl.player.pauseVideo();
        }
        ytl.log('Looped - in count');
      }
      ytl.panelAction();
    }
    
    if ( s == -1 || ytl.getVariable('playerstate') == -1 ) {
      ytl.log('playerstate -1');
      ytl.player.seekTo(ytl.checkIf('check-usually') ? ytl.getVariable('starttime', 0) : 0, true);
      ytl.player.playVideo();
    }
    if ( ytl.getVariable('currenttime') == 0 && ytl.getVariable('playerstate') == 0 ) {
      ytl.log('currenttime 0, playerstate 0');
      ytl.player.stopVideo();
      ytl.player.seekTo(ytl.checkIf('check-usually') ? ytl.getVariable('starttime', 0) : 0, true);
      ytl.player.playVideo();
    }
  }, 1);
},

setLoopEvent: function () {
  if(ytl.isDebug) console.log('[LOOPER FOR YOUTUBE]', 'Attach loop action event to the button and Request options setting.');
  try {
    if (ytl.player==null || ytl.player != ytl.getVariable('player')) ytl.player = ytl.getVariable('player');
    if (ytl.player == player_reference || ytl.player == window.yt.config_.PLAYER_REFERENCE) {
      ytl.setLoopEventloaded = true;
      if (ytl.player == player_reference) {
        if (ytl.isDebug) ytl.log('REFERENCE PLAYER: onYouTubePlayerReady');
      }
      ytl.player.removeEventListener('onStateChange', ytl.loopAction, false);
      if (document.getElementsByClassName('video-stream').length > 0) {
        document.getElementsByClassName('video-stream')[0].removeEventListener('ended', ytl.loopAction, false);
        document.getElementsByClassName('video-stream')[0].addEventListener('ended', ytl.loopAction, false);
      } else {
        ytl.player.addEventListener('onStateChange', ytl.loopAction, false);
      }
    } else {
      ytl.log('Cannot find REFERENCE PLAYER', '(usually cause by using other youtube extensions at the same time)');
      return;
    }
  } catch (e) {
    if (ytl.isDebug) console.error('[LOOPER FOR YOUTUBE]', e);
    ytl.setLoopEventloaded = false;
    return;
  } finally {
    window.postMessage({type: 'loopActionDone'}, '*'); 
    window.postMessage({type: 'requestMessage'}, '*');
  }
},

panelDisplay: function (display) {
  if(!ytl.panel||!ytl.button) return false;
  
  ytl.button.className = ytl.button.className.replace(/( )?action-panel-trigger/g, '');
  
  if(ytl.getOption('showPanel') && !ytl.button.className.match('action-panel-trigger')) 
    ytl.button.className += ' action-panel-trigger';
    
  if( display == true || display == "action-panel-loop" ){
    var panelButtons = null;
    if (ytl.buttonContainer != null) {
      panelButtons = ytl.buttonContainer.getElementsByClassName('yt-uix-button-toggled');
    }
    for(i=0;i<panelButtons.length;i++)
      panelButtons[i].className = panelButtons[i].className.replace(/( )?yt-uix-button-toggled/g,'');
    setTimeout(function(){
      var panelContent = ytl.panelContainer.getElementsByClassName('action-panel-content');
      for(i=0;i<panelContent.length;i++) {
        if(panelContent[i].className.match('hid') == null) panelContent[i].className += ' hid';
        panelContent[i].style.display = 'none';
      }
      ytl.panel.className = ytl.panel.className.replace(/( )?hid/g, '');
      ytl.panel.style.display = 'block';
      if (ytl.panelContainer != null) {
        ytl.panelContainer.className = ytl.panelContainer.className.replace(/( )?hid/g, '');
        ytl.panelContainer.style.display = 'block';
      }
    }, 100);
  } else if (display == false) {
    ytl.panel.style.display = '';
    if (!ytl.panel.className.match('hid')) ytl.panel.className += ' hid';
    if (document.getElementById('action-panel-dismiss') != null)
      setTimeout(function(){document.getElementById('action-panel-dismiss').click();}, 100);
  } else {
    if (!ytl.panel.className.match('hid')) ytl.panel.className += ' hid';
    ytl.panel.style.display = 'none';
        var buttons = [];
    if (ytl.buttonContainer != null) {
      buttons = ytl.buttonContainer.getElementsByTagName('button');
    }
    for (i=0; i<buttons.length; i++) {
      if (buttons[i].getAttribute('data-trigger-for') == display) {
        buttons[i].click();
      }
    }
  }
},

panelAction: function () {
  if(!ytl.panel||!ytl.button) return false;
  
  if (ytl.getVariable('endtime', 0) == ytl.session['yt-duration'] && Number(ytl.session['yt-duration']) != ytl.getVariable('duration')) {
    ytl.setVariable('endtime', 0, Math.floor(ytl.getVariable('duration')).toFixed(0));
  }
  if ( ytl.session['yt-duration'] == '0' || ytl.session['yt-duration'] == 'false' || Number(ytl.session['yt-duration']) != ytl.getVariable('duration') ) {
    ytl.session['yt-duration'] = ytl.getVariable('duration');
  }
  if ( isNaN(ytl.getVariable('endtime', 0)) ) {
    ytl.setVariable('endtime', 0, Math.floor(ytl.getVariable('duration')).toFixed(0));
  } else if( ytl.getVariable('duration') && (ytl.getVariable('endtime', 0) > ytl.getVariable('duration')) ) {
    ytl.setVariable('endtime', 0, Math.floor(ytl.getVariable('duration')).toFixed(0));
  }
  
  ytl.sliderDisplay(0);
  if (ytl.getTime(ytl.getVariable('endtime', 0)).length > 5)
    document.getElementById('loop-start-time-0').style.width = document.getElementById('loop-end-time-0').style.width = "62px";
  
  if (document.getElementById('loop-counter')) document.getElementById('loop-counter').innerText = ytl.getVariable('loopCounter');
  if (document.getElementById('loop-timerTime')) document.getElementById('loop-timerTime').innerText = ytl.getVariable('loopTime');
  
  if (document.getElementById('loop-count-checkbox')) document.getElementById('loop-count-checkbox').checked = ytl.checkIf('incount');
  if (document.getElementById('loop-count')) {
    document.getElementById('loop-count').value = ytl.getVariable('loopCount');
    if (ytl.getVariable('loopCount') > 999)
      document.getElementById('loop-count').style.width = "40px";
  }
  ytl.replaceUrlVar('loop', ytl.checkIf('incount') ? ytl.getVariable('loopCount') : null);
  
  if (document.getElementById('loop-timer-checkbox')) document.getElementById('loop-timer-checkbox').checked = ytl.checkIf('intimer');
  if (document.getElementById('loop-timer'))
    document.getElementById('loop-timer').value = ytl.getVariable('loopTimer');
  ytl.replaceUrlVar('timer', ytl.checkIf('intimer') ? ytl.getVariable('loopTimer') : null);
  
  if (ytl.checkIf('playlistExist')) {
    if(document.getElementById('loop-panel-end-container')) document.getElementById('loop-panel-end-container').style.display = 'inline-block';
    if (ytl.checkIf('playlist-endplay') || ytl.checkIf('playlist-endplayPrevious')) {
      if(document.getElementById('loop-playlist-end-play')) document.getElementById('loop-playlist-end-play').click();
    } else {
      if(document.getElementById('loop-playlist-end-stop')) document.getElementById('loop-playlist-end-stop').click();
    }
  } else { 
    if(document.getElementById('loop-panel-end-container')) document.getElementById('loop-panel-end-container').style.display = 'none';
  }
},

buttonDisplay: function () {
  if (!ytl.button) return false;
  // button
  ytl.button.className = ytl.checkIf('inloop') ? ( ytl.button.className.match('yt-uix-button-toggled') ? ytl.button.className : ytl.button.className.replace('yt-uix-button yt','yt-uix-button yt-uix-button-toggled yt')) : ytl.button.className.replace(/( )?yt-uix-button-toggled/g,'');
  // button icon
  ytl.button.className = ytl.button.className.replace(/( )?button-show-icon/g,'');
  ytl.button.className += ytl.getOption('buttonIcon') ? ' button-show-icon' : '';
  // button text
  ytl.button.className = ytl.button.className.replace(/( )?button-show-text/g,'');
  ytl.button.className += ytl.getOption('buttonText') ? ' button-show-text' : '';
  // button icon label
  ytl.button.className = ytl.button.className.replace(/( )?loop-auto/g,'');
  ytl.button.className = ytl.button.className.replace(/( )?loop-enabled/g,'');
  ytl.button.className = ytl.button.className.replace(/( )?loop-disabled/g,'');
  if (ytl.getOption('autoLoop')) {
    ytl.button.className += ' loop-auto';
  }
  ytl.button.className += ytl.checkIf('inloop') ? ' loop-enabled' : ' loop-disabled';
},

buttonAction: function (e) {
  if( e != null && e.which == 2 ) return;
  if (ytl.getOption('showPanel') == false) ytl.panelDisplay(false);
  if ( ytl.checkIf('playlist-queue') ) {
    // Not working with google cast at this moment.
    ytl.button.setAttribute('title', ytl.i18n('button_hover_disabled_watchqueue'));
    ytl.button.setAttribute('data-tooltip-text', ytl.i18n('button_hover_disabled_watchqueue'));
  } else if (ytl.button.disabled != true) {
    ytl.button.setAttribute('title', ytl.i18n('button_hover'));
    ytl.button.setAttribute('data-tooltip-text', ytl.i18n('button_hover'));
  }
  if ( ytl.checkIf('inloop') == false ) {
    // Start Loop
    ytl.session['yt-loop'] = true;
    ytl.storage['yt-loop'] = true;
    ytl.session['yt-loop-th'] = 0;
    ytl.session['yt-loop-time'] = 0;
    ytl.session['yt-autoplay-initial'] = ytl.checkIf('autoPlay');
    ytl.setLoopTime();
    ytl.loopAction();
    ytl.checkAutoPlay();
    if( ytl.getOption('showPanel') && (ytl.panel!=null) ){
      // Panel
      ytl.panelAction();
      if (ytl.session['yt-loop-autoclick'] == 'true') {
        setTimeout(function() {
          ytl.panelDisplay(ytl.getOption('defaultShowPanel'));
        }, 500);
      } else {
        ytl.panelDisplay(true);
      }
    }
    if (ytl.checkIf('check-usually')) {
      document.getElementsByClassName('video-stream')[0].removeEventListener('timeupdate', ytl.loopAction, false);
      document.getElementsByClassName('video-stream')[0].addEventListener('timeupdate', ytl.loopAction, false);
    }
  } else {
    if ( ytl.checkIf('inloop') && ytl.panel!=null && ytl.panel.className.match('hid')!=null && ytl.getOption('showPanel') ) {
      ytl.panelDisplay(true);
    } else {
      // Stop Loop
      ytl.session['yt-loop'] = false;
      ytl.storage['yt-loop'] = false;
      ytl.checkAutoPlay();
      if( ytl.panel!=null && ytl.panel.className.match('hid')==null )
        ytl.panelDisplay(false);
      ytl.replaceUrlVar('loop', null);
      ytl.replaceUrlVar('timer', null);
      ytl.replaceUrlVar('start', null);
      ytl.replaceUrlVar('end', null);
      if (document.getElementsByClassName('video-stream').length > 0) {
        document.getElementsByClassName('video-stream')[0].removeEventListener('timeupdate', ytl.loopAction, false);
      }
    }
  }
  ytl.session['yt-loop-autoclick'] = false;
  setTimeout(ytl.buttonDisplay, 500);
  return;
},

playlistInit: null,

playlistRepeat: null,

playlistClear: function()
{
  if (!ytl.checkIf('playlistExist')) return;
  var videoList = document.getElementById('watch-appbar-playlist').getElementsByClassName('playlist-videos-list')[0];
  if (videoList) {
    var node = document.importNode(videoList, true);
    var _playing = node.getElementsByClassName('currently-playing')[0];
    ytl.playlistInit = document.adoptNode(videoList);
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
        node.appendChild(_playing);
        // Place single playing video in list
        var videoContainer = document.getElementById('watch-appbar-playlist').getElementsByClassName('playlist-videos-container')[0];
        videoContainer.appendChild(node);
    }
  var _playlist_repeat = document.getElementById('watch-appbar-playlist').getElementsByClassName('toggle-loop');
  if (_playlist_repeat.length > 0) {
        ytl.playlistRepeat = _playlist_repeat[0].className.match('yt-uix-button-toggled') != null;
    if (ytl.playlistRepeat == true)
      _playlist_repeat[0].click();
  }
  if (document.getElementById('watch-appbar-playlist'))
        document.getElementById('watch-appbar-playlist').style.display = 'none';
    var playlist_holder = document.getElementsByClassName('watch-playlist');
    if (playlist_holder.length > 0)
        for (i = 0; i < playlist_holder.length; i++)
            playlist_holder[i].style.display = 'none';
},

playlistReplace: function()
{
  if (ytl.checkIf('playlistExist') == false) return;
  if (ytl.playlistInit == null) return false;
    if (document.getElementById('watch-appbar-playlist')) {
      document.getElementById('watch-appbar-playlist').style.display = 'block'
    }
    var playlist_holder = document.getElementsByClassName('watch-playlist');
    if (playlist_holder.length > 0) {
        for (i = 0; i < playlist_holder.length; i++) {
            if (playlist_holder[i].id == "placeholder-playlist" &&
                ytl.session['yt-player-size'] == "normal") {
                playlist_holder[i].style.display = 'none'; 
            } else {
               playlist_holder[i].style.display = 'block'; 
            }
        }
    }
    if (ytl.playlistInit) {
    var videoContainer = document.getElementById('watch-appbar-playlist').getElementsByClassName('playlist-videos-container')[0];
        while (videoContainer.firstChild) {
      videoContainer.removeChild(videoContainer.firstChild);
    }
    videoContainer.appendChild(ytl.playlistInit);
    }
  var _playlist_repeat = document.getElementById('watch-appbar-playlist').getElementsByClassName('toggle-loop');
  if (_playlist_repeat.length > 0) {
    if (ytl.playlistRepeat == true)
      _playlist_repeat[0].click();
  }
},

ytAutoPlay: function() {
  if (ytl.layout == '2017' || ytl.layout == '2016') {
    if (document.getElementsByTagName('ytd-compact-autoplay-renderer').length > 0) {
      if (document.getElementsByTagName('ytd-compact-autoplay-renderer')[0].getElementsByTagName('paper-toggle-button').length > 0) {
        return document.getElementsByTagName('ytd-compact-autoplay-renderer')[0].getElementsByTagName('paper-toggle-button')[0];
      }
    }
  } else {
    return document.getElementById('autoplay-checkbox');
  }
  return null;
},

checkAutoPlay: function () {
  // Suggested AutoPlay
  if (ytl.ytAutoPlay() != null) {
    if (!ytl.checkIf('inloop') && ytl.checkIf('autoPlayInitial')) {
      ytl.ytAutoPlay().checked = true;
    } else {
      ytl.ytAutoPlay().checked = false;
    }
  }
},

stopAutoPlay: function() {
  var upnextCancelButton = document.getElementsByClassName('ytp-upnext-cancel-button');
  var upnextCloseButton = document.getElementsByClassName('ytp-upnext-close-button');
  var mouseClickEvent = new MouseEvent('click', {
    'view': window,
    'bubbles': true,
    'cancelable': false
  });
  if (upnextCancelButton.length > 0)
  upnextCancelButton[0].dispatchEvent(mouseClickEvent);
  if (upnextCloseButton.length > 0)
  upnextCloseButton[0].dispatchEvent(mouseClickEvent);
},

getReady: function () {
  try {
    ytl.getReadyTimes += 1;
    if (
      ytl.player == null ||
      ytl.player.addEventListener == null ||
      ytl.player != ytl.getVariable('player')
    )
      ytl.player = ytl.getVariable('player');
  
    if (ytl.button==null || document.getElementById('loop-button')==null) ytl.setButton(); else if (ytl.button) ytl.button.disabled = true;
    if (ytl.panel==null || document.getElementById('action-panel-loop')==null) ytl.setPanel();
  
    if (ytl.getVariable('starttime', 0) != 0) {
      ytl.setVariable('starttime', 0, 0);
    }
    if (ytl.getVariable('endtime', 0) == 0 && ytl.getVariable('duration')) {
      ytl.setVariable('endtime', 0, Math.floor(ytl.getVariable('duration')).toFixed(0));
    }
    if (ytl.session['yt-duration'] == '0' && ytl.getVariable('duration')) ytl.session['yt-duration'] = ytl.getVariable('duration');
    
    ytl.session['yt-player-size-initial'] = ytl.getOption('playerSize');

    // Suggested AutoPlay
    if (ytl.ytAutoPlay() != null) {
      // Check auto-play button click action
      if ( ytl.autoPlayListenerAttach == false ) {
        ytl.ytAutoPlay().addEventListener('change', function() {
          if( ytl.checkIf('inloop') ) ytl.buttonClick();
        });
        ytl.autoPlayListenerAttach = true;
      }
    } else {
      // Reset
      ytl.storage['yt-loop-playlist-endplay'] = false;
      ytl.storage['yt-loop-incount'] = false;
      ytl.storage['yt-loop-count'] = 10;
      ytl.storage['yt-loop-intimer'] = false;
      ytl.storage['yt-loop-timer'] = 10;
    }
  } catch (e) {
    ytl.log('getReady - Error:', e.message);
  } finally {
    if (ytl.getReadyTimes > 100) {
      ytl.log('Unable to get Ready');
      if (ytl.button) ytl.button.disabled = true;
      return;
    }
    if ( ytl.checkIf('loopdisplay') ) {
      if (ytl.player.addEventListener == null) {
        ytl.log('getReady - Restart'+' (ytl.player not set properly)');
        setTimeout(ytl.getReady, 100);
        return;
      }
      if( ytl.getVariable('endtime', 0) == 0 || Number(ytl.session['yt-duration']) == 0 ) { 
        ytl.log('getReady - Restart'+' (session of endtime / duration not set)');
        if(ytl.checkIf('buttonDisable')) {
          ytl.log('No Video on the page (Button Disabled)');
        } else {
          setTimeout(ytl.getReady, 100);
        }
      } else {
        ytl.log('getReady - Done');
        if (ytl.button) ytl.button.disabled = false;
        if(ytl.setLoopEventloaded == false) ytl.setLoopEvent();
      }
    } else {
      ytl.log('getReady - Restart'+' (Button not Display)');
      if(ytl.checkIf('buttonDisable')) {
        ytl.log('No Video on the page'+' (Button Disabled)');
      } else {
        setTimeout(ytl.getReady, 100);
      }
    }
  }
  return;
},

keydownAction: function (e) {
  if (ytl == null) return;
  if (!ytl.getOption('shortcut') && !ytl.getOption('shortcut-pause')) return;
  if (e.srcElement || e.target)
  if (e.target.localName=='input' || e.target.localName=='textarea' || e.srcElement.localName=='input' || e.srcElement.localName=='textarea') return;
  if (e.target.hasAttribute('contenteditable')) return;
  if (e.target.getAttribute('role') == 'textbox') return;
  var key = e.keyCode, keys = [80, 82, 32];
  if (!!e.shiftKey && key != 82) return; // is with shift key, and not r
  if (!ytl.getOption('shortcut') && (key == 80 || key == 82)) return;
  if (!ytl.getOption('shortcut-pause') && key == 32) return; 
  if ( keys.indexOf( e.which ) > -1 ) { e.stopPropagation(); e.preventDefault(); }
  switch(key) {
    case 80: // p
    case 82: // r
      ytl.buttonClick(); break;
    case 32: // spacebar
      if (document.getElementsByClassName('ytp-fullscreen').length < 1) // not in fullscreen
      if (!e.target.classList.contains('html5-video-player')) // not focus on player
      if (!e.target.classList.contains('ytp-progress-bar')) // not focus on progress bar
      if ( ytl.getVariable('playerstate') == 1 )
        ytl.player.pauseVideo();
      else
        ytl.player.playVideo(); 
      break;
  }
},

messageAction: function(e) {
  if (e.data.type)
  if (e.data.type == 'optionsMsg') {
    if (ytl.isDebug) console.debug(e);
    if ( (e.origin !== 'https://www.youtube.com') && (e.origin !== 'http://www.youtube.com') && (e.origin !== 'https://gaming.youtube.com') ) return;
    if (e.data.key!=undefined) {
      ytl.storage['yt-loop-shortcut'] = (e.data['key'] == true) ? 'true' : 'false';
    }
    if (e.data.auto!=undefined) {
      switch(e.data['auto']) {
        case 'true':
        case 'false':
        case 'saveState':
          ytl.storage['yt-auto-loop'] = e.data['auto']; 
          break;
        default: 
          ytl.storage['yt-auto-loop'] = 'false'; 
          break;
      }
      ytl.setAutoLoop();
    }
    if (e.data.button!=undefined) {
      switch(e.data['button']) {
        case 'all':
        case 'icon':
        case 'text':
          ytl.storage['yt-loop-button'] = e.data['button']; 
          break;
        default: 
          ytl.storage['yt-loop-button'] = 'all'; 
          break;
      }
      ytl.buttonDisplay();
      if (ytl.layout == '2017' || ytl.layout == '2016') {
        if (ytl.button != null) {
          while (ytl.button.firstChild) {
            ytl.button.removeChild(ytl.button.firstChild);
          }
          ytl.button.appendChild(ytl.updateButton());
        }
      }
    }
    if (e.data.panel!=undefined) {
      ytl.storage['yt-loop-options'] = (e.data['panel'] == true) ? 'true' : 'false';
    }
    if (e.data.pausekey!=undefined) {
      ytl.storage['yt-pause-shortcut'] = (e.data['pausekey'] == true) ? 'true' : 'false';
    }
    if (e.data.playersizeEnable!=undefined) {
      ytl.storage['yt-player-resize'] = (e.data['playersizeEnable'] == true) ? 'true' : 'false';
      ytl.setPlayerSize();
    }
    if (e.data.playersize!=undefined) {
      switch(e.data['playersize']) {
        case 'fullsize':
        case 'wide':
        case 'normal':
          ytl.storage['yt-player-size'] = e.data['playersize']; 
          break;
                case 'wider':
          ytl.storage['yt-player-size'] = 'wide'; 
          break;
        default: 
          ytl.storage['yt-player-size'] = 'normal'; 
          break;
      }
      ytl.setPlayerSize();
    }
    if (e.data.quality!=undefined) {
      switch(e.data['quality']) {
        case 'highres':
        case 'hd1440':
        case 'hd1080':
        case 'hd720':
        case 'large':
        case 'medium':
        case 'small':
        case 'tiny':
          ytl.storage['yt-quality'] = e.data['quality']; 
          break;
        default: 
          ytl.storage['yt-quality'] = 'default'; 
          break;
      }
      ytl.setQuality();
    }
    if (e.data.show_changelog!=undefined) {
      ytl.storage['yt-loop-show-changelog'] = (e.data['show_changelog'] == true) ? 'true' : 'false';
    }
    if (e.data.oldchrome!=undefined) {
      if (document.getElementById('options-page-link'))
        document.getElementById('options-page-link').style.display = 'none';
      if (document.getElementById('loop-panel-tips-container'))
        document.getElementById('loop-panel-tips-container').style.display = 'none';
    }
  } else if (e.data.type == 'resetHidePromotion') {
    ytl.storage['ytl-hide-information'] = false;
  } else if (e.data.type == 'loopActionDone') {
    if(ytl.isDebug) console.debug(e.data);
    ytl.setPlayerSize();
    ytl.setQuality();
    ytl.setAutoLoop();
    ytl.setUrlLoop();
    ytl.buttonDisplay();
  }
}

};

ytl.initiate = function () {
  ytl.logging = [];
  ytl.info('Debug Mode:', (localStorage['yt-loop-debug'] == 'true' ? true : false));
  ytl.info('Browser is in Incognito window: ' + inIncognito);
  
  ytl.initialiseVariables();
  ytl.setVariables();
  if (ytl.getReadyTimes == 0) {
    ytl.getReady();
  }
}

/*
 * monitoring document.body
 */
if (ytl.bodyObserver) ytl.bodyObserver.disconnect();
ytl.bodyObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.attributeName && mutation.attributeName == 'class') {
      var host = document.location.host;
      var isYouTube_host = (host.substr(host.length - 11) == 'youtube.com' && host != 'm.youtube.com');
      var isYouTube_target = ((mutation.target.baseURI).match("youtube.com") != null);
      if (mutation && mutation.target && isYouTube_host && isYouTube_target) {
        if ((mutation.target.baseURI).match("watch\\?") != null) {
          if (mutation.target.className.match('page-loaded') != null) {
            if (sessionStorage['yt-body-class'] == undefined || sessionStorage['yt-body-class'].match('page-loaded') == null) {
              ytl.initiate();
            }
          }
          sessionStorage['yt-body-class'] = mutation.target.className;
        } else {
          ytl.logging = [];
          ytl.log('This is not a video page');
          if(ytl.player) ytl.player.stopVideo();
          if(typeof ytl.initialiseVariables == "function") ytl.initialiseVariables();
        }
      } else {
        ytl.logging = [];
        ytl.log('NOT IN YOUTUBE.COM');
      }
    }
  });
});
ytl.bodyObserver.observe(document.body, { attributes: true, subtree: false });

/*
 * monitoring title
 */
if (ytl.titleObserver) ytl.titleObserver.disconnect();
ytl.titleObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
      var host = document.location.host;
      var isYouTube_host = (host.substr(host.length - 11) == 'youtube.com' && host != 'm.youtube.com');
      var isYouTube_target = ((mutation.target.baseURI).match("youtube.com") != null);
      if (document.querySelector('ytd-app') || document.querySelector('ytg-app')) {
        if (mutation && mutation.target && isYouTube_host && isYouTube_target) {
          if ((mutation.target.baseURI).match("watch\\?") != null) {
            ytl.initiate();
          } else {
            ytl.logging = [];
            ytl.log('This is not a video page');
            if(ytl.player) ytl.player.stopVideo();
            if(typeof ytl.initialiseVariables == "function") ytl.initialiseVariables();
          }
        } else {
          ytl.logging = [];
          ytl.log('NOT IN YOUTUBE.COM');
        }
      }
  });
});
ytl.titleObserver.observe(document.querySelector('head > title') || document.querySelector('title'), { subtree: true, characterData: true, childList: true });
ytl.initiate();

});

function getMessageFromChromeSync () {
  if ( !chrome.storage ) {
    console.info('[LOOPER FOR YOUTUBE]', 'BROWSER YOU ARE USING DO NOT SUPPORT CHROME.STORAGE API, OPTIONS IS NOT AVAILABLE IN THIS CASE');
    window.postMessage({
      type: 'optionsMsg',
      auto: false,
      button: 'all',
      key: true,
      panel: true,
      pausekey: false,
      playersizeEnable: false,
      playersize: 'normal',
      quality: 'default',
      show_changelog: true,
      oldchrome: true
    }, '*');
    return false;
  }
  chrome.storage.sync.get(null, function(value){ 
    window.postMessage({
      type: 'optionsMsg',
      auto: value['ytAutoLoop'] ? value['ytAutoLoop'] : false,
      button: value['option_button'] ? value['option_button'] : 'all',
      key: value['ytShortcut'] ? ( value['ytShortcut']=='false' ? false : true ) : true,
      panel: value['ytLoopPanel'] ? ( value['ytLoopPanel']=='false' ? false : true ) : true,
      pausekey: value['ytShortcut_Pause'] ? ( value['ytShortcut_Pause']=='true' ? true : false ) : false,
      playersizeEnable: value['ytPlayerSizeEnable'] ? ( value['ytPlayerSizeEnable']=='true' ? true : false ) : false,
      playersize: value['ytPlayerSize'] ? value['ytPlayerSize'] : 'normal',
      quality: value['ytQuality'] ? value['ytQuality'] : 'default',
      show_changelog: value['option_show_changelog'] ? ( value['option_show_changelog']=='false' ? false : true ) : true,
    }, '*');
  });
}

try {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key], option = {type: 'optionsMsg'}
      switch(key) {
        case 'ytAutoLoop':
          switch(storageChange.newValue) {
            case 'true':
            case 'false':
            case 'saveState':
              option.auto = storageChange.newValue; 
              break;
            default: 
              option.auto = 'false';
              break;
          }
          break;
        case 'option_button':
          switch(storageChange.newValue) {
            case 'all':
            case 'icon':
            case 'text':
              option.button = storageChange.newValue; 
              break;
            default: 
              option.button = 'all';
              break;
          }
          break;
        case 'ytShortcut':
          option.key = storageChange.newValue=='false' ? false : true;
          break;
        case 'ytLoopPanel':
          option.panel = storageChange.newValue=='false' ? false : true;
          break;
        case 'ytShortcut_Pause':
          option.pausekey = storageChange.newValue=='true' ? true : false;
          break;
        case 'ytPlayerSizeEnable':
          option.playersizeEnable = storageChange.newValue=='true' ? true : false;
          break;
        case 'ytPlayerSize':
          switch(storageChange.newValue) {
            case 'fullsize':
            case 'wide':
            case 'normal':
              option.playersize = storageChange.newValue; 
              break;
            default: 
              option.playersize = 'normal';
              break;
          }
          break;
        case 'ytQuality':
          switch(storageChange.newValue) {
            case 'default':
            case 'highres':
            case 'hd1440':
            case 'hd1080':
            case 'hd720':
            case 'large':
            case 'medium':
            case 'small':
            case 'tiny':
              option.quality = storageChange.newValue; 
              break;
            default: 
              option.quality = 'default';
              break;
          }
          break;
        case 'option_show_changelog':
          option.show_changelog = storageChange.newValue=='false' ? false : true;
          break;
      }
      window.postMessage(option, '*');
    }
  });
  getMessageFromChromeSync();
} catch (e) {
}
window.addEventListener('message', function (e) {
  if (e.data.type)
  if (e.data.type == 'requestMessage') {
    getMessageFromChromeSync();
  }
}, false);