# Little London Management System

# DATABASE_SCHEMA.md

Version: 2.0

---

# 1. Purpose

This document defines the implementation-ready Supabase PostgreSQL database schema for the Little London Management System.

It is based on all project documentation and specifically resolves the schema gaps identified in `PROJECT_AUDIT.md`.

The schema supports:

- Management, teacher, and parent portals.
- Supabase Auth integration.
- Role-based access control.
- Parent and student management.
- Teacher management.
- Courses, classes, sessions, enrollments, and schedules.
- Attendance.
- Finance: invoices, invoice items, payments, receipts, refunds, and balances.
- Teacher remarks and approval workflow.
- Announcements and notifications.
- Workshops, birthday events, nursery, drama classes, holiday camps, and other activities.
- Documents and Supabase Storage.
- Audit logging.
- Future multi-branch support.

This is a database design document only. It does not define application code.

---

# 2. Database Design Principles

- Use PostgreSQL on Supabase.
- Use UUID primary keys for all application tables.
- Use `auth.users.id` as the authentication identity.
- Store user profile and role data in public application tables.
- Use normalized relational design.
- Avoid duplicated business data.
- Use foreign keys for all relationships.
- Use check constraints for valid statuses and enumerated values.
- Use unique constraints to prevent duplicate records.
- Use indexes for filtering, sorting, joins, dashboard queries, and RLS ownership checks.
- Use soft deletes for business records.
- Keep financial, attendance, and audit history immutable where possible.
- Track `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, and `deleted_by` where operationally relevant.
- Enforce permissions at three layers: UI, API or Server Action, and database RLS.
- Include `branch_id` on operational tables from the beginning for future multi-branch support.
- Store files in Supabase Storage and store metadata in `documents`.
- Use database views for common dashboards and reporting.

---

# 3. Required PostgreSQL Extensions

Enable these extensions in Supabase migrations:

```sql
create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "pg_trgm";
```

Recommended optional extension for advanced search:

```sql
create extension if not exists "unaccent";
```

---

# 4. Naming Standards

- Table names: plural, snake_case.
- Column names: snake_case.
- Primary key: `id uuid primary key default gen_random_uuid()`.
- Foreign keys: `{entity}_id`.
- Timestamps: `created_at`, `updated_at`, `deleted_at`.
- Audit users: `created_by`, `updated_by`, `deleted_by`.
- Status fields: text with check constraints unless a PostgreSQL enum is introduced in migration.

---

# 5. Common Columns

Most operational tables should include:

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key, default `gen_random_uuid()` |
| `branch_id` | uuid | yes for branch-scoped records | FK to `branches.id`; use default main branch for MVP |
| `created_at` | timestamptz | yes | Default `now()` |
| `updated_at` | timestamptz | yes | Default `now()`; maintain with trigger |
| `deleted_at` | timestamptz | no | Soft delete timestamp |
| `created_by` | uuid | no | FK to `auth.users.id` |
| `updated_by` | uuid | no | FK to `auth.users.id` |
| `deleted_by` | uuid | no | FK to `auth.users.id` |

Soft-deleted rows must be excluded from normal application queries and RLS-visible lists unless the user has restore/archive permissions.

---

# 6. Status Values

The following status values should be enforced with check constraints.

## Account Status

- `pending`
- `active`
- `suspended`
- `disabled`
- `archived`

## General Record Status

- `draft`
- `active`
- `inactive`
- `archived`

## Enrollment Status

- `pending`
- `active`
- `paused`
- `completed`
- `cancelled`
- `transferred`
- `archived`

## Session Status

- `scheduled`
- `in_progress`
- `completed`
- `cancelled`

## Attendance Status

- `present`
- `absent`
- `late`
- `excused`
- `sick`
- `cancelled`
- `makeup`

## Invoice Status

- `draft`
- `sent`
- `partially_paid`
- `paid`
- `overdue`
- `void`
- `refunded`
- `cancelled`

## Payment Status

- `pending`
- `completed`
- `failed`
- `refunded`
- `cancelled`

## Teacher Remark Status

- `draft`
- `pending_approval`
- `approved`
- `rejected`
- `archived`

## Announcement Status

- `draft`
- `scheduled`
- `published`
- `archived`

## Notification Status

- `unread`
- `read`
- `archived`

## Document Visibility

- `internal`
- `management`
- `teacher`
- `parent`
- `shared`

---

# 7. Core Identity and RBAC Tables

## 7.1 `branches`

Purpose: Represents Little London locations. MVP may use one default branch, but every operational table should be branch-ready.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `name` | text | yes | Branch display name |
| `code` | text | yes | Unique short code |
| `address_line_1` | text | no |  |
| `address_line_2` | text | no |  |
| `city` | text | no |  |
| `country` | text | yes | Default `Morocco` |
| `phone` | text | no |  |
| `email` | citext | no |  |
| `timezone` | text | yes | Default `Africa/Casablanca` |
| `status` | text | yes | `active`, `inactive`, `archived` |
| common columns | mixed | yes | `created_at`, `updated_at`, soft delete/audit |

Constraints:

- PK: `branches.id`
- Unique: `branches.code`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_branches_status`
- `idx_branches_deleted_at`

RLS:

- Super Admin: full access.
- Admin: read active branch records; future branch managers only read assigned branch.
- Teacher and Parent: read only their associated branch records.

---

## 7.2 `roles`

Purpose: Defines system roles.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `name` | text | yes | `super_admin`, `admin`, `teacher`, `parent` |
| `display_name` | text | yes | User-facing label |
| `description` | text | no |  |
| `is_system_role` | boolean | yes | Default `true` |
| `status` | text | yes | Default `active` |
| common timestamps | mixed | yes | No soft delete for system roles; use status |

Constraints:

- Unique: `roles.name`
- Check: `status in ('active','inactive','archived')`

Seed values:

- `super_admin`
- `admin`
- `teacher`
- `parent`

RLS:

- Authenticated users may read active roles needed for their profile.
- Super Admin manages all roles.
- Admin may read roles but cannot modify Super Admin.

---

## 7.3 `permissions`

Purpose: Defines granular permission keys used by services, UI, and RLS helper functions.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `module` | text | yes | Example: `students`, `invoices`, `attendance` |
| `action` | text | yes | Example: `view`, `create`, `edit`, `archive`, `approve`, `export`, `manage` |
| `scope` | text | yes | `own`, `assigned`, `branch`, `all` |
| `key` | text | yes | Example: `students.view.assigned` |
| `description` | text | no |  |
| `is_system_permission` | boolean | yes | Default `true` |
| common timestamps | mixed | yes |  |

Constraints:

- Unique: `permissions.key`
- Unique: `(module, action, scope)`
- Check: `scope in ('own','assigned','branch','all')`

RLS:

- Authenticated users may read permissions assigned to their role.
- Super Admin manages all permissions.

---

## 7.4 `role_permissions`

Purpose: Many-to-many join between roles and permissions.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `role_id` | uuid | yes | FK to `roles.id` |
| `permission_id` | uuid | yes | FK to `permissions.id` |
| `created_at` | timestamptz | yes | Default `now()` |
| `created_by` | uuid | no | FK to `auth.users.id` |

Constraints:

- Unique: `(role_id, permission_id)`
- FK: `role_id references roles(id) on delete cascade`
- FK: `permission_id references permissions(id) on delete cascade`

RLS:

- Authenticated users may read role permissions for their own role.
- Super Admin manages all.
- Admin may read but not change Super Admin permissions.

---

## 7.5 `user_profiles`

Purpose: Application profile linked one-to-one with Supabase Auth user.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK and FK to `auth.users.id` |
| `branch_id` | uuid | no | FK to `branches.id`; nullable for Super Admin |
| `role_id` | uuid | yes | FK to `roles.id`; exactly one primary role |
| `full_name` | text | yes |  |
| `email` | citext | yes | Should match auth email |
| `phone` | text | no |  |
| `avatar_document_id` | uuid | no | FK to `documents.id`, nullable |
| `status` | text | yes | Account status |
| `last_login_at` | timestamptz | no |  |
| `preferences` | jsonb | yes | Default `{}`; theme, locale, notification choices |
| common columns | mixed | yes | Soft delete for archived app profiles |

Constraints:

- PK/FK: `id references auth.users(id) on delete cascade`
- FK: `role_id references roles(id)`
- FK: `branch_id references branches(id)`
- Unique: `email`
- Check: `status in ('pending','active','suspended','disabled','archived')`

Indexes:

- `idx_user_profiles_role_id`
- `idx_user_profiles_branch_id`
- `idx_user_profiles_status`
- `idx_user_profiles_email`

RLS:

- User can read own profile.
- Parent can read own profile.
- Teacher can read own profile.
- Admin can read and update non-Super Admin profiles in allowed branch.
- Super Admin has full access.
- Only Active users should pass application login checks.

Relationship cardinality:

- `auth.users` 1:1 `user_profiles`
- `roles` 1:many `user_profiles`
- `branches` 1:many `user_profiles`

---

# 8. Parent, Student, and Teacher Tables

## 8.1 `parents`

Purpose: Stores parent or guardian profile data. A parent may be linked to multiple students.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `user_id` | uuid | no | FK to `user_profiles.id`; nullable until portal account exists |
| `first_name` | text | yes |  |
| `last_name` | text | yes |  |
| `full_name` | text | yes | Denormalized for search/display |
| `email` | citext | no | Unique when present and not deleted |
| `phone` | text | yes | Primary phone |
| `alternate_phone` | text | no |  |
| `address_line_1` | text | no |  |
| `address_line_2` | text | no |  |
| `city` | text | no |  |
| `country` | text | yes | Default `Morocco` |
| `preferred_language` | text | no | Example: `en`, `fr`, `ar` |
| `communication_preferences` | jsonb | yes | Default `{}` |
| `portal_status` | text | yes | `not_invited`, `invited`, `active`, `disabled` |
| `status` | text | yes | General record status |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `branch_id references branches(id)`
- FK: `user_id references user_profiles(id)`
- Unique partial: `user_id where user_id is not null`
- Unique partial: `lower(email) where email is not null and deleted_at is null`
- Check: `portal_status in ('not_invited','invited','active','disabled')`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_parents_branch_id`
- `idx_parents_user_id`
- `idx_parents_status`
- `idx_parents_deleted_at`
- `idx_parents_full_name_trgm using gin (full_name gin_trgm_ops)`
- `idx_parents_phone`

Soft delete:

- Archive by setting `deleted_at`, `deleted_by`, and `status = 'archived'`.
- Do not cascade delete students or financial records.

RLS:

- Super Admin: full access.
- Admin: full operational access in branch.
- Teacher: read limited parent contact fields only for assigned students through `parent_student_relationships`.
- Parent: read and update own parent profile contact fields only.

Relationship cardinality:

- `user_profiles` 1:0..1 `parents`
- `parents` many:many `students` through `parent_student_relationships`
- `branches` 1:many `parents`

---

## 8.2 `students`

Purpose: Central child profile.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_number` | text | yes | Human-readable unique identifier |
| `first_name` | text | yes |  |
| `last_name` | text | yes |  |
| `full_name` | text | yes | Denormalized for search/display |
| `date_of_birth` | date | yes |  |
| `gender` | text | no | Optional |
| `primary_language` | text | no |  |
| `school_name` | text | no | External school, if any |
| `photo_document_id` | uuid | no | FK to `documents.id` |
| `medical_notes` | text | no | Sensitive; management and assigned teachers only |
| `allergies` | text | no | Sensitive |
| `emergency_notes` | text | no | Sensitive |
| `status` | text | yes | `active`, `inactive`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `branch_id references branches(id)`
- Unique: `(branch_id, student_number)`
- Check: `date_of_birth <= current_date`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_students_branch_id`
- `idx_students_status`
- `idx_students_deleted_at`
- `idx_students_student_number`
- `idx_students_full_name_trgm using gin (full_name gin_trgm_ops)`
- `idx_students_date_of_birth`

Soft delete:

- Archive only; never hard-delete students with enrollments, attendance, invoices, documents, or audit history.

RLS:

- Super Admin: full access.
- Admin: full access in branch.
- Teacher: read assigned students through active class assignments/enrollments; sensitive medical fields should be exposed only through controlled views or service-layer field selection.
- Parent: read own linked children only through active `parent_student_relationships`; internal notes must not be exposed.

Relationship cardinality:

- `branches` 1:many `students`
- `students` many:many `parents`
- `students` 1:many `enrollments`
- `students` 1:many `attendance_records`
- `students` 1:many `teacher_remarks`
- `students` 1:many `documents`

---

## 8.3 `parent_student_relationships`

Purpose: Many-to-many relationship between parents and students.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `parent_id` | uuid | yes | FK to `parents.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `relationship_type` | text | yes | `mother`, `father`, `guardian`, `other` |
| `is_primary_contact` | boolean | yes | Default `false` |
| `can_pick_up` | boolean | yes | Default `false` |
| `receives_invoices` | boolean | yes | Default `true` |
| `receives_announcements` | boolean | yes | Default `true` |
| `status` | text | yes | Default `active` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `parent_id references parents(id)`
- FK: `student_id references students(id)`
- FK: `branch_id references branches(id)`
- Unique partial: `(parent_id, student_id) where deleted_at is null`
- Check: `relationship_type in ('mother','father','guardian','other')`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_parent_student_parent_id`
- `idx_parent_student_student_id`
- `idx_parent_student_branch_id`
- `idx_parent_student_primary_contact`

RLS:

- Admin/Super Admin: manage in branch.
- Parent: read relationships involving their own `parent_id`.
- Teacher: read relationships for assigned students only, limited to contact purposes.

Relationship cardinality:

- `parents` 1:many `parent_student_relationships`
- `students` 1:many `parent_student_relationships`

---

## 8.4 `student_emergency_contacts`

Purpose: Stores additional emergency contacts beyond linked parents.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `full_name` | text | yes |  |
| `relationship` | text | yes |  |
| `phone` | text | yes |  |
| `alternate_phone` | text | no |  |
| `can_pick_up` | boolean | yes | Default `false` |
| `notes` | text | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `student_id references students(id)`
- Unique partial: `(student_id, phone) where deleted_at is null`

Indexes:

- `idx_student_emergency_contacts_student_id`
- `idx_student_emergency_contacts_branch_id`

RLS:

- Admin/Super Admin: manage in branch.
- Teacher: read for assigned students.
- Parent: read for own child; edit should be service-mediated and may require management review.

---

## 8.5 `teachers`

Purpose: Teacher profile and operational information.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `user_id` | uuid | no | FK to `user_profiles.id`; nullable until account created |
| `teacher_number` | text | yes | Human-readable unique identifier |
| `first_name` | text | yes |  |
| `last_name` | text | yes |  |
| `full_name` | text | yes | Denormalized for search/display |
| `email` | citext | no |  |
| `phone` | text | no |  |
| `profile_photo_document_id` | uuid | no | FK to `documents.id` |
| `qualifications` | text | no |  |
| `availability_notes` | text | no |  |
| `status` | text | yes | `active`, `inactive`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `branch_id references branches(id)`
- FK: `user_id references user_profiles(id)`
- Unique partial: `user_id where user_id is not null`
- Unique: `(branch_id, teacher_number)`
- Unique partial: `lower(email) where email is not null and deleted_at is null`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_teachers_branch_id`
- `idx_teachers_user_id`
- `idx_teachers_status`
- `idx_teachers_full_name_trgm using gin (full_name gin_trgm_ops)`

Soft delete:

- Archive teachers; preserve class, attendance, remark, and audit history.

RLS:

- Super Admin: full access.
- Admin: manage teachers in branch.
- Teacher: read/update own basic profile; read own schedule and assignments.
- Parent: read teacher information connected to their child's active classes.

Relationship cardinality:

- `user_profiles` 1:0..1 `teachers`
- `teachers` many:many `classes` through `class_teachers`
- `teachers` 1:many `teacher_remarks`

---

# 9. Courses, Classes, Sessions, and Enrollments

## 9.1 `rooms`

Purpose: Physical rooms/classrooms used for classes, nursery, workshops, and birthday events.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `name` | text | yes |  |
| `code` | text | no |  |
| `capacity` | integer | yes | Must be greater than 0 |
| `description` | text | no |  |
| `status` | text | yes | Default `active` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Unique: `(branch_id, name)`
- Check: `capacity > 0`
- Check: `status in ('active','inactive','archived')`

Indexes:

- `idx_rooms_branch_id`
- `idx_rooms_status`

RLS:

- Admin/Super Admin: manage.
- Teacher/Parent: read rooms attached to visible classes or events.

---

## 9.2 `courses`

Purpose: Represents a program offering such as English class, drama class, nursery program, holiday camp, seasonal workshop category, or drop-and-play program.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `name` | text | yes |  |
| `slug` | text | yes | URL-safe unique within branch |
| `course_type` | text | yes | `english`, `nursery`, `workshop`, `drama`, `holiday_camp`, `drop_play`, `birthday`, `other` |
| `description` | text | no |  |
| `age_min_months` | integer | no |  |
| `age_max_months` | integer | no |  |
| `default_capacity` | integer | no | Must be greater than 0 when present |
| `default_price` | numeric(12,2) | no | Must be >= 0 |
| `currency` | char(3) | yes | Default `MAD` |
| `status` | text | yes | `draft`, `active`, `inactive`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Unique: `(branch_id, slug)`
- Check: `course_type in ('english','nursery','workshop','drama','holiday_camp','drop_play','birthday','other')`
- Check: `age_min_months is null or age_min_months >= 0`
- Check: `age_max_months is null or age_max_months >= age_min_months`
- Check: `default_capacity is null or default_capacity > 0`
- Check: `default_price is null or default_price >= 0`
- Check: `currency = upper(currency)`
- Check: `status in ('draft','active','inactive','archived')`

Indexes:

- `idx_courses_branch_id`
- `idx_courses_type`
- `idx_courses_status`
- `idx_courses_name_trgm using gin (name gin_trgm_ops)`

RLS:

- Admin/Super Admin: manage in branch.
- Teacher: read assigned courses.
- Parent: read courses for own child's active enrollments and published/active parent-visible courses.

Relationship cardinality:

- `courses` 1:many `classes`
- `courses` 1:many `enrollments`

---

## 9.3 `classes`

Purpose: A scheduled cohort or group within a course.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `course_id` | uuid | yes | FK to `courses.id` |
| `room_id` | uuid | no | FK to `rooms.id` |
| `name` | text | yes | Example: `English A1 Saturday` |
| `code` | text | yes | Unique within branch |
| `capacity` | integer | yes | Must be greater than 0 |
| `start_date` | date | no |  |
| `end_date` | date | no |  |
| `status` | text | yes | `draft`, `active`, `inactive`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `course_id references courses(id)`
- FK: `room_id references rooms(id)`
- Unique: `(branch_id, code)`
- Check: `capacity > 0`
- Check: `end_date is null or start_date is null or end_date >= start_date`
- Check: `status in ('draft','active','inactive','archived')`

Indexes:

- `idx_classes_branch_id`
- `idx_classes_course_id`
- `idx_classes_room_id`
- `idx_classes_status`
- `idx_classes_name_trgm using gin (name gin_trgm_ops)`

RLS:

- Admin/Super Admin: manage in branch.
- Teacher: read assigned classes.
- Parent: read classes for own child's active enrollments.

Relationship cardinality:

- `courses` 1:many `classes`
- `classes` many:many `teachers`
- `classes` 1:many `sessions`
- `classes` 1:many `enrollments`

---

## 9.4 `class_teachers`

Purpose: Assigns one or more teachers to classes.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `class_id` | uuid | yes | FK to `classes.id` |
| `teacher_id` | uuid | yes | FK to `teachers.id` |
| `assignment_type` | text | yes | `primary`, `assistant`, `substitute` |
| `start_date` | date | no |  |
| `end_date` | date | no |  |
| `status` | text | yes | Default `active` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `class_id references classes(id)`
- FK: `teacher_id references teachers(id)`
- Unique partial: `(class_id, teacher_id, assignment_type) where deleted_at is null`
- Check: `assignment_type in ('primary','assistant','substitute')`
- Check: `end_date is null or start_date is null or end_date >= start_date`

Indexes:

- `idx_class_teachers_class_id`
- `idx_class_teachers_teacher_id`
- `idx_class_teachers_branch_id`

RLS:

- Admin/Super Admin: manage.
- Teacher: read own assignments.
- Parent: read teacher assignments for own child's active classes.

---

## 9.5 `sessions`

Purpose: Concrete class occurrence on a date and time. Used for attendance and calendars.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `class_id` | uuid | yes | FK to `classes.id` |
| `room_id` | uuid | no | FK to `rooms.id`, overrides class room if needed |
| `teacher_id` | uuid | no | FK to `teachers.id`, optional session lead |
| `session_date` | date | yes |  |
| `starts_at` | timestamptz | yes |  |
| `ends_at` | timestamptz | yes |  |
| `status` | text | yes | `scheduled`, `in_progress`, `completed`, `cancelled` |
| `cancellation_reason` | text | no | Required by service when status is cancelled |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `class_id references classes(id)`
- FK: `room_id references rooms(id)`
- FK: `teacher_id references teachers(id)`
- Check: `ends_at > starts_at`
- Check: `status in ('scheduled','in_progress','completed','cancelled')`
- Unique partial: `(class_id, starts_at) where deleted_at is null`

Indexes:

- `idx_sessions_branch_date`
- `idx_sessions_class_id`
- `idx_sessions_teacher_id`
- `idx_sessions_room_id`
- `idx_sessions_status`
- `idx_sessions_starts_at`

RLS:

- Admin/Super Admin: manage.
- Teacher: read assigned sessions; update limited operational fields for assigned sessions if allowed.
- Parent: read sessions for own child's active enrollments.

Relationship cardinality:

- `classes` 1:many `sessions`
- `sessions` 1:0..1 `attendance_sessions`

---

## 9.6 `enrollments`

Purpose: Links students to courses/classes and tracks enrollment lifecycle.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `course_id` | uuid | yes | FK to `courses.id` |
| `class_id` | uuid | no | FK to `classes.id`; nullable until class assignment |
| `primary_teacher_id` | uuid | no | FK to `teachers.id`; optional denormalized assignment |
| `registration_source` | text | yes | `website`, `google_form`, `tally`, `manual`, `other` |
| `status` | text | yes | Enrollment status |
| `start_date` | date | yes |  |
| `end_date` | date | no |  |
| `notes` | text | no | Internal notes |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `student_id references students(id)`
- FK: `course_id references courses(id)`
- FK: `class_id references classes(id)`
- FK: `primary_teacher_id references teachers(id)`
- Unique partial: `(student_id, course_id, class_id) where status in ('pending','active','paused') and deleted_at is null`
- Check: `registration_source in ('website','google_form','tally','manual','other')`
- Check: `status in ('pending','active','paused','completed','cancelled','transferred','archived')`
- Check: `end_date is null or end_date >= start_date`

Indexes:

- `idx_enrollments_branch_id`
- `idx_enrollments_student_id`
- `idx_enrollments_course_id`
- `idx_enrollments_class_id`
- `idx_enrollments_status`
- `idx_enrollments_start_date`

RLS:

- Admin/Super Admin: manage.
- Teacher: read enrollments for assigned classes/students.
- Parent: read own child's enrollments only.

Relationship cardinality:

- `students` 1:many `enrollments`
- `courses` 1:many `enrollments`
- `classes` 1:many `enrollments`

---

# 10. Attendance

## 10.1 `attendance_sessions`

Purpose: Attendance header for a class session.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `session_id` | uuid | yes | FK to `sessions.id` |
| `class_id` | uuid | yes | FK to `classes.id` |
| `taken_by` | uuid | no | FK to `teachers.id` or null for admin |
| `taken_at` | timestamptz | no |  |
| `reviewed_by` | uuid | no | FK to `user_profiles.id` |
| `reviewed_at` | timestamptz | no |  |
| `status` | text | yes | `draft`, `submitted`, `reviewed`, `locked` |
| `notes` | text | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `session_id references sessions(id)`
- FK: `class_id references classes(id)`
- FK: `taken_by references teachers(id)`
- FK: `reviewed_by references user_profiles(id)`
- Unique: `session_id`
- Check: `status in ('draft','submitted','reviewed','locked')`

Indexes:

- `idx_attendance_sessions_branch_id`
- `idx_attendance_sessions_class_id`
- `idx_attendance_sessions_session_id`
- `idx_attendance_sessions_status`
- `idx_attendance_sessions_taken_at`

RLS:

- Admin/Super Admin: manage and review.
- Teacher: create/update same-day attendance for assigned sessions until reviewed/locked.
- Parent: no direct write; read only through child attendance views.

Relationship cardinality:

- `sessions` 1:0..1 `attendance_sessions`
- `attendance_sessions` 1:many `attendance_records`

---

## 10.2 `attendance_records`

Purpose: Student-level attendance entry.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `attendance_session_id` | uuid | yes | FK to `attendance_sessions.id` |
| `session_id` | uuid | yes | FK to `sessions.id` for easier querying |
| `student_id` | uuid | yes | FK to `students.id` |
| `enrollment_id` | uuid | no | FK to `enrollments.id` |
| `status` | text | yes | Attendance status |
| `arrival_time` | time | no |  |
| `notes` | text | no | Internal note |
| `marked_by` | uuid | no | FK to `user_profiles.id` |
| `marked_at` | timestamptz | no |  |
| `corrected_by` | uuid | no | FK to `user_profiles.id` |
| `corrected_at` | timestamptz | no |  |
| `correction_reason` | text | no | Required by service when corrected |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `attendance_session_id references attendance_sessions(id) on delete cascade`
- FK: `session_id references sessions(id)`
- FK: `student_id references students(id)`
- FK: `enrollment_id references enrollments(id)`
- Unique: `(attendance_session_id, student_id)`
- Check: `status in ('present','absent','late','excused','sick','cancelled','makeup')`

Indexes:

- `idx_attendance_records_session_id`
- `idx_attendance_records_student_id`
- `idx_attendance_records_status`
- `idx_attendance_records_branch_id`
- `idx_attendance_records_marked_at`

Soft delete:

- Avoid deleting attendance records. Corrections should update correction columns and create audit log entries.

RLS:

- Admin/Super Admin: manage and correct.
- Teacher: create/update same-day records for assigned sessions until reviewed/locked.
- Parent: read own child's attendance only.

---

# 11. Finance

## 11.1 `invoices`

Purpose: Parent/student billing document.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `invoice_number` | text | yes | Unique within branch |
| `parent_id` | uuid | yes | FK to `parents.id`; bill-to parent |
| `student_id` | uuid | no | FK to `students.id`; nullable for family-level invoice |
| `enrollment_id` | uuid | no | FK to `enrollments.id` |
| `issue_date` | date | yes |  |
| `due_date` | date | yes |  |
| `currency` | char(3) | yes | Default `MAD` |
| `subtotal_amount` | numeric(12,2) | yes | Default 0 |
| `discount_amount` | numeric(12,2) | yes | Default 0 |
| `tax_amount` | numeric(12,2) | yes | Default 0 |
| `total_amount` | numeric(12,2) | yes | Default 0 |
| `amount_paid` | numeric(12,2) | yes | Default 0 |
| `balance_due` | numeric(12,2) | yes | Default 0 |
| `status` | text | yes | Invoice status |
| `notes` | text | no | Parent-visible note |
| `internal_notes` | text | no | Management-only |
| `sent_at` | timestamptz | no |  |
| `paid_at` | timestamptz | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `parent_id references parents(id)`
- FK: `student_id references students(id)`
- FK: `enrollment_id references enrollments(id)`
- Unique: `(branch_id, invoice_number)`
- Check: `due_date >= issue_date`
- Check: `subtotal_amount >= 0`
- Check: `discount_amount >= 0`
- Check: `tax_amount >= 0`
- Check: `total_amount >= 0`
- Check: `amount_paid >= 0`
- Check: `balance_due >= 0`
- Check: `currency = upper(currency)`
- Check: `status in ('draft','sent','partially_paid','paid','overdue','void','refunded','cancelled')`

Indexes:

- `idx_invoices_branch_id`
- `idx_invoices_parent_id`
- `idx_invoices_student_id`
- `idx_invoices_enrollment_id`
- `idx_invoices_status`
- `idx_invoices_due_date`
- `idx_invoices_issue_date`
- `idx_invoices_balance_due`

Soft delete:

- Do not hard-delete issued invoices.
- Draft invoices may be archived.
- Voided/cancelled invoices remain for audit history.

RLS:

- Admin/Super Admin: manage in branch.
- Teacher: no access.
- Parent: read invoices where `parent_id` is own parent profile or linked child invoice recipient.

Relationship cardinality:

- `parents` 1:many `invoices`
- `students` 1:many `invoices`
- `invoices` 1:many `invoice_items`
- `invoices` 1:many `payments`
- `invoices` 1:many `receipts`

---

## 11.2 `invoice_items`

Purpose: Line items belonging to invoices.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `invoice_id` | uuid | yes | FK to `invoices.id` |
| `course_id` | uuid | no | FK to `courses.id` |
| `class_id` | uuid | no | FK to `classes.id` |
| `enrollment_id` | uuid | no | FK to `enrollments.id` |
| `description` | text | yes |  |
| `quantity` | numeric(10,2) | yes | Default 1 |
| `unit_price` | numeric(12,2) | yes |  |
| `discount_amount` | numeric(12,2) | yes | Default 0 |
| `tax_amount` | numeric(12,2) | yes | Default 0 |
| `line_total` | numeric(12,2) | yes |  |
| common timestamps | mixed | yes | `created_at`, `updated_at` |

Constraints:

- FK: `invoice_id references invoices(id) on delete cascade`
- FK: `course_id references courses(id)`
- FK: `class_id references classes(id)`
- FK: `enrollment_id references enrollments(id)`
- Check: `quantity > 0`
- Check: `unit_price >= 0`
- Check: `discount_amount >= 0`
- Check: `tax_amount >= 0`
- Check: `line_total >= 0`

Indexes:

- `idx_invoice_items_invoice_id`
- `idx_invoice_items_course_id`
- `idx_invoice_items_enrollment_id`

RLS:

- Same visibility as parent `invoices`.

---

## 11.3 `payments`

Purpose: Payment transaction recorded against an invoice.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `payment_number` | text | yes | Unique within branch |
| `invoice_id` | uuid | yes | FK to `invoices.id` |
| `parent_id` | uuid | yes | FK to `parents.id` |
| `student_id` | uuid | no | FK to `students.id` |
| `amount` | numeric(12,2) | yes | Must be > 0 |
| `currency` | char(3) | yes | Default `MAD` |
| `payment_method` | text | yes | `cash`, `card`, `bank_transfer`, `online`, `other` |
| `payment_date` | date | yes |  |
| `status` | text | yes | Payment status |
| `reference` | text | no | External or manual reference |
| `notes` | text | no |  |
| `recorded_by` | uuid | no | FK to `user_profiles.id` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `invoice_id references invoices(id)`
- FK: `parent_id references parents(id)`
- FK: `student_id references students(id)`
- FK: `recorded_by references user_profiles(id)`
- Unique: `(branch_id, payment_number)`
- Check: `amount > 0`
- Check: `payment_method in ('cash','card','bank_transfer','online','other')`
- Check: `status in ('pending','completed','failed','refunded','cancelled')`

Indexes:

- `idx_payments_branch_id`
- `idx_payments_invoice_id`
- `idx_payments_parent_id`
- `idx_payments_student_id`
- `idx_payments_status`
- `idx_payments_payment_date`

Soft delete:

- Completed payments should not be hard-deleted.
- Use cancellation/refund records and audit logs for changes.

RLS:

- Admin/Super Admin: manage in branch.
- Teacher: no access.
- Parent: read own payment history.

Relationship cardinality:

- `invoices` 1:many `payments`
- `payments` 1:0..1 `receipts`

---

## 11.4 `receipts`

Purpose: Receipt generated from a successful payment.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `receipt_number` | text | yes | Unique within branch |
| `payment_id` | uuid | yes | FK to `payments.id` |
| `invoice_id` | uuid | yes | FK to `invoices.id` |
| `parent_id` | uuid | yes | FK to `parents.id` |
| `student_id` | uuid | no | FK to `students.id` |
| `issued_at` | timestamptz | yes | Default `now()` |
| `amount` | numeric(12,2) | yes | Must be > 0 |
| `currency` | char(3) | yes | Default `MAD` |
| `document_id` | uuid | no | FK to `documents.id` for generated PDF |
| `status` | text | yes | `issued`, `void`, `refunded` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `payment_id references payments(id)`
- FK: `invoice_id references invoices(id)`
- FK: `parent_id references parents(id)`
- FK: `student_id references students(id)`
- Unique: `(branch_id, receipt_number)`
- Unique: `payment_id`
- Check: `amount > 0`
- Check: `status in ('issued','void','refunded')`

Indexes:

- `idx_receipts_branch_id`
- `idx_receipts_payment_id`
- `idx_receipts_invoice_id`
- `idx_receipts_parent_id`
- `idx_receipts_issued_at`

RLS:

- Admin/Super Admin: manage.
- Teacher: no access.
- Parent: read/download own receipts.

---

## 11.5 `refunds`

Purpose: Refund workflow and audit trail.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `payment_id` | uuid | yes | FK to `payments.id` |
| `invoice_id` | uuid | yes | FK to `invoices.id` |
| `amount` | numeric(12,2) | yes | Must be > 0 |
| `reason` | text | yes |  |
| `status` | text | yes | `requested`, `approved`, `rejected`, `processed`, `cancelled` |
| `requested_by` | uuid | no | FK to `user_profiles.id` |
| `approved_by` | uuid | no | FK to `user_profiles.id` |
| `processed_at` | timestamptz | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `payment_id references payments(id)`
- FK: `invoice_id references invoices(id)`
- Check: `amount > 0`
- Check: `status in ('requested','approved','rejected','processed','cancelled')`

Indexes:

- `idx_refunds_branch_id`
- `idx_refunds_payment_id`
- `idx_refunds_invoice_id`
- `idx_refunds_status`

RLS:

- Super Admin/Admin: manage based on refund permission.
- Teacher: no access.
- Parent: read refund status for own invoices only.

---

# 12. Teacher Remarks and Student Progress

## 12.1 `teacher_remarks`

Purpose: Teacher comments about a student requiring management approval before parent visibility.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `class_id` | uuid | no | FK to `classes.id` |
| `session_id` | uuid | no | FK to `sessions.id` |
| `teacher_id` | uuid | yes | FK to `teachers.id` |
| `title` | text | no |  |
| `body` | text | yes | Remark text |
| `status` | text | yes | Teacher remark status |
| `submitted_at` | timestamptz | no |  |
| `reviewed_by` | uuid | no | FK to `user_profiles.id` |
| `reviewed_at` | timestamptz | no |  |
| `review_notes` | text | no | Management-only |
| `visible_to_parent_at` | timestamptz | no | Set when approved |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `student_id references students(id)`
- FK: `class_id references classes(id)`
- FK: `session_id references sessions(id)`
- FK: `teacher_id references teachers(id)`
- FK: `reviewed_by references user_profiles(id)`
- Check: `status in ('draft','pending_approval','approved','rejected','archived')`

Indexes:

- `idx_teacher_remarks_branch_id`
- `idx_teacher_remarks_student_id`
- `idx_teacher_remarks_teacher_id`
- `idx_teacher_remarks_class_id`
- `idx_teacher_remarks_status`
- `idx_teacher_remarks_reviewed_at`

RLS:

- Admin/Super Admin: read all and approve/reject.
- Teacher: create remarks for assigned students; edit own remarks only while `draft` or `pending_approval`; read own approved/rejected history.
- Parent: read only `approved` remarks for own linked children.

Relationship cardinality:

- `students` 1:many `teacher_remarks`
- `teachers` 1:many `teacher_remarks`

---

## 12.2 `student_progress_records`

Purpose: Tracks progress notes or level changes.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `course_id` | uuid | no | FK to `courses.id` |
| `class_id` | uuid | no | FK to `classes.id` |
| `teacher_id` | uuid | no | FK to `teachers.id` |
| `progress_date` | date | yes |  |
| `level` | text | no |  |
| `summary` | text | yes |  |
| `visible_to_parent` | boolean | yes | Default `false` |
| common columns | mixed | yes | Soft delete/audit |

Indexes:

- `idx_student_progress_student_id`
- `idx_student_progress_course_id`
- `idx_student_progress_visible_to_parent`

RLS:

- Admin/Super Admin: manage.
- Teacher: create/read for assigned students.
- Parent: read visible records for own child.

---

# 13. Announcements and Notifications

## 13.1 `announcements`

Purpose: Management-published communication for parents, teachers, everyone, or a specific class.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `title` | text | yes |  |
| `body` | text | yes |  |
| `audience_type` | text | yes | `everyone`, `teachers`, `parents`, `class`, `custom` |
| `class_id` | uuid | no | Required by service when audience is `class` |
| `priority` | text | yes | `low`, `normal`, `high`, `urgent` |
| `status` | text | yes | Announcement status |
| `publish_at` | timestamptz | no | For scheduled announcements |
| `published_at` | timestamptz | no |  |
| `archived_at` | timestamptz | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `class_id references classes(id)`
- Check: `audience_type in ('everyone','teachers','parents','class','custom')`
- Check: `priority in ('low','normal','high','urgent')`
- Check: `status in ('draft','scheduled','published','archived')`

Indexes:

- `idx_announcements_branch_id`
- `idx_announcements_status`
- `idx_announcements_audience_type`
- `idx_announcements_publish_at`
- `idx_announcements_class_id`

RLS:

- Admin/Super Admin: manage.
- Teacher: read published announcements for teachers, everyone, assigned class, or custom recipient.
- Parent: read published announcements for parents, everyone, own child's class, or custom recipient.

---

## 13.2 `announcement_recipients`

Purpose: Explicit recipient list and read tracking for class/custom announcements.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `announcement_id` | uuid | yes | FK to `announcements.id` |
| `user_id` | uuid | yes | FK to `user_profiles.id` |
| `read_at` | timestamptz | no |  |
| `created_at` | timestamptz | yes | Default `now()` |

Constraints:

- FK: `announcement_id references announcements(id) on delete cascade`
- FK: `user_id references user_profiles(id)`
- Unique: `(announcement_id, user_id)`

Indexes:

- `idx_announcement_recipients_announcement_id`
- `idx_announcement_recipients_user_id`
- `idx_announcement_recipients_read_at`

RLS:

- Admin/Super Admin: manage/read.
- User: read own recipient row and update own `read_at`.

---

## 13.3 `notifications`

Purpose: In-app notification records. Email, WhatsApp, SMS, and push can be added later through delivery fields.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `recipient_user_id` | uuid | yes | FK to `user_profiles.id` |
| `actor_user_id` | uuid | no | FK to `user_profiles.id` |
| `title` | text | yes |  |
| `body` | text | no |  |
| `notification_type` | text | yes | `system`, `announcement`, `attendance`, `invoice`, `payment`, `remark`, `event`, `other` |
| `source_table` | text | no | Example: `invoices` |
| `source_id` | uuid | no | Source record ID |
| `status` | text | yes | Notification status |
| `read_at` | timestamptz | no |  |
| `delivery_channels` | text[] | yes | Default `{in_app}` |
| common timestamps | mixed | yes | `created_at`, `updated_at` |

Constraints:

- FK: `recipient_user_id references user_profiles(id)`
- FK: `actor_user_id references user_profiles(id)`
- Check: `notification_type in ('system','announcement','attendance','invoice','payment','remark','event','other')`
- Check: `status in ('unread','read','archived')`

Indexes:

- `idx_notifications_recipient_status`
- `idx_notifications_branch_id`
- `idx_notifications_created_at`
- `idx_notifications_source`

RLS:

- User can read/update own notifications.
- Admin/Super Admin can create notifications in branch.
- Service role can create system notifications.

---

# 14. Workshops, Birthday Events, and Nursery

## 14.1 `workshops`

Purpose: Specific workshop or activity offering, such as arts and crafts, baking, seasonal events, or holiday camps.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `course_id` | uuid | no | FK to `courses.id` when modeled as course |
| `room_id` | uuid | no | FK to `rooms.id` |
| `title` | text | yes |  |
| `workshop_type` | text | yes | `arts_crafts`, `baking`, `drama`, `holiday_camp`, `seasonal`, `drop_play`, `other` |
| `description` | text | no |  |
| `starts_at` | timestamptz | yes |  |
| `ends_at` | timestamptz | yes |  |
| `capacity` | integer | yes | Must be > 0 |
| `price` | numeric(12,2) | yes | Default 0 |
| `currency` | char(3) | yes | Default `MAD` |
| `status` | text | yes | `draft`, `active`, `completed`, `cancelled`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `course_id references courses(id)`
- FK: `room_id references rooms(id)`
- Check: `ends_at > starts_at`
- Check: `capacity > 0`
- Check: `price >= 0`
- Check: `workshop_type in ('arts_crafts','baking','drama','holiday_camp','seasonal','drop_play','other')`
- Check: `status in ('draft','active','completed','cancelled','archived')`

Indexes:

- `idx_workshops_branch_id`
- `idx_workshops_type`
- `idx_workshops_starts_at`
- `idx_workshops_status`

RLS:

- Admin/Super Admin: manage.
- Teacher: read assigned workshops through `workshop_teachers`.
- Parent: read workshops where own child is registered; future online booking may expose published active workshops.

---

## 14.2 `workshop_teachers`

Purpose: Assigns teachers/staff to workshops.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `workshop_id` | uuid | yes | FK to `workshops.id` |
| `teacher_id` | uuid | yes | FK to `teachers.id` |
| `assignment_type` | text | yes | `lead`, `assistant` |
| `created_at` | timestamptz | yes | Default `now()` |

Constraints:

- Unique: `(workshop_id, teacher_id)`
- Check: `assignment_type in ('lead','assistant')`

Indexes:

- `idx_workshop_teachers_workshop_id`
- `idx_workshop_teachers_teacher_id`

RLS:

- Admin/Super Admin: manage.
- Teacher: read own assignments.

---

## 14.3 `workshop_registrations`

Purpose: Student registration for a workshop.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `workshop_id` | uuid | yes | FK to `workshops.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `parent_id` | uuid | no | FK to `parents.id` |
| `invoice_id` | uuid | no | FK to `invoices.id` |
| `status` | text | yes | `registered`, `waitlisted`, `cancelled`, `completed` |
| `registered_at` | timestamptz | yes | Default `now()` |
| `notes` | text | no |  |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Unique partial: `(workshop_id, student_id) where deleted_at is null`
- Check: `status in ('registered','waitlisted','cancelled','completed')`

Indexes:

- `idx_workshop_registrations_workshop_id`
- `idx_workshop_registrations_student_id`
- `idx_workshop_registrations_status`

RLS:

- Admin/Super Admin: manage.
- Teacher: read registrations for assigned workshops.
- Parent: read own child's registrations.

---

## 14.4 `birthday_events`

Purpose: Birthday party booking and event management.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `parent_id` | uuid | yes | FK to `parents.id` |
| `room_id` | uuid | no | FK to `rooms.id` |
| `invoice_id` | uuid | no | FK to `invoices.id` |
| `title` | text | yes |  |
| `event_date` | date | yes |  |
| `starts_at` | timestamptz | yes |  |
| `ends_at` | timestamptz | yes |  |
| `package_name` | text | no |  |
| `guest_count` | integer | no | Must be >= 0 |
| `decoration_notes` | text | no |  |
| `special_requests` | text | no |  |
| `status` | text | yes | `draft`, `confirmed`, `completed`, `cancelled`, `archived` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `student_id references students(id)`
- FK: `parent_id references parents(id)`
- FK: `room_id references rooms(id)`
- FK: `invoice_id references invoices(id)`
- Check: `ends_at > starts_at`
- Check: `guest_count is null or guest_count >= 0`
- Check: `status in ('draft','confirmed','completed','cancelled','archived')`

Indexes:

- `idx_birthday_events_branch_id`
- `idx_birthday_events_student_id`
- `idx_birthday_events_parent_id`
- `idx_birthday_events_event_date`
- `idx_birthday_events_status`

RLS:

- Admin/Super Admin: manage.
- Teacher: read assigned participation schedule through staff assignments.
- Parent: read booking status for own child.

---

## 14.5 `birthday_event_staff`

Purpose: Staff assignment to birthday events.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `birthday_event_id` | uuid | yes | FK to `birthday_events.id` |
| `teacher_id` | uuid | no | FK to `teachers.id` |
| `user_id` | uuid | no | FK to `user_profiles.id` for non-teacher staff |
| `role` | text | yes | Example: `host`, `assistant`, `decorator` |
| `created_at` | timestamptz | yes | Default `now()` |

Constraints:

- At least one of `teacher_id` or `user_id` must be present.
- Unique: `(birthday_event_id, teacher_id)` where teacher is present.
- Unique: `(birthday_event_id, user_id)` where user is present.

Indexes:

- `idx_birthday_event_staff_event_id`
- `idx_birthday_event_staff_teacher_id`
- `idx_birthday_event_staff_user_id`

RLS:

- Admin/Super Admin: manage.
- Assigned staff: read own assignment.

---

## 14.6 `nursery_enrollments`

Purpose: Nursery-specific enrollment details for young children.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `course_id` | uuid | no | FK to nursery course/program |
| `class_id` | uuid | no | FK to nursery class/room group |
| `room_id` | uuid | no | FK to `rooms.id` |
| `primary_teacher_id` | uuid | no | FK to `teachers.id` |
| `start_date` | date | yes |  |
| `end_date` | date | no |  |
| `schedule_pattern` | jsonb | yes | Default `{}`; days/times |
| `status` | text | yes | Enrollment status |
| `notes` | text | no | Internal notes |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- FK: `student_id references students(id)`
- FK: `course_id references courses(id)`
- FK: `class_id references classes(id)`
- FK: `room_id references rooms(id)`
- FK: `primary_teacher_id references teachers(id)`
- Check: `end_date is null or end_date >= start_date`
- Check: `status in ('pending','active','paused','completed','cancelled','transferred','archived')`

Indexes:

- `idx_nursery_enrollments_student_id`
- `idx_nursery_enrollments_class_id`
- `idx_nursery_enrollments_status`

RLS:

- Admin/Super Admin: manage.
- Teacher: read assigned nursery children.
- Parent: read own child's nursery enrollment.

---

## 14.7 `nursery_daily_notes`

Purpose: Daily nursery notes visible to parents when marked parent-visible.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `nursery_enrollment_id` | uuid | yes | FK to `nursery_enrollments.id` |
| `student_id` | uuid | yes | FK to `students.id` |
| `note_date` | date | yes |  |
| `summary` | text | yes | Parent-safe summary |
| `meals` | text | no |  |
| `nap_notes` | text | no |  |
| `activities` | text | no |  |
| `incident_notes` | text | no | Sensitive; management/teacher only unless explicitly shared |
| `visible_to_parent` | boolean | yes | Default `true` |
| `created_by_teacher_id` | uuid | no | FK to `teachers.id` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Unique partial: `(nursery_enrollment_id, note_date) where deleted_at is null`

Indexes:

- `idx_nursery_daily_notes_student_date`
- `idx_nursery_daily_notes_visible_to_parent`

RLS:

- Admin/Super Admin: manage.
- Teacher: create/read for assigned nursery students.
- Parent: read visible notes for own child only.

---

# 15. Documents and Storage Metadata

## 15.1 `documents`

Purpose: Metadata for files stored in Supabase Storage.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `bucket_name` | text | yes | Supabase Storage bucket |
| `storage_path` | text | yes | Object path |
| `file_name` | text | yes | Original filename |
| `mime_type` | text | yes | `image/jpeg`, `image/png`, `application/pdf` |
| `file_size_bytes` | bigint | yes | Max 10 MB |
| `document_type` | text | yes | `student_photo`, `teacher_photo`, `parent_document`, `birth_certificate`, `medical_report`, `invoice_pdf`, `receipt_pdf`, `report_pdf`, `other` |
| `owner_type` | text | yes | `student`, `parent`, `teacher`, `invoice`, `receipt`, `report`, `system` |
| `owner_id` | uuid | yes | ID of owner record |
| `visibility` | text | yes | Document visibility |
| `uploaded_by` | uuid | no | FK to `user_profiles.id` |
| `status` | text | yes | `active`, `archived`, `deleted` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Unique: `(bucket_name, storage_path)`
- Check: `file_size_bytes > 0 and file_size_bytes <= 10485760`
- Check: `mime_type in ('image/jpeg','image/png','application/pdf')`
- Check: `document_type in ('student_photo','teacher_photo','parent_document','birth_certificate','medical_report','invoice_pdf','receipt_pdf','report_pdf','other')`
- Check: `owner_type in ('student','parent','teacher','invoice','receipt','report','system')`
- Check: `visibility in ('internal','management','teacher','parent','shared')`
- Check: `status in ('active','archived','deleted')`

Indexes:

- `idx_documents_branch_id`
- `idx_documents_owner`
- `idx_documents_bucket_path`
- `idx_documents_document_type`
- `idx_documents_visibility`

Soft delete:

- Soft delete metadata first.
- Physical object deletion should be restricted to Super Admin/service role and audited.

RLS:

- Admin/Super Admin: manage branch documents.
- Teacher: read documents for assigned students/classes where visibility permits.
- Parent: read own child documents where visibility is `parent` or `shared`; read own invoices/receipts.
- Users may upload documents only through service-validated flows.

---

# 16. Audit, Imports, and Activity

## 16.1 `audit_logs`

Purpose: Immutable audit trail for sensitive and operational actions.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | no | Nullable for global auth/system actions |
| `actor_user_id` | uuid | no | FK to `user_profiles.id` |
| `actor_role` | text | no | Role at time of action |
| `action` | text | yes | Example: `student.created`, `invoice.updated` |
| `entity_table` | text | no | Affected table |
| `entity_id` | uuid | no | Affected record |
| `old_values` | jsonb | no | Sensitive fields should be redacted |
| `new_values` | jsonb | no | Sensitive fields should be redacted |
| `metadata` | jsonb | yes | Default `{}`; IP/device where available |
| `created_at` | timestamptz | yes | Default `now()` |

Constraints:

- FK: `actor_user_id references user_profiles(id)`

Indexes:

- `idx_audit_logs_branch_id`
- `idx_audit_logs_actor_user_id`
- `idx_audit_logs_action`
- `idx_audit_logs_entity`
- `idx_audit_logs_created_at`

Soft delete:

- No soft delete.
- Audit logs are append-only.
- Updates and deletes should be blocked except for Super Admin/service role under documented retention policies.

RLS:

- Super Admin: read all.
- Admin: read branch audit logs if granted audit permission.
- Teacher/Parent: no direct access.
- Service role: insert.

---

## 16.2 `registration_submissions`

Purpose: Stores incoming registrations from website, Google Form, Tally Form, and manual entry before conversion into parent/student/enrollment records.

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | PK |
| `branch_id` | uuid | yes | FK to `branches.id` |
| `source` | text | yes | `website`, `google_form`, `tally`, `manual`, `other` |
| `parent_payload` | jsonb | yes | Raw/normalized parent data |
| `student_payload` | jsonb | yes | Raw/normalized student data |
| `requested_course_id` | uuid | no | FK to `courses.id` |
| `status` | text | yes | `new`, `in_review`, `approved`, `rejected`, `converted`, `duplicate` |
| `reviewed_by` | uuid | no | FK to `user_profiles.id` |
| `reviewed_at` | timestamptz | no |  |
| `converted_parent_id` | uuid | no | FK to `parents.id` |
| `converted_student_id` | uuid | no | FK to `students.id` |
| `converted_enrollment_id` | uuid | no | FK to `enrollments.id` |
| common columns | mixed | yes | Soft delete/audit |

Constraints:

- Check: `source in ('website','google_form','tally','manual','other')`
- Check: `status in ('new','in_review','approved','rejected','converted','duplicate')`

Indexes:

- `idx_registration_submissions_branch_id`
- `idx_registration_submissions_source`
- `idx_registration_submissions_status`
- `idx_registration_submissions_created_at`

RLS:

- Admin/Super Admin: manage in branch.
- Parent/Teacher: no direct access.
- Public form submissions must be inserted through a controlled server endpoint, not direct anonymous table access.

---

# 17. Database Views

Views should be used for dashboard and report queries. Views must not bypass RLS unless explicitly created as secure server-side reporting views with service-role access.

## 17.1 `active_students_view`

Purpose: Student list with primary parent and active enrollment summary.

Fields:

- `student_id`
- `branch_id`
- `student_number`
- `student_name`
- `date_of_birth`
- `status`
- `primary_parent_name`
- `primary_parent_phone`
- `active_enrollment_count`
- `current_class_names`

## 17.2 `parent_children_view`

Purpose: Parent portal children overview.

Fields:

- `parent_id`
- `student_id`
- `relationship_type`
- `student_name`
- `student_status`
- `active_courses`
- `next_session_at`

## 17.3 `teacher_assignments_view`

Purpose: Teacher dashboard and timetable.

Fields:

- `teacher_id`
- `class_id`
- `course_id`
- `class_name`
- `course_name`
- `next_session_at`
- `student_count`

## 17.4 `attendance_summary_view`

Purpose: Dashboard and attendance reports.

Fields:

- `branch_id`
- `class_id`
- `student_id`
- `session_date`
- `attendance_status`
- `month`
- `year`

## 17.5 `invoice_balances_view`

Purpose: Finance dashboard and parent portal balances.

Fields:

- `invoice_id`
- `branch_id`
- `parent_id`
- `student_id`
- `invoice_number`
- `issue_date`
- `due_date`
- `total_amount`
- `amount_paid`
- `balance_due`
- `status`

## 17.6 `dashboard_metrics_view`

Purpose: Management dashboard KPI source.

Fields:

- `branch_id`
- `active_student_count`
- `active_parent_count`
- `active_teacher_count`
- `today_class_count`
- `today_attendance_count`
- `outstanding_invoice_count`
- `outstanding_balance_total`
- `pending_teacher_remarks_count`
- `upcoming_birthday_count`
- `upcoming_workshop_count`

## 17.7 `global_search_view`

Purpose: Unified search across students, parents, teachers, courses, workshops, payments, invoices, and announcements.

Fields:

- `entity_type`
- `entity_id`
- `branch_id`
- `title`
- `subtitle`
- `search_text`
- `status`
- `created_at`

Security:

- Use RLS-aware source tables or query through permission-checked Server Actions.
- Do not expose financial or medical search results to unauthorized roles.

---

# 18. Index Strategy

Create indexes for:

- Every foreign key.
- Every `branch_id`.
- Every `status` used in filters.
- Every `deleted_at` used for soft-delete filtering.
- Every date used in reports or dashboards.
- Every user ownership path used in RLS.
- Text search fields using trigram indexes.

Critical indexes:

- `user_profiles(role_id, status)`
- `parents(user_id)`
- `parents(branch_id, status, deleted_at)`
- `students(branch_id, status, deleted_at)`
- `parent_student_relationships(parent_id, student_id, status)`
- `teachers(user_id)`
- `class_teachers(teacher_id, class_id, status)`
- `sessions(class_id, starts_at)`
- `sessions(branch_id, session_date)`
- `enrollments(student_id, status)`
- `enrollments(class_id, status)`
- `attendance_sessions(session_id)`
- `attendance_records(student_id, session_id)`
- `invoices(parent_id, status, due_date)`
- `invoices(branch_id, status, balance_due)`
- `payments(invoice_id, payment_date)`
- `teacher_remarks(student_id, status)`
- `teacher_remarks(teacher_id, status)`
- `announcements(branch_id, status, publish_at)`
- `notifications(recipient_user_id, status, created_at)`
- `documents(owner_type, owner_id)`
- `audit_logs(entity_table, entity_id, created_at)`

---

# 19. Soft Delete Rules

Soft delete applies to:

- `parents`
- `students`
- `teachers`
- `courses`
- `classes`
- `sessions`
- `enrollments`
- `invoices`
- `payments`
- `receipts`
- `teacher_remarks`
- `announcements`
- `workshops`
- `birthday_events`
- `nursery_enrollments`
- `documents`

Soft delete does not apply to:

- `audit_logs`
- `role_permissions`
- `announcement_recipients`
- Most immutable history rows unless explicitly archived.

Rules:

- Soft delete uses `deleted_at` and `deleted_by`.
- Operational status should become `archived` where the table supports it.
- Hard delete is reserved for test data, failed drafts with no dependencies, or Super Admin/service maintenance.
- Students, parents, teachers, financial records, attendance records, and audit logs must not be hard-deleted in production.
- Restore operations must be audited.

---

# 20. Audit Timestamp Rules

All tables with common columns require:

- `created_at default now()`
- `updated_at default now()`
- `deleted_at nullable`
- `created_by nullable references auth.users(id)`
- `updated_by nullable references auth.users(id)`
- `deleted_by nullable references auth.users(id)`

Implementation requirements:

- Use a database trigger to maintain `updated_at`.
- Application services should set `created_by`, `updated_by`, and `deleted_by`.
- Sensitive actions must also insert `audit_logs`.

Sensitive audited actions include:

- Login success/failure.
- Logout.
- User creation.
- Role or permission change.
- Student creation/update/archive/restore.
- Parent creation/update/archive/restore.
- Teacher creation/update/archive/restore.
- Attendance submit/correct/delete/archive.
- Invoice creation/update/void.
- Payment creation/update/refund/cancel.
- Receipt generation.
- Teacher remark approval/rejection.
- Document upload/download/delete for sensitive files.
- Registration conversion.

---

# 21. Row Level Security Strategy

RLS must be enabled on every application table.

## 21.1 Required Helper Concepts

Migrations should define security helper functions for policies, such as:

- Current user ID from `auth.uid()`.
- Current user's role.
- Current user's branch.
- Whether current user is Super Admin.
- Whether current user is Admin.
- Whether current user is Teacher.
- Whether current user is Parent.
- Whether current user has a permission key.
- Whether a student belongs to the current parent.
- Whether a student belongs to the current teacher through assigned classes.
- Whether a class belongs to the current teacher.

These helpers should be implemented as stable SQL functions in migrations.

## 21.2 Role Visibility Rules

Super Admin:

- Full access to all records.
- Can manage system settings, roles, permissions, branches, and authentication-related records.

Admin:

- Full operational access for assigned branch.
- Cannot modify Super Admin account, global security settings, or infrastructure.

Teacher:

- Can read assigned classes, sessions, students, courses, announcements, and schedules.
- Can mark and edit same-day attendance for assigned sessions until reviewed/locked.
- Can create teacher remarks for assigned students.
- Cannot view financial data.
- Cannot manage users.

Parent:

- Can read own profile.
- Can read own linked children.
- Can read own child's attendance, schedule, enrollments, invoices, receipts, payment history, approved remarks, and announcements.
- Cannot edit school records, attendance, remarks, grades, invoices, or payments.

## 21.3 Per-Table RLS Summary

| Table Group | Super Admin | Admin | Teacher | Parent |
| --- | --- | --- | --- | --- |
| `branches` | full | read branch | read own branch | read own branch |
| `roles`, `permissions` | full | read limited | read own role permissions | read own role permissions |
| `user_profiles` | full | manage branch non-super-admin | read/update own | read/update own |
| `parents` | full | manage branch | read contacts for assigned students | read/update own contact profile |
| `students` | full | manage branch | read assigned students | read own children |
| `teachers` | full | manage branch | read/update own profile | read child's teachers |
| `courses`, `classes`, `sessions` | full | manage branch | read assigned | read own child's |
| `enrollments` | full | manage branch | read assigned | read own child's |
| `attendance_sessions`, `attendance_records` | full | manage/review | mark assigned same-day | read own child's |
| `invoices`, `invoice_items`, `payments`, `receipts`, `refunds` | full | manage branch | no access | read own family records |
| `teacher_remarks` | full | approve/manage | create/read own assigned | read approved own child only |
| `announcements` | full | manage branch | read published audience | read published audience |
| `notifications` | full | create/manage branch | read own | read own |
| `workshops`, `birthday_events`, `nursery` | full | manage branch | read assigned | read own child's |
| `documents` | full | manage branch | read permitted assigned | read permitted own |
| `audit_logs` | full | read branch if permitted | none | none |

## 21.4 Service Role Rules

The Supabase service role key may bypass RLS only in trusted server-side code.

Allowed service role operations:

- Auth user provisioning.
- Registration conversion.
- System notification generation.
- Report generation.
- Storage signed URL creation.
- Controlled audit log insertion.

Service role must never be exposed to the client.

---

# 22. Supabase Storage Buckets

All uploads must be stored in Supabase Storage. Maximum file size is 10 MB unless a stricter bucket rule applies.

Allowed file formats:

- JPG
- PNG
- PDF

## 22.1 Buckets

| Bucket | Visibility | Allowed Types | Purpose |
| --- | --- | --- | --- |
| `student-photos` | private | JPG, PNG | Student profile photos |
| `teacher-photos` | private | JPG, PNG | Teacher profile photos |
| `parent-documents` | private | JPG, PNG, PDF | Parent-provided documents |
| `student-documents` | private | JPG, PNG, PDF | Birth certificates, medical reports |
| `invoices` | private | PDF | Generated invoice PDFs |
| `receipts` | private | PDF | Generated receipt PDFs |
| `reports` | private | PDF, CSV, XLSX if supported later | Generated reports |
| `system-assets` | public or private | JPG, PNG | Logos and controlled system assets |

## 22.2 Storage Access Rules

- No sensitive bucket should be public.
- Access should be granted through signed URLs after database authorization.
- Storage object path should include `branch_id` and owner information.
- Example path: `{branch_id}/students/{student_id}/photo/{document_id}.jpg`.
- Every stored file must have a `documents` metadata row.
- Downloads of sensitive documents should be audited.
- Physical deletion should be restricted to Super Admin/service role.

## 22.3 Storage RLS Alignment

Storage policies must match `documents` authorization:

- Admin can manage files in their branch.
- Teacher can access assigned student documents only when visibility permits.
- Parent can access own child's parent-visible documents, own invoices, and own receipts.
- Super Admin can access all.

---

# 23. Future Multi-Branch Support

The system should be single-branch capable at launch and multi-branch ready without major schema changes.

## 23.1 Current Design Requirements

- Include `branch_id` on all operational records.
- Use `(branch_id, code)` or `(branch_id, number)` for human-readable identifiers.
- Scope dashboard, reporting, search, and exports by branch.
- Scope RLS by branch for Admin users.
- Allow Super Admin to operate across branches.

## 23.2 Future Tables

Future branch-level expansion may add:

- `user_branch_assignments`
- `branch_settings`
- `branch_billing_settings`
- `branch_calendar_settings`
- `branch_holidays`
- `branch_transfer_requests`
- `inter_branch_student_transfers`

## 23.3 Future Role Scope

Future roles may be scoped by branch:

- Branch Manager.
- Accountant.
- Receptionist.
- Marketing.
- Read-only auditor.

This may require replacing one primary role with `user_role_assignments` containing `user_id`, `role_id`, `branch_id`, and optional expiration dates. For MVP, `user_profiles.role_id` remains the source of truth because documentation requires exactly one primary role.

---

# 24. Relationship Summary

- One branch has many users, parents, students, teachers, rooms, courses, classes, sessions, invoices, events, documents, notifications, and audit logs.
- One user profile has exactly one role.
- One user profile may map to one parent profile.
- One user profile may map to one teacher profile.
- One parent may be linked to many students.
- One student may be linked to many parents or guardians.
- One course has many classes.
- One class belongs to one course.
- One class may have many teachers.
- One teacher may teach many classes.
- One class has many sessions.
- One student has many enrollments.
- One enrollment links a student to one course and optionally one class.
- One session has zero or one attendance session.
- One attendance session has many attendance records.
- One student has many attendance records.
- One parent has many invoices.
- One invoice has many invoice items.
- One invoice has many payments.
- One payment has zero or one receipt.
- One teacher has many teacher remarks.
- One student has many teacher remarks.
- One announcement may have many explicit recipients.
- One user has many notifications.
- One workshop has many registrations.
- One birthday event belongs to one student and one parent.
- One nursery enrollment belongs to one student.
- One owner record may have many documents.
- One user may create many audit logs.

---

# 25. Implementation Notes for Migrations

Migration order should be:

1. Extensions.
2. Shared helper functions and timestamp triggers.
3. `branches`.
4. RBAC tables: `roles`, `permissions`, `role_permissions`.
5. `user_profiles`.
6. People tables: `parents`, `students`, `teachers`, relationships, emergency contacts.
7. Rooms, courses, classes, teachers, sessions, enrollments.
8. Attendance.
9. Finance.
10. Remarks and progress.
11. Announcements and notifications.
12. Workshops, birthday events, nursery.
13. Documents.
14. Audit logs and registration submissions.
15. Indexes.
16. Views.
17. RLS helper functions.
18. RLS policies.
19. Storage buckets and storage policies.
20. Seed default branch, roles, and permissions.

Each migration must be tested in development and staging before production.

---

# 26. Final Goal

This schema is designed to be secure, relational, scalable, and implementation-ready for Supabase.

It supports Little London's current operational requirements while preserving a clean path for future multi-branch management, mobile apps, online payments, messaging integrations, AI-assisted reporting, and expanded activity programs.
