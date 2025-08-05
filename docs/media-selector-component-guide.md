# Media Selector Component Guide

## Overview

The Media Selector component system provides a unified, reusable solution for selecting and inserting media (images, videos, articles, tags) across different features like Event management, CloudVideo creation, and Article editing.

## Architecture

### Core Components

1. **MediaSelector** - Main component with flexible configuration
2. **EventMediaSelector** - Specialized for event management
3. **CloudVideoMediaSelector** - Specialized for video content
4. **useMediaSelector** - Hook for state management
5. **Specialized hooks** - useEventMediaSelector, useCloudVideoMediaSelector

### Key Features

- **Dual Mode**: Form field selection + Editor insertion
- **Flexible Configuration**: Enable/disable specific media types
- **Form Integration**: Works with react-hook-form
- **Editor Integration**: Inserts media into 135Editor
- **Type Safety**: Full TypeScript support
- **Consistent UI**: Follows established design patterns

## Quick Start

### Basic Usage

```typescript
import { MediaSelector } from '@/components/media';

// Simple form field usage
<MediaSelector
  selectedImageId={formData.imageId}
  onImageSelect={(imageId) => setValue('imageId', imageId)}
  mediaTypes={{
    image: { enabled: true, label: 'Cover Image' },
    video: { enabled: false },
    article: { enabled: false },
    tag: { enabled: false }
  }}
/>
```

### With Editor Integration

```typescript
import { MediaSelector } from '@/components/media';

<MediaSelector
  editorRef={editorRef}
  showToolbar={true}
  toolbarTitle="Content Editor"
  mediaTypes={{
    image: { enabled: true, label: 'Image' },
    video: { enabled: true, label: 'Video' },
    article: { enabled: true, label: 'Link' }
  }}
/>
```

## Specialized Components

### Event Management

```typescript
import { EventMediaSelector } from '@/components/media';

<EventMediaSelector
  formOptions={{
    setValue,
    trigger,
    setIsDirty,
  }}
  showBannerImage={true}
  showPromotionalVideo={true}
  showRelatedArticles={true}
  showEventTags={true}
/>
```

### CloudVideo Management

```typescript
import { CloudVideoMediaSelector } from '@/components/media';

<CloudVideoMediaSelector
  formOptions={{
    setValue,
    trigger,
    setIsDirty,
  }}
  showCoverImage={true}
  showVideoContent={true}
  showSourceArticle={true}
  showVideoTags={true}
/>
```

## Hook Usage

### Basic Hook

```typescript
import { useMediaSelector } from '@/components/media';

const {
  selectedImageId,
  selectedVideoId,
  selectedTagIds,
  handleImageSelect,
  handleVideoSelect,
  handleTagsChange,
  reset
} = useMediaSelector({
  setValue,
  trigger,
  setIsDirty,
  imageFieldName: 'coverImageId',
  videoFieldName: 'videoId',
  tagsFieldName: 'tags'
});
```

### Specialized Hooks

```typescript
import { useEventMediaSelector, useCloudVideoMediaSelector } from '@/components/media';

// For events
const eventMedia = useEventMediaSelector({ setValue, trigger, setIsDirty });

// For cloud videos
const videoMedia = useCloudVideoMediaSelector({ setValue, trigger, setIsDirty });
```

## Complete Form Integration Example

### Event Create/Edit Form

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { EventMediaSelector } from '@/components/media';

interface EventFormData {
  title: string;
  description: string;
  bannerImageId?: string;
  promotionalVideoId?: string;
  relatedArticleId?: string;
  eventTags: string[];
}

export const EventForm: React.FC = () => {
  const { register, handleSubmit, setValue, trigger, watch } = useForm<EventFormData>();
  const [isDirty, setIsDirty] = useState(false);

  const onSubmit = (data: EventFormData) => {
    console.log('Event data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic fields */}
      <div>
        <label>Event Title</label>
        <input {...register('title', { required: true })} />
      </div>

      {/* Media selector */}
      <EventMediaSelector
        formOptions={{
          setValue,
          trigger,
          setIsDirty,
          initialImageId: watch('bannerImageId'),
          initialVideoId: watch('promotionalVideoId'),
          initialArticleId: watch('relatedArticleId'),
          initialTagIds: watch('eventTags') || [],
        }}
        className="space-y-4"
      />

      <button type="submit">Save Event</button>
    </form>
  );
};
```

### CloudVideo Create/Edit Form

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { CloudVideoMediaSelector } from '@/components/media';

interface CloudVideoFormData {
  title: string;
  description: string;
  coverImageId?: string;
  videoId?: string;
  sourceArticleId?: string;
  videoTags: string[];
}

export const CloudVideoForm: React.FC = () => {
  const { register, handleSubmit, setValue, trigger, watch } = useForm<CloudVideoFormData>();
  const [isDirty, setIsDirty] = useState(false);
  const editorRef = useRef(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic fields */}
      <div>
        <label>Video Title</label>
        <input {...register('title', { required: true })} />
      </div>

      {/* Media selector with editor */}
      <div className="border rounded-lg overflow-hidden">
        <CloudVideoMediaSelector
          editorRef={editorRef}
          formOptions={{
            setValue,
            trigger,
            setIsDirty,
            initialImageId: watch('coverImageId'),
            initialVideoId: watch('videoId'),
            initialArticleId: watch('sourceArticleId'),
            initialTagIds: watch('videoTags') || [],
          }}
          showToolbar={true}
          toolbarTitle="Video Description Editor"
          className="p-4 space-y-4"
        />
        
        {/* Editor component */}
        <div className="flex-1 bg-white">
          <Real135Editor
            ref={editorRef}
            initialContent={watch('description')}
            onChange={(content) => {
              setValue('description', content);
              setIsDirty(true);
            }}
            placeholder="Enter video description..."
          />
        </div>
      </div>

      <button type="submit">Save Video</button>
    </form>
  );
};
```

## Configuration Options

### MediaType Configuration

```typescript
interface MediaTypeConfig {
  enabled: boolean;           // Show/hide this media type
  label: string;             // Display label
  icon: React.ComponentType; // Icon component
  placeholder?: string;      // Placeholder text
  multiple?: boolean;        // Allow multiple selection (tags)
}
```

### Media Types

- **image**: Image selection with category filtering
- **video**: Video selection with thumbnail previews
- **article**: Article selection with search
- **tag**: Multi-select tag component

## Best Practices

### 1. Form Integration

```typescript
// Always provide form integration options
const formOptions = {
  setValue,        // react-hook-form setValue
  trigger,         // react-hook-form trigger
  setIsDirty,      // Mark form as dirty
  imageFieldName: 'coverImageId',  // Custom field names
  videoFieldName: 'videoId',
  tagsFieldName: 'tags'
};
```

### 2. Button Types

```typescript
// ALWAYS use type="button" to prevent form submission
<Button
  type="button"
  onClick={handleMediaAction}
>
  Insert Media
</Button>
```

### 3. Error Handling

```typescript
const handleMediaInsert = useCallback((media: any) => {
  try {
    // Insert media logic
    insertMediaIntoEditor(editor, media);
  } catch (error) {
    console.error('Failed to insert media:', error);
    // Show user notification
  }
}, []);
```

### 4. Performance

```typescript
// Use React.memo for expensive components
const OptimizedMediaSelector = React.memo(MediaSelector);

// Debounce search inputs
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Troubleshooting

### Common Issues

1. **Form validation triggering**: Add `type="button"` to all buttons
2. **Editor not found**: Check `editorRef` is properly passed
3. **Media not inserting**: Verify editor instance with `getEditorInstance()`
4. **Empty dropdowns**: Ensure React Query is enabled
5. **Modal won't close**: Add timeout before closing modal

### Debug Checklist

1. Check console for insertion debug messages
2. Verify editor instance exists
3. Check API calls in Network tab
4. Validate all required props
5. Test with real data

## API Requirements

The components expect these API endpoints:

- `GET /api/v2/images` - Image listing
- `GET /api/v2/videos` - Video listing  
- `GET /api/v2/articles` - Article listing
- `GET /api/v2/categories` - Category listing
- `GET /api/v2/tags` - Tag listing

## Migration from Existing Selectors

### Before (Individual Selectors)

```typescript
import ImageSelector from '@/components/images/ImageSelector';
import VideoSelector from '@/components/video/VideoSelector';
import { TagSelector } from '@/components/ui/TagSelector';

// Multiple separate components
<ImageSelector onImageSelect={handleImage} />
<VideoSelector onVideoSelect={handleVideo} />
<TagSelector onTagsChange={handleTags} />
```

### After (Unified Selector)

```typescript
import { MediaSelector } from '@/components/media';

// Single unified component
<MediaSelector
  onImageSelect={handleImage}
  onVideoSelect={handleVideo}
  onTagsChange={handleTags}
  mediaTypes={{
    image: { enabled: true },
    video: { enabled: true },
    tag: { enabled: true },
    article: { enabled: false }
  }}
/>
```

This unified approach provides better consistency, easier maintenance, and more flexible configuration options.

## Advanced Usage Examples

### Custom Media Type Configuration

```typescript
// Custom configuration for specific use cases
const customMediaTypes = {
  image: {
    enabled: true,
    label: 'Hero Image',
    placeholder: 'Select hero image for landing page',
  },
  video: {
    enabled: true,
    label: 'Demo Video',
    placeholder: 'Select product demo video',
  },
  article: {
    enabled: false, // Disable articles for this use case
  },
  tag: {
    enabled: true,
    label: 'Product Tags',
    placeholder: 'Select product categories',
    multiple: true,
  },
};

<MediaSelector
  mediaTypes={customMediaTypes}
  toolbarTitle="Product Content Editor"
/>
```

### Multiple Image Selection

```typescript
// For gallery or multiple image selection
const [selectedImages, setSelectedImages] = useState<string[]>([]);

const handleImageSelect = (imageId: string | undefined) => {
  if (imageId && !selectedImages.includes(imageId)) {
    setSelectedImages(prev => [...prev, imageId]);
  }
};

const handleImageRemove = (imageId: string) => {
  setSelectedImages(prev => prev.filter(id => id !== imageId));
};

// Display selected images
{selectedImages.map(imageId => (
  <div key={imageId} className="relative">
    <img src={getImageUrl(imageId)} alt="" />
    <button onClick={() => handleImageRemove(imageId)}>
      <X className="w-4 h-4" />
    </button>
  </div>
))}
```

### Conditional Media Types

```typescript
// Enable different media types based on user role or feature flags
const getUserMediaTypes = (userRole: string, featureFlags: any) => ({
  image: {
    enabled: true,
    label: 'Image',
  },
  video: {
    enabled: userRole === 'admin' || featureFlags.videoEnabled,
    label: 'Video',
  },
  article: {
    enabled: featureFlags.articleLinking,
    label: 'Related Article',
  },
  tag: {
    enabled: true,
    label: 'Tags',
    multiple: true,
  },
});

<MediaSelector
  mediaTypes={getUserMediaTypes(user.role, featureFlags)}
/>
```

### Integration with Validation

```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Form schema with media validation
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bannerImageId: z.string().optional(),
  promotionalVideoId: z.string().optional(),
  eventTags: z.array(z.string()).min(1, 'At least one tag is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const { register, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
  resolver: zodResolver(eventSchema),
});

// Trigger validation after media selection
const handleImageSelect = useCallback((imageId: string | undefined) => {
  setValue('bannerImageId', imageId);
  trigger('bannerImageId'); // Validate this field
}, [setValue, trigger]);
```
