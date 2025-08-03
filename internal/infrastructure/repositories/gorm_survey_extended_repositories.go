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

// GormSurveyTemplateRepository implements SurveyTemplateRepository using GORM
type GormSurveyTemplateRepository struct {
	db *gorm.DB
}

// NewGormSurveyTemplateRepository creates a new GORM survey template repository
func NewGormSurveyTemplateRepository(db *gorm.DB) repositories.SurveyTemplateRepository {
	return &GormSurveyTemplateRepository{db: db}
}

// Create creates a new survey template
func (r *GormSurveyTemplateRepository) Create(ctx context.Context, template *entities.SurveyTemplate) error {
	if err := r.db.WithContext(ctx).Create(template).Error; err != nil {
		return fmt.Errorf("failed to create survey template: %w", err)
	}
	return nil
}

// FindByID finds a survey template by ID
func (r *GormSurveyTemplateRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyTemplate, error) {
	var template entities.SurveyTemplate
	err := r.db.WithContext(ctx).
		Preload("Questions").
		First(&template, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey template: %w", err)
	}
	
	return &template, nil
}

// Update updates an existing survey template
func (r *GormSurveyTemplateRepository) Update(ctx context.Context, template *entities.SurveyTemplate) error {
	if err := r.db.WithContext(ctx).Save(template).Error; err != nil {
		return fmt.Errorf("failed to update survey template: %w", err)
	}
	return nil
}

// Delete deletes a survey template by ID
func (r *GormSurveyTemplateRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SurveyTemplate{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey template: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindAll finds all survey templates
func (r *GormSurveyTemplateRepository) FindAll(ctx context.Context) ([]entities.SurveyTemplate, error) {
	var templates []entities.SurveyTemplate
	err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Find(&templates).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find all survey templates: %w", err)
	}
	
	return templates, nil
}

// FindByCategory finds templates by category
func (r *GormSurveyTemplateRepository) FindByCategory(ctx context.Context, category string) ([]entities.SurveyTemplate, error) {
	var templates []entities.SurveyTemplate
	err := r.db.WithContext(ctx).
		Where("category = ?", category).
		Order("usage_count DESC, created_at DESC").
		Find(&templates).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find templates by category: %w", err)
	}
	
	return templates, nil
}

// FindPublic finds public templates
func (r *GormSurveyTemplateRepository) FindPublic(ctx context.Context, limit int) ([]entities.SurveyTemplate, error) {
	var templates []entities.SurveyTemplate
	
	query := r.db.WithContext(ctx).
		Where("is_public = ?", true).
		Order("usage_count DESC, rating DESC, created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&templates).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find public templates: %w", err)
	}
	
	return templates, nil
}

// FindPopular finds popular templates
func (r *GormSurveyTemplateRepository) FindPopular(ctx context.Context, limit int) ([]entities.SurveyTemplate, error) {
	var templates []entities.SurveyTemplate
	
	query := r.db.WithContext(ctx).
		Order("usage_count DESC, rating DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	
	err := query.Find(&templates).Error
	if err != nil {
		return nil, fmt.Errorf("failed to find popular templates: %w", err)
	}
	
	return templates, nil
}

// IncrementUsage increments the usage count for a template
func (r *GormSurveyTemplateRepository) IncrementUsage(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).
		Model(&entities.SurveyTemplate{}).
		Where("id = ?", id).
		Update("usage_count", gorm.Expr("usage_count + 1"))
	
	if result.Error != nil {
		return fmt.Errorf("failed to increment template usage: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// GormSurveyAnalyticsRepository implements SurveyAnalyticsRepository using GORM
type GormSurveyAnalyticsRepository struct {
	db *gorm.DB
}

// NewGormSurveyAnalyticsRepository creates a new GORM survey analytics repository
func NewGormSurveyAnalyticsRepository(db *gorm.DB) repositories.SurveyAnalyticsRepository {
	return &GormSurveyAnalyticsRepository{db: db}
}

// Create creates a new survey analytics record
func (r *GormSurveyAnalyticsRepository) Create(ctx context.Context, analytics *entities.SurveyAnalytics) error {
	if err := r.db.WithContext(ctx).Create(analytics).Error; err != nil {
		return fmt.Errorf("failed to create survey analytics: %w", err)
	}
	return nil
}

// FindBySurveyID finds analytics by survey ID
func (r *GormSurveyAnalyticsRepository) FindBySurveyID(ctx context.Context, surveyID uuid.UUID) (*entities.SurveyAnalytics, error) {
	var analytics entities.SurveyAnalytics
	err := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		First(&analytics).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey analytics: %w", err)
	}
	
	return &analytics, nil
}

// Update updates existing survey analytics
func (r *GormSurveyAnalyticsRepository) Update(ctx context.Context, analytics *entities.SurveyAnalytics) error {
	if err := r.db.WithContext(ctx).Save(analytics).Error; err != nil {
		return fmt.Errorf("failed to update survey analytics: %w", err)
	}
	return nil
}

// Delete deletes survey analytics
func (r *GormSurveyAnalyticsRepository) Delete(ctx context.Context, surveyID uuid.UUID) error {
	result := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		Delete(&entities.SurveyAnalytics{})
	
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey analytics: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// UpdateMetrics updates specific metrics
func (r *GormSurveyAnalyticsRepository) UpdateMetrics(ctx context.Context, surveyID uuid.UUID, metrics map[string]interface{}) error {
	metrics["last_calculated"] = time.Now()
	
	result := r.db.WithContext(ctx).
		Model(&entities.SurveyAnalytics{}).
		Where("survey_id = ?", surveyID).
		Updates(metrics)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update analytics metrics: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// GetTrendData gets trend data for a survey
func (r *GormSurveyAnalyticsRepository) GetTrendData(ctx context.Context, surveyID uuid.UUID, days int) ([]repositories.TrendPoint, error) {
	var trendPoints []repositories.TrendPoint
	
	// This would typically involve a more complex query with date grouping
	// For now, return empty slice as this would require additional tracking tables
	// In a real implementation, you would have daily/hourly analytics snapshots
	
	return trendPoints, nil
}

// GormSurveyShareRepository implements SurveyShareRepository using GORM
type GormSurveyShareRepository struct {
	db *gorm.DB
}

// NewGormSurveyShareRepository creates a new GORM survey share repository
func NewGormSurveyShareRepository(db *gorm.DB) repositories.SurveyShareRepository {
	return &GormSurveyShareRepository{db: db}
}

// Create creates a new survey share
func (r *GormSurveyShareRepository) Create(ctx context.Context, share *entities.SurveyShare) error {
	if err := r.db.WithContext(ctx).Create(share).Error; err != nil {
		return fmt.Errorf("failed to create survey share: %w", err)
	}
	return nil
}

// FindByID finds a survey share by ID
func (r *GormSurveyShareRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyShare, error) {
	var share entities.SurveyShare
	err := r.db.WithContext(ctx).
		Preload("Survey").
		First(&share, "id = ?", id).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find survey share: %w", err)
	}
	
	return &share, nil
}

// Update updates an existing survey share
func (r *GormSurveyShareRepository) Update(ctx context.Context, share *entities.SurveyShare) error {
	if err := r.db.WithContext(ctx).Save(share).Error; err != nil {
		return fmt.Errorf("failed to update survey share: %w", err)
	}
	return nil
}

// Delete deletes a survey share by ID
func (r *GormSurveyShareRepository) Delete(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).Delete(&entities.SurveyShare{}, "id = ?", id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete survey share: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	return nil
}

// FindBySurveyID finds all shares for a survey
func (r *GormSurveyShareRepository) FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyShare, error) {
	var shares []entities.SurveyShare
	err := r.db.WithContext(ctx).
		Where("survey_id = ?", surveyID).
		Order("created_at DESC").
		Find(&shares).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find shares by survey ID: %w", err)
	}
	
	return shares, nil
}

// FindByURL finds a share by URL
func (r *GormSurveyShareRepository) FindByURL(ctx context.Context, url string) (*entities.SurveyShare, error) {
	var share entities.SurveyShare
	err := r.db.WithContext(ctx).
		Preload("Survey").
		Where("share_url = ?", url).
		First(&share).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, repositories.ErrNotFound
		}
		return nil, fmt.Errorf("failed to find share by URL: %w", err)
	}
	
	return &share, nil
}

// IncrementAccess increments the access count for a share
func (r *GormSurveyShareRepository) IncrementAccess(ctx context.Context, id uuid.UUID) error {
	result := r.db.WithContext(ctx).
		Model(&entities.SurveyShare{}).
		Where("id = ?", id).
		Update("access_count", gorm.Expr("access_count + 1"))
	
	if result.Error != nil {
		return fmt.Errorf("failed to increment share access: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return repositories.ErrNotFound
	}
	
	return nil
}

// FindActive finds active shares for a survey
func (r *GormSurveyShareRepository) FindActive(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyShare, error) {
	var shares []entities.SurveyShare
	
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("survey_id = ? AND is_active = ? AND (expires_at IS NULL OR expires_at > ?)", 
			surveyID, true, now).
		Order("created_at DESC").
		Find(&shares).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to find active shares: %w", err)
	}
	
	return shares, nil
}
