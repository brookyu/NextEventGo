package services

import (
	"context"
	"io"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// ImageService defines the interface for image management operations
type ImageService interface {
	// Image CRUD Operations
	CreateImage(ctx context.Context, image *entities.SiteImage) error
	GetImageByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error)
	GetAllImages(ctx context.Context, offset, limit int) ([]*entities.SiteImage, error)
	GetImagesByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int) ([]*entities.SiteImage, error)
	SearchImagesByName(ctx context.Context, name string, offset, limit int) ([]*entities.SiteImage, error)
	UpdateImage(ctx context.Context, image *entities.SiteImage) error
	DeleteImage(ctx context.Context, id uuid.UUID) error
	
	// File Upload Operations
	UploadImage(ctx context.Context, upload *ImageUpload) (*entities.SiteImage, error)
	ValidateImageFile(ctx context.Context, filename string, size int64, contentType string) error
	
	// WeChat Integration
	UploadToWeChat(ctx context.Context, imageID uuid.UUID) error
	GetWeChatMediaURL(ctx context.Context, mediaId string) (string, error)
	
	// Image Statistics
	GetImageCount(ctx context.Context) (int64, error)
	GetImageCountByCategory(ctx context.Context, categoryId uuid.UUID) (int64, error)
}

// ImageCategoryService defines the interface for image category management operations
type ImageCategoryService interface {
	// Category CRUD Operations
	CreateCategory(ctx context.Context, category *entities.ImageCategory) error
	GetCategoryByID(ctx context.Context, id uuid.UUID) (*entities.ImageCategory, error)
	GetAllCategories(ctx context.Context, offset, limit int) ([]*entities.ImageCategory, error)
	GetAllCategoriesOrdered(ctx context.Context) ([]*entities.ImageCategory, error)
	GetCategoryByName(ctx context.Context, name string) (*entities.ImageCategory, error)
	UpdateCategory(ctx context.Context, category *entities.ImageCategory) error
	DeleteCategory(ctx context.Context, id uuid.UUID) error
	
	// Category Statistics
	GetCategoryCount(ctx context.Context) (int64, error)
	GetCategoryWithImageCount(ctx context.Context, categoryId uuid.UUID) (*CategoryWithCount, error)
}

// ImageUpload represents image upload data
type ImageUpload struct {
	FileName    string
	ContentType string
	Size        int64
	Data        io.Reader
	CategoryId  uuid.UUID
	UploadedBy  *uuid.UUID
}

// ImageUploadResult represents the result of an image upload
type ImageUploadResult struct {
	Success   bool
	ImageID   uuid.UUID
	SiteUrl   string
	WeChatUrl string
	MediaId   string
	Message   string
}

// CategoryWithCount represents a category with its image count
type CategoryWithCount struct {
	Category   *entities.ImageCategory
	ImageCount int64
}

// ImageSearchQuery represents search criteria for images
type ImageSearchQuery struct {
	Name       string
	CategoryId *uuid.UUID
	Offset     int
	Limit      int
	SortBy     string
	SortOrder  string
}

// ImageValidationConfig represents image validation configuration
type ImageValidationConfig struct {
	MaxFileSize      int64    // Maximum file size in bytes
	AllowedTypes     []string // Allowed MIME types
	WeChatSizeLimit  int64    // WeChat upload size limit (10MB)
	RequireCategory  bool     // Whether category is required
}

// ImageProcessingOptions represents image processing options
type ImageProcessingOptions struct {
	Resize       bool
	MaxWidth     int
	MaxHeight    int
	Quality      int
	Format       string
	GenerateThumbnail bool
	ThumbnailSize     int
}
