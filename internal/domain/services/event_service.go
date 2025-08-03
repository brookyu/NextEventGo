package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// EventService defines the interface for event management operations
type EventService interface {
	// Event CRUD Operations
	CreateEvent(ctx context.Context, event *entities.SiteEvent) error
	GetEventByID(ctx context.Context, id uuid.UUID) (*entities.SiteEvent, error)
	GetEventByInteractionCode(ctx context.Context, code string) (*entities.SiteEvent, error)
	GetCurrentEvent(ctx context.Context) (*entities.SiteEvent, error)
	GetAllEvents(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error)
	UpdateEvent(ctx context.Context, event *entities.SiteEvent) error
	DeleteEvent(ctx context.Context, id uuid.UUID) error
	SetCurrentEvent(ctx context.Context, id uuid.UUID) error
	
	// Event Search and Filtering
	SearchEvents(ctx context.Context, query *EventSearchQuery) ([]*entities.SiteEvent, error)
	GetEventsByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.SiteEvent, error)
	GetUpcomingEvents(ctx context.Context, limit int) ([]*entities.SiteEvent, error)
	
	// Event Analytics
	GetEventStatistics(ctx context.Context, eventID uuid.UUID) (*EventStatistics, error)
	GetEventAttendanceReport(ctx context.Context, eventID uuid.UUID) (*AttendanceReport, error)
}

// AttendeeService defines the interface for attendee management operations
type AttendeeService interface {
	// Attendee Registration
	RegisterAttendee(ctx context.Context, registration *AttendeeRegistration) (*entities.EventAttendee, error)
	GetAttendeeByID(ctx context.Context, id uuid.UUID) (*entities.EventAttendee, error)
	GetAttendeesByEvent(ctx context.Context, eventID uuid.UUID, offset, limit int) ([]*entities.EventAttendee, error)
	GetAttendeesByUser(ctx context.Context, userID uuid.UUID) ([]*entities.EventAttendee, error)
	
	// Check-in Operations
	CheckInAttendee(ctx context.Context, attendeeID uuid.UUID) error
	CheckInByQRCode(ctx context.Context, qrCode string) (*CheckInResult, error)
	GetCheckInStatus(ctx context.Context, eventID, userID uuid.UUID) (*CheckInStatus, error)
	
	// Attendee Management
	UpdateAttendeeStatus(ctx context.Context, attendeeID uuid.UUID, status string) error
	CancelRegistration(ctx context.Context, attendeeID uuid.UUID) error
	GetAttendeeCount(ctx context.Context, eventID uuid.UUID) (int64, error)
}

// QRCodeService defines the interface for QR code operations
type QRCodeService interface {
	// QR Code Generation
	GenerateEventQRCode(ctx context.Context, eventID uuid.UUID, expireHours int) (*QRCodeInfo, error)
	GenerateAttendeeQRCode(ctx context.Context, attendeeID uuid.UUID) (*QRCodeInfo, error)
	
	// QR Code Processing
	ProcessQRCodeScan(ctx context.Context, qrData string, scannerInfo *QRScannerInfo) (*QRScanResult, error)
	ValidateQRCode(ctx context.Context, qrData string) (*QRValidationResult, error)
	
	// QR Code Management
	GetQRCodeInfo(ctx context.Context, qrCode string) (*QRCodeInfo, error)
	DeactivateQRCode(ctx context.Context, qrCode string) error
}

// EventSearchQuery represents search criteria for events
type EventSearchQuery struct {
	Title       string
	TagName     string
	StartDate   *time.Time
	EndDate     *time.Time
	IsCurrent   *bool
	UserTagID   *int
	Offset      int
	Limit       int
	SortBy      string
	SortOrder   string
}

// AttendeeRegistration represents attendee registration data
type AttendeeRegistration struct {
	EventID     uuid.UUID
	UserID      uuid.UUID
	Notes       string
	Source      string // "wechat", "web", "api"
	SourceData  map[string]interface{}
}

// EventStatistics represents event analytics data
type EventStatistics struct {
	EventID           uuid.UUID
	TotalRegistered   int64
	TotalCheckedIn    int64
	CheckInRate       float64
	RegistrationTrend []RegistrationPoint
	CheckInTrend      []CheckInPoint
	TopSources        []SourceStatistic
}

// AttendanceReport represents detailed attendance information
type AttendanceReport struct {
	EventID         uuid.UUID
	EventTitle      string
	TotalCapacity   int
	TotalRegistered int64
	TotalCheckedIn  int64
	CheckInRate     float64
	Attendees       []AttendeeInfo
	Timeline        []AttendanceTimePoint
}

// CheckInResult represents the result of a check-in operation
type CheckInResult struct {
	Success       bool
	AttendeeID    uuid.UUID
	EventID       uuid.UUID
	CheckInTime   time.Time
	Message       string
	AlreadyCheckedIn bool
}

// CheckInStatus represents attendee check-in status
type CheckInStatus struct {
	IsRegistered  bool
	IsCheckedIn   bool
	CheckInTime   *time.Time
	QRCode        string
	Status        string
}

// QRCodeInfo represents QR code information
type QRCodeInfo struct {
	Code          string
	Type          string // "event", "attendee"
	EntityID      uuid.UUID
	ExpiresAt     *time.Time
	CreatedAt     time.Time
	IsActive      bool
	ScanCount     int
	LastScannedAt *time.Time
}

// QRScannerInfo represents information about who is scanning
type QRScannerInfo struct {
	UserID    *uuid.UUID
	OpenID    string
	Source    string // "wechat", "web", "mobile"
	Location  *ScanLocation
	Timestamp time.Time
}

// QRScanResult represents the result of QR code scanning
type QRScanResult struct {
	Success     bool
	Type        string
	EventID     *uuid.UUID
	AttendeeID  *uuid.UUID
	Action      string // "check_in", "register", "info"
	Message     string
	Data        map[string]interface{}
}

// QRValidationResult represents QR code validation result
type QRValidationResult struct {
	IsValid   bool
	Type      string
	EntityID  uuid.UUID
	ExpiresAt *time.Time
	Message   string
}

// Supporting data structures
type RegistrationPoint struct {
	Date  time.Time
	Count int64
}

type CheckInPoint struct {
	Date  time.Time
	Count int64
}

type SourceStatistic struct {
	Source string
	Count  int64
	Percentage float64
}

type AttendeeInfo struct {
	AttendeeID   uuid.UUID
	UserID       uuid.UUID
	UserName     string
	Email        string
	PhoneNumber  string
	RegisteredAt time.Time
	CheckedInAt  *time.Time
	Status       string
	Source       string
}

type AttendanceTimePoint struct {
	Time        time.Time
	CheckIns    int64
	Cumulative  int64
}

type ScanLocation struct {
	Latitude  float64
	Longitude float64
	Address   string
}
