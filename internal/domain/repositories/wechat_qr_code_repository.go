package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// WeChatQrCodeRepository defines the interface for WeChatQrCode data operations
type WeChatQrCodeRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, qrCode *entities.WeChatQrCode) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.WeChatQrCode, error)
	GetAll(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error)
	Update(ctx context.Context, qrCode *entities.WeChatQrCode) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Resource-specific queries
	GetByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) ([]*entities.WeChatQrCode, error)
	GetActiveByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (*entities.WeChatQrCode, error)
	GetBySceneStr(ctx context.Context, sceneStr string) (*entities.WeChatQrCode, error)
	GetByTicket(ctx context.Context, ticket string) (*entities.WeChatQrCode, error)
	
	// Status-based queries
	GetActive(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error)
	GetExpired(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error)
	GetExpiring(ctx context.Context, within time.Duration) ([]*entities.WeChatQrCode, error)
	
	// Analytics queries
	GetMostScanned(ctx context.Context, limit int, days int) ([]*entities.WeChatQrCode, error)
	GetQRCodeStats(ctx context.Context, qrCodeId uuid.UUID) (*QRCodeStats, error)
	GetResourceQRStats(ctx context.Context, resourceId uuid.UUID, resourceType string) (*ResourceQRStats, error)
	
	// Maintenance operations
	MarkExpired(ctx context.Context, qrCodeIds []uuid.UUID) error
	CleanupExpired(ctx context.Context, olderThan time.Time) (int64, error)
	UpdateScanCount(ctx context.Context, qrCodeId uuid.UUID) error
	
	// Counting operations
	Count(ctx context.Context) (int64, error)
	CountByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (int64, error)
	CountActive(ctx context.Context) (int64, error)
	CountExpired(ctx context.Context) (int64, error)
}

// QRCodeStats represents QR code statistics
type QRCodeStats struct {
	QRCode       *entities.WeChatQrCode
	TotalScans   int64
	UniqueScans  int64
	DailyScans   []DailyScanStats
	TopScanTimes []ScanTimeStats
}

// ResourceQRStats represents QR code statistics for a resource
type ResourceQRStats struct {
	ResourceId   uuid.UUID
	ResourceType string
	TotalQRCodes int64
	ActiveQRCodes int64
	TotalScans   int64
	UniqueScans  int64
	QRCodes      []*entities.WeChatQrCode
}

// DailyScanStats represents daily scan statistics
type DailyScanStats struct {
	Date  time.Time
	Scans int64
}

// ScanTimeStats represents scan time statistics
type ScanTimeStats struct {
	Hour  int
	Scans int64
}
