# Phase 11 Parent Portal MVP

## Purpose

Phase 11 delivers the first Parent Portal MVP for Little London.

The portal is read-only. It gives parents a calm, premium, mobile-friendly view of their own family information without allowing parents to change operational school records.

The MVP must reuse approved Phase 1-10 foundations:

- Supabase authentication
- RBAC
- Parent/student relationships
- Students
- Classes and enrolments
- Attendance
- Finance
- Payments and invoices
- Events, workshops, holiday camps, and birthday events
- Premium Boutique Dashboard v2

No parent-facing write workflows are included in this MVP.

## User Experience Goals

- Give parents immediate clarity about their child, schedule, attendance, finances, and upcoming activities.
- Preserve the Premium Boutique Dashboard v2 identity: navy, gold, cream, sage, calm cards, refined spacing, and parent-friendly hierarchy.
- Make the portal feel warm and reassuring, not like a management ERP.
- Keep all information scoped to the authenticated parent's own linked children.
- Prioritize mobile usability because parents are likely to check the portal from a phone.
- Avoid exposing internal operational language, admin-only actions, internal notes, draft records, or sensitive management data.

## Parent Navigation Structure

Parent navigation should remain simple and read-only:

- Dashboard
- My Children
- Classes & Enrolments
- Attendance
- Finance
- Event Bookings
- Upcoming Events

Parents must not see management navigation for:

- Students management
- Parent management
- Teacher management
- Attendance management
- Finance management
- Event management
- Reports
- Settings
- Audit logs
- User management

## Parent Dashboard

The parent dashboard should summarize only the authenticated parent's own family data.

Recommended dashboard widgets:

- My children summary
- Next class
- Attendance snapshot
- Outstanding balance
- Recent invoices
- Recent payments
- Upcoming events
- Active event bookings
- Published school updates placeholder if announcements are later enabled

Dashboard cards should be read-only and link only to parent-visible views.

No dashboard card should trigger a mutation, booking, payment, upload, edit, or request workflow in this MVP.

## My Children

Parents can view a list of their actively linked children.

Data should come from:

- `parents`
- `parent_student_relationships`
- `students`

Visible fields:

- Child name
- Student number if appropriate
- Age or date of birth where approved for parent visibility
- Current status
- Linked relationship type
- Primary class or active enrolment summary

Hidden fields:

- Internal notes
- Management-only status history
- Admin audit fields
- Other parents unless explicitly parent-visible as part of the child's family context

## Child Profile View

Parents can view a child profile summary for each linked child.

Visible sections:

- Basic child profile
- Linked classes and enrolments
- Attendance summary
- Event bookings
- Finance summary
- Parent-visible medical summary only if already approved for parent visibility

Not included:

- Editing child profile
- Updating medical records
- Uploading documents
- Viewing internal notes
- Viewing teacher-only or admin-only data

## Classes & Enrolments

Parents can view their own child's classes and enrolments.

Data should come from:

- `student_enrolments`
- `classes`
- `courses`
- `class_teachers`
- `teachers`

Visible fields:

- Course name
- Class name
- Enrolment status
- Start date
- End date where available
- Teacher display name where parent visibility is allowed
- Capacity should not be emphasized unless product wants to expose it

Parents cannot:

- Enrol a child
- Remove a child from a class
- Transfer classes
- Edit enrolment status
- View other students in the class roster

## Attendance View

Parents can view attendance history for their own linked children.

Data should come from:

- `attendance_sessions`
- `attendance_records`
- `student_enrolments`
- `classes`
- `courses`

Visible fields:

- Date
- Class/course
- Attendance status
- Arrival time if parent-visible
- Parent-safe notes if approved for parent visibility

Rules:

- Parents see only submitted/reviewed attendance records where product policy allows visibility.
- Parents never edit attendance.
- Parents never see correction workflow controls.
- Parents never see admin review, lock, or correction metadata unless a parent-safe explanation is explicitly introduced later.

## Finance View

Parents can view their own family finance data.

Data should come from:

- `invoices`
- `invoice_items`
- `payments`
- `payment_allocations`
- future `receipts` when implemented

Visible sections:

- Outstanding balance
- Invoice list
- Invoice detail
- Payment history
- Payment allocation summary where helpful

Parents can view:

- Own-family invoices
- Own-family invoice items
- Own-family payments
- Outstanding balance
- Payment status

Parents cannot:

- Create invoices
- Edit invoices
- Archive invoices
- Record payments
- Make online payments
- Request refunds
- Apply discounts
- Modify payment allocations

## Event Bookings View

Parents can view event bookings for their own linked children.

Data should come from:

- `event_bookings`
- `events`
- `event_types`
- `students`
- `parents`
- optional linked `invoices`

Visible fields:

- Event title
- Event category
- Event date and time
- Location
- Child name
- Booking status
- Payment status
- Linked invoice reference if it belongs to the same parent/student

Rules:

- Parents see only event bookings where the booking parent and student belong to their active parent-student relationships.
- Parents cannot create bookings.
- Parents cannot cancel bookings.
- Parents cannot edit booking status.
- Parents cannot change payment status.

## Upcoming Events View

Parents can view upcoming events only in a read-only way.

MVP options:

- Show upcoming events connected to their existing child bookings.
- Optionally show general active upcoming events if product wants discovery without booking.

Recommended MVP:

- Show booked upcoming events first.
- Do not expose booking request or online booking controls.
- Do not show internal capacity management controls.

Visible fields:

- Event title
- Category
- Date/time
- Location
- Price if parent-facing
- Booking status if already booked

## Parent Permissions

Parent permissions must remain least-privilege and read-only for school records.

Required parent capabilities:

- View own parent profile.
- View own linked children.
- View own child's classes and enrolments.
- View own child's attendance history.
- View own-family invoices.
- View own-family payments.
- View own child's event bookings.
- View parent-visible upcoming events.

Explicitly not allowed:

- Edit child profiles.
- Edit attendance.
- Edit enrolments.
- Create event bookings.
- Pay online.
- Modify invoices.
- Modify payments.
- Access management modules.
- Access other parents, unrelated students, class rosters, teacher management, reports, audit logs, or settings.

Permission keys should align with existing RBAC guidance:

- `parents.view.own`
- `students.view.own_child`
- `classes.view.own_child`
- `enrollments.view.own_child`
- `attendance.view.own_child`
- `invoices.view.own_child`
- `payments.view.own_child`
- future `events.view.own_child`

No new write permission should be introduced for the Phase 11 MVP.

## Required RLS Policies

Parent Portal security must be enforced primarily by Supabase RLS and helper functions, with UI and server actions as additional layers.

Required helper concepts:

- Current authenticated user from `auth.uid()`.
- Parent profile linked by `parents.user_id`.
- Active parent-student relationship through `parent_student_relationships`.
- Own-child access helper.
- Own-family finance access helper.
- Own-child event booking access helper.

Required read-only RLS posture:

- `parents`: parent can select own parent row where `parents.user_id = auth.uid()` and row is active/not deleted.
- `parent_student_relationships`: parent can select active relationships for own parent row.
- `students`: parent can select students linked through active parent-student relationships.
- `student_enrolments`: parent can select enrolments for own linked children.
- `classes`: parent can select classes connected to own child's active enrolments.
- `courses`: parent can select courses connected to own child's classes/enrolments.
- `teachers`: parent can select limited teacher display information for own child's classes.
- `attendance_records`: parent can select own child's visible attendance records.
- `attendance_sessions`: parent can select sessions/classes connected to own child's attendance records.
- `invoices`: parent can select own-family invoices.
- `invoice_items`: parent can select items for own-family invoices.
- `payments`: parent can select own-family payments.
- `payment_allocations`: parent can select allocations connected to own-family payments/invoices.
- `event_bookings`: parent can select own child's event bookings.
- `events`: parent can select events connected to own child's bookings, and optionally active upcoming public events if product approves discovery.
- `event_types`: parent can select active event type labels required to render visible events.

RLS must not allow parent insert, update, delete, archive, restore, approve, assign, or manage operations for these operational records in Phase 11.

## Mobile Experience

The Parent Portal MVP must be mobile-first within the existing responsive shell.

Mobile requirements:

- Parent dashboard cards stack cleanly.
- Child selector is easy to use on small screens.
- Attendance history is readable without horizontal scrolling where possible.
- Finance summaries show balance and invoice status clearly.
- Event booking cards are readable as cards, not dense tables.
- Navigation remains compact and parent-focused.
- Touch targets are comfortable.
- No critical information is hidden behind hover-only behavior.

## Security Considerations

Critical security rules:

- Parent access is always based on active parent-student relationships.
- Parents must never access another family's child, invoice, payment, or booking.
- Parents must never see internal notes, audit metadata, management fields, or teacher-only data.
- Teachers and parents must remain isolated from each other's restricted data areas.
- Finance visibility must reuse Phase 9 parent/student relationship integrity.
- Event booking visibility must reuse Phase 10 parent/student/invoice integrity rules.
- Read-only portal server actions must still verify authentication, active profile, role, permission, and ownership.
- UI hiding is not enough; RLS must enforce every ownership boundary.
- Service role must not be used for parent reads unless absolutely necessary and safely scoped server-side.

## Data Sources Reused From Existing Phases

Phase 11 should reuse existing approved data sources.

Authentication and RBAC:

- `user_profiles`
- `roles`
- `permissions`
- `role_permissions`

Parent and child access:

- `parents`
- `students`
- `parent_student_relationships`

Academic:

- `courses`
- `classes`
- `class_teachers`
- `student_enrolments`
- `teachers`

Attendance:

- `attendance_sessions`
- `attendance_records`

Finance:

- `invoices`
- `invoice_items`
- `payments`
- `payment_allocations`

Events:

- `event_types`
- `events`
- `event_bookings`
- `event_staff_assignments` only where needed for display, not management

Potential future views from `DATABASE_SCHEMA.md`:

- `parent_children_view`
- `attendance_summary_view`
- `invoice_balances_view`

## Success Criteria

Phase 11 Parent Portal MVP is successful when:

- Parent users can log in and see only parent-appropriate navigation.
- Parents can view their own dashboard.
- Parents can view their linked children.
- Parents can view child profile summaries.
- Parents can view classes and enrolments for their own children.
- Parents can view attendance history for their own children.
- Parents can view own-family invoices, payments, and outstanding balance.
- Parents can view event bookings and upcoming booked events for their own children.
- Parents cannot mutate any operational records.
- Parents cannot access management modules.
- Parents cannot view unrelated family data.
- RLS blocks direct unauthorized access attempts.
- The UI matches Premium Boutique Dashboard v2.
- Mobile layouts remain clean and usable.
- Lint, type-check, and build pass after implementation.

## Future Parent Portal Features (Not Included)

The following are not included in the Phase 11 MVP:

- Online payments
- Event booking requests
- Event cancellation requests
- Messaging
- Notifications
- WhatsApp
- Homework
- Teacher remarks
- Reports
- Downloads
- Document uploads
- Profile edit requests
- Medical update requests
- Absence explanations
- Refund requests
- Mobile app
- Push notifications
- AI progress reports
