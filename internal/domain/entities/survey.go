package entities

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// Survey represents a survey in the system
type Survey struct {
	ID                uuid.UUID        `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title             string           `json:"title" gorm:"not null;size:255"`
	Description       string           `json:"description" gorm:"type:text"`
	Instructions      string           `json:"instructions" gorm:"type:text"`
	Status            SurveyStatus     `json:"status" gorm:"not null;default:'draft';index"`
	IsPublic          bool             `json:"isPublic" gorm:"default:false;index"`
	IsAnonymous       bool             `json:"isAnonymous" gorm:"default:true"`
	AllowMultiple     bool             `json:"allowMultiple" gorm:"default:false"`
	RequireLogin      bool             `json:"requireLogin" gorm:"default:false"`
	ShowResults       bool             `json:"showResults" gorm:"default:false"`
	ShowProgress      bool             `json:"showProgress" gorm:"default:true"`
	RandomizeQuestions bool            `json:"randomizeQuestions" gorm:"default:false"`
	MaxResponses      *int             `json:"maxResponses" gorm:"default:null"`
	TimeLimit         *int             `json:"timeLimit" gorm:"default:null"` // in minutes
	StartDate         *time.Time       `json:"startDate"`
	EndDate           *time.Time       `json:"endDate"`
	CreatedBy         uuid.UUID        `json:"createdBy" gorm:"type:uuid;not null;index"`
	CreatedAt         time.Time        `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt         time.Time        `json:"updatedAt" gorm:"autoUpdateTime"`
	PublishedAt       *time.Time       `json:"publishedAt"`
	
	// Relationships
	Questions         []SurveyQuestion `json:"questions,omitempty" gorm:"foreignKey:SurveyID;constraint:OnDelete:CASCADE"`
	Responses         []SurveyResponse `json:"responses,omitempty" gorm:"foreignKey:SurveyID;constraint:OnDelete:CASCADE"`
	
	// Computed fields (not stored in database)
	QuestionCount     int              `json:"questionCount" gorm:"-"`
	ResponseCount     int              `json:"responseCount" gorm:"-"`
	CompletionRate    float64          `json:"completionRate" gorm:"-"`
	AverageTime       float64          `json:"averageTime" gorm:"-"` // in minutes
}

// SurveyStatus represents the status of a survey
type SurveyStatus string

const (
	SurveyStatusDraft     SurveyStatus = "draft"
	SurveyStatusPublished SurveyStatus = "published"
	SurveyStatusClosed    SurveyStatus = "closed"
	SurveyStatusArchived  SurveyStatus = "archived"
)

// TableName returns the table name for Survey
func (Survey) TableName() string {
	return "surveys"
}

// SurveyQuestion represents a question in a survey
type SurveyQuestion struct {
	ID              uuid.UUID           `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID        uuid.UUID           `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey          *Survey             `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	QuestionText    string              `json:"questionText" gorm:"not null;type:text"`
	QuestionType    QuestionType        `json:"questionType" gorm:"not null;index"`
	IsRequired      bool                `json:"isRequired" gorm:"default:false"`
	Order           int                 `json:"order" gorm:"not null;index"`
	Options         pq.StringArray      `json:"options" gorm:"type:text[]"` // For multiple choice, checkboxes, etc.
	Validation      string              `json:"validation" gorm:"type:jsonb"` // JSON validation rules
	Metadata        string              `json:"metadata" gorm:"type:jsonb"` // Additional question metadata
	CreatedAt       time.Time           `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt       time.Time           `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Relationships
	Answers         []SurveyAnswer      `json:"answers,omitempty" gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE"`
	
	// Computed fields
	ResponseCount   int                 `json:"responseCount" gorm:"-"`
	SkipCount       int                 `json:"skipCount" gorm:"-"`
}

// QuestionType represents the type of a survey question
type QuestionType string

const (
	QuestionTypeText         QuestionType = "text"
	QuestionTypeTextarea     QuestionType = "textarea"
	QuestionTypeNumber       QuestionType = "number"
	QuestionTypeEmail        QuestionType = "email"
	QuestionTypePhone        QuestionType = "phone"
	QuestionTypeDate         QuestionType = "date"
	QuestionTypeTime         QuestionType = "time"
	QuestionTypeDateTime     QuestionType = "datetime"
	QuestionTypeRadio        QuestionType = "radio"
	QuestionTypeCheckbox     QuestionType = "checkbox"
	QuestionTypeDropdown     QuestionType = "dropdown"
	QuestionTypeRating       QuestionType = "rating"
	QuestionTypeScale        QuestionType = "scale"
	QuestionTypeYesNo        QuestionType = "yes_no"
	QuestionTypeFile         QuestionType = "file"
	QuestionTypeMatrix       QuestionType = "matrix"
	QuestionTypeRanking      QuestionType = "ranking"
)

// TableName returns the table name for SurveyQuestion
func (SurveyQuestion) TableName() string {
	return "survey_questions"
}

// SurveyResponse represents a response to a survey
type SurveyResponse struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID        uuid.UUID      `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey          *Survey        `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	RespondentID    *uuid.UUID     `json:"respondentId" gorm:"type:uuid;index"` // null for anonymous
	SessionID       string         `json:"sessionId" gorm:"not null;size:255;index"` // for tracking anonymous users
	Status          ResponseStatus `json:"status" gorm:"not null;default:'in_progress';index"`
	StartedAt       time.Time      `json:"startedAt" gorm:"autoCreateTime"`
	CompletedAt     *time.Time     `json:"completedAt"`
	SubmittedAt     *time.Time     `json:"submittedAt"`
	TimeSpent       *int           `json:"timeSpent"` // in seconds
	IPAddress       string         `json:"ipAddress" gorm:"size:45"`
	UserAgent       string         `json:"userAgent" gorm:"type:text"`
	Metadata        string         `json:"metadata" gorm:"type:jsonb"` // Additional response metadata
	
	// Relationships
	Answers         []SurveyAnswer `json:"answers,omitempty" gorm:"foreignKey:ResponseID;constraint:OnDelete:CASCADE"`
	
	// Computed fields
	CompletionRate  float64        `json:"completionRate" gorm:"-"`
	AnswerCount     int            `json:"answerCount" gorm:"-"`
}

// ResponseStatus represents the status of a survey response
type ResponseStatus string

const (
	ResponseStatusInProgress ResponseStatus = "in_progress"
	ResponseStatusCompleted  ResponseStatus = "completed"
	ResponseStatusSubmitted  ResponseStatus = "submitted"
	ResponseStatusAbandoned  ResponseStatus = "abandoned"
)

// TableName returns the table name for SurveyResponse
func (SurveyResponse) TableName() string {
	return "survey_responses"
}

// SurveyAnswer represents an answer to a survey question
type SurveyAnswer struct {
	ID           uuid.UUID       `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ResponseID   uuid.UUID       `json:"responseId" gorm:"type:uuid;not null;index"`
	Response     *SurveyResponse `json:"response,omitempty" gorm:"foreignKey:ResponseID"`
	QuestionID   uuid.UUID       `json:"questionId" gorm:"type:uuid;not null;index"`
	Question     *SurveyQuestion `json:"question,omitempty" gorm:"foreignKey:QuestionID"`
	AnswerText   string          `json:"answerText" gorm:"type:text"`
	AnswerNumber *float64        `json:"answerNumber"`
	AnswerDate   *time.Time      `json:"answerDate"`
	AnswerBool   *bool           `json:"answerBool"`
	AnswerArray  pq.StringArray  `json:"answerArray" gorm:"type:text[]"` // For multiple selections
	AnswerJSON   string          `json:"answerJson" gorm:"type:jsonb"` // For complex answers
	IsSkipped    bool            `json:"isSkipped" gorm:"default:false"`
	CreatedAt    time.Time       `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyAnswer
func (SurveyAnswer) TableName() string {
	return "survey_answers"
}

// SurveyAnalytics represents analytics data for a survey
type SurveyAnalytics struct {
	ID                uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID          uuid.UUID `json:"surveyId" gorm:"type:uuid;not null;uniqueIndex"`
	Survey            *Survey   `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	TotalViews        int       `json:"totalViews" gorm:"default:0"`
	TotalStarts       int       `json:"totalStarts" gorm:"default:0"`
	TotalCompletions  int       `json:"totalCompletions" gorm:"default:0"`
	TotalSubmissions  int       `json:"totalSubmissions" gorm:"default:0"`
	AverageTime       float64   `json:"averageTime" gorm:"default:0"` // in minutes
	CompletionRate    float64   `json:"completionRate" gorm:"default:0"`
	DropoffRate       float64   `json:"dropoffRate" gorm:"default:0"`
	LastCalculated    time.Time `json:"lastCalculated" gorm:"autoUpdateTime"`
	CreatedAt         time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt         time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyAnalytics
func (SurveyAnalytics) TableName() string {
	return "survey_analytics"
}

// SurveyShare represents sharing settings for a survey
type SurveyShare struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	SurveyID     uuid.UUID `json:"surveyId" gorm:"type:uuid;not null;index"`
	Survey       *Survey   `json:"survey,omitempty" gorm:"foreignKey:SurveyID"`
	ShareType    string    `json:"shareType" gorm:"not null;size:50"` // public_link, qr_code, email, wechat
	ShareURL     string    `json:"shareUrl" gorm:"not null;size:500"`
	QRCodeURL    string    `json:"qrCodeUrl" gorm:"size:500"`
	IsActive     bool      `json:"isActive" gorm:"default:true"`
	ExpiresAt    *time.Time `json:"expiresAt"`
	AccessCount  int       `json:"accessCount" gorm:"default:0"`
	CreatedBy    uuid.UUID `json:"createdBy" gorm:"type:uuid;not null"`
	CreatedAt    time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
}

// TableName returns the table name for SurveyShare
func (SurveyShare) TableName() string {
	return "survey_shares"
}

// Validation and utility methods

// IsActive checks if the survey is currently active
func (s *Survey) IsActive() bool {
	now := time.Now()
	
	if s.Status != SurveyStatusPublished {
		return false
	}
	
	if s.StartDate != nil && now.Before(*s.StartDate) {
		return false
	}
	
	if s.EndDate != nil && now.After(*s.EndDate) {
		return false
	}
	
	if s.MaxResponses != nil && s.ResponseCount >= *s.MaxResponses {
		return false
	}
	
	return true
}

// CanAcceptResponses checks if the survey can accept new responses
func (s *Survey) CanAcceptResponses() bool {
	return s.IsActive() && s.Status == SurveyStatusPublished
}

// GetDuration returns the survey duration in minutes
func (s *Survey) GetDuration() *int {
	return s.TimeLimit
}

// IsExpired checks if the survey has expired
func (s *Survey) IsExpired() bool {
	if s.EndDate == nil {
		return false
	}
	return time.Now().After(*s.EndDate)
}

// HasQuestions checks if the survey has any questions
func (s *Survey) HasQuestions() bool {
	return s.QuestionCount > 0 || len(s.Questions) > 0
}

// GetQuestionByOrder returns a question by its order
func (s *Survey) GetQuestionByOrder(order int) *SurveyQuestion {
	for _, question := range s.Questions {
		if question.Order == order {
			return &question
		}
	}
	return nil
}

// Question validation methods

// IsMultipleChoice checks if the question allows multiple selections
func (q *SurveyQuestion) IsMultipleChoice() bool {
	return q.QuestionType == QuestionTypeCheckbox
}

// HasOptions checks if the question has predefined options
func (q *SurveyQuestion) HasOptions() bool {
	optionTypes := map[QuestionType]bool{
		QuestionTypeRadio:    true,
		QuestionTypeCheckbox: true,
		QuestionTypeDropdown: true,
		QuestionTypeRating:   true,
		QuestionTypeScale:    true,
		QuestionTypeYesNo:    true,
		QuestionTypeMatrix:   true,
		QuestionTypeRanking:  true,
	}
	return optionTypes[q.QuestionType]
}

// RequiresNumericAnswer checks if the question expects a numeric answer
func (q *SurveyQuestion) RequiresNumericAnswer() bool {
	numericTypes := map[QuestionType]bool{
		QuestionTypeNumber: true,
		QuestionTypeRating: true,
		QuestionTypeScale:  true,
	}
	return numericTypes[q.QuestionType]
}

// RequiresTextAnswer checks if the question expects a text answer
func (q *SurveyQuestion) RequiresTextAnswer() bool {
	textTypes := map[QuestionType]bool{
		QuestionTypeText:     true,
		QuestionTypeTextarea: true,
		QuestionTypeEmail:    true,
		QuestionTypePhone:    true,
	}
	return textTypes[q.QuestionType]
}

// Response utility methods

// IsCompleted checks if the response is completed
func (r *SurveyResponse) IsCompleted() bool {
	return r.Status == ResponseStatusCompleted || r.Status == ResponseStatusSubmitted
}

// GetDuration returns the response duration in minutes
func (r *SurveyResponse) GetDuration() float64 {
	if r.TimeSpent == nil {
		return 0
	}
	return float64(*r.TimeSpent) / 60.0
}

// IsAnonymous checks if the response is anonymous
func (r *SurveyResponse) IsAnonymous() bool {
	return r.RespondentID == nil
}

// Answer utility methods

// GetValue returns the appropriate value based on question type
func (a *SurveyAnswer) GetValue() interface{} {
	if a.IsSkipped {
		return nil
	}
	
	if a.AnswerText != "" {
		return a.AnswerText
	}
	
	if a.AnswerNumber != nil {
		return *a.AnswerNumber
	}
	
	if a.AnswerDate != nil {
		return *a.AnswerDate
	}
	
	if a.AnswerBool != nil {
		return *a.AnswerBool
	}
	
	if len(a.AnswerArray) > 0 {
		return a.AnswerArray
	}
	
	if a.AnswerJSON != "" {
		return a.AnswerJSON
	}
	
	return nil
}

// HasValue checks if the answer has any value
func (a *SurveyAnswer) HasValue() bool {
	return !a.IsSkipped && a.GetValue() != nil
}
