package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// News category service errors
var (
	ErrNewsCategoryNotFound = errors.New("news category not found")
	ErrCategoryHasChildren  = errors.New("category has children and cannot be deleted")
	ErrCategoryHasNews      = errors.New("category has news and cannot be deleted")
	ErrCircularReference    = errors.New("circular reference detected")
	ErrInvalidParent        = errors.New("invalid parent category")
	ErrDuplicateSlug        = errors.New("category slug already exists")
)

// NewsCategoryService handles news category-related business logic
type NewsCategoryService struct {
	categoryRepo repositories.NewsCategoryRepository
	newsRepo     repositories.NewsRepository
	logger       *zap.Logger
	config       NewsCategoryServiceConfig
}

// NewsCategoryServiceConfig holds configuration for the category service
type NewsCategoryServiceConfig struct {
	MaxNameLength        int
	MaxDescriptionLength int
	MaxSlugLength        int
	MaxDepthLevel        int
	AutoGenerateSlug     bool
	RequireUniqueSlug    bool
	EnableHierarchy      bool
	EnableSorting        bool
}

// DefaultNewsCategoryServiceConfig returns default configuration
func DefaultNewsCategoryServiceConfig() NewsCategoryServiceConfig {
	return NewsCategoryServiceConfig{
		MaxNameLength:        100,
		MaxDescriptionLength: 1000,
		MaxSlugLength:        100,
		MaxDepthLevel:        5,
		AutoGenerateSlug:     true,
		RequireUniqueSlug:    true,
		EnableHierarchy:      true,
		EnableSorting:        true,
	}
}

// NewNewsCategoryService creates a new news category service
func NewNewsCategoryService(
	categoryRepo repositories.NewsCategoryRepository,
	newsRepo repositories.NewsRepository,
	logger *zap.Logger,
) *NewsCategoryService {
	return &NewsCategoryService{
		categoryRepo: categoryRepo,
		newsRepo:     newsRepo,
		logger:       logger,
		config:       DefaultNewsCategoryServiceConfig(),
	}
}

// CreateCategory creates a new news category
func (s *NewsCategoryService) CreateCategory(ctx context.Context, req NewsCategoryCreateRequest, userID uuid.UUID) (*entities.NewsCategory, error) {
	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Validate parent if specified
	var parentCategory *entities.NewsCategory
	var level int
	var path string

	if req.ParentID != nil {
		var err error
		parentCategory, err = s.categoryRepo.GetByID(ctx, *req.ParentID)
		if err != nil {
			return nil, fmt.Errorf("parent category not found: %w", err)
		}

		// Check depth limit
		if parentCategory.Level >= s.config.MaxDepthLevel {
			return nil, fmt.Errorf("maximum depth level (%d) exceeded", s.config.MaxDepthLevel)
		}

		level = parentCategory.Level + 1
		path = fmt.Sprintf("%s/%s", parentCategory.Path, req.Slug)
	} else {
		level = 0
		path = req.Slug
	}

	// Generate slug if needed
	slug := req.Slug
	if s.config.AutoGenerateSlug && slug == "" {
		slug = s.generateSlug(req.Name)
	}

	// Check slug uniqueness
	if s.config.RequireUniqueSlug {
		if err := s.checkSlugUniqueness(ctx, slug, nil); err != nil {
			return nil, err
		}
	}

	// Create category entity
	category := &entities.NewsCategory{
		ID:              uuid.New(),
		Name:            req.Name,
		Slug:            slug,
		Description:     req.Description,
		Color:           req.Color,
		Icon:            req.Icon,
		ParentID:        req.ParentID,
		Level:           level,
		Path:            path,
		DisplayOrder:    req.DisplayOrder,
		IsActive:        true,
		IsVisible:       req.IsVisible,
		IsFeatured:      req.IsFeatured,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		Keywords:        req.Keywords,
		ImageID:         req.ImageID,
		ThumbnailID:     req.ThumbnailID,
		NewsCount:       0,
		CreatedBy:       &userID,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Create category in database
	if err := s.categoryRepo.Create(ctx, category); err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	s.logger.Info("Category created successfully",
		zap.String("categoryID", category.ID.String()),
		zap.String("name", category.Name),
		zap.String("slug", category.Slug))

	return category, nil
}

// GetCategory retrieves a category by ID
func (s *NewsCategoryService) GetCategory(ctx context.Context, id uuid.UUID) (*entities.NewsCategory, error) {
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrNewsCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

// GetCategoryBySlug retrieves a category by slug
func (s *NewsCategoryService) GetCategoryBySlug(ctx context.Context, slug string) (*entities.NewsCategory, error) {
	category, err := s.categoryRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrNewsCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

// UpdateCategory updates an existing category
func (s *NewsCategoryService) UpdateCategory(ctx context.Context, id uuid.UUID, req NewsCategoryUpdateRequest, userID uuid.UUID) (*entities.NewsCategory, error) {
	// Get existing category
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrNewsCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	// Validate request
	if err := s.validateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Update fields
	s.updateCategoryFields(category, req)
	category.UpdatedBy = &userID
	category.UpdatedAt = time.Now()

	// Handle parent change
	if req.ParentID != nil {
		if err := s.updateCategoryParent(ctx, category, req.ParentID); err != nil {
			return nil, fmt.Errorf("failed to update parent: %w", err)
		}
	}

	// Check slug uniqueness if changed
	if req.Slug != nil && *req.Slug != category.Slug {
		if s.config.RequireUniqueSlug {
			if err := s.checkSlugUniqueness(ctx, *req.Slug, &id); err != nil {
				return nil, err
			}
		}
		category.Slug = *req.Slug
	}

	// Update category in database
	if err := s.categoryRepo.Update(ctx, category); err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}

	s.logger.Info("Category updated successfully", zap.String("categoryID", category.ID.String()))

	return category, nil
}

// DeleteCategory deletes a category
func (s *NewsCategoryService) DeleteCategory(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get category
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrNewsCategoryNotFound
		}
		return fmt.Errorf("failed to get category: %w", err)
	}

	// Check if category has children
	children, err := s.categoryRepo.GetChildren(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check children: %w", err)
	}
	if len(children) > 0 {
		return ErrCategoryHasChildren
	}

	// Check if category has news
	if category.NewsCount > 0 {
		return ErrCategoryHasNews
	}

	// Delete category
	if err := s.categoryRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	s.logger.Info("Category deleted successfully", zap.String("categoryID", category.ID.String()))

	return nil
}

// ListCategories retrieves categories with filtering
func (s *NewsCategoryService) ListCategories(ctx context.Context, filter repositories.NewsCategoryFilter) ([]*entities.NewsCategory, int64, error) {
	// Get categories
	categories, err := s.categoryRepo.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list categories: %w", err)
	}

	// Get total count
	total, err := s.categoryRepo.Count(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count categories: %w", err)
	}

	return categories, total, nil
}

// GetCategoryTree retrieves the complete category tree
func (s *NewsCategoryService) GetCategoryTree(ctx context.Context) ([]*entities.NewsCategory, error) {
	if !s.config.EnableHierarchy {
		return s.categoryRepo.GetActive(ctx)
	}

	return s.categoryRepo.GetCategoryTree(ctx)
}

// GetRootCategories retrieves root categories
func (s *NewsCategoryService) GetRootCategories(ctx context.Context) ([]*entities.NewsCategory, error) {
	return s.categoryRepo.GetRootCategories(ctx)
}

// GetChildren retrieves child categories
func (s *NewsCategoryService) GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.NewsCategory, error) {
	return s.categoryRepo.GetChildren(ctx, parentID)
}

// UpdateNewsCount updates the news count for a category
func (s *NewsCategoryService) UpdateNewsCount(ctx context.Context, categoryID uuid.UUID) error {
	return s.categoryRepo.UpdateNewsCount(ctx, categoryID)
}

// Helper methods

func (s *NewsCategoryService) validateCreateRequest(req NewsCategoryCreateRequest) error {
	if len(req.Name) == 0 || len(req.Name) > s.config.MaxNameLength {
		return fmt.Errorf("name must be between 1 and %d characters", s.config.MaxNameLength)
	}

	if len(req.Description) > s.config.MaxDescriptionLength {
		return fmt.Errorf("description must be less than %d characters", s.config.MaxDescriptionLength)
	}

	if len(req.Slug) > s.config.MaxSlugLength {
		return fmt.Errorf("slug must be less than %d characters", s.config.MaxSlugLength)
	}

	return nil
}

func (s *NewsCategoryService) validateUpdateRequest(req NewsCategoryUpdateRequest) error {
	if req.Name != nil && (len(*req.Name) == 0 || len(*req.Name) > s.config.MaxNameLength) {
		return fmt.Errorf("name must be between 1 and %d characters", s.config.MaxNameLength)
	}

	if req.Description != nil && len(*req.Description) > s.config.MaxDescriptionLength {
		return fmt.Errorf("description must be less than %d characters", s.config.MaxDescriptionLength)
	}

	if req.Slug != nil && len(*req.Slug) > s.config.MaxSlugLength {
		return fmt.Errorf("slug must be less than %d characters", s.config.MaxSlugLength)
	}

	return nil
}

func (s *NewsCategoryService) generateSlug(name string) string {
	// Simple slug generation - in production, use a proper slug library
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters (simplified)
	return slug
}

func (s *NewsCategoryService) checkSlugUniqueness(ctx context.Context, slug string, excludeID *uuid.UUID) error {
	existing, err := s.categoryRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil // Slug is unique
		}
		return fmt.Errorf("failed to check slug uniqueness: %w", err)
	}

	// If we're updating and the existing category is the same one, it's OK
	if excludeID != nil && existing.ID == *excludeID {
		return nil
	}

	return ErrDuplicateSlug
}

func (s *NewsCategoryService) updateCategoryFields(category *entities.NewsCategory, req NewsCategoryUpdateRequest) {
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.Color != nil {
		category.Color = *req.Color
	}
	if req.Icon != nil {
		category.Icon = *req.Icon
	}
	if req.DisplayOrder != nil {
		category.DisplayOrder = *req.DisplayOrder
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}
	if req.IsVisible != nil {
		category.IsVisible = *req.IsVisible
	}
	if req.IsFeatured != nil {
		category.IsFeatured = *req.IsFeatured
	}
	if req.MetaTitle != nil {
		category.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		category.MetaDescription = *req.MetaDescription
	}
	if req.Keywords != nil {
		category.Keywords = *req.Keywords
	}
	if req.ImageID != nil {
		category.ImageID = req.ImageID
	}
	if req.ThumbnailID != nil {
		category.ThumbnailID = req.ThumbnailID
	}
}

func (s *NewsCategoryService) updateCategoryParent(ctx context.Context, category *entities.NewsCategory, newParentID *uuid.UUID) error {
	if !s.config.EnableHierarchy {
		return fmt.Errorf("hierarchy is disabled")
	}

	// If removing parent (making it root)
	if newParentID == nil {
		category.ParentID = nil
		category.Level = 0
		category.Path = category.Slug
		return nil
	}

	// Get new parent
	newParent, err := s.categoryRepo.GetByID(ctx, *newParentID)
	if err != nil {
		return ErrInvalidParent
	}

	// Check for circular reference
	if err := s.checkCircularReference(ctx, category.ID, *newParentID); err != nil {
		return err
	}

	// Check depth limit
	if newParent.Level >= s.config.MaxDepthLevel {
		return fmt.Errorf("maximum depth level (%d) exceeded", s.config.MaxDepthLevel)
	}

	// Update hierarchy
	category.ParentID = newParentID
	category.Level = newParent.Level + 1
	category.Path = fmt.Sprintf("%s/%s", newParent.Path, category.Slug)

	return nil
}

func (s *NewsCategoryService) checkCircularReference(ctx context.Context, categoryID, newParentID uuid.UUID) error {
	// Check if the new parent is a descendant of the current category
	current := newParentID
	for {
		if current == categoryID {
			return ErrCircularReference
		}

		parent, err := s.categoryRepo.GetByID(ctx, current)
		if err != nil {
			break
		}

		if parent.ParentID == nil {
			break
		}

		current = *parent.ParentID
	}

	return nil
}

// Request types for category service

type NewsCategoryCreateRequest struct {
	Name            string     `json:"name" binding:"required,max=100"`
	Slug            string     `json:"slug" binding:"max=100"`
	Description     string     `json:"description" binding:"max=1000"`
	Color           string     `json:"color" binding:"max=7"`
	Icon            string     `json:"icon" binding:"max=50"`
	ParentID        *uuid.UUID `json:"parentId"`
	DisplayOrder    int        `json:"displayOrder"`
	IsVisible       bool       `json:"isVisible"`
	IsFeatured      bool       `json:"isFeatured"`
	MetaTitle       string     `json:"metaTitle" binding:"max=500"`
	MetaDescription string     `json:"metaDescription" binding:"max=1000"`
	Keywords        string     `json:"keywords" binding:"max=1000"`
	ImageID         *uuid.UUID `json:"imageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`
}

type NewsCategoryUpdateRequest struct {
	Name            *string    `json:"name" binding:"omitempty,max=100"`
	Slug            *string    `json:"slug" binding:"omitempty,max=100"`
	Description     *string    `json:"description" binding:"omitempty,max=1000"`
	Color           *string    `json:"color" binding:"omitempty,max=7"`
	Icon            *string    `json:"icon" binding:"omitempty,max=50"`
	ParentID        *uuid.UUID `json:"parentId"`
	DisplayOrder    *int       `json:"displayOrder"`
	IsActive        *bool      `json:"isActive"`
	IsVisible       *bool      `json:"isVisible"`
	IsFeatured      *bool      `json:"isFeatured"`
	MetaTitle       *string    `json:"metaTitle" binding:"omitempty,max=500"`
	MetaDescription *string    `json:"metaDescription" binding:"omitempty,max=1000"`
	Keywords        *string    `json:"keywords" binding:"omitempty,max=1000"`
	ImageID         *uuid.UUID `json:"imageId"`
	ThumbnailID     *uuid.UUID `json:"thumbnailId"`
}
