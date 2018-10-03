/**
* @author alanzhang
* @date 2016-07-15
* @overview 测试在浏览器中打开native App;
*
*/

var extend = require('extend');
var browser = require('./browser.js');

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
     * @return {Sring}                [可用的schema]
     */
    generateSchema: function(schemaURI) {

        var schemaStr = '';

        // 如果未定义schema，则根据当前路径来映射
        if (!schemaURI) {
            schemaStr = this.appConfig.HOME;
            // 在schema省略时，可以根据当前页面的url，设置不同的默认值
        } else {
            schemaStr = schemaURI;
        }

        // 如果是安卓chrome浏览器，则通过intent方式打开
        // UC浏览器被识别为chrome，排除之
        if (browser.isChrome() && browser.isAndroid() && browser.isUC() === false && browser.isQQBrowser() === false) {
            schemaStr = 'intent://' + schemaStr +'#Intent;'  +
                        'scheme='   + this.appConfig.PROTOCAL          + ';'+
                        'package='  + this.appConfig.APK_INFO.PKG      + ';'+
                        'category=' + this.appConfig.APK_INFO.CATEGORY + ';'+
                        'action='   + this.appConfig.APK_INFO.ACTION   + ';'+
                        'S.browser_fallback_url=' + encodeURIComponent(this.appConfig.FAILBACK.ANDROID) + ';' +
                        'end';
        } else {
            schemaStr = this.appConfig.PROTOCAL + '://' + schemaStr;
        }

        return schemaStr;
    },

    /**
     * [loadSchema 加载schema，打开app]
     * @param  {Object} config [打开时的配置]
     * @return {undefined}
     */
    loadSchema: function(config){

        // 需要开启的schema
        var schemaUrl = this.generateSchema(config.targetURI);
        var body = document.body;

        // Android 微信不支持schema唤醒，必须提前加入腾讯的白名单
        // 百度浏览器会拦截schema，所以直接跳下载页
        // QQ,weobo 内也直接跳转下载页
        if (browser.isWx() || browser.isBaidu()
            || (browser.isIOS() && browser.isMobileQQ())
            || (browser.isIOS() && browser.isAlipay())
            || browser.isWeibo()) {
            if (browser.isAndroid()) {
                window.location.href = this.appConfig.FAILBACK.ANDROID;
            } else if(browser.isIOS()){
                window.location.href = this.appConfig.FAILBACK.IOS;
            }
        // Android chrome 不支持iframe 方式唤醒
        // 适用：chrome,leibao,mibrowser,opera,360，UC,qq浏览器
        } else if (browser.isChrome() && browser.isAndroid()
            || browser.isUC()
            || browser.isSafari()
            || browser.isQQBrowser()) {
            var aLink = util.createALink(schemaUrl);
            body.appendChild(aLink);
            aLink.click();
        // 其他浏览器
        // 适用：sogou,firefox,mobileQQ
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
        var that = this;
        var loadTimer = setTimeout(function() {
            if (util.isDocHidden()) {
                return;
            }

            // 如果app启动，浏览器最小化进入后台，则计时器存在推迟或者变慢的问题
            // 那么代码执行到此处时，时间间隔必然大于设置的定时时间
            if (Date.now() - start > that.appConfig.LOAD_WAITING + 200) {
                //console.log('come back from app')
            // 如果浏览器未因为app启动进入后台，则定时器会准时执行，故应该跳转到下载页
            } else {
                if (fail) {
                    fail();
                } else {
                    window.location.href = browser.isIOS() ? that.appConfig.FAILBACK.IOS : that.appConfig.FAILBACK.ANDROID;
                }
            }

        }, this.appConfig.LOAD_WAITING);


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

