package wechat

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"go.uber.org/zap"
)

// WeChatAPIClient handles direct WeChat API calls
type WeChatAPIClient struct {
	appID       string
	appSecret   string
	accessToken string
	tokenExpiry time.Time
	httpClient  *http.Client
	logger      *zap.Logger
}

// NewWeChatAPIClient creates a new WeChat API client
func NewWeChatAPIClient(appID, appSecret string, logger *zap.Logger) *WeChatAPIClient {
	return &WeChatAPIClient{
		appID:     appID,
		appSecret: appSecret,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

// AccessTokenResponse represents WeChat access token response
type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	ErrCode     int    `json:"errcode"`
	ErrMsg      string `json:"errmsg"`
}

// GetAccessToken gets or refreshes the access token
func (c *WeChatAPIClient) GetAccessToken(ctx context.Context) (string, error) {
	// Check if current token is still valid
	if c.accessToken != "" && time.Now().Before(c.tokenExpiry) {
		return c.accessToken, nil
	}

	// Request new access token
	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
		c.appID, c.appSecret)

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to request access token: %w", err)
	}
	defer resp.Body.Close()

	var tokenResp AccessTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return "", fmt.Errorf("failed to decode access token response: %w", err)
	}

	if tokenResp.ErrCode != 0 {
		return "", fmt.Errorf("WeChat API error: %d - %s", tokenResp.ErrCode, tokenResp.ErrMsg)
	}

	// Update token and expiry
	c.accessToken = tokenResp.AccessToken
	c.tokenExpiry = time.Now().Add(time.Duration(tokenResp.ExpiresIn-300) * time.Second) // 5 min buffer

	c.logger.Info("WeChat access token refreshed",
		zap.String("appID", c.appID),
		zap.Time("expiry", c.tokenExpiry))

	return c.accessToken, nil
}

// DraftArticle represents a WeChat draft article
type DraftArticle struct {
	Title              string `json:"title"`
	Author             string `json:"author"`
	Digest             string `json:"digest"`
	Content            string `json:"content"`
	ContentSourceURL   string `json:"content_source_url"`
	ThumbMediaID       string `json:"thumb_media_id"`
	ShowCoverPic       int    `json:"show_cover_pic"`
	NeedOpenComment    int    `json:"need_open_comment"`
	OnlyFansCanComment int    `json:"only_fans_can_comment"`
}

// DraftCreateRequest represents WeChat draft creation request
type DraftCreateRequest struct {
	Articles []DraftArticle `json:"articles"`
}

// DraftCreateResponse represents WeChat draft creation response
type DraftCreateResponse struct {
	MediaID string `json:"media_id"`
	ErrCode int    `json:"errcode"`
	ErrMsg  string `json:"errmsg"`
}

// CreateDraft creates a draft in WeChat
func (c *WeChatAPIClient) CreateDraft(ctx context.Context, articles []DraftArticle) (string, error) {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/draft/add?access_token=%s", token)

	request := DraftCreateRequest{Articles: articles}
	requestBody, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal draft request: %w", err)
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(requestBody))
	if err != nil {
		return "", fmt.Errorf("failed to create draft: %w", err)
	}
	defer resp.Body.Close()

	var draftResp DraftCreateResponse
	if err := json.NewDecoder(resp.Body).Decode(&draftResp); err != nil {
		return "", fmt.Errorf("failed to decode draft response: %w", err)
	}

	if draftResp.ErrCode != 0 {
		return "", fmt.Errorf("WeChat draft creation error: %d - %s", draftResp.ErrCode, draftResp.ErrMsg)
	}

	c.logger.Info("WeChat draft created successfully",
		zap.String("mediaID", draftResp.MediaID),
		zap.Int("articleCount", len(articles)))

	return draftResp.MediaID, nil
}

// PublishRequest represents WeChat publish request
type PublishRequest struct {
	MediaID string `json:"media_id"`
}

// PublishResponse represents WeChat publish response
type PublishResponse struct {
	PublishID string `json:"publish_id"`
	MsgID     string `json:"msg_id"`
	ErrCode   int    `json:"errcode"`
	ErrMsg    string `json:"errmsg"`
}

// PublishDraft publishes a draft to WeChat
func (c *WeChatAPIClient) PublishDraft(ctx context.Context, mediaID string) (string, string, error) {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return "", "", fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=%s", token)

	request := PublishRequest{MediaID: mediaID}
	requestBody, err := json.Marshal(request)
	if err != nil {
		return "", "", fmt.Errorf("failed to marshal publish request: %w", err)
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(requestBody))
	if err != nil {
		return "", "", fmt.Errorf("failed to publish draft: %w", err)
	}
	defer resp.Body.Close()

	var publishResp PublishResponse
	if err := json.NewDecoder(resp.Body).Decode(&publishResp); err != nil {
		return "", "", fmt.Errorf("failed to decode publish response: %w", err)
	}

	if publishResp.ErrCode != 0 {
		return "", "", fmt.Errorf("WeChat publish error: %d - %s", publishResp.ErrCode, publishResp.ErrMsg)
	}

	// Generate article URL (this would need to be retrieved from WeChat API in real implementation)
	articleURL := fmt.Sprintf("https://mp.weixin.qq.com/s/%s", publishResp.MsgID)

	c.logger.Info("WeChat draft published successfully",
		zap.String("publishID", publishResp.PublishID),
		zap.String("msgID", publishResp.MsgID),
		zap.String("url", articleURL))

	return publishResp.PublishID, articleURL, nil
}

// DeleteDraft deletes a draft from WeChat
func (c *WeChatAPIClient) DeleteDraft(ctx context.Context, mediaID string) error {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/draft/delete?access_token=%s", token)

	request := map[string]string{"media_id": mediaID}
	requestBody, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("failed to marshal delete request: %w", err)
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(requestBody))
	if err != nil {
		return fmt.Errorf("failed to delete draft: %w", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode delete response: %w", err)
	}

	if errCode, ok := result["errcode"].(float64); ok && errCode != 0 {
		errMsg, _ := result["errmsg"].(string)
		return fmt.Errorf("WeChat delete error: %.0f - %s", errCode, errMsg)
	}

	c.logger.Info("WeChat draft deleted successfully", zap.String("mediaID", mediaID))
	return nil
}

// SendTextMessage sends a text message to a user
func (c *WeChatAPIClient) SendTextMessage(ctx context.Context, openID, content string) error {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=%s", token)

	message := map[string]interface{}{
		"touser":  openID,
		"msgtype": "text",
		"text": map[string]string{
			"content": content,
		},
	}

	requestBody, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(requestBody))
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode send response: %w", err)
	}

	if errCode, ok := result["errcode"].(float64); ok && errCode != 0 {
		errMsg, _ := result["errmsg"].(string)
		return fmt.Errorf("WeChat send message error: %.0f - %s", errCode, errMsg)
	}

	c.logger.Info("WeChat message sent successfully",
		zap.String("openID", openID),
		zap.String("content", content))

	return nil
}

// TemplateMessage represents a WeChat template message
type TemplateMessage struct {
	ToUser     string                 `json:"touser"`
	TemplateID string                 `json:"template_id"`
	URL        string                 `json:"url,omitempty"`
	Data       map[string]interface{} `json:"data"`
}

// SendTemplateMessage sends a template message to a user
func (c *WeChatAPIClient) SendTemplateMessage(ctx context.Context, templateMsg *TemplateMessage) error {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=%s", token)

	requestBody, err := json.Marshal(templateMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal template message: %w", err)
	}

	resp, err := c.httpClient.Post(url, "application/json", bytes.NewReader(requestBody))
	if err != nil {
		return fmt.Errorf("failed to send template message: %w", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("failed to decode template response: %w", err)
	}

	if errCode, ok := result["errcode"].(float64); ok && errCode != 0 {
		errMsg, _ := result["errmsg"].(string)
		return fmt.Errorf("WeChat template message error: %.0f - %s", errCode, errMsg)
	}

	c.logger.Info("WeChat template message sent successfully",
		zap.String("toUser", templateMsg.ToUser),
		zap.String("templateID", templateMsg.TemplateID))

	return nil
}

// GetUserList gets the list of WeChat followers
func (c *WeChatAPIClient) GetUserList(ctx context.Context, nextOpenID string) (*UserListResponse, error) {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get access token: %w", err)
	}

	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/user/get?access_token=%s", token)
	if nextOpenID != "" {
		url += "&next_openid=" + nextOpenID
	}

	resp, err := c.httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get user list: %w", err)
	}
	defer resp.Body.Close()

	var userList UserListResponse
	if err := json.NewDecoder(resp.Body).Decode(&userList); err != nil {
		return nil, fmt.Errorf("failed to decode user list response: %w", err)
	}

	if userList.ErrCode != 0 {
		return nil, fmt.Errorf("WeChat get user list error: %d - %s", userList.ErrCode, userList.ErrMsg)
	}

	return &userList, nil
}

// UserListResponse represents WeChat user list response
type UserListResponse struct {
	Total      int      `json:"total"`
	Count      int      `json:"count"`
	Data       UserData `json:"data"`
	NextOpenID string   `json:"next_openid"`
	ErrCode    int      `json:"errcode"`
	ErrMsg     string   `json:"errmsg"`
}

// UserData represents user data in the response
type UserData struct {
	OpenIDs []string `json:"openid"`
}

// MaterialUploadResponse represents WeChat material upload response
type MaterialUploadResponse struct {
	Type      string `json:"type"`
	MediaID   string `json:"media_id"`
	CreatedAt int64  `json:"created_at"`
	URL       string `json:"url"`
	ErrCode   int    `json:"errcode"`
	ErrMsg    string `json:"errmsg"`
}

// UploadMaterial uploads an image to WeChat and returns MediaID and URL
func (c *WeChatAPIClient) UploadMaterial(ctx context.Context, filePath string) (*MaterialUploadResponse, error) {
	token, err := c.GetAccessToken(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get access token: %w", err)
	}

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file %s: %w", filePath, err)
	}
	defer file.Close()

	// Create a buffer to write our multipart form data
	var requestBody bytes.Buffer
	writer := multipart.NewWriter(&requestBody)

	// Add the file field
	part, err := writer.CreateFormFile("media", filepath.Base(filePath))
	if err != nil {
		return nil, fmt.Errorf("failed to create form file: %w", err)
	}

	// Copy file content to the form field
	_, err = io.Copy(part, file)
	if err != nil {
		return nil, fmt.Errorf("failed to copy file content: %w", err)
	}

	// Add the type field
	err = writer.WriteField("type", "image")
	if err != nil {
		return nil, fmt.Errorf("failed to write type field: %w", err)
	}

	// Close the writer to finalize the form
	err = writer.Close()
	if err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create the request
	url := fmt.Sprintf("https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=%s&type=image", token)
	req, err := http.NewRequestWithContext(ctx, "POST", url, &requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set the content type with boundary
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send the request
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to upload material: %w", err)
	}
	defer resp.Body.Close()

	// Parse the response
	var uploadResp MaterialUploadResponse
	if err := json.NewDecoder(resp.Body).Decode(&uploadResp); err != nil {
		return nil, fmt.Errorf("failed to decode upload response: %w", err)
	}

	if uploadResp.ErrCode != 0 {
		return nil, fmt.Errorf("WeChat material upload error: %d - %s", uploadResp.ErrCode, uploadResp.ErrMsg)
	}

	c.logger.Info("WeChat material uploaded successfully",
		zap.String("filePath", filePath),
		zap.String("mediaID", uploadResp.MediaID),
		zap.String("url", uploadResp.URL))

	return &uploadResp, nil
}
