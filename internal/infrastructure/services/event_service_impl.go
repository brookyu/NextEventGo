package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// EventServiceImpl implements the EventService interface
type EventServiceImpl struct {
	eventRepo    repositories.SiteEventRepository
	userRepo     repositories.UserRepository
	attendeeRepo repositories.EventAttendeeRepository
	logger       *zap.Logger
	db           *gorm.DB
}

// NewEventService creates a new event service implementation
func NewEventService(
	eventRepo repositories.SiteEventRepository,
	userRepo repositories.UserRepository,
	attendeeRepo repositories.EventAttendeeRepository,
	logger *zap.Logger,
	db *gorm.DB,
) services.EventService {
	return &EventServiceImpl{
		eventRepo:    eventRepo,
		userRepo:     userRepo,
		attendeeRepo: attendeeRepo,
		logger:       logger,
		db:           db,
	}
}

// CreateEvent creates a new event
func (s *EventServiceImpl) CreateEvent(ctx context.Context, event *entities.SiteEvent) error {
	s.logger.Info("Creating new event", zap.String("title", event.EventTitle))
	
	// Validate event data
	if err := s.validateEvent(event); err != nil {
		return fmt.Errorf("event validation failed: %w", err)
	}
	
	// Generate interaction code if not provided
	if event.InteractionCode == "" {
		event.InteractionCode = s.generateInteractionCode()
	}
	
	return s.eventRepo.Create(ctx, event)
}

// GetEventByID retrieves an event by ID
func (s *EventServiceImpl) GetEventByID(ctx context.Context, id uuid.UUID) (*entities.SiteEvent, error) {
	return s.eventRepo.GetByID(ctx, id)
}

// GetEventByInteractionCode retrieves an event by interaction code
func (s *EventServiceImpl) GetEventByInteractionCode(ctx context.Context, code string) (*entities.SiteEvent, error) {
	return s.eventRepo.GetByInteractionCode(ctx, code)
}

// GetCurrentEvent retrieves the current active event
func (s *EventServiceImpl) GetCurrentEvent(ctx context.Context) (*entities.SiteEvent, error) {
	return s.eventRepo.GetCurrent(ctx)
}

// GetAllEvents retrieves all events with pagination
func (s *EventServiceImpl) GetAllEvents(ctx context.Context, offset, limit int) ([]*entities.SiteEvent, error) {
	return s.eventRepo.GetAll(ctx, offset, limit)
}

// UpdateEvent updates an existing event
func (s *EventServiceImpl) UpdateEvent(ctx context.Context, event *entities.SiteEvent) error {
	s.logger.Info("Updating event", zap.String("id", event.ID.String()))
	
	// Validate event data
	if err := s.validateEvent(event); err != nil {
		return fmt.Errorf("event validation failed: %w", err)
	}
	
	return s.eventRepo.Update(ctx, event)
}

// DeleteEvent soft deletes an event
func (s *EventServiceImpl) DeleteEvent(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Deleting event", zap.String("id", id.String()))
	return s.eventRepo.Delete(ctx, id)
}

// SetCurrentEvent sets an event as the current active event
func (s *EventServiceImpl) SetCurrentEvent(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Setting current event", zap.String("id", id.String()))
	return s.eventRepo.SetCurrent(ctx, id)
}

// SearchEvents searches events based on criteria
func (s *EventServiceImpl) SearchEvents(ctx context.Context, query *services.EventSearchQuery) ([]*entities.SiteEvent, error) {
	// For now, implement basic search using existing repository methods
	// In a full implementation, this would use more sophisticated search
	return s.eventRepo.GetAll(ctx, query.Offset, query.Limit)
}

// GetEventsByDateRange retrieves events within a date range
func (s *EventServiceImpl) GetEventsByDateRange(ctx context.Context, startDate, endDate time.Time) ([]*entities.SiteEvent, error) {
	// This would require a new repository method for date range queries
	// For now, return all events and filter in memory (not efficient for production)
	events, err := s.eventRepo.GetAll(ctx, 0, 1000)
	if err != nil {
		return nil, err
	}
	
	var filtered []*entities.SiteEvent
	for _, event := range events {
		if event.EventStartDate.After(startDate) && event.EventEndDate.Before(endDate) {
			filtered = append(filtered, event)
		}
	}
	
	return filtered, nil
}

// GetUpcomingEvents retrieves upcoming events
func (s *EventServiceImpl) GetUpcomingEvents(ctx context.Context, limit int) ([]*entities.SiteEvent, error) {
	now := time.Now()
	return s.GetEventsByDateRange(ctx, now, now.AddDate(1, 0, 0)) // Next year
}

// GetEventStatistics retrieves event analytics
func (s *EventServiceImpl) GetEventStatistics(ctx context.Context, eventID uuid.UUID) (*services.EventStatistics, error) {
	s.logger.Info("Getting event statistics", zap.String("event_id", eventID.String()))
	
	// This would require attendee repository methods
	// For now, return basic statistics
	stats := &services.EventStatistics{
		EventID:           eventID,
		TotalRegistered:   0,
		TotalCheckedIn:    0,
		CheckInRate:       0.0,
		RegistrationTrend: []services.RegistrationPoint{},
		CheckInTrend:      []services.CheckInPoint{},
		TopSources:        []services.SourceStatistic{},
	}
	
	return stats, nil
}

// GetEventAttendanceReport generates attendance report
func (s *EventServiceImpl) GetEventAttendanceReport(ctx context.Context, eventID uuid.UUID) (*services.AttendanceReport, error) {
	s.logger.Info("Generating attendance report", zap.String("event_id", eventID.String()))
	
	event, err := s.GetEventByID(ctx, eventID)
	if err != nil {
		return nil, err
	}
	
	report := &services.AttendanceReport{
		EventID:         eventID,
		EventTitle:      event.EventTitle,
		TotalCapacity:   1000, // This would come from event configuration
		TotalRegistered: 0,
		TotalCheckedIn:  0,
		CheckInRate:     0.0,
		Attendees:       []services.AttendeeInfo{},
		Timeline:        []services.AttendanceTimePoint{},
	}
	
	return report, nil
}

// Helper methods

// validateEvent validates event data
func (s *EventServiceImpl) validateEvent(event *entities.SiteEvent) error {
	if event.EventTitle == "" {
		return fmt.Errorf("event title is required")
	}
	
	if event.EventStartDate.IsZero() {
		return fmt.Errorf("event start date is required")
	}
	
	if event.EventEndDate.IsZero() {
		return fmt.Errorf("event end date is required")
	}
	
	if event.EventEndDate.Before(event.EventStartDate) {
		return fmt.Errorf("event end date must be after start date")
	}
	
	return nil
}

// generateInteractionCode generates a unique interaction code
func (s *EventServiceImpl) generateInteractionCode() string {
	// Generate a simple interaction code
	// In production, this would be more sophisticated
	return fmt.Sprintf("EVT%d", time.Now().Unix()%100000)
}
