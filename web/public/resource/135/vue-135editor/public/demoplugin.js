
 // 自定义插件js放在ueditor.all.min.js后创建编辑器之前加载即可
UE.plugins['demoplugin'] = function() {

    var editor = this;
    // TODO: editor 扩展

    // 监听事件
    editor.on('event', function(){

    });

    // 给编辑器扩展方法
    editor.fun = function(){}

}