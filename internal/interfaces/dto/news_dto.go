package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// UserResponse represents a user response
type UserResponse struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
}

// ImageResponse represents an image response
type ImageResponse struct {
	ID       uuid.UUID `json:"id"`
	Filename string    `json:"filename"`
	URL      string    `json:"url"`
	Size     int64     `json:"size"`
}

// ArticleResponse represents an article response
type ArticleResponse struct {
	ID      uuid.UUID `json:"id"`
	Title   string    `json:"title"`
	Content string    `json:"content"`
	Author  string    `json:"author"`
}

// News DTO Types

// CreateNewsRequest represents a request to create news
type CreateNewsRequest struct {
	Title       string                `json:"title" binding:"required,max=500"`
	Subtitle    string                `json:"subtitle" binding:"max=1000"`
	Description string                `json:"description" binding:"max=2000"`
	Summary     string                `json:"summary" binding:"max=1000"`
	Type        entities.NewsType     `json:"type" binding:"required"`
	Priority    entities.NewsPriority `json:"priority" binding:"required"`

	// SEO and metadata
	Slug            string `json:"slug" binding:"max=500"`
	MetaTitle       string `json:"metaTitle" binding:"max=500"`
	MetaDescription string `json:"metaDescription" binding:"max=1000"`
	Keywords        string `json:"keywords" binding:"max=1000"`
	Tags            string `json:"tags" binding:"max=1000"`

	// Media
	FeaturedImageID *uuid.UUID `json:"featuredImageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	RequireAuth   bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// Localization
	Language string `json:"language" binding:"max=10"`
	Region   string `json:"region" binding:"max=10"`

	// Articles
	ArticleIDs      []uuid.UUID                       `json:"articleIds" binding:"required,min=1,max=8"`
	ArticleSettings map[uuid.UUID]NewsArticleSettings `json:"articleSettings"`

	// Categories
	CategoryIDs []uuid.UUID `json:"categoryIds"`
}

// UpdateNewsRequest represents a request to update news
type UpdateNewsRequest struct {
	Title       *string                `json:"title" binding:"omitempty,max=500"`
	Subtitle    *string                `json:"subtitle" binding:"omitempty,max=1000"`
	Description *string                `json:"description" binding:"omitempty,max=2000"`
	Summary     *string                `json:"summary" binding:"omitempty,max=1000"`
	Type        *entities.NewsType     `json:"type"`
	Priority    *entities.NewsPriority `json:"priority"`

	// SEO and metadata
	Slug            *string `json:"slug" binding:"omitempty,max=500"`
	MetaTitle       *string `json:"metaTitle" binding:"omitempty,max=500"`
	MetaDescription *string `json:"metaDescription" binding:"omitempty,max=1000"`
	Keywords        *string `json:"keywords" binding:"omitempty,max=1000"`
	Tags            *string `json:"tags" binding:"omitempty,max=1000"`

	// Media
	FeaturedImageID *uuid.UUID `json:"featuredImageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`

	// Configuration
	AllowComments *bool `json:"allowComments"`
	AllowSharing  *bool `json:"allowSharing"`
	IsFeatured    *bool `json:"isFeatured"`
	IsBreaking    *bool `json:"isBreaking"`
	RequireAuth   *bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// Articles (optional - only update if provided)
	ArticleIDs      *[]uuid.UUID                      `json:"articleIds" binding:"omitempty,min=1,max=8"`
	ArticleSettings map[uuid.UUID]NewsArticleSettings `json:"articleSettings"`

	// Categories
	CategoryIDs *[]uuid.UUID `json:"categoryIds"`
}

// NewsArticleSettings represents settings for a news-article association
type NewsArticleSettings struct {
	IsMainStory bool   `json:"isMainStory"`
	IsFeatured  bool   `json:"isFeatured"`
	Section     string `json:"section" binding:"max=100"`
	Summary     string `json:"summary" binding:"max=1000"`
}

// NewsResponse represents a news response
type NewsResponse struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Subtitle    string    `json:"subtitle"`
	Description string    `json:"description"`
	Summary     string    `json:"summary"`
	Content     string    `json:"content"`

	// Metadata
	Status   entities.NewsStatus   `json:"status"`
	Type     entities.NewsType     `json:"type"`
	Priority entities.NewsPriority `json:"priority"`

	// Publishing information
	AuthorID    *uuid.UUID `json:"authorId"`
	EditorID    *uuid.UUID `json:"editorId"`
	PublishedAt *time.Time `json:"publishedAt"`
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// SEO and social media
	Slug            string `json:"slug"`
	MetaTitle       string `json:"metaTitle"`
	MetaDescription string `json:"metaDescription"`
	Keywords        string `json:"keywords"`
	Tags            string `json:"tags"`

	// Media
	FeaturedImageID *uuid.UUID `json:"featuredImageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`

	// WeChat integration
	WeChatDraftID     string `json:"wechatDraftId"`
	WeChatPublishedID string `json:"wechatPublishedId"`
	WeChatURL         string `json:"wechatUrl"`
	WeChatStatus      string `json:"wechatStatus"`

	// Analytics and engagement
	ViewCount    int64 `json:"viewCount"`
	ShareCount   int64 `json:"shareCount"`
	LikeCount    int64 `json:"likeCount"`
	CommentCount int64 `json:"commentCount"`
	ReadTime     int   `json:"readTime"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	IsSticky      bool `json:"isSticky"`
	RequireAuth   bool `json:"requireAuth"`

	// Localization
	Language string `json:"language"`
	Region   string `json:"region"`

	// Audit fields
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	CreatedBy *uuid.UUID `json:"createdBy"`
	UpdatedBy *uuid.UUID `json:"updatedBy"`

	// Related data (optional)
	Author        *UserResponse          `json:"author,omitempty"`
	Editor        *UserResponse          `json:"editor,omitempty"`
	FeaturedImage *ImageResponse         `json:"featuredImage,omitempty"`
	Thumbnail     *ImageResponse         `json:"thumbnail,omitempty"`
	Articles      []NewsArticleResponse  `json:"articles,omitempty"`
	Categories    []NewsCategoryResponse `json:"categories,omitempty"`
	Analytics     *NewsAnalyticsResponse `json:"analytics,omitempty"`
}

// NewsArticleResponse represents a news-article association response
type NewsArticleResponse struct {
	ID        uuid.UUID `json:"id"`
	NewsID    uuid.UUID `json:"newsId"`
	ArticleID uuid.UUID `json:"articleId"`

	// Association metadata
	DisplayOrder int    `json:"displayOrder"`
	IsMainStory  bool   `json:"isMainStory"`
	IsFeatured   bool   `json:"isFeatured"`
	Section      string `json:"section"`
	Summary      string `json:"summary"`

	// Publishing control
	IsVisible   bool       `json:"isVisible"`
	PublishedAt *time.Time `json:"publishedAt"`

	// Audit fields
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	CreatedBy *uuid.UUID `json:"createdBy"`
	UpdatedBy *uuid.UUID `json:"updatedBy"`

	// Related data (optional)
	Article *ArticleResponse `json:"article,omitempty"`
}

// NewsListResponse represents a paginated list of news
type NewsListResponse struct {
	News  []NewsResponse `json:"news"`
	Total int64          `json:"total"`
	Page  int            `json:"page"`
	Limit int            `json:"limit"`
	Pages int            `json:"pages"`
}

// NewsCategoryResponse represents a news category response
type NewsCategoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Color       string    `json:"color"`
	Icon        string    `json:"icon"`

	// Hierarchy
	ParentID *uuid.UUID `json:"parentId"`
	Level    int        `json:"level"`
	Path     string     `json:"path"`

	// Display settings
	DisplayOrder int  `json:"displayOrder"`
	IsActive     bool `json:"isActive"`
	IsVisible    bool `json:"isVisible"`
	IsFeatured   bool `json:"isFeatured"`

	// SEO
	MetaTitle       string `json:"metaTitle"`
	MetaDescription string `json:"metaDescription"`
	Keywords        string `json:"keywords"`

	// Media
	ImageID     *uuid.UUID `json:"imageId"`
	ThumbnailID *uuid.UUID `json:"thumbnailId"`

	// Statistics
	NewsCount int64 `json:"newsCount"`

	// Audit fields
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	CreatedBy *uuid.UUID `json:"createdBy"`
	UpdatedBy *uuid.UUID `json:"updatedBy"`

	// Related data (optional)
	Parent    *NewsCategoryResponse  `json:"parent,omitempty"`
	Children  []NewsCategoryResponse `json:"children,omitempty"`
	Image     *ImageResponse         `json:"image,omitempty"`
	Thumbnail *ImageResponse         `json:"thumbnail,omitempty"`
}

// NewsAnalyticsResponse represents news analytics data
type NewsAnalyticsResponse struct {
	NewsID       uuid.UUID `json:"newsId"`
	ViewCount    int64     `json:"viewCount"`
	ShareCount   int64     `json:"shareCount"`
	LikeCount    int64     `json:"likeCount"`
	CommentCount int64     `json:"commentCount"`
	ReadTime     int       `json:"readTime"`

	// Engagement metrics
	EngagementRate float64 `json:"engagementRate"`
	ShareRate      float64 `json:"shareRate"`
	CommentRate    float64 `json:"commentRate"`

	// Time-based metrics
	ViewsToday     int64 `json:"viewsToday"`
	ViewsThisWeek  int64 `json:"viewsThisWeek"`
	ViewsThisMonth int64 `json:"viewsThisMonth"`

	// Geographic data
	TopCountries []CountryStats `json:"topCountries,omitempty"`
	TopCities    []CityStats    `json:"topCities,omitempty"`

	// Device data
	DeviceStats   map[string]int64 `json:"deviceStats,omitempty"`
	BrowserStats  map[string]int64 `json:"browserStats,omitempty"`
	PlatformStats map[string]int64 `json:"platformStats,omitempty"`

	// Referral data
	TopReferrers []ReferrerStats `json:"topReferrers,omitempty"`

	LastUpdated time.Time `json:"lastUpdated"`
}

// Supporting types for analytics
type CountryStats struct {
	Country string `json:"country"`
	Count   int64  `json:"count"`
}

type CityStats struct {
	City    string `json:"city"`
	Country string `json:"country"`
	Count   int64  `json:"count"`
}

type ReferrerStats struct {
	Referrer string `json:"referrer"`
	Count    int64  `json:"count"`
}

// Bulk Operations Types

// NewsBulkOperationRequest represents a bulk operation request
type NewsBulkOperationRequest struct {
	NewsIDs []uuid.UUID `json:"newsIds" binding:"required"`
	Action  string      `json:"action" binding:"required,oneof=publish unpublish archive delete"`
	Data    interface{} `json:"data,omitempty"`
}

// NewsBulkOperationResponse represents a bulk operation response
type NewsBulkOperationResponse struct {
	Success   bool     `json:"success"`
	Processed int      `json:"processed"`
	Failed    int      `json:"failed"`
	Errors    []string `json:"errors,omitempty"`
	Message   string   `json:"message"`
}

// WeChat Integration Types

// WeChatNewsStatusResponse represents the WeChat publication status
type WeChatNewsStatusResponse struct {
	NewsID      uuid.UUID `json:"newsId"`
	DraftID     string    `json:"draftId"`
	PublishedID string    `json:"publishedId"`
	Status      string    `json:"status"`
	URL         string    `json:"url"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// News Category DTO Types

// CreateNewsCategoryRequest represents a request to create a news category
type CreateNewsCategoryRequest struct {
	Name            string     `json:"name" binding:"required,max=100"`
	Slug            string     `json:"slug" binding:"max=100"`
	Description     string     `json:"description" binding:"max=1000"`
	Color           string     `json:"color" binding:"max=7"`
	Icon            string     `json:"icon" binding:"max=50"`
	ParentID        *uuid.UUID `json:"parentId"`
	DisplayOrder    int        `json:"displayOrder"`
	IsVisible       bool       `json:"isVisible"`
	IsFeatured      bool       `json:"isFeatured"`
	MetaTitle       string     `json:"metaTitle" binding:"max=500"`
	MetaDescription string     `json:"metaDescription" binding:"max=1000"`
	Keywords        string     `json:"keywords" binding:"max=1000"`
	ImageID         *uuid.UUID `json:"imageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`
}

// UpdateNewsCategoryRequest represents a request to update a news category
type UpdateNewsCategoryRequest struct {
	Name            *string    `json:"name" binding:"omitempty,max=100"`
	Slug            *string    `json:"slug" binding:"omitempty,max=100"`
	Description     *string    `json:"description" binding:"omitempty,max=1000"`
	Color           *string    `json:"color" binding:"omitempty,max=7"`
	Icon            *string    `json:"icon" binding:"omitempty,max=50"`
	ParentID        *uuid.UUID `json:"parentId"`
	DisplayOrder    *int       `json:"displayOrder"`
	IsActive        *bool      `json:"isActive"`
	IsVisible       *bool      `json:"isVisible"`
	IsFeatured      *bool      `json:"isFeatured"`
	MetaTitle       *string    `json:"metaTitle" binding:"omitempty,max=500"`
	MetaDescription *string    `json:"metaDescription" binding:"omitempty,max=1000"`
	Keywords        *string    `json:"keywords" binding:"omitempty,max=1000"`
	ImageID         *uuid.UUID `json:"imageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`
}

// NewsCategoryListResponse represents a paginated list of news categories
type NewsCategoryListResponse struct {
	Categories []NewsCategoryResponse `json:"categories"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	Limit      int                    `json:"limit"`
	Pages      int                    `json:"pages"`
}
