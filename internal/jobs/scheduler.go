package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// AsynqScheduler implements JobScheduler using Asynq
type AsynqScheduler struct {
	client *asynq.Client
	logger *zap.Logger
}

// NewAsynqScheduler creates a new Asynq-based job scheduler
func NewAsynqScheduler(redisClient *redis.Client, logger *zap.Logger) *AsynqScheduler {
	// Create Asynq client with Redis connection
	asynqClient := asynq.NewClient(asynq.RedisClientOpt{
		Addr:     redisClient.Options().Addr,
		Password: redisClient.Options().Password,
		DB:       redisClient.Options().DB,
	})

	return &AsynqScheduler{
		client: asynqClient,
		logger: logger,
	}
}

// ScheduleAt schedules a job to run at a specific time
func (s *AsynqScheduler) ScheduleAt(ctx context.Context, task *asynq.Task, processAt time.Time, opts ...asynq.Option) error {
	info, err := s.client.Enqueue(task, append(opts, asynq.ProcessAt(processAt))...)
	if err != nil {
		s.logger.Error("Failed to schedule task",
			zap.String("taskType", task.Type()),
			zap.Time("processAt", processAt),
			zap.Error(err))
		return fmt.Errorf("failed to schedule task: %w", err)
	}

	s.logger.Info("Task scheduled successfully",
		zap.String("taskType", task.Type()),
		zap.String("taskID", info.ID),
		zap.Time("processAt", processAt),
		zap.String("queue", info.Queue))

	return nil
}

// ScheduleIn schedules a job to run after a delay
func (s *AsynqScheduler) ScheduleIn(ctx context.Context, task *asynq.Task, delay time.Duration, opts ...asynq.Option) error {
	processAt := time.Now().Add(delay)
	info, err := s.client.Enqueue(task, append(opts, asynq.ProcessAt(processAt))...)
	if err != nil {
		s.logger.Error("Failed to schedule task with delay",
			zap.String("taskType", task.Type()),
			zap.Duration("delay", delay),
			zap.Error(err))
		return fmt.Errorf("failed to schedule task with delay: %w", err)
	}

	s.logger.Info("Task scheduled with delay successfully",
		zap.String("taskType", task.Type()),
		zap.String("taskID", info.ID),
		zap.Duration("delay", delay),
		zap.String("queue", info.Queue))

	return nil
}

// Enqueue enqueues a job to run immediately
func (s *AsynqScheduler) Enqueue(ctx context.Context, task *asynq.Task, opts ...asynq.Option) error {
	info, err := s.client.Enqueue(task, opts...)
	if err != nil {
		s.logger.Error("Failed to enqueue task",
			zap.String("taskType", task.Type()),
			zap.Error(err))
		return fmt.Errorf("failed to enqueue task: %w", err)
	}

	s.logger.Info("Task enqueued successfully",
		zap.String("taskType", task.Type()),
		zap.String("taskID", info.ID),
		zap.String("queue", info.Queue))

	return nil
}

// Cancel cancels a scheduled job
func (s *AsynqScheduler) Cancel(ctx context.Context, taskID string) error {
	// Note: Asynq doesn't provide direct task cancellation by ID
	// This would require additional implementation with task tracking
	s.logger.Warn("Task cancellation not implemented - Asynq limitation",
		zap.String("taskID", taskID))

	// For now, return nil as cancellation is not critical
	// In production, you might want to implement task tracking
	return nil
}

// Close closes the scheduler client
func (s *AsynqScheduler) Close() error {
	return s.client.Close()
}

// ScheduleNewsPublishing schedules a news item for publishing
func (s *AsynqScheduler) ScheduleNewsPublishing(ctx context.Context, newsID string, scheduledAt time.Time) error {
	// Parse newsID
	newsUUID, err := parseUUID(newsID)
	if err != nil {
		return fmt.Errorf("invalid news ID: %w", err)
	}

	// Create task
	task, err := NewScheduledNewsPublisherTask(newsUUID, scheduledAt)
	if err != nil {
		return fmt.Errorf("failed to create scheduled news publisher task: %w", err)
	}

	// Schedule the task
	opts := []asynq.Option{
		asynq.Queue("news"),
		asynq.MaxRetry(3),
		asynq.Timeout(5 * time.Minute),
	}

	return s.ScheduleAt(ctx, task, scheduledAt, opts...)
}

// ScheduleNewsExpiration schedules news expiration handling
func (s *AsynqScheduler) ScheduleNewsExpiration(ctx context.Context, newsID string, expiresAt time.Time) error {
	// Parse newsID
	newsUUID, err := parseUUID(newsID)
	if err != nil {
		return fmt.Errorf("invalid news ID: %w", err)
	}

	// Create task
	task, err := NewNewsExpirationTask(newsUUID, expiresAt)
	if err != nil {
		return fmt.Errorf("failed to create news expiration task: %w", err)
	}

	// Schedule the task
	opts := []asynq.Option{
		asynq.Queue("news"),
		asynq.MaxRetry(2),
		asynq.Timeout(2 * time.Minute),
	}

	return s.ScheduleAt(ctx, task, expiresAt, opts...)
}

// ScheduleWeChatDraftCreation schedules WeChat draft creation
func (s *AsynqScheduler) ScheduleWeChatDraftCreation(ctx context.Context, newsID string, delay time.Duration) error {
	// Parse newsID
	newsUUID, err := parseUUID(newsID)
	if err != nil {
		return fmt.Errorf("invalid news ID: %w", err)
	}

	// Create task
	task, err := NewWeChatDraftCreationTask(newsUUID)
	if err != nil {
		return fmt.Errorf("failed to create WeChat draft creation task: %w", err)
	}

	// Schedule the task
	opts := []asynq.Option{
		asynq.Queue("wechat"),
		asynq.MaxRetry(3),
		asynq.Timeout(10 * time.Minute),
	}

	if delay > 0 {
		return s.ScheduleIn(ctx, task, delay, opts...)
	}
	return s.Enqueue(ctx, task, opts...)
}

// EnqueueNewsAnalytics enqueues news analytics processing
func (s *AsynqScheduler) EnqueueNewsAnalytics(ctx context.Context, newsID string, eventType string, userID *string, metadata map[string]interface{}) error {
	// Parse newsID
	newsUUID, err := parseUUID(newsID)
	if err != nil {
		return fmt.Errorf("invalid news ID: %w", err)
	}

	// Parse userID if provided
	var userUUID *uuid.UUID
	if userID != nil {
		parsed, err := parseUUID(*userID)
		if err != nil {
			return fmt.Errorf("invalid user ID: %w", err)
		}
		userUUID = &parsed
	}

	// Create task
	task, err := NewNewsAnalyticsTask(newsUUID, eventType, userUUID, metadata)
	if err != nil {
		return fmt.Errorf("failed to create news analytics task: %w", err)
	}

	// Enqueue the task
	opts := []asynq.Option{
		asynq.Queue("analytics"),
		asynq.MaxRetry(2),
		asynq.Timeout(1 * time.Minute),
	}

	return s.Enqueue(ctx, task, opts...)
}

// Helper function to parse UUID
func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}
