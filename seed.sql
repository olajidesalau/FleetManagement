-- Snow Fleet Management Seed Data
-- Sample data for testing and demonstration

-- ============================================
-- 1. USERS
-- ============================================
-- Note: In production, passwords should be hashed with bcrypt
-- These are placeholder hashed values

-- Admin user
INSERT OR IGNORE INTO users (id, email, password, full_name, phone, role, status, email_verified, created_at) VALUES 
(1, 'admin@snowfleetmanagement.uk', 'hashed_admin_password_123', 'Platform Administrator', '+447700900001', 'admin', 'active', 1, datetime('now'));

-- Service Providers
INSERT OR IGNORE INTO users (id, email, password, full_name, phone, role, status, email_verified, created_at) VALUES 
(2, 'sarah.cleaner@email.uk', 'hashed_password_123', 'Sarah Johnson', '+447700900002', 'provider', 'active', 1, datetime('now', '-6 months')),
(3, 'james.plumber@email.uk', 'hashed_password_123', 'James Wilson', '+447700900003', 'provider', 'active', 1, datetime('now', '-4 months')),
(4, 'emma.tutor@email.uk', 'hashed_password_123', 'Emma Thompson', '+447700900004', 'provider', 'active', 1, datetime('now', '-3 months')),
(5, 'michael.dev@email.uk', 'hashed_password_123', 'Michael Chen', '+447700900005', 'provider', 'active', 1, datetime('now', '-2 months'));

-- Customers
INSERT OR IGNORE INTO users (id, email, password, full_name, phone, role, status, email_verified, created_at) VALUES 
(6, 'john.smith@email.uk', 'hashed_password_123', 'John Smith', '+447700900006', 'customer', 'active', 1, datetime('now', '-5 months')),
(7, 'mary.jones@email.uk', 'hashed_password_123', 'Mary Jones', '+447700900007', 'customer', 'active', 1, datetime('now', '-4 months')),
(8, 'david.brown@email.uk', 'hashed_password_123', 'David Brown', '+447700900008', 'customer', 'active', 1, datetime('now', '-3 months')),
(9, 'lisa.taylor@email.uk', 'hashed_password_123', 'Lisa Taylor', '+447700900009', 'customer', 'active', 1, datetime('now', '-2 months'));

-- ============================================
-- 2. PROVIDER PROFILES
-- ============================================

INSERT OR IGNORE INTO provider_profiles (
  id, user_id, business_name, bio, experience_years, hourly_rate, 
  service_areas, services_offered, dbs_verified, insurance_verified,
  approval_status, approval_date, approved_by, average_rating, 
  total_reviews, total_bookings, completed_bookings
) VALUES 
(1, 2, 'Sparkle Clean Services', 'Professional cleaning services with 8 years experience. Specializing in domestic and commercial cleaning across London.', 8, 25.00, 
 '["SW1A", "SW1P", "W1A", "W1B", "WC2N", "SE1", "E1"]', 
 '["cleaning", "deep_cleaning", "carpet_cleaning", "window_cleaning"]', 
 1, 1, 'approved', datetime('now', '-5 months'), 1, 4.8, 24, 67, 63),

(2, 3, 'QuickFix Plumbing', 'Certified plumber with 12 years experience. Emergency callouts available. All work guaranteed.', 12, 45.00,
 '["N1", "N7", "N19", "NW1", "NW3", "NW5"]',
 '["plumbing"]',
 1, 1, 'approved', datetime('now', '-3 months'), 1, 4.9, 31, 89, 85),

(3, 4, 'Learn & Grow Tutoring', 'Qualified teacher offering maths and science tutoring for GCSE and A-Level students.', 5, 35.00,
 '["SW19", "SW20", "CR0", "CR4", "KT3"]',
 '["tutoring"]',
 1, 1, 'approved', datetime('now', '-2 months'), 1, 5.0, 18, 45, 45),

(4, 5, 'CodeCraft Solutions', 'Full-stack web developer with 6 years experience. Specializing in modern web applications and e-commerce sites.', 6, 60.00,
 '["EC1", "EC2", "EC3", "E1", "E2", "E14"]',
 '["web_development", "it_support", "graphic_design"]',
 0, 1, 'approved', datetime('now', '-1 month'), 1, 4.7, 12, 28, 26);

-- ============================================
-- 3. SERVICES
-- ============================================

-- Sarah's Cleaning Services
INSERT OR IGNORE INTO services (provider_id, service_name, service_type, description, price, duration_minutes, is_active) VALUES 
(1, 'Regular Home Cleaning', 'cleaning', '2-bedroom flat: dusting, vacuuming, mopping, bathroom & kitchen cleaning', 75.00, 120, 1),
(1, 'Deep Cleaning Service', 'deep_cleaning', 'Comprehensive deep clean including inside appliances, skirting boards, detailed bathroom clean', 150.00, 240, 1),
(1, 'Carpet Steam Cleaning', 'carpet_cleaning', 'Professional steam cleaning for carpets and upholstery', 90.00, 90, 1),
(1, 'Window Cleaning', 'window_cleaning', 'Interior and exterior window cleaning for homes', 60.00, 90, 1);

-- James's Plumbing Services
INSERT OR IGNORE INTO services (provider_id, service_name, service_type, description, price, duration_minutes, is_active) VALUES 
(2, 'Emergency Plumbing Repair', 'plumbing', 'Quick response for leaks, burst pipes, and emergency repairs', 120.00, 60, 1),
(2, 'Bathroom Installation', 'plumbing', 'Full bathroom suite installation including toilets, sinks, and showers', 800.00, 480, 1),
(2, 'Boiler Service', 'plumbing', 'Annual boiler service and safety check', 95.00, 90, 1);

-- Emma's Tutoring Services
INSERT OR IGNORE INTO services (provider_id, service_name, service_type, description, price, duration_minutes, is_active) VALUES 
(3, 'GCSE Maths Tutoring', 'tutoring', 'One-to-one GCSE maths tutoring covering all exam boards', 35.00, 60, 1),
(3, 'A-Level Chemistry Tutoring', 'tutoring', 'A-Level chemistry tutoring with exam preparation', 40.00, 60, 1),
(3, 'Primary School Support', 'tutoring', 'General support for primary school students in maths and English', 30.00, 60, 1);

-- Michael's Development Services
INSERT OR IGNORE INTO services (provider_id, service_name, service_type, description, price, duration_minutes, is_active) VALUES 
(4, 'Website Development', 'web_development', 'Custom website development using modern frameworks', 500.00, 480, 1),
(4, 'IT Support & Maintenance', 'it_support', 'Computer repairs, software installation, and technical support', 60.00, 60, 1),
(4, 'Logo Design', 'graphic_design', 'Professional logo design with unlimited revisions', 200.00, 180, 1);

-- ============================================
-- 4. BOOKINGS
-- ============================================

INSERT OR IGNORE INTO bookings (
  id, customer_id, provider_id, service_id, booking_reference,
  booking_date, booking_time, duration_minutes, service_address, postcode,
  special_instructions, status, service_price, platform_fee, provider_payout, total_amount
) VALUES 
-- Completed bookings
(1, 6, 1, 1, 'SNOW-2024-001', date('now', '+2 days'), '10:00', 120, '123 Baker Street, London', 'SW1A 1AA', 
 'Please ring doorbell twice', 'completed', 75.00, 11.25, 63.75, 75.00),

(2, 7, 2, 5, 'SNOW-2024-002', date('now', '+3 days'), '14:00', 60, '456 Oxford Street, London', 'W1A 1AB',
 'Emergency - kitchen sink leaking', 'completed', 120.00, 18.00, 102.00, 120.00),

(3, 8, 3, 8, 'SNOW-2024-003', date('now', '+5 days'), '16:00', 60, '789 High Street, Wimbledon', 'SW19 1AA',
 'Preparing for GCSE mocks', 'completed', 35.00, 5.25, 29.75, 35.00),

-- Confirmed upcoming bookings
(4, 6, 1, 2, 'SNOW-2024-004', date('now', '+7 days'), '09:00', 240, '123 Baker Street, London', 'SW1A 1AA',
 'Keys will be left with neighbour at number 125', 'confirmed', 150.00, 22.50, 127.50, 150.00),

(5, 9, 4, 11, 'SNOW-2024-005', date('now', '+8 days'), '10:00', 480, '321 Tech Hub, Shoreditch', 'E1 6AN',
 'Need e-commerce site with payment integration', 'confirmed', 500.00, 75.00, 425.00, 500.00),

-- Pending bookings
(6, 7, 3, 9, 'SNOW-2024-006', date('now', '+10 days'), '17:00', 60, '456 Oxford Street, London', 'W1A 1AB',
 'Focus on organic chemistry', 'pending', 40.00, 6.00, 34.00, 40.00),

-- Cancelled booking
(7, 8, 1, 3, 'SNOW-2024-007', date('now', '+4 days'), '13:00', 90, '789 High Street, Wimbledon', 'SW19 1AA',
 NULL, 'cancelled', 90.00, 13.50, 76.50, 90.00);

UPDATE bookings SET cancelled_by = 8, cancelled_at = datetime('now', '-1 day'), 
cancellation_reason = 'Change of plans - need to reschedule', refund_status = 'processed', 
refund_amount = 90.00 WHERE id = 7;

-- Set completed dates for completed bookings
UPDATE bookings SET completed_at = datetime('now', '-10 days') WHERE id = 1;
UPDATE bookings SET completed_at = datetime('now', '-8 days') WHERE id = 2;
UPDATE bookings SET completed_at = datetime('now', '-5 days') WHERE id = 3;

-- ============================================
-- 5. PAYMENTS
-- ============================================

INSERT OR IGNORE INTO payments (
  booking_id, payment_reference, amount, platform_fee, provider_payout,
  payment_method, payment_status, payment_provider, payment_provider_id, paid_at,
  payout_status, payout_date
) VALUES 
(1, 'PAY-SNOW-2024-001', 75.00, 11.25, 63.75, 'card', 'completed', 'stripe', 'pi_1234567890', datetime('now', '-10 days'), 'completed', datetime('now', '-8 days')),
(2, 'PAY-SNOW-2024-002', 120.00, 18.00, 102.00, 'card', 'completed', 'stripe', 'pi_1234567891', datetime('now', '-8 days'), 'completed', datetime('now', '-6 days')),
(3, 'PAY-SNOW-2024-003', 35.00, 5.25, 29.75, 'card', 'completed', 'stripe', 'pi_1234567892', datetime('now', '-5 days'), 'completed', datetime('now', '-3 days')),
(4, 'PAY-SNOW-2024-004', 150.00, 22.50, 127.50, 'card', 'completed', 'stripe', 'pi_1234567893', datetime('now', '-2 days'), 'pending', NULL),
(5, 'PAY-SNOW-2024-005', 500.00, 75.00, 425.00, 'card', 'completed', 'stripe', 'pi_1234567894', datetime('now', '-1 day'), 'pending', NULL),
(6, 'PAY-SNOW-2024-006', 40.00, 6.00, 34.00, 'card', 'pending', NULL, NULL, NULL, 'pending', NULL);

-- Refunded payment for cancelled booking
INSERT OR IGNORE INTO payments (
  booking_id, payment_reference, amount, platform_fee, provider_payout,
  payment_method, payment_status, payment_provider, payment_provider_id, paid_at,
  payout_status, refund_amount, refund_status, refund_processed_at, refund_provider_id
) VALUES 
(7, 'PAY-SNOW-2024-007', 90.00, 13.50, 76.50, 'card', 'refunded', 'stripe', 'pi_1234567895', 
 datetime('now', '-2 days'), 'on_hold', 90.00, 'processed', datetime('now', '-1 day'), 're_1234567895');

-- ============================================
-- 6. REVIEWS
-- ============================================

INSERT OR IGNORE INTO reviews (
  booking_id, customer_id, provider_id, rating, review_text, verified
) VALUES 
(1, 6, 1, 5, 'Sarah did an absolutely fantastic job! My flat has never looked cleaner. Very professional and thorough. Highly recommend!', 1),
(2, 7, 2, 5, 'James responded quickly to my emergency and fixed the leak within an hour. Excellent service and very reasonable pricing.', 1),
(3, 8, 3, 5, 'Emma is a brilliant tutor. My daughter''s confidence in maths has improved significantly. Worth every penny!', 1);

-- Add provider response to one review
UPDATE reviews SET provider_response = 'Thank you so much for the lovely review! It was a pleasure working with you. Looking forward to helping you again!', 
provider_response_date = datetime('now', '-9 days') WHERE id = 1;

-- ============================================
-- 7. MESSAGES
-- ============================================

INSERT OR IGNORE INTO messages (
  conversation_id, sender_id, receiver_id, booking_id, message_text, is_read, read_at
) VALUES 
-- Conversation between customer and provider about booking 4
('CONV-6-2', 6, 2, 4, 'Hi Sarah, I''ve booked you for a deep clean next week. Just wanted to confirm you have all access details?', 1, datetime('now', '-2 days')),
('CONV-6-2', 2, 6, 4, 'Hello John! Yes, I have all the details. I''ll arrive at 9am sharp with all equipment. Looking forward to it!', 1, datetime('now', '-2 days')),

-- Conversation about booking 5
('CONV-9-5', 9, 5, 5, 'Hi Michael, for the website development, I''d like to discuss the payment gateway options. Can we have a call?', 1, datetime('now', '-1 day')),
('CONV-9-5', 5, 9, 5, 'Absolutely! I''ll give you a call this afternoon to discuss Stripe vs PayPal integration. Both work great.', 0, NULL),

-- Customer service inquiry
('CONV-7-1', 7, 1, NULL, 'Do you offer same-day cleaning services for emergencies?', 1, datetime('now', '-3 days')),
('CONV-7-1', 1, 7, NULL, 'Hi Mary! Yes, I can usually accommodate same-day bookings if I''m available. Feel free to call me directly for urgent requests.', 1, datetime('now', '-3 days'));

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================

INSERT OR IGNORE INTO notifications (
  user_id, notification_type, title, message, related_id, is_read
) VALUES 
-- Customer notifications
(6, 'booking_confirmed', 'Booking Confirmed', 'Your deep cleaning service has been confirmed for next week.', 4, 0),
(9, 'booking_created', 'Booking Created', 'Your website development booking has been created and is awaiting provider confirmation.', 5, 1),
(7, 'booking_cancelled', 'Booking Cancelled', 'Your carpet cleaning booking has been cancelled. Refund processed.', 7, 1),

-- Provider notifications
(2, 'booking_created', 'New Booking Request', 'You have a new booking request from John Smith for deep cleaning.', 4, 1),
(5, 'booking_created', 'New Booking Request', 'You have a new booking request from Lisa Taylor for website development.', 5, 0),
(2, 'review_received', 'New Review', 'You received a 5-star review from Mary Jones!', 2, 1),

-- Admin notifications
(1, 'booking_created', 'Platform Activity', 'New booking created - SNOW-2024-006', 6, 0),
(1, 'payment_received', 'Payment Processed', 'Payment of £500.00 received for booking SNOW-2024-005', 5, 0);

-- ============================================
-- 9. AVAILABILITY
-- ============================================

-- Sarah's availability (Monday to Saturday, 8am-6pm)
INSERT OR IGNORE INTO availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES 
(1, 1, '08:00', '18:00', 1), -- Monday
(1, 2, '08:00', '18:00', 1), -- Tuesday
(1, 3, '08:00', '18:00', 1), -- Wednesday
(1, 4, '08:00', '18:00', 1), -- Thursday
(1, 5, '08:00', '18:00', 1), -- Friday
(1, 6, '09:00', '15:00', 1); -- Saturday

-- James's availability (Monday to Friday, 7am-8pm, Saturday 8am-2pm)
INSERT OR IGNORE INTO availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES 
(2, 1, '07:00', '20:00', 1),
(2, 2, '07:00', '20:00', 1),
(2, 3, '07:00', '20:00', 1),
(2, 4, '07:00', '20:00', 1),
(2, 5, '07:00', '20:00', 1),
(2, 6, '08:00', '14:00', 1);

-- Emma's availability (Weekday evenings and weekends)
INSERT OR IGNORE INTO availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES 
(3, 1, '16:00', '20:00', 1), -- Monday evening
(3, 2, '16:00', '20:00', 1),
(3, 3, '16:00', '20:00', 1),
(3, 4, '16:00', '20:00', 1),
(3, 5, '16:00', '20:00', 1),
(3, 6, '09:00', '17:00', 1), -- Saturday
(3, 0, '10:00', '16:00', 1); -- Sunday

-- Michael's availability (Monday to Friday, 9am-6pm)
INSERT OR IGNORE INTO availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES 
(4, 1, '09:00', '18:00', 1),
(4, 2, '09:00', '18:00', 1),
(4, 3, '09:00', '18:00', 1),
(4, 4, '09:00', '18:00', 1),
(4, 5, '09:00', '18:00', 1);

-- ============================================
-- 10. BLOCKED DATES
-- ============================================

-- Sarah has blocked dates for holiday
INSERT OR IGNORE INTO blocked_dates (provider_id, blocked_date, reason) VALUES 
(1, date('now', '+15 days'), 'Holiday - Spain'),
(1, date('now', '+16 days'), 'Holiday - Spain'),
(1, date('now', '+17 days'), 'Holiday - Spain');

-- James has a full day booking
INSERT OR IGNORE INTO blocked_dates (provider_id, blocked_date, reason) VALUES 
(2, date('now', '+12 days'), 'Large commercial project - fully booked');

-- ============================================
-- END OF SEED DATA
-- ============================================
