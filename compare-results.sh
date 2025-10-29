#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Comparing wouter-vue vs vue-router results"
echo "=========================================="
echo ""

# Function to extract size from artillery report
extract_size() {
  local file=$1
  if [ -f "$file" ]; then
    node -e "
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync('$file', 'utf8'));
      const stats = data.aggregate?.http?.responseData?.transferred || data.aggregate?.http?.downloaded_bytes || 0;
      const count = data.aggregate?.http?.requestsCompleted || 0;
      const avg = count > 0 ? Math.round(stats / count) : 0;
      console.log('Total:', stats, 'bytes');
      console.log('Average per request:', avg, 'bytes');
      console.log('Requests:', count);
    " 2>/dev/null || echo "N/A"
  else
    echo "Report not found"
  fi
}

echo "=== Playwright Test Results ==="
echo ""
echo "Wouter-Vue:"
if [ -f "$ROOT_DIR/examples/example/testkit/test-results" ]; then
  echo "  Test results: $(find $ROOT_DIR/examples/example/testkit/test-results -name '*.json' | wc -l) files"
else
  echo "  No test results found"
fi

echo ""
echo "Vue-Router:"
if [ -f "$ROOT_DIR/examples/example-vue-router/testkit/test-results" ]; then
  echo "  Test results: $(find $ROOT_DIR/examples/example-vue-router/testkit/test-results -name '*.json' | wc -l) files"
else
  echo "  No test results found"
fi

echo ""
echo "=== Artillery Load Test Results ==="
echo ""
echo "Wouter-Vue:"
extract_size "$ROOT_DIR/examples/example/testkit/artillery-report.json"

echo ""
echo "Vue-Router:"
extract_size "$ROOT_DIR/examples/example-vue-router/testkit/artillery-report.json"

echo ""
echo "=== Build Sizes ==="
echo ""
echo "Wouter-Vue client bundle:"
if [ -d "$ROOT_DIR/examples/example/dist/client/assets" ]; then
  du -sh "$ROOT_DIR/examples/example/dist/client/assets" | awk '{print $1}'
  echo "  Files: $(find $ROOT_DIR/examples/example/dist/client/assets -type f | wc -l)"
else
  echo "  Not built"
fi

echo ""
echo "Vue-Router client bundle:"
if [ -d "$ROOT_DIR/examples/example-vue-router/dist/client/assets" ]; then
  du -sh "$ROOT_DIR/examples/example-vue-router/dist/client/assets" | awk '{print $1}'
  echo "  Files: $(find $ROOT_DIR/examples/example-vue-router/dist/client/assets -type f | wc -l)"
else
  echo "  Not built"
fi

echo ""
echo "=========================================="


