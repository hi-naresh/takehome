-- Supabase schema for the take‑home task (generic, non‑proprietary)
-- Create tables for users (reference) and contracts extracted data.
-- Notes:
-- - Use this as a starting point. You may adapt as needed during the exercise.
-- - Consider enabling RLS and adding policies if you implement auth.

-- Users table (minimal). In a real app, this would mirror your auth provider's user ids.
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  created_at timestamptz default now()
);

-- Contracts table stores extracted (and possibly edited) fields
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  -- extracted fields
  contract_holder_name text,
  contract_identifier text,
  renewal_date date,
  service_product text,
  contact_email text,
  -- file storage reference (e.g., storage path or public URL)
  file_path text,
  -- metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at on change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

-- Optional indexes
create index if not exists idx_contracts_user_id on public.contracts(user_id);
create index if not exists idx_contracts_contract_identifier on public.contracts(contract_identifier);
