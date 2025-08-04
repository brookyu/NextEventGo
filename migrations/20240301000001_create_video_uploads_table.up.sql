-- Create video uploads table for Ali Cloud VOD integration
-- Schema matches what GetVideos API expects
CREATE TABLE IF NOT EXISTS VideoUploads (
    Id VARCHAR(36) PRIMARY KEY, -- Using VARCHAR to match existing pattern
    Title VARCHAR(500) NOT NULL,
    Description TEXT,
    FileName VARCHAR(255) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize BIGINT NOT NULL,
    ContentType VARCHAR(100) NOT NULL,

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
    Size BIGINT, -- Alias for FileSize

    -- Processing status
    Status VARCHAR(50) DEFAULT 'uploaded', -- uploaded, processing, completed, failed
    ProcessingJobId VARCHAR(255), -- Ali Cloud processing job ID
    ProcessingProgress INTEGER DEFAULT 0, -- 0-100
    ProcessingLogs TEXT,

    -- Additional metadata
    Width INTEGER,
    Height INTEGER,
    Bitrate INTEGER,
    FrameRate DECIMAL(5,2),
    Codec VARCHAR(50),

    -- User and engagement
    Author VARCHAR(255),
    ViewCount BIGINT DEFAULT 0,

    -- Access control
    IsOpen BOOLEAN DEFAULT true,
    IsDeleted BOOLEAN DEFAULT false,

    -- Audit fields (matching ABP Framework pattern)
    CreationTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastModificationTime TIMESTAMP NULL,
    DeletionTime TIMESTAMP NULL,
    CreatorId VARCHAR(36),
    LastModifierId VARCHAR(36),
    DeleterId VARCHAR(36)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_uploads_status ON VideoUploads(Status);
CREATE INDEX IF NOT EXISTS idx_video_uploads_creation_time ON VideoUploads(CreationTime);
CREATE INDEX IF NOT EXISTS idx_video_uploads_is_deleted ON VideoUploads(IsDeleted);
CREATE INDEX IF NOT EXISTS idx_video_uploads_creator_id ON VideoUploads(CreatorId);

-- Create video processing jobs table
CREATE TABLE IF NOT EXISTS video_processing_jobs (
    id VARCHAR(36) PRIMARY KEY,
    video_upload_id VARCHAR(36) NOT NULL REFERENCES VideoUploads(Id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL, -- upload, transcode, thumbnail, cover
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    cloud_job_id VARCHAR(255), -- Ali Cloud job ID
    parameters JSONB,
    result JSONB,
    error_message TEXT,
    progress INTEGER DEFAULT 0, -- 0-100
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_video_upload_id ON video_processing_jobs(video_upload_id);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_status ON video_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_job_type ON video_processing_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_video_processing_jobs_cloud_job_id ON video_processing_jobs(cloud_job_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_last_modification_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.LastModificationTime = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for LastModificationTime
CREATE TRIGGER update_video_uploads_last_modification_time
    BEFORE UPDATE ON VideoUploads
    FOR EACH ROW EXECUTE FUNCTION update_last_modification_time();

CREATE TRIGGER update_video_processing_jobs_updated_at 
    BEFORE UPDATE ON video_processing_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
