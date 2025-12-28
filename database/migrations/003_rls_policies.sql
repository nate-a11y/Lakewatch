-- Migration 003: Row Level Security Policies
-- Run this after portal tables migration

-- ============================================
-- ENABLE RLS ON PORTAL TABLES
-- ============================================
ALTER TABLE lwp_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_occupancy_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION lwp_get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM lwp_users WHERE supabase_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION lwp_is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lwp_users
    WHERE supabase_id = auth.uid()
    AND role IN ('technician', 'admin', 'owner')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION lwp_get_user_id()
RETURNS INTEGER AS $$
  SELECT id FROM lwp_users WHERE supabase_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- PROPERTIES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own properties" ON lwp_properties;
CREATE POLICY "Customers can view own properties" ON lwp_properties
  FOR SELECT USING (owner_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Customers can update own properties" ON lwp_properties;
CREATE POLICY "Customers can update own properties" ON lwp_properties
  FOR UPDATE USING (owner_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Staff can view all properties" ON lwp_properties;
CREATE POLICY "Staff can view all properties" ON lwp_properties
  FOR SELECT USING (lwp_is_staff());

DROP POLICY IF EXISTS "Staff can manage all properties" ON lwp_properties;
CREATE POLICY "Staff can manage all properties" ON lwp_properties
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- INSPECTIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own inspections" ON lwp_inspections;
CREATE POLICY "Customers can view own inspections" ON lwp_inspections
  FOR SELECT USING (
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

DROP POLICY IF EXISTS "Technicians can manage assigned inspections" ON lwp_inspections;
CREATE POLICY "Technicians can manage assigned inspections" ON lwp_inspections
  FOR ALL USING (
    technician_id = lwp_get_user_id() OR lwp_get_user_role() IN ('admin', 'owner')
  );

-- ============================================
-- SERVICE REQUESTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own requests" ON lwp_service_requests;
CREATE POLICY "Customers can view own requests" ON lwp_service_requests
  FOR SELECT USING (requested_by_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Customers can create requests" ON lwp_service_requests;
CREATE POLICY "Customers can create requests" ON lwp_service_requests
  FOR INSERT WITH CHECK (
    requested_by_id = lwp_get_user_id() AND
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

DROP POLICY IF EXISTS "Staff can manage all requests" ON lwp_service_requests;
CREATE POLICY "Staff can manage all requests" ON lwp_service_requests
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- OCCUPANCY CALENDAR POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can manage own occupancy" ON lwp_occupancy_calendar;
CREATE POLICY "Customers can manage own occupancy" ON lwp_occupancy_calendar
  FOR ALL USING (
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

DROP POLICY IF EXISTS "Staff can view all occupancy" ON lwp_occupancy_calendar;
CREATE POLICY "Staff can view all occupancy" ON lwp_occupancy_calendar
  FOR SELECT USING (lwp_is_staff());

-- ============================================
-- INVOICES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own invoices" ON lwp_invoices;
CREATE POLICY "Customers can view own invoices" ON lwp_invoices
  FOR SELECT USING (customer_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Staff can manage all invoices" ON lwp_invoices;
CREATE POLICY "Staff can manage all invoices" ON lwp_invoices
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own conversations" ON lwp_conversations;
CREATE POLICY "Customers can view own conversations" ON lwp_conversations
  FOR SELECT USING (customer_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Customers can create conversations" ON lwp_conversations;
CREATE POLICY "Customers can create conversations" ON lwp_conversations
  FOR INSERT WITH CHECK (customer_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Staff can view all conversations" ON lwp_conversations;
CREATE POLICY "Staff can view all conversations" ON lwp_conversations
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- MESSAGES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view conversation messages" ON lwp_messages;
CREATE POLICY "Users can view conversation messages" ON lwp_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM lwp_conversations WHERE customer_id = lwp_get_user_id()
    ) OR lwp_is_staff()
  );

DROP POLICY IF EXISTS "Users can send messages" ON lwp_messages;
CREATE POLICY "Users can send messages" ON lwp_messages
  FOR INSERT WITH CHECK (
    sender_id = lwp_get_user_id() AND (
      conversation_id IN (
        SELECT id FROM lwp_conversations WHERE customer_id = lwp_get_user_id()
      ) OR lwp_is_staff()
    )
  );

-- ============================================
-- DOCUMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Customers can view own documents" ON lwp_documents;
CREATE POLICY "Customers can view own documents" ON lwp_documents
  FOR SELECT USING (
    is_customer_visible = TRUE AND (
      customer_id = lwp_get_user_id() OR
      property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
    )
  );

DROP POLICY IF EXISTS "Staff can manage all documents" ON lwp_documents;
CREATE POLICY "Staff can manage all documents" ON lwp_documents
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON lwp_notifications;
CREATE POLICY "Users can view own notifications" ON lwp_notifications
  FOR SELECT USING (user_id = lwp_get_user_id());

DROP POLICY IF EXISTS "Users can update own notifications" ON lwp_notifications;
CREATE POLICY "Users can update own notifications" ON lwp_notifications
  FOR UPDATE USING (user_id = lwp_get_user_id());
