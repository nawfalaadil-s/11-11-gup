-- ============================================
-- ADMIN USER SETUP SCRIPT
-- ============================================
-- Run this AFTER creating your user in Supabase Auth
--
-- STEP 1: Create user in Supabase Dashboard
--   URL: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/auth/users
--   Click "Add User" → "Create new user"
--   Enter email and password
--   Check "Auto Confirm User"
--   Copy the User UID
--
-- STEP 2: Replace the values below and run this SQL
--   URL: https://supabase.com/dashboard/project/adhjhinmevsxmdumtsli/sql/new
--
-- STEP 3: Login at your app's /admin/login page
-- ============================================

-- Replace these three values with YOUR actual data:
-- 1. The UUID from Supabase Auth (looks like: 12345678-abcd-1234-abcd-123456789abc)
-- 2. The email you used to create the user
-- 3. Your full name

INSERT INTO admin_profiles (id, email, full_name)
VALUES (
  'REPLACE-WITH-YOUR-USER-UUID-HERE',
  'REPLACE-WITH-YOUR-EMAIL-HERE@example.com',
  'Your Full Name'
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;


-- ============================================
-- OPTIONAL: Quick test queries
-- ============================================

-- Check if admin was created:
-- SELECT * FROM admin_profiles;

-- Check event settings:
-- SELECT * FROM event_settings;

-- Check prizes:
-- SELECT * FROM prizes;

-- Open registration (when ready):
-- UPDATE event_settings SET is_registration_open = true WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Close registration:
-- UPDATE event_settings SET is_registration_open = false WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
