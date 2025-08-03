package repositories

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormSurveyRepository implements SurveyRepository using GORM
type GormSurveyRepository struct {
	db *gorm.DB
}

// NewGormSurveyRepository creates a new GORM survey repository
func NewGormSurveyRepository(db *gorm.DB) repositories.SurveyRepository {
	return &GormSurveyRepository{db: db}
}

// Create creates a new survey
func (r *GormSurveyRepository) Create(ctx context.Context, survey *entities.Survey) error {
	if err := r.db.WithContext(ctx).Create(survey).Error; err != nil {
		return fmt.Errorf("failed to create survey: %w", err)
	}
	return nil
}

// FindByID finds a survey by ID
func (r *GormSurveyRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.Survey, error) {
	var survey entities.Survey
	err := r.db.WithContext(ctx).
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("\"order\" ASC")
		}).
		Preload("Responses").
		First(&survey, "id = ?", id).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey: %w", err)
	}

	// Calculate computed fields
	survey.QuestionCount = len(survey.Questions)
	survey.ResponseCount = len(survey.Responses)

	return &survey, nil
}

// Update updates an existing survey
func (r *GormSurveyRepository) Update(ctx context.Context, survey *entities.Survey) error {
	if err := r.db.WithContext(ctx).Save(survey).Error; err != nil {
		return fmt.Errorf("failed to update survey: %w", err)
	}
	return nil
}

// Delete deletes a survey by ID
func (r *GormSurveyRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.Survey{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindAll finds all surveys
func (r *GormSurveyRepository) FindAll(ctx context.Context) ([]entities.Survey, error) {
	var surveys []entities.Survey
	err := r.db.WithContext(ctx).
		Preload("Questions").
		Preload("Responses").
		Find(&surveys).Error

	if err != nil {
		return nil, fmt.Errorf("failed to find all surveys: %w", err)
	}

	// Calculate computed fields for each survey
	for i := range surveys {
		surveys[i].QuestionCount = len(surveys[i].Questions)
		surveys[i].ResponseCount = len(surveys[i].Responses)
	}

	return surveys, nil
}

// FindWithFilter finds surveys with filtering options
func (r *GormSurveyRepository) FindWithFilter(ctx context.Context, filter repositories.SurveyFilter) ([]entities.Survey, error) {
	var surveys []entities.Survey

	query := r.db.WithContext(ctx).
		Preload("Questions").
		Preload("Responses")

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
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	err := query.Find(&surveys).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find surveys with filter: %w", err)
	}

	// Calculate computed fields
	for i := range surveys {
		surveys[i].QuestionCount = len(surveys[i].Questions)
		surveys[i].ResponseCount = len(surveys[i].Responses)
	}

	return surveys, nil
}

// CountWithFilter counts surveys with filtering options
func (r *GormSurveyRepository) CountWithFilter(ctx context.Context, filter repositories.SurveyFilter) (int64, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&entities.Survey{})
	query = r.applyFilters(query, filter)

	err := query.Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count surveys with filter: %w", err)
	}

	return count, nil
}

// applyFilters applies filtering conditions to a query
func (r *GormSurveyRepository) applyFilters(query *gorm.DB, filter repositories.SurveyFilter) *gorm.DB {
	// Search filter
	if filter.Search != "" {
		searchTerm := "%" + strings.ToLower(filter.Search) + "%"
		query = query.Where("LOWER(title) LIKE ? OR LOWER(description) LIKE ?", searchTerm, searchTerm)
	}

	// Status filter
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}

	// Public/private filter
	if filter.IsPublic != nil {
		query = query.Where("is_public = ?", *filter.IsPublic)
	}

	// Creator filter
	if filter.CreatedBy != nil {
		query = query.Where("created_by = ?", *filter.CreatedBy)
	}

	// Date range filters
	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", *filter.EndDate)
	}

	// Active filter
	if filter.IsActive != nil && *filter.IsActive {
		now := time.Now()
		query = query.Where("status = ? AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)",
			entities.SurveyStatusPublished, now, now)
	}

	// Has responses filter
	if filter.HasResponses != nil {
		if *filter.HasResponses {
			query = query.Where("EXISTS (SELECT 1 FROM survey_responses WHERE survey_id = surveys.id)")
		} else {
			query = query.Where("NOT EXISTS (SELECT 1 FROM survey_responses WHERE survey_id = surveys.id)")
		}
	}

	return query
}

// FindByCreator finds surveys by creator
func (r *GormSurveyRepository) FindByCreator(ctx context.Context, creatorID uuid.UUID, limit int) ([]entities.Survey, error) {
	var surveys []entities.Survey

	query := r.db.WithContext(ctx).
		Where("created_by = ?", creatorID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&surveys).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find surveys by creator: %w", err)
	}

	return surveys, nil
}

// FindPublic finds public surveys
func (r *GormSurveyRepository) FindPublic(ctx context.Context, limit int) ([]entities.Survey, error) {
	var surveys []entities.Survey

	query := r.db.WithContext(ctx).
		Where("is_public = ? AND status = ?", true, entities.SurveyStatusPublished).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&surveys).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find public surveys: %w", err)
	}

	return surveys, nil
}

// FindActive finds active surveys
func (r *GormSurveyRepository) FindActive(ctx context.Context, limit int) ([]entities.Survey, error) {
	var surveys []entities.Survey

	now := time.Now()
	query := r.db.WithContext(ctx).
		Where("status = ? AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)",
			entities.SurveyStatusPublished, now, now).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&surveys).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find active surveys: %w", err)
	}

	return surveys, nil
}

// UpdateStatus updates survey status
func (r *GormSurveyRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status entities.SurveyStatus) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	// Set published_at when publishing
	if status == entities.SurveyStatusPublished {
		updates["published_at"] = time.Now()
	}

	result := r.db.WithContext(ctx).
		Model(&entities.Survey{}).
		Where("id = ?", id).
		Updates(updates)

	if result.Error != nil {
		return fmt.Errorf("failed to update survey status: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}

	return nil
}

// Publish publishes a survey
func (r *GormSurveyRepository) Publish(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.SurveyStatusPublished)
}

// Close closes a survey
func (r *GormSurveyRepository) Close(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.SurveyStatusClosed)
}

// Archive archives a survey
func (r *GormSurveyRepository) Archive(ctx context.Context, id uuid.UUID) error {
	return r.UpdateStatus(ctx, id, entities.SurveyStatusArchived)
}

// GetSurveyStats gets comprehensive survey statistics
func (r *GormSurveyRepository) GetSurveyStats(ctx context.Context, id uuid.UUID) (*repositories.SurveyStats, error) {
	var stats repositories.SurveyStats
	stats.SurveyID = id

	// Get question count
	var questionCount int64
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyQuestion{}).
		Where("survey_id = ?", id).
		Count(&questionCount).Error
	stats.QuestionCount = int(questionCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get question count: %w", err)
	}

	// Get response statistics
	var responseStats struct {
		TotalResponses int64   `gorm:"column:total_responses"`
		CompletedCount int64   `gorm:"column:completed_count"`
		SubmittedCount int64   `gorm:"column:submitted_count"`
		AverageTime    float64 `gorm:"column:average_time"`
	}

	err = r.db.WithContext(ctx).
		Model(&entities.SurveyResponse{}).
		Select(`
			COUNT(*) as total_responses,
			COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
			COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_count,
			COALESCE(AVG(CASE WHEN time_spent IS NOT NULL THEN time_spent::DECIMAL / 60 END), 0) as average_time
		`).
		Where("survey_id = ?", id).
		Scan(&responseStats).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get response stats: %w", err)
	}

	stats.ResponseCount = int(responseStats.TotalResponses)
	stats.TotalCompletions = int(responseStats.CompletedCount)
	stats.TotalSubmissions = int(responseStats.SubmittedCount)
	stats.AverageTime = responseStats.AverageTime

	// Calculate completion rate
	if stats.ResponseCount > 0 {
		stats.CompletionRate = float64(stats.TotalCompletions+stats.TotalSubmissions) / float64(stats.ResponseCount) * 100
		stats.DropoffRate = 100 - stats.CompletionRate
	}

	return &stats, nil
}

// GetPopularSurveys gets popular surveys based on response count
func (r *GormSurveyRepository) GetPopularSurveys(ctx context.Context, limit int) ([]entities.Survey, error) {
	var surveys []entities.Survey

	err := r.db.WithContext(ctx).
		Select("surveys.*, COUNT(survey_responses.id) as response_count").
		Joins("LEFT JOIN survey_responses ON surveys.id = survey_responses.survey_id").
		Where("surveys.status = ? AND surveys.is_public = ?", entities.SurveyStatusPublished, true).
		Group("surveys.id").
		Order("response_count DESC, surveys.created_at DESC").
		Limit(limit).
		Find(&surveys).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get popular surveys: %w", err)
	}

	return surveys, nil
}

// GetRecentSurveys gets recently created surveys
func (r *GormSurveyRepository) GetRecentSurveys(ctx context.Context, limit int) ([]entities.Survey, error) {
	var surveys []entities.Survey

	err := r.db.WithContext(ctx).
		Where("status = ? AND is_public = ?", entities.SurveyStatusPublished, true).
		Order("created_at DESC").
		Limit(limit).
		Find(&surveys).Error

	if err != nil {
		return nil, fmt.Errorf("failed to get recent surveys: %w", err)
	}

	return surveys, nil
}

// BulkUpdateStatus updates status for multiple surveys
func (r *GormSurveyRepository) BulkUpdateStatus(ctx context.Context, surveyIDs []uuid.UUID, status entities.SurveyStatus) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	if status == entities.SurveyStatusPublished {
		updates["published_at"] = time.Now()
	}

	err := r.db.WithContext(ctx).
		Model(&entities.Survey{}).
		Where("id IN ?", surveyIDs).
		Updates(updates).Error

	if err != nil {
		return fmt.Errorf("failed to bulk update survey status: %w", err)
	}

	return nil
}

// BulkDelete deletes multiple surveys
func (r *GormSurveyRepository) BulkDelete(ctx context.Context, surveyIDs []uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("id IN ?", surveyIDs).
		Delete(&entities.Survey{}).Error

	if err != nil {
		return fmt.Errorf("failed to bulk delete surveys: %w", err)
	}

	return nil
}
