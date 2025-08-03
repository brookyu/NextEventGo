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
	ID          uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	Title       string    `gorm:"type:varchar(500);not null;index" json:"title"`
	Subtitle    string    `gorm:"type:varchar(1000)" json:"subtitle"`
	Description string    `gorm:"type:text" json:"description"`
	Content     string    `gorm:"type:longtext" json:"content"`
	Summary     string    `gorm:"type:text" json:"summary"`

	// Metadata
	Status   NewsStatus   `gorm:"type:varchar(20);not null;default:'draft';index" json:"status"`
	Type     NewsType     `gorm:"type:varchar(20);not null;default:'regular';index" json:"type"`
	Priority NewsPriority `gorm:"type:varchar(20);not null;default:'normal';index" json:"priority"`

	// Publishing information
	AuthorID    *uuid.UUID `gorm:"type:char(36);index" json:"author_id"`
	EditorID    *uuid.UUID `gorm:"type:char(36);index" json:"editor_id"`
	PublishedAt *time.Time `gorm:"index" json:"published_at"`
	ScheduledAt *time.Time `gorm:"index" json:"scheduled_at"`
	ExpiresAt   *time.Time `gorm:"index" json:"expires_at"`

	// SEO and social media
	Slug            string `gorm:"type:varchar(500);unique;index" json:"slug"`
	MetaTitle       string `gorm:"type:varchar(500)" json:"meta_title"`
	MetaDescription string `gorm:"type:varchar(1000)" json:"meta_description"`
	Keywords        string `gorm:"type:varchar(1000)" json:"keywords"`
	Tags            string `gorm:"type:varchar(1000)" json:"tags"`

	// Media
	FeaturedImageID *uuid.UUID `gorm:"type:char(36);index" json:"featured_image_id"`
	ThumbnailID     *uuid.UUID `gorm:"type:char(36);index" json:"thumbnail_id"`
	GalleryImageIDs string     `gorm:"type:text" json:"gallery_image_ids"` // JSON array of image IDs

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
	ID        uuid.UUID `gorm:"type:char(36);primary_key" json:"id"`
	NewsID    uuid.UUID `gorm:"type:char(36);not null;index" json:"news_id"`
	ArticleID uuid.UUID `gorm:"type:char(36);not null;index" json:"article_id"`

	// Association metadata
	DisplayOrder int    `gorm:"default:0;index" json:"display_order"`
	IsMainStory  bool   `gorm:"default:false" json:"is_main_story"`
	IsFeatured   bool   `gorm:"default:false" json:"is_featured"`
	Section      string `gorm:"type:varchar(100)" json:"section"`
	Summary      string `gorm:"type:text" json:"summary"`

	// Publishing control
	IsVisible   bool       `gorm:"default:true" json:"is_visible"`
	PublishedAt *time.Time `json:"published_at"`

	// Audit fields
	CreatedAt time.Time  `gorm:"index" json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);index" json:"created_by"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);index" json:"updated_by"`

	// Relationships
	News    News        `gorm:"foreignKey:NewsID" json:"news,omitempty"`
	Article SiteArticle `gorm:"foreignKey:ArticleID" json:"article,omitempty"`
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
	if na.ID == uuid.Nil {
		na.ID = uuid.New()
	}
	return nil
}

// TableName returns the table name for News
func (News) TableName() string {
	return "news"
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
	return "news_articles"
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
