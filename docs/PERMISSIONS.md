# Little London School Management System

# PERMISSIONS.md

Version: 2.0

---

# 1. Purpose

This document defines the implementation-ready Role-Based Access Control (RBAC) specification for the Little London School Management System.

It is aligned with:

- Supabase Auth
- Supabase PostgreSQL Row Level Security (RLS)
- `DATABASE_SCHEMA.md`
- `PROJECT_AUDIT.md`
- The documented Management, Teacher, and Parent portal workflows

Every protected action must be authorized at three layers:

1. UI visibility
2. API or Server Action authorization
3. Supabase RLS policy

Frontend checks improve usability, but backend and database checks are the security boundary.

---

# 2. RBAC Model

The application uses four primary roles:

- Super Admin
- Admin
- Teacher
- Parent

Each authenticated user has exactly one primary role in `user_profiles.role_id`.

Permissions are stored in:

- `roles`
- `permissions`
- `role_permissions`

Permission keys should follow this format:

```text
module.action.scope
```

Examples:

```text
students.view.all
students.view.assigned
students.view.own_child
attendance.create.assigned_classes
invoices.download.own_child
settings.manage.all
```

---

# 3. Role Definitions

## 3.1 Super Admin

Super Admin is the highest-privilege system role.

Purpose:

- Owns the complete platform configuration.
- Can manage all operational records.
- Can manage users, roles, permissions, settings, branches, and audit access.
- Can restore archived records.
- Can perform controlled hard deletes only where production policy allows.

Allowed:

- Full access to all modules.
- Full cross-branch access.
- Full user and role management.
- Full audit log access.
- Full settings access.
- Full database-level operational management through approved migrations and admin workflows.

Restricted:

- Should not bypass documented workflows except for emergency recovery.
- Must use service-role operations only from trusted server-side code.
- Production data changes must remain auditable.

RLS posture:

- `is_super_admin()` grants full table access unless a table is intentionally service-role only.

---

## 3.2 Admin

Admin represents Management.

Purpose:

- Runs daily school operations.
- Manages students, parents, teachers, classes, attendance, finance, activities, announcements, reports, and communication.

Allowed:

- Full operational access to school records.
- Create, edit, archive, restore, assign, approve, export, upload, download, and manage most operational modules.
- Manage teacher remark approvals.
- Manage invoices, payments, receipts, refunds, and discounts.
- View branch audit logs if granted.

Restricted:

- Cannot delete or modify Super Admin.
- Cannot change global security settings.
- Cannot access server infrastructure.
- Cannot bypass RLS or use service role keys.
- Cannot hard-delete production records except where explicitly allowed by Super Admin policy.

RLS posture:

- MVP: access to whole school.
- Future multi-branch: access scoped to assigned branch or branches.

---

## 3.3 Teacher

Teacher represents teaching staff.

Purpose:

- Manages assigned classroom activity.
- Marks attendance.
- Creates teacher remarks.
- Uploads homework, lesson notes, and lesson progress where enabled.
- Views assigned schedules, classes, students, and relevant parent contact details.

Allowed:

- View own profile.
- View assigned classes, sessions, courses, and students.
- View limited parent contact information for assigned students.
- Mark attendance for assigned classes/sessions.
- Edit same-day attendance until reviewed or locked.
- Create teacher remarks for assigned students.
- Edit own remarks until approved.
- View approved/rejected own remark history.
- View assigned workshops, birthday participation schedules, nursery assignments, and announcements.

Restricted:

- Cannot create, archive, delete, or transfer students.
- Cannot manage users.
- Cannot approve teacher remarks.
- Cannot view invoices, payments, receipts, refunds, discounts, financial reports, or other family financial records.
- Cannot view internal management notes.
- Cannot view unrelated students, parents, classes, teachers' private notes, or branches.
- Cannot edit attendance history after management review or lock.

RLS posture:

- Access is based on assigned classes, assigned sessions, assigned workshops, assigned birthday events, and assigned nursery enrollments.

---

## 3.4 Parent

Parent represents a parent or guardian.

Purpose:

- Views information related only to their own linked children.
- Uses the Parent Portal for attendance, schedules, invoices, receipts, announcements, approved remarks, and contact profile updates.

Allowed:

- View and update own contact profile.
- View own linked children.
- View own child's schedule, enrollments, attendance, approved teacher remarks, parent-visible nursery notes, announcements, invoices, receipts, and payment history.
- Download own invoices and receipts.
- Download parent-visible documents.
- Manage own notification preferences.

Restricted:

- Cannot edit school records.
- Cannot edit attendance.
- Cannot edit teacher remarks.
- Cannot view pending or rejected teacher remarks.
- Cannot view internal notes.
- Cannot view other parents, other students, unrelated classes, management reports, audit logs, or financial records of other families.
- Cannot access teacher management, student management, user management, settings, or administration.

RLS posture:

- Access is based on active `parent_student_relationships` and the user's linked `parents.user_id`.

---

# 4. Permission Categories

The following actions are the canonical permission categories.

| Action | Meaning |
| --- | --- |
| `view` | Read records or screen data |
| `create` | Create new records |
| `edit` | Update existing records |
| `delete` | Hard delete records; restricted and rarely used |
| `archive` | Soft delete or mark inactive/archived |
| `restore` | Restore archived records |
| `approve` | Approve, reject, review, lock, or authorize workflow items |
| `export` | Export data to PDF, Excel, CSV, print, or reports |
| `import` | Import records from forms or external files |
| `upload` | Upload files to Supabase Storage through authorized flows |
| `download` | Download files, reports, invoices, receipts, or documents |
| `assign` | Assign relationships, such as teacher to class or student to course |
| `manage` | Full module control, including configuration and advanced actions |

Rules:

- `manage` implies all non-destructive operational actions for the module unless explicitly restricted.
- `delete` is separate from `archive`.
- `restore` is separate from `archive`.
- `approve` is separate from `edit`.
- `export` and `download` must be explicitly granted because they can expose sensitive data.
- `upload` must be explicitly granted because files may contain sensitive data.

---

# 5. Ownership Scopes

Permission scopes define which records a role may act on.

| Scope | Permission Key Suffix | Meaning |
| --- | --- | --- |
| Own record | `own` | The user's own profile, notifications, or preferences |
| Own child | `own_child` | Records linked to the parent's children through `parent_student_relationships` |
| Assigned students | `assigned_students` | Students visible to a teacher through assigned classes, sessions, workshops, or nursery |
| Assigned classes | `assigned_classes` | Classes/sessions assigned to a teacher through `class_teachers` or equivalent assignments |
| Whole school | `all` | Entire school in MVP |
| Future branch scope | `branch` | Records in assigned branch or branches |

Implementation notes:

- MVP Admin uses `all` for whole-school operations.
- Super Admin uses `all` across the platform.
- Teacher permissions must use `assigned_students` or `assigned_classes`.
- Parent permissions must use `own` or `own_child`.
- Future branch roles must use `branch`.

---

# 6. Permission Inheritance Rules

## 6.1 Role Hierarchy

The practical hierarchy is:

```text
Super Admin > Admin > Teacher > Parent
```

However, permissions should be assigned explicitly through `role_permissions`. Do not rely only on hierarchy in application code.

## 6.2 Super Admin Inheritance

Super Admin receives:

- All permissions with scope `all`.
- All branch-scope permissions.
- All restore, delete, manage, export, and audit permissions.

## 6.3 Admin Inheritance

Admin receives:

- Operational `view`, `create`, `edit`, `archive`, `restore`, `approve`, `export`, `import`, `upload`, `download`, `assign`, and `manage` permissions for school modules.
- No permission to modify Super Admin accounts.
- No permission to bypass RLS.
- No permission to access service role credentials.

## 6.4 Teacher Inheritance

Teacher receives:

- Assigned-class and assigned-student read permissions.
- Limited create/edit permissions for attendance, remarks, homework, lesson notes, and lesson progress.
- No financial permissions.
- No user management permissions.

## 6.5 Parent Inheritance

Parent receives:

- Own-profile permissions.
- Own-child read permissions.
- Download permissions for own invoices, receipts, and parent-visible documents.
- No school-record editing permissions.

---

# 7. Full Permission Matrix

Legend:

- `All`: all records in the platform or school, depending on role.
- `Branch`: future assigned branch scope.
- `Assigned`: records connected to teacher assignments.
- `Own`: user's own profile or notifications.
- `Own Child`: records linked to parent's children.
- `None`: no access.
- `Limited`: constrained field-level or workflow access.

## 7.1 Core People and Academic Operations

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Students | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view Assigned Students; download allowed teacher-visible docs only | view Own Child; download parent-visible docs |
| Parents | view/create/edit/delete/archive/restore/export/import/assign/manage All | view/create/edit/archive/restore/export/import/assign/manage All | view Limited contact info for Assigned Students | view/edit Own profile |
| Teachers | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view/edit Own profile | view teachers connected to Own Child |
| Courses | view/create/edit/delete/archive/restore/export/import/assign/manage All | view/create/edit/archive/restore/export/import/assign/manage All | view Assigned Courses | view Own Child enrolled courses |
| Classes | view/create/edit/delete/archive/restore/export/import/assign/manage All | view/create/edit/archive/restore/export/import/assign/manage All | view Assigned Classes | view Own Child classes |
| Enrollments | view/create/edit/delete/archive/restore/export/import/assign/manage All | view/create/edit/archive/restore/export/import/assign/manage All | view Assigned Students | view Own Child |
| Attendance | view/create/edit/delete/archive/restore/approve/export/manage All | view/create/edit/archive/restore/approve/export/manage All | view/create/edit Assigned Classes same-day until reviewed or locked | view Own Child only |

## 7.2 Teacher Classroom Workflows

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Teacher Remarks | view/create/edit/delete/archive/restore/approve/export/manage All | view/edit/archive/restore/approve/export/manage All | view/create/edit own remarks for Assigned Students until approved | view approved remarks for Own Child |
| Homework | view/create/edit/delete/archive/restore/export/upload/download/assign/manage All | view/create/edit/archive/restore/export/upload/download/assign/manage All | view/create/edit/archive/upload/download/assign for Assigned Classes | view/download Own Child homework when published |
| Lesson Notes | view/create/edit/delete/archive/restore/export/upload/download/manage All | view/create/edit/archive/restore/export/upload/download/manage All | view/create/edit/upload/download own notes for Assigned Classes | None unless explicitly parent-visible |
| Lesson Progress | view/create/edit/delete/archive/restore/export/manage All | view/create/edit/archive/restore/export/manage All | view/create/edit Assigned Students | view parent-visible progress for Own Child |

## 7.3 Activities and Events

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Workshops | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view Assigned workshops; mark assigned attendance if enabled | view Own Child registrations; future booking request |
| Holiday Camps | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view Assigned camps; mark assigned attendance if enabled | view Own Child registrations |
| Drama Classes | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view Assigned classes; update assigned progress | view Own Child enrolled drama classes |
| Nursery | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view/create/edit daily notes for Assigned nursery students | view Own Child enrollment and parent-visible daily notes |
| Birthday Events | view/create/edit/delete/archive/restore/export/import/upload/download/assign/manage All | view/create/edit/archive/restore/export/import/upload/download/assign/manage All | view Assigned participation schedule | view Own Child booking status |

## 7.4 Sensitive Student Data and Documents

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Documents | view/create/edit/delete/archive/restore/export/upload/download/manage All | view/create/edit/archive/restore/export/upload/download/manage All | view/download teacher-visible docs for Assigned Students; upload allowed only through assigned workflows | view/download parent-visible docs for Own Child; upload parent documents through approved flows |
| Medical Records | view/create/edit/delete/archive/restore/export/upload/download/manage All | view/create/edit/archive/restore/export/upload/download/manage All | view Limited medical alerts for Assigned Students | view Own Child medical information if parent-visible; submit updates through review flow |
| Internal Notes | view/create/edit/delete/archive/restore/export/manage All | view/create/edit/archive/restore/export/manage All | None unless note is explicitly teacher-visible and assigned | None |

## 7.5 Communication

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Announcements | view/create/edit/delete/archive/restore/approve/export/manage All | view/create/edit/archive/restore/approve/export/manage All | view published teacher/everyone/assigned-class announcements | view published parent/everyone/own-child-class announcements |
| Notifications | view/create/edit/delete/archive/restore/export/manage All | view/create/edit/archive/restore/export/manage All | view/edit Own notifications; mark read/archive | view/edit Own notifications; mark read/archive |

## 7.6 Finance

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Invoices | view/create/edit/delete/archive/restore/export/download/manage All | view/create/edit/archive/restore/export/download/manage All | None | view/download Own Child or own-family invoices |
| Payments | view/create/edit/delete/archive/restore/export/manage All | view/create/edit/archive/restore/export/manage All | None | view Own Child or own-family payment history |
| Receipts | view/create/edit/delete/archive/restore/export/download/manage All | view/create/edit/archive/restore/export/download/manage All | None | view/download Own Child or own-family receipts |
| Refunds | view/create/edit/delete/archive/restore/approve/export/manage All | view/create/edit/archive/restore/approve/export/manage All | None | view Own Child or own-family refund status |
| Discounts | view/create/edit/delete/archive/restore/approve/export/manage All | view/create/edit/archive/restore/approve/export/manage All | None | None |

## 7.7 Reporting, Administration, and Settings

| Module | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| Reports | view/create/export/download/manage All | view/create/export/download/manage All operational reports | view own/assigned performance reports only | view Own Child reports only |
| Audit Logs | view/export/manage All | view/export Branch or school audit logs if granted | None | None |
| User Management | view/create/edit/delete/archive/restore/assign/manage All | view/create/edit/archive/restore/assign/manage non-Super-Admin users | None | view/edit Own profile only |
| Settings | view/create/edit/delete/archive/restore/manage All | view/edit/manage limited school settings | None | view/edit Own preferences only |

---

# 8. Canonical Permission Keys

Seed permissions in `permissions` using this pattern:

```text
{module}.{action}.{scope}
```

Examples by role:

## Super Admin

- `students.manage.all`
- `parents.manage.all`
- `teachers.manage.all`
- `courses.manage.all`
- `classes.manage.all`
- `enrollments.manage.all`
- `attendance.manage.all`
- `teacher_remarks.manage.all`
- `invoices.manage.all`
- `payments.manage.all`
- `audit_logs.view.all`
- `settings.manage.all`
- `user_management.manage.all`

## Admin

- `students.manage.all`
- `parents.manage.all`
- `teachers.manage.all`
- `classes.assign.all`
- `attendance.approve.all`
- `teacher_remarks.approve.all`
- `documents.manage.all`
- `medical_records.manage.all`
- `invoices.manage.all`
- `payments.manage.all`
- `reports.export.all`
- `user_management.manage.all_non_super_admin`

## Teacher

- `students.view.assigned_students`
- `parents.view.assigned_students_limited`
- `courses.view.assigned_classes`
- `classes.view.assigned_classes`
- `attendance.create.assigned_classes`
- `attendance.edit.assigned_classes_same_day`
- `teacher_remarks.create.assigned_students`
- `teacher_remarks.edit.own_pending`
- `homework.manage.assigned_classes`
- `lesson_notes.manage.assigned_classes`
- `lesson_progress.edit.assigned_students`
- `documents.download.assigned_students_teacher_visible`

## Parent

- `parents.view.own`
- `parents.edit.own_contact`
- `students.view.own_child`
- `attendance.view.own_child`
- `teacher_remarks.view.own_child_approved`
- `enrollments.view.own_child`
- `classes.view.own_child`
- `documents.download.own_child_parent_visible`
- `invoices.view.own_child`
- `invoices.download.own_child`
- `payments.view.own_child`
- `receipts.download.own_child`
- `notifications.edit.own`

Implementation note:

- Fine-grained suffixes such as `own_pending`, `same_day`, `teacher_visible`, or `parent_visible` should be enforced in service logic and RLS helper functions, even if the base permission row is stored as a simpler module/action/scope tuple.

---

# 9. Supabase RLS Policy Guidance

RLS must be enabled on every application table.

Every policy should answer:

- Is the user authenticated?
- Is the user active?
- What is the user's role?
- Does the user have the required permission?
- Does the user own or have assignment access to this record?
- Is the record archived or active?
- Is the record in the user's allowed branch?

## 9.1 Required Helper Functions

Database migrations should define stable helper functions for RLS, such as:

- `current_user_id()`
- `current_user_role()`
- `current_user_branch_id()`
- `is_super_admin()`
- `is_admin()`
- `is_teacher()`
- `is_parent()`
- `has_permission(permission_key text)`
- `parent_profile_id()`
- `teacher_profile_id()`
- `parent_can_access_student(student_id uuid)`
- `teacher_can_access_student(student_id uuid)`
- `teacher_can_access_class(class_id uuid)`
- `user_can_access_branch(branch_id uuid)`
- `record_is_not_deleted(deleted_at timestamptz)`

These functions should rely on `auth.uid()` and the public RBAC tables, not on client-provided claims.

## 9.2 RLS Policy Pattern

Each protected table should have policies for:

- `select`
- `insert`
- `update`
- `delete`, only where hard delete is allowed

Pattern:

```text
Super Admin policy:
allow when is_super_admin()

Admin policy:
allow when is_admin()
and has_permission('<module>.<action>.all')
and user_can_access_branch(branch_id)

Teacher policy:
allow when is_teacher()
and has_permission('<module>.<action>.assigned_*')
and assignment helper returns true

Parent policy:
allow when is_parent()
and has_permission('<module>.<action>.own_child')
and parent ownership helper returns true
```

## 9.3 Table-Specific RLS Guidance

| Table Group | RLS Ownership Rule |
| --- | --- |
| `user_profiles` | User can read own profile; Admin can manage non-Super-Admin users; Super Admin all |
| `parents` | Parent via `parents.user_id = auth.uid()`; Teacher via assigned student link; Admin by branch |
| `students` | Parent via `parent_student_relationships`; Teacher via active class/session assignment; Admin by branch |
| `parent_student_relationships` | Parent sees own links; Teacher sees assigned student links; Admin manages |
| `teachers` | Teacher sees own row; Parent sees child's teachers; Admin manages |
| `courses`, `classes`, `sessions` | Teacher via `class_teachers`; Parent via own child's enrollments; Admin manages |
| `enrollments` | Parent via own child; Teacher via assigned class/student; Admin manages |
| `attendance_sessions`, `attendance_records` | Parent via own child; Teacher via assigned class/session and same-day edit rules; Admin manages/reviews |
| `teacher_remarks` | Parent only approved own-child rows; Teacher own assigned rows; Admin approves all |
| `documents` | Match `owner_type`, `owner_id`, `visibility`, and user ownership/assignment |
| `invoices`, `payments`, `receipts`, `refunds` | Parent own-family only; Teacher none; Admin finance permissions |
| `announcements` | Published audience plus explicit recipient rules; Admin manages |
| `notifications` | Recipient can read/update own; Admin or service role can create |
| `audit_logs` | Super Admin all; Admin only if audit permission; no Teacher/Parent |

## 9.4 Field-Level Sensitivity

PostgreSQL RLS controls rows, not individual fields. Sensitive fields must be protected by:

- Restricted views.
- Service-layer field selection.
- Separate tables where needed.
- Explicit API response shaping.

Sensitive fields include:

- Medical notes.
- Allergies.
- Emergency notes.
- Internal notes.
- Review notes.
- Audit metadata.
- Financial details.
- Authentication-related metadata.

## 9.5 Storage Policy Alignment

Supabase Storage policies must align with `documents` permissions.

Rules:

- No sensitive bucket should be public.
- Signed URLs should be generated only after database permission checks.
- Downloads of medical reports, invoices, receipts, and sensitive documents must be audited.
- Parent access requires own-child or own-family ownership.
- Teacher access requires assigned-student ownership and `teacher` or `shared` visibility.

---

# 10. Approval Workflows

## 10.1 Teacher Remarks

Flow:

1. Teacher creates remark for assigned student.
2. Status becomes `draft` or `pending_approval`.
3. Teacher may edit only while draft or pending approval.
4. Admin reviews.
5. Admin approves or rejects.
6. Approved remarks become visible to parents.
7. Rejected remarks remain visible to Teacher and Management only.
8. Parent never sees pending or rejected remarks.

Permissions:

- Teacher: `teacher_remarks.create.assigned_students`, `teacher_remarks.edit.own_pending`
- Admin: `teacher_remarks.approve.all`
- Parent: `teacher_remarks.view.own_child_approved`

Audit:

- Creation, submission, approval, rejection, and archive must be logged.

---

## 10.2 Attendance Review and Correction

Flow:

1. Teacher marks attendance for assigned class/session.
2. Teacher may edit same-day attendance while not reviewed or locked.
3. Admin reviews attendance.
4. Admin may correct historical attendance.
5. Corrected records require correction reason.
6. Parent can view own child's attendance after submission/review according to product rules.

Permissions:

- Teacher: `attendance.create.assigned_classes`, `attendance.edit.assigned_classes_same_day`
- Admin: `attendance.approve.all`, `attendance.edit.all`
- Parent: `attendance.view.own_child`

Audit:

- Submit, edit, correction, review, lock, archive, and restore must be logged.

---

## 10.3 Registration Review

Flow:

1. Registration arrives from website, Google Form, Tally Form, or manual entry.
2. Admin reviews submission.
3. Admin resolves duplicates.
4. Admin approves or rejects.
5. Approved submission converts into parent, student, enrollment, invoice, class assignment, and parent portal account.

Permissions:

- Admin: `registrations.import.all`, `registrations.approve.all`, `registrations.manage.all`
- Super Admin: all registration permissions.
- Teacher/Parent: no direct access.

Audit:

- Import, review, duplicate resolution, approval, rejection, and conversion must be logged.

---

## 10.4 Refund Approval

Flow:

1. Admin creates or receives refund request.
2. Admin or Super Admin reviews according to finance policy.
3. Refund is approved, rejected, processed, or cancelled.
4. Parent may view own-family refund status.

Permissions:

- Admin: `refunds.create.all`, `refunds.approve.all`, `refunds.manage.all`
- Parent: `refunds.view.own_child`
- Teacher: none.

Audit:

- Request, approval, rejection, processing, and cancellation must be logged.

---

## 10.5 Document Review

Flow:

1. User uploads document through an authorized workflow.
2. Admin reviews sensitive documents where required.
3. Visibility is assigned: `internal`, `management`, `teacher`, `parent`, or `shared`.
4. File downloads are authorized through `documents` metadata and signed URLs.

Permissions:

- Admin: `documents.manage.all`
- Teacher: `documents.download.assigned_students_teacher_visible`
- Parent: `documents.download.own_child_parent_visible`

Audit:

- Upload, visibility change, download of sensitive documents, archive, restore, and physical deletion must be logged.

---

# 11. UI Permission Rules

The interface must hide actions the user cannot perform.

Examples:

- Teachers must not see finance navigation.
- Parents must not see management modules.
- Parents must not see pending or rejected remarks.
- Teachers must not see unrelated classes.
- Export buttons must appear only where the user has export permission.
- Delete, archive, restore, approve, refund, and manage buttons require explicit permissions.

UI hiding is not sufficient security. The API and database must enforce the same rule.

---

# 12. API and Server Action Authorization Rules

Every protected API or Server Action must verify:

1. User is authenticated.
2. User profile exists.
3. User status is `active`.
4. User role is allowed.
5. Required permission key exists for the user.
6. Ownership scope is satisfied.
7. Branch scope is satisfied where applicable.
8. The target record is not archived unless the action is restore, audit, or archive-management.
9. Sensitive action is logged.

Never trust:

- Client-provided role.
- Client-provided permission list.
- Client-provided branch ID.
- Client-provided ownership claims.

---

# 13. Future Multi-Branch Permissions

The MVP uses whole-school Admin access. The schema is branch-ready, so future roles must add branch scoping without redesign.

## 13.1 Future Branch Roles

Potential future roles:

- Branch Manager
- Accountant
- Receptionist
- Marketing
- Read-Only Auditor

## 13.2 Future Branch Scope Model

Future implementation may add:

- `user_branch_assignments`
- `user_role_assignments`
- `branch_permissions`
- Temporary or time-limited assignments

Future permission format:

```text
module.action.branch
```

Examples:

```text
students.view.branch
invoices.manage.branch
reports.export.branch
audit_logs.view.branch
```

## 13.3 Branch Rules

- Super Admin can access all branches.
- Branch Manager can manage assigned branch only.
- Accountant can manage finance records for assigned branch only.
- Receptionist can manage registrations, students, parents, and attendance intake for assigned branch only.
- Marketing can manage announcements and campaigns for assigned branch only.
- Read-Only Auditor can view/export selected audit and report data for assigned branch only.

RLS must always include `branch_id` checks for branch-scoped users.

---

# 14. Permission Testing Requirements

Every module must include permission tests for:

- Super Admin full access.
- Admin operational access.
- Teacher assigned-only access.
- Parent own-child-only access.
- Unauthorized user blocked.
- Archived record behavior.
- Export/download restrictions.
- Sensitive data visibility.
- RLS direct database access attempts.

Critical examples:

- Parent cannot view another child.
- Teacher cannot view unassigned student.
- Teacher cannot access invoices.
- Parent cannot see pending or rejected remarks.
- Admin cannot modify Super Admin.
- Teacher cannot edit attendance after review/lock.
- Parent can download only own-family invoices and receipts.
- Audit logs are not visible to Teacher or Parent.

---

# 15. Audit Logging Requirements

Every sensitive permissioned action must create an audit log.

Audit required for:

- Login success/failure.
- Logout.
- User creation, edit, archive, restore, role assignment.
- Permission changes.
- Student, parent, and teacher create/edit/archive/restore.
- Enrollment and class assignment.
- Attendance submit, edit, correction, review, lock.
- Teacher remark submit, approve, reject, archive.
- Invoice create/edit/void/archive/restore.
- Payment create/edit/cancel/refund.
- Receipt generation/download.
- Refund request/approval/rejection/processing.
- Document upload/download/archive/restore/delete.
- Report export.
- Settings change.

Audit logs must include:

- Timestamp.
- Actor user ID.
- Actor role.
- Action.
- Entity table.
- Entity ID.
- Branch ID where applicable.
- Redacted old/new values where appropriate.
- IP/device metadata where available.

---

# 16. Final Rules

- No permission should be granted by default.
- All access must be explicitly granted through role permissions.
- `delete` must never be treated as the same as `archive`.
- `restore` must never be implied by `archive`.
- `export` and `download` must be treated as sensitive actions.
- Teacher access must always be assignment-based.
- Parent access must always be own-child or own-record based.
- Financial data is never visible to Teachers.
- Internal notes are never visible to Parents.
- Pending and rejected teacher remarks are never visible to Parents.
- RLS is mandatory on every application table.
- Service role access is allowed only in trusted server-side code.
- Every module must be tested against this permissions model before release.

---

# 17. Final Goal

The RBAC system must enforce least privilege while supporting daily operations without friction.

Super Admin controls the platform, Admin runs the school, Teachers manage assigned learning activity, and Parents see only their own family information.

This specification is the source of truth for UI visibility, API authorization, Supabase RLS policies, permission seed data, and permission testing.
