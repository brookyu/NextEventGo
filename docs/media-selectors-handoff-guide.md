# Media Selectors Handoff Guide

## Overview

This guide provides comprehensive instructions for programming agents on how to effectively implement and use the media selector components (ImageSelector, VideoSelector, SourceArticleSelector, TagSelector) in new features like CloudVideo create/edit and Event create/edit.

## Architecture Overview

### Core Components
- **ImageSelector**: Searchable image grid with category filtering
- **VideoSelector**: Video grid with thumbnail previews and category support
- **SourceArticleSelector**: Article selection with search and category filtering
- **TagSelector**: Multi-select tag component with search functionality
- **mediaInsertion.ts**: Utility functions for editor integration

### Key Design Patterns
1. **contentOnly Mode**: Renders selector content without Dialog wrapper
2. **Dual Functionality**: Supports both selection (form fields) and insertion (editor)
3. **Event Prevention**: Prevents form validation triggers
4. **Query Enablement**: React Query enabled based on component state

## Implementation Guide

### 1. Basic Selector Usage

#### Form Field Mode (Default)
```typescript
<ImageSelector
  selectedImageId={formData.imageId}
  onImageSelect={(imageId) => setValue('imageId', imageId)}
  placeholder="Select cover image"
/>
```

#### Content-Only Mode (For Modals)
```typescript
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
```

### 2. Required Props and Interfaces

#### ImageSelector Props
```typescript
interface ImageSelectorProps {
  selectedImageId?: string;
  onImageSelect: (imageId: string | undefined) => void;
  onImageInsert?: (image: SiteImage) => void; // For editor insertion
  placeholder?: string;
  className?: string;
  contentOnly?: boolean; // Render without Dialog wrapper
}
```

#### VideoSelector Props
```typescript
interface VideoSelectorProps {
  selectedVideoId?: string;
  onVideoSelect: (videoId: string | undefined, video?: VideoItem) => void;
  onVideoInsert?: (video: VideoItem) => void; // For editor insertion
  placeholder?: string;
  className?: string;
  mode?: VideoSelectorMode; // 'single' | 'insert' | 'inline'
  contentOnly?: boolean;
  showUpload?: boolean;
  showPreview?: boolean;
  allowClear?: boolean;
}
```

#### SourceArticleSelector Props
```typescript
interface SourceArticleSelectorProps {
  selectedArticleId?: string;
  onArticleSelect: (articleId: string | undefined, article?: Article) => void;
  onArticleInsert?: (article: Article) => void; // For editor insertion
  placeholder?: string;
  className?: string;
  title?: string;
  allowClear?: boolean;
  excludeArticleId?: string; // Exclude current item from selection
  contentOnly?: boolean;
}
```

### 3. Media Insertion Toolbar Pattern

#### Implementation Template
```typescript
{/* Media Insertion Toolbar */}
{!showPreview && (
  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium text-gray-700">Content Editor</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageSelector(true)}
          className="bg-white shadow-sm hover:shadow-md"
          title="Insert Image"
          type="button" // CRITICAL: Prevents form submission
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          Image
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVideoSelector(true)}
          className="bg-white shadow-sm hover:shadow-md"
          title="Insert Video"
          type="button" // CRITICAL: Prevents form submission
        >
          <VideoIcon className="w-4 h-4 mr-1" />
          Video
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSourceArticleSelector(true)}
          className="bg-white shadow-sm hover:shadow-md"
          title="Insert Link"
          type="button" // CRITICAL: Prevents form submission
        >
          <FileText className="w-4 h-4 mr-1" />
          Link
        </Button>
      </div>
    </div>
  </div>
)}
```

### 4. State Management Pattern

#### Required State Variables
```typescript
const [showImageSelector, setShowImageSelector] = useState(false);
const [showVideoSelector, setShowVideoSelector] = useState(false);
const [showSourceArticleSelector, setShowSourceArticleSelector] = useState(false);
```

#### Handler Functions
```typescript
const handleImageInsert = useCallback((image: SiteImage) => {
  const editor = getEditorInstance(editorRef);
  if (editor) {
    insertImageIntoEditor(editor, image, {
      alignment: 'center',
      maxWidth: 600,
      responsive: true,
    });
  }
}, []);

const handleVideoInsert = useCallback((video: VideoItem) => {
  const editor = getEditorInstance(editorRef);
  if (editor) {
    insertVideoIntoEditor(editor, video, {
      alignment: 'center',
      width: 560,
      height: 315,
      controls: true,
    });
  }
}, []);

const handleSourceArticleInsert = useCallback((article: Article) => {
  const editor = getEditorInstance(editorRef);
  if (editor) {
    insertWeChatReadMoreLink(editor, article);
  }
}, []);
```

### 5. Critical Implementation Details

#### Form Validation Prevention
**ALWAYS** add `type="button"` to all buttons inside forms:
```typescript
<Button
  type="button" // CRITICAL: Prevents form submission
  onClick={handleAction}
>
  Action
</Button>
```

#### Event Prevention in Selectors
```typescript
const handleItemSelect = (item: any, event?: React.MouseEvent) => {
  // CRITICAL: Prevent form submission and event propagation
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (onItemInsert) {
    onItemInsert(item);
  } else {
    onItemSelect(item.id, item);
  }
  setIsOpen(false);
};
```

#### React Query Enablement
```typescript
const { data: items, isLoading } = useQuery({
  queryKey: ['items', searchParams],
  queryFn: () => api.getItems(searchParams),
  enabled: contentOnly || isOpen, // CRITICAL: Enable for contentOnly mode
});
```

#### Modal Timing
```typescript
onItemInsert={(item) => {
  handleItemInsert(item);
  // CRITICAL: Add delay to ensure insertion completes
  setTimeout(() => {
    setShowSelector(false);
  }, 100);
}}
```

## Use Case Implementations

### CloudVideo Create/Edit Implementation

#### Required Imports
```typescript
import ImageSelector from '@/components/images/ImageSelector';
import VideoSelector from '@/components/video/VideoSelector';
import { TagSelector } from '@/components/ui/TagSelector';
import { insertImageIntoEditor, insertVideoIntoEditor, getEditorInstance } from '@/utils/mediaInsertion';
```

#### Form Integration
```typescript
// Cover image selection
<ImageSelector
  selectedImageId={watch('coverImageId')}
  onImageSelect={(imageId) => {
    setValue('coverImageId', imageId || '');
    setIsDirty(true);
  }}
  placeholder="Select cover image"
/>

// Video content selection
<VideoSelector
  selectedVideoId={watch('videoId')}
  onVideoSelect={(videoId, video) => {
    setValue('videoId', videoId || '');
    setValue('videoUrl', video?.url || '');
    setIsDirty(true);
  }}
  placeholder="Select video content"
  mode="single"
/>

// Tags selection
<TagSelector
  selectedTags={watch('tags') || []}
  onTagsChange={(tags) => {
    setValue('tags', tags);
    setIsDirty(true);
  }}
  placeholder="Select tags"
  maxTags={10}
/>
```

#### Editor Integration (for description/content fields)
```typescript
{/* Media Insertion Toolbar */}
{!showPreview && (
  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
    <div className="flex justify-between items-center">
      <h3 className="text-sm font-medium text-gray-700">Description Editor</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageSelector(true)}
          type="button"
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          Image
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVideoSelector(true)}
          type="button"
        >
          <VideoIcon className="w-4 h-4 mr-1" />
          Video
        </Button>
      </div>
    </div>
  </div>
)}

{/* Editor Component */}
<div className="flex-1 bg-white relative">
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
```

### Event Create/Edit Implementation

#### Event-Specific Form Fields
```typescript
// Event banner image
<ImageSelector
  selectedImageId={watch('bannerImageId')}
  onImageSelect={(imageId) => {
    setValue('bannerImageId', imageId || '');
    setIsDirty(true);
  }}
  placeholder="Select event banner"
/>

// Event gallery images (multiple selection)
<ImageSelector
  selectedImageId={watch('galleryImageIds')?.[0]} // Handle multiple selection
  onImageSelect={(imageId) => {
    const currentGallery = watch('galleryImageIds') || [];
    if (imageId && !currentGallery.includes(imageId)) {
      setValue('galleryImageIds', [...currentGallery, imageId]);
      setIsDirty(true);
    }
  }}
  placeholder="Add to event gallery"
  mode="inline"
/>

// Related articles/resources
<SourceArticleSelector
  selectedArticleId={watch('relatedArticleId')}
  onArticleSelect={(articleId, article) => {
    setValue('relatedArticleId', articleId || '');
    setValue('relatedArticleTitle', article?.title || '');
    setIsDirty(true);
  }}
  placeholder="Select related article"
  excludeArticleId={id} // Exclude current event if editing
/>
```

## Common Patterns and Best Practices

### 1. Error Handling Pattern
```typescript
const handleMediaInsert = useCallback((media: any) => {
  try {
    const editor = getEditorInstance(editorRef);
    if (!editor) {
      console.error('Editor instance not found');
      return;
    }

    // Insert media with appropriate function
    insertImageIntoEditor(editor, media, options);

    console.log('Media inserted successfully');
  } catch (error) {
    console.error('Failed to insert media:', error);
    // Optional: Show user notification
  }
}, []);
```

### 2. Loading State Management
```typescript
const [isInserting, setIsInserting] = useState(false);

const handleMediaInsert = useCallback(async (media: any) => {
  setIsInserting(true);
  try {
    await insertMedia(media);
  } finally {
    setIsInserting(false);
    setShowSelector(false);
  }
}, []);
```

### 3. Validation Integration
```typescript
// Form schema with media fields
const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  coverImageId: z.string().optional(),
  videoId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().min(1, 'Content is required'),
});

// Validation trigger after media selection
const handleImageSelect = useCallback((imageId: string) => {
  setValue('coverImageId', imageId);
  trigger('coverImageId'); // Trigger validation for this field
  setIsDirty(true);
}, [setValue, trigger]);
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Redundant Button" Issue
**Problem**: Selector shows trigger button inside modal
**Solution**: Use `contentOnly={true}` prop
```typescript
<ImageSelector contentOnly={true} onImageInsert={handleInsert} />
```

#### 2. "Form Validation Triggering" Issue
**Problem**: Clicking media buttons triggers form validation
**Solution**: Add `type="button"` to all buttons
```typescript
<Button type="button" onClick={handleAction}>Action</Button>
```

#### 3. "Empty Dropdown" Issue
**Problem**: Category/tag dropdowns are empty
**Solution**: Ensure React Query is enabled
```typescript
enabled: contentOnly || isOpen, // Enable query for contentOnly mode
```

#### 4. "Nothing Inserted" Issue
**Problem**: Selection works but nothing appears in editor
**Solution**: Check editor instance and add debugging
```typescript
const editor = getEditorInstance(editorRef);
console.log('Editor instance:', editor);
if (!editor) {
  console.error('Editor not found');
  return;
}
```

#### 5. "Modal Won't Close" Issue
**Problem**: Modal stays open after selection
**Solution**: Add timeout before closing
```typescript
setTimeout(() => setShowSelector(false), 100);
```

### Debugging Checklist

1. **Check Console Logs**: Look for insertion debug messages
2. **Verify Editor Instance**: Ensure `getEditorInstance()` returns valid editor
3. **Check API Calls**: Verify data is loading in Network tab
4. **Test Button Types**: Ensure all buttons have `type="button"`
5. **Validate Props**: Confirm all required props are passed correctly

## API Integration Requirements

### Required API Endpoints
- `GET /api/v2/images` - Image listing with search/filter
- `GET /api/v2/videos` - Video listing with search/filter
- `GET /api/v2/articles` - Article listing with search/filter
- `GET /api/v2/categories` - Category listing
- `GET /api/v2/tags` - Tag listing

### Expected Response Formats
```typescript
// Images API Response
interface ImagesResponse {
  data: SiteImage[];
  total: number;
  page: number;
  limit: number;
}

// Videos API Response
interface VideosResponse {
  data: VideoItem[];
  total: number;
  page: number;
  limit: number;
}

// Articles API Response
interface ArticlesResponse {
  data: Article[];
  total: number;
  page: number;
  limit: number;
}
```

## Performance Considerations

### 1. Query Optimization
- Use appropriate `limit` values (20-50 items per page)
- Implement search debouncing (300ms delay)
- Enable queries only when needed (`enabled` prop)

### 2. Image Optimization
- Use thumbnail URLs for grid display
- Implement lazy loading for large lists
- Compress images before insertion

### 3. Memory Management
- Clean up event listeners in useEffect cleanup
- Avoid storing large objects in component state
- Use React.memo for expensive components

## Security Considerations

### 1. Input Validation
- Validate all media URLs before insertion
- Sanitize user input in search fields
- Check file types and sizes

### 2. XSS Prevention
- Escape HTML content in editor insertion
- Validate media URLs against allowed domains
- Use CSP headers for additional protection

This guide provides the foundation for implementing media selectors in CloudVideo and Event features. Follow these patterns for consistent, reliable functionality.
