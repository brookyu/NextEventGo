package repositories

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
)

// WeChatUserRepository defines the interface for WeChatUser data operations
type WeChatUserRepository interface {
	// Basic CRUD operations
	Create(ctx context.Context, user *entities.WeChatUser) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.WeChatUser, error)
	GetByOpenID(ctx context.Context, openID string) (*entities.WeChatUser, error)
	GetByUnionID(ctx context.Context, unionID string) (*entities.WeChatUser, error)
	Update(ctx context.Context, user *entities.WeChatUser) error
	Delete(ctx context.Context, id uuid.UUID) error

	// List operations with filtering and pagination
	GetAll(ctx context.Context, filter WeChatUserFilter) ([]*entities.WeChatUser, error)
	Count(ctx context.Context, filter WeChatUserFilter) (int64, error)

	// Subscription-based queries
	GetSubscribed(ctx context.Context, offset, limit int) ([]*entities.WeChatUser, error)
	GetUnsubscribed(ctx context.Context, offset, limit int) ([]*entities.WeChatUser, error)
	CountSubscribed(ctx context.Context) (int64, error)
	CountUnsubscribed(ctx context.Context) (int64, error)

	// Analytics queries
	GetNewUsersInPeriod(ctx context.Context, start, end time.Time) ([]*entities.WeChatUser, error)
	CountNewUsersInPeriod(ctx context.Context, start, end time.Time) (int64, error)
	GetActiveUsers(ctx context.Context, days int, offset, limit int) ([]*entities.WeChatUser, error)
	CountActiveUsers(ctx context.Context, days int) (int64, error)

	// Search operations
	SearchByNickname(ctx context.Context, nickname string, offset, limit int) ([]*entities.WeChatUser, error)
	SearchByRealName(ctx context.Context, realName string, offset, limit int) ([]*entities.WeChatUser, error)
	SearchByCompany(ctx context.Context, company string, offset, limit int) ([]*entities.WeChatUser, error)

	// Bulk operations
	BulkUpdateSubscription(ctx context.Context, openIDs []string, subscribed bool) error
	BulkDelete(ctx context.Context, ids []uuid.UUID) error

	// Statistics
	GetUserStatistics(ctx context.Context) (*WeChatUserStatistics, error)
}

// WeChatUserFilter represents filtering options for WeChat users
type WeChatUserFilter struct {
	// Pagination
	Offset int
	Limit  int

	// Search
	Search string // Search in nickname, real name, company name

	// Filters
	Subscribe *bool   // Filter by subscription status
	Sex       *int    // Filter by gender
	City      string  // Filter by city
	Province  string  // Filter by province
	Country   string  // Filter by country

	// Date range filters
	SubscribeTimeStart *time.Time
	SubscribeTimeEnd   *time.Time
	CreatedAtStart     *time.Time
	CreatedAtEnd       *time.Time

	// Sorting
	SortBy    string // Field to sort by
	SortOrder string // asc or desc
}

// WeChatUserStatistics represents statistics for WeChat users
type WeChatUserStatistics struct {
	TotalUsers        int64 `json:"totalUsers"`
	SubscribedUsers   int64 `json:"subscribedUsers"`
	UnsubscribedUsers int64 `json:"unsubscribedUsers"`
	NewUsersThisWeek  int64 `json:"newUsersThisWeek"`
	NewUsersThisMonth int64 `json:"newUsersThisMonth"`
	ActiveUsersToday  int64 `json:"activeUsersToday"`
	ActiveUsersWeek   int64 `json:"activeUsersWeek"`
	
	// Gender distribution
	MaleUsers   int64 `json:"maleUsers"`
	FemaleUsers int64 `json:"femaleUsers"`
	UnknownSex  int64 `json:"unknownSex"`
	
	// Geographic distribution
	TopCities     []CityStats     `json:"topCities"`
	TopProvinces  []ProvinceStats `json:"topProvinces"`
	TopCountries  []CountryStats  `json:"topCountries"`
}

// CityStats represents user statistics by city
type CityStats struct {
	City  string `json:"city"`
	Count int64  `json:"count"`
}

// ProvinceStats represents user statistics by province
type ProvinceStats struct {
	Province string `json:"province"`
	Count    int64  `json:"count"`
}

// CountryStats represents user statistics by country
type CountryStats struct {
	Country string `json:"country"`
	Count   int64  `json:"count"`
}
