package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// VideoManagementService provides high-level video management operations
type VideoManagementService struct {
	videoService     *VideoService
	sessionService   *VideoSessionService
	streamingService *CloudStreamingService
	categoryService  *VideoCategoryService

	// Direct repository access for complex operations
	videoRepo    repositories.VideoRepository
	sessionRepo  repositories.VideoSessionRepository
	categoryRepo repositories.VideoCategoryRepository
	imageRepo    repositories.SiteImageRepository
	articleRepo  repositories.SiteArticleRepository
	eventRepo    repositories.SiteEventRepository

	logger *zap.Logger
	config VideoManagementConfig
}

// VideoManagementConfig contains configuration for the management service
type VideoManagementConfig struct {
	// Video limits
	MaxVideosPerUser int
	MaxTitleLength   int
	MaxSummaryLength int
	MaxDuration      int // in seconds
	MinDuration      int // in seconds

	// Content validation
	RequireThumbnail   bool
	RequireDescription bool
	RequireCategories  bool

	// Feature flags
	EnableCloudStreaming  bool
	EnableAnalytics       bool
	EnableSessionTracking bool
	EnableBulkOperations  bool
	AutoGenerateSlug      bool

	// Auto-features
	AutoStartScheduled  bool
	AutoStopExpired     bool
	AutoCleanupSessions bool
	AutoUpdateAnalytics bool

	// Performance
	EnableCaching          bool
	CacheTimeout           time.Duration
	MaxConcurrentStreams   int
	SessionCleanupInterval time.Duration
}

// DefaultVideoManagementConfig returns default configuration
func DefaultVideoManagementConfig() *VideoManagementConfig {
	return &VideoManagementConfig{
		MaxVideosPerUser:       100,
		MaxTitleLength:         500,
		MaxSummaryLength:       2000,
		MaxDuration:            14400, // 4 hours
		MinDuration:            30,    // 30 seconds
		RequireThumbnail:       false,
		RequireDescription:     true,
		RequireCategories:      false,
		EnableCloudStreaming:   true,
		EnableAnalytics:        true,
		EnableSessionTracking:  true,
		EnableBulkOperations:   true,
		AutoGenerateSlug:       true,
		AutoStartScheduled:     true,
		AutoStopExpired:        true,
		AutoCleanupSessions:    true,
		AutoUpdateAnalytics:    true,
		EnableCaching:          true,
		CacheTimeout:           10 * time.Minute,
		MaxConcurrentStreams:   1000,
		SessionCleanupInterval: 1 * time.Hour,
	}
}

// NewVideoManagementService creates a new video management service
func NewVideoManagementService(
	videoRepo repositories.VideoRepository,
	sessionRepo repositories.VideoSessionRepository,
	categoryRepo repositories.VideoCategoryRepository,
	imageRepo repositories.SiteImageRepository,
	articleRepo repositories.SiteArticleRepository,
	eventRepo repositories.SiteEventRepository,
	logger *zap.Logger,
	config *VideoManagementConfig,
) *VideoManagementService {
	if config == nil {
		config = DefaultVideoManagementConfig()
	}

	// Create service configurations
	videoServiceConfig := DefaultVideoServiceConfig()
	videoServiceConfig.MaxTitleLength = config.MaxTitleLength
	videoServiceConfig.MaxSummaryLength = config.MaxSummaryLength
	videoServiceConfig.MaxDuration = config.MaxDuration
	videoServiceConfig.MinDuration = config.MinDuration
	videoServiceConfig.EnableAnalytics = config.EnableAnalytics
	videoServiceConfig.EnableSessionTracking = config.EnableSessionTracking
	videoServiceConfig.AutoGenerateSlug = config.AutoGenerateSlug

	sessionServiceConfig := DefaultVideoSessionServiceConfig()
	sessionServiceConfig.EnableAnalytics = config.EnableAnalytics
	sessionServiceConfig.CleanupInterval = config.SessionCleanupInterval

	streamingServiceConfig := DefaultCloudStreamingConfig()
	streamingServiceConfig.MaxConcurrentStreams = config.MaxConcurrentStreams
	streamingServiceConfig.EnableAnalytics = config.EnableAnalytics

	// Initialize services
	videoService := NewVideoService(
		videoRepo, sessionRepo, categoryRepo, imageRepo, articleRepo, eventRepo,
		logger, videoServiceConfig,
	)

	sessionService := NewVideoSessionService(
		sessionRepo, videoRepo, logger, sessionServiceConfig,
	)

	streamingService := NewCloudStreamingService(
		videoRepo, sessionRepo, logger, streamingServiceConfig,
	)

	categoryService := NewVideoCategoryService(
		categoryRepo, videoRepo, logger,
	)

	return &VideoManagementService{
		videoService:     videoService,
		sessionService:   sessionService,
		streamingService: streamingService,
		categoryService:  categoryService,
		videoRepo:        videoRepo,
		sessionRepo:      sessionRepo,
		categoryRepo:     categoryRepo,
		imageRepo:        imageRepo,
		articleRepo:      articleRepo,
		eventRepo:        eventRepo,
		logger:           logger,
		config:           *config,
	}
}

// CreateVideo creates a new video with comprehensive validation and setup
func (s *VideoManagementService) CreateVideo(ctx context.Context, req VideoCreateRequest, userID uuid.UUID) (*VideoResponse, error) {
	// Enhanced validation
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Check user limits
	if err := s.checkUserLimits(ctx, userID); err != nil {
		return nil, fmt.Errorf("user limits exceeded: %w", err)
	}

	// Create video using base service
	video, err := s.videoService.CreateVideo(ctx, req, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to create video: %w", err)
	}

	// Auto-create live stream if it's a live video and cloud streaming is enabled
	if s.config.EnableCloudStreaming && video.VideoType == entities.VideoTypeLive {
		go s.createLiveStreamAsync(ctx, video.ID, req)
	}

	// Convert to response
	return s.convertToVideoResponse(video), nil
}

// GetVideo retrieves a video with enhanced data
func (s *VideoManagementService) GetVideo(ctx context.Context, id uuid.UUID, userID *uuid.UUID, includeAnalytics bool) (*VideoResponse, error) {
	video, err := s.videoService.GetVideo(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	response := s.convertToVideoResponse(video)

	// Include analytics if requested and enabled
	if includeAnalytics && s.config.EnableAnalytics {
		analytics, err := s.getVideoAnalytics(ctx, id)
		if err != nil {
			s.logger.Warn("Failed to get analytics", zap.Error(err))
		} else {
			response.Analytics = analytics
		}
	}

	return response, nil
}

// UpdateVideo updates an existing video with comprehensive validation
func (s *VideoManagementService) UpdateVideo(ctx context.Context, id uuid.UUID, req VideoUpdateRequest, userID uuid.UUID) (*VideoResponse, error) {
	// Enhanced validation
	if err := s.validateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Update using base service
	video, err := s.videoService.UpdateVideo(ctx, id, req, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to update video: %w", err)
	}

	return s.convertToVideoResponse(video), nil
}

// DeleteVideo deletes a video with cleanup
func (s *VideoManagementService) DeleteVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get video first to check if it's a live stream
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Stop live stream if it's active
	if video.VideoType == entities.VideoTypeLive && video.Status == entities.VideoStatusLive {
		if err := s.streamingService.StopLiveStream(ctx, id); err != nil {
			s.logger.Warn("Failed to stop live stream before deletion", zap.Error(err))
		}
	}

	// Delete video using base service
	if err := s.videoService.DeleteVideo(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to delete video: %w", err)
	}

	// Cleanup sessions asynchronously
	if s.config.AutoCleanupSessions {
		go s.cleanupVideoSessions(ctx, id)
	}

	return nil
}

// ListVideos retrieves videos with enhanced filtering and analytics
func (s *VideoManagementService) ListVideos(ctx context.Context, req VideoListRequest, userID *uuid.UUID) (*VideoListResponse, error) {
	// Convert request to filter
	filter := s.convertToVideoFilter(req, userID)

	// Get videos list
	videos, total, err := s.videoService.ListVideos(ctx, filter, userID)
	if err != nil {
		return nil, err
	}

	// Convert to responses
	videoResponses := make([]VideoResponse, len(videos))
	for i, video := range videos {
		videoResponses[i] = *s.convertToVideoResponse(video)

		// Include basic analytics if enabled
		if s.config.EnableAnalytics && req.IncludeAnalytics {
			if analytics, err := s.getVideoAnalytics(ctx, video.ID); err == nil {
				videoResponses[i].Analytics = analytics
			}
		}
	}

	// Calculate pages
	pages := int(total) / req.Limit
	if int(total)%req.Limit > 0 {
		pages++
	}

	return &VideoListResponse{
		Videos: videoResponses,
		Total:  total,
		Page:   req.Page,
		Limit:  req.Limit,
		Pages:  pages,
	}, nil
}

// StartLiveVideo starts a live video stream
func (s *VideoManagementService) StartLiveVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*VideoStreamStatusResponse, error) {
	// Start video using base service
	if err := s.videoService.StartLiveVideo(ctx, id, userID); err != nil {
		return nil, fmt.Errorf("failed to start video: %w", err)
	}

	// Start cloud stream if enabled
	if s.config.EnableCloudStreaming {
		if err := s.streamingService.StartLiveStream(ctx, id); err != nil {
			s.logger.Error("Failed to start cloud stream", zap.Error(err))
			// Don't fail the entire operation, just log the error
		}
	}

	// Get stream status
	status, err := s.streamingService.GetStreamStatus(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get stream status: %w", err)
	}

	return &VideoStreamStatusResponse{
		VideoID:     id,
		StreamKey:   status.StreamKey,
		Status:      status.Status,
		ViewerCount: status.ViewerCount,
		StartTime:   status.StartTime,
	}, nil
}

// StopLiveVideo stops a live video stream
func (s *VideoManagementService) StopLiveVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Stop cloud stream if enabled
	if s.config.EnableCloudStreaming {
		if err := s.streamingService.StopLiveStream(ctx, id); err != nil {
			s.logger.Error("Failed to stop cloud stream", zap.Error(err))
		}
	}

	// Stop video using base service
	if err := s.videoService.EndLiveVideo(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to stop video: %w", err)
	}

	return nil
}

// GetStreamStatus gets the status of a live stream
func (s *VideoManagementService) GetStreamStatus(ctx context.Context, id uuid.UUID, userID *uuid.UUID) (*StreamStatusResponse, error) {
	// Check video access
	if _, err := s.videoService.GetVideo(ctx, id, userID); err != nil {
		return nil, err
	}

	// Get stream status
	return s.streamingService.GetStreamStatus(ctx, id)
}

// StartVideoSession starts a video watching session
func (s *VideoManagementService) StartVideoSession(ctx context.Context, req VideoSessionStartRequest) (*VideoSessionResponse, error) {
	// Check video access
	if _, err := s.videoService.GetVideo(ctx, req.VideoID, req.UserID); err != nil {
		return nil, err
	}

	// Start session
	session, err := s.sessionService.StartSession(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to start session: %w", err)
	}

	return s.convertToSessionResponse(session), nil
}

// UpdateVideoSession updates a video watching session
func (s *VideoManagementService) UpdateVideoSession(ctx context.Context, sessionID uuid.UUID, req VideoSessionUpdateRequest) (*VideoSessionResponse, error) {
	session, err := s.sessionService.UpdateSession(ctx, sessionID, req)
	if err != nil {
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	return s.convertToSessionResponse(session), nil
}

// EndVideoSession ends a video watching session
func (s *VideoManagementService) EndVideoSession(ctx context.Context, sessionID uuid.UUID, req VideoSessionEndRequest) error {
	return s.sessionService.EndSession(ctx, sessionID, req)
}

// GetVideoAnalytics retrieves comprehensive analytics for a video
func (s *VideoManagementService) GetVideoAnalytics(ctx context.Context, videoID uuid.UUID, userID *uuid.UUID) (*VideoAnalyticsResponse, error) {
	// Check video access
	if _, err := s.videoService.GetVideo(ctx, videoID, userID); err != nil {
		return nil, err
	}

	return s.getVideoAnalytics(ctx, videoID)
}

// BulkOperations performs bulk operations on multiple videos
func (s *VideoManagementService) BulkOperations(ctx context.Context, req VideoBulkOperationRequest, userID uuid.UUID) (*VideoBulkOperationResponse, error) {
	if !s.config.EnableBulkOperations {
		return nil, fmt.Errorf("bulk operations are disabled")
	}

	response := &VideoBulkOperationResponse{
		Success:   true,
		Processed: 0,
		Failed:    0,
		Errors:    []string{},
	}

	for _, videoID := range req.VideoIDs {
		var err error

		switch req.Action {
		case "start":
			_, err = s.StartLiveVideo(ctx, videoID, userID)
		case "stop":
			err = s.StopLiveVideo(ctx, videoID, userID)
		case "delete":
			err = s.DeleteVideo(ctx, videoID, userID)
		default:
			err = fmt.Errorf("unknown action: %s", req.Action)
		}

		if err != nil {
			response.Failed++
			response.Errors = append(response.Errors, fmt.Sprintf("Video %s: %s", videoID, err.Error()))
			response.Success = false
		} else {
			response.Processed++
		}
	}

	response.Message = fmt.Sprintf("Processed %d/%d videos", response.Processed, len(req.VideoIDs))

	return response, nil
}

// Helper methods

func (s *VideoManagementService) validateCreateRequest(req VideoCreateRequest) error {
	if len(req.Title) == 0 || len(req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title must be between 1 and %d characters", s.config.MaxTitleLength)
	}

	if s.config.RequireDescription && len(req.Summary) == 0 {
		return fmt.Errorf("description is required")
	}

	if len(req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary must be less than %d characters", s.config.MaxSummaryLength)
	}

	if req.Duration != nil {
		if *req.Duration < s.config.MinDuration || *req.Duration > s.config.MaxDuration {
			return fmt.Errorf("duration must be between %d and %d seconds", s.config.MinDuration, s.config.MaxDuration)
		}
	}

	if s.config.RequireThumbnail && req.ThumbnailID == nil {
		return fmt.Errorf("thumbnail is required")
	}

	return nil
}

func (s *VideoManagementService) validateUpdateRequest(req VideoUpdateRequest) error {
	if req.Title != nil && (len(*req.Title) == 0 || len(*req.Title) > s.config.MaxTitleLength) {
		return fmt.Errorf("title must be between 1 and %d characters", s.config.MaxTitleLength)
	}

	if req.Summary != nil && len(*req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary must be less than %d characters", s.config.MaxSummaryLength)
	}

	if req.Duration != nil && (*req.Duration < s.config.MinDuration || *req.Duration > s.config.MaxDuration) {
		return fmt.Errorf("duration must be between %d and %d seconds", s.config.MinDuration, s.config.MaxDuration)
	}

	return nil
}

func (s *VideoManagementService) checkUserLimits(ctx context.Context, userID uuid.UUID) error {
	if s.config.MaxVideosPerUser <= 0 {
		return nil // No limit
	}

	filter := repositories.VideoFilter{
		UserID: &userID,
		Limit:  s.config.MaxVideosPerUser + 1,
	}

	videos, err := s.videoRepo.List(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to check user video count: %w", err)
	}

	if len(videos) >= s.config.MaxVideosPerUser {
		return fmt.Errorf("user has reached maximum video limit of %d", s.config.MaxVideosPerUser)
	}

	return nil
}

// Async helper methods

func (s *VideoManagementService) createLiveStreamAsync(ctx context.Context, videoID uuid.UUID, req VideoCreateRequest) {
	streamReq := CreateLiveStreamRequest{
		VideoID:           videoID,
		Quality:           req.Quality,
		EnableRecording:   true,
		EnableTranscoding: true,
	}

	if req.Bitrate != nil {
		streamReq.Bitrate = *req.Bitrate
	}
	if req.FrameRate != 0 {
		streamReq.FrameRate = req.FrameRate
	}
	if req.Resolution != "" {
		streamReq.Resolution = req.Resolution
	}

	if _, err := s.streamingService.CreateLiveStream(ctx, streamReq); err != nil {
		s.logger.Error("Failed to create live stream",
			zap.String("videoID", videoID.String()),
			zap.Error(err))
	}
}

func (s *VideoManagementService) cleanupVideoSessions(ctx context.Context, videoID uuid.UUID) {
	activeStatus := entities.VideoSessionStatusActive
	filter := repositories.VideoSessionFilter{
		VideoID: &videoID,
		Status:  &activeStatus,
	}

	sessions, err := s.sessionRepo.GetSessionsByVideo(ctx, videoID, filter)
	if err != nil {
		s.logger.Error("Failed to get video sessions for cleanup", zap.Error(err))
		return
	}

	for _, session := range sessions {
		session.MarkAbandoned()
		if err := s.sessionRepo.Update(ctx, session); err != nil {
			s.logger.Error("Failed to update session during cleanup", zap.Error(err))
		}
	}
}

func (s *VideoManagementService) getVideoAnalytics(ctx context.Context, videoID uuid.UUID) (*VideoAnalyticsResponse, error) {
	stats, err := s.sessionService.GetVideoAnalytics(ctx, videoID)
	if err != nil {
		return nil, err
	}

	return &VideoAnalyticsResponse{
		VideoID:              videoID,
		TotalSessions:        stats.TotalSessions,
		CompletedSessions:    stats.CompletedSessions,
		AbandonedSessions:    stats.AbandonedSessions,
		AverageWatchTime:     stats.AverageWatchTime,
		AverageCompletion:    stats.AverageCompletion,
		AverageEngagement:    stats.AverageEngagement,
		TotalWatchTime:       stats.TotalWatchTime,
		UniqueViewers:        stats.UniqueViewers,
		ReturnViewers:        stats.ReturnViewers,
		CompletionRate:       stats.CompletionRate,
		AbandonmentRate:      stats.AbandonmentRate,
		AverageSessionLength: stats.AverageSessionLength,
		LastUpdated:          time.Now(),
	}, nil
}

func (s *VideoManagementService) convertToVideoFilter(req VideoListRequest, userID *uuid.UUID) repositories.VideoFilter {
	filter := repositories.VideoFilter{
		Limit:  req.Limit,
		Offset: (req.Page - 1) * req.Limit,
	}

	// Apply filters
	if req.Status != nil {
		filter.Status = req.Status
	}
	if req.Type != nil {
		filter.Type = req.Type
	}
	if req.Quality != nil {
		filter.Quality = req.Quality
	}
	if req.CategoryID != nil {
		filter.CategoryID = req.CategoryID
	}
	if req.UserID != nil {
		filter.UserID = req.UserID
	}
	if req.EventID != nil {
		filter.EventID = req.EventID
	}

	// Search filters
	filter.Search = req.Search
	filter.Tags = req.Tags
	filter.Keywords = req.Keywords

	// Date filters
	filter.CreatedAfter = req.CreatedAfter
	filter.CreatedBefore = req.CreatedBefore
	filter.StartTimeAfter = req.StartTimeAfter
	filter.StartTimeBefore = req.StartTimeBefore

	// Boolean filters
	filter.IsOpen = req.IsOpen
	filter.RequireAuth = req.RequireAuth
	filter.SupportInteraction = req.SupportInteraction
	filter.AllowDownload = req.AllowDownload
	filter.IsLive = req.IsLive

	// Numeric filters
	filter.MinDuration = req.MinDuration
	filter.MaxDuration = req.MaxDuration
	filter.MinViews = req.MinViews
	filter.MaxViews = req.MaxViews

	// Include options
	filter.IncludeCategory = req.IncludeCategory
	filter.IncludeImages = req.IncludeImages
	filter.IncludeArticles = req.IncludeArticles
	filter.IncludeSurvey = req.IncludeSurvey
	filter.IncludeEvent = req.IncludeEvent
	filter.IncludeSessions = req.IncludeSessions

	// Sorting
	if req.SortBy != "" {
		filter.SortBy = req.SortBy
		filter.SortOrder = req.SortOrder
	}

	return filter
}

// Response conversion methods

func (s *VideoManagementService) convertToVideoResponse(video *entities.Video) *VideoResponse {
	return &VideoResponse{
		ID:                 video.ID,
		Title:              video.Title,
		Summary:            video.Summary,
		VideoType:          video.VideoType,
		Status:             video.Status,
		CloudUrl:           video.CloudUrl,
		StreamKey:          video.StreamKey,
		PlaybackUrl:        video.PlaybackUrl,
		Quality:            video.Quality,
		Duration:           video.Duration,
		IsOpen:             video.IsOpen,
		RequireAuth:        video.RequireAuth,
		SupportInteraction: video.SupportInteraction,
		AllowDownload:      video.AllowDownload,
		SiteImageID:        video.SiteImageID,
		PromotionPicID:     video.PromotionPicID,
		ThumbnailID:        video.ThumbnailID,
		IntroArticleID:     video.IntroArticleID,
		NotOpenArticleID:   video.NotOpenArticleID,
		SurveyID:           video.SurveyID,
		UploadID:           video.UploadID,
		BoundEventID:       video.BoundEventID,
		StartTime:          video.StartTime,
		VideoEndTime:       video.VideoEndTime,
		CategoryID:         video.CategoryID,
		ViewCount:          video.ViewCount,
		LikeCount:          video.LikeCount,
		ShareCount:         video.ShareCount,
		CommentCount:       video.CommentCount,
		WatchTime:          video.WatchTime,
		AverageWatchTime:   video.AverageWatchTime,
		CompletionRate:     video.CompletionRate,
		EngagementScore:    video.EngagementScore,
		FileSize:           video.FileSize,
		Resolution:         video.Resolution,
		FrameRate:          video.FrameRate,
		Bitrate:            video.Bitrate,
		Codec:              video.Codec,
		Slug:               video.Slug,
		MetaTitle:          video.MetaTitle,
		MetaDescription:    video.MetaDescription,
		Keywords:           video.Keywords,
		Tags:               video.Tags,
		WeChatMediaID:      video.WeChatMediaID,
		WeChatURL:          video.WeChatURL,
		CreatedAt:          video.CreatedAt,
		UpdatedAt:          video.UpdatedAt,
		CreatedBy:          video.CreatedBy,
		UpdatedBy:          video.UpdatedBy,
	}
}

func (s *VideoManagementService) convertToSessionResponse(session *entities.VideoSession) *VideoSessionResponse {
	return &VideoSessionResponse{
		ID:                   session.ID,
		VideoID:              session.VideoID,
		UserID:               session.UserID,
		SessionID:            session.SessionID,
		Status:               session.Status,
		StartTime:            session.StartTime,
		EndTime:              session.EndTime,
		LastActivity:         session.LastActivity,
		CurrentPosition:      session.CurrentPosition,
		WatchedDuration:      session.WatchedDuration,
		PlaybackSpeed:        session.PlaybackSpeed,
		Quality:              session.Quality,
		CompletionPercentage: session.CompletionPercentage,
		IsCompleted:          session.IsCompleted(),
		CompletedAt:          session.CompletedAt,
		PauseCount:           session.PauseCount,
		SeekCount:            session.SeekCount,
		ReplayCount:          session.ReplayCount,
		VolumeLevel:          session.VolumeLevel,
		DeviceType:           session.DeviceType,
		Browser:              session.Browser,
		OS:                   session.OS,
		Country:              session.Country,
		Region:               session.Region,
		City:                 session.City,
		EngagementScore:      session.EngagementScore,
		AttentionSpan:        session.AttentionSpan,
		CreatedAt:            session.CreatedAt,
		UpdatedAt:            session.UpdatedAt,
	}
}

// Request and response types

// VideoListRequest represents a request to list videos
type VideoListRequest struct {
	Page  int `json:"page" binding:"min=1"`
	Limit int `json:"limit" binding:"min=1,max=100"`

	// Filters
	Status     *entities.VideoStatus  `json:"status"`
	Type       *entities.VideoType    `json:"type"`
	Quality    *entities.VideoQuality `json:"quality"`
	CategoryID *uuid.UUID             `json:"categoryId"`
	UserID     *uuid.UUID             `json:"userId"`
	EventID    *uuid.UUID             `json:"eventId"`

	// Search
	Search   string   `json:"search"`
	Tags     []string `json:"tags"`
	Keywords []string `json:"keywords"`

	// Date filters
	CreatedAfter    *time.Time `json:"createdAfter"`
	CreatedBefore   *time.Time `json:"createdBefore"`
	StartTimeAfter  *time.Time `json:"startTimeAfter"`
	StartTimeBefore *time.Time `json:"startTimeBefore"`

	// Boolean filters
	IsOpen             *bool `json:"isOpen"`
	RequireAuth        *bool `json:"requireAuth"`
	SupportInteraction *bool `json:"supportInteraction"`
	AllowDownload      *bool `json:"allowDownload"`
	IsLive             *bool `json:"isLive"`

	// Numeric filters
	MinDuration *int   `json:"minDuration"`
	MaxDuration *int   `json:"maxDuration"`
	MinViews    *int64 `json:"minViews"`
	MaxViews    *int64 `json:"maxViews"`

	// Include options
	IncludeCategory  bool `json:"includeCategory"`
	IncludeImages    bool `json:"includeImages"`
	IncludeArticles  bool `json:"includeArticles"`
	IncludeSurvey    bool `json:"includeSurvey"`
	IncludeEvent     bool `json:"includeEvent"`
	IncludeSessions  bool `json:"includeSessions"`
	IncludeAnalytics bool `json:"includeAnalytics"`

	// Sorting
	SortBy    string `json:"sortBy"`
	SortOrder string `json:"sortOrder"`
}

// VideoResponse represents a video response
type VideoResponse struct {
	ID                 uuid.UUID             `json:"id"`
	Title              string                `json:"title"`
	Summary            string                `json:"summary"`
	VideoType          entities.VideoType    `json:"videoType"`
	Status             entities.VideoStatus  `json:"status"`
	CloudUrl           string                `json:"cloudUrl"`
	StreamKey          string                `json:"streamKey"`
	PlaybackUrl        string                `json:"playbackUrl"`
	Quality            entities.VideoQuality `json:"quality"`
	Duration           *int                  `json:"duration"`
	IsOpen             bool                  `json:"isOpen"`
	RequireAuth        bool                  `json:"requireAuth"`
	SupportInteraction bool                  `json:"supportInteraction"`
	AllowDownload      bool                  `json:"allowDownload"`
	SiteImageID        *uuid.UUID            `json:"siteImageId"`
	PromotionPicID     *uuid.UUID            `json:"promotionPicId"`
	ThumbnailID        *uuid.UUID            `json:"thumbnailId"`
	IntroArticleID     *uuid.UUID            `json:"introArticleId"`
	NotOpenArticleID   *uuid.UUID            `json:"notOpenArticleId"`
	SurveyID           *uuid.UUID            `json:"surveyId"`
	UploadID           *uuid.UUID            `json:"uploadId"`
	BoundEventID       *uuid.UUID            `json:"boundEventId"`
	StartTime          *time.Time            `json:"startTime"`
	VideoEndTime       *time.Time            `json:"videoEndTime"`
	CategoryID         *uuid.UUID            `json:"categoryId"`
	ViewCount          int64                 `json:"viewCount"`
	LikeCount          int64                 `json:"likeCount"`
	ShareCount         int64                 `json:"shareCount"`
	CommentCount       int64                 `json:"commentCount"`
	WatchTime          int64                 `json:"watchTime"`
	AverageWatchTime   float64               `json:"averageWatchTime"`
	CompletionRate     float64               `json:"completionRate"`
	EngagementScore    float64               `json:"engagementScore"`
	FileSize           *int64                `json:"fileSize"`
	Resolution         string                `json:"resolution"`
	FrameRate          float64               `json:"frameRate"`
	Bitrate            *int                  `json:"bitrate"`
	Codec              string                `json:"codec"`
	Slug               string                `json:"slug"`
	MetaTitle          string                `json:"metaTitle"`
	MetaDescription    string                `json:"metaDescription"`
	Keywords           string                `json:"keywords"`
	Tags               string                `json:"tags"`
	WeChatMediaID      string                `json:"wechatMediaId"`
	WeChatURL          string                `json:"wechatUrl"`
	CreatedAt          time.Time             `json:"createdAt"`
	UpdatedAt          time.Time             `json:"updatedAt"`
	CreatedBy          *uuid.UUID            `json:"createdBy"`
	UpdatedBy          *uuid.UUID            `json:"updatedBy"`

	// Optional related data
	Analytics *VideoAnalyticsResponse `json:"analytics,omitempty"`
}

// VideoListResponse represents a paginated list of videos
type VideoListResponse struct {
	Videos []VideoResponse `json:"videos"`
	Total  int64           `json:"total"`
	Page   int             `json:"page"`
	Limit  int             `json:"limit"`
	Pages  int             `json:"pages"`
}

// VideoSessionResponse represents a video session response
type VideoSessionResponse struct {
	ID                   uuid.UUID                   `json:"id"`
	VideoID              uuid.UUID                   `json:"videoId"`
	UserID               *uuid.UUID                  `json:"userId"`
	SessionID            string                      `json:"sessionId"`
	Status               entities.VideoSessionStatus `json:"status"`
	StartTime            time.Time                   `json:"startTime"`
	EndTime              *time.Time                  `json:"endTime"`
	LastActivity         time.Time                   `json:"lastActivity"`
	CurrentPosition      int64                       `json:"currentPosition"`
	WatchedDuration      int64                       `json:"watchedDuration"`
	PlaybackSpeed        float64                     `json:"playbackSpeed"`
	Quality              string                      `json:"quality"`
	CompletionPercentage float64                     `json:"completionPercentage"`
	IsCompleted          bool                        `json:"isCompleted"`
	CompletedAt          *time.Time                  `json:"completedAt"`
	PauseCount           int                         `json:"pauseCount"`
	SeekCount            int                         `json:"seekCount"`
	ReplayCount          int                         `json:"replayCount"`
	VolumeLevel          int                         `json:"volumeLevel"`
	DeviceType           string                      `json:"deviceType"`
	Browser              string                      `json:"browser"`
	OS                   string                      `json:"os"`
	Country              string                      `json:"country"`
	Region               string                      `json:"region"`
	City                 string                      `json:"city"`
	EngagementScore      float64                     `json:"engagementScore"`
	AttentionSpan        float64                     `json:"attentionSpan"`
	CreatedAt            time.Time                   `json:"createdAt"`
	UpdatedAt            time.Time                   `json:"updatedAt"`
}

// VideoAnalyticsResponse represents video analytics data
type VideoAnalyticsResponse struct {
	VideoID              uuid.UUID `json:"videoId"`
	TotalSessions        int64     `json:"totalSessions"`
	CompletedSessions    int64     `json:"completedSessions"`
	AbandonedSessions    int64     `json:"abandonedSessions"`
	AverageWatchTime     float64   `json:"averageWatchTime"`
	AverageCompletion    float64   `json:"averageCompletion"`
	AverageEngagement    float64   `json:"averageEngagement"`
	TotalWatchTime       int64     `json:"totalWatchTime"`
	UniqueViewers        int64     `json:"uniqueViewers"`
	ReturnViewers        int64     `json:"returnViewers"`
	CompletionRate       float64   `json:"completionRate"`
	AbandonmentRate      float64   `json:"abandonmentRate"`
	AverageSessionLength float64   `json:"averageSessionLength"`
	LastUpdated          time.Time `json:"lastUpdated"`
}

// VideoStreamStatusResponse represents a live stream status response
type VideoStreamStatusResponse struct {
	VideoID     uuid.UUID  `json:"videoId"`
	StreamKey   string     `json:"streamKey"`
	Status      string     `json:"status"`
	ViewerCount int        `json:"viewerCount"`
	StartTime   *time.Time `json:"startTime"`
}

// VideoBulkOperationRequest represents a bulk operation request
type VideoBulkOperationRequest struct {
	VideoIDs []uuid.UUID `json:"videoIds" binding:"required"`
	Action   string      `json:"action" binding:"required,oneof=start stop delete"`
	Data     interface{} `json:"data,omitempty"`
}

// VideoBulkOperationResponse represents a bulk operation response
type VideoBulkOperationResponse struct {
	Success   bool     `json:"success"`
	Processed int      `json:"processed"`
	Failed    int      `json:"failed"`
	Errors    []string `json:"errors,omitempty"`
	Message   string   `json:"message"`
}
