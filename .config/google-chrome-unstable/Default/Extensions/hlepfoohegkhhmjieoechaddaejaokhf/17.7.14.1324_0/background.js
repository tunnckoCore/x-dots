/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 61);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/bfred-it/webext-options-sync

class OptionsSync {
	constructor(storageName = 'options') {
		this.storageName = storageName;
		this.storage = chrome.storage.sync || chrome.storage.local;
	}

	define(defs) {
		defs = Object.assign({
			defaults: {},
			migrations: [],
		}, defs);

		if (chrome.runtime.onInstalled) {
			chrome.runtime.onInstalled.addListener(() => this._applyDefinition(defs));
		} else {
			this._applyDefinition(defs);
		}
	}

	_applyDefinition(defs) {
		this.getAll().then(options => {
			console.info('Existing options:', options);
			if (defs.migrations.length > 0) {
				console.info('Running', defs.migrations.length, 'migrations');
				defs.migrations.forEach(migrate => migrate(options, defs.defaults));
			}
			const newOptions = Object.assign(defs.defaults, options);
			this.setAll(newOptions);
		});
	}

	_parseNumbers(options) {
		for (const name of Object.keys(options)) {
			if (options[name] === String(Number(options[name]))) {
				options[name] = Number(options[name]);
			}
		}
		return options;
	}

	getAll() {
		return new Promise(resolve => {
			this.storage.get(this.storageName,
				keys => resolve(keys[this.storageName] || {})
			);
		}).then(this._parseNumbers);
	}

	setAll(newOptions) {
		return new Promise(resolve => {
			this.storage.set({
				[this.storageName]: newOptions,
			}, resolve);
		});
	}

	set(newOptions) {
		return this.getAll().then(options => {
			this.setAll(Object.assign(options, newOptions));
		});
	}

	syncForm(form) {
		if (typeof form === 'string') {
			form = document.querySelector(form);
		}
		this.getAll().then(options => OptionsSync._applyToForm(options, form));
		form.addEventListener('input', e => this._handleFormUpdates(e));
		form.addEventListener('change', e => this._handleFormUpdates(e));
	}

	static _applyToForm(options, form) {
		for (const name of Object.keys(options)) {
			const els = form.querySelectorAll(`[name="${name}"]`);
			const [field] = els;
			if (field) {
				console.info('Set option', name, 'to', options[name]);
				switch (field.type) {
					case 'checkbox':
						field.checked = options[name];
						break;
					case 'radio': {
						const [selected] = Array.from(els)
						.filter(el => el.value === options[name]);
						if (selected) {
							selected.checked = true;
						}
						break;
					}
					default:
						field.value = options[name];
						break;
				}
			} else {
				console.warn('Stored option {', name, ':', options[name], '} was not found on the page');
			}
		}
	}

	_handleFormUpdates(e) {
		const el = e.target;
		const name = el.name;
		let value = el.value;
		if (!name) {
			return;
		}
		switch (el.type) {
			case 'select-one':
				value = el.options[el.selectedIndex].value;
				break;
			case 'checkbox':
				value = el.checked;
				break;
			default: break;
		}
		console.info('Saving option', el.name, 'to', value);
		this.set({
			[name]: value,
		});
	}
}

OptionsSync.migrations = {
	removeUnused(options, defaults) {
		for (const key of Object.keys(options)) {
			if (!(key in defaults)) {
				delete options[key];
			}
		}
	}
};

if (true) {
	module.exports = OptionsSync;
}


/***/ }),

/***/ 6:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webext_content_script_ping__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webext_content_script_ping___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_webext_content_script_ping__);


function logRuntimeErrors() {
	if (chrome.runtime.lastError) {
		console.error(chrome.runtime.lastError);
	}
}

async function injectContentScript(script, tabId) {
	const allFrames = script.all_frames;
	const runAt = script.run_at;
	script.css.forEach(file => chrome.tabs.insertCSS(tabId, {file, allFrames, runAt}, logRuntimeErrors));
	script.js.forEach(file => chrome.tabs.executeScript(tabId, {file, allFrames, runAt}, logRuntimeErrors));
}

async function injectContentScripts(tab) {
	// Get the tab object if we don't have it already
	if (!tab.id) {
		tab = await new Promise(resolve => chrome.tabs.get(tab, resolve));
		logRuntimeErrors();
	}

	// If we don't have the URL, we definitely can't access it.
	if (!tab.url) {
		return;
	}

	// We might just get the url because of the `tabs` permission,
	// not necessarily because we have access to the origin.
	// This will explicitly verify this permission.
	const isPermitted = await new Promise(resolve => chrome.permissions.contains({
		origins: [new URL(tab.url).origin + '/']
	}, resolve));
	logRuntimeErrors();

	if (!isPermitted) {
		return;
	}

	// Exit if already injected
	try {
		return await Object(__WEBPACK_IMPORTED_MODULE_0_webext_content_script_ping__["pingContentScript"])(tab.id || tab);
	} catch (err) {}

	chrome.runtime.getManifest().content_scripts.forEach(s => injectContentScript(s, tab.id));
}

/* harmony default export */ __webpack_exports__["default"] = (function (tab = false) {
	if (tab === false) {
		chrome.tabs.onUpdated.addListener((tabId, {status}) => {
			if (status === 'loading') {
				injectContentScripts(tabId);
			}
		});
	} else {
		injectContentScripts(tab);
	}
});


/***/ }),

/***/ 61:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _webextOptionsSync = __webpack_require__(2);

var _webextOptionsSync2 = _interopRequireDefault(_webextOptionsSync);

var _webextDynamicContentScripts = __webpack_require__(6);

var _webextDynamicContentScripts2 = _interopRequireDefault(_webextDynamicContentScripts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _webextOptionsSync2.default().define({
	defaults: {
		hideStarsOwnRepos: true
	},
	migrations: [_webextOptionsSync2.default.migrations.removeUnused]
});

(0, _webextDynamicContentScripts2.default)();

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

// https://github.com/bfred-it/webext-content-script-ping

function pingContentScript(tab) {
	return new Promise((resolve, reject) => {
		setTimeout(reject, 300);
		chrome.tabs.sendMessage(tab.id || tab, chrome.runtime.id, {
			// Only the main frame is necessary;
			// if that isn't loaded, no other iframe is
			frameId: 0
		}, response => {
			if (response === chrome.runtime.id) {
				resolve();
			} else {
				reject();
			}
		});
	});
}

if (!chrome.runtime.getBackground) {
	// Respond to pings
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request === chrome.runtime.id) {
			sendResponse(chrome.runtime.id);
		}
	});
}

if (true) {
	exports.pingContentScript = pingContentScript;
}


/***/ })

/******/ });