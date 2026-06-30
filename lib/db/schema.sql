-- lib/db/schema.sql
-- Run ONCE against the provisioned Postgres instance.
-- Never imported by application code.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS contact_submissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name)    BETWEEN 1 AND 100),
  email       TEXT        NOT NULL CHECK (char_length(email)   BETWEEN 6 AND 254),
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);
