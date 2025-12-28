-- Lake Watch Pros Seed Data
-- Run this after migrations have created the portal tables
-- Or import via Payload Admin UI

-- ============================================
-- SERVICES (Website content)
-- ============================================
INSERT INTO lwp_services (name, slug, short_description, icon, featured, "order") VALUES
('Home Watch Inspections', 'home-watch-inspections', 'Regular property inspections to catch issues before they become costly problems.', 'eye', true, 1),
('Pre-Arrival Preparation', 'pre-arrival-preparation', 'Your home is ready and waiting when you arrive—climate set, lights on, everything perfect.', 'home', true, 2),
('Post-Departure Closing', 'post-departure-closing', 'Leave worry-free knowing your home is properly secured and protected.', 'key', false, 3),
('Storm & Weather Checks', 'storm-weather-checks', 'Immediate property assessment after severe weather to identify and address damage.', 'cloud-lightning', true, 4),
('Contractor Coordination', 'contractor-coordination', 'We serve as your on-site representative, meeting contractors and ensuring quality work.', 'users', false, 5),
('Concierge Services', 'concierge-services', 'Personalized services to make your lake stay exceptional.', 'shopping-cart', true, 6),
('Winterization Services', 'winterization-services', 'Comprehensive winterization to protect your property from freeze damage.', 'snowflake', false, 7),
('Summerization Services', 'summerization-services', 'Get your property ready for the active season.', 'sun', false, 8),
('Emergency Response', 'emergency-response', '24/7 emergency response for unexpected situations.', 'alert-triangle', false, 9)
ON CONFLICT (slug) DO NOTHING;

-- Home Watch Pricing Tiers
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, per_visit, monthly_1x, monthly_2x, monthly_4x)
SELECT 0, id, 'Under 2,000 sq ft', '$50', '$45/mo', '$80/mo', '$150/mo' FROM lwp_services WHERE slug = 'home-watch-inspections'
ON CONFLICT DO NOTHING;

INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, per_visit, monthly_1x, monthly_2x, monthly_4x)
SELECT 1, id, '2,000 - 4,000 sq ft', '$65', '$60/mo', '$110/mo', '$200/mo' FROM lwp_services WHERE slug = 'home-watch-inspections'
ON CONFLICT DO NOTHING;

INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, per_visit, monthly_1x, monthly_2x, monthly_4x)
SELECT 2, id, '4,000 - 6,500 sq ft', '$85', '$80/mo', '$150/mo', '$280/mo' FROM lwp_services WHERE slug = 'home-watch-inspections'
ON CONFLICT DO NOTHING;

INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, per_visit, note)
SELECT 3, id, 'Over 6,500 sq ft', '$110+', 'Custom quote required' FROM lwp_services WHERE slug = 'home-watch-inspections'
ON CONFLICT DO NOTHING;

-- Pre-Arrival Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 0, id, 'Standard', '$75 - $150', 'Based on home size' FROM lwp_services WHERE slug = 'pre-arrival-preparation'
ON CONFLICT DO NOTHING;

-- Post-Departure Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 0, id, 'Standard', '$75 - $150', 'Based on home size' FROM lwp_services WHERE slug = 'post-departure-closing'
ON CONFLICT DO NOTHING;

-- Storm Check Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate)
SELECT 0, id, 'Per Check', '$60' FROM lwp_services WHERE slug = 'storm-weather-checks'
ON CONFLICT DO NOTHING;

-- Contractor Coordination Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate)
SELECT 0, id, 'Per Visit', '$40' FROM lwp_services WHERE slug = 'contractor-coordination'
ON CONFLICT DO NOTHING;

-- Concierge Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 0, id, 'Hourly Rate', '$50/hr', '1-hour minimum' FROM lwp_services WHERE slug = 'concierge-services'
ON CONFLICT DO NOTHING;

INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 1, id, 'Grocery Stocking', '$50 + cost', 'Plus cost of goods' FROM lwp_services WHERE slug = 'concierge-services'
ON CONFLICT DO NOTHING;

-- Winterization Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 0, id, 'Standard', '$150 - $300', 'Based on home size' FROM lwp_services WHERE slug = 'winterization-services'
ON CONFLICT DO NOTHING;

-- Summerization Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, flat_rate, note)
SELECT 0, id, 'Standard', '$150 - $300', 'Based on home size' FROM lwp_services WHERE slug = 'summerization-services'
ON CONFLICT DO NOTHING;

-- Emergency Pricing
INSERT INTO lwp_services_pricing_tiers (_order, _parent_id, name, note)
SELECT 0, id, 'Emergency', 'Contact for rates' FROM lwp_services WHERE slug = 'emergency-response'
ON CONFLICT DO NOTHING;

-- ============================================
-- TESTIMONIALS
-- ============================================
INSERT INTO lwp_testimonials (name, quote, location, rating, featured) VALUES
('Sarah M.', 'Lake Watch Pros gives us complete peace of mind. Knowing someone is checking on our property regularly while we''re away is invaluable. They caught a small leak before it became a major problem!', 'Lake Ozark', 5, true),
('Robert & Linda K.', 'The pre-arrival service is fantastic. We arrive to a perfectly prepared home every time—temperature set, lights on, groceries stocked. It feels like coming home to a five-star resort.', 'Osage Beach', 5, true),
('Mike T.', 'After a major storm, they were at our property within hours to check for damage and secure everything. Their quick response prevented thousands in additional damage.', 'Four Seasons', 5, true),
('Jennifer H.', 'The concierge services make our lake trips so much easier. Having groceries ready and restaurant reservations made ahead of time lets us start relaxing the moment we arrive.', 'Sunrise Beach', 5, true),
('David & Carol P.', 'We''ve used Lake Watch Pros for two years now. Their attention to detail and professionalism is unmatched. They treat our property like it''s their own.', 'Camdenton', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEAM
-- ============================================
INSERT INTO lwp_team (name, role, short_bio, "order") VALUES
('Jim Brentlinger', 'Co-Owner', 'Lake of the Ozarks resident with deep roots in the community and a passion for exceptional service.', 1),
('Nate Bulock', 'Co-Owner', 'Dedicated to building lasting relationships with property owners and ensuring their complete satisfaction.', 2),
('Michael Brandt', 'Co-Owner', 'Committed to operational excellence and delivering premium service to every Lake Watch Pros client.', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- FAQS
-- ============================================
INSERT INTO lwp_faqs (question, answer, category, "order") VALUES
-- General
('What is home watch service?', '{"root":{"children":[{"children":[{"text":"Home watch is a professional service that provides regular, thorough inspections of your property while you''re away. We check all aspects of your home—HVAC, plumbing, security, and more—to catch potential issues before they become expensive problems."}],"type":"paragraph"}],"type":"root"}}', 'general', 1),
('How is Lake Watch Pros different from a property manager?', '{"root":{"children":[{"children":[{"text":"While property managers typically focus on rental properties and tenant management, we specialize in watching and maintaining homes that are primarily owner-occupied vacation properties. We''re your eyes and ears at the lake when you can''t be there."}],"type":"paragraph"}],"type":"root"}}', 'general', 2),
('Are you insured and bonded?', '{"root":{"children":[{"children":[{"text":"Yes, Lake Watch Pros is fully insured and bonded. We carry comprehensive liability insurance to protect your property and give you complete peace of mind."}],"type":"paragraph"}],"type":"root"}}', 'general', 3),
('How do I get started with your services?', '{"root":{"children":[{"children":[{"text":"Simply contact us to schedule a free consultation. We''ll visit your property, discuss your needs, and create a customized service plan. There''s no obligation—just honest advice from local experts."}],"type":"paragraph"}],"type":"root"}}', 'general', 4),

-- Home Watch
('What does a home watch inspection include?', '{"root":{"children":[{"children":[{"text":"Our comprehensive inspection covers interior and exterior visual checks, HVAC operation, plumbing for leaks, electrical systems, security system verification, appliance testing, pest inspection, and more. You''ll receive a detailed report with photos after every visit."}],"type":"paragraph"}],"type":"root"}}', 'home-watch', 1),
('How often should I have my home inspected?', '{"root":{"children":[{"children":[{"text":"We recommend at least bi-weekly inspections for most properties. However, the ideal frequency depends on factors like your home''s age, systems, and how long you''re away. We can help determine the best schedule for your situation."}],"type":"paragraph"}],"type":"root"}}', 'home-watch', 2),
('What happens if you find a problem during an inspection?', '{"root":{"children":[{"children":[{"text":"We immediately notify you of any issues found. For urgent problems like water leaks or HVAC failures, we can coordinate emergency repairs with trusted local contractors. We''ll document everything and keep you informed throughout the process."}],"type":"paragraph"}],"type":"root"}}', 'home-watch', 3),

-- Pricing
('How is home watch pricing determined?', '{"root":{"children":[{"children":[{"text":"Our home watch pricing is based on your property''s square footage and how frequently you want inspections. We offer per-visit rates and monthly subscription plans. The more frequent the visits, the lower the per-visit cost."}],"type":"paragraph"}],"type":"root"}}', 'pricing', 1),
('Are there any hidden fees?', '{"root":{"children":[{"children":[{"text":"No hidden fees, ever. Our pricing is transparent and straightforward. The only additional costs would be if you request extra services beyond your regular plan, and we''ll always get your approval before any additional charges."}],"type":"paragraph"}],"type":"root"}}', 'pricing', 2),

-- Concierge
('What concierge services do you offer?', '{"root":{"children":[{"children":[{"text":"Our concierge services include grocery shopping and stocking, restaurant reservations, event tickets, boat rental arrangements, golf tee times, spa appointments, transportation coordination, and custom requests. If it makes your lake visit better, we can probably help."}],"type":"paragraph"}],"type":"root"}}', 'concierge', 1),

-- Insurance
('Does having home watch service affect my insurance?', '{"root":{"children":[{"children":[{"text":"Many insurance companies look favorably on homes with professional home watch services. Regular inspections can help demonstrate due diligence in property maintenance. Some insurers may even offer premium discounts. Check with your insurance provider about potential benefits."}],"type":"paragraph"}],"type":"root"}}', 'insurance', 1),

-- Service Area
('What areas do you serve?', '{"root":{"children":[{"children":[{"text":"We serve properties throughout the Lake of the Ozarks region, including Lake Ozark, Osage Beach, Village of Four Seasons, Sunrise Beach, Camdenton, Laurie, and surrounding communities. If you''re not sure if we cover your area, just ask!"}],"type":"paragraph"}],"type":"root"}}', 'service-area', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- PORTAL USERS (Different roles for testing)
-- ============================================
-- Note: After creating users in Supabase Auth, update supabase_id column
-- Password for testing: Set in Supabase Auth dashboard

INSERT INTO lwp_users (email, first_name, last_name, phone, role, created_at, updated_at) VALUES
-- Owner (full access)
('owner@lakewatchpros.com', 'Nathan', 'Owner', '(573) 555-0001', 'owner', NOW(), NOW()),

-- Admin users
('admin@lakewatchpros.com', 'Sarah', 'Admin', '(573) 555-0002', 'admin', NOW(), NOW()),

-- Technicians
('mike.tech@lakewatchpros.com', 'Mike', 'Thompson', '(573) 555-0010', 'technician', NOW(), NOW()),
('lisa.tech@lakewatchpros.com', 'Lisa', 'Martinez', '(573) 555-0011', 'technician', NOW(), NOW()),

-- Customers
('john.customer@example.com', 'John', 'Smith', '(314) 555-1001', 'customer', NOW(), NOW()),
('jane.customer@example.com', 'Jane', 'Doe', '(816) 555-1002', 'customer', NOW(), NOW()),
('bob.customer@example.com', 'Bob', 'Wilson', '(417) 555-1003', 'customer', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- ============================================
-- SERVICE PLANS (Portal subscriptions)
-- ============================================
INSERT INTO lwp_service_plans (name, slug, description, inspection_frequency, base_price, price_per_sqft, features, is_active, created_at, updated_at) VALUES
('Basic Watch', 'basic-watch', 'Essential property monitoring for peace of mind', 'monthly', 99.00, 0.02,
 '["Monthly exterior inspection", "Photo documentation", "Email reports", "Emergency contact service"]',
 TRUE, NOW(), NOW()),

('Standard Watch', 'standard-watch', 'Comprehensive bi-weekly property care', 'biweekly', 199.00, 0.03,
 '["Bi-weekly interior & exterior inspection", "Full checklist inspection", "Photo & video documentation", "Priority scheduling", "Storm response checks"]',
 TRUE, NOW(), NOW()),

('Premium Watch', 'premium-watch', 'Complete property management with concierge services', 'weekly', 349.00, 0.04,
 '["Weekly full property inspection", "Concierge services included", "Pre-arrival preparation", "Grocery stocking available", "24/7 emergency response", "Dedicated property manager"]',
 TRUE, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price;

-- ============================================
-- PROPERTIES (Customer properties)
-- ============================================
-- Note: User IDs depend on insert order. Adjust if needed.
-- Assuming: owner=1, admin=2, mike=3, lisa=4, john=5, jane=6, bob=7

-- John Smith's properties (user id 5)
INSERT INTO lwp_properties (name, owner_id, service_plan_id, status, property_type, street, city, state, zip, square_footage, year_built, bedrooms, bathrooms, gate_code, lockbox_code, alarm_code, alarm_company, wifi_network, special_instructions, latitude, longitude, created_at, updated_at) VALUES
('Lake House', 5, 3, 'active', 'house', '123 Lakefront Dr', 'Lake Ozark', 'MO', '65049', 3500, 2015, 4, 3.5, '1234', '5678', '0000', 'ADT Security', 'LakeHouse_5G', 'Please check the dock area for any storm damage. Boat should be covered.', 38.1156, -92.6446, NOW(), NOW()),
('Guest Cabin', 5, 2, 'active', 'cabin', '125 Lakefront Dr', 'Lake Ozark', 'MO', '65049', 1200, 2018, 2, 1.0, '1234', '9012', NULL, NULL, 'Cabin_Guest', 'Key is in lockbox on back porch. No alarm system.', 38.1158, -92.6448, NOW(), NOW());

-- Jane Doe's property (user id 6)
INSERT INTO lwp_properties (name, owner_id, service_plan_id, status, property_type, street, city, state, zip, square_footage, year_built, bedrooms, bathrooms, gate_code, lockbox_code, alarm_code, alarm_company, wifi_network, special_instructions, latitude, longitude, created_at, updated_at) VALUES
('Sunset Cove Retreat', 6, 3, 'active', 'house', '456 Sunset Cove Rd', 'Osage Beach', 'MO', '65065', 4200, 2020, 5, 4.0, '4567', '1111', '1234', 'Ring Alarm', 'SunsetCove_Main', 'Has smart home system - thermostat and lights can be controlled via app. Please water plants in sunroom.', 38.1289, -92.6234, NOW(), NOW());

-- Bob Wilson's property (user id 7)
INSERT INTO lwp_properties (name, owner_id, service_plan_id, status, property_type, street, city, state, zip, square_footage, year_built, bedrooms, bathrooms, gate_code, lockbox_code, alarm_code, alarm_company, wifi_network, special_instructions, latitude, longitude, created_at, updated_at) VALUES
('Woodland Hideaway', 7, 1, 'active', 'cabin', '789 Timber Ridge Ln', 'Camdenton', 'MO', '65020', 1800, 2010, 3, 2.0, NULL, '3333', NULL, NULL, 'Woodland_WiFi', 'Propane tank is behind the cabin. Check level during winter visits.', 38.0089, -92.7456, NOW(), NOW());

-- ============================================
-- PROPERTY CONTACTS
-- ============================================
INSERT INTO lwp_properties_contacts (_order, _parent_id, name, phone, relationship) VALUES
(0, 1, 'Tom Johnson (Neighbor)', '(573) 555-8001', 'neighbor'),
(1, 1, 'Bob''s HVAC Service', '(573) 555-8002', 'contractor'),
(2, 1, 'Lake Electric Co', '(573) 555-8003', 'contractor'),
(0, 2, 'Tom Johnson (Same neighbor)', '(573) 555-8001', 'neighbor'),
(0, 3, 'Maria Garcia (Property Manager)', '(573) 555-8010', 'property_manager'),
(1, 3, 'Osage Beach Plumbing', '(573) 555-8011', 'contractor'),
(0, 4, 'Dave Wilson (Brother)', '(417) 555-9001', 'family');

-- ============================================
-- PROPERTY UTILITIES
-- ============================================
INSERT INTO lwp_properties_utilities (_order, _parent_id, utility_type, provider, account_number, phone) VALUES
(0, 1, 'electric', 'Ameren Missouri', 'AMR-12345678', '(800) 552-7583'),
(1, 1, 'propane', 'Lake Propane Co', 'LP-5678', '(573) 555-1234'),
(2, 1, 'internet', 'Spectrum', 'SPEC-9012', '(855) 707-7328'),
(3, 1, 'water', 'Lake Ozark Water District', 'LOWD-3456', '(573) 555-4567'),
(0, 2, 'electric', 'Ameren Missouri', 'AMR-12345679', '(800) 552-7583'),
(0, 3, 'electric', 'Ameren Missouri', 'AMR-98765432', '(800) 552-7583'),
(1, 3, 'gas', 'Spire Energy', 'SPIRE-4321', '(800) 887-4173'),
(2, 3, 'internet', 'Spectrum', 'SPEC-8765', '(855) 707-7328'),
(0, 4, 'electric', 'Ameren Missouri', 'AMR-55667788', '(800) 552-7583'),
(1, 4, 'propane', 'Camdenton Propane', 'CP-1122', '(573) 555-2233');

-- ============================================
-- CHECKLISTS (Inspection templates)
-- ============================================
INSERT INTO lwp_checklists (name, description, property_type, is_default, created_at, updated_at) VALUES
('Standard Home Inspection', 'Comprehensive checklist for residential properties', NULL, TRUE, NOW(), NOW()),
('Winter Checklist', 'Cold weather specific items to check', NULL, FALSE, NOW(), NOW()),
('Storm Damage Assessment', 'Post-storm inspection checklist', NULL, FALSE, NOW(), NOW());

-- Standard checklist items
INSERT INTO lwp_checklists_items (_order, _parent_id, category, item, description, required) VALUES
-- Exterior
(0, 1, 'Exterior', 'Check exterior doors and locks', 'Ensure all doors close and lock properly', TRUE),
(1, 1, 'Exterior', 'Inspect windows for damage', 'Look for cracks, broken seals, or damage', TRUE),
(2, 1, 'Exterior', 'Check for signs of pests', 'Look for droppings, nests, or damage', TRUE),
(3, 1, 'Exterior', 'Inspect roof from ground', 'Check for missing shingles or damage', TRUE),
(4, 1, 'Exterior', 'Check gutters and downspouts', 'Ensure clear and properly attached', TRUE),
(5, 1, 'Exterior', 'Inspect deck/patio', 'Check for damage or safety issues', TRUE),
-- HVAC
(6, 1, 'HVAC', 'Check thermostat settings', 'Verify proper temperature setting', TRUE),
(7, 1, 'HVAC', 'Verify HVAC operation', 'Listen for proper operation', TRUE),
(8, 1, 'HVAC', 'Check air filters', 'Note condition and replace if needed', TRUE),
(9, 1, 'HVAC', 'Listen for unusual sounds', 'Any grinding, squealing, or banging', TRUE),
-- Plumbing
(10, 1, 'Plumbing', 'Check under sinks for leaks', 'All bathrooms and kitchen', TRUE),
(11, 1, 'Plumbing', 'Flush all toilets', 'Ensure proper operation', TRUE),
(12, 1, 'Plumbing', 'Run water in faucets', 'Check for proper flow and drainage', TRUE),
(13, 1, 'Plumbing', 'Check water heater', 'Look for leaks, check temp setting', TRUE),
(14, 1, 'Plumbing', 'Inspect washing machine', 'Check hoses and connections', FALSE),
-- Electrical
(15, 1, 'Electrical', 'Test smoke detectors', 'Press test button on each', TRUE),
(16, 1, 'Electrical', 'Test CO detectors', 'Press test button', TRUE),
(17, 1, 'Electrical', 'Check GFI outlets', 'Test and reset', TRUE),
(18, 1, 'Electrical', 'Verify lights working', 'Check key lights throughout', TRUE),
-- Security
(19, 1, 'Security', 'Verify alarm system', 'Check status panel', TRUE),
(20, 1, 'Security', 'Check all door locks', 'Test each lock', TRUE),
(21, 1, 'Security', 'Inspect garage door', 'Test operation', TRUE);

-- Winter checklist items
INSERT INTO lwp_checklists_items (_order, _parent_id, category, item, description, required) VALUES
(0, 2, 'Heating', 'Verify heat is on', 'Check thermostat is set to heat mode', TRUE),
(1, 2, 'Heating', 'Check for frozen pipes', 'Inspect exposed pipes in basement/crawl', TRUE),
(2, 2, 'Heating', 'Verify propane level', 'Check tank gauge if applicable', TRUE),
(3, 2, 'Exterior', 'Check for ice dams', 'Inspect roof edges and gutters', TRUE),
(4, 2, 'Exterior', 'Clear snow from entries', 'Shovel paths if needed', FALSE);

-- ============================================
-- INSPECTIONS (Past and scheduled)
-- ============================================
-- Completed inspections for Lake House
INSERT INTO lwp_inspections (property_id, technician_id, checklist_id, scheduled_date, scheduled_time, status, check_in_time, check_out_time, weather_temp, weather_conditions, overall_status, summary, created_at, updated_at) VALUES
(1, 3, 1, '2025-12-20', '09:00:00', 'completed', '2025-12-20 09:15:00', '2025-12-20 10:32:00', 42, 'Partly Cloudy', 'all_clear', 'Completed standard bi-weekly inspection. All systems functioning properly. No issues found.', NOW(), NOW()),
(1, 3, 1, '2025-12-06', '10:00:00', 'completed', '2025-12-06 10:05:00', '2025-12-06 11:20:00', 38, 'Cloudy', 'all_clear', 'Regular inspection complete. Property secure and well-maintained.', NOW(), NOW()),
(1, 4, 1, '2025-11-22', '09:30:00', 'completed', '2025-11-22 09:35:00', '2025-11-22 10:50:00', 45, 'Sunny', 'issues_found', 'Found minor issue with water heater pilot light. Relit successfully but recommend service check.', NOW(), NOW());

-- Scheduled upcoming inspections
INSERT INTO lwp_inspections (property_id, technician_id, checklist_id, scheduled_date, scheduled_time, status, created_at, updated_at) VALUES
(1, 3, 1, '2026-01-03', '09:00:00', 'scheduled', NOW(), NOW()),
(2, 4, 1, '2026-01-03', '11:00:00', 'scheduled', NOW(), NOW()),
(3, 3, 1, '2026-01-05', '10:00:00', 'scheduled', NOW(), NOW()),
(4, 4, 1, '2026-01-15', '14:00:00', 'scheduled', NOW(), NOW());

-- ============================================
-- INSPECTION RESPONSES (for completed inspection)
-- ============================================
INSERT INTO lwp_inspections_responses (_order, _parent_id, category, item, response, notes) VALUES
-- Inspection 1 (Dec 20) - all pass
(0, 1, 'Exterior', 'Check exterior doors and locks', 'pass', NULL),
(1, 1, 'Exterior', 'Inspect windows for damage', 'pass', NULL),
(2, 1, 'Exterior', 'Check for signs of pests', 'pass', NULL),
(3, 1, 'HVAC', 'Check thermostat settings', 'pass', 'Set to 55°F'),
(4, 1, 'HVAC', 'Verify HVAC operation', 'pass', NULL),
(5, 1, 'HVAC', 'Check air filters', 'pass', 'Filters clean'),
(6, 1, 'Plumbing', 'Check under sinks for leaks', 'pass', NULL),
(7, 1, 'Plumbing', 'Flush all toilets', 'pass', NULL),
(8, 1, 'Plumbing', 'Check water heater', 'pass', 'Operating normally'),
(9, 1, 'Security', 'Verify alarm system', 'pass', 'Armed and functioning');

-- ============================================
-- INSPECTION ISSUES (for inspection with issues)
-- ============================================
INSERT INTO lwp_inspections_issues (_order, _parent_id, title, description, severity, category, resolution_status, resolution_notes) VALUES
(0, 3, 'Water heater pilot light out', 'Found pilot light was out on water heater. Relit successfully but this is the second occurrence in 3 months.', 'medium', 'Plumbing', 'resolved', 'Scheduled HVAC tech visit for Dec 18. Thermocouple replaced.');

-- ============================================
-- SERVICE REQUESTS
-- ============================================
INSERT INTO lwp_service_requests (property_id, requested_by_id, assigned_to_id, request_type, title, description, priority, status, preferred_date, scheduled_date, scheduled_time, created_at, updated_at) VALUES
(1, 5, 3, 'pre_arrival', 'Pre-arrival preparation for January visit', 'Will be arriving January 10th for a long weekend. Please ensure heat is up, water running, and general readiness.', 'normal', 'scheduled', '2026-01-10', '2026-01-09', '14:00:00', NOW(), NOW()),
(1, 5, NULL, 'grocery_stocking', 'Grocery stocking for arrival', 'Please stock fridge with basics: milk, eggs, bread, butter, coffee. Will send detailed list.', 'normal', 'pending', '2026-01-10', NULL, NULL, NOW(), NOW()),
(3, 6, 4, 'maintenance', 'Hot tub cover replacement', 'Hot tub cover is cracking and needs replacement before spring. Please get quotes.', 'low', 'in_progress', NULL, NULL, NULL, NOW(), NOW());

-- ============================================
-- OCCUPANCY CALENDAR
-- ============================================
INSERT INTO lwp_occupancy_calendar (property_id, event_type, title, start_date, end_date, guest_count, notes, created_by_id, created_at, updated_at) VALUES
(1, 'owner_visit', 'January Long Weekend', '2026-01-10', '2026-01-13', 4, 'Family visit - need pre-arrival prep', 5, NOW(), NOW()),
(1, 'rental', 'Rental - Smith Family', '2026-02-14', '2026-02-17', 6, 'Valentine''s weekend rental', 5, NOW(), NOW()),
(3, 'owner_visit', 'Spring Break', '2026-03-15', '2026-03-22', 5, 'Extended family visit', 6, NOW(), NOW()),
(4, 'maintenance', 'HVAC Service', '2026-01-20', '2026-01-20', 0, 'Annual HVAC maintenance scheduled', 7, NOW(), NOW());

-- ============================================
-- INVOICES
-- ============================================
INSERT INTO lwp_invoices (invoice_number, customer_id, property_id, status, issue_date, due_date, paid_date, subtotal, tax, total, notes, created_at, updated_at) VALUES
('INV-2025-001', 5, 1, 'paid', '2025-12-01', '2025-12-15', '2025-12-10', 349.00, 0, 349.00, 'December 2025 - Premium Watch Service', NOW(), NOW()),
('INV-2025-002', 5, 2, 'paid', '2025-12-01', '2025-12-15', '2025-12-10', 199.00, 0, 199.00, 'December 2025 - Standard Watch Service', NOW(), NOW()),
('INV-2026-001', 5, 1, 'pending', '2026-01-01', '2026-01-15', NULL, 349.00, 0, 349.00, 'January 2026 - Premium Watch Service', NOW(), NOW()),
('INV-2026-002', 5, 2, 'pending', '2026-01-01', '2026-01-15', NULL, 199.00, 0, 199.00, 'January 2026 - Standard Watch Service', NOW(), NOW()),
('INV-2025-003', 6, 3, 'paid', '2025-12-01', '2025-12-15', '2025-12-08', 349.00, 0, 349.00, 'December 2025 - Premium Watch Service', NOW(), NOW()),
('INV-2025-004', 7, 4, 'paid', '2025-12-01', '2025-12-15', '2025-12-14', 99.00, 0, 99.00, 'December 2025 - Basic Watch Service', NOW(), NOW());

INSERT INTO lwp_invoices_line_items (_order, _parent_id, description, quantity, unit_price, amount) VALUES
(0, 1, 'Premium Watch Service - Lake House (3,500 sq ft)', 1, 349.00, 349.00),
(0, 2, 'Standard Watch Service - Guest Cabin (1,200 sq ft)', 1, 199.00, 199.00),
(0, 3, 'Premium Watch Service - Lake House (3,500 sq ft)', 1, 349.00, 349.00),
(0, 4, 'Standard Watch Service - Guest Cabin (1,200 sq ft)', 1, 199.00, 199.00),
(0, 5, 'Premium Watch Service - Sunset Cove Retreat (4,200 sq ft)', 1, 349.00, 349.00),
(0, 6, 'Basic Watch Service - Woodland Hideaway (1,800 sq ft)', 1, 99.00, 99.00);

-- ============================================
-- CONVERSATIONS & MESSAGES
-- ============================================
INSERT INTO lwp_conversations (subject, property_id, customer_id, status, last_message_at, unread_by_customer, unread_by_staff, created_at, updated_at) VALUES
('Lake House - Water heater question', 1, 5, 'open', '2025-12-20 14:30:00', FALSE, FALSE, NOW(), NOW()),
('Scheduling for January', NULL, 5, 'open', '2025-12-22 10:15:00', TRUE, FALSE, NOW(), NOW()),
('Hot tub cover quotes', 3, 6, 'open', '2025-12-18 16:00:00', FALSE, TRUE, NOW(), NOW());

INSERT INTO lwp_messages (conversation_id, sender_id, content, is_internal, read_at, created_at) VALUES
-- Conversation 1: Water heater
(1, 5, 'Hi, I saw in the inspection report that the water heater pilot light went out again. Should I be concerned?', FALSE, '2025-12-18 09:00:00', '2025-12-18 08:45:00'),
(1, 2, 'Hi John! Yes, we noticed that too. We''ve scheduled our HVAC tech to come out and take a look. It''s likely just the thermocouple needs replacing - a simple fix.', FALSE, '2025-12-18 10:00:00', '2025-12-18 09:30:00'),
(1, 5, 'That''s great, thank you for being proactive about it!', FALSE, '2025-12-18 11:00:00', '2025-12-18 10:15:00'),
(1, 2, 'Update: The tech came out today and replaced the thermocouple. Everything is working properly now. The water heater has been serviced and is working properly now.', FALSE, '2025-12-20 15:00:00', '2025-12-20 14:30:00'),

-- Conversation 2: January scheduling
(2, 5, 'We''re planning to come down for a long weekend January 10-13. Can you do a pre-arrival visit?', FALSE, '2025-12-21 14:00:00', '2025-12-21 13:45:00'),
(2, 2, 'Absolutely! We can accommodate your request for a pre-arrival visit on January 10th. I''ll schedule Mike to come by January 9th to get everything ready.', FALSE, NULL, '2025-12-22 10:15:00'),

-- Conversation 3: Hot tub cover
(3, 6, 'The hot tub cover at Sunset Cove is really deteriorating. Can you get some quotes for a replacement?', FALSE, '2025-12-18 16:30:00', '2025-12-18 16:00:00');

-- ============================================
-- NOTIFICATIONS
-- ============================================
INSERT INTO lwp_notifications (user_id, notification_type, title, message, link, read_at, sent_email, sent_sms, created_at) VALUES
(5, 'inspection_complete', 'Inspection Complete - Lake House', 'Your bi-weekly inspection at Lake House has been completed. All clear!', '/portal/reports/1', '2025-12-20 16:00:00', TRUE, FALSE, '2025-12-20 11:00:00'),
(5, 'inspection_scheduled', 'Upcoming Inspection - Lake House', 'Your next inspection at Lake House is scheduled for January 3, 2026', '/portal/calendar', NULL, TRUE, FALSE, '2025-12-27 09:00:00'),
(5, 'message', 'New Message', 'Sarah from Lake Watch Pros sent you a message', '/portal/messages/2', NULL, TRUE, FALSE, '2025-12-22 10:15:00'),
(6, 'request_update', 'Service Request Update', 'Your hot tub cover replacement request is now in progress', '/portal/requests/3', NULL, TRUE, FALSE, '2025-12-19 14:00:00'),
(5, 'invoice', 'New Invoice Available', 'Your January 2026 invoice is now available', '/portal/billing', NULL, TRUE, FALSE, '2026-01-01 08:00:00');

-- ============================================
-- TEST USER REFERENCE
-- ============================================
--
-- Create these users in Supabase Auth, then link them:
--
-- UPDATE lwp_users SET supabase_id = '<uuid>' WHERE email = '<email>';
--
-- ┌──────────────────────────────────┬─────────────┬──────────────────────────────────┐
-- │ Email                            │ Role        │ Test Data                        │
-- ├──────────────────────────────────┼─────────────┼──────────────────────────────────┤
-- │ owner@lakewatchpros.com          │ owner       │ Full access to everything        │
-- │ admin@lakewatchpros.com          │ admin       │ Manage customers, schedule       │
-- │ mike.tech@lakewatchpros.com      │ technician  │ Assigned inspections             │
-- │ lisa.tech@lakewatchpros.com      │ technician  │ Assigned inspections             │
-- │ john.customer@example.com        │ customer    │ 2 properties, invoices, messages │
-- │ jane.customer@example.com        │ customer    │ 1 property, service request      │
-- │ bob.customer@example.com         │ customer    │ 1 property                       │
-- └──────────────────────────────────┴─────────────┴──────────────────────────────────┘
--
-- Customer john.customer@example.com has:
-- - 2 properties (Lake House, Guest Cabin)
-- - 3 completed inspections
-- - 2 upcoming inspections
-- - 2 service requests
-- - 4 invoices (2 paid, 2 pending)
-- - 2 message threads
-- - 5 notifications
--
