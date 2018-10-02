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
        return (navigator.userAgent.match(/Chrome\/([\d.]+)/) || navigator.userAgent.match(/CriOS\/([\d.]+)/)) ? true : false;
    },
    isBaidu: function(){
        return navigator.userAgent.match(/baidubrowser/i) ? true : false;
    },
    isUC: function(){
        return navigator.userAgent.match(/UCBrowser/i) ? true : false;
    },
    isSafari: function(){
        return navigator.userAgent.match(/safari/i) ? true : false;
    }
};

module.exports = browser;
