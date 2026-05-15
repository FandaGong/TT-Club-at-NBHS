# Normanhurst Table Tennis Club Website
Normo Table Tennis Club Website

## Supabase setup for absence reports

The absence report page now expects a Supabase project instead of storing reports in localStorage.

1. Create a Supabase project.
2. Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` placeholders in [absence-report.html](absence-report.html) with your project values.
3. Create an Auth user for the admin login in Supabase Auth.
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

create policy "Authenticated users can delete absence reports"
on public.absence_reports
for delete
to authenticated
using (true);
```

If you want tighter admin control later, we can switch the read policy to an email allowlist or a custom admin claim.

## Account request approval

The admin page now uses separate tabs for Admin Login, Standard User Login, and Account Creation. A user submits their email and password in the create-account tab, an admin reviews the request in the dashboard, and only then can the account be activated.

If you see an error like `could not find table public.account_requests`, create the table below first.

This table stores the request metadata and the password the user chose so an admin can create the Supabase Auth account later.

Create this table:

```sql
create table public.account_requests (
	id uuid primary key default gen_random_uuid(),
	email text not null,
	password text not null,
	role text not null default 'standard',
	status text not null default 'pending',
	reviewed_by text,
	reviewed_at timestamptz,
	created_at timestamptz not null default now()
);
```

If you already created `account_requests` without the password column, run:

```sql
alter table public.account_requests add column if not exists password text;
```

The approval flow reads that password later to create the Supabase Auth account.

And enable Row Level Security with policies like these:

```sql
alter table public.account_requests enable row level security;

create policy "Anyone can insert account requests"
on public.account_requests
for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can read account requests"
on public.account_requests
for select
to anon, authenticated
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
```

The admin navbar badge is red for admins and green for standard users. It stays hidden when nobody is signed in.
