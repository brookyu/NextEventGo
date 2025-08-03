package services

import (
	"time"

	"github.com/google/uuid"
)

// Event Service Request Types

// EventCreateRequest represents a request to create a new event
type EventCreateRequest struct {
	EventTitle      string    `json:"eventTitle" binding:"required,min=1,max=255"`
	EventStartDate  time.Time `json:"eventStartDate" binding:"required"`
	EventEndDate    time.Time `json:"eventEndDate" binding:"required"`
	TagName         string    `json:"tagName" binding:"max=100"`
	UserTagID       int       `json:"userTagId"`
	InteractionCode string    `json:"interactionCode" binding:"max=50"`
	ScanMessage     string    `json:"scanMessage" binding:"max=500"`
	IsCurrent       bool      `json:"isCurrent"`
	Description     string    `json:"description,omitempty" binding:"max=2000"`
	Location        string    `json:"location,omitempty" binding:"max=255"`
	Capacity        *int      `json:"capacity,omitempty" binding:"omitempty,min=1"`
}

// EventUpdateRequest represents a request to update an existing event
type EventUpdateRequest struct {
	EventTitle      *string    `json:"eventTitle,omitempty" binding:"omitempty,min=1,max=255"`
	EventStartDate  *time.Time `json:"eventStartDate,omitempty"`
	EventEndDate    *time.Time `json:"eventEndDate,omitempty"`
	TagName         *string    `json:"tagName,omitempty" binding:"omitempty,max=100"`
	UserTagID       *int       `json:"userTagId,omitempty"`
	InteractionCode *string    `json:"interactionCode,omitempty" binding:"omitempty,max=50"`
	ScanMessage     *string    `json:"scanMessage,omitempty" binding:"omitempty,max=500"`
	IsCurrent       *bool      `json:"isCurrent,omitempty"`
	Description     *string    `json:"description,omitempty" binding:"omitempty,max=2000"`
	Location        *string    `json:"location,omitempty" binding:"omitempty,max=255"`
	Capacity        *int       `json:"capacity,omitempty" binding:"omitempty,min=1"`
}

// Event Service Response Types

// EventResponse represents an event response
type EventResponse struct {
	ID              uuid.UUID  `json:"id"`
	EventTitle      string     `json:"eventTitle"`
	EventStartDate  time.Time  `json:"eventStartDate"`
	EventEndDate    time.Time  `json:"eventEndDate"`
	TagName         string     `json:"tagName"`
	UserTagID       int        `json:"userTagId"`
	InteractionCode string     `json:"interactionCode"`
	ScanMessage     string     `json:"scanMessage"`
	IsCurrent       bool       `json:"isCurrent"`
	Description     string     `json:"description"`
	Location        string     `json:"location"`
	Capacity        *int       `json:"capacity,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       *time.Time `json:"updatedAt,omitempty"`
	CreatedBy       *uuid.UUID `json:"createdBy,omitempty"`
	UpdatedBy       *uuid.UUID `json:"updatedBy,omitempty"`
	
	// Computed fields
	Status           string `json:"status"` // "upcoming", "active", "completed", "cancelled"
	AttendeeCount    int64  `json:"attendeeCount"`
	CheckedInCount   int64  `json:"checkedInCount"`
	CheckInRate      float64 `json:"checkInRate"`
	
	// Related data (included based on options)
	Attendees []AttendeeResponse `json:"attendees,omitempty"`
	Analytics *EventAnalytics    `json:"analytics,omitempty"`
	QRCode    *QRCodeResponse    `json:"qrCode,omitempty"`
}

// Event Search and Filter Types

// EventSearchCriteria represents search criteria for events
type EventSearchCriteria struct {
	Search        string     `json:"search,omitempty"`
	Status        string     `json:"status,omitempty"` // "upcoming", "active", "completed", "cancelled"
	TagName       string     `json:"tagName,omitempty"`
	IsCurrent     *bool      `json:"isCurrent,omitempty"`
	StartDateFrom *time.Time `json:"startDateFrom,omitempty"`
	StartDateTo   *time.Time `json:"startDateTo,omitempty"`
	EndDateFrom   *time.Time `json:"endDateFrom,omitempty"`
	EndDateTo     *time.Time `json:"endDateTo,omitempty"`
	SortBy        string     `json:"sortBy,omitempty"`
	SortOrder     string     `json:"sortOrder,omitempty"`
}

// EventListResponse represents a paginated list of events
type EventListResponse struct {
	Events     []EventResponse `json:"events"`
	Pagination PaginationInfo  `json:"pagination"`
}

// Attendee Service Types

// AttendeeCreateRequest represents a request to create/register an attendee
type AttendeeCreateRequest struct {
	EventID     uuid.UUID `json:"eventId" binding:"required"`
	UserID      uuid.UUID `json:"userId" binding:"required"`
	Name        string    `json:"name" binding:"required,min=1,max=100"`
	Email       string    `json:"email" binding:"required,email,max=255"`
	Phone       string    `json:"phone,omitempty" binding:"omitempty,max=20"`
	Company     string    `json:"company,omitempty" binding:"omitempty,max=100"`
	Title       string    `json:"title,omitempty" binding:"omitempty,max=100"`
	Notes       string    `json:"notes,omitempty" binding:"omitempty,max=500"`
	WeChatID    string    `json:"wechatId,omitempty" binding:"omitempty,max=50"`
}

// AttendeeUpdateRequest represents a request to update attendee information
type AttendeeUpdateRequest struct {
	Name     *string `json:"name,omitempty" binding:"omitempty,min=1,max=100"`
	Email    *string `json:"email,omitempty" binding:"omitempty,email,max=255"`
	Phone    *string `json:"phone,omitempty" binding:"omitempty,max=20"`
	Company  *string `json:"company,omitempty" binding:"omitempty,max=100"`
	Title    *string `json:"title,omitempty" binding:"omitempty,max=100"`
	Notes    *string `json:"notes,omitempty" binding:"omitempty,max=500"`
	WeChatID *string `json:"wechatId,omitempty" binding:"omitempty,max=50"`
}

// AttendeeResponse represents an attendee response
type AttendeeResponse struct {
	ID           uuid.UUID  `json:"id"`
	EventID      uuid.UUID  `json:"eventId"`
	UserID       uuid.UUID  `json:"userId"`
	Name         string     `json:"name"`
	Email        string     `json:"email"`
	Phone        string     `json:"phone"`
	Company      string     `json:"company"`
	Title        string     `json:"title"`
	Notes        string     `json:"notes"`
	WeChatID     string     `json:"wechatId"`
	Status       string     `json:"status"` // "registered", "checked_in", "cancelled"
	CheckInTime  *time.Time `json:"checkInTime,omitempty"`
	QRCode       string     `json:"qrCode"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    *time.Time `json:"updatedAt,omitempty"`
	
	// Related data
	Event *EventResponse `json:"event,omitempty"`
	User  *UserResponse  `json:"user,omitempty"`
}

// Check-in Types

// CheckInRequest represents a check-in request
type CheckInRequest struct {
	QRCode      string `json:"qrCode" binding:"required"`
	ScannerInfo *QRScannerInfo `json:"scannerInfo,omitempty"`
}

// CheckInResponse represents a check-in response
type CheckInResponse struct {
	Success          bool       `json:"success"`
	AttendeeID       uuid.UUID  `json:"attendeeId"`
	EventID          uuid.UUID  `json:"eventId"`
	CheckInTime      time.Time  `json:"checkInTime"`
	Message          string     `json:"message"`
	AlreadyCheckedIn bool       `json:"alreadyCheckedIn"`
	Attendee         *AttendeeResponse `json:"attendee,omitempty"`
}

// QR Code Types

// QRCodeResponse represents a QR code response
type QRCodeResponse struct {
	Code          string     `json:"code"`
	Type          string     `json:"type"` // "event", "attendee"
	EntityID      uuid.UUID  `json:"entityId"`
	ExpiresAt     *time.Time `json:"expiresAt,omitempty"`
	CreatedAt     time.Time  `json:"createdAt"`
	IsActive      bool       `json:"isActive"`
	ScanCount     int        `json:"scanCount"`
	LastScannedAt *time.Time `json:"lastScannedAt,omitempty"`
	QRCodeURL     string     `json:"qrCodeUrl,omitempty"`
}

// QRScannerInfo represents information about the QR code scanner
type QRScannerInfo struct {
	ScannerID   string `json:"scannerId,omitempty"`
	Location    string `json:"location,omitempty"`
	DeviceInfo  string `json:"deviceInfo,omitempty"`
	IPAddress   string `json:"ipAddress,omitempty"`
	UserAgent   string `json:"userAgent,omitempty"`
}

// QRScanResult represents the result of a QR code scan
type QRScanResult struct {
	Success     bool              `json:"success"`
	Type        string            `json:"type"`
	EntityID    uuid.UUID         `json:"entityId"`
	Message     string            `json:"message"`
	CheckIn     *CheckInResponse  `json:"checkIn,omitempty"`
	Event       *EventResponse    `json:"event,omitempty"`
	Attendee    *AttendeeResponse `json:"attendee,omitempty"`
}

// Analytics Types

// EventAnalytics represents event analytics data
type EventAnalytics struct {
	EventID            uuid.UUID                `json:"eventId"`
	TotalRegistrations int64                    `json:"totalRegistrations"`
	TotalCheckIns      int64                    `json:"totalCheckIns"`
	CheckInRate        float64                  `json:"checkInRate"`
	RegistrationRate   float64                  `json:"registrationRate"`
	PeakCheckInTime    *time.Time               `json:"peakCheckInTime,omitempty"`
	AvgCheckInTime     float64                  `json:"avgCheckInTime"` // minutes from event start
	RegistrationsOverTime []TimeSeriesPoint     `json:"registrationsOverTime"`
	CheckInsOverTime      []TimeSeriesPoint     `json:"checkInsOverTime"`
	CompanyBreakdown      map[string]int64      `json:"companyBreakdown"`
	TitleBreakdown        map[string]int64      `json:"titleBreakdown"`
	GeographicBreakdown   map[string]int64      `json:"geographicBreakdown"`
	QRCodeScans           int64                 `json:"qrCodeScans"`
	LastUpdated           time.Time             `json:"lastUpdated"`
}

// TimeSeriesPoint represents a point in time series data
type TimeSeriesPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Value     int64     `json:"value"`
}

// Bulk Operations Types

// BulkAttendeeOperationRequest represents a bulk operation on attendees
type BulkAttendeeOperationRequest struct {
	AttendeeIDs []uuid.UUID `json:"attendeeIds" binding:"required"`
	Action      string      `json:"action" binding:"required"` // "check_in", "cancel", "send_reminder"
	Data        interface{} `json:"data,omitempty"`
}

// BulkAttendeeOperationResponse represents the result of a bulk operation
type BulkAttendeeOperationResponse struct {
	Success   bool     `json:"success"`
	Processed int      `json:"processed"`
	Failed    int      `json:"failed"`
	Errors    []string `json:"errors,omitempty"`
	Message   string   `json:"message"`
}

// Event Export Types

// EventExportRequest represents a request to export event data
type EventExportRequest struct {
	EventID     uuid.UUID `json:"eventId" binding:"required"`
	Format      string    `json:"format" binding:"required"` // "csv", "excel", "pdf"
	IncludeData []string  `json:"includeData,omitempty"`     // "attendees", "analytics", "checkins"
}

// EventExportResponse represents the result of an export operation
type EventExportResponse struct {
	Success   bool   `json:"success"`
	FileURL   string `json:"fileUrl,omitempty"`
	FileName  string `json:"fileName,omitempty"`
	FileSize  int64  `json:"fileSize,omitempty"`
	ExpiresAt time.Time `json:"expiresAt"`
	Message   string `json:"message"`
}

// User Response Type (for related data)
type UserResponse struct {
	ID        uuid.UUID  `json:"id"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Name      string     `json:"name"`
	Avatar    string     `json:"avatar,omitempty"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

// Pagination Info Type
type PaginationInfo struct {
	Page        int   `json:"page"`
	Limit       int   `json:"limit"`
	Total       int64 `json:"total"`
	TotalPages  int   `json:"totalPages"`
	HasNext     bool  `json:"hasNext"`
	HasPrevious bool  `json:"hasPrevious"`
}
