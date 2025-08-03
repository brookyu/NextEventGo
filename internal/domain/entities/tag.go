package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TagType represents the type of tag
type TagType string

const (
	TagTypeGeneral  TagType = "general"
	TagTypeCategory TagType = "category"
	TagTypeTopic    TagType = "topic"
	TagTypeKeyword  TagType = "keyword"
)

// Tag represents a tag entity for content classification
type Tag struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null;unique;column:Name" json:"name"`           // Tag name
	Slug        string    `gorm:"type:varchar(100);unique;column:Slug" json:"slug"`                    // URL-friendly slug
	Description string    `gorm:"type:text;column:Description" json:"description"`                     // Tag description
	Type        TagType   `gorm:"type:varchar(20);not null;default:'general';column:Type" json:"type"` // Tag type
	Color       string    `gorm:"type:varchar(7);default:'#007bff';column:Color" json:"color"`         // Hex color code

	// Hierarchy support
	ParentID *uuid.UUID `gorm:"type:char(36);column:ParentId" json:"parentId"` // Parent tag
	Level    int        `gorm:"default:0;column:Level" json:"level"`           // Hierarchy level
	Path     string     `gorm:"type:varchar(500);column:Path" json:"path"`     // Materialized path

	// Usage statistics
	UsageCount int64 `gorm:"default:0;column:UsageCount" json:"usageCount"` // How many times used

	// Display settings
	IsVisible bool `gorm:"default:true;column:IsVisible" json:"isVisible"` // Show in UI
	SortOrder int  `gorm:"default:0;column:SortOrder" json:"sortOrder"`    // Display order

	// Audit fields matching ABP Framework patterns
	CreatedAt time.Time  `gorm:"type:datetime(6);column:CreationTime" json:"createdAt"`
	UpdatedAt *time.Time `gorm:"type:datetime(6);column:LastModificationTime" json:"updatedAt,omitempty"`
	IsDeleted bool       `gorm:"type:tinyint(1);column:IsDeleted;default:0" json:"isDeleted"`
	DeletedAt *time.Time `gorm:"type:datetime(6);column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID `gorm:"type:char(36);column:CreatorId" json:"createdBy,omitempty"`
	UpdatedBy *uuid.UUID `gorm:"type:char(36);column:LastModifierId" json:"updatedBy,omitempty"`
	DeletedBy *uuid.UUID `gorm:"type:char(36);column:DeleterId" json:"deletedBy,omitempty"`

	// Relationships
	Parent   *Tag      `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []Tag     `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Articles []Article `gorm:"many2many:article_tags;" json:"articles,omitempty"`
	Creator  *User     `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

// TableName returns the table name for GORM
func (Tag) TableName() string {
	return "Tags"
}

// BeforeCreate sets the ID and timestamps before creating
func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	now := time.Now()
	t.CreatedAt = now
	t.UpdatedAt = &now

	// Generate slug if not provided
	if t.Slug == "" {
		t.Slug = generateSlug(t.Name)
	}

	// Set materialized path for hierarchy
	if t.ParentID != nil {
		var parent Tag
		if err := tx.First(&parent, t.ParentID).Error; err == nil {
			t.Level = parent.Level + 1
			t.Path = parent.Path + "/" + t.Slug
		}
	} else {
		t.Level = 0
		t.Path = "/" + t.Slug
	}

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (t *Tag) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	t.UpdatedAt = &now
	return nil
}

// Domain methods
func (t *Tag) IsRoot() bool {
	return t.ParentID == nil
}

func (t *Tag) HasChildren() bool {
	return len(t.Children) > 0
}

func (t *Tag) IncrementUsage() {
	t.UsageCount++
}

func (t *Tag) DecrementUsage() {
	if t.UsageCount > 0 {
		t.UsageCount--
	}
}

func (t *Tag) GetFullPath() string {
	return t.Path
}

func (t *Tag) GetURL() string {
	return "/tags/" + t.Slug
}
