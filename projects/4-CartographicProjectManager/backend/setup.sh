#!/bin/bash

# Cartographic Project Manager - Backend Quick Start
# This script helps you get the backend server up and running quickly

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   🗺️  Cartographic Project Manager - Backend Setup             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    echo "   Try: cd backend && ./setup.sh"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔧 Step 2: Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file - Please edit it with your actual configuration!"
    echo ""
    echo "   Important: Update these values in .env:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - JWT_SECRET (use a strong random value in production)"
    echo "   - JWT_REFRESH_SECRET (use a different strong random value)"
    echo ""
    read -p "Press Enter once you've updated .env file..." </dev/tty
else
    echo "✅ .env file exists"
fi

echo ""
echo "🗄️  Step 3: Setting up database..."

# Check if PostgreSQL is accessible
echo "   Checking database connection..."
if npx prisma db pull --force 2>/dev/null; then
    echo "   ✅ Database connection successful"
elif npx prisma db push 2>/dev/null; then
    echo "   ✅ Database schema pushed successfully"
else
    echo "   ⚠️  Could not connect to database automatically"
    echo "   Please make sure PostgreSQL is running and DATABASE_URL is correct"
    echo ""
    echo "   Quick PostgreSQL setup:"
    echo "   1. Install PostgreSQL: https://www.postgresql.org/download/"
    echo "   2. Create database: createdb cartographic_manager"
    echo "   3. Update DATABASE_URL in .env"
    echo ""
    read -p "Press Enter to continue anyway..." </dev/tty
fi

echo ""
echo "🔨 Step 4: Generating Prisma client..."
npm run prisma:generate

echo ""
echo "🗃️  Step 5: Running database migrations..."
npm run prisma:migrate || echo "⚠️  Migration failed - you may need to run it manually"

echo ""
echo "🌱 Step 6: Seeding database..."
read -p "Do you want to seed the database with sample data? (y/N) " -n 1 -r </dev/tty
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run prisma:seed || echo "⚠️  Seeding failed - continuing anyway"
else
    echo "Skipping database seeding"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║   ✅ Backend Setup Complete!                                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📖 The API will be available at:"
echo "   http://localhost:3000/api/v1"
echo ""
echo "🔍 Useful commands:"
echo "   npm run dev         - Start development server with auto-reload"
echo "   npm run build       - Build for production"
echo "   npm run start       - Start production server"
echo "   npm run prisma:studio - Open Prisma Studio (database GUI)"
echo "   npm test            - Run tests"
echo ""
echo "📚 Documentation:"
echo "   - API Documentation: http://localhost:3000/api/v1/docs (when running)"
echo "   - Backend Guide: ../docs/BACKEND-IMPLEMENTATION.md"
echo "   - Prisma Schema: prisma/schema.prisma"
echo ""
