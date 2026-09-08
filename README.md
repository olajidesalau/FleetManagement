# Snow Fleet Management - UK Gig Economy Platform

## 🌟 Project Overview

**Snow Fleet Management** is a comprehensive gig economy platform connecting service providers with customers across the UK. The platform supports multiple service categories including cleaning, plumbing, electrical work, carpentry, IT support, web development, tutoring, and more.

### Key Features
- ✅ User registration and authentication (Customer/Provider/Admin roles)
- ✅ Service provider profiles with verification tracking
- ✅ Service listing and management
- ✅ Advanced search and filtering by postcode, service type, rating, and price
- ✅ Booking system with status tracking
- ✅ Payment structure with 15% platform commission
- ✅ Reviews and ratings system
- ✅ In-app messaging between users
- ✅ Admin dashboard for platform management
- ✅ Responsive mobile-first design

## 🔗 URLs

### Development (Sandbox)
- **Frontend**: https://snow-fleet-management.pages.dev
- **API Base**: https://snow-fleet-management.pages.dev/api

#### Production (To be deployed)
- **Production URL**: Will be available after deployment to Cloudflare Pages
- **Format**: `https://snow-fleet-management.pages.dev`

## 📊 Data Architecture

### Database Models (Cloudflare D1 - SQLite)

#### Core Tables:
1. **users** - All platform users (customers, providers, admins)
   - Stores: email, password (hashed), full_name, phone, role, status
   - Roles: customer, provider, admin
   - Status: active, suspended, deleted

2. **provider_profiles** - Extended service provider information
   - Stores: business_name, bio, experience, hourly_rate, service_areas (JSON)
   - Verification: DBS and insurance tracking
   - Approval workflow: pending → approved/rejected
   - Rating tracking: average_rating, total_reviews

3. **services** - Services offered by providers
   - Types: cleaning, plumbing, electrical, carpentry, it_support, web_development, tutoring, etc.
   - Stores: service_name, description, price, duration_minutes
   - Active/inactive status for service management

4. **bookings** - Customer booking records
   - Status flow: pending → confirmed → in_progress → completed
   - Cancellation support with refund tracking
   - Stores: booking_date, time, address, postcode, special_instructions
   - Automatic fee calculation: service_price, platform_fee (15%), provider_payout

5. **payments** - Payment transaction records
   - Tracks: amount, platform_fee, provider_payout
   - Payment status: pending → processing → completed/failed/refunded
   - Payout status for provider payments
   - Integration-ready for Stripe/GoCardless

6. **reviews** - Customer reviews and ratings
   - 1-5 star rating system
   - Verified reviews for completed bookings
   - Provider response capability
   - Automatic average rating calculation

7. **messages** - In-app communication
   - Direct messaging between customers and providers
   - Conversation management with read receipts
   - Optional booking association

8. **notifications** - User notifications
   - Types: booking_created, booking_confirmed, payment_received, review_received, etc.
   - Read/unread tracking
   - Related entity references

9. **availability** - Provider availability schedule
   - Day of week scheduling (0-6, Sunday-Saturday)
   - Start and end times per day
   - Enable/disable availability

10. **blocked_dates** - Provider unavailability dates
    - Holiday and vacation blocking
    - Full-day booking blocking

### Storage Service:
- **Cloudflare D1** - Globally distributed SQLite database
- **Local Development**: `.wrangler/state/v3/d1/` (automatically created with --local flag)
- **Production**: Cloudflare D1 distributed network

### Data Relationships:
```
users (1) ←→ (1) provider_profiles
provider_profiles (1) ←→ (N) services
users + provider_profiles (N) ←→ (N) bookings
bookings (1) ←→ (1) payments
bookings (1) ←→ (1) reviews
users (N) ←→ (N) messages
```

### 🎯 Completed Features (Step 1)

### 1. User Management System ✅
- Email/password authentication with JWT tokens
- Role-based registration (customer/provider/admin)
- Profile management and updates
- Session management with token-based auth

### 2. Service Provider Profile System ✅
- Complete provider profiles with business information
- Experience tracking and hourly rate settings
- Service areas (UK postcodes) and services offered
- DBS and insurance verification tracking
- Rating and review aggregation
- Profile approval workflow (admin controlled)

### 3. Service Listing & Search ✅
- Service CRUD operations for providers
- Multiple service types support
- Pricing and duration configuration
- Advanced search by:
  - Postcode (UK format)
  - Service type
  - Rating (minimum threshold)
  - Price range (maximum rate)
- Active/inactive service management

### 4. Booking System ✅
- Customer booking creation with date/time selection
- Address and special instructions
- Booking status tracking:
  - Pending → Confirmed → In Progress → Completed
  - Cancellation with refund support
  - No-show tracking
- Automatic platform fee calculation (15%)
- Booking reference generation

### 5. Payment Processing Structure ✅
- Payment record tracking per booking
- Platform fee calculation (15% commission)
- Provider payout tracking
- Payment status management
- Refund tracking and processing
- Integration-ready for Stripe/GoCardless

### 6. Reviews & Ratings ✅
- Customer reviews for completed bookings
- 1-5 star rating system
- Text reviews with automatic verification
- Provider response capability
- Automatic average rating calculation
- Review visibility management

### 7. In-App Messaging ✅
- Direct messaging between customers and providers
- Conversation management
- Booking-related messages
- Unread message tracking
- Read receipts
- Message notifications

#### 8. Admin Dashboard ✅
- User management (view all users)
- Provider profile approval workflow
- Booking oversight (all bookings)
- Platform statistics:
  - Total users, providers, customers
  - Total and completed bookings
  - Platform revenue tracking
  - Pending approvals count
- Provider approval/rejection with reasons

### 9. Responsive Frontend ✅
- Modern, clean UI with Tailwind CSS
- Hero section with postcode search
- Service category icons
- Provider search results display
- Authentication modals (login/register)
- UK-focused design and terminology
- Mobile-first responsive design

#### 🗄️ Sample Data Included

The platform includes comprehensive seed data for testing:

### Users (9 total)
- **1 Admin**: admin@snowfleetmanagement.uk
- **4 Service Providers**:
  - Sarah Johnson (Sparkle Clean Services) - Cleaning specialist
  - James Wilson (QuickFix Plumbing) - Certified plumber
  - Emma Thompson (Learn & Grow Tutoring) - GCSE/A-Level tutor
  - Michael Chen (CodeCraft Solutions) - Web developer
- **4 Customers**: Various test customers

### Service Providers (4 approved)
- All with complete profiles, ratings, and reviews
- Various service types and areas covered
- Different hourly rates (£25-£60)
- Realistic experience levels (5-12 years)

#### Services (13 active)
- Cleaning services (regular, deep, carpet, window)
- Plumbing services (emergency, installation, boiler)
- Tutoring services (GCSE, A-Level, primary)
- Development services (websites, IT support, design)

### Bookings (7 total)
- 3 Completed with reviews
- 2 Confirmed (upcoming)
- 1 Pending
- 1 Cancelled with refund

### Reviews (3 verified)
- All 4-5 star ratings
- Customer feedback on completed services
- Provider responses included

### Messages (6 total)
- Conversations between customers and providers
- Booking-related discussions
- Service inquiries

## 🚀 API Endpoints

### Authentication Routes
```
POST   /api/auth/register      - Register new user (customer/provider)
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user profile (authenticated)
```

### Provider Routes
```
GET    /api/providers/search              - Search providers (query params: postcode, serviceType, minRating, maxPrice)
GET    /api/providers/:userId             - Get provider profile by user ID
PUT    /api/providers/profile             - Update provider profile (authenticated, provider role)
```

### Service Routes
```
GET    /api/services/provider/:providerId - Get all services by provider
GET    /api/services/:serviceId           - Get single service details
POST   /api/services                      - Create new service (authenticated, provider role)
PUT    /api/services/:serviceId           - Update service (authenticated, provider role)
DELETE /api/services/:serviceId           - Delete service (authenticated, provider role)
```

### Booking Routes
```
POST   /api/bookings                      - Create new booking (authenticated, customer role)
GET    /api/bookings/customer             - Get customer bookings (authenticated, customer role)
GET    /api/bookings/provider             - Get provider bookings (authenticated, provider role)
GET    /api/bookings/:bookingId           - Get single booking details (authenticated)
PATCH  /api/bookings/:bookingId/status    - Update booking status (authenticated)
POST   /api/bookings/:bookingId/cancel    - Cancel booking (authenticated)
```

### Review Routes
```
POST   /api/reviews                       - Create review (authenticated, customer role)
GET    /api/reviews/provider/:providerId  - Get reviews for provider
POST   /api/reviews/:reviewId/respond     - Add provider response (authenticated, provider role)
```

### Message Routes
```
POST   /api/messages                      - Send message (authenticated)
GET    /api/messages/conversations        - Get user conversations (authenticated)
GET    /api/messages/conversation/:id     - Get messages in conversation (authenticated)
```

### Notification Routes
```
GET    /api/notifications                 - Get user notifications (authenticated)
PATCH  /api/notifications/:id/read        - Mark notification as read (authenticated)
POST   /api/notifications/read-all        - Mark all notifications as read (authenticated)
```

### Admin Routes (Require admin role)
```
GET    /api/admin/users                   - Get all users
GET    /api/admin/providers               - Get all provider profiles
PATCH  /api/admin/providers/:id/approval  - Approve/reject provider profile
GET    /api/admin/bookings                - Get all bookings
GET    /api/admin/stats                   - Get platform statistics
```

### 👤 Test User Credentials

**Note**: All passwords use placeholder hashing. In production, use bcrypt.

#### Admin
- Email: `admin@snowfleetmanagement.uk`
- Password: `admin_password` (hashed as `hashed_admin_password_123`)

### Service Providers
- Sarah (Cleaning): `sarah.cleaner@email.uk` / `password`
- James (Plumbing): `james.plumber@email.uk` / `password`
- Emma (Tutoring): `emma.tutor@email.uk` / `password`
- Michael (Development): `michael.dev@email.uk` / `password`

#### Customers
- John Smith: `john.smith@email.uk` / `password`
- Mary Jones: `mary.jones@email.uk` / `password`
- David Brown: `david.brown@email.uk` / `password`
- Lisa Taylor: `lisa.taylor@email.uk` / `password`

**All passwords are hashed as**: `hashed_password_123`

#### 🛠️ Technology Stack

### Backend
- **Hono** - Lightweight web framework for edge computing
- **Cloudflare Workers** - Edge runtime environment
- **Cloudflare D1** - Distributed SQLite database
- **TypeScript** - Type-safe development

### Frontend
- **Vanilla JavaScript** - No framework overhead
- **Tailwind CSS** - Utility-first styling
- **Font Awesome** - Icon library
- **Axios** - HTTP client

#### Development & Deployment
- **Vite** - Build tool
- **Wrangler** - Cloudflare CLI tool
- **PM2** - Process manager for development
- **Git** - Version control

### 💻 Local Development

### Prerequisites
- Node.js (v18+)
- npm (v10+)

#### Setup
```bash
# Clone the repository
git clone <repository-url>
cd webapp

# Install dependencies
npm install

# Apply database migrations
npm run db:migrate:local

# Load seed data
npm run db:seed

# Build the application
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Check logs
pm2 logs snow-fleet-management --nostream

# Access the application
curl http://localhost:3000
```

### Available Scripts
```bash
npm run dev              # Vite dev server (not for Cloudflare D1)
npm run dev:sandbox      # Wrangler pages dev server
npm run dev:d1           # Wrangler with D1 database (use this for development)
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare Pages
npm run deploy:prod      # Deploy to production with project name

# Database management
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to production
npm run db:seed          # Load seed data
npm run db:reset         # Reset local database
npm run db:console:local # Database console (local)
npm run db:console:prod  # Database console (production)

# Utilities
npm run clean-port       # Kill process on port 3000
npm run test             # Test server with curl

# Git shortcuts
npm run git:init         # Initialize git repository
npm run git:commit       # Commit with message
npm run git:status       # Git status
npm run git:log          # Git log
```

### 🚀 Deployment to Cloudflare Pages

### Step 1: Setup Cloudflare API Key
```bash
# This tool will guide you to configure your Cloudflare API key
# Follow the instructions in the Deploy tab
```

### Step 2: Create Production Database
```bash
## Create D1 database
npx wrangler d1 create snow-fleet-management-data

# Copy the database_id from output and update wrangler.jsonc
```

## Step 3: Apply Migrations to Production
```bash
npm run db:migrate:prod
```

### Step 4: Create Cloudflare Pages Project
```bash
# Using main branch as production branch
npx wrangler pages project create snow-fleet-management \
  --production-branch main \
  --compatibility-date 2026-01-18
```

### Step 5: Deploy
```bash
# Build and deploy
#New database created 
npm run deploy:prod

# You'll receive URLs:
# - Production: https://snow-fleet-management.pages.dev
# - Branch: https://main.snow-fleet-management.pages.dev
```

### Step 6: Set Environment Variables (Optional)
```bash
# Add secrets for production
npx wrangler pages secret put API_KEY --project-name snow-fleet-management
npx wrangler pages secret put JWT_SECRET --project-name snow-fleet-management
```

## 📋 Features Not Yet Implemented (Future Enhancements)

### Step 2 - Priority Features
- [ ] Real password hashing (bcrypt implementation)
- [ ] Email verification workflow
- [ ] SMS verification for phone numbers
- [ ] OAuth integration (Google, Facebook)
- [ ] Stripe payment integration
- [ ] GoCardless integration for direct debit
- [ ] Automated payout system
- [ ] File upload for profile images (Cloudflare R2)
- [ ] DBS certificate upload and verification
- [ ] Insurance document upload

### Step 3 - Advanced Features
- [ ] Real-time notifications (polling-based for edge)
- [ ] Advanced search with map-based provider discovery
- [ ] Subscription plans for regular bookings
- [ ] Promotional codes and discounts
- [ ] Referral system
- [ ] Analytics dashboard with charts
- [ ] Marketing email system
- [ ] Customer support ticketing
- [ ] Multi-language support

### Step 4 - Enterprise Features
- [ ] Third-party DBS check integration
- [ ] Insurance verification API
- [ ] Advanced reporting and business intelligence
- [ ] Mobile apps (React Native)
- [ ] White-label solution for other markets

## 🔒 Security Features

### Current Implementation
- JWT token authentication
- Password hashing (placeholder - needs bcrypt)
- Input sanitization
- CORS enabled for API routes
- UK postcode validation
- Email format validation
- Phone number validation (UK format)
- SQL injection protection (parameterized queries)
- Role-based access control

### Production Requirements
- **CRITICAL**: Implement proper bcrypt password hashing
- **CRITICAL**: Add rate limiting for API endpoints
- **CRITICAL**: Implement CSRF protection
- Add email verification workflow
- Implement 2FA for admin accounts
- Add API key authentication for external integrations
- Implement request signing for payment webhooks
- Add input validation middleware
- Implement DDoS protection (Cloudflare)

## 📊 Platform Statistics (Sample Data)

- **Total Users**: 9 (1 admin, 4 providers, 4 customers)
- **Approved Providers**: 4
- **Active Services**: 13
- **Total Bookings**: 7
- **Completed Bookings**: 3
- **Average Provider Rating**: 4.85/5.0
- **Total Reviews**: 3
- **Active Conversations**: 3
- **Platform Revenue**: £34.50 (from completed bookings)

## 🌍 UK-Specific Features

- UK postcode validation and search
- GBP (£) currency formatting
- UK date format (DD/MM/YYYY)
- UK phone number format (+44)
- DBS (Disclosure and Barring Service) verification tracking
- GDPR compliance ready
- UK service areas (postcodes)
- UK-focused terminology
- Insurance verification for UK providers

## 📞 Support & Documentation

### For Customers
1. Sign up as a customer
2. Search for services by postcode or category
3. View provider profiles and reviews
4. Book services with date/time selection
5. Make secure payments (integration coming soon)
6. Leave reviews after service completion

### For Service Providers
1. Sign up as a provider
2. Complete your business profile
3. Wait for admin approval
4. List your services with pricing
5. Manage your availability
6. Receive and manage bookings
7. Communicate with customers via messaging
8. Respond to reviews

### For Administrators
1. Review and approve provider applications
2. Monitor all bookings and transactions
3. View platform statistics
4. Manage user accounts
5. Handle disputes and support requests

## 📝 Development Notes

### Database Management
- Local development uses SQLite in `.wrangler/state/v3/d1/`
- Production uses Cloudflare D1 globally distributed database
- Migrations are applied separately for local and production
- Use `--local` flag for all local database operations

### Authentication
- JWT tokens are base64 encoded (placeholder implementation)
- In production, use proper JWT library with HMAC signing
- Tokens should expire after reasonable time (e.g., 24 hours)
- Implement token refresh mechanism

### Payment Integration
- Payment structure is complete but integration pending
- Platform takes 15% commission on all bookings
- Payouts to providers need automation
- Integrate Stripe or GoCardless for actual payments

## 🎯 Recommended Next Steps

### Priority 1: Security & Authentication (Critical)
1. Implement proper bcrypt password hashing
2. Add email verification with tokens
3. Set up OAuth (Google/Facebook)
4. Implement rate limiting
5. Add CSRF protection

### Priority 2: Payment Integration (High)
1. Set up Stripe account
2. Integrate Stripe payment intents
3. Implement webhook handling
4. Set up automated payouts
5. Add invoice generation

### Priority 3: User Experience (High)
1. Build customer dashboard
2. Build provider dashboard
3. Implement notification polling system
4. Add booking calendar view
5. Create mobile-responsive improvements

### Priority 4: Compliance & Legal (Medium)
1. Implement GDPR consent forms
2. Add Terms of Service acceptance
3. Create Privacy Policy pages
4. Implement data export functionality
5. Add right-to-be-forgotten feature

### Priority 5: Testing & Quality (Medium)
1. Unit tests for API routes
2. Integration tests for workflows
3. E2E tests with Playwright
4. Load testing
5. Security penetration testing

## 🐛 Known Issues

1. **Password Hashing**: Currently using placeholder hashing. Must implement bcrypt before production.
2. **JWT Signing**: Using base64 encoding instead of proper HMAC signing.
3. **Real-time Updates**: No WebSocket support in Cloudflare Workers. Need polling-based solution.
4. **File Uploads**: Need to implement Cloudflare R2 for profile images and documents.
5. **Email Notifications**: Need to integrate email service (e.g., SendGrid).

## 📄 License

Copyright © 2026 Snow Fleet Management. All rights reserved.

## 🤝 Contributing

This is a proprietary project. For any questions or contributions, please contact the development team.

---

**Built with ❄️ by the Snow Fleet Management Team**
