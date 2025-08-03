package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormHitRepository implements HitRepository using GORM
type GormHitRepository struct {
	db *gorm.DB
}

// NewGormHitRepository creates a new GORM-based hit repository
func NewGormHitRepository(db *gorm.DB) repositories.HitRepository {
	return &GormHitRepository{db: db}
}

// Create creates a new hit record
func (r *GormHitRepository) Create(ctx context.Context, hit *entities.Hit) error {
	return r.db.WithContext(ctx).Create(hit).Error
}

// GetByID retrieves a hit by ID
func (r *GormHitRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Hit, error) {
	var hit entities.Hit
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		First(&hit, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &hit, nil
}

// GetAll retrieves all hits with pagination
func (r *GormHitRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.Hit, error) {
	var hits []*entities.Hit
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&hits).Error
	return hits, err
}

// GetByResource retrieves hits for a specific resource
func (r *GormHitRepository) GetByResource(ctx context.Context, resourceId uuid.UUID, resourceType string, offset, limit int) ([]*entities.Hit, error) {
	var hits []*entities.Hit
	err := r.db.WithContext(ctx).
		Where("resource_id = ? AND resource_type = ? AND is_deleted = ?", resourceId, resourceType, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&hits).Error
	return hits, err
}

// GetByUser retrieves hits for a specific user
func (r *GormHitRepository) GetByUser(ctx context.Context, userId uuid.UUID, offset, limit int) ([]*entities.Hit, error) {
	var hits []*entities.Hit
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND is_deleted = ?", userId, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&hits).Error
	return hits, err
}

// GetBySession retrieves hits for a specific session
func (r *GormHitRepository) GetBySession(ctx context.Context, sessionId string) ([]*entities.Hit, error) {
	var hits []*entities.Hit
	err := r.db.WithContext(ctx).
		Where("session_id = ? AND is_deleted = ?", sessionId, false).
		Order("CreationTime ASC").
		Find(&hits).Error
	return hits, err
}

// GetByPromotionCode retrieves hits for a specific promotion code
func (r *GormHitRepository) GetByPromotionCode(ctx context.Context, promotionCode string, offset, limit int) ([]*entities.Hit, error) {
	var hits []*entities.Hit
	err := r.db.WithContext(ctx).
		Where("promotion_code = ? AND is_deleted = ?", promotionCode, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&hits).Error
	return hits, err
}

// Update updates an existing hit
func (r *GormHitRepository) Update(ctx context.Context, hit *entities.Hit) error {
	return r.db.WithContext(ctx).Save(hit).Error
}

// Delete soft deletes a hit
func (r *GormHitRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.Hit{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":     true,
			"deletion_time":  gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of hits
func (r *GormHitRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.Hit{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// CountByResource returns the number of hits for a resource
func (r *GormHitRepository) CountByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.Hit{}).
		Where("resource_id = ? AND resource_type = ? AND is_deleted = ?", resourceId, resourceType, false).
		Count(&count).Error
	return count, err
}

// CountByUser returns the number of hits for a user
func (r *GormHitRepository) CountByUser(ctx context.Context, userId uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.Hit{}).
		Where("user_id = ? AND is_deleted = ?", userId, false).
		Count(&count).Error
	return count, err
}

// CountByFilter returns the number of hits matching the filter
func (r *GormHitRepository) CountByFilter(ctx context.Context, filter *repositories.HitAnalyticsFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.Hit{}).Where("is_deleted = ?", false)
	
	query = r.applyFilter(query, filter)
	
	err := query.Count(&count).Error
	return count, err
}

// CreateBatch creates multiple hits in a batch
func (r *GormHitRepository) CreateBatch(ctx context.Context, hits []*entities.Hit) error {
	return r.db.WithContext(ctx).CreateInBatches(hits, 100).Error
}

// DeleteOldHits deletes hits older than the specified time
func (r *GormHitRepository) DeleteOldHits(ctx context.Context, olderThan time.Time) (int64, error) {
	result := r.db.WithContext(ctx).
		Where("CreationTime < ?", olderThan).
		Delete(&entities.Hit{})
	return result.RowsAffected, result.Error
}

// Analytics methods - simplified implementations

// GetAnalytics retrieves comprehensive analytics (simplified implementation)
func (r *GormHitRepository) GetAnalytics(ctx context.Context, filter *repositories.HitAnalyticsFilter) (*repositories.HitAnalytics, error) {
	query := r.db.WithContext(ctx).Model(&entities.Hit{}).Where("is_deleted = ?", false)
	query = r.applyFilter(query, filter)
	
	var totalHits int64
	if err := query.Count(&totalHits).Error; err != nil {
		return nil, err
	}
	
	// Count unique users
	var uniqueUsers int64
	userQuery := r.db.WithContext(ctx).Model(&entities.Hit{}).
		Select("COUNT(DISTINCT user_id)").
		Where("is_deleted = ? AND user_id IS NOT NULL", false)
	userQuery = r.applyFilter(userQuery, filter)
	if err := userQuery.Scan(&uniqueUsers).Error; err != nil {
		return nil, err
	}
	
	// Count unique sessions
	var uniqueSessions int64
	sessionQuery := r.db.WithContext(ctx).Model(&entities.Hit{}).
		Select("COUNT(DISTINCT session_id)").
		Where("is_deleted = ?", false)
	sessionQuery = r.applyFilter(sessionQuery, filter)
	if err := sessionQuery.Scan(&uniqueSessions).Error; err != nil {
		return nil, err
	}
	
	// Calculate average read time for read hits
	var avgReadTime float64
	readQuery := r.db.WithContext(ctx).Model(&entities.Hit{}).
		Select("AVG(read_duration)").
		Where("is_deleted = ? AND hit_type = ? AND read_duration > 0", false, entities.HitTypeRead)
	readQuery = r.applyFilter(readQuery, filter)
	if err := readQuery.Scan(&avgReadTime).Error; err != nil {
		avgReadTime = 0
	}
	
	return &repositories.HitAnalytics{
		TotalHits:      totalHits,
		UniqueUsers:    uniqueUsers,
		UniqueSessions: uniqueSessions,
		AvgReadTime:    avgReadTime,
		// Other fields would be populated with more complex queries
	}, nil
}

// GetDailyStats retrieves daily statistics (simplified implementation)
func (r *GormHitRepository) GetDailyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DailyHitStats, error) {
	startDate := time.Now().AddDate(0, 0, -days)
	
	var results []struct {
		Date        time.Time
		Views       int64
		Reads       int64
		UniqueUsers int64
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.Hit{}).
		Select(`
			DATE(CreationTime) as date,
			COUNT(CASE WHEN hit_type = ? THEN 1 END) as views,
			COUNT(CASE WHEN hit_type = ? THEN 1 END) as reads,
			COUNT(DISTINCT user_id) as unique_users
		`, entities.HitTypeView, entities.HitTypeRead).
		Where("resource_id = ? AND resource_type = ? AND is_deleted = ? AND CreationTime >= ?", 
			resourceId, resourceType, false, startDate).
		Group("DATE(CreationTime)").
		Order("date ASC").
		Scan(&results).Error
	
	if err != nil {
		return nil, err
	}
	
	stats := make([]*repositories.DailyHitStats, len(results))
	for i, result := range results {
		stats[i] = &repositories.DailyHitStats{
			Date:        result.Date,
			Views:       result.Views,
			Reads:       result.Reads,
			UniqueUsers: result.UniqueUsers,
		}
	}
	
	return stats, nil
}

// Helper method to apply filters
func (r *GormHitRepository) applyFilter(query *gorm.DB, filter *repositories.HitAnalyticsFilter) *gorm.DB {
	if filter == nil {
		return query
	}
	
	if filter.ResourceId != nil {
		query = query.Where("resource_id = ?", *filter.ResourceId)
	}
	if filter.ResourceType != "" {
		query = query.Where("resource_type = ?", filter.ResourceType)
	}
	if filter.UserId != nil {
		query = query.Where("user_id = ?", *filter.UserId)
	}
	if filter.HitType != "" {
		query = query.Where("hit_type = ?", filter.HitType)
	}
	if filter.StartDate != nil {
		query = query.Where("CreationTime >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("CreationTime <= ?", *filter.EndDate)
	}
	if filter.Country != "" {
		query = query.Where("country = ?", filter.Country)
	}
	if filter.City != "" {
		query = query.Where("city = ?", filter.City)
	}
	if filter.DeviceType != "" {
		query = query.Where("device_type = ?", filter.DeviceType)
	}
	if filter.Platform != "" {
		query = query.Where("platform = ?", filter.Platform)
	}
	if filter.Browser != "" {
		query = query.Where("browser = ?", filter.Browser)
	}
	if filter.PromotionCode != "" {
		query = query.Where("promotion_code = ?", filter.PromotionCode)
	}
	
	return query
}

// Placeholder implementations for complex analytics methods
func (r *GormHitRepository) GetTopReferrers(ctx context.Context, resourceId uuid.UUID, resourceType string, limit int, days int) ([]*repositories.ReferrerStats, error) {
	// Simplified implementation
	return []*repositories.ReferrerStats{}, nil
}

func (r *GormHitRepository) GetUserEngagement(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.UserEngagementStats, error) {
	// Simplified implementation
	return []*repositories.UserEngagementStats{}, nil
}

func (r *GormHitRepository) GetReadingAnalytics(ctx context.Context, resourceId uuid.UUID, days int) (*repositories.ReadingAnalytics, error) {
	// Simplified implementation
	return &repositories.ReadingAnalytics{}, nil
}

func (r *GormHitRepository) GetGeographicStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.GeographicStats, error) {
	// Simplified implementation
	return []*repositories.GeographicStats{}, nil
}

func (r *GormHitRepository) GetDeviceStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DeviceStats, error) {
	// Simplified implementation
	return []*repositories.DeviceStats{}, nil
}

func (r *GormHitRepository) GetHourlyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.HourlyStats, error) {
	// Simplified implementation
	return []*repositories.HourlyStats{}, nil
}

func (r *GormHitRepository) GetWeeklyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, weeks int) ([]*repositories.WeeklyStats, error) {
	// Simplified implementation
	return []*repositories.WeeklyStats{}, nil
}

func (r *GormHitRepository) GetMonthlyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, months int) ([]*repositories.MonthlyStats, error) {
	// Simplified implementation
	return []*repositories.MonthlyStats{}, nil
}

func (r *GormHitRepository) GetPromotionStats(ctx context.Context, promotionCode string, days int) (*repositories.PromotionAnalytics, error) {
	// Simplified implementation
	return &repositories.PromotionAnalytics{}, nil
}

func (r *GormHitRepository) GetTopPromotions(ctx context.Context, limit int, days int) ([]*repositories.PromotionStats, error) {
	// Simplified implementation
	return []*repositories.PromotionStats{}, nil
}
