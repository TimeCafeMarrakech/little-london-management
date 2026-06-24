-- Little London Management System
-- Phase 12 blocker fix: management-only reporting view access.

create or replace function public.can_view_management_reports()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('reports.view.all')
      or public.has_permission('reports.export.all')
      or public.has_permission('reports.manage.all')
    )
$$;

revoke all on
  public.report_attendance_summary_view,
  public.report_attendance_by_student_view,
  public.report_attendance_by_class_view,
  public.report_invoice_balances_view,
  public.report_payment_summary_view,
  public.report_enrolment_summary_view,
  public.report_class_capacity_view,
  public.report_event_booking_summary_view,
  public.report_event_capacity_view,
  public.report_management_kpis_view
from anon, authenticated, public;

create or replace view public.report_attendance_summary_view
with (security_invoker = true, security_barrier = true)
as
select
  c.branch_id,
  ats.id as attendance_session_id,
  ats.class_id,
  c.name as class_name,
  co.id as course_id,
  co.name as course_name,
  ats.session_date,
  ats.status as session_status,
  ar.id as attendance_record_id,
  ar.student_id,
  ar.status as attendance_status
from public.attendance_sessions ats
join public.classes c on c.id = ats.class_id
join public.courses co on co.id = c.course_id
left join public.attendance_records ar on ar.attendance_session_id = ats.id and ar.deleted_at is null
where public.can_view_management_reports()
  and ats.deleted_at is null
  and c.deleted_at is null
  and co.deleted_at is null;

create or replace view public.report_attendance_by_student_view
with (security_invoker = true, security_barrier = true)
as
select
  s.branch_id,
  ar.student_id,
  s.student_number,
  s.full_name as student_name,
  ats.class_id,
  c.name as class_name,
  co.name as course_name,
  ats.session_date,
  ats.status as session_status,
  ar.status as attendance_status
from public.attendance_records ar
join public.students s on s.id = ar.student_id
join public.attendance_sessions ats on ats.id = ar.attendance_session_id
join public.classes c on c.id = ats.class_id
join public.courses co on co.id = c.course_id
where public.can_view_management_reports()
  and ar.deleted_at is null
  and ats.deleted_at is null
  and s.deleted_at is null
  and c.deleted_at is null
  and co.deleted_at is null;

create or replace view public.report_attendance_by_class_view
with (security_invoker = true, security_barrier = true)
as
select
  c.branch_id,
  ats.class_id,
  c.class_code,
  c.name as class_name,
  co.name as course_name,
  ats.session_date,
  ats.status as session_status,
  ar.status as attendance_status
from public.attendance_sessions ats
join public.classes c on c.id = ats.class_id
join public.courses co on co.id = c.course_id
left join public.attendance_records ar on ar.attendance_session_id = ats.id and ar.deleted_at is null
where public.can_view_management_reports()
  and ats.deleted_at is null
  and c.deleted_at is null
  and co.deleted_at is null;

create or replace view public.report_invoice_balances_view
with (security_invoker = true, security_barrier = true)
as
select
  i.id as invoice_id,
  i.branch_id,
  i.parent_id,
  p.full_name as parent_name,
  i.student_id,
  s.student_number,
  s.full_name as student_name,
  i.invoice_number,
  i.issue_date,
  i.due_date,
  i.total as total_amount,
  coalesce(sum(pa.amount_allocated), 0)::numeric(12, 2) as amount_paid,
  greatest(i.total - coalesce(sum(pa.amount_allocated), 0), 0)::numeric(12, 2) as balance_due,
  i.status
from public.invoices i
join public.parents p on p.id = i.parent_id
join public.students s on s.id = i.student_id
left join public.payment_allocations pa on pa.invoice_id = i.id
where public.can_view_management_reports()
  and i.deleted_at is null
group by i.id, i.branch_id, i.parent_id, p.full_name, i.student_id, s.student_number, s.full_name, i.invoice_number, i.issue_date, i.due_date, i.total, i.status;

create or replace view public.report_payment_summary_view
with (security_invoker = true, security_barrier = true)
as
select
  pay.id as payment_id,
  pay.branch_id,
  pay.parent_id,
  p.full_name as parent_name,
  pay.student_id,
  s.student_number,
  s.full_name as student_name,
  pay.payment_number,
  pay.payment_date,
  pay.amount,
  pay.payment_method
from public.payments pay
join public.parents p on p.id = pay.parent_id
join public.students s on s.id = pay.student_id
where public.can_view_management_reports();

create or replace view public.report_enrolment_summary_view
with (security_invoker = true, security_barrier = true)
as
select
  se.id as enrolment_id,
  c.branch_id,
  se.student_id,
  s.student_number,
  s.full_name as student_name,
  se.class_id,
  c.class_code,
  c.name as class_name,
  co.id as course_id,
  co.name as course_name,
  se.enrolment_date,
  se.status as enrolment_status,
  c.capacity
from public.student_enrolments se
join public.students s on s.id = se.student_id
join public.classes c on c.id = se.class_id
join public.courses co on co.id = c.course_id
where public.can_view_management_reports()
  and se.deleted_at is null
  and s.deleted_at is null
  and c.deleted_at is null
  and co.deleted_at is null;

create or replace view public.report_class_capacity_view
with (security_invoker = true, security_barrier = true)
as
select
  c.id as class_id,
  c.branch_id,
  c.class_code,
  c.name as class_name,
  co.name as course_name,
  c.capacity,
  count(se.id) filter (where se.status = 'active' and se.deleted_at is null)::integer as active_enrolments,
  case
    when c.capacity > 0 then round((count(se.id) filter (where se.status = 'active' and se.deleted_at is null)::numeric / c.capacity::numeric) * 100, 2)
    else 0
  end as fill_rate
from public.classes c
join public.courses co on co.id = c.course_id
left join public.student_enrolments se on se.class_id = c.id
where public.can_view_management_reports()
  and c.deleted_at is null
  and c.status <> 'archived'
  and co.deleted_at is null
group by c.id, c.branch_id, c.class_code, c.name, co.name, c.capacity;

create or replace view public.report_event_booking_summary_view
with (security_invoker = true, security_barrier = true)
as
select
  eb.id as booking_id,
  e.branch_id,
  eb.event_id,
  e.event_code,
  e.title as event_title,
  et.category,
  et.name as event_type_name,
  e.start_date,
  e.capacity,
  e.price,
  eb.student_id,
  s.student_number,
  s.full_name as student_name,
  eb.parent_id,
  p.full_name as parent_name,
  eb.booking_status,
  eb.payment_status,
  eb.invoice_id
from public.event_bookings eb
join public.events e on e.id = eb.event_id
join public.event_types et on et.id = e.event_type_id
join public.students s on s.id = eb.student_id
join public.parents p on p.id = eb.parent_id
where public.can_view_management_reports()
  and eb.deleted_at is null
  and e.deleted_at is null
  and et.deleted_at is null;

create or replace view public.report_event_capacity_view
with (security_invoker = true, security_barrier = true)
as
select
  e.id as event_id,
  e.branch_id,
  e.event_code,
  e.title as event_title,
  et.category,
  et.name as event_type_name,
  e.start_date,
  e.capacity,
  count(eb.id) filter (where eb.booking_status in ('pending', 'confirmed', 'attended') and eb.deleted_at is null)::integer as active_bookings,
  case
    when e.capacity > 0 then round((count(eb.id) filter (where eb.booking_status in ('pending', 'confirmed', 'attended') and eb.deleted_at is null)::numeric / e.capacity::numeric) * 100, 2)
    else 0
  end as fill_rate
from public.events e
join public.event_types et on et.id = e.event_type_id
left join public.event_bookings eb on eb.event_id = e.id
where public.can_view_management_reports()
  and e.deleted_at is null
  and e.status <> 'archived'
  and et.deleted_at is null
group by e.id, e.branch_id, e.event_code, e.title, et.category, et.name, e.start_date, e.capacity;

create or replace view public.report_management_kpis_view
with (security_invoker = true, security_barrier = true)
as
select
  null::uuid as branch_id,
  (select count(*) from public.students where deleted_at is null and status = 'active')::integer as active_student_count,
  (select count(*) from public.parents where deleted_at is null and status = 'active')::integer as active_parent_count,
  (select count(*) from public.teachers where deleted_at is null and status = 'active')::integer as active_teacher_count,
  (select count(*) from public.courses where deleted_at is null and status = 'active')::integer as active_course_count,
  (select count(*) from public.classes where deleted_at is null and status = 'active')::integer as active_class_count,
  (select count(*) from public.events where deleted_at is null and status = 'active')::integer as active_event_count,
  (select count(*) from public.attendance_sessions where deleted_at is null)::integer as attendance_session_count,
  (select coalesce(sum(amount), 0) from public.payments)::numeric(12, 2) as total_revenue,
  (select coalesce(sum(balance_due), 0) from public.report_invoice_balances_view where status in ('issued', 'partially_paid'))::numeric(12, 2) as outstanding_balance,
  (select count(*) from public.event_bookings where deleted_at is null and booking_status in ('pending', 'confirmed', 'attended'))::integer as active_event_booking_count
where public.can_view_management_reports();

grant execute on function public.can_view_management_reports() to authenticated;

grant select on
  public.report_attendance_summary_view,
  public.report_attendance_by_student_view,
  public.report_attendance_by_class_view,
  public.report_invoice_balances_view,
  public.report_payment_summary_view,
  public.report_enrolment_summary_view,
  public.report_class_capacity_view,
  public.report_event_booking_summary_view,
  public.report_event_capacity_view,
  public.report_management_kpis_view
to authenticated;
