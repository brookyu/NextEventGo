package middleware

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/pkg/utils"
)

// ArticleValidationMiddleware validates article-specific request parameters
func ArticleValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate article ID parameter if present
		if articleID := c.Param("id"); articleID != "" {
			if _, err := uuid.Parse(articleID); err != nil {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid article ID format", err)
				c.Abort()
				return
			}
		}

		// Validate QR code ID parameter if present
		if qrCodeID := c.Param("qrcode_id"); qrCodeID != "" {
			if _, err := uuid.Parse(qrCodeID); err != nil {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid QR code ID format", err)
				c.Abort()
				return
			}
		}

		// Validate promotion code parameter if present
		if promoCode := c.Param("code"); promoCode != "" {
			if len(promoCode) < 3 || len(promoCode) > 50 {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid promotion code format", nil)
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// ArticlePaginationMiddleware validates and normalizes pagination parameters
func ArticlePaginationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate page parameter
		if pageStr := c.Query("page"); pageStr != "" {
			if page, err := strconv.Atoi(pageStr); err != nil || page < 1 {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid page parameter", nil)
				c.Abort()
				return
			}
		}

		// Validate limit parameter
		if limitStr := c.Query("limit"); limitStr != "" {
			if limit, err := strconv.Atoi(limitStr); err != nil || limit < 1 || limit > 100 {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid limit parameter (must be 1-100)", nil)
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// ArticleContentTypeMiddleware validates content type for article operations
func ArticleContentTypeMiddleware() gin.HandlerFunc {
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

// ArticleRateLimitMiddleware implements rate limiting for article operations
func ArticleRateLimitMiddleware(logger *zap.Logger) gin.HandlerFunc {
	// Simple in-memory rate limiter (in production, use Redis)
	requests := make(map[string][]time.Time)
	
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()
		
		// Clean old requests (older than 1 minute)
		if times, exists := requests[clientIP]; exists {
			var validTimes []time.Time
			for _, t := range times {
				if now.Sub(t) < time.Minute {
					validTimes = append(validTimes, t)
				}
			}
			requests[clientIP] = validTimes
		}
		
		// Check rate limit (60 requests per minute)
		if len(requests[clientIP]) >= 60 {
			logger.Warn("Rate limit exceeded", zap.String("clientIP", clientIP))
			utils.RateLimitResponse(c)
			c.Abort()
			return
		}
		
		// Add current request
		requests[clientIP] = append(requests[clientIP], now)
		
		c.Next()
	}
}

// ArticleAnalyticsMiddleware adds analytics tracking headers
func ArticleAnalyticsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add request ID for tracking
		if requestID := c.GetHeader("X-Request-ID"); requestID == "" {
			c.Header("X-Request-ID", uuid.New().String())
		}

		// Add timestamp
		c.Header("X-Request-Time", time.Now().UTC().Format(time.RFC3339))

		// Add client info to context for analytics
		c.Set("client_ip", c.ClientIP())
		c.Set("user_agent", c.GetHeader("User-Agent"))
		c.Set("referer", c.GetHeader("Referer"))

		c.Next()
	}
}

// ArticleSecurityMiddleware adds security headers for article endpoints
func ArticleSecurityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Content Security Policy for article content
		csp := "default-src 'self'; " +
			"script-src 'self' 'unsafe-inline'; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self' https:; " +
			"connect-src 'self' https:; " +
			"frame-ancestors 'none'"
		c.Header("Content-Security-Policy", csp)

		c.Next()
	}
}

// WeChatIntegrationMiddleware validates WeChat-specific parameters
func WeChatIntegrationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate QR code type parameter
		if qrType := c.Query("type"); qrType != "" {
			if qrType != "permanent" && qrType != "temporary" {
				utils.ErrorResponse(c, http.StatusBadRequest, "Invalid QR code type", nil)
				c.Abort()
				return
			}
		}

		// Add WeChat-specific headers
		c.Header("X-WeChat-Integration", "enabled")
		
		c.Next()
	}
}

// ArticleOwnershipMiddleware checks if user owns the article (placeholder)
func ArticleOwnershipMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// This would check if the authenticated user owns the article
		// For now, we'll just pass through
		// In a real implementation, you would:
		// 1. Get the article ID from the URL
		// 2. Get the user ID from the JWT token
		// 3. Check if the user owns the article or has permission
		
		c.Next()
	}
}

// ArticlePublishingMiddleware validates publishing-specific requirements
func ArticlePublishingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Add publishing-specific context
		c.Set("publishing_action", true)
		c.Set("requires_validation", true)
		
		c.Next()
	}
}

// ArticleLoggingMiddleware logs article-specific operations
func ArticleLoggingMiddleware(logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Process request
		c.Next()
		
		// Log after request
		duration := time.Since(start)
		
		fields := []zap.Field{
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("duration", duration),
			zap.String("client_ip", c.ClientIP()),
		}
		
		// Add article-specific fields
		if articleID := c.Param("id"); articleID != "" {
			fields = append(fields, zap.String("article_id", articleID))
		}
		
		if promoCode := c.Param("code"); promoCode != "" {
			fields = append(fields, zap.String("promo_code", promoCode))
		}
		
		if qrCodeID := c.Param("qrcode_id"); qrCodeID != "" {
			fields = append(fields, zap.String("qrcode_id", qrCodeID))
		}
		
		// Log based on status
		if c.Writer.Status() >= 500 {
			logger.Error("Article API error", fields...)
		} else if c.Writer.Status() >= 400 {
			logger.Warn("Article API client error", fields...)
		} else {
			logger.Info("Article API request", fields...)
		}
	}
}

// ArticleMiddlewareChain creates a middleware chain for article endpoints
func ArticleMiddlewareChain(logger *zap.Logger) []gin.HandlerFunc {
	return []gin.HandlerFunc{
		ArticleLoggingMiddleware(logger),
		ArticleSecurityMiddleware(),
		ArticleAnalyticsMiddleware(),
		ArticleValidationMiddleware(),
		ArticlePaginationMiddleware(),
		ArticleContentTypeMiddleware(),
		ArticleRateLimitMiddleware(logger),
	}
}

// WeChatMiddlewareChain creates a middleware chain for WeChat integration endpoints
func WeChatMiddlewareChain(logger *zap.Logger) []gin.HandlerFunc {
	return []gin.HandlerFunc{
		ArticleLoggingMiddleware(logger),
		ArticleSecurityMiddleware(),
		ArticleAnalyticsMiddleware(),
		WeChatIntegrationMiddleware(),
		ArticleValidationMiddleware(),
		ArticleRateLimitMiddleware(logger),
	}
}
