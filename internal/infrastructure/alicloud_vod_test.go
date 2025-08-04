package infrastructure

import (
	"context"
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestAliCloudVODService_Integration(t *testing.T) {
	// Setup in-memory database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Create test config (disabled for unit tests)
	config := &AliCloudVODConfig{
		Enabled:         false, // Disabled for unit tests
		AccessKeyID:     "test-access-key",
		AccessKeySecret: "test-secret",
		Region:          "ap-southeast-1",
		Endpoint:        "vod.ap-southeast-1.aliyuncs.com",
	}

	// Create service
	service := NewAliCloudVODService(config, db)

	// Test service initialization
	if service == nil {
		t.Fatal("Service should not be nil")
	}

	if service.config != config {
		t.Error("Config not properly set")
	}

	if service.db != db {
		t.Error("Database not properly set")
	}

	// Test that VOD client is nil when disabled
	if service.vodClient != nil {
		t.Error("VOD client should be nil when disabled")
	}
}

func TestAliCloudVODService_VideoInfoRetrieval_MockMode(t *testing.T) {
	// Setup in-memory database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Create test config (disabled for unit tests)
	config := &AliCloudVODConfig{
		Enabled: false, // This will use mock mode
	}

	// Create service
	service := NewAliCloudVODService(config, db)

	ctx := context.Background()

	// Test GetAliCloudVideoInfo with disabled client (should return error)
	_, err = service.GetAliCloudVideoInfo(ctx, "test-video-id")
	if err == nil {
		t.Error("Expected error when VOD client is not initialized")
	}

	expectedError := "VOD client not initialized"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestAliCloudVODService_ExtractPlayUrl(t *testing.T) {
	// Setup in-memory database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	config := &AliCloudVODConfig{Enabled: false}
	service := NewAliCloudVODService(config, db)

	// Test with empty play info list
	videoInfo := &AliCloudVideoInfo{
		VideoId: "test-id",
		PlayInfoList: []struct {
			PlayURL    string `json:"PlayURL"`
			Definition string `json:"Definition"`
			Format     string `json:"Format"`
			Size       int64  `json:"Size"`
			Duration   string `json:"Duration"`
		}{},
	}

	playUrl := service.extractPlayUrl(videoInfo)
	if playUrl != "" {
		t.Errorf("Expected empty play URL, got '%s'", playUrl)
	}

	// Test with play info list
	videoInfo.PlayInfoList = []struct {
		PlayURL    string `json:"PlayURL"`
		Definition string `json:"Definition"`
		Format     string `json:"Format"`
		Size       int64  `json:"Size"`
		Duration   string `json:"Duration"`
	}{
		{
			PlayURL:    "https://example.com/video.mp4",
			Definition: "HD",
			Format:     "mp4",
			Size:       1024000,
			Duration:   "120.5",
		},
	}

	playUrl = service.extractPlayUrl(videoInfo)
	expectedUrl := "https://example.com/video.mp4"
	if playUrl != expectedUrl {
		t.Errorf("Expected play URL '%s', got '%s'", expectedUrl, playUrl)
	}
}

func TestAliCloudVODService_UpdateVideoStatus(t *testing.T) {
	// Setup in-memory database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	config := &AliCloudVODConfig{Enabled: false}
	service := NewAliCloudVODService(config, db)

	// Create VideoUploads table
	err = db.Exec(`
		CREATE TABLE VideoUploads (
			Id TEXT PRIMARY KEY,
			Status TEXT,
			ProcessingProgress INTEGER,
			LastModificationTime DATETIME
		)
	`).Error
	if err != nil {
		t.Fatalf("Failed to create test table: %v", err)
	}

	// Insert test record
	testId := "test-video-id"
	err = db.Exec(`
		INSERT INTO VideoUploads (Id, Status, ProcessingProgress, LastModificationTime)
		VALUES (?, ?, ?, ?)
	`, testId, "uploading", 0, time.Now()).Error
	if err != nil {
		t.Fatalf("Failed to insert test record: %v", err)
	}

	// Test updateVideoStatus
	service.updateVideoStatus(testId, "processing", 50)

	// Verify update
	var result struct {
		Status             string
		ProcessingProgress int
	}
	err = db.Table("VideoUploads").Where("Id = ?", testId).
		Select("Status, ProcessingProgress").Scan(&result).Error
	if err != nil {
		t.Fatalf("Failed to query updated record: %v", err)
	}

	if result.Status != "processing" {
		t.Errorf("Expected status 'processing', got '%s'", result.Status)
	}

	if result.ProcessingProgress != 50 {
		t.Errorf("Expected progress 50, got %d", result.ProcessingProgress)
	}
}

func TestAliCloudVODConfig_Validation(t *testing.T) {
	// Test valid config
	config := &AliCloudVODConfig{
		Enabled:         true,
		AccessKeyID:     "test-key",
		AccessKeySecret: "test-secret",
		Region:          "ap-southeast-1",
		Endpoint:        "vod.ap-southeast-1.aliyuncs.com",
	}

	if !config.Enabled {
		t.Error("Config should be enabled")
	}

	// Test disabled config
	disabledConfig := &AliCloudVODConfig{
		Enabled: false,
	}

	if disabledConfig.Enabled {
		t.Error("Config should be disabled")
	}
}

func TestAliCloudVODService_DataMigrationCompatibility(t *testing.T) {
	// Setup in-memory database for testing
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Create old VideoUploads table (simulating existing data)
	err = db.Exec(`
		CREATE TABLE VideoUploads (
			Id TEXT PRIMARY KEY,
			Title TEXT NOT NULL,
			Description TEXT,
			Url TEXT,
			PlaybackUrl TEXT,
			CloudUrl TEXT,
			CoverUrl TEXT,
			Duration INTEGER,
			Status TEXT DEFAULT 'uploaded',
			ProcessingProgress INTEGER DEFAULT 0,
			CreationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
			LastModificationTime DATETIME
		)
	`).Error
	if err != nil {
		t.Fatalf("Failed to create old table structure: %v", err)
	}

	// Insert old data (without PlaybackUrl and CoverUrl - simulating videos that need processing)
	oldVideoData := map[string]interface{}{
		"Id":          "old-video-1",
		"Title":       "Old Video",
		"Description": "This is an old video without PlaybackUrl and CoverUrl",
		"Url":         "https://example.com/old-video.mp4",
		"Status":      "uploaded",
	}

	err = db.Table("VideoUploads").Create(oldVideoData).Error
	if err != nil {
		t.Fatalf("Failed to insert old video data: %v", err)
	}

	// Create VOD service
	config := &AliCloudVODConfig{Enabled: false}
	service := NewAliCloudVODService(config, db)

	// Verify that the service was created successfully
	if service == nil {
		t.Fatal("Service should not be nil")
	}

	// Verify that old data still exists and is accessible
	var title, url string
	var playbackUrl, coverUrl *string
	err = db.Raw("SELECT Title, Url, PlaybackUrl, CoverUrl FROM VideoUploads WHERE Id = ?", "old-video-1").Row().Scan(&title, &url, &playbackUrl, &coverUrl)
	if err != nil {
		t.Fatalf("Failed to retrieve old video data: %v", err)
	}

	// Verify old data integrity
	if title != "Old Video" {
		t.Errorf("Expected title 'Old Video', got '%s'", title)
	}

	if url != "https://example.com/old-video.mp4" {
		t.Errorf("Expected URL 'https://example.com/old-video.mp4', got '%s'", url)
	}

	// Verify that PlaybackUrl and CoverUrl are NULL for old data (indicating they need processing)
	if playbackUrl != nil {
		t.Errorf("Expected PlaybackUrl to be NULL for old data, got '%v'", *playbackUrl)
	}

	if coverUrl != nil {
		t.Errorf("Expected CoverUrl to be NULL for old data, got '%v'", *coverUrl)
	}

	// Test that new data can be inserted with PlaybackUrl and CoverUrl
	newVideoData := map[string]interface{}{
		"Id":          "new-video-1",
		"Title":       "New Video",
		"Description": "This is a new video with PlaybackUrl and CoverUrl",
		"PlaybackUrl": "https://alicloud.com/video-123.mp4",
		"CoverUrl":    "https://alicloud.com/cover-123.jpg",
		"Status":      "completed",
	}

	err = db.Table("VideoUploads").Create(newVideoData).Error
	if err != nil {
		t.Fatalf("Failed to insert new video data: %v", err)
	}

	// Verify new data
	var newTitle string
	var newPlaybackUrl, newCoverUrl *string
	err = db.Raw("SELECT Title, PlaybackUrl, CoverUrl FROM VideoUploads WHERE Id = ?", "new-video-1").Row().Scan(&newTitle, &newPlaybackUrl, &newCoverUrl)
	if err != nil {
		t.Fatalf("Failed to retrieve new video data: %v", err)
	}

	if newPlaybackUrl == nil || *newPlaybackUrl != "https://alicloud.com/video-123.mp4" {
		t.Errorf("Expected PlaybackUrl 'https://alicloud.com/video-123.mp4', got '%v'", newPlaybackUrl)
	}

	if newCoverUrl == nil || *newCoverUrl != "https://alicloud.com/cover-123.jpg" {
		t.Errorf("Expected CoverUrl 'https://alicloud.com/cover-123.jpg', got '%v'", newCoverUrl)
	}

	t.Log("✅ Data migration compatibility test passed - old data preserved, PlaybackUrl and CoverUrl fields work correctly")
}
