package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
	"github.com/zenteam/nextevent-go/pkg/utils"
)

// SiteEventController handles HTTP requests for site event management
type SiteEventController struct {
	eventService *services.SiteEventService
	logger       *zap.Logger
}

// NewSiteEventController creates a new site event controller
func NewSiteEventController(eventService *services.SiteEventService, logger *zap.Logger) *SiteEventController {
	return &SiteEventController{
		eventService: eventService,
		logger:       logger,
	}
}

// GetSiteEvents handles GET /api/v2/events - List events with filtering
// @Summary List site events
// @Description Get a paginated list of site events with filtering options
// @Tags events
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param pageSize query int false "Page size" default(20)
// @Param categoryId query string false "Category ID filter"
// @Param searchTerm query string false "Search term for title/tags"
// @Param status query string false "Event status filter" Enums(upcoming, active, completed, cancelled)
// @Param isCurrent query bool false "Filter by current status"
// @Param startDateFrom query string false "Start date from filter (ISO 8601)"
// @Param startDateTo query string false "Start date to filter (ISO 8601)"
// @Param sortBy query string false "Sort field" Enums(title, startDate, endDate, createdAt) default(createdAt)
// @Param sortOrder query string false "Sort order" Enums(asc, desc) default(desc)
// @Success 200 {object} utils.StandardResponse{data=dto.EventListResponse}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events [get]
func (c *SiteEventController) GetSiteEvents(ctx *gin.Context) {
	// Parse query parameters
	input := &dto.GetSiteEventsListDto{}

	// Parse pagination
	if page := ctx.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			input.Page = p
		}
	}
	if pageSize := ctx.Query("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			input.PageSize = ps
		}
	}

	// Parse filters
	input.SearchTerm = ctx.Query("searchTerm")
	input.Status = ctx.Query("status")
	input.SortBy = ctx.Query("sortBy")
	input.SortOrder = ctx.Query("sortOrder")

	// Parse category ID
	if categoryIdStr := ctx.Query("categoryId"); categoryIdStr != "" {
		if categoryId, err := uuid.Parse(categoryIdStr); err == nil {
			input.CategoryID = &categoryId
		}
	}

	// Parse isCurrent
	if isCurrentStr := ctx.Query("isCurrent"); isCurrentStr != "" {
		if isCurrent, err := strconv.ParseBool(isCurrentStr); err == nil {
			input.IsCurrent = &isCurrent
		}
	}

	// Parse date filters
	if startDateFromStr := ctx.Query("startDateFrom"); startDateFromStr != "" {
		if startDateFrom, err := time.Parse(time.RFC3339, startDateFromStr); err == nil {
			input.StartDateFrom = &startDateFrom
		}
	}
	if startDateToStr := ctx.Query("startDateTo"); startDateToStr != "" {
		if startDateTo, err := time.Parse(time.RFC3339, startDateToStr); err == nil {
			input.StartDateTo = &startDateTo
		}
	}

	// Call service
	result, err := c.eventService.GetSiteEventsAsync(ctx.Request.Context(), input)
	if err != nil {
		c.logger.Error("Failed to get site events", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to get events", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Events retrieved successfully", result)
}

// GetSiteEvent handles GET /api/v2/events/:id - Get single event
// @Summary Get site event by ID
// @Description Get a single site event by its ID
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} utils.StandardResponse{data=dto.SiteEventDto}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/{id} [get]
func (c *SiteEventController) GetSiteEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	// For basic get, we can use the editing endpoint and convert
	event, err := c.eventService.GetSiteEventForEditingAsync(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get site event", zap.Error(err), zap.String("id", id.String()))
		utils.ErrorResponse(ctx, http.StatusNotFound, "Event not found", err)
		return
	}

	// Convert to basic DTO
	eventDto := dto.SiteEventDto{
		ID:             event.ID,
		EventTitle:     event.EventTitle,
		EventStartDate: event.EventStartDate,
		EventEndDate:   event.EventEndDate,
		CreatedAt:      time.Now(), // This should come from the entity
		CategoryID:     event.CategoryID,
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Event retrieved successfully", eventDto)
}

// GetSiteEventForEditing handles GET /api/v2/events/:id/for-editing - Get event for editing
// @Summary Get site event for editing
// @Description Get a site event with all associated resource information for editing
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} utils.StandardResponse{data=dto.SiteEventForEditingDto}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/{id}/for-editing [get]
func (c *SiteEventController) GetSiteEventForEditing(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	event, err := c.eventService.GetSiteEventForEditingAsync(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get site event for editing", zap.Error(err), zap.String("id", id.String()))
		utils.ErrorResponse(ctx, http.StatusNotFound, "Event not found", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Event retrieved for editing successfully", event)
}

// CreateSiteEvent handles POST /api/v2/events - Create new event
// @Summary Create site event
// @Description Create a new site event
// @Tags events
// @Accept json
// @Produce json
// @Param event body dto.CreateUpdateSiteEventDto true "Event data"
// @Success 201 {object} utils.StandardResponse{data=dto.SiteEventDto}
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events [post]
func (c *SiteEventController) CreateSiteEvent(ctx *gin.Context) {
	var input dto.CreateUpdateSiteEventDto
	if err := ctx.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	event, err := c.eventService.CreateAsync(ctx.Request.Context(), &input)
	if err != nil {
		c.logger.Error("Failed to create site event", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to create event", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusCreated, "Event created successfully", event)
}

// UpdateSiteEvent handles PUT /api/v2/events/:id - Update event
// @Summary Update site event
// @Description Update an existing site event
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Param event body dto.CreateUpdateSiteEventDto true "Event data"
// @Success 200 {object} utils.StandardResponse{data=dto.SiteEventDto}
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/{id} [put]
func (c *SiteEventController) UpdateSiteEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	var input dto.CreateUpdateSiteEventDto
	if err := ctx.ShouldBindJSON(&input); err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	// Set the ID from the URL
	input.ID = id

	event, err := c.eventService.UpdateAsync(ctx.Request.Context(), &input)
	if err != nil {
		c.logger.Error("Failed to update site event", zap.Error(err), zap.String("id", id.String()))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to update event", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Event updated successfully", event)
}

// DeleteSiteEvent handles DELETE /api/v2/events/:id - Delete event
// @Summary Delete site event
// @Description Soft delete a site event
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/{id} [delete]
func (c *SiteEventController) DeleteSiteEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	input := &dto.DeleteEventInputDto{ID: id}
	err = c.eventService.DeleteAsync(ctx.Request.Context(), input)
	if err != nil {
		c.logger.Error("Failed to delete site event", zap.Error(err), zap.String("id", id.String()))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to delete event", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Event deleted successfully", nil)
}

// ToggleCurrentEvent handles POST /api/v2/events/:id/toggle-current - Toggle current status
// @Summary Toggle current event status
// @Description Set an event as the current active event
// @Tags events
// @Accept json
// @Produce json
// @Param id path string true "Event ID"
// @Success 200 {object} utils.StandardResponse
// @Failure 400 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/{id}/toggle-current [post]
func (c *SiteEventController) ToggleCurrentEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		utils.ErrorResponse(ctx, http.StatusBadRequest, "Invalid event ID", err)
		return
	}

	input := &dto.ToggleCurrentInput{ID: id}
	err = c.eventService.ToggleCurrentAsync(ctx.Request.Context(), input)
	if err != nil {
		c.logger.Error("Failed to toggle current event", zap.Error(err), zap.String("id", id.String()))
		utils.ErrorResponse(ctx, http.StatusInternalServerError, "Failed to toggle current event", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Current event status updated successfully", nil)
}

// GetCurrentEvent handles GET /api/v2/events/current - Get current event
// @Summary Get current active event
// @Description Get the currently active event
// @Tags events
// @Accept json
// @Produce json
// @Success 200 {object} utils.StandardResponse{data=dto.SiteEventDto}
// @Failure 404 {object} utils.StandardResponse
// @Failure 500 {object} utils.StandardResponse
// @Router /api/v2/events/current [get]
func (c *SiteEventController) GetCurrentEvent(ctx *gin.Context) {
	event, err := c.eventService.GetCurrentEvent(ctx.Request.Context())
	if err != nil {
		c.logger.Error("Failed to get current event", zap.Error(err))
		utils.ErrorResponse(ctx, http.StatusNotFound, "No current event found", err)
		return
	}

	utils.SuccessResponse(ctx, http.StatusOK, "Current event retrieved successfully", event)
}
