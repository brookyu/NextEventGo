package controllers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zenteam/nextevent-go/internal/domain/entities"
	"github.com/zenteam/nextevent-go/internal/domain/repositories"
	"go.uber.org/zap"
)

// WeChatUsersController handles WeChat user management endpoints
type WeChatUsersController struct {
	wechatUserRepo repositories.WeChatUserRepository
	logger         *zap.Logger
}

// NewWeChatUsersController creates a new WeChat users controller
func NewWeChatUsersController(wechatUserRepo repositories.WeChatUserRepository, logger *zap.Logger) *WeChatUsersController {
	return &WeChatUsersController{
		wechatUserRepo: wechatUserRepo,
		logger:         logger,
	}
}

// GetWeChatUsers handles GET /wechat/users
func (c *WeChatUsersController) GetWeChatUsers(ctx *gin.Context) {
	// Parse query parameters
	filter := repositories.WeChatUserFilter{}

	// Pagination
	if offset := ctx.Query("offset"); offset != "" {
		if val, err := strconv.Atoi(offset); err == nil {
			filter.Offset = val
		}
	}

	if limit := ctx.Query("limit"); limit != "" {
		if val, err := strconv.Atoi(limit); err == nil {
			filter.Limit = val
		}
	} else {
		filter.Limit = 20 // Default limit
	}

	// Search
	filter.Search = ctx.Query("search")

	// Subscription filter
	if subscribe := ctx.Query("subscribe"); subscribe != "" {
		if val, err := strconv.ParseBool(subscribe); err == nil {
			filter.Subscribe = &val
		}
	}

	// Gender filter
	if sex := ctx.Query("sex"); sex != "" {
		if val, err := strconv.Atoi(sex); err == nil {
			filter.Sex = &val
		}
	}

	// Location filters
	filter.City = ctx.Query("city")
	filter.Province = ctx.Query("province")
	filter.Country = ctx.Query("country")

	// Sorting
	sortBy := ctx.Query("sortBy")
	if sortBy == "" {
		filter.SortBy = "CreationTime"
	} else {
		// Map frontend field names to database column names
		switch sortBy {
		case "createdAt":
			filter.SortBy = "CreationTime"
		case "updatedAt":
			filter.SortBy = "LastModificationTime"
		case "subscribeTime":
			filter.SortBy = "SubscribeTime"
		case "nickname":
			filter.SortBy = "NickName"
		case "realName":
			filter.SortBy = "RealName"
		case "companyName":
			filter.SortBy = "CompanyName"
		case "email":
			filter.SortBy = "Email"
		case "mobile":
			filter.SortBy = "Mobile"
		case "city":
			filter.SortBy = "City"
		case "province":
			filter.SortBy = "Province"
		case "country":
			filter.SortBy = "Country"
		default:
			// If the field name is not recognized, use it as-is (might be a direct database column name)
			filter.SortBy = sortBy
		}
	}

	filter.SortOrder = ctx.Query("sortOrder")
	if filter.SortOrder == "" {
		filter.SortOrder = "desc"
	}

	// Date range filters
	if start := ctx.Query("createdAtStart"); start != "" {
		if t, err := time.Parse(time.RFC3339, start); err == nil {
			filter.CreatedAtStart = &t
		}
	}

	if end := ctx.Query("createdAtEnd"); end != "" {
		if t, err := time.Parse(time.RFC3339, end); err == nil {
			filter.CreatedAtEnd = &t
		}
	}

	// Get users
	users, err := c.wechatUserRepo.GetAll(ctx.Request.Context(), filter)
	if err != nil {
		c.logger.Error("Failed to get WeChat users", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve WeChat users",
		})
		return
	}

	// Get total count
	totalCount, err := c.wechatUserRepo.Count(ctx.Request.Context(), repositories.WeChatUserFilter{
		Search:    filter.Search,
		Subscribe: filter.Subscribe,
		Sex:       filter.Sex,
		City:      filter.City,
		Province:  filter.Province,
		Country:   filter.Country,
	})
	if err != nil {
		c.logger.Error("Failed to count WeChat users", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to count WeChat users",
		})
		return
	}

	// Convert to response format
	var responseUsers []map[string]interface{}
	for _, user := range users {
		responseUsers = append(responseUsers, map[string]interface{}{
			"id":              user.ID,
			"openId":          user.OpenID,
			"unionId":         user.UnionID,
			"nickname":        user.NickName,
			"realName":        user.RealName,
			"companyName":     user.CompanyName,
			"position":        user.Position,
			"email":           user.Email,
			"mobile":          user.Mobile,
			"sex":             user.Sex,
			"city":            user.City,
			"country":         user.Country,
			"province":        user.Province,
			"language":        user.Language,
			"headImgUrl":      user.HeadImgUrl,
			"subscribe":       user.Subscribe,
			"subscribeTime":   user.SubscribeTime,
			"groupId":         user.GroupID,
			"remark":          user.Remark,
			"isConfirmed":     user.IsConfirmed,
			"allowTest":       user.AllowTest,
			"isHidden":        user.IsHidden,
			"currentEventId":  user.CurrentEventID,
			"telephone":       user.Telephone,
			"workAddress":     user.WorkAddress,
			"qrCodeValue":     user.QrCodeValue,
			"bizCardSavePath": user.BizCardSavePath,
			"createdAt":       user.CreatedAt,
			"updatedAt":       user.UpdatedAt,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"users": responseUsers,
		"pagination": gin.H{
			"offset": filter.Offset,
			"limit":  filter.Limit,
			"count":  len(users),
			"total":  totalCount,
		},
	})
}

// GetWeChatUser handles GET /wechat/users/:openId
func (c *WeChatUsersController) GetWeChatUser(ctx *gin.Context) {
	openId := ctx.Param("openId")
	if openId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "OpenID is required",
		})
		return
	}

	user, err := c.wechatUserRepo.GetByOpenID(ctx.Request.Context(), openId)
	if err != nil {
		c.logger.Error("Failed to get WeChat user", zap.String("openId", openId), zap.Error(err))
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "WeChat user not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, map[string]interface{}{
		"id":              user.ID,
		"openId":          user.OpenID,
		"unionId":         user.UnionID,
		"nickname":        user.NickName,
		"realName":        user.RealName,
		"companyName":     user.CompanyName,
		"position":        user.Position,
		"email":           user.Email,
		"mobile":          user.Mobile,
		"sex":             user.Sex,
		"city":            user.City,
		"country":         user.Country,
		"province":        user.Province,
		"language":        user.Language,
		"headImgUrl":      user.HeadImgUrl,
		"subscribe":       user.Subscribe,
		"subscribeTime":   user.SubscribeTime,
		"groupId":         user.GroupID,
		"remark":          user.Remark,
		"isConfirmed":     user.IsConfirmed,
		"allowTest":       user.AllowTest,
		"isHidden":        user.IsHidden,
		"currentEventId":  user.CurrentEventID,
		"telephone":       user.Telephone,
		"workAddress":     user.WorkAddress,
		"qrCodeValue":     user.QrCodeValue,
		"bizCardSavePath": user.BizCardSavePath,
		"createdAt":       user.CreatedAt,
		"updatedAt":       user.UpdatedAt,
	})
}

// CreateWeChatUser handles POST /wechat/users
func (c *WeChatUsersController) CreateWeChatUser(ctx *gin.Context) {
	var req struct {
		OpenID      string `json:"openId" binding:"required"`
		UnionID     string `json:"unionId"`
		NickName    string `json:"nickname" binding:"required"`
		RealName    string `json:"realName"`
		CompanyName string `json:"companyName"`
		Position    string `json:"position"`
		Email       string `json:"email"`
		Mobile      string `json:"mobile"`
		Sex         int    `json:"sex"`
		City        string `json:"city"`
		Country     string `json:"country"`
		Province    string `json:"province"`
		Language    string `json:"language"`
		HeadImgUrl  string `json:"headImgUrl"`
		Subscribe   bool   `json:"subscribe"`
		GroupId     *int   `json:"groupId"`
		Remark      string `json:"remark"`
		Telephone   string `json:"telephone"`
		WorkAddress string `json:"workAddress"`
		QrCodeValue string `json:"qrCodeValue"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Check if user already exists
	existingUser, _ := c.wechatUserRepo.GetByOpenID(ctx.Request.Context(), req.OpenID)
	if existingUser != nil {
		ctx.JSON(http.StatusConflict, gin.H{
			"error": "WeChat user with this OpenID already exists",
		})
		return
	}

	// Create new user
	user := &entities.WeChatUser{
		OpenID:    req.OpenID,
		NickName:  req.NickName,
		Sex:       req.Sex,
		Subscribe: req.Subscribe,
	}

	// Set optional string fields
	if req.UnionID != "" {
		user.UnionID = &req.UnionID
	}
	if req.RealName != "" {
		user.RealName = &req.RealName
	}
	if req.CompanyName != "" {
		user.CompanyName = &req.CompanyName
	}
	if req.Position != "" {
		user.Position = &req.Position
	}
	if req.Email != "" {
		user.Email = &req.Email
	}
	if req.Mobile != "" {
		user.Mobile = &req.Mobile
	}
	if req.City != "" {
		user.City = &req.City
	}
	if req.Country != "" {
		user.Country = &req.Country
	}
	if req.Province != "" {
		user.Province = &req.Province
	}
	if req.Language != "" {
		user.Language = &req.Language
	}
	if req.HeadImgUrl != "" {
		user.HeadImgUrl = &req.HeadImgUrl
	}
	if req.Remark != "" {
		user.Remark = &req.Remark
	}
	if req.Telephone != "" {
		user.Telephone = &req.Telephone
	}
	if req.WorkAddress != "" {
		user.WorkAddress = &req.WorkAddress
	}
	if req.QrCodeValue != "" {
		user.QrCodeValue = &req.QrCodeValue
	}
	if req.GroupId != nil {
		user.GroupID = req.GroupId
	}

	err := c.wechatUserRepo.Create(ctx.Request.Context(), user)
	if err != nil {
		c.logger.Error("Failed to create WeChat user", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create WeChat user",
		})
		return
	}

	ctx.JSON(http.StatusCreated, map[string]interface{}{
		"id":              user.ID,
		"openId":          user.OpenID,
		"unionId":         user.UnionID,
		"nickname":        user.NickName,
		"realName":        user.RealName,
		"companyName":     user.CompanyName,
		"position":        user.Position,
		"email":           user.Email,
		"mobile":          user.Mobile,
		"sex":             user.Sex,
		"city":            user.City,
		"country":         user.Country,
		"province":        user.Province,
		"language":        user.Language,
		"headImgUrl":      user.HeadImgUrl,
		"subscribe":       user.Subscribe,
		"subscribeTime":   user.SubscribeTime,
		"groupId":         user.GroupID,
		"remark":          user.Remark,
		"isConfirmed":     user.IsConfirmed,
		"allowTest":       user.AllowTest,
		"isHidden":        user.IsHidden,
		"currentEventId":  user.CurrentEventID,
		"telephone":       user.Telephone,
		"workAddress":     user.WorkAddress,
		"qrCodeValue":     user.QrCodeValue,
		"bizCardSavePath": user.BizCardSavePath,
		"createdAt":       user.CreatedAt,
		"updatedAt":       user.UpdatedAt,
	})
}

// UpdateWeChatUser handles PUT /wechat/users/:openId
func (c *WeChatUsersController) UpdateWeChatUser(ctx *gin.Context) {
	openId := ctx.Param("openId")
	if openId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "OpenID is required",
		})
		return
	}

	var req struct {
		NickName       string `json:"nickname"`
		RealName       string `json:"realName"`
		CompanyName    string `json:"companyName"`
		Position       string `json:"position"`
		Email          string `json:"email"`
		Mobile         string `json:"mobile"`
		Sex            *int   `json:"sex"`
		City           string `json:"city"`
		Country        string `json:"country"`
		Province       string `json:"province"`
		Language       string `json:"language"`
		HeadImgUrl     string `json:"headImgUrl"`
		Subscribe      *bool  `json:"subscribe"`
		SubscribeScene string `json:"subscribeScene"`
		QrScene        string `json:"qrScene"`
		QrSceneStr     string `json:"qrSceneStr"`
		GroupId        string `json:"groupId"`
		Remark         string `json:"remark"`
		TagIdList      string `json:"tagIdList"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// Get existing user
	user, err := c.wechatUserRepo.GetByOpenID(ctx.Request.Context(), openId)
	if err != nil {
		c.logger.Error("Failed to get WeChat user for update", zap.String("openId", openId), zap.Error(err))
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "WeChat user not found",
		})
		return
	}

	// Update fields
	if req.NickName != "" {
		user.NickName = req.NickName
	}
	if req.RealName != "" {
		user.RealName = &req.RealName
	}
	if req.CompanyName != "" {
		user.CompanyName = &req.CompanyName
	}
	if req.Position != "" {
		user.Position = &req.Position
	}
	if req.Email != "" {
		user.Email = &req.Email
	}
	if req.Mobile != "" {
		user.Mobile = &req.Mobile
	}
	if req.Sex != nil {
		user.Sex = *req.Sex
	}
	if req.City != "" {
		user.City = &req.City
	}
	if req.Country != "" {
		user.Country = &req.Country
	}
	if req.Province != "" {
		user.Province = &req.Province
	}
	if req.Language != "" {
		user.Language = &req.Language
	}
	if req.HeadImgUrl != "" {
		user.HeadImgUrl = &req.HeadImgUrl
	}
	if req.Subscribe != nil {
		user.Subscribe = *req.Subscribe
	}
	if req.GroupId != "" {
		// Convert string to int pointer for GroupID
		if groupID, err := strconv.Atoi(req.GroupId); err == nil {
			user.GroupID = &groupID
		}
	}
	if req.Remark != "" {
		user.Remark = &req.Remark
	}
	// Note: SubscribeScene, QrScene, QrSceneStr, TagIdList fields are not in current entity
	// They may need to be added to the entity if required

	err = c.wechatUserRepo.Update(ctx.Request.Context(), user)
	if err != nil {
		c.logger.Error("Failed to update WeChat user", zap.String("openId", openId), zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update WeChat user",
		})
		return
	}

	ctx.JSON(http.StatusOK, map[string]interface{}{
		"id":            user.ID,
		"openId":        user.OpenID,
		"unionId":       user.UnionID,
		"nickname":      user.NickName,
		"realName":      user.RealName,
		"companyName":   user.CompanyName,
		"position":      user.Position,
		"email":         user.Email,
		"mobile":        user.Mobile,
		"sex":           user.Sex,
		"city":          user.City,
		"country":       user.Country,
		"province":      user.Province,
		"language":      user.Language,
		"headImgUrl":    user.HeadImgUrl,
		"subscribe":     user.Subscribe,
		"subscribeTime": user.SubscribeTime,
		"groupId":       user.GroupID,
		"remark":        user.Remark,
		// Note: unsubscribeTime, subscribeScene, qrScene, qrSceneStr, tagIdList
		// fields are not in current entity definition
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	})
}

// DeleteWeChatUser handles DELETE /wechat/users/:openId
func (c *WeChatUsersController) DeleteWeChatUser(ctx *gin.Context) {
	openId := ctx.Param("openId")
	if openId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "OpenID is required",
		})
		return
	}

	// Get user to get ID
	user, err := c.wechatUserRepo.GetByOpenID(ctx.Request.Context(), openId)
	if err != nil {
		c.logger.Error("Failed to get WeChat user for deletion", zap.String("openId", openId), zap.Error(err))
		ctx.JSON(http.StatusNotFound, gin.H{
			"error": "WeChat user not found",
		})
		return
	}

	err = c.wechatUserRepo.Delete(ctx.Request.Context(), user.ID)
	if err != nil {
		c.logger.Error("Failed to delete WeChat user", zap.String("openId", openId), zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete WeChat user",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "WeChat user deleted successfully",
	})
}

// GetWeChatUserStatistics handles GET /wechat/users/statistics
func (c *WeChatUsersController) GetWeChatUserStatistics(ctx *gin.Context) {
	stats, err := c.wechatUserRepo.GetUserStatistics(ctx.Request.Context())
	if err != nil {
		c.logger.Error("Failed to get WeChat user statistics", zap.Error(err))
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve WeChat user statistics",
		})
		return
	}

	ctx.JSON(http.StatusOK, stats)
}
