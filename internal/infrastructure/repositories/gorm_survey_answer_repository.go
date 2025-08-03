package repositories

import (
	"context"
	"fmt"
	"math"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormSurveyAnswerRepository implements SurveyAnswerRepository using GORM
type GormSurveyAnswerRepository struct {
	db *gorm.DB
}

// NewGormSurveyAnswerRepository creates a new GORM survey answer repository
func NewGormSurveyAnswerRepository(db *gorm.DB) repositories.SurveyAnswerRepository {
	return &GormSurveyAnswerRepository{db: db}
}

// Create creates a new survey answer
func (r *GormSurveyAnswerRepository) Create(ctx context.Context, answer *entities.SurveyAnswer) error {
	if err := r.db.WithContext(ctx).Create(answer).Error; err != nil {
		return fmt.Errorf("failed to create survey answer: %w", err)
	}
	return nil
}

// FindByID finds a survey answer by ID
func (r *GormSurveyAnswerRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyAnswer, error) {
	var answer entities.SurveyAnswer
	err := r.db.WithContext(ctx).
		Preload("Response").
		Preload("Question").
		First(&answer, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey answer: %w", err)
	}
	
	return &answer, nil
}

// Update updates an existing survey answer
func (r *GormSurveyAnswerRepository) Update(ctx context.Context, answer *entities.SurveyAnswer) error {
	if err := r.db.WithContext(ctx).Save(answer).Error; err != nil {
		return fmt.Errorf("failed to update survey answer: %w", err)
	}
	return nil
}

// Delete deletes a survey answer by ID
func (r *GormSurveyAnswerRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SurveyAnswer{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey answer: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindByResponseID finds all answers for a response
func (r *GormSurveyAnswerRepository) FindByResponseID(ctx context.Context, responseID uuid.UUID) ([]entities.SurveyAnswer, error) {
	var answers []entities.SurveyAnswer
	err := r.db.WithContext(ctx).
		Preload("Question").
		Where("response_id = ?", responseID).
		Order("created_at ASC").
		Find(&answers).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find answers by response ID: %w", err)
	}
	
	return answers, nil
}

// FindByQuestionID finds all answers for a question
func (r *GormSurveyAnswerRepository) FindByQuestionID(ctx context.Context, questionID uuid.UUID) ([]entities.SurveyAnswer, error) {
	var answers []entities.SurveyAnswer
	err := r.db.WithContext(ctx).
		Preload("Response").
		Where("question_id = ?", questionID).
		Order("created_at ASC").
		Find(&answers).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find answers by question ID: %w", err)
	}
	
	return answers, nil
}

// FindWithFilter finds answers with filtering options
func (r *GormSurveyAnswerRepository) FindWithFilter(ctx context.Context, filter repositories.SurveyAnswerFilter) ([]entities.SurveyAnswer, error) {
	var answers []entities.SurveyAnswer
	
	query := r.db.WithContext(ctx).
		Preload("Response").
		Preload("Question")
	
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
		query = query.Order("created_at ASC")
	}
	
	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	
	err := query.Find(&answers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find answers with filter: %w", err)
	}
	
	return answers, nil
}

// CountWithFilter counts answers with filtering options
func (r *GormSurveyAnswerRepository) CountWithFilter(ctx context.Context, filter repositories.SurveyAnswerFilter) (int64, error) {
	var count int64
	
	query := r.db.WithContext(ctx).Model(&entities.SurveyAnswer{})
	query = r.applyFilters(query, filter)
	
	err := query.Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("failed to count answers with filter: %w", err)
	}
	
	return count, nil
}

// applyFilters applies filtering conditions to a query
func (r *GormSurveyAnswerRepository) applyFilters(query *gorm.DB, filter repositories.SurveyAnswerFilter) *gorm.DB {
	// Response ID filter
	if filter.ResponseID != uuid.Nil {
		query = query.Where("response_id = ?", filter.ResponseID)
	}
	
	// Question ID filter
	if filter.QuestionID != uuid.Nil {
		query = query.Where("question_id = ?", filter.QuestionID)
	}
	
	// Survey ID filter (through join)
	if filter.SurveyID != uuid.Nil {
		query = query.Joins("JOIN survey_responses ON survey_answers.response_id = survey_responses.id").
			Where("survey_responses.survey_id = ?", filter.SurveyID)
	}
	
	// Skipped filter
	if filter.IsSkipped != nil {
		query = query.Where("is_skipped = ?", *filter.IsSkipped)
	}
	
	// Has value filter
	if filter.HasValue != nil {
		if *filter.HasValue {
			query = query.Where(`
				is_skipped = false AND (
					answer_text IS NOT NULL AND answer_text != '' OR
					answer_number IS NOT NULL OR
					answer_date IS NOT NULL OR
					answer_bool IS NOT NULL OR
					answer_array IS NOT NULL AND array_length(answer_array, 1) > 0 OR
					answer_json IS NOT NULL AND answer_json != ''
				)
			`)
		} else {
			query = query.Where(`
				is_skipped = true OR (
					(answer_text IS NULL OR answer_text = '') AND
					answer_number IS NULL AND
					answer_date IS NULL AND
					answer_bool IS NULL AND
					(answer_array IS NULL OR array_length(answer_array, 1) = 0) AND
					(answer_json IS NULL OR answer_json = '')
				)
			`)
		}
	}
	
	// Answer type filter
	if filter.AnswerType != "" {
		switch filter.AnswerType {
		case "text":
			query = query.Where("answer_text IS NOT NULL AND answer_text != ''")
		case "number":
			query = query.Where("answer_number IS NOT NULL")
		case "date":
			query = query.Where("answer_date IS NOT NULL")
		case "bool":
			query = query.Where("answer_bool IS NOT NULL")
		case "array":
			query = query.Where("answer_array IS NOT NULL AND array_length(answer_array, 1) > 0")
		case "json":
			query = query.Where("answer_json IS NOT NULL AND answer_json != ''")
		}
	}
	
	return query
}

// Question type specific operations

// FindTextAnswers finds all text answers for a question
func (r *GormSurveyAnswerRepository) FindTextAnswers(ctx context.Context, questionID uuid.UUID) ([]string, error) {
	var answers []string
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select("answer_text").
		Where("question_id = ? AND answer_text IS NOT NULL AND answer_text != '' AND is_skipped = false", questionID).
		Pluck("answer_text", &answers).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find text answers: %w", err)
	}
	
	return answers, nil
}

// FindNumericAnswers finds all numeric answers for a question
func (r *GormSurveyAnswerRepository) FindNumericAnswers(ctx context.Context, questionID uuid.UUID) ([]float64, error) {
	var answers []float64
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select("answer_number").
		Where("question_id = ? AND answer_number IS NOT NULL AND is_skipped = false", questionID).
		Pluck("answer_number", &answers).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find numeric answers: %w", err)
	}
	
	return answers, nil
}

// FindChoiceAnswers finds choice distribution for a question
func (r *GormSurveyAnswerRepository) FindChoiceAnswers(ctx context.Context, questionID uuid.UUID) (map[string]int, error) {
	// For single choice questions (radio, dropdown)
	var singleChoices []struct {
		AnswerText string `gorm:"column:answer_text"`
		Count      int    `gorm:"column:count"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select("answer_text, COUNT(*) as count").
		Where("question_id = ? AND answer_text IS NOT NULL AND answer_text != '' AND is_skipped = false", questionID).
		Group("answer_text").
		Scan(&singleChoices).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find choice answers: %w", err)
	}
	
	distribution := make(map[string]int)
	for _, choice := range singleChoices {
		distribution[choice.AnswerText] = choice.Count
	}
	
	// For multiple choice questions (checkbox), we need to unnest arrays
	var multipleChoices []struct {
		Choice string `gorm:"column:choice"`
		Count  int    `gorm:"column:count"`
	}
	
	err = r.db.WithContext(ctx).
		Raw(`
			SELECT unnest(answer_array) as choice, COUNT(*) as count
			FROM survey_answers
			WHERE question_id = ? AND answer_array IS NOT NULL AND array_length(answer_array, 1) > 0 AND is_skipped = false
			GROUP BY choice
		`, questionID).
		Scan(&multipleChoices).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find multiple choice answers: %w", err)
	}
	
	// Merge multiple choice results
	for _, choice := range multipleChoices {
		distribution[choice.Choice] += choice.Count
	}
	
	return distribution, nil
}

// FindRatingAnswers finds all rating answers for a question
func (r *GormSurveyAnswerRepository) FindRatingAnswers(ctx context.Context, questionID uuid.UUID) ([]float64, error) {
	return r.FindNumericAnswers(ctx, questionID)
}

// Analytics operations

// GetAnswerStats gets comprehensive answer statistics
func (r *GormSurveyAnswerRepository) GetAnswerStats(ctx context.Context, questionID uuid.UUID) (*repositories.AnswerStats, error) {
	var stats repositories.AnswerStats
	stats.QuestionID = questionID
	
	// Get answer counts
	var counts struct {
		TotalAnswers  int64 `gorm:"column:total_answers"`
		SkippedCount  int64 `gorm:"column:skipped_count"`
		UniqueAnswers int64 `gorm:"column:unique_answers"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select(`
			COUNT(*) as total_answers,
			COUNT(CASE WHEN is_skipped = true THEN 1 END) as skipped_count,
			COUNT(DISTINCT CASE 
				WHEN answer_text IS NOT NULL AND answer_text != '' THEN answer_text
				WHEN answer_number IS NOT NULL THEN answer_number::text
				WHEN answer_bool IS NOT NULL THEN answer_bool::text
				WHEN answer_date IS NOT NULL THEN answer_date::text
			END) as unique_answers
		`).
		Where("question_id = ?", questionID).
		Scan(&counts).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get answer counts: %w", err)
	}
	
	stats.TotalAnswers = int(counts.TotalAnswers)
	stats.SkippedCount = int(counts.SkippedCount)
	stats.UniqueAnswers = int(counts.UniqueAnswers)
	
	// Calculate rates
	if stats.TotalAnswers > 0 {
		stats.SkipRate = float64(stats.SkippedCount) / float64(stats.TotalAnswers) * 100
		stats.ResponseRate = 100 - stats.SkipRate
	}
	
	return &stats, nil
}

// GetChoiceDistribution gets choice distribution for a question
func (r *GormSurveyAnswerRepository) GetChoiceDistribution(ctx context.Context, questionID uuid.UUID) (map[string]int, error) {
	return r.FindChoiceAnswers(ctx, questionID)
}

// GetNumericStats gets numeric statistics for a question
func (r *GormSurveyAnswerRepository) GetNumericStats(ctx context.Context, questionID uuid.UUID) (*repositories.NumericStats, error) {
	var stats repositories.NumericStats
	
	// Get basic numeric statistics
	var basicStats struct {
		Count   int64   `gorm:"column:count"`
		Sum     float64 `gorm:"column:sum"`
		Average float64 `gorm:"column:average"`
		Min     float64 `gorm:"column:min"`
		Max     float64 `gorm:"column:max"`
		StdDev  float64 `gorm:"column:stddev"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select(`
			COUNT(answer_number) as count,
			COALESCE(SUM(answer_number), 0) as sum,
			COALESCE(AVG(answer_number), 0) as average,
			COALESCE(MIN(answer_number), 0) as min,
			COALESCE(MAX(answer_number), 0) as max,
			COALESCE(STDDEV(answer_number), 0) as stddev
		`).
		Where("question_id = ? AND answer_number IS NOT NULL AND is_skipped = false", questionID).
		Scan(&basicStats).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get numeric stats: %w", err)
	}
	
	stats.Count = int(basicStats.Count)
	stats.Sum = basicStats.Sum
	stats.Average = basicStats.Average
	stats.Min = basicStats.Min
	stats.Max = basicStats.Max
	stats.StdDev = basicStats.StdDev
	stats.Variance = math.Pow(basicStats.StdDev, 2)
	
	// Get median
	var median float64
	err = r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select("PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY answer_number)").
		Where("question_id = ? AND answer_number IS NOT NULL AND is_skipped = false", questionID).
		Scan(&median).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get median: %w", err)
	}
	
	stats.Median = median
	
	return &stats, nil
}

// GetSkipRate gets the skip rate for a question
func (r *GormSurveyAnswerRepository) GetSkipRate(ctx context.Context, questionID uuid.UUID) (float64, error) {
	var result struct {
		TotalAnswers   int64 `gorm:"column:total_answers"`
		SkippedAnswers int64 `gorm:"column:skipped_answers"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyAnswer{}).
		Select(`
			COUNT(*) as total_answers,
			COUNT(CASE WHEN is_skipped = true THEN 1 END) as skipped_answers
		`).
		Where("question_id = ?", questionID).
		Scan(&result).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to get skip rate: %w", err)
	}
	
	if result.TotalAnswers == 0 {
		return 0, nil
	}
	
	return float64(result.SkippedAnswers) / float64(result.TotalAnswers) * 100, nil
}

// Bulk operations

// BulkCreate creates multiple answers
func (r *GormSurveyAnswerRepository) BulkCreate(ctx context.Context, answers []entities.SurveyAnswer) error {
	if len(answers) == 0 {
		return nil
	}
	
	if err := r.db.WithContext(ctx).Create(&answers).Error; err != nil {
		return fmt.Errorf("failed to bulk create answers: %w", err)
	}
	
	return nil
}

// BulkUpdate updates multiple answers
func (r *GormSurveyAnswerRepository) BulkUpdate(ctx context.Context, answers []entities.SurveyAnswer) error {
	if len(answers) == 0 {
		return nil
	}
	
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, answer := range answers {
			if err := tx.Save(&answer).Error; err != nil {
				return fmt.Errorf("failed to update answer %s: %w", answer.ID, err)
			}
		}
		return nil
	})
}

// BulkDelete deletes multiple answers
func (r *GormSurveyAnswerRepository) BulkDelete(ctx context.Context, answerIDs []uuid.UUID) error {
	if len(answerIDs) == 0 {
		return nil
	}
	
	err := r.db.WithContext(ctx).
		Where("id IN ?", answerIDs).
		Delete(&entities.SurveyAnswer{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk delete answers: %w", err)
	}
	
	return nil
}

// DeleteByResponseID deletes all answers for a response
func (r *GormSurveyAnswerRepository) DeleteByResponseID(ctx context.Context, responseID uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("response_id = ?", responseID).
		Delete(&entities.SurveyAnswer{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to delete answers by response ID: %w", err)
	}
	
	return nil
}

// DeleteByQuestionID deletes all answers for a question
func (r *GormSurveyAnswerRepository) DeleteByQuestionID(ctx context.Context, questionID uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("question_id = ?", questionID).
		Delete(&entities.SurveyAnswer{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to delete answers by question ID: %w", err)
	}
	
	return nil
}
