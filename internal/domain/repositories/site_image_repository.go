package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// SiteImageRepository defines the interface for SiteImage data operations
type SiteImageRepository interface {
	// Create creates a new site image
	Create(ctx context.Context, image *entities.SiteImage) error
	
	// GetByID retrieves a site image by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error)
	
	// GetAll retrieves all site images with pagination
	GetAll(ctx context.Context, offset, limit int) ([]*entities.SiteImage, error)
	
	// GetByCategory retrieves images by category ID with pagination
	GetByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int) ([]*entities.SiteImage, error)
	
	// SearchByName searches images by name with pagination
	SearchByName(ctx context.Context, name string, offset, limit int) ([]*entities.SiteImage, error)
	
	// GetByMediaId retrieves an image by WeChat media ID
	GetByMediaId(ctx context.Context, mediaId string) (*entities.SiteImage, error)
	
	// Update updates an existing site image
	Update(ctx context.Context, image *entities.SiteImage) error
	
	// Delete soft deletes a site image
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Count returns the total number of images
	Count(ctx context.Context) (int64, error)
	
	// CountByCategory returns the number of images in a category
	CountByCategory(ctx context.Context, categoryId uuid.UUID) (int64, error)
}
