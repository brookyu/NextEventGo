package wechat

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ContentPreprocessor handles article content preprocessing for WeChat
type ContentPreprocessor struct {
	wechatService *Service
	db            *gorm.DB
	logger        *zap.Logger
	hostURL       string
	tempDir       string
	httpClient    *http.Client
}

// NewContentPreprocessor creates a new content preprocessor
func NewContentPreprocessor(wechatService *Service, db *gorm.DB, hostURL, tempDir string, logger *zap.Logger) *ContentPreprocessor {
	return &ContentPreprocessor{
		wechatService: wechatService,
		db:            db,
		logger:        logger,
		hostURL:       hostURL,
		tempDir:       tempDir,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SiteImage represents the SiteImages table structure
type SiteImage struct {
	ID        string `gorm:"column:Id;primaryKey"`
	MediaID   string `gorm:"column:MediaId"`
	SiteURL   string `gorm:"column:SiteUrl"`
	Name      string `gorm:"column:Name"`
	URL       string `gorm:"column:Url"`
	IsDeleted bool   `gorm:"column:IsDeleted"`
}

// TableName returns the table name for SiteImage
func (SiteImage) TableName() string {
	return "SiteImages"
}

// ProcessedArticle represents an article with processed content
type ProcessedArticle struct {
	Title              string
	Summary            string
	Content            string
	Author             string
	ContentSourceURL   string
	ThumbMediaID       string
	ShowCoverPic       int
	ProcessedImageURLs map[string]string // Original URL -> WeChat URL mapping
}

// ProcessArticleContent processes article content for WeChat publishing
func (p *ContentPreprocessor) ProcessArticleContent(ctx context.Context, title, summary, content, author string, frontCoverImageID string, contentSourceURL string, showCoverPic bool) (*ProcessedArticle, error) {
	p.logger.Info("Processing article content for WeChat",
		zap.String("title", title),
		zap.String("frontCoverImageID", frontCoverImageID))

	// Create a copy of the content to avoid modifying the original
	processedContent := content

	// Process images in the content
	processedImageURLs, err := p.processImagesInContent(ctx, &processedContent)
	if err != nil {
		return nil, fmt.Errorf("failed to process images in content: %w", err)
	}

	// Get thumb media ID for front cover image
	thumbMediaID, err := p.getThumbMediaID(ctx, frontCoverImageID)
	if err != nil {
		p.logger.Warn("Failed to get thumb media ID", zap.String("imageID", frontCoverImageID), zap.Error(err))
		thumbMediaID = ""
	}

	// Clean content for WeChat
	processedContent = p.cleanContentForWeChat(processedContent)

	// Set show cover pic
	showCoverPicInt := 0
	if showCoverPic {
		showCoverPicInt = 1
	}

	return &ProcessedArticle{
		Title:              title,
		Summary:            summary,
		Content:            processedContent,
		Author:             author,
		ContentSourceURL:   contentSourceURL,
		ThumbMediaID:       thumbMediaID,
		ShowCoverPic:       showCoverPicInt,
		ProcessedImageURLs: processedImageURLs,
	}, nil
}

// processImagesInContent processes all images in the article content
func (p *ContentPreprocessor) processImagesInContent(ctx context.Context, content *string) (map[string]string, error) {
	// Regular expression to match img tags and extract src URLs
	imgRegex := regexp.MustCompile(`<img\b[^<>]*?\bsrc[\s\t\r\n]*=[\s\t\r\n]*[""']?[\s\t\r\n]*([^\s\t\r\n""'<>]*)[^<>]*?/?[\s\t\r\n]*>`)

	matches := imgRegex.FindAllStringSubmatch(*content, -1)
	processedURLs := make(map[string]string)

	for _, match := range matches {
		if len(match) < 2 {
			continue
		}

		originalURL := match[1]
		if originalURL == "" {
			continue
		}

		p.logger.Debug("Processing image URL", zap.String("url", originalURL))

		// Skip if already processed
		if _, exists := processedURLs[originalURL]; exists {
			continue
		}

		// Determine how to handle this image
		wechatURL, err := p.processImageURL(ctx, originalURL)
		if err != nil {
			p.logger.Warn("Failed to process image URL", zap.String("url", originalURL), zap.Error(err))
			continue
		}

		if wechatURL != "" && wechatURL != originalURL {
			// Replace the URL in content
			*content = strings.ReplaceAll(*content, originalURL, wechatURL)
			processedURLs[originalURL] = wechatURL
			p.logger.Info("Replaced image URL",
				zap.String("original", originalURL),
				zap.String("wechat", wechatURL))
		}
	}

	return processedURLs, nil
}

// processImageURL processes a single image URL
func (p *ContentPreprocessor) processImageURL(ctx context.Context, imageURL string) (string, error) {
	// Check if it's already a WeChat URL
	if strings.Contains(imageURL, "mmbiz.qpic.cn") || strings.Contains(imageURL, "wechat.colorcon.com.cn") {
		return imageURL, nil
	}

	// Check if it's a local image (starts with hostURL or /MediaFiles)
	if strings.HasPrefix(imageURL, p.hostURL) || strings.HasPrefix(imageURL, "/MediaFiles") || strings.HasPrefix(imageURL, "/Content") {
		return p.processLocalImage(ctx, imageURL)
	}

	// It's an external image - download and upload to WeChat
	return p.processExternalImage(ctx, imageURL)
}

// processLocalImage processes a local image
func (p *ContentPreprocessor) processLocalImage(ctx context.Context, imageURL string) (string, error) {
	// Convert to site URL format
	siteURL := imageURL
	if strings.HasPrefix(imageURL, p.hostURL) {
		siteURL = strings.TrimPrefix(imageURL, p.hostURL)
	}

	// Look up the image in database
	var siteImage SiteImage
	err := p.db.Where("SiteUrl = ? AND IsDeleted = ?", siteURL, false).First(&siteImage).Error
	if err != nil {
		return "", fmt.Errorf("image not found in database: %s", siteURL)
	}

	// Check if already uploaded to WeChat
	if siteImage.URL != "" {
		return siteImage.URL, nil
	}

	// Upload to WeChat
	return p.uploadImageToWeChat(ctx, &siteImage)
}

// processExternalImage downloads and uploads an external image
func (p *ContentPreprocessor) processExternalImage(ctx context.Context, imageURL string) (string, error) {
	// Download the image
	tempFilePath, err := p.downloadImage(ctx, imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to download external image: %w", err)
	}
	defer os.Remove(tempFilePath) // Clean up temp file

	// Upload to WeChat
	uploadResp, err := p.wechatService.UploadMaterial(ctx, tempFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to upload external image to WeChat: %w", err)
	}

	return uploadResp.URL, nil
}

// uploadImageToWeChat uploads a local image to WeChat and updates the database
func (p *ContentPreprocessor) uploadImageToWeChat(ctx context.Context, siteImage *SiteImage) (string, error) {
	// Construct full file path
	fullPath := filepath.Join(p.tempDir, "..", "wwwroot", siteImage.SiteURL)

	// Upload to WeChat
	uploadResp, err := p.wechatService.UploadMaterial(ctx, fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to upload image to WeChat: %w", err)
	}

	// Update database with MediaID and URL
	err = p.db.Model(siteImage).Updates(map[string]interface{}{
		"MediaId": uploadResp.MediaID,
		"Url":     uploadResp.URL,
	}).Error
	if err != nil {
		p.logger.Warn("Failed to update image MediaID in database", zap.Error(err))
	}

	return uploadResp.URL, nil
}

// downloadImage downloads an image from URL to temp file
func (p *ContentPreprocessor) downloadImage(ctx context.Context, imageURL string) (string, error) {
	// Create temp file
	fileName := filepath.Base(imageURL)
	if fileName == "" || fileName == "." {
		fileName = fmt.Sprintf("temp_image_%d", time.Now().Unix())
	}

	tempFilePath := filepath.Join(p.tempDir, fileName)

	// Create temp directory if it doesn't exist
	err := os.MkdirAll(p.tempDir, 0755)
	if err != nil {
		return "", fmt.Errorf("failed to create temp directory: %w", err)
	}

	// Download the image
	req, err := http.NewRequestWithContext(ctx, "GET", imageURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download image, status: %d", resp.StatusCode)
	}

	// Create the file
	file, err := os.Create(tempFilePath)
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer file.Close()

	// Copy content
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to save image: %w", err)
	}

	return tempFilePath, nil
}

// getThumbMediaID gets the MediaID for a front cover image
func (p *ContentPreprocessor) getThumbMediaID(ctx context.Context, imageID string) (string, error) {
	if imageID == "" {
		return "", nil
	}

	var siteImage SiteImage
	err := p.db.Where("Id = ? AND IsDeleted = ?", imageID, false).First(&siteImage).Error
	if err != nil {
		return "", fmt.Errorf("front cover image not found: %w", err)
	}

	// If already has MediaID, return it
	if siteImage.MediaID != "" {
		return siteImage.MediaID, nil
	}

	// Upload to WeChat to get MediaID
	_, err = p.uploadImageToWeChat(ctx, &siteImage)
	if err != nil {
		return "", err
	}

	return siteImage.MediaID, nil
}

// cleanContentForWeChat cleans content for WeChat compatibility
func (p *ContentPreprocessor) cleanContentForWeChat(content string) string {
	// Replace double quotes with single quotes
	content = strings.ReplaceAll(content, `"`, `'`)

	// Add any other WeChat-specific content cleaning here

	return content
}
