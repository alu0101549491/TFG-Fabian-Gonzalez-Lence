#!/bin/bash

# Supabase Project Setup Script
# This script initializes both CARTO and TENNIS Supabase projects locally

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════"
echo "🚀 Supabase Multi-Project Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo ""
    echo "Install with:"
    echo "  npm install -g supabase"
    echo "  # or"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found: $(supabase --version)${NC}"
echo ""

# Login to Supabase
echo -e "${BLUE}🔐 Logging in to Supabase...${NC}"
supabase login

echo ""
echo "════════════════════════════════════════════════════════════"
echo "📦 Setting up CARTO Project"
echo "════════════════════════════════════════════════════════════"
echo ""

cd carto-backend

# Check if already initialized
if [ ! -f "config.toml" ]; then
    echo -e "${BLUE}Initializing Supabase project...${NC}"
    supabase init
else
    echo -e "${YELLOW}⚠️  Project already initialized${NC}"
fi

echo ""
echo -e "${BLUE}Enter your CARTO Supabase project reference:${NC}"
echo "(Find it in Supabase Dashboard → Settings → General → Reference ID)"
read -p "Project Ref: " CARTO_PROJECT_REF

if [ -n "$CARTO_PROJECT_REF" ]; then
    echo -e "${BLUE}Linking to Supabase project...${NC}"
    supabase link --project-ref "$CARTO_PROJECT_REF"
    echo -e "${GREEN}✅ CARTO project linked${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping project linking${NC}"
fi

cd ../..

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎾 Setting up TENNIS Project"
echo "════════════════════════════════════════════════════════════"
echo ""

cd tennis-backend

# Check if already initialized
if [ ! -f "config.toml" ]; then
    echo -e "${BLUE}Initializing Supabase project...${NC}"
    supabase init
else
    echo -e "${YELLOW}⚠️  Project already initialized${NC}"
fi

echo ""
echo -e "${BLUE}Enter your TENNIS Supabase project reference:${NC}"
echo "(Find it in Supabase Dashboard → Settings → General → Reference ID)"
read -p "Project Ref: " TENNIS_PROJECT_REF

if [ -n "$TENNIS_PROJECT_REF" ]; then
    echo -e "${BLUE}Linking to Supabase project...${NC}"
    supabase link --project-ref "$TENNIS_PROJECT_REF"
    echo -e "${GREEN}✅ TENNIS project linked${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping project linking${NC}"
fi

cd ../..

echo ""
echo "════════════════════════════════════════════════════════════"
echo "🎉 Setup Complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo ""
echo "1. Generate database migrations:"
echo "   $ npm run supabase:generate-migrations"
echo ""
echo "2. Start local Supabase (requires Docker):"
echo "   $ cd supabase/carto-backend && supabase start"
echo "   $ cd supabase/tennis-backend && supabase start"
echo ""
echo "3. Apply migrations locally:"
echo "   $ cd supabase/carto-backend && supabase db reset"
echo "   $ cd supabase/tennis-backend && supabase db reset"
echo ""
echo "4. Deploy to production:"
echo "   $ cd supabase/carto-backend && supabase db push"
echo "   $ cd supabase/tennis-backend && supabase db push"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Main guide: /SUPABASE-MIGRATION-GUIDE.md"
echo "   - CARTO: /supabase/carto-backend/README.md"
echo "   - TENNIS: /supabase/tennis-backend/README.md"
echo ""
echo "═══════════════════════════════════════════════════════════"
