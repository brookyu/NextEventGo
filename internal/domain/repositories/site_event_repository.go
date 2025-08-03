package repositories

import (
	"context"

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
}
