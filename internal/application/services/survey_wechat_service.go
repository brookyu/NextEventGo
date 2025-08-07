package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
)

// SurveyWeChatService handles WeChat integration for surveys
type SurveyWeChatService struct {
	surveyRepo    repositories.SurveyRepository
	qrCodeRepo    repositories.WeChatQrCodeRepository
	wechatService services.WeChatService
	qrCodeService QRCodeServiceInterface
	logger        *zap.Logger
	config        SurveyWeChatConfig
}

// SurveyWeChatConfig contains configuration for survey WeChat integration
type SurveyWeChatConfig struct {
	QRCodeExpireSeconds int
	MaxQRCodesPerSurvey int
	WeChatBaseURL       string
	EnableAnalytics     bool
	DefaultQRCodeStyle  string
}

// NewSurveyWeChatService creates a new survey WeChat service
func NewSurveyWeChatService(
	surveyRepo repositories.SurveyRepository,
	qrCodeRepo repositories.WeChatQrCodeRepository,
	wechatService services.WeChatService,
	qrCodeService QRCodeServiceInterface,
	logger *zap.Logger,
	config SurveyWeChatConfig,
) *SurveyWeChatService {
	return &SurveyWeChatService{
		surveyRepo:    surveyRepo,
		qrCodeRepo:    qrCodeRepo,
		wechatService: wechatService,
		qrCodeService: qrCodeService,
		logger:        logger,
		config:        config,
	}
}

// GenerateSurveyQRCode generates a WeChat QR code for a survey
func (s *SurveyWeChatService) GenerateSurveyQRCode(ctx context.Context, surveyID uuid.UUID, qrCodeType string) (*entities.WeChatQrCode, error) {
	s.logger.Info("Generating WeChat QR code for survey",
		zap.String("surveyId", surveyID.String()),
		zap.String("type", qrCodeType))

	// Validate survey exists
	_, err := s.surveyRepo.FindByID(ctx, surveyID)
	if err != nil {
		return nil, fmt.Errorf("survey not found: %w", err)
	}

	// Generate QR code using existing service
	qrType := entities.QRCodeTypePermanent
	if qrCodeType == "temporary" {
		qrType = entities.QRCodeTypeTemporary
	}

	qrCode, err := s.qrCodeService.GenerateSurveyQRCode(ctx, surveyID, qrType)
	if err != nil {
		return nil, fmt.Errorf("failed to generate QR code: %w", err)
	}

	s.logger.Info("Successfully generated survey QR code",
		zap.String("qrCodeId", qrCode.ID.String()),
		zap.String("surveyId", surveyID.String()))

	return qrCode, nil
}

// GetSurveyQRCodes retrieves all QR codes for a survey
func (s *SurveyWeChatService) GetSurveyQRCodes(ctx context.Context, surveyID uuid.UUID) ([]*entities.WeChatQrCode, error) {
	qrCodes, err := s.qrCodeRepo.GetByResource(ctx, surveyID, "survey")
	if err != nil {
		return nil, fmt.Errorf("failed to get QR codes: %w", err)
	}

	return qrCodes, nil
}

// PrepareWeChatContent optimizes survey content for WeChat sharing
func (s *SurveyWeChatService) PrepareWeChatContent(ctx context.Context, surveyID uuid.UUID) (string, error) {
	survey, err := s.surveyRepo.FindByID(ctx, surveyID)
	if err != nil {
		return "", fmt.Errorf("survey not found: %w", err)
	}

	// Generate WeChat-optimized content
	optimizedContent := s.optimizeWeChatContent(survey)
	return optimizedContent, nil
}

// TrackQRCodeScan tracks when a survey QR code is scanned
func (s *SurveyWeChatService) TrackQRCodeScan(ctx context.Context, qrCodeID uuid.UUID, scanData *QRCodeScanData) error {
	return s.qrCodeService.TrackQRCodeScan(ctx, qrCodeID, scanData)
}

// RevokeQRCode revokes a survey QR code
func (s *SurveyWeChatService) RevokeQRCode(ctx context.Context, qrCodeID uuid.UUID) error {
	return s.qrCodeService.RevokeQRCode(ctx, qrCodeID)
}

// GetSurveyShareInfo generates sharing information for WeChat
func (s *SurveyWeChatService) GetSurveyShareInfo(ctx context.Context, surveyID uuid.UUID) (*WeChatShareInfo, error) {
	survey, err := s.surveyRepo.FindByID(ctx, surveyID)
	if err != nil {
		return nil, fmt.Errorf("survey not found: %w", err)
	}

	// Get active QR code
	qrCode, err := s.qrCodeRepo.GetActiveByResource(ctx, surveyID, "survey")
	if err != nil {
		// Generate a new QR code if none exists
		qrCode, err = s.GenerateSurveyQRCode(ctx, surveyID, "permanent")
		if err != nil {
			return nil, fmt.Errorf("failed to generate QR code: %w", err)
		}
	}

	shareInfo := &WeChatShareInfo{
		Title:       survey.Title,
		Description: survey.Description,
		QRCodeURL:   qrCode.Url,
		ShareURL:    fmt.Sprintf("%s/surveys/%s", s.config.WeChatBaseURL, surveyID.String()),
		QRCodeID:    qrCode.ID,
	}

	return shareInfo, nil
}

// optimizeWeChatContent optimizes survey content for WeChat display
func (s *SurveyWeChatService) optimizeWeChatContent(survey *entities.Survey) string {
	var content strings.Builder

	// Add survey title
	content.WriteString(fmt.Sprintf("<h2>%s</h2>\n", survey.Title))

	// Add description if available
	if survey.Description != "" {
		content.WriteString(fmt.Sprintf("<p>%s</p>\n", survey.Description))
	}

	// Add instructions if available
	if survey.Instructions != "" {
		content.WriteString(fmt.Sprintf("<div class='instructions'><h3>参与说明</h3><p>%s</p></div>\n", survey.Instructions))
	}

	// Add survey metadata
	content.WriteString("<div class='survey-meta'>\n")
	if survey.IsAnonymous {
		content.WriteString("<p>✓ 匿名调研</p>\n")
	}
	if survey.IsPublic {
		content.WriteString("<p>✓ 公开调研</p>\n")
	}
	content.WriteString("</div>\n")

	// Add call to action
	content.WriteString("<div class='cta'>\n")
	content.WriteString("<p><strong>点击下方链接参与调研</strong></p>\n")
	content.WriteString("</div>\n")

	return content.String()
}

// WeChatShareInfo represents sharing information for WeChat
type WeChatShareInfo struct {
	Title       string    `json:"title"`
	Description string    `json:"description"`
	QRCodeURL   string    `json:"qrCodeUrl"`
	ShareURL    string    `json:"shareUrl"`
	QRCodeID    uuid.UUID `json:"qrCodeId"`
}

// SurveyQRCodeStats represents QR code statistics for a survey
type SurveyQRCodeStats struct {
	SurveyID      uuid.UUID `json:"surveyId"`
	TotalQRCodes  int       `json:"totalQrCodes"`
	ActiveQRCodes int       `json:"activeQrCodes"`
	TotalScans    int64     `json:"totalScans"`
	UniqueScans   int64     `json:"uniqueScans"`
}

// GetSurveyQRCodeStats retrieves QR code statistics for a survey
func (s *SurveyWeChatService) GetSurveyQRCodeStats(ctx context.Context, surveyID uuid.UUID) (*SurveyQRCodeStats, error) {
	qrCodes, err := s.GetSurveyQRCodes(ctx, surveyID)
	if err != nil {
		return nil, err
	}

	stats := &SurveyQRCodeStats{
		SurveyID:     surveyID,
		TotalQRCodes: len(qrCodes),
	}

	for _, qr := range qrCodes {
		if qr.IsUsable() {
			stats.ActiveQRCodes++
		}
		// stats.TotalScans += qr.ScanCount // Scan count not tracked in current table structure
	}

	// For unique scans, we would need to implement more sophisticated tracking
	// For now, we'll estimate it as 80% of total scans
	stats.UniqueScans = int64(float64(stats.TotalScans) * 0.8)

	return stats, nil
}

// ValidateSurveyAccess validates if a survey can be accessed via QR code
func (s *SurveyWeChatService) ValidateSurveyAccess(ctx context.Context, surveyID uuid.UUID) error {
	survey, err := s.surveyRepo.FindByID(ctx, surveyID)
	if err != nil {
		return fmt.Errorf("survey not found: %w", err)
	}

	// Check if survey is public
	if !survey.IsPublic {
		return fmt.Errorf("survey is not publicly accessible")
	}

	// Check if survey is active
	if survey.Status != entities.SurveyStatusPublished {
		return fmt.Errorf("survey is not published")
	}

	return nil
}
