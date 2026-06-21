-- Little London Management System
-- Phase 8: Attendance management based on classes, student enrolments, and teacher assignments.

create extension if not exists "pgcrypto";

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  session_date date not null,
  status text not null default 'draft',
  created_by uuid references auth.users(id),
  submitted_at timestamptz,
  submitted_by uuid references auth.users(id),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  locked_at timestamptz,
  locked_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint attendance_sessions_status_check check (status in ('draft', 'submitted', 'reviewed', 'locked', 'archived')),
  constraint attendance_sessions_review_after_submit_check check (reviewed_at is null or submitted_at is null or reviewed_at >= submitted_at),
  constraint attendance_sessions_lock_after_submit_check check (locked_at is null or submitted_at is null or locked_at >= submitted_at)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  attendance_session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete restrict,
  student_enrolment_id uuid not null references public.student_enrolments(id) on delete restrict,
  status text not null default 'present',
  arrival_time time,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint attendance_records_status_check check (status in ('present', 'absent', 'late', 'excused', 'sick'))
);

create table if not exists public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  attendance_record_id uuid not null references public.attendance_records(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  correction_reason text not null,
  corrected_by uuid not null references auth.users(id),
  corrected_at timestamptz not null default now(),
  constraint attendance_corrections_previous_status_check check (previous_status in ('present', 'absent', 'late', 'excused', 'sick')),
  constraint attendance_corrections_new_status_check check (new_status in ('present', 'absent', 'late', 'excused', 'sick')),
  constraint attendance_corrections_reason_check check (length(trim(correction_reason)) >= 3)
);

create unique index if not exists attendance_sessions_class_date_active_key
on public.attendance_sessions(class_id, session_date)
where deleted_at is null;

create unique index if not exists attendance_records_session_student_active_key
on public.attendance_records(attendance_session_id, student_id)
where deleted_at is null;

create index if not exists idx_attendance_sessions_class_id on public.attendance_sessions(class_id);
create index if not exists idx_attendance_sessions_session_date on public.attendance_sessions(session_date);
create index if not exists idx_attendance_sessions_status on public.attendance_sessions(status);
create index if not exists idx_attendance_sessions_deleted_at on public.attendance_sessions(deleted_at);

create index if not exists idx_attendance_records_session_id on public.attendance_records(attendance_session_id);
create index if not exists idx_attendance_records_student_id on public.attendance_records(student_id);
create index if not exists idx_attendance_records_enrolment_id on public.attendance_records(student_enrolment_id);
create index if not exists idx_attendance_records_status on public.attendance_records(status);
create index if not exists idx_attendance_records_deleted_at on public.attendance_records(deleted_at);

create index if not exists idx_attendance_corrections_record_id on public.attendance_corrections(attendance_record_id);
create index if not exists idx_attendance_corrections_corrected_by on public.attendance_corrections(corrected_by);
create index if not exists idx_attendance_corrections_corrected_at on public.attendance_corrections(corrected_at);

drop trigger if exists attendance_sessions_set_updated_at on public.attendance_sessions;
create trigger attendance_sessions_set_updated_at
before update on public.attendance_sessions
for each row execute function public.set_updated_at();

drop trigger if exists attendance_records_set_updated_at on public.attendance_records;
create trigger attendance_records_set_updated_at
before update on public.attendance_records
for each row execute function public.set_updated_at();

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_corrections enable row level security;

drop policy if exists "attendance_sessions_management_all" on public.attendance_sessions;
create policy "attendance_sessions_management_all"
on public.attendance_sessions
for all
to authenticated
using (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'))
with check (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'));

drop policy if exists "attendance_sessions_teacher_assigned" on public.attendance_sessions;
drop policy if exists "attendance_sessions_teacher_assigned_select" on public.attendance_sessions;
create policy "attendance_sessions_teacher_assigned_select"
on public.attendance_sessions
for select
to authenticated
using (
  public.is_teacher()
  and public.has_permission('attendance.view.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = attendance_sessions.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_sessions_teacher_assigned_insert" on public.attendance_sessions;
create policy "attendance_sessions_teacher_assigned_insert"
on public.attendance_sessions
for insert
to authenticated
with check (
  public.is_teacher()
  and public.has_permission('attendance.create.assigned_classes')
  and deleted_at is null
  and reviewed_at is null
  and locked_at is null
  and status = 'draft'
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = attendance_sessions.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_sessions_teacher_assigned_update" on public.attendance_sessions;
create policy "attendance_sessions_teacher_assigned_update"
on public.attendance_sessions
for update
to authenticated
using (
  public.is_teacher()
  and public.has_permission('attendance.edit.assigned_classes_same_day')
  and session_date = current_date
  and reviewed_at is null
  and locked_at is null
  and status not in ('reviewed', 'locked', 'archived')
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = attendance_sessions.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
)
with check (
  public.is_teacher()
  and public.has_permission('attendance.edit.assigned_classes_same_day')
  and session_date = current_date
  and reviewed_at is null
  and locked_at is null
  and status not in ('reviewed', 'locked', 'archived')
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = attendance_sessions.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_sessions_teacher_cleanup_own_draft" on public.attendance_sessions;
create policy "attendance_sessions_teacher_cleanup_own_draft"
on public.attendance_sessions
for delete
to authenticated
using (
  public.is_teacher()
  and public.has_permission('attendance.create.assigned_classes')
  and created_by = auth.uid()
  and status = 'draft'
  and submitted_at is null
  and reviewed_at is null
  and locked_at is null
  and deleted_at is null
  and exists (
    select 1
    from public.class_teachers ct
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where ct.class_id = attendance_sessions.class_id
      and ct.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_records_management_all" on public.attendance_records;
create policy "attendance_records_management_all"
on public.attendance_records
for all
to authenticated
using (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'))
with check (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'));

drop policy if exists "attendance_records_teacher_assigned" on public.attendance_records;
drop policy if exists "attendance_records_teacher_assigned_select" on public.attendance_records;
create policy "attendance_records_teacher_assigned_select"
on public.attendance_records
for select
to authenticated
using (
  public.is_teacher()
  and public.has_permission('attendance.view.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.attendance_sessions s
    join public.class_teachers ct on ct.class_id = s.class_id and ct.deleted_at is null
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where s.id = attendance_records.attendance_session_id
      and s.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_records_teacher_assigned_insert" on public.attendance_records;
create policy "attendance_records_teacher_assigned_insert"
on public.attendance_records
for insert
to authenticated
with check (
  public.is_teacher()
  and public.has_permission('attendance.create.assigned_classes')
  and deleted_at is null
  and exists (
    select 1
    from public.attendance_sessions s
    join public.class_teachers ct on ct.class_id = s.class_id and ct.deleted_at is null
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where s.id = attendance_records.attendance_session_id
      and s.deleted_at is null
      and s.reviewed_at is null
      and s.locked_at is null
      and s.status = 'draft'
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_records_teacher_assigned_update" on public.attendance_records;
create policy "attendance_records_teacher_assigned_update"
on public.attendance_records
for update
to authenticated
using (
  public.is_teacher()
  and public.has_permission('attendance.edit.assigned_classes_same_day')
  and deleted_at is null
  and exists (
    select 1
    from public.attendance_sessions s
    join public.class_teachers ct on ct.class_id = s.class_id and ct.deleted_at is null
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where s.id = attendance_records.attendance_session_id
      and s.session_date = current_date
      and s.reviewed_at is null
      and s.locked_at is null
      and s.status not in ('reviewed', 'locked', 'archived')
      and s.deleted_at is null
      and t.user_id = auth.uid()
  )
)
with check (
  public.is_teacher()
  and public.has_permission('attendance.edit.assigned_classes_same_day')
  and deleted_at is null
  and exists (
    select 1
    from public.attendance_sessions s
    join public.class_teachers ct on ct.class_id = s.class_id and ct.deleted_at is null
    join public.teachers t on t.id = ct.teacher_id and t.deleted_at is null
    where s.id = attendance_records.attendance_session_id
      and s.session_date = current_date
      and s.reviewed_at is null
      and s.locked_at is null
      and s.status not in ('reviewed', 'locked', 'archived')
      and s.deleted_at is null
      and t.user_id = auth.uid()
  )
);

drop policy if exists "attendance_corrections_management_all" on public.attendance_corrections;
create policy "attendance_corrections_management_all"
on public.attendance_corrections
for all
to authenticated
using (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'))
with check (public.is_super_admin() or public.has_permission('attendance.manage.all') or public.has_permission('attendance.approve.all'));
