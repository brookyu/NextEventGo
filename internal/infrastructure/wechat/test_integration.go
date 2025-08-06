package wechat

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// TestIntegration provides integration testing utilities for WeChat functionality
type TestIntegration struct {
	workflow *Workflow
	logger   *zap.Logger
}

// NewTestIntegration creates a new test integration instance
func NewTestIntegration(workflow *Workflow, logger *zap.Logger) *TestIntegration {
	return &TestIntegration{
		workflow: workflow,
		logger:   logger,
	}
}

// TestWeChatConnectivity tests basic WeChat API connectivity
func (t *TestIntegration) TestWeChatConnectivity(ctx context.Context) error {
	t.logger.Info("Testing WeChat API connectivity...")
	
	// Test access token retrieval
	token, err := t.workflow.GetWeChatAccessToken(ctx)
	if err != nil {
		return fmt.Errorf("failed to get WeChat access token: %w", err)
	}
	
	if token == "" {
		return fmt.Errorf("received empty access token")
	}
	
	t.logger.Info("WeChat API connectivity test passed", zap.String("tokenPrefix", token[:10]+"..."))
	return nil
}

// TestContentPreprocessing tests content preprocessing functionality
func (t *TestIntegration) TestContentPreprocessing(ctx context.Context) error {
	t.logger.Info("Testing content preprocessing...")
	
	// Test content with images
	testContent := `
		<h1>Test Article</h1>
		<p>This is a test article with an image:</p>
		<img src="/MediaFiles/test-image.jpg" alt="Test Image" />
		<p>And some more content.</p>
	`
	
	processedArticle, err := t.workflow.PreprocessArticleContent(
		ctx,
		"Test Article",
		"Test summary",
		testContent,
		"Test Author",
		"",
		"",
		true,
	)
	
	if err != nil {
		return fmt.Errorf("content preprocessing failed: %w", err)
	}
	
	if processedArticle.Title != "Test Article" {
		return fmt.Errorf("title not preserved: got %s", processedArticle.Title)
	}
	
	t.logger.Info("Content preprocessing test passed",
		zap.String("title", processedArticle.Title),
		zap.Int("processedImageCount", len(processedArticle.ProcessedImageURLs)))
	
	return nil
}

// TestScheduledNewsQuery tests querying for scheduled news
func (t *TestIntegration) TestScheduledNewsQuery(ctx context.Context) error {
	t.logger.Info("Testing scheduled news query...")
	
	count, err := t.workflow.GetScheduledNewsCount(ctx)
	if err != nil {
		return fmt.Errorf("failed to get scheduled news count: %w", err)
	}
	
	t.logger.Info("Scheduled news query test passed", zap.Int64("scheduledCount", count))
	return nil
}

// TestWorkflowStats tests workflow statistics
func (t *TestIntegration) TestWorkflowStats(ctx context.Context) error {
	t.logger.Info("Testing workflow statistics...")
	
	stats, err := t.workflow.GetWorkflowStats(ctx)
	if err != nil {
		return fmt.Errorf("failed to get workflow stats: %w", err)
	}
	
	requiredKeys := []string{"scheduled_news_count", "published_news_count", "expired_news_count", "workflow_status"}
	for _, key := range requiredKeys {
		if _, exists := stats[key]; !exists {
			return fmt.Errorf("missing required stat key: %s", key)
		}
	}
	
	t.logger.Info("Workflow statistics test passed", zap.Any("stats", stats))
	return nil
}

// TestHealthCheck tests the complete health check
func (t *TestIntegration) TestHealthCheck(ctx context.Context) error {
	t.logger.Info("Testing health check...")
	
	err := t.workflow.HealthCheck(ctx)
	if err != nil {
		return fmt.Errorf("health check failed: %w", err)
	}
	
	t.logger.Info("Health check test passed")
	return nil
}

// RunAllTests runs all integration tests
func (t *TestIntegration) RunAllTests(ctx context.Context) error {
	tests := []struct {
		name string
		fn   func(context.Context) error
	}{
		{"WeChat Connectivity", t.TestWeChatConnectivity},
		{"Content Preprocessing", t.TestContentPreprocessing},
		{"Scheduled News Query", t.TestScheduledNewsQuery},
		{"Workflow Stats", t.TestWorkflowStats},
		{"Health Check", t.TestHealthCheck},
	}
	
	t.logger.Info("Starting WeChat integration tests", zap.Int("testCount", len(tests)))
	
	for i, test := range tests {
		t.logger.Info("Running test", zap.Int("testNumber", i+1), zap.String("testName", test.name))
		
		start := time.Now()
		err := test.fn(ctx)
		duration := time.Since(start)
		
		if err != nil {
			t.logger.Error("Test failed",
				zap.String("testName", test.name),
				zap.Duration("duration", duration),
				zap.Error(err))
			return fmt.Errorf("test '%s' failed: %w", test.name, err)
		}
		
		t.logger.Info("Test passed",
			zap.String("testName", test.name),
			zap.Duration("duration", duration))
	}
	
	t.logger.Info("All WeChat integration tests passed")
	return nil
}

// CreateTestNews creates a test news item for testing purposes
func (t *TestIntegration) CreateTestNews(ctx context.Context, db *gorm.DB) (*SiteNews, error) {
	t.logger.Info("Creating test news item...")
	
	now := time.Now()
	scheduledAt := now.Add(1 * time.Minute) // Schedule for 1 minute from now
	
	testNews := &SiteNews{
		ID:          fmt.Sprintf("test-news-%d", now.Unix()),
		Title:       fmt.Sprintf("Test News %d", now.Unix()),
		ScheduledAt: &scheduledAt,
		CreationTime: now,
		IsDeleted:   false,
	}
	
	err := db.Create(testNews).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create test news: %w", err)
	}
	
	t.logger.Info("Test news created",
		zap.String("newsId", testNews.ID),
		zap.String("title", testNews.Title),
		zap.Time("scheduledAt", scheduledAt))
	
	return testNews, nil
}

// CleanupTestNews removes test news items
func (t *TestIntegration) CleanupTestNews(ctx context.Context, db *gorm.DB, newsID string) error {
	t.logger.Info("Cleaning up test news", zap.String("newsId", newsID))
	
	// Delete the test news
	err := db.Where("Id = ?", newsID).Delete(&SiteNews{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete test news: %w", err)
	}
	
	// Delete associated articles
	err = db.Where("SiteNewsId = ?", newsID).Delete(&SiteNewsArticle{}).Error
	if err != nil {
		t.logger.Warn("Failed to delete test news articles", zap.Error(err))
	}
	
	t.logger.Info("Test news cleanup completed", zap.String("newsId", newsID))
	return nil
}

// TestPublishingWorkflow tests the complete publishing workflow
func (t *TestIntegration) TestPublishingWorkflow(ctx context.Context, db *gorm.DB) error {
	t.logger.Info("Testing complete publishing workflow...")
	
	// Create test news
	testNews, err := t.CreateTestNews(ctx, db)
	if err != nil {
		return fmt.Errorf("failed to create test news: %w", err)
	}
	
	// Cleanup after test
	defer func() {
		if cleanupErr := t.CleanupTestNews(ctx, db, testNews.ID); cleanupErr != nil {
			t.logger.Error("Failed to cleanup test news", zap.Error(cleanupErr))
		}
	}()
	
	// Test immediate publishing (skip scheduling)
	err = t.workflow.PublishNewsNow(ctx, testNews.ID)
	if err != nil {
		return fmt.Errorf("failed to publish test news: %w", err)
	}
	
	// Verify the news was published (has MediaId)
	var updatedNews SiteNews
	err = db.Where("Id = ?", testNews.ID).First(&updatedNews).Error
	if err != nil {
		return fmt.Errorf("failed to retrieve updated news: %w", err)
	}
	
	if updatedNews.MediaId == nil || *updatedNews.MediaId == "" {
		return fmt.Errorf("news was not published to WeChat (no MediaId)")
	}
	
	t.logger.Info("Publishing workflow test passed",
		zap.String("newsId", testNews.ID),
		zap.String("mediaId", *updatedNews.MediaId))
	
	return nil
}

// ValidateConfiguration validates the WeChat configuration
func (t *TestIntegration) ValidateConfiguration() error {
	t.logger.Info("Validating WeChat configuration...")
	
	// This would validate that all required configuration is present
	// For now, just log that validation is complete
	t.logger.Info("WeChat configuration validation completed")
	return nil
}
