package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// CacheInterface defines the caching operations
type CacheInterface interface {
	Get(ctx context.Context, key string, dest interface{}) error
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Delete(ctx context.Context, key string) error
	DeletePattern(ctx context.Context, pattern string) error
	Exists(ctx context.Context, key string) (bool, error)
	Increment(ctx context.Context, key string) (int64, error)
	Expire(ctx context.Context, key string, expiration time.Duration) error
	GetTTL(ctx context.Context, key string) (time.Duration, error)
	SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error)
	GetSet(ctx context.Context, key string, value interface{}) (string, error)
	MGet(ctx context.Context, keys []string) ([]interface{}, error)
	MSet(ctx context.Context, pairs map[string]interface{}, expiration time.Duration) error
	FlushAll(ctx context.Context) error
}

// RedisCache implements CacheInterface using Redis
type RedisCache struct {
	client *redis.Client
	logger *zap.Logger
	config CacheConfig
}

// CacheConfig holds cache configuration
type CacheConfig struct {
	Addr         string
	Password     string
	DB           int
	PoolSize     int
	MinIdleConns int
	MaxRetries   int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	PoolTimeout  time.Duration
	IdleTimeout  time.Duration
	KeyPrefix    string
	DefaultTTL   time.Duration
}

// DefaultCacheConfig returns default cache configuration
func DefaultCacheConfig() CacheConfig {
	return CacheConfig{
		Addr:         "localhost:6379",
		Password:     "",
		DB:           0,
		PoolSize:     10,
		MinIdleConns: 5,
		MaxRetries:   3,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolTimeout:  4 * time.Second,
		IdleTimeout:  5 * time.Minute,
		KeyPrefix:    "nextevent:",
		DefaultTTL:   1 * time.Hour,
	}
}

// NewRedisCache creates a new Redis cache instance
func NewRedisCache(config CacheConfig, logger *zap.Logger) (*RedisCache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:            config.Addr,
		Password:        config.Password,
		DB:              config.DB,
		PoolSize:        config.PoolSize,
		MinIdleConns:    config.MinIdleConns,
		MaxRetries:      config.MaxRetries,
		DialTimeout:     config.DialTimeout,
		ReadTimeout:     config.ReadTimeout,
		WriteTimeout:    config.WriteTimeout,
		PoolTimeout:     config.PoolTimeout,
		ConnMaxIdleTime: config.IdleTimeout,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Connected to Redis cache",
		zap.String("addr", config.Addr),
		zap.Int("db", config.DB))

	return &RedisCache{
		client: client,
		logger: logger,
		config: config,
	}, nil
}

// Get retrieves a value from cache and unmarshals it into dest
func (c *RedisCache) Get(ctx context.Context, key string, dest interface{}) error {
	fullKey := c.buildKey(key)

	val, err := c.client.Get(ctx, fullKey).Result()
	if err != nil {
		if err == redis.Nil {
			return ErrCacheMiss
		}
		c.logger.Error("Failed to get from cache",
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("cache get error: %w", err)
	}

	if err := json.Unmarshal([]byte(val), dest); err != nil {
		c.logger.Error("Failed to unmarshal cached value",
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("cache unmarshal error: %w", err)
	}

	return nil
}

// Set stores a value in cache with expiration
func (c *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	fullKey := c.buildKey(key)

	if expiration == 0 {
		expiration = c.config.DefaultTTL
	}

	data, err := json.Marshal(value)
	if err != nil {
		c.logger.Error("Failed to marshal value for cache",
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("cache marshal error: %w", err)
	}

	if err := c.client.Set(ctx, fullKey, data, expiration).Err(); err != nil {
		c.logger.Error("Failed to set cache",
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("cache set error: %w", err)
	}

	return nil
}

// Delete removes a key from cache
func (c *RedisCache) Delete(ctx context.Context, key string) error {
	fullKey := c.buildKey(key)

	if err := c.client.Del(ctx, fullKey).Err(); err != nil {
		c.logger.Error("Failed to delete from cache",
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("cache delete error: %w", err)
	}

	return nil
}

// DeletePattern removes all keys matching a pattern
func (c *RedisCache) DeletePattern(ctx context.Context, pattern string) error {
	fullPattern := c.buildKey(pattern)

	keys, err := c.client.Keys(ctx, fullPattern).Result()
	if err != nil {
		c.logger.Error("Failed to get keys for pattern",
			zap.String("pattern", fullPattern),
			zap.Error(err))
		return fmt.Errorf("cache keys error: %w", err)
	}

	if len(keys) == 0 {
		return nil
	}

	if err := c.client.Del(ctx, keys...).Err(); err != nil {
		c.logger.Error("Failed to delete keys by pattern",
			zap.String("pattern", fullPattern),
			zap.Int("count", len(keys)),
			zap.Error(err))
		return fmt.Errorf("cache delete pattern error: %w", err)
	}

	c.logger.Debug("Deleted keys by pattern",
		zap.String("pattern", fullPattern),
		zap.Int("count", len(keys)))

	return nil
}

// Exists checks if a key exists in cache
func (c *RedisCache) Exists(ctx context.Context, key string) (bool, error) {
	fullKey := c.buildKey(key)

	count, err := c.client.Exists(ctx, fullKey).Result()
	if err != nil {
		c.logger.Error("Failed to check key existence",
			zap.String("key", fullKey),
			zap.Error(err))
		return false, fmt.Errorf("cache exists error: %w", err)
	}

	return count > 0, nil
}

// Increment increments a numeric value in cache
func (c *RedisCache) Increment(ctx context.Context, key string) (int64, error) {
	fullKey := c.buildKey(key)

	val, err := c.client.Incr(ctx, fullKey).Result()
	if err != nil {
		c.logger.Error("Failed to increment cache value",
			zap.String("key", fullKey),
			zap.Error(err))
		return 0, fmt.Errorf("cache increment error: %w", err)
	}

	return val, nil
}

// Expire sets expiration time for a key
func (c *RedisCache) Expire(ctx context.Context, key string, expiration time.Duration) error {
	fullKey := c.buildKey(key)

	if err := c.client.Expire(ctx, fullKey, expiration).Err(); err != nil {
		c.logger.Error("Failed to set expiration",
			zap.String("key", fullKey),
			zap.Duration("expiration", expiration),
			zap.Error(err))
		return fmt.Errorf("cache expire error: %w", err)
	}

	return nil
}

// GetTTL gets the time to live for a key
func (c *RedisCache) GetTTL(ctx context.Context, key string) (time.Duration, error) {
	fullKey := c.buildKey(key)

	ttl, err := c.client.TTL(ctx, fullKey).Result()
	if err != nil {
		c.logger.Error("Failed to get TTL",
			zap.String("key", fullKey),
			zap.Error(err))
		return 0, fmt.Errorf("cache TTL error: %w", err)
	}

	return ttl, nil
}

// SetNX sets a key only if it doesn't exist
func (c *RedisCache) SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) (bool, error) {
	fullKey := c.buildKey(key)

	if expiration == 0 {
		expiration = c.config.DefaultTTL
	}

	data, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("cache marshal error: %w", err)
	}

	success, err := c.client.SetNX(ctx, fullKey, data, expiration).Result()
	if err != nil {
		c.logger.Error("Failed to set NX",
			zap.String("key", fullKey),
			zap.Error(err))
		return false, fmt.Errorf("cache setNX error: %w", err)
	}

	return success, nil
}

// GetSet atomically sets a key and returns the old value
func (c *RedisCache) GetSet(ctx context.Context, key string, value interface{}) (string, error) {
	fullKey := c.buildKey(key)

	data, err := json.Marshal(value)
	if err != nil {
		return "", fmt.Errorf("cache marshal error: %w", err)
	}

	oldVal, err := c.client.GetSet(ctx, fullKey, data).Result()
	if err != nil && err != redis.Nil {
		c.logger.Error("Failed to get set",
			zap.String("key", fullKey),
			zap.Error(err))
		return "", fmt.Errorf("cache getSet error: %w", err)
	}

	return oldVal, nil
}

// MGet gets multiple keys at once
func (c *RedisCache) MGet(ctx context.Context, keys []string) ([]interface{}, error) {
	fullKeys := make([]string, len(keys))
	for i, key := range keys {
		fullKeys[i] = c.buildKey(key)
	}

	vals, err := c.client.MGet(ctx, fullKeys...).Result()
	if err != nil {
		c.logger.Error("Failed to mget",
			zap.Strings("keys", fullKeys),
			zap.Error(err))
		return nil, fmt.Errorf("cache mget error: %w", err)
	}

	return vals, nil
}

// MSet sets multiple key-value pairs at once
func (c *RedisCache) MSet(ctx context.Context, pairs map[string]interface{}, expiration time.Duration) error {
	if expiration == 0 {
		expiration = c.config.DefaultTTL
	}

	pipe := c.client.Pipeline()

	for key, value := range pairs {
		fullKey := c.buildKey(key)
		data, err := json.Marshal(value)
		if err != nil {
			return fmt.Errorf("cache marshal error for key %s: %w", key, err)
		}
		pipe.Set(ctx, fullKey, data, expiration)
	}

	_, err := pipe.Exec(ctx)
	if err != nil {
		c.logger.Error("Failed to mset",
			zap.Int("count", len(pairs)),
			zap.Error(err))
		return fmt.Errorf("cache mset error: %w", err)
	}

	return nil
}

// FlushAll removes all keys from cache
func (c *RedisCache) FlushAll(ctx context.Context) error {
	if err := c.client.FlushAll(ctx).Err(); err != nil {
		c.logger.Error("Failed to flush all cache", zap.Error(err))
		return fmt.Errorf("cache flush error: %w", err)
	}

	c.logger.Info("Flushed all cache")
	return nil
}

// Close closes the Redis connection
func (c *RedisCache) Close() error {
	return c.client.Close()
}

// GetStats returns cache statistics
func (c *RedisCache) GetStats(ctx context.Context) (map[string]interface{}, error) {
	info, err := c.client.Info(ctx, "stats").Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get cache stats: %w", err)
	}

	stats := map[string]interface{}{
		"info": info,
	}

	return stats, nil
}

// Helper methods

func (c *RedisCache) buildKey(key string) string {
	return c.config.KeyPrefix + key
}

// Cache errors
var (
	ErrCacheMiss = fmt.Errorf("cache miss")
)
