package migration

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

// RollbackPlan represents a rollback plan for a migration
type RollbackPlan struct {
	ID            string           `json:"id" gorm:"primaryKey"`
	MigrationID   string           `json:"migration_id" gorm:"not null"`
	Name          string           `json:"name" gorm:"not null"`
	Description   string           `json:"description"`
	Steps         []RollbackStep   `json:"steps" gorm:"foreignKey:RollbackPlanID"`
	Status        MigrationStatus  `json:"status" gorm:"default:pending"`
	CreatedAt     time.Time        `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time        `json:"updated_at" gorm:"autoUpdateTime"`
	ExecutedAt    *time.Time       `json:"executed_at"`
	CompletedAt   *time.Time       `json:"completed_at"`
}

// RollbackStep represents a single step in a rollback plan
type RollbackStep struct {
	ID             string          `json:"id" gorm:"primaryKey"`
	RollbackPlanID string          `json:"rollback_plan_id" gorm:"not null"`
	Name           string          `json:"name" gorm:"not null"`
	Description    string          `json:"description"`
	StepOrder      int             `json:"step_order" gorm:"not null"`
	StepType       string          `json:"step_type" gorm:"not null"` // sql, api_call, file_operation
	Command        string          `json:"command" gorm:"type:text"`
	Parameters     string          `json:"parameters" gorm:"type:text"`
	Status         MigrationStatus `json:"status" gorm:"default:pending"`
	ExecutedAt     *time.Time      `json:"executed_at"`
	CompletedAt    *time.Time      `json:"completed_at"`
	ErrorMsg       string          `json:"error_msg"`
	CreatedAt      time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time       `json:"updated_at" gorm:"autoUpdateTime"`
}

// RollbackTrigger represents conditions that trigger automatic rollback
type RollbackTrigger struct {
	ID            string    `json:"id" gorm:"primaryKey"`
	MigrationID   string    `json:"migration_id" gorm:"not null"`
	TriggerType   string    `json:"trigger_type" gorm:"not null"` // error_rate, latency, validation_failure
	Threshold     float64   `json:"threshold"`
	TimeWindow    int       `json:"time_window_minutes"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	LastTriggered *time.Time `json:"last_triggered"`
	CreatedAt     time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt     time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// RollbackManager handles rollback operations
type RollbackManager struct {
	db     *gorm.DB
	logger *log.Logger
}

// NewRollbackManager creates a new rollback manager
func NewRollbackManager(db *gorm.DB, logger *log.Logger) *RollbackManager {
	return &RollbackManager{
		db:     db,
		logger: logger,
	}
}

// InitializeRollbackTables creates the rollback tracking tables
func (rm *RollbackManager) InitializeRollbackTables() error {
	return rm.db.AutoMigrate(&RollbackPlan{}, &RollbackStep{}, &RollbackTrigger{})
}

// CreateRollbackPlan creates a rollback plan for a migration
func (rm *RollbackManager) CreateRollbackPlan(ctx context.Context, migrationID string, name, description string) (*RollbackPlan, error) {
	plan := &RollbackPlan{
		ID:          generateID(),
		MigrationID: migrationID,
		Name:        name,
		Description: description,
		Status:      StatusPending,
	}

	if err := rm.db.WithContext(ctx).Create(plan).Error; err != nil {
		return nil, fmt.Errorf("failed to create rollback plan: %w", err)
	}

	// Create default rollback steps based on migration type
	if err := rm.createDefaultRollbackSteps(ctx, plan.ID, migrationID); err != nil {
		return nil, fmt.Errorf("failed to create default rollback steps: %w", err)
	}

	return plan, nil
}

// createDefaultRollbackSteps creates default rollback steps for common migration scenarios
func (rm *RollbackManager) createDefaultRollbackSteps(ctx context.Context, planID, migrationID string) error {
	steps := []RollbackStep{
		{
			ID:             generateID(),
			RollbackPlanID: planID,
			Name:           "Stop New Traffic",
			Description:    "Redirect traffic back to legacy system",
			StepOrder:      1,
			StepType:       "api_call",
			Command:        "update_load_balancer",
			Parameters:     `{"target": "legacy", "percentage": 100}`,
			Status:         StatusPending,
		},
		{
			ID:             generateID(),
			RollbackPlanID: planID,
			Name:           "Backup Current State",
			Description:    "Create backup of current database state",
			StepOrder:      2,
			StepType:       "sql",
			Command:        "CREATE_BACKUP",
			Parameters:     `{"tables": ["events", "attendees", "wechat_users"], "timestamp": true}`,
			Status:         StatusPending,
		},
		{
			ID:             generateID(),
			RollbackPlanID: planID,
			Name:           "Restore Legacy Data",
			Description:    "Restore data to pre-migration state",
			StepOrder:      3,
			StepType:       "sql",
			Command:        "RESTORE_BACKUP",
			Parameters:     `{"backup_id": "pre_migration", "verify": true}`,
			Status:         StatusPending,
		},
		{
			ID:             generateID(),
			RollbackPlanID: planID,
			Name:           "Validate Legacy System",
			Description:    "Validate legacy system is functioning correctly",
			StepOrder:      4,
			StepType:       "api_call",
			Command:        "health_check",
			Parameters:     `{"system": "legacy", "timeout": 30}`,
			Status:         StatusPending,
		},
		{
			ID:             generateID(),
			RollbackPlanID: planID,
			Name:           "Update Configuration",
			Description:    "Update system configuration to legacy settings",
			StepOrder:      5,
			StepType:       "file_operation",
			Command:        "restore_config",
			Parameters:     `{"config_backup": "pre_migration_config.json"}`,
			Status:         StatusPending,
		},
	}

	for _, step := range steps {
		if err := rm.db.WithContext(ctx).Create(&step).Error; err != nil {
			return fmt.Errorf("failed to create rollback step %s: %w", step.Name, err)
		}
	}

	return nil
}

// ExecuteRollback executes a rollback plan
func (rm *RollbackManager) ExecuteRollback(ctx context.Context, planID string) error {
	rm.logger.Printf("Starting rollback execution for plan: %s", planID)

	// Update plan status to running
	now := time.Now()
	if err := rm.db.WithContext(ctx).Model(&RollbackPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":      StatusRunning,
			"executed_at": &now,
		}).Error; err != nil {
		return fmt.Errorf("failed to update rollback plan status: %w", err)
	}

	// Get rollback steps
	var steps []RollbackStep
	if err := rm.db.WithContext(ctx).
		Where("rollback_plan_id = ?", planID).
		Order("step_order ASC").
		Find(&steps).Error; err != nil {
		return fmt.Errorf("failed to get rollback steps: %w", err)
	}

	// Execute steps in order
	for _, step := range steps {
		if err := rm.executeRollbackStep(ctx, &step); err != nil {
			rm.logger.Printf("Rollback step failed: %s - %v", step.Name, err)
			
			// Mark step as failed
			rm.failRollbackStep(ctx, step.ID, err.Error())
			
			// Mark plan as failed
			rm.failRollbackPlan(ctx, planID, fmt.Sprintf("Step '%s' failed: %v", step.Name, err))
			
			return fmt.Errorf("rollback failed at step '%s': %w", step.Name, err)
		}
		
		rm.logger.Printf("Rollback step completed: %s", step.Name)
	}

	// Mark plan as completed
	completedAt := time.Now()
	if err := rm.db.WithContext(ctx).Model(&RollbackPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":       StatusCompleted,
			"completed_at": &completedAt,
		}).Error; err != nil {
		return fmt.Errorf("failed to mark rollback plan as completed: %w", err)
	}

	rm.logger.Printf("Rollback completed successfully for plan: %s", planID)
	return nil
}

// executeRollbackStep executes a single rollback step
func (rm *RollbackManager) executeRollbackStep(ctx context.Context, step *RollbackStep) error {
	// Mark step as running
	now := time.Now()
	if err := rm.db.WithContext(ctx).Model(step).
		Updates(map[string]interface{}{
			"status":      StatusRunning,
			"executed_at": &now,
		}).Error; err != nil {
		return fmt.Errorf("failed to update step status: %w", err)
	}

	// Execute step based on type
	switch step.StepType {
	case "sql":
		if err := rm.executeSQLStep(ctx, step); err != nil {
			return err
		}
	case "api_call":
		if err := rm.executeAPIStep(ctx, step); err != nil {
			return err
		}
	case "file_operation":
		if err := rm.executeFileStep(ctx, step); err != nil {
			return err
		}
	default:
		return fmt.Errorf("unknown step type: %s", step.StepType)
	}

	// Mark step as completed
	completedAt := time.Now()
	if err := rm.db.WithContext(ctx).Model(step).
		Updates(map[string]interface{}{
			"status":       StatusCompleted,
			"completed_at": &completedAt,
		}).Error; err != nil {
		return fmt.Errorf("failed to mark step as completed: %w", err)
	}

	return nil
}

// executeSQLStep executes a SQL rollback step
func (rm *RollbackManager) executeSQLStep(ctx context.Context, step *RollbackStep) error {
	// This would execute SQL commands for rollback
	// Implementation depends on specific SQL operations needed
	rm.logger.Printf("Executing SQL step: %s - %s", step.Name, step.Command)
	
	// Simulate SQL execution
	time.Sleep(time.Millisecond * 100)
	
	return nil
}

// executeAPIStep executes an API call rollback step
func (rm *RollbackManager) executeAPIStep(ctx context.Context, step *RollbackStep) error {
	// This would make API calls for rollback operations
	// Implementation depends on specific API operations needed
	rm.logger.Printf("Executing API step: %s - %s", step.Name, step.Command)
	
	// Simulate API call
	time.Sleep(time.Millisecond * 200)
	
	return nil
}

// executeFileStep executes a file operation rollback step
func (rm *RollbackManager) executeFileStep(ctx context.Context, step *RollbackStep) error {
	// This would perform file operations for rollback
	// Implementation depends on specific file operations needed
	rm.logger.Printf("Executing file step: %s - %s", step.Name, step.Command)
	
	// Simulate file operation
	time.Sleep(time.Millisecond * 50)
	
	return nil
}

// failRollbackStep marks a rollback step as failed
func (rm *RollbackManager) failRollbackStep(ctx context.Context, stepID, errorMsg string) {
	now := time.Now()
	rm.db.WithContext(ctx).Model(&RollbackStep{}).
		Where("id = ?", stepID).
		Updates(map[string]interface{}{
			"status":       StatusFailed,
			"completed_at": &now,
			"error_msg":    errorMsg,
		})
}

// failRollbackPlan marks a rollback plan as failed
func (rm *RollbackManager) failRollbackPlan(ctx context.Context, planID, errorMsg string) {
	now := time.Now()
	rm.db.WithContext(ctx).Model(&RollbackPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":       StatusFailed,
			"completed_at": &now,
		})
}

// CreateRollbackTrigger creates an automatic rollback trigger
func (rm *RollbackManager) CreateRollbackTrigger(ctx context.Context, migrationID, triggerType string, threshold float64, timeWindow int) error {
	trigger := &RollbackTrigger{
		ID:          generateID(),
		MigrationID: migrationID,
		TriggerType: triggerType,
		Threshold:   threshold,
		TimeWindow:  timeWindow,
		IsActive:    true,
	}

	return rm.db.WithContext(ctx).Create(trigger).Error
}

// CheckRollbackTriggers checks if any rollback triggers should be activated
func (rm *RollbackManager) CheckRollbackTriggers(ctx context.Context, migrationID string, metrics map[string]float64) (bool, string, error) {
	var triggers []RollbackTrigger
	if err := rm.db.WithContext(ctx).
		Where("migration_id = ? AND is_active = ?", migrationID, true).
		Find(&triggers).Error; err != nil {
		return false, "", fmt.Errorf("failed to get rollback triggers: %w", err)
	}

	for _, trigger := range triggers {
		if value, exists := metrics[trigger.TriggerType]; exists {
			if rm.shouldTriggerRollback(trigger, value) {
				rm.logger.Printf("Rollback trigger activated: %s (threshold: %f, current: %f)", 
					trigger.TriggerType, trigger.Threshold, value)
				
				// Mark trigger as triggered
				now := time.Now()
				rm.db.WithContext(ctx).Model(&trigger).Update("last_triggered", &now)
				
				return true, fmt.Sprintf("Trigger: %s exceeded threshold %f (current: %f)", 
					trigger.TriggerType, trigger.Threshold, value), nil
			}
		}
	}

	return false, "", nil
}

// shouldTriggerRollback determines if a trigger should activate rollback
func (rm *RollbackManager) shouldTriggerRollback(trigger RollbackTrigger, currentValue float64) bool {
	switch trigger.TriggerType {
	case "error_rate":
		return currentValue > trigger.Threshold
	case "latency":
		return currentValue > trigger.Threshold
	case "validation_failure":
		return currentValue > trigger.Threshold
	default:
		return false
	}
}

// GetRollbackPlan retrieves a rollback plan by ID
func (rm *RollbackManager) GetRollbackPlan(ctx context.Context, planID string) (*RollbackPlan, error) {
	var plan RollbackPlan
	if err := rm.db.WithContext(ctx).Preload("Steps").First(&plan, "id = ?", planID).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}
