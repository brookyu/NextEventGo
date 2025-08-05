-- Simple MySQL migration - add columns (ignore errors if they exist)

-- Add new columns to CloudVideos table
ALTER TABLE CloudVideos ADD COLUMN StreamKey VARCHAR(255);
ALTER TABLE CloudVideos ADD COLUMN RequireAuth BOOLEAN DEFAULT false;
ALTER TABLE CloudVideos ADD COLUMN AllowDownload BOOLEAN DEFAULT false;
ALTER TABLE CloudVideos ADD COLUMN ThumbnailId CHAR(36);
ALTER TABLE CloudVideos ADD COLUMN LikeCount BIGINT DEFAULT 0;
ALTER TABLE CloudVideos ADD COLUMN ShareCount BIGINT DEFAULT 0;
ALTER TABLE CloudVideos ADD COLUMN CommentCount BIGINT DEFAULT 0;
ALTER TABLE CloudVideos ADD COLUMN WatchTime BIGINT DEFAULT 0;
ALTER TABLE CloudVideos ADD COLUMN MetaTitle VARCHAR(500);
ALTER TABLE CloudVideos ADD COLUMN MetaDescription VARCHAR(1000);
ALTER TABLE CloudVideos ADD COLUMN Keywords VARCHAR(1000);
ALTER TABLE CloudVideos ADD COLUMN EnableComments BOOLEAN DEFAULT true;
ALTER TABLE CloudVideos ADD COLUMN EnableLikes BOOLEAN DEFAULT true;
ALTER TABLE CloudVideos ADD COLUMN EnableSharing BOOLEAN DEFAULT true;
ALTER TABLE CloudVideos ADD COLUMN EnableAnalytics BOOLEAN DEFAULT true;
ALTER TABLE CloudVideos ADD COLUMN PlaybackUrl VARCHAR(1000);
ALTER TABLE CloudVideos ADD COLUMN Quality VARCHAR(10) DEFAULT 'auto';
ALTER TABLE CloudVideos ADD COLUMN Duration INTEGER;
ALTER TABLE CloudVideos ADD COLUMN StartTime TIMESTAMP NULL;
ALTER TABLE CloudVideos ADD COLUMN Status VARCHAR(20) NOT NULL DEFAULT 'draft';

-- Create CloudVideo Sessions table for detailed user session tracking
CREATE TABLE CloudVideoSessions (
    Id CHAR(36) PRIMARY KEY,
    
    -- Video and user references
    CloudVideoId CHAR(36) NOT NULL,
    UserId CHAR(36), -- Nullable for anonymous users
    SessionId VARCHAR(255) NOT NULL, -- Browser session ID
    
    -- Session timing
    StartTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EndTime TIMESTAMP NULL,
    LastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Playback tracking
    CurrentPosition BIGINT DEFAULT 0, -- Current position in seconds
    WatchedDuration BIGINT DEFAULT 0, -- Total watched duration in seconds
    PlaybackSpeed DECIMAL(3,2) DEFAULT 1.0, -- Playback speed
    Quality VARCHAR(10), -- Video quality watched
    
    -- Completion tracking
    CompletionPercentage DECIMAL(5,2) DEFAULT 0, -- 0-100
    IsCompleted BOOLEAN DEFAULT false,
    CompletedAt TIMESTAMP NULL,
    
    -- Interaction tracking
    PauseCount INTEGER DEFAULT 0,
    SeekCount INTEGER DEFAULT 0,
    ReplayCount INTEGER DEFAULT 0,
    VolumeLevel INTEGER DEFAULT 100,
    
    -- Device and environment
    IPAddress VARCHAR(45),
    UserAgent TEXT,
    DeviceType VARCHAR(50), -- mobile, tablet, desktop
    Browser VARCHAR(100),
    OS VARCHAR(100),
    ScreenSize VARCHAR(20), -- e.g., "1920x1080"
    Bandwidth VARCHAR(20), -- Estimated bandwidth
    
    -- Geographic information
    Country VARCHAR(100),
    Region VARCHAR(100),
    City VARCHAR(100),
    Timezone VARCHAR(50),
    
    -- Engagement metrics
    EngagementScore DECIMAL(5,2) DEFAULT 0,
    AttentionSpan DECIMAL(5,2) DEFAULT 0, -- Average continuous watch time
    
    -- Additional metadata
    Referrer VARCHAR(1000),
    Metadata TEXT, -- JSON for additional session data
    
    -- WeChat integration
    WeChatOpenId VARCHAR(255),
    WeChatUnionId VARCHAR(255),
    
    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cloudvideo_sessions_video_id (CloudVideoId),
    INDEX idx_cloudvideo_sessions_user_id (UserId),
    INDEX idx_cloudvideo_sessions_session_id (SessionId),
    INDEX idx_cloudvideo_sessions_start_time (StartTime),
    INDEX idx_cloudvideo_sessions_completion (IsCompleted),
    INDEX idx_cloudvideo_sessions_wechat_open_id (WeChatOpenId)
);

-- Create CloudVideo Analytics Summary table for performance
CREATE TABLE CloudVideoAnalytics (
    Id CHAR(36) PRIMARY KEY,
    CloudVideoId CHAR(36) NOT NULL,
    
    -- Time period
    PeriodType VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    PeriodStart TIMESTAMP NOT NULL,
    PeriodEnd TIMESTAMP NOT NULL,
    
    -- View metrics
    TotalViews BIGINT DEFAULT 0,
    UniqueViewers BIGINT DEFAULT 0,
    TotalWatchTime BIGINT DEFAULT 0, -- in seconds
    AverageWatchTime DECIMAL(10,2) DEFAULT 0,
    CompletionRate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    TotalShares BIGINT DEFAULT 0,
    TotalLikes BIGINT DEFAULT 0,
    TotalComments BIGINT DEFAULT 0,
    EngagementRate DECIMAL(5,2) DEFAULT 0,
    
    -- Geographic distribution (JSON)
    CountryDistribution TEXT, -- JSON object
    CityDistribution TEXT, -- JSON object
    
    -- Device distribution (JSON)
    DeviceDistribution TEXT, -- JSON object
    BrowserDistribution TEXT, -- JSON object
    
    -- Quality distribution (JSON)
    QualityDistribution TEXT, -- JSON object
    
    -- Peak metrics
    PeakConcurrentViewers INTEGER DEFAULT 0,
    PeakTime TIMESTAMP NULL,
    
    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cloudvideo_analytics_video_id (CloudVideoId),
    INDEX idx_cloudvideo_analytics_period (PeriodType, PeriodStart, PeriodEnd),
    UNIQUE KEY unique_period (CloudVideoId, PeriodType, PeriodStart, PeriodEnd)
);

-- Create CloudVideo Timeline Data cache table for performance
CREATE TABLE CloudVideoTimelineCache (
    Id CHAR(36) PRIMARY KEY,
    CloudVideoId CHAR(36) NOT NULL,
    TimelineData TEXT NOT NULL, -- JSON data for timeline
    PeakUserCount INTEGER DEFAULT 0,
    PeakTime TIMESTAMP NULL,
    GeneratedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP NULL,
    
    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_cloudvideo_timeline_cache_video_id (CloudVideoId),
    INDEX idx_cloudvideo_timeline_cache_expires_at (ExpiresAt)
);

-- Add video-specific columns to Hits table
ALTER TABLE Hits ADD COLUMN WatchDuration INTEGER DEFAULT 0;
ALTER TABLE Hits ADD COLUMN WatchPercentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE Hits ADD COLUMN PlaybackSpeed DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE Hits ADD COLUMN Quality VARCHAR(10);
ALTER TABLE Hits ADD COLUMN PauseCount INTEGER DEFAULT 0;
ALTER TABLE Hits ADD COLUMN SeekCount INTEGER DEFAULT 0;
ALTER TABLE Hits ADD COLUMN ReplayCount INTEGER DEFAULT 0;
ALTER TABLE Hits ADD COLUMN VolumeLevel INTEGER DEFAULT 100;
