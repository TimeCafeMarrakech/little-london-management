# Phase 11 Parent Portal Fix Re-Review

## Review Summary

Phase 11 Parent Portal fixes were reviewed against:

- `docs/PHASE_11_REVIEW.md`
- `docs/PHASE_11_FIX_REPORT.md`
- `docs/PHASE_11_PARENT_PORTAL_PLAN.md`

The Phase 11 review blockers and important issues have been addressed. The Parent Portal remains read-only, parent-scoped, and aligned with the approved MVP plan.

Approval status: Phase 11 is approved.

## Verification Checklist

### 1. Parent Base-Table SELECT Policies Removed Where Needed

Passed.

`supabase/migrations/202606200011_parent_portal_security_fix.sql` drops the direct parent portal SELECT policies from sensitive base tables, including:

- `parents_own_portal_read`
- `parents_parent_portal_select_own`
- `students_parent_portal_select_own_child`
- `teachers_parent_portal_select_child_teachers`
- `attendance_records_parent_portal_select_own_child`
- `invoices_parent_portal_select_own_family`
- `event_bookings_parent_portal_select_own_child`

It also removes the related direct parent portal SELECT policies for enrolments, classes, courses, class teachers, attendance sessions, invoice items, payments, payment allocations, event types, and events.

### 2. Parent-Safe Views Expose Only Parent-Safe Columns

Passed.

The security-fix migration creates dedicated `parent_portal_*` views for Parent Portal reads. These views expose only the fields needed for the read-only portal UI.

The views intentionally exclude:

- internal notes
- medical notes
- emergency notes
- audit fields
- management-only fields
- teacher operational fields
- attendance internal notes
- invoice internal notes

Teacher visibility is limited to `id` and `full_name` through `parent_portal_teachers`.

### 3. Attendance Notes Are Not Exposed

Passed.

Attendance notes were removed from:

- `ParentPortalAttendanceRecord`
- attendance row mapping in `services/parent-portal/parent-portal-service.ts`
- the parent-safe attendance view

The service now reads attendance from `parent_portal_attendance_records`, which does not expose the raw `notes` column.

### 4. Invoice Notes Are Not Exposed

Passed.

Invoice notes were removed from:

- `ParentPortalInvoice`
- invoice row mapping in `services/parent-portal/parent-portal-service.ts`
- the parent-safe invoice view

The service now reads invoices from `parent_portal_invoices`, which does not expose the raw `notes` column.

### 5. `/portal` Routes Are Middleware Protected

Passed.

`lib/auth/routes.ts` now includes `/portal` in `protectedRoutePrefixes`, so portal routes are explicitly protected by middleware in addition to the existing dashboard layout and page-level parent role checks.

### 6. Parent Class Visibility Requires Active Enrolments

Passed.

`parent_can_access_class()` now requires:

- `student_enrolments.status = 'active'`
- `student_enrolments.deleted_at is null`
- an active parent-child relationship through `parent_can_access_student()`

The parent-safe enrolment, class, course, class teacher, and teacher views also use active/non-deleted enrolment checks where required.

### 7. Parent Portal Remains Read-Only

Passed.

No parent write workflows were added. The portal service uses SELECT-only reads, and scans of the parent portal pages/components/service did not identify insert, update, delete, upsert, or RPC mutation paths.

The Phase 11 exclusions remain intact:

- no online payments
- no messaging
- no notifications
- no homework
- no reports
- no downloads
- no event booking requests
- no parent-facing write workflows

### 8. Validation Commands

Passed.

PowerShell blocks the direct `npm` script shim on this machine, so the equivalent Windows npm shim was used.

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

## Remaining Notes

- Parent Portal pages still load the full parent portal dataset on most views. This was classified as a medium performance issue in the original review and is acceptable for the MVP.
- The parent sidebar active state remains static. This is a minor UI issue and does not block approval.
- The re-review verified source code and migration files; it did not apply migrations to a live Supabase project.

## Approval Decision

Phase 11 Parent Portal MVP is approved.

The previous blocker around parent base-table column exposure has been resolved by replacing direct parent base-table reads with parent-safe views. The important issues around raw attendance notes and invoice notes have also been resolved. Lint, type-check, and build all pass.
