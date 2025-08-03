-- Create image categories table
CREATE TABLE IF NOT EXISTS image_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site images table
CREATE TABLE IF NOT EXISTS site_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    category_id UUID REFERENCES image_categories(id) ON DELETE SET NULL,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_images_category_id ON site_images(category_id);
CREATE INDEX IF NOT EXISTS idx_site_images_is_public ON site_images(is_public);
CREATE INDEX IF NOT EXISTS idx_site_images_created_at ON site_images(created_at);
CREATE INDEX IF NOT EXISTS idx_site_images_tags ON site_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_site_images_name ON site_images(name);
CREATE INDEX IF NOT EXISTS idx_site_images_mime_type ON site_images(mime_type);

-- Create image uploads table for tracking temporary uploads
CREATE TABLE IF NOT EXISTS image_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(255) NOT NULL,
    temp_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_image_uploads_status ON image_uploads(status);
CREATE INDEX IF NOT EXISTS idx_image_uploads_expires_at ON image_uploads(expires_at);
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_id ON image_uploads(user_id);

-- Create image processing jobs table
CREATE TABLE IF NOT EXISTS image_processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES site_images(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    parameters JSONB,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_processing_jobs_image_id ON image_processing_jobs(image_id);
CREATE INDEX IF NOT EXISTS idx_image_processing_jobs_status ON image_processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_image_processing_jobs_job_type ON image_processing_jobs(job_type);

-- Create image usage table to track where images are used
CREATE TABLE IF NOT EXISTS image_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES site_images(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    usage_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_usage_image_id ON image_usage(image_id);
CREATE INDEX IF NOT EXISTS idx_image_usage_entity ON image_usage(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_image_usage_usage_type ON image_usage(usage_type);

-- Create image metadata table for additional image information
CREATE TABLE IF NOT EXISTS image_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL UNIQUE REFERENCES site_images(id) ON DELETE CASCADE,
    exif_data JSONB,
    color_palette JSONB,
    alt_text TEXT,
    caption TEXT,
    copyright VARCHAR(255),
    source VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_metadata_image_id ON image_metadata(image_id);

-- Create image versions table for different sizes/formats
CREATE TABLE IF NOT EXISTS image_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID NOT NULL REFERENCES site_images(id) ON DELETE CASCADE,
    version_type VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    quality INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_versions_image_id ON image_versions(image_id);
CREATE INDEX IF NOT EXISTS idx_image_versions_type ON image_versions(version_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_image_categories_updated_at 
    BEFORE UPDATE ON image_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_images_updated_at 
    BEFORE UPDATE ON site_images 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_processing_jobs_updated_at 
    BEFORE UPDATE ON image_processing_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_metadata_updated_at 
    BEFORE UPDATE ON image_metadata 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default image categories
INSERT INTO image_categories (name, description, color) VALUES
    ('General', 'General purpose images', '#6B7280'),
    ('Articles', 'Images for articles and blog posts', '#3B82F6'),
    ('Covers', 'Cover images and banners', '#10B981'),
    ('Thumbnails', 'Thumbnail images', '#F59E0B'),
    ('Icons', 'Icons and small graphics', '#8B5CF6'),
    ('Backgrounds', 'Background images', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Create view for image statistics
CREATE OR REPLACE VIEW image_stats AS
SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE is_public = true) as public_images,
    COUNT(*) FILTER (WHERE is_public = false) as private_images,
    COALESCE(SUM(file_size), 0) as total_size,
    COUNT(DISTINCT category_id) as categories_used,
    AVG(file_size) as avg_file_size,
    MAX(file_size) as max_file_size,
    MIN(file_size) as min_file_size
FROM site_images;

-- Create view for category statistics
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.color,
    COUNT(i.id) as image_count,
    COALESCE(SUM(i.file_size), 0) as total_size,
    COALESCE(AVG(i.file_size), 0) as avg_file_size
FROM image_categories c
LEFT JOIN site_images i ON c.id = i.category_id
GROUP BY c.id, c.name, c.description, c.color
ORDER BY image_count DESC;

-- Create function to clean up expired uploads
CREATE OR REPLACE FUNCTION cleanup_expired_uploads()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM image_uploads 
    WHERE expires_at < NOW() AND status IN ('pending', 'failed');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get popular tags
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(tag TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        unnest_tags.tag,
        COUNT(*) as tag_count
    FROM (
        SELECT unnest(tags) as tag
        FROM site_images
        WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    ) unnest_tags
    GROUP BY unnest_tags.tag
    ORDER BY tag_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
