package monitoring

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

// CostMetric represents a cost measurement
type CostMetric struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Timestamp time.Time `json:"timestamp" gorm:"index"`
	Service   string    `json:"service" gorm:"index"`
	Resource  string    `json:"resource"`
	Region    string    `json:"region"`
	Cost      float64   `json:"cost"`
	Currency  string    `json:"currency" gorm:"default:CNY"`
	Unit      string    `json:"unit"` // hour, day, month
	Tags      string    `json:"tags" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

// CostSummary represents aggregated cost data
type CostSummary struct {
	Period      string             `json:"period"`
	TotalCost   float64            `json:"total_cost"`
	ServiceCost map[string]float64 `json:"service_cost"`
	RegionCost  map[string]float64 `json:"region_cost"`
	Trend       []CostTrend        `json:"trend"`
}

// CostTrend represents cost trend over time
type CostTrend struct {
	Date string  `json:"date"`
	Cost float64 `json:"cost"`
}

// CostAlert represents cost alerting configuration
type CostAlert struct {
	ID        string     `json:"id" gorm:"primaryKey"`
	Name      string     `json:"name" gorm:"not null"`
	Service   string     `json:"service"`
	Threshold float64    `json:"threshold"`
	Period    string     `json:"period"` // daily, weekly, monthly
	IsActive  bool       `json:"is_active" gorm:"default:true"`
	LastAlert *time.Time `json:"last_alert"`
	CreatedAt time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
}

// CostComparison represents cost comparison between periods
type CostComparison struct {
	CurrentPeriod  CostSummary `json:"current_period"`
	PreviousPeriod CostSummary `json:"previous_period"`
	Difference     float64     `json:"difference"`
	PercentChange  float64     `json:"percent_change"`
	Savings        float64     `json:"savings"`
}

// CostMonitor handles cost monitoring and analysis
type CostMonitor struct {
	db     *gorm.DB
	logger *log.Logger
}

// NewCostMonitor creates a new cost monitor
func NewCostMonitor(db *gorm.DB, logger *log.Logger) *CostMonitor {
	return &CostMonitor{
		db:     db,
		logger: logger,
	}
}

// InitializeCostTables creates the cost monitoring tables
func (cm *CostMonitor) InitializeCostTables() error {
	return cm.db.AutoMigrate(&CostMetric{}, &CostAlert{})
}

// RecordCostMetric records a cost metric
func (cm *CostMonitor) RecordCostMetric(ctx context.Context, metric *CostMetric) error {
	metric.ID = generateID()
	metric.Timestamp = time.Now()
	return cm.db.WithContext(ctx).Create(metric).Error
}

// GetCostSummary retrieves cost summary for a period
func (cm *CostMonitor) GetCostSummary(ctx context.Context, startDate, endDate time.Time) (*CostSummary, error) {
	var metrics []CostMetric
	err := cm.db.WithContext(ctx).
		Where("timestamp BETWEEN ? AND ?", startDate, endDate).
		Find(&metrics).Error
	if err != nil {
		return nil, err
	}

	summary := &CostSummary{
		Period:      fmt.Sprintf("%s to %s", startDate.Format("2006-01-02"), endDate.Format("2006-01-02")),
		ServiceCost: make(map[string]float64),
		RegionCost:  make(map[string]float64),
	}

	// Aggregate costs
	for _, metric := range metrics {
		summary.TotalCost += metric.Cost
		summary.ServiceCost[metric.Service] += metric.Cost
		summary.RegionCost[metric.Region] += metric.Cost
	}

	// Generate trend data
	trend, err := cm.generateCostTrend(ctx, startDate, endDate)
	if err != nil {
		return nil, err
	}
	summary.Trend = trend

	return summary, nil
}

// generateCostTrend generates daily cost trend data
func (cm *CostMonitor) generateCostTrend(ctx context.Context, startDate, endDate time.Time) ([]CostTrend, error) {
	var trends []CostTrend

	// Generate daily aggregates
	current := startDate
	for current.Before(endDate) || current.Equal(endDate) {
		dayStart := time.Date(current.Year(), current.Month(), current.Day(), 0, 0, 0, 0, current.Location())
		dayEnd := dayStart.Add(24 * time.Hour)

		var dailyCost float64
		err := cm.db.WithContext(ctx).Model(&CostMetric{}).
			Where("timestamp BETWEEN ? AND ?", dayStart, dayEnd).
			Select("COALESCE(SUM(cost), 0)").
			Scan(&dailyCost).Error
		if err != nil {
			return nil, err
		}

		trends = append(trends, CostTrend{
			Date: current.Format("2006-01-02"),
			Cost: dailyCost,
		})

		current = current.Add(24 * time.Hour)
	}

	return trends, nil
}

// CompareCosts compares costs between two periods
func (cm *CostMonitor) CompareCosts(ctx context.Context, currentStart, currentEnd, previousStart, previousEnd time.Time) (*CostComparison, error) {
	currentSummary, err := cm.GetCostSummary(ctx, currentStart, currentEnd)
	if err != nil {
		return nil, err
	}

	previousSummary, err := cm.GetCostSummary(ctx, previousStart, previousEnd)
	if err != nil {
		return nil, err
	}

	difference := currentSummary.TotalCost - previousSummary.TotalCost
	var percentChange float64
	if previousSummary.TotalCost > 0 {
		percentChange = (difference / previousSummary.TotalCost) * 100
	}

	savings := -difference // Negative difference means savings

	return &CostComparison{
		CurrentPeriod:  *currentSummary,
		PreviousPeriod: *previousSummary,
		Difference:     difference,
		PercentChange:  percentChange,
		Savings:        savings,
	}, nil
}

// GetMonthlyCostComparison compares current month with previous month
func (cm *CostMonitor) GetMonthlyCostComparison(ctx context.Context) (*CostComparison, error) {
	now := time.Now()

	// Current month
	currentStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	currentEnd := currentStart.AddDate(0, 1, 0).Add(-time.Second)

	// Previous month
	previousStart := currentStart.AddDate(0, -1, 0)
	previousEnd := currentStart.Add(-time.Second)

	return cm.CompareCosts(ctx, currentStart, currentEnd, previousStart, previousEnd)
}

// CreateCostAlert creates a cost alert
func (cm *CostMonitor) CreateCostAlert(ctx context.Context, alert *CostAlert) error {
	alert.ID = generateID()
	return cm.db.WithContext(ctx).Create(alert).Error
}

// CheckCostAlerts checks for cost threshold breaches
func (cm *CostMonitor) CheckCostAlerts(ctx context.Context) ([]CostAlert, error) {
	var alerts []CostAlert
	err := cm.db.WithContext(ctx).Where("is_active = ?", true).Find(&alerts).Error
	if err != nil {
		return nil, err
	}

	var triggeredAlerts []CostAlert

	for _, alert := range alerts {
		shouldTrigger, err := cm.shouldTriggerAlert(ctx, &alert)
		if err != nil {
			cm.logger.Printf("Error checking alert %s: %v", alert.Name, err)
			continue
		}

		if shouldTrigger {
			triggeredAlerts = append(triggeredAlerts, alert)

			// Update last alert time
			now := time.Now()
			cm.db.WithContext(ctx).Model(&alert).Update("last_alert", &now)
		}
	}

	return triggeredAlerts, nil
}

// shouldTriggerAlert checks if an alert should be triggered
func (cm *CostMonitor) shouldTriggerAlert(ctx context.Context, alert *CostAlert) (bool, error) {
	// Calculate period start based on alert period
	var startDate time.Time
	now := time.Now()

	switch alert.Period {
	case "daily":
		startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	case "weekly":
		weekday := int(now.Weekday())
		startDate = now.AddDate(0, 0, -weekday).Truncate(24 * time.Hour)
	case "monthly":
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	default:
		return false, fmt.Errorf("unknown alert period: %s", alert.Period)
	}

	// Get current cost for the period
	var currentCost float64
	query := cm.db.WithContext(ctx).Model(&CostMetric{}).
		Where("timestamp >= ?", startDate)

	if alert.Service != "" {
		query = query.Where("service = ?", alert.Service)
	}

	err := query.Select("COALESCE(SUM(cost), 0)").Scan(&currentCost).Error
	if err != nil {
		return false, err
	}

	// Check if threshold is exceeded
	return currentCost > alert.Threshold, nil
}

// GetServiceCosts retrieves costs by service for a period
func (cm *CostMonitor) GetServiceCosts(ctx context.Context, startDate, endDate time.Time) (map[string]float64, error) {
	var results []struct {
		Service string  `json:"service"`
		Cost    float64 `json:"cost"`
	}

	err := cm.db.WithContext(ctx).Model(&CostMetric{}).
		Select("service, SUM(cost) as cost").
		Where("timestamp BETWEEN ? AND ?", startDate, endDate).
		Group("service").
		Find(&results).Error
	if err != nil {
		return nil, err
	}

	serviceCosts := make(map[string]float64)
	for _, result := range results {
		serviceCosts[result.Service] = result.Cost
	}

	return serviceCosts, nil
}

// GetCostOptimizationRecommendations provides cost optimization recommendations
func (cm *CostMonitor) GetCostOptimizationRecommendations(ctx context.Context) ([]string, error) {
	var recommendations []string

	// Get last 30 days cost data
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -30)

	serviceCosts, err := cm.GetServiceCosts(ctx, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Analyze service costs and provide recommendations
	for service, cost := range serviceCosts {
		switch service {
		case "ecs":
			if cost > 1000 { // Example threshold
				recommendations = append(recommendations,
					fmt.Sprintf("Consider using reserved instances for ECS service (current cost: ¥%.2f)", cost))
			}
		case "rds":
			if cost > 500 {
				recommendations = append(recommendations,
					fmt.Sprintf("Consider optimizing RDS instance size (current cost: ¥%.2f)", cost))
			}
		case "slb":
			if cost > 200 {
				recommendations = append(recommendations,
					fmt.Sprintf("Review load balancer configuration for optimization (current cost: ¥%.2f)", cost))
			}
		}
	}

	// Add general recommendations
	if len(serviceCosts) > 0 {
		recommendations = append(recommendations,
			"Enable auto-scaling to optimize resource usage during low traffic periods",
			"Consider using spot instances for non-critical workloads",
			"Implement resource tagging for better cost allocation and tracking")
	}

	return recommendations, nil
}

// RecordAliyunCosts records costs from Aliyun billing API
func (cm *CostMonitor) RecordAliyunCosts(ctx context.Context, billingData map[string]interface{}) error {
	// This would integrate with Aliyun billing API
	// For now, we'll simulate with sample data

	services := []string{"ecs", "rds", "slb", "oss", "cdn"}
	regions := []string{"cn-hangzhou", "cn-shanghai", "cn-beijing"}

	for _, service := range services {
		for _, region := range regions {
			// Simulate cost data
			cost := float64(100 + (len(service) * 10)) // Simple cost calculation

			metric := &CostMetric{
				Service:  service,
				Resource: fmt.Sprintf("%s-instance", service),
				Region:   region,
				Cost:     cost,
				Currency: "CNY",
				Unit:     "hour",
				Tags:     `{"environment":"production","project":"nextevent"}`,
			}

			if err := cm.RecordCostMetric(ctx, metric); err != nil {
				return err
			}
		}
	}

	return nil
}

// generateID generates a unique ID for cost records
func generateID() string {
	return fmt.Sprintf("cost_%d", time.Now().UnixNano())
}
