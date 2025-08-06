package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/infrastructure/repositories"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
	"github.com/zenteam/nextevent-go/internal/jobs"
)

func main() {
	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Starting NextEvent Worker Service")

	// Initialize database connection with hardcoded config for now
	db, err := initDatabase(logger)
	if err != nil {
		logger.Fatal("Failed to initialize database", zap.Error(err))
	}

	// Initialize Redis connection with hardcoded config for now
	redisClient, err := initRedis(logger)
	if err != nil {
		logger.Fatal("Failed to initialize Redis", zap.Error(err))
	}
	defer redisClient.Close()

	// Initialize repositories
	newsRepo := repositories.NewGormNewsRepository(db)

	// Initialize WeChat workflow (optional - only if WeChat is enabled)
	var newsPublisher *wechat.NewsPublisher
	if getEnv("WECHAT_ENABLED", "false") == "true" {
		wechatConfig := &wechat.Config{
			AppID:                 getEnv("WECHAT_APP_ID", ""),
			AppSecret:             getEnv("WECHAT_APP_SECRET", ""),
			Token:                 getEnv("WECHAT_TOKEN", ""),
			EncodingAESKey:        getEnv("WECHAT_ENCODING_AES_KEY", ""),
			VerifySignature:       true,
			CacheAccessToken:      true,
			AccessTokenCacheKey:   "wechat:access_token",
			AccessTokenExpireTime: 7200 * time.Second,
		}

		workflowConfig := &wechat.WorkflowConfig{
			HostURL:         getEnv("HOST_URL", "http://localhost:8080"),
			WechatServerURL: getEnv("WECHAT_SERVER_URL", "http://localhost:8080"),
			TempDir:         getEnv("TEMP_DIR", "/tmp/nextevent-wechat"),
			WeChat:          *wechatConfig,
		}

		workflow, err := wechat.NewWorkflow(db, redisClient, workflowConfig, logger)
		if err != nil {
			logger.Warn("Failed to initialize WeChat workflow, continuing without WeChat integration", zap.Error(err))
		} else {
			newsPublisher = workflow.GetNewsPublisher()
			logger.Info("WeChat integration initialized successfully")
		}
	}

	// Create a simplified job handler that only handles basic operations
	jobHandler := jobs.NewSimpleJobHandler(newsRepo, logger)

	// Initialize job components
	jobScheduler := jobs.NewAsynqScheduler(redisClient, logger)
	defer jobScheduler.Close()

	// Initialize worker server
	workerServer := jobs.NewWorkerServer(redisClient, jobHandler, logger)

	// Initialize cron scheduler
	cronScheduler := jobs.NewCronScheduler(jobScheduler, newsRepo, newsPublisher, logger)

	// Initialize worker manager
	workerManager := jobs.NewWorkerManager(logger)
	workerManager.AddWorker(workerServer)

	// Start services
	logger.Info("Starting worker services...")

	// Start cron scheduler
	cronScheduler.Start()

	// Start worker servers
	if err := workerManager.StartAll(); err != nil {
		logger.Fatal("Failed to start workers", zap.Error(err))
	}

	logger.Info("Worker service started successfully")

	// Wait for shutdown signal
	waitForShutdown(logger, func() {
		logger.Info("Shutting down worker service...")

		// Stop cron scheduler
		cronScheduler.Stop()

		// Stop worker servers
		workerManager.StopAll()

		logger.Info("Worker service shutdown completed")
	})
}

// initDatabase initializes the database connection with hardcoded config
func initDatabase(logger *zap.Logger) (*gorm.DB, error) {
	// Use environment variables or hardcoded values for now
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "3306")
	username := getEnv("DB_USERNAME", "root")
	password := getEnv("DB_PASSWORD", "")
	dbname := getEnv("DB_NAME", "nextevent")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		username, password, host, port, dbname)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		// Use default logger for now
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	logger.Info("Database connection established successfully")
	return db, nil
}

// initRedis initializes the Redis connection with hardcoded config
func initRedis(logger *zap.Logger) (*redis.Client, error) {
	host := getEnv("REDIS_HOST", "localhost")
	port := getEnv("REDIS_PORT", "6379")
	password := getEnv("REDIS_PASSWORD", "")

	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       0,
	})

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	logger.Info("Redis connection established successfully")
	return client, nil
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// waitForShutdown waits for shutdown signals and executes cleanup
func waitForShutdown(logger *zap.Logger, cleanup func()) {
	// Create channel to receive OS signals
	sigChan := make(chan os.Signal, 1)

	// Register channel to receive specific signals
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Block until signal is received
	sig := <-sigChan
	logger.Info("Received shutdown signal", zap.String("signal", sig.String()))

	// Execute cleanup
	cleanup()
}
