import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface Improved135EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
  style?: React.CSSProperties;
  height?: string;
  config?: any;
}

export interface Improved135EditorRef {
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

const Improved135Editor = forwardRef<Improved135EditorRef, Improved135EditorProps>(({
  content = '',
  onChange = () => {},
  className,
  style,
  height = '600px',
  config = {}
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const isInitialized = useRef(false);
  const isResourcesLoaded = useRef(false);
  const pendingContent = useRef<string>('');
  const editorId = useRef(`improved-135-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (instanceRef.current && instanceRef.current.ready) {
        return instanceRef.current.getContent();
      }
      return '';
    },
    setContent: (newContent: string) => {
      if (instanceRef.current && instanceRef.current.ready) {
        instanceRef.current.setContent(newContent);
      }
    },
    getEditor: () => instanceRef.current
  }));

  // Script loading utility with better error handling
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`Script already loaded: ${src}`);
        resolve();
        return;
      }

      console.log(`Loading script: ${src}`);
      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';

      script.onload = () => {
        console.log(`✅ Script loaded successfully: ${src}`);
        resolve();
      };

      script.onerror = (error) => {
        console.error(`❌ Failed to load script: ${src}`, error);
        // For 135Editor extensions, don't reject - just warn and continue
        if (src.includes('a92d301d77.js')) {
          console.warn(`⚠️ 135Editor extensions failed to load, continuing with basic editor`);
          resolve(); // Continue without 135Editor extensions
        } else {
          reject(new Error(`Failed to load script: ${src}`));
        }
      };

      document.head.appendChild(script);
    });
  };

  // CSS loading utility with promise support
  const loadCSS = (href: string): Promise<void> => {
    return new Promise((resolve) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        console.log(`CSS already loaded: ${href}`);
        resolve();
        return;
      }

      console.log(`Loading CSS: ${href}`);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;

      link.onload = () => {
        console.log(`✅ CSS loaded successfully: ${href}`);
        resolve();
      };

      link.onerror = () => {
        console.warn(`⚠️ CSS failed to load (continuing): ${href}`);
        resolve(); // Continue even if CSS fails
      };

      document.head.appendChild(link);
    });
  };

  // Initialize editor with proper content handling
  const initEditor = () => {
    if (isInitialized.current || !containerRef.current || !window.UE || !isResourcesLoaded.current) {
      console.log('Cannot initialize editor:', {
        isInitialized: isInitialized.current,
        hasContainer: !!containerRef.current,
        hasUE: !!window.UE,
        resourcesLoaded: isResourcesLoaded.current
      });
      return;
    }

    try {
      console.log('🚀 Initializing 135Editor...');
      isInitialized.current = true;
      setLoadingStage('Initializing editor...');

      // Store the current content to set after editor is ready
      pendingContent.current = content || '';

      // Create script element for UEditor
      const scriptElement = document.createElement('script');
      scriptElement.id = editorId.current;
      scriptElement.type = 'text/plain';
      scriptElement.innerHTML = ''; // Start with empty content

      // Clear container and add script element
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(scriptElement);

      // Set up 135editor configuration
      const appkey = '604ef43c-500c-4015-b816-3974ac10c65d';
      window.BASEURL = 'https://www.135editor.com';
      window.PLAT135_URL = 'https://www.135editor.com';
      window.UEDITOR_HOME_URL = '/resource/135/';

      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        try {
          console.log('Creating UEditor instance...');

          // Create editor instance
          instanceRef.current = window.UE.getEditor(editorId.current, {
            UEDITOR_HOME_URL: '/resource/135/',
            plat_host: 'www.135editor.com',
            appkey: appkey,
            open_editor: true,
            pageLoad: true,
            style_url: window.BASEURL + '/editor_styles/open?inajax=1&appkey=' + appkey,
            page_url: window.BASEURL + '/editor_styles/open_styles?inajax=1&appkey=' + appkey,
            style_width: 340,
            uploadFormData: {
              referer: window.document.referrer
            },
            initialFrameHeight: parseInt(height) || 600,
            zIndex: 1000,
            focus: false, // Don't auto-focus to prevent issues
            autoFloatEnabled: false,
            autoHeightEnabled: false,
            scaleEnabled: false,
            focusInEnd: false,
            removeStyle: false,
            ...config
          });

          // Set as current editor
          if (!window.current_editor) {
            window.current_editor = instanceRef.current;
          }

          // Add ready listener with proper content setting
          instanceRef.current.addListener('ready', () => {
            console.log('✅ 135Editor is ready!');
            setLoadingStage('Setting content...');

            // Wait a bit more for editor to be fully ready
            setTimeout(() => {
              try {
                // Set the pending content
                if (pendingContent.current) {
                  console.log('Setting initial content:', pendingContent.current.substring(0, 100) + '...');
                  instanceRef.current.setContent(pendingContent.current);
                }

                // Add content change listener
                instanceRef.current.addListener('contentChange', () => {
                  const newContent = instanceRef.current.getContent();
                  onChange(newContent);
                });

                setIsLoading(false);
                setError(null);
                console.log('✅ 135Editor fully initialized and ready!');
              } catch (error) {
                console.error('Error setting initial content:', error);
                setIsLoading(false);
                setError(null); // Don't show error for content setting issues
              }
            }, 500); // Wait for editor to be fully ready
          });

          // Add error listener
          instanceRef.current.addListener('error', (error: any) => {
            console.error('135Editor error:', error);
            setError('Editor initialization failed');
            setIsLoading(false);
          });

        } catch (error) {
          console.error('Failed to create editor instance:', error);
          setError('Failed to create editor instance');
          setIsLoading(false);
          isInitialized.current = false;
        }
      }, 200); // Increased delay to ensure DOM is ready

    } catch (error) {
      console.error('Failed to initialize 135Editor:', error);
      setError('Failed to initialize editor');
      setIsLoading(false);
      isInitialized.current = false;
    }
  };

  // Check if all required resources are available
  const checkResourcesReady = (): boolean => {
    const hasUE = window.UE && typeof window.UE.getEditor === 'function';
    const hasConfig = !!window.UEDITOR_CONFIG;
    const hasJQuery = !!window.jQuery;

    console.log('Resource check:', { hasUE, hasConfig, hasJQuery });

    return hasUE && hasConfig && hasJQuery;
  };

  // Simplified and more robust resource loading
  const loadResources = async () => {
    if (isResourcesLoaded.current) {
      console.log('Resources already loaded, initializing editor...');
      initEditor();
      return;
    }

    try {
      console.log('🔄 Starting to load 135Editor resources...');
      setIsLoading(true);
      setError(null);
      setLoadingStage('Initializing globals...');

      const basePath = '/resource/135/';

      // Initialize all required globals first
      if (typeof window !== 'undefined') {
        console.log('Setting up global variables...');
        window.BASEURL = 'https://www.135editor.com';
        window.PLAT135_URL = 'https://www.135editor.com';
        window.UEDITOR_HOME_URL = '/resource/135/';

        if (!window.UEDITOR_CONFIG) {
          window.UEDITOR_CONFIG = {};
        }
      }

      // Load CSS first
      setLoadingStage('Loading styles...');
      console.log('Loading CSS...');
      await loadCSS(basePath + 'themes/96619a5672.css');
      console.log('✅ CSS loaded');

      // Load scripts one by one with explicit error handling
      setLoadingStage('Loading UEditor Config...');
      console.log('Loading ueditor.config.js...');
      await loadScript(basePath + 'ueditor.config.js');
      console.log('✅ UEditor config loaded');

      setLoadingStage('Loading jQuery...');
      console.log('Loading jQuery...');
      await loadScript(basePath + 'third-party/jquery-3.3.1.min.js');
      console.log('✅ jQuery loaded, version:', window.jQuery?.fn?.jquery);

      setLoadingStage('Loading UEditor Core...');
      console.log('Loading ueditor.all.min.js...');
      await loadScript(basePath + 'ueditor.all.min.js');
      console.log('✅ UEditor core loaded, UE type:', typeof window.UE);

      // Wait for UEditor to be fully ready
      setLoadingStage('Waiting for UEditor...');
      console.log('Waiting for UEditor to initialize...');
      let attempts = 0;
      while ((!window.UE || typeof window.UE.getEditor !== 'function') && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        console.log(`Waiting for UEditor... attempt ${attempts}/30`);
      }

      if (!window.UE || typeof window.UE.getEditor !== 'function') {
        throw new Error('UEditor failed to initialize properly');
      }

      console.log('✅ UEditor is ready');

      // Load 135Editor extensions with extra care
      setLoadingStage('Loading 135Editor Extensions...');
      console.log('Loading 135Editor extensions...');
      try {
        // Ensure all globals are set again before loading extensions
        window.BASEURL = 'https://www.135editor.com';
        window.PLAT135_URL = 'https://www.135editor.com';
        window.UEDITOR_HOME_URL = '/resource/135/';

        await loadScript(basePath + 'a92d301d77.js');
        console.log('✅ 135Editor extensions loaded');
      } catch (error) {
        console.warn('⚠️ 135Editor extensions failed to load, continuing with basic editor:', error);
        // Continue without extensions - basic UEditor should still work
      }

      // Mark resources as loaded
      isResourcesLoaded.current = true;
      console.log('✅ All resources loaded successfully');

      // Initialize editor
      setLoadingStage('Initializing editor...');
      initEditor();

    } catch (error) {
      console.error('❌ Failed to load 135Editor resources:', error);
      setError(`Failed to load editor resources: ${error.message}`);
      setIsLoading(false);
      isResourcesLoaded.current = false;
    }
  };

  // Main initialization effect
  useEffect(() => {
    console.log('🎯 Improved135Editor mounting...');

    // Check if resources are already available
    if (checkResourcesReady()) {
      console.log('Resources already available, initializing editor...');
      isResourcesLoaded.current = true;
      initEditor();
    } else {
      console.log('Resources not available, loading...');
      loadResources();
    }

    // Cleanup function
    return () => {
      console.log('🧹 Improved135Editor cleanup...');
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy();
          instanceRef.current = null;
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
      isInitialized.current = false;
    };
  }, []);

  // Effect to update content when prop changes
  useEffect(() => {
    // Store the content for when editor becomes ready
    pendingContent.current = content || '';

    // If editor is ready, update content immediately
    if (instanceRef.current && instanceRef.current.ready) {
      const currentContent = instanceRef.current.getContent();
      if (currentContent !== content) {
        console.log('📝 Updating editor content...');
        instanceRef.current.setContent(content || '');
      }
    } else {
      console.log('📝 Content updated, will set when editor is ready:', content?.substring(0, 100) + '...');
    }
  }, [content]);

  if (error) {
    return (
      <div className={`border border-red-300 rounded-md p-4 ${className}`} style={style}>
        <div className="text-center text-red-600">
          <p className="mb-2">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border border-gray-300 rounded-md p-4 ${className}`} style={{ height, ...style }}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading 135Editor...</p>
            <p className="text-gray-500 text-sm mt-2">{loadingStage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, ...style }}
    />
  );
});

Improved135Editor.displayName = 'Improved135Editor';

export default Improved135Editor;
