package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// VideoRepository defines the interface for video data access
type VideoRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, video *entities.Video) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Video, error)
	GetBySlug(ctx context.Context, slug string) (*entities.Video, error)
	Update(ctx context.Context, video *entities.Video) error
	Delete(ctx context.Context, id uuid.UUID) error
	SoftDelete(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error

	// List and search operations
	List(ctx context.Context, filter VideoFilter) ([]*entities.Video, error)
	Count(ctx context.Context, filter VideoFilter) (int64, error)
	Search(ctx context.Context, query string, filter VideoFilter) ([]*entities.Video, error)

	// Status operations
	UpdateStatus(ctx context.Context, id uuid.UUID, status entities.VideoStatus) error
	GetByStatus(ctx context.Context, status entities.VideoStatus, limit int) ([]*entities.Video, error)
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.VideoStatus) error

	// Live video operations
	StartLiveVideo(ctx context.Context, id uuid.UUID, startTime time.Time) error
	EndLiveVideo(ctx context.Context, id uuid.UUID, endTime time.Time) error
	GetLiveVideos(ctx context.Context) ([]*entities.Video, error)
	GetScheduledVideos(ctx context.Context, before time.Time) ([]*entities.Video, error)

	// Analytics operations
	IncrementViewCount(ctx context.Context, id uuid.UUID) error
	IncrementLikeCount(ctx context.Context, id uuid.UUID) error
	IncrementShareCount(ctx context.Context, id uuid.UUID) error
	IncrementCommentCount(ctx context.Context, id uuid.UUID) error
	UpdateWatchTime(ctx context.Context, id uuid.UUID, watchTime int64) error
	UpdateEngagementMetrics(ctx context.Context, id uuid.UUID, metrics VideoEngagementMetrics) error

	// Category operations
	GetByCategory(ctx context.Context, categoryID uuid.UUID, filter VideoFilter) ([]*entities.Video, error)
	GetByCategorySlug(ctx context.Context, categorySlug string, filter VideoFilter) ([]*entities.Video, error)
	UpdateCategory(ctx context.Context, id uuid.UUID, categoryID *uuid.UUID) error

	// Event association operations
	GetByEvent(ctx context.Context, eventID uuid.UUID) ([]*entities.Video, error)
	AssociateWithEvent(ctx context.Context, videoID, eventID uuid.UUID) error
	DisassociateFromEvent(ctx context.Context, videoID uuid.UUID) error

	// Featured and trending operations
	GetFeatured(ctx context.Context, limit int) ([]*entities.Video, error)
	GetTrending(ctx context.Context, timeframe time.Duration, limit int) ([]*entities.Video, error)
	GetPopular(ctx context.Context, timeframe time.Duration, limit int) ([]*entities.Video, error)
	GetRecentlyAdded(ctx context.Context, limit int) ([]*entities.Video, error)

	// User-specific operations
	GetByUser(ctx context.Context, userID uuid.UUID, filter VideoFilter) ([]*entities.Video, error)
	GetUserFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.Video, error)
	GetUserWatchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.Video, error)

	// Bulk operations
	BulkCreate(ctx context.Context, videos []*entities.Video) error
	BulkUpdate(ctx context.Context, videos []*entities.Video) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error

	// Advanced queries
	GetRelated(ctx context.Context, videoID uuid.UUID, limit int) ([]*entities.Video, error)
	GetRecommended(ctx context.Context, userID *uuid.UUID, limit int) ([]*entities.Video, error)
	GetByTags(ctx context.Context, tags []string, filter VideoFilter) ([]*entities.Video, error)
	GetByDateRange(ctx context.Context, startDate, endDate time.Time, filter VideoFilter) ([]*entities.Video, error)

	// Statistics
	GetStatistics(ctx context.Context, filter VideoFilter) (*VideoStatistics, error)
	GetCategoryStatistics(ctx context.Context, categoryID uuid.UUID) (*VideoStatistics, error)
	GetUserStatistics(ctx context.Context, userID uuid.UUID) (*VideoStatistics, error)
}

// VideoFilter represents filtering options for video queries
type VideoFilter struct {
	// Pagination
	Offset int
	Limit  int

	// Basic filters
	Status     *entities.VideoStatus
	Type       *entities.VideoType
	Quality    *entities.VideoQuality
	CategoryID *uuid.UUID
	UserID     *uuid.UUID
	EventID    *uuid.UUID

	// Content filters
	Search   string
	Tags     []string
	Keywords []string

	// Date filters
	CreatedAfter    *time.Time
	CreatedBefore   *time.Time
	UpdatedAfter    *time.Time
	UpdatedBefore   *time.Time
	PublishedAfter  *time.Time
	PublishedBefore *time.Time
	StartTimeAfter  *time.Time
	StartTimeBefore *time.Time

	// Boolean filters
	IsOpen             *bool
	RequireAuth        *bool
	SupportInteraction *bool
	AllowDownload      *bool
	IsFeatured         *bool
	IsLive             *bool

	// Numeric filters
	MinDuration *int
	MaxDuration *int
	MinViews    *int64
	MaxViews    *int64

	// Include relationships
	IncludeCategory    bool
	IncludeImages      bool
	IncludeArticles    bool
	IncludeSurvey      bool
	IncludeEvent       bool
	IncludeSessions    bool
	IncludeAnalytics   bool

	// Sorting
	SortBy    string // created_at, updated_at, title, view_count, like_count, duration, start_time
	SortOrder string // asc, desc
}

// VideoEngagementMetrics represents engagement metrics for a video
type VideoEngagementMetrics struct {
	ViewCount        int64
	LikeCount        int64
	ShareCount       int64
	CommentCount     int64
	WatchTime        int64
	AverageWatchTime float64
	CompletionRate   float64
	EngagementScore  float64
}

// VideoStatistics represents aggregated video statistics
type VideoStatistics struct {
	TotalVideos      int64
	TotalViews       int64
	TotalLikes       int64
	TotalShares      int64
	TotalComments    int64
	TotalWatchTime   int64
	AverageViews     float64
	AverageLikes     float64
	AverageShares    float64
	AverageComments  float64
	AverageWatchTime float64
	AverageDuration  float64
	CompletionRate   float64
	EngagementRate   float64

	// Status breakdown
	DraftCount     int64
	ScheduledCount int64
	LiveCount      int64
	EndedCount     int64
	ArchivedCount  int64

	// Type breakdown
	LiveVideoCount      int64
	OnDemandVideoCount  int64
	RecordedVideoCount  int64
	StreamingVideoCount int64

	// Quality breakdown
	QualityStats map[entities.VideoQuality]int64

	// Time-based stats
	ViewsToday     int64
	ViewsThisWeek  int64
	ViewsThisMonth int64
	ViewsThisYear  int64

	// Top performers
	MostViewedVideo  *entities.Video
	MostLikedVideo   *entities.Video
	MostSharedVideo  *entities.Video
	LongestVideo     *entities.Video
	NewestVideo      *entities.Video
}

// VideoSessionRepository defines the interface for video session data access
type VideoSessionRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, session *entities.VideoSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.VideoSession, error)
	Update(ctx context.Context, session *entities.VideoSession) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Session management
	GetBySessionID(ctx context.Context, sessionID string) (*entities.VideoSession, error)
	GetByVideoAndUser(ctx context.Context, videoID, userID uuid.UUID) ([]*entities.VideoSession, error)
	GetByVideoAndSession(ctx context.Context, videoID uuid.UUID, sessionID string) (*entities.VideoSession, error)
	GetActiveSessionsForVideo(ctx context.Context, videoID uuid.UUID) ([]*entities.VideoSession, error)
	GetUserActiveSessions(ctx context.Context, userID uuid.UUID) ([]*entities.VideoSession, error)

	// Analytics operations
	GetSessionsByVideo(ctx context.Context, videoID uuid.UUID, filter VideoSessionFilter) ([]*entities.VideoSession, error)
	GetSessionsByUser(ctx context.Context, userID uuid.UUID, filter VideoSessionFilter) ([]*entities.VideoSession, error)
	GetSessionStatistics(ctx context.Context, videoID uuid.UUID) (*VideoSessionStatistics, error)
	GetUserSessionStatistics(ctx context.Context, userID uuid.UUID) (*VideoSessionStatistics, error)

	// Cleanup operations
	CleanupAbandonedSessions(ctx context.Context, olderThan time.Time) error
	MarkInactiveSessions(ctx context.Context, inactiveThreshold time.Duration) error

	// Bulk operations
	BulkCreate(ctx context.Context, sessions []*entities.VideoSession) error
	BulkUpdate(ctx context.Context, sessions []*entities.VideoSession) error
}

// VideoSessionFilter represents filtering options for video session queries
type VideoSessionFilter struct {
	// Pagination
	Offset int
	Limit  int

	// Basic filters
	Status    *entities.VideoSessionStatus
	VideoID   *uuid.UUID
	UserID    *uuid.UUID
	SessionID *string

	// Date filters
	StartTimeAfter  *time.Time
	StartTimeBefore *time.Time
	EndTimeAfter    *time.Time
	EndTimeBefore   *time.Time

	// Completion filters
	MinCompletionPercentage *float64
	MaxCompletionPercentage *float64
	IsCompleted             *bool

	// Device filters
	DeviceType []string
	Browser    []string
	OS         []string
	Country    []string

	// Include relationships
	IncludeVideo bool
	IncludeUser  bool

	// Sorting
	SortBy    string // start_time, end_time, watched_duration, completion_percentage
	SortOrder string // asc, desc
}

// VideoSessionStatistics represents aggregated video session statistics
type VideoSessionStatistics struct {
	TotalSessions        int64
	CompletedSessions    int64
	AbandonedSessions    int64
	AverageWatchTime     float64
	AverageCompletion    float64
	AverageEngagement    float64
	TotalWatchTime       int64
	UniqueViewers        int64
	ReturnViewers        int64
	CompletionRate       float64
	AbandonmentRate      float64
	AverageSessionLength float64

	// Device breakdown
	DeviceStats   map[string]int64
	BrowserStats  map[string]int64
	OSStats       map[string]int64
	CountryStats  map[string]int64

	// Time-based stats
	SessionsToday     int64
	SessionsThisWeek  int64
	SessionsThisMonth int64

	// Quality stats
	QualityPreferences map[string]int64
	AveragePlaybackSpeed float64
}

// VideoCategoryRepository defines the interface for video category data access
type VideoCategoryRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, category *entities.VideoCategory) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.VideoCategory, error)
	GetBySlug(ctx context.Context, slug string) (*entities.VideoCategory, error)
	Update(ctx context.Context, category *entities.VideoCategory) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Hierarchy operations
	GetRootCategories(ctx context.Context) ([]*entities.VideoCategory, error)
	GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.VideoCategory, error)
	GetCategoryTree(ctx context.Context) ([]*entities.VideoCategory, error)
	GetCategoryPath(ctx context.Context, categoryID uuid.UUID) ([]*entities.VideoCategory, error)

	// List operations
	List(ctx context.Context, filter VideoCategoryFilter) ([]*entities.VideoCategory, error)
	Count(ctx context.Context, filter VideoCategoryFilter) (int64, error)
	GetActive(ctx context.Context) ([]*entities.VideoCategory, error)
	GetFeatured(ctx context.Context) ([]*entities.VideoCategory, error)

	// Video count operations
	UpdateVideoCount(ctx context.Context, categoryID uuid.UUID) error
	GetCategoriesWithVideos(ctx context.Context) ([]*entities.VideoCategory, error)

	// Bulk operations
	BulkUpdateVideoCount(ctx context.Context, categoryIDs []uuid.UUID) error
}

// VideoCategoryFilter represents filtering options for video category queries
type VideoCategoryFilter struct {
	// Pagination
	Offset int
	Limit  int

	// Basic filters
	ParentID   *uuid.UUID
	Level      *int
	IsActive   *bool
	IsVisible  *bool
	IsFeatured *bool

	// Search
	Search string
	Name   string

	// Include relationships
	IncludeParent   bool
	IncludeChildren bool
	IncludeVideos   bool
	IncludeImages   bool

	// Sorting
	SortBy    string // name, display_order, video_count, created_at
	SortOrder string // asc, desc
}
