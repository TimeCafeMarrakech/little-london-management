-- Little London Management System
-- Phase 11 helper dependency fix for parent portal safe views.

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
