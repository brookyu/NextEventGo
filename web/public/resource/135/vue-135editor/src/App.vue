<template>
	<div id="app">
		<img alt="Vue logo" src="./assets/logo.png" />
		<Editor
			id="editor"
			:config="config"
			@ready="editorReady"
			:path="path"
		/>
	</div>
</template>

<script>
import Editor from "./components/135Editor.vue";
const appkey = "5c99c2c4-98a4-4b6c-b065-4fc3ac109a29";
const BASEURL = "https://www.135editor.com";
export default {
	name: "App",
	components: {
		Editor,
	},
	data() {
		return {
            // 配置参数
            path: 'https://www.135editor.com/js/ueditor/', // 这里应配置为插件包对应的路径
			config: {
				plat_host: "www.135editor.com",
				appkey: appkey,
				open_editor: true,
				pageLoad: true,
				style_url:
					BASEURL + "/editor_styles/open?inajax=1&appkey=" + appkey,
				page_url:
					BASEURL +
					"/editor_styles/open_styles?inajax=1&appkey=" +
					appkey,
				style_width: 340,
				uploadFormData: {
					referer: window.document.referrer,
				},
				initialFrameHeight: 680,
				zIndex: 1000,
				focus: true,
				autoFloatEnabled: false,
				autoHeightEnabled: false,
				scaleEnabled: false,
				focusInEnd: true,
			},
		};
	},
	methods: {
		editorReady(editor) {
            // TODO
            this.editor = editor;
			// editor.getContent();
		},
	},
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
