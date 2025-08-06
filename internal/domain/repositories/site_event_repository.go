package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// SiteEventRepository defines the interface for SiteEvent data operations
type SiteEventRepository interface {
	// Create creates a new site event
	Create(ctx context.Context, event *entities.SiteEvent) error

	// GetByID retrieves a site event by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.SiteEvent, error)

	// GetAll retrieves all site events with pagination
	GetAll(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error)

	// GetCurrent retrieves the current active event
	GetCurrent(ctx context.Context) (*entities.SiteEvent, error)

	// GetByInteractionCode retrieves an event by interaction code
	GetByInteractionCode(ctx context.Context, code string) (*entities.SiteEvent, error)

	// Update updates an existing site event
	Update(ctx context.Context, event *entities.SiteEvent) error

	// Delete soft deletes a site event
	Delete(ctx context.Context, id uuid.UUID) error

	// SetCurrent sets an event as the current active event
	SetCurrent(ctx context.Context, id uuid.UUID) error

	// Count returns the total number of events
	Count(ctx context.Context) (int64, error)

	// Enhanced query methods

	// GetWithFilters retrieves events with advanced filtering
	GetWithFilters(ctx context.Context, filter *SiteEventFilter) ([]*entities.SiteEvent, error)

	// CountWithFilters returns count of events matching filters
	CountWithFilters(ctx context.Context, filter *SiteEventFilter) (int64, error)

	// GetByCategory retrieves events by category
	GetByCategory(ctx context.Context, categoryID uuid.UUID, offset, limit int) ([]*entities.SiteEvent, error)

	// SearchByTitle searches events by title
	SearchByTitle(ctx context.Context, searchTerm string, offset, limit int) ([]*entities.SiteEvent, error)

	// GetByDateRange retrieves events within a date range
	GetByDateRange(ctx context.Context, startDate, endDate time.Time, offset, limit int) ([]*entities.SiteEvent, error)

	// GetByStatus retrieves events by status
	GetByStatus(ctx context.Context, status string, offset, limit int) ([]*entities.SiteEvent, error)

	// GetUpcoming retrieves upcoming events
	GetUpcoming(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error)

	// GetActive retrieves currently active events
	GetActive(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error)

	// GetCompleted retrieves completed events
	GetCompleted(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error)
}

// SiteEventFilter represents filtering options for events
type SiteEventFilter struct {
	// Pagination
	Offset int
	Limit  int

	// Filtering
	CategoryID *uuid.UUID
	SearchTerm string
	Status     string // upcoming, active, completed, cancelled
	IsCurrent  *bool

	// Date filtering
	StartDateFrom *time.Time
	StartDateTo   *time.Time

	// Sorting
	SortBy    string // title, startDate, endDate, createdAt
	SortOrder string // asc, desc

	// Include soft deleted
	IncludeDeleted bool
}
