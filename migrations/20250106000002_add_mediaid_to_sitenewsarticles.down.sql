-- Rollback migration: Remove MediaId field from SiteNewsArticles table

USE NextEventDB6;

-- Drop index first
DROP INDEX IF EXISTS idx_sitenewsarticles_mediaid ON SiteNewsArticles;

-- Remove the MediaId column
ALTER TABLE SiteNewsArticles DROP COLUMN IF EXISTS MediaId;
