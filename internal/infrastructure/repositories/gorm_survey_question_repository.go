package repositories

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// GormSurveyQuestionRepository implements SurveyQuestionRepository using GORM
type GormSurveyQuestionRepository struct {
	db *gorm.DB
}

// NewGormSurveyQuestionRepository creates a new GORM survey question repository
func NewGormSurveyQuestionRepository(db *gorm.DB) repositories.SurveyQuestionRepository {
	return &GormSurveyQuestionRepository{db: db}
}

// Create creates a new survey question
func (r *GormSurveyQuestionRepository) Create(ctx context.Context, question *entities.SurveyQuestion) error {
	if err := r.db.WithContext(ctx).Create(question).Error; err != nil {
		return fmt.Errorf("failed to create survey question: %w", err)
	}
	return nil
}

// FindByID finds a survey question by ID
func (r *GormSurveyQuestionRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyQuestion, error) {
	var question entities.SurveyQuestion
	err := r.db.WithContext(ctx).
		Preload("Survey").
		Preload("Answers").
		First(&question, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey question: %w", err)
	}
	
	// Calculate computed fields
	question.ResponseCount = len(question.Answers)
	
	return &question, nil
}

// Update updates an existing survey question
func (r *GormSurveyQuestionRepository) Update(ctx context.Context, question *entities.SurveyQuestion) error {
	if err := r.db.WithContext(ctx).Save(question).Error; err != nil {
		return fmt.Errorf("failed to update survey question: %w", err)
	}
	return nil
}

// Delete deletes a survey question by ID
func (r *GormSurveyQuestionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SurveyQuestion{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey question: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindBySurveyID finds all questions for a survey
func (r *GormSurveyQuestionRepository) FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error) {
	var questions []entities.SurveyQuestion
	err := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		Order("\"order\" ASC").
		Find(&questions).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find questions by survey ID: %w", err)
	}
	
	return questions, nil
}

// FindWithFilter finds questions with filtering options
func (r *GormSurveyQuestionRepository) FindWithFilter(ctx context.Context, filter repositories.SurveyQuestionFilter) ([]entities.SurveyQuestion, error) {
	var questions []entities.SurveyQuestion
	
	query := r.db.WithContext(ctx).Preload("Survey").Preload("Answers")
	
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
		query = query.Order("\"order\" ASC")
	}
	
	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}
	
	err := query.Find(&questions).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find questions with filter: %w", err)
	}
	
	// Calculate computed fields
	for i := range questions {
		questions[i].ResponseCount = len(questions[i].Answers)
	}
	
	return questions, nil
}

// applyFilters applies filtering conditions to a query
func (r *GormSurveyQuestionRepository) applyFilters(query *gorm.DB, filter repositories.SurveyQuestionFilter) *gorm.DB {
	// Survey ID filter
	if filter.SurveyID != uuid.Nil {
		query = query.Where("survey_id = ?", filter.SurveyID)
	}
	
	// Question type filter
	if filter.QuestionType != "" {
		query = query.Where("question_type = ?", filter.QuestionType)
	}
	
	// Required filter
	if filter.IsRequired != nil {
		query = query.Where("is_required = ?", *filter.IsRequired)
	}
	
	// Order filter
	if filter.Order != nil {
		query = query.Where("\"order\" = ?", *filter.Order)
	}
	
	return query
}

// CountBySurveyID counts questions for a survey
func (r *GormSurveyQuestionRepository) CountBySurveyID(ctx context.Context, surveyID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyQuestion{}).
		Where("survey_id = ?", surveyID).
		Count(&count).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to count questions by survey ID: %w", err)
	}
	
	return count, nil
}

// FindByType finds questions by type
func (r *GormSurveyQuestionRepository) FindByType(ctx context.Context, questionType entities.QuestionType, limit int) ([]entities.SurveyQuestion, error) {
	var questions []entities.SurveyQuestion
	
	query := r.db.WithContext(ctx).
		Where("question_type = ?", questionType).
		Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&questions).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find questions by type: %w", err)
	}
	
	return questions, nil
}

// UpdateOrder updates the order of a question
func (r *GormSurveyQuestionRepository) UpdateOrder(ctx context.Context, id uuid.UUID, order int) error {
	result := r.db.WithContext(ctx).
		Model(&entities.SurveyQuestion{}).
		Where("id = ?", id).
		Update("\"order\"", order)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update question order: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// ReorderQuestions reorders multiple questions
func (r *GormSurveyQuestionRepository) ReorderQuestions(ctx context.Context, surveyID uuid.UUID, questionOrders map[uuid.UUID]int) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for questionID, order := range questionOrders {
			if err := tx.Model(&entities.SurveyQuestion{}).
				Where("id = ? AND survey_id = ?", questionID, surveyID).
				Update("\"order\"", order).Error; err != nil {
				return fmt.Errorf("failed to update order for question %s: %w", questionID, err)
			}
		}
		return nil
	})
}

// GetNextOrder gets the next order number for a survey
func (r *GormSurveyQuestionRepository) GetNextOrder(ctx context.Context, surveyID uuid.UUID) (int, error) {
	var maxOrder int
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyQuestion{}).
		Where("survey_id = ?", surveyID).
		Select("COALESCE(MAX(\"order\"), 0)").
		Scan(&maxOrder).Error
	
	if err != nil {
		return 0, fmt.Errorf("failed to get next order: %w", err)
	}
	
	return maxOrder + 1, nil
}

// BulkCreate creates multiple questions
func (r *GormSurveyQuestionRepository) BulkCreate(ctx context.Context, questions []entities.SurveyQuestion) error {
	if len(questions) == 0 {
		return nil
	}
	
	if err := r.db.WithContext(ctx).Create(&questions).Error; err != nil {
		return fmt.Errorf("failed to bulk create questions: %w", err)
	}
	
	return nil
}

// BulkUpdate updates multiple questions
func (r *GormSurveyQuestionRepository) BulkUpdate(ctx context.Context, questions []entities.SurveyQuestion) error {
	if len(questions) == 0 {
		return nil
	}
	
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, question := range questions {
			if err := tx.Save(&question).Error; err != nil {
				return fmt.Errorf("failed to update question %s: %w", question.ID, err)
			}
		}
		return nil
	})
}

// BulkDelete deletes multiple questions
func (r *GormSurveyQuestionRepository) BulkDelete(ctx context.Context, questionIDs []uuid.UUID) error {
	if len(questionIDs) == 0 {
		return nil
	}
	
	err := r.db.WithContext(ctx).
		Where("id IN ?", questionIDs).
		Delete(&entities.SurveyQuestion{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to bulk delete questions: %w", err)
	}
	
	return nil
}

// DeleteBySurveyID deletes all questions for a survey
func (r *GormSurveyQuestionRepository) DeleteBySurveyID(ctx context.Context, surveyID uuid.UUID) error {
	err := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		Delete(&entities.SurveyQuestion{}).Error
	
	if err != nil {
		return fmt.Errorf("failed to delete questions by survey ID: %w", err)
	}
	
	return nil
}

// FindRequiredQuestions finds required questions for a survey
func (r *GormSurveyQuestionRepository) FindRequiredQuestions(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error) {
	var questions []entities.SurveyQuestion
	err := r.db.WithContext(ctx).
		Where("survey_id = ? AND is_required = ?", surveyID, true).
		Order("\"order\" ASC").
		Find(&questions).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find required questions: %w", err)
	}
	
	return questions, nil
}

// FindOptionalQuestions finds optional questions for a survey
func (r *GormSurveyQuestionRepository) FindOptionalQuestions(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error) {
	var questions []entities.SurveyQuestion
	err := r.db.WithContext(ctx).
		Where("survey_id = ? AND is_required = ?", surveyID, false).
		Order("\"order\" ASC").
		Find(&questions).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find optional questions: %w", err)
	}
	
	return questions, nil
}

// GetQuestionTypeStats gets statistics about question types in a survey
func (r *GormSurveyQuestionRepository) GetQuestionTypeStats(ctx context.Context, surveyID uuid.UUID) (map[entities.QuestionType]int, error) {
	var results []struct {
		QuestionType entities.QuestionType `gorm:"column:question_type"`
		Count        int                   `gorm:"column:count"`
	}
	
	err := r.db.WithContext(ctx).
		Model(&entities.SurveyQuestion{}).
		Select("question_type, COUNT(*) as count").
		Where("survey_id = ?", surveyID).
		Group("question_type").
		Scan(&results).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get question type stats: %w", err)
	}
	
	stats := make(map[entities.QuestionType]int)
	for _, result := range results {
		stats[result.QuestionType] = result.Count
	}
	
	return stats, nil
}
