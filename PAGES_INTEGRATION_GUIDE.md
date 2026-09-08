# Pages Integration Guide

## Overview
This guide details how to integrate the 12 page components into the main src/index.tsx Hono application.

---

## Import All Pages

Add the following imports at the top of src/index.tsx:

```typescript
// Pages
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProvidersSearchPage } from './pages/ProvidersSearchPage'
import { ProviderProfilePage } from './pages/ProviderProfilePage'
import { BookingsPage } from './pages/BookingsPage'
import { MessagesPage } from './pages/MessagesPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminProvidersPage } from './pages/AdminProvidersPage'
import { AdminBookingsPage } from './pages/AdminBookingsPage'

// Components
import { Navigation } from './components/Navigation'
```

---

## Route Handlers for Pages

Add these route handlers to your Hono app in src/index.tsx:

### Public Pages

```typescript
// Home page
app.get('/', (c) => {
  return c.html(renderToString(<HomePage />))
})

// Authentication pages
app.get('/login', (c) => {
  return c.html(renderToString(<LoginPage />))
})

app.get('/register', (c) => {
  return c.html(renderToString(<RegisterPage />))
})

// Provider search (public)
app.get('/providers/search', (c) => {
  return c.html(renderToString(<ProvidersSearchPage />))
})

// Provider profile (public)
app.get('/providers/:id', (c) => {
  const id = c.req.param('id')
  // TODO: Fetch provider data from DB
  return c.html(renderToString(<ProviderProfilePage />))
})
```

### Customer Pages (requires auth + customer role)

```typescript
// Customer bookings
app.get('/bookings/customer', (c) => {
  // TODO: Fetch customer bookings from DB
  const bookings = [] // Replace with actual data
  return c.html(renderToString(<BookingsPage bookings={bookings} userRole="customer" />))
})

// Messages
app.get('/messages', (c) => {
  // TODO: Fetch conversations from DB
  const conversations = [] // Replace with actual data
  return c.html(renderToString(<MessagesPage conversations={conversations} />))
})

// Notifications
app.get('/notifications', (c) => {
  // TODO: Fetch notifications from DB
  const notifications = [] // Replace with actual data
  return c.html(renderToString(<NotificationsPage notifications={notifications} />))
})
```

### Provider Pages (requires auth + provider role)

```typescript
// Provider profile management
app.get('/providers/profile', (c) => {
  // TODO: Fetch current provider profile from DB
  return c.html(renderToString(<ProviderProfilePage />))
})

// Provider bookings
app.get('/bookings/provider', (c) => {
  // TODO: Fetch provider bookings from DB
  const bookings = [] // Replace with actual data
  return c.html(renderToString(<BookingsPage bookings={bookings} userRole="provider" />))
})
```

### Admin Pages (requires auth + admin role)

```typescript
// Admin dashboard
app.get('/admin/dashboard', (c) => {
  // TODO: Fetch stats from DB
  const stats = {} // Replace with actual data
  return c.html(renderToString(<AdminDashboardPage stats={stats} />))
})

// User management
app.get('/admin/users', (c) => {
  // TODO: Fetch users from DB
  const users = [] // Replace with actual data
  return c.html(renderToString(<AdminUsersPage users={users} />))
})

// Provider approval
app.get('/admin/providers', (c) => {
  // TODO: Fetch providers from DB
  const providers = [] // Replace with actual data
  return c.html(renderToString(<AdminProvidersPage providers={providers} />))
})

// Bookings overview
app.get('/admin/bookings', (c) => {
  // TODO: Fetch bookings from DB
  const bookings = [] // Replace with actual data
  return c.html(renderToString(<AdminBookingsPage bookings={bookings} />))
})
```

---

## Navigation Integration

Include the Navigation component in your layout:

```typescript
// Add to a layout wrapper function
const Layout = (content: JSX.Element, currentUser?: any) => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Snow Fleet Management</title>
        <link rel="stylesheet" href="/static/style.css" />
      </head>
      <body>
        <Navigation currentUser={currentUser} />
        <main>{content}</main>
      </body>
    </html>
  )
}

// Use in routes:
app.get('/', (c) => {
  const html = Layout(<HomePage />, c.get('user'))
  return c.html(renderToString(html))
})
```

---

## Database Queries Example

For each page, you'll need to query the database:

```typescript
// Example: Fetch providers for search page
app.get('/providers/search', async (c) => {
  try {
    const db = c.env.DB
    
    // Get query parameters
    const postcode = c.req.query('postcode') || ''
    const service = c.req.query('service') || ''
    const minRating = parseInt(c.req.query('minRating') || '0')
    
    // Build query
    let query = 'SELECT * FROM provider_profiles WHERE 1=1'
    const params: any[] = []
    
    if (postcode) {
      query += ' AND postcode LIKE ?'
      params.push(`${postcode}%`)
    }
    if (service) {
      query += ' AND services_offered LIKE ?'
      params.push(`%${service}%`)
    }
    if (minRating > 0) {
      query += ' AND average_rating >= ?'
      params.push(minRating)
    }
    
    const providers = await db.prepare(query).bind(...params).all()
    
    return c.html(renderToString(<ProvidersSearchPage providers={providers.results} />))
  } catch (error) {
    return c.json({ error: 'Failed to fetch providers' }, 500)
  }
})
```

---

## Form Handling Example

Pages contain forms that submit to API endpoints. Example handler:

```typescript
// Login API endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body
    
    // Validate
    if (!email || !password) {
      return c.json({ error: 'Missing credentials' }, 400)
    }
    
    // Query database
    const db = c.env.DB
    const user = await db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Verify password with bcrypt
    const bcrypt = require('bcrypt')
    const valid = await bcrypt.compare(password, user.password_hash)
    
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Create JWT token
    const jose = require('jose')
    const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'dev-secret')
    const token = await jose.SignJWT({ user_id: user.id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)
    
    return c.json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 500)
  }
})
```

---

## Auth Middleware

Create middleware to protect routes:

```typescript
// Authentication middleware
const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const jose = require('jose')
    const secret = new TextEncoder().encode(c.env.JWT_SECRET || 'dev-secret')
    const { payload } = await jose.jwtVerify(token, secret)
    c.set('user', payload)
    await next()
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

// Role middleware
const requireRole = (roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  }
}

// Usage:
app.use('/api/customers/*', authMiddleware)
app.use('/api/customers/*', requireRole(['customer']))
app.use('/admin/*', authMiddleware)
app.use('/admin/*', requireRole(['admin']))
```

---

## Next Steps

1. **Add all imports** to src/index.tsx
2. **Create route handlers** for each page
3. **Implement database queries** to fetch real data
4. **Add form submission handlers** for API endpoints
5. **Test authentication flow** with login/register
6. **Verify role-based access** control
7. **Run `npm run build`** to verify compilation
8. **Test with `npm run dev:sandbox`** against D1

---

## Database Schema Reference

The following tables are available:

- `users` - User accounts with authentication
- `provider_profiles` - Provider information and services
- `services` - Available services in the system
- `bookings` - Service bookings and appointments
- `payments` - Payment records
- `reviews` - Customer reviews
- `messages` - Direct messaging
- `notifications` - User notifications
- `admin_logs` - Administrative actions

See `migrations/0001_initial_schema.sql` for detailed column information.

---

**Note:** This is a template. Adjust query structures, error handling, and data transformations based on your specific requirements.
