package infrastructure

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/zenteam/nextevent-go/internal/config"
	"go.uber.org/zap"
)

// initRedis initializes the Redis client connection
func initRedis(cfg *config.Config, logger *zap.Logger) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Test the connection
	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Redis connection established")
	return rdb, nil
}
