package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WeChatMessage represents WeChat message processing entity
type WeChatMessage struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	FromUser    string    `gorm:"size:128;not null;column:FromUser" json:"from_user"`
	ToUser      string    `gorm:"size:128;not null;column:ToUser" json:"to_user"`
	MessageType string    `gorm:"size:32;not null;column:MessageType" json:"message_type"`
	Content     string    `gorm:"type:text;column:Content" json:"content"`
	MediaID     string    `gorm:"size:256;column:MediaID" json:"media_id,omitempty"`
	EventType   string    `gorm:"size:32;column:EventType" json:"event_type,omitempty"`
	EventKey    string    `gorm:"size:128;column:EventKey" json:"event_key,omitempty"`
	Processed   bool      `gorm:"default:false;column:Processed" json:"processed"`
	Response    string    `gorm:"type:text;column:Response" json:"response,omitempty"`

	// Audit fields
	CreatedAt time.Time      `gorm:"column:CreationTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:LastModificationTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:DeletionTime" json:"deleted_at,omitempty"`
}

// TableName returns the table name for GORM
func (WeChatMessage) TableName() string {
	return "WeChatMessages"
}

// BeforeCreate sets the ID and timestamps before creating
func (w *WeChatMessage) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	now := time.Now()
	w.CreatedAt = now
	w.UpdatedAt = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (w *WeChatMessage) BeforeUpdate(tx *gorm.DB) error {
	w.UpdatedAt = time.Now()
	return nil
}

// WeChatUser represents WeChat user information
type WeChatUser struct {
	ID               uuid.UUID  `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	OpenID           string     `gorm:"type:longtext;column:OpenId" json:"openId"`
	Subscribe        bool       `gorm:"type:tinyint(1);column:Subscribe" json:"subscribe"`
	NickName         string     `gorm:"type:longtext;column:NickName" json:"nickname"`
	RealName         *string    `gorm:"type:longtext;column:RealName" json:"realName,omitempty"`
	CompanyName      *string    `gorm:"type:longtext;column:CompanyName" json:"companyName,omitempty"`
	Position         *string    `gorm:"type:longtext;column:Position" json:"position,omitempty"`
	Email            *string    `gorm:"type:longtext;column:Email" json:"email,omitempty"`
	Mobile           *string    `gorm:"type:longtext;column:Mobile" json:"mobile,omitempty"`
	Sex              int        `gorm:"column:Sex" json:"sex"`
	City             *string    `gorm:"type:longtext;column:City" json:"city,omitempty"`
	Country          *string    `gorm:"type:longtext;column:Country" json:"country,omitempty"`
	Province         *string    `gorm:"type:longtext;column:Province" json:"province,omitempty"`
	Language         *string    `gorm:"type:longtext;column:Language" json:"language,omitempty"`
	HeadImgUrl       *string    `gorm:"type:longtext;column:HeadImgUrl" json:"headImgUrl,omitempty"`
	SubscribeTime    *time.Time `gorm:"type:datetime(6);column:SubscribeTime" json:"subscribeTime,omitempty"`
	UnionID          *string    `gorm:"type:longtext;column:UnionId" json:"unionId,omitempty"`
	Remark           *string    `gorm:"type:longtext;column:Remark" json:"remark,omitempty"`
	IsConfirmed      bool       `gorm:"type:tinyint(1);column:IsConfirmed" json:"isConfirmed"`
	GroupID          *int       `gorm:"column:GroupId" json:"groupId,omitempty"`
	AllowTest        bool       `gorm:"type:tinyint(1);column:AllowTest" json:"allowTest"`
	IsHidden         bool       `gorm:"type:tinyint(1);column:IsHidden" json:"isHidden"`
	CurrentEventID   *uuid.UUID `gorm:"type:char(36);column:CurrentEventId" json:"currentEventId,omitempty"`
	R1               string     `gorm:"type:longtext;column:R1" json:"r1"`
	R2               string     `gorm:"type:longtext;column:R2" json:"r2"`
	R3               string     `gorm:"type:longtext;column:R3" json:"r3"`
	R4               string     `gorm:"type:longtext;column:R4" json:"r4"`
	R5               string     `gorm:"type:longtext;column:R5" json:"r5"`
	R6               string     `gorm:"type:longtext;column:R6" json:"r6"`
	R7               string     `gorm:"type:longtext;column:R7" json:"r7"`
	R8               string     `gorm:"type:longtext;column:R8" json:"r8"`
	R9               string     `gorm:"type:longtext;column:R9" json:"r9"`
	R10              string     `gorm:"type:longtext;column:R10" json:"r10"`
	PartyNumber      string     `gorm:"type:longtext;column:PartyNumber" json:"party_number"`
	IsBizCardEnabled bool       `gorm:"type:tinyint(1);column:IsBizCardEnabled;default:0" json:"isBizCardEnabled"`
	Telephone        *string    `gorm:"type:longtext;column:Telephone" json:"telephone,omitempty"`
	WorkAddress      *string    `gorm:"type:longtext;column:WorkAddress" json:"workAddress,omitempty"`
	QrCodeValue      *string    `gorm:"type:longtext;column:QrCodeValue" json:"qrCodeValue,omitempty"`
	BizCardSavePath  *string    `gorm:"type:longtext;column:BizCardSavePath" json:"bizCardSavePath,omitempty"`

	// Audit fields
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"-"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deleted_at,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"created_by,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updated_by,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deleted_by,omitempty"`
}

// TableName returns the table name for GORM
func (WeChatUser) TableName() string {
	return "WeiChatUsers"
}

// BeforeCreate sets the ID and timestamps before creating
func (w *WeChatUser) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	now := time.Now()
	w.CreatedAt = now
	w.UpdatedAt = &now
	if w.SubscribeTime == nil {
		w.SubscribeTime = &now
	}
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (w *WeChatUser) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	w.UpdatedAt = &now
	return nil
}
