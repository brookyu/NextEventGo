package mappers

import (
	"context"
	"fmt"
	"math"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	dto "github.com/zenteam/nextevent-go/internal/interfaces/dto"
)

// NewsMapper handles mapping between entities and DTOs
type NewsMapper struct {
	imageRepo    repositories.SiteImageRepository
	userRepo     repositories.UserRepository
	articleRepo  repositories.SiteArticleRepository
	categoryRepo repositories.NewsCategoryRepository
	logger       *zap.Logger
}

// NewNewsMapper creates a new news mapper
func NewNewsMapper(
	imageRepo repositories.SiteImageRepository,
	userRepo repositories.UserRepository,
	articleRepo repositories.SiteArticleRepository,
	categoryRepo repositories.NewsCategoryRepository,
	logger *zap.Logger,
) *NewsMapper {
	return &NewsMapper{
		imageRepo:    imageRepo,
		userRepo:     userRepo,
		articleRepo:  articleRepo,
		categoryRepo: categoryRepo,
		logger:       logger,
	}
}

// ToNewsListItemDTO converts a news entity to a list item DTO
func (m *NewsMapper) ToNewsListItemDTO(ctx context.Context, news *entities.News) (*dto.NewsListItemDTO, error) {
	dto := &dto.NewsListItemDTO{
		ID:           news.ID,
		Title:        news.Title,
		Subtitle:     news.Subtitle,
		Summary:      news.Summary,
		Status:       string(news.Status),
		Type:         string(news.Type),
		Priority:     string(news.Priority),
		AuthorID:     news.AuthorID,
		PublishedAt:  news.PublishedAt,
		CreatedAt:    news.CreatedAt,
		UpdatedAt:    news.UpdatedAt,
		IsFeatured:   news.IsFeatured,
		IsBreaking:   news.IsBreaking,
		IsSticky:     news.IsSticky,
		ViewCount:    news.ViewCount,
		ShareCount:   news.ShareCount,
		LikeCount:    news.LikeCount,
		CommentCount: news.CommentCount,
		WeChatStatus: news.WeChatStatus,
		WeChatURL:    news.WeChatURL,
	}

	// Load featured image URL
	if news.FeaturedImageID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.FeaturedImageID); err == nil {
			dto.FeaturedImageID = news.FeaturedImageID
			dto.FeaturedImageURL = image.Url()
		}
	}

	// Load thumbnail URL
	if news.ThumbnailID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.ThumbnailID); err == nil {
			dto.ThumbnailID = news.ThumbnailID
			dto.ThumbnailURL = image.Url()
		}
	}

	// Load author name
	if news.AuthorID != nil {
		if user, err := m.userRepo.GetByID(ctx, *news.AuthorID); err == nil {
			dto.AuthorName = m.getUserDisplayName(user)
		}
	}

	return dto, nil
}

// ToNewsDetailDTO converts a news entity to a detailed DTO
func (m *NewsMapper) ToNewsDetailDTO(ctx context.Context, news *entities.News, includeRelated bool) (*dto.NewsDetailDTO, error) {
	dto := &dto.NewsDetailDTO{
		ID:                news.ID,
		Title:             news.Title,
		Subtitle:          news.Subtitle,
		Description:       news.Description,
		Content:           news.Content,
		Summary:           news.Summary,
		Status:            string(news.Status),
		Type:              string(news.Type),
		Priority:          string(news.Priority),
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
		AllowComments:     news.AllowComments,
		AllowSharing:      news.AllowSharing,
		IsFeatured:        news.IsFeatured,
		IsBreaking:        news.IsBreaking,
		IsSticky:          news.IsSticky,
		RequireAuth:       news.RequireAuth,
		Language:          news.Language,
		Region:            news.Region,
		ViewCount:         news.ViewCount,
		ShareCount:        news.ShareCount,
		LikeCount:         news.LikeCount,
		CommentCount:      news.CommentCount,
		ReadTime:          news.ReadTime,
		WeChatDraftID:     news.WeChatDraftID,
		WeChatPublishedID: news.WeChatPublishedID,
		WeChatURL:         news.WeChatURL,
		WeChatStatus:      news.WeChatStatus,
		WeChatSyncedAt:    news.WeChatSyncedAt,
		CreatedAt:         news.CreatedAt,
		UpdatedAt:         news.UpdatedAt,
		CreatedBy:         news.CreatedBy,
		UpdatedBy:         news.UpdatedBy,
	}

	// Load media URLs
	if news.FeaturedImageID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.FeaturedImageID); err == nil {
			dto.FeaturedImageID = news.FeaturedImageID
			dto.FeaturedImageURL = image.Url()
		}
	}

	if news.ThumbnailID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.ThumbnailID); err == nil {
			dto.ThumbnailID = news.ThumbnailID
			dto.ThumbnailURL = image.Url()
		}
	}

	// Load gallery images
	if news.GalleryImageIDs != "" {
		dto.GalleryImages = m.loadGalleryImages(ctx, news.GalleryImageIDs)
	}

	// Load related data if requested
	if includeRelated {
		// Load author
		if news.AuthorID != nil {
			if user, err := m.userRepo.GetByID(ctx, *news.AuthorID); err == nil {
				dto.Author = m.toUserDTO(user)
			}
		}

		// Load editor
		if news.EditorID != nil {
			if user, err := m.userRepo.GetByID(ctx, *news.EditorID); err == nil {
				dto.Editor = m.toUserDTO(user)
			}
		}
	}

	return dto, nil
}

// ToNewsForEditingDTO converts a news entity to an editing DTO
func (m *NewsMapper) ToNewsForEditingDTO(ctx context.Context, news *entities.News, newsArticles []*entities.NewsArticle) (*dto.NewsForEditingDTO, error) {
	dto := &dto.NewsForEditingDTO{
		ID:              news.ID,
		Title:           news.Title,
		Subtitle:        news.Subtitle,
		Description:     news.Description,
		Content:         news.Content,
		Summary:         news.Summary,
		Status:          string(news.Status),
		Type:            string(news.Type),
		Priority:        string(news.Priority),
		Slug:            news.Slug,
		MetaTitle:       news.MetaTitle,
		MetaDescription: news.MetaDescription,
		Keywords:        news.Keywords,
		Tags:            news.Tags,
		AllowComments:   news.AllowComments,
		AllowSharing:    news.AllowSharing,
		IsFeatured:      news.IsFeatured,
		IsBreaking:      news.IsBreaking,
		IsSticky:        news.IsSticky,
		RequireAuth:     news.RequireAuth,
		ScheduledAt:     news.ScheduledAt,
		ExpiresAt:       news.ExpiresAt,
		Language:        news.Language,
		Region:          news.Region,
		WeChatStatus:    news.WeChatStatus,
		WeChatURL:       news.WeChatURL,
		CreatedAt:       news.CreatedAt,
		UpdatedAt:       news.UpdatedAt,
	}

	// Load media URLs
	if news.FeaturedImageID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.FeaturedImageID); err == nil {
			dto.FeaturedImageID = news.FeaturedImageID
			dto.FeaturedImageURL = image.Url()
		}
	}

	if news.ThumbnailID != nil {
		if image, err := m.imageRepo.GetByID(ctx, *news.ThumbnailID); err == nil {
			dto.ThumbnailID = news.ThumbnailID
			dto.ThumbnailURL = image.Url()
		}
	}

	// Convert news articles to editing DTOs
	// TODO: Fix NewsArticleForEditingDTO type issue
	// dto.Articles = make([]dto.NewsArticleForEditingDTO, len(newsArticles))
	// for i, na := range newsArticles {
	// 	articleDTO, err := m.toNewsArticleForEditingDTO(ctx, na)
	// 	if err != nil {
	// 		m.logger.Warn("Failed to convert news article for editing", zap.Error(err))
	// 		continue
	// 	}
	// 	dto.Articles[i] = *articleDTO
	// }

	return dto, nil
}

// ToNewsListResponseDTO converts a list of news entities to a paginated response DTO
func (m *NewsMapper) ToNewsListResponseDTO(ctx context.Context, newsList []*entities.News, total int64, page, pageSize int) (*dto.NewsListResponseDTO, error) {
	items := make([]dto.NewsListItemDTO, len(newsList))
	for i, news := range newsList {
		item, err := m.ToNewsListItemDTO(ctx, news)
		if err != nil {
			m.logger.Warn("Failed to convert news to list item DTO", zap.Error(err))
			continue
		}
		items[i] = *item
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &dto.NewsListResponseDTO{
		Data:       items,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}, nil
}

// Helper methods

// TODO: Fix NewsArticleForEditingDTO type issue
// func (m *NewsMapper) toNewsArticleForEditingDTO(ctx context.Context, na *entities.NewsArticle) (*dto.NewsArticleForEditingDTO, error) {
// 	dto := &dto.NewsArticleForEditingDTO{
// 		ID:           na.ID,
// 		ArticleID:    na.ArticleID,
// 		DisplayOrder: na.DisplayOrder,
// 		IsMainStory:  na.IsMainStory,
// 		IsFeatured:   na.IsFeatured,
// 		IsVisible:    na.IsVisible,
// 		Section:      na.Section,
// 		Summary:      na.Summary,
// 	}
//
// 	// Load article details
// 	article, err := m.articleRepo.GetByID(ctx, na.ArticleID, nil)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to load article: %w", err)
// 	}
//
// 	dto.Title = article.Title
// 	dto.ArticleSummary = article.Summary
// 	dto.FrontCoverImageURL = article.FrontCoverImageUrl
// 	dto.IsPublished = article.IsPublished
//
// 	return dto, nil
// }

func (m *NewsMapper) toUserDTO(user *entities.User) *dto.UserDTO {
	return &dto.UserDTO{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		AvatarURL:   m.getUserAvatarURL(user),
		Role:        string(user.Role),
	}
}

func (m *NewsMapper) getUserDisplayName(user *entities.User) string {
	if user.DisplayName != "" {
		return user.DisplayName
	}
	if user.FirstName != "" && user.LastName != "" {
		return fmt.Sprintf("%s %s", user.FirstName, user.LastName)
	}
	if user.FirstName != "" {
		return user.FirstName
	}
	return user.Username
}

func (m *NewsMapper) getUserAvatarURL(user *entities.User) string {
	if user.AvatarID != nil {
		if image, err := m.imageRepo.GetByID(context.Background(), *user.AvatarID); err == nil {
			return image.Url()
		}
	}
	return ""
}

func (m *NewsMapper) loadGalleryImages(ctx context.Context, galleryImageIDs string) []dto.ImageDTO {
	if galleryImageIDs == "" {
		return nil
	}

	// Parse JSON array of image IDs (simplified implementation)
	// In a real implementation, you'd use proper JSON parsing
	imageIDStrings := strings.Split(strings.Trim(galleryImageIDs, "[]\""), ",")
	images := make([]dto.ImageDTO, 0, len(imageIDStrings))

	for _, idStr := range imageIDStrings {
		idStr = strings.Trim(idStr, "\" ")
		if idStr == "" {
			continue
		}

		if id, err := uuid.Parse(idStr); err == nil {
			if image, err := m.imageRepo.GetByID(ctx, id); err == nil {
				images = append(images, dto.ImageDTO{
					ID:       image.ID,
					Name:     image.Filename,
					URL:      image.Url(),
					FileSize: image.FileSize,
					MimeType: image.MimeType,
				})
			}
		}
	}

	return images
}

// ToWeChatNewsStatusDTO converts WeChat status to DTO
func (m *NewsMapper) ToWeChatNewsStatusDTO(news *entities.News, articleCount, processedArticles int) *dto.WeChatNewsStatusDTO {
	return &dto.WeChatNewsStatusDTO{
		NewsID:            news.ID,
		DraftID:           news.WeChatDraftID,
		PublishedID:       news.WeChatPublishedID,
		URL:               news.WeChatURL,
		Status:            news.WeChatStatus,
		LastSyncedAt:      news.WeChatSyncedAt,
		CanCreateDraft:    news.WeChatDraftID == "",
		CanPublish:        news.WeChatDraftID != "" && news.WeChatPublishedID == "",
		CanUpdate:         news.WeChatDraftID != "",
		ArticleCount:      articleCount,
		ProcessedArticles: processedArticles,
	}
}
