# Article Management System

## Overview

The Article Management System provides comprehensive content creation, publishing, and analytics capabilities. This module enables content creators to publish articles with rich media, track user engagement, and manage promotional content distribution.

## Core Features

### Article Creation & Management
- **Rich Content Editor**: Support for HTML content with embedded images and media
- **Front Cover Images**: Upload and associate cover images for visual appeal
- **Categorization**: Organize articles by categories for better content organization
- **Author Attribution**: Track content creators and authors
- **Summary Generation**: Article summaries for preview and SEO purposes
- **Publication Status**: Draft and published states for content workflow

### Advanced Content Features
- **Jump Resources**: Link articles to other content for enhanced navigation
- **Promotion Images**: Separate promotional images for marketing campaigns
- **Content Promotion Codes**: Unique tracking codes for referral analytics
- **Tag Association**: Multi-tag support for content classification

### Distribution & Access
- **WeChat QR Code Generation**: Automatic QR code creation for WeChat sharing
- **Mobile-Optimized Views**: Responsive design for mobile consumption
- **Direct URL Access**: SEO-friendly URLs for web access
- **Promotional Sharing**: Referral tracking through unique promotion codes

### Analytics & Tracking
- **Read Analytics**: Track user reading behavior and engagement
- **Scroll Tracking**: Monitor reading depth and completion rates
- **Duration Tracking**: Measure time spent reading content
- **User Attribution**: Connect reading sessions to specific users
- **Promotion Analytics**: Track referral sources and promotional effectiveness

## Technical Implementation

### Application Service
**Location**: `services/src/ZenTeam.NextEvent.Application/Articles/ArticleAppService.cs`

#### Key Operations

##### Article Listing
```csharp
[HttpGet("/api/app/article/getlist")]
public async Task<PagedResultDtoForAnt<ArticleDto>> GetListAsync(GetArticleListDto input)
```
- **Features**: Pagination, filtering by category and search terms
- **Performance**: .NET 9 optimizations with AsNoTracking() and AsSplitQuery()
- **Caching**: Image URL caching for improved performance
- **Batch Processing**: Parallel processing for large datasets

##### Article Creation
```csharp
[HttpPost("/api/app/article/create")]
public async Task<ArticleDto> CreateAsync(CreateUpdateArticleDto input)
```
- **Auto-Generation**: Automatic promotion code generation
- **Validation**: Input validation and error handling
- **Audit Trail**: Creation timestamps and user tracking

##### Article Updates
```csharp
[HttpPost("/api/app/article/update")]
public async Task UpdateAsync(CreateUpdateArticleDto input)
```
- **Version Control**: Track modifications with audit logging
- **Data Integrity**: Validation of updates and referential integrity

##### Content Retrieval for Editing
```csharp
[HttpGet("/api/app/article/getforediting")]
public async Task<ArticleDtoForEditing> GetForEditingAsync(Guid id)
```
- **Rich Data Loading**: Includes images, jump resources, and metadata
- **URL Resolution**: Automatic image URL resolution for editing interface

##### QR Code Generation
```csharp
[HttpGet("/api/app/article/getqr")]
public async Task<string> GetQrUrl(Guid id)
```
- **WeChat Integration**: Permanent QR code creation through WeChat API
- **Tracking**: QR code usage tracking and analytics
- **Expiration Management**: Automatic renewal of expired codes

##### Analytics Data
```csharp
public async Task<ArticleTrackingResultJsonOutputDto> GetTrackingJson(GetArticleTrackingDataInputDto input)
```
- **User Engagement**: Detailed reading analytics per user
- **Referral Tracking**: Promotion source attribution
- **Export Ready**: JSON format for reports and analysis

### Data Transfer Objects

#### Core Article DTO
```csharp
public class ArticleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public string Content { get; set; }
    public string Author { get; set; }
    public Guid CategoryId { get; set; }
    public string FrontCoverImageUrl { get; set; }
    public string PromotionCode { get; set; }
    public List<TagAssociationDto> Tags { get; set; }
}
```

#### Creation/Update DTO
```csharp
public class CreateUpdateArticleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public string Content { get; set; }
    public string Author { get; set; }
    public Guid CategoryId { get; set; }
    public Guid? SiteImageId { get; set; }
    public Guid? PromotionPicId { get; set; }
    public Guid? JumpResourceId { get; set; }
}
```

#### Analytics DTO
```csharp
public class ArticleTrackingDisplayItem
{
    public string RealName { get; set; }
    public string CompanyName { get; set; }
    public string Mobile { get; set; }
    public string Email { get; set; }
    public string Position { get; set; }
    public string ReadDate { get; set; }
    public string RegisterDate { get; set; }
    public double ReadPercentage { get; set; }
    public int ReadDuration { get; set; }
    public string PromoterName { get; set; }
}
```

### Database Schema

#### SiteArticle Entity
- **Primary Key**: Guid Id
- **Content Fields**: Title, Summary, Content, Author
- **Media Relations**: SiteImageId (cover), PromotionPicId (promotional image)
- **Organization**: CategoryId for categorization
- **Navigation**: JumpResourceId for content linking
- **Tracking**: PromotionCode for referral analytics
- **Audit Fields**: CreationTime, LastModificationTime, CreatorId

#### Related Entities
- **SiteImage**: Media files and image management
- **Hit**: User interaction tracking
- **WeiChatQrCode**: QR code management for distribution
- **UserPromotion**: Referral and promotion tracking

## Security & Permissions

### Permission Structure
- **NextEventPermissions.SiteResource.SiteArticles.Default**: Base article access
- **NextEventPermissions.SiteResource.SiteArticles.List**: View article lists
- **NextEventPermissions.SiteResource.SiteArticles.CreateOrUpdate**: Modify articles
- **NextEventPermissions.SiteResource.SiteArticles.Delete**: Remove articles

### Data Security
- **Authorization**: Role-based access control on all operations
- **Input Validation**: Server-side validation of all inputs
- **SQL Injection Protection**: Parameterized queries and ORM protection
- **XSS Protection**: Content sanitization for HTML content

## Integration Points

### WeChat Integration
- **QR Code API**: Permanent QR code generation for article sharing
- **User Authentication**: WeChat user integration for reading tracking
- **Analytics Integration**: User behavior tracking through WeChat platform

### Image Management
- **Media Upload**: Integration with image management system
- **URL Caching**: Performance optimization through image URL caching
- **CDN Support**: Scalable image delivery infrastructure

### Analytics Platform
- **Hit Tracking**: Integration with analytics system for user behavior
- **Referral Attribution**: Promotion code tracking and user attribution
- **Real-time Monitoring**: Live analytics dashboard integration

## API Endpoints

### Public Endpoints
- `GET /api/app/article/getlist` - Paginated article listing
- `GET /api/app/article/getforediting/{id}` - Article details for editing
- `GET /api/app/article/getqr/{id}` - Generate QR code for article

### Administrative Endpoints
- `POST /api/app/article/create` - Create new article
- `POST /api/app/article/update` - Update existing article
- `POST /api/app/article/delete` - Delete article
- `GET /api/app/article/tracking/{id}` - Get analytics data

## Performance Optimizations

### .NET 9 Enhancements
- **AsNoTracking()**: Read-only query optimization
- **AsSplitQuery()**: Complex query performance improvement
- **Parallel Processing**: Concurrent data processing for large datasets
- **Collection Expressions**: Modern C# syntax for better performance

### Caching Strategy
- **Image URL Caching**: Redis-based caching for frequently accessed images
- **Promotion Code Caching**: Automatic generation and caching of promotion codes
- **Batch Operations**: Bulk updates for improved database performance

### Database Optimization
- **Indexing**: Optimized indexes for search and filtering operations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Entity Framework Core performance tuning

## Best Practices

### Content Management
1. **Structured Content**: Use consistent formatting and structure
2. **SEO Optimization**: Include summaries and metadata for search engines
3. **Media Optimization**: Optimize images for web delivery
4. **Version Control**: Track all content changes for audit purposes

### Performance
1. **Lazy Loading**: Load images and related data only when needed
2. **Pagination**: Implement proper pagination for large content lists
3. **Caching**: Utilize caching for frequently accessed content
4. **Compression**: Enable content compression for faster delivery

### Security
1. **Input Sanitization**: Validate and sanitize all user inputs
2. **Access Control**: Implement proper role-based permissions
3. **Audit Logging**: Track all content modifications
4. **Secure File Upload**: Validate and secure media uploads

## Future Enhancements

### Planned Features
- **Content Versioning**: Full version history and rollback capabilities
- **Collaborative Editing**: Multi-user content editing support
- **AI Content Assistance**: Content suggestions and optimization
- **Advanced Analytics**: Machine learning-powered engagement insights

### Technical Improvements
- **GraphQL API**: Enhanced querying capabilities
- **Real-time Collaboration**: WebSocket-based live editing
- **CDN Integration**: Global content distribution network
- **Search Enhancement**: Full-text search with Elasticsearch integration