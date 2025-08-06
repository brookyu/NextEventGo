package dto

import (
	"time"

	"github.com/google/uuid"
)

// Frontend-specific DTOs that match the expected frontend interface

// NewsListItemDTO represents a news item in list view for frontend
type NewsListItemDTO struct {
	ID       uuid.UUID `json:"id"`
	Title    string    `json:"title"`
	Subtitle string    `json:"subtitle,omitempty"`
	Summary  string    `json:"summary,omitempty"`
	Status   string    `json:"status"`
	Type     string    `json:"type"`
	Priority string    `json:"priority"`

	// Publishing info
	AuthorID    *uuid.UUID `json:"authorId,omitempty"`
	AuthorName  string     `json:"authorName,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`

	// Media
	FeaturedImageID  *uuid.UUID `json:"featuredImageId,omitempty"`
	FeaturedImageURL string     `json:"featuredImageUrl,omitempty"`
	ThumbnailID      *uuid.UUID `json:"thumbnailId,omitempty"`
	ThumbnailURL     string     `json:"thumbnailUrl,omitempty"`

	// Flags
	IsFeatured bool `json:"isFeatured"`
	IsBreaking bool `json:"isBreaking"`
	IsSticky   bool `json:"isSticky"`

	// Analytics
	ViewCount    int64 `json:"viewCount"`
	ShareCount   int64 `json:"shareCount"`
	LikeCount    int64 `json:"likeCount"`
	CommentCount int64 `json:"commentCount"`

	// Categories
	PrimaryCategory *NewsCategoryDTO  `json:"primaryCategory,omitempty"`
	Categories      []NewsCategoryDTO `json:"categories,omitempty"`

	// Articles count
	ArticleCount int `json:"articleCount"`

	// WeChat status
	WeChatStatus string `json:"wechatStatus,omitempty"`
	WeChatURL    string `json:"wechatUrl,omitempty"`
}

// NewsDetailDTO represents detailed news information for frontend
type NewsDetailDTO struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Subtitle    string    `json:"subtitle,omitempty"`
	Description string    `json:"description,omitempty"`
	Content     string    `json:"content,omitempty"`
	Summary     string    `json:"summary,omitempty"`

	// Metadata
	Status   string `json:"status"`
	Type     string `json:"type"`
	Priority string `json:"priority"`

	// Publishing information
	AuthorID    *uuid.UUID `json:"authorId,omitempty"`
	EditorID    *uuid.UUID `json:"editorId,omitempty"`
	PublishedAt *time.Time `json:"publishedAt,omitempty"`
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
	ExpiresAt   *time.Time `json:"expiresAt,omitempty"`

	// SEO
	Slug            string `json:"slug,omitempty"`
	MetaTitle       string `json:"metaTitle,omitempty"`
	MetaDescription string `json:"metaDescription,omitempty"`
	Keywords        string `json:"keywords,omitempty"`
	Tags            string `json:"tags,omitempty"`

	// Media
	FeaturedImageID  *uuid.UUID `json:"featuredImageId,omitempty"`
	FeaturedImageURL string     `json:"featuredImageUrl,omitempty"`
	ThumbnailID      *uuid.UUID `json:"thumbnailId,omitempty"`
	ThumbnailURL     string     `json:"thumbnailUrl,omitempty"`
	GalleryImages    []ImageDTO `json:"galleryImages,omitempty"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	IsSticky      bool `json:"isSticky"`
	RequireAuth   bool `json:"requireAuth"`

	// Localization
	Language string `json:"language,omitempty"`
	Region   string `json:"region,omitempty"`

	// Analytics
	ViewCount    int64 `json:"viewCount"`
	ShareCount   int64 `json:"shareCount"`
	LikeCount    int64 `json:"likeCount"`
	CommentCount int64 `json:"commentCount"`
	ReadTime     int   `json:"readTime"`

	// WeChat integration
	WeChatDraftID     string     `json:"wechatDraftId,omitempty"`
	WeChatPublishedID string     `json:"wechatPublishedId,omitempty"`
	WeChatURL         string     `json:"wechatUrl,omitempty"`
	WeChatStatus      string     `json:"wechatStatus,omitempty"`
	WeChatSyncedAt    *time.Time `json:"wechatSyncedAt,omitempty"`

	// Audit fields
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	CreatedBy *uuid.UUID `json:"createdBy,omitempty"`
	UpdatedBy *uuid.UUID `json:"updatedBy,omitempty"`

	// Related data
	Author     *UserDTO               `json:"author,omitempty"`
	Editor     *UserDTO               `json:"editor,omitempty"`
	Articles   []NewsArticleDetailDTO `json:"articles,omitempty"`
	Categories []NewsCategoryDTO      `json:"categories,omitempty"`
	Analytics  *NewsAnalyticsDTO      `json:"analytics,omitempty"`
}

// NewsForEditingDTO represents news data optimized for editing interface
type NewsForEditingDTO struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Subtitle    string    `json:"subtitle,omitempty"`
	Description string    `json:"description,omitempty"`
	Content     string    `json:"content,omitempty"`
	Summary     string    `json:"summary,omitempty"`

	// Metadata
	Status   string `json:"status"`
	Type     string `json:"type"`
	Priority string `json:"priority"`

	// SEO
	Slug            string `json:"slug,omitempty"`
	MetaTitle       string `json:"metaTitle,omitempty"`
	MetaDescription string `json:"metaDescription,omitempty"`
	Keywords        string `json:"keywords,omitempty"`
	Tags            string `json:"tags,omitempty"`

	// Media
	FeaturedImageID  *uuid.UUID `json:"featuredImageId,omitempty"`
	FeaturedImageURL string     `json:"featuredImageUrl,omitempty"`
	ThumbnailID      *uuid.UUID `json:"thumbnailId,omitempty"`
	ThumbnailURL     string     `json:"thumbnailUrl,omitempty"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	IsSticky      bool `json:"isSticky"`
	RequireAuth   bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt,omitempty"`
	ExpiresAt   *time.Time `json:"expiresAt,omitempty"`

	// Localization
	Language string `json:"language,omitempty"`
	Region   string `json:"region,omitempty"`

	// Articles with editing metadata
	Articles []NewsArticleForEditingDTO `json:"articles"`

	// Categories
	CategoryIDs []uuid.UUID       `json:"categoryIds"`
	Categories  []NewsCategoryDTO `json:"categories,omitempty"`

	// WeChat status
	WeChatStatus string `json:"wechatStatus,omitempty"`
	WeChatURL    string `json:"wechatUrl,omitempty"`

	// Audit fields
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// NewsArticleDetailDTO represents an article within news for detailed view
type NewsArticleDetailDTO struct {
	ID           uuid.UUID `json:"id"`
	ArticleID    uuid.UUID `json:"articleId"`
	DisplayOrder int       `json:"displayOrder"`
	IsMainStory  bool      `json:"isMainStory"`
	IsFeatured   bool      `json:"isFeatured"`
	IsVisible    bool      `json:"isVisible"`
	Section      string    `json:"section,omitempty"`
	Summary      string    `json:"summary,omitempty"`

	// Article details
	Article *ArticleDetailDTO `json:"article,omitempty"`
}

// NewsArticleForEditingDTO represents an article within news for editing
type NewsArticleForEditingDTO struct {
	ID           uuid.UUID `json:"id"`
	ArticleID    uuid.UUID `json:"articleId"`
	DisplayOrder int       `json:"displayOrder"`
	IsMainStory  bool      `json:"isMainStory"`
	IsFeatured   bool      `json:"isFeatured"`
	IsVisible    bool      `json:"isVisible"`
	Section      string    `json:"section,omitempty"`
	Summary      string    `json:"summary,omitempty"`

	// Article basic info for editing interface
	Title              string `json:"title"`
	ArticleSummary     string `json:"articleSummary,omitempty"`
	FrontCoverImageURL string `json:"frontCoverImageUrl,omitempty"`
	Status             string `json:"status"`
	IsPublished        bool   `json:"isPublished"`
}

// NewsCategoryDTO represents a news category for frontend
type NewsCategoryDTO struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug,omitempty"`
	Description string    `json:"description,omitempty"`
	Color       string    `json:"color,omitempty"`
	Icon        string    `json:"icon,omitempty"`

	// Hierarchy
	ParentID *uuid.UUID `json:"parentId,omitempty"`
	Level    int        `json:"level"`
	Path     string     `json:"path,omitempty"`

	// Display settings
	DisplayOrder int  `json:"displayOrder"`
	IsActive     bool `json:"isActive"`
	IsVisible    bool `json:"isVisible"`
	IsFeatured   bool `json:"isFeatured"`

	// Media
	ImageID      *uuid.UUID `json:"imageId,omitempty"`
	ImageURL     string     `json:"imageUrl,omitempty"`
	ThumbnailID  *uuid.UUID `json:"thumbnailId,omitempty"`
	ThumbnailURL string     `json:"thumbnailUrl,omitempty"`

	// Statistics
	NewsCount int64 `json:"newsCount"`

	// Related data
	Parent   *NewsCategoryDTO  `json:"parent,omitempty"`
	Children []NewsCategoryDTO `json:"children,omitempty"`
}

// ArticleDetailDTO represents article details for news context
type ArticleDetailDTO struct {
	ID                 uuid.UUID  `json:"id"`
	Title              string     `json:"title"`
	Subtitle           string     `json:"subtitle,omitempty"`
	Content            string     `json:"content,omitempty"`
	Summary            string     `json:"summary,omitempty"`
	Status             string     `json:"status"`
	IsPublished        bool       `json:"isPublished"`
	PublishedAt        *time.Time `json:"publishedAt,omitempty"`
	FrontCoverImageURL string     `json:"frontCoverImageUrl,omitempty"`
	AuthorName         string     `json:"authorName,omitempty"`
	ReadTime           int        `json:"readTime"`
}

// UserDTO represents user information for frontend
type UserDTO struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email,omitempty"`
	DisplayName string    `json:"displayName,omitempty"`
	FirstName   string    `json:"firstName,omitempty"`
	LastName    string    `json:"lastName,omitempty"`
	AvatarURL   string    `json:"avatarUrl,omitempty"`
	Role        string    `json:"role,omitempty"`
}

// NewsAnalyticsDTO represents analytics data for frontend
type NewsAnalyticsDTO struct {
	ViewCount    int64 `json:"viewCount"`
	ShareCount   int64 `json:"shareCount"`
	LikeCount    int64 `json:"likeCount"`
	CommentCount int64 `json:"commentCount"`

	// Time-based analytics
	ViewsToday     int64 `json:"viewsToday"`
	ViewsThisWeek  int64 `json:"viewsThisWeek"`
	ViewsThisMonth int64 `json:"viewsThisMonth"`

	// Engagement metrics
	EngagementRate float64 `json:"engagementRate"`
	AvgReadTime    int     `json:"avgReadTime"`
	BounceRate     float64 `json:"bounceRate"`

	// Geographic data
	TopCountries []CountryStatsDTO `json:"topCountries,omitempty"`
	TopCities    []CityStatsDTO    `json:"topCities,omitempty"`

	// Device data
	DeviceStats   map[string]int64 `json:"deviceStats,omitempty"`
	BrowserStats  map[string]int64 `json:"browserStats,omitempty"`
	PlatformStats map[string]int64 `json:"platformStats,omitempty"`

	// Referral data
	TopReferrers []ReferrerStatsDTO `json:"topReferrers,omitempty"`

	LastUpdated time.Time `json:"lastUpdated"`
}

// Supporting analytics DTOs
type CountryStatsDTO struct {
	Country string `json:"country"`
	Count   int64  `json:"count"`
}

type CityStatsDTO struct {
	City    string `json:"city"`
	Country string `json:"country"`
	Count   int64  `json:"count"`
}

// Pagination response wrapper
type NewsListResponseDTO struct {
	Data       []NewsListItemDTO `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
	TotalPages int               `json:"totalPages"`
	HasNext    bool              `json:"hasNext"`
	HasPrev    bool              `json:"hasPrev"`
}

// WeChat integration DTOs
type WeChatNewsStatusDTO struct {
	NewsID            uuid.UUID  `json:"newsId"`
	DraftID           string     `json:"draftId,omitempty"`
	PublishedID       string     `json:"publishedId,omitempty"`
	URL               string     `json:"url,omitempty"`
	Status            string     `json:"status"`
	LastSyncedAt      *time.Time `json:"lastSyncedAt,omitempty"`
	SyncError         string     `json:"syncError,omitempty"`
	CanCreateDraft    bool       `json:"canCreateDraft"`
	CanPublish        bool       `json:"canPublish"`
	CanUpdate         bool       `json:"canUpdate"`
	ArticleCount      int        `json:"articleCount"`
	ProcessedArticles int        `json:"processedArticles"`
}

// News creation/update request DTOs that match frontend expectations
type CreateNewsRequestDTO struct {
	Title       string `json:"title" binding:"required,max=500"`
	Subtitle    string `json:"subtitle" binding:"max=1000"`
	Description string `json:"description" binding:"max=2000"`
	Content     string `json:"content" binding:"max=50000"`
	Summary     string `json:"summary" binding:"max=1000"`

	// Metadata
	Type     string `json:"type" binding:"required"`
	Priority string `json:"priority" binding:"required"`

	// SEO
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
