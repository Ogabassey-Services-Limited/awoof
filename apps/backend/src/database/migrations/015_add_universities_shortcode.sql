-- Migration: Add shortcode to universities (first part of domain for search/signup)
-- Description: e.g. unilag from unilag.edu.ng

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS shortcode VARCHAR(100);

-- Backfill: extract first part before first dot from domain
UPDATE universities
SET shortcode = LOWER(SPLIT_PART(domain, '.', 1))
WHERE domain IS NOT NULL AND (shortcode IS NULL OR shortcode = '');

CREATE INDEX IF NOT EXISTS idx_universities_shortcode ON universities(shortcode) WHERE shortcode IS NOT NULL;
