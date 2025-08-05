// Main MediaSelector component
export { default as MediaSelector } from './MediaSelector';
export type { MediaSelectorProps, MediaType, MediaTypeConfig } from './MediaSelector';

// Specialized components
export { default as EventMediaSelector } from './EventMediaSelector';
export type { EventMediaSelectorProps } from './EventMediaSelector';

export { default as CloudVideoMediaSelector } from './CloudVideoMediaSelector';
export type { CloudVideoMediaSelectorProps } from './CloudVideoMediaSelector';

// Hooks
export { 
  default as useMediaSelector,
  useEventMediaSelector,
  useCloudVideoMediaSelector,
  useArticleMediaSelector
} from '@/hooks/useMediaSelector';
export type { 
  UseMediaSelectorOptions, 
  UseMediaSelectorReturn 
} from '@/hooks/useMediaSelector';

// Re-export existing selectors for convenience
export { default as ImageSelector } from '@/components/images/ImageSelector';
export { default as VideoSelector } from '@/components/video/VideoSelector';
export { default as SourceArticleSelector } from '@/components/articles/SourceArticleSelector';
export { TagSelector } from '@/components/ui/TagSelector';
