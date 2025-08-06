package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"go.uber.org/zap"
)

// NewsManagementService provides comprehensive news management functionality
type NewsManagementService struct {
	newsRepo          repositories.NewsRepository
	newsArticleRepo   repositories.NewsArticleRepository
	newsCategoryRepo  repositories.NewsCategoryRepository
	articleRepo       repositories.SiteArticleRepository
	imageRepo         repositories.SiteImageRepository
	hitRepo           repositories.HitRepository
	wechatNewsService WeChatNewsService
	logger            *zap.Logger
	config            *NewsManagementConfig
}

// NewsManagementConfig holds configuration for the news management service
type NewsManagementConfig struct {
	MaxTitleLength       int
	MaxDescriptionLength int
	MaxContentLength     int
	MaxArticlesPerNews   int
	MinArticlesPerNews   int
	AutoGenerateSlug     bool
	RequireUniqueSlug    bool
	EnableWeChat         bool
	EnableAutoPublish    bool
	EnableAnalytics      bool
	DefaultStatus        entities.NewsStatus
	DefaultPriority      entities.NewsPriority
}

// DefaultNewsManagementConfig returns default configuration
func DefaultNewsManagementConfig() *NewsManagementConfig {
	return &NewsManagementConfig{
		MaxTitleLength:       500,
		MaxDescriptionLength: 1000,
		MaxContentLength:     50000,
		MaxArticlesPerNews:   8,
		MinArticlesPerNews:   1,
		AutoGenerateSlug:     true,
		RequireUniqueSlug:    true,
		EnableWeChat:         true,
		EnableAutoPublish:    false,
		EnableAnalytics:      true,
		DefaultStatus:        entities.NewsStatusDraft,
		DefaultPriority:      entities.NewsPriorityNormal,
	}
}

// NewNewsManagementService creates a new news management service
func NewNewsManagementService(
	newsRepo repositories.NewsRepository,
	newsArticleRepo repositories.NewsArticleRepository,
	newsCategoryRepo repositories.NewsCategoryRepository,
	articleRepo repositories.SiteArticleRepository,
	imageRepo repositories.SiteImageRepository,
	hitRepo repositories.HitRepository,
	wechatNewsService WeChatNewsService,
	logger *zap.Logger,
	config *NewsManagementConfig,
) *NewsManagementService {
	if config == nil {
		config = DefaultNewsManagementConfig()
	}

	return &NewsManagementService{
		newsRepo:          newsRepo,
		newsArticleRepo:   newsArticleRepo,
		newsCategoryRepo:  newsCategoryRepo,
		articleRepo:       articleRepo,
		imageRepo:         imageRepo,
		hitRepo:           hitRepo,
		wechatNewsService: wechatNewsService,
		logger:            logger,
		config:            config,
	}
}

// CreateNews creates a new news publication with multiple articles
func (s *NewsManagementService) CreateNews(ctx context.Context, req *NewsCreateRequest) (*NewsResponse, error) {
	s.logger.Info("Creating news", zap.String("title", req.Title))

	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Generate slug if needed
	slug := req.Slug
	if slug == "" && s.config.AutoGenerateSlug {
		slug = s.generateSlug(req.Title)
	}

	// Check slug uniqueness
	if s.config.RequireUniqueSlug && slug != "" {
		if err := s.checkSlugUniqueness(ctx, slug, nil); err != nil {
			return nil, err
		}
	}

	// Create news entity
	news := &entities.News{
		ID:              uuid.New(),
		Title:           req.Title,
		Subtitle:        req.Subtitle,
		Description:     req.Description,
		Content:         req.Content,
		Summary:         req.Summary,
		Status:          s.config.DefaultStatus,
		Type:            req.Type,
		Priority:        req.Priority,
		AuthorID:        req.AuthorID,
		Slug:            slug,
		MetaTitle:       req.MetaTitle,
		MetaDescription: req.MetaDescription,
		Keywords:        req.Keywords,
		Tags:            req.Tags,
		FeaturedImageID: req.FeaturedImageID,
		ThumbnailID:     req.ThumbnailID,
		ScheduledAt:     req.ScheduledAt,
		ExpiresAt:       req.ExpiresAt,
		WeChatStatus:    "not_synced",
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
		CreatedBy:       req.AuthorID,
		UpdatedBy:       req.AuthorID,
	}

	// Set default values
	if news.Type == "" {
		news.Type = entities.NewsTypeRegular
	}
	if news.Priority == "" {
		news.Priority = s.config.DefaultPriority
	}

	// Create news in database
	if err := s.newsRepo.Create(ctx, news); err != nil {
		return nil, fmt.Errorf("failed to create news: %w", err)
	}

	// Associate articles if provided
	if len(req.ArticleIDs) > 0 {
		if err := s.associateArticles(ctx, news.ID, req.ArticleIDs, req.ArticleSettings); err != nil {
			s.logger.Error("Failed to associate articles", zap.Error(err))
			// Don't fail the entire operation, just log the error
		}
	}

	// Associate categories if provided
	if len(req.CategoryIDs) > 0 {
		if err := s.associateCategories(ctx, news.ID, req.CategoryIDs); err != nil {
			s.logger.Error("Failed to associate categories", zap.Error(err))
		}
	}

	// Create WeChat draft if enabled
	if s.config.EnableWeChat && s.wechatNewsService != nil {
		if err := s.wechatNewsService.CreateWeChatDraft(ctx, news.ID); err != nil {
			s.logger.Warn("Failed to create WeChat draft", zap.Error(err))
			// Don't fail the operation, just log the warning
		}
	}

	s.logger.Info("News created successfully",
		zap.String("newsID", news.ID.String()),
		zap.String("title", news.Title),
		zap.String("slug", news.Slug))

	return s.buildNewsResponse(ctx, news)
}

// GetNews retrieves a news publication by ID
func (s *NewsManagementService) GetNews(ctx context.Context, id uuid.UUID) (*NewsResponse, error) {
	news, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	return s.buildNewsResponse(ctx, news)
}

// GetNewsForEditing retrieves news with all related data for editing
func (s *NewsManagementService) GetNewsForEditing(ctx context.Context, id uuid.UUID) (*NewsForEditingResponse, error) {
	news, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	// Get associated articles
	newsArticles, err := s.newsArticleRepo.GetByNewsID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get news articles: %w", err)
	}

	// Build response with all related data
	return s.buildNewsForEditingResponse(ctx, news, newsArticles)
}

// UpdateNews updates an existing news publication
func (s *NewsManagementService) UpdateNews(ctx context.Context, req *NewsUpdateRequest) (*NewsResponse, error) {
	s.logger.Info("Updating news", zap.String("newsID", req.NewsID.String()))

	// Validate request
	if err := s.validateUpdateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Get existing news
	news, err := s.newsRepo.GetByID(ctx, req.NewsID)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	// Update fields
	s.updateNewsFields(news, req)
	news.UpdatedAt = time.Now()
	news.UpdatedBy = req.EditorID

	// Handle slug change
	if req.Slug != nil && *req.Slug != news.Slug {
		if s.config.RequireUniqueSlug {
			if err := s.checkSlugUniqueness(ctx, *req.Slug, &req.NewsID); err != nil {
				return nil, err
			}
		}
		news.Slug = *req.Slug
	}

	// Update news in database
	if err := s.newsRepo.Update(ctx, news); err != nil {
		return nil, fmt.Errorf("failed to update news: %w", err)
	}

	// Update article associations if provided
	if req.ArticleIDs != nil {
		if err := s.updateArticleAssociations(ctx, news.ID, *req.ArticleIDs, req.ArticleSettings); err != nil {
			s.logger.Error("Failed to update article associations", zap.Error(err))
		}
	}

	// Update category associations if provided
	if req.CategoryIDs != nil {
		if err := s.updateCategoryAssociations(ctx, news.ID, *req.CategoryIDs); err != nil {
			s.logger.Error("Failed to update category associations", zap.Error(err))
		}
	}

	// Update WeChat draft if enabled
	if s.config.EnableWeChat && s.wechatNewsService != nil {
		if err := s.wechatNewsService.UpdateWeChatDraft(ctx, news.ID); err != nil {
			s.logger.Warn("Failed to update WeChat draft", zap.Error(err))
		}
	}

	s.logger.Info("News updated successfully", zap.String("newsID", news.ID.String()))

	return s.buildNewsResponse(ctx, news)
}

// DeleteNews deletes a news publication
func (s *NewsManagementService) DeleteNews(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	s.logger.Info("Deleting news", zap.String("newsID", id.String()))

	// Get news to check if it exists
	news, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Delete WeChat draft if exists
	if s.config.EnableWeChat && s.wechatNewsService != nil && news.WeChatDraftID != "" {
		if err := s.wechatNewsService.DeleteWeChatDraft(ctx, id); err != nil {
			s.logger.Warn("Failed to delete WeChat draft", zap.Error(err))
		}
	}

	// Delete news
	if err := s.newsRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete news: %w", err)
	}

	s.logger.Info("News deleted successfully", zap.String("newsID", id.String()))
	return nil
}

// PublishNews publishes a news publication
func (s *NewsManagementService) PublishNews(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	s.logger.Info("Publishing news", zap.String("newsID", id.String()))

	// Get news
	news, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Validate that news can be published
	if err := s.validateForPublishing(ctx, news); err != nil {
		return fmt.Errorf("news cannot be published: %w", err)
	}

	// Update status and publish time
	now := time.Now()
	if err := s.newsRepo.Publish(ctx, id, now); err != nil {
		return fmt.Errorf("failed to publish news: %w", err)
	}

	// Publish to WeChat if enabled
	if s.config.EnableWeChat && s.config.EnableAutoPublish && s.wechatNewsService != nil {
		if err := s.wechatNewsService.PublishToWeChat(ctx, id); err != nil {
			s.logger.Warn("Failed to publish to WeChat", zap.Error(err))
			// Don't fail the operation, just log the warning
		}
	}

	s.logger.Info("News published successfully", zap.String("newsID", id.String()))
	return nil
}

// UnpublishNews unpublishes a news publication
func (s *NewsManagementService) UnpublishNews(ctx context.Context, id uuid.UUID, userID *uuid.UUID) error {
	s.logger.Info("Unpublishing news", zap.String("newsID", id.String()))

	if err := s.newsRepo.Unpublish(ctx, id); err != nil {
		return fmt.Errorf("failed to unpublish news: %w", err)
	}

	s.logger.Info("News unpublished successfully", zap.String("newsID", id.String()))
	return nil
}

// ArchiveNews archives a news publication (for expired news)
func (s *NewsManagementService) ArchiveNews(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Archiving news", zap.String("newsID", id.String()))

	// Get news to validate it exists
	news, err := s.newsRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Check if news is expired
	if !news.IsExpired() {
		return fmt.Errorf("news is not expired and cannot be archived")
	}

	// Archive the news
	if err := s.newsRepo.ArchiveNews(ctx, id); err != nil {
		return fmt.Errorf("failed to archive news: %w", err)
	}

	s.logger.Info("News archived successfully", zap.String("newsID", id.String()))
	return nil
}

// ListNews retrieves news with filtering and pagination
func (s *NewsManagementService) ListNews(ctx context.Context, req *ListNewsRequest) (*ListNewsResponse, error) {
	// Build filter from request
	filter := s.buildNewsFilter(req)

	// Get news list
	newsList, err := s.newsRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list news: %w", err)
	}

	// Get total count
	totalCount, err := s.newsRepo.Count(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to count news: %w", err)
	}

	// Build response
	response := &ListNewsResponse{
		Items:      make([]*NewsListItem, len(newsList)),
		TotalCount: totalCount,
		PageSize:   req.PageSize,
		PageNumber: req.PageNumber,
	}

	for i, news := range newsList {
		response.Items[i] = s.buildNewsListItem(news)
	}

	return response, nil
}

// SearchNews searches news by query
func (s *NewsManagementService) SearchNews(ctx context.Context, req *SearchNewsRequest) (*ListNewsResponse, error) {
	// Perform search
	newsList, err := s.newsRepo.Search(ctx, req.Query, req.PageSize, req.PageSize*(req.PageNumber-1))
	if err != nil {
		return nil, fmt.Errorf("failed to search news: %w", err)
	}

	// Build response
	response := &ListNewsResponse{
		Items:      make([]*NewsListItem, len(newsList)),
		PageSize:   req.PageSize,
		PageNumber: req.PageNumber,
	}

	for i, news := range newsList {
		response.Items[i] = s.buildNewsListItem(news)
	}

	return response, nil
}

// GetNewsByCategory retrieves news by category
func (s *NewsManagementService) GetNewsByCategory(ctx context.Context, categoryID uuid.UUID, limit, offset int) ([]*NewsListItem, error) {
	newsList, err := s.newsRepo.GetByCategory(ctx, categoryID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get news by category: %w", err)
	}

	items := make([]*NewsListItem, len(newsList))
	for i, news := range newsList {
		items[i] = s.buildNewsListItem(news)
	}

	return items, nil
}

// GetPopularNews retrieves popular news
func (s *NewsManagementService) GetPopularNews(ctx context.Context, since time.Time, limit int) ([]*NewsListItem, error) {
	newsList, err := s.newsRepo.GetPopular(ctx, since, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get popular news: %w", err)
	}

	items := make([]*NewsListItem, len(newsList))
	for i, news := range newsList {
		items[i] = s.buildNewsListItem(news)
	}

	return items, nil
}

// GetTrendingNews retrieves trending news
func (s *NewsManagementService) GetTrendingNews(ctx context.Context, limit int) ([]*NewsListItem, error) {
	newsList, err := s.newsRepo.GetTrending(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get trending news: %w", err)
	}

	items := make([]*NewsListItem, len(newsList))
	for i, news := range newsList {
		items[i] = s.buildNewsListItem(news)
	}

	return items, nil
}

// Helper methods

// validateCreateRequest validates a create news request
func (s *NewsManagementService) validateCreateRequest(req *NewsCreateRequest) error {
	if req.Title == "" {
		return fmt.Errorf("title is required")
	}
	if len(req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title exceeds maximum length of %d", s.config.MaxTitleLength)
	}
	if len(req.Description) > s.config.MaxDescriptionLength {
		return fmt.Errorf("description exceeds maximum length of %d", s.config.MaxDescriptionLength)
	}
	if len(req.Content) > s.config.MaxContentLength {
		return fmt.Errorf("content exceeds maximum length of %d", s.config.MaxContentLength)
	}
	if len(req.ArticleIDs) < s.config.MinArticlesPerNews {
		return fmt.Errorf("minimum %d articles required", s.config.MinArticlesPerNews)
	}
	if len(req.ArticleIDs) > s.config.MaxArticlesPerNews {
		return fmt.Errorf("maximum %d articles allowed", s.config.MaxArticlesPerNews)
	}
	if req.AuthorID == nil {
		return fmt.Errorf("author ID is required")
	}
	return nil
}

// validateUpdateRequest validates an update news request
func (s *NewsManagementService) validateUpdateRequest(req *NewsUpdateRequest) error {
	if req.Title != nil && *req.Title == "" {
		return fmt.Errorf("title cannot be empty")
	}
	if req.Title != nil && len(*req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title exceeds maximum length of %d", s.config.MaxTitleLength)
	}
	if req.Description != nil && len(*req.Description) > s.config.MaxDescriptionLength {
		return fmt.Errorf("description exceeds maximum length of %d", s.config.MaxDescriptionLength)
	}
	if req.Content != nil && len(*req.Content) > s.config.MaxContentLength {
		return fmt.Errorf("content exceeds maximum length of %d", s.config.MaxContentLength)
	}
	if req.ArticleIDs != nil {
		if len(*req.ArticleIDs) < s.config.MinArticlesPerNews {
			return fmt.Errorf("minimum %d articles required", s.config.MinArticlesPerNews)
		}
		if len(*req.ArticleIDs) > s.config.MaxArticlesPerNews {
			return fmt.Errorf("maximum %d articles allowed", s.config.MaxArticlesPerNews)
		}
	}
	if req.EditorID == nil {
		return fmt.Errorf("editor ID is required")
	}
	return nil
}

// generateSlug generates a URL-friendly slug from title
func (s *NewsManagementService) generateSlug(title string) string {
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

	// Limit length
	if len(slug) > 100 {
		slug = slug[:100]
		slug = strings.Trim(slug, "-")
	}

	return slug
}

// checkSlugUniqueness checks if a slug is unique
func (s *NewsManagementService) checkSlugUniqueness(ctx context.Context, slug string, excludeID *uuid.UUID) error {
	existing, err := s.newsRepo.GetBySlug(ctx, slug)
	if err != nil {
		if err == repositories.ErrNotFound {
			return nil // Slug is unique
		}
		return fmt.Errorf("failed to check slug uniqueness: %w", err)
	}

	// If we're updating and the existing news has the same ID, it's okay
	if excludeID != nil && existing.ID == *excludeID {
		return nil
	}

	return fmt.Errorf("slug '%s' is already in use", slug)
}

// validateForPublishing validates that news can be published
func (s *NewsManagementService) validateForPublishing(ctx context.Context, news *entities.News) error {
	if news.Status == entities.NewsStatusPublished {
		return fmt.Errorf("news is already published")
	}

	// Check if news has articles
	newsArticles, err := s.newsArticleRepo.GetByNewsID(ctx, news.ID)
	if err != nil {
		return fmt.Errorf("failed to get news articles: %w", err)
	}

	if len(newsArticles) == 0 {
		return fmt.Errorf("news must have at least one article to be published")
	}

	return nil
}

// associateArticles associates articles with news
func (s *NewsManagementService) associateArticles(ctx context.Context, newsID uuid.UUID, articleIDs []uuid.UUID, settings map[uuid.UUID]NewsArticleSettings) error {
	// Delete existing associations
	if err := s.newsArticleRepo.DeleteByNewsID(ctx, newsID); err != nil {
		return fmt.Errorf("failed to delete existing associations: %w", err)
	}

	// Create new associations
	newsArticles := make([]*entities.NewsArticle, len(articleIDs))
	for i, articleID := range articleIDs {
		newsArticle := &entities.NewsArticle{
			Id:           uuid.New(),
			NewsID:       newsID,
			ArticleID:    articleID,
			DisplayOrder: i + 1,
			IsMainStory:  false,
			IsFeatured:   false,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		// Apply settings if provided
		if setting, exists := settings[articleID]; exists {
			newsArticle.IsMainStory = setting.IsMainStory
			newsArticle.IsFeatured = setting.IsFeatured
			newsArticle.Section = setting.Section
			newsArticle.Summary = setting.Summary
		}

		newsArticles[i] = newsArticle
	}

	return s.newsArticleRepo.CreateBulk(ctx, newsArticles)
}

// associateCategories associates categories with news
func (s *NewsManagementService) associateCategories(ctx context.Context, newsID uuid.UUID, categoryIDs []uuid.UUID) error {
	// This would typically involve a many-to-many relationship table
	// For now, we'll implement a simple approach
	// In a real implementation, you'd have a news_category_associations table

	// TODO: Implement category association logic
	// This would involve creating records in a junction table
	s.logger.Info("Category association not yet implemented",
		zap.String("newsID", newsID.String()),
		zap.Int("categoryCount", len(categoryIDs)))

	return nil
}

// updateArticleAssociations updates article associations for news
func (s *NewsManagementService) updateArticleAssociations(ctx context.Context, newsID uuid.UUID, articleIDs []uuid.UUID, settings map[uuid.UUID]NewsArticleSettings) error {
	return s.associateArticles(ctx, newsID, articleIDs, settings)
}

// updateCategoryAssociations updates category associations for news
func (s *NewsManagementService) updateCategoryAssociations(ctx context.Context, newsID uuid.UUID, categoryIDs []uuid.UUID) error {
	return s.associateCategories(ctx, newsID, categoryIDs)
}

// updateNewsFields updates news fields from update request
func (s *NewsManagementService) updateNewsFields(news *entities.News, req *NewsUpdateRequest) {
	if req.Title != nil {
		news.Title = *req.Title
	}
	if req.Subtitle != nil {
		news.Subtitle = *req.Subtitle
	}
	if req.Description != nil {
		news.Description = *req.Description
	}
	if req.Summary != nil {
		news.Summary = *req.Summary
	}
	if req.Content != nil {
		news.Content = *req.Content
	}
	if req.Type != nil {
		news.Type = *req.Type
	}
	if req.Priority != nil {
		news.Priority = *req.Priority
	}
	if req.MetaTitle != nil {
		news.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		news.MetaDescription = *req.MetaDescription
	}
	if req.Keywords != nil {
		news.Keywords = *req.Keywords
	}
	if req.Tags != nil {
		news.Tags = *req.Tags
	}
	if req.FeaturedImageID != nil {
		news.FeaturedImageID = req.FeaturedImageID
	}
	if req.ThumbnailID != nil {
		news.ThumbnailID = req.ThumbnailID
	}
	if req.ScheduledAt != nil {
		news.ScheduledAt = req.ScheduledAt
	}
	if req.ExpiresAt != nil {
		news.ExpiresAt = req.ExpiresAt
	}
	if req.AllowComments != nil {
		news.AllowComments = *req.AllowComments
	}
	if req.AllowSharing != nil {
		news.AllowSharing = *req.AllowSharing
	}
	if req.IsFeatured != nil {
		news.IsFeatured = *req.IsFeatured
	}
	if req.IsBreaking != nil {
		news.IsBreaking = *req.IsBreaking
	}
	if req.RequireAuth != nil {
		news.RequireAuth = *req.RequireAuth
	}
}

// buildNewsResponse builds a news response from entity
func (s *NewsManagementService) buildNewsResponse(ctx context.Context, news *entities.News) (*NewsResponse, error) {
	response := &NewsResponse{
		ID:                news.ID,
		Title:             news.Title,
		Subtitle:          news.Subtitle,
		Description:       news.Description,
		Summary:           news.Summary,
		Content:           news.Content,
		Status:            news.Status,
		Type:              news.Type,
		Priority:          news.Priority,
		AuthorID:          news.AuthorID,
		EditorID:          news.EditorID,
		PublishedAt:       news.PublishedAt,
		ScheduledAt:       news.ScheduledAt,
		ExpiresAt:         news.ExpiresAt,
		Slug:              news.Slug,
		MetaTitle:         news.MetaTitle,
		MetaDescription:   news.MetaDescription,
		Keywords:          news.Keywords,
		Tags:              news.Tags,
		FeaturedImageID:   news.FeaturedImageID,
		ThumbnailID:       news.ThumbnailID,
		WeChatDraftID:     news.WeChatDraftID,
		WeChatPublishedID: news.WeChatPublishedID,
		WeChatURL:         news.WeChatURL,
		WeChatStatus:      news.WeChatStatus,
		ViewCount:         news.ViewCount,
		ShareCount:        news.ShareCount,
		LikeCount:         news.LikeCount,
		CommentCount:      news.CommentCount,
		ReadTime:          news.ReadTime,
		AllowComments:     news.AllowComments,
		AllowSharing:      news.AllowSharing,
		IsFeatured:        news.IsFeatured,
		IsBreaking:        news.IsBreaking,
		IsSticky:          news.IsSticky,
		RequireAuth:       news.RequireAuth,
		Language:          news.Language,
		Region:            news.Region,
		CreatedAt:         news.CreatedAt,
		UpdatedAt:         news.UpdatedAt,
		CreatedBy:         news.CreatedBy,
		UpdatedBy:         news.UpdatedBy,
	}

	return response, nil
}

// buildNewsForEditingResponse builds a news for editing response
func (s *NewsManagementService) buildNewsForEditingResponse(ctx context.Context, news *entities.News, newsArticles []*entities.NewsArticle) (*NewsForEditingResponse, error) {
	// Build basic response
	response := &NewsForEditingResponse{
		ID:              news.ID,
		Title:           news.Title,
		Subtitle:        news.Subtitle,
		Description:     news.Description,
		Summary:         news.Summary,
		Content:         news.Content,
		Status:          news.Status,
		Type:            news.Type,
		Priority:        news.Priority,
		Slug:            news.Slug,
		MetaTitle:       news.MetaTitle,
		MetaDescription: news.MetaDescription,
		Keywords:        news.Keywords,
		Tags:            news.Tags,
		FeaturedImageID: news.FeaturedImageID,
		ThumbnailID:     news.ThumbnailID,
		ScheduledAt:     news.ScheduledAt,
		ExpiresAt:       news.ExpiresAt,
		CreatedAt:       news.CreatedAt,
		UpdatedAt:       news.UpdatedAt,
	}

	// Add articles
	response.Articles = make([]NewsArticleForDisplaying, len(newsArticles))
	for i, na := range newsArticles {
		// Get article details
		article, err := s.articleRepo.GetByID(ctx, na.ArticleID, nil)
		if err != nil {
			s.logger.Warn("Failed to get article for editing response", zap.Error(err))
			continue
		}

		response.Articles[i] = NewsArticleForDisplaying{
			ID:                 na.Id,
			ArticleID:          na.ArticleID,
			Title:              article.Title,
			Summary:            article.Summary,
			DisplayOrder:       na.DisplayOrder,
			IsMainStory:        na.IsMainStory,
			IsFeatured:         na.IsFeatured,
			Section:            na.Section,
			FrontCoverImageUrl: article.FrontCoverImageUrl,
		}
	}

	return response, nil
}

// buildNewsListItem builds a news list item from entity
func (s *NewsManagementService) buildNewsListItem(news *entities.News) *NewsListItem {
	return &NewsListItem{
		ID:              news.ID,
		Title:           news.Title,
		Subtitle:        news.Subtitle,
		Description:     news.Description,
		Summary:         news.Summary,
		Status:          news.Status,
		Type:            news.Type,
		Priority:        news.Priority,
		AuthorID:        news.AuthorID,
		PublishedAt:     news.PublishedAt,
		Slug:            news.Slug,
		FeaturedImageID: news.FeaturedImageID,
		ThumbnailID:     news.ThumbnailID,
		ViewCount:       news.ViewCount,
		ShareCount:      news.ShareCount,
		LikeCount:       news.LikeCount,
		CommentCount:    news.CommentCount,
		IsFeatured:      news.IsFeatured,
		IsBreaking:      news.IsBreaking,
		IsSticky:        news.IsSticky,
		CreatedAt:       news.CreatedAt,
		UpdatedAt:       news.UpdatedAt,
	}
}

// buildNewsFilter builds a repository filter from request
func (s *NewsManagementService) buildNewsFilter(req *ListNewsRequest) repositories.NewsFilter {
	filter := repositories.NewsFilter{
		Limit:  req.PageSize,
		Offset: (req.PageNumber - 1) * req.PageSize,
	}

	if req.Status != nil {
		filter.Status = req.Status
	}
	if req.Type != nil {
		filter.Type = req.Type
	}
	if req.Priority != nil {
		filter.Priority = req.Priority
	}
	if req.AuthorID != nil {
		filter.AuthorID = req.AuthorID
	}
	if req.CategoryID != nil {
		filter.CategoryID = req.CategoryID
	}
	if req.Search != "" {
		filter.Search = &req.Search
	}
	if req.PublishedAfter != nil {
		filter.PublishedAfter = req.PublishedAfter
	}
	if req.PublishedBefore != nil {
		filter.PublishedBefore = req.PublishedBefore
	}
	if req.IsFeatured != nil {
		filter.IsFeatured = req.IsFeatured
	}
	if req.IsBreaking != nil {
		filter.IsBreaking = req.IsBreaking
	}

	// Set includes
	filter.IncludeAuthor = req.IncludeAuthor
	filter.IncludeEditor = req.IncludeEditor
	filter.IncludeCategories = req.IncludeCategories
	filter.IncludeArticles = req.IncludeArticles
	filter.IncludeImages = req.IncludeImages

	// Set sorting
	if req.SortBy != "" {
		filter.SortBy = req.SortBy
		filter.SortOrder = req.SortOrder
	} else {
		filter.SortBy = "created_at"
		filter.SortOrder = "desc"
	}

	return filter
}

// Article and Image Selection for News Creation

// ArticleSelectionFilter represents filters for article selection
type ArticleSelectionFilter struct {
	Query       string     `json:"query"`
	CategoryID  *uuid.UUID `json:"categoryId"`
	Author      string     `json:"author"`
	IsPublished *bool      `json:"isPublished"`
	Tags        []string   `json:"tags"`
	SortBy      string     `json:"sortBy"`
	SortOrder   string     `json:"sortOrder"`
	Page        int        `json:"page"`
	PageSize    int        `json:"pageSize"`
}

// ImageSelectionFilter represents filters for image selection
type ImageSelectionFilter struct {
	Query     string `json:"query"`
	MimeType  string `json:"mimeType"`
	MinWidth  int    `json:"minWidth"`
	MaxWidth  int    `json:"maxWidth"`
	MinHeight int    `json:"minHeight"`
	MaxHeight int    `json:"maxHeight"`
	SortBy    string `json:"sortBy"`
	SortOrder string `json:"sortOrder"`
	Page      int    `json:"page"`
	PageSize  int    `json:"pageSize"`
}

// SearchArticlesForSelection searches articles available for news creation
func (s *NewsManagementService) SearchArticlesForSelection(ctx context.Context, filter *ArticleSelectionFilter) ([]*entities.SiteArticle, int64, error) {
	s.logger.Info("Searching articles for selection",
		zap.String("query", filter.Query),
		zap.Int("page", filter.Page),
		zap.Int("pageSize", filter.PageSize))

	offset := (filter.Page - 1) * filter.PageSize
	limit := filter.PageSize

	var articles []*entities.SiteArticle
	var total int64
	var err error

	// Create list options
	options := &repositories.ArticleListOptions{
		IncludeCategory:       true,
		IncludeCoverImage:     true,
		IncludePromotionImage: false,
		IncludeHits:           false,
		SortBy:                filter.SortBy,
		SortOrder:             filter.SortOrder,
	}

	if filter.Query != "" || filter.Author != "" || filter.CategoryID != nil || filter.IsPublished != nil {
		// Use search with criteria
		criteria := &repositories.ArticleSearchCriteria{
			Title:       filter.Query,
			Author:      filter.Author,
			IsPublished: filter.IsPublished,
		}

		if filter.CategoryID != nil {
			criteria.CategoryId = filter.CategoryID
		}

		articles, err = s.articleRepo.Search(ctx, criteria, offset, limit, options)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to search articles: %w", err)
		}

		total, err = s.articleRepo.CountBySearch(ctx, criteria)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count articles: %w", err)
		}
	} else {
		// Get all articles
		articles, err = s.articleRepo.GetAll(ctx, offset, limit, options)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get articles: %w", err)
		}

		total, err = s.articleRepo.Count(ctx)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count articles: %w", err)
		}
	}

	return articles, total, nil
}

// SearchImagesForSelection searches images available for news creation
func (s *NewsManagementService) SearchImagesForSelection(ctx context.Context, filter *ImageSelectionFilter) ([]*entities.SiteImage, int64, error) {
	s.logger.Info("Searching images for selection",
		zap.String("query", filter.Query),
		zap.Int("page", filter.Page),
		zap.Int("pageSize", filter.PageSize))

	offset := (filter.Page - 1) * filter.PageSize
	limit := filter.PageSize

	var images []*entities.SiteImage
	var total int64
	var err error

	if filter.Query != "" {
		// Search by name
		images, err = s.imageRepo.SearchByName(ctx, filter.Query, offset, limit)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to search images: %w", err)
		}

		// For search, we need to count manually since there's no CountBySearch method
		// This is a limitation of the current repository interface
		allImages, err := s.imageRepo.SearchByName(ctx, filter.Query, 0, 1000) // Get a large number to count
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count images: %w", err)
		}
		total = int64(len(allImages))
	} else {
		// Get all images
		images, err = s.imageRepo.GetAll(ctx, offset, limit)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to get images: %w", err)
		}

		total, err = s.imageRepo.Count(ctx)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to count images: %w", err)
		}
	}

	// Filter by additional criteria (since repository doesn't support all filters)
	if filter.MimeType != "" || filter.MinWidth > 0 || filter.MaxWidth > 0 || filter.MinHeight > 0 || filter.MaxHeight > 0 {
		filteredImages := make([]*entities.SiteImage, 0)
		for _, img := range images {
			if filter.MimeType != "" && img.MimeType != filter.MimeType {
				continue
			}
			if filter.MinWidth > 0 && img.Width < filter.MinWidth {
				continue
			}
			if filter.MaxWidth > 0 && img.Width > filter.MaxWidth {
				continue
			}
			if filter.MinHeight > 0 && img.Height < filter.MinHeight {
				continue
			}
			if filter.MaxHeight > 0 && img.Height > filter.MaxHeight {
				continue
			}
			filteredImages = append(filteredImages, img)
		}
		images = filteredImages
		total = int64(len(filteredImages))
	}

	return images, total, nil
}

// NewsCreationWithSelectorsRequest represents a request to create news with selected articles and images
type NewsCreationWithSelectorsRequest struct {
	// Basic Information
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Summary     string `json:"summary"`
	Description string `json:"description"`

	// Type and Priority
	Type     entities.NewsType     `json:"type"`
	Priority entities.NewsPriority `json:"priority"`

	// Selected Content
	SelectedArticleIDs []uuid.UUID `json:"selectedArticleIds"`
	FeaturedImageID    *uuid.UUID  `json:"featuredImageId"`
	ThumbnailImageID   *uuid.UUID  `json:"thumbnailImageId"`

	// Article Settings
	ArticleSettings map[string]ArticleNewsSettings `json:"articleSettings"`

	// Categories
	CategoryIDs []uuid.UUID `json:"categoryIds"`

	// Configuration
	AllowComments bool `json:"allowComments"`
	AllowSharing  bool `json:"allowSharing"`
	IsFeatured    bool `json:"isFeatured"`
	IsBreaking    bool `json:"isBreaking"`
	RequireAuth   bool `json:"requireAuth"`

	// Scheduling
	ScheduledAt *time.Time `json:"scheduledAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`

	// WeChat Integration
	CreateWeChatDraft bool                `json:"createWeChatDraft"`
	WeChatSettings    *WeChatNewsSettings `json:"weChatSettings"`
}

// ArticleNewsSettings represents settings for an article within news
type ArticleNewsSettings struct {
	IsMainStory   bool   `json:"isMainStory"`
	IsFeatured    bool   `json:"isFeatured"`
	Section       string `json:"section"`
	CustomSummary string `json:"customSummary"`
	DisplayOrder  int    `json:"displayOrder"`
}

// WeChatNewsSettings represents WeChat-specific settings
type WeChatNewsSettings struct {
	Title        string     `json:"title"`
	Summary      string     `json:"summary"`
	CoverImageID *uuid.UUID `json:"coverImageId"`
	AutoPublish  bool       `json:"autoPublish"`
}

// CreateNewsWithSelectors creates news using selected articles and images
func (s *NewsManagementService) CreateNewsWithSelectors(ctx context.Context, req *NewsCreationWithSelectorsRequest) (uuid.UUID, error) {
	s.logger.Info("Creating news with selectors",
		zap.String("title", req.Title),
		zap.Int("articleCount", len(req.SelectedArticleIDs)),
		zap.Bool("hasFeaturedImage", req.FeaturedImageID != nil))

	// Validate selected articles exist
	if len(req.SelectedArticleIDs) == 0 {
		return uuid.Nil, fmt.Errorf("at least one article must be selected")
	}

	// Validate articles exist and are accessible
	for _, articleID := range req.SelectedArticleIDs {
		article, err := s.articleRepo.GetByID(ctx, articleID, &repositories.ArticleListOptions{})
		if err != nil {
			return uuid.Nil, fmt.Errorf("article %s not found: %w", articleID, err)
		}
		if article == nil {
			return uuid.Nil, fmt.Errorf("article %s not found", articleID)
		}
	}

	// Validate featured image if provided
	if req.FeaturedImageID != nil {
		image, err := s.imageRepo.GetByID(ctx, *req.FeaturedImageID)
		if err != nil {
			return uuid.Nil, fmt.Errorf("featured image %s not found: %w", *req.FeaturedImageID, err)
		}
		if image == nil {
			return uuid.Nil, fmt.Errorf("featured image %s not found", *req.FeaturedImageID)
		}
	}

	// Validate thumbnail image if provided
	if req.ThumbnailImageID != nil {
		image, err := s.imageRepo.GetByID(ctx, *req.ThumbnailImageID)
		if err != nil {
			return uuid.Nil, fmt.Errorf("thumbnail image %s not found: %w", *req.ThumbnailImageID, err)
		}
		if image == nil {
			return uuid.Nil, fmt.Errorf("thumbnail image %s not found", *req.ThumbnailImageID)
		}
	}

	// Create the news entity
	news := &entities.News{
		ID:          uuid.New(),
		Title:       req.Title,
		Subtitle:    req.Subtitle,
		Summary:     req.Summary,
		Description: req.Description,
		Type:        req.Type,
		Priority:    req.Priority,
		Status:      entities.NewsStatusDraft,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Set featured image ID if provided
	if req.FeaturedImageID != nil {
		news.FeaturedImageID = req.FeaturedImageID
	}

	// Set thumbnail image ID if provided
	if req.ThumbnailImageID != nil {
		news.ThumbnailID = req.ThumbnailImageID
	}

	// Set configuration flags
	news.AllowComments = req.AllowComments
	news.AllowSharing = req.AllowSharing
	news.IsFeatured = req.IsFeatured
	news.IsBreaking = req.IsBreaking
	news.RequireAuth = req.RequireAuth

	// Set scheduling
	if req.ScheduledAt != nil {
		news.ScheduledAt = req.ScheduledAt
		news.Status = entities.NewsStatusScheduled
	}
	if req.ExpiresAt != nil {
		news.ExpiresAt = req.ExpiresAt
	}

	// Create the news
	if err := s.newsRepo.Create(ctx, news); err != nil {
		return uuid.Nil, fmt.Errorf("failed to create news: %w", err)
	}

	// Create news-article associations
	for i, articleID := range req.SelectedArticleIDs {
		settings, exists := req.ArticleSettings[articleID.String()]
		if !exists {
			// Default settings
			settings = ArticleNewsSettings{
				Section:      "main",
				DisplayOrder: i + 1,
			}
		}

		association := &entities.NewsArticle{
			Id:           uuid.New(),
			NewsID:       news.ID,
			ArticleID:    articleID,
			IsMainStory:  settings.IsMainStory,
			IsFeatured:   settings.IsFeatured,
			Section:      settings.Section,
			Summary:      settings.CustomSummary, // Use Summary field instead of CustomSummary
			DisplayOrder: settings.DisplayOrder,
			CreatedAt:    time.Now(),
		}

		if err := s.newsArticleRepo.Create(ctx, association); err != nil {
			s.logger.Error("Failed to create news-article association",
				zap.String("newsID", news.ID.String()),
				zap.String("articleID", articleID.String()),
				zap.Error(err))
			// Continue with other associations
		}
	}

	// TODO: Create news-category associations
	// Note: Category associations require a separate repository or direct DB access
	// For now, we'll skip this and implement it later when the association repository is available
	if len(req.CategoryIDs) > 0 {
		s.logger.Info("Category associations requested but not yet implemented",
			zap.String("newsID", news.ID.String()),
			zap.Int("categoryCount", len(req.CategoryIDs)))
	}

	s.logger.Info("News created successfully with selectors",
		zap.String("newsID", news.ID.String()),
		zap.String("title", news.Title),
		zap.Int("articleCount", len(req.SelectedArticleIDs)))

	return news.ID, nil
}
