#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Clean previous outputs
rm -rf testkit/playwright-report testkit/test-results || true

echo "[1/5] Building (client + server)..."
pnpm run build >/dev/null

echo "[2/5] Starting SSR server..."
NODE_ENV=production node server.js >/tmp/example-ssr.log 2>&1 &
SERVER_PID=$!

# Wait for server
TRIES=50
until curl -sf http://localhost:5173/ >/dev/null 2>&1; do
  TRIES=$((TRIES-1))
  if [ $TRIES -le 0 ]; then
    echo "Server did not start. Logs:" && tail -n 100 /tmp/example-ssr.log
    kill -9 "$SERVER_PID" >/dev/null 2>&1 || true
    exit 1
  fi
  sleep 0.2
done

echo "[3/5] Running Playwright tests..."
pnpm exec playwright test -c testkit/playwright.config.js || PW_STATUS=$?

echo "[4/5] Running Artillery..."
pnpm exec artillery run testkit/artillery-config.yml --output testkit/artillery-report.json || ART_STATUS=$?

echo "[5/5] Stopping server (pid=$SERVER_PID)..."
kill "$SERVER_PID" >/dev/null 2>&1 || true
sleep 0.5
kill -9 "$SERVER_PID" >/dev/null 2>&1 || true

# Exit code summarization
PW_STATUS=${PW_STATUS:-0}
ART_STATUS=${ART_STATUS:-0}

if [ "$PW_STATUS" -ne 0 ] || [ "$ART_STATUS" -ne 0 ]; then
  echo "Done with failures: Playwright=$PW_STATUS, Artillery=$ART_STATUS"
  exit 1
fi

echo "All tests passed. Reports in testkit/."
