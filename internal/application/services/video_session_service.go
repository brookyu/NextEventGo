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

// Video session service errors
var (
	ErrSessionNotFound     = errors.New("session not found")
	ErrSessionExpired      = errors.New("session expired")
	ErrInvalidSessionData  = errors.New("invalid session data")
	ErrSessionAlreadyEnded = errors.New("session already ended")
)

// VideoSessionService handles video session tracking and analytics
type VideoSessionService struct {
	sessionRepo repositories.VideoSessionRepository
	videoRepo   repositories.VideoRepository
	logger      *zap.Logger
	config      VideoSessionServiceConfig
}

// VideoSessionServiceConfig holds configuration for the video session service
type VideoSessionServiceConfig struct {
	SessionTimeout       time.Duration
	InactivityThreshold  time.Duration
	MaxSessionsPerUser   int
	EnableAnalytics      bool
	EnableHeatMaps       bool
	TrackDeviceInfo      bool
	TrackLocation        bool
	CleanupInterval      time.Duration
	BatchUpdateSize      int
	EnableRealTimeUpdates bool
}

// DefaultVideoSessionServiceConfig returns default configuration
func DefaultVideoSessionServiceConfig() VideoSessionServiceConfig {
	return VideoSessionServiceConfig{
		SessionTimeout:        4 * time.Hour,
		InactivityThreshold:   30 * time.Minute,
		MaxSessionsPerUser:    10,
		EnableAnalytics:       true,
		EnableHeatMaps:        true,
		TrackDeviceInfo:       true,
		TrackLocation:         true,
		CleanupInterval:       1 * time.Hour,
		BatchUpdateSize:       100,
		EnableRealTimeUpdates: true,
	}
}

// NewVideoSessionService creates a new video session service
func NewVideoSessionService(
	sessionRepo repositories.VideoSessionRepository,
	videoRepo repositories.VideoRepository,
	logger *zap.Logger,
	config VideoSessionServiceConfig,
) *VideoSessionService {
	return &VideoSessionService{
		sessionRepo: sessionRepo,
		videoRepo:   videoRepo,
		logger:      logger,
		config:      config,
	}
}

// StartSession starts a new video watching session
func (s *VideoSessionService) StartSession(ctx context.Context, req VideoSessionStartRequest) (*entities.VideoSession, error) {
	// Validate request
	if err := s.validateStartRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Check if video exists and is accessible
	video, err := s.videoRepo.GetByID(ctx, req.VideoID)
	if err != nil {
		return nil, fmt.Errorf("failed to get video: %w", err)
	}

	if !video.CanWatch() {
		return nil, fmt.Errorf("video is not available for watching")
	}

	// Check for existing active session
	if req.UserID != nil {
		existingSessions, err := s.sessionRepo.GetUserActiveSessions(ctx, *req.UserID)
		if err != nil {
			s.logger.Warn("Failed to get user active sessions", zap.Error(err))
		} else if len(existingSessions) >= s.config.MaxSessionsPerUser {
			// Mark oldest sessions as abandoned
			for i := 0; i < len(existingSessions)-s.config.MaxSessionsPerUser+1; i++ {
				existingSessions[i].MarkAbandoned()
				s.sessionRepo.Update(ctx, existingSessions[i])
			}
		}
	}

	// Create new session
	session := &entities.VideoSession{
		ID:               uuid.New(),
		VideoID:          req.VideoID,
		UserID:           req.UserID,
		SessionID:        req.SessionID,
		Status:           entities.VideoSessionStatusActive,
		StartTime:        time.Now(),
		LastActivity:     time.Now(),
		CurrentPosition:  0,
		WatchedDuration:  0,
		PlaybackSpeed:    1.0,
		Quality:          req.Quality,
		PauseCount:       0,
		SeekCount:        0,
		ReplayCount:      0,
		VolumeLevel:      100,
		IPAddress:        req.IPAddress,
		UserAgent:        req.UserAgent,
		DeviceType:       req.DeviceType,
		Browser:          req.Browser,
		OS:               req.OS,
		ScreenSize:       req.ScreenSize,
		Bandwidth:        req.Bandwidth,
		Country:          req.Country,
		Region:           req.Region,
		City:             req.City,
		Timezone:         req.Timezone,
		Referrer:         req.Referrer,
		Metadata:         req.Metadata,
	}

	// Create session in database
	if err := s.sessionRepo.Create(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Increment video view count
	go s.incrementVideoViewCount(ctx, req.VideoID)

	s.logger.Info("Video session started", 
		zap.String("sessionID", session.ID.String()),
		zap.String("videoID", session.VideoID.String()))

	return session, nil
}

// UpdateSession updates an existing video session
func (s *VideoSessionService) UpdateSession(ctx context.Context, sessionID uuid.UUID, req VideoSessionUpdateRequest) (*entities.VideoSession, error) {
	// Get existing session
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	// Check if session is still active
	if !session.IsActive() {
		return nil, ErrSessionAlreadyEnded
	}

	// Check for session timeout
	if time.Since(session.LastActivity) > s.config.SessionTimeout {
		session.MarkAbandoned()
		s.sessionRepo.Update(ctx, session)
		return nil, ErrSessionExpired
	}

	// Update session fields
	s.updateSessionFields(session, req)

	// Get video duration for completion calculation
	video, err := s.videoRepo.GetByID(ctx, session.VideoID)
	if err == nil && video.Duration != nil {
		session.UpdatePosition(session.CurrentPosition, int64(*video.Duration))
	}

	// Calculate engagement metrics
	session.CalculateEngagementScore()
	session.CalculateAttentionSpan()

	// Update session in database
	if err := s.sessionRepo.Update(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to update session: %w", err)
	}

	// Update video analytics if enabled
	if s.config.EnableAnalytics {
		go s.updateVideoAnalytics(ctx, session.VideoID)
	}

	return session, nil
}

// EndSession ends a video watching session
func (s *VideoSessionService) EndSession(ctx context.Context, sessionID uuid.UUID, req VideoSessionEndRequest) error {
	// Get session
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrSessionNotFound
		}
		return fmt.Errorf("failed to get session: %w", err)
	}

	// Mark session as completed or abandoned based on completion
	if req.CompletionPercentage >= 90 {
		session.MarkCompleted()
	} else {
		session.MarkAbandoned()
	}

	// Update final metrics
	if req.WatchedDuration > 0 {
		session.WatchedDuration = req.WatchedDuration
	}
	if req.CompletionPercentage > 0 {
		session.CompletionPercentage = req.CompletionPercentage
	}

	session.CalculateEngagementScore()
	session.CalculateAttentionSpan()

	// Update session in database
	if err := s.sessionRepo.Update(ctx, session); err != nil {
		return fmt.Errorf("failed to update session: %w", err)
	}

	// Update video analytics
	if s.config.EnableAnalytics {
		go s.updateVideoAnalytics(ctx, session.VideoID)
	}

	s.logger.Info("Video session ended", 
		zap.String("sessionID", session.ID.String()),
		zap.Float64("completion", session.CompletionPercentage))

	return nil
}

// GetSession retrieves a video session by ID
func (s *VideoSessionService) GetSession(ctx context.Context, sessionID uuid.UUID) (*entities.VideoSession, error) {
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, fmt.Errorf("failed to get session: %w", err)
	}

	return session, nil
}

// GetVideoSessions retrieves sessions for a video
func (s *VideoSessionService) GetVideoSessions(ctx context.Context, videoID uuid.UUID, filter repositories.VideoSessionFilter) ([]*entities.VideoSession, error) {
	return s.sessionRepo.GetSessionsByVideo(ctx, videoID, filter)
}

// GetUserSessions retrieves sessions for a user
func (s *VideoSessionService) GetUserSessions(ctx context.Context, userID uuid.UUID, filter repositories.VideoSessionFilter) ([]*entities.VideoSession, error) {
	return s.sessionRepo.GetSessionsByUser(ctx, userID, filter)
}

// GetVideoAnalytics retrieves analytics for a video
func (s *VideoSessionService) GetVideoAnalytics(ctx context.Context, videoID uuid.UUID) (*repositories.VideoSessionStatistics, error) {
	return s.sessionRepo.GetSessionStatistics(ctx, videoID)
}

// GetUserAnalytics retrieves analytics for a user
func (s *VideoSessionService) GetUserAnalytics(ctx context.Context, userID uuid.UUID) (*repositories.VideoSessionStatistics, error) {
	return s.sessionRepo.GetUserSessionStatistics(ctx, userID)
}

// CleanupInactiveSessions marks inactive sessions as abandoned
func (s *VideoSessionService) CleanupInactiveSessions(ctx context.Context) error {
	return s.sessionRepo.MarkInactiveSessions(ctx, s.config.InactivityThreshold)
}

// CleanupOldSessions removes old abandoned sessions
func (s *VideoSessionService) CleanupOldSessions(ctx context.Context) error {
	cutoff := time.Now().Add(-24 * time.Hour) // Remove sessions older than 24 hours
	return s.sessionRepo.CleanupAbandonedSessions(ctx, cutoff)
}

// Helper methods

func (s *VideoSessionService) validateStartRequest(req VideoSessionStartRequest) error {
	if req.VideoID == uuid.Nil {
		return fmt.Errorf("video ID is required")
	}
	if req.SessionID == "" {
		return fmt.Errorf("session ID is required")
	}
	return nil
}

func (s *VideoSessionService) updateSessionFields(session *entities.VideoSession, req VideoSessionUpdateRequest) {
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
	if req.VolumeLevel != nil {
		session.VolumeLevel = *req.VolumeLevel
	}
	if req.IsPaused != nil {
		if *req.IsPaused {
			session.Pause()
		} else {
			session.Resume()
		}
	}
	if req.SeekPosition != nil {
		session.Seek(*req.SeekPosition)
	}
	if req.IsReplay != nil && *req.IsReplay {
		session.Replay()
	}
}

func (s *VideoSessionService) incrementVideoViewCount(ctx context.Context, videoID uuid.UUID) {
	if err := s.videoRepo.IncrementViewCount(ctx, videoID); err != nil {
		s.logger.Error("Failed to increment video view count", 
			zap.String("videoID", videoID.String()), 
			zap.Error(err))
	}
}

func (s *VideoSessionService) updateVideoAnalytics(ctx context.Context, videoID uuid.UUID) {
	// Get session statistics
	stats, err := s.sessionRepo.GetSessionStatistics(ctx, videoID)
	if err != nil {
		s.logger.Error("Failed to get session statistics", 
			zap.String("videoID", videoID.String()), 
			zap.Error(err))
		return
	}

	// Update video engagement metrics
	metrics := repositories.VideoEngagementMetrics{
		ViewCount:        stats.TotalSessions,
		WatchTime:        stats.TotalWatchTime,
		AverageWatchTime: stats.AverageWatchTime,
		CompletionRate:   stats.CompletionRate,
		EngagementScore:  stats.AverageEngagement,
	}

	if err := s.videoRepo.UpdateEngagementMetrics(ctx, videoID, metrics); err != nil {
		s.logger.Error("Failed to update video engagement metrics", 
			zap.String("videoID", videoID.String()), 
			zap.Error(err))
	}
}

// Request types

// VideoSessionStartRequest represents a request to start a video session
type VideoSessionStartRequest struct {
	VideoID     uuid.UUID  `json:"videoId" binding:"required"`
	UserID      *uuid.UUID `json:"userId"`
	SessionID   string     `json:"sessionId" binding:"required"`
	Quality     string     `json:"quality"`
	IPAddress   string     `json:"ipAddress"`
	UserAgent   string     `json:"userAgent"`
	DeviceType  string     `json:"deviceType"`
	Browser     string     `json:"browser"`
	OS          string     `json:"os"`
	ScreenSize  string     `json:"screenSize"`
	Bandwidth   string     `json:"bandwidth"`
	Country     string     `json:"country"`
	Region      string     `json:"region"`
	City        string     `json:"city"`
	Timezone    string     `json:"timezone"`
	Referrer    string     `json:"referrer"`
	Metadata    string     `json:"metadata"`
}

// VideoSessionUpdateRequest represents a request to update a video session
type VideoSessionUpdateRequest struct {
	CurrentPosition  *int64   `json:"currentPosition"`
	WatchedDuration  *int64   `json:"watchedDuration"`
	PlaybackSpeed    *float64 `json:"playbackSpeed"`
	Quality          *string  `json:"quality"`
	VolumeLevel      *int     `json:"volumeLevel"`
	IsPaused         *bool    `json:"isPaused"`
	SeekPosition     *int64   `json:"seekPosition"`
	IsReplay         *bool    `json:"isReplay"`
}

// VideoSessionEndRequest represents a request to end a video session
type VideoSessionEndRequest struct {
	WatchedDuration      int64   `json:"watchedDuration"`
	CompletionPercentage float64 `json:"completionPercentage"`
}
