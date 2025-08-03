<template>
	<script :id="id" name="content" type="text/plain"></script>
</template>

<script>
export default {
	name: "",
	components: {},
	props: {
		id: {
			type: String,
			default: "135editor",
		},
		path: {
			type: String,
			default: "./",
		},
		config: {
			type: Object,
		},
	},
	data() {
		return {
			scripts: [
				"ueditor.config.js",
				"third-party/jquery-3.3.1.min.js",
				"ueditor.all.min.js",
            ],
            endScripts: [
                "a92d301d77.js",
            ],
			css: "themes/96619a5672.css",
		};
	},
	created() {
		if (window.UE) {
			this.initEditor();
		} else {
			this.injectCss(this.css);
			Promise.all(this.scripts.map(this.injectScript)).then(() => {
				return this.injectScript(this.endScripts)
			}).then(()=>{
                this.initEditor();
            });
		}
	},
	beforeDestroy() {
		if (this.instance && this.instance.destroy) {
			this.instance.destroy();
		}
	},
	methods: {
		injectScript(script) {
			let scriptTag = document.getElementById(script);
			if (!scriptTag) {
				scriptTag = document.createElement("script");
				scriptTag.setAttribute("type", "text/javascript");
				scriptTag.setAttribute("src", this.path + script);
				scriptTag.setAttribute("id", script);
				const head = document.getElementsByTagName("head")[0];
				head.appendChild(scriptTag);
			}

			if (scriptTag.loaded || script.readyState === "complete") {
				return Promise.resolve(script);
			}

			return new Promise((resolve) => {
				if (scriptTag.readyState) {
					// IE
					scriptTag.onreadystatechange = () => {
						if (
							scriptTag.readyState === "loaded" ||
							scriptTag.readyState === "complete"
						) {
							scriptTag.onreadystatechange = null;
							resolve(script);
						}
					};
				} else {
					scriptTag.onload = () => {
						resolve(script);
					};
				}
				// scriptTag.addEventListener("load", () => {
				// 	resolve(script);
				// });
			});
		},
		injectCss(css) {
			let cssTag = document.getElementById(css);
			if (!cssTag) {
				cssTag = document.createElement("link");
				cssTag.setAttribute("type", "text/css");
				cssTag.setAttribute("href", this.path + css);
				cssTag.setAttribute("id", css);
				cssTag.setAttribute("ref", "stylesheet");
				const head = document.getElementsByTagName("head")[0];
				head.appendChild(cssTag);
			}
		},

		initEditor() {
			if (!this.instance) {
				this.$nextTick(() => {
					this.instance = window.UE.getEditor(this.id, {UEDITOR_HOME_URL: this.path, ...this.config});
					this.instance.addListener("ready", () => {
						this.$emit("ready", this.instance);
						if (!window.current_editor) {
							window.current_editor = this.instance;
						}
					});
				});
			}
		},
	},
};
</script>

<style scoped>
</style>
