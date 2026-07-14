# Phase 14A.4 Target Card Fix Report

## Summary

The Monthly Targets current-month summary cards have been fixed.

The target list was correctly showing created targets from `monthly_business_targets`, but the summary cards were not finding the matching current-month rows from `cashbook_target_progress_view`.

## Root Cause

The service generated the current month using:

`new Date(year, month, 1).toISOString().slice(0, 10)`

In time zones ahead of UTC, including British Summer Time, local midnight on the first day of the month can serialize to the previous UTC date. For example, July 1 can become `YYYY-06-30`.

That meant the summary card query could compare:

- expected database date: `YYYY-MM-01`
- generated lookup date: previous-month final day

The created targets were valid and appeared in the list, but the card query did not match them.

## Files Modified

- `services/cashbook/cashbook-service.ts`
- `components/cashbook/cashbook-target-form.tsx`
- `components/cashbook/cashbook-target-summary-cards.tsx`
- `components/cashbook/cashbook-target-utils.ts`
- `features/cashbook/types.ts`
- `docs/PHASE_14A4_TARGET_CARD_FIX_REPORT.md`

## Month Normalization Fix

`currentMonthStart()` now builds the current month as a plain local date string:

`YYYY-MM-01`

This avoids timezone conversion and matches `monthly_business_targets.target_month` exactly.

The target form default month was also updated to use local year/month string construction rather than `toISOString()`.

## Filter / Mapping Fix

The current-month card query still uses:

- `cashbook_target_progress_view`
- `target_month = YYYY-MM-01`
- `business_area_id is null`

This keeps the intended behaviour:

- only active current-month targets
- only whole-business targets
- exact target type matching:
  - `revenue`
  - `profit`
  - `expense_budget`
  - `active_students`

The existing view field mapping remains intact for:

- `target_value`
- `current_value`
- `remaining_value`
- `percentage_achieved`
- `days_remaining`
- `projected_month_end_value`
- `average_required_per_remaining_day`
- `target_status`

## Revalidation Fix

The existing revalidation was reviewed and is already correct.

Create, edit, and archive actions revalidate:

- `/cashbook/targets`
- target detail route where applicable
- `/dashboard` where applicable

No additional revalidation change was required.

## Empty-State Fix

Unset target cards now use the neutral status:

`No target`

This prevents an unset target from appearing as `On Track`.

`Not set` is only shown when no matching whole-business current-month target exists.

## Scope Confirmation

No changes were made to:

- database schema
- migrations
- database target calculations
- Daily Income
- Expenses
- invoices
- payments
- receipts
- RBAC

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
