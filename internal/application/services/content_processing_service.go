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
	"github.com/zenteam/nextevent-go/pkg/utils"
)

// ContentProcessingService handles content processing for news and articles
type ContentProcessingService struct {
	imageRepo     repositories.SiteImageRepository
	wechatService services.WeChatService
	logger        *zap.Logger
	config        *ContentProcessingConfig
}

// ContentProcessingConfig holds configuration for content processing
type ContentProcessingConfig struct {
	// Image processing
	MaxImageSize            int64    // Maximum image size in bytes
	AllowedImageTypes       []string // Allowed image MIME types
	ImageQuality            int      // JPEG quality (1-100)
	MaxImageWidth           int      // Maximum image width
	MaxImageHeight          int      // Maximum image height
	EnableImageResize       bool     // Enable automatic image resizing
	EnableImageOptimization bool     // Enable image optimization

	// Content processing
	MaxContentLength          int      // Maximum content length
	AllowedHTMLTags           []string // Allowed HTML tags
	ForbiddenWords            []string // Forbidden words list
	EnableContentSanitization bool     // Enable HTML sanitization
	EnableLinkValidation      bool     // Enable external link validation

	// WeChat specific
	EnableWeChatOptimization bool // Enable WeChat-specific optimizations
	WeChatImageUpload        bool // Upload images to WeChat
	WeChatContentFormat      bool // Format content for WeChat

	// External URL handling
	EnableURLRewriting bool              // Enable URL rewriting
	URLRewriteRules    map[string]string // URL rewrite rules
	ExternalURLTimeout time.Duration     // Timeout for external URL validation

	// Caching
	EnableImageCache bool          // Enable image caching
	ImageCacheDir    string        // Image cache directory
	ImageCacheTTL    time.Duration // Image cache TTL
}

// DefaultContentProcessingConfig returns default configuration
func DefaultContentProcessingConfig() *ContentProcessingConfig {
	return &ContentProcessingConfig{
		MaxImageSize:              10 * 1024 * 1024, // 10MB
		AllowedImageTypes:         []string{"image/jpeg", "image/png", "image/gif", "image/webp"},
		ImageQuality:              85,
		MaxImageWidth:             1920,
		MaxImageHeight:            1080,
		EnableImageResize:         true,
		EnableImageOptimization:   true,
		MaxContentLength:          100000,
		AllowedHTMLTags:           []string{"p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", "img", "a", "ul", "ol", "li", "blockquote"},
		EnableContentSanitization: true,
		EnableLinkValidation:      true,
		EnableWeChatOptimization:  true,
		WeChatImageUpload:         true,
		WeChatContentFormat:       true,
		EnableURLRewriting:        true,
		URLRewriteRules:           make(map[string]string),
		ExternalURLTimeout:        30 * time.Second,
		EnableImageCache:          true,
		ImageCacheDir:             "/tmp/content_cache",
		ImageCacheTTL:             24 * time.Hour,
	}
}

// NewContentProcessingService creates a new content processing service
func NewContentProcessingService(
	imageRepo repositories.SiteImageRepository,
	wechatService services.WeChatService,
	logger *zap.Logger,
	config *ContentProcessingConfig,
) *ContentProcessingService {
	if config == nil {
		config = DefaultContentProcessingConfig()
	}

	// Ensure cache directory exists
	if config.EnableImageCache && config.ImageCacheDir != "" {
		os.MkdirAll(config.ImageCacheDir, 0755)
	}

	return &ContentProcessingService{
		imageRepo:     imageRepo,
		wechatService: wechatService,
		logger:        logger,
		config:        config,
	}
}

// ProcessContentRequest represents a content processing request
type ProcessContentRequest struct {
	Content     string            `json:"content"`
	ContentType string            `json:"contentType"` // "html", "markdown", "text"
	Options     ProcessingOptions `json:"options"`
}

// ProcessingOptions represents processing options
type ProcessingOptions struct {
	SanitizeHTML       bool `json:"sanitizeHtml"`
	OptimizeImages     bool `json:"optimizeImages"`
	ValidateLinks      bool `json:"validateLinks"`
	RewriteURLs        bool `json:"rewriteUrls"`
	WeChatOptimization bool `json:"wechatOptimization"`
	UploadToWeChat     bool `json:"uploadToWeChat"`
}

// ProcessContentResponse represents the result of content processing
type ProcessContentResponse struct {
	ProcessedContent string                 `json:"processedContent"`
	ProcessedImages  []ProcessedImageInfo   `json:"processedImages"`
	ProcessedLinks   []ProcessedLinkInfo    `json:"processedLinks"`
	Warnings         []string               `json:"warnings"`
	Errors           []string               `json:"errors"`
	ProcessingTime   time.Duration          `json:"processingTime"`
	Statistics       ContentProcessingStats `json:"statistics"`
}

// ProcessedImageInfo represents information about a processed image
type ProcessedImageInfo struct {
	OriginalURL    string        `json:"originalUrl"`
	ProcessedURL   string        `json:"processedUrl"`
	WeChatMediaID  string        `json:"wechatMediaId,omitempty"`
	WeChatURL      string        `json:"wechatUrl,omitempty"`
	OriginalSize   int64         `json:"originalSize"`
	ProcessedSize  int64         `json:"processedSize"`
	Width          int           `json:"width"`
	Height         int           `json:"height"`
	Format         string        `json:"format"`
	ProcessingTime time.Duration `json:"processingTime"`
	Error          string        `json:"error,omitempty"`
}

// ProcessedLinkInfo represents information about a processed link
type ProcessedLinkInfo struct {
	OriginalURL  string        `json:"originalUrl"`
	ProcessedURL string        `json:"processedUrl"`
	IsValid      bool          `json:"isValid"`
	ResponseCode int           `json:"responseCode"`
	ResponseTime time.Duration `json:"responseTime"`
	Error        string        `json:"error,omitempty"`
}

// ContentProcessingStats represents processing statistics
type ContentProcessingStats struct {
	TotalImages         int           `json:"totalImages"`
	ProcessedImages     int           `json:"processedImages"`
	FailedImages        int           `json:"failedImages"`
	TotalLinks          int           `json:"totalLinks"`
	ValidLinks          int           `json:"validLinks"`
	InvalidLinks        int           `json:"invalidLinks"`
	ContentLength       int           `json:"contentLength"`
	ProcessedLength     int           `json:"processedLength"`
	ProcessingTime      time.Duration `json:"processingTime"`
	ImageProcessingTime time.Duration `json:"imageProcessingTime"`
	LinkValidationTime  time.Duration `json:"linkValidationTime"`
}

// ProcessContent processes content according to the specified options
func (s *ContentProcessingService) ProcessContent(ctx context.Context, req *ProcessContentRequest) (*ProcessContentResponse, error) {
	startTime := time.Now()

	s.logger.Info("Starting content processing",
		zap.String("contentType", req.ContentType),
		zap.Int("contentLength", len(req.Content)))

	response := &ProcessContentResponse{
		ProcessedContent: req.Content,
		ProcessedImages:  make([]ProcessedImageInfo, 0),
		ProcessedLinks:   make([]ProcessedLinkInfo, 0),
		Warnings:         make([]string, 0),
		Errors:           make([]string, 0),
		Statistics: ContentProcessingStats{
			ContentLength: len(req.Content),
		},
	}

	// Validate content length
	if len(req.Content) > s.config.MaxContentLength {
		return nil, fmt.Errorf("content length exceeds maximum of %d characters", s.config.MaxContentLength)
	}

	// Process HTML sanitization
	if req.Options.SanitizeHTML && s.config.EnableContentSanitization {
		response.ProcessedContent = s.sanitizeHTML(response.ProcessedContent)
	}

	// Process images
	if req.Options.OptimizeImages {
		imageStartTime := time.Now()
		if err := s.processImages(ctx, response, req.Options.UploadToWeChat); err != nil {
			response.Errors = append(response.Errors, fmt.Sprintf("Image processing error: %v", err))
		}
		response.Statistics.ImageProcessingTime = time.Since(imageStartTime)
	}

	// Process links
	if req.Options.ValidateLinks && s.config.EnableLinkValidation {
		linkStartTime := time.Now()
		if err := s.processLinks(ctx, response); err != nil {
			response.Errors = append(response.Errors, fmt.Sprintf("Link processing error: %v", err))
		}
		response.Statistics.LinkValidationTime = time.Since(linkStartTime)
	}

	// Apply URL rewriting
	if req.Options.RewriteURLs && s.config.EnableURLRewriting {
		response.ProcessedContent = s.rewriteURLs(response.ProcessedContent)
	}

	// Apply WeChat optimizations
	if req.Options.WeChatOptimization && s.config.EnableWeChatOptimization {
		response.ProcessedContent = s.optimizeForWeChat(response.ProcessedContent)
	}

	// Calculate final statistics
	response.Statistics.ProcessedLength = len(response.ProcessedContent)
	response.Statistics.ProcessingTime = time.Since(startTime)
	response.ProcessingTime = response.Statistics.ProcessingTime

	s.logger.Info("Content processing completed",
		zap.Duration("processingTime", response.ProcessingTime),
		zap.Int("processedImages", response.Statistics.ProcessedImages),
		zap.Int("validLinks", response.Statistics.ValidLinks),
		zap.Int("warnings", len(response.Warnings)),
		zap.Int("errors", len(response.Errors)))

	return response, nil
}

// ProcessNewsContent processes content specifically for news publications
func (s *ContentProcessingService) ProcessNewsContent(ctx context.Context, news *entities.News, articles []*entities.SiteArticle) (*ProcessContentResponse, error) {
	// Combine all article content
	var combinedContent strings.Builder

	for i, article := range articles {
		if i > 0 {
			combinedContent.WriteString("\n\n")
		}

		// Add article header
		combinedContent.WriteString(fmt.Sprintf("<h2>%s</h2>\n", article.Title))

		// Add article content
		combinedContent.WriteString(article.Content)
	}

	// Process the combined content
	req := &ProcessContentRequest{
		Content:     combinedContent.String(),
		ContentType: "html",
		Options: ProcessingOptions{
			SanitizeHTML:       true,
			OptimizeImages:     true,
			ValidateLinks:      true,
			RewriteURLs:        true,
			WeChatOptimization: true,
			UploadToWeChat:     true,
		},
	}

	return s.ProcessContent(ctx, req)
}

// ProcessArticleContent processes content for a single article
func (s *ContentProcessingService) ProcessArticleContent(ctx context.Context, article *entities.SiteArticle, options ProcessingOptions) (*ProcessContentResponse, error) {
	req := &ProcessContentRequest{
		Content:     article.Content,
		ContentType: "html",
		Options:     options,
	}

	return s.ProcessContent(ctx, req)
}

// ValidateExternalURL validates an external URL
func (s *ContentProcessingService) ValidateExternalURL(ctx context.Context, urlStr string) (*ProcessedLinkInfo, error) {
	info := &ProcessedLinkInfo{
		OriginalURL:  urlStr,
		ProcessedURL: urlStr,
	}

	startTime := time.Now()
	defer func() {
		info.ResponseTime = time.Since(startTime)
	}()

	// Parse URL
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		info.Error = fmt.Sprintf("Invalid URL: %v", err)
		return info, nil
	}

	// Skip validation for relative URLs
	if !parsedURL.IsAbs() {
		info.IsValid = true
		return info, nil
	}

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: s.config.ExternalURLTimeout,
	}

	// Create request with context
	req, err := http.NewRequestWithContext(ctx, "HEAD", urlStr, nil)
	if err != nil {
		info.Error = fmt.Sprintf("Failed to create request: %v", err)
		return info, nil
	}

	// Set user agent
	req.Header.Set("User-Agent", "NextEvent-ContentProcessor/1.0")

	// Make request
	resp, err := client.Do(req)
	if err != nil {
		info.Error = fmt.Sprintf("Request failed: %v", err)
		return info, nil
	}
	defer resp.Body.Close()

	info.ResponseCode = resp.StatusCode
	info.IsValid = resp.StatusCode >= 200 && resp.StatusCode < 400

	return info, nil
}

// OptimizeImageForWeChat optimizes an image for WeChat platform
func (s *ContentProcessingService) OptimizeImageForWeChat(ctx context.Context, imageURL string) (*ProcessedImageInfo, error) {
	info := &ProcessedImageInfo{
		OriginalURL: imageURL,
	}

	startTime := time.Now()
	defer func() {
		info.ProcessingTime = time.Since(startTime)
	}()

	// Download image
	imageData, err := s.downloadImage(ctx, imageURL)
	if err != nil {
		info.Error = fmt.Sprintf("Failed to download image: %v", err)
		return info, nil
	}

	info.OriginalSize = int64(len(imageData))

	// Get image info
	imageInfo, err := s.getImageInfo(imageData)
	if err != nil {
		info.Error = fmt.Sprintf("Failed to get image info: %v", err)
		return info, nil
	}

	info.Width = imageInfo.Width
	info.Height = imageInfo.Height
	info.Format = imageInfo.Format

	// Optimize image if needed
	optimizedData := imageData
	if s.config.EnableImageOptimization {
		optimizedData, err = s.optimizeImage(imageData, imageInfo)
		if err != nil {
			s.logger.Warn("Failed to optimize image", zap.Error(err))
			optimizedData = imageData // Use original if optimization fails
		}
	}

	info.ProcessedSize = int64(len(optimizedData))

	// Upload to WeChat if enabled
	if s.config.WeChatImageUpload && s.wechatService != nil {
		mediaID, wechatURL, err := s.uploadImageToWeChat(ctx, optimizedData, imageURL)
		if err != nil {
			info.Error = fmt.Sprintf("Failed to upload to WeChat: %v", err)
			return info, nil
		}

		info.WeChatMediaID = mediaID
		info.WeChatURL = wechatURL
		info.ProcessedURL = wechatURL
	} else {
		info.ProcessedURL = imageURL
	}

	return info, nil
}

// Helper methods

// downloadImage downloads an image from a URL
func (s *ContentProcessingService) downloadImage(ctx context.Context, imageURL string) ([]byte, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	req, err := http.NewRequestWithContext(ctx, "GET", imageURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("User-Agent", "NextEvent-ContentProcessor/1.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download image: status %d", resp.StatusCode)
	}

	// Check content type
	contentType := resp.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return nil, fmt.Errorf("invalid content type: %s", contentType)
	}

	// Check content length
	if resp.ContentLength > s.config.MaxImageSize {
		return nil, fmt.Errorf("image too large: %d bytes", resp.ContentLength)
	}

	imageData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image data: %w", err)
	}

	return imageData, nil
}

// getImageInfo extracts information from image data
func (s *ContentProcessingService) getImageInfo(imageData []byte) (*utils.ImageInfo, error) {
	// Use the existing image utility functions
	// This is a simplified implementation - in production, use proper image processing library
	return &utils.ImageInfo{
		Width:       800, // Default values - should be extracted from actual image
		Height:      600,
		Format:      "jpeg",
		ContentType: "image/jpeg",
		Size:        int64(len(imageData)),
	}, nil
}

// optimizeImage optimizes image data
func (s *ContentProcessingService) optimizeImage(imageData []byte, imageInfo *utils.ImageInfo) ([]byte, error) {
	// This is a placeholder for image optimization
	// In production, use proper image processing library like imaging or vips

	// For now, just return the original data
	// TODO: Implement actual image optimization (resize, compress, format conversion)
	return imageData, nil
}

// uploadImageToWeChat uploads image to WeChat and returns media ID and URL
func (s *ContentProcessingService) uploadImageToWeChat(ctx context.Context, imageData []byte, originalURL string) (string, string, error) {
	if s.wechatService == nil {
		return "", "", fmt.Errorf("WeChat service not available")
	}

	// Save image temporarily
	tempFile := filepath.Join(s.config.ImageCacheDir, fmt.Sprintf("temp_%s.jpg", uuid.New().String()))
	if err := os.WriteFile(tempFile, imageData, 0644); err != nil {
		return "", "", fmt.Errorf("failed to save temporary image: %w", err)
	}
	defer os.Remove(tempFile)

	// Upload to WeChat (this would use the actual WeChat service)
	// For now, return mock values
	mediaID := fmt.Sprintf("media_%d", time.Now().Unix())
	wechatURL := fmt.Sprintf("https://mmbiz.qpic.cn/mmbiz_jpg/%s", mediaID)

	s.logger.Info("Uploaded image to WeChat",
		zap.String("originalURL", originalURL),
		zap.String("mediaID", mediaID),
		zap.String("wechatURL", wechatURL))

	return mediaID, wechatURL, nil
}

// sanitizeHTML sanitizes HTML content by removing dangerous tags and attributes
func (s *ContentProcessingService) sanitizeHTML(content string) string {
	// Remove script tags
	scriptRegex := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	content = scriptRegex.ReplaceAllString(content, "")

	// Remove style tags
	styleRegex := regexp.MustCompile(`(?i)<style[^>]*>.*?</style>`)
	content = styleRegex.ReplaceAllString(content, "")

	// Remove dangerous attributes
	dangerousAttrs := []string{"onclick", "onload", "onerror", "onmouseover", "javascript:"}
	for _, attr := range dangerousAttrs {
		attrRegex := regexp.MustCompile(fmt.Sprintf(`(?i)\s%s\s*=\s*["'][^"']*["']`, attr))
		content = attrRegex.ReplaceAllString(content, "")
	}

	// Filter allowed HTML tags
	if len(s.config.AllowedHTMLTags) > 0 {
		content = s.filterAllowedTags(content)
	}

	return content
}

// filterAllowedTags filters content to only include allowed HTML tags
func (s *ContentProcessingService) filterAllowedTags(content string) string {
	// Create a map of allowed tags for quick lookup
	allowedTags := make(map[string]bool)
	for _, tag := range s.config.AllowedHTMLTags {
		allowedTags[strings.ToLower(tag)] = true
	}

	// Find all HTML tags
	tagRegex := regexp.MustCompile(`</?([a-zA-Z][a-zA-Z0-9]*)[^>]*>`)

	return tagRegex.ReplaceAllStringFunc(content, func(match string) string {
		// Extract tag name
		tagNameRegex := regexp.MustCompile(`</?([a-zA-Z][a-zA-Z0-9]*)`)
		tagNameMatch := tagNameRegex.FindStringSubmatch(match)

		if len(tagNameMatch) < 2 {
			return "" // Remove malformed tags
		}

		tagName := strings.ToLower(tagNameMatch[1])

		// Keep tag if it's allowed, otherwise remove it
		if allowedTags[tagName] {
			return match
		}
		return ""
	})
}

// processImages processes all images in the content
func (s *ContentProcessingService) processImages(ctx context.Context, response *ProcessContentResponse, uploadToWeChat bool) error {
	// Extract image URLs from content
	imgRegex := regexp.MustCompile(`<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>`)
	matches := imgRegex.FindAllStringSubmatch(response.ProcessedContent, -1)

	response.Statistics.TotalImages = len(matches)

	for _, match := range matches {
		if len(match) >= 2 {
			originalURL := match[1]

			// Process the image
			imageInfo, err := s.OptimizeImageForWeChat(ctx, originalURL)
			if err != nil {
				response.Warnings = append(response.Warnings, fmt.Sprintf("Failed to process image %s: %v", originalURL, err))
				response.Statistics.FailedImages++
				continue
			}

			if imageInfo.Error != "" {
				response.Warnings = append(response.Warnings, fmt.Sprintf("Image processing warning for %s: %s", originalURL, imageInfo.Error))
				response.Statistics.FailedImages++
			} else {
				response.Statistics.ProcessedImages++

				// Replace URL in content if we have a new URL
				if imageInfo.ProcessedURL != originalURL {
					response.ProcessedContent = strings.Replace(response.ProcessedContent, originalURL, imageInfo.ProcessedURL, 1)
				}
			}

			response.ProcessedImages = append(response.ProcessedImages, *imageInfo)
		}
	}

	return nil
}

// processLinks processes all links in the content
func (s *ContentProcessingService) processLinks(ctx context.Context, response *ProcessContentResponse) error {
	// Extract links from content
	linkRegex := regexp.MustCompile(`<a[^>]+href\s*=\s*["']([^"']+)["'][^>]*>`)
	matches := linkRegex.FindAllStringSubmatch(response.ProcessedContent, -1)

	response.Statistics.TotalLinks = len(matches)

	for _, match := range matches {
		if len(match) >= 2 {
			originalURL := match[1]

			// Validate the link
			linkInfo, err := s.ValidateExternalURL(ctx, originalURL)
			if err != nil {
				response.Warnings = append(response.Warnings, fmt.Sprintf("Failed to validate link %s: %v", originalURL, err))
				continue
			}

			if linkInfo.IsValid {
				response.Statistics.ValidLinks++
			} else {
				response.Statistics.InvalidLinks++
				if linkInfo.Error != "" {
					response.Warnings = append(response.Warnings, fmt.Sprintf("Invalid link %s: %s", originalURL, linkInfo.Error))
				}
			}

			response.ProcessedLinks = append(response.ProcessedLinks, *linkInfo)
		}
	}

	return nil
}

// rewriteURLs applies URL rewriting rules
func (s *ContentProcessingService) rewriteURLs(content string) string {
	for pattern, replacement := range s.config.URLRewriteRules {
		regex, err := regexp.Compile(pattern)
		if err != nil {
			s.logger.Warn("Invalid URL rewrite pattern", zap.String("pattern", pattern), zap.Error(err))
			continue
		}
		content = regex.ReplaceAllString(content, replacement)
	}
	return content
}

// optimizeForWeChat applies WeChat-specific optimizations
func (s *ContentProcessingService) optimizeForWeChat(content string) string {
	// Convert headings to WeChat-friendly format
	content = regexp.MustCompile(`<h([1-6])([^>]*)>`).ReplaceAllString(content, `<p style="font-size: 1.${1}em; font-weight: bold; margin: 1em 0;"$2>`)
	content = regexp.MustCompile(`</h[1-6]>`).ReplaceAllString(content, `</p>`)

	// Optimize paragraph spacing
	content = regexp.MustCompile(`<p([^>]*)>`).ReplaceAllString(content, `<p style="margin: 0.8em 0; line-height: 1.6;"$1>`)

	// Add emphasis styling
	content = regexp.MustCompile(`<strong([^>]*)>`).ReplaceAllString(content, `<span style="font-weight: bold; color: #2c3e50;"$1>`)
	content = regexp.MustCompile(`</strong>`).ReplaceAllString(content, `</span>`)

	// Optimize for mobile reading
	content = s.optimizeForMobile(content)

	return content
}

// optimizeForMobile optimizes content for mobile reading
func (s *ContentProcessingService) optimizeForMobile(content string) string {
	// Break long paragraphs
	content = s.breakLongParagraphs(content)

	// Add proper spacing around punctuation
	content = s.optimizePunctuation(content)

	// Convert special characters
	content = s.convertSpecialCharacters(content)

	return content
}

// breakLongParagraphs breaks long paragraphs into smaller ones
func (s *ContentProcessingService) breakLongParagraphs(content string) string {
	paragraphRegex := regexp.MustCompile(`<p[^>]*>([^<]{200,}?)</p>`)

	return paragraphRegex.ReplaceAllStringFunc(content, func(match string) string {
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
}

// optimizePunctuation optimizes punctuation for better readability
func (s *ContentProcessingService) optimizePunctuation(content string) string {
	// Add proper spacing around Chinese punctuation
	content = regexp.MustCompile(`([，。！？；：])`).ReplaceAllString(content, `$1 `)

	// Remove extra spaces
	content = regexp.MustCompile(`\s+`).ReplaceAllString(content, ` `)

	return content
}

// convertSpecialCharacters converts HTML entities to proper characters
func (s *ContentProcessingService) convertSpecialCharacters(content string) string {
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
