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

### 7. After dependency updates (e.g. security bumps in package.json)

After changing `package.json` or `package-lock.json` (e.g. bumping Next.js, axios, or adding overrides):

- **Backend:** The dev entrypoint runs `npm install` on every container start, so a **restart** is enough:
  ```bash
  cd packages
  docker-compose -f docker-compose.dev.yml restart backend
  ```
- **Web:** The dev entrypoint only runs `npm ci` when `node_modules` is missing or incomplete. To pick up new deps, **rebuild** and recreate the web container (so its `node_modules` volume is refreshed):
  ```bash
  cd packages
  docker-compose -f docker-compose.dev.yml up -d --build web
  ```
  If the web container still has old modules, tear down the web service and its anonymous volume, then bring it back up:
  ```bash
  docker-compose -f docker-compose.dev.yml stop web
  docker-compose -f docker-compose.dev.yml rm -f web
  docker-compose -f docker-compose.dev.yml up -d --build web
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

### Web frontend

- **Container:** `awoof-frontend-dev`
- **Build context:** `../apps/web` (relative to `packages/`) — so the image is built from `apps/web` and reads `package.json` / `package-lock.json` from there.
- **Port:** `3000`
- **URL:** http://localhost:3000
- **Volumes:**
  - `../apps/web:/app` — host `apps/web` is mounted over container `/app` (source code and config come from the host).
  - `/app/node_modules` — anonymous volume so the container keeps its own `node_modules` (Linux binaries) and the host’s `node_modules` don’t overwrite them.

On first start (or after `docker-compose down -v`), the anonymous volume is empty, so the container’s `/app/node_modules` would be missing and you’d see “Module not found” for packages like `framer-motion`, `gsap`, `@radix-ui/react-accordion`. The web image’s **entrypoint** (`docker-entrypoint.dev.sh`) runs `npm ci` when it detects missing or incomplete `node_modules`, then starts the dev server. So the first startup may take a bit longer; later starts reuse the volume. If you add or change dependencies in `apps/web/package.json`, rebuild the web image and restart (or run `docker-compose -f docker-compose.dev.yml up -d --build web`).

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

### Web: "Module not found" for framer-motion, gsap, @radix-ui, etc.

This happens when the container’s `node_modules` is empty or incomplete.

1. **Cause:** Compose mounts host `apps/web` at `/app` and uses an anonymous volume for `/app/node_modules`. That volume can be empty or stale; the entrypoint runs `npm ci` when it detects missing packages (e.g. `framer-motion`, `next`).
2. **Fix (run from `packages/` directory):**
   ```bash
   cd packages
   docker-compose -f docker-compose.dev.yml build --no-cache web
   docker-compose -f docker-compose.dev.yml up -d web
   ```
   Watch logs: `docker-compose -f docker-compose.dev.yml logs -f web`. You should see `[entrypoint] node_modules missing or incomplete — running npm ci...` then the dev server. First run can take 1–2 minutes.
3. **If it still fails:** Tear down and recreate the web container (and its anonymous volume) so the entrypoint runs again:
   ```bash
   docker-compose -f docker-compose.dev.yml stop web
   docker-compose -f docker-compose.dev.yml rm -f web
   docker-compose -f docker-compose.dev.yml up -d web
   ```
4. **After adding new packages in `apps/web`:** Rebuild and restart:  
   `docker-compose -f docker-compose.dev.yml up -d --build web`

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

## Production (VPS)

For production deployment on the VPS, use from the **repository root**:
```bash
docker compose -f docker-compose.hostinger.yml up -d
```

See `DEPLOYMENT.md` at the repo root for full production setup. The Hostinger compose uses:
- Dockerfile.prod for web and backend
- Production environment variables (see env.deployment.example)
- Persistent volumes for PostgreSQL and Redis

## Next Steps

After Docker is running:
1. ✅ Verify all services are up
2. ✅ Create `.env` file with JWT secrets
3. ✅ Test backend health endpoint
4. ⏭️ Run database migrations
5. ⏭️ Start building features

