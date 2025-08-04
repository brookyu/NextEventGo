package interfaces

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zenteam/nextevent-go/internal/infrastructure"
	"github.com/zenteam/nextevent-go/internal/infrastructure/repositories"
	"github.com/zenteam/nextevent-go/internal/infrastructure/services"
	"github.com/zenteam/nextevent-go/internal/interfaces/controllers"
	"github.com/zenteam/nextevent-go/internal/interfaces/middleware"
	"github.com/zenteam/nextevent-go/internal/simple"
)

func SetupRoutes(router *gin.Engine, infra *infrastructure.Infrastructure) {
	// Add CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Initialize repositories
	eventRepo := repositories.NewGormSiteEventRepository(infra.DB)
	userRepo := repositories.NewGormUserRepository(infra.DB)
	attendeeRepo := repositories.NewGormEventAttendeeRepository(infra.DB)

	// Initialize services
	eventService := services.NewEventService(eventRepo, userRepo, attendeeRepo, infra.Logger, infra.DB)
	// attendeeService := services.NewAttendeeService(attendeeRepo, eventRepo, userRepo, infra.Logger, infra.DB)
	// qrCodeService := services.NewQRCodeService(eventRepo, attendeeRepo, infra.RedisClient, infra.Logger)

	// Initialize WeChat service with event integration
	// wechatService, err := services.NewWeChatServiceSimple(infra.Config, infra.Logger, infra.RedisClient, eventService, nil)
	// if err != nil {
	//	infra.Logger.Fatal("Failed to initialize WeChat service", zap.Error(err))
	// }

	// Initialize controllers
	authController := controllers.NewAuthController(infra.Config, infra.Logger)
	// wechatController := controllers.NewWeChatController(wechatService, infra.Logger)
	eventController := controllers.NewEventController(eventService, nil, nil, infra.Logger)
	simpleAttendeeController := controllers.NewSimpleAttendeeController(infra.DB, infra.Logger)
	// imageController := controllers.NewImageController(imageService, imageCategoryService, infra.Logger)
	// imageCategoryController := controllers.NewImageCategoryController(imageCategoryService, infra.Logger)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "nextevent-api",
		})
	})

	// Initialize API handlers for missing endpoints
	apiHandlers := simple.NewAPIHandlers(infra.DB, infra.Config)
	uploadHandlers := simple.NewUploadHandlers(infra.DB, infra.Config)

	// Setup API v2 routes (restored from main.bak)
	api := router.Group("/api/v2")
	{
		// Image endpoints
		api.GET("/images/stats", apiHandlers.GetImageStats)
		api.GET("/images", apiHandlers.GetImages)
		api.DELETE("/images/:id", apiHandlers.DeleteImage)
		api.POST("/images/upload", uploadHandlers.UploadImage)

		// Articles endpoints
		api.GET("/articles", apiHandlers.GetArticles)
		api.GET("/articles/:id", apiHandlers.GetArticle)
		api.POST("/articles", apiHandlers.CreateArticle)
		api.PUT("/articles/:id", apiHandlers.UpdateArticle)
		api.DELETE("/articles/:id", apiHandlers.DeleteArticle)

		// Categories endpoint
		api.GET("/categories", apiHandlers.GetCategories)

		// Tags endpoint
		api.GET("/tags", apiHandlers.GetTags)

		// Videos endpoints
		api.GET("/videos", apiHandlers.GetVideos)
		api.POST("/videos/upload", uploadHandlers.UploadVideo)
		api.GET("/videos/:id/status", uploadHandlers.GetVideoStatus)
		api.GET("/videos/test-credentials", uploadHandlers.TestUploadCredentials)
		api.GET("/videos/categories", apiHandlers.GetVideoCategories)

		// News endpoint
		api.GET("/news", apiHandlers.GetNews)

		// Events endpoints
		api.GET("/events", apiHandlers.GetEvents)
		api.GET("/events/current", apiHandlers.GetCurrentEvent)

		// Authentication endpoint
		api.POST("/auth/login", apiHandlers.Login)
	}

	// Setup API v1 routes for frontend compatibility (proxy to v2)
	apiv1 := router.Group("/api/v1")
	{
		// Images endpoints (proxy to v2)
		apiv1.GET("/images", apiHandlers.GetImages)
		apiv1.DELETE("/images/:id", apiHandlers.DeleteImage)
		apiv1.POST("/images/upload", uploadHandlers.UploadImage)

		// Image categories endpoints
		apiv1.GET("/image-categories", apiHandlers.GetCategories)

		// Articles endpoints (proxy to v2) - using different paths to avoid conflicts
		apiv1.GET("/content/articles", apiHandlers.GetArticles)
		apiv1.GET("/content/articles/:id", apiHandlers.GetArticle)
		apiv1.POST("/content/articles", apiHandlers.CreateArticle)
		apiv1.PUT("/content/articles/:id", apiHandlers.UpdateArticle)
		apiv1.DELETE("/content/articles/:id", apiHandlers.DeleteArticle)

		// Videos endpoints (proxy to v2)
		apiv1.GET("/content/videos", apiHandlers.GetVideos)

		// News endpoint (proxy to v2)
		apiv1.GET("/content/news", apiHandlers.GetNews)
	}

	// Placeholder image for missing files (must be before static routes)
	router.GET("/placeholder.jpg", func(c *gin.Context) {
		// Return a simple 1x1 transparent pixel or redirect to a default image
		c.Header("Content-Type", "image/jpeg")
		c.Header("Cache-Control", "public, max-age=3600")
		// Simple 1x1 pixel JPEG (base64 encoded)
		pixel := []byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xB2, 0xC0, 0x07, 0xFF, 0xD9}
		c.Data(200, "image/jpeg", pixel)
	})

	// Static file server for uploaded files
	router.Static("/uploads", "./uploads")

	// Backward compatibility: serve old MediaFiles/1/ path from uploads/images
	router.Static("/MediaFiles/1", "./uploads/images")

	// Static file server for 135Editor resources
	router.Static("/resource", "./web/public/resource")

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "NextEvent Go API",
			"version": "2.0.0",
			"status":  "running",
			"endpoints": []string{
				"/health",
				"/api/v2/images",
				"/api/v2/articles",
				"/api/v2/news",
				"/api/v2/videos",
				"/api/v2/events",
			},
		})
	})

	// WeChat webhook endpoints (commented out due to missing service)
	// wechatGroup := router.Group("/wechat")
	// {
	//	// Webhook verification and message handling
	//	wechatGroup.GET("/webhook", wechatController.VerifyWebhook)
	//	wechatGroup.POST("/webhook", wechatController.HandleWebhook)
	//
	//	// WeChat API endpoints
	//	wechatGroup.GET("/token", wechatController.GetAccessToken)
	//	wechatGroup.POST("/token/refresh", wechatController.RefreshAccessToken)
	//	wechatGroup.POST("/message/send", wechatController.SendMessage)
	//	wechatGroup.GET("/user/:openid", wechatController.GetUserInfo)
	//	wechatGroup.POST("/qrcode", wechatController.CreateQRCode)
	//	wechatGroup.GET("/health", wechatController.HealthCheck)
	// }

	// Authentication routes (public)
	auth := router.Group("/api/v1/auth")
	{
		auth.POST("/login", authController.Login)
		auth.POST("/logout", authController.Logout)
		auth.POST("/refresh", authController.RefreshToken)
		auth.GET("/me", authController.GetCurrentUser)
	}

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		v1.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "WeChat Event Management API - Ready for Development",
				"version": "v1.0.0",
			})
		})

		// Event management endpoints (protected)
		events := v1.Group("/events")
		events.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			events.POST("/", eventController.CreateEvent)
			events.GET("/", eventController.GetEvents)
			events.GET("/current", eventController.GetCurrentEvent)
			events.GET("/:id", eventController.GetEvent)
			events.PUT("/:id", eventController.UpdateEvent)
			events.DELETE("/:id", eventController.DeleteEvent)
			events.POST("/:id/set-current", eventController.SetCurrentEvent)
			events.GET("/:id/statistics", eventController.GetEventStatistics)

			// Event attendees
			events.GET("/:id/attendees", simpleAttendeeController.GetEventAttendees)
		}

		// Attendee management endpoints (protected) - Temporarily disabled
		// attendees := v1.Group("/attendees")
		// attendees.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		// {
		//	attendees.POST("/", attendeeController.RegisterAttendee)
		//	attendees.GET("/:id", attendeeController.GetAttendee)
		//	attendees.POST("/:id/checkin", attendeeController.CheckInAttendee)
		//	attendees.POST("/checkin/qr", attendeeController.CheckInByQRCode)
		//	attendees.GET("/status", attendeeController.GetCheckInStatus)
		//	attendees.POST("/:id/qrcode", attendeeController.GenerateAttendeeQRCode)
		//	attendees.POST("/:id/cancel", attendeeController.CancelRegistration)
		// }

		// User management endpoints (placeholder)
		users := v1.Group("/users")
		{
			users.GET("/", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Users endpoint - coming soon",
				})
			})
		}

		// Image management endpoints (commented out due to missing controllers)
		// images := v1.Group("/images")
		// images.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		// {
		//	// Image upload with file validation middleware
		//	uploadConfig := middleware.DefaultImageUploadConfig()
		//	images.POST("/upload",
		//		middleware.FileUploadMiddleware(uploadConfig, infra.Logger),
		//		imageController.UploadImage)
		//
		//	images.GET("/", imageController.GetImages)
		//	images.GET("/:id", imageController.GetImage)
		//	images.PUT("/:id", imageController.UpdateImage)
		//	images.DELETE("/:id", imageController.DeleteImage)
		// }

		// Image category management endpoints (commented out due to missing controllers)
		// categories := v1.Group("/image-categories")
		// categories.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		// {
		//	categories.POST("/", imageCategoryController.CreateCategory)
		//	categories.GET("/", imageCategoryController.GetCategories)
		//	categories.GET("/:id", imageCategoryController.GetCategory)
		//	categories.PUT("/:id", imageCategoryController.UpdateCategory)
		//	categories.DELETE("/:id", imageCategoryController.DeleteCategory)
		// }
	}

	// Setup API v2 routes would go here if needed
}
