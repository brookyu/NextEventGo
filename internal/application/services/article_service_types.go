package services

import (
	"time"

	"github.com/google/uuid"
)

// Article Service Request Types

// ArticleCreateRequest represents a request to create a new article
type ArticleCreateRequest struct {
	Title           string      `json:"title" binding:"required,min=1,max=255"`
	Summary         string      `json:"summary" binding:"max=1000"`
	Content         string      `json:"content" binding:"required,min=1"`
	Author          string      `json:"author" binding:"required,min=1,max=100"`
	CategoryID      uuid.UUID   `json:"categoryId" binding:"required"`
	SiteImageID     *uuid.UUID  `json:"siteImageId,omitempty"`
	PromotionPicID  *uuid.UUID  `json:"promotionPicId,omitempty"`
	JumpResourceID  *uuid.UUID  `json:"jumpResourceId,omitempty"`
	MetaTitle       string      `json:"metaTitle,omitempty"`
	MetaDescription string      `json:"metaDescription,omitempty"`
	Keywords        string      `json:"keywords,omitempty"`
	TagIDs          []uuid.UUID `json:"tagIds,omitempty"`
	CreatedBy       *uuid.UUID  `json:"createdBy,omitempty"`
}

// ArticleUpdateRequest represents a request to update an existing article
type ArticleUpdateRequest struct {
	Title           *string      `json:"title,omitempty" binding:"omitempty,min=1,max=255"`
	Summary         *string      `json:"summary,omitempty" binding:"omitempty,max=1000"`
	Content         *string      `json:"content,omitempty" binding:"omitempty,min=1"`
	Author          *string      `json:"author,omitempty" binding:"omitempty,min=1,max=100"`
	CategoryID      *uuid.UUID   `json:"categoryId,omitempty"`
	SiteImageID     *uuid.UUID   `json:"siteImageId,omitempty"`
	PromotionPicID  *uuid.UUID   `json:"promotionPicId,omitempty"`
	JumpResourceID  *uuid.UUID   `json:"jumpResourceId,omitempty"`
	MetaTitle       *string      `json:"metaTitle,omitempty"`
	MetaDescription *string      `json:"metaDescription,omitempty"`
	Keywords        *string      `json:"keywords,omitempty"`
	TagIDs          *[]uuid.UUID `json:"tagIds,omitempty"`
	UpdatedBy       *uuid.UUID   `json:"updatedBy,omitempty"`
}

// ArticleGetOptions represents options for getting an article
type ArticleGetOptions struct {
	IncludeCategory bool
	IncludeTags     bool
	IncludeImages   bool
	IncludeCreator  bool
	TrackView       bool
	UserID          *uuid.UUID
	SessionID       string
	IPAddress       string
}

// ArticlePublishRequest represents a request to publish an article
type ArticlePublishRequest struct {
	PublishToWeChat bool `json:"publishToWeChat"`
	GenerateQRCode  bool `json:"generateQRCode"`
}

// Article Service Response Types

// Note: ArticleResponse is defined in article_management_service.go to avoid duplication

// ArticleCategoryResponse represents an article category response
type ArticleCategoryResponse struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Color       string     `json:"color"`
	Icon        string     `json:"icon"`
	SortOrder   int        `json:"sortOrder"`
	IsActive    bool       `json:"isActive"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   *time.Time `json:"updatedAt,omitempty"`

	// Statistics (included when requested)
	ArticleCount *int64 `json:"articleCount,omitempty"`
}

// ImageResponse represents an image response
type ImageResponse struct {
	ID           uuid.UUID  `json:"id"`
	FileName     string     `json:"fileName"`
	OriginalName string     `json:"originalName"`
	MimeType     string     `json:"mimeType"`
	Size         int64      `json:"size"`
	Width        int        `json:"width"`
	Height       int        `json:"height"`
	URL          string     `json:"url"`
	ThumbnailURL string     `json:"thumbnailUrl"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    *time.Time `json:"updatedAt,omitempty"`
}

// Note: QRCodeResponse is defined in event_service_types.go to avoid duplication

// ArticleAnalytics represents article analytics data
type ArticleAnalytics struct {
	ArticleId         uuid.UUID         `json:"articleId"`
	ViewCount         int64             `json:"viewCount"`
	ReadCount         int64             `json:"readCount"`
	ReadingRate       float64           `json:"readingRate"`
	AverageReadTime   float64           `json:"averageReadTime"`
	BounceRate        float64           `json:"bounceRate"`
	ShareCount        int64             `json:"shareCount"`
	ViewsOverTime     []TimeSeriesPoint `json:"viewsOverTime"`
	ReadsOverTime     []TimeSeriesPoint `json:"readsOverTime"`
	TopReferrers      []ReferrerStats   `json:"topReferrers"`
	DeviceBreakdown   map[string]int64  `json:"deviceBreakdown"`
	LocationBreakdown map[string]int64  `json:"locationBreakdown"`
	LastUpdated       time.Time         `json:"lastUpdated"`
}

// Note: TimeSeriesPoint is defined in event_service_types.go to avoid duplication

// ReferrerStats represents referrer statistics
// Note: ReferrerStats is defined in article_analytics_types.go to avoid duplication

// WeChat Publishing Types

// WeChatPublishRequest represents a request to publish to WeChat
type WeChatPublishRequest struct {
	ArticleId     uuid.UUID  `json:"articleId" binding:"required"`
	CreateDraft   bool       `json:"createDraft"`
	PublishDirect bool       `json:"publishDirect"`
	ScheduleTime  *time.Time `json:"scheduleTime,omitempty"`
}

// WeChatPublishResponse represents a WeChat publish response
type WeChatPublishResponse struct {
	Success     bool      `json:"success"`
	DraftId     string    `json:"draftId,omitempty"`
	PublishId   string    `json:"publishId,omitempty"`
	QRCodeURL   string    `json:"qrCodeUrl,omitempty"`
	WeChatURL   string    `json:"wechatUrl,omitempty"`
	PublishedAt time.Time `json:"publishedAt"`
	Message     string    `json:"message"`
}

// Article Tracking Types

// Note: ArticleViewTrackingData is defined in article_analytics_types.go to avoid duplication

// Note: ArticleReadTrackingData is defined in article_analytics_types.go to avoid duplication

// Article Search and Filter Types

// ArticleSearchRequest represents a search request
type ArticleSearchRequest struct {
	Query       string     `json:"query,omitempty"`
	CategoryId  *uuid.UUID `json:"categoryId,omitempty"`
	Author      string     `json:"author,omitempty"`
	IsPublished *bool      `json:"isPublished,omitempty"`
	Tags        []string   `json:"tags,omitempty"`
	DateFrom    *time.Time `json:"dateFrom,omitempty"`
	DateTo      *time.Time `json:"dateTo,omitempty"`

	// Pagination
	Page     int `json:"page" binding:"min=1"`
	PageSize int `json:"pageSize" binding:"min=1,max=100"`

	// Sorting
	SortBy    string `json:"sortBy,omitempty"`
	SortOrder string `json:"sortOrder,omitempty"`

	// Include options
	IncludeCategory  bool `json:"includeCategory"`
	IncludeImages    bool `json:"includeImages"`
	IncludeAnalytics bool `json:"includeAnalytics"`
}

// Note: ArticleListResponse uses types from article_management_service.go and event_service_types.go

// Note: PaginationInfo is defined in event_service_types.go to avoid duplication

// Article Category Types

// CategoryCreateRequest represents a request to create a category
type CategoryCreateRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=100"`
	Description string `json:"description" binding:"max=500"`
	Color       string `json:"color" binding:"omitempty,hexcolor"`
	Icon        string `json:"icon" binding:"max=50"`
	SortOrder   int    `json:"sortOrder"`
	IsActive    bool   `json:"isActive"`
}

// CategoryUpdateRequest represents a request to update a category
type CategoryUpdateRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=1,max=100"`
	Description *string `json:"description,omitempty" binding:"omitempty,max=500"`
	Color       *string `json:"color,omitempty" binding:"omitempty,hexcolor"`
	Icon        *string `json:"icon,omitempty" binding:"omitempty,max=50"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
	IsActive    *bool   `json:"isActive,omitempty"`
}
