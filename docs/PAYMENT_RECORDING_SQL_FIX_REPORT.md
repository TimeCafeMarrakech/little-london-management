# Payment Recording SQL Fix Report

## Summary

Fixed the PostgreSQL runtime error in `public.record_payment_with_allocations`:

```text
0A000: FOR UPDATE is not allowed with DISTINCT clause
```

The issue was caused by the previous payment RPC migration using a `SELECT DISTINCT` derived table in the invoice locking query. PostgreSQL does not allow this pattern with `FOR UPDATE`.

## Files Modified

- `supabase/migrations/202606200016_payment_recording_lock_fix.sql`
- `docs/PAYMENT_RECORDING_SQL_FIX_REPORT.md`

## Migration Created

Created a new migration:

```text
supabase/migrations/202606200016_payment_recording_lock_fix.sql
```

No existing migrations were edited.

## Function Recreated

The new migration recreates:

```sql
public.record_payment_with_allocations
```

## SQL Locking Fix

Removed the PostgreSQL-incompatible locking pattern:

```sql
SELECT DISTINCT ... FOR UPDATE
```

Replaced it with PostgreSQL-compatible logic:

1. Parse and validate each allocation JSON item.
2. Store validated invoice IDs in an in-memory UUID array.
3. Reject duplicate invoice IDs before locking.
4. Lock matching invoice rows directly:

```sql
select i.id
from public.invoices i
where i.id = any(allocation_invoice_ids)
  and i.parent_id = p_parent_id
  and i.student_id = p_student_id
  and i.deleted_at is null
  and i.status in ('issued', 'partially_paid')
order by i.id
for update
```

This preserves deterministic row locking without using `DISTINCT`.

## Behaviour Preserved

The recreated function preserves:

- row locking
- concurrency safety
- allocation validation
- parent/student relationship validation
- invoice ownership validation
- invoice status validation
- invoice balance validation after locking
- allocation total validation
- payment insert
- payment allocation insert
- invoice payment status recalculation
- transaction behaviour

## Scope Confirmation

No changes were made to:

- UI workflow
- authentication
- RBAC
- routes
- existing old migrations
- receipt PDFs
- invoice PDFs
- database tables
- expense management

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

## Notes

The first build attempt produced a full route summary but timed out before the process exited. The build was rerun with a longer timeout and passed.

After applying this migration in Supabase, the normal partial payment case should no longer fail with PostgreSQL error `0A000`.
