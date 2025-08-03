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
  const editorId = useRef(`improved-135-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Script loading utility (based on Vue implementation)
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  // CSS loading utility
  const loadCSS = (href: string): void => {
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  // Initialize editor (based on Vue implementation)
  const initEditor = () => {
    if (isInitialized.current || !containerRef.current || !window.UE) {
      return;
    }

    try {
      isInitialized.current = true;
      setIsLoading(true);

      // Create script element for UEditor
      const scriptElement = document.createElement('script');
      scriptElement.id = editorId.current;
      scriptElement.type = 'text/plain';
      scriptElement.innerHTML = content || '';

      // Clear container and add script element
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(scriptElement);

      // Set up 135editor configuration
      const appkey = '604ef43c-500c-4015-b816-3974ac10c65d';
      window.BASEURL = 'https://www.135editor.com';
      window.PLAT135_URL = 'https://www.135editor.com';
      window.UEDITOR_HOME_URL = '/resource/135/';

      // Use setTimeout to ensure DOM is ready (similar to Vue's $nextTick)
      setTimeout(() => {
        try {
          // Create editor instance
          instanceRef.current = window.UE.getEditor(editorId.current, {
            UEDITOR_HOME_URL: '/resource/135/',
            plat_host: 'www.135editor.com',
            appkey: appkey,
            open_editor: true,
            pageLoad: true,
            lang: 'zh-cn',
            langPath: '/resource/135/lang/',
            style_url: window.BASEURL + '/editor_styles/open?inajax=1&appkey=' + appkey,
            page_url: window.BASEURL + '/editor_styles/open_styles?inajax=1&appkey=' + appkey,
            style_width: 340,
            uploadFormData: {
              referer: window.document.referrer
            },
            initialFrameHeight: parseInt(height) || 600,
            zIndex: 1000,
            focus: true,
            autoFloatEnabled: false,
            autoHeightEnabled: false,
            scaleEnabled: false,
            focusInEnd: true,
            removeStyle: false,
            ...config
          });

          // Set as current editor
          if (!window.current_editor) {
            window.current_editor = instanceRef.current;
          }

          // Add ready listener
          instanceRef.current.addListener('ready', () => {
            console.log('Improved 135Editor is ready!');
            setIsLoading(false);
            setError(null);

            // Set initial content if provided
            if (content && content !== instanceRef.current.getContent()) {
              instanceRef.current.setContent(content);
            }

            // Add content change listener
            instanceRef.current.addListener('contentChange', () => {
              const newContent = instanceRef.current.getContent();
              onChange(newContent);
            });
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
      }, 100); // Small delay to ensure DOM is ready

    } catch (error) {
      console.error('Failed to initialize 135Editor:', error);
      setError('Failed to initialize editor');
      setIsLoading(false);
      isInitialized.current = false;
    }
  };

  // Load resources sequentially (based on Vue implementation)
  const loadResources = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const basePath = '/resource/135/';

      // Load CSS first
      loadCSS(basePath + 'themes/96619a5672.css');

      // Load scripts sequentially (like Vue implementation)
      const scripts = [
        'ueditor.config.js',
        'third-party/jquery-3.3.1.min.js',
        'ueditor.all.min.js'
      ];

      // Load main scripts
      for (const script of scripts) {
        await loadScript(basePath + script);
      }

      // Skip the problematic language file for now
      // The a92d301d77.js file has issues with UE.I18N initialization
      // The editor should work fine with default English language
      console.log('Skipping language file to avoid I18N initialization errors');

      console.log('All 135Editor resources loaded successfully');

      // Initialize editor after all resources are loaded
      initEditor();

    } catch (error) {
      console.error('Failed to load 135Editor resources:', error);
      setError('Failed to load editor resources');
      setIsLoading(false);
    }
  };

  // Main initialization effect
  useEffect(() => {
    if (window.UE && typeof window.UE.getEditor === 'function') {
      // UE is already available, initialize directly
      console.log('UE already available, initializing editor...');
      initEditor();
    } else {
      // Load resources first
      console.log('UE not available, loading resources...');
      loadResources();
    }

    // Cleanup
    return () => {
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, []);

  // Effect to update content when prop changes
  useEffect(() => {
    if (instanceRef.current && instanceRef.current.ready) {
      const currentContent = instanceRef.current.getContent();
      if (currentContent !== content) {
        instanceRef.current.setContent(content || '');
      }
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
            <p className="text-gray-600">Loading 135Editor...</p>
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
