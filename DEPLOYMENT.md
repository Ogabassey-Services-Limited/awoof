# Deploying Awoof to Hostinger VPS with Docker

This guide walks you through deploying the Awoof frontend (Next.js) and backend (Express) to a **Hostinger VPS** using Docker.

## Hostinger options

- **Docker VPS template** – Ubuntu 24.04 with Docker and Docker Compose pre-installed (recommended).
- **Docker Manager** – Web UI in the Hostinger panel for managing containers (optional).
- **SSH + CLI** – Clone the repo and run `docker compose` from the server (recommended for this app).

---

## Prerequisites

1. **Hostinger VPS**  
   - Order a VPS and choose the **Docker** template if available, or any Ubuntu 24.04 VPS.
2. **SSH access**  
   - You need the VPS IP, root (or sudo) user, and password or SSH key.
3. **Domain (optional)**  
   - For production, point a domain (e.g. `app.yourdomain.com`, `api.yourdomain.com`) to the VPS IP.

---

## Step 1: Connect to your VPS

```bash
ssh root@YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with the IP from your Hostinger panel. Enter the password when prompted.

---

## Step 2: Install Docker (if not pre-installed)

If you did **not** use the Docker VPS template:

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2
systemctl enable docker && systemctl start docker
```

Check:

```bash
docker --version
docker compose version
```

---

## Step 3: Clone the repository

```bash
cd /var/www   # or any directory you prefer
git clone https://github.com/YOUR_USERNAME/awoof.git
cd awoof
```

For a **private** repo, either:

- Use **HTTPS** and a Personal Access Token when Git asks for a password, or  
- Add an SSH deploy key to the repo and clone via SSH:  
  `git clone git@github.com:YOUR_USERNAME/awoof.git`

---

## Step 4: Create environment file

Copy the deployment example and edit it with your values:

```bash
cp env.deployment.example .env
nano .env   # or use vim / your editor
```

**Required changes:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Public URL of your API (used by the browser) | `http://YOUR_VPS_IP:5001` or `https://api.yourdomain.com` |
| `DB_PASSWORD` | Strong PostgreSQL password | Use a long random string |
| `JWT_SECRET` | Secret for access tokens (32+ chars) | Generate (see below) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (32+ chars) | Generate (see below) |
| `CORS_ORIGIN` | Allowed frontend origin | `http://YOUR_VPS_IP:3000` or `https://app.yourdomain.com` |
| `FRONTEND_URL` | Same as CORS for redirects/emails | Same as `CORS_ORIGIN` |

**Generate JWT secrets (on your laptop or VPS):**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run twice and put the two values into `JWT_SECRET` and `JWT_REFRESH_SECRET`.

Save and exit the editor.

---

## Step 5: Build and start containers

From the **repository root** (`/var/www/awoof` or wherever you cloned):

```bash
docker compose -f docker-compose.hostinger.yml up -d --build
```

First run will build the frontend and backend images and start PostgreSQL and Redis. This can take several minutes.

Check that everything is running:

```bash
docker compose -f docker-compose.hostinger.yml ps
```

You should see `awoof-frontend`, `awoof-backend`, `awoof-postgres`, and `awoof-redis` with status “Up”.

---

## Step 6: Run database migrations

After the backend is up:

```bash
docker exec awoof-backend npm run db:migrate:prod
```

(If your migrate script is different, use the command from your backend README.)

---

## Create admin user

Create an admin with email `admin@awoof.tech` (or any email) so you can log in at `/auth/admin/login`.

**Local** (Docker DB running on 127.0.0.1:5432):

```bash
cd apps/backend
npm run admin:create -- admin@awoof.tech 'YourSecurePassword123!'
```

Use a strong password (the backend enforces length and complexity).

**VPS** (run inside the backend container; replace the password):

```bash
# On the VPS
cd ~/awoof
docker compose -f docker-compose.hostinger.yml exec backend node dist/scripts/create-admin.js admin@awoof.tech 'YourSecurePassword123!'
```

From your laptop:

```bash
ssh developer@82.29.190.219 "cd ~/awoof && sg docker -c 'docker compose -f docker-compose.hostinger.yml exec -T backend node dist/scripts/create-admin.js admin@awoof.tech YourSecurePassword123!'"
```

If the admin already exists, the script reports that and exits successfully.

---

## Step 7: Open firewall ports (if needed)

Hostinger VPS often has a firewall. Allow the app and API ports:

```bash
ufw allow 22/tcp    # SSH
ufw allow 3000/tcp  # Frontend
ufw allow 5001/tcp  # Backend API
ufw enable
ufw status
```

---

## Step 8: Access the app

- **Frontend:** `http://YOUR_VPS_IP:3000`  
- **Backend API:** `http://YOUR_VPS_IP:5001`  
- **Health check:** `http://YOUR_VPS_IP:5001/health`

Replace `YOUR_VPS_IP` with your actual VPS IP (or use your domain if you’ve pointed it to this IP).

---

## Deploy from local machine (no GitHub): `deploy-to-vps.sh`

To push code from your laptop and build on the VPS (no git push/pull on the server):

1. **One-time on VPS:** Ensure the project exists at `~/awoof` (e.g. clone once or create the directory and rsync will fill it).
2. **One-time on VPS:** Create `~/awoof/.env` from `env.deployment.example` and set secrets (see Step 4).
3. **From your laptop** (repo root):
   ```bash
   export VPS_HOST=YOUR_VPS_IP
   export VPS_USER=developer   # or your SSH user
   # export DEPLOY_SSH_KEY=~/.ssh/your_deploy_key   # optional
   chmod +x deploy-to-vps.sh
   ./deploy-to-vps.sh
   ```
4. **After first deploy or when new migrations exist**, run migrations on the VPS:
   ```bash
   ssh developer@YOUR_VPS_IP "cd ~/awoof && sg docker -c 'docker compose -f docker-compose.hostinger.yml exec backend npm run db:migrate:prod'"
   ```
   (Or use `docker exec awoof-backend npm run db:migrate:prod` if you're already on the VPS with Docker.)

The script **rsyncs** the repo (excluding `node_modules`, `.next`, `.env`, `.git/objects`) to `~/awoof/`, then runs **docker compose -f docker-compose.hostinger.yml up -d --build** on the VPS. Your local `.env` is not overwritten on the server.

---

## Optional: Hostinger Docker Manager

If your plan includes **Docker Manager**:

1. In the Hostinger panel, open **VPS → Docker Manager**.
2. You can use **“Compose manually”** and paste the contents of `docker-compose.hostinger.yml`.  
   Note: build contexts (`build: ./apps/web`) require the project to be on the server; the Manager may not have access to your repo. Using **SSH + clone + docker compose** (steps above) is more reliable for this project.
3. **“Compose from URL”** is for a single compose file URL; it does not clone your repo, so it won’t work for our multi-service build without extra setup.

For this repo, **deploying via SSH and `docker compose -f docker-compose.hostinger.yml`** is the recommended approach.

---

## Optional: Reverse proxy (Nginx) for HTTPS and ports 80/443

To use a domain and HTTPS (and avoid exposing `:3000` and `:5001`).

### Example: Frontend on awoof.tech, API on api.awoof.tech

**1. DNS (at your domain registrar)**

- **awoof.tech** – A record → your VPS IP (e.g. `82.29.190.219`).  
  (If the frontend already works on awoof.tech, this is done.)
- **api.awoof.tech** – A record → same VPS IP.

**2. On the VPS: install Nginx and Certbot**

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

**3. Nginx config**

Create a server block (e.g. `sudo nano /etc/nginx/sites-available/awoof`):

```nginx
# Frontend – awoof.tech
server {
    listen 80;
    server_name awoof.tech www.awoof.tech;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API – api.awoof.tech
server {
    listen 80;
    server_name api.awoof.tech;
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/awoof /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**4. Get SSL certificates**

```bash
sudo certbot --nginx -d awoof.tech -d www.awoof.tech -d api.awoof.tech
```

Follow the prompts. Certbot will configure HTTPS and redirect HTTP → HTTPS.

**5. Set `.env` on the VPS** (in `~/awoof/.env`)

```env
NEXT_PUBLIC_API_URL=https://api.awoof.tech
CORS_ORIGIN=https://awoof.tech
FRONTEND_URL=https://awoof.tech
```

**6. Rebuild the frontend** so the client uses `https://api.awoof.tech`:

```bash
cd ~/awoof
sg docker -c 'docker compose -f docker-compose.hostinger.yml up -d --build web'
```

Or from your Mac after a full deploy: `./deploy-to-vps.sh` (with the same `.env` on the VPS).

**7. (Optional) Firewall**

If you no longer want to expose 3000/5001 directly:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Then remove or comment out the `ports:` mapping for 3000 and 5001 in `docker-compose.hostinger.yml` if you want traffic only via Nginx on 80/443.

---

**Generic form** (any domain):

- Frontend: `yourdomain.com` → `http://127.0.0.1:3000`
- API: `api.yourdomain.com` → `http://127.0.0.1:5001`
- In `.env`: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`, `CORS_ORIGIN=https://yourdomain.com`, `FRONTEND_URL=https://yourdomain.com`
- Certbot: `certbot --nginx -d yourdomain.com -d api.yourdomain.com`

---

## GitHub Actions CI/CD (auto-deploy on push)

A workflow in `.github/workflows/deploy.yml` deploys to your VPS when you push to the `main` branch (or when you run it manually from the Actions tab).

### One-time setup

1. **Create an SSH key for GitHub Actions** (or reuse one that can log in to the VPS as `developer`):
   - On your laptop: `ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""`
   - Add the **public** key to the VPS:  
     `ssh-copy-id -i ~/.ssh/github_deploy.pub developer@82.29.190.219`  
     (Or paste the contents of `~/.ssh/github_deploy.pub` into `~/.ssh/authorized_keys` on the VPS.)

2. **Add repository secrets** in GitHub:
   - Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - **`VPS_SSH_KEY`**: Paste the **entire** contents of the **private** key file (`~/.ssh/github_deploy`), including the `-----BEGIN ... -----` and `-----END ... -----` lines.
   - (Optional) **`VPS_HOST`**: VPS IP (default in workflow: `82.29.190.219`).
   - (Optional) **`VPS_USER`**: SSH user (default: `developer`).

3. **Ensure `.env` exists on the VPS**  
   The workflow does **not** overwrite `~/awoof/.env` (it’s excluded from rsync). Create it once on the VPS (e.g. from `env.deployment.example`) and keep it there.

### What the workflow does

- **Trigger:** Push to `main`, or manual run via **Actions** → **Deploy to VPS** → **Run workflow**.
- **Steps:** Checkout repo → rsync code to `~/awoof/` on the VPS (excluding `node_modules`, `.next`, `.env`) → SSH and run `docker compose -f docker-compose.hostinger.yml up -d --build` (via `sg docker`).
- **Branches:** To deploy from another branch (e.g. `staging`), edit `.github/workflows/deploy.yml` and add that branch under `on.push.branches`.

### If the workflow fails

- **Permission denied (publickey):** Check that `VPS_SSH_KEY` is the full private key and that the matching public key is in the VPS user’s `~/.ssh/authorized_keys`.
- **rsync or docker permission errors:** Confirm the VPS user is in the `docker` group (`groups` should include `docker`).
- **Containers not starting:** SSH to the VPS and run `docker compose -f docker-compose.hostinger.yml logs` to inspect errors.

---

## Production hardening (built into this app)

- **Swagger** (`/api-docs`) and root endpoint details are **disabled in production** to reduce API surface exposure.
- **Health** endpoint omits `environment` in production.
- **Logging**: Backend uses `appLogger`; verbose logs only in development; errors always logged.
- **Secrets**: No defaults for JWT or DB in production; use `.env` from `env.deployment.example`.
- **Docker image**: Dev-only scripts (e.g. clear-test-accounts, create-admin) are excluded from the production image via `.dockerignore`.

## Useful commands

| Task | Command |
|------|--------|
| View logs | `docker compose -f docker-compose.hostinger.yml logs -f` |
| Backend logs only | `docker compose -f docker-compose.hostinger.yml logs -f backend` |
| Stop all | `docker compose -f docker-compose.hostinger.yml down` |
| Rebuild and start | `docker compose -f docker-compose.hostinger.yml up -d --build` |
| Create admin user | `docker exec -it awoof-backend npm run admin:create:docker` |

---

## Troubleshooting

**Backend can’t connect to database**

- Ensure `db` is healthy: `docker compose -f docker-compose.hostinger.yml ps`
- Check that `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env` match the `POSTGRES_*` values used by the `db` service in `docker-compose.hostinger.yml`.

**“Mixed Content” or “requested an insecure XMLHttpRequest” blocked**

- If the site is served over **HTTPS** (e.g. `https://awoof.tech`), the browser will **block** requests to **HTTP** URLs (e.g. `http://82.29.190.219:5001`). You must use an **HTTPS** API URL.
- **Fix:** Set up the API on a domain with SSL (e.g. `api.awoof.tech`) as in the “Custom domain and HTTPS” section above, set `NEXT_PUBLIC_API_URL=https://api.awoof.tech` in `~/awoof/.env`, then rebuild the web image and redeploy.

**Frontend shows “network error” or wrong API / still calls localhost**

- `NEXT_PUBLIC_API_URL` is **baked into the frontend at build time** (Next.js inlines it). Changing `.env` only takes effect after the **web image is rebuilt**.
- On the VPS, set `NEXT_PUBLIC_API_URL` in `~/awoof/.env` (e.g. `http://82.29.190.219:5001` or `https://api.awoof.tech`). Then rebuild so the new value is used:
  - `cd ~/awoof && docker compose -f docker-compose.hostinger.yml build --no-cache web && docker compose -f docker-compose.hostinger.yml up -d`
- Use `--no-cache` if a previous build had the wrong value (otherwise Docker may reuse the old cached layer with localhost).
- When using `deploy-to-vps.sh`, the build runs on the VPS and reads `~/awoof/.env`; ensure that file exists and contains `NEXT_PUBLIC_API_URL` **before** you deploy.

**Port already in use**

- Change the host ports in `docker-compose.hostinger.yml` (e.g. `"8080:3000"` for web, `"5002:5000"` for backend) and update `NEXT_PUBLIC_API_URL` and firewall accordingly.

**Out of memory during build**

- Build on a machine with more RAM, push images to a registry, and pull them on the VPS; or increase VPS RAM.

---

## Summary

1. SSH into Hostinger VPS.
2. Install Docker if needed; clone the repo.
3. Copy `env.deployment.example` to `.env` and set secrets and URLs.
4. Run `docker compose -f docker-compose.hostinger.yml up -d --build`.
5. Run migrations: `docker exec awoof-backend npm run db:migrate:prod`.
6. Create an admin: `docker compose -f docker-compose.hostinger.yml exec backend node dist/scripts/create-admin.js admin@awoof.tech 'YourPassword'`.
7. Open ports 3000 and 5001 (and 22 for SSH).
8. Use `http://YOUR_VPS_IP:3000` and `http://YOUR_VPS_IP:5001` (or your domain with Nginx + SSL).

For more on Hostinger and Docker:

- [How to Use the Docker VPS Template at Hostinger](https://support.hostinger.com/en/articles/8306612-how-to-use-the-docker-vps-template)
- [Deploy your first container with Hostinger Docker Manager](https://www.hostinger.com/support/12040815-how-to-deploy-your-first-container-with-hostinger-docker-manager/)
