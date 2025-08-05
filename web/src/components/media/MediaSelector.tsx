import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, Video as VideoIcon, FileText, Tag, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import ImageSelector from '@/components/images/ImageSelector';
import VideoSelector from '@/components/video/VideoSelector';
import SourceArticleSelector from '@/components/articles/SourceArticleSelector';
import { TagSelector } from '@/components/ui/TagSelector';

import { insertImageIntoEditor, insertVideoIntoEditor, insertWeChatReadMoreLink, getEditorInstance } from '@/utils/mediaInsertion';
import type { SiteImage } from '@/api/images';
import type { VideoItem } from '@/api/videos';
import type { Article } from '@/api/articles';

// Media types that can be selected
export type MediaType = 'image' | 'video' | 'article' | 'tag';

// Configuration for each media type
export interface MediaTypeConfig {
  enabled: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  multiple?: boolean;
}

// Props for the MediaSelector component
export interface MediaSelectorProps {
  // Editor integration
  editorRef?: React.RefObject<any>;
  
  // Media type configuration
  mediaTypes?: Partial<Record<MediaType, MediaTypeConfig>>;
  
  // Form field integration
  selectedImageId?: string;
  selectedVideoId?: string;
  selectedArticleId?: string;
  selectedTagIds?: string[];
  
  // Selection handlers for form fields
  onImageSelect?: (imageId: string | undefined) => void;
  onVideoSelect?: (videoId: string | undefined, video?: VideoItem) => void;
  onArticleSelect?: (articleId: string | undefined, article?: Article) => void;
  onTagsChange?: (tagIds: string[]) => void;
  
  // Insertion handlers for editor
  onImageInsert?: (image: SiteImage) => void;
  onVideoInsert?: (video: VideoItem) => void;
  onArticleInsert?: (article: Article) => void;
  
  // UI configuration
  showToolbar?: boolean;
  toolbarTitle?: string;
  className?: string;
  
  // Exclusions
  excludeArticleId?: string;
}

// Default media type configurations
const defaultMediaTypes: Record<MediaType, MediaTypeConfig> = {
  image: {
    enabled: true,
    label: 'Image',
    icon: ImageIcon,
    placeholder: 'Select image',
  },
  video: {
    enabled: true,
    label: 'Video',
    icon: VideoIcon,
    placeholder: 'Select video',
  },
  article: {
    enabled: true,
    label: 'Link',
    icon: FileText,
    placeholder: 'Select article',
  },
  tag: {
    enabled: true,
    label: 'Tags',
    icon: Tag,
    placeholder: 'Select tags',
    multiple: true,
  },
};

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  editorRef,
  mediaTypes = {},
  selectedImageId,
  selectedVideoId,
  selectedArticleId,
  selectedTagIds = [],
  onImageSelect,
  onVideoSelect,
  onArticleSelect,
  onTagsChange,
  onImageInsert,
  onVideoInsert,
  onArticleInsert,
  showToolbar = true,
  toolbarTitle = 'Content Editor',
  className,
  excludeArticleId,
}) => {
  // Merge default and custom media type configs
  const mergedMediaTypes = { ...defaultMediaTypes, ...mediaTypes };
  
  // Modal state for each media type
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [showArticleSelector, setShowArticleSelector] = useState(false);

  // Editor insertion handlers
  const handleImageInsert = useCallback((image: SiteImage) => {
    if (onImageInsert) {
      onImageInsert(image);
    } else if (editorRef) {
      const editor = getEditorInstance(editorRef);
      if (editor) {
        insertImageIntoEditor(editor, image, {
          alignment: 'center',
          maxWidth: 600,
          responsive: true,
        });
      }
    }
  }, [editorRef, onImageInsert]);

  const handleVideoInsert = useCallback((video: VideoItem) => {
    if (onVideoInsert) {
      onVideoInsert(video);
    } else if (editorRef) {
      const editor = getEditorInstance(editorRef);
      if (editor) {
        insertVideoIntoEditor(editor, video, {
          alignment: 'center',
          width: 560,
          height: 315,
          controls: true,
        });
      }
    }
  }, [editorRef, onVideoInsert]);

  const handleArticleInsert = useCallback((article: Article) => {
    if (onArticleInsert) {
      onArticleInsert(article);
    } else if (editorRef) {
      const editor = getEditorInstance(editorRef);
      if (editor) {
        insertWeChatReadMoreLink(editor, article);
      }
    }
  }, [editorRef, onArticleInsert]);

  // Render media toolbar
  const renderToolbar = () => {
    if (!showToolbar) return null;

    const enabledTypes = Object.entries(mergedMediaTypes).filter(([_, config]) => config.enabled);
    
    if (enabledTypes.length === 0) return null;

    return (
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">{toolbarTitle}</h3>
          <div className="flex gap-2">
            {enabledTypes.map(([type, config]) => {
              const Icon = config.icon;
              const handleClick = () => {
                switch (type) {
                  case 'image':
                    setShowImageSelector(true);
                    break;
                  case 'video':
                    setShowVideoSelector(true);
                    break;
                  case 'article':
                    setShowArticleSelector(true);
                    break;
                  default:
                    break;
                }
              };

              // Skip tag type in toolbar (handled separately)
              if (type === 'tag') return null;

              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  className="bg-white shadow-sm hover:shadow-md"
                  title={`Insert ${config.label}`}
                  type="button" // CRITICAL: Prevents form submission
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render form field selectors
  const renderFormFields = () => {
    const enabledTypes = Object.entries(mergedMediaTypes).filter(([_, config]) => config.enabled);
    
    return (
      <div className={className}>
        {enabledTypes.map(([type, config]) => {
          switch (type) {
            case 'image':
              if (!onImageSelect) return null;
              return (
                <div key={type} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {config.label}
                  </label>
                  <ImageSelector
                    selectedImageId={selectedImageId}
                    onImageSelect={onImageSelect}
                    placeholder={config.placeholder}
                  />
                </div>
              );

            case 'video':
              if (!onVideoSelect) return null;
              return (
                <div key={type} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {config.label}
                  </label>
                  <VideoSelector
                    selectedVideoId={selectedVideoId}
                    onVideoSelect={onVideoSelect}
                    placeholder={config.placeholder}
                    mode="single"
                  />
                </div>
              );

            case 'article':
              if (!onArticleSelect) return null;
              return (
                <div key={type} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {config.label}
                  </label>
                  <SourceArticleSelector
                    selectedArticleId={selectedArticleId}
                    onArticleSelect={onArticleSelect}
                    placeholder={config.placeholder}
                    excludeArticleId={excludeArticleId}
                  />
                </div>
              );

            case 'tag':
              if (!onTagsChange) return null;
              return (
                <div key={type} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {config.label}
                  </label>
                  <TagSelector
                    selectedTagIds={selectedTagIds}
                    onTagsChange={onTagsChange}
                    placeholder={config.placeholder}
                  />
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  };

  return (
    <>
      {/* Media Toolbar */}
      {renderToolbar()}
      
      {/* Form Field Selectors */}
      {renderFormFields()}

      {/* Image Selector Modal */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <ImageSelector
            contentOnly={true}
            onImageInsert={(image) => {
              handleImageInsert(image);
              setTimeout(() => setShowImageSelector(false), 100);
            }}
            placeholder="Select image to insert"
          />
        </DialogContent>
      </Dialog>

      {/* Video Selector Modal */}
      <Dialog open={showVideoSelector} onOpenChange={setShowVideoSelector}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Select Video</DialogTitle>
          </DialogHeader>
          <VideoSelector
            contentOnly={true}
            onVideoInsert={(video) => {
              handleVideoInsert(video);
              setTimeout(() => setShowVideoSelector(false), 100);
            }}
            placeholder="Select video to insert"
            mode="insert"
          />
        </DialogContent>
      </Dialog>

      {/* Article Selector Modal */}
      <Dialog open={showArticleSelector} onOpenChange={setShowArticleSelector}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Select Article</DialogTitle>
          </DialogHeader>
          <SourceArticleSelector
            contentOnly={true}
            onArticleInsert={(article) => {
              handleArticleInsert(article);
              setTimeout(() => setShowArticleSelector(false), 100);
            }}
            placeholder="Select article to link"
            excludeArticleId={excludeArticleId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaSelector;
