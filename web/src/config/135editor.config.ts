/**
 * 135Editor Configuration
 * Centralized configuration for 135editor integration
 */

export interface Editor135Config {
  appkey: string;
  plat_host: string;
  base_url: string;
  sign_token?: string;
  style_width: number;
  initial_frame_height: number;
  z_index: number;
  open_editor: boolean;
  page_load: boolean;
  focus: boolean;
  auto_float_enabled: boolean;
  auto_height_enabled: boolean;
  scale_enabled: boolean;
  focus_in_end: boolean;
  remove_style: boolean;
}

// Default 135editor configuration
export const DEFAULT_135_CONFIG: Editor135Config = {
  // API Configuration - from working example
  appkey: '604ef43c-500c-4015-b816-3974ac10c65d',
  plat_host: 'www.135editor.com',
  base_url: 'https://www.135editor.com',
  sign_token: '', // Can be empty for basic usage
  
  // UI Configuration
  style_width: 340,
  initial_frame_height: 680,
  z_index: 1000,
  
  // Editor Behavior
  open_editor: true,
  page_load: true,
  focus: true,
  auto_float_enabled: false,
  auto_height_enabled: false,
  scale_enabled: false,
  focus_in_end: true,
  remove_style: false, // Keep styles for 135editor templates
};

// Alternative API keys found in the project (for reference)
export const ALTERNATIVE_APPKEYS = {
  signature: '566d34e0-4bac-443b-8a80-37f89fde689a',
  vue_app: '5c99c2c4-98a4-4b6c-b065-4fc3ac109a29', // Currently used
  index: '604ef43c-500c-4015-b816-3974ac10c65d',
};

/**
 * Get 135editor configuration with environment overrides
 */
export function get135EditorConfig(): Editor135Config {
  const config = { ...DEFAULT_135_CONFIG };
  
  // Override with environment variables if available
  if (typeof window !== 'undefined') {
    // Check for environment variables in window object
    const env = (window as any).__ENV__;
    if (env) {
      if (env.EDITOR_135_APPKEY) config.appkey = env.EDITOR_135_APPKEY;
      if (env.EDITOR_135_PLAT_HOST) config.plat_host = env.EDITOR_135_PLAT_HOST;
      if (env.EDITOR_135_BASE_URL) config.base_url = env.EDITOR_135_BASE_URL;
      if (env.EDITOR_135_SIGN_TOKEN) config.sign_token = env.EDITOR_135_SIGN_TOKEN;
    }
  }
  
  return config;
}

/**
 * Generate 135editor URLs based on configuration
 */
export function get135EditorUrls(config: Editor135Config) {
  const baseUrl = config.base_url;
  const appkey = config.appkey;
  const signToken = config.sign_token ? `&${config.sign_token}` : '';
  
  return {
    style_url: `${baseUrl}/editor_styles/open?inajax=1&appkey=${appkey}${signToken}`,
    page_url: `${baseUrl}/editor_styles/open_styles?inajax=1&appkey=${appkey}${signToken}`,
    search_url: `${baseUrl}/editor_styles/search?appkey=${appkey}&inajax=1`,
    recent_url: `${baseUrl}/editor_styles/recent?inajax=1`,
    upload_url: `${baseUrl}/uploadfiles/ueditor`,
    base_url: baseUrl,
    plat_url: `https://${config.plat_host}`,
  };
}

/**
 * Generate UEditor configuration for 135editor
 */
export function getUEditorConfig(config: Editor135Config) {
  const urls = get135EditorUrls(config);
  
  return {
    // Basic UEditor configuration
    UEDITOR_HOME_URL: '/resource/135/',
    initialFrameHeight: config.initial_frame_height,
    autoHeightEnabled: config.auto_height_enabled,
    scaleEnabled: config.scale_enabled,
    maximumWords: 50000,
    focus: config.focus,
    autoSyncData: true,
    removeStyle: config.remove_style,

    // Modern browser compatibility settings
    enableAutoSave: false,
    saveInterval: 0,
    enableDragDrop: false,
    retainOnlyLabelPasted: false,
    pasteplain: false,
    filterTxtRules: function() {
      return {};
    },

    // Error handling settings
    catchRemoteImageEnable: false,
    allowDivTransToP: false,
    disableObjectResizing: true,
    
    // 135editor specific configuration
    plat_host: config.plat_host,
    appkey: config.appkey,
    sign_token: config.sign_token,
    open_editor: config.open_editor,
    pageLoad: config.page_load,
    style_url: urls.style_url,
    page_url: urls.page_url,
    style_width: config.style_width,
    zIndex: config.z_index,
    focusInEnd: config.focus_in_end,
    autoFloatEnabled: config.auto_float_enabled,
    
    // Upload configuration
    uploadFormData: {
      referer: typeof window !== 'undefined' ? window.document.referrer : '',
    },
    
    // Enhanced toolbar with 135editor features
    toolbars: [
      [
        'bold', 'italic', 'underline', 'forecolor', 'shadowcolor', 'backcolor', '|',
        'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', 
        'indent', 'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
        'removeformat', 'formatmatch', 'autotypeset'
      ],
      [
        'cleardoc', 'paragraph', 'fontfamily', 'fontsize', 'inserttable',
        'background', 'simpleupload', 'insertimage', 'music', 'insertvideo',
        'horizontal', '|', 'undo', 'redo', '|', 'more'
      ],
      [
        'source', 'remotecontent', 'spechars', 'emotion', 'link',
        'superscript', 'subscript', 'insertorderedlist', 'insertunorderedlist',
        'directionalityltr', 'directionalityrtl', 'searchreplace', 'map',
        'preview', 'help', 'message', 'imgstyle'
      ]
    ],
    
    // Custom styles for WeChat formatting
    initialStyle: 'body{font-family:微软雅黑;}p{line-height:1.6em;font-size:16px;}',
    
    // Enable 135editor plugins
    plugins: ['open135'],
  };
}

/**
 * Initialize 135editor global variables
 */
export function initialize135EditorGlobals(config: Editor135Config) {
  if (typeof window === 'undefined') return;
  
  const urls = get135EditorUrls(config);
  
  // Set global variables required by 135editor
  window.PLAT135_URL = urls.plat_url;
  window.BASEURL = config.base_url;
  window.UEDITOR_HOME_URL = '/resource/135/';
}

export default {
  DEFAULT_135_CONFIG,
  ALTERNATIVE_APPKEYS,
  get135EditorConfig,
  get135EditorUrls,
  getUEditorConfig,
  initialize135EditorGlobals,
};
