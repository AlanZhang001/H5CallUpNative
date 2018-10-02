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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

/**
* @author alanzhang
* @date 2016-07-15
* @overview 测试在浏览器中打开native App;
*
*/

var extend = __webpack_require__(/*! extend */ 1);
var browser = __webpack_require__(/*! ./browser.js */ 2);

/**
 * [defautlConfig APP默认配置]
 * @private
 * @type {Object}
 */
var defautlConfig = {

    // 协议头
    PROTOCAL:'',

    // 主页
    HOME: '',

    // 唤起失败时的跳转链接
    FAILBACK: {
        ANDROID: '',
        IOS:''
    },

    // Android apk 相关信息
    APK_INFO: {
        PKG: '',
        CATEGORY: 'android.intent.category.DEFAULT',
        ACTION: 'android.intent.action.VIEW'
    },

    // 唤起超时时间，超时则跳转到下载页面
    LOAD_WAITING: 3000
};


/**
 * [util 创建A标签]
 * @private
 * @type {Object}
 */
var util = {
    hiddenStyle:'display:none;width:0px;height:0px;',
    /**
     * [createIfr 创建iframe并隐藏，未加入document中]
     * @param  {String} src  [iframe的src]
     * @return {Element}     [iframe]
     */
    createIfr: function(src){
        var iframe = document.createElement('iframe');
        iframe.className = 'call_up_iframe';
        iframe.src = src;
        iframe.style.cssText = this.hiddenStyle;
        return iframe;
    },
    /**
     * [createALink 创建A标签并隐藏，未加入document中]
     * @param  {String} href [a的href]
     * @return {Element}     [a标签]
     */
    createALink: function(href){
        var aLink = document.createElement("a");
        aLink.className = 'call_up_a_link';
        aLink.href = href;
        aLink.style.cssText = this.hiddenStyle;
        return aLink;
    },
    /**
     * [isDocHidden docuement是否已隐藏]
     * @return {Boolean} [description]
     */
    isDocHidden: function(){
        return document.hidden || document.webkitHidden || document.msHidden;
    },
    /**
     * [visibilityChangeName 兼容visibilityChange]
     * @return {String} [description]
     */
    visibilityChangeName: function(){
        var visibilityChange;
        if (typeof document.hidden !== 'undefined') {
            visibilityChange = 'visibilitychange';
        } else if (typeof document.msHidden !== 'undefined') {
            visibilityChange = 'msvisibilitychange';
        } else if (typeof document.webkitHidden !== 'undefined') {
            visibilityChange = 'webkitvisibilitychange';
        }
        return visibilityChange;
    }
};

function Callup(config){
    if (!config) {
        return;
    }

    // 合并参数
    this.appConfig = extend({},defautlConfig,config,true);
}

extend(Callup.prototype,{
    /**
     * [generateSchema 根据不同的场景及UA生成最终应用的schema]
     * @param {schema} [schemaURI]    [需要使用的schema字符串，如果login，会和协议组装成app可识别的协议]
     * @return {Sring}                [description]
     */
    generateSchema: function(schemaURI) {

        var schemaStr = '';

        // 如果未定义schema，则根据当前路径来映射
        if (!schemaURI) {
            schemaStr = defautlConfig.HOME;
            // 在schema省略时，可以根据当前页面的url，设置不同的默认值
        } else {
            schemaStr = schemaURI;
        }

        // 如果是安卓chrome浏览器，则通过intent方式打开
        if (browser.isChrome() && browser.isAndroid()) {
            schemaStr = 'intent://' + schemaStr +'#Intent;'  +
                        'scheme='   + defautlConfig.PROTOCAL          + ';'+
                        'package='  + defautlConfig.APK_INFO.PKG      + ';'+
                        'category=' + defautlConfig.APK_INFO.CATEGORY + ';'+
                        'action='   + defautlConfig.APK_INFO.ACTION   + ';'+
                        'S.browser_fallback_url=' + encodeURIComponent(defautlConfig.FAILBACK.ANDROID) + ';' +
                        'end';
        } else {
            schemaStr = defautlConfig.PROTOCAL + '://' + schemaStr;
        }

        return schemaStr;
    },

    loadSchema: function(config){

        // 需要开启的schema
        var schemaUrl = this.generateSchema(defautlConfig.targetURI);
        var body = document.body;

        // Android 微信不支持schema唤醒，必须提前加入腾讯的白名单
        if (browser.isWx()) {
            if (browser.isAndroid()) {
                window.location.href = defautlConfig.FAILBACK.ANDROID;
            } else if(browser.isIOS()){
                window.location.href = defautlConfig.FAILBACK.IOS;
            }
        // mobile QQ
        } else if(browser.isMobileQQ()){
            if (browser.isAndroid()) {
                window.location.href = defautlConfig.FAILBACK.ANDROID;
            } else if(browser.isIOS()){
                window.location.href = defautlConfig.FAILBACK.IOS;
            }
        // Android chrome 不支持iframe 方式唤醒
        // 适用：chrome,leibao,mibrowser,opera,360
        } else if (browser.isChrome() && browser.isAndroid()) {
            var aLink = util.createALink(schemaUrl);
            body.appendChild(aLink);
            aLink.click();
        // 其他浏览器
        // 适用：UC,sogou,firefox
        } else {
            var iframe = util.createIfr(schemaUrl);
            body.appendChild(iframe);
        }

        this.checkLoadStatus(config.success,config.fail);

    },

    /**
     * [checkLoadStatus 通过setTimeout来检查App是否启动]
     * @private
     * @return {undefined}
     */
    checkLoadStatus: function(success,fail){
        var start = new Date().getTime();

        var loadTimer = setTimeout(function() {
            if (util.isDocHidden()) {
                return;
            }

            // 如果app启动，浏览器最小化进入后台，则计时器存在推迟或者变慢的问题
            // 那么代码执行到此处时，时间间隔必然大于设置的定时时间
            if (Date.now() - start > defautlConfig.LOAD_WAITING + 200) {
                //console.log('come back from app')
            // 如果浏览器未因为app启动进入后台，则定时器会准时执行，故应该跳转到下载页
            } else {
                if (fail) {
                    fail();
                } else {
                    window.location.href = browser.isIOS() ? defautlConfig.FAILBACK.IOS : defautlConfig.FAILBACK.ANDROID;
                }
            }

        }, defautlConfig.LOAD_WAITING);


        // 当本地app被唤起，则页面会隐藏掉，就会触发pagehide与visibilitychange事件
        // 在部分浏览器中可行，网上提供方案，作hack处理
        document.addEventListener(util.visibilityChangeName(), function() {
            if (util.isDocHidden) {
                clearTimeout(loadTimer);
            }
        }, false);

        // pagehide 必须绑定到window
        window.addEventListener('pagehide', function() {
            clearTimeout(loadTimer);
            success && success();
        }, false);
    }
});


module.exports = Callup;



/***/ }),
/* 1 */
/*!**************************************!*\
  !*** ./node_modules/extend/index.js ***!
  \**************************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


/***/ }),
/* 2 */
/*!************************!*\
  !*** ./src/browser.js ***!
  \************************/
/*! dynamic exports provided */
/*! all exports used */
/***/ (function(module, exports) {

/**
 * 浏览器判断工具
 */

// 可能有些APP ua 是后期会做更新的，因此这里不采用抽出navigator.userAgent的做法

var browser = {
    isAndroid: function() {
        return navigator.userAgent.match(/Android/i) ? true : false;
    },
    isMobileQQ: function() {
        var ua = navigator.userAgent;
        return /(iPad|iPhone|iPod).*? (IPad)?QQ\/([\d\.]+)/.test(ua) || /\bV1_AND_SQI?_([\d\.]+)(.*? QQ\/([\d\.]+))?/.test(ua);
    },
    isIOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
    },
    isWx: function() {
        return navigator.userAgent.match(/micromessenger/i) ? true : false;
    },
    isChrome: function(){

    }
};

module.exports = browser;


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map