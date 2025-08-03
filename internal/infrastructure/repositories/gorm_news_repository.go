package repositories

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormNewsRepository implements the NewsRepository interface using GORM
type GormNewsRepository struct {
	db *gorm.DB
}

// NewGormNewsRepository creates a new GORM news repository
func NewGormNewsRepository(db *gorm.DB) repositories.NewsRepository {
	return &GormNewsRepository{db: db}
}

// Create creates a new news record
func (r *GormNewsRepository) Create(ctx context.Context, news *entities.News) error {
	return r.db.WithContext(ctx).Create(news).Error
}

// GetByID retrieves a news record by ID
func (r *GormNewsRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.News, error) {
	var news entities.News
	err := r.db.WithContext(ctx).
		Preload("Author").
		Preload("Editor").
		Preload("FeaturedImage").
		Preload("Thumbnail").
		Preload("Categories").
		Preload("NewsArticles.Article").
		First(&news, "id = ?", id).Error

	if err != nil {
		return nil, err
	}
	return &news, nil
}

// GetBySlug retrieves a news record by slug
func (r *GormNewsRepository) GetBySlug(ctx context.Context, slug string) (*entities.News, error) {
	var news entities.News
	err := r.db.WithContext(ctx).
		Preload("Author").
		Preload("Editor").
		Preload("FeaturedImage").
		Preload("Thumbnail").
		Preload("Categories").
		Preload("NewsArticles.Article").
		First(&news, "slug = ?", slug).Error

	if err != nil {
		return nil, err
	}
	return &news, nil
}

// Update updates a news record
func (r *GormNewsRepository) Update(ctx context.Context, news *entities.News) error {
	return r.db.WithContext(ctx).Save(news).Error
}

// Delete soft deletes a news record
func (r *GormNewsRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.News{}, "id = ?", id).Error
}

// List retrieves news records with filtering and pagination
func (r *GormNewsRepository) List(ctx context.Context, filter repositories.NewsFilter) ([]*entities.News, error) {
	query := r.db.WithContext(ctx).Model(&entities.News{})

	// Apply filters
	query = r.applyNewsFilters(query, filter)

	// Apply includes
	if filter.IncludeAuthor {
		query = query.Preload("Author")
	}
	if filter.IncludeEditor {
		query = query.Preload("Editor")
	}
	if filter.IncludeCategories {
		query = query.Preload("Categories")
	}
	if filter.IncludeArticles {
		query = query.Preload("NewsArticles.Article")
	}
	if filter.IncludeImages {
		query = query.Preload("FeaturedImage").Preload("Thumbnail")
	}

	// Apply sorting
	if filter.SortBy != "" {
		order := "DESC"
		if filter.SortOrder == "asc" {
			order = "ASC"
		}
		query = query.Order(fmt.Sprintf("%s %s", filter.SortBy, order))
	} else {
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	var news []*entities.News
	err := query.Find(&news).Error
	return news, err
}

// Count counts news records with filtering
func (r *GormNewsRepository) Count(ctx context.Context, filter repositories.NewsFilter) (int64, error) {
	query := r.db.WithContext(ctx).Model(&entities.News{})
	query = r.applyNewsFilters(query, filter)

	var count int64
	err := query.Count(&count).Error
	return count, err
}

// Publish publishes a news record
func (r *GormNewsRepository) Publish(ctx context.Context, id uuid.UUID, publishedAt time.Time) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       entities.NewsStatusPublished,
			"published_at": publishedAt,
		}).Error
}

// Unpublish unpublishes a news record
func (r *GormNewsRepository) Unpublish(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       entities.NewsStatusDraft,
			"published_at": nil,
		}).Error
}

// Schedule schedules a news record for publishing
func (r *GormNewsRepository) Schedule(ctx context.Context, id uuid.UUID, scheduledAt time.Time) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":       entities.NewsStatusScheduled,
			"scheduled_at": scheduledAt,
		}).Error
}

// GetByStatus retrieves news records by status
func (r *GormNewsRepository) GetByStatus(ctx context.Context, status entities.NewsStatus, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("status = ?", status).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetScheduledNews retrieves scheduled news that should be published
func (r *GormNewsRepository) GetScheduledNews(ctx context.Context, before time.Time) ([]*entities.News, error) {
	var news []*entities.News
	err := r.db.WithContext(ctx).
		Where("status = ? AND scheduled_at <= ?", entities.NewsStatusScheduled, before).
		Find(&news).Error
	return news, err
}

// GetExpiredNews retrieves expired news
func (r *GormNewsRepository) GetExpiredNews(ctx context.Context, before time.Time) ([]*entities.News, error) {
	var news []*entities.News
	err := r.db.WithContext(ctx).
		Where("expires_at IS NOT NULL AND expires_at <= ?", before).
		Find(&news).Error
	return news, err
}

// GetFeatured retrieves featured news
func (r *GormNewsRepository) GetFeatured(ctx context.Context, limit int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("is_featured = ? AND status = ?", true, entities.NewsStatusPublished).
		Order("published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetByPriority retrieves news by priority
func (r *GormNewsRepository) GetByPriority(ctx context.Context, priority entities.NewsPriority, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("priority = ? AND status = ?", priority, entities.NewsStatusPublished).
		Order("published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetBreakingNews retrieves breaking news
func (r *GormNewsRepository) GetBreakingNews(ctx context.Context, limit int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("is_breaking = ? AND status = ?", true, entities.NewsStatusPublished).
		Order("published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetByCategory retrieves news by category ID
func (r *GormNewsRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Joins("JOIN news_category_associations ON news.id = news_category_associations.news_id").
		Where("news_category_associations.category_id = ? AND news.status = ?", categoryID, entities.NewsStatusPublished).
		Order("news.published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetByCategorySlug retrieves news by category slug
func (r *GormNewsRepository) GetByCategorySlug(ctx context.Context, categorySlug string, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Joins("JOIN news_category_associations ON news.id = news_category_associations.news_id").
		Joins("JOIN news_categories ON news_category_associations.category_id = news_categories.id").
		Where("news_categories.slug = ? AND news.status = ?", categorySlug, entities.NewsStatusPublished).
		Order("news.published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetByAuthor retrieves news by author ID
func (r *GormNewsRepository) GetByAuthor(ctx context.Context, authorID uuid.UUID, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("author_id = ?", authorID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&news).Error
	return news, err
}

// Search searches news by query
func (r *GormNewsRepository) Search(ctx context.Context, query string, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News
	searchQuery := r.db.WithContext(ctx).
		Where("(title LIKE ? OR description LIKE ? OR content LIKE ?) AND status = ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%", entities.NewsStatusPublished).
		Order("published_at DESC")

	if limit > 0 {
		searchQuery = searchQuery.Limit(limit)
	}
	if offset > 0 {
		searchQuery = searchQuery.Offset(offset)
	}

	err := searchQuery.Find(&news).Error
	return news, err
}

// SearchByTags searches news by tags
func (r *GormNewsRepository) SearchByTags(ctx context.Context, tags []string, limit, offset int) ([]*entities.News, error) {
	var news []*entities.News

	// Build tag search conditions
	var conditions []string
	var args []interface{}
	for _, tag := range tags {
		conditions = append(conditions, "tags LIKE ?")
		args = append(args, "%"+tag+"%")
	}

	whereClause := "(" + strings.Join(conditions, " OR ") + ") AND status = ?"
	args = append(args, entities.NewsStatusPublished)

	searchQuery := r.db.WithContext(ctx).
		Where(whereClause, args...).
		Order("published_at DESC")

	if limit > 0 {
		searchQuery = searchQuery.Limit(limit)
	}
	if offset > 0 {
		searchQuery = searchQuery.Offset(offset)
	}

	err := searchQuery.Find(&news).Error
	return news, err
}

// IncrementViewCount increments the view count for a news record
func (r *GormNewsRepository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrementShareCount increments the share count for a news record
func (r *GormNewsRepository) IncrementShareCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		UpdateColumn("share_count", gorm.Expr("share_count + 1")).Error
}

// IncrementLikeCount increments the like count for a news record
func (r *GormNewsRepository) IncrementLikeCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("like_count + 1")).Error
}

// IncrementCommentCount increments the comment count for a news record
func (r *GormNewsRepository) IncrementCommentCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		UpdateColumn("comment_count", gorm.Expr("comment_count + 1")).Error
}

// GetRelated retrieves related news
func (r *GormNewsRepository) GetRelated(ctx context.Context, newsID uuid.UUID, limit int) ([]*entities.News, error) {
	// Get the original news to find related content
	var originalNews entities.News
	if err := r.db.WithContext(ctx).First(&originalNews, "id = ?", newsID).Error; err != nil {
		return nil, err
	}

	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("id != ? AND status = ?", newsID, entities.NewsStatusPublished)

	// Find news with similar tags or categories
	if originalNews.Tags != "" {
		tags := strings.Split(originalNews.Tags, ",")
		var tagConditions []string
		var tagArgs []interface{}
		for _, tag := range tags {
			tag = strings.TrimSpace(tag)
			if tag != "" {
				tagConditions = append(tagConditions, "tags LIKE ?")
				tagArgs = append(tagArgs, "%"+tag+"%")
			}
		}
		if len(tagConditions) > 0 {
			query = query.Where("("+strings.Join(tagConditions, " OR ")+")", tagArgs...)
		}
	}

	query = query.Order("published_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetPopular retrieves popular news since a given time
func (r *GormNewsRepository) GetPopular(ctx context.Context, since time.Time, limit int) ([]*entities.News, error) {
	var news []*entities.News
	query := r.db.WithContext(ctx).
		Where("status = ? AND published_at >= ?", entities.NewsStatusPublished, since).
		Order("view_count DESC, share_count DESC, like_count DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&news).Error
	return news, err
}

// GetTrending retrieves trending news
func (r *GormNewsRepository) GetTrending(ctx context.Context, limit int) ([]*entities.News, error) {
	// Trending is based on recent activity (views, shares, likes in the last 24 hours)
	since := time.Now().AddDate(0, 0, -1) // Last 24 hours
	return r.GetPopular(ctx, since, limit)
}

// BulkUpdateStatus updates status for multiple news records
func (r *GormNewsRepository) BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.NewsStatus) error {
	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id IN ?", ids).
		Update("status", status).Error
}

// BulkDelete soft deletes multiple news records
func (r *GormNewsRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	return r.db.WithContext(ctx).
		Delete(&entities.News{}, "id IN ?", ids).Error
}

// GetByWeChatDraftID retrieves news by WeChat draft ID
func (r *GormNewsRepository) GetByWeChatDraftID(ctx context.Context, draftID string) (*entities.News, error) {
	var news entities.News
	err := r.db.WithContext(ctx).
		First(&news, "wechat_draft_id = ?", draftID).Error

	if err != nil {
		return nil, err
	}
	return &news, nil
}

// GetByWeChatPublishedID retrieves news by WeChat published ID
func (r *GormNewsRepository) GetByWeChatPublishedID(ctx context.Context, publishedID string) (*entities.News, error) {
	var news entities.News
	err := r.db.WithContext(ctx).
		First(&news, "wechat_published_id = ?", publishedID).Error

	if err != nil {
		return nil, err
	}
	return &news, nil
}

// UpdateWeChatStatus updates WeChat sync status
func (r *GormNewsRepository) UpdateWeChatStatus(ctx context.Context, id uuid.UUID, status string, wechatID string, url string) error {
	updates := map[string]interface{}{
		"wechat_status":    status,
		"wechat_synced_at": time.Now(),
	}

	if wechatID != "" {
		updates["wechat_published_id"] = wechatID
	}
	if url != "" {
		updates["wechat_url"] = url
	}

	return r.db.WithContext(ctx).
		Model(&entities.News{}).
		Where("id = ?", id).
		Updates(updates).Error
}

// applyNewsFilters applies filters to a GORM query
func (r *GormNewsRepository) applyNewsFilters(query *gorm.DB, filter repositories.NewsFilter) *gorm.DB {
	// Status filters
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}
	if len(filter.Statuses) > 0 {
		query = query.Where("status IN ?", filter.Statuses)
	}
	if filter.Type != nil {
		query = query.Where("type = ?", *filter.Type)
	}
	if filter.Priority != nil {
		query = query.Where("priority = ?", *filter.Priority)
	}

	// Publishing filters
	if filter.PublishedAfter != nil {
		query = query.Where("published_at >= ?", *filter.PublishedAfter)
	}
	if filter.PublishedBefore != nil {
		query = query.Where("published_at <= ?", *filter.PublishedBefore)
	}
	if filter.ScheduledAfter != nil {
		query = query.Where("scheduled_at >= ?", *filter.ScheduledAfter)
	}
	if filter.ScheduledBefore != nil {
		query = query.Where("scheduled_at <= ?", *filter.ScheduledBefore)
	}

	// Author filters
	if filter.AuthorID != nil {
		query = query.Where("author_id = ?", *filter.AuthorID)
	}
	if len(filter.AuthorIDs) > 0 {
		query = query.Where("author_id IN ?", filter.AuthorIDs)
	}
	if filter.EditorID != nil {
		query = query.Where("editor_id = ?", *filter.EditorID)
	}

	// Category filters
	if filter.CategoryID != nil {
		query = query.Joins("JOIN news_category_associations ON news.id = news_category_associations.news_id").
			Where("news_category_associations.category_id = ?", *filter.CategoryID)
	}
	if len(filter.CategoryIDs) > 0 {
		query = query.Joins("JOIN news_category_associations ON news.id = news_category_associations.news_id").
			Where("news_category_associations.category_id IN ?", filter.CategoryIDs)
	}
	if filter.CategorySlug != nil {
		query = query.Joins("JOIN news_category_associations ON news.id = news_category_associations.news_id").
			Joins("JOIN news_categories ON news_category_associations.category_id = news_categories.id").
			Where("news_categories.slug = ?", *filter.CategorySlug)
	}

	// Content filters
	if filter.Search != nil {
		searchTerm := "%" + *filter.Search + "%"
		query = query.Where("(title LIKE ? OR description LIKE ? OR content LIKE ?)", searchTerm, searchTerm, searchTerm)
	}
	if len(filter.Tags) > 0 {
		var tagConditions []string
		var tagArgs []interface{}
		for _, tag := range filter.Tags {
			tagConditions = append(tagConditions, "tags LIKE ?")
			tagArgs = append(tagArgs, "%"+tag+"%")
		}
		query = query.Where("("+strings.Join(tagConditions, " OR ")+")", tagArgs...)
	}
	if len(filter.Keywords) > 0 {
		var keywordConditions []string
		var keywordArgs []interface{}
		for _, keyword := range filter.Keywords {
			keywordConditions = append(keywordConditions, "keywords LIKE ?")
			keywordArgs = append(keywordArgs, "%"+keyword+"%")
		}
		query = query.Where("("+strings.Join(keywordConditions, " OR ")+")", keywordArgs...)
	}
	if filter.Language != nil {
		query = query.Where("language = ?", *filter.Language)
	}
	if filter.Region != nil {
		query = query.Where("region = ?", *filter.Region)
	}

	// Feature filters
	if filter.IsFeatured != nil {
		query = query.Where("is_featured = ?", *filter.IsFeatured)
	}
	if filter.IsBreaking != nil {
		query = query.Where("is_breaking = ?", *filter.IsBreaking)
	}
	if filter.IsSticky != nil {
		query = query.Where("is_sticky = ?", *filter.IsSticky)
	}

	// Date filters
	if filter.CreatedAfter != nil {
		query = query.Where("created_at >= ?", *filter.CreatedAfter)
	}
	if filter.CreatedBefore != nil {
		query = query.Where("created_at <= ?", *filter.CreatedBefore)
	}
	if filter.UpdatedAfter != nil {
		query = query.Where("updated_at >= ?", *filter.UpdatedAfter)
	}
	if filter.UpdatedBefore != nil {
		query = query.Where("updated_at <= ?", *filter.UpdatedBefore)
	}

	// Analytics filters
	if filter.MinViewCount != nil {
		query = query.Where("view_count >= ?", *filter.MinViewCount)
	}
	if filter.MaxViewCount != nil {
		query = query.Where("view_count <= ?", *filter.MaxViewCount)
	}

	// WeChat filters
	if filter.WeChatStatus != nil {
		query = query.Where("wechat_status = ?", *filter.WeChatStatus)
	}
	if filter.HasWeChatID != nil {
		if *filter.HasWeChatID {
			query = query.Where("wechat_published_id IS NOT NULL AND wechat_published_id != ''")
		} else {
			query = query.Where("wechat_published_id IS NULL OR wechat_published_id = ''")
		}
	}

	return query
}
