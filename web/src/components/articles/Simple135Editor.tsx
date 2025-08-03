import React, { useEffect, useRef } from 'react';

interface Simple135EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const Simple135Editor: React.FC<Simple135EditorProps> = ({
  content = '',
  onChange = () => {},
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initEditor = () => {
      if (isInitialized.current || !window.UE || !containerRef.current) {
        return;
      }

      try {
        isInitialized.current = true;

        // Create the script element exactly like the working example
        const scriptElement = document.createElement('script');
        scriptElement.id = 'simple-135-editor';
        scriptElement.type = 'text/plain';
        scriptElement.innerHTML = content;
        
        containerRef.current.appendChild(scriptElement);

        // Set globals exactly like working example
        const appkey = '604ef43c-500c-4015-b816-3974ac10c65d';
        window.BASEURL = 'https://www.135editor.com';

        // Create editor with exact same config as working example
        editorRef.current = window.UE.getEditor('simple-135-editor', {
          plat_host: 'www.135editor.com',
          appkey: appkey,
          open_editor: true,
          pageLoad: true,
          style_url: window.BASEURL + '/editor_styles/open?inajax=1&appkey=' + appkey,
          page_url: window.BASEURL + '/editor_styles/open_styles?inajax=1&appkey=' + appkey,
          style_width: 340,
          uploadFormData: {
            'referer': window.document.referrer
          },
          initialFrameHeight: 680,
          zIndex: 1000,
          focus: true,
          autoFloatEnabled: false,
          autoHeightEnabled: false,
          scaleEnabled: false,
          focusInEnd: true,
        });

        // Set as current editor
        window.current_editor = editorRef.current;

        // Add event listeners
        editorRef.current.addListener('ready', () => {
          console.log('Simple 135Editor is ready!');
          
          if (content) {
            editorRef.current.setContent(content);
          }

          editorRef.current.addListener('contentChange', () => {
            const newContent = editorRef.current.getContent();
            onChange(newContent);
          });
        });

        editorRef.current.addListener('error', (error: any) => {
          console.error('Simple 135Editor error:', error);
        });

      } catch (error) {
        console.error('Failed to initialize Simple 135Editor:', error);
      }
    };

    // Check if scripts are loaded
    if (window.UE) {
      initEditor();
    } else {
      // Wait for scripts to load
      const checkInterval = setInterval(() => {
        if (window.UE) {
          clearInterval(checkInterval);
          initEditor();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          console.error('Error destroying editor:', error);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
    />
  );
};

export default Simple135Editor;
