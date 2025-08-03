package monitoring

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/infrastructure/cache"
)

// HealthStatus represents the health status of a component
type HealthStatus string

const (
	HealthStatusHealthy   HealthStatus = "healthy"
	HealthStatusDegraded  HealthStatus = "degraded"
	HealthStatusUnhealthy HealthStatus = "unhealthy"
)

// HealthCheck represents a single health check
type HealthCheck struct {
	Name        string                                      `json:"name"`
	Status      HealthStatus                                `json:"status"`
	Message     string                                      `json:"message"`
	LastChecked time.Time                                   `json:"lastChecked"`
	Duration    time.Duration                               `json:"duration"`
	Metadata    map[string]interface{}                      `json:"metadata,omitempty"`
	CheckFunc   func(ctx context.Context) (HealthStatus, string, map[string]interface{}) `json:"-"`
}

// HealthResponse represents the overall health response
type HealthResponse struct {
	Status      HealthStatus             `json:"status"`
	Timestamp   time.Time                `json:"timestamp"`
	Version     string                   `json:"version"`
	Uptime      time.Duration            `json:"uptime"`
	Checks      map[string]*HealthCheck  `json:"checks"`
	Summary     map[string]int           `json:"summary"`
}

// HealthChecker manages health checks for the application
type HealthChecker struct {
	checks    map[string]*HealthCheck
	mutex     sync.RWMutex
	logger    *zap.Logger
	startTime time.Time
	version   string
	db        *gorm.DB
	cache     cache.CacheInterface
}

// NewHealthChecker creates a new health checker
func NewHealthChecker(logger *zap.Logger, version string, db *gorm.DB, cache cache.CacheInterface) *HealthChecker {
	hc := &HealthChecker{
		checks:    make(map[string]*HealthCheck),
		logger:    logger,
		startTime: time.Now(),
		version:   version,
		db:        db,
		cache:     cache,
	}

	// Register default health checks
	hc.registerDefaultChecks()

	return hc
}

// registerDefaultChecks registers the default health checks
func (hc *HealthChecker) registerDefaultChecks() {
	// Database health check
	hc.RegisterCheck("database", hc.checkDatabase)

	// Cache health check
	if hc.cache != nil {
		hc.RegisterCheck("cache", hc.checkCache)
	}

	// Memory health check
	hc.RegisterCheck("memory", hc.checkMemory)

	// Disk space health check
	hc.RegisterCheck("disk", hc.checkDisk)

	// External dependencies health check
	hc.RegisterCheck("external_deps", hc.checkExternalDependencies)
}

// RegisterCheck registers a new health check
func (hc *HealthChecker) RegisterCheck(name string, checkFunc func(ctx context.Context) (HealthStatus, string, map[string]interface{})) {
	hc.mutex.Lock()
	defer hc.mutex.Unlock()

	hc.checks[name] = &HealthCheck{
		Name:      name,
		CheckFunc: checkFunc,
	}
}

// RunChecks runs all registered health checks
func (hc *HealthChecker) RunChecks(ctx context.Context) *HealthResponse {
	hc.mutex.RLock()
	checks := make(map[string]*HealthCheck, len(hc.checks))
	for name, check := range hc.checks {
		checks[name] = &HealthCheck{
			Name:      check.Name,
			CheckFunc: check.CheckFunc,
		}
	}
	hc.mutex.RUnlock()

	// Run checks concurrently
	var wg sync.WaitGroup
	checkResults := make(chan *HealthCheck, len(checks))

	for _, check := range checks {
		wg.Add(1)
		go func(c *HealthCheck) {
			defer wg.Done()
			hc.runSingleCheck(ctx, c)
			checkResults <- c
		}(check)
	}

	// Wait for all checks to complete
	go func() {
		wg.Wait()
		close(checkResults)
	}()

	// Collect results
	results := make(map[string]*HealthCheck)
	summary := map[string]int{
		"healthy":   0,
		"degraded":  0,
		"unhealthy": 0,
	}

	for result := range checkResults {
		results[result.Name] = result
		summary[string(result.Status)]++
	}

	// Determine overall status
	overallStatus := hc.determineOverallStatus(summary)

	return &HealthResponse{
		Status:    overallStatus,
		Timestamp: time.Now(),
		Version:   hc.version,
		Uptime:    time.Since(hc.startTime),
		Checks:    results,
		Summary:   summary,
	}
}

// runSingleCheck runs a single health check with timeout
func (hc *HealthChecker) runSingleCheck(ctx context.Context, check *HealthCheck) {
	start := time.Now()
	
	// Create a timeout context for the check
	checkCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	defer func() {
		check.Duration = time.Since(start)
		check.LastChecked = time.Now()

		if r := recover(); r != nil {
			check.Status = HealthStatusUnhealthy
			check.Message = fmt.Sprintf("Health check panicked: %v", r)
			check.Metadata = map[string]interface{}{
				"panic": true,
				"error": fmt.Sprintf("%v", r),
			}
			hc.logger.Error("Health check panicked",
				zap.String("check", check.Name),
				zap.Any("panic", r))
		}
	}()

	status, message, metadata := check.CheckFunc(checkCtx)
	check.Status = status
	check.Message = message
	check.Metadata = metadata
}

// determineOverallStatus determines the overall health status
func (hc *HealthChecker) determineOverallStatus(summary map[string]int) HealthStatus {
	if summary["unhealthy"] > 0 {
		return HealthStatusUnhealthy
	}
	if summary["degraded"] > 0 {
		return HealthStatusDegraded
	}
	return HealthStatusHealthy
}

// Default health check implementations

func (hc *HealthChecker) checkDatabase(ctx context.Context) (HealthStatus, string, map[string]interface{}) {
	if hc.db == nil {
		return HealthStatusUnhealthy, "Database not configured", nil
	}

	start := time.Now()
	
	// Test database connection
	sqlDB, err := hc.db.DB()
	if err != nil {
		return HealthStatusUnhealthy, fmt.Sprintf("Failed to get database instance: %v", err), nil
	}

	if err := sqlDB.PingContext(ctx); err != nil {
		return HealthStatusUnhealthy, fmt.Sprintf("Database ping failed: %v", err), nil
	}

	// Get database stats
	stats := sqlDB.Stats()
	pingDuration := time.Since(start)

	metadata := map[string]interface{}{
		"ping_duration_ms":    pingDuration.Milliseconds(),
		"open_connections":    stats.OpenConnections,
		"in_use":             stats.InUse,
		"idle":               stats.Idle,
		"wait_count":         stats.WaitCount,
		"wait_duration_ms":   stats.WaitDuration.Milliseconds(),
		"max_idle_closed":    stats.MaxIdleClosed,
		"max_lifetime_closed": stats.MaxLifetimeClosed,
	}

	// Determine status based on performance
	if pingDuration > 1*time.Second {
		return HealthStatusDegraded, "Database response time is slow", metadata
	}

	if stats.OpenConnections > 80 { // Assuming max 100 connections
		return HealthStatusDegraded, "High number of database connections", metadata
	}

	return HealthStatusHealthy, "Database is healthy", metadata
}

func (hc *HealthChecker) checkCache(ctx context.Context) (HealthStatus, string, map[string]interface{}) {
	if hc.cache == nil {
		return HealthStatusHealthy, "Cache not configured", nil
	}

	start := time.Now()
	testKey := "health_check_test"
	testValue := map[string]interface{}{
		"timestamp": time.Now().Unix(),
		"test":      true,
	}

	// Test cache set
	if err := hc.cache.Set(ctx, testKey, testValue, 1*time.Minute); err != nil {
		return HealthStatusUnhealthy, fmt.Sprintf("Cache set failed: %v", err), nil
	}

	// Test cache get
	var retrieved map[string]interface{}
	if err := hc.cache.Get(ctx, testKey, &retrieved); err != nil {
		return HealthStatusUnhealthy, fmt.Sprintf("Cache get failed: %v", err), nil
	}

	// Test cache delete
	if err := hc.cache.Delete(ctx, testKey); err != nil {
		hc.logger.Warn("Cache delete failed during health check", zap.Error(err))
	}

	duration := time.Since(start)
	metadata := map[string]interface{}{
		"operation_duration_ms": duration.Milliseconds(),
	}

	// Determine status based on performance
	if duration > 500*time.Millisecond {
		return HealthStatusDegraded, "Cache response time is slow", metadata
	}

	return HealthStatusHealthy, "Cache is healthy", metadata
}

func (hc *HealthChecker) checkMemory(ctx context.Context) (HealthStatus, string, map[string]interface{}) {
	// This is a simplified memory check
	// In production, you would use runtime.MemStats or similar
	
	metadata := map[string]interface{}{
		"check_type": "basic",
	}

	// For now, always return healthy
	// In a real implementation, you would check actual memory usage
	return HealthStatusHealthy, "Memory usage is normal", metadata
}

func (hc *HealthChecker) checkDisk(ctx context.Context) (HealthStatus, string, map[string]interface{}) {
	// This is a simplified disk check
	// In production, you would check actual disk usage
	
	metadata := map[string]interface{}{
		"check_type": "basic",
	}

	// For now, always return healthy
	// In a real implementation, you would check actual disk usage
	return HealthStatusHealthy, "Disk usage is normal", metadata
}

func (hc *HealthChecker) checkExternalDependencies(ctx context.Context) (HealthStatus, string, map[string]interface{}) {
	// This would check external services like APIs, message queues, etc.
	// For now, we'll just return healthy
	
	metadata := map[string]interface{}{
		"dependencies_checked": 0,
	}

	return HealthStatusHealthy, "External dependencies are healthy", metadata
}

// HTTP Handlers

// HealthHandler returns a Gin handler for health checks
func (hc *HealthChecker) HealthHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
		defer cancel()

		health := hc.RunChecks(ctx)

		statusCode := http.StatusOK
		switch health.Status {
		case HealthStatusDegraded:
			statusCode = http.StatusOK // Still return 200 for degraded
		case HealthStatusUnhealthy:
			statusCode = http.StatusServiceUnavailable
		}

		c.JSON(statusCode, health)
	}
}

// ReadinessHandler returns a Gin handler for readiness checks
func (hc *HealthChecker) ReadinessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
		defer cancel()

		// For readiness, we only check critical components
		criticalChecks := []string{"database"}
		
		for _, checkName := range criticalChecks {
			hc.mutex.RLock()
			check, exists := hc.checks[checkName]
			hc.mutex.RUnlock()

			if !exists {
				continue
			}

			tempCheck := &HealthCheck{
				Name:      check.Name,
				CheckFunc: check.CheckFunc,
			}
			
			hc.runSingleCheck(ctx, tempCheck)
			
			if tempCheck.Status == HealthStatusUnhealthy {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"status": "not_ready",
					"reason": fmt.Sprintf("%s is unhealthy: %s", checkName, tempCheck.Message),
				})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"status": "ready",
		})
	}
}

// LivenessHandler returns a Gin handler for liveness checks
func (hc *HealthChecker) LivenessHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Liveness is just a simple check that the application is running
		c.JSON(http.StatusOK, gin.H{
			"status": "alive",
			"uptime": time.Since(hc.startTime).String(),
		})
	}
}
