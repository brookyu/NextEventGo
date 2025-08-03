-- Drop functions
DROP FUNCTION IF EXISTS get_popular_tags(INTEGER);
DROP FUNCTION IF EXISTS cleanup_expired_uploads();
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop views
DROP VIEW IF EXISTS category_stats;
DROP VIEW IF EXISTS image_stats;

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS image_versions;
DROP TABLE IF EXISTS image_metadata;
DROP TABLE IF EXISTS image_usage;
DROP TABLE IF EXISTS image_processing_jobs;
DROP TABLE IF EXISTS image_uploads;
DROP TABLE IF EXISTS site_images;
DROP TABLE IF EXISTS image_categories;
