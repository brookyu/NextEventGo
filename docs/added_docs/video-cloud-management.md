# Video & Cloud Video Management System

## Overview

The Video & Cloud Video Management System provides a comprehensive platform for managing both traditional video content and advanced cloud-based live streaming with real-time analytics. This sophisticated system includes live streaming capabilities, user engagement tracking, registration integration, WeChat notifications, and advanced data visualization.

## Core Features

### Video Content Management
- **Multi-format Support**: Support for various video formats and streaming protocols
- **Upload Management**: Secure video upload with validation and processing
- **Categorization**: Video organization by categories and events
- **Cover Image Management**: Automatic and manual cover image handling
- **Metadata Management**: Comprehensive video metadata and descriptions

### Advanced Cloud Video Features
- **Live Streaming**: Real-time live streaming with Alibaba Cloud integration
- **On-Demand Playback**: Pre-recorded video playback capabilities
- **Multi-platform Players**: Mobile, PC, and specialized player interfaces
- **Interactive Features**: Real-time user interaction and engagement
- **Event Integration**: Deep integration with event management system

### Real-Time Analytics & Tracking
- **User Session Tracking**: Detailed user viewing session analytics
- **Duration Tracking**: Precise viewing time and engagement metrics
- **Timeline Analytics**: Minute-by-minute user activity tracking
- **Heat Map Generation**: User engagement heat mapping
- **Distribution Analytics**: Geographic and demographic analysis

### User Engagement & Notifications
- **Registration Integration**: Seamless integration with user registration system
- **WeChat Notifications**: Automated reminder and notification system
- **Template Messaging**: Customizable WeChat template messages
- **User Interaction**: Real-time chat and interaction capabilities
- **Survey Integration**: Embedded surveys and feedback collection

### Advanced Features
- **Multiple Player Types**: Specialized players for different use cases
- **QR Code Generation**: Dynamic QR codes for video distribution
- **Event-Based Access**: Context-aware access control based on events
- **Promotion Tracking**: Referral and promotion analytics
- **Background Processing**: Async processing for intensive operations

## Technical Implementation

### Application Service
**Location**: `services/src/ZenTeam.NextEvent.Application/CloudVideos/CloudVideoAppService.cs`

#### Key Operations

##### Video Listing & Management
```csharp
[HttpGet("/api/app/cloudvideo/getlist")]
public async Task<PagedResultDtoForAnt<CloudVideoDto>> GetListAsync(GetCloudVideoListDto input)
```
- **Features**: Pagination, category filtering, search functionality
- **Performance**: Optimized queries with proper ordering
- **Multi-format Support**: Various video types and formats

##### Video Creation
```csharp
[HttpPost("/api/app/cloudvideo/add")]
public async Task<CloudVideoDto> CreateAsync(CreateUpdateCloudVideoDto input)
```
- **Live Stream Setup**: Automatic live stream URL generation
- **Alibaba Cloud Integration**: Direct integration with Alibaba Live streaming
- **Event Association**: Automatic event association and scheduling
- **URL Generation**: Dynamic player URL creation

##### Content Preparation for Editing
```csharp
[HttpGet("/api/app/cloudvideo/get")]
public async Task<CloudVideoForEditingDto> GetForEditingAsync(Guid id)
```
- **Comprehensive Loading**: Images, articles, surveys, and upload information
- **URL Resolution**: Complete URL resolution for all associated resources
- **Null Safety**: Comprehensive null handling and default value assignment

##### Live Streaming Management
```csharp
private void ConfigureLiveStreaming(CloudVideo cloudVideo)
{
    if (input.VideoType == VideoTypes.Live)
    {
        var helper = new AliLiveHelper();
        cloudVideo.CloudUrl = helper.CreatAuthUrl("/live/event", cloudVideo.VideoEndTime, VideoKeyTypes.Push);
    }
}
```

##### User Analytics & Tracking
```csharp
public async Task<PagedResultDtoForAnt<UserAnswerDisplayItem>> GetResultsAsync(GetCloudVideoResultsInputDto input)
```
- **Registration Analytics**: Integration with user registration data
- **Viewing Analytics**: Detailed viewing behavior tracking
- **Duration Calculations**: Precise viewing time calculations
- **Activity Timestamps**: Timeline-based activity tracking

##### WeChat Notification System
```csharp
[UnitOfWork(false)]
public async Task SendReminder(SendReminderInputDto input)
```
- **Template Messaging**: WeChat template message integration
- **Batch Processing**: Efficient bulk notification sending
- **Rate Limiting**: Controlled concurrency to respect WeChat API limits
- **Error Handling**: Robust error handling for notification failures

##### Real-Time Data Processing
```csharp
public async Task<SurveyResultJsonOutDto> GetResultsJsonAsync(GetCloudVideoResultsJsonInputDto input)
```
- **Cache Integration**: Redis-based caching for real-time data
- **Data Aggregation**: Complex aggregation of user activity data
- **Session Management**: User session tracking and management
- **Backup Systems**: Automatic data backup and recovery

##### Timeline Analytics
```csharp
public async Task<CloudVideoTimelineData> GetTimelineDataAsync(GetCloudVideoResultsInputDto input)
```
- **Background Processing**: Async processing for intensive analytics
- **Caching Strategy**: Multi-layer caching for performance
- **Real-time Updates**: Live data streaming for analytics dashboards

##### Duration Distribution Analytics
```csharp
public async Task<CloudVideoOnlineDurationDistributionData> GetOnlineDurationDistributionDataAsync(GetCloudVideoResultsInputDto input)
```
- **Statistical Analysis**: Advanced statistical processing of viewing patterns
- **Chart Data Generation**: Dynamic chart data for visualization
- **Grouping Logic**: Intelligent data grouping and categorization

### Data Transfer Objects

#### Core Cloud Video DTO
```csharp
public class CloudVideoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public VideoTypes VideoType { get; set; }
    public string CloudUrl { get; set; }
    public bool IsOpen { get; set; }
    public bool SupportInteraction { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime VideoEndTime { get; set; }
}
```

#### Video for Editing DTO
```csharp
public class CloudVideoForEditingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public VideoTypes VideoType { get; set; }
    public Guid FrontCoverImageId { get; set; }
    public string FrontCoverImageUrl { get; set; }
    public Guid AboutArticleId { get; set; }
    public string AboutArticleTitle { get; set; }
    public string AboutArticleCoverUrl { get; set; }
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; }
    public Guid VideoUploadId { get; set; }
    public string VideoUploadUrl { get; set; }
    public string VideoCoverUrl { get; set; }
    public Guid EventId { get; set; }
    public string EventTitle { get; set; }
}
```

#### User Activity Tracking DTO
```csharp
public class UserAnswerDisplayItem
{
    public string RealName { get; set; }
    public string CompanyName { get; set; }
    public string Position { get; set; }
    public string Email { get; set; }
    public string Mobile { get; set; }
    public List<AnswerItem> Answers { get; set; }
    public DateTime DateCompleted { get; set; }
    public string PromoterName { get; set; }
    public long OnlineDuration { get; set; }
    public long MaxOnlineDuration { get; set; }
    public DateTime LastActivityDate { get; set; }
    public string OnlineTimeStamps { get; set; }
}
```

#### Timeline Data DTO
```csharp
public class CloudVideoTimelineData
{
    public Dictionary<string, int> UserCountsEveryMinute { get; set; }
    public int PeakUserCount { get; set; }
    public DateTime PeakTime { get; set; }
    public bool IsCached { get; set; }
}
```

### Database Schema

#### CloudVideo Entity
- **Primary Key**: Guid Id
- **Content**: Title, Summary for video description
- **Technical**: VideoType, CloudUrl for streaming configuration
- **Access Control**: IsOpen, SupportInteraction for feature flags
- **Media Relations**: SiteImageId, PromotionPicId for visual content
- **Integration**: IntroArticleId, NotOpenArticleId for content association
- **Survey Integration**: SurveyId for embedded feedback
- **Upload Integration**: UploadId for video file association
- **Event Association**: BoundEventId for event-specific content
- **Scheduling**: VideoEndTime for live stream scheduling
- **Organization**: CategoryId for categorization

#### Hit Entity (Analytics)
- **Primary Key**: Guid Id
- **User Tracking**: UserId for user association
- **Resource Tracking**: ResourceId for video association
- **Event Context**: EventId for event-specific analytics
- **Duration Metrics**: Duration, HitTimes for engagement tracking
- **Timeline Data**: FirstHitTime, LastHitTime, HitTimeStamps
- **Advanced Metrics**: PercentScrolled for detailed engagement

#### Related Entities
- **VideoUpload**: File upload and processing management
- **SiteEvent**: Event integration and scheduling
- **Survey**: Embedded feedback and survey integration
- **WeiChatUser**: User registration and profile management

## Alibaba Cloud Integration

### Live Streaming Setup
- **Stream URL Generation**: Dynamic live stream URL creation
- **Authentication**: Secure stream authentication and authorization
- **Scheduling**: Time-based stream activation and deactivation
- **Quality Control**: Multi-quality stream support

### Stream Management
```csharp
public class AliLiveHelper
{
    public string CreatAuthUrl(string path, DateTime endTime, VideoKeyTypes keyType)
    {
        // Generate authenticated URLs for Alibaba Cloud Live streaming
        // Includes timestamp-based authentication and access control
    }
}
```

## Caching & Performance

### Multi-Layer Caching Strategy
- **Web Session Cache**: Real-time user session management
- **User Hit Cache**: Activity tracking optimization
- **Timeline Data Cache**: Analytics data caching
- **Background Processing**: Async processing for intensive operations

### Cache Keys
```csharp
public static class CacheKeys
{
    public const string UserHitCacheKey = "UserHit:";
    public const string CloudVideoTimelineDataCacheKey = "CloudVideoTimeline:";
    public const string WebSessionCacheKey = "WebSession:";
}
```

### Performance Optimizations
- **Parallel Processing**: Concurrent user data processing
- **Rate Limiting**: Controlled API access for WeChat integration
- **Background Jobs**: Async processing for analytics generation
- **Data Aggregation**: Efficient data aggregation strategies

## Security & Permissions

### Permission Structure
- **NextEventPermissions.CloudVideos.Default**: Base video access
- **NextEventPermissions.CloudVideos.List**: View video listings
- **NextEventPermissions.CloudVideos.CreateOrUpdate**: Modify videos
- **NextEventPermissions.CloudVideos.Delete**: Remove videos

### Access Control
- **Event-Based Access**: Context-aware access control
- **User Authentication**: WeChat user integration
- **Stream Security**: Secure streaming URL generation
- **Data Privacy**: User activity data protection

### WeChat Security
- **Template Message Security**: Secure template message handling
- **QR Code Security**: Secure QR code generation and tracking
- **User Data Protection**: Privacy-compliant user data handling

## API Endpoints

### Video Management Endpoints
- `GET /api/app/cloudvideo/getlist` - Paginated video listing
- `POST /api/app/cloudvideo/add` - Create new cloud video
- `POST /api/app/cloudvideo/update` - Update existing video
- `GET /api/app/cloudvideo/get` - Video details for editing
- `POST /api/app/cloudvideo/toggleonline` - Toggle video availability

### Distribution Endpoints
- `GET /api/app/cloudvideo/getqrurl` - Generate QR code for video
- `GET /api/app/cloudvideo/geturl` - Get video player URLs

### Analytics Endpoints
- `GET /api/app/cloudvideo/results` - User analytics data
- `GET /api/app/cloudvideo/results/json` - JSON export of analytics
- `GET /api/app/cloudvideo/timeline` - Timeline analytics data
- `GET /api/app/cloudvideo/duration-distribution` - Duration distribution analytics

### Notification Endpoints
- `POST /api/app/cloudvideo/sendreminder` - Send WeChat notifications

## Real-Time Features

### Live Analytics
- **Real-Time Tracking**: Live user activity monitoring
- **Session Management**: Active session tracking and management
- **Timeline Generation**: Minute-by-minute analytics generation
- **Performance Monitoring**: System performance and health monitoring

### WeChat Integration
- **Template Messaging**: Real-time notification delivery
- **User Interaction**: Live user engagement tracking
- **QR Code Generation**: Dynamic QR code creation for sharing

### Background Processing
```csharp
[UnitOfWork(false)]
public async Task ProcessTimelineData(GetCloudVideoResultsInputDto input)
{
    // Background job for intensive analytics processing
    // Handles large datasets without blocking user interface
}
```

## Player Integration

### Multiple Player Types
- **Mobile WeChat Player**: Optimized for WeChat mobile viewing
- **PC Landing Page**: Desktop-optimized viewing experience
- **New Player Interface**: Modern player with enhanced features
- **New PC Player**: Advanced desktop player with analytics

### URL Generation
```csharp
public async Task<string> GetUrlAsync(GetUrlInputDto input)
{
    return input.PcOrMobile switch
    {
        PcOrMobile.Mobile => $"{wechatServer}/cloudvideo/wechatplayer/{input.Id}",
        PcOrMobile.PC => $"{wechatServer}/cloudvideo/pclanding/{input.Id}",
        PcOrMobile.NewPlayer => $"{wechatServer}/cloudvideo/newplayer?videoid={input.Id}",
        PcOrMobile.NewPcPlayer => $"{wechatServer}/cloudvideo/newpclanding/{input.Id}",
        _ => ""
    };
}
```

## Error Handling & Monitoring

### Exception Management
- **Alibaba Cloud Errors**: Handle streaming service failures
- **WeChat API Errors**: Manage notification delivery failures
- **Cache Errors**: Graceful degradation for cache failures
- **Database Errors**: Transaction management and rollback

### Monitoring & Analytics
- **Stream Health**: Monitor live stream quality and availability
- **User Engagement**: Track user behavior and engagement patterns
- **System Performance**: Monitor system resource usage and performance
- **Error Rate Tracking**: Track and analyze error patterns

## Best Practices

### Video Management
1. **Quality Optimization**: Optimize video quality for different devices
2. **Storage Management**: Efficient storage and backup strategies
3. **Metadata Management**: Comprehensive metadata for search and organization
4. **Version Control**: Track video versions and updates

### Performance
1. **Caching Strategy**: Implement multi-layer caching for performance
2. **Background Processing**: Use async processing for intensive operations
3. **Resource Management**: Efficient resource utilization and cleanup
4. **Monitoring**: Continuous performance monitoring and optimization

### Security
1. **Access Control**: Implement proper role-based permissions
2. **Stream Security**: Secure streaming URLs and authentication
3. **Data Protection**: Protect user analytics and viewing data
4. **Audit Logging**: Track all video management activities

## Integration Examples

### Creating Live Stream Video
```csharp
var createDto = new CreateUpdateCloudVideoDto
{
    Title = "Live Product Launch",
    Summary = "Join us for our exciting product launch event",
    VideoType = VideoTypes.Live,
    SiteImageId = coverImageId,
    IntroArticleId = introArticleId,
    SurveyId = feedbackSurveyId,
    SupportInteraction = true
};
var result = await cloudVideoAppService.CreateAsync(createDto);
```

### Sending WeChat Notifications
```csharp
await cloudVideoAppService.SendReminder(new SendReminderInputDto
{
    CloudVideoId = videoId
});
```

### Generating Analytics Report
```csharp
var analyticsData = await cloudVideoAppService.GetResultsJsonAsync(new GetCloudVideoResultsJsonInputDto
{
    CloudVideoId = videoId,
    SkipCount = 0,
    MaxResultCount = 1000
});
```

## Future Enhancements

### Planned Features
- **AI-Powered Analytics**: Machine learning insights for user behavior
- **Advanced Interaction**: Enhanced real-time interaction capabilities
- **Multi-Cloud Support**: Support for multiple cloud streaming providers
- **Advanced Player Features**: Interactive elements and overlays

### Technical Improvements
- **Enhanced Caching**: Intelligent caching with predictive pre-loading
- **Real-time Synchronization**: Advanced real-time data synchronization
- **Performance Optimization**: Further performance optimizations and monitoring
- **Advanced Security**: Enhanced security features and compliance

### Analytics Enhancements
- **Predictive Analytics**: AI-powered viewing pattern prediction
- **Advanced Visualization**: Interactive dashboards and reports
- **Custom Metrics**: User-defined custom analytics metrics
- **Export Capabilities**: Enhanced data export and integration options