import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { get135EditorConfig, getUEditorConfig, initialize135EditorGlobals } from '../../config/135editor.config';

declare global {
  interface Window {
    UE: any;
    UEDITOR_CONFIG: any;
    UEDITOR_HOME_URL: string;
    current_editor: any;
    PLAT135_URL: string;
    BASEURL: string;
    jQuery: any;
    $: any;
  }
}

interface Reliable135EditorProps {
  content: string;
  onChange: (content: string) => void;
  height?: string;
  className?: string;
  config?: any;
}

interface Reliable135EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  insertHtml: (html: string) => void;
}

const Reliable135Editor = forwardRef<Reliable135EditorRef, Reliable135EditorProps>(
  ({ content, onChange, height = '600px', className = '', config = {} }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<any>(null);
    const editorId = useRef(`reliable_editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const isInitialized = useRef(false);
    const loadingAttempts = useRef(0);
    const maxAttempts = 5;

    // Get 135editor configuration
    const editor135Config = get135EditorConfig();
    const defaultConfig = { ...getUEditorConfig(editor135Config), ...config };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (instanceRef.current) {
          return instanceRef.current.getContent();
        }
        return content;
      },
      setContent: (newContent: string) => {
        if (instanceRef.current) {
          instanceRef.current.setContent(newContent);
        }
      },
      insertHtml: (html: string) => {
        if (instanceRef.current) {
          instanceRef.current.execCommand('insertHtml', html);
        }
      }
    }));

    // Simple, reliable resource loading
    const loadResource = (url: string, type: 'script' | 'css'): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log(`🔄 Loading ${type}:`, url);
        
        if (type === 'css') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.onload = () => {
            console.log(`✅ CSS loaded:`, url);
            resolve();
          };
          link.onerror = () => {
            console.error(`❌ CSS failed:`, url);
            reject(new Error(`Failed to load CSS: ${url}`));
          };
          document.head.appendChild(link);
        } else {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => {
            console.log(`✅ Script loaded:`, url);
            resolve();
          };
          script.onerror = () => {
            console.error(`❌ Script failed:`, url);
            reject(new Error(`Failed to load script: ${url}`));
          };
          document.head.appendChild(script);
        }
      });
    };

    // Check if 135Editor is ready
    const is135EditorReady = (): boolean => {
      const ready = !!(
        window.UE &&
        typeof window.UE.getEditor === 'function' &&
        window.UEDITOR_CONFIG &&
        window.jQuery &&
        window.$ &&
        document.querySelector('script[src*="a92d301d77.js"]')
      );
      
      console.log('🔍 135Editor readiness check:', {
        hasUE: !!window.UE,
        hasGetEditor: !!(window.UE && typeof window.UE.getEditor === 'function'),
        hasConfig: !!window.UEDITOR_CONFIG,
        hasJQuery: !!window.jQuery,
        has$: !!window.$,
        has135Script: !!document.querySelector('script[src*="a92d301d77.js"]'),
        overall: ready
      });
      
      return ready;
    };

    // Initialize the editor
    const initializeEditor = () => {
      if (isInitialized.current || !editorRef.current) {
        console.log('⚠️ Editor already initialized or no ref');
        return;
      }

      console.log('🚀 Initializing 135Editor with full configuration...');

      try {
        // Initialize 135editor globals
        initialize135EditorGlobals(editor135Config);

        // Log the 135Editor configuration
        console.log('📝 135Editor Config:', {
          appkey: defaultConfig.appkey,
          plat_host: defaultConfig.plat_host,
          style_url: defaultConfig.style_url,
          page_url: defaultConfig.page_url,
          open_editor: defaultConfig.open_editor
        });

        console.log('📝 Creating UEditor instance with 135Editor config:', defaultConfig);

        const editor = window.UE.getEditor(editorId.current, defaultConfig);
        
        editor.ready(() => {
          console.log('✅ 135Editor ready!');
          instanceRef.current = editor;
          isInitialized.current = true;

          // Set as current editor for 135editor plugins
          window.current_editor = editor;

          // Set initial content with better logging
          console.log('📝 Setting initial content:', {
            hasContent: !!content,
            contentLength: content?.length || 0,
            contentPreview: content?.substring(0, 100) + (content?.length > 100 ? '...' : '')
          });

          if (content) {
            try {
              editor.setContent(content);
              console.log('✅ Initial content set successfully');
            } catch (error) {
              console.error('❌ Error setting initial content:', error);
            }
          } else {
            console.log('📝 No initial content to set');
          }

          // Set up change listener
          editor.addListener('contentChange', () => {
            const newContent = editor.getContent();
            onChange(newContent);
          });

          // Check for 135Editor specific features and configuration
          setTimeout(() => {
            console.log('🔍 Checking 135Editor features...');
            console.log('Editor config:', {
              appkey: editor.options.appkey,
              plat_host: editor.options.plat_host,
              open_editor: editor.options.open_editor,
              style_url: editor.options.style_url,
              page_url: editor.options.page_url
            });

            if (editor.editor135) {
              console.log('✅ 135Editor plugins loaded successfully');
            } else {
              console.log('⚠️ 135Editor plugins not detected, checking global...');
              if (window.current_editor && window.current_editor.editor135) {
                console.log('✅ 135Editor plugins available globally');
              } else {
                console.log('❌ 135Editor plugins not found. This might be why templates/assets are not showing.');
              }
            }

            // Check if 135Editor toolbar buttons are available
            const toolbar = editor.ui.toolbars;
            if (toolbar) {
              console.log('🔧 Toolbar buttons available:', Object.keys(toolbar));
            }
          }, 1000);
        });

      } catch (error) {
        console.error('❌ Failed to initialize 135Editor:', error);
        isInitialized.current = false;
      }
    };

    // Load all 135Editor resources
    const loadAll135EditorResources = async (): Promise<void> => {
      loadingAttempts.current++;
      console.log(`🔄 Loading 135Editor resources (attempt ${loadingAttempts.current}/${maxAttempts})`);

      try {
        const basePath = '/resource/135/';

        // Initialize globals
        if (typeof window !== 'undefined') {
          console.log('🔧 Setting up 135Editor globals...');

          // Initialize 135editor globals first
          initialize135EditorGlobals(editor135Config);

          // Set additional required globals
          window.UEDITOR_HOME_URL = '/resource/135/';
          window.UEDITOR_CONFIG = window.UEDITOR_CONFIG || {};
          (window as any).UE = (window as any).UE || { I18N: {} };

          console.log('🔧 135Editor globals set:', {
            PLAT135_URL: window.PLAT135_URL,
            BASEURL: window.BASEURL,
            UEDITOR_HOME_URL: window.UEDITOR_HOME_URL
          });
        }

        // Load resources in strict order
        console.log('📄 Loading CSS...');
        await loadResource(`${basePath}themes/96619a5672.css`, 'css');

        console.log('📜 Loading UEditor config...');
        await loadResource(`${basePath}ueditor.config.js`, 'script');

        console.log('📜 Loading jQuery...');
        await loadResource(`${basePath}third-party/jquery-3.3.1.min.js`, 'script');

        console.log('📜 Loading UEditor core...');
        await loadResource(`${basePath}ueditor.all.min.js`, 'script');

        console.log('📜 Loading 135Editor extensions...');
        await loadResource(`${basePath}a92d301d77.js`, 'script');

        console.log('✅ All 135Editor resources loaded successfully!');

        // Wait a bit for everything to settle
        setTimeout(() => {
          if (is135EditorReady()) {
            initializeEditor();
          } else {
            console.log('⚠️ 135Editor not ready after loading, will retry...');
            if (loadingAttempts.current < maxAttempts) {
              setTimeout(() => loadAll135EditorResources(), 1000);
            }
          }
        }, 500);

      } catch (error) {
        console.error('❌ Failed to load 135Editor resources:', error);
        if (loadingAttempts.current < maxAttempts) {
          console.log(`🔄 Retrying in 2 seconds... (${loadingAttempts.current}/${maxAttempts})`);
          setTimeout(() => loadAll135EditorResources(), 2000);
        }
      }
    };

    // Main effect
    useEffect(() => {
      console.log('🚀 Reliable135Editor starting...', {
        editorId: editorId.current,
        hasRef: !!editorRef.current
      });

      if (!editorRef.current) {
        console.log('❌ No editor ref available');
        return;
      }

      // Check if already ready
      if (is135EditorReady()) {
        console.log('✅ 135Editor already ready, initializing...');
        initializeEditor();
      } else {
        console.log('⚠️ 135Editor not ready, loading resources...');
        loadAll135EditorResources();
      }

      // Cleanup
      return () => {
        if (instanceRef.current) {
          try {
            instanceRef.current.destroy();
          } catch (error) {
            console.log('Error destroying editor:', error);
          }
        }
        isInitialized.current = false;
      };
    }, []);

    // Update content when prop changes
    useEffect(() => {
      console.log('🔄 Content prop changed:', {
        contentLength: content?.length || 0,
        hasInstance: !!instanceRef.current,
        isInitialized: isInitialized.current,
        contentPreview: content?.substring(0, 100) + (content?.length > 100 ? '...' : '')
      });

      let retryCount = 0;
      const maxRetries = 50; // Max 5 seconds of retrying

      const updateContent = () => {
        if (instanceRef.current && isInitialized.current) {
          try {
            const currentContent = instanceRef.current.getContent();
            console.log('📝 Updating editor content:', {
              currentLength: currentContent?.length || 0,
              newLength: content?.length || 0,
              contentChanged: currentContent !== content
            });

            if (currentContent !== content) {
              instanceRef.current.setContent(content || '');
              console.log('✅ Content updated successfully');
            } else {
              console.log('📝 Content already matches, no update needed');
            }
          } catch (error) {
            console.error('❌ Error updating content:', error);
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ Editor not ready, retrying... (${retryCount}/${maxRetries})`);
          setTimeout(updateContent, 100);
        } else {
          console.warn('⚠️ Max retries reached, could not update content');
        }
      };

      updateContent();
    }, [content]);

    return (
      <div className={`reliable-135editor ${className}`}>
        <div
          ref={editorRef}
          id={editorId.current}
          style={{ height, width: '100%' }}
        />
      </div>
    );
  }
);

Reliable135Editor.displayName = 'Reliable135Editor';

export default Reliable135Editor;
