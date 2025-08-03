package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormSurveyResponseRepository implements SurveyResponseRepository using GORM
type GormSurveyResponseRepository struct {
	db *gorm.DB
}

// NewGormSurveyResponseRepository creates a new GORM survey response repository
func NewGormSurveyResponseRepository(db *gorm.DB) repositories.SurveyResponseRepository {
	return &GormSurveyResponseRepository{db: db}
}

// Create creates a new survey response
func (r *GormSurveyResponseRepository) Create(ctx context.Context, response *entities.SurveyResponse) error {
	if err := r.db.WithContext(ctx).Create(response).Error; err != nil {
		return fmt.Errorf("failed to create survey response: %w", err)
	}
	return nil
}

// FindByID finds a survey response by ID
func (r *GormSurveyResponseRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyResponse, error) {
	var response entities.SurveyResponse
	err := r.db.WithContext(ctx).
		Preload("Survey").
		Preload("Answers").
		Preload("Answers.Question").
		First(&response, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey response: %w", err)
	}
	
	// Calculate computed fields
	response.AnswerCount = len(response.Answers)
	if response.Survey != nil && len(response.Survey.Questions) > 0 {
		response.CompletionRate = float64(response.AnswerCount) / float64(len(response.Survey.Questions)) * 100
	}
	
	return &response, nil
}

// Update updates an existing survey response
func (r *GormSurveyResponseRepository) Update(ctx context.Context, response *entities.SurveyResponse) error {
	if err := r.db.WithContext(ctx).Save(response).Error; err != nil {
		return fmt.Errorf("failed to update survey response: %w", err)
	}
	return nil
}

// Delete deletes a survey response by ID
func (r *GormSurveyResponseRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SurveyResponse{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey response: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindBySurveyID finds all responses for a survey
func (r *GormSurveyResponseRepository) FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyResponse, error) {
	var responses []entities.SurveyResponse
	err := r.db.WithContext(ctx).
		Preload("Answers").
		Where("survey_id = ?", surveyID).
		Order("started_at DESC").
		Find(&responses).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find responses by survey ID: %w", err)
	}
	
	// Calculate computed fields
	for i := range responses {
		responses[i].AnswerCount = len(responses[i].Answers)
	}
	
	return responses, nil
}

// FindWithFilter finds responses with filtering options
func (r *GormSurveyResponseRepository) FindWithFilter(ctx context.Context, filter repositories.SurveyResponseFilter) ([]entities.SurveyResponse, error) {
	var responses []entities.SurveyResponse
	
	query := r.db.WithContext(ctx).
		Preload("Survey").
		Preload("Answers")
	
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
	} else {
		query = query.Order("started_at DESC")
	}
	
	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	
	err := query.Find(&responses).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find responses with filter: %w", err)
	}
	
	// Calculate computed fields
	for i := range responses {
		responses[i].AnswerCount = len(responses[i].Answers)
	}
	
	return responses, nil
}

// CountWithFilter counts responses with filtering options
func (r *GormSurveyResponseRepository) CountWithFilter(ctx context.Context, filter repositories.SurveyResponseFilter) (int64, error) {
	var count int64
	
	query := r.db.WithContext(ctx).Model(&entities.SurveyResponse{})
	query = r.applyFilters(query, filter)
	
	err := query.Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count responses with filter: %w", err)
	}
	
	return count, nil
}

// applyFilters applies filtering conditions to a query
func (r *GormSurveyResponseRepository) applyFilters(query *gorm.DB, filter repositories.SurveyResponseFilter) *gorm.DB {
	// Survey ID filter
	if filter.SurveyID != uuid.Nil {
		query = query.Where("survey_id = ?", filter.SurveyID)
	}
	
	// Respondent ID filter
	if filter.RespondentID != nil {
		query = query.Where("respondent_id = ?", *filter.RespondentID)
	}
	
	// Status filter
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	
	// Date range filters
	if filter.StartDate != nil {
		query = query.Where("started_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("started_at <= ?", *filter.EndDate)
	}
	
	// Anonymous filter
	if filter.IsAnonymous != nil {
		if *filter.IsAnonymous {
			query = query.Where("respondent_id IS NULL")
		} else {
			query = query.Where("respondent_id IS NOT NULL")
		}
	}
	
	// Completed filter
	if filter.IsCompleted != nil {
		if *filter.IsCompleted {
			query = query.Where("status IN ?", []entities.ResponseStatus{
				entities.ResponseStatusCompleted,
				entities.ResponseStatusSubmitted,
			})
		} else {
			query = query.Where("status NOT IN ?", []entities.ResponseStatus{
				entities.ResponseStatusCompleted,
				entities.ResponseStatusSubmitted,
			})
		}
	}
	
	// Time spent filters
	if filter.MinTimeSpent != nil {
		query = query.Where("time_spent >= ?", *filter.MinTimeSpent)
	}
	if filter.MaxTimeSpent != nil {
		query = query.Where("time_spent <= ?", *filter.MaxTimeSpent)
	}
	
	// IP address filter
	if filter.IPAddress != "" {
		query = query.Where("ip_address = ?", filter.IPAddress)
	}
	
	return query
}

// FindByRespondent finds responses by respondent
func (r *GormSurveyResponseRepository) FindByRespondent(ctx context.Context, respondentID uuid.UUID, limit int) ([]entities.SurveyResponse, error) {
	var responses []entities.SurveyResponse
	
	query := r.db.WithContext(ctx).
		Preload("Survey").
		Where("respondent_id = ?", respondentID).
		Order("started_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&responses).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find responses by respondent: %w", err)
	}
	
	return responses, nil
}

// FindBySessionID finds a response by session ID
func (r *GormSurveyResponseRepository) FindBySessionID(ctx context.Context, sessionID string) (*entities.SurveyResponse, error) {
	var response entities.SurveyResponse
	err := r.db.WithContext(ctx).
		Preload("Survey").
		Preload("Answers").
		Where("session_id = ?", sessionID).
		First(&response).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find response by session ID: %w", err)
	}
	
	return &response, nil
}

// UpdateStatus updates response status
func (r *GormSurveyResponseRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status entities.ResponseStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	
	// Set completion/submission timestamps
	now := time.Now()
	switch status {
	case entities.ResponseStatusCompleted:
		updates["completed_at"] = now
	case entities.ResponseStatusSubmitted:
		updates["submitted_at"] = now
		if updates["completed_at"] == nil {
			updates["completed_at"] = now
		}
	}
	
	result := r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Where("id = ?", id).
		Updates(updates)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update response status: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// MarkCompleted marks a response as completed
func (r *GormSurveyResponseRepository) MarkCompleted(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.ResponseStatusCompleted)
}

// MarkSubmitted marks a response as submitted
func (r *GormSurveyResponseRepository) MarkSubmitted(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.ResponseStatusSubmitted)
}

// MarkAbandoned marks a response as abandoned
func (r *GormSurveyResponseRepository) MarkAbandoned(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.ResponseStatusAbandoned)
}

// GetResponseStats gets comprehensive response statistics
func (r *GormSurveyResponseRepository) GetResponseStats(ctx context.Context, surveyID uuid.UUID) (*repositories.ResponseStats, error) {
	var stats repositories.ResponseStats
	
	// Get response counts by status
	var statusCounts []struct {
		Status entities.ResponseStatus `gorm:"column:status"`
		Count  int                     `gorm:"column:count"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Select("status, COUNT(*) as count").
		Where("survey_id = ?", surveyID).
		Group("status").
		Scan(&statusCounts).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get status counts: %w", err)
	}
	
	// Process status counts
	for _, sc := range statusCounts {
		stats.TotalResponses += sc.Count
		switch sc.Status {
		case entities.ResponseStatusCompleted:
			stats.CompletedCount = sc.Count
		case entities.ResponseStatusSubmitted:
			stats.SubmittedCount = sc.Count
		case entities.ResponseStatusAbandoned:
			stats.AbandonedCount = sc.Count
		}
	}
	
	// Calculate completion rate
	if stats.TotalResponses > 0 {
		stats.CompletionRate = float64(stats.CompletedCount+stats.SubmittedCount) / float64(stats.TotalResponses) * 100
	}
	
	// Get time statistics
	var timeStats struct {
		AverageTime float64 `gorm:"column:average_time"`
		MedianTime  float64 `gorm:"column:median_time"`
		FastestTime float64 `gorm:"column:fastest_time"`
		SlowestTime float64 `gorm:"column:slowest_time"`
	}
	
	err = r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Select(`
			COALESCE(AVG(time_spent::DECIMAL / 60), 0) as average_time,
			COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_spent::DECIMAL / 60), 0) as median_time,
			COALESCE(MIN(time_spent::DECIMAL / 60), 0) as fastest_time,
			COALESCE(MAX(time_spent::DECIMAL / 60), 0) as slowest_time
		`).
		Where("survey_id = ? AND time_spent IS NOT NULL", surveyID).
		Scan(&timeStats).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get time stats: %w", err)
	}
	
	stats.AverageTime = timeStats.AverageTime
	stats.MedianTime = timeStats.MedianTime
	stats.FastestTime = timeStats.FastestTime
	stats.SlowestTime = timeStats.SlowestTime
	
	return &stats, nil
}

// GetCompletionRate gets the completion rate for a survey
func (r *GormSurveyResponseRepository) GetCompletionRate(ctx context.Context, surveyID uuid.UUID) (float64, error) {
	var result struct {
		TotalResponses     int64 `gorm:"column:total_responses"`
		CompletedResponses int64 `gorm:"column:completed_responses"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Select(`
			COUNT(*) as total_responses,
			COUNT(CASE WHEN status IN ('completed', 'submitted') THEN 1 END) as completed_responses
		`).
		Where("survey_id = ?", surveyID).
		Scan(&result).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to get completion rate: %w", err)
	}
	
	if result.TotalResponses == 0 {
		return 0, nil
	}
	
	return float64(result.CompletedResponses) / float64(result.TotalResponses) * 100, nil
}

// GetAverageTime gets the average completion time for a survey
func (r *GormSurveyResponseRepository) GetAverageTime(ctx context.Context, surveyID uuid.UUID) (float64, error) {
	var averageTime float64
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Select("COALESCE(AVG(time_spent::DECIMAL / 60), 0)").
		Where("survey_id = ? AND time_spent IS NOT NULL", surveyID).
		Scan(&averageTime).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to get average time: %w", err)
	}
	
	return averageTime, nil
}

// GetDropoffPoints gets points where users commonly abandon the survey
func (r *GormSurveyResponseRepository) GetDropoffPoints(ctx context.Context, surveyID uuid.UUID) ([]repositories.DropoffPoint, error) {
	var dropoffPoints []repositories.DropoffPoint
	
	// This is a complex query that would need to analyze the last answered question
	// for abandoned responses. For now, return empty slice.
	// In a real implementation, you would analyze the answers to find the last
	// question answered before abandonment.
	
	return dropoffPoints, nil
}

// BulkUpdateStatus updates status for multiple responses
func (r *GormSurveyResponseRepository) BulkUpdateStatus(ctx context.Context, responseIDs []uuid.UUID, status entities.ResponseStatus) error {
	if len(responseIDs) == 0 {
		return nil
	}
	
	updates := map[string]interface{}{
		"status": status,
	}
	
	now := time.Now()
	switch status {
	case entities.ResponseStatusCompleted:
		updates["completed_at"] = now
	case entities.ResponseStatusSubmitted:
		updates["submitted_at"] = now
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Where("id IN ?", responseIDs).
		Updates(updates).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk update response status: %w", err)
	}
	
	return nil
}

// BulkDelete deletes multiple responses
func (r *GormSurveyResponseRepository) BulkDelete(ctx context.Context, responseIDs []uuid.UUID) error {
	if len(responseIDs) == 0 {
		return nil
	}
	
	err := r.db.WithContext(ctx).
		Where("id IN ?", responseIDs).
		Delete(&entities.SurveyResponse{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk delete responses: %w", err)
	}
	
	return nil
}

// DeleteBySurveyID deletes all responses for a survey
func (r *GormSurveyResponseRepository) DeleteBySurveyID(ctx context.Context, surveyID uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		Delete(&entities.SurveyResponse{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to delete responses by survey ID: %w", err)
	}
	
	return nil
}
