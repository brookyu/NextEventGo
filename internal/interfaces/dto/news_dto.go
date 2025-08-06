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

// Article Selection DTOs for News Creation

// ArticleSelectionDTO represents an article available for selection
type ArticleSelectionDTO struct {
	ID                 uuid.UUID  `json:"id"`
	Title              string     `json:"title"`
	Summary            string     `json:"summary"`
	Author             string     `json:"author"`
	CategoryID         uuid.UUID  `json:"categoryId"`
	CategoryName       string     `json:"categoryName"`
	FrontCoverImageURL string     `json:"frontCoverImageUrl"`
	IsPublished        bool       `json:"isPublished"`
	PublishedAt        *time.Time `json:"publishedAt"`
	ViewCount          int64      `json:"viewCount"`
	ReadCount          int64      `json:"readCount"`
	Tags               []string   `json:"tags"`
	CreatedAt          time.Time  `json:"createdAt"`
	UpdatedAt          *time.Time `json:"updatedAt"`

	// Selection state
	IsSelected bool `json:"isSelected"`

	// News-specific settings when selected
	IsMainStory   bool   `json:"isMainStory"`
	IsFeatured    bool   `json:"isFeatured"`
	Section       string `json:"section"`
	CustomSummary string `json:"customSummary"`
}

// ArticleSelectionSearchRequest represents a request to search articles for selection
type ArticleSelectionSearchRequest struct {
	Query         string     `form:"query"`
	CategoryID    *uuid.UUID `form:"categoryId"`
	Author        string     `form:"author"`
	IsPublished   *bool      `form:"isPublished"`
	Tags          []string   `form:"tags"`
	CreatedAfter  *time.Time `form:"createdAfter"`
	CreatedBefore *time.Time `form:"createdBefore"`
	SortBy        string     `form:"sortBy,default=created_at"`
	SortOrder     string     `form:"sortOrder,default=desc"`
	Page          int        `form:"page,default=1"`
	PageSize      int        `form:"pageSize,default=20"`
}

// ArticleSelectionResponse represents the response for article selection
type ArticleSelectionResponse struct {
	Articles   []ArticleSelectionDTO `json:"articles"`
	Pagination PaginationDTO         `json:"pagination"`
	Categories []CategoryDTO         `json:"categories"`
	Authors    []string              `json:"authors"`
	Tags       []string              `json:"tags"`
}

// ImageSelectionDTO represents an image available for selection
type ImageSelectionDTO struct {
	ID           uuid.UUID `json:"id"`
	Filename     string    `json:"filename"`
	OriginalURL  string    `json:"originalUrl"`
	ThumbnailURL string    `json:"thumbnailUrl"`
	FileSize     int64     `json:"fileSize"`
	MimeType     string    `json:"mimeType"`
	Width        int       `json:"width"`
	Height       int       `json:"height"`
	AltText      string    `json:"altText"`
	Description  string    `json:"description"`
	CreatedAt    time.Time `json:"createdAt"`

	// Selection state
	IsSelected bool `json:"isSelected"`
}

// ImageSelectionSearchRequest represents a request to search images for selection
type ImageSelectionSearchRequest struct {
	Query     string `form:"query"`
	MimeType  string `form:"mimeType"`
	MinWidth  int    `form:"minWidth"`
	MaxWidth  int    `form:"maxWidth"`
	MinHeight int    `form:"minHeight"`
	MaxHeight int    `form:"maxHeight"`
	SortBy    string `form:"sortBy,default=created_at"`
	SortOrder string `form:"sortOrder,default=desc"`
	Page      int    `form:"page,default=1"`
	PageSize  int    `form:"pageSize,default=20"`
}

// ImageSelectionResponse represents the response for image selection
type ImageSelectionResponse struct {
	Images     []ImageSelectionDTO `json:"images"`
	Pagination PaginationDTO       `json:"pagination"`
}

// NewsCreationStateDTO represents the current state of news creation
type NewsCreationStateDTO struct {
	// Basic info
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Summary     string `json:"summary"`

	// Selected articles
	SelectedArticles []ArticleSelectionDTO `json:"selectedArticles"`

	// Selected images
	FeaturedImage  *ImageSelectionDTO `json:"featuredImage"`
	ThumbnailImage *ImageSelectionDTO `json:"thumbnailImage"`

	// Settings
	Type     entities.NewsType     `json:"type"`
	Priority entities.NewsPriority `json:"priority"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	RequireAuth   bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// Categories
	SelectedCategories []uuid.UUID `json:"selectedCategories"`
}

// NewsCreationFormDTO represents the enhanced news creation form with selectors
type NewsCreationFormDTO struct {
	// Basic Information
	Title       string `json:"title" binding:"required"`
	Subtitle    string `json:"subtitle"`
	Summary     string `json:"summary"`
	Description string `json:"description"`

	// Type and Priority
	Type     string `json:"type" binding:"required"`     // "regular", "breaking", "featured"
	Priority string `json:"priority" binding:"required"` // "low", "medium", "high", "urgent"

	// Image Selection (replaces Featured Image URL)
	FeaturedImageID  *uuid.UUID `json:"featuredImageId"`  // Selected from image selector
	ThumbnailImageID *uuid.UUID `json:"thumbnailImageId"` // Optional thumbnail

	// Article Selection
	SelectedArticleIDs []uuid.UUID `json:"selectedArticleIds"` // Selected from article selector

	// Article Settings (per selected article)
	ArticleSettings map[string]ArticleNewsSettings `json:"articleSettings"`

	// Categories
	CategoryIDs []uuid.UUID `json:"categoryIds"`

	// Settings
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	RequireAuth   bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// WeChat Integration
	CreateWeChatDraft bool                `json:"createWeChatDraft"`
	WeChatSettings    *WeChatNewsSettings `json:"weChatSettings"`
}

// ArticleNewsSettings represents settings for an article within news
type ArticleNewsSettings struct {
	IsMainStory   bool   `json:"isMainStory"`   // Mark as main story
	IsFeatured    bool   `json:"isFeatured"`    // Feature this article
	Section       string `json:"section"`       // Section within news (e.g., "top", "featured", "related")
	CustomSummary string `json:"customSummary"` // Override article summary for this news
	DisplayOrder  int    `json:"displayOrder"`  // Order within the news
}

// WeChatNewsSettings represents WeChat-specific settings
type WeChatNewsSettings struct {
	Title        string     `json:"title"`        // Custom WeChat title
	Summary      string     `json:"summary"`      // Custom WeChat summary
	CoverImageID *uuid.UUID `json:"coverImageId"` // WeChat cover image
	AutoPublish  bool       `json:"autoPublish"`  // Auto-publish to WeChat
}

// NewsCreationResponseDTO represents the response after creating news
type NewsCreationResponseDTO struct {
	ID      uuid.UUID `json:"id"`
	Title   string    `json:"title"`
	Status  string    `json:"status"`
	Message string    `json:"message"`

	// Created resources
	CreatedArticles int `json:"createdArticles"`
	ProcessedImages int `json:"processedImages"`

	// WeChat integration results
	WeChatDraftID     string `json:"weChatDraftId,omitempty"`
	WeChatDraftStatus string `json:"weChatDraftStatus,omitempty"`

	// Scheduling info
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
	ExpiresAt   *time.Time `json:"expiresAt,omitempty"`
}
