-- Migration 006: Add notes column to lwp_users
-- Allows storing admin notes about customers

ALTER TABLE lwp_users
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN lwp_users.notes IS 'Internal notes about the user (visible to admin/staff only)';
