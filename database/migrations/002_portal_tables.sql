-- Migration 002: Portal Tables
-- Run this after the initial schema migration

-- ============================================
-- UPDATE USERS TABLE
-- ============================================
ALTER TABLE lwp_users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS supabase_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notification_push BOOLEAN DEFAULT FALSE;

-- Update role column to support new roles
ALTER TABLE lwp_users
  ALTER COLUMN role SET DEFAULT 'customer';

-- Add index for supabase_id lookups
CREATE INDEX IF NOT EXISTS idx_lwp_users_supabase_id ON lwp_users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_lwp_users_role ON lwp_users(role);

-- ============================================
-- SERVICE PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_service_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  inspection_frequency VARCHAR(50) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  price_per_sqft DECIMAL(10,4),
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROPERTIES
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES lwp_users(id),
  service_plan_id INTEGER REFERENCES lwp_service_plans(id),
  status VARCHAR(50) DEFAULT 'active',
  property_type VARCHAR(50) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  square_footage INTEGER,
  year_built INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  gate_code VARCHAR(100),
  lockbox_code VARCHAR(100),
  alarm_code VARCHAR(100),
  alarm_company VARCHAR(255),
  wifi_network VARCHAR(255),
  wifi_password VARCHAR(255),
  special_instructions TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  primary_image_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_properties_contacts (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  relationship VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS lwp_properties_utilities (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_properties(id) ON DELETE CASCADE,
  utility_type VARCHAR(100) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  account_number VARCHAR(255),
  phone VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_lwp_properties_owner ON lwp_properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_lwp_properties_status ON lwp_properties(status);

-- ============================================
-- CHECKLISTS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_checklists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_checklists_items (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_checklists(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  item VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE
);

-- ============================================
-- INSPECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_inspections (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  technician_id INTEGER REFERENCES lwp_users(id),
  checklist_id INTEGER REFERENCES lwp_checklists(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'scheduled',
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  weather_temp INTEGER,
  weather_conditions VARCHAR(100),
  overall_status VARCHAR(50),
  summary TEXT,
  internal_notes TEXT,
  report_pdf_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_inspections_responses (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_inspections(id) ON DELETE CASCADE,
  checklist_item_id INTEGER REFERENCES lwp_checklists_items(id),
  category VARCHAR(100) NOT NULL,
  item VARCHAR(255) NOT NULL,
  response VARCHAR(50) NOT NULL,
  notes TEXT,
  photo_ids JSONB
);

CREATE TABLE IF NOT EXISTS lwp_inspections_issues (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_inspections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  resolution_status VARCHAR(50) DEFAULT 'open',
  resolution_notes TEXT,
  photo_ids JSONB
);

CREATE INDEX IF NOT EXISTS idx_lwp_inspections_property ON lwp_inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_technician ON lwp_inspections(technician_id);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_scheduled ON lwp_inspections(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_lwp_inspections_status ON lwp_inspections(status);

-- ============================================
-- SERVICE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_service_requests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  requested_by_id INTEGER NOT NULL REFERENCES lwp_users(id),
  assigned_to_id INTEGER REFERENCES lwp_users(id),
  request_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'pending',
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  scheduled_date DATE,
  scheduled_time TIME,
  completed_at TIMESTAMP,
  completion_notes TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  invoice_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_property ON lwp_service_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_status ON lwp_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_lwp_service_requests_assigned ON lwp_service_requests(assigned_to_id);

-- ============================================
-- OCCUPANCY CALENDAR
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_occupancy_calendar (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES lwp_properties(id),
  event_type VARCHAR(50) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_lwp_occupancy_property ON lwp_occupancy_calendar(property_id);
CREATE INDEX IF NOT EXISTS idx_lwp_occupancy_dates ON lwp_occupancy_calendar(start_date, end_date);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_invoices (
  id SERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL REFERENCES lwp_users(id),
  property_id INTEGER REFERENCES lwp_properties(id),
  status VARCHAR(50) DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
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

CREATE INDEX IF NOT EXISTS idx_lwp_invoices_customer ON lwp_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_lwp_invoices_status ON lwp_invoices(status);
CREATE INDEX IF NOT EXISTS idx_lwp_invoices_due ON lwp_invoices(due_date);

-- ============================================
-- CONVERSATIONS & MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_conversations (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  property_id INTEGER REFERENCES lwp_properties(id),
  customer_id INTEGER NOT NULL REFERENCES lwp_users(id),
  status VARCHAR(50) DEFAULT 'open',
  last_message_at TIMESTAMP,
  unread_by_customer BOOLEAN DEFAULT FALSE,
  unread_by_staff BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES lwp_conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES lwp_users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lwp_messages_attachments (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_messages(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES lwp_media(id)
);

CREATE INDEX IF NOT EXISTS idx_lwp_conversations_customer ON lwp_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_lwp_messages_conversation ON lwp_messages(conversation_id);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_documents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  property_id INTEGER REFERENCES lwp_properties(id),
  customer_id INTEGER REFERENCES lwp_users(id),
  file_id INTEGER NOT NULL REFERENCES lwp_media(id),
  description TEXT,
  is_customer_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES lwp_users(id),
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  read_at TIMESTAMP,
  sent_email BOOLEAN DEFAULT FALSE,
  sent_sms BOOLEAN DEFAULT FALSE,
  sent_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lwp_notifications_user ON lwp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_lwp_notifications_unread ON lwp_notifications(user_id, read_at) WHERE read_at IS NULL;
