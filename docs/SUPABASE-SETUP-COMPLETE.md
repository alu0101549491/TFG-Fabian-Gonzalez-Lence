# ✅ Supabase Migration Infrastructure - Setup Complete

## What Has Been Created

I've set up the complete infrastructure for migrating both CARTO and TENNIS backends to Supabase:

### 📁 Files Created

```
supabase/
├── README.md                          # Main Supabase documentation
├── setup.sh                           # Automated setup script
├── generate-migrations.js             # Migration generator
├── carto-backend/
│   └── README.md                      # CARTO-specific documentation
└── tennis-backend/
    └── README.md                      # TENNIS-specific documentation

.github/workflows/
└── deploy-supabase.yml                # CI/CD workflow for Supabase

Root:
└── SUPABASE-MIGRATION-GUIDE.md        # Complete migration guide (6-week plan)
```

### 📚 Documentation

1. **[SUPABASE-MIGRATION-GUIDE.md](SUPABASE-MIGRATION-GUIDE.md)** - Complete 6-week migration plan
2. **[supabase/README.md](supabase/README.md)** - Quick start guide and common commands
3. **[supabase/carto-backend/README.md](supabase/carto-backend/README.md)** - CARTO project details  
4. **[supabase/tennis-backend/README.md](supabase/tennis-backend/README.md)** - TENNIS project details

---

## 🎯 Immediate Next Steps

### Step 1: Create Supabase Projects (5 minutes)

Go to [https://supabase.com/dashboard](https://supabase.com/dashboard):

**Project 1: Cartographic Project Manager**
- Project name: `carto-project-manager`
- Organization: TFG (Free)
- Database password: **(Generate a strong password and save it)**
- Region: **Europe (Frankfurt)** ← Recommended, closest to you
- ✅ Enable Data API
- ✅ Enable automatic RLS

**Project 2: Tennis Tournament Manager**
- Project name: `tennis-tournament-manager`
- Organization: TFG (Free)
- Database password: **(Generate a strong password and save it)**
- Region: **Europe (Frankfurt)** ← Recommended, closest to you
- ✅ Enable Data API
- ✅ Enable automatic RLS

**Save these credentials:**
```bash
# CARTO
Project Ref: ____________________
Anon Key: ____________________
Service Role Key: ____________________

# TENNIS
Project Ref: ____________________
Anon Key: ____________________
Service Role Key: ____________________
```

### Step 2: Install Supabase CLI (2 minutes)

**Option 1: Standalone Binary (Recommended for Linux)**
```bash
# Download and install latest version
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase

# Verify
supabase --version
```

**Option 2: Using Homebrew (if installed)**
```bash
brew install supabase/tap/supabase
supabase --version
```

**Option 3: Use npx (no installation needed)**
```bash
# Run commands with npx
npx supabase --version
npx supabase login
# etc.
```

### Step 3: Run Setup Script (5 minutes)

```bash
# From repository root
cd supabase
chmod +x setup.sh
./setup.sh
```

Follow the prompts and enter your project reference IDs when asked.

### Step 4: Generate Migration Starters (1 minute)

```bash
# From repository root
node supabase/generate-migrations.js
```

This creates template migration files that you'll complete next.

---

## 📋 What You Need to Do

### Phase 1: Database Migration (Week 1 - HIGH PRIORITY)

#### CARTO Database

1. **Review Prisma Schema**
   ```bash
   cat projects/4-CartographicProjectManager/backend/prisma/schema.prisma
   ```

2. **Convert to SQL**
   - Open: `supabase/carto-backend/supabase/migrations/`
   - Edit these files:
     - `20260415000002_create_enums.sql` - Convert Prisma enums
     - `20260415000003_create_tables.sql` - Convert Prisma models
     - `20260415000004_create_rls_policies.sql` - Add security policies

3. **Test Locally**
   ```bash
   cd supabase/carto-backend
   supabase start         # Starts Docker containers
   supabase db reset      # Applies migrations
   ```

4. **Deploy to Production**
   ```bash
   supabase db push
   ```

#### TENNIS Database (24 Tables)

1. **Review TypeORM Entities**
   ```bash
   ls projects/5-TennisTournamentManager/backend/src/domain/entities/
   ```

2. **Convert to SQL**
   - Open: `supabase/tennis-backend/supabase/migrations/`
   - Edit these files:
     - `20260415000002_create_enums.sql` - Convert entity enums
     - `20260415000003_create_tables.sql` - Convert all 24 entities
     - `20260415000004_create_rls_policies.sql` - Add security policies

3. **Test Locally**
   ```bash
   cd supabase/tennis-backend
   supabase start
   supabase db reset
   ```

4. **Deploy to Production**
   ```bash
   supabase db push
   ```

### Phase 2: Edge Functions (Week 2-3)

After databases are migrated, start creating Edge Functions to replace Express endpoints.

**CARTO:**  ~50+ endpoints to migrate  
**TENNIS:** ~100+ endpoints to migrate

```bash
# Example: Create first function
cd supabase/carto-backend
supabase functions new create-project

# Edit: supabase/functions/create-project/index.ts
# Test: supabase functions serve create-project
# Deploy: supabase functions deploy create-project
```

### Phase 3: Authentication (Week 2)

Replace custom JWT with Supabase Auth in both projects.

### Phase 4: Storage (Week 4)

- CARTO: Replace Dropbox with Supabase Storage
- TENNIS: Replace local file storage with Supabase Storage

### Phase 5: Realtime (Week 3-4)

Replace Socket.IO with Supabase Realtime subscriptions.

### Phase 6: Frontend Updates (Week 5)

Update frontends to use Supabase client instead of Axios.

---

## ⚠️ Important Considerations

### Migration Complexity

This is a **major refactoring effort**:

| Project | Entities/Models | Endpoints | Estimated Time |
|---------|----------------|-----------|----------------|
| CARTO | 12 models | ~50 endpoints | 2-3 weeks |
| TENNIS | 24 entities | ~100 endpoints | 3-4 weeks |
| **TOTAL** | **36 tables** | **~150 endpoints** | **5-6 weeks** |

### What Changes

✅ **Database:** PostgreSQL stays the same (just hosted on Supabase)  
❌ **Runtime:** Node.js Express → Deno Edge Functions  
❌ **ORM:** Prisma/TypeORM → Supabase Client + SQL  
❌ **Auth:** Custom JWT → Supabase Auth  
❌ **Realtime:** Socket.IO → Supabase Realtime  
❌ **Storage:** Dropbox/Local → Supabase Storage  

### Why This is Complex

1. **Language Runtime Change:** Node.js APIs won't work in Deno
2. **No ORM:** Manual SQL queries instead of Prisma/TypeORM
3. **Different Auth Model:** Completely new authentication system
4. **Edge Function Limits:** 10MB size limit, cold starts
5. **Business Logic Rewrite:** All backend logic must be rewritten

---

## 💡 Recommended Approach

### Option 1: Incremental Migration (RECOMMENDED)

Migrate one feature at a time while keeping existing backends running:

1. **Week 1:** Database only (keep Express backends, just change DATABASE_URL)
2. **Week 2:** Migrate 1-2 simple endpoints as Edge Functions
3. **Week 3:** Migrate authentication
4. **Week 4+:** Gradually migrate remaining endpoints

This allows you to test and deploy incrementally.

### Option 2: Full Migration

Complete rewrite before deploying (higher risk, more work upfront).

---

## 🚦 Success Criteria

### Database Migration Complete When:
- [ ] All SQL migrations created
- [ ] Local `supabase db reset` works without errors
- [ ] Production `supabase db push` succeeds
- [ ] Can query tables via Supabase Studio
- [ ] RLS policies tested

### Edge Functions Ready When:
- [ ] All critical endpoints migrated
- [ ] Local testing passes
- [ ] Auth works correctly
- [ ] Error handling implemented
- [ ] Deployed to production

### Frontend Updated When:
- [ ] Supabase client installed
- [ ] All API calls converted
- [ ] Authentication flows work
- [ ] Realtime subscriptions active
- [ ] Production deployment successful

---

## 📞 Need Help?

### Resources:
- **Main Guide:** [SUPABASE-MIGRATION-GUIDE.md](SUPABASE-MIGRATION-GUIDE.md)
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Edge Functions:** https://supabase.com/docs/guides/functions

### Common Questions:

**Q: Can I keep my Express backends?**  
A: Not on Supabase. Supabase only supports Edge Functions (Deno). You'd need a different host for Node.js backends.

**Q: Is this worth it?**  
A: Depends on your needs. Supabase is great for:
- ✅ Auto-generated REST API
- ✅ Built-in auth and realtime
- ✅ No cold starts on paid plan
- ❌ But requires complete rewrite

**Q: What about Railway or other Render alternatives?**  
A: If Railway is at limits, consider:
- Fly.io (similar to Render)
- Vercel Serverless Functions
- AWS Lambda + RDS
- Keep Supabase for database only, host Express elsewhere

---

## 🎯 Immediate Action Plan

**TODAY:**
1. ✅ Create both Supabase projects
2. ✅ Install Supabase CLI
3. ✅ Run setup script
4. ✅ Generate migration starters

**THIS WEEK:**
1. ⏳ Convert CARTO Prisma schema to SQL
2. ⏳ Convert TENNIS TypeORM entities to SQL
3. ⏳ Test migrations locally
4. ⏳ Deploy databases to production

**NEXT WEEK:**
1. ⏳ Create first Edge Function (auth/login)
2. ⏳ Test auth flow
3. ⏳ Migrate 2-3 simple CRUD endpoints
4. ⏳ Update frontend to use Supabase client

---

**Good luck with the migration!** 🚀

Start with the database migration first - once that's solid, the rest becomes easier to tackle incrementally.
