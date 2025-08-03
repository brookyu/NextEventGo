package security

import (
	"context"
	"crypto/subtle"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/time/rate"
)

// SecurityConfig holds security middleware configuration
type SecurityConfig struct {
	// Rate limiting
	EnableRateLimit     bool
	RateLimit          float64 // requests per second
	RateBurst          int     // burst size
	RateLimitByIP      bool
	RateLimitByUser    bool
	
	// CORS
	EnableCORS         bool
	AllowedOrigins     []string
	AllowedMethods     []string
	AllowedHeaders     []string
	AllowCredentials   bool
	MaxAge             int
	
	// Security headers
	EnableSecurityHeaders bool
	ContentSecurityPolicy string
	HSTSMaxAge           int
	
	// Request validation
	MaxRequestSize       int64
	MaxHeaderSize        int
	RequestTimeout       time.Duration
	
	// API Key validation
	EnableAPIKeyAuth     bool
	ValidAPIKeys         map[string]string // key -> description
	
	// JWT validation
	EnableJWTAuth        bool
	JWTSecret           string
	JWTIssuer           string
	JWTAudience         string
	
	// Request logging
	EnableRequestLogging bool
	LogRequestBody      bool
	LogResponseBody     bool
	
	// IP filtering
	EnableIPFiltering   bool
	AllowedIPs         []string
	BlockedIPs         []string
	
	// Honeypot protection
	EnableHoneypot      bool
	HoneypotFields     []string
}

// DefaultSecurityConfig returns default security configuration
func DefaultSecurityConfig() SecurityConfig {
	return SecurityConfig{
		EnableRateLimit:       true,
		RateLimit:            100.0, // 100 requests per second
		RateBurst:            200,   // burst of 200
		RateLimitByIP:        true,
		RateLimitByUser:      true,
		EnableCORS:           true,
		AllowedOrigins:       []string{"*"},
		AllowedMethods:       []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:       []string{"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key", "X-Request-ID"},
		AllowCredentials:     true,
		MaxAge:               86400, // 24 hours
		EnableSecurityHeaders: true,
		ContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
		HSTSMaxAge:           31536000, // 1 year
		MaxRequestSize:       10 << 20, // 10MB
		MaxHeaderSize:        8192,     // 8KB
		RequestTimeout:       30 * time.Second,
		EnableAPIKeyAuth:     true,
		ValidAPIKeys:         make(map[string]string),
		EnableJWTAuth:        true,
		EnableRequestLogging: true,
		LogRequestBody:       false,
		LogResponseBody:      false,
		EnableIPFiltering:    false,
		AllowedIPs:          []string{},
		BlockedIPs:          []string{},
		EnableHoneypot:      true,
		HoneypotFields:      []string{"email_confirm", "website", "url"},
	}
}

// SecurityMiddleware provides comprehensive security middleware
type SecurityMiddleware struct {
	config      SecurityConfig
	logger      *zap.Logger
	rateLimiter map[string]*rate.Limiter // IP-based rate limiters
}

// NewSecurityMiddleware creates a new security middleware
func NewSecurityMiddleware(config SecurityConfig, logger *zap.Logger) *SecurityMiddleware {
	return &SecurityMiddleware{
		config:      config,
		logger:      logger,
		rateLimiter: make(map[string]*rate.Limiter),
	}
}

// SecurityHeaders middleware adds security headers
func (sm *SecurityMiddleware) SecurityHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableSecurityHeaders {
			c.Next()
			return
		}

		// Content Security Policy
		if sm.config.ContentSecurityPolicy != "" {
			c.Header("Content-Security-Policy", sm.config.ContentSecurityPolicy)
		}

		// HSTS (HTTP Strict Transport Security)
		if sm.config.HSTSMaxAge > 0 {
			c.Header("Strict-Transport-Security", fmt.Sprintf("max-age=%d; includeSubDomains", sm.config.HSTSMaxAge))
		}

		// X-Content-Type-Options
		c.Header("X-Content-Type-Options", "nosniff")

		// X-Frame-Options
		c.Header("X-Frame-Options", "DENY")

		// X-XSS-Protection
		c.Header("X-XSS-Protection", "1; mode=block")

		// Referrer Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		c.Next()
	}
}

// CORS middleware handles Cross-Origin Resource Sharing
func (sm *SecurityMiddleware) CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableCORS {
			c.Next()
			return
		}

		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		if sm.isOriginAllowed(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Methods", strings.Join(sm.config.AllowedMethods, ", "))
		c.Header("Access-Control-Allow-Headers", strings.Join(sm.config.AllowedHeaders, ", "))
		c.Header("Access-Control-Max-Age", strconv.Itoa(sm.config.MaxAge))

		if sm.config.AllowCredentials {
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RateLimit middleware implements rate limiting
func (sm *SecurityMiddleware) RateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableRateLimit {
			c.Next()
			return
		}

		var key string
		if sm.config.RateLimitByIP {
			key = c.ClientIP()
		} else if sm.config.RateLimitByUser {
			// Try to get user ID from context
			if userID, exists := c.Get("userID"); exists {
				key = fmt.Sprintf("user:%v", userID)
			} else {
				key = c.ClientIP() // Fallback to IP
			}
		} else {
			key = "global"
		}

		limiter := sm.getRateLimiter(key)
		
		if !limiter.Allow() {
			sm.logger.Warn("Rate limit exceeded", 
				zap.String("key", key),
				zap.String("ip", c.ClientIP()),
				zap.String("path", c.Request.URL.Path))
			
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": map[string]interface{}{
					"code":    "RATE_LIMIT_EXCEEDED",
					"message": "Too many requests",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// APIKeyAuth middleware validates API keys
func (sm *SecurityMiddleware) APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableAPIKeyAuth {
			c.Next()
			return
		}

		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": map[string]interface{}{
					"code":    "API_KEY_REQUIRED",
					"message": "API key is required",
				},
			})
			c.Abort()
			return
		}

		// Validate API key
		if !sm.isValidAPIKey(apiKey) {
			sm.logger.Warn("Invalid API key", 
				zap.String("key", apiKey[:8]+"..."), // Log only first 8 chars
				zap.String("ip", c.ClientIP()))
			
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": map[string]interface{}{
					"code":    "INVALID_API_KEY",
					"message": "Invalid API key",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequestValidation middleware validates request size and headers
func (sm *SecurityMiddleware) RequestValidation() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Check request size
		if c.Request.ContentLength > sm.config.MaxRequestSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": map[string]interface{}{
					"code":    "REQUEST_TOO_LARGE",
					"message": "Request body too large",
				},
			})
			c.Abort()
			return
		}

		// Check header size (approximate)
		headerSize := 0
		for name, values := range c.Request.Header {
			headerSize += len(name)
			for _, value := range values {
				headerSize += len(value)
			}
		}

		if headerSize > sm.config.MaxHeaderSize {
			c.JSON(http.StatusRequestHeaderFieldsTooLarge, gin.H{
				"error": map[string]interface{}{
					"code":    "HEADERS_TOO_LARGE",
					"message": "Request headers too large",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// IPFiltering middleware filters requests by IP address
func (sm *SecurityMiddleware) IPFiltering() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableIPFiltering {
			c.Next()
			return
		}

		clientIP := c.ClientIP()

		// Check blocked IPs
		for _, blockedIP := range sm.config.BlockedIPs {
			if clientIP == blockedIP {
				sm.logger.Warn("Blocked IP attempted access", 
					zap.String("ip", clientIP),
					zap.String("path", c.Request.URL.Path))
				
				c.JSON(http.StatusForbidden, gin.H{
					"error": map[string]interface{}{
						"code":    "IP_BLOCKED",
						"message": "Access denied",
					},
				})
				c.Abort()
				return
			}
		}

		// Check allowed IPs (if configured)
		if len(sm.config.AllowedIPs) > 0 {
			allowed := false
			for _, allowedIP := range sm.config.AllowedIPs {
				if clientIP == allowedIP {
					allowed = true
					break
				}
			}

			if !allowed {
				sm.logger.Warn("Non-allowed IP attempted access", 
					zap.String("ip", clientIP),
					zap.String("path", c.Request.URL.Path))
				
				c.JSON(http.StatusForbidden, gin.H{
					"error": map[string]interface{}{
						"code":    "IP_NOT_ALLOWED",
						"message": "Access denied",
					},
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// HoneypotProtection middleware detects bot submissions
func (sm *SecurityMiddleware) HoneypotProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableHoneypot {
			c.Next()
			return
		}

		// Only check POST requests
		if c.Request.Method != "POST" {
			c.Next()
			return
		}

		// Check for honeypot fields in form data
		for _, field := range sm.config.HoneypotFields {
			if value := c.PostForm(field); value != "" {
				sm.logger.Warn("Honeypot field filled, likely bot", 
					zap.String("field", field),
					zap.String("value", value),
					zap.String("ip", c.ClientIP()),
					zap.String("userAgent", c.GetHeader("User-Agent")))
				
				c.JSON(http.StatusBadRequest, gin.H{
					"error": map[string]interface{}{
						"code":    "INVALID_REQUEST",
						"message": "Invalid request",
					},
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// RequestLogging middleware logs requests and responses
func (sm *SecurityMiddleware) RequestLogging() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !sm.config.EnableRequestLogging {
			c.Next()
			return
		}

		start := time.Now()
		requestID := uuid.New().String()
		
		// Set request ID in context
		c.Set("requestID", requestID)
		c.Header("X-Request-ID", requestID)

		// Log request
		sm.logger.Info("Request started",
			zap.String("requestID", requestID),
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.String("query", c.Request.URL.RawQuery),
			zap.String("ip", c.ClientIP()),
			zap.String("userAgent", c.GetHeader("User-Agent")),
			zap.String("referer", c.GetHeader("Referer")))

		c.Next()

		// Log response
		duration := time.Since(start)
		sm.logger.Info("Request completed",
			zap.String("requestID", requestID),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("duration", duration),
			zap.Int("size", c.Writer.Size()))
	}
}

// Helper methods

func (sm *SecurityMiddleware) isOriginAllowed(origin string) bool {
	if len(sm.config.AllowedOrigins) == 0 {
		return false
	}

	for _, allowed := range sm.config.AllowedOrigins {
		if allowed == "*" || allowed == origin {
			return true
		}
	}

	return false
}

func (sm *SecurityMiddleware) getRateLimiter(key string) *rate.Limiter {
	if limiter, exists := sm.rateLimiter[key]; exists {
		return limiter
	}

	limiter := rate.NewLimiter(rate.Limit(sm.config.RateLimit), sm.config.RateBurst)
	sm.rateLimiter[key] = limiter
	return limiter
}

func (sm *SecurityMiddleware) isValidAPIKey(apiKey string) bool {
	for validKey := range sm.config.ValidAPIKeys {
		if subtle.ConstantTimeCompare([]byte(apiKey), []byte(validKey)) == 1 {
			return true
		}
	}
	return false
}

// Timeout middleware adds request timeout
func (sm *SecurityMiddleware) Timeout() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), sm.config.RequestTimeout)
		defer cancel()

		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}
