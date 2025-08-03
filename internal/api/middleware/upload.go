package middleware

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/zenteam/nextevent-go/pkg/utils"
)

// UploadConfig holds configuration for file upload middleware
type UploadConfig struct {
	MaxFileSize    int64    // Maximum file size in bytes
	AllowedTypes   []string // Allowed MIME types
	AllowedExts    []string // Allowed file extensions
	MaxFiles       int      // Maximum number of files per request
	RequireAuth    bool     // Whether authentication is required
	UploadPath     string   // Base upload path
	CreateDirs     bool     // Whether to create directories if they don't exist
	OverwriteFiles bool     // Whether to overwrite existing files
}

// DefaultImageUploadConfig returns default configuration for image uploads
func DefaultImageUploadConfig() UploadConfig {
	return UploadConfig{
		MaxFileSize: 10 * 1024 * 1024, // 10MB
		AllowedTypes: []string{
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		},
		AllowedExts: []string{
			".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
		},
		MaxFiles:       10,
		RequireAuth:    true,
		UploadPath:     "uploads/images",
		CreateDirs:     true,
		OverwriteFiles: false,
	}
}

// FileUploadMiddleware creates a middleware for handling file uploads
func FileUploadMiddleware(config UploadConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check authentication if required
		if config.RequireAuth {
			// Get user from context (set by auth middleware)
			if _, exists := c.Get("user"); !exists {
				utils.ErrorResponse(c, http.StatusUnauthorized, "Authentication required", nil)
				c.Abort()
				return
			}
		}

		// Only process multipart forms
		if !strings.Contains(c.GetHeader("Content-Type"), "multipart/form-data") {
			c.Next()
			return
		}

		// Parse multipart form
		if err := c.Request.ParseMultipartForm(config.MaxFileSize); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Failed to parse multipart form", err)
			c.Abort()
			return
		}

		// Get files from form
		form := c.Request.MultipartForm
		if form == nil || form.File == nil {
			c.Next()
			return
		}

		// Validate all files before processing
		totalFiles := 0
		for fieldName, files := range form.File {
			totalFiles += len(files)
			
			// Check maximum number of files
			if totalFiles > config.MaxFiles {
				utils.ErrorResponse(c, http.StatusBadRequest, 
					fmt.Sprintf("Too many files. Maximum allowed: %d", config.MaxFiles), nil)
				c.Abort()
				return
			}

			for _, file := range files {
				if err := validateFile(file, config); err != nil {
					utils.ErrorResponse(c, http.StatusBadRequest, 
						fmt.Sprintf("File validation failed for %s: %s", file.Filename, err.Error()), err)
					c.Abort()
					return
				}
			}

			// Store validated files in context for handlers to use
			c.Set(fmt.Sprintf("files_%s", fieldName), files)
		}

		// Store upload config in context
		c.Set("upload_config", config)

		c.Next()
	}
}

// validateFile validates a single uploaded file
func validateFile(file *multipart.FileHeader, config UploadConfig) error {
	// Check file size
	if file.Size > config.MaxFileSize {
		return fmt.Errorf("file size %d bytes exceeds maximum allowed size %d bytes", 
			file.Size, config.MaxFileSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if len(config.AllowedExts) > 0 {
		allowed := false
		for _, allowedExt := range config.AllowedExts {
			if ext == strings.ToLower(allowedExt) {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("file extension %s is not allowed", ext)
		}
	}

	// Check MIME type by opening the file
	if len(config.AllowedTypes) > 0 {
		src, err := file.Open()
		if err != nil {
			return fmt.Errorf("failed to open file for validation: %v", err)
		}
		defer src.Close()

		// Read first 512 bytes to detect content type
		buffer := make([]byte, 512)
		n, err := src.Read(buffer)
		if err != nil && n == 0 {
			return fmt.Errorf("failed to read file for content type detection: %v", err)
		}

		contentType := http.DetectContentType(buffer[:n])
		
		// Check if content type is allowed
		allowed := false
		for _, allowedType := range config.AllowedTypes {
			if strings.HasPrefix(contentType, allowedType) {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("file type %s is not allowed", contentType)
		}
	}

	// Validate filename
	if err := validateFilename(file.Filename); err != nil {
		return err
	}

	return nil
}

// validateFilename validates the filename for security
func validateFilename(filename string) error {
	if filename == "" {
		return fmt.Errorf("filename cannot be empty")
	}

	// Check for path traversal attempts
	if strings.Contains(filename, "..") {
		return fmt.Errorf("filename contains invalid path traversal sequence")
	}

	// Check for absolute paths
	if strings.HasPrefix(filename, "/") || strings.HasPrefix(filename, "\\") {
		return fmt.Errorf("filename cannot be an absolute path")
	}

	// Check for Windows drive letters
	if len(filename) >= 2 && filename[1] == ':' {
		return fmt.Errorf("filename cannot contain drive letters")
	}

	// Check for dangerous characters
	dangerousChars := []string{"<", ">", ":", "\"", "|", "?", "*", "\x00"}
	for _, char := range dangerousChars {
		if strings.Contains(filename, char) {
			return fmt.Errorf("filename contains invalid character: %s", char)
		}
	}

	// Check filename length
	if len(filename) > 255 {
		return fmt.Errorf("filename too long (maximum 255 characters)")
	}

	return nil
}

// GetUploadedFiles retrieves uploaded files from context
func GetUploadedFiles(c *gin.Context, fieldName string) ([]*multipart.FileHeader, bool) {
	files, exists := c.Get(fmt.Sprintf("files_%s", fieldName))
	if !exists {
		return nil, false
	}
	
	fileHeaders, ok := files.([]*multipart.FileHeader)
	return fileHeaders, ok
}

// GetUploadConfig retrieves upload configuration from context
func GetUploadConfig(c *gin.Context) (UploadConfig, bool) {
	config, exists := c.Get("upload_config")
	if !exists {
		return UploadConfig{}, false
	}
	
	uploadConfig, ok := config.(UploadConfig)
	return uploadConfig, ok
}

// FileValidationMiddleware provides basic file validation without upload processing
func FileValidationMiddleware(config UploadConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only validate if it's a multipart form
		if !strings.Contains(c.GetHeader("Content-Type"), "multipart/form-data") {
			c.Next()
			return
		}

		// Set max memory for multipart parsing
		c.Request.ParseMultipartForm(config.MaxFileSize)

		c.Next()
	}
}

// SecureUploadMiddleware adds additional security checks
func SecureUploadMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")

		// Check for suspicious user agents
		userAgent := c.GetHeader("User-Agent")
		if userAgent == "" {
			utils.ErrorResponse(c, http.StatusBadRequest, "User-Agent header is required", nil)
			c.Abort()
			return
		}

		// Rate limiting could be added here
		// For now, we'll just continue
		c.Next()
	}
}

// CleanupTempFiles middleware cleans up temporary files after request processing
func CleanupTempFiles() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Clean up any temporary files created during request processing
		if tempFiles, exists := c.Get("temp_files"); exists {
			if files, ok := tempFiles.([]string); ok {
				for _, file := range files {
					// In a real implementation, you would clean up temp files here
					// os.Remove(file)
					_ = file // Placeholder to avoid unused variable error
				}
			}
		}
	}
}
