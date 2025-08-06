package services

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"go.uber.org/zap/zaptest"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// MockAnalyticsService is a mock implementation
type MockAnalyticsService struct {
	mock.Mock
}

func (m *MockAnalyticsService) TrackView(ctx context.Context, resourceID uuid.UUID, resourceType string, data *ViewTrackingData) error {
	args := m.Called(ctx, resourceID, resourceType, data)
	return args.Error(0)
}

func (m *MockAnalyticsService) TrackRead(ctx context.Context, resourceID uuid.UUID, resourceType string, data *ReadTrackingData) error {
	args := m.Called(ctx, resourceID, resourceType, data)
	return args.Error(0)
}

func (m *MockAnalyticsService) TrackShare(ctx context.Context, resourceID uuid.UUID, resourceType string, data *ShareTrackingData) error {
	args := m.Called(ctx, resourceID, resourceType, data)
	return args.Error(0)
}

func (m *MockAnalyticsService) TrackHit(ctx context.Context, hit *entities.Hit) error {
	args := m.Called(ctx, hit)
	return args.Error(0)
}

func (m *MockAnalyticsService) GetHitAnalytics(ctx context.Context, filter *repositories.HitAnalyticsFilter) (*repositories.HitAnalytics, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(*repositories.HitAnalytics), args.Error(1)
}

func (m *MockAnalyticsService) GetDailyStats(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.DailyHitStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.DailyHitStats), args.Error(1)
}

// MockHitRepository is a mock implementation
type MockHitRepository struct {
	mock.Mock
}

func (m *MockHitRepository) Create(ctx context.Context, hit *entities.Hit) error {
	args := m.Called(ctx, hit)
	return args.Error(0)
}

func (m *MockHitRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Hit, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.Hit), args.Error(1)
}

func (m *MockHitRepository) Update(ctx context.Context, hit *entities.Hit) error {
	args := m.Called(ctx, hit)
	return args.Error(0)
}

func (m *MockHitRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockHitRepository) List(ctx context.Context, filter *repositories.HitAnalyticsFilter) ([]*entities.Hit, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.Hit), args.Get(1).(int64), args.Error(2)
}

func (m *MockHitRepository) GetAnalytics(ctx context.Context, filter *repositories.HitAnalyticsFilter) (*repositories.HitAnalytics, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(*repositories.HitAnalytics), args.Error(1)
}

func (m *MockHitRepository) GetDailyStats(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.DailyHitStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.DailyHitStats), args.Error(1)
}

func (m *MockHitRepository) GetTopReferrers(ctx context.Context, resourceID uuid.UUID, resourceType string, limit int, days int) ([]*repositories.ReferrerStats, error) {
	args := m.Called(ctx, resourceID, resourceType, limit, days)
	return args.Get(0).([]*repositories.ReferrerStats), args.Error(1)
}

func (m *MockHitRepository) GetUserEngagement(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.UserEngagementStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.UserEngagementStats), args.Error(1)
}

func (m *MockHitRepository) GetReadingAnalytics(ctx context.Context, resourceID uuid.UUID, days int) (*repositories.ReadingAnalytics, error) {
	args := m.Called(ctx, resourceID, days)
	return args.Get(0).(*repositories.ReadingAnalytics), args.Error(1)
}

func (m *MockHitRepository) GetGeographicStats(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.GeographicStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.GeographicStats), args.Error(1)
}

func (m *MockHitRepository) GetDeviceStats(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.DeviceStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.DeviceStats), args.Error(1)
}

func (m *MockHitRepository) GetBrowserStats(ctx context.Context, resourceID uuid.UUID, resourceType string, days int) ([]*repositories.BrowserStats, error) {
	args := m.Called(ctx, resourceID, resourceType, days)
	return args.Get(0).([]*repositories.BrowserStats), args.Error(1)
}

func (m *MockHitRepository) GetPromotionStats(ctx context.Context, promotionCode string, days int) (*repositories.PromotionAnalytics, error) {
	args := m.Called(ctx, promotionCode, days)
	return args.Get(0).(*repositories.PromotionAnalytics), args.Error(1)
}

func (m *MockHitRepository) GetTopPromotions(ctx context.Context, limit int, days int) ([]*repositories.PromotionStats, error) {
	args := m.Called(ctx, limit, days)
	return args.Get(0).([]*repositories.PromotionStats), args.Error(1)
}

func (m *MockHitRepository) Count(ctx context.Context) (int64, error) {
	args := m.Called(ctx)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockHitRepository) CountByResource(ctx context.Context, resourceID uuid.UUID, resourceType string) (int64, error) {
	args := m.Called(ctx, resourceID, resourceType)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockHitRepository) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	args := m.Called(ctx, userID)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockHitRepository) CountByFilter(ctx context.Context, filter *repositories.HitAnalyticsFilter) (int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockHitRepository) CreateBatch(ctx context.Context, hits []*entities.Hit) error {
	args := m.Called(ctx, hits)
	return args.Error(0)
}

func (m *MockHitRepository) DeleteOldHits(ctx context.Context, olderThan time.Time) (int64, error) {
	args := m.Called(ctx, olderThan)
	return args.Get(0).(int64), args.Error(1)
}

// NewsAnalyticsServiceTestSuite defines the test suite
type NewsAnalyticsServiceTestSuite struct {
	suite.Suite
	service           *NewsAnalyticsService
	mockNewsRepo      *MockNewsRepository
	mockHitRepo       *MockHitRepository
	mockAnalytics     *MockAnalyticsService
	ctx               context.Context
	config            *NewsAnalyticsConfig
}

// SetupTest sets up the test suite
func (suite *NewsAnalyticsServiceTestSuite) SetupTest() {
	suite.mockNewsRepo = new(MockNewsRepository)
	suite.mockHitRepo = new(MockHitRepository)
	suite.mockAnalytics = new(MockAnalyticsService)
	suite.ctx = context.Background()

	logger := zaptest.NewLogger(suite.T())
	suite.config = DefaultNewsAnalyticsConfig()

	suite.service = NewNewsAnalyticsService(
		suite.mockNewsRepo,
		suite.mockHitRepo,
		suite.mockAnalytics,
		logger,
		suite.config,
	)
}

// TearDownTest cleans up after each test
func (suite *NewsAnalyticsServiceTestSuite) TearDownTest() {
	suite.mockNewsRepo.AssertExpectations(suite.T())
	suite.mockHitRepo.AssertExpectations(suite.T())
	suite.mockAnalytics.AssertExpectations(suite.T())
}

// Test TrackNewsView functionality
func (suite *NewsAnalyticsServiceTestSuite) TestTrackNewsView_Success() {
	// Arrange
	newsID := uuid.New()
	userID := uuid.New()
	
	trackingData := &NewsViewTrackingData{
		UserID:      &userID,
		SessionID:   "session123",
		IPAddress:   "192.168.1.1",
		UserAgent:   "Mozilla/5.0",
		ViewSource:  "web",
		ViewContext: "list",
	}

	suite.mockAnalytics.On("TrackView", suite.ctx, newsID, "news", mock.AnythingOfType("*services.ViewTrackingData")).Return(nil)

	// Act
	err := suite.service.TrackNewsView(suite.ctx, newsID, trackingData)

	// Assert
	assert.NoError(suite.T(), err)
}

// Test TrackNewsView with tracking disabled
func (suite *NewsAnalyticsServiceTestSuite) TestTrackNewsView_TrackingDisabled() {
	// Arrange
	suite.config.EnableRealTimeTracking = false
	newsID := uuid.New()
	trackingData := &NewsViewTrackingData{
		SessionID: "session123",
	}

	// Act
	err := suite.service.TrackNewsView(suite.ctx, newsID, trackingData)

	// Assert
	assert.NoError(suite.T(), err)
	// No mock expectations should be called
}

// Test TrackNewsRead functionality
func (suite *NewsAnalyticsServiceTestSuite) TestTrackNewsRead_Success() {
	// Arrange
	newsID := uuid.New()
	userID := uuid.New()
	
	trackingData := &NewsReadTrackingData{
		NewsViewTrackingData: NewsViewTrackingData{
			UserID:    &userID,
			SessionID: "session123",
			IPAddress: "192.168.1.1",
		},
		ReadDuration:   120,
		ReadPercentage: 85.5,
		ScrollDepth:    90.0,
		ArticlesRead:   2,
	}

	suite.mockAnalytics.On("TrackRead", suite.ctx, newsID, "news", mock.AnythingOfType("*services.ReadTrackingData")).Return(nil)

	// Act
	err := suite.service.TrackNewsRead(suite.ctx, newsID, trackingData)

	// Assert
	assert.NoError(suite.T(), err)
}

// Test TrackNewsShare functionality
func (suite *NewsAnalyticsServiceTestSuite) TestTrackNewsShare_Success() {
	// Arrange
	newsID := uuid.New()
	userID := uuid.New()
	
	trackingData := &NewsShareTrackingData{
		NewsViewTrackingData: NewsViewTrackingData{
			UserID:    &userID,
			SessionID: "session123",
			IPAddress: "192.168.1.1",
		},
		SharePlatform: "wechat",
		ShareType:     "link",
	}

	suite.mockAnalytics.On("TrackShare", suite.ctx, newsID, "news", mock.AnythingOfType("*services.ShareTrackingData")).Return(nil)

	// Act
	err := suite.service.TrackNewsShare(suite.ctx, newsID, trackingData)

	// Assert
	assert.NoError(suite.T(), err)
}

// Test TrackNewsEngagement functionality
func (suite *NewsAnalyticsServiceTestSuite) TestTrackNewsEngagement_Success() {
	// Arrange
	newsID := uuid.New()
	userID := uuid.New()
	
	trackingData := &NewsEngagementTrackingData{
		NewsViewTrackingData: NewsViewTrackingData{
			UserID:    &userID,
			SessionID: "session123",
			IPAddress: "192.168.1.1",
		},
		EngagementType:  "like",
		EngagementValue: "positive",
	}

	suite.mockAnalytics.On("TrackHit", suite.ctx, mock.AnythingOfType("*entities.Hit")).Return(nil)

	// Act
	err := suite.service.TrackNewsEngagement(suite.ctx, newsID, trackingData)

	// Assert
	assert.NoError(suite.T(), err)
}

// Test GetNewsAnalytics functionality
func (suite *NewsAnalyticsServiceTestSuite) TestGetNewsAnalytics_Success() {
	// Arrange
	newsID := uuid.New()
	days := 30
	
	news := &entities.News{
		ID:          newsID,
		Title:       "Test News",
		PublishedAt: &time.Time{},
	}
	now := time.Now()
	news.PublishedAt = &now

	hitAnalytics := &repositories.HitAnalytics{
		TotalHits:      1000,
		TotalViews:     800,
		TotalReads:     600,
		TotalShares:    50,
		UniqueUsers:    400,
		UniqueVisitors: 400,
		ReturnVisitors: 100,
		BounceRate:     25.5,
		AvgReadTime:    120.0,
		LastActivity:   time.Now(),
		TopCountries:   []repositories.GeographicStats{},
		TopDevices:     []repositories.DeviceStats{},
		TopBrowsers:    []repositories.BrowserStats{},
	}

	dailyStats := []*repositories.DailyHitStats{
		{
			Date:        time.Now().AddDate(0, 0, -1),
			Views:       100,
			Reads:       80,
			UniqueUsers: 50,
			AvgReadTime: 110.0,
		},
	}

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return(news, nil)
	suite.mockAnalytics.On("GetHitAnalytics", suite.ctx, mock.AnythingOfType("*repositories.HitAnalyticsFilter")).Return(hitAnalytics, nil)
	suite.mockAnalytics.On("GetDailyStats", suite.ctx, newsID, "news", days).Return(dailyStats, nil)

	// Act
	result, err := suite.service.GetNewsAnalytics(suite.ctx, newsID, days)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), newsID, result.NewsID)
	assert.Equal(suite.T(), news.Title, result.Title)
	assert.NotNil(suite.T(), result.OverallStats)
	assert.Equal(suite.T(), hitAnalytics.TotalViews, result.OverallStats.TotalViews)
	assert.Equal(suite.T(), hitAnalytics.TotalReads, result.OverallStats.TotalReads)
	assert.Equal(suite.T(), hitAnalytics.TotalShares, result.OverallStats.TotalShares)
	assert.Len(suite.T(), result.DailyStats, 1)
	assert.NotNil(suite.T(), result.GeographicData)
	assert.NotNil(suite.T(), result.DeviceData)
	assert.NotNil(suite.T(), result.ReferrerData)
	assert.NotNil(suite.T(), result.EngagementData)
}

// Test GetNewsAnalytics with news not found
func (suite *NewsAnalyticsServiceTestSuite) TestGetNewsAnalytics_NewsNotFound() {
	// Arrange
	newsID := uuid.New()
	days := 30

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return((*entities.News)(nil), assert.AnError)

	// Act
	result, err := suite.service.GetNewsAnalytics(suite.ctx, newsID, days)

	// Assert
	assert.Error(suite.T(), err)
	assert.Nil(suite.T(), result)
	assert.Contains(suite.T(), err.Error(), "failed to get news")
}

// Test GetNewsOverallStats functionality
func (suite *NewsAnalyticsServiceTestSuite) TestGetNewsOverallStats_Success() {
	// Arrange
	newsID := uuid.New()
	
	news := &entities.News{
		ID:          newsID,
		Title:       "Test News",
		PublishedAt: &time.Time{},
	}
	now := time.Now()
	news.PublishedAt = &now

	hitAnalytics := &repositories.HitAnalytics{
		TotalViews:     500,
		TotalReads:     400,
		TotalShares:    25,
		UniqueVisitors: 200,
		ReturnVisitors: 50,
		BounceRate:     20.0,
		AvgReadTime:    90.0,
		LastActivity:   time.Now(),
	}

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return(news, nil)
	suite.mockAnalytics.On("GetHitAnalytics", suite.ctx, mock.AnythingOfType("*repositories.HitAnalyticsFilter")).Return(hitAnalytics, nil)

	// Act
	result, err := suite.service.GetNewsOverallStats(suite.ctx, newsID)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), hitAnalytics.TotalViews, result.TotalViews)
	assert.Equal(suite.T(), hitAnalytics.TotalReads, result.TotalReads)
	assert.Equal(suite.T(), hitAnalytics.TotalShares, result.TotalShares)
	assert.Equal(suite.T(), hitAnalytics.UniqueVisitors, result.UniqueVisitors)
	assert.Equal(suite.T(), hitAnalytics.ReturnVisitors, result.ReturnVisitors)
	assert.Equal(suite.T(), hitAnalytics.BounceRate, result.BounceRate)
	assert.Equal(suite.T(), int(hitAnalytics.AvgReadTime), result.AvgReadTime)
	assert.Equal(suite.T(), news.PublishedAt, result.PublishedAt)
}

// Test GetNewsDailyStats functionality
func (suite *NewsAnalyticsServiceTestSuite) TestGetNewsDailyStats_Success() {
	// Arrange
	newsID := uuid.New()
	days := 7

	dailyStats := []*repositories.DailyHitStats{
		{
			Date:        time.Now().AddDate(0, 0, -1),
			Views:       100,
			Reads:       80,
			UniqueUsers: 50,
			AvgReadTime: 110.0,
		},
		{
			Date:        time.Now().AddDate(0, 0, -2),
			Views:       120,
			Reads:       95,
			UniqueUsers: 60,
			AvgReadTime: 105.0,
		},
	}

	suite.mockAnalytics.On("GetDailyStats", suite.ctx, newsID, "news", days).Return(dailyStats, nil)

	// Act
	result, err := suite.service.GetNewsDailyStats(suite.ctx, newsID, days)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Len(suite.T(), result, 2)
	assert.Equal(suite.T(), dailyStats[0].Views, result[0].Views)
	assert.Equal(suite.T(), dailyStats[0].Reads, result[0].Reads)
	assert.Equal(suite.T(), dailyStats[0].UniqueUsers, result[0].UniqueVisitors)
	assert.Equal(suite.T(), int(dailyStats[0].AvgReadTime), result[0].AvgReadTime)
}

// Test engagement rate calculation
func (suite *NewsAnalyticsServiceTestSuite) TestCalculateEngagementRate() {
	testCases := []struct {
		name           string
		totalViews     int64
		totalShares    int64
		totalReads     int64
		expectedRate   float64
	}{
		{
			name:         "Normal engagement",
			totalViews:   1000,
			totalShares:  50,
			totalReads:   800,
			expectedRate: 85.0, // (50 + 800) / 1000 * 100
		},
		{
			name:         "Zero views",
			totalViews:   0,
			totalShares:  10,
			totalReads:   5,
			expectedRate: 0.0,
		},
		{
			name:         "High engagement",
			totalViews:   100,
			totalShares:  20,
			totalReads:   90,
			expectedRate: 110.0, // (20 + 90) / 100 * 100
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			hitAnalytics := &repositories.HitAnalytics{
				TotalViews:  tc.totalViews,
				TotalShares: tc.totalShares,
				TotalReads:  tc.totalReads,
			}

			rate := suite.service.calculateEngagementRate(hitAnalytics)
			assert.Equal(t, tc.expectedRate, rate)
		})
	}
}

// Run the test suite
func TestNewsAnalyticsServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NewsAnalyticsServiceTestSuite))
}
