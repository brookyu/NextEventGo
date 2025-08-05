-- MySQL-compatible Cloud Video Enhancement Migration - Part 1: Column Additions
-- This migration enhances the existing CloudVideos table

-- Add missing columns to existing CloudVideos table (MySQL syntax)
SET @sql = '';

-- Add StreamKey column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'StreamKey';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN StreamKey VARCHAR(255);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add RequireAuth column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'RequireAuth';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN RequireAuth BOOLEAN DEFAULT false;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add AllowDownload column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'AllowDownload';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN AllowDownload BOOLEAN DEFAULT false;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add ThumbnailId column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'ThumbnailId';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN ThumbnailId CHAR(36);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add LikeCount column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'LikeCount';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN LikeCount BIGINT DEFAULT 0;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add ShareCount column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'ShareCount';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN ShareCount BIGINT DEFAULT 0;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add CommentCount column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'CommentCount';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN CommentCount BIGINT DEFAULT 0;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add WatchTime column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'WatchTime';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN WatchTime BIGINT DEFAULT 0;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add SEO columns if they don't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'MetaTitle';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN MetaTitle VARCHAR(500);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'MetaDescription';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN MetaDescription VARCHAR(1000);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'Keywords';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN Keywords VARCHAR(1000);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add feature toggle columns if they don't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'EnableComments';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN EnableComments BOOLEAN DEFAULT true;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'EnableLikes';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN EnableLikes BOOLEAN DEFAULT true;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'EnableSharing';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN EnableSharing BOOLEAN DEFAULT true;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'EnableAnalytics';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN EnableAnalytics BOOLEAN DEFAULT true;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add PlaybackUrl column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'PlaybackUrl';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN PlaybackUrl VARCHAR(1000);', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add Quality column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'Quality';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN Quality VARCHAR(10) DEFAULT "auto";', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add Duration column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'Duration';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN Duration INTEGER;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add StartTime column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'StartTime';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN StartTime TIMESTAMP NULL;', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add Status column if it doesn't exist
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_schema = 'NextEventDB6' AND table_name = 'CloudVideos' AND column_name = 'Status';
SET @sql = IF(@col_exists = 0, 'ALTER TABLE CloudVideos ADD COLUMN Status VARCHAR(20) NOT NULL DEFAULT "draft";', '');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
