package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CloudVideoSession represents a user's cloud video watching session
type CloudVideoSession struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Video and user references
	CloudVideoID uuid.UUID   `gorm:"type:char(36);not null;index;column:CloudVideoId" json:"cloudVideoId"`
	CloudVideo   *CloudVideo `gorm:"foreignKey:CloudVideoID" json:"cloudVideo,omitempty"`

	// User information
	UserID    *uuid.UUID `gorm:"type:char(36);index;column:UserId" json:"userId"`                    // Null for anonymous users
	SessionID string     `gorm:"type:varchar(255);not null;index;column:SessionId" json:"sessionId"` // Browser session ID

	// Session timing
	StartTime    time.Time  `gorm:"default:CURRENT_TIMESTAMP;column:StartTime" json:"startTime"`
	EndTime      *time.Time `gorm:"column:EndTime" json:"endTime"`
	LastActivity time.Time  `gorm:"default:CURRENT_TIMESTAMP;column:LastActivity" json:"lastActivity"`

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
	Metadata string `gorm:"type:text;column:Metadata" json:"metadata"` // JSON for additional session data

	// WeChat integration
	WeChatOpenID  string `gorm:"type:varchar(255);column:WeChatOpenId" json:"weChatOpenId"`
	WeChatUnionID string `gorm:"type:varchar(255);column:WeChatUnionId" json:"weChatUnionId"`

	// Audit fields
	CreatedAt            time.Time `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt            time.Time `gorm:"column:LastModificationTime" json:"updatedAt"`
	LastModificationTime time.Time `gorm:"column:LastModificationTime" json:"lastModificationTime"`
}

// TableName returns the table name for GORM
func (CloudVideoSession) TableName() string {
	return "CloudVideoSessions"
}

// BeforeCreate sets the ID and timestamps before creating
func (cvs *CloudVideoSession) BeforeCreate(tx *gorm.DB) error {
	if cvs.ID == uuid.Nil {
		cvs.ID = uuid.New()
	}

	now := time.Now()
	cvs.CreatedAt = now
	cvs.UpdatedAt = now
	cvs.LastModificationTime = now
	cvs.StartTime = now
	cvs.LastActivity = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (cvs *CloudVideoSession) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	cvs.UpdatedAt = now
	cvs.LastModificationTime = now
	cvs.LastActivity = now
	return nil
}

// Business logic methods

// IsActive returns true if the session is currently active
func (cvs *CloudVideoSession) IsActive() bool {
	return cvs.EndTime == nil && time.Since(cvs.LastActivity) < 30*time.Minute
}

// GetDuration returns the total session duration
func (cvs *CloudVideoSession) GetDuration() time.Duration {
	if cvs.EndTime != nil {
		return cvs.EndTime.Sub(cvs.StartTime)
	}
	return cvs.LastActivity.Sub(cvs.StartTime)
}

// IsCompleted returns true if the session is marked as completed
func (cvs *CloudVideoSession) IsCompleted() bool {
	return cvs.Completed
}

// MarkCompleted marks the session as completed
func (cvs *CloudVideoSession) MarkCompleted() {
	cvs.Completed = true
	now := time.Now()
	cvs.CompletedAt = &now
}

// EndSession ends the session
func (cvs *CloudVideoSession) EndSession() {
	now := time.Now()
	cvs.EndTime = &now
}

// UpdatePosition updates the current playback position
func (cvs *CloudVideoSession) UpdatePosition(position int64, videoDuration int64) {
	cvs.CurrentPosition = position
	cvs.LastActivity = time.Now()

	// Calculate completion percentage
	if videoDuration > 0 {
		cvs.CompletionPercentage = (float64(position) / float64(videoDuration)) * 100
		if cvs.CompletionPercentage > 100 {
			cvs.CompletionPercentage = 100
		}

		// Mark as completed if watched more than 90%
		if cvs.CompletionPercentage >= 90 && !cvs.IsCompleted() {
			cvs.MarkCompleted()
		}
	}
}

// AddWatchTime adds watched duration to the session
func (cvs *CloudVideoSession) AddWatchTime(duration int64) {
	cvs.WatchedDuration += duration
	cvs.LastActivity = time.Now()
}

// IncrementPauseCount increments the pause count
func (cvs *CloudVideoSession) IncrementPauseCount() {
	cvs.PauseCount++
}

// IncrementSeekCount increments the seek count
func (cvs *CloudVideoSession) IncrementSeekCount() {
	cvs.SeekCount++
}

// IncrementReplayCount increments the replay count
func (cvs *CloudVideoSession) IncrementReplayCount() {
	cvs.ReplayCount++
}

// SetVolumeLevel sets the volume level
func (cvs *CloudVideoSession) SetVolumeLevel(level int) {
	if level >= 0 && level <= 100 {
		cvs.VolumeLevel = level
	}
}

// CalculateEngagementScore calculates engagement score based on various factors
func (cvs *CloudVideoSession) CalculateEngagementScore() float64 {
	// Base score from completion percentage (40%)
	completionScore := cvs.CompletionPercentage * 0.4

	// Interaction score (30%) - fewer pauses and seeks indicate better engagement
	interactionScore := 100.0
	if cvs.PauseCount > 0 {
		interactionScore -= float64(cvs.PauseCount) * 5 // Penalty for pauses
	}
	if cvs.SeekCount > 0 {
		interactionScore -= float64(cvs.SeekCount) * 3 // Penalty for seeks
	}
	if interactionScore < 0 {
		interactionScore = 0
	}
	interactionScore *= 0.3

	// Duration score (30%) - longer sessions indicate better engagement
	sessionDuration := cvs.GetDuration().Minutes()
	durationScore := sessionDuration / 60.0 * 100 // Normalize to 1 hour
	if durationScore > 100 {
		durationScore = 100
	}
	durationScore *= 0.3

	totalScore := completionScore + interactionScore + durationScore
	if totalScore > 100 {
		totalScore = 100
	}

	cvs.EngagementScore = totalScore
	return totalScore
}

// IsFromWeChat checks if the session came from WeChat
func (cvs *CloudVideoSession) IsFromWeChat() bool {
	return cvs.WeChatOpenID != "" || cvs.WeChatUnionID != ""
}

// GetDeviceInfo returns formatted device information
func (cvs *CloudVideoSession) GetDeviceInfo() string {
	if cvs.DeviceType != "" && cvs.OS != "" {
		return cvs.DeviceType + " (" + cvs.OS + ")"
	}
	if cvs.DeviceType != "" {
		return cvs.DeviceType
	}
	return "Unknown"
}

// GetLocationInfo returns formatted location information
func (cvs *CloudVideoSession) GetLocationInfo() string {
	if cvs.City != "" && cvs.Country != "" {
		return cvs.City + ", " + cvs.Country
	}
	if cvs.Country != "" {
		return cvs.Country
	}
	return "Unknown"
}
