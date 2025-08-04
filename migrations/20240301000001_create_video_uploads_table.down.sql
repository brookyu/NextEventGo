-- Drop video processing jobs table
DROP TABLE IF EXISTS video_processing_jobs;

-- Drop video uploads table
DROP TABLE IF EXISTS VideoUploads;

-- Drop trigger function if no other tables use it
-- Note: Only drop if this is the only table using this function
-- DROP FUNCTION IF EXISTS update_updated_at_column();
