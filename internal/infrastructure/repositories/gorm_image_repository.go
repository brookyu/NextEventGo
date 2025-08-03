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

// GormImageRepository implements ImageRepository using GORM
type GormImageRepository struct {
	db *gorm.DB
}

// NewGormImageRepository creates a new GORM image repository
func NewGormImageRepository(db *gorm.DB) repositories.ImageRepository {
	return &GormImageRepository{db: db}
}

// Create creates a new image record
func (r *GormImageRepository) Create(ctx context.Context, image *entities.SiteImage) error {
	if err := r.db.WithContext(ctx).Create(image).Error; err != nil {
		return fmt.Errorf("failed to create image: %w", err)
	}
	return nil
}

// FindByID finds an image by ID
func (r *GormImageRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error) {
	var image entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		First(&image, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find image: %w", err)
	}
	
	return &image, nil
}

// Update updates an existing image
func (r *GormImageRepository) Update(ctx context.Context, image *entities.SiteImage) error {
	if err := r.db.WithContext(ctx).Save(image).Error; err != nil {
		return fmt.Errorf("failed to update image: %w", err)
	}
	return nil
}

// Delete deletes an image by ID
func (r *GormImageRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SiteImage{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete image: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindAll finds all images
func (r *GormImageRepository) FindAll(ctx context.Context) ([]entities.SiteImage, error) {
	var images []entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Find(&images).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find all images: %w", err)
	}
	
	return images, nil
}

// FindWithFilter finds images with filtering options
func (r *GormImageRepository) FindWithFilter(ctx context.Context, filter repositories.ImageFilter) ([]entities.SiteImage, error) {
	var images []entities.SiteImage
	
	query := r.db.WithContext(ctx).Preload("Category")
	
	// Apply filters
	query = r.applyFilters(query, filter)
	
	// Apply sorting
	if filter.SortBy != "" {
		order := filter.SortBy
		if filter.SortOrder == "desc" {
			order += " DESC"
		} else {
			order += " ASC"
		}
		query = query.Order(order)
	}
	
	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	
	err := query.Find(&images).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find images with filter: %w", err)
	}
	
	return images, nil
}

// CountWithFilter counts images with filtering options
func (r *GormImageRepository) CountWithFilter(ctx context.Context, filter repositories.ImageFilter) (int64, error) {
	var count int64
	
	query := r.db.WithContext(ctx).Model(&entities.SiteImage{})
	query = r.applyFilters(query, filter)
	
	err := query.Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count images with filter: %w", err)
	}
	
	return count, nil
}

// applyFilters applies filtering conditions to a query
func (r *GormImageRepository) applyFilters(query *gorm.DB, filter repositories.ImageFilter) *gorm.DB {
	// Search filter
	if filter.Search != "" {
		searchTerm := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}
	
	// Category filter
	if filter.CategoryID != "" {
		if categoryUUID, err := uuid.Parse(filter.CategoryID); err == nil {
			query = query.Where("category_id = ?", categoryUUID)
		}
	}
	
	// Tags filter
	if len(filter.Tags) > 0 {
		query = query.Where("tags && ?", filter.Tags)
	}
	
	// Public/private filter
	if filter.IsPublic != nil {
		query = query.Where("is_public = ?", *filter.IsPublic)
	}
	
	return query
}

// BulkUpdateCategory updates category for multiple images
func (r *GormImageRepository) BulkUpdateCategory(ctx context.Context, imageIDs []uuid.UUID, categoryID *uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("id IN ?", imageIDs).
		Update("category_id", categoryID).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk update category: %w", err)
	}
	
	return nil
}

// BulkUpdateVisibility updates visibility for multiple images
func (r *GormImageRepository) BulkUpdateVisibility(ctx context.Context, imageIDs []uuid.UUID, isPublic bool) error {
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("id IN ?", imageIDs).
		Update("is_public", isPublic).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk update visibility: %w", err)
	}
	
	return nil
}

// BulkDelete deletes multiple images
func (r *GormImageRepository) BulkDelete(ctx context.Context, imageIDs []uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("id IN ?", imageIDs).
		Delete(&entities.SiteImage{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk delete images: %w", err)
	}
	
	return nil
}

// SearchByName searches images by name
func (r *GormImageRepository) SearchByName(ctx context.Context, query string, limit int) ([]entities.SiteImage, error) {
	var images []entities.SiteImage
	
	searchTerm := "%" + strings.ToLower(query) + "%"
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("LOWER(name) LIKE ?", searchTerm).
		Limit(limit).
		Find(&images).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to search images by name: %w", err)
	}
	
	return images, nil
}

// SearchByTags searches images by tags
func (r *GormImageRepository) SearchByTags(ctx context.Context, tags []string, limit int) ([]entities.SiteImage, error) {
	var images []entities.SiteImage
	
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("tags && ?", tags).
		Limit(limit).
		Find(&images).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to search images by tags: %w", err)
	}
	
	return images, nil
}

// GetTotalSize gets the total size of all images
func (r *GormImageRepository) GetTotalSize(ctx context.Context) (int64, error) {
	var totalSize int64
	
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Select("COALESCE(SUM(file_size), 0)").
		Scan(&totalSize).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to get total size: %w", err)
	}
	
	return totalSize, nil
}

// GetCountByCategory gets image count by category
func (r *GormImageRepository) GetCountByCategory(ctx context.Context) (map[uuid.UUID]int64, error) {
	var results []struct {
		CategoryID uuid.UUID `json:"category_id"`
		Count      int64     `json:"count"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Select("category_id, COUNT(*) as count").
		Where("category_id IS NOT NULL").
		Group("category_id").
		Scan(&results).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get count by category: %w", err)
	}
	
	counts := make(map[uuid.UUID]int64)
	for _, result := range results {
		counts[result.CategoryID] = result.Count
	}
	
	return counts, nil
}

// GetPopularTags gets popular tags with their counts
func (r *GormImageRepository) GetPopularTags(ctx context.Context, limit int) ([]repositories.TagCount, error) {
	var results []repositories.TagCount
	
	// This is a simplified implementation
	// In a real application, you would use a more sophisticated query
	// to unnest the tags array and count them
	err := r.db.WithContext(ctx).
		Raw(`
			SELECT tag, COUNT(*) as count
			FROM (
				SELECT unnest(tags) as tag
				FROM site_images
				WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
			) t
			GROUP BY tag
			ORDER BY count DESC
			LIMIT ?
		`, limit).
		Scan(&results).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get popular tags: %w", err)
	}
	
	return results, nil
}
