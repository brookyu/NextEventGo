package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// SurveyFilter represents filtering options for survey queries
type SurveyFilter struct {
	Search       string
	Status       entities.SurveyStatus
	IsPublic     *bool
	CreatedBy    *uuid.UUID
	StartDate    *time.Time
	EndDate      *time.Time
	Tags         []string
	Category     string
	IsActive     *bool
	HasResponses *bool
	SortBy       string
	SortOrder    string
	Limit        int
	Offset       int
}

// SurveyRepository defines the interface for survey data access
type SurveyRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, survey *entities.Survey) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.Survey, error)
	Update(ctx context.Context, survey *entities.Survey) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	FindAll(ctx context.Context) ([]entities.Survey, error)
	FindWithFilter(ctx context.Context, filter SurveyFilter) ([]entities.Survey, error)
	CountWithFilter(ctx context.Context, filter SurveyFilter) (int64, error)
	FindByCreator(ctx context.Context, creatorID uuid.UUID, limit int) ([]entities.Survey, error)
	FindPublic(ctx context.Context, limit int) ([]entities.Survey, error)
	FindActive(ctx context.Context, limit int) ([]entities.Survey, error)

	// Status operations
	UpdateStatus(ctx context.Context, id uuid.UUID, status entities.SurveyStatus) error
	Publish(ctx context.Context, id uuid.UUID) error
	Close(ctx context.Context, id uuid.UUID) error
	Archive(ctx context.Context, id uuid.UUID) error

	// Analytics operations
	GetSurveyStats(ctx context.Context, id uuid.UUID) (*SurveyStats, error)
	GetPopularSurveys(ctx context.Context, limit int) ([]entities.Survey, error)
	GetRecentSurveys(ctx context.Context, limit int) ([]entities.Survey, error)

	// Bulk operations
	BulkUpdateStatus(ctx context.Context, surveyIDs []uuid.UUID, status entities.SurveyStatus) error
	BulkDelete(ctx context.Context, surveyIDs []uuid.UUID) error
}

// SurveyQuestionFilter represents filtering options for question queries
type SurveyQuestionFilter struct {
	SurveyID     uuid.UUID
	QuestionType entities.QuestionType
	IsRequired   *bool
	Order        *int
	SortBy       string
	SortOrder    string
	Limit        int
	Offset       int
}

// SurveyQuestionRepository defines the interface for survey question data access
type SurveyQuestionRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, question *entities.SurveyQuestion) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyQuestion, error)
	Update(ctx context.Context, question *entities.SurveyQuestion) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error)
	FindWithFilter(ctx context.Context, filter SurveyQuestionFilter) ([]entities.SurveyQuestion, error)
	CountBySurveyID(ctx context.Context, surveyID uuid.UUID) (int64, error)
	FindByType(ctx context.Context, questionType entities.QuestionType, limit int) ([]entities.SurveyQuestion, error)

	// Order operations
	UpdateOrder(ctx context.Context, id uuid.UUID, order int) error
	ReorderQuestions(ctx context.Context, surveyID uuid.UUID, questionOrders map[uuid.UUID]int) error
	GetNextOrder(ctx context.Context, surveyID uuid.UUID) (int, error)

	// Bulk operations
	BulkCreate(ctx context.Context, questions []entities.SurveyQuestion) error
	BulkUpdate(ctx context.Context, questions []entities.SurveyQuestion) error
	BulkDelete(ctx context.Context, questionIDs []uuid.UUID) error
	DeleteBySurveyID(ctx context.Context, surveyID uuid.UUID) error

	// Question type specific operations
	FindRequiredQuestions(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error)
	FindOptionalQuestions(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyQuestion, error)
	GetQuestionTypeStats(ctx context.Context, surveyID uuid.UUID) (map[entities.QuestionType]int, error)
}

// SurveyResponseFilter represents filtering options for response queries
type SurveyResponseFilter struct {
	SurveyID     uuid.UUID
	RespondentID *uuid.UUID
	Status       entities.ResponseStatus
	StartDate    *time.Time
	EndDate      *time.Time
	IsAnonymous  *bool
	IsCompleted  *bool
	MinTimeSpent *int
	MaxTimeSpent *int
	IPAddress    string
	SortBy       string
	SortOrder    string
	Limit        int
	Offset       int
}

// SurveyResponseRepository defines the interface for survey response data access
type SurveyResponseRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, response *entities.SurveyResponse) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyResponse, error)
	Update(ctx context.Context, response *entities.SurveyResponse) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyResponse, error)
	FindWithFilter(ctx context.Context, filter SurveyResponseFilter) ([]entities.SurveyResponse, error)
	CountWithFilter(ctx context.Context, filter SurveyResponseFilter) (int64, error)
	FindByRespondent(ctx context.Context, respondentID uuid.UUID, limit int) ([]entities.SurveyResponse, error)
	FindBySessionID(ctx context.Context, sessionID string) (*entities.SurveyResponse, error)

	// Status operations
	UpdateStatus(ctx context.Context, id uuid.UUID, status entities.ResponseStatus) error
	MarkCompleted(ctx context.Context, id uuid.UUID) error
	MarkSubmitted(ctx context.Context, id uuid.UUID) error
	MarkAbandoned(ctx context.Context, id uuid.UUID) error

	// Analytics operations
	GetResponseStats(ctx context.Context, surveyID uuid.UUID) (*ResponseStats, error)
	GetCompletionRate(ctx context.Context, surveyID uuid.UUID) (float64, error)
	GetAverageTime(ctx context.Context, surveyID uuid.UUID) (float64, error)
	GetDropoffPoints(ctx context.Context, surveyID uuid.UUID) ([]DropoffPoint, error)

	// Bulk operations
	BulkUpdateStatus(ctx context.Context, responseIDs []uuid.UUID, status entities.ResponseStatus) error
	BulkDelete(ctx context.Context, responseIDs []uuid.UUID) error
	DeleteBySurveyID(ctx context.Context, surveyID uuid.UUID) error
}

// SurveyAnswerFilter represents filtering options for answer queries
type SurveyAnswerFilter struct {
	ResponseID   uuid.UUID
	QuestionID   uuid.UUID
	SurveyID     uuid.UUID
	IsSkipped    *bool
	HasValue     *bool
	AnswerType   string // text, number, date, bool, array, json
	SortBy       string
	SortOrder    string
	Limit        int
	Offset       int
}

// SurveyAnswerRepository defines the interface for survey answer data access
type SurveyAnswerRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, answer *entities.SurveyAnswer) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyAnswer, error)
	Update(ctx context.Context, answer *entities.SurveyAnswer) error
	Delete(ctx context.Context, id uuid.UUID) error

	// Query operations
	FindByResponseID(ctx context.Context, responseID uuid.UUID) ([]entities.SurveyAnswer, error)
	FindByQuestionID(ctx context.Context, questionID uuid.UUID) ([]entities.SurveyAnswer, error)
	FindWithFilter(ctx context.Context, filter SurveyAnswerFilter) ([]entities.SurveyAnswer, error)
	CountWithFilter(ctx context.Context, filter SurveyAnswerFilter) (int64, error)

	// Answer type specific operations
	FindTextAnswers(ctx context.Context, questionID uuid.UUID) ([]string, error)
	FindNumericAnswers(ctx context.Context, questionID uuid.UUID) ([]float64, error)
	FindChoiceAnswers(ctx context.Context, questionID uuid.UUID) (map[string]int, error)
	FindRatingAnswers(ctx context.Context, questionID uuid.UUID) ([]float64, error)

	// Analytics operations
	GetAnswerStats(ctx context.Context, questionID uuid.UUID) (*AnswerStats, error)
	GetChoiceDistribution(ctx context.Context, questionID uuid.UUID) (map[string]int, error)
	GetNumericStats(ctx context.Context, questionID uuid.UUID) (*NumericStats, error)
	GetSkipRate(ctx context.Context, questionID uuid.UUID) (float64, error)

	// Bulk operations
	BulkCreate(ctx context.Context, answers []entities.SurveyAnswer) error
	BulkUpdate(ctx context.Context, answers []entities.SurveyAnswer) error
	BulkDelete(ctx context.Context, answerIDs []uuid.UUID) error
	DeleteByResponseID(ctx context.Context, responseID uuid.UUID) error
	DeleteByQuestionID(ctx context.Context, questionID uuid.UUID) error
}

// Analytics data structures

// SurveyStats represents comprehensive survey statistics
type SurveyStats struct {
	SurveyID         uuid.UUID `json:"surveyId"`
	TotalViews       int       `json:"totalViews"`
	TotalStarts      int       `json:"totalStarts"`
	TotalCompletions int       `json:"totalCompletions"`
	TotalSubmissions int       `json:"totalSubmissions"`
	CompletionRate   float64   `json:"completionRate"`
	DropoffRate      float64   `json:"dropoffRate"`
	AverageTime      float64   `json:"averageTime"`
	QuestionCount    int       `json:"questionCount"`
	ResponseCount    int       `json:"responseCount"`
}

// ResponseStats represents response statistics
type ResponseStats struct {
	TotalResponses   int     `json:"totalResponses"`
	CompletedCount   int     `json:"completedCount"`
	SubmittedCount   int     `json:"submittedCount"`
	AbandonedCount   int     `json:"abandonedCount"`
	CompletionRate   float64 `json:"completionRate"`
	AverageTime      float64 `json:"averageTime"`
	MedianTime       float64 `json:"medianTime"`
	FastestTime      float64 `json:"fastestTime"`
	SlowestTime      float64 `json:"slowestTime"`
}

// DropoffPoint represents a point where users commonly abandon the survey
type DropoffPoint struct {
	QuestionID    uuid.UUID `json:"questionId"`
	QuestionText  string    `json:"questionText"`
	QuestionOrder int       `json:"questionOrder"`
	DropoffCount  int       `json:"dropoffCount"`
	DropoffRate   float64   `json:"dropoffRate"`
}

// AnswerStats represents answer statistics for a question
type AnswerStats struct {
	QuestionID    uuid.UUID `json:"questionId"`
	TotalAnswers  int       `json:"totalAnswers"`
	SkippedCount  int       `json:"skippedCount"`
	SkipRate      float64   `json:"skipRate"`
	ResponseRate  float64   `json:"responseRate"`
	UniqueAnswers int       `json:"uniqueAnswers"`
}

// NumericStats represents statistics for numeric answers
type NumericStats struct {
	Count    int     `json:"count"`
	Sum      float64 `json:"sum"`
	Average  float64 `json:"average"`
	Median   float64 `json:"median"`
	Min      float64 `json:"min"`
	Max      float64 `json:"max"`
	StdDev   float64 `json:"stdDev"`
	Variance float64 `json:"variance"`
}

// Extended repository interfaces for advanced features

// SurveyTemplateRepository defines the interface for survey template data access
type SurveyTemplateRepository interface {
	Create(ctx context.Context, template *entities.SurveyTemplate) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyTemplate, error)
	Update(ctx context.Context, template *entities.SurveyTemplate) error
	Delete(ctx context.Context, id uuid.UUID) error
	FindAll(ctx context.Context) ([]entities.SurveyTemplate, error)
	FindByCategory(ctx context.Context, category string) ([]entities.SurveyTemplate, error)
	FindPublic(ctx context.Context, limit int) ([]entities.SurveyTemplate, error)
	FindPopular(ctx context.Context, limit int) ([]entities.SurveyTemplate, error)
	IncrementUsage(ctx context.Context, id uuid.UUID) error
}

// SurveyAnalyticsRepository defines the interface for survey analytics data access
type SurveyAnalyticsRepository interface {
	Create(ctx context.Context, analytics *entities.SurveyAnalytics) error
	FindBySurveyID(ctx context.Context, surveyID uuid.UUID) (*entities.SurveyAnalytics, error)
	Update(ctx context.Context, analytics *entities.SurveyAnalytics) error
	Delete(ctx context.Context, surveyID uuid.UUID) error
	UpdateMetrics(ctx context.Context, surveyID uuid.UUID, metrics map[string]interface{}) error
	GetTrendData(ctx context.Context, surveyID uuid.UUID, days int) ([]TrendPoint, error)
}

// TrendPoint represents a data point in trend analysis
type TrendPoint struct {
	Date       time.Time `json:"date"`
	Views      int       `json:"views"`
	Starts     int       `json:"starts"`
	Completions int      `json:"completions"`
	Submissions int      `json:"submissions"`
}

// SurveyShareRepository defines the interface for survey sharing data access
type SurveyShareRepository interface {
	Create(ctx context.Context, share *entities.SurveyShare) error
	FindByID(ctx context.Context, id uuid.UUID) (*entities.SurveyShare, error)
	Update(ctx context.Context, share *entities.SurveyShare) error
	Delete(ctx context.Context, id uuid.UUID) error
	FindBySurveyID(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyShare, error)
	FindByURL(ctx context.Context, url string) (*entities.SurveyShare, error)
	IncrementAccess(ctx context.Context, id uuid.UUID) error
	FindActive(ctx context.Context, surveyID uuid.UUID) ([]entities.SurveyShare, error)
}
