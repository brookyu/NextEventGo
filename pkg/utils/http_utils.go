package utils

import (
	"errors"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// StandardResponse represents a standard API response
type StandardResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// SuccessResponse sends a success response
func SuccessResponse(c *gin.Context, statusCode int, message string, data interface{}) {
	response := StandardResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	c.JSON(statusCode, response)
}

// ErrorResponse sends an error response
func ErrorResponse(c *gin.Context, statusCode int, message string, err error) {
	response := StandardResponse{
		Success: false,
		Message: message,
	}

	if err != nil {
		response.Error = err.Error()
	}

	c.JSON(statusCode, response)
}

// HandleServiceError handles service layer errors and maps them to appropriate HTTP status codes
// TODO: Move service errors to a shared package to avoid import cycles
func HandleServiceError(c *gin.Context, err error) {
	// For now, handle generic errors until service errors are moved to shared package
	if IsValidationError(err) {
		ErrorResponse(c, http.StatusBadRequest, "Validation failed", err)
	} else {
		ErrorResponse(c, http.StatusInternalServerError, "Internal server error", err)
	}
}

// IsValidationError checks if an error is a validation error
func IsValidationError(err error) bool {
	// This would check for specific validation error types
	// For now, we'll check for common validation error messages
	errMsg := err.Error()
	validationKeywords := []string{
		"validation failed",
		"invalid",
		"required",
		"must be",
		"cannot be",
		"too long",
		"too short",
		"out of range",
	}

	for _, keyword := range validationKeywords {
		if contains(errMsg, keyword) {
			return true
		}
	}

	return false
}

// contains checks if a string contains a substring (case-insensitive)
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		(len(s) > len(substr) &&
			(s[:len(substr)] == substr ||
				s[len(s)-len(substr):] == substr ||
				containsSubstring(s, substr))))
}

// containsSubstring checks if string contains substring
func containsSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// ParseIntQuery parses an integer query parameter with a default value
func ParseIntQuery(c *gin.Context, key string, defaultValue int) int {
	valueStr := c.Query(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}

// ParseBoolQuery parses a boolean query parameter with a default value
func ParseBoolQuery(c *gin.Context, key string, defaultValue bool) bool {
	valueStr := c.Query(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.ParseBool(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}

// ParseTimeQuery parses a time query parameter
func ParseTimeQuery(timeStr string) (time.Time, error) {
	// Try different time formats
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z",
		"2006-01-02 15:04:05",
		"2006-01-02",
	}

	for _, format := range formats {
		if t, err := time.Parse(format, timeStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, errors.New("invalid time format")
}

// PaginationResponse represents a paginated response
type PaginationResponse struct {
	Data        interface{} `json:"data"`
	Total       int64       `json:"total"`
	Page        int         `json:"page"`
	Limit       int         `json:"limit"`
	TotalPages  int64       `json:"totalPages"`
	HasNext     bool        `json:"hasNext"`
	HasPrevious bool        `json:"hasPrevious"`
}

// NewPaginationResponse creates a new pagination response
func NewPaginationResponse(data interface{}, total int64, page, limit int) *PaginationResponse {
	totalPages := (total + int64(limit) - 1) / int64(limit)

	return &PaginationResponse{
		Data:        data,
		Total:       total,
		Page:        page,
		Limit:       limit,
		TotalPages:  totalPages,
		HasNext:     int64(page) < totalPages,
		HasPrevious: page > 1,
	}
}

// ValidatePagination validates and normalizes pagination parameters
func ValidatePagination(page, limit int) (int, int) {
	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 20
	} else if limit > 100 {
		limit = 100
	}

	return page, limit
}

// GetUserIDFromContext extracts user ID from gin context
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userID")
	if !exists {
		return "", false
	}

	userIDStr, ok := userID.(string)
	if !ok {
		return "", false
	}

	return userIDStr, true
}

// SetCacheHeaders sets appropriate cache headers for the response
func SetCacheHeaders(c *gin.Context, maxAge int) {
	c.Header("Cache-Control", "public, max-age="+strconv.Itoa(maxAge))
	c.Header("Expires", time.Now().Add(time.Duration(maxAge)*time.Second).Format(http.TimeFormat))
}

// SetNoCacheHeaders sets headers to prevent caching
func SetNoCacheHeaders(c *gin.Context) {
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
}

// CORS headers for survey endpoints
func SetCORSHeaders(c *gin.Context) {
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
	c.Header("Access-Control-Max-Age", "86400")
}

// RateLimitResponse sends a rate limit exceeded response
func RateLimitResponse(c *gin.Context) {
	ErrorResponse(c, http.StatusTooManyRequests, "Rate limit exceeded", nil)
}

// ValidationErrorResponse sends a validation error response with details
func ValidationErrorResponse(c *gin.Context, errors map[string]string) {
	response := StandardResponse{
		Success: false,
		Message: "Validation failed",
		Error:   errors,
	}
	c.JSON(http.StatusBadRequest, response)
}

// FileResponse sends a file response with appropriate headers
func FileResponse(c *gin.Context, data []byte, filename, contentType string) {
	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Length", strconv.Itoa(len(data)))
	c.Data(http.StatusOK, contentType, data)
}

// StreamResponse sends a streaming response
func StreamResponse(c *gin.Context, contentType string, data func(c *gin.Context)) {
	c.Header("Content-Type", contentType)
	c.Header("Transfer-Encoding", "chunked")
	c.Stream(func(w io.Writer) bool {
		data(c)
		return false
	})
}
