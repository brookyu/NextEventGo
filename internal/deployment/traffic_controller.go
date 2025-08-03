package deployment

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

// TrafficSplit represents traffic distribution configuration
type TrafficSplit struct {
	ID                string    `json:"id" gorm:"primaryKey"`
	Name              string    `json:"name" gorm:"not null"`
	LegacyPercentage  int       `json:"legacy_percentage" gorm:"not null"`
	NewPercentage     int       `json:"new_percentage" gorm:"not null"`
	Status            string    `json:"status" gorm:"default:pending"` // pending, active, completed, failed
	StartedAt         *time.Time `json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at"`
	CreatedAt         time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TrafficMetrics represents traffic monitoring data
type TrafficMetrics struct {
	ID              string    `json:"id" gorm:"primaryKey"`
	TrafficSplitID  string    `json:"traffic_split_id" gorm:"not null"`
	Timestamp       time.Time `json:"timestamp" gorm:"index"`
	LegacyRequests  int64     `json:"legacy_requests"`
	NewRequests     int64     `json:"new_requests"`
	LegacyErrors    int64     `json:"legacy_errors"`
	NewErrors       int64     `json:"new_errors"`
	LegacyLatency   float64   `json:"legacy_latency_ms"`
	NewLatency      float64   `json:"new_latency_ms"`
	CreatedAt       time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// MigrationPlan represents the overall migration plan
type MigrationPlan struct {
	ID          string         `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	Steps       []MigrationStep `json:"steps" gorm:"foreignKey:PlanID"`
	Status      string         `json:"status" gorm:"default:pending"`
	StartedAt   *time.Time     `json:"started_at"`
	CompletedAt *time.Time     `json:"completed_at"`
	CreatedAt   time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
}

// MigrationStep represents a single step in the migration plan
type MigrationStep struct {
	ID               string    `json:"id" gorm:"primaryKey"`
	PlanID           string    `json:"plan_id" gorm:"not null"`
	StepOrder        int       `json:"step_order" gorm:"not null"`
	Name             string    `json:"name" gorm:"not null"`
	Description      string    `json:"description"`
	TrafficPercentage int      `json:"traffic_percentage"`
	Duration         int       `json:"duration_minutes"`
	Status           string    `json:"status" gorm:"default:pending"`
	StartedAt        *time.Time `json:"started_at"`
	CompletedAt      *time.Time `json:"completed_at"`
	ErrorMessage     string    `json:"error_message"`
	CreatedAt        time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt        time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TrafficController manages traffic migration between systems
type TrafficController struct {
	db     *gorm.DB
	logger *log.Logger
}

// NewTrafficController creates a new traffic controller
func NewTrafficController(db *gorm.DB, logger *log.Logger) *TrafficController {
	return &TrafficController{
		db:     db,
		logger: logger,
	}
}

// InitializeTrafficTables creates the traffic management tables
func (tc *TrafficController) InitializeTrafficTables() error {
	return tc.db.AutoMigrate(&TrafficSplit{}, &TrafficMetrics{}, &MigrationPlan{}, &MigrationStep{})
}

// CreateMigrationPlan creates a new migration plan
func (tc *TrafficController) CreateMigrationPlan(ctx context.Context, name, description string) (*MigrationPlan, error) {
	plan := &MigrationPlan{
		ID:          generateID(),
		Name:        name,
		Description: description,
		Status:      "pending",
	}

	if err := tc.db.WithContext(ctx).Create(plan).Error; err != nil {
		return nil, err
	}

	// Create default migration steps
	steps := []MigrationStep{
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         1,
			Name:              "Initial Deployment",
			Description:       "Deploy new system with 0% traffic",
			TrafficPercentage: 0,
			Duration:          60, // 1 hour
			Status:            "pending",
		},
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         2,
			Name:              "Canary Release",
			Description:       "Route 10% traffic to new system",
			TrafficPercentage: 10,
			Duration:          240, // 4 hours
			Status:            "pending",
		},
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         3,
			Name:              "Gradual Increase",
			Description:       "Route 25% traffic to new system",
			TrafficPercentage: 25,
			Duration:          240, // 4 hours
			Status:            "pending",
		},
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         4,
			Name:              "Half Migration",
			Description:       "Route 50% traffic to new system",
			TrafficPercentage: 50,
			Duration:          480, // 8 hours
			Status:            "pending",
		},
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         5,
			Name:              "Majority Migration",
			Description:       "Route 75% traffic to new system",
			TrafficPercentage: 75,
			Duration:          480, // 8 hours
			Status:            "pending",
		},
		{
			ID:                generateID(),
			PlanID:            plan.ID,
			StepOrder:         6,
			Name:              "Full Migration",
			Description:       "Route 100% traffic to new system",
			TrafficPercentage: 100,
			Duration:          1440, // 24 hours
			Status:            "pending",
		},
	}

	for _, step := range steps {
		if err := tc.db.WithContext(ctx).Create(&step).Error; err != nil {
			return nil, err
		}
	}

	return plan, nil
}

// ExecuteMigrationPlan executes a migration plan
func (tc *TrafficController) ExecuteMigrationPlan(ctx context.Context, planID string) error {
	tc.logger.Printf("Starting migration plan execution: %s", planID)

	// Update plan status
	now := time.Now()
	if err := tc.db.WithContext(ctx).Model(&MigrationPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":     "running",
			"started_at": &now,
		}).Error; err != nil {
		return err
	}

	// Get migration steps
	var steps []MigrationStep
	if err := tc.db.WithContext(ctx).
		Where("plan_id = ?", planID).
		Order("step_order ASC").
		Find(&steps).Error; err != nil {
		return err
	}

	// Execute steps sequentially
	for _, step := range steps {
		if err := tc.executeMigrationStep(ctx, &step); err != nil {
			tc.logger.Printf("Migration step failed: %s - %v", step.Name, err)
			
			// Mark step as failed
			tc.failMigrationStep(ctx, step.ID, err.Error())
			
			// Mark plan as failed
			tc.failMigrationPlan(ctx, planID, fmt.Sprintf("Step '%s' failed: %v", step.Name, err))
			
			return err
		}
	}

	// Mark plan as completed
	completedAt := time.Now()
	if err := tc.db.WithContext(ctx).Model(&MigrationPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": &completedAt,
		}).Error; err != nil {
		return err
	}

	tc.logger.Printf("Migration plan completed successfully: %s", planID)
	return nil
}

// executeMigrationStep executes a single migration step
func (tc *TrafficController) executeMigrationStep(ctx context.Context, step *MigrationStep) error {
	tc.logger.Printf("Executing migration step: %s (%d%% traffic)", step.Name, step.TrafficPercentage)

	// Mark step as running
	now := time.Now()
	if err := tc.db.WithContext(ctx).Model(step).
		Updates(map[string]interface{}{
			"status":     "running",
			"started_at": &now,
		}).Error; err != nil {
		return err
	}

	// Create traffic split
	split := &TrafficSplit{
		ID:               generateID(),
		Name:             fmt.Sprintf("Step %d: %s", step.StepOrder, step.Name),
		LegacyPercentage: 100 - step.TrafficPercentage,
		NewPercentage:    step.TrafficPercentage,
		Status:           "active",
		StartedAt:        &now,
	}

	if err := tc.db.WithContext(ctx).Create(split).Error; err != nil {
		return err
	}

	// Apply traffic split (this would integrate with load balancer/ingress)
	if err := tc.applyTrafficSplit(ctx, split); err != nil {
		return err
	}

	// Monitor for the specified duration
	if err := tc.monitorTrafficSplit(ctx, split.ID, time.Duration(step.Duration)*time.Minute); err != nil {
		return err
	}

	// Mark step as completed
	completedAt := time.Now()
	if err := tc.db.WithContext(ctx).Model(step).
		Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": &completedAt,
		}).Error; err != nil {
		return err
	}

	// Mark traffic split as completed
	if err := tc.db.WithContext(ctx).Model(split).
		Updates(map[string]interface{}{
			"status":       "completed",
			"completed_at": &completedAt,
		}).Error; err != nil {
		return err
	}

	return nil
}

// applyTrafficSplit applies the traffic split configuration
func (tc *TrafficController) applyTrafficSplit(ctx context.Context, split *TrafficSplit) error {
	// This would integrate with Kubernetes ingress controller or load balancer
	// For now, we'll simulate the traffic split application
	tc.logger.Printf("Applying traffic split: %d%% legacy, %d%% new", 
		split.LegacyPercentage, split.NewPercentage)
	
	// Simulate API call to update ingress controller
	time.Sleep(time.Second * 2)
	
	return nil
}

// monitorTrafficSplit monitors traffic split for the specified duration
func (tc *TrafficController) monitorTrafficSplit(ctx context.Context, splitID string, duration time.Duration) error {
	tc.logger.Printf("Monitoring traffic split for %v", duration)
	
	endTime := time.Now().Add(duration)
	ticker := time.NewTicker(time.Minute * 5) // Monitor every 5 minutes
	defer ticker.Stop()
	
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-ticker.C:
			// Collect metrics
			metrics := tc.collectTrafficMetrics(ctx, splitID)
			if err := tc.recordTrafficMetrics(ctx, metrics); err != nil {
				tc.logger.Printf("Failed to record traffic metrics: %v", err)
			}
			
			// Check for issues
			if tc.shouldRollback(metrics) {
				return fmt.Errorf("traffic split failed health checks, rollback required")
			}
			
			if time.Now().After(endTime) {
				tc.logger.Printf("Traffic split monitoring completed")
				return nil
			}
		}
	}
}

// collectTrafficMetrics collects current traffic metrics
func (tc *TrafficController) collectTrafficMetrics(ctx context.Context, splitID string) *TrafficMetrics {
	// This would integrate with monitoring systems to collect real metrics
	// For now, we'll simulate metrics collection
	return &TrafficMetrics{
		ID:             generateID(),
		TrafficSplitID: splitID,
		Timestamp:      time.Now(),
		LegacyRequests: 1000,
		NewRequests:    100,
		LegacyErrors:   5,
		NewErrors:      2,
		LegacyLatency:  150.0,
		NewLatency:     80.0,
	}
}

// recordTrafficMetrics records traffic metrics to database
func (tc *TrafficController) recordTrafficMetrics(ctx context.Context, metrics *TrafficMetrics) error {
	return tc.db.WithContext(ctx).Create(metrics).Error
}

// shouldRollback determines if a rollback is needed based on metrics
func (tc *TrafficController) shouldRollback(metrics *TrafficMetrics) bool {
	// Calculate error rates
	newErrorRate := float64(metrics.NewErrors) / float64(metrics.NewRequests) * 100
	legacyErrorRate := float64(metrics.LegacyErrors) / float64(metrics.LegacyRequests) * 100
	
	// Rollback if new system error rate is significantly higher
	if newErrorRate > legacyErrorRate*2 && newErrorRate > 5.0 {
		tc.logger.Printf("High error rate detected: new=%.2f%%, legacy=%.2f%%", newErrorRate, legacyErrorRate)
		return true
	}
	
	// Rollback if new system latency is significantly higher
	if metrics.NewLatency > metrics.LegacyLatency*2 && metrics.NewLatency > 200.0 {
		tc.logger.Printf("High latency detected: new=%.2fms, legacy=%.2fms", metrics.NewLatency, metrics.LegacyLatency)
		return true
	}
	
	return false
}

// failMigrationStep marks a migration step as failed
func (tc *TrafficController) failMigrationStep(ctx context.Context, stepID, errorMsg string) {
	now := time.Now()
	tc.db.WithContext(ctx).Model(&MigrationStep{}).
		Where("id = ?", stepID).
		Updates(map[string]interface{}{
			"status":        "failed",
			"completed_at":  &now,
			"error_message": errorMsg,
		})
}

// failMigrationPlan marks a migration plan as failed
func (tc *TrafficController) failMigrationPlan(ctx context.Context, planID, errorMsg string) {
	now := time.Now()
	tc.db.WithContext(ctx).Model(&MigrationPlan{}).
		Where("id = ?", planID).
		Updates(map[string]interface{}{
			"status":       "failed",
			"completed_at": &now,
		})
}

// RollbackTrafficSplit rolls back to previous traffic configuration
func (tc *TrafficController) RollbackTrafficSplit(ctx context.Context, splitID string) error {
	tc.logger.Printf("Rolling back traffic split: %s", splitID)
	
	// Set traffic to 100% legacy system
	rollbackSplit := &TrafficSplit{
		ID:               generateID(),
		Name:             "Emergency Rollback",
		LegacyPercentage: 100,
		NewPercentage:    0,
		Status:           "active",
	}
	
	now := time.Now()
	rollbackSplit.StartedAt = &now
	
	if err := tc.db.WithContext(ctx).Create(rollbackSplit).Error; err != nil {
		return err
	}
	
	// Apply rollback
	if err := tc.applyTrafficSplit(ctx, rollbackSplit); err != nil {
		return err
	}
	
	// Mark original split as failed
	tc.db.WithContext(ctx).Model(&TrafficSplit{}).
		Where("id = ?", splitID).
		Update("status", "failed")
	
	tc.logger.Printf("Traffic rollback completed")
	return nil
}

// GetTrafficMetrics retrieves traffic metrics for analysis
func (tc *TrafficController) GetTrafficMetrics(ctx context.Context, splitID string, limit int) ([]TrafficMetrics, error) {
	var metrics []TrafficMetrics
	query := tc.db.WithContext(ctx).Where("traffic_split_id = ?", splitID)
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Order("timestamp DESC").Find(&metrics).Error
	return metrics, err
}

// generateID generates a unique ID
func generateID() string {
	return fmt.Sprintf("traffic_%d", time.Now().UnixNano())
}
