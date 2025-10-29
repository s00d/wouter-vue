#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
pnpm run build
PORT=${PORT:-5174} NODE_ENV=production node server.js

