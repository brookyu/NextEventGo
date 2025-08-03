# News Management System

## Overview

The News Management System provides a comprehensive multi-article news publication platform with deep WeChat integration. This system allows content creators to bundle multiple articles into cohesive news publications, automatically manage WeChat distribution, and handle complex content transformation for optimal mobile consumption.

## Core Features

### Multi-Article News Creation
- **Article Aggregation**: Bundle multiple articles into single news publications
- **Cover Image Management**: Dynamic cover image selection and management
- **Content Ordering**: Flexible article ordering within news publications
- **Draft Management**: WeChat draft creation and management
- **Publication Workflow**: Complete publication lifecycle management

### Advanced WeChat Integration
- **Automatic WeChat Publishing**: Direct integration with WeChat publishing APIs
- **Draft API Integration**: WeChat draft creation and management
- **Material Management**: Automatic media upload and URL management
- **Content Transformation**: HTML content optimization for WeChat platform
- **QR Code Integration**: Seamless QR code generation for distribution

### Content Processing & Optimization
- **Image URL Transformation**: Automatic external image processing and WeChat upload
- **HTML Content Cleaning**: Content sanitization and optimization for WeChat
- **Media Upload Automation**: Batch media processing and upload
- **Link Management**: Content source URL and jump resource management

### Publication Management
- **Category Organization**: News categorization for content organization
- **Version Control**: Draft version management and updates
- **Bulk Operations**: Batch news processing and management
- **Content Validation**: Comprehensive validation before publication

## Technical Implementation

### Application Service
**Location**: `services/src/ZenTeam.NextEvent.Application/News/NewsAppService.cs`

#### Key Operations

##### News Listing
```csharp
[HttpGet("/api/app/news/getlist")]
public async Task<PagedResultDtoForAnt<NewsDto>> GetListAsync(GetNewsListDto input)
```
- **Features**: Pagination, category filtering, search functionality
- **Performance**: .NET 9 optimizations with AsNoTracking() and AsSplitQuery()
- **Parallel Processing**: Concurrent data processing for improved performance

##### News Creation
```csharp
[HttpPost("/api/app/news/add")]
public async Task<CreateUpdateNewsOutputDto> CreateAsync(CreateUpdateNewsDto input)
```
- **Validation**: Article count validation (1-8 articles per news)
- **Content Processing**: Automatic content copying and transformation
- **WeChat Integration**: Automatic WeChat draft creation
- **Image Management**: Cover image processing and URL management
- **Transaction Management**: Unit of work for data consistency

##### News Updates
```csharp
[HttpPost("/api/app/news/update")]
public async Task<CreateUpdateNewsOutputDto> UpdateAsync(CreateUpdateNewsDto input)
```
- **Content Refresh**: Complete article refresh and reprocessing
- **Draft Management**: WeChat draft deletion and recreation
- **Image Synchronization**: Cover image updates and synchronization

##### Content Preparation for Editing
```csharp
[HttpGet("/api/app/news/getforediting")]
public async Task<NewsForEditingDto> GetForEditAsync(Guid id)
```
- **Batch Loading**: Optimized loading of images and articles
- **URL Resolution**: Complete URL resolution for editing interface
- **Sorting**: Proper article ordering for display

##### WeChat Content Processing
```csharp
private async Task SaveNewsToWeChat(SiteNews news, List<SiteNewsArticle> articles)
```
- **Content Transformation**: HTML content processing for WeChat
- **Image Processing**: Automatic image URL transformation
- **Draft Creation**: WeChat draft API integration
- **Media Upload**: Batch media processing and upload

##### External Image Processing
```csharp
private async Task<string> TransmitExternalImageToWechat(string url)
```
- **External Download**: Download images from external URLs
- **WeChat Upload**: Upload downloaded images to WeChat
- **URL Replacement**: Replace external URLs with WeChat URLs

### Data Transfer Objects

#### Core News DTO
```csharp
public class NewsDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public Guid CategoryId { get; set; }
    public string FrontCoverImageUrl { get; set; }
    public string MediaId { get; set; }
    public DateTime CreationTime { get; set; }
}
```

#### News for Editing DTO
```csharp
public class NewsForEditingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public Guid CategoryId { get; set; }
    public Guid FrontCoverImageId { get; set; }
    public string FrontCoverImageUrl { get; set; }
    public List<NewsArticleForDisplaying> Articles { get; set; }
}
```

#### News Article Display DTO
```csharp
public class NewsArticleForDisplaying
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Summary { get; set; }
    public string FrontCoverImageUrl { get; set; }
}
```

#### Creation/Update DTO
```csharp
public class CreateUpdateNewsDto
{
    public Guid NewsId { get; set; }
    public string Title { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid FrontCoverImageId { get; set; }
    public List<NewsArticleInputDto> Articles { get; set; }
}
```

### Database Schema

#### SiteNews Entity
- **Primary Key**: Guid Id
- **Content**: Title for news publication
- **Organization**: CategoryId for categorization
- **Media**: FrontCoverImageId, FrontCoverImageUrl for visual presentation
- **WeChat Integration**: MediaId for WeChat draft tracking
- **Audit Fields**: CreationTime, LastModificationTime

#### SiteNewsArticle Entity (Junction)
- **Primary Key**: Composite key
- **Relations**: SiteNewsId, SiteArticleId, SiteImageId
- **Display Control**: IsShowInText for content display options
- **Content**: Title and other metadata
- **Audit Fields**: Creation and modification tracking

#### Related Entities
- **SiteArticle**: Source articles for news compilation
- **SiteImage**: Images for cover and content
- **Category**: Organization and classification

## WeChat Integration Details

### Draft API Integration
- **AddDraftAsync**: Create WeChat drafts with multiple articles
- **DeleteDraftAsync**: Remove existing drafts before updates
- **Content Structure**: Proper WeChat article format with metadata

### Material API Integration
- **AddMaterialAsync**: Upload images and get permanent URLs
- **Media Management**: Track media IDs for content association
- **Thumbnail Processing**: Cover image processing for WeChat

### Content Transformation
- **HTML Processing**: Convert HTML content for WeChat consumption
- **Image URL Processing**: Transform local and external image URLs
- **Link Management**: Content source URL management
- **Character Escaping**: Proper character handling for WeChat platform

### QR Code Integration
- **Permanent QR Codes**: Generate QR codes for news distribution
- **Tracking**: Monitor QR code usage and engagement
- **WeChat Deep Linking**: Direct integration with WeChat platform

## Security & Permissions

### Permission Structure
- **NextEventPermissions.SiteResource.News.Default**: Base news access
- **NextEventPermissions.SiteResource.News.List**: View news listings
- **NextEventPermissions.SiteResource.News.CreateOrUpdate**: Modify news
- **NextEventPermissions.SiteResource.News.Delete**: Remove news

### Data Security
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation of all inputs
- **Content Sanitization**: HTML content cleaning and validation
- **File Security**: Secure handling of image downloads and uploads

### WeChat Security
- **API Authentication**: Secure WeChat API integration
- **Token Management**: Proper access token handling
- **Error Handling**: Secure error management for WeChat operations

## Content Processing Pipeline

### Article Processing Flow
1. **Article Selection**: Choose 1-8 articles for news compilation
2. **Content Copying**: Create article copies to avoid modification
3. **Image Processing**: Process and optimize images for WeChat
4. **Content Transformation**: Transform HTML content for optimal display
5. **WeChat Upload**: Upload all media to WeChat platform
6. **Draft Creation**: Create WeChat draft with processed content
7. **URL Management**: Update all URLs to WeChat permanent URLs

### Image Processing Pipeline
1. **URL Analysis**: Identify external and internal image URLs
2. **Download Processing**: Download external images to local storage
3. **WeChat Upload**: Upload all images to WeChat material library
4. **URL Replacement**: Replace all URLs with WeChat permanent URLs
5. **Cache Management**: Update local cache with new URLs

### Error Handling Strategy
- **Graceful Degradation**: Continue processing on non-critical errors
- **Rollback Capability**: Transaction management for data consistency
- **Detailed Logging**: Comprehensive error logging for debugging
- **User Feedback**: Clear error messages for content creators

## API Endpoints

### Public Endpoints
- `GET /api/app/news/getlist` - Paginated news listing with filtering
- `GET /api/app/news/getforediting/{id}` - News details for editing

### Administrative Endpoints
- `POST /api/app/news/add` - Create new news publication
- `POST /api/app/news/update` - Update existing news publication
- `POST /api/app/news/delete` - Delete news publication

## Performance Optimizations

### .NET 9 Enhancements
- **AsNoTracking()**: Read-only query optimization
- **AsSplitQuery()**: Complex query performance improvement
- **Parallel Processing**: Concurrent article and image processing
- **Async Operations**: Full async/await pattern implementation

### Batch Processing
- **Image Batch Loading**: Load multiple images in single query
- **Article Batch Processing**: Process multiple articles concurrently
- **Media Batch Upload**: Upload multiple media files to WeChat efficiently

### Caching Strategy
- **Image URL Caching**: Cache WeChat URLs for performance
- **Content Caching**: Cache processed content for reuse
- **API Response Caching**: Cache WeChat API responses when appropriate

## Error Handling & Monitoring

### Exception Management
- **WeChat API Errors**: Handle WeChat API failures gracefully
- **Content Processing Errors**: Manage content transformation failures
- **File Operation Errors**: Handle file download and upload failures
- **Database Errors**: Manage transaction and consistency issues

### Monitoring & Analytics
- **Publication Metrics**: Track news creation and publication success
- **WeChat Integration Health**: Monitor WeChat API performance
- **Content Processing Performance**: Track processing times and bottlenecks
- **Error Rate Monitoring**: Monitor and alert on error rates

## Best Practices

### Content Management
1. **Article Selection**: Choose complementary articles for news
2. **Image Optimization**: Optimize images before inclusion
3. **Content Structure**: Maintain consistent content structure
4. **Version Control**: Track all content changes

### WeChat Integration
1. **API Limits**: Respect WeChat API rate limits and quotas
2. **Error Handling**: Implement robust error handling for WeChat operations
3. **Content Guidelines**: Follow WeChat content guidelines
4. **Testing**: Test content on WeChat platform before publication

### Performance
1. **Batch Operations**: Use batch processing for multiple articles
2. **Async Processing**: Implement async operations for I/O operations
3. **Resource Management**: Manage file handles and connections properly
4. **Monitoring**: Monitor performance and optimize bottlenecks

## Integration Examples

### Creating Multi-Article News
```csharp
var createDto = new CreateUpdateNewsDto
{
    Title = "Weekly Tech Update",
    CategoryId = techCategoryId,
    FrontCoverImageId = coverImageId,
    Articles = new List<NewsArticleInputDto>
    {
        new() { ArticleId = article1Id, IsFront = true },
        new() { ArticleId = article2Id, IsFront = false },
        new() { ArticleId = article3Id, IsFront = false }
    }
};
var result = await newsAppService.CreateAsync(createDto);
```

### Processing External Images
```csharp
private async Task<bool> SetImgUrls(SiteArticle article)
{
    var regImg = new Regex(@"<img\b[^<>]*?\bsrc[\s\t\r\n]*=[\s\t\r\n]*[""']?[\s\t\r\n]*(?<imgUrl>[^\s\t\r\n""'<>]*)[^<>]*?/?[\s\t\r\n]*>", RegexOptions.IgnoreCase);
    var matches = regImg.Matches(article.Content);
    
    foreach (Match match in matches)
    {
        var url = match.Groups["imgUrl"].Value;
        if (IsExternalUrl(url))
        {
            var newUrl = await TransmitExternalImageToWechat(url);
            article.Content = article.Content.Replace(url, newUrl);
        }
    }
    return true;
}
```

### WeChat Draft Creation
```csharp
var draftInput = new AddDraftInput();
foreach (var article in articles)
{
    draftInput.Articles.Add(new Article()
    {
        Author = article.Author,
        Content = article.Content.Replace("\"", "'"),
        content_source_url = article.content_source_url,
        Digest = article.Digest,
        Title = article.Title,
        thumb_media_id = article.thumb_media_id,
    });
}
var result = await _draftApi.AddDraftAsync(draftInput);
```

## Future Enhancements

### Planned Features
- **AI Content Curation**: Automatic article selection and curation
- **Advanced Scheduling**: Scheduled publication capabilities
- **Multi-platform Publishing**: Extend beyond WeChat to other platforms
- **Template System**: Pre-defined news templates for quick creation

### Technical Improvements
- **Real-time Collaboration**: Multi-user editing capabilities
- **Advanced Analytics**: Reader engagement and performance analytics
- **CDN Integration**: Global content delivery optimization
- **Progressive Web App**: Enhanced mobile experience

### WeChat Enhancements
- **Advanced WeChat Features**: Integration with newer WeChat capabilities
- **Mini Program Integration**: WeChat Mini Program content distribution
- **Enhanced Analytics**: WeChat-specific analytics and insights
- **Automated Publishing**: Scheduled and automated WeChat publishing