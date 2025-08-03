package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormVideoSessionRepository implements VideoSessionRepository using GORM
type GormVideoSessionRepository struct {
	db *gorm.DB
}

// NewGormVideoSessionRepository creates a new GORM video session repository
func NewGormVideoSessionRepository(db *gorm.DB) repositories.VideoSessionRepository {
	return &GormVideoSessionRepository{db: db}
}

// Basic CRUD operations

func (r *GormVideoSessionRepository) Create(ctx context.Context, session *entities.VideoSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *GormVideoSessionRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.VideoSession, error) {
	var session entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("Id = ? AND IsDeleted = 0", id).
		First(&session).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}
	
	return &session, nil
}

func (r *GormVideoSessionRepository) Update(ctx context.Context, session *entities.VideoSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

func (r *GormVideoSessionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Where("Id = ?", id).
		Delete(&entities.VideoSession{}).Error
}

// Session management

func (r *GormVideoSessionRepository) GetBySessionID(ctx context.Context, sessionID string) (*entities.VideoSession, error) {
	var session entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("SessionId = ? AND IsDeleted = 0", sessionID).
		First(&session).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}
	
	return &session, nil
}

func (r *GormVideoSessionRepository) GetByVideoAndUser(ctx context.Context, videoID, userID uuid.UUID) ([]*entities.VideoSession, error) {
	var sessions []*entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("VideoId = ? AND UserId = ? AND IsDeleted = 0", videoID, userID).
		Order("StartTime DESC").
		Find(&sessions).Error
	
	return sessions, err
}

func (r *GormVideoSessionRepository) GetByVideoAndSession(ctx context.Context, videoID uuid.UUID, sessionID string) (*entities.VideoSession, error) {
	var session entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("VideoId = ? AND SessionId = ? AND IsDeleted = 0", videoID, sessionID).
		First(&session).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, err
	}
	
	return &session, nil
}

func (r *GormVideoSessionRepository) GetActiveSessionsForVideo(ctx context.Context, videoID uuid.UUID) ([]*entities.VideoSession, error) {
	var sessions []*entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("VideoId = ? AND Status = ? AND IsDeleted = 0", videoID, entities.VideoSessionStatusActive).
		Find(&sessions).Error
	
	return sessions, err
}

func (r *GormVideoSessionRepository) GetUserActiveSessions(ctx context.Context, userID uuid.UUID) ([]*entities.VideoSession, error) {
	var sessions []*entities.VideoSession
	err := r.db.WithContext(ctx).
		Where("UserId = ? AND Status = ? AND IsDeleted = 0", userID, entities.VideoSessionStatusActive).
		Find(&sessions).Error
	
	return sessions, err
}

// Analytics operations

func (r *GormVideoSessionRepository) GetSessionsByVideo(ctx context.Context, videoID uuid.UUID, filter repositories.VideoSessionFilter) ([]*entities.VideoSession, error) {
	filter.VideoID = &videoID
	return r.listSessions(ctx, filter)
}

func (r *GormVideoSessionRepository) GetSessionsByUser(ctx context.Context, userID uuid.UUID, filter repositories.VideoSessionFilter) ([]*entities.VideoSession, error) {
	filter.UserID = &userID
	return r.listSessions(ctx, filter)
}

func (r *GormVideoSessionRepository) GetSessionStatistics(ctx context.Context, videoID uuid.UUID) (*repositories.VideoSessionStatistics, error) {
	var stats repositories.VideoSessionStatistics

	// Total sessions
	err := r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Where("VideoId = ? AND IsDeleted = 0", videoID).
		Count(&stats.TotalSessions).Error
	if err != nil {
		return nil, err
	}

	// Status breakdown
	var statusCounts []struct {
		Status entities.VideoSessionStatus
		Count  int64
	}
	
	err = r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Select("Status, COUNT(*) as count").
		Where("VideoId = ? AND IsDeleted = 0", videoID).
		Group("Status").
		Scan(&statusCounts).Error
	if err != nil {
		return nil, err
	}

	for _, sc := range statusCounts {
		switch sc.Status {
		case entities.VideoSessionStatusCompleted:
			stats.CompletedSessions = sc.Count
		case entities.VideoSessionStatusAbandoned:
			stats.AbandonedSessions = sc.Count
		}
	}

	// Aggregate statistics
	var aggregates struct {
		AvgWatchTime     float64
		AvgCompletion    float64
		AvgEngagement    float64
		TotalWatchTime   int64
		UniqueViewers    int64
		AvgSessionLength float64
	}

	err = r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Select(`
			COALESCE(AVG(WatchedDuration), 0) as avg_watch_time,
			COALESCE(AVG(CompletionPercentage), 0) as avg_completion,
			COALESCE(AVG(EngagementScore), 0) as avg_engagement,
			COALESCE(SUM(WatchedDuration), 0) as total_watch_time,
			COUNT(DISTINCT COALESCE(UserId, SessionId)) as unique_viewers,
			COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(EndTime, NOW()) - StartTime))), 0) as avg_session_length
		`).
		Where("VideoId = ? AND IsDeleted = 0", videoID).
		Scan(&aggregates).Error
	if err != nil {
		return nil, err
	}

	stats.AverageWatchTime = aggregates.AvgWatchTime
	stats.AverageCompletion = aggregates.AvgCompletion
	stats.AverageEngagement = aggregates.AvgEngagement
	stats.TotalWatchTime = aggregates.TotalWatchTime
	stats.UniqueViewers = aggregates.UniqueViewers
	stats.AverageSessionLength = aggregates.AvgSessionLength

	// Calculate rates
	if stats.TotalSessions > 0 {
		stats.CompletionRate = (float64(stats.CompletedSessions) / float64(stats.TotalSessions)) * 100
		stats.AbandonmentRate = (float64(stats.AbandonedSessions) / float64(stats.TotalSessions)) * 100
	}

	// Return viewers calculation
	stats.ReturnViewers = stats.TotalSessions - stats.UniqueViewers
	if stats.ReturnViewers < 0 {
		stats.ReturnViewers = 0
	}

	return &stats, nil
}

func (r *GormVideoSessionRepository) GetUserSessionStatistics(ctx context.Context, userID uuid.UUID) (*repositories.VideoSessionStatistics, error) {
	var stats repositories.VideoSessionStatistics

	// Total sessions
	err := r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Where("UserId = ? AND IsDeleted = 0", userID).
		Count(&stats.TotalSessions).Error
	if err != nil {
		return nil, err
	}

	// Status breakdown and aggregates
	var aggregates struct {
		CompletedSessions int64
		AbandonedSessions int64
		AvgWatchTime      float64
		AvgCompletion     float64
		AvgEngagement     float64
		TotalWatchTime    int64
		AvgSessionLength  float64
	}

	err = r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Select(`
			SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) as completed_sessions,
			SUM(CASE WHEN Status = ? THEN 1 ELSE 0 END) as abandoned_sessions,
			COALESCE(AVG(WatchedDuration), 0) as avg_watch_time,
			COALESCE(AVG(CompletionPercentage), 0) as avg_completion,
			COALESCE(AVG(EngagementScore), 0) as avg_engagement,
			COALESCE(SUM(WatchedDuration), 0) as total_watch_time,
			COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(EndTime, NOW()) - StartTime))), 0) as avg_session_length
		`, entities.VideoSessionStatusCompleted, entities.VideoSessionStatusAbandoned).
		Where("UserId = ? AND IsDeleted = 0", userID).
		Scan(&aggregates).Error
	if err != nil {
		return nil, err
	}

	stats.CompletedSessions = aggregates.CompletedSessions
	stats.AbandonedSessions = aggregates.AbandonedSessions
	stats.AverageWatchTime = aggregates.AvgWatchTime
	stats.AverageCompletion = aggregates.AvgCompletion
	stats.AverageEngagement = aggregates.AvgEngagement
	stats.TotalWatchTime = aggregates.TotalWatchTime
	stats.AverageSessionLength = aggregates.AvgSessionLength

	// Calculate rates
	if stats.TotalSessions > 0 {
		stats.CompletionRate = (float64(stats.CompletedSessions) / float64(stats.TotalSessions)) * 100
		stats.AbandonmentRate = (float64(stats.AbandonedSessions) / float64(stats.TotalSessions)) * 100
	}

	stats.UniqueViewers = 1 // User-specific stats, so unique viewers is 1
	stats.ReturnViewers = stats.TotalSessions - 1
	if stats.ReturnViewers < 0 {
		stats.ReturnViewers = 0
	}

	return &stats, nil
}

// Cleanup operations

func (r *GormVideoSessionRepository) CleanupAbandonedSessions(ctx context.Context, olderThan time.Time) error {
	return r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Where("Status = ? AND LastActivity < ?", entities.VideoSessionStatusActive, olderThan).
		Update("Status", entities.VideoSessionStatusAbandoned).Error
}

func (r *GormVideoSessionRepository) MarkInactiveSessions(ctx context.Context, inactiveThreshold time.Duration) error {
	cutoff := time.Now().Add(-inactiveThreshold)
	return r.db.WithContext(ctx).
		Model(&entities.VideoSession{}).
		Where("Status = ? AND LastActivity < ?", entities.VideoSessionStatusActive, cutoff).
		Update("Status", entities.VideoSessionStatusAbandoned).Error
}

// Bulk operations

func (r *GormVideoSessionRepository) BulkCreate(ctx context.Context, sessions []*entities.VideoSession) error {
	return r.db.WithContext(ctx).CreateInBatches(sessions, 100).Error
}

func (r *GormVideoSessionRepository) BulkUpdate(ctx context.Context, sessions []*entities.VideoSession) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, session := range sessions {
			if err := tx.Save(session).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// Helper methods

func (r *GormVideoSessionRepository) listSessions(ctx context.Context, filter repositories.VideoSessionFilter) ([]*entities.VideoSession, error) {
	query := r.buildSessionQuery(filter)
	
	var sessions []*entities.VideoSession
	err := query.WithContext(ctx).Find(&sessions).Error
	return sessions, err
}

func (r *GormVideoSessionRepository) buildSessionQuery(filter repositories.VideoSessionFilter) *gorm.DB {
	query := r.db.Model(&entities.VideoSession{}).Where("IsDeleted = 0")

	// Apply filters
	if filter.Status != nil {
		query = query.Where("Status = ?", *filter.Status)
	}
	if filter.VideoID != nil {
		query = query.Where("VideoId = ?", *filter.VideoID)
	}
	if filter.UserID != nil {
		query = query.Where("UserId = ?", *filter.UserID)
	}
	if filter.SessionID != nil {
		query = query.Where("SessionId = ?", *filter.SessionID)
	}

	// Date filters
	if filter.StartTimeAfter != nil {
		query = query.Where("StartTime >= ?", *filter.StartTimeAfter)
	}
	if filter.StartTimeBefore != nil {
		query = query.Where("StartTime <= ?", *filter.StartTimeBefore)
	}
	if filter.EndTimeAfter != nil {
		query = query.Where("EndTime >= ?", *filter.EndTimeAfter)
	}
	if filter.EndTimeBefore != nil {
		query = query.Where("EndTime <= ?", *filter.EndTimeBefore)
	}

	// Completion filters
	if filter.MinCompletionPercentage != nil {
		query = query.Where("CompletionPercentage >= ?", *filter.MinCompletionPercentage)
	}
	if filter.MaxCompletionPercentage != nil {
		query = query.Where("CompletionPercentage <= ?", *filter.MaxCompletionPercentage)
	}
	if filter.IsCompleted != nil {
		query = query.Where("IsCompleted = ?", *filter.IsCompleted)
	}

	// Device filters
	if len(filter.DeviceType) > 0 {
		query = query.Where("DeviceType IN ?", filter.DeviceType)
	}
	if len(filter.Browser) > 0 {
		query = query.Where("Browser IN ?", filter.Browser)
	}
	if len(filter.OS) > 0 {
		query = query.Where("Os IN ?", filter.OS)
	}
	if len(filter.Country) > 0 {
		query = query.Where("Country IN ?", filter.Country)
	}

	// Include relationships
	if filter.IncludeVideo {
		query = query.Preload("Video")
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
		query = query.Order("StartTime DESC")
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
