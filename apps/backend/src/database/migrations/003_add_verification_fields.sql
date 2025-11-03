-- Add NDPR consent and email magic link fields to verifications table
ALTER TABLE verifications 
ADD COLUMN IF NOT EXISTS ndpr_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS magic_link_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS magic_link_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS otp_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_verifications_magic_link_token ON verifications(magic_link_token) 
WHERE magic_link_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_verifications_otp_code ON verifications(otp_code) 
WHERE otp_code IS NOT NULL;

-- Add NDPR consent to users table for tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ndpr_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE;

