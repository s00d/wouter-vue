#!/bin/bash

echo "Running Artillery tests for vue-router..."
echo "========================================="

# Install Artillery if not installed
if ! command -v artillery &> /dev/null; then
  echo "Installing Artillery..."
  pnpm add -g artillery@latest
fi

# Run tests
artillery run artillery-config.yml --output artillery-report.json

# Generate readable summary
echo ""
echo "=========================================="
echo "Test completed successfully!"
echo "=========================================="
echo "JSON report: artillery-report.json"
echo "To view results, visit: https://app.artillery.io"
echo "Or analyze the JSON file directly"

