-- Migration: create_monitored_folders_table
-- Created: 2025-12-17 00:00:01

CREATE TABLE IF NOT EXISTS monitored_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_monitored_folders_updated_at
AFTER UPDATE ON monitored_folders
FOR EACH ROW
BEGIN
  UPDATE monitored_folders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
