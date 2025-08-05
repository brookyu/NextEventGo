# Media Selector Component System

A unified, reusable media selection system for NextEvent applications, supporting images, videos, articles, and tags across different features like Event management, CloudVideo creation, and Article editing.

## 🚀 Quick Start

```typescript
import { MediaSelector, EventMediaSelector, CloudVideoMediaSelector } from '@/components/media';

// Basic usage
<MediaSelector
  selectedImageId={imageId}
  onImageSelect={setImageId}
  mediaTypes={{
    image: { enabled: true, label: 'Cover Image' },
    video: { enabled: false },
    article: { enabled: false },
    tag: { enabled: false }
  }}
/>

// Event-specific usage
<EventMediaSelector
  formOptions={{ setValue, trigger, setIsDirty }}
  showBannerImage={true}
  showPromotionalVideo={true}
  showEventTags={true}
/>

// CloudVideo-specific usage
<CloudVideoMediaSelector
  formOptions={{ setValue, trigger, setIsDirty }}
  showCoverImage={true}
  showVideoContent={true}
  showVideoTags={true}
/>
```

## 📁 File Structure

```
web/src/components/media/
├── MediaSelector.tsx           # Main unified component
├── EventMediaSelector.tsx     # Event-specific wrapper
├── CloudVideoMediaSelector.tsx # CloudVideo-specific wrapper
├── index.ts                   # Exports
├── README.md                  # This file
└── examples/
    ├── EventFormExample.tsx   # Complete event form example
    └── CloudVideoFormExample.tsx # Complete video form example

web/src/hooks/
└── useMediaSelector.ts        # State management hooks
```

## 🎯 Key Features

### ✅ Dual Mode Operation
- **Form Field Mode**: Select media for form fields
- **Editor Insertion Mode**: Insert media directly into 135Editor

### ✅ Flexible Configuration
- Enable/disable specific media types
- Custom labels and placeholders
- Multiple selection support (tags)

### ✅ Form Integration
- React Hook Form compatibility
- Validation support with Zod
- Dirty state tracking

### ✅ Type Safety
- Full TypeScript support
- Proper type definitions
- IntelliSense support

### ✅ Consistent UI
- Follows established design patterns
- Responsive design
- Accessible components

## 🔧 Components

### MediaSelector (Main Component)

The core component that provides unified media selection functionality.

**Props:**
- `editorRef` - Reference to 135Editor instance
- `mediaTypes` - Configuration for each media type
- `selectedImageId`, `selectedVideoId`, etc. - Current selections
- `onImageSelect`, `onVideoSelect`, etc. - Selection handlers
- `showToolbar` - Show/hide editor toolbar
- `toolbarTitle` - Custom toolbar title

### EventMediaSelector

Specialized component for event management with pre-configured media types.

**Props:**
- `formOptions` - Form integration options
- `showBannerImage`, `showPromotionalVideo`, etc. - Feature toggles
- All MediaSelector props

### CloudVideoMediaSelector

Specialized component for cloud video management with video-specific configurations.

**Props:**
- `formOptions` - Form integration options
- `showCoverImage`, `showVideoContent`, etc. - Feature toggles
- All MediaSelector props

## 🪝 Hooks

### useMediaSelector

Main hook for managing media selector state.

```typescript
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

- `useEventMediaSelector` - For event management
- `useCloudVideoMediaSelector` - For cloud video management
- `useArticleMediaSelector` - For article management

## 📝 Usage Examples

### Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { EventMediaSelector } from '@/components/media';

const EventForm = () => {
  const { setValue, trigger, watch } = useForm();
  const [isDirty, setIsDirty] = useState(false);

  return (
    <form>
      <EventMediaSelector
        formOptions={{
          setValue,
          trigger,
          setIsDirty,
          initialImageId: watch('bannerImageId'),
          initialTagIds: watch('eventTags') || [],
        }}
      />
    </form>
  );
};
```

### Editor Integration

```typescript
import { MediaSelector } from '@/components/media';
import Real135Editor from '@/components/editor/Real135Editor';

const ContentEditor = () => {
  const editorRef = useRef(null);

  return (
    <div className="border rounded-lg overflow-hidden">
      <MediaSelector
        editorRef={editorRef}
        showToolbar={true}
        toolbarTitle="Content Editor"
        mediaTypes={{
          image: { enabled: true },
          video: { enabled: true },
          article: { enabled: true }
        }}
      />
      
      <Real135Editor
        ref={editorRef}
        onChange={handleContentChange}
      />
    </div>
  );
};
```

### Custom Configuration

```typescript
const customMediaTypes = {
  image: {
    enabled: true,
    label: 'Hero Image',
    placeholder: 'Select hero image',
  },
  video: {
    enabled: false, // Disable videos
  },
  tag: {
    enabled: true,
    label: 'Product Tags',
    multiple: true,
  },
};

<MediaSelector mediaTypes={customMediaTypes} />
```

## 🎨 Styling

The components use Tailwind CSS classes and follow the established design system:

- `bg-gray-50` - Toolbar background
- `border-gray-200` - Borders
- `text-gray-700` - Text colors
- `shadow-sm`, `hover:shadow-md` - Shadows

## 🔍 Troubleshooting

### Common Issues

1. **Buttons triggering form submission**
   - Solution: Add `type="button"` to all buttons

2. **Editor not receiving insertions**
   - Check `editorRef` is properly passed
   - Verify editor instance with `getEditorInstance()`

3. **Form validation not triggering**
   - Ensure `trigger()` is called after selections
   - Check field names match form schema

4. **Media not loading**
   - Verify API endpoints are available
   - Check React Query configuration

### Debug Checklist

- [ ] Console shows insertion debug messages
- [ ] Editor instance exists and is ready
- [ ] API calls succeed in Network tab
- [ ] All required props are provided
- [ ] Form integration options are correct

## 🚀 Migration Guide

### From Individual Selectors

**Before:**
```typescript
import ImageSelector from '@/components/images/ImageSelector';
import VideoSelector from '@/components/video/VideoSelector';

<ImageSelector onImageSelect={handleImage} />
<VideoSelector onVideoSelect={handleVideo} />
```

**After:**
```typescript
import { MediaSelector } from '@/components/media';

<MediaSelector
  onImageSelect={handleImage}
  onVideoSelect={handleVideo}
  mediaTypes={{
    image: { enabled: true },
    video: { enabled: true },
    article: { enabled: false },
    tag: { enabled: false }
  }}
/>
```

## 📚 Related Documentation

- [Media Selectors Handoff Guide](../../docs/media-selectors-handoff-guide.md)
- [Media Selector Component Guide](../../docs/media-selector-component-guide.md)
- [135Editor Integration Guide](../editor/README.md)

## 🤝 Contributing

When adding new media types or features:

1. Update the `MediaType` union type
2. Add configuration to `defaultMediaTypes`
3. Implement selection logic in `MediaSelector`
4. Add specialized hooks if needed
5. Update documentation and examples
6. Add tests for new functionality

## 📄 License

Part of the NextEvent application suite.
