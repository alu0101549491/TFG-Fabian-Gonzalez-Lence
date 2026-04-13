#!/bin/bash

# ============================================
# Render Deployment Verification Script
# ============================================
# Quick checks before deploying to Render

set -e

BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_DIR"

echo "🔍 Render Pre-Deploy Verification"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Node version
echo "1️⃣  Checking Node.js version..."
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    check_pass "Node.js $NODE_VERSION (>= 20 required)"
else
    check_fail "Node.js $NODE_VERSION (>= 20 required)"
    exit 1
fi
echo ""

# 2. Check if render.yaml exists
echo "2️⃣  Checking configuration files..."

# Check root render.yaml (monorepo setup)
if [ -f "../../../render.yaml" ]; then
    check_pass "Root render.yaml found (monorepo setup)"
else
    check_fail "Root render.yaml not found at repository root"
    echo "   Expected location: /render.yaml"
    exit 1
fi

if [ -f ".env.render.example" ]; then
    check_pass ".env.render.example found"
else
    check_warn ".env.render.example not found (optional)"
fi
echo ""

# 3. Check package.json scripts
echo "3️⃣  Checking package.json scripts..."
if grep -q '"build":' package.json; then
    check_pass "Build script exists"
else
    check_fail "Build script missing in package.json"
    exit 1
fi

if grep -q '"start":' package.json; then
    check_pass "Start script exists"
else
    check_fail "Start script missing in package.json"
    exit 1
fi
echo ""

# 4. Check Prisma schema
echo "4️⃣  Checking Prisma configuration..."
if [ -f "prisma/schema.prisma" ]; then
    check_pass "Prisma schema found"
else
    check_fail "Prisma schema not found"
    exit 1
fi

if [ -d "prisma/migrations" ]; then
    MIGRATION_COUNT=$(find prisma/migrations -type d -mindepth 1 | wc -l)
    check_pass "Found $MIGRATION_COUNT migration(s)"
else
    check_warn "No migrations folder found"
fi
echo ""

# 5. Check dependencies
echo "5️⃣  Checking dependencies..."
if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json found (good for reproducible builds)"
else
    check_warn "package-lock.json not found (run 'npm install')"
fi
echo ""

# 6. Try a test build (optional)
echo "6️⃣  Testing build process..."
if command -v npm &> /dev/null; then
    if [ ! -d "node_modules" ]; then
        check_warn "node_modules not found. Skipping build test."
        check_warn "Run 'npm install' to test locally."
    else
        echo "   Running: npm run build"
        if npm run build > /dev/null 2>&1; then
            check_pass "Build successful"
        else
            check_fail "Build failed. Fix errors before deploying."
            exit 1
        fi
    fi
else
    check_warn "npm not found, skipping build test"
fi
echo ""

# 7. Check for sensitive files
echo "7️⃣  Checking for sensitive files..."
if git check-ignore .env > /dev/null 2>&1; then
    check_pass ".env is in .gitignore"
else
    check_fail ".env NOT in .gitignore (security risk!)"
fi

if git check-ignore .env.render > /dev/null 2>&1; then
    check_pass ".env.render is in .gitignore"
else
    check_warn ".env.render not in .gitignore (add it for safety)"
fi
echo ""

# 8. Environment variables checklist
echo "8️⃣  Environment variables checklist:"
echo ""
echo "   You'll need to set these in Render Dashboard:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   📌 CORS_ORIGIN (your GitHub Pages URL)"
echo "   📌 SOCKET_CORS_ORIGIN (your GitHub Pages URL)"
echo "   📌 DROPBOX_APP_KEY"
echo "   📌 DROPBOX_APP_SECRET"
echo "   📌 DROPBOX_REFRESH_TOKEN (run: npm run get-dropbox-token)"
echo ""
echo "   Auto-configured by render.yaml:"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✓ NODE_ENV"
echo "   ✓ PORT"
echo "   ✓ DATABASE_URL"
echo "   ✓ JWT_SECRET (auto-generated)"
echo "   ✓ JWT_REFRESH_SECRET (auto-generated)"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Pre-deployment checks passed!${NC}"
echo ""
echo "📚 Next steps:"
echo ""
echo "   1. Commit configuration files:"
echo "      cd ../../../"
echo "      git add render.yaml RENDER-MONOREPO.md"
echo "      git add projects/4-CartographicProjectManager/backend/RENDER.md"
echo "      git add projects/4-CartographicProjectManager/backend/.env.render.example"
echo "      git commit -m 'Add Render deployment configuration'"
echo "      git push origin main"
echo ""
echo "   2. Generate Dropbox token (if not done):"
echo "      npm run get-dropbox-token"
echo ""
echo "   3. Deploy to Render:"
echo "      • Go to https://render.com"
echo "      • New → Blueprint"
echo "      • Select your repository"
echo "      • Render will detect /render.yaml (root)"
echo "      • Set manual environment variables"
echo "      • Deploy!"
echo ""
echo "   📖 Full guide: RENDER.md"
echo "   📋 Checklist: MIGRATION-CHECKLIST.md"
echo "   🏗️  Monorepo setup: /RENDER-MONOREPO.md"
echo ""
