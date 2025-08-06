package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
	"github.com/zenteam/nextevent-go/internal/interfaces/mappers"
	"github.com/zenteam/nextevent-go/pkg/utils"
)

// NewsController handles HTTP requests for news management
type NewsController struct {
	newsService       *services.NewsManagementService
	wechatNewsService services.WeChatNewsService
	newsMapper        *mappers.NewsMapper
	logger            *zap.Logger
}

// NewNewsController creates a new news controller
func NewNewsController(
	newsService *services.NewsManagementService,
	wechatNewsService services.WeChatNewsService,
	newsMapper *mappers.NewsMapper,
	logger *zap.Logger,
) *NewsController {
	return &NewsController{
		newsService:       newsService,
		wechatNewsService: wechatNewsService,
		newsMapper:        newsMapper,
		logger:            logger,
	}
}

// CreateNews creates a new news publication
// @Summary Create news
// @Description Create a new news publication with multiple articles
// @Tags news
// @Accept json
// @Produce json
// @Param news body dto.CreateNewsRequestDTO true "News data"
// @Success 201 {object} utils.StandardResponse{data=dto.NewsDetailDTO}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news [post]
func (c *NewsController) CreateNews(ctx *gin.Context) {
	var frontendReq dto.CreateNewsRequestDTO
	if err := ctx.ShouldBindJSON(&frontendReq); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Convert frontend DTO to service request
	serviceReq := c.convertCreateRequestToService(&frontendReq, ctx)

	c.logger.Info("Creating news", zap.String("title", serviceReq.Title))

	news, err := c.newsService.CreateNews(ctx.Request.Context(), serviceReq)
	if err != nil {
		c.logger.Error("Failed to create news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create news", err)
		return
	}

	// For now, return the service response directly
	// TODO: Implement proper entity-to-DTO conversion when we have access to the entity
	utils.SuccessResponse(ctx, http.StatusCreated, "News created successfully", news)
}

// GetNews retrieves a news publication by ID
// @Summary Get news by ID
// @Description Get a news publication by its ID
// @Tags news
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse{data=services.NewsResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id} [get]
func (c *NewsController) GetNews(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	news, err := c.newsService.GetNews(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusNotFound, "News not found", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News retrieved successfully", news)
}

// GetNewsForEditing retrieves news with all related data for editing
// @Summary Get news for editing
// @Description Get news with all related data for editing interface
// @Tags news
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse{data=services.NewsForEditingResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/edit [get]
func (c *NewsController) GetNewsForEditing(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	news, err := c.newsService.GetNewsForEditing(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get news for editing", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusNotFound, "News not found", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News retrieved successfully", news)
}

// UpdateNews updates an existing news publication
// @Summary Update news
// @Description Update an existing news publication
// @Tags news
// @Accept json
// @Produce json
// @Param id path string true "News ID"
// @Param news body services.NewsUpdateRequest true "News update data"
// @Success 200 {object} utils.StandardResponse{data=services.NewsResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id} [put]
func (c *NewsController) UpdateNews(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	var req services.NewsUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Set the news ID from the URL parameter
	req.NewsID = id

	c.logger.Info("Updating news", zap.String("newsID", id.String()))

	news, err := c.newsService.UpdateNews(ctx.Request.Context(), &req)
	if err != nil {
		c.logger.Error("Failed to update news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News updated successfully", news)
}

// DeleteNews deletes a news publication
// @Summary Delete news
// @Description Delete a news publication
// @Tags news
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id} [delete]
func (c *NewsController) DeleteNews(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	c.logger.Info("Deleting news", zap.String("newsID", id.String()))

	// TODO: Get user ID from authentication context
	var userID *uuid.UUID

	err = c.newsService.DeleteNews(ctx.Request.Context(), id, userID)
	if err != nil {
		c.logger.Error("Failed to delete news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News deleted successfully", nil)
}

// ListNews retrieves news with filtering and pagination
// @Summary List news
// @Description Get a paginated list of news with filtering options
// @Tags news
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param status query string false "News status filter"
// @Param type query string false "News type filter"
// @Param search query string false "Search query"
// @Success 200 {object} utils.StandardResponse{data=services.ListNewsResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news [get]
func (c *NewsController) ListNews(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	req := &services.ListNewsRequest{
		PageNumber: page,
		PageSize:   limit,
		Search:     ctx.Query("search"),
		SortBy:     ctx.DefaultQuery("sortBy", "created_at"),
		SortOrder:  ctx.DefaultQuery("sortOrder", "desc"),
	}

	// Parse optional filters
	if status := ctx.Query("status"); status != "" {
		// TODO: Parse status enum
	}
	if newsType := ctx.Query("type"); newsType != "" {
		// TODO: Parse type enum
	}

	newsList, err := c.newsService.ListNews(ctx.Request.Context(), req)
	if err != nil {
		c.logger.Error("Failed to list news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to list news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News list retrieved successfully", newsList)
}

// PublishNews publishes a news publication
// @Summary Publish news
// @Description Publish a news publication
// @Tags news
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/publish [post]
func (c *NewsController) PublishNews(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	c.logger.Info("Publishing news", zap.String("newsID", id.String()))

	// TODO: Get user ID from authentication context
	var userID *uuid.UUID

	err = c.newsService.PublishNews(ctx.Request.Context(), id, userID)
	if err != nil {
		c.logger.Error("Failed to publish news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to publish news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News published successfully", nil)
}

// UnpublishNews unpublishes a news publication
// @Summary Unpublish news
// @Description Unpublish a news publication
// @Tags news
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/unpublish [post]
func (c *NewsController) UnpublishNews(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	c.logger.Info("Unpublishing news", zap.String("newsID", id.String()))

	// TODO: Get user ID from authentication context
	var userID *uuid.UUID

	err = c.newsService.UnpublishNews(ctx.Request.Context(), id, userID)
	if err != nil {
		c.logger.Error("Failed to unpublish news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to unpublish news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "News unpublished successfully", nil)
}

// SearchNews searches news by query
// @Summary Search news
// @Description Search news by query string
// @Tags news
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} utils.StandardResponse{data=services.ListNewsResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/search [get]
func (c *NewsController) SearchNews(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Search query is required", nil)
		return
	}

	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	req := &services.SearchNewsRequest{
		Query:      query,
		PageNumber: page,
		PageSize:   limit,
	}

	newsList, err := c.newsService.SearchNews(ctx.Request.Context(), req)
	if err != nil {
		c.logger.Error("Failed to search news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to search news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Search results retrieved successfully", newsList)
}

// WeChat Integration Endpoints

// CreateWeChatDraft creates a WeChat draft for news
// @Summary Create WeChat draft
// @Description Create a WeChat draft for the news publication
// @Tags news-wechat
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/wechat/draft [post]
func (c *NewsController) CreateWeChatDraft(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	c.logger.Info("Creating WeChat draft", zap.String("newsID", id.String()))

	err = c.wechatNewsService.CreateWeChatDraft(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to create WeChat draft", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create WeChat draft", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "WeChat draft created successfully", nil)
}

// PublishToWeChat publishes news to WeChat
// @Summary Publish to WeChat
// @Description Publish the news publication to WeChat
// @Tags news-wechat
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/wechat/publish [post]
func (c *NewsController) PublishToWeChat(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	c.logger.Info("Publishing to WeChat", zap.String("newsID", id.String()))

	err = c.wechatNewsService.PublishToWeChat(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to publish to WeChat", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to publish to WeChat", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Published to WeChat successfully", nil)
}

// GetWeChatStatus gets WeChat publication status
// @Summary Get WeChat status
// @Description Get the WeChat publication status for news
// @Tags news-wechat
// @Produce json
// @Param id path string true "News ID"
// @Success 200 {object} utils.StandardResponse{data=services.WeChatNewsStatus}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/{id}/wechat/status [get]
func (c *NewsController) GetWeChatStatus(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid news ID", err)
		return
	}

	status, err := c.wechatNewsService.GetWeChatStatus(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get WeChat status", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get WeChat status", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "WeChat status retrieved successfully", status)
}

// Analytics Endpoints

// GetPopularNews gets popular news
// @Summary Get popular news
// @Description Get popular news based on view counts
// @Tags news
// @Produce json
// @Param limit query int false "Number of items to return" default(10)
// @Param days query int false "Number of days to look back" default(7)
// @Success 200 {object} utils.StandardResponse{data=[]services.NewsListItem}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/popular [get]
func (c *NewsController) GetPopularNews(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))
	days, _ := strconv.Atoi(ctx.DefaultQuery("days", "7"))

	if limit < 1 || limit > 100 {
		limit = 10
	}
	if days < 1 {
		days = 7
	}

	// Calculate since time
	since := time.Now().AddDate(0, 0, -days)

	newsList, err := c.newsService.GetPopularNews(ctx.Request.Context(), since, limit)
	if err != nil {
		c.logger.Error("Failed to get popular news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get popular news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Popular news retrieved successfully", newsList)
}

// GetTrendingNews gets trending news
// @Summary Get trending news
// @Description Get trending news based on recent engagement
// @Tags news
// @Produce json
// @Param limit query int false "Number of items to return" default(10)
// @Success 200 {object} utils.StandardResponse{data=[]services.NewsListItem}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/trending [get]
func (c *NewsController) GetTrendingNews(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if limit < 1 || limit > 100 {
		limit = 10
	}

	newsList, err := c.newsService.GetTrendingNews(ctx.Request.Context(), limit)
	if err != nil {
		c.logger.Error("Failed to get trending news", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get trending news", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Trending news retrieved successfully", newsList)
}

// Helper methods

// convertCreateRequestToService converts frontend create request to service request
func (c *NewsController) convertCreateRequestToService(frontendReq *dto.CreateNewsRequestDTO, ctx *gin.Context) *services.NewsCreateRequest {
	// TODO: Get user ID from authentication context
	var authorID *uuid.UUID

	// Convert article settings
	articleSettings := make(map[uuid.UUID]services.NewsArticleSettings)
	for id, setting := range frontendReq.ArticleSettings {
		articleSettings[id] = services.NewsArticleSettings{
			IsMainStory: setting.IsMainStory,
			IsFeatured:  setting.IsFeatured,
			Section:     setting.Section,
			Summary:     setting.Summary,
		}
	}

	return &services.NewsCreateRequest{
		Title:           frontendReq.Title,
		Subtitle:        frontendReq.Subtitle,
		Description:     frontendReq.Description,
		Content:         frontendReq.Content,
		Summary:         frontendReq.Summary,
		Type:            entities.NewsType(frontendReq.Type),
		Priority:        entities.NewsPriority(frontendReq.Priority),
		AuthorID:        authorID,
		Slug:            frontendReq.Slug,
		MetaTitle:       frontendReq.MetaTitle,
		MetaDescription: frontendReq.MetaDescription,
		Keywords:        frontendReq.Keywords,
		Tags:            frontendReq.Tags,
		FeaturedImageID: frontendReq.FeaturedImageID,
		ThumbnailID:     frontendReq.ThumbnailID,
		AllowComments:   frontendReq.AllowComments,
		AllowSharing:    frontendReq.AllowSharing,
		IsFeatured:      frontendReq.IsFeatured,
		IsBreaking:      frontendReq.IsBreaking,
		RequireAuth:     frontendReq.RequireAuth,
		ScheduledAt:     frontendReq.ScheduledAt,
		ExpiresAt:       frontendReq.ExpiresAt,
		Language:        frontendReq.Language,
		Region:          frontendReq.Region,
		ArticleIDs:      frontendReq.ArticleIDs,
		ArticleSettings: articleSettings,
		CategoryIDs:     frontendReq.CategoryIDs,
	}
}

// SearchArticlesForSelection searches articles available for news creation
// @Summary Search articles for selection
// @Description Search and filter articles available for news creation
// @Tags news
// @Produce json
// @Param query query string false "Search query"
// @Param categoryId query string false "Category ID"
// @Param author query string false "Author name"
// @Param isPublished query bool false "Published status"
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(20)
// @Success 200 {object} utils.StandardResponse{data=dto.ArticleSelectionResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/articles/search [get]
func (c *NewsController) SearchArticlesForSelection(ctx *gin.Context) {
	var req dto.ArticleSelectionSearchRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid query parameters", err)
		return
	}

	// Convert to service filter
	filter := c.convertArticleSearchToFilter(&req)

	// Get articles from service
	articles, total, err := c.newsService.SearchArticlesForSelection(ctx.Request.Context(), filter)
	if err != nil {
		c.logger.Error("Failed to search articles for selection", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to search articles", err)
		return
	}

	// Convert to DTOs
	response := c.convertArticlesToSelectionResponse(ctx.Request.Context(), articles, total, req.Page, req.PageSize)

	utils.SuccessResponse(ctx, http.StatusOK, "Articles retrieved successfully", response)
}

// SearchImagesForSelection searches images available for news creation
// @Summary Search images for selection
// @Description Search and filter images available for news creation
// @Tags news
// @Produce json
// @Param query query string false "Search query"
// @Param mimeType query string false "MIME type filter"
// @Param minWidth query int false "Minimum width"
// @Param maxWidth query int false "Maximum width"
// @Param minHeight query int false "Minimum height"
// @Param maxHeight query int false "Maximum height"
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(20)
// @Success 200 {object} utils.StandardResponse{data=dto.ImageSelectionResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/images/search [get]
func (c *NewsController) SearchImagesForSelection(ctx *gin.Context) {
	var req dto.ImageSelectionSearchRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid query parameters", err)
		return
	}

	// Convert to service filter
	filter := c.convertImageSearchToFilter(&req)

	// Get images from service
	images, total, err := c.newsService.SearchImagesForSelection(ctx.Request.Context(), filter)
	if err != nil {
		c.logger.Error("Failed to search images for selection", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to search images", err)
		return
	}

	// Convert to DTOs
	response := c.convertImagesToSelectionResponse(ctx.Request.Context(), images, total, req.Page, req.PageSize)

	utils.SuccessResponse(ctx, http.StatusOK, "Images retrieved successfully", response)
}

// CreateNewsWithSelectors creates news using the enhanced form with article and image selectors
// @Summary Create news with article and image selectors
// @Description Create news using selected articles and images instead of manual input
// @Tags news
// @Accept json
// @Produce json
// @Param request body dto.NewsCreationFormDTO true "News creation form with selectors"
// @Success 201 {object} utils.StandardResponse{data=dto.NewsCreationResponseDTO}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/news/create-with-selectors [post]
func (c *NewsController) CreateNewsWithSelectors(ctx *gin.Context) {
	var req dto.NewsCreationFormDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Validate that at least one article is selected
	if len(req.SelectedArticleIDs) == 0 {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "At least one article must be selected", nil)
		return
	}

	// Convert to service request
	serviceReq := c.convertNewsCreationFormToServiceRequest(&req)

	// Create news using the service
	newsID, err := c.newsService.CreateNewsWithSelectors(ctx.Request.Context(), serviceReq)
	if err != nil {
		c.logger.Error("Failed to create news with selectors", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create news", err)
		return
	}

	// Build response
	response := &dto.NewsCreationResponseDTO{
		ID:              newsID,
		Title:           req.Title,
		Status:          "created",
		Message:         "News created successfully with selected articles and images",
		CreatedArticles: len(req.SelectedArticleIDs),
		ProcessedImages: 0,
	}

	if req.FeaturedImageID != nil {
		response.ProcessedImages++
	}
	if req.ThumbnailImageID != nil {
		response.ProcessedImages++
	}

	// Handle WeChat integration if requested
	if req.CreateWeChatDraft {
		// TODO: Implement WeChat draft creation
		// For now, just log the request
		c.logger.Info("WeChat draft creation requested but not yet implemented",
			zap.String("newsID", newsID.String()))
		response.WeChatDraftStatus = "pending_implementation"
	}

	// Handle scheduling if specified
	if req.ScheduledAt != nil {
		// TODO: Implement news scheduling
		// For now, just log the request
		c.logger.Info("News scheduling requested but not yet implemented",
			zap.String("newsID", newsID.String()),
			zap.Time("scheduledAt", *req.ScheduledAt))
		response.ScheduledAt = req.ScheduledAt
	}

	// Handle expiration if specified
	if req.ExpiresAt != nil {
		// TODO: Implement news expiration
		// For now, just log the request
		c.logger.Info("News expiration requested but not yet implemented",
			zap.String("newsID", newsID.String()),
			zap.Time("expiresAt", *req.ExpiresAt))
		response.ExpiresAt = req.ExpiresAt
	}

	utils.SuccessResponse(ctx, http.StatusCreated, "News created successfully", response)
}

// convertNewsCreationFormToServiceRequest converts the form DTO to service request
func (c *NewsController) convertNewsCreationFormToServiceRequest(req *dto.NewsCreationFormDTO) *services.NewsCreationWithSelectorsRequest {
	// Convert type string to enum
	var newsType entities.NewsType
	switch req.Type {
	case "breaking":
		newsType = entities.NewsTypeBreaking
	case "featured", "feature":
		newsType = entities.NewsTypeFeature // Use NewsTypeFeature instead of NewsTypeFeatured
	case "special":
		newsType = entities.NewsTypeSpecial
	case "weekly":
		newsType = entities.NewsTypeWeekly
	case "monthly":
		newsType = entities.NewsTypeMonthly
	default:
		newsType = entities.NewsTypeRegular
	}

	// Convert priority string to enum
	var priority entities.NewsPriority
	switch req.Priority {
	case "low":
		priority = entities.NewsPriorityLow
	case "high":
		priority = entities.NewsPriorityHigh
	case "urgent":
		priority = entities.NewsPriorityUrgent
	default:
		priority = entities.NewsPriorityNormal // Use NewsPriorityNormal instead of NewsPriorityMedium
	}

	// Convert article settings
	articleSettings := make(map[string]services.ArticleNewsSettings)
	for articleID, settings := range req.ArticleSettings {
		articleSettings[articleID] = services.ArticleNewsSettings{
			IsMainStory:   settings.IsMainStory,
			IsFeatured:    settings.IsFeatured,
			Section:       settings.Section,
			CustomSummary: settings.CustomSummary,
			DisplayOrder:  settings.DisplayOrder,
		}
	}

	// Convert WeChat settings
	var wechatSettings *services.WeChatNewsSettings
	if req.WeChatSettings != nil {
		wechatSettings = &services.WeChatNewsSettings{
			Title:        req.WeChatSettings.Title,
			Summary:      req.WeChatSettings.Summary,
			CoverImageID: req.WeChatSettings.CoverImageID,
			AutoPublish:  req.WeChatSettings.AutoPublish,
		}
	}

	return &services.NewsCreationWithSelectorsRequest{
		// Basic Information
		Title:       req.Title,
		Subtitle:    req.Subtitle,
		Summary:     req.Summary,
		Description: req.Description,

		// Type and Priority
		Type:     newsType,
		Priority: priority,

		// Selected Content
		SelectedArticleIDs: req.SelectedArticleIDs,
		FeaturedImageID:    req.FeaturedImageID,
		ThumbnailImageID:   req.ThumbnailImageID,

		// Article Settings
		ArticleSettings: articleSettings,

		// Categories
		CategoryIDs: req.CategoryIDs,

		// Configuration
		AllowComments: req.AllowComments,
		AllowSharing:  req.AllowSharing,
		IsFeatured:    req.IsFeatured,
		IsBreaking:    req.IsBreaking,
		RequireAuth:   req.RequireAuth,

		// Scheduling
		ScheduledAt: req.ScheduledAt,
		ExpiresAt:   req.ExpiresAt,

		// WeChat Integration
		CreateWeChatDraft: req.CreateWeChatDraft,
		WeChatSettings:    wechatSettings,
	}
}

// Helper methods for article and image selection

// convertArticleSearchToFilter converts DTO search request to service filter
func (c *NewsController) convertArticleSearchToFilter(req *dto.ArticleSelectionSearchRequest) *services.ArticleSelectionFilter {
	filter := &services.ArticleSelectionFilter{
		Query:       req.Query,
		Author:      req.Author,
		IsPublished: req.IsPublished,
		SortBy:      req.SortBy,
		SortOrder:   req.SortOrder,
		Page:        req.Page,
		PageSize:    req.PageSize,
	}

	if req.CategoryID != nil {
		filter.CategoryID = req.CategoryID
	}

	return filter
}

// convertImageSearchToFilter converts DTO search request to service filter
func (c *NewsController) convertImageSearchToFilter(req *dto.ImageSelectionSearchRequest) *services.ImageSelectionFilter {
	return &services.ImageSelectionFilter{
		Query:     req.Query,
		MimeType:  req.MimeType,
		MinWidth:  req.MinWidth,
		MaxWidth:  req.MaxWidth,
		MinHeight: req.MinHeight,
		MaxHeight: req.MaxHeight,
		SortBy:    req.SortBy,
		SortOrder: req.SortOrder,
		Page:      req.Page,
		PageSize:  req.PageSize,
	}
}

// convertArticlesToSelectionResponse converts service response to DTO
func (c *NewsController) convertArticlesToSelectionResponse(ctx context.Context, articles []*entities.SiteArticle, total int64, page, pageSize int) *dto.ArticleSelectionResponse {
	articleDTOs := make([]dto.ArticleSelectionDTO, len(articles))

	for i, article := range articles {
		articleDTOs[i] = dto.ArticleSelectionDTO{
			ID:                 article.ID,
			Title:              article.Title,
			Summary:            article.Summary,
			Author:             article.Author,
			CategoryID:         article.CategoryId,
			FrontCoverImageURL: article.FrontCoverImageUrl,
			IsPublished:        article.IsPublished,
			PublishedAt:        article.PublishedAt,
			ViewCount:          article.ViewCount,
			ReadCount:          article.ReadCount,
			CreatedAt:          article.CreatedAt,
			UpdatedAt:          article.UpdatedAt,
			IsSelected:         false, // Default to not selected
		}
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &dto.ArticleSelectionResponse{
		Articles: articleDTOs,
		Pagination: dto.PaginationDTO{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}
}

// convertImagesToSelectionResponse converts service response to DTO
func (c *NewsController) convertImagesToSelectionResponse(ctx context.Context, images []*entities.SiteImage, total int64, page, pageSize int) *dto.ImageSelectionResponse {
	imageDTOs := make([]dto.ImageSelectionDTO, len(images))

	for i, image := range images {
		imageDTOs[i] = dto.ImageSelectionDTO{
			ID:           image.ID,
			Filename:     image.Filename,
			OriginalURL:  image.Url(),
			ThumbnailURL: image.GetThumbnailURL(),
			FileSize:     image.FileSize,
			MimeType:     image.MimeType,
			Width:        image.Width,
			Height:       image.Height,
			AltText:      image.AltText,
			Description:  image.Description,
			CreatedAt:    image.CreatedAt,
			IsSelected:   false, // Default to not selected
		}
	}

	totalPages := int((total + int64(pageSize) - 1) / int64(pageSize))

	return &dto.ImageSelectionResponse{
		Images: imageDTOs,
		Pagination: dto.PaginationDTO{
			Page:       page,
			PageSize:   pageSize,
			Total:      total,
			TotalPages: totalPages,
			HasNext:    page < totalPages,
			HasPrev:    page > 1,
		},
	}
}
