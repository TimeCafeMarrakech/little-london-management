# Little London Management System

# PHASE_4_REVIEW.md

Version: 1.0

---

# Purpose

This document reviews the completed ROADMAP Phase 4 Student Management implementation against:

- `ROADMAP.md`
- `DATABASE_SCHEMA.md`
- `API_REQUIREMENTS.md`
- `PERMISSIONS.md`
- `PHASE_4_COMPLETION_REPORT.md`

No new features were built during this review.

---

# Command Results

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run type-check` | Passed |
| `npm run build` | Passed |

Build result:

- Next.js compiled successfully.
- Student routes compiled successfully:
  - `/students`
  - `/students/[studentId]`
  - `/students/[studentId]/edit`
  - `/students/new`

---

# Review Findings

## Blockers

### 1. Archived students cannot be listed, viewed, or restored

Severity: High

Status management sets `deleted_at` when a student is archived in `services/students/student-service.ts:453`, but list and detail queries exclude rows where `deleted_at` is not null:

- List query excludes archived soft-deleted rows: `services/students/student-service.ts:127`
- Detail query excludes archived soft-deleted rows: `services/students/student-service.ts:224`
- Update query also excludes soft-deleted rows: `services/students/student-service.ts:428`

Impact:

- The Archived filter cannot show archived students.
- The detail page returns not found after archive.
- Restore cannot work because archived rows are hidden from the detail/status workflow.

This conflicts with the documented soft delete and restore model in `DATABASE_SCHEMA.md`.

Recommendation:

- Adjust list/detail/status queries to intentionally include archived rows when the user has management permission and the action/filter requires archived access.
- Keep normal default lists excluding archived records.
- Add a clear restore path that sets `deleted_at = null`, `deleted_by = null`, and status back to `active` or `inactive`.

### 2. Related-record writes ignore Supabase errors

Severity: High

The helper `syncStudentRelatedRecords` inserts or upserts related rows, but it does not inspect returned `error` values:

- Parent relationship insert: `services/students/student-service.ts:470`
- Emergency contact insert: `services/students/student-service.ts:486`
- Medical profile upsert: `services/students/student-service.ts:498`
- Allergy insert: `services/students/student-service.ts:514`
- Status history insert is also not checked: `services/students/student-service.ts:534`

Impact:

- Student create/edit can appear successful even when parent, emergency, allergy, medical, or status-history records fail.
- Partial student records can be created.
- Duplicate or constraint errors may be silently missed.

Recommendation:

- Check every Supabase mutation response.
- Use a transaction/RPC for multi-table student create/update once Supabase SQL functions are introduced, or manually fail the action if any dependent insert fails.
- Surface friendly validation/conflict errors to the form.

### 3. Phase 4 relationship schema will need rework before Phase 5 Parent Management

Severity: High

The migration creates `parent_student_relationships.parent_id` as nullable without a foreign key because the `parents` table is not yet implemented (`supabase/migrations/202606200002_student_management.sql:50`). The table also requires snapshot fields such as `parent_full_name`, while `DATABASE_SCHEMA.md` expects a normalized relationship between `parents` and `students`.

Impact:

- Phase 5 will need to reconcile snapshot relationships with real parent records.
- Existing Phase 4 rows may need a data migration to link snapshots to new parent IDs.
- The current uniqueness rule is snapshot-based rather than the documented active `(parent_id, student_id)` relationship.

Recommendation:

- Before Phase 5 starts, decide whether Phase 4 snapshot rows are temporary intake data or the permanent relationship table.
- Add a migration plan for converting snapshot relationships into normalized parent links.

## Important Issues

### 4. Migration differs from the source-of-truth schema

Severity: Medium

The source schema expects branch-scoped operational tables and normalized relationship constraints. The Phase 4 migration intentionally leaves some items future-ready but incomplete:

- `students.branch_id` is nullable and has no branch FK: `supabase/migrations/202606200002_student_management.sql:10`
- `parent_student_relationships.parent_id` has no parent FK: `supabase/migrations/202606200002_student_management.sql:50`
- The implemented emergency table is `emergency_contacts`, while `DATABASE_SCHEMA.md` defines `student_emergency_contacts`.
- Related student tables do not include `branch_id`, although the database design calls for branch-ready operational records.

Impact:

- This is acceptable only as a short-lived MVP compromise.
- Future branch support and Phase 5 parent linking will require corrective migrations.

Recommendation:

- Align naming and branch columns before the schema grows further.
- If `emergency_contacts` remains the chosen name, update documentation later through an explicit documentation task.

### 5. Teacher assigned-student access is only a hardcoded placeholder

Severity: Medium

The RLS policy for teacher student select includes `and false` (`supabase/migrations/202606200002_student_management.sql:233`), and the service returns an empty teacher result set.

Impact:

- Teachers cannot read any assigned students yet.
- This matches the completion report's stated placeholder limitation, but it does not yet satisfy real assigned-student access from `PERMISSIONS.md`.

Recommendation:

- Keep this as a documented limitation until classes/enrollments/class-teacher assignment tables exist.
- Phase 7 must replace this with real assignment-based helper functions and policies.

### 6. Audit log behavior is missing

Severity: Medium

`DATABASE_SCHEMA.md` and `API_REQUIREMENTS.md` require student create/update/archive/restore to be audited. Phase 4 does not insert audit log rows because `audit_logs` is not currently migrated.

Impact:

- Student mutations are not fully compliant with the audit requirement.
- Status history exists, but it is not a substitute for global audit logs.

Recommendation:

- Add `audit_logs` before production-sensitive workflows.
- Backfill Server Actions to create audit entries once the audit table exists.

### 7. Student service uses an untyped Supabase boundary

Severity: Medium

`services/students/student-service.ts:41` casts the typed Supabase client to a generic `SupabaseClient`.

Impact:

- Type safety is weaker for student database calls.
- This was documented as a workaround, but it should not remain long term.

Recommendation:

- Replace handcrafted table types with generated Supabase CLI database types.
- Remove the generic client cast after generated types are available.

## Minor Issues

### 8. Navigation active state is static

Severity: Low

Dashboard navigation keeps Overview marked active even when `/students` is open.

Impact:

- UI works, but active navigation state is misleading.

Recommendation:

- Make navigation active state path-aware in a future shell refinement.

---

# Checklist Review

## 1. Student List

Status: Partially complete

Correct:

- `/students` exists.
- Supabase-backed list query exists.
- Search, status filter, sorting, pagination metadata, loading, empty, and error states exist.
- Student cards are responsive and visually aligned with the Phase 3 shell.

Needs fixing:

- Archived students cannot be listed because soft-deleted rows are always filtered out.
- Search uses a dynamic `or` filter string; current inputs are validated as strings, but escaping/sanitizing should be reviewed before production.

## 2. Student Create/Edit

Status: Partially complete

Correct:

- Create and edit pages exist.
- Server Actions exist.
- Zod validation exists.
- Management-only permission checks exist.
- Core profile, medical, emergency, allergy, and parent snapshot fields are represented.

Needs fixing:

- Related-record mutation errors are ignored.
- Editing inserts new related rows instead of clearly updating existing first parent/contact/allergy records.
- Multi-table create/update is not atomic.

## 3. Student Status Management

Status: Blocked

Correct:

- Status management UI exists.
- Status history table exists.
- Status update action exists.

Needs fixing:

- Archive hides the student from detail/list workflows.
- Restore cannot reliably work.
- Status history insert errors are not checked.

## 4. Supabase Migration

Status: Partially complete

Correct:

- Required Phase 4 student tables were created.
- Primary keys, core constraints, indexes, soft delete columns, timestamp triggers, and RLS enablement exist.
- Future branch notes are documented in comments.

Needs fixing:

- Schema differs from `DATABASE_SCHEMA.md` in branch scope, parent relationship normalization, and emergency contact naming.
- Phase 5 will require a parent-linking migration strategy.

## 5. Permissions

Status: Mostly correct for Phase 4 MVP

Correct:

- Super Admin and Admin can manage students.
- Teacher access is restricted to a read-only placeholder.
- Parent access is blocked from the management module.
- Server Actions and services check permissions.

Needs fixing:

- Real teacher assigned-student and parent own-child rules remain future work.

## 6. RLS Policies

Status: Partially complete

Correct:

- RLS is enabled on all Phase 4 tables.
- Management policies exist.
- Parent users do not receive management access.

Needs fixing:

- Teacher policy is intentionally non-functional.
- Branch scope is not enforced.
- Restore/archive visibility needs dedicated policy/query handling.

## 7. UI Consistency

Status: Good

Correct:

- UI follows the premium card-based Phase 3 style.
- Forms use clear grouping.
- Empty and error states are present.
- Responsive layouts are present.

Needs fixing:

- Navigation active state should become route-aware.

## 8. Search And Filters

Status: Mostly complete

Correct:

- Search and status filters exist.
- Sort options exist.

Needs fixing:

- Archived filter currently cannot show archived records.
- Search escaping should be hardened before production.

## 9. Whether Phase 5 Can Safely Begin

Status: Not yet

Phase 5 should not safely begin until the Phase 4 blockers are fixed or explicitly accepted with a migration plan.

Required before Phase 5:

- Fix archive/restore visibility.
- Handle related-record mutation errors.
- Decide how Phase 4 parent snapshots convert into real Phase 5 parent records.
- Align `parent_student_relationships` with the normalized parent schema or document the transition migration.

---

# Final Verdict

Phase 4 compiles and passes lint, type-check, and production build.

However, Phase 4 is not fully ready for Phase 5 because archive/restore behavior is broken and parent relationship storage needs a clear normalization path before Parent Management begins.
