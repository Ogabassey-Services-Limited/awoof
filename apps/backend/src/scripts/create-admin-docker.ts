/**
 * Script to create an admin user using Docker exec
 * 
 * This version runs the admin creation inside the Docker container,
 * avoiding connection issues with local PostgreSQL instances.
 * 
 * Usage: npx tsx src/scripts/create-admin-docker.ts <email> <password>
 * 
 * Example: npx tsx src/scripts/create-admin-docker.ts admin@awoof.com Admin123!
 */

import { execSync } from 'child_process';
import { passwordService } from '../services/auth/password.service.js';

async function createAdminDocker() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: npx tsx src/scripts/create-admin-docker.ts <email> <password>');
        console.error('Example: npx tsx src/scripts/create-admin-docker.ts admin@awoof.com Admin123!');
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
        // Hash password
        const passwordHash = await passwordService.hashPassword(password);

        // Escape the hash for SQL
        const escapedHash = passwordHash.replace(/'/g, "''");

        // Check if admin already exists
        const checkQuery = `SELECT id, email, role FROM users WHERE email = '${email.replace(/'/g, "''")}' AND deleted_at IS NULL`;
        const checkResult = execSync(
            `docker exec awoof_postgres_container_dev psql -U root -d awoofDB -t -c "${checkQuery}"`,
            { encoding: 'utf-8', stdio: 'pipe' }
        ).trim();

        if (checkResult) {
            const lines = checkResult.split('\n').filter(l => l.trim());
            if (lines.length > 0) {
                // User exists, check role
                const roleQuery = `SELECT role FROM users WHERE email = '${email.replace(/'/g, "''")}'`;
                const roleResult = execSync(
                    `docker exec awoof_postgres_container_dev psql -U root -d awoofDB -t -c "${roleQuery}"`,
                    { encoding: 'utf-8', stdio: 'pipe' }
                ).trim();

                if (roleResult.includes('admin')) {
                    console.log('✅ Admin user already exists with this email');
                    process.exit(0);
                } else {
                    console.error(`❌ User with email ${email} already exists with a different role`);
                    console.error('   Please use a different email or update the existing user manually');
                    process.exit(1);
                }
            }
        }

        // Create admin user
        const insertQuery = `INSERT INTO users (email, password_hash, role, verification_status)
            VALUES ('${email.replace(/'/g, "''")}', '${escapedHash}', 'admin', 'verified')
            RETURNING id, email, role, verification_status, created_at`;

        const result = execSync(
            `docker exec awoof_postgres_container_dev psql -U root -d awoofDB -t -A -F'|' -c "${insertQuery}"`,
            { encoding: 'utf-8', stdio: 'pipe' }
        ).trim();

        if (!result) {
            throw new Error('Failed to create admin user - no result returned');
        }

        const [id, resultEmail, role, status, createdAt] = result.split('|');

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 Admin Details:');
        console.log(`   Email: ${resultEmail}`);
        console.log(`   Role: ${role}`);
        console.log(`   Status: ${status}`);
        console.log(`   Created: ${createdAt}`);
        console.log(`   ID: ${id}`);
        console.log('\n🔐 You can now login at: /auth/admin/login');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        const err = error as { message?: string; stdout?: string; stderr?: string };
        console.error('❌ Error creating admin user:', err.message || error);
        if (err.stdout) console.error('STDOUT:', err.stdout);
        if (err.stderr) console.error('STDERR:', err.stderr);
        process.exit(1);
    }
}

createAdminDocker();


