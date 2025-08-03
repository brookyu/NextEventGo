package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/config"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// AuthController handles authentication requests
type AuthController struct {
	config *config.Config
	logger *zap.Logger
}

// NewAuthController creates a new auth controller
func NewAuthController(config *config.Config, logger *zap.Logger) *AuthController {
	return &AuthController{
		config: config,
		logger: logger,
	}
}

// User represents a user in the system
type User struct {
	ID          string    `json:"id"`
	Username    string    `json:"username"`
	Email       string    `json:"email"`
	FirstName   string    `json:"firstName,omitempty"`
	LastName    string    `json:"lastName,omitempty"`
	Avatar      string    `json:"avatar,omitempty"`
	Role        string    `json:"role"`
	Permissions []string  `json:"permissions"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	LastLoginAt time.Time `json:"lastLoginAt,omitempty"`
}

// LoginRequest represents login credentials
type LoginRequest struct {
	Username   string `json:"username" binding:"required"`
	Password   string `json:"password" binding:"required"`
	RememberMe bool   `json:"rememberMe"`
}

// LoginResponse represents login response
type LoginResponse struct {
	User      User   `json:"user"`
	Token     string `json:"token"`
	ExpiresIn int64  `json:"expiresIn"`
}

// JWTClaims represents JWT claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// Mock users for demo purposes
var mockUsers = map[string]struct {
	Password string
	User     User
}{
	"admin": {
		Password: "$2a$10$y4g7DDiD6ooyUHsmNVcgIevReYwYH3XIj.1JIq2LLKBcv105OQuWi", // password: admin123
		User: User{
			ID:        uuid.New().String(),
			Username:  "admin",
			Email:     "admin@nextevent.com",
			FirstName: "Admin",
			LastName:  "User",
			Role:      "admin",
			Permissions: []string{
				"events:read", "events:write", "events:delete",
				"attendees:read", "attendees:write", "attendees:delete",
				"wechat:read", "wechat:write",
				"settings:read", "settings:write",
			},
			CreatedAt: time.Now().AddDate(0, -6, 0),
			UpdatedAt: time.Now(),
		},
	},
	"manager": {
		Password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: manager123
		User: User{
			ID:        uuid.New().String(),
			Username:  "manager",
			Email:     "manager@nextevent.com",
			FirstName: "Event",
			LastName:  "Manager",
			Role:      "manager",
			Permissions: []string{
				"events:read", "events:write",
				"attendees:read", "attendees:write",
				"wechat:read",
			},
			CreatedAt: time.Now().AddDate(0, -3, 0),
			UpdatedAt: time.Now(),
		},
	},
}

// Login handles user authentication
func (c *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Find user
	userData, exists := mockUsers[req.Username]
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(userData.Password), []byte(req.Password)); err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate JWT token
	expiresIn := time.Hour * 24 // 24 hours
	if req.RememberMe {
		expiresIn = time.Hour * 24 * 30 // 30 days
	}

	claims := JWTClaims{
		UserID:   userData.User.ID,
		Username: userData.User.Username,
		Role:     userData.User.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "nextevent",
			Subject:   userData.User.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(c.config.Security.JWT.Secret))
	if err != nil {
		c.logger.Error("Failed to generate token", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Update last login time
	user := userData.User
	user.LastLoginAt = time.Now()

	ctx.JSON(http.StatusOK, LoginResponse{
		User:      user,
		Token:     tokenString,
		ExpiresIn: int64(expiresIn.Seconds()),
	})
}

// Logout handles user logout
func (c *AuthController) Logout(ctx *gin.Context) {
	// In a real implementation, you might want to blacklist the token
	ctx.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// GetCurrentUser returns the current authenticated user
func (c *AuthController) GetCurrentUser(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Find user by ID (in real implementation, this would query the database)
	for _, userData := range mockUsers {
		if userData.User.ID == userID.(string) {
			ctx.JSON(http.StatusOK, userData.User)
			return
		}
	}

	ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

// RefreshToken refreshes the JWT token
func (c *AuthController) RefreshToken(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Find user by ID
	for _, userData := range mockUsers {
		if userData.User.ID == userID.(string) {
			// Generate new token
			expiresIn := time.Hour * 24 // 24 hours

			claims := JWTClaims{
				UserID:   userData.User.ID,
				Username: userData.User.Username,
				Role:     userData.User.Role,
				RegisteredClaims: jwt.RegisteredClaims{
					ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiresIn)),
					IssuedAt:  jwt.NewNumericDate(time.Now()),
					NotBefore: jwt.NewNumericDate(time.Now()),
					Issuer:    "nextevent",
					Subject:   userData.User.ID,
				},
			}

			token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
			tokenString, err := token.SignedString([]byte(c.config.Security.JWT.Secret))
			if err != nil {
				c.logger.Error("Failed to generate token", zap.Error(err))
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}

			ctx.JSON(http.StatusOK, LoginResponse{
				User:      userData.User,
				Token:     tokenString,
				ExpiresIn: int64(expiresIn.Seconds()),
			})
			return
		}
	}

	ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}
