-- Supabase migrations for TT-Club
-- Run these in Supabase SQL editor to create required tables and RLS policies.

-- absence_reports
create table if not exists public.absence_reports (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  reason text not null,
  status text not null default 'pending',
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.absence_reports enable row level security;

create policy "Anyone can insert absence reports"
  on public.absence_reports
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can read absence reports"
  on public.absence_reports
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update absence reports"
  on public.absence_reports
  for update
  to authenticated
  using (true);

create policy "Authenticated users can delete absence reports"
  on public.absence_reports
  for delete
  to authenticated
  using (true);

-- account_requests (primary)
create table if not exists public.account_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password text not null,
  role text not null default 'standard',
  status text not null default 'pending',
  linked_account_id uuid references auth.users(id) on delete cascade,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.account_requests enable row level security;

create policy "Anyone can insert account requests"
  on public.account_requests
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can read account requests"
  on public.account_requests
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update account requests"
  on public.account_requests
  for update
  to authenticated
  using (true);

create policy "Authenticated users can delete account requests"
  on public.account_requests
  for delete
  to authenticated
  using (true);

-- account_requests_v2 (fallback used by components.js)
create table if not exists public.account_requests_v2 (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password text not null,
  role text not null default 'standard',
  status text not null default 'pending',
  linked_account_id uuid references auth.users(id) on delete cascade,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.account_requests_v2 enable row level security;

create policy "Anyone can insert account_requests_v2"
  on public.account_requests_v2
  for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated users can read account_requests_v2"
  on public.account_requests_v2
  for select
  to authenticated
  using (true);

create policy "Authenticated users can update account_requests_v2"
  on public.account_requests_v2
  for update
  to authenticated
  using (true);

create policy "Authenticated users can delete account_requests_v2"
  on public.account_requests_v2
  for delete
  to authenticated
  using (true);

-- End of migrations
