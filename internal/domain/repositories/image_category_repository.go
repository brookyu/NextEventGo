package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// ImageCategoryFilter represents filtering options for image category queries
type ImageCategoryFilter struct {
	Search       string                       `json:"search,omitempty"`
	Type         entities.ImageCategoryType   `json:"type,omitempty"`
	Status       entities.ImageCategoryStatus `json:"status,omitempty"`
	ParentID     *uuid.UUID                   `json:"parentId,omitempty"`
	Level        *int                         `json:"level,omitempty"`
	IsRoot       *bool                        `json:"isRoot,omitempty"`
	IsVisible    *bool                        `json:"isVisible,omitempty"`
	IsSystem     *bool                        `json:"isSystem,omitempty"`
	SortBy       string                       `json:"sortBy,omitempty"`    // name, created_at, sort_order, image_count
	SortOrder    string                       `json:"sortOrder,omitempty"` // asc, desc
	Limit        int                          `json:"limit,omitempty"`
	Offset       int                          `json:"offset,omitempty"`
	IncludeStats bool                         `json:"includeStats,omitempty"` // Include image count and size stats
}

// ImageCategoryListOptions represents options for listing categories
type ImageCategoryListOptions struct {
	IncludeParent   bool `json:"includeParent,omitempty"`
	IncludeChildren bool `json:"includeChildren,omitempty"`
	IncludeImages   bool `json:"includeImages,omitempty"`
	IncludeCreator  bool `json:"includeCreator,omitempty"`
	MaxDepth        int  `json:"maxDepth,omitempty"` // Maximum depth for children (0 = no limit)
}

// ImageCategoryStats represents statistics for image categories
type ImageCategoryStats struct {
	TotalCategories          int64                                  `json:"totalCategories"`
	CategoriesByType         map[entities.ImageCategoryType]int64   `json:"categoriesByType"`
	CategoriesByStatus       map[entities.ImageCategoryStatus]int64 `json:"categoriesByStatus"`
	CategoriesByLevel        map[int]int64                          `json:"categoriesByLevel"`
	TotalImages              int64                                  `json:"totalImages"`
	TotalSize                int64                                  `json:"totalSize"`
	AverageImagesPerCategory float64                                `json:"averageImagesPerCategory"`
	TopCategories            []*ImageCategoryWithStats              `json:"topCategories"`
}

// ImageCategoryWithStats represents a category with its statistics
type ImageCategoryWithStats struct {
	*entities.ImageCategory
	ImageCount       int64   `json:"imageCount"`
	TotalSize        int64   `json:"totalSize"`
	ChildrenCount    int64   `json:"childrenCount"`
	DescendantsCount int64   `json:"descendantsCount"`
	UsagePercentage  float64 `json:"usagePercentage"`
}

// ImageCategoryTree represents a hierarchical tree structure
type ImageCategoryTree struct {
	Category *entities.ImageCategory `json:"category"`
	Children []*ImageCategoryTree    `json:"children,omitempty"`
	Depth    int                     `json:"depth"`
}

// ImageCategoryRepository defines the interface for ImageCategory data operations
type ImageCategoryRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, category *entities.ImageCategory) error
	GetByID(ctx context.Context, id uuid.UUID, options *ImageCategoryListOptions) (*entities.ImageCategory, error)
	GetBySlug(ctx context.Context, slug string, options *ImageCategoryListOptions) (*entities.ImageCategory, error)
	GetByName(ctx context.Context, name string) (*entities.ImageCategory, error)
	Update(ctx context.Context, category *entities.ImageCategory) error
	Delete(ctx context.Context, id uuid.UUID) error
	SoftDelete(ctx context.Context, id uuid.UUID, deletedBy *uuid.UUID) error

	// Query operations
	GetAll(ctx context.Context, offset, limit int) ([]*entities.ImageCategory, error)
	GetAllOrdered(ctx context.Context) ([]*entities.ImageCategory, error)
	GetWithFilter(ctx context.Context, filter *ImageCategoryFilter, options *ImageCategoryListOptions) ([]*entities.ImageCategory, error)
	Count(ctx context.Context) (int64, error)
	CountWithFilter(ctx context.Context, filter *ImageCategoryFilter) (int64, error)

	// Hierarchy operations
	GetRootCategories(ctx context.Context, options *ImageCategoryListOptions) ([]*entities.ImageCategory, error)
	GetChildren(ctx context.Context, parentID uuid.UUID, options *ImageCategoryListOptions) ([]*entities.ImageCategory, error)
	GetAncestors(ctx context.Context, categoryID uuid.UUID) ([]*entities.ImageCategory, error)
	GetDescendants(ctx context.Context, categoryID uuid.UUID, maxDepth int) ([]*entities.ImageCategory, error)
	GetTree(ctx context.Context, rootID *uuid.UUID, maxDepth int) ([]*ImageCategoryTree, error)

	// Bulk operations
	BulkCreate(ctx context.Context, categories []*entities.ImageCategory) error
	BulkUpdate(ctx context.Context, updates map[uuid.UUID]map[string]interface{}) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error
	BulkMove(ctx context.Context, categoryIDs []uuid.UUID, newParentID *uuid.UUID) error

	// Search operations
	Search(ctx context.Context, query string, filter *ImageCategoryFilter, options *ImageCategoryListOptions) ([]*entities.ImageCategory, error)
	SearchByType(ctx context.Context, categoryType entities.ImageCategoryType, options *ImageCategoryListOptions) ([]*entities.ImageCategory, error)

	// Statistics and analytics
	GetStats(ctx context.Context) (*ImageCategoryStats, error)
	GetCategoryStats(ctx context.Context, categoryID uuid.UUID) (*ImageCategoryWithStats, error)
	UpdateImageCounts(ctx context.Context, categoryID *uuid.UUID) error

	// Validation operations
	IsSlugUnique(ctx context.Context, slug string, excludeID *uuid.UUID) (bool, error)
	IsNameUnique(ctx context.Context, name string, parentID *uuid.UUID, excludeID *uuid.UUID) (bool, error)
	CanDelete(ctx context.Context, categoryID uuid.UUID) (bool, string, error)

	// System operations
	GetDefaultCategory(ctx context.Context) (*entities.ImageCategory, error)
	SetDefaultCategory(ctx context.Context, categoryID uuid.UUID) error
	CreateSystemCategories(ctx context.Context) error
}
