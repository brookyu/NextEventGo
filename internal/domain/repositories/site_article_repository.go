package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// ArticleSearchCriteria represents search criteria for articles
type ArticleSearchCriteria struct {
	Title        string
	Author       string
	CategoryId   *uuid.UUID
	IsPublished  *bool
	CreatedAfter *time.Time
	CreatedBefore *time.Time
	PromotionCode string
}

// ArticleListOptions represents options for article listing
type ArticleListOptions struct {
	IncludeCategory bool
	IncludeCoverImage bool
	IncludePromotionImage bool
	IncludeHits bool
	SortBy string // "title", "created_at", "view_count", "read_count"
	SortOrder string // "asc", "desc"
}

// SiteArticleRepository defines the interface for SiteArticle data operations
type SiteArticleRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, article *entities.SiteArticle) error
	GetByID(ctx context.Context, id uuid.UUID, options *ArticleListOptions) (*entities.SiteArticle, error)
	GetAll(ctx context.Context, offset, limit int, options *ArticleListOptions) ([]*entities.SiteArticle, error)
	Update(ctx context.Context, article *entities.SiteArticle) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Advanced querying
	Search(ctx context.Context, criteria *ArticleSearchCriteria, offset, limit int, options *ArticleListOptions) ([]*entities.SiteArticle, error)
	GetByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int, options *ArticleListOptions) ([]*entities.SiteArticle, error)
	GetByPromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error)
	GetPublished(ctx context.Context, offset, limit int, options *ArticleListOptions) ([]*entities.SiteArticle, error)
	GetDrafts(ctx context.Context, offset, limit int, options *ArticleListOptions) ([]*entities.SiteArticle, error)
	
	// Analytics and statistics
	GetMostViewed(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
	GetMostRead(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
	GetByAuthor(ctx context.Context, author string, offset, limit int) ([]*entities.SiteArticle, error)
	
	// Counting operations
	Count(ctx context.Context) (int64, error)
	CountByCategory(ctx context.Context, categoryId uuid.UUID) (int64, error)
	CountByAuthor(ctx context.Context, author string) (int64, error)
	CountPublished(ctx context.Context) (int64, error)
	CountDrafts(ctx context.Context) (int64, error)
	CountBySearch(ctx context.Context, criteria *ArticleSearchCriteria) (int64, error)
	
	// Bulk operations
	PublishArticles(ctx context.Context, articleIds []uuid.UUID) error
	UnpublishArticles(ctx context.Context, articleIds []uuid.UUID) error
	UpdateViewCount(ctx context.Context, articleId uuid.UUID) error
	UpdateReadCount(ctx context.Context, articleId uuid.UUID) error
	
	// Related data operations
	GetArticleWithAnalytics(ctx context.Context, articleId uuid.UUID, days int) (*ArticleWithAnalytics, error)
	GetPopularArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
}

// ArticleWithAnalytics represents an article with its analytics data
type ArticleWithAnalytics struct {
	Article      *entities.SiteArticle
	TotalViews   int64
	TotalReads   int64
	UniqueUsers  int64
	AvgReadTime  float64
	ReadingRate  float64
	TopReferrers []ReferrerStats
	DailyStats   []DailyArticleStats
}

// ReferrerStats represents referrer statistics
type ReferrerStats struct {
	Referrer string
	Count    int64
}

// DailyArticleStats represents daily statistics for an article
type DailyArticleStats struct {
	Date       time.Time
	Views      int64
	Reads      int64
	UniqueUsers int64
}
