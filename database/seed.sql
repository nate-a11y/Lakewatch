-- Lake Watch Pros Seed Data
-- Run this after Payload has created the tables via migrations
-- Or import via Payload Admin UI

-- ============================================
-- SERVICES
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
-- INITIAL ADMIN USER
-- Note: Password should be changed immediately after first login
-- Default: admin@lakewatchpros.com / changeme123
-- ============================================
-- Payload handles password hashing, so you should create the first user
-- via the admin UI at /admin or use the Payload CLI
