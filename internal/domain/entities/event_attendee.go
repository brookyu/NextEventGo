package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EventAttendee represents the relationship between events and attendees (maps to EventAttendances table)
type EventAttendee struct {
	ID                      uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Mobile                  string    `gorm:"type:longtext;column:Mobile" json:"mobile"`
	EventID                 uuid.UUID `gorm:"type:char(36);not null;column:EventId" json:"event_id"`
	OnSiteScanned           bool      `gorm:"type:tinyint(1);column:OnSiteScanned" json:"on_site_scanned"`
	InteractionCodeReceived bool      `gorm:"type:tinyint(1);column:InteractionCodeReceived" json:"interaction_code_received"`

	// Relationships
	Event *SiteEvent `gorm:"foreignKey:EventID" json:"event,omitempty"`

	// Audit fields
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"created_at"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updated_at,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"is_deleted"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deleted_at,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"created_by,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updated_by,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deleted_by,omitempty"`
}

// TableName returns the table name for GORM
func (EventAttendee) TableName() string {
	return "EventAttendances"
}

// BeforeCreate sets the ID and timestamps before creating
func (e *EventAttendee) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	now := time.Now()
	e.CreatedAt = now
	e.UpdatedAt = &now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (e *EventAttendee) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	e.UpdatedAt = &now
	return nil
}

// CheckIn marks the attendee as scanned on site
func (e *EventAttendee) CheckIn() {
	e.OnSiteScanned = true
	e.InteractionCodeReceived = true
}

// QRCodeData represents the data structure for QR code generation
type QRCodeData struct {
	EventID    uuid.UUID `json:"event_id"`
	UserID     uuid.UUID `json:"user_id"`
	AttendeeID uuid.UUID `json:"attendee_id"`
	Timestamp  time.Time `json:"timestamp"`
}
