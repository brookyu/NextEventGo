package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ArticleTracking represents user interaction tracking for articles
type ArticleTracking struct {
	ID        uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	ArticleID uuid.UUID `gorm:"type:char(36);not null;column:ArticleId;index" json:"articleId"`
	UserID    *uuid.UUID `gorm:"type:char(36);column:UserId;index" json:"userId"` // null for anonymous
	SessionID string    `gorm:"type:varchar(255);not null;column:SessionId;index" json:"sessionId"`
	
	// Tracking data
	IPAddress     string    `gorm:"type:varchar(45);column:IpAddress" json:"ipAddress"`
	UserAgent     string    `gorm:"type:text;column:UserAgent" json:"userAgent"`
	Referrer      string    `gorm:"type:varchar(500);column:Referrer" json:"referrer"`
	PromoterCode  string    `gorm:"type:varchar(100);column:PromoterCode" json:"promoterCode"`
	
	// Reading behavior
	ReadStartTime   time.Time  `gorm:"type:datetime(6);column:ReadStartTime" json:"readStartTime"`
	ReadEndTime     *time.Time `gorm:"type:datetime(6);column:ReadEndTime" json:"readEndTime"`
	ReadDuration    int64      `gorm:"default:0;column:ReadDuration" json:"readDuration"` // in seconds
	ScrollDepth     float64    `gorm:"default:0;column:ScrollDepth" json:"scrollDepth"`   // percentage
	ReadPercentage  float64    `gorm:"default:0;column:ReadPercentage" json:"readPercentage"` // estimated reading completion
	
	// Engagement
	IsCompleted     bool      `gorm:"default:false;column:IsCompleted" json:"isCompleted"`
	ShareCount      int       `gorm:"default:0;column:ShareCount" json:"shareCount"`
	LikeCount       int       `gorm:"default:0;column:LikeCount" json:"likeCount"`
	CommentCount    int       `gorm:"default:0;column:CommentCount" json:"commentCount"`
	
	// Device and location
	DeviceType      string    `gorm:"type:varchar(50);column:DeviceType" json:"deviceType"`
	Browser         string    `gorm:"type:varchar(100);column:Browser" json:"browser"`
	OS              string    `gorm:"type:varchar(100);column:OS" json:"os"`
	Country         string    `gorm:"type:varchar(100);column:Country" json:"country"`
	City            string    `gorm:"type:varchar(100);column:City" json:"city"`
	
	// Audit fields
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	
	// Relationships
	Article *Article `gorm:"foreignKey:ArticleID" json:"article,omitempty"`
	User    *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName returns the table name for GORM
func (ArticleTracking) TableName() string {
	return "ArticleTrackings"
}

// BeforeCreate sets the ID and timestamps before creating
func (at *ArticleTracking) BeforeCreate(tx *gorm.DB) error {
	if at.ID == uuid.Nil {
		at.ID = uuid.New()
	}
	now := time.Now()
	at.CreatedAt = now
	at.UpdatedAt = &now
	
	// Set read start time if not provided
	if at.ReadStartTime.IsZero() {
		at.ReadStartTime = now
	}
	
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (at *ArticleTracking) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	at.UpdatedAt = &now
	return nil
}

// Domain methods
func (at *ArticleTracking) StartReading() {
	at.ReadStartTime = time.Now()
}

func (at *ArticleTracking) EndReading() {
	now := time.Now()
	at.ReadEndTime = &now
	at.ReadDuration = int64(now.Sub(at.ReadStartTime).Seconds())
}

func (at *ArticleTracking) UpdateScrollDepth(depth float64) {
	if depth > at.ScrollDepth {
		at.ScrollDepth = depth
	}
}

func (at *ArticleTracking) UpdateReadPercentage(percentage float64) {
	if percentage > at.ReadPercentage {
		at.ReadPercentage = percentage
	}
	
	// Mark as completed if read more than 80%
	if percentage >= 80.0 {
		at.IsCompleted = true
	}
}

func (at *ArticleTracking) IncrementShare() {
	at.ShareCount++
}

func (at *ArticleTracking) IncrementLike() {
	at.LikeCount++
}

func (at *ArticleTracking) IncrementComment() {
	at.CommentCount++
}

func (at *ArticleTracking) GetEngagementScore() float64 {
	// Calculate engagement score based on various factors
	score := 0.0
	
	// Reading completion (40% weight)
	score += at.ReadPercentage * 0.4
	
	// Scroll depth (20% weight)
	score += at.ScrollDepth * 0.2
	
	// Time spent (20% weight)
	if at.ReadDuration > 0 {
		// Normalize to 0-100 scale (assuming 5 minutes is max good reading time)
		timeScore := float64(at.ReadDuration) / 300.0 * 100
		if timeScore > 100 {
			timeScore = 100
		}
		score += timeScore * 0.2
	}
	
	// Social engagement (20% weight)
	socialScore := float64(at.ShareCount*3 + at.LikeCount + at.CommentCount*2)
	if socialScore > 100 {
		socialScore = 100
	}
	score += socialScore * 0.2
	
	return score
}

func (at *ArticleTracking) IsAnonymous() bool {
	return at.UserID == nil
}

func (at *ArticleTracking) HasPromoter() bool {
	return at.PromoterCode != ""
}
