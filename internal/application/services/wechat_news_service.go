package services

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
)

// WeChatNewsServiceImpl implements WeChat news integration
type WeChatNewsServiceImpl struct {
	newsRepo        repositories.NewsRepository
	newsArticleRepo repositories.NewsArticleRepository
	articleRepo     repositories.SiteArticleRepository
	imageRepo       repositories.SiteImageRepository
	wechatService   services.WeChatService
	wechatClient    *wechat.WeChatAPIClient
	logger          *zap.Logger
	config          WeChatNewsConfig
}

// WeChatNewsConfig holds configuration for WeChat news integration
type WeChatNewsConfig struct {
	EnableDraftCreation       bool
	EnableAutoPublish         bool
	EnableImageUpload         bool
	EnableContentOptimization bool
	MaxArticlesPerDraft       int
	ImageUploadTimeout        time.Duration
	ContentProcessingTimeout  time.Duration
}

// DefaultWeChatNewsConfig returns default configuration
func DefaultWeChatNewsConfig() WeChatNewsConfig {
	return WeChatNewsConfig{
		EnableDraftCreation:       true,
		EnableAutoPublish:         false,
		EnableImageUpload:         true,
		EnableContentOptimization: true,
		MaxArticlesPerDraft:       8,
		ImageUploadTimeout:        30 * time.Second,
		ContentProcessingTimeout:  60 * time.Second,
	}
}

// NewWeChatNewsService creates a new WeChat news service
func NewWeChatNewsService(
	newsRepo repositories.NewsRepository,
	newsArticleRepo repositories.NewsArticleRepository,
	articleRepo repositories.SiteArticleRepository,
	imageRepo repositories.SiteImageRepository,
	wechatService services.WeChatService,
	wechatClient *wechat.WeChatAPIClient,
	logger *zap.Logger,
	config WeChatNewsConfig,
) *WeChatNewsServiceImpl {
	return &WeChatNewsServiceImpl{
		newsRepo:        newsRepo,
		newsArticleRepo: newsArticleRepo,
		articleRepo:     articleRepo,
		imageRepo:       imageRepo,
		wechatService:   wechatService,
		wechatClient:    wechatClient,
		logger:          logger,
		config:          config,
	}
}

// CreateWeChatDraft creates a WeChat draft for the news
func (s *WeChatNewsServiceImpl) CreateWeChatDraft(ctx context.Context, newsID uuid.UUID) error {
	if !s.config.EnableDraftCreation {
		return nil
	}

	s.logger.Info("Creating WeChat draft", zap.String("newsID", newsID.String()))

	// Get news with articles
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Get news articles
	newsArticles, err := s.newsArticleRepo.GetByNewsID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get news articles: %w", err)
	}

	if len(newsArticles) == 0 {
		return fmt.Errorf("news has no articles")
	}

	// Process articles for WeChat
	wechatArticles, err := s.processArticlesForWeChat(ctx, newsArticles)
	if err != nil {
		return fmt.Errorf("failed to process articles for WeChat: %w", err)
	}

	// Create WeChat draft
	draftID, err := s.createWeChatDraftAPI(ctx, news, wechatArticles)
	if err != nil {
		return fmt.Errorf("failed to create WeChat draft: %w", err)
	}

	// Update news with WeChat draft ID
	if err := s.newsRepo.UpdateWeChatStatus(ctx, newsID, "draft", draftID, ""); err != nil {
		s.logger.Warn("Failed to update WeChat status", zap.Error(err))
	}

	s.logger.Info("WeChat draft created successfully",
		zap.String("newsID", newsID.String()),
		zap.String("draftID", draftID))

	return nil
}

// UpdateWeChatDraft updates an existing WeChat draft
func (s *WeChatNewsServiceImpl) UpdateWeChatDraft(ctx context.Context, newsID uuid.UUID) error {
	if !s.config.EnableDraftCreation {
		return nil
	}

	s.logger.Info("Updating WeChat draft", zap.String("newsID", newsID.String()))

	// Get news
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Delete existing draft if exists
	if news.WeChatDraftID != "" {
		if err := s.deleteWeChatDraftAPI(ctx, news.WeChatDraftID); err != nil {
			s.logger.Warn("Failed to delete existing WeChat draft", zap.Error(err))
		}
	}

	// Create new draft
	return s.CreateWeChatDraft(ctx, newsID)
}

// DeleteWeChatDraft deletes a WeChat draft
func (s *WeChatNewsServiceImpl) DeleteWeChatDraft(ctx context.Context, newsID uuid.UUID) error {
	s.logger.Info("Deleting WeChat draft", zap.String("newsID", newsID.String()))

	// Get news
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Delete draft if exists
	if news.WeChatDraftID != "" {
		if err := s.deleteWeChatDraftAPI(ctx, news.WeChatDraftID); err != nil {
			return fmt.Errorf("failed to delete WeChat draft: %w", err)
		}

		// Clear WeChat status
		if err := s.newsRepo.UpdateWeChatStatus(ctx, newsID, "", "", ""); err != nil {
			s.logger.Warn("Failed to clear WeChat status", zap.Error(err))
		}
	}

	s.logger.Info("WeChat draft deleted successfully", zap.String("newsID", newsID.String()))

	return nil
}

// PublishToWeChat publishes the news to WeChat
func (s *WeChatNewsServiceImpl) PublishToWeChat(ctx context.Context, newsID uuid.UUID) error {
	if !s.config.EnableAutoPublish {
		return fmt.Errorf("auto-publish to WeChat is disabled")
	}

	s.logger.Info("Publishing to WeChat", zap.String("newsID", newsID.String()))

	// Get news
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return fmt.Errorf("failed to get news: %w", err)
	}

	// Ensure draft exists
	if news.WeChatDraftID == "" {
		if err := s.CreateWeChatDraft(ctx, newsID); err != nil {
			return fmt.Errorf("failed to create WeChat draft: %w", err)
		}
		// Refresh news to get draft ID
		news, err = s.newsRepo.GetByID(ctx, newsID)
		if err != nil {
			return fmt.Errorf("failed to refresh news: %w", err)
		}
	}

	// Publish draft
	publishedID, url, err := s.publishWeChatDraftAPI(ctx, news.WeChatDraftID)
	if err != nil {
		return fmt.Errorf("failed to publish WeChat draft: %w", err)
	}

	// Update news with published status
	if err := s.newsRepo.UpdateWeChatStatus(ctx, newsID, "published", publishedID, url); err != nil {
		s.logger.Warn("Failed to update WeChat published status", zap.Error(err))
	}

	s.logger.Info("Published to WeChat successfully",
		zap.String("newsID", newsID.String()),
		zap.String("publishedID", publishedID),
		zap.String("url", url))

	return nil
}

// GetWeChatStatus gets the WeChat status for a news
func (s *WeChatNewsServiceImpl) GetWeChatStatus(ctx context.Context, newsID uuid.UUID) (*WeChatNewsStatus, error) {
	news, err := s.newsRepo.GetByID(ctx, newsID)
	if err != nil {
		return nil, fmt.Errorf("failed to get news: %w", err)
	}

	return &WeChatNewsStatus{
		NewsID:      newsID,
		DraftID:     news.WeChatDraftID,
		PublishedID: news.WeChatPublishedID,
		Status:      news.WeChatStatus,
		URL:         news.WeChatURL,
		CreatedAt:   news.CreatedAt,
		UpdatedAt:   news.UpdatedAt,
	}, nil
}

// Helper methods

func (s *WeChatNewsServiceImpl) processArticlesForWeChat(ctx context.Context, newsArticles []*entities.NewsArticle) ([]WeChatArticle, error) {
	var wechatArticles []WeChatArticle

	for _, na := range newsArticles {
		// Get article content
		article, err := s.articleRepo.GetByID(ctx, na.ArticleID, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to get article %s: %w", na.ArticleID, err)
		}

		// Process content for WeChat
		content := article.Content
		if s.config.EnableContentOptimization {
			content = s.optimizeContentForWeChat(content)
		}

		// Process images if enabled
		if s.config.EnableImageUpload {
			var err error
			content, err = s.processImagesForWeChat(ctx, content)
			if err != nil {
				s.logger.Warn("Failed to process images for WeChat", zap.Error(err))
			}
		}

		// Get cover image URL
		var coverImageURL string
		if article.SiteImageId != nil {
			if image, err := s.imageRepo.GetByID(ctx, *article.SiteImageId); err == nil {
				coverImageURL = image.Url()
			}
		}

		wechatArticle := WeChatArticle{
			Title:              article.Title,
			Author:             article.Author,
			Digest:             s.generateDigest(article.Summary, article.Content),
			Content:            content,
			ContentSourceURL:   s.generateSourceURL(article.ID),
			ThumbMediaID:       "", // Will be set during image processing
			ShowCoverPic:       1,
			NeedOpenComment:    0,
			OnlyFansCanComment: 0,
		}

		// Process cover image
		if coverImageURL != "" {
			thumbMediaID, err := s.uploadImageToWeChat(ctx, coverImageURL)
			if err != nil {
				s.logger.Warn("Failed to upload cover image to WeChat", zap.Error(err))
			} else {
				wechatArticle.ThumbMediaID = thumbMediaID
			}
		}

		wechatArticles = append(wechatArticles, wechatArticle)
	}

	return wechatArticles, nil
}

func (s *WeChatNewsServiceImpl) optimizeContentForWeChat(content string) string {
	// Remove unsupported HTML tags
	content = s.removeUnsupportedTags(content)

	// Optimize images
	content = s.optimizeImages(content)

	// Add WeChat-specific formatting
	content = s.addWeChatFormatting(content)

	// Optimize text formatting for WeChat
	content = s.optimizeTextForWeChat(content)

	// Add WeChat-specific CSS classes
	content = s.addWeChatCSS(content)

	return content
}

func (s *WeChatNewsServiceImpl) removeUnsupportedTags(content string) string {
	// Remove script tags
	scriptRegex := regexp.MustCompile(`<script[^>]*>.*?</script>`)
	content = scriptRegex.ReplaceAllString(content, "")

	// Remove style tags
	styleRegex := regexp.MustCompile(`<style[^>]*>.*?</style>`)
	content = styleRegex.ReplaceAllString(content, "")

	// Remove form elements
	formRegex := regexp.MustCompile(`<(form|input|textarea|select|button)[^>]*>.*?</\1>`)
	content = formRegex.ReplaceAllString(content, "")

	return content
}

func (s *WeChatNewsServiceImpl) optimizeImages(content string) string {
	// Find all img tags and ensure they have proper attributes
	imgRegex := regexp.MustCompile(`<img[^>]*>`)
	content = imgRegex.ReplaceAllStringFunc(content, func(img string) string {
		// Add style for responsive images
		if !strings.Contains(img, "style=") {
			img = strings.Replace(img, "<img", `<img style="max-width: 100%; height: auto;"`, 1)
		}
		return img
	})

	return content
}

func (s *WeChatNewsServiceImpl) addWeChatFormatting(content string) string {
	// Add WeChat-specific CSS classes or formatting
	// Convert headings to WeChat-friendly format
	content = regexp.MustCompile(`<h([1-6])([^>]*)>`).ReplaceAllString(content, `<p style="font-size: 1.${1}em; font-weight: bold; margin: 1em 0;"$2>`)
	content = regexp.MustCompile(`</h[1-6]>`).ReplaceAllString(content, `</p>`)

	// Optimize paragraph spacing
	content = regexp.MustCompile(`<p([^>]*)>`).ReplaceAllString(content, `<p style="margin: 0.8em 0; line-height: 1.6;"$1>`)

	// Add emphasis styling
	content = regexp.MustCompile(`<strong([^>]*)>`).ReplaceAllString(content, `<span style="font-weight: bold; color: #2c3e50;"$1>`)
	content = regexp.MustCompile(`</strong>`).ReplaceAllString(content, `</span>`)

	return content
}

func (s *WeChatNewsServiceImpl) optimizeTextForWeChat(content string) string {
	// Optimize text length and readability for WeChat
	// Break long paragraphs
	content = s.breakLongParagraphs(content)

	// Add proper spacing around punctuation
	content = s.optimizePunctuation(content)

	// Convert special characters
	content = s.convertSpecialCharacters(content)

	return content
}

func (s *WeChatNewsServiceImpl) addWeChatCSS(content string) string {
	// Add WeChat-specific CSS styling
	wechatCSS := `
<style>
.wechat-content {
	font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
	font-size: 16px;
	line-height: 1.6;
	color: #333;
	word-wrap: break-word;
}
.wechat-content img {
	max-width: 100%;
	height: auto;
	display: block;
	margin: 1em auto;
}
.wechat-content blockquote {
	border-left: 4px solid #ddd;
	padding-left: 1em;
	margin: 1em 0;
	color: #666;
	font-style: italic;
}
</style>
`

	// Wrap content in WeChat container
	content = fmt.Sprintf(`%s<div class="wechat-content">%s</div>`, wechatCSS, content)

	return content
}

func (s *WeChatNewsServiceImpl) breakLongParagraphs(content string) string {
	// Find paragraphs longer than 200 characters and break them
	paragraphRegex := regexp.MustCompile(`<p[^>]*>([^<]{200,}?)</p>`)

	content = paragraphRegex.ReplaceAllStringFunc(content, func(match string) string {
		// Extract paragraph content
		innerRegex := regexp.MustCompile(`<p([^>]*)>(.*?)</p>`)
		matches := innerRegex.FindStringSubmatch(match)
		if len(matches) < 3 {
			return match
		}

		attrs := matches[1]
		text := matches[2]

		// Break at sentence boundaries
		sentences := regexp.MustCompile(`([.!?。！？])\s+`).Split(text, -1)
		if len(sentences) <= 1 {
			return match
		}

		// Group sentences into smaller paragraphs
		var result strings.Builder
		currentParagraph := ""

		for i, sentence := range sentences {
			if i > 0 {
				sentence = strings.TrimSpace(sentence)
			}

			if len(currentParagraph)+len(sentence) > 150 && currentParagraph != "" {
				result.WriteString(fmt.Sprintf(`<p%s>%s</p>`, attrs, currentParagraph))
				currentParagraph = sentence
			} else {
				if currentParagraph != "" {
					currentParagraph += ". " + sentence
				} else {
					currentParagraph = sentence
				}
			}
		}

		if currentParagraph != "" {
			result.WriteString(fmt.Sprintf(`<p%s>%s</p>`, attrs, currentParagraph))
		}

		return result.String()
	})

	return content
}

func (s *WeChatNewsServiceImpl) optimizePunctuation(content string) string {
	// Add proper spacing around Chinese punctuation
	content = regexp.MustCompile(`([，。！？；：])`).ReplaceAllString(content, `$1 `)

	// Remove extra spaces
	content = regexp.MustCompile(`\s+`).ReplaceAllString(content, ` `)

	return content
}

func (s *WeChatNewsServiceImpl) convertSpecialCharacters(content string) string {
	// Convert HTML entities to proper characters
	replacements := map[string]string{
		"&nbsp;":   " ",
		"&amp;":    "&",
		"&lt;":     "<",
		"&gt;":     ">",
		"&quot;":   "\"",
		"&#39;":    "'",
		"&hellip;": "...",
	}

	for entity, char := range replacements {
		content = strings.ReplaceAll(content, entity, char)
	}

	return content
}

func (s *WeChatNewsServiceImpl) processImagesForWeChat(ctx context.Context, content string) (string, error) {
	// Extract image URLs from content
	imgRegex := regexp.MustCompile(`<img[^>]+src="([^"]+)"[^>]*>`)
	matches := imgRegex.FindAllStringSubmatch(content, -1)

	for _, match := range matches {
		if len(match) >= 2 {
			originalURL := match[1]

			// Upload image to WeChat and get new URL
			newURL, err := s.uploadImageToWeChatAndGetURL(ctx, originalURL)
			if err != nil {
				s.logger.Warn("Failed to upload image to WeChat",
					zap.String("url", originalURL),
					zap.Error(err))
				continue
			}

			// Replace URL in content
			content = strings.Replace(content, originalURL, newURL, 1)
		}
	}

	return content, nil
}

func (s *WeChatNewsServiceImpl) generateDigest(summary, content string) string {
	if summary != "" {
		return summary
	}

	// Generate digest from content (first 100 characters)
	plainText := s.stripHTML(content)
	if len(plainText) > 100 {
		return plainText[:100] + "..."
	}
	return plainText
}

func (s *WeChatNewsServiceImpl) stripHTML(content string) string {
	htmlRegex := regexp.MustCompile(`<[^>]*>`)
	return htmlRegex.ReplaceAllString(content, "")
}

func (s *WeChatNewsServiceImpl) generateSourceURL(articleID uuid.UUID) string {
	// Generate source URL for the article
	return fmt.Sprintf("/articles/%s", articleID.String())
}

// WeChat API integration methods (REAL WeChat API integration)

func (s *WeChatNewsServiceImpl) createWeChatDraftAPI(ctx context.Context, news *entities.News, articles []WeChatArticle) (string, error) {
	// Convert to WeChat API format
	wechatArticles := make([]wechat.DraftArticle, len(articles))
	for i, article := range articles {
		wechatArticles[i] = wechat.DraftArticle{
			Title:              article.Title,
			Author:             article.Author,
			Digest:             article.Digest,
			Content:            article.Content,
			ContentSourceURL:   article.ContentSourceURL,
			ThumbMediaID:       article.ThumbMediaID,
			ShowCoverPic:       1, // Show cover image
			NeedOpenComment:    1, // Allow comments
			OnlyFansCanComment: 0, // Allow all to comment
		}
	}

	// Create draft using real WeChat API
	if s.wechatClient != nil {
		return s.wechatClient.CreateDraft(ctx, wechatArticles)
	}

	// Fallback to mock for development/testing
	draftID := fmt.Sprintf("draft_%s_%d", news.ID.String()[:8], time.Now().Unix())
	s.logger.Info("Created WeChat draft (mock)",
		zap.String("draftID", draftID),
		zap.Int("articleCount", len(articles)))

	return draftID, nil
}

func (s *WeChatNewsServiceImpl) deleteWeChatDraftAPI(ctx context.Context, draftID string) error {
	// Delete draft using real WeChat API
	if s.wechatClient != nil {
		return s.wechatClient.DeleteDraft(ctx, draftID)
	}

	// Fallback to mock for development/testing
	s.logger.Info("Deleted WeChat draft (mock)", zap.String("draftID", draftID))
	return nil
}

func (s *WeChatNewsServiceImpl) publishWeChatDraftAPI(ctx context.Context, draftID string) (string, string, error) {
	// Publish draft using real WeChat API
	if s.wechatClient != nil {
		return s.wechatClient.PublishDraft(ctx, draftID)
	}

	// Fallback to mock for development/testing
	publishedID := fmt.Sprintf("pub_%s_%d", draftID, time.Now().Unix())
	url := fmt.Sprintf("https://mp.weixin.qq.com/s/%s", publishedID)

	s.logger.Info("Published WeChat draft (mock)",
		zap.String("draftID", draftID),
		zap.String("publishedID", publishedID),
		zap.String("url", url))

	return publishedID, url, nil
}

func (s *WeChatNewsServiceImpl) uploadImageToWeChat(ctx context.Context, imageURL string) (string, error) {
	if s.wechatClient == nil {
		// Fallback for testing/development
		mediaID := fmt.Sprintf("media_%d", time.Now().Unix())
		s.logger.Info("Mock: Uploaded image to WeChat",
			zap.String("imageURL", imageURL),
			zap.String("mediaID", mediaID))
		return mediaID, nil
	}

	// Download image from URL
	imageData, err := s.downloadImage(ctx, imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}

	// Upload to WeChat as temporary media
	mediaInfo, err := s.wechatService.UploadMediaFromBytes(ctx, "image", s.extractFilename(imageURL), imageData)
	if err != nil {
		return "", fmt.Errorf("failed to upload image to WeChat: %w", err)
	}

	s.logger.Info("Uploaded image to WeChat",
		zap.String("imageURL", imageURL),
		zap.String("mediaID", mediaInfo.MediaID))

	return mediaInfo.MediaID, nil
}

func (s *WeChatNewsServiceImpl) uploadImageToWeChatAndGetURL(ctx context.Context, imageURL string) (string, error) {
	if s.wechatClient == nil {
		// Fallback for testing/development
		newURL := fmt.Sprintf("https://mmbiz.qpic.cn/mmbiz_jpg/%d", time.Now().Unix())
		s.logger.Info("Mock: Uploaded image to WeChat and got URL",
			zap.String("originalURL", imageURL),
			zap.String("newURL", newURL))
		return newURL, nil
	}

	// Download image from URL
	imageData, err := s.downloadImage(ctx, imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}

	// Save image temporarily for upload
	tempFilename := fmt.Sprintf("/tmp/wechat_image_%d_%s", time.Now().Unix(), s.extractFilename(imageURL))
	if err := os.WriteFile(tempFilename, imageData, 0644); err != nil {
		return "", fmt.Errorf("failed to save temporary image: %w", err)
	}
	defer os.Remove(tempFilename) // Clean up

	// Upload to WeChat as permanent media
	permanentMedia, err := s.wechatService.UploadPermanentMedia(ctx, "image", tempFilename)
	if err != nil {
		return "", fmt.Errorf("failed to upload permanent image to WeChat: %w", err)
	}

	// Get permanent URL
	permanentURL, err := s.wechatService.GetMediaURL(ctx, permanentMedia.MediaID)
	if err != nil {
		return "", fmt.Errorf("failed to get permanent URL: %w", err)
	}

	s.logger.Info("Uploaded image to WeChat and got permanent URL",
		zap.String("originalURL", imageURL),
		zap.String("permanentURL", permanentURL))

	return permanentURL, nil
}

// Helper methods for image processing

func (s *WeChatNewsServiceImpl) downloadImage(ctx context.Context, imageURL string) ([]byte, error) {
	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create request
	req, err := http.NewRequestWithContext(ctx, "GET", imageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set user agent
	req.Header.Set("User-Agent", "NextEvent-WeChat-Bot/1.0")

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	// Check content length (limit to 10MB)
	if resp.ContentLength > 10*1024*1024 {
		return nil, fmt.Errorf("image too large: %d bytes", resp.ContentLength)
	}

	// Read response body
	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	return imageData, nil
}

func (s *WeChatNewsServiceImpl) extractFilename(imageURL string) string {
	// Parse URL
	u, err := url.Parse(imageURL)
	if err != nil {
		return fmt.Sprintf("image_%d.jpg", time.Now().Unix())
	}

	// Extract filename from path
	filename := filepath.Base(u.Path)
	if filename == "." || filename == "/" {
		return fmt.Sprintf("image_%d.jpg", time.Now().Unix())
	}

	// Ensure it has an extension
	if !strings.Contains(filename, ".") {
		filename += ".jpg"
	}

	return filename
}

// WeChatArticle represents an article formatted for WeChat
type WeChatArticle struct {
	Title              string `json:"title"`
	Author             string `json:"author"`
	Digest             string `json:"digest"`
	Content            string `json:"content"`
	ContentSourceURL   string `json:"content_source_url"`
	ThumbMediaID       string `json:"thumb_media_id"`
	ShowCoverPic       int    `json:"show_cover_pic"`
	NeedOpenComment    int    `json:"need_open_comment"`
	OnlyFansCanComment int    `json:"only_fans_can_comment"`
}
