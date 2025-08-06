package wechat

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// WorkflowConfig represents configuration for WeChat workflow
type WorkflowConfig struct {
	HostURL         string
	WechatServerURL string
	TempDir         string
	WeChat          Config
}

// Workflow manages the complete WeChat integration workflow
type Workflow struct {
	db          *gorm.DB
	redisClient *redis.Client
	config      *WorkflowConfig
	logger      *zap.Logger

	// Services
	wechatService *Service
	preprocessor  *ContentPreprocessor
	newsPublisher *NewsPublisher
}

// NewWorkflow creates a new WeChat workflow manager
func NewWorkflow(db *gorm.DB, redisClient *redis.Client, config *WorkflowConfig, logger *zap.Logger) (*Workflow, error) {
	// Initialize WeChat service
	wechatService := NewService(&config.WeChat, redisClient, logger)

	// Initialize content preprocessor
	preprocessor := NewContentPreprocessor(
		wechatService,
		db,
		config.HostURL,
		config.TempDir,
		logger,
	)

	// Initialize news publisher
	newsPublisher := NewNewsPublisher(
		db,
		wechatService,
		preprocessor,
		config.HostURL,
		config.WechatServerURL,
		logger,
	)

	return &Workflow{
		db:            db,
		redisClient:   redisClient,
		config:        config,
		logger:        logger,
		wechatService: wechatService,
		preprocessor:  preprocessor,
		newsPublisher: newsPublisher,
	}, nil
}

// GetWeChatService returns the WeChat service
func (w *Workflow) GetWeChatService() *Service {
	return w.wechatService
}

// GetContentPreprocessor returns the content preprocessor
func (w *Workflow) GetContentPreprocessor() *ContentPreprocessor {
	return w.preprocessor
}

// GetNewsPublisher returns the news publisher
func (w *Workflow) GetNewsPublisher() *NewsPublisher {
	return w.newsPublisher
}

// PublishNewsNow immediately publishes a news item to WeChat
func (w *Workflow) PublishNewsNow(ctx context.Context, newsID string) error {
	w.logger.Info("Publishing news immediately to WeChat", zap.String("newsId", newsID))

	// Get the news item
	var news SiteNews
	err := w.db.Where("Id = ? AND IsDeleted = ?", newsID, false).First(&news).Error
	if err != nil {
		return fmt.Errorf("news not found: %w", err)
	}

	// Publish to WeChat
	err = w.newsPublisher.publishNewsToWeChat(ctx, &news)
	if err != nil {
		return fmt.Errorf("failed to publish news to WeChat: %w", err)
	}

	w.logger.Info("Successfully published news to WeChat",
		zap.String("newsId", newsID),
		zap.String("title", news.Title))

	return nil
}

// PreprocessArticleContent preprocesses article content for WeChat
func (w *Workflow) PreprocessArticleContent(ctx context.Context, title, summary, content, author, frontCoverImageID, contentSourceURL string, showCoverPic bool) (*ProcessedArticle, error) {
	return w.preprocessor.ProcessArticleContent(
		ctx,
		title,
		summary,
		content,
		author,
		frontCoverImageID,
		contentSourceURL,
		showCoverPic,
	)
}

// CreateWeChatDraft creates a WeChat draft from processed articles
func (w *Workflow) CreateWeChatDraft(ctx context.Context, articles []DraftArticle) (string, error) {
	return w.wechatService.CreateDraft(ctx, articles)
}

// PublishWeChatDraft publishes a WeChat draft
func (w *Workflow) PublishWeChatDraft(ctx context.Context, mediaID string) (string, string, error) {
	return w.wechatService.PublishDraft(ctx, mediaID)
}

// DeleteWeChatDraft deletes a WeChat draft
func (w *Workflow) DeleteWeChatDraft(ctx context.Context, mediaID string) error {
	return w.wechatService.DeleteDraft(ctx, mediaID)
}

// UploadImageToWeChat uploads an image to WeChat
func (w *Workflow) UploadImageToWeChat(ctx context.Context, filePath string) (*MaterialUploadResponse, error) {
	return w.wechatService.UploadMaterial(ctx, filePath)
}

// GetWeChatAccessToken gets the current WeChat access token
func (w *Workflow) GetWeChatAccessToken(ctx context.Context) (string, error) {
	return w.wechatService.GetAccessToken(ctx)
}

// RefreshWeChatAccessToken forces a refresh of the WeChat access token
func (w *Workflow) RefreshWeChatAccessToken(ctx context.Context) (string, error) {
	return w.wechatService.RefreshAccessToken(ctx)
}

// GetWeChatTokenInfo gets information about the current access token
func (w *Workflow) GetWeChatTokenInfo(ctx context.Context) (*CachedTokenInfo, error) {
	return w.wechatService.GetTokenInfo(ctx)
}

// HealthCheck performs a health check on all WeChat services
func (w *Workflow) HealthCheck(ctx context.Context) error {
	// Check WeChat API connectivity
	err := w.wechatService.HealthCheck(ctx)
	if err != nil {
		return fmt.Errorf("WeChat API health check failed: %w", err)
	}

	// Check database connectivity
	sqlDB, err := w.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get database connection: %w", err)
	}

	err = sqlDB.Ping()
	if err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	// Check Redis connectivity
	err = w.redisClient.Ping(ctx).Err()
	if err != nil {
		return fmt.Errorf("Redis ping failed: %w", err)
	}

	w.logger.Info("WeChat workflow health check passed")
	return nil
}

// GetScheduledNewsCount returns the count of news scheduled for publishing
func (w *Workflow) GetScheduledNewsCount(ctx context.Context) (int64, error) {
	var count int64
	err := w.db.Model(&SiteNews{}).
		Where("ScheduledAt IS NOT NULL AND MediaId IS NULL AND IsDeleted = ?", false).
		Count(&count).Error

	return count, err
}

// GetPublishedNewsCount returns the count of news published to WeChat
func (w *Workflow) GetPublishedNewsCount(ctx context.Context) (int64, error) {
	var count int64
	err := w.db.Model(&SiteNews{}).
		Where("MediaId IS NOT NULL AND IsDeleted = ?", false).
		Count(&count).Error

	return count, err
}

// GetExpiredNewsCount returns the count of expired news
func (w *Workflow) GetExpiredNewsCount(ctx context.Context) (int64, error) {
	var count int64
	err := w.db.Model(&SiteNews{}).
		Where("ExpiresAt <= NOW() AND ExpiresAt IS NOT NULL AND IsDeleted = ?", false).
		Count(&count).Error

	return count, err
}

// GetWorkflowStats returns statistics about the WeChat workflow
func (w *Workflow) GetWorkflowStats(ctx context.Context) (map[string]interface{}, error) {
	scheduledCount, err := w.GetScheduledNewsCount(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get scheduled news count: %w", err)
	}

	publishedCount, err := w.GetPublishedNewsCount(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get published news count: %w", err)
	}

	expiredCount, err := w.GetExpiredNewsCount(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get expired news count: %w", err)
	}

	// Get token info
	tokenInfo, err := w.GetWeChatTokenInfo(ctx)
	if err != nil {
		w.logger.Warn("Failed to get WeChat token info", zap.Error(err))
		tokenInfo = nil
	}

	stats := map[string]interface{}{
		"scheduled_news_count": scheduledCount,
		"published_news_count": publishedCount,
		"expired_news_count":   expiredCount,
		"wechat_token_info":    tokenInfo,
		"workflow_status":      "healthy",
	}

	return stats, nil
}

// ProcessScheduledNews processes all scheduled news (used by cron job)
func (w *Workflow) ProcessScheduledNews(ctx context.Context) error {
	return w.newsPublisher.PublishScheduledNews(ctx)
}

// ProcessExpiredNews processes all expired news (used by cron job)
func (w *Workflow) ProcessExpiredNews(ctx context.Context) error {
	return w.newsPublisher.CheckExpiredNews(ctx)
}

// SendWeChatMessage sends a text message via WeChat
func (w *Workflow) SendWeChatMessage(ctx context.Context, openID, content string) error {
	return w.wechatService.SendTextMessage(ctx, openID, content)
}

// SendWeChatTemplateMessage sends a template message via WeChat
func (w *Workflow) SendWeChatTemplateMessage(ctx context.Context, templateMsg *TemplateMessage) error {
	return w.wechatService.SendTemplateMessage(ctx, templateMsg)
}

// GetWeChatUserList gets the list of WeChat followers
func (w *Workflow) GetWeChatUserList(ctx context.Context, nextOpenID string) (*UserListResponse, error) {
	return w.wechatService.GetUserList(ctx, nextOpenID)
}
