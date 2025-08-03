package utils

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

// ImageInfo represents information about an image
type ImageInfo struct {
	Width       int    `json:"width"`
	Height      int    `json:"height"`
	Format      string `json:"format"`
	ContentType string `json:"contentType"`
	Size        int64  `json:"size"`
}

// GetImageDimensions extracts width and height from an image reader
func GetImageDimensions(reader io.Reader) (width, height int, err error) {
	config, _, err := image.DecodeConfig(reader)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to decode image config: %w", err)
	}

	return config.Width, config.Height, nil
}

// GetImageInfo extracts comprehensive information from an image file
func GetImageInfo(file *multipart.FileHeader) (*ImageInfo, error) {
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Get image dimensions and format
	config, format, err := image.DecodeConfig(src)
	if err != nil {
		return nil, fmt.Errorf("failed to decode image: %w", err)
	}

	// Get content type
	src.Seek(0, 0)
	buffer := make([]byte, 512)
	n, _ := src.Read(buffer)
	contentType := http.DetectContentType(buffer[:n])

	return &ImageInfo{
		Width:       config.Width,
		Height:      config.Height,
		Format:      format,
		ContentType: contentType,
		Size:        file.Size,
	}, nil
}

// ValidateImageFile validates if a file is a valid image
func ValidateImageFile(file *multipart.FileHeader, maxSize int64, allowedTypes []string) error {
	// Check file size
	if file.Size > maxSize {
		return fmt.Errorf("file size %d bytes exceeds maximum allowed size %d bytes", file.Size, maxSize)
	}

	// Check file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	validExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".svg":  true,
	}

	if !validExts[ext] {
		return fmt.Errorf("invalid file extension: %s", ext)
	}

	// Check MIME type
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open file for validation: %w", err)
	}
	defer src.Close()

	buffer := make([]byte, 512)
	n, err := src.Read(buffer)
	if err != nil && n == 0 {
		return fmt.Errorf("failed to read file for content type detection: %w", err)
	}

	contentType := http.DetectContentType(buffer[:n])

	// Check if content type is allowed
	if len(allowedTypes) > 0 {
		allowed := false
		for _, allowedType := range allowedTypes {
			if strings.HasPrefix(contentType, allowedType) {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("content type %s is not allowed", contentType)
		}
	}

	// Try to decode image to ensure it's valid
	src.Seek(0, 0)
	_, _, err = image.DecodeConfig(src)
	if err != nil {
		return fmt.Errorf("invalid image file: %w", err)
	}

	return nil
}

// GenerateImageFilename generates a unique filename for an image
func GenerateImageFilename(originalName string) string {
	ext := filepath.Ext(originalName)
	if ext == "" {
		ext = ".jpg"
	}

	// Generate UUID-based filename
	return fmt.Sprintf("%s%s", uuid.New().String(), ext)
}

// GetImageMimeType returns the MIME type based on file extension
func GetImageMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))

	mimeTypes := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".gif":  "image/gif",
		".webp": "image/webp",
		".svg":  "image/svg+xml",
	}

	if mimeType, ok := mimeTypes[ext]; ok {
		return mimeType
	}

	return "application/octet-stream"
}

// IsImageFile checks if a file is an image based on its extension
func IsImageFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))

	imageExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
		".svg":  true,
	}

	return imageExts[ext]
}

// GetImageFileExtension returns the appropriate file extension for a MIME type
func GetImageFileExtension(mimeType string) string {
	extensions := map[string]string{
		"image/jpeg":    ".jpg",
		"image/jpg":     ".jpg",
		"image/png":     ".png",
		"image/gif":     ".gif",
		"image/webp":    ".webp",
		"image/svg+xml": ".svg",
	}

	if ext, ok := extensions[mimeType]; ok {
		return ext
	}

	return ".jpg" // default
}

// CalculateImageAspectRatio calculates the aspect ratio of an image
func CalculateImageAspectRatio(width, height int) float64 {
	if height == 0 {
		return 0
	}
	return float64(width) / float64(height)
}

// IsImageSquare checks if an image is square
func IsImageSquare(width, height int) bool {
	return width == height && width > 0
}

// IsImagePortrait checks if an image is in portrait orientation
func IsImagePortrait(width, height int) bool {
	return height > width
}

// IsImageLandscape checks if an image is in landscape orientation
func IsImageLandscape(width, height int) bool {
	return width > height
}

// FormatImageSize formats image file size in human-readable format
func FormatImageSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}

	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	units := []string{"KB", "MB", "GB", "TB"}
	return fmt.Sprintf("%.1f %s", float64(bytes)/float64(div), units[exp])
}

// ValidateImageDimensions validates image dimensions against constraints
func ValidateImageDimensions(width, height, minWidth, minHeight, maxWidth, maxHeight int) error {
	if minWidth > 0 && width < minWidth {
		return fmt.Errorf("image width %d is less than minimum required %d", width, minWidth)
	}

	if minHeight > 0 && height < minHeight {
		return fmt.Errorf("image height %d is less than minimum required %d", height, minHeight)
	}

	if maxWidth > 0 && width > maxWidth {
		return fmt.Errorf("image width %d exceeds maximum allowed %d", width, maxWidth)
	}

	if maxHeight > 0 && height > maxHeight {
		return fmt.Errorf("image height %d exceeds maximum allowed %d", height, maxHeight)
	}

	return nil
}

// GetImageOrientation returns the orientation of an image
func GetImageOrientation(width, height int) string {
	if width == height {
		return "square"
	} else if width > height {
		return "landscape"
	} else {
		return "portrait"
	}
}
