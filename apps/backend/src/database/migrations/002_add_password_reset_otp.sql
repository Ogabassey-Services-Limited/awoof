-- Add password reset OTP fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_otp VARCHAR(6),
ADD COLUMN IF NOT EXISTS password_reset_otp_expires_at TIMESTAMP WITH TIME ZONE;

-- Create partial index for valid (non-expired) OTPs
CREATE INDEX IF NOT EXISTS idx_users_password_reset_otp ON users(password_reset_otp) 
WHERE password_reset_otp IS NOT NULL;

