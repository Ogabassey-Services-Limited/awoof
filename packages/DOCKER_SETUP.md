# Docker Setup Guide

## Overview

This project uses Docker Compose for local development. All required services are configured:
- ✅ **PostgreSQL** - Database
- ✅ **Redis** - Caching and sessions
- ✅ **pgAdmin** - Database management UI
- ✅ **Backend** - Express.js API
- ✅ **Web** - Next.js frontend (optional)

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2

## Quick Start

### 1. Navigate to packages directory

```bash
cd packages
```

### 2. Start all services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL on port `5432`
- Redis on port `6379`
- pgAdmin on port `5050`
- Backend API on port `5001` (mapped from container port 5000)
- Web frontend on port `3000` (if needed)

### 3. Check service status

```bash
docker-compose -f docker-compose.dev.yml ps
```

### 4. View logs

```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f db
docker-compose -f docker-compose.dev.yml logs -f redis
```

### 5. Stop services

```bash
docker-compose -f docker-compose.dev.yml down
```

### 6. Stop and remove volumes (fresh start)

```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Service Details

### PostgreSQL (Database)

- **Container:** `awoof_postgres_container_dev`
- **Port:** `5432`
- **Database:** `awoofDB`
- **User:** `root`
- **Password:** `root`
- **Connection String:** `postgresql://root:root@localhost:5432/awoofDB`

### Redis (Cache)

- **Container:** `awoof_redis_container_dev`
- **Port:** `6379`
- **Connection:** `redis://localhost:6379`
- **Persistent Storage:** Yes (volume `redis_data`)

### pgAdmin (Database UI)

- **Container:** `awoof_pgadmin_container_dev`
- **Port:** `5050`
- **URL:** http://localhost:5050
- **Email:** `admin@admin.com`
- **Password:** `root`

### Backend API

- **Container:** `awoof-backend-dev`
- **Port:** `5001` (external) → `5000` (internal container)
- **URL:** http://localhost:5001
- **Health Check:** http://localhost:5001/health
- **Hot Reload:** Enabled (watches for file changes)

## Environment Variables

The backend service uses environment variables from:
1. Docker Compose environment (for DB/Redis connections)
2. `.env` file in `apps/backend/.env` (for secrets)

### Required `.env` Variables

Create `apps/backend/.env` file:

```env
# JWT Secrets (REQUIRED)
JWT_SECRET=your-32-character-secret-here
JWT_REFRESH_SECRET=your-32-character-refresh-secret-here

# Optional (can be set later)
SENDGRID_API_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
WHATSAPP_API_KEY=
SENTRY_DSN=
```

**Generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Access

### From Host Machine

```bash
# Using psql
psql -h localhost -U root -d awoofDB

# Password: root
```

### From pgAdmin

1. Go to http://localhost:5050
2. Login with `admin@admin.com` / `root`
3. Add server:
   - Host: `db` (or `localhost` if accessing from host)
   - Port: `5432`
   - Database: `awoofDB`
   - Username: `root`
   - Password: `root`

### From Backend Container

The backend automatically connects using:
- Host: `db` (Docker service name)
- Port: `5432`
- Database: `awoofDB`
- User: `root`
- Password: `root`

## Redis Access

### From Host Machine

```bash
redis-cli -h localhost -p 6379
```

### From Backend Container

The backend automatically connects using:
- Host: `redis` (Docker service name)
- Port: `6379`

## Troubleshooting

### Backend can't connect to database

1. Check if database is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps db
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs db
   ```

3. Verify connection string in backend logs

### Backend can't connect to Redis

1. Check if Redis is running:
   ```bash
   docker-compose -f docker-compose.dev.yml ps redis
   ```

2. Check Redis logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs redis
   ```

3. Test Redis connection:
   ```bash
   docker exec -it awoof_redis_container_dev redis-cli ping
   ```
   Should return `PONG`

### Port already in use

If ports 5432, 6379, or 5001 are already in use:

**Note:** Port 5000 is used by macOS AirPlay Receiver. We've configured the backend to use port 5001 externally to avoid conflicts.

1. Change ports in `docker-compose.dev.yml`
2. Or stop the conflicting service:
   ```bash
   # Find process using port
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

### Rebuild containers after code changes

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

### View container resource usage

```bash
docker stats
```

## Development Workflow

1. **Start services:**
   ```bash
   cd packages
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Develop backend:**
   - Code in `apps/backend/src/`
   - Changes auto-reload (tsx watch mode)
   - Check logs: `docker-compose -f docker-compose.dev.yml logs -f backend`

3. **Run migrations** (when ready):
   ```bash
   docker exec -it awoof-backend-dev npm run db:migrate
   ```

4. **Access database:**
   - pgAdmin: http://localhost:5050
   - Or use psql from host machine

5. **Test API:**
   ```bash
   curl http://localhost:5001/health
   ```

## Production

For production deployment, use:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Production setup uses:
- Optimized images
- Production environment variables
- Persistent volumes for data
- Health checks

## Next Steps

After Docker is running:
1. ✅ Verify all services are up
2. ✅ Create `.env` file with JWT secrets
3. ✅ Test backend health endpoint
4. ⏭️ Run database migrations
5. ⏭️ Start building features

