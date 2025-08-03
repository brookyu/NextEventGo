package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// ArticleCategoryRepository defines the interface for ArticleCategory data operations
type ArticleCategoryRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, category *entities.ArticleCategory) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.ArticleCategory, error)
	GetAll(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error)
	GetAllOrdered(ctx context.Context) ([]*entities.ArticleCategory, error)
	GetByName(ctx context.Context, name string) (*entities.ArticleCategory, error)
	Update(ctx context.Context, category *entities.ArticleCategory) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Active categories only
	GetActive(ctx context.Context, offset, limit int) ([]*entities.ArticleCategory, error)
	GetActiveOrdered(ctx context.Context) ([]*entities.ArticleCategory, error)
	
	// Category with article counts
	GetWithArticleCount(ctx context.Context, id uuid.UUID) (*CategoryWithArticleCount, error)
	GetAllWithArticleCounts(ctx context.Context) ([]*CategoryWithArticleCount, error)
	
	// Counting operations
	Count(ctx context.Context) (int64, error)
	CountActive(ctx context.Context) (int64, error)
}

// CategoryWithArticleCount represents a category with its article count
type CategoryWithArticleCount struct {
	Category     *entities.ArticleCategory
	ArticleCount int64
	PublishedCount int64
	DraftCount   int64
}
