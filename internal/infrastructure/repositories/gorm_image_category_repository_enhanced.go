package repositories

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormImageCategoryRepositoryEnhanced implements ImageCategoryRepository using GORM with enhanced features
type GormImageCategoryRepositoryEnhanced struct {
	db *gorm.DB
}

// NewGormImageCategoryRepositoryEnhanced creates a new enhanced GORM image category repository
func NewGormImageCategoryRepositoryEnhanced(db *gorm.DB) repositories.ImageCategoryRepository {
	return &GormImageCategoryRepositoryEnhanced{db: db}
}

// Create creates a new image category
func (r *GormImageCategoryRepositoryEnhanced) Create(ctx context.Context, category *entities.ImageCategory) error {
	if err := r.db.WithContext(ctx).Create(category).Error; err != nil {
		return fmt.Errorf("failed to create image category: %w", err)
	}
	return nil
}

// GetByID retrieves an image category by ID
func (r *GormImageCategoryRepositoryEnhanced) GetByID(ctx context.Context, id uuid.UUID, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	var category entities.ImageCategory

	query := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", id)

	// Apply preloading based on options
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get image category: %w", err)
	}

	return &category, nil
}

// GetBySlug retrieves an image category by slug
func (r *GormImageCategoryRepositoryEnhanced) GetBySlug(ctx context.Context, slug string, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	var category entities.ImageCategory

	query := r.db.WithContext(ctx).Where("Slug = ? AND IsDeleted = 0", slug)

	// Apply preloading based on options
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get image category by slug: %w", err)
	}

	return &category, nil
}

// GetByName retrieves a category by name
func (r *GormImageCategoryRepositoryEnhanced) GetByName(ctx context.Context, name string) (*entities.ImageCategory, error) {
	var category entities.ImageCategory

	err := r.db.WithContext(ctx).
		Where("Name = ? AND IsDeleted = 0", name).
		First(&category).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get image category by name: %w", err)
	}

	return &category, nil
}

// Update updates an existing image category
func (r *GormImageCategoryRepositoryEnhanced) Update(ctx context.Context, category *entities.ImageCategory) error {
	if err := r.db.WithContext(ctx).Save(category).Error; err != nil {
		return fmt.Errorf("failed to update image category: %w", err)
	}
	return nil
}

// Delete hard deletes an image category
func (r *GormImageCategoryRepositoryEnhanced) Delete(ctx context.Context, id uuid.UUID) error {
	if err := r.db.WithContext(ctx).Delete(&entities.ImageCategory{}, "Id = ?", id).Error; err != nil {
		return fmt.Errorf("failed to delete image category: %w", err)
	}
	return nil
}

// SoftDelete soft deletes an image category
func (r *GormImageCategoryRepositoryEnhanced) SoftDelete(ctx context.Context, id uuid.UUID, deletedBy *uuid.UUID) error {
	updates := map[string]interface{}{
		"IsDeleted":    true,
		"DeletionTime": gorm.Expr("NOW()"),
	}
	if deletedBy != nil {
		updates["DeleterId"] = *deletedBy
	}

	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("Id = ?", id).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to soft delete image category: %w", err)
	}
	return nil
}

// GetAll retrieves all image categories with pagination
func (r *GormImageCategoryRepositoryEnhanced) GetAll(ctx context.Context, offset, limit int) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).Where("IsDeleted = 0").Order("SortOrder ASC, Name ASC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get all image categories: %w", err)
	}

	return categories, nil
}

// GetAllOrdered retrieves all categories ordered by sort order
func (r *GormImageCategoryRepositoryEnhanced) GetAllOrdered(ctx context.Context) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	err := r.db.WithContext(ctx).
		Where("IsDeleted = 0").
		Order("SortOrder ASC, Name ASC").
		Find(&categories).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get ordered image categories: %w", err)
	}

	return categories, nil
}

// GetWithFilter retrieves categories with filtering options
func (r *GormImageCategoryRepositoryEnhanced) GetWithFilter(ctx context.Context, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).Where("IsDeleted = 0")

	// Apply filters
	query = r.applyFilters(query, filter)

	// Apply preloading
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	// Apply sorting
	if filter != nil && filter.SortBy != "" {
		order := filter.SortBy
		if filter.SortOrder == "desc" {
			order += " DESC"
		} else {
			order += " ASC"
		}
		query = query.Order(order)
	} else {
		query = query.Order("SortOrder ASC, Name ASC")
	}

	// Apply pagination
	if filter != nil {
		if filter.Limit > 0 {
			query = query.Limit(filter.Limit)
		}
		if filter.Offset > 0 {
			query = query.Offset(filter.Offset)
		}
	}

	err := query.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get categories with filter: %w", err)
	}

	return categories, nil
}

// Count returns the total number of categories
func (r *GormImageCategoryRepositoryEnhanced) Count(ctx context.Context) (int64, error) {
	var count int64

	err := r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("IsDeleted = 0").
		Count(&count).Error

	if err != nil {
		return 0, fmt.Errorf("failed to count image categories: %w", err)
	}

	return count, nil
}

// CountWithFilter returns the count of categories matching the filter
func (r *GormImageCategoryRepositoryEnhanced) CountWithFilter(ctx context.Context, filter *repositories.ImageCategoryFilter) (int64, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).Where("IsDeleted = 0")

	// Apply filters
	query = r.applyFilters(query, filter)

	err := query.Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count categories with filter: %w", err)
	}

	return count, nil
}

// GetRootCategories retrieves root categories (no parent)
func (r *GormImageCategoryRepositoryEnhanced) GetRootCategories(ctx context.Context, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).
		Where("ParentId IS NULL AND IsDeleted = 0").
		Order("SortOrder ASC, Name ASC")

	// Apply preloading
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get root categories: %w", err)
	}

	return categories, nil
}

// GetChildren retrieves direct children of a category
func (r *GormImageCategoryRepositoryEnhanced) GetChildren(ctx context.Context, parentID uuid.UUID, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).
		Where("ParentId = ? AND IsDeleted = 0", parentID).
		Order("SortOrder ASC, Name ASC")

	// Apply preloading
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get children categories: %w", err)
	}

	return categories, nil
}

// GetAncestors retrieves all ancestor categories
func (r *GormImageCategoryRepositoryEnhanced) GetAncestors(ctx context.Context, categoryID uuid.UUID) ([]*entities.ImageCategory, error) {
	// First get the category to get its path
	var category entities.ImageCategory
	if err := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", categoryID).First(&category).Error; err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	// Parse path to get ancestor IDs
	pathParts := strings.Split(strings.Trim(category.Path, "/"), "/")
	if len(pathParts) <= 1 {
		return []*entities.ImageCategory{}, nil // No ancestors
	}

	// Get all ancestor IDs from path (excluding self)
	ancestorIDs := make([]uuid.UUID, 0, len(pathParts)-1)
	for i := 0; i < len(pathParts)-1; i++ {
		if id, err := uuid.Parse(pathParts[i]); err == nil {
			ancestorIDs = append(ancestorIDs, id)
		}
	}

	if len(ancestorIDs) == 0 {
		return []*entities.ImageCategory{}, nil
	}

	var ancestors []*entities.ImageCategory
	err := r.db.WithContext(ctx).
		Where("Id IN ? AND IsDeleted = 0", ancestorIDs).
		Order("Level ASC").
		Find(&ancestors).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get ancestors: %w", err)
	}

	return ancestors, nil
}

// GetDescendants retrieves all descendant categories
func (r *GormImageCategoryRepositoryEnhanced) GetDescendants(ctx context.Context, categoryID uuid.UUID, maxDepth int) ([]*entities.ImageCategory, error) {
	// First get the category to get its path and level
	var category entities.ImageCategory
	if err := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", categoryID).First(&category).Error; err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	query := r.db.WithContext(ctx).
		Where("Path LIKE ? AND IsDeleted = 0", category.Path+"/%").
		Order("Level ASC, SortOrder ASC")

	// Apply max depth filter if specified
	if maxDepth > 0 {
		query = query.Where("Level <= ?", category.Level+maxDepth)
	}

	var descendants []*entities.ImageCategory
	err := query.Find(&descendants).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get descendants: %w", err)
	}

	return descendants, nil
}

// GetTree retrieves a hierarchical tree structure
func (r *GormImageCategoryRepositoryEnhanced) GetTree(ctx context.Context, rootID *uuid.UUID, maxDepth int) ([]*repositories.ImageCategoryTree, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).Where("IsDeleted = 0")

	if rootID != nil {
		// Get tree starting from specific root
		var rootCategory entities.ImageCategory
		if err := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", *rootID).First(&rootCategory).Error; err != nil {
			return nil, fmt.Errorf("failed to get root category: %w", err)
		}

		query = query.Where("(Id = ? OR Path LIKE ?)", *rootID, rootCategory.Path+"/%")

		if maxDepth > 0 {
			query = query.Where("Level <= ?", rootCategory.Level+maxDepth)
		}
	} else {
		// Get full tree
		if maxDepth > 0 {
			query = query.Where("Level <= ?", maxDepth)
		}
	}

	err := query.Order("Level ASC, SortOrder ASC, Name ASC").Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get categories for tree: %w", err)
	}

	return r.buildTree(categories, rootID), nil
}

// Bulk operations

// BulkCreate creates multiple categories
func (r *GormImageCategoryRepositoryEnhanced) BulkCreate(ctx context.Context, categories []*entities.ImageCategory) error {
	if len(categories) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, category := range categories {
			if err := tx.Create(category).Error; err != nil {
				return fmt.Errorf("failed to create category %s: %w", category.Name, err)
			}
		}
		return nil
	})
}

// BulkUpdate updates multiple categories
func (r *GormImageCategoryRepositoryEnhanced) BulkUpdate(ctx context.Context, updates map[uuid.UUID]map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for id, updateData := range updates {
			if err := tx.Model(&entities.ImageCategory{}).Where("Id = ?", id).Updates(updateData).Error; err != nil {
				return fmt.Errorf("failed to update category %s: %w", id.String(), err)
			}
		}
		return nil
	})
}

// BulkDelete deletes multiple categories
func (r *GormImageCategoryRepositoryEnhanced) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	if len(ids) == 0 {
		return nil
	}

	if err := r.db.WithContext(ctx).Delete(&entities.ImageCategory{}, "Id IN ?", ids).Error; err != nil {
		return fmt.Errorf("failed to bulk delete categories: %w", err)
	}
	return nil
}

// BulkMove moves multiple categories to a new parent
func (r *GormImageCategoryRepositoryEnhanced) BulkMove(ctx context.Context, categoryIDs []uuid.UUID, newParentID *uuid.UUID) error {
	if len(categoryIDs) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, categoryID := range categoryIDs {
			var category entities.ImageCategory
			if err := tx.Where("Id = ?", categoryID).First(&category).Error; err != nil {
				return fmt.Errorf("failed to get category %s: %w", categoryID.String(), err)
			}

			category.ParentID = newParentID
			if err := tx.Save(&category).Error; err != nil {
				return fmt.Errorf("failed to move category %s: %w", categoryID.String(), err)
			}
		}
		return nil
	})
}

// Search operations

// Search searches categories by query
func (r *GormImageCategoryRepositoryEnhanced) Search(ctx context.Context, query string, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	dbQuery := r.db.WithContext(ctx).Where("IsDeleted = 0")

	// Add search conditions
	if query != "" {
		searchPattern := "%" + query + "%"
		dbQuery = dbQuery.Where("Name LIKE ? OR Description LIKE ? OR Slug LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	// Apply additional filters
	dbQuery = r.applyFilters(dbQuery, filter)

	// Apply preloading
	if options != nil {
		dbQuery = r.applyPreloading(dbQuery, options)
	}

	// Apply sorting and pagination
	if filter != nil {
		if filter.SortBy != "" {
			order := filter.SortBy
			if filter.SortOrder == "desc" {
				order += " DESC"
			} else {
				order += " ASC"
			}
			dbQuery = dbQuery.Order(order)
		}

		if filter.Limit > 0 {
			dbQuery = dbQuery.Limit(filter.Limit)
		}
		if filter.Offset > 0 {
			dbQuery = dbQuery.Offset(filter.Offset)
		}
	}

	err := dbQuery.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to search categories: %w", err)
	}

	return categories, nil
}

// SearchByType searches categories by type
func (r *GormImageCategoryRepositoryEnhanced) SearchByType(ctx context.Context, categoryType entities.ImageCategoryType, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory

	query := r.db.WithContext(ctx).
		Where("Type = ? AND IsDeleted = 0", categoryType).
		Order("SortOrder ASC, Name ASC")

	// Apply preloading
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.Find(&categories).Error
	if err != nil {
		return nil, fmt.Errorf("failed to search categories by type: %w", err)
	}

	return categories, nil
}

// Statistics and analytics

// GetStats retrieves overall category statistics
func (r *GormImageCategoryRepositoryEnhanced) GetStats(ctx context.Context) (*repositories.ImageCategoryStats, error) {
	stats := &repositories.ImageCategoryStats{
		CategoriesByType:   make(map[entities.ImageCategoryType]int64),
		CategoriesByStatus: make(map[entities.ImageCategoryStatus]int64),
		CategoriesByLevel:  make(map[int]int64),
	}

	// Get total categories
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).Where("IsDeleted = 0").Count(&stats.TotalCategories).Error; err != nil {
		return nil, fmt.Errorf("failed to count total categories: %w", err)
	}

	// Get categories by type
	var typeStats []struct {
		Type  entities.ImageCategoryType
		Count int64
	}
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Select("Type, COUNT(*) as count").
		Where("IsDeleted = 0").
		Group("Type").
		Scan(&typeStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get type stats: %w", err)
	}
	for _, stat := range typeStats {
		stats.CategoriesByType[stat.Type] = stat.Count
	}

	// Get categories by status
	var statusStats []struct {
		Status entities.ImageCategoryStatus
		Count  int64
	}
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Select("Status, COUNT(*) as count").
		Where("IsDeleted = 0").
		Group("Status").
		Scan(&statusStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get status stats: %w", err)
	}
	for _, stat := range statusStats {
		stats.CategoriesByStatus[stat.Status] = stat.Count
	}

	// Get categories by level
	var levelStats []struct {
		Level int
		Count int64
	}
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Select("Level, COUNT(*) as count").
		Where("IsDeleted = 0").
		Group("Level").
		Scan(&levelStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get level stats: %w", err)
	}
	for _, stat := range levelStats {
		stats.CategoriesByLevel[stat.Level] = stat.Count
	}

	// Get total images and size
	var imageStats struct {
		TotalImages int64 `gorm:"column:total_images"`
		TotalSize   int64 `gorm:"column:total_size"`
	}
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Select("COALESCE(SUM(ImageCount), 0) as total_images, COALESCE(SUM(TotalSize), 0) as total_size").
		Where("IsDeleted = 0").
		Scan(&imageStats).Error; err != nil {
		return nil, fmt.Errorf("failed to get image stats: %w", err)
	}

	stats.TotalImages = imageStats.TotalImages
	stats.TotalSize = imageStats.TotalSize

	// Calculate average
	if stats.TotalCategories > 0 {
		stats.AverageImagesPerCategory = float64(stats.TotalImages) / float64(stats.TotalCategories)
	}

	return stats, nil
}

// GetCategoryStats retrieves statistics for a specific category
func (r *GormImageCategoryRepositoryEnhanced) GetCategoryStats(ctx context.Context, categoryID uuid.UUID) (*repositories.ImageCategoryWithStats, error) {
	var category entities.ImageCategory
	if err := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", categoryID).First(&category).Error; err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	stats := &repositories.ImageCategoryWithStats{
		ImageCategory: &category,
		ImageCount:    category.ImageCount,
		TotalSize:     category.TotalSize,
	}

	// Get children count
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("ParentId = ? AND IsDeleted = 0", categoryID).
		Count(&stats.ChildrenCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count children: %w", err)
	}

	// Get descendants count
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("Path LIKE ? AND IsDeleted = 0", category.Path+"/%").
		Count(&stats.DescendantsCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count descendants: %w", err)
	}

	return stats, nil
}

// UpdateImageCounts updates image counts for categories
func (r *GormImageCategoryRepositoryEnhanced) UpdateImageCounts(ctx context.Context, categoryID *uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		query := tx.Model(&entities.ImageCategory{}).Where("IsDeleted = 0")

		if categoryID != nil {
			query = query.Where("Id = ?", *categoryID)
		}

		var categories []entities.ImageCategory
		if err := query.Find(&categories).Error; err != nil {
			return fmt.Errorf("failed to get categories: %w", err)
		}

		for _, category := range categories {
			if err := category.UpdateImageCount(tx); err != nil {
				return fmt.Errorf("failed to update image count for category %s: %w", category.ID.String(), err)
			}
		}

		return nil
	})
}

// Validation operations

// IsSlugUnique checks if a slug is unique
func (r *GormImageCategoryRepositoryEnhanced) IsSlugUnique(ctx context.Context, slug string, excludeID *uuid.UUID) (bool, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("Slug = ? AND IsDeleted = 0", slug)

	if excludeID != nil {
		query = query.Where("Id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check slug uniqueness: %w", err)
	}

	return count == 0, nil
}

// IsNameUnique checks if a name is unique within the same parent
func (r *GormImageCategoryRepositoryEnhanced) IsNameUnique(ctx context.Context, name string, parentID *uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("Name = ? AND IsDeleted = 0", name)

	if parentID != nil {
		query = query.Where("ParentId = ?", *parentID)
	} else {
		query = query.Where("ParentId IS NULL")
	}

	if excludeID != nil {
		query = query.Where("Id != ?", *excludeID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check name uniqueness: %w", err)
	}

	return count == 0, nil
}

// CanDelete checks if a category can be deleted
func (r *GormImageCategoryRepositoryEnhanced) CanDelete(ctx context.Context, categoryID uuid.UUID) (bool, string, error) {
	var category entities.ImageCategory
	if err := r.db.WithContext(ctx).Where("Id = ? AND IsDeleted = 0", categoryID).First(&category).Error; err != nil {
		return false, "Category not found", err
	}

	// Check if it's a system category
	if category.IsSystem {
		return false, "Cannot delete system category", nil
	}

	// Check if it's the default category
	if category.IsDefault {
		return false, "Cannot delete default category", nil
	}

	// Check if it has children
	var childCount int64
	if err := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).
		Where("ParentId = ? AND IsDeleted = 0", categoryID).
		Count(&childCount).Error; err != nil {
		return false, "Failed to check children", err
	}

	if childCount > 0 {
		return false, fmt.Sprintf("Category has %d child categories", childCount), nil
	}

	// Check if it has images
	if category.ImageCount > 0 {
		return false, fmt.Sprintf("Category has %d images", category.ImageCount), nil
	}

	return true, "", nil
}

// System operations

// GetDefaultCategory retrieves the default category
func (r *GormImageCategoryRepositoryEnhanced) GetDefaultCategory(ctx context.Context) (*entities.ImageCategory, error) {
	var category entities.ImageCategory

	err := r.db.WithContext(ctx).
		Where("IsDefault = 1 AND IsDeleted = 0").
		First(&category).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to get default category: %w", err)
	}

	return &category, nil
}

// SetDefaultCategory sets a category as the default
func (r *GormImageCategoryRepositoryEnhanced) SetDefaultCategory(ctx context.Context, categoryID uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Remove default flag from all categories
		if err := tx.Model(&entities.ImageCategory{}).
			Where("IsDefault = 1").
			Update("IsDefault", false).Error; err != nil {
			return fmt.Errorf("failed to clear default flags: %w", err)
		}

		// Set the new default category
		if err := tx.Model(&entities.ImageCategory{}).
			Where("Id = ? AND IsDeleted = 0", categoryID).
			Update("IsDefault", true).Error; err != nil {
			return fmt.Errorf("failed to set default category: %w", err)
		}

		return nil
	})
}

// CreateSystemCategories creates default system categories
func (r *GormImageCategoryRepositoryEnhanced) CreateSystemCategories(ctx context.Context) error {
	systemCategories := []*entities.ImageCategory{
		{
			Name:        "General",
			Slug:        "general",
			Description: "General purpose images",
			Type:        entities.ImageCategoryTypeGeneral,
			Status:      entities.ImageCategoryStatusActive,
			IsDefault:   true,
			IsSystem:    true,
			IsVisible:   true,
			SortOrder:   1,
			Color:       "#6366f1",
		},
		{
			Name:        "Articles",
			Slug:        "articles",
			Description: "Images for articles",
			Type:        entities.ImageCategoryTypeArticle,
			Status:      entities.ImageCategoryStatusActive,
			IsSystem:    true,
			IsVisible:   true,
			SortOrder:   2,
			Color:       "#10b981",
		},
		{
			Name:        "Events",
			Slug:        "events",
			Description: "Images for events",
			Type:        entities.ImageCategoryTypeEvent,
			Status:      entities.ImageCategoryStatusActive,
			IsSystem:    true,
			IsVisible:   true,
			SortOrder:   3,
			Color:       "#f59e0b",
		},
		{
			Name:        "Banners",
			Slug:        "banners",
			Description: "Banner images",
			Type:        entities.ImageCategoryTypeBanner,
			Status:      entities.ImageCategoryStatusActive,
			IsSystem:    true,
			IsVisible:   true,
			SortOrder:   4,
			Color:       "#ef4444",
		},
		{
			Name:        "Avatars",
			Slug:        "avatars",
			Description: "User avatar images",
			Type:        entities.ImageCategoryTypeAvatar,
			Status:      entities.ImageCategoryStatusActive,
			IsSystem:    true,
			IsVisible:   true,
			SortOrder:   5,
			Color:       "#8b5cf6",
		},
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, category := range systemCategories {
			// Check if category already exists
			var existing entities.ImageCategory
			err := tx.Where("Slug = ? AND IsDeleted = 0", category.Slug).First(&existing).Error

			if err == gorm.ErrRecordNotFound {
				// Create new category
				if err := tx.Create(category).Error; err != nil {
					return fmt.Errorf("failed to create system category %s: %w", category.Name, err)
				}
			} else if err != nil {
				return fmt.Errorf("failed to check existing category %s: %w", category.Name, err)
			}
			// If category exists, skip creation
		}

		return nil
	})
}

// Helper methods

// applyFilters applies filtering conditions to a query
func (r *GormImageCategoryRepositoryEnhanced) applyFilters(query *gorm.DB, filter *repositories.ImageCategoryFilter) *gorm.DB {
	if filter == nil {
		return query
	}

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("Name LIKE ? OR Description LIKE ? OR Slug LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	if filter.Type != "" {
		query = query.Where("Type = ?", filter.Type)
	}

	if filter.Status != "" {
		query = query.Where("Status = ?", filter.Status)
	}

	if filter.ParentID != nil {
		query = query.Where("ParentId = ?", *filter.ParentID)
	}

	if filter.Level != nil {
		query = query.Where("Level = ?", *filter.Level)
	}

	if filter.IsRoot != nil {
		if *filter.IsRoot {
			query = query.Where("ParentId IS NULL")
		} else {
			query = query.Where("ParentId IS NOT NULL")
		}
	}

	if filter.IsVisible != nil {
		query = query.Where("IsVisible = ?", *filter.IsVisible)
	}

	if filter.IsSystem != nil {
		query = query.Where("IsSystem = ?", *filter.IsSystem)
	}

	return query
}

// applyPreloading applies preloading based on options
func (r *GormImageCategoryRepositoryEnhanced) applyPreloading(query *gorm.DB, options *repositories.ImageCategoryListOptions) *gorm.DB {
	if options == nil {
		return query
	}

	if options.IncludeParent {
		query = query.Preload("Parent")
	}

	if options.IncludeChildren {
		if options.MaxDepth > 0 {
			// Limited depth preloading would require custom logic
			query = query.Preload("Children")
		} else {
			query = query.Preload("Children")
		}
	}

	if options.IncludeImages {
		query = query.Preload("Images")
	}

	if options.IncludeCreator {
		query = query.Preload("Creator")
	}

	return query
}

// buildTree builds a hierarchical tree structure from flat category list
func (r *GormImageCategoryRepositoryEnhanced) buildTree(categories []*entities.ImageCategory, rootID *uuid.UUID) []*repositories.ImageCategoryTree {
	// Create a map for quick lookup
	categoryMap := make(map[uuid.UUID]*entities.ImageCategory)
	for _, category := range categories {
		categoryMap[category.ID] = category
	}

	// Create tree nodes
	nodeMap := make(map[uuid.UUID]*repositories.ImageCategoryTree)
	var roots []*repositories.ImageCategoryTree

	for _, category := range categories {
		node := &repositories.ImageCategoryTree{
			Category: category,
			Children: []*repositories.ImageCategoryTree{},
			Depth:    category.Level,
		}
		nodeMap[category.ID] = node

		if category.ParentID == nil || (rootID != nil && category.ID == *rootID) {
			roots = append(roots, node)
		}
	}

	// Build parent-child relationships
	for _, category := range categories {
		if category.ParentID != nil {
			if parentNode, exists := nodeMap[*category.ParentID]; exists {
				if childNode, exists := nodeMap[category.ID]; exists {
					parentNode.Children = append(parentNode.Children, childNode)
				}
			}
		}
	}

	return roots
}
