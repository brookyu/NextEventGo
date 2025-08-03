package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// VideoCategory represents a video category entity
type VideoCategory struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Basic information
	Name        string `gorm:"type:varchar(100);not null;column:Name" json:"name"`
	Slug        string `gorm:"type:varchar(100);unique;column:Slug" json:"slug"`
	Description string `gorm:"type:varchar(1000);column:Description" json:"description"`
	Color       string `gorm:"type:varchar(7);column:Color" json:"color"` // Hex color code
	Icon        string `gorm:"type:varchar(100);column:Icon" json:"icon"` // Icon class or URL

	// Hierarchy support
	ParentID *uuid.UUID `gorm:"type:char(36);column:ParentId" json:"parentId"`
	Level    int        `gorm:"default:0;column:Level" json:"level"`
	Path     string     `gorm:"type:varchar(1000);column:Path" json:"path"` // Materialized path

	// Display settings
	DisplayOrder int  `gorm:"default:0;column:DisplayOrder" json:"displayOrder"`
	IsActive     bool `gorm:"default:true;column:IsActive" json:"isActive"`
	IsVisible    bool `gorm:"default:true;column:IsVisible" json:"isVisible"`
	IsFeatured   bool `gorm:"default:false;column:IsFeatured" json:"isFeatured"`

	// SEO
	MetaTitle       string `gorm:"type:varchar(500);column:MetaTitle" json:"metaTitle"`
	MetaDescription string `gorm:"type:varchar(1000);column:MetaDescription" json:"metaDescription"`
	Keywords        string `gorm:"type:varchar(1000);column:Keywords" json:"keywords"`

	// Media
	ImageID     *uuid.UUID `gorm:"type:char(36);column:ImageId" json:"imageId"`
	ThumbnailID *uuid.UUID `gorm:"type:char(36);column:ThumbnailId" json:"thumbnailId"`

	// Statistics
	VideoCount int64 `gorm:"default:0;column:VideoCount" json:"videoCount"`

	// Audit fields (ABP Framework compatible)
	CreatedAt time.Time      `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt time.Time      `gorm:"column:LastModificationTime" json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index;column:DeletionTime" json:"deletedAt,omitempty"`
	CreatedBy *uuid.UUID     `gorm:"type:char(36);index;column:CreatorId" json:"createdBy"`
	UpdatedBy *uuid.UUID     `gorm:"type:char(36);index;column:LastModifierId" json:"updatedBy"`
	DeletedBy *uuid.UUID     `gorm:"type:char(36);index;column:DeleterId" json:"deletedBy"`
	IsDeleted bool           `gorm:"default:false;index;column:IsDeleted" json:"isDeleted"`

	// Relationships
	Parent    *VideoCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children  []VideoCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Image     *SiteImage      `gorm:"foreignKey:ImageID" json:"image,omitempty"`
	Thumbnail *SiteImage      `gorm:"foreignKey:ThumbnailID" json:"thumbnail,omitempty"`
	Videos    []Video         `gorm:"foreignKey:CategoryID" json:"videos,omitempty"`
}

// TableName returns the table name for GORM
func (VideoCategory) TableName() string {
	return "VideoCategories"
}

// BeforeCreate sets the ID and timestamps before creating
func (vc *VideoCategory) BeforeCreate(tx *gorm.DB) error {
	if vc.ID == uuid.Nil {
		vc.ID = uuid.New()
	}

	// Generate slug if not provided
	if vc.Slug == "" {
		vc.Slug = generateSlug(vc.Name)
	}

	// Set default color if not provided
	if vc.Color == "" {
		vc.Color = generateColorFromString(vc.Name)
	}

	// Calculate level and path based on parent
	if vc.ParentID != nil {
		var parent VideoCategory
		if err := tx.First(&parent, "Id = ? AND IsDeleted = 0", *vc.ParentID).Error; err != nil {
			return err
		}
		vc.Level = parent.Level + 1
		vc.Path = parent.Path + "/" + vc.ID.String()
	} else {
		vc.Level = 0
		vc.Path = "/" + vc.ID.String()
	}

	now := time.Now()
	vc.CreatedAt = now
	vc.UpdatedAt = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (vc *VideoCategory) BeforeUpdate(tx *gorm.DB) error {
	// Update path if parent changed
	if vc.ParentID != nil {
		var parent VideoCategory
		if err := tx.First(&parent, "Id = ? AND IsDeleted = 0", *vc.ParentID).Error; err != nil {
			return err
		}
		newLevel := parent.Level + 1
		newPath := parent.Path + "/" + vc.ID.String()

		if vc.Level != newLevel || vc.Path != newPath {
			vc.Level = newLevel
			vc.Path = newPath

			// Update all children paths recursively
			if err := vc.updateChildrenPaths(tx); err != nil {
				return err
			}
		}
	} else {
		// Root category
		newLevel := 0
		newPath := "/" + vc.ID.String()

		if vc.Level != newLevel || vc.Path != newPath {
			vc.Level = newLevel
			vc.Path = newPath

			// Update all children paths recursively
			if err := vc.updateChildrenPaths(tx); err != nil {
				return err
			}
		}
	}

	vc.UpdatedAt = time.Now()
	return nil
}

// updateChildrenPaths updates the paths of all children recursively
func (vc *VideoCategory) updateChildrenPaths(tx *gorm.DB) error {
	var children []VideoCategory
	if err := tx.Where("ParentId = ? AND IsDeleted = 0", vc.ID).Find(&children).Error; err != nil {
		return err
	}

	for _, child := range children {
		child.Level = vc.Level + 1
		child.Path = vc.Path + "/" + child.ID.String()

		if err := tx.Save(&child).Error; err != nil {
			return err
		}

		// Recursively update grandchildren
		if err := child.updateChildrenPaths(tx); err != nil {
			return err
		}
	}

	return nil
}

// Business logic methods

// IsRoot returns true if this is a root category
func (vc *VideoCategory) IsRoot() bool {
	return vc.ParentID == nil
}

// GetDepth returns the depth level of the category
func (vc *VideoCategory) GetDepth() int {
	return vc.Level
}

// CanHaveChildren returns true if this category can have children
func (vc *VideoCategory) CanHaveChildren(maxDepth int) bool {
	return vc.Level < maxDepth
}

// CanBeDeleted returns true if the category can be deleted
func (vc *VideoCategory) CanBeDeleted() bool {
	return vc.VideoCount == 0 && !vc.HasChildren()
}

// HasChildren returns true if the category has child categories
func (vc *VideoCategory) HasChildren() bool {
	return len(vc.Children) > 0
}

// GetFullPath returns the full path of category names
func (vc *VideoCategory) GetFullPath() string {
	if vc.Parent == nil {
		return vc.Name
	}
	return vc.Parent.GetFullPath() + " > " + vc.Name
}

// IncrementVideoCount increments the video count
func (vc *VideoCategory) IncrementVideoCount() {
	vc.VideoCount++
}

// DecrementVideoCount decrements the video count
func (vc *VideoCategory) DecrementVideoCount() {
	if vc.VideoCount > 0 {
		vc.VideoCount--
	}
}
