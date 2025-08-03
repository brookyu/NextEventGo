package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/zenteam/nextevent-go/pkg/utils"
)

// AuthMiddleware handles authentication for survey endpoints
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip authentication for public endpoints
		if isPublicEndpoint(c.Request.URL.Path) {
			c.Next()
			return
		}

		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required", nil)
			c.Abort()
			return
		}

		// Extract token from Bearer header
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format", nil)
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token and extract user ID
		// This is a simplified implementation - in production, you would validate JWT tokens
		userID, err := validateToken(token)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token", err)
			c.Abort()
			return
		}

		// Set user ID in context
		c.Set("userID", userID)
		c.Next()
	}
}

// OptionalAuthMiddleware handles optional authentication
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		// Extract token from Bearer header
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		token := tokenParts[1]

		// Validate token and extract user ID
		userID, err := validateToken(token)
		if err != nil {
			// Don't abort for optional auth, just continue without user ID
			c.Next()
			return
		}

		// Set user ID in context
		c.Set("userID", userID)
		c.Next()
	}
}

// RateLimitMiddleware implements rate limiting for survey endpoints
func RateLimitMiddleware(requestsPerMinute int) gin.HandlerFunc {
	// Simple in-memory rate limiter
	// In production, you would use Redis or similar
	clients := make(map[string][]time.Time)

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()

		// Clean old requests
		if requests, exists := clients[clientIP]; exists {
			var validRequests []time.Time
			for _, reqTime := range requests {
				if now.Sub(reqTime) < time.Minute {
					validRequests = append(validRequests, reqTime)
				}
			}
			clients[clientIP] = validRequests
		}

		// Check rate limit
		if len(clients[clientIP]) >= requestsPerMinute {
			utils.RateLimitResponse(c)
			c.Abort()
			return
		}

		// Add current request
		clients[clientIP] = append(clients[clientIP], now)
		c.Next()
	}
}

// CORSMiddleware handles CORS for survey endpoints
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		utils.SetCORSHeaders(c)

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// LoggingMiddleware logs survey-related requests
func LoggingMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[SURVEY] %s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// ValidationMiddleware validates common request parameters
func ValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate UUID parameters
		if err := validateUUIDParams(c); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid UUID parameter", err)
			c.Abort()
			return
		}

		// Validate pagination parameters
		if err := validatePaginationParams(c); err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid pagination parameter", err)
			c.Abort()
			return
		}

		c.Next()
	}
}

// SecurityMiddleware adds security headers
func SecurityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")

		c.Next()
	}
}

// SessionMiddleware handles survey response sessions
func SessionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session ID from header or generate new one
		sessionID := c.GetHeader("X-Survey-Session-ID")
		if sessionID == "" {
			sessionID = generateSessionID()
			c.Header("X-Survey-Session-ID", sessionID)
		}

		// Set session ID in context
		c.Set("sessionID", sessionID)
		c.Next()
	}
}

// Helper functions

// isPublicEndpoint checks if an endpoint is public (no auth required)
func isPublicEndpoint(path string) bool {
	publicPaths := []string{
		"/api/v1/surveys/",
		"/public",
		"/health",
		"/metrics",
	}

	for _, publicPath := range publicPaths {
		if strings.Contains(path, publicPath) {
			return true
		}
	}

	return false
}

// validateToken validates an authentication token
func validateToken(token string) (uuid.UUID, error) {
	// This is a simplified implementation
	// In production, you would validate JWT tokens, check expiration, etc.

	// For demo purposes, assume token is a valid UUID
	if len(token) < 10 {
		return uuid.Nil, errors.New("invalid token format")
	}

	// Generate a mock user ID based on token
	// In production, this would come from token validation
	userID := uuid.New()
	return userID, nil
}

// validateUUIDParams validates UUID parameters in the request
func validateUUIDParams(c *gin.Context) error {
	uuidParams := []string{"id", "surveyId", "questionId", "responseId"}

	for _, param := range uuidParams {
		if value := c.Param(param); value != "" {
			if _, err := uuid.Parse(value); err != nil {
				return fmt.Errorf("invalid %s: %s", param, value)
			}
		}
	}

	return nil
}

// validatePaginationParams validates pagination parameters
func validatePaginationParams(c *gin.Context) error {
	if pageStr := c.Query("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err != nil || page < 1 {
			return errors.New("page must be a positive integer")
		}
	}

	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err != nil || limit < 1 || limit > 100 {
			return errors.New("limit must be between 1 and 100")
		}
	}

	return nil
}

// generateSessionID generates a unique session ID
func generateSessionID() string {
	return uuid.New().String()
}

// RequestSizeMiddleware limits request body size
func RequestSizeMiddleware(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			utils.ErrorResponse(c, http.StatusRequestEntityTooLarge, "Request body too large", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

// TimeoutMiddleware adds request timeout
func TimeoutMiddleware(timeout time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Create context with timeout
		ctx, cancel := context.WithTimeout(c.Request.Context(), timeout)
		defer cancel()

		// Replace request context
		c.Request = c.Request.WithContext(ctx)

		// Channel to signal completion
		done := make(chan struct{})

		go func() {
			defer close(done)
			c.Next()
		}()

		select {
		case <-done:
			// Request completed normally
		case <-ctx.Done():
			// Request timed out
			utils.ErrorResponse(c, http.StatusRequestTimeout, "Request timeout", ctx.Err())
			c.Abort()
		}
	}
}

// ContentTypeMiddleware validates content type for POST/PUT requests
func ContentTypeMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == "POST" || c.Request.Method == "PUT" {
			contentType := c.GetHeader("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				utils.ErrorResponse(c, http.StatusUnsupportedMediaType, "Content-Type must be application/json", nil)
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
