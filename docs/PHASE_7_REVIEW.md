# Little London Management System

# PHASE_7_REVIEW.md

Version: 1.0

---

# Purpose

This document reviews the completed ROADMAP Phase 7 implementation for Courses, Classes, Student Enrolments, and Teacher Assignments.

Reviewed source documents:

- `docs/ROADMAP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_REQUIREMENTS.md`
- `docs/PERMISSIONS.md`
- `docs/PHASE_7_COMPLETION_REPORT.md`

No new features were built during this review.

---

# Commands Run

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run type-check` | Passed |
| `npm run build` | Passed |

Build verification:

- Next.js compiled successfully.
- Course routes compiled successfully.
- Class routes compiled successfully.
- Existing dashboard, authentication, student, parent, and teacher routes continued to compile.
- Middleware compiled successfully.

---

# Review Summary

Phase 7 is functionally implemented and passes the required project checks.

The implementation provides:

- Course list, create, detail, edit, archive, and restore flows.
- Class list, create, detail, edit, archive, and restore flows.
- Teacher assignment and removal on class detail pages.
- Student enrolment and removal on class detail pages.
- Class roster display.
- Capacity checks in the application service.
- Student profile enrolment display for management users.
- Supabase migration for `courses`, `classes`, `class_teachers`, and `student_enrolments`.
- RLS policies for management users and teacher assigned-class reads.
- Navigation integration for Courses and Classes.
- Academic dashboard widgets.

Phase 8 Attendance can begin from an application foundation perspective, but the issues below should be handled before production release and should be considered while designing Attendance.

---

# What Is Correct

## 1. Course List / Create / Edit / Archive / Restore

Status: Correct.

Implemented routes:

- `/courses`
- `/courses/new`
- `/courses/[courseId]`
- `/courses/[courseId]/edit`

Verified behavior:

- Management users can list courses.
- Management users can create and edit courses.
- Course status can be changed to `active`, `inactive`, or `archived`.
- Archiving sets `deleted_at` and `deleted_by`.
- Restoring by changing status back to `active` or `inactive` clears `deleted_at` and `deleted_by`.
- Normal lists exclude archived courses unless the Archived filter is selected.
- Archived course details remain viewable by Super Admin/Admin.

Relevant files:

- `app/(dashboard)/courses/page.tsx`
- `app/(dashboard)/courses/[courseId]/page.tsx`
- `app/(dashboard)/courses/[courseId]/edit/page.tsx`
- `components/academic/course-form.tsx`
- `components/academic/status-form.tsx`
- `services/academic/academic-service.ts`

## 2. Class List / Create / Edit / Archive / Restore

Status: Correct.

Implemented routes:

- `/classes`
- `/classes/new`
- `/classes/[classId]`
- `/classes/[classId]/edit`

Verified behavior:

- Management users can list classes.
- Management users can create and edit classes.
- Class status can be changed to `active`, `inactive`, or `archived`.
- Archiving sets `deleted_at` and `deleted_by`.
- Restoring by changing status back to `active` or `inactive` clears `deleted_at` and `deleted_by`.
- Normal lists exclude archived classes unless the Archived filter is selected.
- Archived class details remain viewable by Super Admin/Admin.

Relevant files:

- `app/(dashboard)/classes/page.tsx`
- `app/(dashboard)/classes/[classId]/page.tsx`
- `app/(dashboard)/classes/[classId]/edit/page.tsx`
- `components/academic/class-form.tsx`
- `components/academic/status-form.tsx`
- `services/academic/academic-service.ts`

## 3. Teacher Assignment To Classes

Status: Correct for Phase 7.

Implemented:

- Assign teacher to class.
- Remove teacher assignment by soft deletion.
- View assigned teachers on class detail.
- Assignment roles: `lead`, `assistant`, `substitute`.
- Duplicate active teacher/class assignments are prevented by a partial unique index.

Relevant files:

- `components/academic/class-management-panel.tsx`
- `features/academic/actions.ts`
- `services/academic/academic-service.ts`
- `supabase/migrations/202606200006_courses_classes_enrolments.sql`

## 4. Student Enrolment Into Classes

Status: Correct for Phase 7.

Implemented:

- Enrol active students into classes.
- Remove students from classes by setting enrolment status to `withdrawn` and soft-deleting the enrolment row.
- View active class roster.
- Prevent duplicate active student/class enrolments with a partial unique index.

Relevant files:

- `components/academic/class-management-panel.tsx`
- `features/academic/actions.ts`
- `services/academic/academic-service.ts`
- `supabase/migrations/202606200006_courses_classes_enrolments.sql`

## 5. Class Capacity Rules

Status: Partially correct.

Implemented:

- Class capacity must be greater than zero.
- Enrolment is blocked when a class is already full.
- Class capacity cannot be lowered below the active enrolment count.

Remaining concern:

- Capacity enforcement currently lives in application service logic. This is acceptable for the current admin-only UI, but it is not fully race-safe if two enrolment requests happen at the same time.

## 6. Student Profile Enrolment Display

Status: Correct for management users.

Implemented:

- Student detail pages now display enrolment summary data from `student_enrolments`.
- Enrolment display includes class name, class code, course name, status, and enrolment date.

Relevant files:

- `components/students/student-detail-sections.tsx`
- `features/students/types.ts`
- `services/students/student-service.ts`
- `services/academic/academic-service.ts`

## 7. Supabase Migration

Status: Correct for the explicit Phase 7 brief, with documentation-alignment notes below.

Created migration:

- `supabase/migrations/202606200006_courses_classes_enrolments.sql`

Migration includes:

- `courses`
- `classes`
- `class_teachers`
- `student_enrolments`
- Primary keys.
- Foreign keys.
- Soft delete fields.
- Timestamp fields.
- Status checks.
- Age, capacity, and date-range checks.
- Active uniqueness constraints.
- Useful indexes.
- RLS enabled on every Phase 7 table.
- Management and teacher assigned-read policies.

## 8. Permissions

Status: Correct for Phase 7.

Implemented:

- Super Admin and Admin can manage academic records.
- Teacher can read assigned classes and assigned courses.
- Parent has no academic management access.
- Permission seed includes:
  - `courses.manage.all`
  - `classes.manage.all`
  - `classes.assign.all`
  - `enrolments.manage.all`
  - `courses.view.assigned_classes`
  - `classes.view.assigned_classes`

Relevant files:

- `services/academic/academic-service.ts`
- `supabase/seed/001_auth_roles_permissions.sql`
- `supabase/migrations/202606200006_courses_classes_enrolments.sql`

## 9. RLS Policies

Status: Mostly correct for Phase 7.

Implemented:

- RLS enabled on all four Phase 7 tables.
- Super Admin/Admin management access through permission helpers.
- Teacher read access scoped through active `class_teachers` assignments.
- No Parent management access.

Important note:

- Parent own-child academic read policies are documented in `DATABASE_SCHEMA.md` and `PERMISSIONS.md`, but were intentionally not implemented in Phase 7 because Parent Portal academic views were explicitly out of scope.

## 10. UI Consistency

Status: Correct.

The Phase 7 UI follows the existing Phase 3-6 design direction:

- Premium cards.
- Clean spacing.
- Rounded surfaces.
- Responsive grids.
- Consistent empty and error states.
- Consistent dashboard widget styling.
- Management actions are hidden from Teacher users.

---

# Blockers

No build, lint, or type-check blockers were found.

No blocker prevents Phase 8 Attendance from starting.

---

# Important Issues

## 1. Database Schema Does Not Fully Match `DATABASE_SCHEMA.md`

Severity: Important.

The Phase 7 migration follows the explicit Phase 7 implementation prompt, but it does not fully match the broader implementation-ready schema in `DATABASE_SCHEMA.md`.

Examples:

- `DATABASE_SCHEMA.md` defines `courses.slug`, `course_type`, `age_min_months`, `age_max_months`, `default_capacity`, `default_price`, and `currency`.
- The Phase 7 migration defines `course_code`, `level`, `minimum_age`, and `maximum_age`.
- `DATABASE_SCHEMA.md` defines `classes.code` and optional `room_id`.
- The Phase 7 migration defines `class_code` and does not include `room_id`.
- `DATABASE_SCHEMA.md` defines `class_teachers.branch_id`, `assignment_type`, `start_date`, `end_date`, `status`, and common audit columns.
- The Phase 7 migration defines a lighter `class_teachers` table with `role`, `created_at`, and soft delete fields.
- `DATABASE_SCHEMA.md` uses `enrollments` in several places, while the Phase 7 prompt and migration use `student_enrolments`.

Impact:

- The current app works against the Phase 7 migration.
- Future modules, especially Attendance, Reports, Parent Portal, and Finance, may need schema reconciliation.

Recommendation:

- Before or during Phase 8, decide whether `student_enrolments` is the canonical table name or whether it should be reconciled with the documented `enrollments` model.
- Either update the schema documentation to reflect the implemented Phase 7 table shape, or create a follow-up migration that aligns the implementation with `DATABASE_SCHEMA.md`.

## 2. Audit Logging Is Not Implemented For Phase 7 Mutations

Severity: Important.

`PERMISSIONS.md` and `API_REQUIREMENTS.md` require sensitive mutation actions to be audited, including class assignment and enrolment changes.

Current Phase 7 server actions perform mutations but do not write audit log entries.

Affected workflows:

- Course create/update/archive/restore.
- Class create/update/archive/restore.
- Teacher assignment/removal.
- Student enrolment/removal.

Impact:

- Operational traceability is incomplete.
- Production compliance expectations are not fully met.

Current context:

- The completion report correctly notes that audit logging is pending because the shared `audit_logs` table is not yet introduced.

Recommendation:

- Add audit writes as soon as `audit_logs` exists.
- Phase 8 Attendance should not repeat the same gap if attendance audit tables/logging are introduced in that phase.

## 3. Capacity Enforcement Is Application-Level Only

Severity: Important.

The service prevents enrolment when a class is full, but the database does not enforce capacity.

Impact:

- Two simultaneous enrolment requests could both pass the service-level count check and exceed capacity.
- This is unlikely in the current internal admin-only UI, but it matters once registration conversion, imports, or public booking workflows are added.

Recommendation:

- Add a database-side transactional capacity guard before high-volume workflows are introduced.
- A Supabase RPC, transaction-safe database function, or trigger-based guard would be appropriate.

---

# Medium Issues

## 1. Parent Academic Read Access Is Deferred

Severity: Medium.

The current implementation correctly avoids Parent Portal work because it was explicitly out of scope for Phase 7.

However, the full documentation says Parents should eventually read their own child's courses, classes, and enrolments.

Recommendation:

- Keep Parent management access disabled.
- Add own-child academic read policies and parent-facing views only when Parent Portal academic visibility is intentionally scheduled.

## 2. Search Filters Should Be Hardened

Severity: Medium.

Course and class search use direct PostgREST `or(...)` filter strings.

Impact:

- Search works for normal text.
- Special PostgREST filter characters may produce errors or unexpected filtering.

Recommendation:

- Escape or sanitize PostgREST filter input before production.
- Consider RPC-backed search if global search becomes complex.

## 3. Branch Scope Is Prepared But Not Enforced

Severity: Medium.

The migration includes `branch_id` on courses and classes, but the field is nullable and does not yet reference `branches`.

Impact:

- This is acceptable for the current phased implementation because the branch table is not yet introduced.
- Future multi-branch behavior will require stricter branch constraints and RLS branch checks.

Recommendation:

- Add branch foreign keys and non-null branch requirements when the branch foundation is introduced.
- Avoid creating long-term records without branch IDs.

---

# Minor Issues

## 1. Some Naming Differs From Documentation

Severity: Minor.

Examples:

- The UI and migration use British spelling `enrolments`, while some documentation sections use `enrollments`.
- The migration uses `role` for `class_teachers`, while the schema document uses `assignment_type`.

Recommendation:

- Standardize names before generating Supabase types or writing reporting queries.

## 2. Teacher Academic Dashboard Metrics Are Limited

Severity: Minor.

Teacher metrics currently focus on assigned class count and active enrolments. Course totals and near-capacity counts are not fully teacher-scoped.

Recommendation:

- Expand teacher-specific academic widgets when teacher schedules and sessions are built.

---

# Phase 8 Readiness

Phase 8 Attendance can safely begin from a codebase and build-health perspective.

Conditions to carry into Phase 8:

- Attendance should use the Phase 7 `classes` and `student_enrolments` structures intentionally.
- Attendance design should decide whether sessions are introduced in Phase 8, since detailed timetable/session generation was not built in Phase 7.
- Audit logging should be planned for attendance submit, edit, review, correction, lock, archive, and restore actions.
- Capacity race protection does not block Attendance, but should be fixed before public registration or high-volume enrolment workflows.
- Schema naming should be reconciled before reports, finance, and parent portal depend heavily on enrolment records.

Verdict:

- Phase 8 may begin.
- Phase 7 is approved for continued phased development.
- Phase 7 is not yet production-complete until audit logging, schema reconciliation, and database-level capacity protection are addressed.

---

# Final Status

Phase 7 review is complete.

Required verification commands passed.

No new features were built during this review.
