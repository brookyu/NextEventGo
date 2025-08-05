import React from 'react';
import MediaSelector, { type MediaSelectorProps } from './MediaSelector';
import { useCloudVideoMediaSelector, type UseMediaSelectorOptions } from '@/hooks/useMediaSelector';

// Specialized media selector for CloudVideo management
export interface CloudVideoMediaSelectorProps extends Omit<MediaSelectorProps, 
  'selectedImageId' | 'selectedVideoId' | 'selectedArticleId' | 'selectedTagIds' |
  'onImageSelect' | 'onVideoSelect' | 'onArticleSelect' | 'onTagsChange'
> {
  // Form integration options
  formOptions?: UseMediaSelectorOptions;
  
  // CloudVideo-specific configurations
  showCoverImage?: boolean;
  showVideoContent?: boolean;
  showSourceArticle?: boolean;
  showVideoTags?: boolean;
  showRelatedVideos?: boolean;
  
  // CloudVideo-specific handlers
  onCoverImageSelect?: (imageId: string | undefined) => void;
  onVideoContentSelect?: (videoId: string | undefined) => void;
  onSourceArticleSelect?: (articleId: string | undefined) => void;
  onVideoTagsChange?: (tagIds: string[]) => void;
}

export const CloudVideoMediaSelector: React.FC<CloudVideoMediaSelectorProps> = ({
  formOptions = {},
  showCoverImage = true,
  showVideoContent = true,
  showSourceArticle = true,
  showVideoTags = true,
  showRelatedVideos = false,
  onCoverImageSelect,
  onVideoContentSelect,
  onSourceArticleSelect,
  onVideoTagsChange,
  toolbarTitle = 'Video Content Editor',
  ...props
}) => {
  // Use the specialized hook for cloud video media management
  const {
    selectedImageId,
    selectedVideoId,
    selectedArticleId,
    selectedTagIds,
    handleImageSelect,
    handleVideoSelect,
    handleArticleSelect,
    handleTagsChange,
  } = useCloudVideoMediaSelector(formOptions);

  // Configure media types for cloud videos
  const cloudVideoMediaTypes = {
    image: {
      enabled: showCoverImage,
      label: 'Cover Image',
      icon: props.mediaTypes?.image?.icon || undefined,
      placeholder: 'Select video cover image',
    },
    video: {
      enabled: showVideoContent,
      label: 'Video Content',
      icon: props.mediaTypes?.video?.icon || undefined,
      placeholder: 'Select video content',
    },
    article: {
      enabled: showSourceArticle,
      label: 'Source Article',
      icon: props.mediaTypes?.article?.icon || undefined,
      placeholder: 'Select source article',
    },
    tag: {
      enabled: showVideoTags,
      label: 'Video Tags',
      icon: props.mediaTypes?.tag?.icon || undefined,
      placeholder: 'Select video tags',
      multiple: true,
    },
  };

  return (
    <MediaSelector
      {...props}
      mediaTypes={cloudVideoMediaTypes}
      toolbarTitle={toolbarTitle}
      selectedImageId={selectedImageId}
      selectedVideoId={selectedVideoId}
      selectedArticleId={selectedArticleId}
      selectedTagIds={selectedTagIds}
      onImageSelect={onCoverImageSelect || handleImageSelect}
      onVideoSelect={onVideoContentSelect || handleVideoSelect}
      onArticleSelect={onSourceArticleSelect || handleArticleSelect}
      onTagsChange={onVideoTagsChange || handleTagsChange}
    />
  );
};

export default CloudVideoMediaSelector;
