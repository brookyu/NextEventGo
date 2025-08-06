-- Add MediaId field to SiteNewsArticles table
-- Migration: Add MediaId field for storing WeChat draft MediaId for processed articles

USE NextEventDB6;

-- Add MediaId field for WeChat draft MediaId
ALTER TABLE SiteNewsArticles 
ADD COLUMN MediaId varchar(500) NULL COMMENT 'WeChat draft MediaId for the processed article';

-- Add index for better query performance
CREATE INDEX idx_sitenewsarticles_mediaid ON SiteNewsArticles(MediaId);
