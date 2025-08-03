package entities

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SiteArticle represents the article entity with GORM tags matching existing .NET schema
type SiteArticle struct {
	ID                 uuid.UUID  `gorm:"type:char(36);primaryKey;column:Id" json:"id"`
	Title              string     `gorm:"type:longtext;column:Title" json:"title"`                             // Article title
	Slug               string     `gorm:"type:varchar(255);column:Slug;uniqueIndex" json:"slug"`               // URL-friendly slug
	Summary            string     `gorm:"type:longtext;column:Summary" json:"summary"`                         // Article summary/excerpt
	Content            string     `gorm:"type:longtext;column:Content" json:"content"`                         // Full article content (HTML)
	Author             string     `gorm:"type:longtext;column:Author" json:"author"`                           // Article author
	CategoryId         uuid.UUID  `gorm:"type:char(36);column:CategoryId" json:"categoryId"`                   // Article category
	SiteImageId        *uuid.UUID `gorm:"type:char(36);column:SiteImageId" json:"siteImageId,omitempty"`       // Cover image
	PromotionPicId     *uuid.UUID `gorm:"type:char(36);column:PromotionPicId" json:"promotionPicId,omitempty"` // Promotional image
	JumpResourceId     *uuid.UUID `gorm:"type:char(36);column:JumpResourceId" json:"jumpResourceId,omitempty"` // Linked resource
	PromotionCode      string     `gorm:"type:varchar(255);column:PromotionCode" json:"promotionCode"`         // Unique promotion code
	FrontCoverImageUrl string     `gorm:"type:longtext;column:FrontCoverImageUrl" json:"frontCoverImageUrl"`   // Cover image URL
	IsPublished        bool       `gorm:"type:tinyint(1);column:IsPublished;default:0" json:"isPublished"`     // Publication status
	PublishedAt        *time.Time `gorm:"type:datetime(6);column:PublishedAt" json:"publishedAt,omitempty"`    // Publication timestamp
	ViewCount          int64      `gorm:"type:bigint;column:ViewCount;default:0" json:"viewCount"`             // View counter
	ReadCount          int64      `gorm:"type:bigint;column:ReadCount;default:0" json:"readCount"`             // Read completion counter

	// Relationships
	Category       *ArticleCategory `gorm:"foreignKey:CategoryId" json:"category,omitempty"`
	CoverImage     *SiteImage       `gorm:"foreignKey:SiteImageId" json:"coverImage,omitempty"`
	PromotionImage *SiteImage       `gorm:"foreignKey:PromotionPicId" json:"promotionImage,omitempty"`
	Hits           []Hit            `gorm:"foreignKey:ResourceId" json:"hits,omitempty"`

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
func (SiteArticle) TableName() string {
	return "SiteArticles"
}

// BeforeCreate sets the ID and timestamps before creating
func (a *SiteArticle) BeforeCreate(tx *gorm.DB) error {
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

	// Generate slug if not provided
	if a.Slug == "" {
		a.Slug = generateSlugFromTitle(a.Title)
	}

	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (a *SiteArticle) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	a.UpdatedAt = &now
	return nil
}

// IsReadable checks if the article is in a readable state
func (a *SiteArticle) IsReadable() bool {
	return a.IsPublished && !a.IsDeleted
}

// IncrementViewCount increments the view counter
func (a *SiteArticle) IncrementViewCount() {
	a.ViewCount++
}

// IncrementReadCount increments the read completion counter
func (a *SiteArticle) IncrementReadCount() {
	a.ReadCount++
}

// GetReadingRate calculates the reading completion rate
func (a *SiteArticle) GetReadingRate() float64 {
	if a.ViewCount == 0 {
		return 0.0
	}
	return float64(a.ReadCount) / float64(a.ViewCount) * 100.0
}

// generateSlugFromTitle creates a URL-friendly slug from the article title
func generateSlugFromTitle(title string) string {
	if title == "" {
		return ""
	}

	// Convert to lowercase and replace spaces with hyphens
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")

	// Remove special characters (keep only alphanumeric and hyphens)
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}

	// Remove multiple consecutive hyphens
	slug = result.String()
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}

	// Trim hyphens from start and end
	slug = strings.Trim(slug, "-")

	// Limit length to 100 characters
	if len(slug) > 100 {
		slug = slug[:100]
		slug = strings.Trim(slug, "-")
	}

	return slug
}
