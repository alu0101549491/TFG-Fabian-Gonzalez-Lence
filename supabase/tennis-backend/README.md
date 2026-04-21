# Supabase Configuration for Tennis Tournament Manager

## Project Information

**Supabase Project Name:** tennis-tournament-manager  
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
tennis-backend/
├── migrations/                    # Database migrations (SQL)
│   ├── 20260415000001_enable_extensions.sql
│   ├── 20260415000002_create_enums.sql
│   ├── 20260415000003_create_tables.sql
│   ├── 20260415000004_create_rls_policies.sql
│   ├── 20260415000005_create_indexes.sql
│   └── 20260415000006_seed_data.sql
├── functions/                     # Edge Functions (Deno/TypeScript)
│   ├── tournaments/
│   ├── matches/
│   ├── phases/
│   ├── registrations/
│   ├── notifications/
│   ├── statistics/
│   └── shared/
├── storage/                       # Storage bucket configuration
│   ├── tournament-images.json
│   └── participant-photos.json
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
cd supabase/tennis-backend
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
supabase functions deploy create-tournament
```

## Features Migrated

### ✅ Database
- [x] PostgreSQL 15 with extensions
- [x] All 24 tables from TypeORM entities
- [x] Row Level Security (RLS) policies
- [x] Indexes for performance
- [x] Triggers and constraints

### ⏳ Authentication
- [ ] Supabase Auth integration
- [ ] Email/password login
- [ ] Password reset flow
- [ ] User roles (organizer, player, admin)
- [ ] Social auth (optional)

### ⏳ Storage
- [ ] Tournament images/logos
- [ ] Participant photos
- [ ] Generated PDFs (brackets, order of play)
- [ ] Access control policies

### ⏳  API (Edge Functions)
- [ ] Tournaments CRUD
- [ ] Matches & Phases management
- [ ] Registration system
- [ ] Bracket generation
- [ ] Order of Play scheduling
- [ ] Statistics & Rankings
- [ ] Announcements
- [ ] Notifications (Email, Telegram, Push)

### ⏳ Realtime
- [ ] Live match score updates
- [ ] Tournament draw changes
- [ ] New announcements
- [ ] Registration updates
- [ ] Order of play changes

## Database Schema

The TypeORM entities have been converted to SQL migrations in `migrations/`:

**Core Tables:**
- users (extends auth.users)
- tournaments
- categories
- phases
- brackets
- matches
- scores

**Registration & Teams:**
- registrations
- doubles_teams
- partner_invitations

**Scheduling:**
- order_of_play
- courts

**Standings & Stats:**
- standings
- statistics
- global_rankings
- match_results

**Communication:**
- announcements
- notifications
- notification_preferences
- push_subscriptions

**Admin:**
- payments
- sanctions
- audit_logs

**Enums:**
- user_role
- tournament_status
- tournament_surface
- category_type
- phase_type
- phase_structure
- match_status
- registration_status
- notification_channel
- announcement_type
- payment_status
- sanction_type

## Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: Users can view tournaments they're registered for
CREATE POLICY "Users can view their tournaments"
  ON tournaments FOR SELECT
  USING (
    status = 'published'
    OR
    organizer_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM registrations
      WHERE registrations.tournament_id = tournaments.id
      AND registrations.user_id = auth.uid()
    )
  );

-- Players can update their own match scores (when applicable)
CREATE POLICY "Players can update own match scores"
  ON matches FOR UPDATE
  USING (
    player1_id = auth.uid() OR player2_id = auth.uid()
    OR doubles_team1_id IN (
      SELECT id FROM doubles_teams WHERE player1_id = auth.uid() OR player2_id = auth.uid()
    )
  );
```

## Edge Functions Architecture

### Tournament Management

```typescript
//  supabase/tennis-backend/functions/tournaments/create/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../../shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // Parse request
    const { name, startDate, endDate, categoryId, surface, maxParticipants } = await req.json();

    // Create tournament
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId,
        surface,
        max_participants: maxParticipants,
        organizer_id: user.id,
        status: 'draft'
      })
      .select()
      .single();

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

### Notification System

```typescript
// supabase/tennis-backend/functions/notifications/send/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, type, title, message, channels } = await req.json();

    // Get user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Send via Email
    if (channels.includes('email') && prefs?.email_enabled) {
      await sendEmail(userId, title, message);
    }

    // Send via Telegram
    if (channels.includes('telegram') && prefs?.telegram_enabled && prefs?.telegram_chat_id) {
      await sendTelegram(prefs.telegram_chat_id, message);
    }

    // Send Web Push
    if (channels.includes('push') && prefs?.push_enabled) {
      await sendPushNotification(userId, title, message);
    }

    // Store notification in DB
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        channels_sent: channels
      });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function sendEmail(userId: string, title: string, message: string) {
  // Use Resend, SendGrid, or SMTP
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  // Implementation here
}

async function sendTelegram(chatId: string, message: string) {
  const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

async function sendPushNotification(userId: string, title: string, message: string) {
  // Implementation with web-push library
}
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
supabase functions serve create-tournament --no-verify-jwt

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-tournament \
  -H "Authorization: Bearer <your-anon-key>" \
  -H "Content-Type": application/json" \
  -d '{
    "name": "Summer Championship 2026",
    "startDate": "2026-07-01",
    "endDate": "2026-07-15",
    "categoryId": 1,
    "surface": "hard",
    "maxParticipants": 32
  }'
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
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set TELEGRAM_BOT_TOKEN=xxx
supabase secrets set WEB_PUSH_VAPID_PUBLIC_KEY=xxx
supabase secrets set WEB_PUSH_VAPID_PRIVATE_KEY=xxx
```

## Monitoring

- **Logs:** Supabase Dashboard → Logs
- **Database:** Supabase Dashboard → Database (24 tables)
- **Storage:** Supabase Dashboard → Storage (tournament images, photos)
- **Functions:** Supabase Dashboard → Edge Functions (~50+ endpoints)
- **Realtime:** Supabase Dashboard → Realtime (active subscriptions)

## Migration Status

| Feature | Status | Complexity | Notes |
|---------|--------|-----------|-------|
| Database Schema | 🔄 In Progress | High | 24 tables, complex relations |
| RLS Policies | 📝 Planned | Medium | Per-table access control |
| Auth Integration | 📝 Planned | Low | Replace JWT with Supabase Auth |
| Edge Functions | 📝 Planned | High | ~100+ endpoints to migrate |
| Notification System | 📝 Planned | High | Email + Telegram + Push |
| Bracket Generation | 📝 Planned | Very High | Complex tournament logic |
| Statistics Engine | 📝 Planned | High | Player rankings, H2H stats |
| Storage | 📝 Planned | Low | Images, PDFs |
| Realtime | 📝 Planned | Medium | Match updates, announcements |
| Frontend Update | 📝 Planned | Medium | Use Supabase client |

---

**Estimated Migration Time:** 4-5 weeks

**Next Steps:**
1. Generate SQL migrations from TypeORM entities
2. Create core Edge Functions (auth, tournaments, matches)
3. Implement notification system (Edge Functions)
4. Test locally with Supabase CLI
5. Deploy to production incrementally
