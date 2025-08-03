package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormEventAttendeeRepository implements EventAttendeeRepository using GORM
type GormEventAttendeeRepository struct {
	db *gorm.DB
}

// NewGormEventAttendeeRepository creates a new GORM-based event attendee repository
func NewGormEventAttendeeRepository(db *gorm.DB) repositories.EventAttendeeRepository {
	return &GormEventAttendeeRepository{db: db}
}

// Create creates a new event attendee
func (r *GormEventAttendeeRepository) Create(ctx context.Context, attendee *entities.EventAttendee) error {
	return r.db.WithContext(ctx).Create(attendee).Error
}

// GetByID retrieves an event attendee by ID
func (r *GormEventAttendeeRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.EventAttendee, error) {
	var attendee entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		First(&attendee, "Id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &attendee, nil
}

// GetByEventAndUser retrieves an attendee by event and user ID
func (r *GormEventAttendeeRepository) GetByEventAndUser(ctx context.Context, eventID, userID uuid.UUID) (*entities.EventAttendee, error) {
	var attendee entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("EventId = ? AND UserId = ?", eventID, userID).
		First(&attendee).Error
	if err != nil {
		return nil, err
	}
	return &attendee, nil
}

// GetByEvent retrieves all attendees for an event with pagination
func (r *GormEventAttendeeRepository) GetByEvent(ctx context.Context, eventID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error) {
	var attendees []*entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("EventId = ?", eventID).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&attendees).Error
	return attendees, err
}

// GetByUser retrieves all attendees for a user with pagination
func (r *GormEventAttendeeRepository) GetByUser(ctx context.Context, userID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error) {
	var attendees []*entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("UserId = ?", userID).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&attendees).Error
	return attendees, err
}

// GetByQRCode retrieves an attendee by QR code
func (r *GormEventAttendeeRepository) GetByQRCode(ctx context.Context, qrCode string) (*entities.EventAttendee, error) {
	var attendee entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("QRCode = ?", qrCode).
		First(&attendee).Error
	if err != nil {
		return nil, err
	}
	return &attendee, nil
}

// Update updates an existing event attendee
func (r *GormEventAttendeeRepository) Update(ctx context.Context, attendee *entities.EventAttendee) error {
	return r.db.WithContext(ctx).Save(attendee).Error
}

// Delete soft deletes an event attendee
func (r *GormEventAttendeeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.EventAttendee{}, "Id = ?", id).Error
}

// CountByEvent returns the total number of attendees for an event
func (r *GormEventAttendeeRepository) CountByEvent(ctx context.Context, eventID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.EventAttendee{}).
		Where("EventId = ?", eventID).
		Count(&count).Error
	return count, err
}

// CountCheckedInByEvent returns the number of checked-in attendees for an event
func (r *GormEventAttendeeRepository) CountCheckedInByEvent(ctx context.Context, eventID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.EventAttendee{}).
		Where("EventId = ? AND IsCheckedIn = ?", eventID, true).
		Count(&count).Error
	return count, err
}

// GetCheckedInAttendees retrieves all checked-in attendees for an event
func (r *GormEventAttendeeRepository) GetCheckedInAttendees(ctx context.Context, eventID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error) {
	var attendees []*entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("EventId = ? AND IsCheckedIn = ?", eventID, true).
		Offset(offset).
		Limit(limit).
		Order("CheckInDate DESC").
		Find(&attendees).Error
	return attendees, err
}

// GetAttendeesByStatus retrieves attendees by status
func (r *GormEventAttendeeRepository) GetAttendeesByStatus(ctx context.Context, eventID uuid.UUID, status string, offset, limit int) ([]*entities.EventAttendee, error) {
	var attendees []*entities.EventAttendee
	err := r.db.WithContext(ctx).
		Preload("Event").
		Preload("User").
		Where("EventId = ? AND Status = ?", eventID, status).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&attendees).Error
	return attendees, err
}
