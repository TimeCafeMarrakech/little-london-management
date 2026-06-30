# Payment Recording Database Fix Report

## Summary

Payment recording diagnostics and the Supabase payment RPC fix have been implemented in two safe steps.

The goal was to address the partial payment failure where recording `2,000 DH` against a `5,000 DH` invoice showed the generic error:

```text
Something went wrong. Please review the finance details and try again.
```

## Files Modified

- `features/finance/actions.ts`
- `services/finance/finance-service.ts`
- `supabase/migrations/202606200015_payment_recording_rpc_fix.sql`
- `docs/PAYMENT_RECORDING_DATABASE_FIX_REPORT.md`

## Migration Created

Created:

```text
supabase/migrations/202606200015_payment_recording_rpc_fix.sql
```

This is a new follow-up migration.

No old migrations were edited.

## Error Logging And Mapping Added

### Server-side logging

Added safe server-side logging in `recordPayment()` for failed calls to:

```text
record_payment_with_allocations
```

The log includes structured Supabase error details:

- error code
- message
- details
- hint
- payment method
- allocation count
- whether a reference number was provided
- whether notes were provided

The log intentionally does not dump raw parent IDs, student IDs, invoice IDs, or full form payloads.

### Friendly error mapping

Improved user-facing handling for known payment errors:

- `invalid_parent_student_relationship`
- `invoice_not_allocatable`
- `allocation_exceeds_invoice_balance`
- `invalid_payment_amount`
- `invalid_allocation_amount`
- `malformed_allocation_payload`
- missing/stale function or signature mismatch errors such as `PGRST202`

Raw database errors are not exposed directly to users.

## Exact Function Recreated

The migration recreates:

```sql
public.record_payment_with_allocations
```

The recreated function:

- verifies payment amount is greater than zero
- verifies payment method is valid
- verifies allocation payload shape
- verifies allocation amounts are positive
- verifies parent/student relationship is active
- verifies allocated invoices belong to the selected parent/student
- verifies invoices are not archived
- verifies invoice status is `issued` or `partially_paid`
- locks invoice rows before allocation balance validation
- rechecks invoice balance after locking
- ensures allocation does not exceed remaining invoice balance
- ensures total allocations do not exceed payment amount
- inserts one payment row
- inserts one or more payment allocation rows
- recalculates invoice payment status
- raises known friendly error codes for expected validation failures

## Scope Confirmation

No UI workflow changes were made.

No changes were made to:

- authentication
- RBAC or permissions
- routes
- old migrations
- receipt PDFs
- invoice PDFs
- registration PDFs
- database tables
- expense management
- payment form layout or invoice-page payment workflow

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

## Notes

The initial parallel check run caused lint/build timeouts because the checks were running concurrently under load. Lint and build were rerun sequentially with longer timeouts and passed.

After this migration is applied to Supabase, the expected partial payment flow should be:

- payment record created
- payment allocation created
- invoice paid amount updated through allocation reads
- invoice balance reduced
- invoice status recalculated to `partially_paid` when partially paid

The UX recommendation from `docs/PAYMENT_RECORDING_BUG_REVIEW.md` remains future work: recording payment from an invoice page should default allocation to the selected invoice and payment amount.
