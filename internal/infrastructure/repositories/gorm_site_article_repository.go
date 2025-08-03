package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormSiteArticleRepository implements SiteArticleRepository using GORM
type GormSiteArticleRepository struct {
	db *gorm.DB
}

// NewGormSiteArticleRepository creates a new GORM-based site article repository
func NewGormSiteArticleRepository(db *gorm.DB) repositories.SiteArticleRepository {
	return &GormSiteArticleRepository{db: db}
}

// Create creates a new site article
func (r *GormSiteArticleRepository) Create(ctx context.Context, article *entities.SiteArticle) error {
	return r.db.WithContext(ctx).Create(article).Error
}

// GetByID retrieves a site article by ID
func (r *GormSiteArticleRepository) GetByID(ctx context.Context, id uuid.UUID, options *repositories.ArticleListOptions) (*entities.SiteArticle, error) {
	var article entities.SiteArticle
	query := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	// Apply preloading based on options
	if options != nil {
		query = r.applyPreloading(query, options)
	}

	err := query.First(&article, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

// GetAll retrieves all site articles with pagination
func (r *GormSiteArticleRepository) GetAll(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	// Apply preloading and sorting
	if options != nil {
		query = r.applyPreloading(query, options)
		query = r.applySorting(query, options)
	}

	err := query.Offset(offset).Limit(limit).Find(&articles).Error
	return articles, err
}

// Search searches articles based on criteria
func (r *GormSiteArticleRepository) Search(ctx context.Context, criteria *repositories.ArticleSearchCriteria, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).Where("is_deleted = ?", false)

	// Apply search criteria
	query = r.applySearchCriteria(query, criteria)

	// Apply preloading and sorting
	if options != nil {
		query = r.applyPreloading(query, options)
		query = r.applySorting(query, options)
	}

	err := query.Offset(offset).Limit(limit).Find(&articles).Error
	return articles, err
}

// GetByCategory retrieves articles by category
func (r *GormSiteArticleRepository) GetByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).
		Where("category_id = ? AND is_deleted = ?", categoryId, false)

	if options != nil {
		query = r.applyPreloading(query, options)
		query = r.applySorting(query, options)
	}

	err := query.Offset(offset).Limit(limit).Find(&articles).Error
	return articles, err
}

// GetByPromotionCode retrieves an article by promotion code
func (r *GormSiteArticleRepository) GetByPromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error) {
	var article entities.SiteArticle
	err := r.db.WithContext(ctx).
		Where("promotion_code = ? AND is_deleted = ?", promotionCode, false).
		First(&article).Error
	if err != nil {
		return nil, err
	}
	return &article, nil
}

// GetPublished retrieves published articles
func (r *GormSiteArticleRepository) GetPublished(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).
		Where("is_published = ? AND is_deleted = ?", true, false)

	if options != nil {
		query = r.applyPreloading(query, options)
		query = r.applySorting(query, options)
	}

	err := query.Offset(offset).Limit(limit).Find(&articles).Error
	return articles, err
}

// GetDrafts retrieves draft articles
func (r *GormSiteArticleRepository) GetDrafts(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).
		Where("is_published = ? AND is_deleted = ?", false, false)

	if options != nil {
		query = r.applyPreloading(query, options)
		query = r.applySorting(query, options)
	}

	err := query.Offset(offset).Limit(limit).Find(&articles).Error
	return articles, err
}

// GetMostViewed retrieves most viewed articles
func (r *GormSiteArticleRepository) GetMostViewed(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).
		Where("is_published = ? AND is_deleted = ?", true, false).
		Order("view_count DESC")

	if days > 0 {
		since := time.Now().AddDate(0, 0, -days)
		query = query.Where("published_at >= ?", since)
	}

	err := query.Limit(limit).Find(&articles).Error
	return articles, err
}

// GetMostRead retrieves most read articles
func (r *GormSiteArticleRepository) GetMostRead(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	query := r.db.WithContext(ctx).
		Where("is_published = ? AND is_deleted = ?", true, false).
		Order("read_count DESC")

	if days > 0 {
		since := time.Now().AddDate(0, 0, -days)
		query = query.Where("published_at >= ?", since)
	}

	err := query.Limit(limit).Find(&articles).Error
	return articles, err
}

// Update updates an existing site article
func (r *GormSiteArticleRepository) Update(ctx context.Context, article *entities.SiteArticle) error {
	return r.db.WithContext(ctx).Save(article).Error
}

// Delete soft deletes a site article
func (r *GormSiteArticleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":    true,
			"deletion_time": gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of articles
func (r *GormSiteArticleRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// CountByCategory returns the number of articles in a category
func (r *GormSiteArticleRepository) CountByCategory(ctx context.Context, categoryId uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("category_id = ? AND is_deleted = ?", categoryId, false).
		Count(&count).Error
	return count, err
}

// CountPublished returns the number of published articles
func (r *GormSiteArticleRepository) CountPublished(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("is_published = ? AND is_deleted = ?", true, false).
		Count(&count).Error
	return count, err
}

// CountDrafts returns the number of draft articles
func (r *GormSiteArticleRepository) CountDrafts(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("is_published = ? AND is_deleted = ?", false, false).
		Count(&count).Error
	return count, err
}

// Helper methods

func (r *GormSiteArticleRepository) applyPreloading(query *gorm.DB, options *repositories.ArticleListOptions) *gorm.DB {
	if options.IncludeCategory {
		query = query.Preload("Category")
	}
	if options.IncludeCoverImage {
		query = query.Preload("CoverImage")
	}
	if options.IncludePromotionImage {
		query = query.Preload("PromotionImage")
	}
	if options.IncludeHits {
		query = query.Preload("Hits")
	}
	return query
}

func (r *GormSiteArticleRepository) applySorting(query *gorm.DB, options *repositories.ArticleListOptions) *gorm.DB {
	if options.SortBy == "" {
		return query.Order("CreationTime DESC")
	}

	sortOrder := "DESC"
	if options.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	switch options.SortBy {
	case "title":
		return query.Order(fmt.Sprintf("Title %s", sortOrder))
	case "created_at":
		return query.Order(fmt.Sprintf("CreationTime %s", sortOrder))
	case "view_count":
		return query.Order(fmt.Sprintf("ViewCount %s", sortOrder))
	case "read_count":
		return query.Order(fmt.Sprintf("ReadCount %s", sortOrder))
	default:
		return query.Order("CreationTime DESC")
	}
}

func (r *GormSiteArticleRepository) applySearchCriteria(query *gorm.DB, criteria *repositories.ArticleSearchCriteria) *gorm.DB {
	if criteria.Title != "" {
		query = query.Where("Title LIKE ?", "%"+criteria.Title+"%")
	}
	if criteria.Author != "" {
		query = query.Where("Author LIKE ?", "%"+criteria.Author+"%")
	}
	if criteria.CategoryId != nil {
		query = query.Where("CategoryId = ?", *criteria.CategoryId)
	}
	if criteria.IsPublished != nil {
		query = query.Where("IsPublished = ?", *criteria.IsPublished)
	}
	if criteria.CreatedAfter != nil {
		query = query.Where("CreationTime >= ?", *criteria.CreatedAfter)
	}
	if criteria.CreatedBefore != nil {
		query = query.Where("CreationTime <= ?", *criteria.CreatedBefore)
	}
	if criteria.PromotionCode != "" {
		query = query.Where("PromotionCode = ?", criteria.PromotionCode)
	}
	return query
}

// Additional methods to implement the interface

func (r *GormSiteArticleRepository) GetByAuthor(ctx context.Context, author string, offset, limit int) ([]*entities.SiteArticle, error) {
	var articles []*entities.SiteArticle
	err := r.db.WithContext(ctx).
		Where("Author = ? AND is_deleted = ?", author, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&articles).Error
	return articles, err
}

func (r *GormSiteArticleRepository) CountByAuthor(ctx context.Context, author string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("Author = ? AND is_deleted = ?", author, false).
		Count(&count).Error
	return count, err
}

func (r *GormSiteArticleRepository) CountBySearch(ctx context.Context, criteria *repositories.ArticleSearchCriteria) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("is_deleted = ?", false)

	query = r.applySearchCriteria(query, criteria)
	err := query.Count(&count).Error
	return count, err
}

func (r *GormSiteArticleRepository) PublishArticles(ctx context.Context, articleIds []uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("id IN ?", articleIds).
		Updates(map[string]interface{}{
			"is_published": true,
			"published_at": &now,
		}).Error
}

func (r *GormSiteArticleRepository) UnpublishArticles(ctx context.Context, articleIds []uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("id IN ?", articleIds).
		Updates(map[string]interface{}{
			"is_published": false,
			"published_at": nil,
		}).Error
}

func (r *GormSiteArticleRepository) UpdateViewCount(ctx context.Context, articleId uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("id = ?", articleId).
		Update("view_count", gorm.Expr("view_count + 1")).Error
}

func (r *GormSiteArticleRepository) UpdateReadCount(ctx context.Context, articleId uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.SiteArticle{}).
		Where("id = ?", articleId).
		Update("read_count", gorm.Expr("read_count + 1")).Error
}

// Placeholder implementations for complex analytics methods
func (r *GormSiteArticleRepository) GetArticleWithAnalytics(ctx context.Context, articleId uuid.UUID, days int) (*repositories.ArticleWithAnalytics, error) {
	// This would require complex joins with the Hit table
	// For now, return a basic implementation
	article, err := r.GetByID(ctx, articleId, &repositories.ArticleListOptions{
		IncludeCategory:   true,
		IncludeCoverImage: true,
	})
	if err != nil {
		return nil, err
	}

	return &repositories.ArticleWithAnalytics{
		Article:     article,
		TotalViews:  article.ViewCount,
		TotalReads:  article.ReadCount,
		ReadingRate: article.GetReadingRate(),
		// Other fields would be populated from Hit table queries
	}, nil
}

func (r *GormSiteArticleRepository) GetPopularArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	// For now, use view count as popularity metric
	return r.GetMostViewed(ctx, limit, days)
}
