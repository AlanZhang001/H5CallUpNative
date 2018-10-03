# 关于通过H5页面唤Native户端的介绍

本文档用于介绍通过H5端唤起本地富途牛牛客户端的研究过程！起初是一些研究性质的文章，随着越来越多的人关注和提issue，所以这里做了一些更新。

**快速使用见 5、相关代码**

## change log

#### 2018/10/03
- 发布tool-callapp@1.0.1，修复readme

#### 2018/10/02
- 更新readme,规范化代码，可直接使用，已发布至npm，见[tool-callapp@1.0.0](https://www.npmjs.com/package/tool-callapp)
- 更新微信和qq内的处理方式
- 旧版的文章及代码写于2016年，见[support/v2016](https://github.com/AlanZhang001/H5CallUpNative/tree/support/v2016)

## 1、背景

- 目前通过H5页面唤起native APP的场景十分常见，比如常见的分享功能；一方面，对于用户而言，相同的内容在native APP上比H5体验更好，操作更加方便，另一方面，对于APP运营来说，可以增加app的用户粘性度。

- 当前native客户端内置webview中，比较常用的是通过schema打开登陆页、配置分享入口的显示；而在外部浏览器或者webview中唤醒公司的客户端目前还没有太多尝试，有据此展开研究的必要性，以便日后在真实的需求中使用！

## 2、唤醒native APP 的几种方式

在Android端，常用的方式是Schame + Android Itent，在IOS端，常用的方式是Schema ＋　Universal links（IOS9+）；使用的前提都是客户端程序实现了Schema协议。

下面对这３种方式做简要的介绍：

#### 2.1 Schema

在Android和IOS浏览器中（非微信浏览器），可以通过schema协议的方式唤醒本地app客户端；schema协议在App开发注册之后，与前端进行统一约定，通过H5页面访问某个具体的协议地址，即可打开对应的App客户端 页面；

访问协议地址，目前有3种方式，以打开[富途牛牛](https://play.google.com/store/apps/details?id=cn.futu.trader)客户端登录页为例：

1.**通过a标签打开**，点击标签时启动APP
```html
<a href="ftnn:login">打开登录页</a>
```
2.**通过iframe打开**，设置iframe.src即会启动
```html
<iframe src="ftnn:login"></iframe>
```
3.**直接通过window.location 进行跳转**
```js
window.location.href= "ftnn:login";
```

Android上实现注册schema协议，可以参考博文：[Android手机上实现WebApp直接调起NativeApp](https://www.baidufe.com/item/3444ee051f8edb361d12.html)

>注：由于微信的白名单限制，无法通过schema来唤起本地app，只有白名单内的app才能通过微信浏览器唤醒，这个问题我目前没有找到合适的解决办法！

#### 2.2 Android Intent

在Android Chrome浏览器中，版本号在chrome 25+的版本不再支持通过传统schema的方法唤醒APP，比如通过设置window.location = "xxxx://login"将无法唤醒本地客户端。需要通过Android Intent 来唤醒APP；
使用方式如下：

1.构件intent字符串：

```html
intent:
login                                                // 特定的schema uri，例如login表示打开NN登陆页
#Intent;
    package=cn.xxxx.xxxxxx;                          // 富途牛牛apk信息
    action=android.intent.action.VIEW;               // 富途牛牛apk信息
    category=android.intent.category.DEFAULT;        // 富途牛牛apk信息
    component=[string];                              // 富途牛牛apk信息,可选
    scheme=xxxx;                                     // 协议类型
    S.browser_fallback_url=[url]                     //可选，schema启动客户端失败时的跳转页，一般为下载页，需通过encodeURIComponent编码
end;
```

2.构造一个a标签，将上面schame 字符串作为其href值，当点击a标签时，即为通过schema打开某客户端登陆页，如果未安装客户端，则会跳转到指定页，这里会跳转到下载页；

```html
<a href="intent://loin#Intent;scheme=ftnn;package=cn.futu.trader;category=android.intent.category.DEFAULT;action=android.intent.action.VIEW;S.browser_fallback_url=http%3A%2F%2Fa.app.qq.com%2Fo%2Fsimple.jsp%3Fpkgname%3Dcn.futu.trader%26g_f%3D991653;end">打开登录页</a>
```

#### 2.3 Universal links
Universal links为 iOS 9 上一个所谓 通用链接 的深层链接特性，一种能够方便的通过传统 HTTP 链接来启动 APP, 使用相同的网址打开网站和 APP；通过唯一的网址, 就可以链接一个特定的视图到你的 APP 里面, 不需要特别的 schema；

在IOS中，对比schema的方式，Universal links有以下优点：

1. 通过schema启动app时，浏览器会有弹出确认框提示用户是否打开，而Universal links不会提示，体验更好；
2. Universal link可在再微信浏览器中打开外部App；

> 网易新闻客户端IOS 9上目前采用这种Universal links方式

针对这部分内容可以参考博文：

- [打通 iOS 9 的通用链接（Universal Links）](http://www.cocoachina.com/ios/20150902/13321.html)
- [浏览器中唤起native app || 跳转到应用商城下载（二） 之universal links](http://gold.xitu.io/entry/57bd1e6179bc440063b3a029/view)

>由于公司IOS客户端目前未实现这种协议，所以无法对这种唤醒方式做测试，日后明确支持此类协议，待测试功能后，再补充这部分详细内容！

#### 2.4 微信JS SDK

微信是一个特殊的存在；对于schema，微信会做出来拦截，导致通过 schema协议无法唤起APP;想要在微信中唤起APP，需要通过微信js sdk提供的接口进行唤起APP,目前微信并未在其开放平台上说明其接口，只有部分在微信白名单（其实就是和腾讯有合作关系的公司）中的应用程序可使用对应的接口进行唤起APP。

目前富途牛牛已经接入该功能，接入方会收到对应的接口文档，按照文档进行接入接口，不确定是否涉及到需要保密的内容，故不作公开此处做法。如需接入，先联系微信相关部门。

微信中，比较常用的做法是：

1. 直接提示去下载页面
2. 提示在外部浏览器中打开，在外部浏览器中通过schame等方式打开APP

#### 2.5 QQ JS SDK

和微信同属腾讯，qq确对外开放了唤起APP的相关接口权限。

- 检测外部app是否安装,见[isAppInstalled](http://open.mobile.qq.com/api/common/index#api:isAppInstalled)

![](https://cloudmain.futunn.com/test/business-qq/isinstalled.png?_=1538550953571)

- 启动外部app,见[launch](http://open.mobile.qq.com/api/common/index#api:launchApp)

![](https://cloudmain.futunn.com/test/business-qq/open.png?_=1538550953571)

本来，心里想的很美的，使用QQ提供的api来打开APP,效果应该更好；想法是这样的：

1. 使用isAppInstalled判断APP是否安装，如果已安装，则调用launchApp打开APP
2. 如果没有判断没有安装外部APP，则可调整至下载页

于是，写了个demo来测试，但是。。。。调用isAppInstalled，api给出的提示是“permission denied”，直接调用launchApp方法也不可行，网上找了很久也有相关说明，QQ的api平台也没有反馈入口，。。。只好放弃这种方式；**猜想只有 腾讯认可的域名中才能调用相关API。**

**QQ webview本身也能通过schema的方式唤起APP,所以还是老实使用这种方式。**

## 3、实现过程

首先，通过**浏览器是无法判断是否安装了客户端程序的**，因此整体的思路就是：**尝试去通过上面的唤起方式来唤起本地客户端，如果唤起超时，则直接跳转到下载页**；整个实现过程围绕这一点展开。

>2018年补充：QQ的jssdk目前已经支持判断外部APP是否安装

在不考虑IOS9 Universal links唤醒方式的条件下，可以分为这几个步骤；

#### 3.1 生成schema字符串

首先判断浏览器UA，如果为Chrome for Android，则必须安装 Android Intent的方式来组织schema字符串；如果为其他浏览器，则按照普通的schema方式来返回即可；

```js
// 如果是安卓chrome浏览器，则通过intent方式打开
// UC浏览器被识别为chrome，排除之
if (browser.isChrome() && browser.isAndroid() && browser.isUC() === false) {
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
```

> 注意参数中包含的url地址需要进行encodeURIComponent编码

#### 3.2 通过iframe或者a标签来加载schema

由于无法确定是否安装了客户端，因此通过window.location =  schema的方式可能导致浏览器跳转到错误页；所以通过iframe.src或a.href载入schema是目前比较常见的方法；

相比于iframe和a，通过设置其diaplay为none来进行隐藏，这样即便链接错误也不会对当前页构成影响，但是对于a标签，在未安装客户端的情况下，仍然会存在提示访问不存在的情况（比如opera），所以在选取上的优先级是：iframe>a>window.location,只有在iframe.href 无法调用schema的情况下，才采用a.href的方式。

经过非全面测试：

- Android系统上，Chrome for Android无法通过iframe.src 来调用schema，而通过a.href 的方式可以成功调用，而针对chrome内核的浏览器如猎豹，360，小米浏览器，
opera对于iframe.src和a.href的方式都能支持，所以对chrome及先关的内核的浏览器采用a.href的方式来调用scheme；对于其他浏览器，如firefox,mobile QQ，sogou浏览器则采用iframe.src的方式调用schema。对于微信浏览器，则直接跳转到下载页。其他未经测试的浏览器，默认采用iframe.src来调用schema；
- IOS 9+系统上，Safari浏览器无法通过iframe.src的方式调用schema，对于UC，Chrome，百度浏览器，mobileQQ只能通过a.href的方式进行调用schema；对于微信浏览器，默认跳转到下载页；

代码如下：

```js
// 需要开启的schema
var schemaUrl = this.generateSchema(config.targetURI);
var body = document.body;

// Android 微信不支持schema唤醒，必须提前加入腾讯的白名单
// 百度浏览器会拦截schema，所以直接跳下载页
if (browser.isWx() || browser.isBaidu()) {
    if (browser.isAndroid()) {
        window.location.href = this.appConfig.FAILBACK.ANDROID;
    } else if(browser.isIOS()){
        window.location.href = this.appConfig.FAILBACK.IOS;
    }
// mobile QQ
} else if(browser.isMobileQQ()){
    if (browser.isAndroid()) {
        window.location.href = this.appConfig.FAILBACK.ANDROID;
    } else if(browser.isIOS()){
        window.location.href = this.appConfig.FAILBACK.IOS;
    }
// Android chrome 不支持iframe 方式唤醒
// 适用：chrome,leibao,mibrowser,opera,360，qq浏览器
} else if (browser.isChrome() && browser.isAndroid() || browser.isUC() || browser.isSafari()) {
    var aLink = util.createALink(schemaUrl);
    body.appendChild(aLink);
    aLink.click();
// 其他浏览器
// 适用：UC,sogou,firefox
} else {
    var iframe = util.createIfr(schemaUrl);
    body.appendChild(iframe);
}
```

#### 3.3 处理客户端未安装的情况

前面提到无法确定客户端程序是否安装，所以在通过iframe和a调用schema时，会设置一个settimeout，超时，则跳转到下载页；

>此处的超时时间设置也十分关键，如果超时时间小于app启动时间，则未待app启动，就是执行setimeout的方法，如果超时时间较长，则当客户端程序未安装时，需要较长时间才能执行settimeout方法进入下载页。因此，此处的延时时间需要考虑APP的启动时间。

```
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
```

>代码中，进入到setimeout时，对跳转过程再次进行了限定；当浏览器因为启动app而切换到后台时，settimeout存在计时推迟或延迟的问题，此时，如果从app切换回浏览器端，则执行跳转代码时经历的时间应该大于setimeout所设置的时间；反之，如果本地客户端程序未安装，浏览器则不会进入后台程序，定时器则会准时执行，故应该跳转到下载页！

在实际测试过程，当通过schema成功唤起客户端，再次返回浏览器时，发现页面已跳转至下载页面，因此对已设置的settimeout需要做一个清除处理；

当本地app被唤起，app处于设备可视窗口最上层，则浏览器进入后台程序页面会隐藏掉，会触发pagehide与visibilitychange事件，此时应该清除setimeout事件,于此同时，document.hide属性为true，因此setimeout内也不做跳转动作，防止页面跳转至下载页面；

此时，有几个事件比较关键：

```html
pagehide: 页面隐藏时触发
visibilitychange： 页面隐藏没有在当前显示时触发，比如切换tab，也会触发该事件
document.hidden 当页面隐藏时，该值为true，显示时为false
```

为了尽可能的兼容多的浏览器，所以讲这几个事件都进行绑定！
代码如下。

```
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
```


---

## 4、测试结果

#### 4.1 Android平台（小米3/6 手机测试）

- 经测试，可唤起chrome，Firefox，uc，360，mibrowser，sogou，liebao，mobileQQ浏览器；
- 新版opera浏览器采用webkit内核，但是当客户端未安装时跳转下载页会会出错，提示页面不存在；
- 微信不支持登陆，直接做了跳转到下载页处理；
- Android上启动相对比较慢，导致很容易启动超时而跳转到下载页面；
- 测试页面在本机，百度浏览器会上报检测url合法性，导致唤醒不成功,故百度浏览器上直接跳转至下载页

![](http://i.imgur.com/917kCq1.png)

#### 4.2 IOS平台（ipx）

- os7上Safari可用，其他浏览器为测试，条件限制；
- Safari，UC浏览器，Chrome 浏览器能唤起nn客户端，但是Safari会有 是否打开的提示；
- QQ webviwe上能打开，偶尔会失败；2016年的时候测过还可以，现在不可以打开了；
- IOS上启动速度相对较快
- IOS上，在不能唤起APP的情况下，跳转至APP Store的下载链接可通过APP store间接唤起APP

## 5、相关代码
对代码进行简单的封装，代码如下，在使用时需要针对当前的app做必要设置，采用UMD的写法：

代码见[index.js](https://github.com/AlanZhang001/H5CallUpNative/blob/master/src/index.js)

安装方式：

```
npm install tool-callapp --save
```

调用方式：

```
var CallUp = require('tool-callapp');

// 直接引入
// <script type="text/javascript" src="/yourpath/tool-callapp/index.js"></script>

var callup = new Callup({
    // 协议头
    PROTOCAL:'ftnn',

    // 主页
    HOME: 'quote',

    // 唤起失败时的跳转链接
    FAILBACK: {
        ANDROID: 'http://a.app.qq.com/o/simple.jsp?pkgname=cn.futu.trader&g_f=991653',
        IOS:'http://a.app.qq.com/o/simple.jsp?pkgname=cn.futu.trader&g_f=991653'
    },

    // Android apk 相关信息
    APK_INFO: {
        PKG: 'cn.futu.trader',
        CATEGORY: 'android.intent.category.DEFAULT',
        ACTION: 'android.intent.action.VIEW'
    },

    // 唤起超时时间，超时则跳转到下载页面
    LOAD_WAITING: 3000
});

callup.loadSchema({
    // 通过NN打开某个链接
    targetURI: 'ftnn://quote'
});
```

代码测试结果:

|平台|Android|iOS|
|:--:|:--:|:--:|
|weixin|X|X|
|qq|✔️|X|
|chrome|✔️|✔️|
|mi browser|✔️|-|
|uc|✔️|✔️|
|qq browser|✔️|✔️|
|360 browser|✔️|✔️|
|猎豹|✔️|✔️|
|sogou|✔️|✔️|
|baidu browser|X|X|
|firefox|✔️|✔️|
|safari|-|✔️|
|微博国际|X|X|
|微博|X|X|
|支付宝|✔️|X|

>✔️表示能唤起APP，X表示不能，-表示品台上没有该浏览器

- android支护宝中唤起时，会先跳转至支付宝提供的中间页，提示会进行跳转。点击"点击跳转"之后能唤起APP

<img src="https://cloudmain.futunn.com/test/H5CallUpNative/images/WechatIMG7-c3f1e6630de9197f1e08a5f9f9204cc7.png?_=1538561195372" style="width: 40%;" />

## 6、研究意义
**便于通过相关H5页面进入Native客户端，提升用户体验，提升App用户粘度；** 对于未安装客户端的用户，可引导进入下载通道，如下场景图：

![](http://i.imgur.com/ymKiJJM.png)

## 7、存在的问题

1. 在没有安装客户端程序的时候，opera无法跳转到指定页的失败页；
2. 通过微信唤醒客户端目前不可行，Android上需要微信设置白名单；IOS上，需要微信设置白名单或者通过Universal links（IOS9+）协议；
3. 尚未对IOS9的 Universal links协议进行功能测试。
4. 代码中使用的各种时间如：settimeout定时时间均根据本机测试进行的调整，普遍性需要进一步验证

## 还没解决的问题

1. 在询问是否打开APP的时候，如果选择了“取消”，则再唤起APP的时候会不起作用。目前并没有什么解决方案，在chrome Android,UC Android上会复现问题。需再次刷新页面才行。

## 最后

1. 经过自行测试及网上查阅资料，目前尚未找到完美的解决方案；
2. 对于文中的不足和错误，欢迎指出。
3. 转载请说明出处，以方便追本溯源修正文中错误

## 相关阅读链接

- <https://developer.chrome.com/multidevice/android/intents>
- <https://segmentfault.com/a/1190000005848133?_ea=938555>
- <http://www.w3ctech.com/topic/287?utm_source=tuicool&utm_medium=referral>
- <http://echozq.github.io/echo-blog/2015/11/13/callapp.html>

