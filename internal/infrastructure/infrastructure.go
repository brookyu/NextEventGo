package infrastructure

import (
	"fmt"

	"github.com/redis/go-redis/v9"
	"github.com/zenteam/nextevent-go/internal/config"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Infrastructure struct {
	Config      *config.Config
	DB          *gorm.DB
	RedisClient *redis.Client
	Logger      *zap.Logger
}

func Initialize(cfg *config.Config) (*Infrastructure, error) {
	// Initialize logger
	zapLogger, err := initLogger(cfg.Logging.Level)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize logger: %w", err)
	}

	// Initialize database
	db, err := initDatabase(cfg, zapLogger)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize database: %w", err)
	}

	// Initialize Redis (optional)
	redisClient, err := initRedis(cfg, zapLogger)
	if err != nil {
		zapLogger.Warn("Failed to initialize Redis, continuing without Redis", zap.Error(err))
		redisClient = nil
	}

	infra := &Infrastructure{
		Config:      cfg,
		DB:          db,
		RedisClient: redisClient,
		Logger:      zapLogger,
	}

	// Skip auto-migration for now - use existing database schema
	// if err := infra.autoMigrate(); err != nil {
	//	return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	// }

	zapLogger.Info("Infrastructure initialized successfully")
	return infra, nil
}

func (i *Infrastructure) Close() {
	if i.RedisClient != nil {
		i.RedisClient.Close()
	}

	if i.DB != nil {
		sqlDB, err := i.DB.DB()
		if err == nil {
			sqlDB.Close()
		}
	}

	if i.Logger != nil {
		i.Logger.Sync()
	}
}

// initLogger initializes the Zap logger
func initLogger(level string) (*zap.Logger, error) {
	var config zap.Config

	switch level {
	case "debug":
		config = zap.NewDevelopmentConfig()
	case "production":
		config = zap.NewProductionConfig()
	default:
		config = zap.NewDevelopmentConfig()
	}

	return config.Build()
}

// Database and Redis initialization functions are in separate files
