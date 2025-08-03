package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// AnalyticsServiceImpl implements the AnalyticsService interface
type AnalyticsServiceImpl struct {
	hitRepo repositories.HitRepository
	logger  *zap.Logger
	db      *gorm.DB
	config  *AnalyticsServiceConfig
}

// AnalyticsServiceConfig holds configuration for the analytics service
type AnalyticsServiceConfig struct {
	EnableRealTimeTracking bool
	BatchSize              int
	RetentionDays          int
	EnableGeolocation      bool
	EnableDeviceDetection  bool
	SampleRate             float64 // 0.0 to 1.0, for sampling high-traffic sites
}

// NewAnalyticsService creates a new analytics service implementation
func NewAnalyticsService(
	hitRepo repositories.HitRepository,
	logger *zap.Logger,
	db *gorm.DB,
	config *AnalyticsServiceConfig,
) services.AnalyticsService {
	return &AnalyticsServiceImpl{
		hitRepo: hitRepo,
		logger:  logger,
		db:      db,
		config:  config,
	}
}

// TrackHit tracks a generic hit
func (s *AnalyticsServiceImpl) TrackHit(ctx context.Context, hit *entities.Hit) error {
	// Apply sampling if configured
	if s.config.SampleRate < 1.0 {
		// Simple sampling logic - in production, use proper sampling
		if time.Now().UnixNano()%100 >= int64(s.config.SampleRate*100) {
			return nil // Skip this hit due to sampling
		}
	}

	// Enhance hit data if services are enabled
	if s.config.EnableGeolocation {
		s.enhanceWithGeolocation(hit)
	}

	if s.config.EnableDeviceDetection {
		s.enhanceWithDeviceInfo(hit)
	}

	s.logger.Debug("Tracking hit",
		zap.String("resourceId", hit.ResourceId.String()),
		zap.String("resourceType", hit.ResourceType),
		zap.String("hitType", string(hit.HitType)))

	return s.hitRepo.Create(ctx, hit)
}

// TrackView tracks a view event
func (s *AnalyticsServiceImpl) TrackView(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *services.ViewTrackingData) error {
	hit := &entities.Hit{
		ResourceId:    resourceId,
		ResourceType:  resourceType,
		UserId:        trackingData.UserId,
		SessionId:     trackingData.SessionId,
		HitType:       entities.HitTypeView,
		IPAddress:     trackingData.IPAddress,
		UserAgent:     trackingData.UserAgent,
		Referrer:      trackingData.Referrer,
		PromotionCode: trackingData.PromotionCode,
		Country:       trackingData.Country,
		City:          trackingData.City,
		DeviceType:    trackingData.DeviceType,
		Platform:      trackingData.Platform,
		Browser:       trackingData.Browser,
		WeChatOpenId:  trackingData.WeChatOpenId,
		WeChatUnionId: trackingData.WeChatUnionId,
	}

	return s.TrackHit(ctx, hit)
}

// TrackRead tracks a read completion event
func (s *AnalyticsServiceImpl) TrackRead(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *services.ReadTrackingData) error {
	hit := &entities.Hit{
		ResourceId:     resourceId,
		ResourceType:   resourceType,
		UserId:         trackingData.UserId,
		SessionId:      trackingData.SessionId,
		HitType:        entities.HitTypeRead,
		IPAddress:      trackingData.IPAddress,
		UserAgent:      trackingData.UserAgent,
		Referrer:       trackingData.Referrer,
		PromotionCode:  trackingData.PromotionCode,
		ReadDuration:   trackingData.ReadDuration,
		ReadPercentage: trackingData.ReadPercentage,
		ScrollDepth:    trackingData.ScrollDepth,
		Country:        trackingData.Country,
		City:           trackingData.City,
		DeviceType:     trackingData.DeviceType,
		Platform:       trackingData.Platform,
		Browser:        trackingData.Browser,
		WeChatOpenId:   trackingData.WeChatOpenId,
		WeChatUnionId:  trackingData.WeChatUnionId,
	}

	return s.TrackHit(ctx, hit)
}

// TrackClick tracks a click event
func (s *AnalyticsServiceImpl) TrackClick(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *services.ClickTrackingData) error {
	hit := &entities.Hit{
		ResourceId:    resourceId,
		ResourceType:  resourceType,
		UserId:        trackingData.UserId,
		SessionId:     trackingData.SessionId,
		HitType:       entities.HitTypeClick,
		IPAddress:     trackingData.IPAddress,
		UserAgent:     trackingData.UserAgent,
		Referrer:      trackingData.Referrer,
		PromotionCode: trackingData.PromotionCode,
		Country:       trackingData.Country,
		City:          trackingData.City,
		DeviceType:    trackingData.DeviceType,
		Platform:      trackingData.Platform,
		Browser:       trackingData.Browser,
		WeChatOpenId:  trackingData.WeChatOpenId,
		WeChatUnionId: trackingData.WeChatUnionId,
	}

	return s.TrackHit(ctx, hit)
}

// TrackShare tracks a share event
func (s *AnalyticsServiceImpl) TrackShare(ctx context.Context, resourceId uuid.UUID, resourceType string, trackingData *services.ShareTrackingData) error {
	hit := &entities.Hit{
		ResourceId:    resourceId,
		ResourceType:  resourceType,
		UserId:        trackingData.UserId,
		SessionId:     trackingData.SessionId,
		HitType:       entities.HitTypeShare,
		IPAddress:     trackingData.IPAddress,
		UserAgent:     trackingData.UserAgent,
		Referrer:      trackingData.Referrer,
		PromotionCode: trackingData.PromotionCode,
		Country:       trackingData.Country,
		City:          trackingData.City,
		DeviceType:    trackingData.DeviceType,
		Platform:      trackingData.Platform,
		Browser:       trackingData.Browser,
		WeChatOpenId:  trackingData.WeChatOpenId,
		WeChatUnionId: trackingData.WeChatUnionId,
	}

	return s.TrackHit(ctx, hit)
}

// GetHitAnalytics retrieves comprehensive analytics
func (s *AnalyticsServiceImpl) GetHitAnalytics(ctx context.Context, filter *repositories.HitAnalyticsFilter) (*repositories.HitAnalytics, error) {
	return s.hitRepo.GetAnalytics(ctx, filter)
}

// GetDailyStats retrieves daily statistics
func (s *AnalyticsServiceImpl) GetDailyStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DailyHitStats, error) {
	return s.hitRepo.GetDailyStats(ctx, resourceId, resourceType, days)
}

// GetUserEngagement retrieves user engagement statistics
func (s *AnalyticsServiceImpl) GetUserEngagement(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.UserEngagementStats, error) {
	return s.hitRepo.GetUserEngagement(ctx, resourceId, resourceType, days)
}

// GetReadingAnalytics retrieves reading behavior analytics
func (s *AnalyticsServiceImpl) GetReadingAnalytics(ctx context.Context, resourceId uuid.UUID, days int) (*repositories.ReadingAnalytics, error) {
	return s.hitRepo.GetReadingAnalytics(ctx, resourceId, days)
}

// GetGeographicStats retrieves geographic statistics
func (s *AnalyticsServiceImpl) GetGeographicStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.GeographicStats, error) {
	return s.hitRepo.GetGeographicStats(ctx, resourceId, resourceType, days)
}

// GetDeviceStats retrieves device statistics
func (s *AnalyticsServiceImpl) GetDeviceStats(ctx context.Context, resourceId uuid.UUID, resourceType string, days int) ([]*repositories.DeviceStats, error) {
	return s.hitRepo.GetDeviceStats(ctx, resourceId, resourceType, days)
}

// GetPromotionAnalytics retrieves promotion analytics
func (s *AnalyticsServiceImpl) GetPromotionAnalytics(ctx context.Context, promotionCode string, days int) (*repositories.PromotionAnalytics, error) {
	return s.hitRepo.GetPromotionStats(ctx, promotionCode, days)
}

// GetTopPromotions retrieves top performing promotions
func (s *AnalyticsServiceImpl) GetTopPromotions(ctx context.Context, limit int, days int) ([]*repositories.PromotionStats, error) {
	return s.hitRepo.GetTopPromotions(ctx, limit, days)
}

// Helper methods for data enhancement

func (s *AnalyticsServiceImpl) enhanceWithGeolocation(hit *entities.Hit) {
	// In a real implementation, this would use a geolocation service
	// to resolve IP address to country/city
	if hit.IPAddress != "" && hit.Country == "" {
		// Placeholder implementation
		hit.Country = "Unknown"
		hit.City = "Unknown"

		// Example: Use a geolocation service
		// location := s.geoService.GetLocation(hit.IPAddress)
		// hit.Country = location.Country
		// hit.City = location.City
	}
}

func (s *AnalyticsServiceImpl) enhanceWithDeviceInfo(hit *entities.Hit) {
	// In a real implementation, this would parse the User-Agent
	// to extract device, platform, and browser information
	if hit.UserAgent != "" {
		// Simple device detection based on User-Agent
		userAgent := hit.UserAgent

		// Detect device type
		if hit.DeviceType == "" {
			if s.containsAny(userAgent, []string{"Mobile", "Android", "iPhone"}) {
				hit.DeviceType = "mobile"
			} else if s.containsAny(userAgent, []string{"Tablet", "iPad"}) {
				hit.DeviceType = "tablet"
			} else {
				hit.DeviceType = "desktop"
			}
		}

		// Detect platform
		if hit.Platform == "" {
			if s.containsAny(userAgent, []string{"Windows"}) {
				hit.Platform = "Windows"
			} else if s.containsAny(userAgent, []string{"Mac", "macOS"}) {
				hit.Platform = "macOS"
			} else if s.containsAny(userAgent, []string{"Linux"}) {
				hit.Platform = "Linux"
			} else if s.containsAny(userAgent, []string{"Android"}) {
				hit.Platform = "Android"
			} else if s.containsAny(userAgent, []string{"iOS", "iPhone", "iPad"}) {
				hit.Platform = "iOS"
			}
		}

		// Detect browser
		if hit.Browser == "" {
			if s.containsAny(userAgent, []string{"Chrome"}) {
				hit.Browser = "Chrome"
			} else if s.containsAny(userAgent, []string{"Firefox"}) {
				hit.Browser = "Firefox"
			} else if s.containsAny(userAgent, []string{"Safari"}) {
				hit.Browser = "Safari"
			} else if s.containsAny(userAgent, []string{"Edge"}) {
				hit.Browser = "Edge"
			} else if s.containsAny(userAgent, []string{"MicroMessenger"}) {
				hit.Browser = "WeChat"
			}
		}
	}
}

func (s *AnalyticsServiceImpl) containsAny(str string, substrings []string) bool {
	for _, substring := range substrings {
		if strings.Contains(str, substring) {
			return true
		}
	}
	return false
}

// Maintenance methods

// CleanupOldHits removes old hit records based on retention policy
func (s *AnalyticsServiceImpl) CleanupOldHits(ctx context.Context) error {
	if s.config.RetentionDays <= 0 {
		return nil // No cleanup if retention is not configured
	}

	cutoffDate := time.Now().AddDate(0, 0, -s.config.RetentionDays)
	deleted, err := s.hitRepo.DeleteOldHits(ctx, cutoffDate)
	if err != nil {
		return fmt.Errorf("failed to cleanup old hits: %w", err)
	}

	s.logger.Info("Cleaned up old hits", zap.Int64("deleted", deleted), zap.Time("cutoffDate", cutoffDate))
	return nil
}
