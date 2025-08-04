package simple

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/infrastructure"
)

// UploadHandlers contains upload-related handlers
type UploadHandlers struct {
	db         *gorm.DB
	vodService *infrastructure.AliCloudVODService
}

// NewUploadHandlers creates a new instance of upload handlers
func NewUploadHandlers(db *gorm.DB, cfg *config.Config) *UploadHandlers {
	// Create Ali Cloud VOD service from configuration
	vodService := infrastructure.NewAliCloudVODServiceFromConfig(cfg, db)

	return &UploadHandlers{
		db:         db,
		vodService: vodService,
	}
}

// UploadImage handles image upload
func (h *UploadHandlers) UploadImage(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10MB max
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to parse form data"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(400, gin.H{"error": "No image file provided"})
		return
	}
	defer file.Close()

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(400, gin.H{"error": "File must be an image"})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	if ext == "" {
		// Try to determine extension from content type
		switch contentType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		default:
			ext = ".jpg"
		}
	}

	// Create unique filename with GUID
	uniqueID := fmt.Sprintf("%x", time.Now().UnixNano())
	filename := uniqueID + ext
	filepath := fmt.Sprintf("uploads/images/%s", filename)

	// Create uploads directory if it doesn't exist
	os.MkdirAll("uploads/images", 0755)

	// Save file to disk
	dst, err := os.Create(filepath)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}
	defer dst.Close()

	// Copy file content
	_, err = io.Copy(dst, file)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file content"})
		return
	}

	// Save record to database if available
	var imageID string
	if h.db != nil {
		// Get category from form data (optional)
		categoryParam := c.PostForm("category")
		if categoryParam == "" {
			// Use a default category if none provided
			categoryParam = "00000000-0000-0000-0000-000000000000"
		}

		// Generate UUID for the record
		imageID = uuid.New().String()

		// Create database record matching the actual table structure
		imageRecord := map[string]interface{}{
			"Id":                   imageID,
			"Name":                 header.Filename,
			"SiteUrl":              fmt.Sprintf("/uploads/images/%s", filename),
			"MediaId":              "", // Empty for now, could be populated by WeChat upload
			"CategoryId":           categoryParam,
			"CreationTime":         time.Now(),
			"IsDeleted":            false,
			"IsFrontCover":         false, // Required field with default value
			"Url":                  fmt.Sprintf("http://localhost:8080/uploads/images/%s", filename),
			"CreatorId":            nil,
			"LastModificationTime": nil,
			"LastModifierId":       nil,
			"DeleterId":            nil,
			"DeletionTime":         nil,
		}

		result := h.db.Table("SiteImages").Create(imageRecord)
		if result.Error != nil {
			// Log error but don't fail the upload
			fmt.Printf("Failed to save image record to database: %v\n", result.Error)
			imageID = "" // Clear ID on failure
		} else {
			fmt.Printf("Saved image record to database with ID: %s\n", imageID)
		}
	}

	response := gin.H{
		"message":      "Image uploaded successfully",
		"filename":     filename,
		"originalName": header.Filename,
		"size":         header.Size,
		"url":          fmt.Sprintf("http://localhost:8080/uploads/images/%s", filename),
	}

	// Add database ID if saved
	if imageID != "" {
		response["id"] = imageID
		response["savedToDatabase"] = true
	}

	c.JSON(200, response)
}

// UploadVideo handles video upload with Ali Cloud VOD integration
func (h *UploadHandlers) UploadVideo(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(100 << 20) // 100MB max
	if err != nil {
		c.JSON(400, gin.H{"error": "Failed to parse form data"})
		return
	}

	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(400, gin.H{"error": "No video file provided"})
		return
	}
	defer file.Close()

	// File type validation is now handled by the VOD service

	// Get title, description, and category from form data
	title := c.PostForm("title")
	description := c.PostForm("description")
	categoryId := c.PostForm("categoryId")

	if title == "" {
		c.JSON(400, gin.H{"error": "Title is required"})
		return
	}

	// Use VOD service for upload and processing
	result, err := h.vodService.UploadVideoWithCategory(c.Request.Context(), file, header, title, description, categoryId)
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to upload video: %v", err)})
		return
	}

	// Return the video data in the expected format for frontend
	videoData := gin.H{
		"id":          result.VideoID,
		"title":       result.Title,
		"description": result.Description,
		"playbackUrl": result.LocalUrl, // Start with local URL, will be updated when cloud processing completes
		"url":         result.LocalUrl,
		"cloudUrl":    result.CloudUrl,
		"coverImage":  result.CoverUrl,
		"thumbnail":   result.CoverUrl,
		"duration":    result.Duration,
		"created_at":  time.Now().Format(time.RFC3339),
		"author":      nil,
		"views":       0,
		"videoType":   "uploaded",
		"quality":     "HD",
		"isOpen":      true,
		"status":      result.Status,
		"fileSize":    result.FileSize,
		"contentType": result.ContentType,
	}

	c.JSON(200, gin.H{
		"message": "Video uploaded successfully and processing started",
		"data":    videoData,
	})
}

// GetVideoStatus returns the current processing status of a video
func (h *UploadHandlers) GetVideoStatus(c *gin.Context) {
	videoID := c.Param("id")
	if videoID == "" {
		c.JSON(400, gin.H{"error": "Video ID is required"})
		return
	}

	status, err := h.vodService.GetVideoStatus(videoID)
	if err != nil {
		c.JSON(404, gin.H{"error": "Video not found"})
		return
	}

	c.JSON(200, gin.H{
		"data": status,
	})
}

// TestUploadCredentials tests Ali Cloud upload credential format
func (h *UploadHandlers) TestUploadCredentials(c *gin.Context) {
	if h.vodService == nil {
		c.JSON(500, gin.H{"error": "VOD service not available"})
		return
	}

	// Test with a dummy file to see credential format
	response, err := h.vodService.TestCreateUploadVideo("Test Video", "test.mp4", "Test description")
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Failed to get credentials: %v", err)})
		return
	}

	c.JSON(200, gin.H{
		"message": "Upload credentials obtained",
		"data": gin.H{
			"videoId":       response.VideoId,
			"uploadAddress": response.UploadAddress,
			"uploadAuth":    response.UploadAuth,
			"requestId":     response.RequestId,
		},
	})
}
