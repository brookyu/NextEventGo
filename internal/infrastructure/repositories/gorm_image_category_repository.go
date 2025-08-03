package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormImageCategoryRepository implements ImageCategoryRepository using GORM
type GormImageCategoryRepository struct {
	db *gorm.DB
}

// NewGormImageCategoryRepository creates a new GORM-based image category repository
func NewGormImageCategoryRepository(db *gorm.DB) repositories.ImageCategoryRepository {
	return &GormImageCategoryRepository{db: db}
}

// Create creates a new image category
func (r *GormImageCategoryRepository) Create(ctx context.Context, category *entities.ImageCategory) error {
	return r.db.WithContext(ctx).Create(category).Error
}

// GetByID retrieves an image category by ID with options
func (r *GormImageCategoryRepository) GetByID(ctx context.Context, id uuid.UUID, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	var category entities.ImageCategory
	query := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	if options != nil && options.IncludeParent {
		query = query.Preload("Parent")
	}
	if options != nil && options.IncludeChildren {
		query = query.Preload("Children")
	}

	err := query.First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetAll retrieves all image categories with pagination
func (r *GormImageCategoryRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Offset(offset).
		Limit(limit).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// GetAllOrdered retrieves all categories ordered by sort order
func (r *GormImageCategoryRepository) GetAllOrdered(ctx context.Context) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// GetByName retrieves a category by name
func (r *GormImageCategoryRepository) GetByName(ctx context.Context, name string) (*entities.ImageCategory, error) {
	var category entities.ImageCategory
	err := r.db.WithContext(ctx).
		Where("name = ? AND is_deleted = ?", name, false).
		First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// Update updates an existing image category
func (r *GormImageCategoryRepository) Update(ctx context.Context, category *entities.ImageCategory) error {
	return r.db.WithContext(ctx).Save(category).Error
}

// Delete soft deletes an image category
func (r *GormImageCategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":    true,
			"deletion_time": gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of categories
func (r *GormImageCategoryRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// BulkCreate creates multiple categories in a single transaction
func (r *GormImageCategoryRepository) BulkCreate(ctx context.Context, categories []*entities.ImageCategory) error {
	if len(categories) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).CreateInBatches(categories, 100).Error
}

// BulkDelete soft deletes multiple categories by their IDs
func (r *GormImageCategoryRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	if len(ids) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("id IN ?", ids).
		Updates(map[string]interface{}{
			"is_deleted":    true,
			"deletion_time": gorm.Expr("NOW()"),
		}).Error
}

// BulkUpdate updates multiple categories with different data for each
func (r *GormImageCategoryRepository) BulkUpdate(ctx context.Context, updates map[uuid.UUID]map[string]interface{}) error {
	if len(updates) == 0 {
		return nil
	}

	// Process each update individually in a transaction
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for id, updateData := range updates {
			if err := tx.Model(&entities.ImageCategory{}).Where("id = ?", id).Updates(updateData).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// BulkMove moves multiple categories to a new parent category
func (r *GormImageCategoryRepository) BulkMove(ctx context.Context, ids []uuid.UUID, newParentID *uuid.UUID) error {
	if len(ids) == 0 {
		return nil
	}

	return r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("id IN ?", ids).
		Update("parent_id", newParentID).Error
}

// CanDelete checks if a category can be safely deleted
func (r *GormImageCategoryRepository) CanDelete(ctx context.Context, id uuid.UUID) (bool, string, error) {
	// Check if category has child categories
	var childCount int64
	err := r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("parent_id = ? AND is_deleted = ?", id, false).
		Count(&childCount).Error
	if err != nil {
		return false, "", err
	}

	if childCount > 0 {
		return false, "Category has child categories", nil
	}

	// Check if category has images
	var imageCount int64
	err = r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("category_id = ? AND is_deleted = ?", id, false).
		Count(&imageCount).Error
	if err != nil {
		return false, "", err
	}

	if imageCount > 0 {
		return false, "Category contains images", nil
	}

	return true, "", nil
}

// CountWithFilter returns the count of categories matching the filter
func (r *GormImageCategoryRepository) CountWithFilter(ctx context.Context, filter *repositories.ImageCategoryFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.ImageCategory{}).Where("is_deleted = ?", false)

	if filter != nil {
		query = r.applyFilter(query, filter)
	}

	err := query.Count(&count).Error
	return count, err
}

// applyFilter applies the filter conditions to the query
func (r *GormImageCategoryRepository) applyFilter(query *gorm.DB, filter *repositories.ImageCategoryFilter) *gorm.DB {
	if filter.Search != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+filter.Search+"%", "%"+filter.Search+"%")
	}

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	if filter.ParentID != nil {
		query = query.Where("parent_id = ?", *filter.ParentID)
	}

	if filter.Level != nil {
		query = query.Where("level = ?", *filter.Level)
	}

	if filter.IsRoot != nil {
		if *filter.IsRoot {
			query = query.Where("parent_id IS NULL")
		} else {
			query = query.Where("parent_id IS NOT NULL")
		}
	}

	if filter.IsVisible != nil {
		query = query.Where("is_visible = ?", *filter.IsVisible)
	}

	if filter.IsSystem != nil {
		query = query.Where("is_system = ?", *filter.IsSystem)
	}

	return query
}

// CreateSystemCategories creates default system categories (stub implementation)
func (r *GormImageCategoryRepository) CreateSystemCategories(ctx context.Context) error {
	// TODO: Implement system categories creation
	// This is a stub to satisfy the interface requirement
	return nil
}

// GetBySlug retrieves a category by slug
func (r *GormImageCategoryRepository) GetBySlug(ctx context.Context, slug string, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	var category entities.ImageCategory
	query := r.db.WithContext(ctx).Where("slug = ? AND is_deleted = ?", slug, false)

	if options != nil && options.IncludeParent {
		query = query.Preload("Parent")
	}
	if options != nil && options.IncludeChildren {
		query = query.Preload("Children")
	}

	err := query.First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// SoftDelete performs soft delete with deleted by tracking
func (r *GormImageCategoryRepository) SoftDelete(ctx context.Context, id uuid.UUID, deletedBy *uuid.UUID) error {
	updates := map[string]interface{}{
		"is_deleted":    true,
		"deletion_time": gorm.Expr("NOW()"),
	}
	if deletedBy != nil {
		updates["deleted_by"] = *deletedBy
	}

	return r.db.WithContext(ctx).
		Model(&entities.ImageCategory{}).
		Where("id = ?", id).
		Updates(updates).Error
}

// GetWithFilter retrieves categories with filter and options
func (r *GormImageCategoryRepository) GetWithFilter(ctx context.Context, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory
	query := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	if filter != nil {
		query = r.applyFilter(query, filter)
	}

	if options != nil && options.IncludeParent {
		query = query.Preload("Parent")
	}
	if options != nil && options.IncludeChildren {
		query = query.Preload("Children")
	}

	err := query.Find(&categories).Error
	return categories, err
}

// GetRootCategories retrieves root categories (no parent)
func (r *GormImageCategoryRepository) GetRootCategories(ctx context.Context, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory
	query := r.db.WithContext(ctx).Where("parent_id IS NULL AND is_deleted = ?", false)

	if options != nil && options.IncludeChildren {
		query = query.Preload("Children")
	}

	err := query.Order("sort_order ASC, name ASC").Find(&categories).Error
	return categories, err
}

// GetChildren retrieves child categories of a parent
func (r *GormImageCategoryRepository) GetChildren(ctx context.Context, parentID uuid.UUID, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	var categories []*entities.ImageCategory
	query := r.db.WithContext(ctx).Where("parent_id = ? AND is_deleted = ?", parentID, false)

	if options != nil && options.IncludeChildren {
		query = query.Preload("Children")
	}

	err := query.Order("sort_order ASC, name ASC").Find(&categories).Error
	return categories, err
}

// GetAncestors retrieves all ancestor categories
func (r *GormImageCategoryRepository) GetAncestors(ctx context.Context, categoryID uuid.UUID) ([]*entities.ImageCategory, error) {
	var ancestors []*entities.ImageCategory

	// Get the category first
	var category entities.ImageCategory
	if err := r.db.WithContext(ctx).Where("id = ? AND is_deleted = ?", categoryID, false).First(&category).Error; err != nil {
		return nil, err
	}

	// Traverse up the hierarchy
	currentParentID := category.ParentID
	for currentParentID != nil {
		var parent entities.ImageCategory
		if err := r.db.WithContext(ctx).Where("id = ? AND is_deleted = ?", *currentParentID, false).First(&parent).Error; err != nil {
			break // Stop if parent not found
		}
		ancestors = append([]*entities.ImageCategory{&parent}, ancestors...) // Prepend to maintain order
		currentParentID = parent.ParentID
	}

	return ancestors, nil
}

// GetDescendants retrieves all descendant categories (stub)
func (r *GormImageCategoryRepository) GetDescendants(ctx context.Context, categoryID uuid.UUID, maxDepth int) ([]*entities.ImageCategory, error) {
	// TODO: Implement recursive descendant retrieval
	return []*entities.ImageCategory{}, nil
}

// GetTree retrieves category tree structure (stub)
func (r *GormImageCategoryRepository) GetTree(ctx context.Context, rootID *uuid.UUID, maxDepth int) ([]*repositories.ImageCategoryTree, error) {
	// TODO: Implement tree structure retrieval
	return []*repositories.ImageCategoryTree{}, nil
}

// Search searches categories by query (stub)
func (r *GormImageCategoryRepository) Search(ctx context.Context, query string, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	// TODO: Implement search functionality
	return []*entities.ImageCategory{}, nil
}

// SearchByType searches categories by type (stub)
func (r *GormImageCategoryRepository) SearchByType(ctx context.Context, categoryType entities.ImageCategoryType, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	// TODO: Implement type-based search
	return []*entities.ImageCategory{}, nil
}

// GetStats retrieves category statistics (stub)
func (r *GormImageCategoryRepository) GetStats(ctx context.Context) (*repositories.ImageCategoryStats, error) {
	// TODO: Implement statistics calculation
	return &repositories.ImageCategoryStats{}, nil
}

// GetCategoryStats retrieves statistics for a specific category (stub)
func (r *GormImageCategoryRepository) GetCategoryStats(ctx context.Context, categoryID uuid.UUID) (*repositories.ImageCategoryWithStats, error) {
	// TODO: Implement category-specific statistics
	return &repositories.ImageCategoryWithStats{}, nil
}

// UpdateImageCounts updates image counts for categories (stub)
func (r *GormImageCategoryRepository) UpdateImageCounts(ctx context.Context, categoryID *uuid.UUID) error {
	// TODO: Implement image count updates
	return nil
}

// IsSlugUnique checks if slug is unique (stub)
func (r *GormImageCategoryRepository) IsSlugUnique(ctx context.Context, slug string, excludeID *uuid.UUID) (bool, error) {
	// TODO: Implement slug uniqueness check
	return true, nil
}

// IsNameUnique checks if name is unique within parent (stub)
func (r *GormImageCategoryRepository) IsNameUnique(ctx context.Context, name string, parentID *uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	// TODO: Implement name uniqueness check
	return true, nil
}

// GetDefaultCategory retrieves the default category (stub)
func (r *GormImageCategoryRepository) GetDefaultCategory(ctx context.Context) (*entities.ImageCategory, error) {
	// TODO: Implement default category retrieval
	return nil, nil
}

// SetDefaultCategory sets the default category (stub)
func (r *GormImageCategoryRepository) SetDefaultCategory(ctx context.Context, categoryID uuid.UUID) error {
	// TODO: Implement default category setting
	return nil
}
