#!/bin/bash

# Playwright Installation Script for Mobile Testing
# This installs Playwright and its browser dependencies

echo "Installing Playwright..."

cd /mnt/d/Dev2/digital-transformation/app

# Install Playwright as dev dependency
npm install --save-dev @playwright/test

# Install browser binaries (chromium, firefox, webkit)
npx playwright install

# Install system dependencies for browsers (for WSL/Linux)
npx playwright install-deps

echo ""
echo "✅ Playwright installation complete!"
echo ""
echo "You can now run mobile tests with:"
echo "  npx playwright test"
echo ""
echo "Or use Playwright to debug the site with:"
echo "  npx playwright codegen http://localhost:5173"
