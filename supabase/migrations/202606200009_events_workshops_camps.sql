-- Little London Management System
-- Phase 10: Events, workshops, holiday camps, birthday events, bookings, and staff assignments.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

insert into public.permissions (module, action, scope, key, description, is_system_permission)
values
  ('events', 'manage', 'all', 'events.manage.all', 'Management can manage workshops, camps, birthday events, and special events.', true),
  ('events', 'view', 'assigned_classes', 'events.view.assigned_events', 'Teachers can view assigned events.', true)
on conflict (key) do update set
  module = excluded.module,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description,
  is_system_permission = excluded.is_system_permission;

with role_permission_keys(role_name, permission_key) as (
  values
    ('admin', 'events.manage.all'),
    ('super_admin', 'events.manage.all'),
    ('teacher', 'events.view.assigned_events')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_keys rpk
join public.roles r on r.name = rpk.role_name
join public.permissions p on p.key = rpk.permission_key
on conflict (role_id, permission_id) do nothing;

create table if not exists public.event_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint event_types_category_check check (category in ('workshop', 'holiday_camp', 'birthday_event', 'drama_event', 'seasonal_event', 'drop_play', 'other')),
  constraint event_types_status_check check (status in ('active', 'inactive', 'archived'))
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  event_type_id uuid not null references public.event_types(id) on delete restrict,
  event_code text not null,
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  start_time time,
  end_time time,
  capacity integer not null,
  price numeric(12, 2) not null default 0,
  status text not null default 'draft',
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint events_status_check check (status in ('draft', 'active', 'completed', 'cancelled', 'archived')),
  constraint events_capacity_check check (capacity > 0),
  constraint events_price_check check (price >= 0),
  constraint events_date_range_check check (end_date >= start_date),
  constraint events_time_range_check check (start_time is null or end_time is null or end_time > start_time)
);

comment on column public.events.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create table if not exists public.event_bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  parent_id uuid not null references public.parents(id) on delete restrict,
  booking_status text not null default 'confirmed',
  payment_status text not null default 'unpaid',
  invoice_id uuid references public.invoices(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint event_bookings_status_check check (booking_status in ('pending', 'confirmed', 'cancelled', 'attended', 'no_show')),
  constraint event_bookings_payment_status_check check (payment_status in ('unpaid', 'invoiced', 'partially_paid', 'paid', 'waived'))
);

create table if not exists public.event_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  teacher_id uuid references public.teachers(id) on delete set null,
  user_id uuid references public.user_profiles(id) on delete set null,
  role text not null default 'lead',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint event_staff_assignment_target_check check (teacher_id is not null or user_id is not null),
  constraint event_staff_assignment_role_check check (role in ('lead', 'assistant', 'support', 'host', 'coordinator'))
);

create unique index if not exists event_types_name_category_active_key
on public.event_types(lower(name), category)
where deleted_at is null;

create unique index if not exists events_event_code_active_key
on public.events(event_code)
where deleted_at is null;

create unique index if not exists event_bookings_student_event_active_key
on public.event_bookings(event_id, student_id)
where deleted_at is null and booking_status in ('pending', 'confirmed', 'attended');

create unique index if not exists event_staff_teacher_active_key
on public.event_staff_assignments(event_id, teacher_id)
where teacher_id is not null and deleted_at is null;

create unique index if not exists event_staff_user_active_key
on public.event_staff_assignments(event_id, user_id)
where user_id is not null and deleted_at is null;

insert into public.event_types (name, category, description, status)
values
  ('Workshop', 'workshop', 'Single or recurring activity workshop.', 'active'),
  ('Holiday Camp', 'holiday_camp', 'Seasonal camp programme outside the standard class structure.', 'active'),
  ('Birthday Event', 'birthday_event', 'Private birthday event booking.', 'active'),
  ('Drama Event', 'drama_event', 'Drama-focused special activity or showcase.', 'active'),
  ('Seasonal Event', 'seasonal_event', 'Seasonal school event or celebration.', 'active'),
  ('Drop and Play', 'drop_play', 'Drop-and-play activity booking.', 'active'),
  ('Other Event', 'other', 'Other activity-based event.', 'active')
on conflict do nothing;

create index if not exists idx_event_types_category on public.event_types(category);
create index if not exists idx_event_types_status on public.event_types(status);
create index if not exists idx_event_types_deleted_at on public.event_types(deleted_at);

create index if not exists idx_events_event_type_id on public.events(event_type_id);
create index if not exists idx_events_branch_id on public.events(branch_id);
create index if not exists idx_events_status on public.events(status);
create index if not exists idx_events_start_date on public.events(start_date);
create index if not exists idx_events_deleted_at on public.events(deleted_at);
create index if not exists idx_events_title_trgm on public.events using gin (title gin_trgm_ops);

create index if not exists idx_event_bookings_event_id on public.event_bookings(event_id);
create index if not exists idx_event_bookings_student_id on public.event_bookings(student_id);
create index if not exists idx_event_bookings_parent_id on public.event_bookings(parent_id);
create index if not exists idx_event_bookings_invoice_id on public.event_bookings(invoice_id);
create index if not exists idx_event_bookings_status on public.event_bookings(booking_status);
create index if not exists idx_event_bookings_deleted_at on public.event_bookings(deleted_at);

create index if not exists idx_event_staff_event_id on public.event_staff_assignments(event_id);
create index if not exists idx_event_staff_teacher_id on public.event_staff_assignments(teacher_id);
create index if not exists idx_event_staff_user_id on public.event_staff_assignments(user_id);
create index if not exists idx_event_staff_deleted_at on public.event_staff_assignments(deleted_at);

drop trigger if exists event_types_set_updated_at on public.event_types;
create trigger event_types_set_updated_at
before update on public.event_types
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists event_bookings_set_updated_at on public.event_bookings;
create trigger event_bookings_set_updated_at
before update on public.event_bookings
for each row execute function public.set_updated_at();

create or replace function public.teacher_can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.event_staff_assignments esa
    join public.teachers t on t.id = esa.teacher_id
    where esa.event_id = target_event_id
      and esa.deleted_at is null
      and t.user_id = auth.uid()
      and t.deleted_at is null
  )
$$;

create or replace function public.event_active_booking_count(target_event_id uuid)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.event_bookings eb
  where eb.event_id = target_event_id
    and eb.deleted_at is null
    and eb.booking_status in ('pending', 'confirmed', 'attended')
$$;

create or replace function public.book_event_student(
  p_event_id uuid,
  p_student_id uuid,
  p_parent_id uuid,
  p_booking_status text,
  p_payment_status text,
  p_invoice_id uuid,
  p_notes text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_booking_id uuid;
  event_capacity integer;
  event_status text;
  current_bookings integer;
begin
  select capacity, status
  into event_capacity, event_status
  from public.events
  where id = p_event_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'event_not_found';
  end if;

  if event_status not in ('draft', 'active') then
    raise exception 'event_not_bookable';
  end if;

  if p_booking_status not in ('pending', 'confirmed') then
    raise exception 'invalid_booking_status';
  end if;

  if p_payment_status not in ('unpaid', 'invoiced', 'partially_paid', 'paid', 'waived') then
    raise exception 'invalid_payment_status';
  end if;

  if p_invoice_id is not null and not exists (
    select 1
    from public.invoices i
    where i.id = p_invoice_id
      and i.parent_id = p_parent_id
      and i.student_id = p_student_id
      and i.deleted_at is null
  ) then
    raise exception 'invalid_event_invoice_link';
  end if;

  if not exists (
    select 1
    from public.parent_student_relationships psr
    join public.parents p on p.id = psr.parent_id and p.deleted_at is null
    join public.students s on s.id = psr.student_id and s.deleted_at is null
    where psr.parent_id = p_parent_id
      and psr.student_id = p_student_id
      and psr.status = 'active'
      and psr.deleted_at is null
  ) then
    raise exception 'invalid_parent_student_relationship';
  end if;

  if exists (
    select 1
    from public.event_bookings eb
    where eb.event_id = p_event_id
      and eb.student_id = p_student_id
      and eb.deleted_at is null
      and eb.booking_status in ('pending', 'confirmed', 'attended')
  ) then
    raise exception 'duplicate_event_booking';
  end if;

  current_bookings := public.event_active_booking_count(p_event_id);

  if current_bookings >= event_capacity then
    raise exception 'event_full';
  end if;

  insert into public.event_bookings (
    event_id,
    student_id,
    parent_id,
    booking_status,
    payment_status,
    invoice_id,
    notes,
    created_by,
    updated_by
  )
  values (
    p_event_id,
    p_student_id,
    p_parent_id,
    p_booking_status,
    p_payment_status,
    p_invoice_id,
    p_notes,
    auth.uid(),
    auth.uid()
  )
  returning id into new_booking_id;

  return new_booking_id;
end;
$$;

create or replace function public.cancel_event_booking(
  p_event_id uuid,
  p_booking_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.event_bookings
  set
    booking_status = 'cancelled',
    deleted_at = now(),
    deleted_by = auth.uid(),
    updated_by = auth.uid()
  where id = p_booking_id
    and event_id = p_event_id
    and deleted_at is null;

  if not found then
    raise exception 'booking_not_found';
  end if;
end;
$$;

alter table public.event_types enable row level security;
alter table public.events enable row level security;
alter table public.event_bookings enable row level security;
alter table public.event_staff_assignments enable row level security;

drop policy if exists "event_types_management_all" on public.event_types;
create policy "event_types_management_all"
on public.event_types
for all
to authenticated
using (public.is_super_admin() or public.has_permission('events.manage.all'))
with check (public.is_super_admin() or public.has_permission('events.manage.all'));

drop policy if exists "event_types_teacher_read_active" on public.event_types;
create policy "event_types_teacher_read_active"
on public.event_types
for select
to authenticated
using (
  public.current_user_role() = 'teacher'
  and public.has_permission('events.view.assigned_events')
  and status = 'active'
  and deleted_at is null
);

drop policy if exists "events_management_all" on public.events;
create policy "events_management_all"
on public.events
for all
to authenticated
using (public.is_super_admin() or public.has_permission('events.manage.all'))
with check (public.is_super_admin() or public.has_permission('events.manage.all'));

drop policy if exists "events_teacher_assigned_read" on public.events;
create policy "events_teacher_assigned_read"
on public.events
for select
to authenticated
using (
  public.current_user_role() = 'teacher'
  and public.has_permission('events.view.assigned_events')
  and deleted_at is null
  and public.teacher_can_access_event(events.id)
);

drop policy if exists "event_bookings_management_all" on public.event_bookings;
create policy "event_bookings_management_all"
on public.event_bookings
for all
to authenticated
using (public.is_super_admin() or public.has_permission('events.manage.all'))
with check (public.is_super_admin() or public.has_permission('events.manage.all'));

drop policy if exists "event_bookings_teacher_assigned_read" on public.event_bookings;
create policy "event_bookings_teacher_assigned_read"
on public.event_bookings
for select
to authenticated
using (
  public.current_user_role() = 'teacher'
  and public.has_permission('events.view.assigned_events')
  and deleted_at is null
  and public.teacher_can_access_event(event_bookings.event_id)
);

drop policy if exists "event_staff_management_all" on public.event_staff_assignments;
create policy "event_staff_management_all"
on public.event_staff_assignments
for all
to authenticated
using (public.is_super_admin() or public.has_permission('events.manage.all'))
with check (public.is_super_admin() or public.has_permission('events.manage.all'));

drop policy if exists "event_staff_teacher_assigned_read" on public.event_staff_assignments;
create policy "event_staff_teacher_assigned_read"
on public.event_staff_assignments
for select
to authenticated
using (
  public.current_user_role() = 'teacher'
  and public.has_permission('events.view.assigned_events')
  and deleted_at is null
  and public.teacher_can_access_event(event_staff_assignments.event_id)
);
