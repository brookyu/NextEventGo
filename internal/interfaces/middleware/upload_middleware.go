package middleware

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// UploadConfig holds configuration for file upload middleware
type UploadConfig struct {
	MaxFileSize     int64    // Maximum file size in bytes
	AllowedTypes    []string // Allowed MIME types
	AllowedExts     []string // Allowed file extensions
	RequiredFields  []string // Required form fields
	MaxFiles        int      // Maximum number of files per request
	UploadPath      string   // Base upload path
}

// DefaultImageUploadConfig returns default configuration for image uploads
func DefaultImageUploadConfig() *UploadConfig {
	return &UploadConfig{
		MaxFileSize: 10 * 1024 * 1024, // 10MB
		AllowedTypes: []string{
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
		},
		AllowedExts: []string{
			".jpg", ".jpeg", ".png", ".gif", ".webp",
		},
		RequiredFields: []string{"file"},
		MaxFiles:       1,
		UploadPath:     "./uploads",
	}
}

// FileUploadMiddleware creates a file upload validation middleware
func FileUploadMiddleware(config *UploadConfig, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check content type
		contentType := c.GetHeader("Content-Type")
		if !strings.HasPrefix(contentType, "multipart/form-data") {
			logger.Warn("Invalid content type for file upload", zap.String("contentType", contentType))
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Content-Type must be multipart/form-data",
			})
			c.Abort()
			return
		}

		// Parse multipart form
		if err := c.Request.ParseMultipartForm(config.MaxFileSize); err != nil {
			logger.Error("Failed to parse multipart form", zap.Error(err))
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Failed to parse form data",
			})
			c.Abort()
			return
		}

		// Validate required fields
		for _, field := range config.RequiredFields {
			if c.Request.MultipartForm.File[field] == nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": fmt.Sprintf("Required field '%s' is missing", field),
				})
				c.Abort()
				return
			}
		}

		// Validate files
		totalFiles := 0
		for fieldName, files := range c.Request.MultipartForm.File {
			totalFiles += len(files)
			
			for _, fileHeader := range files {
				if err := validateFile(fileHeader, config, logger); err != nil {
					logger.Warn("File validation failed", 
						zap.String("field", fieldName),
						zap.String("filename", fileHeader.Filename),
						zap.Error(err))
					c.JSON(http.StatusBadRequest, gin.H{
						"error": fmt.Sprintf("File validation failed for %s: %s", fileHeader.Filename, err.Error()),
					})
					c.Abort()
					return
				}
			}
		}

		// Check total file count
		if totalFiles > config.MaxFiles {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Too many files: %d (maximum: %d)", totalFiles, config.MaxFiles),
			})
			c.Abort()
			return
		}

		// Store validated files in context for controllers to use
		c.Set("uploadConfig", config)
		c.Set("validatedFiles", c.Request.MultipartForm.File)

		logger.Info("File upload validation passed", 
			zap.Int("fileCount", totalFiles),
			zap.String("contentType", contentType))

		c.Next()
	}
}

// validateFile validates a single file
func validateFile(fileHeader *multipart.FileHeader, config *UploadConfig, logger *zap.Logger) error {
	// Check file size
	if fileHeader.Size > config.MaxFileSize {
		return fmt.Errorf("file size %d exceeds maximum allowed size %d", fileHeader.Size, config.MaxFileSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
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
	file, err := fileHeader.Open()
	if err != nil {
		return fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Read first 512 bytes to detect content type
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && n == 0 {
		return fmt.Errorf("failed to read file content: %w", err)
	}

	// Detect content type
	contentType := http.DetectContentType(buffer[:n])
	
	// Validate content type
	if len(config.AllowedTypes) > 0 {
		allowed := false
		for _, allowedType := range config.AllowedTypes {
			if contentType == allowedType {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("content type %s is not allowed", contentType)
		}
	}

	// Additional security checks
	if err := performSecurityChecks(fileHeader, buffer[:n]); err != nil {
		return fmt.Errorf("security check failed: %w", err)
	}

	return nil
}

// performSecurityChecks performs additional security validations
func performSecurityChecks(fileHeader *multipart.FileHeader, content []byte) error {
	// Check for suspicious filenames
	filename := strings.ToLower(fileHeader.Filename)
	
	// Block executable extensions
	dangerousExts := []string{".exe", ".bat", ".cmd", ".com", ".pif", ".scr", ".vbs", ".js", ".jar", ".php", ".asp", ".jsp"}
	for _, ext := range dangerousExts {
		if strings.HasSuffix(filename, ext) {
			return fmt.Errorf("executable files are not allowed")
		}
	}

	// Check for double extensions (e.g., image.jpg.exe)
	parts := strings.Split(filename, ".")
	if len(parts) > 2 {
		for i := 1; i < len(parts)-1; i++ {
			for _, ext := range dangerousExts {
				if "."+parts[i] == ext {
					return fmt.Errorf("suspicious filename with double extension")
				}
			}
		}
	}

	// Check for null bytes in filename
	if strings.Contains(fileHeader.Filename, "\x00") {
		return fmt.Errorf("filename contains null bytes")
	}

	// Check for path traversal attempts
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") {
		return fmt.Errorf("filename contains path traversal characters")
	}

	return nil
}

// GetUploadedFiles retrieves validated files from context
func GetUploadedFiles(c *gin.Context) map[string][]*multipart.FileHeader {
	if files, exists := c.Get("validatedFiles"); exists {
		return files.(map[string][]*multipart.FileHeader)
	}
	return nil
}

// GetUploadConfig retrieves upload configuration from context
func GetUploadConfig(c *gin.Context) *UploadConfig {
	if config, exists := c.Get("uploadConfig"); exists {
		return config.(*UploadConfig)
	}
	return nil
}
