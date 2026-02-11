#!/usr/bin/env bash
# Build Docker images on your laptop (fast npm), then sync and run on VPS (no npm on VPS).
# Use this when the VPS has flaky outbound network and "npm ci" fails with ETIMEDOUT/ECONNRESET.
#
# Usage: ./deploy-to-vps-build-local.sh
# Optional: set NEXT_PUBLIC_API_URL in .env or export it so the web image gets the right API URL.

set -e

VPS_HOST="${VPS_HOST:-82.29.190.219}"
VPS_USER="${VPS_USER:-developer}"
DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -z "$VPS_HOST" ] || [ -z "$VPS_USER" ]; then
  echo "Set VPS_HOST and VPS_USER (or edit this script)."
  exit 1
fi

# Load .env so NEXT_PUBLIC_API_URL is set for the web build (optional)
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

SSH_OPTS="-o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=10"
if [ -n "$DEPLOY_SSH_KEY" ]; then
  RSYNC_SSH="ssh -i $DEPLOY_SSH_KEY $SSH_OPTS"
  SSH_CMD="ssh -i $DEPLOY_SSH_KEY $SSH_OPTS"
else
  RSYNC_SSH="ssh $SSH_OPTS"
  SSH_CMD="ssh $SSH_OPTS"
fi

REMOTE="${VPS_USER}@${VPS_HOST}:~/awoof/"
COMPOSE_FILE="docker-compose.hostinger.yml"
# Match project name used on VPS so image names are awoof-web, awoof-backend
export COMPOSE_PROJECT_NAME=awoof

echo "=== 1/4 Building images locally (this uses your laptop's network) ==="
docker compose -f "$COMPOSE_FILE" build

echo ""
echo "=== 2/4 Saving images to tarballs ==="
docker save awoof-web:latest -o /tmp/awoof-web.tar
docker save awoof-backend:latest -o /tmp/awoof-backend.tar

echo ""
echo "=== 3/4 Syncing code and image tarballs to VPS ==="
rsync -avz --delete \
  -e "$RSYNC_SSH" \
  --exclude 'node_modules' \
  --exclude 'apps/*/node_modules' \
  --exclude 'packages/node_modules' \
  --exclude '.next' \
  --exclude 'apps/web/.next' \
  --exclude '.git/objects' \
  --exclude '*.log' \
  --exclude '.env' \
  ./ "$REMOTE"
scp -o StrictHostKeyChecking=no /tmp/awoof-web.tar /tmp/awoof-backend.tar "${REMOTE}"

echo ""
echo "=== 4/4 Loading images on VPS and starting containers ==="
$SSH_CMD "${VPS_USER}@${VPS_HOST}" "cd ~/awoof && sg docker -c 'docker load -i awoof-web.tar && docker load -i awoof-backend.tar && COMPOSE_PROJECT_NAME=awoof docker compose -f $COMPOSE_FILE up -d'"

# Cleanup tarballs on VPS and locally
$SSH_CMD "${VPS_USER}@${VPS_HOST}" "rm -f ~/awoof/awoof-web.tar ~/awoof/awoof-backend.tar"
rm -f /tmp/awoof-web.tar /tmp/awoof-backend.tar

echo ""
echo "Done. Containers:"
sleep 5
$SSH_CMD "${VPS_USER}@${VPS_HOST}" "sg docker -c 'cd ~/awoof && docker compose -f $COMPOSE_FILE ps'"

echo ""
echo "Migrations (if needed): ssh ${VPS_USER}@${VPS_HOST} \"cd ~/awoof && sg docker -c 'docker compose -f $COMPOSE_FILE exec backend npm run db:migrate:prod'\""
