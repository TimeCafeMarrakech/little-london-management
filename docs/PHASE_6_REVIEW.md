# Little London Management System

# PHASE_6_REVIEW.md

Version: 1.0

---

# Purpose

This document reviews the completed ROADMAP Phase 6 Teacher Management implementation against the project documentation.

No new features were built during this review.

---

# Review Inputs

Read and checked:

- `docs/ROADMAP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_REQUIREMENTS.md`
- `docs/PERMISSIONS.md`
- `docs/PHASE_6_COMPLETION_REPORT.md`

Implementation areas reviewed:

- Teacher routes under `app/(dashboard)/teachers`
- Teacher components under `components/teachers`
- Teacher feature layer under `features/teachers`
- Teacher service under `services/teachers/teacher-service.ts`
- Teacher migration at `supabase/migrations/202606200005_teacher_management.sql`
- Dashboard navigation in `lib/dashboard/data.ts`

---

# Command Results

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run type-check` | Passed |
| `npm run build` | Passed |

Build verification:

- Next.js production build completed successfully.
- Teacher routes compiled.
- Existing Student, Parent, Dashboard, and Authentication routes continued to compile.
- Middleware compiled successfully.

---

# Findings

## Blockers

No build or runtime-blocking issues were found that prevent Phase 7 from starting.

Phase 7 can begin safely for Courses and Classes, provided the Phase 6 migration is applied first.

## Important Issues

### 1. Teacher number uniqueness is not branch-ready

The schema documentation specifies teacher number uniqueness by branch. The migration currently creates a global active unique index on `teacher_number`.

Reference:

- `supabase/migrations/202606200005_teacher_management.sql:37`

Risk:

- This is acceptable for the current single-branch MVP, but it will block duplicate teacher numbers across future branches.

Recommendation:

- When branch support is introduced, replace the global active teacher number uniqueness with a branch-scoped active unique index on `(branch_id, teacher_number)`.

### 2. Teacher own-profile access depends on manual `user_id` linking

Teacher users can read only rows where `teachers.user_id = auth.uid()`.

References:

- `services/teachers/teacher-service.ts:70`
- `services/teachers/teacher-service.ts:185`
- `supabase/migrations/202606200005_teacher_management.sql:73`

This is secure, but the Teacher Management UI does not let management link a teacher profile to an existing auth user. The completion report correctly documents that linking remains manual.

Risk:

- A teacher login will not see an own profile unless `teachers.user_id` is manually populated.

Recommendation:

- Address this in User Management/Auth provisioning or a focused teacher-account linking fix before relying on teacher self-service workflows.

### 3. RLS management policy is whole-school and permission-only

The `teachers_management_all` RLS policy grants full table access to any authenticated user with `teachers.manage.all`.

Reference:

- `supabase/migrations/202606200005_teacher_management.sql:64`

This matches the current Super Admin/Admin permission seed, but it does not include branch scoping because the branch table is not yet implemented.

Risk:

- Fine for current single-branch MVP.
- Needs tightening before multi-branch support.

Recommendation:

- When branch support lands, add branch-aware policy checks and ensure only intended management roles receive `teachers.manage.all`.

## Medium Issues

### 4. Search query should be hardened before production use

Teacher search uses a Supabase `.or(...)` filter built from the raw query string.

Reference:

- `services/teachers/teacher-service.ts:115`

This works for normal input, but special characters used by PostgREST filter syntax can create unexpected query behavior.

Recommendation:

- Escape or constrain search input before interpolating it into Supabase filter expressions.

### 5. Update and status actions do not verify that a row was changed

Teacher update and archive/restore actions check Supabase errors, but they do not verify that the target row existed or was updated.

References:

- `services/teachers/teacher-service.ts:244`
- `services/teachers/teacher-service.ts:277`

Risk:

- A stale or invalid teacher ID could produce a successful action path without changing a record.

Recommendation:

- Use a returning select or count check for update/status mutations and surface a friendly not-found error.

### 6. Audit logging is still pending

Teacher create, edit, archive, and restore actions do not write to `audit_logs`.

This is consistent with earlier phases because the shared `audit_logs` table has not been introduced yet, but the documentation requires audit logging for teacher mutations.

Recommendation:

- Add audit log writes once the shared `audit_logs` table is available.

## Minor Issues

### 7. Profile photo field is deferred

`DATABASE_SCHEMA.md` includes `profile_photo_document_id` for teachers, but the Phase 6 migration does not include it.

This is acceptable while the Documents/Storage module is still future scope.

Recommendation:

- Add teacher profile photo metadata when the Documents module is implemented.

### 8. Teacher own-profile edit is intentionally not implemented

`PERMISSIONS.md` describes teacher own-profile view/edit access, while the Phase 6 request limited teachers to read-only own profile access.

The implementation follows the Phase 6 request. This should be revisited when teacher self-service profile workflows are approved.

---

# Checklist Review

## 1. Teacher List

Status: Correct.

Implemented:

- `/teachers` route exists.
- Super Admin/Admin can view teacher lists.
- Teacher users can view a one-card own-profile list when linked by `user_id`.
- Parent users are blocked.
- Loading, empty, and database-not-ready error states exist.
- Cards are responsive and consistent with Student/Parent modules.

## 2. Teacher Create/Edit

Status: Mostly correct.

Implemented:

- `/teachers/new`
- `/teachers/[teacherId]/edit`
- Zod validation.
- Server actions.
- Permission checks for Super Admin/Admin only.
- Friendly duplicate error handling.

Needs attention:

- No auth-user linking field for `teachers.user_id`.
- Mutations do not verify affected rows.

## 3. Teacher Archive/Restore

Status: Correct.

Implemented:

- Archive sets `status = 'archived'`, `deleted_at`, and `deleted_by`.
- Restore clears `deleted_at` and `deleted_by` when returning to active/inactive.
- Archived teachers appear under Archived filter.
- Active lists exclude archived soft-deleted teachers.
- Management can view archived teacher detail.

## 4. Teacher Own-Profile Access

Status: Correct within current Phase 6 scope.

Implemented:

- Teacher users can read only their own linked teacher row.
- Teacher users cannot create, edit, archive, restore, or list all teachers.
- RLS also protects own-profile reads by `user_id = auth.uid()`.

Limitation:

- Requires manual `user_id` linking until User Management or account provisioning exists.

## 5. Supabase Migration

Status: Mostly correct.

Implemented:

- `teachers` table.
- Core columns requested for Phase 6.
- Soft delete fields.
- Audit timestamp fields.
- Indexes.
- Check constraints.
- Unique active constraints.
- Timestamp trigger.
- RLS policies.

Needs attention:

- `teacher_number` uniqueness is global rather than branch-scoped.
- `branch_id` remains nullable with no FK because branches are not yet implemented.

## 6. Permissions

Status: Correct for current scope.

Implemented:

- Super Admin/Admin use `teachers.manage.all`.
- Teacher users have own-profile read only.
- Parent users have no Teacher Management access.
- Server actions enforce management-only mutation access.

## 7. RLS Policies

Status: Correct for current single-branch scope, with future tightening needed.

Implemented:

- RLS enabled on `teachers`.
- Management policy for users with `teachers.manage.all`.
- Teacher own-profile select policy.
- No parent policy, matching the Phase 6 request.

Future concern:

- Branch scoping and parent child-teacher visibility must be added in later phases.

## 8. UI Consistency

Status: Correct.

The teacher module follows the established Phase 3-5 visual language:

- Premium cards.
- Clean spacing.
- Responsive layouts.
- Consistent form structure.
- Consistent empty and error states.
- No dense ERP-style tables.

## 9. Search And Filters

Status: Functional with one hardening recommendation.

Implemented:

- Search by name, teacher number, email, and phone.
- Status filter.
- Employment type filter.
- Sort and direction controls.

Needs attention:

- Search input should be escaped or constrained before being interpolated into PostgREST `.or(...)`.

## 10. Phase 7 Readiness

Status: Phase 7 can begin safely.

Reasoning:

- Teacher records exist and are stable enough for Courses and Classes to reference.
- Teacher IDs are durable UUIDs.
- Archive/restore behavior preserves history.
- Management permissions are in place.
- Build, lint, and type-check pass.

Recommended before or during Phase 7:

- Apply `202606200005_teacher_management.sql` to the active Supabase project.
- Ensure Phase 7 class-teacher assignment tables reference `teachers.id`.
- Keep `teachers.user_id` linking as a known account-provisioning dependency.
- Plan branch-scoped uniqueness and RLS for future multi-branch support.

---

# Final Review Status

Phase 6 Teacher Management is build-stable and meets the current Phase 6 scope.

No blockers were found for starting Phase 7. The important issues are mostly future-readiness and hardening items, not blockers for the next Courses and Classes phase.
