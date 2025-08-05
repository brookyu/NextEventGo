import { useState, useCallback } from 'react';
import type { SiteImage } from '@/api/images';
import type { VideoItem } from '@/api/videos';
import type { Article } from '@/api/articles';

// Hook for managing media selector state in forms
export interface UseMediaSelectorOptions {
  // Initial values
  initialImageId?: string;
  initialVideoId?: string;
  initialArticleId?: string;
  initialTagIds?: string[];
  
  // Form integration
  setValue?: (name: string, value: any) => void;
  trigger?: (name?: string) => void;
  setIsDirty?: (dirty: boolean) => void;
  
  // Field names for form integration
  imageFieldName?: string;
  videoFieldName?: string;
  articleFieldName?: string;
  tagsFieldName?: string;
}

export interface UseMediaSelectorReturn {
  // Current values
  selectedImageId?: string;
  selectedVideoId?: string;
  selectedArticleId?: string;
  selectedTagIds: string[];
  
  // Selection handlers
  handleImageSelect: (imageId: string | undefined) => void;
  handleVideoSelect: (videoId: string | undefined, video?: VideoItem) => void;
  handleArticleSelect: (articleId: string | undefined, article?: Article) => void;
  handleTagsChange: (tagIds: string[]) => void;
  
  // Insertion handlers (for editor)
  handleImageInsert: (image: SiteImage) => void;
  handleVideoInsert: (video: VideoItem) => void;
  handleArticleInsert: (article: Article) => void;
  
  // Reset function
  reset: () => void;
}

export const useMediaSelector = (options: UseMediaSelectorOptions = {}): UseMediaSelectorReturn => {
  const {
    initialImageId,
    initialVideoId,
    initialArticleId,
    initialTagIds = [],
    setValue,
    trigger,
    setIsDirty,
    imageFieldName = 'imageId',
    videoFieldName = 'videoId',
    articleFieldName = 'articleId',
    tagsFieldName = 'tags',
  } = options;

  // Local state
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(initialImageId);
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>(initialVideoId);
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>(initialArticleId);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialTagIds);

  // Image selection handler
  const handleImageSelect = useCallback((imageId: string | undefined) => {
    setSelectedImageId(imageId);
    
    if (setValue) {
      setValue(imageFieldName, imageId || '');
      trigger?.(imageFieldName);
      setIsDirty?.(true);
    }
  }, [setValue, trigger, setIsDirty, imageFieldName]);

  // Video selection handler
  const handleVideoSelect = useCallback((videoId: string | undefined, video?: VideoItem) => {
    setSelectedVideoId(videoId);
    
    if (setValue) {
      setValue(videoFieldName, videoId || '');
      // Optionally set additional video fields
      if (video) {
        setValue('videoUrl', video.url || '');
        setValue('videoTitle', video.title || '');
      }
      trigger?.(videoFieldName);
      setIsDirty?.(true);
    }
  }, [setValue, trigger, setIsDirty, videoFieldName]);

  // Article selection handler
  const handleArticleSelect = useCallback((articleId: string | undefined, article?: Article) => {
    setSelectedArticleId(articleId);
    
    if (setValue) {
      setValue(articleFieldName, articleId || '');
      // Optionally set additional article fields
      if (article) {
        setValue('articleTitle', article.title || '');
        setValue('articleUrl', article.url || '');
      }
      trigger?.(articleFieldName);
      setIsDirty?.(true);
    }
  }, [setValue, trigger, setIsDirty, articleFieldName]);

  // Tags change handler
  const handleTagsChange = useCallback((tagIds: string[]) => {
    setSelectedTagIds(tagIds);
    
    if (setValue) {
      setValue(tagsFieldName, tagIds);
      trigger?.(tagsFieldName);
      setIsDirty?.(true);
    }
  }, [setValue, trigger, setIsDirty, tagsFieldName]);

  // Editor insertion handlers (for when used with editor)
  const handleImageInsert = useCallback((image: SiteImage) => {
    console.log('Image inserted:', image);
    // Additional logic can be added here if needed
  }, []);

  const handleVideoInsert = useCallback((video: VideoItem) => {
    console.log('Video inserted:', video);
    // Additional logic can be added here if needed
  }, []);

  const handleArticleInsert = useCallback((article: Article) => {
    console.log('Article inserted:', article);
    // Additional logic can be added here if needed
  }, []);

  // Reset function
  const reset = useCallback(() => {
    setSelectedImageId(initialImageId);
    setSelectedVideoId(initialVideoId);
    setSelectedArticleId(initialArticleId);
    setSelectedTagIds(initialTagIds);
  }, [initialImageId, initialVideoId, initialArticleId, initialTagIds]);

  return {
    selectedImageId,
    selectedVideoId,
    selectedArticleId,
    selectedTagIds,
    handleImageSelect,
    handleVideoSelect,
    handleArticleSelect,
    handleTagsChange,
    handleImageInsert,
    handleVideoInsert,
    handleArticleInsert,
    reset,
  };
};

// Specialized hooks for common use cases

// Hook for Event management
export const useEventMediaSelector = (options: UseMediaSelectorOptions = {}) => {
  return useMediaSelector({
    ...options,
    imageFieldName: 'bannerImageId',
    videoFieldName: 'promotionalVideoId',
    articleFieldName: 'relatedArticleId',
    tagsFieldName: 'eventTags',
  });
};

// Hook for CloudVideo management
export const useCloudVideoMediaSelector = (options: UseMediaSelectorOptions = {}) => {
  return useMediaSelector({
    ...options,
    imageFieldName: 'coverImageId',
    videoFieldName: 'videoId',
    articleFieldName: 'sourceArticleId',
    tagsFieldName: 'videoTags',
  });
};

// Hook for Article management
export const useArticleMediaSelector = (options: UseMediaSelectorOptions = {}) => {
  return useMediaSelector({
    ...options,
    imageFieldName: 'featuredImageId',
    videoFieldName: 'featuredVideoId',
    articleFieldName: 'relatedArticleId',
    tagsFieldName: 'articleTags',
  });
};

export default useMediaSelector;
