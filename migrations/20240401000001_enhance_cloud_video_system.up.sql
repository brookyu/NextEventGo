-- Enhance existing CloudVideos table and add supporting tables for full video management system
-- This migration enhances the existing CloudVideos table without recreating it or losing data

-- Add missing columns to existing CloudVideos table (only if they don't exist)
DO $$ 
BEGIN
    -- Add StreamKey column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='streamkey') THEN
        ALTER TABLE CloudVideos ADD COLUMN StreamKey VARCHAR(255);
    END IF;
    
    -- Add RequireAuth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='requireauth') THEN
        ALTER TABLE CloudVideos ADD COLUMN RequireAuth BOOLEAN DEFAULT false;
    END IF;
    
    -- Add AllowDownload column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='allowdownload') THEN
        ALTER TABLE CloudVideos ADD COLUMN AllowDownload BOOLEAN DEFAULT false;
    END IF;
    
    -- Add ThumbnailId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='thumbnailid') THEN
        ALTER TABLE CloudVideos ADD COLUMN ThumbnailId VARCHAR(36);
    END IF;
    
    -- Add LikeCount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='likecount') THEN
        ALTER TABLE CloudVideos ADD COLUMN LikeCount BIGINT DEFAULT 0;
    END IF;
    
    -- Add ShareCount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='sharecount') THEN
        ALTER TABLE CloudVideos ADD COLUMN ShareCount BIGINT DEFAULT 0;
    END IF;
    
    -- Add CommentCount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='commentcount') THEN
        ALTER TABLE CloudVideos ADD COLUMN CommentCount BIGINT DEFAULT 0;
    END IF;
    
    -- Add WatchTime column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='watchtime') THEN
        ALTER TABLE CloudVideos ADD COLUMN WatchTime BIGINT DEFAULT 0;
    END IF;
    
    -- Add SEO columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='metatitle') THEN
        ALTER TABLE CloudVideos ADD COLUMN MetaTitle VARCHAR(500);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='metadescription') THEN
        ALTER TABLE CloudVideos ADD COLUMN MetaDescription VARCHAR(1000);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='keywords') THEN
        ALTER TABLE CloudVideos ADD COLUMN Keywords VARCHAR(1000);
    END IF;
    
    -- Add feature toggle columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablecomments') THEN
        ALTER TABLE CloudVideos ADD COLUMN EnableComments BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablelikes') THEN
        ALTER TABLE CloudVideos ADD COLUMN EnableLikes BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablesharing') THEN
        ALTER TABLE CloudVideos ADD COLUMN EnableSharing BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enableanalytics') THEN
        ALTER TABLE CloudVideos ADD COLUMN EnableAnalytics BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Create additional indexes for CloudVideos table (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_cloudvideos_stream_key ON CloudVideos(StreamKey);
CREATE INDEX IF NOT EXISTS idx_cloudvideos_require_auth ON CloudVideos(RequireAuth);
CREATE INDEX IF NOT EXISTS idx_cloudvideos_thumbnail_id ON CloudVideos(ThumbnailId);

-- Enhance existing Hits table for comprehensive analytics (add missing columns)
DO $$ 
BEGIN
    -- Add video-specific metrics if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='watchduration') THEN
        ALTER TABLE Hits ADD COLUMN WatchDuration INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='watchpercentage') THEN
        ALTER TABLE Hits ADD COLUMN WatchPercentage DECIMAL(5,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='playbackspeed') THEN
        ALTER TABLE Hits ADD COLUMN PlaybackSpeed DECIMAL(3,2) DEFAULT 1.0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='quality') THEN
        ALTER TABLE Hits ADD COLUMN Quality VARCHAR(10);
    END IF;
    
    -- Add interaction tracking columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='pausecount') THEN
        ALTER TABLE Hits ADD COLUMN PauseCount INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='seekcount') THEN
        ALTER TABLE Hits ADD COLUMN SeekCount INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='replaycount') THEN
        ALTER TABLE Hits ADD COLUMN ReplayCount INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='volumelevel') THEN
        ALTER TABLE Hits ADD COLUMN VolumeLevel INTEGER DEFAULT 100;
    END IF;
    
    -- Add geographic columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='region') THEN
        ALTER TABLE Hits ADD COLUMN Region VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='timezone') THEN
        ALTER TABLE Hits ADD COLUMN Timezone VARCHAR(50);
    END IF;
    
    -- Add device information columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='platform') THEN
        ALTER TABLE Hits ADD COLUMN Platform VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='screensize') THEN
        ALTER TABLE Hits ADD COLUMN ScreenSize VARCHAR(20);
    END IF;
    
    -- Add timestamp tracking columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='firsthittime') THEN
        ALTER TABLE Hits ADD COLUMN FirstHitTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='lasthittime') THEN
        ALTER TABLE Hits ADD COLUMN LastHitTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='hittimestamps') THEN
        ALTER TABLE Hits ADD COLUMN HitTimeStamps TEXT;
    END IF;
END $$;

-- Create additional indexes for enhanced Hits table
CREATE INDEX IF NOT EXISTS idx_hits_watch_duration ON Hits(WatchDuration);
CREATE INDEX IF NOT EXISTS idx_hits_watch_percentage ON Hits(WatchPercentage);
CREATE INDEX IF NOT EXISTS idx_hits_quality ON Hits(Quality);
CREATE INDEX IF NOT EXISTS idx_hits_platform ON Hits(Platform);
CREATE INDEX IF NOT EXISTS idx_hits_first_hit_time ON Hits(FirstHitTime);
CREATE INDEX IF NOT EXISTS idx_hits_last_hit_time ON Hits(LastHitTime);

-- Create CloudVideo Sessions table for detailed user session tracking
CREATE TABLE IF NOT EXISTS CloudVideoSessions (
    Id VARCHAR(36) PRIMARY KEY,

    -- Video and user references
    CloudVideoId VARCHAR(36) NOT NULL,
    UserId VARCHAR(36), -- Nullable for anonymous users
    SessionId VARCHAR(255) NOT NULL, -- Browser session ID

    -- Session timing
    StartTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EndTime TIMESTAMP,
    LastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Playback tracking
    CurrentPosition INTEGER DEFAULT 0, -- Current position in seconds
    WatchedDuration INTEGER DEFAULT 0, -- Total watched duration in seconds
    PlaybackSpeed DECIMAL(3,2) DEFAULT 1.0, -- Playback speed
    Quality VARCHAR(10), -- Video quality watched

    -- Completion tracking
    CompletionPercentage DECIMAL(5,2) DEFAULT 0, -- 0-100
    IsCompleted BOOLEAN DEFAULT false,
    CompletedAt TIMESTAMP,

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
    LastModificationTime TIMESTAMP
);

-- Create indexes for CloudVideoSessions
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_video_id ON CloudVideoSessions(CloudVideoId);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_user_id ON CloudVideoSessions(UserId);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_session_id ON CloudVideoSessions(SessionId);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_start_time ON CloudVideoSessions(StartTime);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_completion ON CloudVideoSessions(IsCompleted);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_sessions_wechat_open_id ON CloudVideoSessions(WeChatOpenId);

-- Create CloudVideo Timeline Data cache table for performance
CREATE TABLE IF NOT EXISTS CloudVideoTimelineCache (
    Id VARCHAR(36) PRIMARY KEY,
    CloudVideoId VARCHAR(36) NOT NULL,
    TimelineData TEXT NOT NULL, -- JSON data for timeline
    PeakUserCount INTEGER DEFAULT 0,
    PeakTime TIMESTAMP,
    GeneratedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP,

    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP
);

-- Create indexes for timeline cache
CREATE INDEX IF NOT EXISTS idx_cloudvideo_timeline_cache_video_id ON CloudVideoTimelineCache(CloudVideoId);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_timeline_cache_expires_at ON CloudVideoTimelineCache(ExpiresAt);

-- Create WeChat QR Codes table for video distribution (enhance existing or create)
CREATE TABLE IF NOT EXISTS WeiChatQrCodes (
    Id VARCHAR(36) PRIMARY KEY,
    ResourceId VARCHAR(36) NOT NULL, -- CloudVideo ID
    ResourceType VARCHAR(100) NOT NULL, -- 'cloudvideo'
    SceneStr VARCHAR(255) NOT NULL, -- WeChat scene string
    Ticket TEXT, -- WeChat QR code ticket
    QRCodeUrl TEXT, -- QR code image URL
    QRCodeType VARCHAR(50) NOT NULL, -- permanent, temporary
    Status VARCHAR(50) DEFAULT 'active', -- active, expired, revoked
    ExpireTime TIMESTAMP, -- For temporary codes
    ScanCount BIGINT DEFAULT 0,
    LastScanTime TIMESTAMP,
    MaxScans INTEGER DEFAULT 0, -- 0 = unlimited
    IsActive BOOLEAN DEFAULT true,

    -- WeChat API response
    WeChatResponse TEXT, -- Raw WeChat API response

    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP
);

-- Create indexes for QR codes
CREATE INDEX IF NOT EXISTS idx_wechat_qr_codes_resource ON WeiChatQrCodes(ResourceId, ResourceType);
CREATE INDEX IF NOT EXISTS idx_wechat_qr_codes_scene_str ON WeiChatQrCodes(SceneStr);
CREATE INDEX IF NOT EXISTS idx_wechat_qr_codes_status ON WeiChatQrCodes(Status);
CREATE INDEX IF NOT EXISTS idx_wechat_qr_codes_expire_time ON WeiChatQrCodes(ExpireTime);

-- Create CloudVideo Analytics Summary table for performance
CREATE TABLE IF NOT EXISTS CloudVideoAnalytics (
    Id VARCHAR(36) PRIMARY KEY,
    CloudVideoId VARCHAR(36) NOT NULL,

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
    PeakTime TIMESTAMP,

    -- Audit fields
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP,

    -- Unique constraint for period aggregation
    UNIQUE(CloudVideoId, PeriodType, PeriodStart, PeriodEnd)
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_cloudvideo_analytics_video_id ON CloudVideoAnalytics(CloudVideoId);
CREATE INDEX IF NOT EXISTS idx_cloudvideo_analytics_period ON CloudVideoAnalytics(PeriodType, PeriodStart, PeriodEnd);

-- Create trigger function for automatic timestamp updates (if not exists)
CREATE OR REPLACE FUNCTION update_last_modification_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.LastModificationTime = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for LastModificationTime updates on new tables
DO $$
BEGIN
    -- CloudVideoSessions trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cloudvideo_sessions_last_modification_time') THEN
        CREATE TRIGGER update_cloudvideo_sessions_last_modification_time
            BEFORE UPDATE ON CloudVideoSessions
            FOR EACH ROW EXECUTE FUNCTION update_last_modification_time();
    END IF;

    -- CloudVideoTimelineCache trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cloudvideo_timeline_cache_last_modification_time') THEN
        CREATE TRIGGER update_cloudvideo_timeline_cache_last_modification_time
            BEFORE UPDATE ON CloudVideoTimelineCache
            FOR EACH ROW EXECUTE FUNCTION update_last_modification_time();
    END IF;

    -- WeiChatQrCodes trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wechat_qr_codes_last_modification_time') THEN
        CREATE TRIGGER update_wechat_qr_codes_last_modification_time
            BEFORE UPDATE ON WeiChatQrCodes
            FOR EACH ROW EXECUTE FUNCTION update_last_modification_time();
    END IF;

    -- CloudVideoAnalytics trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cloudvideo_analytics_last_modification_time') THEN
        CREATE TRIGGER update_cloudvideo_analytics_last_modification_time
            BEFORE UPDATE ON CloudVideoAnalytics
            FOR EACH ROW EXECUTE FUNCTION update_last_modification_time();
    END IF;
END $$;

-- Create function for cleaning up expired QR codes
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    UPDATE WeiChatQrCodes
    SET Status = 'expired', LastModificationTime = NOW()
    WHERE ExpireTime < NOW() AND Status = 'active' AND QRCodeType = 'temporary';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for aggregating video analytics
CREATE OR REPLACE FUNCTION aggregate_cloudvideo_analytics(
    video_id VARCHAR(36),
    period_type VARCHAR(20),
    period_start TIMESTAMP,
    period_end TIMESTAMP
)
RETURNS VOID AS $$
DECLARE
    analytics_id VARCHAR(36);
    total_views BIGINT;
    unique_viewers BIGINT;
    total_watch_time BIGINT;
    avg_watch_time DECIMAL(10,2);
    completion_rate DECIMAL(5,2);
BEGIN
    -- Generate new UUID for analytics record
    SELECT gen_random_uuid()::VARCHAR(36) INTO analytics_id;

    -- Calculate metrics from Hits and Sessions
    SELECT
        COUNT(*) FILTER (WHERE HitType = 'view'),
        COUNT(DISTINCT COALESCE(UserId, SessionId)) FILTER (WHERE HitType = 'view'),
        COALESCE(SUM(WatchDuration), 0),
        COALESCE(AVG(WatchDuration), 0),
        COALESCE(AVG(WatchPercentage), 0)
    INTO total_views, unique_viewers, total_watch_time, avg_watch_time, completion_rate
    FROM Hits
    WHERE ResourceId = video_id
      AND ResourceType = 'cloudvideo'
      AND CreationTime >= period_start
      AND CreationTime < period_end;

    -- Insert or update analytics record
    INSERT INTO CloudVideoAnalytics (
        Id, CloudVideoId, PeriodType, PeriodStart, PeriodEnd,
        TotalViews, UniqueViewers, TotalWatchTime, AverageWatchTime, CompletionRate
    ) VALUES (
        analytics_id, video_id, period_type, period_start, period_end,
        total_views, unique_viewers, total_watch_time, avg_watch_time, completion_rate
    )
    ON CONFLICT (CloudVideoId, PeriodType, PeriodStart, PeriodEnd)
    DO UPDATE SET
        TotalViews = EXCLUDED.TotalViews,
        UniqueViewers = EXCLUDED.UniqueViewers,
        TotalWatchTime = EXCLUDED.TotalWatchTime,
        AverageWatchTime = EXCLUDED.AverageWatchTime,
        CompletionRate = EXCLUDED.CompletionRate,
        LastModificationTime = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function for generating timeline data
CREATE OR REPLACE FUNCTION generate_cloudvideo_timeline_data(
    video_id VARCHAR(36),
    start_time TIMESTAMP,
    end_time TIMESTAMP
)
RETURNS TEXT AS $$
DECLARE
    timeline_json TEXT;
    peak_count INTEGER;
    peak_time TIMESTAMP;
BEGIN
    -- Generate minute-by-minute user count data
    WITH minute_data AS (
        SELECT
            date_trunc('minute', CreationTime) as minute,
            COUNT(DISTINCT COALESCE(UserId, SessionId)) as user_count
        FROM Hits
        WHERE ResourceId = video_id
          AND ResourceType = 'cloudvideo'
          AND CreationTime >= start_time
          AND CreationTime <= end_time
          AND HitType = 'view'
        GROUP BY date_trunc('minute', CreationTime)
        ORDER BY minute
    ),
    timeline_array AS (
        SELECT json_object_agg(
            to_char(minute, 'YYYY-MM-DD HH24:MI'),
            user_count
        ) as timeline_data
        FROM minute_data
    )
    SELECT timeline_data::TEXT INTO timeline_json FROM timeline_array;

    -- Find peak user count and time
    SELECT
        MAX(user_count),
        minute
    INTO peak_count, peak_time
    FROM (
        SELECT
            date_trunc('minute', CreationTime) as minute,
            COUNT(DISTINCT COALESCE(UserId, SessionId)) as user_count
        FROM Hits
        WHERE ResourceId = video_id
          AND ResourceType = 'cloudvideo'
          AND CreationTime >= start_time
          AND CreationTime <= end_time
          AND HitType = 'view'
        GROUP BY date_trunc('minute', CreationTime)
    ) peak_data;

    -- Return JSON with timeline data and peak info
    RETURN json_build_object(
        'UserCountsEveryMinute', COALESCE(timeline_json::json, '{}'::json),
        'PeakUserCount', COALESCE(peak_count, 0),
        'PeakTime', COALESCE(peak_time, start_time),
        'IsCached', true
    )::TEXT;
END;
$$ LANGUAGE plpgsql;
