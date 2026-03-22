-- Custom backgrounds table for storing user-created environment specifications
-- No image storage - only the extracted spec and compiled prompt

CREATE TABLE IF NOT EXISTS custom_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- AI-extracted specification (no source images stored)
  environment_spec JSONB NOT NULL,
  
  -- Compiled prompt snippet ready for generation
  prompt_snippet TEXT NOT NULL
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_user ON custom_backgrounds(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_backgrounds_created ON custom_backgrounds(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE custom_backgrounds ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own backgrounds
CREATE POLICY "Users can view their own backgrounds"
  ON custom_backgrounds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backgrounds"
  ON custom_backgrounds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own backgrounds"
  ON custom_backgrounds
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backgrounds"
  ON custom_backgrounds
  FOR DELETE
  USING (auth.uid() = user_id);
