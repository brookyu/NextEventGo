package dto

import (
	"time"

	"github.com/google/uuid"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// ArticleDTO represents an article data transfer object
type ArticleDTO struct {
	ID                 uuid.UUID    `json:"id"`
	Title              string       `json:"title"`
	Summary            string       `json:"summary"`
	Content            string       `json:"content"`
	Author             string       `json:"author"`
	CategoryId         uuid.UUID    `json:"categoryId"`
	SiteImageId        *uuid.UUID   `json:"siteImageId,omitempty"`
	PromotionPicId     *uuid.UUID   `json:"promotionPicId,omitempty"`
	JumpResourceId     *uuid.UUID   `json:"jumpResourceId,omitempty"`
	PromotionCode      string       `json:"promotionCode"`
	FrontCoverImageUrl string       `json:"frontCoverImageUrl"`
	IsPublished        bool         `json:"isPublished"`
	PublishedAt        *time.Time   `json:"publishedAt,omitempty"`
	ViewCount          int64        `json:"viewCount"`
	ReadCount          int64        `json:"readCount"`
	Category           *CategoryDTO `json:"category,omitempty"`
	CoverImage         *ImageDTO    `json:"coverImage,omitempty"`
	PromotionImage     *ImageDTO    `json:"promotionImage,omitempty"`
	CreatedAt          time.Time    `json:"createdAt"`
	UpdatedAt          *time.Time   `json:"updatedAt,omitempty"`
	CreatedBy          *uuid.UUID   `json:"createdBy,omitempty"`
	UpdatedBy          *uuid.UUID   `json:"updatedBy,omitempty"`
}

// CreateArticleRequest represents a request to create an article
type CreateArticleRequest struct {
	Title              string     `json:"title" binding:"required,min=1,max=500"`
	Summary            string     `json:"summary" binding:"max=1000"`
	Content            string     `json:"content" binding:"required,min=10"`
	Author             string     `json:"author" binding:"required,min=1,max=100"`
	CategoryId         uuid.UUID  `json:"categoryId" binding:"required"`
	SiteImageId        *uuid.UUID `json:"siteImageId,omitempty"`
	PromotionPicId     *uuid.UUID `json:"promotionPicId,omitempty"`
	JumpResourceId     *uuid.UUID `json:"jumpResourceId,omitempty"`
	FrontCoverImageUrl string     `json:"frontCoverImageUrl"`
	IsPublished        bool       `json:"isPublished"`
}

// UpdateArticleRequest represents a request to update an article
type UpdateArticleRequest struct {
	Title              *string    `json:"title,omitempty" binding:"omitempty,min=1,max=500"`
	Summary            *string    `json:"summary,omitempty" binding:"omitempty,max=1000"`
	Content            *string    `json:"content,omitempty" binding:"omitempty,min=10"`
	Author             *string    `json:"author,omitempty" binding:"omitempty,min=1,max=100"`
	CategoryId         *uuid.UUID `json:"categoryId,omitempty"`
	SiteImageId        *uuid.UUID `json:"siteImageId,omitempty"`
	PromotionPicId     *uuid.UUID `json:"promotionPicId,omitempty"`
	JumpResourceId     *uuid.UUID `json:"jumpResourceId,omitempty"`
	FrontCoverImageUrl *string    `json:"frontCoverImageUrl,omitempty"`
	IsPublished        *bool      `json:"isPublished,omitempty"`
}

// ArticleListRequest represents a request to list articles
type ArticleListRequest struct {
	Page            int        `form:"page,default=1" binding:"min=1"`
	PageSize        int        `form:"pageSize,default=20" binding:"min=1,max=100"`
	Search          string     `form:"search"`
	CategoryId      *uuid.UUID `form:"categoryId"`
	Author          string     `form:"author"`
	IsPublished     *bool      `form:"isPublished"`
	SortBy          string     `form:"sortBy,default=created_at" binding:"oneof=title created_at view_count read_count"`
	SortOrder       string     `form:"sortOrder,default=desc" binding:"oneof=asc desc"`
	IncludeCategory bool       `form:"includeCategory,default=true"`
	IncludeImages   bool       `form:"includeImages,default=false"`
}

// ArticleSearchRequest represents a search request
type ArticleSearchRequest struct {
	Query         string     `json:"query"`
	CategoryId    *uuid.UUID `json:"categoryId,omitempty"`
	Author        string     `json:"author,omitempty"`
	IsPublished   *bool      `json:"isPublished,omitempty"`
	CreatedAfter  *time.Time `json:"createdAfter,omitempty"`
	CreatedBefore *time.Time `json:"createdBefore,omitempty"`
	PromotionCode string     `json:"promotionCode,omitempty"`
	SortBy        string     `json:"sortBy,default=created_at"`
	SortOrder     string     `json:"sortOrder,default=desc"`
	Page          int        `json:"page,default=1"`
	PageSize      int        `json:"pageSize,default=20"`
}

// ArticleListResponse represents a paginated list of articles
type ArticleListResponse struct {
	Data       []*ArticleDTO `json:"data"`
	Pagination PaginationDTO `json:"pagination"`
}

// CategoryDTO represents a category data transfer object
type CategoryDTO struct {
	ID          uuid.UUID  `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	SortOrder   int        `json:"sortOrder"`
	IsActive    bool       `json:"isActive"`
	Color       string     `json:"color"`
	Icon        string     `json:"icon"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   *time.Time `json:"updatedAt,omitempty"`
}

// CreateCategoryRequest represents a request to create a category
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=255"`
	Description string `json:"description" binding:"max=1000"`
	SortOrder   int    `json:"sortOrder,default=0"`
	IsActive    bool   `json:"isActive,default=true"`
	Color       string `json:"color" binding:"max=50"`
	Icon        string `json:"icon" binding:"max=100"`
}

// UpdateCategoryRequest represents a request to update a category
type UpdateCategoryRequest struct {
	Name        *string `json:"name,omitempty" binding:"omitempty,min=1,max=255"`
	Description *string `json:"description,omitempty" binding:"omitempty,max=1000"`
	SortOrder   *int    `json:"sortOrder,omitempty"`
	IsActive    *bool   `json:"isActive,omitempty"`
	Color       *string `json:"color,omitempty" binding:"omitempty,max=50"`
	Icon        *string `json:"icon,omitempty" binding:"omitempty,max=100"`
}

// CategoryWithStatsDTO represents a category with article statistics
type CategoryWithStatsDTO struct {
	*CategoryDTO
	ArticleCount   int64 `json:"articleCount"`
	PublishedCount int64 `json:"publishedCount"`
	DraftCount     int64 `json:"draftCount"`
}

// ImageDTO represents an image data transfer object (simplified)
type ImageDTO struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	URL      string    `json:"url"`
	FileSize int64     `json:"fileSize"`
	MimeType string    `json:"mimeType"`
}

// PaginationDTO represents pagination information
type PaginationDTO struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
	HasNext    bool  `json:"hasNext"`
	HasPrev    bool  `json:"hasPrev"`
}

// ArticleTrackingRequest represents a request to track article interaction
type ArticleTrackingRequest struct {
	SessionId      string  `json:"sessionId" binding:"required"`
	IPAddress      string  `json:"ipAddress"`
	UserAgent      string  `json:"userAgent"`
	Referrer       string  `json:"referrer"`
	PromotionCode  string  `json:"promotionCode"`
	ReadDuration   int     `json:"readDuration,omitempty"`   // For read tracking
	ReadPercentage float64 `json:"readPercentage,omitempty"` // For read tracking
	ScrollDepth    float64 `json:"scrollDepth,omitempty"`    // For read tracking
	Country        string  `json:"country"`
	City           string  `json:"city"`
	DeviceType     string  `json:"deviceType"`
	Platform       string  `json:"platform"`
	Browser        string  `json:"browser"`
	WeChatOpenId   string  `json:"weChatOpenId"`
	WeChatUnionId  string  `json:"weChatUnionId"`
}

// QRCodeRequest represents a request to generate a QR code
type QRCodeRequest struct {
	QRCodeType    string `json:"qrCodeType" binding:"required,oneof=temporary permanent"`
	ExpireSeconds *int   `json:"expireSeconds,omitempty"`
	MaxScans      *int   `json:"maxScans,omitempty"`
	Description   string `json:"description"`
}

// QRCodeResponse represents a QR code response
type QRCodeResponse struct {
	ID           uuid.UUID  `json:"id"`
	ResourceId   uuid.UUID  `json:"resourceId"`
	ResourceType string     `json:"resourceType"`
	SceneStr     string     `json:"sceneStr"`
	QRCodeUrl    string     `json:"qrCodeUrl"`
	QRCodeType   string     `json:"qrCodeType"`
	Status       string     `json:"status"`
	ScanCount    int64      `json:"scanCount"`
	IsActive     bool       `json:"isActive"`
	ExpireTime   *time.Time `json:"expireTime,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

// ArticleAnalyticsResponse represents article analytics data
type ArticleAnalyticsResponse struct {
	ArticleId       uuid.UUID            `json:"articleId"`
	TotalViews      int64                `json:"totalViews"`
	TotalReads      int64                `json:"totalReads"`
	UniqueUsers     int64                `json:"uniqueUsers"`
	AvgReadTime     float64              `json:"avgReadTime"`
	ReadingRate     float64              `json:"readingRate"`
	TopReferrers    []ReferrerStatsDTO   `json:"topReferrers"`
	DailyStats      []DailyStatsDTO      `json:"dailyStats"`
	GeographicStats []GeographicStatsDTO `json:"geographicStats"`
	DeviceStats     []DeviceStatsDTO     `json:"deviceStats"`
}

// ReferrerStatsDTO represents referrer statistics
type ReferrerStatsDTO struct {
	Referrer string `json:"referrer"`
	Count    int64  `json:"count"`
}

// DailyStatsDTO represents daily statistics
type DailyStatsDTO struct {
	Date           time.Time `json:"date"`
	Views          int64     `json:"views"`
	Reads          int64     `json:"reads"`
	UniqueUsers    int64     `json:"uniqueUsers"`
	AvgReadTime    float64   `json:"avgReadTime"`
	CompletionRate float64   `json:"completionRate"`
}

// GeographicStatsDTO represents geographic statistics
type GeographicStatsDTO struct {
	Country string `json:"country"`
	City    string `json:"city"`
	Count   int64  `json:"count"`
}

// DeviceStatsDTO represents device statistics
type DeviceStatsDTO struct {
	DeviceType string `json:"deviceType"`
	Platform   string `json:"platform"`
	Count      int64  `json:"count"`
}

// PublishRequest represents a request to publish articles
type PublishRequest struct {
	ArticleIds []uuid.UUID `json:"articleIds" binding:"required,min=1"`
}

// BulkOperationResponse represents a bulk operation response
type BulkOperationResponse struct {
	Success      []uuid.UUID `json:"success"`
	Failed       []uuid.UUID `json:"failed"`
	SuccessCount int         `json:"successCount"`
	FailedCount  int         `json:"failedCount"`
	Message      string      `json:"message"`
}
