# Phase 10 Review - Workshops, Holiday Camps & Events

Date: 2026-06-22

Status: Reviewed

Review scope:

- `docs/ROADMAP.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_REQUIREMENTS.md`
- `docs/PERMISSIONS.md`
- `docs/PHASE_10_COMPLETION_REPORT.md`
- Phase 10 implementation files

Commands run:

- `npm.cmd run lint` - Passed
- `npm.cmd run type-check` - Passed
- `npm.cmd run build` - Passed

PowerShell blocks the direct `npm` shim on this machine, so the equivalent Windows npm shim was used.

---

## Summary

Phase 10 is substantially implemented and the project remains healthy from a lint, type-check, and production build perspective.

The implementation includes event types, events, bookings, staff assignments, dashboard widgets, route pages, server actions, validation, permission checks, RLS policies, and database functions for booking and cancellation.

However, Phase 11 Parent Portal should not begin until the blocker below is fixed. The current event booking database function allows an existing invoice ID to be attached to an event booking without proving that the invoice belongs to the same parent and student.

---

## Review Checklist

| Area | Result | Notes |
| --- | --- | --- |
| Event creation | Passed | `/events/new` exists, validates input, checks management permissions, and writes through server actions. |
| Event editing | Passed | `/events/[eventId]/edit` exists and is restricted to event managers. Capacity cannot be reduced below active bookings. |
| Event archiving | Passed with note | Archiving is handled through the event status and soft delete fields. Restore is implicit by changing status away from archived. |
| Event booking | Passed with blocker | Booking is implemented through `book_event_student`, but invoice ownership is not verified. |
| Duplicate booking prevention | Passed | Database unique index and RPC checks prevent duplicate active bookings for the same student/event. |
| Capacity protection | Passed | The booking function locks the event row and checks active booking count before insert. |
| Staff assignment | Passed with limitation | Teacher assignment works. Generic non-teacher `user_id` staff assignment is schema-ready but not exposed in the UI. |
| Teacher assigned-event visibility | Passed | Teachers can read assigned events, bookings, and staff assignments through RLS and service-level checks. |
| Event dashboard widgets | Passed | Widgets for upcoming events, active workshops, camps, birthday events, near capacity, and bookings are present. |
| Database functions | Important issue | Booking/cancellation functions exist, but invoice relationship validation is incomplete. |
| Supabase migration | Passed with issues | Migration creates required tables, constraints, indexes, RLS, functions, and seeded event types. |
| Permissions | Passed | Super Admin/Admin management and Teacher assigned-event view permissions are implemented. Parent access is intentionally omitted. |
| RLS policies | Passed with note | Core RLS policies match Phase 10 scope. Future branch-scoped RLS remains deferred. |
| UI consistency | Passed with issues | UI follows the existing premium card layout, but some action visibility and form affordances need tightening. |
| Phase 11 readiness | Not yet | Phase 11 should wait until the blocker is resolved. |

---

## Blockers

### 1. Event bookings can link to an unrelated invoice

The `book_event_student` database function validates the parent/student relationship, duplicate bookings, capacity, event status, booking status, and payment status. It does not validate that `p_invoice_id`, when provided, belongs to the same `parent_id` and `student_id`.

Risk:

- An event booking could point to another family's invoice.
- Future Parent Portal screens could expose incorrect finance links.
- This weakens the Phase 9 finance integrity guarantees.

Required fix before Phase 11:

- In `book_event_student`, if `p_invoice_id` is not null, verify an active invoice exists where:
  - `invoices.id = p_invoice_id`
  - `invoices.parent_id = p_parent_id`
  - `invoices.student_id = p_student_id`
  - `invoices.deleted_at is null`
- Return a friendly error such as `invalid_event_invoice_link`.

---

## Important Issues

### 1. Teacher users can see an Edit button on event list cards

The event list only shows the "Create event" button to managers, but each `EventCard` always renders an "Edit" link. Teachers are denied on the edit page, so this is not a permission bypass, but it is inconsistent with the RBAC UX.

Recommendation:

- Pass `canManage` into `EventCard`.
- Hide the edit action unless the user can manage events.

### 2. Category filtering is applied after pagination

`listEvents` filters by category after fetching a paginated page of events. This can create incomplete category result sets and inaccurate totals.

Recommendation:

- Join/filter by event type at query time, or first resolve event type IDs for the selected category and apply `.in("event_type_id", ids)` before pagination.

### 3. Generic staff assignment is not exposed

The database supports either `teacher_id` or `user_id` on `event_staff_assignments`, but the UI and service only expose teacher assignment.

Recommendation:

- Either document Phase 10 as teacher-only assignment, or add generic staff selection in a later hardening pass.

---

## Medium Issues

### 1. Booking form does not guide parent/student matching

The booking form allows independent student and parent selection. The database correctly rejects invalid links, but the UI can lead admins into avoidable validation errors.

Recommendation:

- Filter parent options based on the selected student, or show linked parents beside each student.

### 2. Invoice linking is a raw UUID field

The booking UI asks for an optional invoice UUID. This is functional, but not friendly for operational users.

Recommendation:

- After the blocker is fixed, replace the raw UUID input with a filtered invoice selector for the selected parent/student.

### 3. Event booking into draft events may need policy clarification

The database permits bookings for `draft` and `active` events. This may be intentional for internal planning, but the product requirements do not explicitly define whether draft events should accept bookings.

Recommendation:

- Confirm the intended workflow. If draft is internal only, restrict booking to `active`.

---

## Minor Issues

### 1. Staff assignment target check allows both teacher and user

The `event_staff_assignment_target_check` requires at least one of `teacher_id` or `user_id`, but does not prevent both being set.

Recommendation:

- Tighten the check constraint to require exactly one target when generic staff assignment is introduced.

### 2. Archived event restore is implicit

Archived events can be restored by editing the status away from `archived`, because the update clears `deleted_at`. This works, but there is no explicit "Restore event" action.

Recommendation:

- Add a dedicated restore action in a future maintenance pass if archived event workflows become common.

---

## Phase 11 Readiness

Phase 11 Parent Portal should not start yet.

The core Phase 10 implementation is in good shape, and all quality checks pass. The invoice ownership blocker should be fixed first because Parent Portal work is likely to expose event bookings, family records, and finance links to parents.

Once invoice ownership validation is enforced inside the booking database function, Phase 11 can begin safely.

---

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
