-- Link all account-owned data to Supabase Auth users
-- Run this once in the Supabase SQL editor.
-- It creates the missing account table if needed, adds link columns, and backfills rows.

create or replace function public.normalize_key(input text)
returns text
language sql
immutable
as $$
  select regexp_replace(lower(coalesce(input, '')), '[^a-z0-9]+', '', 'g');
$$;

create or replace function public.link_account_name(p_account_id uuid, p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
    raise exception 'Not authorized to link account names.';
  end if;

  update public.account
  set display_name = p_display_name
  where account_id = p_account_id;

  update public.player_rankings pr
  set account_id = p_account_id
  where pr.account_id is null
    and normalize_key(pr.name) = normalize_key(p_display_name);

  update public.match_history mh
  set player_1_account_id = p_account_id
  where mh.player_1_account_id is null
    and normalize_key(mh.player_1) = normalize_key(p_display_name);

  update public.match_history mh
  set player_2_account_id = p_account_id
  where mh.player_2_account_id is null
    and normalize_key(mh.player_2) = normalize_key(p_display_name);

  update public.match_history mh
  set winner_account_id = p_account_id
  where mh.winner_account_id is null
    and normalize_key(mh.winner) = normalize_key(p_display_name);

  update public.absence_reports ar
  set account_id = p_account_id
  where ar.account_id is null
    and normalize_key(ar.name) = normalize_key(p_display_name);
end;
$$;

create table if not exists public.account (
  account_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'standard',
  status text not null default 'active',
  elo integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  division text,
  half text,
  created_at timestamptz not null default now()
);

alter table public.account add column if not exists display_name text;
alter table public.account add column if not exists role text;
alter table public.account add column if not exists status text;
alter table public.account add column if not exists elo integer;
alter table public.account add column if not exists wins integer;
alter table public.account add column if not exists losses integer;
alter table public.account add column if not exists division text;
alter table public.account add column if not exists half text;
alter table public.account add column if not exists created_at timestamptz;

alter table public.absence_reports add column if not exists account_id uuid references auth.users(id) on delete set null;
alter table public.player_rankings add column if not exists account_id uuid references auth.users(id) on delete set null;
alter table public.match_history add column if not exists player_1_account_id uuid references auth.users(id) on delete set null;
alter table public.match_history add column if not exists player_2_account_id uuid references auth.users(id) on delete set null;
alter table public.match_history add column if not exists winner_account_id uuid references auth.users(id) on delete set null;

-- Seed public.account from auth.users so every auth user has a row we can link to.
insert into public.account (account_id, email, display_name, status)
select
  u.id,
  u.email,
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name', ''),
    nullif(u.raw_user_meta_data->>'name', ''),
    split_part(u.email, '@', 1)
  ),
  'active'
from auth.users u
where u.email is not null
on conflict (account_id) do update
set
  email = excluded.email,
  display_name = coalesce(public.account.display_name, excluded.display_name);

update public.account a
set display_name = coalesce(
  nullif(a.display_name, ''),
  nullif(u.raw_user_meta_data->>'full_name', ''),
  nullif(u.raw_user_meta_data->>'name', ''),
  split_part(u.email, '@', 1)
)
from auth.users u
where a.account_id = u.id;

-- Remove placeholder ranking rows that were auto-created by the earlier script.
delete from public.player_rankings pr
using public.player_rankings other
where pr.account_id is not null
  and pr.elo = 0
  and pr.wins = 0
  and pr.losses = 0
  and normalize_key(pr.name) = normalize_key(other.name)
  and other.account_id is null
  and other.id <> pr.id;

-- Link account requests to the created auth account row.
update public.account_requests req
set linked_account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where req.linked_account_id is null
  and normalize_key(req.email) = normalize_key(a.email);

update public.account_requests_v2 req
set linked_account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where req.linked_account_id is null
  and normalize_key(req.email) = normalize_key(a.email);

do $$
declare
  has_email boolean;
  has_name boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'absence_reports'
      and column_name = 'email'
  ) into has_email;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'absence_reports'
      and column_name = 'name'
  ) into has_name;

  if has_email then
    execute $abs_email$
      update public.absence_reports ar
      set account_id = a.account_id
      from public.account a
      join auth.users u on u.id = a.account_id
      where ar.account_id is null
        and normalize_key(ar.email) = normalize_key(a.email)
    $abs_email$;
  elsif has_name then
    execute $abs_name$
      update public.absence_reports ar
      set account_id = a.account_id
      from public.account a
      join auth.users u on u.id = a.account_id
      where ar.account_id is null
        and normalize_key(ar.name) = normalize_key(a.display_name)
    $abs_name$;
  end if;
end $$;

-- Link player rankings to account rows by name first, then by email local-part.
update public.player_rankings pr
set account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where pr.account_id is null
  and (
    normalize_key(pr.name) = normalize_key(a.display_name)
    or normalize_key(pr.name) = normalize_key(split_part(a.email, '@', 1))
  );

-- Link match history players to account rows by the same matching rules.
update public.match_history mh
set player_1_account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where mh.player_1_account_id is null
  and (
    normalize_key(mh.player_1) = normalize_key(a.display_name)
    or normalize_key(mh.player_1) = normalize_key(split_part(a.email, '@', 1))
  );

update public.match_history mh
set player_2_account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where mh.player_2_account_id is null
  and (
    normalize_key(mh.player_2) = normalize_key(a.display_name)
    or normalize_key(mh.player_2) = normalize_key(split_part(a.email, '@', 1))
  );

update public.match_history mh
set winner_account_id = a.account_id
from public.account a
join auth.users u on u.id = a.account_id
where mh.winner_account_id is null
  and (
    normalize_key(mh.winner) = normalize_key(a.display_name)
    or normalize_key(mh.winner) = normalize_key(split_part(a.email, '@', 1))
  );

-- Optional convenience views that show the linked account info alongside each row.
create or replace view public.linked_player_rankings as
select
  pr.*,
  a.email as account_email,
  a.display_name as account_name
from public.player_rankings pr
left join public.account a on a.account_id = pr.account_id;

create or replace view public.linked_match_history as
select
  mh.*,
  p1.email as player_1_email,
  p1.display_name as player_1_name,
  p2.email as player_2_email,
  p2.display_name as player_2_name,
  w.email as winner_email,
  w.display_name as winner_name
from public.match_history mh
left join public.account p1 on p1.account_id = mh.player_1_account_id
left join public.account p2 on p2.account_id = mh.player_2_account_id
left join public.account w on w.account_id = mh.winner_account_id;

-- End of file
