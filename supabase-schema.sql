-- Collins-Academy database setup
-- Run this in Supabase Dashboard > SQL Editor.
-- The trial is 30 days from account creation. Students cannot edit their own role or trial dates.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student','admin')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '30 days'),
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  body text,
  video_url text,
  position integer not null default 1,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.has_learning_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and (p.trial_ends_at > now() or p.subscription_expires_at > now())
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles
for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
-- No student update policy: students cannot change role, trial dates, or subscription dates.

drop policy if exists "read published courses" on public.courses;
create policy "read published courses" on public.courses
for select to authenticated using (published = true or (select public.is_admin()));

drop policy if exists "read lessons with active access" on public.lessons;
create policy "read lessons with active access" on public.lessons
for select to authenticated using (
  (published = true and (select public.has_learning_access()))
  or (select public.is_admin())
);

drop policy if exists "read own progress or admin" on public.lesson_progress;
create policy "read own progress or admin" on public.lesson_progress
for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "insert own progress with access" on public.lesson_progress;
create policy "insert own progress with access" on public.lesson_progress
for insert to authenticated with check (
  user_id = (select auth.uid()) and (select public.has_learning_access())
);

drop policy if exists "update own progress with access" on public.lesson_progress;
create policy "update own progress with access" on public.lesson_progress
for update to authenticated using (
  user_id = (select auth.uid()) and (select public.has_learning_access())
) with check (
  user_id = (select auth.uid()) and (select public.has_learning_access())
);

-- Allow authenticated app users to read only the rows permitted by RLS.
grant select on public.profiles, public.courses, public.lessons, public.lesson_progress to authenticated;
grant insert, update on public.lesson_progress to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_learning_access() to authenticated;

insert into public.courses (slug, title, description, published)
values
 ('coreldraw','CorelDRAW','Learn graphic design, flyers, logos, banners and business cards.', true),
 ('excel','Microsoft Excel','Learn spreadsheets, formulas, calculations, tables and charts.', true),
 ('word','Microsoft Word','Learn document typing, formatting, letters, CVs and reports.', true),
 ('powerpoint','Microsoft PowerPoint','Learn presentation slides, layouts, transitions and animations.', true)
on conflict (slug) do update set title = excluded.title, description = excluded.description;

-- IMPORTANT: After creating your own account, make it the academy admin.
-- Replace the email below with the exact email used for your account, then run separately:
-- update public.profiles p
-- set role = 'admin'
-- from auth.users u
-- where p.id = u.id and u.email = 'YOUR-EMAIL@example.com';
