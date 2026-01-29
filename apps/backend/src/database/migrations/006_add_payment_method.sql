-- Migration: Add payment_method column to vendors table
-- Adds payment_method column to track how vendors process payments

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'awoof' 
    CHECK (payment_method IN ('awoof', 'vendor_website'));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vendors_payment_method ON vendors(payment_method) 
    WHERE deleted_at IS NULL;

