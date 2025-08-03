package services

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/infrastructure/repositories"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type EventServiceTestSuite struct {
	suite.Suite
	db           *gorm.DB
	eventService *EventServiceImpl
}

func (suite *EventServiceTestSuite) SetupTest() {
	// Use in-memory SQLite for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	suite.Require().NoError(err)

	// Auto-migrate the schema
	err = db.AutoMigrate(&entities.SiteEvent{}, &entities.User{}, &entities.EventAttendee{})
	suite.Require().NoError(err)

	// Initialize repositories
	eventRepo := repositories.NewGormSiteEventRepository(db)
	userRepo := repositories.NewGormUserRepository(db)
	attendeeRepo := repositories.NewGormEventAttendeeRepository(db)

	// Initialize logger
	logger, _ := zap.NewDevelopment()

	// Initialize service
	suite.db = db
	suite.eventService = &EventServiceImpl{
		eventRepo:    eventRepo,
		userRepo:     userRepo,
		attendeeRepo: attendeeRepo,
		logger:       logger,
		db:           db,
	}
}

func (suite *EventServiceTestSuite) TearDownTest() {
	sqlDB, err := suite.db.DB()
	if err == nil {
		sqlDB.Close()
	}
}

func (suite *EventServiceTestSuite) TestCreateEvent() {
	ctx := context.Background()
	
	event := &entities.SiteEvent{
		EventTitle:     "Test Event",
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
		TagName:        "test-tag",
		ScanMessage:    "Welcome to test event",
	}

	err := suite.eventService.CreateEvent(ctx, event)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), event.ID)
	assert.NotEmpty(suite.T(), event.InteractionCode)
}

func (suite *EventServiceTestSuite) TestCreateEventValidation() {
	ctx := context.Background()
	
	// Test missing title
	event := &entities.SiteEvent{
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
	}

	err := suite.eventService.CreateEvent(ctx, event)
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "event title is required")

	// Test invalid date range
	event = &entities.SiteEvent{
		EventTitle:     "Test Event",
		EventStartDate: time.Now().Add(26 * time.Hour),
		EventEndDate:   time.Now().Add(24 * time.Hour), // End before start
	}

	err = suite.eventService.CreateEvent(ctx, event)
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "end date must be after start date")
}

func (suite *EventServiceTestSuite) TestGetEventByID() {
	ctx := context.Background()
	
	// Create test event
	event := &entities.SiteEvent{
		EventTitle:     "Test Event",
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
		TagName:        "test-tag",
	}

	err := suite.eventService.CreateEvent(ctx, event)
	suite.Require().NoError(err)

	// Retrieve event
	retrieved, err := suite.eventService.GetEventByID(ctx, event.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), event.ID, retrieved.ID)
	assert.Equal(suite.T(), event.EventTitle, retrieved.EventTitle)
}

func (suite *EventServiceTestSuite) TestSetCurrentEvent() {
	ctx := context.Background()
	
	// Create two test events
	event1 := &entities.SiteEvent{
		EventTitle:     "Event 1",
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
		IsCurrent:      true,
	}

	event2 := &entities.SiteEvent{
		EventTitle:     "Event 2",
		EventStartDate: time.Now().Add(48 * time.Hour),
		EventEndDate:   time.Now().Add(50 * time.Hour),
		IsCurrent:      false,
	}

	err := suite.eventService.CreateEvent(ctx, event1)
	suite.Require().NoError(err)
	err = suite.eventService.CreateEvent(ctx, event2)
	suite.Require().NoError(err)

	// Set event2 as current
	err = suite.eventService.SetCurrentEvent(ctx, event2.ID)
	assert.NoError(suite.T(), err)

	// Verify current event
	currentEvent, err := suite.eventService.GetCurrentEvent(ctx)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), event2.ID, currentEvent.ID)
}

func (suite *EventServiceTestSuite) TestGetUpcomingEvents() {
	ctx := context.Background()
	
	// Create past event
	pastEvent := &entities.SiteEvent{
		EventTitle:     "Past Event",
		EventStartDate: time.Now().Add(-48 * time.Hour),
		EventEndDate:   time.Now().Add(-24 * time.Hour),
	}

	// Create future event
	futureEvent := &entities.SiteEvent{
		EventTitle:     "Future Event",
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
	}

	err := suite.eventService.CreateEvent(ctx, pastEvent)
	suite.Require().NoError(err)
	err = suite.eventService.CreateEvent(ctx, futureEvent)
	suite.Require().NoError(err)

	// Get upcoming events
	upcomingEvents, err := suite.eventService.GetUpcomingEvents(ctx, 10)
	assert.NoError(suite.T(), err)
	
	// Should only contain future event
	assert.Len(suite.T(), upcomingEvents, 1)
	assert.Equal(suite.T(), futureEvent.ID, upcomingEvents[0].ID)
}

func (suite *EventServiceTestSuite) TestGetEventStatistics() {
	ctx := context.Background()
	
	// Create test event
	event := &entities.SiteEvent{
		EventTitle:     "Test Event",
		EventStartDate: time.Now().Add(24 * time.Hour),
		EventEndDate:   time.Now().Add(26 * time.Hour),
	}

	err := suite.eventService.CreateEvent(ctx, event)
	suite.Require().NoError(err)

	// Get statistics
	stats, err := suite.eventService.GetEventStatistics(ctx, event.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), event.ID, stats.EventID)
	assert.Equal(suite.T(), int64(0), stats.TotalRegistered)
	assert.Equal(suite.T(), int64(0), stats.TotalCheckedIn)
}

func TestEventServiceTestSuite(t *testing.T) {
	suite.Run(t, new(EventServiceTestSuite))
}
