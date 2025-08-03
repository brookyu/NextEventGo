package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormSiteImageRepository implements SiteImageRepository using GORM
type GormSiteImageRepository struct {
	db *gorm.DB
}

// NewGormSiteImageRepository creates a new GORM-based site image repository
func NewGormSiteImageRepository(db *gorm.DB) repositories.SiteImageRepository {
	return &GormSiteImageRepository{db: db}
}

// Create creates a new site image
func (r *GormSiteImageRepository) Create(ctx context.Context, image *entities.SiteImage) error {
	return r.db.WithContext(ctx).Create(image).Error
}

// GetByID retrieves a site image by ID
func (r *GormSiteImageRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error) {
	var image entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("is_deleted = ?", false).
		First(&image, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}

// GetAll retrieves all site images with pagination
func (r *GormSiteImageRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.SiteImage, error) {
	var images []*entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("is_deleted = ?", false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&images).Error
	return images, err
}

// GetByCategory retrieves images by category ID with pagination
func (r *GormSiteImageRepository) GetByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int) ([]*entities.SiteImage, error) {
	var images []*entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("category_id = ? AND is_deleted = ?", categoryId, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&images).Error
	return images, err
}

// SearchByName searches images by name with pagination
func (r *GormSiteImageRepository) SearchByName(ctx context.Context, name string, offset, limit int) ([]*entities.SiteImage, error) {
	var images []*entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("name LIKE ? AND is_deleted = ?", "%"+name+"%", false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&images).Error
	return images, err
}

// GetByMediaId retrieves an image by WeChat media ID
func (r *GormSiteImageRepository) GetByMediaId(ctx context.Context, mediaId string) (*entities.SiteImage, error) {
	var image entities.SiteImage
	err := r.db.WithContext(ctx).
		Preload("Category").
		Where("media_id = ? AND is_deleted = ?", mediaId, false).
		First(&image).Error
	if err != nil {
		return nil, err
	}
	return &image, nil
}

// Update updates an existing site image
func (r *GormSiteImageRepository) Update(ctx context.Context, image *entities.SiteImage) error {
	return r.db.WithContext(ctx).Save(image).Error
}

// Delete soft deletes a site image
func (r *GormSiteImageRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":     true,
			"deletion_time":  gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of images
func (r *GormSiteImageRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// CountByCategory returns the number of images in a category
func (r *GormSiteImageRepository) CountByCategory(ctx context.Context, categoryId uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteImage{}).
		Where("category_id = ? AND is_deleted = ?", categoryId, false).
		Count(&count).Error
	return count, err
}
