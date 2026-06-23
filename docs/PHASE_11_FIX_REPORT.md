# Phase 11 Fix Report

## Purpose

This report documents the Phase 11 Parent Portal MVP fixes completed after `docs/PHASE_11_REVIEW.md`.

Scope was limited to review blockers and important issues only. No new features, write workflows, messaging, payments, reports, notifications, downloads, or Parent Portal mutations were added.

## What Was Fixed

### 1. Parent Base-Table Column Exposure

Added a security-fix migration:

- `supabase/migrations/202606200011_parent_portal_security_fix.sql`

The migration:

- Drops direct parent SELECT policies from sensitive base tables.
- Drops the earlier `parents_own_portal_read` base-table policy.
- Replaces parent base-table access with parent-safe read views.
- Grants parents access only to limited portal-safe columns.
- Excludes internal notes, medical notes, emergency notes, audit fields, management-only fields, teacher operational fields, attendance internal notes, and invoice internal notes from parent-facing read surfaces.

Parent-safe views added:

- `parent_portal_parents`
- `parent_portal_relationships`
- `parent_portal_students`
- `parent_portal_enrolments`
- `parent_portal_classes`
- `parent_portal_courses`
- `parent_portal_class_teachers`
- `parent_portal_teachers`
- `parent_portal_attendance_sessions`
- `parent_portal_attendance_records`
- `parent_portal_invoices`
- `parent_portal_invoice_items`
- `parent_portal_payments`
- `parent_portal_payment_allocations`
- `parent_portal_event_types`
- `parent_portal_events`
- `parent_portal_event_bookings`

### 2. Raw Attendance Notes Removed

Updated the Parent Portal service and types so attendance notes are no longer selected, mapped, or exposed through parent portal responses.

### 3. Invoice Notes Removed

Updated the Parent Portal service and types so invoice notes are no longer selected, mapped, or exposed through parent portal responses.

### 4. `/portal` Middleware Protection Added

Updated protected route prefixes so `/portal` routes are explicitly protected by middleware as well as by the existing dashboard layout and page-level role guards.

### 5. Active Enrolment Visibility Tightened

Updated `parent_can_access_class()` and parent-safe enrolment/class views so parent class visibility is based on active, non-deleted enrolments only.

## Files Modified

- `features/parent-portal/types.ts`
- `lib/auth/routes.ts`
- `services/parent-portal/parent-portal-service.ts`

## Files Created

- `supabase/migrations/202606200011_parent_portal_security_fix.sql`
- `docs/PHASE_11_FIX_REPORT.md`

## Command Results

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

Note: the first build attempt compiled successfully but exceeded the initial tool timeout while finishing static generation. The build was rerun with a longer timeout and completed successfully.

## Remaining Notes

- Parent Portal remains read-only.
- No parent write permissions or workflows were added.
- Parent-facing reads now use safe views instead of direct parent access to sensitive base tables.
- Management modules continue to use their existing access model.
