package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CloudVideoType represents the type of cloud video
type CloudVideoType string

const (
	CloudVideoTypeLive     CloudVideoType = "live"
	CloudVideoTypeOnDemand CloudVideoType = "on_demand"
	CloudVideoTypeUploaded CloudVideoType = "uploaded"
)

// CloudVideoStatus represents the status of a cloud video
type CloudVideoStatus string

const (
	CloudVideoStatusDraft     CloudVideoStatus = "draft"
	CloudVideoStatusScheduled CloudVideoStatus = "scheduled"
	CloudVideoStatusLive      CloudVideoStatus = "live"
	CloudVideoStatusEnded     CloudVideoStatus = "ended"
	CloudVideoStatusArchived  CloudVideoStatus = "archived"
)

// CloudVideoQuality represents video quality options
type CloudVideoQuality string

const (
	CloudVideoQualityAuto  CloudVideoQuality = "auto"
	CloudVideoQuality720p  CloudVideoQuality = "720p"
	CloudVideoQuality1080p CloudVideoQuality = "1080p"
	CloudVideoQuality4K    CloudVideoQuality = "4k"
)

// CloudVideo represents a cloud video entity (compatible with .NET CloudVideo and enhanced database schema)
type CloudVideo struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Basic content information
	Title   string `gorm:"type:varchar(500);not null;column:Title" json:"title"`
	Summary string `gorm:"type:text;column:Summary" json:"summary"`

	// Video configuration
	VideoType CloudVideoType   `gorm:"type:varchar(20);not null;default:'on_demand';column:VideoType" json:"videoType"`
	Status    CloudVideoStatus `gorm:"type:varchar(20);not null;default:'draft';column:Status" json:"status"`

	// Streaming and playback
	CloudUrl    string            `gorm:"type:varchar(1000);column:CloudUrl" json:"cloudUrl"`
	StreamKey   string            `gorm:"type:varchar(255);column:StreamKey" json:"streamKey"`
	PlaybackUrl string            `gorm:"type:varchar(1000);column:PlaybackUrl" json:"playbackUrl"`
	Quality     CloudVideoQuality `gorm:"type:varchar(10);default:'auto';column:Quality" json:"quality"`
	Duration    *int              `gorm:"column:Duration" json:"duration"` // in seconds

	// Access control and features
	IsOpen             bool `gorm:"default:true;column:IsOpen" json:"isOpen"`
	RequireAuth        bool `gorm:"default:false;column:RequireAuth" json:"requireAuth"`
	SupportInteraction bool `gorm:"default:false;column:SupportInteraction" json:"supportInteraction"`
	AllowDownload      bool `gorm:"default:false;column:AllowDownload" json:"allowDownload"`

	// Media relations (Foreign Keys to SiteImages table)
	SiteImageID    *uuid.UUID `gorm:"type:char(36);column:SiteImageId" json:"siteImageId"`       // Cover image
	PromotionPicID *uuid.UUID `gorm:"type:char(36);column:PromotionPicId" json:"promotionPicId"` // Promotion image
	ThumbnailID    *uuid.UUID `gorm:"type:char(36);column:ThumbnailId" json:"thumbnailId"`       // Thumbnail

	// Content integration (Foreign Keys)
	IntroArticleID   *uuid.UUID `gorm:"type:char(36);column:IntroArticleId" json:"introArticleId"`     // Introduction article
	NotOpenArticleID *uuid.UUID `gorm:"type:char(36);column:NotOpenArticleId" json:"notOpenArticleId"` // Article shown when not open

	// Survey integration
	SurveyID *uuid.UUID `gorm:"type:char(36);column:SurveyId" json:"surveyId"` // Associated survey

	// Upload integration
	UploadID *uuid.UUID `gorm:"type:char(36);column:UploadId" json:"uploadId"` // Original upload reference

	// Event association
	BoundEventID *uuid.UUID `gorm:"type:char(36);column:BoundEventId" json:"boundEventId"` // Associated event

	// Scheduling
	StartTime    *time.Time `gorm:"column:StartTime" json:"startTime"`       // Live stream start time
	VideoEndTime *time.Time `gorm:"column:VideoEndTime" json:"videoEndTime"` // Live stream end time

	// Organization
	CategoryID *uuid.UUID `gorm:"type:char(36);column:CategoryId" json:"categoryId"` // Video category

	// Analytics and engagement
	ViewCount    int64 `gorm:"default:0;column:ViewCount" json:"viewCount"`
	LikeCount    int64 `gorm:"default:0;column:LikeCount" json:"likeCount"`
	ShareCount   int64 `gorm:"default:0;column:ShareCount" json:"shareCount"`
	CommentCount int64 `gorm:"default:0;column:CommentCount" json:"commentCount"`
	WatchTime    int64 `gorm:"default:0;column:WatchTime" json:"watchTime"` // Total watch time in seconds

	// SEO and metadata
	MetaTitle       string `gorm:"type:varchar(500);column:MetaTitle" json:"metaTitle"`
	MetaDescription string `gorm:"type:varchar(1000);column:MetaDescription" json:"metaDescription"`
	Keywords        string `gorm:"type:varchar(1000);column:Keywords" json:"keywords"`

	// Feature toggles
	EnableComments  bool `gorm:"default:true;column:EnableComments" json:"enableComments"`
	EnableLikes     bool `gorm:"default:true;column:EnableLikes" json:"enableLikes"`
	EnableSharing   bool `gorm:"default:true;column:EnableSharing" json:"enableSharing"`
	EnableAnalytics bool `gorm:"default:true;column:EnableAnalytics" json:"enableAnalytics"`

	// Soft delete and audit fields (ABP Framework compatible)
	IsDeleted bool           `gorm:"default:false;index;column:IsDeleted" json:"isDeleted"`
	CreatedAt time.Time      `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:LastModificationTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index;column:CreatorId" json:"createdBy"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index;column:LastModifierId" json:"updatedBy"`
	DeletedBy *uuid.UUID     `gorm:"type:char(36);index;column:DeleterId" json:"deletedBy"`

	// Relationships
	SiteImage      *SiteImage     `gorm:"foreignKey:SiteImageID" json:"siteImage,omitempty"`
	PromotionPic   *SiteImage     `gorm:"foreignKey:PromotionPicID" json:"promotionPic,omitempty"`
	Thumbnail      *SiteImage     `gorm:"foreignKey:ThumbnailID" json:"thumbnail,omitempty"`
	IntroArticle   *SiteArticle   `gorm:"foreignKey:IntroArticleID" json:"introArticle,omitempty"`
	NotOpenArticle *SiteArticle   `gorm:"foreignKey:NotOpenArticleID" json:"notOpenArticle,omitempty"`
	Survey         *Survey        `gorm:"foreignKey:SurveyID" json:"survey,omitempty"`
	BoundEvent     *SiteEvent     `gorm:"foreignKey:BoundEventID" json:"boundEvent,omitempty"`
	Category       *VideoCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`

	// Analytics relationships
	Sessions  []CloudVideoSession  `gorm:"foreignKey:CloudVideoID" json:"sessions,omitempty"`
	Analytics []CloudVideoAnalytic `gorm:"foreignKey:CloudVideoID" json:"analytics,omitempty"`
	QRCodes   []WeChatQrCode       `gorm:"foreignKey:ResourceID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"qrCodes,omitempty"`
}

// TableName returns the table name for GORM
func (CloudVideo) TableName() string {
	return "CloudVideos"
}

// BeforeCreate sets the ID and timestamps before creating
func (cv *CloudVideo) BeforeCreate(tx *gorm.DB) error {
	if cv.ID == uuid.Nil {
		cv.ID = uuid.New()
	}

	now := time.Now()
	cv.CreatedAt = now
	cv.UpdatedAt = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (cv *CloudVideo) BeforeUpdate(tx *gorm.DB) error {
	cv.UpdatedAt = time.Now()
	return nil
}

// Business logic methods

// IsLive returns true if the video is currently live
func (cv *CloudVideo) IsLive() bool {
	return cv.Status == CloudVideoStatusLive && cv.VideoType == CloudVideoTypeLive
}

// CanWatch returns true if the video can be watched
func (cv *CloudVideo) CanWatch() bool {
	if cv.IsDeleted {
		return false
	}

	switch cv.Status {
	case CloudVideoStatusLive, CloudVideoStatusEnded:
		return true
	case CloudVideoStatusScheduled:
		return cv.StartTime != nil && time.Now().After(*cv.StartTime)
	default:
		return false
	}
}

// IsScheduled returns true if the video is scheduled for future
func (cv *CloudVideo) IsScheduled() bool {
	return cv.Status == CloudVideoStatusScheduled && cv.StartTime != nil && time.Now().Before(*cv.StartTime)
}

// CanEdit returns true if the video can be edited
func (cv *CloudVideo) CanEdit() bool {
	return !cv.IsDeleted && cv.Status != CloudVideoStatusLive
}

// GetEngagementRate calculates engagement rate based on views and interactions
func (cv *CloudVideo) GetEngagementRate() float64 {
	if cv.ViewCount == 0 {
		return 0
	}

	totalEngagements := cv.LikeCount + cv.ShareCount + cv.CommentCount
	return (float64(totalEngagements) / float64(cv.ViewCount)) * 100
}

// GetAverageWatchTime calculates average watch time per view
func (cv *CloudVideo) GetAverageWatchTime() float64 {
	if cv.ViewCount == 0 {
		return 0
	}

	return float64(cv.WatchTime) / float64(cv.ViewCount)
}

// GetCompletionRate calculates completion rate if duration is available
func (cv *CloudVideo) GetCompletionRate() float64 {
	if cv.Duration == nil || *cv.Duration == 0 || cv.ViewCount == 0 {
		return 0
	}

	expectedTotalWatchTime := int64(*cv.Duration) * cv.ViewCount
	if expectedTotalWatchTime == 0 {
		return 0
	}

	return (float64(cv.WatchTime) / float64(expectedTotalWatchTime)) * 100
}

// IsInteractive returns true if the video supports interaction
func (cv *CloudVideo) IsInteractive() bool {
	return cv.SupportInteraction && cv.EnableComments
}

// HasSurvey returns true if the video has an associated survey
func (cv *CloudVideo) HasSurvey() bool {
	return cv.SurveyID != nil
}

// HasEvent returns true if the video is bound to an event
func (cv *CloudVideo) HasEvent() bool {
	return cv.BoundEventID != nil
}

// GetPlayerURL generates the appropriate player URL based on device type
func (cv *CloudVideo) GetPlayerURL(baseURL string, deviceType string) string {
	switch deviceType {
	case "mobile":
		return baseURL + "/cloudvideo/wechatplayer/" + cv.ID.String()
	case "pc":
		return baseURL + "/cloudvideo/pclanding/" + cv.ID.String()
	case "newplayer":
		return baseURL + "/cloudvideo/newplayer?videoid=" + cv.ID.String()
	case "newpc":
		return baseURL + "/cloudvideo/newpclanding/" + cv.ID.String()
	default:
		return baseURL + "/cloudvideo/player/" + cv.ID.String()
	}
}

// IncrementViewCount safely increments the view count
func (cv *CloudVideo) IncrementViewCount() {
	cv.ViewCount++
}

// IncrementLikeCount safely increments the like count
func (cv *CloudVideo) IncrementLikeCount() {
	cv.LikeCount++
}

// IncrementShareCount safely increments the share count
func (cv *CloudVideo) IncrementShareCount() {
	cv.ShareCount++
}

// IncrementCommentCount safely increments the comment count
func (cv *CloudVideo) IncrementCommentCount() {
	cv.CommentCount++
}

// AddWatchTime adds watch time to the total
func (cv *CloudVideo) AddWatchTime(seconds int64) {
	cv.WatchTime += seconds
}
