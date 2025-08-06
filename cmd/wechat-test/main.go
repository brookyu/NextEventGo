package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
)

func main() {
	var (
		testType = flag.String("test", "connectivity", "Type of test to run: connectivity, preprocessing, health, stats")
		verbose  = flag.Bool("verbose", false, "Enable verbose logging")
	)
	flag.Parse()

	// Initialize logger
	var logger *zap.Logger
	var err error
	if *verbose {
		logger, err = zap.NewDevelopment()
	} else {
		logger, err = zap.NewProduction()
	}
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Starting WeChat integration test", zap.String("testType", *testType))

	// Load configuration from environment
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load configuration", zap.Error(err))
	}

	// Initialize database
	db, err := initDatabase(cfg, logger)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize Redis
	redisClient, err := initRedis(cfg, logger)
	if err != nil {
		logger.Fatal("Failed to initialize Redis", zap.Error(err))
	}

	// Initialize WeChat workflow
	workflowConfig := &wechat.WorkflowConfig{
		HostURL:         cfg.App.SelfURL,
		WechatServerURL: cfg.App.SelfURL, // Use same URL for now
		TempDir:         "/tmp/nextevent-wechat",
		WeChat: wechat.Config{
			AppID:                 cfg.WeChat.PublicAccount.AppID,
			AppSecret:             cfg.WeChat.PublicAccount.AppSecret,
			Token:                 cfg.WeChat.PublicAccount.Token,
			EncodingAESKey:        cfg.WeChat.PublicAccount.AESKey,
			VerifySignature:       true,
			CacheAccessToken:      true,
			AccessTokenCacheKey:   "wechat:access_token",
			AccessTokenExpireTime: 7200 * time.Second,
		},
	}

	workflow, err := wechat.NewWorkflow(db, redisClient, workflowConfig, logger)
	if err != nil {
		logger.Fatal("Failed to initialize WeChat workflow", zap.Error(err))
	}

	// Initialize test integration
	testIntegration := wechat.NewTestIntegration(workflow, logger)

	// Run tests
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	switch *testType {
	case "all":
		err = testIntegration.RunAllTests(ctx)
	case "connectivity":
		err = testIntegration.TestWeChatConnectivity(ctx)
	case "preprocessing":
		err = testIntegration.TestContentPreprocessing(ctx)
	case "workflow":
		err = testIntegration.TestPublishingWorkflow(ctx, db)
	case "health":
		err = testIntegration.TestHealthCheck(ctx)
	case "stats":
		err = testIntegration.TestWorkflowStats(ctx)
	default:
		logger.Fatal("Unknown test type", zap.String("testType", *testType))
	}

	if err != nil {
		logger.Fatal("Test failed", zap.Error(err))
	}

	logger.Info("All tests completed successfully")
}

func initDatabase(cfg *config.Config, logger *zap.Logger) (*gorm.DB, error) {
	logger.Info("Initializing database connection")

	db, err := gorm.Open(mysql.Open(cfg.Database.ConnectionString), &gorm.Config{
		Logger: nil, // Disable GORM logging for cleaner output
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test connection
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection established")
	return db, nil
}

func initRedis(cfg *config.Config, logger *zap.Logger) (*redis.Client, error) {
	logger.Info("Initializing Redis connection")

	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	logger.Info("Redis connection established")
	return client, nil
}

func init() {
	// Ensure temp directory exists
	if err := os.MkdirAll("/tmp/nextevent-wechat", 0755); err != nil {
		log.Printf("Warning: Failed to create temp directory: %v", err)
	}
}
