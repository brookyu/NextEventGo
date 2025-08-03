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

// Helper function to safely get time value from pointer
func getTimeValue(t *time.Time) time.Time {
	if t == nil {
		return time.Time{}
	}
	return *t
}

// EventController handles event management requests
type EventController struct {
	eventService    services.EventService
	attendeeService services.AttendeeService
	qrCodeService   services.QRCodeService
	logger          *zap.Logger
}

// NewEventController creates a new event controller
func NewEventController(
	eventService services.EventService,
	attendeeService services.AttendeeService,
	qrCodeService services.QRCodeService,
	logger *zap.Logger,
) *EventController {
	return &EventController{
		eventService:    eventService,
		attendeeService: attendeeService,
		qrCodeService:   qrCodeService,
		logger:          logger,
	}
}

// CreateEvent creates a new event
func (c *EventController) CreateEvent(ctx *gin.Context) {
	var req CreateEventRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	event := &entities.SiteEvent{
		EventTitle:      req.EventTitle,
		EventStartDate:  req.EventStartDate,
		EventEndDate:    req.EventEndDate,
		TagName:         req.TagName,
		UserTagID:       req.UserTagID,
		InteractionCode: req.InteractionCode,
		ScanMessage:     req.ScanMessage,
		IsCurrent:       req.IsCurrent,
	}

	if err := c.eventService.CreateEvent(ctx.Request.Context(), event); err != nil {
		c.logger.Error("Failed to create event", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"data": EventResponse{
			ID:              event.ID,
			EventTitle:      event.EventTitle,
			EventStartDate:  event.EventStartDate,
			EventEndDate:    event.EventEndDate,
			TagName:         event.TagName,
			UserTagID:       event.UserTagID,
			InteractionCode: event.InteractionCode,
			ScanMessage:     event.ScanMessage,
			IsCurrent:       event.IsCurrent,
			CreatedAt:       event.CreatedAt,
			UpdatedAt:       getTimeValue(event.UpdatedAt),
		},
	})
}

// GetEvent retrieves an event by ID
func (c *EventController) GetEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	event, err := c.eventService.GetEventByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": EventResponse{
			ID:              event.ID,
			EventTitle:      event.EventTitle,
			EventStartDate:  event.EventStartDate,
			EventEndDate:    event.EventEndDate,
			TagName:         event.TagName,
			UserTagID:       event.UserTagID,
			InteractionCode: event.InteractionCode,
			ScanMessage:     event.ScanMessage,
			IsCurrent:       event.IsCurrent,
			CreatedAt:       event.CreatedAt,
			UpdatedAt:       getTimeValue(event.UpdatedAt),
		},
	})
}

// GetCurrentEvent retrieves the current active event
func (c *EventController) GetCurrentEvent(ctx *gin.Context) {
	event, err := c.eventService.GetCurrentEvent(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "No current event found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": EventResponse{
			ID:              event.ID,
			EventTitle:      event.EventTitle,
			EventStartDate:  event.EventStartDate,
			EventEndDate:    event.EventEndDate,
			TagName:         event.TagName,
			UserTagID:       event.UserTagID,
			InteractionCode: event.InteractionCode,
			ScanMessage:     event.ScanMessage,
			IsCurrent:       event.IsCurrent,
			CreatedAt:       event.CreatedAt,
			UpdatedAt:       getTimeValue(event.UpdatedAt),
		},
	})
}

// GetEvents retrieves all events with pagination
func (c *EventController) GetEvents(ctx *gin.Context) {
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "20"))

	events, err := c.eventService.GetAllEvents(ctx.Request.Context(), offset, limit)
	if err != nil {
		c.logger.Error("Failed to get events", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve events"})
		return
	}

	var response []EventResponse
	for _, event := range events {
		response = append(response, EventResponse{
			ID:              event.ID,
			EventTitle:      event.EventTitle,
			EventStartDate:  event.EventStartDate,
			EventEndDate:    event.EventEndDate,
			TagName:         event.TagName,
			UserTagID:       event.UserTagID,
			InteractionCode: event.InteractionCode,
			ScanMessage:     event.ScanMessage,
			IsCurrent:       event.IsCurrent,
			CreatedAt:       event.CreatedAt,
			UpdatedAt:       getTimeValue(event.UpdatedAt),
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"events": response,
			"pagination": gin.H{
				"offset": offset,
				"limit":  limit,
				"count":  len(response),
				"total":  len(response), // Add total field that frontend expects
			},
		},
	})
}

// UpdateEvent updates an existing event
func (c *EventController) UpdateEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var req UpdateEventRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Get existing event
	event, err := c.eventService.GetEventByID(ctx.Request.Context(), id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	// Update fields
	if req.EventTitle != nil {
		event.EventTitle = *req.EventTitle
	}
	if req.EventStartDate != nil {
		event.EventStartDate = *req.EventStartDate
	}
	if req.EventEndDate != nil {
		event.EventEndDate = *req.EventEndDate
	}
	if req.TagName != nil {
		event.TagName = *req.TagName
	}
	if req.ScanMessage != nil {
		event.ScanMessage = *req.ScanMessage
	}
	if req.IsCurrent != nil {
		event.IsCurrent = *req.IsCurrent
	}

	if err := c.eventService.UpdateEvent(ctx.Request.Context(), event); err != nil {
		c.logger.Error("Failed to update event", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	ctx.JSON(http.StatusOK, EventResponse{
		ID:              event.ID,
		EventTitle:      event.EventTitle,
		EventStartDate:  event.EventStartDate,
		EventEndDate:    event.EventEndDate,
		TagName:         event.TagName,
		UserTagID:       event.UserTagID,
		InteractionCode: event.InteractionCode,
		ScanMessage:     event.ScanMessage,
		IsCurrent:       event.IsCurrent,
		CreatedAt:       event.CreatedAt,
		UpdatedAt:       getTimeValue(event.UpdatedAt),
	})
}

// DeleteEvent deletes an event
func (c *EventController) DeleteEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	if err := c.eventService.DeleteEvent(ctx.Request.Context(), id); err != nil {
		c.logger.Error("Failed to delete event", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}

// SetCurrentEvent sets an event as current
func (c *EventController) SetCurrentEvent(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	if err := c.eventService.SetCurrentEvent(ctx.Request.Context(), id); err != nil {
		c.logger.Error("Failed to set current event", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set current event"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Current event set successfully"})
}

// GetEventStatistics retrieves event statistics
func (c *EventController) GetEventStatistics(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	stats, err := c.eventService.GetEventStatistics(ctx.Request.Context(), id)
	if err != nil {
		c.logger.Error("Failed to get event statistics", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve statistics"})
		return
	}

	ctx.JSON(http.StatusOK, stats)
}

// Request/Response DTOs
type CreateEventRequest struct {
	EventTitle      string    `json:"eventTitle" binding:"required"`
	EventStartDate  time.Time `json:"eventStartDate" binding:"required"`
	EventEndDate    time.Time `json:"eventEndDate" binding:"required"`
	TagName         string    `json:"tagName"`
	UserTagID       int       `json:"userTagId"`
	InteractionCode string    `json:"interactionCode"`
	ScanMessage     string    `json:"scanMessage"`
	IsCurrent       bool      `json:"isCurrent"`
}

type UpdateEventRequest struct {
	EventTitle     *string    `json:"eventTitle"`
	EventStartDate *time.Time `json:"eventStartDate"`
	EventEndDate   *time.Time `json:"eventEndDate"`
	TagName        *string    `json:"tagName"`
	ScanMessage    *string    `json:"scanMessage"`
	IsCurrent      *bool      `json:"isCurrent"`
}

type EventResponse struct {
	ID              uuid.UUID `json:"id"`
	EventTitle      string    `json:"eventTitle"`
	EventStartDate  time.Time `json:"eventStartDate"`
	EventEndDate    time.Time `json:"eventEndDate"`
	TagName         string    `json:"tagName"`
	UserTagID       int       `json:"userTagId"`
	InteractionCode string    `json:"interactionCode"`
	ScanMessage     string    `json:"scanMessage"`
	IsCurrent       bool      `json:"isCurrent"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}
