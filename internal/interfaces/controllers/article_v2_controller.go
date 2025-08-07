package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/pkg/utils"
)

// ArticleV2Controller handles HTTP requests for the new article management system
type ArticleV2Controller struct {
	articleService       *services.ArticleService
	articleWeChatService *services.ArticleWeChatService
	logger               *zap.Logger
}

// NewArticleV2Controller creates a new article v2 controller
func NewArticleV2Controller(
	articleService *services.ArticleService,
	articleWeChatService *services.ArticleWeChatService,
	logger *zap.Logger,
) *ArticleV2Controller {
	return &ArticleV2Controller{
		articleService:       articleService,
		articleWeChatService: articleWeChatService,
		logger:               logger,
	}
}

// CreateArticle creates a new article
// @Summary Create article (v2)
// @Description Create a new article with enhanced features
// @Tags articles-v2
// @Accept json
// @Produce json
// @Param article body services.ArticleCreateRequest true "Article data"
// @Success 201 {object} utils.StandardResponse{data=services.ArticleResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles [post]
func (c *ArticleV2Controller) CreateArticle(ctx *gin.Context) {
	var req services.ArticleCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	article, err := c.articleService.CreateArticle(ctx.Request.Context(), &req)
	if err != nil {
		c.logger.Error("Failed to create article", zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusCreated, "Article created successfully", article)
}

// GetArticle retrieves an article by ID
// @Summary Get article (v2)
// @Description Get an article by ID with enhanced options
// @Tags articles-v2
// @Produce json
// @Param id path string true "Article ID"
// @Param include_category query bool false "Include category information"
// @Param include_tags query bool false "Include tags information"
// @Param include_images query bool false "Include images information"
// @Param track_view query bool false "Track this view for analytics"
// @Success 200 {object} utils.StandardResponse{data=services.ArticleResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles/{id} [get]
func (c *ArticleV2Controller) GetArticle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	// Parse query parameters for options
	options := &services.ArticleGetOptions{
		IncludeCategory: ctx.Query("include_category") == "true",
		IncludeTags:     ctx.Query("include_tags") == "true",
		IncludeImages:   ctx.Query("include_images") == "true",
		TrackView:       ctx.Query("track_view") == "true",
		IPAddress:       ctx.ClientIP(),
		SessionID:       ctx.GetHeader("X-Session-ID"),
	}

	// Get user ID from context if authenticated
	if userID, exists := ctx.Get("user_id"); exists {
		if uid, ok := userID.(uuid.UUID); ok {
			options.UserID = &uid
		}
	}

	article, err := c.articleService.GetArticle(ctx.Request.Context(), id, options)
	if err != nil {
		c.logger.Error("Failed to get article", zap.String("id", id.String()), zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Article retrieved successfully", article)
}

// ListArticles retrieves a paginated list of articles
// @Summary List articles (v2)
// @Description Get a paginated list of articles with enhanced filtering
// @Tags articles-v2
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param include_category query bool false "Include category information"
// @Success 200 {object} utils.StandardResponse{data=utils.PaginationResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles [get]
func (c *ArticleV2Controller) ListArticles(ctx *gin.Context) {
	// Parse pagination parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))
	page, limit = utils.ValidatePagination(page, limit)

	// Calculate offset
	offset := (page - 1) * limit

	// Parse options
	options := &repositories.ArticleListOptions{
		IncludeCategory:       ctx.Query("include_category") == "true",
		IncludeCoverImage:     ctx.Query("include_images") == "true",
		IncludePromotionImage: ctx.Query("include_images") == "true",
	}

	articles, total, err := c.articleService.ListArticles(ctx.Request.Context(), offset, limit, options)
	if err != nil {
		c.logger.Error("Failed to list articles", zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	response := utils.NewPaginationResponse(articles, total, page, limit)
	utils.SuccessResponse(ctx, http.StatusOK, "Articles retrieved successfully", response)
}

// UpdateArticle updates an existing article
// @Summary Update article (v2)
// @Description Update an existing article with enhanced features
// @Tags articles-v2
// @Accept json
// @Produce json
// @Param id path string true "Article ID"
// @Param article body services.ArticleUpdateRequest true "Article update data"
// @Success 200 {object} utils.StandardResponse{data=services.ArticleResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles/{id} [put]
func (c *ArticleV2Controller) UpdateArticle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	var req services.ArticleUpdateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	article, err := c.articleService.UpdateArticle(ctx.Request.Context(), id, &req)
	if err != nil {
		c.logger.Error("Failed to update article", zap.String("id", id.String()), zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Article updated successfully", article)
}

// DeleteArticle deletes an article
// @Summary Delete article (v2)
// @Description Delete an article by ID
// @Tags articles-v2
// @Produce json
// @Param id path string true "Article ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles/{id} [delete]
func (c *ArticleV2Controller) DeleteArticle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	err = c.articleService.DeleteArticle(ctx.Request.Context(), id, nil)
	if err != nil {
		c.logger.Error("Failed to delete article", zap.String("id", id.String()), zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Article deleted successfully", nil)
}

// PublishArticle publishes an article
// @Summary Publish article (v2)
// @Description Publish an article by ID
// @Tags articles-v2
// @Produce json
// @Param id path string true "Article ID"
// @Success 200 {object} utils.StandardResponse{data=services.ArticleResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles/{id}/publish [post]
func (c *ArticleV2Controller) PublishArticle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	article, err := c.articleService.PublishArticle(ctx.Request.Context(), id, nil)
	if err != nil {
		c.logger.Error("Failed to publish article", zap.String("id", id.String()), zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Article published successfully", article)
}

// GetArticleByPromotionCode retrieves an article by promotion code
// @Summary Get article by promotion code (v2)
// @Description Get an article by its promotion code
// @Tags articles-v2
// @Produce json
// @Param code path string true "Promotion Code"
// @Param track_view query bool false "Track this view for analytics"
// @Success 200 {object} utils.StandardResponse{data=services.ArticleResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/articles/promo/{code} [get]
func (c *ArticleV2Controller) GetArticleByPromotionCode(ctx *gin.Context) {
	code := ctx.Param("code")
	if code == "" {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Promotion code is required", nil)
		return
	}

	// Parse query parameters for options
	options := &services.ArticleGetOptions{
		IncludeCategory: true, // Always include for promotion code access
		IncludeTags:     true,
		IncludeImages:   true,
		TrackView:       ctx.Query("track_view") != "false", // Default to true for promotion codes
		IPAddress:       ctx.ClientIP(),
		SessionID:       ctx.GetHeader("X-Session-ID"),
	}

	// Get user ID from context if authenticated
	if userID, exists := ctx.Get("user_id"); exists {
		if uid, ok := userID.(uuid.UUID); ok {
			options.UserID = &uid
		}
	}

	article, err := c.articleService.GetArticleByPromotionCode(ctx.Request.Context(), code, options)
	if err != nil {
		c.logger.Error("Failed to get article by promotion code", zap.String("code", code), zap.Error(err))
		utils.HandleServiceError(ctx, err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Article retrieved successfully", article)
}

// WeChat QR Code Endpoints

// GenerateArticleQRCode handles POST /api/v2/articles/:id/wechat/qrcode
func (c *ArticleV2Controller) GenerateArticleQRCode(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	// Get QR code type from query parameter
	qrCodeType := ctx.DefaultQuery("type", "permanent")
	if qrCodeType != "permanent" && qrCodeType != "temporary" {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid QR code type. Must be 'permanent' or 'temporary'", nil)
		return
	}

	// Generate QR code
	qrCode, err := c.articleWeChatService.GenerateArticleQRCode(ctx.Request.Context(), id, qrCodeType)
	if err != nil {
		c.logger.Error("Failed to generate article QR code",
			zap.String("articleId", id.String()),
			zap.String("type", qrCodeType),
			zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to generate QR code", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "QR code generated successfully", qrCode)
}

// GetArticleQRCodes handles GET /api/v2/articles/:id/wechat/qrcodes
func (c *ArticleV2Controller) GetArticleQRCodes(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	// Get QR codes
	qrCodes, err := c.articleWeChatService.GetArticleQRCodes(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get article QR codes",
			zap.String("articleId", id.String()),
			zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get QR codes", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "QR codes retrieved successfully", qrCodes)
}

// GetArticleWeChatShareInfo handles GET /api/v2/articles/:id/wechat/share-info
func (c *ArticleV2Controller) GetArticleWeChatShareInfo(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid article ID", err)
		return
	}

	// Get WeChat content
	content, err := c.articleWeChatService.PrepareWeChatContent(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to prepare WeChat content",
			zap.String("articleId", id.String()),
			zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to prepare WeChat content", err)
		return
	}

	// Get QR codes
	qrCodes, err := c.articleWeChatService.GetArticleQRCodes(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Warn("Failed to get QR codes for share info",
			zap.String("articleId", id.String()),
			zap.Error(err))
		qrCodes = nil // Return nil if QR codes fail
	}

	shareInfo := map[string]interface{}{
		"articleId":        id.String(),
		"optimizedContent": content,
		"qrCodes":          qrCodes,
		"shareUrl":         fmt.Sprintf("http://localhost:8080/api/v1/mobile/articles/%s", id.String()),
	}

	utils.SuccessResponse(ctx, http.StatusOK, "WeChat share info retrieved successfully", shareInfo)
}
