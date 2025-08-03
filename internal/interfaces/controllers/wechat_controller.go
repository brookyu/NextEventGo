package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/silenceper/wechat/v2/officialaccount/message"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"go.uber.org/zap"
)

// WeChatController handles WeChat webhook requests
type WeChatController struct {
	wechatService services.WeChatService
	logger        *zap.Logger
}

// NewWeChatController creates a new WeChat controller
func NewWeChatController(wechatService services.WeChatService, logger *zap.Logger) *WeChatController {
	return &WeChatController{
		wechatService: wechatService,
		logger:        logger,
	}
}

// HandleWebhook handles WeChat webhook requests
func (w *WeChatController) HandleWebhook(c *gin.Context) {
	startTime := time.Now()
	
	// Parse the incoming message
	var msg message.MixMessage
	if err := c.ShouldBindXML(&msg); err != nil {
		w.logger.Error("Failed to parse WeChat message", zap.Error(err))
		c.String(http.StatusBadRequest, "Invalid message format")
		return
	}

	w.logger.Info("Received WeChat webhook",
		zap.String("from_user", string(msg.FromUserName)),
		zap.String("to_user", string(msg.ToUserName)),
		zap.String("msg_type", string(msg.MsgType)),
		zap.String("event", string(msg.Event)))

	// Process the message
	reply, err := w.wechatService.ProcessMessage(c.Request.Context(), &msg)
	if err != nil {
		w.logger.Error("Failed to process WeChat message", zap.Error(err))
		c.String(http.StatusInternalServerError, "Internal server error")
		return
	}

	// Calculate processing time
	processingTime := time.Since(startTime)
	w.logger.Info("WeChat message processed",
		zap.Duration("processing_time", processingTime),
		zap.Bool("has_reply", reply != nil))

	// Send reply if available
	if reply != nil {
		c.XML(http.StatusOK, reply)
	} else {
		c.String(http.StatusOK, "success")
	}
}

// VerifyWebhook handles WeChat webhook verification
func (w *WeChatController) VerifyWebhook(c *gin.Context) {
	signature := c.Query("signature")
	timestamp := c.Query("timestamp")
	nonce := c.Query("nonce")
	echostr := c.Query("echostr")

	w.logger.Info("WeChat webhook verification request",
		zap.String("signature", signature),
		zap.String("timestamp", timestamp),
		zap.String("nonce", nonce),
		zap.String("echostr", echostr))

	// For now, just return the echostr for verification
	// In production, you would verify the signature
	c.String(http.StatusOK, echostr)
}

// GetAccessToken returns the current access token
func (w *WeChatController) GetAccessToken(c *gin.Context) {
	token, err := w.wechatService.GetAccessToken(c.Request.Context())
	if err != nil {
		w.logger.Error("Failed to get access token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get access token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": token,
		"timestamp":    time.Now().Unix(),
	})
}

// RefreshAccessToken refreshes the access token
func (w *WeChatController) RefreshAccessToken(c *gin.Context) {
	token, err := w.wechatService.RefreshAccessToken(c.Request.Context())
	if err != nil {
		w.logger.Error("Failed to refresh access token", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to refresh access token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": token,
		"timestamp":    time.Now().Unix(),
		"refreshed":    true,
	})
}

// SendMessage sends a message to a user (for testing)
func (w *WeChatController) SendMessage(c *gin.Context) {
	var req struct {
		OpenID  string `json:"openid" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	err := w.wechatService.SendTextMessage(c.Request.Context(), req.OpenID, req.Content)
	if err != nil {
		w.logger.Error("Failed to send message", 
			zap.String("openid", req.OpenID), 
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send message",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Message sent successfully",
	})
}

// GetUserInfo gets user information
func (w *WeChatController) GetUserInfo(c *gin.Context) {
	openID := c.Param("openid")
	if openID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "OpenID is required",
		})
		return
	}

	userInfo, err := w.wechatService.GetUserInfo(c.Request.Context(), openID)
	if err != nil {
		w.logger.Error("Failed to get user info", 
			zap.String("openid", openID), 
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get user info",
		})
		return
	}

	c.JSON(http.StatusOK, userInfo)
}

// CreateQRCode creates a QR code
func (w *WeChatController) CreateQRCode(c *gin.Context) {
	var req struct {
		Scene         string `json:"scene" binding:"required"`
		ExpireSeconds int    `json:"expire_seconds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	qrInfo, err := w.wechatService.CreateQRCode(c.Request.Context(), req.Scene, req.ExpireSeconds)
	if err != nil {
		w.logger.Error("Failed to create QR code", 
			zap.String("scene", req.Scene), 
			zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create QR code",
		})
		return
	}

	c.JSON(http.StatusOK, qrInfo)
}

// HealthCheck provides a health check endpoint for WeChat service
func (w *WeChatController) HealthCheck(c *gin.Context) {
	// Try to get access token to verify WeChat service is working
	_, err := w.wechatService.GetAccessToken(c.Request.Context())
	
	status := "healthy"
	httpStatus := http.StatusOK
	
	if err != nil {
		status = "unhealthy"
		httpStatus = http.StatusServiceUnavailable
		w.logger.Warn("WeChat service health check failed", zap.Error(err))
	}

	c.JSON(httpStatus, gin.H{
		"service":   "wechat",
		"status":    status,
		"timestamp": time.Now().Unix(),
	})
}
