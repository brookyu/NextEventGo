package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
)

// ArticleAnalyticsService provides comprehensive analytics for articles
type ArticleAnalyticsService struct {
	hitRepo          repositories.HitRepository
	articleRepo      repositories.SiteArticleRepository
	analyticsService services.AnalyticsService
	logger           *zap.Logger
	config           ArticleAnalyticsConfig
}

// ArticleAnalyticsConfig contains configuration for article analytics
type ArticleAnalyticsConfig struct {
	EnableRealTimeTracking   bool
	EnableScrollTracking     bool
	EnableReadTimeTracking   bool
	EnableEngagementTracking bool
	MinReadTimeSeconds       int     // Minimum time to consider as a "read"
	ReadCompletionThreshold  float64 // Percentage threshold for read completion
	BatchSize                int
	CacheExpiryMinutes       int
}

// NewArticleAnalyticsService creates a new article analytics service
func NewArticleAnalyticsService(
	hitRepo repositories.HitRepository,
	articleRepo repositories.SiteArticleRepository,
	analyticsService services.AnalyticsService,
	logger *zap.Logger,
	config ArticleAnalyticsConfig,
) *ArticleAnalyticsService {
	return &ArticleAnalyticsService{
		hitRepo:          hitRepo,
		articleRepo:      articleRepo,
		analyticsService: analyticsService,
		logger:           logger,
		config:           config,
	}
}

// TrackArticleView tracks when an article is viewed
func (s *ArticleAnalyticsService) TrackArticleView(ctx context.Context, articleID uuid.UUID, data *ArticleViewTrackingData) error {
	s.logger.Debug("Tracking article view",
		zap.String("articleId", articleID.String()),
		zap.String("sessionId", data.SessionID))

	viewData := &services.ViewTrackingData{
		UserId:        data.UserID,
		SessionId:     data.SessionID,
		IPAddress:     data.IPAddress,
		UserAgent:     data.UserAgent,
		Referrer:      data.Referrer,
		PromotionCode: data.PromotionCode,
		Country:       data.Country,
		City:          data.City,
		DeviceType:    data.DeviceType,
		Platform:      data.Platform,
		Browser:       data.Browser,
		WeChatOpenId:  data.WeChatOpenID,
		WeChatUnionId: data.WeChatUnionID,
	}

	err := s.analyticsService.TrackView(ctx, articleID, "article", viewData)
	if err != nil {
		return fmt.Errorf("failed to track article view: %w", err)
	}

	// Update article view count asynchronously
	go s.updateArticleViewCount(articleID)

	return nil
}

// TrackArticleRead tracks when an article is read (with duration and completion)
func (s *ArticleAnalyticsService) TrackArticleRead(ctx context.Context, articleID uuid.UUID, data *ArticleReadTrackingData) error {
	s.logger.Debug("Tracking article read",
		zap.String("articleId", articleID.String()),
		zap.Int("duration", data.ReadDuration),
		zap.Float64("percentage", data.ReadPercentage))

	// Only track if minimum read time is met
	if data.ReadDuration < s.config.MinReadTimeSeconds {
		s.logger.Debug("Read duration below threshold, skipping track",
			zap.Int("duration", data.ReadDuration),
			zap.Int("threshold", s.config.MinReadTimeSeconds))
		return nil
	}

	readData := &services.ReadTrackingData{
		ViewTrackingData: &services.ViewTrackingData{
			UserId:        data.UserID,
			SessionId:     data.SessionID,
			IPAddress:     data.IPAddress,
			UserAgent:     data.UserAgent,
			Referrer:      data.Referrer,
			PromotionCode: data.PromotionCode,
			Country:       data.Country,
			City:          data.City,
			DeviceType:    data.DeviceType,
			Platform:      data.Platform,
			Browser:       data.Browser,
			WeChatOpenId:  data.WeChatOpenID,
			WeChatUnionId: data.WeChatUnionID,
		},
		ReadDuration:   data.ReadDuration,
		ReadPercentage: data.ReadPercentage,
		ScrollDepth:    data.ScrollDepth,
	}

	err := s.analyticsService.TrackRead(ctx, articleID, "article", readData)
	if err != nil {
		return fmt.Errorf("failed to track article read: %w", err)
	}

	// Update article read count if completion threshold is met
	if data.ReadPercentage >= s.config.ReadCompletionThreshold {
		go s.updateArticleReadCount(articleID)
	}

	return nil
}

// TrackArticleShare tracks when an article is shared
func (s *ArticleAnalyticsService) TrackArticleShare(ctx context.Context, articleID uuid.UUID, data *ArticleShareTrackingData) error {
	s.logger.Debug("Tracking article share",
		zap.String("articleId", articleID.String()),
		zap.String("platform", data.Platform))

	shareData := &services.ShareTrackingData{
		ViewTrackingData: &services.ViewTrackingData{
			UserId:        data.UserID,
			SessionId:     data.SessionID,
			IPAddress:     data.IPAddress,
			UserAgent:     data.UserAgent,
			Referrer:      data.Referrer,
			PromotionCode: data.PromotionCode,
			Country:       data.Country,
			City:          data.City,
			DeviceType:    data.DeviceType,
			Platform:      data.Platform,
			Browser:       data.Browser,
			WeChatOpenId:  data.WeChatOpenID,
			WeChatUnionId: data.WeChatUnionID,
		},
		SharePlatform: data.Platform,
		ShareMethod:   data.Method,
	}

	err := s.analyticsService.TrackShare(ctx, articleID, "article", shareData)
	if err != nil {
		return fmt.Errorf("failed to track article share: %w", err)
	}

	// Update article share count asynchronously
	go s.updateArticleShareCount(articleID)

	return nil
}

// GetArticleAnalytics retrieves comprehensive analytics for an article
func (s *ArticleAnalyticsService) GetArticleAnalytics(ctx context.Context, articleID uuid.UUID, days int) (*ArticleAnalyticsReport, error) {
	s.logger.Debug("Getting article analytics",
		zap.String("articleId", articleID.String()),
		zap.Int("days", days))

	// Get article details
	article, err := s.articleRepo.GetByID(ctx, articleID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Get hit analytics
	filter := &repositories.HitAnalyticsFilter{
		ResourceId:   &articleID,
		ResourceType: "article",
		Days:         days,
	}

	hitAnalytics, err := s.analyticsService.GetHitAnalytics(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get hit analytics: %w", err)
	}

	// Get daily stats
	dailyStats, err := s.analyticsService.GetDailyStats(ctx, articleID, "article", days)
	if err != nil {
		return nil, fmt.Errorf("failed to get daily stats: %w", err)
	}

	// Get reading analytics
	readingAnalytics, err := s.analyticsService.GetReadingAnalytics(ctx, articleID, days)
	if err != nil {
		return nil, fmt.Errorf("failed to get reading analytics: %w", err)
	}

	// Get geographic stats
	geoStats, err := s.analyticsService.GetGeographicStats(ctx, articleID, "article", days)
	if err != nil {
		return nil, fmt.Errorf("failed to get geographic stats: %w", err)
	}

	// Get device stats
	deviceStats, err := s.analyticsService.GetDeviceStats(ctx, articleID, "article", days)
	if err != nil {
		return nil, fmt.Errorf("failed to get device stats: %w", err)
	}

	// Build comprehensive report
	report := &ArticleAnalyticsReport{
		ArticleID:         articleID,
		ArticleTitle:      article.Title,
		ArticleAuthor:     article.Author,
		GeneratedAt:       time.Now(),
		TimeRange:         days,
		OverallStats:      s.buildOverallStats(hitAnalytics, article),
		ReadingAnalytics:  s.buildReadingAnalytics(readingAnalytics),
		DailyStats:        s.convertDailyStats(dailyStats),
		GeographicStats:   s.convertGeographicStats(geoStats),
		DeviceStats:       s.convertDeviceStats(deviceStats),
		EngagementMetrics: s.calculateEngagementMetrics(hitAnalytics, readingAnalytics),
	}

	return report, nil
}

// GetTopPerformingArticles retrieves top performing articles by various metrics
func (s *ArticleAnalyticsService) GetTopPerformingArticles(ctx context.Context, metric string, limit int, days int) ([]*ArticlePerformanceData, error) {
	var articles []*entities.SiteArticle
	var err error

	switch metric {
	case "views":
		articles, err = s.articleRepo.GetMostViewed(ctx, limit, days)
	case "reads":
		articles, err = s.articleRepo.GetMostRead(ctx, limit, days)
	case "engagement":
		articles, err = s.getTopEngagementArticles(ctx, limit, days)
	default:
		return nil, fmt.Errorf("unsupported metric: %s", metric)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get top articles: %w", err)
	}

	// Build performance data for each article
	var performanceData []*ArticlePerformanceData
	for _, article := range articles {
		analytics, err := s.GetArticleAnalytics(ctx, article.ID, days)
		if err != nil {
			s.logger.Warn("Failed to get analytics for article",
				zap.String("articleId", article.ID.String()),
				zap.Error(err))
			continue
		}

		performanceData = append(performanceData, &ArticlePerformanceData{
			Article:         article,
			ViewCount:       analytics.OverallStats.TotalViews,
			ReadCount:       analytics.OverallStats.TotalReads,
			ShareCount:      analytics.OverallStats.TotalShares,
			EngagementScore: analytics.EngagementMetrics.OverallScore,
			ReadingRate:     analytics.ReadingAnalytics.CompletionRate,
			AverageReadTime: analytics.ReadingAnalytics.AverageReadTime,
		})
	}

	return performanceData, nil
}

// Helper methods

func (s *ArticleAnalyticsService) updateArticleViewCount(articleID uuid.UUID) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := s.articleRepo.UpdateViewCount(ctx, articleID)
	if err != nil {
		s.logger.Error("Failed to update article view count",
			zap.String("articleId", articleID.String()),
			zap.Error(err))
	}
}

func (s *ArticleAnalyticsService) updateArticleReadCount(articleID uuid.UUID) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := s.articleRepo.UpdateReadCount(ctx, articleID)
	if err != nil {
		s.logger.Error("Failed to update article read count",
			zap.String("articleId", articleID.String()),
			zap.Error(err))
	}
}

func (s *ArticleAnalyticsService) updateArticleShareCount(articleID uuid.UUID) {
	// Note: This would need to be implemented in the repository
	s.logger.Debug("Share count update requested",
		zap.String("articleId", articleID.String()))
}

func (s *ArticleAnalyticsService) buildOverallStats(hitAnalytics *repositories.HitAnalytics, article *entities.SiteArticle) *ArticleOverallStats {
	return &ArticleOverallStats{
		TotalViews:     hitAnalytics.TotalViews,
		TotalReads:     hitAnalytics.TotalReads,
		TotalShares:    hitAnalytics.TotalShares,
		UniqueVisitors: hitAnalytics.UniqueVisitors,
		ReturnVisitors: hitAnalytics.ReturnVisitors,
		BounceRate:     hitAnalytics.BounceRate,
		PublishedAt:    article.PublishedAt,
		LastViewedAt:   &hitAnalytics.LastActivity,
	}
}

func (s *ArticleAnalyticsService) buildReadingAnalytics(readingAnalytics *repositories.ReadingAnalytics) *ArticleReadingAnalytics {
	// Convert ReadTimeDistribution slice to map
	readTimeDistMap := make(map[string]int)
	for _, point := range readingAnalytics.ReadTimeDistribution {
		readTimeDistMap[point.TimeRange] = int(point.Count)
	}

	return &ArticleReadingAnalytics{
		AverageReadTime:      readingAnalytics.AverageReadTime,
		MedianReadTime:       readingAnalytics.MedianReadTime,
		CompletionRate:       readingAnalytics.CompletionRate,
		AverageScrollDepth:   readingAnalytics.AverageScrollDepth,
		ReadTimeDistribution: readTimeDistMap,
	}
}

func (s *ArticleAnalyticsService) convertDailyStats(dailyStats []*repositories.DailyHitStats) []*ArticleDailyStats {
	var converted []*ArticleDailyStats
	for _, stat := range dailyStats {
		converted = append(converted, &ArticleDailyStats{
			Date:        stat.Date,
			Views:       stat.Views,
			Reads:       stat.Reads,
			Shares:      0, // DailyHitStats doesn't have Shares field, default to 0
			UniqueUsers: stat.UniqueUsers,
		})
	}
	return converted
}

func (s *ArticleAnalyticsService) convertGeographicStats(geoStats []*repositories.GeographicStats) []*ArticleGeographicStats {
	var converted []*ArticleGeographicStats
	for _, stat := range geoStats {
		converted = append(converted, &ArticleGeographicStats{
			Country:     stat.Country,
			City:        stat.City,
			Views:       stat.Count, // GeographicStats only has Count field
			Reads:       0,          // Not available in GeographicStats, default to 0
			UniqueUsers: 0,          // Not available in GeographicStats, default to 0
		})
	}
	return converted
}

func (s *ArticleAnalyticsService) convertDeviceStats(deviceStats []*repositories.DeviceStats) []*ArticleDeviceStats {
	var converted []*ArticleDeviceStats
	for _, stat := range deviceStats {
		converted = append(converted, &ArticleDeviceStats{
			DeviceType:  stat.DeviceType,
			Browser:     "", // DeviceStats doesn't have Browser field, default to empty
			Platform:    stat.Platform,
			Views:       stat.Count, // DeviceStats only has Count field
			Reads:       0,          // Not available in DeviceStats, default to 0
			UniqueUsers: 0,          // Not available in DeviceStats, default to 0
		})
	}
	return converted
}

func (s *ArticleAnalyticsService) calculateEngagementMetrics(hitAnalytics *repositories.HitAnalytics, readingAnalytics *repositories.ReadingAnalytics) *ArticleEngagementMetrics {
	// Calculate overall engagement score
	overallScore := (readingAnalytics.CompletionRate * 0.4) +
		(hitAnalytics.ReturnVisitorRate * 0.3) +
		((1.0 - hitAnalytics.BounceRate) * 0.3)

	return &ArticleEngagementMetrics{
		OverallScore:      overallScore,
		ReadingEngagement: readingAnalytics.CompletionRate,
		SocialEngagement:  float64(hitAnalytics.TotalShares) / float64(hitAnalytics.TotalViews) * 100,
		ReturnRate:        hitAnalytics.ReturnVisitorRate,
		TimeOnPage:        readingAnalytics.AverageReadTime,
	}
}

func (s *ArticleAnalyticsService) getTopEngagementArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	// This would need custom repository method to sort by engagement score
	// For now, fall back to most read articles
	return s.articleRepo.GetMostRead(ctx, limit, days)
}
