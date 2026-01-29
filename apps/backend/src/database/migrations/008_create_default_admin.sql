-- Migration: Create default admin user (optional)
-- Date: 2025-01-XX
-- Description: Creates a default admin user for initial setup
-- 
-- NOTE: This migration is commented out by default for security.
-- Uncomment and set your own email/password before running.
-- 
-- To use this migration:
-- 1. Uncomment the INSERT statement below
-- 2. Replace 'admin@awoof.com' with your admin email
-- 3. Replace 'YOUR_PASSWORD_HASH' with a bcrypt hash of your password
-- 4. Run the migration
--
-- To generate a password hash, use:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10).then(hash => console.log(hash));"
--
-- Or use the create-admin.ts script instead:
-- npm run admin:create admin@awoof.com YourPassword123!

-- BEGIN;

-- INSERT INTO users (email, password_hash, role, verification_status)
-- VALUES (
--     'admin@awoof.com',  -- Change this to your admin email
--     '$2b$10$YOUR_PASSWORD_HASH_HERE',  -- Replace with your bcrypt hash
--     'admin',
--     'verified'
-- )
-- ON CONFLICT (email) DO NOTHING;

-- COMMIT;


