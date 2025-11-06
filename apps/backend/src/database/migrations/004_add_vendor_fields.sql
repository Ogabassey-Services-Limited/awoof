-- Migration: Add vendor-specific fields
-- Adds company details, business info, and file URLs to vendors table

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_website VARCHAR(500),
ADD COLUMN IF NOT EXISTS document_front_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS document_back_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS banner_url VARCHAR(500);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vendors_company_name ON vendors(company_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vendors_business_category ON vendors(business_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vendors_status_category ON vendors(status, business_category) WHERE deleted_at IS NULL;

