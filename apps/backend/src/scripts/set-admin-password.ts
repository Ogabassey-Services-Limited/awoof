/** Usage: npm run admin:set-password -- <email> <new-password> */

import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DB_HOST && !process.env.DATABASE_URL) {
    process.env.DB_HOST = '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT ?? '5432';
    process.env.DB_USER = process.env.DB_USER ?? 'root';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'root';
    process.env.DB_NAME = process.env.DB_NAME ?? 'awoofDB';
}

import { db } from '../config/database.js';
import { passwordService } from '../services/auth/password.service.js';

async function setAdminPassword() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: npm run admin:set-password -- <email> <new-password>');
        process.exit(1);
    }

    const [email, password] = args;
    if (!email || !password) {
        console.error('❌ Email and new password are required');
        process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error('❌ Invalid email format');
        process.exit(1);
    }

    const passwordValidation = passwordService.validatePassword(password);
    if (!passwordValidation.valid) {
        console.error('❌ Password validation failed:');
        passwordValidation.errors.forEach((e) => console.error(`   - ${e}`));
        process.exit(1);
    }

    try {
        db.initialize();

        const existing = await db.query(
            'SELECT id, email, role FROM users WHERE email = $1 AND deleted_at IS NULL',
            [email]
        );

        if (existing.rows.length === 0) {
            console.error(`❌ No user found with email ${email}. Create with: npm run admin:create -- ${email} <password>`);
            await db.close();
            process.exit(1);
        }

        const user = existing.rows[0];
        if (user.role !== 'admin') {
            console.error(`❌ User ${email} is not an admin (role: ${user.role}).`);
            await db.close();
            process.exit(1);
        }

        const passwordHash = await passwordService.hashPassword(password);
        await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, user.id]);

        console.log('\n✅ Admin password updated successfully.');
        console.log(`   Email: ${email}\n`);
        await db.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin password:', error);
        await db.close();
        process.exit(1);
    }
}

setAdminPassword();
