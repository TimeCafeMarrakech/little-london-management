-- Little London Management System
-- Phase 14A.1: Cashbook database, permissions, RLS, and reporting foundation.

create extension if not exists "pgcrypto";

insert into public.permissions (module, action, scope, key, description, is_system_permission)
values
  ('cashbook', 'view', 'all', 'cashbook.view.all', 'Management can view cashbook income and expense records.', true),
  ('cashbook', 'create', 'all', 'cashbook.create.all', 'Management can create cashbook income records.', true),
  ('cashbook', 'edit', 'all', 'cashbook.edit.all', 'Management can edit cashbook records.', true),
  ('cashbook', 'void', 'all', 'cashbook.void.all', 'Management can void cashbook records.', true),
  ('cashbook', 'archive', 'all', 'cashbook.archive.all', 'Management can archive cashbook records.', true),
  ('cashbook', 'restore', 'all', 'cashbook.restore.all', 'Management can restore cashbook records.', true),
  ('cashbook', 'manage', 'all', 'cashbook.manage.all', 'Management can fully manage cashbook records.', true),
  ('expenses', 'view', 'all', 'expenses.view.all', 'Management can view expense records.', true),
  ('expenses', 'create', 'all', 'expenses.create.all', 'Management can create expense records.', true),
  ('expenses', 'edit', 'all', 'expenses.edit.all', 'Management can edit expense records.', true),
  ('expenses', 'void', 'all', 'expenses.void.all', 'Management can void expense records.', true),
  ('expenses', 'archive', 'all', 'expenses.archive.all', 'Management can archive expense records.', true),
  ('expenses', 'restore', 'all', 'expenses.restore.all', 'Management can restore expense records.', true),
  ('expenses', 'manage', 'all', 'expenses.manage.all', 'Management can fully manage expense records.', true),
  ('business_targets', 'view', 'all', 'business_targets.view.all', 'Management can view business performance targets.', true),
  ('business_targets', 'manage', 'all', 'business_targets.manage.all', 'Management can manage business performance targets.', true),
  ('business_performance', 'view', 'all', 'business_performance.view.all', 'Management can view business performance reporting.', true),
  ('cash_reconciliation', 'view', 'all', 'cash_reconciliation.view.all', 'Management can view daily cash reconciliations.', true),
  ('cash_reconciliation', 'manage', 'all', 'cash_reconciliation.manage.all', 'Management can manage daily cash reconciliations.', true)
on conflict (key) do update set
  module = excluded.module,
  action = excluded.action,
  scope = excluded.scope,
  description = excluded.description,
  is_system_permission = excluded.is_system_permission;

with role_permission_keys(role_name, permission_key) as (
  values
    ('admin', 'cashbook.view.all'),
    ('admin', 'cashbook.create.all'),
    ('admin', 'cashbook.edit.all'),
    ('admin', 'cashbook.void.all'),
    ('admin', 'cashbook.archive.all'),
    ('admin', 'cashbook.restore.all'),
    ('admin', 'cashbook.manage.all'),
    ('admin', 'expenses.view.all'),
    ('admin', 'expenses.create.all'),
    ('admin', 'expenses.edit.all'),
    ('admin', 'expenses.void.all'),
    ('admin', 'expenses.archive.all'),
    ('admin', 'expenses.restore.all'),
    ('admin', 'expenses.manage.all'),
    ('admin', 'business_targets.view.all'),
    ('admin', 'business_targets.manage.all'),
    ('admin', 'business_performance.view.all'),
    ('admin', 'cash_reconciliation.view.all'),
    ('admin', 'cash_reconciliation.manage.all'),
    ('super_admin', 'cashbook.view.all'),
    ('super_admin', 'cashbook.create.all'),
    ('super_admin', 'cashbook.edit.all'),
    ('super_admin', 'cashbook.void.all'),
    ('super_admin', 'cashbook.archive.all'),
    ('super_admin', 'cashbook.restore.all'),
    ('super_admin', 'cashbook.manage.all'),
    ('super_admin', 'expenses.view.all'),
    ('super_admin', 'expenses.create.all'),
    ('super_admin', 'expenses.edit.all'),
    ('super_admin', 'expenses.void.all'),
    ('super_admin', 'expenses.archive.all'),
    ('super_admin', 'expenses.restore.all'),
    ('super_admin', 'expenses.manage.all'),
    ('super_admin', 'business_targets.view.all'),
    ('super_admin', 'business_targets.manage.all'),
    ('super_admin', 'business_performance.view.all'),
    ('super_admin', 'cash_reconciliation.view.all'),
    ('super_admin', 'cash_reconciliation.manage.all')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from role_permission_keys rpk
join public.roles r on r.name = rpk.role_name
join public.permissions p on p.key = rpk.permission_key
on conflict (role_id, permission_id) do nothing;

create or replace function public.can_view_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.view.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_create_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.create.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_edit_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.edit.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_void_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.void.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_archive_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.archive.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_restore_cashbook_income()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.restore.all')
      or public.has_permission('cashbook.manage.all')
    )
$$;

create or replace function public.can_view_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.view.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_create_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.create.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_edit_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.edit.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_void_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.void.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_archive_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.archive.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_restore_cashbook_expenses()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('expenses.restore.all')
      or public.has_permission('expenses.manage.all')
    )
$$;

create or replace function public.can_view_business_targets()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('business_targets.view.all')
      or public.has_permission('business_targets.manage.all')
    )
$$;

create or replace function public.can_manage_business_targets()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and public.has_permission('business_targets.manage.all')
$$;

create or replace function public.can_view_cash_reconciliation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cash_reconciliation.view.all')
      or public.has_permission('cash_reconciliation.manage.all')
    )
$$;

create or replace function public.can_manage_cash_reconciliation()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and public.has_permission('cash_reconciliation.manage.all')
$$;

create or replace function public.can_view_cashbook_configuration()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('business_performance.view.all')
      or public.has_permission('cashbook.view.all')
      or public.has_permission('cashbook.manage.all')
      or public.has_permission('expenses.view.all')
      or public.has_permission('expenses.manage.all')
      or public.has_permission('business_targets.view.all')
      or public.has_permission('business_targets.manage.all')
    )
$$;

create or replace function public.can_manage_cashbook_configuration()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('cashbook.manage.all')
      or public.has_permission('expenses.manage.all')
      or public.has_permission('business_targets.manage.all')
    )
$$;

create or replace function public.can_view_cashbook_reports()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (public.is_super_admin() or public.is_admin())
    and (
      public.has_permission('business_performance.view.all')
      or public.has_permission('cashbook.view.all')
      or public.has_permission('cashbook.manage.all')
      or public.has_permission('expenses.view.all')
      or public.has_permission('expenses.manage.all')
      or public.has_permission('business_targets.view.all')
      or public.has_permission('business_targets.manage.all')
    )
$$;

create table if not exists public.business_areas (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  name text not null,
  code text not null,
  description text,
  status text not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint business_areas_status_check check (status in ('active', 'inactive', 'archived'))
);

comment on column public.business_areas.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.cashbook_income_categories (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  name text not null,
  code text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint cashbook_income_categories_status_check check (status in ('active', 'inactive', 'archived'))
);

comment on column public.cashbook_income_categories.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.cashbook_expense_categories (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  name text not null,
  code text not null,
  description text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint cashbook_expense_categories_status_check check (status in ('active', 'inactive', 'archived'))
);

comment on column public.cashbook_expense_categories.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.cashbook_income_entries (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  income_date date not null default current_date,
  amount numeric(12, 2) not null,
  income_category_id uuid not null references public.cashbook_income_categories(id) on delete restrict,
  business_area_id uuid not null references public.business_areas(id) on delete restrict,
  payment_method text not null,
  parent_id uuid references public.parents(id) on delete restrict,
  student_id uuid references public.students(id) on delete restrict,
  description text not null,
  notes text,
  status text not null default 'recorded',
  recorded_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint cashbook_income_entries_amount_check check (amount > 0),
  constraint cashbook_income_entries_method_check check (payment_method in ('cash', 'bank_transfer', 'cheque')),
  constraint cashbook_income_entries_status_check check (status in ('recorded', 'void', 'archived'))
);

comment on column public.cashbook_income_entries.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.cashbook_expense_entries (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  expense_date date not null default current_date,
  amount numeric(12, 2) not null,
  expense_category_id uuid not null references public.cashbook_expense_categories(id) on delete restrict,
  supplier_or_staff_name text,
  payment_method text not null,
  business_area_id uuid references public.business_areas(id) on delete restrict,
  description text not null,
  notes text,
  status text not null default 'recorded',
  recorded_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint cashbook_expense_entries_amount_check check (amount > 0),
  constraint cashbook_expense_entries_method_check check (payment_method in ('cash', 'bank_transfer', 'cheque')),
  constraint cashbook_expense_entries_status_check check (status in ('recorded', 'void', 'archived'))
);

comment on column public.cashbook_expense_entries.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.monthly_business_targets (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  target_month date not null,
  target_type text not null,
  target_value numeric(12, 2) not null,
  business_area_id uuid references public.business_areas(id) on delete restrict,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint monthly_business_targets_month_check check (target_month = date_trunc('month', target_month)::date),
  constraint monthly_business_targets_type_check check (target_type in ('revenue', 'profit', 'expense_budget', 'active_students')),
  constraint monthly_business_targets_value_check check (target_value >= 0),
  constraint monthly_business_targets_status_check check (status in ('active', 'archived'))
);

comment on column public.monthly_business_targets.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

create table if not exists public.cashbook_daily_reconciliations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  reconciliation_date date not null default current_date,
  opening_cash numeric(12, 2) not null default 0,
  cash_invoice_payments numeric(12, 2) not null default 0,
  cashbook_cash_income numeric(12, 2) not null default 0,
  cash_expenses numeric(12, 2) not null default 0,
  expected_cash numeric(12, 2) generated always as ((opening_cash + cash_invoice_payments + cashbook_cash_income - cash_expenses)::numeric(12, 2)) stored,
  actual_cash numeric(12, 2) not null default 0,
  difference numeric(12, 2) generated always as ((actual_cash - (opening_cash + cash_invoice_payments + cashbook_cash_income - cash_expenses))::numeric(12, 2)) stored,
  closing_cash numeric(12, 2) generated always as (actual_cash::numeric(12, 2)) stored,
  notes text,
  status text not null default 'open',
  recorded_by uuid not null references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint cashbook_daily_reconciliations_amounts_check check (
    opening_cash >= 0
    and cash_invoice_payments >= 0
    and cashbook_cash_income >= 0
    and cash_expenses >= 0
    and actual_cash >= 0
  ),
  constraint cashbook_daily_reconciliations_status_check check (status in ('open', 'closed', 'adjusted'))
);

comment on column public.cashbook_daily_reconciliations.branch_id is
  'Future branch scope. Branch foreign key will be added when multi-branch support is introduced.';

comment on column public.cashbook_daily_reconciliations.recorded_by is
  'Management-only reporting may expose this user profile id so reconciliation entries remain accountable.';

create unique index if not exists business_areas_code_active_key
on public.business_areas(coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(code))
where deleted_at is null;

create unique index if not exists cashbook_income_categories_code_active_key
on public.cashbook_income_categories(coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(code))
where deleted_at is null;

create unique index if not exists cashbook_expense_categories_code_active_key
on public.cashbook_expense_categories(coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(code))
where deleted_at is null;

create unique index if not exists monthly_business_targets_active_key
on public.monthly_business_targets(
  coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
  target_month,
  target_type,
  coalesce(business_area_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
where deleted_at is null and status = 'active';

create unique index if not exists cashbook_daily_reconciliations_active_date_key
on public.cashbook_daily_reconciliations(
  coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid),
  reconciliation_date
)
where deleted_at is null;

create index if not exists idx_business_areas_status on public.business_areas(status);
create index if not exists idx_cashbook_income_categories_status on public.cashbook_income_categories(status);
create index if not exists idx_cashbook_expense_categories_status on public.cashbook_expense_categories(status);
create index if not exists idx_cashbook_income_entries_date on public.cashbook_income_entries(income_date);
create index if not exists idx_cashbook_income_entries_business_area on public.cashbook_income_entries(business_area_id);
create index if not exists idx_cashbook_income_entries_category on public.cashbook_income_entries(income_category_id);
create index if not exists idx_cashbook_income_entries_payment_method on public.cashbook_income_entries(payment_method);
create index if not exists idx_cashbook_income_entries_parent_id on public.cashbook_income_entries(parent_id);
create index if not exists idx_cashbook_income_entries_student_id on public.cashbook_income_entries(student_id);
create index if not exists idx_cashbook_income_entries_status on public.cashbook_income_entries(status);
create index if not exists idx_cashbook_income_entries_deleted_at on public.cashbook_income_entries(deleted_at);
create index if not exists idx_cashbook_expense_entries_date on public.cashbook_expense_entries(expense_date);
create index if not exists idx_cashbook_expense_entries_category on public.cashbook_expense_entries(expense_category_id);
create index if not exists idx_cashbook_expense_entries_business_area on public.cashbook_expense_entries(business_area_id);
create index if not exists idx_cashbook_expense_entries_payment_method on public.cashbook_expense_entries(payment_method);
create index if not exists idx_cashbook_expense_entries_status on public.cashbook_expense_entries(status);
create index if not exists idx_cashbook_expense_entries_deleted_at on public.cashbook_expense_entries(deleted_at);
create index if not exists idx_monthly_business_targets_month on public.monthly_business_targets(target_month);
create index if not exists idx_monthly_business_targets_type on public.monthly_business_targets(target_type);
create index if not exists idx_cashbook_daily_reconciliations_date on public.cashbook_daily_reconciliations(reconciliation_date);
create index if not exists idx_cashbook_daily_reconciliations_status on public.cashbook_daily_reconciliations(status);

drop trigger if exists business_areas_set_updated_at on public.business_areas;
create trigger business_areas_set_updated_at
before update on public.business_areas
for each row execute function public.set_updated_at();

drop trigger if exists cashbook_income_categories_set_updated_at on public.cashbook_income_categories;
create trigger cashbook_income_categories_set_updated_at
before update on public.cashbook_income_categories
for each row execute function public.set_updated_at();

drop trigger if exists cashbook_expense_categories_set_updated_at on public.cashbook_expense_categories;
create trigger cashbook_expense_categories_set_updated_at
before update on public.cashbook_expense_categories
for each row execute function public.set_updated_at();

drop trigger if exists cashbook_income_entries_set_updated_at on public.cashbook_income_entries;
create trigger cashbook_income_entries_set_updated_at
before update on public.cashbook_income_entries
for each row execute function public.set_updated_at();

drop trigger if exists cashbook_expense_entries_set_updated_at on public.cashbook_expense_entries;
create trigger cashbook_expense_entries_set_updated_at
before update on public.cashbook_expense_entries
for each row execute function public.set_updated_at();

drop trigger if exists monthly_business_targets_set_updated_at on public.monthly_business_targets;
create trigger monthly_business_targets_set_updated_at
before update on public.monthly_business_targets
for each row execute function public.set_updated_at();

drop trigger if exists cashbook_daily_reconciliations_set_updated_at on public.cashbook_daily_reconciliations;
create trigger cashbook_daily_reconciliations_set_updated_at
before update on public.cashbook_daily_reconciliations
for each row execute function public.set_updated_at();

insert into public.business_areas (name, code, description, sort_order)
values
  ('English Classes', 'english_classes', 'Core English class revenue and performance.', 10),
  ('Play & Learn', 'play_learn', 'Hourly childcare, drop-in play, and early years activity.', 20),
  ('Workshops', 'workshops', 'One-off and recurring workshop activity.', 30),
  ('Holiday Camps', 'holiday_camps', 'School holiday camps and seasonal programmes.', 40),
  ('Birthday Parties', 'birthday_parties', 'Birthday party bookings and related activity.', 50),
  ('Theatre', 'theatre', 'Theatre, drama, and performance activity.', 60),
  ('Other', 'other', 'Other business activity not covered elsewhere.', 999)
on conflict ((coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)), (lower(code)))
where deleted_at is null
do nothing;

insert into public.cashbook_income_categories (name, code, description)
values
  ('Play & Learn hourly childcare', 'play_learn_hourly_childcare', 'Hourly childcare income not linked to a formal invoice.'),
  ('Drop-in session', 'drop_in_session', 'Drop-in play or class session income.'),
  ('Workshop', 'workshop', 'Workshop income not linked to a formal invoice.'),
  ('Holiday camp', 'holiday_camp', 'Holiday camp income not linked to a formal invoice.'),
  ('Birthday party', 'birthday_party', 'Birthday party income not linked to a formal invoice.'),
  ('Merchandise', 'merchandise', 'Merchandise sales income.'),
  ('Snacks', 'snacks', 'Snack and refreshment income.'),
  ('Other income', 'other_income', 'Other non-invoice income.')
on conflict ((coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)), (lower(code)))
where deleted_at is null
do nothing;

insert into public.cashbook_expense_categories (name, code, description)
values
  ('Salaries', 'salaries', 'Salary payments recorded as an expense category.'),
  ('Rent', 'rent', 'Rent and premises costs.'),
  ('Utilities', 'utilities', 'Water, electricity, and other utilities.'),
  ('Internet', 'internet', 'Internet and connectivity costs.'),
  ('Cleaning', 'cleaning', 'Cleaning services and supplies.'),
  ('Teaching materials', 'teaching_materials', 'Books, worksheets, and teaching materials.'),
  ('Arts and crafts', 'arts_and_crafts', 'Creative supplies and classroom craft materials.'),
  ('Marketing', 'marketing', 'Marketing and promotional activity.'),
  ('Repairs', 'repairs', 'Repairs and maintenance.'),
  ('Equipment', 'equipment', 'Equipment and furniture purchases.'),
  ('Other expenses', 'other_expenses', 'Other operational expenses.')
on conflict ((coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid)), (lower(code)))
where deleted_at is null
do nothing;

alter table public.business_areas enable row level security;
alter table public.cashbook_income_categories enable row level security;
alter table public.cashbook_expense_categories enable row level security;
alter table public.cashbook_income_entries enable row level security;
alter table public.cashbook_expense_entries enable row level security;
alter table public.monthly_business_targets enable row level security;
alter table public.cashbook_daily_reconciliations enable row level security;

drop policy if exists "business_areas_management_all" on public.business_areas;
drop policy if exists "business_areas_select_management" on public.business_areas;
drop policy if exists "business_areas_insert_management" on public.business_areas;
drop policy if exists "business_areas_update_management" on public.business_areas;
drop policy if exists "cashbook_income_categories_select_management" on public.cashbook_income_categories;
drop policy if exists "cashbook_income_categories_insert_management" on public.cashbook_income_categories;
drop policy if exists "cashbook_income_categories_update_management" on public.cashbook_income_categories;
drop policy if exists "cashbook_expense_categories_select_management" on public.cashbook_expense_categories;
drop policy if exists "cashbook_expense_categories_insert_management" on public.cashbook_expense_categories;
drop policy if exists "cashbook_expense_categories_update_management" on public.cashbook_expense_categories;
drop policy if exists "cashbook_income_entries_select_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_income_entries_insert_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_income_entries_update_edit_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_income_entries_update_void_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_income_entries_update_archive_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_income_entries_update_restore_management" on public.cashbook_income_entries;
drop policy if exists "cashbook_expense_entries_select_management" on public.cashbook_expense_entries;
drop policy if exists "cashbook_expense_entries_insert_management" on public.cashbook_expense_entries;
drop policy if exists "cashbook_expense_entries_update_edit_management" on public.cashbook_expense_entries;
drop policy if exists "cashbook_expense_entries_update_void_management" on public.cashbook_expense_entries;
drop policy if exists "cashbook_expense_entries_update_archive_management" on public.cashbook_expense_entries;
drop policy if exists "cashbook_expense_entries_update_restore_management" on public.cashbook_expense_entries;
drop policy if exists "monthly_business_targets_select_management" on public.monthly_business_targets;
drop policy if exists "monthly_business_targets_insert_management" on public.monthly_business_targets;
drop policy if exists "monthly_business_targets_update_management" on public.monthly_business_targets;
drop policy if exists "cashbook_daily_reconciliations_select_management" on public.cashbook_daily_reconciliations;
drop policy if exists "cashbook_daily_reconciliations_insert_management" on public.cashbook_daily_reconciliations;
drop policy if exists "cashbook_daily_reconciliations_update_management" on public.cashbook_daily_reconciliations;

create policy "business_areas_select_management"
on public.business_areas
for select
to authenticated
using (public.can_view_cashbook_configuration() or public.can_view_cashbook_reports());

create policy "business_areas_insert_management"
on public.business_areas
for insert
to authenticated
with check (public.can_manage_cashbook_configuration());

create policy "business_areas_update_management"
on public.business_areas
for update
to authenticated
using (public.can_manage_cashbook_configuration())
with check (public.can_manage_cashbook_configuration());

drop policy if exists "cashbook_income_categories_management_all" on public.cashbook_income_categories;
create policy "cashbook_income_categories_select_management"
on public.cashbook_income_categories
for select
to authenticated
using (public.can_view_cashbook_configuration() or public.can_view_cashbook_reports());

create policy "cashbook_income_categories_insert_management"
on public.cashbook_income_categories
for insert
to authenticated
with check (public.can_manage_cashbook_configuration());

create policy "cashbook_income_categories_update_management"
on public.cashbook_income_categories
for update
to authenticated
using (public.can_manage_cashbook_configuration())
with check (public.can_manage_cashbook_configuration());

drop policy if exists "cashbook_expense_categories_management_all" on public.cashbook_expense_categories;
drop function if exists public.can_manage_cashbook();

create policy "cashbook_expense_categories_select_management"
on public.cashbook_expense_categories
for select
to authenticated
using (public.can_view_cashbook_configuration() or public.can_view_cashbook_reports());

create policy "cashbook_expense_categories_insert_management"
on public.cashbook_expense_categories
for insert
to authenticated
with check (public.can_manage_cashbook_configuration());

create policy "cashbook_expense_categories_update_management"
on public.cashbook_expense_categories
for update
to authenticated
using (public.can_manage_cashbook_configuration())
with check (public.can_manage_cashbook_configuration());

drop policy if exists "cashbook_income_entries_management_all" on public.cashbook_income_entries;
create policy "cashbook_income_entries_select_management"
on public.cashbook_income_entries
for select
to authenticated
using (public.can_view_cashbook_income());

create policy "cashbook_income_entries_insert_management"
on public.cashbook_income_entries
for insert
to authenticated
with check (public.can_create_cashbook_income());

create policy "cashbook_income_entries_update_edit_management"
on public.cashbook_income_entries
for update
to authenticated
using (public.can_edit_cashbook_income() and status = 'recorded' and deleted_at is null)
with check (public.can_edit_cashbook_income() and status = 'recorded' and deleted_at is null);

create policy "cashbook_income_entries_update_void_management"
on public.cashbook_income_entries
for update
to authenticated
using (public.can_void_cashbook_income() and status = 'recorded' and deleted_at is null)
with check (public.can_void_cashbook_income() and status = 'void' and deleted_at is null);

create policy "cashbook_income_entries_update_archive_management"
on public.cashbook_income_entries
for update
to authenticated
using (public.can_archive_cashbook_income() and deleted_at is null)
with check (public.can_archive_cashbook_income() and status = 'archived' and deleted_at is not null);

create policy "cashbook_income_entries_update_restore_management"
on public.cashbook_income_entries
for update
to authenticated
using (public.can_restore_cashbook_income() and status in ('void', 'archived'))
with check (public.can_restore_cashbook_income() and status = 'recorded' and deleted_at is null);

drop policy if exists "cashbook_expense_entries_management_all" on public.cashbook_expense_entries;
create policy "cashbook_expense_entries_select_management"
on public.cashbook_expense_entries
for select
to authenticated
using (public.can_view_cashbook_expenses());

create policy "cashbook_expense_entries_insert_management"
on public.cashbook_expense_entries
for insert
to authenticated
with check (public.can_create_cashbook_expenses());

create policy "cashbook_expense_entries_update_edit_management"
on public.cashbook_expense_entries
for update
to authenticated
using (public.can_edit_cashbook_expenses() and status = 'recorded' and deleted_at is null)
with check (public.can_edit_cashbook_expenses() and status = 'recorded' and deleted_at is null);

create policy "cashbook_expense_entries_update_void_management"
on public.cashbook_expense_entries
for update
to authenticated
using (public.can_void_cashbook_expenses() and status = 'recorded' and deleted_at is null)
with check (public.can_void_cashbook_expenses() and status = 'void' and deleted_at is null);

create policy "cashbook_expense_entries_update_archive_management"
on public.cashbook_expense_entries
for update
to authenticated
using (public.can_archive_cashbook_expenses() and deleted_at is null)
with check (public.can_archive_cashbook_expenses() and status = 'archived' and deleted_at is not null);

create policy "cashbook_expense_entries_update_restore_management"
on public.cashbook_expense_entries
for update
to authenticated
using (public.can_restore_cashbook_expenses() and status in ('void', 'archived'))
with check (public.can_restore_cashbook_expenses() and status = 'recorded' and deleted_at is null);

drop policy if exists "monthly_business_targets_management_all" on public.monthly_business_targets;
create policy "monthly_business_targets_select_management"
on public.monthly_business_targets
for select
to authenticated
using (public.can_view_business_targets());

create policy "monthly_business_targets_insert_management"
on public.monthly_business_targets
for insert
to authenticated
with check (public.can_manage_business_targets());

create policy "monthly_business_targets_update_management"
on public.monthly_business_targets
for update
to authenticated
using (public.can_manage_business_targets())
with check (public.can_manage_business_targets());

drop policy if exists "cashbook_daily_reconciliations_management_all" on public.cashbook_daily_reconciliations;
create policy "cashbook_daily_reconciliations_select_management"
on public.cashbook_daily_reconciliations
for select
to authenticated
using (public.can_view_cash_reconciliation());

create policy "cashbook_daily_reconciliations_insert_management"
on public.cashbook_daily_reconciliations
for insert
to authenticated
with check (public.can_manage_cash_reconciliation());

create policy "cashbook_daily_reconciliations_update_management"
on public.cashbook_daily_reconciliations
for update
to authenticated
using (public.can_manage_cash_reconciliation())
with check (public.can_manage_cash_reconciliation());

create or replace view public.cashbook_daily_summary_view
with (security_invoker = true, security_barrier = true)
as
with dates as (
  select payment_date as summary_date, branch_id from public.payments
  union
  select income_date as summary_date, branch_id from public.cashbook_income_entries where deleted_at is null and status = 'recorded'
  union
  select expense_date as summary_date, branch_id from public.cashbook_expense_entries where deleted_at is null and status = 'recorded'
),
invoice_payments as (
  select payment_date as summary_date, branch_id, coalesce(sum(amount), 0)::numeric(12, 2) as total
  from public.payments
  group by payment_date, branch_id
),
cashbook_income as (
  select income_date as summary_date, branch_id, coalesce(sum(amount), 0)::numeric(12, 2) as total
  from public.cashbook_income_entries
  where deleted_at is null and status = 'recorded'
  group by income_date, branch_id
),
expenses as (
  select expense_date as summary_date, branch_id, coalesce(sum(amount), 0)::numeric(12, 2) as total
  from public.cashbook_expense_entries
  where deleted_at is null and status = 'recorded'
  group by expense_date, branch_id
)
select
  d.branch_id,
  d.summary_date,
  coalesce(ip.total, 0)::numeric(12, 2) as invoice_payment_total,
  coalesce(ci.total, 0)::numeric(12, 2) as cashbook_income_total,
  (coalesce(ip.total, 0) + coalesce(ci.total, 0))::numeric(12, 2) as total_income,
  coalesce(e.total, 0)::numeric(12, 2) as expense_total,
  (coalesce(ip.total, 0) + coalesce(ci.total, 0) - coalesce(e.total, 0))::numeric(12, 2) as net_profit
from dates d
left join invoice_payments ip on ip.summary_date = d.summary_date and coalesce(ip.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(d.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
left join cashbook_income ci on ci.summary_date = d.summary_date and coalesce(ci.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(d.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
left join expenses e on e.summary_date = d.summary_date and coalesce(e.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(d.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
where public.can_view_cashbook_reports();

create or replace view public.cashbook_monthly_summary_view
with (security_invoker = true, security_barrier = true)
as
select
  branch_id,
  date_trunc('month', summary_date)::date as summary_month,
  coalesce(sum(invoice_payment_total), 0)::numeric(12, 2) as invoice_payment_total,
  coalesce(sum(cashbook_income_total), 0)::numeric(12, 2) as cashbook_income_total,
  coalesce(sum(total_income), 0)::numeric(12, 2) as total_income,
  coalesce(sum(expense_total), 0)::numeric(12, 2) as expense_total,
  coalesce(sum(net_profit), 0)::numeric(12, 2) as net_profit
from public.cashbook_daily_summary_view
where public.can_view_cashbook_reports()
group by branch_id, date_trunc('month', summary_date)::date;

create or replace view public.cashbook_income_by_business_area_view
with (security_invoker = true, security_barrier = true)
as
select
  cie.branch_id,
  date_trunc('month', cie.income_date)::date as summary_month,
  ba.id as business_area_id,
  ba.name as business_area_name,
  coalesce(sum(cie.amount), 0)::numeric(12, 2) as cashbook_income_total
from public.cashbook_income_entries cie
join public.business_areas ba on ba.id = cie.business_area_id
where public.can_view_cashbook_reports()
  and cie.deleted_at is null
  and cie.status = 'recorded'
  and ba.deleted_at is null
group by cie.branch_id, date_trunc('month', cie.income_date)::date, ba.id, ba.name;

create or replace view public.cashbook_expenses_by_category_view
with (security_invoker = true, security_barrier = true)
as
select
  cee.branch_id,
  date_trunc('month', cee.expense_date)::date as summary_month,
  cec.id as expense_category_id,
  cec.name as expense_category_name,
  coalesce(sum(cee.amount), 0)::numeric(12, 2) as expense_total
from public.cashbook_expense_entries cee
join public.cashbook_expense_categories cec on cec.id = cee.expense_category_id
where public.can_view_cashbook_reports()
  and cee.deleted_at is null
  and cee.status = 'recorded'
  and cec.deleted_at is null
group by cee.branch_id, date_trunc('month', cee.expense_date)::date, cec.id, cec.name;

create or replace view public.cashbook_payment_method_summary_view
with (security_invoker = true, security_barrier = true)
as
with invoice_payment_methods as (
  select
    branch_id,
    date_trunc('month', payment_date)::date as summary_month,
    payment_method,
    coalesce(sum(amount), 0)::numeric(12, 2) as invoice_payment_total,
    0::numeric(12, 2) as cashbook_income_total
  from public.payments
  where payment_method in ('cash', 'bank_transfer', 'cheque')
  group by branch_id, date_trunc('month', payment_date)::date, payment_method
),
cashbook_payment_methods as (
  select
    branch_id,
    date_trunc('month', income_date)::date as summary_month,
    payment_method,
    0::numeric(12, 2) as invoice_payment_total,
    coalesce(sum(amount), 0)::numeric(12, 2) as cashbook_income_total
  from public.cashbook_income_entries
  where deleted_at is null and status = 'recorded'
  group by branch_id, date_trunc('month', income_date)::date, payment_method
)
select
  branch_id,
  summary_month,
  payment_method,
  coalesce(sum(invoice_payment_total), 0)::numeric(12, 2) as invoice_payment_total,
  coalesce(sum(cashbook_income_total), 0)::numeric(12, 2) as cashbook_income_total,
  coalesce(sum(invoice_payment_total + cashbook_income_total), 0)::numeric(12, 2) as total_income
from (
  select * from invoice_payment_methods
  union all
  select * from cashbook_payment_methods
) methods
where public.can_view_cashbook_reports()
group by branch_id, summary_month, payment_method;

create or replace view public.cashbook_business_area_profit_view
with (security_invoker = true, security_barrier = true)
as
with income_by_area as (
  select
    cie.branch_id,
    date_trunc('month', cie.income_date)::date as summary_month,
    cie.business_area_id,
    coalesce(sum(cie.amount), 0)::numeric(12, 2) as income_total
  from public.cashbook_income_entries cie
  where cie.deleted_at is null and cie.status = 'recorded'
  group by cie.branch_id, date_trunc('month', cie.income_date)::date, cie.business_area_id
),
expenses_by_area as (
  select
    cee.branch_id,
    date_trunc('month', cee.expense_date)::date as summary_month,
    cee.business_area_id,
    coalesce(sum(cee.amount), 0)::numeric(12, 2) as expense_total
  from public.cashbook_expense_entries cee
  where cee.deleted_at is null and cee.status = 'recorded' and cee.business_area_id is not null
  group by cee.branch_id, date_trunc('month', cee.expense_date)::date, cee.business_area_id
),
area_months as (
  select branch_id, summary_month, business_area_id from income_by_area
  union
  select branch_id, summary_month, business_area_id from expenses_by_area
)
select
  am.branch_id,
  am.summary_month,
  ba.id as business_area_id,
  ba.name as business_area_name,
  coalesce(i.income_total, 0)::numeric(12, 2) as income_total,
  coalesce(e.expense_total, 0)::numeric(12, 2) as expense_total,
  (coalesce(i.income_total, 0) - coalesce(e.expense_total, 0))::numeric(12, 2) as net_profit
from area_months am
join public.business_areas ba on ba.id = am.business_area_id
left join income_by_area i on i.summary_month = am.summary_month and i.business_area_id = am.business_area_id and coalesce(i.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(am.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
left join expenses_by_area e on e.summary_month = am.summary_month and e.business_area_id = am.business_area_id and coalesce(e.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(am.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
where public.can_view_cashbook_reports()
  and ba.deleted_at is null;

create or replace view public.cashbook_target_progress_view
with (security_invoker = true, security_barrier = true)
as
with target_periods as (
  select
    mbt.id as target_id,
    mbt.branch_id,
    mbt.target_month,
    (mbt.target_month + interval '1 month - 1 day')::date as month_end,
    extract(day from (mbt.target_month + interval '1 month - 1 day'))::integer as days_in_month,
    mbt.target_type,
    mbt.target_value,
    mbt.business_area_id,
    ba.name as business_area_name,
    case
      when mbt.target_month = date_trunc('month', current_date)::date then 'current'
      when mbt.target_month < date_trunc('month', current_date)::date then 'past'
      else 'future'
    end as period_state
  from public.monthly_business_targets mbt
  left join public.business_areas ba on ba.id = mbt.business_area_id and ba.deleted_at is null
  where public.can_view_cashbook_reports()
    and mbt.deleted_at is null
    and mbt.status = 'active'
),
whole_business_values as (
  select
    tp.target_id,
    case
      when tp.period_state = 'future' then 0
      when tp.target_type = 'revenue' then coalesce(cms.total_income, 0)
      when tp.target_type = 'profit' then coalesce(cms.net_profit, 0)
      when tp.target_type = 'expense_budget' then coalesce(cms.expense_total, 0)
      when tp.target_type = 'active_students' then (
        select count(*)::numeric(12, 2)
        from public.students s
        where s.deleted_at is null
          and s.status = 'active'
          and (tp.branch_id is null or s.branch_id = tp.branch_id)
      )
      else 0
    end::numeric(12, 2) as current_value
  from target_periods tp
  left join public.cashbook_monthly_summary_view cms on cms.summary_month = tp.target_month
    and coalesce(cms.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(tp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  where tp.business_area_id is null
),
business_area_values as (
  select
    tp.target_id,
    case
      when tp.period_state = 'future' then 0
      when tp.target_type = 'revenue' then coalesce(cbap.income_total, 0)
      when tp.target_type = 'profit' then coalesce(cbap.net_profit, 0)
      when tp.target_type = 'expense_budget' then coalesce(cbap.expense_total, 0)
      when tp.target_type = 'active_students' then (
        select count(*)::numeric(12, 2)
        from public.students s
        where s.deleted_at is null
          and s.status = 'active'
          and (tp.branch_id is null or s.branch_id = tp.branch_id)
      )
      else 0
    end::numeric(12, 2) as current_value
  from target_periods tp
  left join public.cashbook_business_area_profit_view cbap on cbap.summary_month = tp.target_month
    and cbap.business_area_id = tp.business_area_id
    and coalesce(cbap.branch_id, '00000000-0000-0000-0000-000000000000'::uuid) = coalesce(tp.branch_id, '00000000-0000-0000-0000-000000000000'::uuid)
  where tp.business_area_id is not null
),
target_values as (
  select
    tp.*,
    coalesce(wbv.current_value, bav.current_value, 0)::numeric(12, 2) as current_value,
    case
      when tp.period_state = 'past' then tp.days_in_month
      when tp.period_state = 'current' then greatest(least((current_date - tp.target_month + 1), tp.days_in_month), 0)::integer
      else 0
    end as elapsed_days,
    case
      when tp.period_state = 'past' then 0
      when tp.period_state = 'current' then greatest((tp.month_end - current_date), 0)::integer
      else tp.days_in_month
    end as days_remaining
  from target_periods tp
  left join whole_business_values wbv on wbv.target_id = tp.target_id
  left join business_area_values bav on bav.target_id = tp.target_id
),
calculated_targets as (
  select
    *,
    case
      when period_state = 'past' then current_value
      when period_state = 'future' then 0
      when elapsed_days > 0 then round((current_value / elapsed_days::numeric) * days_in_month::numeric, 2)
      else 0
    end::numeric(12, 2) as projected_month_end_value
  from target_values
)
select
  target_id,
  branch_id,
  target_month,
  target_type,
  target_value,
  current_value,
  case
    when target_type = 'expense_budget' then greatest(target_value - current_value, 0)
    else greatest(target_value - current_value, 0)
  end::numeric(12, 2) as remaining_value,
  case
    when target_value > 0 then round((current_value / target_value) * 100, 2)
    else 0
  end as percentage_achieved,
  days_remaining,
  projected_month_end_value,
  case
    when period_state = 'past' then 0
    when days_remaining > 0 then round(greatest(target_value - current_value, 0) / days_remaining::numeric, 2)
    else 0
  end::numeric(12, 2) as average_required_per_remaining_day,
  case
    when period_state = 'future' then 'On Track'
    when target_type = 'expense_budget' and period_state = 'past' and current_value <= target_value then 'Achieved'
    when target_type = 'expense_budget' and current_value > target_value then 'At Risk'
    when target_type = 'expense_budget' and target_value > 0 and ((current_value / target_value) * 100) >= 85 then 'Needs Attention'
    when target_type = 'expense_budget' then 'On Track'
    when current_value >= target_value then 'Achieved'
    when target_value > 0 and projected_month_end_value >= target_value then 'On Track'
    when target_value > 0 and projected_month_end_value >= (target_value * 0.65) then 'Needs Attention'
    else 'At Risk'
  end as target_status,
  business_area_id,
  business_area_name
from calculated_targets
where public.can_view_cashbook_reports();

create or replace view public.cashbook_daily_reconciliation_view
with (security_invoker = true, security_barrier = true)
as
select
  cdr.id as reconciliation_id,
  cdr.branch_id,
  cdr.reconciliation_date,
  cdr.opening_cash,
  cdr.cash_invoice_payments,
  cdr.cashbook_cash_income,
  cdr.cash_expenses,
  cdr.expected_cash,
  cdr.actual_cash,
  cdr.difference,
  cdr.closing_cash,
  cdr.status,
  cdr.recorded_by,
  up.full_name as recorded_by_name,
  cdr.created_at,
  cdr.updated_at
from public.cashbook_daily_reconciliations cdr
join public.user_profiles up on up.id = cdr.recorded_by
where public.can_view_cashbook_reports()
  and cdr.deleted_at is null;

revoke all on
  public.cashbook_daily_summary_view,
  public.cashbook_monthly_summary_view,
  public.cashbook_income_by_business_area_view,
  public.cashbook_expenses_by_category_view,
  public.cashbook_target_progress_view,
  public.cashbook_payment_method_summary_view,
  public.cashbook_business_area_profit_view,
  public.cashbook_daily_reconciliation_view
from anon, authenticated, public;

grant execute on function public.can_view_cashbook_income() to authenticated;
grant execute on function public.can_create_cashbook_income() to authenticated;
grant execute on function public.can_edit_cashbook_income() to authenticated;
grant execute on function public.can_void_cashbook_income() to authenticated;
grant execute on function public.can_archive_cashbook_income() to authenticated;
grant execute on function public.can_restore_cashbook_income() to authenticated;
grant execute on function public.can_view_cashbook_expenses() to authenticated;
grant execute on function public.can_create_cashbook_expenses() to authenticated;
grant execute on function public.can_edit_cashbook_expenses() to authenticated;
grant execute on function public.can_void_cashbook_expenses() to authenticated;
grant execute on function public.can_archive_cashbook_expenses() to authenticated;
grant execute on function public.can_restore_cashbook_expenses() to authenticated;
grant execute on function public.can_view_business_targets() to authenticated;
grant execute on function public.can_manage_business_targets() to authenticated;
grant execute on function public.can_view_cash_reconciliation() to authenticated;
grant execute on function public.can_manage_cash_reconciliation() to authenticated;
grant execute on function public.can_view_cashbook_configuration() to authenticated;
grant execute on function public.can_manage_cashbook_configuration() to authenticated;
grant execute on function public.can_view_cashbook_reports() to authenticated;

grant select on
  public.cashbook_daily_summary_view,
  public.cashbook_monthly_summary_view,
  public.cashbook_income_by_business_area_view,
  public.cashbook_expenses_by_category_view,
  public.cashbook_target_progress_view,
  public.cashbook_payment_method_summary_view,
  public.cashbook_business_area_profit_view,
  public.cashbook_daily_reconciliation_view
to authenticated;
