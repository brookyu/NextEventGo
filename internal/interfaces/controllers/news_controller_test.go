package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"go.uber.org/zap/zaptest"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
	"github.com/zenteam/nextevent-go/internal/interfaces/mappers"
)

// MockNewsManagementService is a mock implementation
type MockNewsManagementService struct {
	mock.Mock
}

func (m *MockNewsManagementService) CreateNews(ctx context.Context, req *services.NewsCreateRequest) (*services.NewsResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) GetNews(ctx context.Context, id uuid.UUID) (*services.NewsResponse, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) UpdateNews(ctx context.Context, id uuid.UUID, req *services.NewsUpdateRequest) (*services.NewsResponse, error) {
	args := m.Called(ctx, id, req)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) DeleteNews(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsManagementService) ListNews(ctx context.Context, filter *services.NewsListFilter) (*services.NewsListResponse, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(*services.NewsListResponse), args.Error(1)
}

func (m *MockNewsManagementService) PublishNews(ctx context.Context, id uuid.UUID) (*services.NewsResponse, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) UnpublishNews(ctx context.Context, id uuid.UUID) (*services.NewsResponse, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) ScheduleNews(ctx context.Context, id uuid.UUID, scheduledAt time.Time) (*services.NewsResponse, error) {
	args := m.Called(ctx, id, scheduledAt)
	return args.Get(0).(*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) GetPublishedNews(ctx context.Context, filter *services.NewsListFilter) (*services.NewsListResponse, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(*services.NewsListResponse), args.Error(1)
}

func (m *MockNewsManagementService) GetFeaturedNews(ctx context.Context, limit int) ([]*services.NewsResponse, error) {
	args := m.Called(ctx, limit)
	return args.Get(0).([]*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) GetTrendingNews(ctx context.Context, days, limit int) ([]*services.NewsResponse, error) {
	args := m.Called(ctx, days, limit)
	return args.Get(0).([]*services.NewsResponse), args.Error(1)
}

func (m *MockNewsManagementService) SearchNews(ctx context.Context, query string, filter *services.NewsListFilter) (*services.NewsListResponse, error) {
	args := m.Called(ctx, query, filter)
	return args.Get(0).(*services.NewsListResponse), args.Error(1)
}

// MockWeChatNewsService is a mock implementation
type MockWeChatNewsService struct {
	mock.Mock
}

func (m *MockWeChatNewsService) CreateDraft(ctx context.Context, newsID uuid.UUID) (*services.WeChatDraftResponse, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).(*services.WeChatDraftResponse), args.Error(1)
}

func (m *MockWeChatNewsService) PublishDraft(ctx context.Context, newsID uuid.UUID) (*services.WeChatPublishResponse, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).(*services.WeChatPublishResponse), args.Error(1)
}

func (m *MockWeChatNewsService) UpdateDraft(ctx context.Context, newsID uuid.UUID) (*services.WeChatDraftResponse, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).(*services.WeChatDraftResponse), args.Error(1)
}

func (m *MockWeChatNewsService) GetStatus(ctx context.Context, newsID uuid.UUID) (*services.WeChatStatusResponse, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).(*services.WeChatStatusResponse), args.Error(1)
}

func (m *MockWeChatNewsService) SyncFromWeChat(ctx context.Context, newsID uuid.UUID) (*services.WeChatSyncResponse, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).(*services.WeChatSyncResponse), args.Error(1)
}

// MockNewsMapper is a mock implementation
type MockNewsMapper struct {
	mock.Mock
}

func (m *MockNewsMapper) ToNewsListItemDTO(ctx context.Context, news *entities.News) (*dto.NewsListItemDTO, error) {
	args := m.Called(ctx, news)
	return args.Get(0).(*dto.NewsListItemDTO), args.Error(1)
}

func (m *MockNewsMapper) ToNewsDetailDTO(ctx context.Context, news *entities.News, includeRelated bool) (*dto.NewsDetailDTO, error) {
	args := m.Called(ctx, news, includeRelated)
	return args.Get(0).(*dto.NewsDetailDTO), args.Error(1)
}

func (m *MockNewsMapper) ToNewsForEditingDTO(ctx context.Context, news *entities.News, newsArticles []*entities.NewsArticle) (*dto.NewsForEditingDTO, error) {
	args := m.Called(ctx, news, newsArticles)
	return args.Get(0).(*dto.NewsForEditingDTO), args.Error(1)
}

func (m *MockNewsMapper) ToNewsListResponseDTO(ctx context.Context, newsList []*entities.News, total int64, page, pageSize int) (*dto.NewsListResponseDTO, error) {
	args := m.Called(ctx, newsList, total, page, pageSize)
	return args.Get(0).(*dto.NewsListResponseDTO), args.Error(1)
}

// NewsControllerTestSuite defines the test suite
type NewsControllerTestSuite struct {
	suite.Suite
	controller         *NewsController
	mockNewsService    *MockNewsManagementService
	mockWeChatService  *MockWeChatNewsService
	mockMapper         *MockNewsMapper
	router             *gin.Engine
	ctx                context.Context
}

// SetupTest sets up the test suite
func (suite *NewsControllerTestSuite) SetupTest() {
	gin.SetMode(gin.TestMode)

	suite.mockNewsService = new(MockNewsManagementService)
	suite.mockWeChatService = new(MockWeChatNewsService)
	suite.mockMapper = new(MockNewsMapper)
	suite.ctx = context.Background()

	logger := zaptest.NewLogger(suite.T())

	suite.controller = NewNewsController(
		suite.mockNewsService,
		suite.mockWeChatService,
		suite.mockMapper,
		logger,
	)

	suite.router = gin.New()
	suite.setupRoutes()
}

// TearDownTest cleans up after each test
func (suite *NewsControllerTestSuite) TearDownTest() {
	suite.mockNewsService.AssertExpectations(suite.T())
	suite.mockWeChatService.AssertExpectations(suite.T())
	suite.mockMapper.AssertExpectations(suite.T())
}

// setupRoutes sets up the test routes
func (suite *NewsControllerTestSuite) setupRoutes() {
	api := suite.router.Group("/api/news")
	{
		api.POST("", suite.controller.CreateNews)
		api.GET("/:id", suite.controller.GetNews)
		api.PUT("/:id", suite.controller.UpdateNews)
		api.DELETE("/:id", suite.controller.DeleteNews)
		api.GET("", suite.controller.ListNews)
		api.POST("/:id/publish", suite.controller.PublishNews)
		api.POST("/:id/unpublish", suite.controller.UnpublishNews)
		api.POST("/:id/schedule", suite.controller.ScheduleNews)
		api.GET("/published", suite.controller.GetPublishedNews)
		api.GET("/featured", suite.controller.GetFeaturedNews)
		api.GET("/trending", suite.controller.GetTrendingNews)
		api.GET("/search", suite.controller.SearchNews)
	}
}

// Test CreateNews endpoint
func (suite *NewsControllerTestSuite) TestCreateNews_Success() {
	// Arrange
	articleID := uuid.New()
	requestDTO := dto.CreateNewsRequestDTO{
		Title:       "Test News",
		Subtitle:    "Test Subtitle",
		Description: "Test Description",
		Type:        "regular",
		Priority:    "normal",
		ArticleIDs:  []uuid.UUID{articleID},
		ArticleSettings: map[uuid.UUID]dto.NewsArticleSettings{
			articleID: {IsMainStory: true, IsFeatured: true},
		},
	}

	expectedResponse := &services.NewsResponse{
		ID:       uuid.New(),
		Title:    requestDTO.Title,
		Subtitle: requestDTO.Subtitle,
		Status:   "draft",
		Type:     requestDTO.Type,
		Priority: requestDTO.Priority,
	}

	suite.mockNewsService.On("CreateNews", mock.Anything, mock.AnythingOfType("*services.NewsCreateRequest")).Return(expectedResponse, nil)

	requestBody, _ := json.Marshal(requestDTO)

	// Act
	req, _ := http.NewRequest("POST", "/api/news", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News created successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Test CreateNews with invalid request
func (suite *NewsControllerTestSuite) TestCreateNews_InvalidRequest() {
	// Arrange
	invalidRequest := map[string]interface{}{
		"title": "", // Empty title should fail validation
		"type":  "invalid_type",
	}

	requestBody, _ := json.Marshal(invalidRequest)

	// Act
	req, _ := http.NewRequest("POST", "/api/news", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusBadRequest, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Contains(suite.T(), response["message"], "Invalid request body")
}

// Test GetNews endpoint
func (suite *NewsControllerTestSuite) TestGetNews_Success() {
	// Arrange
	newsID := uuid.New()
	expectedResponse := &services.NewsResponse{
		ID:       newsID,
		Title:    "Test News",
		Status:   "published",
		Type:     "regular",
		Priority: "normal",
	}

	suite.mockNewsService.On("GetNews", mock.Anything, newsID).Return(expectedResponse, nil)

	// Act
	req, _ := http.NewRequest("GET", "/api/news/"+newsID.String(), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News retrieved successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Test GetNews not found
func (suite *NewsControllerTestSuite) TestGetNews_NotFound() {
	// Arrange
	newsID := uuid.New()
	suite.mockNewsService.On("GetNews", mock.Anything, newsID).Return((*services.NewsResponse)(nil), assert.AnError)

	// Act
	req, _ := http.NewRequest("GET", "/api/news/"+newsID.String(), nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusInternalServerError, w.Code)
}

// Test ListNews endpoint
func (suite *NewsControllerTestSuite) TestListNews_Success() {
	// Arrange
	expectedResponse := &services.NewsListResponse{
		News: []*services.NewsResponse{
			{
				ID:       uuid.New(),
				Title:    "News 1",
				Status:   "published",
				Type:     "regular",
				Priority: "normal",
			},
			{
				ID:       uuid.New(),
				Title:    "News 2",
				Status:   "draft",
				Type:     "breaking",
				Priority: "high",
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	suite.mockNewsService.On("ListNews", mock.Anything, mock.AnythingOfType("*services.NewsListFilter")).Return(expectedResponse, nil)

	// Act
	req, _ := http.NewRequest("GET", "/api/news?page=1&pageSize=10", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News list retrieved successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Test PublishNews endpoint
func (suite *NewsControllerTestSuite) TestPublishNews_Success() {
	// Arrange
	newsID := uuid.New()
	expectedResponse := &services.NewsResponse{
		ID:          newsID,
		Title:       "Test News",
		Status:      "published",
		PublishedAt: &time.Time{},
	}
	now := time.Now()
	expectedResponse.PublishedAt = &now

	suite.mockNewsService.On("PublishNews", mock.Anything, newsID).Return(expectedResponse, nil)

	// Act
	req, _ := http.NewRequest("POST", "/api/news/"+newsID.String()+"/publish", nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News published successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Test ScheduleNews endpoint
func (suite *NewsControllerTestSuite) TestScheduleNews_Success() {
	// Arrange
	newsID := uuid.New()
	scheduledTime := time.Now().Add(24 * time.Hour)
	
	scheduleRequest := map[string]interface{}{
		"scheduledAt": scheduledTime.Format(time.RFC3339),
	}

	expectedResponse := &services.NewsResponse{
		ID:          newsID,
		Title:       "Test News",
		Status:      "scheduled",
		ScheduledAt: &scheduledTime,
	}

	suite.mockNewsService.On("ScheduleNews", mock.Anything, newsID, mock.AnythingOfType("time.Time")).Return(expectedResponse, nil)

	requestBody, _ := json.Marshal(scheduleRequest)

	// Act
	req, _ := http.NewRequest("POST", "/api/news/"+newsID.String()+"/schedule", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News scheduled successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Test SearchNews endpoint
func (suite *NewsControllerTestSuite) TestSearchNews_Success() {
	// Arrange
	query := "test query"
	expectedResponse := &services.NewsListResponse{
		News: []*services.NewsResponse{
			{
				ID:       uuid.New(),
				Title:    "Test News with Query",
				Status:   "published",
				Type:     "regular",
				Priority: "normal",
			},
		},
		Total:      1,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	suite.mockNewsService.On("SearchNews", mock.Anything, query, mock.AnythingOfType("*services.NewsListFilter")).Return(expectedResponse, nil)

	// Act
	req, _ := http.NewRequest("GET", "/api/news/search?q="+query, nil)
	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	// Assert
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "News search completed successfully", response["message"])
	assert.NotNil(suite.T(), response["data"])
}

// Run the test suite
func TestNewsControllerTestSuite(t *testing.T) {
	suite.Run(t, new(NewsControllerTestSuite))
}
