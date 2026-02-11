/** Usage: npm run admin:create -- <email> <password> */

if (!process.env.DB_HOST) {
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT ?? '5432';
    process.env.DB_USER = process.env.DB_USER ?? 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
    process.env.DB_NAME = process.env.DB_NAME ?? 'awoofDB';
    delete process.env.DATABASE_URL;
}

import { db } from '../config/database.js';
import { passwordService } from '../services/auth/password.service.js';

async function createAdmin() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: npm run admin:create -- <email> <password>');
        process.exit(1);
    }

    const [email, password] = args;
    if (!email || !password) {
        console.error('❌ Email and password are required');
        process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
    }

    const passwordValidation = passwordService.validatePassword(password);
    if (!passwordValidation.valid) {
        console.error('❌ Password validation failed. Use at least 8 characters with upper, lower, and number.');
        process.exit(1);
    }

    try {
        db.initialize();

        const existing = await db.query(
            'SELECT id, email FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (existing.rows.length > 0) {
            const roleResult = await db.query('SELECT role FROM users WHERE id = $1', [existing.rows[0].id]);
            if (roleResult.rows[0].role === 'admin') {
                console.log('✅ Admin user already exists with this email');
                await db.close();
                process.exit(0);
            }
            console.error('❌ A user with this email already exists.');
            await db.close();
            process.exit(1);
        }

        const passwordHash = await passwordService.hashPassword(password);
        const result = await db.query(
            `INSERT INTO users (email, password_hash, role, verification_status)
             VALUES ($1, $2, 'admin', 'verified')
             RETURNING id, email, role, verification_status, created_at`,
            [email, passwordHash]
        );
        const admin = result.rows[0];

        console.log('\n✅ Admin user created successfully!');
        console.log(`   Email: ${admin.email}  Role: ${admin.role}  ID: ${admin.id}`);
        console.log('\n🔐 Login at /auth/admin/login\n');
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        await db.close();
        process.exit(1);
    }
}

createAdmin();
