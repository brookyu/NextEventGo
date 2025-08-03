package main

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

func main() {
	// Get database configuration from environment
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "nextevent")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")

	// Build MySQL connection string
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// Connect to database
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Connected to database successfully")

	// Run migrations
	if err := runMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	log.Println("Database migrations completed successfully")
}

func runMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Auto-migrate all entities
	entities := []interface{}{
		&entities.SiteImage{},
		&entities.SiteArticle{},
		&entities.News{},
		&entities.NewsArticle{},
		&entities.Video{},
		&entities.VideoCategory{},
		&entities.VideoSession{},
	}

	for _, entity := range entities {
		log.Printf("Migrating %T...", entity)
		if err := db.AutoMigrate(entity); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", entity, err)
		}
	}

	// Create indexes for better performance
	if err := createIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	return nil
}

func createIndexes(db *gorm.DB) error {
	log.Println("Creating database indexes...")

	indexes := []string{
		// SiteImage indexes
		"CREATE INDEX IF NOT EXISTS idx_site_images_status ON site_images(status)",
		"CREATE INDEX IF NOT EXISTS idx_site_images_type ON site_images(type)",
		"CREATE INDEX IF NOT EXISTS idx_site_images_created_at ON site_images(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_site_images_status_type ON site_images(status, type)",

		// SiteArticle indexes
		"CREATE INDEX IF NOT EXISTS idx_site_articles_status ON site_articles(status)",
		"CREATE INDEX IF NOT EXISTS idx_site_articles_published_at ON site_articles(published_at)",
		"CREATE INDEX IF NOT EXISTS idx_site_articles_slug ON site_articles(slug)",
		"CREATE INDEX IF NOT EXISTS idx_site_articles_status_published ON site_articles(status, published_at)",

		// News indexes
		"CREATE INDEX IF NOT EXISTS idx_news_status ON news(status)",
		"CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority)",
		"CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at)",
		"CREATE INDEX IF NOT EXISTS idx_news_status_priority ON news(status, priority)",

		// Video indexes
		"CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)",
		"CREATE INDEX IF NOT EXISTS idx_videos_video_type ON videos(video_type)",
		"CREATE INDEX IF NOT EXISTS idx_videos_start_time ON videos(start_time)",
		"CREATE INDEX IF NOT EXISTS idx_videos_status_type ON videos(status, video_type)",
	}

	for _, indexSQL := range indexes {
		log.Printf("Creating index: %s", indexSQL)
		if err := db.Exec(indexSQL).Error; err != nil {
			// Log warning but don't fail - index might already exist
			log.Printf("Warning: Failed to create index: %v", err)
		}
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
