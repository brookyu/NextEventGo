package dto

import (
	"time"

	"github.com/google/uuid"
)

// Survey DTOs compatible with existing .NET database schema

// SurveyResponse represents a survey response DTO
type SurveyResponse struct {
	ID             uuid.UUID  `json:"id"`
	SurveyTitle    string     `json:"surveyTitle"`
	SurveyTitleEn  *string    `json:"surveyTitleEn,omitempty"`
	SurveySummary  *string    `json:"surveySummary,omitempty"`
	FormType       int        `json:"formType"` // 0=Survey, 1=Form, 2=Quiz
	IsOpen         bool       `json:"isOpen"`
	CategoryId     uuid.UUID  `json:"categoryId"`
	PromotionCode  *string    `json:"promotionCode,omitempty"`
	PromotionPicId *uuid.UUID `json:"promotionPicId,omitempty"`
	IsLuckEnabled  bool       `json:"isLuckEnabled"`

	// Audit fields (ABP framework compatible)
	CreationTime         time.Time  `json:"creationTime"`
	CreatorId            *uuid.UUID `json:"creatorId,omitempty"`
	LastModificationTime *time.Time `json:"lastModificationTime,omitempty"`
	LastModifierId       *uuid.UUID `json:"lastModifierId,omitempty"`
	IsDeleted            bool       `json:"isDeleted"`
	DeleterId            *uuid.UUID `json:"deleterId,omitempty"`
	DeletionTime         *time.Time `json:"deletionTime,omitempty"`

	// Computed fields
	QuestionCount  int     `json:"questionCount"`
	ResponseCount  int     `json:"responseCount"`
	CompletionRate float64 `json:"completionRate"`
}

// CreateSurveyRequest represents a request to create a survey
type CreateSurveyRequest struct {
	SurveyTitle   string    `json:"surveyTitle" binding:"required"`
	SurveyTitleEn *string   `json:"surveyTitleEn,omitempty"`
	SurveySummary *string   `json:"surveySummary,omitempty"`
	FormType      int       `json:"formType"` // 0=Survey, 1=Form, 2=Quiz
	IsOpen        bool      `json:"isOpen"`
	CategoryId    uuid.UUID `json:"categoryId"`
	PromotionCode *string   `json:"promotionCode,omitempty"`
	IsLuckEnabled bool      `json:"isLuckEnabled"`
	CreatorId     uuid.UUID `json:"creatorId"`
}

// UpdateSurveyRequest represents a request to update a survey
type UpdateSurveyRequest struct {
	SurveyTitle    *string    `json:"surveyTitle,omitempty"`
	SurveyTitleEn  *string    `json:"surveyTitleEn,omitempty"`
	SurveySummary  *string    `json:"surveySummary,omitempty"`
	FormType       *int       `json:"formType,omitempty"`
	IsOpen         *bool      `json:"isOpen,omitempty"`
	CategoryId     *uuid.UUID `json:"categoryId,omitempty"`
	PromotionCode  *string    `json:"promotionCode,omitempty"`
	IsLuckEnabled  *bool      `json:"isLuckEnabled,omitempty"`
	LastModifierId uuid.UUID  `json:"lastModifierId"`
}

// QuestionResponse represents a question response DTO
type QuestionResponse struct {
	ID                 uuid.UUID `json:"id"`
	SurveyId           uuid.UUID `json:"surveyId"`
	QuestionTitle      string    `json:"questionTitle"`
	QuestionTitleEn    *string   `json:"questionTitleEn,omitempty"`
	QuestionType       int       `json:"questionType"`        // 0=Text, 1=SingleChoice, 2=MultipleChoice, 3=Rating
	Choices            *string   `json:"choices,omitempty"`   // Format: ||Choice1||Choice2||Choice3
	ChoicesEn          *string   `json:"choicesEn,omitempty"` // Format: ||Choice1||Choice2||Choice3
	OrderNumber        int       `json:"orderNumber"`
	IsProjected        bool      `json:"isProjected"`       // For live presentation
	Answers            *string   `json:"answers,omitempty"` // Pre-filled answers
	IsChoiceCountFixed *bool     `json:"isChoiceCountFixed,omitempty"`
	ChoiceCount        *int      `json:"choiceCount,omitempty"`

	// Audit fields
	CreationTime         time.Time  `json:"creationTime"`
	CreatorId            *uuid.UUID `json:"creatorId,omitempty"`
	LastModificationTime *time.Time `json:"lastModificationTime,omitempty"`
	LastModifierId       *uuid.UUID `json:"lastModifierId,omitempty"`
	IsDeleted            bool       `json:"isDeleted"`
	DeleterId            *uuid.UUID `json:"deleterId,omitempty"`
	DeletionTime         *time.Time `json:"deletionTime,omitempty"`

	// Computed fields
	ResponseCount int `json:"responseCount"`
	SkipCount     int `json:"skipCount"`
}

// CreateQuestionRequest represents a request to create a question
type CreateQuestionRequest struct {
	SurveyId           uuid.UUID `json:"surveyId,omitempty"` // Set from URL parameter
	QuestionTitle      string    `json:"questionTitle" binding:"required"`
	QuestionTitleEn    *string   `json:"questionTitleEn,omitempty"`
	QuestionType       int       `json:"questionType" binding:"required"`
	Choices            *string   `json:"choices,omitempty"`
	ChoicesEn          *string   `json:"choicesEn,omitempty"`
	OrderNumber        int       `json:"orderNumber"`
	IsProjected        bool      `json:"isProjected"`
	Answers            *string   `json:"answers,omitempty"`
	IsChoiceCountFixed *bool     `json:"isChoiceCountFixed,omitempty"`
	ChoiceCount        *int      `json:"choiceCount,omitempty"`
	CreatorId          uuid.UUID `json:"creatorId"`
}

// UpdateQuestionRequest represents a request to update a question
type UpdateQuestionRequest struct {
	QuestionTitle      *string   `json:"questionTitle,omitempty"`
	QuestionTitleEn    *string   `json:"questionTitleEn,omitempty"`
	QuestionType       *int      `json:"questionType,omitempty"`
	Choices            *string   `json:"choices,omitempty"`
	ChoicesEn          *string   `json:"choicesEn,omitempty"`
	OrderNumber        *int      `json:"orderNumber,omitempty"`
	IsProjected        *bool     `json:"isProjected,omitempty"`
	Answers            *string   `json:"answers,omitempty"`
	IsChoiceCountFixed *bool     `json:"isChoiceCountFixed,omitempty"`
	ChoiceCount        *int      `json:"choiceCount,omitempty"`
	LastModifierId     uuid.UUID `json:"lastModifierId"`
}

// SurveyWithQuestionsResponse represents a survey with its questions
type SurveyWithQuestionsResponse struct {
	Survey    SurveyResponse     `json:"survey"`
	Questions []QuestionResponse `json:"questions"`
}

// AnswerResponse represents an answer response DTO
type AnswerResponse struct {
	ID            uuid.UUID `json:"id"`
	UserId        *string   `json:"userId,omitempty"` // Can be null for anonymous
	SurveyId      uuid.UUID `json:"surveyId"`
	AnswerString  *string   `json:"answerString,omitempty"` // JSON format
	DateCompleted time.Time `json:"dateCompleted"`
	IsComplete    bool      `json:"isComplete"`
	EventId       uuid.UUID `json:"eventId"`
	PromoterName  *string   `json:"promoterName,omitempty"`

	// Audit fields
	CreationTime         time.Time  `json:"creationTime"`
	CreatorId            *uuid.UUID `json:"creatorId,omitempty"`
	LastModificationTime *time.Time `json:"lastModificationTime,omitempty"`
	LastModifierId       *uuid.UUID `json:"lastModifierId,omitempty"`
	IsDeleted            bool       `json:"isDeleted"`
	DeleterId            *uuid.UUID `json:"deleterId,omitempty"`
	DeletionTime         *time.Time `json:"deletionTime,omitempty"`
}

// SingleAnswerResponse represents a single answer response DTO
type SingleAnswerResponse struct {
	ID          uuid.UUID `json:"id"`
	QuestionId  uuid.UUID `json:"questionId"`
	Answer      *string   `json:"answer,omitempty"`
	CreatedDate time.Time `json:"createdDate"`
	OpenId      *string   `json:"openId,omitempty"` // WeChat OpenID
	IsCorrect   bool      `json:"isCorrect"`

	// Audit fields
	CreationTime         time.Time  `json:"creationTime"`
	CreatorId            *uuid.UUID `json:"creatorId,omitempty"`
	LastModificationTime *time.Time `json:"lastModificationTime,omitempty"`
	LastModifierId       *uuid.UUID `json:"lastModifierId,omitempty"`
	IsDeleted            bool       `json:"isDeleted"`
	DeleterId            *uuid.UUID `json:"deleterId,omitempty"`
	DeletionTime         *time.Time `json:"deletionTime,omitempty"`
}

// Advanced Survey Management DTOs

// GetSurveyListRequest represents a request to get survey list with pagination
type GetSurveyListRequest struct {
	Page       int     `form:"page" binding:"min=1"`
	Limit      int     `form:"limit" binding:"min=1,max=100"`
	Search     *string `form:"search,omitempty"`
	CategoryId *string `form:"categoryId,omitempty"`
	FormType   *int    `form:"formType,omitempty"`
	IsOpen     *bool   `form:"isOpen,omitempty"`
	SortBy     *string `form:"sortBy,omitempty"`
	SortOrder  *string `form:"sortOrder,omitempty"`
}

// SurveyListResponse represents paginated survey list response
type SurveyListResponse struct {
	Data       []SurveyResponse `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"totalPages"`
}

// LiveSurveyResultsRequest represents a request for live survey results
type LiveSurveyResultsRequest struct {
	SurveyId        uuid.UUID  `json:"surveyId" binding:"required"`
	EventId         *uuid.UUID `json:"eventId,omitempty"`
	IsFromPresenter bool       `json:"isFromPresenter"`
	Language        *string    `json:"language,omitempty"` // "zh" or "en"
}

// LiveSurveyResultsResponse represents live survey results
type LiveSurveyResultsResponse struct {
	SurveyId      uuid.UUID               `json:"surveyId"`
	SurveyTitle   string                  `json:"surveyTitle"`
	CompleteCount int                     `json:"completeCount"`
	TotalViews    int                     `json:"totalViews"`
	Questions     []LiveQuestionResult    `json:"questions"`
	ChartData     []SurveyAnswerChartData `json:"chartData"`
	UpdatedAt     time.Time               `json:"updatedAt"`
}

// LiveQuestionResult represents live results for a single question
type LiveQuestionResult struct {
	QuestionId    uuid.UUID              `json:"questionId"`
	QuestionTitle string                 `json:"questionTitle"`
	QuestionType  int                    `json:"questionType"`
	AnswerCounts  map[string]int         `json:"answerCounts"`
	TotalAnswers  int                    `json:"totalAnswers"`
	ChartData     *SurveyAnswerChartData `json:"chartData,omitempty"`
}

// SurveyAnswerChartData represents chart data for survey analytics
type SurveyAnswerChartData struct {
	QuestionId    uuid.UUID `json:"questionId"`
	QuestionTitle string    `json:"questionTitle"`
	ChartType     string    `json:"chartType"` // "pie", "bar", "line"
	Language      string    `json:"language"`  // "zh" or "en"
	Labels        []string  `json:"labels"`
	Data          []int     `json:"data"`
	Colors        []string  `json:"colors,omitempty"`
	Total         int       `json:"total"`
	Percentage    []float64 `json:"percentage"`
}

// SurveyQRCodeRequest represents a request to generate QR code for survey
type SurveyQRCodeRequest struct {
	SurveyId uuid.UUID  `json:"surveyId" binding:"required"`
	EventId  *uuid.UUID `json:"eventId,omitempty"`
	Type     string     `json:"type"`           // "survey" or "form"
	Size     *int       `json:"size,omitempty"` // QR code size in pixels
}

// SurveyQRCodeResponse represents QR code generation response for survey
type SurveyQRCodeResponse struct {
	QRCodeURL string     `json:"qrCodeUrl"`
	SurveyURL string     `json:"surveyUrl"`
	ExpiresAt *time.Time `json:"expiresAt,omitempty"`
}

// SurveyAnalyticsRequest represents a request for survey analytics
type SurveyAnalyticsRequest struct {
	SurveyId  uuid.UUID  `json:"surveyId" binding:"required"`
	StartDate *time.Time `json:"startDate,omitempty"`
	EndDate   *time.Time `json:"endDate,omitempty"`
	GroupBy   *string    `json:"groupBy,omitempty"` // "day", "week", "month"
}

// SurveyAnalyticsResponse represents survey analytics response
type SurveyAnalyticsResponse struct {
	SurveyId         uuid.UUID             `json:"surveyId"`
	TotalViews       int                   `json:"totalViews"`
	TotalStarts      int                   `json:"totalStarts"`
	TotalCompletions int                   `json:"totalCompletions"`
	CompletionRate   float64               `json:"completionRate"`
	AverageTime      float64               `json:"averageTime"` // in minutes
	DropoffRate      float64               `json:"dropoffRate"`
	Questions        []QuestionAnalytics   `json:"questions"`
	TrendData        []AnalyticsTrendPoint `json:"trendData,omitempty"`
	Demographics     *DemographicsData     `json:"demographics,omitempty"`
}

// QuestionAnalytics represents analytics for a single question
type QuestionAnalytics struct {
	QuestionId    uuid.UUID      `json:"questionId"`
	QuestionTitle string         `json:"questionTitle"`
	QuestionType  int            `json:"questionType"`
	TotalAnswers  int            `json:"totalAnswers"`
	SkipCount     int            `json:"skipCount"`
	AnswerCounts  map[string]int `json:"answerCounts"`
	AverageRating *float64       `json:"averageRating,omitempty"`
	TextAnswers   []string       `json:"textAnswers,omitempty"`
}

// AnalyticsTrendPoint represents a point in trend analytics
type AnalyticsTrendPoint struct {
	Date        time.Time `json:"date"`
	Views       int       `json:"views"`
	Starts      int       `json:"starts"`
	Completions int       `json:"completions"`
}

// DemographicsData represents demographic analytics
type DemographicsData struct {
	DeviceTypes map[string]int `json:"deviceTypes"`
	Browsers    map[string]int `json:"browsers"`
	Countries   map[string]int `json:"countries"`
	Referrers   map[string]int `json:"referrers"`
}

// Question Management DTOs

// QuestionOrderItem represents a question order update item
type QuestionOrderItem struct {
	QuestionId  uuid.UUID `json:"questionId" binding:"required"`
	OrderNumber int       `json:"orderNumber" binding:"required"`
}

// UpdateQuestionOrderRequest represents a request to update question order
type UpdateQuestionOrderRequest struct {
	SurveyId       uuid.UUID           `json:"surveyId" binding:"required"`
	QuestionOrders []QuestionOrderItem `json:"questionOrders" binding:"required"`
	LastModifierId uuid.UUID           `json:"lastModifierId" binding:"required"`
}

// CreateAnswerRequest represents a request to create an answer
type CreateAnswerRequest struct {
	SurveyId     uuid.UUID `json:"surveyId" binding:"required"`
	UserId       *string   `json:"userId,omitempty"`
	AnswerString *string   `json:"answerString,omitempty"`
	EventId      uuid.UUID `json:"eventId" binding:"required"`
	PromoterName *string   `json:"promoterName,omitempty"`
	CreatorId    uuid.UUID `json:"creatorId"`
}

// CreateSingleAnswerRequest represents a request to create a single answer
type CreateSingleAnswerRequest struct {
	QuestionId uuid.UUID `json:"questionId" binding:"required"`
	Answer     *string   `json:"answer,omitempty"`
	OpenId     *string   `json:"openId,omitempty"`
	IsCorrect  bool      `json:"isCorrect"`
	CreatorId  uuid.UUID `json:"creatorId"`
}

// QuestionTypeInfo represents information about question types
type QuestionTypeInfo struct {
	Type        int    `json:"type"`
	Name        string `json:"name"`
	NameEn      string `json:"nameEn"`
	Description string `json:"description"`
	HasOptions  bool   `json:"hasOptions"`
	IsNumeric   bool   `json:"isNumeric"`
}

// GetQuestionTypesResponse represents available question types
type GetQuestionTypesResponse struct {
	Types []QuestionTypeInfo `json:"types"`
}

// SurveyStatisticsResponse represents survey statistics
type SurveyStatisticsResponse struct {
	SurveyId         uuid.UUID `json:"surveyId"`
	TotalViews       int       `json:"totalViews"`
	TotalStarts      int       `json:"totalStarts"`
	TotalCompletions int       `json:"totalCompletions"`
	CompletionRate   float64   `json:"completionRate"`
	AverageTime      float64   `json:"averageTime"`
	LastUpdated      time.Time `json:"lastUpdated"`
}
