-- 11:11 Lucky Draw Platform - Complete Database Schema
-- This migration sets up all tables, RLS policies, and secure functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: admin_profiles
-- Stores administrator user profiles linked to Supabase Auth
-- ============================================================================
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: event_settings
-- Single-row configuration table for event management
-- ============================================================================
CREATE TABLE event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_registration_open BOOLEAN NOT NULL DEFAULT false,
  event_name TEXT NOT NULL DEFAULT '11:11 Lucky Draw',
  event_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  token_price INTEGER NOT NULL DEFAULT 30,
  max_participants INTEGER NOT NULL DEFAULT 50,
  organizer_name TEXT NOT NULL DEFAULT '11:11 Guppy Garage',
  sponsor_name TEXT NOT NULL DEFAULT '11:11 Bettas',
  contact_email TEXT,
  contact_phone TEXT,
  rules_text TEXT,
  eligibility_text TEXT,
  minimum_age INTEGER DEFAULT 18,
  payment_instructions TEXT,
  refund_policy TEXT,
  privacy_notice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure only one row exists
  CONSTRAINT single_row_check CHECK (id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
);

-- Insert default event settings
INSERT INTO event_settings (id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid);

-- ============================================================================
-- TABLE: prizes
-- Stores information about the three prizes
-- ============================================================================
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prize_number INTEGER NOT NULL UNIQUE CHECK (prize_number BETWEEN 1 AND 3),
  prize_name TEXT NOT NULL,
  variety_name TEXT,
  description TEXT,
  image_url TEXT,
  is_placeholder_image BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default prizes
INSERT INTO prizes (prize_number, prize_name, variety_name, description) VALUES
  (1, 'Exotic Betta - Prize 1', 'To be announced', 'First prize exotic betta fish'),
  (2, 'Exotic Betta - Prize 2', 'To be announced', 'Second prize exotic betta fish'),
  (3, 'Exotic Betta - Prize 3', 'To be announced', 'Third prize exotic betta fish');

-- ============================================================================
-- TABLE: entries
-- Stores all participant registrations
-- ============================================================================
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_code TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE,
  email TEXT,
  membership_note TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES admin_profiles(id),
  rejection_reason TEXT,
  rules_accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_entries_payment_status ON entries(payment_status);
CREATE INDEX idx_entries_mobile_number ON entries(mobile_number);
CREATE INDEX idx_entries_entry_code ON entries(entry_code);
CREATE INDEX idx_entries_created_at ON entries(created_at);

-- ============================================================================
-- TABLE: draw_state
-- Single-row table to track draw execution and prevent duplicates
-- ============================================================================
CREATE TABLE draw_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_executed BOOLEAN NOT NULL DEFAULT false,
  draw_executed_at TIMESTAMPTZ,
  draw_executed_by UUID REFERENCES admin_profiles(id),
  total_eligible_entries INTEGER,
  draw_method TEXT DEFAULT 'Secure random selection from verified entries',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure only one row exists
  CONSTRAINT single_row_draw_check CHECK (id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid)
);

-- Insert default draw state
INSERT INTO draw_state (id) VALUES ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid);

-- ============================================================================
-- TABLE: winners
-- Stores the three winners after the draw
-- ============================================================================
CREATE TABLE winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE RESTRICT,
  prize_id UUID NOT NULL REFERENCES prizes(id) ON DELETE RESTRICT,
  prize_number INTEGER NOT NULL CHECK (prize_number BETWEEN 1 AND 3),
  entry_code TEXT NOT NULL,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id),
  UNIQUE(prize_number)
);

-- ============================================================================
-- TABLE: audit_logs
-- Tracks important administrative actions
-- ============================================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- FUNCTION: generate_entry_code
-- Generates unique entry codes in format: 1111-XXXXXXXX
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_entry_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 random alphanumeric characters
    new_code := '1111-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM entries WHERE entry_code = new_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: create_entry
-- Atomically creates a new entry with capacity enforcement
-- ============================================================================
CREATE OR REPLACE FUNCTION create_entry(
  p_full_name TEXT,
  p_mobile_number TEXT,
  p_email TEXT DEFAULT NULL,
  p_membership_note TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_entry_code TEXT;
  v_entry_id UUID;
  v_current_count INTEGER;
  v_max_participants INTEGER;
  v_is_registration_open BOOLEAN;
  v_result JSON;
BEGIN
  -- Get event settings
  SELECT max_participants, is_registration_open 
  INTO v_max_participants, v_is_registration_open
  FROM event_settings 
  WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
  FOR UPDATE; -- Lock to prevent race conditions
  
  -- Check if registration is open
  IF NOT v_is_registration_open THEN
    RETURN json_build_object('success', false, 'error', 'Registration is currently closed');
  END IF;
  
  -- Count current entries
  SELECT COUNT(*) INTO v_current_count FROM entries;
  
  -- Check capacity
  IF v_current_count >= v_max_participants THEN
    RETURN json_build_object('success', false, 'error', 'Maximum capacity reached');
  END IF;
  
  -- Check for duplicate mobile number
  IF EXISTS(SELECT 1 FROM entries WHERE mobile_number = p_mobile_number) THEN
    RETURN json_build_object('success', false, 'error', 'Mobile number already registered');
  END IF;
  
  -- Generate unique entry code
  v_entry_code := generate_entry_code();
  
  -- Insert new entry
  INSERT INTO entries (
    entry_code,
    full_name,
    mobile_number,
    email,
    membership_note,
    payment_reference,
    rules_accepted
  ) VALUES (
    v_entry_code,
    p_full_name,
    p_mobile_number,
    p_email,
    p_membership_note,
    p_payment_reference,
    true
  ) RETURNING id INTO v_entry_id;
  
  -- Return success with entry details
  v_result := json_build_object(
    'success', true,
    'entry_id', v_entry_id,
    'entry_code', v_entry_code,
    'message', 'Registration successful. Please complete payment and wait for verification.'
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: verify_payment
-- Verifies a payment and logs the action
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_payment(
  p_entry_id UUID,
  p_admin_id UUID,
  p_status TEXT,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_entry_code TEXT;
BEGIN
  -- Validate status
  IF p_status NOT IN ('verified', 'rejected') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;
  
  -- Update entry
  UPDATE entries
  SET 
    payment_status = p_status,
    verified_at = CASE WHEN p_status = 'verified' THEN NOW() ELSE NULL END,
    verified_by = CASE WHEN p_status = 'verified' THEN p_admin_id ELSE NULL END,
    rejection_reason = p_rejection_reason,
    updated_at = NOW()
  WHERE id = p_entry_id
  RETURNING entry_code INTO v_entry_code;
  
  -- Log action
  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    p_admin_id,
    CASE WHEN p_status = 'verified' THEN 'payment_verified' ELSE 'payment_rejected' END,
    'entry',
    p_entry_id,
    json_build_object('entry_code', v_entry_code, 'status', p_status, 'reason', p_rejection_reason)
  );
  
  RETURN json_build_object('success', true, 'entry_code', v_entry_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: verify_token
-- Public function to verify a token by entry code (minimal data exposure)
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_token(p_entry_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_entry RECORD;
  v_winner_prize INTEGER;
  v_draw_executed BOOLEAN;
BEGIN
  -- Get entry details
  SELECT 
    id,
    full_name,
    payment_status,
    created_at
  INTO v_entry
  FROM entries
  WHERE entry_code = p_entry_code;
  
  -- Check if entry exists
  IF v_entry.id IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Invalid entry code'
    );
  END IF;
  
  -- Check draw status
  SELECT draw_executed INTO v_draw_executed FROM draw_state WHERE id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
  
  -- Check if winner
  SELECT prize_number INTO v_winner_prize
  FROM winners
  WHERE entry_id = v_entry.id;
  
  -- Build response
  v_result := json_build_object(
    'valid', true,
    'entry_code', p_entry_code,
    'participant_name', v_entry.full_name,
    'payment_status', v_entry.payment_status,
    'registered_at', v_entry.created_at,
    'draw_completed', COALESCE(v_draw_executed, false),
    'is_winner', v_winner_prize IS NOT NULL,
    'prize_number', v_winner_prize
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: execute_draw
-- Securely selects three distinct winners from verified entries
-- ============================================================================
CREATE OR REPLACE FUNCTION execute_draw(p_admin_id UUID)
RETURNS JSON AS $$
DECLARE
  v_draw_executed BOOLEAN;
  v_eligible_entries UUID[];
  v_winner_ids UUID[];
  v_winner_entry RECORD;
  v_prize RECORD;
  v_result JSON;
  v_winners_array JSON[] := '{}';
BEGIN
  -- Check if draw already executed
  SELECT draw_executed INTO v_draw_executed 
  FROM draw_state 
  WHERE id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
  FOR UPDATE; -- Lock to prevent concurrent execution
  
  IF v_draw_executed THEN
    RETURN json_build_object('success', false, 'error', 'Draw has already been executed');
  END IF;
  
  -- Get all eligible entries (verified payments only)
  SELECT ARRAY_AGG(id ORDER BY random())
  INTO v_eligible_entries
  FROM entries
  WHERE payment_status = 'verified';
  
  -- Check if we have enough entries
  IF array_length(v_eligible_entries, 1) IS NULL OR array_length(v_eligible_entries, 1) < 3 THEN
    RETURN json_build_object('success', false, 'error', 'Not enough eligible entries for draw');
  END IF;
  
  -- Select first 3 entries as winners (already randomized by ORDER BY random())
  v_winner_ids := v_eligible_entries[1:3];
  
  -- Insert winners
  FOR i IN 1..3 LOOP
    SELECT e.*, p.id as prize_id, p.prize_number
    INTO v_winner_entry
    FROM entries e
    CROSS JOIN prizes p
    WHERE e.id = v_winner_ids[i] AND p.prize_number = i;
    
    INSERT INTO winners (entry_id, prize_id, prize_number, entry_code)
    VALUES (v_winner_entry.id, v_winner_entry.prize_id, v_winner_entry.prize_number, v_winner_entry.entry_code);
    
    -- Build winner info for response
    v_winners_array := array_append(v_winners_array, json_build_object(
      'prize_number', i,
      'entry_code', v_winner_entry.entry_code,
      'participant_name', v_winner_entry.full_name
    ));
  END LOOP;
  
  -- Mark draw as executed
  UPDATE draw_state
  SET 
    draw_executed = true,
    draw_executed_at = NOW(),
    draw_executed_by = p_admin_id,
    total_eligible_entries = array_length(v_eligible_entries, 1),
    updated_at = NOW()
  WHERE id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
  
  -- Log action
  INSERT INTO audit_logs (admin_id, action, entity_type, details)
  VALUES (
    p_admin_id,
    'draw_executed',
    'draw',
    json_build_object(
      'total_eligible', array_length(v_eligible_entries, 1),
      'winners', v_winners_array
    )
  );
  
  -- Return result
  v_result := json_build_object(
    'success', true,
    'winners', v_winners_array,
    'total_eligible_entries', array_length(v_eligible_entries, 1)
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: get_draw_preview
-- Returns eligible entries for preview/demo mode (does NOT execute draw)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_draw_preview()
RETURNS JSON AS $$
DECLARE
  v_eligible_codes TEXT[];
  v_draw_executed BOOLEAN;
BEGIN
  SELECT draw_executed INTO v_draw_executed 
  FROM draw_state 
  WHERE id = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
  
  SELECT ARRAY_AGG(entry_code ORDER BY created_at)
  INTO v_eligible_codes
  FROM entries
  WHERE payment_status = 'verified';
  
  RETURN json_build_object(
    'eligible_codes', COALESCE(v_eligible_codes, ARRAY[]::TEXT[]),
    'total_eligible', COALESCE(array_length(v_eligible_codes, 1), 0),
    'draw_executed', COALESCE(v_draw_executed, false)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin profiles: Only admins can view admin profiles
-- NOTE: must not self-reference admin_profiles in the USING clause (causes infinite recursion).
-- id = auth.uid() lets each admin read their own row (which is all useAuth needs).
CREATE POLICY "Admins can view admin profiles"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update their own profile"
  ON admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Event settings: Public read, admin write
CREATE POLICY "Anyone can view event settings"
  ON event_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update event settings"
  ON event_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles));

-- Prizes: Public read, admin write
CREATE POLICY "Anyone can view prizes"
  ON prizes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update prizes"
  ON prizes FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles));

-- Entries: NO public read access to protect participant privacy
-- Only admins can view entries
CREATE POLICY "Admins can view all entries"
  ON entries FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles));

CREATE POLICY "Admins can update entries"
  ON entries FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles));

-- Draw state: Public read, admin write
CREATE POLICY "Anyone can view draw state"
  ON draw_state FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update draw state"
  ON draw_state FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_profiles));

-- Winners: Public read (limited info only via public query)
CREATE POLICY "Anyone can view winners"
  ON winners FOR SELECT
  TO anon, authenticated
  USING (true);

-- Audit logs: Admin read only
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_profiles));

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on functions to authenticated users (admins)
GRANT EXECUTE ON FUNCTION verify_payment TO authenticated;
GRANT EXECUTE ON FUNCTION execute_draw TO authenticated;
GRANT EXECUTE ON FUNCTION get_draw_preview TO authenticated;

-- Grant execute on public functions to anonymous users
GRANT EXECUTE ON FUNCTION create_entry TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_token TO anon, authenticated;

-- ============================================================================
-- UPDATED AT TRIGGER
-- Automatically update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON admin_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_settings_updated_at BEFORE UPDATE ON event_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prizes_updated_at BEFORE UPDATE ON prizes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draw_state_updated_at BEFORE UPDATE ON draw_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
