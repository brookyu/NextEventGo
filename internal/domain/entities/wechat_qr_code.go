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
	ID              uuid.UUID  `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	ParamsValue     string     `gorm:"type:longtext;column:ParamsValue" json:"paramsValue"`                   // Resource ID as string
	ParamUrl        string     `gorm:"type:longtext;column:ParamUrl" json:"paramUrl"`                         // Resource URL
	ParamKey        string     `gorm:"type:longtext;column:ParamKey" json:"paramKey"`                         // Resource type/key
	Ticket          string     `gorm:"type:varchar(100);column:Ticket" json:"ticket"`                         // WeChat QR code ticket
	Url             string     `gorm:"type:longtext;column:Url" json:"url"`                                   // WeChat QR code URL
	QRCodeImageData string     `gorm:"type:longtext;column:QRCodeImageData" json:"qrCodeImageData,omitempty"` // Base64 encoded QR code image
	ExpireSeconds   int        `gorm:"type:int;column:ExpireSeconds" json:"expireSeconds"`                    // Expiration in seconds
	ExpireTime      *time.Time `gorm:"type:datetime(6);column:ExpireTime" json:"expireTime,omitempty"`        // Expiration time
	UserFor         int        `gorm:"type:int;column:UserFor" json:"userFor"`                                // User type/purpose
	Remark          string     `gorm:"type:varchar(50);column:Remark" json:"remark,omitempty"`                // Remarks
	EventId         *uuid.UUID `gorm:"type:char(36);column:EventId" json:"eventId,omitempty"`                 // Associated event ID

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

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (q *WeChatQrCode) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	q.UpdatedAt = &now
	return nil
}

// IsExpired checks if the QR code is expired
func (q *WeChatQrCode) IsExpired() bool {
	if q.ExpireTime == nil {
		return false
	}
	return time.Now().After(*q.ExpireTime)
}

// IsUsable checks if the QR code can be used
func (q *WeChatQrCode) IsUsable() bool {
	if q.IsDeleted {
		return false
	}
	if q.IsExpired() {
		return false
	}
	return true
}

// GetResourceId returns the resource ID as UUID
func (q *WeChatQrCode) GetResourceId() (uuid.UUID, error) {
	return uuid.Parse(q.ParamsValue)
}

// GetResourceType returns the resource type
func (q *WeChatQrCode) GetResourceType() string {
	return q.ParamKey
}

// SetResourceInfo sets the resource information
func (q *WeChatQrCode) SetResourceInfo(resourceId uuid.UUID, resourceType string, resourceUrl string) {
	q.ParamsValue = resourceId.String()
	q.ParamKey = resourceType
	q.ParamUrl = resourceUrl
}
