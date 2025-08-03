package repositories

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormVideoCategoryRepository implements VideoCategoryRepository using GORM
type GormVideoCategoryRepository struct {
	db *gorm.DB
}

// NewGormVideoCategoryRepository creates a new GORM video category repository
func NewGormVideoCategoryRepository(db *gorm.DB) repositories.VideoCategoryRepository {
	return &GormVideoCategoryRepository{db: db}
}

// Basic CRUD operations

func (r *GormVideoCategoryRepository) Create(ctx context.Context, category *entities.VideoCategory) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *GormVideoCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.VideoCategory, error) {
	var category entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("Id = ? AND IsDeleted = 0", id).
		First(&category).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}

	return &category, nil
}

func (r *GormVideoCategoryRepository) GetBySlug(ctx context.Context, slug string) (*entities.VideoCategory, error) {
	var category entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("Slug = ? AND IsDeleted = 0", slug).
		First(&category).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}

	return &category, nil
}

func (r *GormVideoCategoryRepository) Update(ctx context.Context, category *entities.VideoCategory) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *GormVideoCategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("Id = ?", id).
		Delete(&entities.VideoCategory{}).Error
}

// Hierarchy operations

func (r *GormVideoCategoryRepository) GetRootCategories(ctx context.Context) ([]*entities.VideoCategory, error) {
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("ParentId IS NULL AND IsDeleted = 0").
		Order("DisplayOrder ASC, Name ASC").
		Find(&categories).Error

	return categories, err
}

func (r *GormVideoCategoryRepository) GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.VideoCategory, error) {
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("ParentId = ? AND IsDeleted = 0", parentID).
		Order("DisplayOrder ASC, Name ASC").
		Find(&categories).Error

	return categories, err
}

func (r *GormVideoCategoryRepository) GetCategoryTree(ctx context.Context) ([]*entities.VideoCategory, error) {
	// Get all categories ordered by path for hierarchical display
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("IsDeleted = 0").
		Order("Path ASC").
		Find(&categories).Error

	if err != nil {
		return nil, err
	}

	// Build the tree structure
	categoryMap := make(map[uuid.UUID]*entities.VideoCategory)
	var rootCategories []*entities.VideoCategory

	// First pass: create map of all categories
	for i := range categories {
		categoryMap[categories[i].ID] = categories[i]
		categories[i].Children = []entities.VideoCategory{}
	}

	// Second pass: build parent-child relationships
	for _, category := range categories {
		if category.ParentID == nil {
			rootCategories = append(rootCategories, category)
		} else {
			if parent, exists := categoryMap[*category.ParentID]; exists {
				parent.Children = append(parent.Children, *category)
			}
		}
	}

	return rootCategories, nil
}

func (r *GormVideoCategoryRepository) GetCategoryPath(ctx context.Context, categoryID uuid.UUID) ([]*entities.VideoCategory, error) {
	var path []*entities.VideoCategory

	// Start with the given category
	currentID := categoryID

	for {
		var category entities.VideoCategory
		err := r.db.WithContext(ctx).
			Where("Id = ? AND IsDeleted = 0", currentID).
			First(&category).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				break
			}
			return nil, err
		}

		// Prepend to path (so root is first)
		path = append([]*entities.VideoCategory{&category}, path...)

		// Move to parent
		if category.ParentID == nil {
			break
		}
		currentID = *category.ParentID
	}

	return path, nil
}

// List operations

func (r *GormVideoCategoryRepository) List(ctx context.Context, filter repositories.VideoCategoryFilter) ([]*entities.VideoCategory, error) {
	query := r.buildCategoryQuery(filter)

	var categories []*entities.VideoCategory
	err := query.WithContext(ctx).Find(&categories).Error
	return categories, err
}

func (r *GormVideoCategoryRepository) Count(ctx context.Context, filter repositories.VideoCategoryFilter) (int64, error) {
	query := r.buildCategoryQuery(filter)

	var count int64
	err := query.WithContext(ctx).Model(&entities.VideoCategory{}).Count(&count).Error
	return count, err
}

func (r *GormVideoCategoryRepository) GetActive(ctx context.Context) ([]*entities.VideoCategory, error) {
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("IsActive = 1 AND IsDeleted = 0").
		Order("DisplayOrder ASC, Name ASC").
		Find(&categories).Error

	return categories, err
}

func (r *GormVideoCategoryRepository) GetFeatured(ctx context.Context) ([]*entities.VideoCategory, error) {
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("IsFeatured = 1 AND IsActive = 1 AND IsDeleted = 0").
		Order("DisplayOrder ASC, Name ASC").
		Find(&categories).Error

	return categories, err
}

// Video count operations

func (r *GormVideoCategoryRepository) UpdateVideoCount(ctx context.Context, categoryID uuid.UUID) error {
	// Count videos in this category
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("CategoryId = ? AND IsDeleted = 0", categoryID).
		Count(&count).Error

	if err != nil {
		return err
	}

	// Update the category
	return r.db.WithContext(ctx).
		Model(&entities.VideoCategory{}).
		Where("Id = ?", categoryID).
		Update("VideoCount", count).Error
}

func (r *GormVideoCategoryRepository) GetCategoriesWithVideos(ctx context.Context) ([]*entities.VideoCategory, error) {
	var categories []*entities.VideoCategory
	err := r.db.WithContext(ctx).
		Where("VideoCount > 0 AND IsDeleted = 0").
		Order("VideoCount DESC, Name ASC").
		Find(&categories).Error

	return categories, err
}

// Bulk operations

func (r *GormVideoCategoryRepository) BulkUpdateVideoCount(ctx context.Context, categoryIDs []uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, categoryID := range categoryIDs {
			// Count videos in this category
			var count int64
			err := tx.Model(&entities.Video{}).
				Where("CategoryId = ? AND IsDeleted = 0", categoryID).
				Count(&count).Error

			if err != nil {
				return err
			}

			// Update the category
			err = tx.Model(&entities.VideoCategory{}).
				Where("Id = ?", categoryID).
				Update("VideoCount", count).Error

			if err != nil {
				return err
			}
		}
		return nil
	})
}

// Helper methods

func (r *GormVideoCategoryRepository) buildCategoryQuery(filter repositories.VideoCategoryFilter) *gorm.DB {
	query := r.db.Model(&entities.VideoCategory{}).Where("IsDeleted = 0")

	// Apply filters
	if filter.ParentID != nil {
		query = query.Where("ParentId = ?", *filter.ParentID)
	}
	if filter.Level != nil {
		query = query.Where("Level = ?", *filter.Level)
	}
	if filter.IsActive != nil {
		query = query.Where("IsActive = ?", *filter.IsActive)
	}
	if filter.IsVisible != nil {
		query = query.Where("IsVisible = ?", *filter.IsVisible)
	}
	if filter.IsFeatured != nil {
		query = query.Where("IsFeatured = ?", *filter.IsFeatured)
	}

	// Search filters
	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("Name LIKE ? OR Description LIKE ? OR Keywords LIKE ?",
			searchTerm, searchTerm, searchTerm)
	}
	if filter.Name != "" {
		query = query.Where("Name LIKE ?", "%"+filter.Name+"%")
	}

	// Include relationships
	if filter.IncludeParent {
		query = query.Preload("Parent")
	}
	if filter.IncludeChildren {
		query = query.Preload("Children")
	}
	if filter.IncludeVideos {
		query = query.Preload("Videos")
	}
	if filter.IncludeImages {
		query = query.Preload("Image").Preload("Thumbnail")
	}

	// Sorting
	if filter.SortBy != "" {
		order := filter.SortBy
		if filter.SortOrder == "desc" {
			order += " DESC"
		} else {
			order += " ASC"
		}
		query = query.Order(order)
	} else {
		query = query.Order("DisplayOrder ASC, Name ASC")
	}

	// Pagination
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}

	return query
}
