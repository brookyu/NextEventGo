package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// NewsStatus represents the status of a news publication
type NewsStatus string

const (
	NewsStatusDraft     NewsStatus = "draft"
	NewsStatusScheduled NewsStatus = "scheduled"
	NewsStatusPublished NewsStatus = "published"
	NewsStatusArchived  NewsStatus = "archived"
)

// NewsType represents the type of news publication
type NewsType string

const (
	NewsTypeRegular  NewsType = "regular"
	NewsTypeBreaking NewsType = "breaking"
	NewsTypeFeature  NewsType = "feature"
	NewsTypeSpecial  NewsType = "special"
	NewsTypeWeekly   NewsType = "weekly"
	NewsTypeMonthly  NewsType = "monthly"
)

// NewsPriority represents the priority level of news
type NewsPriority string

const (
	NewsPriorityLow    NewsPriority = "low"
	NewsPriorityNormal NewsPriority = "normal"
	NewsPriorityHigh   NewsPriority = "high"
	NewsPriorityUrgent NewsPriority = "urgent"
)

// News represents a news publication that can contain multiple articles
type News struct {
	ID                   uuid.UUID  `gorm:"column:Id;type:char(36);primary_key" json:"id"`
	Title                string     `gorm:"column:Title;type:longtext" json:"title"`
	MediaId              *string    `gorm:"column:MediaId;type:varchar(500)" json:"media_id"`
	FrontCoverImageUrl   *string    `gorm:"column:FrontCoverImageUrl;type:varchar(500)" json:"front_cover_image_url"`
	CategoryId           uuid.UUID  `gorm:"column:CategoryId;type:char(36);not null" json:"category_id"`
	CreationTime         time.Time  `gorm:"column:CreationTime;type:datetime(6);not null" json:"creation_time"`
	CreatorId            *uuid.UUID `gorm:"column:CreatorId;type:char(36)" json:"creator_id"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime;type:datetime(6)" json:"last_modification_time"`
	LastModifierId       *uuid.UUID `gorm:"column:LastModifierId;type:char(36)" json:"last_modifier_id"`
	IsDeleted            bool       `gorm:"column:IsDeleted;type:tinyint(1);not null;default:0" json:"is_deleted"`
	DeleterId            *uuid.UUID `gorm:"column:DeleterId;type:char(36)" json:"deleter_id"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime;type:datetime(6)" json:"deletion_time"`
	FrontCoverImageId    *string    `gorm:"column:FrontCoverImageId;type:varchar(36)" json:"front_cover_image_id"`
	ScheduledAt          *time.Time `gorm:"column:ScheduledAt;type:datetime(6)" json:"scheduled_at"`
	ExpiresAt            *time.Time `gorm:"column:ExpiresAt;type:datetime(6)" json:"expires_at"`

	// Additional fields for compatibility (not in database but used by application)
	Subtitle    string `gorm:"-" json:"subtitle"`
	Description string `gorm:"-" json:"description"`
	Content     string `gorm:"-" json:"content"`
	Summary     string `gorm:"-" json:"summary"`

	// Metadata (not in database but used by application)
	Status   NewsStatus   `gorm:"-" json:"status"`
	Type     NewsType     `gorm:"-" json:"type"`
	Priority NewsPriority `gorm:"-" json:"priority"`

	// Publishing information (not in database but used by application)
	AuthorID    *uuid.UUID `gorm:"-" json:"author_id"`
	EditorID    *uuid.UUID `gorm:"-" json:"editor_id"`
	PublishedAt *time.Time `gorm:"-" json:"published_at"`

	// SEO and social media (not in database but used by application)
	Slug            string `gorm:"-" json:"slug"`
	MetaTitle       string `gorm:"-" json:"meta_title"`
	MetaDescription string `gorm:"-" json:"meta_description"`
	Keywords        string `gorm:"-" json:"keywords"`
	Tags            string `gorm:"-" json:"tags"`

	// Media (compatibility)
	FeaturedImageID *uuid.UUID `gorm:"-" json:"featured_image_id"`
	ThumbnailID     *uuid.UUID `gorm:"-" json:"thumbnail_id"`
	GalleryImageIDs string     `gorm:"-" json:"gallery_image_ids"` // JSON array of image IDs

	// WeChat integration
	WeChatDraftID     string     `gorm:"type:varchar(100);index" json:"wechat_draft_id"`
	WeChatPublishedID string     `gorm:"type:varchar(100);index" json:"wechat_published_id"`
	WeChatURL         string     `gorm:"type:varchar(500)" json:"wechat_url"`
	WeChatStatus      string     `gorm:"type:varchar(50);default:'not_synced'" json:"wechat_status"`
	WeChatSyncedAt    *time.Time `json:"wechat_synced_at"`

	// Analytics and engagement
	ViewCount    int64 `gorm:"default:0;index" json:"view_count"`
	ShareCount   int64 `gorm:"default:0" json:"share_count"`
	LikeCount    int64 `gorm:"default:0" json:"like_count"`
	CommentCount int64 `gorm:"default:0" json:"comment_count"`
	ReadTime     int   `gorm:"default:0" json:"read_time"` // Estimated read time in minutes

	// Configuration
	AllowComments bool `gorm:"default:true" json:"allow_comments"`
	AllowSharing  bool `gorm:"default:true" json:"allow_sharing"`
	IsFeatured    bool `gorm:"default:false;index" json:"is_featured"`
	IsBreaking    bool `gorm:"default:false;index" json:"is_breaking"`
	IsSticky      bool `gorm:"default:false;index" json:"is_sticky"`
	RequireAuth   bool `gorm:"default:false" json:"require_auth"`

	// Localization
	Language string `gorm:"type:varchar(10);default:'zh-CN';index" json:"language"`
	Region   string `gorm:"type:varchar(10);index" json:"region"`

	// Audit fields
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"created_by"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"updated_by"`

	// Relationships
	Author        *User          `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Editor        *User          `gorm:"foreignKey:EditorID" json:"editor,omitempty"`
	FeaturedImage *SiteImage     `gorm:"foreignKey:FeaturedImageID" json:"featured_image,omitempty"`
	Thumbnail     *SiteImage     `gorm:"foreignKey:ThumbnailID" json:"thumbnail,omitempty"`
	NewsArticles  []NewsArticle  `gorm:"foreignKey:NewsID" json:"news_articles,omitempty"`
	Articles      []SiteArticle  `gorm:"many2many:news_articles;" json:"articles,omitempty"`
	Categories    []NewsCategory `gorm:"many2many:news_category_associations;" json:"categories,omitempty"`
	Hits          []Hit          `gorm:"polymorphic:Target;polymorphicValue:news" json:"hits,omitempty"`
}

// NewsCategory represents a category for news publications
type NewsCategory struct {
	ID          uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null;index" json:"name"`
	Slug        string    `gorm:"type:varchar(100);unique;index" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Color       string    `gorm:"type:varchar(7);default:'#007bff'" json:"color"` // Hex color code
	Icon        string    `gorm:"type:varchar(50)" json:"icon"`

	// Hierarchy
	ParentID *uuid.UUID `gorm:"type:char(36);index" json:"parent_id"`
	Level    int        `gorm:"default:0;index" json:"level"`
	Path     string     `gorm:"type:varchar(500);index" json:"path"` // Materialized path

	// Display settings
	DisplayOrder int  `gorm:"default:0;index" json:"display_order"`
	IsActive     bool `gorm:"default:true;index" json:"is_active"`
	IsVisible    bool `gorm:"default:true" json:"is_visible"`
	IsFeatured   bool `gorm:"default:false;index" json:"is_featured"`

	// SEO
	MetaTitle       string `gorm:"type:varchar(500)" json:"meta_title"`
	MetaDescription string `gorm:"type:varchar(1000)" json:"meta_description"`
	Keywords        string `gorm:"type:varchar(1000)" json:"keywords"`

	// Media
	ImageID     *uuid.UUID `gorm:"type:char(36);index" json:"image_id"`
	ThumbnailID *uuid.UUID `gorm:"type:char(36);index" json:"thumbnail_id"`

	// Statistics
	NewsCount int64 `gorm:"default:0" json:"news_count"`

	// Audit fields
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"created_by"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index" json:"updated_by"`

	// Relationships
	Parent    *NewsCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children  []NewsCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Image     *SiteImage     `gorm:"foreignKey:ImageID" json:"image,omitempty"`
	Thumbnail *SiteImage     `gorm:"foreignKey:ThumbnailID" json:"thumbnail,omitempty"`
	News      []News         `gorm:"many2many:news_category_associations;" json:"news,omitempty"`
}

// NewsCategoryAssociation represents the many-to-many relationship between news and categories
type NewsCategoryAssociation struct {
	NewsID     uuid.UUID `gorm:"type:char(36);primary_key" json:"news_id"`
	CategoryID uuid.UUID `gorm:"type:char(36);primary_key" json:"category_id"`

	// Association metadata
	IsPrimary  bool       `gorm:"default:false" json:"is_primary"`
	AssignedAt time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"assigned_at"`
	AssignedBy *uuid.UUID `gorm:"type:char(36)" json:"assigned_by"`

	// Relationships
	News     News         `gorm:"foreignKey:NewsID" json:"news,omitempty"`
	Category NewsCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

// NewsArticle represents the many-to-many relationship between news and articles
type NewsArticle struct {
	Id                   uuid.UUID  `gorm:"column:Id;type:char(36);primary_key" json:"id"`
	SiteArticleId        uuid.UUID  `gorm:"column:SiteArticleId;type:char(36);not null" json:"site_article_id"`
	IsShowInText         bool       `gorm:"column:IsShowInText;type:tinyint(1);not null" json:"is_show_in_text"`
	SiteImageId          uuid.UUID  `gorm:"column:SiteImageId;type:char(36);not null" json:"site_image_id"`
	SiteNewsId           uuid.UUID  `gorm:"column:SiteNewsId;type:char(36);not null;index" json:"site_news_id"`
	Title                *string    `gorm:"column:Title;type:longtext" json:"title"`
	MediaId              *string    `gorm:"column:MediaId;type:varchar(500)" json:"media_id"`
	CreationTime         time.Time  `gorm:"column:CreationTime;type:datetime(6);not null" json:"creation_time"`
	CreatorId            *uuid.UUID `gorm:"column:CreatorId;type:char(36)" json:"creator_id"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime;type:datetime(6)" json:"last_modification_time"`
	LastModifierId       *uuid.UUID `gorm:"column:LastModifierId;type:char(36)" json:"last_modifier_id"`
	IsDeleted            bool       `gorm:"column:IsDeleted;type:tinyint(1);not null;default:0" json:"is_deleted"`
	DeleterId            *uuid.UUID `gorm:"column:DeleterId;type:char(36)" json:"deleter_id"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime;type:datetime(6)" json:"deletion_time"`

	// Compatibility fields (not in database but used by application)
	NewsID    uuid.UUID `gorm:"-" json:"news_id"`
	ArticleID uuid.UUID `gorm:"-" json:"article_id"`

	// Association metadata (not in database but used by application)
	DisplayOrder int    `gorm:"-" json:"display_order"`
	IsMainStory  bool   `gorm:"-" json:"is_main_story"`
	IsFeatured   bool   `gorm:"-" json:"is_featured"`
	Section      string `gorm:"-" json:"section"`
	Summary      string `gorm:"-" json:"summary"`

	// Publishing control (not in database but used by application)
	IsVisible   bool       `gorm:"-" json:"is_visible"`
	PublishedAt *time.Time `gorm:"-" json:"published_at"`

	// Audit fields (compatibility)
	CreatedAt time.Time  `gorm:"-" json:"created_at"`
	UpdatedAt time.Time  `gorm:"-" json:"updated_at"`
	CreatedBy *uuid.UUID `gorm:"-" json:"created_by"`
	UpdatedBy *uuid.UUID `gorm:"-" json:"updated_by"`

	// Relationships
	News    News        `gorm:"foreignKey:SiteNewsId" json:"news,omitempty"`
	Article SiteArticle `gorm:"foreignKey:SiteArticleId" json:"article,omitempty"`
}

// BeforeCreate hook for News
func (n *News) BeforeCreate(tx *gorm.DB) error {
	if n.ID == uuid.Nil {
		n.ID = uuid.New()
	}

	// Generate slug if not provided
	if n.Slug == "" {
		n.Slug = generateSlug(n.Title)
	}

	// Set default meta title if not provided
	if n.MetaTitle == "" {
		n.MetaTitle = n.Title
	}

	// Set default meta description if not provided
	if n.MetaDescription == "" && n.Description != "" {
		n.MetaDescription = truncateString(n.Description, 160)
	}

	return nil
}

// BeforeCreate hook for NewsCategory
func (nc *NewsCategory) BeforeCreate(tx *gorm.DB) error {
	if nc.ID == uuid.Nil {
		nc.ID = uuid.New()
	}

	// Generate slug if not provided
	if nc.Slug == "" {
		nc.Slug = generateSlug(nc.Name)
	}

	// Set materialized path
	if nc.ParentID != nil {
		var parent NewsCategory
		if err := tx.First(&parent, nc.ParentID).Error; err == nil {
			nc.Level = parent.Level + 1
			nc.Path = parent.Path + "/" + nc.Slug
		}
	} else {
		nc.Level = 0
		nc.Path = "/" + nc.Slug
	}

	return nil
}

// BeforeCreate hook for NewsArticle
func (na *NewsArticle) BeforeCreate(tx *gorm.DB) error {
	if na.Id == uuid.Nil {
		na.Id = uuid.New()
	}
	return nil
}

// TableName returns the table name for News
func (News) TableName() string {
	return "SiteNews"
}

// TableName returns the table name for NewsCategory
func (NewsCategory) TableName() string {
	return "news_categories"
}

// TableName returns the table name for NewsCategoryAssociation
func (NewsCategoryAssociation) TableName() string {
	return "news_category_associations"
}

// TableName returns the table name for NewsArticle
func (NewsArticle) TableName() string {
	return "SiteNewsArticles"
}

// Helper methods for News
func (n *News) IsPublished() bool {
	return n.Status == NewsStatusPublished && n.PublishedAt != nil && n.PublishedAt.Before(time.Now())
}

func (n *News) IsScheduled() bool {
	return n.Status == NewsStatusScheduled && n.ScheduledAt != nil && n.ScheduledAt.After(time.Now())
}

func (n *News) IsExpired() bool {
	return n.ExpiresAt != nil && n.ExpiresAt.Before(time.Now())
}

func (n *News) CanBePublished() bool {
	return n.Status == NewsStatusDraft || n.Status == NewsStatusScheduled
}

func (n *News) GetMainArticle() *NewsArticle {
	for _, na := range n.NewsArticles {
		if na.IsMainStory {
			return &na
		}
	}
	return nil
}

func (n *News) GetFeaturedArticles() []NewsArticle {
	var featured []NewsArticle
	for _, na := range n.NewsArticles {
		if na.IsFeatured {
			featured = append(featured, na)
		}
	}
	return featured
}

// Helper methods for NewsCategory
func (nc *NewsCategory) GetFullPath() string {
	return nc.Path
}

func (nc *NewsCategory) IsRoot() bool {
	return nc.ParentID == nil
}

func (nc *NewsCategory) HasChildren() bool {
	return len(nc.Children) > 0
}

// Helper functions

func truncateString(s string, length int) string {
	if len(s) <= length {
		return s
	}
	return s[:length-3] + "..."
}
