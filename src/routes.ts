// Router configuration - all page routes
import type { FC } from 'hono/jsx'

export interface RouteConfig {
  path: string
  method: 'GET' | 'POST'
  label: string
  requiresAuth?: boolean
  roles?: string[] // if specified, only these roles can access
}

export const ROUTES: RouteConfig[] = [
  // Public routes
  { path: '/', method: 'GET', label: 'Home' },
  { path: '/auth/login', method: 'GET', label: 'Login' },
  { path: '/auth/register', method: 'GET', label: 'Register' },

  // Authenticated fleet services
  { path: '/routes', method: 'GET', label: 'Routes', requiresAuth: true },
  { path: '/vehicles', method: 'GET', label: 'Vehicles', requiresAuth: true },
  { path: '/temperature', method: 'GET', label: 'Temperature', requiresAuth: true },
  { path: '/drivers', method: 'GET', label: 'Drivers', requiresAuth: true },
  { path: '/customers', method: 'GET', label: 'Customers', requiresAuth: true },
  { path: '/alerts', method: 'GET', label: 'Alerts', requiresAuth: true },
  { path: '/monitoring', method: 'GET', label: 'Monitoring', requiresAuth: true },
  { path: '/traffic', method: 'GET', label: 'Traffic', requiresAuth: true },

  // Provider routes
  { path: '/providers/search', method: 'GET', label: 'Search Providers' },
  { path: '/providers/:userId', method: 'GET', label: 'Provider Profile' },
  { path: '/providers/profile', method: 'GET', label: 'My Profile', requiresAuth: true, roles: ['provider'] },
  { path: '/providers/profile', method: 'POST', label: 'Update Profile', requiresAuth: true, roles: ['provider'] },

  // Booking routes
  { path: '/bookings/customer', method: 'GET', label: 'My Bookings', requiresAuth: true, roles: ['customer'] },
  { path: '/bookings/provider', method: 'GET', label: 'Provider Bookings', requiresAuth: true, roles: ['provider'] },
  { path: '/bookings/:bookingId', method: 'GET', label: 'Booking Details', requiresAuth: true },

  // Messaging
  { path: '/messages', method: 'GET', label: 'Messages', requiresAuth: true },
  { path: '/messages/conversation/:id', method: 'GET', label: 'Conversation', requiresAuth: true },
  { path: '/messages/new', method: 'GET', label: 'New Conversation', requiresAuth: true },

  // Notifications
  { path: '/notifications', method: 'GET', label: 'Notifications', requiresAuth: true },

  // Admin routes
  { path: '/admin/dashboard', method: 'GET', label: 'Admin Dashboard', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/users', method: 'GET', label: 'Manage Users', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/users/:userId', method: 'GET', label: 'User Details', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/providers', method: 'GET', label: 'Provider Management', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/providers/:providerId', method: 'GET', label: 'Provider Details', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/bookings', method: 'GET', label: 'All Bookings', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/stats', method: 'GET', label: 'Statistics', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/admin/drivers', method: 'GET', label: 'Registered Drivers', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
  { path: '/drivers/:driverId/edit', method: 'GET', label: 'Edit Driver', requiresAuth: true, roles: ['admin', 'fleet_manager', 'Fleet Manager'] },
]

// Navigation links by role
export const getNavLinks = (role?: string) => {
  const baseLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/providers/search', label: 'Search Providers', icon: '🔍' },
  ]

  const customerLinks = [
    ...baseLinks,
    { path: '/bookings/customer', label: 'My Bookings', icon: '📅' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ]

  const providerLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/providers/profile', label: 'My Profile', icon: '👤' },
    { path: '/services/manage', label: 'My Services', icon: '⚙️' },
    { path: '/bookings/provider', label: 'My Bookings', icon: '📅' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/notifications', label: 'Notifications', icon: '🔔' },
  ]

  const adminLinks = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/providers', label: 'Providers', icon: '🏢' },
    { path: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { path: '/admin/stats', label: 'Statistics', icon: '📈' },
  ]

  switch (role) {
    case 'customer':
      return customerLinks
    case 'provider':
      return providerLinks
    case 'admin':
    case 'fleet_manager':
    case 'Fleet Manager':
      return adminLinks
    default:
      return baseLinks
  }
}
