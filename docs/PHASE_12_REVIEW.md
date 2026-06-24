# Phase 12 Reports & Analytics Review

## Review Status

Phase 12 is implemented and the local validation commands pass, but Phase 12 requires fixes before approval.

The Reports workspace is read-only at the application level and is restricted to Super Admin and Admin in the UI. The main blocker is at the database reporting-view layer: the Phase 12 views are granted to all authenticated users without an explicit reports permission guard, which can expose report data through direct Supabase access wherever existing base-table RLS allows rows.

## Files Reviewed

- `docs/PHASE_12_REPORTS_ANALYTICS_PLAN.md`
- `docs/PHASE_12_COMPLETION_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/MILESTONE_PHASE_11_BASELINE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/PERMISSIONS.md`
- `docs/API_REQUIREMENTS.md`
- `app/(dashboard)/reports/page.tsx`
- `components/reports/report-ui.tsx`
- `features/reports/types.ts`
- `services/reports/report-service.ts`
- `lib/dashboard/data.ts`
- `supabase/migrations/202606200013_reports_analytics_views.sql`

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

## Verification Summary

- Reports navigation access: Management navigation includes Reports for Super Admin and Admin only.
- Reports RBAC: The page and service gate report access with Super Admin/Admin roles and reports permissions.
- Reports service queries: Service queries are read-only and use reporting views only.
- Reporting views: Views exist for attendance, finance, enrolment, event, and management KPIs.
- Attendance reports: Implemented with sessions, completion, status counts, class breakdown, and student absence focus.
- Finance reports: Implemented with invoiced, paid, outstanding, overdue, invoice status, and payment method summaries.
- Enrolment reports: Implemented with total, active, new-this-month, course/class breakdowns, and class capacity.
- Event reports: Implemented with event totals, bookings, category breakdown, payment status, and capacity.
- Parent/student management reports: Implemented as a management-facing roster summary.
- Dashboard analytics: Implemented with KPI cards, trend panels, and breakdown panels.
- Payment method reporting: Cash, Bank Transfer, and Cheque are explicitly included.
- Sensitive field exposure: Standard report service responses exclude medical notes, emergency notes, internal notes, audit fields, and invoice notes.
- Export controls: Export functionality is not implemented; the UI currently shows a strategy panel only.
- Mobile responsiveness: Most cards and charts use responsive grids, but one report table needs mobile refinement.
- Premium Boutique Dashboard v2 consistency: Visual treatment aligns with the approved premium dashboard direction.
- RLS compatibility: The views use `security_invoker`, but the grants are too broad for Phase 12 management-only reports.
- Reporting view leak risk: Present. See blocker below.

## Blockers

1. Reporting views can be queried by non-management authenticated users.

   Evidence: `supabase/migrations/202606200013_reports_analytics_views.sql` grants `select` on every `report_*` view to `authenticated`. The views do not include an explicit Super Admin/Admin or `reports.view.all` permission condition.

   Why this matters: The application page blocks Teacher and Parent users, but direct Supabase access to the reporting views is still available to any authenticated user. Because the views are `security_invoker`, base-table RLS still applies, which is good, but it also means Teachers may be able to query report rows for assigned classes or assigned events where previous phase RLS permits access. Phase 12 explicitly keeps Teacher and Parent reports out of scope.

   Required fix: Restrict reporting views at the database layer. Options include revoking broad `authenticated` access and exposing the views only through management-safe policies, or adding explicit permission checks inside secure report views/functions so only Super Admin/Admin users with report permissions can read them.

## Important Issues

1. Export controls are not implemented.

   The approved plan says exports should be permission-gated and support CSV for tabular reports and PDF for management summaries. The implementation currently includes only an informational `ExportStrategyPanel` with no export buttons, no download handlers, and no permission-gated export path.

2. Parent/student report metrics are incomplete.

   The parent/student roster is derived from enrolment report rows only. Students without enrolments are omitted from the detailed roster, and `linkedFamilies` is based on roster length rather than actual parent-child relationship data.

3. Report filters are missing.

   The plan calls for date range, status, course, class, teacher, and event category filters where relevant. The current workspace provides static whole-school summaries without filter controls.

## Medium Issues

1. Month trends collapse across years.

   Trend labels use month names only, so data from the same month in different years would be merged into one bucket.

2. Parent/student report table is not fully mobile-friendly.

   The detailed roster uses a fixed five-column grid. On smaller screens this may become cramped instead of becoming cards or a horizontally safe table.

3. Report error handling is broad.

   The Reports page catches all service errors and displays a migration-not-ready message. Permission, data, or query errors after migration could be misreported.

## Minor Issues

1. Export copy may confuse users.

   The export panel says CSV and PDF exports are planned, while Phase 12 is otherwise presented as completed. This should either be clearly documented as deferred or implemented in a later fix.

2. Dashboard analytics are useful but not linked to detailed filtered report views.

   This is acceptable for the MVP but should be improved when filters and exports are added.

## Approval Decision

Phase 12 requires fixes before approval.

The implementation passes lint, type-check, and build, and the application UI is largely aligned with Premium Boutique Dashboard v2. Approval should wait until reporting views are protected at the database layer so Teacher and Parent users cannot access management reporting views through direct Supabase queries.
