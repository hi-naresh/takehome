# Database Setup

## Prerequisites
- Supabase account and project
- Node.js >= 20
- Supabase CLI (optional for local dev)

## 1) Create a Supabase Project
1. Go to https://app.supabase.com and create a new project
2. Copy Project URL and anon/service role keys from Project Settings → API

## 2) Configure Environment Variables
Populate your `.env` with Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # optional in dev, needed for admin ops
```

The app reads these via `ConfigService`. Tests set safe defaults automatically.

## 3) Database Schema

### 3a) Using the included migration (recommended)
A ready-to-use migration is provided at:

- `migrations/001_initial_schema.sql`

Apply it using any of the following approaches:

- Supabase SQL Editor: open the file, copy SQL, paste and run
- psql (replace placeholders):

```bash
psql "${SUPABASE_URL}" \
  -v ON_ERROR_STOP=1 \
  -c "$(cat migrations/001_initial_schema.sql)"
```

- Supabase CLI (local stack):
```bash
supabase start
# then run the SQL in the Studio SQL editor, or
# supabase db execute < migrations/001_initial_schema.sql   # if available in your CLI version
```

> The migrations in the `migrations/` folder are the source of truth. Prefer applying them over hand-written changes.

### 3b) Manual SQL (alternative)
Run the initial schema (same as migration content) via Supabase SQL editor.

```sql
-- contracts table
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  contract_holder_name text null,
  contract_identifier text null,
  renewal_date date null,
  service_product text null,
  contact_email text null,
  file_path text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- basic indexes
create index if not exists idx_contracts_user_id on public.contracts(user_id);
create index if not exists idx_contracts_renewal_date on public.contracts(renewal_date);

-- trigger to auto-update updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contracts_set_updated_at
  before update on public.contracts
  for each row execute procedure set_updated_at();
```

> Note: If you prefer migrations, add this SQL to your migrations folder and apply via your chosen tool.

## 4) Storage Setup (Contracts PDFs)
We recommend a public bucket named `contracts` for PDFs. In tests we mock storage.

1. Supabase Dashboard → Storage → Create bucket `contracts` (public)
2. Optionally add a folder `uploads/`
3. Our `FileUploadService` uses `contracts` by default; override per env if needed

### Example Storage Policies (optional)
In many cases a public bucket is sufficient for demos. For private buckets, grant signed access via service role.

```sql
-- Example: allow read for authenticated users only (if using auth)
-- adjust as per your auth model
```

## 5) Row Level Security (RLS)
If you enable RLS on `contracts`, add policies matching your auth model. For demos, you can keep RLS disabled or allow broad access.

```sql
-- Example (pseudo): allow users to read their own contracts
-- alter table public.contracts enable row level security;
-- create policy "read_own" on public.contracts
--   for select using (auth.uid() = user_id);
```

## 6) Local Development with Supabase CLI (optional)
You can run Supabase locally using the CLI:

```bash
npm i -g supabase
supabase start       # starts local stack
supabase status      # check status
supabase stop        # stop services
```

Update your `.env` with the local Supabase URL and keys printed by the CLI.

## 7) Seeding Data (Optional)
Use the SQL editor to insert sample rows:

```sql
insert into public.contracts (
  user_id,
  contract_holder_name,
  contract_identifier,
  renewal_date,
  service_product,
  contact_email,
  file_path
) values (
  '00000000-0000-0000-0000-000000000001',
  'Acme Corp',
  'ACME-2023-001',
  '2025-01-15',
  'Cloud Services',
  'contracts@acme.com',
  '/uploads/acme.pdf'
);
```

## 8) Health Checks
- DB health is checked via a lightweight select in `SupabaseService.isHealthy()`
- Run the app and call `GET /health` to verify overall readiness

## 9) Troubleshooting
- Invalid API key or URL: Verify `SUPABASE_URL` and keys
- RLS denied: Disable RLS for demo or add policies
- Storage upload denied: Confirm bucket exists and permissions
- CORS issues: Configure CORS in the backend or Supabase as needed

## 10) Next Steps
- Add managed migrations (e.g., Prisma, Kysely, or SQL files)
- Define RLS policies aligned with your auth strategy
- Configure backups and monitoring in Supabase
