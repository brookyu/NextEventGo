package main

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/jobs"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Testing NextEvent Job System")

	// Initialize Redis connection
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})
	defer redisClient.Close()

	// Test Redis connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		logger.Fatal("Failed to connect to Redis", zap.Error(err))
	}

	// Initialize job scheduler
	jobScheduler := jobs.NewAsynqScheduler(redisClient, logger)
	defer jobScheduler.Close()

	// Test 1: Schedule a news publishing job
	logger.Info("Test 1: Scheduling news publishing job")
	newsID := uuid.New()
	scheduledAt := time.Now().Add(10 * time.Second)

	if err := jobScheduler.ScheduleNewsPublishing(ctx, newsID.String(), scheduledAt); err != nil {
		logger.Error("Failed to schedule news publishing", zap.Error(err))
	} else {
		logger.Info("Successfully scheduled news publishing",
			zap.String("newsID", newsID.String()),
			zap.Time("scheduledAt", scheduledAt))
	}

	// Test 2: Schedule news expiration
	logger.Info("Test 2: Scheduling news expiration job")
	expiresAt := time.Now().Add(1 * time.Hour)

	if err := jobScheduler.ScheduleNewsExpiration(ctx, newsID.String(), expiresAt); err != nil {
		logger.Error("Failed to schedule news expiration", zap.Error(err))
	} else {
		logger.Info("Successfully scheduled news expiration",
			zap.String("newsID", newsID.String()),
			zap.Time("expiresAt", expiresAt))
	}

	// Test 3: Schedule WeChat draft creation
	logger.Info("Test 3: Scheduling WeChat draft creation")

	if err := jobScheduler.ScheduleWeChatDraftCreation(ctx, newsID.String(), 5*time.Second); err != nil {
		logger.Error("Failed to schedule WeChat draft creation", zap.Error(err))
	} else {
		logger.Info("Successfully scheduled WeChat draft creation",
			zap.String("newsID", newsID.String()))
	}

	// Test 4: Enqueue analytics event
	logger.Info("Test 4: Enqueuing analytics event")
	userID := uuid.New().String()
	metadata := map[string]interface{}{
		"source":    "web",
		"userAgent": "test-agent",
		"ip":        "127.0.0.1",
	}

	if err := jobScheduler.EnqueueNewsAnalytics(ctx, newsID.String(), "view", &userID, metadata); err != nil {
		logger.Error("Failed to enqueue analytics event", zap.Error(err))
	} else {
		logger.Info("Successfully enqueued analytics event",
			zap.String("newsID", newsID.String()),
			zap.String("eventType", "view"))
	}

	logger.Info("All test jobs scheduled successfully!")
	logger.Info("Start the worker with: ./worker")
	logger.Info("Monitor jobs with Redis CLI: redis-cli")
	logger.Info("  - KEYS asynq:*")
	logger.Info("  - LLEN asynq:queues:news")
	logger.Info("  - LLEN asynq:queues:analytics")
}
