import { db } from '../database';
import { runMigrations } from './migrator';

/**
 * Drop all tables from the database
 */
function dropAllTables() {
	console.log('Dropping all tables...\n');

	// Get all table names (excluding sqlite internal tables)
	const tables = db
		.query<{ name: string }, []>(
			`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
		)
		.all();

	if (tables.length === 0) {
		console.log('No tables found to drop.');
		return;
	}

	// Disable foreign key constraints temporarily
	db.exec('PRAGMA foreign_keys = OFF');

	// Drop each table
	for (const table of tables) {
		console.log(`Dropping table: ${table.name}`);
		db.exec(`DROP TABLE IF EXISTS ${table.name}`);
	}

	// Re-enable foreign key constraints
	db.exec('PRAGMA foreign_keys = ON');

	console.log(`\n✓ Dropped ${tables.length} table(s).\n`);
}

/**
 * Fresh database: drop all tables and re-run all migrations
 */
export function freshDatabase() {
	console.log('=== Database Fresh ===\n');

	try {
		// Drop all existing tables
		dropAllTables();

		// Run all migrations from scratch
		runMigrations();

		console.log('\n=== Database refreshed successfully ===');
	} catch (error) {
		console.error('\nFresh database failed:', error);
		throw error;
	}
}

// CLI entry point
if (import.meta.main) {
	try {
		freshDatabase();
	} catch (error) {
		process.exit(1);
	}
}
