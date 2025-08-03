package simple

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config holds basic configuration for the simple API
type Config struct {
	Database DatabaseConfig
	WeChat   WeChatConfig
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Host     string
	Port     string
	Name     string
	Username string
	Password string
}

// WeChatConfig holds WeChat configuration
type WeChatConfig struct {
	AppID     string
	AppSecret string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "127.0.0.1"),
			Port:     getEnv("DB_PORT", "3306"),
			Name:     getEnv("DB_NAME", "NextEventDB6"),
			Username: getEnv("DB_USERNAME", "root"),
			Password: getEnv("DB_PASSWORD", "~Brook1226,"),
		},
		WeChat: WeChatConfig{
			AppID:     getEnv("WECHAT_PUBLIC_ACCOUNT_APP_ID", "wx9be741fb80d04fb9"),
			AppSecret: getEnv("WECHAT_PUBLIC_ACCOUNT_APP_SECRET", "5e12e8a8f9b4e25e934b41c2a71b030b"),
		},
	}
}

// ConnectDatabase establishes database connection
func (c *Config) ConnectDatabase() (*gorm.DB, error) {
	// Build MySQL connection string with proper UTF-8 support
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci",
		c.Database.Username, c.Database.Password, c.Database.Host, c.Database.Port, c.Database.Name)

	// Try to connect to database
	log.Printf("Attempting to connect to MySQL: %s@%s:%s/%s", 
		c.Database.Username, c.Database.Host, c.Database.Port, c.Database.Name)
	
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		log.Println("Continuing without database...")
		return nil, err
	}
	
	log.Println("Connected to database successfully")
	log.Println("Skipping migrations - using existing database schema")
	return db, nil
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
