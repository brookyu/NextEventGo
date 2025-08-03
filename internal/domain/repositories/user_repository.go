package repositories

import (
	"context"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// UserRepository defines the interface for User data operations
type UserRepository interface {
	// Create creates a new user
	Create(ctx context.Context, user *entities.User) error
	
	// GetByID retrieves a user by ID
	GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error)
	
	// GetByUserName retrieves a user by username
	GetByUserName(ctx context.Context, userName string) (*entities.User, error)
	
	// GetByEmail retrieves a user by email
	GetByEmail(ctx context.Context, email string) (*entities.User, error)
	
	// GetByWeChatOpenID retrieves a user by WeChat OpenID
	GetByWeChatOpenID(ctx context.Context, openID string) (*entities.User, error)
	
	// GetByWeChatUnionID retrieves a user by WeChat UnionID
	GetByWeChatUnionID(ctx context.Context, unionID string) (*entities.User, error)
	
	// GetAll retrieves all users with pagination
	GetAll(ctx context.Context, offset, limit int) ([]*entities.User, error)
	
	// Update updates an existing user
	Update(ctx context.Context, user *entities.User) error
	
	// Delete soft deletes a user
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Count returns the total number of users
	Count(ctx context.Context) (int64, error)
	
	// GetActiveUsers retrieves all active users
	GetActiveUsers(ctx context.Context, offset, limit int) ([]*entities.User, error)
}
