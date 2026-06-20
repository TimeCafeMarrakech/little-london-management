-- Little London Management System
-- Auth foundation only: roles, permissions, role_permissions, user_profiles.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  description text,
  is_system_role boolean not null default true,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint roles_name_check check (name in ('super_admin', 'admin', 'teacher', 'parent')),
  constraint roles_status_check check (status in ('active', 'inactive', 'archived'))
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  action text not null,
  scope text not null,
  key text not null unique,
  description text,
  is_system_permission boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint permissions_scope_check check (scope in ('own', 'own_child', 'assigned_students', 'assigned_classes', 'branch', 'all')),
  constraint permissions_unique_module_action_scope unique (module, action, scope)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  constraint role_permissions_unique_role_permission unique (role_id, permission_id)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  branch_id uuid,
  role_id uuid not null references public.roles(id),
  full_name text not null,
  email citext not null unique,
  phone text,
  avatar_document_id uuid,
  status text not null default 'pending',
  last_login_at timestamptz,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint user_profiles_status_check check (status in ('pending', 'active', 'suspended', 'disabled', 'archived'))
);

comment on column public.user_profiles.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create index if not exists idx_roles_status on public.roles(status);
create index if not exists idx_permissions_module_action_scope on public.permissions(module, action, scope);
create index if not exists idx_permissions_key on public.permissions(key);
create index if not exists idx_role_permissions_role_id on public.role_permissions(role_id);
create index if not exists idx_role_permissions_permission_id on public.role_permissions(permission_id);
create index if not exists idx_user_profiles_role_id on public.user_profiles(role_id);
create index if not exists idx_user_profiles_branch_id on public.user_profiles(branch_id);
create index if not exists idx_user_profiles_status on public.user_profiles(status);
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_deleted_at on public.user_profiles(deleted_at);

drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists permissions_set_updated_at on public.permissions;
create trigger permissions_set_updated_at
before update on public.permissions
for each row execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.user_profiles up
  join public.roles r on r.id = up.role_id
  where up.id = auth.uid()
    and up.status = 'active'
    and up.deleted_at is null
    and r.status = 'active'
  limit 1
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'super_admin'
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'admin'
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    join public.role_permissions rp on rp.role_id = up.role_id
    join public.permissions p on p.id = rp.permission_id
    where up.id = auth.uid()
      and up.status = 'active'
      and up.deleted_at is null
      and p.key = permission_key
  )
$$;

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_profiles enable row level security;

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles
for select
to authenticated
using (status = 'active' or public.is_super_admin());

drop policy if exists "roles_super_admin_all" on public.roles;
create policy "roles_super_admin_all"
on public.roles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "permissions_select_own_role" on public.permissions;
create policy "permissions_select_own_role"
on public.permissions
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.user_profiles up
    join public.role_permissions rp on rp.role_id = up.role_id
    where up.id = auth.uid()
      and up.status = 'active'
      and up.deleted_at is null
      and rp.permission_id = permissions.id
  )
);

drop policy if exists "permissions_super_admin_all" on public.permissions;
create policy "permissions_super_admin_all"
on public.permissions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "role_permissions_select_own_role" on public.role_permissions;
create policy "role_permissions_select_own_role"
on public.role_permissions
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.status = 'active'
      and up.deleted_at is null
      and up.role_id = role_permissions.role_id
  )
);

drop policy if exists "role_permissions_super_admin_all" on public.role_permissions;
create policy "role_permissions_super_admin_all"
on public.role_permissions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "user_profiles_select_own_or_management" on public.user_profiles;
create policy "user_profiles_select_own_or_management"
on public.user_profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_super_admin()
  or (
    public.is_admin()
    and not exists (
      select 1
      from public.roles r
      where r.id = user_profiles.role_id
        and r.name = 'super_admin'
    )
  )
);

drop policy if exists "user_profiles_update_own_profile" on public.user_profiles;
create policy "user_profiles_update_own_profile"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "user_profiles_super_admin_all" on public.user_profiles;
create policy "user_profiles_super_admin_all"
on public.user_profiles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());
