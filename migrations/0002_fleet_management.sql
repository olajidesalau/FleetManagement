-- Snow Fleet Management domain schema
-- Fleet entities are separate from the legacy marketplace tables.

-- ============================================
-- 1. DRIVERS
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  driver_reference TEXT UNIQUE NOT NULL,
  licence_number TEXT UNIQUE NOT NULL,
  licence_expiry DATE NOT NULL,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'assigned', 'off_duty', 'suspended')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 2. VEHICLES
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_reference TEXT UNIQUE NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  vehicle_type TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available', 'assigned', 'in_transit', 'loading', 'parked', 'maintenance', 'offline')),
  temperature_controlled INTEGER NOT NULL DEFAULT 0 CHECK(temperature_controlled IN (0, 1)),
  target_temperature_min REAL,
  target_temperature_max REAL,
  current_temperature REAL,
  mileage INTEGER NOT NULL DEFAULT 0 CHECK(mileage >= 0),
  last_service_date DATE,
  next_service_mileage INTEGER,
  last_seen_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(target_temperature_min IS NULL OR target_temperature_max IS NULL OR target_temperature_min <= target_temperature_max)
);

-- ============================================
-- 3. FLEET ROUTES
-- ============================================
CREATE TABLE IF NOT EXISTS fleet_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_reference TEXT UNIQUE NOT NULL,
  customer_id INTEGER,
  driver_id INTEGER,
  vehicle_id INTEGER,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  scheduled_departure DATETIME NOT NULL,
  estimated_arrival DATETIME,
  actual_departure DATETIME,
  actual_arrival DATETIME,
  status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'allocated', 'accepted', 'loading', 'in_transit', 'delivered', 'cancelled', 'delayed')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent >= 0 AND progress_percent <= 100),
  cargo_description TEXT,
  cargo_temperature_min REAL,
  cargo_temperature_max REAL,
  distance_miles REAL,
  traffic_status TEXT NOT NULL DEFAULT 'clear' CHECK(traffic_status IN ('clear', 'slow', 'disrupted', 'closed')),
  alternative_route TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  CHECK(cargo_temperature_min IS NULL OR cargo_temperature_max IS NULL OR cargo_temperature_min <= cargo_temperature_max)
);

-- ============================================
-- 4. TEMPERATURE READINGS
-- ============================================
CREATE TABLE IF NOT EXISTS temperature_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  route_id INTEGER,
  temperature_celsius REAL NOT NULL,
  humidity_percent REAL,
  sensor_status TEXT NOT NULL DEFAULT 'online' CHECK(sensor_status IN ('online', 'offline', 'fault')),
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES fleet_routes(id) ON DELETE SET NULL
);

-- ============================================
-- 5. FLEET ALERTS
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_type TEXT NOT NULL CHECK(alert_type IN ('temperature', 'traffic', 'route', 'vehicle', 'customer', 'system')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  vehicle_id INTEGER,
  route_id INTEGER,
  driver_id INTEGER,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by INTEGER,
  acknowledged_at DATETIME,
  resolved_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (route_id) REFERENCES fleet_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- 6. ROUTE ACTIVITY HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS route_activity_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id INTEGER NOT NULL,
  actor_user_id INTEGER,
  driver_id INTEGER,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('created', 'allocated', 'accepted', 'rejected', 'started', 'checkpoint', 'traffic_update', 'temperature_alert', 'delivered', 'cancelled', 'edited')),
  status_from TEXT,
  status_to TEXT,
  latitude REAL,
  longitude REAL,
  location_label TEXT,
  notes TEXT,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES fleet_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Live operations indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_temperature_controlled ON vehicles(temperature_controlled);
CREATE INDEX IF NOT EXISTS idx_vehicles_last_seen_at ON vehicles(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_status ON fleet_routes(status);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_departure ON fleet_routes(scheduled_departure);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_driver_id ON fleet_routes(driver_id);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_vehicle_id ON fleet_routes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fleet_routes_customer_id ON fleet_routes(customer_id);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_vehicle_recorded ON temperature_readings(vehicle_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_temperature_readings_route_recorded ON temperature_readings(route_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_alerts_status_created ON alerts(status, created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_type_status ON alerts(alert_type, status);
CREATE INDEX IF NOT EXISTS idx_alerts_route_id ON alerts(route_id);
CREATE INDEX IF NOT EXISTS idx_alerts_vehicle_id ON alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_route_activity_route_recorded ON route_activity_history(route_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_route_activity_recorded ON route_activity_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_route_activity_type ON route_activity_history(activity_type);
