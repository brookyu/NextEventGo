package services

import (
	"time"

	"github.com/google/uuid"
)

// Article WeChat Integration Request Types

// ArticleQRCodeRequest represents a request to generate a QR code for an article
type ArticleQRCodeRequest struct {
	ArticleID        uuid.UUID `json:"articleId" binding:"required"`
	QRCodeType       string    `json:"qrCodeType" binding:"required,oneof=permanent temporary"` // "permanent" or "temporary"
	ExpireSeconds    *int      `json:"expireSeconds,omitempty"`                                 // For temporary QR codes
	RequirePublished bool      `json:"requirePublished"`                                        // Whether article must be published
	Description      string    `json:"description,omitempty"`                                   // Optional description
	MaxScans         *int      `json:"maxScans,omitempty"`                                      // Optional scan limit
}

// ArticleWeChatPublishRequest represents a request to publish an article to WeChat
type ArticleWeChatPublishRequest struct {
	ArticleID       uuid.UUID  `json:"articleId" binding:"required"`
	PublishType     string     `json:"publishType" binding:"required,oneof=draft direct"` // "draft" or "direct"
	ScheduleTime    *time.Time `json:"scheduleTime,omitempty"`                            // For scheduled publishing
	OptimizeContent bool       `json:"optimizeContent"`                                   // Whether to optimize content for WeChat
	GenerateQRCode  bool       `json:"generateQrCode"`                                    // Whether to generate QR code
	NotifyFollowers bool       `json:"notifyFollowers"`                                   // Whether to notify followers
}

// WeChatContentOptimizeRequest represents a request to optimize content for WeChat
type WeChatContentOptimizeRequest struct {
	ArticleID      uuid.UUID `json:"articleId" binding:"required"`
	OptimizeImages bool      `json:"optimizeImages"` // Whether to optimize images
	OptimizeLinks  bool      `json:"optimizeLinks"`  // Whether to optimize external links
	AddShareText   bool      `json:"addShareText"`   // Whether to add sharing text
	IncludeTags    bool      `json:"includeTags"`    // Whether to include hashtags
}

// Article WeChat Integration Response Types

// ArticleQRCodeResponse represents a QR code response for an article
type ArticleQRCodeResponse struct {
	ID           uuid.UUID  `json:"id"`
	ArticleID    uuid.UUID  `json:"articleId"`
	ArticleTitle string     `json:"articleTitle"`
	QRCodeURL    string     `json:"qrCodeUrl"`
	SceneStr     string     `json:"sceneStr"`
	QRCodeType   string     `json:"qrCodeType"`
	Status       string     `json:"status"`
	ScanCount    int64      `json:"scanCount"`
	IsActive     bool       `json:"isActive"`
	ExpireTime   *time.Time `json:"expireTime,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	ShareURL     string     `json:"shareUrl"`

	// Analytics data (included when requested)
	Analytics *QRCodeAnalytics `json:"analytics,omitempty"`
}

// WeChatContentResponse represents optimized WeChat content
type WeChatContentResponse struct {
	ArticleID     uuid.UUID `json:"articleId"`
	Title         string    `json:"title"`
	Summary       string    `json:"summary"`
	Content       string    `json:"content"`
	ShareText     string    `json:"shareText"`
	CoverImageURL string    `json:"coverImageUrl"`
	ShareURL      string    `json:"shareUrl"`
	Tags          []string  `json:"tags"`

	// WeChat-specific metadata
	WeChatMeta *WeChatMetadata `json:"wechatMeta,omitempty"`
}

// ArticleWeChatPublishResponse represents a WeChat publish response
type ArticleWeChatPublishResponse struct {
	Success     bool      `json:"success"`
	ArticleID   uuid.UUID `json:"articleId"`
	PublishType string    `json:"publishType"`
	DraftID     string    `json:"draftId,omitempty"`
	PublishID   string    `json:"publishId,omitempty"`
	WeChatURL   string    `json:"wechatUrl,omitempty"`
	QRCodeURL   string    `json:"qrCodeUrl,omitempty"`
	PublishedAt time.Time `json:"publishedAt"`
	Message     string    `json:"message"`

	// Publishing statistics
	Stats *WeChatPublishStats `json:"stats,omitempty"`
}

// Supporting Types

// QRCodeAnalytics represents analytics data for a QR code
type QRCodeAnalytics struct {
	TotalScans      int64               `json:"totalScans"`
	UniqueScans     int64               `json:"uniqueScans"`
	ScansByDate     []DateScanCount     `json:"scansByDate"`
	ScansByDevice   map[string]int64    `json:"scansByDevice"`
	ScansByLocation map[string]int64    `json:"scansByLocation"`
	TopReferrers    []ReferrerScanCount `json:"topReferrers"`
	ConversionRate  float64             `json:"conversionRate"`
	LastScanTime    *time.Time          `json:"lastScanTime,omitempty"`
}

// DateScanCount represents scan count for a specific date
type DateScanCount struct {
	Date      time.Time `json:"date"`
	ScanCount int64     `json:"scanCount"`
}

// ReferrerScanCount represents scan count from a specific referrer
type ReferrerScanCount struct {
	Referrer  string `json:"referrer"`
	ScanCount int64  `json:"scanCount"`
}

// WeChatMetadata represents WeChat-specific metadata
type WeChatMetadata struct {
	OptimizedForWeChat bool     `json:"optimizedForWeChat"`
	ImageCount         int      `json:"imageCount"`
	LinkCount          int      `json:"linkCount"`
	EstimatedReadTime  int      `json:"estimatedReadTime"` // in minutes
	ContentWarnings    []string `json:"contentWarnings,omitempty"`
	Recommendations    []string `json:"recommendations,omitempty"`
}

// WeChatPublishStats represents publishing statistics
type WeChatPublishStats struct {
	ContentLength    int     `json:"contentLength"`
	ImageCount       int     `json:"imageCount"`
	OptimizedImages  int     `json:"optimizedImages"`
	ProcessingTime   float64 `json:"processingTime"` // in seconds
	CompressionRatio float64 `json:"compressionRatio"`
}

// QRCodeScanData represents data collected when a QR code is scanned
type QRCodeScanData struct {
	UserID     string            `json:"userId,omitempty"`
	OpenID     string            `json:"openId,omitempty"`
	UnionID    string            `json:"unionId,omitempty"`
	IPAddress  string            `json:"ipAddress"`
	UserAgent  string            `json:"userAgent"`
	ScanTime   time.Time         `json:"scanTime"`
	DeviceType string            `json:"deviceType"`
	Platform   string            `json:"platform"`
	Location   string            `json:"location,omitempty"`
	Referrer   string            `json:"referrer,omitempty"`
	SessionID  string            `json:"sessionId,omitempty"`
	Metadata   map[string]string `json:"metadata,omitempty"`
}

// WeChat Sharing Types

// WeChatShareRequest represents a request to share an article on WeChat
type WeChatShareRequest struct {
	ArticleID   uuid.UUID `json:"articleId" binding:"required"`
	ShareType   string    `json:"shareType" binding:"required,oneof=moments chat group"` // "moments", "chat", "group"
	CustomText  string    `json:"customText,omitempty"`                                  // Custom sharing text
	IncludeQR   bool      `json:"includeQr"`                                             // Whether to include QR code
	TrackShares bool      `json:"trackShares"`                                           // Whether to track sharing
}

// WeChatShareResponse represents a WeChat share response
type WeChatShareResponse struct {
	Success   bool      `json:"success"`
	ArticleID uuid.UUID `json:"articleId"`
	ShareType string    `json:"shareType"`
	ShareURL  string    `json:"shareUrl"`
	ShareText string    `json:"shareText"`
	QRCodeURL string    `json:"qrCodeUrl,omitempty"`
	ShareID   string    `json:"shareId"`
	SharedAt  time.Time `json:"sharedAt"`
	Message   string    `json:"message"`
}

// WeChat Template Message Types

// ArticleNotificationRequest represents a request to send article notifications
type ArticleNotificationRequest struct {
	ArticleID    uuid.UUID              `json:"articleId" binding:"required"`
	TemplateType string                 `json:"templateType" binding:"required,oneof=new_article article_update"`
	Recipients   []string               `json:"recipients,omitempty"` // OpenIDs, empty means all followers
	CustomData   map[string]interface{} `json:"customData,omitempty"`
}

// ArticleNotificationResponse represents an article notification response
type ArticleNotificationResponse struct {
	Success      bool      `json:"success"`
	ArticleID    uuid.UUID `json:"articleId"`
	TemplateType string    `json:"templateType"`
	SentCount    int       `json:"sentCount"`
	FailedCount  int       `json:"failedCount"`
	MessageID    string    `json:"messageId"`
	SentAt       time.Time `json:"sentAt"`
	Message      string    `json:"message"`

	// Detailed results
	Results []NotificationResult `json:"results,omitempty"`
}

// NotificationResult represents the result of sending a notification to a specific recipient
type NotificationResult struct {
	OpenID  string `json:"openId"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// WeChat Analytics Types

// ArticleWeChatAnalytics represents WeChat-specific analytics for an article
type ArticleWeChatAnalytics struct {
	ArticleID      uuid.UUID               `json:"articleId"`
	QRCodeScans    int64                   `json:"qrCodeScans"`
	WeChatViews    int64                   `json:"wechatViews"`
	WeChatShares   int64                   `json:"wechatShares"`
	FollowerReads  int64                   `json:"followerReads"`
	ConversionRate float64                 `json:"conversionRate"`
	EngagementRate float64                 `json:"engagementRate"`
	TopScanSources []SourceScanCount       `json:"topScanSources"`
	ShareBreakdown map[string]int64        `json:"shareBreakdown"`
	TimeSeriesData []WeChatTimeSeriesPoint `json:"timeSeriesData"`
	LastUpdated    time.Time               `json:"lastUpdated"`
}

// SourceScanCount represents scan count from a specific source
type SourceScanCount struct {
	Source    string `json:"source"`
	ScanCount int64  `json:"scanCount"`
}

// WeChatTimeSeriesPoint represents a point in WeChat time series data
type WeChatTimeSeriesPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Scans     int64     `json:"scans"`
	Views     int64     `json:"views"`
	Shares    int64     `json:"shares"`
}
