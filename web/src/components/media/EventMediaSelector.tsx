import React from 'react';
import MediaSelector, { type MediaSelectorProps } from './MediaSelector';
import { useEventMediaSelector, type UseMediaSelectorOptions } from '@/hooks/useMediaSelector';

// Specialized media selector for Event management
export interface EventMediaSelectorProps extends Omit<MediaSelectorProps, 
  'selectedImageId' | 'selectedVideoId' | 'selectedArticleId' | 'selectedTagIds' |
  'onImageSelect' | 'onVideoSelect' | 'onArticleSelect' | 'onTagsChange'
> {
  // Form integration options
  formOptions?: UseMediaSelectorOptions;
  
  // Event-specific configurations
  showBannerImage?: boolean;
  showPromotionalVideo?: boolean;
  showRelatedArticles?: boolean;
  showEventTags?: boolean;
  showGalleryImages?: boolean;
  
  // Event-specific handlers
  onBannerImageSelect?: (imageId: string | undefined) => void;
  onPromotionalVideoSelect?: (videoId: string | undefined) => void;
  onRelatedArticleSelect?: (articleId: string | undefined) => void;
  onEventTagsChange?: (tagIds: string[]) => void;
}

export const EventMediaSelector: React.FC<EventMediaSelectorProps> = ({
  formOptions = {},
  showBannerImage = true,
  showPromotionalVideo = true,
  showRelatedArticles = true,
  showEventTags = true,
  showGalleryImages = false,
  onBannerImageSelect,
  onPromotionalVideoSelect,
  onRelatedArticleSelect,
  onEventTagsChange,
  toolbarTitle = 'Event Content Editor',
  ...props
}) => {
  // Use the specialized hook for event media management
  const {
    selectedImageId,
    selectedVideoId,
    selectedArticleId,
    selectedTagIds,
    handleImageSelect,
    handleVideoSelect,
    handleArticleSelect,
    handleTagsChange,
  } = useEventMediaSelector(formOptions);

  // Configure media types for events
  const eventMediaTypes = {
    image: {
      enabled: showBannerImage,
      label: 'Banner Image',
      icon: props.mediaTypes?.image?.icon || undefined,
      placeholder: 'Select event banner image',
    },
    video: {
      enabled: showPromotionalVideo,
      label: 'Promotional Video',
      icon: props.mediaTypes?.video?.icon || undefined,
      placeholder: 'Select promotional video',
    },
    article: {
      enabled: showRelatedArticles,
      label: 'Related Article',
      icon: props.mediaTypes?.article?.icon || undefined,
      placeholder: 'Select related article',
    },
    tag: {
      enabled: showEventTags,
      label: 'Event Tags',
      icon: props.mediaTypes?.tag?.icon || undefined,
      placeholder: 'Select event tags',
      multiple: true,
    },
  };

  return (
    <MediaSelector
      {...props}
      mediaTypes={eventMediaTypes}
      toolbarTitle={toolbarTitle}
      selectedImageId={selectedImageId}
      selectedVideoId={selectedVideoId}
      selectedArticleId={selectedArticleId}
      selectedTagIds={selectedTagIds}
      onImageSelect={onBannerImageSelect || handleImageSelect}
      onVideoSelect={onPromotionalVideoSelect || handleVideoSelect}
      onArticleSelect={onRelatedArticleSelect || handleArticleSelect}
      onTagsChange={onEventTagsChange || handleTagsChange}
    />
  );
};

export default EventMediaSelector;
