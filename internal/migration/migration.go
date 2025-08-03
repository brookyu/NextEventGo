package migration

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

// MigrationStatus represents the status of a migration
type MigrationStatus string

const (
	StatusPending    MigrationStatus = "pending"
	StatusRunning    MigrationStatus = "running"
	StatusCompleted  MigrationStatus = "completed"
	StatusFailed     MigrationStatus = "failed"
	StatusRolledBack MigrationStatus = "rolled_back"
)

// Migration represents a single migration operation
type Migration struct {
	ID          string          `json:"id" gorm:"primaryKey"`
	Name        string          `json:"name" gorm:"not null"`
	Description string          `json:"description"`
	Version     string          `json:"version" gorm:"not null"`
	Status      MigrationStatus `json:"status" gorm:"default:pending"`
	StartedAt   *time.Time      `json:"started_at"`
	CompletedAt *time.Time      `json:"completed_at"`
	ErrorMsg    string          `json:"error_msg"`
	Checksum    string          `json:"checksum"`
	CreatedAt   time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
}

// MigrationStep represents a single step in a migration
type MigrationStep struct {
	ID           string          `json:"id" gorm:"primaryKey"`
	MigrationID  string          `json:"migration_id" gorm:"not null"`
	Name         string          `json:"name" gorm:"not null"`
	Description  string          `json:"description"`
	StepOrder    int             `json:"step_order" gorm:"not null"`
	Status       MigrationStatus `json:"status" gorm:"default:pending"`
	StartedAt    *time.Time      `json:"started_at"`
	CompletedAt  *time.Time      `json:"completed_at"`
	ErrorMsg     string          `json:"error_msg"`
	RecordsTotal int64           `json:"records_total"`
	RecordsDone  int64           `json:"records_done"`
	CreatedAt    time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
}

// MigrationLog represents a log entry for migration operations
type MigrationLog struct {
	ID          string    `json:"id" gorm:"primaryKey"`
	MigrationID string    `json:"migration_id" gorm:"not null"`
	StepID      string    `json:"step_id"`
	Level       string    `json:"level" gorm:"not null"` // info, warn, error
	Message     string    `json:"message" gorm:"not null"`
	Details     string    `json:"details"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// MigrationManager handles all migration operations
type MigrationManager struct {
	db     *gorm.DB
	logger *log.Logger
}

// NewMigrationManager creates a new migration manager
func NewMigrationManager(db *gorm.DB, logger *log.Logger) *MigrationManager {
	return &MigrationManager{
		db:     db,
		logger: logger,
	}
}

// InitializeMigrationTables creates the migration tracking tables
func (m *MigrationManager) InitializeMigrationTables() error {
	return m.db.AutoMigrate(&Migration{}, &MigrationStep{}, &MigrationLog{})
}

// CreateMigration creates a new migration record
func (m *MigrationManager) CreateMigration(ctx context.Context, migration *Migration) error {
	migration.ID = generateID()
	migration.Status = StatusPending
	return m.db.WithContext(ctx).Create(migration).Error
}

// StartMigration starts a migration and marks it as running
func (m *MigrationManager) StartMigration(ctx context.Context, migrationID string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&Migration{}).
		Where("id = ?", migrationID).
		Updates(map[string]interface{}{
			"status":     StatusRunning,
			"started_at": &now,
		}).Error
}

// CompleteMigration marks a migration as completed
func (m *MigrationManager) CompleteMigration(ctx context.Context, migrationID string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&Migration{}).
		Where("id = ?", migrationID).
		Updates(map[string]interface{}{
			"status":       StatusCompleted,
			"completed_at": &now,
		}).Error
}

// FailMigration marks a migration as failed with error message
func (m *MigrationManager) FailMigration(ctx context.Context, migrationID string, errorMsg string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&Migration{}).
		Where("id = ?", migrationID).
		Updates(map[string]interface{}{
			"status":       StatusFailed,
			"completed_at": &now,
			"error_msg":    errorMsg,
		}).Error
}

// AddMigrationStep adds a step to a migration
func (m *MigrationManager) AddMigrationStep(ctx context.Context, step *MigrationStep) error {
	step.ID = generateID()
	step.Status = StatusPending
	return m.db.WithContext(ctx).Create(step).Error
}

// StartMigrationStep starts a migration step
func (m *MigrationManager) StartMigrationStep(ctx context.Context, stepID string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&MigrationStep{}).
		Where("id = ?", stepID).
		Updates(map[string]interface{}{
			"status":     StatusRunning,
			"started_at": &now,
		}).Error
}

// UpdateStepProgress updates the progress of a migration step
func (m *MigrationManager) UpdateStepProgress(ctx context.Context, stepID string, recordsDone int64) error {
	return m.db.WithContext(ctx).Model(&MigrationStep{}).
		Where("id = ?", stepID).
		Update("records_done", recordsDone).Error
}

// CompleteStep marks a migration step as completed
func (m *MigrationManager) CompleteStep(ctx context.Context, stepID string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&MigrationStep{}).
		Where("id = ?", stepID).
		Updates(map[string]interface{}{
			"status":       StatusCompleted,
			"completed_at": &now,
		}).Error
}

// FailStep marks a migration step as failed
func (m *MigrationManager) FailStep(ctx context.Context, stepID string, errorMsg string) error {
	now := time.Now()
	return m.db.WithContext(ctx).Model(&MigrationStep{}).
		Where("id = ?", stepID).
		Updates(map[string]interface{}{
			"status":       StatusFailed,
			"completed_at": &now,
			"error_msg":    errorMsg,
		}).Error
}

// LogMigration adds a log entry for a migration
func (m *MigrationManager) LogMigration(ctx context.Context, migrationID, stepID, level, message, details string) error {
	log := &MigrationLog{
		ID:          generateID(),
		MigrationID: migrationID,
		StepID:      stepID,
		Level:       level,
		Message:     message,
		Details:     details,
	}
	return m.db.WithContext(ctx).Create(log).Error
}

// GetMigration retrieves a migration by ID
func (m *MigrationManager) GetMigration(ctx context.Context, migrationID string) (*Migration, error) {
	var migration Migration
	err := m.db.WithContext(ctx).First(&migration, "id = ?", migrationID).Error
	return &migration, err
}

// GetMigrationSteps retrieves all steps for a migration
func (m *MigrationManager) GetMigrationSteps(ctx context.Context, migrationID string) ([]MigrationStep, error) {
	var steps []MigrationStep
	err := m.db.WithContext(ctx).
		Where("migration_id = ?", migrationID).
		Order("step_order ASC").
		Find(&steps).Error
	return steps, err
}

// GetMigrationLogs retrieves logs for a migration
func (m *MigrationManager) GetMigrationLogs(ctx context.Context, migrationID string, limit int) ([]MigrationLog, error) {
	var logs []MigrationLog
	query := m.db.WithContext(ctx).Where("migration_id = ?", migrationID)
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Order("created_at DESC").Find(&logs).Error
	return logs, err
}

// GetActiveMigrations retrieves all active migrations
func (m *MigrationManager) GetActiveMigrations(ctx context.Context) ([]Migration, error) {
	var migrations []Migration
	err := m.db.WithContext(ctx).
		Where("status IN ?", []MigrationStatus{StatusPending, StatusRunning}).
		Order("created_at ASC").
		Find(&migrations).Error
	return migrations, err
}

// ValidateDataIntegrity performs data integrity validation
func (m *MigrationManager) ValidateDataIntegrity(ctx context.Context, tables []string) error {
	for _, table := range tables {
		// Check for orphaned records
		if err := m.checkOrphanedRecords(ctx, table); err != nil {
			return fmt.Errorf("orphaned records found in table %s: %w", table, err)
		}

		// Check for duplicate records
		if err := m.checkDuplicateRecords(ctx, table); err != nil {
			return fmt.Errorf("duplicate records found in table %s: %w", table, err)
		}
	}
	return nil
}

// checkOrphanedRecords checks for orphaned records in a table
func (m *MigrationManager) checkOrphanedRecords(ctx context.Context, table string) error {
	// Implementation would depend on specific table relationships
	// This is a placeholder for the actual validation logic
	return nil
}

// checkDuplicateRecords checks for duplicate records in a table
func (m *MigrationManager) checkDuplicateRecords(ctx context.Context, table string) error {
	// Implementation would depend on specific table constraints
	// This is a placeholder for the actual validation logic
	return nil
}

// generateID generates a unique ID for migration records
func generateID() string {
	return fmt.Sprintf("mig_%d", time.Now().UnixNano())
}
