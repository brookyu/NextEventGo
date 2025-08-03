package config

import (
	"fmt"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DatabaseManager handles database connections and health checks
type DatabaseManager struct {
	db     *gorm.DB
	config DatabaseConfig
}

// NewDatabaseManager creates a new database manager
func NewDatabaseManager(config DatabaseConfig) *DatabaseManager {
	return &DatabaseManager{
		config: config,
	}
}

// Connect establishes a connection to the database
func (dm *DatabaseManager) Connect() error {
	dsn := dm.buildDSN()

	log.Printf("Attempting to connect to MySQL: %s@%s:%d/%s",
		dm.config.Username, dm.config.Host, dm.config.Port, dm.config.DBName)

	// Configure GORM logger based on environment
	var gormLogger logger.Interface
	gormLogger = logger.Default.LogMode(logger.Silent)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxOpenConns(dm.config.MaxOpenConns)
	sqlDB.SetMaxIdleConns(dm.config.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(dm.config.ConnMaxLifetime)

	dm.db = db
	log.Printf("Connected to database successfully")

	return nil
}

// GetDB returns the database connection
func (dm *DatabaseManager) GetDB() *gorm.DB {
	return dm.db
}

// HealthCheck performs a database health check
func (dm *DatabaseManager) HealthCheck() error {
	if dm.db == nil {
		return fmt.Errorf("database connection is nil")
	}

	sqlDB, err := dm.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("database ping failed: %w", err)
	}

	return nil
}

// Close closes the database connection
func (dm *DatabaseManager) Close() error {
	if dm.db == nil {
		return nil
	}

	sqlDB, err := dm.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	return sqlDB.Close()
}

// GetConnectionStats returns database connection statistics
func (dm *DatabaseManager) GetConnectionStats() map[string]interface{} {
	if dm.db == nil {
		return map[string]interface{}{
			"status": "disconnected",
		}
	}

	sqlDB, err := dm.db.DB()
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"error":  err.Error(),
		}
	}

	stats := sqlDB.Stats()
	return map[string]interface{}{
		"status":              "connected",
		"open_connections":    stats.OpenConnections,
		"in_use":              stats.InUse,
		"idle":                stats.Idle,
		"wait_count":          stats.WaitCount,
		"wait_duration":       stats.WaitDuration.String(),
		"max_idle_closed":     stats.MaxIdleClosed,
		"max_lifetime_closed": stats.MaxLifetimeClosed,
	}
}

// buildDSN builds the database connection string
func (dm *DatabaseManager) buildDSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local&collation=utf8mb4_unicode_ci",
		dm.config.Username,
		dm.config.Password,
		dm.config.Host,
		dm.config.Port,
		dm.config.DBName,
	)
}

// AutoMigrate runs database migrations
func (dm *DatabaseManager) AutoMigrate(models ...interface{}) error {
	if dm.db == nil {
		return fmt.Errorf("database connection is nil")
	}

	log.Printf("Running database migrations...")
	if err := dm.db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Printf("Database migrations completed successfully")
	return nil
}
