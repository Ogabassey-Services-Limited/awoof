-- Migration: Add email_domains JSONB to universities
-- Description: Stores list of allowed email domains per university (e.g. ["unilag.edu.ng", "live.unilag.edu.ng"])

ALTER TABLE universities
ADD COLUMN IF NOT EXISTS email_domains JSONB DEFAULT '[]'::jsonb;

-- Backfill: if domain exists and email_domains is empty, set email_domains to [domain]
UPDATE universities
SET email_domains = jsonb_build_array(domain)
WHERE domain IS NOT NULL
  AND (email_domains IS NULL OR email_domains = '[]'::jsonb);
