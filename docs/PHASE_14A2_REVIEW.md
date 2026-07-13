# Phase 14A.2 Review

## Summary

Phase 14A.2 Daily Income UI was reviewed against the Phase 14A Cashbook & Business Performance plan, the Phase 14A.2 completion report, the Cashbook implementation files, and the Phase 14A.1 migration/RLS foundation.

The Daily Income feature is largely implemented correctly:

- Cashbook navigation is management-only.
- Teacher and Parent roles do not receive navigation access.
- Cashbook routes perform server-side permission checks.
- Summary totals use only `cashbook_income_entries`.
- Create/edit validation matches the Phase 14A.1 database constraints.
- Void/archive preserve history and do not hard delete records.
- Parent/student relationship validation is enforced when both are selected.
- Lint, type-check, and build all pass.

However, two issues should be fixed before approval because this is a financial workflow and user-facing action state must be reliable.

Approval decision: **Requires fixes**

## Files Reviewed

- `docs/PHASE_14A_CASHBOOK_BUSINESS_PERFORMANCE_PLAN.md`
- `docs/PHASE_14A2_COMPLETION_REPORT.md`
- `supabase/migrations/202606200017_cashbook_business_performance.sql`
- `lib/dashboard/data.ts`
- `app/(dashboard)/cashbook/page.tsx`
- `app/(dashboard)/cashbook/new/page.tsx`
- `app/(dashboard)/cashbook/[incomeId]/page.tsx`
- `app/(dashboard)/cashbook/[incomeId]/edit/page.tsx`
- `components/cashbook/cashbook-summary-cards.tsx`
- `components/cashbook/cashbook-filters.tsx`
- `components/cashbook/cashbook-income-table.tsx`
- `components/cashbook/cashbook-income-form.tsx`
- `components/cashbook/cashbook-income-actions.tsx`
- `components/cashbook/cashbook-empty-state.tsx`
- `components/cashbook/cashbook-error-state.tsx`
- `features/cashbook/actions.ts`
- `features/cashbook/schemas.ts`
- `features/cashbook/types.ts`
- `services/cashbook/cashbook-service.ts`

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed

## Passed Items

1. Cashbook navigation is visible only to Super Admin/Admin.
   - `lib/dashboard/data.ts` adds `Cashbook` only under `super_admin` and `admin`.
   - `teacher` and `parent` navigation arrays do not include `/cashbook`.

2. Teacher and Parent access is blocked server-side.
   - `/cashbook`, `/cashbook/new`, `/cashbook/[incomeId]`, and `/cashbook/[incomeId]/edit` all require a user profile and call Cashbook permission helpers before rendering data or forms.

3. List, create, detail and edit routes use Phase 14A.1 permissions.
   - View uses `cashbook.view.all` or `cashbook.manage.all`.
   - Create uses `cashbook.create.all` or `cashbook.manage.all`.
   - Edit uses `cashbook.edit.all` or `cashbook.manage.all`.
   - Void uses `cashbook.void.all` or `cashbook.manage.all`.
   - Archive uses `cashbook.archive.all` or `cashbook.manage.all`.

4. Summary cards use only `cashbook_income_entries`.
   - The summary service does not include invoice payments.
   - Totals are based on `status = recorded` and `deleted_at is null`.

5. Voided, archived and deleted records are excluded from active totals.
   - Summary cards filter to recorded, non-deleted rows only.

6. Search and filters work together correctly.
   - Query string filters are combined into one request and reset pagination to page 1.
   - Filters include date range, business area, category, payment method, status, and search.

7. Date-range filtering uses `income_date`.
   - Date range uses `gte("income_date", dateFrom)` and `lte("income_date", dateTo)`.

8. Create validation matches database constraints.
   - Amount is greater than zero.
   - Business area, income category, payment method, date, and description are required.
   - Payment method is constrained to `cash`, `bank_transfer`, or `cheque`.

9. Edit is allowed only while status is recorded.
   - Edit page blocks non-recorded or deleted entries.
   - Service checks existing status before update.
   - RLS also restricts update to recorded, non-deleted rows.

10. Void and archive preserve history and do not hard delete.
    - Void changes status to `void`.
    - Archive changes status to `archived` and sets soft archive fields.
    - No hard delete workflow was introduced.

11. Parent/student optional links do not expose archived records in create/edit options.
    - Parent and student option loaders exclude deleted rows and archived status.

12. Active parent/student relationship validation is enforced.
    - If both parent and student are selected, service checks `parent_student_relationships.status = active` and `deleted_at is null`.

13. Recorded-by and audit fields are management-only.
    - Cashbook routes are management-gated.
    - Detail page displays row audit fields only to permitted management users.

14. Empty and error states follow Premium Boutique Dashboard v3.
    - Components use the approved cream/coral/sage/navy visual language.

15. No invoice, payment, receipt, database, migration or RBAC model changes were introduced.
    - Phase 14A.2 added UI/service/action files only and modified role-aware dashboard navigation.

## Blockers

No blockers found.

## Important Issues

1. Write actions do not verify that an update actually changed a row.

   In `services/cashbook/cashbook-service.ts`, `updateCashbookIncome`, `archiveCashbookIncome`, and `voidCashbookIncome` check Supabase errors but do not verify affected row count.

   Why it matters:

   - RLS and status filters can cause an update to affect zero rows without returning a database error.
   - A stale page or concurrent action could make the UI report success even when no income record was updated, voided, or archived.
   - Financial workflows should confirm mutation success explicitly.

   Recommended fix:

   - Use `.select("id").single()` or an equivalent affected-row confirmation on update/archive/void.
   - Return friendly messages such as `income_not_editable`, `income_not_found`, or `income_already_changed` when no row is updated.

## Medium Issues

1. Restore behaviour is not implemented or clearly deferred in the UI.

   The Phase 14A.1 migration includes `cashbook.restore.all` and restore RLS policy support, but Phase 14A.2 does not expose restore behaviour.

   This is acceptable for the requested Daily Income MVP if restore is intentionally deferred, but the review requirement asked that restore be either implemented safely or clearly deferred.

   Recommended fix:

   - Add a clear note in the Phase 14A.2 fix/completion documentation that restore is deferred, or implement a safe restore action in a later approved task.

2. The Cashbook navigation is flat rather than nested under Finance.

   The request described `Finance -> Cashbook`, while the current app navigation model is flat. The implementation adds `Cashbook` as a management-only top-level navigation item near Invoices/Payments.

   This does not affect access control or functionality, but should be acknowledged as matching the existing sidebar pattern rather than a nested submenu implementation.

## Minor Issues

1. Date display is raw ISO format.

   Cashbook table and detail pages display dates as raw `YYYY-MM-DD`. This is functional and unambiguous, but future Premium Dashboard v3 polish could format dates more warmly for staff users.

2. Audit history is row-level only.

   Shared `audit_logs` remain deferred, so the detail page shows available row-level audit fields rather than a full audit event timeline.

## Approval Decision

**Requires fixes**

Phase 14A.2 is close and the core Daily Income feature is structurally sound, but the write-action confirmation issue should be fixed before approval because this is a financial management workflow.

