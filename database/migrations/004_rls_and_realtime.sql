-- Migration 004: Complete RLS Policies and Realtime Setup
-- Fixes UNRESTRICTED tables and enables realtime for notifications
-- Run this in the Supabase SQL Editor

-- ============================================
-- ENABLE RLS ON ALL REMAINING TABLES
-- ============================================

-- Public website content (read-only for all)
ALTER TABLE lwp_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_services_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_services_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_pages_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_service_plans ENABLE ROW LEVEL SECURITY;

-- User management
ALTER TABLE lwp_users ENABLE ROW LEVEL SECURITY;

-- Media/Files
ALTER TABLE lwp_media ENABLE ROW LEVEL SECURITY;

-- Leads
ALTER TABLE lwp_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_leads_service_interest ENABLE ROW LEVEL SECURITY;

-- Checklists
ALTER TABLE lwp_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_checklists_items ENABLE ROW LEVEL SECURITY;

-- Inspection child tables
ALTER TABLE lwp_inspections_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_inspections_responses ENABLE ROW LEVEL SECURITY;

-- Invoice child tables
ALTER TABLE lwp_invoices_line_items ENABLE ROW LEVEL SECURITY;

-- Property child tables
ALTER TABLE lwp_properties_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_properties_utilities ENABLE ROW LEVEL SECURITY;

-- Messages child tables
ALTER TABLE lwp_messages_attachments ENABLE ROW LEVEL SECURITY;

-- Payload internal tables
ALTER TABLE lwp_payload_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_payload_migrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC WEBSITE CONTENT POLICIES (read-only)
-- These are publicly viewable on the website
-- ============================================

-- Services (public read, staff write)
DROP POLICY IF EXISTS "Public can view services" ON lwp_services;
CREATE POLICY "Public can view services" ON lwp_services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage services" ON lwp_services;
CREATE POLICY "Staff can manage services" ON lwp_services
  FOR ALL USING (lwp_is_staff());

-- Services pricing tiers (public read, staff write)
DROP POLICY IF EXISTS "Public can view pricing tiers" ON lwp_services_pricing_tiers;
CREATE POLICY "Public can view pricing tiers" ON lwp_services_pricing_tiers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage pricing tiers" ON lwp_services_pricing_tiers;
CREATE POLICY "Staff can manage pricing tiers" ON lwp_services_pricing_tiers
  FOR ALL USING (lwp_is_staff());

-- Services features (public read, staff write)
DROP POLICY IF EXISTS "Public can view service features" ON lwp_services_features;
CREATE POLICY "Public can view service features" ON lwp_services_features
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage service features" ON lwp_services_features;
CREATE POLICY "Staff can manage service features" ON lwp_services_features
  FOR ALL USING (lwp_is_staff());

-- Testimonials (public read, staff write)
DROP POLICY IF EXISTS "Public can view testimonials" ON lwp_testimonials;
CREATE POLICY "Public can view testimonials" ON lwp_testimonials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage testimonials" ON lwp_testimonials;
CREATE POLICY "Staff can manage testimonials" ON lwp_testimonials
  FOR ALL USING (lwp_is_staff());

-- Team (public read, staff write)
DROP POLICY IF EXISTS "Public can view team" ON lwp_team;
CREATE POLICY "Public can view team" ON lwp_team
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage team" ON lwp_team;
CREATE POLICY "Staff can manage team" ON lwp_team
  FOR ALL USING (lwp_is_staff());

-- FAQs (public read, staff write)
DROP POLICY IF EXISTS "Public can view faqs" ON lwp_faqs;
CREATE POLICY "Public can view faqs" ON lwp_faqs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage faqs" ON lwp_faqs;
CREATE POLICY "Staff can manage faqs" ON lwp_faqs
  FOR ALL USING (lwp_is_staff());

-- Pages (public read, staff write)
DROP POLICY IF EXISTS "Public can view pages" ON lwp_pages;
CREATE POLICY "Public can view pages" ON lwp_pages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage pages" ON lwp_pages;
CREATE POLICY "Staff can manage pages" ON lwp_pages
  FOR ALL USING (lwp_is_staff());

-- Page sections (public read, staff write)
DROP POLICY IF EXISTS "Public can view page sections" ON lwp_pages_sections;
CREATE POLICY "Public can view page sections" ON lwp_pages_sections
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage page sections" ON lwp_pages_sections;
CREATE POLICY "Staff can manage page sections" ON lwp_pages_sections
  FOR ALL USING (lwp_is_staff());

-- Service Plans (public read, staff write)
DROP POLICY IF EXISTS "Public can view service plans" ON lwp_service_plans;
CREATE POLICY "Public can view service plans" ON lwp_service_plans
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage service plans" ON lwp_service_plans;
CREATE POLICY "Staff can manage service plans" ON lwp_service_plans
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can view their own record
DROP POLICY IF EXISTS "Users can view own record" ON lwp_users;
CREATE POLICY "Users can view own record" ON lwp_users
  FOR SELECT USING (supabase_id = auth.uid());

-- Users can update their own record (limited fields handled by API)
DROP POLICY IF EXISTS "Users can update own record" ON lwp_users;
CREATE POLICY "Users can update own record" ON lwp_users
  FOR UPDATE USING (supabase_id = auth.uid());

-- Staff can view all users
DROP POLICY IF EXISTS "Staff can view all users" ON lwp_users;
CREATE POLICY "Staff can view all users" ON lwp_users
  FOR SELECT USING (lwp_is_staff());

-- Staff can manage all users
DROP POLICY IF EXISTS "Staff can manage all users" ON lwp_users;
CREATE POLICY "Staff can manage all users" ON lwp_users
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- MEDIA POLICIES
-- ============================================

-- Public media can be viewed by anyone (for website images)
DROP POLICY IF EXISTS "Public can view media" ON lwp_media;
CREATE POLICY "Public can view media" ON lwp_media
  FOR SELECT USING (true);

-- Staff can manage all media
DROP POLICY IF EXISTS "Staff can manage media" ON lwp_media;
CREATE POLICY "Staff can manage media" ON lwp_media
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- LEADS POLICIES (staff only)
-- ============================================

DROP POLICY IF EXISTS "Staff can manage leads" ON lwp_leads;
CREATE POLICY "Staff can manage leads" ON lwp_leads
  FOR ALL USING (lwp_is_staff());

-- Anyone can create a lead (contact form)
DROP POLICY IF EXISTS "Public can create leads" ON lwp_leads;
CREATE POLICY "Public can create leads" ON lwp_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage lead interests" ON lwp_leads_service_interest;
CREATE POLICY "Staff can manage lead interests" ON lwp_leads_service_interest
  FOR ALL USING (lwp_is_staff());

-- Allow inserting lead interests when creating a lead
DROP POLICY IF EXISTS "Public can create lead interests" ON lwp_leads_service_interest;
CREATE POLICY "Public can create lead interests" ON lwp_leads_service_interest
  FOR INSERT WITH CHECK (true);

-- ============================================
-- CHECKLISTS POLICIES
-- ============================================

-- Staff can view/manage all checklists
DROP POLICY IF EXISTS "Staff can manage checklists" ON lwp_checklists;
CREATE POLICY "Staff can manage checklists" ON lwp_checklists
  FOR ALL USING (lwp_is_staff());

-- Technicians can view checklists (for inspections)
DROP POLICY IF EXISTS "Technicians can view checklists" ON lwp_checklists;
CREATE POLICY "Technicians can view checklists" ON lwp_checklists
  FOR SELECT USING (lwp_get_user_role() = 'technician');

DROP POLICY IF EXISTS "Staff can manage checklist items" ON lwp_checklists_items;
CREATE POLICY "Staff can manage checklist items" ON lwp_checklists_items
  FOR ALL USING (lwp_is_staff());

DROP POLICY IF EXISTS "Technicians can view checklist items" ON lwp_checklists_items;
CREATE POLICY "Technicians can view checklist items" ON lwp_checklists_items
  FOR SELECT USING (lwp_get_user_role() = 'technician');

-- ============================================
-- INSPECTION CHILD TABLES POLICIES
-- Inherit access from parent inspection
-- ============================================

-- Inspection issues - customers can view their property's issues
DROP POLICY IF EXISTS "Customers can view own inspection issues" ON lwp_inspections_issues;
CREATE POLICY "Customers can view own inspection issues" ON lwp_inspections_issues
  FOR SELECT USING (
    _parent_id IN (
      SELECT i.id FROM lwp_inspections i
      JOIN lwp_properties p ON i.property_id = p.id
      WHERE p.owner_id = lwp_get_user_id()
    )
  );

DROP POLICY IF EXISTS "Staff can manage inspection issues" ON lwp_inspections_issues;
CREATE POLICY "Staff can manage inspection issues" ON lwp_inspections_issues
  FOR ALL USING (lwp_is_staff());

-- Inspection responses - customers can view their property's responses
DROP POLICY IF EXISTS "Customers can view own inspection responses" ON lwp_inspections_responses;
CREATE POLICY "Customers can view own inspection responses" ON lwp_inspections_responses
  FOR SELECT USING (
    _parent_id IN (
      SELECT i.id FROM lwp_inspections i
      JOIN lwp_properties p ON i.property_id = p.id
      WHERE p.owner_id = lwp_get_user_id()
    )
  );

DROP POLICY IF EXISTS "Staff can manage inspection responses" ON lwp_inspections_responses;
CREATE POLICY "Staff can manage inspection responses" ON lwp_inspections_responses
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- INVOICE CHILD TABLES POLICIES
-- ============================================

-- Customers can view line items on their invoices
DROP POLICY IF EXISTS "Customers can view own invoice items" ON lwp_invoices_line_items;
CREATE POLICY "Customers can view own invoice items" ON lwp_invoices_line_items
  FOR SELECT USING (
    _parent_id IN (
      SELECT id FROM lwp_invoices WHERE customer_id = lwp_get_user_id()
    )
  );

DROP POLICY IF EXISTS "Staff can manage invoice items" ON lwp_invoices_line_items;
CREATE POLICY "Staff can manage invoice items" ON lwp_invoices_line_items
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- PROPERTY CHILD TABLES POLICIES
-- ============================================

-- Customers can view/manage contacts for their properties
DROP POLICY IF EXISTS "Customers can manage own property contacts" ON lwp_properties_contacts;
CREATE POLICY "Customers can manage own property contacts" ON lwp_properties_contacts
  FOR ALL USING (
    _parent_id IN (
      SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id()
    )
  );

DROP POLICY IF EXISTS "Staff can manage all property contacts" ON lwp_properties_contacts;
CREATE POLICY "Staff can manage all property contacts" ON lwp_properties_contacts
  FOR ALL USING (lwp_is_staff());

-- Customers can view/manage utilities for their properties
DROP POLICY IF EXISTS "Customers can manage own property utilities" ON lwp_properties_utilities;
CREATE POLICY "Customers can manage own property utilities" ON lwp_properties_utilities
  FOR ALL USING (
    _parent_id IN (
      SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id()
    )
  );

DROP POLICY IF EXISTS "Staff can manage all property utilities" ON lwp_properties_utilities;
CREATE POLICY "Staff can manage all property utilities" ON lwp_properties_utilities
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- MESSAGE ATTACHMENTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view message attachments" ON lwp_messages_attachments;
CREATE POLICY "Users can view message attachments" ON lwp_messages_attachments
  FOR SELECT USING (
    _parent_id IN (
      SELECT m.id FROM lwp_messages m
      JOIN lwp_conversations c ON m.conversation_id = c.id
      WHERE c.customer_id = lwp_get_user_id()
    ) OR lwp_is_staff()
  );

DROP POLICY IF EXISTS "Staff can manage message attachments" ON lwp_messages_attachments;
CREATE POLICY "Staff can manage message attachments" ON lwp_messages_attachments
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- PAYLOAD INTERNAL TABLES (admin only)
-- ============================================

DROP POLICY IF EXISTS "Staff can manage payload preferences" ON lwp_payload_preferences;
CREATE POLICY "Staff can manage payload preferences" ON lwp_payload_preferences
  FOR ALL USING (lwp_is_staff());

DROP POLICY IF EXISTS "Staff can manage payload migrations" ON lwp_payload_migrations;
CREATE POLICY "Staff can manage payload migrations" ON lwp_payload_migrations
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- ENABLE REALTIME FOR KEY TABLES
-- ============================================

-- Enable realtime publication for the tables that need live updates
-- First, check if the publication exists and create it if not
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE lwp_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE lwp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE lwp_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE lwp_inspections;
ALTER PUBLICATION supabase_realtime ADD TABLE lwp_service_requests;

-- ============================================
-- SERVICE ROLE BYPASS (for API routes)
-- These functions allow authenticated API routes to bypass RLS
-- ============================================

-- Function to create notifications (called by API with service role)
CREATE OR REPLACE FUNCTION lwp_create_notification(
  p_user_id INTEGER,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT DEFAULT NULL,
  p_link VARCHAR(500) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_id INTEGER;
BEGIN
  INSERT INTO lwp_notifications (user_id, notification_type, title, message, link, created_at)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, NOW())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (API will use service role key)
GRANT EXECUTE ON FUNCTION lwp_create_notification TO authenticated;

-- ============================================
-- ADD MISSING COLUMNS (if schema was created earlier)
-- ============================================

-- Ensure checklist_items has the correct column name
DO $$
BEGIN
  -- Check if 'item' column exists but 'item_text' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'item')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'item_text')
  THEN
    ALTER TABLE lwp_checklists_items RENAME COLUMN item TO item_text;
  END IF;

  -- Check if 'required' column exists but 'is_required' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'required')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'is_required')
  THEN
    ALTER TABLE lwp_checklists_items RENAME COLUMN required TO is_required;
  END IF;

  -- Add requires_photo if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'requires_photo')
  THEN
    ALTER TABLE lwp_checklists_items ADD COLUMN requires_photo BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add sort_order if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists_items' AND column_name = 'sort_order')
  THEN
    ALTER TABLE lwp_checklists_items ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add plan_type to checklists if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_checklists' AND column_name = 'plan_type')
  THEN
    ALTER TABLE lwp_checklists ADD COLUMN plan_type VARCHAR(50) DEFAULT 'Custom';
  END IF;
END $$;

-- Add estimated_duration to service_requests if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_service_requests' AND column_name = 'estimated_duration')
  THEN
    ALTER TABLE lwp_service_requests ADD COLUMN estimated_duration INTEGER DEFAULT 60;
  END IF;
END $$;

-- Add access_notes to properties if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_properties' AND column_name = 'access_notes')
  THEN
    ALTER TABLE lwp_properties ADD COLUMN access_notes TEXT;
  END IF;
END $$;

-- Add checklist_id to properties for default checklist assignment
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lwp_properties' AND column_name = 'checklist_id')
  THEN
    ALTER TABLE lwp_properties ADD COLUMN checklist_id INTEGER REFERENCES lwp_checklists(id);
  END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- This migration:
-- 1. Enables RLS on all tables that were showing as UNRESTRICTED
-- 2. Creates appropriate policies for each table:
--    - Public content (services, team, faqs, etc.) = public read, staff write
--    - User data = users can see/edit their own, staff can see all
--    - Child tables = inherit from parent table's access rules
-- 3. Enables realtime for notifications, messages, inspections, and service requests
-- 4. Adds helper function for creating notifications from API routes
-- 5. Ensures schema columns match what the application expects
