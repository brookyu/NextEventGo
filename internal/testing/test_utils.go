package testing

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"go.uber.org/zap/zaptest"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/infrastructure/cache"
)

// TestSuite provides a comprehensive testing environment
type TestSuite struct {
	T       *testing.T
	DB      *gorm.DB
	Cache   cache.CacheInterface
	Logger  *zap.Logger
	Router  *gin.Engine
	Context context.Context
	Cancel  context.CancelFunc
}

// NewTestSuite creates a new test suite with all necessary components
func NewTestSuite(t *testing.T) *TestSuite {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Create test logger
	logger := zaptest.NewLogger(t)

	// Create test database
	db := setupTestDatabase(t, logger)

	// Create test cache
	testCache := setupTestCache(t, logger)

	// Create test context
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

	// Create test router
	router := gin.New()

	return &TestSuite{
		T:       t,
		DB:      db,
		Cache:   testCache,
		Logger:  logger,
		Router:  router,
		Context: ctx,
		Cancel:  cancel,
	}
}

// Cleanup cleans up test resources
func (ts *TestSuite) Cleanup() {
	if ts.Cancel != nil {
		ts.Cancel()
	}

	if ts.DB != nil {
		sqlDB, err := ts.DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}
}

// setupTestDatabase creates an in-memory SQLite database for testing
func setupTestDatabase(t *testing.T, logger *zap.Logger) *gorm.DB {
	// Create temporary database file
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Silent),
	})
	require.NoError(t, err, "Failed to create test database")

	// Auto-migrate all entities
	err = db.AutoMigrate(
		&entities.SiteImage{},
		&entities.SiteArticle{},
		&entities.News{},
		&entities.Video{},
		&entities.VideoCategory{},
		&entities.VideoSession{},
	)
	require.NoError(t, err, "Failed to migrate test database")

	return db
}

// setupTestCache creates an in-memory cache for testing
func setupTestCache(t *testing.T, logger *zap.Logger) cache.CacheInterface {
	// For testing, we'll use a simple in-memory cache
	return NewMemoryCache()
}

// Test Data Factories

// CreateTestImage creates a test image entity
func (ts *TestSuite) CreateTestImage(overrides ...func(*entities.SiteImage)) *entities.SiteImage {
	image := &entities.SiteImage{
		ID:           uuid.New(),
		Filename:     "test-image.jpg",
		OriginalName: "Test Image.jpg",
		Title:        "Test Image",
		Description:  "A test image for unit testing",
		AltText:      "Test image alt text",
		Type:         entities.ImageTypePhoto,
		Status:       entities.ImageStatusActive,
		FileSize:     1024 * 1024, // 1MB
		Width:        1920,
		Height:       1080,
		MimeType:     "image/jpeg",
		Tags:         "test,image",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Apply overrides
	for _, override := range overrides {
		override(image)
	}

	// Save to database
	err := ts.DB.Create(image).Error
	require.NoError(ts.T, err, "Failed to create test image")

	return image
}

// CreateTestArticle creates a test article entity
func (ts *TestSuite) CreateTestArticle(overrides ...func(*entities.SiteArticle)) *entities.SiteArticle {
	article := &entities.SiteArticle{
		ID:    uuid.New(),
		Title: "Test Article",

		Summary: "This is a test article summary for unit testing purposes.",
		Content: "# Test Article\n\nThis is the content of a test article used for unit testing.",

		Slug: "test-article",

		ViewCount:   100,
		PublishedAt: &time.Time{},
		CreatedAt:   time.Now(),
	}

	now := time.Now()
	article.PublishedAt = &now

	// Apply overrides
	for _, override := range overrides {
		override(article)
	}

	// Save to database
	err := ts.DB.Create(article).Error
	require.NoError(ts.T, err, "Failed to create test article")

	return article
}

// CreateTestNews creates a test news entity
func (ts *TestSuite) CreateTestNews(overrides ...func(*entities.News)) *entities.News {
	news := &entities.News{
		ID:            uuid.New(),
		Title:         "Test News",
		Subtitle:      "A test news subtitle",
		Description:   "This is a test news description for unit testing purposes.",
		Summary:       "Test news summary",
		Status:        entities.NewsStatusPublished,
		Type:          entities.NewsTypeRegular,
		Priority:      entities.NewsPriorityNormal,
		Slug:          "test-news",
		IsFeatured:    false,
		IsBreaking:    false,
		IsSticky:      false,
		AllowComments: true,
		AllowSharing:  true,
		RequireAuth:   false,
		ViewCount:     50,
		ShareCount:    3,
		LikeCount:     8,
		CommentCount:  2,
		ReadTime:      3,
		PublishedAt:   &time.Time{},
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	now := time.Now()
	news.PublishedAt = &now

	// Apply overrides
	for _, override := range overrides {
		override(news)
	}

	// Save to database
	err := ts.DB.Create(news).Error
	require.NoError(ts.T, err, "Failed to create test news")

	return news
}

// CreateTestVideo creates a test video entity
func (ts *TestSuite) CreateTestVideo(overrides ...func(*entities.Video)) *entities.Video {
	duration := 3600 // 1 hour
	video := &entities.Video{
		ID:                 uuid.New(),
		Title:              "Test Video",
		Summary:            "This is a test video for unit testing purposes.",
		VideoType:          entities.VideoTypeOnDemand,
		Status:             entities.VideoStatusEnded,
		CloudUrl:           "https://test-cloud.example.com/video123",
		StreamKey:          "test_stream_key_123",
		PlaybackUrl:        "https://test-stream.example.com/play/video123.m3u8",
		Quality:            entities.VideoQuality720p,
		Duration:           &duration,
		IsOpen:             true,
		RequireAuth:        false,
		SupportInteraction: false,
		AllowDownload:      false,
		ViewCount:          250,
		LikeCount:          25,
		ShareCount:         10,
		CommentCount:       15,
		WatchTime:          180000, // 50 hours total watch time
		AverageWatchTime:   720.0,  // 12 minutes average
		CompletionRate:     65.5,
		EngagementScore:    78.2,
		FileSize:           &[]int64{2147483648}[0], // 2GB
		Resolution:         "1280x720",
		FrameRate:          30.0,
		Bitrate:            &[]int{2000}[0], // 2000 kbps
		Codec:              "H.264",
		Slug:               "test-video",
		MetaTitle:          "Test Video - Meta Title",
		MetaDescription:    "Meta description for test video",
		Keywords:           "test,video,keywords",
		Tags:               "test,video,unit-testing",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Apply overrides
	for _, override := range overrides {
		override(video)
	}

	// Save to database
	err := ts.DB.Create(video).Error
	require.NoError(ts.T, err, "Failed to create test video")

	return video
}

// HTTP Test Helpers

// MakeRequest makes an HTTP request to the test router
func (ts *TestSuite) MakeRequest(method, path string, body interface{}, headers map[string]string) *httptest.ResponseRecorder {
	var bodyReader io.Reader

	if body != nil {
		bodyBytes, err := json.Marshal(body)
		require.NoError(ts.T, err, "Failed to marshal request body")
		bodyReader = bytes.NewReader(bodyBytes)
	}

	req, err := http.NewRequest(method, path, bodyReader)
	require.NoError(ts.T, err, "Failed to create request")

	// Set default headers
	req.Header.Set("Content-Type", "application/json")

	// Set custom headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	// Create response recorder
	w := httptest.NewRecorder()

	// Perform request
	ts.Router.ServeHTTP(w, req)

	return w
}

// AssertJSONResponse asserts that the response is valid JSON and matches expected status
func (ts *TestSuite) AssertJSONResponse(w *httptest.ResponseRecorder, expectedStatus int, expectedBody interface{}) {
	assert.Equal(ts.T, expectedStatus, w.Code, "Unexpected status code")
	assert.Equal(ts.T, "application/json; charset=utf-8", w.Header().Get("Content-Type"), "Expected JSON content type")

	if expectedBody != nil {
		var actualBody interface{}
		err := json.Unmarshal(w.Body.Bytes(), &actualBody)
		require.NoError(ts.T, err, "Failed to unmarshal response body")

		expectedJSON, err := json.Marshal(expectedBody)
		require.NoError(ts.T, err, "Failed to marshal expected body")

		var expectedBodyParsed interface{}
		err = json.Unmarshal(expectedJSON, &expectedBodyParsed)
		require.NoError(ts.T, err, "Failed to unmarshal expected body")

		assert.Equal(ts.T, expectedBodyParsed, actualBody, "Response body mismatch")
	}
}

// AssertErrorResponse asserts that the response contains an error with expected code
func (ts *TestSuite) AssertErrorResponse(w *httptest.ResponseRecorder, expectedStatus int, expectedErrorCode string) {
	assert.Equal(ts.T, expectedStatus, w.Code, "Unexpected status code")

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(ts.T, err, "Failed to unmarshal error response")

	errorObj, exists := response["error"]
	require.True(ts.T, exists, "Expected error object in response")

	errorMap, ok := errorObj.(map[string]interface{})
	require.True(ts.T, ok, "Expected error to be an object")

	code, exists := errorMap["code"]
	require.True(ts.T, exists, "Expected error code in error object")

	assert.Equal(ts.T, expectedErrorCode, code, "Unexpected error code")
}

// Database Test Helpers

// TruncateTable truncates a database table
func (ts *TestSuite) TruncateTable(tableName string) {
	err := ts.DB.Exec(fmt.Sprintf("DELETE FROM %s", tableName)).Error
	require.NoError(ts.T, err, "Failed to truncate table: %s", tableName)
}

// CountRecords counts records in a table
func (ts *TestSuite) CountRecords(tableName string) int64 {
	var count int64
	err := ts.DB.Table(tableName).Count(&count).Error
	require.NoError(ts.T, err, "Failed to count records in table: %s", tableName)
	return count
}

// Cache Test Helpers

// ClearCache clears all cache entries
func (ts *TestSuite) ClearCache() {
	if memCache, ok := ts.Cache.(*MemoryCache); ok {
		memCache.Clear()
	}
}

// File Test Helpers

// CreateTempFile creates a temporary file with content
func (ts *TestSuite) CreateTempFile(content string, extension string) string {
	tempDir := ts.T.TempDir()
	fileName := fmt.Sprintf("test_%d%s", time.Now().UnixNano(), extension)
	filePath := filepath.Join(tempDir, fileName)

	err := os.WriteFile(filePath, []byte(content), 0644)
	require.NoError(ts.T, err, "Failed to create temp file")

	return filePath
}

// Assertion Helpers

// AssertUUID asserts that a string is a valid UUID
func (ts *TestSuite) AssertUUID(value string, msgAndArgs ...interface{}) {
	_, err := uuid.Parse(value)
	assert.NoError(ts.T, err, msgAndArgs...)
}

// AssertTimeRecent asserts that a time is within the last minute
func (ts *TestSuite) AssertTimeRecent(t time.Time, msgAndArgs ...interface{}) {
	now := time.Now()
	diff := now.Sub(t)
	assert.True(ts.T, diff >= 0 && diff <= time.Minute, msgAndArgs...)
}

// AssertContainsSubstring asserts that a string contains a substring (case-insensitive)
func (ts *TestSuite) AssertContainsSubstring(haystack, needle string, msgAndArgs ...interface{}) {
	assert.True(ts.T, strings.Contains(strings.ToLower(haystack), strings.ToLower(needle)), msgAndArgs...)
}

// MemoryCache is a simple in-memory cache implementation for testing
type MemoryCache struct {
	data map[string]cacheItem
	mu   sync.RWMutex
}

type cacheItem struct {
	value      interface{}
	expiration time.Time
}

// NewMemoryCache creates a new in-memory cache
func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		data: make(map[string]cacheItem),
	}
}

// Get retrieves a value from cache
func (mc *MemoryCache) Get(ctx context.Context, key string, dest interface{}) error {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	item, exists := mc.data[key]
	if !exists {
		return cache.ErrCacheMiss
	}

	if time.Now().After(item.expiration) {
		delete(mc.data, key)
		return cache.ErrCacheMiss
	}

	// Simple copy for testing - in production you'd use proper serialization
	if jsonData, err := json.Marshal(item.value); err == nil {
		return json.Unmarshal(jsonData, dest)
	}

	return fmt.Errorf("failed to retrieve cached value")
}

// Set stores a value in cache
func (mc *MemoryCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	mc.data[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(expiration),
	}

	return nil
}

// Delete removes a key from cache
func (mc *MemoryCache) Delete(ctx context.Context, key string) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	delete(mc.data, key)
	return nil
}

// DeletePattern removes all keys matching a pattern
func (mc *MemoryCache) DeletePattern(ctx context.Context, pattern string) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	// Simple pattern matching for testing
	for key := range mc.data {
		if strings.Contains(key, strings.TrimSuffix(pattern, "*")) {
			delete(mc.data, key)
		}
	}

	return nil
}

// Exists checks if a key exists
func (mc *MemoryCache) Exists(ctx context.Context, key string) (bool, error) {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	item, exists := mc.data[key]
	if !exists {
		return false, nil
	}

	if time.Now().After(item.expiration) {
		delete(mc.data, key)
		return false, nil
	}

	return true, nil
}

// Increment increments a numeric value
func (mc *MemoryCache) Increment(ctx context.Context, key string) (int64, error) {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	item, exists := mc.data[key]
	if !exists {
		mc.data[key] = cacheItem{
			value:      int64(1),
			expiration: time.Now().Add(24 * time.Hour),
		}
		return 1, nil
	}

	if val, ok := item.value.(int64); ok {
		newVal := val + 1
		mc.data[key] = cacheItem{
			value:      newVal,
			expiration: item.expiration,
		}
		return newVal, nil
	}

	return 0, fmt.Errorf("value is not numeric")
}

// Expire sets expiration for a key
func (mc *MemoryCache) Expire(ctx context.Context, key string, expiration time.Duration) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	item, exists := mc.data[key]
	if !exists {
		return fmt.Errorf("key not found")
	}

	mc.data[key] = cacheItem{
		value:      item.value,
		expiration: time.Now().Add(expiration),
	}

	return nil
}

// GetTTL gets time to live for a key
func (mc *MemoryCache) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	item, exists := mc.data[key]
	if !exists {
		return 0, fmt.Errorf("key not found")
	}

	ttl := time.Until(item.expiration)
	if ttl < 0 {
		return 0, nil
	}

	return ttl, nil
}

// SetNX sets a key only if it doesn't exist
func (mc *MemoryCache) SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	if _, exists := mc.data[key]; exists {
		return false, nil
	}

	mc.data[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(expiration),
	}

	return true, nil
}

// GetSet atomically sets a key and returns old value
func (mc *MemoryCache) GetSet(ctx context.Context, key string, value interface{}) (string, error) {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	var oldValue string
	if item, exists := mc.data[key]; exists {
		if str, ok := item.value.(string); ok {
			oldValue = str
		}
	}

	mc.data[key] = cacheItem{
		value:      value,
		expiration: time.Now().Add(24 * time.Hour),
	}

	return oldValue, nil
}

// MGet gets multiple keys
func (mc *MemoryCache) MGet(ctx context.Context, keys []string) ([]interface{}, error) {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	results := make([]interface{}, len(keys))
	for i, key := range keys {
		if item, exists := mc.data[key]; exists && time.Now().Before(item.expiration) {
			results[i] = item.value
		}
	}

	return results, nil
}

// MSet sets multiple keys
func (mc *MemoryCache) MSet(ctx context.Context, pairs map[string]interface{}, expiration time.Duration) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	for key, value := range pairs {
		mc.data[key] = cacheItem{
			value:      value,
			expiration: time.Now().Add(expiration),
		}
	}

	return nil
}

// FlushAll removes all keys
func (mc *MemoryCache) FlushAll(ctx context.Context) error {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	mc.data = make(map[string]cacheItem)
	return nil
}

// Clear removes all keys (helper for testing)
func (mc *MemoryCache) Clear() {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	mc.data = make(map[string]cacheItem)
}
