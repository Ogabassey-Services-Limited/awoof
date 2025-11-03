/**
 * Database Migration Runner
 * 
 * Runs SQL migration files in order
 * Follows Single Responsibility Principle - only handles migrations
 */

import { db } from '../../config/database.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Migration record in database
 */
interface Migration {
    id: string;
    filename: string;
    executed_at: Date;
}

/**
 * Get all migration files sorted by name
 */
function getMigrationFiles(): string[] {
    const migrationsDir = join(__dirname, '.');
    const files = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    return files;
}

/**
 * Check if migration table exists, create if not
 */
async function ensureMigrationTable(): Promise<void> {
    // Enable UUID extension first
    await db.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS migrations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            filename VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await db.query(createTableQuery);
    console.log('Migration table ready');
}

/**
 * Get executed migrations from database
 */
async function getExecutedMigrations(): Promise<Migration[]> {
    try {
        const result = await db.query<Migration>(
            'SELECT id, filename, executed_at FROM migrations ORDER BY filename'
        );
        return result.rows;
    } catch (error) {
        // Table doesn't exist yet, return empty array
        return [];
    }
}

/**
 * Record migration as executed
 */
async function recordMigration(filename: string): Promise<void> {
    await db.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [filename]
    );
}

/**
 * Execute a single migration file
 */
async function executeMigration(filename: string): Promise<void> {
    const filePath = join(__dirname, filename);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`📄 Running migration: ${filename}`);

    try {
        await db.query(sql);
        await recordMigration(filename);
        console.log(`Migration ${filename} executed successfully`);
    } catch (error) {
        console.error(`Migration ${filename} failed:`, error);
        throw error;
    }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
    console.log('Starting database migrations...\n');

    try {
        // Ensure migration table exists
        await ensureMigrationTable();

        // Get all migration files and executed migrations
        const migrationFiles = getMigrationFiles();
        const executedMigrations = await getExecutedMigrations();
        const executedFilenames = new Set(executedMigrations.map(m => m.filename));

        // Filter out already executed migrations
        const pendingMigrations = migrationFiles.filter(
            file => !executedFilenames.has(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('All migrations are up to date');
            return;
        }

        console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);

        // Execute pending migrations in order
        for (const filename of pendingMigrations) {
            await executeMigration(filename);
            console.log('');
        }

        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

