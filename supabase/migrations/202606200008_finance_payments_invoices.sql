-- Little London Management System
-- Phase 9: Finance, invoices, payments, and allocation-safe writes.

create extension if not exists "pgcrypto";

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  invoice_number text not null,
  parent_id uuid not null references public.parents(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  issue_date date not null default current_date,
  due_date date not null,
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'draft',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_by uuid references auth.users(id),
  constraint invoices_status_check check (status in ('draft', 'issued', 'partially_paid', 'paid', 'cancelled')),
  constraint invoices_amounts_check check (subtotal >= 0 and total >= 0),
  constraint invoices_due_date_check check (due_date >= issue_date)
);

comment on column public.invoices.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null,
  unit_price numeric(12, 2) not null,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint invoice_items_quantity_check check (quantity > 0),
  constraint invoice_items_price_check check (unit_price >= 0 and line_total >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid,
  payment_number text not null,
  parent_id uuid not null references public.parents(id) on delete restrict,
  student_id uuid not null references public.students(id) on delete restrict,
  payment_date date not null default current_date,
  amount numeric(12, 2) not null,
  payment_method text not null,
  reference_number text,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  constraint payments_amount_check check (amount > 0),
  constraint payments_method_check check (payment_method in ('cash', 'card', 'bank_transfer', 'cheque', 'other'))
);

comment on column public.payments.branch_id is
  'Future branch scope. Branch foreign key will be added when the branches table is introduced.';

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount_allocated numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint payment_allocations_amount_check check (amount_allocated > 0),
  constraint payment_allocations_unique_payment_invoice unique (payment_id, invoice_id)
);

create unique index if not exists invoices_invoice_number_active_key
on public.invoices(invoice_number)
where deleted_at is null;

create unique index if not exists payments_payment_number_key
on public.payments(payment_number);

create index if not exists idx_invoices_branch_id on public.invoices(branch_id);
create index if not exists idx_invoices_parent_id on public.invoices(parent_id);
create index if not exists idx_invoices_student_id on public.invoices(student_id);
create index if not exists idx_invoices_status on public.invoices(status);
create index if not exists idx_invoices_due_date on public.invoices(due_date);
create index if not exists idx_invoices_deleted_at on public.invoices(deleted_at);

create index if not exists idx_invoice_items_invoice_id on public.invoice_items(invoice_id);

create index if not exists idx_payments_branch_id on public.payments(branch_id);
create index if not exists idx_payments_parent_id on public.payments(parent_id);
create index if not exists idx_payments_student_id on public.payments(student_id);
create index if not exists idx_payments_payment_date on public.payments(payment_date);

create index if not exists idx_payment_allocations_payment_id on public.payment_allocations(payment_id);
create index if not exists idx_payment_allocations_invoice_id on public.payment_allocations(invoice_id);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create or replace function public.invoice_amount_paid(target_invoice_id uuid)
returns numeric
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(pa.amount_allocated), 0)::numeric(12, 2)
  from public.payment_allocations pa
  join public.payments p on p.id = pa.payment_id
  where pa.invoice_id = target_invoice_id
$$;

create or replace function public.recalculate_invoice_payment_status(target_invoice_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  invoice_total numeric(12, 2);
  amount_paid numeric(12, 2);
  current_status text;
begin
  select total, status
  into invoice_total, current_status
  from public.invoices
  where id = target_invoice_id
  for update;

  if not found or current_status in ('draft', 'cancelled') then
    return;
  end if;

  amount_paid := public.invoice_amount_paid(target_invoice_id);

  update public.invoices
  set
    status = case
      when amount_paid >= invoice_total then 'paid'
      when amount_paid > 0 then 'partially_paid'
      else 'issued'
    end,
    updated_by = auth.uid()
  where id = target_invoice_id;
end;
$$;

create or replace function public.create_invoice_with_items(
  p_invoice_number text,
  p_parent_id uuid,
  p_student_id uuid,
  p_issue_date date,
  p_due_date date,
  p_status text,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_invoice_id uuid;
  item jsonb;
  item_description text;
  item_quantity numeric(10, 2);
  item_unit_price numeric(12, 2);
  item_line_total numeric(12, 2);
  invoice_total numeric(12, 2) := 0;
  student_branch_id uuid;
begin
  if p_status not in ('draft', 'issued', 'cancelled') then
    raise exception 'invalid_invoice_status';
  end if;

  if p_due_date < p_issue_date then
    raise exception 'due_date_before_issue_date';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invoice_requires_items';
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

  select branch_id into student_branch_id
  from public.students
  where id = p_student_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_description := nullif(btrim(item->>'description'), '');
    item_quantity := (item->>'quantity')::numeric;
    item_unit_price := (item->>'unitPrice')::numeric;

    if item_description is null or item_quantity <= 0 or item_unit_price < 0 then
      raise exception 'invalid_invoice_item';
    end if;

    invoice_total := invoice_total + round(item_quantity * item_unit_price, 2);
  end loop;

  insert into public.invoices (
    branch_id,
    invoice_number,
    parent_id,
    student_id,
    issue_date,
    due_date,
    subtotal,
    total,
    status,
    notes,
    created_by,
    updated_by
  )
  values (
    student_branch_id,
    p_invoice_number,
    p_parent_id,
    p_student_id,
    p_issue_date,
    p_due_date,
    invoice_total,
    invoice_total,
    p_status,
    p_notes,
    auth.uid(),
    auth.uid()
  )
  returning id into new_invoice_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_description := btrim(item->>'description');
    item_quantity := (item->>'quantity')::numeric;
    item_unit_price := (item->>'unitPrice')::numeric;
    item_line_total := round(item_quantity * item_unit_price, 2);

    insert into public.invoice_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      line_total
    )
    values (
      new_invoice_id,
      item_description,
      item_quantity,
      item_unit_price,
      item_line_total
    );
  end loop;

  return new_invoice_id;
end;
$$;

create or replace function public.update_draft_invoice_with_items(
  p_invoice_id uuid,
  p_invoice_number text,
  p_parent_id uuid,
  p_student_id uuid,
  p_issue_date date,
  p_due_date date,
  p_status text,
  p_notes text,
  p_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  item jsonb;
  item_description text;
  item_quantity numeric(10, 2);
  item_unit_price numeric(12, 2);
  item_line_total numeric(12, 2);
  invoice_total numeric(12, 2) := 0;
  current_status text;
  student_branch_id uuid;
begin
  select status into current_status
  from public.invoices
  where id = p_invoice_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'invoice_not_found';
  end if;

  if current_status <> 'draft' then
    raise exception 'only_draft_invoices_can_be_edited';
  end if;

  if p_status not in ('draft', 'issued', 'cancelled') then
    raise exception 'invalid_invoice_status';
  end if;

  if p_due_date < p_issue_date then
    raise exception 'due_date_before_issue_date';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invoice_requires_items';
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

  select branch_id into student_branch_id
  from public.students
  where id = p_student_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_description := nullif(btrim(item->>'description'), '');
    item_quantity := (item->>'quantity')::numeric;
    item_unit_price := (item->>'unitPrice')::numeric;

    if item_description is null or item_quantity <= 0 or item_unit_price < 0 then
      raise exception 'invalid_invoice_item';
    end if;

    invoice_total := invoice_total + round(item_quantity * item_unit_price, 2);
  end loop;

  update public.invoices
  set
    branch_id = student_branch_id,
    invoice_number = p_invoice_number,
    parent_id = p_parent_id,
    student_id = p_student_id,
    issue_date = p_issue_date,
    due_date = p_due_date,
    subtotal = invoice_total,
    total = invoice_total,
    status = p_status,
    notes = p_notes,
    updated_by = auth.uid()
  where id = p_invoice_id;

  delete from public.invoice_items
  where invoice_id = p_invoice_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    item_description := btrim(item->>'description');
    item_quantity := (item->>'quantity')::numeric;
    item_unit_price := (item->>'unitPrice')::numeric;
    item_line_total := round(item_quantity * item_unit_price, 2);

    insert into public.invoice_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      line_total
    )
    values (
      p_invoice_id,
      item_description,
      item_quantity,
      item_unit_price,
      item_line_total
    );
  end loop;
end;
$$;

create or replace function public.record_payment_with_allocations(
  p_payment_number text,
  p_parent_id uuid,
  p_student_id uuid,
  p_payment_date date,
  p_amount numeric,
  p_payment_method text,
  p_reference_number text,
  p_notes text,
  p_allocations jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_payment_id uuid;
  allocation jsonb;
  allocation_invoice_id uuid;
  allocation_amount numeric(12, 2);
  allocation_total numeric(12, 2) := 0;
  student_branch_id uuid;
  invoice_balance numeric(12, 2);
begin
  if p_amount <= 0 then
    raise exception 'invalid_payment_amount';
  end if;

  if p_payment_method not in ('cash', 'card', 'bank_transfer', 'cheque', 'other') then
    raise exception 'invalid_payment_method';
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

  if p_allocations is not null and jsonb_typeof(p_allocations) = 'array' then
    perform 1
    from public.invoices i
    join (
      select distinct (allocation_item.value->>'invoiceId')::uuid as invoice_id
      from jsonb_array_elements(p_allocations) as allocation_item(value)
    ) allocation_invoices on allocation_invoices.invoice_id = i.id
    where i.parent_id = p_parent_id
      and i.student_id = p_student_id
      and i.deleted_at is null
      and i.status in ('issued', 'partially_paid')
    order by i.id
    for update;

    for allocation in select * from jsonb_array_elements(p_allocations)
    loop
      allocation_invoice_id := (allocation->>'invoiceId')::uuid;
      allocation_amount := (allocation->>'amountAllocated')::numeric;

      if allocation_amount <= 0 then
        raise exception 'invalid_allocation_amount';
      end if;

      select i.total - public.invoice_amount_paid(i.id)
      into invoice_balance
      from public.invoices i
      where i.id = allocation_invoice_id
        and i.parent_id = p_parent_id
        and i.student_id = p_student_id
        and i.deleted_at is null
        and i.status in ('issued', 'partially_paid')
      for update;

      if not found then
        raise exception 'invoice_not_allocatable';
      end if;

      if allocation_amount > invoice_balance then
        raise exception 'allocation_exceeds_invoice_balance';
      end if;

      allocation_total := allocation_total + allocation_amount;
    end loop;
  end if;

  if allocation_total > p_amount then
    raise exception 'allocations_exceed_payment_amount';
  end if;

  select branch_id into student_branch_id
  from public.students
  where id = p_student_id;

  insert into public.payments (
    branch_id,
    payment_number,
    parent_id,
    student_id,
    payment_date,
    amount,
    payment_method,
    reference_number,
    notes,
    created_by
  )
  values (
    student_branch_id,
    p_payment_number,
    p_parent_id,
    p_student_id,
    p_payment_date,
    p_amount,
    p_payment_method,
    p_reference_number,
    p_notes,
    auth.uid()
  )
  returning id into new_payment_id;

  if p_allocations is not null and jsonb_typeof(p_allocations) = 'array' then
    for allocation in select * from jsonb_array_elements(p_allocations)
    loop
      allocation_invoice_id := (allocation->>'invoiceId')::uuid;
      allocation_amount := (allocation->>'amountAllocated')::numeric;

      insert into public.payment_allocations (
        payment_id,
        invoice_id,
        amount_allocated
      )
      values (
        new_payment_id,
        allocation_invoice_id,
        allocation_amount
      );

      perform public.recalculate_invoice_payment_status(allocation_invoice_id);
    end loop;
  end if;

  return new_payment_id;
end;
$$;

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;

drop policy if exists "invoices_management_all" on public.invoices;
create policy "invoices_management_all"
on public.invoices
for all
to authenticated
using (public.is_super_admin() or public.has_permission('invoices.manage.all'))
with check (public.is_super_admin() or public.has_permission('invoices.manage.all'));

drop policy if exists "invoice_items_management_all" on public.invoice_items;
create policy "invoice_items_management_all"
on public.invoice_items
for all
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('invoices.manage.all')
)
with check (
  public.is_super_admin()
  or public.has_permission('invoices.manage.all')
);

drop policy if exists "payments_management_all" on public.payments;
create policy "payments_management_all"
on public.payments
for all
to authenticated
using (public.is_super_admin() or public.has_permission('payments.manage.all'))
with check (public.is_super_admin() or public.has_permission('payments.manage.all'));

drop policy if exists "payment_allocations_management_all" on public.payment_allocations;
create policy "payment_allocations_management_all"
on public.payment_allocations
for all
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('payments.manage.all')
)
with check (
  public.is_super_admin()
  or public.has_permission('payments.manage.all')
);
