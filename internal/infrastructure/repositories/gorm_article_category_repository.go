package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormArticleCategoryRepository implements ArticleCategoryRepository using GORM
type GormArticleCategoryRepository struct {
	db *gorm.DB
}

// NewGormArticleCategoryRepository creates a new GORM-based article category repository
func NewGormArticleCategoryRepository(db *gorm.DB) repositories.ArticleCategoryRepository {
	return &GormArticleCategoryRepository{db: db}
}

// Create creates a new article category
func (r *GormArticleCategoryRepository) Create(ctx context.Context, category *entities.ArticleCategory) error {
	return r.db.WithContext(ctx).Create(category).Error
}

// GetByID retrieves an article category by ID
func (r *GormArticleCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.ArticleCategory, error) {
	var category entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		First(&category, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetAll retrieves all article categories with pagination
func (r *GormArticleCategoryRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error) {
	var categories []*entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Offset(offset).
		Limit(limit).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// GetAllOrdered retrieves all categories ordered by sort order
func (r *GormArticleCategoryRepository) GetAllOrdered(ctx context.Context) ([]*entities.ArticleCategory, error) {
	var categories []*entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// GetByName retrieves a category by name
func (r *GormArticleCategoryRepository) GetByName(ctx context.Context, name string) (*entities.ArticleCategory, error) {
	var category entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("name = ? AND is_deleted = ?", name, false).
		First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetActive retrieves active categories with pagination
func (r *GormArticleCategoryRepository) GetActive(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error) {
	var categories []*entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("is_active = ? AND is_deleted = ?", true, false).
		Offset(offset).
		Limit(limit).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// GetActiveOrdered retrieves active categories ordered by sort order
func (r *GormArticleCategoryRepository) GetActiveOrdered(ctx context.Context) ([]*entities.ArticleCategory, error) {
	var categories []*entities.ArticleCategory
	err := r.db.WithContext(ctx).
		Where("is_active = ? AND is_deleted = ?", true, false).
		Order("sort_order ASC, name ASC").
		Find(&categories).Error
	return categories, err
}

// Update updates an existing article category
func (r *GormArticleCategoryRepository) Update(ctx context.Context, category *entities.ArticleCategory) error {
	return r.db.WithContext(ctx).Save(category).Error
}

// Delete soft deletes an article category
func (r *GormArticleCategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.ArticleCategory{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":     true,
			"deletion_time":  gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of categories
func (r *GormArticleCategoryRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleCategory{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// CountActive returns the number of active categories
func (r *GormArticleCategoryRepository) CountActive(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleCategory{}).
		Where("is_active = ? AND is_deleted = ?", true, false).
		Count(&count).Error
	return count, err
}

// GetWithArticleCount returns a category with its article count
func (r *GormArticleCategoryRepository) GetWithArticleCount(ctx context.Context, id uuid.UUID) (*repositories.CategoryWithArticleCount, error) {
	category, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	
	// Count total articles
	var totalCount int64
	err = r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("category_id = ? AND is_deleted = ?", id, false).
		Count(&totalCount).Error
	if err != nil {
		return nil, err
	}
	
	// Count published articles
	var publishedCount int64
	err = r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("category_id = ? AND is_published = ? AND is_deleted = ?", id, true, false).
		Count(&publishedCount).Error
	if err != nil {
		return nil, err
	}
	
	// Count draft articles
	var draftCount int64
	err = r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("category_id = ? AND is_published = ? AND is_deleted = ?", id, false, false).
		Count(&draftCount).Error
	if err != nil {
		return nil, err
	}
	
	return &repositories.CategoryWithArticleCount{
		Category:       category,
		ArticleCount:   totalCount,
		PublishedCount: publishedCount,
		DraftCount:     draftCount,
	}, nil
}

// GetAllWithArticleCounts returns all categories with their article counts
func (r *GormArticleCategoryRepository) GetAllWithArticleCounts(ctx context.Context) ([]*repositories.CategoryWithArticleCount, error) {
	categories, err := r.GetAllOrdered(ctx)
	if err != nil {
		return nil, err
	}
	
	result := make([]*repositories.CategoryWithArticleCount, len(categories))
	
	for i, category := range categories {
		// Count total articles
		var totalCount int64
		err = r.db.WithContext(ctx).
			Model(&entities.SiteArticle{}).
			Where("category_id = ? AND is_deleted = ?", category.ID, false).
			Count(&totalCount).Error
		if err != nil {
			return nil, err
		}
		
		// Count published articles
		var publishedCount int64
		err = r.db.WithContext(ctx).
			Model(&entities.SiteArticle{}).
			Where("category_id = ? AND is_published = ? AND is_deleted = ?", category.ID, true, false).
			Count(&publishedCount).Error
		if err != nil {
			return nil, err
		}
		
		// Count draft articles
		var draftCount int64
		err = r.db.WithContext(ctx).
			Model(&entities.SiteArticle{}).
			Where("category_id = ? AND is_published = ? AND is_deleted = ?", category.ID, false, false).
			Count(&draftCount).Error
		if err != nil {
			return nil, err
		}
		
		result[i] = &repositories.CategoryWithArticleCount{
			Category:       category,
			ArticleCount:   totalCount,
			PublishedCount: publishedCount,
			DraftCount:     draftCount,
		}
	}
	
	return result, nil
}
