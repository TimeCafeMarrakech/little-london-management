# Phase 14A.1 Review Fix Report

## Summary

The Phase 14A.1 review fixes were applied to the Cashbook & Business Performance migration and completion documentation only.

No UI, application code, routes, services, invoice/payment workflows, additional tables, or new features were introduced.

## Files Modified

- `supabase/migrations/202606200017_cashbook_business_performance.sql`
- `docs/PHASE_14A1_COMPLETION_REPORT.md`

## Files Created

- `docs/PHASE_14A1_REVIEW_FIX_REPORT.md`

## Fixes Applied

### Target Progress Calculations

Updated `cashbook_target_progress_view` so target progress now handles:

- Current month
- Past months
- Future months
- Zero targets
- Zero elapsed days

Rules now applied:

- Past months use final actual values, `days_remaining = 0`, and `average_required_per_remaining_day = 0`.
- Future months use `current_value = 0`, `projected_month_end_value = 0`, and full target-month days remaining.
- Current month projections use elapsed days and target-month day count.
- Divide-by-zero cases are guarded.

### Business Area Targets

Updated target calculations so:

- Whole-business targets use whole-business totals.
- Business-area targets use business-area-specific revenue, expense, and profit values.
- Whole-school totals are no longer returned for a target with `business_area_id`.

Business-area expense budgets are supported through `cashbook_expense_entries.business_area_id`.

### RLS Granularity

Replaced broad `for all` operational policies with split policies:

- SELECT requires view/manage permissions.
- INSERT requires create/manage permissions.
- UPDATE edit workflows require edit/manage permissions.
- Void workflows require void/manage permissions.
- Archive workflows require archive/manage permissions.
- Restore workflows require restore/manage permissions.

Hard deletes remain unavailable.

### Helper Functions

Replaced the generic `public.can_manage_cashbook()` helper with domain-specific helpers:

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

Business areas and categories no longer become editable simply because a future role can manage reconciliation.

### Minor Improvements

- Simplified the daily reconciliation unique index because `archived` is not a supported reconciliation status.
- Made seed conflict targets explicit.
- Added a comment documenting that `recorded_by` is intentionally visible in the management-only reconciliation reporting view.

## Confirmations

- No new features were added.
- No UI was built.
- No application routes were changed.
- No additional tables were created.
- No existing invoice or payment workflows were modified.
- No authentication changes were made.
- No RBAC role assignments were expanded beyond the approved Super Admin/Admin model.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
