package entities

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CloudVideoAnalyticPeriod represents the time period for analytics aggregation
type CloudVideoAnalyticPeriod string

const (
	CloudVideoAnalyticPeriodDaily   CloudVideoAnalyticPeriod = "daily"
	CloudVideoAnalyticPeriodWeekly  CloudVideoAnalyticPeriod = "weekly"
	CloudVideoAnalyticPeriodMonthly CloudVideoAnalyticPeriod = "monthly"
)

// GeographicDistribution represents geographic distribution data
type GeographicDistribution struct {
	Country string `json:"country"`
	Count   int64  `json:"count"`
	Percent float64 `json:"percent"`
}

// DeviceDistribution represents device distribution data
type DeviceDistribution struct {
	DeviceType string  `json:"deviceType"`
	Count      int64   `json:"count"`
	Percent    float64 `json:"percent"`
}

// BrowserDistribution represents browser distribution data
type BrowserDistribution struct {
	Browser string  `json:"browser"`
	Count   int64   `json:"count"`
	Percent float64 `json:"percent"`
}

// QualityDistribution represents video quality distribution data
type QualityDistribution struct {
	Quality string  `json:"quality"`
	Count   int64   `json:"count"`
	Percent float64 `json:"percent"`
}

// CloudVideoAnalytic represents aggregated analytics data for a cloud video
type CloudVideoAnalytic struct {
	// Primary key
	ID uuid.UUID `gorm:"type:char(36);primary_key;column:Id" json:"id"`

	// Video reference
	CloudVideoID uuid.UUID  `gorm:"type:char(36);not null;index;column:CloudVideoId" json:"cloudVideoId"`
	CloudVideo   *CloudVideo `gorm:"foreignKey:CloudVideoID" json:"cloudVideo,omitempty"`

	// Time period
	PeriodType  CloudVideoAnalyticPeriod `gorm:"type:varchar(20);not null;column:PeriodType" json:"periodType"`
	PeriodStart time.Time                `gorm:"not null;column:PeriodStart" json:"periodStart"`
	PeriodEnd   time.Time                `gorm:"not null;column:PeriodEnd" json:"periodEnd"`

	// View metrics
	TotalViews       int64   `gorm:"default:0;column:TotalViews" json:"totalViews"`
	UniqueViewers    int64   `gorm:"default:0;column:UniqueViewers" json:"uniqueViewers"`
	TotalWatchTime   int64   `gorm:"default:0;column:TotalWatchTime" json:"totalWatchTime"` // in seconds
	AverageWatchTime float64 `gorm:"default:0;column:AverageWatchTime" json:"averageWatchTime"`
	CompletionRate   float64 `gorm:"default:0;column:CompletionRate" json:"completionRate"`

	// Engagement metrics
	TotalShares    int64   `gorm:"default:0;column:TotalShares" json:"totalShares"`
	TotalLikes     int64   `gorm:"default:0;column:TotalLikes" json:"totalLikes"`
	TotalComments  int64   `gorm:"default:0;column:TotalComments" json:"totalComments"`
	EngagementRate float64 `gorm:"default:0;column:EngagementRate" json:"engagementRate"`

	// Geographic distribution (JSON)
	CountryDistribution string `gorm:"type:text;column:CountryDistribution" json:"countryDistribution"` // JSON object
	CityDistribution    string `gorm:"type:text;column:CityDistribution" json:"cityDistribution"`       // JSON object

	// Device distribution (JSON)
	DeviceDistribution  string `gorm:"type:text;column:DeviceDistribution" json:"deviceDistribution"`   // JSON object
	BrowserDistribution string `gorm:"type:text;column:BrowserDistribution" json:"browserDistribution"` // JSON object

	// Quality distribution (JSON)
	QualityDistribution string `gorm:"type:text;column:QualityDistribution" json:"qualityDistribution"` // JSON object

	// Peak metrics
	PeakConcurrentViewers int       `gorm:"default:0;column:PeakConcurrentViewers" json:"peakConcurrentViewers"`
	PeakTime              time.Time `gorm:"column:PeakTime" json:"peakTime"`

	// Audit fields
	CreatedAt            time.Time `gorm:"index;column:CreationTime" json:"createdAt"`
	UpdatedAt            time.Time `gorm:"column:LastModificationTime" json:"updatedAt"`
	LastModificationTime time.Time `gorm:"column:LastModificationTime" json:"lastModificationTime"`
}

// TableName returns the table name for GORM
func (CloudVideoAnalytic) TableName() string {
	return "CloudVideoAnalytics"
}

// BeforeCreate sets the ID and timestamps before creating
func (cva *CloudVideoAnalytic) BeforeCreate(tx *gorm.DB) error {
	if cva.ID == uuid.Nil {
		cva.ID = uuid.New()
	}

	now := time.Now()
	cva.CreatedAt = now
	cva.UpdatedAt = now
	cva.LastModificationTime = now
	return nil
}

// BeforeUpdate sets the updated timestamp before updating
func (cva *CloudVideoAnalytic) BeforeUpdate(tx *gorm.DB) error {
	now := time.Now()
	cva.UpdatedAt = now
	cva.LastModificationTime = now
	return nil
}

// Business logic methods

// GetCountryDistribution parses and returns country distribution data
func (cva *CloudVideoAnalytic) GetCountryDistribution() ([]GeographicDistribution, error) {
	if cva.CountryDistribution == "" {
		return []GeographicDistribution{}, nil
	}

	var distribution []GeographicDistribution
	err := json.Unmarshal([]byte(cva.CountryDistribution), &distribution)
	return distribution, err
}

// SetCountryDistribution sets country distribution data as JSON
func (cva *CloudVideoAnalytic) SetCountryDistribution(distribution []GeographicDistribution) error {
	data, err := json.Marshal(distribution)
	if err != nil {
		return err
	}
	cva.CountryDistribution = string(data)
	return nil
}

// GetCityDistribution parses and returns city distribution data
func (cva *CloudVideoAnalytic) GetCityDistribution() ([]GeographicDistribution, error) {
	if cva.CityDistribution == "" {
		return []GeographicDistribution{}, nil
	}

	var distribution []GeographicDistribution
	err := json.Unmarshal([]byte(cva.CityDistribution), &distribution)
	return distribution, err
}

// SetCityDistribution sets city distribution data as JSON
func (cva *CloudVideoAnalytic) SetCityDistribution(distribution []GeographicDistribution) error {
	data, err := json.Marshal(distribution)
	if err != nil {
		return err
	}
	cva.CityDistribution = string(data)
	return nil
}

// GetDeviceDistribution parses and returns device distribution data
func (cva *CloudVideoAnalytic) GetDeviceDistribution() ([]DeviceDistribution, error) {
	if cva.DeviceDistribution == "" {
		return []DeviceDistribution{}, nil
	}

	var distribution []DeviceDistribution
	err := json.Unmarshal([]byte(cva.DeviceDistribution), &distribution)
	return distribution, err
}

// SetDeviceDistribution sets device distribution data as JSON
func (cva *CloudVideoAnalytic) SetDeviceDistribution(distribution []DeviceDistribution) error {
	data, err := json.Marshal(distribution)
	if err != nil {
		return err
	}
	cva.DeviceDistribution = string(data)
	return nil
}

// GetBrowserDistribution parses and returns browser distribution data
func (cva *CloudVideoAnalytic) GetBrowserDistribution() ([]BrowserDistribution, error) {
	if cva.BrowserDistribution == "" {
		return []BrowserDistribution{}, nil
	}

	var distribution []BrowserDistribution
	err := json.Unmarshal([]byte(cva.BrowserDistribution), &distribution)
	return distribution, err
}

// SetBrowserDistribution sets browser distribution data as JSON
func (cva *CloudVideoAnalytic) SetBrowserDistribution(distribution []BrowserDistribution) error {
	data, err := json.Marshal(distribution)
	if err != nil {
		return err
	}
	cva.BrowserDistribution = string(data)
	return nil
}

// GetQualityDistribution parses and returns quality distribution data
func (cva *CloudVideoAnalytic) GetQualityDistribution() ([]QualityDistribution, error) {
	if cva.QualityDistribution == "" {
		return []QualityDistribution{}, nil
	}

	var distribution []QualityDistribution
	err := json.Unmarshal([]byte(cva.QualityDistribution), &distribution)
	return distribution, err
}

// SetQualityDistribution sets quality distribution data as JSON
func (cva *CloudVideoAnalytic) SetQualityDistribution(distribution []QualityDistribution) error {
	data, err := json.Marshal(distribution)
	if err != nil {
		return err
	}
	cva.QualityDistribution = string(data)
	return nil
}

// CalculateEngagementRate calculates the engagement rate
func (cva *CloudVideoAnalytic) CalculateEngagementRate() {
	if cva.TotalViews == 0 {
		cva.EngagementRate = 0
		return
	}

	totalEngagements := cva.TotalLikes + cva.TotalShares + cva.TotalComments
	cva.EngagementRate = (float64(totalEngagements) / float64(cva.TotalViews)) * 100
}

// CalculateAverageWatchTime calculates the average watch time
func (cva *CloudVideoAnalytic) CalculateAverageWatchTime() {
	if cva.TotalViews == 0 {
		cva.AverageWatchTime = 0
		return
	}

	cva.AverageWatchTime = float64(cva.TotalWatchTime) / float64(cva.TotalViews)
}

// GetPeriodDuration returns the duration of the analytics period
func (cva *CloudVideoAnalytic) GetPeriodDuration() time.Duration {
	return cva.PeriodEnd.Sub(cva.PeriodStart)
}

// IsCurrentPeriod checks if the analytics period includes the current time
func (cva *CloudVideoAnalytic) IsCurrentPeriod() bool {
	now := time.Now()
	return now.After(cva.PeriodStart) && now.Before(cva.PeriodEnd)
}

// GetFormattedPeriod returns a formatted string representation of the period
func (cva *CloudVideoAnalytic) GetFormattedPeriod() string {
	switch cva.PeriodType {
	case CloudVideoAnalyticPeriodDaily:
		return cva.PeriodStart.Format("2006-01-02")
	case CloudVideoAnalyticPeriodWeekly:
		return cva.PeriodStart.Format("2006-01-02") + " to " + cva.PeriodEnd.Format("2006-01-02")
	case CloudVideoAnalyticPeriodMonthly:
		return cva.PeriodStart.Format("2006-01")
	default:
		return cva.PeriodStart.Format("2006-01-02") + " to " + cva.PeriodEnd.Format("2006-01-02")
	}
}

// UpdateMetrics updates all calculated metrics
func (cva *CloudVideoAnalytic) UpdateMetrics() {
	cva.CalculateEngagementRate()
	cva.CalculateAverageWatchTime()
}
