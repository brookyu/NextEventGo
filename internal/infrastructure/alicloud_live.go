package infrastructure

import (
	"crypto/md5"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
)

// VideoKeyTypes represents the type of video key for authentication
type VideoKeyTypes string

const (
	VideoKeyTypesPush VideoKeyTypes = "Push" // For pushing streams
	VideoKeyTypesPull VideoKeyTypes = "Pull" // For pulling/playing streams
)

// AliLiveConfig holds configuration for Alibaba Cloud Live streaming
type AliLiveConfig struct {
	// Basic configuration
	Domain     string `json:"domain"`     // Live streaming domain
	PlayDomain string `json:"playDomain"` // Playback domain
	AppName    string `json:"appName"`    // Application name (usually "live")
	AuthKey    string `json:"authKey"`    // Authentication key
	AuthKeyB   string `json:"authKeyB"`   // Secondary authentication key

	// Stream configuration
	StreamKeyPrefix string `json:"streamKeyPrefix"` // Prefix for stream keys
	DefaultQuality  string `json:"defaultQuality"`  // Default quality setting

	// Security settings
	EnableAuth  bool  `json:"enableAuth"`  // Enable URL authentication
	AuthTimeout int64 `json:"authTimeout"` // Authentication timeout in seconds

	// Regional settings
	Region string `json:"region"` // Alibaba Cloud region

	// Protocol settings
	EnableRTMP   bool `json:"enableRTMP"`   // Enable RTMP protocol
	EnableHLS    bool `json:"enableHLS"`    // Enable HLS protocol
	EnableFLV    bool `json:"enableFLV"`    // Enable FLV protocol
	EnableWebRTC bool `json:"enableWebRTC"` // Enable WebRTC protocol
}

// DefaultAliLiveConfig returns default configuration for Alibaba Cloud Live
func DefaultAliLiveConfig() AliLiveConfig {
	return AliLiveConfig{
		Domain:          "push.nextevent.com",
		PlayDomain:      "play.nextevent.com",
		AppName:         "live",
		AuthKey:         "your-auth-key-here",
		AuthKeyB:        "your-auth-key-b-here",
		StreamKeyPrefix: "nextevent",
		DefaultQuality:  "720p",
		EnableAuth:      true,
		AuthTimeout:     3600, // 1 hour
		Region:          "cn-hangzhou",
		EnableRTMP:      true,
		EnableHLS:       true,
		EnableFLV:       true,
		EnableWebRTC:    false,
	}
}

// AliLiveHelper provides Alibaba Cloud Live streaming functionality
// Compatible with the .NET AliLiveHelper interface
type AliLiveHelper struct {
	config AliLiveConfig
}

// NewAliLiveHelper creates a new AliLiveHelper instance
func NewAliLiveHelper(config AliLiveConfig) *AliLiveHelper {
	return &AliLiveHelper{
		config: config,
	}
}

// CreatAuthUrl creates an authenticated URL for Alibaba Cloud Live streaming
// This method matches the .NET implementation signature
func (h *AliLiveHelper) CreatAuthUrl(path string, endTime time.Time, keyType VideoKeyTypes) string {
	// Generate stream key from path
	streamKey := h.generateStreamKeyFromPath(path)

	// Calculate authentication timestamp
	authTimestamp := endTime.Unix()

	// Generate authentication string
	authString := h.generateAuthString(streamKey, authTimestamp, keyType)

	// Build the authenticated URL
	return h.buildAuthenticatedURL(streamKey, authTimestamp, authString, keyType)
}

// CreateStreamKey generates a unique stream key for a video
func (h *AliLiveHelper) CreateStreamKey(videoID uuid.UUID) string {
	return fmt.Sprintf("%s_%s_%d", h.config.StreamKeyPrefix, videoID.String(), time.Now().Unix())
}

// CreatePushURL creates a push URL for live streaming
func (h *AliLiveHelper) CreatePushURL(streamKey string, endTime time.Time) string {
	return h.CreatAuthUrl("/"+h.config.AppName+"/"+streamKey, endTime, VideoKeyTypesPush)
}

// CreatePlayURL creates a play URL for live streaming
func (h *AliLiveHelper) CreatePlayURL(streamKey string, endTime time.Time, protocol string) string {
	baseURL := h.CreatAuthUrl("/"+h.config.AppName+"/"+streamKey, endTime, VideoKeyTypesPull)

	switch strings.ToLower(protocol) {
	case "hls", "m3u8":
		return strings.Replace(baseURL, "rtmp://", "https://", 1) + ".m3u8"
	case "flv":
		return strings.Replace(baseURL, "rtmp://", "https://", 1) + ".flv"
	case "rtmp":
		return baseURL
	default:
		return baseURL
	}
}

// CreateMultiQualityURLs creates URLs for multiple quality levels
func (h *AliLiveHelper) CreateMultiQualityURLs(streamKey string, endTime time.Time) map[string]string {
	urls := make(map[string]string)

	// Base stream key for different qualities
	qualities := []string{"360p", "480p", "720p", "1080p"}

	for _, quality := range qualities {
		qualityStreamKey := streamKey + "_" + quality
		urls[quality] = h.CreatePlayURL(qualityStreamKey, endTime, "hls")
	}

	return urls
}

// ValidateStreamKey validates if a stream key is valid
func (h *AliLiveHelper) ValidateStreamKey(streamKey string) bool {
	// Basic validation - check if it starts with our prefix
	return strings.HasPrefix(streamKey, h.config.StreamKeyPrefix)
}

// GetStreamStatus gets the status of a live stream (mock implementation)
func (h *AliLiveHelper) GetStreamStatus(streamKey string) (*StreamStatus, error) {
	// This would typically call Alibaba Cloud Live API to get actual status
	// For now, return a mock status
	return &StreamStatus{
		StreamKey:    streamKey,
		IsLive:       false, // Would be determined by actual API call
		ViewerCount:  0,
		StartTime:    nil,
		Duration:     0,
		LastActivity: time.Now(),
	}, nil
}

// StreamStatus represents the status of a live stream
type StreamStatus struct {
	StreamKey    string     `json:"streamKey"`
	IsLive       bool       `json:"isLive"`
	ViewerCount  int64      `json:"viewerCount"`
	StartTime    *time.Time `json:"startTime,omitempty"`
	Duration     int64      `json:"duration"` // in seconds
	LastActivity time.Time  `json:"lastActivity"`
}

// Private helper methods

// generateStreamKeyFromPath extracts stream key from path
func (h *AliLiveHelper) generateStreamKeyFromPath(path string) string {
	// Remove leading slash and extract stream key
	cleanPath := strings.TrimPrefix(path, "/")
	parts := strings.Split(cleanPath, "/")

	if len(parts) >= 2 {
		return parts[1] // Return the stream key part
	}

	// Fallback: generate a new stream key
	return fmt.Sprintf("%s_%d", h.config.StreamKeyPrefix, time.Now().Unix())
}

// generateAuthString generates authentication string for URL signing
func (h *AliLiveHelper) generateAuthString(streamKey string, timestamp int64, keyType VideoKeyTypes) string {
	// Build the string to be hashed
	// Format: /{AppName}/{StreamKey}-{timestamp}-0-0-{AuthKey}
	var authKey string
	if keyType == VideoKeyTypesPush {
		authKey = h.config.AuthKey
	} else {
		authKey = h.config.AuthKeyB
	}

	stringToHash := fmt.Sprintf("/%s/%s-%d-0-0-%s", h.config.AppName, streamKey, timestamp, authKey)

	// Generate MD5 hash
	hash := md5.Sum([]byte(stringToHash))
	return fmt.Sprintf("%x", hash)
}

// buildAuthenticatedURL builds the final authenticated URL
func (h *AliLiveHelper) buildAuthenticatedURL(streamKey string, timestamp int64, authString string, keyType VideoKeyTypes) string {
	var domain string
	var protocol string

	if keyType == VideoKeyTypesPush {
		domain = h.config.Domain
		protocol = "rtmp"
	} else {
		domain = h.config.PlayDomain
		protocol = "rtmp"
	}

	// Build base URL
	baseURL := fmt.Sprintf("%s://%s/%s/%s", protocol, domain, h.config.AppName, streamKey)

	// Add authentication parameters if enabled
	if h.config.EnableAuth {
		params := url.Values{}
		params.Add("auth_key", fmt.Sprintf("%d-0-0-%s", timestamp, authString))
		baseURL += "?" + params.Encode()
	}

	return baseURL
}

// GetConfig returns the current configuration
func (h *AliLiveHelper) GetConfig() AliLiveConfig {
	return h.config
}

// UpdateConfig updates the configuration
func (h *AliLiveHelper) UpdateConfig(config AliLiveConfig) {
	h.config = config
}

// IsConfigValid validates the configuration
func (h *AliLiveHelper) IsConfigValid() bool {
	return h.config.Domain != "" &&
		h.config.PlayDomain != "" &&
		h.config.AppName != "" &&
		h.config.AuthKey != ""
}

// GetSupportedProtocols returns list of supported protocols
func (h *AliLiveHelper) GetSupportedProtocols() []string {
	protocols := []string{}

	if h.config.EnableRTMP {
		protocols = append(protocols, "rtmp")
	}
	if h.config.EnableHLS {
		protocols = append(protocols, "hls")
	}
	if h.config.EnableFLV {
		protocols = append(protocols, "flv")
	}
	if h.config.EnableWebRTC {
		protocols = append(protocols, "webrtc")
	}

	return protocols
}

// GenerateStreamInfo generates comprehensive stream information
func (h *AliLiveHelper) GenerateStreamInfo(videoID uuid.UUID, endTime time.Time) *StreamInfo {
	streamKey := h.CreateStreamKey(videoID)

	return &StreamInfo{
		VideoID:   videoID,
		StreamKey: streamKey,
		PushURL:   h.CreatePushURL(streamKey, endTime),
		PlayURLs:  h.CreateMultiQualityURLs(streamKey, endTime),
		ExpiresAt: endTime,
		CreatedAt: time.Now(),
		Protocols: h.GetSupportedProtocols(),
	}
}

// StreamInfo represents comprehensive stream information
type StreamInfo struct {
	VideoID   uuid.UUID         `json:"videoId"`
	StreamKey string            `json:"streamKey"`
	PushURL   string            `json:"pushUrl"`
	PlayURLs  map[string]string `json:"playUrls"` // quality -> URL mapping
	ExpiresAt time.Time         `json:"expiresAt"`
	CreatedAt time.Time         `json:"createdAt"`
	Protocols []string          `json:"protocols"`
}
