package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormArticleTrackingRepository implements ArticleTrackingRepository using GORM
type GormArticleTrackingRepository struct {
	db *gorm.DB
}

// NewGormArticleTrackingRepository creates a new GORM-based article tracking repository
func NewGormArticleTrackingRepository(db *gorm.DB) repositories.ArticleTrackingRepository {
	return &GormArticleTrackingRepository{db: db}
}

// Create creates a new article tracking record
func (r *GormArticleTrackingRepository) Create(ctx context.Context, tracking *entities.ArticleTracking) error {
	return r.db.WithContext(ctx).Create(tracking).Error
}

// GetByID retrieves an article tracking record by ID
func (r *GormArticleTrackingRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.ArticleTracking, error) {
	var tracking entities.ArticleTracking
	err := r.db.WithContext(ctx).
		Preload("Article").
		Preload("User").
		First(&tracking, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &tracking, nil
}

// Update updates an existing article tracking record
func (r *GormArticleTrackingRepository) Update(ctx context.Context, tracking *entities.ArticleTracking) error {
	return r.db.WithContext(ctx).Save(tracking).Error
}

// Delete deletes an article tracking record
func (r *GormArticleTrackingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.ArticleTracking{}, "id = ?", id).Error
}

// GetByArticleID retrieves all tracking records for a specific article
func (r *GormArticleTrackingRepository) GetByArticleID(ctx context.Context, articleID uuid.UUID) ([]*entities.ArticleTracking, error) {
	var trackings []*entities.ArticleTracking
	err := r.db.WithContext(ctx).
		Where("article_id = ?", articleID).
		Order("creation_time DESC").
		Find(&trackings).Error
	return trackings, err
}

// GetByArticleAndSession retrieves tracking record for a specific article and session
func (r *GormArticleTrackingRepository) GetByArticleAndSession(ctx context.Context, articleID uuid.UUID, sessionID string) (*entities.ArticleTracking, error) {
	var tracking entities.ArticleTracking
	err := r.db.WithContext(ctx).
		Where("article_id = ? AND session_id = ?", articleID, sessionID).
		Order("creation_time DESC").
		First(&tracking).Error
	if err != nil {
		return nil, err
	}
	return &tracking, nil
}

// GetByArticleAndUser retrieves all tracking records for a specific article and user
func (r *GormArticleTrackingRepository) GetByArticleAndUser(ctx context.Context, articleID uuid.UUID, userID uuid.UUID) ([]*entities.ArticleTracking, error) {
	var trackings []*entities.ArticleTracking
	err := r.db.WithContext(ctx).
		Where("article_id = ? AND user_id = ?", articleID, userID).
		Order("creation_time DESC").
		Find(&trackings).Error
	return trackings, err
}

// GetArticleAnalytics retrieves analytics data for a specific article
func (r *GormArticleTrackingRepository) GetArticleAnalytics(ctx context.Context, articleID uuid.UUID) (*repositories.ArticleAnalyticsData, error) {
	var analytics repositories.ArticleAnalyticsData

	// Get basic counts
	var totalViews, uniqueViews, completedReads int64
	var avgReadDuration, avgScrollDepth, avgReadPercentage float64

	// Total views (all tracking records)
	r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ?", articleID).
		Count(&totalViews)

	// Unique views (distinct sessions)
	r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ?", articleID).
		Distinct("session_id").
		Count(&uniqueViews)

	// Completed reads
	r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ? AND is_completed = ?", articleID, true).
		Count(&completedReads)

	// Average metrics
	r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ? AND read_duration > 0", articleID).
		Select("AVG(read_duration) as avg_read_duration, AVG(scroll_depth) as avg_scroll_depth, AVG(read_percentage) as avg_read_percentage").
		Row().Scan(&avgReadDuration, &avgScrollDepth, &avgReadPercentage)

	analytics = repositories.ArticleAnalyticsData{
		ArticleID:       articleID,
		TotalViews:      totalViews,
		UniqueReaders:   uniqueViews,
		AverageReadTime: avgReadDuration,
		CompletionRate:  float64(completedReads) / float64(totalViews) * 100,
		ShareCount:      0, // TODO: implement share tracking
		LikeCount:       0, // TODO: implement like tracking
		CommentCount:    0, // TODO: implement comment tracking
	}

	// Note: Device and country breakdowns are not part of ArticleAnalyticsData
	// They would be handled separately in a more detailed analytics service

	return &analytics, nil
}

// GetUserReadingHistory retrieves reading history for a specific user
func (r *GormArticleTrackingRepository) GetUserReadingHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.ArticleTracking, error) {
	var trackings []*entities.ArticleTracking
	err := r.db.WithContext(ctx).
		Preload("Article").
		Where("user_id = ?", userID).
		Order("creation_time DESC").
		Limit(limit).
		Find(&trackings).Error
	return trackings, err
}

// GetPopularArticles retrieves popular articles based on tracking data
func (r *GormArticleTrackingRepository) GetPopularArticles(ctx context.Context, timeRange string, limit int) ([]*repositories.ArticlePopularityData, error) {
	var popularityData []*repositories.ArticlePopularityData

	// Calculate time range
	var since time.Time
	switch timeRange {
	case "day":
		since = time.Now().AddDate(0, 0, -1)
	case "week":
		since = time.Now().AddDate(0, 0, -7)
	case "month":
		since = time.Now().AddDate(0, -1, 0)
	case "year":
		since = time.Now().AddDate(-1, 0, 0)
	default:
		since = time.Now().AddDate(0, 0, -7) // Default to week
	}

	query := `
		SELECT 
			article_id,
			COUNT(*) as total_views,
			COUNT(DISTINCT session_id) as unique_views,
			COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_reads,
			AVG(read_duration) as avg_read_duration,
			AVG(scroll_depth) as avg_scroll_depth,
			AVG(read_percentage) as avg_read_percentage
		FROM article_trackings 
		WHERE creation_time >= ? 
		GROUP BY article_id 
		ORDER BY total_views DESC, unique_views DESC 
		LIMIT ?
	`

	err := r.db.WithContext(ctx).Raw(query, since, limit).Scan(&popularityData).Error
	return popularityData, err
}

// GetTotalViews returns the total number of views for an article
func (r *GormArticleTrackingRepository) GetTotalViews(ctx context.Context, articleID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ?", articleID).
		Count(&count).Error
	return count, err
}

// GetUniqueReaders returns the number of unique readers for an article
func (r *GormArticleTrackingRepository) GetUniqueReaders(ctx context.Context, articleID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ?", articleID).
		Distinct("session_id").
		Count(&count).Error
	return count, err
}

// GetAverageReadTime returns the average read time for an article
func (r *GormArticleTrackingRepository) GetAverageReadTime(ctx context.Context, articleID uuid.UUID) (float64, error) {
	var avgReadTime float64
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ? AND read_duration > 0", articleID).
		Select("AVG(read_duration)").
		Row().Scan(&avgReadTime)
	return avgReadTime, err
}

// GetCompletionRate returns the completion rate for an article
func (r *GormArticleTrackingRepository) GetCompletionRate(ctx context.Context, articleID uuid.UUID) (float64, error) {
	var totalViews, completedReads int64

	// Get total views
	err := r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ?", articleID).
		Count(&totalViews).Error
	if err != nil {
		return 0, err
	}

	// Get completed reads
	err = r.db.WithContext(ctx).
		Model(&entities.ArticleTracking{}).
		Where("article_id = ? AND is_completed = ?", articleID, true).
		Count(&completedReads).Error
	if err != nil {
		return 0, err
	}

	if totalViews == 0 {
		return 0, nil
	}

	return float64(completedReads) / float64(totalViews) * 100, nil
}

// Note: GetEngagementMetrics method removed as it's not part of the required interface

// GetTrendingArticles retrieves trending articles based on recent engagement
func (r *GormArticleTrackingRepository) GetTrendingArticles(ctx context.Context, limit int) ([]*repositories.ArticlePopularityData, error) {
	// Get articles with high engagement in the last 24 hours
	since := time.Now().AddDate(0, 0, -1)

	query := `
		SELECT 
			article_id,
			COUNT(*) as total_views,
			COUNT(DISTINCT session_id) as unique_views,
			COUNT(CASE WHEN is_completed = true THEN 1 END) as completed_reads,
			AVG(read_duration) as avg_read_duration,
			AVG(scroll_depth) as avg_scroll_depth,
			AVG(read_percentage) as avg_read_percentage,
			AVG(
				(read_percentage * 0.4) + 
				(scroll_depth * 0.2) + 
				(LEAST(read_duration / 300.0 * 100, 100) * 0.2) +
				((share_count * 3 + like_count + comment_count * 2) * 0.2)
			) as engagement_score
		FROM article_trackings 
		WHERE creation_time >= ? 
		GROUP BY article_id 
		HAVING total_views >= 5  -- Minimum threshold for trending
		ORDER BY engagement_score DESC, total_views DESC
		LIMIT ?
	`

	var trendingData []*repositories.ArticlePopularityData
	err := r.db.WithContext(ctx).Raw(query, since, limit).Scan(&trendingData).Error
	return trendingData, err
}
