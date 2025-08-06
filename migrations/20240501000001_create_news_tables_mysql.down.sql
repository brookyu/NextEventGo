-- MySQL-compatible News Management System Rollback Migration
-- This migration removes news-related tables and data

-- Drop views first
DROP VIEW IF EXISTS v_featured_news;
DROP VIEW IF EXISTS v_published_news;

-- Drop triggers
DROP TRIGGER IF EXISTS tr_news_articles_updated_at;
DROP TRIGGER IF EXISTS tr_news_categories_updated_at;
DROP TRIGGER IF EXISTS tr_news_updated_at;

-- Drop foreign key constraints first to avoid dependency issues
-- Note: MySQL doesn't support IF EXISTS for foreign keys, so we use a procedure

DELIMITER $$

CREATE PROCEDURE DropForeignKeyIfExists(
    IN table_name VARCHAR(64),
    IN constraint_name VARCHAR(64)
)
BEGIN
    DECLARE constraint_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO constraint_exists
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = table_name
      AND constraint_name = constraint_name
      AND constraint_type = 'FOREIGN KEY';
    
    IF constraint_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' DROP FOREIGN KEY ', constraint_name);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Drop foreign keys from news table
CALL DropForeignKeyIfExists('news', 'fk_news_author');
CALL DropForeignKeyIfExists('news', 'fk_news_editor');
CALL DropForeignKeyIfExists('news', 'fk_news_featured_image');
CALL DropForeignKeyIfExists('news', 'fk_news_thumbnail');
CALL DropForeignKeyIfExists('news', 'fk_news_created_by');
CALL DropForeignKeyIfExists('news', 'fk_news_updated_by');

-- Drop foreign keys from news_categories table
CALL DropForeignKeyIfExists('news_categories', 'fk_news_categories_parent');
CALL DropForeignKeyIfExists('news_categories', 'fk_news_categories_image');
CALL DropForeignKeyIfExists('news_categories', 'fk_news_categories_thumbnail');
CALL DropForeignKeyIfExists('news_categories', 'fk_news_categories_created_by');
CALL DropForeignKeyIfExists('news_categories', 'fk_news_categories_updated_by');

-- Drop foreign keys from news_category_associations table
CALL DropForeignKeyIfExists('news_category_associations', 'fk_news_category_assoc_news');
CALL DropForeignKeyIfExists('news_category_associations', 'fk_news_category_assoc_category');
CALL DropForeignKeyIfExists('news_category_associations', 'fk_news_category_assoc_assigned_by');

-- Drop foreign keys from news_articles table
CALL DropForeignKeyIfExists('news_articles', 'fk_news_articles_news');
CALL DropForeignKeyIfExists('news_articles', 'fk_news_articles_article');
CALL DropForeignKeyIfExists('news_articles', 'fk_news_articles_created_by');
CALL DropForeignKeyIfExists('news_articles', 'fk_news_articles_updated_by');

-- Drop the helper procedure
DROP PROCEDURE IF EXISTS DropForeignKeyIfExists;

-- Drop tables in reverse order of creation (respecting dependencies)
DROP TABLE IF EXISTS news_articles;
DROP TABLE IF EXISTS news_category_associations;
DROP TABLE IF EXISTS news_categories;
DROP TABLE IF EXISTS news;

-- Verify tables are dropped
DO $$
BEGIN
    DECLARE table_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name IN ('news', 'news_categories', 'news_category_associations', 'news_articles');
    
    IF table_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rollback failed: Some news tables still exist';
    END IF;
    
    SELECT 'News management tables rollback completed successfully' as result;
END$$;

-- Success message
SELECT 'News management system rollback completed for MySQL' as result;
