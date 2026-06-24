# Phase 12 Fix Report

## Phase

Phase 12 - Reports & Analytics blocker fix

## Status

Completed locally and validated.

## Blocker Fixed

Fixed the Phase 12 reporting-view access blocker identified in `docs/PHASE_12_REVIEW.md`.

The original Phase 12 migration granted direct `select` access on all `report_*` views to the `authenticated` database role. That meant Teacher and Parent users could potentially query reporting views directly through Supabase wherever base-table RLS allowed rows, even though Phase 12 reports are management-only.

## What Was Changed

Created follow-up migration:

- `supabase/migrations/202606200014_reports_security_fix.sql`

The migration:

- Adds `public.can_view_management_reports()`.
- Requires an authenticated active Super Admin or Admin user.
- Requires one of:
  - `reports.view.all`
  - `reports.export.all`
  - `reports.manage.all`
- Revokes the previous unguarded access from `anon`, `authenticated`, and `public`.
- Recreates each Phase 12 `report_*` view with an explicit `public.can_view_management_reports()` predicate.
- Grants `select` back to `authenticated` only on the now-guarded reporting views so the existing Super Admin/Admin Reports page continues to work.

## Reporting Views Reviewed and Guarded

- `report_attendance_summary_view`
- `report_attendance_by_student_view`
- `report_attendance_by_class_view`
- `report_invoice_balances_view`
- `report_payment_summary_view`
- `report_enrolment_summary_view`
- `report_class_capacity_view`
- `report_event_booking_summary_view`
- `report_event_capacity_view`
- `report_management_kpis_view`

## Access Outcome

- Super Admin: can query report views when active and permissioned.
- Admin: can query report views when active and permissioned.
- Teacher: cannot query report views.
- Parent: cannot query report views.
- Anonymous users: cannot query report views.

## Additional Exposure Review

The guarded views continue to exclude known sensitive fields such as medical notes, emergency notes, internal notes, audit fields, and invoice notes.

No exports, filters, new reports, UI changes, routes, services, or business workflows were added.

## Files Created

- `supabase/migrations/202606200014_reports_security_fix.sql`
- `docs/PHASE_12_FIX_REPORT.md`

## Files Modified

- None

## Command Results

```text
npm.cmd run lint
Result: Passed
```

```text
npm.cmd run type-check
Result: Passed
```

```text
npm.cmd run build
Result: Passed
```

## Remaining Work

The Phase 12 blocker is fixed. The non-blocking issues from the Phase 12 review remain deferred unless separately approved:

- Export/download implementation.
- Report filters.
- Parent/student report metric refinement.
- Mobile refinement for the parent/student report table.
