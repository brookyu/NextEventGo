# Image Management System

## Overview

The Image Management System provides comprehensive media file handling capabilities including upload, storage, organization, and delivery. The system integrates with WeChat's media platform for seamless distribution and includes advanced file management features with security and performance optimizations.

## Core Features

### File Upload & Storage
- **Multi-format Support**: JPEG, PNG, GIF, and other web-compatible formats
- **File Size Management**: Configurable limits with 10MB WeChat upload threshold
- **Secure Upload**: Server-side validation and sanitization
- **Organized Storage**: Categorized file system organization
- **Unique Naming**: GUID-based file naming to prevent conflicts

### WeChat Integration
- **Automatic Upload**: Files under 10MB automatically uploaded to WeChat
- **Media ID Generation**: WeChat media ID assignment for platform integration
- **Permanent URL Generation**: WeChat permanent URLs for long-term access
- **Material Management**: Integration with WeChat material management API

### Organization & Management
- **Category-based Organization**: File categorization for better management
- **Metadata Storage**: File name, size, and upload information tracking
- **Batch Operations**: Multiple file selection and operations
- **Search & Filter**: Find files by name, category, or metadata

### Performance & Delivery
- **Optimized Storage**: Efficient file system organization
- **CDN Ready**: Structure supports content delivery networks
- **Caching Support**: Integration with Redis caching for URLs
- **Lazy Loading**: On-demand file loading for better performance

## Technical Implementation

### Application Service
**Location**: `services/src/ZenTeam.NextEvent.Application/Images/ImageAppService.cs`

#### Key Operations

##### Image Listing
```csharp
[HttpGet("/api/app/image/getlist")]
public async Task<PagedResultDtoForAnt<ImageDto>> GetListAsync(GetImageListDto input)
```
- **Features**: Pagination, category filtering, name-based search
- **Performance**: Optimized queries with ordering and filtering
- **Response**: Mapped DTOs with metadata

##### File Upload
```csharp
[HttpPost("/api/app/image/upload")]
public async Task<ImageUploadResultDto> UploadImage([FromForm] UploadImageInputDto input)
```
- **Security**: File validation and secure upload handling
- **Storage**: Organized file system storage with unique naming
- **WeChat Integration**: Automatic upload to WeChat for eligible files
- **Error Handling**: Comprehensive error logging and user feedback
- **Performance**: .NET 9 enhanced async file operations

##### File Deletion
```csharp
[HttpPost("/api/app/image/delete")]
public async Task DeleteImages(string[] ids)
```
- **Batch Processing**: Multiple file deletion with parallel processing
- **Cleanup**: Physical file removal with error handling
- **Data Integrity**: Database cleanup with referential integrity checks

### Data Transfer Objects

#### Core Image DTO
```csharp
public class ImageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string SiteUrl { get; set; }
    public string Url { get; set; }
    public string MediaId { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime CreationTime { get; set; }
}
```

#### Upload Input DTO
```csharp
public class UploadImageInputDto
{
    public IFormFile File { get; set; }
    public string CategoryId { get; set; }
}
```

#### Upload Result DTO
```csharp
public class ImageUploadResultDto
{
    public List<ImageDto> NewImages { get; set; } = new();
    public bool Success { get; set; }
    public string Message { get; set; }
}
```

### Database Schema

#### SiteImage Entity
- **Primary Key**: Guid Id
- **File Information**: Name (original filename)
- **Storage URLs**: SiteUrl (local path), Url (WeChat permanent URL)
- **WeChat Integration**: MediaId for WeChat platform
- **Organization**: CategoryId for categorization
- **Audit Fields**: CreationTime, LastModificationTime

### File System Organization

#### Directory Structure
```
wwwroot/
└── MediaFiles/
    └── 1/
        ├── {guid1}.jpg
        ├── {guid2}.png
        └── {guid3}.gif
```

#### Storage Strategy
- **GUID Naming**: Prevents filename conflicts and enhances security
- **Category Folders**: Potential expansion for category-based organization
- **Version Control**: Directory structure supports versioning
- **Backup Ready**: Structure optimized for backup operations

## Security & Permissions

### Permission Structure
- **NextEventPermissions.SiteResource.SiteImages.Default**: Base image access
- **NextEventPermissions.SiteResource.SiteImages.List**: View image listings
- **NextEventPermissions.SiteResource.SiteImages.CreateOrUpdate**: Upload images
- **NextEventPermissions.SiteResource.SiteImages.Delete**: Remove images

### Security Measures
- **File Validation**: Extension and MIME type validation
- **Size Limits**: Configurable upload size restrictions
- **Path Security**: Prevents directory traversal attacks
- **Input Sanitization**: Validation of all input parameters
- **Access Control**: Role-based permissions on all operations

### Data Protection
- **Secure Storage**: Files stored in protected directories
- **URL Security**: Non-predictable file URLs
- **Audit Logging**: All operations logged for security monitoring
- **Error Handling**: Secure error messages without system exposure

## Integration Points

### WeChat Platform
- **Media API**: Upload files to WeChat media storage
- **Material API**: Create permanent WeChat URLs
- **Size Optimization**: Automatic handling of WeChat size limits
- **Error Handling**: WeChat API error management and fallback

### Content Management
- **Article Integration**: Image embedding in article content
- **News Integration**: Cover images for news articles
- **Survey Integration**: Images in survey questions and options
- **Promotion Integration**: Promotional image management

### Caching Layer
- **URL Caching**: Redis-based URL caching for performance
- **Metadata Caching**: Frequent data caching
- **CDN Integration**: Ready for content delivery network integration

## API Endpoints

### Public Endpoints
- `GET /api/app/image/getlist` - Paginated image listing with filtering
- `POST /api/app/image/upload` - Secure file upload with validation

### Administrative Endpoints
- `POST /api/app/image/delete` - Batch image deletion
- `GET /api/app/image/{id}` - Individual image metadata
- `PUT /api/app/image/{id}` - Update image metadata

## Performance Optimizations

### .NET 9 Enhancements
- **Async File Operations**: Enhanced async support for file I/O
- **Memory Management**: Optimized memory usage for large files
- **Parallel Processing**: Concurrent operations for batch processing
- **Stream Optimization**: Efficient file streaming

### Upload Optimization
- **Buffer Management**: Optimized buffer sizes for file operations
- **Progress Tracking**: Upload progress monitoring capabilities
- **Compression**: Automatic image compression options
- **Thumbnail Generation**: On-demand thumbnail creation

### Storage Optimization
- **File System**: Efficient directory organization
- **Cleanup Tasks**: Automatic cleanup of orphaned files
- **Compression**: File compression for storage optimization
- **Backup Integration**: Optimized backup and restore procedures

## Error Handling & Monitoring

### Exception Management
- **Graceful Degradation**: System continues operation on WeChat failures
- **Detailed Logging**: Comprehensive error logging with context
- **User Feedback**: Clear error messages for end users
- **Recovery Procedures**: Automatic retry mechanisms

### Monitoring & Analytics
- **Upload Metrics**: Track upload success rates and performance
- **Storage Monitoring**: Monitor disk usage and capacity
- **Error Tracking**: Categorized error reporting
- **Performance Metrics**: Response time and throughput monitoring

## Best Practices

### File Management
1. **Naming Conventions**: Use GUID-based naming for uniqueness
2. **Organization**: Categorize files for better management
3. **Cleanup**: Regular cleanup of unused files
4. **Backup**: Implement regular backup procedures

### Performance
1. **Size Optimization**: Optimize images for web delivery
2. **Lazy Loading**: Load images only when needed
3. **Caching**: Implement appropriate caching strategies
4. **CDN**: Use content delivery networks for global distribution

### Security
1. **Validation**: Validate all uploads thoroughly
2. **Access Control**: Implement proper permissions
3. **Monitoring**: Monitor for suspicious activities
4. **Encryption**: Encrypt sensitive files at rest

## Integration Examples

### Article Image Embedding
```csharp
// Get image for article content
var image = await _imageRepository.GetAsync(imageId);
var imageUrl = configuration["HostUrl"] + image.SiteUrl;
```

### WeChat Material Upload
```csharp
// Upload to WeChat for permanent URL
var materialResult = await _materialApi.AddMaterialAsync("", new AddMaterialInputDto()
{
    FilePath = filePath
});
if (materialResult.IsSuccess())
{
    siteImg.Url = materialResult.url;
}
```

### Batch Image Processing
```csharp
// Process multiple images efficiently
var tasks = images.Select(async img => 
{
    return await ProcessImageAsync(img);
});
var results = await Task.WhenAll(tasks);
```

## Future Enhancements

### Planned Features
- **AI Image Analysis**: Automatic tagging and content analysis
- **Advanced Compression**: Smart compression based on usage
- **Thumbnail Generation**: Automatic thumbnail creation
- **Image Editing**: Basic image editing capabilities

### Technical Improvements
- **CDN Integration**: Global content delivery network
- **Cloud Storage**: Integration with cloud storage providers
- **Real-time Processing**: Live image processing and optimization
- **Advanced Analytics**: Usage analytics and insights

### Performance Enhancements
- **Progressive Loading**: Progressive image loading for better UX
- **WebP Support**: Next-generation image format support
- **Lazy Loading**: Advanced lazy loading strategies
- **Cache Optimization**: Enhanced caching mechanisms