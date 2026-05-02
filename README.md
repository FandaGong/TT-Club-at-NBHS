# Normanhurst Table Tennis Club Website
Normo Table Tennis Club Website

## Supabase setup for absence reports

The absence report page now expects a Supabase project instead of storing reports in localStorage.

1. Create a Supabase project.
2. Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` placeholders in [absence-report.html](absence-report.html) with your project values.
3. Create an Auth user for the admin login in Supabase Auth. Do not enable public sign-up.
4. Create this table:

```sql
create table public.absence_reports (
	id uuid primary key default gen_random_uuid(),
	name text not null,
	email text not null,
	reason text not null,
	status text not null default 'pending',
	created_at timestamptz not null default now()
);
```

5. Enable Row Level Security and add policies like these:

```sql
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
```

If you want tighter admin control later, we can switch the read policy to an email allowlist or a custom admin claim.
