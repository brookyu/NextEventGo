# Article and Image Selection for News Creation

This document describes the article and image selection functionality for creating news publications in the NextEvent system.

## Overview

The article and image selection feature allows users to:
- Search and select articles to include in news publications
- Search and select images for news covers and thumbnails
- Bind selected articles and images to create comprehensive news content
- Preview and manage selections before creating news

## API Endpoints

### Article Selection

#### Search Articles for Selection
```
GET /api/v2/news/articles/search
```

**Query Parameters:**
- `query` (string, optional) - Search query for article title or summary
- `categoryId` (UUID, optional) - Filter by category ID
- `author` (string, optional) - Filter by author name
- `isPublished` (boolean, optional) - Filter by publication status
- `page` (integer, default: 1) - Page number for pagination
- `pageSize` (integer, default: 20, max: 100) - Number of items per page
- `sortBy` (string, default: "created_at") - Sort field
- `sortOrder` (string, default: "desc") - Sort order (asc/desc)

**Response:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Article Title",
      "summary": "Article summary",
      "author": "Author Name",
      "categoryId": "uuid",
      "categoryName": "Category Name",
      "frontCoverImageUrl": "image-url",
      "isPublished": true,
      "publishedAt": "2024-01-01T00:00:00Z",
      "viewCount": 100,
      "readCount": 50,
      "tags": ["tag1", "tag2"],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "isSelected": false
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Image Selection

#### Search Images for Selection
```
GET /api/v2/news/images/search
```

**Query Parameters:**
- `query` (string, optional) - Search query for filename, alt text, or description
- `mimeType` (string, optional) - Filter by MIME type (e.g., "image/jpeg")
- `minWidth` (integer, optional) - Minimum image width
- `maxWidth` (integer, optional) - Maximum image width
- `minHeight` (integer, optional) - Minimum image height
- `maxHeight` (integer, optional) - Maximum image height
- `page` (integer, default: 1) - Page number for pagination
- `pageSize` (integer, default: 20, max: 100) - Number of items per page
- `sortBy` (string, default: "created_at") - Sort field
- `sortOrder` (string, default: "desc") - Sort order (asc/desc)

**Response:**
```json
{
  "images": [
    {
      "id": "uuid",
      "filename": "image.jpg",
      "originalUrl": "full-image-url",
      "thumbnailUrl": "thumbnail-url",
      "fileSize": 1024000,
      "mimeType": "image/jpeg",
      "width": 1920,
      "height": 1080,
      "altText": "Image description",
      "description": "Detailed description",
      "createdAt": "2024-01-01T00:00:00Z",
      "isSelected": false
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Data Transfer Objects (DTOs)

### ArticleSelectionDTO
```go
type ArticleSelectionDTO struct {
    ID                 uuid.UUID  `json:"id"`
    Title              string     `json:"title"`
    Summary            string     `json:"summary"`
    Author             string     `json:"author"`
    CategoryID         uuid.UUID  `json:"categoryId"`
    CategoryName       string     `json:"categoryName"`
    FrontCoverImageURL string     `json:"frontCoverImageUrl"`
    IsPublished        bool       `json:"isPublished"`
    PublishedAt        *time.Time `json:"publishedAt"`
    ViewCount          int64      `json:"viewCount"`
    ReadCount          int64      `json:"readCount"`
    Tags               []string   `json:"tags"`
    CreatedAt          time.Time  `json:"createdAt"`
    UpdatedAt          *time.Time `json:"updatedAt"`
    
    // Selection state
    IsSelected bool `json:"isSelected"`
    
    // News-specific settings when selected
    IsMainStory   bool   `json:"isMainStory"`
    IsFeatured    bool   `json:"isFeatured"`
    Section       string `json:"section"`
    CustomSummary string `json:"customSummary"`
}
```

### ImageSelectionDTO
```go
type ImageSelectionDTO struct {
    ID           uuid.UUID `json:"id"`
    Filename     string    `json:"filename"`
    OriginalURL  string    `json:"originalUrl"`
    ThumbnailURL string    `json:"thumbnailUrl"`
    FileSize     int64     `json:"fileSize"`
    MimeType     string    `json:"mimeType"`
    Width        int       `json:"width"`
    Height       int       `json:"height"`
    AltText      string    `json:"altText"`
    Description  string    `json:"description"`
    CreatedAt    time.Time `json:"createdAt"`
    
    // Selection state
    IsSelected bool `json:"isSelected"`
}
```

## Frontend Integration

### Basic Usage

```javascript
// Search articles
async function searchArticles(query, page = 1) {
    const params = new URLSearchParams({
        query: query,
        page: page,
        pageSize: 20
    });
    
    const response = await fetch(`/api/v2/news/articles/search?${params}`);
    const data = await response.json();
    return data;
}

// Search images
async function searchImages(query, page = 1) {
    const params = new URLSearchParams({
        query: query,
        page: page,
        pageSize: 20
    });
    
    const response = await fetch(`/api/v2/news/images/search?${params}`);
    const data = await response.json();
    return data;
}
```

### Selection Management

```javascript
class SelectionManager {
    constructor() {
        this.selectedArticles = new Set();
        this.selectedImages = new Set();
    }
    
    toggleArticle(articleId) {
        if (this.selectedArticles.has(articleId)) {
            this.selectedArticles.delete(articleId);
        } else {
            this.selectedArticles.add(articleId);
        }
        this.updateUI();
    }
    
    toggleImage(imageId) {
        if (this.selectedImages.has(imageId)) {
            this.selectedImages.delete(imageId);
        } else {
            this.selectedImages.add(imageId);
        }
        this.updateUI();
    }
    
    getSelectedData() {
        return {
            articles: Array.from(this.selectedArticles),
            images: Array.from(this.selectedImages)
        };
    }
}
```

### News Creation with Selectors

#### Create News with Selected Articles and Images
```
POST /api/v2/news/create-with-selectors
```

**Request Body:**
```json
{
  "title": "Breaking News Title",
  "subtitle": "News subtitle",
  "summary": "Brief summary",
  "description": "Detailed description",
  "type": "breaking",
  "priority": "high",
  "selectedArticleIds": ["uuid1", "uuid2"],
  "featuredImageId": "image-uuid",
  "thumbnailImageId": "thumbnail-uuid",
  "categoryIds": ["category-uuid"],
  "allowComments": true,
  "allowSharing": true,
  "isFeatured": true,
  "isBreaking": true,
  "requireAuth": false
}
```

**Response:**
```json
{
  "id": "news-uuid",
  "title": "Breaking News Title",
  "status": "created",
  "message": "News created successfully with selected articles and images",
  "createdArticles": 2,
  "processedImages": 2
}
```

## Testing

### Test Files
Two test HTML files are provided:

1. **`test-article-image-selection.html`** - Basic selector testing:
   - Article search and selection
   - Image search and selection
   - Pagination handling
   - Selection state management
   - Real-time search with debouncing

2. **`test-news-creation-with-selectors.html`** - Complete news creation workflow:
   - Multi-tab interface (Basic Info, Articles, Images, Settings)
   - Article and image selection with visual feedback
   - Form validation and submission
   - Complete news creation process
   - Professional UI matching the design requirements

### Running Tests
1. Start the API server: `./nextevent-api`
2. Open either test file in a browser
3. For basic testing: Use `test-article-image-selection.html`
4. For complete workflow: Use `test-news-creation-with-selectors.html`
5. Test all functionality including:
   - Article search and multi-selection
   - Image search and single selection (featured image)
   - Form validation
   - News creation with selected content

## Implementation Details

### Service Layer
- `ArticleSelectionFilter` and `ImageSelectionFilter` structs for filtering
- `SearchArticlesForSelection` and `SearchImagesForSelection` service methods
- Integration with existing repository interfaces

### Repository Layer
- Uses existing `SiteArticleRepository` and `SiteImageRepository` interfaces
- Leverages `Search`, `GetAll`, and `Count` methods
- Applies additional filtering for image dimensions and MIME types

### Controller Layer
- `SearchArticlesForSelection` and `SearchImagesForSelection` endpoints
- Query parameter validation and conversion
- Proper error handling and response formatting

## Future Enhancements

1. **Advanced Filtering**
   - Date range filters
   - Tag-based filtering
   - Content type filtering

2. **Bulk Operations**
   - Select all articles in category
   - Bulk image operations
   - Import from external sources

3. **Preview Features**
   - Article content preview
   - Image zoom/preview
   - News layout preview

4. **Performance Optimizations**
   - Caching for frequently accessed data
   - Lazy loading for large result sets
   - Search result highlighting

5. **User Experience**
   - Drag and drop selection
   - Keyboard shortcuts
   - Selection persistence across sessions

## Summary

The article and image selection functionality has been successfully implemented and provides:

### ✅ **Complete Backend Implementation**
- **Search APIs**: `/api/v2/news/articles/search` and `/api/v2/news/images/search`
- **News Creation API**: `/api/v2/news/create-with-selectors`
- **Advanced Filtering**: Support for all required search and filter criteria
- **Pagination**: Full pagination support with proper metadata
- **Validation**: Comprehensive input validation and error handling

### ✅ **Frontend Integration Ready**
- **Professional UI**: Multi-tab interface matching design requirements
- **Real-time Search**: Debounced search with live results
- **Visual Selection**: Clear selection indicators and management
- **Form Validation**: Client-side validation with user feedback
- **Responsive Design**: Works across different screen sizes

### ✅ **Key Features Delivered**
- **Article Selection**: Multi-select with search, filtering, and pagination
- **Image Selection**: Single-select for featured images with preview
- **News Creation**: Complete workflow from selection to creation
- **Data Binding**: Proper association of articles and images to news
- **Error Handling**: Comprehensive error handling throughout the flow

### ✅ **Production Ready**
- **Database Integration**: Uses existing database schema and repositories
- **Performance Optimized**: Efficient queries with proper pagination
- **Extensible**: Easy to add new features and filters
- **Well Documented**: Complete API documentation and usage examples

The implementation replaces the manual "Featured Image URL" input with a proper image selector and enhances the Articles tab with a comprehensive article selection interface, exactly as shown in the UI mockups.
