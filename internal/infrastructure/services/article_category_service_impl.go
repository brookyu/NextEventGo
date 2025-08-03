package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ArticleCategoryServiceImpl implements the ArticleCategoryService interface
type ArticleCategoryServiceImpl struct {
	categoryRepo repositories.ArticleCategoryRepository
	articleRepo  repositories.SiteArticleRepository
	logger       *zap.Logger
	db           *gorm.DB
}

// NewArticleCategoryService creates a new article category service implementation
func NewArticleCategoryService(
	categoryRepo repositories.ArticleCategoryRepository,
	articleRepo repositories.SiteArticleRepository,
	logger *zap.Logger,
	db *gorm.DB,
) services.ArticleCategoryService {
	return &ArticleCategoryServiceImpl{
		categoryRepo: categoryRepo,
		articleRepo:  articleRepo,
		logger:       logger,
		db:           db,
	}
}

// CreateCategory creates a new article category
func (s *ArticleCategoryServiceImpl) CreateCategory(ctx context.Context, category *entities.ArticleCategory) error {
	s.logger.Info("Creating new article category", zap.String("name", category.Name))
	
	// Validate category data
	if err := s.validateCategory(category); err != nil {
		return fmt.Errorf("category validation failed: %w", err)
	}
	
	// Check for duplicate name
	existing, err := s.categoryRepo.GetByName(ctx, category.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check for duplicate category: %w", err)
	}
	if existing != nil {
		return fmt.Errorf("category with name '%s' already exists", category.Name)
	}
	
	return s.categoryRepo.Create(ctx, category)
}

// GetCategoryByID retrieves an article category by ID
func (s *ArticleCategoryServiceImpl) GetCategoryByID(ctx context.Context, id uuid.UUID) (*entities.ArticleCategory, error) {
	return s.categoryRepo.GetByID(ctx, id)
}

// GetAllCategories retrieves all article categories with pagination
func (s *ArticleCategoryServiceImpl) GetAllCategories(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error) {
	return s.categoryRepo.GetAll(ctx, offset, limit)
}

// GetAllCategoriesOrdered retrieves all categories ordered by sort order
func (s *ArticleCategoryServiceImpl) GetAllCategoriesOrdered(ctx context.Context) ([]*entities.ArticleCategory, error) {
	return s.categoryRepo.GetAllOrdered(ctx)
}

// GetActiveCategories retrieves active categories
func (s *ArticleCategoryServiceImpl) GetActiveCategories(ctx context.Context) ([]*entities.ArticleCategory, error) {
	return s.categoryRepo.GetActiveOrdered(ctx)
}

// GetCategoryByName retrieves a category by name
func (s *ArticleCategoryServiceImpl) GetCategoryByName(ctx context.Context, name string) (*entities.ArticleCategory, error) {
	return s.categoryRepo.GetByName(ctx, name)
}

// UpdateCategory updates an existing article category
func (s *ArticleCategoryServiceImpl) UpdateCategory(ctx context.Context, category *entities.ArticleCategory) error {
	s.logger.Info("Updating article category", zap.String("id", category.ID.String()))
	
	// Validate category data
	if err := s.validateCategory(category); err != nil {
		return fmt.Errorf("category validation failed: %w", err)
	}
	
	// Check for duplicate name (excluding current category)
	existing, err := s.categoryRepo.GetByName(ctx, category.Name)
	if err != nil && err != gorm.ErrRecordNotFound {
		return fmt.Errorf("failed to check for duplicate category: %w", err)
	}
	if existing != nil && existing.ID != category.ID {
		return fmt.Errorf("category with name '%s' already exists", category.Name)
	}
	
	return s.categoryRepo.Update(ctx, category)
}

// DeleteCategory soft deletes an article category
func (s *ArticleCategoryServiceImpl) DeleteCategory(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Deleting article category", zap.String("id", id.String()))
	
	// Check if category has articles
	articleCount, err := s.articleRepo.CountByCategory(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check category usage: %w", err)
	}
	
	if articleCount > 0 {
		return fmt.Errorf("cannot delete category: it contains %d articles", articleCount)
	}
	
	return s.categoryRepo.Delete(ctx, id)
}

// GetCategoryCount returns total category count
func (s *ArticleCategoryServiceImpl) GetCategoryCount(ctx context.Context) (int64, error) {
	return s.categoryRepo.Count(ctx)
}

// GetCategoryWithArticleCount returns a category with its article count
func (s *ArticleCategoryServiceImpl) GetCategoryWithArticleCount(ctx context.Context, categoryId uuid.UUID) (*repositories.CategoryWithArticleCount, error) {
	return s.categoryRepo.GetWithArticleCount(ctx, categoryId)
}

// GetAllCategoriesWithCounts returns all categories with their article counts
func (s *ArticleCategoryServiceImpl) GetAllCategoriesWithCounts(ctx context.Context) ([]*repositories.CategoryWithArticleCount, error) {
	return s.categoryRepo.GetAllWithArticleCounts(ctx)
}

// validateCategory validates category entity
func (s *ArticleCategoryServiceImpl) validateCategory(category *entities.ArticleCategory) error {
	if category.Name == "" {
		return fmt.Errorf("category name is required")
	}
	if len(category.Name) > 255 {
		return fmt.Errorf("category name must be 255 characters or less")
	}
	return nil
}
