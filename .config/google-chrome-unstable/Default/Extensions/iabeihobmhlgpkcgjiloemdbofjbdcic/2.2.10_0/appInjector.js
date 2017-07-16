(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/s/bbt2/js/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 382);
/******/ })
/************************************************************************/
/******/ ({

/***/ 382:
/***/ function(module, exports) {

if (!document.getElementById('bitly_chrome_extension_iframe')) {
  const log = (message) => chrome.runtime.sendMessage({type: 'app', message});
  var iframe = document.createElement('iframe');
  iframe.id = 'bitly_chrome_extension_iframe';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '2147483647';
  iframe.style.display = 'block !important';
  iframe.src = chrome.extension.getURL('app.html');

  if (document.body.tagName === 'FRAMESET') {
    log('Body swapping with frameset');
    const frameset = document.body;
    const newBody = document.createElement('body');
    const framesetSandbox = document.createElement('iframe');
    framesetSandbox.style.width = '100%';
    framesetSandbox.style.height = '100%';
    framesetSandbox.style.position = 'fixed';
    framesetSandbox.style.top = '0';
    framesetSandbox.style.left = '0';
    framesetSandbox.style.border = '0';

    newBody.appendChild(framesetSandbox);
    newBody.appendChild(iframe);

    document.body = newBody;

    framesetSandbox.contentDocument.body.appendChild(frameset);

    document.__bitly_extension_restore_body = frameset;
  }
  else {
    log('Injecting Iframe');
    document.body.appendChild(iframe);
  }
}


/***/ }

/******/ })));