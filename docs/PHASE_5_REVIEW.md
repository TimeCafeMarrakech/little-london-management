# Little London Management System

# PHASE_5_REVIEW.md

Version: 1.0

---

# Purpose

This document reviews the completed ROADMAP Phase 5 Parent Management implementation against the project documentation.

No application features were added during this review.

---

# Review Inputs

Read and checked:

- `docs/ROADMAP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_REQUIREMENTS.md`
- `docs/PERMISSIONS.md`
- `docs/PHASE_5_COMPLETION_REPORT.md`

Implementation areas reviewed:

- Parent routes under `app/(dashboard)/parents`
- Parent components under `components/parents`
- Parent feature layer under `features/parents`
- Parent service under `services/parents/parent-service.ts`
- Parent migration at `supabase/migrations/202606200003_parent_management.sql`

---

# Command Results

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run type-check` | Passed |
| `npm run build` | Passed |

Build verification:

- Next.js production build completed successfully.
- Parent routes compiled.
- Existing dashboard, authentication, and student routes continued to compile.
- Middleware compiled successfully.

---

# Findings

## High Priority

### 1. Parent portal update RLS is too broad for future direct Supabase access

The migration creates `parents_own_portal_update` on `parents` for any authenticated user whose `parents.user_id = auth.uid()`.

Reference:

- `supabase/migrations/202606200003_parent_management.sql:187`

This allows a linked parent account to update its own row at the table level. Supabase RLS cannot restrict individual columns in this policy, so a direct client could attempt to update operational fields such as `status`, `portal_status`, or other management-owned values unless future API layers prevent direct writes.

This does not currently expose a Parent Portal screen, but it is not aligned with the permissions model, which limits parents to future own-profile/contact workflows.

Recommendation:

- Remove the parent self-update table policy until the Parent Portal is implemented, or replace it later with a controlled RPC/server action pattern for parent-editable contact fields only.

### 2. Parent-student relationship normalization is incomplete as an implementation-ready relationship model

The Phase 5 migration adds a foreign key from `parent_student_relationships.parent_id` to `parents.id` and creates a non-unique active index on `(parent_id, student_id)`.

References:

- `supabase/migrations/202606200003_parent_management.sql:153`
- `supabase/migrations/202606200003_parent_management.sql:159`

The schema documentation expects normalized parent/student relationships to behave as durable links. The current migration does not add a unique active constraint for `(parent_id, student_id)`, and it keeps the older Phase 4 snapshot uniqueness model.

Risk:

- Duplicate active parent-student links can be created later.
- Phase 6 and later modules may rely on relationship integrity that is not fully enforced.

Recommendation:

- Add a partial unique constraint for active normalized links before building workflows that depend on parent-student relationships.
- Keep snapshot columns during transition, but make `parent_id + student_id` the canonical relationship identity going forward.

### 3. Parent create/edit does not provide student linking

The implementation displays linked students from normalized relationships, but parent create/edit does not include child linking or unlinking.

References:

- `app/(dashboard)/parents/new/page.tsx:32`
- `services/parents/parent-service.ts:286`
- `services/parents/parent-service.ts:323`

This is also documented as a known limitation in `PHASE_5_COMPLETION_REPORT.md`.

Risk:

- Existing Phase 4 snapshot relationships can be normalized and displayed.
- Newly created parent records cannot be connected to students from the Parent Management UI.
- The ROADMAP Phase 5 success criteria says parents and students should be linked correctly.

Recommendation:

- Before treating Phase 5 as fully complete, add a scoped relationship management fix in Phase 5 remediation: link existing students to a parent, edit relationship metadata, and prevent duplicate active links.

## Medium Priority

### 4. Branch support is prepared but not enforceable yet

The `parents` table includes `branch_id`, but it is nullable and has no foreign key because the `branches` table is not yet introduced.

Reference:

- `supabase/migrations/202606200003_parent_management.sql:10`

This matches the current phased implementation, but it remains weaker than the future multi-branch schema described in `DATABASE_SCHEMA.md`.

Recommendation:

- Track this as a future multi-branch migration item.
- When branches are introduced, backfill `parents.branch_id`, make it required where appropriate, and add branch-scoped RLS.

### 5. Relationship normalization may match by full name when email and phone are unavailable

The migration reconciles Phase 4 parent snapshots by email first, phone second, and full name last.

Risk:

- Full-name matching can merge separate people with the same name when contact details are missing.

Recommendation:

- Keep a post-migration review query in the setup notes to identify relationships linked by name-only matching.
- Prefer manual reconciliation for ambiguous records.

### 6. Search query should be hardened before production use

Parent list search uses a Supabase `.or(...)` filter built from the raw query string.

Reference:

- `services/parents/parent-service.ts:124`

This works for normal input, but special characters used by PostgREST filter syntax can produce unexpected query behavior.

Recommendation:

- Escape or constrain search input before interpolating it into Supabase filter expressions.

### 7. Audit logging is still pending

Parent create, edit, archive, and restore actions do not write to `audit_logs`.

This is consistent with the current implementation because the audit table is not yet available, but it remains a requirement in the broader documentation.

Recommendation:

- Add audit log writes once the shared `audit_logs` table is introduced.

---

# What Is Correct

## Parent List

Implemented and aligned with Phase 5 scope:

- `/parents` route exists.
- Parent cards are displayed from Supabase data.
- Search is available for name, email, and phone.
- Status and portal status filters are available.
- Sorting is available.
- Empty, loading, and database-not-ready states are present.
- Normal active lists exclude archived parents.
- Archived parents appear when the Archived filter is selected.

## Parent Detail

Implemented and aligned with Phase 5 scope:

- `/parents/[parentId]` route exists.
- Parent contact details are shown.
- Address details are shown.
- Linked students are displayed from `parent_student_relationships.parent_id`.
- Management users can access archived parent detail pages.

## Parent Create/Edit

Implemented:

- `/parents/new` route exists.
- `/parents/[parentId]/edit` route exists.
- Forms use server actions.
- Forms use Zod validation.
- Management permission checks are enforced.
- Friendly validation and mutation errors are surfaced.

Missing:

- Direct student link/unlink management is not available yet.

## Parent Archive/Restore

Implemented correctly:

- Archive sets `status = 'archived'`, `deleted_at`, and `deleted_by`.
- Restore sets active or inactive status and clears `deleted_at` and `deleted_by`.
- Archived records remain viewable by Super Admin/Admin.
- Active lists exclude archived records by default.

## Supabase Migration

Implemented:

- `parents` table.
- Primary key.
- Soft delete fields.
- Audit timestamp fields.
- Operational indexes.
- Unique active email constraint.
- Unique active user profile constraint.
- RLS enabled on `parents`.
- Parent management RLS policy.
- Teacher placeholder read policy.
- Future parent portal read/update policies.
- Foreign key from `parent_student_relationships.parent_id` to `parents.id`.
- Phase 4 snapshot normalization into parent records.

Needs fixing:

- Parent self-update RLS is too broad.
- Normalized relationship uniqueness is not fully enforced.
- Branch relationship is still placeholder only.

## Phase 4 Relationship Normalization

Implemented:

- Phase 4 snapshot parent data is converted into normalized `parents` rows.
- Existing `parent_student_relationships` rows are updated with `parent_id`.
- Snapshot fields are preserved for transition safety.

Needs attention:

- Name-only reconciliation can be ambiguous.
- Relationship uniqueness should be tightened before relying on links for future modules.

## Permissions

Implemented at application level:

- Super Admin: full parent management access.
- Admin: full parent management access.
- Teacher: placeholder read-only parent contact visibility.
- Parent: no management module access; future own-portal placeholder only.

Needs attention:

- Table-level RLS for parent self-update should be restricted or removed until portal-specific field controls exist.

## UI Consistency

The Parent Management UI is consistent with the existing Phase 3 and Phase 4 direction:

- Premium card-based dashboard style.
- Clean spacing and restrained color usage.
- Responsive list and form layouts.
- Friendly empty and error states.
- No unrelated modules were built.

---

# Phase 6 Readiness

Phase 6 should not start safely until the Phase 5 blockers are resolved.

Required before Phase 6:

- Remove or narrow the `parents_own_portal_update` RLS policy.
- Add normalized parent-student relationship uniqueness.
- Decide whether parent-student linking must be remediated in Phase 5 before Teacher Management begins.

After those fixes, Phase 6 can begin with lower risk.

---

# Final Review Status

Phase 5 is build-stable and mostly complete from a UI and service perspective.

However, it is not fully implementation-ready according to the documentation because parent portal RLS is too broad and normalized parent-student relationship integrity is not fully enforced.
