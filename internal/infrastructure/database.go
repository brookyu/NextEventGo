package infrastructure

import (
	"fmt"
	"time"

	"github.com/zenteam/nextevent-go/internal/config"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"go.uber.org/zap"
	"gorm.io/driver/mysql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// initDatabase initializes the GORM database connection
func initDatabase(cfg *config.Config, zapLogger *zap.Logger) (*gorm.DB, error) {
	zapLogger.Info("Database configuration",
		zap.String("driver", cfg.Database.Driver),
		zap.String("dbname", cfg.Database.DBName),
		zap.String("host", cfg.Database.Host),
	)

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	var db *gorm.DB
	var err error

	if cfg.Database.Driver == "sqlite" {
		zapLogger.Info("Using SQLite database", zap.String("file", cfg.Database.DBName))
		db, err = gorm.Open(sqlite.Open(cfg.Database.DBName), gormConfig)
	} else {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.Database.Username,
			cfg.Database.Password,
			cfg.Database.Host,
			cfg.Database.Port,
			cfg.Database.DBName,
		)
		db, err = gorm.Open(mysql.Open(dsn), gormConfig)
	}
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

	zapLogger.Info("Database connection established")
	return db, nil
}

// autoMigrate runs database migrations for all entities
func (i *Infrastructure) autoMigrate() error {
	return i.DB.AutoMigrate(
		// Core entities
		&entities.User{},
		&entities.SiteEvent{},
		&entities.EventAttendee{},

		// Content management entities
		&entities.SiteArticle{},
		&entities.News{},
		&entities.NewsCategory{},
		&entities.NewsCategoryAssociation{},
		&entities.NewsArticle{},

		// Image management entities
		&entities.ImageCategory{},
		&entities.SiteImage{},

		// Analytics entities
		&entities.Hit{},

		// WeChat integration entities
		&entities.WeChatMessage{},
		&entities.WeChatUser{},
	)
}
