# Awoof Backend - Build Documentation

## Overview

This document outlines the specific requirements for building the **Awoof Backend API** application. This is the core Express.js backend that powers the entire Awoof platform, including both the Marketplace API and the standalone Awoof Verify API.

---

## Application Purpose

The backend serves as:
- **Marketplace Backend API** - Powers the Next.js marketplace frontend
- **Awoof Verify API** - Standalone SaaS API for enterprise clients
- **Core Verification Engine** - Handles all student verification logic
- **Payment Processing** - Manages Paystack split payments and commission tracking
- **Webhook Handler** - Processes Paystack webhooks and vendor API callbacks

---

## Core Features to Build

### 1. Student Verification System (Core Engine)

#### Four-Tier Verification System
Build a verification system with fallback logic in this order:

1. **Student Portal Login (Primary)**
   - Redirect handler to university portals
   - Portal callback receiver
   - Token-based handoff (NO password capture)
   - Portal SSO integration per university

2. **Email Verification (Secondary)**
   - Magic link generation and sending
   - Email domain validation (.edu, .edu.ng, school-specific)
   - Magic link verification endpoint
   - Expiration handling

3. **Registration Number Database Lookup (Tertiary)**
   - Registration number validation
   - University database API integration
   - Direct API queries to university systems
   - Real-time verification against records

4. **WhatsApp OTP Verification (Fallback)**
   - OTP generation (6-digit codes)
   - WhatsApp OTP service integration
   - OTP storage in Redis (5-minute expiry)
   - OTP verification endpoint
   - Automatic OTP purging

#### Technical Implementation
- JWT-based authentication with 15-minute token expiry
- Redis caching for OTPs, sessions, and verification status
- Fallback logic to determine available verification methods per university
- NDPR consent tracking
- Verification status management

### 2. Marketplace API Endpoints

#### Student Endpoints
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-portal` - Portal verification callback
- `POST /api/auth/verify-registration` - Registration number verification
- `POST /api/auth/verify-whatsapp` - WhatsApp OTP verification
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/purchases` - Get purchase history
- `GET /api/students/savings` - Get savings statistics

#### Product Endpoints
- `GET /api/products` - List all products (with pagination)
- `GET /api/products/:id` - Get product details
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/vendor/:vendorId` - Get vendor products

#### Transaction Endpoints
- `POST /api/transactions/initiate` - Initiate purchase (create transaction record)
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions` - List user transactions
- `POST /api/transactions/paystack-webhook` - Paystack webhook handler

#### University Endpoints
- `GET /api/universities` - List all universities
- `GET /api/universities/:id/verification-methods` - Get available verification methods

### 3. Awoof Verify API Endpoints (Standalone SaaS)

#### Core Endpoints
- `POST /api/v1/verify-student` - Student verification (supports all 4 methods)
  - Requires API key authentication
  - Rate limited per API key
  - Usage metering
  - Returns verification result
  
- `GET /api/v1/student-status/:id` - Check verification status
  - API key authentication
  - Returns current verification status

- `GET /api/v1/university-list` - List available universities
  - API key authentication
  - Returns list with verification method support

- `GET /api/v1/university-verification-methods/:university_id` - Get methods for university
  - API key authentication
  - Returns available verification methods

#### API Features
- API key management system (generate, revoke, rotate)
- Per-API-key rate limiting
- Usage tracking and metering (for billing)
- Webhook callbacks to registered endpoints
- HMAC signature for webhook security
- Timestamp validation for replay protection

### 4. Vendor Management API

#### Vendor Endpoints
- `POST /api/vendors/register` - Vendor registration
- `POST /api/vendors/login` - Vendor login
- `GET /api/vendors/profile` - Get vendor profile
- `PUT /api/vendors/profile` - Update vendor profile
- `GET /api/vendors/analytics` - Get vendor analytics
- `GET /api/vendors/webhook-logs` - Get webhook logs
- `POST /api/vendors/api-config` - Configure vendor API integration
- `GET /api/vendors/api-status` - Check API integration status

#### Product Management
- `POST /api/vendors/products/sync` - Trigger product sync
- `GET /api/vendors/products` - List vendor products
- `PUT /api/vendors/products/:id` - Update product
- `DELETE /api/vendors/products/:id` - Delete product

### 5. Admin API Endpoints

#### User Management
- `GET /api/admin/students` - List all students
- `GET /api/admin/students/:id` - Get student details
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student (soft delete)

- `GET /api/admin/vendors` - List all vendors
- `GET /api/admin/vendors/:id` - Get vendor details
- `POST /api/admin/vendors/:id/approve` - Approve vendor
- `PUT /api/admin/vendors/:id` - Update vendor
- `DELETE /api/admin/vendors/:id` - Delete vendor (soft delete)

#### Platform Management
- `GET /api/admin/system/health` - System health check
- `GET /api/admin/system/metrics` - Platform metrics
- `GET /api/admin/commissions` - Commission tracking
- `GET /api/admin/webhook-logs` - All webhook logs
- `POST /api/admin/data-delete/:userId` - Process 'Delete My Data' request
- `GET /api/admin/exports` - Generate data exports

#### Newsletter Management
- `POST /api/admin/newsletters` - Create newsletter
- `GET /api/admin/newsletters` - List newsletters
- `PUT /api/admin/newsletters/:id` - Update newsletter
- `POST /api/admin/newsletters/:id/send` - Send newsletter
- `GET /api/admin/newsletters/:id/analytics` - Newsletter analytics

### 6. Paystack Integration

#### Payment Processing
- Paystack split payments configuration
- Transaction initialization
- Webhook handler for payment events
- Commission calculation and tracking
- Payment reconciliation
- Refund handling

#### Webhook Events
- `charge.success` - Payment successful
- `charge.failed` - Payment failed
- `refund.processed` - Refund completed
- Handle HMAC signature verification
- Idempotency for webhook processing

### 7. Newsletter System Backend

#### Features
- Newsletter creation and management
- Verified-user segmentation
- Automated scheduling
- Email delivery via SendGrid/AWS SES
- Analytics tracking (opens, clicks)
- Template management

### 8. Background Jobs & Queue System

#### Queue Jobs (BullMQ)
- Email sending (magic links, newsletters)
- WhatsApp OTP sending
- Vendor product sync
- Webhook retries
- Commission reconciliation (nightly)
- Newsletter scheduling

---

## Technical Stack

### Framework & Runtime
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **ES Modules** (ESM)

### Database & Caching
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **BullMQ** - Queue management

### Authentication & Security
- **JWT** (jsonwebtoken) - Token-based auth
- **bcrypt** - Password hashing
- **API Key** management system
- **Rate limiting** (express-rate-limit)
- **HMAC** signatures for webhooks

### External Services
- **SendGrid/AWS SES** - Email delivery
- **WhatsApp Business API** - OTP service
- **Paystack** - Payment processing
- **AWS S3** - File storage
- **Sentry** - Error tracking

### Development Tools
- **tsx** - TypeScript execution
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

---

## Database Schema (Backend Focus)

### Core Tables
- `users` - User accounts (students, vendors, admins)
- `students` - Student-specific data
- `vendors` - Vendor information
- `verifications` - Verification records
- `transactions` - Purchase transactions
- `products` - Product listings
- `universities` - University data
- `university_verification_methods` - Available methods per university
- `api_keys` - API key management
- `webhook_logs` - Webhook event logs
- `newsletters` - Newsletter records
- `newsletter_subscriptions` - User subscriptions
- `commissions` - Commission tracking
- `deletion_requests` - Data deletion requests

---

## API Design Principles

### RESTful Design
- Use HTTP verbs (GET, POST, PUT, DELETE)
- Noun-based resource naming
- Consistent URL structure (`/api/resource/:id`)

### Error Handling
- Consistent error response format
- HTTP status codes
- Error codes for client handling
- Detailed error messages (in development)

### Authentication
- JWT tokens for marketplace API
- API keys for Verify API
- Refresh token mechanism
- Token expiry (15 minutes)

### Security
- HTTPS only
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting

---

## Development Phases (Backend-Specific)

### Phase 1: Foundation (Weeks 1-2)
- Express.js setup
- Database connection (PostgreSQL)
- Redis setup
- Basic authentication (JWT)
- Error handling middleware
- Logging setup

### Phase 2: Verification Engine (Weeks 2-5)
- Email verification system
- Portal SSO integration
- Registration number lookup
- WhatsApp OTP integration
- Fallback logic implementation

### Phase 3: Marketplace API (Weeks 6-10)
- Student endpoints
- Product endpoints
- Transaction endpoints
- University endpoints

### Phase 4: Verify API (Weeks 6-9)
- API key management
- Verify API endpoints
- Rate limiting
- Usage metering
- Webhook callbacks

### Phase 5: Vendor & Admin APIs (Weeks 11-14)
- Vendor management endpoints
- Admin endpoints
- Product management
- Analytics endpoints

### Phase 6: Payment Integration (Weeks 15-17)
- Paystack integration
- Split payments setup
- Webhook handlers
- Commission tracking

### Phase 7: Background Jobs (Weeks 18-20)
- Queue system setup
- Email jobs
- Product sync jobs
- Newsletter jobs
- Reconciliation jobs

---

## Testing Requirements

### Unit Tests
- Individual functions and utilities
- Middleware testing
- Service layer testing

### Integration Tests
- API endpoint testing
- Database integration
- External service mocking

### E2E Tests
- Complete verification flows
- Purchase flow
- Payment webhook handling

---

## Deployment Considerations

### Environment Variables
- Database connection strings
- Redis connection
- JWT secrets
- API keys (SendGrid, Paystack, WhatsApp)
- AWS credentials
- Sentry DSN

### Docker
- Development Dockerfile
- Production Dockerfile
- Docker Compose configuration

### Monitoring
- Health check endpoints
- Sentry error tracking
- Performance monitoring
- Log aggregation

---

## Documentation Requirements

### API Documentation
- OpenAPI/Swagger specification
- Endpoint descriptions
- Request/response examples
- Authentication guides
- Error code reference

### Internal Documentation
- Architecture decisions
- Database schema documentation
- Integration guides
- Deployment procedures

---

**Document Version:** 1.0  
**Last Updated:** September 16, 2024  
**Part of:** Awoof MVP PRD
