package simple

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// HealthHandler handles health check requests
type HealthHandler struct {
	db *gorm.DB
}

// NewHealthHandler creates a new health handler
func NewHealthHandler(db *gorm.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// CheckHealth handles GET /health
func (h *HealthHandler) CheckHealth(c *gin.Context) {
	status := "ok"
	dbStatus := "disconnected"

	if h.db != nil {
		sqlDB, err := h.db.DB()
		if err == nil && sqlDB.Ping() == nil {
			dbStatus = "connected"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    status,
		"database":  dbStatus,
		"timestamp": fmt.Sprintf("%d", gin.H{}),
	})
}

// ImageHandler handles image-related requests
type ImageHandler struct {
	db *gorm.DB
}

// NewImageHandler creates a new image handler
func NewImageHandler(db *gorm.DB) *ImageHandler {
	return &ImageHandler{db: db}
}

// GetImageStats handles GET /api/v2/images/stats
func (h *ImageHandler) GetImageStats(c *gin.Context) {
	if h.db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not connected"})
		return
	}

	// Get category filter if provided
	categoryParam := c.Query("category")

	// Base query for total count
	var totalCount int64
	countQuery := h.db.Table("SiteImages").Where("IsDeleted = 0")
	if categoryParam != "" {
		countQuery = countQuery.Where("CategoryId = ?", categoryParam)
	}
	countQuery.Count(&totalCount)

	// Get this month's count
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	var thisMonthCount int64
	monthQuery := h.db.Table("SiteImages").Where("IsDeleted = 0 AND CreationTime >= ? AND CreationTime < ?", startOfMonth, endOfMonth)
	if categoryParam != "" {
		monthQuery = monthQuery.Where("CategoryId = ?", categoryParam)
	}
	monthQuery.Count(&thisMonthCount)

	// Get total categories count
	var categoriesCount int64
	h.db.Table("Categories").Where("IsDeleted = 0 AND ResourceType = 3").Count(&categoriesCount)

	c.JSON(http.StatusOK, gin.H{
		"total_images":     totalCount,
		"this_month":       thisMonthCount,
		"total_categories": categoriesCount,
		"total_views":      0, // TODO: Implement view tracking
	})
}

// GetImages handles GET /api/v2/images
func (h *ImageHandler) GetImages(c *gin.Context) {
	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")
	categoryId := c.Query("category") // Optional category filter

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 1000 {
		limit = 1000 // Max limit to prevent performance issues
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Test database connection
	if h.db == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database not connected"})
		return
	}

	// Build query
	query := h.db.Table("SiteImages").Where("IsDeleted = 0")
	if categoryId != "" {
		query = query.Where("CategoryId = ?", categoryId)
	}

	// Get total count for pagination
	var totalCount int64
	query.Count(&totalCount)

	// Get images with pagination
	var images []map[string]interface{}
	result := query.Select("Id, Title, Description, FileName, FilePath, CategoryId, CreationTime, ModificationTime").
		Order("CreationTime DESC").
		Limit(limit).
		Offset(offset).
		Find(&images)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch images"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"images": images,
		"pagination": gin.H{
			"total":  totalCount,
			"limit":  limit,
			"offset": offset,
		},
	})
}
