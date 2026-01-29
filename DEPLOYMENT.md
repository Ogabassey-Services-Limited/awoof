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
docker exec awoof-backend npm run db:migrate
```

(If your migrate script is different, use the command from your backend README.)

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

## Optional: Hostinger Docker Manager

If your plan includes **Docker Manager**:

1. In the Hostinger panel, open **VPS → Docker Manager**.
2. You can use **“Compose manually”** and paste the contents of `docker-compose.hostinger.yml`.  
   Note: build contexts (`build: ./apps/web`) require the project to be on the server; the Manager may not have access to your repo. Using **SSH + clone + docker compose** (steps above) is more reliable for this project.
3. **“Compose from URL”** is for a single compose file URL; it does not clone your repo, so it won’t work for our multi-service build without extra setup.

For this repo, **deploying via SSH and `docker compose -f docker-compose.hostinger.yml`** is the recommended approach.

---

## Optional: Reverse proxy (Nginx) for HTTPS and ports 80/443

To use a domain and HTTPS (and avoid exposing `:3000` and `:5001`):

1. Install Nginx and (optionally) Certbot:

   ```bash
   apt install -y nginx certbot python3-certbot-nginx
   ```

2. Configure Nginx to proxy:
   - `yourdomain.com` → `http://127.0.0.1:3000` (frontend)
   - `api.yourdomain.com` → `http://127.0.0.1:5001` (backend)

3. Set in `.env`:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - `CORS_ORIGIN=https://yourdomain.com`
   - `FRONTEND_URL=https://yourdomain.com`

4. Rebuild the frontend so it bakes in the new `NEXT_PUBLIC_API_URL`:

   ```bash
   docker compose -f docker-compose.hostinger.yml up -d --build web
   ```

5. Run Certbot for SSL:

   ```bash
   certbot --nginx -d yourdomain.com -d api.yourdomain.com
   ```

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

**Frontend shows “network error” or wrong API**

- Set `NEXT_PUBLIC_API_URL` in `.env` to the URL the **browser** uses to reach the API (e.g. `http://YOUR_VPS_IP:5001` or `https://api.yourdomain.com`).
- Rebuild the web service after changing `.env`:  
  `docker compose -f docker-compose.hostinger.yml up -d --build web`

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
5. Run migrations: `docker exec awoof-backend npm run db:migrate`.
6. Open ports 3000 and 5001 (and 22 for SSH).
7. Use `http://YOUR_VPS_IP:3000` and `http://YOUR_VPS_IP:5001` (or your domain with Nginx + SSL).

For more on Hostinger and Docker:

- [How to Use the Docker VPS Template at Hostinger](https://support.hostinger.com/en/articles/8306612-how-to-use-the-docker-vps-template)
- [Deploy your first container with Hostinger Docker Manager](https://www.hostinger.com/support/12040815-how-to-deploy-your-first-container-with-hostinger-docker-manager/)
