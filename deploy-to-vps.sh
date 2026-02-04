#!/usr/bin/env bash
# Deploy from local machine to VPS. Usage: ./deploy-to-vps.sh
# Set VPS_HOST, VPS_USER, DEPLOY_SSH_KEY (optional) via env or edit below.

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

SSH_OPTS="-o StrictHostKeyChecking=no"
if [ -n "$DEPLOY_SSH_KEY" ]; then
  RSYNC_SSH="ssh -i $DEPLOY_SSH_KEY $SSH_OPTS"
  SSH_CMD="ssh -i $DEPLOY_SSH_KEY $SSH_OPTS"
else
  RSYNC_SSH="ssh $SSH_OPTS"
  SSH_CMD="ssh $SSH_OPTS"
fi

REMOTE="${VPS_USER}@${VPS_HOST}:~/awoof/"

echo "Syncing files to ${VPS_USER}@${VPS_HOST}..."
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

echo "Building and starting containers on VPS..."
$SSH_CMD "${VPS_USER}@${VPS_HOST}" \
  "sg docker -c 'cd ~/awoof && docker compose -f docker-compose.hostinger.yml up -d --build'"

echo "Done. Containers:"
sleep 5
$SSH_CMD "${VPS_USER}@${VPS_HOST}" \
  "sg docker -c 'cd ~/awoof && docker compose -f docker-compose.hostinger.yml ps'"

echo ""
echo "Migrations (if needed): ssh ${VPS_USER}@${VPS_HOST} \"cd ~/awoof && sg docker -c 'docker compose -f docker-compose.hostinger.yml exec backend npm run db:migrate:prod'\""
