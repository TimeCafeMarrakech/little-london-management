-- Little London Management System
-- Phase 11: Parent Portal MVP read-only RLS and permission seeds.

insert into public.permissions (module, action, scope, key, description, is_system_permission)
values
  ('classes', 'view', 'own_child', 'classes.view.own_child', 'Parent may view own child classes.', true),
  ('enrolments', 'view', 'own_child', 'enrolments.view.own_child', 'Parent may view own child enrolments.', true),
  ('attendance', 'view', 'own_child', 'attendance.view.own_child', 'Parent may view own child attendance history.', true),
  ('invoices', 'view', 'own_child', 'invoices.view.own_child', 'Parent may view own family invoices.', true),
  ('payments', 'view', 'own_child', 'payments.view.own_child', 'Parent may view own family payments.', true),
  ('events', 'view', 'own_child', 'events.view.own_child', 'Parent may view own child event bookings.', true)
on conflict (key) do update set
  module = excluded.module,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description,
  is_system_permission = excluded.is_system_permission;

with role_permission_keys(role_name, permission_key) as (
  values
    ('parent', 'parents.view.own'),
    ('parent', 'students.view.own_child'),
    ('parent', 'classes.view.own_child'),
    ('parent', 'enrolments.view.own_child'),
    ('parent', 'attendance.view.own_child'),
    ('parent', 'invoices.view.own_child'),
    ('parent', 'payments.view.own_child'),
    ('parent', 'events.view.own_child')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_keys rpk
join public.roles r on r.name = rpk.role_name
join public.permissions p on p.key = rpk.permission_key
on conflict (role_id, permission_id) do nothing;

create or replace function public.current_parent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.parents p
  where p.user_id = auth.uid()
    and p.status = 'active'
    and p.deleted_at is null
  limit 1
$$;

create or replace function public.parent_can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.parent_student_relationships psr
    join public.parents p on p.id = psr.parent_id
    join public.students s on s.id = psr.student_id
    where p.user_id = auth.uid()
      and p.status = 'active'
      and p.deleted_at is null
      and psr.student_id = target_student_id
      and psr.status = 'active'
      and psr.deleted_at is null
      and s.deleted_at is null
      and s.status <> 'archived'
  )
$$;

create or replace function public.parent_can_access_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_enrolments se
    where se.class_id = target_class_id
      and se.deleted_at is null
      and public.parent_can_access_student(se.student_id)
  )
$$;

create or replace function public.parent_can_access_invoice(target_invoice_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.invoices i
    where i.id = target_invoice_id
      and i.deleted_at is null
      and i.parent_id = public.current_parent_id()
      and public.parent_can_access_student(i.student_id)
  )
$$;

create or replace function public.parent_can_access_payment(target_payment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.payments p
    where p.id = target_payment_id
      and p.parent_id = public.current_parent_id()
      and public.parent_can_access_student(p.student_id)
  )
$$;

create or replace function public.parent_can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_bookings eb
    where eb.event_id = target_event_id
      and eb.deleted_at is null
      and eb.parent_id = public.current_parent_id()
      and public.parent_can_access_student(eb.student_id)
  )
$$;

drop policy if exists "parents_parent_portal_select_own" on public.parents;
create policy "parents_parent_portal_select_own"
on public.parents
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('parents.view.own')
  and user_id = auth.uid()
  and status = 'active'
  and deleted_at is null
);

drop policy if exists "parent_student_relationships_parent_portal_select_own" on public.parent_student_relationships;
create policy "parent_student_relationships_parent_portal_select_own"
on public.parent_student_relationships
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('students.view.own_child')
  and parent_id = public.current_parent_id()
  and status = 'active'
  and deleted_at is null
);

drop policy if exists "students_parent_portal_select_own_child" on public.students;
create policy "students_parent_portal_select_own_child"
on public.students
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('students.view.own_child')
  and deleted_at is null
  and status <> 'archived'
  and public.parent_can_access_student(students.id)
);

drop policy if exists "student_enrolments_parent_portal_select_own_child" on public.student_enrolments;
create policy "student_enrolments_parent_portal_select_own_child"
on public.student_enrolments
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('enrolments.view.own_child')
  and deleted_at is null
  and public.parent_can_access_student(student_enrolments.student_id)
);

drop policy if exists "classes_parent_portal_select_own_child" on public.classes;
create policy "classes_parent_portal_select_own_child"
on public.classes
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('classes.view.own_child')
  and deleted_at is null
  and status <> 'archived'
  and public.parent_can_access_class(classes.id)
);

drop policy if exists "courses_parent_portal_select_own_child" on public.courses;
create policy "courses_parent_portal_select_own_child"
on public.courses
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('classes.view.own_child')
  and deleted_at is null
  and status <> 'archived'
  and exists (
    select 1
    from public.classes c
    where c.course_id = courses.id
      and c.deleted_at is null
      and public.parent_can_access_class(c.id)
  )
);

drop policy if exists "class_teachers_parent_portal_select_own_child" on public.class_teachers;
create policy "class_teachers_parent_portal_select_own_child"
on public.class_teachers
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('classes.view.own_child')
  and deleted_at is null
  and public.parent_can_access_class(class_teachers.class_id)
);

drop policy if exists "teachers_parent_portal_select_child_teachers" on public.teachers;
create policy "teachers_parent_portal_select_child_teachers"
on public.teachers
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('classes.view.own_child')
  and deleted_at is null
  and status = 'active'
  and exists (
    select 1
    from public.class_teachers ct
    where ct.teacher_id = teachers.id
      and ct.deleted_at is null
      and public.parent_can_access_class(ct.class_id)
  )
);

drop policy if exists "attendance_sessions_parent_portal_select_own_child" on public.attendance_sessions;
create policy "attendance_sessions_parent_portal_select_own_child"
on public.attendance_sessions
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('attendance.view.own_child')
  and deleted_at is null
  and status in ('submitted', 'reviewed', 'locked')
  and exists (
    select 1
    from public.attendance_records ar
    where ar.attendance_session_id = attendance_sessions.id
      and ar.deleted_at is null
      and public.parent_can_access_student(ar.student_id)
  )
);

drop policy if exists "attendance_records_parent_portal_select_own_child" on public.attendance_records;
create policy "attendance_records_parent_portal_select_own_child"
on public.attendance_records
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('attendance.view.own_child')
  and deleted_at is null
  and public.parent_can_access_student(attendance_records.student_id)
  and exists (
    select 1
    from public.attendance_sessions ats
    where ats.id = attendance_records.attendance_session_id
      and ats.deleted_at is null
      and ats.status in ('submitted', 'reviewed', 'locked')
  )
);

drop policy if exists "invoices_parent_portal_select_own_family" on public.invoices;
create policy "invoices_parent_portal_select_own_family"
on public.invoices
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('invoices.view.own_child')
  and deleted_at is null
  and parent_id = public.current_parent_id()
  and public.parent_can_access_student(student_id)
);

drop policy if exists "invoice_items_parent_portal_select_own_family" on public.invoice_items;
create policy "invoice_items_parent_portal_select_own_family"
on public.invoice_items
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('invoices.view.own_child')
  and public.parent_can_access_invoice(invoice_items.invoice_id)
);

drop policy if exists "payments_parent_portal_select_own_family" on public.payments;
create policy "payments_parent_portal_select_own_family"
on public.payments
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('payments.view.own_child')
  and parent_id = public.current_parent_id()
  and public.parent_can_access_student(student_id)
);

drop policy if exists "payment_allocations_parent_portal_select_own_family" on public.payment_allocations;
create policy "payment_allocations_parent_portal_select_own_family"
on public.payment_allocations
for select
to authenticated
using (
  public.is_parent()
  and (
    public.parent_can_access_payment(payment_allocations.payment_id)
    or public.parent_can_access_invoice(payment_allocations.invoice_id)
  )
);

drop policy if exists "event_types_parent_portal_select_active" on public.event_types;
create policy "event_types_parent_portal_select_active"
on public.event_types
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('events.view.own_child')
  and status = 'active'
  and deleted_at is null
);

drop policy if exists "events_parent_portal_select_booked" on public.events;
create policy "events_parent_portal_select_booked"
on public.events
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('events.view.own_child')
  and deleted_at is null
  and public.parent_can_access_event(events.id)
);

drop policy if exists "event_bookings_parent_portal_select_own_child" on public.event_bookings;
create policy "event_bookings_parent_portal_select_own_child"
on public.event_bookings
for select
to authenticated
using (
  public.is_parent()
  and public.has_permission('events.view.own_child')
  and deleted_at is null
  and parent_id = public.current_parent_id()
  and public.parent_can_access_student(student_id)
);
