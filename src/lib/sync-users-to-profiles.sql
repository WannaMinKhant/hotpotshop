-- ============================================
-- SYNC EXISTING AUTH USERS TO USER_PROFILES
-- ============================================
-- Run this in Supabase SQL Editor if you have
-- users in Authentication but not in user_profiles.
-- This creates missing profile entries automatically.
-- ============================================

-- Function to auto-create user_profiles entry when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cashier'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-sync future auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MANUAL SYNC: Insert existing auth users
-- ============================================
-- This inserts all current auth.users into user_profiles
-- if they don't already have a profile entry.

INSERT INTO public.user_profiles (id, email, name, role, is_active)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1), 'Unknown'),
  COALESCE(au.raw_user_meta_data->>'role', 'cashier'),
  true
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFY
-- ============================================
SELECT
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.user_profiles) AS profiles_count;

-- Show any mismatches
SELECT au.id, au.email, 'Missing profile' AS issue
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
