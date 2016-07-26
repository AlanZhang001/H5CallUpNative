# 关于通过H5页面唤NN客户端的介绍

本文档用于介绍通过H5端唤起本地NN客户端的研究过程！

##背景
- 目前通过H5页面唤起native App的场景十分常见，比如常见的分享功能；一方面，对于用户而言，相同的内容在native app上比H5体验更好，操作更加方便，另一方面，对于app运营来说，可以增加app的用户粘性度。

- 当前NN客户端内置webview中，比较常用的是通过schema打开NN登陆页，触发分享入口的显示；而在外部浏览器或者webview中唤醒NN客户端目前还没有太多尝试，有据此展开研究的必要性，以便日后在真实的需求中使用！


## 唤醒native APP 的几种方式
在Android端，常用的方式是Schame + Android Itent，在IOS端，常用的方式是Schema ＋　Universal links（IOS9+）；
使用的前提都是客户端程序实现了schema协议。

下面对这３种方式做简要的介绍：
####Schema

在Android和IOS浏览器中（非微信浏览器），可以通过schema协议的方式唤醒本地app客户端；schema协议在App注册之后，与前端进行统一约定，通过H5页面访问某个具体的协议地址，即可打开对应的App客户端 页面；

访问协议地址，目前有3种方式，以打开NN客户端登录页为例：

1. **通过a标签打开**，点击标签是启动


		<a href="ftnn:login">打开登录页</a>
2. **通过iframe打开**，设置iframe.src即会启动

		<iframe src="ftnn:login"></iframe>
3. **直接通过window.location 进行跳转**

		window.location.href= "ftnn:login";

Android上注册schema协议，可以参考博文：[Android手机上实现WebApp直接调起NativeApp](https://www.baidufe.com/item/3444ee051f8edb361d12.html)

>注：由于微信的白名单限制，无法通过schema来唤起本地app，只有白名单内的app才能通过微信浏览器唤醒，这个问题我目前没有找到合适的解决办法！

####Android Intent
在Android Chrome浏览器中，版本号在chrome 25+的版本不在支持通过传统schema的方法唤醒App，比如通过设置window.location = "futunn://login"将无法唤醒NN客户端。需要通过Android Intent 来唤醒APP；
使用方式如下：

1. 构件intent字符串：


	intent:
	login											// 特定的schema uri，例如login表示打开NN登陆页
	#Intent; 
	  package=cn.futu.trader;     					// NN apk 信息
	  action=android.intent.action.VIEW; 			// NN apk 信息
	  category=android.intent.category.DEFAULT; 	// NN apk 信息
	  component=[string]; 							// NN apk 信息,可选
	  scheme=ftnn; 									// 在NN客户端内，schema为futunn，在外部与NN客户端通信时使用ftnn
	  S.browser_fallback_url=[url]					// 可选，schema启动客户端失败时的跳转页，一般为下载页，需编码
	end; 
2. 构造一个a标签，将上面schame 字符串作为其href值，当点击a标签时，即为通过schema打开NN 客户端登陆页，如果未安装客户端，则会跳转到指定页，这里会跳转到下载页；

		<a href="intent://loin#Intent;scheme=ftnn;package=cn.futu.trader;category=android.intent.category.DEFAULT;action=android.intent.action.VIEW;S.browser_fallback_url=http%3A%2F%2Fa.app.qq.com%2Fo%2Fsimple.jsp%3Fpkgname%3Dcn.futu.trader%26g_f%3D991653;end">打开登录页</a>
####Universal links
Universal links为 iOS 9 上一个所谓 通用链接 的深层链接特性，一种能够方便的通过传统 HTTP 链接来启动 APP, 使用相同的网址打开网站和 APP；通过唯一的网址, 就可以链接一个特定的视图到你的 APP 里面, 不需要特别的 schema；

在IOS中，对比schema的方式，Universal links有以下优点：

1. 通过schema启动app时，浏览器会有弹出确认框提示用户是否打开，而Universal links不会提示，体验更好；
	

2. Universal link可在再微信浏览器中打开外部App；

	> 网易新闻客户端IOS 9上目前采用这种Universal links方式

针对这部分内容可以参考博文： [打通 iOS 9 的通用链接（Universal Links）](http://www.cocoachina.com/ios/20150902/13321.html)
>据我了解，IOS NN客户端目前未实现这种协议，所以无法对这种唤醒方式做测试，日后明确支持此类协议，待测试功能后，再补充这部分详细内容！

## 实现过程

首先，通过**浏览器是无法判断是否安装了客户端程序的**，因此整体的思路就是：**尝试去通过上面的唤起方式来唤起本地客户端，如果唤起超时，则直接跳转到下载页**；整个实现过程围绕这一点展开。

在不考虑IOS9 Universal links唤醒方式的条件下，可以分为这几个步骤；

1. **生成schema字符串**
	
首先判断浏览器UA，如果为Chrome for Android，则必须安装 Android Intent的方式来组织schema字符串；如果为其他浏览器，则按照普通的schema方式来返回即可；
![](http://i.imgur.com/fVd8LQ5.png)

> 注意参数中包含的url地址需要进行encodeURIComponent编码	

2 .**通过iframe或者a标签来加载schema**

由于无法确定是否安装了客户端，因此通过window.location =  schema的方式可能导致浏览器跳转到错误页；所以通过iframe.src或a.href载入schema是目前比较常见的方法；

相比于iframe和a，通过设置其diaplay为none来进行隐藏，这样即便链接错误也不会对当前页构成影响，但是对于a标签，在未安装客户端的情况下，仍然会存在提示访问不存在的情况（比如opera），所以在选取上的优先级是：iframe>a>window.location,只有在iframe.href 无法调用schema的情况下，才采用a.href的方式。

经过非全面测试：

- Android系统上，Chrome for Android无法通过iframe.src 来调用schema，而通过a.href 的方式可以成功调用，而针对chrome内核的浏览器如猎豹，360，小米浏览器，
opera对于iframe.src和a.href的方式都能支持，所以对chrome及先关的内核的浏览器采用a.href的方式来调用scheme；对于其他浏览器，如UC，firefox,mobile QQ，sogou浏览器则采用iframe.src的方式调用schema。对于微信浏览器，则直接跳转到下载页。其他未经测试的浏览器，默认采用iframe.src来调用schema；
- IOS 9系统上，Safari浏览器无法通过iframe.src的方式调用schema，对于UC，Chrome，百度浏览器，mobileQQ只能通过a.href的方式进行调用schema；对于微信浏览器，默认跳转到下载页；

代码如下：

![](http://i.imgur.com/SCGLk2o.png)

3 .**处理客户端未安装的情况**

前面提到无法确定客户端程序是否安装，所以在通过iframe和a调用schema时，会设置一个settimeout，超时，则跳转到下载页；

>此处的超时时间设置也十分关键，如果超时时间小于app启动时间，则未待app启动，就是执行setimeout的方法，如果超时时间较长，则当客户端程序未安装时，需要较长时间才能执行settimeout方法进入下载页。

![](http://i.imgur.com/5LoUk8D.png)

>代码中，进入到setimeout时，对跳转过程再次进行了限定；当浏览器因为启动app而切换到后台时，settimeout存在计时推迟或延迟的问题，此时，如果从app切换回浏览器端，则执行跳转代码时经历的时间应该大于setimeout所设置的时间；反之，如果本地客户端程序未安装，浏览器则不会进入后台程序，定时器则会准时执行，故应该跳转到下载页！

在实际测试过程，当通过schema成功唤起客户端，再次返回浏览器时，发现页面已跳转至下载页面，因此对已设置的settimeout需要做一个清除处理；

当本地app被唤起，app处于设备可视窗口最上层，则浏览器进入后台程序页面会隐藏掉，会触发pagehide与visibilitychange事件，此时应该清除setimeout事件,于此同时，document.hide属性为true，因此setimeout内也不做跳转动作，防止页面跳转至下载页面；
此时，有几个事件比较关键：

	pagehide: 页面隐藏时触发
	
	visibilitychange： 页面隐藏没有在当前显示时触发，比如切换tab，也会触发该事件
	
	document.hidden 当页面隐藏时，该值为true，显示时为false

为了尽可能的兼容多的浏览器，所以讲这几个事件都进行绑定！
代码如下。

![](http://i.imgur.com/ZHp2spo.png)

---

## 测试结果
1. Android平台（小米3 手机测试）

   - 经测试，可唤起chrome，Firefox，uc，360，mibrowser，sogou，liebao，mobileQQ浏览器；
   - 新版opera浏览器采用webkit内核，但是当客户端未安装时跳转下载页会会出错，提示页面不存在；
   - 微信不支持登陆，直接做了跳转到下载页处理；
   - Android上启动相对比较慢，导致很容易启动超时而跳转到下载页面；
   - 测试页面在本机，百度浏览器会上报检测url合法性，导致唤醒不成功

   ![](http://i.imgur.com/917kCq1.png)

 2 . IOS平台（ip4，ip6+，ipad mini2）
   - os7上Safari可用，其他浏览器为测试，条件限制；
   - Safari，UC浏览器，Chrome 浏览器能唤起nn客户端，但是Safari会有 是否打开的提示；
   - QQ webviwe上能打开，偶尔会失败；
   - IOS上启动速度相对较快

## 相关代码
对代码进行简单的封装，代码如下，在使用时需要针对当前的app做必要设置：

代码见<>

调用方式：

```

nnSchema.loadSchema({
    // 通过NN打开某个链接
    schema: url,

    //schema头协议，默认为ftnn
    //protocal:"ftnn",

    //发起唤醒请求后，会等待loadWaiting时间，超时则跳转到failUrl，默认3000ms
    //loadWaiting:"3000",

    //唤起失败时的跳转链接，默认跳转到下载页
    //failUrl:"http://a.app.qq.com/o/simple.jsp?pkgname=cn.futu.trader&g_f=991653"
});
```

## 研究意义
 **便于通过相关H5页面进入Native客户端，提升用户体验，提升App用户粘度；**
   对于未安装客户端的用户，可引导进入下载通道，如下场景图：

![](http://i.imgur.com/ymKiJJM.png)

## 存在的问题

1. 在没有安装客户端程序的时候，opera无法跳转到指定页的失败页；
2. 通过微信唤醒客户端目前不可行，Android上需要微信设置白名单；IOS上，需要微信设置白名单或者通过Universal links（IOS9+）协议；
3. 尚未对IOS9的 Universal links协议进行功能测试。
4. 代码中使用的各种时间如：settimeout定时时间均根据本机测试进行的调整，普遍性需要进一步验证

## 最后

1. 经过自行测试及网上查阅资料，目前尚未找到完美的解决方案；
2. 对于文中的不足和错误，欢迎指出。

## 相关阅读链接

- <https://developer.chrome.com/multidevice/android/intents>
- <https://segmentfault.com/a/1190000005848133?_ea=938555>
- <http://www.w3ctech.com/topic/287?utm_source=tuicool&utm_medium=referral>
- <http://blog.html5funny.com/2015/06/19/open-app-from-mobile-web-browser-or-webview/>
- <http://echozq.github.io/echo-blog/2015/11/13/callapp.html>
