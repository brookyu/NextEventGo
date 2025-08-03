package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// NewsRepository defines the interface for news data operations
type NewsRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, news *entities.News) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.News, error)
	GetBySlug(ctx context.Context, slug string) (*entities.News, error)
	Update(ctx context.Context, news *entities.News) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// List operations with filtering and pagination
	List(ctx context.Context, filter NewsFilter) ([]*entities.News, error)
	Count(ctx context.Context, filter NewsFilter) (int64, error)
	
	// Publishing operations
	Publish(ctx context.Context, id uuid.UUID, publishedAt time.Time) error
	Unpublish(ctx context.Context, id uuid.UUID) error
	Schedule(ctx context.Context, id uuid.UUID, scheduledAt time.Time) error
	
	// Status operations
	GetByStatus(ctx context.Context, status entities.NewsStatus, limit, offset int) ([]*entities.News, error)
	GetScheduledNews(ctx context.Context, before time.Time) ([]*entities.News, error)
	GetExpiredNews(ctx context.Context, before time.Time) ([]*entities.News, error)
	
	// Featured and priority operations
	GetFeatured(ctx context.Context, limit int) ([]*entities.News, error)
	GetByPriority(ctx context.Context, priority entities.NewsPriority, limit, offset int) ([]*entities.News, error)
	GetBreakingNews(ctx context.Context, limit int) ([]*entities.News, error)
	
	// Category operations
	GetByCategory(ctx context.Context, categoryID uuid.UUID, limit, offset int) ([]*entities.News, error)
	GetByCategorySlug(ctx context.Context, categorySlug string, limit, offset int) ([]*entities.News, error)
	
	// Author operations
	GetByAuthor(ctx context.Context, authorID uuid.UUID, limit, offset int) ([]*entities.News, error)
	
	// Search operations
	Search(ctx context.Context, query string, limit, offset int) ([]*entities.News, error)
	SearchByTags(ctx context.Context, tags []string, limit, offset int) ([]*entities.News, error)
	
	// Analytics operations
	IncrementViewCount(ctx context.Context, id uuid.UUID) error
	IncrementShareCount(ctx context.Context, id uuid.UUID) error
	IncrementLikeCount(ctx context.Context, id uuid.UUID) error
	IncrementCommentCount(ctx context.Context, id uuid.UUID) error
	
	// Related content
	GetRelated(ctx context.Context, newsID uuid.UUID, limit int) ([]*entities.News, error)
	GetPopular(ctx context.Context, since time.Time, limit int) ([]*entities.News, error)
	GetTrending(ctx context.Context, limit int) ([]*entities.News, error)
	
	// Bulk operations
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.NewsStatus) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error
	
	// WeChat integration
	GetByWeChatDraftID(ctx context.Context, draftID string) (*entities.News, error)
	GetByWeChatPublishedID(ctx context.Context, publishedID string) (*entities.News, error)
	UpdateWeChatStatus(ctx context.Context, id uuid.UUID, status string, wechatID string, url string) error
}

// NewsCategoryRepository defines the interface for news category data operations
type NewsCategoryRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, category *entities.NewsCategory) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.NewsCategory, error)
	GetBySlug(ctx context.Context, slug string) (*entities.NewsCategory, error)
	Update(ctx context.Context, category *entities.NewsCategory) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// List operations
	List(ctx context.Context, filter NewsCategoryFilter) ([]*entities.NewsCategory, error)
	Count(ctx context.Context, filter NewsCategoryFilter) (int64, error)
	
	// Hierarchy operations
	GetRootCategories(ctx context.Context) ([]*entities.NewsCategory, error)
	GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.NewsCategory, error)
	GetByLevel(ctx context.Context, level int) ([]*entities.NewsCategory, error)
	GetCategoryTree(ctx context.Context) ([]*entities.NewsCategory, error)
	
	// Featured and active operations
	GetActive(ctx context.Context) ([]*entities.NewsCategory, error)
	GetFeatured(ctx context.Context) ([]*entities.NewsCategory, error)
	
	// Statistics operations
	UpdateNewsCount(ctx context.Context, categoryID uuid.UUID) error
	GetCategoriesWithNewsCount(ctx context.Context) ([]*entities.NewsCategory, error)
	
	// Bulk operations
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, isActive bool) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error
}

// NewsArticleRepository defines the interface for news-article association operations
type NewsArticleRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, newsArticle *entities.NewsArticle) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.NewsArticle, error)
	Update(ctx context.Context, newsArticle *entities.NewsArticle) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Association operations
	GetByNewsID(ctx context.Context, newsID uuid.UUID) ([]*entities.NewsArticle, error)
	GetByArticleID(ctx context.Context, articleID uuid.UUID) ([]*entities.NewsArticle, error)
	GetByNewsAndArticle(ctx context.Context, newsID, articleID uuid.UUID) (*entities.NewsArticle, error)
	
	// Bulk operations
	CreateBulk(ctx context.Context, newsArticles []*entities.NewsArticle) error
	DeleteByNewsID(ctx context.Context, newsID uuid.UUID) error
	DeleteByArticleID(ctx context.Context, articleID uuid.UUID) error
	
	// Ordering operations
	UpdateDisplayOrder(ctx context.Context, id uuid.UUID, order int) error
	ReorderArticles(ctx context.Context, newsID uuid.UUID, articleOrders map[uuid.UUID]int) error
	
	// Featured operations
	GetMainStory(ctx context.Context, newsID uuid.UUID) (*entities.NewsArticle, error)
	GetFeaturedArticles(ctx context.Context, newsID uuid.UUID) ([]*entities.NewsArticle, error)
	SetMainStory(ctx context.Context, newsID, articleID uuid.UUID) error
	SetFeatured(ctx context.Context, id uuid.UUID, featured bool) error
}

// Filter structs for repository operations
type NewsFilter struct {
	// Status filters
	Status    *entities.NewsStatus
	Statuses  []entities.NewsStatus
	Type      *entities.NewsType
	Priority  *entities.NewsPriority
	
	// Publishing filters
	PublishedAfter  *time.Time
	PublishedBefore *time.Time
	ScheduledAfter  *time.Time
	ScheduledBefore *time.Time
	
	// Author filters
	AuthorID  *uuid.UUID
	AuthorIDs []uuid.UUID
	EditorID  *uuid.UUID
	
	// Category filters
	CategoryID   *uuid.UUID
	CategoryIDs  []uuid.UUID
	CategorySlug *string
	
	// Content filters
	Search   *string
	Tags     []string
	Keywords []string
	Language *string
	Region   *string
	
	// Feature filters
	IsFeatured *bool
	IsBreaking *bool
	IsSticky   *bool
	
	// Date filters
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	UpdatedAfter  *time.Time
	UpdatedBefore *time.Time
	
	// Analytics filters
	MinViewCount *int64
	MaxViewCount *int64
	
	// WeChat filters
	WeChatStatus *string
	HasWeChatID  *bool
	
	// Pagination
	Limit  int
	Offset int
	
	// Sorting
	SortBy    string // created_at, updated_at, published_at, view_count, etc.
	SortOrder string // asc, desc
	
	// Include relationships
	IncludeAuthor     bool
	IncludeEditor     bool
	IncludeCategories bool
	IncludeArticles   bool
	IncludeImages     bool
	IncludeHits       bool
}

type NewsCategoryFilter struct {
	// Status filters
	IsActive   *bool
	IsVisible  *bool
	IsFeatured *bool
	
	// Hierarchy filters
	ParentID *uuid.UUID
	Level    *int
	IsRoot   *bool
	
	// Content filters
	Search *string
	
	// Date filters
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	
	// Pagination
	Limit  int
	Offset int
	
	// Sorting
	SortBy    string // name, display_order, created_at, news_count
	SortOrder string // asc, desc
	
	// Include relationships
	IncludeParent   bool
	IncludeChildren bool
	IncludeNews     bool
	IncludeImages   bool
}
