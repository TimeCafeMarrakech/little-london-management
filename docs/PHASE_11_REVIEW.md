# Phase 11 Parent Portal MVP Review

## Review Summary

Phase 11 delivers the planned read-only Parent Portal user experience and the project remains technically healthy. Lint, type checking, and production build all pass.

However, Phase 11 should not be approved yet. The UI and server queries are parent-scoped, but the new parent RLS policies grant direct SELECT access to base tables that contain internal notes, audit metadata, teacher-only fields, and management data. Because Supabase RLS is row-level rather than column-level, a parent session could query more columns than the portal UI displays.

Approval status: Requires fixes before Phase 11 approval.

## Documents Reviewed

- `docs/PHASE_11_PARENT_PORTAL_PLAN.md`
- `docs/PHASE_11_COMPLETION_REPORT.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/PERMISSIONS.md`
- `docs/API_REQUIREMENTS.md`

## Implementation Files Reviewed

- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/portal/children/page.tsx`
- `app/(dashboard)/portal/children/[studentId]/page.tsx`
- `app/(dashboard)/portal/classes/page.tsx`
- `app/(dashboard)/portal/attendance/page.tsx`
- `app/(dashboard)/portal/finance/page.tsx`
- `app/(dashboard)/portal/events/page.tsx`
- `app/(dashboard)/portal/upcoming-events/page.tsx`
- `components/parent-portal/parent-portal-ui.tsx`
- `features/parent-portal/types.ts`
- `lib/dashboard/data.ts`
- `services/parent-portal/parent-portal-service.ts`
- `supabase/migrations/202606200010_parent_portal_readonly.sql`

## Verification Results

- Parent navigation restrictions: Mostly correct. Parent navigation is limited to Dashboard and `/portal/*` read-only destinations.
- Parent page access controls: Correct at page level. Portal pages redirect non-parent roles to `/access-denied`.
- Parent-scoped service queries: Mostly correct. Queries are scoped by parent record, linked children, family invoices, payments, and event bookings.
- Parent-scoped RLS policies: Needs fixing. Policies are ownership-scoped by row, but not safe by column exposure.
- Own-child ownership enforcement: Correct in the service and helper functions for linked active children.
- Own-family finance visibility: Correct in service queries and row ownership checks.
- Own-child attendance visibility: Mostly correct for submitted/reviewed/locked sessions, but column exposure needs tightening.
- Own-child event booking visibility: Correct for linked parent/student bookings, with row ownership checks.
- Prevention of unrelated family data access: Correct by row ownership, subject to the base-table column exposure blocker below.
- Mobile responsiveness: Good. Portal cards and sections use responsive grid layouts and stack appropriately.
- Premium Boutique Dashboard v2 consistency: Good. The portal uses existing premium cards, spacing, navy/gold styling, and calm parent-facing copy.

## Command Results

- `npm run lint`: Passed
- `npm run type-check`: Passed
- `npm run build`: Passed

## Blockers

1. Parent RLS policies expose full base-table rows instead of parent-safe columns.

   The Phase 11 plan says parents must never see internal notes, audit metadata, management fields, or teacher-only data. The migration adds parent SELECT policies directly to base tables such as `students`, `teachers`, `attendance_records`, `invoices`, and `event_bookings`. This correctly restricts rows to the parent's family, but it does not restrict columns.

   Examples:

   - `students_parent_portal_select_own_child` allows parent SELECT on child rows in `students`, while the students table contains fields such as `medical_notes`, `emergency_notes`, and audit columns.
   - `teachers_parent_portal_select_child_teachers` allows parent SELECT on teacher rows, while the teachers table contains operational fields such as `teacher_number`, `email`, `phone`, `qualifications`, `availability_notes`, and audit columns.
   - `attendance_records_parent_portal_select_own_child` allows parent SELECT on attendance record rows, while the table includes `notes`, `created_by`, and `updated_by`.
   - Finance and event booking base-table policies expose operational notes and audit metadata if queried directly through Supabase.

   The visible UI selects a safer subset, but a parent-authenticated client can still query any column allowed by table SELECT. Fix this before approval by using parent-safe views/RPCs with limited columns, or by applying a column privilege strategy that prevents parent roles from selecting sensitive base-table columns.

## Important Issues

1. Parent portal attendance service loads raw attendance notes.

   `services/parent-portal/parent-portal-service.ts` selects `attendance_records.notes` and carries it in the portal attendance type. The current UI does not render the notes, but the Phase 11 plan only allows parent-safe notes if explicitly approved for parent visibility. Until a parent-visible note field or approval flag exists, the portal service should avoid selecting and returning raw attendance notes.

2. Parent portal finance service loads invoice notes.

   The finance service selects `invoices.notes` and maps it into parent portal invoice data. If invoice notes are operational/internal, this conflicts with the plan's hidden-field rule. Either confirm invoice notes are parent-facing by definition or omit them from the parent portal response until a parent-visible billing note field exists.

## Medium Issues

1. `/portal/*` routes are protected by the dashboard layout and page-level role checks, but not by the middleware protected-route prefix.

   `protectedRoutePrefixes` currently includes `/dashboard`. The dashboard layout still calls `requireUserProfile()`, so unauthenticated portal access is blocked at render time. Adding `/portal` to protected prefixes would make middleware behavior more explicit and consistent for Phase 11 routes.

2. Parent portal pages repeatedly load the full portal dataset.

   Most portal pages call `getParentPortalData()`, which loads children, classes, attendance, finance, and event bookings even when a page only needs one slice. This is acceptable for MVP placeholder scale, but it should be split into focused read models before larger production datasets.

3. Class access helper does not filter enrolment status.

   `parent_can_access_class()` checks linked, non-deleted enrolments, but does not require an active parent-visible enrolment status. If archived or inactive enrolments remain with `deleted_at is null`, parents may retain class visibility longer than intended.

## Minor Issues

1. Parent sidebar active state is static.

   The parent Dashboard navigation item is always marked active in `lib/dashboard/data.ts`, even when the parent is viewing `/portal/children`, `/portal/finance`, or other portal pages. This is visual only, but it makes the current location less clear.

2. Child detail layout uses nested premium card/list sections.

   The child summary page is readable and responsive, but some nested card areas feel heavier than the Premium Boutique Dashboard v2 style. This is not a functional issue.

## Positive Findings

- Parent Portal is read-only in the UI; no write forms, payment workflows, booking requests, or mutation actions were introduced.
- Non-parent users are redirected away from parent portal pages.
- Parent navigation does not expose management modules.
- Child detail lookup returns `notFound()` for children outside the parent's linked family dataset.
- Finance data is scoped to the parent and linked children.
- Event bookings are scoped to parent/student relationships and visible bookings.
- Attendance display is limited to submitted, reviewed, or locked sessions.
- Mobile layouts use responsive grids and card stacks.
- The portal follows the Premium Boutique Dashboard v2 visual language.

## Approval Decision

Phase 11 requires fixes before approval.

The implementation is close, and all validation commands pass, but the base-table RLS exposure is a security blocker for a parent-facing portal. Once parent access is restricted to parent-safe columns and raw internal notes are removed or explicitly marked parent-visible, Phase 11 can be reviewed again for approval.
