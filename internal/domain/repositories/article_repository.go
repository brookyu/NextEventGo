package repositories

import (
	"context"

	"github.com/google/uuid"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// ArticleRepository defines the interface for article data access
type ArticleRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, article *entities.Article) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Article, error)
	GetByTitle(ctx context.Context, title string) (*entities.Article, error)
	GetByPromotionCode(ctx context.Context, code string) (*entities.Article, error)
	Update(ctx context.Context, article *entities.Article) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List operations
	List(ctx context.Context, options *ArticleListOptions) ([]*entities.Article, error)
	Count(ctx context.Context, options *ArticleListOptions) (int64, error)

	// Search operations
	Search(ctx context.Context, query string, options *ArticleSearchOptions) ([]*entities.Article, error)
	SearchCount(ctx context.Context, query string, options *ArticleSearchOptions) (int64, error)

	// Category-based operations
	GetByCategoryID(ctx context.Context, categoryID uuid.UUID, options *ArticleListOptions) ([]*entities.Article, error)
	CountByCategoryID(ctx context.Context, categoryID uuid.UUID) (int64, error)

	// Status-based operations
	GetByStatus(ctx context.Context, status entities.ArticleStatus, options *ArticleListOptions) ([]*entities.Article, error)
	CountByStatus(ctx context.Context, status entities.ArticleStatus) (int64, error)

	// Analytics operations
	GetMostViewed(ctx context.Context, limit int) ([]*entities.Article, error)
	GetMostRead(ctx context.Context, limit int) ([]*entities.Article, error)
	GetMostShared(ctx context.Context, limit int) ([]*entities.Article, error)
	GetRecentlyPublished(ctx context.Context, limit int) ([]*entities.Article, error)

	// Bulk operations
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.ArticleStatus) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error
}

// NewArticleListOptions defines extended options for the new article system
type NewArticleListOptions struct {
	Offset   int
	Limit    int
	OrderBy  string
	OrderDir string // "asc" or "desc"

	// Filters
	Status     *entities.ArticleStatus
	CategoryID *uuid.UUID
	AuthorID   *uuid.UUID
	CreatedBy  *uuid.UUID
	TagIDs     []uuid.UUID

	// Date filters
	CreatedAfter    *string
	CreatedBefore   *string
	PublishedAfter  *string
	PublishedBefore *string

	// Content filters
	HasCoverImage     bool
	HasPromotionImage bool
	MinViewCount      *int64
	MinReadCount      *int64

	// Include relationships
	IncludeCategory bool
	IncludeTags     bool
	IncludeImages   bool
	IncludeCreator  bool
}

// ArticleSearchOptions defines options for searching articles
type ArticleSearchOptions struct {
	Offset   int
	Limit    int
	OrderBy  string
	OrderDir string

	// Search scope
	SearchInTitle   bool
	SearchInSummary bool
	SearchInContent bool
	SearchInTags    bool

	// Filters (same as ArticleListOptions)
	Status     *entities.ArticleStatus
	CategoryID *uuid.UUID
	AuthorID   *uuid.UUID
	CreatedBy  *uuid.UUID

	// Include relationships
	IncludeCategory bool
	IncludeTags     bool
	IncludeImages   bool
}

// CategoryListOptions defines options for listing categories
type CategoryListOptions struct {
	Offset   int
	Limit    int
	OrderBy  string
	OrderDir string

	// Filters
	IsActive    *bool
	ParentID    *uuid.UUID
	Level       *int
	HasArticles *bool

	// Include relationships
	IncludeParent   bool
	IncludeChildren bool
	IncludeArticles bool
}

// TagRepository defines the interface for tag data access
type TagRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, tag *entities.Tag) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Tag, error)
	GetByName(ctx context.Context, name string) (*entities.Tag, error)
	GetBySlug(ctx context.Context, slug string) (*entities.Tag, error)
	Update(ctx context.Context, tag *entities.Tag) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List operations
	List(ctx context.Context, options *TagListOptions) ([]*entities.Tag, error)
	Count(ctx context.Context, options *TagListOptions) (int64, error)

	// Article-tag relationships
	GetByArticleID(ctx context.Context, articleID uuid.UUID) ([]*entities.Tag, error)
	AssignToArticle(ctx context.Context, articleID uuid.UUID, tagIDs []uuid.UUID) error
	RemoveFromArticle(ctx context.Context, articleID uuid.UUID, tagIDs []uuid.UUID) error
	ReplaceArticleTags(ctx context.Context, articleID uuid.UUID, tagIDs []uuid.UUID) error

	// Popular tags
	GetMostUsed(ctx context.Context, limit int) ([]*entities.Tag, error)
	GetByType(ctx context.Context, tagType entities.TagType) ([]*entities.Tag, error)

	// Search
	SearchByName(ctx context.Context, query string, limit int) ([]*entities.Tag, error)
}

// TagListOptions defines options for listing tags
type TagListOptions struct {
	Offset   int
	Limit    int
	OrderBy  string
	OrderDir string

	// Filters
	Type      *entities.TagType
	IsVisible *bool
	ParentID  *uuid.UUID
	MinUsage  *int64

	// Include relationships
	IncludeParent   bool
	IncludeChildren bool
	IncludeArticles bool
}

// ArticleTrackingRepository defines the interface for article tracking data access
type ArticleTrackingRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, tracking *entities.ArticleTracking) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.ArticleTracking, error)
	Update(ctx context.Context, tracking *entities.ArticleTracking) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Article-based operations
	GetByArticleID(ctx context.Context, articleID uuid.UUID) ([]*entities.ArticleTracking, error)
	GetByArticleAndSession(ctx context.Context, articleID uuid.UUID, sessionID string) (*entities.ArticleTracking, error)
	GetByArticleAndUser(ctx context.Context, articleID uuid.UUID, userID uuid.UUID) ([]*entities.ArticleTracking, error)

	// Analytics operations
	GetArticleAnalytics(ctx context.Context, articleID uuid.UUID) (*ArticleAnalyticsData, error)
	GetUserReadingHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.ArticleTracking, error)
	GetPopularArticles(ctx context.Context, timeRange string, limit int) ([]*ArticlePopularityData, error)

	// Aggregation operations
	GetTotalViews(ctx context.Context, articleID uuid.UUID) (int64, error)
	GetUniqueReaders(ctx context.Context, articleID uuid.UUID) (int64, error)
	GetAverageReadTime(ctx context.Context, articleID uuid.UUID) (float64, error)
	GetCompletionRate(ctx context.Context, articleID uuid.UUID) (float64, error)
}

// ArticleAnalyticsData represents aggregated analytics data
type ArticleAnalyticsData struct {
	ArticleID       uuid.UUID `json:"articleId"`
	TotalViews      int64     `json:"totalViews"`
	UniqueReaders   int64     `json:"uniqueReaders"`
	AverageReadTime float64   `json:"averageReadTime"`
	CompletionRate  float64   `json:"completionRate"`
	ShareCount      int64     `json:"shareCount"`
	LikeCount       int64     `json:"likeCount"`
	CommentCount    int64     `json:"commentCount"`
}

// ArticlePopularityData represents article popularity metrics
type ArticlePopularityData struct {
	ArticleID       uuid.UUID `json:"articleId"`
	Title           string    `json:"title"`
	ViewCount       int64     `json:"viewCount"`
	ReadCount       int64     `json:"readCount"`
	ShareCount      int64     `json:"shareCount"`
	EngagementScore float64   `json:"engagementScore"`
}
