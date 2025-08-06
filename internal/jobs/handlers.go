package jobs

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// JobHandlerImpl implements JobHandler interface
type JobHandlerImpl struct {
	newsService       *services.NewsManagementService
	wechatNewsService *services.WeChatNewsServiceImpl
	newsRepo          repositories.NewsRepository
	logger            *zap.Logger
}

// NewJobHandler creates a new job handler
func NewJobHandler(
	newsService *services.NewsManagementService,
	wechatNewsService *services.WeChatNewsServiceImpl,
	newsRepo repositories.NewsRepository,
	logger *zap.Logger,
) *JobHandlerImpl {
	return &JobHandlerImpl{
		newsService:       newsService,
		wechatNewsService: wechatNewsService,
		newsRepo:          newsRepo,
		logger:            logger,
	}
}

// HandleScheduledNewsPublisher handles scheduled news publishing
func (h *JobHandlerImpl) HandleScheduledNewsPublisher(ctx context.Context, task *asynq.Task) error {
	var payload ScheduledNewsPublisherPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal scheduled news publisher payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing scheduled news publishing",
		zap.String("newsID", payload.NewsID.String()),
		zap.Time("scheduledAt", payload.ScheduledAt),
		zap.Int("retryCount", payload.RetryCount))

	// Get the news item
	news, err := h.newsRepo.GetByID(ctx, payload.NewsID)
	if err != nil {
		h.logger.Error("Failed to get news for scheduled publishing",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Check if news is still scheduled and ready for publishing
	if !news.IsScheduled() {
		h.logger.Info("News is no longer scheduled for publishing",
			zap.String("newsID", payload.NewsID.String()),
			zap.String("status", string(news.Status)))
		return nil // Not an error, just skip
	}

	// Check if scheduled time has arrived
	if news.ScheduledAt != nil && news.ScheduledAt.After(time.Now()) {
		h.logger.Info("News scheduled time has not arrived yet",
			zap.String("newsID", payload.NewsID.String()),
			zap.Time("scheduledAt", *news.ScheduledAt))
		return fmt.Errorf("scheduled time has not arrived yet")
	}

	// Publish the news
	if err := h.newsService.PublishNews(ctx, payload.NewsID, nil); err != nil {
		h.logger.Error("Failed to publish scheduled news",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))

		// Increment retry count
		payload.RetryCount++
		if payload.RetryCount >= 3 {
			h.logger.Error("Max retries reached for scheduled news publishing",
				zap.String("newsID", payload.NewsID.String()),
				zap.Int("retryCount", payload.RetryCount))
			return fmt.Errorf("max retries reached: %w", err)
		}

		return fmt.Errorf("failed to publish news (retry %d): %w", payload.RetryCount, err)
	}

	h.logger.Info("Successfully published scheduled news",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleNewsExpiration handles news expiration
func (h *JobHandlerImpl) HandleNewsExpiration(ctx context.Context, task *asynq.Task) error {
	var payload NewsExpirationPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal news expiration payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing news expiration",
		zap.String("newsID", payload.NewsID.String()),
		zap.Time("expiresAt", payload.ExpiresAt))

	// Get the news item
	news, err := h.newsRepo.GetByID(ctx, payload.NewsID)
	if err != nil {
		h.logger.Error("Failed to get news for expiration handling",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Check if news is expired
	if !news.IsExpired() {
		h.logger.Info("News is not yet expired",
			zap.String("newsID", payload.NewsID.String()),
			zap.Time("expiresAt", payload.ExpiresAt))
		return nil // Not an error, just skip
	}

	// Archive the expired news
	if err := h.newsService.ArchiveNews(ctx, payload.NewsID); err != nil {
		h.logger.Error("Failed to archive expired news",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))
		return fmt.Errorf("failed to archive expired news: %w", err)
	}

	h.logger.Info("Successfully archived expired news",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleWeChatDraftCreation handles WeChat draft creation
func (h *JobHandlerImpl) HandleWeChatDraftCreation(ctx context.Context, task *asynq.Task) error {
	var payload WeChatDraftCreationPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal WeChat draft creation payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing WeChat draft creation",
		zap.String("newsID", payload.NewsID.String()),
		zap.Int("retryCount", payload.RetryCount))

	// Create WeChat draft
	if err := h.wechatNewsService.CreateWeChatDraft(ctx, payload.NewsID); err != nil {
		h.logger.Error("Failed to create WeChat draft",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))

		// Increment retry count
		payload.RetryCount++
		if payload.RetryCount >= 3 {
			h.logger.Error("Max retries reached for WeChat draft creation",
				zap.String("newsID", payload.NewsID.String()),
				zap.Int("retryCount", payload.RetryCount))
			return fmt.Errorf("max retries reached: %w", err)
		}

		return fmt.Errorf("failed to create WeChat draft (retry %d): %w", payload.RetryCount, err)
	}

	h.logger.Info("Successfully created WeChat draft",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleWeChatPublishing handles WeChat publishing
func (h *JobHandlerImpl) HandleWeChatPublishing(ctx context.Context, task *asynq.Task) error {
	var payload WeChatPublishingPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal WeChat publishing payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing WeChat publishing",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("draftID", payload.DraftID),
		zap.Int("retryCount", payload.RetryCount))

	// Publish to WeChat
	if err := h.wechatNewsService.PublishToWeChat(ctx, payload.NewsID); err != nil {
		h.logger.Error("Failed to publish to WeChat",
			zap.String("newsID", payload.NewsID.String()),
			zap.String("draftID", payload.DraftID),
			zap.Error(err))

		// Increment retry count
		payload.RetryCount++
		if payload.RetryCount >= 3 {
			h.logger.Error("Max retries reached for WeChat publishing",
				zap.String("newsID", payload.NewsID.String()),
				zap.Int("retryCount", payload.RetryCount))
			return fmt.Errorf("max retries reached: %w", err)
		}

		return fmt.Errorf("failed to publish to WeChat (retry %d): %w", payload.RetryCount, err)
	}

	h.logger.Info("Successfully published to WeChat",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("draftID", payload.DraftID))

	return nil
}

// HandleNewsAnalytics handles news analytics processing
func (h *JobHandlerImpl) HandleNewsAnalytics(ctx context.Context, task *asynq.Task) error {
	var payload NewsAnalyticsPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal news analytics payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing news analytics",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("eventType", payload.EventType))

	// Process analytics event
	// This would typically involve updating counters, storing events, etc.
	switch payload.EventType {
	case "view":
		// Increment view count
		if err := h.newsRepo.IncrementViewCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment view count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment view count: %w", err)
		}
	case "share":
		// Increment share count
		if err := h.newsRepo.IncrementShareCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment share count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment share count: %w", err)
		}
	case "like":
		// Increment like count
		if err := h.newsRepo.IncrementLikeCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment like count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment like count: %w", err)
		}
	default:
		h.logger.Warn("Unknown analytics event type",
			zap.String("newsID", payload.NewsID.String()),
			zap.String("eventType", payload.EventType))
	}

	h.logger.Info("Successfully processed news analytics",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("eventType", payload.EventType))

	return nil
}

// SimpleJobHandler is a simplified job handler that only handles basic operations
type SimpleJobHandler struct {
	newsRepo repositories.NewsRepository
	logger   *zap.Logger
}

// NewSimpleJobHandler creates a new simple job handler
func NewSimpleJobHandler(newsRepo repositories.NewsRepository, logger *zap.Logger) *SimpleJobHandler {
	return &SimpleJobHandler{
		newsRepo: newsRepo,
		logger:   logger,
	}
}

// HandleScheduledNewsPublisher handles scheduled news publishing (simplified)
func (h *SimpleJobHandler) HandleScheduledNewsPublisher(ctx context.Context, task *asynq.Task) error {
	var payload ScheduledNewsPublisherPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal scheduled news publisher payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing scheduled news publishing (simplified)",
		zap.String("newsID", payload.NewsID.String()),
		zap.Time("scheduledAt", payload.ScheduledAt))

	// For now, just mark the news as published without complex service logic
	if err := h.newsRepo.Publish(ctx, payload.NewsID, time.Now()); err != nil {
		h.logger.Error("Failed to publish scheduled news",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))
		return fmt.Errorf("failed to publish news: %w", err)
	}

	h.logger.Info("Successfully published scheduled news (simplified)",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleNewsExpiration handles news expiration (simplified)
func (h *SimpleJobHandler) HandleNewsExpiration(ctx context.Context, task *asynq.Task) error {
	var payload NewsExpirationPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal news expiration payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing news expiration (simplified)",
		zap.String("newsID", payload.NewsID.String()),
		zap.Time("expiresAt", payload.ExpiresAt))

	// Archive the expired news
	if err := h.newsRepo.ArchiveNews(ctx, payload.NewsID); err != nil {
		h.logger.Error("Failed to archive expired news",
			zap.String("newsID", payload.NewsID.String()),
			zap.Error(err))
		return fmt.Errorf("failed to archive expired news: %w", err)
	}

	h.logger.Info("Successfully archived expired news (simplified)",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleWeChatDraftCreation handles WeChat draft creation (simplified - just logs)
func (h *SimpleJobHandler) HandleWeChatDraftCreation(ctx context.Context, task *asynq.Task) error {
	var payload WeChatDraftCreationPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal WeChat draft creation payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing WeChat draft creation (simplified - logging only)",
		zap.String("newsID", payload.NewsID.String()))

	// For now, just log that we would create a WeChat draft
	h.logger.Info("Would create WeChat draft for news (simplified)",
		zap.String("newsID", payload.NewsID.String()))

	return nil
}

// HandleWeChatPublishing handles WeChat publishing (simplified - just logs)
func (h *SimpleJobHandler) HandleWeChatPublishing(ctx context.Context, task *asynq.Task) error {
	var payload WeChatPublishingPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal WeChat publishing payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing WeChat publishing (simplified - logging only)",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("draftID", payload.DraftID))

	// For now, just log that we would publish to WeChat
	h.logger.Info("Would publish to WeChat (simplified)",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("draftID", payload.DraftID))

	return nil
}

// HandleNewsAnalytics handles news analytics processing (simplified)
func (h *SimpleJobHandler) HandleNewsAnalytics(ctx context.Context, task *asynq.Task) error {
	var payload NewsAnalyticsPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		h.logger.Error("Failed to unmarshal news analytics payload", zap.Error(err))
		return fmt.Errorf("failed to unmarshal payload: %w", err)
	}

	h.logger.Info("Processing news analytics (simplified)",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("eventType", payload.EventType))

	// Process analytics event
	switch payload.EventType {
	case "view":
		if err := h.newsRepo.IncrementViewCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment view count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment view count: %w", err)
		}
	case "share":
		if err := h.newsRepo.IncrementShareCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment share count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment share count: %w", err)
		}
	case "like":
		if err := h.newsRepo.IncrementLikeCount(ctx, payload.NewsID); err != nil {
			h.logger.Error("Failed to increment like count",
				zap.String("newsID", payload.NewsID.String()),
				zap.Error(err))
			return fmt.Errorf("failed to increment like count: %w", err)
		}
	default:
		h.logger.Warn("Unknown analytics event type",
			zap.String("newsID", payload.NewsID.String()),
			zap.String("eventType", payload.EventType))
	}

	h.logger.Info("Successfully processed news analytics (simplified)",
		zap.String("newsID", payload.NewsID.String()),
		zap.String("eventType", payload.EventType))

	return nil
}
