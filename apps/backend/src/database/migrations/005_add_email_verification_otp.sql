-- Migration: Add email verification OTP fields for vendor email verification
-- Adds email_verification_otp and email_verification_otp_expires_at to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS email_verification_otp_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster OTP lookups
CREATE INDEX IF NOT EXISTS idx_users_email_verification_otp ON users(email_verification_otp) 
    WHERE email_verification_otp IS NOT NULL;

