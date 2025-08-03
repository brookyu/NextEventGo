package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormSiteEventRepository implements SiteEventRepository using GORM
type GormSiteEventRepository struct {
	db *gorm.DB
}

// NewGormSiteEventRepository creates a new GORM-based site event repository
func NewGormSiteEventRepository(db *gorm.DB) repositories.SiteEventRepository {
	return &GormSiteEventRepository{db: db}
}

// Create creates a new site event
func (r *GormSiteEventRepository) Create(ctx context.Context, event *entities.SiteEvent) error {
	return r.db.WithContext(ctx).Create(event).Error
}

// GetByID retrieves a site event by ID
func (r *GormSiteEventRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.SiteEvent, error) {
	var event entities.SiteEvent
	err := r.db.WithContext(ctx).First(&event, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// GetAll retrieves all site events with pagination
func (r *GormSiteEventRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	err := r.db.WithContext(ctx).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&events).Error
	return events, err
}

// GetCurrent retrieves the current active event
func (r *GormSiteEventRepository) GetCurrent(ctx context.Context) (*entities.SiteEvent, error) {
	var event entities.SiteEvent
	err := r.db.WithContext(ctx).
		Where("IsCurrent = ?", true).
		First(&event).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// GetByInteractionCode retrieves an event by interaction code
func (r *GormSiteEventRepository) GetByInteractionCode(ctx context.Context, code string) (*entities.SiteEvent, error) {
	var event entities.SiteEvent
	err := r.db.WithContext(ctx).
		Where("InteractionCode = ?", code).
		First(&event).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// Update updates an existing site event
func (r *GormSiteEventRepository) Update(ctx context.Context, event *entities.SiteEvent) error {
	return r.db.WithContext(ctx).Save(event).Error
}

// Delete soft deletes a site event
func (r *GormSiteEventRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.SiteEvent{}, "id = ?", id).Error
}

// SetCurrent sets an event as the current active event
func (r *GormSiteEventRepository) SetCurrent(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, set all events to not current
		if err := tx.Model(&entities.SiteEvent{}).
			Where("IsCurrent = ?", true).
			Update("IsCurrent", false).Error; err != nil {
			return err
		}

		// Then set the specified event as current
		return tx.Model(&entities.SiteEvent{}).
			Where("Id = ?", id).
			Update("IsCurrent", true).Error
	})
}

// Count returns the total number of events
func (r *GormSiteEventRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.SiteEvent{}).Count(&count).Error
	return count, err
}
