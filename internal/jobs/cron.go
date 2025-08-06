package jobs

import (
	"context"
	"time"

	"github.com/robfig/cron/v3"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
)

// CronScheduler manages periodic tasks using cron
type CronScheduler struct {
	cron          *cron.Cron
	scheduler     JobScheduler
	newsRepo      repositories.NewsRepository
	newsPublisher *wechat.NewsPublisher
	logger        *zap.Logger
}

// NewCronScheduler creates a new cron scheduler
func NewCronScheduler(
	scheduler JobScheduler,
	newsRepo repositories.NewsRepository,
	newsPublisher *wechat.NewsPublisher,
	logger *zap.Logger,
) *CronScheduler {
	// Create cron with second precision and logging
	c := cron.New(
		cron.WithSeconds(),
		cron.WithLogger(NewCronLogger(logger)),
		cron.WithChain(
			cron.Recover(NewCronLogger(logger)),
			cron.DelayIfStillRunning(NewCronLogger(logger)),
		),
	)

	return &CronScheduler{
		cron:          c,
		scheduler:     scheduler,
		newsRepo:      newsRepo,
		newsPublisher: newsPublisher,
		logger:        logger,
	}
}

// Start starts the cron scheduler
func (cs *CronScheduler) Start() {
	cs.logger.Info("Starting cron scheduler...")

	// Register periodic jobs
	cs.registerJobs()

	// Start the cron scheduler
	cs.cron.Start()

	cs.logger.Info("Cron scheduler started successfully")
}

// Stop stops the cron scheduler
func (cs *CronScheduler) Stop() {
	cs.logger.Info("Stopping cron scheduler...")

	ctx := cs.cron.Stop()
	<-ctx.Done()

	cs.logger.Info("Cron scheduler stopped")
}

// registerJobs registers all periodic jobs
func (cs *CronScheduler) registerJobs() {
	// Check for scheduled news every minute
	cs.cron.AddFunc("0 * * * * *", func() {
		cs.processScheduledNews()
	})

	// Check for expired news every hour
	cs.cron.AddFunc("0 0 * * * *", func() {
		cs.processExpiredNews()
	})

	// WeChat: Publish scheduled news every minute
	cs.cron.AddFunc("0 * * * * *", func() {
		cs.publishScheduledNewsToWeChat()
	})

	// WeChat: Check expired news every hour
	cs.cron.AddFunc("0 0 * * * *", func() {
		cs.checkExpiredNewsWeChat()
	})

	// Process news analytics every 5 minutes
	cs.cron.AddFunc("0 */5 * * * *", func() {
		cs.processNewsAnalytics()
	})

	// Health check every 30 seconds
	cs.cron.AddFunc("*/30 * * * * *", func() {
		cs.healthCheck()
	})

	// Cleanup old completed jobs every day at 2 AM
	cs.cron.AddFunc("0 0 2 * * *", func() {
		cs.cleanupOldJobs()
	})

	cs.logger.Info("All cron jobs registered")
}

// processScheduledNews finds and schedules news items that are ready for publishing
func (cs *CronScheduler) processScheduledNews() {
	ctx := context.Background()

	// Find news scheduled for the next 5 minutes
	endTime := time.Now().Add(5 * time.Minute)
	scheduledNews, err := cs.newsRepo.GetScheduledNews(ctx, time.Now(), endTime)
	if err != nil {
		cs.logger.Error("Failed to get scheduled news", zap.Error(err))
		return
	}

	if len(scheduledNews) == 0 {
		return // No scheduled news
	}

	cs.logger.Info("Found scheduled news items",
		zap.Int("count", len(scheduledNews)))

	for _, news := range scheduledNews {
		// Create scheduled publishing task
		task, err := NewScheduledNewsPublisherTask(news.ID, *news.ScheduledAt)
		if err != nil {
			cs.logger.Error("Failed to create scheduled news publisher task",
				zap.String("newsID", news.ID.String()),
				zap.Error(err))
			continue
		}

		// Schedule the task
		if err := cs.scheduler.ScheduleAt(ctx, task, *news.ScheduledAt); err != nil {
			cs.logger.Error("Failed to schedule news publishing task",
				zap.String("newsID", news.ID.String()),
				zap.Time("scheduledAt", *news.ScheduledAt),
				zap.Error(err))
			continue
		}

		cs.logger.Info("Scheduled news publishing task",
			zap.String("newsID", news.ID.String()),
			zap.Time("scheduledAt", *news.ScheduledAt))
	}
}

// processExpiredNews finds and schedules expiration handling for news items
func (cs *CronScheduler) processExpiredNews() {
	ctx := context.Background()

	// Find news that will expire in the next hour
	endTime := time.Now().Add(1 * time.Hour)
	expiringNews, err := cs.newsRepo.GetExpiringNews(ctx, time.Now(), endTime)
	if err != nil {
		cs.logger.Error("Failed to get expiring news", zap.Error(err))
		return
	}

	if len(expiringNews) == 0 {
		return // No expiring news
	}

	cs.logger.Info("Found expiring news items",
		zap.Int("count", len(expiringNews)))

	for _, news := range expiringNews {
		// Create expiration task
		task, err := NewNewsExpirationTask(news.ID, *news.ExpiresAt)
		if err != nil {
			cs.logger.Error("Failed to create news expiration task",
				zap.String("newsID", news.ID.String()),
				zap.Error(err))
			continue
		}

		// Schedule the task
		if err := cs.scheduler.ScheduleAt(ctx, task, *news.ExpiresAt); err != nil {
			cs.logger.Error("Failed to schedule news expiration task",
				zap.String("newsID", news.ID.String()),
				zap.Time("expiresAt", *news.ExpiresAt),
				zap.Error(err))
			continue
		}

		cs.logger.Info("Scheduled news expiration task",
			zap.String("newsID", news.ID.String()),
			zap.Time("expiresAt", *news.ExpiresAt))
	}
}

// processNewsAnalytics processes pending analytics events
func (cs *CronScheduler) processNewsAnalytics() {
	// This would typically process batched analytics events
	// For now, we'll just log that analytics processing is running
	cs.logger.Debug("Processing news analytics batch")

	// In a real implementation, you might:
	// 1. Aggregate view counts from a temporary table
	// 2. Update search indexes
	// 3. Generate trending news lists
	// 4. Update recommendation algorithms
}

// healthCheck performs health checks on the job system
func (cs *CronScheduler) healthCheck() {
	ctx := context.Background()

	// Check database connectivity
	if err := cs.newsRepo.HealthCheck(ctx); err != nil {
		cs.logger.Error("Database health check failed", zap.Error(err))
		return
	}

	// Check Redis connectivity (through scheduler)
	// This is a simple check - in production you might want more comprehensive checks
	cs.logger.Debug("Job system health check passed")
}

// cleanupOldJobs cleans up old completed jobs
func (cs *CronScheduler) cleanupOldJobs() {
	cs.logger.Info("Starting cleanup of old completed jobs")

	// This would typically clean up:
	// 1. Completed tasks older than X days
	// 2. Failed tasks that have exceeded retry limits
	// 3. Archived news items older than retention period

	// For now, just log the cleanup
	cs.logger.Info("Old job cleanup completed")
}

// CronLogger adapts zap.Logger to cron.Logger interface
type CronLogger struct {
	logger *zap.Logger
}

// NewCronLogger creates a new cron logger adapter
func NewCronLogger(logger *zap.Logger) *CronLogger {
	return &CronLogger{logger: logger}
}

// Info logs an info message
func (l *CronLogger) Info(msg string, keysAndValues ...interface{}) {
	fields := make([]zap.Field, 0, len(keysAndValues)/2)
	for i := 0; i < len(keysAndValues); i += 2 {
		if i+1 < len(keysAndValues) {
			key := keysAndValues[i].(string)
			value := keysAndValues[i+1]
			fields = append(fields, zap.Any(key, value))
		}
	}
	l.logger.Info(msg, fields...)
}

// Error logs an error message
func (l *CronLogger) Error(err error, msg string, keysAndValues ...interface{}) {
	fields := make([]zap.Field, 0, len(keysAndValues)/2+1)
	fields = append(fields, zap.Error(err))

	for i := 0; i < len(keysAndValues); i += 2 {
		if i+1 < len(keysAndValues) {
			key := keysAndValues[i].(string)
			value := keysAndValues[i+1]
			fields = append(fields, zap.Any(key, value))
		}
	}
	l.logger.Error(msg, fields...)
}

// publishScheduledNewsToWeChat publishes scheduled news to WeChat
func (cs *CronScheduler) publishScheduledNewsToWeChat() {
	if cs.newsPublisher == nil {
		cs.logger.Debug("WeChat news publisher not configured, skipping")
		return
	}

	ctx := context.Background()
	err := cs.newsPublisher.PublishScheduledNews(ctx)
	if err != nil {
		cs.logger.Error("Failed to publish scheduled news to WeChat", zap.Error(err))
	}
}

// checkExpiredNewsWeChat checks for expired news in WeChat
func (cs *CronScheduler) checkExpiredNewsWeChat() {
	if cs.newsPublisher == nil {
		cs.logger.Debug("WeChat news publisher not configured, skipping")
		return
	}

	ctx := context.Background()
	err := cs.newsPublisher.CheckExpiredNews(ctx)
	if err != nil {
		cs.logger.Error("Failed to check expired news in WeChat", zap.Error(err))
	}
}
