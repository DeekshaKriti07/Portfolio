CREATE TABLE IF NOT EXISTS projects (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position INTEGER NOT NULL,
  content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
