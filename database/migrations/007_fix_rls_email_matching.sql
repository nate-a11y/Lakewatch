-- Migration 007: Fix RLS functions to match by email as fallback
-- The app uses email to find users, but RLS functions only checked supabase_id
-- This caused admins without supabase_id set to be blocked by RLS

-- ============================================
-- UPDATE HELPER FUNCTIONS TO CHECK EMAIL
-- ============================================

-- Get user role - check by supabase_id first, then by email
CREATE OR REPLACE FUNCTION lwp_get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM lwp_users
  WHERE supabase_id = auth.uid()
     OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is staff - check by supabase_id first, then by email
CREATE OR REPLACE FUNCTION lwp_is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lwp_users
    WHERE (supabase_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    AND role IN ('technician', 'admin', 'owner', 'staff')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Get user ID - check by supabase_id first, then by email
CREATE OR REPLACE FUNCTION lwp_get_user_id()
RETURNS INTEGER AS $$
  SELECT id FROM lwp_users
  WHERE supabase_id = auth.uid()
     OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- OPTIONAL: Auto-link supabase_id on login
-- This trigger will set supabase_id when a user logs in
-- if their email matches but supabase_id is null
-- ============================================

CREATE OR REPLACE FUNCTION lwp_auto_link_supabase_id()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lwp_users
  SET supabase_id = NEW.id,
      updated_at = NOW()
  WHERE email = NEW.email
    AND supabase_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users insert (new signups/logins)
DROP TRIGGER IF EXISTS trigger_auto_link_supabase_id ON auth.users;
CREATE TRIGGER trigger_auto_link_supabase_id
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION lwp_auto_link_supabase_id();
