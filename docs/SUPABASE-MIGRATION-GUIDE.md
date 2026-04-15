# Supabase Full Migration Guide

> **⚠️ MAJOR REFACTORING REQUIRED**  
> This is a complete backend rewrite from Express/Node.js to Supabase Edge Functions (Deno runtime).  
> Estimated effort: **4-6 weeks** for both CARTO and TENNIS projects.

## 📋 Table of Contents

- [Overview](#overview)
- [Migration Phases](#migration-phases)
- [Supabase Project Setup](#supabase-project-setup)
- [Database Migration](#database-migration)
- [Authentication Migration](#authentication-migration)
- [Edge Functions Migration](#edge-functions-migration)
- [Storage Migration](#storage-migration)
- [Realtime Migration](#realtime-migration)
- [Frontend Integration](#frontend-integration)
- [Deployment](#deployment)

---

## Overview

### What's Changing

| Component | FROM (Current) | TO (Supabase) |
|-----------|---------------|---------------|
| **Backend Runtime** | Node.js + Express | Deno + Edge Functions |
| **Database ORM** | Prisma (CARTO) / TypeORM (TENNIS) | Supabase Client + SQL |
| **Authentication** | Custom JWT | Supabase Auth |
| **Real-time** | Socket.IO | Supabase Realtime |
| **File Storage** | Multer + Dropbox (CARTO) / Local (TENNIS) | Supabase Storage |
| **API Style** | REST (manual) | REST (auto-generated) + RPC |
| **Deployment** | Render (Node.js services) | Supabase (Edge Functions) |

### Why This Migration is Complex

1. **Language Change**: Node.js/TypeScript → Deno/TypeScript (different runtime APIs)
2. **Framework Change**: Express → Edge Functions (different request/response handling)
3. **ORM Removal**: Prisma/TypeORM → Direct SQL + Supabase client
4. **Auth Rewrite**: Custom JWT → Supabase Auth (different user model)
5. **Socket.IO Replacement**: Complete rewrite for Supabase Realtime
6. **Business Logic Migration**: ~150+ endpoints need rewriting

---

## Migration Phases

### Phase 1: Infrastructure Setup (Week 1)
- [x] Create Supabase projects (CARTO + TENNIS)
- [ ] Setup local Supabase CLI
- [ ] Initialize project structure
- [ ] Configure GitHub Actions

### Phase 2: Database Migration (Week 1-2)
- [ ] Convert Prisma schema → SQL migrations (CARTO)
- [ ] Convert TypeORM entities → SQL migrations (TENNIS)
- [ ] Setup Row Level Security (RLS) policies
- [ ] Seed initial data
- [ ] Test database locally

### Phase 3: Authentication (Week 2)
- [ ] Setup Supabase Auth providers
- [ ] Migrate user table to auth.users
- [ ] Configure email templates
- [ ] Implement password reset flow
- [ ] Update frontend auth logic

### Phase 4: Core Edge Functions (Week 2-3)
- [ ] Create base Edge Function structure
- [ ] Migrate critical endpoints first
- [ ] Setup CORS and auth middleware
- [ ] Implement error handling
- [ ] Add logging

### Phase 5: Realtime Features (Week 3-4)
- [ ] Setup Realtime subscriptions
- [ ] Replace Socket.IO with Supabase Realtime
- [ ] Test real-time updates
- [ ] Optimize subscriptions

### Phase 6: Storage & Files (Week 4)
- [ ] Setup Supabase Storage buckets
- [ ] Migrate file upload logic
- [ ] Configure access policies
- [ ] Migrate existing files (if needed)

### Phase 7: Advanced Features (Week 4-5)
- [ ] Notification system (Email, Telegram, Push)
- [ ] PDF generation
- [ ] Tournament bracket logic
- [ ] Dropbox integration (CARTO)

### Phase 8: Testing & Deployment (Week 5-6)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Monitor and fix issues

---

## Supabase Project Setup

### Step 1: Create Supabase Projects

You'll need **two separate Supabase projects**:

1. **carto-project-manager**
   - Organization: TFG (Free)
   - Region: Europe (Frankfurt)
   - Database Password: Generate strong password
   - Enable Data API: ✅ Yes
   - Enable automatic RLS: ✅ Yes

2. **tennis-tournament-manager**
   - Organization: TFG (Free)
   - Region: Europe (Frankfurt)
   - Database Password: Generate strong password
   - Enable Data API: ✅ Yes
   - Enable automatic RLS: ✅ Yes

### Step 2: Install Supabase CLI

**⚠️ Note:** Global npm installation is not supported. Use one of these methods:

```bash
# Option 1: Standalone Binary (Recommended for Linux)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase

# Option 2: Homebrew (macOS or Linux with Homebrew)
brew install supabase/tap/supabase

# Option 3: Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Option 4: Use npx (no installation needed)
npx supabase --version

# Verify installation
supabase --version
```

### Step 3: Initialize Local Projects

```bash
# From repository root
cd supabase

# Initialize CARTO
mkdir carto-backend
cd carto-backend
supabase init
supabase login
supabase link --project-ref <your-carto-project-ref>

# Initialize TENNIS
cd ../
mkdir tennis-backend
cd tennis-backend
supabase init
supabase login
supabase link --project-ref <your-tennis-project-ref>
```

### Step 4: Configure Environment Variables

Save these credentials securely:

```bash
# CARTO Project
SUPABASE_CARTO_URL=https://<project-ref>.supabase.co
SUPABASE_CARTO_ANON_KEY=<anon-key>
SUPABASE_CARTO_SERVICE_KEY=<service-role-key>

# TENNIS Project  
SUPABASE_TENNIS_URL=https://<project-ref>.supabase.co
SUPABASE_TENNIS_ANON_KEY=<anon-key>
SUPABASE_TENNIS_SERVICE_KEY=<service-role-key>
```

---

## Database Migration

### CARTO: Prisma → Supabase SQL

The Prisma schema needs to be converted to SQL migrations:

**Current:** `projects/4-CartographicProjectManager/backend/prisma/schema.prisma`

**Target:** `supabase/carto-backend/migrations/20260415000000_initial_schema.sql`

#### Manual Steps:

1. **Enable extensions:**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
   ```

2. **Create enums:**
   ```sql
   CREATE TYPE user_role AS ENUM ('ADMINISTRATOR', 'CLIENT', 'SPECIAL_USER');
   CREATE TYPE project_status AS ENUM ('ACTIVE', 'IN_PROGRESS', 'PENDING_REVIEW', 'FINALIZED');
   -- ... all other enums from schema.prisma
   ```

3. **Create tables:**
   ```sql
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     role user_role NOT NULL DEFAULT 'CLIENT',
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );
   -- ... all other tables
   ```

4. **Setup RLS (Row Level Security):**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Users can only see their own data
   CREATE POLICY "Users can view own profile"
     ON users FOR SELECT
     USING (auth.uid() = id);
   ```

### TENNIS: TypeORM → Supabase SQL

The TypeORM entities need to be converted to SQL migrations:

**Current:** `projects/5-TennisTournamentManager/backend/src/domain/entities/*.entity.ts`

**Target:** `supabase/tennis-backend/migrations/20260415000000_initial_schema.sql`

#### Entity Count: 24 tables
- User, Tournament, Category, Phase, Bracket, Match, Score
- Registration, DoublesTeam, PartnerInvitation
- Standing, OrderOfPlay, Court
- Announcement, Notification, NotificationPreferences, PushSubscription
- Payment, Sanction, AuditLog
- Statistics, GlobalRanking, MatchResult

See: `supabase/tennis-backend/migrations/` for generated SQL

---

## Authentication Migration

### Current JWT Auth → Supabase Auth

#### Changes Required:

1. **Remove custom JWT logic**
   - Delete JWT middleware
   - Remove password hashing (bcrypt)
   - Remove token generation/verification

2. **Integrate Supabase Auth**
   ```typescript
   // Old (Express + JWT)
   app.post('/api/auth/register', async (req, res) => {
     const hashedPassword = await bcrypt.hash(password, 10);
     const user = await prisma.user.create({...});
     const token = jwt.sign({userId: user.id}, SECRET);
     res.json({token});
   });
   
   // New (Supabase Auth)
   const { data, error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: {  // Additional user metadata
         name,
         role: 'player'
       }
     }
   });
   ```

3. **Update Frontend**
   ```typescript
   // Old
   const token = localStorage.getItem('jwt_token');
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   
   // New
   import { createClient } from '@supabase/supabase-js';
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
   
   const { data: { session } } = await supabase.auth.getSession();
   // Auto-handles auth in all requests
   ```

---

## Edge Functions Migration

### Structure

```
supabase/carto-backend/functions/
├── auth/
│   ├── login/index.ts
│   ├── register/index.ts
│   └── reset-password/index.ts
├── projects/
│   ├── create/index.ts
│   ├── list/index.ts
│   ├── update/index.ts
│   └── delete/index.ts
├── tasks/
│   └── ...
├── messages/
│   └── ...
├── files/
│   └── ...
└── shared/
    ├── cors.ts
    ├── auth.ts
    └── types.ts

supabase/tennis-backend/functions/
├── tournaments/
│   ├── create/index.ts
│   ├── list/index.ts
│   └── ...
├── matches/
│   └── ...
├── phases/
│   └── ...
├── notifications/
│   ├── email/index.ts
│   ├── telegram/index.ts
│   └── push/index.ts
└── shared/
    └── ...
```

### Example Edge Function

```typescript
// supabase/tennis-backend/functions/tournaments/create/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Parse request
    const { name, startDate, endDate, categoryId } = await req.json();

    // Insert tournament
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### Deployment

```bash
# Deploy a single function
supabase functions deploy create-tournament

# Deploy all functions
supabase functions deploy
```

---

## Storage Migration

### CARTO: Dropbox → Supabase Storage

```typescript
// Old (Dropbox upload)
const dropbox = new Dropbox({ accessToken });
await dropbox.filesUpload({
  path: '/projects/file.pdf',
  contents: fileBuffer
});

// New (Supabase Storage)
const { data, error } = await supabase.storage
  .from('project-files')
  .upload(`projects/${projectId}/file.pdf`, fileBuffer, {
    contentType: 'application/pdf',
    upsert: false
  });
```

### TENNIS: Local Files → Supabase Storage

```typescript
// Old (Multer + local storage)
upload.single('image')(req, res, async () => {
  const filePath = req.file.path;
  // ... process file
});

// New (Supabase Storage)
const { data, error } = await supabase.storage
  .from('tournament-images')
  .upload(`tournaments/${tournamentId}/logo.png`, imageBuffer, {
    contentType: 'image/png',
    cacheControl: '3600'
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('tournament-images')
  .getPublicUrl(`tournaments/${tournamentId}/logo.png`);
```

### Storage Buckets

Create these buckets in Supabase Dashboard:

**CARTO:**
- `project-files` (private)
- `user-avatars` (public)

**TENNIS:**
- `tournament-images` (public)
- `participant-photos` (public)

---

## Realtime Migration

### Socket.IO → Supabase Realtime

```typescript
// Old (Socket.IO server)
io.on('connection', (socket) => {
  socket.on('join-tournament', (tournamentId) => {
    socket.join(`tournament-${tournamentId}`);
  });
});

io.to(`tournament-${tournamentId}`).emit('match-updated', matchData);

// New (Supabase Realtime - automatic!)
// Just update database, Supabase broadcasts changes automatically
const { data } = await supabase
  .from('matches')
  .update({ score: newScore })
  .eq('id', matchId);

// Frontend subscribes
const subscription = supabase
  .channel('tournament-123')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'matches',
    filter: 'tournament_id=eq.123'
  }, (payload) => {
    console.log('Match updated:', payload);
  })
  .subscribe();
```

---

## Frontend Integration

### Update API Calls

```typescript
// Old (Axios + REST)
const response = await axios.get('/api/tournaments', {
  headers: { Authorization: `Bearer ${token}` }
});

// New (Supabase Client)
const { data, error } = await supabase
  .from('tournaments')
  .select('*')
  .order('created_at', { ascending: false });

// Or call Edge Function
const { data, error } = await supabase.functions.invoke('create-tournament', {
  body: { name, startDate, endDate }
});
```

### Update Constants

```typescript
// projects/5-TennisTournamentManager/src/shared/constants.ts
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-supabase.yml
name: Deploy to Supabase

on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        
      - name: Deploy CARTO migrations
        run: |
          cd supabase/carto-backend
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_CARTO_PROJECT_ID }}
      
      - name: Deploy CARTO functions
        run: |
          cd supabase/carto-backend
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Deploy TENNIS migrations
        run: |
          cd supabase/tennis-backend
          supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_TENNIS_PROJECT_ID }}
      
      - name: Deploy TENNIS functions
        run: |
          cd supabase/tennis-backend
          supabase functions deploy
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Estimated Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Week 1** | Setup & DB | Supabase projects, SQL migrations, RLS policies |
| **Week 2** | Auth & Core APIs | Auth working, 30% of endpoints migrated |
| **Week 3** | Remaining APIs | 70% of endpoints migrated |
| **Week 4** | Realtime & Storage | Socket.IO replaced, files working |
| **Week 5** | Advanced Features | Notifications, PDFs, complex logic |
| **Week 6** | Testing & Deploy | Production deployment, bug fixes |

---

## Next Steps

1. ✅ Review this migration guide
2. ⏳ Create Supabase projects in dashboard
3. ⏳ Install Supabase CLI locally
4. ⏳ Start database migration (generate SQL from schemas)
5. ⏳ Create first Edge Function (simple endpoint)
6. ⏳ Test end-to-end flow
7. ⏳ Incrementally migrate features

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Ready to start?** Let me know which phase you'd like to tackle first, and I'll provide detailed implementation steps.
