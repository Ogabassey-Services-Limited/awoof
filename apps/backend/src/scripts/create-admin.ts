/**
 * Script to create an admin user
 * 
 * Usage: npx tsx src/scripts/create-admin.ts <email> <password>
 * 
 * Example: npx tsx src/scripts/create-admin.ts admin@awoof.com Admin123!
 */

// Set environment variables BEFORE importing database config
// When running from host machine, connect to 127.0.0.1 (Docker port mapping)
// Use 127.0.0.1 instead of localhost to avoid connecting to local PostgreSQL instance
// Override any .env settings to ensure we connect to the Docker database
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'root';
process.env.DB_NAME = 'awoofDB';
// Clear DATABASE_URL if set, to use individual connection params
delete process.env.DATABASE_URL;

import { db } from '../config/database.js';
import { passwordService } from '../services/auth/password.service.js';

async function createAdmin() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: npx tsx src/scripts/create-admin.ts <email> <password>');
        console.error('Example: npx tsx src/scripts/create-admin.ts admin@awoof.com Admin123!');
        process.exit(1);
    }

    const [email, password] = args;

    // Ensure both email and password are provided
    if (!email || !password) {
        console.error('❌ Email and password are required');
        process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
    }

    // Validate password
    const passwordValidation = passwordService.validatePassword(password);
    if (!passwordValidation.valid) {
        console.error('❌ Password validation failed:');
        passwordValidation.errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
    }

    try {
        // Initialize database connection
        db.initialize();

        // Check if admin already exists
        const existingAdmin = await db.query(
            'SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (existingAdmin.rows.length > 0) {
            const existingUser = existingAdmin.rows[0];
            // Check if it's already an admin
            const userRole = await db.query(
                'SELECT role FROM users WHERE id = $1',
                [existingUser.id]
            );

            if (userRole.rows[0].role === 'admin') {
                console.log('✅ Admin user already exists with this email');
                process.exit(0);
            } else {
                console.error(`❌ User with email ${email} already exists with role: ${userRole.rows[0].role}`);
                console.error('   Please use a different email or update the existing user manually');
                process.exit(1);
            }
        }

        // Hash password
        const passwordHash = await passwordService.hashPassword(password);

        // Create admin user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, role, verification_status)
             VALUES ($1, $2, 'admin', 'verified')
             RETURNING id, email, role, verification_status, created_at`,
            [email, passwordHash]
        );

        const admin = result.rows[0];

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 Admin Details:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Status: ${admin.verification_status}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log(`   ID: ${admin.id}`);
        console.log('\n🔐 You can now login at: /auth/admin/login');
        console.log('\n');

        // Close database connection
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        await db.close();
        process.exit(1);
    }
}

createAdmin();

