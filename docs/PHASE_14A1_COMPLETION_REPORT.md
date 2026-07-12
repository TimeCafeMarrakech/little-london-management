# Phase 14A.1 Completion Report

## Summary

Phase 14A.1 created the secure database, permissions, RLS, and reporting foundation for the Cashbook & Business Performance module.

This phase did not build the Cashbook UI, income forms, expense forms, dashboard widgets, payroll, VAT, bank reconciliation, supplier management, attachments, or parent-facing document workflows.

## Migration Created

- `supabase/migrations/202606200017_cashbook_business_performance.sql`

## Tables Created

The migration creates the following tables:

- `business_areas`
- `cashbook_income_categories`
- `cashbook_expense_categories`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `monthly_business_targets`
- `cashbook_daily_reconciliations`

All operational tables include future `branch_id` support and standard audit/soft-delete fields where appropriate.

## Seed Data

### Business Areas

Seeded:

- English Classes
- Play & Learn
- Workshops
- Holiday Camps
- Birthday Parties
- Theatre
- Other

### Income Categories

Seeded:

- Play & Learn hourly childcare
- Drop-in session
- Workshop
- Holiday camp
- Birthday party
- Merchandise
- Snacks
- Other income

### Expense Categories

Seeded:

- Salaries
- Rent
- Utilities
- Internet
- Cleaning
- Teaching materials
- Arts and crafts
- Marketing
- Repairs
- Equipment
- Other expenses

## Permissions Added

The migration adds management-only permissions:

- `cashbook.view.all`
- `cashbook.create.all`
- `cashbook.edit.all`
- `cashbook.void.all`
- `cashbook.archive.all`
- `cashbook.restore.all`
- `cashbook.manage.all`
- `expenses.view.all`
- `expenses.create.all`
- `expenses.edit.all`
- `expenses.void.all`
- `expenses.archive.all`
- `expenses.restore.all`
- `expenses.manage.all`
- `business_targets.view.all`
- `business_targets.manage.all`
- `business_performance.view.all`
- `cash_reconciliation.view.all`
- `cash_reconciliation.manage.all`

Permissions are assigned to:

- Super Admin
- Admin

Teacher and Parent receive no Cashbook, Expense, Target, Reconciliation, or Business Performance permissions.

## RLS Policies

RLS is enabled on every new table.

The migration adds helper functions:

- `public.can_view_cashbook_income()`
- `public.can_create_cashbook_income()`
- `public.can_edit_cashbook_income()`
- `public.can_void_cashbook_income()`
- `public.can_archive_cashbook_income()`
- `public.can_restore_cashbook_income()`
- `public.can_view_cashbook_expenses()`
- `public.can_create_cashbook_expenses()`
- `public.can_edit_cashbook_expenses()`
- `public.can_void_cashbook_expenses()`
- `public.can_archive_cashbook_expenses()`
- `public.can_restore_cashbook_expenses()`
- `public.can_view_business_targets()`
- `public.can_manage_business_targets()`
- `public.can_view_cash_reconciliation()`
- `public.can_manage_cash_reconciliation()`
- `public.can_view_cashbook_configuration()`
- `public.can_manage_cashbook_configuration()`
- `public.can_view_cashbook_reports()`

RLS policies are management-only:

- Super Admin can manage and view.
- Admin can manage and view through assigned permissions.
- Teacher is denied.
- Parent is denied.

Policies are split by operation so future granular finance roles can work safely:

- SELECT requires view/manage permissions.
- INSERT requires create/manage permissions.
- UPDATE edit workflows require edit/manage permissions.
- Void workflows require void/manage permissions.
- Archive workflows require archive/manage permissions.
- Restore workflows require restore/manage permissions.
- Hard deletes remain unavailable.

No broad authenticated access is granted to tables.

## Reporting Views

The migration creates management-only reporting views:

- `cashbook_daily_summary_view`
- `cashbook_monthly_summary_view`
- `cashbook_income_by_business_area_view`
- `cashbook_expenses_by_category_view`
- `cashbook_target_progress_view`
- `cashbook_payment_method_summary_view`
- `cashbook_business_area_profit_view`
- `cashbook_daily_reconciliation_view`

The views follow the Phase 12 reports hardening approach:

- They use `security_invoker = true`.
- They use `security_barrier = true`.
- Broad access is revoked.
- Select access is granted only with management permission checks inside the views.

## Calculation Rules

Total income is calculated as:

```text
invoice payments received + cashbook income
```

Invoice totals are not counted as income until payment is received.

Each payment is counted once from `payments.amount`, regardless of how it is allocated across invoices.

Net profit is calculated as:

```text
total income - expenses
```

Payment method summaries separate:

- Cash
- Bank Transfer
- Cheque

Daily reconciliation derives:

- `expected_cash`
- `difference`
- `closing_cash`

Monthly target progress includes:

- Target value
- Current value
- Remaining value
- Percentage achieved
- Days remaining
- Projected month-end value
- Average required per remaining day
- Status: Achieved, On Track, Needs Attention, At Risk

Expense budget status uses inverted logic where lower spending is good and overspending is at risk.

Target progress now handles:

- Past months: days remaining is 0, projection is the final actual value, and average required per remaining day is 0.
- Future months: current progress is 0, projection is 0, and days remaining is the full number of days in the target month.
- Current month: elapsed days, remaining days, projected month-end value, and average required per remaining day are calculated from the current date.
- Zero targets and zero elapsed days are protected from divide-by-zero errors.

Business-area targets now use business-area-specific income, expense, and profit values when `monthly_business_targets.business_area_id` is set. Whole-business totals are used only when `business_area_id` is null.

## Security Confirmation

Salary-related expense data remains management-only.

Detailed expense notes and staff/supplier names are stored only in management tables and are not exposed through unauthorized role access.

Teacher and Parent roles have no permissions and no RLS path into the new cashbook tables or views.

No parent portal access was added.

No invoice or payment workflows were modified.

No UI, forms, dashboard widgets, payroll, VAT, bank reconciliation, supplier management, or attachment workflows were built.

## Known Limitations

- Cashbook UI is not built yet.
- Income and expense forms are not built yet.
- Dashboard widgets are not built yet.
- Service-layer parent/student relationship validation for optional income links is deferred.
- Receipt attachments are deferred.
- Payroll remains a future detailed module; salaries are only supported as an expense category.
- Bank reconciliation, VAT/tax, supplier management, and accounting exports remain deferred.
- Branch scoping is prepared with nullable `branch_id` but full multi-branch enforcement remains deferred.

## Review Fixes Applied

After the Phase 14A.1 review, the migration was tightened before Supabase application:

- Replaced the broad `can_manage_cashbook()` helper with domain-specific helpers for income, expenses, targets, reconciliation, and shared configuration.
- Split RLS policies by operation so SELECT, INSERT, UPDATE, void, archive, and restore workflows require the correct permissions.
- Kept hard deletes unavailable.
- Corrected target progress calculations for current, past, and future months.
- Prevented divide-by-zero cases for zero targets and zero elapsed days.
- Added business-area-specific target calculations when `business_area_id` is present.
- Simplified the daily reconciliation unique index because `archived` is not a supported reconciliation status.
- Made seed conflict targets explicit.
- Documented that `recorded_by` is intentionally exposed in the management-only reconciliation reporting view.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
