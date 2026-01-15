CREATE TABLE IF NOT EXISTS abuse_reports (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  reason TEXT,
  reporter_ip TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  continent TEXT,
  timezone TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_slug ON abuse_reports(slug);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_created_at ON abuse_reports(created_at);
