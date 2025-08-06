package jobs

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

// Job types
const (
	TypeScheduledNewsPublisher = "news:scheduled_publisher"
	TypeNewsExpiration         = "news:expiration_handler"
	TypeWeChatDraftCreation    = "wechat:draft_creation"
	TypeWeChatPublishing       = "wechat:publishing"
	TypeNewsAnalytics          = "news:analytics"
)

// Job queue names
const (
	QueueLow      = "low"
	QueueDefault  = "default"
	QueueHigh     = "high"
	QueueCritical = "critical"
)

// ScheduledNewsPublisherPayload represents the payload for scheduled news publishing
type ScheduledNewsPublisherPayload struct {
	NewsID      uuid.UUID `json:"newsId"`
	ScheduledAt time.Time `json:"scheduledAt"`
	RetryCount  int       `json:"retryCount"`
}

// NewsExpirationPayload represents the payload for news expiration handling
type NewsExpirationPayload struct {
	NewsID    uuid.UUID `json:"newsId"`
	ExpiresAt time.Time `json:"expiresAt"`
}

// WeChatDraftCreationPayload represents the payload for WeChat draft creation
type WeChatDraftCreationPayload struct {
	NewsID     uuid.UUID `json:"newsId"`
	RetryCount int       `json:"retryCount"`
}

// WeChatPublishingPayload represents the payload for WeChat publishing
type WeChatPublishingPayload struct {
	NewsID     uuid.UUID `json:"newsId"`
	DraftID    string    `json:"draftId"`
	RetryCount int       `json:"retryCount"`
}

// NewsAnalyticsPayload represents the payload for news analytics processing
type NewsAnalyticsPayload struct {
	NewsID    uuid.UUID              `json:"newsId"`
	EventType string                 `json:"eventType"` // "view", "share", "like", etc.
	UserID    *uuid.UUID             `json:"userId,omitempty"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// JobScheduler interface for scheduling jobs
type JobScheduler interface {
	// Schedule a job to run at a specific time
	ScheduleAt(ctx context.Context, task *asynq.Task, processAt time.Time, opts ...asynq.Option) error

	// Schedule a job to run after a delay
	ScheduleIn(ctx context.Context, task *asynq.Task, delay time.Duration, opts ...asynq.Option) error

	// Enqueue a job to run immediately
	Enqueue(ctx context.Context, task *asynq.Task, opts ...asynq.Option) error

	// Cancel a scheduled job
	Cancel(ctx context.Context, taskID string) error
}

// JobHandler interface for handling jobs
type JobHandler interface {
	HandleScheduledNewsPublisher(ctx context.Context, task *asynq.Task) error
	HandleNewsExpiration(ctx context.Context, task *asynq.Task) error
	HandleWeChatDraftCreation(ctx context.Context, task *asynq.Task) error
	HandleWeChatPublishing(ctx context.Context, task *asynq.Task) error
	HandleNewsAnalytics(ctx context.Context, task *asynq.Task) error
}

// Helper functions for creating tasks

// NewScheduledNewsPublisherTask creates a new scheduled news publisher task
func NewScheduledNewsPublisherTask(newsID uuid.UUID, scheduledAt time.Time) (*asynq.Task, error) {
	payload := ScheduledNewsPublisherPayload{
		NewsID:      newsID,
		ScheduledAt: scheduledAt,
		RetryCount:  0,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeScheduledNewsPublisher, data), nil
}

// NewNewsExpirationTask creates a new news expiration task
func NewNewsExpirationTask(newsID uuid.UUID, expiresAt time.Time) (*asynq.Task, error) {
	payload := NewsExpirationPayload{
		NewsID:    newsID,
		ExpiresAt: expiresAt,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeNewsExpiration, data), nil
}

// NewWeChatDraftCreationTask creates a new WeChat draft creation task
func NewWeChatDraftCreationTask(newsID uuid.UUID) (*asynq.Task, error) {
	payload := WeChatDraftCreationPayload{
		NewsID:     newsID,
		RetryCount: 0,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeWeChatDraftCreation, data), nil
}

// NewWeChatPublishingTask creates a new WeChat publishing task
func NewWeChatPublishingTask(newsID uuid.UUID, draftID string) (*asynq.Task, error) {
	payload := WeChatPublishingPayload{
		NewsID:     newsID,
		DraftID:    draftID,
		RetryCount: 0,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeWeChatPublishing, data), nil
}

// NewNewsAnalyticsTask creates a new news analytics task
func NewNewsAnalyticsTask(newsID uuid.UUID, eventType string, userID *uuid.UUID, metadata map[string]interface{}) (*asynq.Task, error) {
	payload := NewsAnalyticsPayload{
		NewsID:    newsID,
		EventType: eventType,
		UserID:    userID,
		Metadata:  metadata,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	return asynq.NewTask(TypeNewsAnalytics, data), nil
}
