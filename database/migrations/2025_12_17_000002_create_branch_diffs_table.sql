-- Migration: create_branch_diffs_table
-- Created: 2025-12-17 00:00:02

CREATE TABLE IF NOT EXISTS branch_diffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL,
  repo TEXT NOT NULL,
  branch TEXT NOT NULL,
  diff BLOB NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_branch_diffs_uuid ON branch_diffs (uuid);

CREATE TRIGGER IF NOT EXISTS update_branch_diffs_updated_at
  AFTER UPDATE ON branch_diffs
  FOR EACH ROW
  BEGIN
    UPDATE branch_diffs SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
  END;
