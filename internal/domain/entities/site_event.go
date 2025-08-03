package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SiteEvent represents the core event entity with GORM tags matching existing .NET schema
type SiteEvent struct {
	ID              uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	EventTitle      string    `gorm:"type:longtext;column:EventTitle" json:"eventTitle"`
	EventStartDate  time.Time `gorm:"type:datetime(6);column:EventStartDate" json:"eventStartDate"`
	EventEndDate    time.Time `gorm:"type:datetime(6);column:EventEndDate" json:"eventEndDate"`
	IsCurrent       bool      `gorm:"type:tinyint(1);column:IsCurrent" json:"isCurrent"`
	TagName         string    `gorm:"type:longtext;column:TagName" json:"tagName"`
	UserTagID       int       `gorm:"column:UserTagId" json:"userTagId"`
	AgendaID        uuid.UUID `gorm:"type:char(36);column:AgendaId" json:"agendaId"`
	BackgroundID    uuid.UUID `gorm:"type:char(36);column:BackgroundId" json:"backgroundId"`
	AboutEventID    uuid.UUID `gorm:"type:char(36);column:AboutEventId" json:"aboutEventId"`
	InstructionsID  uuid.UUID `gorm:"type:char(36);column:InstructionsId" json:"instructionsId"`
	SurveyID        uuid.UUID `gorm:"type:char(36);column:SurveyId" json:"surveyId"`
	SpeakersIDs     string    `gorm:"type:longtext;column:SpeakersIds" json:"speakersIds"`
	RegisterFormID  uuid.UUID `gorm:"type:char(36);column:RegisterFormId" json:"registerFormId"`
	CloudVideoID    uuid.UUID `gorm:"type:char(36);column:CloudVideoId" json:"cloudVideoId"`
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
