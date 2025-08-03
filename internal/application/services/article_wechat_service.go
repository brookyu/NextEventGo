package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
)

// QRCodeServiceInterface defines the interface for QR code operations
type QRCodeServiceInterface interface {
	GenerateArticleQRCode(ctx context.Context, articleID uuid.UUID, qrType entities.QRCodeType) (*entities.WeChatQrCode, error)
	TrackQRCodeScan(ctx context.Context, qrCodeID uuid.UUID, scanData *QRCodeScanData) error
	RevokeQRCode(ctx context.Context, qrCodeID uuid.UUID) error
}

// ArticleWeChatService handles WeChat integration for articles
type ArticleWeChatService struct {
	articleRepo   repositories.SiteArticleRepository
	qrCodeRepo    repositories.WeChatQrCodeRepository
	wechatService services.WeChatService
	qrCodeService QRCodeServiceInterface
	logger        *zap.Logger
	config        ArticleWeChatConfig
}

// ArticleWeChatConfig contains configuration for article WeChat integration
type ArticleWeChatConfig struct {
	QRCodeExpireSeconds  int
	MaxQRCodesPerArticle int
	WeChatBaseURL        string
	EnableAnalytics      bool
	DefaultQRCodeStyle   string
}

// NewArticleWeChatService creates a new article WeChat service
func NewArticleWeChatService(
	articleRepo repositories.SiteArticleRepository,
	qrCodeRepo repositories.WeChatQrCodeRepository,
	wechatService services.WeChatService,
	qrCodeService QRCodeServiceInterface,
	logger *zap.Logger,
	config ArticleWeChatConfig,
) *ArticleWeChatService {
	return &ArticleWeChatService{
		articleRepo:   articleRepo,
		qrCodeRepo:    qrCodeRepo,
		wechatService: wechatService,
		qrCodeService: qrCodeService,
		logger:        logger,
		config:        config,
	}
}

// GenerateArticleQRCode generates a WeChat QR code for an article
func (s *ArticleWeChatService) GenerateArticleQRCode(ctx context.Context, articleID uuid.UUID, qrCodeType string) (*entities.WeChatQrCode, error) {
	s.logger.Info("Generating WeChat QR code for article",
		zap.String("articleId", articleID.String()),
		zap.String("type", qrCodeType))

	// Validate article exists
	_, err := s.articleRepo.GetByID(ctx, articleID, nil)
	if err != nil {
		return nil, fmt.Errorf("article not found: %w", err)
	}

	// Generate QR code using existing service
	qrType := entities.QRCodeTypePermanent
	if qrCodeType == "temporary" {
		qrType = entities.QRCodeTypeTemporary
	}

	qrCode, err := s.qrCodeService.GenerateArticleQRCode(ctx, articleID, qrType)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code: %w", err)
	}

	s.logger.Info("Successfully generated article QR code",
		zap.String("qrCodeId", qrCode.ID.String()),
		zap.String("articleId", articleID.String()))

	return qrCode, nil
}

// GetArticleQRCodes retrieves all QR codes for an article
func (s *ArticleWeChatService) GetArticleQRCodes(ctx context.Context, articleID uuid.UUID) ([]*entities.WeChatQrCode, error) {
	qrCodes, err := s.qrCodeRepo.GetByResource(ctx, articleID, "article")
	if err != nil {
		return nil, fmt.Errorf("failed to get QR codes: %w", err)
	}

	return qrCodes, nil
}

// PrepareWeChatContent optimizes article content for WeChat sharing
func (s *ArticleWeChatService) PrepareWeChatContent(ctx context.Context, articleID uuid.UUID) (string, error) {
	article, err := s.articleRepo.GetByID(ctx, articleID, nil)
	if err != nil {
		return "", fmt.Errorf("article not found: %w", err)
	}

	// Generate WeChat-optimized content
	optimizedContent := s.optimizeWeChatContent(article.Content)
	return optimizedContent, nil
}

// TrackQRCodeScan tracks when an article QR code is scanned
func (s *ArticleWeChatService) TrackQRCodeScan(ctx context.Context, qrCodeID uuid.UUID, scanData *QRCodeScanData) error {
	return s.qrCodeService.TrackQRCodeScan(ctx, qrCodeID, scanData)
}

// RevokeArticleQRCode revokes a specific QR code for an article
func (s *ArticleWeChatService) RevokeArticleQRCode(ctx context.Context, qrCodeID uuid.UUID) error {
	return s.qrCodeService.RevokeQRCode(ctx, qrCodeID)
}

// Helper methods for content optimization
func (s *ArticleWeChatService) optimizeWeChatTitle(title string) string {
	// WeChat title optimization (max 64 characters)
	if len(title) > 64 {
		return title[:61] + "..."
	}
	return title
}

func (s *ArticleWeChatService) optimizeWeChatSummary(summary string) string {
	// WeChat summary optimization (max 120 characters)
	if len(summary) > 120 {
		return summary[:117] + "..."
	}
	return summary
}

func (s *ArticleWeChatService) optimizeWeChatContent(content string) string {
	// Basic HTML cleanup for WeChat
	// Remove unsupported tags, optimize images, etc.
	optimized := content

	// Remove script tags
	optimized = strings.ReplaceAll(optimized, "<script", "<!-- script")
	optimized = strings.ReplaceAll(optimized, "</script>", "script -->")

	// Optimize image tags for WeChat
	// This is a simplified implementation - in production, use proper HTML parser

	return optimized
}

func (s *ArticleWeChatService) generateWeChatShareText(article *entities.SiteArticle) string {
	shareText := fmt.Sprintf("📖 %s\n\n", article.Title)

	if article.Summary != "" {
		shareText += fmt.Sprintf("%s\n\n", article.Summary)
	}

	shareText += "👆 点击阅读全文\n\n"
	shareText += "🔗 " + s.generateArticleShareURL(article)

	return shareText
}

func (s *ArticleWeChatService) generateArticleShareURL(article *entities.SiteArticle) string {
	baseURL := s.config.WeChatBaseURL
	if baseURL == "" {
		baseURL = "https://example.com" // Default or from config
	}

	// Use promotion code if available for tracking
	if article.PromotionCode != "" {
		return fmt.Sprintf("%s/articles/promo/%s", baseURL, article.PromotionCode)
	}

	return fmt.Sprintf("%s/articles/%s", baseURL, article.ID.String())
}

func (s *ArticleWeChatService) getOptimizedCoverImage(article *entities.SiteArticle) string {
	// Return optimized cover image URL for WeChat sharing
	if article.SiteImageId != nil {
		// In a real implementation, this would get the actual image URL
		return fmt.Sprintf("/api/images/%s/wechat-optimized", article.SiteImageId.String())
	}

	// Return default image
	return "/assets/default-article-cover.jpg"
}

func (s *ArticleWeChatService) generateWeChatTags(article *entities.SiteArticle) []string {
	tags := []string{}

	// Add category as tag if available
	if article.Category != nil {
		tags = append(tags, "#"+article.Category.Name)
	}

	// Add author tag
	if article.Author != "" {
		tags = append(tags, "#"+article.Author)
	}

	// Add generic article tag
	tags = append(tags, "#文章分享")

	return tags
}
