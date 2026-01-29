# Awoof Web (Marketplace) - Build Documentation

## Overview

This document outlines the specific requirements for building the **Awoof Marketplace Web Application** using Next.js. This is the main frontend application that serves as the unified student experience, vendor dashboard, and admin panel.

---

## Application Purpose

The web application serves as:
- **Student Marketplace** - Main platform for students to discover and purchase discounts
- **Student Dashboard** - Verification, purchase history, and savings tracking
- **Vendor Dashboard** - Product management, analytics, and webhook logs
- **Admin Panel** - Platform management, user management, and analytics

---

## Core Features to Build

### 1. Student Marketplace Experience

#### Homepage
- Hero section with value proposition
- Featured deals/offers
- Categories overview
- Quick verification CTA
- Navigation menu

#### Product Discovery
- **Product Listing Page**
  - Grid/list view toggle
  - Product cards with images
  - Price display (regular vs student price)
  - Filter by category
  - Filter by vendor
  - Search functionality
  - Pagination
  - Sort options (price, popularity, date)

- **Product Detail Page**
  - Product images gallery
  - Product information
  - Pricing (regular vs student price)
  - Discount percentage display
  - Vendor information
  - "Purchase Now" button
  - Related products

#### Search & Filter
- Search bar (header/navigation)
- Category filters
- Vendor filters
- Price range filters
- Real-time search results

### 2. Student Dashboard

#### Verification Section
- Verification status display
- Verification method used
- Verification expiry
- Re-verification option
- NDPR consent management

#### Purchase History
- List of all purchases
- Purchase details (product, date, amount)
- Savings per purchase
- Link to vendor/product
- Status tracking

#### Savings Statistics
- Total savings display
- Savings breakdown by category
- Savings over time (chart/graph)
- Purchase count
- Average savings per purchase

#### Profile Management
- Edit profile information
- Update email/phone
- University information
- Registration number (if used for verification)

### 3. Student Verification Flow

#### Verification Gate
- Check verification status before purchase
- Redirect to verification if not verified

#### Verification Process
- **Step 1: NDPR Consent**
  - Consent screen
  - Privacy policy link
  - Accept/Decline buttons

- **Step 2: Method Selection**
  - Display available methods for university
  - Portal Login button
  - Email verification option
  - Registration number input (if available)
  - WhatsApp OTP option (fallback)

- **Step 3: Verification**
  - Portal redirect (if Portal Login)
  - Email magic link sent confirmation
  - Registration number verification
  - WhatsApp OTP input

- **Step 4: Verification Complete**
  - Success message
  - Account creation confirmation
  - Redirect to purchase or dashboard

### 4. Purchase Flow

#### Purchase Initiation
- Click "Purchase Now" on product
- Verification check
- Transaction initialization
- Redirect to Paystack checkout
- Transaction tracking

#### Post-Purchase
- Purchase confirmation page
- Transaction receipt
- Savings calculation display
- Redirect to purchase history

### 5. Vendor Dashboard

#### Dashboard Overview
- Key metrics (views, clicks, sales)
- Revenue summary
- Commission tracking
- Recent activity

#### Product Management
- **Product List**
  - All vendor products
  - Status indicators (active, pending, synced)
  - Quick actions (edit, delete)

- **Add/Edit Product**
  - Product form (name, description, price)
  - Student discount price
  - Category selection
  - Image upload
  - Save/Cancel actions

- **Product Sync**
  - Trigger manual sync
  - Sync status display
  - Sync history/logs

#### Analytics
- **Product Analytics**
  - Views per product
  - Clicks per product
  - Conversion rates
  - Sales performance

- **Student Analytics**
  - Verification data
  - Redemption data
  - Demographic insights
  - Engagement metrics

#### Webhook Logs
- List of all webhook events
- Filter by event type
- Search functionality
- Event details modal
- Status indicators
- Retry options

#### API Integration
- API configuration section
- API key management
- Integration status
- Test connection button
- API documentation links

### 6. Admin Panel

#### Dashboard Overview
- Platform-wide metrics
- User counts (students, vendors)
- Revenue overview
- System health
- Recent activity

#### Student Management
- **Student List**
  - Search functionality
  - Filter by status, university
  - Pagination
  - Quick actions

- **Student Details**
  - Profile information
  - Verification status
  - Purchase history
  - Edit/Delete options

#### Vendor Management
- **Vendor List**
  - Search functionality
  - Filter by status
  - Approval status
  - Quick actions

- **Vendor Details**
  - Profile information
  - API integration status
  - Product count
  - Commission rate
  - Approve/Reject actions
  - Edit options

#### Product Management
- View all products across vendors
- Edit/Delete products
- Bulk actions
- Category management

#### Newsletter Management
- **Newsletter List**
  - Create new newsletter
  - Edit existing newsletters
  - Send newsletters
  - View analytics

- **Newsletter Editor**
  - Rich text editor
  - Template selection
  - Audience segmentation
  - Scheduling options
  - Preview

#### System Management
- **System Monitoring**
  - Health checks
  - Performance metrics
  - Error logs
  - System status

- **Commission Tracking**
  - Commission reports
  - Revenue tracking
  - Export functionality

- **Webhook Logs**
  - All webhook events
  - Filter and search
  - Debug tools

#### Data Management
- **'Delete My Data' Processing**
  - List of deletion requests
  - Process requests
  - Confirmation workflow

- **Data Exports**
  - Generate reports
  - Export user data
  - Export transaction data

---

## Technical Stack

### Framework
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**

### Styling
- **Tailwind CSS**
- **Radix UI** - Component library
- **Responsive design** (mobile-first)

### State Management
- **React Context** - Global state
- **React Hooks** - Local state
- **SWR/React Query** (optional) - Data fetching

### API Communication
- **Fetch API** / **Axios** - HTTP requests
- **API client** - Centralized API calls
- **Error handling** - Consistent error UI

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Form error handling**

### Authentication
- **JWT token storage** (httpOnly cookies recommended)
- **Token refresh** mechanism
- **Protected routes** - Route guards
- **Role-based access** - RBAC

---

## Page Structure (Next.js App Router)

### Public Routes
```
/
/about
/how-it-works
/deals
/faq
/partner-with-us
```

### Student Routes (Authenticated)
```
/student/dashboard
/student/verify
/student/purchases
/student/savings
/student/profile
/products
/products/[id]
/purchase/[id]
```

### Vendor Routes (Authenticated, Vendor Role)
```
/vendor/dashboard
/vendor/products
/vendor/products/new
/vendor/products/[id]/edit
/vendor/analytics
/vendor/webhook-logs
/vendor/settings
```

### Admin Routes (Authenticated, Admin Role)
```
/admin/dashboard
/admin/students
/admin/vendors
/admin/products
/admin/newsletters
/admin/system
/admin/commissions
/admin/data-delete
```

---

## Component Architecture

### Shared Components
- Header/Navigation
- Footer
- Button
- Input
- Modal
- Card
- Badge
- Loading states
- Error states

### Student Components
- ProductCard
- ProductList
- VerificationModal
- PurchaseConfirmation
- SavingsChart
- PurchaseHistoryItem

### Vendor Components
- ProductForm
- AnalyticsChart
- WebhookLogItem
- SyncStatus

### Admin Components
- UserTable
- VendorApprovalCard
- NewsletterEditor
- SystemMetrics

---

## Design Requirements

### UI/UX
- Modern, clean interface
- Mobile-responsive
- Accessible (WCAG guidelines)
- Fast loading times
- Smooth animations
- Consistent design system

### Branding
- Awoof brand colors
- Typography system
- Icon library
- Logo placement

### Responsive Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

---

## Integration Points

### Backend API
- Marketplace API endpoints
- Authentication endpoints
- File upload endpoints

### CDN
- Static asset delivery (Cloudflare/AWS CloudFront)
- Image optimization
- Asset caching

### External Services
- Paystack checkout integration
- Email service (for notifications)
- Analytics tracking

---

## Development Phases (Web-Specific)

### Phase 1: Foundation (Weeks 1-2)
- Next.js project setup
- Tailwind CSS configuration
- Component library setup
- Routing structure
- Authentication setup

### Phase 2: Student Marketplace (Weeks 3-6)
- Homepage
- Product listing
- Product detail
- Search and filter
- Basic purchase flow

### Phase 3: Student Dashboard (Weeks 7-9)
- Verification flow UI
- Purchase history
- Savings statistics
- Profile management

### Phase 4: Vendor Dashboard (Weeks 10-12)
- Vendor dashboard overview
- Product management
- Analytics views
- Webhook logs

### Phase 5: Admin Panel (Weeks 13-15)
- Admin dashboard
- User management UI
- Newsletter management
- System monitoring

### Phase 6: Polish & Optimization (Weeks 16-18)
- UI/UX refinements
- Performance optimization
- Mobile responsiveness
- Testing and bug fixes

---

## Testing Requirements

### Unit Tests
- Component testing (React Testing Library)
- Utility function testing
- Form validation testing

### Integration Tests
- API integration testing
- Authentication flow
- Purchase flow

### E2E Tests
- Complete user journeys
- Cross-browser testing
- Mobile device testing

---

## Performance Requirements

### Core Web Vitals
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

### Optimization
- Image optimization (Next.js Image)
- Code splitting
- Lazy loading
- CDN for static assets
- Caching strategies

---

## Security Considerations

### Client-Side Security
- XSS prevention
- CSRF protection
- Secure token storage
- Input sanitization
- HTTPS enforcement

### Authentication
- Token refresh mechanism
- Secure logout
- Protected routes
- Role-based rendering

---

**Document Version:** 1.0  
**Last Updated:** September 16, 2024  
**Part of:** Awoof MVP PRD
