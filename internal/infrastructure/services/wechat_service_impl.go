package services

import (
	"context"
	"fmt"

	"github.com/silenceper/wechat/v2/officialaccount/message"
	"github.com/zenteam/nextevent-go/internal/domain/services"
	"github.com/zenteam/nextevent-go/internal/infrastructure/wechat"
	"go.uber.org/zap"
)

// WeChatServiceImpl implements the domain WeChatService interface
type WeChatServiceImpl struct {
	wechatService *wechat.Service
	logger        *zap.Logger
}

// NewWeChatServiceImpl creates a new WeChat service implementation
func NewWeChatServiceImpl(wechatService *wechat.Service, logger *zap.Logger) *WeChatServiceImpl {
	return &WeChatServiceImpl{
		wechatService: wechatService,
		logger:        logger,
	}
}

// GetAccessToken gets the WeChat access token
func (w *WeChatServiceImpl) GetAccessToken(ctx context.Context) (string, error) {
	return w.wechatService.GetAccessToken(ctx)
}

// RefreshAccessToken refreshes the WeChat access token
func (w *WeChatServiceImpl) RefreshAccessToken(ctx context.Context) (string, error) {
	return w.wechatService.RefreshAccessToken(ctx)
}

// CreateQRCode creates a temporary QR code
func (w *WeChatServiceImpl) CreateQRCode(ctx context.Context, sceneStr string, expireSeconds int) (*services.WeChatQRCodeInfo, error) {
	resp, err := w.wechatService.CreateQRCode(ctx, sceneStr, expireSeconds)
	if err != nil {
		return nil, err
	}

	// Convert infrastructure response to domain type
	return &services.WeChatQRCodeInfo{
		Ticket:        resp.Ticket,
		ExpireSeconds: resp.ExpireSeconds,
		URL:           resp.URL,
	}, nil
}

// CreatePermanentQRCode creates a permanent QR code
func (w *WeChatServiceImpl) CreatePermanentQRCode(ctx context.Context, sceneStr string) (*services.WeChatQRCodeInfo, error) {
	resp, err := w.wechatService.CreatePermanentQRCode(ctx, sceneStr)
	if err != nil {
		return nil, err
	}

	// Convert infrastructure response to domain type
	return &services.WeChatQRCodeInfo{
		Ticket:        resp.Ticket,
		ExpireSeconds: resp.ExpireSeconds,
		URL:           resp.URL,
	}, nil
}

// SendTextMessage sends a text message to a user
func (w *WeChatServiceImpl) SendTextMessage(ctx context.Context, openID, content string) error {
	return w.wechatService.SendTextMessage(ctx, openID, content)
}

// SendTemplateMessage sends a template message to a user
func (w *WeChatServiceImpl) SendTemplateMessage(ctx context.Context, openID string, templateMsg *services.TemplateMessage) error {
	// Convert domain template message to infrastructure type
	infraTemplateMsg := &wechat.TemplateMessage{
		ToUser:     openID,
		TemplateID: templateMsg.TemplateID,
		URL:        templateMsg.URL,
		Data:       templateMsg.Data,
	}

	return w.wechatService.SendTemplateMessage(ctx, infraTemplateMsg)
}

// GetUserList gets the list of WeChat users
func (w *WeChatServiceImpl) GetUserList(ctx context.Context) (*services.WeChatUserList, error) {
	resp, err := w.wechatService.GetUserList(ctx, "")
	if err != nil {
		return nil, err
	}

	// Convert infrastructure response to domain type
	// Note: The infrastructure response has a different structure
	var userData []string
	if resp.Data.OpenIDs != nil {
		userData = resp.Data.OpenIDs
	}

	return &services.WeChatUserList{
		Total: resp.Total,
		Count: resp.Count,
		Data:  userData,
	}, nil
}

// Placeholder implementations for other interface methods
// These would need to be implemented based on actual requirements

func (w *WeChatServiceImpl) ProcessMessage(ctx context.Context, msg *message.MixMessage) (*message.Reply, error) {
	return nil, fmt.Errorf("ProcessMessage not implemented")
}

func (w *WeChatServiceImpl) GetUserInfo(ctx context.Context, openID string) (*services.WeChatUserInfo, error) {
	return nil, fmt.Errorf("GetUserInfo not implemented")
}

func (w *WeChatServiceImpl) CreateMenu(ctx context.Context, menu *services.Menu) error {
	return fmt.Errorf("CreateMenu not implemented")
}

func (w *WeChatServiceImpl) GetMenu(ctx context.Context) (*services.Menu, error) {
	return nil, fmt.Errorf("GetMenu not implemented")
}

func (w *WeChatServiceImpl) DeleteMenu(ctx context.Context) error {
	return fmt.Errorf("DeleteMenu not implemented")
}

func (w *WeChatServiceImpl) UploadMedia(ctx context.Context, mediaType string, filePath string) (*services.WeChatMediaInfo, error) {
	return nil, fmt.Errorf("UploadMedia not implemented")
}

func (w *WeChatServiceImpl) UploadMediaFromBytes(ctx context.Context, mediaType string, filename string, data []byte) (*services.WeChatMediaInfo, error) {
	return nil, fmt.Errorf("UploadMediaFromBytes not implemented")
}

func (w *WeChatServiceImpl) GetMedia(ctx context.Context, mediaID string) ([]byte, error) {
	return nil, fmt.Errorf("GetMedia not implemented")
}

func (w *WeChatServiceImpl) GetMediaURL(ctx context.Context, mediaID string) (string, error) {
	return "", fmt.Errorf("GetMediaURL not implemented")
}

func (w *WeChatServiceImpl) UploadPermanentMedia(ctx context.Context, mediaType string, filePath string) (*services.WeChatPermanentMediaInfo, error) {
	return nil, fmt.Errorf("UploadPermanentMedia not implemented")
}

func (w *WeChatServiceImpl) GetPermanentMediaList(ctx context.Context, mediaType string, offset, count int) (*services.WeChatMediaList, error) {
	return nil, fmt.Errorf("GetPermanentMediaList not implemented")
}

func (w *WeChatServiceImpl) DeletePermanentMedia(ctx context.Context, mediaID string) error {
	return fmt.Errorf("DeletePermanentMedia not implemented")
}

func (w *WeChatServiceImpl) GetMiniProgramSession(ctx context.Context, code string) (*services.MiniProgramSession, error) {
	return nil, fmt.Errorf("GetMiniProgramSession not implemented")
}

func (w *WeChatServiceImpl) SendEnterpriseMessage(ctx context.Context, msg *services.EnterpriseMessage) error {
	return fmt.Errorf("SendEnterpriseMessage not implemented")
}
