package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserRole represents the role of a user
type UserRole string

const (
	UserRoleAdmin       UserRole = "admin"
	UserRoleEditor      UserRole = "editor"
	UserRoleAuthor      UserRole = "author"
	UserRoleContributor UserRole = "contributor"
	UserRoleSubscriber  UserRole = "subscriber"
)

// UserStatus represents the status of a user account
type UserStatus string

const (
	UserStatusActive    UserStatus = "active"
	UserStatusInactive  UserStatus = "inactive"
	UserStatusSuspended UserStatus = "suspended"
	UserStatusPending   UserStatus = "pending"
)

// User represents a user in the system
type User struct {
	ID       uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	Username string    `gorm:"type:varchar(100);unique;not null;index" json:"username"`
	Email    string    `gorm:"type:varchar(255);unique;not null;index" json:"email"`

	// Profile information
	FirstName   string `gorm:"type:varchar(100)" json:"first_name"`
	LastName    string `gorm:"type:varchar(100)" json:"last_name"`
	DisplayName string `gorm:"type:varchar(200)" json:"display_name"`
	Bio         string `gorm:"type:text" json:"bio"`

	// Authentication
	PasswordHash string `gorm:"type:varchar(255);not null" json:"-"`
	Salt         string `gorm:"type:varchar(255)" json:"-"`

	// Account settings
	Role   UserRole   `gorm:"type:varchar(20);not null;default:'subscriber';index" json:"role"`
	Status UserStatus `gorm:"type:varchar(20);not null;default:'active';index" json:"status"`

	// Contact information
	Phone   string `gorm:"type:varchar(20)" json:"phone"`
	Website string `gorm:"type:varchar(255)" json:"website"`

	// Profile media
	AvatarID *uuid.UUID `gorm:"type:char(36);index" json:"avatar_id"`

	// Preferences
	Language           string `gorm:"type:varchar(10);default:'zh-CN'" json:"language"`
	Timezone           string `gorm:"type:varchar(50);default:'Asia/Shanghai'" json:"timezone"`
	EmailNotifications bool   `gorm:"default:true" json:"email_notifications"`

	// Security
	EmailVerified    bool       `gorm:"default:false" json:"email_verified"`
	EmailVerifiedAt  *time.Time `json:"email_verified_at"`
	PhoneVerified    bool       `gorm:"default:false" json:"phone_verified"`
	PhoneVerifiedAt  *time.Time `json:"phone_verified_at"`
	TwoFactorEnabled bool       `gorm:"default:false" json:"two_factor_enabled"`
	LastLoginAt      *time.Time `json:"last_login_at"`
	LastLoginIP      string     `gorm:"type:varchar(45)" json:"last_login_ip"`

	// Audit fields
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	// Relationships
	Avatar *SiteImage `gorm:"foreignKey:AvatarID" json:"avatar,omitempty"`
}

// BeforeCreate hook for User
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	// Set display name if not provided
	if u.DisplayName == "" {
		if u.FirstName != "" && u.LastName != "" {
			u.DisplayName = u.FirstName + " " + u.LastName
		} else if u.FirstName != "" {
			u.DisplayName = u.FirstName
		} else {
			u.DisplayName = u.Username
		}
	}

	return nil
}

// TableName returns the table name for User
func (User) TableName() string {
	return "users"
}

// Helper methods for User
func (u *User) GetFullName() string {
	if u.FirstName != "" && u.LastName != "" {
		return u.FirstName + " " + u.LastName
	}
	return u.DisplayName
}

func (u *User) IsAdmin() bool {
	return u.Role == UserRoleAdmin
}

func (u *User) IsEditor() bool {
	return u.Role == UserRoleEditor || u.Role == UserRoleAdmin
}

func (u *User) IsAuthor() bool {
	return u.Role == UserRoleAuthor || u.Role == UserRoleEditor || u.Role == UserRoleAdmin
}

func (u *User) CanPublish() bool {
	return u.Role == UserRoleEditor || u.Role == UserRoleAdmin
}

func (u *User) IsActive() bool {
	return u.Status == UserStatusActive
}

func (u *User) IsVerified() bool {
	return u.EmailVerified
}
