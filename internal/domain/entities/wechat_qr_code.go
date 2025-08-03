package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// QRCodeType represents the type of QR code
type QRCodeType string

const (
	QRCodeTypeTemporary QRCodeType = "temporary" // Temporary QR code (expires)
	QRCodeTypePermanent QRCodeType = "permanent" // Permanent QR code
)

// QRCodeStatus represents the status of QR code
type QRCodeStatus string

const (
	QRCodeStatusActive  QRCodeStatus = "active"  // Active and usable
	QRCodeStatusExpired QRCodeStatus = "expired" // Expired
	QRCodeStatusRevoked QRCodeStatus = "revoked" // Manually revoked
)

// WeChatQrCode represents WeChat QR code management for content sharing
type WeChatQrCode struct {
	ID           uuid.UUID    `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	ResourceId   uuid.UUID    `gorm:"type:char(36);column:ResourceId" json:"resourceId"`                    // ID of the resource (article, etc.)
	ResourceType string       `gorm:"type:varchar(100);column:ResourceType" json:"resourceType"`           // Type of resource
	SceneStr     string       `gorm:"type:varchar(255);column:SceneStr" json:"sceneStr"`                   // WeChat scene string
	Ticket       string       `gorm:"type:longtext;column:Ticket" json:"ticket"`                           // WeChat QR code ticket
	QRCodeUrl    string       `gorm:"type:longtext;column:QRCodeUrl" json:"qrCodeUrl"`                     // QR code image URL
	QRCodeType   QRCodeType   `gorm:"type:varchar(50);column:QRCodeType" json:"qrCodeType"`                // QR code type
	Status       QRCodeStatus `gorm:"type:varchar(50);column:Status;default:active" json:"status"`        // QR code status
	ExpireTime   *time.Time   `gorm:"type:datetime(6);column:ExpireTime" json:"expireTime,omitempty"`     // Expiration time for temporary codes
	ScanCount    int64        `gorm:"type:bigint;column:ScanCount;default:0" json:"scanCount"`            // Number of scans
	LastScanTime *time.Time   `gorm:"type:datetime(6);column:LastScanTime" json:"lastScanTime,omitempty"` // Last scan timestamp
	
	// WeChat API response fields
	WeChatResponse string `gorm:"type:longtext;column:WeChatResponse" json:"weChatResponse"` // Raw WeChat API response
	
	// Usage tracking
	MaxScans     int `gorm:"type:int;column:MaxScans;default:0" json:"maxScans"`         // Maximum allowed scans (0 = unlimited)
	IsActive     bool `gorm:"type:tinyint(1);column:IsActive;default:1" json:"isActive"` // Active status
	
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
func (WeChatQrCode) TableName() string {
	return "WeiChatQrCodes" // Note: matches existing table name from .NET
}

// BeforeCreate sets the ID and timestamps before creating
func (q *WeChatQrCode) BeforeCreate(tx *gorm.DB) error {
	if q.ID == uuid.Nil {
		q.ID = uuid.New()
	}
	now := time.Now()
	q.CreatedAt = now
	q.UpdatedAt = &now
	
	// Generate scene string if not provided
	if q.SceneStr == "" {
		q.SceneStr = generateSceneString(q.ResourceType, q.ResourceId)
	}
	
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (q *WeChatQrCode) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	q.UpdatedAt = &now
	return nil
}

// generateSceneString generates a scene string for WeChat QR code
func generateSceneString(resourceType string, resourceId uuid.UUID) string {
	return resourceType + "_" + resourceId.String()[:8]
}

// IsExpired checks if the QR code is expired
func (q *WeChatQrCode) IsExpired() bool {
	if q.QRCodeType == QRCodeTypePermanent {
		return false
	}
	if q.ExpireTime == nil {
		return false
	}
	return time.Now().After(*q.ExpireTime)
}

// IsUsable checks if the QR code can be used
func (q *WeChatQrCode) IsUsable() bool {
	if !q.IsActive || q.IsDeleted {
		return false
	}
	if q.Status != QRCodeStatusActive {
		return false
	}
	if q.IsExpired() {
		return false
	}
	if q.MaxScans > 0 && q.ScanCount >= int64(q.MaxScans) {
		return false
	}
	return true
}

// IncrementScanCount increments the scan counter
func (q *WeChatQrCode) IncrementScanCount() {
	q.ScanCount++
	now := time.Now()
	q.LastScanTime = &now
}

// MarkAsExpired marks the QR code as expired
func (q *WeChatQrCode) MarkAsExpired() {
	q.Status = QRCodeStatusExpired
}

// Revoke revokes the QR code
func (q *WeChatQrCode) Revoke() {
	q.Status = QRCodeStatusRevoked
	q.IsActive = false
}

// GetUsageRate calculates the usage rate if max scans is set
func (q *WeChatQrCode) GetUsageRate() float64 {
	if q.MaxScans <= 0 {
		return 0.0
	}
	return float64(q.ScanCount) / float64(q.MaxScans) * 100.0
}
