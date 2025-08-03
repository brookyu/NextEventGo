-- Rollback migration for comprehensive entities
-- This will restore the original schema and data

-- ============================================================================
-- 1. DROP NEW TABLES
-- ============================================================================

-- Drop analytics table
DROP TABLE IF EXISTS hits CASCADE;

-- Drop news-related tables
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS news_category_associations CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS news_categories CASCADE;

-- Drop new users table (keep AbpUsers)
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 2. RESTORE SITE IMAGES SCHEMA
-- ============================================================================

-- Remove new columns from site_images table
ALTER TABLE site_images 
DROP COLUMN IF EXISTS filename,
DROP COLUMN IF EXISTS original_name,
DROP COLUMN IF EXISTS storage_path,
DROP COLUMN IF EXISTS storage_driver,
DROP COLUMN IF EXISTS cdn_url,
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS alt_text,
DROP COLUMN IF EXISTS caption,
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS is_public,
DROP COLUMN IF EXISTS is_featured,
DROP COLUMN IF EXISTS keywords,
DROP COLUMN IF EXISTS processed_at,
DROP COLUMN IF EXISTS processing_logs,
DROP COLUMN IF EXISTS has_thumbnail,
DROP COLUMN IF EXISTS thumbnail_path,
DROP COLUMN IF EXISTS has_webp,
DROP COLUMN IF EXISTS webp_path,
DROP COLUMN IF EXISTS download_count,
DROP COLUMN IF EXISTS view_count,
DROP COLUMN IF EXISTS copyright,
DROP COLUMN IF EXISTS license,
DROP COLUMN IF EXISTS source,
DROP COLUMN IF EXISTS created_by,
DROP COLUMN IF EXISTS updated_by;

-- Restore original data from backup if needed
-- UPDATE site_images SET 
--     name = backup_site_images.name,
--     url = backup_site_images.url
-- FROM backup_site_images 
-- WHERE site_images.id = backup_site_images.id;

-- ============================================================================
-- 3. DROP BACKUP TABLES
-- ============================================================================

DROP TABLE IF EXISTS backup_site_images;
DROP TABLE IF EXISTS backup_users;

-- ============================================================================
-- 4. DROP INDEXES
-- ============================================================================

-- Drop indexes that were created for new fields
DROP INDEX IF EXISTS idx_site_images_filename;
DROP INDEX IF EXISTS idx_site_images_type;
DROP INDEX IF EXISTS idx_site_images_status;
DROP INDEX IF EXISTS idx_site_images_is_public;
DROP INDEX IF EXISTS idx_site_images_is_featured;
DROP INDEX IF EXISTS idx_site_images_created_by;
DROP INDEX IF EXISTS idx_site_images_updated_by;

-- ============================================================================
-- 5. VERIFICATION
-- ============================================================================

DO $$
BEGIN
    -- Verify rollback completed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Rollback failed: users table still exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'news') THEN
        RAISE EXCEPTION 'Rollback failed: news table still exists';
    END IF;
    
    RAISE NOTICE 'Rollback completed successfully';
END $$;
