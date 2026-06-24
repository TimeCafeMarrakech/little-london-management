# Phase 12 Reports & Analytics Plan

## Purpose

Phase 12 introduces read-only reports and analytics for Little London management.

The goal is to help Super Admin and Admin users understand school operations across students, attendance, finance, enrolments, and events without changing operational records. Reports must reuse the approved Phase 1-11 data model and remain aligned with Premium Boutique Dashboard v2.

Phase 12 is not a workflow-building phase. It should not introduce accounting exports, Parent Portal reports, AI reports, advanced forecasting, payroll, or online payment reconciliation.

## User Experience Goals

- Give management a calm, premium reporting workspace rather than a dense ERP report library.
- Prioritize the most useful operational questions: attendance patterns, revenue health, enrolment growth, event performance, and student/family activity.
- Make reports easy to filter by date range, status, student, parent, teacher, class, course, and event category where relevant.
- Present executive summaries first, then charts, then detailed tables.
- Keep exports deliberate and permission-gated.
- Preserve the Little London visual identity: navy, cream, gold, sage, refined cards, readable spacing, and clean hierarchy.
- Ensure every report is read-only and cannot trigger edits, payments, attendance changes, booking changes, or record mutations.

## Management Reports

Management reports should provide whole-school operational visibility for Super Admin and Admin.

Recommended MVP reports:

- School overview report: active students, active parents, active teachers, active courses, active classes, active events.
- Operational activity report: new students, new parents, new enrolments, archived records, event bookings, payments recorded.
- Teacher workload snapshot: active assigned classes, assigned student counts, attendance session activity.
- Capacity report: class capacity usage and events nearing capacity.

Core filters:

- Date range
- Status
- Course
- Class
- Teacher
- Event category

## Attendance Reports

Attendance reports should summarize existing Phase 8 attendance data.

Recommended MVP reports:

- Attendance summary by date range.
- Attendance by class.
- Attendance by student.
- Attendance by course.
- Absence and lateness report.
- Attendance completion report for submitted, reviewed, and locked sessions.

Metrics:

- Sessions created
- Sessions submitted
- Present count
- Absent count
- Late count
- Excused count
- Sick count
- Completion rate
- Attendance rate

Visibility:

- Super Admin: all attendance reports.
- Admin: whole-school MVP reports.
- Teacher: future assigned-class reports only, not required for Phase 12 MVP unless explicitly approved.
- Parent: excluded from Phase 12.

## Finance Reports

Finance reports should summarize existing Phase 9 invoices, invoice items, payments, and payment allocations.

Recommended MVP reports:

- Revenue summary.
- Payments by date range.
- Outstanding invoices.
- Overdue invoices.
- Invoice status report.
- Student billing summary.
- Parent billing summary.
- Payment method summary.

Metrics:

- Total invoiced
- Total paid
- Outstanding balance
- Overdue balance
- Invoice count by status
- Payment count by method
- Payments this month

Rules:

- Reports must use transaction-safe Phase 9 finance data.
- Do not build accounting exports.
- Do not build online payment reconciliation.
- Do not build receipts, refunds, or discounts workflows.

## Enrolment Reports

Enrolment reports should summarize Phase 7 academic structure and student enrolments.

Recommended MVP reports:

- Active enrolments by course.
- Active enrolments by class.
- New enrolments by date range.
- Enrolment status report.
- Class capacity report.
- Student enrolment history.

Metrics:

- Total enrolments
- Active enrolments
- Completed/cancelled/archived enrolments
- New enrolments by month
- Class fill rate
- Classes over capacity risk threshold

Rules:

- Use active, non-deleted enrolments for current operational counts.
- Historical reports may include completed or cancelled enrolments when selected by filter.

## Event Reports

Event reports should summarize Phase 10 workshops, holiday camps, birthday events, and activity bookings.

Recommended MVP reports:

- Events by category.
- Event booking summary.
- Event capacity report.
- Upcoming events report.
- Event revenue snapshot using linked invoice/payment status where available.
- Birthday events and holiday camps summary.

Metrics:

- Total events
- Active/upcoming events
- Bookings by status
- Payment status by event
- Capacity usage
- Events near capacity
- Event price totals where available

Rules:

- Do not build event booking requests.
- Do not build online payments.
- Do not build refunds or receipts.
- Linked invoice references may be displayed only where already available and authorized.

## Parent/Student Reports

Parent and student reports in Phase 12 are management-facing only.

Recommended MVP reports:

- Student roster report.
- Parent contact summary.
- Parent-child relationship report.
- Student attendance summary.
- Student finance summary.
- Student enrolment summary.
- Student event booking summary.

Sensitive data rules:

- Do not expose internal notes in reports unless the report is explicitly management-only.
- Medical, allergy, emergency, and internal student fields should remain excluded from standard reports.
- Exported reports must follow the same field-safety rules as on-screen reports.

## Dashboard Analytics

Phase 12 should add read-only analytics panels for management dashboards.

Recommended dashboard analytics:

- Attendance trend.
- Revenue trend.
- Enrolment trend.
- Event booking trend.
- Outstanding invoice trend.
- Class capacity snapshot.
- Upcoming event capacity snapshot.

Dashboard analytics should:

- Use compact cards and charts.
- Keep chart colors within navy, sage, gold, cream, and soft neutral tones.
- Avoid bright colors, purple gradients, and overloaded chart layouts.
- Link to read-only report views where appropriate.

## Export Strategy

Exports are included only for management reports and must be permission-gated.

Supported MVP export formats:

- CSV for simple tabular reports.
- PDF for polished management summaries.

Optional later format:

- Excel/XLSX, if approved after the MVP report flow is stable.

Export requirements:

- Export buttons visible only to users with report export permission.
- Exports must use the same filters and authorization as on-screen reports.
- Exported data must not include hidden internal or sensitive fields by accident.
- Export generation and download should be auditable once shared `audit_logs` is implemented.

Explicitly excluded:

- Accounting exports.
- Online payment reconciliation exports.
- Payroll exports.
- Parent Portal report downloads.

## Permissions

Phase 12 permissions should follow existing RBAC rules.

Recommended permission keys:

- `reports.view.all`
- `reports.export.all`
- `reports.download.all`
- `reports.manage.all`

Role access:

- Super Admin: view, export, download, and manage all reports.
- Admin: view, export, and download approved operational reports.
- Teacher: no Phase 12 management reports by default; future assigned-only reports may be added later.
- Parent: no Phase 12 reports; Parent Portal remains separate and read-only.

Report categories may also require module permissions:

- Attendance reports require attendance view/report permission.
- Finance reports require finance/report permission.
- Event reports require event/report permission.
- Student/parent reports require people/report permission.

## RLS Considerations

Reports must not bypass authorization.

Rules:

- Use RLS-aware source tables or secure reporting views.
- Do not expose Teacher or Parent report access to management-only data.
- Super Admin may see all approved report data.
- Admin uses whole-school MVP scope; future branch scope must filter by `branch_id`.
- Teacher and Parent report access should remain deferred unless explicitly approved.
- Sensitive fields require restricted views or service-layer field selection.
- Financial reports must never be visible to Teachers.
- Parent users must not access management reports.

If service-role report generation is required later, it must be restricted to trusted server-side code, apply the same permission checks manually, and avoid exposing service-role data directly to the client.

## Database Views Needed

Phase 12 should prefer read-only reporting views for common aggregations.

Recommended MVP views:

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

View requirements:

- Include `branch_id` where source data supports it for future multi-branch filtering.
- Exclude soft-deleted records from default current-state reports.
- Allow historical filters where appropriate.
- Exclude sensitive fields by default.
- Avoid security-definer views unless there is a documented reason.

No database schema or migration should be created in this planning step.

## Charts & Visualisations

Recommended Phase 12 visualisations:

- Line charts for attendance, revenue, enrolments, and event booking trends.
- Bar charts for attendance by class, payments by method, enrolments by course, and event bookings by category.
- Donut or segmented charts for invoice status and attendance status distribution.
- KPI cards for totals, rates, outstanding balance, overdue balance, capacity usage, and growth.
- Compact tables for detailed report rows.

Visual style:

- Navy for primary series.
- Sage for positive/healthy trends.
- Gold for revenue or highlight values.
- Muted neutral tones for secondary series.
- Avoid bright colors and dense multi-series charts unless essential.

## Mobile Experience

Reports must remain usable on tablets and phones.

Mobile requirements:

- Summary cards stack cleanly.
- Charts resize without horizontal overflow.
- Filters collapse into a mobile-friendly panel.
- Tables become cards or horizontally safe lists where possible.
- Export controls remain accessible but not visually dominant.
- Important figures remain readable without hover-only interactions.

Management reporting is desktop-first, but mobile review should be comfortable for quick checks.

## Success Criteria

Phase 12 is successful when:

- Super Admin and Admin can view read-only operational reports.
- Reports cover management, attendance, finance, enrolment, event, and parent/student summaries.
- Reports use approved Phase 1-11 data sources.
- Reports do not mutate records.
- Reports respect permissions and RLS boundaries.
- Sensitive/internal fields are excluded from standard reports and exports.
- Dashboard analytics match Premium Boutique Dashboard v2.
- Export behavior is permission-gated and safe.
- Mobile layouts remain readable.
- Lint, type-check, and build pass after implementation.

## Future Reports Not Included

The following are not included in Phase 12:

- Accounting exports.
- Parent Portal reports.
- AI reports.
- Advanced forecasting.
- Payroll.
- Online payment reconciliation.
- Automated board packs.
- Branch comparison reports before multi-branch support is implemented.
- Receipt/refund/discount advanced finance reports.
- Teacher performance scoring.
- Student progress or AI narrative reports.
