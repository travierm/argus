import { Database } from 'bun:sqlite';
import { resolve } from 'path';

// Fix: Proper path resolution to database/db.sqlite at project root
const dbPath = import.meta.dir
	? resolve(import.meta.dir, '../../../database/db.sqlite')
	: resolve(process.cwd(), 'database/db.sqlite');

export const db = new Database(dbPath, { create: true });
