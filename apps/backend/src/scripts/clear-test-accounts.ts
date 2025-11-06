/**
 * Script to clear test accounts from database
 * 
 * WARNING: This will delete all users and their associated data
 * Use only in development/testing environments
 */

import { db } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ override: false });

async function clearTestAccounts() {
    console.log('🗑️  Starting to clear test accounts...\n');

    // Initialize database connection
    db.initialize();

    // Wait a bit for connection to establish
    await new Promise(resolve => setTimeout(resolve, 1000));

    const client = await db.getPool().connect();

    try {
        await client.query('BEGIN');

        // Get count before deletion
        const userCountResult = await client.query('SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL');
        const userCount = userCountResult.rows[0].count;
        console.log(`📊 Found ${userCount} active user(s) to delete\n`);

        if (userCount === '0') {
            console.log('✅ No users to delete. Database is already clean.');
            await client.query('ROLLBACK');
            return;
        }

        // Delete in order to respect foreign key constraints
        // 1. Delete dependent records first
        console.log('1️⃣  Deleting dependent records...');

        // Delete verifications
        const verificationsResult = await client.query('DELETE FROM verifications RETURNING id');
        console.log(`   ✅ Deleted ${verificationsResult.rows.length} verification(s)`);

        // Delete transactions
        const transactionsResult = await client.query('DELETE FROM transactions RETURNING id');
        console.log(`   ✅ Deleted ${transactionsResult.rows.length} transaction(s)`);

        // Delete product sync logs
        const syncLogsResult = await client.query('DELETE FROM product_sync_logs RETURNING id');
        console.log(`   ✅ Deleted ${syncLogsResult.rows.length} product sync log(s)`);

        // Delete webhook logs
        const webhookLogsResult = await client.query('DELETE FROM webhook_logs RETURNING id');
        console.log(`   ✅ Deleted ${webhookLogsResult.rows.length} webhook log(s)`);

        // Delete newsletter subscriptions
        const newsletterSubsResult = await client.query('DELETE FROM newsletter_subscriptions RETURNING id');
        console.log(`   ✅ Deleted ${newsletterSubsResult.rows.length} newsletter subscription(s)`);

        // Delete vendor API configs
        const vendorApiConfigsResult = await client.query('DELETE FROM vendor_api_configs RETURNING id');
        console.log(`   ✅ Deleted ${vendorApiConfigsResult.rows.length} vendor API config(s)`);

        // Delete products
        const productsResult = await client.query('DELETE FROM products RETURNING id');
        console.log(`   ✅ Deleted ${productsResult.rows.length} product(s)`);

        // Delete vendors (cascades to vendor_api_configs, but we already deleted them)
        const vendorsResult = await client.query('DELETE FROM vendors RETURNING id');
        console.log(`   ✅ Deleted ${vendorsResult.rows.length} vendor(s)`);

        // Delete students
        const studentsResult = await client.query('DELETE FROM students RETURNING id');
        console.log(`   ✅ Deleted ${studentsResult.rows.length} student(s)`);

        // Delete API keys
        const apiKeysResult = await client.query('DELETE FROM api_keys RETURNING id');
        console.log(`   ✅ Deleted ${apiKeysResult.rows.length} API key(s)`);

        // Delete widget configs
        const widgetConfigsResult = await client.query('DELETE FROM widget_configs RETURNING id');
        console.log(`   ✅ Deleted ${widgetConfigsResult.rows.length} widget config(s)`);

        // Delete savings stats
        const savingsStatsResult = await client.query('DELETE FROM savings_stats RETURNING id');
        console.log(`   ✅ Deleted ${savingsStatsResult.rows.length} savings stat(s)`);

        // Delete deletion requests
        const deletionRequestsResult = await client.query('DELETE FROM deletion_requests RETURNING id');
        console.log(`   ✅ Deleted ${deletionRequestsResult.rows.length} deletion request(s)`);

        // 2. Finally delete users (this will cascade to students/vendors, but we already deleted them)
        console.log('\n2️⃣  Deleting users...');
        const usersResult = await client.query('DELETE FROM users RETURNING id, email, role');
        console.log(`   ✅ Deleted ${usersResult.rows.length} user(s)`);

        if (usersResult.rows.length > 0) {
            console.log('\n   Deleted users:');
            usersResult.rows.forEach((user) => {
                console.log(`      - ${user.email} (${user.role})`);
            });
        }

        await client.query('COMMIT');

        console.log('\n✅ Successfully cleared all test accounts!');
        console.log('📊 Database is now clean and ready for fresh testing.\n');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error clearing test accounts:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the script
clearTestAccounts()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });

