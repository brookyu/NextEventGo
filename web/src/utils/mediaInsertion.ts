import type { SiteImage } from '@/api/images';
import type { VideoItem, Article } from '@/types/article';

// Types for media insertion
export interface MediaInsertionOptions {
  width?: number;
  height?: number;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  alt?: string;
  className?: string;
  style?: string;
}

export interface VideoInsertionOptions extends MediaInsertionOptions {
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
}

// Image insertion utilities
export const insertImageIntoEditor = (
  editor: any,
  image: SiteImage,
  options: MediaInsertionOptions = {}
): void => {
  if (!editor || !image) return;

  const {
    width,
    height,
    alignment = 'center',
    caption,
    alt = image.name,
    className = '',
    style = ''
  } = options;

  // Build image attributes
  const attributes: string[] = [
    `src="${image.url}"`,
    `alt="${alt}"`,
    `data-image-id="${image.id}"`,
    `data-original-name="${image.originalName || image.name}"`
  ];

  if (width) attributes.push(`width="${width}"`);
  if (height) attributes.push(`height="${height}"`);
  if (className) attributes.push(`class="${className}"`);

  // Build style attribute
  const styles: string[] = [];
  if (alignment === 'center') styles.push('display: block', 'margin: 0 auto');
  if (alignment === 'left') styles.push('float: left', 'margin: 0 10px 10px 0');
  if (alignment === 'right') styles.push('float: right', 'margin: 0 0 10px 10px');
  if (style) styles.push(style);
  
  if (styles.length > 0) {
    attributes.push(`style="${styles.join('; ')}"`);
  }

  // Create image HTML
  let imageHtml = `<img ${attributes.join(' ')} />`;

  // Wrap with figure if caption is provided
  if (caption) {
    imageHtml = `
      <figure style="margin: 20px 0; text-align: ${alignment};">
        ${imageHtml}
        <figcaption style="margin-top: 8px; font-size: 14px; color: #666; text-align: center;">
          ${caption}
        </figcaption>
      </figure>
    `;
  } else if (alignment === 'center') {
    imageHtml = `<div style="text-align: center; margin: 20px 0;">${imageHtml}</div>`;
  }

  // Insert into editor
  try {
    console.log('Inserting image into editor:', {
      editorReady: editor.ready,
      editorType: editor.constructor?.name,
      imageUrl: image.url,
      imageHtml
    });

    // Ensure editor has focus before insertion
    if (editor.focus) {
      editor.focus();
    }

    // Insert the image
    editor.execCommand('insertHtml', imageHtml);

    console.log('Image inserted successfully');
  } catch (error) {
    console.error('Failed to insert image:', error);

    // Fallback: try alternative insertion methods
    try {
      if (editor.setContent && editor.getContent) {
        const currentContent = editor.getContent();
        const newContent = currentContent + imageHtml;
        editor.setContent(newContent);
        console.log('Image inserted using fallback method');
      }
    } catch (fallbackError) {
      console.error('Fallback insertion also failed:', fallbackError);
    }
  }
};

// Video insertion utilities
export const insertVideoIntoEditor = (
  editor: any,
  video: VideoItem,
  options: VideoInsertionOptions = {}
): void => {
  if (!editor || !video) return;

  const {
    width = 560,
    height = 315,
    alignment = 'center',
    caption,
    autoplay = false,
    controls = true,
    loop = false,
    muted = false,
    poster,
    className = '',
    style = ''
  } = options;

  // Determine video URL (prefer playbackUrl, fallback to cloudUrl or url)
  const videoUrl = video.playbackUrl || video.cloudUrl || video.url;
  if (!videoUrl) {
    console.error('No valid video URL found');
    return;
  }

  // Build video attributes
  const attributes: string[] = [
    `src="${videoUrl}"`,
    `width="${width}"`,
    `height="${height}"`,
    `data-video-id="${video.id}"`,
    `data-video-title="${video.title}"`
  ];

  if (controls) attributes.push('controls');
  if (autoplay) attributes.push('autoplay');
  if (loop) attributes.push('loop');
  if (muted) attributes.push('muted');
  if (poster || video.thumbnailUrl) attributes.push(`poster="${poster || video.thumbnailUrl}"`);
  if (className) attributes.push(`class="${className}"`);

  // Build style attribute
  const styles: string[] = [];
  if (alignment === 'center') styles.push('display: block', 'margin: 0 auto');
  if (alignment === 'left') styles.push('float: left', 'margin: 0 10px 10px 0');
  if (alignment === 'right') styles.push('float: right', 'margin: 0 0 10px 10px');
  if (style) styles.push(style);
  
  if (styles.length > 0) {
    attributes.push(`style="${styles.join('; ')}"`);
  }

  // Create video HTML
  let videoHtml = `<video ${attributes.join(' ')}>
    Your browser does not support the video tag.
  </video>`;

  // Wrap with figure if caption is provided
  if (caption) {
    videoHtml = `
      <figure style="margin: 20px 0; text-align: ${alignment};">
        ${videoHtml}
        <figcaption style="margin-top: 8px; font-size: 14px; color: #666; text-align: center;">
          ${caption}
        </figcaption>
      </figure>
    `;
  } else if (alignment === 'center') {
    videoHtml = `<div style="text-align: center; margin: 20px 0;">${videoHtml}</div>`;
  }

  // Insert into editor
  try {
    console.log('Inserting video into editor:', {
      editorReady: editor.ready,
      editorType: editor.constructor?.name,
      videoUrl,
      videoHtml
    });

    // Ensure editor has focus before insertion
    if (editor.focus) {
      editor.focus();
    }

    // Insert the video
    editor.execCommand('insertHtml', videoHtml);

    console.log('Video inserted successfully');
  } catch (error) {
    console.error('Failed to insert video:', error);

    // Fallback: try alternative insertion methods
    try {
      if (editor.setContent && editor.getContent) {
        const currentContent = editor.getContent();
        const newContent = currentContent + videoHtml;
        editor.setContent(newContent);
        console.log('Video inserted using fallback method');
      }
    } catch (fallbackError) {
      console.error('Fallback video insertion also failed:', fallbackError);
    }
  }
};

// WeChat-specific formatting utilities
export const insertWeChatReadMoreLink = (
  editor: any,
  article: Article,
  linkText?: string
): void => {
  if (!editor || !article) {
    console.error('Missing editor or article for link insertion');
    return;
  }

  // Create article URL
  const articleUrl = `http://placeholder.com/articles/view/${article.id}`;

  // Use article title as link text, or fallback to provided linkText or default
  const displayText = article.title || linkText || '阅读原文';

  // Create simple text link HTML
  const linkHtml = `<a href="${articleUrl}" target="_blank" style="color: #1890ff; text-decoration: underline;">${displayText}</a>`;

  // Insert into editor
  try {
    console.log('Inserting article link into editor:', {
      editorReady: editor.ready,
      editorType: editor.constructor?.name,
      articleId: article.id,
      articleTitle: article.title,
      articleUrl,
      linkHtml
    });

    // Ensure editor has focus before insertion
    if (editor.focus) {
      editor.focus();
    }

    // Insert the link
    editor.execCommand('insertHtml', linkHtml);

    console.log('Article link inserted successfully');
  } catch (error) {
    console.error('Failed to insert WeChat read more link:', error);

    // Fallback: try alternative insertion methods
    try {
      if (editor.setContent && editor.getContent) {
        const currentContent = editor.getContent();
        const newContent = currentContent + linkHtml;
        editor.setContent(newContent);
        console.log('Article link inserted using fallback method');
      }
    } catch (fallbackError) {
      console.error('Fallback link insertion also failed:', fallbackError);
    }
  }
};

// Template insertion utilities
export const insertImageGallery = (
  editor: any,
  images: SiteImage[],
  options: { columns?: number; spacing?: number; caption?: string } = {}
): void => {
  if (!editor || !images.length) return;

  const { columns = 3, spacing = 10, caption } = options;
  const columnWidth = `${(100 / columns) - (spacing * (columns - 1)) / columns}%`;

  let galleryHtml = `
    <div style="margin: 20px 0;">
      <div style="display: flex; flex-wrap: wrap; gap: ${spacing}px;">
  `;

  images.forEach((image, index) => {
    galleryHtml += `
      <div style="width: ${columnWidth}; flex: 0 0 ${columnWidth};">
        <img src="${image.url}" 
             alt="${image.name}" 
             data-image-id="${image.id}"
             style="width: 100%; height: auto; border-radius: 4px;" />
      </div>
    `;
  });

  galleryHtml += `
      </div>
      ${caption ? `
        <p style="margin-top: 15px; text-align: center; font-size: 14px; color: #666;">
          ${caption}
        </p>
      ` : ''}
    </div>
  `;

  // Insert into editor
  try {
    editor.execCommand('insertHtml', galleryHtml);
  } catch (error) {
    console.error('Failed to insert image gallery:', error);
  }
};

// Utility to get editor instance from various 135editor implementations
export const getEditorInstance = (editorRef: any): any => {
  console.log('Getting editor instance:', {
    editorRef: !!editorRef,
    current: !!editorRef?.current,
    windowUE: !!(typeof window !== 'undefined' && window.UE),
    currentEditor: !!(typeof window !== 'undefined' && (window as any).current_editor)
  });

  if (!editorRef?.current) {
    // Try to get the current editor from global window object
    if (typeof window !== 'undefined' && (window as any).current_editor) {
      console.log('Using global current_editor');
      return (window as any).current_editor;
    }
    return null;
  }

  // Try different ways to access the editor instance
  if (editorRef.current.getContent) {
    console.log('Using editorRef.current (has getContent)');
    return editorRef.current;
  }

  if (editorRef.current.editor) {
    console.log('Using editorRef.current.editor');
    return editorRef.current.editor;
  }

  if (editorRef.current.instance) {
    console.log('Using editorRef.current.instance');
    return editorRef.current.instance;
  }

  // Check for UEditor instance
  if (typeof window !== 'undefined' && window.UE) {
    // Try to get the current editor first
    if ((window as any).current_editor) {
      console.log('Using window.current_editor');
      return (window as any).current_editor;
    }

    const editors = window.UE.getEditor ? [window.UE.getEditor()] : [];
    if (editors.length > 0 && editors[0]) {
      console.log('Using UE.getEditor()');
      return editors[0];
    }
  }

  console.log('No editor instance found');
  return null;
};

// Validation utilities
export const validateImageForInsertion = (image: SiteImage): boolean => {
  if (!image || !image.url) return false;
  
  // Check if URL is accessible
  try {
    new URL(image.url);
    return true;
  } catch {
    return false;
  }
};

export const validateVideoForInsertion = (video: VideoItem): boolean => {
  if (!video) return false;
  
  const videoUrl = video.playbackUrl || video.cloudUrl || video.url;
  if (!videoUrl) return false;
  
  // Check if URL is accessible
  try {
    new URL(videoUrl);
    return true;
  } catch {
    return false;
  }
};

// Export all utilities
export default {
  insertImageIntoEditor,
  insertVideoIntoEditor,
  insertWeChatReadMoreLink,
  insertImageGallery,
  getEditorInstance,
  validateImageForInsertion,
  validateVideoForInsertion,
};
