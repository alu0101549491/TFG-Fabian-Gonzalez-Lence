# Supabase Configuration for Cartographic Project Manager

## Project Information

**Supabase Project Name:** carto-project-manager  
**Region:** Europe (Frankfurt)  
**Database:** PostgreSQL 15  
**Organization:** TFG (Free Tier)

## Environment Variables

Copy these values from your Supabase Dashboard → Settings → API:

```bash
# Public (can be exposed in frontend)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-public-key>

# Secret (backend only - DO NOT expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

## Project Structure

```
carto-backend/
├── migrations/                    # Database migrations (SQL)
│   ├── 20260415000001_enable_extensions.sql
│   ├── 20260415000002_create_enums.sql
│   ├── 20260415000003_create_tables.sql
│   ├── 20260415000004_create_rls_policies.sql
│   └── 20260415000005_seed_data.sql
├── functions/                     # Edge Functions (Deno/TypeScript)
│   ├── auth/
│   ├── projects/
│   ├── tasks/
│   ├── messages/
│   ├── files/
│   └── shared/
├── storage/                       # Storage bucket configuration
│   ├── project-files.json
│   └── user-avatars.json
└── config.toml                    # Supabase local config
```

## Quick Start

### 1. Install Supabase CLI

```bash
# Standalone Binary (Recommended for Linux)
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
sudo mv supabase /usr/local/bin/supabase

# OR: Homebrew (macOS/Linux with Homebrew)
brew install supabase/tap/supabase

# OR: Use npx (no installation)
npx supabase --version
```

### 2. Initialize Project

```bash
cd supabase/carto-backend
supabase init
```

### 3. Link to Remote Project

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 4. Apply Migrations

```bash
# Run all migrations
supabase db push

# Or apply locally first
supabase db reset  # Recreates local DB with migrations
```

### 5. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-project
```

## Features Migrated

### ✅ Database
- [x] PostgreSQL 15 with extensions
- [x] All tables from Prisma schema
- [x] Row Level Security (RLS) policies
- [x] Indexes for performance
- [x] Triggers for updated_at timestamps

### ⏳ Authentication
- [ ] Supabase Auth integration
- [ ] Email/password login
- [ ] Password reset flow
- [ ] User roles (ADMINISTRATOR, CLIENT, SPECIAL_USER)

### ⏳ Storage
- [ ] Replace Dropbox with Supabase Storage
- [ ] File upload/download endpoints
- [ ] Access control policies
- [ ] Public/private buckets

### ⏳ API (Edge Functions)
- [ ] Projects CRUD
- [ ] Tasks management
- [ ] Messages & notifications
- [ ] File operations
- [ ] User management
- [ ] Audit logs

### ⏳ Realtime
- [ ] Project updates
- [ ] New messages
- [ ] Task status changes
- [ ] File notifications

## Database Schema

The Prisma schema has been converted to SQL migrations in `migrations/`:

**Tables:**
- users
- projects
- tasks
- messages
- files
- project_members
- task_assignments
- notifications
- audit_logs
- dropbox_tokens

**Enums:**
- user_role
- project_status
- project_type
- task_status
- task_priority
- notification_type
- file_type
- access_right
- audit_action

## Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: Users can only view projects they're assigned to
CREATE POLICY "Users can view assigned projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = auth.uid()
    )
  );
```

## Edge Functions Architecture

Each Edge Function follows this pattern:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders} from '../shared/cors.ts';

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Business logic here
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
```

## Testing

### Local Development

```bash
# Start Supabase locally (uses Docker)
supabase start

# Outputs:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324 (email testing)
```

### Test Edge Functions Locally

```bash
# Serve function locally
supabase functions serve create-project --no-verify-jwt

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-project \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "type": "TOPOGRAPHY"}'
```

## Deployment

### Database Migrations

```bash
# Apply to production
supabase db push
```

### Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy with secrets
supabase secrets set DROPBOX_APP_KEY=xxx
supabase secrets set DROPBOX_APP_SECRET=xxx
```

## Monitoring

- **Logs:** Supabase Dashboard → Logs
- **Database:** Supabase Dashboard → Database
- **Storage:** Supabase Dashboard → Storage
- **Functions:** Supabase Dashboard → Edge Functions

## Migration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Database Schema | 🔄 In Progress | SQL migrations generated |
| RLS Policies | 📝 Planned | Need to define access rules |
| Auth Integration | 📝 Planned | Replace JWT with Supabase Auth |
| Edge Functions | 📝 Planned | ~50+ endpoints to migrate |
| Storage | 📝 Planned | Replace Dropbox integration |
| Realtime | 📝 Planned | Replace Socket.IO |
| Frontend Update | 📝 Planned | Use Supabase client |

---

**Next Steps:**
1. Generate SQL migrations from Prisma schema
2. Create initial Edge Functions
3. Test locally with Supabase CLI
4. Deploy to production
