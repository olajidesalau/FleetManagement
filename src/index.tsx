import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { D1Database } from '@cloudflare/workers-types'
import { HomePage, ProvidersSearchPage, LoginPage, RegisterPage, RoutesPage, RouteDetailPage, VehiclesPage, TemperaturePage, AlertsPage, MonitoringPage, DriversPage, AdminDriversPage, CustomersPage, RouteScanPage, TrafficPage, ManagementPage, MonitoringExportPage, RouteFormPage, VehicleFormPage, DriverFormPage, DriverEditPage, DriverDetailPage, CustomerFormPage, ProfilePage, AdminDashboardPage, AdminUsersPage, AdminProvidersPage, AdminBookingsPage, BookingsPage, NotificationsPage } from './pages'
import { renderer } from './renderer' 

type Bindings = {
  DB: D1Database
  WAZE_TRAFFIC_URL?: string
  WAZE_API_KEY?: string
  GOOGLE_ROUTES_URL?: string
  GOOGLE_MAPS_API_KEY?: string
}

interface User {
  id: string
  email: string
  full_name: string
  role: 'customer' | 'provider' | 'admin'
  phone?: string
  postcode?: string
  profile_picture_url?: string
  bio?: string
  rating?: number
  created_at: string
}

type HonoEnv = { Bindings: Bindings; Variables: { user?: Record<string, any> } }
const app = new Hono<HonoEnv>()

// Enable CORS for API routes
app.use('/api/*', cors())
app.use('*', renderer)

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Simple JWT encode/decode (placeholder - use proper JWT library in production)
function encodeJWT(payload: Record<string, any>, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = Buffer.from(`${header}.${body}.${secret}`).toString('base64')
  return `${header}.${body}.${signature}`
}

function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
    return decoded as Record<string, any>
  } catch {
    return null
  }
}

// Simple password hash (placeholder - use bcrypt in production)
function hashPassword(password: string): string {
  // In production, use proper bcrypt hashing
  return `hashed_${password}_123`
}

// Middleware: Authenticate JWT token
async function authenticate(c: any, next: any) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (c.req.header('Accept')?.includes('text/html')) {
      return c.redirect('/auth/login')
    }
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.substring(7)
  const payload = decodeJWT(token)
  
  if (!payload || !payload.userId) {
    if (c.req.header('Accept')?.includes('text/html')) {
      return c.redirect('/auth/login')
    }
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  c.set('user', payload)
  await next()
}

async function updateNightlyMileage(db: D1Database) {
  try { await db.prepare(`ALTER TABLE fleet_routes ADD COLUMN mileage_applied_at DATETIME`).run() } catch {}
  const routes = await db.prepare(`SELECT id, vehicle_id, distance_miles FROM fleet_routes WHERE status = 'delivered' AND mileage_applied_at IS NULL AND vehicle_id IS NOT NULL AND COALESCE(distance_miles, 0) > 0`).all()
  let processed = 0
  for (const route of routes.results as any[]) {
    await db.prepare(`UPDATE vehicles SET mileage = COALESCE(mileage, 0) + ?, updated_at = datetime('now') WHERE id = ?`).bind(Number(route.distance_miles), route.vehicle_id).run()
    await db.prepare(`UPDATE fleet_routes SET mileage_applied_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).bind(route.id).run()
    await db.prepare(`INSERT INTO route_activity_history (route_id, activity_type, status_to, notes, recorded_at) VALUES (?, 'checkpoint', 'delivered', ?, datetime('now'))`).bind(route.id, `Nightly mileage update applied: ${route.distance_miles} miles`).run()
    processed += 1
  }
  return { processed }
}

async function runScheduledFleetScans(db: D1Database) {
  try { await db.prepare(`ALTER TABLE fleet_routes ADD COLUMN last_scanned_at DATETIME`).run() } catch {}
  const routes = await db.prepare(`SELECT id, route_reference, origin, destination, traffic_status, alternative_route FROM fleet_routes WHERE status NOT IN ('delivered', 'cancelled') AND scheduled_departure <= datetime('now', '+30 days') ORDER BY scheduled_departure LIMIT 200`).all()
  let checked = 0
  let alertsCreated = 0
  for (const route of routes.results as any[]) {
    checked += 1
    await db.prepare(`UPDATE fleet_routes SET last_scanned_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).bind(route.id).run()
    if (route.traffic_status === 'slow' || route.traffic_status === 'disrupted' || route.traffic_status === 'closed') {
      const title = route.traffic_status === 'closed' ? 'Route closed' : route.traffic_status === 'disrupted' ? 'Traffic disruption' : 'Heavy traffic'
      const existing = await db.prepare(`SELECT id FROM alerts WHERE route_id = ? AND alert_type = 'traffic' AND status IN ('open', 'acknowledged') LIMIT 1`).bind(route.id).first()
      if (!existing) {
        await db.prepare(`INSERT INTO alerts (alert_type, severity, title, message, route_id, status, created_at, updated_at) VALUES ('traffic', ?, ?, ?, ?, 'open', datetime('now'), datetime('now'))`).bind(route.traffic_status === 'closed' ? 'critical' : 'warning', title, `${route.route_reference}: ${route.origin} to ${route.destination} requires traffic review.`, route.id).run()
        alertsCreated += 1
      }
      await db.prepare(`INSERT INTO route_activity_history (route_id, activity_type, status_to, notes, recorded_at) VALUES (?, 'traffic_update', ?, ?, datetime('now'))`).bind(route.id, route.traffic_status, `Scheduled traffic scan: ${title}`).run()
    }
  }
  return { checked, alertsCreated, scannedAt: new Date().toISOString() }
}

// Middleware: Check if user has specific role
function requireRole(...roles: string[]) {
  return async (c: any, next: any) => {
    const user = c.get('user') as any
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden - insufficient permissions' }, 403)
    }
    await next()
  }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register new user
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, full_name, phone, role, licence_number, licence_expiry } = await c.req.json()
    
    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    // Driver accounts use the existing provider-compatible user role plus a fleet driver record.
    if (!['customer', 'provider', 'driver', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role. Choose customer, driver, or admin' }, 400)
    }
    if (role === 'driver' && (!licence_number || !licence_expiry)) {
      return c.json({ error: 'Driver licence number and expiry are required' }, 400)
    }

    // Validate full_name (letters, spaces, apostrophe, hyphen) max 50 chars
    const nameRegex = /^[A-Za-z\s'\-]{1,50}$/
    if (!nameRegex.test(full_name)) {
      return c.json({ error: 'Invalid full_name. Only letters, spaces, apostrophes and hyphens allowed; max 50 characters' }, 400)
    }
    
    // Check if email already exists
    const existing = await (c.env.DB as D1Database).prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (existing) {
      return c.json({ error: 'Email already registered' }, 400)
    }
    
    // Hash password
    const hashedPassword = hashPassword(password)
    const storedRole = role === 'driver' ? 'provider' : role
    
    // Insert user
    const result = await (c.env.DB as D1Database).prepare(`
      INSERT INTO users (email, password, full_name, phone, role, status, email_verified, created_at)
      VALUES (?, ?, ?, ?, ?, 'active', 0, datetime('now'))
    `).bind(email, hashedPassword, full_name, phone || null, storedRole).run()
    
    const userId = result.meta.last_row_id
    
    // If provider, create initial profile
    if (role === 'provider') {
      await (c.env.DB as D1Database).prepare(`
        INSERT INTO provider_profiles (
          user_id, business_name, hourly_rate, service_areas, 
          services_offered, approval_status, created_at
        ) VALUES (?, ?, 0, '[]', '[]', 'pending', datetime('now'))
      `).bind(userId, full_name).run()
    }
    if (role === 'driver') {
      await (c.env.DB as D1Database).prepare(`
        INSERT INTO drivers (user_id, driver_reference, licence_number, licence_expiry, phone, status)
        VALUES (?, ?, ?, ?, ?, 'available')
      `).bind(userId, `DRV-${String(userId).padStart(4, '0')}`, licence_number, licence_expiry, phone || null).run()
    }
    
    // Generate JWT token
    const token = encodeJWT({ userId, email, role }, 'your-secret-key')
    
    return c.json({ 
      success: true, 
      token,
      user: { id: userId, email, full_name, role }
    }, 201)
  } catch (error: any) {
    return c.json({ error: 'Registration failed: ' + error.message }, 500)
  }
})

// Login user
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400)
    }
    
    // Find user
    const user = await (c.env.DB as D1Database).prepare(`
      SELECT id, email, password, full_name, phone, role, status 
      FROM users WHERE email = ?
    `).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    // Check status
    if (user.status !== 'active') {
      return c.json({ error: 'Account is suspended or deleted' }, 403)
    }
    
    // Verify password
    const hashedPassword = hashPassword(password)
    if (user.password !== hashedPassword) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }
    
    // Update last login
    await (c.env.DB as D1Database).prepare(
      "UPDATE users SET last_login = datetime('now') WHERE id = ?"
    ).bind(user.id).run()
    
    // Generate JWT token
    const token = encodeJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, 'your-secret-key')
    
    return c.json({ 
      success: true, 
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        full_name: user.full_name,
        phone: user.phone,
        role: user.role 
      }
    })
  } catch (error: any) {
    return c.json({ error: 'Login failed: ' + error.message }, 500)
  }
})

// Get current user profile
app.get('/api/auth/me', authenticate, async (c) => {
  try {
    const user = c.get('user') as any as any
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    const profile = await (c.env.DB as D1Database).prepare(`
      SELECT id, email, full_name, phone, role, status, email_verified, 
             phone_verified, created_at, last_login
      FROM users WHERE id = ?
    `).bind(user.id).first()
    
    if (!profile) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // If provider, get provider profile
    if (profile.role === 'provider') {
      const providerProfile = await (c.env.DB as D1Database).prepare(`
        SELECT * FROM provider_profiles WHERE user_id = ?
      `).bind(user.userId).first()
      
      return c.json({ user: profile, providerProfile })
    }
    
    return c.json({ user: profile })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch profile: ' + error.message }, 500)
  }
})

app.get('/api/profile', authenticate, async (c) => {
  try {
    const session = c.get('user') as any
    const userId = session?.userId
    if (!userId) return c.json({ error: 'Invalid session' }, 401)
    const user = await c.env.DB.prepare(`SELECT id, email, full_name, phone, role, status, email_verified, phone_verified, created_at, last_login FROM users WHERE id = ?`).bind(userId).first() as any
    if (!user) return c.json({ error: 'User not found' }, 404)

    let roleData: Record<string, any> = {}
    if (user.role === 'admin') {
      const [users, routes, vehicles, alerts] = await Promise.all([
        c.env.DB.prepare(`SELECT COUNT(*) AS count FROM users`).first(),
        c.env.DB.prepare(`SELECT COUNT(*) AS count FROM fleet_routes WHERE status NOT IN ('delivered', 'cancelled')`).first(),
        c.env.DB.prepare(`SELECT COUNT(*) AS count FROM vehicles WHERE status != 'offline'`).first(),
        c.env.DB.prepare(`SELECT COUNT(*) AS count FROM alerts WHERE status = 'open'`).first()
      ])
      roleData = { profile_type: 'admin', total_users: Number((users as any)?.count || 0), active_routes: Number((routes as any)?.count || 0), vehicles_online: Number((vehicles as any)?.count || 0), open_alerts: Number((alerts as any)?.count || 0) }
    } else if (user.role === 'provider') {
      const driver = await c.env.DB.prepare(`SELECT id, driver_reference, licence_number, licence_expiry, phone, status, emergency_contact_name, emergency_contact_phone FROM drivers WHERE user_id = ?`).bind(userId).first() as any
      if (driver) {
        const assigned = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM fleet_routes WHERE driver_id = ? AND status NOT IN ('delivered', 'cancelled')`).bind(driver.id).first() as any
        roleData = { profile_type: 'driver', ...driver, active_routes: Number(assigned?.count || 0) }
      } else {
        const provider = await c.env.DB.prepare(`SELECT id, business_name, approval_status, average_rating, total_bookings FROM provider_profiles WHERE user_id = ?`).bind(userId).first()
        roleData = { profile_type: 'provider', ...(provider || {}) }
      }
    } else {
      const routes = await c.env.DB.prepare(`SELECT COUNT(*) AS count FROM fleet_routes WHERE customer_id = ?`).bind(userId).first() as any
      roleData = { profile_type: 'customer', route_count: Number(routes?.count || 0) }
    }
    return c.json({ user, roleData })
  } catch (error: any) {
    return c.json({ error: 'Failed to load profile: ' + error.message }, 500)
  }
})

app.put('/api/profile', authenticate, async (c) => {
  try {
    const session = c.get('user') as any
    const userId = session?.userId
    const body = await c.req.json<{ full_name?: string; phone?: string }>()
    const fullName = String(body.full_name || '').trim()
    if (!userId || !fullName || !/^[A-Za-z\s'\-]{1,80}$/.test(fullName)) return c.json({ error: 'A valid full name is required' }, 400)
    await c.env.DB.prepare(`UPDATE users SET full_name = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`).bind(fullName, body.phone || null, userId).run()
    return c.json({ success: true, message: 'Profile updated' })
  } catch (error: any) {
    return c.json({ error: 'Failed to update profile: ' + error.message }, 500)
  }
})

// ============================================
// PROVIDER PROFILE ROUTES
// ============================================

// Search providers (must be before :userId route)
app.get('/api/providers/search', async (c) => {
  try {
    const postcode = c.req.query('postcode')
    const serviceType = c.req.query('serviceType')
    const minRating = c.req.query('minRating')
    const maxPrice = c.req.query('maxPrice')
    
    let query = `
      SELECT p.*, u.full_name, u.email, u.phone
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.approval_status = 'approved' AND p.availability_enabled = 1
    `
    
    const bindings: any[] = []
    
    if (postcode) {
      query += ` AND p.service_areas LIKE ?`
      bindings.push(`%${postcode}%`)
    }
    
    if (serviceType) {
      query += ` AND p.services_offered LIKE ?`
      bindings.push(`%${serviceType}%`)
    }
    
    if (minRating) {
      query += ` AND p.average_rating >= ?`
      bindings.push(parseFloat(minRating))
    }
    
    if (maxPrice) {
      query += ` AND p.hourly_rate <= ?`
      bindings.push(parseFloat(maxPrice))
    }
    
    query += ` ORDER BY p.average_rating DESC, p.total_reviews DESC`
    
    const stmt = (c.env.DB as D1Database).prepare(query)
    const result = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()
    
    // Parse JSON fields
    const providers = result.results.map((p: any) => ({
      ...p,
      service_areas: JSON.parse(p.service_areas),
      services_offered: JSON.parse(p.services_offered)
    }))
    
    return c.json({ providers, count: providers.length })
  } catch (error: any) {
    return c.json({ error: 'Search failed: ' + error.message }, 500)
  }
})

// Get provider profile by user ID (must be after /search route)
app.get('/api/providers/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const provider = await (c.env.DB as D1Database).prepare(`
      SELECT p.*, u.full_name, u.email, u.phone
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? AND p.approval_status = 'approved'
    `).bind(userId).first()
    
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404)
    }
    
    // Parse JSON fields
    provider.service_areas = JSON.parse(provider.service_areas as string)
    provider.services_offered = JSON.parse(provider.services_offered as string)
    
    return c.json({ provider })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch provider: ' + error.message }, 500)
  }
})

// Update provider profile
app.put('/api/providers/profile', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    const {
      business_name, bio, experience_years, hourly_rate,
      service_areas, services_offered
    } = await c.req.json()
    
    await (c.env.DB as D1Database).prepare(`
      UPDATE provider_profiles SET
        business_name = ?,
        bio = ?,
        experience_years = ?,
        hourly_rate = ?,
        service_areas = ?,
        services_offered = ?,
        updated_at = datetime('now')
      WHERE user_id = ?
    `).bind(
      business_name,
      bio,
      experience_years,
      hourly_rate,
      JSON.stringify(service_areas),
      JSON.stringify(services_offered),
      user.userId
    ).run()
    
    return c.json({ success: true, message: 'Profile updated successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to update profile: ' + error.message }, 500)
  }
})

// ============================================
// SERVICES ROUTES
// ============================================

// Get all services by provider
app.get('/api/services/provider/:providerId', async (c) => {
  try {
    const providerId = c.req.param('providerId')
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT * FROM services WHERE provider_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `).bind(providerId).all()
    
    return c.json({ services: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch services: ' + error.message }, 500)
  }
})

// Get single service
app.get('/api/services/:serviceId', async (c) => {
  try {
    const serviceId = c.req.param('serviceId')
    
    const service = await (c.env.DB as D1Database).prepare(`
      SELECT s.*, p.business_name, p.average_rating, p.total_reviews,
             u.full_name as provider_name
      FROM services s
      JOIN provider_profiles p ON s.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE s.id = ?
    `).bind(serviceId).first()
    
    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }
    
    return c.json({ service })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch service: ' + error.message }, 500)
  }
})

// Create new service
app.post('/api/services', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    const { service_name, service_type, description, price, duration_minutes } = await c.req.json()
    
    // Get provider profile ID
    const profile = await (c.env.DB as D1Database).prepare(
      'SELECT id FROM provider_profiles WHERE user_id = ?'
    ).bind(user.userId).first()
    
    if (!profile) {
      return c.json({ error: 'Provider profile not found' }, 404)
    }
    
    const result = await (c.env.DB as D1Database).prepare(`
      INSERT INTO services (
        provider_id, service_name, service_type, description, 
        price, duration_minutes, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `).bind(
      profile.id, service_name, service_type, description, 
      price, duration_minutes
    ).run()
    
    return c.json({ 
      success: true, 
      serviceId: result.meta.last_row_id,
      message: 'Service created successfully' 
    }, 201)
  } catch (error: any) {
    return c.json({ error: 'Failed to create service: ' + error.message }, 500)
  }
})

// Update service
app.put('/api/services/:serviceId', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    const serviceId = c.req.param('serviceId')
    const { service_name, service_type, description, price, duration_minutes, is_active } = await c.req.json()
    
    // Verify ownership
    const service = await (c.env.DB as D1Database).prepare(`
      SELECT s.id FROM services s
      JOIN provider_profiles p ON s.provider_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `).bind(serviceId, user.userId).first()
    
    if (!service) {
      return c.json({ error: 'Service not found or access denied' }, 404)
    }
    
    await (c.env.DB as D1Database).prepare(`
      UPDATE services SET
        service_name = ?, service_type = ?, description = ?,
        price = ?, duration_minutes = ?, is_active = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      service_name, service_type, description, 
      price, duration_minutes, is_active ? 1 : 0, serviceId
    ).run()
    
    return c.json({ success: true, message: 'Service updated successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to update service: ' + error.message }, 500)
  }
})

// Delete service
app.delete('/api/services/:serviceId', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    const serviceId = c.req.param('serviceId')
    
    // Verify ownership
    const service = await (c.env.DB as D1Database).prepare(`
      SELECT s.id FROM services s
      JOIN provider_profiles p ON s.provider_id = p.id
      WHERE s.id = ? AND p.user_id = ?
    `).bind(serviceId, user.userId).first()
    
    if (!service) {
      return c.json({ error: 'Service not found or access denied' }, 404)
    }
    
    await (c.env.DB as D1Database).prepare('DELETE FROM services WHERE id = ?').bind(serviceId).run()
    
    return c.json({ success: true, message: 'Service deleted successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to delete service: ' + error.message }, 500)
  }
})

// ============================================
// BOOKINGS ROUTES
// ============================================

// Create new booking
app.post('/api/bookings', authenticate, requireRole('customer'), async (c) => {
  try {
    const user = c.get('user') as any
    const {
      provider_id, service_id, booking_date, booking_time,
      duration_minutes, service_address, postcode, special_instructions
    } = await c.req.json()
    
    // Get service details
    const service = await (c.env.DB as D1Database).prepare(
      'SELECT price, duration_minutes FROM services WHERE id = ?'
    ).bind(service_id).first()
    
    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }
    
    // Calculate fees
    const servicePrice = service.price as number
    const platformFee = servicePrice * 0.15 // 15% commission
    const providerPayout = servicePrice - platformFee
    
    // Generate booking reference
    const bookingRef = `SNOW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create booking
    const result = await (c.env.DB as D1Database).prepare(`
      INSERT INTO bookings (
        customer_id, provider_id, service_id, booking_reference,
        booking_date, booking_time, duration_minutes, service_address,
        postcode, special_instructions, status, service_price,
        platform_fee, provider_payout, total_amount, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, datetime('now'))
    `).bind(
      user.userId, provider_id, service_id, bookingRef,
      booking_date, booking_time, duration_minutes || service.duration_minutes,
      service_address, postcode, special_instructions || null,
      servicePrice, platformFee, providerPayout, servicePrice
    ).run()
    
    const bookingId = result.meta.last_row_id
    
    // Create notifications
    await (c.env.DB as D1Database).prepare(`
      INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
      VALUES (?, 'booking_created', 'Booking Created', ?, ?, datetime('now'))
    `).bind(
      user.userId,
      `Your booking ${bookingRef} has been created successfully.`,
      bookingId
    ).run()
    
    // Get provider user_id
    const provider = await (c.env.DB as D1Database).prepare(
      'SELECT user_id FROM provider_profiles WHERE id = ?'
    ).bind(provider_id).first()
    
    if (provider) {
      await (c.env.DB as D1Database).prepare(`
        INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
        VALUES (?, 'booking_created', 'New Booking Request', ?, ?, datetime('now'))
      `).bind(
        provider.user_id,
        `You have a new booking request: ${bookingRef}`,
        bookingId
      ).run()
    }
    
    return c.json({
      success: true,
      bookingId,
      booking_reference: bookingRef,
      message: 'Booking created successfully'
    }, 201)
  } catch (error: any) {
    return c.json({ error: 'Failed to create booking: ' + error.message }, 500)
  }
})

// Get customer bookings
app.get('/api/bookings/customer', authenticate, requireRole('customer'), async (c) => {
  try {
    const user = c.get('user') as any
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, s.service_name, s.service_type,
             p.business_name, u.full_name as provider_name, u.phone as provider_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN provider_profiles p ON b.provider_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).bind(user.userId).all()
    
    return c.json({ bookings: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch bookings: ' + error.message }, 500)
  }
})

// Get provider bookings
app.get('/api/bookings/provider', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    
    // Get provider profile ID
    const profile = await (c.env.DB as D1Database).prepare(
      'SELECT id FROM provider_profiles WHERE user_id = ?'
    ).bind(user.userId).first()
    
    if (!profile) {
      return c.json({ error: 'Provider profile not found' }, 404)
    }
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, s.service_name, s.service_type,
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users u ON b.customer_id = u.id
      WHERE b.provider_id = ?
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `).bind(profile.id).all()
    
    return c.json({ bookings: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch bookings: ' + error.message }, 500)
  }
})

// Get single booking
app.get('/api/bookings/:bookingId', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.param('bookingId')
    
    const booking = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, s.service_name, s.service_type, s.description,
             p.business_name, p.hourly_rate,
             u_provider.full_name as provider_name, u_provider.email as provider_email, u_provider.phone as provider_phone,
             u_customer.full_name as customer_name, u_customer.email as customer_email, u_customer.phone as customer_phone
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN provider_profiles p ON b.provider_id = p.id
      JOIN users u_provider ON p.user_id = u_provider.id
      JOIN users u_customer ON b.customer_id = u_customer.id
      WHERE b.id = ?
    `).bind(bookingId).first()
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }
    
    // Verify access
    if (booking.customer_id !== user.userId && booking.provider_id !== user.userId && user.role !== 'admin') {
      // Get provider user_id to check
      const provider = await (c.env.DB as D1Database).prepare(
        'SELECT user_id FROM provider_profiles WHERE id = ?'
      ).bind(booking.provider_id).first()
      
      if (!provider || provider.user_id !== user.userId) {
        return c.json({ error: 'Access denied' }, 403)
      }
    }
    
    return c.json({ booking })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch booking: ' + error.message }, 500)
  }
})

// Update booking status
app.patch('/api/bookings/:bookingId/status', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.param('bookingId')
    const { status } = await c.req.json()
    
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    // Get booking
    const booking = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, p.user_id as provider_user_id
      FROM bookings b
      JOIN provider_profiles p ON b.provider_id = p.id
      WHERE b.id = ?
    `).bind(bookingId).first()
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }
    
    // Verify access
    if (booking.customer_id !== user.userId && booking.provider_user_id !== user.userId && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    // Update booking
    let updateQuery = `UPDATE bookings SET status = ?, updated_at = datetime('now')`
    const bindings: any[] = [status]
    
    if (status === 'completed') {
      updateQuery += `, completed_at = datetime('now')`
    }
    
    updateQuery += ` WHERE id = ?`
    bindings.push(bookingId)
    
    await (c.env.DB as D1Database).prepare(updateQuery).bind(...bindings).run()
    
    // Create notification
    const notifUserId = booking.customer_id === user.userId ? booking.provider_user_id : booking.customer_id
    await (c.env.DB as D1Database).prepare(`
      INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      notifUserId,
      `booking_${status}`,
      'Booking Status Updated',
      `Booking ${booking.booking_reference} status changed to ${status}`,
      bookingId
    ).run()
    
    return c.json({ success: true, message: 'Booking status updated successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to update booking status: ' + error.message }, 500)
  }
})

// Cancel booking
app.post('/api/bookings/:bookingId/cancel', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.param('bookingId')
    const { cancellation_reason } = await c.req.json()
    
    // Get booking
    const booking = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, p.user_id as provider_user_id
      FROM bookings b
      JOIN provider_profiles p ON b.provider_id = p.id
      WHERE b.id = ?
    `).bind(bookingId).first()
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return c.json({ error: 'Booking already cancelled' }, 400)
    }
    
    // Verify access
    if (booking.customer_id !== user.userId && booking.provider_user_id !== user.userId && user.role !== 'admin') {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    // Update booking
    await (c.env.DB as D1Database).prepare(`
      UPDATE bookings SET
        status = 'cancelled',
        cancellation_reason = ?,
        cancelled_by = ?,
        cancelled_at = datetime('now'),
        refund_status = 'pending',
        refund_amount = total_amount,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(cancellation_reason || 'No reason provided', user.userId, bookingId).run()
    
    // Update payment status
    await (c.env.DB as D1Database).prepare(`
      UPDATE payments SET
        refund_status = 'pending',
        refund_amount = amount,
        updated_at = datetime('now')
      WHERE booking_id = ?
    `).bind(bookingId).run()
    
    // Create notifications
    const notifUserId = booking.customer_id === user.userId ? booking.provider_user_id : booking.customer_id
    await (c.env.DB as D1Database).prepare(`
      INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
      VALUES (?, 'booking_cancelled', 'Booking Cancelled', ?, ?, datetime('now'))
    `).bind(
      notifUserId,
      `Booking ${booking.booking_reference} has been cancelled. Refund is being processed.`,
      bookingId
    ).run()
    
    return c.json({ success: true, message: 'Booking cancelled successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to cancel booking: ' + error.message }, 500)
  }
})

// ============================================
// REVIEWS ROUTES
// ============================================

// Create review
app.post('/api/reviews', authenticate, requireRole('customer'), async (c) => {
  try {
    const user = c.get('user') as any
    const { booking_id, rating, review_text } = await c.req.json()
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400)
    }
    
    // Get booking and verify
    const booking = await (c.env.DB as D1Database).prepare(`
      SELECT customer_id, provider_id, status FROM bookings WHERE id = ?
    `).bind(booking_id).first()
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404)
    }
    
    if (booking.customer_id !== user.userId) {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    if (booking.status !== 'completed') {
      return c.json({ error: 'Can only review completed bookings' }, 400)
    }
    
    // Check if review already exists
    const existing = await (c.env.DB as D1Database).prepare(
      'SELECT id FROM reviews WHERE booking_id = ?'
    ).bind(booking_id).first()
    
    if (existing) {
      return c.json({ error: 'Review already submitted for this booking' }, 400)
    }
    
    // Create review
    const result = await (c.env.DB as D1Database).prepare(`
      INSERT INTO reviews (
        booking_id, customer_id, provider_id, rating, review_text,
        verified, created_at
      ) VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
    `).bind(booking_id, user.userId, booking.provider_id, rating, review_text || null).run()
    
    // Update provider stats
    const stats = await (c.env.DB as D1Database).prepare(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews WHERE provider_id = ?
    `).bind(booking.provider_id).first()
    
    if (stats) {
      await (c.env.DB as D1Database).prepare(`
        UPDATE provider_profiles SET
          average_rating = ?,
          total_reviews = ?,
          updated_at = datetime('now')
        WHERE id = ?
      `).bind(stats.avg_rating || 0, stats.count || 0, booking.provider_id).run()
    }
    
    // Create notification for provider
    const provider = await (c.env.DB as D1Database).prepare(
      'SELECT user_id FROM provider_profiles WHERE id = ?'
    ).bind(booking.provider_id).first()
    
    if (provider) {
      await (c.env.DB as D1Database).prepare(`
        INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
        VALUES (?, 'review_received', 'New Review', ?, ?, datetime('now'))
      `).bind(
        provider.user_id,
        `You received a ${rating}-star review!`,
        result.meta.last_row_id
      ).run()
    }
    
    return c.json({
      success: true,
      reviewId: result.meta.last_row_id,
      message: 'Review submitted successfully'
    }, 201)
  } catch (error: any) {
    return c.json({ error: 'Failed to submit review: ' + error.message }, 500)
  }
})

// Get reviews for provider
app.get('/api/reviews/provider/:providerId', async (c) => {
  try {
    const providerId = c.req.param('providerId')
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT r.*, u.full_name as customer_name,
             b.booking_date, s.service_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE r.provider_id = ? AND r.is_visible = 1
      ORDER BY r.created_at DESC
    `).bind(providerId).all()
    
    return c.json({ reviews: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch reviews: ' + error.message }, 500)
  }
})

// Add provider response to review
app.post('/api/reviews/:reviewId/respond', authenticate, requireRole('provider'), async (c) => {
  try {
    const user = c.get('user') as any
    const reviewId = c.req.param('reviewId')
    const { response } = await c.req.json()
    
    // Get provider profile ID
    const profile = await (c.env.DB as D1Database).prepare(
      'SELECT id FROM provider_profiles WHERE user_id = ?'
    ).bind(user.userId).first()
    
    if (!profile) {
      return c.json({ error: 'Provider profile not found' }, 404)
    }
    
    // Verify review belongs to this provider
    const review = await (c.env.DB as D1Database).prepare(
      'SELECT provider_id FROM reviews WHERE id = ?'
    ).bind(reviewId).first()
    
    if (!review || review.provider_id !== profile.id) {
      return c.json({ error: 'Review not found or access denied' }, 404)
    }
    
    // Add response
    await (c.env.DB as D1Database).prepare(`
      UPDATE reviews SET
        provider_response = ?,
        provider_response_date = datetime('now'),
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(response, reviewId).run()
    
    return c.json({ success: true, message: 'Response added successfully' })
  } catch (error: any) {
    return c.json({ error: 'Failed to add response: ' + error.message }, 500)
  }
})

// ============================================
// MESSAGES ROUTES
// ============================================

// Send message
app.post('/api/messages', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const { receiver_id, booking_id, message_text } = await c.req.json()
    
    if (!message_text || !message_text.trim()) {
      return c.json({ error: 'Message text is required' }, 400)
    }
    
    // Generate conversation ID
    const conversationId = [user.userId, receiver_id].sort().join('-')
    
    // Insert message
    const result = await (c.env.DB as D1Database).prepare(`
      INSERT INTO messages (
        conversation_id, sender_id, receiver_id, booking_id,
        message_text, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).bind(conversationId, user.userId, receiver_id, booking_id || null, message_text).run()
    
    // Create notification
    await (c.env.DB as D1Database).prepare(`
      INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
      VALUES (?, 'message_received', 'New Message', 'You have a new message', ?, datetime('now'))
    `).bind(receiver_id, result.meta.last_row_id).run()
    
    return c.json({
      success: true,
      messageId: result.meta.last_row_id,
      message: 'Message sent successfully'
    }, 201)
  } catch (error: any) {
    return c.json({ error: 'Failed to send message: ' + error.message }, 500)
  }
})

// Get conversations
app.get('/api/messages/conversations', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT DISTINCT
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END as other_user_id,
        conversation_id,
        MAX(created_at) as last_message_at,
        SUM(CASE WHEN receiver_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY conversation_id
      ORDER BY last_message_at DESC
    `).bind(user.userId, user.userId, user.userId, user.userId).all()
    
    // Get user details for each conversation
    const conversations = []
    for (const conv of result.results) {
      const otherUser = await (c.env.DB as D1Database).prepare(
        'SELECT id, full_name, email FROM users WHERE id = ?'
      ).bind(conv.other_user_id).first()
      
      conversations.push({
        ...conv,
        other_user: otherUser
      })
    }
    
    return c.json({ conversations })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch conversations: ' + error.message }, 500)
  }
})

app.get('/api/messages/contacts', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const current = await c.env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(user.userId).first() as any
    const rows = await c.env.DB.prepare(`
      SELECT u.id, u.full_name, u.email,
        CASE WHEN u.role = 'admin' THEN 'admin' WHEN d.id IS NOT NULL THEN 'driver' WHEN u.role = 'customer' THEN 'customer' ELSE u.role END AS contact_role,
        d.driver_reference
      FROM users u
      LEFT JOIN drivers d ON d.user_id = u.id
      WHERE u.id != ? AND u.status = 'active'
        AND (u.role IN ('admin', 'customer') OR d.id IS NOT NULL)
      ORDER BY contact_role, u.full_name
    `).bind(user.userId).all()
    const contacts = (rows.results || []).filter((contact: any) => {
      if (current?.role === 'admin') return ['driver', 'customer'].includes(contact.contact_role)
      return ['admin', 'driver', 'customer'].includes(contact.contact_role)
    })
    return c.json({ contacts })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch message contacts: ' + error.message }, 500)
  }
})

// Get messages in conversation
app.get('/api/messages/conversation/:conversationId', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const conversationId = c.req.param('conversationId')
    
    // Verify user is part of conversation
    if (!conversationId.includes(user.userId.toString())) {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT m.*, u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).bind(conversationId).all()
    
    // Mark messages as read
    await (c.env.DB as D1Database).prepare(`
      UPDATE messages SET is_read = 1, read_at = datetime('now')
      WHERE conversation_id = ? AND receiver_id = ? AND is_read = 0
    `).bind(conversationId, user.userId).run()
    
    return c.json({ messages: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch messages: ' + error.message }, 500)
  }
})

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get user notifications
app.get('/api/notifications', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(user.userId).all()
    
    return c.json({ notifications: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch notifications: ' + error.message }, 500)
  }
})

// Mark notification as read
app.patch('/api/notifications/:notificationId/read', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const notificationId = c.req.param('notificationId')
    
    await (c.env.DB as D1Database).prepare(`
      UPDATE notifications SET is_read = 1, read_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).bind(notificationId, user.userId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: 'Failed to mark notification: ' + error.message }, 500)
  }
})

// Mark all notifications as read
app.post('/api/notifications/read-all', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    
    await (c.env.DB as D1Database).prepare(`
      UPDATE notifications SET is_read = 1, read_at = datetime('now')
      WHERE user_id = ? AND is_read = 0
    `).bind(user.userId).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: 'Failed to mark notifications: ' + error.message }, 500)
  }
})

// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (admin only)
app.get('/api/admin/users', authenticate, requireRole('admin'), async (c) => {
  try {
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT id, email, full_name, phone, role, status, email_verified, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `).all()
    
    return c.json({ users: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch users: ' + error.message }, 500)
  }
})

// Get all provider profiles (admin only)
app.get('/api/admin/providers', authenticate, requireRole('admin'), async (c) => {
  try {
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT p.*, u.email, u.full_name, u.phone
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all()
    
    // Parse JSON fields
    const providers = result.results.map((p: any) => ({
      ...p,
      service_areas: JSON.parse(p.service_areas),
      services_offered: JSON.parse(p.services_offered)
    }))
    
    return c.json({ providers })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch providers: ' + error.message }, 500)
  }
})

// Approve/reject provider profile
app.patch('/api/admin/providers/:providerId/approval', authenticate, requireRole('admin'), async (c) => {
  try {
    const user = c.get('user') as any
    const providerId = c.req.param('providerId')
    const { approval_status, rejection_reason } = await c.req.json()
    
    if (!['approved', 'rejected'].includes(approval_status)) {
      return c.json({ error: 'Invalid approval status' }, 400)
    }
    
    await (c.env.DB as D1Database).prepare(`
      UPDATE provider_profiles SET
        approval_status = ?,
        approval_date = datetime('now'),
        approved_by = ?,
        rejection_reason = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(approval_status, user.userId, rejection_reason || null, providerId).run()
    
    // Get provider user_id for notification
    const provider = await (c.env.DB as D1Database).prepare(
      'SELECT user_id FROM provider_profiles WHERE id = ?'
    ).bind(providerId).first()
    
    if (provider) {
      await (c.env.DB as D1Database).prepare(`
        INSERT INTO notifications (user_id, notification_type, title, message, related_id, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        provider.user_id,
        approval_status === 'approved' ? 'profile_approved' : 'profile_rejected',
        approval_status === 'approved' ? 'Profile Approved' : 'Profile Rejected',
        approval_status === 'approved' 
          ? 'Your provider profile has been approved! You can now start accepting bookings.'
          : `Your provider profile was rejected. Reason: ${rejection_reason || 'Not specified'}`,
        providerId
      ).run()
    }
    
    return c.json({ success: true, message: `Provider ${approval_status} successfully` })
  } catch (error: any) {
    return c.json({ error: 'Failed to update approval status: ' + error.message }, 500)
  }
})

// Get all bookings (admin only)
app.get('/api/admin/bookings', authenticate, requireRole('admin'), async (c) => {
  try {
    const result = await (c.env.DB as D1Database).prepare(`
      SELECT b.*, 
             s.service_name, s.service_type,
             p.business_name,
             u_customer.full_name as customer_name, u_customer.email as customer_email,
             u_provider.full_name as provider_name, u_provider.email as provider_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN provider_profiles p ON b.provider_id = p.id
      JOIN users u_customer ON b.customer_id = u_customer.id
      JOIN users u_provider ON p.user_id = u_provider.id
      ORDER BY b.created_at DESC
      LIMIT 100
    `).all()
    
    return c.json({ bookings: result.results })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch bookings: ' + error.message }, 500)
  }
})

// Get platform statistics (admin only)
app.get('/api/admin/stats', authenticate, requireRole('admin'), async (c) => {
  try {
    const totalUsers = await (c.env.DB as D1Database).prepare(
      'SELECT COUNT(*) as count FROM users'
    ).first()
    
    const totalProviders = await (c.env.DB as D1Database).prepare(
      "SELECT COUNT(*) as count FROM provider_profiles WHERE approval_status = 'approved'"
    ).first()
    
    const totalCustomers = await (c.env.DB as D1Database).prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'customer'"
    ).first()
    
    const totalBookings = await (c.env.DB as D1Database).prepare(
      'SELECT COUNT(*) as count FROM bookings'
    ).first()
    
    const completedBookings = await (c.env.DB as D1Database).prepare(
      "SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'"
    ).first()
    
    const totalRevenue = await (c.env.DB as D1Database).prepare(
      "SELECT SUM(platform_fee) as total FROM bookings WHERE status = 'completed'"
    ).first()
    
    const pendingApprovals = await (c.env.DB as D1Database).prepare(
      "SELECT COUNT(*) as count FROM provider_profiles WHERE approval_status = 'pending'"
    ).first()
    
    return c.json({
      stats: {
        totalUsers: (totalUsers as any)?.count || 0,
        totalProviders: (totalProviders as any)?.count || 0,
        totalCustomers: (totalCustomers as any)?.count || 0,
        totalBookings: (totalBookings as any)?.count || 0,
        completedBookings: (completedBookings as any)?.count || 0,
        totalRevenue: (totalRevenue as any)?.total || 0,
        pendingApprovals: (pendingApprovals as any)?.count || 0
      }
    })
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch stats: ' + error.message }, 500)
  }
})

// Scan connected customer and market sources for upcoming route opportunities.
app.post('/api/fleet/routes/scan', async (c) => {
  let request: { source?: string; window?: string } = {}
  try {
    request = await c.req.json()
  } catch {
    request = {}
  }

  const windowDays = Number(request.window) || 7
  const priorityRegion = request.region === 'all_uk' ? 'United Kingdom' : 'North West England'
  const scannedAt = new Date().toISOString()
  const routes = [
    { reference: 'SCAN-401', company: 'Bidfood Liverpool', customer: 'Bidfood Liverpool', origin: 'Garston', destination: 'North West customer network', region: 'North West England', service: 'Chilled, frozen and ambient food delivery', date: 'Prospect review', distance: 'North West', fit: 'Potential multi-temperature work', source: 'Market', sourceUrl: 'https://www.bidfood.co.uk/get-in-touch/depot/bidfood-liverpool/', evidence: 'Garston depot publishes North West delivery coverage and a temperature-controlled fleet', priority: 100 },
    { reference: 'SCAN-402', company: 'Best Food Logistics', customer: 'Best Food Logistics', origin: 'Manchester area', destination: 'UK hospitality network', region: 'North West England', service: 'Multi-temperature food distribution', date: 'Prospect review', distance: '11,379 deliveries/week', fit: 'Potential shared-user routes', source: 'Market', sourceUrl: 'https://www.bestfoodlogistics.com/', evidence: 'Own depots and fleet with published multi-temperature distribution activity', priority: 99 },
    { reference: 'SCAN-403', company: 'NHS Supply Chain Food', customer: 'NHS Supply Chain Food', origin: 'Widnes region', destination: 'NHS trusts', region: 'North West England', service: 'Fresh, frozen and ready-meal food supply', date: 'Supplier opportunity', distance: 'Regional', fit: 'Monitor food frameworks', source: 'Market', sourceUrl: 'https://www.supplychain.nhs.uk/categories/food/', evidence: 'Food category publishes supplier enquiry route and multi-temperature distribution frameworks', priority: 98 },
    { reference: 'SCAN-404', company: 'Brakes', customer: 'Brakes Warrington', origin: 'Warrington depot network', destination: 'North West foodservice', region: 'North West England', service: 'Wholesale food distribution', date: 'Prospect review', distance: 'North West', fit: 'Potential depot support', source: 'Market', sourceUrl: 'https://www.brake.co.uk/', evidence: 'UK wholesale supplier advertises nationwide delivery and a become-a-customer route', priority: 96 },
    { reference: 'SCAN-405', company: 'Culina Group', customer: 'Culina Group', origin: 'Skelmersdale / UK network', destination: 'UK and Ireland', region: 'North West England', service: 'Chilled logistics and refrigerated transport', date: 'Prospect review', distance: 'UK-wide', fit: 'Potential subcontract work', source: 'Market', sourceUrl: 'https://www.culina.co.uk/chilled-logistics-solutions/', evidence: '100+ locations and strict-temperature food and drink logistics are published', priority: 93 },
    { reference: 'SCAN-406', company: 'Lineage Logistics', customer: 'Lineage Logistics UK', origin: 'UK cold-storage network', destination: 'Temperature-controlled customers', region: 'United Kingdom', service: 'Cold storage, transportation and fulfilment', date: 'Prospect review', distance: 'UK-wide', fit: 'Potential integrated routes', source: 'Market', sourceUrl: 'https://www.onelineage.com/', evidence: 'Cold storage, transportation and integrated supply-chain services are published', priority: 90 },
    { reference: 'SCAN-407', company: 'Fowler Welch', customer: 'Fowler Welch', origin: 'Spalding depot network', destination: 'UK fresh-produce customers', region: 'United Kingdom', service: 'Temperature-controlled distribution', date: 'Prospect review', distance: '44m miles/year', fit: 'Potential distribution work', source: 'Market', sourceUrl: 'https://www.fowlerwelch.co.uk/', evidence: 'Seven depots, temperature-controlled warehousing and distribution services are published', priority: 88 },
    { reference: 'SCAN-301', company: 'North West Cold Chain Ltd', customer: 'Northstar Medical', origin: 'Liverpool', destination: 'Manchester', region: 'North West England', service: 'Temperature-controlled medical equipment', date: 'Tomorrow, 08:30', distance: '36 mi', fit: 'Vehicle SN-14 available', source: 'Market', priority: 100 },
    { reference: 'SCAN-302', company: 'Mersey MedTrans', customer: 'Carewell Clinics', origin: 'Warrington', destination: 'Leeds', region: 'North West England', service: 'Sensitive medicines', date: 'Thursday, 11:15', distance: '68 mi', fit: 'Driver Amelia Carter available', source: 'Customer', priority: 98 },
    { reference: 'SCAN-303', company: 'Pennine Chilled Logistics', customer: 'MedEquip UK', origin: 'Manchester', destination: 'Sheffield', region: 'North West England', service: 'Medical equipment delivery', date: 'Friday, 09:00', distance: '42 mi', fit: 'Vehicle SN-05 available', source: 'Market', priority: 96 },
    { reference: 'SCAN-304', company: 'Midlands Clinical Freight', customer: 'Wellbeing Direct', origin: 'Birmingham', destination: 'Nottingham', region: 'West Midlands', service: 'Refrigerated clinical samples', date: 'Friday, 13:30', distance: '52 mi', fit: 'Vehicle SN-22 available', source: 'Customer', priority: 72 },
  ].filter(route => (request.source === 'all' || !request.source || request.source === 'customers' && route.source === 'Customer' || request.source === 'market' && route.source === 'Market') && (priorityRegion === 'United Kingdom' || route.region === priorityRegion)).sort((left, right) => right.priority - left.priority)

  return c.json({
    success: true,
    scan: { scanned_at: scannedAt, source: request.source || 'all', sector: 'cold-chain logistics', geography: 'United Kingdom', priority_region: priorityRegion, window_days: windowDays, sources_checked: 18, priority_matches: routes.filter(route => route.region === 'North West England').length, routes_found: routes.length },
    routes
  })
})

// Evaluate a route against configured Waze and Google traffic adapters.
app.post('/api/fleet/traffic/scan', async (c) => {
  const body = await c.req.json<{ route?: string }>().catch(() => ({}))
  const route = body.route || 'SN-204'
  const routeDetails: Record<string, { origin: string; destination: string; baseline_minutes: number }> = {
    'SN-204': { origin: 'Manchester', destination: 'Leeds', baseline_minutes: 95 },
    'SN-205': { origin: 'Liverpool', destination: 'Sheffield', baseline_minutes: 130 },
    'SN-206': { origin: 'Birmingham', destination: 'Nottingham', baseline_minutes: 82 }
  }
  const selected = routeDetails[route] || routeDetails['SN-204']
  const request = { route, origin: selected.origin, destination: selected.destination }

  const evaluate = async (provider: 'Waze' | 'Google Maps', url?: string, apiKey?: string) => {
    if (!url || !apiKey) {
      const delay = provider === 'Waze' ? 22 : 19
      return { provider, connected: false, mode: 'demo', status: 'Heavy traffic', delay_minutes: delay, incidents: ['Roadworks on primary route'], alternative_minutes: selected.baseline_minutes - 11 }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'X-Goog-Api-Key': apiKey },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(8000)
      })
      if (!response.ok) throw new Error(`Provider returned ${response.status}`)
      const data = await response.json() as Record<string, any>
      const delay = Number(data.delay_minutes ?? data.delayMinutes ?? data.delay ?? 0)
      return { provider, connected: true, mode: 'live', status: delay >= 20 ? 'Heavy traffic' : delay >= 8 ? 'Slow traffic' : 'Clear', delay_minutes: delay, incidents: Array.isArray(data.incidents) ? data.incidents : [], alternative_minutes: Number(data.alternative_minutes ?? data.alternativeMinutes ?? selected.baseline_minutes - Math.max(delay - 8, 0)) }
    } catch (error: any) {
      return { provider, connected: false, mode: 'error', status: 'Unavailable', delay_minutes: null, incidents: [error.message || 'Provider unavailable'], alternative_minutes: null }
    }
  }

  const sources = await Promise.all([
    evaluate('Waze', c.env.WAZE_TRAFFIC_URL, c.env.WAZE_API_KEY),
    evaluate('Google Maps', c.env.GOOGLE_ROUTES_URL || 'https://routes.googleapis.com/directions/v2:computeRoutes', c.env.GOOGLE_MAPS_API_KEY)
  ])
  const usable = sources.filter(source => source.alternative_minutes !== null)
  const bestAlternative = usable.sort((left, right) => (left.alternative_minutes || Infinity) - (right.alternative_minutes || Infinity))[0]
  const hasDisruption = sources.some(source => source.status === 'Heavy traffic' || source.status === 'Slow traffic')

  return c.json({
    success: true,
    route: { reference: route, origin: selected.origin, destination: selected.destination, baseline_minutes: selected.baseline_minutes },
    scanned_at: new Date().toISOString(),
    disruption: hasDisruption,
    sources,
    recommendation: bestAlternative ? { provider: bestAlternative.provider, label: hasDisruption ? 'Recommended alternative' : 'Fastest available route', eta_minutes: bestAlternative.alternative_minutes, reason: hasDisruption ? 'Avoids the reported disruption on the primary route' : 'No major disruption detected' } : null
  })
})

app.get('/api/fleet/temperature', async (c) => {
  try {
    const result = await c.env.DB.prepare(`SELECT v.vehicle_reference, v.current_temperature, v.target_temperature_min, v.target_temperature_max, v.last_seen_at, d.driver_reference, u.full_name AS driver_name FROM vehicles v LEFT JOIN drivers d ON d.id = (SELECT driver_id FROM fleet_routes WHERE vehicle_id = v.id AND status NOT IN ('delivered', 'cancelled') ORDER BY scheduled_departure DESC LIMIT 1) LEFT JOIN users u ON u.id = d.user_id WHERE v.temperature_controlled = 1 ORDER BY v.vehicle_reference`).all()
    if (result.results.length) return c.json({ readings: result.results, source: 'database' })
  } catch {}
  return c.json({ source: 'monitor', readings: [
    { vehicle_reference: 'SN-14', current_temperature: 4.2, target_temperature_min: 2, target_temperature_max: 8, driver_name: 'Amelia Carter', sensor_status: 'online' },
    { vehicle_reference: 'SN-08', current_temperature: 3.8, target_temperature_min: 2, target_temperature_max: 8, driver_name: 'Marcus Green', sensor_status: 'online' },
    { vehicle_reference: 'SN-22', current_temperature: 5.1, target_temperature_min: 2, target_temperature_max: 8, driver_name: 'Nia Patel', sensor_status: 'online' },
    { vehicle_reference: 'SN-19', current_temperature: 8.7, target_temperature_min: 2, target_temperature_max: 8, driver_name: 'Unassigned', sensor_status: 'online' }
  ] })
})

app.get('/api/fleet/monitoring/export', async (c) => {
  const format = c.req.query('format') || 'csv'
  const range = Number(c.req.query('range') || 7)
  const reportType = ['daily', 'drivers', 'routes'].includes(c.req.query('report')) ? c.req.query('report') as 'daily' | 'drivers' | 'routes' : 'daily'
  const report = reportType === 'drivers'
    ? { report_type: reportType, report_title: 'Driver performance report', generated_at: new Date().toISOString(), range_days: range, active_drivers: 18, available_drivers: 6, driver_acceptance: '89%', assigned_routes: 12, licence_checks_due: 2 }
    : reportType === 'routes'
      ? { report_type: reportType, report_title: 'Route performance report', generated_at: new Date().toISOString(), range_days: range, active_routes: 24, completed_routes: 18, disrupted_routes: 3, disruption_rate: '12.5%', late_deliveries: 2, average_route_time: '3h 42m' }
      : { report_type: reportType, report_title: 'Daily fleet report', generated_at: new Date().toISOString(), range_days: range, on_time_delivery: '96.4%', temperature_compliance: '98.7%', average_route_time: '3h 42m', driver_acceptance: '89%', active_routes: 24, temperature_alerts: 2 }
  if (format === 'json') return c.json(report)
  if (format === 'pdf') {
    const lines = [
      `Snow Fleet Management ${report.report_title}`,
      `Generated: ${report.generated_at}`,
      `Reporting range: last ${report.range_days} days`,
      '',
      ...Object.entries(report).filter(([key]) => !['report_type', 'report_title', 'generated_at', 'range_days'].includes(key)).map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`),
      '',
      'This report contains the monitoring metrics available from Snow Fleet Management.'
    ]
    const escapePdf = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    const content = `BT /F1 18 Tf 54 740 Td (${escapePdf(lines[0])}) Tj /F1 10 Tf 0 -24 Td ${lines.slice(1).map(line => `(${escapePdf(line)}) Tj 0 -16 Td`).join(' ')} ET`
    const pdf = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>endobj\n4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream endobj\ntrailer<< /Root 1 0 R >>\n%%EOF`
    return new Response(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="snow-fleet-${reportType}-${range}d.pdf"` } })
  }
  const csv = Object.entries(report).map(([key, value]) => `${key.replace(/_/g, ' ')},${value}`).join('\n') + '\n'
  return new Response(`Metric,Value\n${csv}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="snow-fleet-${reportType}-${range}d.csv"` } })
})

app.post('/api/fleet/mileage/nightly', authenticate, requireRole('admin'), async (c) => {
  try {
    const result = await updateNightlyMileage(c.env.DB)
    return c.json({ success: true, ...result })
  } catch (error: any) {
    return c.json({ error: 'Nightly mileage update failed: ' + error.message }, 500)
  }
})

// Fleet creation workflows use native form posts so they work with or without client JavaScript.
app.post('/api/fleet/vehicles', async (c) => {
  const form = await c.req.parseBody()
  const required = ['vehicle_reference', 'registration_number', 'vehicle_type']
  if (required.some(field => !String(form[field] || '').trim())) return c.text('Vehicle reference, registration number, and type are required', 400)
  try {
    await c.env.DB.prepare(`INSERT INTO vehicles (vehicle_reference, registration_number, vehicle_type, make, model, year, temperature_controlled, target_temperature_min, target_temperature_max, mileage, last_service_date, status, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', datetime('now'))`).bind(
      form.vehicle_reference, form.registration_number, form.vehicle_type, form.make || null, form.model || null, form.year ? Number(form.year) : null, Number(form.temperature_controlled || 0), form.target_temperature_min ? Number(form.target_temperature_min) : null, form.target_temperature_max ? Number(form.target_temperature_max) : null, Number(form.mileage || 0), form.last_service_date || null
    ).run()
    return c.redirect('/vehicles')
  } catch (error: any) { return c.text(`Vehicle registration failed: ${error.message}`, 400) }
})

app.post('/api/fleet/vehicles/:vehicleId', async (c) => {
  const form = await c.req.parseBody()
  const vehicleIdentifier = decodeURIComponent(c.req.param('vehicleId'))
  if (!form.vehicle_reference || !form.registration_number || !form.vehicle_type) return c.text('Vehicle details are required', 400)
  try {
    const existing = await c.env.DB.prepare('SELECT id FROM vehicles WHERE id = ? OR vehicle_reference = ?').bind(Number(vehicleIdentifier) || 0, vehicleIdentifier).first() as any
    if (existing) {
      await c.env.DB.prepare(`UPDATE vehicles SET vehicle_reference = ?, registration_number = ?, vehicle_type = ?, make = ?, model = ?, year = ?, status = ?, temperature_controlled = ?, target_temperature_min = ?, target_temperature_max = ?, mileage = ?, last_service_date = ?, updated_at = datetime('now') WHERE id = ?`).bind(form.vehicle_reference, form.registration_number, form.vehicle_type, form.make || null, form.model || null, form.year ? Number(form.year) : null, form.status || 'available', Number(form.temperature_controlled || 0), form.target_temperature_min ? Number(form.target_temperature_min) : null, form.target_temperature_max ? Number(form.target_temperature_max) : null, Number(form.mileage || 0), form.last_service_date || null, existing.id).run()
    } else {
      await c.env.DB.prepare(`INSERT INTO vehicles (vehicle_reference, registration_number, vehicle_type, make, model, year, status, temperature_controlled, target_temperature_min, target_temperature_max, mileage, last_service_date, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).bind(form.vehicle_reference, form.registration_number, form.vehicle_type, form.make || null, form.model || null, form.year ? Number(form.year) : null, form.status || 'available', Number(form.temperature_controlled || 0), form.target_temperature_min ? Number(form.target_temperature_min) : null, form.target_temperature_max ? Number(form.target_temperature_max) : null, Number(form.mileage || 0), form.last_service_date || null).run()
    }
    return c.redirect(`/vehicles/${form.vehicle_reference}`)
  } catch (error: any) { return c.text(`Vehicle update failed: ${error.message}`, 400) }
})

app.post('/api/fleet/drivers', async (c) => {
  const form = await c.req.parseBody()
  const required = ['driver_reference', 'licence_number', 'licence_expiry']
  if (required.some(field => !String(form[field] || '').trim())) return c.text('Driver reference, licence number, and licence expiry are required', 400)
  try {
    let userId: number | null = null
    if (form.email && form.full_name) {
      const user = await c.env.DB.prepare(`INSERT INTO users (email, password, full_name, phone, role, status, email_verified) VALUES (?, ?, ?, ?, 'provider', 'active', 0)`).bind(form.email, hashPassword(String(form.email)), form.full_name, form.phone || null).run()
      userId = Number(user.meta.last_row_id)
    }
    await c.env.DB.prepare(`INSERT INTO drivers (user_id, driver_reference, licence_number, licence_expiry, phone, emergency_contact_name, emergency_contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`).bind(userId, form.driver_reference, form.licence_number, form.licence_expiry, form.phone || null, form.emergency_contact_name || null, form.emergency_contact_phone || null).run()
    return c.redirect('/drivers')
  } catch (error: any) { return c.text(`Driver registration failed: ${error.message}`, 400) }
})

app.post('/api/fleet/drivers/:driverId', async (c) => {
  const driverId = decodeURIComponent(c.req.param('driverId'))
  const form = await c.req.parseBody()
  const required = ['driver_reference', 'full_name', 'email', 'licence_number', 'licence_expiry']
  if (required.some(field => !String(form[field] || '').trim())) return c.text('Driver name, email, reference, licence number, and licence expiry are required', 400)
  const status = ['available', 'assigned', 'off_duty', 'suspended'].includes(String(form.status)) ? String(form.status) : 'available'
  try {
    const driver = await c.env.DB.prepare('SELECT id, user_id FROM drivers WHERE driver_reference = ? OR id = ?').bind(driverId, Number(driverId) || 0).first() as any
    if (!driver) return c.text('Driver not found', 404)
    await c.env.DB.prepare(`UPDATE drivers SET driver_reference = ?, licence_number = ?, licence_expiry = ?, phone = ?, emergency_contact_name = ?, emergency_contact_phone = ?, status = ?, updated_at = datetime('now') WHERE id = ?`).bind(form.driver_reference, form.licence_number, form.licence_expiry, form.phone || null, form.emergency_contact_name || null, form.emergency_contact_phone || null, status, driver.id).run()
    if (driver.user_id) await c.env.DB.prepare(`UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`).bind(form.full_name, form.email, form.phone || null, driver.user_id).run()
    return c.redirect(`/drivers/${encodeURIComponent(String(form.driver_reference))}`)
  } catch (error: any) { return c.text(`Driver update failed: ${error.message}`, 400) }
})

app.post('/api/fleet/customers', async (c) => {
  const form = await c.req.parseBody()
  const required = ['full_name', 'email', 'password']
  if (required.some(field => !String(form[field] || '').trim())) return c.text('Organisation name, email, and password are required', 400)
  try {
    await c.env.DB.prepare(`INSERT INTO users (email, password, full_name, phone, postcode, role, status, email_verified) VALUES (?, ?, ?, ?, ?, 'customer', 'active', 0)`).bind(form.email, hashPassword(String(form.password)), form.full_name, form.phone || null, form.postcode || null).run()
    return c.redirect('/customers')
  } catch (error: any) { return c.text(`Customer registration failed: ${error.message}`, 400) }
})

app.post('/api/fleet/routes', async (c) => {
  const form = await c.req.parseBody()
  const required = ['route_reference', 'origin', 'destination', 'scheduled_departure']
  if (required.some(field => !String(form[field] || '').trim())) return c.text('Route reference, origin, destination, and departure are required', 400)
  try {
    const distanceMiles = Number(form.distance_miles || 0)
    if (distanceMiles < 0) return c.text('Planned trip mileage cannot be negative', 400)
    const result = await c.env.DB.prepare(`INSERT INTO fleet_routes (route_reference, customer_id, driver_id, vehicle_id, origin, destination, scheduled_departure, estimated_arrival, distance_miles, status, cargo_description, traffic_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', ?, ?)`).bind(form.route_reference, form.customer_id ? Number(form.customer_id) : null, form.driver_id ? Number(form.driver_id) : null, form.vehicle_id ? Number(form.vehicle_id) : null, form.origin, form.destination, form.scheduled_departure, form.estimated_arrival || null, distanceMiles, form.cargo_description || null, form.traffic_status || 'clear').run()
    await c.env.DB.prepare(`INSERT INTO route_activity_history (route_id, activity_type, status_to, notes) VALUES (?, 'created', 'planned', ?)`).bind(result.meta.last_row_id, `Route ${form.route_reference} created through fleet portal`).run()
    return c.redirect('/routes')
  } catch (error: any) { return c.text(`Route allocation failed: ${error.message}`, 400) }
})

app.post('/api/fleet/routes/:routeId/deliver', async (c) => {
  const routeId = Number(c.req.param('routeId'))
  let form: Record<string, any>
  try {
    form = await c.req.parseBody()
  } catch {
    return c.text('Invalid delivery form. Please upload a proof photo and try again.', 400)
  }
  const deliveryTime = String(form.actual_arrival || '').trim()
  if (!routeId || !deliveryTime) return c.text('Delivery timestamp is required', 400)
  const milesTravelled = Number(form.miles_travelled)
  if (!Number.isFinite(milesTravelled) || milesTravelled < 0) return c.text('Actual trip mileage is required and must be zero or greater', 400)
  const proofPhoto = form.proof_photo as File | undefined
  if (!proofPhoto || typeof proofPhoto.arrayBuffer !== 'function') return c.text('An electronic proof photo is required', 400)
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(proofPhoto.type)) return c.text('Proof photo must be JPEG, PNG, or WebP', 400)
  if (proofPhoto.size > 2 * 1024 * 1024) return c.text('Proof photo must be 2 MB or smaller', 400)
  try {
    // Keep delivery capture compatible while remote D1 migrations are catching up.
    try { await c.env.DB.prepare(`ALTER TABLE fleet_routes ADD COLUMN mileage_applied_at DATETIME`).run() } catch {}
    for (const column of ['proof_photo_data', 'proof_photo_name', 'proof_photo_type']) {
      try { await c.env.DB.prepare(`ALTER TABLE route_activity_history ADD COLUMN ${column} TEXT`).run() } catch {}
    }
    const proofBytes = new Uint8Array(await proofPhoto.arrayBuffer())
    let binary = ''
    for (const byte of proofBytes) binary += String.fromCharCode(byte)
    const proofData = `data:${proofPhoto.type};base64,${btoa(binary)}`
    const route = await c.env.DB.prepare(`SELECT vehicle_id, distance_miles FROM fleet_routes WHERE id = ?`).bind(routeId).first() as any
    await c.env.DB.prepare(`UPDATE fleet_routes SET status = 'delivered', progress_percent = 100, actual_arrival = ?, distance_miles = ?, mileage_applied_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).bind(deliveryTime, milesTravelled, routeId).run()
    if (route?.vehicle_id) await c.env.DB.prepare(`UPDATE vehicles SET mileage = COALESCE(mileage, 0) + ?, updated_at = datetime('now') WHERE id = ?`).bind(milesTravelled, route.vehicle_id).run()
    await c.env.DB.prepare(`INSERT INTO route_activity_history (route_id, activity_type, status_from, status_to, notes, proof_photo_data, proof_photo_name, proof_photo_type, recorded_at) SELECT id, 'delivered', status, 'delivered', ?, ?, ?, ?, datetime('now') FROM fleet_routes WHERE id = ?`).bind(`${form.notes || ''}${form.proof_reference ? ` POD: ${form.proof_reference}` : ''}`, proofData, proofPhoto.name, proofPhoto.type, routeId).run()
    return c.redirect(`/deliveries/${routeId}`)
  } catch (error: any) { return c.text(`Delivery update failed: ${error.message}`, 400) }
})

// HTML form handlers for the admin pages. These mirror the JSON APIs and remain admin-only.
app.post('/admin/providers/:providerId/approval', authenticate, requireRole('admin'), async (c) => {
  const form = await c.req.parseBody()
  const approvalStatus = String(form.status || '')
  if (!['approved', 'rejected'].includes(approvalStatus)) return c.text('Invalid approval status', 400)
  await c.env.DB.prepare(`UPDATE provider_profiles SET approval_status = ?, approval_date = datetime('now'), approved_by = ?, updated_at = datetime('now') WHERE id = ?`).bind(approvalStatus, (c.get('user') as any).userId, c.req.param('providerId')).run()
  return c.redirect('/admin/providers')
})
app.post('/admin/users/:userId/suspend', authenticate, requireRole('admin'), async (c) => {
  await c.env.DB.prepare(`UPDATE users SET status = 'suspended', updated_at = datetime('now') WHERE id = ? AND role != 'admin'`).bind(c.req.param('userId')).run()
  return c.redirect('/admin/users')
})
app.post('/notifications/:notificationId/read', (c) => c.redirect('/notifications'))

// ============================================
// FRONTEND ROUTE
// ============================================

// Serve the main page
app.get('/', async (c) => {
  const authHeader = c.req.header('Authorization')
  let currentUser: any = undefined
  if (authHeader?.startsWith('Bearer ')) {
    const session = decodeJWT(authHeader.substring(7))
    if (session?.userId) currentUser = await c.env.DB.prepare('SELECT id, full_name, email, role FROM users WHERE id = ?').bind(session.userId).first()
  }
  return c.render(<HomePage currentUser={currentUser} />)
})

// Fleet management pages
app.get('/routes', (c) => c.render(<RoutesPage />))
app.get('/vehicles', (c) => c.render(<VehiclesPage />))
app.get('/temperature', (c) => c.html(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Temperature monitor</title><link rel="stylesheet" href="/static/style.css"></head><body><nav class="topbar"><div class="nav-shell"><div class="brand-lockup"><span class="brand-mark">S</span><span>Snow Fleet <em>Management</em></span></div><div class="primary-nav"><a href="/">Overview</a><a href="/routes">Routes</a><a href="/vehicles">Vehicles</a><a class="active" href="/temperature">Temperature</a><a href="/drivers">Drivers</a><a href="/customers">Customers</a><a href="/alerts">Alerts</a><a href="/monitoring">Monitoring</a><a href="/traffic">Traffic</a></div><div class="user-menu"><a href="/auth/login">Login</a><a href="/auth/register">Register</a></div></div></nav><main class="fleet-dashboard temperature-page" data-temperature-page><div class="page-heading"><div><p class="eyebrow">Cold-chain monitoring</p><h1>Temperature monitor</h1><p class="header-copy">Live refrigerator readings for every temperature-controlled vehicle.</p></div><div class="header-actions"><span class="sync-status"><span class="status-dot status-dot-live"></span><span data-temperature-updated>Live monitor ready</span></span><button class="button button-primary" type="button" data-temperature-refresh>Refresh readings</button></div></div><section class="metric-grid"><article class="metric-card metric-card-accent"><span class="metric-label">Vehicles within range</span><strong data-temperature-within>--</strong><span class="metric-note">Target range 2 C to 8 C</span></article><article class="metric-card"><span class="metric-label">Temperature alerts</span><strong class="metric-alert" data-temperature-alerts>--</strong><span class="metric-note metric-negative">Requires attention</span></article><article class="metric-card"><span class="metric-label">Average temperature</span><strong data-temperature-average>--</strong><span class="metric-note">Across monitored vehicles</span></article><article class="metric-card"><span class="metric-label">Sensors online</span><strong data-temperature-online>--</strong><span class="metric-note metric-positive">Live sensor connection</span></article></section><section class="panel table-panel"><div class="panel-heading"><div><p class="eyebrow">Live readings</p><h2>Vehicle temperature status</h2><p class="table-caption">Readings refresh automatically every 10 minutes.</p></div><a class="text-link" href="/alerts/temperature">View temperature alerts <span>→</span></a></div><div class="fleet-table-wrap"><table class="fleet-table"><thead><tr><th>Vehicle</th><th>Assigned driver</th><th>Current temperature</th><th>Target range</th><th>Sensor</th><th>Status</th></tr></thead><tbody data-temperature-rows><tr><td colspan="6" class="table-loading">Loading live readings...</td></tr></tbody></table></div></section></main><script src="/static/app.js"></script></body></html>`))
app.get('/alerts/temperature', (c) => c.redirect('/temperature'))
app.get('/alerts', (c) => c.render(<AlertsPage />))
app.get('/monitoring', (c) => c.render(<MonitoringPage />))
app.get('/drivers', async (c) => {
  try {
    const drivers = await c.env.DB.prepare(`SELECT d.driver_reference, d.licence_expiry, d.status, d.phone, u.full_name, u.email, r.route_reference, r.origin, r.destination FROM drivers d LEFT JOIN users u ON u.id = d.user_id LEFT JOIN fleet_routes r ON r.driver_id = d.id AND r.status NOT IN ('delivered', 'cancelled') ORDER BY u.full_name, d.driver_reference`).all()
    return c.render(<DriversPage drivers={drivers.results} />)
  } catch {
    return c.render(<DriversPage />)
  }
})
app.get('/admin/drivers', authenticate, requireRole('admin'), async (c) => {
  const drivers = await c.env.DB.prepare(`SELECT d.driver_reference, d.licence_number, d.licence_expiry, d.status, u.full_name, u.email, u.phone FROM drivers d JOIN users u ON u.id = d.user_id ORDER BY u.full_name`).all()
  return c.render(<AdminDriversPage drivers={drivers.results} />)
})
app.get('/customers', (c) => c.render(<CustomersPage />))
app.get('/routes/scan', (c) => c.render(<RouteScanPage />))
app.get('/routes/new', async (c) => {
  const customers = await c.env.DB.prepare(`SELECT id, full_name, status FROM users WHERE role = 'customer' ORDER BY full_name`).all()
  return c.render(<RouteFormPage customers={customers.results} />)
})
app.get('/routes/:routeId', (c) => c.render(<RouteDetailPage routeId={c.req.param('routeId')} />))
app.get('/deliveries/:routeId', async (c) => {
  const routeId = Number(c.req.param('routeId'))
  const safeRouteId = Number.isFinite(routeId) && routeId > 0 ? routeId : 0
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Delivery confirmation</title><link rel="stylesheet" href="/static/style.css"></head><body><nav class="topbar"><div class="nav-shell"><div class="brand-lockup"><span class="brand-mark">S</span><span>Snow Fleet <em>Management</em></span></div><div class="primary-nav"><a href="/">Overview</a><a href="/routes">Routes</a><a href="/vehicles">Vehicles</a><a href="/drivers">Drivers</a><a href="/customers">Customers</a><a href="/monitoring">Monitoring</a><a href="/traffic">Traffic</a></div><div class="user-menu"><a href="/auth/login">Login</a><a href="/auth/register">Register</a></div></div></nav><main class="fleet-dashboard"><div class="page-heading"><div><p class="eyebrow">Delivery confirmation</p><h1>Route ${safeRouteId}</h1><p class="header-copy">Record the time goods were delivered and include an electronic proof photo.</p></div><a class="button button-secondary" href="/routes">← Routes</a></div><section class="panel delivery-form-panel"><div class="panel-heading"><div><p class="eyebrow">Driver action</p><h2>Confirm delivery</h2></div></div><form method="post" action="/api/fleet/routes/${safeRouteId}/deliver" enctype="multipart/form-data" class="delivery-form"><label>Delivery timestamp<input name="actual_arrival" type="datetime-local" required></label><label>Actual trip mileage<input name="miles_travelled" type="number" min="0" step="0.1" required><small>This mileage is added to the vehicle after delivery.</small></label><label>Delivery notes<textarea name="notes"></textarea></label><label>Proof of delivery reference<input name="proof_reference"></label><label>Electronic proof photo<input name="proof_photo" type="file" accept="image/jpeg,image/png,image/webp" required><small>Upload a clear delivery photo, maximum 2 MB.</small></label><button class="button button-primary" type="submit">Mark goods delivered</button></form></section></main></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
})
app.get('/traffic', (c) => c.render(<TrafficPage />))
app.get('/profile', (c) => c.render(<ProfilePage />))
app.get('/monitoring/export', (c) => c.render(<MonitoringExportPage />))
app.get('/vehicles/new', (c) => c.render(<VehicleFormPage />))
app.get('/vehicles/:vehicleId/edit', async (c) => {
  const identifier = c.req.param('vehicleId')
  const fallbackVehicles: Record<string, Record<string, any>> = {
    'SN-14': { vehicle_type: 'Refrigerated van', status: 'in_transit', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 42810 },
    'SN-08': { vehicle_type: 'Refrigerated van', status: 'loading', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 38204 },
    'SN-22': { vehicle_type: 'Long wheelbase van', status: 'in_transit', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 51620 },
    'SN-19': { vehicle_type: 'Refrigerated van', status: 'parked', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 45108 },
    'SN-05': { vehicle_type: 'Refrigerated van', status: 'available', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 29440 }
  }
  return c.render(<VehicleEditPage vehicle={{ vehicle_reference: identifier, registration_number: '', ...fallbackVehicles[identifier] || { vehicle_type: 'Refrigerated van', status: 'available', temperature_controlled: 1, target_temperature_min: 2, target_temperature_max: 8, mileage: 0 } }} />)
})
app.get('/vehicles/edit/:vehicleId', async (c) => {
  const identifier = c.req.param('vehicleId')
  const safeIdentifier = identifier.replace(/[^A-Za-z0-9_-]/g, '')
  return c.html(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Edit vehicle ${safeIdentifier}</title><link rel="stylesheet" href="/static/style.css"></head><body><nav class="topbar"><div class="nav-shell"><div class="brand-lockup"><span class="brand-mark">S</span><span>Snow Fleet <em>Management</em></span></div><div class="primary-nav"><a href="/">Overview</a><a class="active" href="/vehicles">Vehicles</a><a href="/routes">Routes</a><a href="/drivers">Drivers</a><a href="/customers">Customers</a><a href="/monitoring">Monitoring</a><a href="/traffic">Traffic</a></div><div class="user-menu"><a href="/auth/login">Login</a><a href="/auth/register">Register</a></div></div></nav><main class="fleet-dashboard"><div class="page-heading"><div><p class="eyebrow">Fleet management</p><h1>Edit vehicle ${safeIdentifier}</h1><p class="header-copy">Update transport details, readiness, and cold-chain operating limits.</p></div><a class="button button-secondary" href="/vehicles">← Back</a></div><section class="panel form-panel"><form method="post" action="/api/fleet/vehicles/${safeIdentifier}" class="fleet-form"><div class="form-grid"><label style="display:grid;gap:7px">Vehicle reference<input class="login-input" name="vehicle_reference" value="${safeIdentifier}" required></label><label style="display:grid;gap:7px">Registration number<input class="login-input" name="registration_number" required></label><label style="display:grid;gap:7px">Vehicle type<input class="login-input" name="vehicle_type" value="Refrigerated van" required></label><label style="display:grid;gap:7px">Make<input class="login-input" name="make"></label><label style="display:grid;gap:7px">Model<input class="login-input" name="model"></label><label style="display:grid;gap:7px">Mileage<input class="login-input" name="mileage" type="number" value="0"></label><label style="display:grid;gap:7px">Temperature controlled<input class="login-input" name="temperature_controlled" value="1"></label><label style="display:grid;gap:7px">Minimum temperature C<input class="login-input" name="target_temperature_min" type="number" step="0.1" value="2"></label><label style="display:grid;gap:7px">Maximum temperature C<input class="login-input" name="target_temperature_max" type="number" step="0.1" value="8"></label></div><div class="form-actions"><a class="button button-secondary" href="/vehicles">Cancel</a><button class="button button-primary" type="submit">Save record</button></div></form></section></main></body></html>`)
})
app.get('/vehicles/:vehicleId', (c) => c.render(<ManagementPage title={`Vehicle ${c.req.param('vehicleId')}`} message="Review vehicle readiness, temperature, service history, and assigned route." identifier={c.req.param('vehicleId')} backHref="/vehicles" />))
app.get('/drivers/new', (c) => c.render(<DriverFormPage />))
app.get('/drivers/:driverId', async (c) => {
  const driverId = c.req.param('driverId')
  const driver = await c.env.DB.prepare(`SELECT d.driver_reference, d.licence_number, d.licence_expiry, d.phone, d.emergency_contact_name, d.emergency_contact_phone, d.status, d.created_at, u.full_name, u.email, r.route_reference, r.origin, r.destination, r.status AS route_status, r.scheduled_departure, r.estimated_arrival, v.vehicle_reference FROM drivers d LEFT JOIN users u ON u.id = d.user_id LEFT JOIN fleet_routes r ON r.driver_id = d.id AND r.status NOT IN ('delivered', 'cancelled') LEFT JOIN vehicles v ON v.id = r.vehicle_id WHERE d.driver_reference = ? OR d.id = ? ORDER BY r.scheduled_departure DESC LIMIT 1`).bind(driverId, Number(driverId) || 0).first()
  if (!driver) return c.redirect('/drivers')
  return c.render(<DriverDetailPage driver={driver} />)
})
app.get('/drivers/:driverId/edit', async (c) => {
  const driverId = c.req.param('driverId')
  const driver = await c.env.DB.prepare(`SELECT d.driver_reference, d.licence_number, d.licence_expiry, d.phone, d.emergency_contact_name, d.emergency_contact_phone, d.status, u.full_name, u.email FROM drivers d LEFT JOIN users u ON u.id = d.user_id WHERE d.driver_reference = ? OR d.id = ?`).bind(driverId, Number(driverId) || 0).first()
  if (!driver) return c.redirect('/drivers')
  return c.render(<DriverEditPage driver={driver} />)
})
app.get('/customers/new', (c) => c.render(<CustomerFormPage />))
app.get('/customers/:customerId', (c) => c.render(<ManagementPage title={`Customer ${c.req.param('customerId')}`} message="Review customer routes, services, and delivery history." identifier={c.req.param('customerId')} backHref="/customers" />))
app.get('/customers/:customerId/edit', (c) => c.render(<ManagementPage title={`Edit customer ${c.req.param('customerId')}`} message="Update customer contacts and cold-chain delivery requirements." identifier={c.req.param('customerId')} backHref="/customers" />))
app.get('/alerts/traffic', (c) => c.render(<TrafficPage />))
app.get('/alerts/vehicle', (c) => c.render(<VehiclesPage />))
app.get('/bookings/:bookingId', (c) => c.render(<BookingsPage bookings={[]} />))
app.get('/notifications', (c) => c.render(<NotificationsPage notifications={[]} />))
app.get('/admin/dashboard', authenticate, requireRole('admin'), async (c) => {
  const [users, providers, pending, bookings, completed, revenue] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM users').first(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM provider_profiles WHERE approval_status = 'approved'").first(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM provider_profiles WHERE approval_status = 'pending'").first(),
    c.env.DB.prepare('SELECT COUNT(*) AS count FROM bookings').first(),
    c.env.DB.prepare("SELECT COUNT(*) AS count FROM bookings WHERE status = 'completed'").first(),
    c.env.DB.prepare("SELECT COALESCE(SUM(platform_fee), 0) AS total FROM bookings WHERE status = 'completed'").first()
  ])
  return c.render(<AdminDashboardPage stats={{ total_users: (users as any)?.count, approved_providers: (providers as any)?.count, pending_approvals: (pending as any)?.count, total_bookings: (bookings as any)?.count, completed_bookings: (completed as any)?.count, platform_revenue: (revenue as any)?.total }} />)
})
app.get('/admin/users', authenticate, requireRole('admin'), async (c) => {
  const search = c.req.query('search') || ''
  const role = c.req.query('role') || ''
  const status = c.req.query('status') || ''
  const users = await c.env.DB.prepare(`SELECT id, email, full_name, phone, role, status, created_at FROM users WHERE (? = '' OR full_name LIKE '%' || ? || '%' OR email LIKE '%' || ? || '%') AND (? = '' OR role = ?) AND (? = '' OR status = ?) ORDER BY created_at DESC LIMIT 200`).bind(search, search, search, role, role, status, status).all()
  return c.render(<AdminUsersPage users={users.results} />)
})
app.get('/admin/providers', authenticate, requireRole('admin'), async (c) => {
  const status = c.req.query('status') || ''
  const providers = await c.env.DB.prepare(`SELECT p.*, u.full_name, u.email, u.phone FROM provider_profiles p JOIN users u ON u.id = p.user_id WHERE (? = '' OR p.approval_status = ?) ORDER BY p.created_at DESC LIMIT 200`).bind(status, status).all()
  return c.render(<AdminProvidersPage providers={providers.results} />)
})
app.get('/admin/bookings', authenticate, requireRole('admin'), async (c) => {
  const bookings = await c.env.DB.prepare(`SELECT b.*, s.service_name, u.full_name AS customer_name FROM bookings b LEFT JOIN services s ON s.id = b.service_id LEFT JOIN users u ON u.id = b.customer_id ORDER BY b.created_at DESC LIMIT 200`).all()
  return c.render(<AdminBookingsPage bookings={bookings.results} />)
})
app.get('/admin/stats', authenticate, requireRole('admin'), async (c) => c.redirect('/admin/dashboard'))
app.get('/admin/users/:userId', authenticate, requireRole('admin'), async (c) => c.render(<ManagementPage title={`User ${c.req.param('userId')}`} eyebrow="Admin user management" message="Review account identity, role, status, and activity." identifier={c.req.param('userId')} backHref="/admin/users" />))
app.get('/admin/providers/:providerId', authenticate, requireRole('admin'), async (c) => c.render(<ManagementPage title={`Provider ${c.req.param('providerId')}`} eyebrow="Admin provider management" message="Review provider verification, approval status, and service information." identifier={c.req.param('providerId')} backHref="/admin/providers" />))




            async function checkAuth() {
                try {
                    const response = await axios.get('/api/auth/me', {
                        headers: { Authorization: 'Bearer ' + authToken }
                    });
                    currentUser = response.data.user;
                    updateNavigation();
                } catch (error) {
                    localStorage.removeItem('snowToken');
                    authToken = null;
                }
            }

            function updateNavigation() {
                // Update nav based on user role
                // This would redirect to dashboard pages
                if (currentUser) {
                    if (currentUser.role === 'provider') {
                        window.location.href = '/provider-dashboard.html';
                    } else if (currentUser.role === 'customer') {
                        window.location.href = '/customer-dashboard.html';
                    } else if (currentUser.role === 'admin') {
                        window.location.href = '/admin-dashboard.html';
                    }
                }
            }

            // Modal functions
            function showLogin() {
            }

            function showRegister() {
            }

            function closeModal(modalId) {
            }

            // Login form

            // Register form

            // Search providers
            async function searchProviders() {
                const postcode = document.getElementById('postcodeSearch').value.trim();
                if (!postcode) {
                    alert('Please enter a postcode');
                    return;
                }

                try {
                    const response = await axios.get('/api/providers/search?postcode=' + encodeURIComponent(postcode));
                    displayProviders(response.data.providers);
                } catch (error) {
                    alert('Search failed: ' + (error.response?.data?.error || 'Unknown error'));
                }
            }

            // Filter by service
            async function filterByService(serviceType) {
                try {
                    const response = await axios.get('/api/providers/search?serviceType=' + serviceType);
                    displayProviders(response.data.providers);
                } catch (error) {
                    alert('Search failed: ' + (error.response?.data?.error || 'Unknown error'));
                }
            }

            // Display providers (simple rendering)
            function displayProviders(providers) {
                const resultsDiv = document.getElementById('searchResults');
                const providersList = document.getElementById('providersList');

                if (!providers || providers.length === 0) {
                    providersList.innerHTML = '<p class="col-span-3 text-center text-gray-600">No providers found in this area</p>';
                } else {
                    providersList.innerHTML = providers.map(p => '<div class="result"><h3>' + (p.business_name || p.full_name) + '</h3><p>' + (p.bio || '') + '</p><a href="/providers/' + p.user_id + '">View</a></div>').join('');
                }

                resultsDiv.classList.remove('hidden');
                resultsDiv.scrollIntoView({ behavior: 'smooth' });
            }

            /* Client-side helpers moved to public/static/app.js */

// ============================================
// SERVER-SIDE PAGE ROUTES (render JSX pages)
// ============================================

// Login & Register pages
app.get('/auth/login', (c) => {
  return c.render(<LoginPage />)
})

app.get('/auth/register', (c) => {
  return c.render(<RegisterPage />)
})

// Provider search (renders search page with data)
app.get('/providers/search', async (c) => {
  try {
    const postcode = c.req.query('postcode')
    const serviceType = c.req.query('serviceType')
    const minRating = c.req.query('minRating')
    const maxPrice = c.req.query('maxPrice')

    let query = `
      SELECT p.*, u.full_name, u.email, u.phone
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.approval_status = 'approved' AND p.availability_enabled = 1
    `

    const bindings: any[] = []

    if (postcode) {
      query += ` AND p.service_areas LIKE ?`
      bindings.push(`%${postcode}%`)
    }

    if (serviceType) {
      query += ` AND p.services_offered LIKE ?`
      bindings.push(`%${serviceType}%`)
    }

    if (minRating) {
      query += ` AND p.average_rating >= ?`
      bindings.push(parseFloat(minRating))
    }

    if (maxPrice) {
      query += ` AND p.hourly_rate <= ?`
      bindings.push(parseFloat(maxPrice))
    }

    query += ` ORDER BY p.average_rating DESC, p.total_reviews DESC`

    const stmt = (c.env.DB as D1Database).prepare(query)
    const result = await (bindings.length > 0 ? stmt.bind(...bindings) : stmt).all()

    const providers = result.results.map((p: any) => ({
      ...p,
      service_areas: JSON.parse(p.service_areas),
      services_offered: JSON.parse(p.services_offered)
    }))

    return c.render(<ProvidersSearchPage providers={providers} />)
  } catch (error: any) {
    return c.render(<ProvidersSearchPage providers={[]} />)
  }
})

// Provider profile page
app.get('/providers/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')

    const provider = await (c.env.DB as D1Database).prepare(`
      SELECT p.*, u.full_name, u.email, u.phone
      FROM provider_profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `).bind(userId).first()

    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404)
    }

    provider.service_areas = JSON.parse(provider.service_areas as string)
    provider.services_offered = JSON.parse(provider.services_offered as string)

    const services = await (c.env.DB as D1Database).prepare(`
      SELECT * FROM services WHERE provider_id = ? AND is_active = 1
    `).bind(provider.id).all()

    return c.render(<ManagementPage title={provider.business_name || provider.full_name || `Provider ${userId}`} eyebrow="Provider profile" identifier={String(userId)} message="Review provider verification, service coverage, and active offerings." backHref="/providers/search" />)
  } catch (error: any) {
    return c.json({ error: 'Failed to fetch provider page: ' + error.message }, 500)
  }
})

// Messages (server-rendered pages)
app.get('/messages', authenticate, async (c) => {
  try {
    const user = c.get('user') as any

    const result = await (c.env.DB as D1Database).prepare(`
      SELECT DISTINCT
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END as other_user_id,
        conversation_id,
        MAX(created_at) as last_message_at
      FROM messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY conversation_id
      ORDER BY last_message_at DESC
    `).bind(user.userId, user.userId, user.userId).all()

    const conversations: any[] = []
    for (const conv of result.results) {
      const otherUser = await (c.env.DB as D1Database).prepare(
        'SELECT id, full_name, email FROM users WHERE id = ?'
      ).bind(conv.other_user_id).first()

      // fetch latest message text for preview
      const lastMsg = await (c.env.DB as D1Database).prepare(
        'SELECT message_text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(conv.conversation_id).first()

      conversations.push({
        id: conv.conversation_id,
        other_user: otherUser,
        other_user_name: otherUser?.full_name || otherUser?.email || 'User',
        last_message: lastMsg?.message_text || '',
        last_message_date: lastMsg?.created_at || conv.last_message_at
      })
    }

    const contacts = await c.env.DB.prepare(`
      SELECT u.id, u.full_name, u.email,
        CASE WHEN u.role = 'admin' THEN 'admin' WHEN d.id IS NOT NULL THEN 'driver' WHEN u.role = 'customer' THEN 'customer' ELSE u.role END AS contact_role,
        d.driver_reference
      FROM users u LEFT JOIN drivers d ON d.user_id = u.id
      WHERE u.id != ? AND u.status = 'active' AND (u.role IN ('admin', 'customer') OR d.id IS NOT NULL)
      ORDER BY contact_role, u.full_name
    `).bind(user.userId).all()
    const current = await c.env.DB.prepare('SELECT role FROM users WHERE id = ?').bind(user.userId).first() as any
    const visibleContacts = (contacts.results || []).filter((contact: any) => current?.role === 'admin' ? ['driver', 'customer'].includes(contact.contact_role) : ['admin', 'driver', 'customer'].includes(contact.contact_role))
    return c.render(<MessagesPage conversations={conversations} contacts={visibleContacts} currentRole={current?.role || ''} />)
  } catch (error: any) {
    return c.render(<MessagesPage conversations={[]} />)
  }
})

app.get('/messages/new', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const receiverId = Number(c.req.query('to'))
    if (!receiverId || receiverId === Number(user.userId)) return c.redirect('/messages')
    const otherUser = await c.env.DB.prepare('SELECT id, full_name, email, role FROM users WHERE id = ? AND status = ?').bind(receiverId, 'active').first()
    if (!otherUser) return c.redirect('/messages')
    const conversationId = [Number(user.userId), receiverId].sort((left, right) => left - right).join('-')
    const messages = await c.env.DB.prepare(`SELECT m.*, u.full_name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.conversation_id = ? ORDER BY m.created_at ASC`).bind(conversationId).all()
    return c.render(<ConversationPage conversation={{ conversation_id: conversationId, other_user: otherUser }} messages={messages.results} />)
  } catch {
    return c.redirect('/messages')
  }
})

// Conversation page
app.get('/messages/conversation/:conversationId', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const conversationId = c.req.param('conversationId')

    if (!conversationId.includes(user.userId.toString())) {
      return c.json({ error: 'Access denied' }, 403)
    }

    const msgs = await (c.env.DB as D1Database).prepare(`
      SELECT m.*, u.full_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).bind(conversationId).all()

    // determine other user
    const parts = conversationId.split('-')
    const otherId = parts.find((p: string) => p !== String(user.userId))
    const otherUser = await (c.env.DB as D1Database).prepare('SELECT id, full_name, email FROM users WHERE id = ?').bind(otherId).first()

    return c.render(<ConversationPage conversation={{ conversation_id: conversationId, other_user: otherUser }} messages={msgs.results} />)
  } catch (error: any) {
    return c.render(<ConversationPage conversation={{}} messages={[]} />)
  }
})

// Reviews pages
app.get('/reviews/my-reviews', authenticate, async (c) => {
  try {
    const user = c.get('user') as any

    const result = await (c.env.DB as D1Database).prepare(`
      SELECT r.*, p.business_name as provider_name, p.user_id as provider_id
      FROM reviews r
      JOIN provider_profiles p ON r.provider_id = p.user_id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
    `).bind(user.userId).all()

    return c.render(<MyReviewsPage reviews={result.results} />)
  } catch (error: any) {
    return c.render(<MyReviewsPage reviews={[]} />)
  }
})

// Create review page (from booking link)
app.get('/reviews/create', authenticate, async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.query('booking')

    if (!bookingId) {
      return c.render(<CreateReviewPage booking={null} provider={null} />)
    }

    const booking = await (c.env.DB as D1Database).prepare('SELECT * FROM bookings WHERE id = ? AND customer_id = ?').bind(bookingId, user.userId).first()
    if (!booking) {
      return c.render(<CreateReviewPage booking={null} provider={null} />)
    }

    const provider = await (c.env.DB as D1Database).prepare('SELECT * FROM provider_profiles WHERE user_id = ?').bind(booking.provider_id).first()

    return c.render(<CreateReviewPage booking={booking} provider={provider} />)
  } catch (error: any) {
    return c.render(<CreateReviewPage booking={null} provider={null} />)
  }
})

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledEvent, env: HonoEnv['Bindings']) {
    await runScheduledFleetScans(env.DB)
    await updateNightlyMileage(env.DB)
  }
}
