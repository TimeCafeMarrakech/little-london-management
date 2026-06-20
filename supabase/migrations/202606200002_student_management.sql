-- Little London Management System
-- Phase 4: Student management only.

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  student_number text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  date_of_birth date not null,
  gender text,
  primary_language text,
  school_name text,
  photo_document_id uuid,
  medical_notes text,
  emergency_notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint students_status_check check (status in ('active', 'inactive', 'archived')),
  constraint students_gender_check check (gender is null or gender in ('female', 'male', 'other', 'prefer_not_to_say')),
  constraint students_date_of_birth_check check (date_of_birth <= current_date)
);

comment on column public.students.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create unique index if not exists students_student_number_active_key
on public.students (student_number)
where deleted_at is null;

create index if not exists idx_students_branch_id on public.students(branch_id);
create index if not exists idx_students_status on public.students(status);
create index if not exists idx_students_deleted_at on public.students(deleted_at);
create index if not exists idx_students_created_at on public.students(created_at);
create index if not exists idx_students_full_name_trgm on public.students using gin (full_name gin_trgm_ops);

create table if not exists public.parent_student_relationships (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid,
  parent_full_name text not null,
  parent_email citext,
  parent_phone text,
  relationship_type text not null,
  is_primary_contact boolean not null default false,
  can_pick_up boolean not null default true,
  receives_invoices boolean not null default true,
  receives_announcements boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint parent_student_relationships_status_check check (status in ('active', 'inactive', 'archived')),
  constraint parent_student_relationships_type_check check (relationship_type in ('mother', 'father', 'guardian', 'grandparent', 'other'))
);

comment on column public.parent_student_relationships.parent_id is
  'Future parent FK. The parents table is introduced in the Parent Management phase.';

create unique index if not exists parent_student_relationships_unique_active_snapshot
on public.parent_student_relationships (student_id, lower(parent_full_name), relationship_type)
where deleted_at is null;

create index if not exists idx_parent_student_relationships_student_id on public.parent_student_relationships(student_id);
create index if not exists idx_parent_student_relationships_parent_id on public.parent_student_relationships(parent_id);
create index if not exists idx_parent_student_relationships_status on public.parent_student_relationships(status);
create index if not exists idx_parent_student_relationships_deleted_at on public.parent_student_relationships(deleted_at);

create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone text not null,
  alternate_phone text,
  priority integer not null default 1,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint emergency_contacts_priority_check check (priority between 1 and 5),
  constraint emergency_contacts_status_check check (status in ('active', 'inactive', 'archived'))
);

create index if not exists idx_emergency_contacts_student_id on public.emergency_contacts(student_id);
create index if not exists idx_emergency_contacts_status on public.emergency_contacts(status);
create index if not exists idx_emergency_contacts_deleted_at on public.emergency_contacts(deleted_at);

create table if not exists public.student_medical_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  doctor_name text,
  doctor_phone text,
  insurance_provider text,
  policy_number text,
  medical_conditions text,
  medication_notes text,
  dietary_requirements text,
  emergency_medical_consent boolean not null default false,
  visibility text not null default 'management',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint student_medical_profiles_visibility_check check (visibility in ('management', 'teacher_limited', 'parent_visible'))
);

create index if not exists idx_student_medical_profiles_student_id on public.student_medical_profiles(student_id);
create index if not exists idx_student_medical_profiles_deleted_at on public.student_medical_profiles(deleted_at);

create table if not exists public.student_allergies (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  allergen text not null,
  severity text not null default 'unknown',
  reaction text,
  treatment text,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint student_allergies_severity_check check (severity in ('unknown', 'mild', 'moderate', 'severe')),
  constraint student_allergies_status_check check (status in ('active', 'inactive', 'archived'))
);

create index if not exists idx_student_allergies_student_id on public.student_allergies(student_id);
create index if not exists idx_student_allergies_status on public.student_allergies(status);
create index if not exists idx_student_allergies_deleted_at on public.student_allergies(deleted_at);

create table if not exists public.student_status_history (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  from_status text,
  to_status text not null,
  reason text,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id),
  constraint student_status_history_to_status_check check (to_status in ('active', 'inactive', 'archived')),
  constraint student_status_history_from_status_check check (from_status is null or from_status in ('active', 'inactive', 'archived'))
);

create index if not exists idx_student_status_history_student_id on public.student_status_history(student_id);
create index if not exists idx_student_status_history_changed_at on public.student_status_history(changed_at);

drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists parent_student_relationships_set_updated_at on public.parent_student_relationships;
create trigger parent_student_relationships_set_updated_at
before update on public.parent_student_relationships
for each row execute function public.set_updated_at();

drop trigger if exists emergency_contacts_set_updated_at on public.emergency_contacts;
create trigger emergency_contacts_set_updated_at
before update on public.emergency_contacts
for each row execute function public.set_updated_at();

drop trigger if exists student_medical_profiles_set_updated_at on public.student_medical_profiles;
create trigger student_medical_profiles_set_updated_at
before update on public.student_medical_profiles
for each row execute function public.set_updated_at();

drop trigger if exists student_allergies_set_updated_at on public.student_allergies;
create trigger student_allergies_set_updated_at
before update on public.student_allergies
for each row execute function public.set_updated_at();

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'teacher'
$$;

create or replace function public.is_parent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'parent'
$$;

alter table public.students enable row level security;
alter table public.parent_student_relationships enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.student_medical_profiles enable row level security;
alter table public.student_allergies enable row level security;
alter table public.student_status_history enable row level security;

drop policy if exists "students_management_all" on public.students;
create policy "students_management_all"
on public.students
for all
to authenticated
using (public.is_super_admin() or public.has_permission('students.manage.all'))
with check (public.is_super_admin() or public.has_permission('students.manage.all'));

drop policy if exists "students_teacher_read_placeholder" on public.students;
create policy "students_teacher_read_placeholder"
on public.students
for select
to authenticated
using (public.is_teacher() and public.has_permission('students.view.assigned_students') and false);

drop policy if exists "parent_student_relationships_management_all" on public.parent_student_relationships;
create policy "parent_student_relationships_management_all"
on public.parent_student_relationships
for all
to authenticated
using (public.is_super_admin() or public.has_permission('students.manage.all'))
with check (public.is_super_admin() or public.has_permission('students.manage.all'));

drop policy if exists "emergency_contacts_management_all" on public.emergency_contacts;
create policy "emergency_contacts_management_all"
on public.emergency_contacts
for all
to authenticated
using (public.is_super_admin() or public.has_permission('students.manage.all'))
with check (public.is_super_admin() or public.has_permission('students.manage.all'));

drop policy if exists "student_medical_profiles_management_all" on public.student_medical_profiles;
create policy "student_medical_profiles_management_all"
on public.student_medical_profiles
for all
to authenticated
using (public.is_super_admin() or public.has_permission('medical_records.manage.all'))
with check (public.is_super_admin() or public.has_permission('medical_records.manage.all'));

drop policy if exists "student_allergies_management_all" on public.student_allergies;
create policy "student_allergies_management_all"
on public.student_allergies
for all
to authenticated
using (public.is_super_admin() or public.has_permission('medical_records.manage.all'))
with check (public.is_super_admin() or public.has_permission('medical_records.manage.all'));

drop policy if exists "student_status_history_management_read" on public.student_status_history;
create policy "student_status_history_management_read"
on public.student_status_history
for select
to authenticated
using (public.is_super_admin() or public.has_permission('students.manage.all'));

drop policy if exists "student_status_history_management_insert" on public.student_status_history;
create policy "student_status_history_management_insert"
on public.student_status_history
for insert
to authenticated
with check (public.is_super_admin() or public.has_permission('students.manage.all'));
