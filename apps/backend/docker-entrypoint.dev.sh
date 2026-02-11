#!/bin/sh
set -e
# Ensure container node_modules are in sync with package.json (e.g. after adding helmet, express-rate-limit)
echo "[entrypoint] Running npm install..."
npm install
echo "[entrypoint] Starting dev server..."
exec "$@"
