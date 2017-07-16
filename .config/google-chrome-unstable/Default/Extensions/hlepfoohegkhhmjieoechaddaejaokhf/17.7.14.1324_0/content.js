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
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @param {string} selector   One or more CSS selectors separated by commas
 * @param {Element} [parent]  The element to look inside of
 * @return {?Element}         The element found, if any
 */
function select(selector, parent) {
	return (parent || document).querySelector(selector);
}

/**
 * @param {string} selector   One or more CSS selectors separated by commas
 * @param {Element} [parent]  The element to look inside of
 * @return {boolean}          Whether it's been found
 */
select.exists = function (selector, parent) {
	return Boolean(select(selector, parent));
};

/**
 * @param {string} selector               One or more CSS selectors separated by commas
 * @param {Element|Element[]} [parent]    The element or list of elements to look inside of
 * @return {Element[]}                    An array of elements found
 */
select.all = function (selector, parent) {
	// Can be: select.all('selector') or select.all('selector', singleElementOrDocument)
	if (!parent || typeof parent.querySelectorAll === 'function') {
		return Array.apply(null, (parent || document).querySelectorAll(selector));
	}

	var current;
	var i;
	var ii;
	var all = [];
	for (i = 0; i < parent.length; i++) {
		current = parent[i].querySelectorAll(selector);
		for (ii = 0; ii < current.length; ii++) {
			if (all.indexOf(current[ii]) < 0) {
				all.push(current[ii]);
			}
		}
	}
	return all;
};

module.exports = select;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const svgTagNames = __webpack_require__(28);
const classnames = __webpack_require__(29);
const flatten = __webpack_require__(30);
const omit = __webpack_require__(31);

// Copied from Preact
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

const excludeSvgTags = [
	'a',
	'audio',
	'canvas',
	'iframe',
	'script',
	'video'
];

const svgTags = svgTagNames.filter(name => excludeSvgTags.indexOf(name) === -1);

const isSVG = tagName => svgTags.indexOf(tagName) >= 0;

const cloneNode = node => {
	const clone = node.cloneNode(true);

	for (const key in node) {
		if (key.indexOf('on') === 0 && typeof node[key] === 'function') {
			clone[key] = node[key];
		}
	}

	return clone;
};

const getCSSProps = attrs => {
	return Object
		.keys(attrs.style || {})
		.map(name => {
			let value = attrs.style[name];

			if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
				value += 'px';
			}

			return {name, value};
		});
};

const getHTMLProps = attrs => {
	const allProps = omit(attrs, ['class', 'className', 'style', 'key', 'dangerouslySetInnerHTML']);

	return Object
		.keys(allProps)
		.filter(name => name.indexOf('on') !== 0)
		.map(name => ({
			name: name.toLowerCase(),
			value: attrs[name]
		}));
};

const getEventListeners = attrs => {
	return Object
		.keys(attrs)
		.filter(name => name.indexOf('on') === 0)
		.map(name => ({
			name: name.toLowerCase(),
			listener: attrs[name]
		}));
};

const createElement = tagName => {
	if (isSVG(tagName)) {
		return document.createElementNS('http://www.w3.org/2000/svg', tagName);
	}

	return document.createElement(tagName);
};

const setAttribute = (tagName, el, name, value) => {
	if (isSVG(tagName)) {
		el.setAttribute(name, value);
	} else {
		el.setAttributeNS(null, name, value);
	}
};

const build = (tagName, attrs, children) => {
	const el = createElement(tagName);

	const className = attrs.class || attrs.className;
	if (className) {
		setAttribute(tagName, el, 'class', classnames(className));
	}

	getCSSProps(attrs).forEach(prop => {
		el.style.setProperty(prop.name, prop.value);
	});

	getHTMLProps(attrs).forEach(prop => {
		setAttribute(tagName, el, prop.name, prop.value);
	});

	getEventListeners(attrs).forEach(event => {
		el[event.name] = event.listener;
	});

	const setHTML = attrs.dangerouslySetInnerHTML;
	if (setHTML && setHTML.__html) {
		el.innerHTML = setHTML.__html;
	} else {
		children.forEach(child => {
			el.appendChild(child);
		});
	}

	return el;
};

function h(tagName, attrs) {
	attrs = attrs || {};

	const childrenArgs = [].slice.call(arguments, 2);
	const children = flatten(childrenArgs).map(child => {
		if (child instanceof Element) {
			return cloneNode(child);
		}

		if (typeof child === 'boolean' || child === null) {
			child = '';
		}

		return document.createTextNode(child);
	});

	return build(tagName, attrs, children);
}

exports.h = h;


/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.hasCommentForm = exports.isSingleFile = exports.getOwnerAndRepo = exports.isRepoSettings = exports.isNotifications = exports.isBlame = exports.isReleases = exports.hasDiff = exports.hasCode = exports.isCompare = exports.isCommit = exports.isSingleCommit = exports.isCommitList = exports.isLabel = exports.isLabelList = exports.isMilestone = exports.isMilestoneList = exports.isPRCommit = exports.isPRFiles = exports.isPR = exports.isPRList = exports.isPRSearch = exports.isIssue = exports.isIssueList = exports.isIssueSearch = exports.isRepoTree = exports.isRepoRoot = exports.getRepoURL = exports.getRepoPath = exports.isRepo = exports.isDashboard = exports.isGist = undefined;

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isGist = exports.isGist = () => location.hostname.startsWith('gist.') || location.pathname.startsWith('gist/');

const isDashboard = exports.isDashboard = () => location.pathname === '/' || /^(\/orgs\/[^/]+)?\/dashboard/.test(location.pathname);

const isRepo = exports.isRepo = () => !isGist() && /^\/[^/]+\/[^/]+/.test(location.pathname);

const getRepoPath = exports.getRepoPath = () => location.pathname.replace(/^\/[^/]+\/[^/]+/, '');

const getRepoURL = exports.getRepoURL = () => location.pathname.slice(1).split('/', 2).join('/');

const isRepoRoot = exports.isRepoRoot = () => isRepo() && /^(\/?$|\/tree\/)/.test(getRepoPath()) && _selectDom2.default.exists('.repository-meta-content');

const isRepoTree = exports.isRepoTree = () => isRepo() && /\/tree\//.test(getRepoPath());

const isIssueSearch = exports.isIssueSearch = () => location.pathname.startsWith('/issues');

const isIssueList = exports.isIssueList = () => isRepo() && /^\/issues\/?$/.test(getRepoPath());

const isIssue = exports.isIssue = () => isRepo() && /^\/issues\/\d+/.test(getRepoPath());

const isPRSearch = exports.isPRSearch = () => location.pathname.startsWith('/pulls');

const isPRList = exports.isPRList = () => isRepo() && /^\/pulls\/?$/.test(getRepoPath());

const isPR = exports.isPR = () => isRepo() && /^\/pull\/\d+/.test(getRepoPath());

const isPRFiles = exports.isPRFiles = () => isRepo() && /^\/pull\/\d+\/files/.test(getRepoPath());

const isPRCommit = exports.isPRCommit = () => isRepo() && /^\/pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

const isMilestoneList = exports.isMilestoneList = () => isRepo() && /^\/milestones\/?$/.test(getRepoPath());

const isMilestone = exports.isMilestone = () => isRepo() && /^\/milestone\/\d+/.test(getRepoPath());

const isLabelList = exports.isLabelList = () => isRepo() && /^\/labels\/?(((?=\?).*)|$)/.test(getRepoPath());

const isLabel = exports.isLabel = () => isRepo() && /^\/labels\/\w+/.test(getRepoPath());

const isCommitList = exports.isCommitList = () => isRepo() && /^\/commits\//.test(getRepoPath());

const isSingleCommit = exports.isSingleCommit = () => isRepo() && /^\/commit\/[0-9a-f]{5,40}/.test(getRepoPath());

const isCommit = exports.isCommit = () => isSingleCommit() || isPRCommit() || isPRFiles() && _selectDom2.default.exists('.full-commit');

const isCompare = exports.isCompare = () => isRepo() && /^\/compare/.test(getRepoPath());

const hasCode = exports.hasCode = () => isRepo() && _selectDom2.default.exists('.highlight');

const hasDiff = exports.hasDiff = () => isRepo() && (isSingleCommit() || isPRCommit() || isPRFiles() || isCompare() || isPR() && _selectDom2.default.exists('.diff-table'));

const isReleases = exports.isReleases = () => isRepo() && /^\/(releases|tags)/.test(getRepoPath());

const isBlame = exports.isBlame = () => isRepo() && /^\/blame\//.test(getRepoPath());

const isNotifications = exports.isNotifications = () => location.pathname.startsWith('/notifications');

const isRepoSettings = exports.isRepoSettings = () => isRepo() && /^\/settings/.test(getRepoPath());

const getOwnerAndRepo = exports.getOwnerAndRepo = () => {
	const [, ownerName, repoName] = location.pathname.split('/');

	return {
		ownerName,
		repoName
	};
};

const isSingleFile = exports.isSingleFile = () => {
	const { ownerName, repoName } = getOwnerAndRepo();
	const blobPattern = new RegExp(`/${ownerName}/${repoName}/blob/`);
	return isRepo() && blobPattern.test(location.href);
};

const hasCommentForm = exports.hasCommentForm = () => _selectDom2.default.exists('.js-previewable-comment-form');

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.observeEl = exports.emptyElement = exports.groupBy = exports.getUsername = undefined;

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getUsername = exports.getUsername = () => (0, _selectDom2.default)('meta[name="user-login"]').getAttribute('content');

const groupBy = exports.groupBy = (array, grouper) => array.reduce((map, item) => {
	const key = grouper(item);
	map[key] = map[key] || [];
	map[key].push(item);
	return map;
}, {});

const emptyElement = exports.emptyElement = element => {
	while (element.firstChild) {
		element.firstChild.remove();
	}
};

const observeEl = exports.observeEl = (el, listener, options = { childList: true }) => {
	if (typeof el === 'string') {
		el = (0, _selectDom2.default)(el);
	}

	listener();

	return new MutationObserver(listener).observe(el, options);
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = input => {
	const el = document.createElement('textarea');

	el.value = input;

	// Prevent keyboard from showing on mobile
	el.setAttribute('readonly', '');

	el.style.contain = 'strict';
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	el.style.fontSize = '12pt'; // Prevent zooming on iOS

	const selection = getSelection();
	let originalRange = false;
	if (selection.rangeCount > 0) {
		originalRange = selection.getRangeAt(0);
	}

	document.body.appendChild(el);
	el.select();

	let success = false;
	try {
		success = document.execCommand('copy');
	} catch (err) {}

	document.body.removeChild(el);

	if (originalRange) {
		selection.removeAllRanges();
		selection.addRange(originalRange);
	}

	return success;
};


/***/ }),
/* 6 */
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
/* 7 */
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


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.darkCompare = exports.cloudUpload = exports.fork = exports.tag = exports.mergedPullRequest = exports.closedPullRequest = exports.openPullRequest = exports.closedIssue = exports.openIssue = exports.edit = exports.mute = exports.check = undefined;

var _domChef = __webpack_require__(1);

const check = exports.check = (0, _domChef.h)(
  "svg",
  { "aria-hidden": "true", "class": "octicon octicon-check", height: "16", version: "1.1", viewBox: "0 0 12 16", width: "12" },
  (0, _domChef.h)("path", { d: "M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z" })
);

const mute = exports.mute = (0, _domChef.h)(
  "svg",
  { "aria-hidden": "true", "class": "octicon octicon-mute", height: "16", version: "1.1", viewBox: "0 0 16 16", width: "16" },
  (0, _domChef.h)("path", { d: "M8 2.81v10.38c0 .67-.81 1-1.28.53L3 10H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h2l3.72-3.72C7.19 1.81 8 2.14 8 2.81zm7.53 3.22l-1.06-1.06-1.97 1.97-1.97-1.97-1.06 1.06L11.44 8 9.47 9.97l1.06 1.06 1.97-1.97 1.97 1.97 1.06-1.06L13.56 8l1.97-1.97z" })
);

const edit = exports.edit = (0, _domChef.h)(
  "svg",
  { "class": "octicon octicon-pencil", height: "16", version: "1.1", viewBox: "0 0 14 16", width: "14" },
  (0, _domChef.h)("path", { d: "M0 12v3h3l8-8-3-3L0 12z m3 2H1V12h1v1h1v1z m10.3-9.3l-1.3 1.3-3-3 1.3-1.3c0.39-0.39 1.02-0.39 1.41 0l1.59 1.59c0.39 0.39 0.39 1.02 0 1.41z" })
);

const openIssue = exports.openIssue = (0, _domChef.h)(
  "svg",
  { "aria-label": "issues", "class": "octicon octicon-issue-opened type-icon type-icon-state-open", height: "16", role: "img", version: "1.1", viewBox: "0 0 14 16", width: "14" },
  (0, _domChef.h)("path", { d: "M7 2.3c3.14 0 5.7 2.56 5.7 5.7s-2.56 5.7-5.7 5.7A5.71 5.71 0 0 1 1.3 8c0-3.14 2.56-5.7 5.7-5.7zM7 1C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm1 3H6v5h2V4zm0 6H6v2h2v-2z" })
);

const closedIssue = exports.closedIssue = (0, _domChef.h)(
  "svg",
  { "aria-label": "issues", "class": "octicon octicon-issue-closed type-icon type-icon-state-closed", height: "16", role: "img", version: "1.1", viewBox: "0 0 16 16", width: "16" },
  (0, _domChef.h)("path", { d: "M7 10h2v2H7v-2zm2-6H7v5h2V4zm1.5 1.5l-1 1L12 9l4-4.5-1-1L12 7l-1.5-1.5zM8 13.7A5.71 5.71 0 0 1 2.3 8c0-3.14 2.56-5.7 5.7-5.7 1.83 0 3.45.88 4.5 2.2l.92-.92A6.947 6.947 0 0 0 8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7l-1.52 1.52c-.66 2.41-2.86 4.19-5.48 4.19v-.01z" })
);

const openPullRequest = exports.openPullRequest = (0, _domChef.h)(
  "svg",
  { "aria-label": "pull request", "class": "octicon octicon-git-pull-request type-icon type-icon-state-open", height: "16", role: "img", version: "1.1", viewBox: "0 0 12 16", width: "12" },
  (0, _domChef.h)("path", { d: "M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z" })
);

const closedPullRequest = exports.closedPullRequest = (0, _domChef.h)(
  "svg",
  { "aria-label": "pull request", "class": "octicon octicon-git-pull-request type-icon type-icon-state-closed", height: "16", role: "img", version: "1.1", viewBox: "0 0 12 16", width: "12" },
  (0, _domChef.h)("path", { d: "M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z" })
);

const mergedPullRequest = exports.mergedPullRequest = (0, _domChef.h)(
  "svg",
  { "aria-label": "pull request", "class": "octicon octicon-git-pull-request type-icon type-icon-state-merged", height: "16", role: "img", version: "1.1", viewBox: "0 0 12 16", width: "12" },
  (0, _domChef.h)("path", { d: "M11 11.28V5c-.03-.78-.34-1.47-.94-2.06C9.46 2.35 8.78 2.03 8 2H7V0L4 3l3 3V4h1c.27.02.48.11.69.31.21.2.3.42.31.69v6.28A1.993 1.993 0 0 0 10 15a1.993 1.993 0 0 0 1-3.72zm-1 2.92c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zM4 3c0-1.11-.89-2-2-2a1.993 1.993 0 0 0-1 3.72v6.56A1.993 1.993 0 0 0 2 15a1.993 1.993 0 0 0 1-3.72V4.72c.59-.34 1-.98 1-1.72zm-.8 10c0 .66-.55 1.2-1.2 1.2-.65 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z" })
);

const tag = exports.tag = (0, _domChef.h)(
  "svg",
  { "class": "octicon octicon-tag", height: "16", version: "1.1", viewBox: "0 0 14 16", width: "14" },
  (0, _domChef.h)("path", { d: "M6.73 2.73c-0.47-0.47-1.11-0.73-1.77-0.73H2.5C1.13 2 0 3.13 0 4.5v2.47c0 0.66 0.27 1.3 0.73 1.77l6.06 6.06c0.39 0.39 1.02 0.39 1.41 0l4.59-4.59c0.39-0.39 0.39-1.02 0-1.41L6.73 2.73zM1.38 8.09c-0.31-0.3-0.47-0.7-0.47-1.13V4.5c0-0.88 0.72-1.59 1.59-1.59h2.47c0.42 0 0.83 0.16 1.13 0.47l6.14 6.13-4.73 4.73L1.38 8.09z m0.63-4.09h2v2H2V4z" })
);

const fork = exports.fork = (0, _domChef.h)(
  "svg",
  { "aria-hidden": "true", "class": "octicon octicon-repo-forked", height: "16", role: "img", version: "1.1", viewBox: "0 0 10 16", width: "10" },
  (0, _domChef.h)("path", { d: "M8 1c-1.11 0-2 0.89-2 2 0 0.73 0.41 1.38 1 1.72v1.28L5 8 3 6v-1.28c0.59-0.34 1-0.98 1-1.72 0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72v1.78l3 3v1.78c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V9.5l3-3V4.72c0.59-0.34 1-0.98 1-1.72 0-1.11-0.89-2-2-2zM2 4.2c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z m3 10c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z m3-10c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z" })
);

const cloudUpload = exports.cloudUpload = (0, _domChef.h)(
  "svg",
  { "aria-hidden": "true", "class": "octicon octicon-cloud-upload", height: "16", role: "img", version: "1.1", viewBox: "0 0 16 16", width: "16" },
  (0, _domChef.h)("path", { "fill-rule": "evenodd", d: "M7 9H5l3-3 3 3H9v5H7V9zm5-4c0-.44-.91-3-4.5-3C5.08 2 3 3.92 3 6 1.02 6 0 7.52 0 9c0 1.53 1 3 3 3h3v-1.3H3c-1.62 0-1.7-1.42-1.7-1.7 0-.17.05-1.7 1.7-1.7h1.3V6c0-1.39 1.56-2.7 3.2-2.7 2.55 0 3.13 1.55 3.2 1.8v1.2H12c.81 0 2.7.22 2.7 2.2 0 2.09-2.25 2.2-2.7 2.2h-2V12h2c2.08 0 4-1.16 4-3.5C16 6.06 14.08 5 12 5z" })
);

const darkCompare = exports.darkCompare = (0, _domChef.h)(
  "svg",
  { xmlns: "http://www.w3.org/2000/svg", "class": "octicon octicon-diff", height: "16", viewBox: "0 0 13 16", width: "13" },
  (0, _domChef.h)("path", { d: "M6 7h2v1H6v2H5V8H3V7h2V5h1zm-3 6h5v-1H3zM7.5 2L11 5.5V15c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V3c0-.55.45-1 1-1zm1-2H3v1h5l4 4v8h1V4.5z", "fill-rule": "evenodd" })
);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var gitHubInjection = function (global, cb) {
  if (!global) {
    throw new Error('Missing argument global');
  }

  if (!global.document || !global.document.getElementById) {
    throw new Error('The given argument global is not a valid window object');
  }

  if (!cb) {
    throw new Error('Missing argument callback');
  }

  if (typeof cb !== 'function') {
    throw new Error('Callback is not a function');
  }

  var domElement = global.document.getElementById('js-repo-pjax-container') ||
    global.document.getElementById('js-pjax-container');
  if (!domElement || !global.MutationObserver) {
    return cb(null);
  }

  var viewSpy = new global.MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        cb(null);
      }
    });
  });

  viewSpy.observe(domElement, {
    attributes: true,
    childList: true,
    characterData: true
  });

  cb(null);
};

// Export the gitHubInjection function for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, add `gitHubInjection` as a global object.
if (true) {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = gitHubInjection;
  }
  exports.gitHubInjection = gitHubInjection;
} else {
  /*jshint -W040 */
  this.gitHubInjection = gitHubInjection;
  /*jshint +W040 */
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* globals document */

const issueRegex = __webpack_require__(22);
const createHtmlElement = __webpack_require__(11);

const groupedIssueRegex = new RegExp(`(${issueRegex().source})`, 'g');

// Get <a> element as string
const linkify = (match, options) => {
	let url = `${options.baseUrl}/`;
	if (match.includes('/')) {
		const parts = match.split('#');
		url += `${parts[0]}/issues/${parts[1]}`;
	} else {
		url += `${options.user}/${options.repo}/issues/${match.slice(1)}`;
	}

	return createHtmlElement({
		name: 'a',
		attributes: Object.assign({href: ''}, options.attributes, {href: url}),
		value: match
	});
};

// Get DOM node from HTML
const domify = html => document.createRange().createContextualFragment(html);

const getAsString = (input, options) => {
	return input.replace(groupedIssueRegex, match => linkify(match, options));
};

const getAsDocumentFragment = (input, options) => {
	return input.split(groupedIssueRegex).reduce((frag, text, index) => {
		if (index % 2) { // URLs are always in odd positions
			frag.appendChild(domify(linkify(text, options)));
		} else if (text.length > 0) {
			frag.appendChild(document.createTextNode(text));
		}

		return frag;
	}, document.createDocumentFragment());
};

module.exports = (input, options) => {
	options = Object.assign({
		attributes: {},
		baseUrl: 'https://github.com',
		type: 'string'
	}, options);

	if (!(options.user && options.repo)) {
		throw new Error('Missing required `user` and `repo` options');
	}

	if (options.type === 'string') {
		return getAsString(input, options);
	}

	if (options.type === 'dom') {
		return getAsDocumentFragment(input, options);
	}

	throw new Error('The type option must be either dom or string');
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const stringifyAttributes = __webpack_require__(23);
const htmlTags = __webpack_require__(25);

const voidHtmlTags = new Set(htmlTags);

module.exports = options => {
	options = Object.assign({
		name: 'div',
		attributes: {},
		value: ''
	}, options);

	let ret = `<${options.name}${stringifyAttributes(options.attributes)}>`;

	if (!voidHtmlTags.has(options.name)) {
		ret += `${options.value}</${options.name}>`;
	}

	return ret;
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const mimicFn = __webpack_require__(39);

module.exports = (fn, options) => {
	if (typeof fn !== 'function') {
		throw new TypeError(`Expected the first argument to be a function, got \`${typeof fn}\``);
	}

	options = options || {};

	let timeout;
	let result;

	const debounced = function () {
		const context = this;
		const args = arguments;

		const later = () => {
			timeout = null;
			if (!options.immediate) {
				result = fn.apply(context, args);
			}
		};

		const callNow = options.immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, options.wait || 0);

		if (callNow) {
			result = fn.apply(context, args);
		}

		return result;
	};

	mimicFn(debounced, fn);

	debounced.cancel = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
	};

	return debounced;
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(6);

var _webextOptionsSync = __webpack_require__(2);

var _webextOptionsSync2 = _interopRequireDefault(_webextOptionsSync);

var _elementReady = __webpack_require__(14);

var _elementReady2 = _interopRequireDefault(_elementReady);

var _githubInjection = __webpack_require__(9);

var _githubInjection2 = _interopRequireDefault(_githubInjection);

var _shortenRepoUrl = __webpack_require__(16);

var _toSemver = __webpack_require__(19);

var _toSemver2 = _interopRequireDefault(_toSemver);

var _linkifyIssues = __webpack_require__(10);

var _linkifyIssues2 = _interopRequireDefault(_linkifyIssues);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domLoaded = __webpack_require__(27);

var _domLoaded2 = _interopRequireDefault(_domLoaded);

var _domChef = __webpack_require__(1);

var _markUnread = __webpack_require__(35);

var _markUnread2 = _interopRequireDefault(_markUnread);

var _copyGist = __webpack_require__(36);

var _copyGist2 = _interopRequireDefault(_copyGist);

var _uploadButton = __webpack_require__(37);

var _uploadButton2 = _interopRequireDefault(_uploadButton);

var _diffheader = __webpack_require__(38);

var _diffheader2 = _interopRequireDefault(_diffheader);

var _copyOnY = __webpack_require__(40);

var _copyOnY2 = _interopRequireDefault(_copyOnY);

var _reactionsAvatars = __webpack_require__(41);

var _reactionsAvatars2 = _interopRequireDefault(_reactionsAvatars);

var _showNames = __webpack_require__(42);

var _showNames2 = _interopRequireDefault(_showNames);

var _copyFilePath = __webpack_require__(44);

var _copyFilePath2 = _interopRequireDefault(_copyFilePath);

var _copyFile = __webpack_require__(45);

var _copyFile2 = _interopRequireDefault(_copyFile);

var _copyMarkdown = __webpack_require__(46);

var _copyMarkdown2 = _interopRequireDefault(_copyMarkdown);

var _linkifyUrlsInCode = __webpack_require__(55);

var _linkifyUrlsInCode2 = _interopRequireDefault(_linkifyUrlsInCode);

var _autoLoadMoreNews = __webpack_require__(58);

var _autoLoadMoreNews2 = _interopRequireDefault(_autoLoadMoreNews);

var _opLabels = __webpack_require__(60);

var _opLabels2 = _interopRequireDefault(_opLabels);

var _icons = __webpack_require__(8);

var icons = _interopRequireWildcard(_icons);

var _pageDetect = __webpack_require__(3);

var pageDetect = _interopRequireWildcard(_pageDetect);

var _utils = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.$ = $;
window.select = _selectDom2.default;

const repoUrl = pageDetect.getRepoURL();

function getCanonicalBranchFromRef($element) {
	const refSelector = '.commit-ref, .head-ref, .base-ref';

	return $element.find(refSelector).addBack(refSelector).filter('[title]').attr('title');
}

function linkifyBranchRefs() {
	let deletedBranchName = null;
	const $deletedBranchInTimeline = $('.discussion-item-head_ref_deleted');
	if ($deletedBranchInTimeline.length > 0) {
		deletedBranchName = getCanonicalBranchFromRef($deletedBranchInTimeline);
	}

	$('.commit-ref').each((i, el) => {
		if (el.firstElementChild.textContent === 'unknown repository') {
			return;
		}

		const $el = $(el);
		const canonicalBranch = getCanonicalBranchFromRef($el);

		if (deletedBranchName && canonicalBranch === deletedBranchName) {
			$el.attr('title', 'Deleted: ' + canonicalBranch);
			return;
		}

		const branchUrl = canonicalBranch.replace(':', '/tree/');

		$el.wrap((0, _domChef.h)('a', { href: `/${branchUrl}` }));
	});
}

function appendReleasesCount(count) {
	if (!count) {
		return;
	}

	(0, _selectDom2.default)('.reponav-releases').append((0, _domChef.h)(
		'span',
		{ 'class': 'Counter' },
		count
	));
}

function cacheReleasesCount() {
	const releasesCountCacheKey = `${repoUrl}-releases-count`;

	if (pageDetect.isRepoRoot()) {
		const releasesCount = (0, _selectDom2.default)('.numbers-summary a[href$="/releases"] .num').textContent.trim();
		appendReleasesCount(releasesCount);
		chrome.storage.local.set({ [releasesCountCacheKey]: releasesCount });
	} else {
		chrome.storage.local.get(releasesCountCacheKey, items => {
			appendReleasesCount(items[releasesCountCacheKey]);
		});
	}
}

function addCompareLink() {
	if (_selectDom2.default.exists('.refined-github-compare-tab')) {
		return;
	}

	(0, _selectDom2.default)('.reponav-dropdown .dropdown-menu').prepend((0, _domChef.h)(
		'a',
		{ href: `/${repoUrl}/compare`, 'class': 'dropdown-item refined-github-compare-tab' },
		icons.darkCompare,
		(0, _domChef.h)(
			'span',
			{ itemprop: 'name' },
			' Compare'
		)
	));
}

function renameInsightsDropdown() {
	const dropdown = (0, _selectDom2.default)('.reponav-item.reponav-dropdown');
	if (dropdown) {
		dropdown.firstChild.textContent = 'More ';
	}
}

function hideEmptyMeta() {
	if (pageDetect.isRepoRoot()) {
		const meta = (0, _selectDom2.default)('.repository-meta');
		if (_selectDom2.default.exists('em', meta) && !_selectDom2.default.exists('.js-edit-repo-meta-button')) {
			meta.style.display = 'none';
		}
	}
}

function moveMarketplaceLinkToProfileDropdown() {
	const thirdDropdownItem = (0, _selectDom2.default)('.dropdown-item[href="/explore"]');
	const marketplaceLink = (0, _domChef.h)(
		'a',
		{ 'class': 'dropdown-item', href: '/marketplace' },
		'Marketplace'
	);
	thirdDropdownItem.insertAdjacentElement('afterend', marketplaceLink);
}

function addReleasesTab() {
	if (_selectDom2.default.exists('.reponav-releases')) {
		return;
	}

	const releasesTab = (0, _domChef.h)(
		'a',
		{ href: `/${repoUrl}/releases`, 'class': 'reponav-item reponav-releases', 'data-hotkey': 'g r', 'data-selected-links': `repo_releases /${repoUrl}/releases` },
		icons.tag,
		(0, _domChef.h)(
			'span',
			null,
			' Releases '
		)
	);

	(0, _selectDom2.default)('.reponav-dropdown, [data-selected-links~="repo_settings"]').insertAdjacentElement('beforeBegin', releasesTab);

	cacheReleasesCount();

	if (pageDetect.isReleases()) {
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		(0, _selectDom2.default)('.reponav-item.selected').classList.remove('js-selected-navigation-item', 'selected');
	}
}

async function addTrendingMenuItem() {
	const secondListItem = await (0, _elementReady2.default)('.header-nav.float-left .header-nav-item:nth-child(2)');

	secondListItem.insertAdjacentElement('afterEnd', (0, _domChef.h)(
		'li',
		{ 'class': 'header-nav-item' },
		(0, _domChef.h)(
			'a',
			{ href: '/trending', 'class': 'header-nav-link', 'data-hotkey': 'g t' },
			'Trending'
		)
	));
}

function addYoursMenuItem() {
	const pageName = pageDetect.isIssueSearch() ? 'issues' : 'pulls';
	const username = (0, _utils.getUsername)();

	if (_selectDom2.default.exists('.refined-github-yours')) {
		return;
	}

	const yoursMenuItem = (0, _domChef.h)(
		'a',
		{ href: `/${pageName}?q=is%3Aopen+is%3Aissue+user%3A${username}`, 'class': 'subnav-item refined-github-yours' },
		'Yours'
	);

	if (!_selectDom2.default.exists('.subnav-links .selected') && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.classList.add('selected');
	}

	(0, _selectDom2.default)('.subnav-links').append(yoursMenuItem);
}

function addReadmeButtons() {
	const readmeContainer = (0, _selectDom2.default)('#readme.readme');
	if (!readmeContainer) {
		return;
	}

	const buttons = (0, _domChef.h)('div', { id: 'refined-github-readme-buttons' });

	const tags = _selectDom2.default.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item').map(element => [element.getAttribute('data-name'), element.getAttribute('href')]);
	const releases = new Map(tags);
	const [latestRelease] = (0, _toSemver2.default)([...releases.keys()], { clean: false });
	if (latestRelease) {
		buttons.appendChild((0, _domChef.h)(
			'a',
			{
				'class': 'tooltipped tooltipped-nw',
				href: `${releases.get(latestRelease)}#readme`,
				'aria-label': `View this file at the latest version (${latestRelease})` },
			icons.tag
		));
	}

	if ((0, _selectDom2.default)('.branch-select-menu i').textContent === 'Branch:') {
		const readmeName = (0, _selectDom2.default)('#readme > h3').textContent.trim();
		const path = (0, _selectDom2.default)('.breadcrumb').textContent.trim().split('/').slice(1).join('/');
		const currentBranch = (0, _selectDom2.default)('.branch-select-menu .select-menu-item.selected').textContent.trim();
		buttons.appendChild((0, _domChef.h)(
			'a',
			{
				href: `/${repoUrl}/edit/${currentBranch}/${path}${readmeName}`,
				'class': 'tooltipped tooltipped-nw',
				'aria-label': 'Edit this file' },
			icons.edit
		));
	}

	readmeContainer.appendChild(buttons);
}

function addDeleteForkLink() {
	const postMergeDescription = (0, _selectDom2.default)('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref.current-branch');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			postMergeDescription.append((0, _domChef.h)(
				'p',
				{ id: 'refined-github-delete-fork-link' },
				(0, _domChef.h)(
					'a',
					{ href: `/${forkPath}/settings` },
					icons.fork,
					'Delete fork'
				)
			));
		}
	}
}

function linkifyIssuesInTitles() {
	(0, _utils.observeEl)((0, _selectDom2.default)('#partial-discussion-header').parentNode, () => {
		const title = (0, _selectDom2.default)('.js-issue-title:not(.refined-linkified-title)');
		if (title) {
			title.classList.add('refined-linkified-title');
			(0, _linkifyUrlsInCode.editTextNodes)(_linkifyIssues2.default, title);
		}
	});
}

function addPatchDiffLinks() {
	if (_selectDom2.default.exists('.sha-block.patch-diff-links')) {
		return;
	}

	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	(0, _selectDom2.default)('.commit-meta span.float-right').append((0, _domChef.h)(
		'span',
		{ 'class': 'sha-block patch-diff-links' },
		(0, _domChef.h)(
			'a',
			{ href: `${commitUrl}.patch`, 'class': 'sha' },
			'patch'
		),
		' ',
		(0, _domChef.h)(
			'a',
			{ href: `${commitUrl}.diff`, 'class': 'sha' },
			'diff'
		)
	));
}

function removeDiffSigns() {
	$('.diff-table:not(.refined-github-diff-signs)').addClass('refined-github-diff-signs').find(`
			.blob-code-addition .blob-code-inner,
			.blob-code-deletion .blob-code-inner
		`).each((index, el) => {
		el.firstChild.textContent = el.firstChild.textContent.slice(1);
	});
}

function markMergeCommitsInList() {
	$('.commit.commits-list-item.table-list-item:not(.refined-github-merge-commit)').each((index, element) => {
		const $element = $(element);
		const messageText = $element.find('.commit-title').text();
		if (/Merge pull request #/.test(messageText)) {
			$element.addClass('refined-github-merge-commit').find('.commit-avatar-cell').prepend('<svg aria-hidden="true" class="octicon octicon-git-pull-request" height="36" role="img" version="1.1" viewBox="0 0 12 16" width="27"><path d="M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path></svg>').find('img').addClass('avatar-child');
		}
	});
}

function indentInput(el, size = 4) {
	el.focus();
	const value = el.value;
	const selectionStart = el.selectionStart;
	const indentSize = size - el.selectionEnd % size || size;
	const indentationText = ' '.repeat(indentSize);
	el.value = value.slice(0, selectionStart) + indentationText + value.slice(el.selectionEnd);
	el.selectionStart = selectionStart + indentationText.length;
	el.selectionEnd = selectionStart + indentationText.length;
}

async function showRecentlyPushedBranches() {
	if (_selectDom2.default.exists('[data-url$=recently_touched_branches_list]')) {
		return;
	}

	const codeTabURL = (0, _selectDom2.default)('[data-hotkey="g c"]').href;
	const fragmentURL = `/${repoUrl}/show_partial?partial=tree%2Frecently_touched_branches_list`;

	const html = await fetch(codeTabURL, {
		credentials: 'include'
	}).then(res => res.text());

	if (html.includes(fragmentURL)) {
		(0, _selectDom2.default)('.repository-content').prepend((0, _domChef.h)('include-fragment', { src: fragmentURL }));
	}
}

function addDiffViewWithoutWhitespaceOption() {
	const container = (0, _selectDom2.default)(['.table-of-contents.Details .BtnGroup', '.pr-review-tools > .diffbar-item'].join(','));

	if (!container || _selectDom2.default.exists('.refined-github-toggle-whitespace')) {
		return;
	}

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', 1);
	}

	container.insertAdjacentElement('afterend', (0, _domChef.h)(
		'div',
		{ 'class': 'diffbar-item refined-github-toggle-whitespace' },
		(0, _domChef.h)(
			'a',
			{ href: url,
				'data-hotkey': 'd w',
				'class': `btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${hidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`,
				'aria-label': `${hidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs` },
			hidingWhitespace ? icons.check : '',
			' ',
			'No Whitespace'
		)
	));
}

function addMilestoneNavigation() {
	(0, _selectDom2.default)('.repository-content').insertAdjacentElement('beforeBegin', (0, _domChef.h)(
		'div',
		{ 'class': 'subnav' },
		(0, _domChef.h)(
			'div',
			{ 'class': 'subnav-links float-left', role: 'navigation' },
			(0, _domChef.h)(
				'a',
				{ href: `/${repoUrl}/labels`, 'class': 'subnav-item' },
				'Labels'
			),
			(0, _domChef.h)(
				'a',
				{ href: `/${repoUrl}/milestones`, 'class': 'subnav-item' },
				'Milestones'
			)
		)
	));
}

function addFilterCommentsByYou() {
	if (_selectDom2.default.exists('.refined-github-filter')) {
		return;
	}
	(0, _selectDom2.default)('.subnav-search-context .js-navigation-item:last-child').insertAdjacentElement('beforeBegin', (0, _domChef.h)(
		'a',
		{
			href: `/${repoUrl}/issues?q=is%3Aopen+commenter:${(0, _utils.getUsername)()}`,
			'class': 'select-menu-item js-navigation-item refined-github-filter' },
		(0, _domChef.h)(
			'div',
			{ 'class': 'select-menu-item-text' },
			'Everything commented by you'
		)
	));
}

function addProjectNewLink() {
	if (_selectDom2.default.exists('#projects-feature:checked') && !_selectDom2.default.exists('#refined-github-project-new-link')) {
		(0, _selectDom2.default)(`#projects-feature ~ p.note`).insertAdjacentElement('afterEnd', (0, _domChef.h)(
			'a',
			{ href: `/${repoUrl}/projects/new`, 'class': 'btn btn-sm', id: 'refined-github-project-new-link' },
			'Add a project'
		));
	}
}

function removeProjectsTab() {
	const projectsTab = (0, _selectDom2.default)('.js-repo-nav .reponav-item[data-selected-links^="repo_projects"]');
	if (projectsTab && projectsTab.querySelector('.Counter, .counter').textContent === '0') {
		projectsTab.remove();
	}
}

function fixSquashAndMergeTitle() {
	const btn = (0, _selectDom2.default)('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}
	btn.addEventListener('click', () => {
		const title = (0, _selectDom2.default)('.js-issue-title').textContent;
		const number = (0, _selectDom2.default)('.gh-header-number').textContent;
		(0, _selectDom2.default)('#merge_title_field').value = `${title.trim()} (${number})`;
	});
}

function addTitleToEmojis() {
	for (const emoji of _selectDom2.default.all('g-emoji')) {
		emoji.setAttribute('title', `:${emoji.getAttribute('alias')}:`);
	}
}

function sortMilestonesByClosestDueDate() {
	for (const a of _selectDom2.default.all('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const url = new URL(a.href);

		if (!url.searchParams.get('direction') && !url.searchParams.get('sort')) {
			url.searchParams.set('direction', 'asc');
			url.searchParams.set('sort', 'due_date');
			a.href = url;
		}
	}
}

function init() {

	if (_selectDom2.default.exists('html.refined-github')) {
		console.count('Refined GitHub was loaded multiple times: https://github.com/sindresorhus/refined-github/issues/479');
		return;
	}

	document.documentElement.classList.add('refined-github');

	if (!pageDetect.isGist()) {
		addTrendingMenuItem();
	}

	$(document).on('keydown', '.js-comment-field', event => {
		if (event.which === 9 && !event.shiftKey) {
			if ($('.suggester').hasClass('active')) {
				return;
			}

			event.preventDefault();
			indentInput(event.target);
			return false;
		}
	});

	$(document).on('click', '.js-hide-inline-comment-form', event => {
		const textarea = event.target.closest('.js-inline-comment-form').querySelector('.js-comment-field');
		if (textarea.value === '') {
			return;
		}

		if (window.confirm('Are you sure you want to discard your unsaved changes?') === false) {
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	});

	$(document).on('pjax:end', () => {
		if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
			addYoursMenuItem();
		}
	});

	$(document).on('copy', '.markdown-body', _copyMarkdown2.default);

	onDomReady();
}

async function onDomReady() {
	const options = await new _webextOptionsSync2.default().getAll();
	await _domLoaded2.default;

	const username = (0, _utils.getUsername)();

	_markUnread2.default.setup();

	if (!pageDetect.isGist()) {
		moveMarketplaceLinkToProfileDropdown();
	}

	if (pageDetect.isGist()) {
		(0, _copyGist2.default)();
	}

	if (pageDetect.isDashboard()) {
		const hideStarsOwnRepos = () => {
			$('#dashboard .news .watch_started, #dashboard .news .fork').has(`.title a[href^="/${username}"]`).css('display', 'none');
		};

		if (options.hideStarsOwnRepos) {
			hideStarsOwnRepos();
			new MutationObserver(() => hideStarsOwnRepos()).observe((0, _selectDom2.default)('#dashboard .news'), { childList: true });
		}

		(0, _autoLoadMoreNews2.default)();
	}

	(0, _uploadButton2.default)();
	new MutationObserver(_uploadButton2.default).observe((0, _selectDom2.default)('div[role=main]'), { childList: true, subtree: true });

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		addYoursMenuItem();
	}

	if (pageDetect.isRepo()) {
		(0, _githubInjection2.default)(window, () => {
			hideEmptyMeta();
			addReleasesTab();
			removeProjectsTab();
			addCompareLink();
			renameInsightsDropdown();
			addTitleToEmojis();
			addReadmeButtons();

			for (const a of _selectDom2.default.all('a[href]')) {
				(0, _shortenRepoUrl.applyToLink)(a, location.href);
			}

			_diffheader2.default.destroy();
			_copyOnY2.default.destroy();

			if (pageDetect.isPR()) {
				linkifyBranchRefs();
				addDeleteForkLink();
				fixSquashAndMergeTitle();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				linkifyIssuesInTitles();
				(0, _opLabels2.default)();
				new MutationObserver(_opLabels2.default).observe((0, _selectDom2.default)('.new-discussion-timeline'), { childList: true, subtree: true });
			}

			if (pageDetect.isPRList() || pageDetect.isIssueList()) {
				addFilterCommentsByYou();
				showRecentlyPushedBranches();
			}

			if (pageDetect.isCommit()) {
				addPatchDiffLinks();
			}

			if (pageDetect.hasDiff()) {
				removeDiffSigns();
				const diffElements = (0, _selectDom2.default)('.js-discussion, #files');
				if (diffElements) {
					new MutationObserver(removeDiffSigns).observe(diffElements, { childList: true, subtree: true });
				}
				addDiffViewWithoutWhitespaceOption();
			}

			if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
				_reactionsAvatars2.default.add(username);
				_reactionsAvatars2.default.addListener(username);
				(0, _showNames2.default)();
			}

			if (pageDetect.isCommitList()) {
				markMergeCommitsInList();
			}

			if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
				_diffheader2.default.setup();
				(0, _copyFilePath2.default)();
			}

			if (pageDetect.isSingleFile()) {
				(0, _copyFile2.default)();
				_copyOnY2.default.setup();
			}

			if (pageDetect.isMilestone()) {
				addMilestoneNavigation();
			}

			if (pageDetect.hasCode()) {
				(0, _linkifyUrlsInCode2.default)();
			}

			if (pageDetect.isRepoSettings()) {
				addProjectNewLink();
			}

			sortMilestonesByClosestDueDate();
		});
	}
}

init();

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const PCancelable = __webpack_require__(15);

const selectorCache = new Map();

module.exports = selector => {
	if (selectorCache.has(selector)) {
		return selectorCache.get(selector);
	}

	const promise = new PCancelable((onCancel, resolve) => {
		let raf;
		onCancel(() => {
			cancelAnimationFrame(raf);
		});

		// Interval to keep checking for it to come into the DOM
		(function check() {
			const el = document.querySelector(selector);

			if (el) {
				resolve(el);
				selectorCache.delete(selector);
			} else {
				raf = requestAnimationFrame(check);
			}
		})();
	});

	selectorCache.set(selector, promise);

	return promise;
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


class CancelError extends Error {
	constructor() {
		super('Promise was canceled');
		this.name = 'CancelError';
	}
}

class PCancelable extends Promise {
	static fn(fn) {
		return function () {
			const args = [].slice.apply(arguments);
			return new PCancelable((onCancel, resolve, reject) => {
				args.unshift(onCancel);
				fn.apply(null, args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		super(resolve => {
			resolve();
		});

		this._pending = true;
		this._canceled = false;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			return executor(
				fn => {
					this._cancel = fn;
				},
				val => {
					this._pending = false;
					resolve(val);
				},
				err => {
					this._pending = false;
					reject(err);
				}
			);
		});
	}

	then() {
		return this._promise.then.apply(this._promise, arguments);
	}

	catch() {
		return this._promise.catch.apply(this._promise, arguments);
	}

	cancel() {
		if (!this._pending || this._canceled) {
			return;
		}

		if (typeof this._cancel === 'function') {
			try {
				this._cancel();
			} catch (err) {
				this._reject(err);
			}
		}

		this._canceled = true;
		this._reject(new CancelError());
	}

	get canceled() {
		return this._canceled;
	}
}

module.exports = PCancelable;
module.exports.CancelError = CancelError;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const {URL} = __webpack_require__(17);
const reservedPaths = __webpack_require__(18);

const patchDiffRegex = /[.](patch|diff)$/;
const releaseRegex = /releases[/]tag[/]([^/]+)/;
const labelRegex = /labels[/]([^/]+)/;
const releaseArchiveRegex = /archive[/](.+)([.]zip|[.]tar[.]gz)/;
const releaseDownloadRegex = /releases[/]download[/]([^/]+)[/](.+)/;

function styleRevision(revision) {
	if (!revision) {
		return;
	}
	revision = revision.replace(patchDiffRegex, '');
	if (/^[0-9a-f]{40}$/.test(revision)) {
		revision = revision.substr(0, 7);
	}
	return `<code>${revision}</code>`;
}

// Filter out null values
function joinValues(array, delimiter = '/') {
	return array.filter(s => s).join(delimiter);
}

function shortenURL(href, currentUrl = 'https://github.com') {
	if (!href) {
		return;
	}

	currentUrl = new URL(currentUrl);
	const currentRepo = currentUrl.pathname.slice(1).split('/', 2).join('/');

	/**
	 * Parse URL
	 */
	const {
		origin,
		pathname,
		search,
		hash
	} = new URL(href);

	const isRaw = [
		'https://raw.githubusercontent.com',
		'https://cdn.rawgit.com',
		'https://rawgit.com'
	].includes(origin);

	let [
		user,
		repo,
		type,
		revision,
		...filePath
	] = pathname.substr(1).split('/');

	if (isRaw) {
		[
			user,
			repo,
			// Raw URLs don't have `blob` here
			revision,
			...filePath
		] = pathname.substr(1).split('/');
		type = 'raw';
	}

	revision = styleRevision(revision);
	filePath = filePath.join('/');

	const isLocal = origin === currentUrl.origin;
	const isThisRepo = (isLocal || isRaw) && currentRepo === `${user}/${repo}`;
	const isReserved = reservedPaths.includes(user);
	const [, diffOrPatch] = pathname.match(patchDiffRegex) || [];
	const [, release] = pathname.match(releaseRegex) || [];
	const [, releaseTag, releaseTagExt] = pathname.match(releaseArchiveRegex) || [];
	const [, downloadTag, downloadFilename] = pathname.match(releaseDownloadRegex) || [];
	const [, label] = pathname.match(labelRegex) || [];
	const isFileOrDir = revision && [
		'raw',
		'tree',
		'blob',
		'blame',
		'commits'
	].includes(type);

	const repoUrl = isThisRepo ? '' : `${user}/${repo}`;

	/**
	 * Shorten URL
	 */

	if (isReserved || pathname === '/' || (!isLocal && !isRaw)) {
		return href
		.replace(/^https:[/][/]/, '')
		.replace(/^www[.]/, '')
		.replace(/[/]$/, '');
	}

	if (user && !repo) {
		return `@${user}${search}${hash}`;
	}

	if (isFileOrDir) {
		const file = `${repoUrl}${filePath ? (repoUrl ? ':' : '/') : ''}${filePath}`;
		const revisioned = joinValues([file, revision], '@');
		const partial = `${revisioned}${search}${hash}`;
		if (type !== 'blob' && type !== 'tree') {
			return `${partial} (${type})`;
		}
		return partial;
	}

	if (diffOrPatch) {
		const partial = joinValues([repoUrl, revision], '@');
		return `${partial}.${diffOrPatch}${search}${hash}`;
	}

	if (release) {
		const partial = joinValues([repoUrl, `<code>${release}</code>`], '@');
		return `${partial}${search}${hash} (release)`;
	}

	if (releaseTagExt) {
		const partial = joinValues([repoUrl, `<code>${releaseTag}</code>`], '@');
		return `${partial}${releaseTagExt}${search}${hash}`;
	}

	if (downloadFilename) {
		const partial = joinValues([repoUrl, `<code>${downloadTag}</code>`], '@');
		return `${partial} ${downloadFilename}${search}${hash} (download)`;
	}

	if (label) {
		return joinValues([repoUrl, label]) + `${search}${hash} (label)`;
	}

	// Drop leading and trailing slash of relative path
	return `${pathname.replace(/^[/]|[/]$/g, '')}${search}${hash}`;
}

function applyToLink(a, currentUrl) {
	// Shorten only if the link name hasn't been customized.
	// .href automatically adds a / to naked origins
	// so that needs to be tested too
	if (a.href === a.textContent || a.href === `${a.textContent}/`) {
		const shortened = shortenURL(a.href, currentUrl);
		// Only touch the dom is the URL has been shortened
		if (shortened !== a.textContent) {
			a.innerHTML = shortened;
			return true;
		}
	}
	return false;
}

module.exports = shortenURL;
module.exports.applyToLink = applyToLink;


/***/ }),
/* 17 */
/***/ (function(module, exports) {

/* global URL */
module.exports.URL = URL;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = [
	"400",
	"401",
	"402",
	"403",
	"404",
	"405",
	"406",
	"407",
	"408",
	"409",
	"410",
	"411",
	"412",
	"413",
	"414",
	"415",
	"416",
	"417",
	"418",
	"419",
	"420",
	"421",
	"422",
	"423",
	"424",
	"425",
	"426",
	"427",
	"428",
	"429",
	"430",
	"431",
	"500",
	"501",
	"502",
	"503",
	"504",
	"505",
	"506",
	"507",
	"508",
	"509",
	"510",
	"511",
	"about",
	"access",
	"account",
	"admin",
	"anonymous",
	"api",
	"apps",
	"auth",
	"billing",
	"blog",
	"business",
	"cache",
	"categories",
	"changelog",
	"codereview",
	"comments",
	"community",
	"compare",
	"contact",
	"dashboard",
	"design",
	"developer",
	"docs",
	"downloads",
	"editor",
	"edu",
	"enterprise",
	"events",
	"explore",
	"features",
	"files",
	"gist",
	"gists",
	"graphs",
	"help",
	"home",
	"hosting",
	"images",
	"info",
	"integrations",
	"issues",
	"jobs",
	"join",
	"languages",
	"legal",
	"linux",
	"lists",
	"login",
	"logout",
	"mac",
	"maintenance",
	"marketplace",
	"mine",
	"mirrors",
	"mobile",
	"navigation",
	"network",
	"new",
	"news",
	"notifications",
	"oauth",
	"offer",
	"open-source",
	"organizations",
	"orgs",
	"pages",
	"payments",
	"personal",
	"plans",
	"plugins",
	"popular",
	"posts",
	"press",
	"pricing",
	"projects",
	"pulls",
	"readme",
	"releases",
	"repositories",
	"search",
	"security",
	"services",
	"sessions",
	"settings",
	"shop",
	"showcases",
	"signin",
	"signup",
	"site",
	"ssh",
	"staff",
	"stars",
	"static",
	"status",
	"store",
	"stories",
	"styleguide",
	"subscriptions",
	"support",
	"talks",
	"teams",
	"terms",
	"tos",
	"tour",
	"translations",
	"trending",
	"updates",
	"username",
	"users",
	"watching",
	"wiki",
	"windows",
	"works-with",
	"www1",
	"www2",
	"www3",
	"www4",
	"www5",
	"www6",
	"www7",
	"www8",
	"www9"
];

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const semver = __webpack_require__(20);

module.exports = (versions, options) => {
	options = Object.assign({
		includePrereleases: true,
		clean: true
	}, options);

	let sortedVersions = versions.filter(x => semver.valid(x)).sort(semver.rcompare);

	if (!options.includePrereleases) {
		sortedVersions = sortedVersions.filter(x => semver.prerelease(x) === null);
	}

	if (options.clean) {
		sortedVersions = sortedVersions.map(x => semver.clean(x));
	}

	return sortedVersions;
};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ process.env &&
    /* nomin */ process.env.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
  /* nomin */ debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ };
/* nomin */ else
  /* nomin */ debug = function() {};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    re[i] = new RegExp(src[i]);
}

exports.parse = parse;
function parse(version, loose) {
  if (version instanceof SemVer)
    return version;

  if (typeof version !== 'string')
    return null;

  if (version.length > MAX_LENGTH)
    return null;

  var r = loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    return null;

  try {
    return new SemVer(version, loose);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      return version;
    else
      version = version.version;
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

  if (!(this instanceof SemVer))
    return new SemVer(version, loose);

  debug('SemVer', version, loose);
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

  if (!m)
    throw new TypeError('Invalid Version: ' + version);

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
    throw new TypeError('Invalid major version')

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
    throw new TypeError('Invalid minor version')

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
    throw new TypeError('Invalid patch version')

  // numberify any prerelease numeric ids
  if (!m[4])
    this.prerelease = [];
  else
    this.prerelease = m[4].split('.').map(function(id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER)
          return num;
      }
      return id;
    });

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    this.version += '-' + this.prerelease.join('.');
  return this.version;
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.loose, other);
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    return -1;
  else if (!this.prerelease.length && other.prerelease.length)
    return 1;
  else if (!this.prerelease.length && !other.prerelease.length)
    return 0;

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      return 0;
    else if (b === undefined)
      return 1;
    else if (a === undefined)
      return -1;
    else if (a === b)
      continue;
    else
      return compareIdentifiers(a, b);
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        this.major++;
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        this.minor++;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        this.patch++;
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        this.prerelease = [0];
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          this.prerelease.push(0);
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            this.prerelease = [identifier, 0];
        } else
          this.prerelease = [identifier, 0];
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  this.raw = this.version;
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.diff = diff;
function diff(version1, version2) {
  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    if (v1.prerelease.length || v2.prerelease.length) {
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return 'pre'+key;
          }
        }
      }
      return 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return key;
        }
      }
    }
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.major = major;
function major(a, loose) {
  return new SemVer(a, loose).major;
}

exports.minor = minor;
function minor(a, loose) {
  return new SemVer(a, loose).minor;
}

exports.patch = patch;
function patch(a, loose) {
  return new SemVer(a, loose).patch;
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(b);
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      return comp;
    else
      comp = comp.value;
  }

  if (!(this instanceof Comparator))
    return new Comparator(comp, loose);

  debug('comparator', comp, loose);
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    this.value = '';
  else
    this.value = this.operator + this.semver.version;

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    throw new TypeError('Invalid comparator: ' + comp);

  this.operator = m[1];
  if (this.operator === '=')
    this.operator = '';

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    this.semver = ANY;
  else
    this.semver = new SemVer(m[2], this.loose);
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.loose);

  if (this.semver === ANY)
    return true;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  return cmp(version, this.operator, this.semver, this.loose);
};


exports.Range = Range;
function Range(range, loose) {
  if ((range instanceof Range) && range.loose === loose)
    return range;

  if (!(this instanceof Range))
    return new Range(range, loose);

  this.loose = loose;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.loose;
  range = range.trim();
  debug('range', range, loose);
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  debug('comp', comp);
  comp = replaceCarets(comp, loose);
  debug('caret', comp);
  comp = replaceTildes(comp, loose);
  debug('tildes', comp);
  comp = replaceXRanges(comp, loose);
  debug('xrange', comp);
  comp = replaceStars(comp, loose);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p))
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  debug('caret', comp, loose);
  var r = loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p)) {
      if (M === '0')
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      else
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0';
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, loose) {
  debug('replaceXRanges', comp, loose);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      gtlt = '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        m = 0;
      if (xp)
        p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm)
          M = +M + 1;
        else
          m = +m + 1;
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, loose) {
  debug('replaceStars', comp, loose);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    from = '';
  else if (isX(fm))
    from = '>=' + fM + '.0.0';
  else if (isX(fp))
    from = '>=' + fM + '.' + fm + '.0';
  else
    from = '>=' + from;

  if (isX(tM))
    to = '';
  else if (isX(tm))
    to = '<' + (+tM + 1) + '.0.0';
  else if (isX(tp))
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  else if (tpr)
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  else
    to = '<=' + to;

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  if (!version)
    return false;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version))
      return true;
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      return false;
  }

  if (version.prerelease.length) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        continue;

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          return true;
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  return versions.filter(function(version) {
    return satisfies(version, range, loose);
  }).sort(function(a, b) {
    return rcompare(a, b, loose);
  })[0] || null;
}

exports.minSatisfying = minSatisfying;
function minSatisfying(versions, range, loose) {
  return versions.filter(function(version) {
    return satisfies(version, range, loose);
  }).sort(function(a, b) {
    return compare(a, b, loose);
  })[0] || null;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, loose)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

exports.prerelease = prerelease;
function prerelease(version, loose) {
  var parsed = parse(version, loose);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ }),
/* 21 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = () => (/(?:[\w-.]+\/[\w-.]+)?#[1-9]\d*/g);


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const escapeGoat = __webpack_require__(24);

module.exports = input => {
	const attributes = [];

	for (const key of Object.keys(input)) {
		let value = input[key];

		if (value === false) {
			continue;
		}

		if (Array.isArray(value)) {
			value = value.join(' ');
		}

		let attribute = escapeGoat.escape(key);

		if (value !== true) {
			attribute += `="${escapeGoat.escape(String(value))}"`;
		}

		attributes.push(attribute);
	}

	return attributes.length > 0 ? ' ' + attributes.join(' ') : '';
};


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.escape = input => input
	.replace(/&/g, '&amp;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;');

exports.unescape = input => input
	.replace(/&amp;/g, '&')
	.replace(/&quot;/g, '"')
	.replace(/&#39;/g, '\'')
	.replace(/&lt;/g, '<')
	.replace(/&gt;/g, '>');


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = __webpack_require__(26);


/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"menuitem",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
];

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = new Promise(resolve => {
	if (document.readyState === 'interactive' || document.readyState === 'complete') {
		resolve();
	} else {
		document.addEventListener('DOMContentLoaded', () => {
			resolve();
		}, {
			capture: true,
			once: true,
			passive: true
		});
	}
});


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = [
	"a",
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animate",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"animation",
	"audio",
	"canvas",
	"circle",
	"clipPath",
	"color-profile",
	"cursor",
	"defs",
	"desc",
	"discard",
	"ellipse",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"filter",
	"font",
	"font-face",
	"font-face-format",
	"font-face-name",
	"font-face-src",
	"font-face-uri",
	"foreignObject",
	"g",
	"glyph",
	"glyphRef",
	"handler",
	"hatch",
	"hatchpath",
	"hkern",
	"iframe",
	"image",
	"line",
	"linearGradient",
	"listener",
	"marker",
	"mask",
	"mesh",
	"meshgradient",
	"meshpatch",
	"meshrow",
	"metadata",
	"missing-glyph",
	"mpath",
	"path",
	"pattern",
	"polygon",
	"polyline",
	"prefetch",
	"radialGradient",
	"rect",
	"script",
	"set",
	"solidColor",
	"solidcolor",
	"stop",
	"style",
	"svg",
	"switch",
	"symbol",
	"tbreak",
	"text",
	"textArea",
	"textPath",
	"title",
	"tref",
	"tspan",
	"unknown",
	"use",
	"video",
	"view",
	"vkern"
];

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
			return classNames;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {
		window.classNames = classNames;
	}
}());


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * arr-flatten <https://github.com/jonschlinkert/arr-flatten>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function (arr) {
  return flat(arr, []);
};

function flat(arr, res) {
  var i = 0, cur;
  var len = arr.length;
  for (; i < len; i++) {
    cur = arr[i];
    Array.isArray(cur) ? flat(cur, res) : res.push(cur);
  }
  return res;
}


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * object.omit <https://github.com/jonschlinkert/object.omit>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



var isObject = __webpack_require__(32);
var forOwn = __webpack_require__(33);

module.exports = function omit(obj, keys) {
  if (!isObject(obj)) return {};

  keys = [].concat.apply([], [].slice.call(arguments, 1));
  var last = keys[keys.length - 1];
  var res = {}, fn;

  if (typeof last === 'function') {
    fn = keys.pop();
  }

  var isFunction = typeof fn === 'function';
  if (!keys.length && !isFunction) {
    return obj;
  }

  forOwn(obj, function(value, key) {
    if (keys.indexOf(key) === -1) {

      if (!isFunction) {
        res[key] = value;
      } else if (fn(value, key, obj)) {
        res[key] = value;
      }
    }
  });
  return res;
};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * for-own <https://github.com/jonschlinkert/for-own>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var forIn = __webpack_require__(34);
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forOwn(obj, fn, thisArg) {
  forIn(obj, function(val, key) {
    if (hasOwn.call(obj, key)) {
      return fn.call(thisArg, obj[key], key, obj);
    }
  });
};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function forIn(obj, fn, thisArg) {
  for (var key in obj) {
    if (fn.call(thisArg, obj[key], key, obj) === false) {
      break;
    }
  }
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _githubInjection = __webpack_require__(9);

var _githubInjection2 = _interopRequireDefault(_githubInjection);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

var _icons = __webpack_require__(8);

var icons = _interopRequireWildcard(_icons);

var _pageDetect = __webpack_require__(3);

var pageDetect = _interopRequireWildcard(_pageDetect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loadNotifications() {
	return JSON.parse(localStorage.getItem('unreadNotifications') || '[]');
}

function storeNotifications(unreadNotifications) {
	localStorage.setItem('unreadNotifications', JSON.stringify(unreadNotifications || '[]'));
}

function stripHash(url) {
	return url.replace(/#.+$/, '');
}

function addMarkUnreadButton() {
	const container = (0, _selectDom2.default)('.js-thread-subscription-status');
	if (container) {
		const button = (0, _domChef.h)(
			'button',
			{ 'class': 'btn btn-sm btn-mark-unread js-mark-unread' },
			'Mark as unread'
		);
		button.addEventListener('click', markUnread, {
			once: true
		});
		container.append(button);
	}
}

function markRead(url) {
	const unreadNotifications = loadNotifications();
	unreadNotifications.forEach((notification, index) => {
		if (notification.url === url) {
			unreadNotifications.splice(index, 1);
		}
	});

	for (const a of _selectDom2.default.all(`a.js-notification-target[href="${url}"]`)) {
		const li = a.closest('li.js-notification');
		li.classList.remove('unread');
		li.classList.add('read');
	}

	storeNotifications(unreadNotifications);
}

function markUnread() {
	const participants = _selectDom2.default.all('.participant-avatar').map(el => ({
		username: el.getAttribute('aria-label'),
		avatar: el.querySelector('img').src
	}));

	const { ownerName, repoName } = pageDetect.getOwnerAndRepo();
	const repository = `${ownerName}/${repoName}`;
	const title = (0, _selectDom2.default)('.js-issue-title').textContent.trim();
	const type = pageDetect.isPR() ? 'pull-request' : 'issue';
	const url = stripHash(location.href);

	const stateLabel = (0, _selectDom2.default)('.gh-header-meta .State');
	let state;

	if (stateLabel.classList.contains('State--green')) {
		state = 'open';
	} else if (stateLabel.classList.contains('State--purple')) {
		state = 'merged';
	} else if (stateLabel.classList.contains('State--red')) {
		state = 'closed';
	}

	const lastCommentTime = _selectDom2.default.all('.timeline-comment-header relative-time').pop();
	const dateTitle = lastCommentTime.title;
	const date = lastCommentTime.getAttribute('datetime');

	const unreadNotifications = loadNotifications();

	unreadNotifications.push({
		participants,
		repository,
		title,
		state,
		type,
		dateTitle,
		date,
		url
	});

	storeNotifications(unreadNotifications);
	updateUnreadIndicator();

	this.setAttribute('disabled', 'disabled');
	this.textContent = 'Marked as unread';
}

function renderNotifications() {
	const unreadNotifications = loadNotifications().filter(notification => !isNotificationExist(notification.url)).filter(notification => {
		if (!isParticipatingPage()) {
			return true;
		}

		const { participants } = notification;
		const myUserName = getUserName();

		return participants.filter(participant => participant.username === myUserName).length > 0;
	});

	if (unreadNotifications.length === 0) {
		return;
	}

	if (isEmptyPage()) {
		(0, _selectDom2.default)('.blankslate').remove();
		(0, _selectDom2.default)('.js-navigation-container').append((0, _domChef.h)('div', { 'class': 'notifications-list' }));
	}

	unreadNotifications.forEach(notification => {
		const {
			participants,
			repository,
			title,
			state,
			type,
			dateTitle,
			date,
			url
		} = notification;

		let icon;

		if (type === 'issue') {
			if (state === 'open') {
				icon = icons.openIssue;
			}

			if (state === 'closed') {
				icon = icons.closedIssue;
			}
		}

		if (type === 'pull-request') {
			if (state === 'open') {
				icon = icons.openPullRequest;
			}

			if (state === 'merged') {
				icon = icons.mergedPullRequest;
			}

			if (state === 'closed') {
				icon = icons.closedPullRequest;
			}
		}

		const hasList = _selectDom2.default.exists(`a.notifications-repo-link[title="${repository}"]`);
		if (!hasList) {
			const list = (0, _domChef.h)(
				'div',
				{ 'class': 'boxed-group flush' },
				(0, _domChef.h)(
					'form',
					{ 'class': 'boxed-group-action' },
					(0, _domChef.h)(
						'button',
						{ 'class': 'mark-all-as-read css-truncate tooltipped tooltipped-w js-mark-all-read', 'aria-label': 'Mark all notifications as read' },
						icons.check
					)
				),
				(0, _domChef.h)(
					'h3',
					null,
					(0, _domChef.h)(
						'a',
						{ href: '/' + repository, 'class': 'css-truncate css-truncate-target notifications-repo-link', title: repository },
						repository
					)
				),
				(0, _domChef.h)('ul', { 'class': 'boxed-group-inner list-group notifications' })
			);

			$('.notifications-list').prepend(list);
		}

		const list = $(`a.notifications-repo-link[title="${repository}"]`).parent().siblings('ul.notifications');

		const usernames = participants.map(participant => participant.username).join(', ');

		const avatars = participants.map(participant => {
			return (0, _domChef.h)('img', { alt: `@${participant.username}`, 'class': 'avatar from-avatar', src: participant.avatar, width: 39, height: 39 });
		});

		const item = (0, _domChef.h)(
			'li',
			{ 'class': `list-group-item js-notification js-navigation-item unread ${type}-notification` },
			(0, _domChef.h)(
				'span',
				{ 'class': 'list-group-item-name css-truncate' },
				icon,
				(0, _domChef.h)(
					'a',
					{ href: url, 'class': 'css-truncate-target js-notification-target js-navigation-open list-group-item-link' },
					title
				)
			),
			(0, _domChef.h)(
				'ul',
				{ 'class': 'notification-actions' },
				(0, _domChef.h)(
					'li',
					{ 'class': 'delete' },
					(0, _domChef.h)(
						'button',
						{ 'aria-label': 'Mark as read', 'class': 'btn-link delete-note tooltipped tooltipped-w js-mark-read' },
						icons.check
					)
				),
				(0, _domChef.h)(
					'li',
					{ 'class': 'mute' },
					(0, _domChef.h)(
						'button',
						{ style: { opacity: 0, pointerEvents: 'none' } },
						icons.mute
					)
				),
				(0, _domChef.h)(
					'li',
					{ 'class': 'age' },
					(0, _domChef.h)('relative-time', { datetime: date, title: dateTitle })
				),
				(0, _domChef.h)(
					'li',
					{ 'class': 'tooltipped tooltipped-s', 'aria-label': usernames },
					(0, _domChef.h)(
						'div',
						{ 'class': 'avatar-stack clearfix' },
						avatars
					)
				)
			)
		);

		list.prepend(item);
	});

	$('.boxed-group:has(".unread")').prependTo('.notifications-list');
}

function isNotificationExist(url) {
	return _selectDom2.default.exists(`a.js-notification-target[href^="${stripHash(url)}"]`);
}

function isEmptyPage() {
	return _selectDom2.default.exists('.blankslate');
}

function isParticipatingPage() {
	return (/\/notifications\/participating/.test(location.pathname)
	);
}

function getUserName() {
	return (0, _selectDom2.default)('#user-links a.name img').getAttribute('alt').slice(1);
}

function updateUnreadIndicator() {
	const icon = (0, _selectDom2.default)('.notification-indicator');
	if (!icon) {
		return;
	}
	const statusMark = icon.querySelector('.mail-status');
	const hasRealNotifications = icon.matches('[data-ga-click$=":unread"]');

	const hasUnread = hasRealNotifications || loadNotifications().length > 0;
	const label = hasUnread ? 'You have unread notifications' : 'You have no unread notifications';

	icon.setAttribute('aria-label', label);
	statusMark.classList.toggle('unread', hasUnread);
}

function markNotificationRead(e) {
	const notification = e.target.closest('li.js-notification');
	const a = notification.querySelector('a.js-notification-target');
	markRead(a.href);
	updateUnreadIndicator();
}

function markAllNotificationsRead(e) {
	e.preventDefault();
	const repoGroup = e.target.closest('.boxed-group');
	for (const a of repoGroup.querySelectorAll('a.js-notification-target')) {
		markRead(a.href);
	}
	updateUnreadIndicator();
}

function addCustomAllReadBtn() {
	const hasMarkAllReadBtnExists = _selectDom2.default.exists('#notification-center a[href="#mark_as_read_confirm_box"]');
	if (hasMarkAllReadBtnExists || loadNotifications().length === 0) {
		return;
	}

	$('#notification-center .tabnav-tabs:first').append((0, _domChef.h)(
		'div',
		{ 'class': 'float-right' },
		(0, _domChef.h)(
			'a',
			{ href: '#mark_as_read_confirm_box', 'class': 'btn btn-sm', rel: 'facebox' },
			'Mark all as read'
		),
		(0, _domChef.h)(
			'div',
			{ id: 'mark_as_read_confirm_box', style: { display: 'none' } },
			(0, _domChef.h)(
				'h2',
				{ 'class': 'facebox-header', 'data-facebox-id': 'facebox-header' },
				'Are you sure?'
			),
			(0, _domChef.h)(
				'p',
				{ 'data-facebox-id': 'facebox-description' },
				'Are you sure you want to mark all unread notifications as read?'
			),
			(0, _domChef.h)(
				'div',
				{ 'class': 'full-button' },
				(0, _domChef.h)(
					'button',
					{ id: 'clear-local-notification', 'class': 'btn btn-block' },
					'Mark all notifications as read'
				)
			)
		)
	));

	$(document).on('click', '#clear-local-notification', () => {
		storeNotifications([]);
		location.reload();
	});
}

function updateLocalNotificationsCount() {
	const unreadCount = (0, _selectDom2.default)('#notification-center .filter-list a[href="/notifications"] .count');
	const githubNotificationsCount = Number(unreadCount.textContent);
	const localNotifications = loadNotifications();

	if (localNotifications) {
		unreadCount.textContent = githubNotificationsCount + localNotifications.length;
	}
}

function setup() {
	(0, _githubInjection2.default)(window, () => {
		destroy();

		if (pageDetect.isNotifications()) {
			renderNotifications();
			addCustomAllReadBtn();
			updateLocalNotificationsCount();
			$(document).on('click', '.js-mark-read', markNotificationRead);
			$(document).on('click', '.js-mark-all-read', markAllNotificationsRead);
			$(document).on('click', '.js-delete-notification button', updateUnreadIndicator);
			$(document).on('click', 'form[action="/notifications/mark"] button', () => {
				storeNotifications([]);
			});
		} else if (pageDetect.isPR() || pageDetect.isIssue()) {
			markRead(location.href);
			addMarkUnreadButton();
		}

		updateUnreadIndicator();
	});
}

function destroy() {
	$(document).off('click', '.js-mark-unread', markUnread);
	$('.js-mark-unread').remove();
}

exports.default = {
	setup,
	destroy
};

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _copyTextToClipboard = __webpack_require__(5);

var _copyTextToClipboard2 = _interopRequireDefault(_copyTextToClipboard);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
	if (_selectDom2.default.exists('.copy-btn')) {
		return;
	}

	$('.blob-wrapper').each((i, blob) => {
		const actionsParent = blob.parentNode.querySelector('.file-actions');
		const $btn = $((0, _domChef.h)(
			'button',
			{ 'class': 'btn btn-sm copy-btn gist-copy-btn' },
			'Copy'
		));
		$btn.data('blob', blob);
		$btn.prependTo(actionsParent);
	});

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = $(e.currentTarget).data('blob').innerText;
		(0, _copyTextToClipboard2.default)(fileContents);
	});
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _domChef = __webpack_require__(1);

var _icons = __webpack_require__(8);

var icons = _interopRequireWildcard(_icons);

var _pageDetect = __webpack_require__(3);

var pageDetect = _interopRequireWildcard(_pageDetect);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const isMac = /Mac/.test(window.navigator.platform);

exports.default = () => {
	if (pageDetect.hasCommentForm()) {
		$('.js-previewable-comment-form').each((index, element) => {
			const $element = $(element);
			if (!$element.hasClass('refined-github-has-upload-btn')) {
				const uploadBtn = (0, _domChef.h)(
					'label',
					{ 'for': `refined-github-upload-btn-${index}`, 'class': 'toolbar-item tooltipped tooltipped-nw refined-github-upload-btn', 'aria-label': 'Upload a file' },
					icons.cloudUpload
				);

				$('.comment-form-head .toolbar-commenting .toolbar-group:last-child', element).append(uploadBtn);

				const keydownHandler = event => {
					if (event.which === 85 && (isMac ? event.metaKey : event.ctrlKey)) {
						event.preventDefault();
						uploadBtn.click();
					}
				};
				$element.find('.js-comment-field').focus(() => $(document).on('keydown', keydownHandler)).blur(() => $(document).off('keydown', keydownHandler));

				$element.find('.js-write-bucket .drag-and-drop .default .js-manual-file-chooser').attr('id', `refined-github-upload-btn-${index}`);
				$element.addClass('refined-github-has-upload-btn');
			}
		});
	}
};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _debounceFn = __webpack_require__(12);

var _debounceFn2 = _interopRequireDefault(_debounceFn);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const diffFile = (() => {
	let lastFile;

	const hasChanged = nextFile => {
		if (nextFile !== lastFile) {
			lastFile = nextFile;
			return true;
		}

		return false;
	};

	const reset = () => {
		lastFile = '';
	};

	return {
		hasChanged,
		reset
	};
})();

const maxPixelsAvailable = () => {
	const filenameLeftOffset = (0, _selectDom2.default)('.diff-toolbar-filename').getBoundingClientRect().left;
	const diffStatLeftOffset = (0, _selectDom2.default)('.diffbar > .diffstat').getBoundingClientRect().left;

	return diffStatLeftOffset - filenameLeftOffset;
};

const parseFileDetails = filename => {
	const folderCount = (filename.match(/\//g) || []).length;
	const [, basename] = filename.match(/(?:\/)([\w.-]+)$/) || [];
	const [, topDir] = filename.match(/^([\w.-]+)\//) || [];

	return {
		folderCount,
		basename,
		topDir
	};
};

const updateFileLabel = val => {
	const $target = $('.diff-toolbar-filename');
	$target.addClass('filename-width-check').text(val);

	const maxPixels = maxPixelsAvailable();
	const doesOverflow = () => $target.get(0).getBoundingClientRect().width > maxPixels;
	const { basename, topDir, folderCount } = parseFileDetails(val);

	if (doesOverflow() && folderCount > 1) {
		$target.text(`${topDir}/.../${basename}`);
	}

	if (doesOverflow()) {
		$target.text(basename);
	}

	$target.removeClass('filename-width-check');
};

const getDiffToolbarHeight = () => {
	const el = (0, _selectDom2.default)('.pr-toolbar.is-stuck');
	return el && el.clientHeight || 0;
};

const isFilePartlyVisible = (fileEl, offset) => {
	const { bottom } = fileEl.getBoundingClientRect();
	return bottom >= offset;
};

const getHighestVisibleDiffFilename = () => {
	const toolbarHeight = getDiffToolbarHeight();
	if (!toolbarHeight) {
		return;
	}

	const files = $('.file.js-details-container').get();
	return files.find(el => isFilePartlyVisible(el, toolbarHeight));
};

const diffHeaderFilename = isResize => {
	const targetDiffFile = getHighestVisibleDiffFilename();
	if (!targetDiffFile) {
		return;
	}

	const filename = targetDiffFile.querySelector('.file-header').dataset.path;

	if (!diffFile.hasChanged(filename) && !isResize) {
		return;
	}

	if (isResize) {
		const target = (0, _selectDom2.default)('.diff-toolbar-filename');
		if (target.getBoundingClientRect().width < maxPixelsAvailable()) {
			return;
		}
	}

	updateFileLabel(filename);
};

const setup = () => {
	$(window).on('scroll.diffheader', () => diffHeaderFilename());
	const onResize = (0, _debounceFn2.default)(() => diffHeaderFilename(true), { wait: 200 });
	$(window).on('resize.diffheader', onResize);

	$('.diffbar > .diffstat').insertAfter('.pr-review-tools');

	(0, _selectDom2.default)('.toc-select').insertAdjacentElement('afterEnd', (0, _domChef.h)('span', { 'class': 'diffbar-item diff-toolbar-filename' }));
	diffFile.reset();
};

const destroy = () => {
	$(window).off('scroll.diffheader');
	$(window).off('resize.diffheader');
	$('.diff-toolbar-filename').remove();
};

exports.default = {
	setup,
	destroy
};

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = (to, from) => {
	// TODO: use `Reflect.ownKeys()` when targeting Node.js 6
	for (const prop of Object.getOwnPropertyNames(from).concat(Object.getOwnPropertySymbols(from))) {
		Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
	}
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _copyTextToClipboard = __webpack_require__(5);

var _copyTextToClipboard2 = _interopRequireDefault(_copyTextToClipboard);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Y_KEYCODE = 89;

const handler = ({ keyCode, target }) => {
	if (keyCode === Y_KEYCODE && target.nodeName !== 'INPUT') {
		const commitIsh = (0, _selectDom2.default)('.commit-tease-sha').textContent.trim();
		const uri = location.href.replace(/\/blob\/[\w-]+\//, `/blob/${commitIsh}/`);

		(0, _copyTextToClipboard2.default)(uri);
	}
};

const setup = () => {
	window.addEventListener('keyup', handler);
};

const destroy = () => {
	window.removeEventListener('keyup', handler);
};

exports.default = {
	setup,
	destroy
};

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _domChef = __webpack_require__(1);

var _utils = __webpack_require__(4);

function add(currentUser) {
	$('.comment-reactions.has-reactions').each((index, reactionsContainer) => {
		const $reactionsContainer = $(reactionsContainer);
		const $reactionButtons = $reactionsContainer.find('.comment-reactions-options .reaction-summary-item[aria-label]');

		$reactionButtons.each((index, element) => {
			const $element = $(element);
			const participantCount = Number($element.html().split('/g-emoji>')[1]);
			const participants = $element.attr('aria-label').replace(/ reacted with.*/, '').replace(/,? and /, ', ').replace(/, \d+ more/, '').split(', ');
			const userPosition = participants.indexOf(currentUser);

			if (participantCount === 1 && userPosition > -1) {
				return;
			}

			if (!element.querySelector('div.participants-container')) {
				element.append((0, _domChef.h)('div', { 'class': 'participants-container' }));
			}

			if (userPosition > -1) {
				participants.splice(userPosition, 1);
			}

			const firstThreeParticipants = participants.slice(0, 3);
			const participantsContainer = element.querySelector('.participants-container');

			(0, _utils.emptyElement)(participantsContainer);

			for (const participant of firstThreeParticipants) {
				participantsContainer.append((0, _domChef.h)(
					'a',
					{ href: `/${participant}` },
					(0, _domChef.h)('img', { src: `/${participant}.png` })
				));
			}
		});
	});
}

function reapply(event, currentUser) {
	if ($(event.target).closest('.add-reactions-options-item, .reaction-summary-item').not('.add-reaction-btn').length === 0) {
		return;
	}

	const applyReactions = setInterval(() => {
		add(currentUser);
		clearInterval(applyReactions);
	}, 500);
}

function addListener(currentUser) {
	$(document).on('click', event => {
		reapply(event, currentUser);
	});
}

exports.default = {
	add,
	reapply,
	addListener
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domify = __webpack_require__(43);

var _domify2 = _interopRequireDefault(_domify);

var _utils = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const storageKey = 'cachedNames';

const getCachedUsers = () => {
	return new Promise(resolve => chrome.storage.local.get(storageKey, resolve));
};

const fetchName = async username => {
	const pageHTML = await fetch(`${location.origin}/${username}/following`).then(res => res.text());

	const el = (0, _domify2.default)(pageHTML).querySelector('h1 strong');

	const fullname = el && el.textContent.slice(1, -1);
	if (!fullname || fullname === username) {
		return false;
	}
	return fullname;
};

exports.default = async () => {
	const myUsername = (0, _utils.getUsername)();
	const cache = (await getCachedUsers())[storageKey] || {};

	const selector = `.js-discussion .author:not(.refined-github-fullname)`;
	const usersOnPage = (0, _utils.groupBy)(_selectDom2.default.all(selector), el => el.textContent);

	const fetchAndAdd = async username => {
		if (typeof cache[username] === 'undefined' && username !== myUsername) {
			cache[username] = await fetchName(username);
		}

		for (const usernameEl of usersOnPage[username]) {
			const commentedNode = usernameEl.parentNode.nextSibling;
			if (commentedNode && commentedNode.textContent.includes('commented')) {
				commentedNode.remove();
			}

			usernameEl.classList.add('refined-github-fullname');

			if (cache[username] && username !== myUsername) {
				const insertionPoint = usernameEl.parentNode.tagName === 'STRONG' ? usernameEl.parentNode : usernameEl;
				insertionPoint.insertAdjacentText('afterend', ` (${cache[username]}) `);
			}
		}
	};

	const fetches = Object.keys(usersOnPage).map(fetchAndAdd);

	await Promise.all(fetches);

	chrome.storage.local.set({ [storageKey]: cache });
};

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = html => {
	const template = document.createElement('template');
	template.innerHTML = html;

	const fragment = template.content;

	if (fragment.firstChild === fragment.lastChild) {
		return fragment.firstChild;
	}

	return fragment;
};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

var _utils = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addFilePathCopyBtn() {
	for (const file of _selectDom2.default.all('#files .file-header:not(.rgh-copy-file-path)')) {
		file.classList.add('rgh-copy-file-path', 'js-zeroclipboard-container');

		(0, _selectDom2.default)('.file-info a', file).classList.add('js-zeroclipboard-target');

		const viewButton = (0, _selectDom2.default)('[aria-label^="View"]', file);
		viewButton.classList.add('BtnGroup-item');
		viewButton.replaceWith((0, _domChef.h)(
			'div',
			{ 'class': 'BtnGroup' },
			(0, _domChef.h)(
				'button',
				{ 'aria-label': 'Copy file path to clipboard', 'class': 'js-zeroclipboard btn btn-sm BtnGroup-item tooltipped tooltipped-s', 'data-copied-hint': 'Copied!', type: 'button' },
				'Copy path'
			),
			viewButton
		));
	}
}

exports.default = () => {
	(0, _utils.observeEl)('#files', addFilePathCopyBtn, { childList: true, subtree: true });
};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _copyTextToClipboard = __webpack_require__(5);

var _copyTextToClipboard2 = _interopRequireDefault(_copyTextToClipboard);

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
	if (_selectDom2.default.exists('.copy-btn') || !_selectDom2.default.exists('[data-line-number="1"]')) {
		return;
	}

	const targetSibling = (0, _selectDom2.default)('#raw-url');
	const fileUri = targetSibling.getAttribute('href');
	targetSibling.insertAdjacentElement('beforeBegin', (0, _domChef.h)(
		'a',
		{ href: fileUri, 'class': 'btn btn-sm BtnGroup-item copy-btn' },
		'Copy'
	));

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = (0, _selectDom2.default)('.js-file-line-container').innerText;
		(0, _copyTextToClipboard2.default)(fileContents);
	});
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getSmarterMarkdown = undefined;

var _toMarkdown = __webpack_require__(47);

var _toMarkdown2 = _interopRequireDefault(_toMarkdown);

var _copyTextToClipboard = __webpack_require__(5);

var _copyTextToClipboard2 = _interopRequireDefault(_copyTextToClipboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const unwrapContent = content => content;
const unshortenRegex = /^https:[/][/](www[.])?|[/]$/g;

const converters = [{
	filter: node => node.matches('g-emoji,.handle,input.task-list-item-checkbox'),
	replacement: unwrapContent
}, {
	filter: node => node.matches('.commit-link,.issue-link') || node.href && node.href.replace(unshortenRegex, '') === node.textContent,
	replacement: (content, element) => element.href
}, {
	filter: node => node.tagName === 'A' && node.childNodes.length === 1 && node.firstChild.tagName === 'IMG' && node.firstChild.src === node.href,
	replacement: unwrapContent
}, {
	filter: node => node.matches('img[width],img[height],img[align]'),
	replacement: (content, element) => element.outerHTML
}];

const getSmarterMarkdown = exports.getSmarterMarkdown = html => (0, _toMarkdown2.default)(html, {
	converters,
	gfm: true
});

exports.default = event => {
	const selection = window.getSelection();
	const range = selection.getRangeAt(0);
	const container = range.commonAncestorContainer;
	const containerEl = container.closest ? container : container.parentNode;

	if (containerEl.closest('pre') || containerEl.querySelector('.markdown-body')) {
		return;
	}

	const holder = document.createElement('div');
	holder.append(range.cloneContents());

	if (holder.firstChild.tagName === 'LI') {
		const list = document.createElement(containerEl.tagName);
		try {
			const originalLi = range.startContainer.parentNode.closest('li');
			list.start = containerEl.start + [...containerEl.children].indexOf(originalLi);
		} catch (err) {}
		list.append(...holder.childNodes);
		holder.appendChild(list);
	}

	const markdown = getSmarterMarkdown(holder.innerHTML);

	(0, _copyTextToClipboard2.default)(markdown);

	event.stopImmediatePropagation();
	event.preventDefault();
};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011+, Dom Christie
 * Licenced under the MIT licence
 *
 */



var toMarkdown
var converters
var mdConverters = __webpack_require__(48)
var gfmConverters = __webpack_require__(49)
var HtmlParser = __webpack_require__(50)
var collapse = __webpack_require__(52)

/*
 * Utilities
 */

var blocks = ['address', 'article', 'aside', 'audio', 'blockquote', 'body',
  'canvas', 'center', 'dd', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption',
  'figure', 'footer', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hgroup', 'hr', 'html', 'isindex', 'li', 'main', 'menu', 'nav',
  'noframes', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
]

function isBlock (node) {
  return blocks.indexOf(node.nodeName.toLowerCase()) !== -1
}

var voids = [
  'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input',
  'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'
]

function isVoid (node) {
  return voids.indexOf(node.nodeName.toLowerCase()) !== -1
}

function htmlToDom (string) {
  var tree = new HtmlParser().parseFromString(string, 'text/html')
  collapse(tree.documentElement, isBlock)
  return tree
}

/*
 * Flattens DOM tree into single array
 */

function bfsOrder (node) {
  var inqueue = [node]
  var outqueue = []
  var elem
  var children
  var i

  while (inqueue.length > 0) {
    elem = inqueue.shift()
    outqueue.push(elem)
    children = elem.childNodes
    for (i = 0; i < children.length; i++) {
      if (children[i].nodeType === 1) inqueue.push(children[i])
    }
  }
  outqueue.shift()
  return outqueue
}

/*
 * Contructs a Markdown string of replacement text for a given node
 */

function getContent (node) {
  var text = ''
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].nodeType === 1) {
      text += node.childNodes[i]._replacement
    } else if (node.childNodes[i].nodeType === 3) {
      text += node.childNodes[i].data
    } else continue
  }
  return text
}

/*
 * Returns the HTML string of an element with its contents converted
 */

function outer (node, content) {
  return node.cloneNode(false).outerHTML.replace('><', '>' + content + '<')
}

function canConvert (node, filter) {
  if (typeof filter === 'string') {
    return filter === node.nodeName.toLowerCase()
  }
  if (Array.isArray(filter)) {
    return filter.indexOf(node.nodeName.toLowerCase()) !== -1
  } else if (typeof filter === 'function') {
    return filter.call(toMarkdown, node)
  } else {
    throw new TypeError('`filter` needs to be a string, array, or function')
  }
}

function isFlankedByWhitespace (side, node) {
  var sibling
  var regExp
  var isFlanked

  if (side === 'left') {
    sibling = node.previousSibling
    regExp = / $/
  } else {
    sibling = node.nextSibling
    regExp = /^ /
  }

  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue)
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent)
    }
  }
  return isFlanked
}

function flankingWhitespace (node, content) {
  var leading = ''
  var trailing = ''

  if (!isBlock(node)) {
    var hasLeading = /^[ \r\n\t]/.test(content)
    var hasTrailing = /[ \r\n\t]$/.test(content)

    if (hasLeading && !isFlankedByWhitespace('left', node)) {
      leading = ' '
    }
    if (hasTrailing && !isFlankedByWhitespace('right', node)) {
      trailing = ' '
    }
  }

  return { leading: leading, trailing: trailing }
}

/*
 * Finds a Markdown converter, gets the replacement, and sets it on
 * `_replacement`
 */

function process (node) {
  var replacement
  var content = getContent(node)

  // Remove blank nodes
  if (!isVoid(node) && !/A|TH|TD/.test(node.nodeName) && /^\s*$/i.test(content)) {
    node._replacement = ''
    return
  }

  for (var i = 0; i < converters.length; i++) {
    var converter = converters[i]

    if (canConvert(node, converter.filter)) {
      if (typeof converter.replacement !== 'function') {
        throw new TypeError(
          '`replacement` needs to be a function that returns a string'
        )
      }

      var whitespace = flankingWhitespace(node, content)

      if (whitespace.leading || whitespace.trailing) {
        content = content.trim()
      }
      replacement = whitespace.leading +
        converter.replacement.call(toMarkdown, content, node) +
        whitespace.trailing
      break
    }
  }

  node._replacement = replacement
}

toMarkdown = function (input, options) {
  options = options || {}

  if (typeof input !== 'string') {
    throw new TypeError(input + ' is not a string')
  }

  if (input === '') {
    return ''
  }

  // Escape potential ol triggers
  input = input.replace(/(\d+)\. /g, '$1\\. ')

  var clone = htmlToDom(input).body
  var nodes = bfsOrder(clone)
  var output

  converters = mdConverters.slice(0)
  if (options.gfm) {
    converters = gfmConverters.concat(converters)
  }

  if (options.converters) {
    converters = options.converters.concat(converters)
  }

  // Process through nodes in reverse (so deepest child elements are first).
  for (var i = nodes.length - 1; i >= 0; i--) {
    process(nodes[i])
  }
  output = getContent(clone)

  return output.replace(/^[\t\r\n]+|[\t\r\n\s]+$/g, '')
    .replace(/\n\s+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
}

toMarkdown.isBlock = isBlock
toMarkdown.isVoid = isVoid
toMarkdown.outer = outer

module.exports = toMarkdown


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = [
  {
    filter: 'p',
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'br',
    replacement: function () {
      return '  \n'
    }
  },

  {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: function (content, node) {
      var hLevel = node.nodeName.charAt(1)
      var hPrefix = ''
      for (var i = 0; i < hLevel; i++) {
        hPrefix += '#'
      }
      return '\n\n' + hPrefix + ' ' + content + '\n\n'
    }
  },

  {
    filter: 'hr',
    replacement: function () {
      return '\n\n* * *\n\n'
    }
  },

  {
    filter: ['em', 'i'],
    replacement: function (content) {
      return '_' + content + '_'
    }
  },

  {
    filter: ['strong', 'b'],
    replacement: function (content) {
      return '**' + content + '**'
    }
  },

  // Inline code
  {
    filter: function (node) {
      var hasSiblings = node.previousSibling || node.nextSibling
      var isCodeBlock = node.parentNode.nodeName === 'PRE' && !hasSiblings

      return node.nodeName === 'CODE' && !isCodeBlock
    },
    replacement: function (content) {
      return '`' + content + '`'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'A' && node.getAttribute('href')
    },
    replacement: function (content, node) {
      var titlePart = node.title ? ' "' + node.title + '"' : ''
      return '[' + content + '](' + node.getAttribute('href') + titlePart + ')'
    }
  },

  {
    filter: 'img',
    replacement: function (content, node) {
      var alt = node.alt || ''
      var src = node.getAttribute('src') || ''
      var title = node.title || ''
      var titlePart = title ? ' "' + title + '"' : ''
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : ''
    }
  },

  // Code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' && node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n    ' + node.firstChild.textContent.replace(/\n/g, '\n    ') + '\n\n'
    }
  },

  {
    filter: 'blockquote',
    replacement: function (content) {
      content = content.trim()
      content = content.replace(/\n{3,}/g, '\n\n')
      content = content.replace(/^/gm, '> ')
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: 'li',
    replacement: function (content, node) {
      content = content.replace(/^\s+/, '').replace(/\n/gm, '\n    ')
      var prefix = '*   '
      var parent = node.parentNode
      if (parent.nodeName === 'OL') {
        var start = parent.getAttribute('start')
        var index = Array.prototype.indexOf.call(parent.children, node)
        prefix = (start ? Number(start) + index : index + 1) + '.  '
      }

      return prefix + content
    }
  },

  {
    filter: ['ul', 'ol'],
    replacement: function (content, node) {
      var strings = []
      for (var i = 0; i < node.childNodes.length; i++) {
        strings.push(node.childNodes[i]._replacement)
      }

      if (/li/i.test(node.parentNode.nodeName)) {
        return '\n' + strings.join('\n')
      }
      return '\n\n' + strings.join('\n') + '\n\n'
    }
  },

  {
    filter: function (node) {
      return this.isBlock(node)
    },
    replacement: function (content, node) {
      return '\n\n' + this.outer(node, content) + '\n\n'
    }
  },

  // Anything else!
  {
    filter: function () {
      return true
    },
    replacement: function (content, node) {
      return this.outer(node, content)
    }
  }
]


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function cell (content, node) {
  var index = Array.prototype.indexOf.call(node.parentNode.childNodes, node)
  var prefix = ' '
  if (index === 0) prefix = '| '
  return prefix + content + ' |'
}

var highlightRegEx = /highlight highlight-(\S+)/

module.exports = [
  {
    filter: 'br',
    replacement: function () {
      return '\n'
    }
  },
  {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  },

  {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },
    replacement: function (content, node) {
      return (node.checked ? '[x]' : '[ ]') + ' '
    }
  },

  {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      return cell(content, node)
    }
  },

  {
    filter: 'tr',
    replacement: function (content, node) {
      var borderCells = ''
      var alignMap = { left: ':--', right: '--:', center: ':-:' }

      if (node.parentNode.nodeName === 'THEAD') {
        for (var i = 0; i < node.childNodes.length; i++) {
          var align = node.childNodes[i].attributes.align
          var border = '---'

          if (align) border = alignMap[align.value] || border

          borderCells += cell(border, node.childNodes[i])
        }
      }
      return '\n' + content + (borderCells ? '\n' + borderCells : '')
    }
  },

  {
    filter: 'table',
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  },

  {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function (content) {
      return content
    }
  },

  // Fenced code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n```\n' + node.firstChild.textContent + '\n```\n\n'
    }
  },

  // Syntax-highlighted code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.parentNode.nodeName === 'DIV' &&
      highlightRegEx.test(node.parentNode.className)
    },
    replacement: function (content, node) {
      var language = node.parentNode.className.match(highlightRegEx)[1]
      return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'DIV' &&
      highlightRegEx.test(node.className)
    },
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  }
]


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

/*
 * Set up window for Node.js
 */

var _window = (typeof window !== 'undefined' ? window : this)

/*
 * Parsing HTML strings
 */

function canParseHtmlNatively () {
  var Parser = _window.DOMParser
  var canParse = false

  // Adapted from https://gist.github.com/1129031
  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if (new Parser().parseFromString('', 'text/html')) {
      canParse = true
    }
  } catch (e) {}

  return canParse
}

function createHtmlParser () {
  var Parser = function () {}

  // For Node.js environments
  if (typeof document === 'undefined') {
    var jsdom = __webpack_require__(51)
    Parser.prototype.parseFromString = function (string) {
      return jsdom.jsdom(string, {
        features: {
          FetchExternalResources: [],
          ProcessExternalResources: false
        }
      })
    }
  } else {
    if (!shouldUseActiveX()) {
      Parser.prototype.parseFromString = function (string) {
        var doc = document.implementation.createHTMLDocument('')
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    } else {
      Parser.prototype.parseFromString = function (string) {
        var doc = new window.ActiveXObject('htmlfile')
        doc.designMode = 'on' // disable on-page scripts
        doc.open()
        doc.write(string)
        doc.close()
        return doc
      }
    }
  }
  return Parser
}

function shouldUseActiveX () {
  var useActiveX = false

  try {
    document.implementation.createHTMLDocument('').open()
  } catch (e) {
    if (window.ActiveXObject) useActiveX = true
  }

  return useActiveX
}

module.exports = canParseHtmlNatively() ? _window.DOMParser : createHtmlParser()


/***/ }),
/* 51 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var voidElements = __webpack_require__(53);
Object.keys(voidElements).forEach(function (name) {
  voidElements[name.toUpperCase()] = 1;
});

var blockElements = {};
__webpack_require__(54).forEach(function (name) {
  blockElements[name.toUpperCase()] = 1;
});

/**
 * isBlockElem(node) determines if the given node is a block element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
function isBlockElem(node) {
  return !!(node && blockElements[node.nodeName]);
}

/**
 * isVoid(node) determines if the given node is a void element.
 *
 * @param {Node} node
 * @return {Boolean}
 */
function isVoid(node) {
  return !!(node && voidElements[node.nodeName]);
}

/**
 * whitespace(elem [, isBlock]) removes extraneous whitespace from an
 * the given element. The function isBlock may optionally be passed in
 * to determine whether or not an element is a block element; if none
 * is provided, defaults to using the list of block elements provided
 * by the `block-elements` module.
 *
 * @param {Node} elem
 * @param {Function} blockTest
 */
function collapseWhitespace(elem, isBlock) {
  if (!elem.firstChild || elem.nodeName === 'PRE') return;

  if (typeof isBlock !== 'function') {
    isBlock = isBlockElem;
  }

  var prevText = null;
  var prevVoid = false;

  var prev = null;
  var node = next(prev, elem);

  while (node !== elem) {
    if (node.nodeType === 3) {
      // Node.TEXT_NODE
      var text = node.data.replace(/[ \r\n\t]+/g, ' ');

      if ((!prevText || / $/.test(prevText.data)) && !prevVoid && text[0] === ' ') {
        text = text.substr(1);
      }

      // `text` might be empty at this point.
      if (!text) {
        node = remove(node);
        continue;
      }

      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      // Node.ELEMENT_NODE
      if (isBlock(node) || node.nodeName === 'BR') {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, '');
        }

        prevText = null;
        prevVoid = false;
      } else if (isVoid(node)) {
        // Avoid trimming space around non-block, non-BR void elements.
        prevText = null;
        prevVoid = true;
      }
    } else {
      node = remove(node);
      continue;
    }

    var nextNode = next(prev, node);
    prev = node;
    node = nextNode;
  }

  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, '');
    if (!prevText.data) {
      remove(prevText);
    }
  }
}

/**
 * remove(node) removes the given node from the DOM and returns the
 * next node in the sequence.
 *
 * @param {Node} node
 * @return {Node} node
 */
function remove(node) {
  var next = node.nextSibling || node.parentNode;

  node.parentNode.removeChild(node);

  return next;
}

/**
 * next(prev, current) returns the next node in the sequence, given the
 * current and previous nodes.
 *
 * @param {Node} prev
 * @param {Node} current
 * @return {Node}
 */
function next(prev, current) {
  if (prev && prev.parentNode === current || current.nodeName === 'PRE') {
    return current.nextSibling || current.parentNode;
  }

  return current.firstChild || current.nextSibling || current.parentNode;
}

module.exports = collapseWhitespace;


/***/ }),
/* 53 */
/***/ (function(module, exports) {

/**
 * This file automatically generated from `pre-publish.js`.
 * Do not manually edit.
 */

module.exports = {
  "area": true,
  "base": true,
  "br": true,
  "col": true,
  "embed": true,
  "hr": true,
  "img": true,
  "input": true,
  "keygen": true,
  "link": true,
  "menuitem": true,
  "meta": true,
  "param": true,
  "source": true,
  "track": true,
  "wbr": true
};


/***/ }),
/* 54 */
/***/ (function(module, exports) {

/**
 * This file automatically generated from `build.js`.
 * Do not manually edit.
 */

module.exports = [
  "address",
  "article",
  "aside",
  "blockquote",
  "canvas",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "li",
  "main",
  "nav",
  "noscript",
  "ol",
  "output",
  "p",
  "pre",
  "section",
  "table",
  "tfoot",
  "ul",
  "video"
];


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.editTextNodes = undefined;

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _linkifyUrls = __webpack_require__(56);

var _linkifyUrls2 = _interopRequireDefault(_linkifyUrls);

var _linkifyIssues = __webpack_require__(10);

var _linkifyIssues2 = _interopRequireDefault(_linkifyIssues);

var _pageDetect = __webpack_require__(3);

var _getTextNodes = __webpack_require__(57);

var _getTextNodes2 = _interopRequireDefault(_getTextNodes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const linkifiedURLClass = 'refined-github-linkified-code';
const {
	ownerName,
	repoName
} = (0, _pageDetect.getOwnerAndRepo)();

const options = {
	user: ownerName,
	repo: repoName,
	type: 'dom',
	attrs: {
		target: '_blank'
	}
};

const editTextNodes = exports.editTextNodes = (fn, el) => {
	for (const textNode of [...(0, _getTextNodes2.default)(el)]) {
		if (fn === _linkifyUrls2.default && textNode.textContent.length < 11) {
			continue;
		}
		const linkified = fn(textNode.textContent, options);
		if (linkified.children.length > 0) {
			textNode.replaceWith(linkified);
		}
	}
};

exports.default = () => {
	const wrappers = _selectDom2.default.all(`.highlight:not(.${linkifiedURLClass})`);

	if (wrappers.length === 0) {
		return;
	}

	for (const el of _selectDom2.default.all('.blob-code-inner, pre', wrappers)) {
		editTextNodes(_linkifyUrls2.default, el);
	}

	for (const el of _selectDom2.default.all('span.pl-c', wrappers)) {
		editTextNodes(_linkifyIssues2.default, el);
	}

	for (const el of wrappers) {
		el.classList.add(linkifiedURLClass);
	}
};

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* globals document */


// - const urlRegex = require('url-regex');
const createHtmlElement = __webpack_require__(11);

// Capture the whole URL in group 1 to keep string.split() support
const urlRegex = () => (/((?:https?(?::\/\/))(?:www\.)?[a-zA-Z0-9-_.]+(?:\.[a-zA-Z0-9]{2,})(?:[-a-zA-Z0-9:%_+.~#?&//=@]*))/g);

// Get <a> element as string
const linkify = (href, options) => createHtmlElement({
	name: 'a',
	attributes: Object.assign({href: ''}, options.attributes, {href}),
	value: href
});

// Get DOM node from HTML
const domify = html => document.createRange().createContextualFragment(html);

const getAsString = (input, options) => {
	return input.replace(urlRegex(), match => linkify(match, options));
};

const getAsDocumentFragment = (input, options) => {
	return input.split(urlRegex()).reduce((frag, text, index) => {
		if (index % 2) { // URLs are always in odd positions
			frag.appendChild(domify(linkify(text, options)));
		} else if (text.length > 0) {
			frag.appendChild(document.createTextNode(text));
		}

		return frag;
	}, document.createDocumentFragment());
};

module.exports = (input, options) => {
	options = Object.assign({
		attributes: {},
		type: 'string'
	}, options);

	if (options.type === 'string') {
		return getAsString(input, options);
	}

	if (options.type === 'dom') {
		return getAsDocumentFragment(input, options);
	}

	throw new Error('The type option must be either dom or string');
};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = el => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const next = () => {
		const value = walker.nextNode();
		return {
			value,
			done: !value
		};
	};
	walker[Symbol.iterator] = () => ({ next });
	return walker;
};

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _debounceFn = __webpack_require__(12);

var _debounceFn2 = _interopRequireDefault(_debounceFn);

var _onFeedUpdate = __webpack_require__(59);

var _onFeedUpdate2 = _interopRequireDefault(_onFeedUpdate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let btn;

const loadMore = (0, _debounceFn2.default)(() => {
	btn.click();

	if (!btn.disabled) {
		loadMore();
	}
}, { wait: 200 });

const IntersectionObserver = window.IntersectionObserver || class IntersectionObserverLocalfill {
	maybeLoadMore() {
		if (window.innerHeight > btn.getBoundingClientRect().top - 500) {
			loadMore();
		}
	}
	observe() {
		window.addEventListener('scroll', this.maybeLoadMore);
		window.addEventListener('resize', this.maybeLoadMore);
		this.maybeLoadMore();
	}
	disconnect() {
		window.removeEventListener('scroll', this.maybeLoadMore);
		window.removeEventListener('resize', this.maybeLoadMore);
	}
};

const inView = new IntersectionObserver(([{ isIntersecting }]) => {
	if (isIntersecting) {
		loadMore();
	}
}, {
	rootMargin: '500px' });

const findButton = () => {
	if (btn && document.contains(btn)) {
		return;
	}

	inView.disconnect();

	btn = (0, _selectDom2.default)('.ajax-pagination-btn');
	if (btn) {
		inView.observe(btn);
	} else {
		_onFeedUpdate2.default.off(findButton);
	}
};

exports.default = () => {
	const form = (0, _selectDom2.default)('.ajax-pagination-form');
	if (form) {
		form.addEventListener('submit', e => e.preventDefault());

		_onFeedUpdate2.default.on(findButton);
		findButton();
	}
};

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
const callbacks = new Set();
const observer = new MutationObserver(records => {
	for (const cb of callbacks) {
		cb(records, observer);
	}
});

exports.default = {
	on(cb) {
		if (typeof cb !== 'function') {
			throw new TypeError('cb must be a function');
		}
		if (callbacks.size === 0) {
			observer.observe(document.querySelector('#dashboard .news'), {
				childList: true
			});
		}
		callbacks.add(cb);
	},
	off(cb) {
		if (typeof cb !== 'function') {
			throw new TypeError('cb must be a function');
		}
		callbacks.delete(cb);
		if (callbacks.size === 0) {
			observer.disconnect();
		}
	}
};

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _selectDom = __webpack_require__(0);

var _selectDom2 = _interopRequireDefault(_selectDom);

var _domChef = __webpack_require__(1);

var _pageDetect = __webpack_require__(3);

var pageDetect = _interopRequireWildcard(_pageDetect);

var _utils = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = () => {
	let op;
	if (pageDetect.isPR()) {
		const titleRegex = /^(?:.+) by (\S+) · Pull Request #(\d+)/;
		[, op] = titleRegex.exec(document.title) || [];
	} else {
		op = (0, _selectDom2.default)('.timeline-comment-header-text .author').textContent;
	}

	let newComments = $(`.js-comment:not(.refined-github-op)`).has(`strong .author[href="/${op}"]`).get();

	if (!pageDetect.isPRFiles()) {
		newComments = newComments.slice(1);
	}

	if (newComments.length === 0) {
		return;
	}

	const type = pageDetect.isPR() ? 'pull request' : 'issue';
	const tooltip = `${op === (0, _utils.getUsername)() ? 'You' : 'This user'} submitted this ${type}.`;

	const placeholders = _selectDom2.default.all(`
		.timeline-comment .timeline-comment-header-text,
		.review-comment .comment-body
	`, newComments);

	for (const placeholder of placeholders) {
		placeholder.insertAdjacentElement('beforeBegin', (0, _domChef.h)(
			'span',
			{ 'class': 'timeline-comment-label tooltipped tooltipped-multiline tooltipped-s', 'aria-label': tooltip },
			'Original\xA0Poster'
		));
	}

	for (const el of newComments) {
		el.classList.add('refined-github-op');
	}
};

/***/ })
/******/ ]);