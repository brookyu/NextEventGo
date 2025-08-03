package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// SimpleAttendeeController handles attendee management requests with simplified functionality
type SimpleAttendeeController struct {
	db     *gorm.DB
	logger *zap.Logger
}

// NewSimpleAttendeeController creates a new simple attendee controller
func NewSimpleAttendeeController(db *gorm.DB, logger *zap.Logger) *SimpleAttendeeController {
	return &SimpleAttendeeController{
		db:     db,
		logger: logger,
	}
}

// GetEventAttendees retrieves attendees for a specific event
func (c *SimpleAttendeeController) GetEventAttendees(ctx *gin.Context) {
	eventIDStr := ctx.Param("id")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid event ID"})
		return
	}

	var attendees []entities.EventAttendee
	if err := c.db.Where("EventId = ?", eventID).Find(&attendees).Error; err != nil {
		c.logger.Error("Failed to fetch attendees", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch attendees"})
		return
	}

	// Convert to response format
	var response []gin.H
	for _, attendee := range attendees {
		response = append(response, gin.H{
			"id":                        attendee.ID,
			"event_id":                  attendee.EventID,
			"mobile":                    attendee.Mobile,
			"on_site_scanned":           attendee.OnSiteScanned,
			"interaction_code_received": attendee.InteractionCodeReceived,
			"created_at":                attendee.CreatedAt,
			"updated_at":                attendee.UpdatedAt,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"attendees": response,
		"total":     len(response),
	})
}
