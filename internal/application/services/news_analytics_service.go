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

// NewsAnalyticsService handles analytics for news publications
type NewsAnalyticsService struct {
	newsRepo         repositories.NewsRepository
	hitRepo          repositories.HitRepository
	analyticsService services.AnalyticsService
	logger           *zap.Logger
	config           *NewsAnalyticsConfig
}

// NewsAnalyticsConfig holds configuration for news analytics
type NewsAnalyticsConfig struct {
	EnableRealTimeTracking   bool
	EnableEngagementTracking bool
	EnableWeChatTracking     bool
	EnableGeolocation        bool
	RetentionDays            int
	SampleRate               float64
}

// DefaultNewsAnalyticsConfig returns default configuration
func DefaultNewsAnalyticsConfig() *NewsAnalyticsConfig {
	return &NewsAnalyticsConfig{
		EnableRealTimeTracking:   true,
		EnableEngagementTracking: true,
		EnableWeChatTracking:     true,
		EnableGeolocation:        true,
		RetentionDays:            365,
		SampleRate:               1.0,
	}
}

// NewNewsAnalyticsService creates a new news analytics service
func NewNewsAnalyticsService(
	newsRepo repositories.NewsRepository,
	hitRepo repositories.HitRepository,
	analyticsService services.AnalyticsService,
	logger *zap.Logger,
	config *NewsAnalyticsConfig,
) *NewsAnalyticsService {
	if config == nil {
		config = DefaultNewsAnalyticsConfig()
	}

	return &NewsAnalyticsService{
		newsRepo:         newsRepo,
		hitRepo:          hitRepo,
		analyticsService: analyticsService,
		logger:           logger,
		config:           config,
	}
}

// NewsViewTrackingData represents data for tracking news views
type NewsViewTrackingData struct {
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId"`
	IPAddress     string     `json:"ipAddress"`
	UserAgent     string     `json:"userAgent"`
	Referrer      string     `json:"referrer,omitempty"`
	PromotionCode string     `json:"promotionCode,omitempty"`
	Country       string     `json:"country,omitempty"`
	City          string     `json:"city,omitempty"`
	DeviceType    string     `json:"deviceType,omitempty"`
	Platform      string     `json:"platform,omitempty"`
	Browser       string     `json:"browser,omitempty"`
	WeChatOpenID  string     `json:"wechatOpenId,omitempty"`
	WeChatUnionID string     `json:"wechatUnionId,omitempty"`

	// News-specific tracking
	ArticleID   *uuid.UUID `json:"articleId,omitempty"`   // Which article within the news was viewed
	ViewSource  string     `json:"viewSource,omitempty"`  // "web", "wechat", "app", etc.
	ViewContext string     `json:"viewContext,omitempty"` // "list", "detail", "share", etc.
}

// NewsReadTrackingData represents data for tracking news reading completion
type NewsReadTrackingData struct {
	NewsViewTrackingData
	ReadDuration   int     `json:"readDuration"`   // Time spent reading in seconds
	ReadPercentage float64 `json:"readPercentage"` // Percentage of content read
	ScrollDepth    float64 `json:"scrollDepth"`    // Maximum scroll depth percentage
	ArticlesRead   int     `json:"articlesRead"`   // Number of articles read within the news
}

// NewsShareTrackingData represents data for tracking news sharing
type NewsShareTrackingData struct {
	NewsViewTrackingData
	SharePlatform string `json:"sharePlatform"` // "wechat", "weibo", "qq", etc.
	ShareType     string `json:"shareType"`     // "link", "image", "qr", etc.
}

// NewsEngagementTrackingData represents data for tracking news engagement
type NewsEngagementTrackingData struct {
	NewsViewTrackingData
	EngagementType  string `json:"engagementType"`            // "like", "comment", "bookmark", etc.
	EngagementValue string `json:"engagementValue,omitempty"` // Additional data for the engagement
}

// NewsOverallStats represents overall statistics for a news publication
type NewsOverallStats struct {
	TotalViews        int64      `json:"totalViews"`
	TotalReads        int64      `json:"totalReads"`
	TotalShares       int64      `json:"totalShares"`
	TotalEngagements  int64      `json:"totalEngagements"`
	UniqueVisitors    int64      `json:"uniqueVisitors"`
	ReturnVisitors    int64      `json:"returnVisitors"`
	BounceRate        float64    `json:"bounceRate"`
	AvgReadTime       int        `json:"avgReadTime"`       // Average read time in seconds
	AvgReadPercentage float64    `json:"avgReadPercentage"` // Average read completion percentage
	EngagementRate    float64    `json:"engagementRate"`    // Engagement rate percentage
	PublishedAt       *time.Time `json:"publishedAt,omitempty"`
	LastViewedAt      *time.Time `json:"lastViewedAt,omitempty"`
}

// NewsDailyStats represents daily statistics for a news publication
type NewsDailyStats struct {
	Date              time.Time `json:"date"`
	Views             int64     `json:"views"`
	Reads             int64     `json:"reads"`
	Shares            int64     `json:"shares"`
	Engagements       int64     `json:"engagements"`
	UniqueVisitors    int64     `json:"uniqueVisitors"`
	AvgReadTime       int       `json:"avgReadTime"`
	AvgReadPercentage float64   `json:"avgReadPercentage"`
}

// NewsGeographicData represents geographic analytics
type NewsGeographicData struct {
	TopCountries []CountryStats `json:"topCountries"`
	TopCities    []CityStats    `json:"topCities"`
}

// NewsDeviceData represents device and platform analytics
type NewsDeviceData struct {
	DeviceTypes map[string]int64 `json:"deviceTypes"`
	Platforms   map[string]int64 `json:"platforms"`
	Browsers    map[string]int64 `json:"browsers"`
}

// NewsReferrerData represents referrer analytics
type NewsReferrerData struct {
	TopReferrers     []ReferrerStats `json:"topReferrers"`
	DirectTraffic    int64           `json:"directTraffic"`
	SearchTraffic    int64           `json:"searchTraffic"`
	SocialTraffic    int64           `json:"socialTraffic"`
	PromotionTraffic int64           `json:"promotionTraffic"`
}

// NewsEngagementData represents engagement analytics
type NewsEngagementData struct {
	LikeCount         int64              `json:"likeCount"`
	CommentCount      int64              `json:"commentCount"`
	BookmarkCount     int64              `json:"bookmarkCount"`
	EngagementsByType map[string]int64   `json:"engagementsByType"`
	EngagementTrend   []*EngagementTrend `json:"engagementTrend"`
}

// NewsWeChatData represents WeChat-specific analytics
type NewsWeChatData struct {
	WeChatViews      int64   `json:"wechatViews"`
	WeChatShares     int64   `json:"wechatShares"`
	WeChatReads      int64   `json:"wechatReads"`
	UniqueOpenIDs    int64   `json:"uniqueOpenIds"`
	UniqueUnionIDs   int64   `json:"uniqueUnionIds"`
	WeChatEngagement float64 `json:"wechatEngagement"`
}

// NewsArticleStats represents statistics for individual articles within news
type NewsArticleStats struct {
	ArticleID        uuid.UUID `json:"articleId"`
	ArticleTitle     string    `json:"articleTitle"`
	Views            int64     `json:"views"`
	Reads            int64     `json:"reads"`
	ReadPercentage   float64   `json:"readPercentage"`
	AvgReadTime      int       `json:"avgReadTime"`
	Position         int       `json:"position"`         // Position within the news
	ClickThroughRate float64   `json:"clickThroughRate"` // CTR from news to article
}

// DetailedNewsAnalyticsResponse represents comprehensive news analytics
type DetailedNewsAnalyticsResponse struct {
	NewsID         uuid.UUID           `json:"newsId"`
	Title          string              `json:"title"`
	OverallStats   *NewsOverallStats   `json:"overallStats"`
	DailyStats     []*NewsDailyStats   `json:"dailyStats"`
	GeographicData *NewsGeographicData `json:"geographicData"`
	DeviceData     *NewsDeviceData     `json:"deviceData"`
	ReferrerData   *NewsReferrerData   `json:"referrerData"`
	EngagementData *NewsEngagementData `json:"engagementData"`
	WeChatData     *NewsWeChatData     `json:"wechatData,omitempty"`
	ArticleStats   []*NewsArticleStats `json:"articleStats"`
	LastUpdated    time.Time           `json:"lastUpdated"`
}

// Supporting types

type EngagementTrend struct {
	Date  time.Time `json:"date"`
	Count int64     `json:"count"`
	Type  string    `json:"type"`
}

// TrackNewsView tracks when a news publication is viewed
func (s *NewsAnalyticsService) TrackNewsView(ctx context.Context, newsID uuid.UUID, data *NewsViewTrackingData) error {
	if !s.config.EnableRealTimeTracking {
		return nil
	}

	s.logger.Debug("Tracking news view",
		zap.String("newsId", newsID.String()),
		zap.String("sessionId", data.SessionID),
		zap.String("viewSource", data.ViewSource))

	// Track the view using the general analytics service
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

	err := s.analyticsService.TrackView(ctx, newsID, "news", viewData)
	if err != nil {
		s.logger.Error("Failed to track news view", zap.Error(err))
		return err
	}

	// Update news view count asynchronously
	go s.updateNewsViewCount(newsID)

	return nil
}

// TrackNewsRead tracks when a news publication is read
func (s *NewsAnalyticsService) TrackNewsRead(ctx context.Context, newsID uuid.UUID, data *NewsReadTrackingData) error {
	if !s.config.EnableEngagementTracking {
		return nil
	}

	s.logger.Debug("Tracking news read",
		zap.String("newsId", newsID.String()),
		zap.Float64("readPercentage", data.ReadPercentage),
		zap.Int("readDuration", data.ReadDuration))

	// Track the read using the general analytics service
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

	return s.analyticsService.TrackRead(ctx, newsID, "news", readData)
}

// TrackNewsShare tracks when a news publication is shared
func (s *NewsAnalyticsService) TrackNewsShare(ctx context.Context, newsID uuid.UUID, data *NewsShareTrackingData) error {
	s.logger.Debug("Tracking news share",
		zap.String("newsId", newsID.String()),
		zap.String("sharePlatform", data.SharePlatform))

	// Track the share using the general analytics service
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
		SharePlatform: data.SharePlatform,
		ShareMethod:   data.ShareType,
	}

	err := s.analyticsService.TrackShare(ctx, newsID, "news", shareData)
	if err != nil {
		s.logger.Error("Failed to track news share", zap.Error(err))
		return err
	}

	// Update news share count asynchronously
	go s.updateNewsShareCount(newsID)

	return nil
}

// TrackNewsEngagement tracks engagement events for news
func (s *NewsAnalyticsService) TrackNewsEngagement(ctx context.Context, newsID uuid.UUID, data *NewsEngagementTrackingData) error {
	if !s.config.EnableEngagementTracking {
		return nil
	}

	s.logger.Debug("Tracking news engagement",
		zap.String("newsId", newsID.String()),
		zap.String("engagementType", data.EngagementType))

	// Create a custom hit for engagement tracking
	hit := &entities.Hit{
		ResourceId:    newsID,
		ResourceType:  "news",
		UserId:        data.UserID,
		SessionId:     data.SessionID,
		HitType:       entities.HitTypeClick, // Use click type for engagements
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
		// Note: engagement type and value could be stored in a separate table if needed
	}

	err := s.analyticsService.TrackHit(ctx, hit)
	if err != nil {
		s.logger.Error("Failed to track news engagement", zap.Error(err))
		return err
	}

	// Update engagement counts asynchronously
	go s.updateNewsEngagementCount(newsID, data.EngagementType)

	return nil
}

// GetNewsAnalytics retrieves comprehensive analytics for a news publication
func (s *NewsAnalyticsService) GetNewsAnalytics(ctx context.Context, newsID uuid.UUID, days int) (*DetailedNewsAnalyticsResponse, error) {
	s.logger.Debug("Getting news analytics",
		zap.String("newsId", newsID.String()),
		zap.Int("days", days))

	// Get news details
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	// Get hit analytics
	startDate := time.Now().AddDate(0, 0, -days)
	endDate := time.Now()
	filter := &repositories.HitAnalyticsFilter{
		ResourceId:   &newsID,
		ResourceType: "news",
		StartDate:    &startDate,
		EndDate:      &endDate,
	}

	hitAnalytics, err := s.analyticsService.GetHitAnalytics(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get hit analytics: %w", err)
	}

	// Get daily stats
	dailyStats, err := s.analyticsService.GetDailyStats(ctx, newsID, "news", days)
	if err != nil {
		s.logger.Warn("Failed to get daily stats", zap.Error(err))
		dailyStats = []*repositories.DailyHitStats{}
	}

	// Build response
	response := &DetailedNewsAnalyticsResponse{
		NewsID:         newsID,
		Title:          news.Title,
		OverallStats:   s.buildOverallStats(hitAnalytics, news),
		DailyStats:     s.buildDailyStats(dailyStats),
		GeographicData: s.buildGeographicData(hitAnalytics),
		DeviceData:     s.buildDeviceData(hitAnalytics),
		ReferrerData:   s.buildReferrerData(hitAnalytics),
		EngagementData: s.buildEngagementData(ctx, newsID),
		LastUpdated:    time.Now(),
	}

	// Add WeChat data if enabled
	if s.config.EnableWeChatTracking {
		response.WeChatData = s.buildWeChatData(hitAnalytics)
	}

	// Add article stats
	response.ArticleStats = s.buildArticleStats(ctx, newsID)

	return response, nil
}

// GetNewsOverallStats retrieves overall statistics for a news publication
func (s *NewsAnalyticsService) GetNewsOverallStats(ctx context.Context, newsID uuid.UUID) (*NewsOverallStats, error) {
	// Get news details
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	// Get hit analytics for all time
	filter := &repositories.HitAnalyticsFilter{
		ResourceId:   &newsID,
		ResourceType: "news",
	}

	hitAnalytics, err := s.analyticsService.GetHitAnalytics(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get hit analytics: %w", err)
	}

	return s.buildOverallStats(hitAnalytics, news), nil
}

// GetNewsDailyStats retrieves daily statistics for a news publication
func (s *NewsAnalyticsService) GetNewsDailyStats(ctx context.Context, newsID uuid.UUID, days int) ([]*NewsDailyStats, error) {
	dailyStats, err := s.analyticsService.GetDailyStats(ctx, newsID, "news", days)
	if err != nil {
		return nil, fmt.Errorf("failed to get daily stats: %w", err)
	}

	return s.buildDailyStats(dailyStats), nil
}

// GetNewsEngagementStats retrieves engagement statistics for a news publication
func (s *NewsAnalyticsService) GetNewsEngagementStats(ctx context.Context, newsID uuid.UUID) (*NewsEngagementData, error) {
	return s.buildEngagementData(ctx, newsID), nil
}

// Helper methods

// updateNewsViewCount updates the view count for a news publication
func (s *NewsAnalyticsService) updateNewsViewCount(newsID uuid.UUID) {
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	// This would typically update a counter in the news table
	// For now, we'll just log it
	s.logger.Debug("Updating news view count", zap.String("newsId", newsID.String()))

	// TODO: Implement actual view count update in news repository
	// err := s.newsRepo.IncrementViewCount(ctx, newsID)
	// if err != nil {
	//     s.logger.Error("Failed to update view count", zap.Error(err))
	// }
}

// updateNewsShareCount updates the share count for a news publication
func (s *NewsAnalyticsService) updateNewsShareCount(newsID uuid.UUID) {
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	s.logger.Debug("Updating news share count", zap.String("newsId", newsID.String()))

	// TODO: Implement actual share count update in news repository
	// err := s.newsRepo.IncrementShareCount(ctx, newsID)
	// if err != nil {
	//     s.logger.Error("Failed to update share count", zap.Error(err))
	// }
}

// updateNewsEngagementCount updates engagement counts for a news publication
func (s *NewsAnalyticsService) updateNewsEngagementCount(newsID uuid.UUID, engagementType string) {
	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()

	s.logger.Debug("Updating news engagement count",
		zap.String("newsId", newsID.String()),
		zap.String("engagementType", engagementType))

	// TODO: Implement actual engagement count update in news repository
	// switch engagementType {
	// case "like":
	//     err := s.newsRepo.IncrementLikeCount(ctx, newsID)
	// case "comment":
	//     err := s.newsRepo.IncrementCommentCount(ctx, newsID)
	// }
}

// buildOverallStats builds overall statistics from hit analytics
func (s *NewsAnalyticsService) buildOverallStats(hitAnalytics *repositories.HitAnalytics, news *entities.News) *NewsOverallStats {
	return &NewsOverallStats{
		TotalViews:        hitAnalytics.TotalViews,
		TotalReads:        hitAnalytics.TotalReads,
		TotalShares:       hitAnalytics.TotalShares,
		TotalEngagements:  hitAnalytics.TotalHits, // Using total hits as engagements
		UniqueVisitors:    hitAnalytics.UniqueVisitors,
		ReturnVisitors:    hitAnalytics.ReturnVisitors,
		BounceRate:        hitAnalytics.BounceRate,
		AvgReadTime:       int(hitAnalytics.AvgReadTime),
		AvgReadPercentage: 0.0, // Not available in current HitAnalytics
		EngagementRate:    s.calculateEngagementRate(hitAnalytics),
		PublishedAt:       news.PublishedAt,
		LastViewedAt:      &hitAnalytics.LastActivity,
	}
}

// buildDailyStats builds daily statistics from hit analytics
func (s *NewsAnalyticsService) buildDailyStats(dailyStats []*repositories.DailyHitStats) []*NewsDailyStats {
	result := make([]*NewsDailyStats, len(dailyStats))
	for i, stat := range dailyStats {
		result[i] = &NewsDailyStats{
			Date:              stat.Date,
			Views:             stat.Views,
			Reads:             stat.Reads,
			Shares:            0, // Not available in current DailyHitStats
			Engagements:       0, // Not available in current DailyHitStats
			UniqueVisitors:    stat.UniqueUsers,
			AvgReadTime:       int(stat.AvgReadTime),
			AvgReadPercentage: 0.0, // Not available in current DailyHitStats
		}
	}
	return result
}

// buildGeographicData builds geographic analytics from hit analytics
func (s *NewsAnalyticsService) buildGeographicData(hitAnalytics *repositories.HitAnalytics) *NewsGeographicData {
	return &NewsGeographicData{
		TopCountries: s.convertToCountryStatsFromGeo(hitAnalytics.TopCountries),
		TopCities:    []CityStats{}, // TopCities not available in current HitAnalytics
	}
}

// buildDeviceData builds device analytics from hit analytics
func (s *NewsAnalyticsService) buildDeviceData(hitAnalytics *repositories.HitAnalytics) *NewsDeviceData {
	return &NewsDeviceData{
		DeviceTypes: s.convertToDeviceMap(hitAnalytics.TopDevices),
		Platforms:   make(map[string]int64), // Not available in current HitAnalytics
		Browsers:    s.convertToBrowserMap(hitAnalytics.TopBrowsers),
	}
}

// buildReferrerData builds referrer analytics from hit analytics
func (s *NewsAnalyticsService) buildReferrerData(hitAnalytics *repositories.HitAnalytics) *NewsReferrerData {
	return &NewsReferrerData{
		TopReferrers:     []ReferrerStats{}, // Not available in current HitAnalytics
		DirectTraffic:    0,                 // Not available in current HitAnalytics
		SearchTraffic:    0,                 // Not available in current HitAnalytics
		SocialTraffic:    0,                 // Not available in current HitAnalytics
		PromotionTraffic: 0,                 // Not available in current HitAnalytics
	}
}

// buildEngagementData builds engagement analytics
func (s *NewsAnalyticsService) buildEngagementData(ctx context.Context, newsID uuid.UUID) *NewsEngagementData {
	// This is a simplified implementation
	// In a real implementation, you would query engagement data from the database
	return &NewsEngagementData{
		LikeCount:         0,
		CommentCount:      0,
		BookmarkCount:     0,
		EngagementsByType: make(map[string]int64),
		EngagementTrend:   []*EngagementTrend{},
	}
}

// buildWeChatData builds WeChat-specific analytics
func (s *NewsAnalyticsService) buildWeChatData(hitAnalytics *repositories.HitAnalytics) *NewsWeChatData {
	// Filter WeChat-specific data from hit analytics
	wechatViews := int64(0)
	wechatShares := int64(0)
	wechatReads := int64(0)

	// This would need to be calculated from the actual hit data
	// For now, return default values
	return &NewsWeChatData{
		WeChatViews:      wechatViews,
		WeChatShares:     wechatShares,
		WeChatReads:      wechatReads,
		UniqueOpenIDs:    0,
		UniqueUnionIDs:   0,
		WeChatEngagement: 0.0,
	}
}

// buildArticleStats builds statistics for individual articles within news
func (s *NewsAnalyticsService) buildArticleStats(ctx context.Context, newsID uuid.UUID) []*NewsArticleStats {
	// This is a simplified implementation
	// In a real implementation, you would query article statistics from the database
	return []*NewsArticleStats{}
}

// calculateEngagementRate calculates engagement rate from hit analytics
func (s *NewsAnalyticsService) calculateEngagementRate(hitAnalytics *repositories.HitAnalytics) float64 {
	if hitAnalytics.TotalViews == 0 {
		return 0.0
	}

	totalEngagements := hitAnalytics.TotalShares + hitAnalytics.TotalReads
	return float64(totalEngagements) / float64(hitAnalytics.TotalViews) * 100.0
}

// convertToCountryStats converts repository country stats to service country stats
func (s *NewsAnalyticsService) convertToCountryStats(repoStats []repositories.GeographicStats) []CountryStats {
	result := make([]CountryStats, len(repoStats))
	for i, stat := range repoStats {
		result[i] = CountryStats{
			Country: stat.Country,
			Count:   stat.Count,
		}
	}
	return result
}

// convertToCityStats converts repository city stats to service city stats
func (s *NewsAnalyticsService) convertToCityStats(repoStats []repositories.GeographicStats) []CityStats {
	result := make([]CityStats, len(repoStats))
	for i, stat := range repoStats {
		result[i] = CityStats{
			City:    stat.City,
			Country: stat.Country,
			Count:   stat.Count,
		}
	}
	return result
}

// convertToReferrerStats converts repository referrer stats to service referrer stats
func (s *NewsAnalyticsService) convertToReferrerStats(repoStats []repositories.ReferrerStats) []ReferrerStats {
	result := make([]ReferrerStats, len(repoStats))
	for i, stat := range repoStats {
		result[i] = ReferrerStats{
			Referrer:    stat.Referrer,
			Views:       stat.Count, // Map Count to Views
			Reads:       0,          // Not available in repository stats
			UniqueUsers: 0,          // Not available in repository stats
		}
	}
	return result
}

// convertToCountryStatsFromGeo converts repository geographic stats to service country stats
func (s *NewsAnalyticsService) convertToCountryStatsFromGeo(geoStats []repositories.GeographicStats) []CountryStats {
	result := make([]CountryStats, len(geoStats))
	for i, stat := range geoStats {
		result[i] = CountryStats{
			Country: stat.Country,
			Count:   stat.Count,
		}
	}
	return result
}

// convertToDeviceMap converts repository device stats to a map
func (s *NewsAnalyticsService) convertToDeviceMap(deviceStats []repositories.DeviceStats) map[string]int64 {
	result := make(map[string]int64)
	for _, stat := range deviceStats {
		result[stat.DeviceType] = stat.Count
	}
	return result
}

// convertToBrowserMap converts repository browser stats to a map
func (s *NewsAnalyticsService) convertToBrowserMap(browserStats []repositories.BrowserStats) map[string]int64 {
	result := make(map[string]int64)
	for _, stat := range browserStats {
		result[stat.Browser] = stat.Count
	}
	return result
}
