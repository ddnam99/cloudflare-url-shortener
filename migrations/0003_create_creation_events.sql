CREATE TABLE IF NOT EXISTS creation_events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  ip TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  continent TEXT,
  timezone TEXT,
  latitude TEXT,
  longitude TEXT,
  postal_code TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_creation_events_slug ON creation_events(slug);
CREATE INDEX IF NOT EXISTS idx_creation_events_created_at ON creation_events(created_at);
