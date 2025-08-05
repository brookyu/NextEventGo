package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// CloudVideoRepository defines the interface for cloud video data operations
type CloudVideoRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, cloudVideo *entities.CloudVideo) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.CloudVideo, error)
	Update(ctx context.Context, cloudVideo *entities.CloudVideo) error
	Delete(ctx context.Context, id uuid.UUID) error
	SoftDelete(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error

	// List and search operations
	List(ctx context.Context, filter CloudVideoFilter) ([]*entities.CloudVideo, error)
	Count(ctx context.Context, filter CloudVideoFilter) (int64, error)
	Search(ctx context.Context, query string, filter CloudVideoFilter) ([]*entities.CloudVideo, error)

	// Status operations
	UpdateStatus(ctx context.Context, id uuid.UUID, status entities.CloudVideoStatus) error
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.CloudVideoStatus) error

	// Live video operations
	StartLiveVideo(ctx context.Context, id uuid.UUID, startTime time.Time) error
	EndLiveVideo(ctx context.Context, id uuid.UUID, endTime time.Time) error
	GetLiveVideos(ctx context.Context) ([]*entities.CloudVideo, error)
	GetScheduledVideos(ctx context.Context, before time.Time) ([]*entities.CloudVideo, error)

	// Analytics operations
	IncrementViewCount(ctx context.Context, id uuid.UUID) error
	IncrementLikeCount(ctx context.Context, id uuid.UUID) error
	IncrementShareCount(ctx context.Context, id uuid.UUID) error
	IncrementCommentCount(ctx context.Context, id uuid.UUID) error
	AddWatchTime(ctx context.Context, id uuid.UUID, seconds int64) error

	// Category operations
	GetByCategory(ctx context.Context, categoryID uuid.UUID, filter CloudVideoFilter) ([]*entities.CloudVideo, error)
	GetByCategorySlug(ctx context.Context, categorySlug string, filter CloudVideoFilter) ([]*entities.CloudVideo, error)

	// Event operations
	GetByEvent(ctx context.Context, eventID uuid.UUID, filter CloudVideoFilter) ([]*entities.CloudVideo, error)

	// Survey operations
	GetBySurvey(ctx context.Context, surveyID uuid.UUID, filter CloudVideoFilter) ([]*entities.CloudVideo, error)

	// Featured and popular operations
	GetFeatured(ctx context.Context, limit int) ([]*entities.CloudVideo, error)
	GetPopular(ctx context.Context, limit int, days int) ([]*entities.CloudVideo, error)
	GetTrending(ctx context.Context, limit int) ([]*entities.CloudVideo, error)
	GetRecentlyAdded(ctx context.Context, limit int) ([]*entities.CloudVideo, error)

	// User-specific operations
	GetByUser(ctx context.Context, userID uuid.UUID, filter CloudVideoFilter) ([]*entities.CloudVideo, error)
	GetUserFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.CloudVideo, error)
	GetUserWatchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.CloudVideo, error)

	// Bulk operations
	BulkCreate(ctx context.Context, cloudVideos []*entities.CloudVideo) error
	BulkUpdate(ctx context.Context, cloudVideos []*entities.CloudVideo) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error

	// Advanced queries
	GetWithRelations(ctx context.Context, id uuid.UUID, relations []string) (*entities.CloudVideo, error)
	GetByIDs(ctx context.Context, ids []uuid.UUID) ([]*entities.CloudVideo, error)
	Exists(ctx context.Context, id uuid.UUID) (bool, error)
}

// CloudVideoFilter represents filtering options for cloud video queries
type CloudVideoFilter struct {
	// Basic filters
	IDs        []uuid.UUID                    `json:"ids,omitempty"`
	Title      string                         `json:"title,omitempty"`
	Search     string                         `json:"search,omitempty"`
	VideoType  entities.CloudVideoType        `json:"videoType,omitempty"`
	Status     entities.CloudVideoStatus      `json:"status,omitempty"`
	Quality    entities.CloudVideoQuality     `json:"quality,omitempty"`
	IsOpen     *bool                          `json:"isOpen,omitempty"`
	IsDeleted  *bool                          `json:"isDeleted,omitempty"`

	// Relationship filters
	CategoryID   *uuid.UUID `json:"categoryId,omitempty"`
	EventID      *uuid.UUID `json:"eventId,omitempty"`
	SurveyID     *uuid.UUID `json:"surveyId,omitempty"`
	UserID       *uuid.UUID `json:"userId,omitempty"`
	CreatedBy    *uuid.UUID `json:"createdBy,omitempty"`

	// Feature filters
	SupportInteraction *bool `json:"supportInteraction,omitempty"`
	RequireAuth        *bool `json:"requireAuth,omitempty"`
	AllowDownload      *bool `json:"allowDownload,omitempty"`
	EnableComments     *bool `json:"enableComments,omitempty"`
	EnableLikes        *bool `json:"enableLikes,omitempty"`
	EnableSharing      *bool `json:"enableSharing,omitempty"`
	EnableAnalytics    *bool `json:"enableAnalytics,omitempty"`

	// Time filters
	CreatedAfter  *time.Time `json:"createdAfter,omitempty"`
	CreatedBefore *time.Time `json:"createdBefore,omitempty"`
	UpdatedAfter  *time.Time `json:"updatedAfter,omitempty"`
	UpdatedBefore *time.Time `json:"updatedBefore,omitempty"`
	StartAfter    *time.Time `json:"startAfter,omitempty"`
	StartBefore   *time.Time `json:"startBefore,omitempty"`
	EndAfter      *time.Time `json:"endAfter,omitempty"`
	EndBefore     *time.Time `json:"endBefore,omitempty"`

	// Analytics filters
	MinViewCount    *int64 `json:"minViewCount,omitempty"`
	MaxViewCount    *int64 `json:"maxViewCount,omitempty"`
	MinLikeCount    *int64 `json:"minLikeCount,omitempty"`
	MaxLikeCount    *int64 `json:"maxLikeCount,omitempty"`
	MinShareCount   *int64 `json:"minShareCount,omitempty"`
	MaxShareCount   *int64 `json:"maxShareCount,omitempty"`
	MinCommentCount *int64 `json:"minCommentCount,omitempty"`
	MaxCommentCount *int64 `json:"maxCommentCount,omitempty"`
	MinWatchTime    *int64 `json:"minWatchTime,omitempty"`
	MaxWatchTime    *int64 `json:"maxWatchTime,omitempty"`
	MinDuration     *int   `json:"minDuration,omitempty"`
	MaxDuration     *int   `json:"maxDuration,omitempty"`

	// Pagination and sorting
	Offset   int    `json:"offset,omitempty"`
	Limit    int    `json:"limit,omitempty"`
	SortBy   string `json:"sortBy,omitempty"`   // field name to sort by
	SortDesc bool   `json:"sortDesc,omitempty"` // sort direction

	// Include relationships
	IncludeCategory    bool `json:"includeCategory,omitempty"`
	IncludeEvent       bool `json:"includeEvent,omitempty"`
	IncludeSurvey      bool `json:"includeSurvey,omitempty"`
	IncludeImages      bool `json:"includeImages,omitempty"`
	IncludeArticles    bool `json:"includeArticles,omitempty"`
	IncludeSessions    bool `json:"includeSessions,omitempty"`
	IncludeAnalytics   bool `json:"includeAnalytics,omitempty"`
	IncludeQRCodes     bool `json:"includeQRCodes,omitempty"`
}

// CloudVideoSessionRepository defines the interface for cloud video session operations
type CloudVideoSessionRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, session *entities.CloudVideoSession) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.CloudVideoSession, error)
	Update(ctx context.Context, session *entities.CloudVideoSession) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Session management
	GetActiveSession(ctx context.Context, cloudVideoID uuid.UUID, sessionID string) (*entities.CloudVideoSession, error)
	GetUserSessions(ctx context.Context, userID uuid.UUID, cloudVideoID uuid.UUID) ([]*entities.CloudVideoSession, error)
	GetVideoSessions(ctx context.Context, cloudVideoID uuid.UUID, filter CloudVideoSessionFilter) ([]*entities.CloudVideoSession, error)
	EndSession(ctx context.Context, id uuid.UUID) error
	EndUserSessions(ctx context.Context, userID uuid.UUID, cloudVideoID uuid.UUID) error

	// Analytics operations
	GetSessionAnalytics(ctx context.Context, cloudVideoID uuid.UUID, startTime, endTime time.Time) (*CloudVideoSessionAnalytics, error)
	GetConcurrentViewers(ctx context.Context, cloudVideoID uuid.UUID, timestamp time.Time) (int64, error)
	GetPeakViewers(ctx context.Context, cloudVideoID uuid.UUID, startTime, endTime time.Time) (int64, time.Time, error)

	// Cleanup operations
	CleanupExpiredSessions(ctx context.Context, before time.Time) (int64, error)
}

// CloudVideoSessionFilter represents filtering options for session queries
type CloudVideoSessionFilter struct {
	CloudVideoID *uuid.UUID `json:"cloudVideoId,omitempty"`
	UserID       *uuid.UUID `json:"userId,omitempty"`
	SessionID    string     `json:"sessionId,omitempty"`
	IsCompleted  *bool      `json:"isCompleted,omitempty"`
	IsActive     *bool      `json:"isActive,omitempty"`
	DeviceType   string     `json:"deviceType,omitempty"`
	Country      string     `json:"country,omitempty"`
	StartAfter   *time.Time `json:"startAfter,omitempty"`
	StartBefore  *time.Time `json:"startBefore,omitempty"`
	Offset       int        `json:"offset,omitempty"`
	Limit        int        `json:"limit,omitempty"`
	SortBy       string     `json:"sortBy,omitempty"`
	SortDesc     bool       `json:"sortDesc,omitempty"`
}

// CloudVideoSessionAnalytics represents aggregated session analytics
type CloudVideoSessionAnalytics struct {
	TotalSessions        int64                                    `json:"totalSessions"`
	UniqueSessions       int64                                    `json:"uniqueSessions"`
	CompletedSessions    int64                                    `json:"completedSessions"`
	AverageWatchTime     float64                                  `json:"averageWatchTime"`
	AverageCompletion    float64                                  `json:"averageCompletion"`
	PeakConcurrentUsers  int64                                    `json:"peakConcurrentUsers"`
	PeakTime             time.Time                                `json:"peakTime"`
	DeviceDistribution   []entities.DeviceDistribution           `json:"deviceDistribution"`
	CountryDistribution  []entities.GeographicDistribution       `json:"countryDistribution"`
	QualityDistribution  []entities.QualityDistribution          `json:"qualityDistribution"`
}

// CloudVideoAnalyticRepository defines the interface for analytics operations
type CloudVideoAnalyticRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, analytic *entities.CloudVideoAnalytic) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.CloudVideoAnalytic, error)
	Update(ctx context.Context, analytic *entities.CloudVideoAnalytic) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Analytics queries
	GetByVideo(ctx context.Context, cloudVideoID uuid.UUID, periodType entities.CloudVideoAnalyticPeriod) ([]*entities.CloudVideoAnalytic, error)
	GetByPeriod(ctx context.Context, cloudVideoID uuid.UUID, periodType entities.CloudVideoAnalyticPeriod, start, end time.Time) (*entities.CloudVideoAnalytic, error)
	GetLatest(ctx context.Context, cloudVideoID uuid.UUID, periodType entities.CloudVideoAnalyticPeriod) (*entities.CloudVideoAnalytic, error)

	// Aggregation operations
	AggregateAnalytics(ctx context.Context, cloudVideoID uuid.UUID, periodType entities.CloudVideoAnalyticPeriod, start, end time.Time) (*entities.CloudVideoAnalytic, error)
	BulkAggregateAnalytics(ctx context.Context, cloudVideoIDs []uuid.UUID, periodType entities.CloudVideoAnalyticPeriod, start, end time.Time) error

	// Cleanup operations
	CleanupOldAnalytics(ctx context.Context, before time.Time) (int64, error)
}
