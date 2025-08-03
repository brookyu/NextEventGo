package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// Article Analytics Tracking Data Types

// ArticleViewTrackingData contains data for tracking article views
type ArticleViewTrackingData struct {
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId"`
	IPAddress     string     `json:"ipAddress"`
	UserAgent     string     `json:"userAgent"`
	Referrer      string     `json:"referrer,omitempty"`
	PromotionCode string     `json:"promotionCode,omitempty"`

	// Location data
	Country string `json:"country,omitempty"`
	City    string `json:"city,omitempty"`

	// Device data
	DeviceType string `json:"deviceType,omitempty"`
	Platform   string `json:"platform,omitempty"`
	Browser    string `json:"browser,omitempty"`

	// WeChat data
	WeChatOpenID  string `json:"wechatOpenId,omitempty"`
	WeChatUnionID string `json:"wechatUnionId,omitempty"`

	// Additional metadata
	ViewStartTime time.Time              `json:"viewStartTime"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// ArticleReadTrackingData contains data for tracking article reading behavior
type ArticleReadTrackingData struct {
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId"`
	IPAddress     string     `json:"ipAddress"`
	UserAgent     string     `json:"userAgent"`
	Referrer      string     `json:"referrer,omitempty"`
	PromotionCode string     `json:"promotionCode,omitempty"`

	// Reading metrics
	ReadDuration   int     `json:"readDuration"`   // in seconds
	ReadPercentage float64 `json:"readPercentage"` // 0-100
	ScrollDepth    float64 `json:"scrollDepth"`    // 0-100

	// Reading behavior
	ReadStartTime  time.Time `json:"readStartTime"`
	ReadEndTime    time.Time `json:"readEndTime"`
	PauseCount     int       `json:"pauseCount"`
	TotalPauseTime int       `json:"totalPauseTime"` // in seconds
	ScrollEvents   int       `json:"scrollEvents"`
	ResizeEvents   int       `json:"resizeEvents"`
	FocusLossCount int       `json:"focusLossCount"`

	// Location data
	Country string `json:"country,omitempty"`
	City    string `json:"city,omitempty"`

	// Device data
	DeviceType string `json:"deviceType,omitempty"`
	Platform   string `json:"platform,omitempty"`
	Browser    string `json:"browser,omitempty"`

	// WeChat data
	WeChatOpenID  string `json:"wechatOpenId,omitempty"`
	WeChatUnionID string `json:"wechatUnionId,omitempty"`

	// Additional metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// ArticleShareTrackingData contains data for tracking article shares
type ArticleShareTrackingData struct {
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId"`
	IPAddress     string     `json:"ipAddress"`
	UserAgent     string     `json:"userAgent"`
	Referrer      string     `json:"referrer,omitempty"`
	PromotionCode string     `json:"promotionCode,omitempty"`

	// Share data
	Platform  string    `json:"platform"` // wechat, weibo, qq, etc.
	Method    string    `json:"method"`   // qr_code, link, native_share
	ShareText string    `json:"shareText,omitempty"`
	ShareURL  string    `json:"shareUrl,omitempty"`
	ShareTime time.Time `json:"shareTime"`

	// Location data
	Country string `json:"country,omitempty"`
	City    string `json:"city,omitempty"`

	// Device data
	DeviceType string `json:"deviceType,omitempty"`
	Browser    string `json:"browser,omitempty"`

	// WeChat data
	WeChatOpenID  string `json:"wechatOpenId,omitempty"`
	WeChatUnionID string `json:"wechatUnionId,omitempty"`

	// Additional metadata
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// Article Analytics Response Types

// ArticleAnalyticsReport represents comprehensive analytics for an article
type ArticleAnalyticsReport struct {
	ArticleID     uuid.UUID `json:"articleId"`
	ArticleTitle  string    `json:"articleTitle"`
	ArticleAuthor string    `json:"articleAuthor"`
	GeneratedAt   time.Time `json:"generatedAt"`
	TimeRange     int       `json:"timeRange"` // days

	OverallStats      *ArticleOverallStats      `json:"overallStats"`
	ReadingAnalytics  *ArticleReadingAnalytics  `json:"readingAnalytics"`
	DailyStats        []*ArticleDailyStats      `json:"dailyStats"`
	GeographicStats   []*ArticleGeographicStats `json:"geographicStats"`
	DeviceStats       []*ArticleDeviceStats     `json:"deviceStats"`
	EngagementMetrics *ArticleEngagementMetrics `json:"engagementMetrics"`

	// Additional insights
	TopReferrers    []*ReferrerStats        `json:"topReferrers"`
	ReadingPatterns *ReadingPatternAnalysis `json:"readingPatterns"`
	SocialMetrics   *SocialMetricsAnalysis  `json:"socialMetrics"`
}

// ArticleOverallStats contains overall statistics for an article
type ArticleOverallStats struct {
	TotalViews     int64      `json:"totalViews"`
	TotalReads     int64      `json:"totalReads"`
	TotalShares    int64      `json:"totalShares"`
	UniqueVisitors int64      `json:"uniqueVisitors"`
	ReturnVisitors int64      `json:"returnVisitors"`
	BounceRate     float64    `json:"bounceRate"`
	PublishedAt    *time.Time `json:"publishedAt,omitempty"`
	LastViewedAt   *time.Time `json:"lastViewedAt,omitempty"`
}

// ArticleReadingAnalytics contains reading behavior analytics
type ArticleReadingAnalytics struct {
	AverageReadTime         float64        `json:"averageReadTime"`         // in seconds
	MedianReadTime          float64        `json:"medianReadTime"`          // in seconds
	CompletionRate          float64        `json:"completionRate"`          // percentage
	AverageScrollDepth      float64        `json:"averageScrollDepth"`      // percentage
	ReadTimeDistribution    map[string]int `json:"readTimeDistribution"`    // time ranges -> count
	ScrollDepthDistribution map[string]int `json:"scrollDepthDistribution"` // depth ranges -> count
}

// ArticleDailyStats contains daily statistics for an article
type ArticleDailyStats struct {
	Date        time.Time `json:"date"`
	Views       int64     `json:"views"`
	Reads       int64     `json:"reads"`
	Shares      int64     `json:"shares"`
	UniqueUsers int64     `json:"uniqueUsers"`
}

// ArticleGeographicStats contains geographic distribution of readers
type ArticleGeographicStats struct {
	Country     string `json:"country"`
	City        string `json:"city,omitempty"`
	Views       int64  `json:"views"`
	Reads       int64  `json:"reads"`
	UniqueUsers int64  `json:"uniqueUsers"`
}

// ArticleDeviceStats contains device and platform statistics
type ArticleDeviceStats struct {
	DeviceType  string `json:"deviceType"`
	Browser     string `json:"browser,omitempty"`
	Platform    string `json:"platform,omitempty"`
	Views       int64  `json:"views"`
	Reads       int64  `json:"reads"`
	UniqueUsers int64  `json:"uniqueUsers"`
}

// ArticleEngagementMetrics contains engagement analysis
type ArticleEngagementMetrics struct {
	OverallScore      float64 `json:"overallScore"`      // 0-100
	ReadingEngagement float64 `json:"readingEngagement"` // completion rate
	SocialEngagement  float64 `json:"socialEngagement"`  // share rate
	ReturnRate        float64 `json:"returnRate"`        // return visitor rate
	TimeOnPage        float64 `json:"timeOnPage"`        // average time in seconds
}

// ReferrerStats contains referrer statistics
type ReferrerStats struct {
	Referrer    string `json:"referrer"`
	Views       int64  `json:"views"`
	Reads       int64  `json:"reads"`
	UniqueUsers int64  `json:"uniqueUsers"`
}

// ReadingPatternAnalysis contains reading behavior patterns
type ReadingPatternAnalysis struct {
	PeakReadingHours   []int              `json:"peakReadingHours"`   // hours of day (0-23)
	AverageSessionTime float64            `json:"averageSessionTime"` // in seconds
	DropoffPoints      []DropoffPoint     `json:"dropoffPoints"`      // where readers stop
	EngagementHeatmap  map[string]float64 `json:"engagementHeatmap"`  // section -> engagement score
	ReadingVelocity    map[string]float64 `json:"readingVelocity"`    // section -> words per minute
}

// DropoffPoint represents where readers typically stop reading
type DropoffPoint struct {
	Position    float64 `json:"position"`    // percentage through article
	DropoffRate float64 `json:"dropoffRate"` // percentage of readers who stop here
}

// SocialMetricsAnalysis contains social sharing analysis
type SocialMetricsAnalysis struct {
	SharesByPlatform map[string]int64  `json:"sharesByPlatform"`
	SharesByMethod   map[string]int64  `json:"sharesByMethod"`
	ViralityScore    float64           `json:"viralityScore"` // shares per view
	SocialReach      int64             `json:"socialReach"`   // estimated reach
	InfluencerShares []InfluencerShare `json:"influencerShares"`
}

// InfluencerShare represents a share by an influential user
type InfluencerShare struct {
	UserID        uuid.UUID `json:"userId"`
	Platform      string    `json:"platform"`
	FollowerCount int64     `json:"followerCount"`
	ShareTime     time.Time `json:"shareTime"`
}

// Article Performance Types

// ArticlePerformanceData contains performance metrics for an article
type ArticlePerformanceData struct {
	Article         *entities.SiteArticle `json:"article"`
	ViewCount       int64                 `json:"viewCount"`
	ReadCount       int64                 `json:"readCount"`
	ShareCount      int64                 `json:"shareCount"`
	EngagementScore float64               `json:"engagementScore"`
	ReadingRate     float64               `json:"readingRate"`
	AverageReadTime float64               `json:"averageReadTime"`
	TrendDirection  string                `json:"trendDirection"` // "up", "down", "stable"
	TrendPercentage float64               `json:"trendPercentage"`
}

// ArticleComparisonData contains comparison metrics between articles
type ArticleComparisonData struct {
	Articles    []*ArticlePerformanceData `json:"articles"`
	Metric      string                    `json:"metric"`
	TimeRange   int                       `json:"timeRange"`
	GeneratedAt time.Time                 `json:"generatedAt"`
}

// Real-time Analytics Types

// ArticleRealtimeMetrics contains real-time metrics for an article
type ArticleRealtimeMetrics struct {
	ArticleID      uuid.UUID `json:"articleId"`
	CurrentReaders int       `json:"currentReaders"`
	RecentViews    int       `json:"recentViews"`  // last hour
	RecentReads    int       `json:"recentReads"`  // last hour
	RecentShares   int       `json:"recentShares"` // last hour
	ActiveSessions int       `json:"activeSessions"`
	LastUpdated    time.Time `json:"lastUpdated"`
}

// ArticleHeatmapData contains heatmap data for article sections
type ArticleHeatmapData struct {
	ArticleID   uuid.UUID           `json:"articleId"`
	Sections    []SectionEngagement `json:"sections"`
	GeneratedAt time.Time           `json:"generatedAt"`
}

// SectionEngagement contains engagement data for a specific section
type SectionEngagement struct {
	SectionID       string  `json:"sectionId"`
	StartPosition   float64 `json:"startPosition"` // percentage
	EndPosition     float64 `json:"endPosition"`   // percentage
	ViewCount       int64   `json:"viewCount"`
	AverageTime     float64 `json:"averageTime"`     // seconds spent in section
	EngagementScore float64 `json:"engagementScore"` // 0-100
}

// Batch Analytics Types

// ArticleAnalyticsBatch contains batch analytics data
type ArticleAnalyticsBatch struct {
	Articles  []uuid.UUID            `json:"articles"`
	Metrics   []string               `json:"metrics"`
	TimeRange int                    `json:"timeRange"`
	GroupBy   string                 `json:"groupBy"` // "day", "week", "month"
	Filters   map[string]interface{} `json:"filters"`
}

// ArticleAnalyticsSummary contains summary analytics for multiple articles
type ArticleAnalyticsSummary struct {
	TotalArticles   int                       `json:"totalArticles"`
	TotalViews      int64                     `json:"totalViews"`
	TotalReads      int64                     `json:"totalReads"`
	TotalShares     int64                     `json:"totalShares"`
	AverageReadTime float64                   `json:"averageReadTime"`
	TopPerformers   []*ArticlePerformanceData `json:"topPerformers"`
	TrendData       []*ArticleTrendData       `json:"trendData"`
	GeneratedAt     time.Time                 `json:"generatedAt"`
}

// ArticleTrendData contains trend information
type ArticleTrendData struct {
	Date        time.Time `json:"date"`
	Views       int64     `json:"views"`
	Reads       int64     `json:"reads"`
	Shares      int64     `json:"shares"`
	NewArticles int       `json:"newArticles"`
}

// Export Types

// ArticleAnalyticsExport contains data for exporting analytics
type ArticleAnalyticsExport struct {
	Format     string                 `json:"format"` // "csv", "xlsx", "json"
	Articles   []uuid.UUID            `json:"articles"`
	Metrics    []string               `json:"metrics"`
	TimeRange  int                    `json:"timeRange"`
	Filters    map[string]interface{} `json:"filters"`
	IncludeRaw bool                   `json:"includeRaw"` // include raw hit data
}

// ArticleAnalyticsExportResult contains export result
type ArticleAnalyticsExportResult struct {
	ExportID    uuid.UUID `json:"exportId"`
	Status      string    `json:"status"` // "processing", "completed", "failed"
	DownloadURL string    `json:"downloadUrl,omitempty"`
	FileSize    int64     `json:"fileSize,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	ExpiresAt   time.Time `json:"expiresAt"`
}
