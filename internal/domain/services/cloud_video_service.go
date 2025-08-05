package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// CloudVideoService defines the business logic interface for cloud video operations
type CloudVideoService interface {
	// Basic CRUD operations
	CreateCloudVideo(ctx context.Context, req CreateCloudVideoRequest) (*entities.CloudVideo, error)
	GetCloudVideo(ctx context.Context, id uuid.UUID) (*entities.CloudVideo, error)
	UpdateCloudVideo(ctx context.Context, id uuid.UUID, req UpdateCloudVideoRequest) (*entities.CloudVideo, error)
	DeleteCloudVideo(ctx context.Context, id uuid.UUID, deletedBy uuid.UUID) error

	// List and search operations
	ListCloudVideos(ctx context.Context, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, int64, error)
	SearchCloudVideos(ctx context.Context, query string, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, error)

	// Live streaming operations
	CreateLiveVideo(ctx context.Context, req CreateLiveVideoRequest) (*entities.CloudVideo, error)
	StartLiveStream(ctx context.Context, id uuid.UUID) (*LiveStreamInfo, error)
	EndLiveStream(ctx context.Context, id uuid.UUID) error
	GetLiveStreamStatus(ctx context.Context, id uuid.UUID) (*LiveStreamStatus, error)
	ScheduleLiveVideo(ctx context.Context, id uuid.UUID, startTime time.Time) error

	// Video upload operations
	CreateUploadedVideo(ctx context.Context, req CreateUploadedVideoRequest) (*entities.CloudVideo, error)
	ProcessVideoUpload(ctx context.Context, id uuid.UUID, uploadID uuid.UUID) error

	// Player operations
	GetPlayerInfo(ctx context.Context, id uuid.UUID, deviceType string) (*PlayerInfo, error)
	GetPlayerURL(ctx context.Context, id uuid.UUID, deviceType string) (string, error)
	GenerateQRCode(ctx context.Context, id uuid.UUID, qrType string) (*CloudVideoQRCodeInfo, error)

	// Analytics operations
	TrackVideoView(ctx context.Context, req TrackVideoViewRequest) error
	TrackVideoInteraction(ctx context.Context, req TrackVideoInteractionRequest) error
	GetVideoAnalytics(ctx context.Context, id uuid.UUID, period string, startDate, endDate time.Time) (*VideoAnalytics, error)
	GetVideoTimeline(ctx context.Context, id uuid.UUID, startTime, endTime time.Time) (*VideoTimeline, error)

	// Session management
	StartVideoSession(ctx context.Context, req StartVideoSessionRequest) (*entities.CloudVideoSession, error)
	UpdateVideoSession(ctx context.Context, sessionID uuid.UUID, req UpdateVideoSessionRequest) error
	EndVideoSession(ctx context.Context, sessionID uuid.UUID) error
	GetActiveViewers(ctx context.Context, id uuid.UUID) (int64, error)

	// Content management
	PublishVideo(ctx context.Context, id uuid.UUID) error
	UnpublishVideo(ctx context.Context, id uuid.UUID) error
	ArchiveVideo(ctx context.Context, id uuid.UUID) error
	DuplicateVideo(ctx context.Context, id uuid.UUID, title string) (*entities.CloudVideo, error)

	// Category and organization
	GetVideosByCategory(ctx context.Context, categoryID uuid.UUID, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, error)
	GetVideosByEvent(ctx context.Context, eventID uuid.UUID, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, error)
	GetFeaturedVideos(ctx context.Context, limit int) ([]*entities.CloudVideo, error)
	GetPopularVideos(ctx context.Context, limit int, days int) ([]*entities.CloudVideo, error)
	GetTrendingVideos(ctx context.Context, limit int) ([]*entities.CloudVideo, error)

	// User operations
	GetUserVideos(ctx context.Context, userID uuid.UUID, filter repositories.CloudVideoFilter) ([]*entities.CloudVideo, error)
	GetUserWatchHistory(ctx context.Context, userID uuid.UUID, limit int) ([]*entities.CloudVideo, error)
	AddToFavorites(ctx context.Context, userID, videoID uuid.UUID) error
	RemoveFromFavorites(ctx context.Context, userID, videoID uuid.UUID) error

	// Bulk operations
	BulkUpdateStatus(ctx context.Context, ids []uuid.UUID, status entities.CloudVideoStatus) error
	BulkDelete(ctx context.Context, ids []uuid.UUID, deletedBy uuid.UUID) error
	BulkPublish(ctx context.Context, ids []uuid.UUID) error

	// WeChat integration
	GetWeChatPlayerInfo(ctx context.Context, id uuid.UUID) (*WeChatPlayerInfo, error)
	SendWeChatNotification(ctx context.Context, id uuid.UUID, notificationType string, userIDs []string) error
	GenerateWeChatQRCode(ctx context.Context, id uuid.UUID) (*CloudVideoQRCodeInfo, error)

	// Survey integration
	AttachSurvey(ctx context.Context, videoID, surveyID uuid.UUID) error
	DetachSurvey(ctx context.Context, videoID uuid.UUID) error
	GetVideoSurveyResults(ctx context.Context, videoID uuid.UUID) (*SurveyResults, error)

	// Event integration
	BindToEvent(ctx context.Context, videoID, eventID uuid.UUID) error
	UnbindFromEvent(ctx context.Context, videoID uuid.UUID) error
	GetEventVideos(ctx context.Context, eventID uuid.UUID) ([]*entities.CloudVideo, error)
}

// Request/Response DTOs

// CreateCloudVideoRequest represents a request to create a cloud video
type CreateCloudVideoRequest struct {
	Title              string                     `json:"title" validate:"required,max=500"`
	Summary            string                     `json:"summary,omitempty"`
	VideoType          entities.CloudVideoType    `json:"videoType" validate:"required"`
	Quality            entities.CloudVideoQuality `json:"quality,omitempty"`
	IsOpen             bool                       `json:"isOpen"`
	RequireAuth        bool                       `json:"requireAuth"`
	SupportInteraction bool                       `json:"supportInteraction"`
	AllowDownload      bool                       `json:"allowDownload"`
	SiteImageID        *uuid.UUID                 `json:"siteImageId,omitempty"`
	PromotionPicID     *uuid.UUID                 `json:"promotionPicId,omitempty"`
	ThumbnailID        *uuid.UUID                 `json:"thumbnailId,omitempty"`
	IntroArticleID     *uuid.UUID                 `json:"introArticleId,omitempty"`
	NotOpenArticleID   *uuid.UUID                 `json:"notOpenArticleId,omitempty"`
	SurveyID           *uuid.UUID                 `json:"surveyId,omitempty"`
	BoundEventID       *uuid.UUID                 `json:"boundEventId,omitempty"`
	CategoryID         *uuid.UUID                 `json:"categoryId,omitempty"`
	StartTime          *time.Time                 `json:"startTime,omitempty"`
	VideoEndTime       *time.Time                 `json:"videoEndTime,omitempty"`
	MetaTitle          string                     `json:"metaTitle,omitempty"`
	MetaDescription    string                     `json:"metaDescription,omitempty"`
	Keywords           string                     `json:"keywords,omitempty"`
	EnableComments     bool                       `json:"enableComments"`
	EnableLikes        bool                       `json:"enableLikes"`
	EnableSharing      bool                       `json:"enableSharing"`
	EnableAnalytics    bool                       `json:"enableAnalytics"`
	CreatedBy          uuid.UUID                  `json:"createdBy" validate:"required"`
}

// UpdateCloudVideoRequest represents a request to update a cloud video
type UpdateCloudVideoRequest struct {
	Title              *string                     `json:"title,omitempty" validate:"omitempty,max=500"`
	Summary            *string                     `json:"summary,omitempty"`
	Status             *entities.CloudVideoStatus  `json:"status,omitempty"`
	Quality            *entities.CloudVideoQuality `json:"quality,omitempty"`
	IsOpen             *bool                       `json:"isOpen,omitempty"`
	RequireAuth        *bool                       `json:"requireAuth,omitempty"`
	SupportInteraction *bool                       `json:"supportInteraction,omitempty"`
	AllowDownload      *bool                       `json:"allowDownload,omitempty"`
	SiteImageID        *uuid.UUID                  `json:"siteImageId,omitempty"`
	PromotionPicID     *uuid.UUID                  `json:"promotionPicId,omitempty"`
	ThumbnailID        *uuid.UUID                  `json:"thumbnailId,omitempty"`
	IntroArticleID     *uuid.UUID                  `json:"introArticleId,omitempty"`
	NotOpenArticleID   *uuid.UUID                  `json:"notOpenArticleId,omitempty"`
	SurveyID           *uuid.UUID                  `json:"surveyId,omitempty"`
	BoundEventID       *uuid.UUID                  `json:"boundEventId,omitempty"`
	CategoryID         *uuid.UUID                  `json:"categoryId,omitempty"`
	StartTime          *time.Time                  `json:"startTime,omitempty"`
	VideoEndTime       *time.Time                  `json:"videoEndTime,omitempty"`
	Duration           *int                        `json:"duration,omitempty"`
	MetaTitle          *string                     `json:"metaTitle,omitempty"`
	MetaDescription    *string                     `json:"metaDescription,omitempty"`
	Keywords           *string                     `json:"keywords,omitempty"`
	EnableComments     *bool                       `json:"enableComments,omitempty"`
	EnableLikes        *bool                       `json:"enableLikes,omitempty"`
	EnableSharing      *bool                       `json:"enableSharing,omitempty"`
	EnableAnalytics    *bool                       `json:"enableAnalytics,omitempty"`
	UpdatedBy          uuid.UUID                   `json:"updatedBy" validate:"required"`
}

// CreateLiveVideoRequest represents a request to create a live video
type CreateLiveVideoRequest struct {
	CreateCloudVideoRequest
	StreamKey    string     `json:"streamKey,omitempty"`
	StartTime    time.Time  `json:"startTime" validate:"required"`
	VideoEndTime *time.Time `json:"videoEndTime,omitempty"`
}

// CreateUploadedVideoRequest represents a request to create an uploaded video
type CreateUploadedVideoRequest struct {
	CreateCloudVideoRequest
	UploadID    uuid.UUID `json:"uploadId" validate:"required"`
	CloudUrl    string    `json:"cloudUrl" validate:"required"`
	PlaybackUrl string    `json:"playbackUrl" validate:"required"`
	Duration    *int      `json:"duration,omitempty"`
}

// TrackVideoViewRequest represents a request to track a video view
type TrackVideoViewRequest struct {
	VideoID       uuid.UUID  `json:"videoId" validate:"required"`
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId" validate:"required"`
	IPAddress     string     `json:"ipAddress,omitempty"`
	UserAgent     string     `json:"userAgent,omitempty"`
	Referrer      string     `json:"referrer,omitempty"`
	DeviceType    string     `json:"deviceType,omitempty"`
	Country       string     `json:"country,omitempty"`
	City          string     `json:"city,omitempty"`
	WeChatOpenID  string     `json:"weChatOpenId,omitempty"`
	WeChatUnionID string     `json:"weChatUnionId,omitempty"`
}

// TrackVideoInteractionRequest represents a request to track video interaction
type TrackVideoInteractionRequest struct {
	VideoID         uuid.UUID `json:"videoId" validate:"required"`
	SessionID       string    `json:"sessionId" validate:"required"`
	InteractionType string    `json:"interactionType" validate:"required"` // play, pause, seek, volume, etc.
	Position        int64     `json:"position,omitempty"`                  // Current position in seconds
	WatchDuration   int64     `json:"watchDuration,omitempty"`             // Duration watched in seconds
	PlaybackSpeed   float64   `json:"playbackSpeed,omitempty"`
	Quality         string    `json:"quality,omitempty"`
	VolumeLevel     int       `json:"volumeLevel,omitempty"`
	CompletionRate  float64   `json:"completionRate,omitempty"`
}

// StartVideoSessionRequest represents a request to start a video session
type StartVideoSessionRequest struct {
	VideoID       uuid.UUID  `json:"videoId" validate:"required"`
	UserID        *uuid.UUID `json:"userId,omitempty"`
	SessionID     string     `json:"sessionId" validate:"required"`
	IPAddress     string     `json:"ipAddress,omitempty"`
	UserAgent     string     `json:"userAgent,omitempty"`
	DeviceType    string     `json:"deviceType,omitempty"`
	Browser       string     `json:"browser,omitempty"`
	OS            string     `json:"os,omitempty"`
	ScreenSize    string     `json:"screenSize,omitempty"`
	Country       string     `json:"country,omitempty"`
	Region        string     `json:"region,omitempty"`
	City          string     `json:"city,omitempty"`
	Timezone      string     `json:"timezone,omitempty"`
	Referrer      string     `json:"referrer,omitempty"`
	WeChatOpenID  string     `json:"weChatOpenId,omitempty"`
	WeChatUnionID string     `json:"weChatUnionId,omitempty"`
}

// UpdateVideoSessionRequest represents a request to update a video session
type UpdateVideoSessionRequest struct {
	CurrentPosition      *int64   `json:"currentPosition,omitempty"`
	WatchedDuration      *int64   `json:"watchedDuration,omitempty"`
	PlaybackSpeed        *float64 `json:"playbackSpeed,omitempty"`
	Quality              *string  `json:"quality,omitempty"`
	CompletionPercentage *float64 `json:"completionPercentage,omitempty"`
	IsCompleted          *bool    `json:"isCompleted,omitempty"`
	PauseCount           *int     `json:"pauseCount,omitempty"`
	SeekCount            *int     `json:"seekCount,omitempty"`
	ReplayCount          *int     `json:"replayCount,omitempty"`
	VolumeLevel          *int     `json:"volumeLevel,omitempty"`
	Bandwidth            *string  `json:"bandwidth,omitempty"`
}

// Response DTOs

// LiveStreamInfo represents live stream information
type LiveStreamInfo struct {
	StreamKey   string     `json:"streamKey"`
	StreamURL   string     `json:"streamUrl"`
	PlaybackURL string     `json:"playbackUrl"`
	Status      string     `json:"status"`
	StartTime   time.Time  `json:"startTime"`
	EndTime     *time.Time `json:"endTime,omitempty"`
}

// LiveStreamStatus represents the current status of a live stream
type LiveStreamStatus struct {
	IsLive       bool       `json:"isLive"`
	Status       string     `json:"status"`
	ViewerCount  int64      `json:"viewerCount"`
	StartTime    *time.Time `json:"startTime,omitempty"`
	Duration     int64      `json:"duration"` // in seconds
	LastActivity time.Time  `json:"lastActivity"`
}

// PlayerInfo represents video player information
type PlayerInfo struct {
	VideoID      uuid.UUID      `json:"videoId"`
	Title        string         `json:"title"`
	Summary      string         `json:"summary,omitempty"`
	PlaybackURL  string         `json:"playbackUrl"`
	PlayerURL    string         `json:"playerUrl"`
	ThumbnailURL string         `json:"thumbnailUrl,omitempty"`
	Duration     *int           `json:"duration,omitempty"`
	Quality      string         `json:"quality"`
	IsLive       bool           `json:"isLive"`
	CanWatch     bool           `json:"canWatch"`
	RequireAuth  bool           `json:"requireAuth"`
	IsOpen       bool           `json:"isOpen"`
	Features     PlayerFeatures `json:"features"`
}

// PlayerFeatures represents available player features
type PlayerFeatures struct {
	EnableComments     bool `json:"enableComments"`
	EnableLikes        bool `json:"enableLikes"`
	EnableSharing      bool `json:"enableSharing"`
	AllowDownload      bool `json:"allowDownload"`
	SupportInteraction bool `json:"supportInteraction"`
}

// CloudVideoQRCodeInfo represents QR code information for cloud videos
type CloudVideoQRCodeInfo struct {
	QRCodeID  uuid.UUID  `json:"qrCodeId"`
	QRCodeURL string     `json:"qrCodeUrl"`
	SceneStr  string     `json:"sceneStr"`
	PlayerURL string     `json:"playerUrl"`
	ExpiresAt *time.Time `json:"expiresAt,omitempty"`
}

// VideoAnalytics represents video analytics data
type VideoAnalytics struct {
	VideoID               uuid.UUID                         `json:"videoId"`
	Period                string                            `json:"period"`
	StartDate             time.Time                         `json:"startDate"`
	EndDate               time.Time                         `json:"endDate"`
	TotalViews            int64                             `json:"totalViews"`
	UniqueViewers         int64                             `json:"uniqueViewers"`
	TotalWatchTime        int64                             `json:"totalWatchTime"`
	AverageWatchTime      float64                           `json:"averageWatchTime"`
	CompletionRate        float64                           `json:"completionRate"`
	EngagementRate        float64                           `json:"engagementRate"`
	TotalLikes            int64                             `json:"totalLikes"`
	TotalShares           int64                             `json:"totalShares"`
	TotalComments         int64                             `json:"totalComments"`
	PeakConcurrentViewers int64                             `json:"peakConcurrentViewers"`
	PeakTime              *time.Time                        `json:"peakTime,omitempty"`
	CountryDistribution   []entities.GeographicDistribution `json:"countryDistribution"`
	CityDistribution      []entities.GeographicDistribution `json:"cityDistribution"`
	DeviceDistribution    []entities.DeviceDistribution     `json:"deviceDistribution"`
	BrowserDistribution   []entities.BrowserDistribution    `json:"browserDistribution"`
	QualityDistribution   []entities.QualityDistribution    `json:"qualityDistribution"`
}

// VideoTimeline represents video timeline data
type VideoTimeline struct {
	VideoID               uuid.UUID        `json:"videoId"`
	StartTime             time.Time        `json:"startTime"`
	EndTime               time.Time        `json:"endTime"`
	UserCountsEveryMinute map[string]int64 `json:"userCountsEveryMinute"`
	PeakUserCount         int64            `json:"peakUserCount"`
	PeakTime              time.Time        `json:"peakTime"`
	IsCached              bool             `json:"isCached"`
}

// WeChatPlayerInfo represents WeChat-specific player information
type WeChatPlayerInfo struct {
	PlayerInfo
	WeChatShareConfig WeChatShareConfig `json:"weChatShareConfig"`
	QRCodeURL         string            `json:"qrCodeUrl,omitempty"`
}

// WeChatShareConfig represents WeChat sharing configuration
type WeChatShareConfig struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl,omitempty"`
	Link        string `json:"link"`
}

// SurveyResults represents survey results for a video
type SurveyResults struct {
	SurveyID       uuid.UUID `json:"surveyId"`
	VideoID        uuid.UUID `json:"videoId"`
	TotalResponses int64     `json:"totalResponses"`
	ResponseRate   float64   `json:"responseRate"`
	AverageRating  float64   `json:"averageRating,omitempty"`
	CompletionRate float64   `json:"completionRate"`
	LastUpdated    time.Time `json:"lastUpdated"`
}
