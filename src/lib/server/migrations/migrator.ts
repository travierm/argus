import { db } from '../database';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Create the migrations tracking table if it doesn't exist
 */
function createMigrationsTable() {
	db.run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration TEXT NOT NULL UNIQUE,
      batch INTEGER NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get the next batch number
 */
function getNextBatch(): number {
	const result = db.query<{ max: number | null }, []>('SELECT MAX(batch) as max FROM migrations').get();
	return (result?.max || 0) + 1;
}

/**
 * Get list of applied migrations
 */
function getAppliedMigrations(): string[] {
	const rows = db.query<{ migration: string }, []>('SELECT migration FROM migrations ORDER BY id').all();
	return rows.map((row) => row.migration);
}

/**
 * Get list of all migration files from the filesystem
 */
function getMigrationFiles(): string[] {
	const migrationsDir = resolve(import.meta.dir, '../../../../database/migrations');

	try {
		const files = readdirSync(migrationsDir)
			.filter((f) => f.endsWith('.sql'))
			.sort(); // Timestamp prefix ensures chronological order

		return files;
	} catch (error) {
		// If directory doesn't exist, return empty array
		return [];
	}
}

/**
 * Execute a single migration file
 */
function executeMigration(filename: string, batch: number) {
	const migrationsDir = resolve(import.meta.dir, '../../../../database/migrations');
	const filepath = resolve(migrationsDir, filename);
	const migrationName = filename.replace('.sql', '');

	console.log(`Migrating: ${migrationName}`);

	try {
		// Read the SQL file
		const sql = readFileSync(filepath, 'utf-8');

		// Remove comment-only lines
		const cleanedSql = sql
			.split('\n')
			.filter((line) => !line.trim().startsWith('--'))
			.join('\n')
			.trim();

		// Execute the entire migration file as a single transaction
		db.exec('BEGIN TRANSACTION');

		// Execute all statements in the file
		db.exec(cleanedSql);

		// Record the migration
		db.run('INSERT INTO migrations (migration, batch) VALUES (?, ?)', [migrationName, batch]);

		db.exec('COMMIT');

		console.log(`✓ Migrated: ${migrationName}`);
	} catch (error) {
		db.exec('ROLLBACK');
		console.error(`✗ Failed: ${migrationName}`);
		throw error;
	}
}

/**
 * Run all pending migrations
 */
export function runMigrations() {
	console.log('Running migrations...\n');

	// Ensure migrations table exists
	createMigrationsTable();

	// Get all migration files
	const allMigrations = getMigrationFiles();

	if (allMigrations.length === 0) {
		console.log('No migration files found in database/migrations/');
		return;
	}

	// Get applied migrations
	const applied = getAppliedMigrations();

	// Filter to get pending migrations
	const pending = allMigrations.filter(
		(filename) => !applied.includes(filename.replace('.sql', ''))
	);

	if (pending.length === 0) {
		console.log('Nothing to migrate. All migrations are up to date.');
		return;
	}

	console.log(`Found ${pending.length} pending migration(s):\n`);

	// Get next batch number
	const batch = getNextBatch();

	// Execute each pending migration
	for (const filename of pending) {
		executeMigration(filename, batch);
	}

	console.log(`\n✓ Migration complete. ${pending.length} migration(s) applied.`);
}

// CLI entry point
if (import.meta.main) {
	try {
		runMigrations();
	} catch (error) {
		console.error('\nMigration failed:', error);
		process.exit(1);
	}
}
