#!/bin/bash

# ============================================================
# Cartographic Project Manager (CPM) — Initialization Script
# ============================================================
# This script sets up the development environment for the
# Cartographic Project Manager project.
#
# Usage:
#   chmod +x initialization.sh
#   ./initialization.sh
# ============================================================

set -e

echo "============================================"
echo " Cartographic Project Manager — Setup"
echo "============================================"
echo ""

# ---- Check prerequisites ----
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js is not installed. Please install Node.js >= 18.x"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js version >= 18 required (found $(node -v))"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "ERROR: npm is not installed."
  exit 1
fi

echo "  Node.js $(node -v) ✓"
echo "  npm $(npm -v) ✓"
echo ""

# ---- Install dependencies ----
echo "Installing dependencies..."
npm install
echo ""

# ---- Verify installation ----
echo "Verifying installation..."
npx vue-tsc --version > /dev/null 2>&1 && echo "  vue-tsc ✓" || echo "  vue-tsc ✗"
npx vite --version > /dev/null 2>&1 && echo "  vite ✓" || echo "  vite ✗"
npx jest --version > /dev/null 2>&1 && echo "  jest ✓" || echo "  jest ✗"
npx eslint --version > /dev/null 2>&1 && echo "  eslint ✓" || echo "  eslint ✗"
echo ""

# ---- Summary ----
echo "============================================"
echo " Setup complete!"
echo "============================================"
echo ""
echo " Available commands:"
echo "   npm run dev          — Start development server"
echo "   npm run build        — Build for production"
echo "   npm run test         — Run test suite"
echo "   npm run test:coverage — Run tests with coverage"
echo "   npm run lint         — Lint source code"
echo "   npm run lint:fix     — Lint and auto-fix"
echo "   npm run doc          — Generate TypeDoc docs"
echo ""
echo " Development server: http://localhost:5173/4-CartographicProjectManager/"
echo ""
