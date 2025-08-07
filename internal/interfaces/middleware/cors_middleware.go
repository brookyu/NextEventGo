package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CORSMiddleware handles Cross-Origin Resource Sharing (CORS) headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Allow requests from frontend development server
		origin := c.Request.Header.Get("Origin")

		// Explicitly allow localhost origins
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3001", // Frontend development server
			"http://127.0.0.1:3000",
			"http://127.0.0.1:3001",
			"http://localhost:5173", // Vite default
		}

		originAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				originAllowed = true
				break
			}
		}

		if originAllowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else if origin == "" {
			c.Header("Access-Control-Allow-Origin", "*")
		} else {
			// For development, allow any localhost origin
			c.Header("Access-Control-Allow-Origin", origin)
		}

		// Set CORS headers
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Max-Age", "86400")

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
