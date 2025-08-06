-- Add scheduling fields to SiteNews table
-- Migration: Add ScheduledAt and ExpiresAt fields for news scheduling functionality

USE NextEventDB6;

-- Add ScheduledAt field for scheduled publication
ALTER TABLE SiteNews 
ADD COLUMN ScheduledAt datetime(6) NULL COMMENT 'Scheduled publication date and time';

-- Add ExpiresAt field for content expiration
ALTER TABLE SiteNews 
ADD COLUMN ExpiresAt datetime(6) NULL COMMENT 'Content expiration date and time';

-- Add indexes for better query performance
CREATE INDEX idx_sitenews_scheduledat ON SiteNews(ScheduledAt);
CREATE INDEX idx_sitenews_expiresat ON SiteNews(ExpiresAt);

-- Add index for active content queries (not deleted and not expired)
CREATE INDEX idx_sitenews_active ON SiteNews(IsDeleted, ExpiresAt);
