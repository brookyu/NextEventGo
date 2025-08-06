package dto

import (
	"time"

	"github.com/google/uuid"
)

// SiteEventDto represents the basic event information for API responses
type SiteEventDto struct {
	ID              uuid.UUID `json:"id"`
	EventTitle      string    `json:"eventTitle"`
	EventStartDate  time.Time `json:"eventStartDate"`
	EventEndDate    time.Time `json:"eventEndDate"`
	IsCurrent       bool      `json:"isCurrent"`
	CreatedAt       time.Time `json:"createdAt"`
	Status          string    `json:"status"`
	InteractionCode string    `json:"interactionCode,omitempty"`
	CategoryID      uuid.UUID `json:"categoryId,omitempty"`
}

// SimpleSiteEventDto represents minimal event information
type SimpleSiteEventDto struct {
	ID              string    `json:"id"`
	EventTitle      string    `json:"eventTitle"`
	IsCurrent       bool      `json:"isCurrent"`
	RegisterFormID  uuid.UUID `json:"registerFormId"`
	EventStartDate  time.Time `json:"eventStartDate"`
	EventEndDate    time.Time `json:"eventEndDate"`
	OnlineUserCount int       `json:"onlineUserCount"`
}

// SiteEventForEditingDto represents event data for editing operations
type SiteEventForEditingDto struct {
	ID             uuid.UUID `json:"id"`
	EventTitle     string    `json:"eventTitle"`
	EventStartDate time.Time `json:"eventStartDate"`
	EventEndDate   time.Time `json:"eventEndDate"`
	TagName        string    `json:"tagName"`

	// Survey and form associations
	SurveyTitle       string    `json:"surveyTitle,omitempty"`
	SurveyID          uuid.UUID `json:"surveyId,omitempty"`
	RegisterFormTitle string    `json:"registerFormTitle,omitempty"`
	RegisterFormID    uuid.UUID `json:"registerFormId,omitempty"`

	// Article associations
	AboutEventTitle   string    `json:"aboutEventTitle,omitempty"`
	AboutEventID      uuid.UUID `json:"aboutEventId,omitempty"`
	AgendaTitle       string    `json:"agendaTitle,omitempty"`
	AgendaID          uuid.UUID `json:"agendaId,omitempty"`
	BackgroundTitle   string    `json:"backgroundTitle,omitempty"`
	BackgroundID      uuid.UUID `json:"backgroundId,omitempty"`
	InstructionsTitle string    `json:"instructionsTitle,omitempty"`
	InstructionsID    uuid.UUID `json:"instructionsId,omitempty"`

	// Video associations
	CloudVideoTitle string    `json:"cloudVideoTitle,omitempty"`
	CloudVideoID    uuid.UUID `json:"cloudVideoId,omitempty"`

	// Tags and categorization
	CategoryID uuid.UUID `json:"categoryId,omitempty"`
}

// CreateUpdateSiteEventDto represents data for creating or updating events
type CreateUpdateSiteEventDto struct {
	ID             uuid.UUID `json:"id,omitempty"`
	EventTitle     string    `json:"eventTitle" binding:"required"`
	EventStartDate time.Time `json:"eventStartDate" binding:"required"`
	EventEndDate   time.Time `json:"eventEndDate" binding:"required"`
	TagName        string    `json:"tagName,omitempty"`

	// Resource IDs
	SurveyID       *uuid.UUID `json:"surveyId,omitempty"`
	RegisterFormID *uuid.UUID `json:"registerFormId,omitempty"`

	// Article resource IDs
	AboutEventID   *uuid.UUID `json:"aboutEventId,omitempty"`
	AgendaID       *uuid.UUID `json:"agendaId,omitempty"`
	BackgroundID   *uuid.UUID `json:"backgroundId,omitempty"`
	InstructionsID *uuid.UUID `json:"instructionsId,omitempty"`

	// Video resource IDs
	CloudVideoID *uuid.UUID `json:"cloudVideoId,omitempty"`

	// Organization
	CategoryID *uuid.UUID `json:"categoryId,omitempty"`
}

// GetSiteEventsListDto represents parameters for listing events
type GetSiteEventsListDto struct {
	// Pagination
	Page     int `json:"page" form:"page"`
	PageSize int `json:"pageSize" form:"pageSize"`

	// Filtering
	CategoryID *uuid.UUID `json:"categoryId" form:"categoryId"`
	SearchTerm string     `json:"searchTerm" form:"searchTerm"`
	Status     string     `json:"status" form:"status"` // upcoming, active, completed, cancelled
	IsCurrent  *bool      `json:"isCurrent" form:"isCurrent"`

	// Date filtering
	StartDateFrom *time.Time `json:"startDateFrom" form:"startDateFrom"`
	StartDateTo   *time.Time `json:"startDateTo" form:"startDateTo"`

	// Sorting
	SortBy    string `json:"sortBy" form:"sortBy"`       // title, startDate, endDate, createdAt
	SortOrder string `json:"sortOrder" form:"sortOrder"` // asc, desc
}

// ToggleCurrentInput represents input for toggling current event status
type ToggleCurrentInput struct {
	ID uuid.UUID `json:"id" binding:"required"`
}

// DeleteEventInputDto represents input for deleting an event
type DeleteEventInputDto struct {
	ID uuid.UUID `json:"id" binding:"required"`
}

// PagedResultDtoForAnt represents paginated results in Ant Design format
type PagedResultDtoForAnt[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"pageSize"`
	TotalPages int   `json:"totalPages"`
}

// EventListResponse represents the response for event listing
type EventListResponse = PagedResultDtoForAnt[SiteEventDto]

// EventResourceInfo represents information about associated resources
type EventResourceInfo struct {
	ResourceType  string    `json:"resourceType"`
	ResourceID    uuid.UUID `json:"resourceId"`
	ResourceTitle string    `json:"resourceTitle"`
	IsAssigned    bool      `json:"isAssigned"`
}

// EventStatsDto represents event statistics
type EventStatsDto struct {
	EventID         uuid.UUID `json:"eventId"`
	TotalRegistered int       `json:"totalRegistered"`
	TotalCheckedIn  int       `json:"totalCheckedIn"`
	CheckInRate     float64   `json:"checkInRate"`
	OnlineUsers     int       `json:"onlineUsers"`
	QRCodeScans     int       `json:"qrCodeScans"`
}
