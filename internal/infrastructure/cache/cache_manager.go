package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// CacheManager provides high-level caching operations for different entity types
type CacheManager struct {
	cache  CacheInterface
	logger *zap.Logger
	config CacheManagerConfig
}

// CacheManagerConfig holds cache manager configuration
type CacheManagerConfig struct {
	// TTL settings for different entity types
	ImageTTL         time.Duration
	ArticleTTL       time.Duration
	NewsTTL          time.Duration
	VideoTTL         time.Duration
	CategoryTTL      time.Duration
	SessionTTL       time.Duration
	AnalyticsTTL     time.Duration
	
	// List cache settings
	ListTTL          time.Duration
	MaxListSize      int
	
	// Feature flags
	EnableImageCache    bool
	EnableArticleCache  bool
	EnableNewsCache     bool
	EnableVideoCache    bool
	EnableListCache     bool
	EnableAnalyticsCache bool
	
	// Cache warming
	EnableCacheWarming  bool
	WarmupInterval      time.Duration
}

// DefaultCacheManagerConfig returns default cache manager configuration
func DefaultCacheManagerConfig() CacheManagerConfig {
	return CacheManagerConfig{
		ImageTTL:         2 * time.Hour,
		ArticleTTL:       1 * time.Hour,
		NewsTTL:          30 * time.Minute,
		VideoTTL:         1 * time.Hour,
		CategoryTTL:      4 * time.Hour,
		SessionTTL:       15 * time.Minute,
		AnalyticsTTL:     5 * time.Minute,
		ListTTL:          10 * time.Minute,
		MaxListSize:      1000,
		EnableImageCache: true,
		EnableArticleCache: true,
		EnableNewsCache: true,
		EnableVideoCache: true,
		EnableListCache: true,
		EnableAnalyticsCache: true,
		EnableCacheWarming: true,
		WarmupInterval: 1 * time.Hour,
	}
}

// NewCacheManager creates a new cache manager
func NewCacheManager(cache CacheInterface, logger *zap.Logger, config CacheManagerConfig) *CacheManager {
	return &CacheManager{
		cache:  cache,
		logger: logger,
		config: config,
	}
}

// Image caching methods

func (cm *CacheManager) GetImage(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error) {
	if !cm.config.EnableImageCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildImageKey(id)
	var image entities.SiteImage
	
	if err := cm.cache.Get(ctx, key, &image); err != nil {
		return nil, err
	}
	
	return &image, nil
}

func (cm *CacheManager) SetImage(ctx context.Context, image *entities.SiteImage) error {
	if !cm.config.EnableImageCache {
		return nil
	}

	key := cm.buildImageKey(image.ID)
	return cm.cache.Set(ctx, key, image, cm.config.ImageTTL)
}

func (cm *CacheManager) DeleteImage(ctx context.Context, id uuid.UUID) error {
	if !cm.config.EnableImageCache {
		return nil
	}

	key := cm.buildImageKey(id)
	return cm.cache.Delete(ctx, key)
}

// Article caching methods

func (cm *CacheManager) GetArticle(ctx context.Context, id uuid.UUID) (*entities.SiteArticle, error) {
	if !cm.config.EnableArticleCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildArticleKey(id)
	var article entities.SiteArticle
	
	if err := cm.cache.Get(ctx, key, &article); err != nil {
		return nil, err
	}
	
	return &article, nil
}

func (cm *CacheManager) GetArticleBySlug(ctx context.Context, slug string) (*entities.SiteArticle, error) {
	if !cm.config.EnableArticleCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildArticleSlugKey(slug)
	var article entities.SiteArticle
	
	if err := cm.cache.Get(ctx, key, &article); err != nil {
		return nil, err
	}
	
	return &article, nil
}

func (cm *CacheManager) SetArticle(ctx context.Context, article *entities.SiteArticle) error {
	if !cm.config.EnableArticleCache {
		return nil
	}

	// Cache by ID
	idKey := cm.buildArticleKey(article.ID)
	if err := cm.cache.Set(ctx, idKey, article, cm.config.ArticleTTL); err != nil {
		return err
	}

	// Cache by slug if available
	if article.Slug != "" {
		slugKey := cm.buildArticleSlugKey(article.Slug)
		if err := cm.cache.Set(ctx, slugKey, article, cm.config.ArticleTTL); err != nil {
			cm.logger.Warn("Failed to cache article by slug", 
				zap.String("slug", article.Slug), 
				zap.Error(err))
		}
	}

	return nil
}

func (cm *CacheManager) DeleteArticle(ctx context.Context, id uuid.UUID, slug string) error {
	if !cm.config.EnableArticleCache {
		return nil
	}

	// Delete by ID
	idKey := cm.buildArticleKey(id)
	if err := cm.cache.Delete(ctx, idKey); err != nil {
		cm.logger.Error("Failed to delete article cache by ID", 
			zap.String("id", id.String()), 
			zap.Error(err))
	}

	// Delete by slug if available
	if slug != "" {
		slugKey := cm.buildArticleSlugKey(slug)
		if err := cm.cache.Delete(ctx, slugKey); err != nil {
			cm.logger.Warn("Failed to delete article cache by slug", 
				zap.String("slug", slug), 
				zap.Error(err))
		}
	}

	return nil
}

// News caching methods

func (cm *CacheManager) GetNews(ctx context.Context, id uuid.UUID) (*entities.News, error) {
	if !cm.config.EnableNewsCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildNewsKey(id)
	var news entities.News
	
	if err := cm.cache.Get(ctx, key, &news); err != nil {
		return nil, err
	}
	
	return &news, nil
}

func (cm *CacheManager) SetNews(ctx context.Context, news *entities.News) error {
	if !cm.config.EnableNewsCache {
		return nil
	}

	key := cm.buildNewsKey(news.ID)
	return cm.cache.Set(ctx, key, news, cm.config.NewsTTL)
}

func (cm *CacheManager) DeleteNews(ctx context.Context, id uuid.UUID) error {
	if !cm.config.EnableNewsCache {
		return nil
	}

	key := cm.buildNewsKey(id)
	return cm.cache.Delete(ctx, key)
}

func (cm *CacheManager) InvalidateNewsCache(ctx context.Context) error {
	if !cm.config.EnableNewsCache {
		return nil
	}

	pattern := "news:*"
	return cm.cache.DeletePattern(ctx, pattern)
}

// Video caching methods

func (cm *CacheManager) GetVideo(ctx context.Context, id uuid.UUID) (*entities.Video, error) {
	if !cm.config.EnableVideoCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildVideoKey(id)
	var video entities.Video
	
	if err := cm.cache.Get(ctx, key, &video); err != nil {
		return nil, err
	}
	
	return &video, nil
}

func (cm *CacheManager) SetVideo(ctx context.Context, video *entities.Video) error {
	if !cm.config.EnableVideoCache {
		return nil
	}

	key := cm.buildVideoKey(video.ID)
	return cm.cache.Set(ctx, key, video, cm.config.VideoTTL)
}

func (cm *CacheManager) DeleteVideo(ctx context.Context, id uuid.UUID) error {
	if !cm.config.EnableVideoCache {
		return nil
	}

	key := cm.buildVideoKey(id)
	return cm.cache.Delete(ctx, key)
}

// List caching methods

func (cm *CacheManager) GetList(ctx context.Context, listType, key string) (interface{}, error) {
	if !cm.config.EnableListCache {
		return nil, ErrCacheMiss
	}

	cacheKey := cm.buildListKey(listType, key)
	var result interface{}
	
	if err := cm.cache.Get(ctx, cacheKey, &result); err != nil {
		return nil, err
	}
	
	return result, nil
}

func (cm *CacheManager) SetList(ctx context.Context, listType, key string, data interface{}) error {
	if !cm.config.EnableListCache {
		return nil
	}

	cacheKey := cm.buildListKey(listType, key)
	return cm.cache.Set(ctx, cacheKey, data, cm.config.ListTTL)
}

func (cm *CacheManager) DeleteList(ctx context.Context, listType, key string) error {
	if !cm.config.EnableListCache {
		return nil
	}

	cacheKey := cm.buildListKey(listType, key)
	return cm.cache.Delete(ctx, cacheKey)
}

func (cm *CacheManager) InvalidateListCache(ctx context.Context, listType string) error {
	if !cm.config.EnableListCache {
		return nil
	}

	pattern := fmt.Sprintf("list:%s:*", listType)
	return cm.cache.DeletePattern(ctx, pattern)
}

// Analytics caching methods

func (cm *CacheManager) GetAnalytics(ctx context.Context, entityType string, id uuid.UUID) (interface{}, error) {
	if !cm.config.EnableAnalyticsCache {
		return nil, ErrCacheMiss
	}

	key := cm.buildAnalyticsKey(entityType, id)
	var result interface{}
	
	if err := cm.cache.Get(ctx, key, &result); err != nil {
		return nil, err
	}
	
	return result, nil
}

func (cm *CacheManager) SetAnalytics(ctx context.Context, entityType string, id uuid.UUID, data interface{}) error {
	if !cm.config.EnableAnalyticsCache {
		return nil
	}

	key := cm.buildAnalyticsKey(entityType, id)
	return cm.cache.Set(ctx, key, data, cm.config.AnalyticsTTL)
}

func (cm *CacheManager) DeleteAnalytics(ctx context.Context, entityType string, id uuid.UUID) error {
	if !cm.config.EnableAnalyticsCache {
		return nil
	}

	key := cm.buildAnalyticsKey(entityType, id)
	return cm.cache.Delete(ctx, key)
}

// Session caching methods

func (cm *CacheManager) GetSession(ctx context.Context, sessionID string) (*entities.VideoSession, error) {
	key := cm.buildSessionKey(sessionID)
	var session entities.VideoSession
	
	if err := cm.cache.Get(ctx, key, &session); err != nil {
		return nil, err
	}
	
	return &session, nil
}

func (cm *CacheManager) SetSession(ctx context.Context, session *entities.VideoSession) error {
	key := cm.buildSessionKey(session.SessionID)
	return cm.cache.Set(ctx, key, session, cm.config.SessionTTL)
}

func (cm *CacheManager) DeleteSession(ctx context.Context, sessionID string) error {
	key := cm.buildSessionKey(sessionID)
	return cm.cache.Delete(ctx, key)
}

// Utility methods

func (cm *CacheManager) InvalidateAll(ctx context.Context) error {
	return cm.cache.FlushAll(ctx)
}

func (cm *CacheManager) GetStats(ctx context.Context) (map[string]interface{}, error) {
	if statsProvider, ok := cm.cache.(*RedisCache); ok {
		return statsProvider.GetStats(ctx)
	}
	return nil, fmt.Errorf("cache stats not supported")
}

// Key building methods

func (cm *CacheManager) buildImageKey(id uuid.UUID) string {
	return fmt.Sprintf("image:%s", id.String())
}

func (cm *CacheManager) buildArticleKey(id uuid.UUID) string {
	return fmt.Sprintf("article:%s", id.String())
}

func (cm *CacheManager) buildArticleSlugKey(slug string) string {
	return fmt.Sprintf("article:slug:%s", slug)
}

func (cm *CacheManager) buildNewsKey(id uuid.UUID) string {
	return fmt.Sprintf("news:%s", id.String())
}

func (cm *CacheManager) buildVideoKey(id uuid.UUID) string {
	return fmt.Sprintf("video:%s", id.String())
}

func (cm *CacheManager) buildListKey(listType, key string) string {
	return fmt.Sprintf("list:%s:%s", listType, key)
}

func (cm *CacheManager) buildAnalyticsKey(entityType string, id uuid.UUID) string {
	return fmt.Sprintf("analytics:%s:%s", entityType, id.String())
}

func (cm *CacheManager) buildSessionKey(sessionID string) string {
	return fmt.Sprintf("session:%s", sessionID)
}

// Cache warming methods

func (cm *CacheManager) WarmupCache(ctx context.Context) error {
	if !cm.config.EnableCacheWarming {
		return nil
	}

	cm.logger.Info("Starting cache warmup")

	// Implement cache warming logic here
	// This would typically involve pre-loading frequently accessed data

	cm.logger.Info("Cache warmup completed")
	return nil
}

// Health check

func (cm *CacheManager) HealthCheck(ctx context.Context) error {
	// Test basic cache operations
	testKey := "health:check"
	testValue := map[string]interface{}{
		"timestamp": time.Now(),
		"test":      true,
	}

	// Test set
	if err := cm.cache.Set(ctx, testKey, testValue, 1*time.Minute); err != nil {
		return fmt.Errorf("cache set failed: %w", err)
	}

	// Test get
	var retrieved map[string]interface{}
	if err := cm.cache.Get(ctx, testKey, &retrieved); err != nil {
		return fmt.Errorf("cache get failed: %w", err)
	}

	// Test delete
	if err := cm.cache.Delete(ctx, testKey); err != nil {
		return fmt.Errorf("cache delete failed: %w", err)
	}

	return nil
}
