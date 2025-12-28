-- Lake Watch Pros Database Schema
-- All tables prefixed with lwp_ for multi-project Supabase database
-- Payload CMS will run migrations automatically, but this provides reference

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (Admin authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
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
-- SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description JSONB, -- Lexical rich text stored as JSON
  icon VARCHAR(50) NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  image_id INTEGER REFERENCES lwp_media(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service pricing tiers (one-to-many)
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

-- Service features (one-to-many)
CREATE TABLE IF NOT EXISTS lwp_services_features (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_services(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL
);

-- ============================================
-- TESTIMONIALS
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
-- TEAM
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio JSONB, -- Lexical rich text
  short_bio TEXT,
  photo_id INTEGER REFERENCES lwp_media(id),
  email VARCHAR(255),
  phone VARCHAR(50),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FAQS
-- ============================================
CREATE TABLE IF NOT EXISTS lwp_faqs (
  id SERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer JSONB NOT NULL, -- Lexical rich text
  category VARCHAR(50) NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PAGES (Custom page content)
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
  content JSONB, -- Lexical rich text
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Page sections (one-to-many)
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

-- Lead service interests (many-to-many style array)
CREATE TABLE IF NOT EXISTS lwp_leads_service_interest (
  id SERIAL PRIMARY KEY,
  _order INTEGER NOT NULL,
  _parent_id INTEGER NOT NULL REFERENCES lwp_leads(id) ON DELETE CASCADE,
  value VARCHAR(50) NOT NULL
);

-- ============================================
-- PAYLOAD INTERNAL TABLES
-- ============================================

-- Payload preferences (admin UI state)
CREATE TABLE IF NOT EXISTS lwp_payload_preferences (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value JSONB,
  user_id INTEGER REFERENCES lwp_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payload migrations tracking
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
CREATE INDEX IF NOT EXISTS idx_lwp_services_slug ON lwp_services(slug);
CREATE INDEX IF NOT EXISTS idx_lwp_services_featured ON lwp_services(featured);
CREATE INDEX IF NOT EXISTS idx_lwp_testimonials_featured ON lwp_testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_lwp_faqs_category ON lwp_faqs(category);
CREATE INDEX IF NOT EXISTS idx_lwp_pages_slug ON lwp_pages(slug);
CREATE INDEX IF NOT EXISTS idx_lwp_leads_status ON lwp_leads(status);
CREATE INDEX IF NOT EXISTS idx_lwp_leads_created ON lwp_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lwp_users_email ON lwp_users(email);

-- ============================================
-- ROW LEVEL SECURITY (Optional - for Supabase)
-- ============================================
-- Uncomment if you want RLS policies

-- ALTER TABLE lwp_leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE lwp_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- NOTES
-- ============================================
-- 1. Payload CMS will run migrations automatically on first start
-- 2. This SQL is for reference - you don't need to run it manually
-- 3. Payload may create additional columns for localization, versions, etc.
-- 4. The actual column names may use snake_case or camelCase depending on Payload version
-- 5. JSONB columns store Lexical editor rich text content
