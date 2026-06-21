-- ================================================
-- CSV BULK IMPORT PLAYER RANKINGS
-- Security definer RPC for admin bulk import
-- ================================================
create or replace function public.bulk_upsert_player_rankings(
  p_players jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_player jsonb;
  v_name text;
  v_elo integer;
  v_wins integer;
  v_losses integer;
  v_division text;
  v_half text;
  v_csv_names text[];
begin
  -- Authorization check
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
    raise exception 'Not authorized to bulk import player rankings.';
  end if;

  -- Collect all names from the CSV
  v_csv_names := array[]::text[];
  for v_player in select * from jsonb_array_elements(p_players)
  loop
    v_name := trim(v_player->>'name');
    if v_name is not null and v_name <> '' then
      v_csv_names := array_append(v_csv_names, v_name);
    end if;
  end loop;

  -- Delete any players NOT in the CSV (full replacement)
  delete from public.player_rankings
  where name <> ALL(v_csv_names);

  -- Upsert: insert or update the player ranking row
  for v_player in select * from jsonb_array_elements(p_players)
  loop
    v_name := trim(v_player->>'name');
    v_elo := coalesce((v_player->>'elo')::integer, 0);
    v_wins := coalesce((v_player->>'wins')::integer, 0);
    v_losses := coalesce((v_player->>'losses')::integer, 0);
    v_division := nullif(trim(v_player->>'division'), '');
    v_half := nullif(trim(v_player->>'half'), '');

    if v_name is null or v_name = '' then
      continue;
    end if;

    insert into public.player_rankings (name, elo, wins, losses, division, half)
    values (v_name, v_elo, v_wins, v_losses, v_division, v_half)
    on conflict (name) do update set
      elo = excluded.elo,
      wins = excluded.wins,
      losses = excluded.losses,
      division = case when excluded.division is not null then excluded.division else player_rankings.division end,
      half = case when excluded.half is not null then excluded.half else player_rankings.half end;
  end loop;
end;
$$;

-- ================================================
-- SET PLAYER ELO DIRECTLY (not adjustment)
-- RPC for setting a player's ELO to an exact value
-- ================================================
create or replace function public.set_player_elo(
  p_player_name text,
  p_new_elo integer
)
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
    raise exception 'Not authorized to set player ELO.';
  end if;

  if p_player_name is null or trim(p_player_name) = '' then
    raise exception 'Player name cannot be empty.';
  end if;

  update public.player_rankings
  set elo = p_new_elo
  where normalize_key(name) = normalize_key(p_player_name);

  update public.account
  set elo = p_new_elo
  where normalize_key(display_name) = normalize_key(p_player_name) or (display_name is null and normalize_key((
    select name from public.player_rankings where normalize_key(name) = normalize_key(p_player_name) limit 1
  )) = normalize_key(p_player_name));
end;
$$;