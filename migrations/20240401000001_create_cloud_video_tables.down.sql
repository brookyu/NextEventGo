-- Drop CloudVideo tables and related structures
-- This migration reverses the CloudVideo implementation

-- Drop functions
DROP FUNCTION IF EXISTS aggregate_cloudvideo_analytics(VARCHAR(36), VARCHAR(20), TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS cleanup_expired_qr_codes();
DROP FUNCTION IF EXISTS update_last_modification_time() CASCADE;

-- Drop triggers (CASCADE will handle dependencies)
DROP TRIGGER IF EXISTS update_cloudvideos_last_modification_time ON CloudVideos;
DROP TRIGGER IF EXISTS update_hits_last_modification_time ON Hits;
DROP TRIGGER IF EXISTS update_cloudvideo_sessions_last_modification_time ON CloudVideoSessions;
DROP TRIGGER IF EXISTS update_cloudvideo_timeline_cache_last_modification_time ON CloudVideoTimelineCache;
DROP TRIGGER IF EXISTS update_wechat_qr_codes_last_modification_time ON WeiChatQrCodes;
DROP TRIGGER IF EXISTS update_cloudvideo_analytics_last_modification_time ON CloudVideoAnalytics;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS CloudVideoAnalytics;
DROP TABLE IF EXISTS WeiChatQrCodes;
DROP TABLE IF EXISTS CloudVideoTimelineCache;
DROP TABLE IF EXISTS CloudVideoSessions;
DROP TABLE IF EXISTS Hits;
DROP TABLE IF EXISTS CloudVideos;
