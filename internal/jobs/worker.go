package jobs

import (
	"context"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// WorkerServer manages the Asynq worker server
type WorkerServer struct {
	server  *asynq.Server
	mux     *asynq.ServeMux
	handler JobHandler
	logger  *zap.Logger
}

// NewWorkerServer creates a new worker server
func NewWorkerServer(redisClient *redis.Client, handler JobHandler, logger *zap.Logger) *WorkerServer {
	// Create Asynq server configuration
	cfg := asynq.Config{
		Concurrency: 10, // Number of concurrent workers
		Queues: map[string]int{
			"critical":  6, // High priority queue
			"news":      3, // News-related jobs
			"wechat":    2, // WeChat-related jobs
			"analytics": 1, // Analytics jobs
			"default":   1, // Default queue
		},
		// Retry configuration
		RetryDelayFunc: func(n int, e error, t *asynq.Task) time.Duration {
			// Exponential backoff: 1s, 2s, 4s, 8s, 16s
			return time.Duration(1<<uint(n)) * time.Second
		},
		// Error handler
		ErrorHandler: asynq.ErrorHandlerFunc(func(ctx context.Context, task *asynq.Task, err error) {
			logger.Error("Task failed",
				zap.String("taskType", task.Type()),
				zap.String("taskID", task.ResultWriter().TaskID()),
				zap.Error(err))
		}),
		// Logger
		Logger: NewAsynqLogger(logger),
	}

	// Create Asynq server with Redis connection
	server := asynq.NewServer(asynq.RedisClientOpt{
		Addr:     redisClient.Options().Addr,
		Password: redisClient.Options().Password,
		DB:       redisClient.Options().DB,
	}, cfg)

	// Create multiplexer for routing tasks
	mux := asynq.NewServeMux()

	return &WorkerServer{
		server:  server,
		mux:     mux,
		handler: handler,
		logger:  logger,
	}
}

// RegisterHandlers registers all job handlers
func (w *WorkerServer) RegisterHandlers() {
	// Register scheduled news publisher handler
	w.mux.HandleFunc(TypeScheduledNewsPublisher, w.handler.HandleScheduledNewsPublisher)
	
	// Register news expiration handler
	w.mux.HandleFunc(TypeNewsExpiration, w.handler.HandleNewsExpiration)
	
	// Register WeChat draft creation handler
	w.mux.HandleFunc(TypeWeChatDraftCreation, w.handler.HandleWeChatDraftCreation)
	
	// Register WeChat publishing handler
	w.mux.HandleFunc(TypeWeChatPublishing, w.handler.HandleWeChatPublishing)
	
	// Register news analytics handler
	w.mux.HandleFunc(TypeNewsAnalytics, w.handler.HandleNewsAnalytics)

	w.logger.Info("All job handlers registered successfully")
}

// Start starts the worker server
func (w *WorkerServer) Start() error {
	w.logger.Info("Starting worker server...")
	
	// Register handlers
	w.RegisterHandlers()
	
	// Start the server
	if err := w.server.Run(w.mux); err != nil {
		w.logger.Error("Failed to start worker server", zap.Error(err))
		return fmt.Errorf("failed to start worker server: %w", err)
	}
	
	return nil
}

// Stop stops the worker server gracefully
func (w *WorkerServer) Stop() {
	w.logger.Info("Stopping worker server...")
	w.server.Shutdown()
	w.logger.Info("Worker server stopped")
}

// Health returns the health status of the worker server
func (w *WorkerServer) Health() error {
	// Check if server is running
	// This is a simple implementation - you might want to add more checks
	return nil
}

// AsynqLogger adapts zap.Logger to asynq.Logger interface
type AsynqLogger struct {
	logger *zap.Logger
}

// NewAsynqLogger creates a new Asynq logger adapter
func NewAsynqLogger(logger *zap.Logger) *AsynqLogger {
	return &AsynqLogger{logger: logger}
}

// Debug logs a debug message
func (l *AsynqLogger) Debug(args ...interface{}) {
	l.logger.Debug(fmt.Sprint(args...))
}

// Info logs an info message
func (l *AsynqLogger) Info(args ...interface{}) {
	l.logger.Info(fmt.Sprint(args...))
}

// Warn logs a warning message
func (l *AsynqLogger) Warn(args ...interface{}) {
	l.logger.Warn(fmt.Sprint(args...))
}

// Error logs an error message
func (l *AsynqLogger) Error(args ...interface{}) {
	l.logger.Error(fmt.Sprint(args...))
}

// Fatal logs a fatal message
func (l *AsynqLogger) Fatal(args ...interface{}) {
	l.logger.Fatal(fmt.Sprint(args...))
}

// WorkerManager manages multiple worker processes
type WorkerManager struct {
	workers []*WorkerServer
	logger  *zap.Logger
}

// NewWorkerManager creates a new worker manager
func NewWorkerManager(logger *zap.Logger) *WorkerManager {
	return &WorkerManager{
		workers: make([]*WorkerServer, 0),
		logger:  logger,
	}
}

// AddWorker adds a worker to the manager
func (m *WorkerManager) AddWorker(worker *WorkerServer) {
	m.workers = append(m.workers, worker)
}

// StartAll starts all workers
func (m *WorkerManager) StartAll() error {
	m.logger.Info("Starting all workers", zap.Int("count", len(m.workers)))
	
	for i, worker := range m.workers {
		go func(idx int, w *WorkerServer) {
			if err := w.Start(); err != nil {
				m.logger.Error("Worker failed to start",
					zap.Int("workerIndex", idx),
					zap.Error(err))
			}
		}(i, worker)
	}
	
	return nil
}

// StopAll stops all workers gracefully
func (m *WorkerManager) StopAll() {
	m.logger.Info("Stopping all workers", zap.Int("count", len(m.workers)))
	
	for i, worker := range m.workers {
		m.logger.Info("Stopping worker", zap.Int("workerIndex", i))
		worker.Stop()
	}
	
	m.logger.Info("All workers stopped")
}

// HealthCheck checks the health of all workers
func (m *WorkerManager) HealthCheck() error {
	for i, worker := range m.workers {
		if err := worker.Health(); err != nil {
			return fmt.Errorf("worker %d is unhealthy: %w", i, err)
		}
	}
	return nil
}
