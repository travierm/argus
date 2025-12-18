import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Format a date into a timestamp for migration filenames
 * Format: YYYY_MM_DD_HHMMSS
 */
function formatTimestamp(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');

	return `${year}_${month}_${day}_${hour}${minute}${second}`;
}

/**
 * Generate a new migration file
 */
function generateMigration(name: string) {
	// Validate name
	if (!name || typeof name !== 'string') {
		throw new Error('Migration name is required');
	}

	// Ensure name is in snake_case format
	const cleanName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

	if (cleanName !== name) {
		console.warn(`Migration name converted to snake_case: ${cleanName}`);
	}

	// Generate timestamp
	const now = new Date();
	const timestamp = formatTimestamp(now);

	// Create filename
	const filename = `${timestamp}_${cleanName}.sql`;
	const migrationsDir = resolve(import.meta.dir, '../../../../database/migrations');
	const filepath = resolve(migrationsDir, filename);

	// Check if file already exists
	if (existsSync(filepath)) {
		throw new Error(`Migration file already exists: ${filename}`);
	}

	// Create template
	const template = `-- Migration: ${cleanName}
-- Created: ${now.toISOString()}

-- Write your migration SQL here

`;

	// Write file
	writeFileSync(filepath, template, 'utf-8');

	console.log(`✓ Created migration: database/migrations/${filename}`);
	console.log(`\nEdit the file to add your SQL statements.`);

	return filepath;
}

// CLI entry point
if (import.meta.main) {
	const name = process.argv[2];

	if (!name) {
		console.error('Usage: bun db:make:migration <migration_name>');
		console.error('\nExample: bun db:make:migration create_users_table');
		process.exit(1);
	}

	try {
		generateMigration(name);
	} catch (error) {
		console.error('Error:', error instanceof Error ? error.message : error);
		process.exit(1);
	}
}
