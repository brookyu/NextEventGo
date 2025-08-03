package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// ArticleService defines the interface for article management operations
type ArticleService interface {
	// Article CRUD Operations
	CreateArticle(ctx context.Context, article *entities.SiteArticle) error
	GetArticleByID(ctx context.Context, id uuid.UUID, options *repositories.ArticleListOptions) (*entities.SiteArticle, error)
	GetAllArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error)
	UpdateArticle(ctx context.Context, article *entities.SiteArticle) error
	DeleteArticle(ctx context.Context, id uuid.UUID) error
	
	// Article Publishing
	PublishArticle(ctx context.Context, id uuid.UUID) error
	UnpublishArticle(ctx context.Context, id uuid.UUID) error
	PublishMultipleArticles(ctx context.Context, ids []uuid.UUID) error
	
	// Article Search and Filtering
	SearchArticles(ctx context.Context, criteria *repositories.ArticleSearchCriteria, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error)
	GetArticlesByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error)
	GetPublishedArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error)
	GetDraftArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error)
	GetArticleByPromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error)
	
	// Article Analytics
	TrackArticleView(ctx context.Context, articleId uuid.UUID, trackingData *ArticleViewTrackingData) error
	TrackArticleRead(ctx context.Context, articleId uuid.UUID, trackingData *ArticleReadTrackingData) error
	GetArticleAnalytics(ctx context.Context, articleId uuid.UUID, days int) (*repositories.ArticleWithAnalytics, error)
	GetPopularArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
	GetMostViewedArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
	GetMostReadArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error)
	
	// Article Statistics
	GetArticleCount(ctx context.Context) (int64, error)
	GetPublishedCount(ctx context.Context) (int64, error)
	GetDraftCount(ctx context.Context) (int64, error)
	GetCategoryArticleCount(ctx context.Context, categoryId uuid.UUID) (int64, error)
	
	// Content Validation and Processing
	ValidateArticleContent(ctx context.Context, article *entities.SiteArticle) error
	ProcessArticleContent(ctx context.Context, article *entities.SiteArticle) error
	GenerateArticleSummary(ctx context.Context, content string, maxLength int) (string, error)
	
	// Promotion Code Management
	GeneratePromotionCode(ctx context.Context, articleId uuid.UUID) (string, error)
	ValidatePromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error)
}

// ArticleCategoryService defines the interface for article category management operations
type ArticleCategoryService interface {
	// Category CRUD Operations
	CreateCategory(ctx context.Context, category *entities.ArticleCategory) error
	GetCategoryByID(ctx context.Context, id uuid.UUID) (*entities.ArticleCategory, error)
	GetAllCategories(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error)
	GetAllCategoriesOrdered(ctx context.Context) ([]*entities.ArticleCategory, error)
	GetActiveCategories(ctx context.Context) ([]*entities.ArticleCategory, error)
	GetCategoryByName(ctx context.Context, name string) (*entities.ArticleCategory, error)
	UpdateCategory(ctx context.Context, category *entities.ArticleCategory) error
	DeleteCategory(ctx context.Context, id uuid.UUID) error
	
	// Category Statistics
	GetCategoryCount(ctx context.Context) (int64, error)
	GetCategoryWithArticleCount(ctx context.Context, categoryId uuid.UUID) (*repositories.CategoryWithArticleCount, error)
	GetAllCategoriesWithCounts(ctx context.Context) ([]*repositories.CategoryWithArticleCount, error)
}

// AnalyticsService defines the interface for analytics operations
type AnalyticsService interface {
	// Hit Tracking
	TrackHit(ctx context.Context, hit *entities.Hit) error
	TrackView(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *ViewTrackingData) error
	TrackRead(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *ReadTrackingData) error
	TrackClick(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *ClickTrackingData) error
	TrackShare(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *ShareTrackingData) error
	
	// Analytics Queries
	GetHitAnalytics(ctx context.Context, filter *repositories.HitAnalyticsFilter) (*repositories.HitAnalytics, error)
	GetDailyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DailyHitStats, error)
	GetUserEngagement(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.UserEngagementStats, error)
	GetReadingAnalytics(ctx context.Context, resourceId uuid.UUID, days int) (*repositories.ReadingAnalytics, error)
	GetGeographicStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.GeographicStats, error)
	GetDeviceStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DeviceStats, error)
	
	// Promotion Analytics
	GetPromotionAnalytics(ctx context.Context, promotionCode string, days int) (*repositories.PromotionAnalytics, error)
	GetTopPromotions(ctx context.Context, limit int, days int) ([]*repositories.PromotionStats, error)
}

// Data Transfer Objects

// ArticleViewTrackingData represents data for tracking article views
type ArticleViewTrackingData struct {
	UserId        *uuid.UUID
	SessionId     string
	IPAddress     string
	UserAgent     string
	Referrer      string
	PromotionCode string
	Country       string
	City          string
	DeviceType    string
	Platform      string
	Browser       string
	WeChatOpenId  string
	WeChatUnionId string
}

// ArticleReadTrackingData represents data for tracking article reads
type ArticleReadTrackingData struct {
	*ArticleViewTrackingData
	ReadDuration   int     // Time spent reading in seconds
	ReadPercentage float64 // Percentage of content read
	ScrollDepth    float64 // Maximum scroll depth reached
}

// ViewTrackingData represents generic view tracking data
type ViewTrackingData struct {
	UserId        *uuid.UUID
	SessionId     string
	IPAddress     string
	UserAgent     string
	Referrer      string
	PromotionCode string
	Country       string
	City          string
	DeviceType    string
	Platform      string
	Browser       string
	WeChatOpenId  string
	WeChatUnionId string
}

// ReadTrackingData represents generic read tracking data
type ReadTrackingData struct {
	*ViewTrackingData
	ReadDuration   int
	ReadPercentage float64
	ScrollDepth    float64
}

// ClickTrackingData represents click tracking data
type ClickTrackingData struct {
	*ViewTrackingData
	ClickTarget string // What was clicked
	ClickX      int    // X coordinate of click
	ClickY      int    // Y coordinate of click
}

// ShareTrackingData represents share tracking data
type ShareTrackingData struct {
	*ViewTrackingData
	SharePlatform string // Platform shared to (WeChat, Weibo, etc.)
	ShareMethod   string // Method of sharing (link, QR code, etc.)
}

// ArticleCreateRequest represents article creation request
type ArticleCreateRequest struct {
	Title             string
	Summary           string
	Content           string
	Author            string
	CategoryId        uuid.UUID
	SiteImageId       *uuid.UUID
	PromotionPicId    *uuid.UUID
	FrontCoverImageUrl string
	IsPublished       bool
	CreatedBy         *uuid.UUID
}

// ArticleUpdateRequest represents article update request
type ArticleUpdateRequest struct {
	Title             *string
	Summary           *string
	Content           *string
	Author            *string
	CategoryId        *uuid.UUID
	SiteImageId       *uuid.UUID
	PromotionPicId    *uuid.UUID
	FrontCoverImageUrl *string
	IsPublished       *bool
	UpdatedBy         *uuid.UUID
}

// ArticleValidationConfig represents article validation configuration
type ArticleValidationConfig struct {
	MinTitleLength    int
	MaxTitleLength    int
	MinContentLength  int
	MaxContentLength  int
	RequiredFields    []string
	AllowedHTMLTags   []string
	ForbiddenWords    []string
	MaxSummaryLength  int
}

// ContentProcessingOptions represents content processing options
type ContentProcessingOptions struct {
	SanitizeHTML       bool
	GenerateSummary    bool
	OptimizeImages     bool
	GenerateTableOfContents bool
	ExtractKeywords    bool
	CheckPlagiarism    bool
}

// ArticleSearchRequest represents article search request
type ArticleSearchRequest struct {
	Query         string
	CategoryId    *uuid.UUID
	Author        string
	IsPublished   *bool
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	PromotionCode string
	SortBy        string
	SortOrder     string
	Offset        int
	Limit         int
}
