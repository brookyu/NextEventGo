package wechat

import (
	"context"
	"fmt"
	"math"
	"time"

	"go.uber.org/zap"
)

// RetryConfig represents retry configuration
type RetryConfig struct {
	MaxRetries      int           `yaml:"max_retries"`
	InitialDelay    time.Duration `yaml:"initial_delay"`
	MaxDelay        time.Duration `yaml:"max_delay"`
	BackoffFactor   float64       `yaml:"backoff_factor"`
	RetryableErrors []int         `yaml:"retryable_errors"`
}

// DefaultRetryConfig returns default retry configuration
func DefaultRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxRetries:    3,
		InitialDelay:  1 * time.Second,
		MaxDelay:      30 * time.Second,
		BackoffFactor: 2.0,
		RetryableErrors: []int{
			40001, // Invalid credential
			40014, // Invalid access_token
			42001, // Access_token expired
			45009, // API call limit exceeded
			50001, // Internal server error
			50002, // Server busy
			61024, // Third-party platform API call limit exceeded
		},
	}
}

// RetryableError represents an error that can be retried
type RetryableError struct {
	Code    int
	Message string
	Retry   bool
}

// Error implements the error interface
func (e *RetryableError) Error() string {
	return fmt.Sprintf("WeChat API error %d: %s", e.Code, e.Message)
}

// IsRetryable checks if the error is retryable
func (e *RetryableError) IsRetryable() bool {
	return e.Retry
}

// RetryableFunc represents a function that can be retried
type RetryableFunc func(ctx context.Context) error

// Retrier handles retry logic for WeChat API calls
type Retrier struct {
	config *RetryConfig
	logger *zap.Logger
}

// NewRetrier creates a new retrier
func NewRetrier(config *RetryConfig, logger *zap.Logger) *Retrier {
	if config == nil {
		config = DefaultRetryConfig()
	}

	return &Retrier{
		config: config,
		logger: logger,
	}
}

// Execute executes a function with retry logic
func (r *Retrier) Execute(ctx context.Context, operation string, fn RetryableFunc) error {
	var lastErr error

	for attempt := 0; attempt <= r.config.MaxRetries; attempt++ {
		if attempt > 0 {
			// Calculate delay with exponential backoff
			delay := r.calculateDelay(attempt)

			r.logger.Info("Retrying WeChat operation",
				zap.String("operation", operation),
				zap.Int("attempt", attempt),
				zap.Duration("delay", delay))

			// Wait before retry
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(delay):
			}
		}

		// Execute the function
		err := fn(ctx)
		if err == nil {
			if attempt > 0 {
				r.logger.Info("WeChat operation succeeded after retry",
					zap.String("operation", operation),
					zap.Int("attempts", attempt+1))
			}
			return nil
		}

		lastErr = err

		// Check if error is retryable
		if !r.isRetryableError(err) {
			r.logger.Error("WeChat operation failed with non-retryable error",
				zap.String("operation", operation),
				zap.Int("attempt", attempt+1),
				zap.Error(err))
			return err
		}

		r.logger.Warn("WeChat operation failed, will retry",
			zap.String("operation", operation),
			zap.Int("attempt", attempt+1),
			zap.Error(err))
	}

	r.logger.Error("WeChat operation failed after all retries",
		zap.String("operation", operation),
		zap.Int("maxRetries", r.config.MaxRetries),
		zap.Error(lastErr))

	return fmt.Errorf("operation %s failed after %d retries: %w", operation, r.config.MaxRetries, lastErr)
}

// calculateDelay calculates the delay for the given attempt using exponential backoff
func (r *Retrier) calculateDelay(attempt int) time.Duration {
	delay := float64(r.config.InitialDelay) * math.Pow(r.config.BackoffFactor, float64(attempt-1))

	if delay > float64(r.config.MaxDelay) {
		delay = float64(r.config.MaxDelay)
	}

	return time.Duration(delay)
}

// isRetryableError checks if an error is retryable
func (r *Retrier) isRetryableError(err error) bool {
	// Check if it's a RetryableError
	if retryableErr, ok := err.(*RetryableError); ok {
		return retryableErr.IsRetryable()
	}

	// For other errors, we can add more logic here
	// For now, we'll be conservative and not retry unknown errors
	return false
}

// WrapWeChatError wraps a WeChat API error with retry information
func (r *Retrier) WrapWeChatError(errCode int, errMsg string) error {
	isRetryable := r.isErrorCodeRetryable(errCode)

	return &RetryableError{
		Code:    errCode,
		Message: errMsg,
		Retry:   isRetryable,
	}
}

// isErrorCodeRetryable checks if a WeChat error code is retryable
func (r *Retrier) isErrorCodeRetryable(errCode int) bool {
	for _, retryableCode := range r.config.RetryableErrors {
		if errCode == retryableCode {
			return true
		}
	}
	return false
}

// RetryableWeChatClient wraps the WeChat client with retry logic
type RetryableWeChatClient struct {
	client  *WeChatAPIClient
	retrier *Retrier
	logger  *zap.Logger
}

// NewRetryableWeChatClient creates a new retryable WeChat client
func NewRetryableWeChatClient(client *WeChatAPIClient, retryConfig *RetryConfig, logger *zap.Logger) *RetryableWeChatClient {
	retrier := NewRetrier(retryConfig, logger)

	return &RetryableWeChatClient{
		client:  client,
		retrier: retrier,
		logger:  logger,
	}
}

// GetAccessToken gets access token with retry logic
func (c *RetryableWeChatClient) GetAccessToken(ctx context.Context) (string, error) {
	var token string

	err := c.retrier.Execute(ctx, "GetAccessToken", func(ctx context.Context) error {
		var err error
		token, err = c.client.GetAccessToken(ctx)
		return err
	})

	return token, err
}

// CreateDraft creates a draft with retry logic
func (c *RetryableWeChatClient) CreateDraft(ctx context.Context, articles []DraftArticle) (string, error) {
	var mediaID string

	err := c.retrier.Execute(ctx, "CreateDraft", func(ctx context.Context) error {
		var err error
		mediaID, err = c.client.CreateDraft(ctx, articles)
		return err
	})

	return mediaID, err
}

// PublishDraft publishes a draft with retry logic
func (c *RetryableWeChatClient) PublishDraft(ctx context.Context, mediaID string) (string, string, error) {
	var publishID, articleURL string

	err := c.retrier.Execute(ctx, "PublishDraft", func(ctx context.Context) error {
		var err error
		publishID, articleURL, err = c.client.PublishDraft(ctx, mediaID)
		return err
	})

	return publishID, articleURL, err
}

// DeleteDraft deletes a draft with retry logic
func (c *RetryableWeChatClient) DeleteDraft(ctx context.Context, mediaID string) error {
	return c.retrier.Execute(ctx, "DeleteDraft", func(ctx context.Context) error {
		return c.client.DeleteDraft(ctx, mediaID)
	})
}

// UploadMaterial uploads material with retry logic
func (c *RetryableWeChatClient) UploadMaterial(ctx context.Context, filePath string) (*MaterialUploadResponse, error) {
	var response *MaterialUploadResponse

	err := c.retrier.Execute(ctx, "UploadMaterial", func(ctx context.Context) error {
		var err error
		response, err = c.client.UploadMaterial(ctx, filePath)
		return err
	})

	return response, err
}

// SendTextMessage sends a text message with retry logic
func (c *RetryableWeChatClient) SendTextMessage(ctx context.Context, openID, content string) error {
	return c.retrier.Execute(ctx, "SendTextMessage", func(ctx context.Context) error {
		return c.client.SendTextMessage(ctx, openID, content)
	})
}

// SendTemplateMessage sends a template message with retry logic
func (c *RetryableWeChatClient) SendTemplateMessage(ctx context.Context, templateMsg *TemplateMessage) error {
	return c.retrier.Execute(ctx, "SendTemplateMessage", func(ctx context.Context) error {
		return c.client.SendTemplateMessage(ctx, templateMsg)
	})
}

// GetUserList gets user list with retry logic
func (c *RetryableWeChatClient) GetUserList(ctx context.Context, nextOpenID string) (*UserListResponse, error) {
	var response *UserListResponse

	err := c.retrier.Execute(ctx, "GetUserList", func(ctx context.Context) error {
		var err error
		response, err = c.client.GetUserList(ctx, nextOpenID)
		return err
	})

	return response, err
}

// CreateQRCode creates a QR code with retry logic
func (c *RetryableWeChatClient) CreateQRCode(ctx context.Context, sceneStr string, expireSeconds int) (*QRCodeCreateResponse, error) {
	var response *QRCodeCreateResponse

	err := c.retrier.Execute(ctx, "CreateQRCode", func(ctx context.Context) error {
		var err error
		response, err = c.client.CreateQRCode(ctx, sceneStr, expireSeconds)
		return err
	})

	return response, err
}

// CreatePermanentQRCode creates a permanent QR code with retry logic
func (c *RetryableWeChatClient) CreatePermanentQRCode(ctx context.Context, sceneStr string) (*QRCodeCreateResponse, error) {
	var response *QRCodeCreateResponse

	err := c.retrier.Execute(ctx, "CreatePermanentQRCode", func(ctx context.Context) error {
		var err error
		response, err = c.client.CreatePermanentQRCode(ctx, sceneStr)
		return err
	})

	return response, err
}
