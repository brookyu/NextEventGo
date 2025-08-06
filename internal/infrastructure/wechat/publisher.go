package wechat

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// NewsPublisher handles scheduled WeChat news publishing
type NewsPublisher struct {
	db              *gorm.DB
	wechatService   *Service
	preprocessor    *ContentPreprocessor
	logger          *zap.Logger
	hostURL         string
	wechatServerURL string
}

// NewNewsPublisher creates a new news publisher
func NewNewsPublisher(db *gorm.DB, wechatService *Service, preprocessor *ContentPreprocessor, hostURL, wechatServerURL string, logger *zap.Logger) *NewsPublisher {
	return &NewsPublisher{
		db:              db,
		wechatService:   wechatService,
		preprocessor:    preprocessor,
		logger:          logger,
		hostURL:         hostURL,
		wechatServerURL: wechatServerURL,
	}
}

// SiteNews represents the SiteNews table structure
type SiteNews struct {
	ID                   string     `gorm:"column:Id;primaryKey"`
	Title                string     `gorm:"column:Title"`
	MediaId              *string    `gorm:"column:MediaId"`
	FrontCoverImageId    *string    `gorm:"column:FrontCoverImageId"`
	FrontCoverImageUrl   *string    `gorm:"column:FrontCoverImageUrl"`
	ScheduledAt          *time.Time `gorm:"column:ScheduledAt"`
	ExpiresAt            *time.Time `gorm:"column:ExpiresAt"`
	CreationTime         time.Time  `gorm:"column:CreationTime"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	IsDeleted            bool       `gorm:"column:IsDeleted"`
}

// TableName returns the table name for SiteNews
func (SiteNews) TableName() string {
	return "SiteNews"
}

// SiteNewsArticle represents the SiteNewsArticles table structure
type SiteNewsArticle struct {
	ID                   string     `gorm:"column:Id;primaryKey"`
	SiteArticleId        string     `gorm:"column:SiteArticleId"`
	IsShowInText         bool       `gorm:"column:IsShowInText"`
	SiteImageId          string     `gorm:"column:SiteImageId"`
	SiteNewsId           string     `gorm:"column:SiteNewsId"`
	Title                *string    `gorm:"column:Title"`
	MediaId              *string    `gorm:"column:MediaId"`
	CreationTime         time.Time  `gorm:"column:CreationTime"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	IsDeleted            bool       `gorm:"column:IsDeleted"`
}

// TableName returns the table name for SiteNewsArticle
func (SiteNewsArticle) TableName() string {
	return "SiteNewsArticles"
}

// SiteArticle represents the SiteArticles table structure
type SiteArticle struct {
	ID             string    `gorm:"column:Id;primaryKey"`
	Title          string    `gorm:"column:Title"`
	Summary        *string   `gorm:"column:Summary"`
	Content        string    `gorm:"column:Content"`
	Author         *string   `gorm:"column:Author"`
	SiteImageId    *string   `gorm:"column:SiteImageId"`
	JumpResourceId *string   `gorm:"column:JumpResourceId"`
	CreationTime   time.Time `gorm:"column:CreationTime"`
	IsDeleted      bool      `gorm:"column:IsDeleted"`
}

// TableName returns the table name for SiteArticle
func (SiteArticle) TableName() string {
	return "SiteArticles"
}

// PublishScheduledNews checks for and publishes scheduled news
func (p *NewsPublisher) PublishScheduledNews(ctx context.Context) error {
	p.logger.Info("Starting scheduled news publishing check")

	// Find news that should be published now
	var scheduledNews []SiteNews
	now := time.Now()

	err := p.db.Where("ScheduledAt <= ? AND ScheduledAt IS NOT NULL AND MediaId IS NULL AND IsDeleted = ?", now, false).
		Find(&scheduledNews).Error
	if err != nil {
		return fmt.Errorf("failed to query scheduled news: %w", err)
	}

	if len(scheduledNews) == 0 {
		p.logger.Debug("No scheduled news found for publishing")
		return nil
	}

	p.logger.Info("Found scheduled news for publishing", zap.Int("count", len(scheduledNews)))

	// Process each news item
	for _, news := range scheduledNews {
		err := p.publishNewsToWeChat(ctx, &news)
		if err != nil {
			p.logger.Error("Failed to publish news to WeChat",
				zap.String("newsId", news.ID),
				zap.String("title", news.Title),
				zap.Error(err))
			continue
		}

		p.logger.Info("Successfully published news to WeChat",
			zap.String("newsId", news.ID),
			zap.String("title", news.Title))
	}

	return nil
}

// publishNewsToWeChat publishes a single news item to WeChat
func (p *NewsPublisher) publishNewsToWeChat(ctx context.Context, news *SiteNews) error {
	p.logger.Info("Publishing news to WeChat",
		zap.String("newsId", news.ID),
		zap.String("title", news.Title))

	// Get articles associated with this news
	var newsArticles []SiteNewsArticle
	err := p.db.Where("SiteNewsId = ? AND IsDeleted = ?", news.ID, false).
		Order("CreationTime ASC").
		Find(&newsArticles).Error
	if err != nil {
		return fmt.Errorf("failed to get news articles: %w", err)
	}

	if len(newsArticles) == 0 {
		return fmt.Errorf("no articles found for news %s", news.ID)
	}

	// Process each article for WeChat
	var wechatArticles []DraftArticle
	for i, newsArticle := range newsArticles {
		// Get the actual article content
		var article SiteArticle
		err := p.db.Where("Id = ? AND IsDeleted = ?", newsArticle.SiteArticleId, false).
			First(&article).Error
		if err != nil {
			p.logger.Warn("Failed to get article content",
				zap.String("articleId", newsArticle.SiteArticleId),
				zap.Error(err))
			continue
		}

		// Determine front cover image ID
		frontCoverImageID := ""
		if i == 0 && news.FrontCoverImageId != nil {
			// Use news front cover for first article
			frontCoverImageID = *news.FrontCoverImageId
		} else {
			// Use article's own image
			if article.SiteImageId != nil {
				frontCoverImageID = *article.SiteImageId
			}
		}

		// Build content source URL
		contentSourceURL := ""
		if article.JumpResourceId != nil && *article.JumpResourceId != "" {
			contentSourceURL = fmt.Sprintf("%s/article/viewarticle/%s", p.wechatServerURL, *article.JumpResourceId)
		}

		// Process article content
		processedArticle, err := p.preprocessor.ProcessArticleContent(
			ctx,
			article.Title,
			getStringValue(article.Summary),
			article.Content,
			getStringValue(article.Author),
			frontCoverImageID,
			contentSourceURL,
			newsArticle.IsShowInText,
		)
		if err != nil {
			p.logger.Warn("Failed to process article content",
				zap.String("articleId", article.ID),
				zap.Error(err))
			continue
		}

		// Create WeChat draft article
		wechatArticle := DraftArticle{
			Title:              processedArticle.Title,
			Author:             processedArticle.Author,
			Digest:             processedArticle.Summary,
			Content:            processedArticle.Content,
			ContentSourceURL:   processedArticle.ContentSourceURL,
			ThumbMediaID:       processedArticle.ThumbMediaID,
			ShowCoverPic:       processedArticle.ShowCoverPic,
			NeedOpenComment:    0,
			OnlyFansCanComment: 0,
		}

		wechatArticles = append(wechatArticles, wechatArticle)
	}

	if len(wechatArticles) == 0 {
		return fmt.Errorf("no processable articles found for news %s", news.ID)
	}

	// Delete existing draft if exists
	if news.MediaId != nil && *news.MediaId != "" {
		err := p.wechatService.DeleteDraft(ctx, *news.MediaId)
		if err != nil {
			p.logger.Warn("Failed to delete existing draft",
				zap.String("mediaId", *news.MediaId),
				zap.Error(err))
		}
	}

	// Create WeChat draft
	mediaID, err := p.wechatService.CreateDraft(ctx, wechatArticles)
	if err != nil {
		return fmt.Errorf("failed to create WeChat draft: %w", err)
	}

	// Update news with MediaId
	err = p.db.Model(news).Update("MediaId", mediaID).Error
	if err != nil {
		p.logger.Error("Failed to update news MediaId",
			zap.String("newsId", news.ID),
			zap.String("mediaId", mediaID),
			zap.Error(err))
		// Don't return error here as the draft was created successfully
	}

	// Update news articles with processed information
	for i, newsArticle := range newsArticles {
		if i < len(wechatArticles) {
			updates := map[string]interface{}{
				"MediaId":              mediaID,
				"LastModificationTime": time.Now(),
			}

			err := p.db.Model(&newsArticle).Updates(updates).Error
			if err != nil {
				p.logger.Warn("Failed to update news article MediaId",
					zap.String("articleId", newsArticle.ID),
					zap.Error(err))
			}
		}
	}

	p.logger.Info("Successfully created WeChat draft",
		zap.String("newsId", news.ID),
		zap.String("mediaId", mediaID),
		zap.Int("articleCount", len(wechatArticles)))

	return nil
}

// getStringValue safely gets string value from pointer
func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// CheckExpiredNews checks for and handles expired news
func (p *NewsPublisher) CheckExpiredNews(ctx context.Context) error {
	p.logger.Info("Checking for expired news")

	var expiredNews []SiteNews
	now := time.Now()

	err := p.db.Where("ExpiresAt <= ? AND ExpiresAt IS NOT NULL AND MediaId IS NOT NULL AND IsDeleted = ?", now, false).
		Find(&expiredNews).Error
	if err != nil {
		return fmt.Errorf("failed to query expired news: %w", err)
	}

	if len(expiredNews) == 0 {
		p.logger.Debug("No expired news found")
		return nil
	}

	p.logger.Info("Found expired news", zap.Int("count", len(expiredNews)))

	// For now, just log expired news. In the future, we might want to:
	// - Delete WeChat drafts
	// - Mark news as expired
	// - Send notifications
	for _, news := range expiredNews {
		p.logger.Info("News has expired",
			zap.String("newsId", news.ID),
			zap.String("title", news.Title),
			zap.Time("expiresAt", *news.ExpiresAt))
	}

	return nil
}
