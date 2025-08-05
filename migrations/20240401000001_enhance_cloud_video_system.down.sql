-- Reverse the CloudVideo system enhancements
-- This migration removes the enhancements while preserving existing CloudVideos data

-- Drop functions
DROP FUNCTION IF EXISTS generate_cloudvideo_timeline_data(VARCHAR(36), TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS aggregate_cloudvideo_analytics(VARCHAR(36), VARCHAR(20), TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS cleanup_expired_qr_codes();

-- Drop triggers
DROP TRIGGER IF EXISTS update_cloudvideo_analytics_last_modification_time ON CloudVideoAnalytics;
DROP TRIGGER IF EXISTS update_wechat_qr_codes_last_modification_time ON WeiChatQrCodes;
DROP TRIGGER IF EXISTS update_cloudvideo_timeline_cache_last_modification_time ON CloudVideoTimelineCache;
DROP TRIGGER IF EXISTS update_cloudvideo_sessions_last_modification_time ON CloudVideoSessions;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS CloudVideoAnalytics;
DROP TABLE IF EXISTS WeiChatQrCodes;
DROP TABLE IF EXISTS CloudVideoTimelineCache;
DROP TABLE IF EXISTS CloudVideoSessions;

-- Remove enhanced columns from Hits table (only the ones we added)
DO $$ 
BEGIN
    -- Remove video-specific metrics
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='watchduration') THEN
        ALTER TABLE Hits DROP COLUMN WatchDuration;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='watchpercentage') THEN
        ALTER TABLE Hits DROP COLUMN WatchPercentage;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='playbackspeed') THEN
        ALTER TABLE Hits DROP COLUMN PlaybackSpeed;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='quality') THEN
        ALTER TABLE Hits DROP COLUMN Quality;
    END IF;
    
    -- Remove interaction tracking columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='pausecount') THEN
        ALTER TABLE Hits DROP COLUMN PauseCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='seekcount') THEN
        ALTER TABLE Hits DROP COLUMN SeekCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='replaycount') THEN
        ALTER TABLE Hits DROP COLUMN ReplayCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='volumelevel') THEN
        ALTER TABLE Hits DROP COLUMN VolumeLevel;
    END IF;
    
    -- Remove additional geographic and device columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='region') THEN
        ALTER TABLE Hits DROP COLUMN Region;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='timezone') THEN
        ALTER TABLE Hits DROP COLUMN Timezone;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='platform') THEN
        ALTER TABLE Hits DROP COLUMN Platform;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='screensize') THEN
        ALTER TABLE Hits DROP COLUMN ScreenSize;
    END IF;
    
    -- Remove timestamp tracking columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='firsthittime') THEN
        ALTER TABLE Hits DROP COLUMN FirstHitTime;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='lasthittime') THEN
        ALTER TABLE Hits DROP COLUMN LastHitTime;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='hits' AND column_name='hittimestamps') THEN
        ALTER TABLE Hits DROP COLUMN HitTimeStamps;
    END IF;
END $$;

-- Remove enhanced columns from CloudVideos table (only the ones we added)
DO $$ 
BEGIN
    -- Remove streaming and feature columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='streamkey') THEN
        ALTER TABLE CloudVideos DROP COLUMN StreamKey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='requireauth') THEN
        ALTER TABLE CloudVideos DROP COLUMN RequireAuth;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='allowdownload') THEN
        ALTER TABLE CloudVideos DROP COLUMN AllowDownload;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='thumbnailid') THEN
        ALTER TABLE CloudVideos DROP COLUMN ThumbnailId;
    END IF;
    
    -- Remove engagement metrics
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='likecount') THEN
        ALTER TABLE CloudVideos DROP COLUMN LikeCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='sharecount') THEN
        ALTER TABLE CloudVideos DROP COLUMN ShareCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='commentcount') THEN
        ALTER TABLE CloudVideos DROP COLUMN CommentCount;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='watchtime') THEN
        ALTER TABLE CloudVideos DROP COLUMN WatchTime;
    END IF;
    
    -- Remove SEO columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='metatitle') THEN
        ALTER TABLE CloudVideos DROP COLUMN MetaTitle;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='metadescription') THEN
        ALTER TABLE CloudVideos DROP COLUMN MetaDescription;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='keywords') THEN
        ALTER TABLE CloudVideos DROP COLUMN Keywords;
    END IF;
    
    -- Remove feature toggle columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablecomments') THEN
        ALTER TABLE CloudVideos DROP COLUMN EnableComments;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablelikes') THEN
        ALTER TABLE CloudVideos DROP COLUMN EnableLikes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enablesharing') THEN
        ALTER TABLE CloudVideos DROP COLUMN EnableSharing;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cloudvideos' AND column_name='enableanalytics') THEN
        ALTER TABLE CloudVideos DROP COLUMN EnableAnalytics;
    END IF;
END $$;
