package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
)

// ImageCategoryController handles image category management requests
type ImageCategoryController struct {
	categoryService services.ImageCategoryService
	logger          *zap.Logger
}

// NewImageCategoryController creates a new image category controller
func NewImageCategoryController(
	categoryService services.ImageCategoryService,
	logger *zap.Logger,
) *ImageCategoryController {
	return &ImageCategoryController{
		categoryService: categoryService,
		logger:          logger,
	}
}

// CreateCategory creates a new image category
func (c *ImageCategoryController) CreateCategory(ctx *gin.Context) {
	var req CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	category := &entities.ImageCategory{
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
	}

	if err := c.categoryService.CreateCategory(ctx.Request.Context(), category); err != nil {
		c.logger.Error("Failed to create category", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": CategoryResponse{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description,
			SortOrder:   category.SortOrder,
			CreatedAt:   category.CreatedAt,
			UpdatedAt:   getTimeValue(category.UpdatedAt),
		},
	})
}

// GetCategory retrieves a category by ID
func (c *ImageCategoryController) GetCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	category, err := c.categoryService.GetCategoryByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": CategoryResponse{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description,
			SortOrder:   category.SortOrder,
			CreatedAt:   category.CreatedAt,
			UpdatedAt:   getTimeValue(category.UpdatedAt),
		},
	})
}

// GetCategories retrieves categories with pagination
func (c *ImageCategoryController) GetCategories(ctx *gin.Context) {
	// Check if ordered list is requested
	ordered := ctx.Query("ordered") == "true"
	
	var categories []*entities.ImageCategory
	var err error
	var totalCount int64

	if ordered {
		categories, err = c.categoryService.GetAllCategoriesOrdered(ctx.Request.Context())
		totalCount = int64(len(categories))
	} else {
		// Parse pagination parameters
		offsetStr := ctx.DefaultQuery("offset", "0")
		limitStr := ctx.DefaultQuery("limit", "20")
		
		offset, err := strconv.Atoi(offsetStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
			return
		}
		
		limit, err := strconv.Atoi(limitStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit parameter"})
			return
		}

		categories, err = c.categoryService.GetAllCategories(ctx.Request.Context(), offset, limit)
		if err != nil {
			c.logger.Error("Failed to get categories", zap.Error(err))
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve categories"})
			return
		}
		totalCount, _ = c.categoryService.GetCategoryCount(ctx.Request.Context())
	}

	if err != nil {
		c.logger.Error("Failed to get categories", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve categories"})
		return
	}

	// Convert to response format
	categoryResponses := make([]CategoryResponse, len(categories))
	for i, category := range categories {
		categoryResponses[i] = CategoryResponse{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description,
			SortOrder:   category.SortOrder,
			CreatedAt:   category.CreatedAt,
			UpdatedAt:   getTimeValue(category.UpdatedAt),
		}
	}

	response := gin.H{"data": categoryResponses}
	if !ordered {
		response["pagination"] = gin.H{
			"totalCount": totalCount,
		}
	}

	ctx.JSON(http.StatusOK, response)
}

// UpdateCategory updates an existing category
func (c *ImageCategoryController) UpdateCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	var req UpdateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Get existing category
	category, err := c.categoryService.GetCategoryByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	// Update fields if provided
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}

	// Update category
	if err := c.categoryService.UpdateCategory(ctx.Request.Context(), category); err != nil {
		c.logger.Error("Failed to update category", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": CategoryResponse{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description,
			SortOrder:   category.SortOrder,
			CreatedAt:   category.CreatedAt,
			UpdatedAt:   getTimeValue(category.UpdatedAt),
		},
	})
}

// DeleteCategory soft deletes a category
func (c *ImageCategoryController) DeleteCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	if err := c.categoryService.DeleteCategory(ctx.Request.Context(), id); err != nil {
		c.logger.Error("Failed to delete category", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

// Request/Response DTOs
type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	SortOrder   int    `json:"sortOrder"`
}

type UpdateCategoryRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	SortOrder   *int    `json:"sortOrder"`
}

type CategoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
