import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { get135EditorConfig, getUEditorConfig, initialize135EditorGlobals } from '../../config/135editor.config';

interface Real135EditorProps {
  content: string;
  onChange: (content: string) => void;
  style?: React.CSSProperties;
  className?: string;
  config?: {
    initialFrameHeight?: number;
    autoHeightEnabled?: boolean;
    scaleEnabled?: boolean;
    [key: string]: any;
  };
}

interface Real135EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  getEditor: () => any;
}

declare global {
  interface Window {
    UE: any;
    UEDITOR_HOME_URL: string;
    UEDITOR_CONFIG: any;
    current_editor: any;
    PLAT135_URL: string;
    BASEURL: string;
    jQuery: any;
    $: any;
  }
}

const Real135Editor = forwardRef<Real135EditorRef, Real135EditorProps>(
  ({ content, onChange, style, className, config = {} }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<any>(null);
    const editorId = useRef(`editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const isInitialized = useRef(false);
    const retryCount = useRef(0);
    const maxRetries = 3;
    const loadingTimeout = useRef<NodeJS.Timeout>();

    // Get 135editor configuration
    const editor135Config = get135EditorConfig();
    const defaultConfig = { ...getUEditorConfig(editor135Config), ...config };

    // Expose methods through ref
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
      getEditor: () => instanceRef.current
    }));

    // Load CSS
    const loadCSS = (href: string) => {
      return new Promise<void>((resolve) => {
        const existingLink = document.querySelector(`link[href="${href}"]`);
        if (existingLink) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Continue even if CSS fails to load
        document.head.appendChild(link);
      });
    };

    // Load JavaScript
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log(`Loading script: ${src}`);
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          console.log(`Script already loaded: ${src}`);
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.onload = () => {
          console.log(`Script loaded successfully: ${src}`);
          resolve();
        };
        script.onerror = (error) => {
          console.error(`Failed to load script: ${src}`, error);
          reject(new Error(`Failed to load script: ${src}`));
        };
        document.head.appendChild(script);
      });
    };

    // Initialize the editor
    const initEditor = async () => {
      if (isInitialized.current || !window.UE || typeof window.UE.getEditor !== 'function' || !editorRef.current) {
        console.log('Cannot initialize editor:', {
          isInitialized: isInitialized.current,
          hasUE: !!window.UE,
          hasGetEditor: !!(window.UE && typeof window.UE.getEditor === 'function'),
          hasEditorRef: !!editorRef.current
        });
        return;
      }

      try {
        isInitialized.current = true;

        // Create the script element that UEditor expects
        const scriptElement = document.createElement('script');
        scriptElement.id = editorId.current;
        scriptElement.type = 'text/plain';
        scriptElement.innerHTML = content || '';

        // Clear the container and add the script element
        editorRef.current.innerHTML = '';
        editorRef.current.appendChild(scriptElement);

        console.log('Created script element:', scriptElement);

        // Set the UEDITOR_HOME_URL and other global configurations
        window.UEDITOR_HOME_URL = defaultConfig.UEDITOR_HOME_URL;

        // Initialize 135editor globals
        initialize135EditorGlobals(editor135Config);

        console.log('Creating UEditor instance with config:', defaultConfig);
        console.log('135editor URLs:', {
          style_url: defaultConfig.style_url,
          page_url: defaultConfig.page_url,
          appkey: defaultConfig.appkey
        });

        // Create the editor instance with 135editor configuration
        // Add modern browser compatibility settings
        const editorConfig = {
          ...defaultConfig,
          // Modern browser compatibility settings
          enableAutoSave: false,
          saveInterval: 0,
          enableDragDrop: false,
          enablePasteFilter: true,
          retainOnlyLabelPasted: false,
          pasteplain: false,
          // Override with any custom config
          ...config
        };

        // Double-check that UE.getEditor is available
        if (!window.UE || typeof window.UE.getEditor !== 'function') {
          throw new Error('UE.getEditor is not available');
        }

        instanceRef.current = window.UE.getEditor(editorId.current, editorConfig);

        // Set up event listeners with error handling
        instanceRef.current.addListener('ready', () => {
          console.log('✅ 135Editor is ready with template support');
          console.log('Editor container:', editorRef.current);
          console.log('Editor iframe:', instanceRef.current.iframe);

          // Add error handling for UEditor events
          try {
            // Wrap UEditor's event handling to prevent errors
            const originalFireEvent = instanceRef.current.fireEvent;
            instanceRef.current.fireEvent = function(type: any, ...args: any[]) {
              try {
                return originalFireEvent.call(this, type, ...args);
              } catch (error: any) {
                // Silently handle UEditor internal errors
                if (error?.message && error.message.includes('Cannot read properties of undefined')) {
                  return;
                }
                throw error;
              }
            };
          } catch (error: any) {
            console.warn('Could not wrap UEditor fireEvent:', error);
          }

          // Set initial content with better error handling
          console.log('📝 Setting initial content:', {
            hasContent: !!content,
            contentLength: content?.length || 0,
            contentPreview: content?.substring(0, 100) + (content?.length > 100 ? '...' : '')
          });

          if (content) {
            try {
              instanceRef.current.setContent(content);
              console.log('✅ Initial content set successfully');
            } catch (error) {
              console.error('❌ Error setting initial content:', error);
              // Retry after a short delay
              setTimeout(() => {
                try {
                  instanceRef.current.setContent(content);
                  console.log('✅ Initial content set successfully on retry');
                } catch (retryError) {
                  console.error('❌ Error setting initial content on retry:', retryError);
                }
              }, 500);
            }
          } else {
            console.log('📝 No initial content to set');
          }

          // Set up content change listener
          instanceRef.current.addListener('contentChange', () => {
            const newContent = instanceRef.current.getContent();
            onChange(newContent);
          });

          // Set as current editor for 135editor plugins
          if (!window.current_editor) {
            window.current_editor = instanceRef.current;
          }

          // Initialize 135editor specific features
          if (instanceRef.current.editor135) {
            console.log('✅ 135Editor plugins loaded successfully');
          } else {
            console.log('⚠️ 135Editor plugins not detected, checking...');
            // Check if 135editor features are available
            setTimeout(() => {
              if (window.current_editor && window.current_editor.editor135) {
                console.log('✅ 135Editor plugins loaded after delay');
              }
            }, 2000);
          }
        });

        instanceRef.current.addListener('beforeDestroy', () => {
          console.log('135Editor is being destroyed');
        });

        instanceRef.current.addListener('error', (error: any) => {
          console.error('135Editor error:', error);
        });

      } catch (error) {
        console.error('Failed to initialize 135Editor:', error);
        isInitialized.current = false;
      }
    };

    // Function to check if 135Editor is fully loaded with all features
    const check135EditorReady = () => {
      const hasBasicUE = window.UE && typeof window.UE.getEditor === 'function';
      const hasConfig = !!window.UEDITOR_CONFIG;
      const hasJQuery = !!window.jQuery && !!window.$;
      const hasScripts = document.querySelector('script[src*="ueditor.all.min.js"]') &&
                        document.querySelector('script[src*="a92d301d77.js"]');

      // Check for 135Editor specific features
      const has135Features = window.UE &&
                            (window.UE.plugins && window.UE.plugins.length > 0) ||
                            document.querySelector('script[src*="a92d301d77.js"]');

      console.log('135Editor readiness check:', {
        hasBasicUE,
        hasConfig,
        hasJQuery,
        hasScripts,
        has135Features,
        pluginCount: window.UE?.plugins?.length || 0
      });

      return hasBasicUE && hasConfig && hasJQuery && hasScripts && has135Features;
    };

    // Load all required resources with retry logic
    const loadResources = async () => {
      try {
        console.log(`🔄 Starting to load 135Editor resources... (attempt ${retryCount.current + 1}/${maxRetries})`, {
          timestamp: new Date().toISOString(),
          retryCount: retryCount.current,
          maxRetries
        });
        const basePath = '/resource/135/';

        // Simplified approach: Always force a complete reload
        console.log('🧹 Cleaning up existing 135Editor resources...');

        // Clean up any existing incomplete resources to ensure fresh load
        const existingScripts = document.querySelectorAll('script[src*="/resource/135/"]');
        const existingCSS = document.querySelectorAll('link[href*="/resource/135/"]');

        console.log(`Found ${existingScripts.length} existing scripts and ${existingCSS.length} existing CSS files`);

        existingScripts.forEach(script => {
          console.log('🗑️ Removing existing 135Editor script:', script.getAttribute('src'));
          script.remove();
        });

        existingCSS.forEach(css => {
          console.log('🗑️ Removing existing 135Editor CSS:', css.getAttribute('href'));
          css.remove();
        });

        // Initialize globals first to prevent undefined errors
        if (typeof window !== 'undefined') {
          console.log('🔧 Initializing global objects...');
          // Reset and initialize UEDITOR_CONFIG
          window.UEDITOR_CONFIG = {};

          // Reset and initialize UE object structure
          (window as any).UE = {
            I18N: {},
            plugins: []
          };
        }

        // Load CSS first
        const cssUrl = `${basePath}themes/96619a5672.css`;
        console.log('📄 Loading CSS:', cssUrl);
        await loadCSS(cssUrl);
        console.log('✅ CSS loaded successfully');

        // Load scripts in order (same as working example)
        const scripts = [
          `${basePath}ueditor.config.js`,
          `${basePath}third-party/jquery-3.3.1.min.js`,
          `${basePath}ueditor.all.min.js`,
          `${basePath}a92d301d77.js`
        ];

        console.log('📦 Loading scripts in sequence:', scripts);

        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          console.log(`📜 Loading script ${i + 1}/${scripts.length}:`, script);

          try {
            await loadScript(script);
            console.log(`✅ Script ${i + 1} loaded successfully:`, script);
          } catch (error) {
            console.error(`❌ Failed to load script ${i + 1}:`, script, error);
            throw error;
          }

          // Check specific globals after key scripts
          if (script.includes('ueditor.config.js')) {
            console.log('🔍 UEditor config loaded, checking window.UEDITOR_CONFIG:', typeof window.UEDITOR_CONFIG);
          }
          if (script.includes('jquery')) {
            console.log('🔍 jQuery loaded, checking window.jQuery:', typeof window.jQuery);
          }
          if (script.includes('ueditor.all.min.js')) {
            console.log('🔍 UEditor core loaded, checking window.UE:', typeof window.UE);
          }
          if (script.includes('a92d301d77.js')) {
            console.log('🔍 135Editor extensions loaded, checking plugins:', window.UE?.plugins?.length || 0);
          }
          if (script.includes('ueditor.all.min.js')) {
            console.log('UEditor core loaded, checking window.UE:', typeof window.UE);
            // Ensure I18N is properly initialized after UEditor loads
            if (window.UE && !window.UE.I18N) {
              window.UE.I18N = {};
            }
          }
        }

        // Check if everything is ready
        const checkReady = () => {
          if (check135EditorReady()) {
            console.log('✅ All 135Editor resources loaded and ready');
            clearTimeout(loadingTimeout.current);
            initEditor();
          } else if (retryCount.current < maxRetries - 1) {
            retryCount.current++;
            console.log(`⚠️ 135Editor not fully ready, retrying... (${retryCount.current}/${maxRetries})`);
            clearTimeout(loadingTimeout.current);
            loadingTimeout.current = setTimeout(loadResources, 2000);
          } else {
            console.error('❌ Failed to load 135Editor after maximum retries');
            showReloadMessage();
          }
        };

        // Wait a bit for DOM to be ready, then check
        setTimeout(checkReady, 500);

      } catch (error) {
        console.error('Failed to load 135Editor resources:', error);
        retryCount.current++;
        if (retryCount.current < maxRetries) {
          console.log(`Retrying in 2 seconds... (${retryCount.current}/${maxRetries})`);
          loadingTimeout.current = setTimeout(loadResources, 2000);
        } else {
          showReloadMessage();
        }
      }
    };

    // Show user-friendly reload message
    const showReloadMessage = () => {
      if (editorRef.current) {
        editorRef.current.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 300px;
            text-align: center;
            color: #666;
            border: 2px dashed #ddd;
            border-radius: 8px;
            margin: 20px;
            background: #fafafa;
          ">
            <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
            <div style="font-size: 18px; margin-bottom: 8px; font-weight: 500;">135Editor Loading Issue</div>
            <div style="font-size: 14px; color: #999; margin-bottom: 16px; max-width: 400px; line-height: 1.4;">
              The editor resources didn't load properly. This sometimes happens on the first visit.
              <br>Please refresh the page to reload the editor.
            </div>
            <button
              onclick="window.location.reload()"
              style="
                padding: 12px 24px;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.2s;
              "
              onmouseover="this.style.background='#0056b3'"
              onmouseout="this.style.background='#007bff'"
            >
              🔄 Refresh Page
            </button>
          </div>
        `;
      }
    };

    // Effect to initialize the editor
    useEffect(() => {
      console.log('🚀 Real135Editor useEffect triggered', {
        editorRef: !!editorRef.current,
        windowExists: typeof window !== 'undefined',
        timestamp: new Date().toISOString()
      });

      if (!editorRef.current) {
        console.log('❌ No editor ref, exiting useEffect');
        return;
      }

      // Suppress UEditor console warnings
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;

      console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('DOMNodeInserted') ||
            message.includes('mutation event') ||
            message.includes('deprecated')) {
          return; // Suppress these warnings
        }
        originalConsoleWarn.apply(console, args);
      };

      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Cannot read properties of undefined') &&
            message.includes('onclick')) {
          return; // Suppress these UEditor errors
        }
        originalConsoleError.apply(console, args);
      };

      // Check current state before deciding what to do
      const currentState = {
        hasUE: !!window.UE,
        hasUEGetEditor: !!(window.UE && typeof window.UE.getEditor === 'function'),
        hasConfig: !!window.UEDITOR_CONFIG,
        hasJQuery: !!window.jQuery,
        has$: !!window.$,
        isReady: check135EditorReady(),
        isInitialized: isInitialized.current
      };

      console.log('🔍 Current 135Editor state:', currentState);

      // Always check for complete 135Editor readiness, not just basic UE
      if (check135EditorReady()) {
        console.log('✅ 135Editor is fully ready, initializing editor...');
        initEditor();
      } else {
        console.log('⚠️ 135Editor not fully ready, loading all resources...', {
          reason: 'Missing components',
          currentState
        });
        // Force reload of all resources to ensure 135Editor features are available
        loadResources();
      }

      // Also set up a polling mechanism to check for complete 135Editor readiness
      const checkInterval = setInterval(() => {
        if (check135EditorReady() && !isInitialized.current) {
          console.log('135Editor became fully ready, initializing editor...');
          clearInterval(checkInterval);
          initEditor();
        }
      }, 500);

      // Cleanup interval after 30 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
      }, 30000);

      // Cleanup function
      return () => {
        // Clear any pending timeouts
        if (loadingTimeout.current) {
          clearTimeout(loadingTimeout.current);
        }

        // Clear the polling interval
        clearInterval(checkInterval);
        clearTimeout(timeoutId);

        // Restore original console methods
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;

        if (instanceRef.current && instanceRef.current.destroy) {
          try {
            instanceRef.current.destroy();
            instanceRef.current = null;
          } catch (error) {
            console.error('Error destroying editor:', error);
          }
        }
        isInitialized.current = false;
        retryCount.current = 0;
      };
    }, []);

    // Effect to update content when prop changes
    useEffect(() => {
      console.log('🔄 Content prop changed:', {
        contentLength: content?.length || 0,
        hasInstance: !!instanceRef.current,
        isReady: instanceRef.current?.isReady?.() || false
      });

      let retryCount = 0;
      const maxRetries = 50; // Max 5 seconds of retrying

      const updateContent = () => {
        if (instanceRef.current && typeof instanceRef.current.isReady === 'function' && instanceRef.current.isReady()) {
          try {
            const currentContent = instanceRef.current.getContent();
            console.log('📝 Updating editor content:', {
              currentLength: currentContent?.length || 0,
              newLength: content?.length || 0,
              contentPreview: content?.substring(0, 100) + (content?.length > 100 ? '...' : '')
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

    // Show loading indicator initially
    const showLoadingIndicator = () => {
      if (editorRef.current && !isInitialized.current) {
        editorRef.current.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            text-align: center;
            color: #666;
          ">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid #f3f3f3;
              border-top: 3px solid #007bff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-bottom: 16px;
            "></div>
            <div style="font-size: 16px; margin-bottom: 8px;">Loading 135Editor...</div>
            <div style="font-size: 12px; color: #999;">
              Initializing rich text editor with templates
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        `;
      }
    };

    // Show loading indicator on mount
    React.useEffect(() => {
      showLoadingIndicator();
    }, []);

    return (
      <div
        ref={editorRef}
        className={className}
        style={{
          minHeight: '400px',
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px',
          position: 'relative',
          ...style
        }}
      />
    );
  }
);

Real135Editor.displayName = 'Real135Editor';

export default Real135Editor;
