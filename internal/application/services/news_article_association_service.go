package services

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

// NewsArticleAssociationService manages relationships between news and articles
type NewsArticleAssociationService struct {
	newsRepo        repositories.NewsRepository
	newsArticleRepo repositories.NewsArticleRepository
	articleRepo     repositories.SiteArticleRepository
	logger          *zap.Logger
	config          *NewsArticleAssociationConfig
}

// NewsArticleAssociationConfig holds configuration for the association service
type NewsArticleAssociationConfig struct {
	MaxArticlesPerNews     int
	MinArticlesPerNews     int
	AllowDuplicateArticles bool
	AutoReorderOnUpdate    bool
	ValidateArticleStatus  bool
	RequireMainStory       bool
	MaxFeaturedArticles    int
}

// DefaultNewsArticleAssociationConfig returns default configuration
func DefaultNewsArticleAssociationConfig() *NewsArticleAssociationConfig {
	return &NewsArticleAssociationConfig{
		MaxArticlesPerNews:     8,
		MinArticlesPerNews:     1,
		AllowDuplicateArticles: false,
		AutoReorderOnUpdate:    true,
		ValidateArticleStatus:  true,
		RequireMainStory:       false,
		MaxFeaturedArticles:    3,
	}
}

// NewNewsArticleAssociationService creates a new association service
func NewNewsArticleAssociationService(
	newsRepo repositories.NewsRepository,
	newsArticleRepo repositories.NewsArticleRepository,
	articleRepo repositories.SiteArticleRepository,
	logger *zap.Logger,
	config *NewsArticleAssociationConfig,
) *NewsArticleAssociationService {
	if config == nil {
		config = DefaultNewsArticleAssociationConfig()
	}

	return &NewsArticleAssociationService{
		newsRepo:        newsRepo,
		newsArticleRepo: newsArticleRepo,
		articleRepo:     articleRepo,
		logger:          logger,
		config:          config,
	}
}

// AssociateArticlesRequest represents a request to associate articles with news
type AssociateArticlesRequest struct {
	NewsID          uuid.UUID                                    `json:"newsId" binding:"required"`
	ArticleIDs      []uuid.UUID                                  `json:"articleIds" binding:"required,min=1"`
	ArticleSettings map[uuid.UUID]NewsArticleAssociationSettings `json:"articleSettings"`
	ReplaceExisting bool                                         `json:"replaceExisting"`
	UserID          *uuid.UUID                                   `json:"userId"`
}

// NewsArticleAssociationSettings represents extended settings for a news-article association
type NewsArticleAssociationSettings struct {
	DisplayOrder int    `json:"displayOrder"`
	IsMainStory  bool   `json:"isMainStory"`
	IsFeatured   bool   `json:"isFeatured"`
	Section      string `json:"section"`
	Summary      string `json:"summary"`
	IsVisible    bool   `json:"isVisible"`
}

// ReorderArticlesRequest represents a request to reorder articles in news
type ReorderArticlesRequest struct {
	NewsID        uuid.UUID         `json:"newsId" binding:"required"`
	ArticleOrders map[uuid.UUID]int `json:"articleOrders" binding:"required"`
	UserID        *uuid.UUID        `json:"userId"`
}

// AssociateArticles associates articles with news
func (s *NewsArticleAssociationService) AssociateArticles(ctx context.Context, req *AssociateArticlesRequest) error {
	s.logger.Info("Associating articles with news",
		zap.String("newsID", req.NewsID.String()),
		zap.Int("articleCount", len(req.ArticleIDs)))

	// Validate request
	if err := s.validateAssociateRequest(req); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Validate news exists
	_, err := s.newsRepo.GetByID(ctx, req.NewsID)
	if err != nil {
		return fmt.Errorf("news not found: %w", err)
	}

	// Validate articles exist and are valid
	if err := s.validateArticles(ctx, req.ArticleIDs); err != nil {
		return fmt.Errorf("article validation failed: %w", err)
	}

	// Check for existing associations if not replacing
	if !req.ReplaceExisting {
		existing, err := s.newsArticleRepo.GetByNewsID(ctx, req.NewsID)
		if err != nil {
			return fmt.Errorf("failed to get existing associations: %w", err)
		}
		if len(existing)+len(req.ArticleIDs) > s.config.MaxArticlesPerNews {
			return fmt.Errorf("total articles would exceed maximum of %d", s.config.MaxArticlesPerNews)
		}
	}

	// Delete existing associations if replacing
	if req.ReplaceExisting {
		if err := s.newsArticleRepo.DeleteByNewsID(ctx, req.NewsID); err != nil {
			return fmt.Errorf("failed to delete existing associations: %w", err)
		}
	}

	// Create new associations
	newsArticles := make([]*entities.NewsArticle, len(req.ArticleIDs))
	mainStoryCount := 0
	featuredCount := 0

	for i, articleID := range req.ArticleIDs {
		newsArticle := &entities.NewsArticle{
			Id:           uuid.New(),
			NewsID:       req.NewsID,
			ArticleID:    articleID,
			DisplayOrder: i + 1,
			IsMainStory:  false,
			IsFeatured:   false,
			IsVisible:    true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		// Apply settings if provided
		if setting, exists := req.ArticleSettings[articleID]; exists {
			newsArticle.DisplayOrder = setting.DisplayOrder
			newsArticle.IsMainStory = setting.IsMainStory
			newsArticle.IsFeatured = setting.IsFeatured
			newsArticle.Section = setting.Section
			newsArticle.Summary = setting.Summary
			newsArticle.IsVisible = setting.IsVisible

			if setting.IsMainStory {
				mainStoryCount++
			}
			if setting.IsFeatured {
				featuredCount++
			}
		}

		if req.UserID != nil {
			newsArticle.CreatedBy = req.UserID
			newsArticle.UpdatedBy = req.UserID
		}

		newsArticles[i] = newsArticle
	}

	// Validate business rules
	if err := s.validateBusinessRules(mainStoryCount, featuredCount); err != nil {
		return err
	}

	// Auto-reorder if enabled
	if s.config.AutoReorderOnUpdate {
		s.autoReorderArticles(newsArticles)
	}

	// Create associations
	if err := s.newsArticleRepo.CreateBulk(ctx, newsArticles); err != nil {
		return fmt.Errorf("failed to create associations: %w", err)
	}

	s.logger.Info("Articles associated successfully",
		zap.String("newsID", req.NewsID.String()),
		zap.Int("articleCount", len(req.ArticleIDs)),
		zap.Int("mainStoryCount", mainStoryCount),
		zap.Int("featuredCount", featuredCount))

	return nil
}

// ReorderArticles reorders articles within a news publication
func (s *NewsArticleAssociationService) ReorderArticles(ctx context.Context, req *ReorderArticlesRequest) error {
	s.logger.Info("Reordering articles in news",
		zap.String("newsID", req.NewsID.String()),
		zap.Int("articleCount", len(req.ArticleOrders)))

	// Validate news exists
	if _, err := s.newsRepo.GetByID(ctx, req.NewsID); err != nil {
		return fmt.Errorf("news not found: %w", err)
	}

	// Get existing associations
	existing, err := s.newsArticleRepo.GetByNewsID(ctx, req.NewsID)
	if err != nil {
		return fmt.Errorf("failed to get existing associations: %w", err)
	}

	// Validate all articles are included in reorder request
	if len(req.ArticleOrders) != len(existing) {
		return fmt.Errorf("reorder request must include all %d articles", len(existing))
	}

	// Update display orders
	for _, newsArticle := range existing {
		if newOrder, exists := req.ArticleOrders[newsArticle.ArticleID]; exists {
			if err := s.newsArticleRepo.UpdateDisplayOrder(ctx, newsArticle.Id, newOrder); err != nil {
				return fmt.Errorf("failed to update display order for article %s: %w", newsArticle.ArticleID, err)
			}
		} else {
			return fmt.Errorf("article %s not included in reorder request", newsArticle.ArticleID)
		}
	}

	s.logger.Info("Articles reordered successfully", zap.String("newsID", req.NewsID.String()))
	return nil
}

// SetMainStory sets an article as the main story for news
func (s *NewsArticleAssociationService) SetMainStory(ctx context.Context, newsID, articleID uuid.UUID, userID *uuid.UUID) error {
	s.logger.Info("Setting main story",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	// Validate association exists
	association, err := s.newsArticleRepo.GetByNewsAndArticle(ctx, newsID, articleID)
	if err != nil {
		return fmt.Errorf("association not found: %w", err)
	}

	// Clear existing main story
	existing, err := s.newsArticleRepo.GetMainStory(ctx, newsID)
	if err == nil && existing != nil && existing.Id != association.Id {
		existing.IsMainStory = false
		existing.UpdatedAt = time.Now()
		if userID != nil {
			existing.UpdatedBy = userID
		}
		if err := s.newsArticleRepo.Update(ctx, existing); err != nil {
			return fmt.Errorf("failed to clear existing main story: %w", err)
		}
	}

	// Set new main story
	association.IsMainStory = true
	association.UpdatedAt = time.Now()
	if userID != nil {
		association.UpdatedBy = userID
	}

	if err := s.newsArticleRepo.Update(ctx, association); err != nil {
		return fmt.Errorf("failed to set main story: %w", err)
	}

	s.logger.Info("Main story set successfully",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	return nil
}

// SetFeatured sets the featured status of an article in news
func (s *NewsArticleAssociationService) SetFeatured(ctx context.Context, newsID, articleID uuid.UUID, featured bool, userID *uuid.UUID) error {
	s.logger.Info("Setting featured status",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()),
		zap.Bool("featured", featured))

	// Validate association exists
	association, err := s.newsArticleRepo.GetByNewsAndArticle(ctx, newsID, articleID)
	if err != nil {
		return fmt.Errorf("association not found: %w", err)
	}

	// Check featured limit if setting to featured
	if featured && !association.IsFeatured {
		featuredArticles, err := s.newsArticleRepo.GetFeaturedArticles(ctx, newsID)
		if err != nil {
			return fmt.Errorf("failed to get featured articles: %w", err)
		}
		if len(featuredArticles) >= s.config.MaxFeaturedArticles {
			return fmt.Errorf("maximum %d featured articles allowed", s.config.MaxFeaturedArticles)
		}
	}

	// Update featured status
	association.IsFeatured = featured
	association.UpdatedAt = time.Now()
	if userID != nil {
		association.UpdatedBy = userID
	}

	if err := s.newsArticleRepo.Update(ctx, association); err != nil {
		return fmt.Errorf("failed to update featured status: %w", err)
	}

	s.logger.Info("Featured status updated successfully",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()),
		zap.Bool("featured", featured))

	return nil
}

// RemoveArticle removes an article from news
func (s *NewsArticleAssociationService) RemoveArticle(ctx context.Context, newsID, articleID uuid.UUID, userID *uuid.UUID) error {
	s.logger.Info("Removing article from news",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	// Get existing associations to check minimum requirement
	existing, err := s.newsArticleRepo.GetByNewsID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get existing associations: %w", err)
	}

	if len(existing) <= s.config.MinArticlesPerNews {
		return fmt.Errorf("cannot remove article: minimum %d articles required", s.config.MinArticlesPerNews)
	}

	// Find and delete the association
	association, err := s.newsArticleRepo.GetByNewsAndArticle(ctx, newsID, articleID)
	if err != nil {
		return fmt.Errorf("association not found: %w", err)
	}

	if err := s.newsArticleRepo.Delete(ctx, association.Id); err != nil {
		return fmt.Errorf("failed to delete association: %w", err)
	}

	// Reorder remaining articles if auto-reorder is enabled
	if s.config.AutoReorderOnUpdate {
		remaining, err := s.newsArticleRepo.GetByNewsID(ctx, newsID)
		if err != nil {
			s.logger.Warn("Failed to get remaining articles for reordering", zap.Error(err))
		} else {
			s.reorderRemainingArticles(ctx, remaining)
		}
	}

	s.logger.Info("Article removed successfully",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	return nil
}

// GetNewsArticles retrieves all articles associated with news
func (s *NewsArticleAssociationService) GetNewsArticles(ctx context.Context, newsID uuid.UUID) ([]*entities.NewsArticle, error) {
	return s.newsArticleRepo.GetByNewsID(ctx, newsID)
}

// GetArticleNews retrieves all news associated with an article
func (s *NewsArticleAssociationService) GetArticleNews(ctx context.Context, articleID uuid.UUID) ([]*entities.NewsArticle, error) {
	return s.newsArticleRepo.GetByArticleID(ctx, articleID)
}

// UpdateArticleSettings updates settings for a news-article association
func (s *NewsArticleAssociationService) UpdateArticleSettings(ctx context.Context, newsID, articleID uuid.UUID, settings NewsArticleAssociationSettings, userID *uuid.UUID) error {
	s.logger.Info("Updating article settings",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	// Get association
	association, err := s.newsArticleRepo.GetByNewsAndArticle(ctx, newsID, articleID)
	if err != nil {
		return fmt.Errorf("association not found: %w", err)
	}

	// Validate business rules if changing main story or featured status
	if settings.IsMainStory && !association.IsMainStory {
		// Clear existing main story
		if err := s.clearMainStory(ctx, newsID, userID); err != nil {
			return fmt.Errorf("failed to clear existing main story: %w", err)
		}
	}

	if settings.IsFeatured && !association.IsFeatured {
		// Check featured limit
		featuredArticles, err := s.newsArticleRepo.GetFeaturedArticles(ctx, newsID)
		if err != nil {
			return fmt.Errorf("failed to get featured articles: %w", err)
		}
		if len(featuredArticles) >= s.config.MaxFeaturedArticles {
			return fmt.Errorf("maximum %d featured articles allowed", s.config.MaxFeaturedArticles)
		}
	}

	// Update settings
	association.DisplayOrder = settings.DisplayOrder
	association.IsMainStory = settings.IsMainStory
	association.IsFeatured = settings.IsFeatured
	association.Section = settings.Section
	association.Summary = settings.Summary
	association.IsVisible = settings.IsVisible
	association.UpdatedAt = time.Now()
	if userID != nil {
		association.UpdatedBy = userID
	}

	if err := s.newsArticleRepo.Update(ctx, association); err != nil {
		return fmt.Errorf("failed to update association: %w", err)
	}

	s.logger.Info("Article settings updated successfully",
		zap.String("newsID", newsID.String()),
		zap.String("articleID", articleID.String()))

	return nil
}

// Helper methods

// validateAssociateRequest validates an associate articles request
func (s *NewsArticleAssociationService) validateAssociateRequest(req *AssociateArticlesRequest) error {
	if len(req.ArticleIDs) < s.config.MinArticlesPerNews {
		return fmt.Errorf("minimum %d articles required", s.config.MinArticlesPerNews)
	}
	if len(req.ArticleIDs) > s.config.MaxArticlesPerNews {
		return fmt.Errorf("maximum %d articles allowed", s.config.MaxArticlesPerNews)
	}

	// Check for duplicates if not allowed
	if !s.config.AllowDuplicateArticles {
		seen := make(map[uuid.UUID]bool)
		for _, articleID := range req.ArticleIDs {
			if seen[articleID] {
				return fmt.Errorf("duplicate article ID: %s", articleID)
			}
			seen[articleID] = true
		}
	}

	return nil
}

// validateArticles validates that articles exist and are valid
func (s *NewsArticleAssociationService) validateArticles(ctx context.Context, articleIDs []uuid.UUID) error {
	for _, articleID := range articleIDs {
		article, err := s.articleRepo.GetByID(ctx, articleID, nil)
		if err != nil {
			return fmt.Errorf("article %s not found: %w", articleID, err)
		}

		// Validate article status if enabled
		if s.config.ValidateArticleStatus && !article.IsPublished {
			return fmt.Errorf("article %s is not published", articleID)
		}
	}

	return nil
}

// validateBusinessRules validates business rules for associations
func (s *NewsArticleAssociationService) validateBusinessRules(mainStoryCount, featuredCount int) error {
	if s.config.RequireMainStory && mainStoryCount == 0 {
		return fmt.Errorf("at least one main story is required")
	}
	if mainStoryCount > 1 {
		return fmt.Errorf("only one main story allowed")
	}
	if featuredCount > s.config.MaxFeaturedArticles {
		return fmt.Errorf("maximum %d featured articles allowed", s.config.MaxFeaturedArticles)
	}

	return nil
}

// autoReorderArticles automatically reorders articles based on priority
func (s *NewsArticleAssociationService) autoReorderArticles(newsArticles []*entities.NewsArticle) {
	// Sort articles: main story first, then featured, then by display order
	sort.Slice(newsArticles, func(i, j int) bool {
		a, b := newsArticles[i], newsArticles[j]

		// Main story comes first
		if a.IsMainStory != b.IsMainStory {
			return a.IsMainStory
		}

		// Featured articles come next
		if a.IsFeatured != b.IsFeatured {
			return a.IsFeatured
		}

		// Then by display order
		return a.DisplayOrder < b.DisplayOrder
	})

	// Update display orders
	for i, newsArticle := range newsArticles {
		newsArticle.DisplayOrder = i + 1
	}
}

// reorderRemainingArticles reorders remaining articles after removal
func (s *NewsArticleAssociationService) reorderRemainingArticles(ctx context.Context, articles []*entities.NewsArticle) {
	// Sort by current display order
	sort.Slice(articles, func(i, j int) bool {
		return articles[i].DisplayOrder < articles[j].DisplayOrder
	})

	// Update display orders to be sequential
	for i, article := range articles {
		newOrder := i + 1
		if article.DisplayOrder != newOrder {
			if err := s.newsArticleRepo.UpdateDisplayOrder(ctx, article.Id, newOrder); err != nil {
				s.logger.Warn("Failed to update display order during reordering",
					zap.String("articleID", article.Id.String()),
					zap.Error(err))
			}
		}
	}
}

// clearMainStory clears the existing main story for news
func (s *NewsArticleAssociationService) clearMainStory(ctx context.Context, newsID uuid.UUID, userID *uuid.UUID) error {
	existing, err := s.newsArticleRepo.GetMainStory(ctx, newsID)
	if err != nil {
		// No existing main story, which is fine
		return nil
	}

	existing.IsMainStory = false
	existing.UpdatedAt = time.Now()
	if userID != nil {
		existing.UpdatedBy = userID
	}

	return s.newsArticleRepo.Update(ctx, existing)
}
