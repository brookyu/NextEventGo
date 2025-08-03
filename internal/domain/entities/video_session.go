package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// VideoSessionStatus represents the status of a video session
type VideoSessionStatus string

const (
	VideoSessionStatusActive    VideoSessionStatus = "active"
	VideoSessionStatusPaused    VideoSessionStatus = "paused"
	VideoSessionStatusCompleted VideoSessionStatus = "completed"
	VideoSessionStatusAbandoned VideoSessionStatus = "abandoned"
)

// VideoSession represents a user's video watching session
type VideoSession struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Video reference
	VideoID uuid.UUID `gorm:"type:char(36);not null;index;column:VideoId" json:"videoId"`
	Video   *Video    `gorm:"foreignKey:VideoID" json:"video,omitempty"`

	// User information
	UserID    *uuid.UUID `gorm:"type:char(36);index;column:UserId" json:"userId"`                    // Null for anonymous users
	SessionID string     `gorm:"type:varchar(255);not null;index;column:SessionId" json:"sessionId"` // Browser session ID

	// Session details
	Status       VideoSessionStatus `gorm:"type:varchar(20);not null;default:'active';column:Status" json:"status"`
	StartTime    time.Time          `gorm:"not null;column:StartTime" json:"startTime"`
	EndTime      *time.Time         `gorm:"column:EndTime" json:"endTime"`
	LastActivity time.Time          `gorm:"not null;column:LastActivity" json:"lastActivity"`

	// Playback tracking
	CurrentPosition int64   `gorm:"default:0;column:CurrentPosition" json:"currentPosition"` // Current position in seconds
	WatchedDuration int64   `gorm:"default:0;column:WatchedDuration" json:"watchedDuration"` // Total watched duration in seconds
	PlaybackSpeed   float64 `gorm:"default:1.0;column:PlaybackSpeed" json:"playbackSpeed"`   // Playback speed (1.0 = normal)
	Quality         string  `gorm:"type:varchar(10);column:Quality" json:"quality"`          // Video quality watched

	// Completion tracking
	CompletionPercentage float64    `gorm:"default:0;column:CompletionPercentage" json:"completionPercentage"` // 0-100
	Completed            bool       `gorm:"default:false;column:IsCompleted" json:"isCompleted"`
	CompletedAt          *time.Time `gorm:"column:CompletedAt" json:"completedAt"`

	// Interaction tracking
	PauseCount  int `gorm:"default:0;column:PauseCount" json:"pauseCount"`     // Number of times paused
	SeekCount   int `gorm:"default:0;column:SeekCount" json:"seekCount"`       // Number of times seeked
	ReplayCount int `gorm:"default:0;column:ReplayCount" json:"replayCount"`   // Number of times replayed
	VolumeLevel int `gorm:"default:100;column:VolumeLevel" json:"volumeLevel"` // Volume level (0-100)

	// Device and environment
	IPAddress  string `gorm:"type:varchar(45);column:IpAddress" json:"ipAddress"`
	UserAgent  string `gorm:"type:text;column:UserAgent" json:"userAgent"`
	DeviceType string `gorm:"type:varchar(50);column:DeviceType" json:"deviceType"` // mobile, tablet, desktop
	Browser    string `gorm:"type:varchar(100);column:Browser" json:"browser"`
	OS         string `gorm:"type:varchar(100);column:Os" json:"os"`
	ScreenSize string `gorm:"type:varchar(20);column:ScreenSize" json:"screenSize"` // e.g., "1920x1080"
	Bandwidth  string `gorm:"type:varchar(20);column:Bandwidth" json:"bandwidth"`   // Estimated bandwidth

	// Geographic information
	Country  string `gorm:"type:varchar(100);column:Country" json:"country"`
	Region   string `gorm:"type:varchar(100);column:Region" json:"region"`
	City     string `gorm:"type:varchar(100);column:City" json:"city"`
	Timezone string `gorm:"type:varchar(50);column:Timezone" json:"timezone"`

	// Engagement metrics
	EngagementScore float64 `gorm:"default:0;column:EngagementScore" json:"engagementScore"`
	AttentionSpan   float64 `gorm:"default:0;column:AttentionSpan" json:"attentionSpan"` // Average continuous watch time

	// Additional metadata
	Referrer string `gorm:"type:varchar(1000);column:Referrer" json:"referrer"`
	Metadata string `gorm:"type:jsonb;column:Metadata" json:"metadata"` // Additional session data

	// Audit fields (ABP Framework compatible)
	CreatedAt time.Time      `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:LastModificationTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:DeletionTime" json:"deletedAt,omitempty"`
	IsDeleted bool           `gorm:"default:false;index;column:IsDeleted" json:"isDeleted"`
}

// TableName returns the table name for GORM
func (VideoSession) TableName() string {
	return "VideoSessions"
}

// BeforeCreate sets the ID and timestamps before creating
func (vs *VideoSession) BeforeCreate(tx *gorm.DB) error {
	if vs.ID == uuid.Nil {
		vs.ID = uuid.New()
	}

	now := time.Now()
	vs.CreatedAt = now
	vs.UpdatedAt = now

	// Set start time if not provided
	if vs.StartTime.IsZero() {
		vs.StartTime = now
	}

	// Set last activity
	vs.LastActivity = now

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (vs *VideoSession) BeforeUpdate(tx *gorm.DB) error {
	vs.UpdatedAt = time.Now()
	vs.LastActivity = time.Now()
	return nil
}

// Business logic methods

// IsActive returns true if the session is currently active
func (vs *VideoSession) IsActive() bool {
	return vs.Status == VideoSessionStatusActive && vs.EndTime == nil
}

// IsPaused returns true if the session is paused
func (vs *VideoSession) IsPaused() bool {
	return vs.Status == VideoSessionStatusPaused
}

// IsCompleted returns true if the session is completed
func (vs *VideoSession) IsCompleted() bool {
	return vs.Status == VideoSessionStatusCompleted || vs.Completed
}

// GetDuration returns the total session duration
func (vs *VideoSession) GetDuration() time.Duration {
	if vs.EndTime != nil {
		return vs.EndTime.Sub(vs.StartTime)
	}
	return time.Since(vs.StartTime)
}

// GetWatchedPercentage returns the percentage of video watched
func (vs *VideoSession) GetWatchedPercentage() float64 {
	return vs.CompletionPercentage
}

// UpdatePosition updates the current playback position
func (vs *VideoSession) UpdatePosition(position int64, videoDuration int64) {
	vs.CurrentPosition = position
	vs.LastActivity = time.Now()

	// Calculate completion percentage
	if videoDuration > 0 {
		vs.CompletionPercentage = (float64(position) / float64(videoDuration)) * 100
		if vs.CompletionPercentage > 100 {
			vs.CompletionPercentage = 100
		}

		// Mark as completed if watched more than 90%
		if vs.CompletionPercentage >= 90 && !vs.IsCompleted() {
			vs.MarkCompleted()
		}
	}
}

// AddWatchTime adds watched duration to the session
func (vs *VideoSession) AddWatchTime(duration int64) {
	vs.WatchedDuration += duration
	vs.LastActivity = time.Now()
}

// Pause pauses the video session
func (vs *VideoSession) Pause() {
	vs.Status = VideoSessionStatusPaused
	vs.PauseCount++
	vs.LastActivity = time.Now()
}

// Resume resumes the video session
func (vs *VideoSession) Resume() {
	vs.Status = VideoSessionStatusActive
	vs.LastActivity = time.Now()
}

// Seek records a seek operation
func (vs *VideoSession) Seek(newPosition int64) {
	vs.CurrentPosition = newPosition
	vs.SeekCount++
	vs.LastActivity = time.Now()
}

// Replay records a replay operation
func (vs *VideoSession) Replay() {
	vs.ReplayCount++
	vs.CurrentPosition = 0
	vs.LastActivity = time.Now()
}

// MarkCompleted marks the session as completed
func (vs *VideoSession) MarkCompleted() {
	vs.Status = VideoSessionStatusCompleted
	vs.Completed = true
	now := time.Now()
	vs.CompletedAt = &now
	vs.LastActivity = now

	if vs.EndTime == nil {
		vs.EndTime = &now
	}
}

// MarkAbandoned marks the session as abandoned
func (vs *VideoSession) MarkAbandoned() {
	vs.Status = VideoSessionStatusAbandoned
	now := time.Now()
	vs.LastActivity = now

	if vs.EndTime == nil {
		vs.EndTime = &now
	}
}

// CalculateEngagementScore calculates the engagement score for the session
func (vs *VideoSession) CalculateEngagementScore() {
	// Simple engagement score calculation
	// Factors: completion percentage, pause frequency, seek frequency, watch time ratio

	score := 0.0

	// Completion percentage (40% weight)
	score += vs.CompletionPercentage * 0.4

	// Low pause frequency is better (20% weight)
	if vs.WatchedDuration > 0 {
		pauseRate := float64(vs.PauseCount) / (float64(vs.WatchedDuration) / 60) // pauses per minute
		pauseScore := 100 - (pauseRate * 10)                                     // Penalize frequent pauses
		if pauseScore < 0 {
			pauseScore = 0
		}
		score += pauseScore * 0.2
	}

	// Low seek frequency is better (20% weight)
	if vs.WatchedDuration > 0 {
		seekRate := float64(vs.SeekCount) / (float64(vs.WatchedDuration) / 60) // seeks per minute
		seekScore := 100 - (seekRate * 5)                                      // Penalize frequent seeks
		if seekScore < 0 {
			seekScore = 0
		}
		score += seekScore * 0.2
	}

	// Watch time ratio (20% weight)
	sessionDuration := vs.GetDuration().Seconds()
	if sessionDuration > 0 {
		watchRatio := float64(vs.WatchedDuration) / sessionDuration
		if watchRatio > 1 {
			watchRatio = 1 // Cap at 100%
		}
		score += watchRatio * 100 * 0.2
	}

	vs.EngagementScore = score
}

// CalculateAttentionSpan calculates the average continuous watch time
func (vs *VideoSession) CalculateAttentionSpan() {
	if vs.PauseCount == 0 {
		vs.AttentionSpan = float64(vs.WatchedDuration)
	} else {
		vs.AttentionSpan = float64(vs.WatchedDuration) / float64(vs.PauseCount+1)
	}
}

// IsAnonymous returns true if this is an anonymous session
func (vs *VideoSession) IsAnonymous() bool {
	return vs.UserID == nil
}

// GetDeviceInfo returns formatted device information
func (vs *VideoSession) GetDeviceInfo() string {
	if vs.DeviceType != "" && vs.OS != "" {
		return vs.DeviceType + " (" + vs.OS + ")"
	}
	if vs.DeviceType != "" {
		return vs.DeviceType
	}
	if vs.OS != "" {
		return vs.OS
	}
	return "Unknown"
}

// GetLocation returns formatted location information
func (vs *VideoSession) GetLocation() string {
	if vs.City != "" && vs.Country != "" {
		return vs.City + ", " + vs.Country
	}
	if vs.Country != "" {
		return vs.Country
	}
	return "Unknown"
}
