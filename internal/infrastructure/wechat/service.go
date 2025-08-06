package wechat

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Config represents WeChat configuration
type Config struct {
	AppID                 string        `yaml:"app_id"`
	AppSecret             string        `yaml:"app_secret"`
	Token                 string        `yaml:"token"`
	EncodingAESKey        string        `yaml:"encoding_aes_key"`
	VerifySignature       bool          `yaml:"verify_signature"`
	CacheAccessToken      bool          `yaml:"cache_access_token"`
	AccessTokenCacheKey   string        `yaml:"access_token_cache_key"`
	AccessTokenExpireTime time.Duration `yaml:"access_token_expire_time"`
}

// Service provides high-level WeChat functionality with caching
type Service struct {
	client          *WeChatAPIClient
	retryableClient *RetryableWeChatClient
	redisClient     *redis.Client
	config          *Config
	logger          *zap.Logger
}

// NewService creates a new WeChat service with Redis caching
func NewService(config *Config, redisClient *redis.Client, logger *zap.Logger) *Service {
	client := NewWeChatAPIClient(config.AppID, config.AppSecret, logger)
	retryableClient := NewRetryableWeChatClient(client, DefaultRetryConfig(), logger)

	return &Service{
		client:          client,
		retryableClient: retryableClient,
		redisClient:     redisClient,
		config:          config,
		logger:          logger,
	}
}

// GetAccessToken gets access token with Redis caching
func (s *Service) GetAccessToken(ctx context.Context) (string, error) {
	if !s.config.CacheAccessToken {
		return s.client.GetAccessToken(ctx)
	}

	// Try to get from cache first
	cacheKey := s.config.AccessTokenCacheKey
	if cacheKey == "" {
		cacheKey = "wechat:access_token"
	}

	cachedToken, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err == nil && cachedToken != "" {
		s.logger.Debug("Using cached WeChat access token")
		return cachedToken, nil
	}

	// Get new token from WeChat API
	token, err := s.client.GetAccessToken(ctx)
	if err != nil {
		return "", err
	}

	// Cache the token
	expireTime := s.config.AccessTokenExpireTime
	if expireTime == 0 {
		expireTime = 7000 * time.Second // Default 7000 seconds (with buffer)
	}

	err = s.redisClient.Set(ctx, cacheKey, token, expireTime).Err()
	if err != nil {
		s.logger.Warn("Failed to cache access token", zap.Error(err))
	}

	return token, nil
}

// CreateDraft creates a WeChat draft
func (s *Service) CreateDraft(ctx context.Context, articles []DraftArticle) (string, error) {
	return s.retryableClient.CreateDraft(ctx, articles)
}

// PublishDraft publishes a WeChat draft
func (s *Service) PublishDraft(ctx context.Context, mediaID string) (string, string, error) {
	return s.retryableClient.PublishDraft(ctx, mediaID)
}

// DeleteDraft deletes a WeChat draft
func (s *Service) DeleteDraft(ctx context.Context, mediaID string) error {
	return s.retryableClient.DeleteDraft(ctx, mediaID)
}

// UploadMaterial uploads material to WeChat
func (s *Service) UploadMaterial(ctx context.Context, filePath string) (*MaterialUploadResponse, error) {
	return s.retryableClient.UploadMaterial(ctx, filePath)
}

// SendTextMessage sends a text message
func (s *Service) SendTextMessage(ctx context.Context, openID, content string) error {
	return s.retryableClient.SendTextMessage(ctx, openID, content)
}

// SendTemplateMessage sends a template message
func (s *Service) SendTemplateMessage(ctx context.Context, templateMsg *TemplateMessage) error {
	return s.retryableClient.SendTemplateMessage(ctx, templateMsg)
}

// GetUserList gets WeChat user list
func (s *Service) GetUserList(ctx context.Context, nextOpenID string) (*UserListResponse, error) {
	return s.retryableClient.GetUserList(ctx, nextOpenID)
}

// ClearAccessTokenCache clears the cached access token
func (s *Service) ClearAccessTokenCache(ctx context.Context) error {
	cacheKey := s.config.AccessTokenCacheKey
	if cacheKey == "" {
		cacheKey = "wechat:access_token"
	}

	return s.redisClient.Del(ctx, cacheKey).Err()
}

// HealthCheck performs a health check on WeChat API
func (s *Service) HealthCheck(ctx context.Context) error {
	_, err := s.GetAccessToken(ctx)
	return err
}

// CachedTokenInfo represents cached token information
type CachedTokenInfo struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CachedAt  time.Time `json:"cached_at"`
}

// GetTokenInfo returns information about the current access token
func (s *Service) GetTokenInfo(ctx context.Context) (*CachedTokenInfo, error) {
	cacheKey := s.config.AccessTokenCacheKey
	if cacheKey == "" {
		cacheKey = "wechat:access_token"
	}

	// Get token from cache
	cachedToken, err := s.redisClient.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, fmt.Errorf("no cached token found: %w", err)
	}

	// Get TTL
	ttl, err := s.redisClient.TTL(ctx, cacheKey).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get token TTL: %w", err)
	}

	return &CachedTokenInfo{
		Token:     cachedToken,
		ExpiresAt: time.Now().Add(ttl),
		CachedAt:  time.Now(),
	}, nil
}

// RefreshAccessToken forces a refresh of the access token
func (s *Service) RefreshAccessToken(ctx context.Context) (string, error) {
	// Clear cache first
	err := s.ClearAccessTokenCache(ctx)
	if err != nil {
		s.logger.Warn("Failed to clear access token cache", zap.Error(err))
	}

	// Get new token
	return s.GetAccessToken(ctx)
}
