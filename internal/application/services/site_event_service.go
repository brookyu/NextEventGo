package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/interfaces/dto"
)

// SiteEventService provides comprehensive site event management functionality
type SiteEventService struct {
	eventRepo    repositories.SiteEventRepository
	articleRepo  repositories.SiteArticleRepository
	surveyRepo   repositories.SurveyRepository
	videoRepo    repositories.VideoRepository
	categoryRepo repositories.ArticleCategoryRepository
	logger       *zap.Logger
}

// NewSiteEventService creates a new site event service
func NewSiteEventService(
	eventRepo repositories.SiteEventRepository,
	articleRepo repositories.SiteArticleRepository,
	surveyRepo repositories.SurveyRepository,
	videoRepo repositories.VideoRepository,
	categoryRepo repositories.ArticleCategoryRepository,
	logger *zap.Logger,
) *SiteEventService {
	return &SiteEventService{
		eventRepo:    eventRepo,
		articleRepo:  articleRepo,
		surveyRepo:   surveyRepo,
		videoRepo:    videoRepo,
		categoryRepo: categoryRepo,
		logger:       logger,
	}
}

// GetSiteEventsAsync retrieves a paginated list of events with filtering
func (s *SiteEventService) GetSiteEventsAsync(ctx context.Context, input *dto.GetSiteEventsListDto) (*dto.EventListResponse, error) {
	s.logger.Info("Getting site events list",
		zap.Int("page", input.Page),
		zap.Int("pageSize", input.PageSize),
		zap.String("searchTerm", input.SearchTerm))

	// Set default pagination
	if input.Page <= 0 {
		input.Page = 1
	}
	if input.PageSize <= 0 {
		input.PageSize = 20
	}

	// Calculate offset
	offset := (input.Page - 1) * input.PageSize

	// Create filter
	filter := &repositories.SiteEventFilter{
		Offset:        offset,
		Limit:         input.PageSize,
		CategoryID:    input.CategoryID,
		SearchTerm:    input.SearchTerm,
		Status:        input.Status,
		IsCurrent:     input.IsCurrent,
		StartDateFrom: input.StartDateFrom,
		StartDateTo:   input.StartDateTo,
		SortBy:        input.SortBy,
		SortOrder:     input.SortOrder,
	}

	// Get events and count
	events, err := s.eventRepo.GetWithFilters(ctx, filter)
	if err != nil {
		s.logger.Error("Failed to get events", zap.Error(err))
		return nil, fmt.Errorf("failed to get events: %w", err)
	}

	total, err := s.eventRepo.CountWithFilters(ctx, filter)
	if err != nil {
		s.logger.Error("Failed to count events", zap.Error(err))
		return nil, fmt.Errorf("failed to count events: %w", err)
	}

	// Convert to DTOs
	eventDtos := make([]dto.SiteEventDto, len(events))
	for i, event := range events {
		eventDtos[i] = s.mapToSiteEventDto(event)
	}

	// Calculate total pages
	totalPages := int(total) / input.PageSize
	if int(total)%input.PageSize > 0 {
		totalPages++
	}

	return &dto.EventListResponse{
		Data:       eventDtos,
		Total:      total,
		Page:       input.Page,
		PageSize:   input.PageSize,
		TotalPages: totalPages,
	}, nil
}

// GetSiteEventForEditingAsync retrieves an event with all associated resource information
func (s *SiteEventService) GetSiteEventForEditingAsync(ctx context.Context, id uuid.UUID) (*dto.SiteEventForEditingDto, error) {
	s.logger.Info("Getting site event for editing", zap.String("id", id.String()))

	event, err := s.eventRepo.GetByID(ctx, id)
	if err != nil {
		s.logger.Error("Failed to get event", zap.Error(err), zap.String("id", id.String()))
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	// Convert to editing DTO with resource titles
	editingDto := s.mapToSiteEventForEditingDto(ctx, event)

	return editingDto, nil
}

// CreateAsync creates a new site event
func (s *SiteEventService) CreateAsync(ctx context.Context, input *dto.CreateUpdateSiteEventDto) (*dto.SiteEventDto, error) {
	s.logger.Info("Creating new site event", zap.String("title", input.EventTitle))

	// Validate input
	if err := s.validateCreateUpdateInput(input); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Create entity
	event := &entities.SiteEvent{
		EventTitle:     input.EventTitle,
		EventStartDate: input.EventStartDate,
		EventEndDate:   input.EventEndDate,
		TagName:        input.TagName,
	}

	// Handle optional UUID fields
	if input.SurveyID != nil {
		event.SurveyID = *input.SurveyID
	}
	if input.RegisterFormID != nil {
		event.RegisterFormID = *input.RegisterFormID
	}
	if input.AboutEventID != nil {
		event.AboutEventID = *input.AboutEventID
	}
	if input.AgendaID != nil {
		event.AgendaID = *input.AgendaID
	}
	if input.BackgroundID != nil {
		event.BackgroundID = *input.BackgroundID
	}
	if input.InstructionsID != nil {
		event.InstructionsID = *input.InstructionsID
	}
	if input.CloudVideoID != nil {
		event.CloudVideoID = *input.CloudVideoID
	}

	// Set category ID
	if input.CategoryID != nil {
		event.CategoryID = *input.CategoryID
	}

	// Generate interaction code if not provided
	if event.InteractionCode == "" {
		event.InteractionCode = s.generateInteractionCode()
	}

	// Create in repository
	if err := s.eventRepo.Create(ctx, event); err != nil {
		s.logger.Error("Failed to create event", zap.Error(err))
		return nil, fmt.Errorf("failed to create event: %w", err)
	}

	s.logger.Info("Successfully created event", zap.String("id", event.ID.String()))

	// Return DTO
	eventDto := s.mapToSiteEventDto(event)
	return &eventDto, nil
}

// UpdateAsync updates an existing site event
func (s *SiteEventService) UpdateAsync(ctx context.Context, input *dto.CreateUpdateSiteEventDto) (*dto.SiteEventDto, error) {
	s.logger.Info("Updating site event", zap.String("id", input.ID.String()))

	// Validate input
	if err := s.validateCreateUpdateInput(input); err != nil {
		return nil, fmt.Errorf("validation failed: %w", err)
	}

	// Get existing event
	event, err := s.eventRepo.GetByID(ctx, input.ID)
	if err != nil {
		s.logger.Error("Failed to get event for update", zap.Error(err))
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	// Update fields
	event.EventTitle = input.EventTitle
	event.EventStartDate = input.EventStartDate
	event.EventEndDate = input.EventEndDate
	event.TagName = input.TagName

	// Handle optional UUID fields
	if input.SurveyID != nil {
		event.SurveyID = *input.SurveyID
	} else {
		event.SurveyID = uuid.Nil
	}
	if input.RegisterFormID != nil {
		event.RegisterFormID = *input.RegisterFormID
	} else {
		event.RegisterFormID = uuid.Nil
	}
	if input.AboutEventID != nil {
		event.AboutEventID = *input.AboutEventID
	} else {
		event.AboutEventID = uuid.Nil
	}
	if input.AgendaID != nil {
		event.AgendaID = *input.AgendaID
	} else {
		event.AgendaID = uuid.Nil
	}
	if input.BackgroundID != nil {
		event.BackgroundID = *input.BackgroundID
	} else {
		event.BackgroundID = uuid.Nil
	}
	if input.InstructionsID != nil {
		event.InstructionsID = *input.InstructionsID
	} else {
		event.InstructionsID = uuid.Nil
	}
	if input.CloudVideoID != nil {
		event.CloudVideoID = *input.CloudVideoID
	} else {
		event.CloudVideoID = uuid.Nil
	}

	// Update category ID
	if input.CategoryID != nil {
		event.CategoryID = *input.CategoryID
	}

	// Update in repository
	if err := s.eventRepo.Update(ctx, event); err != nil {
		s.logger.Error("Failed to update event", zap.Error(err))
		return nil, fmt.Errorf("failed to update event: %w", err)
	}

	s.logger.Info("Successfully updated event", zap.String("id", event.ID.String()))

	// Return DTO
	eventDto := s.mapToSiteEventDto(event)
	return &eventDto, nil
}

// ToggleCurrentAsync toggles the current status of an event
func (s *SiteEventService) ToggleCurrentAsync(ctx context.Context, input *dto.ToggleCurrentInput) error {
	s.logger.Info("Toggling current event status", zap.String("id", input.ID.String()))

	return s.eventRepo.SetCurrent(ctx, input.ID)
}

// DeleteAsync soft deletes an event
func (s *SiteEventService) DeleteAsync(ctx context.Context, input *dto.DeleteEventInputDto) error {
	s.logger.Info("Deleting event", zap.String("id", input.ID.String()))

	return s.eventRepo.Delete(ctx, input.ID)
}

// GetCurrentEvent retrieves the current active event
func (s *SiteEventService) GetCurrentEvent(ctx context.Context) (*dto.SiteEventDto, error) {
	event, err := s.eventRepo.GetCurrent(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get current event: %w", err)
	}

	eventDto := s.mapToSiteEventDto(event)
	return &eventDto, nil
}

// Helper methods

// mapToSiteEventDto converts entity to DTO
func (s *SiteEventService) mapToSiteEventDto(event *entities.SiteEvent) dto.SiteEventDto {
	return dto.SiteEventDto{
		ID:              event.ID,
		EventTitle:      event.EventTitle,
		EventStartDate:  event.EventStartDate,
		EventEndDate:    event.EventEndDate,
		IsCurrent:       event.IsCurrent,
		CreatedAt:       event.CreatedAt,
		Status:          event.GetStatus(),
		InteractionCode: event.InteractionCode,
		CategoryID:      event.CategoryID,
	}
}

// generateInteractionCode generates a unique interaction code
func (s *SiteEventService) generateInteractionCode() string {
	return fmt.Sprintf("%d", time.Now().Unix())
}

// mapToSiteEventForEditingDto converts entity to editing DTO with resource titles
func (s *SiteEventService) mapToSiteEventForEditingDto(ctx context.Context, event *entities.SiteEvent) *dto.SiteEventForEditingDto {
	editingDto := &dto.SiteEventForEditingDto{
		ID:             event.ID,
		EventTitle:     event.EventTitle,
		EventStartDate: event.EventStartDate,
		EventEndDate:   event.EventEndDate,
		TagName:        event.TagName,
		CategoryID:     event.CategoryID,

		// Resource IDs
		SurveyID:       event.SurveyID,
		RegisterFormID: event.RegisterFormID,

		// Article resource IDs
		AboutEventID:   event.AboutEventID,
		AgendaID:       event.AgendaID,
		BackgroundID:   event.BackgroundID,
		InstructionsID: event.InstructionsID,

		// Video resource IDs
		CloudVideoID: event.CloudVideoID,
	}

	// Fetch resource titles for surveys and forms
	if event.SurveyID != uuid.Nil {
		if survey, err := s.surveyRepo.FindByID(ctx, event.SurveyID); err == nil {
			editingDto.SurveyTitle = survey.Title
		}
	}

	if event.RegisterFormID != uuid.Nil {
		if survey, err := s.surveyRepo.FindByID(ctx, event.RegisterFormID); err == nil {
			editingDto.RegisterFormTitle = survey.Title
		}
	}

	// TODO: Fetch article titles when article repository is available
	// if event.AboutEventID != uuid.Nil {
	//     if article, err := s.articleRepo.FindByID(ctx, event.AboutEventID); err == nil {
	//         editingDto.AboutEventTitle = article.Title
	//     }
	// }

	return editingDto
}

// validateCreateUpdateInput validates the input for create/update operations
func (s *SiteEventService) validateCreateUpdateInput(input *dto.CreateUpdateSiteEventDto) error {
	if input.EventTitle == "" {
		return fmt.Errorf("event title is required")
	}

	if input.EventStartDate.IsZero() {
		return fmt.Errorf("event start date is required")
	}

	if input.EventEndDate.IsZero() {
		return fmt.Errorf("event end date is required")
	}

	if input.EventEndDate.Before(input.EventStartDate) {
		return fmt.Errorf("event end date must be after start date")
	}

	return nil
}
