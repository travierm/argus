import { Database } from 'bun:sqlite';

export const db = new Database('../.../database/db.sqlite', { create: true });

// Import migrations to run them automatically
import './migrations';
