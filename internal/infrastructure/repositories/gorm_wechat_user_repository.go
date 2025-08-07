package repositories

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"gorm.io/gorm"
)

// GormWeChatUserRepository implements WeChatUserRepository using GORM
type GormWeChatUserRepository struct {
	db *gorm.DB
}

// NewGormWeChatUserRepository creates a new GORM-based WeChat user repository
func NewGormWeChatUserRepository(db *gorm.DB) repositories.WeChatUserRepository {
	return &GormWeChatUserRepository{db: db}
}

// Create creates a new WeChat user
func (r *GormWeChatUserRepository) Create(ctx context.Context, user *entities.WeChatUser) error {
	return r.db.WithContext(ctx).Create(user).Error
}

// GetByID retrieves a WeChat user by ID
func (r *GormWeChatUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.WeChatUser, error) {
	var user entities.WeChatUser
	err := r.db.WithContext(ctx).First(&user, "Id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByOpenID retrieves a WeChat user by OpenID
func (r *GormWeChatUserRepository) GetByOpenID(ctx context.Context, openID string) (*entities.WeChatUser, error) {
	var user entities.WeChatUser
	err := r.db.WithContext(ctx).Where("OpenId = ?", openID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByUnionID retrieves a WeChat user by UnionID
func (r *GormWeChatUserRepository) GetByUnionID(ctx context.Context, unionID string) (*entities.WeChatUser, error) {
	var user entities.WeChatUser
	err := r.db.WithContext(ctx).Where("UnionId = ?", unionID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update updates an existing WeChat user
func (r *GormWeChatUserRepository) Update(ctx context.Context, user *entities.WeChatUser) error {
	return r.db.WithContext(ctx).Save(user).Error
}

// Delete soft deletes a WeChat user
func (r *GormWeChatUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.WeChatUser{}, "Id = ?", id).Error
}

// GetAll retrieves all WeChat users with filtering and pagination
func (r *GormWeChatUserRepository) GetAll(ctx context.Context, filter repositories.WeChatUserFilter) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser

	query := r.db.WithContext(ctx).Model(&entities.WeChatUser{})

	// Apply filters
	query = r.applyFilters(query, filter)

	// Apply sorting
	if filter.SortBy != "" {
		order := filter.SortBy
		if filter.SortOrder == "desc" {
			order += " DESC"
		} else {
			order += " ASC"
		}
		query = query.Order(order)
	} else {
		query = query.Order("CreationTime DESC")
	}

	// Apply pagination
	if filter.Limit > 0 {
		query = query.Limit(filter.Limit)
	}
	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	err := query.Find(&users).Error
	return users, err
}

// Count returns the total number of WeChat users matching the filter
func (r *GormWeChatUserRepository) Count(ctx context.Context, filter repositories.WeChatUserFilter) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&entities.WeChatUser{})
	query = r.applyFilters(query, filter)
	err := query.Count(&count).Error
	return count, err
}

// GetSubscribed retrieves subscribed WeChat users
func (r *GormWeChatUserRepository) GetSubscribed(ctx context.Context, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("Subscribe = ?", true).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// GetUnsubscribed retrieves unsubscribed WeChat users
func (r *GormWeChatUserRepository) GetUnsubscribed(ctx context.Context, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("Subscribe = ?", false).
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// CountSubscribed returns the number of subscribed users
func (r *GormWeChatUserRepository) CountSubscribed(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatUser{}).
		Where("Subscribe = ?", true).
		Count(&count).Error
	return count, err
}

// CountUnsubscribed returns the number of unsubscribed users
func (r *GormWeChatUserRepository) CountUnsubscribed(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatUser{}).
		Where("Subscribe = ?", false).
		Count(&count).Error
	return count, err
}

// GetNewUsersInPeriod retrieves users created within a time period
func (r *GormWeChatUserRepository) GetNewUsersInPeriod(ctx context.Context, start, end time.Time) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("CreationTime BETWEEN ? AND ?", start, end).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// CountNewUsersInPeriod returns the count of users created within a time period
func (r *GormWeChatUserRepository) CountNewUsersInPeriod(ctx context.Context, start, end time.Time) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatUser{}).
		Where("CreationTime BETWEEN ? AND ?", start, end).
		Count(&count).Error
	return count, err
}

// GetActiveUsers retrieves users who have been active within the specified days
func (r *GormWeChatUserRepository) GetActiveUsers(ctx context.Context, days int, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	cutoff := time.Now().AddDate(0, 0, -days)
	err := r.db.WithContext(ctx).
		Where("LastModificationTime >= ? OR CreationTime >= ?", cutoff, cutoff).
		Offset(offset).
		Limit(limit).
		Order("LastModificationTime DESC").
		Find(&users).Error
	return users, err
}

// CountActiveUsers returns the count of active users within the specified days
func (r *GormWeChatUserRepository) CountActiveUsers(ctx context.Context, days int) (int64, error) {
	var count int64
	cutoff := time.Now().AddDate(0, 0, -days)
	err := r.db.WithContext(ctx).
		Model(&entities.WeChatUser{}).
		Where("LastModificationTime >= ? OR CreationTime >= ?", cutoff, cutoff).
		Count(&count).Error
	return count, err
}

// SearchByNickname searches users by nickname
func (r *GormWeChatUserRepository) SearchByNickname(ctx context.Context, nickname string, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("NickName LIKE ?", "%"+nickname+"%").
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// SearchByRealName searches users by real name
func (r *GormWeChatUserRepository) SearchByRealName(ctx context.Context, realName string, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("RealName LIKE ?", "%"+realName+"%").
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// SearchByCompany searches users by company name
func (r *GormWeChatUserRepository) SearchByCompany(ctx context.Context, company string, offset, limit int) ([]*entities.WeChatUser, error) {
	var users []*entities.WeChatUser
	err := r.db.WithContext(ctx).
		Where("CompanyName LIKE ?", "%"+company+"%").
		Offset(offset).
		Limit(limit).
		Order("CreationTime DESC").
		Find(&users).Error
	return users, err
}

// BulkUpdateSubscription updates subscription status for multiple users
func (r *GormWeChatUserRepository) BulkUpdateSubscription(ctx context.Context, openIDs []string, subscribed bool) error {
	return r.db.WithContext(ctx).
		Model(&entities.WeChatUser{}).
		Where("OpenId IN ?", openIDs).
		Update("Subscribe", subscribed).Error
}

// BulkDelete deletes multiple users
func (r *GormWeChatUserRepository) BulkDelete(ctx context.Context, ids []uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entities.WeChatUser{}, "Id IN ?", ids).Error
}

// applyFilters applies filtering conditions to the query
func (r *GormWeChatUserRepository) applyFilters(query *gorm.DB, filter repositories.WeChatUserFilter) *gorm.DB {
	// Search filter
	if filter.Search != "" {
		searchTerm := "%" + filter.Search + "%"
		query = query.Where("NickName LIKE ? OR RealName LIKE ? OR CompanyName LIKE ? OR Email LIKE ?",
			searchTerm, searchTerm, searchTerm, searchTerm)
	}

	// Subscription filter
	if filter.Subscribe != nil {
		query = query.Where("Subscribe = ?", *filter.Subscribe)
	}

	// Gender filter
	if filter.Sex != nil {
		query = query.Where("Sex = ?", *filter.Sex)
	}

	// Location filters
	if filter.City != "" {
		query = query.Where("City = ?", filter.City)
	}
	if filter.Province != "" {
		query = query.Where("Province = ?", filter.Province)
	}
	if filter.Country != "" {
		query = query.Where("Country = ?", filter.Country)
	}

	// Date range filters
	if filter.SubscribeTimeStart != nil {
		query = query.Where("SubscribeTime >= ?", *filter.SubscribeTimeStart)
	}
	if filter.SubscribeTimeEnd != nil {
		query = query.Where("SubscribeTime <= ?", *filter.SubscribeTimeEnd)
	}
	if filter.CreatedAtStart != nil {
		query = query.Where("CreationTime >= ?", *filter.CreatedAtStart)
	}
	if filter.CreatedAtEnd != nil {
		query = query.Where("CreationTime <= ?", *filter.CreatedAtEnd)
	}

	return query
}

// GetUserStatistics returns comprehensive statistics about WeChat users
func (r *GormWeChatUserRepository) GetUserStatistics(ctx context.Context) (*repositories.WeChatUserStatistics, error) {
	stats := &repositories.WeChatUserStatistics{}

	// Total users
	err := r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Count(&stats.TotalUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count total users: %w", err)
	}

	// Subscribed users
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("Subscribe = ?", true).Count(&stats.SubscribedUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count subscribed users: %w", err)
	}

	// Unsubscribed users
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("Subscribe = ?", false).Count(&stats.UnsubscribedUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count unsubscribed users: %w", err)
	}

	// New users this week
	weekAgo := time.Now().AddDate(0, 0, -7)
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("CreationTime >= ?", weekAgo).Count(&stats.NewUsersThisWeek).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count new users this week: %w", err)
	}

	// New users this month
	monthAgo := time.Now().AddDate(0, -1, 0)
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("CreationTime >= ?", monthAgo).Count(&stats.NewUsersThisMonth).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count new users this month: %w", err)
	}

	// Active users today
	today := time.Now().Truncate(24 * time.Hour)
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).
		Where("LastModificationTime >= ? OR CreationTime >= ?", today, today).
		Count(&stats.ActiveUsersToday).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count active users today: %w", err)
	}

	// Active users this week
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).
		Where("LastModificationTime >= ? OR CreationTime >= ?", weekAgo, weekAgo).
		Count(&stats.ActiveUsersWeek).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count active users this week: %w", err)
	}

	// Gender distribution
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("Sex = ?", 1).Count(&stats.MaleUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count male users: %w", err)
	}

	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("Sex = ?", 2).Count(&stats.FemaleUsers).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count female users: %w", err)
	}

	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).Where("Sex = ? OR Sex IS NULL", 0).Count(&stats.UnknownSex).Error
	if err != nil {
		return nil, fmt.Errorf("failed to count unknown sex users: %w", err)
	}

	// Top cities
	var cityResults []struct {
		City  string `json:"city"`
		Count int64  `json:"count"`
	}
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).
		Select("City as city, COUNT(*) as count").
		Where("City != '' AND City IS NOT NULL").
		Group("City").
		Order("count DESC").
		Limit(10).
		Find(&cityResults).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get top cities: %w", err)
	}

	for _, result := range cityResults {
		stats.TopCities = append(stats.TopCities, repositories.CityStats{
			City:  result.City,
			Count: result.Count,
		})
	}

	// Top provinces
	var provinceResults []struct {
		Province string `json:"province"`
		Count    int64  `json:"count"`
	}
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).
		Select("Province as province, COUNT(*) as count").
		Where("Province != '' AND Province IS NOT NULL").
		Group("Province").
		Order("count DESC").
		Limit(10).
		Find(&provinceResults).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get top provinces: %w", err)
	}

	for _, result := range provinceResults {
		stats.TopProvinces = append(stats.TopProvinces, repositories.ProvinceStats{
			Province: result.Province,
			Count:    result.Count,
		})
	}

	// Top countries
	var countryResults []struct {
		Country string `json:"country"`
		Count   int64  `json:"count"`
	}
	err = r.db.WithContext(ctx).Model(&entities.WeChatUser{}).
		Select("Country as country, COUNT(*) as count").
		Where("Country != '' AND Country IS NOT NULL").
		Group("Country").
		Order("count DESC").
		Limit(10).
		Find(&countryResults).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get top countries: %w", err)
	}

	for _, result := range countryResults {
		stats.TopCountries = append(stats.TopCountries, repositories.CountryStats{
			Country: result.Country,
			Count:   result.Count,
		})
	}

	return stats, nil
}
