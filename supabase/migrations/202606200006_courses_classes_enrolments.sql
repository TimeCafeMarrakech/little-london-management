-- Little London Management System
-- Phase 7: Courses, classes, teacher assignments, and student enrolments.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  course_code text not null,
  name text not null,
  description text,
  level text,
  minimum_age integer,
  maximum_age integer,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint courses_status_check check (status in ('active', 'inactive', 'archived')),
  constraint courses_age_check check (
    (minimum_age is null or minimum_age >= 0)
    and (maximum_age is null or maximum_age >= 0)
    and (minimum_age is null or maximum_age is null or maximum_age >= minimum_age)
  )
);

comment on column public.courses.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  class_code text not null,
  course_id uuid not null references public.courses(id) on delete restrict,
  name text not null,
  capacity integer not null,
  status text not null default 'active',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint classes_status_check check (status in ('active', 'inactive', 'archived')),
  constraint classes_capacity_check check (capacity > 0),
  constraint classes_date_range_check check (start_date is null or end_date is null or end_date >= start_date)
);

comment on column public.classes.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create table if not exists public.class_teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  role text not null default 'lead',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint class_teachers_role_check check (role in ('lead', 'assistant', 'substitute'))
);

create table if not exists public.student_enrolments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolment_date date not null default current_date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint student_enrolments_status_check check (status in ('active', 'completed', 'withdrawn', 'archived'))
);

create unique index if not exists courses_course_code_active_key
on public.courses(course_code)
where deleted_at is null;

create unique index if not exists classes_class_code_active_key
on public.classes(class_code)
where deleted_at is null;

create unique index if not exists class_teachers_class_teacher_active_key
on public.class_teachers(class_id, teacher_id)
where deleted_at is null;

create unique index if not exists student_enrolments_student_class_active_key
on public.student_enrolments(student_id, class_id)
where deleted_at is null;

create index if not exists idx_courses_branch_id on public.courses(branch_id);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_deleted_at on public.courses(deleted_at);
create index if not exists idx_courses_name_trgm on public.courses using gin (name gin_trgm_ops);

create index if not exists idx_classes_branch_id on public.classes(branch_id);
create index if not exists idx_classes_course_id on public.classes(course_id);
create index if not exists idx_classes_status on public.classes(status);
create index if not exists idx_classes_deleted_at on public.classes(deleted_at);
create index if not exists idx_classes_start_date on public.classes(start_date);
create index if not exists idx_classes_name_trgm on public.classes using gin (name gin_trgm_ops);

create index if not exists idx_class_teachers_class_id on public.class_teachers(class_id);
create index if not exists idx_class_teachers_teacher_id on public.class_teachers(teacher_id);
create index if not exists idx_class_teachers_deleted_at on public.class_teachers(deleted_at);

create index if not exists idx_student_enrolments_student_id on public.student_enrolments(student_id);
create index if not exists idx_student_enrolments_class_id on public.student_enrolments(class_id);
create index if not exists idx_student_enrolments_status on public.student_enrolments(status);
create index if not exists idx_student_enrolments_deleted_at on public.student_enrolments(deleted_at);

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.classes enable row level security;
alter table public.class_teachers enable row level security;
alter table public.student_enrolments enable row level security;

drop policy if exists "courses_management_all" on public.courses;
create policy "courses_management_all"
on public.courses
for all
to authenticated
using (public.is_super_admin() or public.has_permission('courses.manage.all'))
with check (public.is_super_admin() or public.has_permission('courses.manage.all'));

drop policy if exists "courses_teacher_assigned_read" on public.courses;
create policy "courses_teacher_assigned_read"
on public.courses
for select
to authenticated
using (
  public.is_teacher()
  and public.has_permission('courses.view.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.classes c
    join public.class_teachers ct on ct.class_id = c.id and ct.deleted_at is null
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where c.course_id = courses.id
      and c.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "classes_management_all" on public.classes;
create policy "classes_management_all"
on public.classes
for all
to authenticated
using (public.is_super_admin() or public.has_permission('classes.manage.all'))
with check (public.is_super_admin() or public.has_permission('classes.manage.all'));

drop policy if exists "classes_teacher_assigned_read" on public.classes;
create policy "classes_teacher_assigned_read"
on public.classes
for select
to authenticated
using (
  public.is_teacher()
  and public.has_permission('classes.view.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = classes.id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "class_teachers_management_all" on public.class_teachers;
create policy "class_teachers_management_all"
on public.class_teachers
for all
to authenticated
using (public.is_super_admin() or public.has_permission('classes.assign.all') or public.has_permission('teachers.manage.all'))
with check (public.is_super_admin() or public.has_permission('classes.assign.all') or public.has_permission('teachers.manage.all'));

drop policy if exists "class_teachers_teacher_assigned_read" on public.class_teachers;
create policy "class_teachers_teacher_assigned_read"
on public.class_teachers
for select
to authenticated
using (
  public.is_teacher()
  and deleted_at is null
  and exists (
    select 1
    from public.teachers t
    where t.id = class_teachers.teacher_id
      and t.user_id = auth.uid()
      and t.deleted_at is null
  )
);

drop policy if exists "student_enrolments_management_all" on public.student_enrolments;
create policy "student_enrolments_management_all"
on public.student_enrolments
for all
to authenticated
using (public.is_super_admin() or public.has_permission('enrolments.manage.all'))
with check (public.is_super_admin() or public.has_permission('enrolments.manage.all'));

drop policy if exists "student_enrolments_teacher_assigned_read" on public.student_enrolments;
create policy "student_enrolments_teacher_assigned_read"
on public.student_enrolments
for select
to authenticated
using (
  public.is_teacher()
  and public.has_permission('classes.view.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = student_enrolments.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);
