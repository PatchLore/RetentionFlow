-- Team/Salon Management Schema Additions
-- Run this after the base schema.sql

-- Add role and team_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'stylist')),
ADD COLUMN IF NOT EXISTS team_id UUID,
ADD COLUMN IF NOT EXISTS salon_name TEXT;

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for team_id
ALTER TABLE profiles
ADD CONSTRAINT fk_profiles_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'stylist' CHECK (role IN ('owner', 'stylist')),
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, email)
);

-- Add team_id to clients table for team sharing
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Team members can view their team"
  ON teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Team owners can update their team"
  ON teams FOR UPDATE
  USING (
    owner_id = auth.uid()
  )
  WITH CHECK (
    owner_id = auth.uid()
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for team_invitations
CREATE POLICY "Team members can view invitations"
  ON team_invitations FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM profiles WHERE id = auth.uid()
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team owners can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Team owners can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Update clients RLS to allow team access
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (
    profile_id = auth.uid()
    OR (
      team_id IS NOT NULL
      AND team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    AND (
      team_id IS NULL
      OR team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (
    profile_id = auth.uid()
    OR (
      team_id IS NOT NULL
      AND team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    profile_id = auth.uid()
    OR (
      team_id IS NOT NULL
      AND team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;
CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (
    profile_id = auth.uid()
    OR (
      team_id IS NOT NULL
      AND team_id IN (
        SELECT team_id FROM profiles WHERE id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'owner'
      )
    )
  );

-- Function to create team on profile creation (optional)
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-create team for new owners
  IF NEW.role = 'owner' AND NEW.team_id IS NULL THEN
    INSERT INTO teams (name, owner_id)
    VALUES (COALESCE(NEW.salon_name, 'My Salon'), NEW.id)
    RETURNING id INTO NEW.team_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create team (optional - can be done manually)
-- DROP TRIGGER IF EXISTS on_profile_created ON profiles;
-- CREATE TRIGGER on_profile_created
--   BEFORE INSERT ON profiles
--   FOR EACH ROW
--   WHEN (NEW.role = 'owner')
--   EXECUTE FUNCTION public.handle_new_team();

