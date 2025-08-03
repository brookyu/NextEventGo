package entities

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ImageCategoryType represents the type of image category
type ImageCategoryType string

const (
	ImageCategoryTypeGeneral    ImageCategoryType = "general"
	ImageCategoryTypeArticle    ImageCategoryType = "article"
	ImageCategoryTypeEvent      ImageCategoryType = "event"
	ImageCategoryTypeSurvey     ImageCategoryType = "survey"
	ImageCategoryTypeNews       ImageCategoryType = "news"
	ImageCategoryTypePromotion  ImageCategoryType = "promotion"
	ImageCategoryTypeAvatar     ImageCategoryType = "avatar"
	ImageCategoryTypeBanner     ImageCategoryType = "banner"
	ImageCategoryTypeIcon       ImageCategoryType = "icon"
	ImageCategoryTypeThumbnail  ImageCategoryType = "thumbnail"
	ImageCategoryTypeBackground ImageCategoryType = "background"
)

// ImageCategoryStatus represents the status of an image category
type ImageCategoryStatus string

const (
	ImageCategoryStatusActive   ImageCategoryStatus = "active"
	ImageCategoryStatusInactive ImageCategoryStatus = "inactive"
	ImageCategoryStatusArchived ImageCategoryStatus = "archived"
)

// ImageCategory represents the image category entity for organizing images
type ImageCategory struct {
	ID          uuid.UUID `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null;column:Name" json:"name"`  // Category name
	Slug        string    `gorm:"type:varchar(255);unique;column:Slug" json:"slug"`    // URL-friendly name
	Description string    `gorm:"type:longtext;column:Description" json:"description"` // Category description

	// Hierarchy support
	ParentID *uuid.UUID      `gorm:"type:char(36);column:ParentId" json:"parentId,omitempty"`
	Parent   *ImageCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []ImageCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Level    int             `gorm:"type:int;column:Level;default:0" json:"level"`
	Path     string          `gorm:"type:varchar(1000);column:Path" json:"path"` // Materialized path

	// Category properties
	Type      ImageCategoryType   `gorm:"type:varchar(50);column:Type;default:'general'" json:"type"`
	Status    ImageCategoryStatus `gorm:"type:varchar(20);column:Status;default:'active'" json:"status"`
	Color     string              `gorm:"type:varchar(7);column:Color" json:"color"`            // Hex color code
	Icon      string              `gorm:"type:varchar(100);column:Icon" json:"icon"`            // Icon class or name
	SortOrder int                 `gorm:"type:int;column:SortOrder;default:0" json:"sortOrder"` // Display order

	// Settings
	IsDefault bool `gorm:"type:tinyint(1);column:IsDefault;default:0" json:"isDefault"`
	IsSystem  bool `gorm:"type:tinyint(1);column:IsSystem;default:0" json:"isSystem"`
	IsVisible bool `gorm:"type:tinyint(1);column:IsVisible;default:1" json:"isVisible"`

	// Usage restrictions
	MaxFileSize  int64  `gorm:"type:bigint;column:MaxFileSize;default:0" json:"maxFileSize"`
	AllowedTypes string `gorm:"type:varchar(500);column:AllowedTypes" json:"allowedTypes"`
	RequiresAuth bool   `gorm:"type:tinyint(1);column:RequiresAuth;default:0" json:"requiresAuth"`

	// Statistics
	ImageCount  int64      `gorm:"type:bigint;column:ImageCount;default:0" json:"imageCount"`
	TotalSize   int64      `gorm:"type:bigint;column:TotalSize;default:0" json:"totalSize"`
	LastImageAt *time.Time `gorm:"type:datetime(6);column:LastImageTime" json:"lastImageAt,omitempty"`

	// Relationships
	Images []SiteImage `gorm:"foreignKey:CategoryId" json:"images,omitempty"`

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
func (ImageCategory) TableName() string {
	return "ImageCategories"
}

// BeforeCreate sets the ID and timestamps before creating
func (c *ImageCategory) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}

	// Generate slug if not provided
	if c.Slug == "" {
		c.Slug = generateSlug(c.Name)
	}

	// Set default color if not provided
	if c.Color == "" {
		c.Color = generateColorFromString(c.Name)
	}

	// Calculate level and path based on parent
	if c.ParentID != nil {
		var parent ImageCategory
		if err := tx.First(&parent, "Id = ? AND IsDeleted = 0", *c.ParentID).Error; err != nil {
			return err
		}
		c.Level = parent.Level + 1
		c.Path = parent.Path + "/" + c.ID.String()
	} else {
		c.Level = 0
		c.Path = "/" + c.ID.String()
	}

	now := time.Now()
	c.CreatedAt = now
	c.UpdatedAt = &now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (c *ImageCategory) BeforeUpdate(tx *gorm.DB) error {
	// Update path if parent changed
	if c.ParentID != nil {
		var parent ImageCategory
		if err := tx.First(&parent, "Id = ? AND IsDeleted = 0", *c.ParentID).Error; err != nil {
			return err
		}
		newLevel := parent.Level + 1
		newPath := parent.Path + "/" + c.ID.String()

		if c.Level != newLevel || c.Path != newPath {
			c.Level = newLevel
			c.Path = newPath

			// Update all children paths recursively
			if err := c.updateChildrenPaths(tx); err != nil {
				return err
			}
		}
	} else {
		newLevel := 0
		newPath := "/" + c.ID.String()

		if c.Level != newLevel || c.Path != newPath {
			c.Level = newLevel
			c.Path = newPath

			// Update all children paths recursively
			if err := c.updateChildrenPaths(tx); err != nil {
				return err
			}
		}
	}

	now := time.Now()
	c.UpdatedAt = &now
	return nil
}

// Helper methods

// IsRoot returns true if this is a root category (no parent)
func (c *ImageCategory) IsRoot() bool {
	return c.ParentID == nil
}

// IsLeaf returns true if this category has no children
func (c *ImageCategory) IsLeaf() bool {
	return len(c.Children) == 0
}

// GetFullName returns the full hierarchical name
func (c *ImageCategory) GetFullName() string {
	if c.Parent != nil {
		return c.Parent.GetFullName() + " > " + c.Name
	}
	return c.Name
}

// CanHaveParent checks if this category can have the specified parent
func (c *ImageCategory) CanHaveParent(parentID uuid.UUID, tx *gorm.DB) bool {
	// Cannot be parent of itself
	if c.ID == parentID {
		return false
	}

	// Check if the proposed parent is a descendant (would create a cycle)
	descendants, err := c.GetDescendants(tx)
	if err != nil {
		return false
	}

	for _, desc := range descendants {
		if desc.ID == parentID {
			return false
		}
	}

	return true
}

// GetDescendants returns all descendant categories
func (c *ImageCategory) GetDescendants(tx *gorm.DB) ([]ImageCategory, error) {
	var descendants []ImageCategory

	err := tx.Where("Path LIKE ? AND IsDeleted = 0", c.Path+"/%").
		Order("Level ASC, SortOrder ASC").
		Find(&descendants).Error
	return descendants, err
}

// UpdateImageCount updates the image count for this category
func (c *ImageCategory) UpdateImageCount(tx *gorm.DB) error {
	var count int64
	var totalSize int64

	err := tx.Model(&SiteImage{}).
		Where("CategoryId = ? AND deleted_at IS NULL", c.ID).
		Count(&count).Error
	if err != nil {
		return err
	}

	err = tx.Model(&SiteImage{}).
		Where("CategoryId = ? AND deleted_at IS NULL", c.ID).
		Select("COALESCE(SUM(file_size), 0)").
		Scan(&totalSize).Error
	if err != nil {
		return err
	}

	// Update the category
	return tx.Model(c).Updates(map[string]interface{}{
		"ImageCount": count,
		"TotalSize":  totalSize,
	}).Error
}

// IsAllowedFileType checks if a file type is allowed in this category
func (c *ImageCategory) IsAllowedFileType(mimeType string) bool {
	if c.AllowedTypes == "" {
		return true // No restrictions
	}

	allowedTypes := strings.Split(c.AllowedTypes, ",")
	for _, allowedType := range allowedTypes {
		if strings.TrimSpace(allowedType) == mimeType {
			return true
		}
	}

	return false
}

// IsAllowedFileSize checks if a file size is allowed in this category
func (c *ImageCategory) IsAllowedFileSize(fileSize int64) bool {
	if c.MaxFileSize == 0 {
		return true // No size limit
	}

	return fileSize <= c.MaxFileSize
}

// Private helper methods

func (c *ImageCategory) updateChildrenPaths(tx *gorm.DB) error {
	var children []ImageCategory
	if err := tx.Where("ParentId = ? AND IsDeleted = 0", c.ID).Find(&children).Error; err != nil {
		return err
	}

	for _, child := range children {
		child.Level = c.Level + 1
		child.Path = c.Path + "/" + child.ID.String()

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

// Utility functions

func generateColorFromString(str string) string {
	// Generate a consistent color from string
	hash := 0
	for _, char := range str {
		hash = int(char) + ((hash << 5) - hash)
	}

	// Convert to HSL for better color distribution
	hue := hash % 360
	if hue < 0 {
		hue += 360
	}

	// Use fixed saturation and lightness for consistency
	return hslToHex(hue, 70, 50)
}

func hslToHex(h, s, l int) string {
	// Simple HSL to RGB conversion
	c := float64(100-absInt(2*l-100)) * float64(s) / 10000
	x := c * (1 - absFloat(float64((h/60)%2-1)))
	m := float64(l)/100 - c/2

	var r, g, b float64

	switch h / 60 {
	case 0:
		r, g, b = c, x, 0
	case 1:
		r, g, b = x, c, 0
	case 2:
		r, g, b = 0, c, x
	case 3:
		r, g, b = 0, x, c
	case 4:
		r, g, b = x, 0, c
	case 5:
		r, g, b = c, 0, x
	}

	r = (r + m) * 255
	g = (g + m) * 255
	b = (b + m) * 255

	return fmt.Sprintf("#%02x%02x%02x", int(r), int(g), int(b))
}

func absInt(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func absFloat(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
