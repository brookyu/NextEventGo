package services

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
)

// SurveyService provides business logic for survey management
// Compatible with existing .NET database schema
type SurveyService struct {
	db *gorm.DB
}

// NewSurveyService creates a new survey service
func NewSurveyService(db *gorm.DB) *SurveyService {
	return &SurveyService{
		db: db,
	}
}

// Survey represents the existing Surveys table structure
type Survey struct {
	ID                   string     `gorm:"column:Id;primaryKey;type:char(36)"`
	SurveyTitle          *string    `gorm:"column:SurveyTitle;type:longtext"`
	SurveyTitleEn        *string    `gorm:"column:SurveyTitleEn;type:longtext"`
	SurveySummary        *string    `gorm:"column:SurveySummary;type:longtext"`
	FormType             int        `gorm:"column:FormType;not null"`
	IsOpen               bool       `gorm:"column:IsOpen;not null"`
	CategoryId           *string    `gorm:"column:CategoryId;type:char(36)"`
	PromotionCode        *string    `gorm:"column:PromotionCode;type:longtext"`
	PromotionPicId       *string    `gorm:"column:PromotionPicId;type:char(36)"`
	IsLuckEnabled        bool       `gorm:"column:IsLuckEnabled;not null"`
	CreationTime         time.Time  `gorm:"column:CreationTime;not null"`
	CreatorId            *string    `gorm:"column:CreatorId;type:char(36)"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	LastModifierId       *string    `gorm:"column:LastModifierId;type:char(36)"`
	IsDeleted            bool       `gorm:"column:IsDeleted;not null;default:0"`
	DeleterId            *string    `gorm:"column:DeleterId;type:char(36)"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime"`
}

// TableName returns the table name for Survey
func (Survey) TableName() string {
	return "Surveys"
}

// Question represents the existing Questions table structure
type Question struct {
	ID                   string     `gorm:"column:Id;primaryKey;type:char(36)"`
	SurveyId             string     `gorm:"column:SurveyId;type:char(36);not null"`
	QuestionTitle        *string    `gorm:"column:QuestionTitle;type:longtext"`
	QuestionTitleEn      *string    `gorm:"column:QuestionTitleEn;type:longtext"`
	QuestionType         int        `gorm:"column:QuestionType;not null"`
	Choices              *string    `gorm:"column:Choices;type:longtext"`
	ChoicesEn            *string    `gorm:"column:ChoicesEn;type:longtext"`
	OrderNumber          int        `gorm:"column:OrderNumber;not null"`
	IsProjected          bool       `gorm:"column:IsProjected;not null"`
	Answers              *string    `gorm:"column:Answers;type:longtext"`
	IsChoiceCountFixed   *bool      `gorm:"column:IsChoiceCountFixed;type:tinyint"`
	ChoiceCount          *int       `gorm:"column:ChoiceCount"`
	CreationTime         time.Time  `gorm:"column:CreationTime;not null"`
	CreatorId            *string    `gorm:"column:CreatorId;type:char(36)"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	LastModifierId       *string    `gorm:"column:LastModifierId;type:char(36)"`
	IsDeleted            bool       `gorm:"column:IsDeleted;not null;default:0"`
	DeleterId            *string    `gorm:"column:DeleterId;type:char(36)"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime"`
}

// TableName returns the table name for Question
func (Question) TableName() string {
	return "Questions"
}

// Answer represents the existing Answers table structure
type Answer struct {
	ID                   string     `gorm:"column:Id;primaryKey;type:char(36)"`
	UserId               *string    `gorm:"column:UserId;type:longtext"`
	SurveyId             string     `gorm:"column:SurveyId;type:char(36);not null"`
	AnswerString         *string    `gorm:"column:AnswerString;type:longtext"`
	DateCompleted        time.Time  `gorm:"column:DateCompleted;not null"`
	IsComplete           bool       `gorm:"column:IsComplete;not null"`
	EventId              string     `gorm:"column:EventId;type:char(36);not null"`
	PromoterName         *string    `gorm:"column:PromoterName;type:longtext"`
	CreationTime         time.Time  `gorm:"column:CreationTime;not null"`
	CreatorId            *string    `gorm:"column:CreatorId;type:char(36)"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	LastModifierId       *string    `gorm:"column:LastModifierId;type:char(36)"`
	IsDeleted            bool       `gorm:"column:IsDeleted;not null;default:0"`
	DeleterId            *string    `gorm:"column:DeleterId;type:char(36)"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime"`
}

// TableName returns the table name for Answer
func (Answer) TableName() string {
	return "Answers"
}

// SingleAnswer represents the existing SingleAnswers table structure
type SingleAnswer struct {
	ID                   string     `gorm:"column:Id;primaryKey;type:char(36)"`
	QuestionId           string     `gorm:"column:QuestionId;type:char(36);not null"`
	Answer               *string    `gorm:"column:Answer;type:longtext"`
	CreatedDate          time.Time  `gorm:"column:CreatedDate;not null"`
	OpenId               *string    `gorm:"column:OpenId;type:longtext"`
	IsCorrect            bool       `gorm:"column:IsCorrect;not null"`
	CreationTime         time.Time  `gorm:"column:CreationTime;not null"`
	CreatorId            *string    `gorm:"column:CreatorId;type:char(36)"`
	LastModificationTime *time.Time `gorm:"column:LastModificationTime"`
	LastModifierId       *string    `gorm:"column:LastModifierId;type:char(36)"`
	IsDeleted            bool       `gorm:"column:IsDeleted;not null;default:0"`
	DeleterId            *string    `gorm:"column:DeleterId;type:char(36)"`
	DeletionTime         *time.Time `gorm:"column:DeletionTime"`
}

// TableName returns the table name for SingleAnswer
func (SingleAnswer) TableName() string {
	return "SingleAnswers"
}

// GetSurveyList retrieves paginated list of surveys
func (s *SurveyService) GetSurveyList(ctx context.Context, req *dto.GetSurveyListRequest) (*dto.SurveyListResponse, error) {
	var surveys []Survey
	var total int64

	// Build query
	query := s.db.WithContext(ctx).Model(&Survey{}).Where("IsDeleted = ?", false)

	// Apply filters
	if req.Search != nil && *req.Search != "" {
		searchTerm := "%" + *req.Search + "%"
		query = query.Where("SurveyTitle LIKE ? OR SurveySummary LIKE ?", searchTerm, searchTerm)
	}

	if req.CategoryId != nil && *req.CategoryId != "" {
		query = query.Where("CategoryId = ?", *req.CategoryId)
	}

	if req.FormType != nil {
		query = query.Where("FormType = ?", *req.FormType)
	}

	if req.IsOpen != nil {
		query = query.Where("IsOpen = ?", *req.IsOpen)
	}

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("failed to count surveys: %w", err)
	}

	// Apply sorting
	orderBy := "CreationTime DESC"
	if req.SortBy != nil && *req.SortBy != "" {
		direction := "ASC"
		if req.SortOrder != nil && strings.ToUpper(*req.SortOrder) == "DESC" {
			direction = "DESC"
		}
		orderBy = fmt.Sprintf("%s %s", *req.SortBy, direction)
	}

	// Apply pagination
	offset := (req.Page - 1) * req.Limit
	if err := query.Order(orderBy).Offset(offset).Limit(req.Limit).Find(&surveys).Error; err != nil {
		return nil, fmt.Errorf("failed to get surveys: %w", err)
	}

	// Convert to DTOs
	surveyResponses := make([]dto.SurveyResponse, len(surveys))
	for i, survey := range surveys {
		surveyResponses[i] = s.mapSurveyToResponse(&survey)

		// Get question count and response count for each survey
		var questionCount int64
		var responseCount int64

		s.db.Model(&Question{}).Where("SurveyId = ? AND IsDeleted = ?", survey.ID, false).Count(&questionCount)
		s.db.Model(&Answer{}).Where("SurveyId = ? AND IsDeleted = ?", survey.ID, false).Count(&responseCount)

		surveyResponses[i].QuestionCount = int(questionCount)
		surveyResponses[i].ResponseCount = int(responseCount)

		// Calculate completion rate
		if responseCount > 0 {
			var completedCount int64
			s.db.Model(&Answer{}).Where("SurveyId = ? AND IsComplete = ? AND IsDeleted = ?", survey.ID, true, false).Count(&completedCount)
			surveyResponses[i].CompletionRate = float64(completedCount) / float64(responseCount) * 100
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(req.Limit)))

	return &dto.SurveyListResponse{
		Data:       surveyResponses,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
		TotalPages: totalPages,
	}, nil
}

// mapSurveyToResponse converts Survey entity to DTO
func (s *SurveyService) mapSurveyToResponse(survey *Survey) dto.SurveyResponse {
	var categoryId uuid.UUID
	if survey.CategoryId != nil {
		if parsed, err := uuid.Parse(*survey.CategoryId); err == nil {
			categoryId = parsed
		}
	}

	var creatorId *uuid.UUID
	if survey.CreatorId != nil {
		if parsed, err := uuid.Parse(*survey.CreatorId); err == nil {
			creatorId = &parsed
		}
	}

	var lastModifierId *uuid.UUID
	if survey.LastModifierId != nil {
		if parsed, err := uuid.Parse(*survey.LastModifierId); err == nil {
			lastModifierId = &parsed
		}
	}

	var deleterId *uuid.UUID
	if survey.DeleterId != nil {
		if parsed, err := uuid.Parse(*survey.DeleterId); err == nil {
			deleterId = &parsed
		}
	}

	var promotionPicId *uuid.UUID
	if survey.PromotionPicId != nil {
		if parsed, err := uuid.Parse(*survey.PromotionPicId); err == nil {
			promotionPicId = &parsed
		}
	}

	surveyTitle := ""
	if survey.SurveyTitle != nil {
		surveyTitle = *survey.SurveyTitle
	}

	return dto.SurveyResponse{
		ID:                   uuid.MustParse(survey.ID),
		SurveyTitle:          surveyTitle,
		SurveyTitleEn:        survey.SurveyTitleEn,
		SurveySummary:        survey.SurveySummary,
		FormType:             survey.FormType,
		IsOpen:               survey.IsOpen,
		CategoryId:           categoryId,
		PromotionCode:        survey.PromotionCode,
		PromotionPicId:       promotionPicId,
		IsLuckEnabled:        survey.IsLuckEnabled,
		CreationTime:         survey.CreationTime,
		CreatorId:            creatorId,
		LastModificationTime: survey.LastModificationTime,
		LastModifierId:       lastModifierId,
		IsDeleted:            survey.IsDeleted,
		DeleterId:            deleterId,
		DeletionTime:         survey.DeletionTime,
	}
}

// GetSurvey retrieves a single survey by ID
func (s *SurveyService) GetSurvey(ctx context.Context, id uuid.UUID) (*dto.SurveyResponse, error) {
	var survey Survey
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", id.String(), false).First(&survey).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("survey not found")
		}
		return nil, fmt.Errorf("failed to get survey: %w", err)
	}

	response := s.mapSurveyToResponse(&survey)

	// Get additional counts
	var questionCount int64
	var responseCount int64

	s.db.Model(&Question{}).Where("SurveyId = ? AND IsDeleted = ?", survey.ID, false).Count(&questionCount)
	s.db.Model(&Answer{}).Where("SurveyId = ? AND IsDeleted = ?", survey.ID, false).Count(&responseCount)

	response.QuestionCount = int(questionCount)
	response.ResponseCount = int(responseCount)

	// Calculate completion rate
	if responseCount > 0 {
		var completedCount int64
		s.db.Model(&Answer{}).Where("SurveyId = ? AND IsComplete = ? AND IsDeleted = ?", survey.ID, true, false).Count(&completedCount)
		response.CompletionRate = float64(completedCount) / float64(responseCount) * 100
	}

	return &response, nil
}

// GetSurveyWithQuestions retrieves a survey with its questions
func (s *SurveyService) GetSurveyWithQuestions(ctx context.Context, id uuid.UUID) (*dto.SurveyWithQuestionsResponse, error) {
	// Get survey
	surveyResponse, err := s.GetSurvey(ctx, id)
	if err != nil {
		return nil, err
	}

	// Get questions
	var questions []Question
	if err := s.db.WithContext(ctx).Where("SurveyId = ? AND IsDeleted = ?", id.String(), false).
		Order("OrderNumber ASC").Find(&questions).Error; err != nil {
		return nil, fmt.Errorf("failed to get survey questions: %w", err)
	}

	// Convert questions to DTOs
	questionResponses := make([]dto.QuestionResponse, len(questions))
	for i, question := range questions {
		questionResponses[i] = s.mapQuestionToResponse(&question)

		// Get response count for each question
		var responseCount int64
		s.db.Model(&SingleAnswer{}).Where("QuestionId = ? AND IsDeleted = ?", question.ID, false).Count(&responseCount)
		questionResponses[i].ResponseCount = int(responseCount)
	}

	return &dto.SurveyWithQuestionsResponse{
		Survey:    *surveyResponse,
		Questions: questionResponses,
	}, nil
}

// CreateSurvey creates a new survey
func (s *SurveyService) CreateSurvey(ctx context.Context, req *dto.CreateSurveyRequest) (*dto.SurveyResponse, error) {
	now := time.Now()
	surveyId := uuid.New().String()

	var categoryId *string
	if req.CategoryId != uuid.Nil {
		categoryIdStr := req.CategoryId.String()
		categoryId = &categoryIdStr
	}

	var creatorIdStr *string
	if req.CreatorId != uuid.Nil {
		creatorIdStrVal := req.CreatorId.String()
		creatorIdStr = &creatorIdStrVal
	}

	survey := Survey{
		ID:            surveyId,
		SurveyTitle:   &req.SurveyTitle,
		SurveyTitleEn: req.SurveyTitleEn,
		SurveySummary: req.SurveySummary,
		FormType:      req.FormType,
		IsOpen:        req.IsOpen,
		CategoryId:    categoryId,
		PromotionCode: req.PromotionCode,
		IsLuckEnabled: req.IsLuckEnabled,
		CreationTime:  now,
		CreatorId:     creatorIdStr,
		IsDeleted:     false,
	}

	if err := s.db.WithContext(ctx).Create(&survey).Error; err != nil {
		return nil, fmt.Errorf("failed to create survey: %w", err)
	}

	response := s.mapSurveyToResponse(&survey)
	return &response, nil
}

// UpdateSurvey updates an existing survey
func (s *SurveyService) UpdateSurvey(ctx context.Context, id uuid.UUID, req *dto.UpdateSurveyRequest) (*dto.SurveyResponse, error) {
	var survey Survey
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", id.String(), false).First(&survey).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("survey not found")
		}
		return nil, fmt.Errorf("failed to find survey: %w", err)
	}

	// Update fields
	now := time.Now()
	lastModifierIdStr := req.LastModifierId.String()

	updates := map[string]interface{}{
		"LastModificationTime": now,
		"LastModifierId":       lastModifierIdStr,
	}

	if req.SurveyTitle != nil {
		updates["SurveyTitle"] = *req.SurveyTitle
	}
	if req.SurveyTitleEn != nil {
		updates["SurveyTitleEn"] = *req.SurveyTitleEn
	}
	if req.SurveySummary != nil {
		updates["SurveySummary"] = *req.SurveySummary
	}
	if req.FormType != nil {
		updates["FormType"] = *req.FormType
	}
	if req.IsOpen != nil {
		updates["IsOpen"] = *req.IsOpen
	}
	if req.CategoryId != nil {
		categoryIdStr := req.CategoryId.String()
		updates["CategoryId"] = categoryIdStr
	}
	if req.PromotionCode != nil {
		updates["PromotionCode"] = *req.PromotionCode
	}
	if req.IsLuckEnabled != nil {
		updates["IsLuckEnabled"] = *req.IsLuckEnabled
	}

	if err := s.db.WithContext(ctx).Model(&survey).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update survey: %w", err)
	}

	// Reload survey to get updated data
	if err := s.db.WithContext(ctx).Where("Id = ?", id.String()).First(&survey).Error; err != nil {
		return nil, fmt.Errorf("failed to reload survey: %w", err)
	}

	response := s.mapSurveyToResponse(&survey)
	return &response, nil
}

// mapQuestionToResponse converts Question entity to DTO
func (s *SurveyService) mapQuestionToResponse(question *Question) dto.QuestionResponse {
	var creatorId *uuid.UUID
	if question.CreatorId != nil {
		if parsed, err := uuid.Parse(*question.CreatorId); err == nil {
			creatorId = &parsed
		}
	}

	var lastModifierId *uuid.UUID
	if question.LastModifierId != nil {
		if parsed, err := uuid.Parse(*question.LastModifierId); err == nil {
			lastModifierId = &parsed
		}
	}

	var deleterId *uuid.UUID
	if question.DeleterId != nil {
		if parsed, err := uuid.Parse(*question.DeleterId); err == nil {
			deleterId = &parsed
		}
	}

	questionTitle := ""
	if question.QuestionTitle != nil {
		questionTitle = *question.QuestionTitle
	}

	return dto.QuestionResponse{
		ID:                   uuid.MustParse(question.ID),
		SurveyId:             uuid.MustParse(question.SurveyId),
		QuestionTitle:        questionTitle,
		QuestionTitleEn:      question.QuestionTitleEn,
		QuestionType:         question.QuestionType,
		Choices:              question.Choices,
		ChoicesEn:            question.ChoicesEn,
		OrderNumber:          question.OrderNumber,
		IsProjected:          question.IsProjected,
		Answers:              question.Answers,
		IsChoiceCountFixed:   question.IsChoiceCountFixed,
		ChoiceCount:          question.ChoiceCount,
		CreationTime:         question.CreationTime,
		CreatorId:            creatorId,
		LastModificationTime: question.LastModificationTime,
		LastModifierId:       lastModifierId,
		IsDeleted:            question.IsDeleted,
		DeleterId:            deleterId,
		DeletionTime:         question.DeletionTime,
	}
}

// DeleteSurvey soft deletes a survey
func (s *SurveyService) DeleteSurvey(ctx context.Context, id uuid.UUID, deleterId uuid.UUID) error {
	now := time.Now()
	deleterIdStr := deleterId.String()

	updates := map[string]interface{}{
		"IsDeleted":            true,
		"DeletionTime":         now,
		"DeleterId":            deleterIdStr,
		"LastModificationTime": now,
		"LastModifierId":       deleterIdStr,
	}

	result := s.db.WithContext(ctx).Model(&Survey{}).
		Where("Id = ? AND IsDeleted = ?", id.String(), false).
		Updates(updates)

	if result.Error != nil {
		return fmt.Errorf("failed to delete survey: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("survey not found or already deleted")
	}

	return nil
}

// Question Management Methods

// CreateQuestion creates a new question for a survey
func (s *SurveyService) CreateQuestion(ctx context.Context, req *dto.CreateQuestionRequest) (*dto.QuestionResponse, error) {
	// Verify survey exists
	var survey Survey
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", req.SurveyId.String(), false).First(&survey).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("survey not found")
		}
		return nil, fmt.Errorf("failed to find survey: %w", err)
	}

	now := time.Now()
	questionId := uuid.New().String()

	var creatorIdStr *string
	if req.CreatorId != uuid.Nil {
		creatorIdStrVal := req.CreatorId.String()
		creatorIdStr = &creatorIdStrVal
	}

	question := Question{
		ID:                 questionId,
		SurveyId:           req.SurveyId.String(),
		QuestionTitle:      &req.QuestionTitle,
		QuestionTitleEn:    req.QuestionTitleEn,
		QuestionType:       req.QuestionType,
		Choices:            req.Choices,
		ChoicesEn:          req.ChoicesEn,
		OrderNumber:        req.OrderNumber,
		IsProjected:        req.IsProjected,
		Answers:            req.Answers,
		IsChoiceCountFixed: req.IsChoiceCountFixed,
		ChoiceCount:        req.ChoiceCount,
		CreationTime:       now,
		CreatorId:          creatorIdStr,
		IsDeleted:          false,
	}

	if err := s.db.WithContext(ctx).Create(&question).Error; err != nil {
		return nil, fmt.Errorf("failed to create question: %w", err)
	}

	response := s.mapQuestionToResponse(&question)
	return &response, nil
}

// UpdateQuestion updates an existing question
func (s *SurveyService) UpdateQuestion(ctx context.Context, id uuid.UUID, req *dto.UpdateQuestionRequest) (*dto.QuestionResponse, error) {
	var question Question
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", id.String(), false).First(&question).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to find question: %w", err)
	}

	// Update fields
	now := time.Now()
	lastModifierIdStr := req.LastModifierId.String()

	updates := map[string]interface{}{
		"LastModificationTime": now,
		"LastModifierId":       lastModifierIdStr,
	}

	if req.QuestionTitle != nil {
		updates["QuestionTitle"] = *req.QuestionTitle
	}
	if req.QuestionTitleEn != nil {
		updates["QuestionTitleEn"] = *req.QuestionTitleEn
	}
	if req.QuestionType != nil {
		updates["QuestionType"] = *req.QuestionType
	}
	if req.Choices != nil {
		updates["Choices"] = *req.Choices
	}
	if req.ChoicesEn != nil {
		updates["ChoicesEn"] = *req.ChoicesEn
	}
	if req.OrderNumber != nil {
		updates["OrderNumber"] = *req.OrderNumber
	}
	if req.IsProjected != nil {
		updates["IsProjected"] = *req.IsProjected
	}
	if req.Answers != nil {
		updates["Answers"] = *req.Answers
	}
	if req.IsChoiceCountFixed != nil {
		updates["IsChoiceCountFixed"] = *req.IsChoiceCountFixed
	}
	if req.ChoiceCount != nil {
		updates["ChoiceCount"] = *req.ChoiceCount
	}

	if err := s.db.WithContext(ctx).Model(&question).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update question: %w", err)
	}

	// Reload question to get updated data
	if err := s.db.WithContext(ctx).Where("Id = ?", id.String()).First(&question).Error; err != nil {
		return nil, fmt.Errorf("failed to reload question: %w", err)
	}

	response := s.mapQuestionToResponse(&question)
	return &response, nil
}

// DeleteQuestion soft deletes a question
func (s *SurveyService) DeleteQuestion(ctx context.Context, id uuid.UUID, deleterId uuid.UUID) error {
	now := time.Now()
	deleterIdStr := deleterId.String()

	updates := map[string]interface{}{
		"IsDeleted":            true,
		"DeletionTime":         now,
		"DeleterId":            deleterIdStr,
		"LastModificationTime": now,
		"LastModifierId":       deleterIdStr,
	}

	result := s.db.WithContext(ctx).Model(&Question{}).
		Where("Id = ? AND IsDeleted = ?", id.String(), false).
		Updates(updates)

	if result.Error != nil {
		return fmt.Errorf("failed to delete question: %w", result.Error)
	}

	if result.RowsAffected == 0 {
		return fmt.Errorf("question not found or already deleted")
	}

	return nil
}

// GetQuestion retrieves a single question by ID
func (s *SurveyService) GetQuestion(ctx context.Context, id uuid.UUID) (*dto.QuestionResponse, error) {
	var question Question
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", id.String(), false).First(&question).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("question not found")
		}
		return nil, fmt.Errorf("failed to get question: %w", err)
	}

	response := s.mapQuestionToResponse(&question)

	// Get response count for this question
	var responseCount int64
	s.db.Model(&SingleAnswer{}).Where("QuestionId = ? AND IsDeleted = ?", question.ID, false).Count(&responseCount)
	response.ResponseCount = int(responseCount)

	return &response, nil
}

// UpdateQuestionOrder updates the order of questions in a survey
func (s *SurveyService) UpdateQuestionOrder(ctx context.Context, req *dto.UpdateQuestionOrderRequest) (*dto.SurveyWithQuestionsResponse, error) {
	// Verify survey exists
	var survey Survey
	if err := s.db.WithContext(ctx).Where("Id = ? AND IsDeleted = ?", req.SurveyId.String(), false).First(&survey).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("survey not found")
		}
		return nil, fmt.Errorf("failed to find survey: %w", err)
	}

	// Update question orders in a transaction
	err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		now := time.Now()
		lastModifierIdStr := req.LastModifierId.String()

		for _, questionOrder := range req.QuestionOrders {
			updates := map[string]interface{}{
				"OrderNumber":          questionOrder.OrderNumber,
				"LastModificationTime": now,
				"LastModifierId":       lastModifierIdStr,
			}

			result := tx.Model(&Question{}).
				Where("Id = ? AND SurveyId = ? AND IsDeleted = ?", questionOrder.QuestionId.String(), req.SurveyId.String(), false).
				Updates(updates)

			if result.Error != nil {
				return fmt.Errorf("failed to update order for question %s: %w", questionOrder.QuestionId, result.Error)
			}

			if result.RowsAffected == 0 {
				return fmt.Errorf("question %s not found or not in survey", questionOrder.QuestionId)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Return updated survey with questions
	return s.GetSurveyWithQuestions(ctx, req.SurveyId)
}

// GetQuestionsBySurvey retrieves all questions for a survey
func (s *SurveyService) GetQuestionsBySurvey(ctx context.Context, surveyId uuid.UUID) ([]dto.QuestionResponse, error) {
	var questions []Question
	if err := s.db.WithContext(ctx).Where("SurveyId = ? AND IsDeleted = ?", surveyId.String(), false).
		Order("OrderNumber ASC").Find(&questions).Error; err != nil {
		return nil, fmt.Errorf("failed to get survey questions: %w", err)
	}

	// Convert questions to DTOs
	questionResponses := make([]dto.QuestionResponse, len(questions))
	for i, question := range questions {
		questionResponses[i] = s.mapQuestionToResponse(&question)

		// Get response count for each question
		var responseCount int64
		s.db.Model(&SingleAnswer{}).Where("QuestionId = ? AND IsDeleted = ?", question.ID, false).Count(&responseCount)
		questionResponses[i].ResponseCount = int(responseCount)
	}

	return questionResponses, nil
}
