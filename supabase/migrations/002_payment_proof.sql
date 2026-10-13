-- ============================================================================
-- MIGRATION 002: Payment screenshot upload + transaction ID
-- Adds a payment proof image column to entries, extends create_entry to
-- accept it, and creates a Storage bucket for hosting the screenshots.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. New columns on entries
-- ----------------------------------------------------------------------------
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_screenshot_path TEXT;

COMMENT ON COLUMN entries.payment_screenshot_url IS
  'Public URL of the uploaded payment screenshot (Supabase Storage).';
COMMENT ON COLUMN entries.payment_screenshot_path IS
  'Storage object path, kept so the file can be deleted if the entry is removed.';

-- ----------------------------------------------------------------------------
-- 2. create_entry now accepts an optional payment screenshot URL
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS create_entry(TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_entry(
  p_full_name TEXT,
  p_mobile_number TEXT,
  p_email TEXT DEFAULT NULL,
  p_membership_note TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_payment_screenshot_url TEXT DEFAULT NULL,
  p_payment_screenshot_path TEXT DEFAULT NULL
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
    payment_screenshot_url,
    payment_screenshot_path,
    rules_accepted
  ) VALUES (
    v_entry_code,
    p_full_name,
    p_mobile_number,
    p_email,
    p_membership_note,
    p_payment_reference,
    p_payment_screenshot_url,
    p_payment_screenshot_path,
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

-- Re-grant execute (DROP FUNCTION above clears grants)
GRANT EXECUTE ON FUNCTION create_entry TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Storage bucket for payment screenshots
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 4. Storage RLS policies
-- ----------------------------------------------------------------------------

-- Anonymous + authenticated users may upload (registration happens signed-out).
-- Restricted to this bucket and to image mime types as defence in depth.
DROP POLICY IF EXISTS "Public upload payment screenshots" ON storage.objects;
CREATE POLICY "Public upload payment screenshots"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND lower(coalesce(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png', 'image/webp')
  );

-- Anyone may view a screenshot (needed so the admin can open the URL).
DROP POLICY IF EXISTS "Public view payment screenshots" ON storage.objects;
CREATE POLICY "Public view payment screenshots"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'payment-screenshots');

-- Admins may delete screenshots (e.g. when rejecting an entry).
DROP POLICY IF EXISTS "Admins can delete payment screenshots" ON storage.objects;
CREATE POLICY "Admins can delete payment screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots'
    AND auth.uid() IN (SELECT id FROM admin_profiles)
  );
