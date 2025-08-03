package repositories

import (
	"context"
	"errors"

	"github.com/google/uuid"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// Common repository errors
var (
	ErrNotFound = errors.New("record not found")
)

// ImageFilter represents filtering options for image queries
type ImageFilter struct {
	Search     string
	CategoryID string
	Tags       []string
	IsPublic   *bool
	SortBy     string
	SortOrder  string
	Limit      int
	Offset     int
}

// ImageRepository defines the interface for image data access
type ImageRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, image *entities.SiteImage) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error)
	Update(ctx context.Context, image *entities.SiteImage) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	FindAll(ctx context.Context) ([]entities.SiteImage, error)
	FindWithFilter(ctx context.Context, filter ImageFilter) ([]entities.SiteImage, error)
	CountWithFilter(ctx context.Context, filter ImageFilter) (int64, error)

	// Bulk operations
	BulkUpdateCategory(ctx context.Context, imageIDs []uuid.UUID, categoryID *uuid.UUID) error
	BulkUpdateVisibility(ctx context.Context, imageIDs []uuid.UUID, isPublic bool) error
	BulkDelete(ctx context.Context, imageIDs []uuid.UUID) error

	// Search operations
	SearchByName(ctx context.Context, query string, limit int) ([]entities.SiteImage, error)
	SearchByTags(ctx context.Context, tags []string, limit int) ([]entities.SiteImage, error)

	// Statistics
	GetTotalSize(ctx context.Context) (int64, error)
	GetCountByCategory(ctx context.Context) (map[uuid.UUID]int64, error)
	GetPopularTags(ctx context.Context, limit int) ([]TagCount, error)
}

// TagCount represents a tag with its usage count
type TagCount struct {
	Tag   string
	Count int64
}

// ImageCategoryRepository is defined in image_category_repository.go
