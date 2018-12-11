CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  date DATETIME,
  author TEXT,
  revision TEXT,
  message TEXT,
  gerrit TEXT
);
