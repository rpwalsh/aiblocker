-- Copyright (c) 2026 Ryan Walsh. All rights reserved.
-- Proprietary commercial software published for public reference only.
-- No license is granted to use, copy, modify, distribute, or create derivative works.

-- Privacy-safe crowd learning schema
-- Stores ONLY aggregate counts by feature_id.

CREATE TABLE IF NOT EXISTS feature_stats (
  feature_id TEXT PRIMARY KEY,
  ai_yes BIGINT NOT NULL DEFAULT 0,
  ai_no  BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_versions (
  id BIGSERIAL PRIMARY KEY,
  model_json JSONB NOT NULL,
  model_sig TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feature_stats_updated_at_idx ON feature_stats(updated_at);
CREATE INDEX IF NOT EXISTS model_versions_created_at_idx ON model_versions(created_at);
