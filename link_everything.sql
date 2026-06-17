create or replace function public.sync_player_divisions()
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
    raise exception 'Not authorized to sync player divisions.';
  end if;

  with ranked_players as (
    select
      id,
      row_number() over (
        partition by case
          when lower(coalesce(half, '')) like '%second%' then 'Second'
          else 'First'
        end
        order by elo desc, lower(coalesce(name, '')) asc, id asc
      ) as rank_position
    from public.player_rankings
  )
  update public.player_rankings pr
  set division = case
    when ranked_players.rank_position <= 4 then 'Division 1'
    when ranked_players.rank_position <= 7 then 'Division 2'
    else 'Division 3'
  end
  from ranked_players
  where pr.id = ranked_players.id
    and pr.division is distinct from case
      when ranked_players.rank_position <= 4 then 'Division 1'
      when ranked_players.rank_position <= 7 then 'Division 2'
      else 'Division 3'
    end;
end;
$$;
-- Link all account-owned data to Supabase Auth users
-- Run this once in the Supabase SQL editor.
-- It creates the missing account table if needed, adds link columns, and backfills rows.

create or replace function public.normalize_key(input text)
returns text
language sql
immutable
as $$

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

  perform public.sync_player_divisions();

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
  v_player_1_old_elo integer;
  v_player_2_old_elo integer;
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
    raise exception 'Not authorized to de matches.';
  end if;

  select * into v_match from public.match_history where id = p_match_id;
  if v_match is null then
    raise exception 'Match not found.';
  end if;

  -- Reverse Elo changes by calculating what they were before
  -- new_elo - change = old_elo
  v_player_1_old_elo := v_match.p1_new_elo - v_match.p1_elo_change;
  v_player_2_old_elo := v_match.p2_new_elo - v_match.p2_elo_change;

  -- Update player_rankings to revert Elo and adjust win/loss counts
  update public.player_rankings
  set
    elo = case
      when normalize_key(name) = normalize_key(v_match.player_1) then v_player_1_old_elo
      when normalize_key(name) = normalize_key(v_match.player_2) then v_player_2_old_elo
      else elo
    end,
    wins = greatest(wins - case when normalize_key(name) = normalize_key(v_match.winner) then 1 else 0 end, 0),
    losses = greatest(losses - case when normalize_key(name) <> normalize_key(v_match.winner) and (normalize_key(name) = normalize_key(v_match.player_1) or normalize_key(name) = normalize_key(v_match.player_2)) then 1 else 0 end, 0)
  where normalize_key(name) in (normalize_key(v_match.player_1), normalize_key(v_match.player_2));

  perform public.sync_player_divisions();

  -- Update account table to revert Elo and adjust win/loss counts
  if v_match.player_1_account_id is not null then
    update public.account
    set
      elo = v_player_1_old_elo,
      wins = greatest(wins - case when normalize_key(v_match.winner) = normalize_key(v_match.player_1) then 1 else 0 end, 0),
      losses = greatest(losses - case when normalize_key(v_match.winner) <> normalize_key(v_match.player_1) then 1 else 0 end, 0)
    where account_id = v_match.player_1_account_id;
  elsif v_match.player_1 is not null then
    update public.account
    set
      elo = v_player_1_old_elo,
      wins = greatest(wins - case when normalize_key(v_match.winner) = normalize_key(v_match.player_1) then 1 else 0 end, 0),
      losses = greatest(losses - case when normalize_key(v_match.winner) <> normalize_key(v_match.player_1) then 1 else 0 end, 0)
    where normalize_key(coalesce(display_name, split_part(email, '@', 1))) = normalize_key(v_match.player_1);
  end if;

  if v_match.player_2_account_id is not null then
    update public.account
    set
      elo = v_player_2_old_elo,
      wins = greatest(wins - case when normalize_key(v_match.winner) = normalize_key(v_match.player_2) then 1 else 0 end, 0),
      losses = greatest(losses - case when normalize_key(v_match.winner) <> normalize_key(v_match.player_2) then 1 else 0 end, 0)
    where account_id = v_match.player_2_account_id;
  elsif v_match.player_2 is not null then
    update public.account
    set
      elo = v_player_2_old_elo,
      wins = greatest(wins - case when normalize_key(v_match.winner) = normalize_key(v_match.player_2) then 1 else 0 end, 0),
      losses = greatest(losses - case when normalize_key(v_match.winner) <> normalize_key(v_match.player_2) then 1 else 0 end, 0)
    where normalize_key(coalesce(display_name, split_part(email, '@', 1))) = normalize_key(v_match.player_2);
  end if;

  -- Delete the match
  delete from public.match_history where id = p_match_id;
end;
$$;

create or replace function public.adjust_player_elo(p_player_name text, p_elo_change integer)
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
    raise exception 'Not authorized to adjust player ELO.';
  end if;

  if p_player_name is null or trim(p_player_name) = '' then
    raise exception 'Player name cannot be empty.';
  end if;

  update public.player_rankings
  set elo = elo + p_elo_change
  where normalize_key(name) = normalize_key(p_player_name);

  perform public.sync_player_divisions();

  update public.account
  set elo = elo + p_elo_change
  where normalize_key(display_name) = normalize_key(p_player_name) or (display_name is null and normalize_key((
    select name from public.player_rankings where normalize_key(name) = normalize_key(p_player_name) limit 1
  )) = normalize_key(p_player_name));
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
