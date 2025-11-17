-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_rules table
CREATE TABLE IF NOT EXISTS service_rules (
  service_type TEXT PRIMARY KEY,
  interval_days INTEGER NOT NULL
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL REFERENCES service_rules(service_type),
  last_visit DATE,
  next_due DATE,
  stylist TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create followups table
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date_sent TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('reminder', 'birthday', 'review')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'overdue', 'sent'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for service_rules (public read)
CREATE POLICY "Service rules are viewable by everyone"
  ON service_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service rules can be inserted by authenticated users"
  ON service_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service rules can be updated by authenticated users"
  ON service_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service rules can be deleted by authenticated users"
  ON service_rules FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = profile_id);

-- RLS Policies for followups
CREATE POLICY "Users can view followups for their clients"
  ON followups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = followups.client_id
      AND clients.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert followups for their clients"
  ON followups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = followups.client_id
      AND clients.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update followups for their clients"
  ON followups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = followups.client_id
      AND clients.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = followups.client_id
      AND clients.profile_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default service rules
INSERT INTO service_rules (service_type, interval_days) VALUES
  ('Haircut', 30),
  ('Hair Color', 60),
  ('Highlights', 60),
  ('Perm', 90),
  ('Hair Treatment', 45),
  ('Styling', 30),
  ('Brow Wax', 21),
  ('Lash Extension', 30),
  ('Facial', 30),
  ('Manicure', 14),
  ('Pedicure', 21)
ON CONFLICT (service_type) DO NOTHING;

