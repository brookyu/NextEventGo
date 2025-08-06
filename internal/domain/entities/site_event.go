package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SiteEvent represents the core event entity with GORM tags matching existing .NET schema
type SiteEvent struct {
	ID             uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	EventTitle     string    `gorm:"type:longtext;column:EventTitle" json:"eventTitle"`
	EventStartDate time.Time `gorm:"type:datetime(6);column:EventStartDate" json:"eventStartDate"`
	EventEndDate   time.Time `gorm:"type:datetime(6);column:EventEndDate" json:"eventEndDate"`
	IsCurrent      bool      `gorm:"type:tinyint(1);column:IsCurrent" json:"isCurrent"`
	TagName        string    `gorm:"type:longtext;column:TagName" json:"tagName"`
	UserTagID      int       `gorm:"column:UserTagId" json:"userTagId"`

	// Resource associations
	SurveyID       uuid.UUID `gorm:"type:char(36);column:SurveyId" json:"surveyId"`
	RegisterFormID uuid.UUID `gorm:"type:char(36);column:RegisterFormId" json:"registerFormId"`
	AgendaID       uuid.UUID `gorm:"type:char(36);column:AgendaId" json:"agendaId"`
	BackgroundID   uuid.UUID `gorm:"type:char(36);column:BackgroundId" json:"backgroundId"`
	AboutEventID   uuid.UUID `gorm:"type:char(36);column:AboutEventId" json:"aboutEventId"`
	InstructionsID uuid.UUID `gorm:"type:char(36);column:InstructionsId" json:"instructionsId"`
	CloudVideoID   uuid.UUID `gorm:"type:char(36);column:CloudVideoId" json:"cloudVideoId"`

	// Other fields
	SpeakersIDs     string    `gorm:"type:longtext;column:SpeakersIds" json:"speakersIds"`
	InteractionCode string    `gorm:"type:longtext;column:InteractionCode" json:"interactionCode"`
	ScanMessage     string    `gorm:"type:longtext;column:ScanMessage" json:"scanMessage"`
	ScanNewsID      uuid.UUID `gorm:"type:char(36);column:ScanNewsId" json:"scanNewsId"`
	Tags            string    `gorm:"type:longtext;column:Tags" json:"tags"`
	CategoryID      uuid.UUID `gorm:"type:char(36);column:CategoryId;default:00000000-0000-0000-0000-000000000000" json:"categoryId"`

	// Audit fields matching ABP Framework patterns
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"isDeleted"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"createdBy,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updatedBy,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deletedBy,omitempty"`
}

// TableName returns the table name for GORM
func (SiteEvent) TableName() string {
	return "SiteEvents"
}

// BeforeCreate sets the ID and timestamps before creating
func (e *SiteEvent) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	now := time.Now()
	e.CreatedAt = now
	e.UpdatedAt = &now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (e *SiteEvent) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	e.UpdatedAt = &now
	return nil
}

// Domain methods

// IsActive checks if the event is currently active
func (e *SiteEvent) IsActive() bool {
	now := time.Now()
	return now.After(e.EventStartDate) && now.Before(e.EventEndDate) && !e.IsDeleted
}

// IsUpcoming checks if the event is upcoming
func (e *SiteEvent) IsUpcoming() bool {
	now := time.Now()
	return now.Before(e.EventStartDate) && !e.IsDeleted
}

// IsCompleted checks if the event is completed
func (e *SiteEvent) IsCompleted() bool {
	now := time.Now()
	return now.After(e.EventEndDate) && !e.IsDeleted
}

// GetStatus returns the current status of the event
func (e *SiteEvent) GetStatus() string {
	if e.IsDeleted {
		return "cancelled"
	}
	if e.IsUpcoming() {
		return "upcoming"
	}
	if e.IsActive() {
		return "active"
	}
	if e.IsCompleted() {
		return "completed"
	}
	return "draft"
}

// HasResource checks if the event has a specific resource type
func (e *SiteEvent) HasResource(resourceType string) bool {
	switch resourceType {
	case "survey":
		return e.SurveyID != uuid.Nil
	case "registerForm":
		return e.RegisterFormID != uuid.Nil
	case "agenda":
		return e.AgendaID != uuid.Nil
	case "background":
		return e.BackgroundID != uuid.Nil
	case "aboutEvent":
		return e.AboutEventID != uuid.Nil
	case "instructions":
		return e.InstructionsID != uuid.Nil
	case "cloudVideo":
		return e.CloudVideoID != uuid.Nil
	case "scanNews":
		return e.ScanNewsID != uuid.Nil
	default:
		return false
	}
}
