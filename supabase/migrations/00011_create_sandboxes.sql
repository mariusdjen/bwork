-- Migration: Create sandboxes table for sandbox lifecycle management
-- Replaces global state with database-backed tracking

-- Create sandbox status enum
CREATE TYPE sandbox_status AS ENUM (
  'pending',
  'provisioning',
  'setup',
  'applying_code',
  'installing_packages',
  'validating',
  'repairing',
  'ready',
  'failed',
  'terminated'
);

-- Create sandbox provider enum
CREATE TYPE sandbox_provider AS ENUM (
  'e2b',
  'vercel'
);

-- Create sandboxes table
CREATE TABLE sandboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,

  -- Provider info
  provider sandbox_provider NOT NULL,
  external_id TEXT, -- Provider's sandbox ID (e2b sandbox id or vercel sandbox id)
  url TEXT, -- Preview URL for the sandbox

  -- Lifecycle
  status sandbox_status NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  -- Error tracking
  last_error TEXT,
  error_history JSONB DEFAULT '[]'::jsonb,

  -- Validation results
  build_passed BOOLEAN,
  tests_passed BOOLEAN,
  health_check_passed BOOLEAN,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ -- Auto-cleanup after expiry (default 30 min from creation)
);

-- Index for active sandbox lookup by tool
CREATE INDEX idx_sandboxes_tool_active
  ON sandboxes(tool_id)
  WHERE status NOT IN ('terminated', 'failed');

-- Index for cleanup job (find expired sandboxes)
CREATE INDEX idx_sandboxes_expires_at
  ON sandboxes(expires_at)
  WHERE status NOT IN ('terminated', 'failed');

-- Index for generation lookup
CREATE INDEX idx_sandboxes_generation
  ON sandboxes(generation_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sandboxes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sandboxes_updated_at
  BEFORE UPDATE ON sandboxes
  FOR EACH ROW
  EXECUTE FUNCTION update_sandboxes_updated_at();

-- Enable realtime for status updates
ALTER PUBLICATION supabase_realtime ADD TABLE sandboxes;

-- RLS policies
ALTER TABLE sandboxes ENABLE ROW LEVEL SECURITY;

-- Users can view sandboxes for their org's tools
CREATE POLICY "Users can view sandboxes for their org tools"
  ON sandboxes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tools t
      JOIN members m ON t.org_id = m.org_id
      WHERE t.id = sandboxes.tool_id
      AND m.user_id = auth.uid()
    )
  );

-- Users can insert sandboxes for their org's tools
CREATE POLICY "Users can create sandboxes for their org tools"
  ON sandboxes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tools t
      JOIN members m ON t.org_id = m.org_id
      WHERE t.id = sandboxes.tool_id
      AND m.user_id = auth.uid()
    )
  );

-- Users can update sandboxes for their org's tools
CREATE POLICY "Users can update sandboxes for their org tools"
  ON sandboxes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tools t
      JOIN members m ON t.org_id = m.org_id
      WHERE t.id = sandboxes.tool_id
      AND m.user_id = auth.uid()
    )
  );

-- Users can delete sandboxes for their org's tools (for cleanup)
CREATE POLICY "Users can delete sandboxes for their org tools"
  ON sandboxes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tools t
      JOIN members m ON t.org_id = m.org_id
      WHERE t.id = sandboxes.tool_id
      AND m.user_id = auth.uid()
    )
  );

-- Add tool status values for sandbox states
-- Note: Assumes tool_status enum exists from previous migrations
-- If not, uncomment these lines:
-- ALTER TYPE tool_status ADD VALUE IF NOT EXISTS 'validating';
-- ALTER TYPE tool_status ADD VALUE IF NOT EXISTS 'repairing';

-- Comment for documentation
COMMENT ON TABLE sandboxes IS 'Tracks sandbox lifecycle for tool generation and preview. Replaces global state with database-backed tracking.';
COMMENT ON COLUMN sandboxes.external_id IS 'Provider-specific sandbox identifier (E2B sandbox ID or Vercel sandbox ID)';
COMMENT ON COLUMN sandboxes.url IS 'Live preview URL for the running sandbox';
COMMENT ON COLUMN sandboxes.error_history IS 'JSON array of past errors for debugging: [{type, message, timestamp}]';
COMMENT ON COLUMN sandboxes.expires_at IS 'When the sandbox should be auto-terminated. Default 30 minutes from creation.';
