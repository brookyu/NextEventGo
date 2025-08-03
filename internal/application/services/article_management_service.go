package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"go.uber.org/zap"
)

// ArticleManagementService provides comprehensive article management functionality
type ArticleManagementService struct {
	articleRepo  repositories.SiteArticleRepository
	categoryRepo repositories.ArticleCategoryRepository
	trackingRepo repositories.ArticleTrackingRepository
	hitRepo      repositories.HitRepository
	imageRepo    repositories.SiteImageRepository
	qrCodeRepo   repositories.WeChatQrCodeRepository
	logger       *zap.Logger
	config       *ArticleManagementConfig
}

// ArticleManagementConfig contains configuration for article management
type ArticleManagementConfig struct {
	// Content settings
	MaxContentLength int
	MaxSummaryLength int
	MaxTitleLength   int
	AllowedHTMLTags  []string

	// Publishing settings
	RequireApproval     bool
	AutoGenerateQRCode  bool
	AutoPublishToWeChat bool

	// Analytics settings
	EnableAnalytics     bool
	TrackAnonymousUsers bool

	// Performance settings
	DefaultCacheTimeout time.Duration
	MaxSearchResults    int
}

// NewArticleManagementService creates a new article management service
func NewArticleManagementService(
	articleRepo repositories.SiteArticleRepository,
	categoryRepo repositories.ArticleCategoryRepository,
	trackingRepo repositories.ArticleTrackingRepository,
	hitRepo repositories.HitRepository,
	imageRepo repositories.SiteImageRepository,
	qrCodeRepo repositories.WeChatQrCodeRepository,
	logger *zap.Logger,
	config *ArticleManagementConfig,
) *ArticleManagementService {
	return &ArticleManagementService{
		articleRepo:  articleRepo,
		categoryRepo: categoryRepo,
		trackingRepo: trackingRepo,
		hitRepo:      hitRepo,
		imageRepo:    imageRepo,
		qrCodeRepo:   qrCodeRepo,
		logger:       logger,
		config:       config,
	}
}

// CreateArticleRequest represents a request to create an article
type CreateArticleRequest struct {
	Title              string     `json:"title" validate:"required,max=500"`
	Summary            string     `json:"summary" validate:"max=1000"`
	Content            string     `json:"content" validate:"required"`
	Author             string     `json:"author" validate:"required"`
	CategoryID         uuid.UUID  `json:"categoryId" validate:"required"`
	SiteImageID        *uuid.UUID `json:"siteImageId,omitempty"`
	PromotionPicID     *uuid.UUID `json:"promotionPicId,omitempty"`
	JumpResourceID     *uuid.UUID `json:"jumpResourceId,omitempty"`
	FrontCoverImageUrl string     `json:"frontCoverImageUrl,omitempty"`
	IsPublished        bool       `json:"isPublished"`
	CreatedBy          uuid.UUID  `json:"createdBy"`
}

// ArticleResponse represents an article response
type ArticleResponse struct {
	ID                 uuid.UUID                 `json:"id"`
	Title              string                    `json:"title"`
	Summary            string                    `json:"summary"`
	Content            string                    `json:"content"`
	Author             string                    `json:"author"`
	CategoryID         uuid.UUID                 `json:"categoryId"`
	Category           *entities.ArticleCategory `json:"category,omitempty"`
	SiteImageID        *uuid.UUID                `json:"siteImageId,omitempty"`
	CoverImage         *entities.SiteImage       `json:"coverImage,omitempty"`
	PromotionPicID     *uuid.UUID                `json:"promotionPicId,omitempty"`
	PromotionImage     *entities.SiteImage       `json:"promotionImage,omitempty"`
	JumpResourceID     *uuid.UUID                `json:"jumpResourceId,omitempty"`
	PromotionCode      string                    `json:"promotionCode"`
	FrontCoverImageUrl string                    `json:"frontCoverImageUrl"`
	IsPublished        bool                      `json:"isPublished"`
	PublishedAt        *time.Time                `json:"publishedAt,omitempty"`
	ViewCount          int64                     `json:"viewCount"`
	ReadCount          int64                     `json:"readCount"`
	CreatedAt          time.Time                 `json:"createdAt"`
	UpdatedAt          *time.Time                `json:"updatedAt,omitempty"`
	CreatedBy          *uuid.UUID                `json:"createdBy,omitempty"`
	UpdatedBy          *uuid.UUID                `json:"updatedBy,omitempty"`
}

// CreateArticle creates a new article with comprehensive validation and processing
func (s *ArticleManagementService) CreateArticle(ctx context.Context, req *CreateArticleRequest) (*ArticleResponse, error) {
	s.logger.Info("Creating new article", zap.String("title", req.Title))

	// Validate request
	if err := s.validateCreateRequest(req); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Create article entity
	article := &entities.SiteArticle{
		ID:                 uuid.New(),
		Title:              req.Title,
		Summary:            req.Summary,
		Content:            s.sanitizeContent(req.Content),
		Author:             req.Author,
		CategoryId:         req.CategoryID,
		SiteImageId:        req.SiteImageID,
		PromotionPicId:     req.PromotionPicID,
		JumpResourceId:     req.JumpResourceID,
		FrontCoverImageUrl: req.FrontCoverImageUrl,
		IsPublished:        req.IsPublished,
		CreatedBy:          &req.CreatedBy,
	}

	// Generate promotion code
	article.PromotionCode = s.generatePromotionCode()

	// Set published timestamp if publishing
	if req.IsPublished {
		now := time.Now()
		article.PublishedAt = &now
	}

	// Create article in database
	if err := s.articleRepo.Create(ctx, article); err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	// Generate QR code if enabled
	if s.config.AutoGenerateQRCode {
		go s.generateQRCodeAsync(article.ID)
	}

	s.logger.Info("Successfully created article", zap.String("id", article.ID.String()))

	return s.toArticleResponse(article), nil
}

// GetArticle retrieves an article by ID with optional relationships
func (s *ArticleManagementService) GetArticle(ctx context.Context, id uuid.UUID, includeRelations bool) (*ArticleResponse, error) {
	options := &repositories.ArticleListOptions{}
	if includeRelations {
		options.IncludeCategory = true
		options.IncludeCoverImage = true
		options.IncludePromotionImage = true
	}

	article, err := s.articleRepo.GetByID(ctx, id, options)
	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	return s.toArticleResponse(article), nil
}

// ListArticles retrieves articles with pagination and filtering
func (s *ArticleManagementService) ListArticles(ctx context.Context, options *repositories.ArticleListOptions) ([]*ArticleResponse, int64, error) {
	// Default pagination values if not provided
	offset := 0
	limit := 20

	// Get articles
	articles, err := s.articleRepo.GetAll(ctx, offset, limit, options)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get articles: %w", err)
	}

	// Get total count
	count, err := s.articleRepo.Count(ctx)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count articles: %w", err)
	}

	// Convert to responses
	responses := make([]*ArticleResponse, len(articles))
	for i, article := range articles {
		responses[i] = s.toArticleResponse(article)
	}

	return responses, count, nil
}

// PublishArticle publishes an article
func (s *ArticleManagementService) PublishArticle(ctx context.Context, id uuid.UUID, publishedBy uuid.UUID) error {
	s.logger.Info("Publishing article", zap.String("id", id.String()))

	article, err := s.articleRepo.GetByID(ctx, id, nil)
	if err != nil {
		return fmt.Errorf("failed to get article: %w", err)
	}

	if article.IsPublished {
		return fmt.Errorf("article is already published")
	}

	// Update article
	now := time.Now()
	article.IsPublished = true
	article.PublishedAt = &now
	article.UpdatedBy = &publishedBy

	if err := s.articleRepo.Update(ctx, article); err != nil {
		return fmt.Errorf("failed to update article: %w", err)
	}

	s.logger.Info("Successfully published article", zap.String("id", id.String()))
	return nil
}

// TrackArticleView tracks when a user views an article
func (s *ArticleManagementService) TrackArticleView(ctx context.Context, articleID uuid.UUID, trackingData *ArticleTrackingData) error {
	if !s.config.EnableAnalytics {
		return nil
	}

	// Create tracking record
	tracking := &entities.ArticleTracking{
		ID:           uuid.New(),
		ArticleID:    articleID,
		UserID:       trackingData.UserID,
		SessionID:    trackingData.SessionID,
		IPAddress:    trackingData.IPAddress,
		UserAgent:    trackingData.UserAgent,
		Referrer:     trackingData.Referrer,
		PromoterCode: trackingData.PromoterCode,
		DeviceType:   trackingData.DeviceType,
		Browser:      trackingData.Browser,
		OS:           trackingData.OS,
		Country:      trackingData.Country,
		City:         trackingData.City,
	}

	if err := s.trackingRepo.Create(ctx, tracking); err != nil {
		s.logger.Error("Failed to create tracking record", zap.Error(err))
		return err
	}

	// Update article view count
	if err := s.articleRepo.UpdateViewCount(ctx, articleID); err != nil {
		s.logger.Error("Failed to update view count", zap.Error(err))
	}

	return nil
}

// TrackArticleRead tracks when a user completes reading an article
func (s *ArticleManagementService) TrackArticleRead(ctx context.Context, articleID uuid.UUID, sessionID string, readData *ArticleReadData) error {
	if !s.config.EnableAnalytics {
		return nil
	}

	// Find existing tracking record
	tracking, err := s.trackingRepo.GetByArticleAndSession(ctx, articleID, sessionID)
	if err != nil {
		s.logger.Error("Failed to get tracking record", zap.Error(err))
		return err
	}

	// Update tracking record with read data
	tracking.ReadDuration = readData.ReadDuration
	tracking.ScrollDepth = readData.ScrollDepth
	tracking.ReadPercentage = readData.ReadPercentage
	tracking.IsCompleted = readData.ReadPercentage >= 80.0

	if readData.ReadDuration > 0 {
		endTime := tracking.ReadStartTime.Add(time.Duration(readData.ReadDuration) * time.Second)
		tracking.ReadEndTime = &endTime
	}

	if err := s.trackingRepo.Update(ctx, tracking); err != nil {
		s.logger.Error("Failed to update tracking record", zap.Error(err))
		return err
	}

	// Update article read count if completed
	if tracking.IsCompleted {
		if err := s.articleRepo.UpdateReadCount(ctx, articleID); err != nil {
			s.logger.Error("Failed to update read count", zap.Error(err))
		}
	}

	return nil
}

// GetArticleAnalytics retrieves comprehensive analytics for an article
func (s *ArticleManagementService) GetArticleAnalytics(ctx context.Context, articleID uuid.UUID) (*repositories.ArticleAnalyticsData, error) {
	return s.trackingRepo.GetArticleAnalytics(ctx, articleID)
}

// Helper methods

func (s *ArticleManagementService) validateCreateRequest(req *CreateArticleRequest) error {
	if len(req.Title) > s.config.MaxTitleLength {
		return fmt.Errorf("title too long: max %d characters", s.config.MaxTitleLength)
	}
	if len(req.Summary) > s.config.MaxSummaryLength {
		return fmt.Errorf("summary too long: max %d characters", s.config.MaxSummaryLength)
	}
	if len(req.Content) > s.config.MaxContentLength {
		return fmt.Errorf("content too long: max %d characters", s.config.MaxContentLength)
	}
	return nil
}

func (s *ArticleManagementService) sanitizeContent(content string) string {
	// TODO: Implement HTML sanitization based on allowed tags
	return content
}

func (s *ArticleManagementService) generatePromotionCode() string {
	// Generate a unique promotion code
	return fmt.Sprintf("ART-%d", time.Now().Unix())
}

func (s *ArticleManagementService) generateQRCodeAsync(articleID uuid.UUID) {
	// TODO: Implement QR code generation
	s.logger.Info("Generating QR code for article", zap.String("articleId", articleID.String()))
}

func (s *ArticleManagementService) toArticleResponse(article *entities.SiteArticle) *ArticleResponse {
	return &ArticleResponse{
		ID:                 article.ID,
		Title:              article.Title,
		Summary:            article.Summary,
		Content:            article.Content,
		Author:             article.Author,
		CategoryID:         article.CategoryId,
		Category:           article.Category,
		SiteImageID:        article.SiteImageId,
		CoverImage:         article.CoverImage,
		PromotionPicID:     article.PromotionPicId,
		PromotionImage:     article.PromotionImage,
		JumpResourceID:     article.JumpResourceId,
		PromotionCode:      article.PromotionCode,
		FrontCoverImageUrl: article.FrontCoverImageUrl,
		IsPublished:        article.IsPublished,
		PublishedAt:        article.PublishedAt,
		ViewCount:          article.ViewCount,
		ReadCount:          article.ReadCount,
		CreatedAt:          article.CreatedAt,
		UpdatedAt:          article.UpdatedAt,
		CreatedBy:          article.CreatedBy,
		UpdatedBy:          article.UpdatedBy,
	}
}

// Data transfer objects

type ArticleTrackingData struct {
	UserID       *uuid.UUID `json:"userId,omitempty"`
	SessionID    string     `json:"sessionId"`
	IPAddress    string     `json:"ipAddress"`
	UserAgent    string     `json:"userAgent"`
	Referrer     string     `json:"referrer"`
	PromoterCode string     `json:"promoterCode"`
	DeviceType   string     `json:"deviceType"`
	Browser      string     `json:"browser"`
	OS           string     `json:"os"`
	Country      string     `json:"country"`
	City         string     `json:"city"`
}

type ArticleReadData struct {
	ReadDuration   int64   `json:"readDuration"`   // in seconds
	ScrollDepth    float64 `json:"scrollDepth"`    // percentage
	ReadPercentage float64 `json:"readPercentage"` // percentage
}
