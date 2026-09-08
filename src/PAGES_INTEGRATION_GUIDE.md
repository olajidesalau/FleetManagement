/**
 * PAGE INTEGRATION GUIDE
 * 
 * This file shows how to integrate all the pages into your main src/index.tsx
 * Copy and paste these route handlers into your Hono app in index.tsx
 * 
 * Pages are located in: src/pages/
 * Components are located in: src/components/
 */

// ============================================
// IMPORT STATEMENTS (add to top of src/index.tsx)
// ============================================

/*
import { HomePage } from './pages'
import { ProvidersSearchPage } from './pages'
import { ProviderProfilePage } from './pages'
import { BookingsPage } from './pages'
import { MessagesPage } from './pages'
import { NotificationsPage } from './pages'
import { AdminDashboardPage } from './pages'
import { AdminUsersPage } from './pages'
import { AdminProvidersPage } from './pages'
import { AdminBookingsPage } from './pages'
import { LoginPage } from './pages'
import { RegisterPage } from './pages'
import { Navigation } from './components/Navigation'
*/

// ============================================
// PUBLIC PAGES (No Authentication Required)
// ============================================

/*
// Home page
app.get('/', (c) => {
  return c.html(<HomePage />)
})

// Login page
app.get('/auth/login', (c) => {
  return c.html(<LoginPage />)
})

// Register page
app.get('/auth/register', (c) => {
  return c.html(<RegisterPage />)
})

// Provider search
app.get('/providers/search', async (c) => {
  const postcode = c.req.query('postcode')
  const serviceType = c.req.query('serviceType')
  const minRating = c.req.query('minRating')
  const maxPrice = c.req.query('maxPrice')
  
  // Call your /api/providers/search endpoint to get data
  const providers = await c.env.DB.prepare(`
    SELECT p.*, u.full_name, u.email, u.phone
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.approval_status = 'approved'
  `).all()
  
  return c.html(<ProvidersSearchPage providers={providers.results} />)
})

// Provider profile
app.get('/providers/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  const provider = await c.env.DB.prepare(`
    SELECT p.*, u.full_name, u.email, u.phone
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `).bind(userId).first()
  
  const services = await c.env.DB.prepare(`
    SELECT * FROM services WHERE provider_id = ?
  `).bind(userId).all()
  
  return c.html(
    <ProviderProfilePage provider={provider} services={services.results} />
  )
})
*/

// ============================================
// CUSTOMER PAGES (Requires customer role)
// ============================================

/*
app.get('/bookings/customer', authenticate, requireRole('customer'), async (c) => {
  const user = c.get('user')
  
  const bookings = await c.env.DB.prepare(`
    SELECT b.*, s.service_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE b.customer_id = ?
    ORDER BY b.booking_date DESC
  `).bind(user.userId).all()
  
  return c.html(<BookingsPage bookings={bookings.results} userRole="customer" />)
})

app.get('/messages', authenticate, async (c) => {
  const user = c.get('user')
  
  const conversations = await c.env.DB.prepare(`
    SELECT DISTINCT m.*, u.full_name as other_user_name
    FROM messages m
    JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.created_at DESC
  `).bind(user.userId, user.userId).all()
  
  return c.html(<MessagesPage conversations={conversations.results} />)
})

app.get('/notifications', authenticate, async (c) => {
  const user = c.get('user')
  
  const notifications = await c.env.DB.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.userId).all()
  
  return c.html(<NotificationsPage notifications={notifications.results} />)
})
*/

// ============================================
// PROVIDER PAGES (Requires provider role)
// ============================================

/*
app.get('/providers/profile', authenticate, requireRole('provider'), async (c) => {
  const user = c.get('user')
  
  const provider = await c.env.DB.prepare(`
    SELECT p.*, u.full_name, u.email, u.phone
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `).bind(user.userId).first()
  
  const services = await c.env.DB.prepare(`
    SELECT * FROM services WHERE provider_id = ?
  `).bind(provider.id).all()
  
  return c.html(
    <ProviderProfilePage provider={provider} services={services.results} />
  )
})

app.get('/bookings/provider', authenticate, requireRole('provider'), async (c) => {
  const user = c.get('user')
  
  const provider = await c.env.DB.prepare(
    'SELECT id FROM provider_profiles WHERE user_id = ?'
  ).bind(user.userId).first()
  
  const bookings = await c.env.DB.prepare(`
    SELECT b.*, s.service_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    WHERE s.provider_id = ?
    ORDER BY b.booking_date DESC
  `).bind(provider.id).all()
  
  return c.html(<BookingsPage bookings={bookings.results} userRole="provider" />)
})
*/

// ============================================
// ADMIN PAGES (Requires admin role)
// ============================================

/*
app.get('/admin/dashboard', authenticate, requireRole('admin'), async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM provider_profiles WHERE approval_status = 'approved') as approved_providers,
      (SELECT COUNT(*) FROM provider_profiles WHERE approval_status = 'pending') as pending_approvals,
      (SELECT COUNT(*) FROM bookings) as total_bookings,
      (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
      (SELECT COALESCE(SUM(platform_fee), 0) FROM payments WHERE status = 'completed') as platform_revenue
  `).first()
  
  return c.html(<AdminDashboardPage stats={stats} />)
})

app.get('/admin/users', authenticate, requireRole('admin'), async (c) => {
  const users = await c.env.DB.prepare(`
    SELECT * FROM users
    ORDER BY created_at DESC
  `).all()
  
  return c.html(<AdminUsersPage users={users.results} />)
})

app.get('/admin/providers', authenticate, requireRole('admin'), async (c) => {
  const providers = await c.env.DB.prepare(`
    SELECT p.*, u.full_name
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `).all()
  
  return c.html(<AdminProvidersPage providers={providers.results} />)
})

app.get('/admin/bookings', authenticate, requireRole('admin'), async (c) => {
  const bookings = await c.env.DB.prepare(`
    SELECT b.*, s.service_name,
           c.full_name as customer_name,
           p.full_name as provider_name
    FROM bookings b
    JOIN services s ON b.service_id = s.id
    JOIN users c ON b.customer_id = c.id
    JOIN provider_profiles pr ON s.provider_id = pr.id
    JOIN users p ON pr.user_id = p.id
    ORDER BY b.created_at DESC
  `).all()
  
  return c.html(<AdminBookingsPage bookings={bookings.results} />)
})
*/

// ============================================
// ADDING NAVIGATION TO LAYOUT
// ============================================

/*
// Wrap your pages with navigation by using a layout component
// You can modify your renderer.tsx to include navigation:

import { Navigation } from './components/Navigation'

// Option 1: Modify your JSX renderer to include navigation on all pages
app.use('*', async (c, next) => {
  // Get current user from token if authenticated
  const currentUser = c.get('user') // set by authenticate middleware
  c.set('currentUser', currentUser)
  await next()
})

// Option 2: Or add Navigation component individually to pages
// When rendering a page, wrap it:
return c.html(
  <>
    <Navigation currentUser={user} />
    <ProvidersSearchPage providers={providers} />
  </>
)
*/

// ============================================
// API ENDPOINTS (Already in src/index.tsx)
// ============================================

/*
These API endpoints should already be in your src/index.tsx:
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/me
- GET /api/providers/search
- GET /api/providers/:userId
- PUT /api/providers/profile
- GET /api/services/provider/:providerId
- GET /api/services/:serviceId
- POST /api/services
- GET /api/bookings/customer
- GET /api/bookings/provider
- GET /api/bookings/:bookingId
- PATCH /api/bookings/:bookingId/status
- POST /api/bookings/:bookingId/cancel
- POST /api/messages
- GET /api/messages/conversations
- GET /api/messages/conversation/:id
- GET /api/notifications
- PATCH /api/notifications/:id/read
- POST /api/notifications/read-all
- GET /api/admin/users
- GET /api/admin/providers
- PATCH /api/admin/providers/:id/approval
- GET /api/admin/bookings
- GET /api/admin/stats
*/

// ============================================
// STYLING
// ============================================

/*
The pages use inline styles. For better maintainability, you can:
1. Extract inline styles to CSS classes in public/static/style.css
2. Use Tailwind CSS (already in dependencies)
3. Create a CSS-in-JS solution

Example CSS for buttons:
.btn-primary {
  background: #4db8ff;
  color: black;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
*/

export default {}
