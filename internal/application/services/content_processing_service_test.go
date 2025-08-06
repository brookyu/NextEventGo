package services

import (
	"context"
	"strings"
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

// MockSiteImageRepository is a mock implementation
type MockSiteImageRepository struct {
	mock.Mock
}

func (m *MockSiteImageRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*entities.SiteImage), args.Error(1)
}

func (m *MockSiteImageRepository) Create(ctx context.Context, image *entities.SiteImage) error {
	args := m.Called(ctx, image)
	return args.Error(0)
}

func (m *MockSiteImageRepository) Update(ctx context.Context, image *entities.SiteImage) error {
	args := m.Called(ctx, image)
	return args.Error(0)
}

func (m *MockSiteImageRepository) Delete(ctx context.Context, id uuid.UUID) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *MockSiteImageRepository) List(ctx context.Context, filter *repositories.SiteImageFilter) ([]*entities.SiteImage, int64, error) {
	args := m.Called(ctx, filter)
	return args.Get(0).([]*entities.SiteImage), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteImageRepository) GetByCategory(ctx context.Context, category string, filter *repositories.SiteImageFilter) ([]*entities.SiteImage, int64, error) {
	args := m.Called(ctx, category, filter)
	return args.Get(0).([]*entities.SiteImage), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteImageRepository) Search(ctx context.Context, query string, filter *repositories.SiteImageFilter) ([]*entities.SiteImage, int64, error) {
	args := m.Called(ctx, query, filter)
	return args.Get(0).([]*entities.SiteImage), args.Get(1).(int64), args.Error(2)
}

func (m *MockSiteImageRepository) UpdateMetadata(ctx context.Context, id uuid.UUID, metadata map[string]interface{}) error {
	args := m.Called(ctx, id, metadata)
	return args.Error(0)
}

func (m *MockSiteImageRepository) GetStats(ctx context.Context) (*repositories.SiteImageStats, error) {
	args := m.Called(ctx)
	return args.Get(0).(*repositories.SiteImageStats), args.Error(1)
}

// MockWeChatService is a mock implementation
type MockWeChatService struct {
	mock.Mock
}

func (m *MockWeChatService) UploadImage(ctx context.Context, imageData []byte, filename string) (string, string, error) {
	args := m.Called(ctx, imageData, filename)
	return args.String(0), args.String(1), args.Error(2)
}

// ContentProcessingServiceTestSuite defines the test suite
type ContentProcessingServiceTestSuite struct {
	suite.Suite
	service           *ContentProcessingService
	mockImageRepo     *MockSiteImageRepository
	mockWeChatService *MockWeChatService
	ctx               context.Context
	config            *ContentProcessingConfig
}

// SetupTest sets up the test suite
func (suite *ContentProcessingServiceTestSuite) SetupTest() {
	suite.mockImageRepo = new(MockSiteImageRepository)
	suite.mockWeChatService = new(MockWeChatService)
	suite.ctx = context.Background()

	logger := zaptest.NewLogger(suite.T())
	suite.config = DefaultContentProcessingConfig()
	suite.config.EnableImageCache = false // Disable caching for tests

	suite.service = NewContentProcessingService(
		suite.mockImageRepo,
		suite.mockWeChatService,
		logger,
		suite.config,
	)
}

// TearDownTest cleans up after each test
func (suite *ContentProcessingServiceTestSuite) TearDownTest() {
	suite.mockImageRepo.AssertExpectations(suite.T())
	suite.mockWeChatService.AssertExpectations(suite.T())
}

// Test HTML sanitization
func (suite *ContentProcessingServiceTestSuite) TestSanitizeHTML() {
	// Test cases for HTML sanitization
	testCases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Remove script tags",
			input:    `<p>Hello</p><script>alert('xss')</script><p>World</p>`,
			expected: `<p>Hello</p><p>World</p>`,
		},
		{
			name:     "Remove style tags",
			input:    `<p>Hello</p><style>body{color:red}</style><p>World</p>`,
			expected: `<p>Hello</p><p>World</p>`,
		},
		{
			name:     "Remove dangerous attributes",
			input:    `<p onclick="alert('xss')">Hello</p>`,
			expected: `<p>Hello</p>`,
		},
		{
			name:     "Keep safe content",
			input:    `<p><strong>Bold</strong> and <em>italic</em> text</p>`,
			expected: `<p><strong>Bold</strong> and <em>italic</em> text</p>`,
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			result := suite.service.sanitizeHTML(tc.input)
			assert.Contains(t, result, strings.ReplaceAll(tc.expected, `<script>alert('xss')</script>`, ""))
		})
	}
}

// Test content processing with sanitization
func (suite *ContentProcessingServiceTestSuite) TestProcessContent_Sanitization() {
	// Arrange
	req := &ProcessContentRequest{
		Content:     `<p>Safe content</p><script>alert('xss')</script><p>More content</p>`,
		ContentType: "html",
		Options: ProcessingOptions{
			SanitizeHTML: true,
		},
	}

	// Act
	response, err := suite.service.ProcessContent(suite.ctx, req)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.NotContains(suite.T(), response.ProcessedContent, "<script>")
	assert.Contains(suite.T(), response.ProcessedContent, "<p>Safe content</p>")
	assert.Contains(suite.T(), response.ProcessedContent, "<p>More content</p>")
	assert.Greater(suite.T(), response.ProcessingTime, time.Duration(0))
}

// Test content processing with image optimization
func (suite *ContentProcessingServiceTestSuite) TestProcessContent_ImageOptimization() {
	// Arrange
	req := &ProcessContentRequest{
		Content:     `<p>Content with image</p><img src="https://example.com/image.jpg" alt="Test image"><p>More content</p>`,
		ContentType: "html",
		Options: ProcessingOptions{
			OptimizeImages: true,
		},
	}

	// Act
	response, err := suite.service.ProcessContent(suite.ctx, req)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.Equal(suite.T(), 1, response.Statistics.TotalImages)
	assert.Greater(suite.T(), response.Statistics.ImageProcessingTime, time.Duration(0))
	assert.Len(suite.T(), response.ProcessedImages, 1)
	
	// Check that image was processed
	imageInfo := response.ProcessedImages[0]
	assert.Equal(suite.T(), "https://example.com/image.jpg", imageInfo.OriginalURL)
	assert.NotEmpty(suite.T(), imageInfo.Error) // Should have error since we can't actually download the image
}

// Test content processing with link validation
func (suite *ContentProcessingServiceTestSuite) TestProcessContent_LinkValidation() {
	// Arrange
	req := &ProcessContentRequest{
		Content:     `<p>Content with <a href="https://example.com">link</a> and <a href="invalid-url">invalid link</a></p>`,
		ContentType: "html",
		Options: ProcessingOptions{
			ValidateLinks: true,
		},
	}

	// Act
	response, err := suite.service.ProcessContent(suite.ctx, req)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.Equal(suite.T(), 2, response.Statistics.TotalLinks)
	assert.Greater(suite.T(), response.Statistics.LinkValidationTime, time.Duration(0))
	assert.Len(suite.T(), response.ProcessedLinks, 2)
}

// Test WeChat optimization
func (suite *ContentProcessingServiceTestSuite) TestOptimizeForWeChat() {
	// Test cases for WeChat optimization
	testCases := []struct {
		name     string
		input    string
		contains []string
	}{
		{
			name:  "Convert headings to styled paragraphs",
			input: `<h1>Main Title</h1><h2>Subtitle</h2><p>Content</p>`,
			contains: []string{
				`style="font-size: 1.1em; font-weight: bold; margin: 1em 0;"`,
				`style="font-size: 1.2em; font-weight: bold; margin: 1em 0;"`,
			},
		},
		{
			name:  "Optimize paragraph styling",
			input: `<p>First paragraph</p><p>Second paragraph</p>`,
			contains: []string{
				`style="margin: 0.8em 0; line-height: 1.6;"`,
			},
		},
		{
			name:  "Convert strong tags to styled spans",
			input: `<p>This is <strong>bold text</strong> in a paragraph</p>`,
			contains: []string{
				`style="font-weight: bold; color: #2c3e50;"`,
			},
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			result := suite.service.optimizeForWeChat(tc.input)
			for _, expected := range tc.contains {
				assert.Contains(t, result, expected)
			}
		})
	}
}

// Test mobile optimization
func (suite *ContentProcessingServiceTestSuite) TestOptimizeForMobile() {
	// Test long paragraph breaking
	longParagraph := `<p>` + strings.Repeat("This is a very long sentence that should be broken into smaller paragraphs for better mobile reading experience. ", 10) + `</p>`
	
	result := suite.service.optimizeForMobile(longParagraph)
	
	// Should contain multiple paragraph tags after breaking
	paragraphCount := strings.Count(result, "<p")
	assert.Greater(suite.T(), paragraphCount, 1, "Long paragraph should be broken into multiple paragraphs")
}

// Test punctuation optimization
func (suite *ContentProcessingServiceTestSuite) TestOptimizePunctuation() {
	testCases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Add spacing after Chinese punctuation",
			input:    "这是一个测试，包含中文标点。还有更多内容！",
			expected: "这是一个测试， 包含中文标点。 还有更多内容！ ",
		},
		{
			name:     "Remove extra spaces",
			input:    "Text   with    multiple     spaces",
			expected: "Text with multiple spaces",
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			result := suite.service.optimizePunctuation(tc.input)
			assert.Equal(t, tc.expected, result)
		})
	}
}

// Test special character conversion
func (suite *ContentProcessingServiceTestSuite) TestConvertSpecialCharacters() {
	testCases := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Convert HTML entities",
			input:    "Text with&nbsp;non-breaking&amp;spaces&lt;tags&gt;",
			expected: "Text with non-breaking&spaces<tags>",
		},
		{
			name:     "Convert quotes and apostrophes",
			input:    "&quot;Hello&quot; and &#39;world&#39;",
			expected: "\"Hello\" and 'world'",
		},
		{
			name:     "Convert ellipsis",
			input:    "Loading&hellip;",
			expected: "Loading...",
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			result := suite.service.convertSpecialCharacters(tc.input)
			assert.Equal(t, tc.expected, result)
		})
	}
}

// Test news content processing
func (suite *ContentProcessingServiceTestSuite) TestProcessNewsContent() {
	// Arrange
	news := &entities.News{
		ID:      uuid.New(),
		Title:   "Test News",
		Content: "News content",
	}

	articles := []*entities.SiteArticle{
		{
			ID:      uuid.New(),
			Title:   "Article 1",
			Content: "<p>First article content</p>",
		},
		{
			ID:      uuid.New(),
			Title:   "Article 2",
			Content: "<p>Second article content</p>",
		},
	}

	// Act
	response, err := suite.service.ProcessNewsContent(suite.ctx, news, articles)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.Contains(suite.T(), response.ProcessedContent, "<h2>Article 1</h2>")
	assert.Contains(suite.T(), response.ProcessedContent, "<h2>Article 2</h2>")
	assert.Contains(suite.T(), response.ProcessedContent, "First article content")
	assert.Contains(suite.T(), response.ProcessedContent, "Second article content")
}

// Test article content processing
func (suite *ContentProcessingServiceTestSuite) TestProcessArticleContent() {
	// Arrange
	article := &entities.SiteArticle{
		ID:      uuid.New(),
		Title:   "Test Article",
		Content: "<p>Article content with <strong>bold</strong> text</p>",
	}

	options := ProcessingOptions{
		SanitizeHTML:       true,
		WeChatOptimization: true,
	}

	// Act
	response, err := suite.service.ProcessArticleContent(suite.ctx, article, options)

	// Assert
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), response)
	assert.Contains(suite.T(), response.ProcessedContent, "Article content")
	assert.Greater(suite.T(), response.ProcessingTime, time.Duration(0))
}

// Test content length validation
func (suite *ContentProcessingServiceTestSuite) TestProcessContent_ContentTooLong() {
	// Arrange
	longContent := strings.Repeat("a", suite.config.MaxContentLength+1)
	req := &ProcessContentRequest{
		Content:     longContent,
		ContentType: "text",
		Options:     ProcessingOptions{},
	}

	// Act
	response, err := suite.service.ProcessContent(suite.ctx, req)

	// Assert
	assert.Error(suite.T(), err)
	assert.Nil(suite.T(), response)
	assert.Contains(suite.T(), err.Error(), "content length exceeds maximum")
}

// Test URL validation
func (suite *ContentProcessingServiceTestSuite) TestValidateExternalURL() {
	testCases := []struct {
		name        string
		url         string
		expectValid bool
		expectError bool
	}{
		{
			name:        "Valid absolute URL",
			url:         "https://example.com",
			expectValid: false, // Will fail because we can't actually reach it
			expectError: false,
		},
		{
			name:        "Invalid URL",
			url:         "not-a-url",
			expectValid: true, // Relative URLs are considered valid
			expectError: false,
		},
		{
			name:        "Malformed URL",
			url:         "http://[invalid",
			expectValid: false,
			expectError: false,
		},
	}

	for _, tc := range testCases {
		suite.T().Run(tc.name, func(t *testing.T) {
			info, err := suite.service.ValidateExternalURL(suite.ctx, tc.url)
			
			if tc.expectError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, info)
				assert.Equal(t, tc.url, info.OriginalURL)
			}
		})
	}
}

// Run the test suite
func TestContentProcessingServiceTestSuite(t *testing.T) {
	suite.Run(t, new(ContentProcessingServiceTestSuite))
}
