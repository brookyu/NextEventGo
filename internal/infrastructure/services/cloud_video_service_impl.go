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
	"github.com/zenteam/nextevent-go/internal/infrastructure"
)

// CloudVideoServiceImpl implements the CloudVideoService interface
type CloudVideoServiceImpl struct {
	cloudVideoRepo         repositories.CloudVideoRepository
	cloudVideoSessionRepo  repositories.CloudVideoSessionRepository
	cloudVideoAnalyticRepo repositories.CloudVideoAnalyticRepository
	hitRepo                repositories.HitRepository
	aliLiveHelper          *infrastructure.AliLiveHelper
	logger                 *zap.Logger
	config                 CloudVideoServiceConfig
}

// CloudVideoServiceConfig holds configuration for the cloud video service
type CloudVideoServiceConfig struct {
	BaseURL             string `json:"baseUrl"`
	EnableLiveStreaming bool   `json:"enableLiveStreaming"`
	EnableAnalytics     bool   `json:"enableAnalytics"`
	EnableWeChat        bool   `json:"enableWeChat"`
	DefaultQuality      string `json:"defaultQuality"`
	MaxVideoDuration    int    `json:"maxVideoDuration"` // in seconds
	EnableQRCodes       bool   `json:"enableQRCodes"`
}

// NewCloudVideoServiceImpl creates a new CloudVideoServiceImpl
func NewCloudVideoServiceImpl(
	cloudVideoRepo repositories.CloudVideoRepository,
	cloudVideoSessionRepo repositories.CloudVideoSessionRepository,
	cloudVideoAnalyticRepo repositories.CloudVideoAnalyticRepository,
	hitRepo repositories.HitRepository,
	aliLiveHelper *infrastructure.AliLiveHelper,
	logger *zap.Logger,
	config CloudVideoServiceConfig,
) *CloudVideoServiceImpl {
	return &CloudVideoServiceImpl{
		cloudVideoRepo:         cloudVideoRepo,
		cloudVideoSessionRepo:  cloudVideoSessionRepo,
		cloudVideoAnalyticRepo: cloudVideoAnalyticRepo,
		hitRepo:                hitRepo,
		aliLiveHelper:          aliLiveHelper,
		logger:                 logger,
		config:                 config,
	}
}

// CreateCloudVideo creates a new cloud video
func (s *CloudVideoServiceImpl) CreateCloudVideo(ctx context.Context, req services.CreateCloudVideoRequest) (*entities.CloudVideo, error) {
	s.logger.Info("Creating cloud video", zap.String("title", req.Title), zap.String("type", string(req.VideoType)))

	// Create cloud video entity
	cloudVideo := &entities.CloudVideo{
		Title:              req.Title,
		Summary:            req.Summary,
		VideoType:          req.VideoType,
		Status:             entities.CloudVideoStatusDraft,
		Quality:            req.Quality,
		IsOpen:             req.IsOpen,
		RequireAuth:        req.RequireAuth,
		SupportInteraction: req.SupportInteraction,
		AllowDownload:      req.AllowDownload,
		SiteImageID:        req.SiteImageID,
		PromotionPicID:     req.PromotionPicID,
		ThumbnailID:        req.ThumbnailID,
		IntroArticleID:     req.IntroArticleID,
		NotOpenArticleID:   req.NotOpenArticleID,
		SurveyID:           req.SurveyID,
		BoundEventID:       req.BoundEventID,
		CategoryID:         req.CategoryID,
		StartTime:          req.StartTime,
		VideoEndTime:       req.VideoEndTime,
		MetaTitle:          req.MetaTitle,
		MetaDescription:    req.MetaDescription,
		Keywords:           req.Keywords,
		EnableComments:     req.EnableComments,
		EnableLikes:        req.EnableLikes,
		EnableSharing:      req.EnableSharing,
		EnableAnalytics:    req.EnableAnalytics,
		CreatedBy:          &req.CreatedBy,
	}

	// Configure live streaming if needed
	if req.VideoType == entities.CloudVideoTypeLive && s.config.EnableLiveStreaming {
		if err := s.configureLiveStreaming(cloudVideo); err != nil {
			return nil, fmt.Errorf("failed to configure live streaming: %w", err)
		}
	}

	// Save to database
	if err := s.cloudVideoRepo.Create(ctx, cloudVideo); err != nil {
		return nil, fmt.Errorf("failed to create cloud video: %w", err)
	}

	s.logger.Info("Cloud video created successfully", zap.String("id", cloudVideo.ID.String()))
	return cloudVideo, nil
}

// GetCloudVideo retrieves a cloud video by ID
func (s *CloudVideoServiceImpl) GetCloudVideo(ctx context.Context, id uuid.UUID) (*entities.CloudVideo, error) {
	return s.cloudVideoRepo.GetByID(ctx, id)
}

// UpdateCloudVideo updates a cloud video
func (s *CloudVideoServiceImpl) UpdateCloudVideo(ctx context.Context, id uuid.UUID, req services.UpdateCloudVideoRequest) (*entities.CloudVideo, error) {
	s.logger.Info("Updating cloud video", zap.String("id", id.String()))

	// Get existing video
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get cloud video: %w", err)
	}

	// Check if video can be edited
	if !cloudVideo.CanEdit() {
		return nil, fmt.Errorf("video cannot be edited in current status: %s", cloudVideo.Status)
	}

	// Update fields
	s.updateCloudVideoFields(cloudVideo, req)

	// Update in database
	if err := s.cloudVideoRepo.Update(ctx, cloudVideo); err != nil {
		return nil, fmt.Errorf("failed to update cloud video: %w", err)
	}

	s.logger.Info("Cloud video updated successfully", zap.String("id", id.String()))
	return cloudVideo, nil
}

// DeleteCloudVideo soft deletes a cloud video
func (s *CloudVideoServiceImpl) DeleteCloudVideo(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error {
	s.logger.Info("Deleting cloud video", zap.String("id", id.String()))

	if err := s.cloudVideoRepo.SoftDelete(ctx, id, deletedBy); err != nil {
		return fmt.Errorf("failed to delete cloud video: %w", err)
	}

	s.logger.Info("Cloud video deleted successfully", zap.String("id", id.String()))
	return nil
}

// CreateLiveVideo creates a new live video with streaming configuration
func (s *CloudVideoServiceImpl) CreateLiveVideo(ctx context.Context, req services.CreateLiveVideoRequest) (*entities.CloudVideo, error) {
	s.logger.Info("Creating live video", zap.String("title", req.Title))

	// Ensure video type is live
	req.VideoType = entities.CloudVideoTypeLive

	// Create the cloud video
	cloudVideo, err := s.CreateCloudVideo(ctx, req.CreateCloudVideoRequest)
	if err != nil {
		return nil, err
	}

	// Set stream key if provided
	if req.StreamKey != "" {
		cloudVideo.StreamKey = req.StreamKey
		if err := s.cloudVideoRepo.Update(ctx, cloudVideo); err != nil {
			s.logger.Error("Failed to update stream key", zap.Error(err))
		}
	}

	return cloudVideo, nil
}

// StartLiveStream starts a live stream
func (s *CloudVideoServiceImpl) StartLiveStream(ctx context.Context, id uuid.UUID) (*services.LiveStreamInfo, error) {
	s.logger.Info("Starting live stream", zap.String("id", id.String()))

	// Get video
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get cloud video: %w", err)
	}

	// Validate video can be started
	if cloudVideo.VideoType != entities.CloudVideoTypeLive {
		return nil, fmt.Errorf("video is not a live video")
	}

	if cloudVideo.Status == entities.CloudVideoStatusLive {
		return nil, fmt.Errorf("video is already live")
	}

	// Generate stream URLs if not already configured
	if cloudVideo.StreamKey == "" || cloudVideo.CloudUrl == "" {
		if err := s.configureLiveStreaming(cloudVideo); err != nil {
			return nil, fmt.Errorf("failed to configure live streaming: %w", err)
		}
	}

	// Update video status
	now := time.Now()
	cloudVideo.Status = entities.CloudVideoStatusLive
	cloudVideo.StartTime = &now

	if err := s.cloudVideoRepo.Update(ctx, cloudVideo); err != nil {
		return nil, fmt.Errorf("failed to update video status: %w", err)
	}

	// Create live stream info response
	streamInfo := &services.LiveStreamInfo{
		StreamKey:   cloudVideo.StreamKey,
		StreamURL:   cloudVideo.CloudUrl,
		PlaybackURL: cloudVideo.PlaybackUrl,
		Status:      string(cloudVideo.Status),
		StartTime:   now,
	}

	s.logger.Info("Live stream started successfully", zap.String("id", id.String()))
	return streamInfo, nil
}

// EndLiveStream ends a live stream
func (s *CloudVideoServiceImpl) EndLiveStream(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Ending live stream", zap.String("id", id.String()))

	// Get video
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get cloud video: %w", err)
	}

	// Validate video can be stopped
	if cloudVideo.Status != entities.CloudVideoStatusLive {
		return fmt.Errorf("video is not currently live")
	}

	// Update video status
	now := time.Now()
	cloudVideo.Status = entities.CloudVideoStatusEnded
	cloudVideo.VideoEndTime = &now

	if err := s.cloudVideoRepo.Update(ctx, cloudVideo); err != nil {
		return fmt.Errorf("failed to update video status: %w", err)
	}

	s.logger.Info("Live stream ended successfully", zap.String("id", id.String()))
	return nil
}

// GetLiveStreamStatus gets the status of a live stream
func (s *CloudVideoServiceImpl) GetLiveStreamStatus(ctx context.Context, id uuid.UUID) (*services.LiveStreamStatus, error) {
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get cloud video: %w", err)
	}

	// Get current viewer count (this would typically come from streaming service)
	viewerCount, err := s.GetActiveViewers(ctx, id)
	if err != nil {
		s.logger.Warn("Failed to get viewer count", zap.Error(err))
		viewerCount = 0
	}

	// Calculate duration
	var duration int64
	if cloudVideo.StartTime != nil {
		if cloudVideo.VideoEndTime != nil {
			duration = int64(cloudVideo.VideoEndTime.Sub(*cloudVideo.StartTime).Seconds())
		} else if cloudVideo.Status == entities.CloudVideoStatusLive {
			duration = int64(time.Since(*cloudVideo.StartTime).Seconds())
		}
	}

	status := &services.LiveStreamStatus{
		IsLive:       cloudVideo.IsLive(),
		Status:       string(cloudVideo.Status),
		ViewerCount:  viewerCount,
		StartTime:    cloudVideo.StartTime,
		Duration:     duration,
		LastActivity: time.Now(), // This would come from actual streaming data
	}

	return status, nil
}

// ScheduleLiveVideo schedules a live video for future streaming
func (s *CloudVideoServiceImpl) ScheduleLiveVideo(ctx context.Context, id uuid.UUID, startTime time.Time) error {
	s.logger.Info("Scheduling live video", zap.String("id", id.String()), zap.Time("startTime", startTime))

	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get cloud video: %w", err)
	}

	if cloudVideo.VideoType != entities.CloudVideoTypeLive {
		return fmt.Errorf("video is not a live video")
	}

	// Update scheduling
	cloudVideo.Status = entities.CloudVideoStatusScheduled
	cloudVideo.StartTime = &startTime

	if err := s.cloudVideoRepo.Update(ctx, cloudVideo); err != nil {
		return fmt.Errorf("failed to update video schedule: %w", err)
	}

	s.logger.Info("Live video scheduled successfully", zap.String("id", id.String()))
	return nil
}

// Private helper methods

// configureLiveStreaming configures live streaming for a video
func (s *CloudVideoServiceImpl) configureLiveStreaming(cloudVideo *entities.CloudVideo) error {
	if !s.config.EnableLiveStreaming {
		return fmt.Errorf("live streaming is not enabled")
	}

	// Generate stream key if not provided
	if cloudVideo.StreamKey == "" {
		cloudVideo.StreamKey = s.aliLiveHelper.CreateStreamKey(cloudVideo.ID)
	}

	// Set end time if not provided (default to 4 hours from start)
	endTime := time.Now().Add(4 * time.Hour)
	if cloudVideo.VideoEndTime != nil {
		endTime = *cloudVideo.VideoEndTime
	}

	// Generate authenticated URLs using AliLiveHelper
	cloudVideo.CloudUrl = s.aliLiveHelper.CreatAuthUrl("/live/"+cloudVideo.StreamKey, endTime, infrastructure.VideoKeyTypesPush)
	cloudVideo.PlaybackUrl = s.aliLiveHelper.CreatAuthUrl("/live/"+cloudVideo.StreamKey, endTime, infrastructure.VideoKeyTypesPull)

	return nil
}

// updateCloudVideoFields updates cloud video fields from request
func (s *CloudVideoServiceImpl) updateCloudVideoFields(cloudVideo *entities.CloudVideo, req services.UpdateCloudVideoRequest) {
	if req.Title != nil {
		cloudVideo.Title = *req.Title
	}
	if req.Summary != nil {
		cloudVideo.Summary = *req.Summary
	}
	if req.Status != nil {
		cloudVideo.Status = *req.Status
	}
	if req.Quality != nil {
		cloudVideo.Quality = *req.Quality
	}
	if req.IsOpen != nil {
		cloudVideo.IsOpen = *req.IsOpen
	}
	if req.RequireAuth != nil {
		cloudVideo.RequireAuth = *req.RequireAuth
	}
	if req.SupportInteraction != nil {
		cloudVideo.SupportInteraction = *req.SupportInteraction
	}
	if req.AllowDownload != nil {
		cloudVideo.AllowDownload = *req.AllowDownload
	}
	if req.SiteImageID != nil {
		cloudVideo.SiteImageID = req.SiteImageID
	}
	if req.PromotionPicID != nil {
		cloudVideo.PromotionPicID = req.PromotionPicID
	}
	if req.ThumbnailID != nil {
		cloudVideo.ThumbnailID = req.ThumbnailID
	}
	if req.IntroArticleID != nil {
		cloudVideo.IntroArticleID = req.IntroArticleID
	}
	if req.NotOpenArticleID != nil {
		cloudVideo.NotOpenArticleID = req.NotOpenArticleID
	}
	if req.SurveyID != nil {
		cloudVideo.SurveyID = req.SurveyID
	}
	if req.BoundEventID != nil {
		cloudVideo.BoundEventID = req.BoundEventID
	}
	if req.CategoryID != nil {
		cloudVideo.CategoryID = req.CategoryID
	}
	if req.StartTime != nil {
		cloudVideo.StartTime = req.StartTime
	}
	if req.VideoEndTime != nil {
		cloudVideo.VideoEndTime = req.VideoEndTime
	}
	if req.Duration != nil {
		cloudVideo.Duration = req.Duration
	}
	if req.MetaTitle != nil {
		cloudVideo.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		cloudVideo.MetaDescription = *req.MetaDescription
	}
	if req.Keywords != nil {
		cloudVideo.Keywords = *req.Keywords
	}
	if req.EnableComments != nil {
		cloudVideo.EnableComments = *req.EnableComments
	}
	if req.EnableLikes != nil {
		cloudVideo.EnableLikes = *req.EnableLikes
	}
	if req.EnableSharing != nil {
		cloudVideo.EnableSharing = *req.EnableSharing
	}
	if req.EnableAnalytics != nil {
		cloudVideo.EnableAnalytics = *req.EnableAnalytics
	}

	// Update audit fields
	cloudVideo.UpdatedBy = &req.UpdatedBy
}

// GetActiveViewers gets the current number of active viewers for a video
func (s *CloudVideoServiceImpl) GetActiveViewers(ctx context.Context, id uuid.UUID) (int64, error) {
	// This would typically query the streaming service for real-time viewer count
	// For now, we'll count active sessions from the last 5 minutes
	filter := repositories.CloudVideoSessionFilter{
		CloudVideoID: &id,
		IsActive:     &[]bool{true}[0],
		StartAfter:   &[]time.Time{time.Now().Add(-5 * time.Minute)}[0],
	}

	sessions, err := s.cloudVideoSessionRepo.GetVideoSessions(ctx, id, filter)
	if err != nil {
		return 0, fmt.Errorf("failed to get active sessions: %w", err)
	}

	return int64(len(sessions)), nil
}

// GetPlayerInfo gets player information for a video
func (s *CloudVideoServiceImpl) GetPlayerInfo(ctx context.Context, id uuid.UUID, deviceType string) (*services.PlayerInfo, error) {
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get cloud video: %w", err)
	}

	// Generate player URL based on device type
	playerURL := cloudVideo.GetPlayerURL(s.config.BaseURL, deviceType)

	// Get thumbnail URL
	var thumbnailURL string
	if cloudVideo.ThumbnailID != nil {
		// This would typically resolve the thumbnail URL from the image service
		thumbnailURL = fmt.Sprintf("%s/images/%s", s.config.BaseURL, cloudVideo.ThumbnailID.String())
	}

	playerInfo := &services.PlayerInfo{
		VideoID:      cloudVideo.ID,
		Title:        cloudVideo.Title,
		Summary:      cloudVideo.Summary,
		PlaybackURL:  cloudVideo.PlaybackUrl,
		PlayerURL:    playerURL,
		ThumbnailURL: thumbnailURL,
		Duration:     cloudVideo.Duration,
		Quality:      string(cloudVideo.Quality),
		IsLive:       cloudVideo.IsLive(),
		CanWatch:     cloudVideo.CanWatch(),
		RequireAuth:  cloudVideo.RequireAuth,
		IsOpen:       cloudVideo.IsOpen,
		Features: services.PlayerFeatures{
			EnableComments:     cloudVideo.EnableComments,
			EnableLikes:        cloudVideo.EnableLikes,
			EnableSharing:      cloudVideo.EnableSharing,
			AllowDownload:      cloudVideo.AllowDownload,
			SupportInteraction: cloudVideo.SupportInteraction,
		},
	}

	return playerInfo, nil
}

// GetPlayerURL gets the player URL for a video
func (s *CloudVideoServiceImpl) GetPlayerURL(ctx context.Context, id uuid.UUID, deviceType string) (string, error) {
	cloudVideo, err := s.cloudVideoRepo.GetByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("failed to get cloud video: %w", err)
	}

	return cloudVideo.GetPlayerURL(s.config.BaseURL, deviceType), nil
}

// ListCloudVideos lists cloud videos with filtering
func (s *CloudVideoServiceImpl) ListCloudVideos(ctx context.Context, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, int64, error) {
	videos, err := s.cloudVideoRepo.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list cloud videos: %w", err)
	}

	count, err := s.cloudVideoRepo.Count(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count cloud videos: %w", err)
	}

	return videos, count, nil
}

// SearchCloudVideos searches cloud videos
func (s *CloudVideoServiceImpl) SearchCloudVideos(ctx context.Context, query string, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, error) {
	return s.cloudVideoRepo.Search(ctx, query, filter)
}

// TrackVideoView tracks a video view
func (s *CloudVideoServiceImpl) TrackVideoView(ctx context.Context, req services.TrackVideoViewRequest) error {
	if !s.config.EnableAnalytics {
		return nil
	}

	s.logger.Debug("Tracking video view", zap.String("videoId", req.VideoID.String()))

	// Increment view count
	if err := s.cloudVideoRepo.IncrementViewCount(ctx, req.VideoID); err != nil {
		s.logger.Error("Failed to increment view count", zap.Error(err))
	}

	// Create hit record
	hit := &entities.Hit{
		ResourceId:    req.VideoID,
		ResourceType:  "cloudvideo",
		UserId:        req.UserID,
		SessionId:     req.SessionID,
		HitType:       entities.HitTypeView,
		IPAddress:     req.IPAddress,
		UserAgent:     req.UserAgent,
		Referrer:      req.Referrer,
		Country:       req.Country,
		City:          req.City,
		DeviceType:    req.DeviceType,
		WeChatOpenId:  req.WeChatOpenID,
		WeChatUnionId: req.WeChatUnionID,
	}

	return s.hitRepo.Create(ctx, hit)
}

// TrackVideoInteraction tracks video interaction
func (s *CloudVideoServiceImpl) TrackVideoInteraction(ctx context.Context, req services.TrackVideoInteractionRequest) error {
	if !s.config.EnableAnalytics {
		return nil
	}

	s.logger.Debug("Tracking video interaction",
		zap.String("videoId", req.VideoID.String()),
		zap.String("type", req.InteractionType))

	// Get or create active session
	session, err := s.cloudVideoSessionRepo.GetActiveSession(ctx, req.VideoID, req.SessionID)
	if err != nil {
		s.logger.Warn("Failed to get active session", zap.Error(err))
		return nil // Don't fail the request
	}

	if session != nil {
		// Update session based on interaction type
		switch req.InteractionType {
		case "pause":
			session.IncrementPauseCount()
		case "seek":
			session.IncrementSeekCount()
		case "replay":
			session.IncrementReplayCount()
		case "volume":
			if req.VolumeLevel > 0 {
				session.SetVolumeLevel(req.VolumeLevel)
			}
		case "position":
			if req.Position > 0 {
				// Get video duration for completion calculation
				video, err := s.cloudVideoRepo.GetByID(ctx, req.VideoID)
				if err == nil && video.Duration != nil {
					session.UpdatePosition(req.Position, int64(*video.Duration))
				}
			}
		}

		// Update watch duration if provided
		if req.WatchDuration > 0 {
			session.AddWatchTime(req.WatchDuration)
		}

		// Update playback speed and quality
		if req.PlaybackSpeed > 0 {
			session.PlaybackSpeed = req.PlaybackSpeed
		}
		if req.Quality != "" {
			session.Quality = req.Quality
		}

		// Save session updates
		if err := s.cloudVideoSessionRepo.Update(ctx, session); err != nil {
			s.logger.Error("Failed to update session", zap.Error(err))
		}
	}

	return nil
}

// StartVideoSession starts a new video session
func (s *CloudVideoServiceImpl) StartVideoSession(ctx context.Context, req services.StartVideoSessionRequest) (*entities.CloudVideoSession, error) {
	s.logger.Debug("Starting video session", zap.String("videoId", req.VideoID.String()))

	session := &entities.CloudVideoSession{
		CloudVideoID:  req.VideoID,
		UserID:        req.UserID,
		SessionID:     req.SessionID,
		IPAddress:     req.IPAddress,
		UserAgent:     req.UserAgent,
		DeviceType:    req.DeviceType,
		Browser:       req.Browser,
		OS:            req.OS,
		ScreenSize:    req.ScreenSize,
		Country:       req.Country,
		Region:        req.Region,
		City:          req.City,
		Timezone:      req.Timezone,
		Referrer:      req.Referrer,
		WeChatOpenID:  req.WeChatOpenID,
		WeChatUnionID: req.WeChatUnionID,
	}

	if err := s.cloudVideoSessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create video session: %w", err)
	}

	return session, nil
}

// UpdateVideoSession updates a video session
func (s *CloudVideoServiceImpl) UpdateVideoSession(ctx context.Context, sessionID uuid.UUID, req services.UpdateVideoSessionRequest) error {
	session, err := s.cloudVideoSessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get video session: %w", err)
	}

	// Update session fields
	if req.CurrentPosition != nil {
		session.CurrentPosition = *req.CurrentPosition
	}
	if req.WatchedDuration != nil {
		session.WatchedDuration = *req.WatchedDuration
	}
	if req.PlaybackSpeed != nil {
		session.PlaybackSpeed = *req.PlaybackSpeed
	}
	if req.Quality != nil {
		session.Quality = *req.Quality
	}
	if req.CompletionPercentage != nil {
		session.CompletionPercentage = *req.CompletionPercentage
	}
	if req.IsCompleted != nil && *req.IsCompleted {
		session.MarkCompleted()
	}
	if req.PauseCount != nil {
		session.PauseCount = *req.PauseCount
	}
	if req.SeekCount != nil {
		session.SeekCount = *req.SeekCount
	}
	if req.ReplayCount != nil {
		session.ReplayCount = *req.ReplayCount
	}
	if req.VolumeLevel != nil {
		session.SetVolumeLevel(*req.VolumeLevel)
	}
	if req.Bandwidth != nil {
		session.Bandwidth = *req.Bandwidth
	}

	return s.cloudVideoSessionRepo.Update(ctx, session)
}

// EndVideoSession ends a video session
func (s *CloudVideoServiceImpl) EndVideoSession(ctx context.Context, sessionID uuid.UUID) error {
	session, err := s.cloudVideoSessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get video session: %w", err)
	}

	session.EndSession()
	session.CalculateEngagementScore()

	return s.cloudVideoSessionRepo.Update(ctx, session)
}
