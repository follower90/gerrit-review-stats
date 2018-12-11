CREATE TABLE IF NOT EXISTS gerrits (
  id TEXT PRIMARY KEY,
  branch TEXT,
  change_id TEXT,
  status TEXT,
  author TEXT,
  subject TEXT,
  project TEXT,
  created DATETIME,
  updated DATETIME
);