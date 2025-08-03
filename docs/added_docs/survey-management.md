# Survey Management System

## Overview

The Survey Management System provides a comprehensive platform for creating, distributing, and analyzing surveys and forms. This sophisticated system includes real-time analytics, multi-language support, live survey capabilities, WeChat integration, and advanced reporting features with data visualization.

## Core Features

### Survey Creation & Management
- **Multi-Question Types**: Single choice, multiple choice, text input, and rating questions
- **Dynamic Question Ordering**: Flexible question arrangement and reordering
- **Multi-Language Support**: English and Chinese language support for questions and choices
- **Category Organization**: Survey categorization for better content management
- **Draft & Published States**: Complete survey lifecycle management

### Advanced Question Types
- **Single Choice Questions**: Radio button selections with validation
- **Multiple Choice Questions**: Checkbox selections with advanced logic
- **Text Input Questions**: Free-form text responses with validation
- **Rating Questions**: Numerical rating scales with customizable ranges
- **Conditional Logic**: Skip logic and branching based on responses

### Real-Time Analytics & Live Surveys
- **Live Survey Results**: Real-time response tracking and visualization
- **Answer Count Monitoring**: Minute-by-minute response tracking
- **Live Dashboard Integration**: Real-time presenter dashboard updates
- **Chart Data Generation**: Dynamic chart creation for live presentations
- **Response Rate Analytics**: Completion and abandonment tracking

### Distribution & Access
- **WeChat QR Code Generation**: Automatic QR code creation for mobile distribution
- **Direct URL Access**: Web-based survey access with tracking
- **Event-Specific Surveys**: Event-based survey distribution and tracking
- **Mobile-Optimized Interface**: Responsive design for mobile completion

### Advanced Reporting & Analytics
- **Export Capabilities**: JSON and structured data export
- **User Response Tracking**: Individual user response analytics
- **Completion Analytics**: Response completion rates and patterns
- **Promoter Attribution**: Track survey sources and referrers
- **Data Visualization**: Charts, graphs, and visual analytics

## Technical Implementation

### Application Service
**Location**: `services/src/ZenTeam.NextEvent.Application/Surveys/SurveyAppService.cs`

#### Key Operations

##### Survey Listing
```csharp
[HttpGet("/api/app/survey/getlist")]
public async Task<PagedResultDtoForAnt<SurveyDto>> GetListAsync(GetSurveyListDto input)
```
- **Features**: Pagination, category filtering, search functionality
- **Performance**: .NET 9 optimizations with batch processing
- **Analytics**: Real-time completion and save count calculation
- **Parallel Processing**: Concurrent data aggregation for improved performance

##### Survey Creation
```csharp
[HttpPost("/api/app/survey/add")]
public async Task<SurveyDto> CreateAsync(CreateUpdateSuveryDto input)
```
- **Validation**: Comprehensive input validation
- **Audit Trail**: Complete creation tracking
- **Error Handling**: Robust error management with detailed logging

##### Survey Updates
```csharp
[HttpPost("/api/app/survey/update")]
public async Task<SurveyDto> UpdateAsync(CreateUpdateSuveryDto input)
```
- **Version Control**: Track all survey modifications
- **Data Integrity**: Maintain referential integrity during updates

##### Survey Results & Analytics
```csharp
public async Task<PagedResultDtoForAnt<UserAnswerDisplayItem>> GetResultsAsync(GetSurveyResultInputDto input)
```
- **Comprehensive Analytics**: Individual user response tracking
- **Duplicate Prevention**: Advanced logic to prevent duplicate responses
- **Question Mapping**: Complete question-answer association
- **Export Ready**: Structured data for export and analysis

##### Live Survey Analytics
```csharp
public async Task<LiveSurveyResults> GetLiveSurveyResultsAsync(GetLiveSurveyResultInputDto input)
```
- **Real-Time Data**: Live response tracking with caching
- **Chart Generation**: Dynamic chart data for presentations
- **Event Broadcasting**: Real-time updates to presentation interfaces
- **Performance Optimized**: Redis caching for high-frequency requests

##### Question Management
```csharp
[HttpPost("/api/app/survey/updatequestionorder")]
public async Task<SurveyWithQuestionsForEditing> UpdateQuestionOrderAsync(QuestionOrderDto[] input)
```
- **Dynamic Ordering**: Flexible question arrangement
- **Batch Updates**: Efficient batch processing for question order changes

##### QR Code & URL Generation
```csharp
public async Task<string> GetQrUrlAsync(GetUrlInput input)
public async Task<string> GetUrlAsync(GetUrlInput input)
```
- **WeChat Integration**: Permanent QR code generation
- **Event-Specific URLs**: Context-aware URL generation
- **Form vs Survey**: Different handling for forms and surveys

##### Chart Data Generation
```csharp
public async Task<SurveyAnswerChartData> GetSurveyAnswerChartDataAsync(GetSurveyChartDataInputDto input)
```
- **Multi-Language Charts**: Language-specific chart generation
- **Multiple Chart Types**: Pie charts and bar charts based on question type
- **Real-Time Data**: Live data aggregation for charts

### Data Transfer Objects

#### Core Survey DTO
```csharp
public class SurveyDto
{
    public Guid Id { get; set; }
    public string SurveyTitle { get; set; }
    public string SurveySummary { get; set; }
    public Guid CategoryId { get; set; }
    public int SaveCount { get; set; }
    public int CompletedCount { get; set; }
    public DateTime CreationTime { get; set; }
}
```

#### Survey with Questions DTO
```csharp
public class SurveyWithQuestionsForEditing
{
    public Guid Id { get; set; }
    public string SurveyTitle { get; set; }
    public string SurveySummary { get; set; }
    public List<QuestionDto> Questions { get; set; }
}
```

#### Question DTO
```csharp
public class QuestionDto
{
    public Guid Id { get; set; }
    public string QuestionTitle { get; set; }
    public string QuestionTitleEn { get; set; }
    public QuestionType QuestionType { get; set; }
    public string Choices { get; set; }
    public string ChoicesEn { get; set; }
    public int OrderNumber { get; set; }
    public bool IsRequired { get; set; }
}
```

#### Live Survey Results DTO
```csharp
public class LiveSurveyResults : BaseChartData
{
    public Guid SurveyId { get; set; }
    public string SurveyTitle { get; set; }
    public int CompleteCount { get; set; }
    public List<Serial> Serials { get; set; }
}
```

#### User Answer Display DTO
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
}
```

#### Answer Item DTO
```csharp
public class AnswerItem
{
    public string QuestionId { get; set; }
    public string QuestionTitle { get; set; }
    public string Answer { get; set; }
    public string Extra { get; set; }
    public QuestionType QuestionType { get; set; }
}
```

### Database Schema

#### Survey Entity
- **Primary Key**: Guid Id
- **Content**: SurveyTitle, SurveySummary for survey description
- **Multi-Language**: Support for multiple language versions
- **Organization**: CategoryId for survey categorization
- **Settings**: Configuration options for survey behavior
- **Audit Fields**: CreationTime, LastModificationTime, CreatorId

#### Question Entity
- **Primary Key**: Guid Id
- **Relations**: SurveyId foreign key
- **Content**: QuestionTitle, QuestionTitleEn for multi-language support
- **Type**: QuestionType enum for different question types
- **Choices**: Pipe-separated choice options
- **Multi-Language Choices**: ChoicesEn for English choices
- **Ordering**: OrderNumber for question sequence
- **Validation**: IsRequired and other validation settings

#### Answer Entity
- **Primary Key**: Guid Id
- **Relations**: SurveyId, UserId for tracking
- **Content**: AnswerString (JSON) for flexible answer storage
- **Status**: IsComplete for tracking completion state
- **Analytics**: DateCompleted, PromoterName for analytics
- **Audit Fields**: Creation and modification tracking

## Real-Time Features

### Live Survey Analytics
- **Minute-by-Minute Tracking**: Response count tracking per minute
- **Redis Caching**: High-performance caching for live data
- **Event Broadcasting**: Real-time updates to presentation interfaces
- **Chart Data Generation**: Dynamic chart creation for live presentations

### Caching Strategy
```csharp
// Live survey answer tracking cache key
var cacheKey = CacheKeys.LiveSurveyAnswerCacheKey + surveyId + "_" + eventId;
```

### Event Broadcasting
```csharp
var eto = new PresentBroadcastResultInputEto
{
    MessageType = BroadcastMessageTypes.Survey,
    ResourceId = input.SurveyId,
    BasedResourceId = input.BasedResourceId
};
await _distributedEventBus.PublishAsync(eto);
```

## Multi-Language Support

### Question Localization
- **Primary Language**: Chinese as primary language
- **Secondary Language**: English translations
- **Validation**: Ensures required translations are present
- **Chart Generation**: Language-specific chart data

### Choice Localization
- **Pipe-Separated Format**: "选项1|选项2|选项3"
- **English Mapping**: Corresponding English choices
- **Display Logic**: Automatic language selection based on context

## Security & Permissions

### Permission Structure
- **NextEventPermissions.Surveys.Default**: Base survey access
- **NextEventPermissions.Surveys.List**: View survey listings
- **NextEventPermissions.Surveys.CreateOrUpdate**: Modify surveys
- **NextEventPermissions.Surveys.Delete**: Remove surveys

### Data Security
- **Response Privacy**: Secure handling of user responses
- **Input Validation**: Comprehensive validation of all survey inputs
- **Access Control**: Role-based permissions on survey operations
- **Audit Logging**: Complete audit trail for survey activities

### WeChat Security
- **QR Code Security**: Secure QR code generation and tracking
- **User Authentication**: WeChat user integration and validation
- **Data Encryption**: Secure data transmission and storage

## Analytics & Reporting

### Response Analytics
- **Completion Rates**: Track survey completion vs abandonment
- **Response Patterns**: Analyze user response patterns
- **Time Analytics**: Response time and engagement metrics
- **User Attribution**: Link responses to specific users and promoters

### Chart Generation
- **Pie Charts**: For single-choice questions
- **Bar Charts**: For multiple-choice questions
- **Time Series**: For live survey tracking
- **Export Formats**: Multiple export options for data analysis

### Live Dashboard Integration
- **Real-Time Updates**: Live data streaming to presentation interfaces
- **Visual Analytics**: Dynamic chart updates during live events
- **Presenter Tools**: Special interfaces for event presenters

## API Endpoints

### Public Survey Endpoints
- `GET /api/app/survey/getlist` - Paginated survey listing
- `GET /api/app/survey/getforediting/{id}` - Survey details for editing
- `GET /api/app/survey/getforeditingwithquestions/{id}` - Survey with questions

### Survey Management Endpoints
- `POST /api/app/survey/add` - Create new survey
- `POST /api/app/survey/update` - Update existing survey
- `POST /api/app/survey/delete` - Delete surveys (batch operation)
- `POST /api/app/survey/updatequestionorder` - Reorder questions

### Analytics Endpoints
- `GET /api/app/survey/results/{id}` - Survey response analytics
- `GET /api/app/survey/results/json/{id}` - JSON export of results
- `GET /api/app/survey/live/{id}` - Live survey analytics
- `GET /api/app/survey/chart/{id}` - Chart data generation

### Distribution Endpoints
- `GET /api/app/survey/qr/{id}` - Generate QR code
- `GET /api/app/survey/url/{id}` - Get survey URL

## Performance Optimizations

### .NET 9 Enhancements
- **AsNoTracking()**: Read-only query optimization for analytics
- **AsSplitQuery()**: Complex query performance improvement
- **Parallel Processing**: Concurrent response processing
- **Collection Expressions**: Modern C# syntax for better performance

### Caching Strategy
- **Redis Integration**: Live survey data caching
- **Response Caching**: Cache frequent analytics queries
- **Chart Data Caching**: Cache generated chart data

### Database Optimization
- **Batch Processing**: Efficient batch operations for responses
- **Index Optimization**: Optimized indexes for analytics queries
- **Connection Pooling**: Efficient database connection management

## Error Handling & Monitoring

### Exception Management
- **Validation Errors**: Comprehensive input validation
- **WeChat API Errors**: Handle WeChat integration failures
- **Analytics Errors**: Graceful handling of analytics failures
- **Live Data Errors**: Robust error handling for real-time features

### Monitoring & Analytics
- **Response Metrics**: Track survey response rates and performance
- **Error Rate Monitoring**: Monitor and alert on error rates
- **Performance Metrics**: Response time and throughput monitoring
- **User Engagement**: Track user engagement patterns

## Best Practices

### Survey Design
1. **Question Flow**: Design logical question progression
2. **Response Validation**: Implement appropriate validation rules
3. **Mobile Optimization**: Ensure mobile-friendly survey design
4. **Accessibility**: Design for accessibility compliance

### Performance
1. **Pagination**: Implement proper pagination for large datasets
2. **Caching**: Use caching for frequently accessed data
3. **Async Operations**: Use async patterns for I/O operations
4. **Batch Processing**: Process responses in batches for efficiency

### Analytics
1. **Real-Time vs Batch**: Choose appropriate processing patterns
2. **Data Aggregation**: Efficient data aggregation strategies
3. **Export Optimization**: Optimize data export operations
4. **Chart Performance**: Optimize chart generation and rendering

## Integration Examples

### Creating Multi-Language Survey
```csharp
var survey = new CreateUpdateSuveryDto
{
    SurveyTitle = "Customer Satisfaction Survey",
    SurveySummary = "Help us improve our services",
    CategoryId = customerSurveyCategoryId
};
var result = await surveyAppService.CreateAsync(survey);
```

### Processing Survey Results
```csharp
public async Task<SurveyAnswerChartData> GenerateChartData(Guid surveyId, string language)
{
    var chartData = await surveyAppService.GetSurveyAnswerChartDataAsync(new GetSurveyChartDataInputDto
    {
        SurveyId = surveyId,
        Language = language
    });
    return chartData;
}
```

### Live Survey Monitoring
```csharp
public async Task<LiveSurveyResults> GetLiveResults(Guid surveyId, bool isFromPresenter)
{
    var liveResults = await surveyAppService.GetLiveSurveyResultsAsync(new GetLiveSurveyResultInputDto
    {
        SurveyId = surveyId,
        IsFromPresenter = isFromPresenter,
        BasedResourceId = currentEventId
    });
    return liveResults;
}
```

## Future Enhancements

### Planned Features
- **Advanced Question Types**: Matrix questions, ranking, file upload
- **AI-Powered Analytics**: Machine learning insights and predictions
- **Advanced Branching**: Complex conditional logic and skip patterns
- **Integration APIs**: Third-party system integration capabilities

### Technical Improvements
- **GraphQL API**: Enhanced querying capabilities for complex data
- **Real-time Collaboration**: Multi-user survey editing
- **Advanced Caching**: Intelligent caching strategies
- **Performance Monitoring**: Enhanced performance analytics

### Analytics Enhancements
- **Predictive Analytics**: AI-powered response prediction
- **Advanced Visualization**: Interactive charts and dashboards
- **Export Enhancements**: More export formats and options
- **Benchmark Analytics**: Industry and historical comparisons