package testing

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// PerformanceMetrics represents performance test results
type PerformanceMetrics struct {
	TestName        string        `json:"test_name"`
	TotalRequests   int           `json:"total_requests"`
	SuccessfulReqs  int           `json:"successful_requests"`
	FailedRequests  int           `json:"failed_requests"`
	AverageLatency  time.Duration `json:"average_latency_ms"`
	P50Latency      time.Duration `json:"p50_latency_ms"`
	P95Latency      time.Duration `json:"p95_latency_ms"`
	P99Latency      time.Duration `json:"p99_latency_ms"`
	MinLatency      time.Duration `json:"min_latency_ms"`
	MaxLatency      time.Duration `json:"max_latency_ms"`
	RequestsPerSec  float64       `json:"requests_per_second"`
	ErrorRate       float64       `json:"error_rate_percent"`
	TestDuration    time.Duration `json:"test_duration_ms"`
	ConcurrentUsers int           `json:"concurrent_users"`
	StartTime       time.Time     `json:"start_time"`
	EndTime         time.Time     `json:"end_time"`
}

// RequestResult represents the result of a single request
type RequestResult struct {
	Success   bool
	Latency   time.Duration
	Error     error
	Timestamp time.Time
}

// PerformanceTester handles performance testing operations
type PerformanceTester struct {
	baseURL string
	client  *http.Client
	logger  *log.Logger
}

// NewPerformanceTester creates a new performance tester
func NewPerformanceTester(baseURL string, logger *log.Logger) *PerformanceTester {
	return &PerformanceTester{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

// TestEventAPIPerformance tests event API endpoints performance
func (pt *PerformanceTester) TestEventAPIPerformance(ctx context.Context, concurrentUsers int, duration time.Duration) (*PerformanceMetrics, error) {
	pt.logger.Printf("Starting event API performance test with %d concurrent users for %v", concurrentUsers, duration)

	results := make(chan RequestResult, concurrentUsers*1000)
	var wg sync.WaitGroup

	startTime := time.Now()
	testCtx, cancel := context.WithTimeout(ctx, duration)
	defer cancel()

	// Start concurrent workers
	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			pt.eventAPIWorker(testCtx, workerID, results)
		}(i)
	}

	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	var allResults []RequestResult
	for result := range results {
		allResults = append(allResults, result)
	}

	endTime := time.Now()
	return pt.calculateMetrics("Event API Performance", allResults, concurrentUsers, startTime, endTime), nil
}

// TestWeChatAPIPerformance tests WeChat API endpoints performance
func (pt *PerformanceTester) TestWeChatAPIPerformance(ctx context.Context, concurrentUsers int, duration time.Duration) (*PerformanceMetrics, error) {
	pt.logger.Printf("Starting WeChat API performance test with %d concurrent users for %v", concurrentUsers, duration)

	results := make(chan RequestResult, concurrentUsers*1000)
	var wg sync.WaitGroup

	startTime := time.Now()
	testCtx, cancel := context.WithTimeout(ctx, duration)
	defer cancel()

	// Start concurrent workers
	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			pt.wechatAPIWorker(testCtx, workerID, results)
		}(i)
	}

	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	var allResults []RequestResult
	for result := range results {
		allResults = append(allResults, result)
	}

	endTime := time.Now()
	return pt.calculateMetrics("WeChat API Performance", allResults, concurrentUsers, startTime, endTime), nil
}

// TestUserAPIPerformance tests user management API performance
func (pt *PerformanceTester) TestUserAPIPerformance(ctx context.Context, concurrentUsers int, duration time.Duration) (*PerformanceMetrics, error) {
	pt.logger.Printf("Starting user API performance test with %d concurrent users for %v", concurrentUsers, duration)

	results := make(chan RequestResult, concurrentUsers*1000)
	var wg sync.WaitGroup

	startTime := time.Now()
	testCtx, cancel := context.WithTimeout(ctx, duration)
	defer cancel()

	// Start concurrent workers
	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			pt.userAPIWorker(testCtx, workerID, results)
		}(i)
	}

	// Wait for all workers to complete
	go func() {
		wg.Wait()
		close(results)
	}()

	// Collect results
	var allResults []RequestResult
	for result := range results {
		allResults = append(allResults, result)
	}

	endTime := time.Now()
	return pt.calculateMetrics("User API Performance", allResults, concurrentUsers, startTime, endTime), nil
}

// eventAPIWorker simulates event API requests
func (pt *PerformanceTester) eventAPIWorker(ctx context.Context, workerID int, results chan<- RequestResult) {
	endpoints := []string{
		"/api/events",
		"/api/events?limit=10",
		"/api/events/statistics",
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Pick a random endpoint
			endpoint := endpoints[workerID%len(endpoints)]
			result := pt.makeRequest(ctx, "GET", endpoint, nil)
			results <- result

			// Small delay to simulate realistic usage
			time.Sleep(time.Millisecond * 100)
		}
	}
}

// wechatAPIWorker simulates WeChat API requests
func (pt *PerformanceTester) wechatAPIWorker(ctx context.Context, workerID int, results chan<- RequestResult) {
	endpoints := []string{
		"/api/wechat/health",
		"/api/wechat/statistics",
		"/api/wechat/messages?limit=10",
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Pick a random endpoint
			endpoint := endpoints[workerID%len(endpoints)]
			result := pt.makeRequest(ctx, "GET", endpoint, nil)
			results <- result

			// Small delay to simulate realistic usage
			time.Sleep(time.Millisecond * 150)
		}
	}
}

// userAPIWorker simulates user API requests
func (pt *PerformanceTester) userAPIWorker(ctx context.Context, workerID int, results chan<- RequestResult) {
	endpoints := []string{
		"/api/users",
		"/api/users?limit=10",
		"/api/users/statistics",
	}

	for {
		select {
		case <-ctx.Done():
			return
		default:
			// Pick a random endpoint
			endpoint := endpoints[workerID%len(endpoints)]
			result := pt.makeRequest(ctx, "GET", endpoint, nil)
			results <- result

			// Small delay to simulate realistic usage
			time.Sleep(time.Millisecond * 120)
		}
	}
}

// makeRequest makes an HTTP request and measures performance
func (pt *PerformanceTester) makeRequest(ctx context.Context, method, endpoint string, body interface{}) RequestResult {
	start := time.Now()

	req, err := http.NewRequestWithContext(ctx, method, pt.baseURL+endpoint, nil)
	if err != nil {
		return RequestResult{
			Success:   false,
			Latency:   time.Since(start),
			Error:     err,
			Timestamp: start,
		}
	}

	resp, err := pt.client.Do(req)
	latency := time.Since(start)

	if err != nil {
		return RequestResult{
			Success:   false,
			Latency:   latency,
			Error:     err,
			Timestamp: start,
		}
	}
	defer resp.Body.Close()

	success := resp.StatusCode >= 200 && resp.StatusCode < 300
	var resultError error
	if !success {
		resultError = fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	return RequestResult{
		Success:   success,
		Latency:   latency,
		Error:     resultError,
		Timestamp: start,
	}
}

// calculateMetrics calculates performance metrics from test results
func (pt *PerformanceTester) calculateMetrics(testName string, results []RequestResult, concurrentUsers int, startTime, endTime time.Time) *PerformanceMetrics {
	if len(results) == 0 {
		return &PerformanceMetrics{
			TestName:        testName,
			ConcurrentUsers: concurrentUsers,
			StartTime:       startTime,
			EndTime:         endTime,
			TestDuration:    endTime.Sub(startTime),
		}
	}

	// Sort results by latency for percentile calculations
	latencies := make([]time.Duration, len(results))
	var totalLatency time.Duration
	successCount := 0
	minLatency := results[0].Latency
	maxLatency := results[0].Latency

	for i, result := range results {
		latencies[i] = result.Latency
		totalLatency += result.Latency

		if result.Success {
			successCount++
		}

		if result.Latency < minLatency {
			minLatency = result.Latency
		}
		if result.Latency > maxLatency {
			maxLatency = result.Latency
		}
	}

	// Sort for percentile calculations
	for i := 0; i < len(latencies); i++ {
		for j := i + 1; j < len(latencies); j++ {
			if latencies[i] > latencies[j] {
				latencies[i], latencies[j] = latencies[j], latencies[i]
			}
		}
	}

	testDuration := endTime.Sub(startTime)

	return &PerformanceMetrics{
		TestName:        testName,
		TotalRequests:   len(results),
		SuccessfulReqs:  successCount,
		FailedRequests:  len(results) - successCount,
		AverageLatency:  totalLatency / time.Duration(len(results)),
		P50Latency:      latencies[len(latencies)*50/100],
		P95Latency:      latencies[len(latencies)*95/100],
		P99Latency:      latencies[len(latencies)*99/100],
		MinLatency:      minLatency,
		MaxLatency:      maxLatency,
		RequestsPerSec:  float64(len(results)) / testDuration.Seconds(),
		ErrorRate:       float64(len(results)-successCount) / float64(len(results)) * 100,
		TestDuration:    testDuration,
		ConcurrentUsers: concurrentUsers,
		StartTime:       startTime,
		EndTime:         endTime,
	}
}

// ValidatePerformanceTargets validates if performance meets target requirements
func (pt *PerformanceTester) ValidatePerformanceTargets(metrics *PerformanceMetrics) []string {
	var issues []string

	// Target: 95th percentile under 100ms
	if metrics.P95Latency > 100*time.Millisecond {
		issues = append(issues, fmt.Sprintf("P95 latency %v exceeds target of 100ms", metrics.P95Latency))
	}

	// Target: Error rate under 1%
	if metrics.ErrorRate > 1.0 {
		issues = append(issues, fmt.Sprintf("Error rate %.2f%% exceeds target of 1%%", metrics.ErrorRate))
	}

	// Target: Support 10,000+ concurrent users (this would need a larger test)
	if metrics.ConcurrentUsers >= 1000 && metrics.RequestsPerSec < 100 {
		issues = append(issues, fmt.Sprintf("Requests per second %.2f is below expected threshold for %d concurrent users", metrics.RequestsPerSec, metrics.ConcurrentUsers))
	}

	return issues
}
