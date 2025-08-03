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
)

// UploadHandlers contains upload-related handlers
type UploadHandlers struct {
	db *gorm.DB
}

// NewUploadHandlers creates a new instance of upload handlers
func NewUploadHandlers(db *gorm.DB) *UploadHandlers {
	return &UploadHandlers{db: db}
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
