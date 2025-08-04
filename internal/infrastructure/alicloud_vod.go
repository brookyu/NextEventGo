package infrastructure

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliyun/aliyun-oss-go-sdk/oss"
	"github.com/google/uuid"
	"gorm.io/gorm"

	// Ali Cloud VOD SDK imports

	openapi "github.com/alibabacloud-go/darabonba-openapi/v2/client"
	"github.com/alibabacloud-go/tea/tea"
	vod20170321 "github.com/alibabacloud-go/vod-20170321/v4/client"

	"github.com/zenteam/nextevent-go/internal/config"
)

// AliCloudVODConfig holds configuration for Ali Cloud VOD
type AliCloudVODConfig struct {
	AccessKeyID     string
	AccessKeySecret string
	Region          string
	Endpoint        string
	Bucket          string
	Enabled         bool
}

// VideoUploadResult represents the result of a video upload
type VideoUploadResult struct {
	VideoID         string `json:"videoId"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	LocalPath       string `json:"localPath"`
	LocalUrl        string `json:"localUrl"`
	CloudUrl        string `json:"cloudUrl"`
	PlaybackUrl     string `json:"playbackUrl"`
	CoverUrl        string `json:"coverUrl"`
	Duration        *int   `json:"duration"`
	Status          string `json:"status"`
	FileSize        int64  `json:"fileSize"`
	ContentType     string `json:"contentType"`
	ProcessingJobID string `json:"processingJobId"`
}

// VideoProcessingJob represents a video processing job
type VideoProcessingJob struct {
	ID            uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	VideoUploadID uuid.UUID  `gorm:"type:uuid;not null" json:"videoUploadId"`
	JobType       string     `gorm:"type:varchar(50);not null" json:"jobType"`
	Status        string     `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CloudJobID    string     `gorm:"type:varchar(255)" json:"cloudJobId"`
	Parameters    string     `gorm:"type:jsonb" json:"parameters"`
	Result        string     `gorm:"type:jsonb" json:"result"`
	ErrorMessage  string     `gorm:"type:text" json:"errorMessage"`
	Progress      int        `gorm:"default:0" json:"progress"`
	StartedAt     *time.Time `gorm:"type:timestamp" json:"startedAt"`
	CompletedAt   *time.Time `gorm:"type:timestamp" json:"completedAt"`
	CreatedAt     time.Time  `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt     time.Time  `gorm:"type:timestamp;default:now()" json:"updatedAt"`
}

func (VideoProcessingJob) TableName() string {
	return "video_processing_jobs"
}

// AliCloudVODService handles video uploads to Ali Cloud VOD
type AliCloudVODService struct {
	config    *AliCloudVODConfig
	db        *gorm.DB
	vodClient *vod20170321.Client
}

// AliCloudUploadResponse represents the response from Ali Cloud VOD upload
type AliCloudUploadResponse struct {
	VideoId       string `json:"VideoId"`
	UploadAuth    string `json:"UploadAuth"`
	UploadAddress string `json:"UploadAddress"`
	RequestId     string `json:"RequestId"`
}

// UploadAddressInfo represents the parsed upload address
type UploadAddressInfo struct {
	Endpoint string `json:"Endpoint"`
	Bucket   string `json:"Bucket"`
	FileName string `json:"FileName"`
	Region   string `json:"Region"`
}

// UploadAuthInfo represents the parsed upload auth
type UploadAuthInfo struct {
	AccessKeyId     string `json:"AccessKeyId"`
	AccessKeySecret string `json:"AccessKeySecret"`
	SecurityToken   string `json:"SecurityToken"`
	Expiration      string `json:"Expiration"`
}

// AliCloudVideoInfo represents video information from Ali Cloud
type AliCloudVideoInfo struct {
	VideoId      string  `json:"VideoId"`
	Title        string  `json:"Title"`
	Description  string  `json:"Description"`
	Duration     float64 `json:"Duration"`
	CoverURL     string  `json:"CoverURL"`
	Status       string  `json:"Status"`
	Size         int64   `json:"Size"`
	CreationTime string  `json:"CreationTime"`
	PlayInfoList []struct {
		PlayURL    string `json:"PlayURL"`
		Definition string `json:"Definition"`
		Format     string `json:"Format"`
		Size       int64  `json:"Size"`
		Duration   string `json:"Duration"`
	} `json:"PlayInfoList"`
}

// NewAliCloudVODService creates a new Ali Cloud VOD service
func NewAliCloudVODService(config *AliCloudVODConfig, db *gorm.DB) *AliCloudVODService {
	service := &AliCloudVODService{
		config: config,
		db:     db,
	}

	// Initialize VOD client if enabled
	if config.Enabled {
		vodConfig := &openapi.Config{
			AccessKeyId:     tea.String(config.AccessKeyID),
			AccessKeySecret: tea.String(config.AccessKeySecret),
			RegionId:        tea.String(config.Region),
		}

		if config.Endpoint != "" {
			vodConfig.Endpoint = tea.String(config.Endpoint)
		} else {
			// Default VOD endpoint
			vodConfig.Endpoint = tea.String("vod.ap-southeast-1.aliyuncs.com")
		}

		client, err := vod20170321.NewClient(vodConfig)
		if err != nil {
			fmt.Printf("⚠️  Failed to initialize Ali Cloud VOD client: %v\n", err)
		} else {
			service.vodClient = client
			fmt.Printf("✅ Ali Cloud VOD client initialized successfully\n")
		}
	}

	// Ensure VideoUploads table has correct schema
	service.ensureVideoUploadsTable()

	// Update existing videos with missing RemoteVideoId
	if service.config.Enabled {
		go service.updateExistingVideosWithRemoteVideoId()
	}

	return service
}

// updateExistingVideosWithRemoteVideoId updates existing videos that have Ali Cloud URLs but missing RemoteVideoId
func (s *AliCloudVODService) updateExistingVideosWithRemoteVideoId() {
	fmt.Printf("🔄 Checking for existing videos with missing RemoteVideoId...\n")

	// Find videos with Ali Cloud URLs but no RemoteVideoId
	var videos []map[string]interface{}
	err := s.db.Raw(`
		SELECT Id, PlaybackUrl
		FROM VideoUploads
		WHERE (PlaybackUrl LIKE '%player.alicdn.com%' OR PlaybackUrl LIKE '%cast.wemakecrm.com%')
		AND (RemoteVideoId IS NULL OR RemoteVideoId = '')
		LIMIT 10
	`).Scan(&videos).Error

	if err != nil {
		fmt.Printf("⚠️  Failed to query existing videos: %v\n", err)
		return
	}

	if len(videos) == 0 {
		fmt.Printf("✅ No existing videos need RemoteVideoId updates\n")
		return
	}

	fmt.Printf("📋 Found %d videos that need RemoteVideoId updates\n", len(videos))

	for _, video := range videos {
		videoId := video["Id"].(string)
		playbackUrl := video["PlaybackUrl"].(string)

		// Extract RemoteVideoId from URL
		remoteVideoId := s.extractVideoIdFromUrl(playbackUrl)
		if remoteVideoId != "" {
			// Update the record with RemoteVideoId
			updateData := map[string]interface{}{
				"RemoteVideoId":        remoteVideoId,
				"LastModificationTime": time.Now(),
			}

			if err := s.db.Table("VideoUploads").Where("Id = ?", videoId).Updates(updateData).Error; err != nil {
				fmt.Printf("⚠️  Failed to update RemoteVideoId for video %s: %v\n", videoId, err)
			} else {
				fmt.Printf("✅ Updated RemoteVideoId for video %s: %s\n", videoId, remoteVideoId)

				// Try to get updated video info from Ali Cloud
				go s.refreshVideoInfoFromAliCloud(videoId, remoteVideoId)
			}
		}
	}
}

// extractVideoIdFromUrl extracts the Ali Cloud Video ID from various URL formats
func (s *AliCloudVODService) extractVideoIdFromUrl(url string) string {
	// Handle different URL patterns:
	// 1. https://player.alicdn.com/video/4bb186ae-7fce-469e-b708-fb61345fbbb5.m3u8
	// 2. https://cast.wemakecrm.com/90666884055c71f0bf926732b68f0102/02fee127000047fcab4441e8d87895c6-5287d2089db37e62345123a1be272f8b.mp4

	if strings.Contains(url, "player.alicdn.com/video/") {
		// Extract from player.alicdn.com URL
		parts := strings.Split(url, "/video/")
		if len(parts) > 1 {
			videoIdPart := parts[1]
			// Remove file extension
			if dotIndex := strings.LastIndex(videoIdPart, "."); dotIndex > 0 {
				return videoIdPart[:dotIndex]
			}
			return videoIdPart
		}
	} else if strings.Contains(url, "cast.wemakecrm.com") {
		// Extract from cast.wemakecrm.com URL - the first part after domain is the video ID
		parts := strings.Split(url, "cast.wemakecrm.com/")
		if len(parts) > 1 {
			pathParts := strings.Split(parts[1], "/")
			if len(pathParts) > 0 {
				return pathParts[0]
			}
		}
	}

	return ""
}

// refreshVideoInfoFromAliCloud refreshes video info from Ali Cloud for existing videos
func (s *AliCloudVODService) refreshVideoInfoFromAliCloud(videoId, remoteVideoId string) {
	ctx := context.Background()

	fmt.Printf("🔄 Refreshing video info from Ali Cloud for video %s (RemoteVideoId: %s)\n", videoId, remoteVideoId)

	// Get video info from Ali Cloud
	videoInfo, err := s.GetAliCloudVideoInfo(ctx, remoteVideoId)
	if err != nil {
		fmt.Printf("⚠️  Failed to get video info from Ali Cloud for %s: %v\n", videoId, err)
		return
	}

	// Extract URLs using the corrected logic (playInfoList[1])
	playbackUrl := s.ExtractPlayUrl(videoInfo)
	coverUrl := videoInfo.CoverURL

	if playbackUrl != "" || coverUrl != "" {
		updateData := map[string]interface{}{
			"LastModificationTime": time.Now(),
		}

		if playbackUrl != "" {
			updateData["PlaybackUrl"] = playbackUrl
			updateData["CloudUrl"] = playbackUrl
		}

		if coverUrl != "" {
			updateData["CoverUrl"] = coverUrl
		}

		if err := s.db.Table("VideoUploads").Where("Id = ?", videoId).Updates(updateData).Error; err != nil {
			fmt.Printf("⚠️  Failed to update video URLs for %s: %v\n", videoId, err)
		} else {
			fmt.Printf("✅ Refreshed video URLs for %s - PlaybackUrl: %s, CoverUrl: %s\n", videoId, playbackUrl, coverUrl)
		}
	}
}

// NewAliCloudVODServiceFromConfig creates a new Ali Cloud VOD service from config
func NewAliCloudVODServiceFromConfig(cfg *config.Config, db *gorm.DB) *AliCloudVODService {
	vodConfig := &AliCloudVODConfig{
		AccessKeyID:     cfg.AliCloud.AccessKey.ID,
		AccessKeySecret: cfg.AliCloud.AccessKey.Secret,
		Region:          cfg.AliCloud.Region.ID,
		Endpoint:        cfg.AliCloud.VOD.Endpoint,
		Enabled:         cfg.AliCloud.VOD.Enabled,
	}

	return NewAliCloudVODService(vodConfig, db)
}

// ensureVideoUploadsTable creates or updates the VideoUploads table with correct schema
func (s *AliCloudVODService) ensureVideoUploadsTable() {
	// Check if table exists first
	var tableExists bool
	err := s.db.Raw("SELECT COUNT(*) > 0 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'VideoUploads'").Scan(&tableExists).Error
	if err != nil {
		fmt.Printf("Warning: Failed to check if VideoUploads table exists: %v\n", err)
		return
	}

	if !tableExists {
		// Create table only if it doesn't exist
		statements := []string{
			`CREATE TABLE VideoUploads (
				Id VARCHAR(36) PRIMARY KEY,
				Title VARCHAR(500) NOT NULL,
				Description TEXT,
				Url VARCHAR(1000),
				PlaybackUrl VARCHAR(1000),
				CloudUrl VARCHAR(1000),
				CoverUrl VARCHAR(1000),
				Duration INTEGER,
				Quality VARCHAR(20) DEFAULT 'HD',
				VideoType VARCHAR(50) DEFAULT 'uploaded',
				Format VARCHAR(50),
				Size BIGINT,
				Status VARCHAR(50) DEFAULT 'uploaded',
				ProcessingProgress INTEGER DEFAULT 0,
				Author VARCHAR(255),
				ViewCount BIGINT DEFAULT 0,
				IsOpen BOOLEAN DEFAULT true,
				IsDeleted BOOLEAN DEFAULT false,
				CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				LastModificationTime TIMESTAMP NULL
			)`,
			"CREATE INDEX idx_video_uploads_status ON VideoUploads(Status)",
			"CREATE INDEX idx_video_uploads_creation_time ON VideoUploads(CreationTime)",
			"CREATE INDEX idx_video_uploads_is_deleted ON VideoUploads(IsDeleted)",
		}

		for _, stmt := range statements {
			if err := s.db.Exec(stmt).Error; err != nil {
				fmt.Printf("Warning: Failed to execute SQL statement: %v\n", err)
			}
		}

		fmt.Println("VideoUploads table created successfully")
	} else {
		// Table exists, check and add missing columns for Ali Cloud integration
		s.addMissingAliCloudColumns()
		fmt.Println("VideoUploads table already exists")
	}
}

// addMissingAliCloudColumns adds missing Ali Cloud related columns to existing VideoUploads table
func (s *AliCloudVODService) addMissingAliCloudColumns() {
	columns := []struct {
		name       string
		definition string
	}{
		{"ProcessingProgress", "INTEGER DEFAULT 0"},
		{"RemoteVideoId", "VARCHAR(255)"},
		{"UploadAddress", "TEXT"},
		{"UploadAuth", "TEXT"},
		{"RequestId", "VARCHAR(255)"},
		{"CategoryId", "CHAR(36)"},
	}

	for _, col := range columns {
		var hasColumn bool
		err := s.db.Raw("SELECT COUNT(*) > 0 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'VideoUploads' AND column_name = ?", col.name).Scan(&hasColumn).Error
		if err == nil && !hasColumn {
			fmt.Printf("📋 Adding %s column to VideoUploads table...\n", col.name)
			sql := fmt.Sprintf("ALTER TABLE VideoUploads ADD COLUMN %s %s", col.name, col.definition)
			if err := s.db.Exec(sql).Error; err != nil {
				fmt.Printf("⚠️  Failed to add %s column: %v\n", col.name, err)
			} else {
				fmt.Printf("✅ %s column added successfully\n", col.name)
			}
		}
	}

	// Add index for RemoteVideoId if it doesn't exist
	var hasIndex bool
	err := s.db.Raw("SELECT COUNT(*) > 0 FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'VideoUploads' AND index_name = 'idx_remote_video_id'").Scan(&hasIndex).Error
	if err == nil && !hasIndex {
		fmt.Printf("📋 Adding index for RemoteVideoId...\n")
		if err := s.db.Exec("ALTER TABLE VideoUploads ADD INDEX idx_remote_video_id (RemoteVideoId)").Error; err != nil {
			fmt.Printf("⚠️  Failed to add RemoteVideoId index: %v\n", err)
		} else {
			fmt.Printf("✅ RemoteVideoId index added successfully\n")
		}
	}
}

// UploadVideo uploads a video file to local storage first, then to Ali Cloud VOD
func (s *AliCloudVODService) UploadVideo(ctx context.Context, file multipart.File, header *multipart.FileHeader, title, description string) (*VideoUploadResult, error) {
	return s.UploadVideoWithCategory(ctx, file, header, title, description, "")
}

// UploadVideoWithCategory uploads a video file to local storage first, then to Ali Cloud VOD with category support
func (s *AliCloudVODService) UploadVideoWithCategory(ctx context.Context, file multipart.File, header *multipart.FileHeader, title, description, categoryId string) (*VideoUploadResult, error) {
	// Validate input parameters
	if title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if header.Size == 0 {
		return nil, fmt.Errorf("file is empty")
	}
	if header.Size > 500*1024*1024 { // 500MB limit
		return nil, fmt.Errorf("file size exceeds 500MB limit")
	}

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	ext := filepath.Ext(header.Filename)
	if !s.isValidVideoFile(contentType, ext) {
		return nil, fmt.Errorf("invalid video file type: %s", contentType)
	}

	// Generate unique ID for this upload
	uploadID := uuid.New()

	// Create unique filename with proper extension
	if ext == "" {
		ext = s.getExtensionFromContentType(contentType)
	}
	filename := fmt.Sprintf("%s%s", uploadID.String(), ext)
	localPath := filepath.Join("uploads", "videos", filename)

	// Step 1: Save to local storage first
	localUrl, err := s.saveToLocalStorage(file, header, localPath)
	if err != nil {
		return nil, fmt.Errorf("failed to save to local storage: %w", err)
	}

	fmt.Printf("✅ Step 1: Video saved to local storage: %s\n", localPath)

	// Step 2: Create initial VideoUploads record
	initialRecord := map[string]interface{}{
		"Id":                   uploadID.String(),
		"Title":                title,
		"Description":          description,
		"Status":               "uploading",
		"ProcessingProgress":   0,
		"Size":                 header.Size,
		"Format":               ext,
		"VideoType":            "uploaded",
		"Quality":              "HD",
		"IsDeleted":            false,
		"IsOpen":               true,
		"ViewCount":            0,
		"CreationTime":         time.Now(),
		"LastModificationTime": time.Now(),
		"Url":                  localUrl,
	}

	// Add CategoryId if provided
	if categoryId != "" {
		initialRecord["CategoryId"] = categoryId
	}

	if err := s.db.Table("VideoUploads").Create(initialRecord).Error; err != nil {
		// Clean up local file on database error
		os.Remove(localPath)
		return nil, fmt.Errorf("failed to create initial video record: %w", err)
	}

	fmt.Printf("✅ Step 2: Initial VideoUploads record created with ID: %s\n", uploadID.String())

	// Step 3: Set PlaybackUrl and CoverUrl
	var aliCloudPlayUrl string
	var aliCloudCoverUrl string

	if s.config.Enabled {
		aliCloudResponse, err := s.uploadToAliCloudVOD(ctx, localPath, title, description)
		if err != nil {
			// Update status to failed but keep local file
			s.updateVideoStatus(uploadID.String(), "failed", 0)
			return nil, fmt.Errorf("failed to upload to Ali Cloud VOD: %w", err)
		}

		fmt.Printf("✅ Step 3: Video uploaded to Ali Cloud VOD with VideoId: %s\n", aliCloudResponse.VideoId)

		// Step 3.5: Update record with Ali Cloud information
		aliCloudUpdateData := map[string]interface{}{
			"RemoteVideoId":        aliCloudResponse.VideoId,
			"UploadAddress":        aliCloudResponse.UploadAddress,
			"UploadAuth":           aliCloudResponse.UploadAuth,
			"RequestId":            aliCloudResponse.RequestId,
			"LastModificationTime": time.Now(),
		}

		if err := s.db.Table("VideoUploads").Where("Id = ?", uploadID.String()).Updates(aliCloudUpdateData).Error; err != nil {
			fmt.Printf("⚠️  Warning: Failed to update Ali Cloud info: %v\n", err)
		} else {
			fmt.Printf("✅ Step 3.5: Ali Cloud info stored in database\n")
		}

		// Step 4: Try to get video info from Ali Cloud (may not be ready immediately)
		videoInfo, err := s.GetAliCloudVideoInfo(ctx, aliCloudResponse.VideoId)
		if err != nil {
			fmt.Printf("⚠️  Warning: Failed to get video info from Ali Cloud (video may still be processing): %v\n", err)
			// Schedule async processing to check later
			go s.processVideoInfoAsync(ctx, uploadID.String(), aliCloudResponse.VideoId)
		} else {
			// Check if video is ready for playback
			if videoInfo.Status == "Normal" && len(videoInfo.PlayInfoList) > 0 {
				aliCloudPlayUrl = s.ExtractPlayUrl(videoInfo)
				aliCloudCoverUrl = videoInfo.CoverURL
				fmt.Printf("✅ Step 4: Retrieved video info from Ali Cloud\n")
			} else {
				fmt.Printf("⚠️  Video is still processing, will check later. Status: %s\n", videoInfo.Status)
				// Schedule async processing to check later
				go s.processVideoInfoAsync(ctx, uploadID.String(), aliCloudResponse.VideoId)
			}
		}
	} else {
		fmt.Printf("⚠️  Ali Cloud VOD is disabled, using local fallback\n")
		// For local development, set PlaybackUrl to the local URL
		aliCloudPlayUrl = localUrl
		// Generate a mock cover URL
		aliCloudCoverUrl = fmt.Sprintf("/uploads/videos/covers/%s.jpg", strings.TrimSuffix(filepath.Base(localPath), filepath.Ext(localPath)))
	}

	// Step 5: Update VideoUploads record with Ali Cloud data
	updateData := map[string]interface{}{
		"Status":               "completed",
		"ProcessingProgress":   100,
		"LastModificationTime": time.Now(),
	}

	if aliCloudPlayUrl != "" {
		updateData["PlaybackUrl"] = aliCloudPlayUrl
		updateData["CloudUrl"] = aliCloudPlayUrl
	}
	if aliCloudCoverUrl != "" {
		updateData["CoverUrl"] = aliCloudCoverUrl
	}

	if err := s.db.Table("VideoUploads").Where("Id = ?", uploadID.String()).Updates(updateData).Error; err != nil {
		fmt.Printf("⚠️  Warning: Failed to update video record with Ali Cloud data: %v\n", err)
	}

	fmt.Printf("✅ Step 5: VideoUploads record updated with Ali Cloud data\n")

	// Prepare result
	result := &VideoUploadResult{
		VideoID:         uploadID.String(),
		Title:           title,
		Description:     description,
		LocalPath:       localPath,
		LocalUrl:        localUrl,
		CloudUrl:        aliCloudPlayUrl,
		PlaybackUrl:     aliCloudPlayUrl,
		CoverUrl:        aliCloudCoverUrl,
		Status:          "completed",
		FileSize:        header.Size,
		ContentType:     header.Header.Get("Content-Type"),
		ProcessingJobID: "", // No longer using CloudVideoId
	}

	return result, nil
}

// processVideoAsync processes video in Ali Cloud VOD asynchronously
func (s *AliCloudVODService) processVideoAsync(ctx context.Context, videoID, localPath, title, description string) {
	// Create processing job
	job := VideoProcessingJob{
		VideoUploadID: uuid.MustParse(videoID),
		JobType:       "upload",
		Status:        "processing",
		Parameters:    fmt.Sprintf(`{"title":"%s","description":"%s","localPath":"%s"}`, title, description, localPath),
		StartedAt:     &[]time.Time{time.Now()}[0],
	}

	if err := s.db.Create(&job).Error; err != nil {
		fmt.Printf("Failed to create processing job: %v\n", err)
		return
	}

	// TODO: Implement actual Ali Cloud VOD upload
	// For now, simulate the process
	s.simulateAliCloudProcessing(ctx, videoID, job.ID.String())
}

// simulateProcessingAsync simulates video processing for local development
func (s *AliCloudVODService) simulateProcessingAsync(ctx context.Context, videoID string) {
	// Simulate processing delay
	time.Sleep(3 * time.Second)

	// Update status to processing
	s.updateVideoStatus(videoID, "processing", 25)
	time.Sleep(2 * time.Second)

	// Simulate cover generation
	s.updateVideoStatus(videoID, "processing", 50)
	coverUrl := s.generateMockCoverImage(videoID)
	s.updateVideoCover(videoID, coverUrl)
	time.Sleep(2 * time.Second)

	// Simulate transcoding
	s.updateVideoStatus(videoID, "processing", 75)
	time.Sleep(2 * time.Second)

	// Complete processing
	s.updateVideoStatus(videoID, "completed", 100)
	playbackUrl := fmt.Sprintf("http://localhost:8080/uploads/videos/%s.mp4", videoID)
	s.updateVideoPlayback(videoID, playbackUrl)
}

// simulateAliCloudProcessing simulates Ali Cloud VOD processing
func (s *AliCloudVODService) simulateAliCloudProcessing(ctx context.Context, videoID, jobID string) {
	// Simulate Ali Cloud processing steps
	time.Sleep(2 * time.Second)

	// Update job progress
	s.updateJobProgress(jobID, "processing", 30, "Uploading to Ali Cloud VOD")
	time.Sleep(3 * time.Second)

	s.updateJobProgress(jobID, "processing", 60, "Transcoding video")
	time.Sleep(3 * time.Second)

	s.updateJobProgress(jobID, "processing", 80, "Generating cover image")
	coverUrl := s.generateMockCoverImage(videoID)
	s.updateVideoCover(videoID, coverUrl)
	time.Sleep(2 * time.Second)

	// Complete processing
	s.updateJobProgress(jobID, "completed", 100, "Processing completed")
	cloudUrl := fmt.Sprintf("https://vod.aliyuncs.com/video/%s", videoID)
	playbackUrl := fmt.Sprintf("https://player.alicdn.com/video/%s.m3u8", videoID)

	s.updateVideoCloudUrls(videoID, cloudUrl, playbackUrl)
	s.updateVideoStatus(videoID, "completed", 100)
}

// Helper methods for updating video status
func (s *AliCloudVODService) updateVideoStatus(videoID, status string, progress int) {
	s.db.Table("VideoUploads").Where("Id = ?", videoID).Updates(map[string]interface{}{
		"Status":               status,
		"ProcessingProgress":   progress,
		"LastModificationTime": time.Now(),
	})
}

func (s *AliCloudVODService) updateVideoCover(videoID, coverUrl string) {
	s.db.Table("VideoUploads").Where("Id = ?", videoID).Updates(map[string]interface{}{
		"CoverUrl":             coverUrl,
		"LastModificationTime": time.Now(),
	})
}

func (s *AliCloudVODService) updateVideoPlayback(videoID, playbackUrl string) {
	s.db.Table("VideoUploads").Where("Id = ?", videoID).Updates(map[string]interface{}{
		"PlaybackUrl":          playbackUrl,
		"LastModificationTime": time.Now(),
	})
}

func (s *AliCloudVODService) updateVideoCloudUrls(videoID, cloudUrl, playbackUrl string) {
	s.db.Table("VideoUploads").Where("Id = ?", videoID).Updates(map[string]interface{}{
		"CloudUrl":             cloudUrl,
		"PlaybackUrl":          playbackUrl,
		"LastModificationTime": time.Now(),
	})
}

func (s *AliCloudVODService) updateJobProgress(jobID, status string, progress int, message string) {
	updates := map[string]interface{}{
		"status":     status,
		"progress":   progress,
		"updated_at": time.Now(),
	}

	if status == "completed" {
		updates["completed_at"] = time.Now()
	}

	if message != "" {
		updates["result"] = fmt.Sprintf(`{"message":"%s"}`, message)
	}

	s.db.Table("video_processing_jobs").Where("id = ?", jobID).Updates(updates)
}

func (s *AliCloudVODService) generateMockCoverImage(videoID string) string {
	// Ensure covers directory exists
	coverDir := "uploads/videos/covers"
	os.MkdirAll(coverDir, 0755)

	// Generate a mock cover image URL
	// In a real implementation, this would extract a frame from the video
	// For now, we'll create a placeholder file
	coverPath := filepath.Join(coverDir, fmt.Sprintf("%s_cover.jpg", videoID))

	// Create a simple placeholder file if it doesn't exist
	if _, err := os.Stat(coverPath); os.IsNotExist(err) {
		// Create a minimal placeholder file
		file, err := os.Create(coverPath)
		if err == nil {
			file.WriteString("placeholder cover image")
			file.Close()
		}
	}

	return fmt.Sprintf("http://localhost:8080/uploads/videos/covers/%s_cover.jpg", videoID)
}

// GetVideoStatus returns the current status of a video upload
func (s *AliCloudVODService) GetVideoStatus(videoID string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := s.db.Table("VideoUploads").Where("Id = ?", videoID).First(&result).Error
	return result, err
}

// isValidVideoFile validates if the file is a supported video format
func (s *AliCloudVODService) isValidVideoFile(contentType, ext string) bool {
	// Supported video content types
	validContentTypes := map[string]bool{
		"video/mp4":                true,
		"video/mpeg":               true,
		"video/quicktime":          true,
		"video/x-msvideo":          true, // AVI
		"video/x-ms-wmv":           true, // WMV
		"video/webm":               true,
		"video/ogg":                true,
		"video/3gpp":               true,
		"video/x-flv":              true, // FLV
		"application/octet-stream": true, // Allow for testing
	}

	// Supported file extensions
	validExtensions := map[string]bool{
		".mp4":  true,
		".mpeg": true,
		".mpg":  true,
		".mov":  true,
		".avi":  true,
		".wmv":  true,
		".webm": true,
		".ogg":  true,
		".3gp":  true,
		".flv":  true,
		".mkv":  true,
		".m4v":  true,
		".mod":  true, // Allow for testing
	}

	// Check content type or extension
	return validContentTypes[contentType] || validExtensions[strings.ToLower(ext)]
}

// getExtensionFromContentType returns appropriate file extension for content type
func (s *AliCloudVODService) getExtensionFromContentType(contentType string) string {
	switch contentType {
	case "video/mp4":
		return ".mp4"
	case "video/mpeg":
		return ".mpeg"
	case "video/quicktime":
		return ".mov"
	case "video/x-msvideo":
		return ".avi"
	case "video/x-ms-wmv":
		return ".wmv"
	case "video/webm":
		return ".webm"
	case "video/ogg":
		return ".ogg"
	case "video/3gpp":
		return ".3gp"
	case "video/x-flv":
		return ".flv"
	default:
		return ".mp4" // Default to mp4
	}
}

// saveToLocalStorage saves the uploaded file to local storage
func (s *AliCloudVODService) saveToLocalStorage(file multipart.File, header *multipart.FileHeader, localPath string) (string, error) {
	// Ensure upload directory exists
	if err := os.MkdirAll(filepath.Dir(localPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Create local file
	dst, err := os.Create(localPath)
	if err != nil {
		return "", fmt.Errorf("failed to create local file: %w", err)
	}
	defer dst.Close()

	// Reset file pointer to beginning
	if _, err := file.Seek(0, 0); err != nil {
		return "", fmt.Errorf("failed to reset file pointer: %w", err)
	}

	// Copy file content with size verification
	bytesWritten, err := io.Copy(dst, file)
	if err != nil {
		// Clean up partial file on error
		os.Remove(localPath)
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	// Verify file size matches expected size
	if bytesWritten != header.Size {
		os.Remove(localPath)
		return "", fmt.Errorf("file size mismatch: expected %d bytes, wrote %d bytes", header.Size, bytesWritten)
	}

	// Sync file to disk
	if err := dst.Sync(); err != nil {
		os.Remove(localPath)
		return "", fmt.Errorf("failed to sync file to disk: %w", err)
	}

	// Generate local URL
	filename := filepath.Base(localPath)
	localUrl := fmt.Sprintf("http://localhost:8080/uploads/videos/%s", filename)

	return localUrl, nil
}

// uploadToAliCloudVOD uploads video to Ali Cloud VOD service
func (s *AliCloudVODService) uploadToAliCloudVOD(ctx context.Context, localPath, title, description string) (*AliCloudUploadResponse, error) {
	if s.vodClient == nil {
		return nil, fmt.Errorf("VOD client not initialized")
	}

	fmt.Printf("🚀 Uploading to Ali Cloud VOD: %s\n", localPath)

	// Create upload video request
	createUploadVideoRequest := &vod20170321.CreateUploadVideoRequest{
		Title:       tea.String(title),
		FileName:    tea.String(filepath.Base(localPath)),
		Description: tea.String(description),
	}

	// Call CreateUploadVideo API to get upload credentials
	response, err := s.vodClient.CreateUploadVideo(createUploadVideoRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload video: %w", err)
	}

	if response.Body == nil {
		return nil, fmt.Errorf("empty response from CreateUploadVideo")
	}

	// Extract response data
	aliCloudResponse := &AliCloudUploadResponse{
		VideoId:       tea.StringValue(response.Body.VideoId),
		UploadAuth:    tea.StringValue(response.Body.UploadAuth),
		UploadAddress: tea.StringValue(response.Body.UploadAddress),
		RequestId:     tea.StringValue(response.Body.RequestId),
	}

	fmt.Printf("✅ Ali Cloud VOD upload credentials obtained for VideoId: %s\n", aliCloudResponse.VideoId)

	// Now upload the actual file to OSS using the credentials
	err = s.uploadFileToOSS(localPath, aliCloudResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file to OSS: %w", err)
	}

	fmt.Printf("✅ File successfully uploaded to Ali Cloud OSS for VideoId: %s\n", aliCloudResponse.VideoId)

	return aliCloudResponse, nil
}

// TestCreateUploadVideo tests the CreateUploadVideo API to see credential format
func (s *AliCloudVODService) TestCreateUploadVideo(title, filename, description string) (*AliCloudUploadResponse, error) {
	if s.vodClient == nil {
		return nil, fmt.Errorf("VOD client not initialized")
	}

	fmt.Printf("🧪 Testing CreateUploadVideo API\n")

	// Create upload video request
	createUploadVideoRequest := &vod20170321.CreateUploadVideoRequest{
		Title:       tea.String(title),
		FileName:    tea.String(filename),
		Description: tea.String(description),
	}

	// Call CreateUploadVideo API to get upload credentials
	response, err := s.vodClient.CreateUploadVideo(createUploadVideoRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to create upload video: %w", err)
	}

	if response.Body == nil {
		return nil, fmt.Errorf("empty response from CreateUploadVideo")
	}

	// Extract response data
	aliCloudResponse := &AliCloudUploadResponse{
		VideoId:       tea.StringValue(response.Body.VideoId),
		UploadAuth:    tea.StringValue(response.Body.UploadAuth),
		UploadAddress: tea.StringValue(response.Body.UploadAddress),
		RequestId:     tea.StringValue(response.Body.RequestId),
	}

	fmt.Printf("🧪 Test credentials obtained for VideoId: %s\n", aliCloudResponse.VideoId)
	fmt.Printf("🔍 Raw UploadAddress: %s\n", aliCloudResponse.UploadAddress)
	fmt.Printf("🔍 Raw UploadAuth: %s\n", aliCloudResponse.UploadAuth)

	return aliCloudResponse, nil
}

// uploadFileToOSS uploads the actual video file to Ali Cloud OSS using the upload credentials
func (s *AliCloudVODService) uploadFileToOSS(localPath string, uploadResponse *AliCloudUploadResponse) error {
	fmt.Printf("🔄 Uploading file to OSS: %s\n", localPath)

	// Debug: Print the raw upload credentials (base64 encoded)
	fmt.Printf("🔍 UploadAddress length: %d chars (base64)\n", len(uploadResponse.UploadAddress))
	fmt.Printf("🔍 UploadAuth length: %d chars (base64)\n", len(uploadResponse.UploadAuth))

	// Parse upload address and auth (they might be base64 encoded)
	var addressInfo UploadAddressInfo
	var authInfo UploadAuthInfo

	// Try to decode upload address
	addressData, err := s.decodeUploadCredential(uploadResponse.UploadAddress)
	if err != nil {
		return fmt.Errorf("failed to decode upload address: %w", err)
	}

	if err := json.Unmarshal(addressData, &addressInfo); err != nil {
		return fmt.Errorf("failed to parse upload address JSON: %w", err)
	}

	// Try to decode upload auth
	authData, err := s.decodeUploadCredential(uploadResponse.UploadAuth)
	if err != nil {
		return fmt.Errorf("failed to decode upload auth: %w", err)
	}

	if err := json.Unmarshal(authData, &authInfo); err != nil {
		return fmt.Errorf("failed to parse upload auth JSON: %w", err)
	}

	fmt.Printf("📋 OSS Upload Info - Endpoint: %s, Bucket: %s, FileName: %s\n",
		addressInfo.Endpoint, addressInfo.Bucket, addressInfo.FileName)

	// Create OSS client with STS credentials
	client, err := oss.New(addressInfo.Endpoint, authInfo.AccessKeyId, authInfo.AccessKeySecret,
		oss.SecurityToken(authInfo.SecurityToken))
	if err != nil {
		return fmt.Errorf("failed to create OSS client: %w", err)
	}

	// Get bucket
	bucket, err := client.Bucket(addressInfo.Bucket)
	if err != nil {
		return fmt.Errorf("failed to get OSS bucket: %w", err)
	}

	// Upload file
	fmt.Printf("🚀 Starting OSS upload to bucket: %s, object: %s\n", addressInfo.Bucket, addressInfo.FileName)

	err = bucket.PutObjectFromFile(addressInfo.FileName, localPath)
	if err != nil {
		return fmt.Errorf("failed to upload file to OSS: %w", err)
	}

	fmt.Printf("✅ File successfully uploaded to OSS: %s\n", addressInfo.FileName)

	return nil
}

// decodeUploadCredential decodes upload credentials (handles both base64 and plain JSON)
func (s *AliCloudVODService) decodeUploadCredential(credential string) ([]byte, error) {
	// First try to decode as base64
	if decoded, err := base64.StdEncoding.DecodeString(credential); err == nil {
		// Check if the decoded data looks like JSON
		if len(decoded) > 0 && (decoded[0] == '{' || decoded[0] == '[') {
			return decoded, nil
		}
	}

	// If base64 decoding failed or doesn't look like JSON, treat as plain text
	return []byte(credential), nil
}

// GetAliCloudVideoInfo retrieves video information from Ali Cloud VOD
func (s *AliCloudVODService) GetAliCloudVideoInfo(ctx context.Context, videoId string) (*AliCloudVideoInfo, error) {
	if s.vodClient == nil {
		return nil, fmt.Errorf("VOD client not initialized")
	}

	fmt.Printf("📋 Getting video info from Ali Cloud VOD: %s\n", videoId)

	// Get video info
	getVideoInfoRequest := &vod20170321.GetVideoInfoRequest{
		VideoId: tea.String(videoId),
	}

	videoInfoResponse, err := s.vodClient.GetVideoInfo(getVideoInfoRequest)
	if err != nil {
		return nil, fmt.Errorf("failed to get video info: %w", err)
	}

	if videoInfoResponse.Body == nil || videoInfoResponse.Body.Video == nil {
		return nil, fmt.Errorf("empty video info response")
	}

	video := videoInfoResponse.Body.Video

	// Get play info
	getPlayInfoRequest := &vod20170321.GetPlayInfoRequest{
		VideoId: tea.String(videoId),
	}

	playInfoResponse, err := s.vodClient.GetPlayInfo(getPlayInfoRequest)
	if err != nil {
		fmt.Printf("⚠️  Warning: Failed to get play info: %v\n", err)
		// Continue without play info
	}

	// Build video info
	videoInfo := &AliCloudVideoInfo{
		VideoId:      tea.StringValue(video.VideoId),
		Title:        tea.StringValue(video.Title),
		Description:  tea.StringValue(video.Description),
		Duration:     float64(tea.Float32Value(video.Duration)),
		CoverURL:     tea.StringValue(video.CoverURL),
		Status:       tea.StringValue(video.Status),
		Size:         tea.Int64Value(video.Size),
		CreationTime: tea.StringValue(video.CreationTime),
		PlayInfoList: []struct {
			PlayURL    string `json:"PlayURL"`
			Definition string `json:"Definition"`
			Format     string `json:"Format"`
			Size       int64  `json:"Size"`
			Duration   string `json:"Duration"`
		}{},
	}

	// Add play info if available
	if playInfoResponse.Body != nil && playInfoResponse.Body.PlayInfoList != nil {
		for _, playInfo := range playInfoResponse.Body.PlayInfoList.PlayInfo {
			videoInfo.PlayInfoList = append(videoInfo.PlayInfoList, struct {
				PlayURL    string `json:"PlayURL"`
				Definition string `json:"Definition"`
				Format     string `json:"Format"`
				Size       int64  `json:"Size"`
				Duration   string `json:"Duration"`
			}{
				PlayURL:    tea.StringValue(playInfo.PlayURL),
				Definition: tea.StringValue(playInfo.Definition),
				Format:     tea.StringValue(playInfo.Format),
				Size:       tea.Int64Value(playInfo.Size),
				Duration:   tea.StringValue(playInfo.Duration),
			})
		}
	}

	fmt.Printf("✅ Retrieved video info from Ali Cloud VOD: %s\n", videoInfo.VideoId)

	return videoInfo, nil
}

// processVideoInfoAsync processes video info asynchronously to get PlaybackUrl and CoverUrl
func (s *AliCloudVODService) processVideoInfoAsync(ctx context.Context, videoUploadID, aliCloudVideoId string) {
	maxRetries := 10
	retryDelay := 30 * time.Second

	for i := 0; i < maxRetries; i++ {
		// Wait before checking
		time.Sleep(retryDelay)

		fmt.Printf("🔄 Checking video processing status (attempt %d/%d) for VideoId: %s\n", i+1, maxRetries, aliCloudVideoId)

		// Try to get video info
		videoInfo, err := s.GetAliCloudVideoInfo(ctx, aliCloudVideoId)
		if err != nil {
			fmt.Printf("⚠️  Failed to get video info (attempt %d): %v\n", i+1, err)
			continue
		}

		// Check if video is ready
		if videoInfo.Status == "Normal" && len(videoInfo.PlayInfoList) > 0 {
			playbackUrl := s.ExtractPlayUrl(videoInfo)
			coverUrl := videoInfo.CoverURL

			// Update database with the URLs
			updateData := map[string]interface{}{
				"PlaybackUrl":          playbackUrl,
				"CloudUrl":             playbackUrl,
				"CoverUrl":             coverUrl,
				"Status":               "completed",
				"ProcessingProgress":   100,
				"LastModificationTime": time.Now(),
			}

			if err := s.db.Table("VideoUploads").Where("Id = ?", videoUploadID).Updates(updateData).Error; err != nil {
				fmt.Printf("⚠️  Failed to update video record: %v\n", err)
			} else {
				fmt.Printf("✅ Video processing completed! Updated PlaybackUrl and CoverUrl for VideoId: %s\n", aliCloudVideoId)
			}
			return
		}

		fmt.Printf("⚠️  Video still processing. Status: %s, PlayInfoList count: %d\n", videoInfo.Status, len(videoInfo.PlayInfoList))
	}

	// If we reach here, processing failed or took too long
	fmt.Printf("❌ Video processing timeout or failed for VideoId: %s\n", aliCloudVideoId)
	s.updateVideoStatus(videoUploadID, "processing_timeout", 50)
}

// ExtractPlayUrl extracts the correct play URL from video info
// Based on .NET implementation: uses playInfoList[1].PlayURL (second item, not first!)
// The second item contains the custom domain URL (cast.wemakecrm.com)
func (s *AliCloudVODService) ExtractPlayUrl(videoInfo *AliCloudVideoInfo) string {
	if len(videoInfo.PlayInfoList) > 1 {
		// Use the second play URL (index 1) - matches .NET implementation
		// This should be the custom domain URL (cast.wemakecrm.com)
		return videoInfo.PlayInfoList[1].PlayURL
	} else if len(videoInfo.PlayInfoList) > 0 {
		// Fallback to first URL if only one is available
		return videoInfo.PlayInfoList[0].PlayURL
	}
	return ""
}
