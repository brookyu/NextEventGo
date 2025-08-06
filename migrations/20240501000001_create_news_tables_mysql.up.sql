-- MySQL-compatible News Management System Migration
-- This migration creates news-related tables for MySQL database

-- Check if we're using MySQL
SET @mysql_version = @@version;

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(1000),
    description TEXT,
    content LONGTEXT,
    summary TEXT,
    
    -- Metadata
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    type VARCHAR(20) NOT NULL DEFAULT 'regular',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    
    -- Publishing information
    author_id CHAR(36),
    editor_id CHAR(36),
    published_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    -- SEO and social media
    slug VARCHAR(500) UNIQUE,
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    keywords VARCHAR(1000),
    tags VARCHAR(1000),
    
    -- Media
    featured_image_id CHAR(36),
    thumbnail_id CHAR(36),
    gallery_image_ids TEXT,
    
    -- WeChat integration
    wechat_draft_id VARCHAR(100),
    wechat_published_id VARCHAR(100),
    wechat_url VARCHAR(500),
    wechat_status VARCHAR(50) DEFAULT 'not_synced',
    wechat_synced_at TIMESTAMP NULL,
    
    -- Analytics and engagement
    view_count BIGINT DEFAULT 0,
    share_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    read_time INTEGER DEFAULT 0,
    
    -- Configuration
    allow_comments BOOLEAN DEFAULT true,
    allow_sharing BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    is_sticky BOOLEAN DEFAULT false,
    require_auth BOOLEAN DEFAULT false,
    
    -- Localization
    language VARCHAR(10) DEFAULT 'zh-CN',
    region VARCHAR(10),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    
    -- Indexes
    INDEX idx_news_title (title),
    INDEX idx_news_status (status),
    INDEX idx_news_type (type),
    INDEX idx_news_priority (priority),
    INDEX idx_news_author_id (author_id),
    INDEX idx_news_editor_id (editor_id),
    INDEX idx_news_published_at (published_at),
    INDEX idx_news_scheduled_at (scheduled_at),
    INDEX idx_news_slug (slug),
    INDEX idx_news_is_featured (is_featured),
    INDEX idx_news_is_breaking (is_breaking),
    INDEX idx_news_is_sticky (is_sticky),
    INDEX idx_news_language (language),
    INDEX idx_news_created_at (created_at),
    INDEX idx_news_wechat_draft_id (wechat_draft_id),
    INDEX idx_news_wechat_published_id (wechat_published_id)
);

-- Create news categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(50),
    
    -- Hierarchy
    parent_id CHAR(36),
    level INTEGER DEFAULT 0,
    path VARCHAR(500),
    
    -- Display settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- SEO
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    keywords VARCHAR(1000),
    
    -- Media
    image_id CHAR(36),
    thumbnail_id CHAR(36),
    
    -- Statistics
    news_count BIGINT DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by CHAR(36),
    updated_by CHAR(36),
    
    -- Indexes
    INDEX idx_news_categories_name (name),
    INDEX idx_news_categories_slug (slug),
    INDEX idx_news_categories_parent_id (parent_id),
    INDEX idx_news_categories_level (level),
    INDEX idx_news_categories_is_active (is_active),
    INDEX idx_news_categories_is_featured (is_featured),
    INDEX idx_news_categories_display_order (display_order)
);

-- Create news-category association table
CREATE TABLE IF NOT EXISTS news_category_associations (
    news_id CHAR(36) NOT NULL,
    category_id CHAR(36) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by CHAR(36),
    
    PRIMARY KEY (news_id, category_id),
    INDEX idx_news_category_assoc_news_id (news_id),
    INDEX idx_news_category_assoc_category_id (category_id),
    INDEX idx_news_category_assoc_is_primary (is_primary)
);

-- Create news-article association table
CREATE TABLE IF NOT EXISTS news_articles (
    id CHAR(36) PRIMARY KEY,
    news_id CHAR(36) NOT NULL,
    article_id CHAR(36) NOT NULL,
    
    -- Association metadata
    display_order INTEGER DEFAULT 0,
    is_main_story BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    section VARCHAR(100),
    summary TEXT,
    
    -- Publishing control
    is_visible BOOLEAN DEFAULT true,
    published_at TIMESTAMP NULL,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by CHAR(36),
    updated_by CHAR(36),
    
    -- Indexes
    INDEX idx_news_articles_news_id (news_id),
    INDEX idx_news_articles_article_id (article_id),
    INDEX idx_news_articles_display_order (display_order),
    INDEX idx_news_articles_is_main_story (is_main_story),
    INDEX idx_news_articles_is_featured (is_featured),
    INDEX idx_news_articles_is_visible (is_visible),
    
    -- Unique constraint to prevent duplicate associations
    UNIQUE KEY uk_news_articles_news_article (news_id, article_id)
);

-- Insert default news categories
INSERT IGNORE INTO news_categories (id, name, slug, description, color, icon, level, is_active, is_featured, created_at, updated_at) VALUES
    (UUID(), 'General News', 'general-news', 'General news and announcements', '#007bff', 'newspaper', 0, true, true, NOW(), NOW()),
    (UUID(), 'Technology', 'technology', 'Technology and innovation news', '#28a745', 'laptop', 0, true, true, NOW(), NOW()),
    (UUID(), 'Business', 'business', 'Business and industry updates', '#ffc107', 'briefcase', 0, true, true, NOW(), NOW()),
    (UUID(), 'Events', 'events', 'Event announcements and updates', '#dc3545', 'calendar', 0, true, true, NOW(), NOW()),
    (UUID(), 'Community', 'community', 'Community news and activities', '#6f42c1', 'users', 0, true, false, NOW(), NOW());

-- Create triggers for automatic timestamp updates (MySQL 5.7+)
DELIMITER $$

-- Trigger for news table
CREATE TRIGGER IF NOT EXISTS tr_news_updated_at
    BEFORE UPDATE ON news
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

-- Trigger for news_categories table
CREATE TRIGGER IF NOT EXISTS tr_news_categories_updated_at
    BEFORE UPDATE ON news_categories
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

-- Trigger for news_articles table
CREATE TRIGGER IF NOT EXISTS tr_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- Add foreign key constraints (if tables exist)
-- Note: We use conditional logic to avoid errors if referenced tables don't exist

-- Check if AbpUsers table exists and add foreign keys
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'AbpUsers';

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE news ADD CONSTRAINT fk_news_author FOREIGN KEY (author_id) REFERENCES AbpUsers(Id) ON DELETE SET NULL',
    'SELECT "AbpUsers table not found, skipping author foreign key" as message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE news ADD CONSTRAINT fk_news_editor FOREIGN KEY (editor_id) REFERENCES AbpUsers(Id) ON DELETE SET NULL',
    'SELECT "AbpUsers table not found, skipping editor foreign key" as message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check if SiteImages table exists and add foreign keys
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'SiteImages';

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE news ADD CONSTRAINT fk_news_featured_image FOREIGN KEY (featured_image_id) REFERENCES SiteImages(Id) ON DELETE SET NULL',
    'SELECT "SiteImages table not found, skipping featured image foreign key" as message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add foreign keys for news associations
ALTER TABLE news_category_associations 
ADD CONSTRAINT fk_news_category_assoc_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_news_category_assoc_category FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE CASCADE;

-- Check if SiteArticles table exists and add foreign keys
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'SiteArticles';

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE news_articles ADD CONSTRAINT fk_news_articles_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE',
    'SELECT "Adding news_articles news foreign key" as message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(@table_exists > 0, 
    'ALTER TABLE news_articles ADD CONSTRAINT fk_news_articles_article FOREIGN KEY (article_id) REFERENCES SiteArticles(Id) ON DELETE CASCADE',
    'SELECT "SiteArticles table not found, skipping article foreign key" as message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Create views for common queries
CREATE OR REPLACE VIEW v_published_news AS
SELECT 
    n.*,
    nc.name as primary_category_name,
    nc.slug as primary_category_slug,
    (SELECT COUNT(*) FROM news_articles na WHERE na.news_id = n.id AND na.is_visible = true) as article_count
FROM news n
LEFT JOIN news_category_associations nca ON n.id = nca.news_id AND nca.is_primary = true
LEFT JOIN news_categories nc ON nca.category_id = nc.id
WHERE n.status = 'published' 
  AND (n.published_at IS NULL OR n.published_at <= NOW())
  AND (n.expires_at IS NULL OR n.expires_at > NOW())
  AND n.deleted_at IS NULL;

-- Create view for featured news
CREATE OR REPLACE VIEW v_featured_news AS
SELECT n.*, nc.name as category_name
FROM news n
LEFT JOIN news_category_associations nca ON n.id = nca.news_id AND nca.is_primary = true
LEFT JOIN news_categories nc ON nca.category_id = nc.id
WHERE n.is_featured = true 
  AND n.status = 'published'
  AND n.deleted_at IS NULL
ORDER BY n.created_at DESC;

-- Success message
SELECT 'News management tables created successfully for MySQL' as result;
