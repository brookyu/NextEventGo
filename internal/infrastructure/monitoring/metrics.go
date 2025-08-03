package monitoring

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

// MetricsCollector handles application metrics collection
type MetricsCollector struct {
	logger *zap.Logger
	
	// HTTP metrics
	httpRequestsTotal     *prometheus.CounterVec
	httpRequestDuration   *prometheus.HistogramVec
	httpRequestSize       *prometheus.HistogramVec
	httpResponseSize      *prometheus.HistogramVec
	
	// Database metrics
	dbConnectionsActive   prometheus.Gauge
	dbConnectionsIdle     prometheus.Gauge
	dbQueryDuration       *prometheus.HistogramVec
	dbQueriesTotal        *prometheus.CounterVec
	
	// Cache metrics
	cacheHitsTotal        *prometheus.CounterVec
	cacheMissesTotal      *prometheus.CounterVec
	cacheOperationDuration *prometheus.HistogramVec
	
	// Business metrics
	imagesTotal           prometheus.Gauge
	articlesTotal         prometheus.Gauge
	newsTotal             prometheus.Gauge
	videosTotal           prometheus.Gauge
	activeVideoSessions   prometheus.Gauge
	
	// System metrics
	goroutinesActive      prometheus.Gauge
	memoryUsage           prometheus.Gauge
	cpuUsage              prometheus.Gauge
	
	// Error metrics
	errorsTotal           *prometheus.CounterVec
	panicTotal            prometheus.Counter
	
	// Custom metrics
	customCounters        map[string]*prometheus.CounterVec
	customGauges          map[string]*prometheus.GaugeVec
	customHistograms      map[string]*prometheus.HistogramVec
}

// NewMetricsCollector creates a new metrics collector
func NewMetricsCollector(logger *zap.Logger) *MetricsCollector {
	mc := &MetricsCollector{
		logger:         logger,
		customCounters: make(map[string]*prometheus.CounterVec),
		customGauges:   make(map[string]*prometheus.GaugeVec),
		customHistograms: make(map[string]*prometheus.HistogramVec),
	}
	
	mc.initMetrics()
	mc.registerMetrics()
	
	return mc
}

// initMetrics initializes all Prometheus metrics
func (mc *MetricsCollector) initMetrics() {
	// HTTP metrics
	mc.httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status_code"},
	)
	
	mc.httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint", "status_code"},
	)
	
	mc.httpRequestSize = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_size_bytes",
			Help:    "HTTP request size in bytes",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "endpoint"},
	)
	
	mc.httpResponseSize = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_response_size_bytes",
			Help:    "HTTP response size in bytes",
			Buckets: prometheus.ExponentialBuckets(100, 10, 8),
		},
		[]string{"method", "endpoint", "status_code"},
	)
	
	// Database metrics
	mc.dbConnectionsActive = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "db_connections_active",
			Help: "Number of active database connections",
		},
	)
	
	mc.dbConnectionsIdle = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "db_connections_idle",
			Help: "Number of idle database connections",
		},
	)
	
	mc.dbQueryDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "db_query_duration_seconds",
			Help:    "Database query duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation", "table"},
	)
	
	mc.dbQueriesTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "db_queries_total",
			Help: "Total number of database queries",
		},
		[]string{"operation", "table", "status"},
	)
	
	// Cache metrics
	mc.cacheHitsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cache_hits_total",
			Help: "Total number of cache hits",
		},
		[]string{"cache_type", "key_type"},
	)
	
	mc.cacheMissesTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cache_misses_total",
			Help: "Total number of cache misses",
		},
		[]string{"cache_type", "key_type"},
	)
	
	mc.cacheOperationDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "cache_operation_duration_seconds",
			Help:    "Cache operation duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"operation", "cache_type"},
	)
	
	// Business metrics
	mc.imagesTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "images_total",
			Help: "Total number of images",
		},
	)
	
	mc.articlesTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "articles_total",
			Help: "Total number of articles",
		},
	)
	
	mc.newsTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "news_total",
			Help: "Total number of news publications",
		},
	)
	
	mc.videosTotal = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "videos_total",
			Help: "Total number of videos",
		},
	)
	
	mc.activeVideoSessions = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_video_sessions",
			Help: "Number of active video sessions",
		},
	)
	
	// System metrics
	mc.goroutinesActive = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "goroutines_active",
			Help: "Number of active goroutines",
		},
	)
	
	mc.memoryUsage = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "memory_usage_bytes",
			Help: "Memory usage in bytes",
		},
	)
	
	mc.cpuUsage = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "cpu_usage_percent",
			Help: "CPU usage percentage",
		},
	)
	
	// Error metrics
	mc.errorsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "errors_total",
			Help: "Total number of errors",
		},
		[]string{"type", "component"},
	)
	
	mc.panicTotal = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "panics_total",
			Help: "Total number of panics",
		},
	)
}

// registerMetrics registers all metrics with Prometheus
func (mc *MetricsCollector) registerMetrics() {
	prometheus.MustRegister(
		// HTTP metrics
		mc.httpRequestsTotal,
		mc.httpRequestDuration,
		mc.httpRequestSize,
		mc.httpResponseSize,
		
		// Database metrics
		mc.dbConnectionsActive,
		mc.dbConnectionsIdle,
		mc.dbQueryDuration,
		mc.dbQueriesTotal,
		
		// Cache metrics
		mc.cacheHitsTotal,
		mc.cacheMissesTotal,
		mc.cacheOperationDuration,
		
		// Business metrics
		mc.imagesTotal,
		mc.articlesTotal,
		mc.newsTotal,
		mc.videosTotal,
		mc.activeVideoSessions,
		
		// System metrics
		mc.goroutinesActive,
		mc.memoryUsage,
		mc.cpuUsage,
		
		// Error metrics
		mc.errorsTotal,
		mc.panicTotal,
	)
}

// HTTP Metrics Methods

func (mc *MetricsCollector) RecordHTTPRequest(method, endpoint, statusCode string, duration time.Duration, requestSize, responseSize int) {
	mc.httpRequestsTotal.WithLabelValues(method, endpoint, statusCode).Inc()
	mc.httpRequestDuration.WithLabelValues(method, endpoint, statusCode).Observe(duration.Seconds())
	mc.httpRequestSize.WithLabelValues(method, endpoint).Observe(float64(requestSize))
	mc.httpResponseSize.WithLabelValues(method, endpoint, statusCode).Observe(float64(responseSize))
}

// Database Metrics Methods

func (mc *MetricsCollector) RecordDBQuery(operation, table, status string, duration time.Duration) {
	mc.dbQueriesTotal.WithLabelValues(operation, table, status).Inc()
	mc.dbQueryDuration.WithLabelValues(operation, table).Observe(duration.Seconds())
}

func (mc *MetricsCollector) SetDBConnections(active, idle int) {
	mc.dbConnectionsActive.Set(float64(active))
	mc.dbConnectionsIdle.Set(float64(idle))
}

// Cache Metrics Methods

func (mc *MetricsCollector) RecordCacheHit(cacheType, keyType string) {
	mc.cacheHitsTotal.WithLabelValues(cacheType, keyType).Inc()
}

func (mc *MetricsCollector) RecordCacheMiss(cacheType, keyType string) {
	mc.cacheMissesTotal.WithLabelValues(cacheType, keyType).Inc()
}

func (mc *MetricsCollector) RecordCacheOperation(operation, cacheType string, duration time.Duration) {
	mc.cacheOperationDuration.WithLabelValues(operation, cacheType).Observe(duration.Seconds())
}

// Business Metrics Methods

func (mc *MetricsCollector) SetImagesTotal(count int64) {
	mc.imagesTotal.Set(float64(count))
}

func (mc *MetricsCollector) SetArticlesTotal(count int64) {
	mc.articlesTotal.Set(float64(count))
}

func (mc *MetricsCollector) SetNewsTotal(count int64) {
	mc.newsTotal.Set(float64(count))
}

func (mc *MetricsCollector) SetVideosTotal(count int64) {
	mc.videosTotal.Set(float64(count))
}

func (mc *MetricsCollector) SetActiveVideoSessions(count int64) {
	mc.activeVideoSessions.Set(float64(count))
}

// System Metrics Methods

func (mc *MetricsCollector) SetGoroutines(count int) {
	mc.goroutinesActive.Set(float64(count))
}

func (mc *MetricsCollector) SetMemoryUsage(bytes int64) {
	mc.memoryUsage.Set(float64(bytes))
}

func (mc *MetricsCollector) SetCPUUsage(percent float64) {
	mc.cpuUsage.Set(percent)
}

// Error Metrics Methods

func (mc *MetricsCollector) RecordError(errorType, component string) {
	mc.errorsTotal.WithLabelValues(errorType, component).Inc()
}

func (mc *MetricsCollector) RecordPanic() {
	mc.panicTotal.Inc()
}

// Custom Metrics Methods

func (mc *MetricsCollector) IncrementCustomCounter(name string, labels map[string]string) {
	if counter, exists := mc.customCounters[name]; exists {
		labelValues := make([]string, 0, len(labels))
		for _, value := range labels {
			labelValues = append(labelValues, value)
		}
		counter.WithLabelValues(labelValues...).Inc()
	}
}

func (mc *MetricsCollector) SetCustomGauge(name string, value float64, labels map[string]string) {
	if gauge, exists := mc.customGauges[name]; exists {
		labelValues := make([]string, 0, len(labels))
		for _, value := range labels {
			labelValues = append(labelValues, value)
		}
		gauge.WithLabelValues(labelValues...).Set(value)
	}
}

func (mc *MetricsCollector) ObserveCustomHistogram(name string, value float64, labels map[string]string) {
	if histogram, exists := mc.customHistograms[name]; exists {
		labelValues := make([]string, 0, len(labels))
		for _, value := range labels {
			labelValues = append(labelValues, value)
		}
		histogram.WithLabelValues(labelValues...).Observe(value)
	}
}

// Middleware

func (mc *MetricsCollector) HTTPMetricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		
		// Get request size
		requestSize := 0
		if c.Request.ContentLength > 0 {
			requestSize = int(c.Request.ContentLength)
		}
		
		c.Next()
		
		// Calculate metrics
		duration := time.Since(start)
		statusCode := strconv.Itoa(c.Writer.Status())
		responseSize := c.Writer.Size()
		
		// Record metrics
		mc.RecordHTTPRequest(
			c.Request.Method,
			c.FullPath(),
			statusCode,
			duration,
			requestSize,
			responseSize,
		)
	}
}

// Health check endpoint
func (mc *MetricsCollector) HealthCheckHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"timestamp": time.Now().UTC(),
		})
	}
}

// Metrics endpoint
func (mc *MetricsCollector) MetricsHandler() gin.HandlerFunc {
	handler := promhttp.Handler()
	return func(c *gin.Context) {
		handler.ServeHTTP(c.Writer, c.Request)
	}
}

// Background metrics collection
func (mc *MetricsCollector) StartBackgroundCollection(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			mc.collectSystemMetrics()
		}
	}
}

func (mc *MetricsCollector) collectSystemMetrics() {
	// This would collect system metrics like memory, CPU, goroutines
	// Implementation would depend on the specific monitoring requirements
	mc.logger.Debug("Collecting system metrics")
}
