# Payment Recording Bug Review

## Summary

The reported case should be valid:

- Invoice total: `5,000 DH`
- Payment amount: `2,000 DH`
- Allocation amount: `2,000 DH`
- Expected result: payment created, allocation created, invoice paid amount becomes `2,000 DH`, balance becomes `3,000 DH`, and invoice status becomes `partially_paid`.

Based on the current application code and the current Phase 9 migration source, this scenario should pass when:

- the selected parent and student are actively linked,
- the selected invoice belongs to that same parent and student,
- the invoice status is `issued` or `partially_paid`,
- the invoice is not archived,
- the allocation amount does not exceed the invoice balance,
- the latest `record_payment_with_allocations` database function is actually installed in Supabase.

The generic message:

```text
Something went wrong. Please review the finance details and try again.
```

means the failure is not currently being mapped to one of the known friendly finance errors. The most likely cause is a Supabase/database function mismatch or an unmapped database exception during the `record_payment_with_allocations` RPC.

## Files Reviewed

- `components/finance/payment-form.tsx`
- `features/finance/actions.ts`
- `features/finance/schemas.ts`
- `services/finance/finance-service.ts`
- `app/(dashboard)/payments/new/page.tsx`
- `app/(dashboard)/invoices/[invoiceId]/page.tsx`
- `supabase/migrations/202606200008_finance_payments_invoices.sql`
- `docs/PHASE_9_REVIEW.md`
- `docs/PHASE_9_FIX_REPORT.md`

## Payment Flow Reviewed

### Form

`components/finance/payment-form.tsx` submits:

- `paymentNumber`
- `paymentMethod`
- `parentId`
- `studentId`
- `paymentDate`
- `amount`
- `referenceNumber`
- `notes`
- repeated `allocationInvoiceId`
- repeated `allocationAmount`

### Server Action

`features/finance/actions.ts` converts allocation rows into:

```ts
{
  invoiceId,
  amountAllocated
}
```

It then validates the payload with `paymentFormSchema`.

For the reported case, Zod validation should pass:

- `amount = 2000` is positive.
- `amountAllocated = 2000` is positive.
- total allocated amount is not greater than payment amount.
- invoice ID should be a UUID.

### Finance Service

`services/finance/finance-service.ts` calls:

```ts
supabase.rpc("record_payment_with_allocations", {
  p_payment_number: input.paymentNumber,
  p_parent_id: input.parentId,
  p_student_id: input.studentId,
  p_payment_date: input.paymentDate,
  p_amount: input.amount,
  p_payment_method: input.paymentMethod,
  p_reference_number: input.referenceNumber,
  p_notes: input.notes,
  p_allocations: input.allocations,
})
```

### Database Function

`record_payment_with_allocations` in `supabase/migrations/202606200008_finance_payments_invoices.sql` validates:

- payment amount is greater than zero,
- payment method is valid,
- parent and student are actively linked,
- allocated invoice belongs to the selected parent and student,
- invoice is not archived,
- invoice status is `issued` or `partially_paid`,
- allocation does not exceed remaining invoice balance,
- total allocations do not exceed payment amount.

It then inserts:

- one `payments` row,
- one or more `payment_allocations` rows,
- recalculates invoice payment status.

## Likely Root Cause

### Most likely: Supabase database function drift

The strongest likely cause is that the live Supabase database does not have the latest version of:

```sql
public.record_payment_with_allocations
```

The Phase 9 fix report says the function was updated in:

```text
supabase/migrations/202606200008_finance_payments_invoices.sql
```

If that migration had already been applied to Supabase before the Phase 9 fixes were edited into the file, Supabase will not automatically re-run the edited migration. That would leave the deployed database with an older function while the code assumes the newer function behavior.

This can produce generic RPC failures that the current UI maps to:

```text
Something went wrong. Please review the finance details and try again.
```

Expected fix:

- Create a new follow-up migration that explicitly recreates `public.record_payment_with_allocations`.
- Do not rely on editing an already-applied migration.
- Include the latest parent/student validation, allocation locking, invoice balance recheck, payment insert, allocation insert, and invoice status recalculation.

### Also possible: invoice/parent/student mismatch

The form currently lets staff choose parent, student, and invoice independently. If the selected invoice does not belong to the selected parent and selected student, the database function rejects the allocation.

This should normally map to:

```text
Payments can only be allocated to issued or partially paid invoices for the selected parent and student.
```

If the live database raises a different error, or if the function is outdated, it may appear as the generic error instead.

### Also possible: invoice status is not allocatable

The database function only allows allocation to invoices with status:

- `issued`
- `partially_paid`

If the invoice is still `draft`, `paid`, `cancelled`, or archived, allocation is rejected.

The expected friendly error is already present in the action, but an outdated database function or different database error may still show the generic message.

### Also possible: RLS or permission mismatch inside the RPC

The function is declared as:

```sql
security invoker
```

That means Row Level Security applies using the currently authenticated user.

The function reads:

- `parent_student_relationships`
- `parents`
- `students`
- `invoices`
- `payment_allocations`

and writes:

- `payments`
- `payment_allocations`
- `invoices` through status recalculation

If the user has finance permissions but lacks related table visibility required by the RPC checks, the function may fail or reject the relationship. In the current MVP, Super Admin/Admin usually have broad permissions, but this should still be verified against the live role/permission seed data.

## Exact Failing Validation Or Insert

The exact failing line cannot be confirmed without the Supabase RPC error message or database logs.

The most likely failure points are:

1. `record_payment_with_allocations` function not matching the current migration source in Supabase.
2. Parent/student active relationship check:

```sql
raise exception 'invalid_parent_student_relationship';
```

3. Invoice allocation check:

```sql
raise exception 'invoice_not_allocatable';
```

4. Allocation balance check:

```sql
raise exception 'allocation_exceeds_invoice_balance';
```

5. Insert into `payment_allocations` if the live function receives malformed allocation JSON or hits a stale unique/constraint issue.

The current code maps several known errors, but it does not expose raw error details in the UI. For debugging, the next fix should temporarily log the Supabase RPC error server-side or add more specific error mapping for unmapped finance function errors.

## UX Review

The current allocation section is confusing for Little London staff.

Issues:

- Payment recording is only available from `/payments/new`.
- Invoice detail page does not provide a direct `Record payment for this invoice` action.
- Staff must manually select the parent, student, invoice, payment amount, and allocation amount.
- Invoice options are not filtered in the client after choosing a parent/student.
- The allocation area shows four blank allocation rows, which makes a simple partial payment feel more complex than it is.

## UX Recommendation For MVP

When recording a payment from an invoice page, the system should default allocation to the selected invoice.

Recommended MVP flow:

1. Add a `Record payment` action on the invoice detail page.
2. Open `/payments/new` with invoice context, for example:

```text
/payments/new?invoiceId={invoiceId}
```

3. Pre-fill:

- parent,
- student,
- invoice allocation row,
- payment amount defaulting to current invoice balance or allowing staff to enter a partial amount.

4. If payment amount is entered as `2,000 DH`, default allocation amount to `2,000 DH`.
5. Hide the multi-allocation UI unless staff choose an advanced option.

This would match the Little London workflow and reduce staff errors.

## Expected Fix

### Backend/Data Fix

Create a follow-up Supabase migration to recreate and lock in the latest `record_payment_with_allocations` function.

The function should:

- verify active parent/student relationship,
- verify invoice belongs to selected parent/student,
- verify invoice is `issued` or `partially_paid`,
- lock invoice rows before allocation validation,
- recheck invoice balance after locking,
- insert the payment,
- insert payment allocations,
- recalculate invoice status,
- raise known friendly error codes only.

Also consider adding error mapping for:

- `invalid_payment_amount`
- `invalid_allocation_amount`
- malformed allocation payload errors
- function missing/signature mismatch errors

### UX Fix

Add invoice-aware payment recording:

- From invoice detail, start payment recording with selected invoice context.
- Default allocation to the selected invoice.
- Default allocation amount to the entered payment amount.
- Keep multi-invoice allocation as an advanced flow, not the primary staff workflow.

## Could Database, Supabase, Or RLS Be Involved?

Yes.

This bug is very likely to involve Supabase because the actual write happens inside:

```text
public.record_payment_with_allocations
```

Potential Supabase/database factors:

- live database function is stale because an already-applied migration was edited,
- RLS hides related parent/student/invoice rows from the invoking user,
- role/permission seed data does not match expected finance/admin permissions,
- invoice status in the database is not `issued` or `partially_paid`,
- selected invoice does not match selected parent/student.

## Are Code Changes Required?

Yes, likely.

Recommended changes after this review:

1. Add a new Supabase migration to recreate `record_payment_with_allocations`.
2. Improve server-side logging or friendly error mapping for payment RPC failures.
3. Add invoice-aware payment recording UX with default allocation from invoice detail.
4. Consider simplifying the payment form for MVP so ordinary single-invoice partial payments are the default path.

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

## Review Decision

Requires fixes.

The current source code appears logically capable of recording the reported partial payment, but the generic runtime error strongly suggests a live Supabase function/RLS/data mismatch or an unmapped RPC exception. The payment UX also needs simplification so staff can record normal invoice payments without manually assembling allocation details.
