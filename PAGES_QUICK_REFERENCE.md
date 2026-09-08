# Pages Quick Reference

## File Locations
```
src/pages/              - All page components
src/components/         - Reusable components (Navigation)
src/routes.ts         - Route configuration
src/PAGES_INTEGRATION_GUIDE.md  - Implementation guide
```

## Pages List

| Page | Path | Auth | Role | Purpose |
|------|------|------|------|---------|
| Home | `/` | No | Any | Landing page with features |
| Login | `/auth/login` | No | Any | User login form |
| Register | `/auth/register` | No | Any | Account creation |
| Search Providers | `/providers/search` | No | Any | Find services by filters |
| Provider Profile | `/providers/:userId` | No | Any | View provider details |
| My Bookings | `/bookings/customer` | Yes | Customer | Customer's bookings |
| Provider Bookings | `/bookings/provider` | Yes | Provider | Provider's bookings |
| Booking Details | `/bookings/:id` | Yes | Any | Single booking view |
| Messages | `/messages` | Yes | Any | Messaging interface |
| Conversation | `/messages/conversation/:id` | Yes | Any | Single conversation |
| Notifications | `/notifications` | Yes | Any | User notifications |
| Provider Profile (Own) | `/providers/profile` | Yes | Provider | Edit own profile |
| Admin Dashboard | `/admin/dashboard` | Yes | Admin | Stats & overview |
| Manage Users | `/admin/users` | Yes | Admin | User management |
| User Details | `/admin/users/:id` | Yes | Admin | Single user details |
| Providers Mgmt | `/admin/providers` | Yes | Admin | Provider approvals |
| Provider Details | `/admin/providers/:id` | Yes | Admin | Single provider details |
| All Bookings | `/admin/bookings` | Yes | Admin | Platform bookings |

## Navigation Links by Role

**Public Users:**
- 🏠 Home
- 🔍 Search Providers
- Login / Register

**Customers:**
- 🏠 Home
- 🔍 Search Providers
- 📅 My Bookings
- 💬 Messages
- 🔔 Notifications
- Logout

**Providers:**
- 🏠 Home
- 👤 My Profile
- ⚙️ My Services
- 📅 My Bookings
- ⭐ Reviews
- 💬 Messages
- Logout

**Admins:**
- 🏠 Home
- 📊 Dashboard
- 👥 Users
- 🏢 Providers
- 📅 Bookings
- 📈 Statistics
- Logout

## Component Breakdown

### HomePage
- Hero section
- Feature cards (6 features)
- CTA buttons
- Service categories grid

### LoginPage
- Email input
- Password input
- Demo credentials
- Register link

### RegisterPage
- Full name, email, phone
- Role selector
- Password input
- Terms note

### ProvidersSearchPage
- Postcode filter
- Service type filter
- Rating filter
- Price filter
- Provider cards
- Message & view buttons

### BookingsPage
- Status badges
- Service details
- Pricing breakdown
- Platform fee
- Review/Cancel buttons

### MessagesPage
- Conversation list (sidebar)
- Message thread
- Message input
- Unread tracking

### NotificationsPage
- Notification feed
- Type icons
- Color-coded
- Mark as read

### ProviderProfilePage
- Profile header
- Rating/stats
- Service areas
- Services list
- Reviews section
- Verification badges

### AdminDashboardPage
- 6 stat cards
- 4 quick actions
- Recent activity table

### AdminUsersPage
- Search/filter
- Users table (7 columns)
- Role badges
- Status indicators

### AdminProvidersPage
- Stat cards
- Status tabs
- Providers table
- Approval buttons

### AdminBookingsPage
- Stat cards
- Bookings table
- Status breakdown

## Styling Approach

**Current:** Inline styles
```tsx
style="color: white; padding: 1rem;"
```

**Alternative:** CSS classes
```tsx
className="card button-primary"
```

## Color Scheme

- **Primary**: `#4db8ff` (Light Blue)
- **Success**: `#4caf50` (Green)
- **Warning**: `#ff9800` (Orange)
- **Danger**: `#f44336` (Red)
- **Info**: `#2196f3` (Blue)
- **Pending**: `#ff9800` (Orange)
- **Background**: `#f5f5f5` (Light Gray)
- **Card**: `white` (White)
- **Text**: `#333` (Dark)
- **Secondary**: `#999` (Gray)

## Status Colors

| Status | Color | Code |
|--------|-------|------|
| Pending | Orange | `#ff9800` |
| Confirmed | Blue | `#2196f3` |
| In Progress | Purple | `#9c27b0` |
| Completed | Green | `#4caf50` |
| Cancelled | Red | `#f44336` |
| Active | Green | `#4caf50` |
| Suspended | Orange | `#ff9800` |
| Rejected | Red | `#f44336` |
| Approved | Green | `#4caf50` |

## Forms in Pages

- **LoginPage**: Login form (email, password)
- **RegisterPage**: Registration form (name, email, phone, role, password)
- **ProvidersSearchPage**: Search filters (postcode, service, rating, price)
- **MessagesPage**: Message input
- **AdminUsersPage**: Search & filter (search, role, status)
- **AdminProvidersPage**: Filter by status (tabs)

## API Endpoints Used

Each page expects these API endpoints:

**HomePage**: None

**LoginPage**: `POST /api/auth/login`

**RegisterPage**: `POST /api/auth/register`

**ProvidersSearchPage**: `GET /api/providers/search`

**ProviderProfilePage**: 
- `GET /api/providers/:userId`
- `GET /api/services/provider/:providerId`

**BookingsPage**: 
- `GET /api/bookings/customer` or
- `GET /api/bookings/provider`

**MessagesPage**: `GET /api/messages/conversations`

**NotificationsPage**: `GET /api/notifications`

**AdminDashboardPage**: `GET /api/admin/stats`

**AdminUsersPage**: `GET /api/admin/users`

**AdminProvidersPage**: `GET /api/admin/providers`

**AdminBookingsPage**: `GET /api/admin/bookings`

## Icons Used

- 🏠 Home
- 🔍 Search/Search Providers
- 📅 Bookings/Calendar
- 💬 Messages
- 🔔 Notifications
- 👤 Profile/User
- 👥 Users
- ⚙️ Services/Settings
- 📊 Dashboard/Stats
- 📈 Statistics
- 🏢 Providers/Business
- ⭐ Reviews/Rating
- 📍 Location
- 💷 Price/Currency
- 🎯 Target/Goal
- ✨ Verified/Special
- ✓ Checkmark/Yes
- ✗ Cross/No
- ❄️ Snow Fleet Management logo

## Next Steps

1. ✅ Pages created
2. ✅ Navigation component created
3. ✅ Routes configuration created
4. ⬜ Add route handlers to src/index.tsx
5. ⬜ Test all pages
6. ⬜ Extract inline styles to CSS
7. ⬜ Add form validation
8. ⬜ Add error handling
9. ⬜ Add loading states
10. ⬜ Implement real data fetching

## Quick Start

1. Copy pages from `src/pages/` folder
2. Copy Navigation from `src/components/` folder
3. Follow `PAGES_INTEGRATION_GUIDE.md` to add routes
4. Test with `npm run dev:d1`
5. Visit http://localhost:3000

## Customization Tips

- Change colors in inline styles
- Add more filters to search pages
- Add validation to forms
- Extract styles to separate CSS file
- Add loading spinners
- Add error messages
- Add pagination to tables
- Add sorting to table columns
