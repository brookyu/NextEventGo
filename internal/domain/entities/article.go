package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ArticleStatus represents the status of an article
type ArticleStatus string

const (
	ArticleStatusDraft     ArticleStatus = "draft"
	ArticleStatusPublished ArticleStatus = "published"
	ArticleStatusArchived  ArticleStatus = "archived"
	ArticleStatusDeleted   ArticleStatus = "deleted"
)

// Article represents the article entity for content management
type Article struct {
	ID         uuid.UUID     `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Title      string        `gorm:"type:varchar(255);not null;column:Title" json:"title"`                  // Article title
	Summary    string        `gorm:"type:longtext;column:Summary" json:"summary"`                           // Article summary
	Content    string        `gorm:"type:longtext;column:Content" json:"content"`                           // HTML content
	Author     string        `gorm:"type:varchar(255);column:Author" json:"author"`                         // Author name
	CategoryID uuid.UUID     `gorm:"type:char(36);column:CategoryId" json:"categoryId"`                     // Category reference
	Status     ArticleStatus `gorm:"type:varchar(20);not null;default:'draft';column:Status" json:"status"` // Article status

	// Media relations
	SiteImageID    *uuid.UUID `gorm:"type:char(36);column:SiteImageId" json:"siteImageId"`       // Cover image
	PromotionPicID *uuid.UUID `gorm:"type:char(36);column:PromotionPicId" json:"promotionPicId"` // Promotion image
	JumpResourceID *uuid.UUID `gorm:"type:char(36);column:JumpResourceId" json:"jumpResourceId"` // Jump resource

	// Promotion and tracking
	PromotionCode string `gorm:"type:varchar(100);column:PromotionCode" json:"promotionCode"` // Unique promotion code

	// SEO and metadata
	MetaTitle       string `gorm:"type:varchar(255);column:MetaTitle" json:"metaTitle"`
	MetaDescription string `gorm:"type:varchar(500);column:MetaDescription" json:"metaDescription"`
	Keywords        string `gorm:"type:varchar(1000);column:Keywords" json:"keywords"`

	// Publishing
	PublishedAt *time.Time `gorm:"type:datetime(6);column:PublishedAt" json:"publishedAt"`

	// Analytics
	ViewCount  int64 `gorm:"default:0;column:ViewCount" json:"viewCount"`
	ReadCount  int64 `gorm:"default:0;column:ReadCount" json:"readCount"`
	ShareCount int64 `gorm:"default:0;column:ShareCount" json:"shareCount"`

	// Audit fields matching ABP Framework patterns
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"isDeleted"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"createdBy,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updatedBy,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deletedBy,omitempty"`

	// Relationships
	Category       *ArticleCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	CoverImage     *SiteImage       `gorm:"foreignKey:SiteImageID" json:"coverImage,omitempty"`
	PromotionImage *SiteImage       `gorm:"foreignKey:PromotionPicID" json:"promotionImage,omitempty"`
	Creator        *User            `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
	Tags           []Tag            `gorm:"many2many:article_tags;" json:"tags,omitempty"`
}

// TableName returns the table name for GORM
func (Article) TableName() string {
	return "SiteArticles"
}

// BeforeCreate sets the ID and timestamps before creating
func (a *Article) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	now := time.Now()
	a.CreatedAt = now
	a.UpdatedAt = &now

	// Generate promotion code if not provided
	if a.PromotionCode == "" {
		a.PromotionCode = generatePromotionCode()
	}

	// Set meta title if not provided
	if a.MetaTitle == "" {
		a.MetaTitle = a.Title
	}

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (a *Article) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	a.UpdatedAt = &now
	return nil
}

// Domain methods
func (a *Article) IsPublished() bool {
	return a.Status == ArticleStatusPublished && a.PublishedAt != nil
}

func (a *Article) IsDraft() bool {
	return a.Status == ArticleStatusDraft
}

func (a *Article) CanEdit() bool {
	return a.Status == ArticleStatusDraft || a.Status == ArticleStatusPublished
}

func (a *Article) Publish() {
	if a.Status == ArticleStatusDraft {
		a.Status = ArticleStatusPublished
		now := time.Now()
		a.PublishedAt = &now
	}
}

func (a *Article) Archive() {
	a.Status = ArticleStatusArchived
}

func (a *Article) GetURL() string {
	return "/articles/" + a.ID.String()
}

func (a *Article) GetPromotionURL() string {
	if a.PromotionCode != "" {
		return "/articles/promo/" + a.PromotionCode
	}
	return a.GetURL()
}

func (a *Article) IncrementView() {
	a.ViewCount++
}

func (a *Article) IncrementRead() {
	a.ReadCount++
}

func (a *Article) IncrementShare() {
	a.ShareCount++
}
