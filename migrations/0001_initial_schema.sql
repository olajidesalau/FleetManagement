-- Snow Fleet Management base schema
-- Compatibility tables retained for existing account and service records

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK(role IN ('customer', 'provider', 'admin')),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'deleted')),
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- ============================================
-- 2. SERVICE PROVIDER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS provider_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate REAL NOT NULL,
  service_areas TEXT NOT NULL, -- JSON array of UK postcodes
  services_offered TEXT NOT NULL, -- JSON array of service types
  dbs_verified INTEGER DEFAULT 0,
  dbs_certificate_url TEXT,
  dbs_verified_date DATETIME,
  insurance_verified INTEGER DEFAULT 0,
  insurance_certificate_url TEXT,
  insurance_verified_date DATETIME,
  approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
  approval_date DATETIME,
  approved_by INTEGER, -- admin user_id
  rejection_reason TEXT,
  average_rating REAL DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  profile_image_url TEXT,
  availability_enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- ============================================
-- 3. SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK(service_type IN (
    'cleaning', 'deep_cleaning', 'carpet_cleaning', 'window_cleaning',
    'plumbing', 'electrical', 'carpentry', 
    'it_support', 'web_development', 'graphic_design', 'video_editing',
    'tutoring', 'fitness_coaching', 'other'
  )),
  description TEXT,
  price REAL NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

-- ============================================
-- 4. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  booking_reference TEXT UNIQUE NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  service_address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN (
    'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  cancellation_reason TEXT,
  cancelled_by INTEGER, -- user_id who cancelled
  cancelled_at DATETIME,
  refund_status TEXT CHECK(refund_status IN ('none', 'pending', 'processed', 'rejected')),
  refund_amount REAL,
  refund_processed_at DATETIME,
  service_price REAL NOT NULL,
  platform_fee REAL NOT NULL, -- 15% commission
  provider_payout REAL NOT NULL,
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id),
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (cancelled_by) REFERENCES users(id)
);

-- ============================================
-- 5. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  amount REAL NOT NULL,
  platform_fee REAL NOT NULL,
  provider_payout REAL NOT NULL,
  payment_method TEXT CHECK(payment_method IN ('card', 'direct_debit', 'wallet')),
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
  )),
  payment_provider TEXT, -- stripe, gocardless
  payment_provider_id TEXT, -- external payment ID
  paid_at DATETIME,
  payout_status TEXT DEFAULT 'pending' CHECK(payout_status IN (
    'pending', 'processing', 'completed', 'failed', 'on_hold'
  )),
  payout_date DATETIME,
  payout_provider_id TEXT,
  refund_amount REAL DEFAULT 0,
  refund_status TEXT CHECK(refund_status IN ('none', 'pending', 'processed', 'rejected')),
  refund_processed_at DATETIME,
  refund_provider_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER UNIQUE NOT NULL,
  customer_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified INTEGER DEFAULT 1, -- auto-verified for completed bookings
  provider_response TEXT,
  provider_response_date DATETIME,
  is_visible INTEGER DEFAULT 1,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id)
);

-- ============================================
-- 7. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL, -- unique conversation identifier
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  booking_id INTEGER, -- optional, if message relates to booking
  message_text TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  read_at DATETIME,
  is_system_message INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- ============================================
-- 8. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK(notification_type IN (
    'booking_created', 'booking_confirmed', 'booking_cancelled',
    'booking_completed', 'payment_received', 'payment_failed',
    'review_received', 'message_received', 'profile_approved',
    'profile_rejected', 'system_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id INTEGER, -- ID of related entity (booking_id, message_id, etc.)
  is_read INTEGER DEFAULT 0,
  read_at DATETIME,
  action_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 9. AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE
);

-- ============================================
-- 10. BLOCKED DATES TABLE (for provider unavailability)
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_dates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id INTEGER NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES provider_profiles(id) ON DELETE CASCADE,
  UNIQUE(provider_id, blocked_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Provider profile indexes
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_approval_status ON provider_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_average_rating ON provider_profiles(average_rating);

-- Service indexes
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_postcode ON bookings(postcode);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_payout_status ON payments(payout_status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_reference ON payments(payment_reference);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type ON notifications(notification_type);

-- Availability indexes
CREATE INDEX IF NOT EXISTS idx_availability_provider_id ON availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON availability(day_of_week);

-- Blocked dates indexes
CREATE INDEX IF NOT EXISTS idx_blocked_dates_provider_id ON blocked_dates(provider_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_blocked_date ON blocked_dates(blocked_date);
