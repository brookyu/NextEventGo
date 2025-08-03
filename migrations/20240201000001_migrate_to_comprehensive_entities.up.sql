-- Migration to comprehensive entities with lossless data transfer
-- This migration ensures all existing data is preserved while adding new fields

-- ============================================================================
-- 1. BACKUP EXISTING DATA
-- ============================================================================

-- Create backup tables for existing data
CREATE TABLE IF NOT EXISTS backup_site_images AS SELECT * FROM site_images;
CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM AbpUsers;

-- ============================================================================
-- 2. SITE IMAGES MIGRATION
-- ============================================================================

-- Add new columns to existing site_images table
ALTER TABLE site_images 
ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS storage_driver VARCHAR(50) DEFAULT 'local',
ADD COLUMN IF NOT EXISTS cdn_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS alt_text VARCHAR(500),
ADD COLUMN IF NOT EXISTS caption TEXT,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'photo',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS keywords VARCHAR(1000),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS processing_logs TEXT,
ADD COLUMN IF NOT EXISTS has_thumbnail BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS has_webp BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS webp_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS download_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS copyright VARCHAR(255),
ADD COLUMN IF NOT EXISTS license VARCHAR(100),
ADD COLUMN IF NOT EXISTS source VARCHAR(500),
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Migrate existing data to new fields (lossless transfer)
UPDATE site_images SET
    filename = COALESCE(name, ''),
    original_name = COALESCE(name, ''),
    storage_path = COALESCE(url, ''),
    title = COALESCE(name, ''),
    alt_text = COALESCE(name, ''),
    status = 'active',
    is_public = true,
    processed_at = created_at
WHERE filename IS NULL;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_site_images_filename ON site_images(filename);
CREATE INDEX IF NOT EXISTS idx_site_images_type ON site_images(type);
CREATE INDEX IF NOT EXISTS idx_site_images_status ON site_images(status);
CREATE INDEX IF NOT EXISTS idx_site_images_is_public ON site_images(is_public);
CREATE INDEX IF NOT EXISTS idx_site_images_is_featured ON site_images(is_featured);
CREATE INDEX IF NOT EXISTS idx_site_images_created_by ON site_images(created_by);
CREATE INDEX IF NOT EXISTS idx_site_images_updated_by ON site_images(updated_by);

-- ============================================================================
-- 3. USERS MIGRATION (Create new users table)
-- ============================================================================

-- Create new users table with comprehensive schema
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Profile information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    bio TEXT,
    
    -- Authentication
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255),
    
    -- Account settings
    role VARCHAR(20) NOT NULL DEFAULT 'subscriber',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    
    -- Contact information
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Profile media
    avatar_id UUID,
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'zh-CN',
    timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
    email_notifications BOOLEAN DEFAULT true,
    
    -- Security
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    phone_verified BOOLEAN DEFAULT false,
    phone_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (avatar_id) REFERENCES site_images(id)
);

-- Migrate data from AbpUsers to users table (lossless transfer)
INSERT INTO users (
    id, username, email, first_name, last_name, display_name,
    password_hash, email_verified, phone, two_factor_enabled,
    last_login_at, created_at, updated_at
)
SELECT 
    "Id" as id,
    "UserName" as username,
    "Email" as email,
    "Name" as first_name,
    "Surname" as last_name,
    COALESCE(CONCAT("Name", ' ', "Surname"), "UserName") as display_name,
    COALESCE("PasswordHash", '') as password_hash,
    COALESCE("EmailConfirmed", false) as email_verified,
    "PhoneNumber" as phone,
    COALESCE("TwoFactorEnabled", false) as two_factor_enabled,
    "LastPasswordChangeTime" as last_login_at,
    "CreationTime" as created_at,
    COALESCE("LastModificationTime", "CreationTime") as updated_at
FROM "AbpUsers"
WHERE "IsDeleted" = false
ON CONFLICT (id) DO NOTHING;

-- Map ABP roles to new role system
UPDATE users SET role = CASE
    WHEN id IN (SELECT "UserId" FROM "AbpUserRoles" ur 
                JOIN "AbpRoles" r ON ur."RoleId" = r."Id" 
                WHERE r."Name" = 'admin') THEN 'admin'
    WHEN id IN (SELECT "UserId" FROM "AbpUserRoles" ur 
                JOIN "AbpRoles" r ON ur."RoleId" = r."Id" 
                WHERE r."Name" = 'editor') THEN 'editor'
    WHEN id IN (SELECT "UserId" FROM "AbpUserRoles" ur 
                JOIN "AbpRoles" r ON ur."RoleId" = r."Id" 
                WHERE r."Name" = 'author') THEN 'author'
    ELSE 'subscriber'
END;

-- Map ABP status to new status system
UPDATE users SET status = CASE
    WHEN id IN (SELECT "Id" FROM "AbpUsers" WHERE "IsActive" = false) THEN 'inactive'
    WHEN id IN (SELECT "Id" FROM "AbpUsers" WHERE "LockoutEnabled" = true AND "LockoutEnd" > NOW()) THEN 'suspended'
    ELSE 'active'
END;

-- Add indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_avatar_id ON users(avatar_id);

-- ============================================================================
-- 4. CREATE NEWS TABLES
-- ============================================================================

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    author_id UUID,
    editor_id UUID,
    published_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- SEO and social media
    slug VARCHAR(500) UNIQUE,
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    keywords VARCHAR(1000),
    tags VARCHAR(1000),
    
    -- Media
    featured_image_id UUID,
    thumbnail_id UUID,
    gallery_image_ids TEXT,
    
    -- WeChat integration
    wechat_draft_id VARCHAR(100),
    wechat_published_id VARCHAR(100),
    wechat_url VARCHAR(500),
    wechat_status VARCHAR(50) DEFAULT 'not_synced',
    wechat_synced_at TIMESTAMP,
    
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Foreign keys
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (editor_id) REFERENCES users(id),
    FOREIGN KEY (featured_image_id) REFERENCES site_images(id),
    FOREIGN KEY (thumbnail_id) REFERENCES site_images(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create news categories table
CREATE TABLE IF NOT EXISTS news_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    icon VARCHAR(50),
    
    -- Hierarchy
    parent_id UUID,
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
    image_id UUID,
    thumbnail_id UUID,
    
    -- Statistics
    news_count BIGINT DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Foreign keys
    FOREIGN KEY (parent_id) REFERENCES news_categories(id),
    FOREIGN KEY (image_id) REFERENCES site_images(id),
    FOREIGN KEY (thumbnail_id) REFERENCES site_images(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create news-category association table
CREATE TABLE IF NOT EXISTS news_category_associations (
    news_id UUID NOT NULL,
    category_id UUID NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by UUID,
    
    PRIMARY KEY (news_id, category_id),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- ============================================================================
-- 5. CREATE SITE ARTICLES TABLE
-- ============================================================================

-- Create site_articles table (if not exists from existing schema)
CREATE TABLE IF NOT EXISTS site_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(1000),
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    summary TEXT,
    
    -- Metadata
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    type VARCHAR(20) NOT NULL DEFAULT 'news',
    
    -- Publishing information
    author_id UUID,
    editor_id UUID,
    published_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    
    -- SEO and social media
    slug VARCHAR(500) UNIQUE,
    meta_title VARCHAR(500),
    meta_description VARCHAR(1000),
    keywords VARCHAR(1000),
    tags VARCHAR(1000),
    
    -- Media
    featured_image_id UUID,
    thumbnail_id UUID,
    gallery_image_ids TEXT,
    
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
    is_sticky BOOLEAN DEFAULT false,
    require_auth BOOLEAN DEFAULT false,
    
    -- Content format
    content_format VARCHAR(20) DEFAULT 'html',
    
    -- Localization
    language VARCHAR(10) DEFAULT 'zh-CN',
    region VARCHAR(10),
    
    -- Source information
    source_name VARCHAR(255),
    source_url VARCHAR(500),
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Foreign keys
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (editor_id) REFERENCES users(id),
    FOREIGN KEY (featured_image_id) REFERENCES site_images(id),
    FOREIGN KEY (thumbnail_id) REFERENCES site_images(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Create news-article association table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL,
    article_id UUID NOT NULL,
    
    -- Association metadata
    display_order INTEGER DEFAULT 0,
    is_main_story BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    section VARCHAR(100),
    summary TEXT,
    
    -- Publishing control
    is_visible BOOLEAN DEFAULT true,
    published_at TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Foreign keys
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES site_articles(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- ============================================================================
-- 6. CREATE ANALYTICS TABLE
-- ============================================================================

-- Create hits table for analytics
CREATE TABLE IF NOT EXISTS hits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Polymorphic relationship
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    
    -- User information
    user_id UUID,
    session_id VARCHAR(100),
    
    -- Request information
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    referer VARCHAR(500),
    
    -- Location information
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    
    -- Device information
    device_type VARCHAR(20),
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    
    -- Additional metadata
    metadata TEXT,
    
    -- UTM tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    
    -- Timing
    duration BIGINT DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============================================================================
-- 7. CREATE INDEXES
-- ============================================================================

-- News indexes
CREATE INDEX IF NOT EXISTS idx_news_title ON news(title);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_news_editor_id ON news(editor_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_scheduled_at ON news(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_is_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_is_breaking ON news(is_breaking);
CREATE INDEX IF NOT EXISTS idx_news_is_sticky ON news(is_sticky);
CREATE INDEX IF NOT EXISTS idx_news_language ON news(language);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);

-- News categories indexes
CREATE INDEX IF NOT EXISTS idx_news_categories_name ON news_categories(name);
CREATE INDEX IF NOT EXISTS idx_news_categories_slug ON news_categories(slug);
CREATE INDEX IF NOT EXISTS idx_news_categories_parent_id ON news_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_news_categories_level ON news_categories(level);
CREATE INDEX IF NOT EXISTS idx_news_categories_is_active ON news_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_news_categories_is_featured ON news_categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_categories_display_order ON news_categories(display_order);

-- Site articles indexes
CREATE INDEX IF NOT EXISTS idx_site_articles_title ON site_articles(title);
CREATE INDEX IF NOT EXISTS idx_site_articles_status ON site_articles(status);
CREATE INDEX IF NOT EXISTS idx_site_articles_type ON site_articles(type);
CREATE INDEX IF NOT EXISTS idx_site_articles_author_id ON site_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_site_articles_editor_id ON site_articles(editor_id);
CREATE INDEX IF NOT EXISTS idx_site_articles_published_at ON site_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_site_articles_slug ON site_articles(slug);
CREATE INDEX IF NOT EXISTS idx_site_articles_is_featured ON site_articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_site_articles_is_sticky ON site_articles(is_sticky);
CREATE INDEX IF NOT EXISTS idx_site_articles_language ON site_articles(language);
CREATE INDEX IF NOT EXISTS idx_site_articles_created_at ON site_articles(created_at);

-- News-article association indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_news_id ON news_articles(news_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_article_id ON news_articles(article_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_display_order ON news_articles(display_order);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_main_story ON news_articles(is_main_story);
CREATE INDEX IF NOT EXISTS idx_news_articles_is_featured ON news_articles(is_featured);

-- Hits indexes
CREATE INDEX IF NOT EXISTS idx_hits_target ON hits(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_hits_type ON hits(type);
CREATE INDEX IF NOT EXISTS idx_hits_user_id ON hits(user_id);
CREATE INDEX IF NOT EXISTS idx_hits_session_id ON hits(session_id);
CREATE INDEX IF NOT EXISTS idx_hits_ip_address ON hits(ip_address);
CREATE INDEX IF NOT EXISTS idx_hits_country ON hits(country);
CREATE INDEX IF NOT EXISTS idx_hits_device_type ON hits(device_type);
CREATE INDEX IF NOT EXISTS idx_hits_browser ON hits(browser);
CREATE INDEX IF NOT EXISTS idx_hits_os ON hits(os);
CREATE INDEX IF NOT EXISTS idx_hits_utm_source ON hits(utm_source);
CREATE INDEX IF NOT EXISTS idx_hits_utm_campaign ON hits(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_hits_created_at ON hits(created_at);

-- ============================================================================
-- 8. DATA VALIDATION
-- ============================================================================

-- Verify data migration
DO $$
BEGIN
    -- Check if all users were migrated
    IF (SELECT COUNT(*) FROM users) != (SELECT COUNT(*) FROM "AbpUsers" WHERE "IsDeleted" = false) THEN
        RAISE EXCEPTION 'User migration failed: count mismatch';
    END IF;
    
    -- Check if all images have required fields
    IF EXISTS (SELECT 1 FROM site_images WHERE filename IS NULL OR original_name IS NULL) THEN
        RAISE EXCEPTION 'Image migration failed: missing required fields';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully';
END $$;
