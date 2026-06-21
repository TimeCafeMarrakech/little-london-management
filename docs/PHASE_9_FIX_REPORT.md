# Phase 9 Fix Report

Date: 2026-06-21

Scope: Phase 9 blockers only

Status: Completed

---

## What Was Fixed

### 1. Parent-Student Relationship Integrity

Updated:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`

The following database functions now verify that `parent_id` and `student_id` are actively linked through `parent_student_relationships` before creating or changing finance records:

- `create_invoice_with_items`
- `update_draft_invoice_with_items`
- `record_payment_with_allocations`

The validation requires:

- matching `parent_id`
- matching `student_id`
- `parent_student_relationships.status = 'active'`
- `parent_student_relationships.deleted_at is null`
- parent record is not deleted
- student record is not deleted

If the relationship is invalid, the function raises:

```text
invalid_parent_student_relationship
```

This enforces family billing ownership inside the database functions, not only in UI or service logic.

---

### 2. Concurrency-Safe Payment Allocation

Updated:

- `supabase/migrations/202606200008_finance_payments_invoices.sql`

`record_payment_with_allocations` now locks target invoice rows during allocation validation.

Implementation details:

- Distinct target invoice IDs are selected from the allocation payload.
- Matching invoice rows are locked using `for update` in stable invoice ID order.
- Invoice balance is rechecked after locking and before inserting payment allocations.
- The lock remains held until the payment and allocation transaction completes.

This prevents two simultaneous payment recordings from both using the same stale invoice balance and over-allocating the same invoice.

---

### 3. Friendly Finance Error Messages

Updated:

- `features/finance/actions.ts`

Added friendly messages for:

- invalid parent/student relationship
- invalid invoice item
- invalid payment method
- due-date errors

New user-facing behavior:

- Invalid parent/student finance pairing now explains that the student must be actively linked to the parent.
- Invalid invoice items now explain the required description, quantity, and unit price.
- Invalid payment method now prompts for a valid payment method.
- Due-date errors now clearly state that due date must be on or after issue date.

---

## Files Modified

- `supabase/migrations/202606200008_finance_payments_invoices.sql`
- `features/finance/actions.ts`

---

## Commands Run

PowerShell blocks the direct `npm` script shim on this machine, so the equivalent Windows npm shim was used.

- `npm.cmd run lint`
  - Passed

- `npm.cmd run type-check`
  - Passed

- `npm.cmd run build`
  - Passed

---

## Scope Boundaries Confirmed

Not built:

- Phase 10
- Workshops
- Events
- Reports
- Parent Portal
- Receipts
- Refunds
- Discounts
- Online payments

---

## Remaining Notes

- This fix addresses the two Phase 9 review blockers.
- Important but non-blocker review items remain future work, including receipt generation, refunds, discounts, audit log wiring once `audit_logs` exists, and Parent Portal finance visibility.
