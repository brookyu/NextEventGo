package repositories

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormVideoRepository implements VideoRepository using GORM
type GormVideoRepository struct {
	db *gorm.DB
}

// NewGormVideoRepository creates a new GORM video repository
func NewGormVideoRepository(db *gorm.DB) repositories.VideoRepository {
	return &GormVideoRepository{db: db}
}

// Basic CRUD operations

func (r *GormVideoRepository) Create(ctx context.Context, video *entities.Video) error {
	return r.db.WithContext(ctx).Create(video).Error
}

func (r *GormVideoRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Video, error) {
	var video entities.Video
	err := r.db.WithContext(ctx).
		Where("Id = ? AND IsDeleted = 0", id).
		First(&video).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}

	return &video, nil
}

func (r *GormVideoRepository) GetBySlug(ctx context.Context, slug string) (*entities.Video, error) {
	var video entities.Video
	err := r.db.WithContext(ctx).
		Where("Slug = ? AND IsDeleted = 0", slug).
		First(&video).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}

	return &video, nil
}

func (r *GormVideoRepository) Update(ctx context.Context, video *entities.Video) error {
	return r.db.WithContext(ctx).Save(video).Error
}

func (r *GormVideoRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("Id = ?", id).
		Delete(&entities.Video{}).Error
}

func (r *GormVideoRepository) SoftDelete(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Updates(map[string]interface{}{
			"IsDeleted":    true,
			"DeletionTime": now,
			"DeleterId":    deletedBy,
		}).Error
}

// List and search operations

func (r *GormVideoRepository) List(ctx context.Context, filter repositories.VideoFilter) ([]*entities.Video, error) {
	query := r.buildVideoQuery(filter)

	var videos []*entities.Video
	err := query.WithContext(ctx).Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) Count(ctx context.Context, filter repositories.VideoFilter) (int64, error) {
	query := r.buildVideoQuery(filter)

	var count int64
	err := query.WithContext(ctx).Model(&entities.Video{}).Count(&count).Error
	return count, err
}

func (r *GormVideoRepository) Search(ctx context.Context, query string, filter repositories.VideoFilter) ([]*entities.Video, error) {
	filter.Search = query
	return r.List(ctx, filter)
}

// Status operations

func (r *GormVideoRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status entities.VideoStatus) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("Status", status).Error
}

func (r *GormVideoRepository) GetByStatus(ctx context.Context, status entities.VideoStatus, limit int) ([]*entities.Video, error) {
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("Status = ? AND IsDeleted = 0", status)

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.VideoStatus) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id IN ?", ids).
		Update("Status", status).Error
}

// Live video operations

func (r *GormVideoRepository) StartLiveVideo(ctx context.Context, id uuid.UUID, startTime time.Time) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Updates(map[string]interface{}{
			"Status":    entities.VideoStatusLive,
			"StartTime": startTime,
		}).Error
}

func (r *GormVideoRepository) EndLiveVideo(ctx context.Context, id uuid.UUID, endTime time.Time) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Updates(map[string]interface{}{
			"Status":       entities.VideoStatusEnded,
			"VideoEndTime": endTime,
		}).Error
}

func (r *GormVideoRepository) GetLiveVideos(ctx context.Context) ([]*entities.Video, error) {
	var videos []*entities.Video
	err := r.db.WithContext(ctx).
		Where("Status = ? AND VideoType = ? AND IsDeleted = 0", entities.VideoStatusLive, entities.VideoTypeLive).
		Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetScheduledVideos(ctx context.Context, before time.Time) ([]*entities.Video, error) {
	var videos []*entities.Video
	err := r.db.WithContext(ctx).
		Where("Status = ? AND StartTime <= ? AND IsDeleted = 0", entities.VideoStatusScheduled, before).
		Find(&videos).Error
	return videos, err
}

// Analytics operations

func (r *GormVideoRepository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("ViewCount", gorm.Expr("ViewCount + 1")).Error
}

func (r *GormVideoRepository) IncrementLikeCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("LikeCount", gorm.Expr("LikeCount + 1")).Error
}

func (r *GormVideoRepository) IncrementShareCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("ShareCount", gorm.Expr("ShareCount + 1")).Error
}

func (r *GormVideoRepository) IncrementCommentCount(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("CommentCount", gorm.Expr("CommentCount + 1")).Error
}

func (r *GormVideoRepository) UpdateWatchTime(ctx context.Context, id uuid.UUID, watchTime int64) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("WatchTime", watchTime).Error
}

func (r *GormVideoRepository) UpdateEngagementMetrics(ctx context.Context, id uuid.UUID, metrics repositories.VideoEngagementMetrics) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Updates(map[string]interface{}{
			"ViewCount":        metrics.ViewCount,
			"LikeCount":        metrics.LikeCount,
			"ShareCount":       metrics.ShareCount,
			"CommentCount":     metrics.CommentCount,
			"WatchTime":        metrics.WatchTime,
			"AverageWatchTime": metrics.AverageWatchTime,
			"CompletionRate":   metrics.CompletionRate,
			"EngagementScore":  metrics.EngagementScore,
		}).Error
}

// Category operations

func (r *GormVideoRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, filter repositories.VideoFilter) ([]*entities.Video, error) {
	filter.CategoryID = &categoryID
	return r.List(ctx, filter)
}

func (r *GormVideoRepository) GetByCategorySlug(ctx context.Context, categorySlug string, filter repositories.VideoFilter) ([]*entities.Video, error) {
	var videos []*entities.Video
	query := r.buildVideoQuery(filter)

	err := query.WithContext(ctx).
		Joins("JOIN VideoCategories ON CloudVideos.CategoryId = VideoCategories.Id").
		Where("VideoCategories.Slug = ? AND VideoCategories.IsDeleted = 0", categorySlug).
		Find(&videos).Error

	return videos, err
}

func (r *GormVideoRepository) UpdateCategory(ctx context.Context, id uuid.UUID, categoryID *uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", id).
		Update("CategoryId", categoryID).Error
}

// Event association operations

func (r *GormVideoRepository) GetByEvent(ctx context.Context, eventID uuid.UUID) ([]*entities.Video, error) {
	var videos []*entities.Video
	err := r.db.WithContext(ctx).
		Where("BoundEventId = ? AND IsDeleted = 0", eventID).
		Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) AssociateWithEvent(ctx context.Context, videoID, eventID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", videoID).
		Update("BoundEventId", eventID).Error
}

func (r *GormVideoRepository) DisassociateFromEvent(ctx context.Context, videoID uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Video{}).
		Where("Id = ?", videoID).
		Update("BoundEventId", nil).Error
}

// Featured and trending operations

func (r *GormVideoRepository) GetFeatured(ctx context.Context, limit int) ([]*entities.Video, error) {
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("IsDeleted = 0").
		Order("ViewCount DESC, CreationTime DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetTrending(ctx context.Context, timeframe time.Duration, limit int) ([]*entities.Video, error) {
	since := time.Now().Add(-timeframe)
	var videos []*entities.Video

	query := r.db.WithContext(ctx).
		Where("CreationTime >= ? AND IsDeleted = 0", since).
		Order("ViewCount DESC, LikeCount DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetPopular(ctx context.Context, timeframe time.Duration, limit int) ([]*entities.Video, error) {
	since := time.Now().Add(-timeframe)
	var videos []*entities.Video

	query := r.db.WithContext(ctx).
		Where("CreationTime >= ? AND IsDeleted = 0", since).
		Order("(ViewCount * 0.4 + LikeCount * 0.3 + ShareCount * 0.3) DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetRecentlyAdded(ctx context.Context, limit int) ([]*entities.Video, error) {
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("IsDeleted = 0").
		Order("CreationTime DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

// User-specific operations

func (r *GormVideoRepository) GetByUser(ctx context.Context, userID uuid.UUID, filter repositories.VideoFilter) ([]*entities.Video, error) {
	filter.UserID = &userID
	return r.List(ctx, filter)
}

func (r *GormVideoRepository) GetUserFavorites(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.Video, error) {
	// This would require a favorites table - placeholder implementation
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("CreatorId = ? AND IsDeleted = 0", userID).
		Order("LikeCount DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetUserWatchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.Video, error) {
	// This would join with video sessions - placeholder implementation
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Joins("JOIN VideoSessions ON CloudVideos.Id = VideoSessions.VideoId").
		Where("VideoSessions.UserId = ? AND CloudVideos.IsDeleted = 0", userID).
		Group("CloudVideos.Id").
		Order("MAX(VideoSessions.LastActivity) DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

// Bulk operations

func (r *GormVideoRepository) BulkCreate(ctx context.Context, videos []*entities.Video) error {
	return r.db.WithContext(ctx).CreateInBatches(videos, 100).Error
}

func (r *GormVideoRepository) BulkUpdate(ctx context.Context, videos []*entities.Video) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, video := range videos {
			if err := tx.Save(video).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *GormVideoRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("Id IN ?", ids).
		Delete(&entities.Video{}).Error
}

// Helper methods

func (r *GormVideoRepository) buildVideoQuery(filter repositories.VideoFilter) *gorm.DB {
	query := r.db.Model(&entities.Video{}).Where("IsDeleted = 0")

	// Apply filters
	if filter.Status != nil {
		query = query.Where("Status = ?", *filter.Status)
	}
	if filter.Type != nil {
		query = query.Where("VideoType = ?", *filter.Type)
	}
	if filter.Quality != nil {
		query = query.Where("Quality = ?", *filter.Quality)
	}
	if filter.CategoryID != nil {
		query = query.Where("CategoryId = ?", *filter.CategoryID)
	}
	if filter.UserID != nil {
		query = query.Where("CreatorId = ?", *filter.UserID)
	}
	if filter.EventID != nil {
		query = query.Where("BoundEventId = ?", *filter.EventID)
	}

	// Search filters
	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("Title LIKE ? OR Summary LIKE ? OR Keywords LIKE ? OR Tags LIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm)
	}

	if len(filter.Tags) > 0 {
		for _, tag := range filter.Tags {
			query = query.Where("Tags LIKE ?", "%"+tag+"%")
		}
	}

	if len(filter.Keywords) > 0 {
		for _, keyword := range filter.Keywords {
			query = query.Where("Keywords LIKE ?", "%"+keyword+"%")
		}
	}

	// Date filters
	if filter.CreatedAfter != nil {
		query = query.Where("CreationTime >= ?", *filter.CreatedAfter)
	}
	if filter.CreatedBefore != nil {
		query = query.Where("CreationTime <= ?", *filter.CreatedBefore)
	}
	if filter.UpdatedAfter != nil {
		query = query.Where("LastModificationTime >= ?", *filter.UpdatedAfter)
	}
	if filter.UpdatedBefore != nil {
		query = query.Where("LastModificationTime <= ?", *filter.UpdatedBefore)
	}
	if filter.StartTimeAfter != nil {
		query = query.Where("StartTime >= ?", *filter.StartTimeAfter)
	}
	if filter.StartTimeBefore != nil {
		query = query.Where("StartTime <= ?", *filter.StartTimeBefore)
	}

	// Boolean filters
	if filter.IsOpen != nil {
		query = query.Where("IsOpen = ?", *filter.IsOpen)
	}
	if filter.RequireAuth != nil {
		query = query.Where("RequireAuth = ?", *filter.RequireAuth)
	}
	if filter.SupportInteraction != nil {
		query = query.Where("SupportInteraction = ?", *filter.SupportInteraction)
	}
	if filter.AllowDownload != nil {
		query = query.Where("AllowDownload = ?", *filter.AllowDownload)
	}
	if filter.IsLive != nil && *filter.IsLive {
		query = query.Where("Status = ? AND VideoType = ?", entities.VideoStatusLive, entities.VideoTypeLive)
	}

	// Numeric filters
	if filter.MinDuration != nil {
		query = query.Where("Duration >= ?", *filter.MinDuration)
	}
	if filter.MaxDuration != nil {
		query = query.Where("Duration <= ?", *filter.MaxDuration)
	}
	if filter.MinViews != nil {
		query = query.Where("ViewCount >= ?", *filter.MinViews)
	}
	if filter.MaxViews != nil {
		query = query.Where("ViewCount <= ?", *filter.MaxViews)
	}

	// Include relationships
	if filter.IncludeCategory {
		query = query.Preload("Category")
	}
	if filter.IncludeImages {
		query = query.Preload("SiteImage").Preload("PromotionPic").Preload("Thumbnail")
	}
	if filter.IncludeArticles {
		query = query.Preload("IntroArticle").Preload("NotOpenArticle")
	}
	if filter.IncludeSurvey {
		query = query.Preload("Survey")
	}
	if filter.IncludeEvent {
		query = query.Preload("BoundEvent")
	}
	if filter.IncludeSessions {
		query = query.Preload("Sessions")
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
		query = query.Order("CreationTime DESC")
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

// Advanced queries

func (r *GormVideoRepository) GetRelated(ctx context.Context, videoID uuid.UUID, limit int) ([]*entities.Video, error) {
	// Get the video to find related videos based on category and tags
	video, err := r.GetByID(ctx, videoID)
	if err != nil {
		return nil, err
	}

	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("Id != ? AND IsDeleted = 0", videoID)

	// Prioritize same category
	if video.CategoryID != nil {
		query = query.Where("CategoryId = ?", *video.CategoryID)
	}

	// Add tag-based similarity if tags exist
	if video.Tags != "" {
		tags := strings.Split(video.Tags, ",")
		for _, tag := range tags {
			tag = strings.TrimSpace(tag)
			if tag != "" {
				query = query.Or("Tags LIKE ?", "%"+tag+"%")
			}
		}
	}

	query = query.Order("ViewCount DESC, CreationTime DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}

	err = query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetRecommended(ctx context.Context, userID *uuid.UUID, limit int) ([]*entities.Video, error) {
	// Simple recommendation based on popular videos
	// In a real system, this would use ML algorithms
	var videos []*entities.Video
	query := r.db.WithContext(ctx).
		Where("IsDeleted = 0 AND Status IN ?", []entities.VideoStatus{
			entities.VideoStatusLive,
			entities.VideoStatusEnded,
		}).
		Order("(ViewCount * 0.4 + LikeCount * 0.3 + ShareCount * 0.3) DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&videos).Error
	return videos, err
}

func (r *GormVideoRepository) GetByTags(ctx context.Context, tags []string, filter repositories.VideoFilter) ([]*entities.Video, error) {
	filter.Tags = tags
	return r.List(ctx, filter)
}

func (r *GormVideoRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time, filter repositories.VideoFilter) ([]*entities.Video, error) {
	filter.CreatedAfter = &startDate
	filter.CreatedBefore = &endDate
	return r.List(ctx, filter)
}

// Statistics

func (r *GormVideoRepository) GetStatistics(ctx context.Context, filter repositories.VideoFilter) (*repositories.VideoStatistics, error) {
	var stats repositories.VideoStatistics

	// Build base query
	query := r.buildVideoQuery(filter)

	// Total videos
	err := query.Count(&stats.TotalVideos).Error
	if err != nil {
		return nil, err
	}

	// Aggregate statistics
	var aggregates struct {
		TotalViews     int64
		TotalLikes     int64
		TotalShares    int64
		TotalComments  int64
		TotalWatchTime int64
		AvgDuration    float64
	}

	err = query.Select(`
		COALESCE(SUM(ViewCount), 0) as total_views,
		COALESCE(SUM(LikeCount), 0) as total_likes,
		COALESCE(SUM(ShareCount), 0) as total_shares,
		COALESCE(SUM(CommentCount), 0) as total_comments,
		COALESCE(SUM(WatchTime), 0) as total_watch_time,
		COALESCE(AVG(Duration), 0) as avg_duration
	`).Scan(&aggregates).Error
	if err != nil {
		return nil, err
	}

	stats.TotalViews = aggregates.TotalViews
	stats.TotalLikes = aggregates.TotalLikes
	stats.TotalShares = aggregates.TotalShares
	stats.TotalComments = aggregates.TotalComments
	stats.TotalWatchTime = aggregates.TotalWatchTime
	stats.AverageDuration = aggregates.AvgDuration

	// Calculate averages
	if stats.TotalVideos > 0 {
		stats.AverageViews = float64(stats.TotalViews) / float64(stats.TotalVideos)
		stats.AverageLikes = float64(stats.TotalLikes) / float64(stats.TotalVideos)
		stats.AverageShares = float64(stats.TotalShares) / float64(stats.TotalVideos)
		stats.AverageComments = float64(stats.TotalComments) / float64(stats.TotalVideos)
		stats.AverageWatchTime = float64(stats.TotalWatchTime) / float64(stats.TotalVideos)
	}

	// Status breakdown
	statusCounts := []struct {
		Status entities.VideoStatus
		Count  int64
	}{}

	err = r.buildVideoQuery(filter).
		Select("Status, COUNT(*) as count").
		Group("Status").
		Scan(&statusCounts).Error
	if err != nil {
		return nil, err
	}

	for _, sc := range statusCounts {
		switch sc.Status {
		case entities.VideoStatusDraft:
			stats.DraftCount = sc.Count
		case entities.VideoStatusScheduled:
			stats.ScheduledCount = sc.Count
		case entities.VideoStatusLive:
			stats.LiveCount = sc.Count
		case entities.VideoStatusEnded:
			stats.EndedCount = sc.Count
		case entities.VideoStatusArchived:
			stats.ArchivedCount = sc.Count
		}
	}

	return &stats, nil
}

func (r *GormVideoRepository) GetCategoryStatistics(ctx context.Context, categoryID uuid.UUID) (*repositories.VideoStatistics, error) {
	filter := repositories.VideoFilter{
		CategoryID: &categoryID,
	}
	return r.GetStatistics(ctx, filter)
}

func (r *GormVideoRepository) GetUserStatistics(ctx context.Context, userID uuid.UUID) (*repositories.VideoStatistics, error) {
	filter := repositories.VideoFilter{
		UserID: &userID,
	}
	return r.GetStatistics(ctx, filter)
}
