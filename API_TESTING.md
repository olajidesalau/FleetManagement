# Snow Fleet Management API Testing Guide

## Base URL
- **Development**: `https://snow-fleet-management.pages.dev`
- **Local**: `http://localhost:3000`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

You'll receive a token after successful login or registration.

---

## 1. Authentication Tests

### Register as Customer
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newcustomer@test.uk",
    "password": "password123",
    "full_name": "Test Customer",
    "phone": "+447700900100",
    "role": "customer"
  }'
```

### Register as Provider
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newprovider@test.uk",
    "password": "password123",
    "full_name": "Test Provider",
    "phone": "+447700900101",
    "role": "provider"
  }'
```

### Login (Customer)
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.smith@email.uk",
    "password": "password"
  }'
```

**Response will include**:
- `token`: JWT token for authentication
- `user`: User object with id, email, role

**Save the token for subsequent requests!**

### Login (Provider)
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sarah.cleaner@email.uk",
    "password": "password"
  }'
```

### Login (Admin)
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@snowfleetmanagement.uk",
    "password": "admin_password"
  }'
```

### Get Current User Profile
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Provider Search Tests

### Search All Providers
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/providers/search
```

### Search by Postcode
```bash
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?postcode=SW1A"
```

### Search by Service Type
```bash
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?serviceType=cleaning"
```

### Search by Minimum Rating
```bash
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?minRating=4.5"
```

### Search by Maximum Price
```bash
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?maxPrice=40"
```

### Combined Search (Postcode + Service Type + Rating)
```bash
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?postcode=SW1&serviceType=cleaning&minRating=4.0"
```

### Get Specific Provider Profile
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/providers/2
```

---

## 3. Service Tests

### Get Services by Provider
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/services/provider/1
```

### Get Single Service Details
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/services/1
```

### Create New Service (Provider only)
```bash
# First login as provider to get token
curl -X POST https://snow-fleet-management.pages.dev/api/services \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Office Cleaning",
    "service_type": "cleaning",
    "description": "Professional office cleaning service",
    "price": 120.00,
    "duration_minutes": 180
  }'
```

### Update Service (Provider only)
```bash
curl -X PUT https://snow-fleet-management.pages.dev/api/services/1 \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Premium Home Cleaning",
    "service_type": "cleaning",
    "description": "Updated description",
    "price": 85.00,
    "duration_minutes": 120,
    "is_active": 1
  }'
```

---

## 4. Booking Tests

### Create Booking (Customer only)
```bash
# Login as customer first
curl -X POST https://snow-fleet-management.pages.dev/api/bookings \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 1,
    "service_id": 1,
    "booking_date": "2026-02-01",
    "booking_time": "10:00",
    "duration_minutes": 120,
    "service_address": "123 Test Street, London",
    "postcode": "SW1A 1AA",
    "special_instructions": "Please ring doorbell twice"
  }'
```

### Get Customer Bookings
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/bookings/customer \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```

### Get Provider Bookings
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/bookings/provider \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN"
```

### Get Single Booking Details
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Booking Status
```bash
curl -X PATCH https://snow-fleet-management.pages.dev/api/bookings/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'
```

**Valid statuses**: pending, confirmed, in_progress, completed, cancelled, no_show

### Cancel Booking
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/bookings/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cancellation_reason": "Schedule conflict"
  }'
```

---

## 5. Review Tests

### Create Review (Customer only, after completed booking)
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/reviews \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": 1,
    "rating": 5,
    "review_text": "Excellent service! Very professional and thorough."
  }'
```

### Get Reviews for Provider
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/reviews/provider/1
```

### Add Provider Response to Review
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/reviews/1/respond \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Thank you for the wonderful review! It was a pleasure serving you."
  }'
```

---

## 6. Messaging Tests

### Send Message
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_id": 2,
    "booking_id": 1,
    "message_text": "Hello! I have a question about the service."
  }'
```

### Get Conversations
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/messages/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Messages in Conversation
```bash
# Replace 6-2 with the conversation_id from your conversations
curl -X GET https://snow-fleet-management.pages.dev/api/messages/conversation/6-2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 7. Notification Tests

### Get User Notifications
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Notification as Read
```bash
curl -X PATCH https://snow-fleet-management.pages.dev/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark All Notifications as Read
```bash
curl -X POST https://snow-fleet-management.pages.dev/api/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 8. Admin Tests (Admin role required)

### Get All Users
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Provider Profiles
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/admin/providers \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Provider Profile
```bash
curl -X PATCH https://snow-fleet-management.pages.dev/api/admin/providers/1/approval \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approval_status": "approved"
  }'
```

### Reject Provider Profile
```bash
curl -X PATCH https://snow-fleet-management.pages.dev/api/admin/providers/1/approval \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approval_status": "rejected",
    "rejection_reason": "Incomplete documentation"
  }'
```

### Get All Bookings
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/admin/bookings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Platform Statistics
```bash
curl -X GET https://snow-fleet-management.pages.dev/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 9. Complete User Journey Test

### Journey 1: Customer Books a Service

```bash
# 1. Register as customer
curl -X POST https://snow-fleet-management.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testcustomer@example.uk",
    "password": "password123",
    "full_name": "Test Customer",
    "phone": "+447700900200",
    "role": "customer"
  }'

# Save the token from response

# 2. Search for cleaning services
curl -X GET "https://snow-fleet-management.pages.dev/api/providers/search?serviceType=cleaning"

# 3. View provider profile
curl -X GET https://snow-fleet-management.pages.dev/api/providers/2

# 4. View provider services
curl -X GET https://snow-fleet-management.pages.dev/api/services/provider/1

# 5. Create booking
curl -X POST https://snow-fleet-management.pages.dev/api/bookings \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 1,
    "service_id": 1,
    "booking_date": "2026-02-15",
    "booking_time": "14:00",
    "duration_minutes": 120,
    "service_address": "456 Test Avenue, London",
    "postcode": "W1A 1AA",
    "special_instructions": "Front door access code: 1234"
  }'

# 6. View my bookings
curl -X GET https://snow-fleet-management.pages.dev/api/bookings/customer \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"

# 7. Send message to provider
curl -X POST https://snow-fleet-management.pages.dev/api/messages \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_id": 2,
    "message_text": "Looking forward to the service on the 15th!"
  }'

# 8. After service completion, leave review
curl -X POST https://snow-fleet-management.pages.dev/api/reviews \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": YOUR_BOOKING_ID,
    "rating": 5,
    "review_text": "Outstanding service! Highly recommended."
  }'
```

### Journey 2: Provider Manages Services

```bash
# 1. Register as provider
curl -X POST https://snow-fleet-management.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testprovider@example.uk",
    "password": "password123",
    "full_name": "Test Provider",
    "phone": "+447700900201",
    "role": "provider"
  }'

# Save the token

# 2. Update provider profile
curl -X PUT https://snow-fleet-management.pages.dev/api/providers/profile \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Services Ltd",
    "bio": "Professional services with 5 years experience",
    "experience_years": 5,
    "hourly_rate": 35.00,
    "service_areas": ["SW1A", "W1A", "SE1"],
    "services_offered": ["cleaning", "deep_cleaning"]
  }'

# 3. Create a service
curl -X POST https://snow-fleet-management.pages.dev/api/services \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_name": "Standard Home Cleaning",
    "service_type": "cleaning",
    "description": "2-bedroom flat cleaning",
    "price": 70.00,
    "duration_minutes": 120
  }'

# 4. View my bookings
curl -X GET https://snow-fleet-management.pages.dev/api/bookings/provider \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN"

# 5. Confirm a booking
curl -X PATCH https://snow-fleet-management.pages.dev/api/bookings/YOUR_BOOKING_ID/status \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'

# 6. Respond to a review
curl -X POST https://snow-fleet-management.pages.dev/api/reviews/REVIEW_ID/respond \
  -H "Authorization: Bearer YOUR_PROVIDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response": "Thank you for your feedback!"
  }'
```

---

## Tips for Testing

1. **Save Tokens**: After login, save the JWT token to use in subsequent requests
2. **Use Variables**: Set environment variables for tokens and IDs to make testing easier
3. **Check Responses**: Pay attention to response codes and error messages
4. **Test Sequentially**: Follow user journeys to test complete workflows
5. **Role-based Testing**: Test with different user roles (customer, provider, admin)
6. **Error Cases**: Try invalid data to test error handling

## Common Response Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Invalid data or missing required fields
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission for this action
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server-side error

## Need Help?

If you encounter issues:
1. Check the PM2 logs: `pm2 logs snow-fleet-management --nostream`
2. Verify the server is running: `pm2 list`
3. Test with curl first before using frontend
4. Check the database: `npm run db:console:local`

Happy Testing! 🚀
