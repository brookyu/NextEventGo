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

// MockNewsRepository is a mock implementation of NewsRepository
type MockNewsRepository struct {
	mock.Mock
}

func (m *MockNewsRepository) Create(ctx context.Context, news *entities.News) error {
	args := m.Called(ctx, news)
	return args.Error(0)
}

func (m *MockNewsRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.News, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.News), args.Error(1)
}

func (m *MockNewsRepository) Update(ctx context.Context, news *entities.News) error {
	args := m.Called(ctx, news)
	return args.Error(0)
}

func (m *MockNewsRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) List(ctx context.Context, filter *repositories.NewsFilter) ([]*entities.News, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.News), args.Get(1).(int64), args.Error(2)
}

func (m *MockNewsRepository) GetBySlug(ctx context.Context, slug string) (*entities.News, error) {
	args := m.Called(ctx, slug)
	return args.Get(0).(*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetPublished(ctx context.Context, filter *repositories.NewsFilter) ([]*entities.News, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.News), args.Get(1).(int64), args.Error(2)
}

func (m *MockNewsRepository) GetFeatured(ctx context.Context, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetTrending(ctx context.Context, days int, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, days, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, filter *repositories.NewsFilter) ([]*entities.News, int64, error) {
	args := m.Called(ctx, categoryID, filter)
	return args.Get(0).([]*entities.News), args.Get(1).(int64), args.Error(2)
}

func (m *MockNewsRepository) GetByAuthor(ctx context.Context, authorID uuid.UUID, filter *repositories.NewsFilter) ([]*entities.News, int64, error) {
	args := m.Called(ctx, authorID, filter)
	return args.Get(0).([]*entities.News), args.Get(1).(int64), args.Error(2)
}

func (m *MockNewsRepository) Search(ctx context.Context, query string, filter *repositories.NewsFilter) ([]*entities.News, int64, error) {
	args := m.Called(ctx, query, filter)
	return args.Get(0).([]*entities.News), args.Get(1).(int64), args.Error(2)
}

func (m *MockNewsRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status entities.NewsStatus) error {
	args := m.Called(ctx, id, status)
	return args.Error(0)
}

func (m *MockNewsRepository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) IncrementShareCount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) IncrementLikeCount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) IncrementCommentCount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// Add missing methods for job system
func (m *MockNewsRepository) GetScheduledNews(ctx context.Context, from, to time.Time) ([]*entities.News, error) {
	args := m.Called(ctx, from, to)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetExpiringNews(ctx context.Context, from, to time.Time) ([]*entities.News, error) {
	args := m.Called(ctx, from, to)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) ArchiveNews(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) HealthCheck(ctx context.Context) error {
	args := m.Called(ctx)
	return args.Error(0)
}

// Add other missing methods to satisfy the interface
func (m *MockNewsRepository) List(ctx context.Context, filter repositories.NewsFilter) ([]*entities.News, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) Count(ctx context.Context, filter repositories.NewsFilter) (int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).(int64), args.Error(1)
}

func (m *MockNewsRepository) Publish(ctx context.Context, id uuid.UUID, publishedAt time.Time) error {
	args := m.Called(ctx, id, publishedAt)
	return args.Error(0)
}

func (m *MockNewsRepository) Unpublish(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockNewsRepository) Schedule(ctx context.Context, id uuid.UUID, scheduledAt time.Time) error {
	args := m.Called(ctx, id, scheduledAt)
	return args.Error(0)
}

func (m *MockNewsRepository) GetByStatus(ctx context.Context, status entities.NewsStatus, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, status, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetExpiredNews(ctx context.Context, before time.Time) ([]*entities.News, error) {
	args := m.Called(ctx, before)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByPriority(ctx context.Context, priority entities.NewsPriority, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, priority, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetBreakingNews(ctx context.Context, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, categoryID, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByCategorySlug(ctx context.Context, categorySlug string, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, categorySlug, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByAuthor(ctx context.Context, authorID uuid.UUID, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, authorID, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) Search(ctx context.Context, query string, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, query, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) SearchByTags(ctx context.Context, tags []string, limit, offset int) ([]*entities.News, error) {
	args := m.Called(ctx, tags, limit, offset)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetRelated(ctx context.Context, newsID uuid.UUID, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, newsID, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetPopular(ctx context.Context, since time.Time, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, since, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetTrending(ctx context.Context, limit int) ([]*entities.News, error) {
	args := m.Called(ctx, limit)
	return args.Get(0).([]*entities.News), args.Error(1)
}

func (m *MockNewsRepository) BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.NewsStatus) error {
	args := m.Called(ctx, ids, status)
	return args.Error(0)
}

func (m *MockNewsRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	args := m.Called(ctx, ids)
	return args.Error(0)
}

func (m *MockNewsRepository) GetByWeChatDraftID(ctx context.Context, draftID string) (*entities.News, error) {
	args := m.Called(ctx, draftID)
	return args.Get(0).(*entities.News), args.Error(1)
}

func (m *MockNewsRepository) GetByWeChatPublishedID(ctx context.Context, publishedID string) (*entities.News, error) {
	args := m.Called(ctx, publishedID)
	return args.Get(0).(*entities.News), args.Error(1)
}

func (m *MockNewsRepository) UpdateWeChatStatus(ctx context.Context, id uuid.UUID, status string, wechatID string, url string) error {
	args := m.Called(ctx, id, status, wechatID, url)
	return args.Error(0)
}

// MockSiteArticleRepository is a mock implementation of SiteArticleRepository
type MockSiteArticleRepository struct {
	mock.Mock
}

func (m *MockSiteArticleRepository) GetByID(ctx context.Context, id uuid.UUID, userID *uuid.UUID) (*entities.SiteArticle, error) {
	args := m.Called(ctx, id, userID)
	return args.Get(0).(*entities.SiteArticle), args.Error(1)
}

func (m *MockSiteArticleRepository) GetByIDs(ctx context.Context, ids []uuid.UUID, userID *uuid.UUID) ([]*entities.SiteArticle, error) {
	args := m.Called(ctx, ids, userID)
	return args.Get(0).([]*entities.SiteArticle), args.Error(1)
}

func (m *MockSiteArticleRepository) Create(ctx context.Context, article *entities.SiteArticle) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockSiteArticleRepository) Update(ctx context.Context, article *entities.SiteArticle) error {
	args := m.Called(ctx, article)
	return args.Error(0)
}

func (m *MockSiteArticleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockSiteArticleRepository) List(ctx context.Context, filter *repositories.SiteArticleFilter) ([]*entities.SiteArticle, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.SiteArticle), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteArticleRepository) GetBySlug(ctx context.Context, slug string, userID *uuid.UUID) (*entities.SiteArticle, error) {
	args := m.Called(ctx, slug, userID)
	return args.Get(0).(*entities.SiteArticle), args.Error(1)
}

func (m *MockSiteArticleRepository) GetPublished(ctx context.Context, filter *repositories.SiteArticleFilter) ([]*entities.SiteArticle, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.SiteArticle), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteArticleRepository) GetByCategory(ctx context.Context, categoryID uuid.UUID, filter *repositories.SiteArticleFilter) ([]*entities.SiteArticle, int64, error) {
	args := m.Called(ctx, categoryID, filter)
	return args.Get(0).([]*entities.SiteArticle), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteArticleRepository) GetByAuthor(ctx context.Context, authorID uuid.UUID, filter *repositories.SiteArticleFilter) ([]*entities.SiteArticle, int64, error) {
	args := m.Called(ctx, authorID, filter)
	return args.Get(0).([]*entities.SiteArticle), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteArticleRepository) Search(ctx context.Context, query string, filter *repositories.SiteArticleFilter) ([]*entities.SiteArticle, int64, error) {
	args := m.Called(ctx, query, filter)
	return args.Get(0).([]*entities.SiteArticle), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteArticleRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	args := m.Called(ctx, id, status)
	return args.Error(0)
}

func (m *MockSiteArticleRepository) IncrementViewCount(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// MockNewsArticleAssociationService is a mock implementation
type MockNewsArticleAssociationService struct {
	mock.Mock
}

func (m *MockNewsArticleAssociationService) AssociateArticles(ctx context.Context, req *NewsArticleAssociationRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockNewsArticleAssociationService) GetNewsArticles(ctx context.Context, newsID uuid.UUID) ([]*entities.NewsArticle, error) {
	args := m.Called(ctx, newsID)
	return args.Get(0).([]*entities.NewsArticle), args.Error(1)
}

func (m *MockNewsArticleAssociationService) UpdateAssociation(ctx context.Context, req *UpdateNewsArticleAssociationRequest) error {
	args := m.Called(ctx, req)
	return args.Error(0)
}

func (m *MockNewsArticleAssociationService) RemoveAssociation(ctx context.Context, newsID, articleID uuid.UUID) error {
	args := m.Called(ctx, newsID, articleID)
	return args.Error(0)
}

// NewsManagementServiceTestSuite defines the test suite
type NewsManagementServiceTestSuite struct {
	suite.Suite
	service                *NewsManagementService
	mockNewsRepo           *MockNewsRepository
	mockArticleRepo        *MockSiteArticleRepository
	mockAssociationService *MockNewsArticleAssociationService
	ctx                    context.Context
}

// SetupTest sets up the test suite
func (suite *NewsManagementServiceTestSuite) SetupTest() {
	suite.mockNewsRepo = new(MockNewsRepository)
	suite.mockArticleRepo = new(MockSiteArticleRepository)
	suite.mockAssociationService = new(MockNewsArticleAssociationService)
	suite.ctx = context.Background()

	logger := zaptest.NewLogger(suite.T())
	config := DefaultNewsManagementConfig()

	suite.service = NewNewsManagementService(
		suite.mockNewsRepo,
		suite.mockArticleRepo,
		suite.mockAssociationService,
		logger,
		config,
	)
}

// TearDownTest cleans up after each test
func (suite *NewsManagementServiceTestSuite) TearDownTest() {
	suite.mockNewsRepo.AssertExpectations(suite.T())
	suite.mockArticleRepo.AssertExpectations(suite.T())
	suite.mockAssociationService.AssertExpectations(suite.T())
}

// Test CreateNews functionality
func (suite *NewsManagementServiceTestSuite) TestCreateNews_Success() {
	// Arrange
	authorID := uuid.New()
	articleID1 := uuid.New()
	articleID2 := uuid.New()

	req := &NewsCreateRequest{
		Title:       "Test News",
		Subtitle:    "Test Subtitle",
		Description: "Test Description",
		Content:     "Test Content",
		Summary:     "Test Summary",
		Type:        entities.NewsTypeRegular,
		Priority:    entities.NewsPriorityNormal,
		AuthorID:    &authorID,
		ArticleIDs:  []uuid.UUID{articleID1, articleID2},
		ArticleSettings: map[uuid.UUID]NewsArticleSettings{
			articleID1: {IsMainStory: true, IsFeatured: true},
			articleID2: {IsMainStory: false, IsFeatured: false},
		},
	}

	// Mock article validation
	article1 := &entities.SiteArticle{
		ID:          articleID1,
		Title:       "Article 1",
		IsPublished: true,
		Status:      "published",
	}
	article2 := &entities.SiteArticle{
		ID:          articleID2,
		Title:       "Article 2",
		IsPublished: true,
		Status:      "published",
	}

	suite.mockArticleRepo.On("GetByID", suite.ctx, articleID1, mock.Anything).Return(article1, nil)
	suite.mockArticleRepo.On("GetByID", suite.ctx, articleID2, mock.Anything).Return(article2, nil)

	// Mock news creation
	suite.mockNewsRepo.On("Create", suite.ctx, mock.AnythingOfType("*entities.News")).Return(nil)

	// Mock article association
	suite.mockAssociationService.On("AssociateArticles", suite.ctx, mock.AnythingOfType("*services.NewsArticleAssociationRequest")).Return(nil)

	// Act
	result, err := suite.service.CreateNews(suite.ctx, req)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), req.Title, result.Title)
	assert.Equal(suite.T(), req.Subtitle, result.Subtitle)
	assert.Equal(suite.T(), string(entities.NewsStatusDraft), result.Status)
	assert.NotEqual(suite.T(), uuid.Nil, result.ID)
}

// Test CreateNews with invalid articles
func (suite *NewsManagementServiceTestSuite) TestCreateNews_InvalidArticle() {
	// Arrange
	articleID := uuid.New()
	req := &NewsCreateRequest{
		Title:      "Test News",
		Type:       entities.NewsTypeRegular,
		Priority:   entities.NewsPriorityNormal,
		ArticleIDs: []uuid.UUID{articleID},
	}

	// Mock article not found
	suite.mockArticleRepo.On("GetByID", suite.ctx, articleID, mock.Anything).Return((*entities.SiteArticle)(nil), assert.AnError)

	// Act
	result, err := suite.service.CreateNews(suite.ctx, req)

	// Assert
	assert.Error(suite.T(), err)
	assert.Nil(suite.T(), result)
	assert.Contains(suite.T(), err.Error(), "article not found")
}

// Test GetNews functionality
func (suite *NewsManagementServiceTestSuite) TestGetNews_Success() {
	// Arrange
	newsID := uuid.New()
	expectedNews := &entities.News{
		ID:       newsID,
		Title:    "Test News",
		Status:   entities.NewsStatusPublished,
		Type:     entities.NewsTypeRegular,
		Priority: entities.NewsPriorityNormal,
	}

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return(expectedNews, nil)

	// Act
	result, err := suite.service.GetNews(suite.ctx, newsID)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), expectedNews.ID, result.ID)
	assert.Equal(suite.T(), expectedNews.Title, result.Title)
}

// Test GetNews not found
func (suite *NewsManagementServiceTestSuite) TestGetNews_NotFound() {
	// Arrange
	newsID := uuid.New()
	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return((*entities.News)(nil), assert.AnError)

	// Act
	result, err := suite.service.GetNews(suite.ctx, newsID)

	// Assert
	assert.Error(suite.T(), err)
	assert.Nil(suite.T(), result)
}

// Test PublishNews functionality
func (suite *NewsManagementServiceTestSuite) TestPublishNews_Success() {
	// Arrange
	newsID := uuid.New()
	news := &entities.News{
		ID:     newsID,
		Title:  "Test News",
		Status: entities.NewsStatusDraft,
	}

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return(news, nil)
	suite.mockNewsRepo.On("Update", suite.ctx, mock.AnythingOfType("*entities.News")).Return(nil)

	// Act
	result, err := suite.service.PublishNews(suite.ctx, newsID)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), string(entities.NewsStatusPublished), result.Status)
	assert.NotNil(suite.T(), result.PublishedAt)
}

// Test ScheduleNews functionality
func (suite *NewsManagementServiceTestSuite) TestScheduleNews_Success() {
	// Arrange
	newsID := uuid.New()
	scheduledTime := time.Now().Add(24 * time.Hour)
	news := &entities.News{
		ID:     newsID,
		Title:  "Test News",
		Status: entities.NewsStatusDraft,
	}

	suite.mockNewsRepo.On("GetByID", suite.ctx, newsID).Return(news, nil)
	suite.mockNewsRepo.On("Update", suite.ctx, mock.AnythingOfType("*entities.News")).Return(nil)

	// Act
	result, err := suite.service.ScheduleNews(suite.ctx, newsID, scheduledTime)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), result)
	assert.Equal(suite.T(), string(entities.NewsStatusScheduled), result.Status)
	assert.NotNil(suite.T(), result.ScheduledAt)
	assert.Equal(suite.T(), scheduledTime.Unix(), result.ScheduledAt.Unix())
}

// Run the test suite
func TestNewsManagementServiceTestSuite(t *testing.T) {
	suite.Run(t, new(NewsManagementServiceTestSuite))
}
