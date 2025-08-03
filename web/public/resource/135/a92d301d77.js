/*2019-09-19 10:36:30*/
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.12
 *
 * Requires: jQuery 1.2.2+
 */
!(function (a) {
  "function" == typeof define && define.amd
    ? define(["jquery"], a)
    : "object" == typeof exports
    ? (module.exports = a)
    : a(jQuery);
})(function (a) {
  function b(b) {
    var g = b || window.event,
      h = i.call(arguments, 1),
      j = 0,
      l = 0,
      m = 0,
      n = 0,
      o = 0,
      p = 0;
    if (
      ((b = a.event.fix(g)),
      (b.type = "mousewheel"),
      "detail" in g && (m = -1 * g.detail),
      "wheelDelta" in g && (m = g.wheelDelta),
      "wheelDeltaY" in g && (m = g.wheelDeltaY),
      "wheelDeltaX" in g && (l = -1 * g.wheelDeltaX),
      "axis" in g && g.axis === g.HORIZONTAL_AXIS && ((l = -1 * m), (m = 0)),
      (j = 0 === m ? l : m),
      "deltaY" in g && ((m = -1 * g.deltaY), (j = m)),
      "deltaX" in g && ((l = g.deltaX), 0 === m && (j = -1 * l)),
      0 !== m || 0 !== l)
    ) {
      if (1 === g.deltaMode) {
        var q = a.data(this, "mousewheel-line-height");
        (j *= q), (m *= q), (l *= q);
      } else if (2 === g.deltaMode) {
        var r = a.data(this, "mousewheel-page-height");
        (j *= r), (m *= r), (l *= r);
      }
      if (
        ((n = Math.max(Math.abs(m), Math.abs(l))),
        (!f || f > n) && ((f = n), d(g, n) && (f /= 40)),
        d(g, n) && ((j /= 40), (l /= 40), (m /= 40)),
        (j = Math[j >= 1 ? "floor" : "ceil"](j / f)),
        (l = Math[l >= 1 ? "floor" : "ceil"](l / f)),
        (m = Math[m >= 1 ? "floor" : "ceil"](m / f)),
        k.settings.normalizeOffset && this.getBoundingClientRect)
      ) {
        var s = this.getBoundingClientRect();
        (o = b.clientX - s.left), (p = b.clientY - s.top);
      }
      return (
        (b.deltaX = l),
        (b.deltaY = m),
        (b.deltaFactor = f),
        (b.offsetX = o),
        (b.offsetY = p),
        (b.deltaMode = 0),
        h.unshift(b, j, l, m),
        e && clearTimeout(e),
        (e = setTimeout(c, 200)),
        (a.event.dispatch || a.event.handle).apply(this, h)
      );
    }
  }

  function c() {
    f = null;
  }

  function d(a, b) {
    return (
      k.settings.adjustOldDeltas && "mousewheel" === a.type && b % 120 === 0
    );
  }
  var e,
    f,
    g = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
    h =
      "onwheel" in document || document.documentMode >= 9
        ? ["wheel"]
        : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
    i = Array.prototype.slice;
  if (a.event.fixHooks)
    for (var j = g.length; j; ) a.event.fixHooks[g[--j]] = a.event.mouseHooks;
  var k = (a.event.special.mousewheel = {
    version: "3.1.12",
    setup: function () {
      if (this.addEventListener)
        for (var c = h.length; c; ) this.addEventListener(h[--c], b, !1);
      else this.onmousewheel = b;
      a.data(this, "mousewheel-line-height", k.getLineHeight(this)),
        a.data(this, "mousewheel-page-height", k.getPageHeight(this));
    },
    teardown: function () {
      if (this.removeEventListener)
        for (var c = h.length; c; ) this.removeEventListener(h[--c], b, !1);
      else this.onmousewheel = null;
      a.removeData(this, "mousewheel-line-height"),
        a.removeData(this, "mousewheel-page-height");
    },
    getLineHeight: function (b) {
      var c = a(b),
        d = c["offsetParent" in a.fn ? "offsetParent" : "parent"]();
      return (
        d.length || (d = a("body")),
        parseInt(d.css("fontSize"), 10) || parseInt(c.css("fontSize"), 10) || 16
      );
    },
    getPageHeight: function (b) {
      return a(b).height();
    },
    settings: { adjustOldDeltas: !0, normalizeOffset: !0 },
  });
  a.fn.extend({
    mousewheel: function (a) {
      return a ? this.bind("mousewheel", a) : this.trigger("mousewheel");
    },
    unmousewheel: function (a) {
      return this.unbind("mousewheel", a);
    },
  });
});
var _0x3f41 = [
  "collapsed",
  "getClosedNode",
  "setAttribute",
  "url",
  "circle",
  "<img\x20src=\x22",
  "\x22\x20_src=\x22",
  "close_dialog",
  "onClose",
  "图片美图上传功能需要登录后才能使用",
  "meitu-pingtu",
  "meitu_pingtu",
  "embedSWF",
  "MeituPingTuContent",
  "_src",
  "图片拼图上传功能需要登录后才能使用",
  "cache/remote/",
  ".gif",
  "wx_fmt=gif",
  "<div\x20id=\x22iframeShade\x22>",
  "<div\x20id=\x22iframeContainer\x22>",
  "&t=2\x22\x20width=\x22100%\x22\x20height=\x22540\x22\x20frameborder=\x220\x22></iframe>",
  "<span\x20class=\x22iframeClose\x22>&times;</span>",
  "</div></div>",
  "#iframeShade",
  "fixed",
  "10000",
  "#iframeContainer",
  "translate(-50%,-50%)",
  "85%",
  ".iframeClose",
  "-45px",
  "46px",
  "bold\x2039px/39px\x20\x22PingFangSC-Regular\x22,\x22microsoft\x20yahei\x22",
  "center",
  "41px",
  "#F2395B",
  "pointer",
  "delegate",
  "#iframeShade\x20#iframeContainer\x20.iframeClose",
  "/users/simple.json",
  "then",
  "fail",
  "没有登录",
  "open_dialog",
  "/uploadfiles/cropImage?uri=",
  "&ratio=",
  "&width=",
  "裁剪图片上传",
  "cropImage-modal",
  "GrwA23",
  "正在为您保存编辑的图片，请稍候",
  "/uploadfiles/uploadBase64",
  "<section\x20class=\x22_135editor\x22><p\x20style=\x22text-align:center\x22><img\x20src=\x22",
  "\x22></p></section>",
  "msg",
  "base64",
  "editor",
  "meitu-beautify",
  "maxFinalWidth",
  "beautify",
  "MeituContent",
  "setUploadArgs",
  "onInit",
  "remote.wx135.com",
  ".135editor.com",
  ".wx135.com",
  "/downloads/fetch_url?fu=",
  "loadPhoto",
  "focus_close",
  "编辑图片属于付费功能。更换图片请直接双击图片",
  "slider",
  "InitValue",
  "Accuracy",
  "settings",
  "<div\x20class=\x22complete\x22></div>",
  "<div\x20class=\x22marker\x22></div>",
  "vertical",
  "trigger",
  "accuracy",
  "mouseup.sliderMarker\x20touchend.sliderMarker",
  "mousemove.sliderMarker",
  "touchmove.sliderMarker",
  "changed",
  "targetTouches",
  "param",
  "file_input",
  "upidx",
  "files",
  "file_post_name",
  "file_model_name",
  "noto_upfiles",
  "data_id",
  "fieldid",
  "item_css",
  "save_folder",
  "return_type",
  "remote_type",
  "post_params",
  "-status\x22\x20class=\x22uploading-item\x20clearfix\x22><span\x20class=\x22filename\x22>",
  "</span>\x20<div\x20class=\x22progress\x20float-left\x22\x20style=\x22width:200px;\x22>",
  "<span\x20class=\x22sr-only\x22>0%</span>",
  "</div></div>\x20</div>",
  "-status",
  "addEventListener",
  "progress",
  "uploadProgress",
  "uploadComplete",
  "uploadFailed",
  "abort",
  "uploadCanceled",
  "POST",
  "upload_url",
  "send",
  "uploading_files",
  "check_upload",
  "loaded",
  "total",
  "responseText",
  "upload_limit",
  "#fileuploadinfo_",
  "message",
  "fadeOut",
  "slow",
  "There\x20was\x20an\x20error\x20attempting\x20to\x20upload\x20the\x20file.",
  "The\x20upload\x20has\x20been\x20canceled\x20by\x20the\x20user\x20or\x20the\x20browser\x20dropped\x20the\x20connection.",
  "#colorfulPulse",
  "serializeArray",
  "data[WxMsg][content]",
  "action",
  "MBox",
  "#save-wx-msg-dialog",
  "parseJSON",
  "PLAT135_URL",
  "is_paid_user",
  "utils",
  "Popup",
  "Stateful",
  "uiUtils",
  "UIBase",
  "dom",
  "domUtils",
  "scroll",
  "style_url",
  "plat_host",
  "/editor_styles/open?inajax=1&appkey=",
  "appkey",
  "sign_token",
  "page_url",
  "addListener",
  "Tdrag",
  "ready",
  "clearDoc",
  "#load-more-style",
  "before",
  "getLang",
  "labelMap.isLoading",
  "ajax",
  "&filter=",
  "setRequestHeader",
  "PLG-Referer",
  "href",
  "#style-overflow-list\x20#loading-style",
  "#style-overflow-list",
  "#style-categories\x20.active",
  "page",
  "data-status",
  ".editor-template-list",
  "done",
  "nomore",
  "loading",
  "tab-pane",
  "closest",
  "a[href=\x22#",
  "&page=",
  "?page=",
  "word",
  "&name=",
  ".loading-style",
  ".appmsg_listboxs",
  ".appmsg",
  "请先输入内容",
  "/wx_msgs/plugin_save/",
  "?rethtml=1&inajax=1&appkey=",
  "#save-wx-msg-dialog\x20.modal-body",
  "<div\x20style=\x22margin:10px;text-align:center;\x22><img\x20src=\x22/img/ajax/wheel_throbber.gif\x22>",
  "#save-wx-msg-dialog\x20.close",
  "sessionStorage",
  "<img>",
  "#preview-qrcode\x20img",
  "//by.135editor.com/img/ajax/circle_ball.gif",
  "/drafts/save.json?appkey=",
  "WxMsg",
  "lastSave",
  "preview_url",
  "next",
  "<p><a\x20href=\x22",
  "\x22\x20target=\x22_blank\x22><i\x20class=\x22fa\x20fa-desktop\x22></i>\x20电脑查看</a></p>",
  "content\x20not\x20change.",
  "lastPreviewUrl",
  "/tools/qrcode?uri=",
  "#333",
  "#FFF",
  "ColorPicker",
  "clearColor",
  "input\x20propertychange",
  "content",
  "setColor",
  "console",
  "showAnchor",
  "uid",
  "style_width",
  ".edui-editor-sidebar",
  ".edui-editor-mainbar",
  "1px\x20solid\x20#ddd",
  "<p\x20style=\x22line-height:32px;margin:\x2020px;\x22><img\x20style=\x22float:left;margin-right:\x205px;\x22\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>",
  "location",
  "edui",
  "-styles",
  "<div\x20id=\x22",
  "\x22\x20style=\x22position:absolute;width:",
  "initialFrameHeight",
  "#top-panel",
  ".editor-menus",
  "#editor-styles-content",
  "#copyright",
  "#style-categories",
  "#styleSearchResultList",
  "#styleRecentList",
  "#templateSearchResultList",
  "#imgSearchResultList",
  "hover",
  "open",
  "#style-categories\x20.filter",
  ".editor-template-list\x20>\x20li",
  "data-filter",
  "pageLoad",
  "#style-categories\x20a.active:first",
  "filter",
  ".load-more-data",
  "#editor-styles\x20.editor-menus\x20li",
  ".tab-content",
  ".tab-pane",
  "open-tpl-brush",
  ".insert-tpl-content",
  "form",
  "search",
  "&appkey=",
  "&inajax=1&",
  "serialize",
  "_blank",
  "test",
  "javascript",
  "prepend",
  "&inajax=1",
  "?appkey=",
  "btn-search-image",
  "#SearchImageName",
  "onclick",
  "<section\x20style=\x22position:absolute;z-index:100;color:\x20red;width:100%;height:100%;background-color:rgba(0,0,0,0.5);padding:10px;\x22><img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20",
  "refresh",
  "#online-styles\x20.col-sm-12,#user-style-list\x20.col-sm-12,#style-overflow-list\x20.ui-portlet-list\x20>\x20li,#styleSearchResultList\x20#style_search_list\x20>\x20ul\x20>\x20li,#styleRecentList\x20#style_recent_list\x20>\x20ul\x20>\x20li",
  "ignore",
  "nodeType",
  "data-width",
  "inArray",
  "unshift",
  "pop",
  "localStorage",
  "styUsedList",
  "splice",
  ">\x20._135editor:first",
  "135editor",
  "prop",
  "outerHTML",
  "<section\x20data-id=\x22",
  "\x22\x20class=\x22_135editor\x22>",
  ".autonum:first",
  "#last-used",
  "last",
  "无最近使用样式",
  "#styleRecentResult",
  "fadeIn",
  "/editor_styles/recent?inajax=1&ids=",
  "#system-template-list\x20.insert-tpl-content",
  "labelMap.confirmReplace",
  ".json?appkey=",
  "\x22\x20data-tools=\x22135编辑器\x22>",
  "EditorStyle",
  "模板内容获取异常",
  "/editor_styles/view/",
  "&nolazy=1",
  "getPlainTxt",
  "opennew",
  "type=opennew",
  "#style-categories\x20a.active",
  "&type=opennew",
  "#style-overflow-list\x20.editor-template-list",
  "#template-",
  "#online-template",
  "overflow",
  "hidden",
  "#template-contnet-brush",
  "<div\x20id=\x22close-template\x22\x20style=\x22position:\x20absolute;z-index:\x2011;cursor:pointer;right:\x205px;color:\x20#000;font-size:20px;\x22>&times;</div>",
  "overflow-y",
  "._135editor",
  "clearfix",
  "10px",
  "5px\x200",
  ".btn-brush",
  "clone",
  "#html-to-image",
  "sync",
  "getContent",
  "textarea",
  "https://end14.135editor.com/downloads/htmlToImage?appkey=",
  "method",
  "post",
  "HtmlToImageForm",
  "#save-as-template",
  "#preview-msg-content",
  "#preview-msg",
  ".close-preview",
  ".article_img",
  "#per-article-imgs",
  "#my-articles",
  "<div\x20id=\x22close-article-imgs\x22\x20style=\x22position:\x20absolute;z-index:\x2011;cursor:pointer;right:\x205px;color:\x20#000;font-size:20px;\x22>&times;</div>",
  "#close-article-imgs",
  "#html-parsers-options\x20:input",
  "/html_parsers/parse/",
  "#refresh-styles",
  "img:first",
  "creator",
  "srcElement",
  "&nolazy=1&team_id=",
  "#replace-color-all",
  "checked",
  "replace_full_color",
  "#txtStyleSearch",
  "keyup\x20blur\x20focus",
  "#styleSearchResult",
  "/editor_styles/search?appkey=",
  "&inajax=1&name=",
  "#templateSearchResult",
  "\x20#system-template-list",
  "#imgSearchResult",
  "\x20#system-img-list",
  ".autonum",
  "mousewheel",
  ".colorPicker",
  "blur",
  "keyup",
  "focus.colorPicker",
  ".color-switch",
  "showSuccessMessage",
  "color_click",
  "style_click",
  "setFavorColor",
  "showErrorMessage",
  "showmessage",
  "error-msg",
  "getEditorHtml",
  "img,audio,iframe,mpvoice,video",
  "clear",
  "getWxContent",
  "ajaxActionHtml",
  "ajaxAction",
  "?inajax=1",
  ":submit",
  "disabled",
  "success",
  "tasks",
  "<span\x20class=\x27ui-state-error\x20ui-corner-all\x27><span\x20class=\x27ui-icon\x20ui-icon-alert\x27></span>",
  "</span>",
  "dotype",
  "dialog",
  "reload",
  "jquery",
  "args",
  "func",
  "callback=\x20",
  "callback",
  "thisArg=\x20",
  "callback_args",
  "model_overlay",
  "overlayName",
  "\x22></div>",
  "prependTo",
  "<div\x20class=\x22",
  "boxName",
  "setting",
  "createOverlay",
  "createBody",
  "createLayer",
  "zh-cn",
  "首行缩进",
  "下划线",
  "删除线",
  "字符边框",
  "字符边框带底色",
  "格式刷",
  "源代码",
  "纯文本粘贴模式",
  "清除格式",
  "取消链接",
  "前插入行",
  "前插入列",
  "右合并单元格",
  "下合并单元格",
  "删除行",
  "删除列",
  "拆分成行",
  "拆分成列",
  "完全拆分单元格",
  "删除表格标题",
  "插入标题",
  "合并多个单元格",
  "清空文档",
  "后面插入段落",
  "代码语言",
  "字号\x2010~72px",
  "段落格式",
  "单图上传",
  "多图上传",
  "表格属性",
  "单元格属性",
  "特殊字符",
  "查询替换",
  "Baidu地图",
  "居左对齐",
  "居中对齐",
  "两端对齐",
  "字体颜色",
  "背景色",
  "有序列表",
  "无序列表",
  "全屏写稿模式",
  "段前距",
  "插入Iframe",
  "右浮动",
  "行间距",
  "字间距",
  "两侧边距",
  "编辑提示",
  "自定义标题",
  "自动排版",
  "字母小写",
  "插入表格",
  "从草稿箱加载",
  "正在加载……",
  "正文内容即将替换成模板内容，是否确认？",
  "全文图片居中",
  "图片边框阴影",
  "1,2,3...",
  "1),2),3)...",
  "(1),(2),(3)...",
  "一),二),三)....",
  "(一),(二),(三)....",
  "a,b,c...",
  "A,B,C...",
  "I,II,III...",
  "○\x20大圆圈",
  "●\x20小黑点",
  "■\x20小方块\x20",
  "—\x20破折号",
  "\x20。\x20小圆圈",
  "二级标题",
  "三级标题",
  "四级标题",
  "五级标题",
  "六级标题",
  "andale\x20mono",
  "arial",
  "arial\x20black",
  "comic\x20sans\x20ms",
  "标题居中",
  "标题居左",
  "明显强调",
  "服务器返回格式错误",
  "正在上传...",
  "上传错误",
  "后端配置项没有正常加载，上传插件不能正常使用！",
  "文件大小超出限制",
  "文件格式不允许",
  "元素路径",
  "字数统计",
  "当前已输入{#count}个字符,\x20您还可以输入{#leave}个字符。\x20",
  "<span\x20style=\x22color:red;\x22>字数超出最大允许值，服务器可能拒绝保存！</span>",
  "表格拖动必须引入uiUtils.js文件！",
  "工具栏浮动依赖编辑器UI，您首先需要引入UI文件!",
  "获取后台配置项请求出错，上传功能将不能正常使用！",
  "后台配置项返回格式出错，上传功能将不能正常使用！",
  "请求后台配置项http错误，上传功能将不能正常使用！",
  "仅支持IE浏览器！",
  "ActionScript\x203",
  "Bash/Shell",
  "C/C++",
  "CSS",
  "ColdFusion",
  "Diff",
  "Erlang",
  "Java",
  "JavaFX",
  "JavaScript",
  "PHP",
  "Plain\x20Text",
  "PowerShell",
  "Python",
  "Ruby",
  "Scala",
  "SQL",
  "Visual\x20Basic",
  "XML",
  "删除代码",
  "确定清空当前文档么？",
  "删除超链接",
  "单元格对齐方式",
  "表格对齐方式",
  "左浮动",
  "居中显示",
  "设置表格边线可见",
  "左对齐",
  "右对齐",
  "前插入段落",
  "后插入段落",
  "左插入列",
  "后插入行",
  "右插入列",
  "插入表格名称",
  "删除表格名称",
  "插入表格标题行",
  "删除表格标题行",
  "插入表格标题列",
  "删除表格标题列",
  "平均分布各行",
  "平均分布各列",
  "向右合并",
  "向左合并",
  "合并单元格",
  "表格排序",
  "设置表格可排序",
  "取消表格可排序",
  "逆序当前",
  "按ASCII字符升序",
  "按ASCII字符降序",
  "按数值大小升序",
  "按数值大小降序",
  "边框底纹",
  "取消表格隔行变色",
  "取消选区背景",
  "红蓝相间",
  "三色渐变",
  "复制(Ctrl\x20+\x20c)",
  "浏览器不支持,请使用\x20\x27Ctrl\x20+\x20c\x27",
  "粘贴(Ctrl\x20+\x20v)",
  "浏览器不支持,请使用\x20\x27Ctrl\x20+\x20v\x27",
  "标准颜色",
  "主题颜色",
  "取消圆形",
  "最近使用颜色",
  "点击上传",
  "合并空行",
  "清除空行",
  "对齐方式",
  "图片浮动",
  "清除字号",
  "清除字体",
  "粘贴过滤",
  "全角转半角",
  "半角转全角",
  "在线图片",
  "无背景色",
  "有背景色",
  "颜色设置",
  "网络图片",
  "精确定位",
  "横向重复",
  "自定义",
  "单击可切换选中状态\x0a原图尺寸:\x20",
  "插入远程图片",
  "本地上传",
  "在线管理",
  "地\x20址：",
  "大\x20小：",
  "宽\x20度：",
  "高\x20度：",
  "边\x20距：",
  "描\x20述：",
  "图片浮动方式：",
  "开始上传",
  "锁定宽高比例",
  "图片类型",
  "百度一下",
  "清空搜索",
  "居中独占一行",
  "普通图片上传",
  "继续添加",
  "暂停上传",
  "向左旋转",
  "向右旋转",
  "预览中",
  "选中_张图片，共_KB。",
  "共_张（_KB），_张上传成功",
  "，_张上传失败。",
  "WebUploader\x20不支持您的浏览器！如果你使用的是IE浏览器，请尝试升级\x20flash\x20播放器。",
  "文件大小超出",
  "上传失败，请重试",
  "http请求错误",
  "宽高不正确,不能所定比例",
  "请输入正确的长度或者宽\x20度：值！例如：123，400",
  "不允许的图片格式或者图片域！",
  "图片加载中，请稍后……",
  "\x20:(\x20，抱歉，没有找到图片！请重试一次！",
  "上传附件",
  "在线附件",
  "可以将文件拖到这里，单次最多可选100个文件",
  "继续上传",
  "重试上传",
  "选中_个文件，共_KB。",
  "已成功上传_个文件，_个文件上传失败",
  "文件传输中断",
  "服务器返回出错",
  "插入视频",
  "搜索视频",
  "上传视频",
  "视频尺寸",
  "清空结果",
  "background:url(upload.png)\x20no-repeat;",
  "建议使用mp4格式.",
  "请输入正确的数值，如123,400",
  "独占一行",
  "输入的视频地址有误，请检查后再试！",
  "\x20&nbsp;视频加载中，请等待……",
  "点击选中",
  "访问源视频",
  "\x20&nbsp;\x20&nbsp;抱歉，找不到对应的视频，请重试！",
  "上传成功!",
  "从成功队列中移除",
  "当前Flash版本过低，请更新FlashPlayer后重试！",
  "等待上传……",
  "从上传队列中移除",
  "移除失败文件",
  "文件大小超出限制！",
  "文件类型不允许！",
  "上传中，请等待……",
  "取消上传",
  "网络错误",
  "服务器IO错误！",
  "验证失败，本次上传被跳过！",
  "取消中，请等待……",
  "上传已停止……",
  "点击选择文件",
  "成功上传_个，_个失败",
  "共_个(_KB)，_个成功上传",
  "本功能由百度APP提供，如看到此页面，请各位站长首先申请百度APPKey!",
  "点此申请",
  "百度API",
  "保留原有内容",
  "博客文章",
  "图文混排",
  "上一步",
  "下一步",
  "添加背景",
  "删除背景",
  "添加背景图片",
  "尚未作画，白纸一张~",
  "涂鸦上传中,别急哦~",
  "糟糕，图片读取失败了！",
  "输入歌手/歌曲/专辑，搜索您感兴趣的音乐！",
  "搜索歌曲",
  "未搜索到相关音乐结果，请换一个关键词试试。",
  "锚点名字：",
  "数据源：",
  "图表格式：",
  "数据源与图表X轴Y轴一致",
  "数据源与图表X轴Y轴相反",
  "图表标题",
  "主标题：",
  "子标题：",
  "X轴标题：",
  "Y轴标题：",
  "提示文字",
  "提示文字前缀：",
  "仅饼图有效，\x20当鼠标移动到饼图中相应的块上时，提示框内的文字的前缀",
  "单位：",
  "显示在每个数据点上的数据的单位，\x20比如：\x20温度的单位\x20℃",
  "图表类型：",
  "上一个",
  "下一个",
  "兔斯基",
  "BOBO",
  "绿豆蛙",
  "baby猫",
  "无法定位到该地址!",
  "关于UEditor",
  "快捷键",
  "UEditor是由百度web前端研发部开发的所见即所得富文本web编辑器，具有轻量，可定制，注重用户体验等特点。开源基于BSD协议，允许自由使用和修改代码。",
  "复制选中内容",
  "重新执行上次操作",
  "给选中字设置为斜体",
  "给选中字加下划线",
  "全部选中",
  "高\x20度：：",
  "允许滚动条：",
  "显示框架边框：",
  "请输入地址!",
  "文本内容：",
  "标题：",
  "是否在新窗口打开：",
  "只支持选中一个链接时生效",
  "您输入的超链接中不包含http等协议名称，默认将为您添加http://前缀",
  "插入动态地图",
  "请选择城市",
  "抱歉，找不到该位置！",
  "支持正则表达式，添加前后斜杠标示为正则表达式，例如“/表达式/”",
  "区分大小写",
  "全部替换",
  "已经搜索到文章末尾！",
  "已经搜索到文章头部",
  "截图功能需要首先安装UEditor截图插件！\x20",
  "点此下载",
  "第一步，下载UEditor截图插件并运行安装。",
  "第二步，插件安装完成后即可使用，如不生效，请重启浏览器后再试！",
  "罗马字符",
  "数学字符",
  "日文字符",
  "希腊字母",
  "俄文字符",
  "拼音字母",
  "表格样式",
  "添加表格标题行",
  "添加表格标题列",
  "使表格内容可排序",
  "按表格文字自适应",
  "表格名称",
  "有合并单元格，不可排序",
  "删除整行",
  "删除整列",
  "背景颜色:",
  "background:\x20url(copy.png)\x20-153px\x20-1px\x20no-repeat;",
  "1、点击顶部复制按钮，将地址复制到剪贴板；2、点击添加照片按钮，在弹出的对话框中使用Ctrl+V粘贴地址；3、点击打开后选择图片,然后点击“开始上传”，最后点击底部的确定。",
  "FLASH初始化失败，请检查FLASH插件是否正确安装！",
  "网络连接错误，请重试！",
  "图片地址已经复制！",
  "本地保存成功",
  "all",
  "tezml",
  "ease-out",
  "isEmptyObject",
  "options",
  "$element",
  "pack",
  "randomInput",
  "click",
  "loadJqueryfn",
  "prototype",
  "ele",
  "handle",
  "disable",
  "_start",
  "_end",
  "disX",
  "zIndex",
  "moving",
  "moves",
  "type",
  "scope",
  "string",
  "find",
  "mousedown",
  "target",
  "tagName",
  "SPAN",
  "INPUT",
  "SELECT",
  "parents",
  ".slider",
  "start",
  "setCapture",
  "dragChange",
  "mouseup",
  "end",
  "move",
  "extend",
  "push",
  "length",
  "attr",
  "index",
  "disableInput",
  "bind",
  "moved",
  "clientX",
  "disY",
  "clientY",
  "offsetTop",
  "cbStart",
  "_move",
  "collTestBox",
  "lmax",
  "lmin",
  "tmax",
  "tmin",
  "axis",
  "left",
  "grid",
  "style",
  "top",
  "pos",
  "moveAddClass",
  "cbMove",
  "changeMode",
  "sort",
  "sortDrag",
  "point",
  "animation",
  "aPos",
  "cbEnd",
  "unbind",
  "onmousemove",
  "releaseCapture",
  "innerWidth",
  "innerHeight",
  "outerHeight",
  "isArray",
  "floor",
  "log",
  "grid参数传递格式错误",
  "getDis",
  "offsetLeft",
  "offsetWidth",
  "offsetHeight",
  "position",
  "css",
  "margin",
  "rnd",
  "random",
  "firstRandom",
  "absolute",
  "moveClass",
  "hasClass",
  "findNearest",
  "removeClass",
  "round",
  "duration",
  "getStyle",
  "width",
  "height",
  "timer",
  "linear",
  "ease-in",
  "opacity",
  "alpha(opacity:",
  "raw",
  "json",
  "stringify",
  "replace",
  "cookie",
  "isFunction",
  "defaults",
  "number",
  "expires",
  "getMilliseconds",
  ";\x20expires=",
  "toUTCString",
  "path",
  "domain",
  ";\x20secure",
  "join",
  "split",
  "shift",
  "removeCookie",
  "_originalInput",
  "_roundA",
  "format",
  "_gradientType",
  "_ok",
  "_tc_id",
  "object",
  "hasOwnProperty",
  "substr",
  "prgb",
  "rgb",
  "hsv",
  "hsl",
  "toString",
  "charAt",
  "toHsl",
  "desaturate",
  "toRgb",
  "toHsv",
  "100%",
  "abs",
  "indexOf",
  "toLowerCase",
  "transparent",
  "name",
  "exec",
  "rgba",
  "hsla",
  "hsva",
  "hex8",
  "hex6",
  "hex",
  "hex3",
  "small",
  "toUpperCase",
  "max",
  "getBrightness",
  "isDark",
  "_format",
  "pow",
  "hsv(",
  "%,\x20",
  "hsla(",
  "rgb(",
  "rgba(",
  "GradientType\x20=\x201,\x20",
  "toHex8String",
  "startColorstr=",
  ",endColorstr=",
  "toRgbString",
  "toPercentageRgbString",
  "toHexString",
  "toHsvString",
  "concat",
  "slice",
  "call",
  "setAlpha",
  "_applyModification",
  "_applyCombination",
  "fromRatio",
  "equals",
  "getLuminance",
  "level",
  "size",
  "AAAlarge",
  "AAlarge",
  "AAAsmall",
  "includeFallbackColors",
  "readability",
  "isReadable",
  "mostReadable",
  "#fff",
  "#000",
  "names",
  "f0f8ff",
  "faebd7",
  "0ff",
  "7fffd4",
  "f0ffff",
  "f5f5dc",
  "ffe4c4",
  "000",
  "00f",
  "8a2be2",
  "a52a2a",
  "deb887",
  "5f9ea0",
  "7fff00",
  "d2691e",
  "6495ed",
  "00008b",
  "008b8b",
  "b8860b",
  "006400",
  "a9a9a9",
  "bdb76b",
  "8b008b",
  "9932cc",
  "8b0000",
  "e9967a",
  "8fbc8f",
  "483d8b",
  "2f4f4f",
  "00ced1",
  "9400d3",
  "00bfff",
  "696969",
  "b22222",
  "228b22",
  "f0f",
  "dcdcdc",
  "ffd700",
  "adff2f",
  "f0fff0",
  "ff69b4",
  "4b0082",
  "f0e68c",
  "e6e6fa",
  "7cfc00",
  "add8e6",
  "e0ffff",
  "d3d3d3",
  "90ee90",
  "ffb6c1",
  "ffa07a",
  "20b2aa",
  "87cefa",
  "789",
  "ffffe0",
  "0f0",
  "faf0e6",
  "800000",
  "66cdaa",
  "0000cd",
  "ba55d3",
  "9370db",
  "3cb371",
  "7b68ee",
  "00fa9a",
  "48d1cc",
  "f5fffa",
  "ffe4e1",
  "ffe4b5",
  "ffdead",
  "000080",
  "fdf5e6",
  "808000",
  "6b8e23",
  "ffa500",
  "ff4500",
  "da70d6",
  "eee8aa",
  "98fb98",
  "afeeee",
  "cd853f",
  "ffc0cb",
  "dda0dd",
  "800080",
  "663399",
  "f00",
  "bc8f8f",
  "4169e1",
  "fa8072",
  "f4a460",
  "2e8b57",
  "fff5ee",
  "c0c0c0",
  "87ceeb",
  "6a5acd",
  "708090",
  "00ff7f",
  "4682b4",
  "008080",
  "d8bfd8",
  "40e0d0",
  "ee82ee",
  "fff",
  "f5f5f5",
  "ff0",
  "9acd32",
  "[-\x5c+]?\x5cd+%?",
  "[-\x5c+]?\x5cd*\x5c.\x5cd+%?",
  "(?:",
  ")|(?:",
  "[\x5cs|\x5c(]+(",
  ")[,|\x5cs]+(",
  ")\x5cs*\x5c)?",
  "tinycolor",
  "<div\x20class=\x22colpick\x22><div\x20class=\x22colpick_color_bg\x22></div><div\x20class=\x22colpick_color\x22><div\x20class=\x22colpick_color_overlay1\x22><div\x20class=\x22colpick_color_overlay2\x22><div\x20class=\x22colpick_selector_outer\x22><div\x20class=\x22colpick_selector_inner\x22></div></div></div></div></div><div\x20class=\x22colpick_hue\x22><div\x20class=\x22colpick_hue_arrs\x22><div\x20class=\x22colpick_hue_larr\x22></div><div\x20class=\x22colpick_hue_rarr\x22></div></div></div><div\x20class=\x22colpick_alpha_bg\x22></div><div\x20class=\x22colpick_alpha\x22><div\x20class=\x22colpick_alpha_arrs\x22><div\x20class=\x22colpick_alpha_tarr\x22></div><div\x20class=\x22colpick_alpha_barr\x22></div></div></div><div\x20class=\x22colpick_new_color\x22></div><div\x20class=\x22colpick_current_color\x22></div><div\x20class=\x22colpick_hex_field\x22><div\x20class=\x22colpick_field_letter\x22>#</div><input\x20type=\x22text\x22\x20maxlength=\x226\x22\x20size=\x226\x22\x20/></div><div\x20class=\x22colpick_rgb_r\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>R</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_rgb_g\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>G</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_rgb_b\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>B</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_hsx_h\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>H</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_hsx_s\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>S</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_hsx_x\x20colpick_field\x22><div\x20class=\x22colpick_field_letter\x22>B</div><input\x20type=\x22text\x22\x20maxlength=\x223\x22\x20size=\x223\x22\x20/><div\x20class=\x22colpick_field_arrs\x22><div\x20class=\x22colpick_field_uarr\x22></div><div\x20class=\x22colpick_field_darr\x22></div></div></div><div\x20class=\x22colpick_submit\x22></div></div>",
  "light",
  "3289c7",
  "full",
  "colpick",
  "fields",
  "val",
  "data",
  "selector",
  "backgroundColor",
  "selectorIndic",
  "hue",
  "currentColor",
  "newColor",
  "),\x20rgba(255,255,255,0))",
  "overlay1",
  "background",
  "overlay2",
  "alpha",
  "parent",
  "parentNode",
  "className",
  "_hex",
  "color",
  "value",
  "get",
  "_hsx",
  "onChange",
  "apply",
  "colpick_focus",
  "addClass",
  "returnValue",
  "input",
  "focus",
  "_hsx_h",
  "mousemove",
  "field",
  "min",
  "preview",
  "colpick_slider",
  "off",
  "preventDefault",
  "mouseup\x20touchend",
  "mousemove\x20touchmove",
  "touchstart",
  "originalEvent",
  "changedTouches",
  "pageX",
  "cal",
  "livePreview",
  "offset",
  "pageY",
  "touchmove",
  "origColor",
  "onSubmit",
  "stopPropagation",
  "onBeforeShow",
  "show",
  "html",
  "onHide",
  "hide",
  "compatMode",
  "CSS1Compat",
  "pageXOffset",
  "documentElement",
  "body",
  "clientWidth",
  "each",
  "collorpicker_",
  "colpickId",
  "colpick_",
  "layout",
  "submit",
  "colorScheme",
  "colpick_hsl",
  "submitText",
  "change",
  "div.colpick_field_arrs",
  "div.colpick_current_color",
  "div.colpick_color",
  "div.colpick_selector_outer",
  "userAgent",
  "Microsoft\x20Internet\x20Explorer",
  "#ff0080",
  "#ff00ff",
  "#8000ff",
  "#0080ff",
  "#00ffff",
  "#00ff80",
  "#00ff00",
  "#80ff00",
  "#ffff00",
  "#ff8000",
  "#ff0000",
  "height:8.333333%;\x20filter:progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=",
  ",\x20endColorstr=",
  ");\x20-ms-filter:\x20\x22progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr=",
  ")\x22;",
  "background:-webkit-linear-gradient(top\x20center,",
  ");\x20background:linear-gradient(to\x20bottom,",
  "div.colpick_hue",
  "mousedown\x20touchstart",
  "div.colpick_new_color",
  "div.colpick_alpha_arrs",
  "div.colpick_color_overlay1",
  "appendTo",
  "relative",
  "block",
  "showEvent",
  "undefined",
  "init",
  "hidePicker",
  "showPicker",
  "match",
  "ENT_HTML_QUOTE_SINGLE",
  "substring",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  "fromCharCode",
  "charCodeAt",
  "===",
  "[object\x20Array]",
  "window",
  "select",
  "selection",
  "getNative",
  "cloneContents",
  "createElement",
  "innerText",
  "getRange",
  "startContainer",
  "endContainer",
  "endOffset",
  "getRangeAt",
  "appendChild",
  "innerHTML",
  "currentActive135Item",
  "trim",
  "undoManger",
  "save",
  "setContent",
  "div",
  "font-family",
  "svg",
  "xml:space",
  "default",
  "transform",
  "box-sizing",
  "padding",
  "border-box",
  "IMG",
  "TEXT",
  "IMAGE",
  "STRONG",
  "font-weight",
  "16px",
  "1.6",
  "0px",
  "0\x200\x200\x2030px",
  "paddingLeft",
  "paddingTop",
  "paddingBottom",
  "5px\x2010px",
  ";transform:\x20",
  ";-webkit-transform:\x20",
  ";-moz-transform:\x20",
  "https://mmbiz.",
  "https://mmbiz.qpic.cn",
  "parseInsertPasteSetHtml",
  "<div>",
  "</div>",
  "removeAttr",
  "class",
  "replaceWith",
  "attributes",
  "execCommand",
  "insertHtml",
  "open_editor",
  "fireEvent",
  "catchRemoteImage",
  "<br><p><h1><h2><h3><h4><h5><h6><img>",
  "document",
  ".assistant",
  "remove",
  "placeholder",
  ">\x20._135editor",
  "siblings",
  "&nbsp;",
  "<br/>",
  "h1,h2,h3,h4,h5,h6",
  ".135title",
  "<p>",
  "text",
  "img",
  ".135bg",
  "background-image",
  "url(",
  "src",
  "assistant",
  ".135brush",
  "data-role",
  "square",
  "bgmirror",
  "backgroundImage",
  "image",
  "xlink:href",
  ".135brush:first",
  "brushtype",
  "contents",
  "</p>",
  "empty",
  "append",
  "usemap",
  "after",
  "<map\x20name=\x22",
  "\x22\x20id=\x22",
  "\x22\x20style=\x22margin:\x200px;\x20padding:\x200px;\x20word-wrap:\x20break-word\x20!important;\x20max-width:\x20100%;\x20box-sizing:\x20border-box\x20!important;\x22><area\x20style=\x22margin:\x200px;\x20padding:\x200px;\x20word-wrap:\x20break-word\x20!important;\x20max-width:\x20100%;\x20box-sizing:\x20border-box\x20!important;\x22\x20href=\x22",
  "\x22\x20shape=\x22default\x22\x20target=\x22_blank\x22/></map>",
  "<section>",
  "</section>",
  "data-custom",
  "nodeName",
  "HTML",
  "STYLE",
  "LINK",
  "BODY",
  "data-ct",
  "fix",
  "fill",
  "._135editor:first",
  "data-color",
  "text-shadow",
  "data-clessp",
  "50%",
  "initial",
  "inherit",
  "data-txtless",
  "data-txtlessp",
  "darken",
  "lighten",
  "data-bglessp",
  "30%",
  "data-bgless",
  "true",
  "saturate",
  "data-bgopacity",
  "fadeout",
  "20%",
  "data-bcless",
  "data-bclessp",
  "auto",
  "data-bdopacity",
  "borderBottomColor",
  "borderTopColor",
  "borderLeftColor",
  "rgb(255,\x20255,\x20255)",
  "borderRightColor",
  "borderColor",
  "none",
  "boxShadow",
  "rgb\x5c([\x5cd|,|\x5cs]+?\x5c)",
  "10%",
  "fadein",
  "data-grless",
  "data-grlessp",
  "data-gradient",
  "reverse",
  "/editor_styles/click_num",
  "/editor_styles/setFavorColor",
  "/colors/click",
  "function",
  "fade",
  "getAlpha",
  "#templateModal",
  "#template-modal-body",
  "正在加载",
  "load",
  "WxMsgContent",
  "removeFormat",
  "getStartElement",
  "getName",
  "setStyles",
  "applyStyle",
  "editor135",
  "getPreferences",
  "setPreferences",
  "lineHeight",
  "#paragraph-lineHeight",
  "fontFamily",
  "#paragraph-fontFamily",
  "fontSize",
  "textIndent",
  "#paragraph-paddingTop",
  "helper",
  "clean",
  "active",
  ".tool-border",
  ".otf-poptools",
  "container",
  "#color-plan",
  "scrollTop",
  "bottom",
  ".edui-editor-toolbarbox",
  "check_userlogin",
  "meitu-full",
  "setLaunchVars",
  "titleVisible",
  "customMenu",
  "decorate",
  "facialMenu",
  "puzzle",
  "uploadBtnLabel",
  "meitu_full",
  "setUploadURL",
  "/uploadfiles/upload?team_id=",
  "team_id",
  "setUploadDataFieldName",
  "upload",
  "onBeforeUpload",
  "图片不能超过1M",
  "xiuxiu",
  "onUploadResponse",
  "ret",
  "error",
];
(function (_0x46c27f, _0x1559af) {
  var _0x339607 = function (_0x3d64fd) {
    while (--_0x3d64fd) {
      _0x46c27f["push"](_0x46c27f["shift"]());
    }
  };
  _0x339607(++_0x1559af);
})(_0x3f41, 0x18a);
var _0x3851 = function (_0x2280f5, _0x5649b4) {
  _0x2280f5 = _0x2280f5 - 0x0;
  var _0x6a3f3a = _0x3f41[_0x2280f5];
  return _0x6a3f3a;
};
UE["I18N"][_0x3851("0x0")] = {
  labelMap: {
    anchor: "锚点",
    undo: "撤销",
    redo: "重做",
    bold: "加粗",
    indent: _0x3851("0x1"),
    snapscreen: "截图",
    italic: "斜体",
    underline: _0x3851("0x2"),
    strikethrough: _0x3851("0x3"),
    subscript: "下标",
    fontborder: _0x3851("0x4"),
    fontcode: _0x3851("0x5"),
    superscript: "上标",
    formatmatch: _0x3851("0x6"),
    source: _0x3851("0x7"),
    blockquote: "引用",
    pasteplain: _0x3851("0x8"),
    selectall: "全选",
    print: "打印",
    preview: "预览",
    horizontal: "分隔线",
    removeformat: _0x3851("0x9"),
    time: "时间",
    date: "日期",
    unlink: _0x3851("0xa"),
    insertrow: _0x3851("0xb"),
    insertcol: _0x3851("0xc"),
    mergeright: _0x3851("0xd"),
    mergedown: _0x3851("0xe"),
    deleterow: _0x3851("0xf"),
    deletecol: _0x3851("0x10"),
    splittorows: _0x3851("0x11"),
    splittocols: _0x3851("0x12"),
    splittocells: _0x3851("0x13"),
    deletecaption: _0x3851("0x14"),
    inserttitle: _0x3851("0x15"),
    mergecells: _0x3851("0x16"),
    deletetable: "删除表格",
    cleardoc: _0x3851("0x17"),
    insertparagraph: _0x3851("0x18"),
    insertparagraphbeforetable: "表格前插入行",
    insertcode: _0x3851("0x19"),
    fontfamily: "字体",
    fontsize: _0x3851("0x1a"),
    paragraph: _0x3851("0x1b"),
    simpleupload: _0x3851("0x1c"),
    insertimage: _0x3851("0x1d"),
    edittable: _0x3851("0x1e"),
    edittd: _0x3851("0x1f"),
    link: "添加链接",
    emotion: "表情",
    spechars: _0x3851("0x20"),
    searchreplace: _0x3851("0x21"),
    map: _0x3851("0x22"),
    gmap: "Google地图",
    insertvideo: "视频",
    paragraghstyle: "段落样式",
    help: "帮助",
    justifyleft: _0x3851("0x23"),
    justifyright: "居右对齐",
    justifycenter: _0x3851("0x24"),
    justifyjustify: _0x3851("0x25"),
    forecolor: _0x3851("0x26"),
    backcolor: _0x3851("0x27"),
    insertorderedlist: _0x3851("0x28"),
    insertunorderedlist: _0x3851("0x29"),
    fullscreen: _0x3851("0x2a"),
    directionalityltr: "从左向右输入",
    directionalityrtl: "从右向左输入",
    rowspacingtop: _0x3851("0x2b"),
    rowspacingbottom: "段后距",
    pagebreak: "分页",
    insertframe: _0x3851("0x2c"),
    imagenone: "默认",
    imageleft: "左浮动",
    imageright: _0x3851("0x2d"),
    attachment: "附件",
    imagecenter: "居中",
    wordimage: "上传粘贴word内容中的图片",
    lineheight: _0x3851("0x2e"),
    letterspacing: _0x3851("0x2f"),
    outpadding: _0x3851("0x30"),
    edittip: _0x3851("0x31"),
    customstyle: _0x3851("0x32"),
    autotypeset: _0x3851("0x33"),
    webapp: "百度应用",
    touppercase: "字母大写",
    tolowercase: _0x3851("0x34"),
    background: "背景",
    template: "模板",
    scrawl: "涂鸦",
    music: "音乐",
    inserttable: _0x3851("0x35"),
    drafts: _0x3851("0x36"),
    charts: "图表",
    isLoading: _0x3851("0x37"),
    isSearching: "正在搜索……",
    confirmReplace: _0x3851("0x38"),
    imagescenter: _0x3851("0x39"),
    imgstyle: _0x3851("0x3a"),
  },
  insertorderedlist: {
    num: _0x3851("0x3b"),
    num1: _0x3851("0x3c"),
    num2: _0x3851("0x3d"),
    cn: "一,二,三....",
    cn1: _0x3851("0x3e"),
    cn2: _0x3851("0x3f"),
    decimal: _0x3851("0x3b"),
    "lower-alpha": _0x3851("0x40"),
    "lower-roman": "i,ii,iii...",
    "upper-alpha": _0x3851("0x41"),
    "upper-roman": _0x3851("0x42"),
  },
  insertunorderedlist: {
    circle: _0x3851("0x43"),
    disc: _0x3851("0x44"),
    square: _0x3851("0x45"),
    dash: _0x3851("0x46"),
    dot: _0x3851("0x47"),
  },
  paragraph: {
    p: "段落",
    h1: "一级标题",
    h2: _0x3851("0x48"),
    h3: _0x3851("0x49"),
    h4: _0x3851("0x4a"),
    h5: _0x3851("0x4b"),
    h6: _0x3851("0x4c"),
  },
  fontfamily: {
    songti: "宋体",
    kaiti: "楷体",
    heiti: "黑体",
    lishu: "隶书",
    yahei: "微软雅黑",
    andaleMono: _0x3851("0x4d"),
    arial: _0x3851("0x4e"),
    arialBlack: _0x3851("0x4f"),
    comicSansMs: _0x3851("0x50"),
    impact: "impact",
    timesNewRoman: "times\x20new\x20roman",
  },
  customstyle: {
    tc: _0x3851("0x51"),
    tl: _0x3851("0x52"),
    im: "强调",
    hi: _0x3851("0x53"),
  },
  autoupload: {
    exceedSizeError: "文件大小超出限制",
    exceedTypeError: "文件格式不允许",
    jsonEncodeError: _0x3851("0x54"),
    loading: _0x3851("0x55"),
    loadError: _0x3851("0x56"),
    errorLoadConfig: _0x3851("0x57"),
  },
  simpleupload: {
    exceedSizeError: _0x3851("0x58"),
    exceedTypeError: _0x3851("0x59"),
    jsonEncodeError: _0x3851("0x54"),
    loading: _0x3851("0x55"),
    loadError: "上传错误",
    errorLoadConfig: _0x3851("0x57"),
  },
  elementPathTip: _0x3851("0x5a"),
  wordCountTip: _0x3851("0x5b"),
  wordCountMsg: _0x3851("0x5c"),
  wordOverFlowMsg: _0x3851("0x5d"),
  ok: "确认",
  cancel: "取消",
  closeDialog: "关闭对话框",
  tableDrag: _0x3851("0x5e"),
  autofloatMsg: _0x3851("0x5f"),
  loadconfigError: _0x3851("0x60"),
  loadconfigFormatError: _0x3851("0x61"),
  loadconfigHttpError: _0x3851("0x62"),
  snapScreen_plugin: {
    browserMsg: _0x3851("0x63"),
    callBackErrorMsg: "服务器返回数据有误，请检查配置项之后重试。",
    uploadErrorMsg: "截图上传失败，请检查服务器端环境!\x20",
  },
  insertcode: {
    as3: _0x3851("0x64"),
    bash: _0x3851("0x65"),
    cpp: _0x3851("0x66"),
    css: _0x3851("0x67"),
    cf: _0x3851("0x68"),
    "c#": "C#",
    delphi: "Delphi",
    diff: _0x3851("0x69"),
    erlang: _0x3851("0x6a"),
    groovy: "Groovy",
    html: "HTML",
    java: _0x3851("0x6b"),
    jfx: _0x3851("0x6c"),
    js: _0x3851("0x6d"),
    pl: "Perl",
    php: _0x3851("0x6e"),
    plain: _0x3851("0x6f"),
    ps: _0x3851("0x70"),
    python: _0x3851("0x71"),
    ruby: _0x3851("0x72"),
    scala: _0x3851("0x73"),
    sql: _0x3851("0x74"),
    vb: _0x3851("0x75"),
    xml: _0x3851("0x76"),
  },
  confirmClear: "确定清空当前文档么？",
  contextMenu: {
    delete: "删除",
    selectall: "全选",
    deletecode: _0x3851("0x77"),
    cleardoc: _0x3851("0x17"),
    confirmclear: _0x3851("0x78"),
    unlink: _0x3851("0x79"),
    paragraph: _0x3851("0x1b"),
    edittable: _0x3851("0x1e"),
    aligntd: _0x3851("0x7a"),
    aligntable: _0x3851("0x7b"),
    tableleft: _0x3851("0x7c"),
    tablecenter: _0x3851("0x7d"),
    tableright: _0x3851("0x2d"),
    edittd: _0x3851("0x1f"),
    setbordervisible: _0x3851("0x7e"),
    justifyleft: _0x3851("0x7f"),
    justifyright: _0x3851("0x80"),
    justifycenter: _0x3851("0x24"),
    justifyjustify: "两端对齐",
    table: "表格",
    inserttable: "插入表格",
    deletetable: "删除表格",
    insertparagraphbefore: _0x3851("0x81"),
    insertparagraphafter: _0x3851("0x82"),
    deleterow: "删除当前行",
    deletecol: "删除当前列",
    insertrow: _0x3851("0xb"),
    insertcol: _0x3851("0x83"),
    insertrownext: _0x3851("0x84"),
    insertcolnext: _0x3851("0x85"),
    insertcaption: _0x3851("0x86"),
    deletecaption: _0x3851("0x87"),
    inserttitle: _0x3851("0x88"),
    deletetitle: _0x3851("0x89"),
    inserttitlecol: _0x3851("0x8a"),
    deletetitlecol: _0x3851("0x8b"),
    averageDiseRow: _0x3851("0x8c"),
    averageDisCol: _0x3851("0x8d"),
    mergeright: _0x3851("0x8e"),
    mergeleft: _0x3851("0x8f"),
    mergedown: "向下合并",
    mergecells: _0x3851("0x90"),
    splittocells: _0x3851("0x13"),
    splittocols: _0x3851("0x12"),
    splittorows: _0x3851("0x11"),
    tablesort: _0x3851("0x91"),
    enablesort: _0x3851("0x92"),
    disablesort: _0x3851("0x93"),
    reversecurrent: _0x3851("0x94"),
    orderbyasc: _0x3851("0x95"),
    reversebyasc: _0x3851("0x96"),
    orderbynum: _0x3851("0x97"),
    reversebynum: _0x3851("0x98"),
    borderbk: _0x3851("0x99"),
    setcolor: "表格隔行变色",
    unsetcolor: _0x3851("0x9a"),
    setbackground: "选区背景隔行",
    unsetbackground: _0x3851("0x9b"),
    redandblue: _0x3851("0x9c"),
    threecolorgradient: _0x3851("0x9d"),
    copy: _0x3851("0x9e"),
    copymsg: _0x3851("0x9f"),
    paste: _0x3851("0xa0"),
    pastemsg: "浏览器不支持,请使用\x20\x27Ctrl\x20+\x20v\x27",
  },
  copymsg: _0x3851("0x9f"),
  pastemsg: _0x3851("0xa1"),
  anthorMsg: "链接",
  clearColor: "清空颜色",
  standardColor: _0x3851("0xa2"),
  themeColor: _0x3851("0xa3"),
  property: "属性",
  default: "默认",
  modify: "修改",
  justifyleft: _0x3851("0x7f"),
  justifyright: _0x3851("0x80"),
  justifycenter: "居中",
  justify: "默认",
  changeImage: "换图",
  edit: "编辑",
  crop: "裁剪",
  radiusCircle: "圆形",
  imgSquare: "正方形",
  cancelRadius: _0x3851("0xa4"),
  ok: "确定",
  recentlyColor: _0x3851("0xa5"),
  clear: "清除",
  anchorMsg: "锚点",
  delete: "删除",
  clickToUpload: _0x3851("0xa6"),
  unset: "尚未设置语言文件",
  t_row: "行",
  t_col: "列",
  more: "更多",
  pasteOpt: "粘贴选项",
  pasteSourceFormat: "保留源格式",
  tagFormat: "只保留标签",
  pasteTextFormat: "只保留文本",
  autoTypeSet: {
    mergeLine: _0x3851("0xa7"),
    delLine: _0x3851("0xa8"),
    removeFormat: _0x3851("0x9"),
    indent: _0x3851("0x1"),
    alignment: _0x3851("0xa9"),
    imageFloat: _0x3851("0xaa"),
    removeFontsize: _0x3851("0xab"),
    removeFontFamily: _0x3851("0xac"),
    removeHtml: "清除冗余HTML代码",
    pasteFilter: _0x3851("0xad"),
    run: "执行",
    symbol: "符号转换",
    bdc2sb: _0x3851("0xae"),
    tobdc: _0x3851("0xaf"),
  },
  background: {
    static: {
      lang_background_normal: "背景设置",
      lang_background_local: _0x3851("0xb0"),
      lang_background_set: "选项",
      lang_background_none: _0x3851("0xb1"),
      lang_background_colored: _0x3851("0xb2"),
      lang_background_color: _0x3851("0xb3"),
      lang_background_netimg: _0x3851("0xb4"),
      lang_background_align: _0x3851("0xa9"),
      lang_background_position: _0x3851("0xb5"),
      repeatType: {
        options: ["居中", _0x3851("0xb6"), "纵向重复", "平铺", _0x3851("0xb7")],
      },
    },
    noUploadImage: "当前未上传过任何图片！",
    toggleSelect: _0x3851("0xb8"),
  },
  insertimage: {
    static: {
      lang_tab_remote: _0x3851("0xb9"),
      lang_tab_upload: _0x3851("0xba"),
      lang_tab_online: _0x3851("0xbb"),
      lang_tab_search: "图片搜索",
      lang_input_url: _0x3851("0xbc"),
      lang_input_size: _0x3851("0xbd"),
      lang_input_width: _0x3851("0xbe"),
      lang_input_height: _0x3851("0xbf"),
      lang_input_border: "边\x20框：",
      lang_input_vhspace: _0x3851("0xc0"),
      lang_input_title: _0x3851("0xc1"),
      lang_input_align: _0x3851("0xc2"),
      lang_imgLoading: "\u3000图片加载中……",
      lang_start_upload: _0x3851("0xc3"),
      lock: { title: _0x3851("0xc4") },
      searchType: {
        title: _0x3851("0xc5"),
        options: ["新闻", "壁纸", "表情", "头像"],
      },
      searchTxt: { value: "请输入搜索关键词" },
      searchBtn: { value: _0x3851("0xc6") },
      searchReset: { value: _0x3851("0xc7") },
      noneAlign: { title: "无浮动" },
      leftAlign: { title: _0x3851("0x7c") },
      rightAlign: { title: _0x3851("0x2d") },
      centerAlign: { title: _0x3851("0xc8") },
    },
    uploadSelectFile: _0x3851("0xc9"),
    uploadAddFile: _0x3851("0xca"),
    uploadStart: _0x3851("0xc3"),
    uploadPause: _0x3851("0xcb"),
    uploadContinue: "继续上传",
    uploadRetry: "重试上传",
    uploadDelete: "删除",
    uploadTurnLeft: _0x3851("0xcc"),
    uploadTurnRight: _0x3851("0xcd"),
    uploadPreview: _0x3851("0xce"),
    uploadNoPreview: "不能预览",
    updateStatusReady: _0x3851("0xcf"),
    updateStatusConfirm: "已成功上传_张照片，_张照片上传失败",
    updateStatusFinish: _0x3851("0xd0"),
    updateStatusError: _0x3851("0xd1"),
    errorNotSupport: _0x3851("0xd2"),
    errorLoadConfig: _0x3851("0x57"),
    errorExceedSize: _0x3851("0xd3"),
    errorFileType: _0x3851("0x59"),
    errorInterrupt: "文件传输中断",
    errorUploadRetry: _0x3851("0xd4"),
    errorHttp: _0x3851("0xd5"),
    errorServerUpload: "服务器返回出错",
    remoteLockError: _0x3851("0xd6"),
    numError: _0x3851("0xd7"),
    imageUrlError: _0x3851("0xd8"),
    imageLoadError: "图片加载失败！请检查链接地址或网络状态！",
    searchRemind: "请输入搜索关键词",
    searchLoading: _0x3851("0xd9"),
    searchRetry: _0x3851("0xda"),
  },
  attachment: {
    static: {
      lang_tab_upload: _0x3851("0xdb"),
      lang_tab_online: _0x3851("0xdc"),
      lang_start_upload: _0x3851("0xc3"),
      lang_drop_remind: _0x3851("0xdd"),
    },
    uploadSelectFile: "点击选择文件",
    uploadAddFile: "继续添加",
    uploadStart: _0x3851("0xc3"),
    uploadPause: _0x3851("0xcb"),
    uploadContinue: _0x3851("0xde"),
    uploadRetry: _0x3851("0xdf"),
    uploadDelete: "删除",
    uploadTurnLeft: "向左旋转",
    uploadTurnRight: _0x3851("0xcd"),
    uploadPreview: _0x3851("0xce"),
    updateStatusReady: _0x3851("0xe0"),
    updateStatusConfirm: _0x3851("0xe1"),
    updateStatusFinish: "共_个（_KB），_个上传成功",
    updateStatusError: _0x3851("0xd1"),
    errorNotSupport: _0x3851("0xd2"),
    errorLoadConfig: "后端配置项没有正常加载，上传插件不能正常使用！",
    errorExceedSize: "文件大小超出",
    errorFileType: _0x3851("0x59"),
    errorInterrupt: _0x3851("0xe2"),
    errorUploadRetry: _0x3851("0xd4"),
    errorHttp: _0x3851("0xd5"),
    errorServerUpload: _0x3851("0xe3"),
  },
  insertvideo: {
    static: {
      lang_tab_insertV: _0x3851("0xe4"),
      lang_tab_searchV: _0x3851("0xe5"),
      lang_tab_uploadV: _0x3851("0xe6"),
      lang_video_url: "视频网址",
      lang_video_size: _0x3851("0xe7"),
      lang_videoW: _0x3851("0xbe"),
      lang_videoH: _0x3851("0xbf"),
      lang_alignment: _0x3851("0xa9"),
      videoSearchTxt: { value: "请输入搜索关键字！" },
      videoType: {
        options: ["全部", "热门", "娱乐", "搞笑", "体育", "科技", "综艺"],
      },
      videoSearchBtn: { value: _0x3851("0xc6") },
      videoSearchReset: { value: _0x3851("0xe8") },
      lang_input_fileStatus: "\x20当前未上传文件",
      startUpload: { style: _0x3851("0xe9") },
      lang_upload_size: _0x3851("0xe7"),
      lang_upload_width: _0x3851("0xbe"),
      lang_upload_height: _0x3851("0xbf"),
      lang_upload_alignment: _0x3851("0xa9"),
      lang_format_advice: _0x3851("0xea"),
    },
    numError: _0x3851("0xeb"),
    floatLeft: _0x3851("0x7c"),
    floatRight: "右浮动",
    '"default"': "默认",
    block: _0x3851("0xec"),
    urlError: _0x3851("0xed"),
    loading: _0x3851("0xee"),
    clickToSelect: _0x3851("0xef"),
    goToSource: _0x3851("0xf0"),
    noVideo: _0x3851("0xf1"),
    browseFiles: "浏览文件",
    uploadSuccess: _0x3851("0xf2"),
    delSuccessFile: _0x3851("0xf3"),
    delFailSaveFile: "移除保存失败文件",
    statusPrompt: "\x20个文件已上传！\x20",
    flashVersionError: _0x3851("0xf4"),
    flashLoadingError: "Flash加载失败!请检查路径或网络状态",
    fileUploadReady: _0x3851("0xf5"),
    delUploadQueue: _0x3851("0xf6"),
    limitPrompt1: "单次不能选择超过",
    limitPrompt2: "个文件！请重新选择！",
    delFailFile: _0x3851("0xf7"),
    fileSizeLimit: _0x3851("0xf8"),
    emptyFile: "空文件无法上传！",
    fileTypeError: _0x3851("0xf9"),
    unknownError: "未知错误！",
    fileUploading: _0x3851("0xfa"),
    cancelUpload: _0x3851("0xfb"),
    netError: _0x3851("0xfc"),
    failUpload: "上传失败!",
    serverIOError: _0x3851("0xfd"),
    noAuthority: "无权限！",
    fileNumLimit: "上传个数限制",
    failCheck: _0x3851("0xfe"),
    fileCanceling: _0x3851("0xff"),
    stopUploading: _0x3851("0x100"),
    uploadSelectFile: _0x3851("0x101"),
    uploadAddFile: _0x3851("0xca"),
    uploadStart: _0x3851("0xc3"),
    uploadPause: _0x3851("0xcb"),
    uploadContinue: _0x3851("0xde"),
    uploadRetry: _0x3851("0xdf"),
    uploadDelete: "删除",
    uploadTurnLeft: _0x3851("0xcc"),
    uploadTurnRight: _0x3851("0xcd"),
    uploadPreview: "预览中",
    updateStatusReady: _0x3851("0xe0"),
    updateStatusConfirm: _0x3851("0x102"),
    updateStatusFinish: _0x3851("0x103"),
    updateStatusError: _0x3851("0xd1"),
    errorNotSupport: _0x3851("0xd2"),
    errorLoadConfig: _0x3851("0x57"),
    errorExceedSize: _0x3851("0xd3"),
    errorFileType: _0x3851("0x59"),
    errorInterrupt: "文件传输中断",
    errorUploadRetry: "上传失败，请重试",
    errorHttp: "http请求错误",
    errorServerUpload: _0x3851("0xe3"),
  },
  webapp: {
    tip1: _0x3851("0x104"),
    tip2: "申请完成之后请至ueditor.config.js中配置获得的appkey!\x20",
    applyFor: _0x3851("0x105"),
    anthorApi: _0x3851("0x106"),
  },
  template: {
    static: {
      lang_template_bkcolor: "背景颜色",
      lang_template_clear: _0x3851("0x107"),
      lang_template_select: "选择模板",
    },
    blank: "空白文档",
    blog: _0x3851("0x108"),
    resume: "个人简历",
    richText: _0x3851("0x109"),
    sciPapers: "科技论文",
  },
  scrawl: {
    static: {
      lang_input_previousStep: _0x3851("0x10a"),
      lang_input_nextsStep: _0x3851("0x10b"),
      lang_input_clear: "清空",
      lang_input_addPic: _0x3851("0x10c"),
      lang_input_ScalePic: "缩放背景",
      lang_input_removePic: _0x3851("0x10d"),
      J_imgTxt: { title: _0x3851("0x10e") },
    },
    noScarwl: _0x3851("0x10f"),
    scrawlUpLoading: _0x3851("0x110"),
    continueBtn: "继续",
    imageError: _0x3851("0x111"),
    backgroundUploading: "背景图片上传中,别急哦~",
  },
  music: {
    static: {
      lang_input_tips: _0x3851("0x112"),
      J_searchBtn: { value: _0x3851("0x113") },
    },
    emptyTxt: _0x3851("0x114"),
    chapter: "歌曲",
    singer: "歌手",
    special: "专辑",
    listenTest: "试听",
  },
  anchor: { static: { lang_input_anchorName: _0x3851("0x115") } },
  charts: {
    static: {
      lang_data_source: _0x3851("0x116"),
      lang_chart_format: _0x3851("0x117"),
      lang_data_align: "数据对齐方式",
      lang_chart_align_same: _0x3851("0x118"),
      lang_chart_align_reverse: _0x3851("0x119"),
      lang_chart_title: _0x3851("0x11a"),
      lang_chart_main_title: _0x3851("0x11b"),
      lang_chart_sub_title: _0x3851("0x11c"),
      lang_chart_x_title: _0x3851("0x11d"),
      lang_chart_y_title: _0x3851("0x11e"),
      lang_chart_tip: _0x3851("0x11f"),
      lang_cahrt_tip_prefix: _0x3851("0x120"),
      lang_cahrt_tip_description: _0x3851("0x121"),
      lang_chart_data_unit: "数据单位",
      lang_chart_data_unit_title: _0x3851("0x122"),
      lang_chart_data_unit_description: _0x3851("0x123"),
      lang_chart_type: _0x3851("0x124"),
      lang_prev_btn: _0x3851("0x125"),
      lang_next_btn: _0x3851("0x126"),
    },
  },
  emotion: {
    static: {
      lang_input_choice: "精选",
      lang_input_Tuzki: _0x3851("0x127"),
      lang_input_BOBO: _0x3851("0x128"),
      lang_input_lvdouwa: _0x3851("0x129"),
      lang_input_babyCat: _0x3851("0x12a"),
      lang_input_bubble: "泡泡",
      lang_input_youa: "有啊",
    },
  },
  gmap: {
    static: {
      lang_input_address: "地址",
      lang_input_search: "搜索",
      address: { value: "北京" },
    },
    searchError: _0x3851("0x12b"),
  },
  help: {
    static: {
      lang_input_about: _0x3851("0x12c"),
      lang_input_shortcuts: _0x3851("0x12d"),
      lang_input_introduction: _0x3851("0x12e"),
      lang_Txt_shortcuts: _0x3851("0x12d"),
      lang_Txt_func: "功能",
      lang_Txt_bold: "给选中字设置为加粗",
      lang_Txt_copy: _0x3851("0x12f"),
      lang_Txt_cut: "剪切选中内容",
      lang_Txt_Paste: "粘贴",
      lang_Txt_undo: _0x3851("0x130"),
      lang_Txt_redo: "撤销上一次操作",
      lang_Txt_italic: _0x3851("0x131"),
      lang_Txt_underline: _0x3851("0x132"),
      lang_Txt_selectAll: _0x3851("0x133"),
      lang_Txt_visualEnter: "软回车",
      lang_Txt_fullscreen: "全屏",
    },
  },
  insertframe: {
    static: {
      lang_input_address: "地址：",
      lang_input_width: "宽\x20度：：",
      lang_input_height: _0x3851("0x134"),
      lang_input_isScroll: _0x3851("0x135"),
      lang_input_frameborder: _0x3851("0x136"),
      lang_input_alignMode: "对齐方式：",
      align: {
        title: _0x3851("0xa9"),
        options: ["默认", _0x3851("0x7f"), _0x3851("0x80"), "居中"],
      },
    },
    enterAddress: _0x3851("0x137"),
  },
  link: {
    static: {
      lang_input_text: _0x3851("0x138"),
      lang_input_url: "链接地址：",
      lang_input_title: _0x3851("0x139"),
      lang_input_target: _0x3851("0x13a"),
    },
    validLink: _0x3851("0x13b"),
    httpPrompt: _0x3851("0x13c"),
  },
  map: {
    static: {
      lang_city: "城市",
      lang_address: "地址",
      city: { value: "北京" },
      lang_search: "搜索",
      lang_dynamicmap: _0x3851("0x13d"),
    },
    cityMsg: _0x3851("0x13e"),
    errorMsg: _0x3851("0x13f"),
  },
  searchreplace: {
    static: {
      lang_tab_search: "查找",
      lang_tab_replace: "替换",
      lang_search1: "查找",
      lang_search2: "查找",
      lang_replace: "替换",
      lang_searchReg:
        "支持正则表达式，添加前后斜杠标示为正则表达式，例如“/表达式/”",
      lang_searchReg1: _0x3851("0x140"),
      lang_case_sensitive1: _0x3851("0x141"),
      lang_case_sensitive2: _0x3851("0x141"),
      nextFindBtn: { value: _0x3851("0x126") },
      preFindBtn: { value: _0x3851("0x125") },
      nextReplaceBtn: { value: _0x3851("0x126") },
      preReplaceBtn: { value: "上一个" },
      repalceBtn: { value: "替换" },
      repalceAllBtn: { value: _0x3851("0x142") },
    },
    getEnd: _0x3851("0x143"),
    getStart: _0x3851("0x144"),
    countMsg: "总共替换了{#count}处！",
  },
  snapscreen: {
    static: {
      lang_showMsg: _0x3851("0x145"),
      lang_download: _0x3851("0x146"),
      lang_step1: _0x3851("0x147"),
      lang_step2: _0x3851("0x148"),
    },
  },
  spechars: {
    static: {},
    tsfh: _0x3851("0x20"),
    lmsz: _0x3851("0x149"),
    szfh: _0x3851("0x14a"),
    rwfh: _0x3851("0x14b"),
    xlzm: _0x3851("0x14c"),
    ewzm: _0x3851("0x14d"),
    pyzm: _0x3851("0x14e"),
    yyyb: "英语音标",
    zyzf: "其他",
  },
  edittable: {
    static: {
      lang_tableStyle: _0x3851("0x14f"),
      lang_insertCaption: "添加表格名称行",
      lang_insertTitle: _0x3851("0x150"),
      lang_insertTitleCol: _0x3851("0x151"),
      lang_orderbycontent: _0x3851("0x152"),
      lang_tableSize: "自动调整表格尺寸",
      lang_autoSizeContent: _0x3851("0x153"),
      lang_autoSizePage: "按页面宽\x20度：自适应",
      lang_example: "示例",
      lang_borderStyle: "表格边框",
      lang_color: "颜色:",
    },
    captionName: _0x3851("0x154"),
    titleName: "标题",
    cellsName: "内容",
    errorMsg: _0x3851("0x155"),
  },
  edittip: {
    static: { lang_delRow: _0x3851("0x156"), lang_delCol: _0x3851("0x157") },
  },
  edittd: { static: { lang_tdBkColor: _0x3851("0x158") } },
  formula: { static: {} },
  wordimage: {
    static: {
      lang_resave: "转存步骤",
      uploadBtn: { src: "upload.png", alt: "上传" },
      clipboard: { style: _0x3851("0x159") },
      lang_step: _0x3851("0x15a"),
    },
    fileType: "图片",
    flashError: _0x3851("0x15b"),
    netError: _0x3851("0x15c"),
    copySuccess: _0x3851("0x15d"),
    flashI18n: {},
  },
  autosave: { saving: "保存中...", success: _0x3851("0x15e") },
};
(function (_0x422226, _0x58f098, _0x154c80, _0x1325d4) {
  jQuery(function () {
    _0x422226["fn"]["Tdrag"] = function (_0x5b91d3) {
      var _0x3d3853 = {
        scope: null,
        grid: null,
        axis: _0x3851("0x15f"),
        pos: ![],
        handle: null,
        moveClass: _0x3851("0x160"),
        dragChange: ![],
        changeMode: "point",
        cbStart: function () {},
        cbMove: function () {},
        cbEnd: function () {},
        random: ![],
        randomInput: null,
        animation_options: { duration: 0x320, easing: _0x3851("0x161") },
        disable: ![],
        disableInput: null,
      };
      var _0x395166 = new _0x3cc028(this, _0x5b91d3);
      if (_0x5b91d3 && _0x422226[_0x3851("0x162")](_0x5b91d3) == ![]) {
        _0x395166[_0x3851("0x163")] = _0x422226["extend"](_0x3d3853, _0x5b91d3);
      } else {
        _0x395166[_0x3851("0x163")] = _0x3d3853;
      }
      _0x395166["firstRandom"] = !![];
      var _0x3829a8 = _0x395166[_0x3851("0x164")];
      _0x395166[_0x3851("0x165")](_0x3829a8, ![]);
      if (_0x395166[_0x3851("0x163")]["randomInput"] != null) {
        _0x422226(_0x395166["options"][_0x3851("0x166")])["bind"](
          _0x3851("0x167"),
          function () {
            _0x395166[_0x3851("0x165")](_0x3829a8, !![]);
          }
        );
      }
      _0x395166[_0x3851("0x168")]();
    };
    var _0x3cc028 = function (_0x49173b, _0x56a887) {
      this["$element"] = _0x49173b;
      this[_0x3851("0x163")] = _0x56a887;
    };
    _0x3cc028[_0x3851("0x169")] = {
      init: function (_0x741544) {
        var _0x270614 = this;
        _0x270614[_0x3851("0x16a")] = _0x270614["$element"];
        _0x270614[_0x3851("0x16b")] = _0x422226(_0x741544);
        _0x270614[_0x3851("0x163")] = _0x270614["options"];
        _0x270614[_0x3851("0x16c")] =
          _0x270614[_0x3851("0x163")][_0x3851("0x16c")];
        _0x270614[_0x3851("0x16d")] = ![];
        _0x270614["_move"] = ![];
        _0x270614[_0x3851("0x16e")] = ![];
        _0x270614[_0x3851("0x16f")] = 0x0;
        _0x270614["disY"] = 0x0;
        _0x270614[_0x3851("0x170")] = 0x3e8;
        _0x270614[_0x3851("0x171")] = ![];
        _0x270614[_0x3851("0x172")] = "";
        _0x270614["box"] =
          _0x422226[_0x3851("0x173")](
            _0x270614[_0x3851("0x163")][_0x3851("0x174")]
          ) === _0x3851("0x175")
            ? _0x270614["options"][_0x3851("0x174")]
            : null;
        if (_0x270614["options"][_0x3851("0x16b")] != null) {
          _0x270614["handle"] = _0x422226(_0x741544)[_0x3851("0x176")](
            _0x270614["options"]["handle"]
          );
        }
        _0x270614["handle"]["on"](_0x3851("0x177"), function (_0x1da867) {
          var _0x2d1cf8 =
            _0x1da867[_0x3851("0x178")] || _0x1da867["srcElement"];
          if (
            _0x2d1cf8[_0x3851("0x179")] == "A" ||
            _0x2d1cf8["tagName"] == _0x3851("0x17a") ||
            _0x2d1cf8[_0x3851("0x179")] == _0x3851("0x17b") ||
            _0x2d1cf8["tagName"] == _0x3851("0x17c") ||
            _0x422226(_0x2d1cf8)[_0x3851("0x17d")](_0x3851("0x17e"))["length"] >
              0x0
          ) {
            console["log"](_0x2d1cf8[_0x3851("0x179")] + "\x20skiped");
            return;
          }
          _0x270614[_0x3851("0x17f")](_0x1da867, _0x741544);
          _0x741544[_0x3851("0x180")] && _0x741544[_0x3851("0x180")]();
          return ![];
        });
        if (_0x270614[_0x3851("0x163")][_0x3851("0x181")]) {
          _0x422226(_0x741544)["on"]("mousemove", function (_0x437962) {
            _0x270614["move"](_0x437962, _0x741544);
          });
          _0x422226(_0x741544)["on"](_0x3851("0x182"), function (_0x4793fb) {
            _0x270614[_0x3851("0x183")](_0x4793fb, _0x741544);
          });
        } else {
          _0x422226(_0x154c80)["on"]("mousemove", function (_0x218db5) {
            _0x270614[_0x3851("0x184")](_0x218db5, _0x741544);
          });
          _0x422226(_0x154c80)["on"]("mouseup", function (_0x51426b) {
            _0x270614[_0x3851("0x183")](_0x51426b, _0x741544);
          });
        }
      },
      loadJqueryfn: function () {
        var _0x1a759b = this;
        _0x422226[_0x3851("0x185")]({
          sortBox: function (_0x6990fb) {
            var _0xb8293f = [];
            for (
              var _0x16d9cc = 0x0;
              _0x16d9cc < _0x422226(_0x6990fb)["length"];
              _0x16d9cc++
            ) {
              _0xb8293f[_0x3851("0x186")](
                _0x422226(_0x6990fb)["eq"](_0x16d9cc)
              );
            }
            for (
              var _0x1e536d = 0x0;
              _0x1e536d < _0xb8293f[_0x3851("0x187")];
              _0x1e536d++
            ) {
              for (
                var _0x26a86b = _0x1e536d + 0x1;
                _0x26a86b < _0xb8293f[_0x3851("0x187")];
                _0x26a86b++
              ) {
                if (
                  Number(
                    _0xb8293f[_0x1e536d][_0x3851("0x188")](_0x3851("0x189"))
                  ) > Number(_0xb8293f[_0x26a86b][_0x3851("0x188")]("index"))
                ) {
                  var _0x5d3ad4 = _0xb8293f[_0x1e536d];
                  _0xb8293f[_0x1e536d] = _0xb8293f[_0x26a86b];
                  _0xb8293f[_0x26a86b] = _0x5d3ad4;
                }
              }
            }
            return _0xb8293f;
          },
          randomfn: function (_0x16b6e0) {
            _0x1a759b[_0x3851("0x165")](_0x422226(_0x16b6e0), !![]);
          },
          disable_open: function () {
            _0x1a759b[_0x3851("0x16c")] = ![];
          },
          disable_cloose: function () {
            _0x1a759b[_0x3851("0x16c")] = !![];
          },
        });
      },
      toDisable: function () {
        var _0x57f808 = this;
        if (_0x57f808["options"]["disableInput"] != null) {
          _0x422226(_0x57f808[_0x3851("0x163")][_0x3851("0x18a")])[
            _0x3851("0x18b")
          ](_0x3851("0x167"), function () {
            if (_0x57f808[_0x3851("0x16c")] == !![]) {
              _0x57f808[_0x3851("0x16c")] = ![];
            } else {
              _0x57f808["disable"] = !![];
            }
          });
        }
      },
      start: function (_0x5b3fa2, _0x113817) {
        var _0x11bac7 = this;
        _0x11bac7[_0x3851("0x18c")] = _0x113817;
        if (_0x11bac7[_0x3851("0x16c")] == !![]) {
          return ![];
        }
        _0x11bac7[_0x3851("0x16d")] = !![];
        var _0x1e22c6 = _0x5b3fa2 || event;
        _0x11bac7[_0x3851("0x16f")] =
          _0x1e22c6[_0x3851("0x18d")] - _0x113817["offsetLeft"];
        _0x11bac7[_0x3851("0x18e")] =
          _0x1e22c6[_0x3851("0x18f")] - _0x113817[_0x3851("0x190")];
        _0x11bac7[_0x3851("0x163")][_0x3851("0x191")]();
      },
      move: function (_0x2736f9, _0x3f28fc) {
        var _0x25dd70 = this;
        if (_0x25dd70[_0x3851("0x16d")] != !![]) {
          return ![];
        }
        if (_0x3f28fc != _0x25dd70[_0x3851("0x18c")]) {
          return ![];
        }
        _0x25dd70[_0x3851("0x192")] = !![];
        var _0x510ed6 = _0x2736f9 || event;
        var _0x47f347 =
          _0x510ed6[_0x3851("0x18d")] - _0x25dd70[_0x3851("0x16f")];
        var _0x142843 =
          _0x510ed6[_0x3851("0x18f")] - _0x25dd70[_0x3851("0x18e")];
        if (_0x25dd70["box"] != null) {
          var _0x40825b = _0x25dd70[_0x3851("0x193")](
            _0x3f28fc,
            _0x25dd70["box"]
          );
          if (_0x47f347 > _0x40825b["lmax"]) {
            _0x47f347 = _0x40825b[_0x3851("0x194")];
          } else if (_0x47f347 < _0x40825b[_0x3851("0x195")]) {
            _0x47f347 = _0x40825b[_0x3851("0x195")];
          }
          if (_0x142843 > _0x40825b[_0x3851("0x196")]) {
            _0x142843 = _0x40825b[_0x3851("0x196")];
          } else if (_0x142843 < _0x40825b[_0x3851("0x197")]) {
            _0x142843 = _0x40825b[_0x3851("0x197")];
          }
        }
        if (_0x25dd70[_0x3851("0x163")][_0x3851("0x198")] == _0x3851("0x15f")) {
          _0x3f28fc["style"][_0x3851("0x199")] =
            _0x25dd70[_0x3851("0x19a")](_0x3f28fc, _0x47f347, _0x142843)[
              _0x3851("0x199")
            ] + "px";
          _0x3f28fc[_0x3851("0x19b")][_0x3851("0x19c")] =
            _0x25dd70[_0x3851("0x19a")](_0x3f28fc, _0x47f347, _0x142843)[
              _0x3851("0x19c")
            ] + "px";
        } else if (_0x25dd70["options"][_0x3851("0x198")] == "y") {
          _0x3f28fc[_0x3851("0x19b")]["top"] =
            _0x25dd70[_0x3851("0x19a")](_0x3f28fc, _0x47f347, _0x142843)[
              _0x3851("0x19c")
            ] + "px";
        } else if (_0x25dd70[_0x3851("0x163")][_0x3851("0x198")] == "x") {
          _0x3f28fc[_0x3851("0x19b")]["left"] =
            _0x25dd70[_0x3851("0x19a")](_0x3f28fc, _0x47f347, _0x142843)[
              "left"
            ] + "px";
        }
        if (_0x25dd70[_0x3851("0x163")][_0x3851("0x19d")] == !![]) {
          _0x25dd70[_0x3851("0x19e")](_0x3f28fc);
        }
        _0x25dd70[_0x3851("0x163")][_0x3851("0x19f")](_0x3f28fc, _0x25dd70);
      },
      end: function (_0x157ca1, _0x36fc6a) {
        var _0x2396d1 = this;
        if (_0x2396d1[_0x3851("0x16d")] != !![]) {
          return ![];
        }
        if (
          _0x2396d1["options"][_0x3851("0x1a0")] == _0x3851("0x1a1") &&
          _0x2396d1["options"][_0x3851("0x19d")] == !![]
        ) {
          _0x2396d1[_0x3851("0x1a2")](_0x36fc6a);
        } else if (
          _0x2396d1[_0x3851("0x163")][_0x3851("0x1a0")] == _0x3851("0x1a3") &&
          _0x2396d1[_0x3851("0x163")][_0x3851("0x19d")] == !![]
        ) {
          _0x2396d1["pointDrag"](_0x36fc6a);
        }
        if (_0x2396d1["options"]["pos"] == !![]) {
          _0x2396d1[_0x3851("0x1a4")](
            _0x36fc6a,
            _0x2396d1[_0x3851("0x1a5")][
              _0x422226(_0x36fc6a)["attr"](_0x3851("0x189"))
            ]
          );
        }
        _0x2396d1[_0x3851("0x163")][_0x3851("0x1a6")]();
        if (_0x2396d1[_0x3851("0x163")][_0x3851("0x16b")] != null) {
          _0x422226(_0x36fc6a)
            [_0x3851("0x176")](_0x2396d1["options"][_0x3851("0x16b")])
            [_0x3851("0x1a7")]("onmousemove");
          _0x422226(_0x36fc6a)
            [_0x3851("0x176")](_0x2396d1["options"][_0x3851("0x16b")])
            [_0x3851("0x1a7")]("onmouseup");
        } else {
          _0x422226(_0x36fc6a)[_0x3851("0x1a7")](_0x3851("0x1a8"));
          _0x422226(_0x36fc6a)["unbind"]("onmouseup");
        }
        _0x36fc6a["releaseCapture"] && _0x36fc6a[_0x3851("0x1a9")]();
        _0x2396d1[_0x3851("0x16d")] = ![];
      },
      collTestBox: function (_0x285415, _0x5d0dc9) {
        var _0x567972 = this;
        var _0x3e6308 = 0x0;
        var _0x5a3485 = 0x0;
        var _0x468b51 =
          _0x422226(_0x5d0dc9)[_0x3851("0x1aa")]() -
          _0x422226(_0x285415)["outerWidth"]();
        var _0x595704 =
          _0x422226(_0x5d0dc9)[_0x3851("0x1ab")]() -
          _0x422226(_0x285415)[_0x3851("0x1ac")]();
        return {
          lmin: _0x3e6308,
          tmin: _0x5a3485,
          lmax: _0x468b51,
          tmax: _0x595704,
        };
      },
      grid: function (_0x35b5f8, _0x22ffcf, _0x37fbb7) {
        var _0x177392 = this;
        var _0x5c1bd6 = { left: _0x22ffcf, top: _0x37fbb7 };
        if (
          _0x422226[_0x3851("0x1ad")](
            _0x177392[_0x3851("0x163")][_0x3851("0x19a")]
          ) &&
          _0x177392["options"]["grid"]["length"] == 0x2
        ) {
          var _0x4edbe1 = _0x177392[_0x3851("0x163")]["grid"][0x0];
          var _0x26eec9 = _0x177392[_0x3851("0x163")][_0x3851("0x19a")][0x1];
          _0x5c1bd6["left"] =
            Math[_0x3851("0x1ae")]((_0x22ffcf + _0x4edbe1 / 0x2) / _0x4edbe1) *
            _0x4edbe1;
          _0x5c1bd6["top"] =
            Math[_0x3851("0x1ae")]((_0x37fbb7 + _0x26eec9 / 0x2) / _0x26eec9) *
            _0x26eec9;
          return _0x5c1bd6;
        } else if (_0x177392[_0x3851("0x163")][_0x3851("0x19a")] == null) {
          return _0x5c1bd6;
        } else {
          console[_0x3851("0x1af")](_0x3851("0x1b0"));
          return ![];
        }
      },
      findNearest: function (_0x3836c4) {
        var _0x13f68b = this;
        var _0x58f6d9 = new Date()["getTime"]();
        var _0x103d0f = -0x1;
        var _0x708b2d = _0x13f68b[_0x3851("0x16a")];
        for (
          var _0x25f64e = 0x0;
          _0x25f64e < _0x708b2d[_0x3851("0x187")];
          _0x25f64e++
        ) {
          if (_0x3836c4 == _0x708b2d[_0x25f64e]) {
            continue;
          }
          if (_0x13f68b["collTest"](_0x3836c4, _0x708b2d[_0x25f64e])) {
            var _0x4c95ca = _0x13f68b[_0x3851("0x1b1")](
              _0x3836c4,
              _0x708b2d[_0x25f64e]
            );
            if (_0x4c95ca < _0x58f6d9) {
              _0x58f6d9 = _0x4c95ca;
              _0x103d0f = _0x25f64e;
            }
          }
        }
        if (_0x103d0f == -0x1) {
          return null;
        } else {
          return _0x708b2d[_0x103d0f];
        }
      },
      getDis: function (_0x4ba899, _0x5c80c9) {
        var _0x7624f7 = this;
        var _0x1de85c =
          _0x4ba899[_0x3851("0x1b2")] + _0x4ba899[_0x3851("0x1b3")] / 0x2;
        var _0x10087c =
          _0x5c80c9["offsetLeft"] + _0x5c80c9[_0x3851("0x1b3")] / 0x2;
        var _0x550a76 =
          _0x4ba899[_0x3851("0x190")] + _0x4ba899[_0x3851("0x1b4")] / 0x2;
        var _0x5f0a0f =
          _0x5c80c9[_0x3851("0x190")] + _0x5c80c9[_0x3851("0x1b4")] / 0x2;
        var _0x54dd13 = _0x10087c - _0x1de85c;
        var _0x58a25e = _0x550a76 - _0x5f0a0f;
        return Math["sqrt"](_0x54dd13 * _0x54dd13 + _0x58a25e * _0x58a25e);
      },
      collTest: function (_0xc82c2d, _0x3d0944) {
        var _0x219775 = this;
        var _0x436ab1 = _0xc82c2d[_0x3851("0x1b2")];
        var _0x399198 = _0xc82c2d["offsetLeft"] + _0xc82c2d["offsetWidth"];
        var _0x1930a7 = _0xc82c2d["offsetTop"];
        var _0x2eb9f6 =
          _0xc82c2d[_0x3851("0x190")] + _0xc82c2d[_0x3851("0x1b4")];
        var _0x309df5 = _0x3d0944["offsetLeft"];
        var _0x59c759 =
          _0x3d0944[_0x3851("0x1b2")] + _0x3d0944[_0x3851("0x1b3")];
        var _0x5b047e = _0x3d0944[_0x3851("0x190")];
        var _0x5d0df1 =
          _0x3d0944[_0x3851("0x190")] + _0x3d0944[_0x3851("0x1b4")];
        if (
          _0x399198 < _0x309df5 ||
          _0x59c759 < _0x436ab1 ||
          _0x5b047e > _0x2eb9f6 ||
          _0x5d0df1 < _0x1930a7
        ) {
          return ![];
        } else {
          return !![];
        }
      },
      pack: function (_0x1b97be, _0xa8ce29) {
        var _0x3af23a = this;
        _0x3af23a["toDisable"]();
        if (_0x3af23a[_0x3851("0x163")][_0x3851("0x19d")] == ![]) {
          for (
            var _0x559442 = 0x0;
            _0x559442 < _0x1b97be[_0x3851("0x187")];
            _0x559442++
          ) {
            _0x422226(_0x1b97be[_0x559442])["css"](
              _0x3851("0x1b5"),
              "absolute"
            );
            _0x422226(_0x1b97be[_0x559442])[_0x3851("0x1b6")](
              _0x3851("0x1b7"),
              "0"
            );
            _0x3af23a["init"](_0x1b97be[_0x559442]);
          }
        } else if (_0x3af23a[_0x3851("0x163")][_0x3851("0x19d")] == !![]) {
          var _0x159489 = [];
          if (_0x3af23a["options"]["random"] || _0xa8ce29) {
            while (_0x159489["length"] < _0x1b97be[_0x3851("0x187")]) {
              var _0x3a3a28 = _0x3af23a[_0x3851("0x1b8")](
                0x0,
                _0x1b97be[_0x3851("0x187")]
              );
              if (!_0x3af23a["finInArr"](_0x159489, _0x3a3a28)) {
                _0x159489[_0x3851("0x186")](_0x3a3a28);
              }
            }
          }
          if (
            _0x3af23a[_0x3851("0x163")][_0x3851("0x1b9")] == ![] ||
            _0xa8ce29 != !![]
          ) {
            var _0x3a3a28 = 0x0;
            while (_0x159489[_0x3851("0x187")] < _0x1b97be[_0x3851("0x187")]) {
              _0x159489["push"](_0x3a3a28);
              _0x3a3a28++;
            }
          }
          if (_0x3af23a[_0x3851("0x1ba")] == ![]) {
            var _0x4c758b = [];
            var _0x3a3a28 = 0x0;
            while (_0x4c758b["length"] < _0x1b97be[_0x3851("0x187")]) {
              _0x4c758b[_0x3851("0x186")](_0x3a3a28);
              _0x3a3a28++;
            }
            for (
              var _0x559442 = 0x0;
              _0x559442 < _0x1b97be[_0x3851("0x187")];
              _0x559442++
            ) {
              _0x422226(_0x1b97be[_0x559442])[_0x3851("0x188")](
                "index",
                _0x4c758b[_0x559442]
              );
              _0x422226(_0x1b97be[_0x559442])[_0x3851("0x1b6")](
                _0x3851("0x199"),
                _0x3af23a[_0x3851("0x1a5")][_0x4c758b[_0x559442]][
                  _0x3851("0x199")
                ]
              );
              _0x422226(_0x1b97be[_0x559442])[_0x3851("0x1b6")](
                _0x3851("0x19c"),
                _0x3af23a["aPos"][_0x4c758b[_0x559442]][_0x3851("0x19c")]
              );
            }
          }
          _0x3af23a[_0x3851("0x1a5")] = [];
          if (_0x3af23a[_0x3851("0x1ba")] == ![]) {
            for (
              var _0x8c61a6 = 0x0;
              _0x8c61a6 < _0x1b97be[_0x3851("0x187")];
              _0x8c61a6++
            ) {
              _0x3af23a[_0x3851("0x1a5")][_0x8c61a6] = {
                left:
                  _0x1b97be[
                    _0x422226(_0x1b97be)
                      ["eq"](_0x8c61a6)
                      [_0x3851("0x188")](_0x3851("0x189"))
                  ][_0x3851("0x1b2")],
                top:
                  _0x1b97be[
                    _0x422226(_0x1b97be)
                      ["eq"](_0x8c61a6)
                      [_0x3851("0x188")](_0x3851("0x189"))
                  ][_0x3851("0x190")],
              };
            }
          } else {
            for (
              var _0x8c61a6 = 0x0;
              _0x8c61a6 < _0x1b97be[_0x3851("0x187")];
              _0x8c61a6++
            ) {
              _0x3af23a[_0x3851("0x1a5")][_0x8c61a6] = {
                left: _0x1b97be[_0x8c61a6][_0x3851("0x1b2")],
                top: _0x1b97be[_0x8c61a6]["offsetTop"],
              };
            }
          }
          for (
            var _0x559442 = 0x0;
            _0x559442 < _0x1b97be[_0x3851("0x187")];
            _0x559442++
          ) {
            _0x422226(_0x1b97be[_0x559442])["attr"](
              _0x3851("0x189"),
              _0x159489[_0x559442]
            );
            _0x422226(_0x1b97be[_0x559442])[_0x3851("0x1b6")](
              _0x3851("0x199"),
              _0x3af23a[_0x3851("0x1a5")][_0x159489[_0x559442]][
                _0x3851("0x199")
              ]
            );
            _0x422226(_0x1b97be[_0x559442])["css"](
              "top",
              _0x3af23a["aPos"][_0x159489[_0x559442]]["top"]
            );
            _0x422226(_0x1b97be[_0x559442])["css"](
              "position",
              _0x3851("0x1bb")
            );
            _0x422226(_0x1b97be[_0x559442])[_0x3851("0x1b6")]("margin", "0");
            _0x3af23a["init"](_0x1b97be[_0x559442]);
          }
          _0x3af23a[_0x3851("0x1ba")] = ![];
        }
      },
      moveAddClass: function (_0x51e7f6) {
        var _0x493144 = this;
        var _0x173126 = _0x493144["findNearest"](_0x51e7f6);
        _0x422226(_0x493144[_0x3851("0x164")])["removeClass"](
          _0x493144[_0x3851("0x163")][_0x3851("0x1bc")]
        );
        if (
          _0x173126 &&
          _0x422226(_0x173126)[_0x3851("0x1bd")](
            _0x493144[_0x3851("0x163")][_0x3851("0x1bc")]
          ) == ![]
        ) {
          _0x422226(_0x173126)["addClass"](
            _0x493144[_0x3851("0x163")][_0x3851("0x1bc")]
          );
        }
      },
      sort: function () {
        var _0x5b7281 = this;
        var _0x57ec4a = [];
        for (
          var _0x102372 = 0x0;
          _0x102372 < _0x5b7281[_0x3851("0x164")][_0x3851("0x187")];
          _0x102372++
        ) {
          _0x57ec4a[_0x3851("0x186")](_0x5b7281[_0x3851("0x164")][_0x102372]);
        }
        for (
          var _0x22a099 = 0x0;
          _0x22a099 < _0x57ec4a[_0x3851("0x187")];
          _0x22a099++
        ) {
          for (
            var _0x308855 = _0x22a099 + 0x1;
            _0x308855 < _0x57ec4a[_0x3851("0x187")];
            _0x308855++
          ) {
            if (
              Number(
                _0x422226(_0x57ec4a[_0x22a099])[_0x3851("0x188")]("index")
              ) >
              Number(
                _0x422226(_0x57ec4a[_0x308855])[_0x3851("0x188")](
                  _0x3851("0x189")
                )
              )
            ) {
              var _0x555898 = _0x57ec4a[_0x22a099];
              _0x57ec4a[_0x22a099] = _0x57ec4a[_0x308855];
              _0x57ec4a[_0x308855] = _0x555898;
            }
          }
        }
        return _0x57ec4a;
      },
      pointDrag: function (_0x1f26ce) {
        var _0x40e959 = this;
        var _0x46c703 = _0x40e959[_0x3851("0x1be")](_0x1f26ce);
        if (_0x46c703) {
          _0x40e959[_0x3851("0x1a4")](
            _0x1f26ce,
            _0x40e959[_0x3851("0x1a5")][
              _0x422226(_0x46c703)["attr"](_0x3851("0x189"))
            ]
          );
          _0x40e959[_0x3851("0x1a4")](
            _0x46c703,
            _0x40e959[_0x3851("0x1a5")][
              _0x422226(_0x1f26ce)[_0x3851("0x188")](_0x3851("0x189"))
            ]
          );
          var _0x40241e;
          _0x40241e = _0x422226(_0x1f26ce)[_0x3851("0x188")](_0x3851("0x189"));
          _0x422226(_0x1f26ce)[_0x3851("0x188")](
            _0x3851("0x189"),
            _0x422226(_0x46c703)[_0x3851("0x188")](_0x3851("0x189"))
          );
          _0x422226(_0x46c703)[_0x3851("0x188")](_0x3851("0x189"), _0x40241e);
          _0x422226(_0x46c703)[_0x3851("0x1bf")](
            _0x40e959["options"]["moveClass"]
          );
        } else if (_0x40e959["options"]["changeWhen"] == _0x3851("0x183")) {
          _0x40e959["animation"](
            _0x1f26ce,
            _0x40e959[_0x3851("0x1a5")][
              _0x422226(_0x1f26ce)[_0x3851("0x188")]("index")
            ]
          );
        }
      },
      sortDrag: function (_0x4d67bd) {
        var _0x3ebd8c = this;
        var _0x56237f = _0x3ebd8c[_0x3851("0x1a1")]();
        var _0x31cb9b = _0x3ebd8c[_0x3851("0x1be")](_0x4d67bd);
        if (_0x31cb9b) {
          if (
            Number(_0x422226(_0x31cb9b)[_0x3851("0x188")](_0x3851("0x189"))) >
            Number(_0x422226(_0x4d67bd)[_0x3851("0x188")](_0x3851("0x189")))
          ) {
            var _0xe013c = Number(
              _0x422226(_0x4d67bd)["attr"](_0x3851("0x189"))
            );
            _0x422226(_0x4d67bd)[_0x3851("0x188")](
              _0x3851("0x189"),
              Number(_0x422226(_0x31cb9b)[_0x3851("0x188")](_0x3851("0x189"))) +
                0x1
            );
            for (
              var _0x58f7cb = _0xe013c;
              _0x58f7cb <
              Number(_0x422226(_0x31cb9b)[_0x3851("0x188")](_0x3851("0x189"))) +
                0x1;
              _0x58f7cb++
            ) {
              _0x3ebd8c[_0x3851("0x1a4")](
                _0x56237f[_0x58f7cb],
                _0x3ebd8c[_0x3851("0x1a5")][_0x58f7cb - 0x1]
              );
              _0x3ebd8c[_0x3851("0x1a4")](
                _0x4d67bd,
                _0x3ebd8c["aPos"][
                  _0x422226(_0x31cb9b)[_0x3851("0x188")]("index")
                ]
              );
              _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x1bf")](
                _0x3ebd8c[_0x3851("0x163")][_0x3851("0x1bc")]
              );
              _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x188")](
                _0x3851("0x189"),
                Number(
                  _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x188")](
                    _0x3851("0x189")
                  )
                ) - 0x1
              );
            }
          } else if (
            Number(_0x422226(_0x4d67bd)["attr"](_0x3851("0x189"))) >
            Number(_0x422226(_0x31cb9b)[_0x3851("0x188")](_0x3851("0x189")))
          ) {
            var _0xe013c = Number(
              _0x422226(_0x4d67bd)["attr"](_0x3851("0x189"))
            );
            _0x422226(_0x4d67bd)[_0x3851("0x188")](
              _0x3851("0x189"),
              _0x422226(_0x31cb9b)["attr"]("index")
            );
            for (
              var _0x58f7cb = Number(
                _0x422226(_0x31cb9b)["attr"](_0x3851("0x189"))
              );
              _0x58f7cb < _0xe013c;
              _0x58f7cb++
            ) {
              _0x3ebd8c["animation"](
                _0x56237f[_0x58f7cb],
                _0x3ebd8c["aPos"][_0x58f7cb + 0x1]
              );
              _0x3ebd8c["animation"](
                _0x4d67bd,
                _0x3ebd8c[_0x3851("0x1a5")][
                  Number(_0x422226(_0x4d67bd)["attr"](_0x3851("0x189")))
                ]
              );
              _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x1bf")](
                _0x3ebd8c[_0x3851("0x163")]["moveClass"]
              );
              _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x188")](
                _0x3851("0x189"),
                Number(
                  _0x422226(_0x56237f[_0x58f7cb])[_0x3851("0x188")](
                    _0x3851("0x189")
                  )
                ) + 0x1
              );
            }
          }
        } else {
          _0x3ebd8c[_0x3851("0x1a4")](
            _0x4d67bd,
            _0x3ebd8c["aPos"][
              _0x422226(_0x4d67bd)[_0x3851("0x188")](_0x3851("0x189"))
            ]
          );
        }
      },
      animation: function (_0x1a1b46, _0x1cc2fa) {
        var _0x44720d = this;
        var _0x425ae1 = _0x44720d["options"]["animation_options"];
        var _0x44720d = this;
        var _0x38c1d3 = Math[_0x3851("0x1c0")](
          _0x425ae1[_0x3851("0x1c1")] / 0x1e
        );
        var _0x637fa9 = {};
        var _0x516ef2 = {};
        for (var _0x148a38 in _0x1cc2fa) {
          _0x637fa9[_0x148a38] = parseFloat(
            _0x44720d[_0x3851("0x1c2")](_0x1a1b46, _0x148a38)
          );
          if (isNaN(_0x637fa9[_0x148a38])) {
            switch (_0x148a38) {
              case _0x3851("0x199"):
                _0x637fa9[_0x148a38] = _0x1a1b46[_0x3851("0x1b2")];
                break;
              case _0x3851("0x19c"):
                _0x637fa9[_0x148a38] = _0x1a1b46["offsetTop"];
                break;
              case _0x3851("0x1c3"):
                _0x637fa9[_0x148a38] = _0x1a1b46[_0x3851("0x1b3")];
                break;
              case _0x3851("0x1c4"):
                _0x637fa9[_0x148a38] = _0x1a1b46[_0x3851("0x1b4")];
                break;
              case "marginLeft":
                _0x637fa9[_0x148a38] = _0x1a1b46[_0x3851("0x1b2")];
                break;
              case "borderWidth":
                _0x637fa9[_0x148a38] = 0x0;
                break;
            }
          }
          _0x516ef2[_0x148a38] = _0x1cc2fa[_0x148a38] - _0x637fa9[_0x148a38];
        }
        var _0x439124 = 0x0;
        clearInterval(_0x1a1b46[_0x3851("0x1c5")]);
        _0x1a1b46[_0x3851("0x1c5")] = setInterval(function () {
          _0x439124++;
          for (var _0x148a38 in _0x1cc2fa) {
            switch (_0x425ae1["easing"]) {
              case _0x3851("0x1c6"):
                var _0x40e33e = _0x439124 / _0x38c1d3;
                var _0x14af91 =
                  _0x637fa9[_0x148a38] + _0x516ef2[_0x148a38] * _0x40e33e;
                break;
              case _0x3851("0x1c7"):
                var _0x40e33e = _0x439124 / _0x38c1d3;
                var _0x14af91 =
                  _0x637fa9[_0x148a38] +
                  _0x516ef2[_0x148a38] * _0x40e33e * _0x40e33e * _0x40e33e;
                break;
              case _0x3851("0x161"):
                var _0x40e33e = 0x1 - _0x439124 / _0x38c1d3;
                var _0x14af91 =
                  _0x637fa9[_0x148a38] +
                  _0x516ef2[_0x148a38] *
                    (0x1 - _0x40e33e * _0x40e33e * _0x40e33e);
                break;
            }
            if (_0x148a38 == _0x3851("0x1c8")) {
              _0x1a1b46[_0x3851("0x19b")][_0x3851("0x1c8")] = _0x14af91;
              _0x1a1b46[_0x3851("0x19b")]["filter"] =
                _0x3851("0x1c9") + _0x14af91 * 0x64 + ")";
            } else {
              _0x1a1b46["style"][_0x148a38] = _0x14af91 + "px";
            }
          }
          if (_0x439124 == _0x38c1d3) {
            clearInterval(_0x1a1b46[_0x3851("0x1c5")]);
            _0x425ae1["complete"] && _0x425ae1["complete"]();
          }
        }, 0x1e);
      },
      getStyle: function (_0x14bedc, _0x353eca) {
        return (_0x14bedc["currentStyle"] || getComputedStyle(_0x14bedc, ![]))[
          _0x353eca
        ];
      },
      rnd: function (_0x2d8af5, _0x475946) {
        return parseInt(
          Math[_0x3851("0x1b9")]() * (_0x475946 - _0x2d8af5) + _0x2d8af5
        );
      },
      finInArr: function (_0x20e743, _0x5ca65) {
        for (
          var _0x479298 = 0x0;
          _0x479298 < _0x20e743[_0x3851("0x187")];
          _0x479298++
        ) {
          if (_0x20e743[_0x479298] == _0x5ca65) {
            return !![];
          }
        }
        return ![];
      },
    };
  });
})(jQuery, window, document);
(function (_0x2aacbe) {
  var _0x49f3c4 = /\+/g;

  function _0xdd129b(_0x36689e) {
    return _0x2dd3a5[_0x3851("0x1ca")]
      ? _0x36689e
      : encodeURIComponent(_0x36689e);
  }

  function _0x285bb9(_0x4cc508) {
    return _0x2dd3a5[_0x3851("0x1ca")]
      ? _0x4cc508
      : decodeURIComponent(_0x4cc508);
  }

  function _0x2d99f2(_0xd73168) {
    return _0xdd129b(
      _0x2dd3a5[_0x3851("0x1cb")]
        ? JSON[_0x3851("0x1cc")](_0xd73168)
        : String(_0xd73168)
    );
  }

  function _0x590bd2(_0x91444b) {
    if (_0x91444b["indexOf"]("\x22") === 0x0) {
      _0x91444b = _0x91444b["slice"](0x1, -0x1)
        [_0x3851("0x1cd")](/\\"/g, "\x22")
        [_0x3851("0x1cd")](/\\\\/g, "\x5c");
    }
    try {
      _0x91444b = decodeURIComponent(_0x91444b["replace"](_0x49f3c4, "\x20"));
      return _0x2dd3a5["json"] ? JSON["parse"](_0x91444b) : _0x91444b;
    } catch (_0x350edd) {}
  }

  function _0x50aa14(_0x2db1b8, _0x11b84a) {
    var _0x2bf647 = _0x2dd3a5[_0x3851("0x1ca")]
      ? _0x2db1b8
      : _0x590bd2(_0x2db1b8);
    return _0x2aacbe["isFunction"](_0x11b84a)
      ? _0x11b84a(_0x2bf647)
      : _0x2bf647;
  }
  var _0x2dd3a5 = (_0x2aacbe[_0x3851("0x1ce")] = function (
    _0x167bb1,
    _0x5e6066,
    _0xc3fdda
  ) {
    if (arguments["length"] > 0x1 && !_0x2aacbe[_0x3851("0x1cf")](_0x5e6066)) {
      _0xc3fdda = _0x2aacbe[_0x3851("0x185")](
        {},
        _0x2dd3a5[_0x3851("0x1d0")],
        _0xc3fdda
      );
      if (typeof _0xc3fdda["expires"] === _0x3851("0x1d1")) {
        var _0x35d451 = _0xc3fdda[_0x3851("0x1d2")],
          _0x4b2943 = (_0xc3fdda[_0x3851("0x1d2")] = new Date());
        _0x4b2943["setMilliseconds"](
          _0x4b2943[_0x3851("0x1d3")]() + _0x35d451 * 0x5265c00
        );
      }
      return (document[_0x3851("0x1ce")] = [
        _0xdd129b(_0x167bb1),
        "=",
        _0x2d99f2(_0x5e6066),
        _0xc3fdda["expires"]
          ? _0x3851("0x1d4") + _0xc3fdda[_0x3851("0x1d2")][_0x3851("0x1d5")]()
          : "",
        _0xc3fdda[_0x3851("0x1d6")]
          ? ";\x20path=" + _0xc3fdda[_0x3851("0x1d6")]
          : "",
        _0xc3fdda[_0x3851("0x1d7")] ? ";\x20domain=" + _0xc3fdda["domain"] : "",
        _0xc3fdda["secure"] ? _0x3851("0x1d8") : "",
      ][_0x3851("0x1d9")](""));
    }
    var _0x3d6846 = _0x167bb1 ? undefined : {},
      _0x47d16b = document[_0x3851("0x1ce")]
        ? document["cookie"][_0x3851("0x1da")](";\x20")
        : [],
      _0x111475 = 0x0,
      _0x1fecfa = _0x47d16b["length"];
    for (; _0x111475 < _0x1fecfa; _0x111475++) {
      var _0x1471cc = _0x47d16b[_0x111475][_0x3851("0x1da")]("="),
        _0x85964b = _0x285bb9(_0x1471cc[_0x3851("0x1db")]()),
        _0x35964b = _0x1471cc[_0x3851("0x1d9")]("=");
      if (_0x167bb1 === _0x85964b) {
        _0x3d6846 = _0x50aa14(_0x35964b, _0x5e6066);
        break;
      }
      if (!_0x167bb1 && (_0x35964b = _0x50aa14(_0x35964b)) !== undefined) {
        _0x3d6846[_0x85964b] = _0x35964b;
      }
    }
    return _0x3d6846;
  });
  _0x2dd3a5[_0x3851("0x1d0")] = {};
  _0x2aacbe[_0x3851("0x1dc")] = function (_0x5b455a, _0x5cc68d) {
    _0x2aacbe["cookie"](
      _0x5b455a,
      "",
      _0x2aacbe[_0x3851("0x185")]({}, _0x5cc68d, { expires: -0x1 })
    );
    return !_0x2aacbe[_0x3851("0x1ce")](_0x5b455a);
  };
})(jQuery);
!(function () {
  function _0x1b5e63(_0x13107b, _0x4f260f) {
    if (
      ((_0x13107b = _0x13107b ? _0x13107b : ""),
      (_0x4f260f = _0x4f260f || {}),
      _0x13107b instanceof _0x1b5e63)
    )
      return _0x13107b;
    if (!(this instanceof _0x1b5e63))
      return new _0x1b5e63(_0x13107b, _0x4f260f);
    var _0x42966e = _0x54ea38(_0x13107b);
    (this[_0x3851("0x1dd")] = _0x13107b),
      (this["_r"] = _0x42966e["r"]),
      (this["_g"] = _0x42966e["g"]),
      (this["_b"] = _0x42966e["b"]),
      (this["_a"] = _0x42966e["a"]),
      (this[_0x3851("0x1de")] = _0x549b72(0x64 * this["_a"]) / 0x64),
      (this["_format"] =
        _0x4f260f[_0x3851("0x1df")] || _0x42966e[_0x3851("0x1df")]),
      (this[_0x3851("0x1e0")] = _0x4f260f["gradientType"]),
      this["_r"] < 0x1 && (this["_r"] = _0x549b72(this["_r"])),
      this["_g"] < 0x1 && (this["_g"] = _0x549b72(this["_g"])),
      this["_b"] < 0x1 && (this["_b"] = _0x549b72(this["_b"])),
      (this[_0x3851("0x1e1")] = _0x42966e["ok"]),
      (this[_0x3851("0x1e2")] = _0x3e8e85++);
  }

  function _0x54ea38(_0x1b10e2) {
    var _0x442d15 = { r: 0x0, g: 0x0, b: 0x0 },
      _0x5978c1 = 0x1,
      _0x2ce71a = !0x1,
      _0x43466a = !0x1;
    return (
      _0x3851("0x175") == typeof _0x1b10e2 &&
        (_0x1b10e2 = _0x5d533a(_0x1b10e2)),
      _0x3851("0x1e3") == typeof _0x1b10e2 &&
        (_0x1b10e2[_0x3851("0x1e4")]("r") &&
        _0x1b10e2["hasOwnProperty"]("g") &&
        _0x1b10e2[_0x3851("0x1e4")]("b")
          ? ((_0x442d15 = _0x505239(
              _0x1b10e2["r"],
              _0x1b10e2["g"],
              _0x1b10e2["b"]
            )),
            (_0x2ce71a = !0x0),
            (_0x43466a =
              "%" === String(_0x1b10e2["r"])[_0x3851("0x1e5")](-0x1)
                ? _0x3851("0x1e6")
                : _0x3851("0x1e7")))
          : _0x1b10e2["hasOwnProperty"]("h") &&
            _0x1b10e2[_0x3851("0x1e4")]("s") &&
            _0x1b10e2["hasOwnProperty"]("v")
          ? ((_0x1b10e2["s"] = _0x138792(_0x1b10e2["s"])),
            (_0x1b10e2["v"] = _0x138792(_0x1b10e2["v"])),
            (_0x442d15 = _0x43f683(
              _0x1b10e2["h"],
              _0x1b10e2["s"],
              _0x1b10e2["v"]
            )),
            (_0x2ce71a = !0x0),
            (_0x43466a = _0x3851("0x1e8")))
          : _0x1b10e2[_0x3851("0x1e4")]("h") &&
            _0x1b10e2[_0x3851("0x1e4")]("s") &&
            _0x1b10e2[_0x3851("0x1e4")]("l") &&
            ((_0x1b10e2["s"] = _0x138792(_0x1b10e2["s"])),
            (_0x1b10e2["l"] = _0x138792(_0x1b10e2["l"])),
            (_0x442d15 = _0x5837ba(
              _0x1b10e2["h"],
              _0x1b10e2["s"],
              _0x1b10e2["l"]
            )),
            (_0x2ce71a = !0x0),
            (_0x43466a = _0x3851("0x1e9"))),
        _0x1b10e2["hasOwnProperty"]("a") && (_0x5978c1 = _0x1b10e2["a"])),
      (_0x5978c1 = _0x16d399(_0x5978c1)),
      {
        ok: _0x2ce71a,
        format: _0x1b10e2[_0x3851("0x1df")] || _0x43466a,
        r: _0x20226f(0xff, _0x43c8fd(_0x442d15["r"], 0x0)),
        g: _0x20226f(0xff, _0x43c8fd(_0x442d15["g"], 0x0)),
        b: _0x20226f(0xff, _0x43c8fd(_0x442d15["b"], 0x0)),
        a: _0x5978c1,
      }
    );
  }

  function _0x505239(_0x168af1, _0x4c734f, _0x3d7de4) {
    return {
      r: 0xff * _0x286dda(_0x168af1, 0xff),
      g: 0xff * _0x286dda(_0x4c734f, 0xff),
      b: 0xff * _0x286dda(_0x3d7de4, 0xff),
    };
  }

  function _0x174eba(_0x3f89e3, _0x522bb6, _0x2d4072) {
    (_0x3f89e3 = _0x286dda(_0x3f89e3, 0xff)),
      (_0x522bb6 = _0x286dda(_0x522bb6, 0xff)),
      (_0x2d4072 = _0x286dda(_0x2d4072, 0xff));
    var _0x28a859,
      _0x41f13b,
      _0x255584 = _0x43c8fd(_0x3f89e3, _0x522bb6, _0x2d4072),
      _0x1ae6b1 = _0x20226f(_0x3f89e3, _0x522bb6, _0x2d4072),
      _0xbc7f9 = (_0x255584 + _0x1ae6b1) / 0x2;
    if (_0x255584 == _0x1ae6b1) _0x28a859 = _0x41f13b = 0x0;
    else {
      var _0x496877 = _0x255584 - _0x1ae6b1;
      switch (
        ((_0x41f13b =
          _0xbc7f9 > 0.5
            ? _0x496877 / (0x2 - _0x255584 - _0x1ae6b1)
            : _0x496877 / (_0x255584 + _0x1ae6b1)),
        _0x255584)
      ) {
        case _0x3f89e3:
          _0x28a859 =
            (_0x522bb6 - _0x2d4072) / _0x496877 +
            (_0x2d4072 > _0x522bb6 ? 0x6 : 0x0);
          break;
        case _0x522bb6:
          _0x28a859 = (_0x2d4072 - _0x3f89e3) / _0x496877 + 0x2;
          break;
        case _0x2d4072:
          _0x28a859 = (_0x3f89e3 - _0x522bb6) / _0x496877 + 0x4;
      }
      _0x28a859 /= 0x6;
    }
    return { h: _0x28a859, s: _0x41f13b, l: _0xbc7f9 };
  }

  function _0x5837ba(_0x1c34a5, _0x292a14, _0xb35c00) {
    function _0x53e2c6(_0x462226, _0x53c590, _0x3aa107) {
      return (
        0x0 > _0x3aa107 && (_0x3aa107 += 0x1),
        _0x3aa107 > 0x1 && (_0x3aa107 -= 0x1),
        0x1 / 0x6 > _0x3aa107
          ? _0x462226 + 0x6 * (_0x53c590 - _0x462226) * _0x3aa107
          : 0.5 > _0x3aa107
          ? _0x53c590
          : 0x2 / 0x3 > _0x3aa107
          ? _0x462226 + 0x6 * (_0x53c590 - _0x462226) * (0x2 / 0x3 - _0x3aa107)
          : _0x462226
      );
    }
    var _0x18feb8, _0x1e841e, _0x196304;
    if (
      ((_0x1c34a5 = _0x286dda(_0x1c34a5, 0x168)),
      (_0x292a14 = _0x286dda(_0x292a14, 0x64)),
      (_0xb35c00 = _0x286dda(_0xb35c00, 0x64)),
      0x0 === _0x292a14)
    )
      _0x18feb8 = _0x1e841e = _0x196304 = _0xb35c00;
    else {
      var _0x5be025 =
          0.5 > _0xb35c00
            ? _0xb35c00 * (0x1 + _0x292a14)
            : _0xb35c00 + _0x292a14 - _0xb35c00 * _0x292a14,
        _0x58e646 = 0x2 * _0xb35c00 - _0x5be025;
      (_0x18feb8 = _0x53e2c6(_0x58e646, _0x5be025, _0x1c34a5 + 0x1 / 0x3)),
        (_0x1e841e = _0x53e2c6(_0x58e646, _0x5be025, _0x1c34a5)),
        (_0x196304 = _0x53e2c6(_0x58e646, _0x5be025, _0x1c34a5 - 0x1 / 0x3));
    }
    return { r: 0xff * _0x18feb8, g: 0xff * _0x1e841e, b: 0xff * _0x196304 };
  }

  function _0x369dfa(_0x39226d, _0x588ac9, _0x2c1bb8) {
    (_0x39226d = _0x286dda(_0x39226d, 0xff)),
      (_0x588ac9 = _0x286dda(_0x588ac9, 0xff)),
      (_0x2c1bb8 = _0x286dda(_0x2c1bb8, 0xff));
    var _0x23016c,
      _0x2cb7a7,
      _0x1c78b4 = _0x43c8fd(_0x39226d, _0x588ac9, _0x2c1bb8),
      _0x267a4e = _0x20226f(_0x39226d, _0x588ac9, _0x2c1bb8),
      _0x1708d4 = _0x1c78b4,
      _0x517969 = _0x1c78b4 - _0x267a4e;
    if (
      ((_0x2cb7a7 = 0x0 === _0x1c78b4 ? 0x0 : _0x517969 / _0x1c78b4),
      _0x1c78b4 == _0x267a4e)
    )
      _0x23016c = 0x0;
    else {
      switch (_0x1c78b4) {
        case _0x39226d:
          _0x23016c =
            (_0x588ac9 - _0x2c1bb8) / _0x517969 +
            (_0x2c1bb8 > _0x588ac9 ? 0x6 : 0x0);
          break;
        case _0x588ac9:
          _0x23016c = (_0x2c1bb8 - _0x39226d) / _0x517969 + 0x2;
          break;
        case _0x2c1bb8:
          _0x23016c = (_0x39226d - _0x588ac9) / _0x517969 + 0x4;
      }
      _0x23016c /= 0x6;
    }
    return { h: _0x23016c, s: _0x2cb7a7, v: _0x1708d4 };
  }

  function _0x43f683(_0x1ba62d, _0x11dde6, _0x469264) {
    (_0x1ba62d = 0x6 * _0x286dda(_0x1ba62d, 0x168)),
      (_0x11dde6 = _0x286dda(_0x11dde6, 0x64)),
      (_0x469264 = _0x286dda(_0x469264, 0x64));
    var _0x5ba237 = _0x3ac812[_0x3851("0x1ae")](_0x1ba62d),
      _0x1c499c = _0x1ba62d - _0x5ba237,
      _0x131f0a = _0x469264 * (0x1 - _0x11dde6),
      _0x4351ff = _0x469264 * (0x1 - _0x1c499c * _0x11dde6),
      _0x37fe04 = _0x469264 * (0x1 - (0x1 - _0x1c499c) * _0x11dde6),
      _0x59f560 = _0x5ba237 % 0x6,
      _0x2ca851 = [
        _0x469264,
        _0x4351ff,
        _0x131f0a,
        _0x131f0a,
        _0x37fe04,
        _0x469264,
      ][_0x59f560],
      _0x25af5c = [
        _0x37fe04,
        _0x469264,
        _0x469264,
        _0x4351ff,
        _0x131f0a,
        _0x131f0a,
      ][_0x59f560],
      _0x19e10a = [
        _0x131f0a,
        _0x131f0a,
        _0x37fe04,
        _0x469264,
        _0x469264,
        _0x4351ff,
      ][_0x59f560];
    return { r: 0xff * _0x2ca851, g: 0xff * _0x25af5c, b: 0xff * _0x19e10a };
  }

  function _0x54aa0f(_0x1998bc, _0x13ca54, _0x5cafa1, _0x501f98) {
    var _0x594eb0 = [
      _0x248820(_0x549b72(_0x1998bc)[_0x3851("0x1ea")](0x10)),
      _0x248820(_0x549b72(_0x13ca54)[_0x3851("0x1ea")](0x10)),
      _0x248820(_0x549b72(_0x5cafa1)["toString"](0x10)),
    ];
    return _0x501f98 &&
      _0x594eb0[0x0][_0x3851("0x1eb")](0x0) == _0x594eb0[0x0]["charAt"](0x1) &&
      _0x594eb0[0x1]["charAt"](0x0) == _0x594eb0[0x1]["charAt"](0x1) &&
      _0x594eb0[0x2][_0x3851("0x1eb")](0x0) == _0x594eb0[0x2]["charAt"](0x1)
      ? _0x594eb0[0x0][_0x3851("0x1eb")](0x0) +
          _0x594eb0[0x1][_0x3851("0x1eb")](0x0) +
          _0x594eb0[0x2][_0x3851("0x1eb")](0x0)
      : _0x594eb0["join"]("");
  }

  function _0x4a5aed(_0x4715b0, _0x2ff39a, _0x5c2a09, _0x113c0e) {
    var _0x1b7de7 = [
      _0x248820(_0x39e73c(_0x113c0e)),
      _0x248820(_0x549b72(_0x4715b0)[_0x3851("0x1ea")](0x10)),
      _0x248820(_0x549b72(_0x2ff39a)[_0x3851("0x1ea")](0x10)),
      _0x248820(_0x549b72(_0x5c2a09)["toString"](0x10)),
    ];
    return _0x1b7de7[_0x3851("0x1d9")]("");
  }

  function _0x174d8d(_0x3b0eb8, _0x3daaea) {
    _0x3daaea = 0x0 === _0x3daaea ? 0x0 : _0x3daaea || 0xa;
    var _0x45422a = _0x1b5e63(_0x3b0eb8)[_0x3851("0x1ec")]();
    return (
      (_0x45422a["s"] -= _0x3daaea / 0x64),
      (_0x45422a["s"] = _0x180b2c(_0x45422a["s"])),
      _0x1b5e63(_0x45422a)
    );
  }

  function _0x29d75f(_0x50ae02, _0x40ee98) {
    _0x40ee98 = 0x0 === _0x40ee98 ? 0x0 : _0x40ee98 || 0xa;
    var _0x47ec06 = _0x1b5e63(_0x50ae02)[_0x3851("0x1ec")]();
    return (
      (_0x47ec06["s"] += _0x40ee98 / 0x64),
      (_0x47ec06["s"] = _0x180b2c(_0x47ec06["s"])),
      _0x1b5e63(_0x47ec06)
    );
  }

  function _0x448f31(_0x30e8d4) {
    return _0x1b5e63(_0x30e8d4)[_0x3851("0x1ed")](0x64);
  }

  function _0x1e525d(_0x3359c4, _0x508376) {
    _0x508376 = 0x0 === _0x508376 ? 0x0 : _0x508376 || 0xa;
    var _0x222719 = _0x1b5e63(_0x3359c4)[_0x3851("0x1ec")]();
    return (
      (_0x222719["l"] += _0x508376 / 0x64),
      (_0x222719["l"] = _0x180b2c(_0x222719["l"])),
      _0x1b5e63(_0x222719)
    );
  }

  function _0x4984f6(_0x1e3b88, _0x217595) {
    _0x217595 = 0x0 === _0x217595 ? 0x0 : _0x217595 || 0xa;
    var _0x438f0c = _0x1b5e63(_0x1e3b88)[_0x3851("0x1ee")]();
    return (
      (_0x438f0c["r"] = _0x43c8fd(
        0x0,
        _0x20226f(0xff, _0x438f0c["r"] - _0x549b72(0xff * -(_0x217595 / 0x64)))
      )),
      (_0x438f0c["g"] = _0x43c8fd(
        0x0,
        _0x20226f(0xff, _0x438f0c["g"] - _0x549b72(0xff * -(_0x217595 / 0x64)))
      )),
      (_0x438f0c["b"] = _0x43c8fd(
        0x0,
        _0x20226f(0xff, _0x438f0c["b"] - _0x549b72(0xff * -(_0x217595 / 0x64)))
      )),
      _0x1b5e63(_0x438f0c)
    );
  }

  function _0x20940b(_0x1317d6, _0x17aa95) {
    _0x17aa95 = 0x0 === _0x17aa95 ? 0x0 : _0x17aa95 || 0xa;
    var _0x22f34b = _0x1b5e63(_0x1317d6)[_0x3851("0x1ec")]();
    return (
      (_0x22f34b["l"] -= _0x17aa95 / 0x64),
      (_0x22f34b["l"] = _0x180b2c(_0x22f34b["l"])),
      _0x1b5e63(_0x22f34b)
    );
  }

  function _0x398123(_0xa28a6, _0x2cb46d) {
    var _0x10a9a6 = _0x1b5e63(_0xa28a6)[_0x3851("0x1ec")](),
      _0x11f90d = (_0x549b72(_0x10a9a6["h"]) + _0x2cb46d) % 0x168;
    return (
      (_0x10a9a6["h"] = 0x0 > _0x11f90d ? 0x168 + _0x11f90d : _0x11f90d),
      _0x1b5e63(_0x10a9a6)
    );
  }

  function _0x554d4f(_0x578afb) {
    var _0x2b723e = _0x1b5e63(_0x578afb)["toHsl"]();
    return (
      (_0x2b723e["h"] = (_0x2b723e["h"] + 0xb4) % 0x168), _0x1b5e63(_0x2b723e)
    );
  }

  function _0x78e40c(_0x459377) {
    var _0x5f0274 = _0x1b5e63(_0x459377)[_0x3851("0x1ec")](),
      _0x247722 = _0x5f0274["h"];
    return [
      _0x1b5e63(_0x459377),
      _0x1b5e63({
        h: (_0x247722 + 0x78) % 0x168,
        s: _0x5f0274["s"],
        l: _0x5f0274["l"],
      }),
      _0x1b5e63({
        h: (_0x247722 + 0xf0) % 0x168,
        s: _0x5f0274["s"],
        l: _0x5f0274["l"],
      }),
    ];
  }

  function _0x2fedf9(_0x23c495) {
    var _0x46e647 = _0x1b5e63(_0x23c495)[_0x3851("0x1ec")](),
      _0x4b194f = _0x46e647["h"];
    return [
      _0x1b5e63(_0x23c495),
      _0x1b5e63({
        h: (_0x4b194f + 0x5a) % 0x168,
        s: _0x46e647["s"],
        l: _0x46e647["l"],
      }),
      _0x1b5e63({
        h: (_0x4b194f + 0xb4) % 0x168,
        s: _0x46e647["s"],
        l: _0x46e647["l"],
      }),
      _0x1b5e63({
        h: (_0x4b194f + 0x10e) % 0x168,
        s: _0x46e647["s"],
        l: _0x46e647["l"],
      }),
    ];
  }

  function _0xa1e127(_0x384444) {
    var _0x2f36f1 = _0x1b5e63(_0x384444)[_0x3851("0x1ec")](),
      _0x270156 = _0x2f36f1["h"];
    return [
      _0x1b5e63(_0x384444),
      _0x1b5e63({
        h: (_0x270156 + 0x48) % 0x168,
        s: _0x2f36f1["s"],
        l: _0x2f36f1["l"],
      }),
      _0x1b5e63({
        h: (_0x270156 + 0xd8) % 0x168,
        s: _0x2f36f1["s"],
        l: _0x2f36f1["l"],
      }),
    ];
  }

  function _0x5d8fe3(_0x3a8757, _0x1bf5c0, _0x4eb367) {
    (_0x1bf5c0 = _0x1bf5c0 || 0x6), (_0x4eb367 = _0x4eb367 || 0x1e);
    var _0x118852 = _0x1b5e63(_0x3a8757)[_0x3851("0x1ec")](),
      _0x3aef2 = 0x168 / _0x4eb367,
      _0x132d39 = [_0x1b5e63(_0x3a8757)];
    for (
      _0x118852["h"] =
        (_0x118852["h"] - ((_0x3aef2 * _0x1bf5c0) >> 0x1) + 0x2d0) % 0x168;
      --_0x1bf5c0;

    )
      (_0x118852["h"] = (_0x118852["h"] + _0x3aef2) % 0x168),
        _0x132d39[_0x3851("0x186")](_0x1b5e63(_0x118852));
    return _0x132d39;
  }

  function _0x42ac54(_0x4f1e8b, _0x3cb096) {
    _0x3cb096 = _0x3cb096 || 0x6;
    for (
      var _0x30fbcc = _0x1b5e63(_0x4f1e8b)[_0x3851("0x1ef")](),
        _0x273c93 = _0x30fbcc["h"],
        _0xb3c646 = _0x30fbcc["s"],
        _0x3affd6 = _0x30fbcc["v"],
        _0x463ed3 = [],
        _0x19d273 = 0x1 / _0x3cb096;
      _0x3cb096--;

    )
      _0x463ed3[_0x3851("0x186")](
        _0x1b5e63({ h: _0x273c93, s: _0xb3c646, v: _0x3affd6 })
      ),
        (_0x3affd6 = (_0x3affd6 + _0x19d273) % 0x1);
    return _0x463ed3;
  }

  function _0xee5222(_0x1b99ae) {
    var _0x3a09ea = {};
    for (var _0x335f24 in _0x1b99ae)
      _0x1b99ae[_0x3851("0x1e4")](_0x335f24) &&
        (_0x3a09ea[_0x1b99ae[_0x335f24]] = _0x335f24);
    return _0x3a09ea;
  }

  function _0x16d399(_0x28391c) {
    return (
      (_0x28391c = parseFloat(_0x28391c)),
      (isNaN(_0x28391c) || 0x0 > _0x28391c || _0x28391c > 0x1) &&
        (_0x28391c = 0x1),
      _0x28391c
    );
  }

  function _0x286dda(_0x34f3a4, _0x246ddd) {
    _0x5c3bd2(_0x34f3a4) && (_0x34f3a4 = _0x3851("0x1f0"));
    var _0x4ab837 = _0x28c24c(_0x34f3a4);
    return (
      (_0x34f3a4 = _0x20226f(_0x246ddd, _0x43c8fd(0x0, parseFloat(_0x34f3a4)))),
      _0x4ab837 && (_0x34f3a4 = parseInt(_0x34f3a4 * _0x246ddd, 0xa) / 0x64),
      _0x3ac812[_0x3851("0x1f1")](_0x34f3a4 - _0x246ddd) < 0.000001
        ? 0x1
        : (_0x34f3a4 % _0x246ddd) / parseFloat(_0x246ddd)
    );
  }

  function _0x180b2c(_0xe706f2) {
    return _0x20226f(0x1, _0x43c8fd(0x0, _0xe706f2));
  }

  function _0x2b8b6a(_0x51bf91) {
    return parseInt(_0x51bf91, 0x10);
  }

  function _0x5c3bd2(_0x5646b8) {
    return (
      "string" == typeof _0x5646b8 &&
      -0x1 != _0x5646b8[_0x3851("0x1f2")](".") &&
      0x1 === parseFloat(_0x5646b8)
    );
  }

  function _0x28c24c(_0x159eca) {
    return (
      _0x3851("0x175") == typeof _0x159eca &&
      -0x1 != _0x159eca[_0x3851("0x1f2")]("%")
    );
  }

  function _0x248820(_0x21b6d9) {
    return 0x1 == _0x21b6d9[_0x3851("0x187")]
      ? "0" + _0x21b6d9
      : "" + _0x21b6d9;
  }

  function _0x138792(_0x2f9fc1) {
    return 0x1 >= _0x2f9fc1 && (_0x2f9fc1 = 0x64 * _0x2f9fc1 + "%"), _0x2f9fc1;
  }

  function _0x39e73c(_0x4c608a) {
    return Math[_0x3851("0x1c0")](0xff * parseFloat(_0x4c608a))[
      _0x3851("0x1ea")
    ](0x10);
  }

  function _0x417625(_0x2f8100) {
    return _0x2b8b6a(_0x2f8100) / 0xff;
  }

  function _0x5d533a(_0x3458e3) {
    _0x3458e3 = _0x3458e3["replace"](_0x2416fc, "")
      ["replace"](_0x55e5fb, "")
      [_0x3851("0x1f3")]();
    var _0x52eb41 = !0x1;
    if (_0x28eb44[_0x3458e3])
      (_0x3458e3 = _0x28eb44[_0x3458e3]), (_0x52eb41 = !0x0);
    else if (_0x3851("0x1f4") == _0x3458e3)
      return { r: 0x0, g: 0x0, b: 0x0, a: 0x0, format: _0x3851("0x1f5") };
    var _0x5302b8;
    return (_0x5302b8 = _0x4b84c8["rgb"][_0x3851("0x1f6")](_0x3458e3))
      ? { r: _0x5302b8[0x1], g: _0x5302b8[0x2], b: _0x5302b8[0x3] }
      : (_0x5302b8 = _0x4b84c8[_0x3851("0x1f7")][_0x3851("0x1f6")](_0x3458e3))
      ? {
          r: _0x5302b8[0x1],
          g: _0x5302b8[0x2],
          b: _0x5302b8[0x3],
          a: _0x5302b8[0x4],
        }
      : (_0x5302b8 = _0x4b84c8["hsl"][_0x3851("0x1f6")](_0x3458e3))
      ? { h: _0x5302b8[0x1], s: _0x5302b8[0x2], l: _0x5302b8[0x3] }
      : (_0x5302b8 = _0x4b84c8[_0x3851("0x1f8")][_0x3851("0x1f6")](_0x3458e3))
      ? {
          h: _0x5302b8[0x1],
          s: _0x5302b8[0x2],
          l: _0x5302b8[0x3],
          a: _0x5302b8[0x4],
        }
      : (_0x5302b8 = _0x4b84c8["hsv"][_0x3851("0x1f6")](_0x3458e3))
      ? { h: _0x5302b8[0x1], s: _0x5302b8[0x2], v: _0x5302b8[0x3] }
      : (_0x5302b8 = _0x4b84c8[_0x3851("0x1f9")][_0x3851("0x1f6")](_0x3458e3))
      ? {
          h: _0x5302b8[0x1],
          s: _0x5302b8[0x2],
          v: _0x5302b8[0x3],
          a: _0x5302b8[0x4],
        }
      : (_0x5302b8 = _0x4b84c8["hex8"][_0x3851("0x1f6")](_0x3458e3))
      ? {
          a: _0x417625(_0x5302b8[0x1]),
          r: _0x2b8b6a(_0x5302b8[0x2]),
          g: _0x2b8b6a(_0x5302b8[0x3]),
          b: _0x2b8b6a(_0x5302b8[0x4]),
          format: _0x52eb41 ? "name" : _0x3851("0x1fa"),
        }
      : (_0x5302b8 = _0x4b84c8[_0x3851("0x1fb")][_0x3851("0x1f6")](_0x3458e3))
      ? {
          r: _0x2b8b6a(_0x5302b8[0x1]),
          g: _0x2b8b6a(_0x5302b8[0x2]),
          b: _0x2b8b6a(_0x5302b8[0x3]),
          format: _0x52eb41 ? _0x3851("0x1f5") : _0x3851("0x1fc"),
        }
      : (_0x5302b8 = _0x4b84c8[_0x3851("0x1fd")]["exec"](_0x3458e3))
      ? {
          r: _0x2b8b6a(_0x5302b8[0x1] + "" + _0x5302b8[0x1]),
          g: _0x2b8b6a(_0x5302b8[0x2] + "" + _0x5302b8[0x2]),
          b: _0x2b8b6a(_0x5302b8[0x3] + "" + _0x5302b8[0x3]),
          format: _0x52eb41 ? _0x3851("0x1f5") : "hex",
        }
      : !0x1;
  }

  function _0x5138fa(_0x15fd48) {
    var _0x466ff2, _0x445d88;
    return (
      (_0x15fd48 = _0x15fd48 || { level: "AA", size: _0x3851("0x1fe") }),
      (_0x466ff2 = (_0x15fd48["level"] || "AA")[_0x3851("0x1ff")]()),
      (_0x445d88 = (_0x15fd48["size"] || "small")["toLowerCase"]()),
      "AA" !== _0x466ff2 && "AAA" !== _0x466ff2 && (_0x466ff2 = "AA"),
      _0x3851("0x1fe") !== _0x445d88 &&
        "large" !== _0x445d88 &&
        (_0x445d88 = "small"),
      { level: _0x466ff2, size: _0x445d88 }
    );
  }
  var _0x2416fc = /^\s+/,
    _0x55e5fb = /\s+$/,
    _0x3e8e85 = 0x0,
    _0x3ac812 = Math,
    _0x549b72 = _0x3ac812[_0x3851("0x1c0")],
    _0x20226f = _0x3ac812["min"],
    _0x43c8fd = _0x3ac812[_0x3851("0x200")],
    _0x46e72c = _0x3ac812[_0x3851("0x1b9")];
  (_0x1b5e63[_0x3851("0x169")] = {
    isDark: function () {
      return this[_0x3851("0x201")]() < 0x80;
    },
    isLight: function () {
      return !this[_0x3851("0x202")]();
    },
    isValid: function () {
      return this[_0x3851("0x1e1")];
    },
    getOriginalInput: function () {
      return this[_0x3851("0x1dd")];
    },
    getFormat: function () {
      return this[_0x3851("0x203")];
    },
    getAlpha: function () {
      return this["_a"];
    },
    getBrightness: function () {
      var _0x80f3d8 = this[_0x3851("0x1ee")]();
      return (
        (0x12b * _0x80f3d8["r"] +
          0x24b * _0x80f3d8["g"] +
          0x72 * _0x80f3d8["b"]) /
        0x3e8
      );
    },
    getLuminance: function () {
      var _0x5a5655,
        _0x5bc6b6,
        _0x98373e,
        _0x3e49f0,
        _0x5ef90f,
        _0x42f4ee,
        _0x4d47dc = this[_0x3851("0x1ee")]();
      return (
        (_0x5a5655 = _0x4d47dc["r"] / 0xff),
        (_0x5bc6b6 = _0x4d47dc["g"] / 0xff),
        (_0x98373e = _0x4d47dc["b"] / 0xff),
        (_0x3e49f0 =
          0.03928 >= _0x5a5655
            ? _0x5a5655 / 12.92
            : Math[_0x3851("0x204")]((_0x5a5655 + 0.055) / 1.055, 2.4)),
        (_0x5ef90f =
          0.03928 >= _0x5bc6b6
            ? _0x5bc6b6 / 12.92
            : Math["pow"]((_0x5bc6b6 + 0.055) / 1.055, 2.4)),
        (_0x42f4ee =
          0.03928 >= _0x98373e
            ? _0x98373e / 12.92
            : Math["pow"]((_0x98373e + 0.055) / 1.055, 2.4)),
        0.2126 * _0x3e49f0 + 0.7152 * _0x5ef90f + 0.0722 * _0x42f4ee
      );
    },
    setAlpha: function (_0x4b8ad0) {
      return (
        (this["_a"] = _0x16d399(_0x4b8ad0)),
        (this[_0x3851("0x1de")] = _0x549b72(0x64 * this["_a"]) / 0x64),
        this
      );
    },
    toHsv: function () {
      var _0x515a95 = _0x369dfa(this["_r"], this["_g"], this["_b"]);
      return {
        h: 0x168 * _0x515a95["h"],
        s: _0x515a95["s"],
        v: _0x515a95["v"],
        a: this["_a"],
      };
    },
    toHsvString: function () {
      var _0x35ff5c = _0x369dfa(this["_r"], this["_g"], this["_b"]),
        _0x5f06b6 = _0x549b72(0x168 * _0x35ff5c["h"]),
        _0x15f032 = _0x549b72(0x64 * _0x35ff5c["s"]),
        _0x5e2ef5 = _0x549b72(0x64 * _0x35ff5c["v"]);
      return 0x1 == this["_a"]
        ? _0x3851("0x205") +
            _0x5f06b6 +
            ",\x20" +
            _0x15f032 +
            _0x3851("0x206") +
            _0x5e2ef5 +
            "%)"
        : "hsva(" +
            _0x5f06b6 +
            ",\x20" +
            _0x15f032 +
            _0x3851("0x206") +
            _0x5e2ef5 +
            "%,\x20" +
            this[_0x3851("0x1de")] +
            ")";
    },
    toHsl: function () {
      var _0x498619 = _0x174eba(this["_r"], this["_g"], this["_b"]);
      return {
        h: 0x168 * _0x498619["h"],
        s: _0x498619["s"],
        l: _0x498619["l"],
        a: this["_a"],
      };
    },
    toHslString: function () {
      var _0x235034 = _0x174eba(this["_r"], this["_g"], this["_b"]),
        _0x1b7c07 = _0x549b72(0x168 * _0x235034["h"]),
        _0x588233 = _0x549b72(0x64 * _0x235034["s"]),
        _0x40a339 = _0x549b72(0x64 * _0x235034["l"]);
      return 0x1 == this["_a"]
        ? "hsl(" +
            _0x1b7c07 +
            ",\x20" +
            _0x588233 +
            _0x3851("0x206") +
            _0x40a339 +
            "%)"
        : _0x3851("0x207") +
            _0x1b7c07 +
            ",\x20" +
            _0x588233 +
            _0x3851("0x206") +
            _0x40a339 +
            _0x3851("0x206") +
            this[_0x3851("0x1de")] +
            ")";
    },
    toHex: function (_0x2235bf) {
      return _0x54aa0f(this["_r"], this["_g"], this["_b"], _0x2235bf);
    },
    toHexString: function (_0x25ce7a) {
      return "#" + this["toHex"](_0x25ce7a);
    },
    toHex8: function () {
      return _0x4a5aed(this["_r"], this["_g"], this["_b"], this["_a"]);
    },
    toHex8String: function () {
      return "#" + this["toHex8"]();
    },
    toRgb: function () {
      return {
        r: _0x549b72(this["_r"]),
        g: _0x549b72(this["_g"]),
        b: _0x549b72(this["_b"]),
        a: this["_a"],
      };
    },
    toRgbString: function () {
      return 0x1 == this["_a"]
        ? _0x3851("0x208") +
            _0x549b72(this["_r"]) +
            ",\x20" +
            _0x549b72(this["_g"]) +
            ",\x20" +
            _0x549b72(this["_b"]) +
            ")"
        : _0x3851("0x209") +
            _0x549b72(this["_r"]) +
            ",\x20" +
            _0x549b72(this["_g"]) +
            ",\x20" +
            _0x549b72(this["_b"]) +
            ",\x20" +
            this["_roundA"] +
            ")";
    },
    toPercentageRgb: function () {
      return {
        r: _0x549b72(0x64 * _0x286dda(this["_r"], 0xff)) + "%",
        g: _0x549b72(0x64 * _0x286dda(this["_g"], 0xff)) + "%",
        b: _0x549b72(0x64 * _0x286dda(this["_b"], 0xff)) + "%",
        a: this["_a"],
      };
    },
    toPercentageRgbString: function () {
      return 0x1 == this["_a"]
        ? _0x3851("0x208") +
            _0x549b72(0x64 * _0x286dda(this["_r"], 0xff)) +
            "%,\x20" +
            _0x549b72(0x64 * _0x286dda(this["_g"], 0xff)) +
            _0x3851("0x206") +
            _0x549b72(0x64 * _0x286dda(this["_b"], 0xff)) +
            "%)"
        : _0x3851("0x209") +
            _0x549b72(0x64 * _0x286dda(this["_r"], 0xff)) +
            _0x3851("0x206") +
            _0x549b72(0x64 * _0x286dda(this["_g"], 0xff)) +
            "%,\x20" +
            _0x549b72(0x64 * _0x286dda(this["_b"], 0xff)) +
            "%,\x20" +
            this["_roundA"] +
            ")";
    },
    toName: function () {
      return 0x0 === this["_a"]
        ? "transparent"
        : this["_a"] < 0x1
        ? !0x1
        : _0x252134[_0x54aa0f(this["_r"], this["_g"], this["_b"], !0x0)] ||
          !0x1;
    },
    toFilter: function (_0x3f7ad0) {
      var _0x1bce31 =
          "#" + _0x4a5aed(this["_r"], this["_g"], this["_b"], this["_a"]),
        _0x1ad433 = _0x1bce31,
        _0x53203a = this[_0x3851("0x1e0")] ? _0x3851("0x20a") : "";
      if (_0x3f7ad0) {
        var _0x1fdb1d = _0x1b5e63(_0x3f7ad0);
        _0x1ad433 = _0x1fdb1d[_0x3851("0x20b")]();
      }
      return (
        "progid:DXImageTransform.Microsoft.gradient(" +
        _0x53203a +
        _0x3851("0x20c") +
        _0x1bce31 +
        _0x3851("0x20d") +
        _0x1ad433 +
        ")"
      );
    },
    toString: function (_0x49ace7) {
      var _0x555cd5 = !!_0x49ace7;
      _0x49ace7 = _0x49ace7 || this["_format"];
      var _0x14f2f8 = !0x1,
        _0x22a823 = this["_a"] < 0x1 && this["_a"] >= 0x0,
        _0x48e6e2 =
          !_0x555cd5 &&
          _0x22a823 &&
          (_0x3851("0x1fc") === _0x49ace7 ||
            _0x3851("0x1fb") === _0x49ace7 ||
            _0x3851("0x1fd") === _0x49ace7 ||
            _0x3851("0x1f5") === _0x49ace7);
      return _0x48e6e2
        ? _0x3851("0x1f5") === _0x49ace7 && 0x0 === this["_a"]
          ? this["toName"]()
          : this[_0x3851("0x20e")]()
        : (_0x3851("0x1e7") === _0x49ace7 &&
            (_0x14f2f8 = this["toRgbString"]()),
          _0x3851("0x1e6") === _0x49ace7 &&
            (_0x14f2f8 = this[_0x3851("0x20f")]()),
          (_0x3851("0x1fc") === _0x49ace7 || _0x3851("0x1fb") === _0x49ace7) &&
            (_0x14f2f8 = this[_0x3851("0x210")]()),
          "hex3" === _0x49ace7 && (_0x14f2f8 = this[_0x3851("0x210")](!0x0)),
          _0x3851("0x1fa") === _0x49ace7 &&
            (_0x14f2f8 = this["toHex8String"]()),
          _0x3851("0x1f5") === _0x49ace7 && (_0x14f2f8 = this["toName"]()),
          _0x3851("0x1e9") === _0x49ace7 && (_0x14f2f8 = this["toHslString"]()),
          _0x3851("0x1e8") === _0x49ace7 &&
            (_0x14f2f8 = this[_0x3851("0x211")]()),
          _0x14f2f8 || this[_0x3851("0x210")]());
    },
    clone: function () {
      return _0x1b5e63(this[_0x3851("0x1ea")]());
    },
    _applyModification: function (_0xf8d5b9, _0xc8d319) {
      var _0x8ef41d = _0xf8d5b9["apply"](
        null,
        [this][_0x3851("0x212")](
          [][_0x3851("0x213")][_0x3851("0x214")](_0xc8d319)
        )
      );
      return (
        (this["_r"] = _0x8ef41d["_r"]),
        (this["_g"] = _0x8ef41d["_g"]),
        (this["_b"] = _0x8ef41d["_b"]),
        this[_0x3851("0x215")](_0x8ef41d["_a"]),
        this
      );
    },
    lighten: function () {
      return this[_0x3851("0x216")](_0x1e525d, arguments);
    },
    brighten: function () {
      return this["_applyModification"](_0x4984f6, arguments);
    },
    darken: function () {
      return this["_applyModification"](_0x20940b, arguments);
    },
    desaturate: function () {
      return this[_0x3851("0x216")](_0x174d8d, arguments);
    },
    saturate: function () {
      return this[_0x3851("0x216")](_0x29d75f, arguments);
    },
    greyscale: function () {
      return this[_0x3851("0x216")](_0x448f31, arguments);
    },
    spin: function () {
      return this[_0x3851("0x216")](_0x398123, arguments);
    },
    _applyCombination: function (_0x3992b5, _0x556b95) {
      return _0x3992b5["apply"](
        null,
        [this][_0x3851("0x212")](
          [][_0x3851("0x213")][_0x3851("0x214")](_0x556b95)
        )
      );
    },
    analogous: function () {
      return this[_0x3851("0x217")](_0x5d8fe3, arguments);
    },
    complement: function () {
      return this[_0x3851("0x217")](_0x554d4f, arguments);
    },
    monochromatic: function () {
      return this[_0x3851("0x217")](_0x42ac54, arguments);
    },
    splitcomplement: function () {
      return this[_0x3851("0x217")](_0xa1e127, arguments);
    },
    triad: function () {
      return this[_0x3851("0x217")](_0x78e40c, arguments);
    },
    tetrad: function () {
      return this[_0x3851("0x217")](_0x2fedf9, arguments);
    },
  }),
    (_0x1b5e63[_0x3851("0x218")] = function (_0x55f9cc, _0x1a3aa9) {
      if (_0x3851("0x1e3") == typeof _0x55f9cc) {
        var _0x40287d = {};
        for (var _0x2709db in _0x55f9cc)
          _0x55f9cc["hasOwnProperty"](_0x2709db) &&
            (_0x40287d[_0x2709db] =
              "a" === _0x2709db
                ? _0x55f9cc[_0x2709db]
                : _0x138792(_0x55f9cc[_0x2709db]));
        _0x55f9cc = _0x40287d;
      }
      return _0x1b5e63(_0x55f9cc, _0x1a3aa9);
    }),
    (_0x1b5e63[_0x3851("0x219")] = function (_0x57c938, _0x3c1b24) {
      return _0x57c938 && _0x3c1b24
        ? _0x1b5e63(_0x57c938)[_0x3851("0x20e")]() ==
            _0x1b5e63(_0x3c1b24)[_0x3851("0x20e")]()
        : !0x1;
    }),
    (_0x1b5e63[_0x3851("0x1b9")] = function () {
      return _0x1b5e63["fromRatio"]({
        r: _0x46e72c(),
        g: _0x46e72c(),
        b: _0x46e72c(),
      });
    }),
    (_0x1b5e63["mix"] = function (_0x2ce088, _0x4c66c2, _0x298396) {
      _0x298396 = 0x0 === _0x298396 ? 0x0 : _0x298396 || 0x32;
      var _0x29dc71,
        _0x24e328 = _0x1b5e63(_0x2ce088)[_0x3851("0x1ee")](),
        _0x233c16 = _0x1b5e63(_0x4c66c2)[_0x3851("0x1ee")](),
        _0x5375a8 = _0x298396 / 0x64,
        _0x2d2c3c = 0x2 * _0x5375a8 - 0x1,
        _0x801e58 = _0x233c16["a"] - _0x24e328["a"];
      (_0x29dc71 =
        -0x1 == _0x2d2c3c * _0x801e58
          ? _0x2d2c3c
          : (_0x2d2c3c + _0x801e58) / (0x1 + _0x2d2c3c * _0x801e58)),
        (_0x29dc71 = (_0x29dc71 + 0x1) / 0x2);
      var _0x151a47 = 0x1 - _0x29dc71,
        _0x5c19cf = {
          r: _0x233c16["r"] * _0x29dc71 + _0x24e328["r"] * _0x151a47,
          g: _0x233c16["g"] * _0x29dc71 + _0x24e328["g"] * _0x151a47,
          b: _0x233c16["b"] * _0x29dc71 + _0x24e328["b"] * _0x151a47,
          a: _0x233c16["a"] * _0x5375a8 + _0x24e328["a"] * (0x1 - _0x5375a8),
        };
      return _0x1b5e63(_0x5c19cf);
    }),
    (_0x1b5e63["readability"] = function (_0xccb28d, _0x2ef35d) {
      var _0x3dad2c = _0x1b5e63(_0xccb28d),
        _0x4349cf = _0x1b5e63(_0x2ef35d);
      return (
        (Math[_0x3851("0x200")](
          _0x3dad2c[_0x3851("0x21a")](),
          _0x4349cf[_0x3851("0x21a")]()
        ) +
          0.05) /
        (Math["min"](
          _0x3dad2c[_0x3851("0x21a")](),
          _0x4349cf[_0x3851("0x21a")]()
        ) +
          0.05)
      );
    }),
    (_0x1b5e63["isReadable"] = function (_0x4418bb, _0x44d2db, _0x4d7efc) {
      var _0x1db993,
        _0x1220f6,
        _0x4fb05a = _0x1b5e63["readability"](_0x4418bb, _0x44d2db);
      switch (
        ((_0x1220f6 = !0x1),
        (_0x1db993 = _0x5138fa(_0x4d7efc)),
        _0x1db993[_0x3851("0x21b")] + _0x1db993[_0x3851("0x21c")])
      ) {
        case "AAsmall":
        case _0x3851("0x21d"):
          _0x1220f6 = _0x4fb05a >= 4.5;
          break;
        case _0x3851("0x21e"):
          _0x1220f6 = _0x4fb05a >= 0x3;
          break;
        case _0x3851("0x21f"):
          _0x1220f6 = _0x4fb05a >= 0x7;
      }
      return _0x1220f6;
    }),
    (_0x1b5e63["mostReadable"] = function (_0x1e2690, _0xdf764f, _0x1387b5) {
      var _0xd82ef6,
        _0x1aa11c,
        _0x58a3ee,
        _0x79e4da,
        _0x33d435 = null,
        _0x31cb71 = 0x0;
      (_0x1387b5 = _0x1387b5 || {}),
        (_0x1aa11c = _0x1387b5[_0x3851("0x220")]),
        (_0x58a3ee = _0x1387b5[_0x3851("0x21b")]),
        (_0x79e4da = _0x1387b5[_0x3851("0x21c")]);
      for (
        var _0x1dd6b4 = 0x0;
        _0x1dd6b4 < _0xdf764f[_0x3851("0x187")];
        _0x1dd6b4++
      )
        (_0xd82ef6 = _0x1b5e63[_0x3851("0x221")](
          _0x1e2690,
          _0xdf764f[_0x1dd6b4]
        )),
          _0xd82ef6 > _0x31cb71 &&
            ((_0x31cb71 = _0xd82ef6),
            (_0x33d435 = _0x1b5e63(_0xdf764f[_0x1dd6b4])));
      return _0x1b5e63[_0x3851("0x222")](_0x1e2690, _0x33d435, {
        level: _0x58a3ee,
        size: _0x79e4da,
      }) || !_0x1aa11c
        ? _0x33d435
        : ((_0x1387b5[_0x3851("0x220")] = !0x1),
          _0x1b5e63[_0x3851("0x223")](
            _0x1e2690,
            [_0x3851("0x224"), _0x3851("0x225")],
            _0x1387b5
          ));
    });
  var _0x28eb44 = (_0x1b5e63[_0x3851("0x226")] = {
      aliceblue: _0x3851("0x227"),
      antiquewhite: _0x3851("0x228"),
      aqua: _0x3851("0x229"),
      aquamarine: _0x3851("0x22a"),
      azure: _0x3851("0x22b"),
      beige: _0x3851("0x22c"),
      bisque: _0x3851("0x22d"),
      black: _0x3851("0x22e"),
      blanchedalmond: "ffebcd",
      blue: _0x3851("0x22f"),
      blueviolet: _0x3851("0x230"),
      brown: _0x3851("0x231"),
      burlywood: _0x3851("0x232"),
      burntsienna: "ea7e5d",
      cadetblue: _0x3851("0x233"),
      chartreuse: _0x3851("0x234"),
      chocolate: _0x3851("0x235"),
      coral: "ff7f50",
      cornflowerblue: _0x3851("0x236"),
      cornsilk: "fff8dc",
      crimson: "dc143c",
      cyan: _0x3851("0x229"),
      darkblue: _0x3851("0x237"),
      darkcyan: _0x3851("0x238"),
      darkgoldenrod: _0x3851("0x239"),
      darkgray: "a9a9a9",
      darkgreen: _0x3851("0x23a"),
      darkgrey: _0x3851("0x23b"),
      darkkhaki: _0x3851("0x23c"),
      darkmagenta: _0x3851("0x23d"),
      darkolivegreen: "556b2f",
      darkorange: "ff8c00",
      darkorchid: _0x3851("0x23e"),
      darkred: _0x3851("0x23f"),
      darksalmon: _0x3851("0x240"),
      darkseagreen: _0x3851("0x241"),
      darkslateblue: _0x3851("0x242"),
      darkslategray: _0x3851("0x243"),
      darkslategrey: _0x3851("0x243"),
      darkturquoise: _0x3851("0x244"),
      darkviolet: _0x3851("0x245"),
      deeppink: "ff1493",
      deepskyblue: _0x3851("0x246"),
      dimgray: _0x3851("0x247"),
      dimgrey: _0x3851("0x247"),
      dodgerblue: "1e90ff",
      firebrick: _0x3851("0x248"),
      floralwhite: "fffaf0",
      forestgreen: _0x3851("0x249"),
      fuchsia: _0x3851("0x24a"),
      gainsboro: _0x3851("0x24b"),
      ghostwhite: "f8f8ff",
      gold: _0x3851("0x24c"),
      goldenrod: "daa520",
      gray: "808080",
      green: "008000",
      greenyellow: _0x3851("0x24d"),
      grey: "808080",
      honeydew: _0x3851("0x24e"),
      hotpink: _0x3851("0x24f"),
      indianred: "cd5c5c",
      indigo: _0x3851("0x250"),
      ivory: "fffff0",
      khaki: _0x3851("0x251"),
      lavender: _0x3851("0x252"),
      lavenderblush: "fff0f5",
      lawngreen: _0x3851("0x253"),
      lemonchiffon: "fffacd",
      lightblue: _0x3851("0x254"),
      lightcoral: "f08080",
      lightcyan: _0x3851("0x255"),
      lightgoldenrodyellow: "fafad2",
      lightgray: _0x3851("0x256"),
      lightgreen: _0x3851("0x257"),
      lightgrey: _0x3851("0x256"),
      lightpink: _0x3851("0x258"),
      lightsalmon: _0x3851("0x259"),
      lightseagreen: _0x3851("0x25a"),
      lightskyblue: _0x3851("0x25b"),
      lightslategray: "789",
      lightslategrey: _0x3851("0x25c"),
      lightsteelblue: "b0c4de",
      lightyellow: _0x3851("0x25d"),
      lime: _0x3851("0x25e"),
      limegreen: "32cd32",
      linen: _0x3851("0x25f"),
      magenta: _0x3851("0x24a"),
      maroon: _0x3851("0x260"),
      mediumaquamarine: _0x3851("0x261"),
      mediumblue: _0x3851("0x262"),
      mediumorchid: _0x3851("0x263"),
      mediumpurple: _0x3851("0x264"),
      mediumseagreen: _0x3851("0x265"),
      mediumslateblue: _0x3851("0x266"),
      mediumspringgreen: _0x3851("0x267"),
      mediumturquoise: _0x3851("0x268"),
      mediumvioletred: "c71585",
      midnightblue: "191970",
      mintcream: _0x3851("0x269"),
      mistyrose: _0x3851("0x26a"),
      moccasin: _0x3851("0x26b"),
      navajowhite: _0x3851("0x26c"),
      navy: _0x3851("0x26d"),
      oldlace: _0x3851("0x26e"),
      olive: _0x3851("0x26f"),
      olivedrab: _0x3851("0x270"),
      orange: _0x3851("0x271"),
      orangered: _0x3851("0x272"),
      orchid: _0x3851("0x273"),
      palegoldenrod: _0x3851("0x274"),
      palegreen: _0x3851("0x275"),
      paleturquoise: _0x3851("0x276"),
      palevioletred: "db7093",
      papayawhip: "ffefd5",
      peachpuff: "ffdab9",
      peru: _0x3851("0x277"),
      pink: _0x3851("0x278"),
      plum: _0x3851("0x279"),
      powderblue: "b0e0e6",
      purple: _0x3851("0x27a"),
      rebeccapurple: _0x3851("0x27b"),
      red: _0x3851("0x27c"),
      rosybrown: _0x3851("0x27d"),
      royalblue: _0x3851("0x27e"),
      saddlebrown: "8b4513",
      salmon: _0x3851("0x27f"),
      sandybrown: _0x3851("0x280"),
      seagreen: _0x3851("0x281"),
      seashell: _0x3851("0x282"),
      sienna: "a0522d",
      silver: _0x3851("0x283"),
      skyblue: _0x3851("0x284"),
      slateblue: _0x3851("0x285"),
      slategray: _0x3851("0x286"),
      slategrey: "708090",
      snow: "fffafa",
      springgreen: _0x3851("0x287"),
      steelblue: _0x3851("0x288"),
      tan: "d2b48c",
      teal: _0x3851("0x289"),
      thistle: _0x3851("0x28a"),
      tomato: "ff6347",
      turquoise: _0x3851("0x28b"),
      violet: _0x3851("0x28c"),
      wheat: "f5deb3",
      white: _0x3851("0x28d"),
      whitesmoke: _0x3851("0x28e"),
      yellow: _0x3851("0x28f"),
      yellowgreen: _0x3851("0x290"),
    }),
    _0x252134 = (_0x1b5e63["hexNames"] = _0xee5222(_0x28eb44)),
    _0x4b84c8 = (function () {
      var _0x124cb9 = _0x3851("0x291"),
        _0x429e19 = _0x3851("0x292"),
        _0x275998 =
          _0x3851("0x293") + _0x429e19 + _0x3851("0x294") + _0x124cb9 + ")",
        _0xfc3050 =
          _0x3851("0x295") +
          _0x275998 +
          _0x3851("0x296") +
          _0x275998 +
          _0x3851("0x296") +
          _0x275998 +
          _0x3851("0x297"),
        _0x3b9a81 =
          _0x3851("0x295") +
          _0x275998 +
          ")[,|\x5cs]+(" +
          _0x275998 +
          _0x3851("0x296") +
          _0x275998 +
          _0x3851("0x296") +
          _0x275998 +
          ")\x5cs*\x5c)?";
      return {
        rgb: new RegExp("rgb" + _0xfc3050),
        rgba: new RegExp(_0x3851("0x1f7") + _0x3b9a81),
        hsl: new RegExp("hsl" + _0xfc3050),
        hsla: new RegExp("hsla" + _0x3b9a81),
        hsv: new RegExp(_0x3851("0x1e8") + _0xfc3050),
        hsva: new RegExp(_0x3851("0x1f9") + _0x3b9a81),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
      };
    })();
  window[_0x3851("0x298")] = _0x1b5e63;
})();
(function (_0x205593) {
  var _0x2d0f80 = (function () {
    var _0xafaf45 = _0x3851("0x299"),
      _0x38083b = {
        showEvent: _0x3851("0x167"),
        onShow: function () {},
        onBeforeShow: function () {},
        onHide: function () {},
        onChange: function () {},
        onSubmit: function () {},
        colorScheme: _0x3851("0x29a"),
        color: _0x3851("0x29b"),
        livePreview: !![],
        flat: ![],
        layout: _0x3851("0x29c"),
        submit: 0x1,
        submitText: "OK",
        height: 0x9c,
        hsl: ![],
      },
      _0xb5f7e4 = function (_0x3cad84, _0x2ccc31) {
        var _0xe9fd8d = _0x205593(_0x2ccc31)["data"](_0x3851("0x29d"))[
          _0x3851("0x1e9")
        ]
          ? _0x596c65(_0x3cad84)
          : _0x15aa77(_0x3cad84);
        _0x205593(_0x2ccc31)
          ["data"](_0x3851("0x29d"))
          [_0x3851("0x29e")]["eq"](0x1)
          [_0x3851("0x29f")](_0xe9fd8d["r"])
          [_0x3851("0x183")]()
          ["eq"](0x2)
          ["val"](_0xe9fd8d["g"])
          [_0x3851("0x183")]()
          ["eq"](0x3)
          [_0x3851("0x29f")](_0xe9fd8d["b"])
          [_0x3851("0x183")]();
      },
      _0x29983a = function (_0x4a743e, _0x1ee3c9) {
        _0x205593(_0x1ee3c9)
          [_0x3851("0x2a0")](_0x3851("0x29d"))
          [_0x3851("0x29e")]["eq"](0x4)
          [_0x3851("0x29f")](Math[_0x3851("0x1c0")](_0x4a743e["h"]))
          [_0x3851("0x183")]()
          ["eq"](0x5)
          [_0x3851("0x29f")](Math[_0x3851("0x1c0")](_0x4a743e["s"]))
          [_0x3851("0x183")]()
          ["eq"](0x6)
          [_0x3851("0x29f")](Math[_0x3851("0x1c0")](_0x4a743e["x"]))
          [_0x3851("0x183")]();
      },
      _0x4dfba7 = function (_0x838cd4, _0x1e8254) {
        _0x205593(_0x1e8254)
          ["data"](_0x3851("0x29d"))
          [_0x3851("0x29e")]["eq"](0x0)
          [_0x3851("0x29f")](
            _0x205593(_0x1e8254)[_0x3851("0x2a0")]("colpick")[_0x3851("0x1e9")]
              ? _0x399aac(_0x838cd4)
              : _0x3769d1(_0x838cd4)
          );
      },
      _0x3a0abb = function (_0x26424d, _0x4b35b1) {
        var _0x3546cc = _0x34b0f9(
          "#" +
            (_0x205593(_0x4b35b1)[_0x3851("0x2a0")]("colpick")["hsl"]
              ? _0x399aac({ h: _0x26424d["h"], s: 0x64, x: 0x32 })
              : _0x3769d1({ h: _0x26424d["h"], s: 0x64, x: 0x64 }))
        );
        var _0x403d1b =
          _0x3851("0x209") +
          _0x3546cc["r"] +
          "," +
          _0x3546cc["g"] +
          "," +
          _0x3546cc["b"] +
          "," +
          _0x205593(_0x4b35b1)[_0x3851("0x2a0")](_0x3851("0x29d"))["a"] +
          ")";
        _0x205593(_0x4b35b1)
          ["data"](_0x3851("0x29d"))
          [_0x3851("0x2a1")]["css"](_0x3851("0x2a2"), _0x403d1b);
        _0x205593(_0x4b35b1)
          ["data"](_0x3851("0x29d"))
          [_0x3851("0x2a3")][_0x3851("0x1b6")]({
            left: parseInt(
              (_0x205593(_0x4b35b1)[_0x3851("0x2a0")](_0x3851("0x29d"))[
                _0x3851("0x1c4")
              ] *
                _0x26424d["s"]) /
                0x64,
              0xa
            ),
            top: parseInt(
              (_0x205593(_0x4b35b1)[_0x3851("0x2a0")](_0x3851("0x29d"))[
                _0x3851("0x1c4")
              ] *
                (0x64 - _0x26424d["x"])) /
                0x64,
              0xa
            ),
          });
      },
      _0x465947 = function (_0x59b0ff, _0x280039) {
        _0x205593(_0x280039)
          [_0x3851("0x2a0")](_0x3851("0x29d"))
          [_0x3851("0x2a4")][_0x3851("0x1b6")](
            _0x3851("0x19c"),
            parseInt(
              _0x205593(_0x280039)[_0x3851("0x2a0")](_0x3851("0x29d"))[
                _0x3851("0x1c4")
              ] -
                (_0x205593(_0x280039)[_0x3851("0x2a0")]("colpick")[
                  _0x3851("0x1c4")
                ] *
                  _0x59b0ff["h"]) /
                  0x168,
              0xa
            )
          );
      },
      _0x538e72 = function (_0xf7dadf, _0x23b380) {
        _0x205593(_0x23b380)
          ["data"]("colpick")
          [_0x3851("0x2a5")][_0x3851("0x1b6")](
            "backgroundColor",
            "#" +
              (_0x205593(_0x23b380)[_0x3851("0x2a0")](_0x3851("0x29d"))[
                _0x3851("0x1e9")
              ]
                ? _0x399aac(_0xf7dadf)
                : _0x3769d1(_0xf7dadf))
          );
      },
      _0x29c316 = function (_0x40008f, _0xb430c9) {
        _0x205593(_0xb430c9)
          [_0x3851("0x2a0")]("colpick")
          [_0x3851("0x2a6")][_0x3851("0x1b6")](
            "backgroundColor",
            "#" +
              (_0x205593(_0xb430c9)["data"](_0x3851("0x29d"))["hsl"]
                ? _0x399aac(_0x40008f)
                : _0x3769d1(_0x40008f))
          );
      },
      _0xd8b1f7 = function (_0x183810, _0x4ea809) {
        var _0x3df3c3 =
          "linear-gradient(to\x20right,\x20rgba(255,255,255," +
          _0x205593(_0x4ea809)[_0x3851("0x2a0")](_0x3851("0x29d"))["a"] +
          _0x3851("0x2a7");
        _0x205593(_0x4ea809)
          [_0x3851("0x2a0")](_0x3851("0x29d"))
          [_0x3851("0x2a8")]["css"](_0x3851("0x2a9"), _0x3df3c3);
        _0x3df3c3 =
          "linear-gradient(to\x20bottom,\x20rgba(0,0,0,0),\x20rgba(0,0,0," +
          _0x205593(_0x4ea809)["data"](_0x3851("0x29d"))["a"] +
          "))";
        _0x205593(_0x4ea809)
          [_0x3851("0x2a0")]("colpick")
          [_0x3851("0x2aa")][_0x3851("0x1b6")](_0x3851("0x2a9"), _0x3df3c3);
        _0x205593(_0x4ea809)
          [_0x3851("0x2a0")](_0x3851("0x29d"))
          [_0x3851("0x2ab")][_0x3851("0x1b6")](
            "left",
            parseInt(
              _0x205593(_0x4ea809)[_0x3851("0x2a0")]("colpick")[
                _0x3851("0x1c4")
              ] * _0x205593(_0x4ea809)[_0x3851("0x2a0")](_0x3851("0x29d"))["a"],
              0xa
            )
          );
      },
      _0x363a6a = function (_0x3c7214) {
        var _0x28f44d = _0x205593(this)[_0x3851("0x2ac")]()[_0x3851("0x2ac")](),
          _0x3a1d4d;
        if (!_0x28f44d["data"]("colpick")) {
          _0x28f44d = _0x205593(this);
        }
        if (
          this[_0x3851("0x2ad")][_0x3851("0x2ae")][_0x3851("0x1f2")](
            _0x3851("0x2af")
          ) > 0x0
        ) {
          _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[
            _0x3851("0x2b0")
          ] = _0x3a1d4d = _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[
            _0x3851("0x1e9")
          ]
            ? _0x25d473(_0x517837(this[_0x3851("0x2b1")]))
            : _0x5ab6e3(_0x517837(this["value"]));
          _0xb5f7e4(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
          _0x29983a(_0x3a1d4d, _0x28f44d["get"](0x0));
        } else if (
          this[_0x3851("0x2ad")][_0x3851("0x2ae")][_0x3851("0x1f2")](
            _0x3851("0x2b3")
          ) > 0x0
        ) {
          _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[
            _0x3851("0x2b0")
          ] = _0x3a1d4d = _0xcd4f25({
            h: parseInt(
              _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))
                ["fields"]["eq"](0x4)
                [_0x3851("0x29f")](),
              0xa
            ),
            s: parseInt(
              _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))
                [_0x3851("0x29e")]["eq"](0x5)
                ["val"](),
              0xa
            ),
            x: parseInt(
              _0x28f44d[_0x3851("0x2a0")]("colpick")
                ["fields"]["eq"](0x6)
                [_0x3851("0x29f")](),
              0xa
            ),
          });
          _0xb5f7e4(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
          _0x4dfba7(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
        } else {
          var _0x30919f = {
            r: parseInt(
              _0x28f44d["data"](_0x3851("0x29d"))
                [_0x3851("0x29e")]["eq"](0x1)
                [_0x3851("0x29f")](),
              0xa
            ),
            g: parseInt(
              _0x28f44d[_0x3851("0x2a0")]("colpick")
                [_0x3851("0x29e")]["eq"](0x2)
                [_0x3851("0x29f")](),
              0xa
            ),
            b: parseInt(
              _0x28f44d[_0x3851("0x2a0")]("colpick")
                ["fields"]["eq"](0x3)
                ["val"](),
              0xa
            ),
          };
          _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[
            _0x3851("0x2b0")
          ] = _0x3a1d4d = _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[
            _0x3851("0x1e9")
          ]
            ? _0x2ed8d3(_0x19aa70(_0x30919f))
            : _0x118783(_0x19aa70(_0x30919f));
          _0x4dfba7(_0x3a1d4d, _0x28f44d["get"](0x0));
          _0x29983a(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
        }
        _0x3a0abb(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
        _0x465947(_0x3a1d4d, _0x28f44d["get"](0x0));
        _0x29c316(_0x3a1d4d, _0x28f44d["get"](0x0));
        _0xd8b1f7(_0x3a1d4d, _0x28f44d[_0x3851("0x2b2")](0x0));
        _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))[_0x3851("0x2b4")][
          _0x3851("0x2b5")
        ](_0x28f44d[_0x3851("0x2ac")](), [
          _0x3a1d4d,
          _0x28f44d[_0x3851("0x2a0")]("colpick")[_0x3851("0x1e9")]
            ? _0x399aac(_0x3a1d4d)
            : _0x3769d1(_0x3a1d4d),
          _0x28f44d["data"]("colpick")[_0x3851("0x1e9")]
            ? _0x596c65(_0x3a1d4d)
            : _0x15aa77(_0x3a1d4d),
          _0x28f44d["data"](_0x3851("0x29d"))["a"],
          _0x28f44d[_0x3851("0x2a0")](_0x3851("0x29d"))["el"],
          0x0,
        ]);
      },
      _0x3647e9 = function (_0x11b9b6) {
        _0x205593(this)[_0x3851("0x2ac")]()[_0x3851("0x1bf")](_0x3851("0x2b6"));
      },
      _0x3f746a = function () {
        _0x205593(this)
          [_0x3851("0x2ac")]()
          ["parent"]()
          [_0x3851("0x2a0")]("colpick")
          [_0x3851("0x29e")]["parent"]()
          [_0x3851("0x1bf")](_0x3851("0x2b6"));
        _0x205593(this)["parent"]()[_0x3851("0x2b7")]("colpick_focus");
      },
      _0x3b4765 = function (_0x197117) {
        _0x197117["preventDefault"]
          ? _0x197117["preventDefault"]()
          : (_0x197117[_0x3851("0x2b8")] = ![]);
        var _0x30068d = _0x205593(this)
          [_0x3851("0x2ac")]()
          [_0x3851("0x176")](_0x3851("0x2b9"))
          [_0x3851("0x2ba")]();
        var _0xd4f068 = {
          el: _0x205593(this)["parent"]()["addClass"]("colpick_slider"),
          max:
            this[_0x3851("0x2ad")]["className"]["indexOf"](_0x3851("0x2bb")) >
            0x0
              ? 0x168
              : this["parentNode"][_0x3851("0x2ae")][_0x3851("0x1f2")]("_hsx") >
                0x0
              ? 0x64
              : 0xff,
          y: _0x197117["pageY"],
          field: _0x30068d,
          val: parseInt(_0x30068d["val"](), 0xa),
          preview: _0x205593(this)
            [_0x3851("0x2ac")]()
            [_0x3851("0x2ac")]()
            ["data"](_0x3851("0x29d"))["livePreview"],
        };
        _0x205593(document)["mouseup"](_0xd4f068, _0x11148c);
        _0x205593(document)[_0x3851("0x2bc")](_0xd4f068, _0xffa9de);
      },
      _0xffa9de = function (_0x49da46) {
        _0x49da46[_0x3851("0x2a0")][_0x3851("0x2bd")][_0x3851("0x29f")](
          Math["max"](
            0x0,
            Math[_0x3851("0x2be")](
              _0x49da46[_0x3851("0x2a0")]["max"],
              parseInt(
                _0x49da46[_0x3851("0x2a0")][_0x3851("0x29f")] -
                  _0x49da46["pageY"] +
                  _0x49da46[_0x3851("0x2a0")]["y"],
                0xa
              )
            )
          )
        );
        if (_0x49da46[_0x3851("0x2a0")][_0x3851("0x2bf")]) {
          _0x363a6a["apply"](
            _0x49da46["data"][_0x3851("0x2bd")][_0x3851("0x2b2")](0x0),
            [!![]]
          );
        }
        return ![];
      },
      _0x11148c = function (_0x3888a2) {
        _0x363a6a[_0x3851("0x2b5")](
          _0x3888a2[_0x3851("0x2a0")]["field"]["get"](0x0),
          [!![]]
        );
        _0x3888a2[_0x3851("0x2a0")]["el"]
          [_0x3851("0x1bf")](_0x3851("0x2c0"))
          [_0x3851("0x176")](_0x3851("0x2b9"))
          [_0x3851("0x2ba")]();
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x182"), _0x11148c);
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x2bc"), _0xffa9de);
        return ![];
      },
      _0x246969 = function (_0x11da1c) {
        _0x11da1c[_0x3851("0x2c2")]
          ? _0x11da1c[_0x3851("0x2c2")]()
          : (_0x11da1c[_0x3851("0x2b8")] = ![]);
        var _0xfa7df = {
          cal: _0x205593(this)[_0x3851("0x2ac")](),
          x: _0x205593(this)["offset"]()[_0x3851("0x199")],
        };
        _0x205593(document)["on"](_0x3851("0x2c3"), _0xfa7df, _0xfc1855);
        _0x205593(document)["on"](_0x3851("0x2c4"), _0xfa7df, _0xedbdce);
        var _0x4b6250 =
          _0x11da1c[_0x3851("0x173")] == _0x3851("0x2c5")
            ? _0x11da1c[_0x3851("0x2c6")][_0x3851("0x2c7")][0x0][
                _0x3851("0x2c8")
              ]
            : _0x11da1c[_0x3851("0x2c8")];
        _0xfa7df[_0x3851("0x2c9")][_0x3851("0x2a0")]("colpick")[
          "a"
        ] = _0x2d4a9d(
          (_0x4b6250 - _0xfa7df["x"]) /
            _0xfa7df[_0x3851("0x2c9")][_0x3851("0x2a0")](_0x3851("0x29d"))[
              _0x3851("0x1c4")
            ]
        );
        _0x363a6a[_0x3851("0x2b5")](
          _0xfa7df[_0x3851("0x2c9")][_0x3851("0x2b2")](0x0),
          [
            _0xfa7df[_0x3851("0x2c9")][_0x3851("0x2a0")](_0x3851("0x29d"))[
              _0x3851("0x2ca")
            ],
          ]
        );
        return ![];
      },
      _0xedbdce = function (_0x5b2995) {
        var _0x230f3b =
          _0x5b2995[_0x3851("0x173")] == "touchmove"
            ? _0x5b2995[_0x3851("0x2c6")][_0x3851("0x2c7")][0x0][
                _0x3851("0x2c8")
              ]
            : _0x5b2995[_0x3851("0x2c8")];
        _0x5b2995["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](_0x3851("0x29d"))[
          "a"
        ] = _0x2d4a9d(
          (_0x230f3b - _0x5b2995["data"]["x"]) /
            _0x5b2995["data"][_0x3851("0x2c9")][_0x3851("0x2a0")]("colpick")[
              "height"
            ]
        );
        _0x363a6a[_0x3851("0x2b5")](
          _0x5b2995[_0x3851("0x2a0")][_0x3851("0x2c9")][_0x3851("0x2b2")](0x0),
          [_0x5b2995[_0x3851("0x2a0")][_0x3851("0x2bf")]]
        );
        return ![];
      },
      _0xfc1855 = function (_0x3fc852) {
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x2c3"), _0xfc1855);
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x2c4"), _0xedbdce);
        return ![];
      },
      _0x4b479e = function (_0x16a7db) {
        _0x16a7db["preventDefault"]
          ? _0x16a7db["preventDefault"]()
          : (_0x16a7db[_0x3851("0x2b8")] = ![]);
        var _0x2612ec = {
          cal: _0x205593(this)[_0x3851("0x2ac")](),
          y: _0x205593(this)[_0x3851("0x2cb")]()[_0x3851("0x19c")],
        };
        _0x205593(document)["on"](_0x3851("0x2c3"), _0x2612ec, _0x346c3b);
        _0x205593(document)["on"](_0x3851("0x2c4"), _0x2612ec, _0x56a335);
        var _0x2abdca =
          _0x16a7db[_0x3851("0x173")] == _0x3851("0x2c5")
            ? _0x16a7db[_0x3851("0x2c6")][_0x3851("0x2c7")][0x0][
                _0x3851("0x2cc")
              ]
            : _0x16a7db[_0x3851("0x2cc")];
        _0x363a6a[_0x3851("0x2b5")](
          _0x2612ec[_0x3851("0x2c9")]
            [_0x3851("0x2a0")]("colpick")
            [_0x3851("0x29e")]["eq"](0x4)
            [_0x3851("0x29f")](
              parseInt(
                (0x168 *
                  (_0x2612ec[_0x3851("0x2c9")][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )[_0x3851("0x1c4")] -
                    (_0x2abdca - _0x2612ec["y"]))) /
                  _0x2612ec[_0x3851("0x2c9")][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )[_0x3851("0x1c4")],
                0xa
              )
            )
            [_0x3851("0x2b2")](0x0),
          [_0x2612ec["cal"]["data"](_0x3851("0x29d"))[_0x3851("0x2ca")]]
        );
        return ![];
      },
      _0x56a335 = function (_0x152c36) {
        var _0x5a3eda =
          _0x152c36[_0x3851("0x173")] == _0x3851("0x2cd")
            ? _0x152c36["originalEvent"][_0x3851("0x2c7")][0x0][
                _0x3851("0x2cc")
              ]
            : _0x152c36[_0x3851("0x2cc")];
        _0x363a6a["apply"](
          _0x152c36[_0x3851("0x2a0")]["cal"]
            [_0x3851("0x2a0")](_0x3851("0x29d"))
            ["fields"]["eq"](0x4)
            [_0x3851("0x29f")](
              parseInt(
                (0x168 *
                  (_0x152c36["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )[_0x3851("0x1c4")] -
                    Math["max"](
                      0x0,
                      Math[_0x3851("0x2be")](
                        _0x152c36["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](
                          _0x3851("0x29d")
                        )["height"],
                        _0x5a3eda - _0x152c36[_0x3851("0x2a0")]["y"]
                      )
                    ))) /
                  _0x152c36[_0x3851("0x2a0")][_0x3851("0x2c9")][
                    _0x3851("0x2a0")
                  ]("colpick")["height"],
                0xa
              )
            )
            [_0x3851("0x2b2")](0x0),
          [_0x152c36[_0x3851("0x2a0")][_0x3851("0x2bf")]]
        );
        return ![];
      },
      _0x346c3b = function (_0x28b5fa) {
        _0x205593(document)[_0x3851("0x2c1")]("mouseup\x20touchend", _0x346c3b);
        _0x205593(document)["off"]("mousemove\x20touchmove", _0x56a335);
        return ![];
      },
      _0x603f9b = function (_0x11823e) {
        _0x11823e["preventDefault"]
          ? _0x11823e[_0x3851("0x2c2")]()
          : (_0x11823e[_0x3851("0x2b8")] = ![]);
        var _0x15c1c9 = {
          cal: _0x205593(this)[_0x3851("0x2ac")](),
          pos: _0x205593(this)["offset"](),
        };
        _0x15c1c9[_0x3851("0x2bf")] = _0x15c1c9[_0x3851("0x2c9")][
          _0x3851("0x2a0")
        ](_0x3851("0x29d"))[_0x3851("0x2ca")];
        _0x205593(document)["on"]("mouseup\x20touchend", _0x15c1c9, _0x49cf11);
        _0x205593(document)["on"](
          "mousemove\x20touchmove",
          _0x15c1c9,
          _0x3cfe18
        );
        var _0x2c0a72, _0xcaa350;
        if (_0x11823e[_0x3851("0x173")] == _0x3851("0x2c5")) {
          (pageX = _0x11823e["originalEvent"][_0x3851("0x2c7")][0x0]["pageX"]),
            (_0xcaa350 =
              _0x11823e[_0x3851("0x2c6")][_0x3851("0x2c7")][0x0][
                _0x3851("0x2cc")
              ]);
        } else {
          pageX = _0x11823e["pageX"];
          _0xcaa350 = _0x11823e["pageY"];
        }
        _0x363a6a["apply"](
          _0x15c1c9[_0x3851("0x2c9")]
            ["data"](_0x3851("0x29d"))
            ["fields"]["eq"](0x6)
            [_0x3851("0x29f")](
              parseInt(
                (0x64 *
                  (_0x15c1c9[_0x3851("0x2c9")][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )["height"] -
                    (_0xcaa350 - _0x15c1c9[_0x3851("0x19d")]["top"]))) /
                  _0x15c1c9[_0x3851("0x2c9")]["data"](_0x3851("0x29d"))[
                    _0x3851("0x1c4")
                  ],
                0xa
              )
            )
            [_0x3851("0x183")]()
            ["eq"](0x5)
            [_0x3851("0x29f")](
              parseInt(
                (0x64 *
                  (pageX - _0x15c1c9[_0x3851("0x19d")][_0x3851("0x199")])) /
                  _0x15c1c9[_0x3851("0x2c9")]["data"](_0x3851("0x29d"))[
                    _0x3851("0x1c4")
                  ],
                0xa
              )
            )
            [_0x3851("0x2b2")](0x0),
          [_0x15c1c9[_0x3851("0x2bf")]]
        );
        return ![];
      },
      _0x3cfe18 = function (_0x53a988) {
        var _0x325307, _0x96c01c;
        if (_0x53a988[_0x3851("0x173")] == _0x3851("0x2cd")) {
          (pageX = _0x53a988["originalEvent"][_0x3851("0x2c7")][0x0]["pageX"]),
            (_0x96c01c =
              _0x53a988[_0x3851("0x2c6")][_0x3851("0x2c7")][0x0]["pageY"]);
        } else {
          pageX = _0x53a988[_0x3851("0x2c8")];
          _0x96c01c = _0x53a988[_0x3851("0x2cc")];
        }
        _0x363a6a[_0x3851("0x2b5")](
          _0x53a988["data"][_0x3851("0x2c9")]
            [_0x3851("0x2a0")](_0x3851("0x29d"))
            ["fields"]["eq"](0x6)
            [_0x3851("0x29f")](
              parseInt(
                (0x64 *
                  (_0x53a988[_0x3851("0x2a0")]["cal"]["data"](_0x3851("0x29d"))[
                    _0x3851("0x1c4")
                  ] -
                    Math[_0x3851("0x200")](
                      0x0,
                      Math["min"](
                        _0x53a988["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](
                          _0x3851("0x29d")
                        )[_0x3851("0x1c4")],
                        _0x96c01c -
                          _0x53a988[_0x3851("0x2a0")][_0x3851("0x19d")]["top"]
                      )
                    ))) /
                  _0x53a988[_0x3851("0x2a0")]["cal"][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )["height"],
                0xa
              )
            )
            [_0x3851("0x183")]()
            ["eq"](0x5)
            [_0x3851("0x29f")](
              parseInt(
                (0x64 *
                  Math[_0x3851("0x200")](
                    0x0,
                    Math[_0x3851("0x2be")](
                      _0x53a988["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](
                        _0x3851("0x29d")
                      )[_0x3851("0x1c4")],
                      pageX -
                        _0x53a988[_0x3851("0x2a0")][_0x3851("0x19d")][
                          _0x3851("0x199")
                        ]
                    )
                  )) /
                  _0x53a988["data"][_0x3851("0x2c9")][_0x3851("0x2a0")](
                    _0x3851("0x29d")
                  )[_0x3851("0x1c4")],
                0xa
              )
            )
            [_0x3851("0x2b2")](0x0),
          [_0x53a988[_0x3851("0x2a0")][_0x3851("0x2bf")]]
        );
        return ![];
      },
      _0x49cf11 = function (_0x4067b0) {
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x2c3"), _0x49cf11);
        _0x205593(document)[_0x3851("0x2c1")](_0x3851("0x2c4"), _0x3cfe18);
        return ![];
      },
      _0x376e1f = function (_0x406292) {
        var _0x4f0651 = _0x205593(this)[_0x3851("0x2ac")]();
        var _0x15b9ff = _0x4f0651[_0x3851("0x2a0")]("colpick")[
          _0x3851("0x2b0")
        ];
        _0x4f0651[_0x3851("0x2a0")](_0x3851("0x29d"))[
          _0x3851("0x2ce")
        ] = _0x15b9ff;
        _0x538e72(_0x15b9ff, _0x4f0651[_0x3851("0x2b2")](0x0));
        _0x4f0651[_0x3851("0x2a0")]("colpick")[_0x3851("0x2cf")](
          _0x15b9ff,
          _0x4f0651[_0x3851("0x2a0")](_0x3851("0x29d"))["hsl"]
            ? _0x399aac(_0x15b9ff)
            : _0x3769d1(_0x15b9ff),
          _0x4f0651["data"](_0x3851("0x29d"))[_0x3851("0x1e9")]
            ? _0x596c65(_0x15b9ff)
            : _0x15aa77(_0x15b9ff),
          _0x4f0651[_0x3851("0x2a0")](_0x3851("0x29d"))["el"]
        );
      },
      _0x4c6ce1 = function (_0x178a0b) {
        _0x178a0b[_0x3851("0x2d0")]();
        var _0x18a323 = _0x205593(
          "#" + _0x205593(this)[_0x3851("0x2a0")]("colpickId")
        );
        _0x18a323["data"](_0x3851("0x29d"))[_0x3851("0x2d1")][
          _0x3851("0x2b5")
        ](this, [_0x18a323[_0x3851("0x2b2")](0x0)]);
        var _0xebc26a = _0x205593(this)["offset"]();
        var _0x947a57 = _0xebc26a["top"] + this["offsetHeight"];
        var _0x3636c7 = _0xebc26a["left"];
        var _0x3d3fe3 = _0x33dacd();
        var _0x29af3a = _0x18a323[_0x3851("0x1c3")]();
        if (_0x3636c7 + _0x29af3a > _0x3d3fe3["l"] + _0x3d3fe3["w"]) {
          _0x3636c7 -= _0x29af3a;
        }
        _0x18a323[_0x3851("0x1b6")]({
          left: _0x3636c7 + "px",
          top: _0x947a57 + "px",
        });
        if (
          _0x18a323[_0x3851("0x2a0")](_0x3851("0x29d"))["onShow"][
            _0x3851("0x2b5")
          ](this, [_0x18a323[_0x3851("0x2b2")](0x0)]) != ![]
        ) {
          _0x18a323[_0x3851("0x2d2")]();
        }
        _0x205593(_0x3851("0x2d3"))["mousedown"]({ cal: _0x18a323 }, _0x472324);
        _0x18a323["mousedown"](function (_0x178a0b) {
          _0x178a0b[_0x3851("0x2d0")]();
        });
      },
      _0x472324 = function (_0x31a652) {
        if (
          _0x31a652[_0x3851("0x2a0")]["cal"]
            ["data"](_0x3851("0x29d"))
            [_0x3851("0x2d4")][_0x3851("0x2b5")](this, [
              _0x31a652[_0x3851("0x2a0")][_0x3851("0x2c9")][_0x3851("0x2b2")](
                0x0
              ),
            ]) != ![]
        ) {
          _0x31a652[_0x3851("0x2a0")][_0x3851("0x2c9")][_0x3851("0x2d5")]();
        }
        _0x205593(_0x3851("0x2d3"))[_0x3851("0x2c1")](
          _0x3851("0x177"),
          _0x472324
        );
      },
      _0x33dacd = function () {
        var _0x3591a = document[_0x3851("0x2d6")] == _0x3851("0x2d7");
        return {
          l:
            window[_0x3851("0x2d8")] ||
            (_0x3591a
              ? document[_0x3851("0x2d9")]["scrollLeft"]
              : document[_0x3851("0x2da")]["scrollLeft"]),
          w:
            window[_0x3851("0x1aa")] ||
            (_0x3591a
              ? document[_0x3851("0x2d9")][_0x3851("0x2db")]
              : document[_0x3851("0x2da")][_0x3851("0x2db")]),
        };
      },
      _0xcd4f25 = function (_0x388071) {
        return {
          h: Math["min"](0x168, Math[_0x3851("0x200")](0x0, _0x388071["h"])),
          s: Math[_0x3851("0x2be")](0x64, Math["max"](0x0, _0x388071["s"])),
          x: Math["min"](0x64, Math["max"](0x0, _0x388071["x"])),
        };
      },
      _0x19aa70 = function (_0x3f1178) {
        return {
          r: Math[_0x3851("0x2be")](
            0xff,
            Math[_0x3851("0x200")](0x0, _0x3f1178["r"])
          ),
          g: Math["min"](0xff, Math[_0x3851("0x200")](0x0, _0x3f1178["g"])),
          b: Math["min"](0xff, Math["max"](0x0, _0x3f1178["b"])),
        };
      },
      _0x517837 = function (_0x10e23a) {
        var _0x4d0052 = 0x6 - _0x10e23a[_0x3851("0x187")];
        if (_0x4d0052 > 0x0) {
          var _0x5a460b = [];
          for (var _0x9251ce = 0x0; _0x9251ce < _0x4d0052; _0x9251ce++) {
            _0x5a460b[_0x3851("0x186")]("0");
          }
          _0x5a460b["push"](_0x10e23a);
          _0x10e23a = _0x5a460b[_0x3851("0x1d9")]("");
        }
        return _0x10e23a;
      },
      _0x2d4a9d = function (_0x205500) {
        if (_0x205500 > 0x1) {
          _0x205500 = 0x1;
        } else if (_0x205500 < 0x0) {
          _0x205500 = 0x0;
        }
        return _0x205500;
      };
    restoreOriginal = function () {
      var _0x3da8b8 = _0x205593(this)[_0x3851("0x2ac")]();
      var _0x132897 = _0x3da8b8[_0x3851("0x2a0")]("colpick")[_0x3851("0x2ce")];
      _0x3da8b8["data"](_0x3851("0x29d"))[_0x3851("0x2b0")] = _0x132897;
      _0xb5f7e4(_0x132897, _0x3da8b8[_0x3851("0x2b2")](0x0));
      _0x4dfba7(_0x132897, _0x3da8b8["get"](0x0));
      _0x29983a(_0x132897, _0x3da8b8[_0x3851("0x2b2")](0x0));
      _0x3a0abb(_0x132897, _0x3da8b8[_0x3851("0x2b2")](0x0));
      _0x465947(_0x132897, _0x3da8b8[_0x3851("0x2b2")](0x0));
      _0x29c316(_0x132897, _0x3da8b8[_0x3851("0x2b2")](0x0));
    };
    return {
      init: function (_0x293e76) {
        _0x293e76 = _0x205593[_0x3851("0x185")]({}, _0x38083b, _0x293e76 || {});
        if (typeof _0x293e76["color"] == _0x3851("0x175")) {
          _0x293e76["color"] = _0x293e76["hsl"]
            ? _0x25d473(_0x293e76[_0x3851("0x2b0")])
            : _0x5ab6e3(_0x293e76[_0x3851("0x2b0")]);
        } else if (
          _0x293e76[_0x3851("0x2b0")]["r"] != undefined &&
          _0x293e76[_0x3851("0x2b0")]["g"] != undefined &&
          _0x293e76[_0x3851("0x2b0")]["b"] != undefined
        ) {
          _0x293e76[_0x3851("0x2b0")] = _0x293e76[_0x3851("0x1e9")]
            ? _0x2ed8d3(_0x293e76[_0x3851("0x2b0")])
            : _0x118783(_0x293e76["color"]);
        } else if (
          _0x293e76[_0x3851("0x2b0")]["h"] != undefined &&
          _0x293e76["color"]["s"] != undefined &&
          _0x293e76[_0x3851("0x2b0")]["b"] != undefined
        ) {
          _0x293e76[_0x3851("0x2b0")] = _0x293e76[_0x3851("0x1e9")]
            ? fixHsl(_0x293e76[_0x3851("0x2b0")])
            : fixHsb(_0x293e76[_0x3851("0x2b0")]);
        } else {
          return this;
        }
        _0x293e76["a"] = _0x293e76["a"] || 0x1;
        return this[_0x3851("0x2dc")](function () {
          if (!_0x205593(this)["data"]("colpickId")) {
            var _0x1dd434 = _0x205593[_0x3851("0x185")]({}, _0x293e76);
            _0x1dd434[_0x3851("0x2ce")] = _0x293e76["color"];
            var _0x59efb1 =
              _0x3851("0x2dd") + parseInt(Math[_0x3851("0x1b9")]() * 0x3e8);
            _0x205593(this)["data"](_0x3851("0x2de"), _0x59efb1);
            var _0x3e4a45 = _0x205593(_0xafaf45)["attr"]("id", _0x59efb1);
            _0x3e4a45[_0x3851("0x2b7")](
              _0x3851("0x2df") +
                _0x1dd434[_0x3851("0x2e0")] +
                (_0x1dd434[_0x3851("0x2e1")]
                  ? ""
                  : "\x20colpick_" + _0x1dd434[_0x3851("0x2e0")] + "_ns")
            );
            if (_0x1dd434[_0x3851("0x2e2")] != _0x3851("0x29a"))
              _0x3e4a45[_0x3851("0x2b7")](
                _0x3851("0x2df") + _0x1dd434[_0x3851("0x2e2")]
              );
            if (_0x1dd434["hsl"]) _0x3e4a45[_0x3851("0x2b7")](_0x3851("0x2e3"));
            _0x3e4a45[_0x3851("0x176")]("div.colpick_submit")
              ["html"](_0x1dd434[_0x3851("0x2e4")])
              [_0x3851("0x167")](_0x376e1f);
            _0x1dd434[_0x3851("0x29e")] = _0x3e4a45[_0x3851("0x176")](
              _0x3851("0x2b9")
            )
              [_0x3851("0x2e5")](_0x363a6a)
              ["blur"](_0x3647e9)
              [_0x3851("0x2ba")](_0x3f746a);
            _0x3e4a45["find"](_0x3851("0x2e6"))
              [_0x3851("0x177")](_0x3b4765)
              ["end"]()
              ["find"](_0x3851("0x2e7"))
              ["click"](restoreOriginal);
            _0x1dd434[_0x3851("0x2a1")] = _0x3e4a45[_0x3851("0x176")](
              _0x3851("0x2e8")
            )["on"]("mousedown\x20touchstart", _0x603f9b);
            _0x1dd434["selectorIndic"] = _0x1dd434[_0x3851("0x2a1")][
              _0x3851("0x176")
            ](_0x3851("0x2e9"));
            _0x1dd434["el"] = this;
            _0x1dd434[_0x3851("0x2a4")] = _0x3e4a45[_0x3851("0x176")](
              "div.colpick_hue_arrs"
            );
            huebar = _0x1dd434[_0x3851("0x2a4")][_0x3851("0x2ac")]();
            var _0x3f206a = navigator[_0x3851("0x2ea")]["toLowerCase"]();
            var _0x23bc33 = navigator["appName"] === _0x3851("0x2eb");
            var _0x4a865e = _0x23bc33
              ? parseFloat(
                  _0x3f206a["match"](/msie ([0-9]{1,}[\.0-9]{0,})/)[0x1]
                )
              : 0x0;
            var _0x22680a = _0x23bc33 && _0x4a865e < 0xa;
            var _0x149404 = [
              "#ff0000",
              _0x3851("0x2ec"),
              _0x3851("0x2ed"),
              _0x3851("0x2ee"),
              "#0000ff",
              _0x3851("0x2ef"),
              _0x3851("0x2f0"),
              _0x3851("0x2f1"),
              _0x3851("0x2f2"),
              _0x3851("0x2f3"),
              _0x3851("0x2f4"),
              _0x3851("0x2f5"),
              _0x3851("0x2f6"),
            ];
            if (_0x22680a) {
              var _0x1697ae, _0x108701;
              for (_0x1697ae = 0x0; _0x1697ae <= 0xb; _0x1697ae++) {
                _0x108701 = _0x205593("<div></div>")[_0x3851("0x188")](
                  _0x3851("0x19b"),
                  _0x3851("0x2f7") +
                    _0x149404[_0x1697ae] +
                    _0x3851("0x2f8") +
                    _0x149404[_0x1697ae + 0x1] +
                    _0x3851("0x2f9") +
                    _0x149404[_0x1697ae] +
                    _0x3851("0x2f8") +
                    _0x149404[_0x1697ae + 0x1] +
                    _0x3851("0x2fa")
                );
                huebar["append"](_0x108701);
              }
            } else {
              stopList = _0x149404[_0x3851("0x1d9")](",");
              huebar[_0x3851("0x188")](
                _0x3851("0x19b"),
                _0x3851("0x2fb") +
                  stopList +
                  ");\x20background:-moz-linear-gradient(top\x20center," +
                  stopList +
                  _0x3851("0x2fc") +
                  stopList +
                  ");\x20"
              );
            }
            _0x3e4a45[_0x3851("0x176")](_0x3851("0x2fd"))["on"](
              _0x3851("0x2fe"),
              _0x4b479e
            );
            _0x3e4a45[_0x3851("0x176")]("div.colpick_alpha")["on"](
              "mousedown\x20touchstart",
              _0x246969
            );
            _0x1dd434["newColor"] = _0x3e4a45[_0x3851("0x176")](
              _0x3851("0x2ff")
            );
            _0x1dd434[_0x3851("0x2a5")] = _0x3e4a45[_0x3851("0x176")](
              "div.colpick_current_color"
            );
            _0x1dd434[_0x3851("0x2ab")] = _0x3e4a45["find"](_0x3851("0x300"));
            _0x1dd434[_0x3851("0x2a8")] = _0x3e4a45["find"](_0x3851("0x301"));
            _0x1dd434[_0x3851("0x2aa")] = _0x3e4a45["find"](
              "div.colpick_color_overlay2"
            );
            _0x3e4a45[_0x3851("0x2a0")](_0x3851("0x29d"), _0x1dd434);
            _0xb5f7e4(_0x1dd434["color"], _0x3e4a45[_0x3851("0x2b2")](0x0));
            _0x29983a(
              _0x1dd434[_0x3851("0x2b0")],
              _0x3e4a45[_0x3851("0x2b2")](0x0)
            );
            _0x4dfba7(
              _0x1dd434[_0x3851("0x2b0")],
              _0x3e4a45[_0x3851("0x2b2")](0x0)
            );
            _0x465947(
              _0x1dd434[_0x3851("0x2b0")],
              _0x3e4a45[_0x3851("0x2b2")](0x0)
            );
            _0x3a0abb(
              _0x1dd434[_0x3851("0x2b0")],
              _0x3e4a45[_0x3851("0x2b2")](0x0)
            );
            _0x538e72(
              _0x1dd434[_0x3851("0x2b0")],
              _0x3e4a45[_0x3851("0x2b2")](0x0)
            );
            _0x29c316(_0x1dd434[_0x3851("0x2b0")], _0x3e4a45["get"](0x0));
            _0xd8b1f7(_0x1dd434[_0x3851("0x2b0")], _0x3e4a45["get"](0x0));
            if (_0x1dd434["flat"]) {
              _0x3e4a45[_0x3851("0x302")](this)[_0x3851("0x2d2")]();
              _0x3e4a45[_0x3851("0x1b6")]({
                position: _0x3851("0x303"),
                display: _0x3851("0x304"),
              });
            } else {
              _0x3e4a45[_0x3851("0x302")](document["body"]);
              _0x205593(this)["on"](_0x1dd434[_0x3851("0x305")], _0x4c6ce1);
              _0x3e4a45[_0x3851("0x1b6")]({ position: _0x3851("0x1bb") });
            }
          }
        });
      },
      showPicker: function () {
        return this[_0x3851("0x2dc")](function () {
          if (_0x205593(this)[_0x3851("0x2a0")](_0x3851("0x2de"))) {
            _0x4c6ce1[_0x3851("0x2b5")](this);
          }
        });
      },
      hidePicker: function () {
        return this[_0x3851("0x2dc")](function () {
          if (_0x205593(this)[_0x3851("0x2a0")](_0x3851("0x2de"))) {
            _0x205593(
              "#" + _0x205593(this)[_0x3851("0x2a0")](_0x3851("0x2de"))
            )[_0x3851("0x2d5")]();
          }
        });
      },
      setColor: function (_0x3a1383, _0x326170, _0x10e12f) {
        _0x10e12f = typeof _0x10e12f === _0x3851("0x306") ? 0x1 : _0x10e12f;
        if (typeof _0x3a1383 == _0x3851("0x175")) {
          _0x3a1383 = _0x5ab6e3(_0x3a1383);
        } else if (
          _0x3a1383["r"] != undefined &&
          _0x3a1383["g"] != undefined &&
          _0x3a1383["b"] != undefined
        ) {
          _0x3a1383 = _0x118783(_0x3a1383);
        } else if (
          _0x3a1383["h"] != undefined &&
          _0x3a1383["s"] != undefined &&
          _0x3a1383["b"] != undefined
        ) {
          _0x3a1383 = fixHsb(_0x3a1383);
        } else {
          return this;
        }
        return this[_0x3851("0x2dc")](function () {
          if (_0x205593(this)["data"](_0x3851("0x2de"))) {
            var _0x3cb650 = _0x205593(
              "#" + _0x205593(this)[_0x3851("0x2a0")](_0x3851("0x2de"))
            );
            _0x3cb650[_0x3851("0x2a0")]("colpick")[
              _0x3851("0x2b0")
            ] = _0x3a1383;
            _0x3cb650[_0x3851("0x2a0")]("colpick")["origColor"] = _0x3a1383;
            _0x3cb650["data"](_0x3851("0x29d"))["a"] = _0x326170;
            _0xb5f7e4(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0x29983a(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0x4dfba7(_0x3a1383, _0x3cb650["get"](0x0));
            _0x465947(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0x3a0abb(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0xd8b1f7(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0x29c316(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            _0x3cb650[_0x3851("0x2a0")](_0x3851("0x29d"))["onChange"][
              "apply"
            ](_0x3cb650["parent"](), [
              _0x3a1383,
              _0x3cb650["data"]("colpick")["hsl"]
                ? _0x399aac(_0x3a1383)
                : _0x3769d1(_0x3a1383),
              _0x3cb650[_0x3851("0x2a0")]("colpick")[_0x3851("0x1e9")]
                ? _0x596c65(_0x3a1383)
                : _0x15aa77(_0x3a1383),
              _0x3cb650[_0x3851("0x2a0")](_0x3851("0x29d"))["el"],
              0x1,
            ]);
            if (_0x10e12f) {
              _0x538e72(_0x3a1383, _0x3cb650[_0x3851("0x2b2")](0x0));
            }
          }
        });
      },
    };
  })();
  var _0x34b0f9 = function (_0x2bdbed) {
    var _0x2bdbed = parseInt(
      _0x2bdbed[_0x3851("0x1f2")]("#") > -0x1
        ? _0x2bdbed["substring"](0x1)
        : _0x2bdbed,
      0x10
    );
    return {
      r: _0x2bdbed >> 0x10,
      g: (_0x2bdbed & 0xff00) >> 0x8,
      b: _0x2bdbed & 0xff,
    };
  };
  var _0x5ab6e3 = function (_0x4a7e30) {
    return _0x118783(_0x34b0f9(_0x4a7e30));
  };
  var _0x25d473 = function (_0x795cf7) {
    return _0x2ed8d3(_0x34b0f9(_0x795cf7));
  };
  var _0x118783 = function (_0x33c181) {
    var _0x1ba320 = { h: 0x0, s: 0x0, x: 0x0 };
    var _0x2727e1 = Math[_0x3851("0x2be")](
      _0x33c181["r"],
      _0x33c181["g"],
      _0x33c181["b"]
    );
    var _0x173158 = Math[_0x3851("0x200")](
      _0x33c181["r"],
      _0x33c181["g"],
      _0x33c181["b"]
    );
    var _0x3c0a1f = _0x173158 - _0x2727e1;
    _0x1ba320["x"] = _0x173158;
    _0x1ba320["s"] = _0x173158 != 0x0 ? (0xff * _0x3c0a1f) / _0x173158 : 0x0;
    if (_0x1ba320["s"] != 0x0) {
      if (_0x33c181["r"] == _0x173158)
        _0x1ba320["h"] = (_0x33c181["g"] - _0x33c181["b"]) / _0x3c0a1f;
      else if (_0x33c181["g"] == _0x173158)
        _0x1ba320["h"] = 0x2 + (_0x33c181["b"] - _0x33c181["r"]) / _0x3c0a1f;
      else _0x1ba320["h"] = 0x4 + (_0x33c181["r"] - _0x33c181["g"]) / _0x3c0a1f;
    } else _0x1ba320["h"] = -0x1;
    _0x1ba320["h"] *= 0x3c;
    if (_0x1ba320["h"] < 0x0) _0x1ba320["h"] += 0x168;
    _0x1ba320["s"] *= 0x64 / 0xff;
    _0x1ba320["x"] *= 0x64 / 0xff;
    return _0x1ba320;
  };
  var _0x2ed8d3 = function (_0x128162) {
    return _0x187e9a(_0x118783(_0x128162));
  };
  var _0x187e9a = function (_0x343cdc) {
    var _0x4069b8 = { h: 0x0, s: 0x0, x: 0x0 };
    _0x4069b8["h"] = _0x343cdc["h"];
    _0x4069b8["x"] = (_0x343cdc["x"] * (0xc8 - _0x343cdc["s"])) / 0xc8;
    _0x4069b8["s"] =
      (_0x343cdc["x"] * _0x343cdc["s"]) /
      (0x64 - Math[_0x3851("0x1f1")](0x2 * _0x4069b8["x"] - 0x64));
    return _0x4069b8;
  };
  var _0x18302e = function (_0x151152) {
    var _0x42f722 = { h: 0x0, s: 0x0, x: 0x0 };
    _0x42f722["h"] = _0x151152["h"];
    _0x42f722["x"] =
      (0xc8 * _0x151152["x"] +
        _0x151152["s"] *
          (0x64 - Math[_0x3851("0x1f1")](0x2 * _0x151152["x"] - 0x64))) /
      0xc8;
    _0x42f722["s"] =
      (0xc8 * (_0x42f722["x"] - _0x151152["x"])) / _0x42f722["x"];
    return _0x42f722;
  };
  var _0x15aa77 = function (_0x17157d) {
    var _0x52cc8d = {};
    var _0x24e0c5 = _0x17157d["h"];
    var _0x4bddf3 = (_0x17157d["s"] * 0xff) / 0x64;
    var _0xcfb864 = (_0x17157d["x"] * 0xff) / 0x64;
    if (_0x4bddf3 == 0x0) {
      _0x52cc8d["r"] = _0x52cc8d["g"] = _0x52cc8d["b"] = _0xcfb864;
    } else {
      var _0x507de1 = _0xcfb864;
      var _0x5d944b = ((0xff - _0x4bddf3) * _0xcfb864) / 0xff;
      var _0x571f4c = ((_0x507de1 - _0x5d944b) * (_0x24e0c5 % 0x3c)) / 0x3c;
      if (_0x24e0c5 == 0x168) _0x24e0c5 = 0x0;
      if (_0x24e0c5 < 0x3c) {
        _0x52cc8d["r"] = _0x507de1;
        _0x52cc8d["b"] = _0x5d944b;
        _0x52cc8d["g"] = _0x5d944b + _0x571f4c;
      } else if (_0x24e0c5 < 0x78) {
        _0x52cc8d["g"] = _0x507de1;
        _0x52cc8d["b"] = _0x5d944b;
        _0x52cc8d["r"] = _0x507de1 - _0x571f4c;
      } else if (_0x24e0c5 < 0xb4) {
        _0x52cc8d["g"] = _0x507de1;
        _0x52cc8d["r"] = _0x5d944b;
        _0x52cc8d["b"] = _0x5d944b + _0x571f4c;
      } else if (_0x24e0c5 < 0xf0) {
        _0x52cc8d["b"] = _0x507de1;
        _0x52cc8d["r"] = _0x5d944b;
        _0x52cc8d["g"] = _0x507de1 - _0x571f4c;
      } else if (_0x24e0c5 < 0x12c) {
        _0x52cc8d["b"] = _0x507de1;
        _0x52cc8d["g"] = _0x5d944b;
        _0x52cc8d["r"] = _0x5d944b + _0x571f4c;
      } else if (_0x24e0c5 < 0x168) {
        _0x52cc8d["r"] = _0x507de1;
        _0x52cc8d["g"] = _0x5d944b;
        _0x52cc8d["b"] = _0x507de1 - _0x571f4c;
      } else {
        _0x52cc8d["r"] = 0x0;
        _0x52cc8d["g"] = 0x0;
        _0x52cc8d["b"] = 0x0;
      }
    }
    return {
      r: Math[_0x3851("0x1c0")](_0x52cc8d["r"]),
      g: Math[_0x3851("0x1c0")](_0x52cc8d["g"]),
      b: Math[_0x3851("0x1c0")](_0x52cc8d["b"]),
    };
  };
  var _0x596c65 = function (_0x53b027) {
    return _0x15aa77(_0x18302e(_0x53b027));
  };
  var _0x4eb40b = function (_0x20033c) {
    var _0x440302 = [
      _0x20033c["r"][_0x3851("0x1ea")](0x10),
      _0x20033c["g"][_0x3851("0x1ea")](0x10),
      _0x20033c["b"][_0x3851("0x1ea")](0x10),
    ];
    _0x205593[_0x3851("0x2dc")](_0x440302, function (_0x242380, _0x20f8f2) {
      if (_0x20f8f2[_0x3851("0x187")] == 0x1) {
        _0x440302[_0x242380] = "0" + _0x20f8f2;
      }
    });
    return _0x440302[_0x3851("0x1d9")]("");
  };
  var _0x3769d1 = function (_0xc9c575) {
    return _0x4eb40b(_0x15aa77(_0xc9c575));
  };
  var _0x399aac = function (_0x3d3f7a) {
    return _0x3769d1(_0x18302e(_0x3d3f7a));
  };
  _0x205593["fn"]["extend"]({
    colpick: _0x2d0f80[_0x3851("0x307")],
    colpickHide: _0x2d0f80[_0x3851("0x308")],
    colpickShow: _0x2d0f80[_0x3851("0x309")],
    colpickSetColor: _0x2d0f80["setColor"],
  });
  _0x205593["extend"]({
    colpick: {
      rgbToHex: _0x4eb40b,
      rgbToHsb: _0x118783,
      rgbToHsl: _0x2ed8d3,
      hsbToHex: _0x3769d1,
      hsbToRgb: _0x15aa77,
      hsbToHsl: _0x187e9a,
      hexToHsb: _0x5ab6e3,
      hexToHsl: _0x25d473,
      hexToRgb: _0x34b0f9,
      hslToHsb: _0x18302e,
      hslToRgb: _0x596c65,
      hslToHex: _0x399aac,
    },
  });
})(jQuery);
var random_color_step = 0x1;
var custom_style_set = ![];
var current_edit_img = null;
var allow_upload_img = null;
var current_edit_msg_id = "";
var current_editor;
var replace_full_color = ![];
var replace_clear_interval = null;

function strip_tags(_0x3f3e2f, _0x3ddcf8) {
  _0x3ddcf8 = (((_0x3ddcf8 || "") + "")
    ["toLowerCase"]()
    [_0x3851("0x30a")](/<[a-z][a-z0-9]*>/g) || [])[_0x3851("0x1d9")]("");
  var _0x1656d8 = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    _0x1f89e2 = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return _0x3f3e2f["replace"](_0x1f89e2, "")[_0x3851("0x1cd")](
    _0x1656d8,
    function (_0x1bfe82, _0x40859d) {
      return _0x3ddcf8[_0x3851("0x1f2")](
        "<" + _0x40859d[_0x3851("0x1f3")]() + ">"
      ) > -0x1
        ? _0x1bfe82
        : "";
    }
  );
}

function htmlspecialchars_decode(_0x4b929b, _0x442be1) {
  var _0x274fc3 = 0x0,
    _0x141d2b = 0x0,
    _0x19cd83 = ![];
  if (typeof _0x442be1 === "undefined") {
    _0x442be1 = 0x2;
  }
  _0x4b929b = _0x4b929b["toString"]()
    [_0x3851("0x1cd")](/&lt;/g, "<")
    [_0x3851("0x1cd")](/&gt;/g, ">");
  var _0x41271b = {
    ENT_NOQUOTES: 0x0,
    ENT_HTML_QUOTE_SINGLE: 0x1,
    ENT_HTML_QUOTE_DOUBLE: 0x2,
    ENT_COMPAT: 0x2,
    ENT_QUOTES: 0x3,
    ENT_IGNORE: 0x4,
  };
  if (_0x442be1 === 0x0) {
    _0x19cd83 = !![];
  }
  if (typeof _0x442be1 !== _0x3851("0x1d1")) {
    _0x442be1 = []["concat"](_0x442be1);
    for (
      _0x141d2b = 0x0;
      _0x141d2b < _0x442be1[_0x3851("0x187")];
      _0x141d2b++
    ) {
      if (_0x41271b[_0x442be1[_0x141d2b]] === 0x0) {
        _0x19cd83 = !![];
      } else if (_0x41271b[_0x442be1[_0x141d2b]]) {
        _0x274fc3 = _0x274fc3 | _0x41271b[_0x442be1[_0x141d2b]];
      }
    }
    _0x442be1 = _0x274fc3;
  }
  if (_0x442be1 & _0x41271b[_0x3851("0x30b")]) {
    _0x4b929b = _0x4b929b[_0x3851("0x1cd")](/&#0*39;/g, "\x27");
  }
  if (!_0x19cd83) {
    _0x4b929b = _0x4b929b[_0x3851("0x1cd")](/&quot;/g, "\x22");
  }
  _0x4b929b = _0x4b929b[_0x3851("0x1cd")](/&amp;/g, "&");
  return _0x4b929b;
}

function strip_imgthumb_opr(_0x5c1812) {
  var _0xdf8cff = _0x5c1812[_0x3851("0x1f2")]("@");
  if (_0xdf8cff > 0x0) {
    _0x5c1812 = _0x5c1812[_0x3851("0x30c")](0x0, _0xdf8cff);
  }
  var _0x3c98af = _0x5c1812[_0x3851("0x1f2")]("?");
  if (_0x3c98af > 0x0) {
    _0x5c1812 = _0x5c1812[_0x3851("0x30c")](0x0, _0x3c98af);
  }
  return _0x5c1812;
}

function base64_decode(_0x2b9649) {
  var _0x2c652f = _0x3851("0x30d");
  var _0x546e4e,
    _0x6b540a,
    _0x52feb4,
    _0x4fdc7f,
    _0x1e8e4d,
    _0x561a14,
    _0x51c747,
    _0x4235b9,
    _0x2b867b = 0x0,
    _0x4b23cf = 0x0,
    _0xc245b5 = "",
    _0x27b4a6 = [];
  if (!_0x2b9649) {
    return _0x2b9649;
  }
  _0x2b9649 += "";
  do {
    _0x4fdc7f = _0x2c652f["indexOf"](_0x2b9649[_0x3851("0x1eb")](_0x2b867b++));
    _0x1e8e4d = _0x2c652f[_0x3851("0x1f2")](_0x2b9649["charAt"](_0x2b867b++));
    _0x561a14 = _0x2c652f["indexOf"](_0x2b9649[_0x3851("0x1eb")](_0x2b867b++));
    _0x51c747 = _0x2c652f[_0x3851("0x1f2")](
      _0x2b9649[_0x3851("0x1eb")](_0x2b867b++)
    );
    _0x4235b9 =
      (_0x4fdc7f << 0x12) | (_0x1e8e4d << 0xc) | (_0x561a14 << 0x6) | _0x51c747;
    _0x546e4e = (_0x4235b9 >> 0x10) & 0xff;
    _0x6b540a = (_0x4235b9 >> 0x8) & 0xff;
    _0x52feb4 = _0x4235b9 & 0xff;
    if (_0x561a14 == 0x40) {
      _0x27b4a6[_0x4b23cf++] = String["fromCharCode"](_0x546e4e);
    } else if (_0x51c747 == 0x40) {
      _0x27b4a6[_0x4b23cf++] = String["fromCharCode"](_0x546e4e, _0x6b540a);
    } else {
      _0x27b4a6[_0x4b23cf++] = String[_0x3851("0x30e")](
        _0x546e4e,
        _0x6b540a,
        _0x52feb4
      );
    }
  } while (_0x2b867b < _0x2b9649[_0x3851("0x187")]);
  _0xc245b5 = _0x27b4a6["join"]("");
  try {
    return decodeURIComponent(escape(_0xc245b5[_0x3851("0x1cd")](/\0+$/, "")));
  } catch (_0x9a8b71) {
    return null;
  }
}

function base64_encode(_0x227982) {
  var _0x476679 = _0x3851("0x30d");
  var _0x1b5b4e,
    _0x3e3966,
    _0x4a052a,
    _0x52deea,
    _0x4468ef,
    _0xe35881,
    _0x221981,
    _0x3cb5f5,
    _0x10c7d9 = 0x0,
    _0x117d49 = 0x0,
    _0x30a1e9 = "",
    _0x4d23f5 = [];
  if (!_0x227982) {
    return _0x227982;
  }
  _0x227982 = unescape(encodeURIComponent(_0x227982));
  do {
    _0x1b5b4e = _0x227982[_0x3851("0x30f")](_0x10c7d9++);
    _0x3e3966 = _0x227982["charCodeAt"](_0x10c7d9++);
    _0x4a052a = _0x227982[_0x3851("0x30f")](_0x10c7d9++);
    _0x3cb5f5 = (_0x1b5b4e << 0x10) | (_0x3e3966 << 0x8) | _0x4a052a;
    _0x52deea = (_0x3cb5f5 >> 0x12) & 0x3f;
    _0x4468ef = (_0x3cb5f5 >> 0xc) & 0x3f;
    _0xe35881 = (_0x3cb5f5 >> 0x6) & 0x3f;
    _0x221981 = _0x3cb5f5 & 0x3f;
    _0x4d23f5[_0x117d49++] =
      _0x476679["charAt"](_0x52deea) +
      _0x476679["charAt"](_0x4468ef) +
      _0x476679[_0x3851("0x1eb")](_0xe35881) +
      _0x476679[_0x3851("0x1eb")](_0x221981);
  } while (_0x10c7d9 < _0x227982[_0x3851("0x187")]);
  _0x30a1e9 = _0x4d23f5["join"]("");
  var _0x175280 = _0x227982[_0x3851("0x187")] % 0x3;
  return (
    (_0x175280 ? _0x30a1e9["slice"](0x0, _0x175280 - 0x3) : _0x30a1e9) +
    _0x3851("0x310")[_0x3851("0x213")](_0x175280 || 0x3)
  );
}

function str_replace(_0x55b8ed, _0x5b38bf, _0x1cbcfd, _0x3e0c57) {
  var _0x31b935 = 0x0,
    _0x219158 = 0x0,
    _0x4e8fa2 = "",
    _0x4b7ca5 = "",
    _0x4379df = 0x0,
    _0x469b26 = 0x0,
    _0x559a50 = [][_0x3851("0x212")](_0x55b8ed),
    _0x1721fb = [][_0x3851("0x212")](_0x5b38bf),
    _0x318475 = _0x1cbcfd,
    _0x579964 =
      Object[_0x3851("0x169")]["toString"][_0x3851("0x214")](_0x1721fb) ===
      "[object\x20Array]",
    _0x37755f =
      Object[_0x3851("0x169")]["toString"][_0x3851("0x214")](_0x318475) ===
      _0x3851("0x311");
  _0x318475 = [][_0x3851("0x212")](_0x318475);
  if (_0x3e0c57) {
    this["window"][_0x3e0c57] = 0x0;
  }
  for (
    _0x31b935 = 0x0, _0x4379df = _0x318475[_0x3851("0x187")];
    _0x31b935 < _0x4379df;
    _0x31b935++
  ) {
    if (_0x318475[_0x31b935] === "") {
      continue;
    }
    for (
      _0x219158 = 0x0, _0x469b26 = _0x559a50[_0x3851("0x187")];
      _0x219158 < _0x469b26;
      _0x219158++
    ) {
      _0x4e8fa2 = _0x318475[_0x31b935] + "";
      _0x4b7ca5 = _0x579964
        ? _0x1721fb[_0x219158] !== undefined
          ? _0x1721fb[_0x219158]
          : ""
        : _0x1721fb[0x0];
      _0x318475[_0x31b935] = _0x4e8fa2[_0x3851("0x1da")](_0x559a50[_0x219158])[
        _0x3851("0x1d9")
      ](_0x4b7ca5);
      if (_0x3e0c57 && _0x318475[_0x31b935] !== _0x4e8fa2) {
        this[_0x3851("0x312")][_0x3e0c57] +=
          (_0x4e8fa2[_0x3851("0x187")] -
            _0x318475[_0x31b935][_0x3851("0x187")]) /
          _0x559a50[_0x219158][_0x3851("0x187")];
      }
    }
  }
  return _0x37755f ? _0x318475 : _0x318475[0x0];
}

function getSelectionText() {
  var _0x5957c0 = current_editor["selection"]["getRange"]();
  _0x5957c0[_0x3851("0x313")]();
  var _0x568b3f = current_editor[_0x3851("0x314")][_0x3851("0x315")]();
  var _0xe76654 = _0x568b3f["getRangeAt"](0x0);
  var _0x112e46 = _0xe76654[_0x3851("0x316")]();
  var _0x5b17e9 = document[_0x3851("0x317")]("div");
  _0x5b17e9["appendChild"](_0x112e46);
  return _0x5b17e9[_0x3851("0x318")];
}

function getSelectionHtml() {
  var _0x25b6a0 = current_editor[_0x3851("0x314")][_0x3851("0x319")]();
  if (
    _0x25b6a0[_0x3851("0x31a")]["tagName"] == "BODY" &&
    _0x25b6a0[_0x3851("0x31a")] === _0x25b6a0[_0x3851("0x31b")] &&
    _0x25b6a0[_0x3851("0x31c")] > 0x0 &&
    _0x25b6a0[_0x3851("0x31c")] ===
      _0x25b6a0[_0x3851("0x31a")]["childNodes"][_0x3851("0x187")]
  ) {
    return getEditorHtml(!![]);
  } else {
    _0x25b6a0[_0x3851("0x313")]();
    var _0x284094 = current_editor[_0x3851("0x314")][_0x3851("0x315")]();
    var _0x4c5799 = _0x284094[_0x3851("0x31d")](0x0);
    var _0x2bb3fd = _0x4c5799[_0x3851("0x316")]();
    var _0x1fdc6e = document[_0x3851("0x317")]("div");
    _0x1fdc6e[_0x3851("0x31e")](_0x2bb3fd);
    var _0x4479c6 = _0x1fdc6e[_0x3851("0x31f")];
    if (_0x4479c6 == "") {
      return "";
    } else {
      return parse135EditorHtml(_0x4479c6);
    }
  }
}

function getDealingHtml() {
  var _0x594768 = getSelectionHtml();
  if (_0x594768 == "") {
    if (current_editor["currentActive135Item"]()) {
      return jQuery(current_editor[_0x3851("0x320")]())[_0x3851("0x2d3")]();
    } else {
      return getEditorHtml(!![]);
    }
  } else {
    return _0x594768;
  }
}

function setDealingHtml(_0x5beafe) {
  _0x5beafe = jQuery[_0x3851("0x321")](_0x5beafe);
  var _0x7f3e51 = getSelectionHtml();
  if (_0x7f3e51 != "") {
    insertHtml(_0x5beafe);
    custom_style_set = !![];
    current_editor[_0x3851("0x322")][_0x3851("0x323")]();
    return;
  } else if (current_editor[_0x3851("0x320")]()) {
    jQuery(current_editor[_0x3851("0x320")]())[_0x3851("0x2d3")](_0x5beafe);
    current_editor[_0x3851("0x322")][_0x3851("0x323")]();
    return;
  } else {
    current_editor[_0x3851("0x324")](_0x5beafe);
    current_editor[_0x3851("0x322")][_0x3851("0x323")]();
    return;
  }
}

function parse135EditorHtml(_0x59b89a, _0x1fd5c7) {
  var _0x74137c = current_editor["document"][_0x3851("0x317")](
    _0x3851("0x325")
  );
  _0x74137c[_0x3851("0x31f")] = _0x59b89a;
  var _0x163822 = jQuery(_0x74137c);
  _0x163822[_0x3851("0x176")]("*")[_0x3851("0x2dc")](function () {
    var _0x175a49 = jQuery(this);
    var _0x2a9af1 = _0x175a49[_0x3851("0x1b6")](_0x3851("0x326"));
    if (_0x2a9af1) {
      _0x175a49[_0x3851("0x1b6")](_0x3851("0x326"), "");
      _0x175a49[_0x3851("0x1b6")]("font-family", _0x2a9af1);
    }
    if (this["tagName"][_0x3851("0x1f3")]() == _0x3851("0x327")) {
      _0x175a49[_0x3851("0x188")](_0x3851("0x328"), _0x3851("0x329"));
    }
    if (this["style"][_0x3851("0x32a")]) {
      setElementTransform(this, this[_0x3851("0x19b")][_0x3851("0x32a")]);
      return;
    }
    if (this[_0x3851("0x179")] == "SECTION") {
      var _0x575bda = jQuery(this)[_0x3851("0x188")](_0x3851("0x19b"));
      if (_0x575bda) {
        _0x575bda = _0x575bda["toLowerCase"]();
        if (_0x575bda["indexOf"](_0x3851("0x32b")) >= 0x0) {
          return;
        } else if (
          _0x575bda["indexOf"](_0x3851("0x32c")) >= 0x0 ||
          _0x575bda[_0x3851("0x1f2")]("border") >= 0x0
        ) {
          jQuery(this)[_0x3851("0x1b6")]("box-sizing", _0x3851("0x32d"));
        }
      }
    } else if (
      this[_0x3851("0x179")] == _0x3851("0x32e") ||
      this[_0x3851("0x179")] == "BR" ||
      this[_0x3851("0x179")] == "TSPAN" ||
      this[_0x3851("0x179")] == _0x3851("0x32f") ||
      this["tagName"] == _0x3851("0x330")
    ) {
      return;
    } else if (
      this[_0x3851("0x179")] == _0x3851("0x331") ||
      this[_0x3851("0x179")] == "SPAN" ||
      this[_0x3851("0x179")] == "B" ||
      this[_0x3851("0x179")] == "EM" ||
      this[_0x3851("0x179")] == "I"
    ) {
      return;
    } else if (this[_0x3851("0x179")] == "P") {
      return;
    } else if (
      this[_0x3851("0x179")] == "H1" ||
      this[_0x3851("0x179")] == "H2" ||
      this[_0x3851("0x179")] == "H3" ||
      this[_0x3851("0x179")] == "H4" ||
      this[_0x3851("0x179")] == "H5" ||
      this["tagName"] == "H6"
    ) {
      jQuery(this)[_0x3851("0x1b6")](_0x3851("0x332"), "bold");
      if (!this[_0x3851("0x19b")]["fontSize"]) {
        jQuery(this)["css"]({ "font-size": _0x3851("0x333") });
      }
      if (!this[_0x3851("0x19b")]["lineHeight"]) {
        jQuery(this)[_0x3851("0x1b6")]({ lineHeight: _0x3851("0x334") });
      }
      return;
    } else if (
      this[_0x3851("0x179")] == "OL" ||
      this[_0x3851("0x179")] == "UL" ||
      this[_0x3851("0x179")] == "DL"
    ) {
      jQuery(this)[_0x3851("0x1b6")]({
        margin: _0x3851("0x335"),
        padding: _0x3851("0x336"),
      });
      return;
    }
    if (
      (this["tagName"] == "TD" || this["tagName"] == "TH") &&
      this[_0x3851("0x19b")][_0x3851("0x32c")] == "" &&
      this[_0x3851("0x19b")][_0x3851("0x337")] == "" &&
      this[_0x3851("0x19b")]["paddingRight"] == "" &&
      this[_0x3851("0x19b")][_0x3851("0x338")] == "" &&
      this[_0x3851("0x19b")][_0x3851("0x339")] == ""
    ) {
      jQuery(this)[_0x3851("0x1b6")]({ margin: _0x3851("0x33a") });
    }
  });
  var _0x59b89a = jQuery[_0x3851("0x321")](_0x163822["html"]());
  if (_0x59b89a == "") {
    return "";
  }
  return _0x59b89a;
}

function setElementTransform(_0x2c0e86, _0x4f3f10) {
  if (_0x4f3f10 == "none") return;
  var _0x50f31d = jQuery(_0x2c0e86)[_0x3851("0x188")](_0x3851("0x19b")) || "";
  _0x50f31d = _0x50f31d[_0x3851("0x1cd")](
    /;\s*transform\s*:[A-Za-z0-9_%,.\-\(\)\s]*;/gim,
    ";"
  );
  _0x50f31d = _0x50f31d[_0x3851("0x1cd")](
    /\s*\-[a-z]+\-transform\s*:[A-Za-z0-9_%,.\-\(\)\s]*;/gim,
    ""
  );
  _0x50f31d =
    _0x50f31d +
    _0x3851("0x33b") +
    _0x4f3f10 +
    _0x3851("0x33c") +
    _0x4f3f10 +
    _0x3851("0x33d") +
    _0x4f3f10 +
    ";-ms-transform:\x20" +
    _0x4f3f10 +
    ";-o-transform:\x20" +
    _0x4f3f10 +
    ";";
  _0x50f31d = _0x50f31d["replace"](";;", ";");
  jQuery(_0x2c0e86)[_0x3851("0x188")](_0x3851("0x19b"), _0x50f31d);
}

function parseMmbizUrl(_0x2415fc) {
  _0x2415fc = _0x2415fc[_0x3851("0x1cd")](/https:\/mmbiz./g, _0x3851("0x33e"));
  _0x2415fc = _0x2415fc[_0x3851("0x1cd")](
    /http:\/\/mmbiz.qlogo.cn/g,
    _0x3851("0x33f")
  );
  _0x2415fc = _0x2415fc["replace"](/http:\/\/mmbiz.qpic.cn/g, _0x3851("0x33f"));
  return _0x2415fc;
}

function setEditorHtml(_0x22066f) {
  _0x22066f = current_editor["strip_stack_span"](_0x22066f);
  current_editor[_0x3851("0x322")][_0x3851("0x323")]();
  current_editor["setContent"](_0x22066f);
  current_editor["undoManger"][_0x3851("0x323")]();
}

function insertHtml(_0x32a927, _0x43761f) {
  _0x32a927 = current_editor[_0x3851("0x340")](_0x32a927);
  var _0x54c378 = jQuery[_0x3851("0x321")](getSelectionHtml());
  if (_0x54c378 != "") {
    if (_0x43761f) {
      var _0x542428 = jQuery(_0x3851("0x341") + _0x54c378 + _0x3851("0x342"));
      _0x542428[_0x3851("0x176")]("*")[_0x3851("0x2dc")](function () {
        jQuery(this)["removeAttr"]("style");
        jQuery(this)[_0x3851("0x343")](_0x3851("0x344"));
        jQuery(this)[_0x3851("0x343")]("placeholder");
      });
      for (var _0x5b4038 in _0x43761f[_0x3851("0x1cd")]) {
        _0x542428[_0x3851("0x176")](_0x5b4038)[_0x3851("0x2dc")](function () {
          if (
            !_0x43761f["replace"][_0x5b4038] ||
            _0x43761f[_0x3851("0x1cd")][_0x5b4038] == ""
          ) {
            jQuery(this)[_0x3851("0x345")](jQuery(this)["html"]());
          } else {
            jQuery(this)[_0x3851("0x345")](
              "<" +
                _0x43761f["replace"][_0x5b4038] +
                ">" +
                jQuery(this)[_0x3851("0x2d3")]() +
                "</" +
                _0x43761f["replace"][_0x5b4038] +
                ">"
            );
          }
        });
      }
      for (var _0x5b4038 in _0x43761f[_0x3851("0x346")]) {
        _0x542428[_0x3851("0x176")](_0x5b4038)["attr"](
          _0x43761f[_0x3851("0x346")][_0x5b4038]
        );
      }
      for (var _0x5b4038 in _0x43761f[_0x3851("0x19b")]) {
        _0x542428[_0x3851("0x176")](_0x5b4038)[_0x3851("0x188")](
          _0x3851("0x19b"),
          _0x43761f["style"][_0x5b4038]
        );
      }
      for (var _0x5b4038 in _0x43761f["class"]) {
        _0x542428["find"](_0x5b4038)[_0x3851("0x188")](
          _0x3851("0x344"),
          _0x43761f[_0x3851("0x344")][_0x5b4038]
        );
      }
      for (var _0x5b4038 in _0x43761f[_0x3851("0x1b6")]) {
        _0x542428[_0x3851("0x176")](_0x5b4038)["css"](
          _0x43761f[_0x3851("0x1b6")][_0x5b4038]
        );
      }
      _0x32a927 = _0x542428[_0x3851("0x2d3")]();
      current_editor[_0x3851("0x347")](_0x3851("0x348"), _0x32a927);
      if (current_editor["getOpt"](_0x3851("0x349"))) {
        current_editor[_0x3851("0x34a")](_0x3851("0x34b"));
      }
      current_editor[_0x3851("0x322")][_0x3851("0x323")]();
      return !![];
    }
    _0x54c378 = strip_tags(_0x54c378, _0x3851("0x34c"));
    var _0x5c20df = current_editor[_0x3851("0x34d")][_0x3851("0x317")](
      _0x3851("0x325")
    );
    _0x5c20df[_0x3851("0x31f")] = _0x54c378;
    var _0x542428 = jQuery(_0x5c20df);
    _0x542428[_0x3851("0x176")](_0x3851("0x34e"))[_0x3851("0x34f")]();
    _0x542428[_0x3851("0x176")]("*")["each"](function () {
      jQuery(this)[_0x3851("0x343")](_0x3851("0x19b"));
      jQuery(this)[_0x3851("0x343")](_0x3851("0x344"));
      jQuery(this)[_0x3851("0x343")](_0x3851("0x350"));
    });
    var _0x31faf2 = jQuery(_0x3851("0x341") + _0x32a927 + "</div>");
    _0x31faf2[_0x3851("0x176")](_0x3851("0x351"))
      [_0x3851("0x352")]("p")
      [_0x3851("0x2dc")](function (_0x5b4038) {
        if (
          jQuery(this)[_0x3851("0x2d3")]() == "" ||
          jQuery(this)[_0x3851("0x2d3")]() == _0x3851("0x353") ||
          jQuery(this)[_0x3851("0x2d3")]() == "<br>" ||
          jQuery(this)["html"]() == _0x3851("0x354")
        ) {
          if (
            typeof jQuery(this)[_0x3851("0x188")]("style") == _0x3851("0x306")
          ) {
            jQuery(this)["remove"]();
          }
        }
      });
    _0x542428[_0x3851("0x176")](_0x3851("0x355"))[_0x3851("0x2dc")](function (
      _0x5b4038
    ) {
      var _0x8eea7d = _0x31faf2[_0x3851("0x176")](_0x3851("0x356"))["eq"](
        _0x5b4038
      );
      if (_0x8eea7d && _0x8eea7d["length"] > 0x0) {
        _0x8eea7d["html"](jQuery[_0x3851("0x321")](jQuery(this)["text"]()));
        jQuery(this)[_0x3851("0x34f")]();
      } else {
        jQuery(this)["replaceWith"](
          _0x3851("0x357") + jQuery(this)[_0x3851("0x358")]() + "</p>"
        );
      }
    });
    _0x542428["find"](_0x3851("0x359"))[_0x3851("0x2dc")](function (_0x5b4038) {
      var _0x4c5bc9 = _0x31faf2["find"](_0x3851("0x35a"))["eq"](_0x5b4038);
      if (_0x4c5bc9 && _0x4c5bc9[_0x3851("0x187")] > 0x0) {
        _0x4c5bc9[_0x3851("0x1b6")](
          _0x3851("0x35b"),
          _0x3851("0x35c") + jQuery(this)["attr"](_0x3851("0x35d")) + ")"
        );
        jQuery(this)[_0x3851("0x34f")]();
      }
    });
    var _0x3cc902 = 0x0;
    _0x542428[_0x3851("0x176")](_0x3851("0x359"))[_0x3851("0x2dc")](
      function () {
        var _0x3f5ac3 = _0x31faf2["find"]("img")["eq"](_0x3cc902);
        while (_0x3f5ac3[_0x3851("0x1bd")](_0x3851("0x35e"))) {
          _0x3cc902++;
          _0x3f5ac3 = _0x31faf2[_0x3851("0x176")](_0x3851("0x359"))["eq"](
            _0x3cc902
          );
        }
        if (
          _0x3f5ac3 &&
          _0x3f5ac3[_0x3851("0x187")] > 0x0 &&
          jQuery(_0x3f5ac3)["parents"](_0x3851("0x35f"))[_0x3851("0x187")] ==
            0x0
        ) {
          _0x3f5ac3[_0x3851("0x188")](
            _0x3851("0x35d"),
            jQuery(this)[_0x3851("0x188")](_0x3851("0x35d"))
          );
          if (
            _0x3f5ac3[_0x3851("0x2ac")]()[_0x3851("0x188")](_0x3851("0x360")) ==
              "circle" ||
            _0x3f5ac3[_0x3851("0x2ac")]()[_0x3851("0x188")]("data-role") ==
              _0x3851("0x361") ||
            _0x3f5ac3[_0x3851("0x2ac")]()["attr"](_0x3851("0x360")) ==
              _0x3851("0x362")
          ) {
            _0x3f5ac3[_0x3851("0x2ac")]()[_0x3851("0x1b6")](
              _0x3851("0x363"),
              _0x3851("0x35c") +
                jQuery(this)[_0x3851("0x188")](_0x3851("0x35d")) +
                ")"
            );
          }
          _0x3cc902++;
          jQuery(this)[_0x3851("0x34f")]();
        }
      }
    );
    _0x542428[_0x3851("0x176")](_0x3851("0x359"))[_0x3851("0x2dc")](function (
      _0x5b4038
    ) {
      var _0x2ab8d5 = _0x31faf2[_0x3851("0x176")](_0x3851("0x364"))["eq"](
        _0x5b4038
      );
      if (_0x2ab8d5 && _0x2ab8d5["length"] > 0x0) {
        _0x2ab8d5["attr"](
          _0x3851("0x365"),
          jQuery(this)[_0x3851("0x188")](_0x3851("0x35d"))
        );
        jQuery(this)[_0x3851("0x34f")]();
      }
    });
    var _0x3d1f8d = _0x31faf2[_0x3851("0x176")](_0x3851("0x35f"));
    var _0x17ca87 = _0x3d1f8d[_0x3851("0x187")];
    if (_0x17ca87 > 0x0) {
      if (_0x17ca87 == 0x1) {
        var _0x212bfc = _0x31faf2[_0x3851("0x176")](_0x3851("0x366"));
        if (_0x212bfc["data"](_0x3851("0x367")) == _0x3851("0x358")) {
          _0x212bfc["html"](
            jQuery[_0x3851("0x321")](_0x542428[_0x3851("0x358")]())
          );
        } else {
          _0x542428[_0x3851("0x368")]()["each"](function (_0x5b4038) {
            var _0xc77904 = this;
            if (this[_0x3851("0x179")] == _0x3851("0x32e")) {
              return;
            }
            if (
              jQuery[_0x3851("0x321")](jQuery(_0xc77904)[_0x3851("0x358")]()) ==
                "" ||
              this[_0x3851("0x179")] == "BR" ||
              jQuery(this)[_0x3851("0x2d3")]() == "" ||
              jQuery(this)["html"]() == "&nbsp;" ||
              jQuery(this)[_0x3851("0x2d3")]() == "<br>" ||
              jQuery(this)["html"]() == _0x3851("0x354")
            ) {
              jQuery(this)["remove"]();
            }
          });
          var _0x567ff6 = _0x212bfc[_0x3851("0x2a0")](_0x3851("0x19b"));
          if (_0x567ff6) {
            _0x542428[_0x3851("0x176")]("*")[_0x3851("0x2dc")](function () {
              jQuery(this)[_0x3851("0x188")]("style", _0x567ff6);
            });
          }
          var _0x32a927 = _0x542428[_0x3851("0x2d3")]();
          if (_0x32a927 != "") {
            _0x212bfc[_0x3851("0x2d3")](_0x32a927);
          }
        }
      } else {
        _0x542428[_0x3851("0x368")]()[_0x3851("0x2dc")](function (_0x5b4038) {
          var _0x299bc4 = this;
          if (_0x299bc4["nodeType"] == 0x3) {
            _0x299bc4 = jQuery(
              _0x3851("0x357") +
                jQuery(this)[_0x3851("0x358")]() +
                _0x3851("0x369")
            )[_0x3851("0x2b2")](0x0);
          }
          if (_0x5b4038 < _0x17ca87) {
            var _0x212bfc = _0x3d1f8d["eq"](_0x5b4038);
            if (_0x212bfc[_0x3851("0x2a0")](_0x3851("0x367")) == "text") {
              _0x212bfc[_0x3851("0x2d3")](
                jQuery[_0x3851("0x321")](jQuery(_0x299bc4)[_0x3851("0x358")]())
              );
            } else {
              var _0x567ff6 = _0x212bfc[_0x3851("0x2a0")](_0x3851("0x19b"));
              if (_0x567ff6) {
                jQuery(_0x299bc4)[_0x3851("0x188")](
                  _0x3851("0x19b"),
                  _0x567ff6
                );
              }
              _0x212bfc[_0x3851("0x36a")]()[_0x3851("0x36b")](
                jQuery(_0x299bc4)
              );
            }
          } else {
            var _0x212bfc = _0x3d1f8d["eq"](_0x17ca87 - 0x1);
            if (
              _0x212bfc[_0x3851("0x2a0")](_0x3851("0x367")) == _0x3851("0x358")
            ) {
              _0x212bfc["append"](jQuery(_0x299bc4)[_0x3851("0x358")]());
            } else {
              var _0x567ff6 = _0x212bfc[_0x3851("0x2a0")](_0x3851("0x19b"));
              if (_0x567ff6) {
                jQuery(_0x299bc4)[_0x3851("0x188")]("style", _0x567ff6);
              }
              _0x212bfc[_0x3851("0x36b")](jQuery(_0x299bc4));
            }
          }
        });
      }
    }
    _0x32a927 = _0x31faf2[_0x3851("0x2d3")]();
    current_editor["execCommand"](_0x3851("0x348"), _0x32a927);
    current_editor["undoManger"]["save"]();
    if (current_editor["getOpt"](_0x3851("0x349"))) {
      current_editor[_0x3851("0x34a")](_0x3851("0x34b"));
    }
    return !![];
  } else {
  }
  current_editor["execCommand"]("insertHtml", _0x32a927);
  if (current_editor["getOpt"](_0x3851("0x349"))) {
    current_editor[_0x3851("0x34a")]("catchRemoteImage");
  }
  current_editor[_0x3851("0x322")]["save"]();
  return !![];
}

function resetMapUrl() {
  jQuery(current_editor["selection"][_0x3851("0x34d")])
    [_0x3851("0x176")](_0x3851("0x359"))
    [_0x3851("0x2dc")](function () {
      var _0x3dfed0 = jQuery(this);
      var _0x5a80f6 = jQuery(this)["attr"]("mapurl");
      if (_0x5a80f6) {
        var _0x46ecd3 = jQuery(this)[_0x3851("0x188")](_0x3851("0x36c"));
        if (_0x46ecd3) {
          jQuery(_0x46ecd3)[_0x3851("0x2dc")](function () {
            jQuery(this)[_0x3851("0x34f")]();
          });
        }
        _0x46ecd3 = randomString(0xa);
        _0x3dfed0[_0x3851("0x188")](_0x3851("0x36c"), _0x46ecd3);
        _0x3dfed0[_0x3851("0x36d")](
          _0x3851("0x36e") +
            _0x46ecd3 +
            _0x3851("0x36f") +
            _0x46ecd3 +
            _0x3851("0x370") +
            _0x5a80f6 +
            _0x3851("0x371") +
            _0x3851("0x372") +
            "<map\x20name=\x22" +
            _0x46ecd3 +
            _0x3851("0x36f") +
            _0x46ecd3 +
            _0x3851("0x370") +
            _0x5a80f6 +
            _0x3851("0x371") +
            _0x3851("0x373")
        );
      }
    });
}

function setBackgroundColor(_0x44cc16, _0x5063b8, _0x40ee0f) {
  if (isGreyColor(_0x44cc16)) {
    return ![];
  }
  _0x44cc16 = rgb2hex(_0x44cc16);
  if (_0x40ee0f) {
    current_editor[_0x3851("0x322")]["save"]();
  }
  var _0xe0a6c4 = current_editor[_0x3851("0x320")]();
  if (!replace_full_color && _0xe0a6c4) {
    parseObject(_0xe0a6c4, _0x44cc16, _0x5063b8);
    _0xe0a6c4[_0x3851("0x188")]("data-color", _0x44cc16);
    _0xe0a6c4["attr"](_0x3851("0x374"), _0x44cc16);
    current_editor["undoManger"][_0x3851("0x323")]();
    return;
  } else {
    if (!replace_full_color) {
      return;
    }
    parseObject(
      jQuery(current_editor["selection"]["document"]),
      _0x44cc16,
      _0x5063b8
    );
    jQuery(current_editor[_0x3851("0x314")][_0x3851("0x34d")])
      ["find"]("._135editor")
      [_0x3851("0x2dc")](function () {
        jQuery(this)[_0x3851("0x188")]("data-color", _0x44cc16);
      });
  }
  if (_0x40ee0f) {
    current_editor["undoManger"]["save"]();
  }
  return;
}

function replaceStyleColor(_0x56a794, _0x486c92, _0x373815) {
  var _0x5b0688 = hex2rgb(_0x486c92);
  _0x486c92 = _0x486c92[_0x3851("0x1cd")](".", "\x5c.")
    [_0x3851("0x1cd")]("(", "\x5c(")
    ["replace"](")", "\x5c)");
  _0x5b0688 = _0x5b0688[_0x3851("0x1cd")](".", "\x5c.")
    [_0x3851("0x1cd")]("(", "\x5c(")
    ["replace"](")", "\x5c)");
  _0x56a794[_0x3851("0x176")]("*")[_0x3851("0x2dc")](function () {
    var _0x4c75d0 = jQuery(this)["attr"]("style")
      ? jQuery(this)[_0x3851("0x188")](_0x3851("0x19b"))
      : "";
    if (_0x4c75d0 == "") {
      jQuery(this)[_0x3851("0x343")]("style");
      return;
    }
    if (_0x486c92 != _0x5b0688) {
      _0x4c75d0 = _0x4c75d0[_0x3851("0x1cd")](
        new RegExp(_0x486c92, "ig"),
        _0x373815
      );
    }
    _0x4c75d0 = _0x4c75d0[_0x3851("0x1cd")](
      new RegExp(_0x5b0688, "ig"),
      _0x373815
    )["replace"](
      new RegExp(_0x5b0688[_0x3851("0x1cd")](/\s/g, ""), "ig"),
      _0x373815
    );
    jQuery(this)["attr"]("style", _0x4c75d0);
  });
}

function parseObject(_0x217b44, _0x47bc13, _0x206611) {
  if (isGreyColor(_0x47bc13)) {
    return ![];
  }
  _0x47bc13 = rgb2hex(_0x47bc13);
  _0x217b44["find"]("*")["each"](function () {
    if (
      !this[_0x3851("0x375")] ||
      this[_0x3851("0x375")] == _0x3851("0x376") ||
      this[_0x3851("0x375")] == "HEAD" ||
      this[_0x3851("0x375")] == _0x3851("0x377") ||
      this[_0x3851("0x375")] == _0x3851("0x378") ||
      this[_0x3851("0x375")] == _0x3851("0x379")
    ) {
      return;
    }
    if (this[_0x3851("0x375")] == "HR" || this[_0x3851("0x375")] == "hr") {
      var _0x9950e1 = jQuery(this)[_0x3851("0x188")](_0x3851("0x19b"));
      _0x9950e1 =
        _0x9950e1[_0x3851("0x1cd")](/border-color[\s+]?:[\s+]?[^;]+;?/g, "") +
        ";border-color:" +
        _0x47bc13 +
        ";";
      _0x9950e1 = _0x9950e1[_0x3851("0x1cd")](/;;+/, ";");
      jQuery(this)["attr"](_0x3851("0x19b"), _0x9950e1);
      return;
    }
    if (
      this[_0x3851("0x375")] == "" ||
      jQuery(this)[_0x3851("0x188")](_0x3851("0x19b")) == ""
    ) {
      return;
    }
    if (jQuery(this)[_0x3851("0x188")](_0x3851("0x37a")) == _0x3851("0x37b")) {
      return;
    }
    if (jQuery(this)[_0x3851("0x188")](_0x3851("0x37c"))) {
      jQuery(this)[_0x3851("0x188")]("fill", _0x47bc13);
      return;
    }
    var _0x16683f = jQuery(this)
      ["parents"](_0x3851("0x37d"))
      [_0x3851("0x188")](_0x3851("0x37e"));
    var _0x9950e1 = jQuery(this)["attr"](_0x3851("0x19b"));
    if (_0x16683f == _0x47bc13) {
      return;
    }
    if (
      _0x16683f &&
      _0x9950e1 &&
      _0x9950e1["indexOf"](_0x3851("0x37f")) >= 0x0
    ) {
      var _0x37c8d7 = str_replace(rgb2hex(_0x16683f), _0x47bc13, _0x9950e1);
      _0x37c8d7 = str_replace(hex2rgb(_0x16683f), _0x47bc13, _0x37c8d7);
      jQuery(this)[_0x3851("0x188")](_0x3851("0x19b"), _0x37c8d7);
    }
    var _0x41211f = jQuery(this)[_0x3851("0x188")](_0x3851("0x380"))
      ? jQuery(this)[_0x3851("0x188")]("data-clessp")
      : _0x3851("0x381");
    var _0x3dd6a7 = ![];
    var _0x2adbe5;
    var _0x2024eb = jQuery(this)[_0x3851("0x2b2")](0x0)["style"][
      "backgroundColor"
    ];
    if (
      !_0x2024eb ||
      _0x2024eb === _0x3851("0x382") ||
      _0x2024eb === _0x3851("0x1f4") ||
      _0x2024eb === ""
    ) {
      var _0x3a8a1b = jQuery(this)[_0x3851("0x2b2")](0x0)[_0x3851("0x19b")][
        _0x3851("0x2b0")
      ];
      if (
        _0x3a8a1b &&
        _0x3a8a1b != "" &&
        _0x3a8a1b != _0x3851("0x383") &&
        !isGreyColor(_0x3a8a1b)
      ) {
        if (jQuery(this)["attr"](_0x3851("0x384"))) {
          var _0x3de7e5 = jQuery(this)["attr"](_0x3851("0x385"))
            ? jQuery(this)[_0x3851("0x188")]("data-txtlessp")
            : "30%";
          _0x2adbe5 = getColor(
            _0x47bc13,
            jQuery(this)["attr"]("data-txtless"),
            _0x3de7e5
          );
          jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2b0"), _0x2adbe5);
        } else if (isLightenColor(_0x47bc13)) {
          _0x2adbe5 = getColor(_0x47bc13, _0x3851("0x386"), _0x41211f);
          jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2b0"), _0x2adbe5);
        } else {
          var _0x2e0911 = getPrarentBgColor(jQuery(this));
          if (_0x2e0911 == _0x47bc13) {
            _0x2adbe5 = getColor(_0x47bc13, _0x3851("0x387"), _0x41211f);
            jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2b0"), _0x2adbe5);
          } else {
            jQuery(this)[_0x3851("0x1b6")]("color", _0x47bc13);
          }
        }
      }
    } else {
      if (typeof jQuery(this)["attr"]("data-bgless") != _0x3851("0x306")) {
        var _0x2103af = jQuery(this)[_0x3851("0x188")](_0x3851("0x388"))
          ? jQuery(this)[_0x3851("0x188")]("data-bglessp")
          : _0x3851("0x389");
        var _0x347fd1;
        if (
          jQuery(this)["attr"](_0x3851("0x38a")) == _0x3851("0x38b") ||
          jQuery(this)[_0x3851("0x188")](_0x3851("0x38a")) == !![]
        ) {
          if (isLightenColor(_0x47bc13)) {
            _0x347fd1 = getColor(_0x47bc13, "darken", _0x2103af);
            _0x347fd1 = getColor(_0x347fd1, _0x3851("0x38c"), "20%");
          } else {
            _0x347fd1 = getColor(_0x47bc13, _0x3851("0x387"), _0x2103af);
          }
        } else {
          _0x347fd1 = getColor(
            _0x47bc13,
            jQuery(this)[_0x3851("0x188")]("data-bgless"),
            _0x2103af
          );
        }
        if (jQuery(this)["attr"](_0x3851("0x38d"))) {
          _0x347fd1 = getColor(
            _0x347fd1,
            _0x3851("0x38e"),
            jQuery(this)["attr"]("data-bgopacity")
          );
        }
        _0x3dd6a7 = !![];
        jQuery(this)[_0x3851("0x1b6")]("backgroundColor", _0x347fd1);
        if (isLightenColor(_0x347fd1)) {
          _0x2adbe5 = getColor(_0x347fd1, _0x3851("0x386"), _0x41211f);
          _0x2adbe5 = getColor(_0x2adbe5, _0x3851("0x38c"), _0x3851("0x38f"));
        } else {
          _0x2adbe5 = _0x206611;
        }
        jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2b0"), _0x2adbe5);
      } else if (jQuery(this)["attr"](_0x3851("0x38d"))) {
        var _0x347fd1;
        _0x347fd1 = getColor(
          _0x47bc13,
          _0x3851("0x38e"),
          jQuery(this)[_0x3851("0x188")]("data-bgopacity")
        );
        if (isLightenColor(_0x347fd1)) {
          _0x2adbe5 = getColor(_0x347fd1, _0x3851("0x386"), _0x41211f);
        } else {
          _0x2adbe5 = _0x206611;
        }
        jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2a2"), _0x347fd1);
        jQuery(this)["css"]("color", _0x2adbe5);
      } else if (!isGreyColor(_0x2024eb)) {
        _0x3dd6a7 = !![];
        jQuery(this)["css"](_0x3851("0x2a2"), _0x47bc13);
        var _0x3a8a1b = jQuery(this)["get"](0x0)[_0x3851("0x19b")][
          _0x3851("0x2b0")
        ];
        if (_0x3a8a1b != _0x3851("0x383")) {
          if (isLightenColor(_0x47bc13)) {
            _0x2adbe5 = getColor(_0x47bc13, "darken", _0x41211f);
          } else {
            _0x2adbe5 = _0x206611;
          }
          jQuery(this)["css"](_0x3851("0x2b0"), _0x2adbe5);
        }
      } else {
        var _0x3a8a1b = jQuery(this)["get"](0x0)[_0x3851("0x19b")][
          _0x3851("0x2b0")
        ];
        if (
          _0x3a8a1b &&
          _0x3a8a1b != "" &&
          _0x3a8a1b != "inherit" &&
          !isGreyColor(_0x3a8a1b)
        ) {
          if (jQuery(this)["css"]("backgroundColor") != _0x47bc13) {
            jQuery(this)["css"](_0x3851("0x2b0"), _0x47bc13);
          }
        }
      }
    }
    if (jQuery(this)["attr"](_0x3851("0x390"))) {
      var _0x3a9114 = _0x47bc13;
      if (isLightenColor(_0x47bc13)) {
        var _0x41211f = jQuery(this)[_0x3851("0x188")](_0x3851("0x391"))
          ? jQuery(this)[_0x3851("0x188")]("data-bclessp")
          : _0x3851("0x38f");
        if (jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) == "darken") {
          _0x3a9114 = getColor(_0x47bc13, _0x3851("0x386"), _0x41211f);
        } else {
          _0x3a9114 = getColor(_0x47bc13, _0x3851("0x386"), _0x41211f);
          if (
            jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) &&
            jQuery(this)[_0x3851("0x188")]("data-bcless") != _0x3851("0x392") &&
            jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) != _0x3851("0x38b")
          ) {
            _0x3a9114 = getColor(
              _0x47bc13,
              jQuery(this)[_0x3851("0x188")](_0x3851("0x390")),
              _0x41211f
            );
          }
        }
      } else {
        var _0x41211f = jQuery(this)["attr"](_0x3851("0x391"))
          ? jQuery(this)["attr"]("data-bclessp")
          : "20%";
        if (
          jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) ==
            _0x3851("0x387") ||
          jQuery(this)[_0x3851("0x188")]("data-bcless") == _0x3851("0x392") ||
          jQuery(this)[_0x3851("0x188")]("data-bcless") == _0x3851("0x38b")
        ) {
          _0x3a9114 = getColor(_0x47bc13, _0x3851("0x387"), _0x41211f);
        } else {
          if (
            jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) &&
            jQuery(this)[_0x3851("0x188")](_0x3851("0x390")) !=
              _0x3851("0x392") &&
            jQuery(this)["attr"]("data-bcless") != _0x3851("0x38b")
          ) {
            _0x3a9114 = getColor(
              _0x47bc13,
              jQuery(this)["attr"](_0x3851("0x390")),
              _0x41211f
            );
          }
        }
      }
      if (jQuery(this)[_0x3851("0x188")](_0x3851("0x393"))) {
        _0x3a9114 = getColor(
          rgb2hex(_0x3a9114),
          "fadeout",
          jQuery(this)[_0x3851("0x188")]("data-bdopacity")
        );
      }
      if (
        this[_0x3851("0x19b")][_0x3851("0x394")] ||
        this["style"][_0x3851("0x395")] ||
        this["style"][_0x3851("0x396")] ||
        this[_0x3851("0x19b")]["borderRightColor"]
      ) {
        if (
          this[_0x3851("0x19b")]["borderBottomColor"] != _0x3851("0x1f4") &&
          this[_0x3851("0x19b")][_0x3851("0x394")][_0x3851("0x1f3")]() !=
            "rgb(255,\x20255,\x20255)" &&
          this[_0x3851("0x19b")][_0x3851("0x394")]["toLowerCase"]() !=
            _0x3851("0x224") &&
          this[_0x3851("0x19b")][_0x3851("0x394")] != "initial"
        ) {
          this[_0x3851("0x19b")][_0x3851("0x394")] = _0x3a9114;
        }
        if (
          this["style"][_0x3851("0x395")] != "transparent" &&
          this[_0x3851("0x19b")]["borderTopColor"][_0x3851("0x1f3")]() !=
            _0x3851("0x397") &&
          this[_0x3851("0x19b")]["borderTopColor"][_0x3851("0x1f3")]() !=
            "#fff" &&
          this["style"][_0x3851("0x395")] != _0x3851("0x382")
        ) {
          this[_0x3851("0x19b")][_0x3851("0x395")] = _0x3a9114;
        }
        if (
          this[_0x3851("0x19b")][_0x3851("0x396")] != _0x3851("0x1f4") &&
          this[_0x3851("0x19b")][_0x3851("0x396")][_0x3851("0x1f3")]() !=
            _0x3851("0x397") &&
          this["style"][_0x3851("0x396")][_0x3851("0x1f3")]() !=
            _0x3851("0x224") &&
          this[_0x3851("0x19b")][_0x3851("0x396")] != _0x3851("0x382")
        ) {
          this[_0x3851("0x19b")]["borderLeftColor"] = _0x3a9114;
        }
        if (
          this[_0x3851("0x19b")][_0x3851("0x398")] != "transparent" &&
          this["style"][_0x3851("0x398")][_0x3851("0x1f3")]() !=
            "rgb(255,\x20255,\x20255)" &&
          this[_0x3851("0x19b")][_0x3851("0x398")][_0x3851("0x1f3")]() !=
            "#fff" &&
          this["style"][_0x3851("0x398")] != _0x3851("0x382")
        ) {
          this["style"][_0x3851("0x398")] = _0x3a9114;
        }
      } else {
        if (
          this[_0x3851("0x19b")][_0x3851("0x399")] !== _0x3851("0x1f4") &&
          this[_0x3851("0x19b")][_0x3851("0x399")] !== _0x3851("0x382")
        ) {
          this[_0x3851("0x19b")][_0x3851("0x399")] = _0x3a9114;
        }
      }
    } else {
      var _0x3a9114 = _0x47bc13;
      if (jQuery(this)[_0x3851("0x188")]("data-bdopacity")) {
        _0x3a9114 = getColor(
          _0x47bc13,
          _0x3851("0x38e"),
          jQuery(this)[_0x3851("0x188")]("data-bdopacity")
        );
      }
      if (
        this[_0x3851("0x19b")][_0x3851("0x394")] ||
        this["style"][_0x3851("0x395")] ||
        this[_0x3851("0x19b")][_0x3851("0x396")] ||
        this[_0x3851("0x19b")][_0x3851("0x398")]
      ) {
        if (
          this[_0x3851("0x19b")][_0x3851("0x394")] != _0x3851("0x1f4") &&
          this["style"][_0x3851("0x394")] != "initial"
        ) {
          setColor(this, "borderBottomColor", _0x3a9114);
        }
        if (
          this["style"][_0x3851("0x395")] != _0x3851("0x1f4") &&
          this[_0x3851("0x19b")]["borderTopColor"] != _0x3851("0x382")
        ) {
          setColor(this, "borderTopColor", _0x3a9114);
        }
        if (
          this["style"][_0x3851("0x396")] != _0x3851("0x1f4") &&
          this["style"]["borderLeftColor"] != "initial"
        ) {
          setColor(this, "borderLeftColor", _0x3a9114);
        }
        if (
          this[_0x3851("0x19b")][_0x3851("0x398")] != "transparent" &&
          this[_0x3851("0x19b")][_0x3851("0x398")] != "initial"
        ) {
          setColor(this, _0x3851("0x398"), _0x3a9114);
        }
      } else {
        var _0x396d94 = this[_0x3851("0x19b")][_0x3851("0x399")];
        if (
          _0x396d94 !== _0x3851("0x1f4") &&
          _0x396d94 !== _0x3851("0x382") &&
          !isGreyColor(_0x396d94)
        ) {
          this[_0x3851("0x19b")][_0x3851("0x399")] = _0x3a9114;
        }
      }
    }
    var _0x4c441b = jQuery(this)[_0x3851("0x1b6")]("boxShadow");
    if (_0x4c441b && _0x4c441b != _0x3851("0x39a")) {
      var _0x5ee69d = new RegExp("rgb\x5c([\x5cd|,|\x5cs]+?\x5c)", "ig");
      var _0x161a32 = _0x4c441b[_0x3851("0x30a")](_0x5ee69d);
      if (_0x161a32) {
        for (
          var _0xb3da6e = 0x0;
          _0xb3da6e < _0x161a32[_0x3851("0x187")];
          _0xb3da6e++
        ) {
          if (isGreyColor(_0x161a32[_0xb3da6e])) {
            continue;
          }
          var _0x1dfe26 = "data-shadowless" + _0xb3da6e;
          var _0xa4a17 = _0x47bc13;
          if (jQuery(this)[_0x3851("0x188")](_0x1dfe26)) {
            var _0x4776b1 = jQuery(this)[_0x3851("0x188")](_0x1dfe26 + "p")
              ? jQuery(this)["attr"](_0x1dfe26 + "p")
              : _0x3851("0x389");
            _0xa4a17 = getColor(
              _0x47bc13,
              jQuery(this)[_0x3851("0x188")](_0x1dfe26),
              _0x4776b1
            );
          }
          _0x4c441b = _0x4c441b["replace"](_0x161a32[_0xb3da6e], _0xa4a17)[
            "replace"
          ](_0x161a32[_0xb3da6e][_0x3851("0x1cd")](/ /g, ""), _0xa4a17);
        }
        jQuery(this)["css"](_0x3851("0x39b"), _0x4c441b);
      }
    }
    var _0x28d60c = jQuery(this)[_0x3851("0x1b6")](_0x3851("0x363"));
    if (_0x28d60c["indexOf"]("linear-gradient(") >= 0x0) {
      var _0x264ce0 = jQuery(this)["attr"](_0x3851("0x19b"));
      var _0x5ee69d = new RegExp(_0x3851("0x39c"), "ig");
      var _0x161a32 = _0x28d60c[_0x3851("0x30a")](_0x5ee69d);
      if (_0x161a32) {
        if (jQuery(this)["attr"](_0x3851("0x38a"))) {
          var _0x2103af = jQuery(this)[_0x3851("0x188")](_0x3851("0x388"))
            ? jQuery(this)[_0x3851("0x188")](_0x3851("0x388"))
            : _0x3851("0x389");
          main_color = getColor(
            _0x47bc13,
            jQuery(this)[_0x3851("0x188")](_0x3851("0x38a")),
            _0x2103af
          );
        } else if (isLightenColor(_0x47bc13)) {
          main_color = getColor(_0x47bc13, "saturate", _0x3851("0x38f"));
        } else {
          main_color = getColor(_0x47bc13, _0x3851("0x387"), "5%");
          main_color = getColor(main_color, _0x3851("0x1ed"), _0x3851("0x39d"));
          main_color = getColor(main_color, _0x3851("0x39e"), "20%");
        }
        if (jQuery(this)[_0x3851("0x188")](_0x3851("0x39f"))) {
          gradient_color = getColor(
            main_color,
            jQuery(this)["attr"](_0x3851("0x39f")),
            jQuery(this)[_0x3851("0x188")](_0x3851("0x3a0"))
          );
        } else if (jQuery(this)[_0x3851("0x188")](_0x3851("0x3a1"))) {
          gradient_color = jQuery(this)[_0x3851("0x188")](_0x3851("0x3a1"));
        } else {
          gradient_color = getColor(
            main_color,
            _0x3851("0x387"),
            _0x3851("0x389")
          );
        }
        if (isLightenColor(main_color)) {
          _0x2adbe5 = getColor(main_color, "darken", "50%");
          _0x2adbe5 = getColor(_0x2adbe5, _0x3851("0x38c"), "30%");
        } else {
          _0x2adbe5 = getColor(main_color, _0x3851("0x387"), _0x3851("0x381"));
        }
        for (
          var _0xb3da6e = 0x0;
          _0xb3da6e < _0x161a32[_0x3851("0x187")];
          _0xb3da6e++
        ) {
          if (isGreyColor(_0x161a32[_0xb3da6e])) {
            continue;
          }
          if (
            jQuery(this)[_0x3851("0x188")]("data-grorder") == _0x3851("0x3a2")
          ) {
            if (
              _0xb3da6e % 0x2 == 0x0 ||
              (_0xb3da6e > 0x0 &&
                _0x161a32[_0xb3da6e] == _0x161a32[_0xb3da6e - 0x1])
            ) {
              _0x264ce0 = _0x264ce0[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e],
                gradient_color
              )[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e][_0x3851("0x1cd")](/ /g, ""),
                gradient_color
              );
            } else {
              _0x264ce0 = _0x264ce0[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e],
                main_color
              )["replace"](
                _0x161a32[_0xb3da6e][_0x3851("0x1cd")](/ /g, ""),
                main_color
              );
            }
          } else {
            if (
              _0xb3da6e % 0x2 == 0x0 ||
              (_0xb3da6e > 0x0 &&
                _0x161a32[_0xb3da6e] == _0x161a32[_0xb3da6e - 0x1])
            ) {
              _0x264ce0 = _0x264ce0[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e],
                main_color
              )[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e]["replace"](/ /g, ""),
                main_color
              );
            } else {
              _0x264ce0 = _0x264ce0[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e],
                gradient_color
              )[_0x3851("0x1cd")](
                _0x161a32[_0xb3da6e]["replace"](/ /g, ""),
                gradient_color
              );
            }
          }
        }
        jQuery(this)[_0x3851("0x188")](_0x3851("0x19b"), _0x264ce0);
        jQuery(this)["css"](_0x3851("0x2b0"), _0x2adbe5);
      }
    }
  });
  return _0x217b44;
}

function parseHtml(_0x5917aa, _0x4a5e3f, _0x16e30d) {
  var _0x3b4266 = jQuery(
    "<div\x20id=\x22editor-content\x22>" + _0x5917aa + "</div>"
  );
  _0x3b4266 = parseObject(_0x3b4266, _0x4a5e3f, _0x16e30d);
  var _0x1ca18c = _0x3b4266["html"]();
  _0x3b4266 = null;
  return _0x1ca18c;
}

function style_click(_0x1b99f7) {
  var _0x422e39 = BASEURL + _0x3851("0x3a3");
  ajaxAction(_0x422e39, { id: _0x1b99f7 });
  return ![];
}

function setFavorColor(_0x1bf948, _0x4599e1) {
  var _0x5cf65c = BASEURL + _0x3851("0x3a4");
  ajaxAction(_0x5cf65c, { colors: _0x1bf948 }, null, _0x4599e1);
}

function color_click(_0x210f8d) {
  _0x210f8d = hex2rgb(_0x210f8d);
  var _0x5a2ee0 = BASEURL + _0x3851("0x3a5");
  ajaxAction(_0x5a2ee0, { color: _0x210f8d });
  return ![];
}

function setColor(_0x414ea6, _0x917abe, _0x3e0257) {
  var _0x221b77 = jQuery(_0x414ea6)[_0x3851("0x1b6")](_0x917abe);
  if (_0x221b77 === _0x3851("0x1f4") || _0x221b77 === _0x3851("0x382")) {
    return;
  } else {
    if (!isGreyColor(_0x221b77)) {
      jQuery(_0x414ea6)[_0x3851("0x1b6")](_0x917abe, _0x3e0257);
    }
  }
}

function getPrarentBgColor(_0x2e515d) {
  if (!_0x2e515d[_0x3851("0x2ac")]()[_0x3851("0x2b2")](0x0)) {
    return "";
  }
  if (
    _0x2e515d["parent"]()[_0x3851("0x2b2")](0x0)["tagName"] &&
    _0x2e515d[_0x3851("0x2ac")]()["get"](0x0)["tagName"] == _0x3851("0x379")
  ) {
    if (
      _0x2e515d[_0x3851("0x2ac")]()[_0x3851("0x2b2")](0x0)[_0x3851("0x19b")]
    ) {
      var _0x36d15a = _0x2e515d[_0x3851("0x2ac")]()[_0x3851("0x2b2")](0x0)[
        _0x3851("0x19b")
      ][_0x3851("0x2a2")];
      return _0x36d15a;
    } else {
      return "";
    }
  }
  if (_0x2e515d["parent"]()[_0x3851("0x2b2")](0x0)[_0x3851("0x19b")]) {
    var _0x2cdbd6 = _0x2e515d[_0x3851("0x2ac")]()[_0x3851("0x2b2")](0x0)[
      _0x3851("0x19b")
    ]["backgroundImage"];
    if (_0x2cdbd6 && _0x2cdbd6 != "") {
      return "";
    }
    var _0x36d15a = _0x2e515d[_0x3851("0x2ac")]()[_0x3851("0x2b2")](0x0)[
      "style"
    ][_0x3851("0x2a2")];
    if (
      !_0x36d15a ||
      _0x36d15a === _0x3851("0x382") ||
      _0x36d15a === _0x3851("0x1f4") ||
      _0x36d15a === ""
    ) {
      return getPrarentBgColor(_0x2e515d[_0x3851("0x2ac")]());
    } else {
      return _0x36d15a;
    }
  } else {
    return "";
  }
}

function rgb2hex(_0x4061a9) {
  rgb = _0x4061a9[_0x3851("0x30a")](
    /^rgb[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
  );
  var _0x88cb2c =
    rgb && rgb[_0x3851("0x187")] === 0x4
      ? "#" +
        ("0" + parseInt(rgb[0x1], 0xa)[_0x3851("0x1ea")](0x10))[
          _0x3851("0x213")
        ](-0x2) +
        ("0" + parseInt(rgb[0x2], 0xa)[_0x3851("0x1ea")](0x10))[
          _0x3851("0x213")
        ](-0x2) +
        ("0" + parseInt(rgb[0x3], 0xa)["toString"](0x10))[_0x3851("0x213")](
          -0x2
        )
      : _0x4061a9;
  return _0x88cb2c["toLowerCase"]();
}

function hex2rgb(_0x277cea) {
  var _0x1e652d = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  var _0x2bbfc1 = _0x277cea[_0x3851("0x1f3")]();
  if (_0x2bbfc1 && _0x1e652d["test"](_0x2bbfc1)) {
    if (_0x2bbfc1["length"] === 0x4) {
      var _0x36551d = "#";
      for (var _0x5ae3f6 = 0x1; _0x5ae3f6 < 0x4; _0x5ae3f6 += 0x1) {
        _0x36551d += _0x2bbfc1["slice"](_0x5ae3f6, _0x5ae3f6 + 0x1)[
          _0x3851("0x212")
        ](_0x2bbfc1[_0x3851("0x213")](_0x5ae3f6, _0x5ae3f6 + 0x1));
      }
      _0x2bbfc1 = _0x36551d;
    }
    var _0x315274 = [];
    for (var _0x5ae3f6 = 0x1; _0x5ae3f6 < 0x7; _0x5ae3f6 += 0x2) {
      _0x315274[_0x3851("0x186")](
        parseInt("0x" + _0x2bbfc1[_0x3851("0x213")](_0x5ae3f6, _0x5ae3f6 + 0x2))
      );
    }
    return _0x3851("0x208") + _0x315274["join"](",\x20") + ")";
  } else {
    return _0x2bbfc1;
  }
}

function isLightenColor(_0x1826e2) {
  var _0x54cb87 = rgb2hex(_0x1826e2);
  var _0x4f10e7 = "" + _0x54cb87[_0x3851("0x30c")](0x1, 0x3);
  var _0x39345e = "" + _0x54cb87[_0x3851("0x30c")](0x3, 0x5);
  var _0x2fd624 = "" + _0x54cb87[_0x3851("0x30c")](0x5, 0x7);
  if (_0x4f10e7 > "C0" && _0x39345e > "C0" && _0x2fd624 > "C0") {
    return !![];
  } else {
    return ![];
  }
}

function isGreyColor(_0x3c412d) {
  var _0x3a61f8 = rgb2hex(_0x3c412d);
  var _0x4bf5f0 = "" + _0x3a61f8[_0x3851("0x30c")](0x1, 0x3);
  var _0x32c5e4 = "" + _0x3a61f8[_0x3851("0x30c")](0x3, 0x5);
  var _0x4e03d0 = "" + _0x3a61f8[_0x3851("0x30c")](0x5, 0x7);
  if (_0x4bf5f0 == _0x32c5e4 && _0x32c5e4 == _0x4e03d0) {
    return !![];
  } else {
    return ![];
  }
}

function getColor(_0x9bf84b, _0x3eb938, _0xb46bcb) {
  var _0x3037bf = "";
  var _0x4c17a1 = tinycolor(_0x9bf84b);
  if (typeof _0x4c17a1[_0x3eb938] == _0x3851("0x3a6")) {
    _0xb46bcb = parseInt(_0xb46bcb[_0x3851("0x1cd")]("%", ""));
    return rgb2hex(_0x4c17a1[_0x3eb938](_0xb46bcb)[_0x3851("0x1ea")]());
  } else if (
    _0x3eb938 == _0x3851("0x3a7") ||
    _0x3eb938 == "fadein" ||
    _0x3eb938 == _0x3851("0x38e")
  ) {
    if (_0xb46bcb[_0x3851("0x1f2")]("%") > 0x0) {
      _0xb46bcb = _0xb46bcb[_0x3851("0x1cd")]("%", "");
      _0xb46bcb = parseInt(_0xb46bcb) / 0x64;
    }
    if (_0x3eb938 == "fadein") {
      _0xb46bcb += _0x4c17a1[_0x3851("0x3a8")]();
    } else if (_0x3eb938 == "fadeout") {
      _0xb46bcb = _0x4c17a1[_0x3851("0x3a8")]() - _0xb46bcb;
    }
    return rgb2hex(_0x4c17a1["setAlpha"](_0xb46bcb)["toString"]());
  }
  return rgb2hex(_0x9bf84b);
}

function LightenDarkenColor(_0x5001bd, _0x1d0f37) {
  var _0x4e9928 = ![];
  if (_0x5001bd[0x0] == "#") {
    _0x5001bd = _0x5001bd[_0x3851("0x213")](0x1);
    _0x4e9928 = !![];
  }
  var _0x2b2490 = parseInt(_0x5001bd, 0x10);
  var _0x246412 = (_0x2b2490 >> 0x10) + _0x1d0f37;
  if (_0x246412 > 0xff) _0x246412 = 0xff;
  else if (_0x246412 < 0x0) _0x246412 = 0x0;
  var _0x3fb0f8 = ((_0x2b2490 >> 0x8) & 0xff) + _0x1d0f37;
  if (_0x3fb0f8 > 0xff) _0x3fb0f8 = 0xff;
  else if (_0x3fb0f8 < 0x0) _0x3fb0f8 = 0x0;
  var _0x4433a0 = (_0x2b2490 & 0xff) + _0x1d0f37;
  if (_0x4433a0 > 0xff) _0x4433a0 = 0xff;
  else if (_0x4433a0 < 0x0) _0x4433a0 = 0x0;
  return (
    (_0x4e9928 ? "#" : "") +
    (_0x4433a0 | (_0x3fb0f8 << 0x8) | (_0x246412 << 0x10))["toString"](0x10)
  );
}

function openTplModal() {
  jQuery(_0x3851("0x3a9"))["modal"](_0x3851("0x2d2"));
  jQuery(_0x3851("0x3aa"))
    [_0x3851("0x2d3")](_0x3851("0x3ab"))
    [_0x3851("0x3ac")](
      BASEURL + "/editor_styles/myTemplates\x20#my-templates",
      function () {
        jQuery("#my-templates\x20.nav-tabs\x20a:first")["tab"](
          _0x3851("0x2d2")
        );
      }
    );
}

function set_style(_0x231b7f) {
  ckeditors[_0x3851("0x3ad")][_0x3851("0x347")](_0x3851("0x3ae"));
  var _0x133bfb = ckeditors[_0x3851("0x3ad")]
    ["getSelection"]()
    [_0x3851("0x3af")]();
  if (_0x133bfb[_0x3851("0x3b0")]() == _0x3851("0x359")) {
    _0x133bfb[_0x3851("0x3b1")](_0x231b7f);
  } else {
    var _0x16df42 = new CKEDITOR[_0x3851("0x19b")]({
      element: _0x133bfb[_0x3851("0x3b0")](),
      styles: _0x231b7f,
    });
    ckeditors[_0x3851("0x3ad")][_0x3851("0x3b2")](_0x16df42);
  }
}

function getPreferences(_0x40ed51) {
  var _0x3d715c = current_editor["getPreferences"](_0x3851("0x3b3"));
  if (_0x3d715c && _0x3d715c[_0x40ed51]) {
    return _0x3d715c[_0x40ed51];
  }
  return null;
}

function setPreferences(_0x5127a3, _0x3b68b6) {
  var _0xa95ed9 = current_editor[_0x3851("0x3b4")](_0x3851("0x3b3"));
  var _0x53a4c0 = {};
  if (typeof _0x5127a3 == "string") {
    _0x53a4c0[_0x5127a3] = _0x3b68b6;
  } else {
    _0x53a4c0 = _0x5127a3;
  }
  if (!_0xa95ed9) _0xa95ed9 = {};
  jQuery["extend"](_0xa95ed9, _0x53a4c0);
  current_editor[_0x3851("0x3b5")](_0x3851("0x3b3"), _0xa95ed9);
}

function applyParagraph(_0x3fc3b4) {
  var _0x159712;
  if (_0x3fc3b4 == _0x3851("0x15f")) {
    var _0x5180f3 = current_editor["selection"][_0x3851("0x34d")];
    _0x159712 = jQuery(_0x5180f3);
  } else {
    if (!current_editor[_0x3851("0x320")]()) return;
    _0x159712 = current_editor["currentActive135Item"]();
  }
  jQuery(_0x159712)
    ["find"]("p")
    [_0x3851("0x2dc")](function () {
      jQuery(this)[_0x3851("0x1b6")](
        _0x3851("0x3b6"),
        jQuery(_0x3851("0x3b7"))[_0x3851("0x29f")]()
      );
      jQuery(this)[_0x3851("0x1b6")](
        _0x3851("0x3b8"),
        jQuery(_0x3851("0x3b9"))[_0x3851("0x29f")]()
      );
      jQuery(this)[_0x3851("0x1b6")](
        _0x3851("0x3ba"),
        jQuery("#paragraph-fontSize")["val"]()
      );
      jQuery(this)["css"](
        _0x3851("0x3bb"),
        jQuery("#paragraph-textIndent")[_0x3851("0x29f")]()
      );
      jQuery(this)["css"](
        _0x3851("0x338"),
        jQuery(_0x3851("0x3bc"))[_0x3851("0x29f")]()
      );
      jQuery(this)[_0x3851("0x1b6")](
        _0x3851("0x339"),
        jQuery("#paragraph-paddingBottom")["val"]()
      );
    });
}

function clean_135helper() {
  if (current_editor && current_editor[_0x3851("0x314")]) {
    if (current_editor[_0x3851("0x3bd")]) {
      current_editor["helper"][_0x3851("0x3be")]()[_0x3851("0x2d5")]();
    } else {
      var _0x55951c = current_editor[_0x3851("0x314")][_0x3851("0x34d")];
      jQuery(_0x55951c)
        [_0x3851("0x176")]("._135editor")
        [_0x3851("0x2dc")](function () {
          jQuery(this)[_0x3851("0x1bf")](_0x3851("0x3bf"));
        });
      jQuery(_0x55951c)[_0x3851("0x176")](_0x3851("0x3c0"))[_0x3851("0x34f")]();
      jQuery(_0x55951c)[_0x3851("0x176")](_0x3851("0x3c1"))[_0x3851("0x34f")]();
    }
  }
}

function showColorPlan(_0x5d223c) {
  if (current_editor) {
    var _0x267a71 = jQuery(current_editor[_0x3851("0x3c2")]);
    var _0x3ede0a = _0x267a71[_0x3851("0x2cb")]();
    var _0x8e9f57 = _0x267a71[_0x3851("0x1c3")]();
    var _0x5207a7 = _0x267a71[_0x3851("0x1c4")]();
    if (
      _0x3ede0a!==undefined &&
      _0x3ede0a[_0x3851("0x199")] +
        _0x8e9f57 +
        jQuery(_0x3851("0x3c3"))[_0x3851("0x1c3")]() <
      jQuery(window)[_0x3851("0x1c3")]()
    ) {
      jQuery("#color-plan")[_0x3851("0x1b6")](
        "left",
        _0x3ede0a[_0x3851("0x199")] + _0x8e9f57 - 0x5
      );
    } else {
      if( _0x3ede0a !==undefined)
      {
        jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
          _0x3851("0x199"),
          _0x3ede0a["left"] - jQuery(_0x3851("0x3c3"))[_0x3851("0x1c3")]()
        );
      }

    }
    if (_0x5d223c) {
      if (
        _0x5d223c - jQuery(window)[_0x3851("0x3c4")]() >
        jQuery("#color-plan")[_0x3851("0x1c4")]() / 0x2
      ) {
        var _0x1eb40d =
          _0x5d223c -
          jQuery(window)[_0x3851("0x3c4")]() -
          jQuery(_0x3851("0x3c3"))[_0x3851("0x1c4")]() / 0x2;
        if (
          jQuery(window)[_0x3851("0x1c4")]() - _0x1eb40d >
          jQuery("#color-plan")[_0x3851("0x1c4")]()
        ) {
          jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
            _0x3851("0x3c5"),
            _0x3851("0x392")
          );
          if (
            _0x1eb40d <
            _0x3ede0a[_0x3851("0x19c")] +
              _0x267a71[_0x3851("0x176")](_0x3851("0x3c6"))[
                _0x3851("0x1c4")
              ]() -
              jQuery(window)[_0x3851("0x3c4")]()
          ) {
            jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
              "top",
              _0x3ede0a[_0x3851("0x19c")] +
                _0x267a71[_0x3851("0x176")](_0x3851("0x3c6"))[
                  _0x3851("0x1c4")
                ]() -
                jQuery(window)[_0x3851("0x3c4")]()
            );
          } else if (
            _0x1eb40d + jQuery(_0x3851("0x3c3"))["height"]() >
            _0x3ede0a[_0x3851("0x19c")] +
              _0x267a71[_0x3851("0x1c4")]() -
              jQuery(window)[_0x3851("0x3c4")]()
          ) {
            jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
              _0x3851("0x19c"),
              _0x3ede0a[_0x3851("0x19c")] +
                _0x267a71[_0x3851("0x1c4")]() -
                jQuery(window)[_0x3851("0x3c4")]() -
                jQuery(_0x3851("0x3c3"))[_0x3851("0x1c4")]() +
                0x14
            );
          } else {
            jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
              _0x3851("0x19c"),
              _0x1eb40d
            );
          }
        } else {
          jQuery("#color-plan")[_0x3851("0x1b6")](
            _0x3851("0x19c"),
            _0x3851("0x392")
          );
          jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](_0x3851("0x3c5"), 0x0);
        }
      } else {
        if (
          jQuery(window)[_0x3851("0x3c4")]() <
          _0x3ede0a[_0x3851("0x19c")] +
            _0x267a71[_0x3851("0x176")](_0x3851("0x3c6"))["height"]()
        ) {
          jQuery("#color-plan")["css"](
            _0x3851("0x19c"),
            _0x3ede0a[_0x3851("0x19c")] +
              _0x267a71[_0x3851("0x176")](_0x3851("0x3c6"))[
                _0x3851("0x1c4")
              ]() -
              jQuery(window)[_0x3851("0x3c4")]()
          );
          jQuery("#color-plan")[_0x3851("0x1b6")](
            _0x3851("0x3c5"),
            _0x3851("0x392")
          );
        } else {
          jQuery("#color-plan")[_0x3851("0x1b6")](_0x3851("0x19c"), 0x0);
          jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
            _0x3851("0x3c5"),
            _0x3851("0x392")
          );
        }
      }
    } else {
      if(_0x3ede0a!==undefined)
      {
        jQuery(_0x3851("0x3c3"))[_0x3851("0x1b6")](
          _0x3851("0x19c"),
          _0x3ede0a[_0x3851("0x19c")] +
          _0x5207a7 / 0x2 -
          0x78 -
          jQuery(window)["scrollTop"]()
        );
      }

    }
    jQuery(_0x3851("0x3c3"))[_0x3851("0x2d2")]();
  } else {
    jQuery("#color-plan")[_0x3851("0x2d2")]();
  }
}

function hideColorPlan() {
  jQuery(_0x3851("0x3c3"))["hide"]();
}

function meitu_upload(_0x53b484) {
  if (sso[_0x3851("0x3c7")]()) {
    publishController["open_html_dialog"](_0x3851("0x3c8"));
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3ca"), 0x0);
    xiuxiu[_0x3851("0x3c9")]("maxFinalWidth", 0x258);
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3cb"), [
      _0x3851("0x3cc"),
      _0x3851("0x3cd"),
      _0x3851("0x3ce"),
    ]);
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3cf"), "上传", _0x3851("0x3d0"));
    xiuxiu["embedSWF"]("MeituFullContent", 0x3, 0x3ac, 0x258, _0x3851("0x3d0"));
    xiuxiu[_0x3851("0x3d1")](
      BASEURL + _0x3851("0x3d2") + localStorage[_0x3851("0x3d3")]
    );
    xiuxiu["setUploadType"](0x2);
    xiuxiu[_0x3851("0x3d4")](_0x3851("0x3d5"));
    xiuxiu[_0x3851("0x3d6")] = function (_0x5d59f8, _0x3323e8) {
      var _0x2c2d17 = _0x5d59f8[_0x3851("0x21c")];
      if (_0x2c2d17 > 0x400 * 0x400) {
        alert(_0x3851("0x3d7"));
        return ![];
      }
      xiuxiu["setUploadArgs"](
        { return: _0x3851("0x3d8"), no_thumb: 0x1 },
        _0x3323e8
      );
      return !![];
    };
    xiuxiu[_0x3851("0x3d9")] = function (_0x420930, _0x5ad2e7) {
      try {
        var _0xddc600 = eval("(" + _0x420930 + ")");
      } catch (_0x255bb8) {
        alert(_0x420930);
        return;
      }
      if (_0xddc600[_0x3851("0x3da")] == -0x1) {
        showErrorMessage(_0xddc600[_0x3851("0x3db")]);
      } else {
        var _0x4d3ad1 = current_editor[_0x3851("0x314")]["getRange"]();
        var _0x5a9a91 = ![];
        if (!_0x4d3ad1[_0x3851("0x3dc")]) {
          var _0x1e160c = _0x4d3ad1[_0x3851("0x3dd")]();
          if (_0x1e160c && _0x1e160c["tagName"] == _0x3851("0x32e")) {
            _0x1e160c[_0x3851("0x35d")] = _0xddc600["url"];
            _0x1e160c[_0x3851("0x3de")]("_src", _0xddc600[_0x3851("0x3df")]);
            var _0x44438a = $(_0x1e160c)["parent"]();
            if (
              _0x44438a["attr"](_0x3851("0x360")) == _0x3851("0x3e0") ||
              _0x44438a[_0x3851("0x188")](_0x3851("0x360")) == "bgmirror" ||
              _0x44438a[_0x3851("0x188")](_0x3851("0x360")) == "square"
            ) {
              _0x44438a[_0x3851("0x1b6")](
                _0x3851("0x363"),
                _0x3851("0x35c") + _0xddc600["url"] + ")"
              );
            }
            _0x5a9a91 = !![];
          }
        }
        if (!_0x5a9a91) {
          insertHtml(
            _0x3851("0x3e1") +
              _0xddc600[_0x3851("0x3df")] +
              _0x3851("0x3e2") +
              _0xddc600["url"] +
              "\x22>"
          );
        }
        publishController[_0x3851("0x3e3")]();
      }
      if (typeof _0x53b484 == _0x3851("0x3a6")) {
        return _0x53b484(_0xddc600["url"]);
      }
    };
    xiuxiu[_0x3851("0x3e4")] = function (_0x3b0c8d) {
      publishController["close_dialog"]();
    };
  } else {
    showErrorMessage(_0x3851("0x3e5"));
  }
}

function pingtu_upload(_0x1ca5bd) {
  if (sso[_0x3851("0x3c7")]()) {
    publishController["open_html_dialog"](_0x3851("0x3e6"));
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3ca"), 0x0);
    xiuxiu[_0x3851("0x3c9")]("maxFinalWidth", 0x258);
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3cf"), "上传", _0x3851("0x3e7"));
    xiuxiu[_0x3851("0x3e8")](
      _0x3851("0x3e9"),
      0x2,
      0x2bc,
      0x1f4,
      _0x3851("0x3e7")
    );
    xiuxiu[_0x3851("0x3d1")](
      BASEURL + "/uploadfiles/upload?team_id=" + localStorage[_0x3851("0x3d3")]
    );
    xiuxiu["setUploadType"](0x2);
    xiuxiu["setUploadDataFieldName"](_0x3851("0x3d5"));
    xiuxiu["onBeforeUpload"] = function (_0x54c2ac, _0x37236e) {
      var _0x4a2e9a = _0x54c2ac[_0x3851("0x21c")];
      if (_0x4a2e9a > 0x400 * 0x400) {
        alert("图片不能超过1M");
        return ![];
      }
      xiuxiu["setUploadArgs"](
        { return: _0x3851("0x3d8"), no_thumb: 0x1 },
        _0x37236e
      );
      return !![];
    };
    xiuxiu[_0x3851("0x3d9")] = function (_0xecb8d2, _0x87b571) {
      try {
        var _0x328122 = eval("(" + _0xecb8d2 + ")");
      } catch (_0x22ec34) {
        alert(_0xecb8d2);
        return;
      }
      if (_0x328122[_0x3851("0x3da")] == -0x1) {
        showErrorMessage(_0x328122[_0x3851("0x3db")]);
      } else {
        var _0x3d7d11 = current_editor[_0x3851("0x314")][_0x3851("0x319")]();
        var _0x83b244 = ![];
        if (!_0x3d7d11[_0x3851("0x3dc")]) {
          var _0x1b983a = _0x3d7d11["getClosedNode"]();
          if (_0x1b983a && _0x1b983a[_0x3851("0x179")] == _0x3851("0x32e")) {
            _0x1b983a["src"] = _0x328122[_0x3851("0x3df")];
            _0x1b983a[_0x3851("0x3de")](_0x3851("0x3ea"), _0x328122["url"]);
            var _0x24e37b = $(_0x1b983a)[_0x3851("0x2ac")]();
            if (
              _0x24e37b[_0x3851("0x188")](_0x3851("0x360")) ==
                _0x3851("0x3e0") ||
              _0x24e37b[_0x3851("0x188")]("data-role") == _0x3851("0x362") ||
              _0x24e37b[_0x3851("0x188")]("data-role") == _0x3851("0x361")
            ) {
              _0x24e37b[_0x3851("0x1b6")](
                _0x3851("0x363"),
                "url(" + _0x328122["url"] + ")"
              );
            }
            _0x83b244 = !![];
          }
        }
        if (!_0x83b244) {
          insertHtml(
            "<img\x20src=\x22" +
              _0x328122[_0x3851("0x3df")] +
              _0x3851("0x3e2") +
              _0x328122[_0x3851("0x3df")] +
              "\x22>"
          );
        }
        publishController["close_dialog"]();
      }
      if (typeof _0x1ca5bd == _0x3851("0x3a6")) {
        return _0x1ca5bd(_0x328122["url"]);
      }
    };
    xiuxiu[_0x3851("0x3e4")] = function (_0x5c7e50) {
      publishController["close_dialog"]();
    };
  } else {
    showErrorMessage(_0x3851("0x3eb"));
  }
}

function isGif(_0x5265eb) {
  var _0x3a7cf4 = _0x5265eb[_0x3851("0x1f2")](_0x3851("0x3ec"));
  if (_0x3a7cf4 > 0x0) {
    _0x5265eb = base64_decode(_0x5265eb["substring"](_0x3a7cf4 + 0xd));
  }
  if (
    _0x5265eb["indexOf"](_0x3851("0x3ed")) > 0x0 ||
    _0x5265eb[_0x3851("0x1f2")](_0x3851("0x3ee")) > 0x0
  ) {
    return !![];
  } else {
    return ![];
  }
}

function soogif_edit(_0x4abedf) {
  var _0x222114 =
    _0x3851("0x3ef") +
    _0x3851("0x3f0") +
    "<iframe\x20id=\x22qiframe\x22\x20src=\x22https://www.soogif.com/html/toolapi/index.html?src=" +
    _0x4abedf +
    _0x3851("0x3f1") +
    _0x3851("0x3f2") +
    _0x3851("0x3f3");
  $(_0x222114)[_0x3851("0x302")]($(_0x3851("0x2da")));
  $(_0x3851("0x3f4"))
    [_0x3851("0x1b6")]({
      display: _0x3851("0x304"),
      position: _0x3851("0x3f5"),
      left: "0",
      "z-index": _0x3851("0x3f6"),
      top: "0",
      width: _0x3851("0x1f0"),
      height: _0x3851("0x1f0"),
      background: "rgba(0,0,0,0.3)",
    })
    [_0x3851("0x176")](_0x3851("0x3f7"))
    [_0x3851("0x1b6")]({
      position: _0x3851("0x1bb"),
      left: _0x3851("0x381"),
      top: "50%",
      "-webkit-transform": "translate(-50%,-50%)",
      "-moz-transform": _0x3851("0x3f8"),
      "-ms-transform": _0x3851("0x3f8"),
      transform: _0x3851("0x3f8"),
      width: _0x3851("0x3f9"),
      height: "540px",
      "box-sizing": _0x3851("0x32d"),
    })
    [_0x3851("0x176")](_0x3851("0x3fa"))
    ["css"]({
      position: _0x3851("0x1bb"),
      right: _0x3851("0x3fb"),
      top: "0",
      width: "46px",
      height: _0x3851("0x3fc"),
      font: _0x3851("0x3fd"),
      "text-align": _0x3851("0x3fe"),
      "line-height": _0x3851("0x3ff"),
      background: _0x3851("0x400"),
      color: _0x3851("0x224"),
      cursor: _0x3851("0x401"),
    });
  $(_0x3851("0x2da"))[_0x3851("0x402")](
    _0x3851("0x403"),
    _0x3851("0x167"),
    function () {
      $(_0x3851("0x3f4"))[_0x3851("0x34f")]();
    }
  );
}

function user_fotor_profile() {
  return new Promise(function (_0x18f0fe, _0x33eee3) {
    if (sso[_0x3851("0x3c7")]()) {
      $["ajax"](BASEURL + _0x3851("0x404"))
        [_0x3851("0x405")](_0x18f0fe)
        [_0x3851("0x406")](_0x33eee3);
    } else {
      _0x33eee3(_0x3851("0x407"));
    }
  });
}

function crop_image(_0x17da73, _0x46f66b, _0x557c5e) {
  publishController[_0x3851("0x408")](
    BASEURL +
      _0x3851("0x409") +
      encodeURIComponent(_0x17da73) +
      _0x3851("0x40a") +
      _0x46f66b +
      _0x3851("0x40b") +
      _0x557c5e,
    { title: _0x3851("0x40c"), id: _0x3851("0x40d"), width: 0x3c0 }
  );
}

function edit_image(_0xc695b) {
  if (!sso["check_userlogin"]()) {
    showErrorMessage("编辑图片属于付费功能。更换图片请直接双击图片");
    return;
  }
  if (isGif(_0xc695b)) {
    soogif_edit(_0xc695b);
    return;
  }
  if (typeof Promise != _0x3851("0x3a6")) {
    xiuxiu_edit_image(_0xc695b);
  } else if (FotorFrame) {
    FotorFrame[_0x3851("0x307")](
      _0x3851("0x40e"),
      null,
      function (_0xfda02) {
        showSuccessMessage(_0x3851("0x40f"));
        ajaxAction(BASEURL + _0x3851("0x410"), _0xfda02, null, function (
          _0x371196
        ) {
          if (
            _0x371196[_0x3851("0x3da")] == 0x0 &&
            _0x371196[_0x3851("0x3df")]
          ) {
            var _0x114d5 = current_editor[_0x3851("0x314")]["getRange"]();
            if (!_0x114d5[_0x3851("0x3dc")]) {
              var _0x304fdd = _0x114d5["getClosedNode"]();
              if (
                _0x304fdd &&
                _0x304fdd[_0x3851("0x179")] == _0x3851("0x32e")
              ) {
                _0x304fdd[_0x3851("0x35d")] = _0x371196["url"];
                _0x304fdd[_0x3851("0x3de")](
                  _0x3851("0x3ea"),
                  _0x371196[_0x3851("0x3df")]
                );
                var _0x26f110 = $(_0x304fdd)[_0x3851("0x2ac")]();
                if (
                  _0x26f110[_0x3851("0x188")](_0x3851("0x360")) == "circle" ||
                  _0x26f110["attr"](_0x3851("0x360")) == "bgmirror" ||
                  _0x26f110["attr"](_0x3851("0x360")) == _0x3851("0x361")
                ) {
                  _0x26f110[_0x3851("0x1b6")](
                    _0x3851("0x363"),
                    _0x3851("0x35c") + _0x371196["url"] + ")"
                  );
                }
                return;
              }
            }
            insertHtml(
              _0x3851("0x411") + _0x371196[_0x3851("0x3df")] + _0x3851("0x412")
            );
          } else if (_0x371196["msg"]) {
            showErrorMessage(_0x371196[_0x3851("0x413")]);
          }
        });
        FotorFrame[_0x3851("0x2d5")]();
      },
      _0x3851("0x414"),
      _0x3851("0x392"),
      function () {},
      { locale: "zh_CN", hideVipContent: 0x1 }
    );
    console[_0x3851("0x1af")](_0xc695b);
    FotorFrame[_0x3851("0x2d2")](_0x3851("0x415"), "", _0xc695b);
  } else {
    loadjs("https://static.fotor.com.cn/static/web/sdk/js/FotorFrameV4.min.js");
    showSuccessMessage("为您重新加载编辑脚本");
    setTimeout(function () {
      edit_image(_0xc695b);
    }, 0x1388);
  }
}

function xiuxiu_edit_image(_0x27b103) {
  if (sso[_0x3851("0x3c7")]()) {
    if (isGif(_0x27b103)) {
      soogif_edit(_0x27b103);
      return;
    }
    publishController["open_html_dialog"](_0x3851("0x416"));
    xiuxiu[_0x3851("0x3c9")]("titleVisible", 0x0);
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x417"), 0x258);
    xiuxiu[_0x3851("0x3c9")](_0x3851("0x3cf"), "上传", _0x3851("0x418"));
    xiuxiu[_0x3851("0x3e8")](
      _0x3851("0x419"),
      0x1,
      0x2bc,
      0x1f4,
      _0x3851("0x418")
    );
    xiuxiu[_0x3851("0x3d1")](BASEURL + "/uploadfiles/upload");
    xiuxiu["setUploadType"](0x2);
    xiuxiu[_0x3851("0x3d4")](_0x3851("0x3d5"));
    xiuxiu[_0x3851("0x3d6")] = function (_0x59a0fe, _0x557495) {
      var _0xace5c0 = _0x59a0fe["size"];
      if (_0xace5c0 > 0x400 * 0x400) {
        alert(_0x3851("0x3d7"));
        return ![];
      }
      xiuxiu[_0x3851("0x41a")](
        { return: _0x3851("0x3d8"), url: _0x27b103, no_thumb: 0x1 },
        _0x557495
      );
      return !![];
    };
    xiuxiu[_0x3851("0x41b")] = function () {
      if (_0x27b103) {
        if (
          _0x27b103["indexOf"](_0x3851("0x41c")) > 0x0 ||
          (_0x27b103["indexOf"](_0x3851("0x41d")) < 0x0 &&
            _0x27b103[_0x3851("0x1f2")](_0x3851("0x41e")) < 0x0)
        ) {
          _0x27b103 =
            BASEURL + _0x3851("0x41f") + encodeURIComponent(_0x27b103);
        }
        xiuxiu[_0x3851("0x420")](_0x27b103);
      }
      publishController[_0x3851("0x421")]();
    };
    xiuxiu[_0x3851("0x3d9")] = function (_0x22dae4, _0x31cf66) {
      try {
        var _0x396209 = eval("(" + _0x22dae4 + ")");
      } catch (_0x14906c) {
        alert(_0x22dae4);
        return;
      }
      if (_0x396209["ret"] == -0x1) {
        showErrorMessage(_0x396209[_0x3851("0x3db")]);
      } else {
        if (_0x27b103 && current_edit_img) {
          var _0x2d8081 = _0x396209[_0x3851("0x3df")];
          current_edit_img["src"] = _0x2d8081;
          current_edit_img[_0x3851("0x3de")]("_src", _0x2d8081);
        } else {
          insertHtml(
            _0x3851("0x3e1") +
              _0x396209[_0x3851("0x3df")] +
              _0x3851("0x3e2") +
              _0x396209[_0x3851("0x3df")] +
              "\x22>"
          );
        }
        publishController[_0x3851("0x3e3")]();
      }
    };
    xiuxiu["onClose"] = function (_0xf901c7) {
      publishController[_0x3851("0x3e3")]();
    };
  } else {
    showErrorMessage(_0x3851("0x422"));
  }
}
(function (_0x457842) {
  var _0x243698 = _0x3851("0x423"),
    _0x3f14d0 = "[data-role=slider],\x20.slider",
    _0x4e5bf6 = [_0x3851("0x424"), _0x3851("0x425")];
  _0x457842[_0x243698] = function (_0x1dc146, _0x53dc17) {
    if (!_0x1dc146) {
      return _0x457842()[_0x243698]({ initAll: !![] });
    }
    var _0x18b7fd = { initValue: 0x0, accuracy: 0x1 };
    var _0x20c943 = this;
    _0x20c943["settings"] = {};
    var _0x151ea1 = _0x457842(_0x1dc146);
    var _0x1f7bab,
      _0x3eed70,
      _0x5a0e29,
      _0xebac5c,
      _0x28a0b7,
      _0x10dc97,
      _0x3b3435,
      _0x50946a,
      _0x1c9113,
      _0x2d4587 = ![];
    _0x20c943[_0x3851("0x307")] = function () {
      _0x20c943[_0x3851("0x426")] = _0x457842[_0x3851("0x185")](
        {},
        _0x18b7fd,
        _0x53dc17
      );
      _0x1f7bab = _0x457842(_0x3851("0x427"));
      _0x3eed70 = _0x457842(_0x3851("0x428"));
      _0x1f7bab["appendTo"](_0x151ea1);
      _0x3eed70["appendTo"](_0x151ea1);
      _0x2d4587 = _0x151ea1["hasClass"](_0x3851("0x429"));
      _0x3f807d();
      _0x5a0e29 = _0x38be11(_0x20c943[_0x3851("0x426")]["initValue"]);
      _0x88577b(_0x5a0e29);
      _0x3eed70["on"]("mousedown\x20touchstart", function (_0x49a402) {
        _0x49a402[_0x3851("0x2c2")]();
        _0x1c5b0d(_0x49a402);
      });
      _0x151ea1["on"](_0x3851("0x2fe"), function (_0x42cfb6) {
        _0x42cfb6[_0x3851("0x2c2")]();
        _0x1c5b0d(_0x42cfb6);
      });
      _0x151ea1[_0x3851("0x42a")]("inited", [_0x5a0e29]);
    };
    var _0x38be11 = function (_0x6de25) {
      var _0x2d8797 = _0x20c943[_0x3851("0x426")][_0x3851("0x42b")];
      if (_0x2d8797 === 0x0) {
        return _0x6de25;
      }
      if (_0x6de25 === 0x64) {
        return 0x64;
      }
      _0x6de25 =
        Math[_0x3851("0x1ae")](_0x6de25 / _0x2d8797) * _0x2d8797 +
        Math[_0x3851("0x1c0")]((_0x6de25 % _0x2d8797) / _0x2d8797) * _0x2d8797;
      if (_0x6de25 > 0x64) {
        return 0x64;
      }
      return _0x6de25;
    };
    var _0x4cfca7 = function (_0xc43437) {
      var _0x2ca5d5;
      _0x2ca5d5 = _0xc43437 * _0x50946a;
      return _0x38be11(_0x2ca5d5);
    };
    var _0x3425a6 = function (_0x5b7c64) {
      if (_0x50946a === 0x0) {
        return 0x0;
      }
      return _0x5b7c64 / _0x50946a;
    };
    var _0x88577b = function (_0x15748f) {
      var _0x1ae96e, _0x561746;
      if (_0x2d4587) {
        _0x1ae96e = _0x3425a6(_0x15748f) + _0x1c9113;
        _0x561746 = _0xebac5c - _0x1ae96e;
        _0x3eed70[_0x3851("0x1b6")](_0x3851("0x19c"), _0x561746);
        _0x1f7bab[_0x3851("0x1b6")](_0x3851("0x1c4"), _0x1ae96e);
      } else {
        _0x1ae96e = _0x3425a6(_0x15748f);
        _0x3eed70["css"](_0x3851("0x199"), _0x1ae96e);
        _0x1f7bab[_0x3851("0x1b6")](_0x3851("0x1c3"), _0x1ae96e);
      }
    };
    var _0x1c5b0d = function (_0x19d62f) {
      _0x457842(document)["on"](
        "mousemove.sliderMarker\x20\x20touchmove.sliderMarker",
        function (_0x1b7ba5) {
          _0x373047(_0x1b7ba5);
        }
      );
      _0x457842(document)["on"](_0x3851("0x42c"), function () {
        _0x457842(document)[_0x3851("0x2c1")](_0x3851("0x42d"));
        _0x457842(document)["off"]("mouseup.sliderMarker");
        _0x457842(document)[_0x3851("0x2c1")](_0x3851("0x42e"));
        _0x457842(document)[_0x3851("0x2c1")]("touchend.sliderMarker");
        _0x151ea1[_0x3851("0x2a0")](_0x3851("0x2b1"), _0x5a0e29);
        _0x151ea1[_0x3851("0x42a")](_0x3851("0x42f"), [_0x5a0e29]);
      });
      _0x3f807d();
      _0x373047(_0x19d62f);
    };
    var _0x3f807d = function () {
      if (_0x2d4587) {
        _0xebac5c = _0x151ea1[_0x3851("0x1c4")]();
        _0x28a0b7 = _0x151ea1[_0x3851("0x2cb")]()[_0x3851("0x19c")];
        _0x1c9113 = _0x3eed70[_0x3851("0x1c4")]();
      } else {
        _0xebac5c = _0x151ea1[_0x3851("0x1c3")]();
        _0x28a0b7 = _0x151ea1[_0x3851("0x2cb")]()[_0x3851("0x199")];
        _0x1c9113 = _0x3eed70["width"]();
      }
      _0x50946a = 0x64 / (_0xebac5c - _0x1c9113);
      _0x10dc97 = _0x1c9113 / 0x2;
      _0x3b3435 = _0xebac5c - _0x1c9113 / 0x2;
    };
    var _0x373047 = function (_0x8907dd) {
      var _0x1544ca, _0x4d31a4, _0x2952ed;
      if (
        _0x8907dd["originalEvent"] &&
        _0x8907dd[_0x3851("0x2c6")][_0x3851("0x430")] &&
        _0x8907dd[_0x3851("0x2c6")][_0x3851("0x430")][0x0]
      ) {
        var _0x2f1461 = _0x8907dd[_0x3851("0x2c6")][_0x3851("0x430")][0x0];
        if (_0x2d4587) {
          _0x1544ca = _0x2f1461[_0x3851("0x2cc")] - _0x28a0b7;
        } else {
          _0x1544ca = _0x2f1461[_0x3851("0x2c8")] - _0x28a0b7;
        }
      } else {
        if (_0x2d4587) {
          _0x1544ca = _0x8907dd[_0x3851("0x2cc")] - _0x28a0b7;
        } else {
          _0x1544ca = _0x8907dd[_0x3851("0x2c8")] - _0x28a0b7;
        }
      }
      if (_0x1544ca < _0x10dc97) {
        _0x1544ca = _0x10dc97;
      } else if (_0x1544ca > _0x3b3435) {
        _0x1544ca = _0x3b3435;
      }
      if (_0x2d4587) {
        _0x2952ed = _0xebac5c - _0x1544ca - _0x1c9113 / 0x2;
      } else {
        _0x2952ed = _0x1544ca - _0x1c9113 / 0x2;
      }
      _0x4d31a4 = _0x4cfca7(_0x2952ed);
      _0x88577b(_0x4d31a4);
      _0x5a0e29 = _0x4d31a4;
      _0x151ea1[_0x3851("0x42a")](_0x3851("0x2e5"), [_0x5a0e29]);
    };
    _0x20c943[_0x3851("0x29f")] = function (_0x47fc9d) {
      if (typeof _0x47fc9d !== "undefined") {
        _0x5a0e29 = _0x38be11(_0x47fc9d);
        _0x88577b(_0x5a0e29);
        return _0x5a0e29;
      } else {
        return _0x5a0e29;
      }
    };
    _0x20c943[_0x3851("0x307")]();
  };
  _0x457842["fn"][_0x243698] = function (_0x3247b4) {
    var _0x3cc0e8 = _0x3247b4["initAll"] ? _0x457842(_0x3f14d0) : this;
    return _0x3cc0e8[_0x3851("0x2dc")](function () {
      var _0x48d3fb = _0x457842(this),
        _0x4adf59 = {},
        _0x523ba2;
      if (undefined == _0x48d3fb[_0x3851("0x2a0")](_0x243698)) {
        _0x457842[_0x3851("0x2dc")](_0x4e5bf6, function (_0x238c74, _0x42430a) {
          _0x4adf59[
            _0x42430a[0x0][_0x3851("0x1f3")]() + _0x42430a["slice"](0x1)
          ] = _0x48d3fb[_0x3851("0x2a0")](_0x3851("0x431") + _0x42430a);
        });
        _0x523ba2 = new _0x457842[_0x243698](this, _0x4adf59);
        _0x48d3fb["data"](_0x243698, _0x523ba2);
      }
    });
  };
  _0x457842(function () {
    _0x457842()[_0x243698]({ initAll: !![] });
  });
})(jQuery);

function Html5Uploadfile(_0x272264) {
  this[_0x3851("0x432")] = null;
  this["options"] = {};
  var _0x567f42 = randomString(0xa);
  var _0x4f2225 = "";
  this["upidx"] = 0x0;
  var _0x2bc70d = this;
  (this[_0x3851("0x3d5")] = function (_0x1042cf, _0x15f8db) {
    this["file_input"] = _0x1042cf;
    this["options"] = _0x15f8db;
    _0x4f2225 = _0x272264 + this[_0x3851("0x433")] + "_" + _0x567f42;
    console[_0x3851("0x1af")](this["upidx"]);
    for (
      var _0x5529b4 = this[_0x3851("0x433")];
      _0x5529b4 < this[_0x3851("0x432")][_0x3851("0x434")]["length"];
      _0x5529b4++
    ) {
      var _0x3ce33c = _0x1042cf[_0x3851("0x434")][_0x5529b4];
      if (_0x3ce33c) {
        this["upidx"] = _0x5529b4 + 0x1;
        var _0x374b17 = 0x0;
        if (_0x3ce33c[_0x3851("0x21c")] > 0x400 * 0x400)
          _0x374b17 =
            (Math[_0x3851("0x1c0")](
              (_0x3ce33c[_0x3851("0x21c")] * 0x64) / (0x400 * 0x400)
            ) / 0x64)[_0x3851("0x1ea")]() + "MB";
        else
          _0x374b17 =
            (Math["round"]((_0x3ce33c[_0x3851("0x21c")] * 0x64) / 0x400) /
              0x64)["toString"]() + "KB";
        var _0x223dfb = new FormData();
        _0x223dfb[_0x3851("0x36b")](
          _0x3851("0x435"),
          _0x15f8db[_0x3851("0x435")]
        );
        _0x223dfb[_0x3851("0x36b")](
          "file_model_name",
          _0x15f8db[_0x3851("0x436")]
        );
        _0x223dfb[_0x3851("0x36b")](
          _0x3851("0x437"),
          _0x15f8db["noto_upfiles"]
        );
        _0x223dfb[_0x3851("0x36b")](
          _0x3851("0x438"),
          _0x15f8db[_0x3851("0x438")]
        );
        _0x223dfb[_0x3851("0x36b")](
          _0x3851("0x439"),
          _0x15f8db[_0x3851("0x439")]
        );
        _0x223dfb[_0x3851("0x36b")]("item_css", _0x15f8db[_0x3851("0x43a")]);
        _0x223dfb["append"](_0x3851("0x43b"), _0x15f8db["save_folder"]);
        _0x223dfb["append"]("return_type", _0x15f8db[_0x3851("0x43c")]);
        _0x223dfb[_0x3851("0x36b")](
          _0x3851("0x43d"),
          _0x15f8db[_0x3851("0x43d")]
        );
        if (_0x15f8db[_0x3851("0x43e")]) {
          for (var _0x1c2c0d in _0x15f8db[_0x3851("0x43e")]) {
            _0x223dfb[_0x3851("0x36b")](
              _0x1c2c0d,
              _0x15f8db["post_params"][_0x1c2c0d]
            );
          }
        }
        _0x223dfb[_0x3851("0x36b")](_0x15f8db[_0x3851("0x435")], _0x3ce33c);
        this["uploading_files"][_0x15f8db[_0x3851("0x435")]] = {};
        this["uploading_files"][_0x15f8db[_0x3851("0x435")]][
          _0x3ce33c[_0x3851("0x1f5")]
        ] = !![];
        var _0xc80785 =
          "<div\x20id=\x22" +
          _0x4f2225 +
          _0x3851("0x43f") +
          _0x3ce33c["name"] +
          _0x3851("0x440") +
          "<div\x20class=\x22progress-bar\x20progress-bar-success\x22\x20role=\x22progressbar\x22\x20aria-valuenow=\x2240\x22\x20aria-valuemin=\x220\x22\x20aria-valuemax=\x22100\x22\x20style=\x22width:0%\x22>" +
          _0x3851("0x441") +
          _0x3851("0x442");
        if ($("#" + _0x4f2225 + _0x3851("0x443"))["length"] == 0x0) {
          if (_0x15f8db[_0x3851("0x3c2")]) {
            $(_0x15f8db["container"])["append"](_0xc80785);
          } else {
            $(_0x1042cf)[_0x3851("0x36d")](_0xc80785);
          }
        }
        var _0x4ea44f = new XMLHttpRequest();
        _0x4ea44f[_0x3851("0x3d5")][_0x3851("0x444")](
          _0x3851("0x445"),
          this[_0x3851("0x446")],
          ![]
        );
        if (_0x15f8db[_0x3851("0x447")]) {
          _0x4ea44f[_0x3851("0x444")]("load", _0x15f8db["uploadComplete"], ![]);
        } else {
          _0x4ea44f[_0x3851("0x444")](
            _0x3851("0x3ac"),
            this[_0x3851("0x447")],
            ![]
          );
        }
        _0x4ea44f[_0x3851("0x444")]("error", this[_0x3851("0x448")], ![]);
        _0x4ea44f["addEventListener"](
          _0x3851("0x449"),
          this[_0x3851("0x44a")],
          ![]
        );
        _0x4ea44f["open"](_0x3851("0x44b"), _0x15f8db[_0x3851("0x44c")]);
        _0x4ea44f[_0x3851("0x44d")](_0x223dfb);
      }
      break;
    }
  }),
    (this[_0x3851("0x44e")] = {}),
    (this[_0x3851("0x44f")] = function () {
      return ![];
    }),
    (this["uploadProgress"] = function (_0x2a18ce) {
      console[_0x3851("0x1af")](_0x2a18ce);
      if (_0x2a18ce["lengthComputable"]) {
        var _0x1d5429 = Math["round"](
          (_0x2a18ce[_0x3851("0x450")] * 0x64) / _0x2a18ce[_0x3851("0x451")]
        );
        $("#" + _0x4f2225 + _0x3851("0x443"))
          ["show"]()
          ["find"](".progress-bar")
          [_0x3851("0x1b6")](
            _0x3851("0x1c3"),
            _0x1d5429[_0x3851("0x1ea")]() + "%"
          );
      } else {
        alert("Unable\x20to\x20compute.Please\x20retry.");
      }
    }),
    (this[_0x3851("0x447")] = function (_0x6ee91c) {
      console[_0x3851("0x1af")](_0x6ee91c);
      var _0x4bffd7 = eval(
        "(" + _0x6ee91c[_0x3851("0x178")][_0x3851("0x452")] + ")"
      );
      if (_0x4bffd7[_0x3851("0x3da")] == 0x0) {
        if (_0x4bffd7[_0x3851("0x453")] == 0x1) {
          $(_0x3851("0x454") + _0x4bffd7[_0x3851("0x439")])["html"](
            _0x4bffd7[_0x3851("0x455")]
          );
        } else {
          $(_0x3851("0x454") + _0x4bffd7["fieldid"])[_0x3851("0x36b")](
            _0x4bffd7[_0x3851("0x455")]
          );
        }
        $("#" + _0x4bffd7[_0x3851("0x439")])[_0x3851("0x29f")](
          _0x4bffd7["fspath"]
        );
        $("#" + _0x4f2225 + "-status")[_0x3851("0x456")](_0x3851("0x457"));
      } else {
        showErrorMessage(_0x4bffd7["msg"]);
      }
      _0x2bc70d[_0x3851("0x3d5")](
        _0x2bc70d["file_input"],
        _0x2bc70d["options"]
      );
    }),
    (this["uploadFailed"] = function (_0x12e586) {
      alert(_0x3851("0x458"));
    }),
    (this[_0x3851("0x44a")] = function (_0x1ed40c) {
      alert(_0x3851("0x459"));
    });
}

function saveWxMsg(_0x59a55d) {
  $(_0x3851("0x45a"))[_0x3851("0x2d2")]();
  var _0x2d053d = $(_0x59a55d)[_0x3851("0x45b")]();
  _0x2d053d[_0x2d053d["length"]] = {
    name: _0x3851("0x45c"),
    value: getEditorHtml(!![]),
  };
  ajaxAction(_0x59a55d[_0x3851("0x45d")], _0x2d053d, _0x59a55d, function (
    _0x1f39e1
  ) {
    if (_0x1f39e1[_0x3851("0x3da")] == 0x0) {
      $[_0x3851("0x45e")][_0x3851("0x2d5")](_0x3851("0x45f"));
      current_edit_msg_id = _0x1f39e1["id"];
      if (_0x1f39e1["msg"]) {
        showSuccessMessage(_0x1f39e1["msg"], _0x3851("0x3fe"));
      }
    } else {
      if (_0x1f39e1["id"]) {
        current_edit_msg_id = _0x1f39e1["id"];
      }
      if (_0x1f39e1[_0x3851("0x413")]) {
        showErrorMessage(_0x1f39e1[_0x3851("0x413")], _0x3851("0x3fe"));
      }
    }
  });
  return ![];
}
var str_usedlist, usedList;
str_usedlist = window["localStorage"]["styUsedList"];
if (str_usedlist) {
  usedList = $[_0x3851("0x460")](str_usedlist);
}
if (!usedList) {
  usedList = [];
}
window[_0x3851("0x461")] = window["BASEURL"] = "";

function getQueryVariable(_0x37ea65) {
  var _0x2d430e = window["location"]["search"][_0x3851("0x30c")](0x1);
  var _0x1b29cf = _0x2d430e[_0x3851("0x1da")]("&");
  for (
    var _0x4c8aa2 = 0x0;
    _0x4c8aa2 < _0x1b29cf[_0x3851("0x187")];
    _0x4c8aa2++
  ) {
    var _0x57fa23 = _0x1b29cf[_0x4c8aa2][_0x3851("0x1da")]("=");
    if (_0x57fa23[0x0] == _0x37ea65) {
      return _0x57fa23[0x1];
    }
  }
  return null;
}
var current_draft_id = null;
UE["plugins"]["open135"] = function () {
  var _0x38075c = this,
    _0x243c93 = this;
  _0x38075c[_0x3851("0x462")] = !![];
  if (_0x38075c["options"]['removeStyle']){return}
  var _0x369b77 = baidu[_0x3851("0x415")][_0x3851("0x463")],
    _0x28e857 = baidu[_0x3851("0x415")]["ui"][_0x3851("0x464")],
    _0x1aad9a = baidu[_0x3851("0x415")]["ui"][_0x3851("0x465")],
    _0x4f7998 = baidu["editor"]["ui"],
    _0x22a1e9 = baidu[_0x3851("0x415")]["ui"][_0x3851("0x466")],
    _0x431db2 = baidu[_0x3851("0x415")]["ui"][_0x3851("0x467")];
  var _0x2c467e = baidu[_0x3851("0x415")][_0x3851("0x468")][_0x3851("0x469")];
  var _0x3e7969 = null;
  var _0x22121c = ![];
  var _0x4b7446 = null;
  var _0x1db6e4 = !![];
  _0x2c467e["on"](window, _0x3851("0x46a"), function (_0x157c21, _0x261563) {
    hideColorPlan();
  });
  if (!_0x38075c["options"][_0x3851("0x46b")]) {
    _0x38075c[_0x3851("0x163")][_0x3851("0x46b")] =
      "//" +
      _0x38075c[_0x3851("0x163")][_0x3851("0x46c")] +
      _0x3851("0x46d") +
      _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
      "&" +
      _0x38075c[_0x3851("0x163")][_0x3851("0x46f")];
  } else {
    _0x38075c["options"][_0x3851("0x46b")] +=
      "&" + _0x38075c[_0x3851("0x163")]["sign_token"];
  }
  if (!_0x38075c[_0x3851("0x163")][_0x3851("0x470")]) {
    _0x38075c[_0x3851("0x163")][_0x3851("0x470")] =
      "//" +
      _0x38075c[_0x3851("0x163")]["plat_host"] +
      "/editor_styles/open_styles?inajax=1&appkey=" +
      _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
      "&" +
      _0x38075c[_0x3851("0x163")][_0x3851("0x46f")];
  }
  window[_0x3851("0x461")] = window["BASEURL"] =
    "//" + _0x38075c[_0x3851("0x163")]["plat_host"];
  _0x38075c[_0x3851("0x471")](_0x3851("0x167"), function (
    _0x1fb4c6,
    _0x34e163
  ) {
    showColorPlan();
  });
  _0x38075c[_0x3851("0x471")]("aftershowpop", function () {
    if (jQuery["fn"][_0x3851("0x472")]) {
      $(".edui-popup")[_0x3851("0x472")]();
    }
  });
  _0x38075c[_0x3851("0x471")](_0x3851("0x473"), function (_0x243c93) {
    if (_0x38075c["options"][_0x3851("0x349")]) {
      _0x389dcf(_0x243c93);
    }
    _0x38075c[_0x3851("0x471")](_0x3851("0x474"), function () {
      current_edit_msg_id = null;
      current_draft_id = null;
    });
  });

  function _0x3f403e(_0x5593ef, _0x3b4258) {
    jQuery(_0x3851("0x475"))[_0x3851("0x476")](
      "<div\x20id=\x22loading-style\x22\x20style=\x22margin:10px;color:red;text-align:center;\x22><img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20" +
        _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
        "</div>"
    );
    jQuery[_0x3851("0x479")]({
      async: !![],
      type: "get",
      url:
        _0x38075c["options"][_0x3851("0x470")] +
        "&inajax=1&page=" +
        _0x5593ef +
        _0x3851("0x47a") +
        _0x3b4258,
      beforeSend: function (_0x3cc496) {
        _0x3cc496[_0x3851("0x47b")](
          _0x3851("0x47c"),
          window["location"][_0x3851("0x47d")]
        );
      },
      success: function (_0xef069a) {
        jQuery(_0x3851("0x47e"))[_0x3851("0x34f")]();
        if (_0x1db6e4) {
          jQuery(_0x3851("0x47f"))["html"](_0xef069a);
          jQuery(_0x3851("0x47f"))[_0x3851("0x3c4")](0x0);
          jQuery(_0x3851("0x480"))[_0x3851("0x1bf")](_0x3851("0x3bf"));
          jQuery("#style-categories\x20.filter")
            [_0x3851("0x2a0")](_0x3851("0x481"), null)
            [_0x3851("0x2a0")]("status", null);
          jQuery("#style-categories")
            [_0x3851("0x343")](_0x3851("0x482"))
            ["data"]("page", 0x2);
          _0x1db6e4 = ![];
        } else {
          var _0x3efbc2 = jQuery("<div>" + _0xef069a + "</div>")["find"](
            ".editor-template-list\x20>\x20li"
          );
          if (_0x3efbc2[_0x3851("0x187")] > 0x0) {
            var _0x3002c9 = 0x0;
            _0x3efbc2["each"](function () {
              var _0x3a14f2 = jQuery(this);
              _0x3a14f2[_0x3851("0x2b7")]("mix")[_0x3851("0x1b6")]({
                display: "block",
              });
              if (
                jQuery("#style-overflow-list")["find"](
                  "#" + _0x3a14f2[_0x3851("0x188")]("id")
                )[_0x3851("0x187")] == 0x0
              ) {
                _0x3002c9++;
                jQuery(_0x3851("0x483"))["append"](_0x3a14f2);
              }
            });
            if (_0x3002c9 == 0x0) {
              _0x22121c = ![];
              return !![];
            }
          } else {
            _0x4b7446[_0x3851("0x188")](_0x3851("0x482"), _0x3851("0x484"));
            _0x22121c = ![];
            return !![];
          }
        }
        _0x22121c = ![];
      },
      dataType: _0x3851("0x2d3"),
    });
  }

  function _0x4921ac(_0x3f882c) {
    var _0x4ab1b3 = _0x3f882c[_0x3851("0x176")](".load-more-data");
    if (
      !_0x4ab1b3[_0x3851("0x2a0")](_0x3851("0x485")) &&
      !_0x4ab1b3[_0x3851("0x2a0")](_0x3851("0x486"))
    ) {
      var _0x20c7eb = _0x3f882c[_0x3851("0x1bd")](_0x3851("0x487"))
        ? _0x3f882c
        : _0x3f882c[_0x3851("0x488")](".tab-pane");
      var _0x31bd5c = $(
        _0x3851("0x489") + _0x20c7eb[_0x3851("0x188")]("id") + "\x22"
      );
      var _0x1659ff = (_0x31bd5c[_0x3851("0x2a0")](_0x3851("0x3df")) || "")[
        _0x3851("0x1da")
      ]("\x20")[0x0];
      var _0x58db45 =
        (_0x4ab1b3[_0x3851("0x2a0")](_0x3851("0x481")) || 0x1) + 0x1;
      if (!_0x1659ff[_0x3851("0x187")]) return;

      function _0x17666e(_0x1659ff, _0x58db45) {
        if (_0x1659ff[_0x3851("0x1f2")]("?") > 0x0) {
          _0x1659ff = _0x1659ff + _0x3851("0x48a") + _0x58db45;
        } else {
          _0x1659ff = _0x1659ff + _0x3851("0x48b") + _0x58db45;
        }
        return _0x1659ff;
      }
      _0x1659ff = _0x17666e(_0x1659ff, _0x58db45);
      var _0x4e0568 = _0x3f882c[_0x3851("0x2a0")](_0x3851("0x48c"));
      if (_0x4e0568 && _0x4e0568[_0x3851("0x187")]) {
        _0x1659ff = _0x1659ff + _0x3851("0x48d") + _0x4e0568;
      }
      _0x4ab1b3[_0x3851("0x476")](
        "<div\x20id=\x22loading-style\x22\x20class=\x22loading-style\x22\x20style=\x22margin:10px;color:red;text-align:center;\x22><img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20" +
          _0x38075c[_0x3851("0x477")]("labelMap.isLoading") +
          _0x3851("0x342")
      );
      _0x4ab1b3[_0x3851("0x2a0")]("loading", !![]);
      jQuery[_0x3851("0x479")]({
        async: !![],
        type: "get",
        url: _0x1659ff,
        beforeSend: function (_0x432bb9) {},
        success: function (_0x353800) {
          _0x3f882c[_0x3851("0x176")](_0x3851("0x48e"))[_0x3851("0x34f")]();
          var _0x31737e = _0x3f882c[_0x3851("0x176")](_0x3851("0x48f"));
          var _0x44c5c4 = jQuery(
            _0x3851("0x341") + _0x353800 + _0x3851("0x342")
          )
            [_0x3851("0x176")](_0x3851("0x48f"))
            ["children"]();
          var _0x2ab718 = 0x0;
          _0x44c5c4[_0x3851("0x2dc")](function () {
            var _0x36cf63 = jQuery(this);
            if (_0x36cf63[_0x3851("0x176")](_0x3851("0x490"))["length"]) {
              _0x31737e[_0x3851("0x36b")](_0x36cf63);
              _0x2ab718++;
            }
          });
          if (_0x2ab718 == 0x0) {
            _0x4ab1b3[_0x3851("0x2a0")](_0x3851("0x485"), !![]);
          }
          _0x4ab1b3[_0x3851("0x2a0")]("loading", ![]);
          _0x4ab1b3[_0x3851("0x2a0")](_0x3851("0x481"), _0x58db45);
        },
        dataType: _0x3851("0x2d3"),
      });
    }
  }

  function _0x29bf72(_0x4d19e6) {
    if (getEditorHtml() == "") {
      showErrorMessage(_0x3851("0x491"));
      return ![];
    }
    var _0x4c144b;
    if (current_edit_msg_id) {
      _0x4c144b =
        "//" +
        _0x38075c[_0x3851("0x163")]["plat_host"] +
        _0x3851("0x492") +
        current_edit_msg_id +
        _0x3851("0x493") +
        _0x38075c["options"]["appkey"] +
        "&" +
        _0x38075c[_0x3851("0x163")][_0x3851("0x46f")];
    } else {
      _0x4c144b =
        "//" +
        _0x38075c[_0x3851("0x163")][_0x3851("0x46c")] +
        "/wx_msgs/plugin_save?rethtml=1&inajax=1&appkey=" +
        _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
        "&" +
        _0x38075c[_0x3851("0x163")][_0x3851("0x46f")];
      new_msg = !![];
    }
    $(_0x3851("0x494"))[_0x3851("0x2d3")](
      _0x3851("0x495") +
        _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
        _0x3851("0x342")
    );
    $[_0x3851("0x45e")]["open"]({ id: _0x3851("0x45f") });
    $(_0x3851("0x45f"))[_0x3851("0x3fe")]();
    $(_0x3851("0x496"))
      [_0x3851("0x1a7")](_0x3851("0x167"))
      ["on"](_0x3851("0x167"), function (_0x2cd5f1) {
        $[_0x3851("0x45e")][_0x3851("0x2d5")](_0x3851("0x45f"));
        return ![];
      });
    ajaxActionHtml(_0x4c144b, null, function (_0x27cdd8) {
      $("#save-wx-msg-dialog\x20.modal-body")[_0x3851("0x2d3")](_0x27cdd8);
      $(_0x3851("0x45f"))[_0x3851("0x3fe")]();
    });
    return ![];
  }

  function _0x542f27(_0x6bd99d) {
    var _0x104969 = _0x38075c["getContent"]();
    if (window[_0x3851("0x497")]["lastSave"] != _0x104969 && _0x104969 != "") {
      var _0x4dfe25 = $[_0x3851("0x321")](
        strip_tags(_0x104969, _0x3851("0x498"))
      );
      if (_0x4dfe25 != "") {
        $(_0x3851("0x499"))[_0x3851("0x188")](
          _0x3851("0x35d"),
          _0x3851("0x49a")
        );
        ajaxAction(
          "//" +
            _0x38075c[_0x3851("0x163")][_0x3851("0x46c")] +
            _0x3851("0x49b") +
            _0x38075c["options"][_0x3851("0x46e")] +
            "&" +
            _0x38075c[_0x3851("0x163")]["sign_token"],
          {
            model: _0x3851("0x49c"),
            id: current_draft_id,
            data_id: current_edit_msg_id,
            content: _0x104969,
          },
          null,
          function (_0x2fa434) {
            if (_0x2fa434[_0x3851("0x3da")] == 0x0) {
              window["sessionStorage"][_0x3851("0x49d")] = _0x104969;
              if (_0x2fa434[_0x3851("0x49e")]) {
                $(_0x3851("0x499"))[_0x3851("0x188")](
                  _0x3851("0x35d"),
                  "//" +
                    _0x38075c[_0x3851("0x163")][_0x3851("0x46c")] +
                    "/tools/qrcode?uri=" +
                    encodeURIComponent(_0x2fa434["preview_url"])
                );
                $(_0x3851("0x499"))[_0x3851("0x49f")]("p")[_0x3851("0x34f")]();
                $("#preview-qrcode\x20img")["after"](
                  _0x3851("0x4a0") +
                    _0x2fa434[_0x3851("0x49e")] +
                    _0x3851("0x4a1")
                );
                window[_0x3851("0x497")]["lastPreviewUrl"] =
                  _0x2fa434[_0x3851("0x49e")];
              }
            }
            current_draft_id = _0x2fa434["id"];
            if (typeof _0x6bd99d == _0x3851("0x3a6")) {
              _0x6bd99d(_0x2fa434);
            } else if (_0x2fa434[_0x3851("0x413")]) {
              if (_0x2fa434[_0x3851("0x3da")] == 0x0) {
                showSuccessMessage(_0x2fa434["msg"]);
              } else {
                showErrorMessage(_0x2fa434[_0x3851("0x413")]);
              }
            }
          }
        );
      }
    } else {
      console[_0x3851("0x1af")](_0x3851("0x4a2"));
      if (window["sessionStorage"][_0x3851("0x4a3")]) {
        $(_0x3851("0x499"))[_0x3851("0x188")](
          _0x3851("0x35d"),
          "//" +
            _0x38075c[_0x3851("0x163")][_0x3851("0x46c")] +
            _0x3851("0x4a4") +
            encodeURIComponent(window["sessionStorage"][_0x3851("0x4a3")])
        );
        $(_0x3851("0x499"))[_0x3851("0x49f")]("p")[_0x3851("0x34f")]();
        $(_0x3851("0x499"))["after"](
          _0x3851("0x4a0") +
            window["sessionStorage"]["lastPreviewUrl"] +
            "\x22\x20target=\x22_blank\x22><i\x20class=\x22fa\x20fa-desktop\x22></i>\x20电脑查看</a></p>"
        );
      }
    }
  }

  function _0x5ca1bc() {
    var _0x31e8bd = $(".colorPicker");

    function _0x239084(_0x4009b5, _0x44431a) {
      _0x4009b5["value"] = _0x44431a;
      _0x4009b5[_0x3851("0x19b")][_0x3851("0x2a2")] = _0x44431a;
      _0x4009b5[_0x3851("0x19b")][_0x3851("0x2b0")] =
        tinycolor && tinycolor(_0x44431a)[_0x3851("0x202")]()
          ? "#fff"
          : _0x3851("0x4a5");
      setBackgroundColor(_0x4009b5[_0x3851("0x2b1")], _0x3851("0x4a6"), ![]);
    }
    var _0x28174e = new UE["ui"][_0x3851("0x464")]({
      content: new UE["ui"][_0x3851("0x4a7")]({
        noColorText: _0x38075c[_0x3851("0x477")](_0x3851("0x4a8")),
        editor: _0x38075c,
        onpickcolor: function (_0x36b70b, _0x1b07db) {
          _0x239084(_0x28174e[_0x3851("0x178")], _0x1b07db);
          _0x28174e[_0x3851("0x2d5")]();
        },
        onpicknocolor: function (_0x14084b, _0x50eb31) {
          _0x28174e[_0x3851("0x2d5")]();
        },
        onupdatecolor: function (_0x39d16c, _0xb761ab) {
          _0x239084(_0x28174e[_0x3851("0x178")], _0xb761ab);
        },
      }),
      editor: _0x38075c,
      onhide: function () {
        _0x28174e["dispose"]();
      },
    });
    _0x31e8bd["unbind"](_0x3851("0x4a9"))["on"](_0x3851("0x4a9"), function (
      _0x474e3e
    ) {
      if (
        _0x474e3e["target"][_0x3851("0x2b1")]["replace"]("#", "")[
          _0x3851("0x187")
        ] == 0x3
      )
        return;
      _0x28174e[_0x3851("0x4aa")][_0x3851("0x4ab")](
        _0x474e3e[_0x3851("0x178")]["value"]
      );
    });
    _0x31e8bd["unbind"](_0x3851("0x167"))[_0x3851("0x167")](function (
      _0x1c5191
    ) {
      window[_0x3851("0x4ac")][_0x3851("0x1af")](_0x1c5191);
      _0x28174e[_0x3851("0x178")] = _0x1c5191[_0x3851("0x178")];
      _0x28174e[_0x3851("0x4aa")][_0x3851("0x2b0")] = _0x1c5191[
        _0x3851("0x178")
      ]["value"]
        ? _0x1c5191[_0x3851("0x178")][_0x3851("0x2b1")]
        : _0x1c5191["target"]["style"][_0x3851("0x2a2")];
      _0x28174e[_0x3851("0x4ad")](this);
    });
  }

  function _0x389dcf(_0x243c93) {
    if (!_0x38075c[_0x3851("0x163")]["open_editor"]) {
      return;
    }
    _0x3e7969 = _0x38075c["selection"][_0x3851("0x34d")];
    var _0x468fc0 = _0x38075c[_0x3851("0x4ae")];
    var _0x4b7eb4 = _0x38075c["container"];
    var _0x3d9f9b = jQuery(_0x4b7eb4)[_0x3851("0x1c3")]();
    var _0xb7da78 = _0x38075c[_0x3851("0x163")][_0x3851("0x4af")] || 0x168;
    if (
      jQuery(_0x4b7eb4)[_0x3851("0x176")](_0x3851("0x4b0"))[_0x3851("0x187")] >
      0x0
    ) {
      jQuery(_0x4b7eb4)
        [_0x3851("0x176")](_0x3851("0x4b1"))
        [_0x3851("0x1b6")]({
          width: _0x3d9f9b - _0xb7da78 - 0x2 + "px",
          "border-left": _0x3851("0x4b2"),
          "margin-left": _0xb7da78 + "px",
        });
      jQuery(_0x4b7eb4)
        [_0x3851("0x176")](_0x3851("0x4b0"))
        ["css"]({
          position: _0x3851("0x303"),
          width: _0xb7da78 + "px",
          float: _0x3851("0x199"),
          "box-sizing": "border-box",
        });
      jQuery(_0x4b7eb4)
        ["find"](_0x3851("0x4b0"))
        [_0x3851("0x2d3")](
          _0x3851("0x4b3") +
            _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
            _0x3851("0x369")
        );
    } else {
      jQuery(_0x4b7eb4)
        [_0x3851("0x2ac")]()
        ["css"]({
          position: _0x3851("0x303"),
          "padding-left": _0xb7da78 + "px",
          "box-sizing": _0x3851("0x32d"),
        });
      _0x4b7eb4[_0x3851("0x19b")]["width"] = _0x3d9f9b - _0xb7da78 + "px";
    }
    jQuery[_0x3851("0x479")]({
      async: !![],
      type: "GET",
      url: _0x38075c[_0x3851("0x163")]["style_url"],
      beforeSend: function (_0x25be4d) {
        _0x25be4d["setRequestHeader"](
          _0x3851("0x47c"),
          window[_0x3851("0x4b4")][_0x3851("0x47d")]
        );
      },
      success: function (_0x8c38ce) {
        _0x31a2ff(_0x8c38ce);
      },
      dataType: _0x3851("0x2d3"),
    });

    function _0x31a2ff(_0x261854) {
      var _0x3c837d =
          _0x3851("0x4b5") + _0x38075c["ui"]["id"] + _0x3851("0x4b6"),
        _0x41058d = jQuery(
          _0x3851("0x4b7") +
            _0x3c837d +
            _0x3851("0x4b8") +
            _0xb7da78 +
            "px;left:0;top:0;\x22>" +
            _0x261854 +
            _0x3851("0x342")
        );
      if (
        jQuery(_0x4b7eb4)[_0x3851("0x176")](_0x3851("0x4b0"))[
          _0x3851("0x187")
        ] > 0x0
      ) {
        jQuery(_0x4b7eb4)
          ["find"](_0x3851("0x4b0"))
          [_0x3851("0x2d3")]("")
          [_0x3851("0x36b")](_0x41058d);
      } else {
        jQuery(_0x4b7eb4)[_0x3851("0x476")](_0x41058d);
      }
      var _0x2f6297 =
        jQuery(_0x4b7eb4)[_0x3851("0x1c4")]() > 0x0
          ? jQuery(_0x4b7eb4)[_0x3851("0x1c4")]()
          : _0x38075c[_0x3851("0x163")][_0x3851("0x4b9")] +
            jQuery(_0x3851("0x3c6"), _0x4b7eb4)[_0x3851("0x1c4")]();
      if (jQuery("#top-panel", _0x41058d)[_0x3851("0x187")] > 0x0) {
        _0x2f6297 -= jQuery(_0x3851("0x4ba"), _0x41058d)[_0x3851("0x1c4")]();
      }
      _0x41058d[_0x3851("0x176")](_0x3851("0x4bb"))[_0x3851("0x1c4")](
        _0x2f6297
      );
      _0x41058d[_0x3851("0x176")](_0x3851("0x4bc"))[_0x3851("0x1b6")](
        _0x3851("0x1c4"),
        _0x2f6297
      );
      var _0x1f3adf = 0x0;
      if (jQuery(_0x3851("0x4bd"), _0x41058d)[_0x3851("0x187")] > 0x0) {
        _0x1f3adf = jQuery(_0x3851("0x4bd"), _0x41058d)["height"]();
      }
      _0x41058d[_0x3851("0x1b6")](_0x3851("0x1c4"), _0x2f6297)
        [_0x3851("0x176")](_0x3851("0x47f"))
        [_0x3851("0x1c4")](
          _0x2f6297 -
            _0x1f3adf -
            jQuery(_0x3851("0x4be"), _0x41058d)["height"]() -
            0x2
        );
      _0x41058d[_0x3851("0x176")]("#styleSearchResult")[_0x3851("0x1b6")](
        "top",
        _0x1f3adf
      );
      _0x41058d["find"]("#styleRecentResult")["css"](
        _0x3851("0x19c"),
        _0x1f3adf
      );
      _0x41058d[_0x3851("0x176")](_0x3851("0x4bf"))[_0x3851("0x1b6")](
        _0x3851("0x1c4"),
        _0x2f6297 - _0x1f3adf - 0x32
      );
      _0x41058d["find"](_0x3851("0x4c0"))["css"](
        _0x3851("0x1c4"),
        _0x2f6297 - _0x1f3adf - 0x32
      );
      _0x41058d["find"](_0x3851("0x4c1"))[_0x3851("0x1b6")](
        _0x3851("0x1c4"),
        _0x2f6297 - 0x32 - 0x28
      );
      _0x41058d[_0x3851("0x176")](_0x3851("0x4c2"))[_0x3851("0x1b6")](
        _0x3851("0x1c4"),
        _0x2f6297 - 0x32 - 0x28
      );
      jQuery("#style-categories\x20>li", _0x41058d)[_0x3851("0x4c3")](
        function () {
          jQuery(this)[_0x3851("0x2b7")](_0x3851("0x4c4"));
        },
        function () {
          jQuery(this)[_0x3851("0x1bf")](_0x3851("0x4c4"));
        }
      );
      jQuery(document)["on"]("click", _0x3851("0x4c5"), function () {
        jQuery(_0x3851("0x4c6"), _0x41058d)["hide"]();
        jQuery(jQuery(this)[_0x3851("0x188")](_0x3851("0x4c7")), _0x41058d)[
          _0x3851("0x2d2")
        ]();
        jQuery("#style-categories\x20.filter", _0x41058d)[_0x3851("0x1bf")](
          _0x3851("0x3bf")
        );
        jQuery(this)[_0x3851("0x2b7")](_0x3851("0x3bf"));
        _0x41058d[_0x3851("0x176")]("#style-overflow-list")
          [_0x3851("0x42a")](_0x3851("0x46a"))
          [_0x3851("0x3c4")](0x0);
      });
      if (
        typeof _0x38075c["options"][_0x3851("0x4c8")] == "undefined" ||
        _0x38075c[_0x3851("0x163")]["pageLoad"]
      ) {
        jQuery(_0x3851("0x47f"), _0x41058d)
          ["on"]("scroll", function () {
            if (
              !_0x22121c &&
              jQuery("#load-more-style")["length"] == 0x1 &&
              jQuery(_0x3851("0x475"))[_0x3851("0x1b5")]()[_0x3851("0x19c")] <
                jQuery(_0x3851("0x47f"))[_0x3851("0x1c4")]() + 0x96
            ) {
              if (jQuery(_0x3851("0x4c9"), _0x41058d)[_0x3851("0x187")] > 0x0) {
                _0x4b7446 = jQuery(_0x3851("0x4c9"));
                if (
                  _0x4b7446 &&
                  _0x4b7446[_0x3851("0x188")](_0x3851("0x482"))
                ) {
                  return !![];
                }
                var _0x307fcb = _0x4b7446[_0x3851("0x2a0")](_0x3851("0x481"));
                if (!_0x307fcb || typeof _0x307fcb == _0x3851("0x306")) {
                  _0x307fcb = 0x1;
                }
                _0x22121c = !![];
                _0x3f403e(
                  _0x307fcb,
                  _0x4b7446[_0x3851("0x2a0")](_0x3851("0x4ca"))
                );
                _0x4b7446["data"](_0x3851("0x481"), parseInt(_0x307fcb) + 0x1);
              } else {
                _0x4b7446 = jQuery(_0x3851("0x4be"), _0x41058d);
                if (
                  _0x4b7446 &&
                  _0x4b7446[_0x3851("0x188")](_0x3851("0x482")) ==
                    _0x3851("0x484")
                ) {
                  return !![];
                }
                var _0x307fcb = _0x4b7446[_0x3851("0x2a0")](_0x3851("0x481"));
                if (!_0x307fcb || typeof _0x307fcb == _0x3851("0x306")) {
                  _0x307fcb = 0x1;
                }
                _0x22121c = !![];
                _0x3f403e(_0x307fcb);
                _0x4b7446[_0x3851("0x2a0")](
                  _0x3851("0x481"),
                  parseInt(_0x307fcb) + 0x1
                );
              }
            }
            return !![];
          })
          [_0x3851("0x42a")](_0x3851("0x46a"));
      }
      jQuery(
        "#editor-styles-content\x20.tab-pane,\x20#online-template-list,\x20#templateSearchResultList,\x20#online-imgs-list,\x20#imgSearchResultList",
        _0x41058d
      )["on"](_0x3851("0x46a"), function (_0x46fb74) {
        var _0x3604fd = $(this);
        console[_0x3851("0x1af")](
          _0x3604fd["find"](_0x3851("0x4cb"))[_0x3851("0x1b5")]()
        );
        console[_0x3851("0x1af")](_0x3604fd["height"]());
        if (
          _0x3604fd[_0x3851("0x176")](_0x3851("0x4cb"))[_0x3851("0x187")] >
            0x0 &&
          _0x3604fd[_0x3851("0x176")](_0x3851("0x4cb"))[_0x3851("0x1b5")]()[
            _0x3851("0x19c")
          ] <
            _0x3604fd["height"]() + 0x96
        ) {
          _0x4921ac(_0x3604fd);
        }
        return !![];
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x4cc"), function () {
        jQuery(this)
          [_0x3851("0x2ac")]()
          [_0x3851("0x176")]("li")
          ["removeClass"](_0x3851("0x3bf"));
        jQuery(this)
          ["parent"]()
          ["next"](_0x3851("0x4cd"))
          [_0x3851("0x176")](_0x3851("0x4ce"))
          [_0x3851("0x1bf")](_0x3851("0x3bf"));
        jQuery(
          jQuery(this)
            [_0x3851("0x176")]("a")
            [_0x3851("0x188")](_0x3851("0x47d")),
          _0x41058d
        )[_0x3851("0x2b7")]("active");
        jQuery(this)[_0x3851("0x2b7")](_0x3851("0x3bf"));
        var _0x20ebce = jQuery(this)[_0x3851("0x176")]("a:first");
        var _0x16439a = _0x20ebce["attr"](_0x3851("0x47d"));
        if (_0x20ebce["data"](_0x3851("0x178"))) {
          _0x16439a = _0x20ebce[_0x3851("0x2a0")]("target");
        }

        function _0x340625() {
          jQuery(".open-tpl-brush", _0x16439a)[_0x3851("0x188")](
            "class",
            _0x3851("0x4cf")
          );
          jQuery(_0x3851("0x4d0"), _0x16439a)["attr"](
            _0x3851("0x344"),
            "insert-tpl-content"
          );
          jQuery(_0x16439a)
            ["find"](_0x3851("0x4d1"))
            ["on"](_0x3851("0x2e1"), function () {
              var _0x1a9c6a = this[_0x3851("0x45d")];
              if (_0x1a9c6a[_0x3851("0x4d2")](/\?/) != -0x1) {
                _0x1a9c6a +=
                  _0x3851("0x4d3") +
                  _0x38075c["options"][_0x3851("0x46e")] +
                  _0x3851("0x4d4") +
                  jQuery(this)[_0x3851("0x4d5")]();
              } else {
                _0x1a9c6a +=
                  "?appkey=" +
                  _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
                  _0x3851("0x4d4") +
                  jQuery(this)[_0x3851("0x4d5")]();
              }
              var _0xce1823 = /^#/;
              if (
                typeof jQuery(this)["attr"]("onclick") != "undefined" ||
                jQuery(this)[_0x3851("0x188")](_0x3851("0x178")) ==
                  _0x3851("0x4d6") ||
                typeof _0x1a9c6a == _0x3851("0x306") ||
                _0xce1823[_0x3851("0x4d7")](_0x1a9c6a) ||
                _0x1a9c6a[_0x3851("0x1e5")](0x0, 0xa)["toLowerCase"]() ==
                  _0x3851("0x4d8")
              ) {
                return !![];
              }
              jQuery(_0x16439a)[_0x3851("0x2ac")]()[_0x3851("0x3c4")](0x0);
              jQuery(_0x16439a)[_0x3851("0x4d9")](
                "<section\x20style=\x22position:absolute;z-index:100;color:\x20red;width:100%;height:100%;background-color:rgba(0,0,0,0.5);padding:10px;\x22><img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20" +
                  _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
                  _0x3851("0x373")
              );
              jQuery(_0x16439a)[_0x3851("0x3ac")](_0x1a9c6a, function () {
                _0x340625();
              });
              return ![];
            });
          jQuery(_0x16439a)
            [_0x3851("0x176")]("a")
            [_0x3851("0x167")](function () {
              var _0x213cd8 = jQuery(this)[_0x3851("0x188")](_0x3851("0x47d"));
              if (_0x213cd8[_0x3851("0x4d2")](/\?/) != -0x1) {
                _0x213cd8 +=
                  "&appkey=" +
                  _0x38075c[_0x3851("0x163")]["appkey"] +
                  _0x3851("0x4da");
              } else {
                _0x213cd8 +=
                  _0x3851("0x4db") +
                  _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
                  _0x3851("0x4da");
              }
              if (jQuery(this)[_0x3851("0x188")]("id") == _0x3851("0x4dc")) {
                _0x213cd8 +=
                  "&name=" +
                  encodeURI(
                    jQuery(_0x3851("0x4dd"), _0x16439a)[_0x3851("0x29f")]()
                  );
              }
              var _0x260267 = /^#/;
              if (
                typeof jQuery(this)[_0x3851("0x188")](_0x3851("0x4de")) !=
                  _0x3851("0x306") ||
                jQuery(this)[_0x3851("0x188")]("target") == _0x3851("0x4d6") ||
                typeof _0x213cd8 == _0x3851("0x306") ||
                _0x260267["test"](_0x213cd8) ||
                _0x213cd8[_0x3851("0x1e5")](0x0, 0xa)[_0x3851("0x1f3")]() ==
                  _0x3851("0x4d8")
              ) {
                return !![];
              }
              jQuery(_0x16439a)[_0x3851("0x2ac")]()["scrollTop"](0x0);
              jQuery(_0x16439a)[_0x3851("0x4d9")](
                _0x3851("0x4df") +
                  _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
                  _0x3851("0x373")
              );
              jQuery(_0x16439a)[_0x3851("0x3ac")](_0x213cd8, function () {
                _0x340625();
              });
              return ![];
            });
        }
        if (
          jQuery(_0x16439a)[_0x3851("0x2d3")]() == "" ||
          jQuery(_0x20ebce)[_0x3851("0x2a0")](_0x3851("0x4e0")) == "always"
        ) {
          if (_0x20ebce[_0x3851("0x2a0")](_0x3851("0x3df"))) {
            jQuery(_0x16439a)["html"](
              "<section\x20style=\x22padding:10px;\x22><img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20" +
                _0x38075c[_0x3851("0x477")](_0x3851("0x478")) +
                _0x3851("0x373")
            );
            jQuery(_0x16439a)[_0x3851("0x3ac")](
              _0x20ebce["data"](_0x3851("0x3df")),
              function () {
                _0x340625();
              }
            );
          }
        }
        return ![];
      });
      showColorPlan();
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x4e1"), function () {
        if (jQuery(this)["hasClass"](_0x3851("0x4e2"))) {
          return ![];
        }
        var _0x47ce9e = ![];
        var _0xdc25dd = parseInt(
          jQuery(this)[_0x3851("0x176")](".autonum:first")["text"]()
        );
        var _0x203580 = jQuery(this)["data"]("id");
        jQuery(this)
          [_0x3851("0x368")]()
          [_0x3851("0x4ca")](function () {
            return (
              this[_0x3851("0x4e3")] === 0x3 &&
              jQuery[_0x3851("0x321")](jQuery(this)["text"]()) == ""
            );
          })
          ["remove"]();
        jQuery(this)
          [_0x3851("0x176")]("p")
          ["each"](function () {
            if (jQuery["trim"](jQuery(this)[_0x3851("0x2d3")]()) == "&nbsp;") {
              jQuery(this)[_0x3851("0x2d3")]("<br/>");
            }
          });
        jQuery(this)
          ["find"]("*")
          [_0x3851("0x2dc")](function () {
            if (jQuery(this)[_0x3851("0x188")]("data-width")) {
              return;
            }
            if (
              this["style"] &&
              this["style"]["width"] &&
              this[_0x3851("0x19b")][_0x3851("0x1c3")] != ""
            ) {
              jQuery(this)[_0x3851("0x188")](
                _0x3851("0x4e4"),
                this["style"][_0x3851("0x1c3")]
              );
            }
          });
        var _0x3b786b = jQuery[_0x3851("0x4e5")](_0x203580, usedList);
        if (_0x3b786b == -0x1) {
          usedList[_0x3851("0x4e6")](_0x203580);
          if (usedList[_0x3851("0x187")] > 0x32) {
            usedList[_0x3851("0x4e7")]();
          }
          window[_0x3851("0x4e8")][_0x3851("0x4e9")] = JSON[_0x3851("0x1cc")](
            usedList
          );
        } else {
          usedList[_0x3851("0x4ea")](_0x3b786b, 0x1);
          usedList[_0x3851("0x4e6")](_0x203580);
        }
        var _0x2b736c = jQuery(this)[_0x3851("0x176")](_0x3851("0x4eb"));
        if (_0x2b736c["length"]) {
          if (
            _0x2b736c[_0x3851("0x176")](">\x20*")[_0x3851("0x187")] == 0x1 &&
            _0x2b736c[_0x3851("0x176")](">\x20*")
              ["eq"](0x0)
              [_0x3851("0x1bd")](_0x3851("0x4ec"))
          ) {
            _0x47ce9e = insertHtml(_0x2b736c[_0x3851("0x2d3")]());
          } else {
            var _0x261854 = _0x2b736c[_0x3851("0x4ed")](_0x3851("0x4ee"));
            _0x47ce9e = insertHtml(_0x261854);
          }
        } else {
          _0x47ce9e = insertHtml(
            _0x3851("0x4ef") +
              _0x203580 +
              _0x3851("0x4f0") +
              jQuery(this)[_0x3851("0x2d3")]() +
              _0x3851("0x373")
          );
        }
        if (_0x47ce9e) {
          style_click(_0x203580);
          if (typeof _0xdc25dd != _0x3851("0x306")) {
            jQuery(this)
              [_0x3851("0x176")](_0x3851("0x4f1"))
              [_0x3851("0x358")](_0xdc25dd + 0x1);
          }
        }
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x4f2"), function () {
        var _0x260575 = $(this)[_0x3851("0x2a0")](_0x3851("0x4f3"));
        if (usedList[_0x3851("0x187")] == 0x0) {
          showSuccessMessage(_0x3851("0x4f4"));
          return ![];
        }
        var _0x3cebf4 = usedList["toString"]();
        if (_0x260575 == _0x3cebf4) {
          $(_0x3851("0x4f5"))[_0x3851("0x4f6")](_0x3851("0x457"));
          return ![];
        } else {
          $(this)[_0x3851("0x2a0")](_0x3851("0x4f3"), _0x3cebf4);
          $(_0x3851("0x4f5"))[_0x3851("0x4f6")](_0x3851("0x457"));
          $(_0x3851("0x4c0"))
            [_0x3851("0x3c4")](0x0)
            [_0x3851("0x3ac")](
              PLAT135_URL +
                _0x3851("0x4f7") +
                _0x3cebf4 +
                "\x20#style_recent_list",
              function (_0x2b06ee) {}
            );
        }
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x4f8"), function () {
        var _0x3774f7 = jQuery(this)[_0x3851("0x2a0")]("id");
        _0x38075c[_0x3851("0x322")]["save"]();
        if (
          jQuery[_0x3851("0x321")](_0x38075c["getPlainTxt"]()) == "" ||
          confirm(_0x38075c[_0x3851("0x477")](_0x3851("0x4f9")))
        ) {
          ajaxAction(
            PLAT135_URL +
              "/editor_styles/view/" +
              _0x3774f7 +
              _0x3851("0x4fa") +
              _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
              "&nolazy=1",
            null,
            null,
            function (_0x47ae0d) {
              if (_0x47ae0d[_0x3851("0x3da")] == 0x0) {
                insertHtml(
                  _0x3851("0x4ef") +
                    _0x3774f7 +
                    _0x3851("0x4fb") +
                    _0x47ae0d[_0x3851("0x2a0")][_0x3851("0x4fc")][
                      _0x3851("0x4aa")
                    ] +
                    _0x3851("0x373")
                );
                _0x38075c[_0x3851("0x322")][_0x3851("0x323")]();
              } else {
                showErrorMessage(_0x3851("0x4fd"));
              }
            }
          );
        }
      });
      jQuery(_0x41058d)["on"](
        _0x3851("0x167"),
        "#system-template-list\x20.template-cover",
        function () {
          var _0x46b6f5 = jQuery(this)["data"]("id");
          ajaxAction(
            PLAT135_URL +
              _0x3851("0x4fe") +
              _0x46b6f5 +
              ".json?appkey=" +
              _0x38075c["options"]["appkey"] +
              _0x3851("0x4ff"),
            null,
            null,
            function (_0x1ea620) {
              if (_0x1ea620[_0x3851("0x2a0")]) {
                _0x38075c["undoManger"][_0x3851("0x323")]();
                if (
                  jQuery[_0x3851("0x321")](_0x38075c[_0x3851("0x500")]()) ==
                    "" ||
                  confirm(_0x38075c[_0x3851("0x477")](_0x3851("0x4f9")))
                ) {
                  _0x38075c[_0x3851("0x324")](
                    _0x1ea620[_0x3851("0x2a0")][_0x3851("0x4fc")]["content"]
                  );
                  _0x38075c[_0x3851("0x322")][_0x3851("0x323")]();
                }
              }
            }
          );
        }
      );
      jQuery(_0x41058d)["on"](_0x3851("0x167"), ".changeStyles", function () {
        var _0x2fbf3c = jQuery(this)[_0x3851("0x2a0")]("type");
        if (_0x2fbf3c == _0x3851("0x501")) {
          if (
            _0x38075c[_0x3851("0x163")]["page_url"][_0x3851("0x1f2")](
              _0x3851("0x502")
            ) > 0x0
          ) {
            return;
          } else {
            jQuery(_0x3851("0x503"))[_0x3851("0x1bf")](_0x3851("0x3bf"));
            _0x38075c[_0x3851("0x163")][_0x3851("0x470")] += _0x3851("0x504");
            $(_0x3851("0x505"))["remove"]();
            jQuery(_0x3851("0x4be"), _0x41058d)
              [_0x3851("0x188")]("data-status", "")
              [_0x3851("0x2a0")](_0x3851("0x481"), 0x1);
            _0x1db6e4 = !![];
            jQuery(_0x3851("0x47f"), _0x41058d)[_0x3851("0x42a")]("scroll");
          }
        } else if (
          _0x38075c[_0x3851("0x163")][_0x3851("0x470")][_0x3851("0x1f2")](
            _0x3851("0x502")
          ) > 0x0
        ) {
          jQuery("#style-categories\x20a.active")[_0x3851("0x1bf")]("active");
          _0x38075c[_0x3851("0x163")]["page_url"] = _0x38075c[_0x3851("0x163")][
            "page_url"
          ][_0x3851("0x1cd")](_0x3851("0x504"), "");
          $("#style-overflow-list\x20.editor-template-list")[
            _0x3851("0x34f")
          ]();
          jQuery("#style-categories", _0x41058d)
            [_0x3851("0x188")](_0x3851("0x482"), "")
            [_0x3851("0x2a0")](_0x3851("0x481"), 0x1);
          _0x1db6e4 = !![];
          jQuery(_0x3851("0x47f"), _0x41058d)["trigger"](_0x3851("0x46a"));
        }
      });
      jQuery(_0x41058d)["on"](
        _0x3851("0x167"),
        "#system-template-list\x20.open-tpl-brush",
        function () {
          var _0x58a0fb = jQuery(this)["data"]("id");
          var _0x41058d = jQuery(_0x3851("0x506") + _0x58a0fb);
          ajaxAction(
            PLAT135_URL +
              _0x3851("0x4fe") +
              _0x58a0fb +
              ".json?appkey=" +
              _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
              _0x3851("0x4ff"),
            null,
            null,
            function (_0xb93a4a) {
              if (_0xb93a4a[_0x3851("0x3da")] == 0x0) {
                jQuery("#template-contnet-brush")
                  ["show"]()
                  ["css"](
                    _0x3851("0x19c"),
                    jQuery(_0x3851("0x507"))[_0x3851("0x3c4")]()
                  );
                jQuery(_0x3851("0x507"))[_0x3851("0x1b6")](
                  _0x3851("0x508"),
                  _0x3851("0x509")
                );
                jQuery(_0x3851("0x50a"))
                  [_0x3851("0x2d3")](
                    _0xb93a4a[_0x3851("0x2a0")][_0x3851("0x4fc")][
                      _0x3851("0x4aa")
                    ]
                  )
                  [_0x3851("0x4d9")](_0x3851("0x50b"))
                  ["find"]("#close-template")
                  [_0x3851("0x167")](function () {
                    jQuery(_0x3851("0x507"))[_0x3851("0x1b6")](
                      _0x3851("0x50c"),
                      _0x3851("0x392")
                    );
                    jQuery(_0x3851("0x50a"))[_0x3851("0x2d5")]();
                  });
                jQuery(_0x3851("0x50a"))
                  [_0x3851("0x176")](_0x3851("0x50d"))
                  [_0x3851("0x2b7")](_0x3851("0x50e"))
                  ["css"]({
                    border: _0x3851("0x4b2"),
                    padding: _0x3851("0x50f"),
                    margin: _0x3851("0x510"),
                  })
                  [_0x3851("0x4d9")](
                    "<div\x20class=\x22tpl-brush-helper\x22><a\x20href=\x22javascript:void(0)\x22\x20\x20class=\x22btn\x20btn-brush\x20btn-xs\x20btn-warning\x22>秒刷此样式</a></div>"
                  );
                jQuery(_0x3851("0x50a"))
                  [_0x3851("0x176")](_0x3851("0x511"))
                  [_0x3851("0x167")](function () {
                    var _0x23b36f = jQuery(this)
                      [_0x3851("0x17d")](_0x3851("0x37d"))
                      [_0x3851("0x512")]();
                    _0x23b36f["find"](".tpl-brush-helper")[_0x3851("0x34f")]();
                    _0x23b36f["find"](_0x3851("0x50d"))[_0x3851("0x2dc")](
                      function () {
                        jQuery(this)[_0x3851("0x34f")]();
                      }
                    );
                    insertHtml(
                      _0x3851("0x4ef") +
                        _0x23b36f[_0x3851("0x2a0")]("id") +
                        "\x22\x20class=\x22_135editor\x22>" +
                        _0x23b36f[_0x3851("0x2d3")]() +
                        _0x3851("0x373")
                    );
                  });
                jQuery(_0x3851("0x50a"))
                  [_0x3851("0x176")](_0x3851("0x50d"))
                  [_0x3851("0x4c3")](
                    function () {
                      jQuery(this)[_0x3851("0x1b6")]({
                        border: "1px\x20dotted\x20red",
                      });
                      jQuery(this)
                        ["find"](_0x3851("0x50d"))
                        [_0x3851("0x1b6")](_0x3851("0x1c8"), 0.9);
                    },
                    function () {
                      jQuery(this)
                        [_0x3851("0x176")](_0x3851("0x50d"))
                        [_0x3851("0x1b6")](_0x3851("0x1c8"), 0x1);
                      jQuery(this)["css"]({ border: _0x3851("0x4b2") });
                    }
                  );
              } else {
                showErrorMessage(_0x3851("0x4fd"));
              }
            }
          );
        }
      );
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x513"), function () {
        current_editor[_0x3851("0x514")]();
        if (current_editor[_0x3851("0x515")]() == "") {
          showErrorMessage("还没有输入内容", _0x3851("0x3fe"));
          return ![];
        }
        var _0x3950df = document[_0x3851("0x317")](_0x3851("0x4d1")),
          _0x42f4b1 = document[_0x3851("0x317")](_0x3851("0x516"));
        _0x3950df["setAttribute"](_0x3851("0x178"), _0x3851("0x4d6"));
        _0x3950df["setAttribute"](
          _0x3851("0x45d"),
          _0x3851("0x517") + _0x38075c[_0x3851("0x163")][_0x3851("0x46e")]
        );
        _0x3950df["setAttribute"](_0x3851("0x518"), _0x3851("0x519"));
        _0x3950df[_0x3851("0x3de")]("id", _0x3851("0x51a"));
        _0x42f4b1[_0x3851("0x3de")](_0x3851("0x1f5"), "content");
        _0x42f4b1["value"] = current_editor[_0x3851("0x515")]();
        _0x3950df[_0x3851("0x31e")](_0x42f4b1);
        document[_0x3851("0x2da")][_0x3851("0x31e")](_0x3950df);
        _0x3950df["submit"]();
        setTimeout(function () {
          _0x3950df[_0x3851("0x34f")]();
        }, 0x1f4);
        return ![];
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x51b"), function (
        _0x54f083
      ) {
        _0x29bf72();
        return ![];
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), "#preview-editor", function () {
        $(_0x3851("0x51c"))[_0x3851("0x2d3")](getEditorHtml(!![]));
        $[_0x3851("0x45e")][_0x3851("0x4c4")]({ id: _0x3851("0x51d") });
        $(_0x3851("0x51d"))[_0x3851("0x2b7")]("preview-360")["center"]();
        _0x542f27();
        $(_0x3851("0x51e"))
          ["unbind"](_0x3851("0x167"))
          ["on"]("click", function (_0x4c7dae) {
            $["MBox"][_0x3851("0x2d5")](_0x3851("0x51d"));
            return ![];
          });
        return ![];
      });
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x51f"), function () {
        var _0x4e0c15 = $(this)[_0x3851("0x2a0")](_0x3851("0x3df"));
        jQuery(_0x3851("0x520"))
          [_0x3851("0x2d3")](_0x3851("0x3ab"))
          [_0x3851("0x2d2")]()
          ["css"](
            _0x3851("0x19c"),
            jQuery(_0x3851("0x521"))[_0x3851("0x3c4")]()
          );
        jQuery(_0x3851("0x521"))["css"](_0x3851("0x50c"), _0x3851("0x509"));
        jQuery(_0x3851("0x520"), _0x41058d)[_0x3851("0x3ac")](
          _0x4e0c15,
          function () {
            jQuery(_0x3851("0x520"))
              [_0x3851("0x4d9")](_0x3851("0x522"))
              [_0x3851("0x176")](_0x3851("0x523"))
              [_0x3851("0x167")](function () {
                jQuery("#per-article-imgs")[_0x3851("0x2d5")]();
                jQuery(_0x3851("0x521"))[_0x3851("0x1b6")](
                  _0x3851("0x50c"),
                  _0x3851("0x392")
                );
              });
          }
        );
        return ![];
      });
      jQuery(_0x41058d)["on"](
        _0x3851("0x167"),
        ".html-parser-rule",
        function () {
          var _0x5d885b = jQuery(this)["data"]("id");
          var _0x3f1b90 = { html: _0x38075c[_0x3851("0x515")]() };
          jQuery(_0x3851("0x524"), _0x41058d)[_0x3851("0x2dc")](function () {
            _0x3f1b90[this[_0x3851("0x1f5")]] = this[_0x3851("0x2b1")];
          });
          var _0x4ddb69 = PLAT135_URL + _0x3851("0x525") + _0x5d885b;
          if (_0x38075c[_0x3851("0x163")]["appkey"]) {
            _0x4ddb69 +=
              _0x3851("0x4db") + _0x38075c[_0x3851("0x163")][_0x3851("0x46e")];
          }
          ajaxAction(_0x4ddb69, _0x3f1b90, null, function (_0x4c584b) {
            if (_0x4c584b[_0x3851("0x3da")] == 0x0) {
              _0x38075c[_0x3851("0x322")][_0x3851("0x323")]();
              _0x38075c[_0x3851("0x324")](_0x4c584b[_0x3851("0x2d3")]);
              _0x38075c[_0x3851("0x322")][_0x3851("0x323")]();
            }
          });
        }
      );
      jQuery(_0x41058d)["on"](_0x3851("0x167"), _0x3851("0x526"), function () {
        _0x1db6e4 = !![];
        _0x389dcf(_0x243c93);
      });
      jQuery(_0x41058d)["on"](
        _0x3851("0x167"),
        "#system-img-list\x20.appmsg,#my-file-list\x20.appmsg,#images-list\x20.appmsg,.images-list\x20.appmsg",
        function () {
          var _0x421e29 = jQuery(this)[_0x3851("0x176")](_0x3851("0x527"));
          var _0x117308 = strip_imgthumb_opr(
            _0x421e29[_0x3851("0x188")](_0x3851("0x35d"))
          );
          var _0x26ad15 = _0x38075c[_0x3851("0x314")]["getRange"]();
          if (!_0x26ad15[_0x3851("0x3dc")]) {
            var _0x1e0cf2 = _0x26ad15[_0x3851("0x3dd")]();
            if (_0x1e0cf2 && _0x1e0cf2[_0x3851("0x179")] == _0x3851("0x32e")) {
              _0x1e0cf2[_0x3851("0x35d")] = _0x117308;
              _0x1e0cf2[_0x3851("0x3de")](_0x3851("0x3ea"), _0x117308);
              return;
            }
          }
          insertHtml(_0x3851("0x3e1") + _0x117308 + "\x22>");
          return ![];
        }
      );
      jQuery(_0x41058d)["on"](
        "click",
        "#wxmsg-mine-list\x20.article-msg,\x20#wxmsg-mine-list\x20.article-msg\x20.opr-edit",
        function (_0x107718) {
          var _0x18e7fa = jQuery(this)["data"]("id");
          var _0x19bdfd = jQuery(this)[_0x3851("0x2a0")](_0x3851("0x528"));
          var _0x2d2ea1 = _0x107718["srcElement"]
            ? _0x107718[_0x3851("0x529")]
            : _0x107718[_0x3851("0x178")];
          if (
            typeof jQuery(_0x2d2ea1)[_0x3851("0x188")](_0x3851("0x4de")) !=
              "undefined" ||
            jQuery(_0x2d2ea1)["attr"]("target") == _0x3851("0x4d6")
          ) {
            _0x107718[_0x3851("0x2c2")]();
            return ![];
          }
          var _0x2157a8 =
            BASEURL +
            "/wx_msgs/spview/" +
            _0x19bdfd +
            "/" +
            _0x18e7fa +
            _0x3851("0x4fa") +
            _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
            _0x3851("0x52a") +
            localStorage["team_id"];
          ajaxAction(_0x2157a8, null, null, function (_0x195b0e) {
            if (_0x195b0e["ret"] == 0x0 && _0x195b0e[_0x3851("0x2a0")]) {
              if (
                _0x195b0e[_0x3851("0x2a0")][_0x3851("0x49c")][_0x3851("0x4aa")]
              ) {
                setEditorHtml(
                  _0x195b0e["data"][_0x3851("0x49c")][_0x3851("0x4aa")]
                );
              } else {
                setEditorHtml("");
              }
              current_edit_msg_id = _0x18e7fa;
            } else {
              showErrorMessage(_0x195b0e["msg"]);
            }
          });
        }
      );
      jQuery(_0x3851("0x52b"), _0x41058d)["on"](_0x3851("0x167"), function () {
        if (this[_0x3851("0x52c")]) {
          window["replace_full_color"] = !![];
        } else {
          window[_0x3851("0x52d")] = ![];
        }
      });
      jQuery(_0x3851("0x52e"), _0x41058d)["on"](_0x3851("0x52f"), function () {
        var _0x169f17 = jQuery(this)["data"]("last");
        var _0x5ab585 = jQuery[_0x3851("0x321")](this[_0x3851("0x2b1")]);
        if (_0x5ab585 == "" || _0x5ab585 == "\x20") {
          jQuery(_0x3851("0x530"), _0x41058d)[_0x3851("0x2d5")]();
          return ![];
        }
        if (_0x169f17 == _0x5ab585) {
          jQuery(_0x3851("0x530"), _0x41058d)[_0x3851("0x2d2")]();
          return ![];
        } else {
          jQuery(this)[_0x3851("0x2a0")]("last", _0x5ab585);
          jQuery("#styleSearchResult", _0x41058d)[_0x3851("0x2d2")]();
          jQuery("#styleSearchResultList", _0x41058d)[_0x3851("0x2d3")](
            _0x38075c[_0x3851("0x477")]("labelMap.isLoading")
          );
          jQuery(_0x3851("0x4bf"), _0x41058d)["load"](
            PLAT135_URL +
              _0x3851("0x531") +
              _0x38075c[_0x3851("0x163")][_0x3851("0x46e")] +
              _0x3851("0x532") +
              _0x5ab585 +
              "\x20#style_search_list",
            function (_0x3c4671) {}
          );
        }
      });
      jQuery("#txtTemplateSearch", _0x41058d)["on"](
        _0x3851("0x52f"),
        function () {
          var _0x24c826 = jQuery(this)["data"](_0x3851("0x4f3"));
          var _0x35aa11 = jQuery[_0x3851("0x321")](this[_0x3851("0x2b1")]);
          if (_0x35aa11 == "" || _0x35aa11 == "\x20") {
            jQuery(_0x3851("0x533"), _0x41058d)["hide"]();
            return ![];
          }
          if (_0x24c826 == _0x35aa11) {
            jQuery("#templateSearchResult", _0x41058d)["show"]();
            return ![];
          } else {
            jQuery(this)[_0x3851("0x2a0")](_0x3851("0x4f3"), _0x35aa11);
            jQuery("#templateSearchResult", _0x41058d)[_0x3851("0x2d2")]();
            var _0x4b7eb4 = jQuery(this)["closest"](_0x3851("0x4ce"));
            var _0x47ac55 = $(
              _0x3851("0x489") + _0x4b7eb4[_0x3851("0x188")]("id") + "\x22"
            );
            var _0x1afbcf = (_0x47ac55[_0x3851("0x2a0")]("url") || "")[
              _0x3851("0x1da")
            ]("\x20")[0x0];
            jQuery(_0x3851("0x4c1"))[_0x3851("0x2a0")](
              _0x3851("0x48c"),
              _0x35aa11
            );
            jQuery(_0x3851("0x4c1"), _0x41058d)[_0x3851("0x2d3")](
              _0x38075c[_0x3851("0x477")](_0x3851("0x478"))
            );
            jQuery(_0x3851("0x4c1"), _0x41058d)[_0x3851("0x3ac")](
              _0x1afbcf + _0x3851("0x48d") + _0x35aa11 + _0x3851("0x534"),
              function (_0x4e21ae) {}
            );
          }
        }
      );
      jQuery("#txtImgSearch", _0x41058d)["on"](_0x3851("0x52f"), function () {
        var _0x47e2f6 = jQuery(this)[_0x3851("0x2a0")](_0x3851("0x4f3"));
        var _0x268fee = jQuery["trim"](this[_0x3851("0x2b1")]);
        if (_0x268fee == "" || _0x268fee == "\x20") {
          jQuery("#imgSearchResult", _0x41058d)[_0x3851("0x2d5")]();
          return ![];
        }
        if (_0x47e2f6 == _0x268fee) {
          jQuery("#imgSearchResult", _0x41058d)[_0x3851("0x2d2")]();
          return ![];
        } else {
          jQuery(this)[_0x3851("0x2a0")](_0x3851("0x4f3"), _0x268fee);
          jQuery(_0x3851("0x535"), _0x41058d)[_0x3851("0x2d2")]();
          var _0x4b7eb4 = jQuery(this)["closest"](".tab-pane");
          var _0x5867e2 = $(
            "a[href=\x22#" + _0x4b7eb4[_0x3851("0x188")]("id") + "\x22"
          );
          var _0x18f282 = (_0x5867e2["data"]("url") || "")[_0x3851("0x1da")](
            "\x20"
          )[0x0];
          jQuery(_0x3851("0x4c2"))["data"](_0x3851("0x48c"), _0x268fee);
          jQuery(_0x3851("0x4c2"), _0x41058d)["html"](
            _0x38075c[_0x3851("0x477")](_0x3851("0x478"))
          );
          jQuery("#imgSearchResultList", _0x41058d)[
            _0x3851("0x3ac")
          ](_0x18f282 + "&name=" + _0x268fee + _0x3851("0x536"), function (
            _0x365565
          ) {});
        }
      });
      jQuery(_0x3851("0x537"), _0x41058d)["on"](_0x3851("0x538"), function (
        _0x5cbb5c
      ) {
        var _0x5e9611 = parseInt(jQuery(this)[_0x3851("0x2d3")]());
        if (_0x5cbb5c["deltaY"] < 0x0) {
          if (_0x5e9611 <= 0x1) return;
          jQuery(this)[_0x3851("0x2d3")](_0x5e9611 - 0x1);
        } else {
          jQuery(this)[_0x3851("0x2d3")](_0x5e9611 + 0x1);
        }
        return ![];
      });
      jQuery(_0x3851("0x539"), _0x41058d)[_0x3851("0x53a")](function () {
        setBackgroundColor(this["value"], _0x3851("0x4a6"), !![]);
        this[_0x3851("0x19b")][_0x3851("0x2a2")] = this[_0x3851("0x2b1")];
        this[_0x3851("0x19b")][_0x3851("0x2b0")] =
          tinycolor && tinycolor(this[_0x3851("0x2b1")])["isDark"]()
            ? _0x3851("0x224")
            : _0x3851("0x4a5");
      });
      jQuery(".colorPicker", _0x41058d)[_0x3851("0x53b")](function () {
        if (this[_0x3851("0x2b1")][_0x3851("0x4d2")]("#") == 0x0) {
          if (this[_0x3851("0x2b1")][_0x3851("0x187")] == 0x7) {
            jQuery(this)["trigger"](_0x3851("0x53c"));
          }
        } else {
          if (
            this[_0x3851("0x2b1")]["search"](_0x3851("0x1e7")) == 0x0 &&
            this[_0x3851("0x2b1")][_0x3851("0x1f2")](")") > 0x0
          ) {
            jQuery(this)[_0x3851("0x42a")](_0x3851("0x53c"));
          }
        }
      });
      var _0x27a7ed = $(_0x3851("0x539"))["val"]();
      $(_0x3851("0x539"))["css"]({
        backgroundColor: _0x27a7ed,
        color:
          tinycolor && tinycolor(_0x27a7ed)[_0x3851("0x202")]()
            ? "#fff"
            : _0x3851("0x4a5"),
      });
      _0x5ca1bc();
    }
  }
};
jQuery(document)["on"]("click", _0x3851("0x53d"), function (_0x5cdb07) {
  jQuery(_0x3851("0x53d"))[_0x3851("0x1bf")](_0x3851("0x3bf"));
  jQuery(this)[_0x3851("0x2b7")](_0x3851("0x3bf"));
  var _0x1475ba = jQuery(this)[_0x3851("0x2a0")](_0x3851("0x2b0"));
  var _0xf34dc4 = jQuery(this)[_0x3851("0x1b6")](_0x3851("0x2a2"));
  jQuery("#custom-color-text")
    [_0x3851("0x29f")](_0xf34dc4)
    [_0x3851("0x1b6")](_0x3851("0x2a2"), _0xf34dc4);
  if (!_0x1475ba) _0x1475ba = _0x3851("0x4a6");
  setBackgroundColor(_0xf34dc4, _0x1475ba, !![]);
  _0x5cdb07[_0x3851("0x2c2")]();
  _0x5cdb07[_0x3851("0x2d0")]();
});
if (typeof window["showSuccessMessage"] == _0x3851("0x306")) {
  window[_0x3851("0x53e")] = function (_0x492946) {
    if (current_editor) {
      current_editor["fireEvent"]("showmessage", {
        id: "success-msg",
        content: _0x492946,
        type: "success",
        timeout: 0xfa0,
      });
    } else {
      alert(_0x492946);
    }
    return !![];
  };
}
if (typeof window[_0x3851("0x53f")] == _0x3851("0x306")) {
  window["color_click"] = function (_0x222196) {
    _0x222196 = hex2rgb(_0x222196);
    var _0x437504 = PLAT135_URL + _0x3851("0x3a5");
    ajaxAction(_0x437504, { color: _0x222196 });
    return ![];
  };
}
if (typeof window[_0x3851("0x540")] == _0x3851("0x306")) {
  window[_0x3851("0x540")] = function (_0x19581c) {
    var _0x46f2a5 = PLAT135_URL + _0x3851("0x3a3");
    ajaxAction(_0x46f2a5, { id: _0x19581c });
    return ![];
  };
}
if (typeof window[_0x3851("0x541")] == _0x3851("0x306")) {
  window[_0x3851("0x541")] = function (_0x55e734, _0x1d5687) {
    var _0x201419 = PLAT135_URL + _0x3851("0x3a4");
    ajaxAction(_0x201419, { colors: _0x55e734 }, null, _0x1d5687);
  };
}
if (typeof window[_0x3851("0x542")] == _0x3851("0x306")) {
  window[_0x3851("0x542")] = function (_0x4c2471) {
    if (current_editor) {
      current_editor["fireEvent"](_0x3851("0x543"), {
        id: _0x3851("0x544"),
        content: _0x4c2471,
        type: _0x3851("0x3db"),
        timeout: 0xfa0,
      });
    } else {
      alert(_0x4c2471);
    }
    return !![];
  };
}
if (typeof window[_0x3851("0x545")] == "undefined") {
  window[_0x3851("0x545")] = function (_0x5b83b2) {
    jQuery(current_editor[_0x3851("0x314")][_0x3851("0x34d")])
      [_0x3851("0x176")]("p")
      [_0x3851("0x2dc")](function () {
        if (
          jQuery["trim"](strip_tags(jQuery(this)[_0x3851("0x2d3")]())) ==
          _0x3851("0x353")
        ) {
          jQuery(this)[_0x3851("0x2d3")](_0x3851("0x354"));
        } else if (
          jQuery["trim"](strip_tags(jQuery(this)[_0x3851("0x2d3")]())) == ""
        ) {
          if (
            jQuery(this)[_0x3851("0x176")](_0x3851("0x546"))[_0x3851("0x187")] >
            0x0
          ) {
            return;
          }
          if (jQuery(this)[_0x3851("0x176")]("br")[_0x3851("0x187")] > 0x0) {
            jQuery(this)[_0x3851("0x2d3")](_0x3851("0x354"));
          } else {
            if (!this[_0x3851("0x19b")][_0x3851("0x547")]) {
              jQuery(this)[_0x3851("0x34f")]();
            }
          }
        }
      });
    clean_135helper();
    var _0x48287b = "";
    if (current_editor[_0x3851("0x548")] && !_0x5b83b2) {
      _0x48287b = current_editor[_0x3851("0x548")]();
    } else {
      _0x48287b = current_editor[_0x3851("0x515")]();
    }
    _0x48287b = parse135EditorHtml(_0x48287b);
    return (
      "<section\x20data-role=\x22outer\x22\x20label=\x22Powered\x20by\x20135editor.com\x22\x20style=\x22font-family:微软雅黑;font-size:16px;\x22>" +
      $[_0x3851("0x321")](_0x48287b) +
      "</section>"
    );
  };
}
if (typeof window["strip_imgthumb_opr"] == _0x3851("0x306")) {
  window["strip_imgthumb_opr"] = function (_0x2e444b) {
    var _0x310c4b = _0x2e444b[_0x3851("0x1f2")]("@");
    if (_0x310c4b > 0x0) {
      return _0x2e444b["substring"](0x0, _0x310c4b);
    }
    return _0x2e444b;
  };
}
if (typeof window[_0x3851("0x549")] == _0x3851("0x306")) {
  window["ajaxActionHtml"] = function (_0x3d88fc, _0x47a7dd, _0x51bdbc) {
    $[_0x3851("0x479")]({
      async: !![],
      type: _0x3851("0x2b2"),
      url: _0x3d88fc,
      success: function (_0x49250f) {
        if (_0x47a7dd) {
          $(_0x47a7dd)[_0x3851("0x2d3")](_0x49250f);
        }
        if (typeof _0x51bdbc == _0x3851("0x3a6")) {
          _0x51bdbc(_0x49250f);
        } else if (_0x51bdbc) {
          eval(_0x51bdbc);
        }
      },
      dataType: "html",
    });
  };
}
if (typeof window[_0x3851("0x54a")] == _0x3851("0x306")) {
  window["ajaxAction"] = function (
    _0x46791c,
    _0x4b67bd,
    _0xcc33cd,
    _0x246a59,
    _0x33d664
  ) {
    if (_0x46791c[_0x3851("0x4d2")](/\?/) != -0x1) {
      _0x46791c += _0x3851("0x4da");
    } else {
      _0x46791c += _0x3851("0x54b");
    }
    if (_0xcc33cd) {
      jQuery(_0x3851("0x54c"), _0xcc33cd)[_0x3851("0x2dc")](function () {
        var _0x462f27 = jQuery(this)[_0x3851("0x2d3")]();
        jQuery(this)
          [_0x3851("0x2a0")](_0x3851("0x2d3"), _0x462f27)
          [_0x3851("0x2d3")](
            "<img\x20src=\x22https://by.135editor.com/img/ajax/circle_ball.gif\x22>\x20" +
              _0x462f27
          )
          [_0x3851("0x188")](_0x3851("0x54d"), _0x3851("0x54d"));
      });
    }
    jQuery[_0x3851("0x479")]({
      type: _0x3851("0x519"),
      url: _0x46791c,
      data: _0x4b67bd,
      complete: function (_0x467743, _0x2275df) {
        if (_0xcc33cd) {
          jQuery(_0x3851("0x54c"), _0xcc33cd)["each"](function () {
            var _0xe14232 = jQuery(this)[_0x3851("0x2a0")](_0x3851("0x2d3"));
            jQuery(this)["html"](_0xe14232)[_0x3851("0x343")](_0x3851("0x54d"));
          });
        }
      },
      success: function (_0x590e1e) {
        if (_0x590e1e[_0x3851("0x54e")]) {
          showSuccessMessage(_0x590e1e[_0x3851("0x54e")]);
        } else if (_0x590e1e["error"] && !_0x590e1e[_0x3851("0x54f")]) {
          showErrorMessage(_0x590e1e[_0x3851("0x3db")]);
          var _0x36bd41 = "";
          for (var _0xd6ad3f in _0x590e1e) {
            _0x36bd41 +=
              _0x3851("0x550") + _0x590e1e[_0xd6ad3f] + _0x3851("0x551");
          }
        }
        if (_0xcc33cd) {
          jQuery(_0x3851("0x54c"), _0xcc33cd)[_0x3851("0x2dc")](function () {
            var _0x1e3b8f = jQuery(this)[_0x3851("0x2a0")](_0x3851("0x2d3"));
            jQuery(this)["html"](_0x1e3b8f)[_0x3851("0x343")](_0x3851("0x54d"));
          });
        }
        if (typeof _0x246a59 == _0x3851("0x3a6")) {
          _0x246a59(_0x590e1e);
        } else if (_0x246a59 && rs_callbacks[_0x246a59]) {
          var _0x3d4f89 = rs_callbacks[_0x246a59];
          if (_0x33d664) {
            _0x3d4f89(_0x590e1e, _0x33d664);
          } else {
            _0x3d4f89(_0x590e1e);
          }
        }
        if (_0x590e1e[_0x3851("0x54f")]) {
          jQuery(_0x590e1e[_0x3851("0x54f")])["each"](function (_0xd6ad3f) {
            var _0x2827a0 = _0x590e1e[_0x3851("0x54f")][_0xd6ad3f];
            if (_0x2827a0[_0x3851("0x552")] == _0x3851("0x2d3")) {
              if (jQuery(_0x2827a0[_0x3851("0x2a1")], _0xcc33cd)["length"]) {
                jQuery(_0x2827a0["selector"], _0xcc33cd)
                  [_0x3851("0x2d3")](_0x2827a0["content"])
                  [_0x3851("0x2d2")]();
              } else {
                jQuery(_0x2827a0["selector"])
                  ["html"](_0x2827a0["content"])
                  [_0x3851("0x2d2")]();
              }
            } else if (_0x2827a0[_0x3851("0x552")] == "value") {
              if (jQuery(_0x2827a0[_0x3851("0x2a1")], _0xcc33cd)["length"]) {
                jQuery(_0x2827a0[_0x3851("0x2a1")], _0xcc33cd)[
                  _0x3851("0x29f")
                ](_0x2827a0[_0x3851("0x4aa")]);
              } else {
                jQuery(_0x2827a0["selector"])["val"](
                  _0x2827a0[_0x3851("0x4aa")]
                );
              }
            } else if (_0x2827a0[_0x3851("0x552")] == _0x3851("0x36b")) {
              jQuery(_0x2827a0[_0x3851("0x4aa")])[_0x3851("0x302")](
                _0x2827a0[_0x3851("0x2a1")]
              );
            } else if (_0x2827a0[_0x3851("0x552")] == _0x3851("0x553")) {
              jQuery(_0x2827a0[_0x3851("0x4aa")])[_0x3851("0x302")](
                _0x2827a0[_0x3851("0x2a1")]
              );
            } else if (_0x2827a0["dotype"] == _0x3851("0x4b4")) {
              window["location"][_0x3851("0x47d")] =
                _0x2827a0[_0x3851("0x3df")];
            } else if (_0x2827a0[_0x3851("0x552")] == _0x3851("0x554")) {
              window[_0x3851("0x4b4")][_0x3851("0x554")]();
            } else if (_0x2827a0[_0x3851("0x552")] == _0x3851("0x555")) {
              if (_0x2827a0[_0x3851("0x556")]) {
                jQuery(_0x2827a0[_0x3851("0x2a1")])[
                  _0x2827a0[_0x3851("0x557")]
                ](_0x2827a0[_0x3851("0x556")]);
              } else {
                jQuery(_0x2827a0[_0x3851("0x2a1")])[
                  _0x2827a0[_0x3851("0x557")]
                ]();
              }
            } else if (_0x2827a0[_0x3851("0x552")] == "callback") {
              var _0x165986 = null,
                _0x546812 = null;
              eval(_0x3851("0x558") + _0x2827a0[_0x3851("0x559")] + ";");
              eval(_0x3851("0x55a") + _0x2827a0["thisArg"] + ";");
              var _0x56050b = [];
              for (var _0xd6ad3f in _0x2827a0[_0x3851("0x55b")]) {
                _0x56050b[_0x56050b["length"]] =
                  _0x2827a0[_0x3851("0x55b")][_0xd6ad3f];
              }
              if (_0x165986) {
                _0x165986[_0x3851("0x2b5")](_0x546812, _0x56050b);
              }
            }
          });
        }
      },
      dataType: _0x3851("0x1cb"),
    });
    return ![];
  };
}
(function (_0x3d2994) {
  _0x3d2994[_0x3851("0x45e")] = {
    options: {},
    html: "",
    setting: function (_0x4879f3) {
      var _0x47fefe = {
        width: 0x3e8,
        boxName: "model_box",
        overlayName: _0x3851("0x55c"),
      };
      this[_0x3851("0x163")] = _0x3d2994["extend"](_0x47fefe, _0x4879f3);
    },
    createOverlay: function () {
      if (
        _0x3d2994("#" + this["options"][_0x3851("0x55d")])[_0x3851("0x187")] ==
        0x0
      ) {
        _0x3d2994(
          _0x3851("0x4b7") +
            this[_0x3851("0x163")][_0x3851("0x55d")] +
            _0x3851("0x55e")
        )[_0x3851("0x55f")](_0x3d2994(_0x3851("0x2da")));
        _0x3d2994("#" + this[_0x3851("0x163")][_0x3851("0x55d")])
          [_0x3851("0x1b6")]({
            width: _0x3851("0x1f0"),
            backgroundColor: "#000",
            opacity: 0.4,
            position: _0x3851("0x1bb"),
            left: 0x0,
            top: 0x0,
            zIndex: 0x270f,
          })
          [_0x3851("0x1c4")](_0x3d2994(document)[_0x3851("0x1c4")]());
      }
    },
    createBody: function () {
      var _0x413aa0 = "";
      var _0x52b5ac = "";
      if (this[_0x3851("0x163")]["id"] != undefined) {
        _0x413aa0 = this[_0x3851("0x163")]["id"][_0x3851("0x1e5")](0x1);
        _0x52b5ac +=
          "<div\x20id=\x22" +
          _0x413aa0 +
          "\x22>" +
          _0x3d2994(this[_0x3851("0x163")]["id"])["html"]() +
          _0x3851("0x342");
      }
      return _0x52b5ac;
    },
    createLayer: function (_0xe66b05) {
      var _0x34e678 =
        _0x3851("0x560") + this[_0x3851("0x163")][_0x3851("0x561")] + "\x22>";
      _0x34e678 += _0xe66b05;
      _0x34e678 += _0x3851("0x342");
      return _0x34e678;
    },
    setStyle: function () {
      _0x3d2994(
        "." +
          this[_0x3851("0x163")][_0x3851("0x561")] +
          "\x20" +
          this[_0x3851("0x163")]["id"]
      )[_0x3851("0x1b6")]({
        width: this[_0x3851("0x163")][_0x3851("0x1c3")] || _0x3851("0x392"),
      });
      _0x3d2994("." + this["options"][_0x3851("0x561")])
        ["css"]({
          backgroundColor: _0x3851("0x1f4"),
          zIndex: 0x2710,
          width: this["options"]["width"],
          height: this["options"][_0x3851("0x1c4")] || _0x3851("0x392"),
        })
        [_0x3851("0x3fe")]();
    },
    open: function (_0x52b7c9) {
      this[_0x3851("0x562")](_0x52b7c9);
      this[_0x3851("0x563")]();
      this["html"] = this[_0x3851("0x564")]();
      this[_0x3851("0x2d3")] = this[_0x3851("0x565")](this[_0x3851("0x2d3")]);
      _0x3d2994(this[_0x3851("0x2d3")])[_0x3851("0x55f")](
        _0x3d2994(_0x3851("0x2da"))
      );
      this["setStyle"]();
    },
    hide: function (_0x38c87f) {
      _0x3d2994(_0x38c87f)
        [_0x3851("0x17d")]("." + this[_0x3851("0x163")][_0x3851("0x561")])
        [_0x3851("0x34f")]();
      _0x3d2994("#" + this[_0x3851("0x163")]["overlayName"])[
        _0x3851("0x34f")
      ]();
    },
  };
})(jQuery);
jQuery["fn"]["center"] = function () {
  this[_0x3851("0x1b6")]("position", _0x3851("0x3f5"));
  this["css"](
    _0x3851("0x19c"),
    ($(window)[_0x3851("0x1c4")]() - this[_0x3851("0x1c4")]()) / 0x2 + "px"
  );
  this[_0x3851("0x1b6")](
    _0x3851("0x199"),
    ($(window)["width"]() - this[_0x3851("0x1c3")]()) / 0x2 + "px"
  );
  return this;
};
window.sso = {};
window.sso.check_userlogin = function () {
  return true;
};
