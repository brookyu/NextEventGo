package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
)

var (
	ErrArticleNotFound      = errors.New("article not found")
	ErrCategoryNotFound     = errors.New("category not found")
	ErrInvalidContent       = errors.New("invalid article content")
	ErrDuplicateTitle       = errors.New("article title already exists")
	ErrUnauthorized         = errors.New("unauthorized access")
	ErrInvalidPromotionCode = errors.New("invalid promotion code")
)

// ArticleService handles article-related business logic
type ArticleService struct {
	articleRepo  repositories.SiteArticleRepository
	categoryRepo repositories.ArticleCategoryRepository
	tagRepo      repositories.TagRepository
	trackingRepo repositories.ArticleTrackingRepository
	imageRepo    repositories.SiteImageRepository
	config       ArticleServiceConfig
}

// ArticleServiceConfig contains configuration for the article service
type ArticleServiceConfig struct {
	MaxContentLength    int
	MaxSummaryLength    int
	MaxTitleLength      int
	AllowedHTMLTags     []string
	RequireApproval     bool
	EnableAnalytics     bool
	DefaultCacheTimeout time.Duration
}

// NewArticleService creates a new article service
func NewArticleService(
	articleRepo repositories.SiteArticleRepository,
	categoryRepo repositories.ArticleCategoryRepository,
	tagRepo repositories.TagRepository,
	trackingRepo repositories.ArticleTrackingRepository,
	imageRepo repositories.SiteImageRepository,
	config ArticleServiceConfig,
) *ArticleService {
	return &ArticleService{
		articleRepo:  articleRepo,
		categoryRepo: categoryRepo,
		tagRepo:      tagRepo,
		trackingRepo: trackingRepo,
		imageRepo:    imageRepo,
		config:       config,
	}
}

// CreateArticle creates a new article using existing SiteArticle entity
func (s *ArticleService) CreateArticle(ctx context.Context, req *ArticleCreateRequest) (*ArticleResponse, error) {
	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Check if category exists
	category, err := s.categoryRepo.GetByID(ctx, req.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("failed to get category: %w", err)
	}
	if category == nil {
		return nil, ErrCategoryNotFound
	}

	// Create SiteArticle entity (using existing entity)
	article := &entities.SiteArticle{
		Title:              req.Title,
		Summary:            req.Summary,
		Content:            s.sanitizeContent(req.Content),
		Author:             req.Author,
		CategoryId:         req.CategoryID,
		IsPublished:        false, // Start as draft
		SiteImageId:        req.SiteImageID,
		PromotionPicId:     req.PromotionPicID,
		JumpResourceId:     req.JumpResourceID,
		FrontCoverImageUrl: "",
	}

	// Generate promotion code
	article.PromotionCode = s.generatePromotionCode()

	// Create article in database
	if err := s.articleRepo.Create(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	return s.toSiteArticleResponse(article), nil
}

// GetArticle retrieves an article by ID
func (s *ArticleService) GetArticle(ctx context.Context, id uuid.UUID, options *ArticleGetOptions) (*ArticleResponse, error) {
	// Create default list options for the repository call
	listOptions := &repositories.ArticleListOptions{}
	if options != nil {
		listOptions.IncludeCategory = options.IncludeCategory
		listOptions.IncludeCoverImage = options.IncludeImages
		listOptions.IncludePromotionImage = options.IncludeImages
	}

	article, err := s.articleRepo.GetByID(ctx, id, listOptions)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Load relationships if requested
	if options != nil {
		if options.IncludeCategory {
			category, _ := s.categoryRepo.GetByID(ctx, article.CategoryId)
			article.Category = category
		}
		// Note: SiteArticle doesn't have Tags field, skipping tags loading
		if options.IncludeImages {
			if article.SiteImageId != nil {
				coverImage, _ := s.imageRepo.GetByID(ctx, *article.SiteImageId)
				article.CoverImage = coverImage
			}
			if article.PromotionPicId != nil {
				promoImage, _ := s.imageRepo.GetByID(ctx, *article.PromotionPicId)
				article.PromotionImage = promoImage
			}
		}
	}

	// Track view if enabled
	if s.config.EnableAnalytics && options != nil && options.TrackView {
		go s.trackView(context.Background(), article.ID, options.UserID, options.SessionID, options.IPAddress)
	}

	return s.toSiteArticleResponse(article), nil
}

// GetArticleByPromotionCode retrieves an article by promotion code
func (s *ArticleService) GetArticleByPromotionCode(ctx context.Context, code string, options *ArticleGetOptions) (*ArticleResponse, error) {
	article, err := s.articleRepo.GetByPromotionCode(ctx, code)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article by promotion code: %w", err)
	}

	// Use the same logic as GetArticle
	return s.GetArticle(ctx, article.ID, options)
}

// UpdateArticle updates an existing article
func (s *ArticleService) UpdateArticle(ctx context.Context, id uuid.UUID, req *ArticleUpdateRequest) (*ArticleResponse, error) {
	// Get existing article
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Note: SiteArticle doesn't have CanEdit method, skipping authorization check for now
	// TODO: Implement proper authorization logic

	// Validate request
	if err := s.validateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Update fields
	if req.Title != nil {
		article.Title = *req.Title
	}
	if req.Summary != nil {
		article.Summary = *req.Summary
	}
	if req.Content != nil {
		article.Content = s.sanitizeContent(*req.Content)
	}
	if req.Author != nil {
		article.Author = *req.Author
	}
	if req.CategoryID != nil {
		article.CategoryId = *req.CategoryID
	}
	if req.SiteImageID != nil {
		article.SiteImageId = req.SiteImageID
	}
	if req.PromotionPicID != nil {
		article.PromotionPicId = req.PromotionPicID
	}
	// Note: SiteArticle doesn't have MetaTitle, MetaDescription, Keywords fields
	// These fields are not available in the SiteArticle entity

	article.UpdatedBy = req.UpdatedBy

	// Update article in database
	if err := s.articleRepo.Update(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	// Handle tag updates if provided
	if req.TagIDs != nil {
		if err := s.updateTags(ctx, article.ID, *req.TagIDs); err != nil {
			// Log error but don't fail the update
			// TODO: Add proper logging
		}
	}

	return s.toSiteArticleResponse(article), nil
}

// PublishArticle publishes a draft article
func (s *ArticleService) PublishArticle(ctx context.Context, id uuid.UUID, userID *uuid.UUID) (*ArticleResponse, error) {
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Note: SiteArticle doesn't have IsDraft method, checking IsPublished instead
	if article.IsPublished {
		return nil, fmt.Errorf("article is already published")
	}

	// Publish the article
	article.IsPublished = true
	article.PublishedAt = &time.Time{}
	*article.PublishedAt = time.Now()
	article.UpdatedBy = userID

	if err := s.articleRepo.Update(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to publish article: %w", err)
	}

	return s.toSiteArticleResponse(article), nil
}

// ArchiveArticle archives an article
func (s *ArticleService) ArchiveArticle(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrArticleNotFound
		}
		return fmt.Errorf("failed to get article: %w", err)
	}

	// Note: SiteArticle doesn't have Archive method, setting IsPublished to false
	article.IsPublished = false
	article.UpdatedBy = userID

	if err := s.articleRepo.Update(ctx, article); err != nil {
		return fmt.Errorf("failed to archive article: %w", err)
	}

	return nil
}

// DeleteArticle soft deletes an article
func (s *ArticleService) DeleteArticle(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return ErrArticleNotFound
		}
		return fmt.Errorf("failed to get article: %w", err)
	}

	// Update category article count
	if category, err := s.categoryRepo.GetByID(ctx, article.CategoryId); err == nil {
		category.DecrementArticleCount()
		s.categoryRepo.Update(ctx, category)
	}

	// Soft delete
	article.IsDeleted = true
	now := time.Now()
	article.DeletedAt = &now
	article.DeletedBy = userID

	if err := s.articleRepo.Update(ctx, article); err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	return nil
}

// ListArticles retrieves a paginated list of articles using existing repository interface
func (s *ArticleService) ListArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*ArticleResponse, int64, error) {
	// Apply default limit if not set
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	articles, err := s.articleRepo.GetAll(ctx, offset, limit, options)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list articles: %w", err)
	}

	total, err := s.articleRepo.Count(ctx)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}

	responses := make([]*ArticleResponse, len(articles))
	for i, article := range articles {
		responses[i] = s.toSiteArticleResponse(article)
	}

	return responses, total, nil
}

// GetArticleAnalytics retrieves analytics for an article
func (s *ArticleService) GetArticleAnalytics(ctx context.Context, id uuid.UUID) (*ArticleAnalytics, error) {
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		if errors.Is(err, repositories.ErrNotFound) {
			return nil, ErrArticleNotFound
		}
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Get tracking data
	trackings, err := s.trackingRepo.GetByArticleID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get tracking data: %w", err)
	}

	return s.calculateSiteArticleAnalytics(article, trackings), nil
}

// Helper methods
func (s *ArticleService) validateCreateRequest(req *ArticleCreateRequest) error {
	if req.Title == "" {
		return fmt.Errorf("title is required")
	}
	if len(req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title too long")
	}
	if req.Content == "" {
		return fmt.Errorf("content is required")
	}
	if len(req.Content) > s.config.MaxContentLength {
		return fmt.Errorf("content too long")
	}
	if len(req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary too long")
	}
	if req.CategoryID == uuid.Nil {
		return fmt.Errorf("category ID is required")
	}
	return nil
}

func (s *ArticleService) validateUpdateRequest(req *ArticleUpdateRequest) error {
	if req.Title != nil && *req.Title == "" {
		return fmt.Errorf("title cannot be empty")
	}
	if req.Title != nil && len(*req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title too long")
	}
	if req.Content != nil && *req.Content == "" {
		return fmt.Errorf("content cannot be empty")
	}
	if req.Content != nil && len(*req.Content) > s.config.MaxContentLength {
		return fmt.Errorf("content too long")
	}
	if req.Summary != nil && len(*req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary too long")
	}
	return nil
}

func (s *ArticleService) sanitizeContent(content string) string {
	// Basic HTML sanitization - in production, use a proper HTML sanitizer
	// For now, just return the content as-is
	return content
}

func (s *ArticleService) generatePromotionCode() string {
	return uuid.New().String()[:8]
}

func (s *ArticleService) generateMetaDescription(content string) string {
	// Extract first 160 characters from content, removing HTML tags
	// This is a simplified implementation
	if len(content) > 160 {
		return content[:160] + "..."
	}
	return content
}

func (s *ArticleService) assignTags(ctx context.Context, articleID uuid.UUID, tagIDs []uuid.UUID) error {
	return s.tagRepo.AssignToArticle(ctx, articleID, tagIDs)
}

func (s *ArticleService) updateTags(ctx context.Context, articleID uuid.UUID, tagIDs []uuid.UUID) error {
	return s.tagRepo.ReplaceArticleTags(ctx, articleID, tagIDs)
}

func (s *ArticleService) trackView(ctx context.Context, articleID uuid.UUID, userID *uuid.UUID, sessionID, ipAddress string) {
	tracking := &entities.ArticleTracking{
		ArticleID: articleID,
		UserID:    userID,
		SessionID: sessionID,
		IPAddress: ipAddress,
	}
	tracking.StartReading()
	s.trackingRepo.Create(ctx, tracking)
}

func (s *ArticleService) toArticleResponse(article *entities.Article) *ArticleResponse {
	response := &ArticleResponse{
		ID:             article.ID,
		Title:          article.Title,
		Summary:        article.Summary,
		Content:        article.Content,
		Author:         article.Author,
		CategoryID:     article.CategoryID,
		SiteImageID:    article.SiteImageID,
		PromotionPicID: article.PromotionPicID,
		JumpResourceID: article.JumpResourceID,
		PromotionCode:  article.PromotionCode,
		IsPublished:    article.Status == entities.ArticleStatusPublished,
		PublishedAt:    article.PublishedAt,
		ViewCount:      article.ViewCount,
		ReadCount:      article.ReadCount,
		CreatedAt:      article.CreatedAt,
		UpdatedAt:      article.UpdatedAt,
		CreatedBy:      article.CreatedBy,
		UpdatedBy:      article.UpdatedBy,
	}

	// Include relationships if loaded
	if article.Category != nil {
		response.Category = article.Category
	}

	return response
}

// toSiteArticleResponse converts a SiteArticle entity to ArticleResponse
func (s *ArticleService) toSiteArticleResponse(article *entities.SiteArticle) *ArticleResponse {
	response := &ArticleResponse{
		ID:                 article.ID,
		Title:              article.Title,
		Summary:            article.Summary,
		Content:            article.Content,
		Author:             article.Author,
		CategoryID:         article.CategoryId,
		SiteImageID:        article.SiteImageId,
		PromotionPicID:     article.PromotionPicId,
		JumpResourceID:     article.JumpResourceId,
		PromotionCode:      article.PromotionCode,
		FrontCoverImageUrl: article.FrontCoverImageUrl,
		IsPublished:        article.IsPublished,
		PublishedAt:        article.PublishedAt,
		ViewCount:          article.ViewCount,
		ReadCount:          article.ReadCount,
		CreatedAt:          article.CreatedAt,
		UpdatedAt:          article.UpdatedAt,
	}

	// Add relationships if loaded
	if article.Category != nil {
		response.Category = article.Category
	}

	if article.CoverImage != nil {
		response.CoverImage = article.CoverImage
	}

	if article.PromotionImage != nil {
		response.PromotionImage = article.PromotionImage
	}

	return response
}

func (s *ArticleService) toCategoryResponse(category *entities.ArticleCategory) *ArticleCategoryResponse {
	return &ArticleCategoryResponse{
		ID:           category.ID,
		Name:         category.Name,
		Description:  category.Description,
		Color:        category.Color,
		Icon:         category.Icon,
		SortOrder:    category.SortOrder,
		IsActive:     category.IsActive,
		CreatedAt:    category.CreatedAt,
		UpdatedAt:    category.UpdatedAt,
		ArticleCount: &category.ArticleCount,
	}
}

func (s *ArticleService) calculateAnalytics(article *entities.Article, trackings []*entities.ArticleTracking) *ArticleAnalytics {
	analytics := &ArticleAnalytics{
		ArticleId:   article.ID,
		ViewCount:   article.ViewCount,
		ReadCount:   article.ReadCount,
		ShareCount:  article.ShareCount,
		LastUpdated: time.Now(),
	}

	if len(trackings) > 0 {
		totalReadTime := 0.0
		completedReads := 0
		for _, tracking := range trackings {
			totalReadTime += float64(tracking.ReadDuration)
			if tracking.IsCompleted {
				completedReads++
			}
		}
		analytics.AverageReadTime = totalReadTime / float64(len(trackings))
		analytics.ReadingRate = float64(completedReads) / float64(len(trackings)) * 100
	}

	return analytics
}

// calculateSiteArticleAnalytics calculates analytics for a SiteArticle
func (s *ArticleService) calculateSiteArticleAnalytics(article *entities.SiteArticle, trackings []*entities.ArticleTracking) *ArticleAnalytics {
	analytics := &ArticleAnalytics{
		ArticleId:       article.ID,
		ViewCount:       article.ViewCount,
		ReadCount:       article.ReadCount,
		ShareCount:      0, // SiteArticle doesn't have ShareCount field
		ReadingRate:     0,
		AverageReadTime: 0,
		BounceRate:      0,
		LastUpdated:     time.Now(),
	}

	// Calculate additional metrics from tracking data
	if len(trackings) > 0 {
		var totalReadTime float64
		var completedReads int

		for _, tracking := range trackings {
			if tracking.ReadDuration > 0 {
				totalReadTime += float64(tracking.ReadDuration)
			}
			if tracking.IsCompleted {
				completedReads++
			}
		}

		if len(trackings) > 0 {
			analytics.AverageReadTime = totalReadTime / float64(len(trackings))
			analytics.ReadingRate = float64(completedReads) / float64(len(trackings)) * 100
		}
	}

	return analytics
}
