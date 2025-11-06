-- Script to clear all test accounts and related data
-- WARNING: This will delete ALL users and their associated data
-- Use only in development/testing environments

BEGIN;

-- Delete dependent records first (respecting foreign key constraints)
DELETE FROM verifications;
DELETE FROM transactions;
DELETE FROM product_sync_logs;
DELETE FROM webhook_logs;
DELETE FROM newsletter_subscriptions;
DELETE FROM vendor_api_configs;
DELETE FROM products;
DELETE FROM api_keys;
DELETE FROM widget_configs;
DELETE FROM savings_stats;
DELETE FROM deletion_requests;
DELETE FROM vendors;
DELETE FROM students;
DELETE FROM users;

COMMIT;

-- Show confirmation
SELECT 'All test accounts cleared successfully!' as message;

