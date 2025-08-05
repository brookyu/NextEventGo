package simple

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CloudVideoHandlers handles CloudVideo management operations
type CloudVideoHandlers struct {
	db *gorm.DB
}

// NewCloudVideoHandlers creates a new CloudVideoHandlers instance
func NewCloudVideoHandlers(db *gorm.DB) *CloudVideoHandlers {
	return &CloudVideoHandlers{db: db}
}

// CloudVideoResponse represents a CloudVideo with all bound resources
type CloudVideoResponse struct {
	ID                   string    `json:"id"`
	Title                string    `json:"title"`
	Summary              string    `json:"summary"`
	VideoType            int       `json:"videoType"`
	Status               string    `json:"status"`
	IsOpen               bool      `json:"isOpen"`
	RequireAuth          bool      `json:"requireAuth"`
	SupportInteraction   bool      `json:"supportInteraction"`
	AllowDownload        bool      `json:"allowDownload"`
	EnableComments       bool      `json:"enableComments"`
	EnableLikes          bool      `json:"enableLikes"`
	EnableSharing        bool      `json:"enableSharing"`
	EnableAnalytics      bool      `json:"enableAnalytics"`
	ViewCount            int64     `json:"viewCount"`
	LikeCount            int64     `json:"likeCount"`
	ShareCount           int64     `json:"shareCount"`
	CommentCount         int64     `json:"commentCount"`
	WatchTime            int64     `json:"watchTime"`
	CreationTime         time.Time `json:"creationTime"`
	LastModificationTime time.Time `json:"lastModificationTime"`

	// Bound Resources
	UploadedVideo  *VideoUploadInfo `json:"uploadedVideo,omitempty"`
	CoverImage     *SiteImageInfo   `json:"coverImage,omitempty"`
	PromotionImage *SiteImageInfo   `json:"promotionImage,omitempty"`
	ThumbnailImage *SiteImageInfo   `json:"thumbnailImage,omitempty"`
	IntroArticle   *SiteArticleInfo `json:"introArticle,omitempty"`
	NotOpenArticle *SiteArticleInfo `json:"notOpenArticle,omitempty"`
	Survey         *SurveyInfo      `json:"survey,omitempty"`
	Category       *CategoryInfo    `json:"category,omitempty"`
	BoundEvent     *SiteEventInfo   `json:"boundEvent,omitempty"`

	// Live Streaming Info (for VideoType = 1)
	StreamKey    string     `json:"streamKey,omitempty"`
	CloudUrl     string     `json:"cloudUrl,omitempty"`
	PlaybackUrl  string     `json:"playbackUrl,omitempty"`
	StartTime    *time.Time `json:"startTime,omitempty"`
	VideoEndTime *time.Time `json:"videoEndTime,omitempty"`
}

// Resource info structures
type VideoUploadInfo struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	PlaybackUrl string `json:"playbackUrl"`
	CoverUrl    string `json:"coverUrl"`
	Duration    int    `json:"duration"`
	Size        int64  `json:"size"`
	Format      string `json:"format"`
	Status      string `json:"status"`
}

type SiteImageInfo struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Url      string `json:"url"`
	FilePath string `json:"filePath"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
}

type SiteArticleInfo struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Summary      string    `json:"summary"`
	Content      string    `json:"content,omitempty"` // Only include in detailed view
	CreationTime time.Time `json:"creationTime"`
	IsPublished  bool      `json:"isPublished"`
}

type SurveyInfo struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	QuestionCount int       `json:"questionCount"`
	IsActive      bool      `json:"isActive"`
	CreationTime  time.Time `json:"creationTime"`
}

type CategoryInfo struct {
	ID    string `json:"id"`
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

type SiteEventInfo struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	EventStartDate time.Time `json:"eventStartDate"`
	EventEndDate   time.Time `json:"eventEndDate"`
	IsActive       bool      `json:"isActive"`
}

// CloudVideoCreateRequest represents a request to create a CloudVideo
type CloudVideoCreateRequest struct {
	Title              string `json:"title" binding:"required"`
	Summary            string `json:"summary"`
	VideoType          int    `json:"videoType"` // 0=basic, 1=uploaded, 2=live
	IsOpen             bool   `json:"isOpen"`
	RequireAuth        bool   `json:"requireAuth"`
	SupportInteraction bool   `json:"supportInteraction"`
	AllowDownload      bool   `json:"allowDownload"`
	EnableComments     bool   `json:"enableComments"`
	EnableLikes        bool   `json:"enableLikes"`
	EnableSharing      bool   `json:"enableSharing"`
	EnableAnalytics    bool   `json:"enableAnalytics"`

	// Resource Bindings (UUIDs)
	UploadId         *string `json:"uploadId,omitempty"`
	SiteImageId      *string `json:"siteImageId,omitempty"`
	PromotionPicId   *string `json:"promotionPicId,omitempty"`
	ThumbnailId      *string `json:"thumbnailId,omitempty"`
	IntroArticleId   *string `json:"introArticleId,omitempty"`
	NotOpenArticleId *string `json:"notOpenArticleId,omitempty"`
	SurveyId         *string `json:"surveyId,omitempty"`
	CategoryId       *string `json:"categoryId,omitempty"`
	BoundEventId     *string `json:"boundEventId,omitempty"`

	// Live Streaming (for VideoType = 2)
	ScheduledStartTime *time.Time `json:"scheduledStartTime,omitempty"`
	VideoEndTime       *time.Time `json:"videoEndTime,omitempty"`
}

// GetCloudVideos returns list of CloudVideos with bound resources
func (h *CloudVideoHandlers) GetCloudVideos(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	// Get query parameters
	search := c.Query("search")
	categoryId := c.Query("categoryId")
	videoType := c.Query("videoType")
	status := c.Query("status")
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	// Parse pagination
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	// Build base query
	query := h.db.Table("CloudVideos").Where("CloudVideos.IsDeleted = 0")

	// Apply filters
	if search != "" {
		query = query.Where("(CloudVideos.Title LIKE ? OR CloudVideos.Summary LIKE ?)", "%"+search+"%", "%"+search+"%")
	}
	if categoryId != "" {
		query = query.Where("CloudVideos.CategoryId = ?", categoryId)
	}
	if videoType != "" {
		query = query.Where("CloudVideos.VideoType = ?", videoType)
	}
	if status != "" {
		query = query.Where("CloudVideos.Status = ?", status)
	}

	// Get total count
	var totalCount int64
	countQuery := query
	if err := countQuery.Count(&totalCount).Error; err != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to count CloudVideos",
			"message": err.Error(),
		})
		return
	}

	// Get CloudVideos with basic info
	var rawCloudVideos []map[string]interface{}
	result := query.
		Select("CloudVideos.*").
		Order("CloudVideos.CreationTime DESC").
		Limit(limit).
		Offset(offset).
		Find(&rawCloudVideos)

	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Database query failed",
			"message": result.Error.Error(),
		})
		return
	}

	// Convert to response format with bound resources
	cloudVideos := make([]CloudVideoResponse, len(rawCloudVideos))
	for i, rawVideo := range rawCloudVideos {
		cloudVideo := h.convertToCloudVideoResponse(rawVideo)

		// Load bound resources
		h.loadBoundResources(&cloudVideo)

		cloudVideos[i] = cloudVideo
	}

	c.JSON(200, gin.H{
		"data":       cloudVideos,
		"count":      len(cloudVideos),
		"totalCount": totalCount,
		"limit":      limit,
		"offset":     offset,
		"message":    "CloudVideos retrieved successfully",
	})
}

// GetCloudVideo returns a single CloudVideo with all bound resources
func (h *CloudVideoHandlers) GetCloudVideo(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	cloudVideoId := c.Param("id")
	if cloudVideoId == "" {
		c.JSON(400, gin.H{
			"error":   "Missing CloudVideo ID",
			"message": "CloudVideo ID is required",
		})
		return
	}

	// Get CloudVideo
	var rawVideo map[string]interface{}
	result := h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ? AND IsDeleted = 0", cloudVideoId).
		Scan(&rawVideo)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{
				"error":   "CloudVideo not found",
				"message": "No CloudVideo found with the provided ID",
			})
		} else {
			c.JSON(500, gin.H{
				"error":   "Database query failed",
				"message": result.Error.Error(),
			})
		}
		return
	}

	// Convert to response format
	cloudVideo := h.convertToCloudVideoResponse(rawVideo)

	// Load all bound resources with detailed info
	h.loadBoundResourcesDetailed(&cloudVideo)

	c.JSON(200, gin.H{
		"data":    cloudVideo,
		"message": "CloudVideo retrieved successfully",
	})
}

// CreateCloudVideo creates a new CloudVideo with resource bindings
func (h *CloudVideoHandlers) CreateCloudVideo(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	var req CloudVideoCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Validate request
	if err := h.validateCreateRequest(req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	// Generate new ID
	newId := uuid.New().String()

	// Prepare CloudVideo data
	cloudVideoData := map[string]interface{}{
		"Id":                   newId,
		"Title":                req.Title,
		"Summary":              req.Summary,
		"VideoType":            req.VideoType,
		"Status":               "draft",
		"IsOpen":               req.IsOpen,
		"RequireAuth":          req.RequireAuth,
		"SupportInteraction":   req.SupportInteraction,
		"AllowDownload":        req.AllowDownload,
		"EnableComments":       req.EnableComments,
		"EnableLikes":          req.EnableLikes,
		"EnableSharing":        req.EnableSharing,
		"EnableAnalytics":      req.EnableAnalytics,
		"ViewCount":            0,
		"LikeCount":            0,
		"ShareCount":           0,
		"CommentCount":         0,
		"WatchTime":            0,
		"CreationTime":         time.Now(),
		"LastModificationTime": time.Now(),
		"IsDeleted":            false,
		"AuthorizeType":        0,
		"ReadCount":            0,
	}

	// Set resource bindings (use empty GUID for null values to match existing data pattern)
	emptyGuid := "00000000-0000-0000-0000-000000000000"

	cloudVideoData["UploadId"] = h.getValueOrEmpty(req.UploadId, emptyGuid)
	cloudVideoData["SiteImageId"] = h.getValueOrEmpty(req.SiteImageId, emptyGuid)
	cloudVideoData["PromotionPicId"] = h.getValueOrEmpty(req.PromotionPicId, emptyGuid)
	cloudVideoData["ThumbnailId"] = h.getValueOrEmpty(req.ThumbnailId, emptyGuid)
	cloudVideoData["IntroArticleId"] = h.getValueOrEmpty(req.IntroArticleId, emptyGuid)
	cloudVideoData["NotOpenArticleId"] = h.getValueOrEmpty(req.NotOpenArticleId, emptyGuid)
	cloudVideoData["SurveyId"] = h.getValueOrEmpty(req.SurveyId, emptyGuid)
	cloudVideoData["CategoryId"] = h.getValueOrEmpty(req.CategoryId, "b33633e9-853d-4ae8-a02d-cde85acf4db9") // Default category
	cloudVideoData["BoundEventId"] = req.BoundEventId                                                        // Can be null

	// Handle live streaming configuration
	if req.VideoType == 2 { // Live video
		if err := h.configureLiveStreaming(cloudVideoData, req); err != nil {
			c.JSON(500, gin.H{
				"error":   "Failed to configure live streaming",
				"message": err.Error(),
			})
			return
		}
	}

	// Create CloudVideo in database
	result := h.db.Table("CloudVideos").Create(&cloudVideoData)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to create CloudVideo",
			"message": result.Error.Error(),
		})
		return
	}

	// Return created CloudVideo with bound resources
	cloudVideo := h.convertToCloudVideoResponse(cloudVideoData)
	h.loadBoundResources(&cloudVideo)

	c.JSON(201, gin.H{
		"data":    cloudVideo,
		"message": "CloudVideo created successfully",
	})
}

// Helper methods

// convertToCloudVideoResponse converts raw database data to CloudVideoResponse
func (h *CloudVideoHandlers) convertToCloudVideoResponse(rawVideo map[string]interface{}) CloudVideoResponse {
	response := CloudVideoResponse{
		ID:                   h.getString(rawVideo, "Id"),
		Title:                h.getString(rawVideo, "Title"),
		Summary:              h.getString(rawVideo, "Summary"),
		VideoType:            h.getInt(rawVideo, "VideoType"),
		Status:               h.getString(rawVideo, "Status"),
		IsOpen:               h.getBool(rawVideo, "IsOpen"),
		RequireAuth:          h.getBool(rawVideo, "RequireAuth"),
		SupportInteraction:   h.getBool(rawVideo, "SupportInteraction"),
		AllowDownload:        h.getBool(rawVideo, "AllowDownload"),
		EnableComments:       h.getBool(rawVideo, "EnableComments"),
		EnableLikes:          h.getBool(rawVideo, "EnableLikes"),
		EnableSharing:        h.getBool(rawVideo, "EnableSharing"),
		EnableAnalytics:      h.getBool(rawVideo, "EnableAnalytics"),
		ViewCount:            h.getInt64(rawVideo, "ViewCount"),
		LikeCount:            h.getInt64(rawVideo, "LikeCount"),
		ShareCount:           h.getInt64(rawVideo, "ShareCount"),
		CommentCount:         h.getInt64(rawVideo, "CommentCount"),
		WatchTime:            h.getInt64(rawVideo, "WatchTime"),
		CreationTime:         h.getTime(rawVideo, "CreationTime"),
		LastModificationTime: h.getTime(rawVideo, "LastModificationTime"),
		StreamKey:            h.getString(rawVideo, "StreamKey"),
		CloudUrl:             h.getString(rawVideo, "CloudUrl"),
		PlaybackUrl:          h.getString(rawVideo, "PlaybackUrl"),
		StartTime:            h.getTimePtr(rawVideo, "StartTime"),
		VideoEndTime:         h.getTimePtr(rawVideo, "VideoEndTime"),
	}
	return response
}

// loadBoundResources loads basic info for bound resources
func (h *CloudVideoHandlers) loadBoundResources(cloudVideo *CloudVideoResponse) {
	// This will load basic resource info for list view
	h.loadBoundResourcesDetailed(cloudVideo)
}

// loadBoundResourcesDetailed loads detailed info for bound resources
func (h *CloudVideoHandlers) loadBoundResourcesDetailed(cloudVideo *CloudVideoResponse) {
	// Get the CloudVideo record to access foreign keys
	var rawVideo map[string]interface{}
	h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ?", cloudVideo.ID).Scan(&rawVideo)

	// Load uploaded video info
	if uploadId := h.getString(rawVideo, "UploadId"); uploadId != "" && uploadId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.UploadedVideo = h.loadVideoUploadInfo(uploadId)
	}

	// Load cover image info
	if imageId := h.getString(rawVideo, "SiteImageId"); imageId != "" && imageId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.CoverImage = h.loadSiteImageInfo(imageId)
	}

	// Load promotion image info
	if imageId := h.getString(rawVideo, "PromotionPicId"); imageId != "" && imageId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.PromotionImage = h.loadSiteImageInfo(imageId)
	}

	// Load thumbnail info
	if imageId := h.getString(rawVideo, "ThumbnailId"); imageId != "" && imageId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.ThumbnailImage = h.loadSiteImageInfo(imageId)
	}

	// Load intro article info
	if articleId := h.getString(rawVideo, "IntroArticleId"); articleId != "" && articleId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.IntroArticle = h.loadSiteArticleInfo(articleId, false) // Basic info for list
	}

	// Load not open article info
	if articleId := h.getString(rawVideo, "NotOpenArticleId"); articleId != "" && articleId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.NotOpenArticle = h.loadSiteArticleInfo(articleId, false)
	}

	// Load survey info
	if surveyId := h.getString(rawVideo, "SurveyId"); surveyId != "" && surveyId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.Survey = h.loadSurveyInfo(surveyId)
	}

	// Load category info
	if categoryId := h.getString(rawVideo, "CategoryId"); categoryId != "" && categoryId != "00000000-0000-0000-0000-000000000000" {
		cloudVideo.Category = h.loadCategoryInfo(categoryId)
	}

	// Load bound event info
	if eventId := h.getString(rawVideo, "BoundEventId"); eventId != "" {
		cloudVideo.BoundEvent = h.loadSiteEventInfo(eventId)
	}
}

// validateCreateRequest validates the CloudVideo create request
func (h *CloudVideoHandlers) validateCreateRequest(req CloudVideoCreateRequest) error {
	if req.Title == "" {
		return fmt.Errorf("title is required")
	}
	// Handle migration: convert old Basic Package (0) to appropriate type
	if req.VideoType == 0 {
		// Smart migration: if has live streaming time, make it Live (2), otherwise Uploaded (1)
		if req.VideoEndTime != nil {
			req.VideoType = 2 // Live Streaming
		} else {
			req.VideoType = 1 // Uploaded Video
		}
	}
	if req.VideoType < 1 || req.VideoType > 2 {
		return fmt.Errorf("invalid video type, must be 1 (uploaded) or 2 (live)")
	}
	if req.VideoType == 1 && (req.UploadId == nil || *req.UploadId == "") {
		return fmt.Errorf("uploadId is required for uploaded video type")
	}
	return nil
}

// getValueOrEmpty returns the value if not nil, otherwise returns the empty value
func (h *CloudVideoHandlers) getValueOrEmpty(value *string, emptyValue string) string {
	if value != nil && *value != "" {
		return *value
	}
	return emptyValue
}

// validateLiveStreamingDates validates start and end dates for live streaming
func (h *CloudVideoHandlers) validateLiveStreamingDates(req CloudVideoCreateRequest) error {
	// Check for empty start date
	if req.ScheduledStartTime == nil {
		return fmt.Errorf("scheduled start time is required for live streaming")
	}

	// Validate date range if both dates are provided
	if req.ScheduledStartTime != nil && req.VideoEndTime != nil {
		if req.VideoEndTime.Before(*req.ScheduledStartTime) || req.VideoEndTime.Equal(*req.ScheduledStartTime) {
			return fmt.Errorf("end time must be after start time")
		}
	}

	return nil
}

// generateStreamKeyBasedOnTimes generates a stream key based on start and end times
func (h *CloudVideoHandlers) generateStreamKeyBasedOnTimes(videoID string, startTime time.Time, endTime time.Time) string {
	// Use start time and duration in the key calculation
	startTimestamp := startTime.Unix()
	duration := int64(endTime.Sub(startTime).Seconds())
	dateString := startTime.Format("20060102") // YYYYMMDD format

	return fmt.Sprintf("nextevent_%s_%d_%d_%d", dateString, startTimestamp, duration, time.Now().Unix())
}

// configureLiveStreaming configures live streaming for a CloudVideo
func (h *CloudVideoHandlers) configureLiveStreaming(cloudVideoData map[string]interface{}, req CloudVideoCreateRequest) error {
	// Validate dates before processing
	if err := h.validateLiveStreamingDates(req); err != nil {
		return err
	}

	// Set scheduled times
	startTime := *req.ScheduledStartTime
	cloudVideoData["StartTime"] = startTime

	var endTime time.Time
	if req.VideoEndTime != nil {
		endTime = *req.VideoEndTime
		cloudVideoData["VideoEndTime"] = endTime
	} else {
		// Default to 2 hours from start time
		endTime = startTime.Add(2 * time.Hour)
		cloudVideoData["VideoEndTime"] = endTime
	}

	// Generate stream key based on start and end times
	streamKey := h.generateStreamKeyBasedOnTimes(cloudVideoData["Id"].(string), startTime, endTime)
	cloudVideoData["StreamKey"] = streamKey

	// Generate streaming URLs (simplified for now)
	cloudVideoData["CloudUrl"] = fmt.Sprintf("rtmp://push.nextevent.com/live/%s", streamKey)
	cloudVideoData["PlaybackUrl"] = fmt.Sprintf("rtmp://play.nextevent.com/live/%s", streamKey)

	return nil
}

// UpdateCloudVideo updates an existing CloudVideo with resource bindings
func (h *CloudVideoHandlers) UpdateCloudVideo(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	cloudVideoId := c.Param("id")
	if cloudVideoId == "" {
		c.JSON(400, gin.H{
			"error":   "Missing CloudVideo ID",
			"message": "CloudVideo ID is required",
		})
		return
	}

	var req CloudVideoCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Invalid request body",
			"message": err.Error(),
		})
		return
	}

	// Check if CloudVideo exists
	var existingVideo map[string]interface{}
	result := h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ? AND IsDeleted = 0", cloudVideoId).Scan(&existingVideo)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{
				"error":   "CloudVideo not found",
				"message": "No CloudVideo found with the provided ID",
			})
		} else {
			c.JSON(500, gin.H{
				"error":   "Database query failed",
				"message": result.Error.Error(),
			})
		}
		return
	}

	// Smart migration for VideoType 0 based on existing record
	if req.VideoType == 0 {
		// Check existing record for live streaming characteristics
		if cloudUrl, exists := existingVideo["CloudUrl"]; exists && cloudUrl != nil && cloudUrl != "" {
			req.VideoType = 2 // Has CloudUrl, make it Live Streaming
		} else if streamKey, exists := existingVideo["StreamKey"]; exists && streamKey != nil && streamKey != "" {
			req.VideoType = 2 // Has StreamKey, make it Live Streaming
		} else if videoEndTime, exists := existingVideo["VideoEndTime"]; exists && videoEndTime != nil {
			req.VideoType = 2 // Has VideoEndTime, make it Live Streaming
		} else {
			req.VideoType = 1 // Default to Uploaded Video
		}
	}

	// Validate request
	if err := h.validateCreateRequest(req); err != nil {
		c.JSON(400, gin.H{
			"error":   "Validation failed",
			"message": err.Error(),
		})
		return
	}

	// Prepare update data
	emptyGuid := "00000000-0000-0000-0000-000000000000"
	updateData := map[string]interface{}{
		"Title":                req.Title,
		"Summary":              req.Summary,
		"VideoType":            req.VideoType,
		"IsOpen":               req.IsOpen,
		"RequireAuth":          req.RequireAuth,
		"SupportInteraction":   req.SupportInteraction,
		"AllowDownload":        req.AllowDownload,
		"EnableComments":       req.EnableComments,
		"EnableLikes":          req.EnableLikes,
		"EnableSharing":        req.EnableSharing,
		"EnableAnalytics":      req.EnableAnalytics,
		"LastModificationTime": time.Now(),

		// Resource bindings
		"UploadId":         h.getValueOrEmpty(req.UploadId, emptyGuid),
		"SiteImageId":      h.getValueOrEmpty(req.SiteImageId, emptyGuid),
		"PromotionPicId":   h.getValueOrEmpty(req.PromotionPicId, emptyGuid),
		"ThumbnailId":      h.getValueOrEmpty(req.ThumbnailId, emptyGuid),
		"IntroArticleId":   h.getValueOrEmpty(req.IntroArticleId, emptyGuid),
		"NotOpenArticleId": h.getValueOrEmpty(req.NotOpenArticleId, emptyGuid),
		"SurveyId":         h.getValueOrEmpty(req.SurveyId, emptyGuid),
		"CategoryId":       h.getValueOrEmpty(req.CategoryId, "b33633e9-853d-4ae8-a02d-cde85acf4db9"),
		"BoundEventId":     req.BoundEventId,
	}

	// Handle live streaming configuration updates
	if req.VideoType == 2 { // Live video
		if err := h.updateLiveStreamingConfig(updateData, req); err != nil {
			c.JSON(500, gin.H{
				"error":   "Failed to update live streaming configuration",
				"message": err.Error(),
			})
			return
		}
	}

	// Update CloudVideo in database
	result = h.db.Table("CloudVideos").Where("Id = ?", cloudVideoId).Updates(updateData)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to update CloudVideo",
			"message": result.Error.Error(),
		})
		return
	}

	// Return updated CloudVideo with bound resources
	var updatedVideo map[string]interface{}
	h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ?", cloudVideoId).Scan(&updatedVideo)

	cloudVideo := h.convertToCloudVideoResponse(updatedVideo)
	h.loadBoundResources(&cloudVideo)

	c.JSON(200, gin.H{
		"data":    cloudVideo,
		"message": "CloudVideo updated successfully",
	})
}

// DeleteCloudVideo soft deletes a CloudVideo
func (h *CloudVideoHandlers) DeleteCloudVideo(c *gin.Context) {
	if h.db == nil {
		c.JSON(500, gin.H{
			"error":   "Database not connected",
			"message": "Database connection is not available",
		})
		return
	}

	cloudVideoId := c.Param("id")
	if cloudVideoId == "" {
		c.JSON(400, gin.H{
			"error":   "Missing CloudVideo ID",
			"message": "CloudVideo ID is required",
		})
		return
	}

	// Check if CloudVideo exists
	var existingVideo map[string]interface{}
	result := h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ? AND IsDeleted = 0", cloudVideoId).Scan(&existingVideo)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{
				"error":   "CloudVideo not found",
				"message": "No CloudVideo found with the provided ID",
			})
		} else {
			c.JSON(500, gin.H{
				"error":   "Database query failed",
				"message": result.Error.Error(),
			})
		}
		return
	}

	// Soft delete the CloudVideo
	updateData := map[string]interface{}{
		"IsDeleted":            true,
		"LastModificationTime": time.Now(),
	}

	result = h.db.Table("CloudVideos").Where("Id = ?", cloudVideoId).Updates(updateData)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to delete CloudVideo",
			"message": result.Error.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message": "CloudVideo deleted successfully",
	})
}

// GenerateStreamKey generates a new stream key for a CloudVideo using Ali Cloud Live
func (h *CloudVideoHandlers) GenerateStreamKey(c *gin.Context) {
	cloudVideoId := c.Param("id")
	if cloudVideoId == "" {
		c.JSON(400, gin.H{
			"error": "CloudVideo ID is required",
		})
		return
	}

	// Validate UUID format
	if _, err := uuid.Parse(cloudVideoId); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid CloudVideo ID format",
		})
		return
	}

	// Check if CloudVideo exists and is a live video
	var rawVideo map[string]interface{}
	result := h.db.Raw("SELECT * FROM CloudVideos WHERE Id = ? AND IsDeleted = 0", cloudVideoId).Scan(&rawVideo)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to fetch CloudVideo",
			"message": result.Error.Error(),
		})
		return
	}

	if len(rawVideo) == 0 {
		c.JSON(404, gin.H{
			"error": "CloudVideo not found",
		})
		return
	}

	// Check if it's a live video (VideoType = 2)
	videoType := h.getInt(rawVideo, "VideoType")

	// Smart migration: treat VideoType 0 as live if it has streaming characteristics
	if videoType == 0 {
		// Check for live streaming characteristics (try different field name cases)
		if cloudUrl, exists := rawVideo["CloudUrl"]; exists && cloudUrl != nil && cloudUrl != "" {
			videoType = 2 // Has CloudUrl, treat as Live Streaming
		} else if cloudUrl, exists := rawVideo["cloudUrl"]; exists && cloudUrl != nil && cloudUrl != "" {
			videoType = 2 // Has cloudUrl (lowercase), treat as Live Streaming
		} else if streamKey, exists := rawVideo["StreamKey"]; exists && streamKey != nil && streamKey != "" {
			videoType = 2 // Has StreamKey, treat as Live Streaming
		} else if streamKey, exists := rawVideo["streamKey"]; exists && streamKey != nil && streamKey != "" {
			videoType = 2 // Has streamKey (lowercase), treat as Live Streaming
		} else if videoEndTime, exists := rawVideo["VideoEndTime"]; exists && videoEndTime != nil {
			videoType = 2 // Has VideoEndTime, treat as Live Streaming
		} else if videoEndTime, exists := rawVideo["videoEndTime"]; exists && videoEndTime != nil {
			videoType = 2 // Has videoEndTime (lowercase), treat as Live Streaming
		}
	}

	if videoType != 2 {
		c.JSON(400, gin.H{
			"error": "Stream key can only be generated for live videos",
		})
		return
	}

	// Get current video data to access schedule times
	startTime := h.getTimePtr(rawVideo, "StartTime")
	endTime := h.getTimePtr(rawVideo, "VideoEndTime")

	// Validate dates before generating key
	if startTime == nil {
		c.JSON(400, gin.H{
			"error": "Cannot generate stream key: scheduled start time is required",
		})
		return
	}

	// Use default end time if not set
	var actualEndTime time.Time
	if endTime != nil {
		actualEndTime = *endTime
	} else {
		actualEndTime = startTime.Add(2 * time.Hour)
	}

	// Validate date range
	if actualEndTime.Before(*startTime) || actualEndTime.Equal(*startTime) {
		c.JSON(400, gin.H{
			"error": "End time must be after start time",
		})
		return
	}

	// Generate new stream key based on times
	newStreamKey := h.generateStreamKeyBasedOnTimes(cloudVideoId, *startTime, actualEndTime)

	// Generate streaming URLs (simplified for now - in production, use Ali Cloud SDK)
	pushURL := fmt.Sprintf("rtmp://push.nextevent.com/live/%s", newStreamKey)
	playbackURL := fmt.Sprintf("rtmp://play.nextevent.com/live/%s", newStreamKey)

	// Update CloudVideo with new stream key and URLs
	updateData := map[string]interface{}{
		"StreamKey":            newStreamKey,
		"CloudUrl":             pushURL,
		"PlaybackUrl":          playbackURL,
		"LastModificationTime": time.Now(),
	}

	result = h.db.Table("CloudVideos").Where("Id = ?", cloudVideoId).Updates(updateData)
	if result.Error != nil {
		c.JSON(500, gin.H{
			"error":   "Failed to update CloudVideo with new stream key",
			"message": result.Error.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"message":     "Stream key generated successfully",
		"streamKey":   newStreamKey,
		"pushUrl":     pushURL,
		"playbackUrl": playbackURL,
	})
}

// updateLiveStreamingConfig updates live streaming configuration
func (h *CloudVideoHandlers) updateLiveStreamingConfig(updateData map[string]interface{}, req CloudVideoCreateRequest) error {
	// Validate dates if provided
	if req.ScheduledStartTime != nil || req.VideoEndTime != nil {
		if err := h.validateLiveStreamingDates(req); err != nil {
			return err
		}
	}

	// Update scheduled times if provided
	if req.ScheduledStartTime != nil {
		updateData["StartTime"] = *req.ScheduledStartTime
	}
	if req.VideoEndTime != nil {
		updateData["VideoEndTime"] = *req.VideoEndTime
	}

	// Keep existing stream key if not changing video type
	// Stream URLs would be regenerated by live streaming service if needed

	return nil
}
