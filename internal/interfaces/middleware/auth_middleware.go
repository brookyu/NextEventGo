package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/zenteam/nextevent-go/internal/config"
	"go.uber.org/zap"
)

// JWTClaims represents JWT claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware creates a JWT authentication middleware
func AuthMiddleware(config *config.Config, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Check if header starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Extract token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(config.Security.JWT.Secret), nil
		})

		if err != nil {
			logger.Warn("Invalid JWT token", zap.Error(err))
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
			// Set user information in context
			c.Set("user_id", claims.UserID)
			c.Set("username", claims.Username)
			c.Set("user_role", claims.Role)

			logger.Debug("User authenticated",
				zap.String("user_id", claims.UserID),
				zap.String("username", claims.Username),
				zap.String("role", claims.Role))

			c.Next()
		} else {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}
	}
}

// OptionalAuthMiddleware creates an optional JWT authentication middleware
// This middleware will set user context if a valid token is provided, but won't fail if no token is present
func OptionalAuthMiddleware(config *config.Config, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.Next()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(config.Security.JWT.Secret), nil
		})

		if err == nil {
			if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
				c.Set("user_id", claims.UserID)
				c.Set("username", claims.Username)
				c.Set("user_role", claims.Role)
			}
		}

		c.Next()
	}
}

// RequireRole creates a middleware that requires a specific role
func RequireRole(requiredRole string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		if userRole.(string) != requiredRole && userRole.(string) != "admin" {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequirePermission creates a middleware that requires a specific permission
func RequirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			// Ensure CORS headers are preserved in error response
			c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
			c.Header("Access-Control-Allow-Credentials", "true")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		// Admin has all permissions
		if userRole.(string) == "admin" {
			c.Next()
			return
		}

		// For now, we'll implement a simple role-based permission check
		// In a real implementation, you'd check against a permissions database
		switch permission {
		case "events:write", "events:delete":
			if userRole.(string) != "manager" && userRole.(string) != "admin" {
				// Ensure CORS headers are preserved in error response
				c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
				c.Header("Access-Control-Allow-Credentials", "true")
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		case "settings:write":
			if userRole.(string) != "admin" {
				// Ensure CORS headers are preserved in error response
				c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
				c.Header("Access-Control-Allow-Credentials", "true")
				c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
