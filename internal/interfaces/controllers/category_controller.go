package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
	"go.uber.org/zap"
)

// CategoryController handles category-related HTTP requests
type CategoryController struct {
	categoryService services.ArticleCategoryService
	logger          *zap.Logger
}

// NewCategoryController creates a new category controller
func NewCategoryController(
	categoryService services.ArticleCategoryService,
	logger *zap.Logger,
) *CategoryController {
	return &CategoryController{
		categoryService: categoryService,
		logger:          logger,
	}
}

// GetCategories retrieves all categories
// @Summary Get categories
// @Description Get all article categories
// @Tags categories
// @Accept json
// @Produce json
// @Param includeStats query bool false "Include article statistics"
// @Success 200 {object} dto.APIResponse{data=[]dto.CategoryDTO}
// @Failure 500 {object} dto.APIResponse
// @Router /api/categories [get]
func (c *CategoryController) GetCategories(ctx *gin.Context) {
	includeStats := ctx.Query("includeStats") == "true"

	if includeStats {
		categoriesWithStats, err := c.categoryService.GetAllCategoriesWithCounts(ctx)
		if err != nil {
			c.logger.Error("Failed to get categories with stats", zap.Error(err))
			ctx.JSON(http.StatusInternalServerError, dto.APIResponse{
				Success: false,
				Message: "Failed to retrieve categories",
				Error:   err.Error(),
			})
			return
		}

		// Convert to DTOs
		categoryDTOs := make([]*dto.CategoryWithStatsDTO, len(categoriesWithStats))
		for i, categoryWithStats := range categoriesWithStats {
			categoryDTOs[i] = &dto.CategoryWithStatsDTO{
				CategoryDTO:    c.categoryToDTO(categoryWithStats.Category),
				ArticleCount:   categoryWithStats.ArticleCount,
				PublishedCount: categoryWithStats.PublishedCount,
				DraftCount:     categoryWithStats.DraftCount,
			}
		}

		ctx.JSON(http.StatusOK, dto.APIResponse{
			Success: true,
			Data:    categoryDTOs,
		})
	} else {
		categories, err := c.categoryService.GetAllCategoriesOrdered(ctx)
		if err != nil {
			c.logger.Error("Failed to get categories", zap.Error(err))
			ctx.JSON(http.StatusInternalServerError, dto.APIResponse{
				Success: false,
				Message: "Failed to retrieve categories",
				Error:   err.Error(),
			})
			return
		}

		// Convert to DTOs
		categoryDTOs := make([]*dto.CategoryDTO, len(categories))
		for i, category := range categories {
			categoryDTOs[i] = c.categoryToDTO(category)
		}

		ctx.JSON(http.StatusOK, dto.APIResponse{
			Success: true,
			Data:    categoryDTOs,
		})
	}
}

// GetCategory retrieves a single category by ID
// @Summary Get category by ID
// @Description Get a single category by its ID
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} dto.APIResponse{data=dto.CategoryDTO}
// @Failure 400 {object} dto.APIResponse
// @Failure 404 {object} dto.APIResponse
// @Failure 500 {object} dto.APIResponse
// @Router /api/categories/{id} [get]
func (c *CategoryController) GetCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	category, err := c.categoryService.GetCategoryByID(ctx, id)
	if err != nil {
		c.logger.Error("Failed to get category", zap.String("id", idStr), zap.Error(err))
		ctx.JSON(http.StatusNotFound, dto.APIResponse{
			Success: false,
			Message: "Category not found",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Data:    c.categoryToDTO(category),
	})
}

// CreateCategory creates a new category
// @Summary Create category
// @Description Create a new article category
// @Tags categories
// @Accept json
// @Produce json
// @Param category body dto.CreateCategoryRequest true "Category data"
// @Success 201 {object} dto.APIResponse{data=dto.CategoryDTO}
// @Failure 400 {object} dto.APIResponse
// @Failure 500 {object} dto.APIResponse
// @Router /api/categories [post]
func (c *CategoryController) CreateCategory(ctx *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	// Create category entity
	category := &entities.ArticleCategory{
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
		Color:       req.Color,
		Icon:        req.Icon,
	}

	if err := c.categoryService.CreateCategory(ctx, category); err != nil {
		c.logger.Error("Failed to create category", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Message: "Failed to create category",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, dto.APIResponse{
		Success: true,
		Message: "Category created successfully",
		Data:    c.categoryToDTO(category),
	})
}

// UpdateCategory updates an existing category
// @Summary Update category
// @Description Update an existing article category
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Param category body dto.UpdateCategoryRequest true "Category data"
// @Success 200 {object} dto.APIResponse{data=dto.CategoryDTO}
// @Failure 400 {object} dto.APIResponse
// @Failure 404 {object} dto.APIResponse
// @Failure 500 {object} dto.APIResponse
// @Router /api/categories/{id} [put]
func (c *CategoryController) UpdateCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	var req dto.UpdateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	// Get existing category
	category, err := c.categoryService.GetCategoryByID(ctx, id)
	if err != nil {
		c.logger.Error("Failed to get category for update", zap.String("id", idStr), zap.Error(err))
		ctx.JSON(http.StatusNotFound, dto.APIResponse{
			Success: false,
			Message: "Category not found",
			Error:   err.Error(),
		})
		return
	}

	// Update fields
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}
	if req.Color != nil {
		category.Color = *req.Color
	}
	if req.Icon != nil {
		category.Icon = *req.Icon
	}

	if err := c.categoryService.UpdateCategory(ctx, category); err != nil {
		c.logger.Error("Failed to update category", zap.String("id", idStr), zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Message: "Failed to update category",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Message: "Category updated successfully",
		Data:    c.categoryToDTO(category),
	})
}

// DeleteCategory deletes a category
// @Summary Delete category
// @Description Delete a category by ID
// @Tags categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} dto.APIResponse
// @Failure 400 {object} dto.APIResponse
// @Failure 404 {object} dto.APIResponse
// @Failure 500 {object} dto.APIResponse
// @Router /api/categories/{id} [delete]
func (c *CategoryController) DeleteCategory(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, dto.APIResponse{
			Success: false,
			Message: "Invalid category ID",
			Error:   err.Error(),
		})
		return
	}

	if err := c.categoryService.DeleteCategory(ctx, id); err != nil {
		c.logger.Error("Failed to delete category", zap.String("id", idStr), zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, dto.APIResponse{
			Success: false,
			Message: "Failed to delete category",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, dto.APIResponse{
		Success: true,
		Message: "Category deleted successfully",
	})
}

// Helper methods

func (c *CategoryController) categoryToDTO(category *entities.ArticleCategory) *dto.CategoryDTO {
	return &dto.CategoryDTO{
		ID:          category.ID,
		Name:        category.Name,
		Description: category.Description,
		SortOrder:   category.SortOrder,
		IsActive:    category.IsActive,
		Color:       category.Color,
		Icon:        category.Icon,
		CreatedAt:   category.CreatedAt,
		UpdatedAt:   category.UpdatedAt,
	}
}
