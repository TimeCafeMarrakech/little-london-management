-- Little London Management System
-- Phase 5: Parent management and Phase 4 relationship normalization.

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  user_id uuid references public.user_profiles(id),
  first_name text not null,
  last_name text not null,
  full_name text not null,
  email citext,
  phone text not null,
  alternate_phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  country text not null default 'Morocco',
  preferred_language text,
  communication_preferences jsonb not null default '{}'::jsonb,
  portal_status text not null default 'not_invited',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint parents_portal_status_check check (portal_status in ('not_invited', 'invited', 'active', 'disabled')),
  constraint parents_status_check check (status in ('active', 'inactive', 'archived'))
);

comment on column public.parents.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create unique index if not exists parents_user_id_active_key
on public.parents(user_id)
where user_id is not null and deleted_at is null;

create unique index if not exists parents_email_active_key
on public.parents(lower(email::text))
where email is not null and deleted_at is null;

create index if not exists idx_parents_branch_id on public.parents(branch_id);
create index if not exists idx_parents_status on public.parents(status);
create index if not exists idx_parents_portal_status on public.parents(portal_status);
create index if not exists idx_parents_deleted_at on public.parents(deleted_at);
create index if not exists idx_parents_phone on public.parents(phone);
create index if not exists idx_parents_full_name_trgm on public.parents using gin (full_name gin_trgm_ops);

drop trigger if exists parents_set_updated_at on public.parents;
create trigger parents_set_updated_at
before update on public.parents
for each row execute function public.set_updated_at();

with relationship_snapshots as (
  select distinct on (
    coalesce(
      nullif(lower(psr.parent_email::text), ''),
      nullif(regexp_replace(coalesce(psr.parent_phone, ''), '\s+', '', 'g'), ''),
      lower(psr.parent_full_name)
    )
  )
    psr.id,
    s.branch_id,
    psr.parent_full_name,
    psr.parent_email,
    psr.parent_phone,
    psr.created_at,
    psr.created_by,
    coalesce(
      nullif(lower(psr.parent_email::text), ''),
      nullif(regexp_replace(coalesce(psr.parent_phone, ''), '\s+', '', 'g'), ''),
      lower(psr.parent_full_name)
    ) as snapshot_key
  from public.parent_student_relationships psr
  join public.students s on s.id = psr.student_id
  where psr.parent_id is null
    and psr.deleted_at is null
    and psr.parent_full_name is not null
  order by
    coalesce(
      nullif(lower(psr.parent_email::text), ''),
      nullif(regexp_replace(coalesce(psr.parent_phone, ''), '\s+', '', 'g'), ''),
      lower(psr.parent_full_name)
    ),
    psr.is_primary_contact desc,
    psr.created_at asc
)
insert into public.parents (
  branch_id,
  first_name,
  last_name,
  full_name,
  email,
  phone,
  status,
  portal_status,
  created_at,
  updated_at,
  created_by,
  updated_by
)
select
  branch_id,
  split_part(parent_full_name, ' ', 1),
  coalesce(nullif(btrim(regexp_replace(parent_full_name, '^\S+\s*', '')), ''), 'Unknown'),
  parent_full_name,
  parent_email,
  coalesce(nullif(parent_phone, ''), 'Not recorded'),
  'active',
  'not_invited',
  created_at,
  now(),
  created_by,
  created_by
from relationship_snapshots rs
where not exists (
  select 1
  from public.parents p
  where p.deleted_at is null
    and (
      (rs.parent_email is not null and lower(p.email::text) = lower(rs.parent_email::text))
      or (rs.parent_email is null and rs.parent_phone is not null and p.phone = rs.parent_phone)
      or (rs.parent_email is null and rs.parent_phone is null and lower(p.full_name) = lower(rs.parent_full_name))
    )
);

update public.parent_student_relationships psr
set parent_id = p.id,
    updated_at = now()
from public.parents p
where psr.parent_id is null
  and psr.deleted_at is null
  and (
    (psr.parent_email is not null and lower(p.email::text) = lower(psr.parent_email::text))
    or (psr.parent_email is null and psr.parent_phone is not null and p.phone = psr.parent_phone)
    or (psr.parent_email is null and psr.parent_phone is null and lower(p.full_name) = lower(psr.parent_full_name))
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'parent_student_relationships_parent_id_fkey'
      and conrelid = 'public.parent_student_relationships'::regclass
  ) then
    alter table public.parent_student_relationships
      add constraint parent_student_relationships_parent_id_fkey
      foreign key (parent_id) references public.parents(id) on delete set null;
  end if;
end;
$$;

create index if not exists idx_parent_student_relationships_parent_student_active
on public.parent_student_relationships(parent_id, student_id)
where deleted_at is null;

with duplicate_active_relationships as (
  select
    id,
    row_number() over (
      partition by parent_id, student_id
      order by is_primary_contact desc, created_at asc, id asc
    ) as duplicate_rank
  from public.parent_student_relationships
  where parent_id is not null
    and deleted_at is null
)
update public.parent_student_relationships psr
set
  status = 'archived',
  deleted_at = now(),
  updated_at = now()
from duplicate_active_relationships duplicate
where psr.id = duplicate.id
  and duplicate.duplicate_rank > 1;

create unique index if not exists parent_student_relationships_parent_student_active_key
on public.parent_student_relationships(parent_id, student_id)
where parent_id is not null and deleted_at is null;

alter table public.parents enable row level security;

drop policy if exists "parents_management_all" on public.parents;
create policy "parents_management_all"
on public.parents
for all
to authenticated
using (public.is_super_admin() or public.has_permission('parents.manage.all'))
with check (public.is_super_admin() or public.has_permission('parents.manage.all'));

drop policy if exists "parents_teacher_read_placeholder" on public.parents;
create policy "parents_teacher_read_placeholder"
on public.parents
for select
to authenticated
using (public.is_teacher() and public.has_permission('parents.view.assigned_students_limited') and false);

drop policy if exists "parents_own_portal_read" on public.parents;
create policy "parents_own_portal_read"
on public.parents
for select
to authenticated
using (user_id = auth.uid() and deleted_at is null);

drop policy if exists "parents_own_portal_update" on public.parents;
