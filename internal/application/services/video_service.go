package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// Video service errors
var (
	ErrVideoNotFound       = errors.New("video not found")
	ErrVideoNotLive        = errors.New("video is not live")
	ErrVideoAlreadyStarted = errors.New("video already started")
	ErrVideoNotScheduled   = errors.New("video is not scheduled")
	ErrInvalidVideoType    = errors.New("invalid video type")
	ErrInvalidVideoStatus  = errors.New("invalid video status")
	ErrVideoAccessDenied   = errors.New("video access denied")
	ErrVideoNotAvailable   = errors.New("video not available")
)

// VideoService handles video-related business logic
type VideoService struct {
	videoRepo    repositories.VideoRepository
	sessionRepo  repositories.VideoSessionRepository
	categoryRepo repositories.VideoCategoryRepository
	imageRepo    repositories.SiteImageRepository
	articleRepo  repositories.SiteArticleRepository
	eventRepo    repositories.SiteEventRepository
	logger       *zap.Logger
	config       VideoServiceConfig
}

// VideoServiceConfig holds configuration for the video service
type VideoServiceConfig struct {
	MaxTitleLength        int
	MaxSummaryLength      int
	MaxDuration           int // in seconds
	MinDuration           int // in seconds
	AllowedQualities      []entities.VideoQuality
	DefaultQuality        entities.VideoQuality
	EnableAnalytics       bool
	EnableSessionTracking bool
	SessionTimeout        time.Duration
	MaxConcurrentStreams  int
	RequireAuth           bool
	AllowDownload         bool
	EnableInteraction     bool
	AutoGenerateSlug      bool
}

// DefaultVideoServiceConfig returns default configuration
func DefaultVideoServiceConfig() VideoServiceConfig {
	return VideoServiceConfig{
		MaxTitleLength:        500,
		MaxSummaryLength:      2000,
		MaxDuration:           14400, // 4 hours
		MinDuration:           30,    // 30 seconds
		AllowedQualities:      []entities.VideoQuality{entities.VideoQuality360p, entities.VideoQuality480p, entities.VideoQuality720p, entities.VideoQuality1080p},
		DefaultQuality:        entities.VideoQualityAuto,
		EnableAnalytics:       true,
		EnableSessionTracking: true,
		SessionTimeout:        30 * time.Minute,
		MaxConcurrentStreams:  1000,
		RequireAuth:           false,
		AllowDownload:         false,
		EnableInteraction:     true,
		AutoGenerateSlug:      true,
	}
}

// NewVideoService creates a new video service
func NewVideoService(
	videoRepo repositories.VideoRepository,
	sessionRepo repositories.VideoSessionRepository,
	categoryRepo repositories.VideoCategoryRepository,
	imageRepo repositories.SiteImageRepository,
	articleRepo repositories.SiteArticleRepository,
	eventRepo repositories.SiteEventRepository,
	logger *zap.Logger,
	config VideoServiceConfig,
) *VideoService {
	return &VideoService{
		videoRepo:    videoRepo,
		sessionRepo:  sessionRepo,
		categoryRepo: categoryRepo,
		imageRepo:    imageRepo,
		articleRepo:  articleRepo,
		eventRepo:    eventRepo,
		logger:       logger,
		config:       config,
	}
}

// CreateVideo creates a new video
func (s *VideoService) CreateVideo(ctx context.Context, req VideoCreateRequest, userID uuid.UUID) (*entities.Video, error) {
	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Create video entity
	video := &entities.Video{
		ID:                 uuid.New(),
		Title:              req.Title,
		Summary:            req.Summary,
		VideoType:          req.VideoType,
		Status:             entities.VideoStatusDraft,
		CloudUrl:           req.CloudUrl,
		StreamKey:          req.StreamKey,
		PlaybackUrl:        req.PlaybackUrl,
		Quality:            req.Quality,
		Duration:           req.Duration,
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
		UploadID:           req.UploadID,
		BoundEventID:       req.BoundEventID,
		StartTime:          req.StartTime,
		VideoEndTime:       req.VideoEndTime,
		CategoryID:         req.CategoryID,
		Slug:               req.Slug,
		MetaTitle:          req.MetaTitle,
		MetaDescription:    req.MetaDescription,
		Keywords:           req.Keywords,
		Tags:               req.Tags,
		FileSize:           req.FileSize,
		Resolution:         req.Resolution,
		FrameRate:          req.FrameRate,
		Bitrate:            req.Bitrate,
		Codec:              req.Codec,
		CreatedBy:          &userID,
	}

	// Generate slug if needed
	if s.config.AutoGenerateSlug && video.Slug == "" {
		video.Slug = s.generateSlug(video.Title)
	}

	// Set default quality if not specified
	if video.Quality == "" {
		video.Quality = s.config.DefaultQuality
	}

	// Create video in database
	if err := s.videoRepo.Create(ctx, video); err != nil {
		return nil, fmt.Errorf("failed to create video: %w", err)
	}

	// Update category video count if category is specified
	if video.CategoryID != nil {
		go s.updateCategoryVideoCount(ctx, *video.CategoryID)
	}

	s.logger.Info("Video created successfully",
		zap.String("videoID", video.ID.String()),
		zap.String("title", video.Title),
		zap.String("type", string(video.VideoType)))

	return video, nil
}

// GetVideo retrieves a video by ID
func (s *VideoService) GetVideo(ctx context.Context, id uuid.UUID, userID *uuid.UUID) (*entities.Video, error) {
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoNotFound
		}
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	// Check access permissions
	if err := s.checkVideoAccess(video, userID); err != nil {
		return nil, err
	}

	return video, nil
}

// GetVideoBySlug retrieves a video by slug
func (s *VideoService) GetVideoBySlug(ctx context.Context, slug string, userID *uuid.UUID) (*entities.Video, error) {
	video, err := s.videoRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoNotFound
		}
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	// Check access permissions
	if err := s.checkVideoAccess(video, userID); err != nil {
		return nil, err
	}

	return video, nil
}

// UpdateVideo updates an existing video
func (s *VideoService) UpdateVideo(ctx context.Context, id uuid.UUID, req VideoUpdateRequest, userID uuid.UUID) (*entities.Video, error) {
	// Get existing video
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoNotFound
		}
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	// Check if user can edit
	if !s.canEditVideo(video, userID) {
		return nil, ErrVideoAccessDenied
	}

	// Validate request
	if err := s.validateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Update fields
	s.updateVideoFields(video, req)
	video.UpdatedBy = &userID

	// Update video in database
	if err := s.videoRepo.Update(ctx, video); err != nil {
		return nil, fmt.Errorf("failed to update video: %w", err)
	}

	s.logger.Info("Video updated successfully", zap.String("videoID", video.ID.String()))

	return video, nil
}

// DeleteVideo deletes a video
func (s *VideoService) DeleteVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrVideoNotFound
		}
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Check if user can delete
	if !s.canDeleteVideo(video, userID) {
		return ErrVideoAccessDenied
	}

	// Soft delete video
	if err := s.videoRepo.SoftDelete(ctx, id, userID); err != nil {
		return fmt.Errorf("failed to delete video: %w", err)
	}

	// Update category video count if category is specified
	if video.CategoryID != nil {
		go s.updateCategoryVideoCount(ctx, *video.CategoryID)
	}

	s.logger.Info("Video deleted successfully", zap.String("videoID", video.ID.String()))

	return nil
}

// ListVideos retrieves videos with filtering
func (s *VideoService) ListVideos(ctx context.Context, filter repositories.VideoFilter, userID *uuid.UUID) ([]*entities.Video, int64, error) {
	// Apply user-specific filters
	s.applyUserFilters(&filter, userID)

	// Get videos
	videos, err := s.videoRepo.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list videos: %w", err)
	}

	// Get total count
	total, err := s.videoRepo.Count(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count videos: %w", err)
	}

	// Filter out videos user cannot access
	accessibleVideos := make([]*entities.Video, 0, len(videos))
	for _, video := range videos {
		if s.checkVideoAccess(video, userID) == nil {
			accessibleVideos = append(accessibleVideos, video)
		}
	}

	return accessibleVideos, total, nil
}

// StartLiveVideo starts a live video stream
func (s *VideoService) StartLiveVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrVideoNotFound
		}
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Check permissions
	if !s.canControlVideo(video, userID) {
		return ErrVideoAccessDenied
	}

	// Validate video can be started
	if video.VideoType != entities.VideoTypeLive {
		return ErrInvalidVideoType
	}

	if video.Status == entities.VideoStatusLive {
		return ErrVideoAlreadyStarted
	}

	if video.Status != entities.VideoStatusScheduled && video.Status != entities.VideoStatusDraft {
		return ErrInvalidVideoStatus
	}

	// Start the video
	now := time.Now()
	if err := s.videoRepo.StartLiveVideo(ctx, id, now); err != nil {
		return fmt.Errorf("failed to start live video: %w", err)
	}

	s.logger.Info("Live video started",
		zap.String("videoID", video.ID.String()),
		zap.String("userID", userID.String()))

	return nil
}

// EndLiveVideo ends a live video stream
func (s *VideoService) EndLiveVideo(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrVideoNotFound
		}
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Check permissions
	if !s.canControlVideo(video, userID) {
		return ErrVideoAccessDenied
	}

	// Validate video can be ended
	if video.Status != entities.VideoStatusLive {
		return ErrVideoNotLive
	}

	// End the video
	now := time.Now()
	if err := s.videoRepo.EndLiveVideo(ctx, id, now); err != nil {
		return fmt.Errorf("failed to end live video: %w", err)
	}

	s.logger.Info("Live video ended",
		zap.String("videoID", video.ID.String()),
		zap.String("userID", userID.String()))

	return nil
}

// Helper methods

func (s *VideoService) validateCreateRequest(req VideoCreateRequest) error {
	if len(req.Title) == 0 || len(req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title must be between 1 and %d characters", s.config.MaxTitleLength)
	}

	if len(req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary must be less than %d characters", s.config.MaxSummaryLength)
	}

	if req.Duration != nil {
		if *req.Duration < s.config.MinDuration || *req.Duration > s.config.MaxDuration {
			return fmt.Errorf("duration must be between %d and %d seconds", s.config.MinDuration, s.config.MaxDuration)
		}
	}

	// Validate quality
	if req.Quality != "" {
		validQuality := false
		for _, quality := range s.config.AllowedQualities {
			if req.Quality == quality {
				validQuality = true
				break
			}
		}
		if !validQuality {
			return fmt.Errorf("invalid video quality: %s", req.Quality)
		}
	}

	return nil
}

func (s *VideoService) validateUpdateRequest(req VideoUpdateRequest) error {
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

func (s *VideoService) checkVideoAccess(video *entities.Video, userID *uuid.UUID) error {
	// Check if video is available
	if !video.CanWatch() {
		return ErrVideoNotAvailable
	}

	// Check authentication requirement
	if video.RequireAuth && userID == nil {
		return ErrVideoAccessDenied
	}

	// Check if video is open to public
	if !video.IsOpen && userID == nil {
		return ErrVideoAccessDenied
	}

	// Owner can always access
	if userID != nil && video.CreatedBy != nil && *video.CreatedBy == *userID {
		return nil
	}

	return nil
}

func (s *VideoService) canEditVideo(video *entities.Video, userID uuid.UUID) bool {
	// Owner can edit
	if video.CreatedBy != nil && *video.CreatedBy == userID {
		return true
	}

	// Can only edit if video is in editable state
	return video.CanEdit()
}

func (s *VideoService) canDeleteVideo(video *entities.Video, userID uuid.UUID) bool {
	// Owner can delete
	if video.CreatedBy != nil && *video.CreatedBy == userID {
		return true
	}

	return false
}

func (s *VideoService) canControlVideo(video *entities.Video, userID uuid.UUID) bool {
	// Owner can control
	if video.CreatedBy != nil && *video.CreatedBy == userID {
		return true
	}

	return false
}

func (s *VideoService) updateVideoFields(video *entities.Video, req VideoUpdateRequest) {
	if req.Title != nil {
		video.Title = *req.Title
	}
	if req.Summary != nil {
		video.Summary = *req.Summary
	}
	if req.VideoType != nil {
		video.VideoType = *req.VideoType
	}
	if req.CloudUrl != nil {
		video.CloudUrl = *req.CloudUrl
	}
	if req.StreamKey != nil {
		video.StreamKey = *req.StreamKey
	}
	if req.PlaybackUrl != nil {
		video.PlaybackUrl = *req.PlaybackUrl
	}
	if req.Quality != nil {
		video.Quality = *req.Quality
	}
	if req.Duration != nil {
		video.Duration = req.Duration
	}
	if req.IsOpen != nil {
		video.IsOpen = *req.IsOpen
	}
	if req.RequireAuth != nil {
		video.RequireAuth = *req.RequireAuth
	}
	if req.SupportInteraction != nil {
		video.SupportInteraction = *req.SupportInteraction
	}
	if req.AllowDownload != nil {
		video.AllowDownload = *req.AllowDownload
	}
	if req.CategoryID != nil {
		video.CategoryID = req.CategoryID
	}
	if req.StartTime != nil {
		video.StartTime = req.StartTime
	}
	if req.VideoEndTime != nil {
		video.VideoEndTime = req.VideoEndTime
	}
	if req.MetaTitle != nil {
		video.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		video.MetaDescription = *req.MetaDescription
	}
	if req.Keywords != nil {
		video.Keywords = *req.Keywords
	}
	if req.Tags != nil {
		video.Tags = *req.Tags
	}
}

func (s *VideoService) applyUserFilters(filter *repositories.VideoFilter, userID *uuid.UUID) {
	// If user is not authenticated, only show public videos
	if userID == nil {
		isOpen := true
		requireAuth := false
		filter.IsOpen = &isOpen
		filter.RequireAuth = &requireAuth
	}
}

func (s *VideoService) generateSlug(title string) string {
	// Simple slug generation - in production, use a proper slug library
	return fmt.Sprintf("video-%d", time.Now().Unix())
}

func (s *VideoService) updateCategoryVideoCount(ctx context.Context, categoryID uuid.UUID) {
	if err := s.categoryRepo.UpdateVideoCount(ctx, categoryID); err != nil {
		s.logger.Error("Failed to update category video count",
			zap.String("categoryID", categoryID.String()),
			zap.Error(err))
	}
}

// Request and response types

// VideoCreateRequest represents a request to create a video
type VideoCreateRequest struct {
	Title              string                `json:"title" binding:"required,max=500"`
	Summary            string                `json:"summary" binding:"max=2000"`
	VideoType          entities.VideoType    `json:"videoType" binding:"required"`
	CloudUrl           string                `json:"cloudUrl" binding:"max=1000"`
	StreamKey          string                `json:"streamKey" binding:"max=255"`
	PlaybackUrl        string                `json:"playbackUrl" binding:"max=1000"`
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
	Slug               string                `json:"slug" binding:"max=500"`
	MetaTitle          string                `json:"metaTitle" binding:"max=500"`
	MetaDescription    string                `json:"metaDescription" binding:"max=1000"`
	Keywords           string                `json:"keywords" binding:"max=1000"`
	Tags               string                `json:"tags" binding:"max=1000"`
	FileSize           *int64                `json:"fileSize"`
	Resolution         string                `json:"resolution" binding:"max=20"`
	FrameRate          float64               `json:"frameRate"`
	Bitrate            *int                  `json:"bitrate"`
	Codec              string                `json:"codec" binding:"max=50"`
}

// VideoUpdateRequest represents a request to update a video
type VideoUpdateRequest struct {
	Title              *string                `json:"title" binding:"omitempty,max=500"`
	Summary            *string                `json:"summary" binding:"omitempty,max=2000"`
	VideoType          *entities.VideoType    `json:"videoType"`
	CloudUrl           *string                `json:"cloudUrl" binding:"omitempty,max=1000"`
	StreamKey          *string                `json:"streamKey" binding:"omitempty,max=255"`
	PlaybackUrl        *string                `json:"playbackUrl" binding:"omitempty,max=1000"`
	Quality            *entities.VideoQuality `json:"quality"`
	Duration           *int                   `json:"duration"`
	IsOpen             *bool                  `json:"isOpen"`
	RequireAuth        *bool                  `json:"requireAuth"`
	SupportInteraction *bool                  `json:"supportInteraction"`
	AllowDownload      *bool                  `json:"allowDownload"`
	SiteImageID        *uuid.UUID             `json:"siteImageId"`
	PromotionPicID     *uuid.UUID             `json:"promotionPicId"`
	ThumbnailID        *uuid.UUID             `json:"thumbnailId"`
	IntroArticleID     *uuid.UUID             `json:"introArticleId"`
	NotOpenArticleID   *uuid.UUID             `json:"notOpenArticleId"`
	SurveyID           *uuid.UUID             `json:"surveyId"`
	UploadID           *uuid.UUID             `json:"uploadId"`
	BoundEventID       *uuid.UUID             `json:"boundEventId"`
	StartTime          *time.Time             `json:"startTime"`
	VideoEndTime       *time.Time             `json:"videoEndTime"`
	CategoryID         *uuid.UUID             `json:"categoryId"`
	Slug               *string                `json:"slug" binding:"omitempty,max=500"`
	MetaTitle          *string                `json:"metaTitle" binding:"omitempty,max=500"`
	MetaDescription    *string                `json:"metaDescription" binding:"omitempty,max=1000"`
	Keywords           *string                `json:"keywords" binding:"omitempty,max=1000"`
	Tags               *string                `json:"tags" binding:"omitempty,max=1000"`
	FileSize           *int64                 `json:"fileSize"`
	Resolution         *string                `json:"resolution" binding:"omitempty,max=20"`
	FrameRate          *float64               `json:"frameRate"`
	Bitrate            *int                   `json:"bitrate"`
	Codec              *string                `json:"codec" binding:"omitempty,max=50"`
}
