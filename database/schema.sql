-- Lake Watch Pros Database Schema
-- All tables prefixed with lwp_ for multi-project Supabase database
-- Payload CMS will run migrations automatically, but this provides reference

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (Admin authentication via Payload)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer', -- customer, technician, admin, owner
  supabase_id UUID UNIQUE, -- Links to Supabase Auth
  stripe_customer_id VARCHAR(255),
  notification_email BOOLEAN DEFAULT TRUE,
  notification_sms BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT FALSE,
  hash VARCHAR(255),
  salt VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expiration TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEDIA (File uploads)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_media (
  id SERIAL PRIMARY KEY,
  alt VARCHAR(255) NOT NULL,
  caption VARCHAR(255),
  filename VARCHAR(255),
  mime_type VARCHAR(100),
  filesize INTEGER,
  width INTEGER,
  height INTEGER,
  url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  card_url VARCHAR(500),
  hero_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SERVICES (Public website content)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description JSONB,
  icon VARCHAR(50) NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  image_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_services_pricing_tiers (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_services(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  per_visit VARCHAR(50),
  monthly_1x VARCHAR(50),
  monthly_2x VARCHAR(50),
  monthly_4x VARCHAR(50),
  flat_rate VARCHAR(50),
  note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS lwp_services_features (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_services(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL
);

-- ============================================
-- TESTIMONIALS (Public)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  quote TEXT NOT NULL,
  location VARCHAR(255),
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  service_used_id INTEGER REFERENCES lwp_services(id),
  featured BOOLEAN DEFAULT FALSE,
  photo_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TEAM (Public)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio JSONB,
  short_bio TEXT,
  photo_id INTEGER REFERENCES lwp_media(id),
  email VARCHAR(255),
  phone VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FAQS (Public)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_faqs (
  id SERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer JSONB NOT NULL,
  category VARCHAR(50) NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PAGES (Public website content)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  hero_title VARCHAR(255),
  hero_subtitle TEXT,
  hero_image_id INTEGER REFERENCES lwp_media(id),
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_pages_sections (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_pages(id) ON DELETE CASCADE,
  section_title VARCHAR(255),
  section_content JSONB,
  section_image_id INTEGER REFERENCES lwp_media(id)
);

-- ============================================
-- LEADS (Contact form submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  property_address TEXT,
  property_size VARCHAR(50),
  message TEXT,
  source VARCHAR(100) DEFAULT 'website',
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_leads_service_interest (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_leads(id) ON DELETE CASCADE,
  value VARCHAR(50) NOT NULL
);

-- ============================================
-- SERVICE PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_service_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  inspection_frequency VARCHAR(50) NOT NULL, -- weekly, biweekly, monthly
  base_price DECIMAL(10,2) NOT NULL,
  price_per_sqft DECIMAL(10,4),
  features JSONB, -- Array of feature strings
  is_active BOOLEAN DEFAULT TRUE,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROPERTIES (Customer properties - RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES lwp_users(id),
  service_plan_id INTEGER REFERENCES lwp_service_plans(id),
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, pending
  property_type VARCHAR(50) NOT NULL, -- house, condo, cabin, commercial
  -- Address
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  -- Details
  square_footage INTEGER,
  year_built INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  -- Access info (encrypted in production)
  gate_code VARCHAR(100),
  lockbox_code VARCHAR(100),
  alarm_code VARCHAR(100),
  alarm_company VARCHAR(255),
  wifi_network VARCHAR(255),
  wifi_password VARCHAR(255),
  special_instructions TEXT,
  -- Location
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  -- Media
  primary_image_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property emergency contacts
CREATE TABLE IF NOT EXISTS lwp_properties_contacts (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  relationship VARCHAR(100) -- neighbor, contractor, family, etc.
);

-- Property utilities
CREATE TABLE IF NOT EXISTS lwp_properties_utilities (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_properties(id) ON DELETE CASCADE,
  utility_type VARCHAR(100) NOT NULL, -- electric, gas, propane, water, internet
  provider VARCHAR(255) NOT NULL,
  account_number VARCHAR(255),
  phone VARCHAR(50)
);

-- ============================================
-- CHECKLISTS (Inspection templates)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_checklists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50), -- null = all types
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_checklists_items (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_checklists(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- exterior, hvac, plumbing, electrical, security
  item VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE
);

-- ============================================
-- INSPECTIONS (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_inspections (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  technician_id INTEGER REFERENCES lwp_users(id),
  checklist_id INTEGER REFERENCES lwp_checklists(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  -- Weather at time of inspection
  weather_temp INTEGER,
  weather_conditions VARCHAR(100),
  -- Results
  overall_status VARCHAR(50), -- all_clear, issues_found, urgent
  summary TEXT,
  internal_notes TEXT,
  -- PDF report
  report_pdf_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inspection checklist responses
CREATE TABLE IF NOT EXISTS lwp_inspections_responses (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_inspections(id) ON DELETE CASCADE,
  checklist_item_id INTEGER REFERENCES lwp_checklists_items(id),
  category VARCHAR(100) NOT NULL,
  item VARCHAR(255) NOT NULL,
  response VARCHAR(50) NOT NULL, -- pass, fail, needs_attention, na
  notes TEXT,
  photo_ids JSONB -- Array of media IDs
);

-- Inspection issues found
CREATE TABLE IF NOT EXISTS lwp_inspections_issues (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_inspections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL, -- low, medium, high, urgent
  category VARCHAR(100),
  resolution_status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved
  resolution_notes TEXT,
  photo_ids JSONB
);

-- ============================================
-- SERVICE REQUESTS (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_service_requests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  requested_by_id INTEGER NOT NULL REFERENCES lwp_users(id),
  assigned_to_id INTEGER REFERENCES lwp_users(id),
  request_type VARCHAR(50) NOT NULL, -- pre_arrival, post_departure, grocery_stocking, maintenance, custom
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
  status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, in_progress, completed, cancelled
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  scheduled_date DATE,
  scheduled_time TIME,
  completed_at TIMESTAMP,
  completion_notes TEXT,
  -- Billing
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  invoice_id INTEGER, -- Will reference lwp_invoices
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- OCCUPANCY CALENDAR (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_occupancy_calendar (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  event_type VARCHAR(50) NOT NULL, -- owner_visit, guest_stay, rental, maintenance, vacant
  title VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guest_count INTEGER,
  notes TEXT,
  pre_arrival_request_id INTEGER REFERENCES lwp_service_requests(id),
  post_departure_request_id INTEGER REFERENCES lwp_service_requests(id),
  created_by_id INTEGER REFERENCES lwp_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INVOICES (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES lwp_users(id),
  property_id INTEGER REFERENCES lwp_properties(id),
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  -- Stripe
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  pdf_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_invoices_line_items (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  service_request_id INTEGER REFERENCES lwp_service_requests(id)
);

-- ============================================
-- CONVERSATIONS (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_conversations (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  property_id INTEGER REFERENCES lwp_properties(id),
  customer_id INTEGER NOT NULL REFERENCES lwp_users(id),
  status VARCHAR(50) DEFAULT 'open', -- open, closed
  last_message_at TIMESTAMP,
  unread_by_customer BOOLEAN DEFAULT FALSE,
  unread_by_staff BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MESSAGES (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES lwp_conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES lwp_users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Staff-only notes
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_messages_attachments (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_messages(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES lwp_media(id)
);

-- ============================================
-- DOCUMENTS (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- contract, insurance, inspection_report, invoice, other
  property_id INTEGER REFERENCES lwp_properties(id),
  customer_id INTEGER REFERENCES lwp_users(id),
  file_id INTEGER NOT NULL REFERENCES lwp_media(id),
  description TEXT,
  is_customer_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS (RLS enabled)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES lwp_users(id),
  notification_type VARCHAR(50) NOT NULL, -- inspection_scheduled, inspection_complete, issue_found, message, invoice, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read_at TIMESTAMP,
  sent_email BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,
  sent_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PAYLOAD INTERNAL TABLES
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_payload_preferences (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  user_id INTEGER REFERENCES lwp_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_payload_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  batch INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
-- Public content
CREATE INDEX IF NOT EXISTS idx_lwp_services_slug ON lwp_services(slug);
CREATE INDEX IF NOT EXISTS idx_lwp_services_featured ON lwp_services(featured);
CREATE INDEX IF NOT EXISTS idx_lwp_testimonials_featured ON lwp_testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_lwp_faqs_category ON lwp_faqs(category);
CREATE INDEX IF NOT EXISTS idx_lwp_pages_slug ON lwp_pages(slug);
CREATE INDEX IF NOT EXISTS idx_lwp_leads_status ON lwp_leads(status);
CREATE INDEX IF NOT EXISTS idx_lwp_leads_created ON lwp_leads(created_at);

-- Users
CREATE INDEX IF NOT EXISTS idx_lwp_users_email ON lwp_users(email);
CREATE INDEX IF NOT EXISTS idx_lwp_users_supabase_id ON lwp_users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_lwp_users_role ON lwp_users(role);

-- Properties
CREATE INDEX IF NOT EXISTS idx_lwp_properties_owner ON lwp_properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_lwp_properties_status ON lwp_properties(status);

-- Inspections
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_property ON lwp_inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_technician ON lwp_inspections(technician_id);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_scheduled ON lwp_inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_status ON lwp_inspections(status);

-- Service Requests
CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_property ON lwp_service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_status ON lwp_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_assigned ON lwp_service_requests(assigned_to_id);

-- Occupancy
CREATE INDEX IF NOT EXISTS idx_lwp_occupancy_property ON lwp_occupancy_calendar(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_occupancy_dates ON lwp_occupancy_calendar(start_date, end_date);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_lwp_invoices_customer ON lwp_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_lwp_invoices_status ON lwp_invoices(status);
CREATE INDEX IF NOT EXISTS idx_lwp_invoices_due ON lwp_invoices(due_date);

-- Messages
CREATE INDEX IF NOT EXISTS idx_lwp_conversations_customer ON lwp_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_lwp_messages_conversation ON lwp_messages(conversation_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_lwp_notifications_user ON lwp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_lwp_notifications_unread ON lwp_notifications(user_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on customer data tables
ALTER TABLE lwp_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_occupancy_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lwp_notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION lwp_get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM lwp_users WHERE supabase_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to check if user is staff (technician, admin, owner)
CREATE OR REPLACE FUNCTION lwp_is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lwp_users
    WHERE supabase_id = auth.uid()
    AND role IN ('technician', 'admin', 'owner')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get current user's ID
CREATE OR REPLACE FUNCTION lwp_get_user_id()
RETURNS INTEGER AS $$
  SELECT id FROM lwp_users WHERE supabase_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================
-- PROPERTIES POLICIES
-- ============================================
-- Customers can view their own properties
CREATE POLICY "Customers can view own properties" ON lwp_properties
  FOR SELECT USING (owner_id = lwp_get_user_id());

-- Customers can update their own properties (limited fields via API)
CREATE POLICY "Customers can update own properties" ON lwp_properties
  FOR UPDATE USING (owner_id = lwp_get_user_id());

-- Staff can view all properties
CREATE POLICY "Staff can view all properties" ON lwp_properties
  FOR SELECT USING (lwp_is_staff());

-- Staff can manage all properties
CREATE POLICY "Staff can manage all properties" ON lwp_properties
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- INSPECTIONS POLICIES
-- ============================================
-- Customers can view inspections for their properties
CREATE POLICY "Customers can view own inspections" ON lwp_inspections
  FOR SELECT USING (
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

-- Technicians can view/update their assigned inspections
CREATE POLICY "Technicians can manage assigned inspections" ON lwp_inspections
  FOR ALL USING (
    technician_id = lwp_get_user_id() OR lwp_get_user_role() IN ('admin', 'owner')
  );

-- ============================================
-- SERVICE REQUESTS POLICIES
-- ============================================
-- Customers can view their own requests
CREATE POLICY "Customers can view own requests" ON lwp_service_requests
  FOR SELECT USING (requested_by_id = lwp_get_user_id());

-- Customers can create requests for their properties
CREATE POLICY "Customers can create requests" ON lwp_service_requests
  FOR INSERT WITH CHECK (
    requested_by_id = lwp_get_user_id() AND
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

-- Staff can manage all requests
CREATE POLICY "Staff can manage all requests" ON lwp_service_requests
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- OCCUPANCY CALENDAR POLICIES
-- ============================================
-- Customers can manage occupancy for their properties
CREATE POLICY "Customers can manage own occupancy" ON lwp_occupancy_calendar
  FOR ALL USING (
    property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
  );

-- Staff can view all occupancy
CREATE POLICY "Staff can view all occupancy" ON lwp_occupancy_calendar
  FOR SELECT USING (lwp_is_staff());

-- ============================================
-- INVOICES POLICIES
-- ============================================
-- Customers can view their own invoices
CREATE POLICY "Customers can view own invoices" ON lwp_invoices
  FOR SELECT USING (customer_id = lwp_get_user_id());

-- Staff can manage all invoices
CREATE POLICY "Staff can manage all invoices" ON lwp_invoices
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================
-- Customers can view their own conversations
CREATE POLICY "Customers can view own conversations" ON lwp_conversations
  FOR SELECT USING (customer_id = lwp_get_user_id());

-- Customers can create conversations
CREATE POLICY "Customers can create conversations" ON lwp_conversations
  FOR INSERT WITH CHECK (customer_id = lwp_get_user_id());

-- Staff can view all conversations
CREATE POLICY "Staff can view all conversations" ON lwp_conversations
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- MESSAGES POLICIES
-- ============================================
-- Users can view messages in their conversations
CREATE POLICY "Users can view conversation messages" ON lwp_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM lwp_conversations WHERE customer_id = lwp_get_user_id()
    ) OR lwp_is_staff()
  );

-- Users can send messages to their conversations
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
-- Customers can view documents shared with them
CREATE POLICY "Customers can view own documents" ON lwp_documents
  FOR SELECT USING (
    is_customer_visible = TRUE AND (
      customer_id = lwp_get_user_id() OR
      property_id IN (SELECT id FROM lwp_properties WHERE owner_id = lwp_get_user_id())
    )
  );

-- Staff can manage all documents
CREATE POLICY "Staff can manage all documents" ON lwp_documents
  FOR ALL USING (lwp_is_staff());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON lwp_notifications
  FOR SELECT USING (user_id = lwp_get_user_id());

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications" ON lwp_notifications
  FOR UPDATE USING (user_id = lwp_get_user_id());

-- ============================================
-- NOTES
-- ============================================
-- 1. Payload CMS will run migrations automatically on first start
-- 2. This SQL is for reference and manual setup if needed
-- 3. RLS policies require Supabase Auth to be configured
-- 4. The supabase_id column links Payload users to Supabase Auth users
-- 5. Staff roles (technician, admin, owner) bypass customer-level restrictions
-- 6. Sensitive fields (codes, passwords) should be encrypted in production
