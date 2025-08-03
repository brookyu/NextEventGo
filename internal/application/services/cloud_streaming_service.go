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

// Cloud streaming service errors
var (
	ErrStreamNotFound      = errors.New("stream not found")
	ErrStreamNotActive     = errors.New("stream not active")
	ErrStreamAlreadyActive = errors.New("stream already active")
	ErrInvalidStreamConfig = errors.New("invalid stream configuration")
	ErrCloudProviderError  = errors.New("cloud provider error")
)

// CloudStreamingService handles cloud video streaming operations
type CloudStreamingService struct {
	videoRepo    repositories.VideoRepository
	sessionRepo  repositories.VideoSessionRepository
	logger       *zap.Logger
	config       CloudStreamingConfig
	// Cloud provider clients would be injected here
	// alibabaClient *alibaba.Client
	// awsClient     *aws.Client
	// azureClient   *azure.Client
}

// CloudStreamingConfig holds configuration for cloud streaming
type CloudStreamingConfig struct {
	Provider                string
	Region                  string
	DefaultQuality          entities.VideoQuality
	EnableAdaptiveBitrate   bool
	EnableRecording         bool
	EnableTranscoding       bool
	MaxStreamDuration       time.Duration
	MaxConcurrentStreams    int
	EnableCDN               bool
	CDNDomain               string
	EnableDRM               bool
	EnableWatermark         bool
	WatermarkText           string
	EnableAnalytics         bool
	AnalyticsEndpoint       string
	StreamKeyPrefix         string
	PlaybackDomain          string
	RTMPEndpoint            string
	HLSEndpoint             string
	DASHEndpoint            string
	WebRTCEndpoint          string
}

// DefaultCloudStreamingConfig returns default configuration
func DefaultCloudStreamingConfig() CloudStreamingConfig {
	return CloudStreamingConfig{
		Provider:              "alibaba", // Default to Alibaba Cloud
		Region:                "cn-hangzhou",
		DefaultQuality:        entities.VideoQuality720p,
		EnableAdaptiveBitrate: true,
		EnableRecording:       true,
		EnableTranscoding:     true,
		MaxStreamDuration:     4 * time.Hour,
		MaxConcurrentStreams:  100,
		EnableCDN:             true,
		EnableDRM:             false,
		EnableWatermark:       false,
		EnableAnalytics:       true,
		StreamKeyPrefix:       "nextevent",
		PlaybackDomain:        "stream.nextevent.com",
		RTMPEndpoint:          "rtmp://push.nextevent.com/live/",
		HLSEndpoint:           "https://stream.nextevent.com/hls/",
		DASHEndpoint:          "https://stream.nextevent.com/dash/",
		WebRTCEndpoint:        "wss://stream.nextevent.com/webrtc/",
	}
}

// NewCloudStreamingService creates a new cloud streaming service
func NewCloudStreamingService(
	videoRepo repositories.VideoRepository,
	sessionRepo repositories.VideoSessionRepository,
	logger *zap.Logger,
	config CloudStreamingConfig,
) *CloudStreamingService {
	return &CloudStreamingService{
		videoRepo:   videoRepo,
		sessionRepo: sessionRepo,
		logger:      logger,
		config:      config,
	}
}

// CreateLiveStream creates a new live stream
func (s *CloudStreamingService) CreateLiveStream(ctx context.Context, req CreateLiveStreamRequest) (*LiveStreamResponse, error) {
	// Validate request
	if err := s.validateCreateStreamRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Generate stream key
	streamKey := s.generateStreamKey(req.VideoID)

	// Create stream configuration
	streamConfig := &StreamConfiguration{
		StreamKey:         streamKey,
		Quality:           req.Quality,
		EnableRecording:   req.EnableRecording,
		EnableTranscoding: req.EnableTranscoding,
		Bitrate:           req.Bitrate,
		FrameRate:         req.FrameRate,
		Resolution:        req.Resolution,
	}

	// Create stream with cloud provider
	cloudStream, err := s.createCloudStream(ctx, streamConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create cloud stream: %w", err)
	}

	// Update video with stream information
	video, err := s.videoRepo.GetByID(ctx, req.VideoID)
	if err != nil {
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	video.StreamKey = streamKey
	video.CloudUrl = cloudStream.PushURL
	video.PlaybackUrl = cloudStream.PlayURL
	video.Status = entities.VideoStatusScheduled

	if err := s.videoRepo.Update(ctx, video); err != nil {
		return nil, fmt.Errorf("failed to update video: %w", err)
	}

	response := &LiveStreamResponse{
		VideoID:     req.VideoID,
		StreamKey:   streamKey,
		PushURL:     cloudStream.PushURL,
		PlayURL:     cloudStream.PlayURL,
		HLSPlayURL:  cloudStream.HLSPlayURL,
		DASHPlayURL: cloudStream.DASHPlayURL,
		Status:      "created",
		CreatedAt:   time.Now(),
	}

	s.logger.Info("Live stream created", 
		zap.String("videoID", req.VideoID.String()),
		zap.String("streamKey", streamKey))

	return response, nil
}

// StartLiveStream starts a live stream
func (s *CloudStreamingService) StartLiveStream(ctx context.Context, videoID uuid.UUID) error {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Validate video can be started
	if video.VideoType != entities.VideoTypeLive {
		return ErrInvalidStreamConfig
	}

	if video.Status == entities.VideoStatusLive {
		return ErrStreamAlreadyActive
	}

	if video.StreamKey == "" {
		return ErrInvalidStreamConfig
	}

	// Start stream with cloud provider
	if err := s.startCloudStream(ctx, video.StreamKey); err != nil {
		return fmt.Errorf("failed to start cloud stream: %w", err)
	}

	// Update video status
	if err := s.videoRepo.StartLiveVideo(ctx, videoID, time.Now()); err != nil {
		return fmt.Errorf("failed to update video status: %w", err)
	}

	s.logger.Info("Live stream started", 
		zap.String("videoID", videoID.String()),
		zap.String("streamKey", video.StreamKey))

	return nil
}

// StopLiveStream stops a live stream
func (s *CloudStreamingService) StopLiveStream(ctx context.Context, videoID uuid.UUID) error {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		return fmt.Errorf("failed to get video: %w", err)
	}

	// Validate video can be stopped
	if video.Status != entities.VideoStatusLive {
		return ErrStreamNotActive
	}

	// Stop stream with cloud provider
	if err := s.stopCloudStream(ctx, video.StreamKey); err != nil {
		return fmt.Errorf("failed to stop cloud stream: %w", err)
	}

	// Update video status
	if err := s.videoRepo.EndLiveVideo(ctx, videoID, time.Now()); err != nil {
		return fmt.Errorf("failed to update video status: %w", err)
	}

	s.logger.Info("Live stream stopped", 
		zap.String("videoID", videoID.String()),
		zap.String("streamKey", video.StreamKey))

	return nil
}

// GetStreamStatus gets the status of a live stream
func (s *CloudStreamingService) GetStreamStatus(ctx context.Context, videoID uuid.UUID) (*StreamStatusResponse, error) {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	if video.StreamKey == "" {
		return nil, ErrStreamNotFound
	}

	// Get stream status from cloud provider
	cloudStatus, err := s.getCloudStreamStatus(ctx, video.StreamKey)
	if err != nil {
		return nil, fmt.Errorf("failed to get cloud stream status: %w", err)
	}

	// Get active sessions count
	activeSessions, err := s.sessionRepo.GetActiveSessionsForVideo(ctx, videoID)
	if err != nil {
		s.logger.Warn("Failed to get active sessions", zap.Error(err))
	}

	response := &StreamStatusResponse{
		VideoID:        videoID,
		StreamKey:      video.StreamKey,
		Status:         cloudStatus.Status,
		ViewerCount:    len(activeSessions),
		Bitrate:        cloudStatus.Bitrate,
		FrameRate:      cloudStatus.FrameRate,
		Resolution:     cloudStatus.Resolution,
		Duration:       cloudStatus.Duration,
		StartTime:      video.StartTime,
		LastUpdated:    time.Now(),
	}

	return response, nil
}

// GetPlaybackURLs gets playback URLs for a video
func (s *CloudStreamingService) GetPlaybackURLs(ctx context.Context, videoID uuid.UUID, quality entities.VideoQuality) (*PlaybackURLsResponse, error) {
	// Get video
	video, err := s.videoRepo.GetByID(ctx, videoID)
	if err != nil {
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	// Generate playback URLs based on quality
	urls := s.generatePlaybackURLs(video.StreamKey, quality)

	response := &PlaybackURLsResponse{
		VideoID:     videoID,
		Quality:     quality,
		HLSUrl:      urls.HLSUrl,
		DASHUrl:     urls.DASHUrl,
		RTMPUrl:     urls.RTMPUrl,
		WebRTCUrl:   urls.WebRTCUrl,
		ExpiresAt:   time.Now().Add(24 * time.Hour), // URLs expire in 24 hours
	}

	return response, nil
}

// Helper methods

func (s *CloudStreamingService) validateCreateStreamRequest(req CreateLiveStreamRequest) error {
	if req.VideoID == uuid.Nil {
		return fmt.Errorf("video ID is required")
	}
	if req.Quality == "" {
		req.Quality = s.config.DefaultQuality
	}
	return nil
}

func (s *CloudStreamingService) generateStreamKey(videoID uuid.UUID) string {
	return fmt.Sprintf("%s_%s_%d", s.config.StreamKeyPrefix, videoID.String(), time.Now().Unix())
}

func (s *CloudStreamingService) createCloudStream(ctx context.Context, config *StreamConfiguration) (*CloudStreamInfo, error) {
	// This would integrate with actual cloud provider APIs
	// For now, return mock data
	return &CloudStreamInfo{
		StreamKey:   config.StreamKey,
		PushURL:     fmt.Sprintf("%s%s", s.config.RTMPEndpoint, config.StreamKey),
		PlayURL:     fmt.Sprintf("%s%s.m3u8", s.config.HLSEndpoint, config.StreamKey),
		HLSPlayURL:  fmt.Sprintf("%s%s.m3u8", s.config.HLSEndpoint, config.StreamKey),
		DASHPlayURL: fmt.Sprintf("%s%s.mpd", s.config.DASHEndpoint, config.StreamKey),
	}, nil
}

func (s *CloudStreamingService) startCloudStream(ctx context.Context, streamKey string) error {
	// This would call cloud provider API to start the stream
	s.logger.Info("Starting cloud stream", zap.String("streamKey", streamKey))
	return nil
}

func (s *CloudStreamingService) stopCloudStream(ctx context.Context, streamKey string) error {
	// This would call cloud provider API to stop the stream
	s.logger.Info("Stopping cloud stream", zap.String("streamKey", streamKey))
	return nil
}

func (s *CloudStreamingService) getCloudStreamStatus(ctx context.Context, streamKey string) (*CloudStreamStatus, error) {
	// This would call cloud provider API to get stream status
	return &CloudStreamStatus{
		Status:     "live",
		Bitrate:    2000,
		FrameRate:  30,
		Resolution: "1920x1080",
		Duration:   3600, // 1 hour
	}, nil
}

func (s *CloudStreamingService) generatePlaybackURLs(streamKey string, quality entities.VideoQuality) *PlaybackURLs {
	qualitySuffix := ""
	if quality != entities.VideoQualityAuto {
		qualitySuffix = "_" + string(quality)
	}

	return &PlaybackURLs{
		HLSUrl:    fmt.Sprintf("%s%s%s.m3u8", s.config.HLSEndpoint, streamKey, qualitySuffix),
		DASHUrl:   fmt.Sprintf("%s%s%s.mpd", s.config.DASHEndpoint, streamKey, qualitySuffix),
		RTMPUrl:   fmt.Sprintf("%s%s", s.config.RTMPEndpoint, streamKey),
		WebRTCUrl: fmt.Sprintf("%s%s", s.config.WebRTCEndpoint, streamKey),
	}
}

// Request and response types

// CreateLiveStreamRequest represents a request to create a live stream
type CreateLiveStreamRequest struct {
	VideoID           uuid.UUID             `json:"videoId" binding:"required"`
	Quality           entities.VideoQuality `json:"quality"`
	EnableRecording   bool                  `json:"enableRecording"`
	EnableTranscoding bool                  `json:"enableTranscoding"`
	Bitrate           int                   `json:"bitrate"`
	FrameRate         float64               `json:"frameRate"`
	Resolution        string                `json:"resolution"`
}

// LiveStreamResponse represents the response from creating a live stream
type LiveStreamResponse struct {
	VideoID     uuid.UUID `json:"videoId"`
	StreamKey   string    `json:"streamKey"`
	PushURL     string    `json:"pushUrl"`
	PlayURL     string    `json:"playUrl"`
	HLSPlayURL  string    `json:"hlsPlayUrl"`
	DASHPlayURL string    `json:"dashPlayUrl"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
}

// StreamStatusResponse represents the status of a live stream
type StreamStatusResponse struct {
	VideoID     uuid.UUID  `json:"videoId"`
	StreamKey   string     `json:"streamKey"`
	Status      string     `json:"status"`
	ViewerCount int        `json:"viewerCount"`
	Bitrate     int        `json:"bitrate"`
	FrameRate   float64    `json:"frameRate"`
	Resolution  string     `json:"resolution"`
	Duration    int64      `json:"duration"`
	StartTime   *time.Time `json:"startTime"`
	LastUpdated time.Time  `json:"lastUpdated"`
}

// PlaybackURLsResponse represents playback URLs for a video
type PlaybackURLsResponse struct {
	VideoID   uuid.UUID             `json:"videoId"`
	Quality   entities.VideoQuality `json:"quality"`
	HLSUrl    string                `json:"hlsUrl"`
	DASHUrl   string                `json:"dashUrl"`
	RTMPUrl   string                `json:"rtmpUrl"`
	WebRTCUrl string                `json:"webrtcUrl"`
	ExpiresAt time.Time             `json:"expiresAt"`
}

// Internal types

// StreamConfiguration represents stream configuration
type StreamConfiguration struct {
	StreamKey         string
	Quality           entities.VideoQuality
	EnableRecording   bool
	EnableTranscoding bool
	Bitrate           int
	FrameRate         float64
	Resolution        string
}

// CloudStreamInfo represents cloud stream information
type CloudStreamInfo struct {
	StreamKey   string
	PushURL     string
	PlayURL     string
	HLSPlayURL  string
	DASHPlayURL string
}

// CloudStreamStatus represents cloud stream status
type CloudStreamStatus struct {
	Status     string
	Bitrate    int
	FrameRate  float64
	Resolution string
	Duration   int64
}

// PlaybackURLs represents playback URLs
type PlaybackURLs struct {
	HLSUrl    string
	DASHUrl   string
	RTMPUrl   string
	WebRTCUrl string
}
