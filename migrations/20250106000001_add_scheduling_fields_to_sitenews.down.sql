-- Rollback migration: Remove scheduling fields from SiteNews table

USE NextEventDB6;

-- Drop indexes first
DROP INDEX IF EXISTS idx_sitenews_active ON SiteNews;
DROP INDEX IF EXISTS idx_sitenews_expiresat ON SiteNews;
DROP INDEX IF EXISTS idx_sitenews_scheduledat ON SiteNews;

-- Remove the added columns
ALTER TABLE SiteNews DROP COLUMN IF EXISTS ExpiresAt;
ALTER TABLE SiteNews DROP COLUMN IF EXISTS ScheduledAt;
