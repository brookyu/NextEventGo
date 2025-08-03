package entities

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// VideoType represents the type of video
type VideoType string

const (
	VideoTypeLive      VideoType = "live"
	VideoTypeOnDemand  VideoType = "on_demand"
	VideoTypeRecorded  VideoType = "recorded"
	VideoTypeStreaming VideoType = "streaming"
)

// VideoStatus represents the status of a video
type VideoStatus string

const (
	VideoStatusDraft     VideoStatus = "draft"
	VideoStatusScheduled VideoStatus = "scheduled"
	VideoStatusLive      VideoStatus = "live"
	VideoStatusEnded     VideoStatus = "ended"
	VideoStatusArchived  VideoStatus = "archived"
	VideoStatusDeleted   VideoStatus = "deleted"
)

// VideoQuality represents video quality settings
type VideoQuality string

const (
	VideoQualityAuto  VideoQuality = "auto"
	VideoQuality360p  VideoQuality = "360p"
	VideoQuality480p  VideoQuality = "480p"
	VideoQuality720p  VideoQuality = "720p"
	VideoQuality1080p VideoQuality = "1080p"
	VideoQuality4K    VideoQuality = "4k"
)

// Video represents a video entity (compatible with CloudVideo from .NET)
type Video struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Basic information
	Title   string `gorm:"type:varchar(500);not null;column:Title" json:"title"`
	Summary string `gorm:"type:text;column:Summary" json:"summary"`

	// Video configuration
	VideoType VideoType   `gorm:"type:varchar(20);not null;default:'on_demand';column:VideoType" json:"videoType"`
	Status    VideoStatus `gorm:"type:varchar(20);not null;default:'draft';column:Status" json:"status"`

	// Streaming and playback
	CloudUrl    string       `gorm:"type:varchar(1000);column:CloudUrl" json:"cloudUrl"`
	StreamKey   string       `gorm:"type:varchar(255);column:StreamKey" json:"streamKey"`
	PlaybackUrl string       `gorm:"type:varchar(1000);column:PlaybackUrl" json:"playbackUrl"`
	Quality     VideoQuality `gorm:"type:varchar(10);default:'auto';column:Quality" json:"quality"`
	Duration    *int         `gorm:"column:Duration" json:"duration"` // in seconds

	// Access control
	IsOpen             bool `gorm:"default:true;column:IsOpen" json:"isOpen"`
	RequireAuth        bool `gorm:"default:false;column:RequireAuth" json:"requireAuth"`
	SupportInteraction bool `gorm:"default:false;column:SupportInteraction" json:"supportInteraction"`
	AllowDownload      bool `gorm:"default:false;column:AllowDownload" json:"allowDownload"`

	// Media relations
	SiteImageID    *uuid.UUID `gorm:"type:char(36);column:SiteImageId" json:"siteImageId"`       // Cover image
	PromotionPicID *uuid.UUID `gorm:"type:char(36);column:PromotionPicId" json:"promotionPicId"` // Promotion image
	ThumbnailID    *uuid.UUID `gorm:"type:char(36);column:ThumbnailId" json:"thumbnailId"`       // Thumbnail

	// Content integration
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

	// Engagement metrics
	AverageWatchTime float64 `gorm:"default:0;column:AverageWatchTime" json:"averageWatchTime"`
	CompletionRate   float64 `gorm:"default:0;column:CompletionRate" json:"completionRate"`
	EngagementScore  float64 `gorm:"default:0;column:EngagementScore" json:"engagementScore"`

	// Technical metadata
	FileSize   *int64  `gorm:"column:FileSize" json:"fileSize"`                      // File size in bytes
	Resolution string  `gorm:"type:varchar(20);column:Resolution" json:"resolution"` // e.g., "1920x1080"
	FrameRate  float64 `gorm:"column:FrameRate" json:"frameRate"`                    // Frames per second
	Bitrate    *int    `gorm:"column:Bitrate" json:"bitrate"`                        // Bitrate in kbps
	Codec      string  `gorm:"type:varchar(50);column:Codec" json:"codec"`

	// SEO and metadata
	Slug            string `gorm:"type:varchar(500);unique;column:Slug" json:"slug"`
	MetaTitle       string `gorm:"type:varchar(500);column:MetaTitle" json:"metaTitle"`
	MetaDescription string `gorm:"type:varchar(1000);column:MetaDescription" json:"metaDescription"`
	Keywords        string `gorm:"type:varchar(1000);column:Keywords" json:"keywords"`
	Tags            string `gorm:"type:varchar(1000);column:Tags" json:"tags"`

	// WeChat integration
	WeChatMediaID string `gorm:"type:varchar(255);column:WeChatMediaId" json:"wechatMediaId"`
	WeChatURL     string `gorm:"type:varchar(1000);column:WeChatUrl" json:"wechatUrl"`

	// Audit fields (ABP Framework compatible)
	CreatedAt time.Time      `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:LastModificationTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index;column:CreatorId" json:"createdBy"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index;column:LastModifierId" json:"updatedBy"`
	DeletedBy *uuid.UUID     `gorm:"type:char(36);index;column:DeleterId" json:"deletedBy"`
	IsDeleted bool           `gorm:"default:false;index;column:IsDeleted" json:"isDeleted"`

	// Relationships
	SiteImage      *SiteImage     `gorm:"foreignKey:SiteImageID" json:"siteImage,omitempty"`
	PromotionPic   *SiteImage     `gorm:"foreignKey:PromotionPicID" json:"promotionPic,omitempty"`
	Thumbnail      *SiteImage     `gorm:"foreignKey:ThumbnailID" json:"thumbnail,omitempty"`
	IntroArticle   *SiteArticle   `gorm:"foreignKey:IntroArticleID" json:"introArticle,omitempty"`
	NotOpenArticle *SiteArticle   `gorm:"foreignKey:NotOpenArticleID" json:"notOpenArticle,omitempty"`
	Survey         *Survey        `gorm:"foreignKey:SurveyID" json:"survey,omitempty"`
	BoundEvent     *SiteEvent     `gorm:"foreignKey:BoundEventID" json:"boundEvent,omitempty"`
	Category       *VideoCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Sessions       []VideoSession `gorm:"foreignKey:VideoID" json:"sessions,omitempty"`
}

// TableName returns the table name for GORM (compatible with .NET CloudVideos table)
func (Video) TableName() string {
	return "CloudVideos"
}

// BeforeCreate sets the ID and timestamps before creating
func (v *Video) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}

	// Generate slug if not provided
	if v.Slug == "" {
		v.Slug = generateVideoSlug(v.Title)
	}

	now := time.Now()
	v.CreatedAt = now
	v.UpdatedAt = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (v *Video) BeforeUpdate(tx *gorm.DB) error {
	v.UpdatedAt = time.Now()
	return nil
}

// Business logic methods

// IsLive returns true if the video is currently live
func (v *Video) IsLive() bool {
	return v.Status == VideoStatusLive && v.VideoType == VideoTypeLive
}

// CanWatch returns true if the video can be watched
func (v *Video) CanWatch() bool {
	if v.IsDeleted {
		return false
	}

	switch v.Status {
	case VideoStatusLive, VideoStatusEnded:
		return true
	case VideoStatusScheduled:
		return v.StartTime != nil && time.Now().After(*v.StartTime)
	default:
		return false
	}
}

// IsScheduled returns true if the video is scheduled for future
func (v *Video) IsScheduled() bool {
	return v.Status == VideoStatusScheduled && v.StartTime != nil && time.Now().Before(*v.StartTime)
}

// CanEdit returns true if the video can be edited
func (v *Video) CanEdit() bool {
	return !v.IsDeleted && (v.Status == VideoStatusDraft || v.Status == VideoStatusScheduled)
}

// Start starts a live video
func (v *Video) Start() error {
	if v.VideoType != VideoTypeLive {
		return ErrNotLiveVideo
	}

	if v.Status != VideoStatusScheduled && v.Status != VideoStatusDraft {
		return ErrInvalidVideoStatus
	}

	v.Status = VideoStatusLive
	now := time.Now()
	if v.StartTime == nil {
		v.StartTime = &now
	}

	return nil
}

// End ends a live video
func (v *Video) End() error {
	if v.Status != VideoStatusLive {
		return ErrVideoNotLive
	}

	v.Status = VideoStatusEnded
	now := time.Now()
	v.VideoEndTime = &now

	return nil
}

// Archive archives the video
func (v *Video) Archive() {
	v.Status = VideoStatusArchived
}

// GetPlaybackURL returns the appropriate playback URL
func (v *Video) GetPlaybackURL() string {
	if v.PlaybackUrl != "" {
		return v.PlaybackUrl
	}
	return v.CloudUrl
}

// GetThumbnailURL returns the thumbnail URL
func (v *Video) GetThumbnailURL() string {
	if v.Thumbnail != nil {
		return v.Thumbnail.GetURL()
	}
	if v.SiteImage != nil {
		return v.SiteImage.GetURL()
	}
	return ""
}

// IncrementView increments the view count
func (v *Video) IncrementView() {
	v.ViewCount++
}

// IncrementLike increments the like count
func (v *Video) IncrementLike() {
	v.LikeCount++
}

// IncrementShare increments the share count
func (v *Video) IncrementShare() {
	v.ShareCount++
}

// AddWatchTime adds watch time to the video
func (v *Video) AddWatchTime(seconds int64) {
	v.WatchTime += seconds

	// Recalculate average watch time
	if v.ViewCount > 0 {
		v.AverageWatchTime = float64(v.WatchTime) / float64(v.ViewCount)
	}

	// Calculate completion rate if duration is known
	if v.Duration != nil && *v.Duration > 0 {
		v.CompletionRate = (v.AverageWatchTime / float64(*v.Duration)) * 100
		if v.CompletionRate > 100 {
			v.CompletionRate = 100
		}
	}
}

// CalculateEngagementScore calculates the engagement score
func (v *Video) CalculateEngagementScore() {
	if v.ViewCount == 0 {
		v.EngagementScore = 0
		return
	}

	// Simple engagement score calculation
	// Can be made more sophisticated based on requirements
	likeRate := float64(v.LikeCount) / float64(v.ViewCount)
	shareRate := float64(v.ShareCount) / float64(v.ViewCount)
	commentRate := float64(v.CommentCount) / float64(v.ViewCount)

	v.EngagementScore = (likeRate*0.4 + shareRate*0.3 + commentRate*0.3) * 100
}

// Helper functions

func generateVideoSlug(title string) string {
	// Simple slug generation - in production, use a proper slug library
	return fmt.Sprintf("video-%d", time.Now().Unix())
}

// Video-related errors
var (
	ErrNotLiveVideo       = errors.New("video is not a live video")
	ErrInvalidVideoStatus = errors.New("invalid video status for operation")
	ErrVideoNotLive       = errors.New("video is not currently live")
)
