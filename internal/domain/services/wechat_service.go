package services

import (
	"context"

	"github.com/silenceper/wechat/v2/officialaccount/message"
)

// WeChatService defines the interface for WeChat integration operations
type WeChatService interface {
	// Public Account Message Processing
	ProcessMessage(ctx context.Context, msg *message.MixMessage) (*message.Reply, error)

	// Token Management
	GetAccessToken(ctx context.Context) (string, error)
	RefreshAccessToken(ctx context.Context) (string, error)

	// User Management
	GetUserInfo(ctx context.Context, openID string) (*WeChatUserInfo, error)
	GetUserList(ctx context.Context) (*WeChatUserList, error)

	// Message Sending
	SendTextMessage(ctx context.Context, openID, content string) error
	SendTemplateMessage(ctx context.Context, openID string, templateMsg *TemplateMessage) error

	// Menu Management
	CreateMenu(ctx context.Context, menu *Menu) error
	GetMenu(ctx context.Context) (*Menu, error)
	DeleteMenu(ctx context.Context) error

	// QR Code Management
	CreateQRCode(ctx context.Context, sceneStr string, expireSeconds int) (*WeChatQRCodeInfo, error)
	CreatePermanentQRCode(ctx context.Context, sceneStr string) (*WeChatQRCodeInfo, error)

	// Media Management
	UploadMedia(ctx context.Context, mediaType string, filePath string) (*WeChatMediaInfo, error)
	UploadMediaFromBytes(ctx context.Context, mediaType string, filename string, data []byte) (*WeChatMediaInfo, error)
	GetMedia(ctx context.Context, mediaID string) ([]byte, error)
	GetMediaURL(ctx context.Context, mediaID string) (string, error)
	UploadPermanentMedia(ctx context.Context, mediaType string, filePath string) (*WeChatPermanentMediaInfo, error)
	GetPermanentMediaList(ctx context.Context, mediaType string, offset, count int) (*WeChatMediaList, error)
	DeletePermanentMedia(ctx context.Context, mediaID string) error

	// Mini Program Integration
	GetMiniProgramSession(ctx context.Context, code string) (*MiniProgramSession, error)

	// Enterprise WeChat
	SendEnterpriseMessage(ctx context.Context, msg *EnterpriseMessage) error
}

// WeChatUserInfo represents WeChat user information
type WeChatUserInfo struct {
	OpenID     string `json:"openid"`
	UnionID    string `json:"unionid,omitempty"`
	Nickname   string `json:"nickname"`
	Sex        int    `json:"sex"`
	City       string `json:"city"`
	Country    string `json:"country"`
	Province   string `json:"province"`
	Language   string `json:"language"`
	HeadImgURL string `json:"headimgurl"`
	Subscribe  int    `json:"subscribe"`
}

// WeChatUserList represents a list of WeChat users
type WeChatUserList struct {
	Total int      `json:"total"`
	Count int      `json:"count"`
	Data  []string `json:"data"`
}

// TemplateMessage represents a WeChat template message
type TemplateMessage struct {
	TemplateID string                 `json:"template_id"`
	URL        string                 `json:"url,omitempty"`
	Data       map[string]interface{} `json:"data"`
}

// Menu represents WeChat menu structure
type Menu struct {
	Buttons []MenuButton `json:"button"`
}

// MenuButton represents a menu button
type MenuButton struct {
	Type      string       `json:"type,omitempty"`
	Name      string       `json:"name"`
	Key       string       `json:"key,omitempty"`
	URL       string       `json:"url,omitempty"`
	SubButton []MenuButton `json:"sub_button,omitempty"`
}

// WeChatQRCodeInfo represents WeChat QR code information
type WeChatQRCodeInfo struct {
	Ticket        string `json:"ticket"`
	ExpireSeconds int    `json:"expire_seconds"`
	URL           string `json:"url"`
}

// MiniProgramSession represents Mini Program session information
type MiniProgramSession struct {
	OpenID     string `json:"openid"`
	SessionKey string `json:"session_key"`
	UnionID    string `json:"unionid,omitempty"`
}

// EnterpriseMessage represents Enterprise WeChat message
type EnterpriseMessage struct {
	ToUser  string `json:"touser"`
	MsgType string `json:"msgtype"`
	AgentID int    `json:"agentid"`
	Text    struct {
		Content string `json:"content"`
	} `json:"text,omitempty"`
}

// MessageType constants for WeChat message types
const (
	MessageTypeText     = "text"
	MessageTypeImage    = "image"
	MessageTypeVoice    = "voice"
	MessageTypeVideo    = "video"
	MessageTypeMusic    = "music"
	MessageTypeNews     = "news"
	MessageTypeEvent    = "event"
	MessageTypeLocation = "location"
	MessageTypeLink     = "link"
)

// EventType constants for WeChat event types
const (
	EventTypeSubscribe   = "subscribe"
	EventTypeUnsubscribe = "unsubscribe"
	EventTypeClick       = "CLICK"
	EventTypeScan        = "SCAN"
	EventTypeLocation    = "LOCATION"
	EventTypeView        = "VIEW"
)

// WeChatMediaInfo represents WeChat media upload response
type WeChatMediaInfo struct {
	Type      string `json:"type"`
	MediaID   string `json:"media_id"`
	CreatedAt int64  `json:"created_at"`
	URL       string `json:"url,omitempty"`
}

// WeChatPermanentMediaInfo represents WeChat permanent media upload response
type WeChatPermanentMediaInfo struct {
	MediaID string `json:"media_id"`
	URL     string `json:"url"`
}

// WeChatMediaList represents WeChat media list response
type WeChatMediaList struct {
	Type       string            `json:"type"`
	TotalCount int               `json:"total_count"`
	ItemCount  int               `json:"item_count"`
	Items      []WeChatMediaItem `json:"item"`
}

// WeChatMediaItem represents a single media item in the list
type WeChatMediaItem struct {
	MediaID    string `json:"media_id"`
	Name       string `json:"name"`
	UpdateTime int64  `json:"update_time"`
	URL        string `json:"url,omitempty"`
}

// MediaType constants for WeChat media types
const (
	MediaTypeImage = "image"
	MediaTypeVoice = "voice"
	MediaTypeVideo = "video"
	MediaTypeThumb = "thumb"
)
