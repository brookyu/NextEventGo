package repositories

import (
	"context"
	"fmt"
	"strings"
	"time"

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

// GetWithFilters retrieves events with advanced filtering
func (r *GormSiteEventRepository) GetWithFilters(ctx context.Context, filter *repositories.SiteEventFilter) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent

	query := r.db.WithContext(ctx).Model(&entities.SiteEvent{})

	// Apply filters
	query = r.applyFilters(query, filter)

	// Apply sorting
	query = r.applySorting(query, filter)

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Offset(filter.Offset).Limit(filter.Limit)
	}

	err := query.Find(&events).Error
	return events, err
}

// CountWithFilters returns count of events matching filters
func (r *GormSiteEventRepository) CountWithFilters(ctx context.Context, filter *repositories.SiteEventFilter) (int64, error) {
	var count int64

	query := r.db.WithContext(ctx).Model(&entities.SiteEvent{})

	// Apply filters (without pagination and sorting)
	query = r.applyFilters(query, filter)

	err := query.Count(&count).Error
	return count, err
}

// GetByCategory retrieves events by category
func (r *GormSiteEventRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	err := r.db.WithContext(ctx).
		Where("CategoryId = ?", categoryID).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&events).Error
	return events, err
}

// SearchByTitle searches events by title
func (r *GormSiteEventRepository) SearchByTitle(ctx context.Context, searchTerm string, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	searchPattern := fmt.Sprintf("%%%s%%", searchTerm)
	err := r.db.WithContext(ctx).
		Where("EventTitle LIKE ?", searchPattern).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&events).Error
	return events, err
}

// GetByDateRange retrieves events within a date range
func (r *GormSiteEventRepository) GetByDateRange(ctx context.Context, startDate, endDate time.Time, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	err := r.db.WithContext(ctx).
		Where("EventStartDate >= ? AND EventEndDate <= ?", startDate, endDate).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&events).Error
	return events, err
}

// GetByStatus retrieves events by status
func (r *GormSiteEventRepository) GetByStatus(ctx context.Context, status string, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	query := r.db.WithContext(ctx)

	now := time.Now()
	switch status {
	case "upcoming":
		query = query.Where("EventStartDate > ?", now)
	case "active":
		query = query.Where("EventStartDate <= ? AND EventEndDate >= ?", now, now)
	case "completed":
		query = query.Where("EventEndDate < ?", now)
	case "cancelled":
		query = query.Where("IsDeleted = ?", true)
	}

	err := query.
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&events).Error
	return events, err
}

// GetUpcoming retrieves upcoming events
func (r *GormSiteEventRepository) GetUpcoming(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("EventStartDate > ? AND IsDeleted = ?", now, false).
		Offset(offset).
		Limit(limit).
		Order("EventStartDate ASC").
		Find(&events).Error
	return events, err
}

// GetActive retrieves currently active events
func (r *GormSiteEventRepository) GetActive(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("EventStartDate <= ? AND EventEndDate >= ? AND IsDeleted = ?", now, now, false).
		Offset(offset).
		Limit(limit).
		Order("EventStartDate ASC").
		Find(&events).Error
	return events, err
}

// GetCompleted retrieves completed events
func (r *GormSiteEventRepository) GetCompleted(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error) {
	var events []*entities.SiteEvent
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("EventEndDate < ? AND IsDeleted = ?", now, false).
		Offset(offset).
		Limit(limit).
		Order("EventEndDate DESC").
		Find(&events).Error
	return events, err
}

// Helper methods for filtering and sorting

// applyFilters applies filtering conditions to the query
func (r *GormSiteEventRepository) applyFilters(query *gorm.DB, filter *repositories.SiteEventFilter) *gorm.DB {
	// Include/exclude deleted records
	if !filter.IncludeDeleted {
		query = query.Where("IsDeleted = ?", false)
	}

	// Category filter
	if filter.CategoryID != nil {
		query = query.Where("CategoryId = ?", *filter.CategoryID)
	}

	// Search term filter
	if filter.SearchTerm != "" {
		searchPattern := fmt.Sprintf("%%%s%%", filter.SearchTerm)
		query = query.Where("EventTitle LIKE ? OR Tags LIKE ?", searchPattern, searchPattern)
	}

	// Current status filter
	if filter.IsCurrent != nil {
		query = query.Where("IsCurrent = ?", *filter.IsCurrent)
	}

	// Status filter
	if filter.Status != "" {
		now := time.Now()
		switch filter.Status {
		case "upcoming":
			query = query.Where("EventStartDate > ?", now)
		case "active":
			query = query.Where("EventStartDate <= ? AND EventEndDate >= ?", now, now)
		case "completed":
			query = query.Where("EventEndDate < ?", now)
		case "cancelled":
			query = query.Where("IsDeleted = ?", true)
		}
	}

	// Date range filters
	if filter.StartDateFrom != nil {
		query = query.Where("EventStartDate >= ?", *filter.StartDateFrom)
	}
	if filter.StartDateTo != nil {
		query = query.Where("EventStartDate <= ?", *filter.StartDateTo)
	}

	return query
}

// applySorting applies sorting to the query
func (r *GormSiteEventRepository) applySorting(query *gorm.DB, filter *repositories.SiteEventFilter) *gorm.DB {
	sortBy := filter.SortBy
	sortOrder := filter.SortOrder

	// Default sorting
	if sortBy == "" {
		sortBy = "createdAt"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	// Map sort fields to database columns
	var orderClause string
	switch strings.ToLower(sortBy) {
	case "title":
		orderClause = "EventTitle"
	case "startdate":
		orderClause = "EventStartDate"
	case "enddate":
		orderClause = "EventEndDate"
	case "createdat":
		orderClause = "CreationTime"
	default:
		orderClause = "CreationTime"
	}

	// Add sort order
	if strings.ToLower(sortOrder) == "asc" {
		orderClause += " ASC"
	} else {
		orderClause += " DESC"
	}

	return query.Order(orderClause)
}
