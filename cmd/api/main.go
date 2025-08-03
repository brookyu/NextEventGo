package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/infrastructure"
	"github.com/zenteam/nextevent-go/internal/interfaces"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize infrastructure (database, redis, etc.)
	infra, err := infrastructure.Initialize(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize infrastructure: %v", err)
	}
	defer infra.Close()

	// Setup Gin router
	router := gin.Default()

	// Initialize API routes
	interfaces.SetupRoutes(router, infra)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	infra.Logger.Info("Starting WeChat Event Management API",
		zap.String("port", port),
		zap.String("mode", cfg.Server.Mode))

	if err := router.Run(":" + port); err != nil {
		infra.Logger.Fatal("Failed to start server", zap.Error(err))
	}
}
