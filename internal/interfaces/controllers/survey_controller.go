package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
)

// SurveyController handles survey-related HTTP requests
type SurveyController struct {
	surveyService *services.SurveyService
	logger        *zap.Logger
}

// NewSurveyController creates a new survey controller
func NewSurveyController(surveyService *services.SurveyService, logger *zap.Logger) *SurveyController {
	return &SurveyController{
		surveyService: surveyService,
		logger:        logger,
	}
}

// GetSurveyList handles GET /api/v1/surveys
func (c *SurveyController) GetSurveyList(ctx *gin.Context) {
	// Parse query parameters
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	req := &dto.GetSurveyListRequest{
		Page:  page,
		Limit: limit,
	}

	// Optional filters
	if search := ctx.Query("search"); search != "" {
		req.Search = &search
	}
	if categoryId := ctx.Query("categoryId"); categoryId != "" {
		req.CategoryId = &categoryId
	}
	if formTypeStr := ctx.Query("formType"); formTypeStr != "" {
		if formType, err := strconv.Atoi(formTypeStr); err == nil {
			req.FormType = &formType
		}
	}
	if isOpenStr := ctx.Query("isOpen"); isOpenStr != "" {
		if isOpen, err := strconv.ParseBool(isOpenStr); err == nil {
			req.IsOpen = &isOpen
		}
	}
	if sortBy := ctx.Query("sortBy"); sortBy != "" {
		req.SortBy = &sortBy
	}
	if sortOrder := ctx.Query("sortOrder"); sortOrder != "" {
		req.SortOrder = &sortOrder
	}

	response, err := c.surveyService.GetSurveyList(ctx.Request.Context(), req)
	if err != nil {
		c.logger.Error("Failed to get survey list", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get survey list",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// GetSurvey handles GET /api/v1/surveys/:id
func (c *SurveyController) GetSurvey(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	response, err := c.surveyService.GetSurvey(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get survey", zap.Error(err), zap.String("surveyId", idStr))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get survey",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// GetSurveyWithQuestions handles GET /api/v1/surveys/:id/questions
func (c *SurveyController) GetSurveyWithQuestions(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	response, err := c.surveyService.GetSurveyWithQuestions(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get survey with questions", zap.Error(err), zap.String("surveyId", idStr))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get survey with questions",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// CreateSurvey handles POST /api/v1/surveys
func (c *SurveyController) CreateSurvey(ctx *gin.Context) {
	var req dto.CreateSurveyRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	response, err := c.surveyService.CreateSurvey(ctx.Request.Context(), &req)
	if err != nil {
		c.logger.Error("Failed to create survey", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create survey",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    response,
	})
}

// UpdateSurvey handles PUT /api/v1/surveys/:id
func (c *SurveyController) UpdateSurvey(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	var req dto.UpdateSurveyRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		c.logger.Error("Survey update JSON binding failed", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	response, err := c.surveyService.UpdateSurvey(ctx.Request.Context(), id, &req)
	if err != nil {
		c.logger.Error("Failed to update survey", zap.Error(err), zap.String("surveyId", idStr))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update survey",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// DeleteSurvey handles DELETE /api/v1/surveys/:id
func (c *SurveyController) DeleteSurvey(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	// Get deleterId from request body or context (user ID)
	var deleteReq struct {
		DeleterId uuid.UUID `json:"deleterId" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&deleteReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	err = c.surveyService.DeleteSurvey(ctx.Request.Context(), id, deleteReq.DeleterId)
	if err != nil {
		c.logger.Error("Failed to delete survey", zap.Error(err), zap.String("surveyId", idStr))
		if err.Error() == "survey not found or already deleted" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to delete survey",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Survey deleted successfully",
	})
}

// GetPublicSurvey handles GET /api/v1/public/surveys/:id (for public access)
func (c *SurveyController) GetPublicSurvey(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	response, err := c.surveyService.GetSurveyWithQuestions(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get public survey", zap.Error(err), zap.String("surveyId", idStr))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get survey",
		})
		return
	}

	// Only return public surveys
	if !response.Survey.IsOpen {
		ctx.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"error":   "Survey is not publicly accessible",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// Question Management Endpoints

// CreateQuestion handles POST /api/v1/surveys/:surveyId/questions
func (c *SurveyController) CreateQuestion(ctx *gin.Context) {
	surveyIdStr := ctx.Param("surveyId")
	surveyId, err := uuid.Parse(surveyIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	var req dto.CreateQuestionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		c.logger.Error("JSON binding failed", zap.Error(err))
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Set survey ID from URL parameter
	req.SurveyId = surveyId

	response, err := c.surveyService.CreateQuestion(ctx.Request.Context(), &req)
	if err != nil {
		c.logger.Error("Failed to create question", zap.Error(err))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create question",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    response,
	})
}

// UpdateQuestion handles PUT /api/v1/questions/:id
func (c *SurveyController) UpdateQuestion(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid question ID",
		})
		return
	}

	var req dto.UpdateQuestionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	response, err := c.surveyService.UpdateQuestion(ctx.Request.Context(), id, &req)
	if err != nil {
		c.logger.Error("Failed to update question", zap.Error(err), zap.String("questionId", idStr))
		if err.Error() == "question not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Question not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update question",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// DeleteQuestion handles DELETE /api/v1/questions/:id
func (c *SurveyController) DeleteQuestion(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid question ID",
		})
		return
	}

	// Get deleterId from request body or context (user ID)
	var deleteReq struct {
		DeleterId uuid.UUID `json:"deleterId" binding:"required"`
	}
	if err := ctx.ShouldBindJSON(&deleteReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	err = c.surveyService.DeleteQuestion(ctx.Request.Context(), id, deleteReq.DeleterId)
	if err != nil {
		c.logger.Error("Failed to delete question", zap.Error(err), zap.String("questionId", idStr))
		if err.Error() == "question not found or already deleted" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Question not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to delete question",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Question deleted successfully",
	})
}

// GetQuestion handles GET /api/v1/questions/:id
func (c *SurveyController) GetQuestion(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid question ID",
		})
		return
	}

	response, err := c.surveyService.GetQuestion(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get question", zap.Error(err), zap.String("questionId", idStr))
		if err.Error() == "question not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Question not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get question",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// UpdateQuestionOrder handles POST /api/v1/surveys/:surveyId/questions/reorder
func (c *SurveyController) UpdateQuestionOrder(ctx *gin.Context) {
	surveyIdStr := ctx.Param("surveyId")
	surveyId, err := uuid.Parse(surveyIdStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid survey ID",
		})
		return
	}

	var req dto.UpdateQuestionOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body: " + err.Error(),
		})
		return
	}

	// Set survey ID from URL parameter
	req.SurveyId = surveyId

	response, err := c.surveyService.UpdateQuestionOrder(ctx.Request.Context(), &req)
	if err != nil {
		c.logger.Error("Failed to update question order", zap.Error(err), zap.String("surveyId", surveyIdStr))
		if err.Error() == "survey not found" {
			ctx.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Survey not found",
			})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update question order",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}
