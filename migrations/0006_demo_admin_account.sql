-- Keep the documented demo admin credentials available in deployed environments.
INSERT OR IGNORE INTO users (email, password, full_name, phone, role, status, email_verified, created_at)
VALUES (
  'admin@snowfleetmanagement.uk',
  'hashed_admin_password_123',
  'Fleet Manager',
  '+447700900000',
  'admin',
  'active',
  1,
  CURRENT_TIMESTAMP
);
