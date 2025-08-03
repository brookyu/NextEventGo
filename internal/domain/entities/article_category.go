package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ArticleCategory represents the article category entity for organizing articles
type ArticleCategory struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null;column:Name" json:"name"`        // Category name
	Description string    `gorm:"type:longtext;column:Description" json:"description"`       // Category description
	SortOrder   int       `gorm:"type:int;column:SortOrder;default:0" json:"sortOrder"`      // Display order
	IsActive    bool      `gorm:"type:tinyint(1);column:IsActive;default:1" json:"isActive"` // Active status
	Color       string    `gorm:"type:varchar(50);column:Color" json:"color"`                // Category color for UI
	Icon        string    `gorm:"type:varchar(100);column:Icon" json:"icon"`                 // Category icon

	// Hierarchy support
	ParentID *uuid.UUID `gorm:"type:char(36);column:ParentId" json:"parentId"`    // Parent category
	Level    int        `gorm:"default:0;column:Level" json:"level"`              // Hierarchy level
	Path     string     `gorm:"type:varchar(500);column:Path" json:"path"`        // Materialized path
	Slug     string     `gorm:"type:varchar(100);unique;column:Slug" json:"slug"` // URL-friendly slug

	// Statistics
	ArticleCount int64 `gorm:"default:0;column:ArticleCount" json:"articleCount"` // Number of articles

	// Relationships
	Articles []Article         `gorm:"foreignKey:CategoryID" json:"articles,omitempty"`
	Parent   *ArticleCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []ArticleCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Creator  *User             `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`

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
func (ArticleCategory) TableName() string {
	return "ArticleCategories"
}

// BeforeCreate sets the ID and timestamps before creating
func (c *ArticleCategory) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	now := time.Now()
	c.CreatedAt = now
	c.UpdatedAt = &now

	// Generate slug if not provided
	if c.Slug == "" {
		c.Slug = generateSlug(c.Name)
	}

	// Set materialized path for hierarchy
	if c.ParentID != nil {
		var parent ArticleCategory
		if err := tx.First(&parent, c.ParentID).Error; err == nil {
			c.Level = parent.Level + 1
			c.Path = parent.Path + "/" + c.Slug
		}
	} else {
		c.Level = 0
		c.Path = "/" + c.Slug
	}

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (c *ArticleCategory) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	c.UpdatedAt = &now
	return nil
}

// Domain methods
func (c *ArticleCategory) IsRoot() bool {
	return c.ParentID == nil
}

func (c *ArticleCategory) HasChildren() bool {
	return len(c.Children) > 0
}

func (c *ArticleCategory) HasArticles() bool {
	return c.ArticleCount > 0
}

func (c *ArticleCategory) IncrementArticleCount() {
	c.ArticleCount++
}

func (c *ArticleCategory) DecrementArticleCount() {
	if c.ArticleCount > 0 {
		c.ArticleCount--
	}
}

func (c *ArticleCategory) GetURL() string {
	return "/categories/" + c.Slug
}

func (c *ArticleCategory) GetFullPath() string {
	return c.Path
}
