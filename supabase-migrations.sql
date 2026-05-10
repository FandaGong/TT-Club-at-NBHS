-- Supabase migrations for TT-Club
-- Run these in Supabase SQL editor to create required tables and RLS policies.

create or replace function public.normalize_key(input text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '', 'g');
$$;

-- absence_reports
create table if not exists public.absence_reports (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references auth.users(id) on delete set null,
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

create policy "Authenticated users can read their own absence reports"
  on public.absence_reports
  for select
  to authenticated
  using (auth.uid() = account_id or account_id is null);

create policy "Authenticated users can update their own absence reports"
  on public.absence_reports
  for update
  to authenticated
  using (auth.uid() = account_id);

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
  account_id uuid references auth.users(id) on delete set null,
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
  player_1_account_id uuid references auth.users(id) on delete set null,
  player_2_account_id uuid references auth.users(id) on delete set null,
  winner_account_id uuid references auth.users(id) on delete set null,
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

create or replace function public.record_manual_match(
  p_player_1_name text,
  p_player_2_name text,
  p_winner_name text,
  p_score text,
  p_division text default null,
  p_half text default null,
  p_term_and_week text default null,
  p_player_1_account_id uuid default null,
  p_player_2_account_id uuid default null,
  p_winner_account_id uuid default null,
  p_player_1_elo_change integer default 0,
  p_player_2_elo_change integer default 0,
  p_player_1_new_elo integer default 0,
  p_player_2_new_elo integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  player_1_is_winner boolean;
  loser_name text;
begin
  player_1_is_winner := normalize_key(p_player_1_name) = normalize_key(p_winner_name);
  loser_name := case when player_1_is_winner then p_player_2_name else p_player_1_name end;

  if not exists (
    select 1
    from public.account a
    where a.account_id = auth.uid()
      and lower(a.role) = 'admin'
  ) and not exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
  ) then
    raise exception 'Not authorized to record match results.';
  end if;

  if normalize_key(p_player_1_name) = normalize_key(p_player_2_name) then
    raise exception 'The two players must be different.';
  end if;

  if not player_1_is_winner and normalize_key(p_player_2_name) <> normalize_key(p_winner_name) then
    raise exception 'Winner must be one of the selected players.';
  end if;

  insert into public.match_history (
    player_1_account_id,
    player_2_account_id,
    winner_account_id,
    player_1,
    player_2,
    winner,
    score,
    division,
    half,
    p1_elo_change,
    p2_elo_change,
    p1_new_elo,
    p2_new_elo,
    term_and_week
  ) values (
    p_player_1_account_id,
    p_player_2_account_id,
    p_winner_account_id,
    p_player_1_name,
    p_player_2_name,
    p_winner_name,
    p_score,
    p_division,
    p_half,
    p_player_1_elo_change,
    p_player_2_elo_change,
    p_player_1_new_elo,
    p_player_2_new_elo,
    p_term_and_week
  );

  update public.player_rankings
  set
    elo = case
      when normalize_key(name) = normalize_key(p_player_1_name) then p_player_1_new_elo
      when normalize_key(name) = normalize_key(p_player_2_name) then p_player_2_new_elo
      else elo
    end,
    wins = wins + case when normalize_key(name) = normalize_key(p_winner_name) then 1 else 0 end,
    losses = losses + case when normalize_key(name) = normalize_key(loser_name) then 1 else 0 end
  where normalize_key(name) in (normalize_key(p_player_1_name), normalize_key(p_player_2_name));

  if p_player_1_account_id is not null then
    update public.account
    set
      elo = p_player_1_new_elo,
      wins = wins + case when player_1_is_winner then 1 else 0 end,
      losses = losses + case when player_1_is_winner then 0 else 1 end
    where account_id = p_player_1_account_id;
  end if;

  if p_player_2_account_id is not null then
    update public.account
    set
      elo = p_player_2_new_elo,
      wins = wins + case when player_1_is_winner then 0 else 1 end,
      losses = losses + case when player_1_is_winner then 1 else 0 end
    where account_id = p_player_2_account_id;
  end if;
end;
$$;

create or replace function public.delete_match(p_match_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match record;
begin
  if not exists (
    select 1
    from public.account a
    where a.account_id = auth.uid()
      and lower(a.role) = 'admin'
  ) and not exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
  ) then
    raise exception 'Not authorized to delete matches.';
  end if;

  select * into v_match from public.match_history where id = p_match_id;
  if v_match is null then
    raise exception 'Match not found.';
  end if;

  delete from public.match_history where id = p_match_id;
end;
$$;

-- End of migrations
