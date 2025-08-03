package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormUserRepository implements UserRepository using GORM
type GormUserRepository struct {
	db *gorm.DB
}

// NewGormUserRepository creates a new GORM-based user repository
func NewGormUserRepository(db *gorm.DB) repositories.UserRepository {
	return &GormUserRepository{db: db}
}

// Create creates a new user
func (r *GormUserRepository) Create(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// GetByID retrieves a user by ID
func (r *GormUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByUserName retrieves a user by username
func (r *GormUserRepository) GetByUserName(ctx context.Context, userName string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).
		Where("user_name = ?", userName).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail retrieves a user by email
func (r *GormUserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).
		Where("email = ?", email).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByWeChatOpenID retrieves a user by WeChat OpenID
func (r *GormUserRepository) GetByWeChatOpenID(ctx context.Context, openID string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).
		Where("we_chat_open_id = ?", openID).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByWeChatUnionID retrieves a user by WeChat UnionID
func (r *GormUserRepository) GetByWeChatUnionID(ctx context.Context, unionID string) (*entities.User, error) {
	var user entities.User
	err := r.db.WithContext(ctx).
		Where("we_chat_union_id = ?", unionID).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetAll retrieves all users with pagination
func (r *GormUserRepository) GetAll(ctx context.Context, offset, limit int) ([]*entities.User, error) {
	var users []*entities.User
	err := r.db.WithContext(ctx).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&users).Error
	return users, err
}

// Update updates an existing user
func (r *GormUserRepository) Update(ctx context.Context, user *entities.User) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete soft deletes a user
func (r *GormUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.User{}, "id = ?", id).Error
}

// Count returns the total number of users
func (r *GormUserRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entities.User{}).Count(&count).Error
	return count, err
}

// GetActiveUsers retrieves all active users
func (r *GormUserRepository) GetActiveUsers(ctx context.Context, offset, limit int) ([]*entities.User, error) {
	var users []*entities.User
	err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Offset(offset).
		Limit(limit).
		Order("created_at DESC").
		Find(&users).Error
	return users, err
}
