package repositories

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type SiteEventRepositoryTestSuite struct {
	suite.Suite
	db   *gorm.DB
	repo *GormSiteEventRepository
}

func (suite *SiteEventRepositoryTestSuite) SetupTest() {
	// Use in-memory SQLite for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	suite.Require().NoError(err)

	// Auto-migrate the schema
	err = db.AutoMigrate(&entities.SiteEvent{})
	suite.Require().NoError(err)

	suite.db = db
	suite.repo = &GormSiteEventRepository{db: db}
}

func (suite *SiteEventRepositoryTestSuite) TearDownTest() {
	sqlDB, err := suite.db.DB()
	if err == nil {
		sqlDB.Close()
	}
}

func (suite *SiteEventRepositoryTestSuite) TestCreate() {
	ctx := context.Background()
	event := &entities.SiteEvent{
		EventTitle:      "Test Event",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "test-tag",
		InteractionCode: "TEST001",
		ScanMessage:     "Welcome to test event",
	}

	err := suite.repo.Create(ctx, event)
	assert.NoError(suite.T(), err)
	assert.NotEqual(suite.T(), uuid.Nil, event.ID)
}

func (suite *SiteEventRepositoryTestSuite) TestGetByID() {
	ctx := context.Background()

	// Create a test event
	event := &entities.SiteEvent{
		EventTitle:      "Test Event",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "test-tag",
		InteractionCode: "TEST001",
	}

	err := suite.repo.Create(ctx, event)
	suite.Require().NoError(err)

	// Retrieve the event
	retrieved, err := suite.repo.GetByID(ctx, event.ID)
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), retrieved)
	assert.Equal(suite.T(), event.ID, retrieved.ID)
	assert.Equal(suite.T(), event.EventTitle, retrieved.EventTitle)
}

func (suite *SiteEventRepositoryTestSuite) TestGetByInteractionCode() {
	ctx := context.Background()

	// Create a test event
	event := &entities.SiteEvent{
		EventTitle:      "Test Event",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "test-tag",
		InteractionCode: "UNIQUE001",
	}

	err := suite.repo.Create(ctx, event)
	suite.Require().NoError(err)

	// Retrieve by interaction code
	retrieved, err := suite.repo.GetByInteractionCode(ctx, "UNIQUE001")
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), retrieved)
	assert.Equal(suite.T(), event.ID, retrieved.ID)
	assert.Equal(suite.T(), "UNIQUE001", retrieved.InteractionCode)
}

func (suite *SiteEventRepositoryTestSuite) TestSetCurrent() {
	ctx := context.Background()

	// Create two test events
	event1 := &entities.SiteEvent{
		EventTitle:      "Event 1",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "tag1",
		InteractionCode: "EVENT001",
		IsCurrent:       true,
	}

	event2 := &entities.SiteEvent{
		EventTitle:      "Event 2",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "tag2",
		InteractionCode: "EVENT002",
		IsCurrent:       false,
	}

	err := suite.repo.Create(ctx, event1)
	suite.Require().NoError(err)
	err = suite.repo.Create(ctx, event2)
	suite.Require().NoError(err)

	// Set event2 as current
	err = suite.repo.SetCurrent(ctx, event2.ID)
	assert.NoError(suite.T(), err)

	// Verify event2 is current and event1 is not
	retrieved1, err := suite.repo.GetByID(ctx, event1.ID)
	assert.NoError(suite.T(), err)
	assert.False(suite.T(), retrieved1.IsCurrent)

	retrieved2, err := suite.repo.GetByID(ctx, event2.ID)
	assert.NoError(suite.T(), err)
	assert.True(suite.T(), retrieved2.IsCurrent)
}

func (suite *SiteEventRepositoryTestSuite) TestGetAll() {
	ctx := context.Background()

	// Create multiple test events
	for i := 0; i < 5; i++ {
		event := &entities.SiteEvent{
			EventTitle:      fmt.Sprintf("Event %d", i),
			EventStartDate:  time.Now(),
			EventEndDate:    time.Now().Add(2 * time.Hour),
			TagName:         fmt.Sprintf("tag%d", i),
			InteractionCode: fmt.Sprintf("EVENT%03d", i),
		}
		err := suite.repo.Create(ctx, event)
		suite.Require().NoError(err)
	}

	// Get all events with pagination
	events, err := suite.repo.GetAll(ctx, 0, 10)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), events, 5)
}

func (suite *SiteEventRepositoryTestSuite) TestCount() {
	ctx := context.Background()

	// Initially should be 0
	count, err := suite.repo.Count(ctx)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(0), count)

	// Create a test event
	event := &entities.SiteEvent{
		EventTitle:      "Test Event",
		EventStartDate:  time.Now(),
		EventEndDate:    time.Now().Add(2 * time.Hour),
		TagName:         "test-tag",
		InteractionCode: "TEST001",
	}

	err = suite.repo.Create(ctx, event)
	suite.Require().NoError(err)

	// Count should be 1
	count, err = suite.repo.Count(ctx)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), int64(1), count)
}

func TestSiteEventRepositoryTestSuite(t *testing.T) {
	suite.Run(t, new(SiteEventRepositoryTestSuite))
}
