/**
 * User: Jinqn
 * Date: 14-04-08
 * Time: 下午16:34
 * 上传图片对话框逻辑代码,包括tab: 远程图片/上传图片/在线图片/搜索图片
 */
function strip_imgthumb_opr( imgurl ) {
    var idx = imgurl.indexOf( "@" );
    if ( idx > 0 ) {
        return imgurl.substring( 0, idx ); // 返回从start到end的位置，不包含end的那个字母
    }
    return imgurl;
}

function base64_decode( data ) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        i = 0,
        ac = 0,
        dec = "",
        tmp_arr = [];

    if ( !data ) {
        return data;
    }

    data += "";

    do {
        // unpack four hexets into three octets using index points in b64
        h1 = b64.indexOf( data.charAt( i++ ) );
        h2 = b64.indexOf( data.charAt( i++ ) );
        h3 = b64.indexOf( data.charAt( i++ ) );
        h4 = b64.indexOf( data.charAt( i++ ) );

        bits = ( h1 << 18 ) | ( h2 << 12 ) | ( h3 << 6 ) | h4;

        o1 = ( bits >> 16 ) & 0xff;
        o2 = ( bits >> 8 ) & 0xff;
        o3 = bits & 0xff;

        if ( h3 == 64 ) {
            tmp_arr[ ac++ ] = String.fromCharCode( o1 );
        } else if ( h4 == 64 ) {
            tmp_arr[ ac++ ] = String.fromCharCode( o1, o2 );
        } else {
            tmp_arr[ ac++ ] = String.fromCharCode( o1, o2, o3 );
        }
    } while ( i < data.length );

    dec = tmp_arr.join( "" );

    return decodeURIComponent( escape( dec.replace( /\0+$/, "" ) ) );
}

function base64_encode( data ) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1,
        o2,
        o3,
        h1,
        h2,
        h3,
        h4,
        bits,
        i = 0,
        ac = 0,
        enc = "",
        tmp_arr = [];

    if ( !data ) {
        return data;
    }

    data = unescape( encodeURIComponent( data ) );

    do {
        // pack three octets into four hexets
        o1 = data.charCodeAt( i++ );
        o2 = data.charCodeAt( i++ );
        o3 = data.charCodeAt( i++ );

        bits = ( o1 << 16 ) | ( o2 << 8 ) | o3;

        h1 = ( bits >> 18 ) & 0x3f;
        h2 = ( bits >> 12 ) & 0x3f;
        h3 = ( bits >> 6 ) & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ ac++ ] =
            b64.charAt( h1 ) + b64.charAt( h2 ) + b64.charAt( h3 ) + b64.charAt( h4 );
    } while ( i < data.length );

    enc = tmp_arr.join( "" );

    var r = data.length % 3;

    return ( r ? enc.slice( 0, r - 3 ) : enc ) + "===".slice( r || 3 );
}

( function() {
    if ( typeof localStorage.upload_cate_id == "undefined" ) {
        localStorage.upload_cate_id = 0;
    }

    var remoteImage, uploadImage, onlineImage, searchImage;

    var newInsert = true; // 新增图片标记

    window.onload = function() {
        initTabs();
        initAlign();
        initButtons();

        $( document ).on( "change", 'select[name="cate_id"]', function( e ) {
            if ( !editor.options.uploadFormData ) {
                editor.options.uploadFormData = {};
            }
            editor.options.uploadFormData.cate_id = this.value;
            if ( uploadImage ) {
                // uploadImage.uploader.options.formData = editor.options.uploadFormData;
                uploadImage.uploader.option( "formData", editor.options.uploadFormData );
            }
            localStorage.upload_cate_id = this.value;
            $( 'select[name="cate_id"]' ).val( this.value );
            // console.log(localStorage.upload_cate_id);
        } );

        /* 我的图片素材选中 */
        $( document ).on( "click", ".appmsg", function() {
            if ( $( this ).hasClass( "selected" ) ) {
                $( this )
                    .removeClass( "selected" )
                    .find( 'input[name="deleteuploadfiles[]"]:checkbox' )
                    .prop( "checked", false );
            } else {
                $( this )
                    .addClass( "selected" )
                    .find( 'input[name="deleteuploadfiles[]"]:checkbox' )
                    .prop( "checked", true );
            }
        } );

        /* 查看更多分类标签:隐藏 */
        $( document ).on( "click", ".cate-box .more", function() {
            if ( $( this ).attr( "data-open" ) == "1" ) {
                $( this ).attr( "data-open", "0" );
                $( this ).html( "收缩" ).parents( ".cate-box" ).addClass( "open" );
            } else {
                $( this ).attr( "data-open", "1" );
                $( this ).html( "更多" ).parents( ".cate-box" ).removeClass( "open" );
            }
            return;
        } );

        /* 图片素材-我的上传全选 */
        $( document ).on( "click", "#checkAllUpfile", function( event ) {
            if ( this.checked ) {
                $( 'input[name="deleteuploadfiles[]"]:checkbox' ).prop( "checked", true );
                $( ".appmsg" ).addClass( "selected" );
            } else {
                $( 'input[name="deleteuploadfiles[]"]:checkbox' ).prop( "checked", false );
                $( ".appmsg" ).removeClass( "selected" );
            }
            event.stopPropagation();
        } );

        /* 批量删除 */
        $( document ).on( "click", "#delCheckedUpfile", function() {
            if ( !confirm(
                    "是否确认删除选择的图片？删除后，若微信复制、外网使用、文章浏览这些图片将显示破图，请确认图片不需要再使用。"
                ) ) {
                return false;
            }
            var ids = [];
            $( 'input[name="deleteuploadfiles[]"]:checked' ).each( function() {
                ids[ ids.length ] = this.value;
            } );
            if ( ids.length == 0 ) {
                alert( "没有选中任何文件" );
            } else {
                top.ajaxAction( "/uploadfiles/deletes", { ids: ids }, null, function(
                    request
                ) {
                    if ( request.ret == 0 ) {
                        for ( var i in ids ) {
                            $( "#uploadfile-" + ids[ i ] ).remove();
                        }
                        top.showSuccessMessage( request.msg );
                    }
                    var page = 1;
                    if ( $( "#my-file-list .ui-page-active:first" ).length > 0 ) {
                        page = $( "#my-file-list .ui-page-active:first" ).html();
                    }
                    loadMineImg();
                } );
            }
        } );
    };

    $( "#btn-crop-upload" ).click( function() {
        setTabFocus( "crop" );
    } );

    $( "#changeToCrop" ).click( function() {
        window.image.src = $( "#url" ).val();
        setTabFocus( "crop" );
    } );

    /* 初始化tab标签 */
    function initTabs() {
        var tabs = $G( "tabhead" ).children;
        for ( var i = 0; i < tabs.length; i++ ) {
            domUtils.on( tabs[ i ], "click", function( e ) {
                var target = e.target || e.srcElement;
                setTabFocus( target.getAttribute( "data-content-id" ) );
            } );
        }

        var img = editor.selection.getRange().getClosedNode();
        if ( img && img.tagName && img.tagName.toLowerCase() == "img" ) {
            if ( $( img ).attr( "data-op" ) == "crop" ) {
                setTabFocus( "crop" );
            } else {
                setTabFocus( "remote" );
            }
            newInsert = false;
        } else {
            setTabFocus( "upload" );
        }

        /* 记录上次选中的上传加水印 */
        $( "#watermark-flag" ).click( function() {
            var cookieOpt = editor.getPreferences( "uploadimage" );
            if ( !cookieOpt ) cookieOpt = {};
            if ( this.checked ) {
                $.extend( cookieOpt, { watermark: true } );
            } else {
                $.extend( cookieOpt, { watermark: false } );
            }
            editor.setPreferences( "uploadimage", cookieOpt );
        } );
        var cookieOpt = editor.getPreferences( "uploadimage" );
        if ( cookieOpt && cookieOpt.watermark == false ) {
            $( "#watermark-flag" ).removeAttr( "checked" );
        } else {
            $( "#watermark-flag" ).attr( "checked", true );
        }
    }

    function loadMineImg() {
        function mineImgLoaded() {
            var link = "/uploadfiles/mine";
            $( "#my-msg-list" ).imagesLoaded( function( instance ) {
                //$(instance.elements).css({ opacity: 1 })
                $( "#my-msg-list" ).masonry( {
                    itemSelector: ".col-sm-4",
                    animate: true,
                    //columnWidth: 50
                } );
            } );
            // 分页, 分类 请求
            $( "#mine .pagelink a, #mine .cate-box a" ).click( function() {
                link = this.href;
                $( "#mine" ).load( this.href, function( html ) {
                    mineImgLoaded();
                } );
                return false;
            } );
            // 删除 请求
            $( "#mine .deleteMsg, #mine .del-icon" ).click( function( e ) {
                if (
                    confirm(
                        "确认要删除吗？删除后图片将无法打开，文章中使用了此图片的将无法显示"
                    )
                ) {
                    var id = $( this ).data( "id" );
                    top.ajaxAction( "/uploadfiles/delete/" + id, null, null, function() {
                        $( "#uploadfile-" + id ).remove();
                        $( "#mine" ).load( link, function( html ) {
                            mineImgLoaded();
                        } );
                    } );
                }
                e.stopPropagation();
            } );
        }

        $( "#mine" ).load( "/uploadfiles/mine", function( html ) {
            mineImgLoaded();
        } );
    }

    /* 初始化tabbody */
    function setTabFocus( id ) {
        if ( !id ) return;
        var i,
            bodyId,
            tabs = $G( "tabhead" ).children;
        for ( i = 0; i < tabs.length; i++ ) {
            bodyId = tabs[ i ].getAttribute( "data-content-id" );
            if ( bodyId == id ) {
                domUtils.addClass( tabs[ i ], "focus" );
                domUtils.addClass( $G( bodyId ), "focus" );
            } else {
                domUtils.removeClasses( tabs[ i ], "focus" );
                domUtils.removeClasses( $G( bodyId ), "focus" );
            }
        }
        switch ( id ) {
            case "crop":
                setTimeout( function() {
                    if ( window.cropper ) {
                        window.cropper.destroy();
                    }
                    window.cropper = new Cropper( window.image, window.options );
                }, 500 );
                break;
            case "remote":
                remoteImage = remoteImage || new RemoteImage();
                break;
            case "mine":
                if ( $( "#mine" ).html() == "" ) {
                    if ( !top.sso.check_userlogin() ) {
                        var oldfunc = top.rs_callbacks.loginSuccess;
                        top.rs_callbacks.loginSuccess = function( request ) {
                            oldfunc( request );
                            loadMineImg();
                        };
                        return false;
                    }
                    loadMineImg();
                }
                break;
            case "upload":
                if ( newInsert ) {
                    setAlign( editor.getOpt( "imageInsertAlign" ) );
                }
                uploadImage = uploadImage || new UploadImage( "queueList" );
                break;
            case "online":
                if ( newInsert ) {
                    setAlign( editor.getOpt( "imageManagerInsertAlign" ) );
                }
                onlineImage = onlineImage || new OnlineImage( "imageList" );
                onlineImage.reset();
                break;
            case "search":
                if ( newInsert ) {
                    setAlign( editor.getOpt( "imageManagerInsertAlign" ) );
                }
                searchImage = searchImage || new SearchImage();
                break;
        }
    }

    /* 初始化onok事件 */
    function initButtons() {
        dialog.onok = function() {
            var remote = false,
                list = [],
                id,
                tabs = $G( "tabhead" ).children;
            for ( var i = 0; i < tabs.length; i++ ) {
                if ( domUtils.hasClass( tabs[ i ], "focus" ) ) {
                    id = tabs[ i ].getAttribute( "data-content-id" );
                    break;
                }
            }
            switch ( id ) {
                case "remote":
                    list = remoteImage.getInsertList();
                    remote = true;
                    break;
                case "crop":
                    $( "#uploadCropImage" ).trigger( "click" );
                    return false;
                case "mine":
                    $( ".appmsg.selected" ).each( function() {
                        // if($(this).hasClass('selected'))
                        var img = $( this ).find( "img:first" );
                        // alert(img); alert(img.attr('src'));
                        list.push( {
                            src: img.attr( "src" ),
                            _src: img.attr( "src" ),
                            title: img.attr( "title" ),
                            alt: "",
                            floatStyle: "none",
                        } );
                    } );
                    break;
                case "upload":
                    list = uploadImage.getInsertList();
                    var count = uploadImage.getQueueCount();
                    if ( count ) {
                        $( ".info", "#queueList" ).html(
                            '<span style="color:red;">' +
                            "还有2个未上传文件".replace( /[\d]/, count ) +
                            "</span>"
                        );
                        return false;
                    }
                    break;
                case "online":
                    list = onlineImage.getInsertList();
                    break;
                case "search":
                    list = searchImage.getInsertList();
                    remote = true;
                    break;
            }
            if ( list && list.length > 0 ) {
                var width = null;
                if ( list[ 0 ][ "width" ] ) {
                    if (
                        list[ 0 ][ "width" ].indexOf( "%" ) > 0 ||
                        list[ 0 ][ "width" ] == "auto" ||
                        list[ 0 ][ "width" ].indexOf( "em" ) > 0
                    ) {
                        width = list[ 0 ][ "width" ];
                    } else {
                        width = list[ 0 ][ "width" ] + "px";
                    }
                }
                editor.execCommand( "insertimage", list );
                var img = editor.selection.getRange().getClosedNode();
                if ( img && img.tagName && img.tagName.toLowerCase() == "img" ) {
                    var p = $( img ).parent();
                    if (
                        p.attr( "data-role" ) == "circle" ||
                        p.attr( "data-role" ) == "bgmirror" ||
                        p.attr( "data-role" ) == "square"
                    ) {
                        p.css( "backgroundImage", "url(" + img.src + ")" );
                        if ( width ) {
                            p.css( { width: width } );
                            if ( width.indexOf( "%" ) > 0 ) {
                                $( img ).css( { width: "100%" } );
                            }
                        }
                    } else {
                        if ( width ) {
                            if ( p.attr( "data-role" ) == "width" ) {
                                p.css( { width: width } );
                                if ( width.indexOf( "%" ) > 0 ) {
                                    $( img ).css( { width: "100%" } );
                                }
                            } else {
                                $( img ).replaceWith(
                                    $(
                                        '<span data-role="width" style="display:inline-block;width:' +
                                        width +
                                        '"></span>'
                                    ).append( $( img ).clone().css( { width: "100%" } ) )
                                );
                            }
                        } else {
                            $( img ).css( { width: "" } );
                            if ( p.attr( "data-role" ) == "width" ) {
                                p.replaceWith( $( img ) );
                            }
                        }
                    }
                }
                remote && editor.fireEvent( "catchRemoteImage" );
            }
            resetMapUrl();
        };
    }

    function resetMapUrl() {
        var current_document = editor.selection.document;
        $( current_document )
            .find( "img" )
            .each( function() {
                var $img = $( this );
                var usemap = $( this ).attr( "usemap" );
                if ( usemap ) {
                    $( usemap, current_document ).remove();
                    $( usemap, current_document ).remove();
                    $( usemap + "-section", current_document ).remove();
                }

                var mapurl = $( this ).attr( "mapurl" );
                if ( mapurl && mapurl != "" ) {
                    usemap = randomString( 10 );
                    $img.attr( "usemap", "#" + usemap );
                    $img.after(
                        '<map name="' +
                        usemap +
                        '" id="' +
                        usemap +
                        '" style="margin: 0px; padding: 0px; word-wrap: break-word !important; max-width: 100%; box-sizing: border-box !important;"><area style="margin: 0px; padding: 0px; word-wrap: break-word !important; max-width: 100%; box-sizing: border-box !important;" href="' +
                        mapurl +
                        '" shape="default" target="_blank"/></map>' +
                        '<section id="' +
                        usemap +
                        '-section">' +
                        '<map name="' +
                        usemap +
                        '" id="' +
                        usemap +
                        '" style="margin: 0px; padding: 0px; word-wrap: break-word !important; max-width: 100%; box-sizing: border-box !important;"><area style="margin: 0px; padding: 0px; word-wrap: break-word !important; max-width: 100%; box-sizing: border-box !important;" href="' +
                        mapurl +
                        '" shape="default" target="_blank"/></map>' +
                        "</section>"
                    );
                } else {
                    $img.removeAttr( "usemap" );
                }
            } );
    }

    function randomString( len ) {
        len = len || 8;
        var $chars =
            "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = "";
        for ( i = 0; i < len; i++ ) {
            pwd += $chars.charAt( Math.floor( Math.random() * maxPos ) );
        }
        return pwd;
    }

    /* 初始化对其方式的点击事件 */
    function initAlign() {
        /* 点击align图标 */
        domUtils.on( $G( "alignIcon" ), "click", function( e ) {
            var target = e.target || e.srcElement;
            if ( target.className && target.className.indexOf( "-align" ) != -1 ) {
                setAlign( target.getAttribute( "data-align" ) );
            }
        } );
    }

    /* 设置对齐方式 */
    function setAlign( align ) {
        align = align || "center";
        var aligns = $G( "alignIcon" ).children;
        for ( i = 0; i < aligns.length; i++ ) {
            if ( aligns[ i ].getAttribute( "data-align" ) == align ) {
                domUtils.addClass( aligns[ i ], "focus" );
                $G( "align" ).value = aligns[ i ].getAttribute( "data-align" );
            } else {
                domUtils.removeClasses( aligns[ i ], "focus" );
            }
        }
    }
    /* 获取对齐方式 */
    function getAlign() {
        var align = $G( "align" ).value || "center";
        return align == "none" ? "" : align;
    }

    /* 插入远程图片 */
    function RemoteImage( target ) {
        this.container = utils.isString( target ) ?
            document.getElementById( target ) :
            target;
        this.init();
    }
    RemoteImage.prototype = {
        init: function() {
            this.initContainer();
            this.initEvents();
        },
        initContainer: function() {
            this.dom = {
                url: $G( "url" ),
                width: $G( "width" ),
                height: $G( "height" ),
                border: $G( "border" ),
                vhSpace: $G( "vhSpace" ),
                opacity: $G( "opacity" ),
                mapurl: $G( "mapurl" ),
                title: $G( "title" ),
                align: $G( "align" ),
            };
            var img = editor.selection.getRange().getClosedNode();
            if ( img ) {
                this.setImage( img );
            }
        },
        initEvents: function() {
            var _this = this,
                locker = $G( "lock" );

            /* 改变url */
            domUtils.on( $G( "url" ), "keyup", updatePreview );
            domUtils.on( $G( "border" ), "keyup", updatePreview );
            domUtils.on( $G( "opacity" ), "keyup", updatePreview );
            domUtils.on( $G( "title" ), "keyup", updatePreview );

            domUtils.on( $G( "width" ), "keyup", function() {
                updatePreview();
                if ( locker.checked ) {
                    var proportion = locker.getAttribute( "data-proportion" );
                    $G( "height" ).value = Math.round( this.value / proportion );
                } else {
                    _this.updateLocker();
                }
            } );
            domUtils.on( $G( "height" ), "keyup", function() {
                updatePreview();
                if ( locker.checked ) {
                    var proportion = locker.getAttribute( "data-proportion" );
                    $G( "width" ).value = Math.round( this.value * proportion );
                } else {
                    _this.updateLocker();
                }
            } );
            domUtils.on( $G( "lock" ), "change", function() {
                var proportion =
                    parseInt( $G( "width" ).value ) / parseInt( $G( "height" ).value );
                locker.setAttribute( "data-proportion", proportion );
            } );

            function updatePreview() {
                _this.setPreview();
            }
        },
        updateLocker: function() {
            var width = $G( "width" ).value,
                height = $G( "height" ).value,
                locker = $G( "lock" );
            if (
                width &&
                height &&
                width == parseInt( width ) &&
                height == parseInt( height )
            ) {
                locker.disabled = false;
                locker.title = "";
            } else {
                locker.checked = false;
                locker.disabled = "disabled";
                locker.title = lang.remoteLockError;
            }
        },
        setImage: function( img ) {
            /* 不是正常的图片 */
            if ( !img.tagName ||
                ( img.tagName.toLowerCase() != "img" && !img.getAttribute( "src" ) ) ||
                !img.src
            )
                return;

            var wordImgFlag = img.getAttribute( "word_img" ),
                src = wordImgFlag ?
                wordImgFlag.replace( "&amp;", "&" ) :
                ( img.getAttribute( "_src" ) &&
                    img.getAttribute( "_src" ).replace( "&amp;", "&" ) ) ||
                ( img.getAttribute( "src", 2 ) &&
                    img.getAttribute( "src", 2 ).replace( "&amp;", "&" ) ),
                align = editor.queryCommandValue( "imageFloat" );

            if ( src ) {
                if (
                    src.substr( 0, 70 ) ==
                    "http://img03.store.sogou.com/net/a/04/link?appid=100520031&w=1200&url="
                ) {
                    src = decodeURIComponent( src.substr( 70 ) );
                } else if ( src.substr( 0, 35 ) == "http://remote.wx135.com/oss/view?d=" ) {
                    src = decodeURIComponent( src.replace( "&free=1", "" ).substr( 35 ) );
                }
                /*else if(src.substr(0,37)=='http://image1.wx135.com/cache/remote/'){
                          src = base64_decode(src.substr(37));
                         }*/
            }
            /* 防止onchange事件循环调用 */
            if ( src !== $G( "url" ).value ) $G( "url" ).value = src;
            if ( src ) {
                var width = img.style.width || "";
                var p = $( img ).parent();
                if (
                    p.attr( "data-role" ) == "circle" ||
                    p.attr( "data-role" ) == "width" ||
                    p.attr( "data-role" ) == "bgmirror" ||
                    p.attr( "data-role" ) == "square"
                ) {
                    width = p.get( 0 ).style.width || "";
                }
                /* 设置表单内容 */
                $G( "width" ).value = width.replace( "px", "" );
                var height = img.style.height || "";
                $G( "height" ).value = height.replace( "px", "" );
                $G( "border" ).value = img.getAttribute( "border" ) || "0";
                $G( "vhSpace" ).value = $( img ).css( "margin" ) || "0";
                $G( "opacity" ).value = img.style.opacity || "";
                $G( "title" ).value = img.title || img.alt || "";
                $G( "mapurl" ).value = img.getAttribute( "mapurl" ) || "";
                setAlign( align );
                this.setPreview();
                this.updateLocker();
            }
        },
        getData: function() {
            var data = {};
            for ( var k in this.dom ) {
                if ( k == "url" ) {
                    var url = $G( "url" ).value;
                    url = url.replace( /&wxfrom=\d+/g, "" );
                    url = url.replace( /wxfrom=\d+/g, "" );
                    url = url.replace( /&wx_lazy=\d+/g, "" );
                    url = url.replace( /wx_lazy=\d+/g, "" );
                    url = url.replace( /&tp=[a-z]+/g, "" );
                    url = url.replace( /tp=[a-z]+/g, "" );
                    url = url.replace( /\?&/g, "?" );

                    if (
                        url.indexOf( "https://mmbiz.qlogo.cn" ) == 0 ||
                        url.indexOf( "http://mmbiz.qpic.cn" ) == 0 ||
                        url.indexOf( "http://mmsns.qpic.cn" ) == 0
                    ) {
                        url =
                            "http://image2.135editor.com/cache/remote/" + base64_encode( url );
                        // if(!editor.isPaidUser()) url += '&free=1';
                    }

                    data[ k ] = url;
                } else if ( k == "width" || k == "height" ) {
                    data[ k ] = this.dom[ k ].value.replace( "px", "" );
                } else {
                    data[ k ] = this.dom[ k ].value;
                }
            }
            return data;
        },
        setPreview: function() {
            var url = $G( "url" ).value;
            url = url.replace( /&wxfrom=\d+/g, "" );
            url = url.replace( /wxfrom=\d+/g, "" );
            url = url.replace( /&wx_lazy=\d+/g, "" );
            url = url.replace( /wx_lazy=\d+/g, "" );
            url = url.replace( /&tp=[a-z]+/g, "" );
            url = url.replace( /tp=[a-z]+/g, "" );
            url = url.replace( /\?&/g, "?" );

            if (
                url.indexOf( "https://mmbiz.qlogo.cn" ) == 0 ||
                url.indexOf( "http://mmbiz.qpic.cn" ) == 0 ||
                url.indexOf( "http://mmsns.qpic.cn" ) == 0
            ) {
                url = "http://image2.135editor.com/cache/remote/" + base64_encode( url );
                //if(!editor.isPaidUser()) url += '&free=1';
            }
            //url = 'http://img03.store.sogou.com/net/a/04/link?appid=100520031&w=1200&url=' + encodeURIComponent(url);
            var ow = $G( "width" ).value,
                oh = $G( "height" ).value,
                border = $G( "border" ).value,
                title = $G( "title" ).value,
                opacity = $G( "opacity" ).value,
                preview = $G( "preview" ),
                width,
                height,
                style;
            if ( opacity != "" && opacity != 0 ) {
                style = "opacity:" + opacity;
            }
            width = !ow || !oh ? preview.offsetWidth : Math.min( ow, preview.offsetWidth );
            width =
                width + border * 2 > preview.offsetWidth ?
                width :
                preview.offsetWidth - border * 2;
            height = !ow || !oh ? "" : ( width * oh ) / ow;

            if ( url ) {
                preview.innerHTML =
                    '<img src="' +
                    url +
                    '" style="' +
                    style +
                    '" width="' +
                    width +
                    '" height="' +
                    height +
                    '" border="' +
                    border +
                    'px solid #000" title="' +
                    title +
                    '" />';
            }
        },
        getInsertList: function() {
            var data = this.getData();
            if ( data[ "url" ] ) {
                var cssText = "";
                if ( data[ "opacity" ] != "" ) {
                    cssText += ";opacity:" + data[ "opacity" ];
                }
                if ( data[ "vhSpace" ] != "" ) {
                    cssText += ";margin:" + data[ "vhSpace" ];
                }
                if ( data[ "width" ] != "" ) {
                    if (
                        data[ "width" ].indexOf( "%" ) > 0 ||
                        data[ "width" ].indexOf( "em" ) > 0
                    ) {
                        cssText += ";width:" + data[ "width" ] + " !important;";
                    } else {
                        cssText += ";width:" + data[ "width" ] + "px !important;";
                    }
                }
                return [ {
                    src: data[ "url" ],
                    _src: data[ "url" ],
                    width: data[ "width" ] || "",
                    height: data[ "height" ] || "",
                    border: data[ "border" ] || "",
                    floatStyle: data[ "align" ] || "",
                    //vspace: data['vhSpace'] || '',
                    //opacity: data['opacity'] || '',
                    mapurl: data[ "mapurl" ] || "",
                    title: data[ "title" ] || "",
                    alt: data[ "title" ] || "",
                    style: cssText,
                }, ];
            } else {
                return [];
            }
        },
    };
    /* 上传图片 */
    function UploadImage( target ) {
        this.$wrap = target.constructor == String ? $( "#" + target ) : $( target );
        this.init();
    }
    UploadImage.prototype = {
        init: function() {
            var _this = this;
            this.imageList = [];
            this.initContainer();
            this.queryString = "";
            _this.uploadField = editor.getOpt( "imageFieldName" );
            _this.actionUrl = editor.getActionUrl( editor.getOpt( "imageActionName" ) );
            _this.uploadType = "local";

            if ( editor.options.uploadFormData ) {
                _this.uploadFormData = editor.options.uploadFormData;
            } else {
                _this.uploadFormData = { "x:model": "WxMsg", "x:field": "upload" };
            }
            _this.initUploader();
            /*
                  var tokenUrl = "/uploadfiles/qn_token";
                  if (editor.options.uploadTokenUrl) {
                    tokenUrl = editor.options.uploadTokenUrl;
                  }
                  if (editor.options.appkey) {
                    if (tokenUrl.search(/\?/) != -1) {
                      tokenUrl += '&appkey=' + editor.options.appkey;
                    } else {
                      tokenUrl += '?appkey=' + editor.options.appkey;
                    }
                  }
                  $.ajax({
                    type: "GET",
                    url: tokenUrl,
                    error:function(){
                      $('.filePickerContainer').show();
                      _this.initUploader();
                    },
                    success: function(data) {
                      $('.filePickerContainer').show();
                      if (data.type == 'qiniu' && data.token) {
                        _this.uploadType = 'qiniu';
                        _this.actionUrl = 'https://upload.qiniu.com/';
                        _this.uploadField = 'file';
                        _this.uploadFormData['x:uid'] = data.uid;
                        _this.uploadFormData.token = data.token;
                        _this.initUploader();
                        if (data.fops) {
                          _this.queryString = data.fops;
                        }
                      } else {
                        if (data.ret == -69) { //权限不够提示错误
                          jQuery('#upload-percent-text').text(data.month_num + ' / ' + data.month_total);
                          if (data.state) {
                            $('.filePickerContainer').html(data.state);
                          } else if (data.msg) {
                            $('.filePickerContainer').html(data.msg);
                          }
                        } else {
                          _this.initUploader(); // 七牛调用失败则使用默认的上传接口
                        }
                      }
                      if (data.cates) {
                        var html = '上传至：<select name="cate_id"><option>默认分组</option>';
                        for (var i in data.cates) {
                          html += '<option value="' + data.cates[i].UserCate.id + '">' + data.cates[i].UserCate.name + '</option>';
                        }
                        html += '</select>';
                        $('.select-cates').append(html);
                        if (localStorage.upload_cate_id) {
                          $('select[name="cate_id"]').val(localStorage.upload_cate_id);
                        }
                      }
                      if (data.month_total > 0) {
                        jQuery('#upload-percent-text').text(data.month_num + ' / ' + data.month_total);
                        jQuery('#upload-percent').css('width', data.percent);
                      } else {
                        jQuery('#upload-status').hide();
                      }
                    },
                    dataType: "json"
                  });
                  */
        },
        initContainer: function() {
            this.$queue = this.$wrap.find( ".filelist" );
        },
        /* 初始化容器 */
        initUploader: function() {
            var _this = this,
                $ = jQuery, // just in case. Make sure it's not an other libaray.
                $wrap = _this.$wrap,
                // 图片容器
                $queue = $wrap.find( ".filelist" ),
                // 状态栏，包括进度和控制按钮
                $statusBar = $wrap.find( ".statusBar" ),
                // 文件总体选择信息。
                $info = $statusBar.find( ".info" ),
                // 上传按钮
                $upload = $wrap.find( ".uploadBtn" ),
                // 上传按钮
                $filePickerBtn = $wrap.find( ".filePickerBtn" ),
                // 上传按钮
                $filePickerBlock = $wrap.find( ".filePickerBlock" ),
                // 没选择文件之前的内容。
                $placeHolder = $wrap.find( ".placeholder" ),
                // 总体进度条
                $progress = $statusBar.find( ".progress" ).hide(),
                // 添加的文件数量
                fileCount = 0,
                // 添加的文件总大小
                fileSize = 0,
                // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,
                // 缩略图大小
                thumbnailWidth = 190 * ratio,
                thumbnailHeight = 60 * ratio,
                // 可能有pedding, ready, uploading, confirm, done.
                state = "",
                // 所有文件的进度信息，key为file id
                percentages = {},
                supportTransition = ( function() {
                    var s = document.createElement( "p" ).style,
                        r =
                        "transition" in s ||
                        "WebkitTransition" in s ||
                        "MozTransition" in s ||
                        "msTransition" in s ||
                        "OTransition" in s;
                    s = null;
                    return r;
                } )(),
                // WebUploader实例
                uploader,
                acceptExtensions = ( editor.getOpt( "imageAllowFiles" ) || [] )
                .join( "" )
                .replace( /\./g, "," )
                .replace( /^[,]/, "" ),
                imageMaxSize = editor.getOpt( "imageMaxSize" ),
                imageCompressBorder = editor.getOpt( "imageCompressBorder" );

            if ( !WebUploader.Uploader.support() ) {
                $( "#filePickerReady" )
                    .after( $( "<div>" ).html( lang.errorNotSupport ) )
                    .hide();
                return;
            } else if ( !editor.getOpt( "imageActionName" ) ) {
                $( "#filePickerReady" )
                    .after( $( "<div>" ).html( lang.errorLoadConfig ) )
                    .hide();
                return;
            }
            // console.log(_this.uploadFormData);
            uploader = _this.uploader = WebUploader.create( {
                pick: {
                    id: "#filePickerReady",
                    label: lang.uploadSelectFile,
                },
                accept: {
                    title: "Images",
                    extensions: acceptExtensions,
                    mimeTypes: "image/gif,image/png,image/jpeg,image/jpg",
                },
                swf: "../../third-party/webuploader/Uploader.swf",
                server: _this.actionUrl,
                fileVal: _this.uploadField,
                formData: _this.uploadFormData,
                //runtimeOrder:'flash',
                duplicate: true,
                threads: 1, // 允许同时最大上传1个，保证顺序
                fileSingleSizeLimit: imageMaxSize, // 默认 2 M
                compress: editor.getOpt( "imageCompressEnable" ) ?
                    {
                        width: imageCompressBorder,
                        height: imageCompressBorder,
                        // 图片质量，只有type为`image/jpeg`的时候才有效。
                        quality: 90,
                        // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                        allowMagnify: false,
                        // 是否允许裁剪。
                        crop: false,
                        // 是否保留头部meta信息。
                        preserveHeaders: true,
                    } :
                    false,
            } );
            uploader.addButton( {
                id: "#filePickerBlock",
            } );
            uploader.addButton( {
                id: "#filePickerBtn",
                label: lang.uploadAddFile,
            } );

            setState( "pedding" );

            // 当有文件添加进来时执行，负责view的创建
            function addFile( file ) {
                var $li = $(
                        '<li id="' +
                        file.id +
                        '">' +
                        '<p class="title">' +
                        file.name +
                        "</p>" +
                        '<p class="imgWrap"></p>' +
                        '<p class="progress"><span></span></p>' +
                        "</li>"
                    ),
                    $btns = $(
                        '<div class="file-panel">' +
                        '<span class="cancel">' +
                        lang.uploadDelete +
                        "</span>" +
                        '<span class="rotateRight">' +
                        lang.uploadTurnRight +
                        "</span>" +
                        '<span class="rotateLeft">' +
                        lang.uploadTurnLeft +
                        "</span></div>"
                    ).appendTo( $li ),
                    $prgress = $li.find( "p.progress span" ),
                    $wrap = $li.find( "p.imgWrap" ),
                    $info = $( '<p class="error"></p>' ).hide().appendTo( $li ),
                    showError = function( code ) {
                        switch ( code ) {
                            case "exceed_size":
                                text = lang.errorExceedSize;
                                break;
                            case "interrupt":
                                text = lang.errorInterrupt;
                                break;
                            case "http":
                                text = lang.errorHttp;
                                break;
                            case "not_allow_type":
                                text = lang.errorFileType;
                                break;
                            default:
                                text = lang.errorUploadRetry;
                                break;
                        }
                        $info.text( text ).show();
                    };

                if ( file.getStatus() === "invalid" ) {
                    showError( file.statusText );
                } else {
                    $wrap.text( lang.uploadPreview );
                    if ( browser.ie && browser.version <= 7 ) {
                        $wrap.text( lang.uploadNoPreview );
                    } else {
                        uploader.makeThumb(
                            file,
                            function( error, src ) {
                                if ( error || !src ) {
                                    $wrap.text( lang.uploadNoPreview );
                                } else {
                                    var $img = $( '<img src="' + src + '">' );
                                    $wrap.empty().append( $img );
                                    $img.on( "error", function() {
                                        $wrap.text( lang.uploadNoPreview );
                                    } );
                                }
                            },
                            thumbnailWidth,
                            thumbnailHeight
                        );
                    }
                    percentages[ file.id ] = [ file.size, 0 ];
                    file.rotation = 0;

                    /* 检查文件格式 */
                    if ( !file.ext ||
                        acceptExtensions.indexOf( file.ext.toLowerCase() ) == -1
                    ) {
                        showError( "not_allow_type" );
                        uploader.removeFile( file );
                    }
                }

                file.on( "statuschange", function( cur, prev ) {
                    if ( prev === "progress" ) {
                        $prgress.hide().width( 0 );
                    } else if ( prev === "queued" ) {
                        $li.off( "mouseenter mouseleave" );
                        $btns.remove();
                    }
                    // 成功
                    if ( cur === "error" || cur === "invalid" ) {
                        showError( file.statusText );
                        percentages[ file.id ][ 1 ] = 1;
                    } else if ( cur === "interrupt" ) {
                        showError( "interrupt" );
                    } else if ( cur === "queued" ) {
                        percentages[ file.id ][ 1 ] = 0;
                    } else if ( cur === "progress" ) {
                        $info.hide();
                        $prgress.css( "display", "block" );
                    } else if ( cur === "complete" ) {}

                    $li.removeClass( "state-" + prev ).addClass( "state-" + cur );
                } );

                $li.on( "mouseenter", function() {
                    $btns.stop().animate( { height: 30 } );
                } );
                $li.on( "mouseleave", function() {
                    $btns.stop().animate( { height: 0 } );
                } );

                $btns.on( "click", "span", function() {
                    var index = $( this ).index(),
                        deg;

                    switch ( index ) {
                        case 0:
                            uploader.removeFile( file );
                            return;
                        case 1:
                            file.rotation += 90;
                            break;
                        case 2:
                            file.rotation -= 90;
                            break;
                    }

                    if ( supportTransition ) {
                        deg = "rotate(" + file.rotation + "deg)";
                        $wrap.css( {
                            "-webkit-transform": deg,
                            "-mos-transform": deg,
                            "-o-transform": deg,
                            transform: deg,
                        } );
                    } else {
                        $wrap.css(
                            "filter",
                            "progid:DXImageTransform.Microsoft.BasicImage(rotation=" +
                            ( ~~( ( ( file.rotation / 90 ) % 4 ) + 4 ) % 4 ) +
                            ")"
                        );
                    }
                } );

                $li.insertBefore( $filePickerBlock );
            }

            // 负责view的销毁
            function removeFile( file ) {
                var $li = $( "#" + file.id );
                delete percentages[ file.id ];
                updateTotalProgress();
                $li.off().find( ".file-panel" ).off().end().remove();
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each( percentages, function( k, v ) {
                    total += v[ 0 ];
                    loaded += v[ 0 ] * v[ 1 ];
                } );

                percent = total ? loaded / total : 0;

                spans.eq( 0 ).text( Math.round( percent * 100 ) + "%" );
                spans.eq( 1 ).css( "width", Math.round( percent * 100 ) + "%" );
                updateStatus();
            }

            function setState( val, files ) {
                if ( val != state ) {
                    var stats = uploader.getStats();

                    $upload.removeClass( "state-" + state );
                    $upload.addClass( "state-" + val );

                    switch ( val ) {
                        /* 未选择文件 */
                        case "pedding":
                            $queue.addClass( "element-invisible" );
                            $statusBar.addClass( "element-invisible" );
                            $placeHolder.removeClass( "element-invisible" );
                            $progress.hide();
                            $info.hide();
                            uploader.refresh();
                            break;

                            /* 可以开始上传 */
                        case "ready":
                            $placeHolder.addClass( "element-invisible" );
                            $queue.removeClass( "element-invisible" );
                            $statusBar.removeClass( "element-invisible" );
                            $progress.hide();
                            $info.show();
                            $upload.text( lang.uploadStart );
                            uploader.refresh();
                            break;

                            /* 上传中 */
                        case "uploading":
                            $progress.show();
                            $info.hide();
                            $upload.text( lang.uploadPause );
                            break;

                            /* 暂停上传 */
                        case "paused":
                            $progress.show();
                            $info.hide();
                            $upload.text( lang.uploadContinue );
                            break;

                        case "confirm":
                            $progress.show();
                            $info.hide();
                            $upload.text( lang.uploadStart );

                            stats = uploader.getStats();
                            if ( stats.successNum && !stats.uploadFailNum ) {
                                setState( "finish" );
                                return;
                            }
                            break;

                        case "finish":
                            $progress.hide();
                            $info.show();
                            if ( stats.uploadFailNum ) {
                                $upload.text( lang.uploadRetry );
                            } else {
                                $upload.text( lang.uploadStart );
                            }
                            break;
                    }

                    state = val;
                    updateStatus();
                }

                if ( !_this.getQueueCount() ) {
                    $upload.addClass( "disabled" );
                } else {
                    $upload.removeClass( "disabled" );
                }
            }

            function updateStatus() {
                var text = "",
                    stats;

                if ( state === "ready" ) {
                    text = lang.updateStatusReady
                        .replace( "_", fileCount )
                        .replace( "_KB", WebUploader.formatSize( fileSize ) );
                } else if ( state === "confirm" ) {
                    stats = uploader.getStats();
                    if ( stats.uploadFailNum ) {
                        text = lang.updateStatusConfirm
                            .replace( "_", stats.successNum )
                            .replace( "_", stats.successNum );
                    }
                } else {
                    stats = uploader.getStats();
                    text = lang.updateStatusFinish
                        .replace( "_", fileCount )
                        .replace( "_KB", WebUploader.formatSize( fileSize ) )
                        .replace( "_", stats.successNum );

                    if ( stats.uploadFailNum ) {
                        text += lang.updateStatusError.replace( "_", stats.uploadFailNum );
                    }
                }

                $info.html( text );
            }

            uploader.on( "fileQueued", function( file ) {
                fileCount++;
                fileSize += file.size;

                if ( fileCount === 1 ) {
                    $placeHolder.addClass( "element-invisible" );
                    $statusBar.show();
                }

                addFile( file );
            } );

            uploader.on( "fileDequeued", function( file ) {
                fileCount--;
                fileSize -= file.size;

                removeFile( file );
                updateTotalProgress();
            } );

            uploader.on( "filesQueued", function( file ) {
                if ( !uploader.isInProgress() &&
                    ( state == "pedding" ||
                        state == "finish" ||
                        state == "confirm" ||
                        state == "ready" )
                ) {
                    setState( "ready" );
                }
                updateTotalProgress();
                /*if (!uploader.isInProgress() && ( state == 'finish' || state == 'confirm' || state == 'ready')) {
                            $upload.trigger('click');//uploader.upload(); //自动开始上传
                        }*/
            } );

            uploader.on( "all", function( type, files ) {
                switch ( type ) {
                    case "uploadFinished":
                        setState( "confirm", files );
                        break;
                    case "startUpload":
                        /* 添加额外的GET参数 */
                        var params =
                            utils.serializeParam( editor.queryCommandValue( "serverparam" ) ) ||
                            "",
                            url = utils.formatUrl(
                                _this.actionUrl +
                                ( _this.actionUrl.indexOf( "?" ) == -1 ? "?" : "&" ) +
                                "encode=utf-8&" +
                                params
                            );
                        if ( jQuery( "#watermark-flag:checked" ).length > 0 ) {
                            url += "&watermark=1";
                        } else {
                            url += "&watermark=0";
                        }
                        if ( editor.options.appkey && _this.uploadType != "qiniu" ) {
                            url += "&appkey=" + editor.options.appkey;
                        }

                        uploader.option( "server", url );
                        setState( "uploading", files );
                        break;
                    case "stopUpload":
                        setState( "paused", files );
                        break;
                }
            } );

            uploader.on( "uploadBeforeSend", function( file, data, header ) {
                //这里可以通过data对象添加POST参数
                header[ "X_Requested_With" ] = "XMLHttpRequest";
            } );

            uploader.on( "uploadProgress", function( file, percentage ) {
                var $li = $( "#" + file.id ),
                    $percent = $li.find( ".progress span" );

                $percent.css( "width", percentage * 100 + "%" );
                percentages[ file.id ][ 1 ] = percentage;
                updateTotalProgress();
            } );

            uploader.on( "uploadSuccess", function( file, ret ) {
                var $file = $( "#" + file.id );
                try {
                    var responseText = ret._raw || ret,
                        json = utils.str2json( responseText );
                    if ( json.state == "SUCCESS" ) {
                        if ( _this.queryString != "" ) {
                            json.url += "?" + _this.queryString;
                        }
                        _this.imageList.push( json );

                        if (
                            editor.options.uploadCallback &&
                            typeof editor.options.uploadCallback == "function"
                        ) {
                            editor.options.uploadCallback( json );
                        }

                        $file.append( '<span class="success"></span>' );
                        //$file.append('<span onclick="current_edit_img = null;window.top.edit_image(\''+json.url+'\');" class="edit">编辑</span>');
                    } else {
                        $file.find( ".error" ).text( json.state ).show();
                    }
                } catch ( e ) {
                    $file.find( ".error" ).text( lang.errorServerUpload ).show();
                }
            } );

            uploader.on( "uploadError", function( file, code ) {} );
            uploader.on( "error", function( code, file ) {
                if ( code == "Q_TYPE_DENIED" || code == "F_EXCEED_SIZE" ) {
                    addFile( file );
                }
            } );
            uploader.on( "uploadComplete", function( file, ret ) {} );

            $upload.on( "click", function() {
                if ( $( this ).hasClass( "disabled" ) ) {
                    return false;
                }

                if ( state === "ready" ) {
                    uploader.upload();
                } else if ( state === "paused" ) {
                    uploader.upload();
                } else if ( state === "uploading" ) {
                    uploader.stop();
                }
            } );

            $upload.addClass( "state-" + state );
            updateTotalProgress();
        },
        getQueueCount: function() {
            var file,
                i,
                status,
                readyFile = 0;
            if ( this.uploader ) {
                var files = this.uploader.getFiles();
                for ( i = 0;
                    ( file = files[ i++ ] ); ) {
                    status = file.getStatus();
                    if (
                        status == "queued" ||
                        status == "uploading" ||
                        status == "progress"
                    )
                        readyFile++;
                }
            }
            return readyFile;
        },
        destroy: function() {
            this.$wrap.remove();
        },
        getInsertList: function() {
            var i,
                data,
                list = [],
                align = getAlign(),
                prefix = editor.getOpt( "imageUrlPrefix" );
            for ( i = 0; i < this.imageList.length; i++ ) {
                data = this.imageList[ i ];
                var obj = {
                    src: prefix + data.url,
                    _src: prefix + data.url,
                    title: data.title,
                    alt: data.original,
                    floatStyle: align,
                };
                if ( data.aid ) {
                    obj.aid = "attachimg_" + data.aid;
                }
                list.push( obj );
            }
            return list;
        },
    };

    /* 在线图片 */
    function OnlineImage( target ) {
        this.container = utils.isString( target ) ?
            document.getElementById( target ) :
            target;
        var $this = this;
        $( "#remote-links a" ).click( function() {
            $( "#remote-links a" ).removeClass( "focus" );
            $( this ).addClass( "focus" );
            $this.reset();
        } );

        this.init();
    }
    OnlineImage.prototype = {
        init: function() {
            this.reset();
            this.initEvents();
        },
        /* 初始化容器 */
        initContainer: function() {
            this.container.innerHTML = "";
            this.list = document.createElement( "ul" );
            this.clearFloat = document.createElement( "li" );

            domUtils.addClass( this.list, "list" );
            domUtils.addClass( this.clearFloat, "clearFloat" );

            this.list.appendChild( this.clearFloat );
            this.container.appendChild( this.list );
            $( this.list ).css( "position", "relative" );
            $( this.list ).masonry( {
                itemSelector: "li",
                columnWidth: 70,
                animate: true,
            } );
        },
        /* 初始化滚动事件,滚动到地步自动拉取数据 */
        initEvents: function() {
            var _this = this;

            /* 滚动拉取图片 */
            domUtils.on( $G( "imageList" ), "scroll", function( e ) {
                var panel = this;
                if ( panel.scrollHeight - ( panel.offsetHeight + panel.scrollTop ) < 10 ) {
                    _this.getImageData();
                }
            } );
            /* 选中图片 */
            domUtils.on( this.container, "click", function( e ) {
                var target = e.target || e.srcElement,
                    li = target.parentNode;

                if ( li.tagName.toLowerCase() == "li" ) {
                    if ( domUtils.hasClass( li, "selected" ) ) {
                        domUtils.removeClasses( li, "selected" );
                    } else {
                        domUtils.addClass( li, "selected" );
                    }
                }
            } );
        },
        /* 初始化第一次的数据 */
        initData: function() {
            /* 拉取数据需要使用的值 */
            this.state = 0;
            this.listSize = editor.getOpt( "imageManagerListSize" );
            this.listIndex = 0;
            this.listEnd = false;
            this.type = $( "#remote-links .focus" ).data( "type" );

            /* 第一次拉取数据 */
            this.getImageData();
        },
        /* 重置界面 */
        reset: function() {
            this.initContainer();
            this.initData();
        },
        /* 向后台拉取图片列表数据 */
        getImageData: function() {
            var _this = this;

            if ( !_this.listEnd && !this.isLoadingData ) {
                this.isLoadingData = true;
                var url = editor.getActionUrl( editor.getOpt( "imageManagerActionName" ) ),
                    isJsonp = utils.isCrossDomainUrl( url );
                ajax.request( url, {
                    timeout: 100000,
                    dataType: isJsonp ? "jsonp" : "",
                    data: utils.extend( {
                            type: this.type,
                            start: this.listIndex,
                            size: this.listSize,
                        },
                        editor.queryCommandValue( "serverparam" )
                    ),
                    method: "get",
                    onsuccess: function( r ) {
                        try {
                            var json = isJsonp ? r : eval( "(" + r.responseText + ")" );
                            if ( json.state == "SUCCESS" ) {
                                _this.pushData( json.list );
                                _this.listIndex =
                                    parseInt( json.start ) + parseInt( json.list.length );
                                if ( _this.listIndex >= json.total ) {
                                    _this.listEnd = true;
                                }
                                _this.isLoadingData = false;
                            }
                        } catch ( e ) {
                            if ( r.responseText.indexOf( "ue_separate_ue" ) != -1 ) {
                                var list = r.responseText.split( r.responseText );
                                _this.pushData( list );
                                _this.listIndex = parseInt( list.length );
                                _this.listEnd = true;
                                _this.isLoadingData = false;
                            }
                        }
                    },
                    onerror: function() {
                        _this.isLoadingData = false;
                    },
                } );
            }
        },
        /* 添加图片到列表界面上 */
        pushData: function( list ) {
            var i,
                img,
                icon,
                _this = this,
                urlPrefix = editor.getOpt( "imageManagerUrlPrefix" );
            var newitems = {};
            var $container = $( this.list );
            for ( i = 0; i < list.length; i++ ) {
                if ( list[ i ] && list[ i ].url ) {
                    var item = document.createElement( "li" );
                    img = document.createElement( "img" );
                    icon = document.createElement( "span" );
                    title = document.createElement( "p" );

                    domUtils.on(
                        img,
                        "load",
                        ( function( image ) {
                            return function() {
                                _this.scale(
                                    image,
                                    image.parentNode.offsetWidth,
                                    image.parentNode.offsetHeight
                                );
                            };
                        } )( img )
                    );
                    img.width = 190;
                    img.setAttribute( "src", urlPrefix + list[ i ].url );
                    img.setAttribute( "_src", urlPrefix + list[ i ].url );
                    domUtils.addClass( icon, "icon" );

                    item.setAttribute( "data-id", list[ i ].id );
                    title.innerHTML = list[ i ].title;

                    item.appendChild( img );
                    item.appendChild( title );
                    item.appendChild( icon );
                    //item.style.width='190px';
                    //item.style.display='inline-block';
                    //$(item).css('display','inline-block');
                    $( item ).css( { opacity: 0 } );
                    this.list.insertBefore( item, this.clearFloat );
                    newitems[ i ] = item;
                    $( item ).imagesLoaded( function( instance ) {
                        $( instance.elements ).css( { opacity: 1 } );
                        $container.masonry( "appended", instance.elements );
                    } );
                }
            }
            //$(this.list).imagesLoaded(function() {
            //    $(this.list).nermasonry('appended', newitems);
            //});
        },
        /* 改变图片大小 */
        scale: function( img, w, h, type ) {
            /*var ow = img.width,
                      oh = img.height;

                  if (type == 'justify') {
                      if (ow >= oh) {
                          img.width = w;
                          img.height = h * oh / ow;
                          //img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                      } else {
                          img.width = w * ow / oh;
                          img.height = h;
                          //img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
                      }
                  } else {
                      if (ow >= oh) {
                          img.width = w * ow / oh;
                          img.height = h;
                          //img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
                      } else {
                          img.width = w;
                          img.height = h * oh / ow;
                          img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
                      }
                  }*/
        },
        getInsertList: function() {
            var i,
                lis = this.list.children,
                list = [],
                align = getAlign();
            for ( i = 0; i < lis.length; i++ ) {
                if ( domUtils.hasClass( lis[ i ], "selected" ) ) {
                    var img = lis[ i ].firstChild,
                        src = img.getAttribute( "_src" );
                    src = strip_imgthumb_opr( src );

                    list.push( {
                        src: src,
                        _src: src,
                        alt: src.substr( src.lastIndexOf( "/" ) + 1 ),
                        floatStyle: align,
                    } );
                }
            }
            return list;
        },
    };
} )();