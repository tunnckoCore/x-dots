(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * lodash 4.0.6 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @type {Function}
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred function to be invoked.
 */
var now = Date.now;

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide an options object to indicate whether `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent calls
 * to the debounced function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime = 0,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (!lastCallTime || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    clearTimeout(timerId);
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastCallTime = lastInvokeTime = 0;
    lastArgs = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3);
 * // => 3
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3');
 * // => 3
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.startSearch = startSearch;
exports.listenForGiphyResponse = listenForGiphyResponse;
function startSearch(text) {
    window.postMessage({
        giphySearch: true,
        query: text
    }, '*');
}

function listenForGiphyResponse(cb) {
    var handler = function handler(_ref) {
        var data = _ref.data;

        if (!(data && data.giphyResponse)) return;
        cb(data);
    };

    window.addEventListener('message', handler);

    return function removeListener() {
        window.removeEventListener('message', handler);
    };
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bypassCSPForImages = bypassCSPForImages;

var _page = require('./page');

function getMarkdownPreview(text) {
    // Upgrade jQuery deferred to an ES6 Promise
    return Promise.resolve($.ajax({
        method: 'POST',
        url: (0, _page.getPreviewUri)(),
        data: {
            authenticity_token: (0, _page.getAuthenticityToken)(),
            text: text
        }
    }));
}

function bypassCSPForImages() {
    var images = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    var markdown = images.map(function (image) {
        return '![' + image.name + '](' + image.uri + ') ![downsized](' + image.downsizedUri + ')';
    }).join('\n\n');

    return getMarkdownPreview(markdown).then(function (res) {
        var $res = $(res);
        return Array.from($res.filter('p')).map(function (p) {
            var imgs = $(p).find('img');
            return {
                uri: imgs.get(0).src,
                name: imgs.get(0).alt,
                downsizedUri: imgs.get(1).src
            };
        });
    });
}

},{"./page":5}],4:[function(require,module,exports){
'use strict';

var _page = require('./page');

var _widget = require('../../widget');

var _widget2 = _interopRequireDefault(_widget);

var _events = require('../../events');

var _utils = require('../../utils');

var _api = require('./api');

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// HACK: GitHub removed their jQuery global.
// Short term fix: restore the global
// Better fix (when time permits) just use direct DOM APIs
window.$ = window.require('jquery');

(0, _page.addBtnToToolbars)();
(0, _page.onPartialRender)(_page.addBtnToToolbars);
(0, _page.addBtnToNewInlineComments)();

(0, _page.onGiphyBtnClick)(function (_ref) {
    var form = _ref.form;
    var button = _ref.button;
    var input = _ref.input;

    var onSelection = function onSelection(data) {
        var textarea = $(form).find('textarea').get(0);
        (0, _page.insertTextAtCursor)(textarea, (0, _utils.toMarkdownImage)(data));
    };

    var onImageData = function onImageData(_ref2) {
        var images = _ref2.res;

        if (!giphyWidget) return;

        if (!images.length) {
            giphyWidget.toggleLoading(false).toggleMessage(true, 'No Results Found :(');
            return;
        }

        (0, _api.bypassCSPForImages)(images).then(function (imgList) {
            giphyWidget.toggleLoading(false);
            giphyWidget.updateImageList(imgList);
        }).catch(function (err) {
            console.error(err);
            giphyWidget.toggleLoading(false);
        });
    };

    var onDispose = function onDispose() {
        giphyWidget = null;
        unbindListener();
    };

    var unbindListener = (0, _events.listenForGiphyResponse)(onImageData);

    var _$$offset = $(button).offset();

    var top = _$$offset.top;
    var left = _$$offset.left;

    var giphyWidget = _widget2.default.create({
        onSelection: onSelection,
        onDispose: onDispose,
        onTextChange: (0, _lodash2.default)(_events.startSearch, 1000)
    }).appendToDOM().showAt(top + 28, left - 124);
});

},{"../../events":2,"../../utils":6,"../../widget":7,"./api":3,"./page":5,"lodash.debounce":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addBtnToToolbars = addBtnToToolbars;
exports.onPartialRender = onPartialRender;
exports.addBtnToNewInlineComments = addBtnToNewInlineComments;
exports.onGiphyBtnClick = onGiphyBtnClick;
exports.getAuthenticityToken = getAuthenticityToken;
exports.getPreviewUri = getPreviewUri;
exports.insertTextAtCursor = insertTextAtCursor;
// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39

var btnTemplate = "<button type=\"button\" class=\"js-giphy-btn toolbar-item tooltipped tooltipped-nw\"\n    aria-label=\"Add a GIF\" tabindex=\"-1\" data-ga-click=\"Giphy\">\n        <svg aria-hidden=\"true\" class=\"octicon octicon-file-media\" height=\"16\" role=\"img\" version=\"1.1\" viewBox=\"0 0 16 16\" width=\"16\">\n          <path d=\"M6 5h2v2H6V5z m6-0.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v11l3-5 2 4 2-2 3 3V5z\" />\n        </svg>\n</button>\n";

function addBtnToToolbars() {
    $('.toolbar-group:last-child').append(btnTemplate);
}

function onPartialRender(cb) {
    $(document).on('pjax:success', cb);
}

// adds giphy button when editing new inline comments
function addBtnToNewInlineComments() {
    $(document).on('click', '.js-inline-comments-container .comment.previewable-edit .js-comment-edit-button', function (e) {
        var addedComment = $(e.target).closest('.comment.previewable-edit').find('.toolbar-group:last-child');
        if (addedComment.find('.js-giphy-btn').length > 0) {
            return;
        }
        addedComment.append(btnTemplate);
    });
}

function onGiphyBtnClick(cb) {
    $(document).on('click', '.js-giphy-btn', function (_ref) {
        var el = _ref.currentTarget;
        return cb({
            form: el.closest('form'),
            button: el,
            input: el.closest('form').querySelector('textarea')
        });
    });
}

function getAuthenticityToken() {
    return $('input[name="authenticity_token"]').val();
}

function getPreviewUri() {
    return $('.js-previewable-comment-form').attr('data-preview-url');
}

function insertTextAtCursor(textarea, text) {
    var pos = textarea.selectionStart;
    var currentVal = textarea.value;
    var before = currentVal.substring(0, pos);
    var after = currentVal.substring(pos);
    textarea.value = '' + before + text + after;
    $(textarea).change(); // compatibility with OctoPreview
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.toMarkdownImage = toMarkdownImage;
function toMarkdownImage(_ref) {
    var uri = _ref.uri;
    var name = _ref.name;

    return "![" + name + "](" + uri + ")";
}

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// brfs doesn't work with ES6 import syntax
// https://github.com/substack/brfs/issues/39

var widgetTemplate = "<article class=\"giphy-widget giphy-hidden\">\n    <input type=\"text\" placeholder=\"Search Term\" class=\"input-contrast\">\n    <div class=\"giphy-content\">\n        <img class=\"js-giphy-loading giphy-loading giphy-hidden\"\n            src=\"https://assets-cdn.github.com/images/spinners/octocat-spinner-128.gif\"\n        >\n        <div class=\"js-giphy-message giphy-message\">\n            Hint: Everyone loves cat GIFs\n        </div>\n        <ul class=\"js-gif-list\">\n            <!-- Gifs dynamically injected here -->\n        </ul>\n    </div>\n</article>\n";
var hiddenClass = 'giphy-hidden';
var noResultsMsg = 'No GIFs Found :(';

exports.default = {
    create: function create() {
        var _Object$create;

        return (_Object$create = Object.create(this)).init.apply(_Object$create, arguments);
    },
    init: function init(_ref) {
        var onSelection = _ref.onSelection;
        var onDispose = _ref.onDispose;
        var onTextChange = _ref.onTextChange;

        var $widget = this.$widget = $(widgetTemplate);
        this.$input = $widget.find('input');
        this.$imgList = $widget.find('.js-gif-list');
        this.$message = $widget.find('.js-giphy-message');
        this.onSelection = onSelection;
        this.onTextChange = onTextChange;
        this.onDispose = onDispose;
        return this.setupListeners();
    },
    appendToDOM: function appendToDOM() {
        var selector = arguments.length <= 0 || arguments[0] === undefined ? 'body' : arguments[0];

        $(selector).append(this.$widget);
        return this;
    },
    setupListeners: function setupListeners() {
        var _this = this;

        this.$input.on('keydown', function (e) {
            _this.onSearchStart();
            _this.onTextChange(e.currentTarget.value);
        });

        this.$widget.on('click', 'img', function (e) {
            return _this.imageSelected(e.currentTarget);
        });

        $(document).on('click.giphy', function (e) {
            if (_this.$widget.get(0).contains(e.target)) return;
            _this.dispose();
        });

        $(document).on('keyup.giphy', function (_ref2) {
            var keyCode = _ref2.keyCode;

            if (keyCode === 27) _this.dispose();
        });

        return this;
    },
    onSearchStart: function onSearchStart() {
        this.$imgList.empty();
        this.toggleLoading(true);
        this.toggleMessage(false);
    },
    imageSelected: function imageSelected(img) {
        this.onSelection({
            uri: img.getAttribute('data-full-uri'),
            name: img.title
        });
        this.dispose();
    },
    showAt: function showAt() {
        var top = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var left = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

        this.$widget.removeClass(hiddenClass).css({ top: top, left: left });
        this.$input.focus();
        return this;
    },
    dispose: function dispose() {
        $(document).off('click.giphy');
        $(document).off('keyup.giphy');
        this.$widget.remove();
        this.disposed = true;
        this.onDispose && this.onDispose();
    },
    toggleLoading: function toggleLoading(show) {
        var action = show ? 'removeClass' : 'addClass';
        this.$widget.find('.js-giphy-loading')[action](hiddenClass);
        return this;
    },
    toggleMessage: function toggleMessage(show, message) {
        this.$message.text(message)[show ? 'removeClass' : 'addClass'](hiddenClass);
        return this;
    },
    updateImageList: function updateImageList() {
        var images = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        var imageDOM = images.map(function (image) {
            return '<li>\n                <img src="' + image.downsizedUri + '" title="' + image.name + '" data-full-uri="' + image.uri + '>"\n            </li>';
        }).join('');

        this.$imgList.html(imageDOM);
        return this;
    }
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLmRlYm91bmNlL2luZGV4LmpzIiwic3JjL2pzL2V2ZW50cy5qcyIsInNyYy9qcy9zaXRlcy9HaXRIdWIvYXBpLmpzIiwic3JjL2pzL3NpdGVzL0dpdEh1Yi9pbmRleC5qcyIsInNyYy9qcy9zaXRlcy9HaXRIdWIvcGFnZS5qcyIsInNyYy9qcy91dGlscy5qcyIsInNyYy9qcy93aWRnZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QixVQUF0QztBQUNBLGFBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsbUJBQWxCLEVBQXVDLE1BQXZDLEVBQStDLFdBQS9DO0FBQ0EsZUFBTyxJQUFQO0FBQ0gsS0F6RVU7QUEyRVgsaUJBM0VXLHlCQTJFRyxJQTNFSCxFQTJFUyxPQTNFVCxFQTJFa0I7QUFDekIsYUFBSyxRQUFMLENBQWMsSUFBZCxDQUFtQixPQUFuQixFQUE0QixPQUFPLGFBQVAsR0FBdUIsVUFBbkQsRUFBK0QsV0FBL0Q7QUFDQSxlQUFPLElBQVA7QUFDSCxLQTlFVTtBQWdGWCxtQkFoRlcsNkJBZ0ZrQjtBQUFBLFlBQWIsTUFBYSx5REFBSixFQUFJOztBQUN6QixZQUFNLFdBQVcsT0FBTyxHQUFQLENBQVcsaUJBQVM7QUFDakMsd0RBQ2dCLE1BQU0sWUFEdEIsaUJBQzhDLE1BQU0sSUFEcEQseUJBQzRFLE1BQU0sR0FEbEY7QUFHSCxTQUpnQixFQUlkLElBSmMsQ0FJVCxFQUpTLENBQWpCOztBQU1BLGFBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsUUFBbkI7QUFDQSxlQUFPLElBQVA7QUFDSDtBQXpGVSxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogbG9kYXNoIDQuMC42IChDdXN0b20gQnVpbGQpIDxodHRwczovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBleHBvcnRzPVwibnBtXCIgLW8gLi9gXG4gKiBDb3B5cmlnaHQgalF1ZXJ5IEZvdW5kYXRpb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycyA8aHR0cHM6Ly9qcXVlcnkub3JnLz5cbiAqIFJlbGVhc2VkIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwczovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS44LjMgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqL1xuXG4vKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTkFOID0gMCAvIDA7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG4vKiogVXNlZCB0byBtYXRjaCBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlLiAqL1xudmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmFkIHNpZ25lZCBoZXhhZGVjaW1hbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCYWRIZXggPSAvXlstK10weFswLTlhLWZdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNCaW5hcnkgPSAvXjBiWzAxXSskL2k7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvY3RhbCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbi8qKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB3aXRob3V0IGEgZGVwZW5kZW5jeSBvbiBgcm9vdGAuICovXG52YXIgZnJlZVBhcnNlSW50ID0gcGFyc2VJbnQ7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlTWF4ID0gTWF0aC5tYXgsXG4gICAgbmF0aXZlTWluID0gTWF0aC5taW47XG5cbi8qKlxuICogR2V0cyB0aGUgdGltZXN0YW1wIG9mIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRoYXQgaGF2ZSBlbGFwc2VkIHNpbmNlXG4gKiB0aGUgVW5peCBlcG9jaCAoMSBKYW51YXJ5IDE5NzAgMDA6MDA6MDAgVVRDKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKiBAY2F0ZWdvcnkgRGF0ZVxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgdGltZXN0YW1wLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmRlZmVyKGZ1bmN0aW9uKHN0YW1wKSB7XG4gKiAgIGNvbnNvbGUubG9nKF8ubm93KCkgLSBzdGFtcCk7XG4gKiB9LCBfLm5vdygpKTtcbiAqIC8vID0+IExvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQuXG4gKi9cbnZhciBub3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRoYXQgZGVsYXlzIGludm9raW5nIGBmdW5jYCB1bnRpbCBhZnRlciBgd2FpdGBcbiAqIG1pbGxpc2Vjb25kcyBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgdGltZSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uIHdhc1xuICogaW52b2tlZC4gVGhlIGRlYm91bmNlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbFxuICogZGVsYXllZCBgZnVuY2AgaW52b2NhdGlvbnMgYW5kIGEgYGZsdXNoYCBtZXRob2QgdG8gaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uXG4gKiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uXG4gKiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudCBjYWxsc1xuICogdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgaW52b2NhdGlvbi5cbiAqXG4gKiAqKk5vdGU6KiogSWYgYGxlYWRpbmdgIGFuZCBgdHJhaWxpbmdgIG9wdGlvbnMgYXJlIGB0cnVlYCwgYGZ1bmNgIGlzIGludm9rZWRcbiAqIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIFNlZSBbRGF2aWQgQ29yYmFjaG8ncyBhcnRpY2xlXShodHRwczovL2Nzcy10cmlja3MuY29tL2RlYm91bmNpbmctdGhyb3R0bGluZy1leHBsYWluZWQtZXhhbXBsZXMvKVxuICogZm9yIGRldGFpbHMgb3ZlciB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBgXy5kZWJvdW5jZWAgYW5kIGBfLnRocm90dGxlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRlYm91bmNlLlxuICogQHBhcmFtIHtudW1iZXJ9IFt3YWl0PTBdIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLm1heFdhaXRdXG4gKiAgVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGludm9rZWQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGRlYm91bmNlZCBmdW5jdGlvbi5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gQXZvaWQgY29zdGx5IGNhbGN1bGF0aW9ucyB3aGlsZSB0aGUgd2luZG93IHNpemUgaXMgaW4gZmx1eC5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdyZXNpemUnLCBfLmRlYm91bmNlKGNhbGN1bGF0ZUxheW91dCwgMTUwKSk7XG4gKlxuICogLy8gSW52b2tlIGBzZW5kTWFpbGAgd2hlbiBjbGlja2VkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHMuXG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgXy5kZWJvdW5jZShzZW5kTWFpbCwgMzAwLCB7XG4gKiAgICdsZWFkaW5nJzogdHJ1ZSxcbiAqICAgJ3RyYWlsaW5nJzogZmFsc2VcbiAqIH0pKTtcbiAqXG4gKiAvLyBFbnN1cmUgYGJhdGNoTG9nYCBpcyBpbnZva2VkIG9uY2UgYWZ0ZXIgMSBzZWNvbmQgb2YgZGVib3VuY2VkIGNhbGxzLlxuICogdmFyIGRlYm91bmNlZCA9IF8uZGVib3VuY2UoYmF0Y2hMb2csIDI1MCwgeyAnbWF4V2FpdCc6IDEwMDAgfSk7XG4gKiB2YXIgc291cmNlID0gbmV3IEV2ZW50U291cmNlKCcvc3RyZWFtJyk7XG4gKiBqUXVlcnkoc291cmNlKS5vbignbWVzc2FnZScsIGRlYm91bmNlZCk7XG4gKlxuICogLy8gQ2FuY2VsIHRoZSB0cmFpbGluZyBkZWJvdW5jZWQgaW52b2NhdGlvbi5cbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGRlYm91bmNlZC5jYW5jZWwpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsYXN0QXJncyxcbiAgICAgIGxhc3RUaGlzLFxuICAgICAgbWF4V2FpdCxcbiAgICAgIHJlc3VsdCxcbiAgICAgIHRpbWVySWQsXG4gICAgICBsYXN0Q2FsbFRpbWUgPSAwLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAoIWxhc3RDYWxsVGltZSB8fCAodGltZVNpbmNlTGFzdENhbGwgPj0gd2FpdCkgfHxcbiAgICAgICh0aW1lU2luY2VMYXN0Q2FsbCA8IDApIHx8IChtYXhpbmcgJiYgdGltZVNpbmNlTGFzdEludm9rZSA+PSBtYXhXYWl0KSk7XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lckV4cGlyZWQoKSB7XG4gICAgdmFyIHRpbWUgPSBub3coKTtcbiAgICBpZiAoc2hvdWxkSW52b2tlKHRpbWUpKSB7XG4gICAgICByZXR1cm4gdHJhaWxpbmdFZGdlKHRpbWUpO1xuICAgIH1cbiAgICAvLyBSZXN0YXJ0IHRoZSB0aW1lci5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHJlbWFpbmluZ1dhaXQodGltZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhaWxpbmdFZGdlKHRpbWUpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0Q2FsbFRpbWUgPSBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgICAgICByZXR1cm4gaW52b2tlRnVuYyhsYXN0Q2FsbFRpbWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGltZXJJZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGRlYm91bmNlZC5jYW5jZWwgPSBjYW5jZWw7XG4gIGRlYm91bmNlZC5mbHVzaCA9IGZsdXNoO1xuICByZXR1cm4gZGVib3VuY2VkO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDggd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXkgYW5kIHdlYWsgbWFwIGNvbnN0cnVjdG9ycyxcbiAgLy8gYW5kIFBoYW50b21KUyAxLjkgd2hpY2ggcmV0dXJucyAnZnVuY3Rpb24nIGZvciBgTm9kZUxpc3RgIGluc3RhbmNlcy5cbiAgdmFyIHRhZyA9IGlzT2JqZWN0KHZhbHVlKSA/IG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpIDogJyc7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICEhdmFsdWUgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzU3ltYm9sKFN5bWJvbC5pdGVyYXRvcik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N5bWJvbCgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N5bWJvbCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzeW1ib2wnIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gc3ltYm9sVGFnKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgbnVtYmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvTnVtYmVyKDMpO1xuICogLy8gPT4gM1xuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMycpO1xuICogLy8gPT4gM1xuICovXG5mdW5jdGlvbiB0b051bWJlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gTkFOO1xuICB9XG4gIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICB2YXIgb3RoZXIgPSBpc0Z1bmN0aW9uKHZhbHVlLnZhbHVlT2YpID8gdmFsdWUudmFsdWVPZigpIDogdmFsdWU7XG4gICAgdmFsdWUgPSBpc09iamVjdChvdGhlcikgPyAob3RoZXIgKyAnJykgOiBvdGhlcjtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAwID8gdmFsdWUgOiArdmFsdWU7XG4gIH1cbiAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKHJlVHJpbSwgJycpO1xuICB2YXIgaXNCaW5hcnkgPSByZUlzQmluYXJ5LnRlc3QodmFsdWUpO1xuICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICA/IGZyZWVQYXJzZUludCh2YWx1ZS5zbGljZSgyKSwgaXNCaW5hcnkgPyAyIDogOClcbiAgICA6IChyZUlzQmFkSGV4LnRlc3QodmFsdWUpID8gTkFOIDogK3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJvdW5jZTtcbiIsImV4cG9ydCBmdW5jdGlvbiBzdGFydFNlYXJjaCh0ZXh0KSB7XG4gICAgd2luZG93LnBvc3RNZXNzYWdlKHtcbiAgICAgICAgZ2lwaHlTZWFyY2g6IHRydWUsXG4gICAgICAgIHF1ZXJ5OiB0ZXh0XG4gICAgfSwgJyonKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RlbkZvckdpcGh5UmVzcG9uc2UoY2IpIHtcbiAgICBjb25zdCBoYW5kbGVyID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgICAgIGlmICghKGRhdGEgJiYgZGF0YS5naXBoeVJlc3BvbnNlKSkgcmV0dXJuO1xuICAgICAgICBjYihkYXRhKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBoYW5kbGVyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcigpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBoYW5kbGVyKTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBnZXRBdXRoZW50aWNpdHlUb2tlbiwgZ2V0UHJldmlld1VyaSB9IGZyb20gJy4vcGFnZSc7XG5cbmZ1bmN0aW9uIGdldE1hcmtkb3duUHJldmlldyh0ZXh0KSB7XG4gICAgLy8gVXBncmFkZSBqUXVlcnkgZGVmZXJyZWQgdG8gYW4gRVM2IFByb21pc2VcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCQuYWpheCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6IGdldFByZXZpZXdVcmkoKSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljaXR5X3Rva2VuOiBnZXRBdXRoZW50aWNpdHlUb2tlbigpLFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICB9XG4gICAgfSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYnlwYXNzQ1NQRm9ySW1hZ2VzKGltYWdlcyA9IFtdKSB7XG4gICAgY29uc3QgbWFya2Rvd24gPSBpbWFnZXMubWFwKGltYWdlID0+IChcbiAgICAgICAgYCFbJHtpbWFnZS5uYW1lfV0oJHtpbWFnZS51cml9KSAhW2Rvd25zaXplZF0oJHtpbWFnZS5kb3duc2l6ZWRVcml9KWBcbiAgICApKS5qb2luKCdcXG5cXG4nKTtcblxuICAgIHJldHVybiBnZXRNYXJrZG93blByZXZpZXcobWFya2Rvd24pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgY29uc3QgJHJlcyA9ICQocmVzKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oJHJlcy5maWx0ZXIoJ3AnKSkubWFwKHAgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW1ncyA9ICQocCkuZmluZCgnaW1nJyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVyaTogaW1ncy5nZXQoMCkuc3JjLFxuICAgICAgICAgICAgICAgIG5hbWU6IGltZ3MuZ2V0KDApLmFsdCxcbiAgICAgICAgICAgICAgICBkb3duc2l6ZWRVcmk6IGltZ3MuZ2V0KDEpLnNyY1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iLCJpbXBvcnQge1xuICAgIGFkZEJ0blRvVG9vbGJhcnMsXG4gICAgb25QYXJ0aWFsUmVuZGVyLFxuICAgIGFkZEJ0blRvTmV3SW5saW5lQ29tbWVudHMsXG4gICAgb25HaXBoeUJ0bkNsaWNrLFxuICAgIGluc2VydFRleHRBdEN1cnNvclxufSBmcm9tICcuL3BhZ2UnO1xuaW1wb3J0IHdpZGdldCBmcm9tICcuLi8uLi93aWRnZXQnO1xuaW1wb3J0IHsgc3RhcnRTZWFyY2gsIGxpc3RlbkZvckdpcGh5UmVzcG9uc2UgfSBmcm9tICcuLi8uLi9ldmVudHMnO1xuaW1wb3J0IHsgdG9NYXJrZG93bkltYWdlIH0gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHsgYnlwYXNzQ1NQRm9ySW1hZ2VzIH0gZnJvbSAnLi9hcGknO1xuaW1wb3J0IGRlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSc7XG5cbi8vIEhBQ0s6IEdpdEh1YiByZW1vdmVkIHRoZWlyIGpRdWVyeSBnbG9iYWwuXG4vLyBTaG9ydCB0ZXJtIGZpeDogcmVzdG9yZSB0aGUgZ2xvYmFsXG4vLyBCZXR0ZXIgZml4ICh3aGVuIHRpbWUgcGVybWl0cykganVzdCB1c2UgZGlyZWN0IERPTSBBUElzXG53aW5kb3cuJCA9IHdpbmRvdy5yZXF1aXJlKCdqcXVlcnknKTtcblxuYWRkQnRuVG9Ub29sYmFycygpO1xub25QYXJ0aWFsUmVuZGVyKGFkZEJ0blRvVG9vbGJhcnMpO1xuYWRkQnRuVG9OZXdJbmxpbmVDb21tZW50cygpO1xuXG5vbkdpcGh5QnRuQ2xpY2soKHsgZm9ybSwgYnV0dG9uLCBpbnB1dCB9KSA9PiB7XG4gICAgY29uc3Qgb25TZWxlY3Rpb24gPSBmdW5jdGlvbiBvblNlbGVjdGlvbihkYXRhKSB7XG4gICAgICAgIGNvbnN0IHRleHRhcmVhID0gJChmb3JtKS5maW5kKCd0ZXh0YXJlYScpLmdldCgwKTtcbiAgICAgICAgaW5zZXJ0VGV4dEF0Q3Vyc29yKHRleHRhcmVhLCB0b01hcmtkb3duSW1hZ2UoZGF0YSkpO1xuICAgIH07XG5cbiAgICBjb25zdCBvbkltYWdlRGF0YSA9IGZ1bmN0aW9uIG9uSW1hZ2VEYXRhKHsgcmVzOiBpbWFnZXMgfSkge1xuICAgICAgICBpZiAoIWdpcGh5V2lkZ2V0KSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBnaXBoeVdpZGdldFxuICAgICAgICAgICAgICAgIC50b2dnbGVMb2FkaW5nKGZhbHNlKVxuICAgICAgICAgICAgICAgIC50b2dnbGVNZXNzYWdlKHRydWUsICdObyBSZXN1bHRzIEZvdW5kIDooJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBieXBhc3NDU1BGb3JJbWFnZXMoaW1hZ2VzKVxuICAgICAgICAgICAgLnRoZW4oaW1nTGlzdCA9PiB7XG4gICAgICAgICAgICAgICAgZ2lwaHlXaWRnZXQudG9nZ2xlTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICAgICAgZ2lwaHlXaWRnZXQudXBkYXRlSW1hZ2VMaXN0KGltZ0xpc3QpO1xuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgZ2lwaHlXaWRnZXQudG9nZ2xlTG9hZGluZyhmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25EaXNwb3NlID0gZnVuY3Rpb24gb25EaXNwb3NlKCkge1xuICAgICAgICBnaXBoeVdpZGdldCA9IG51bGw7XG4gICAgICAgIHVuYmluZExpc3RlbmVyKCk7XG4gICAgfTtcblxuICAgIGxldCB1bmJpbmRMaXN0ZW5lciA9IGxpc3RlbkZvckdpcGh5UmVzcG9uc2Uob25JbWFnZURhdGEpO1xuXG4gICAgY29uc3QgeyB0b3AsIGxlZnQgfSA9ICQoYnV0dG9uKS5vZmZzZXQoKTtcbiAgICBsZXQgZ2lwaHlXaWRnZXQgPSB3aWRnZXQuY3JlYXRlKHtcbiAgICAgICAgb25TZWxlY3Rpb24sXG4gICAgICAgIG9uRGlzcG9zZSxcbiAgICAgICAgb25UZXh0Q2hhbmdlOiBkZWJvdW5jZShzdGFydFNlYXJjaCwgMTAwMClcbiAgICB9KS5hcHBlbmRUb0RPTSgpLnNob3dBdCh0b3AgKyAyOCwgbGVmdCAtIDEyNCk7XG59KTtcbiIsIi8vIGJyZnMgZG9lc24ndCB3b3JrIHdpdGggRVM2IGltcG9ydCBzeW50YXhcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdWJzdGFjay9icmZzL2lzc3Vlcy8zOVxuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgYnRuVGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMoJ3NyYy9idG4tdGVtcGxhdGUuaHRtbCcsICd1dGY4Jyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRCdG5Ub1Rvb2xiYXJzKCkge1xuICAgICQoJy50b29sYmFyLWdyb3VwOmxhc3QtY2hpbGQnKS5hcHBlbmQoYnRuVGVtcGxhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb25QYXJ0aWFsUmVuZGVyKGNiKSB7XG4gICAgJChkb2N1bWVudCkub24oJ3BqYXg6c3VjY2VzcycsIGNiKTtcbn1cblxuLy8gYWRkcyBnaXBoeSBidXR0b24gd2hlbiBlZGl0aW5nIG5ldyBpbmxpbmUgY29tbWVudHNcbmV4cG9ydCBmdW5jdGlvbiBhZGRCdG5Ub05ld0lubGluZUNvbW1lbnRzKCkge1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtaW5saW5lLWNvbW1lbnRzLWNvbnRhaW5lciAuY29tbWVudC5wcmV2aWV3YWJsZS1lZGl0IC5qcy1jb21tZW50LWVkaXQtYnV0dG9uJywgZSA9PiB7XG4gICAgICAgIGNvbnN0IGFkZGVkQ29tbWVudCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJy5jb21tZW50LnByZXZpZXdhYmxlLWVkaXQnKS5maW5kKCcudG9vbGJhci1ncm91cDpsYXN0LWNoaWxkJyk7XG4gICAgICAgIGlmIChhZGRlZENvbW1lbnQuZmluZCgnLmpzLWdpcGh5LWJ0bicpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhZGRlZENvbW1lbnQuYXBwZW5kKGJ0blRlbXBsYXRlKTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9uR2lwaHlCdG5DbGljayhjYikge1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanMtZ2lwaHktYnRuJywgKHsgY3VycmVudFRhcmdldDogZWwgfSkgPT4gKFxuICAgICAgICBjYih7XG4gICAgICAgICAgICBmb3JtOiBlbC5jbG9zZXN0KCdmb3JtJyksXG4gICAgICAgICAgICBidXR0b246IGVsLFxuICAgICAgICAgICAgaW5wdXQ6IGVsLmNsb3Nlc3QoJ2Zvcm0nKS5xdWVyeVNlbGVjdG9yKCd0ZXh0YXJlYScpXG4gICAgICAgIH0pXG4gICAgKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBdXRoZW50aWNpdHlUb2tlbigpIHtcbiAgICByZXR1cm4gJCgnaW5wdXRbbmFtZT1cImF1dGhlbnRpY2l0eV90b2tlblwiXScpLnZhbCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UHJldmlld1VyaSgpIHtcbiAgICByZXR1cm4gJCgnLmpzLXByZXZpZXdhYmxlLWNvbW1lbnQtZm9ybScpXG4gICAgICAgIC5hdHRyKCdkYXRhLXByZXZpZXctdXJsJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRUZXh0QXRDdXJzb3IodGV4dGFyZWEsIHRleHQpIHtcbiAgICBjb25zdCBwb3MgPSB0ZXh0YXJlYS5zZWxlY3Rpb25TdGFydDtcbiAgICBjb25zdCBjdXJyZW50VmFsID0gdGV4dGFyZWEudmFsdWU7XG4gICAgY29uc3QgYmVmb3JlID0gY3VycmVudFZhbC5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICBjb25zdCBhZnRlciA9IGN1cnJlbnRWYWwuc3Vic3RyaW5nKHBvcyk7XG4gICAgdGV4dGFyZWEudmFsdWUgPSBgJHtiZWZvcmV9JHt0ZXh0fSR7YWZ0ZXJ9YDtcbiAgICAkKHRleHRhcmVhKS5jaGFuZ2UoKTsgLy8gY29tcGF0aWJpbGl0eSB3aXRoIE9jdG9QcmV2aWV3XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gdG9NYXJrZG93bkltYWdlKHsgdXJpLCBuYW1lIH0pIHtcbiAgICByZXR1cm4gYCFbJHtuYW1lfV0oJHt1cml9KWA7XG59XG4iLCIvLyBicmZzIGRvZXNuJ3Qgd29yayB3aXRoIEVTNiBpbXBvcnQgc3ludGF4XG4vLyBodHRwczovL2dpdGh1Yi5jb20vc3Vic3RhY2svYnJmcy9pc3N1ZXMvMzlcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHdpZGdldFRlbXBsYXRlID0gZnMucmVhZEZpbGVTeW5jKCdzcmMvZ2lwaHktd2lkZ2V0Lmh0bWwnLCAndXRmOCcpO1xuY29uc3QgaGlkZGVuQ2xhc3MgPSAnZ2lwaHktaGlkZGVuJztcbmNvbnN0IG5vUmVzdWx0c01zZyA9ICdObyBHSUZzIEZvdW5kIDooJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuY3JlYXRlKHRoaXMpLmluaXQoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIGluaXQoeyBvblNlbGVjdGlvbiwgb25EaXNwb3NlLCBvblRleHRDaGFuZ2UgfSkge1xuICAgICAgICBjb25zdCAkd2lkZ2V0ID0gdGhpcy4kd2lkZ2V0ID0gJCh3aWRnZXRUZW1wbGF0ZSk7XG4gICAgICAgIHRoaXMuJGlucHV0ID0gJHdpZGdldC5maW5kKCdpbnB1dCcpO1xuICAgICAgICB0aGlzLiRpbWdMaXN0ID0gJHdpZGdldC5maW5kKCcuanMtZ2lmLWxpc3QnKTtcbiAgICAgICAgdGhpcy4kbWVzc2FnZSA9ICR3aWRnZXQuZmluZCgnLmpzLWdpcGh5LW1lc3NhZ2UnKTtcbiAgICAgICAgdGhpcy5vblNlbGVjdGlvbiA9IG9uU2VsZWN0aW9uO1xuICAgICAgICB0aGlzLm9uVGV4dENoYW5nZSA9IG9uVGV4dENoYW5nZTtcbiAgICAgICAgdGhpcy5vbkRpc3Bvc2UgPSBvbkRpc3Bvc2U7XG4gICAgICAgIHJldHVybiB0aGlzLnNldHVwTGlzdGVuZXJzKCk7XG4gICAgfSxcblxuICAgIGFwcGVuZFRvRE9NKHNlbGVjdG9yID0gJ2JvZHknKSB7XG4gICAgICAgICQoc2VsZWN0b3IpLmFwcGVuZCh0aGlzLiR3aWRnZXQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgc2V0dXBMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMuJGlucHV0Lm9uKCdrZXlkb3duJywgZSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uU2VhcmNoU3RhcnQoKTtcbiAgICAgICAgICAgIHRoaXMub25UZXh0Q2hhbmdlKGUuY3VycmVudFRhcmdldC52YWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuJHdpZGdldC5vbignY2xpY2snLCAnaW1nJywgZSA9PiB0aGlzLmltYWdlU2VsZWN0ZWQoZS5jdXJyZW50VGFyZ2V0KSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmdpcGh5JywgZSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy4kd2lkZ2V0LmdldCgwKS5jb250YWlucyhlLnRhcmdldCkpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbigna2V5dXAuZ2lwaHknLCAoeyBrZXlDb2RlIH0pID0+IHtcbiAgICAgICAgICAgIGlmIChrZXlDb2RlID09PSAyNykgdGhpcy5kaXNwb3NlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBvblNlYXJjaFN0YXJ0KCkge1xuICAgICAgICB0aGlzLiRpbWdMaXN0LmVtcHR5KCk7XG4gICAgICAgIHRoaXMudG9nZ2xlTG9hZGluZyh0cnVlKTtcbiAgICAgICAgdGhpcy50b2dnbGVNZXNzYWdlKGZhbHNlKTtcbiAgICB9LFxuXG4gICAgaW1hZ2VTZWxlY3RlZChpbWcpIHtcbiAgICAgICAgdGhpcy5vblNlbGVjdGlvbih7XG4gICAgICAgICAgICB1cmk6IGltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtZnVsbC11cmknKSxcbiAgICAgICAgICAgIG5hbWU6IGltZy50aXRsZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgfSxcblxuICAgIHNob3dBdCh0b3AgPSAwLCBsZWZ0ID0gMCkge1xuICAgICAgICB0aGlzLiR3aWRnZXQucmVtb3ZlQ2xhc3MoaGlkZGVuQ2xhc3MpLmNzcyh7IHRvcCwgbGVmdCB9KTtcbiAgICAgICAgdGhpcy4kaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suZ2lwaHknKTtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCdrZXl1cC5naXBoeScpO1xuICAgICAgICB0aGlzLiR3aWRnZXQucmVtb3ZlKCk7XG4gICAgICAgIHRoaXMuZGlzcG9zZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm9uRGlzcG9zZSAmJiB0aGlzLm9uRGlzcG9zZSgpO1xuICAgIH0sXG5cbiAgICB0b2dnbGVMb2FkaW5nKHNob3cpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gc2hvdyA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnO1xuICAgICAgICB0aGlzLiR3aWRnZXQuZmluZCgnLmpzLWdpcGh5LWxvYWRpbmcnKVthY3Rpb25dKGhpZGRlbkNsYXNzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHRvZ2dsZU1lc3NhZ2Uoc2hvdywgbWVzc2FnZSkge1xuICAgICAgICB0aGlzLiRtZXNzYWdlLnRleHQobWVzc2FnZSlbc2hvdyA/ICdyZW1vdmVDbGFzcycgOiAnYWRkQ2xhc3MnXShoaWRkZW5DbGFzcyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICB1cGRhdGVJbWFnZUxpc3QoaW1hZ2VzID0gW10pIHtcbiAgICAgICAgY29uc3QgaW1hZ2VET00gPSBpbWFnZXMubWFwKGltYWdlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBgPGxpPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiJHtpbWFnZS5kb3duc2l6ZWRVcml9XCIgdGl0bGU9XCIke2ltYWdlLm5hbWV9XCIgZGF0YS1mdWxsLXVyaT1cIiR7aW1hZ2UudXJpfT5cIlxuICAgICAgICAgICAgPC9saT5gO1xuICAgICAgICB9KS5qb2luKCcnKTtcblxuICAgICAgICB0aGlzLiRpbWdMaXN0Lmh0bWwoaW1hZ2VET00pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59O1xuIl19
