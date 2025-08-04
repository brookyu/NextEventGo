-- Drop and recreate VideoUploads table with correct schema
DROP TABLE IF EXISTS VideoUploads;

-- Create video uploads table for Ali Cloud VOD integration
-- Schema matches what GetVideos API expects
CREATE TABLE VideoUploads (
    Id VARCHAR(36) PRIMARY KEY,
    Title VARCHAR(500) NOT NULL,
    Description TEXT,
    
    -- URLs (matching GetVideos API expectations)
    Url VARCHAR(1000), -- Local URL
    PlaybackUrl VARCHAR(1000), -- Playback URL
    CloudUrl VARCHAR(1000), -- Ali Cloud VOD URL
    CoverUrl VARCHAR(1000), -- Cover image URL
    
    -- Video metadata
    Duration INTEGER, -- in seconds
    Quality VARCHAR(20) DEFAULT 'HD',
    VideoType VARCHAR(50) DEFAULT 'uploaded',
    Format VARCHAR(50),
    Size BIGINT, -- File size
    
    -- Processing status
    Status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, completed, failed
    
    -- User and engagement
    Author VARCHAR(255),
    ViewCount BIGINT DEFAULT 0,
    
    -- Access control
    IsOpen BOOLEAN DEFAULT true,
    IsDeleted BOOLEAN DEFAULT false,
    
    -- Audit fields (matching ABP Framework pattern)
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP NULL
);

-- Create indexes
CREATE INDEX idx_video_uploads_status ON VideoUploads(Status);
CREATE INDEX idx_video_uploads_creation_time ON VideoUploads(CreationTime);
CREATE INDEX idx_video_uploads_is_deleted ON VideoUploads(IsDeleted);
