# Performance Optimization Guide

This guide provides comprehensive strategies for optimizing the performance of the NextEvent Go API v2.0.

## 🎯 Performance Targets

### Response Time Targets
- **API Endpoints**: < 100ms for 95th percentile
- **Database Queries**: < 50ms for simple queries, < 200ms for complex queries
- **Cache Operations**: < 10ms for Redis operations
- **File Uploads**: < 5 seconds for 50MB files

### Throughput Targets
- **Concurrent Users**: 10,000+ simultaneous users
- **Requests per Second**: 1,000+ RPS sustained
- **Database Connections**: Efficient pool utilization (< 80% usage)
- **Memory Usage**: < 512MB per instance under normal load

## 🚀 Database Performance Optimization

### Connection Pool Configuration

```go
// Optimal database configuration
func configureDatabasePool(db *gorm.DB) error {
    sqlDB, err := db.DB()
    if err != nil {
        return err
    }

    // Connection pool settings
    sqlDB.SetMaxOpenConns(25)        // Maximum open connections
    sqlDB.SetMaxIdleConns(10)        // Maximum idle connections
    sqlDB.SetConnMaxLifetime(1 * time.Hour)  // Connection lifetime
    sqlDB.SetConnMaxIdleTime(10 * time.Minute) // Idle timeout

    return nil
}
```

### Query Optimization Strategies

#### 1. Use Proper Indexing
```sql
-- Essential indexes for performance
CREATE INDEX CONCURRENTLY idx_site_images_status_type ON site_images(status, type);
CREATE INDEX CONCURRENTLY idx_site_articles_status_published ON site_articles(status, published_at);
CREATE INDEX CONCURRENTLY idx_news_status_priority ON news(status, priority, published_at);
CREATE INDEX CONCURRENTLY idx_videos_status_type ON videos(status, video_type, start_time);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_site_images_search ON site_images USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY idx_articles_full_text ON site_articles USING gin(to_tsvector('english', title || ' ' || content));
```

#### 2. Optimize GORM Queries
```go
// Efficient pagination with cursor-based approach
func (r *imageRepository) GetImagesWithCursor(ctx context.Context, cursor string, limit int) ([]*entities.SiteImage, error) {
    var images []*entities.SiteImage
    
    query := r.db.WithContext(ctx).
        Select("id, title, file_name, url, thumbnail_url, created_at").
        Where("status = ?", entities.ImageStatusActive).
        Order("created_at DESC, id DESC").
        Limit(limit)
    
    if cursor != "" {
        query = query.Where("created_at < ? OR (created_at = ? AND id < ?)", 
            cursorTime, cursorTime, cursorID)
    }
    
    return images, query.Find(&images).Error
}

// Use preloading efficiently
func (r *newsRepository) GetNewsWithArticles(ctx context.Context, id uuid.UUID) (*entities.News, error) {
    var news entities.News
    
    return &news, r.db.WithContext(ctx).
        Preload("Articles", func(db *gorm.DB) *gorm.DB {
            return db.Select("id, title, summary, published_at").
                Where("status = ?", entities.ArticleStatusPublished)
        }).
        First(&news, "id = ?", id).Error
}

// Batch operations for efficiency
func (r *imageRepository) UpdateMultipleImages(ctx context.Context, updates []ImageUpdate) error {
    return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        for _, update := range updates {
            if err := tx.Model(&entities.SiteImage{}).
                Where("id = ?", update.ID).
                Updates(update.Fields).Error; err != nil {
                return err
            }
        }
        return nil
    })
}
```

#### 3. Database Query Monitoring
```go
// Add query logging and monitoring
func setupDatabaseMonitoring(db *gorm.DB, metrics *monitoring.MetricsCollector) {
    db.Callback().Query().Before("gorm:query").Register("metrics:query_start", func(db *gorm.DB) {
        db.Set("query_start_time", time.Now())
    })
    
    db.Callback().Query().After("gorm:query").Register("metrics:query_end", func(db *gorm.DB) {
        if startTime, ok := db.Get("query_start_time"); ok {
            duration := time.Since(startTime.(time.Time))
            
            // Extract table name and operation
            table := extractTableName(db.Statement.SQL.String())
            operation := extractOperation(db.Statement.SQL.String())
            
            // Record metrics
            status := "success"
            if db.Error != nil {
                status = "error"
            }
            
            metrics.RecordDBQuery(operation, table, status, duration)
        }
    })
}
```

## ⚡ Caching Optimization

### Redis Configuration
```go
// Optimal Redis configuration
func configureRedisCache() cache.CacheConfig {
    return cache.CacheConfig{
        Addr:         "redis-cluster:6379",
        PoolSize:     20,              // Increased pool size
        MinIdleConns: 10,              // Maintain idle connections
        MaxRetries:   3,               // Retry failed operations
        DialTimeout:  5 * time.Second,
        ReadTimeout:  3 * time.Second,
        WriteTimeout: 3 * time.Second,
        PoolTimeout:  4 * time.Second,
        IdleTimeout:  5 * time.Minute,
        KeyPrefix:    "nextevent:v2:",
        DefaultTTL:   1 * time.Hour,
    }
}
```

### Intelligent Caching Strategies

#### 1. Multi-Level Caching
```go
// Implement multi-level caching
type MultiLevelCache struct {
    l1Cache *sync.Map          // In-memory L1 cache
    l2Cache cache.CacheInterface // Redis L2 cache
    metrics *monitoring.MetricsCollector
}

func (mc *MultiLevelCache) Get(ctx context.Context, key string, dest interface{}) error {
    // Try L1 cache first
    if value, ok := mc.l1Cache.Load(key); ok {
        mc.metrics.RecordCacheHit("l1", "memory")
        return json.Unmarshal(value.([]byte), dest)
    }
    
    // Try L2 cache
    if err := mc.l2Cache.Get(ctx, key, dest); err == nil {
        mc.metrics.RecordCacheHit("l2", "redis")
        
        // Store in L1 cache for future requests
        if data, err := json.Marshal(dest); err == nil {
            mc.l1Cache.Store(key, data)
        }
        return nil
    }
    
    mc.metrics.RecordCacheMiss("multi", "all")
    return cache.ErrCacheMiss
}
```

#### 2. Cache Warming Strategies
```go
// Implement intelligent cache warming
func (cm *CacheManager) WarmupPopularContent(ctx context.Context) error {
    // Warm up most viewed images
    popularImages, err := cm.imageRepo.GetMostViewed(ctx, 100)
    if err != nil {
        return err
    }
    
    for _, image := range popularImages {
        cm.SetImage(ctx, image)
    }
    
    // Warm up recent news
    recentNews, err := cm.newsRepo.GetRecent(ctx, 50)
    if err != nil {
        return err
    }
    
    for _, news := range recentNews {
        cm.SetNews(ctx, news)
    }
    
    return nil
}

// Schedule cache warming
func (cm *CacheManager) StartCacheWarming(ctx context.Context) {
    ticker := time.NewTicker(30 * time.Minute)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            if err := cm.WarmupPopularContent(ctx); err != nil {
                cm.logger.Error("Cache warming failed", zap.Error(err))
            }
        }
    }
}
```

#### 3. Smart Cache Invalidation
```go
// Implement smart cache invalidation
func (cm *CacheManager) InvalidateRelatedContent(ctx context.Context, entityType string, id uuid.UUID) error {
    switch entityType {
    case "news":
        // Invalidate news cache
        cm.DeleteNews(ctx, id)
        
        // Invalidate related article caches
        news, err := cm.newsRepo.GetByID(ctx, id)
        if err == nil {
            for _, article := range news.Articles {
                cm.DeleteArticle(ctx, article.ID, article.Slug)
            }
        }
        
        // Invalidate list caches
        cm.InvalidateListCache(ctx, "news")
        
    case "image":
        // Invalidate image cache
        cm.DeleteImage(ctx, id)
        
        // Invalidate content that uses this image
        cm.InvalidateContentUsingImage(ctx, id)
    }
    
    return nil
}
```

## 🔧 Application Performance Optimization

### HTTP Server Configuration
```go
// Optimize HTTP server settings
func configureHTTPServer() *http.Server {
    return &http.Server{
        Addr:           ":8080",
        ReadTimeout:    30 * time.Second,
        WriteTimeout:   30 * time.Second,
        IdleTimeout:    60 * time.Second,
        MaxHeaderBytes: 8192, // 8KB max headers
    }
}

// Configure Gin for production
func setupGinProduction() *gin.Engine {
    gin.SetMode(gin.ReleaseMode)
    
    router := gin.New()
    
    // Use efficient middleware
    router.Use(gin.Recovery())
    router.Use(middleware.RequestID())
    router.Use(middleware.Logger())
    router.Use(middleware.CORS())
    
    // Configure trusted proxies
    router.SetTrustedProxies([]string{"10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"})
    
    return router
}
```

### Memory Optimization
```go
// Implement object pooling for frequently used objects
var imageResponsePool = sync.Pool{
    New: func() interface{} {
        return &ImageResponse{}
    },
}

func (s *imageService) GetImage(ctx context.Context, id uuid.UUID) (*ImageResponse, error) {
    // Get object from pool
    response := imageResponsePool.Get().(*ImageResponse)
    defer func() {
        // Reset and return to pool
        *response = ImageResponse{}
        imageResponsePool.Put(response)
    }()
    
    // Use the response object...
    image, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }
    
    // Map to response
    response.ID = image.ID
    response.Title = image.Title
    // ... other fields
    
    // Return a copy, not the pooled object
    result := *response
    return &result, nil
}
```

### Goroutine Management
```go
// Implement worker pools for concurrent processing
type WorkerPool struct {
    workers    int
    jobQueue   chan Job
    workerPool chan chan Job
    quit       chan bool
}

func NewWorkerPool(workers int, queueSize int) *WorkerPool {
    return &WorkerPool{
        workers:    workers,
        jobQueue:   make(chan Job, queueSize),
        workerPool: make(chan chan Job, workers),
        quit:       make(chan bool),
    }
}

func (wp *WorkerPool) Start() {
    for i := 0; i < wp.workers; i++ {
        worker := NewWorker(wp.workerPool, wp.quit)
        worker.Start()
    }
    
    go wp.dispatch()
}

// Use worker pool for image processing
func (s *imageService) ProcessImageAsync(ctx context.Context, imageID uuid.UUID) error {
    job := Job{
        Type: "image_processing",
        Data: map[string]interface{}{
            "image_id": imageID,
            "context":  ctx,
        },
    }
    
    select {
    case s.workerPool.jobQueue <- job:
        return nil
    case <-ctx.Done():
        return ctx.Err()
    default:
        return errors.New("worker pool queue full")
    }
}
```

## 📊 Performance Monitoring

### Custom Metrics Collection
```go
// Implement detailed performance metrics
func (s *imageService) GetImageWithMetrics(ctx context.Context, id uuid.UUID) (*entities.SiteImage, error) {
    start := time.Now()
    
    // Try cache first
    cacheStart := time.Now()
    if image, err := s.cache.GetImage(ctx, id); err == nil {
        s.metrics.RecordCacheHit("image", "get")
        s.metrics.ObserveCustomHistogram("image_service_duration", 
            time.Since(start).Seconds(), 
            map[string]string{"source": "cache", "operation": "get"})
        return image, nil
    }
    s.metrics.RecordCacheMiss("image", "get")
    
    // Get from database
    dbStart := time.Now()
    image, err := s.repo.GetByID(ctx, id)
    if err != nil {
        s.metrics.RecordError("database", "image_service")
        return nil, err
    }
    
    // Record metrics
    s.metrics.ObserveCustomHistogram("database_query_duration", 
        time.Since(dbStart).Seconds(),
        map[string]string{"table": "site_images", "operation": "get"})
    
    // Cache the result
    go func() {
        if err := s.cache.SetImage(context.Background(), image); err != nil {
            s.logger.Warn("Failed to cache image", zap.Error(err))
        }
    }()
    
    s.metrics.ObserveCustomHistogram("image_service_duration", 
        time.Since(start).Seconds(),
        map[string]string{"source": "database", "operation": "get"})
    
    return image, nil
}
```

### Performance Profiling
```go
// Add pprof endpoints for profiling
func addProfilingEndpoints(router *gin.Engine) {
    pprof := router.Group("/debug/pprof")
    {
        pprof.GET("/", gin.WrapF(pprof.Index))
        pprof.GET("/cmdline", gin.WrapF(pprof.Cmdline))
        pprof.GET("/profile", gin.WrapF(pprof.Profile))
        pprof.POST("/symbol", gin.WrapF(pprof.Symbol))
        pprof.GET("/symbol", gin.WrapF(pprof.Symbol))
        pprof.GET("/trace", gin.WrapF(pprof.Trace))
        pprof.GET("/allocs", gin.WrapH(pprof.Handler("allocs")))
        pprof.GET("/block", gin.WrapH(pprof.Handler("block")))
        pprof.GET("/goroutine", gin.WrapH(pprof.Handler("goroutine")))
        pprof.GET("/heap", gin.WrapH(pprof.Handler("heap")))
        pprof.GET("/mutex", gin.WrapH(pprof.Handler("mutex")))
        pprof.GET("/threadcreate", gin.WrapH(pprof.Handler("threadcreate")))
    }
}
```

## 🎯 Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Image API Load Test"
    weight: 40
    flow:
      - get:
          url: "/api/v2/images"
          headers:
            X-API-Key: "test-api-key"
      - get:
          url: "/api/v2/images/{{ $randomUUID }}"
          headers:
            X-API-Key: "test-api-key"
  
  - name: "News API Load Test"
    weight: 30
    flow:
      - get:
          url: "/api/v2/news"
          headers:
            Authorization: "Bearer {{ $jwt_token }}"
      - get:
          url: "/api/v2/news/{{ $randomUUID }}"
          headers:
            Authorization: "Bearer {{ $jwt_token }}"
```

### Benchmark Tests
```go
// Benchmark critical operations
func BenchmarkImageService_GetImage(b *testing.B) {
    suite := testing.NewTestSuite(&testing.T{})
    defer suite.Cleanup()
    
    // Create test image
    image := suite.CreateTestImage()
    
    b.ResetTimer()
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            _, err := suite.ImageService.GetImage(context.Background(), image.ID)
            if err != nil {
                b.Fatal(err)
            }
        }
    })
}

func BenchmarkCacheOperations(b *testing.B) {
    cache := setupTestCache()
    testData := generateTestData()
    
    b.Run("Set", func(b *testing.B) {
        for i := 0; i < b.N; i++ {
            cache.Set(context.Background(), fmt.Sprintf("key_%d", i), testData, time.Hour)
        }
    })
    
    b.Run("Get", func(b *testing.B) {
        // Pre-populate cache
        for i := 0; i < 1000; i++ {
            cache.Set(context.Background(), fmt.Sprintf("key_%d", i), testData, time.Hour)
        }
        
        b.ResetTimer()
        b.RunParallel(func(pb *testing.PB) {
            for pb.Next() {
                var result interface{}
                cache.Get(context.Background(), fmt.Sprintf("key_%d", rand.Intn(1000)), &result)
            }
        })
    })
}
```

## 📈 Performance Monitoring Dashboard

### Key Performance Indicators (KPIs)
- **Response Time**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Error Rate**: Percentage of failed requests
- **Cache Hit Ratio**: Percentage of cache hits
- **Database Performance**: Query duration and connection pool usage
- **Memory Usage**: Heap size and garbage collection frequency
- **CPU Usage**: CPU utilization percentage

### Alerting Rules
```yaml
# Prometheus alerting rules
groups:
  - name: nextevent-api-performance
    rules:
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"
      
      - alert: LowCacheHitRatio
        expr: rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low cache hit ratio"
          description: "Cache hit ratio is {{ $value | humanizePercentage }}"
```

This performance optimization guide provides comprehensive strategies for maximizing the performance of the NextEvent Go API v2.0, ensuring it can handle high loads while maintaining excellent response times.
