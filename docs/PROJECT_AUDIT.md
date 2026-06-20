# Little London Management System

# PROJECT_AUDIT.md

Version: 1.0

---

# Purpose

This audit reviews all documents currently inside the `docs/` folder and treats them as the single source of truth.

Documents reviewed:

- `API_REQUIREMENTS.md`
- `APP_FLOW.md`
- `AUTHENTICATION.md`
- `COMPONENT_LIBRARY.md`
- `DATABASE_SCHEMA.md`
- `DEPLOYMENT.md`
- `DEVELOPMENT_RULES.md`
- `FOLDER_STRUCTURE.md`
- `MASTER_PROMPT.md`
- `PERMISSIONS.md`
- `PRODUCT_REQUIREMENTS.md`
- `ROADMAP.md`
- `TESTING.md`
- `UI_UX_GUIDELINES.md`

No application code was reviewed or generated for this audit.

---

# Executive Summary

The documentation gives a strong high-level product vision: a modern school and activity center management platform with management, teacher, and parent portals. The intended stack, design language, core modules, authentication model, permissions philosophy, and deployment approach are clear.

However, the documents are not yet detailed enough to safely implement the system without major assumptions. The largest gaps are in the database schema, relationships, permission coverage, API contracts, business rules, and module-level acceptance criteria.

The highest priority before application development should be to complete the database model, define all relationships, finalize RBAC rules for every module, and convert the broad API operation lists into concrete endpoint or Server Action contracts.

---

# Missing Requirements

## Business Rules

The following requirements are mentioned but not fully defined:

- Age ranges for nursery, English classes, workshops, drama classes, birthday events, holiday camps, and drop-and-play sessions.
- Course capacity rules, waitlist behavior, and what happens when a class is full.
- Enrollment status lifecycle, such as pending, active, paused, completed, cancelled, transferred, archived.
- Student transfer rules between classes, teachers, courses, rooms, branches, or programs.
- Attendance statuses beyond present and absent, such as late, excused, cancelled, sick, holiday, makeup class.
- Teacher remark approval rules, including who can approve, edit, reject, resubmit, and view rejected remarks.
- Payment lifecycle, including draft invoice, sent, partially paid, paid, overdue, refunded, cancelled, written off.
- Discount, tax, currency, payment method, and refund rules.
- Birthday package rules, decoration options, staff assignment limits, deposits, cancellations, and booking confirmation.
- Workshop, holiday camp, and seasonal event booking rules.
- Nursery daily notes, pickup/dropoff tracking, naps, meals, incidents, and parent visibility.
- Communication history rules, including what counts as a communication and who can view it.
- Parent portal account activation rules and whether parent accounts are created automatically or manually approved.
- Duplicate detection rules for parents, students, phone numbers, emails, and imported registrations.
- Data retention and archival rules for students, parents, teachers, invoices, documents, and audit logs.
- Approval workflows beyond teacher remarks, such as attendance corrections, refunds, registration review, and document verification.
- Multi-branch readiness requirements beyond broad future intent.

## Acceptance Criteria

Most phases and modules have goals but no detailed acceptance criteria. Each module needs clear "done" criteria covering:

- Required fields
- User actions
- Validation rules
- Permission behavior
- Error states
- Empty states
- Audit logging
- Reporting impact
- Parent or teacher portal visibility

## Operational Requirements

The docs mention running daily operations through the platform, but do not fully define:

- School calendar and holiday handling.
- Class cancellation and makeup class workflows.
- Room availability and scheduling conflict detection.
- Teacher availability conflicts.
- Staff assignment rules for events and birthdays.
- Parent consent forms and medical emergency handling.
- Incident reports.
- Internal notes versus parent-visible notes.
- Bulk import/export workflows.
- Notification delivery preferences.

---

# Missing Database Tables

`DATABASE_SCHEMA.md` lists core tables but leaves table definitions, relationships, indexes, constraints, RLS, storage buckets, and views incomplete.

The following tables or table groups appear necessary based on the documentation but are missing or not explicitly defined:

## Identity and Permissions

- `user_profiles`
- `role_permissions`
- `permissions`
- `user_roles` if users may later have more than one role or scoped roles
- `account_status_history`
- `password_reset_audit` or equivalent auth event tracking

## Family and Student Data

- `parent_student_relationships`
- `guardians`
- `emergency_contacts`
- `student_medical_profiles`
- `student_allergies`
- `student_progress`
- `student_internal_notes`
- `student_status_history`

## Registration

- `registration_submissions`
- `registration_sources`
- `registration_reviews`
- `duplicate_match_reviews`

These are needed because the docs require website, Google Form, Tally Form, and manual registration entry points with management review.

## Courses, Classes, and Scheduling

- `course_categories` or `program_types`
- `course_sessions`
- `class_sessions`
- `class_schedules`
- `teacher_class_assignments`
- `student_class_assignments`
- `teacher_availability`
- `room_bookings`
- `calendar_events`
- `holidays`
- `schedule_exceptions`

## Attendance

- `attendance_sessions`
- `attendance_records`
- `attendance_corrections`
- `attendance_statuses`

The schema lists both `Attendance` and `Attendance Records`, but the distinction is not defined.

## Teacher Workflows

- `homework`
- `homework_submissions` if parent/student submission is ever needed
- `lesson_notes`
- `lesson_progress`
- `teacher_remark_reviews`
- `approval_queue`

## Finance

- `receipts`
- `invoice_status_history`
- `payment_methods`
- `payment_allocations`
- `discounts`
- `refunds`
- `refund_approvals`
- `tax_rates` if applicable
- `financial_adjustments`

Payments and invoices are listed, but the docs require receipts, refunds, outstanding balances, discounts, and financial reports.

## Events and Programs

- `event_types`
- `event_bookings`
- `birthday_packages`
- `birthday_decorations`
- `birthday_staff_assignments`
- `workshop_attendance`
- `holiday_camp_registrations`
- `drama_class_registrations`
- `drop_play_sessions`
- `nursery_enrollments`
- `nursery_daily_notes`

Some of these could be modeled through generalized course/event tables, but the documentation does not decide that.

## Communication and Notifications

- `announcement_audiences`
- `announcement_recipients`
- `notification_recipients`
- `communication_history`
- `email_logs`
- `message_templates`
- `parent_contact_preferences`

## Documents and Storage

- `document_types`
- `document_access_rules`
- `file_uploads`
- `storage_objects_metadata`
- `signed_url_audit`

## Reporting and Auditing

- `report_runs`
- `export_logs`
- `audit_log_details`
- `system_error_logs`

---

# Missing Relationships

The database relationships section is explicitly incomplete. The following relationships need to be defined before implementation:

- User to role.
- User to teacher profile.
- User to parent profile.
- Parent to student, including many-to-many guardian relationships.
- Student to enrollments.
- Enrollment to course.
- Enrollment to class.
- Class to course.
- Class to teacher or teachers.
- Class to room.
- Class to branch.
- Class to schedule/session records.
- Attendance session to class/session/date.
- Attendance record to student and attendance session.
- Teacher remark to student, teacher, class, and approval reviewer.
- Invoice to parent, student, enrollment, event booking, or other billable item.
- Invoice item to invoice and product/service.
- Payment to invoice or invoices.
- Receipt to payment.
- Refund to payment and approval reviewer.
- Workshop registration to student, workshop, invoice, and attendance.
- Birthday event to student, parent, package, staff, invoice, and room.
- Nursery enrollment to student, room, teacher, schedule, and daily notes.
- Announcement to audience, recipients, author, and publish status.
- Notification to recipient, source entity, read status, and delivery channel.
- Document to owner entity, uploader, document type, and storage object.
- Audit log to actor, affected record, action type, and metadata.
- Branch to users, rooms, classes, courses, students, teachers, and financial records when multi-branch support arrives.

---

# Missing API Endpoints

`API_REQUIREMENTS.md` lists broad operations but does not define concrete endpoint paths, HTTP methods, Server Action names, request schemas, response schemas, authorization rules, or error codes.

The following API areas need more detail:

## Auth and User Management

- Account activation and deactivation.
- Account lock and unlock.
- Invite user.
- Accept invitation.
- Assign role.
- Change role.
- View user audit history.
- Manage account status.

## Registration

- Submit website registration.
- Import Google Form registration.
- Import Tally Form registration.
- Review registration.
- Approve registration.
- Reject registration.
- Convert registration to parent, student, enrollment, invoice, and portal account.
- Resolve duplicate registration.

## Students and Parents

- Link and unlink guardians.
- Manage emergency contacts.
- Manage medical information and allergies.
- Manage documents.
- View full student timeline.
- Archive and restore parent records.
- Update parent contact details from the parent portal with approval rules if needed.

## Teachers

- Manage teacher availability.
- Manage timetable.
- Upload lesson notes.
- Update lesson progress.
- Upload or assign homework.
- View personal performance reports.

## Courses, Classes, and Scheduling

- Create class sessions.
- Detect schedule conflicts.
- Assign room.
- Manage capacity and waitlist.
- Transfer student between classes.
- Publish or unpublish course/class.
- Archive course/class.

## Attendance

- Start attendance session.
- Submit teacher attendance.
- Review attendance.
- Correct historical attendance.
- View attendance by student, class, teacher, date range, and parent.

## Finance

- Create receipt.
- Download receipt.
- Apply discount.
- Record partial payment.
- Allocate payment to invoices.
- Mark overdue invoices.
- Approve refund.
- Void invoice.
- Export financial records.

## Events and Programs

- Manage birthday packages.
- Manage birthday decorations.
- Assign birthday staff.
- Confirm birthday booking.
- Cancel birthday booking.
- Manage nursery enrollment.
- Add nursery daily note.
- Manage holiday camp registration.
- Manage drama class registration.
- Manage drop-and-play sessions.

## Communication

- Get announcement recipients.
- Track announcement read status.
- Create communication history entry.
- Manage notification preferences.
- Retry failed notification delivery.

## Reports and Exports

- Generate each report type.
- Track report generation status.
- Download report.
- Export audit logging.
- Export student, attendance, finance, and workshop data.

## Storage

- Generate signed upload URL.
- Generate signed download URL.
- Delete or archive file.
- Validate file ownership and permissions.
- Audit file access.

---

# Missing Permissions

`PERMISSIONS.md` covers major roles but does not cover every module listed in the product scope.

Permissions need to be defined for:

- Nursery.
- Workshops.
- Holiday camps.
- Drama classes.
- Drop-and-play sessions.
- Birthday packages.
- Birthday decorations.
- Birthday staff assignments.
- Room management.
- Branch management.
- Document upload, download, delete, and approval.
- Communication history.
- Notification management.
- Homework.
- Lesson notes.
- Lesson progress.
- Student progress.
- Emergency contacts.
- Medical information.
- Internal notes.
- Registration review.
- Duplicate resolution.
- Discounts.
- Refund approval.
- Receipt generation.
- Report exports by report type.
- Audit log viewing.
- Data import.
- Data export.
- User account activation and disabling.
- Role and permission assignment.
- System configuration.
- Storage bucket access.
- Parent contact detail updates.

Permission scopes also need to be explicit:

- Own record.
- Own child.
- Assigned students.
- Assigned classes.
- Assigned branch.
- Whole school.
- All branches.

---

# Missing Screens

The documentation defines broad portals and flows, but many screens are implied rather than specified.

## Authentication

- Forgot password screen.
- Reset password screen.
- Session expired screen.
- Account disabled or pending screen.

## Management

- Registration review queue.
- Duplicate match review.
- Student create/edit wizard.
- Student profile timeline.
- Medical information screen.
- Emergency contacts screen.
- Student documents screen.
- Parent profile communication history.
- Teacher availability screen.
- Teacher timetable editor.
- Course schedule builder.
- Class session manager.
- Room calendar.
- Attendance correction screen.
- Teacher remark approval queue.
- Invoice builder.
- Receipt viewer.
- Refund workflow.
- Discount management.
- Birthday package manager.
- Birthday booking calendar.
- Nursery daily notes manager.
- Workshop attendance screen.
- Holiday camp manager.
- Drama class manager.
- Announcement audience selector.
- Notification center management.
- Report builder.
- Export history.
- Audit log viewer.
- Role and permission manager.
- Branch manager for future multi-branch support.

## Teacher Portal

- Today's classes.
- Weekly timetable.
- Class student list.
- Mark attendance.
- Same-day attendance edit.
- Add teacher remark.
- Edit pending remark.
- Upload homework.
- Lesson notes.
- Lesson progress.
- Teacher profile.

## Parent Portal

- Children overview.
- Child profile.
- Attendance history.
- Schedule/calendar.
- Approved remarks.
- Invoice list.
- Invoice detail and download.
- Receipt download.
- Payment history.
- Announcements.
- Birthday booking status.
- Contact details update.
- Notification preferences.

## Shared

- Global search results.
- Notifications inbox.
- Empty states.
- Error pages.
- Access denied page.
- Loading states.
- Mobile navigation states.

---

# Contradictions Between Documents

## User Roles

Some documents describe three primary user groups: Management, Teachers, and Parents. Other documents define four roles: Super Admin, Admin, Teacher, and Parent.

Recommendation: Treat Super Admin and Admin as separate system roles, while grouping both under "Management" in user-facing language where appropriate.

## Admin Permissions

`PERMISSIONS.md` says Admin can archive students and parents, while the permissions matrix says Admin has CRUD access. Delete and archive are not equivalent.

Recommendation: Define whether Admin can hard-delete records. Prefer archive-only for operational records and reserve hard delete for Super Admin or system maintenance.

## Registration Workflow Order

The registration order varies. Some documents generate the invoice before class or teacher assignment, while others assign class and teacher before invoice generation.

Recommendation: Define one canonical registration workflow. A practical order is: create/reuse parent, create student, select course/program, assign class/session, assign teacher through class, generate invoice, activate parent portal.

## Current Versus Future Features

Some items appear as current scope in one document and future scope in another:

- Refunds
- Homework
- Email notifications
- Branch support
- Online booking
- Push notifications

Recommendation: Add a scope status to each feature: Phase 1, later phase, or future.

## Finance Terminology

Payments, invoices, receipts, outstanding balances, refunds, discounts, revenue, and financial reports are all mentioned, but the boundaries between them are not defined.

Recommendation: Create a finance domain specification before implementation.

## Course and Activity Modeling

English classes, nursery, arts and crafts, baking workshops, drama classes, holiday camps, birthday events, drop-and-play sessions, and seasonal workshops are all mentioned. The docs do not decide whether these are all courses, events, programs, or separate modules.

Recommendation: Define a unified model for programs, classes, sessions, and events, then document exceptions for birthday bookings and nursery if they need special handling.

## Teacher Remark Visibility

Rejected remarks are described as visible only to management in one flow and visible to teacher and management in permissions.

Recommendation: Define rejected remark visibility and edit/resubmit rules.

## Notifications

`API_REQUIREMENTS.md` says notifications support email, in-app, and future push. `APP_FLOW.md` says email is future. This creates uncertainty about MVP notification channels.

Recommendation: Define MVP notifications as in-app only unless email is explicitly included in the first release.

## Parent Editing Rights

Parents cannot edit school records, but the parent portal should allow updating contact details.

Recommendation: Classify contact updates as parent-owned profile updates, not school record edits. Define whether changes apply instantly or require management review.

## Role-Based Routing

`AUTHENTICATION.md` says Super Admin redirects to Admin Dashboard, while Admin redirects to Management Dashboard.

Recommendation: Use one management dashboard with permissions-based capabilities, or explicitly define a separate Super Admin dashboard.

---

# Scalability Concerns

- Multi-branch support is repeatedly mentioned, but branch scoping is not designed into table relationships, permissions, reporting, storage, or dashboards.
- Large tables require pagination, filtering, and indexes, but no index strategy exists.
- Reporting could become slow if reports query transactional tables directly without views, summaries, or background generation.
- Global search is required across many entities but no search strategy is defined.
- Real-time notifications are mentioned, but no recipient or read-state model exists.
- File storage could grow quickly; retention, lifecycle, backup, and access patterns are not defined.
- Audit logs can become large; retention, partitioning, and filtering strategy are missing.
- Dashboard widgets may become expensive without cached summary queries or database views.
- Multi-channel communication, mobile apps, online payments, and AI features are listed as future goals but not separated into integration boundaries.
- Scheduling complexity will grow with rooms, teachers, branches, class sessions, holidays, events, and cancellations unless modeled early.

---

# Security Concerns

- Row Level Security is required but not specified per table.
- Role permissions are documented conceptually but not mapped to database policies.
- File access rules are not detailed for student documents, medical reports, invoices, and receipts.
- Sensitive student medical data needs stricter access rules than general student profile data.
- Parent and teacher ownership rules need exact query constraints to avoid data leakage.
- Audit logging is required but the audit log schema and immutable write strategy are not defined.
- The docs prohibit storing credentials in local storage but do not define cookie/session implementation details for Next.js and Supabase.
- CSRF protection is required, but implementation expectations for Server Actions and Route Handlers are not specified.
- Password policy is stated, but account lockout, rate limiting, brute-force protection, and login throttling are not fully defined.
- Import workflows from Google Forms and Tally may introduce untrusted data; validation and sanitization rules need detail.
- Export permissions are broad and could expose personal, medical, or financial data if not carefully scoped.
- Service role key usage rules are not defined.
- Admin restrictions say management cannot modify authentication settings, but user management APIs include change password and delete user operations.
- Virus scanning for uploads is marked future, but the system plans to accept PDFs and images containing sensitive documents.

---

# UI/UX Concerns

- The parent portal is expected to be mobile-first, but specific mobile screen layouts and navigation behavior are not defined.
- Management screens may become dense due to the number of modules; information architecture needs a clear navigation hierarchy.
- The design system calls for large whitespace and premium visuals, but operational tables require dense, efficient workflows. This balance should be specified.
- Complex workflows such as registration, invoicing, attendance correction, and birthday booking need step-by-step UX requirements.
- Empty, loading, error, and success states are required but not defined per module.
- Accessibility is required, but no component-level accessibility acceptance criteria are provided.
- Dark mode is required, but chart, table, calendar, and status color behavior is not specified.
- Global search is required but search result grouping, permissions, and keyboard UX are undefined.
- Calendar and scheduling views are implied but not specified in the component library or app flow.
- Parent-facing language should be simpler than management-facing language, but content guidelines are not defined.
- Bulk actions are required in tables, but confirmation, undo, and permission behavior are not specified.

---

# Recommendations

# 1. Complete the Database Specification First

Before application code begins, expand `DATABASE_SCHEMA.md` to include:

- Table definitions.
- Columns and data types.
- Required fields.
- Foreign keys.
- Relationship cardinality.
- Unique constraints.
- Check constraints.
- Indexes.
- Soft delete rules.
- Audit fields.
- RLS policies.
- Storage buckets.
- Database views.

This is the most important blocker.

# 2. Create a Canonical Domain Model

Define the core business model for:

- Programs.
- Courses.
- Classes.
- Sessions.
- Events.
- Enrollments.
- Bookings.

This will clarify whether nursery, workshops, drama classes, holiday camps, and drop-and-play are modeled as course types, event types, program types, or separate entities.

# 3. Finalize MVP Scope

Add a clear scope label to every feature:

- MVP
- Phase 2
- Later
- Future

This is especially important for refunds, homework, email notifications, online booking, online payments, branch management, AI features, and mobile apps.

# 4. Convert API Operations Into Contracts

For each operation, define:

- Route or Server Action name.
- Method.
- Required role and permissions.
- Request body.
- Response body.
- Validation rules.
- Error cases.
- Audit log behavior.
- Pagination, filtering, and sorting where applicable.

# 5. Expand the Permission Matrix

The permission model should cover every module and action, including:

- View.
- Create.
- Edit.
- Archive.
- Delete.
- Approve.
- Export.
- Import.
- Refund.
- Assign.
- Upload.
- Download.
- Manage.

Permissions should include ownership scope, such as own child, assigned class, branch, or all records.

# 6. Define Security Policies Per Data Type

Create separate security rules for:

- General profile data.
- Medical data.
- Financial data.
- Internal notes.
- Parent-visible notes.
- Teacher remarks.
- Documents.
- Audit logs.

Not all student data should have the same visibility.

# 7. Add Module-Level UX Specifications

For each major module, define:

- Main screens.
- Primary actions.
- Empty states.
- Loading states.
- Error states.
- Mobile behavior.
- Bulk actions.
- Confirmation dialogs.
- Success notifications.

# 8. Define Reporting and Dashboard Data Sources

Specify whether dashboards and reports use:

- Direct transactional queries.
- Database views.
- Materialized views.
- Cached summaries.
- Background report generation.

This should be decided before dashboards and reporting are implemented.

# 9. Add Import and Data Quality Requirements

Because registrations may come from website forms, Google Forms, Tally Forms, and manual entry, define:

- Import format.
- Field mapping.
- Duplicate detection.
- Review workflow.
- Error handling.
- Audit history.
- Source tracking.

# 10. Create a Production Readiness Checklist Per Phase

The roadmap already defines phases. Each phase should also include:

- Required database changes.
- Required API contracts.
- Required permissions.
- Required screens.
- Required tests.
- Required documentation updates.
- UAT signoff criteria.

---

# Priority Action List

## Critical Before Coding

1. Complete database schema and relationships.
2. Define RLS and permission policies per table.
3. Resolve role and permission contradictions.
4. Define MVP scope versus future scope.
5. Create detailed API contracts for authentication, registration, students, parents, teachers, courses/classes, attendance, finance, and announcements.

## High Priority

1. Define finance rules for invoices, payments, receipts, discounts, refunds, and overdue balances.
2. Define registration import and approval workflow.
3. Define scheduling model for classes, teachers, rooms, sessions, holidays, and conflicts.
4. Define parent, teacher, and management screen inventory.
5. Define document storage access rules.

## Medium Priority

1. Define reporting architecture.
2. Define notification delivery rules.
3. Define audit log retention and search.
4. Define mobile UX details for the parent portal.
5. Define multi-branch expansion strategy.

---

# Final Assessment

The documentation is strong enough to describe the product vision, target experience, technology stack, and broad module list. It is not yet detailed enough to begin safe implementation without creating hidden assumptions.

The next best step is to turn the documentation into a full implementation blueprint, starting with the database schema, relationships, permissions, and API contracts. Once those are complete, the application can be built incrementally according to the roadmap with much lower risk.
