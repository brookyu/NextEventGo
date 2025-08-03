package services

import (
	"context"
	"fmt"
	"html"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ArticleServiceImpl implements the ArticleService interface
type ArticleServiceImpl struct {
	articleRepo  repositories.SiteArticleRepository
	categoryRepo repositories.ArticleCategoryRepository
	hitRepo      repositories.HitRepository
	qrCodeRepo   repositories.WeChatQrCodeRepository
	wechatSvc    services.WeChatService
	logger       *zap.Logger
	db           *gorm.DB
	config       *ArticleServiceConfig
}

// ArticleServiceConfig holds configuration for the article service
type ArticleServiceConfig struct {
	ValidationConfig      *services.ArticleValidationConfig
	ProcessingOptions     *services.ContentProcessingOptions
	DefaultSummaryLength  int
	AutoGenerateQRCode    bool
	AutoPublishToWeChat   bool
	EnableAnalytics       bool
}

// NewArticleService creates a new article service implementation
func NewArticleService(
	articleRepo repositories.SiteArticleRepository,
	categoryRepo repositories.ArticleCategoryRepository,
	hitRepo repositories.HitRepository,
	qrCodeRepo repositories.WeChatQrCodeRepository,
	wechatSvc services.WeChatService,
	logger *zap.Logger,
	db *gorm.DB,
	config *ArticleServiceConfig,
) services.ArticleService {
	return &ArticleServiceImpl{
		articleRepo:  articleRepo,
		categoryRepo: categoryRepo,
		hitRepo:      hitRepo,
		qrCodeRepo:   qrCodeRepo,
		wechatSvc:    wechatSvc,
		logger:       logger,
		db:           db,
		config:       config,
	}
}

// CreateArticle creates a new article
func (s *ArticleServiceImpl) CreateArticle(ctx context.Context, article *entities.SiteArticle) error {
	s.logger.Info("Creating new article", zap.String("title", article.Title))
	
	// Validate article content
	if err := s.ValidateArticleContent(ctx, article); err != nil {
		return fmt.Errorf("article validation failed: %w", err)
	}
	
	// Process article content
	if err := s.ProcessArticleContent(ctx, article); err != nil {
		return fmt.Errorf("article content processing failed: %w", err)
	}
	
	// Create the article
	if err := s.articleRepo.Create(ctx, article); err != nil {
		return fmt.Errorf("failed to create article: %w", err)
	}
	
	// Generate QR code if auto-generation is enabled
	if s.config.AutoGenerateQRCode {
		go s.generateQRCodeAsync(article.ID)
	}
	
	s.logger.Info("Successfully created article", zap.String("id", article.ID.String()))
	return nil
}

// GetArticleByID retrieves an article by ID
func (s *ArticleServiceImpl) GetArticleByID(ctx context.Context, id uuid.UUID, options *repositories.ArticleListOptions) (*entities.SiteArticle, error) {
	return s.articleRepo.GetByID(ctx, id, options)
}

// GetAllArticles retrieves all articles with pagination
func (s *ArticleServiceImpl) GetAllArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetAll(ctx, offset, limit, options)
}

// UpdateArticle updates an existing article
func (s *ArticleServiceImpl) UpdateArticle(ctx context.Context, article *entities.SiteArticle) error {
	s.logger.Info("Updating article", zap.String("id", article.ID.String()))
	
	// Validate article content
	if err := s.ValidateArticleContent(ctx, article); err != nil {
		return fmt.Errorf("article validation failed: %w", err)
	}
	
	// Process article content
	if err := s.ProcessArticleContent(ctx, article); err != nil {
		return fmt.Errorf("article content processing failed: %w", err)
	}
	
	return s.articleRepo.Update(ctx, article)
}

// DeleteArticle soft deletes an article
func (s *ArticleServiceImpl) DeleteArticle(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Deleting article", zap.String("id", id.String()))
	return s.articleRepo.Delete(ctx, id)
}

// PublishArticle publishes an article
func (s *ArticleServiceImpl) PublishArticle(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Publishing article", zap.String("id", id.String()))
	
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		return fmt.Errorf("failed to get article: %w", err)
	}
	
	// Validate article is ready for publishing
	if err := s.validateForPublishing(article); err != nil {
		return fmt.Errorf("article not ready for publishing: %w", err)
	}
	
	// Update publication status
	now := time.Now()
	article.IsPublished = true
	article.PublishedAt = &now
	
	if err := s.articleRepo.Update(ctx, article); err != nil {
		return fmt.Errorf("failed to publish article: %w", err)
	}
	
	// Auto-publish to WeChat if enabled
	if s.config.AutoPublishToWeChat {
		go s.publishToWeChatAsync(article.ID)
	}
	
	s.logger.Info("Successfully published article", zap.String("id", id.String()))
	return nil
}

// UnpublishArticle unpublishes an article
func (s *ArticleServiceImpl) UnpublishArticle(ctx context.Context, id uuid.UUID) error {
	s.logger.Info("Unpublishing article", zap.String("id", id.String()))
	
	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		return fmt.Errorf("failed to get article: %w", err)
	}
	
	article.IsPublished = false
	article.PublishedAt = nil
	
	return s.articleRepo.Update(ctx, article)
}

// PublishMultipleArticles publishes multiple articles
func (s *ArticleServiceImpl) PublishMultipleArticles(ctx context.Context, ids []uuid.UUID) error {
	s.logger.Info("Publishing multiple articles", zap.Int("count", len(ids)))
	return s.articleRepo.PublishArticles(ctx, ids)
}

// SearchArticles searches articles based on criteria
func (s *ArticleServiceImpl) SearchArticles(ctx context.Context, criteria *repositories.ArticleSearchCriteria, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	return s.articleRepo.Search(ctx, criteria, offset, limit, options)
}

// GetArticlesByCategory retrieves articles by category
func (s *ArticleServiceImpl) GetArticlesByCategory(ctx context.Context, categoryId uuid.UUID, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetByCategory(ctx, categoryId, offset, limit, options)
}

// GetPublishedArticles retrieves published articles
func (s *ArticleServiceImpl) GetPublishedArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetPublished(ctx, offset, limit, options)
}

// GetDraftArticles retrieves draft articles
func (s *ArticleServiceImpl) GetDraftArticles(ctx context.Context, offset, limit int, options *repositories.ArticleListOptions) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetDrafts(ctx, offset, limit, options)
}

// GetArticleByPromotionCode retrieves an article by promotion code
func (s *ArticleServiceImpl) GetArticleByPromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error) {
	return s.articleRepo.GetByPromotionCode(ctx, promotionCode)
}

// TrackArticleView tracks an article view
func (s *ArticleServiceImpl) TrackArticleView(ctx context.Context, articleId uuid.UUID, trackingData *services.ArticleViewTrackingData) error {
	if !s.config.EnableAnalytics {
		return nil
	}
	
	// Update article view count
	if err := s.articleRepo.UpdateViewCount(ctx, articleId); err != nil {
		s.logger.Error("Failed to update view count", zap.Error(err))
	}
	
	// Create hit record
	hit := &entities.Hit{
		ResourceId:    articleId,
		ResourceType:  "article",
		UserId:        trackingData.UserId,
		SessionId:     trackingData.SessionId,
		HitType:       entities.HitTypeView,
		IPAddress:     trackingData.IPAddress,
		UserAgent:     trackingData.UserAgent,
		Referrer:      trackingData.Referrer,
		PromotionCode: trackingData.PromotionCode,
		Country:       trackingData.Country,
		City:          trackingData.City,
		DeviceType:    trackingData.DeviceType,
		Platform:      trackingData.Platform,
		Browser:       trackingData.Browser,
		WeChatOpenId:  trackingData.WeChatOpenId,
		WeChatUnionId: trackingData.WeChatUnionId,
	}
	
	return s.hitRepo.Create(ctx, hit)
}

// TrackArticleRead tracks an article read completion
func (s *ArticleServiceImpl) TrackArticleRead(ctx context.Context, articleId uuid.UUID, trackingData *services.ArticleReadTrackingData) error {
	if !s.config.EnableAnalytics {
		return nil
	}
	
	// Update article read count
	if err := s.articleRepo.UpdateReadCount(ctx, articleId); err != nil {
		s.logger.Error("Failed to update read count", zap.Error(err))
	}
	
	// Create hit record
	hit := &entities.Hit{
		ResourceId:      articleId,
		ResourceType:    "article",
		UserId:          trackingData.UserId,
		SessionId:       trackingData.SessionId,
		HitType:         entities.HitTypeRead,
		IPAddress:       trackingData.IPAddress,
		UserAgent:       trackingData.UserAgent,
		Referrer:        trackingData.Referrer,
		PromotionCode:   trackingData.PromotionCode,
		ReadDuration:    trackingData.ReadDuration,
		ReadPercentage:  trackingData.ReadPercentage,
		ScrollDepth:     trackingData.ScrollDepth,
		Country:         trackingData.Country,
		City:            trackingData.City,
		DeviceType:      trackingData.DeviceType,
		Platform:        trackingData.Platform,
		Browser:         trackingData.Browser,
		WeChatOpenId:    trackingData.WeChatOpenId,
		WeChatUnionId:   trackingData.WeChatUnionId,
	}
	
	return s.hitRepo.Create(ctx, hit)
}

// GetArticleAnalytics retrieves article analytics
func (s *ArticleServiceImpl) GetArticleAnalytics(ctx context.Context, articleId uuid.UUID, days int) (*repositories.ArticleWithAnalytics, error) {
	return s.articleRepo.GetArticleWithAnalytics(ctx, articleId, days)
}

// GetPopularArticles retrieves popular articles
func (s *ArticleServiceImpl) GetPopularArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetPopularArticles(ctx, limit, days)
}

// GetMostViewedArticles retrieves most viewed articles
func (s *ArticleServiceImpl) GetMostViewedArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetMostViewed(ctx, limit, days)
}

// GetMostReadArticles retrieves most read articles
func (s *ArticleServiceImpl) GetMostReadArticles(ctx context.Context, limit int, days int) ([]*entities.SiteArticle, error) {
	return s.articleRepo.GetMostRead(ctx, limit, days)
}

// Statistics methods
func (s *ArticleServiceImpl) GetArticleCount(ctx context.Context) (int64, error) {
	return s.articleRepo.Count(ctx)
}

func (s *ArticleServiceImpl) GetPublishedCount(ctx context.Context) (int64, error) {
	return s.articleRepo.CountPublished(ctx)
}

func (s *ArticleServiceImpl) GetDraftCount(ctx context.Context) (int64, error) {
	return s.articleRepo.CountDrafts(ctx)
}

func (s *ArticleServiceImpl) GetCategoryArticleCount(ctx context.Context, categoryId uuid.UUID) (int64, error) {
	return s.articleRepo.CountByCategory(ctx, categoryId)
}

// ValidateArticleContent validates article content
func (s *ArticleServiceImpl) ValidateArticleContent(ctx context.Context, article *entities.SiteArticle) error {
	config := s.config.ValidationConfig
	
	// Validate title
	if len(article.Title) < config.MinTitleLength {
		return fmt.Errorf("title too short: minimum %d characters", config.MinTitleLength)
	}
	if len(article.Title) > config.MaxTitleLength {
		return fmt.Errorf("title too long: maximum %d characters", config.MaxTitleLength)
	}
	
	// Validate content
	if len(article.Content) < config.MinContentLength {
		return fmt.Errorf("content too short: minimum %d characters", config.MinContentLength)
	}
	if len(article.Content) > config.MaxContentLength {
		return fmt.Errorf("content too long: maximum %d characters", config.MaxContentLength)
	}
	
	// Validate summary
	if len(article.Summary) > config.MaxSummaryLength {
		return fmt.Errorf("summary too long: maximum %d characters", config.MaxSummaryLength)
	}
	
	// Check for forbidden words
	for _, word := range config.ForbiddenWords {
		if strings.Contains(strings.ToLower(article.Content), strings.ToLower(word)) {
			return fmt.Errorf("content contains forbidden word: %s", word)
		}
	}
	
	// Validate category exists
	if _, err := s.categoryRepo.GetByID(ctx, article.CategoryId); err != nil {
		return fmt.Errorf("invalid category: %w", err)
	}
	
	return nil
}

// ProcessArticleContent processes article content
func (s *ArticleServiceImpl) ProcessArticleContent(ctx context.Context, article *entities.SiteArticle) error {
	options := s.config.ProcessingOptions
	
	// Sanitize HTML content
	if options.SanitizeHTML {
		article.Content = s.sanitizeHTML(article.Content)
	}
	
	// Generate summary if not provided
	if options.GenerateSummary && article.Summary == "" {
		summary, err := s.GenerateArticleSummary(ctx, article.Content, s.config.DefaultSummaryLength)
		if err != nil {
			s.logger.Warn("Failed to generate summary", zap.Error(err))
		} else {
			article.Summary = summary
		}
	}
	
	return nil
}

// GenerateArticleSummary generates a summary from article content
func (s *ArticleServiceImpl) GenerateArticleSummary(ctx context.Context, content string, maxLength int) (string, error) {
	// Simple implementation: extract first paragraph or first N characters
	// Strip HTML tags
	text := s.stripHTMLTags(content)
	
	// Get first paragraph or first maxLength characters
	paragraphs := strings.Split(text, "\n\n")
	if len(paragraphs) > 0 && len(paragraphs[0]) <= maxLength {
		return strings.TrimSpace(paragraphs[0]), nil
	}
	
	// Truncate to maxLength and find last complete word
	if len(text) <= maxLength {
		return strings.TrimSpace(text), nil
	}
	
	truncated := text[:maxLength]
	lastSpace := strings.LastIndex(truncated, " ")
	if lastSpace > 0 {
		truncated = truncated[:lastSpace]
	}
	
	return strings.TrimSpace(truncated) + "...", nil
}

// GeneratePromotionCode generates a promotion code for an article
func (s *ArticleServiceImpl) GeneratePromotionCode(ctx context.Context, articleId uuid.UUID) (string, error) {
	// Generate a unique promotion code
	code := "ART_" + articleId.String()[:8] + "_" + fmt.Sprintf("%d", time.Now().Unix())
	
	// Update the article with the promotion code
	article, err := s.articleRepo.GetByID(ctx, articleId, nil)
	if err != nil {
		return "", err
	}
	
	article.PromotionCode = code
	if err := s.articleRepo.Update(ctx, article); err != nil {
		return "", err
	}
	
	return code, nil
}

// ValidatePromotionCode validates a promotion code and returns the article
func (s *ArticleServiceImpl) ValidatePromotionCode(ctx context.Context, promotionCode string) (*entities.SiteArticle, error) {
	return s.articleRepo.GetByPromotionCode(ctx, promotionCode)
}

// Helper methods

func (s *ArticleServiceImpl) validateForPublishing(article *entities.SiteArticle) error {
	if article.Title == "" {
		return fmt.Errorf("title is required")
	}
	if article.Content == "" {
		return fmt.Errorf("content is required")
	}
	if article.Author == "" {
		return fmt.Errorf("author is required")
	}
	return nil
}

func (s *ArticleServiceImpl) sanitizeHTML(content string) string {
	// Basic HTML sanitization - in production, use a proper HTML sanitizer
	content = html.EscapeString(content)
	return content
}

func (s *ArticleServiceImpl) stripHTMLTags(content string) string {
	// Remove HTML tags using regex
	re := regexp.MustCompile(`<[^>]*>`)
	return re.ReplaceAllString(content, "")
}

func (s *ArticleServiceImpl) generateQRCodeAsync(articleId uuid.UUID) {
	// This would generate a QR code for the article
	s.logger.Info("Generating QR code for article", zap.String("articleId", articleId.String()))
	// Implementation would call WeChat QR code service
}

func (s *ArticleServiceImpl) publishToWeChatAsync(articleId uuid.UUID) {
	// This would publish the article to WeChat
	s.logger.Info("Publishing article to WeChat", zap.String("articleId", articleId.String()))
	// Implementation would call WeChat publishing service
}
