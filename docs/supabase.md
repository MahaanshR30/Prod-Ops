# Supabase — Development & Deployment Documentation

## Project Info

| Item | Value |
|---|---|
| Project ID | `fvmccqmrlezybbhapwau` |
| Project URL | `https://fvmccqmrlezybbhapwau.supabase.co` |
| Region | (check Supabase dashboard) |
| Client file | `src/integrations/supabase/client.ts` |
| Types file | `src/integrations/supabase/types.ts` |

---

## Local Development Setup

### Prerequisites

```bash
npm install -g supabase
supabase login
```

### Link to Remote Project

```bash
supabase link --project-ref fvmccqmrlezybbhapwau
```

### Pull Remote Schema (first time)

```bash
supabase db pull
```

This writes the current remote schema to `supabase/migrations/`.

### Start Local Supabase (optional)

```bash
supabase start
```

Starts a local Postgres + PostgREST + Edge Function runtime. The local client URL will be `http://localhost:54321`.

> The app currently points at the remote Supabase project. To use local, update the URL/key in `src/integrations/supabase/client.ts`.

---

## Environment Variables

### Frontend (Vite)

Stored in `.env.local` (not committed):

```env
VITE_SUPABASE_URL=https://fvmccqmrlezybbhapwau.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

The client in `src/integrations/supabase/client.ts` reads these at build time.

### Edge Functions

Set in Supabase Dashboard → Project Settings → Edge Functions → Secrets, or via CLI:

```bash
supabase secrets set KEKA_CLIENT_ID=xxx
supabase secrets set KEKA_CLIENT_SECRET=xxx
supabase secrets set KEKA_API_KEY=xxx
supabase secrets set KEKA_BASE_URL=https://foxsense.keka.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the Supabase runtime — do not set these manually.

---

## Database Schema

### Tables

#### `projects`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `name` | text | NOT NULL |
| `description` | text | |
| `status` | text | Default `'not-started'` |
| `pm_status` | text | Default `'not-started'` |
| `ops_status` | text | Default `'not-started'` |
| `priority` | text | Default `'medium'` |
| `start_date` | date | |
| `end_date` | date | |
| `budget` | numeric | |
| `progress` | integer | Default 0 |
| `manager_id` | uuid | FK → `employees.id` ON DELETE SET NULL |
| `last_call_date` | date | |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Auto via trigger |

#### `employees`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `employee_id` | text | UNIQUE (Keka employee number) |
| `full_name` | text | NOT NULL |
| `email` | text | |
| `avatar_url` | text | |
| `department` | text | |
| `position` | text | |
| `salary` | numeric | |
| `hire_date` | date | |
| `status` | text | Default `'active'` |
| `skills` | text[] | Default `'{}'` |
| `utilization_rate` | numeric | Default 0 |
| `role` | text | |
| `user_id` | uuid | FK → auth.users (optional) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto via trigger |

#### `allocations`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `employee_id` | uuid | FK → `employees.id` |
| `allocation` | integer | CHECK `0 <= allocation <= 100` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| UNIQUE | | `(project_id, employee_id)` |

#### `deliverables`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `name` | text | NOT NULL |
| `description` | text | |
| `type` | text | `new-feature`, `feature-request`, `bug`, `adhoc` |
| `status` | text | Default `'pending'` |
| `due_date` | date | |
| `completed_date` | date | |
| `assignee_name` | text | Display string |
| `responsible_employee` | uuid | FK → `employees.id` |
| `flagged` | boolean | NOT NULL, Default `false` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `issues`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `title` | text | NOT NULL |
| `description` | text | |
| `severity` | text | `Sev1`, `Sev2`, `Sev3`, `Incident` |
| `status` | text | `unresolved`, `resolved` |
| `assigned_to` | text | |
| `reported_by` | text | |
| `eta` | date | |
| `resolved_at` | timestamptz | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

#### `weekly_status`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `week` | text | ISO week e.g. `2026-W14` |
| `status` | text | `green`, `amber`, `red`, `not-started` |
| UNIQUE | | `(project_id, week)` |

#### `tasks`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `project_id` | uuid | FK → `projects.id` |
| `completed_at` | timestamptz | Null if incomplete |
| `created_at` | timestamptz | |

#### `seats`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `location` | text | |
| `floor` | text | |
| `section` | text | |
| `seat_number` | text | |
| `type` | text | e.g. `desk` |
| `status` | text | `available`, `occupied` |
| `assigned_to` | uuid | FK → `employees.id` |
| `assigned_date` | date | |
| `created_at` / `updated_at` | timestamptz | |

---

## Row Level Security (RLS)

RLS is enabled on all tables. Current policies allow all operations for all authenticated and anonymous users (development permissive setup):

```sql
-- Example on projects table (same pattern for all tables)
CREATE POLICY "Allow all" ON public.projects FOR ALL USING (true) WITH CHECK (true);
```

> Before production: replace with proper user-scoped policies based on `auth.uid()`.

---

## Migrations

All migrations live in `supabase/migrations/`. They run in filename order (timestamp prefix).

### Applied Migrations

| File | What it does |
|---|---|
| `20260405000239_remote_schema.sql` | Full initial schema — all tables, RLS, triggers, constraints |
| `20260405120000_add_project_manager_fk.sql` | Adds FK `projects.manager_id → employees.id` with ON DELETE SET NULL |
| `20260405130000_add_last_call_date.sql` | Adds `projects.last_call_date` date column |
| `20260405140000_add_allocations_unique.sql` | Adds `UNIQUE (project_id, employee_id)` on allocations |
| `20260405150000_add_deliverable_flagged.sql` | Adds `deliverables.flagged boolean NOT NULL DEFAULT false` |
| `20260405160000_add_flag_function.sql` | Creates `set_deliverable_flagged(p_id, p_flagged)` RPC function |

### Creating a New Migration

```bash
supabase migration new my_migration_name
# Creates: supabase/migrations/<timestamp>_my_migration_name.sql
```

Write SQL in the file, then push:

```bash
supabase db push
```

### Pushing Migrations to Remote

```bash
supabase db push
```

Runs any pending migrations against the linked remote project.

### Regenerating TypeScript Types

After any schema change:

```bash
supabase gen types typescript --project-id fvmccqmrlezybbhapwau > src/integrations/supabase/types.ts
```

This overwrites the types file. Commit the updated file alongside the migration.

---

## DB Functions (RPC)

### `set_deliverable_flagged(p_id uuid, p_flagged boolean)`

**File:** `supabase/migrations/20260405160000_add_flag_function.sql`

```sql
CREATE OR REPLACE FUNCTION public.set_deliverable_flagged(p_id uuid, p_flagged boolean)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.deliverables SET flagged = p_flagged WHERE id = p_id;
$$;
```

**Why it exists:** PostgREST caches the schema at startup. When a new column (`flagged`) is added via migration, direct REST calls (`PATCH /deliverables?id=eq.X`) fail with `PGRST204: column not found` until the PostgREST instance is restarted or the cache refreshes. Calling via `supabase.rpc()` routes through the DB function which bypasses the schema cache entirely.

**Called from:** `ProjectDetail.tsx → handleTaskFlag()`

```typescript
await supabase.rpc('set_deliverable_flagged', { p_id: taskId, p_flagged: flagged });
```

**`SECURITY DEFINER`** means the function runs with the permissions of the function owner (postgres), not the calling user. Acceptable here because the function only updates a single boolean column with a parameterised UUID — no SQL injection risk.

### `update_updated_at_column()`

Auto-trigger function that sets `updated_at = now()` on any UPDATE. Applied to all tables via triggers in the initial schema migration.

---

## Edge Functions

Edge Functions run as Deno isolates on Supabase's edge network. They have access to secrets set via `supabase secrets set`.

### Functions Available

| Function | File | Purpose |
|---|---|---|
| `keka-employees` | `supabase/functions/keka-employees/index.ts` | Import/sync employees from Keka HRIS |
| `keka-projects` | `supabase/functions/keka-projects/index.ts` | Import/sync projects from Keka PSA |

### Deploying an Edge Function

```bash
# Deploy a single function
supabase functions deploy keka-employees

# Deploy all functions
supabase functions deploy
```

### Invoking from Frontend

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('keka-employees');
```

Note: `error` is only set for network failures. Application errors (e.g. bad Keka credentials) are returned in `data.error` as HTTP 200 responses — this is intentional because Supabase's JS client swallows the response body on non-2xx status codes.

### Testing an Edge Function Locally

```bash
supabase functions serve keka-employees --env-file .env.local
```

Then call it:
```bash
curl -X POST http://localhost:54321/functions/v1/keka-employees \
  -H "Authorization: Bearer <anon_key>"
```

### Debug Mode

Append `?debug=1` to inspect raw Keka response without importing:
```bash
curl -X POST "http://localhost:54321/functions/v1/keka-employees?debug=1" \
  -H "Authorization: Bearer <anon_key>"
```

Returns the first 2 raw employee objects from Keka + all field keys. Use this when Keka's API shape changes.

### Error Handling Pattern

All edge functions in this project return HTTP 200 even on error:

```typescript
// ✅ Correct pattern used in all functions
return new Response(
  JSON.stringify({ success: false, error: err.message }),
  { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
);

// ❌ Don't do this — response body is swallowed by Supabase JS client
return new Response('Error', { status: 500 });
```

Frontend checks `data.success` not `error`:

```typescript
const { data } = await supabase.functions.invoke('keka-employees');
if (!data.success) {
  toast({ title: 'Import failed', description: data.error, variant: 'destructive' });
}
```

---

## Real-Time Subscriptions

The `issues` table has a real-time subscription in `useIssues.ts`:

```typescript
const channel = supabase
  .channel('issues-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
    refetchIssues();
  })
  .subscribe();
```

### Enabling Real-Time on a Table

Real-time must be explicitly enabled per table in Supabase:

1. Dashboard → Database → Replication
2. Toggle the table to enable `INSERT`, `UPDATE`, `DELETE` events

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
```

---

## Supabase Client Usage Patterns

### Fetching with a join

```typescript
const { data } = await supabase
  .from('projects')
  .select('*, manager:employees!manager_id(full_name, department)');
```

### Upsert with conflict target

```typescript
await supabase.from('allocations').upsert(
  { project_id, employee_id, allocation },
  { onConflict: 'project_id,employee_id' }
);
```

Requires a UNIQUE constraint on `(project_id, employee_id)` for conflict detection.

### Calling an RPC function

```typescript
const { error } = await supabase.rpc('set_deliverable_flagged', {
  p_id: taskId,
  p_flagged: true
});
```

### Filtering with `maybeSingle()`

Returns `null` (not an error) when no row is found — safer than `.single()` which throws:

```typescript
const { data } = await supabase
  .from('employees')
  .select('id')
  .eq('email', email)
  .maybeSingle();
// data is null if not found, Employee if found
```

---

## Common Issues

### PGRST204: column not found

PostgREST's schema cache hasn't refreshed after a new column was added.

**Fix options:**
1. Wait ~5 minutes for cache auto-refresh
2. Restart the PostgREST service in the Supabase dashboard (API → Restart)
3. Use `supabase.rpc()` with a DB function instead of direct table updates (the permanent fix used for `flagged`)

### Edge function returns 200 but `data` is null

Usually means the function threw before returning a `Response`. Check Supabase Dashboard → Functions → Logs.

### Upsert creates duplicates instead of updating

The unique constraint is missing. Run:
```sql
SELECT conname FROM pg_constraint
WHERE conrelid = 'public.allocations'::regclass AND contype = 'u';
```
If the constraint is absent, apply migration `20260405140000`.

### TypeScript types out of sync

Run:
```bash
supabase gen types typescript --project-id fvmccqmrlezybbhapwau > src/integrations/supabase/types.ts
```

---

## Deployment Checklist

When deploying changes to production:

- [ ] New migrations pushed: `supabase db push`
- [ ] Edge functions deployed: `supabase functions deploy`
- [ ] Secrets set for any new env vars: `supabase secrets set KEY=value`
- [ ] TypeScript types regenerated and committed after schema changes
- [ ] Real-time enabled for any new tables that need subscriptions
- [ ] Frontend build passes: `npm run build` (no chunk size warnings, no TS errors)
- [ ] RLS policies reviewed if new tables were added
