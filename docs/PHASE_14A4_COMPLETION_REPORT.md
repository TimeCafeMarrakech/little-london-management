# Phase 14A.4 Completion Report

## Summary

Phase 14A.4 Monthly Targets UI has been implemented for the Little London Management System.

This phase adds management-only Monthly Business Targets inside the existing Cashbook area using the completed Phase 14A.1 database foundation:

- `monthly_business_targets`
- `cashbook_target_progress_view`
- Phase 14A.1 business target permissions and RLS policies

No database schema, migrations, invoice workflows, payment workflows, receipt workflows, Daily Income workflows, or Daily Expenses workflows were modified.

## Files Created

- `app/(dashboard)/cashbook/targets/page.tsx`
- `app/(dashboard)/cashbook/targets/new/page.tsx`
- `app/(dashboard)/cashbook/targets/[targetId]/page.tsx`
- `app/(dashboard)/cashbook/targets/[targetId]/edit/page.tsx`
- `components/cashbook/cashbook-target-actions.tsx`
- `components/cashbook/cashbook-target-empty-state.tsx`
- `components/cashbook/cashbook-target-filters.tsx`
- `components/cashbook/cashbook-target-form.tsx`
- `components/cashbook/cashbook-target-summary-cards.tsx`
- `components/cashbook/cashbook-target-table.tsx`
- `components/cashbook/cashbook-target-utils.ts`
- `docs/PHASE_14A4_COMPLETION_REPORT.md`

## Files Modified

- `components/cashbook/cashbook-tabs.tsx`
- `features/cashbook/actions.ts`
- `features/cashbook/schemas.ts`
- `features/cashbook/types.ts`
- `services/cashbook/cashbook-service.ts`

## Routes

- `/cashbook/targets`
  - Monthly Targets list, current-month progress cards, filters, and target table.

- `/cashbook/targets/new`
  - Create Monthly Target form.

- `/cashbook/targets/[targetId]`
  - Target detail page with progress metrics, notes, audit fields, and archive action.

- `/cashbook/targets/[targetId]/edit`
  - Edit Monthly Target form while status is `active`.

Existing Cashbook routes preserved:

- `/cashbook`
- `/cashbook/new`
- `/cashbook/[incomeId]`
- `/cashbook/expenses`
- `/cashbook/expenses/new`
- `/cashbook/expenses/[expenseId]`

## Navigation

The existing management-only Cashbook sidebar item remains unchanged.

Inside Cashbook, the tab navigation now includes:

- Daily Income
- Expenses
- Targets

Visible to:

- Super Admin
- Admin

Not visible to:

- Teacher
- Parent

Teacher and Parent users remain blocked by server-side route permission checks.

## Permissions Used

Phase 14A.4 uses the existing Phase 14A.1 permissions and does not introduce a new permission model.

Permissions used:

- `business_targets.view.all`
- `business_targets.manage.all`
- `business_performance.view.all`

The UI also relies on Phase 14A.1 RLS policies and helper functions:

- `can_view_business_targets()`
- `can_manage_business_targets()`
- `can_view_cashbook_reports()`

## Target Types Supported

Monthly Targets support:

- Revenue
- Profit
- Expense Budget
- Active Students

Business Area is optional:

- Blank business area means the target applies to the whole business.
- Selected business area means the target applies only to that area.

## Validation Rules

Create/edit validation includes:

- Target month is required.
- Target month is normalized to the first day of the selected month.
- Target type is required.
- Target value must be `0` or greater.
- Business Area is optional.
- Notes are optional.

## Duplicate Prevention

Duplicate active targets are prevented for:

- Target month
- Target type
- Business area

The service checks for duplicates before insert/update and also maps the existing database unique constraint to a friendly error:

`An active target already exists for this month, target type, and business area.`

## Progress Calculations Used

Progress cards and list metrics use the existing Phase 14A.1 database view:

- `cashbook_target_progress_view`

Displayed metrics:

- Target
- Current result
- Remaining amount
- Percentage achieved
- Days remaining
- Projected month-end result
- Average required per remaining day
- Status

Supported status labels:

- Achieved
- On Track
- Needs Attention
- At Risk

Expense Budget cards use inverted visual interpretation:

- Lower spending is good.
- Near budget is warning.
- Over budget is danger.

Text labels are shown alongside visual colours so the UI does not rely on colour alone.

## Write Confirmation Safeguards

The following mutations confirm a row was actually updated before reporting success:

- `updateCashbookTarget()`
- `archiveCashbookTarget()`

Each mutation uses `.select("id").single()` after update and raises friendly domain errors when no row changes.

Friendly domain errors include:

- `target_not_found`
- `target_not_editable`
- `target_already_changed`
- `duplicate_active_target`
- `target_mutation_failed`

The UI maps these to friendly messages and does not expose raw database errors to users.

## Known Limitations

- Restore workflow remains deferred.
- Business Performance dashboard integration is not included.
- Daily reconciliation is not included.
- Reports integration is not included.
- Payroll and supplier management are not included.
- Attachments are not included.
- Email and WhatsApp reporting are not included.
- Parent and Teacher access are intentionally not included.
- Current-month summary cards show whole-business targets only; business-area-specific targets are available in the list and detail views.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed

The production build includes the new target routes:

- `/cashbook/targets`
- `/cashbook/targets/new`
- `/cashbook/targets/[targetId]`
- `/cashbook/targets/[targetId]/edit`
