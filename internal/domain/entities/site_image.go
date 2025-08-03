package entities

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ImageType represents the type of image
type ImageType string

const (
	ImageTypePhoto        ImageType = "photo"
	ImageTypeIllustration ImageType = "illustration"
	ImageTypeIcon         ImageType = "icon"
	ImageTypeLogo         ImageType = "logo"
	ImageTypeBanner       ImageType = "banner"
	ImageTypeThumbnail    ImageType = "thumbnail"
	ImageTypeAvatar       ImageType = "avatar"
)

// ImageStatus represents the status of an image
type ImageStatus string

const (
	ImageStatusActive     ImageStatus = "active"
	ImageStatusInactive   ImageStatus = "inactive"
	ImageStatusProcessing ImageStatus = "processing"
	ImageStatusFailed     ImageStatus = "failed"
)

// SiteImage represents an image in the system
type SiteImage struct {
	ID       uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	Filename string    `gorm:"type:varchar(255);not null;index" json:"filename"`

	// File information
	OriginalName string `gorm:"type:varchar(255);not null" json:"original_name"`
	MimeType     string `gorm:"type:varchar(100);not null;index" json:"mime_type"`
	FileSize     int64  `gorm:"not null" json:"file_size"`

	// Image properties
	Width  int `gorm:"not null" json:"width"`
	Height int `gorm:"not null" json:"height"`

	// Storage information
	StoragePath   string `gorm:"type:varchar(500);not null" json:"storage_path"`
	StorageDriver string `gorm:"type:varchar(50);not null;default:'local'" json:"storage_driver"`
	CDNUrl        string `gorm:"type:varchar(500)" json:"cdn_url"`

	// Metadata
	Title       string    `gorm:"type:varchar(255)" json:"title"`
	AltText     string    `gorm:"type:varchar(500)" json:"alt_text"`
	Caption     string    `gorm:"type:text" json:"caption"`
	Description string    `gorm:"type:text" json:"description"`
	Type        ImageType `gorm:"type:varchar(50);not null;default:'photo';index" json:"type"`

	// Status and visibility
	Status     ImageStatus `gorm:"type:varchar(20);not null;default:'active';index" json:"status"`
	IsPublic   bool        `gorm:"default:true;index" json:"is_public"`
	IsFeatured bool        `gorm:"default:false;index" json:"is_featured"`

	// SEO and social media
	Keywords string `gorm:"type:varchar(1000)" json:"keywords"`
	Tags     string `gorm:"type:varchar(1000)" json:"tags"`

	// Processing information
	ProcessedAt    *time.Time `json:"processed_at"`
	ProcessingLogs string     `gorm:"type:text" json:"processing_logs"`

	// Variants (thumbnails, different sizes)
	HasThumbnail  bool   `gorm:"default:false" json:"has_thumbnail"`
	ThumbnailPath string `gorm:"type:varchar(500)" json:"thumbnail_path"`
	HasWebP       bool   `gorm:"default:false" json:"has_webp"`
	WebPPath      string `gorm:"type:varchar(500)" json:"webp_path"`

	// Usage tracking
	DownloadCount int64 `gorm:"default:0" json:"download_count"`
	ViewCount     int64 `gorm:"default:0" json:"view_count"`

	// Copyright and licensing
	Copyright string `gorm:"type:varchar(255)" json:"copyright"`
	License   string `gorm:"type:varchar(100)" json:"license"`
	Source    string `gorm:"type:varchar(500)" json:"source"`

	// Audit fields
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"created_by"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"updated_by"`

	// Relationships
	Creator *User `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Updater *User `gorm:"foreignKey:UpdatedBy" json:"updater,omitempty"`
}

// BeforeCreate hook for SiteImage
func (si *SiteImage) BeforeCreate(tx *gorm.DB) error {
	if si.ID == uuid.Nil {
		si.ID = uuid.New()
	}

	// Set title if not provided
	if si.Title == "" {
		si.Title = si.OriginalName
	}

	// Set alt text if not provided
	if si.AltText == "" {
		si.AltText = si.Title
	}

	return nil
}

// TableName returns the table name for SiteImage
func (SiteImage) TableName() string {
	return "site_images"
}

// Helper methods for SiteImage
func (si *SiteImage) GetURL() string {
	if si.CDNUrl != "" {
		return si.CDNUrl
	}
	return "/uploads/" + si.StoragePath
}

func (si *SiteImage) GetThumbnailURL() string {
	if si.HasThumbnail && si.ThumbnailPath != "" {
		if si.CDNUrl != "" {
			// Assume thumbnail is in the same CDN with different path
			return si.CDNUrl + "/thumb"
		}
		return "/uploads/" + si.ThumbnailPath
	}
	return si.GetURL()
}

func (si *SiteImage) GetWebPURL() string {
	if si.HasWebP && si.WebPPath != "" {
		if si.CDNUrl != "" {
			// Assume WebP is in the same CDN with different extension
			return si.CDNUrl + ".webp"
		}
		return "/uploads/" + si.WebPPath
	}
	return si.GetURL()
}

func (si *SiteImage) IsImage() bool {
	return si.MimeType == "image/jpeg" ||
		si.MimeType == "image/png" ||
		si.MimeType == "image/gif" ||
		si.MimeType == "image/webp" ||
		si.MimeType == "image/svg+xml"
}

func (si *SiteImage) IsProcessed() bool {
	return si.Status == ImageStatusActive && si.ProcessedAt != nil
}

func (si *SiteImage) GetAspectRatio() float64 {
	if si.Height == 0 {
		return 0
	}
	return float64(si.Width) / float64(si.Height)
}

func (si *SiteImage) IsLandscape() bool {
	return si.Width > si.Height
}

func (si *SiteImage) IsPortrait() bool {
	return si.Height > si.Width
}

func (si *SiteImage) IsSquare() bool {
	return si.Width == si.Height
}

func (si *SiteImage) GetFileSizeFormatted() string {
	const unit = 1024
	if si.FileSize < unit {
		return fmt.Sprintf("%d B", si.FileSize)
	}
	div, exp := int64(unit), 0
	for n := si.FileSize / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(si.FileSize)/float64(div), "KMGTPE"[exp])
}

// Backward compatibility methods for existing code
func (si *SiteImage) Name() string {
	return si.OriginalName
}

func (si *SiteImage) SiteUrl() string {
	return si.StoragePath
}

func (si *SiteImage) Url() string {
	return si.GetURL()
}

func (si *SiteImage) MediaId() string {
	// This was for WeChat integration - could be stored in metadata
	return ""
}

func (si *SiteImage) CategoryId() *uuid.UUID {
	// This was for categorization - could be implemented with tags
	return nil
}
