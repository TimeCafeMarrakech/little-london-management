-- Little London Management System
-- Phase 6: Teacher management.

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  user_id uuid references public.user_profiles(id),
  teacher_number text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  email citext,
  phone text,
  status text not null default 'active',
  employment_type text not null default 'part_time',
  hire_date date,
  qualifications text,
  bio text,
  availability_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint teachers_status_check check (status in ('active', 'inactive', 'archived')),
  constraint teachers_employment_type_check check (employment_type in ('full_time', 'part_time', 'contractor', 'substitute'))
);

comment on column public.teachers.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create unique index if not exists teachers_teacher_number_active_key
on public.teachers(teacher_number)
where deleted_at is null;

create unique index if not exists teachers_user_id_active_key
on public.teachers(user_id)
where user_id is not null and deleted_at is null;

create unique index if not exists teachers_email_active_key
on public.teachers(lower(email::text))
where email is not null and deleted_at is null;

create index if not exists idx_teachers_branch_id on public.teachers(branch_id);
create index if not exists idx_teachers_user_id on public.teachers(user_id);
create index if not exists idx_teachers_status on public.teachers(status);
create index if not exists idx_teachers_employment_type on public.teachers(employment_type);
create index if not exists idx_teachers_deleted_at on public.teachers(deleted_at);
create index if not exists idx_teachers_hire_date on public.teachers(hire_date);
create index if not exists idx_teachers_full_name_trgm on public.teachers using gin (full_name gin_trgm_ops);

drop trigger if exists teachers_set_updated_at on public.teachers;
create trigger teachers_set_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

alter table public.teachers enable row level security;

drop policy if exists "teachers_management_all" on public.teachers;
create policy "teachers_management_all"
on public.teachers
for all
to authenticated
using (public.is_super_admin() or public.has_permission('teachers.manage.all'))
with check (public.is_super_admin() or public.has_permission('teachers.manage.all'));

drop policy if exists "teachers_own_profile_read" on public.teachers;
create policy "teachers_own_profile_read"
on public.teachers
for select
to authenticated
using (public.is_teacher() and user_id = auth.uid() and deleted_at is null);
