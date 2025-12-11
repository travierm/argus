import { db } from './database';

interface Migration {
	id: number;
	name: string;
	up: () => void;
}

// Create migrations tracking table
db.run(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Define your migrations here
const migrations: Migration[] = [
	{
		id: 1,
		name: 'create_monitored_folders_table',
		up: () => {
			db.run(`
        CREATE TABLE IF NOT EXISTS monitored_folders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          path TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

			// Create trigger to auto-update updated_at
			db.run(`
        CREATE TRIGGER IF NOT EXISTS update_monitored_folders_updated_at
        AFTER UPDATE ON monitored_folders
        FOR EACH ROW
        BEGIN
          UPDATE monitored_folders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
        END
      `);
		}
	}
	// Add more migrations here as needed
	// {
	//   id: 2,
	//   name: 'add_description_to_monitored_folders',
	//   up: () => {
	//     db.run(`ALTER TABLE monitored_folders ADD COLUMN description TEXT`);
	//   }
	// }
];

// Run migrations
export function runMigrations() {
	const applied = db
		.query<{ id: number }, []>('SELECT id FROM _migrations ORDER BY id')
		.all()
		.map((row) => row.id);

	for (const migration of migrations) {
		if (!applied.includes(migration.id)) {
			console.log(`Running migration: ${migration.name}`);
			migration.up();
			db.run('INSERT INTO _migrations (id, name) VALUES (?, ?)', [migration.id, migration.name]);
			console.log(`✓ Migration ${migration.name} completed`);
		}
	}
}

// Run migrations automatically when this module is imported
runMigrations();
