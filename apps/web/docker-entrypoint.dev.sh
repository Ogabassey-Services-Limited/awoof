#!/bin/sh
set -e
cd /app

# When compose mounts host apps/web over /app, the anonymous volume at
# /app/node_modules is empty on first run. Install deps so framer-motion,
# gsap, @radix-ui/*, etc. are available.
NEED_INSTALL=0
if [ ! -d node_modules ]; then NEED_INSTALL=1; fi
if [ -d node_modules ] && [ ! -d node_modules/next ]; then NEED_INSTALL=1; fi
if [ -d node_modules ] && [ ! -d node_modules/framer-motion ]; then NEED_INSTALL=1; fi

if [ "$NEED_INSTALL" = "1" ]; then
  echo "[entrypoint] node_modules missing or incomplete — running npm ci..."
  npm ci
  echo "[entrypoint] npm ci done. Starting dev server."
fi

exec "$@"
