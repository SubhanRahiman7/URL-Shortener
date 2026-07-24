CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS urls (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 short_code VARCHAR(20) UNIQUE NOT NULL,
 original_url TEXT NOT NULL,
 clicks INTEGER DEFAULT 0,
 created_at TIMESTAMP DEFAULT NOW(),
 expires_at TIMESTAMP,
 user_id VARCHAR(255),
 CONSTRAINT short_code_length CHECK (LENGTH(short_code) >= 4 AND LENGTH(short_code) <= 20),
 CONSTRAINT short_code_format CHECK (short_code ~ '^[A-Za-z0-9_-]+$')
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_expires_at ON urls(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_id ON urls(user_id);
