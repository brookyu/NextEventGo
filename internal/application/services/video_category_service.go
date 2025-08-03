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

// Video category service errors
var (
	ErrVideoCategoryNotFound     = errors.New("video category not found")
	ErrVideoCategoryHasChildren  = errors.New("video category has children and cannot be deleted")
	ErrVideoCategoryHasVideos    = errors.New("video category has videos and cannot be deleted")
	ErrVideoCategoryCircularRef  = errors.New("circular reference detected")
	ErrVideoCategoryInvalidParent = errors.New("invalid parent category")
	ErrVideoCategoryDuplicateSlug = errors.New("video category slug already exists")
)

// VideoCategoryService handles video category-related business logic
type VideoCategoryService struct {
	categoryRepo repositories.VideoCategoryRepository
	videoRepo    repositories.VideoRepository
	logger       *zap.Logger
	config       VideoCategoryServiceConfig
}

// VideoCategoryServiceConfig holds configuration for the video category service
type VideoCategoryServiceConfig struct {
	MaxNameLength        int
	MaxDescriptionLength int
	MaxSlugLength        int
	MaxDepthLevel        int
	AutoGenerateSlug     bool
	RequireUniqueSlug    bool
	EnableHierarchy      bool
	EnableSorting        bool
}

// DefaultVideoCategoryServiceConfig returns default configuration
func DefaultVideoCategoryServiceConfig() VideoCategoryServiceConfig {
	return VideoCategoryServiceConfig{
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

// NewVideoCategoryService creates a new video category service
func NewVideoCategoryService(
	categoryRepo repositories.VideoCategoryRepository,
	videoRepo repositories.VideoRepository,
	logger *zap.Logger,
) *VideoCategoryService {
	return &VideoCategoryService{
		categoryRepo: categoryRepo,
		videoRepo:    videoRepo,
		logger:       logger,
		config:       DefaultVideoCategoryServiceConfig(),
	}
}

// CreateCategory creates a new video category
func (s *VideoCategoryService) CreateCategory(ctx context.Context, req VideoCategoryCreateRequest, userID uuid.UUID) (*entities.VideoCategory, error) {
	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Validate parent if specified
	var parentCategory *entities.VideoCategory
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
	category := &entities.VideoCategory{
		ID:          uuid.New(),
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		Color:       req.Color,
		Icon:        req.Icon,
		ParentID:    req.ParentID,
		Level:       level,
		Path:        path,
		DisplayOrder: req.DisplayOrder,
		IsActive:    true,
		IsVisible:   req.IsVisible,
		IsFeatured:  req.IsFeatured,
		MetaTitle:   req.MetaTitle,
		MetaDescription: req.MetaDescription,
		Keywords:    req.Keywords,
		ImageID:     req.ImageID,
		ThumbnailID: req.ThumbnailID,
		VideoCount:  0,
		CreatedBy:   &userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Create category in database
	if err := s.categoryRepo.Create(ctx, category); err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	s.logger.Info("Video category created successfully", 
		zap.String("categoryID", category.ID.String()),
		zap.String("name", category.Name),
		zap.String("slug", category.Slug))

	return category, nil
}

// GetCategory retrieves a category by ID
func (s *VideoCategoryService) GetCategory(ctx context.Context, id uuid.UUID) (*entities.VideoCategory, error) {
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

// GetCategoryBySlug retrieves a category by slug
func (s *VideoCategoryService) GetCategoryBySlug(ctx context.Context, slug string) (*entities.VideoCategory, error) {
	category, err := s.categoryRepo.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoCategoryNotFound
		}
		return nil, fmt.Errorf("failed to get category: %w", err)
	}

	return category, nil
}

// UpdateCategory updates an existing category
func (s *VideoCategoryService) UpdateCategory(ctx context.Context, id uuid.UUID, req VideoCategoryUpdateRequest, userID uuid.UUID) (*entities.VideoCategory, error) {
	// Get existing category
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrVideoCategoryNotFound
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

	s.logger.Info("Video category updated successfully", zap.String("categoryID", category.ID.String()))

	return category, nil
}

// DeleteCategory deletes a category
func (s *VideoCategoryService) DeleteCategory(ctx context.Context, id uuid.UUID, userID uuid.UUID) error {
	// Get category
	category, err := s.categoryRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrVideoCategoryNotFound
		}
		return fmt.Errorf("failed to get category: %w", err)
	}

	// Check if category has children
	children, err := s.categoryRepo.GetChildren(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check children: %w", err)
	}
	if len(children) > 0 {
		return ErrVideoCategoryHasChildren
	}

	// Check if category has videos
	if category.VideoCount > 0 {
		return ErrVideoCategoryHasVideos
	}

	// Delete category
	if err := s.categoryRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	s.logger.Info("Video category deleted successfully", zap.String("categoryID", category.ID.String()))

	return nil
}

// ListCategories retrieves categories with filtering
func (s *VideoCategoryService) ListCategories(ctx context.Context, filter repositories.VideoCategoryFilter) ([]*entities.VideoCategory, int64, error) {
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
func (s *VideoCategoryService) GetCategoryTree(ctx context.Context) ([]*entities.VideoCategory, error) {
	if !s.config.EnableHierarchy {
		return s.categoryRepo.GetActive(ctx)
	}

	return s.categoryRepo.GetCategoryTree(ctx)
}

// GetRootCategories retrieves root categories
func (s *VideoCategoryService) GetRootCategories(ctx context.Context) ([]*entities.VideoCategory, error) {
	return s.categoryRepo.GetRootCategories(ctx)
}

// GetChildren retrieves child categories
func (s *VideoCategoryService) GetChildren(ctx context.Context, parentID uuid.UUID) ([]*entities.VideoCategory, error) {
	return s.categoryRepo.GetChildren(ctx, parentID)
}

// UpdateVideoCount updates the video count for a category
func (s *VideoCategoryService) UpdateVideoCount(ctx context.Context, categoryID uuid.UUID) error {
	return s.categoryRepo.UpdateVideoCount(ctx, categoryID)
}

// Helper methods

func (s *VideoCategoryService) validateCreateRequest(req VideoCategoryCreateRequest) error {
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

func (s *VideoCategoryService) validateUpdateRequest(req VideoCategoryUpdateRequest) error {
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

func (s *VideoCategoryService) generateSlug(name string) string {
	// Simple slug generation - in production, use a proper slug library
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove special characters (simplified)
	return slug
}

func (s *VideoCategoryService) checkSlugUniqueness(ctx context.Context, slug string, excludeID *uuid.UUID) error {
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

	return ErrVideoCategoryDuplicateSlug
}

func (s *VideoCategoryService) updateCategoryFields(category *entities.VideoCategory, req VideoCategoryUpdateRequest) {
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

func (s *VideoCategoryService) updateCategoryParent(ctx context.Context, category *entities.VideoCategory, newParentID *uuid.UUID) error {
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
		return ErrVideoCategoryInvalidParent
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

func (s *VideoCategoryService) checkCircularReference(ctx context.Context, categoryID, newParentID uuid.UUID) error {
	// Check if the new parent is a descendant of the current category
	current := newParentID
	for {
		if current == categoryID {
			return ErrVideoCategoryCircularRef
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

// Request types for video category service

type VideoCategoryCreateRequest struct {
	Name        string     `json:"name" binding:"required,max=100"`
	Slug        string     `json:"slug" binding:"max=100"`
	Description string     `json:"description" binding:"max=1000"`
	Color       string     `json:"color" binding:"max=7"`
	Icon        string     `json:"icon" binding:"max=50"`
	ParentID    *uuid.UUID `json:"parentId"`
	DisplayOrder int       `json:"displayOrder"`
	IsVisible   bool       `json:"isVisible"`
	IsFeatured  bool       `json:"isFeatured"`
	MetaTitle   string     `json:"metaTitle" binding:"max=500"`
	MetaDescription string `json:"metaDescription" binding:"max=1000"`
	Keywords    string     `json:"keywords" binding:"max=1000"`
	ImageID     *uuid.UUID `json:"imageId"`
	ThumbnailID *uuid.UUID `json:"thumbnailId"`
}

type VideoCategoryUpdateRequest struct {
	Name        *string    `json:"name" binding:"omitempty,max=100"`
	Slug        *string    `json:"slug" binding:"omitempty,max=100"`
	Description *string    `json:"description" binding:"omitempty,max=1000"`
	Color       *string    `json:"color" binding:"omitempty,max=7"`
	Icon        *string    `json:"icon" binding:"omitempty,max=50"`
	ParentID    *uuid.UUID `json:"parentId"`
	DisplayOrder *int      `json:"displayOrder"`
	IsActive    *bool      `json:"isActive"`
	IsVisible   *bool      `json:"isVisible"`
	IsFeatured  *bool      `json:"isFeatured"`
	MetaTitle   *string    `json:"metaTitle" binding:"omitempty,max=500"`
	MetaDescription *string `json:"metaDescription" binding:"omitempty,max=1000"`
	Keywords    *string    `json:"keywords" binding:"omitempty,max=1000"`
	ImageID     *uuid.UUID `json:"imageId"`
	ThumbnailID *uuid.UUID `json:"thumbnailId"`
}
