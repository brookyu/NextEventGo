package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// HitAnalyticsFilter represents filters for analytics queries
type HitAnalyticsFilter struct {
	ResourceId    *uuid.UUID
	ResourceType  string
	UserId        *uuid.UUID
	HitType       entities.HitType
	StartDate     *time.Time
	EndDate       *time.Time
	Days          int // Number of days to look back from current date
	Country       string
	City          string
	DeviceType    string
	Platform      string
	Browser       string
	PromotionCode string
}

// HitRepository defines the interface for Hit data operations
type HitRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, hit *entities.Hit) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Hit, error)
	GetAll(ctx context.Context, offset, limit int) ([]*entities.Hit, error)
	Update(ctx context.Context, hit *entities.Hit) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Resource-specific queries
	GetByResource(ctx context.Context, resourceId uuid.UUID, resourceType string, offset, limit int) ([]*entities.Hit, error)
	GetByUser(ctx context.Context, userId uuid.UUID, offset, limit int) ([]*entities.Hit, error)
	GetBySession(ctx context.Context, sessionId string) ([]*entities.Hit, error)
	GetByPromotionCode(ctx context.Context, promotionCode string, offset, limit int) ([]*entities.Hit, error)

	// Analytics queries
	GetAnalytics(ctx context.Context, filter *HitAnalyticsFilter) (*HitAnalytics, error)
	GetDailyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*DailyHitStats, error)
	GetTopReferrers(ctx context.Context, resourceId uuid.UUID, resourceType string, limit int, days int) ([]*ReferrerStats, error)
	GetUserEngagement(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*UserEngagementStats, error)
	GetReadingAnalytics(ctx context.Context, resourceId uuid.UUID, days int) (*ReadingAnalytics, error)

	// Geographic analytics
	GetGeographicStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*GeographicStats, error)
	GetDeviceStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*DeviceStats, error)

	// Time-based analytics
	GetHourlyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*HourlyStats, error)
	GetWeeklyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, weeks int) ([]*WeeklyStats, error)
	GetMonthlyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, months int) ([]*MonthlyStats, error)

	// Promotion analytics
	GetPromotionStats(ctx context.Context, promotionCode string, days int) (*PromotionAnalytics, error)
	GetTopPromotions(ctx context.Context, limit int, days int) ([]*PromotionStats, error)

	// Counting operations
	Count(ctx context.Context) (int64, error)
	CountByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (int64, error)
	CountByUser(ctx context.Context, userId uuid.UUID) (int64, error)
	CountByFilter(ctx context.Context, filter *HitAnalyticsFilter) (int64, error)

	// Bulk operations
	CreateBatch(ctx context.Context, hits []*entities.Hit) error
	DeleteOldHits(ctx context.Context, olderThan time.Time) (int64, error)
}

// HitAnalytics represents comprehensive analytics data
type HitAnalytics struct {
	TotalHits         int64
	TotalViews        int64 // Total page views
	TotalReads        int64 // Total completed reads
	TotalShares       int64 // Total social shares
	UniqueUsers       int64
	UniqueVisitors    int64   // Unique visitors (same as UniqueUsers, for compatibility)
	ReturnVisitors    int64   // Returning visitors
	ReturnVisitorRate float64 // Return visitor rate as percentage
	UniqueSessions    int64
	AvgReadTime       float64
	AvgScrollDepth    float64
	CompletionRate    float64
	BounceRate        float64
	LastActivity      time.Time // Last recorded activity timestamp
	TopCountries      []GeographicStats
	TopDevices        []DeviceStats
	TopBrowsers       []BrowserStats
}

// DailyHitStats represents daily hit statistics
type DailyHitStats struct {
	Date           time.Time
	Views          int64
	Reads          int64
	UniqueUsers    int64
	AvgReadTime    float64
	CompletionRate float64
}

// UserEngagementStats represents user engagement statistics
type UserEngagementStats struct {
	UserId         uuid.UUID
	UserName       string
	TotalHits      int64
	TotalReadTime  int64
	AvgReadTime    float64
	CompletionRate float64
	LastActivity   time.Time
}

// ReadingAnalytics represents reading behavior analytics
type ReadingAnalytics struct {
	TotalReads           int64
	AvgReadTime          float64
	AverageReadTime      float64 // Alias for AvgReadTime for compatibility
	MedianReadTime       float64 // Median reading time
	AvgScrollDepth       float64
	AverageScrollDepth   float64 // Alias for AvgScrollDepth for compatibility
	CompletionRate       float64
	DropOffPoints        []DropOffPoint
	ReadingPatterns      []ReadingPattern
	ReadTimeDistribution []ReadTimeDistributionPoint // Reading time distribution data
}

// DropOffPoint represents where users typically stop reading
type DropOffPoint struct {
	Percentage float64
	Count      int64
}

// ReadingPattern represents reading behavior patterns
type ReadingPattern struct {
	TimeRange   string
	Count       int64
	AvgDuration float64
}

// ReadTimeDistributionPoint represents a point in reading time distribution
type ReadTimeDistributionPoint struct {
	TimeRange  string  // e.g., "0-30s", "30-60s", "1-2m", etc.
	Count      int64   // Number of readers in this time range
	Percentage float64 // Percentage of total readers
}

// GeographicStats represents geographic statistics
type GeographicStats struct {
	Country string
	City    string
	Count   int64
}

// DeviceStats represents device statistics
type DeviceStats struct {
	DeviceType string
	Platform   string
	Count      int64
}

// BrowserStats represents browser statistics
type BrowserStats struct {
	Browser string
	Count   int64
}

// HourlyStats represents hourly statistics
type HourlyStats struct {
	Hour  int
	Count int64
}

// WeeklyStats represents weekly statistics
type WeeklyStats struct {
	Week  time.Time
	Count int64
}

// MonthlyStats represents monthly statistics
type MonthlyStats struct {
	Month time.Time
	Count int64
}

// PromotionAnalytics represents promotion analytics
type PromotionAnalytics struct {
	PromotionCode  string
	TotalHits      int64
	UniqueUsers    int64
	ConversionRate float64
	TopSources     []ReferrerStats
}

// PromotionStats represents promotion statistics
type PromotionStats struct {
	PromotionCode string
	Count         int64
	UniqueUsers   int64
}
