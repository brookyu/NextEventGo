package entities

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Validation errors
var (
	ErrSurveyTitleRequired     = errors.New("survey title is required")
	ErrSurveyTitleTooLong      = errors.New("survey title is too long")
	ErrInvalidSurveyStatus     = errors.New("invalid survey status")
	ErrInvalidTimeLimit        = errors.New("time limit must be positive")
	ErrInvalidMaxResponses     = errors.New("max responses must be positive")
	ErrInvalidDateRange        = errors.New("end date must be after start date")
	ErrQuestionTextRequired    = errors.New("question text is required")
	ErrInvalidQuestionType     = errors.New("invalid question type")
	ErrInvalidQuestionOrder    = errors.New("question order must be positive")
	ErrOptionsRequired         = errors.New("options are required for this question type")
	ErrInvalidEmail            = errors.New("invalid email address")
	ErrInvalidPhoneNumber      = errors.New("invalid phone number")
	ErrAnswerRequired          = errors.New("answer is required for this question")
	ErrInvalidAnswerType       = errors.New("invalid answer type for this question")
	ErrInvalidRatingValue      = errors.New("rating value is out of range")
	ErrInvalidScaleValue       = errors.New("scale value is out of range")
)

// ValidationRule represents a validation rule for survey questions
type ValidationRule struct {
	Type      string      `json:"type"`
	Value     interface{} `json:"value"`
	Message   string      `json:"message"`
	Required  bool        `json:"required"`
}

// QuestionValidation represents validation rules for a question
type QuestionValidation struct {
	Required    bool             `json:"required"`
	MinLength   *int             `json:"minLength,omitempty"`
	MaxLength   *int             `json:"maxLength,omitempty"`
	MinValue    *float64         `json:"minValue,omitempty"`
	MaxValue    *float64         `json:"maxValue,omitempty"`
	Pattern     string           `json:"pattern,omitempty"`
	CustomRules []ValidationRule `json:"customRules,omitempty"`
}

// Survey validation methods

// Validate validates the survey entity
func (s *Survey) Validate() error {
	if strings.TrimSpace(s.Title) == "" {
		return ErrSurveyTitleRequired
	}
	
	if len(s.Title) > 255 {
		return ErrSurveyTitleTooLong
	}
	
	if !s.IsValidStatus() {
		return ErrInvalidSurveyStatus
	}
	
	if s.TimeLimit != nil && *s.TimeLimit <= 0 {
		return ErrInvalidTimeLimit
	}
	
	if s.MaxResponses != nil && *s.MaxResponses <= 0 {
		return ErrInvalidMaxResponses
	}
	
	if s.StartDate != nil && s.EndDate != nil && s.EndDate.Before(*s.StartDate) {
		return ErrInvalidDateRange
	}
	
	return nil
}

// IsValidStatus checks if the survey status is valid
func (s *Survey) IsValidStatus() bool {
	validStatuses := map[SurveyStatus]bool{
		SurveyStatusDraft:     true,
		SurveyStatusPublished: true,
		SurveyStatusClosed:    true,
		SurveyStatusArchived:  true,
	}
	return validStatuses[s.Status]
}

// CanBePublished checks if the survey can be published
func (s *Survey) CanBePublished() bool {
	return s.Status == SurveyStatusDraft && s.HasQuestions()
}

// CanBeEdited checks if the survey can be edited
func (s *Survey) CanBeEdited() bool {
	return s.Status == SurveyStatusDraft
}

// CanBeClosed checks if the survey can be closed
func (s *Survey) CanBeClosed() bool {
	return s.Status == SurveyStatusPublished
}

// Question validation methods

// Validate validates the survey question entity
func (q *SurveyQuestion) Validate() error {
	if strings.TrimSpace(q.QuestionText) == "" {
		return ErrQuestionTextRequired
	}
	
	if !q.IsValidType() {
		return ErrInvalidQuestionType
	}
	
	if q.Order <= 0 {
		return ErrInvalidQuestionOrder
	}
	
	if q.HasOptions() && len(q.Options) == 0 {
		return ErrOptionsRequired
	}
	
	// Validate question-specific rules
	if err := q.ValidateTypeSpecific(); err != nil {
		return err
	}
	
	return nil
}

// IsValidType checks if the question type is valid
func (q *SurveyQuestion) IsValidType() bool {
	validTypes := map[QuestionType]bool{
		QuestionTypeText:     true,
		QuestionTypeTextarea: true,
		QuestionTypeNumber:   true,
		QuestionTypeEmail:    true,
		QuestionTypePhone:    true,
		QuestionTypeDate:     true,
		QuestionTypeTime:     true,
		QuestionTypeDateTime: true,
		QuestionTypeRadio:    true,
		QuestionTypeCheckbox: true,
		QuestionTypeDropdown: true,
		QuestionTypeRating:   true,
		QuestionTypeScale:    true,
		QuestionTypeYesNo:    true,
		QuestionTypeFile:     true,
		QuestionTypeMatrix:   true,
		QuestionTypeRanking:  true,
	}
	return validTypes[q.QuestionType]
}

// ValidateTypeSpecific validates question type specific rules
func (q *SurveyQuestion) ValidateTypeSpecific() error {
	switch q.QuestionType {
	case QuestionTypeRating, QuestionTypeScale:
		if len(q.Options) < 2 {
			return errors.New("rating/scale questions must have at least 2 options")
		}
	case QuestionTypeMatrix:
		if len(q.Options) == 0 {
			return errors.New("matrix questions must have options defined")
		}
	case QuestionTypeRanking:
		if len(q.Options) < 2 {
			return errors.New("ranking questions must have at least 2 options")
		}
	}
	return nil
}

// GetValidation parses and returns the validation rules
func (q *SurveyQuestion) GetValidation() (*QuestionValidation, error) {
	if q.Validation == "" {
		return &QuestionValidation{Required: q.IsRequired}, nil
	}
	
	var validation QuestionValidation
	if err := json.Unmarshal([]byte(q.Validation), &validation); err != nil {
		return nil, fmt.Errorf("invalid validation JSON: %w", err)
	}
	
	// Ensure required field matches
	validation.Required = q.IsRequired
	
	return &validation, nil
}

// SetValidation sets the validation rules
func (q *SurveyQuestion) SetValidation(validation *QuestionValidation) error {
	if validation == nil {
		q.Validation = ""
		return nil
	}
	
	// Ensure required field matches
	validation.Required = q.IsRequired
	
	data, err := json.Marshal(validation)
	if err != nil {
		return fmt.Errorf("failed to marshal validation: %w", err)
	}
	
	q.Validation = string(data)
	return nil
}

// Answer validation methods

// Validate validates the survey answer
func (a *SurveyAnswer) Validate(question *SurveyQuestion) error {
	if a.IsSkipped {
		return nil // Skipped answers don't need validation
	}
	
	if question == nil {
		return errors.New("question is required for answer validation")
	}
	
	// Check if answer is required
	if question.IsRequired && !a.HasValue() {
		return ErrAnswerRequired
	}
	
	// Validate based on question type
	return a.ValidateByType(question)
}

// ValidateByType validates the answer based on question type
func (a *SurveyAnswer) ValidateByType(question *SurveyQuestion) error {
	switch question.QuestionType {
	case QuestionTypeEmail:
		return a.validateEmail()
	case QuestionTypePhone:
		return a.validatePhone()
	case QuestionTypeNumber:
		return a.validateNumber(question)
	case QuestionTypeRating:
		return a.validateRating(question)
	case QuestionTypeScale:
		return a.validateScale(question)
	case QuestionTypeRadio, QuestionTypeDropdown:
		return a.validateSingleChoice(question)
	case QuestionTypeCheckbox:
		return a.validateMultipleChoice(question)
	case QuestionTypeDate:
		return a.validateDate()
	case QuestionTypeTime:
		return a.validateTime()
	case QuestionTypeDateTime:
		return a.validateDateTime()
	default:
		return a.validateText(question)
	}
}

// validateEmail validates email format
func (a *SurveyAnswer) validateEmail() error {
	if a.AnswerText == "" {
		return nil
	}
	
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(a.AnswerText) {
		return ErrInvalidEmail
	}
	
	return nil
}

// validatePhone validates phone number format
func (a *SurveyAnswer) validatePhone() error {
	if a.AnswerText == "" {
		return nil
	}
	
	// Simple phone validation - can be enhanced
	phoneRegex := regexp.MustCompile(`^[\+]?[1-9][\d]{0,15}$`)
	cleanPhone := regexp.MustCompile(`[^\d\+]`).ReplaceAllString(a.AnswerText, "")
	
	if !phoneRegex.MatchString(cleanPhone) {
		return ErrInvalidPhoneNumber
	}
	
	return nil
}

// validateNumber validates numeric answers
func (a *SurveyAnswer) validateNumber(question *SurveyQuestion) error {
	if a.AnswerNumber == nil && a.AnswerText == "" {
		return nil
	}
	
	var value float64
	var err error
	
	if a.AnswerNumber != nil {
		value = *a.AnswerNumber
	} else {
		value, err = strconv.ParseFloat(a.AnswerText, 64)
		if err != nil {
			return errors.New("invalid number format")
		}
	}
	
	// Validate against question validation rules
	validation, err := question.GetValidation()
	if err != nil {
		return err
	}
	
	if validation.MinValue != nil && value < *validation.MinValue {
		return fmt.Errorf("value must be at least %v", *validation.MinValue)
	}
	
	if validation.MaxValue != nil && value > *validation.MaxValue {
		return fmt.Errorf("value must be at most %v", *validation.MaxValue)
	}
	
	return nil
}

// validateRating validates rating answers
func (a *SurveyAnswer) validateRating(question *SurveyQuestion) error {
	if a.AnswerNumber == nil {
		return nil
	}
	
	value := *a.AnswerNumber
	
	// Default rating range is 1-5
	minRating := 1.0
	maxRating := 5.0
	
	// Check if custom range is defined in options
	if len(question.Options) >= 2 {
		if min, err := strconv.ParseFloat(question.Options[0], 64); err == nil {
			minRating = min
		}
		if max, err := strconv.ParseFloat(question.Options[1], 64); err == nil {
			maxRating = max
		}
	}
	
	if value < minRating || value > maxRating {
		return ErrInvalidRatingValue
	}
	
	return nil
}

// validateScale validates scale answers
func (a *SurveyAnswer) validateScale(question *SurveyQuestion) error {
	return a.validateRating(question) // Same validation as rating
}

// validateSingleChoice validates single choice answers
func (a *SurveyAnswer) validateSingleChoice(question *SurveyQuestion) error {
	if a.AnswerText == "" {
		return nil
	}
	
	// Check if answer is in the list of valid options
	for _, option := range question.Options {
		if a.AnswerText == option {
			return nil
		}
	}
	
	return errors.New("invalid option selected")
}

// validateMultipleChoice validates multiple choice answers
func (a *SurveyAnswer) validateMultipleChoice(question *SurveyQuestion) error {
	if len(a.AnswerArray) == 0 {
		return nil
	}
	
	// Check if all selected answers are in the list of valid options
	validOptions := make(map[string]bool)
	for _, option := range question.Options {
		validOptions[option] = true
	}
	
	for _, selected := range a.AnswerArray {
		if !validOptions[selected] {
			return fmt.Errorf("invalid option selected: %s", selected)
		}
	}
	
	return nil
}

// validateDate validates date answers
func (a *SurveyAnswer) validateDate() error {
	if a.AnswerDate == nil && a.AnswerText == "" {
		return nil
	}
	
	if a.AnswerText != "" {
		_, err := time.Parse("2006-01-02", a.AnswerText)
		if err != nil {
			return errors.New("invalid date format, expected YYYY-MM-DD")
		}
	}
	
	return nil
}

// validateTime validates time answers
func (a *SurveyAnswer) validateTime() error {
	if a.AnswerText == "" {
		return nil
	}
	
	_, err := time.Parse("15:04", a.AnswerText)
	if err != nil {
		return errors.New("invalid time format, expected HH:MM")
	}
	
	return nil
}

// validateDateTime validates datetime answers
func (a *SurveyAnswer) validateDateTime() error {
	if a.AnswerDate == nil && a.AnswerText == "" {
		return nil
	}
	
	if a.AnswerText != "" {
		_, err := time.Parse("2006-01-02T15:04:05Z07:00", a.AnswerText)
		if err != nil {
			return errors.New("invalid datetime format, expected ISO 8601")
		}
	}
	
	return nil
}

// validateText validates text answers
func (a *SurveyAnswer) validateText(question *SurveyQuestion) error {
	if a.AnswerText == "" {
		return nil
	}
	
	validation, err := question.GetValidation()
	if err != nil {
		return err
	}
	
	text := a.AnswerText
	
	// Check length constraints
	if validation.MinLength != nil && len(text) < *validation.MinLength {
		return fmt.Errorf("text must be at least %d characters", *validation.MinLength)
	}
	
	if validation.MaxLength != nil && len(text) > *validation.MaxLength {
		return fmt.Errorf("text must be at most %d characters", *validation.MaxLength)
	}
	
	// Check pattern constraint
	if validation.Pattern != "" {
		matched, err := regexp.MatchString(validation.Pattern, text)
		if err != nil {
			return fmt.Errorf("invalid pattern: %w", err)
		}
		if !matched {
			return errors.New("text does not match required pattern")
		}
	}
	
	return nil
}

// Response validation methods

// Validate validates the survey response
func (r *SurveyResponse) Validate() error {
	if r.SurveyID.String() == "" {
		return errors.New("survey ID is required")
	}
	
	if r.SessionID == "" {
		return errors.New("session ID is required")
	}
	
	if !r.IsValidStatus() {
		return errors.New("invalid response status")
	}
	
	return nil
}

// IsValidStatus checks if the response status is valid
func (r *SurveyResponse) IsValidStatus() bool {
	validStatuses := map[ResponseStatus]bool{
		ResponseStatusInProgress: true,
		ResponseStatusCompleted:  true,
		ResponseStatusSubmitted:  true,
		ResponseStatusAbandoned:  true,
	}
	return validStatuses[r.Status]
}

// CanBeSubmitted checks if the response can be submitted
func (r *SurveyResponse) CanBeSubmitted() bool {
	return r.Status == ResponseStatusCompleted
}

// CanBeModified checks if the response can be modified
func (r *SurveyResponse) CanBeModified() bool {
	return r.Status == ResponseStatusInProgress || r.Status == ResponseStatusCompleted
}
