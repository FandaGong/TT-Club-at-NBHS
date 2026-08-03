-- ================================================
-- ANNOUNCEMENTS
-- Club news/updates shown on announcements.html + the
-- homepage widget. Anyone can READ published posts;
-- only admins can INSERT/UPDATE/DELETE.
-- Run this once in the Supabase SQL editor.
-- ================================================

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  emoji       text not null default '📢',
  title       text not null,
  body        text not null default '',
  is_published boolean not null default true,
  is_pinned    boolean not null default false,
  publish_at   timestamptz,               -- optional: hide until this time
  created_at   timestamptz not null default now()
);

-- Helpful index for the "newest first" list.
create index if not exists announcements_created_idx
  on public.announcements (created_at desc);

alter table public.announcements enable row level security;

-- Reusable admin check: account.role = 'admin', OR one of the
-- hardcoded club-runner emails (matches the rest of the app).
-- We inline it in each policy so no extra function is required.

-- READ: anyone (including logged-out visitors) may read published,
-- non-future posts. Admins may read everything (drafts + scheduled).
drop policy if exists announcements_select_public on public.announcements;
create policy announcements_select_public
  on public.announcements for select
  using (
    (is_published = true and (publish_at is null or publish_at <= now()))
    or exists (
      select 1 from public.account a
      where a.account_id = auth.uid() and lower(a.role) = 'admin'
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
    )
  );

-- INSERT: admins only.
drop policy if exists announcements_insert_admin on public.announcements;
create policy announcements_insert_admin
  on public.announcements for insert
  with check (
    exists (
      select 1 from public.account a
      where a.account_id = auth.uid() and lower(a.role) = 'admin'
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
    )
  );

-- UPDATE: admins only.
drop policy if exists announcements_update_admin on public.announcements;
create policy announcements_update_admin
  on public.announcements for update
  using (
    exists (
      select 1 from public.account a
      where a.account_id = auth.uid() and lower(a.role) = 'admin'
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
    )
  );

-- DELETE: admins only.
drop policy if exists announcements_delete_admin on public.announcements;
create policy announcements_delete_admin
  on public.announcements for delete
  using (
    exists (
      select 1 from public.account a
      where a.account_id = auth.uid() and lower(a.role) = 'admin'
    )
    or exists (
      select 1 from auth.users u
      where u.id = auth.uid()
        and lower(u.email) in ('nbhsttclub@gmail.com', 'jonathanzhao111@gmail.com', 'damon.yuan@education.nsw.gov.au')
    )
  );
