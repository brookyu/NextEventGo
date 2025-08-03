package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// HitType represents the type of hit/interaction
type HitType string

const (
	HitTypeView     HitType = "view"     // Page view
	HitTypeRead     HitType = "read"     // Content read completion
	HitTypeClick    HitType = "click"    // Click interaction
	HitTypeShare    HitType = "share"    // Content sharing
	HitTypeDownload HitType = "download" // File download
)

// Hit represents user interaction tracking for analytics
type Hit struct {
	ID           uuid.UUID  `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	ResourceId   uuid.UUID  `gorm:"type:char(36);column:ResourceId" json:"resourceId"`                    // ID of the resource being tracked
	ResourceType string     `gorm:"type:varchar(100);column:ResourceType" json:"resourceType"`           // Type of resource (article, image, etc.)
	UserId       *uuid.UUID `gorm:"type:char(36);column:UserId" json:"userId,omitempty"`                 // User who performed the action
	SessionId    string     `gorm:"type:varchar(255);column:SessionId" json:"sessionId"`                 // Session identifier
	HitType      HitType    `gorm:"type:varchar(50);column:HitType" json:"hitType"`                      // Type of interaction
	IPAddress    string     `gorm:"type:varchar(45);column:IPAddress" json:"ipAddress"`                  // User IP address
	UserAgent    string     `gorm:"type:longtext;column:UserAgent" json:"userAgent"`                     // Browser user agent
	Referrer     string     `gorm:"type:longtext;column:Referrer" json:"referrer"`                       // Referrer URL
	PromotionCode string    `gorm:"type:varchar(255);column:PromotionCode" json:"promotionCode"`         // Promotion code used
	
	// Reading analytics specific fields
	ReadDuration    int     `gorm:"type:int;column:ReadDuration;default:0" json:"readDuration"`          // Time spent reading (seconds)
	ReadPercentage  float64 `gorm:"type:decimal(5,2);column:ReadPercentage;default:0" json:"readPercentage"` // Percentage of content read
	ScrollDepth     float64 `gorm:"type:decimal(5,2);column:ScrollDepth;default:0" json:"scrollDepth"`   // Maximum scroll depth reached
	
	// Location and device information
	Country     string `gorm:"type:varchar(100);column:Country" json:"country"`         // User country
	City        string `gorm:"type:varchar(100);column:City" json:"city"`               // User city
	DeviceType  string `gorm:"type:varchar(50);column:DeviceType" json:"deviceType"`   // Device type (mobile, desktop, tablet)
	Platform    string `gorm:"type:varchar(50);column:Platform" json:"platform"`       // Platform (iOS, Android, Windows, etc.)
	Browser     string `gorm:"type:varchar(50);column:Browser" json:"browser"`         // Browser name
	
	// WeChat specific fields
	WeChatOpenId string `gorm:"type:varchar(255);column:WeChatOpenId" json:"weChatOpenId"` // WeChat user OpenID
	WeChatUnionId string `gorm:"type:varchar(255);column:WeChatUnionId" json:"weChatUnionId"` // WeChat user UnionID

	// Relationships
	User *User `gorm:"foreignKey:UserId" json:"user,omitempty"`

	// Audit fields matching ABP Framework patterns
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"isDeleted"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"createdBy,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updatedBy,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deletedBy,omitempty"`
}

// TableName returns the table name for GORM
func (Hit) TableName() string {
	return "Hits"
}

// BeforeCreate sets the ID and timestamps before creating
func (h *Hit) BeforeCreate(tx *gorm.DB) error {
	if h.ID == uuid.Nil {
		h.ID = uuid.New()
	}
	now := time.Now()
	h.CreatedAt = now
	h.UpdatedAt = &now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (h *Hit) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	h.UpdatedAt = &now
	return nil
}

// IsReadingComplete checks if the reading was completed based on percentage
func (h *Hit) IsReadingComplete() bool {
	return h.ReadPercentage >= 80.0 // Consider 80% as complete reading
}

// GetEngagementScore calculates an engagement score based on reading metrics
func (h *Hit) GetEngagementScore() float64 {
	// Simple engagement score calculation
	// Factors: read percentage (40%), read duration (30%), scroll depth (30%)
	score := (h.ReadPercentage * 0.4) + 
			 (float64(h.ReadDuration) / 300.0 * 100.0 * 0.3) + // Normalize duration to 5 minutes max
			 (h.ScrollDepth * 0.3)
	
	if score > 100.0 {
		score = 100.0
	}
	return score
}

// IsFromWeChat checks if the hit came from WeChat
func (h *Hit) IsFromWeChat() bool {
	return h.WeChatOpenId != "" || h.WeChatUnionId != ""
}

// IsFromPromotion checks if the hit came from a promotion code
func (h *Hit) IsFromPromotion() bool {
	return h.PromotionCode != ""
}
