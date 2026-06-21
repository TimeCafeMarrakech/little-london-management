# Phase 9 Review

Date: 2026-06-21

Reviewed:

- `docs/ROADMAP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_REQUIREMENTS.md`
- `docs/PERMISSIONS.md`
- `docs/PHASE_9_COMPLETION_REPORT.md`

Status: Reviewed with blockers

---

## Command Results

PowerShell blocks the direct `npm` script shim on this machine, so the equivalent Windows npm shim was used.

- `npm.cmd run lint`
  - Passed
- `npm.cmd run type-check`
  - Passed
- `npm.cmd run build`
  - Passed

---

## Blockers

### 1. Invoice and payment writes do not validate parent-student relationship integrity

Files:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`
- `services/finance/finance-service.ts`

Issue:

- `create_invoice_with_items` accepts any `parent_id` and any `student_id`.
- `update_draft_invoice_with_items` also accepts any `parent_id` and `student_id`.
- `record_payment_with_allocations` validates that allocated invoices match the chosen parent/student, but the payment itself can still be recorded against an unrelated parent/student pair when no allocation is provided.

Why this matters:

- `API_REQUIREMENTS.md` requires the student to be linked to the parent for finance records.
- `PERMISSIONS.md` and `DATABASE_SCHEMA.md` rely on own-family financial ownership.
- Incorrect parent/student pairings would break future Parent Portal finance visibility and can attach financial records to the wrong family.

Required fix:

- Enforce an active `parent_student_relationships` link before invoice creation, invoice update, and payment recording.
- This should be enforced inside the database functions, not only in UI or service logic.

### 2. Payment allocation balance validation is not fully concurrency-safe

File:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`

Issue:

- `record_payment_with_allocations` checks invoice balance before inserting allocations.
- The invoice row is not locked during the initial balance validation.
- Two concurrent payment recordings could both see the same available balance and over-allocate before status recalculation.

Why this matters:

- Phase 9 explicitly requires transaction-safe financial writes.
- The current function is transactional for a single request but not robust against concurrent allocations to the same invoice.

Required fix:

- Lock each target invoice row during allocation validation, or centralize allocation validation and insert under a row-level lock.
- Recheck balance after acquiring the lock and before inserting allocations.

---

## Important Issues

### 1. Invoice archive can cancel paid or partially paid invoices without a finance workflow

Files:

- `services/finance/finance-service.ts`
- `app/(dashboard)/invoices/[invoiceId]/page.tsx`

Issue:

- The detail page shows the archive action for every invoice status.
- `archiveInvoice` sets `status = 'cancelled'` and `deleted_at` regardless of whether the invoice is paid or has allocations.

Risk:

- Paid or partially paid invoices can be hidden from normal active lists while payment allocations remain.
- This is closer to void/cancel behavior than archive behavior and needs clearer finance rules.

Recommendation:

- Restrict archive/cancel to draft invoices, or require a dedicated void/cancellation workflow for issued/paid invoices.
- Preserve paid invoice visibility unless a documented void/refund flow exists.

### 2. Payments do not support soft delete or cancellation despite schema rules

Files:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`
- `services/finance/finance-service.ts`

Issue:

- `DATABASE_SCHEMA.md` lists payments as soft-deletable business records.
- The `payments` table has no `updated_at`, `deleted_at`, `updated_by`, or `deleted_by`.
- There is no payment cancellation path.

Risk:

- Incorrect manual payments cannot be safely corrected without direct database intervention.
- Future refunds/receipts may need immutable payment history plus controlled cancellation metadata.

Recommendation:

- Add a documented payment status/cancel workflow before finance is considered production-ready.

### 3. Audit logging is absent for sensitive finance mutations

Files:

- `features/finance/actions.ts`
- `services/finance/finance-service.ts`
- `supabase/migrations/202606200008_finance_payments_invoices.sql`

Issue:

- Invoice create/update/archive and payment record actions do not insert audit log entries.
- The completion report notes this limitation because `audit_logs` is not implemented in applied migrations.

Risk:

- `API_REQUIREMENTS.md` and `PERMISSIONS.md` require audit logs for finance mutations.

Recommendation:

- Keep this as an accepted blocker only until `audit_logs` exists.
- Once `audit_logs` is available, finance mutations should be wired immediately.

---

## Medium Issues

### 1. Finance widgets are simple and may become expensive at scale

File:

- `services/finance/finance-service.ts`

Issue:

- `getFinanceMetrics` reads all payment amounts to compute total revenue and payments this month.
- It also does not use a materialized view or dedicated invoice balance view.

Risk:

- Fine for MVP data volume, but not ideal for long-term finance history.

Recommendation:

- Move dashboard metrics to an RLS-safe `invoice_balances_view` or aggregate query before production scale.

### 2. Parent and student billing summaries only inspect recent invoice rows

File:

- `services/finance/finance-service.ts`

Issue:

- Billing summary loads a maximum of 20 invoices before calculating outstanding balance.

Risk:

- Long-standing families with more than 20 invoices can show incomplete balances.

Recommendation:

- Compute full outstanding totals separately from the recent invoice list.

### 3. Payment allocation form is operationally awkward

Files:

- `app/(dashboard)/payments/new/page.tsx`
- `components/finance/payment-form.tsx`

Issue:

- The allocation dropdown lists all outstanding invoices, while parent and student are selected separately.
- The database function catches mismatched invoice/parent/student combinations, but the UI can invite avoidable validation failures.

Recommendation:

- Filter allocation options by selected parent/student once client-side interactivity or dependent server actions are introduced.

### 4. Parent Portal finance read RLS is intentionally absent

File:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`

Issue:

- The migration provides management-only RLS policies for invoices and payments.

Context:

- This is aligned with the Phase 9 instruction not to build Parent Portal finance views.
- It differs from the future-state documentation where parents can view own-family invoices and payment history.

Recommendation:

- Track as future Parent Portal work, not as a Phase 9 blocker.

---

## Minor Issues

### 1. Status vocabulary differs from `DATABASE_SCHEMA.md`

Issue:

- The migration uses `issued`.
- `DATABASE_SCHEMA.md` lists `sent`, `overdue`, `void`, and `refunded` as invoice statuses.

Context:

- The Phase 9 request explicitly listed `Issued`, so this is acceptable for this phase.

Recommendation:

- Resolve status vocabulary before receipts, refunds, and parent downloads are added.

### 2. Finance error handling masks some database validation failures

File:

- `features/finance/actions.ts`

Issue:

- Several known database exceptions fall back to the generic finance error.

Recommendation:

- Add friendly messages for invalid parent/student relationship, invalid invoice item, invalid payment method, and due-date errors when the blocker fixes are made.

---

## Checklist Review

1. Invoice creation
   - Present.
   - Uses Server Action, Zod validation, permission checks, and database function.
   - Blocked by missing parent-student relationship validation.

2. Invoice editing
   - Present for draft invoices.
   - Database function blocks non-draft edits.
   - Blocked by missing parent-student relationship validation.

3. Invoice archiving
   - Present.
   - Needs finance rules for paid/partially paid invoices before production use.

4. Invoice item totals
   - Present.
   - Totals are calculated server-side in the database function.

5. Payment recording
   - Present.
   - Uses Server Action, Zod validation, permission checks, and database function.
   - Blocked by missing parent-student relationship validation for unallocated payments.

6. Payment allocation
   - Present.
   - Validates invoice ownership and allocation amount.
   - Needs stronger concurrency safety.

7. Invoice balance recalculation
   - Present.
   - Recalculates status after allocation.
   - Needs row locking during allocation validation.

8. Student billing summary
   - Present for management roles.
   - Needs full-balance aggregation beyond the recent 20 invoices.

9. Parent billing summary
   - Present for management roles.
   - Needs full-balance aggregation beyond the recent 20 invoices.

10. Finance widgets
   - Present.
   - Good for MVP placeholder scale, but should move toward aggregate views later.

11. Supabase migration
   - Present.
   - Includes required Phase 9 tables, constraints, indexes, functions, and RLS.
   - Needs relationship integrity and concurrency hardening.

12. Database functions
   - Present.
   - Good direction for transaction-safe writes.
   - Need parent-student validation and row locks.

13. Permissions
   - Mostly aligned.
   - Super Admin/Admin allowed; Teacher/Parent management blocked.

14. RLS policies
   - Present for management-only access.
   - Acceptable for Phase 9 management scope.
   - Parent own-family read policies remain future work.

15. Whether Phase 10 can safely begin
   - No.
   - Phase 10 should wait until the two Phase 9 blockers are fixed because workshops/events may eventually interact with billing and parent/student ownership.

---

## What Is Correct

- Finance navigation is available to Super Admin/Admin and hidden from Teacher/Parent navigation.
- Invoices and payments use the existing app architecture: Server Actions, Zod schemas, services, and responsive cards/forms.
- Invoice totals are not trusted from the client.
- Payment allocations are not trusted from the client.
- Teacher users do not receive finance access.
- Parent Portal finance views were not built, matching the Phase 9 instruction.
- Build, lint, and type-check pass.

---

## Review Decision

Phase 9 is functionally present but not approved for Phase 10 yet.

Phase 10 should begin only after:

1. Parent-student relationship integrity is enforced in invoice and payment database functions.
2. Payment allocation validation is made concurrency-safe with invoice row locking.

After those fixes, Phase 10 can start safely with the current finance module treated as a stable MVP foundation.
