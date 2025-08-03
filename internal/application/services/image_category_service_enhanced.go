package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// ImageCategoryServiceEnhanced provides enhanced business logic for image category management
type ImageCategoryServiceEnhanced struct {
	categoryRepo repositories.ImageCategoryRepository
	logger       *zap.Logger
}

// NewImageCategoryServiceEnhanced creates a new enhanced image category service
func NewImageCategoryServiceEnhanced(
	categoryRepo repositories.ImageCategoryRepository,
	logger *zap.Logger,
) *ImageCategoryServiceEnhanced {
	return &ImageCategoryServiceEnhanced{
		categoryRepo: categoryRepo,
		logger:       logger,
	}
}

// CreateCategory creates a new image category with validation
func (s *ImageCategoryServiceEnhanced) CreateCategory(ctx context.Context, req *CreateCategoryRequest) (*entities.ImageCategory, error) {
	s.logger.Debug("Creating image category", zap.String("name", req.Name))

	// Validate request
	if err := s.validateCreateRequest(ctx, req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Create category entity
	category := &entities.ImageCategory{
		Name:         req.Name,
		Slug:         req.Slug,
		Description:  req.Description,
		ParentID:     req.ParentID,
		Type:         req.Type,
		Status:       req.Status,
		Color:        req.Color,
		Icon:         req.Icon,
		SortOrder:    req.SortOrder,
		IsVisible:    true, // Will be set properly below
		MaxFileSize:  req.MaxFileSize,
		AllowedTypes: req.AllowedTypes,
		RequiresAuth: req.RequiresAuth,
		CreatedBy:    req.CreatedBy,
	}

	// Set defaults
	if category.Type == "" {
		category.Type = entities.ImageCategoryTypeGeneral
	}
	if category.Status == "" {
		category.Status = entities.ImageCategoryStatusActive
	}
	if req.IsVisible != nil {
		category.IsVisible = *req.IsVisible
	} else {
		category.IsVisible = true
	}

	// Create in repository
	if err := s.categoryRepo.Create(ctx, category); err != nil {
		s.logger.Error("Failed to create category", zap.Error(err))
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	s.logger.Info("Image category created successfully",
		zap.String("id", category.ID.String()),
		zap.String("name", category.Name))

	return category, nil
}

// GetCategory retrieves a category by ID with options
func (s *ImageCategoryServiceEnhanced) GetCategory(ctx context.Context, id uuid.UUID, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	category, err := s.categoryRepo.GetByID(ctx, id, options)
	if err != nil {
		s.logger.Error("Failed to get category", zap.String("id", id.String()), zap.Error(err))
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

// GetCategoryBySlug retrieves a category by slug
func (s *ImageCategoryServiceEnhanced) GetCategoryBySlug(ctx context.Context, slug string, options *repositories.ImageCategoryListOptions) (*entities.ImageCategory, error) {
	category, err := s.categoryRepo.GetBySlug(ctx, slug, options)
	if err != nil {
		s.logger.Error("Failed to get category by slug", zap.String("slug", slug), zap.Error(err))
		return nil, fmt.Errorf("failed to get category by slug: %w", err)
	}

	return category, nil
}

// UpdateCategory updates an existing category
func (s *ImageCategoryServiceEnhanced) UpdateCategory(ctx context.Context, id uuid.UUID, req *UpdateCategoryRequest) (*entities.ImageCategory, error) {
	s.logger.Debug("Updating image category", zap.String("id", id.String()))

	// Get existing category
	category, err := s.categoryRepo.GetByID(ctx, id, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	// Validate update request
	if err := s.validateUpdateRequest(ctx, category, req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Update fields
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Slug != nil {
		category.Slug = *req.Slug
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.ParentID != nil {
		category.ParentID = req.ParentID
	}
	if req.Type != nil {
		category.Type = *req.Type
	}
	if req.Status != nil {
		category.Status = *req.Status
	}
	if req.Color != nil {
		category.Color = *req.Color
	}
	if req.Icon != nil {
		category.Icon = *req.Icon
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.IsVisible != nil {
		category.IsVisible = *req.IsVisible
	}
	if req.MaxFileSize != nil {
		category.MaxFileSize = *req.MaxFileSize
	}
	if req.AllowedTypes != nil {
		category.AllowedTypes = *req.AllowedTypes
	}
	if req.RequiresAuth != nil {
		category.RequiresAuth = *req.RequiresAuth
	}
	if req.UpdatedBy != nil {
		category.UpdatedBy = req.UpdatedBy
	}

	// Update in repository
	if err := s.categoryRepo.Update(ctx, category); err != nil {
		s.logger.Error("Failed to update category", zap.Error(err))
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	s.logger.Info("Image category updated successfully",
		zap.String("id", category.ID.String()),
		zap.String("name", category.Name))

	return category, nil
}

// DeleteCategory deletes a category with validation
func (s *ImageCategoryServiceEnhanced) DeleteCategory(ctx context.Context, id uuid.UUID, deletedBy *uuid.UUID) error {
	s.logger.Debug("Deleting image category", zap.String("id", id.String()))

	// Check if category can be deleted
	canDelete, reason, err := s.categoryRepo.CanDelete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check if category can be deleted: %w", err)
	}

	if !canDelete {
		return fmt.Errorf("cannot delete category: %s", reason)
	}

	// Soft delete the category
	if err := s.categoryRepo.SoftDelete(ctx, id, deletedBy); err != nil {
		s.logger.Error("Failed to delete category", zap.Error(err))
		return fmt.Errorf("failed to delete category: %w", err)
	}

	s.logger.Info("Image category deleted successfully", zap.String("id", id.String()))

	return nil
}

// GetCategories retrieves categories with filtering and options
func (s *ImageCategoryServiceEnhanced) GetCategories(ctx context.Context, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	categories, err := s.categoryRepo.GetWithFilter(ctx, filter, options)
	if err != nil {
		s.logger.Error("Failed to get categories", zap.Error(err))
		return nil, fmt.Errorf("failed to get categories: %w", err)
	}

	return categories, nil
}

// GetCategoryTree retrieves a hierarchical category tree
func (s *ImageCategoryServiceEnhanced) GetCategoryTree(ctx context.Context, rootID *uuid.UUID, maxDepth int) ([]*repositories.ImageCategoryTree, error) {
	tree, err := s.categoryRepo.GetTree(ctx, rootID, maxDepth)
	if err != nil {
		s.logger.Error("Failed to get category tree", zap.Error(err))
		return nil, fmt.Errorf("failed to get category tree: %w", err)
	}

	return tree, nil
}

// GetRootCategories retrieves root categories
func (s *ImageCategoryServiceEnhanced) GetRootCategories(ctx context.Context, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	categories, err := s.categoryRepo.GetRootCategories(ctx, options)
	if err != nil {
		s.logger.Error("Failed to get root categories", zap.Error(err))
		return nil, fmt.Errorf("failed to get root categories: %w", err)
	}

	return categories, nil
}

// GetChildren retrieves direct children of a category
func (s *ImageCategoryServiceEnhanced) GetChildren(ctx context.Context, parentID uuid.UUID, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	categories, err := s.categoryRepo.GetChildren(ctx, parentID, options)
	if err != nil {
		s.logger.Error("Failed to get children categories", zap.String("parentId", parentID.String()), zap.Error(err))
		return nil, fmt.Errorf("failed to get children categories: %w", err)
	}

	return categories, nil
}

// MoveCategory moves a category to a new parent
func (s *ImageCategoryServiceEnhanced) MoveCategory(ctx context.Context, categoryID uuid.UUID, newParentID *uuid.UUID, updatedBy *uuid.UUID) error {
	s.logger.Debug("Moving category",
		zap.String("categoryId", categoryID.String()),
		zap.String("newParentId", func() string {
			if newParentID != nil {
				return newParentID.String()
			}
			return "null"
		}()))

	// Get the category
	category, err := s.categoryRepo.GetByID(ctx, categoryID, nil)
	if err != nil {
		return fmt.Errorf("failed to get category: %w", err)
	}

	// Validate the move - check for circular reference
	if newParentID != nil {
		// Get descendants to check for circular reference
		descendants, err := s.categoryRepo.GetDescendants(ctx, categoryID, 0)
		if err != nil {
			return fmt.Errorf("failed to get descendants: %w", err)
		}

		// Check if new parent is a descendant
		for _, desc := range descendants {
			if desc.ID == *newParentID {
				return fmt.Errorf("invalid parent: would create a circular reference")
			}
		}
	}

	// Update the parent
	category.ParentID = newParentID
	category.UpdatedBy = updatedBy

	if err := s.categoryRepo.Update(ctx, category); err != nil {
		s.logger.Error("Failed to move category", zap.Error(err))
		return fmt.Errorf("failed to move category: %w", err)
	}

	s.logger.Info("Category moved successfully",
		zap.String("categoryId", categoryID.String()),
		zap.String("newParentId", func() string {
			if newParentID != nil {
				return newParentID.String()
			}
			return "null"
		}()))

	return nil
}

// GetCategoryStats retrieves statistics for categories
func (s *ImageCategoryServiceEnhanced) GetCategoryStats(ctx context.Context) (*repositories.ImageCategoryStats, error) {
	stats, err := s.categoryRepo.GetStats(ctx)
	if err != nil {
		s.logger.Error("Failed to get category stats", zap.Error(err))
		return nil, fmt.Errorf("failed to get category stats: %w", err)
	}

	return stats, nil
}

// SearchCategories searches categories by query
func (s *ImageCategoryServiceEnhanced) SearchCategories(ctx context.Context, query string, filter *repositories.ImageCategoryFilter, options *repositories.ImageCategoryListOptions) ([]*entities.ImageCategory, error) {
	categories, err := s.categoryRepo.Search(ctx, query, filter, options)
	if err != nil {
		s.logger.Error("Failed to search categories", zap.String("query", query), zap.Error(err))
		return nil, fmt.Errorf("failed to search categories: %w", err)
	}

	return categories, nil
}

// InitializeSystemCategories creates default system categories
func (s *ImageCategoryServiceEnhanced) InitializeSystemCategories(ctx context.Context) error {
	s.logger.Info("Initializing system categories")

	if err := s.categoryRepo.CreateSystemCategories(ctx); err != nil {
		s.logger.Error("Failed to create system categories", zap.Error(err))
		return fmt.Errorf("failed to create system categories: %w", err)
	}

	s.logger.Info("System categories initialized successfully")
	return nil
}

// Validation methods

func (s *ImageCategoryServiceEnhanced) validateCreateRequest(ctx context.Context, req *CreateCategoryRequest) error {
	if req.Name == "" {
		return fmt.Errorf("name is required")
	}

	// Check name uniqueness within parent
	isUnique, err := s.categoryRepo.IsNameUnique(ctx, req.Name, req.ParentID, nil)
	if err != nil {
		return fmt.Errorf("failed to check name uniqueness: %w", err)
	}
	if !isUnique {
		return fmt.Errorf("name already exists in the same parent category")
	}

	// Check slug uniqueness if provided
	if req.Slug != "" {
		isUnique, err := s.categoryRepo.IsSlugUnique(ctx, req.Slug, nil)
		if err != nil {
			return fmt.Errorf("failed to check slug uniqueness: %w", err)
		}
		if !isUnique {
			return fmt.Errorf("slug already exists")
		}
	}

	// Validate parent if provided
	if req.ParentID != nil {
		_, err := s.categoryRepo.GetByID(ctx, *req.ParentID, nil)
		if err != nil {
			return fmt.Errorf("invalid parent category: %w", err)
		}
	}

	return nil
}

func (s *ImageCategoryServiceEnhanced) validateUpdateRequest(ctx context.Context, category *entities.ImageCategory, req *UpdateCategoryRequest) error {
	// Check name uniqueness if name is being changed
	if req.Name != nil && *req.Name != category.Name {
		isUnique, err := s.categoryRepo.IsNameUnique(ctx, *req.Name, category.ParentID, &category.ID)
		if err != nil {
			return fmt.Errorf("failed to check name uniqueness: %w", err)
		}
		if !isUnique {
			return fmt.Errorf("name already exists in the same parent category")
		}
	}

	// Check slug uniqueness if slug is being changed
	if req.Slug != nil && *req.Slug != category.Slug {
		isUnique, err := s.categoryRepo.IsSlugUnique(ctx, *req.Slug, &category.ID)
		if err != nil {
			return fmt.Errorf("failed to check slug uniqueness: %w", err)
		}
		if !isUnique {
			return fmt.Errorf("slug already exists")
		}
	}

	// Validate parent change
	if req.ParentID != nil && (category.ParentID == nil || *req.ParentID != *category.ParentID) {
		if req.ParentID != nil {
			// Check if parent exists
			_, err := s.categoryRepo.GetByID(ctx, *req.ParentID, nil)
			if err != nil {
				return fmt.Errorf("invalid parent category: %w", err)
			}

			// Check for circular reference
			descendants, err := s.categoryRepo.GetDescendants(ctx, category.ID, 0)
			if err != nil {
				return fmt.Errorf("failed to get descendants: %w", err)
			}

			// Check if new parent is a descendant
			for _, desc := range descendants {
				if desc.ID == *req.ParentID {
					return fmt.Errorf("invalid parent: would create a circular reference")
				}
			}
		}
	}

	return nil
}

// Request/Response types

// CreateCategoryRequest represents a request to create a category
type CreateCategoryRequest struct {
	Name         string                       `json:"name" validate:"required,max=255"`
	Slug         string                       `json:"slug,omitempty" validate:"max=255"`
	Description  string                       `json:"description,omitempty"`
	ParentID     *uuid.UUID                   `json:"parentId,omitempty"`
	Type         entities.ImageCategoryType   `json:"type,omitempty"`
	Status       entities.ImageCategoryStatus `json:"status,omitempty"`
	Color        string                       `json:"color,omitempty" validate:"max=7"`
	Icon         string                       `json:"icon,omitempty" validate:"max=100"`
	SortOrder    int                          `json:"sortOrder,omitempty"`
	IsVisible    *bool                        `json:"isVisible,omitempty"`
	MaxFileSize  int64                        `json:"maxFileSize,omitempty"`
	AllowedTypes string                       `json:"allowedTypes,omitempty" validate:"max=500"`
	RequiresAuth bool                         `json:"requiresAuth,omitempty"`
	CreatedBy    *uuid.UUID                   `json:"createdBy,omitempty"`
}

// UpdateCategoryRequest represents a request to update a category
type UpdateCategoryRequest struct {
	Name         *string                       `json:"name,omitempty" validate:"omitempty,max=255"`
	Slug         *string                       `json:"slug,omitempty" validate:"omitempty,max=255"`
	Description  *string                       `json:"description,omitempty"`
	ParentID     *uuid.UUID                    `json:"parentId,omitempty"`
	Type         *entities.ImageCategoryType   `json:"type,omitempty"`
	Status       *entities.ImageCategoryStatus `json:"status,omitempty"`
	Color        *string                       `json:"color,omitempty" validate:"omitempty,max=7"`
	Icon         *string                       `json:"icon,omitempty" validate:"omitempty,max=100"`
	SortOrder    *int                          `json:"sortOrder,omitempty"`
	IsVisible    *bool                         `json:"isVisible,omitempty"`
	MaxFileSize  *int64                        `json:"maxFileSize,omitempty"`
	AllowedTypes *string                       `json:"allowedTypes,omitempty" validate:"omitempty,max=500"`
	RequiresAuth *bool                         `json:"requiresAuth,omitempty"`
	UpdatedBy    *uuid.UUID                    `json:"updatedBy,omitempty"`
}

// CategoryResponse represents a category response
type CategoryResponse struct {
	*entities.ImageCategory
	ChildrenCount    int64  `json:"childrenCount,omitempty"`
	DescendantsCount int64  `json:"descendantsCount,omitempty"`
	CanDelete        bool   `json:"canDelete,omitempty"`
	DeletionReason   string `json:"deletionReason,omitempty"`
}

// CategoryTreeResponse represents a hierarchical category tree response
type CategoryTreeResponse struct {
	Category *CategoryResponse       `json:"category"`
	Children []*CategoryTreeResponse `json:"children,omitempty"`
	Depth    int                     `json:"depth"`
}

// CategoryListResponse represents a paginated list of categories
type CategoryListResponse struct {
	Categories []*CategoryResponse `json:"categories"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	Limit      int                 `json:"limit"`
	HasNext    bool                `json:"hasNext"`
	HasPrev    bool                `json:"hasPrev"`
}
