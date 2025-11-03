# Backend Setup Guide

## Overview

This backend is built with **SOLID principles** and follows a **clean architecture** pattern. It's designed to be:
- ✅ **Scalable** - Easy to add new features
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Testable** - Dependency injection and interfaces
- ✅ **Flexible** - No rigid dependencies

## Architecture

```
src/
├── config/          # Configuration (env, database, redis)
├── common/          # Shared utilities (errors, middleware, types)
├── modules/         # Feature modules (auth, verification, etc.)
│   └── {module}/
│       ├── controllers/  # HTTP handlers
│       ├── services/      # Business logic
│       ├── repositories/  # Data access
│       ├── dto/           # Data transfer objects
│       └── interfaces/    # Contracts/interfaces
└── routes/          # Route definitions
```

## Prerequisites

Before setting up, ensure you have:
- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended for Development)

If you're using the Docker Compose setup from the root:

```bash
# From project root
docker-compose -f packages/docker-compose.dev.yml up -d db
```

This will start PostgreSQL on `localhost:5432`

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create database:
```sql
CREATE DATABASE awoofDB;
```

### 3. Redis Setup

#### Option A: Using Docker

```bash
# From project root
docker-compose -f packages/docker-compose.dev.yml up -d redis
```

#### Option B: Local Redis

1. Install Redis locally
2. Start Redis server:
```bash
redis-server
```

### 4. Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

**Required variables for basic setup:**
- `JWT_SECRET` - Generate a secure random string (min 32 chars)
- `JWT_REFRESH_SECRET` - Generate another secure random string (min 32 chars)

**To generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Database Migrations

*(Migrations will be set up in next phase)*

### 6. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Verification

Visit:
- `http://localhost:5000` - API info
- `http://localhost:5000/health` - Health check

## External Services Setup (Optional for MVP)

These can be set up later:

1. **Email Service** (SendGrid or AWS SES)
   - Sign up at https://sendgrid.com or AWS Console
   - Get API keys
   - Add to `.env`

2. **WhatsApp OTP Service**
   - Choose provider (Twilio, etc.)
   - Get API credentials
   - Add to `.env`

3. **Paystack**
   - Sign up at https://paystack.com
   - Get API keys
   - Add to `.env`

4. **Sentry (Monitoring)**
   - Sign up at https://sentry.io
   - Get DSN
   - Add to `.env`

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running
- Verify connection string in `.env`
- Check database exists: `psql -U root -d awoofDB`

### Redis Connection Failed
- Check Redis is running: `redis-cli ping`
- Verify Redis config in `.env`
- App will work without Redis (graceful degradation)

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill`

## Next Steps

1. ✅ Foundation setup (current)
2. ⏭️ Database migrations
3. ⏭️ Authentication module
4. ⏭️ Verification system
5. ⏭️ API endpoints

