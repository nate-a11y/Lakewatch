-- Migration 005: Supabase Storage Buckets
-- Run this in the Supabase SQL Editor AFTER creating buckets in Dashboard

-- ============================================
-- STEP 1: CREATE BUCKETS VIA SUPABASE DASHBOARD
-- ============================================
-- Go to: Supabase Dashboard → Storage → New Bucket
--
-- Create these 5 buckets with the following settings:
--
-- 1. inspection-photos
--    - Public: YES
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
--
-- 2. service-request-photos
--    - Public: YES
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
--
-- 3. property-photos
--    - Public: YES
--    - File size limit: 10MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
--
-- 4. documents
--    - Public: NO (private - uses signed URLs)
--    - File size limit: 20MB
--    - Allowed MIME types: application/pdf, image/jpeg, image/png,
--                          application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
--
-- 5. avatars
--    - Public: YES
--    - File size limit: 2MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- NOTE: Bucket creation via SQL is blocked by RLS on storage.buckets table.
--       You MUST create buckets through the Dashboard UI.
--
-- ============================================
-- STEP 2: RUN THIS SQL AFTER CREATING BUCKETS
-- ============================================

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Helper function to check if user owns the property related to an inspection
CREATE OR REPLACE FUNCTION storage.lwp_owns_inspection_property(inspection_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_inspection_id INTEGER;
  v_property_owner_id INTEGER;
  v_user_id INTEGER;
BEGIN
  -- Extract inspection ID from path (format: inspections/{inspection_id}/...)
  v_inspection_id := (regexp_match(inspection_path, 'inspections/(\d+)/'))[1]::INTEGER;

  IF v_inspection_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get the property owner for this inspection
  SELECT p.owner_id INTO v_property_owner_id
  FROM lwp_inspections i
  JOIN lwp_properties p ON i.property_id = p.id
  WHERE i.id = v_inspection_id;

  -- Get current user ID
  SELECT id INTO v_user_id FROM lwp_users WHERE supabase_id = auth.uid();

  RETURN v_property_owner_id = v_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSPECTION PHOTOS POLICIES
-- ============================================

-- Anyone authenticated can view inspection photos
DROP POLICY IF EXISTS "Authenticated users can view inspection photos" ON storage.objects;
CREATE POLICY "Authenticated users can view inspection photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

-- Staff can upload inspection photos
DROP POLICY IF EXISTS "Staff can upload inspection photos" ON storage.objects;
CREATE POLICY "Staff can upload inspection photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'inspection-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- Staff can delete inspection photos
DROP POLICY IF EXISTS "Staff can delete inspection photos" ON storage.objects;
CREATE POLICY "Staff can delete inspection photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'inspection-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- ============================================
-- SERVICE REQUEST PHOTOS POLICIES
-- ============================================

-- Authenticated users can view service request photos
DROP POLICY IF EXISTS "Authenticated users can view service photos" ON storage.objects;
CREATE POLICY "Authenticated users can view service photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'service-request-photos' AND auth.role() = 'authenticated');

-- Staff can upload service request photos
DROP POLICY IF EXISTS "Staff can upload service photos" ON storage.objects;
CREATE POLICY "Staff can upload service photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'service-request-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- Staff can delete service request photos
DROP POLICY IF EXISTS "Staff can delete service photos" ON storage.objects;
CREATE POLICY "Staff can delete service photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'service-request-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- ============================================
-- PROPERTY PHOTOS POLICIES
-- ============================================

-- Anyone authenticated can view property photos
DROP POLICY IF EXISTS "Authenticated users can view property photos" ON storage.objects;
CREATE POLICY "Authenticated users can view property photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-photos' AND auth.role() = 'authenticated');

-- Staff can upload property photos
DROP POLICY IF EXISTS "Staff can upload property photos" ON storage.objects;
CREATE POLICY "Staff can upload property photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- Customers can upload photos to their own properties
DROP POLICY IF EXISTS "Customers can upload own property photos" ON storage.objects;
CREATE POLICY "Customers can upload own property photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] IN (
      SELECT id::TEXT FROM lwp_properties WHERE owner_id = lwp_get_user_id()
    )
  );

-- Staff can delete property photos
DROP POLICY IF EXISTS "Staff can delete property photos" ON storage.objects;
CREATE POLICY "Staff can delete property photos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'property-photos' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- ============================================
-- DOCUMENTS POLICIES (private bucket)
-- ============================================

-- Users can view documents shared with them
DROP POLICY IF EXISTS "Users can view their documents" ON storage.objects;
CREATE POLICY "Users can view their documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    (
      lwp_is_staff() OR
      (storage.foldername(name))[1] = 'customers' AND
      (storage.foldername(name))[2] = lwp_get_user_id()::TEXT
    )
  );

-- Staff can upload documents
DROP POLICY IF EXISTS "Staff can upload documents" ON storage.objects;
CREATE POLICY "Staff can upload documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- Staff can delete documents
DROP POLICY IF EXISTS "Staff can delete documents" ON storage.objects;
CREATE POLICY "Staff can delete documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated' AND
    lwp_is_staff()
  );

-- ============================================
-- AVATARS POLICIES
-- ============================================

-- Anyone can view avatars (public)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ============================================
-- PUBLIC ACCESS FOR PUBLIC BUCKETS
-- ============================================

-- Allow public read access to public buckets
DROP POLICY IF EXISTS "Public read for inspection photos" ON storage.objects;
CREATE POLICY "Public read for inspection photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'inspection-photos');

DROP POLICY IF EXISTS "Public read for service photos" ON storage.objects;
CREATE POLICY "Public read for service photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'service-request-photos');

DROP POLICY IF EXISTS "Public read for property photos" ON storage.objects;
CREATE POLICY "Public read for property photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-photos');
