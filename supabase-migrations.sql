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

-- player_rankings (Google Sheets leaderboard export)
create table if not exists public.player_rankings (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  elo integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  division text,
  half text,
  created_at timestamptz not null default now()
);

alter table public.player_rankings enable row level security;

create policy "Anyone can read player rankings"
  on public.player_rankings
  for select
  to anon, authenticated
  using (true);

-- schedule_dates (Google Sheets session date export)
create table if not exists public.schedule_dates (
  id uuid primary key default gen_random_uuid(),
  session_date date not null unique,
  created_at timestamptz not null default now()
);

alter table public.schedule_dates enable row level security;

create policy "Anyone can read schedule dates"
  on public.schedule_dates
  for select
  to anon, authenticated
  using (true);

-- season_records (Google Sheets season archive export)
create table if not exists public.season_records (
  id uuid primary key default gen_random_uuid(),
  season_name text,
  champion text,
  peak_elo integer not null default 0,
  total_matches integer not null default 0,
  top_3_players text,
  status text,
  most_wins text,
  biggest_upset text,
  created_at timestamptz not null default now()
);

alter table public.season_records enable row level security;

create policy "Anyone can read season records"
  on public.season_records
  for select
  to anon, authenticated
  using (true);

-- match_history (Google Sheets match archive export)
create table if not exists public.match_history (
  id uuid primary key default gen_random_uuid(),
  player_1 text,
  player_2 text,
  winner text,
  score text,
  division text,
  table_label text,
  half text,
  p1_elo_change integer not null default 0,
  p2_elo_change integer not null default 0,
  p1_new_elo integer not null default 0,
  p2_new_elo integer not null default 0,
  term_and_week text,
  created_at timestamptz not null default now()
);

alter table public.match_history enable row level security;

create policy "Anyone can read match history"
  on public.match_history
  for select
  to anon, authenticated
  using (true);

-- End of migrations
