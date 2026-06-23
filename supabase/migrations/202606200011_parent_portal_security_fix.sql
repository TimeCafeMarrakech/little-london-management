-- Little London Management System
-- Phase 11 fix: parent-safe read surfaces for the read-only Parent Portal MVP.

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
    where auth.uid() is not null
      and p.user_id = auth.uid()
      and p.status = 'active'
      and p.deleted_at is null
      and psr.parent_id = p.id
      and psr.student_id = target_student_id
      and psr.status = 'active'
      and psr.deleted_at is null
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
      and se.status = 'active'
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

drop policy if exists "parents_own_portal_read" on public.parents;
drop policy if exists "parents_parent_portal_select_own" on public.parents;
drop policy if exists "parent_student_relationships_parent_portal_select_own" on public.parent_student_relationships;
drop policy if exists "students_parent_portal_select_own_child" on public.students;
drop policy if exists "student_enrolments_parent_portal_select_own_child" on public.student_enrolments;
drop policy if exists "classes_parent_portal_select_own_child" on public.classes;
drop policy if exists "courses_parent_portal_select_own_child" on public.courses;
drop policy if exists "class_teachers_parent_portal_select_own_child" on public.class_teachers;
drop policy if exists "teachers_parent_portal_select_child_teachers" on public.teachers;
drop policy if exists "attendance_sessions_parent_portal_select_own_child" on public.attendance_sessions;
drop policy if exists "attendance_records_parent_portal_select_own_child" on public.attendance_records;
drop policy if exists "invoices_parent_portal_select_own_family" on public.invoices;
drop policy if exists "invoice_items_parent_portal_select_own_family" on public.invoice_items;
drop policy if exists "payments_parent_portal_select_own_family" on public.payments;
drop policy if exists "payment_allocations_parent_portal_select_own_family" on public.payment_allocations;
drop policy if exists "event_types_parent_portal_select_active" on public.event_types;
drop policy if exists "events_parent_portal_select_booked" on public.events;
drop policy if exists "event_bookings_parent_portal_select_own_child" on public.event_bookings;

create or replace view public.parent_portal_parents
with (security_barrier = true)
as
select
  p.id,
  p.full_name
from public.parents p
where public.is_parent()
  and public.has_permission('parents.view.own')
  and p.user_id = auth.uid()
  and p.status = 'active'
  and p.deleted_at is null;

create or replace view public.parent_portal_relationships
with (security_barrier = true)
as
select
  psr.id,
  psr.parent_id,
  psr.student_id,
  psr.relationship_type,
  psr.is_primary_contact
from public.parent_student_relationships psr
where public.is_parent()
  and public.has_permission('students.view.own_child')
  and psr.parent_id = public.current_parent_id()
  and psr.status = 'active'
  and psr.deleted_at is null;

create or replace view public.parent_portal_students
with (security_barrier = true)
as
select
  s.id,
  s.student_number,
  s.full_name,
  s.date_of_birth,
  s.status,
  s.primary_language,
  s.school_name
from public.students s
where public.is_parent()
  and public.has_permission('students.view.own_child')
  and s.deleted_at is null
  and s.status <> 'archived'
  and public.parent_can_access_student(s.id);

create or replace view public.parent_portal_enrolments
with (security_barrier = true)
as
select
  se.id,
  se.student_id,
  se.class_id,
  se.enrolment_date,
  se.status
from public.student_enrolments se
where public.is_parent()
  and public.has_permission('enrolments.view.own_child')
  and se.status = 'active'
  and se.deleted_at is null
  and public.parent_can_access_student(se.student_id);

create or replace view public.parent_portal_classes
with (security_barrier = true)
as
select distinct
  c.id,
  c.class_code,
  c.course_id,
  c.name,
  c.start_date,
  c.end_date
from public.classes c
join public.student_enrolments se on se.class_id = c.id
where public.is_parent()
  and public.has_permission('classes.view.own_child')
  and c.deleted_at is null
  and c.status <> 'archived'
  and se.status = 'active'
  and se.deleted_at is null
  and public.parent_can_access_student(se.student_id);

create or replace view public.parent_portal_courses
with (security_barrier = true)
as
select distinct
  co.id,
  co.name
from public.courses co
join public.classes c on c.course_id = co.id
join public.student_enrolments se on se.class_id = c.id
where public.is_parent()
  and public.has_permission('classes.view.own_child')
  and co.deleted_at is null
  and co.status <> 'archived'
  and c.deleted_at is null
  and c.status <> 'archived'
  and se.status = 'active'
  and se.deleted_at is null
  and public.parent_can_access_student(se.student_id);

create or replace view public.parent_portal_class_teachers
with (security_barrier = true)
as
select distinct
  ct.class_id,
  ct.teacher_id
from public.class_teachers ct
where public.is_parent()
  and public.has_permission('classes.view.own_child')
  and ct.deleted_at is null
  and public.parent_can_access_class(ct.class_id);

create or replace view public.parent_portal_teachers
with (security_barrier = true)
as
select distinct
  t.id,
  t.full_name
from public.teachers t
join public.class_teachers ct on ct.teacher_id = t.id
where public.is_parent()
  and public.has_permission('classes.view.own_child')
  and t.deleted_at is null
  and t.status = 'active'
  and ct.deleted_at is null
  and public.parent_can_access_class(ct.class_id);

create or replace view public.parent_portal_attendance_sessions
with (security_barrier = true)
as
select distinct
  ats.id,
  ats.class_id,
  ats.session_date,
  ats.status
from public.attendance_sessions ats
join public.attendance_records ar on ar.attendance_session_id = ats.id
where public.is_parent()
  and public.has_permission('attendance.view.own_child')
  and ats.deleted_at is null
  and ats.status in ('submitted', 'reviewed', 'locked')
  and ar.deleted_at is null
  and public.parent_can_access_student(ar.student_id);

create or replace view public.parent_portal_attendance_records
with (security_barrier = true)
as
select
  ar.id,
  ar.attendance_session_id,
  ar.student_id,
  ar.status,
  ar.arrival_time,
  ar.created_at
from public.attendance_records ar
join public.attendance_sessions ats on ats.id = ar.attendance_session_id
where public.is_parent()
  and public.has_permission('attendance.view.own_child')
  and ar.deleted_at is null
  and ats.deleted_at is null
  and ats.status in ('submitted', 'reviewed', 'locked')
  and public.parent_can_access_student(ar.student_id);

create or replace view public.parent_portal_invoices
with (security_barrier = true)
as
select
  i.id,
  i.invoice_number,
  i.student_id,
  i.issue_date,
  i.due_date,
  i.total,
  i.status,
  i.created_at
from public.invoices i
where public.is_parent()
  and public.has_permission('invoices.view.own_child')
  and i.deleted_at is null
  and i.parent_id = public.current_parent_id()
  and public.parent_can_access_student(i.student_id);

create or replace view public.parent_portal_invoice_items
with (security_barrier = true)
as
select
  ii.id,
  ii.invoice_id,
  ii.description,
  ii.quantity,
  ii.unit_price,
  ii.line_total
from public.invoice_items ii
where public.is_parent()
  and public.has_permission('invoices.view.own_child')
  and public.parent_can_access_invoice(ii.invoice_id);

create or replace view public.parent_portal_payments
with (security_barrier = true)
as
select
  p.id,
  p.payment_number,
  p.student_id,
  p.payment_date,
  p.amount,
  p.payment_method,
  p.reference_number
from public.payments p
where public.is_parent()
  and public.has_permission('payments.view.own_child')
  and p.parent_id = public.current_parent_id()
  and public.parent_can_access_student(p.student_id);

create or replace view public.parent_portal_payment_allocations
with (security_barrier = true)
as
select
  pa.payment_id,
  pa.invoice_id,
  pa.amount_allocated
from public.payment_allocations pa
where public.is_parent()
  and (
    public.parent_can_access_payment(pa.payment_id)
    or public.parent_can_access_invoice(pa.invoice_id)
  );

create or replace view public.parent_portal_event_types
with (security_barrier = true)
as
select
  et.id,
  et.name,
  et.category
from public.event_types et
where public.is_parent()
  and public.has_permission('events.view.own_child')
  and et.status = 'active'
  and et.deleted_at is null;

create or replace view public.parent_portal_events
with (security_barrier = true)
as
select
  e.id,
  e.event_type_id,
  e.title,
  e.start_date,
  e.end_date,
  e.start_time,
  e.end_time,
  e.location,
  e.price
from public.events e
where public.is_parent()
  and public.has_permission('events.view.own_child')
  and e.deleted_at is null
  and public.parent_can_access_event(e.id);

create or replace view public.parent_portal_event_bookings
with (security_barrier = true)
as
select
  eb.id,
  eb.event_id,
  eb.student_id,
  eb.booking_status,
  eb.payment_status,
  eb.invoice_id,
  eb.created_at
from public.event_bookings eb
where public.is_parent()
  and public.has_permission('events.view.own_child')
  and eb.deleted_at is null
  and eb.parent_id = public.current_parent_id()
  and public.parent_can_access_student(eb.student_id);

grant select on
  public.parent_portal_parents,
  public.parent_portal_relationships,
  public.parent_portal_students,
  public.parent_portal_enrolments,
  public.parent_portal_classes,
  public.parent_portal_courses,
  public.parent_portal_class_teachers,
  public.parent_portal_teachers,
  public.parent_portal_attendance_sessions,
  public.parent_portal_attendance_records,
  public.parent_portal_invoices,
  public.parent_portal_invoice_items,
  public.parent_portal_payments,
  public.parent_portal_payment_allocations,
  public.parent_portal_event_types,
  public.parent_portal_events,
  public.parent_portal_event_bookings
to authenticated;
