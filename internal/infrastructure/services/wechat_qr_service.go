package services

import (
	"context"
	"encoding/base64"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// WeChatQRService handles WeChat QR code generation and management for articles
type WeChatQRService struct {
	qrCodeRepo repositories.WeChatQrCodeRepository
	wechatSvc  services.WeChatService
	logger     *zap.Logger
	db         *gorm.DB
	config     *WeChatQRServiceConfig
}

// WeChatQRServiceConfig holds configuration for WeChat QR service
type WeChatQRServiceConfig struct {
	DefaultExpireSeconds  int    // Default expiration for temporary QR codes
	BaseURL               string // Base URL for article access
	EnableAnalytics       bool   // Enable QR code scan analytics
	MaxQRCodesPerResource int    // Maximum QR codes per resource
}

// NewWeChatQRService creates a new WeChat QR service
func NewWeChatQRService(
	qrCodeRepo repositories.WeChatQrCodeRepository,
	wechatSvc services.WeChatService,
	logger *zap.Logger,
	db *gorm.DB,
	config *WeChatQRServiceConfig,
) *WeChatQRService {
	return &WeChatQRService{
		qrCodeRepo: qrCodeRepo,
		wechatSvc:  wechatSvc,
		logger:     logger,
		db:         db,
		config:     config,
	}
}

// GenerateArticleQRCode generates a QR code for an article
func (s *WeChatQRService) GenerateArticleQRCode(ctx context.Context, articleId uuid.UUID, qrType entities.QRCodeType) (*entities.WeChatQrCode, error) {
	s.logger.Info("Generating QR code for article",
		zap.String("articleId", articleId.String()),
		zap.String("type", string(qrType)))

	// Check if we already have an active QR code for this article
	existingQR, err := s.qrCodeRepo.GetActiveByResource(ctx, articleId, "article")
	if err == nil && existingQR != nil && existingQR.IsUsable() {
		s.logger.Info("Using existing QR code", zap.String("qrCodeId", existingQR.ID.String()))
		return existingQR, nil
	}

	// Generate scene string for the article
	sceneStr := fmt.Sprintf("article_%s", articleId.String()[:8])

	// Create QR code entity
	qrCode := &entities.WeChatQrCode{
		ParamsValue:   articleId.String(),
		ParamKey:      "PREVIEW_ARTICLE",
		ParamUrl:      fmt.Sprintf("%s/articles/%s", s.config.BaseURL, articleId.String()),
		UserFor:       4, // Article preview type
		ExpireSeconds: s.config.DefaultExpireSeconds,
	}

	// Set expiration for temporary QR codes
	if qrType == entities.QRCodeTypeTemporary {
		expireTime := time.Now().Add(time.Duration(s.config.DefaultExpireSeconds) * time.Second)
		qrCode.ExpireTime = &expireTime
	}

	// Generate QR code through WeChat API
	var wechatQR *services.WeChatQRCodeInfo
	var err2 error

	if qrType == entities.QRCodeTypePermanent {
		wechatQR, err2 = s.wechatSvc.CreatePermanentQRCode(ctx, sceneStr)
	} else {
		wechatQR, err2 = s.wechatSvc.CreateQRCode(ctx, sceneStr, s.config.DefaultExpireSeconds)
	}

	if err2 != nil {
		return nil, fmt.Errorf("failed to create WeChat QR code: %w", err2)
	}

	// Update QR code with WeChat response
	qrCode.Ticket = wechatQR.Ticket
	qrCode.Url = wechatQR.URL

	// Generate QR code image from the URL
	qrImageData, err := s.generateQRCodeImage(wechatQR.URL)
	if err != nil {
		s.logger.Warn("Failed to generate QR code image, using URL only", zap.Error(err))
	} else {
		qrCode.QRCodeImageData = qrImageData
	}

	// Save to database
	if err := s.qrCodeRepo.Create(ctx, qrCode); err != nil {
		return nil, fmt.Errorf("failed to save QR code: %w", err)
	}

	s.logger.Info("Successfully generated QR code",
		zap.String("qrCodeId", qrCode.ID.String()),
		zap.String("ticket", qrCode.Ticket))

	return qrCode, nil
}

// GetArticleQRCode retrieves the active QR code for an article
func (s *WeChatQRService) GetArticleQRCode(ctx context.Context, articleId uuid.UUID) (*entities.WeChatQrCode, error) {
	return s.qrCodeRepo.GetActiveByResource(ctx, articleId, "article")
}

// GetAllArticleQRCodes retrieves all QR codes for an article
func (s *WeChatQRService) GetAllArticleQRCodes(ctx context.Context, articleId uuid.UUID) ([]*entities.WeChatQrCode, error) {
	return s.qrCodeRepo.GetByResource(ctx, articleId, "article")
}

// GenerateSurveyQRCode generates a QR code for a survey
func (s *WeChatQRService) GenerateSurveyQRCode(ctx context.Context, surveyId uuid.UUID, qrType entities.QRCodeType) (*entities.WeChatQrCode, error) {
	s.logger.Info("Generating QR code for survey",
		zap.String("surveyId", surveyId.String()),
		zap.String("type", string(qrType)))

	// Check if we already have an active QR code for this survey
	existingQR, err := s.qrCodeRepo.GetActiveByResource(ctx, surveyId, "survey")
	if err == nil && existingQR != nil && existingQR.IsUsable() {
		s.logger.Info("Using existing QR code", zap.String("qrCodeId", existingQR.ID.String()))
		return existingQR, nil
	}

	// Generate scene string for the survey
	sceneStr := fmt.Sprintf("survey_%s", surveyId.String()[:8])

	// Create QR code entity
	qrCode := &entities.WeChatQrCode{
		ParamsValue:   surveyId.String(),
		ParamKey:      "PREVIEW_SURVEY",
		ParamUrl:      fmt.Sprintf("%s/surveys/%s", s.config.BaseURL, surveyId.String()),
		UserFor:       5, // Survey preview type
		ExpireSeconds: s.config.DefaultExpireSeconds,
	}

	// Set expiration for temporary QR codes
	if qrType == entities.QRCodeTypeTemporary {
		expireTime := time.Now().Add(time.Duration(s.config.DefaultExpireSeconds) * time.Second)
		qrCode.ExpireTime = &expireTime
	}

	// Generate QR code through WeChat API
	var wechatQR *services.WeChatQRCodeInfo
	var err2 error

	if qrType == entities.QRCodeTypePermanent {
		wechatQR, err2 = s.wechatSvc.CreatePermanentQRCode(ctx, sceneStr)
	} else {
		wechatQR, err2 = s.wechatSvc.CreateQRCode(ctx, sceneStr, s.config.DefaultExpireSeconds)
	}

	if err2 != nil {
		return nil, fmt.Errorf("failed to create WeChat QR code: %w", err2)
	}

	// Update QR code with WeChat response
	qrCode.Ticket = wechatQR.Ticket
	qrCode.Url = wechatQR.URL

	// Generate QR code image from the URL
	qrImageData, err := s.generateQRCodeImage(wechatQR.URL)
	if err != nil {
		s.logger.Warn("Failed to generate QR code image, using URL only", zap.Error(err))
	} else {
		qrCode.QRCodeImageData = qrImageData
	}

	// Save to database
	if err := s.qrCodeRepo.Create(ctx, qrCode); err != nil {
		return nil, fmt.Errorf("failed to save QR code: %w", err)
	}

	s.logger.Info("Successfully generated survey QR code",
		zap.String("qrCodeId", qrCode.ID.String()),
		zap.String("ticket", qrCode.Ticket))

	return qrCode, nil
}

// GetSurveyQRCode retrieves the active QR code for a survey
func (s *WeChatQRService) GetSurveyQRCode(ctx context.Context, surveyId uuid.UUID) (*entities.WeChatQrCode, error) {
	return s.qrCodeRepo.GetActiveByResource(ctx, surveyId, "survey")
}

// GetAllSurveyQRCodes retrieves all QR codes for a survey
func (s *WeChatQRService) GetAllSurveyQRCodes(ctx context.Context, surveyId uuid.UUID) ([]*entities.WeChatQrCode, error) {
	return s.qrCodeRepo.GetByResource(ctx, surveyId, "survey")
}

// TrackQRCodeScan tracks a QR code scan
func (s *WeChatQRService) TrackQRCodeScan(ctx context.Context, sceneStr string, scanData *QRCodeScanData) error {
	// Find QR code by scene string
	qrCode, err := s.qrCodeRepo.GetBySceneStr(ctx, sceneStr)
	if err != nil {
		return fmt.Errorf("QR code not found: %w", err)
	}

	// Check if QR code is usable
	if !qrCode.IsUsable() {
		return fmt.Errorf("QR code is not usable (expired or revoked)")
	}

	// Update QR code in database (scan tracking would be handled separately)
	if err := s.qrCodeRepo.Update(ctx, qrCode); err != nil {
		s.logger.Error("Failed to update QR code", zap.Error(err))
	}

	// Track analytics if enabled
	if s.config.EnableAnalytics && scanData != nil {
		go s.trackScanAnalytics(qrCode, scanData)
	}

	s.logger.Info("QR code scan tracked",
		zap.String("qrCodeId", qrCode.ID.String()))

	return nil
}

// RevokeQRCode revokes a QR code
func (s *WeChatQRService) RevokeQRCode(ctx context.Context, qrCodeId uuid.UUID) error {
	qrCode, err := s.qrCodeRepo.GetByID(ctx, qrCodeId)
	if err != nil {
		return fmt.Errorf("QR code not found: %w", err)
	}

	// Mark as deleted (soft delete)
	qrCode.IsDeleted = true
	now := time.Now()
	qrCode.DeletedAt = &now

	if err := s.qrCodeRepo.Update(ctx, qrCode); err != nil {
		return fmt.Errorf("failed to revoke QR code: %w", err)
	}

	s.logger.Info("QR code revoked", zap.String("qrCodeId", qrCodeId.String()))
	return nil
}

// GetQRCodeStats retrieves statistics for a QR code
func (s *WeChatQRService) GetQRCodeStats(ctx context.Context, qrCodeId uuid.UUID) (*repositories.QRCodeStats, error) {
	return s.qrCodeRepo.GetQRCodeStats(ctx, qrCodeId)
}

// GetArticleQRStats retrieves QR code statistics for an article
func (s *WeChatQRService) GetArticleQRStats(ctx context.Context, articleId uuid.UUID) (*repositories.ResourceQRStats, error) {
	return s.qrCodeRepo.GetResourceQRStats(ctx, articleId, "article")
}

// CleanupExpiredQRCodes removes expired QR codes
func (s *WeChatQRService) CleanupExpiredQRCodes(ctx context.Context) error {
	cutoffTime := time.Now().Add(-24 * time.Hour) // Clean up codes expired more than 24 hours ago
	deleted, err := s.qrCodeRepo.CleanupExpired(ctx, cutoffTime)
	if err != nil {
		return fmt.Errorf("failed to cleanup expired QR codes: %w", err)
	}

	s.logger.Info("Cleaned up expired QR codes", zap.Int64("deleted", deleted))
	return nil
}

// MarkExpiredQRCodes marks QR codes as expired
func (s *WeChatQRService) MarkExpiredQRCodes(ctx context.Context) error {
	// Get QR codes that should be expired
	expiring := make([]uuid.UUID, 0)

	// This would typically be done with a database query
	// For now, we'll use the repository method to get expiring codes
	expiringCodes, err := s.qrCodeRepo.GetExpiring(ctx, 0) // Get codes that should be expired now
	if err != nil {
		return fmt.Errorf("failed to get expiring QR codes: %w", err)
	}

	for _, code := range expiringCodes {
		if code.IsExpired() {
			expiring = append(expiring, code.ID)
		}
	}

	if len(expiring) > 0 {
		if err := s.qrCodeRepo.MarkExpired(ctx, expiring); err != nil {
			return fmt.Errorf("failed to mark QR codes as expired: %w", err)
		}

		s.logger.Info("Marked QR codes as expired", zap.Int("count", len(expiring)))
	}

	return nil
}

// Helper methods

// generateQRCodeImage generates a QR code image from a URL and returns base64 encoded data
func (s *WeChatQRService) generateQRCodeImage(url string) (string, error) {
	// Generate QR code as PNG bytes
	qrBytes, err := qrcode.Encode(url, qrcode.Medium, 256)
	if err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}

	// Encode to base64
	base64Data := base64.StdEncoding.EncodeToString(qrBytes)

	// Return as data URL for direct use in HTML
	return "data:image/png;base64," + base64Data, nil
}

func (s *WeChatQRService) trackScanAnalytics(qrCode *entities.WeChatQrCode, scanData *QRCodeScanData) {
	// This would integrate with the analytics service to track QR code scans
	s.logger.Debug("Tracking QR code scan analytics",
		zap.String("qrCodeId", qrCode.ID.String()),
		zap.String("userId", scanData.UserId))
}

// Data structures for QR code operations

// QRCodeScanData represents data collected when a QR code is scanned
type QRCodeScanData struct {
	UserId     string
	OpenId     string
	UnionId    string
	IPAddress  string
	UserAgent  string
	ScanTime   time.Time
	DeviceType string
	Platform   string
	Location   string
}

// QRCodeGenerationRequest represents a request to generate a QR code
type QRCodeGenerationRequest struct {
	ResourceId    uuid.UUID
	ResourceType  string
	QRCodeType    entities.QRCodeType
	ExpireSeconds *int
	MaxScans      *int
	Description   string
}

// QRCodeResponse represents a QR code response
type QRCodeResponse struct {
	ID           uuid.UUID             `json:"id"`
	ResourceId   uuid.UUID             `json:"resourceId"`
	ResourceType string                `json:"resourceType"`
	SceneStr     string                `json:"sceneStr"`
	QRCodeUrl    string                `json:"qrCodeUrl"`
	QRCodeType   entities.QRCodeType   `json:"qrCodeType"`
	Status       entities.QRCodeStatus `json:"status"`
	ScanCount    int64                 `json:"scanCount"`
	IsActive     bool                  `json:"isActive"`
	ExpireTime   *time.Time            `json:"expireTime,omitempty"`
	CreatedAt    time.Time             `json:"createdAt"`
}
