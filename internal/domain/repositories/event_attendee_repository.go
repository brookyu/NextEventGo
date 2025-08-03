package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// EventAttendeeRepository defines the interface for EventAttendee data operations
type EventAttendeeRepository interface {
	// Create creates a new event attendee
	Create(ctx context.Context, attendee *entities.EventAttendee) error
	
	// GetByID retrieves an event attendee by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.EventAttendee, error)
	
	// GetByEventAndUser retrieves an attendee by event and user ID
	GetByEventAndUser(ctx context.Context, eventID, userID uuid.UUID) (*entities.EventAttendee, error)
	
	// GetByEvent retrieves all attendees for an event with pagination
	GetByEvent(ctx context.Context, eventID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error)
	
	// GetByUser retrieves all attendees for a user with pagination
	GetByUser(ctx context.Context, userID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error)
	
	// GetByQRCode retrieves an attendee by QR code
	GetByQRCode(ctx context.Context, qrCode string) (*entities.EventAttendee, error)
	
	// Update updates an existing event attendee
	Update(ctx context.Context, attendee *entities.EventAttendee) error
	
	// Delete soft deletes an event attendee
	Delete(ctx context.Context, id uuid.UUID) error
	
	// CountByEvent returns the total number of attendees for an event
	CountByEvent(ctx context.Context, eventID uuid.UUID) (int64, error)
	
	// CountCheckedInByEvent returns the number of checked-in attendees for an event
	CountCheckedInByEvent(ctx context.Context, eventID uuid.UUID) (int64, error)
	
	// GetCheckedInAttendees retrieves all checked-in attendees for an event
	GetCheckedInAttendees(ctx context.Context, eventID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error)
	
	// GetAttendeesByStatus retrieves attendees by status
	GetAttendeesByStatus(ctx context.Context, eventID uuid.UUID, status string, offset, limit int) ([]*entities.EventAttendee, error)
}
