-- Demo Team Support Schema Migration
-- Run this after team-schema.sql

-- Add is_demo flag to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS demo_reset_at TIMESTAMPTZ NULL;

-- Create index for demo team lookups
CREATE INDEX IF NOT EXISTS idx_teams_is_demo ON teams(is_demo) WHERE is_demo = true;

-- RLS policies remain the same - is_demo is just a flag
-- No changes needed to existing policies

