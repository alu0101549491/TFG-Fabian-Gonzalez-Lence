# Supabase Backend Infrastructure

This directory contains the Supabase backend infrastructure for both CARTO and TENNIS projects.

## 📁 Structure

```
supabase/
├── README.md (this file)
├── setup.sh                      # Initialize both projects
├── generate-migrations.js        # Generate SQL from existing schemas
├── carto-backend/                # Cartographic Project Manager
│   ├── README.md
│   ├── config.toml              # Supabase local config (generated)
│   ├── supabase/
│   │   ├── migrations/          # SQL migrations
│   │   ├── functions/           # Edge Functions (Deno)
│   │   ├── seed.sql             # Seed data
│   │   └── config.toml          # Function config
│   └── .env.example
└── tennis-backend/               # Tennis Tournament Manager
    ├── README.md
    ├── config.toml              # Supabase local config (generated)
    ├── supabase/
    │   ├── migrations/          # SQL migrations
    │   ├── functions/           # Edge Functions (Deno)
    │   ├── seed.sql             # Seed data
    │   └── config.toml          # Function config
    └── .env.example
```

## 🚀 Quick Start

### 1. Prerequisites

**Install Supabase CLI:**

```bash
# Option 1: Standalone Binary (Linux/macOS)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase

# Option 2: Homebrew (macOS/Linux)
brew install supabase/tap/supabase

# Option 3: Use npx (no installation, runs via npm)
npx supabase --version

# Verify installation
supabase --version
```

**Install Docker (required for local development):**
```bash
# Docker is needed for 'supabase start'
# Install from: https://docs.docker.com/get-docker/
```

### 2. Create Supabase Projects

Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and create **two projects**:

1. **carto-project-manager**
   - Organization: TFG (Free)
   - Region: Europe (Frankfurt)
   - Enable Data API: ✅
   - Enable automatic RLS: ✅

2. **tennis-tournament-manager**
   - Organization: TFG (Free)
   - Region: Europe (Frankfurt)
   - Enable Data API: ✅
   - Enable automatic RLS: ✅

### 3. Run Setup Script

```bash
# From repository root
cd supabase
./setup.sh
```

This will:
- Initialize both projects locally
- Link to your Supabase projects
- Create necessary directories

### 4. Generate Migration Files

```bash
# From repository root
node supabase/generate-migrations.js
```

This creates starter migration files that you'll need to complete by converting your existing Prisma/TypeORM schemas.

### 5. Complete Migrations

#### CARTO (Prisma → SQL)

```bash
# Review Prisma schema
cat projects/4-CartographicProjectManager/backend/prisma/schema.prisma

# Edit SQL migrations
cd supabase/carto-backend/supabase/migrations
# Edit files: 20260415000002_create_enums.sql
#             20260415000003_create_tables.sql
#             20260415000004_create_rls_policies.sql
```

#### TENNIS (TypeORM → SQL)

```bash
# Review TypeORM entities
ls projects/5-TennisTournamentManager/backend/src/domain/entities/

# Edit SQL migrations
cd supabase/tennis-backend/supabase/migrations
# Edit files: 20260415000002_create_enums.sql
#             20260415000003_create_tables.sql
#             20260415000004_create_rls_policies.sql
```

### 6. Test Locally

```bash
# Start CARTO local Supabase (requires Docker)
cd supabase/carto-backend
supabase start

# Apply migrations
supabase db reset

# Access local services:
# - Studio: http://localhost:54323
# - API: http://localhost:54321
# - DB: postgresql://postgres:postgres@localhost:54322/postgres

# In another terminal, start TENNIS
cd supabase/tennis-backend
supabase start
supabase db reset
```

### 7. Create Edge Functions

```bash
# CARTO: Create a function
cd supabase/carto-backend
supabase functions new create-project

# TENNIS: Create a function
cd supabase/tennis-backend
supabase functions new create-tournament

# Test locally
supabase functions serve create-tournament --no-verify-jwt

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-tournament \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Tournament"}'
```

### 8. Deploy to Production

```bash
# Push database migrations
cd supabase/carto-backend
supabase db push

cd ../tennis-backend
supabase db push

# Deploy Edge Functions
cd ../carto-backend
supabase functions deploy

cd ../tennis-backend
supabase functions deploy
```

## 📚 Documentation

- **Main Migration Guide:** [/SUPABASE-MIGRATION-GUIDE.md](../SUPABASE-MIGRATION-GUIDE.md)
- **CARTO Details:** [carto-backend/README.md](carto-backend/README.md)
- **TENNIS Details:** [tennis-backend/README.md](tennis-backend/README.md)
- **Supabase Docs:** https://supabase.com/docs

## 🔧 Common Commands

### Database

```bash
# Apply migrations
supabase db push

# Reset local database (re-run all migrations)
supabase db reset

# Create a new migration
supabase migration new <migration-name>

# Diff local vs remote
supabase db diff
```

### Edge Functions

```bash
# Create new function
supabase functions new <function-name>

# Serve locally
supabase functions serve <function-name>

# Deploy to production
supabase functions deploy <function-name>

# Deploy all functions
supabase functions deploy

# View logs
supabase functions logs <function-name>
```

### Secrets Management

```bash
# Set a secret (for Edge Functions)
supabase secrets set API_KEY=xxx

# List secrets
supabase secrets list

# Unset a secret
supabase secrets unset API_KEY
```

### Local Development

```bash
# Start all services
supabase start

# Stop all services
supabase stop

# View service status
supabase status

# View logs
supabase logs
```

## 🎯 Migration Checklist

### CARTO Project
- [ ] Database schema migrated (Prisma → SQL)
- [ ] RLS policies created
- [ ] Edge Functions created (~50+ endpoints)
- [ ] Authentication migrated (JWT → Supabase Auth)
- [ ] Storage configured (Dropbox → Supabase Storage)
- [ ] Realtime configured (Socket.IO → Supabase Realtime)
- [ ] Frontend updated (Axios → Supabase client)
- [ ] Deployed to production
- [ ] Testing complete

### TENNIS Project
- [ ] Database schema migrated (TypeORM → SQL)
- [ ] RLS policies created
- [ ] Edge Functions created (~100+ endpoints)
- [ ] Authentication migrated (JWT → Supabase Auth)
- [ ] Notification system (Email, Telegram, Push)
- [ ] Storage configured (Local → Supabase Storage)
- [ ] Realtime configured (Socket.IO → Supabase Realtime)
- [ ] Frontend updated (Axios → Supabase client)
- [ ] Deployed to production
- [ ] Testing complete

## 🔐 Environment Variables

### GitHub Secrets (Required for CI/CD)

Add these to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

```
SUPABASE_ACCESS_TOKEN          # Personal access token from Supabase
SUPABASE_CARTO_PROJECT_REF     # CARTO project reference ID
SUPABASE_TENNIS_PROJECT_REF    # TENNIS project reference ID
DROPBOX_APP_KEY                # For CARTO
DROPBOX_APP_SECRET             # For CARTO
RESEND_API_KEY                 # For TENNIS email
TELEGRAM_BOT_TOKEN             # For TENNIS notifications
WEB_PUSH_VAPID_PUBLIC_KEY      # For TENNIS push notifications
WEB_PUSH_VAPID_PRIVATE_KEY     # For TENNIS push notifications
```

### Local Development

Create `.env` files in each project:

```bash
# supabase/carto-backend/.env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from-supabase-status>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-status>

# supabase/tennis-backend/.env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<from-supabase-status>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-status>
```

## 🐛 Troubleshooting

### Docker not running
```bash
# Start Docker Desktop or Docker daemon
# Then retry: supabase start
```

### Port conflicts
```bash
# Check what's using ports 54321-54324
lsof -i :54321

# Kill conflicting processes or
# Stop Supabase and restart
supabase stop
supabase start
```

### Migration errors
```bash
# View detailed error
supabase db push --debug

# Reset and try again
supabase db reset
```

### Edge Function errors
```bash
# View function logs
supabase functions logs <function-name> --tail

# Test locally with more verbosity
supabase functions serve <function-name> --debug
```

## 📖 Learning Resources

- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Deno Documentation](https://deno.land/manual) (for Edge Functions)

## 💡 Tips

1. **Start small:** Migrate one feature at a time, not the entire backend at once
2. **Test locally first:** Always test migrations and functions locally before deploying
3. **Use RLS:** Row Level Security is your friend for secure data access
4. **Monitor logs:** Check function logs regularly during development
5. **Version control:** Commit migration files to git
6. **Backup first:** Export your current database before migrating

## 🆘 Support

- **Issues:** Create an issue in this repository
- **Supabase Discord:** https://discord.supabase.com
- **Supabase Support:** support@supabase.io

---

**Ready to migrate?** Follow the Quick Start guide above and refer to the detailed migration guide in `/SUPABASE-MIGRATION-GUIDE.md`.
