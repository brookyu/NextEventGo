package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormWeChatQrCodeRepository implements WeChatQrCodeRepository using GORM
type GormWeChatQrCodeRepository struct {
	db *gorm.DB
}

// NewGormWeChatQrCodeRepository creates a new GORM-based WeChat QR code repository
func NewGormWeChatQrCodeRepository(db *gorm.DB) repositories.WeChatQrCodeRepository {
	return &GormWeChatQrCodeRepository{db: db}
}

// Create creates a new WeChat QR code
func (r *GormWeChatQrCodeRepository) Create(ctx context.Context, qrCode *entities.WeChatQrCode) error {
	return r.db.WithContext(ctx).Create(qrCode).Error
}

// GetByID retrieves a WeChat QR code by ID
func (r *GormWeChatQrCodeRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.WeChatQrCode, error) {
	var qrCode entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		First(&qrCode, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetAll retrieves all WeChat QR codes with pagination
func (r *GormWeChatQrCodeRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&qrCodes).Error
	return qrCodes, err
}

// GetByResource retrieves QR codes for a specific resource
func (r *GormWeChatQrCodeRepository) GetByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("resource_id = ? AND resource_type = ? AND is_deleted = ?", resourceId, resourceType, false).
		Order("CreationTime DESC").
		Find(&qrCodes).Error
	return qrCodes, err
}

// GetActiveByResource retrieves the active QR code for a resource
func (r *GormWeChatQrCodeRepository) GetActiveByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (*entities.WeChatQrCode, error) {
	var qrCode entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("resource_id = ? AND resource_type = ? AND is_active = ? AND status = ? AND is_deleted = ?", 
			resourceId, resourceType, true, entities.QRCodeStatusActive, false).
		First(&qrCode).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetBySceneStr retrieves a QR code by scene string
func (r *GormWeChatQrCodeRepository) GetBySceneStr(ctx context.Context, sceneStr string) (*entities.WeChatQrCode, error) {
	var qrCode entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("scene_str = ? AND is_deleted = ?", sceneStr, false).
		First(&qrCode).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetByTicket retrieves a QR code by WeChat ticket
func (r *GormWeChatQrCodeRepository) GetByTicket(ctx context.Context, ticket string) (*entities.WeChatQrCode, error) {
	var qrCode entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("ticket = ? AND is_deleted = ?", ticket, false).
		First(&qrCode).Error
	if err != nil {
		return nil, err
	}
	return &qrCode, nil
}

// GetActive retrieves active QR codes with pagination
func (r *GormWeChatQrCodeRepository) GetActive(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("is_active = ? AND status = ? AND is_deleted = ?", true, entities.QRCodeStatusActive, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&qrCodes).Error
	return qrCodes, err
}

// GetExpired retrieves expired QR codes with pagination
func (r *GormWeChatQrCodeRepository) GetExpired(ctx context.Context, offset, limit int) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	err := r.db.WithContext(ctx).
		Where("status = ? AND is_deleted = ?", entities.QRCodeStatusExpired, false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&qrCodes).Error
	return qrCodes, err
}

// GetExpiring retrieves QR codes that will expire within the specified duration
func (r *GormWeChatQrCodeRepository) GetExpiring(ctx context.Context, within time.Duration) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	expireTime := time.Now().Add(within)
	
	err := r.db.WithContext(ctx).
		Where("expire_time IS NOT NULL AND expire_time <= ? AND status = ? AND is_deleted = ?", 
			expireTime, entities.QRCodeStatusActive, false).
		Order("expire_time ASC").
		Find(&qrCodes).Error
	return qrCodes, err
}

// Update updates an existing WeChat QR code
func (r *GormWeChatQrCodeRepository) Update(ctx context.Context, qrCode *entities.WeChatQrCode) error {
	return r.db.WithContext(ctx).Save(qrCode).Error
}

// Delete soft deletes a WeChat QR code
func (r *GormWeChatQrCodeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_deleted":     true,
			"deletion_time":  gorm.Expr("NOW()"),
		}).Error
}

// Count returns the total number of QR codes
func (r *GormWeChatQrCodeRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("is_deleted = ?", false).
		Count(&count).Error
	return count, err
}

// CountByResource returns the number of QR codes for a resource
func (r *GormWeChatQrCodeRepository) CountByResource(ctx context.Context, resourceId uuid.UUID, resourceType string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("resource_id = ? AND resource_type = ? AND is_deleted = ?", resourceId, resourceType, false).
		Count(&count).Error
	return count, err
}

// CountActive returns the number of active QR codes
func (r *GormWeChatQrCodeRepository) CountActive(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("is_active = ? AND status = ? AND is_deleted = ?", true, entities.QRCodeStatusActive, false).
		Count(&count).Error
	return count, err
}

// CountExpired returns the number of expired QR codes
func (r *GormWeChatQrCodeRepository) CountExpired(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("status = ? AND is_deleted = ?", entities.QRCodeStatusExpired, false).
		Count(&count).Error
	return count, err
}

// GetMostScanned retrieves the most scanned QR codes
func (r *GormWeChatQrCodeRepository) GetMostScanned(ctx context.Context, limit int, days int) ([]*entities.WeChatQrCode, error) {
	var qrCodes []*entities.WeChatQrCode
	query := r.db.WithContext(ctx).
		Where("is_deleted = ?", false).
		Order("scan_count DESC").
		Limit(limit)
	
	if days > 0 {
		since := time.Now().AddDate(0, 0, -days)
		query = query.Where("CreationTime >= ?", since)
	}
	
	err := query.Find(&qrCodes).Error
	return qrCodes, err
}

// MarkExpired marks QR codes as expired
func (r *GormWeChatQrCodeRepository) MarkExpired(ctx context.Context, qrCodeIds []uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("id IN ?", qrCodeIds).
		Updates(map[string]interface{}{
			"status":    entities.QRCodeStatusExpired,
			"is_active": false,
		}).Error
}

// CleanupExpired removes expired QR codes older than the specified time
func (r *GormWeChatQrCodeRepository) CleanupExpired(ctx context.Context, olderThan time.Time) (int64, error) {
	result := r.db.WithContext(ctx).
		Where("status = ? AND expire_time < ?", entities.QRCodeStatusExpired, olderThan).
		Delete(&entities.WeChatQrCode{})
	return result.RowsAffected, result.Error
}

// UpdateScanCount increments the scan count for a QR code
func (r *GormWeChatQrCodeRepository) UpdateScanCount(ctx context.Context, qrCodeId uuid.UUID) error {
	now := time.Now()
	return r.db.WithContext(ctx).
		Model(&entities.WeChatQrCode{}).
		Where("id = ?", qrCodeId).
		Updates(map[string]interface{}{
			"scan_count":      gorm.Expr("scan_count + 1"),
			"last_scan_time":  &now,
		}).Error
}

// Placeholder implementations for analytics methods
func (r *GormWeChatQrCodeRepository) GetQRCodeStats(ctx context.Context, qrCodeId uuid.UUID) (*repositories.QRCodeStats, error) {
	qrCode, err := r.GetByID(ctx, qrCodeId)
	if err != nil {
		return nil, err
	}
	
	return &repositories.QRCodeStats{
		QRCode:     qrCode,
		TotalScans: qrCode.ScanCount,
		// Other fields would be populated with more complex queries
	}, nil
}

func (r *GormWeChatQrCodeRepository) GetResourceQRStats(ctx context.Context, resourceId uuid.UUID, resourceType string) (*repositories.ResourceQRStats, error) {
	qrCodes, err := r.GetByResource(ctx, resourceId, resourceType)
	if err != nil {
		return nil, err
	}
	
	totalQRCodes := int64(len(qrCodes))
	var activeQRCodes int64
	var totalScans int64
	
	for _, qr := range qrCodes {
		if qr.IsUsable() {
			activeQRCodes++
		}
		totalScans += qr.ScanCount
	}
	
	return &repositories.ResourceQRStats{
		ResourceId:    resourceId,
		ResourceType:  resourceType,
		TotalQRCodes:  totalQRCodes,
		ActiveQRCodes: activeQRCodes,
		TotalScans:    totalScans,
		QRCodes:       qrCodes,
	}, nil
}
