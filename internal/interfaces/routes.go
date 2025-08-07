package interfaces

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zenteam/nextevent-go/internal/application/services"
	"github.com/zenteam/nextevent-go/internal/infrastructure"
	"github.com/zenteam/nextevent-go/internal/infrastructure/repositories"
	infraServices "github.com/zenteam/nextevent-go/internal/infrastructure/services"
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
	articleRepo := repositories.NewGormSiteArticleRepository(infra.DB)
	surveyRepo := repositories.NewGormSurveyRepository(infra.DB)
	videoRepo := repositories.NewGormVideoRepository(infra.DB)
	categoryRepo := repositories.NewGormArticleCategoryRepository(infra.DB)
	wechatUserRepo := repositories.NewGormWeChatUserRepository(infra.DB)

	// Initialize services
	eventService := infraServices.NewEventService(eventRepo, userRepo, attendeeRepo, infra.Logger, infra.DB)
	siteEventService := services.NewSiteEventService(eventRepo, articleRepo, surveyRepo, videoRepo, categoryRepo, infra.Logger)
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
	wechatUsersController := controllers.NewWeChatUsersController(wechatUserRepo, infra.Logger)
	eventController := controllers.NewEventController(eventService, nil, nil, infra.Logger)
	siteEventController := controllers.NewSiteEventController(siteEventService, infra.Logger)
	simpleAttendeeController := controllers.NewSimpleAttendeeController(infra.DB, infra.Logger)
	// imageController := controllers.NewImageController(imageService, imageCategoryService, infra.Logger)
	// imageCategoryController := controllers.NewImageCategoryController(imageCategoryService, infra.Logger)

	// Initialize survey service and controller
	surveyService := services.NewSurveyService(infra.DB)
	surveyController := controllers.NewSurveyController(surveyService, infra.Logger)

	// Initialize mobile controller
	mobileController := controllers.NewMobileController(surveyService, infra.Logger)

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
	cloudVideoHandlers := simple.NewCloudVideoHandlers(infra.DB)

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

		// Article WeChat endpoints (mock implementation)
		api.POST("/articles/:id/wechat/qrcode", apiHandlers.GenerateArticleQRCode)
		api.GET("/articles/:id/wechat/qrcodes", apiHandlers.GetArticleQRCodes)
		api.GET("/articles/:id/wechat/share-info", apiHandlers.GetArticleWeChatShareInfo)

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

		// Cloud Video Management endpoints
		api.GET("/cloud-videos", cloudVideoHandlers.GetCloudVideos)
		api.GET("/cloud-videos/:id", cloudVideoHandlers.GetCloudVideo)
		api.POST("/cloud-videos", cloudVideoHandlers.CreateCloudVideo)
		api.PUT("/cloud-videos/:id", cloudVideoHandlers.UpdateCloudVideo)
		api.DELETE("/cloud-videos/:id", cloudVideoHandlers.DeleteCloudVideo)
		api.POST("/cloud-videos/:id/generate-stream-key", cloudVideoHandlers.GenerateStreamKey)

		// Video Session endpoints
		api.GET("/video-sessions", apiHandlers.GetVideoSessions)
		api.POST("/video-sessions", apiHandlers.CreateVideoSession)
		api.PUT("/video-sessions/:id", apiHandlers.UpdateVideoSession)

		// News endpoints - Enhanced CRUD operations
		api.GET("/news", apiHandlers.GetNews)
		api.POST("/news", apiHandlers.CreateNews)
		api.GET("/news/:id", apiHandlers.GetNewsById)
		api.GET("/news/:id/for-editing", apiHandlers.GetNewsForEditing)
		api.PUT("/news/:id", apiHandlers.UpdateNews)
		api.DELETE("/news/:id", apiHandlers.DeleteNews)
		api.POST("/news/:id/publish", apiHandlers.PublishNews)
		api.POST("/news/:id/unpublish", apiHandlers.UnpublishNews)
		api.POST("/news/bulk/publish", apiHandlers.BulkPublishNews)
		api.POST("/news/bulk/delete", apiHandlers.BulkDeleteNews)

		// News creation - Article and Image selection endpoints
		api.GET("/news/articles/search", apiHandlers.SearchArticlesForSelection)
		api.GET("/news/images/search", apiHandlers.SearchImagesForSelection)

		// Enhanced news creation with selectors
		api.POST("/news/create-with-selectors", apiHandlers.CreateNewsWithSelectors)

		// Events endpoints (legacy)
		api.GET("/events", apiHandlers.GetEvents)
		api.GET("/events/current", apiHandlers.GetCurrentEvent)

		// Site Events endpoints (new comprehensive API)
		api.GET("/site-events", siteEventController.GetSiteEvents)
		api.GET("/site-events/current", siteEventController.GetCurrentEvent)
		api.GET("/site-events/:id", siteEventController.GetSiteEvent)
		api.GET("/site-events/:id/for-editing", siteEventController.GetSiteEventForEditing)
		api.POST("/site-events", siteEventController.CreateSiteEvent)
		api.PUT("/site-events/:id", siteEventController.UpdateSiteEvent)
		api.DELETE("/site-events/:id", siteEventController.DeleteSiteEvent)
		api.POST("/site-events/:id/toggle-current", siteEventController.ToggleCurrentEvent)

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

		// Tags endpoints (proxy to v2)
		apiv1.GET("/tags", apiHandlers.GetTags)

		// Categories endpoints (proxy to v2)
		apiv1.GET("/categories", apiHandlers.GetCategories)

		// Videos endpoints (proxy to v2)
		apiv1.GET("/videos", apiHandlers.GetVideos)
		apiv1.GET("/videos/:id", apiHandlers.GetVideo)
		apiv1.POST("/videos/upload", uploadHandlers.UploadVideo)
		apiv1.GET("/videos/:id/status", uploadHandlers.GetVideoStatus)
		apiv1.GET("/videos/categories", apiHandlers.GetVideoCategories)

		// Articles endpoints (proxy to v2) - direct paths
		apiv1.GET("/articles", apiHandlers.GetArticles)
		apiv1.GET("/articles/:id", apiHandlers.GetArticle)
		apiv1.POST("/articles", apiHandlers.CreateArticle)
		apiv1.PUT("/articles/:id", apiHandlers.UpdateArticle)
		apiv1.DELETE("/articles/:id", apiHandlers.DeleteArticle)

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

		// Site Events endpoints (protected) - v1 compatibility
		siteEvents := v1.Group("/site-events")
		siteEvents.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			siteEvents.GET("/", siteEventController.GetSiteEvents)
			siteEvents.GET("/current", siteEventController.GetCurrentEvent)
			siteEvents.GET("/:id", siteEventController.GetSiteEvent)
			siteEvents.GET("/:id/for-editing", siteEventController.GetSiteEventForEditing)
			siteEvents.POST("/", siteEventController.CreateSiteEvent)
			siteEvents.PUT("/:id", siteEventController.UpdateSiteEvent)
			siteEvents.DELETE("/:id", siteEventController.DeleteSiteEvent)
			siteEvents.POST("/:id/toggle-current", siteEventController.ToggleCurrentEvent)
		}

		// Add direct routes without trailing slash to avoid redirects
		v1SiteEventsAuth := v1.Group("")
		v1SiteEventsAuth.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			v1SiteEventsAuth.GET("/site-events", siteEventController.GetSiteEvents)
		}

		// Survey management endpoints (protected)
		surveys := v1.Group("/surveys")
		surveys.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			surveys.GET("/", surveyController.GetSurveyList)
			surveys.POST("/", surveyController.CreateSurvey)
			surveys.GET("/:surveyId", surveyController.GetSurvey)
			surveys.PUT("/:surveyId", surveyController.UpdateSurvey)
			surveys.DELETE("/:surveyId", surveyController.DeleteSurvey)
			surveys.GET("/:surveyId/questions", surveyController.GetSurveyWithQuestions)

			// Question management for surveys
			surveys.POST("/:surveyId/questions", surveyController.CreateQuestion)
			surveys.POST("/:surveyId/questions/reorder", surveyController.UpdateQuestionOrder)

			// WeChat QR code endpoints for surveys
			surveys.POST("/:surveyId/wechat/qrcode", surveyController.GenerateSurveyQRCode)
			surveys.GET("/:surveyId/wechat/qrcodes", surveyController.GetSurveyQRCodes)
			surveys.GET("/:surveyId/wechat/share-info", surveyController.GetSurveyWeChatShareInfo)
			surveys.POST("/wechat/qrcodes/:qrCodeId/revoke", surveyController.RevokeSurveyQRCode)
		}

		// Question management endpoints (protected)
		questions := v1.Group("/questions")
		questions.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			questions.GET("/:id", surveyController.GetQuestion)
			questions.PUT("/:id", surveyController.UpdateQuestion)
			questions.DELETE("/:id", surveyController.DeleteQuestion)
		}

		// Public survey endpoints (no authentication required)
		publicSurveys := v1.Group("/public/surveys")
		{
			publicSurveys.GET("/:id", surveyController.GetPublicSurvey)
		}

		// Mobile preview endpoints (no authentication required)
		mobile := v1.Group("/mobile")
		{
			mobile.GET("/articles/:id", mobileController.GetArticlePreview)
			mobile.GET("/surveys/:id", mobileController.GetSurveyPreview)
			mobile.GET("/surveys/:id/participate", mobileController.GetSurveyParticipate)
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

		// WeChat Users management endpoints (protected)
		users := v1.Group("/users")
		users.Use(middleware.AuthMiddleware(infra.Config, infra.Logger))
		{
			users.GET("/", wechatUsersController.GetWeChatUsers)
			users.POST("/", wechatUsersController.CreateWeChatUser)
			users.GET("/statistics", wechatUsersController.GetWeChatUserStatistics)
			users.GET("/:openId", wechatUsersController.GetWeChatUser)
			users.PUT("/:openId", wechatUsersController.UpdateWeChatUser)
			users.DELETE("/:openId", wechatUsersController.DeleteWeChatUser)
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
