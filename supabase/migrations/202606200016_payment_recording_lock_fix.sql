-- Little London Management System
-- Payment recording SQL lock fix.
-- Fixes PostgreSQL error 0A000:
-- FOR UPDATE is not allowed with DISTINCT clause.

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
  allocation_count integer := 0;
  locked_invoice_count integer := 0;
  allocation_invoice_ids uuid[] := array[]::uuid[];
  student_branch_id uuid;
  invoice_balance numeric(12, 2);
  uuid_pattern constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  numeric_pattern constant text := '^[0-9]+(\.[0-9]+)?$';
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid_payment_amount';
  end if;

  if p_payment_method not in ('cash', 'card', 'bank_transfer', 'cheque', 'other') then
    raise exception 'invalid_payment_method';
  end if;

  if p_allocations is not null and jsonb_typeof(p_allocations) <> 'array' then
    raise exception 'malformed_allocation_payload';
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

  if p_allocations is not null and jsonb_array_length(p_allocations) > 0 then
    for allocation in select * from jsonb_array_elements(p_allocations)
    loop
      if jsonb_typeof(allocation) <> 'object'
        or allocation->>'invoiceId' is null
        or allocation->>'amountAllocated' is null
        or (allocation->>'invoiceId') !~ uuid_pattern
        or (allocation->>'amountAllocated') !~ numeric_pattern
      then
        raise exception 'malformed_allocation_payload';
      end if;

      allocation_invoice_id := (allocation->>'invoiceId')::uuid;
      allocation_amount := round((allocation->>'amountAllocated')::numeric, 2);

      if allocation_invoice_id = any(allocation_invoice_ids) then
        raise exception 'malformed_allocation_payload';
      end if;

      if allocation_amount <= 0 then
        raise exception 'invalid_allocation_amount';
      end if;

      allocation_invoice_ids := array_append(allocation_invoice_ids, allocation_invoice_id);
      allocation_count := allocation_count + 1;
      allocation_total := allocation_total + allocation_amount;
    end loop;

    locked_invoice_count := 0;

    for allocation_invoice_id in
      select i.id
      from public.invoices i
      where i.id = any(allocation_invoice_ids)
        and i.parent_id = p_parent_id
        and i.student_id = p_student_id
        and i.deleted_at is null
        and i.status in ('issued', 'partially_paid')
      order by i.id
      for update
    loop
      locked_invoice_count := locked_invoice_count + 1;
    end loop;

    if locked_invoice_count <> allocation_count then
      raise exception 'invoice_not_allocatable';
    end if;

    for allocation in select * from jsonb_array_elements(p_allocations)
    loop
      allocation_invoice_id := (allocation->>'invoiceId')::uuid;
      allocation_amount := round((allocation->>'amountAllocated')::numeric, 2);

      select i.total - public.invoice_amount_paid(i.id)
      into invoice_balance
      from public.invoices i
      where i.id = allocation_invoice_id
        and i.parent_id = p_parent_id
        and i.student_id = p_student_id
        and i.deleted_at is null
        and i.status in ('issued', 'partially_paid');

      if not found then
        raise exception 'invoice_not_allocatable';
      end if;

      if allocation_amount > invoice_balance then
        raise exception 'allocation_exceeds_invoice_balance';
      end if;
    end loop;
  end if;

  if allocation_total > p_amount then
    raise exception 'allocations_exceed_payment_amount';
  end if;

  select branch_id into student_branch_id
  from public.students
  where id = p_student_id
    and deleted_at is null;

  if not found then
    raise exception 'invalid_parent_student_relationship';
  end if;

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
    round(p_amount, 2),
    p_payment_method,
    nullif(trim(p_reference_number), ''),
    nullif(trim(p_notes), ''),
    auth.uid()
  )
  returning id into new_payment_id;

  if p_allocations is not null and jsonb_array_length(p_allocations) > 0 then
    for allocation in select * from jsonb_array_elements(p_allocations)
    loop
      allocation_invoice_id := (allocation->>'invoiceId')::uuid;
      allocation_amount := round((allocation->>'amountAllocated')::numeric, 2);

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
