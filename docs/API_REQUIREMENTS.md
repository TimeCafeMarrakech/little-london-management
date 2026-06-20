# Little London School Management System

# API_REQUIREMENTS.md

Version: 2.0

---

# 1. Purpose

This document defines the implementation-ready API specification for the Little London School Management System.

It is aligned with:

- `DATABASE_SCHEMA.md`
- `PERMISSIONS.md`
- `AUTHENTICATION.md`
- `ROADMAP.md`
- `PROJECT_AUDIT.md`

The API layer must be secure, typed, validated, auditable, and consistent. All protected operations must verify authentication, role, permission, ownership scope, branch scope where applicable, and Row Level Security expectations.

This document is an API contract specification only. It does not include application code.

---

# 2. API Architecture

Primary API style:

- Use Server Actions for internal authenticated app workflows.
- Use Route Handlers for public form submissions, file upload signing, downloads, report exports, webhooks, and integrations.
- Use Supabase Auth for authentication.
- Use Supabase PostgreSQL with RLS for data authorization.
- Use Supabase Storage for files.

Internal business logic should live in reusable services. UI components must not contain business logic.

---

# 3. Standard Response Contracts

## 3.1 Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {}
}
```

## 3.2 Error Response

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "code": "invalid_email",
      "message": "Email address is invalid."
    }
  ]
}
```

## 3.3 List Response

```json
{
  "success": true,
  "message": "Records loaded successfully.",
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalRecords": 0,
    "totalPages": 0,
    "sort": "created_at",
    "direction": "desc"
  }
}
```

---

# 4. Shared Standards

## 4.1 Authentication Rules

Every protected Server Action or Route Handler must verify:

1. User is authenticated.
2. User profile exists.
3. User status is `active`.
4. Session is valid.
5. Role is allowed.
6. Required permission exists.
7. Ownership scope is satisfied.
8. Branch scope is satisfied where applicable.

Public endpoints are allowed only where explicitly listed.

## 4.2 Authorization Format

Each operation must declare:

- Required role.
- Required permission key.
- Ownership scope.

Examples:

- `students.manage.all`
- `students.view.assigned_students`
- `students.view.own_child`
- `attendance.edit.assigned_classes_same_day`
- `invoices.download.own_child`

## 4.3 Pagination

All list operations must support:

| Parameter | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `page` | number | no | 1 | Minimum 1 |
| `pageSize` | number | no | 20 | Maximum 100 |

## 4.4 Sorting

All list operations should support:

| Parameter | Type | Required | Default |
| --- | --- | --- | --- |
| `sort` | string | no | `created_at` |
| `direction` | `asc` or `desc` | no | `desc` |

Allowed sort fields must be whitelisted per module.

## 4.5 Filtering

List filters should use typed fields, not raw SQL.

Common filters:

- `query`
- `status`
- `branchId`
- `studentId`
- `parentId`
- `teacherId`
- `courseId`
- `classId`
- `dateFrom`
- `dateTo`
- `paymentStatus`
- `attendanceStatus`

## 4.6 Common Error Cases

All operations may return:

- `unauthorized`: user is not authenticated.
- `forbidden`: user lacks role, permission, ownership, or branch access.
- `validation_failed`: request data is invalid.
- `not_found`: record does not exist or is not visible to the user.
- `duplicate_record`: unique constraint or duplicate detection failed.
- `archived_record`: record is archived and cannot be modified by this action.
- `conflict`: operation conflicts with business rules.
- `rate_limited`: too many attempts.
- `internal_error`: unexpected server error.

Never expose raw database or Supabase service errors to users.

## 4.7 Audit Logging

Every sensitive mutation must create an `audit_logs` entry with:

- `actor_user_id`
- `actor_role`
- `branch_id`
- `action`
- `entity_table`
- `entity_id`
- redacted `old_values`
- redacted `new_values`
- metadata such as IP/device where available

Read actions are audited only for sensitive downloads, exports, audit log viewing, and medical/financial document access.

---

# 5. Authentication

Authentication uses Supabase Auth. Auth Server Actions may call Supabase Auth APIs internally.

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Login | `loginAction` | Server Action | Authenticate user and load profile, role, permissions | Public |
| Logout | `logoutAction` | Server Action | End current session | Authenticated |
| Forgot password | `forgotPasswordAction` | Server Action | Send password reset email | Public |
| Reset password | `resetPasswordAction` | Server Action | Set new password from reset token | Public token |
| Refresh session | `refreshSessionAction` | Server Action | Refresh session silently | Authenticated |
| Current user | `getCurrentUserAction` | Server Action | Return active user, role, permissions, linked parent/teacher data | Authenticated |

Request body:

- Login: `{ "email": "string", "password": "string", "rememberMe": true }`
- Forgot password: `{ "email": "string" }`
- Reset password: `{ "token": "string", "password": "string" }`

Response body:

- User profile from `user_profiles`.
- Role from `roles`.
- Permission keys from `permissions`.
- Parent profile ID when role is Parent.
- Teacher profile ID when role is Teacher.

Validation:

- Email required and valid.
- Password required.
- New password must satisfy password policy.
- Account must be `active`.

Audit:

- Log login success, login failure, logout, password reset request, password changed, disabled account attempts.

---

# 6. User Management

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List users | `listUsersAction` | Server Action | Paginated users with roles/status | Super Admin `user_management.manage.all`; Admin `user_management.manage.all_non_super_admin` |
| Get user | `getUserAction` | Server Action | User profile detail | Same as list; user may view own |
| Create user | `createUserAction` | Server Action | Create Supabase Auth user and `user_profiles` row | Super Admin; Admin non-Super-Admin |
| Update user | `updateUserAction` | Server Action | Update profile, status, branch, role where allowed | Super Admin; Admin non-Super-Admin |
| Activate user | `activateUserAction` | Server Action | Set status `active` | Super Admin; Admin non-Super-Admin |
| Disable user | `disableUserAction` | Server Action | Set status `disabled` | Super Admin; Admin non-Super-Admin |
| Archive user | `archiveUserAction` | Server Action | Soft archive user profile | Super Admin; Admin non-Super-Admin |
| Restore user | `restoreUserAction` | Server Action | Restore archived user | Super Admin; Admin non-Super-Admin |
| Assign role | `assignUserRoleAction` | Server Action | Change user primary role | Super Admin; Admin cannot assign Super Admin |
| Update own profile | `updateOwnProfileAction` | Server Action | User updates own contact/preferences | Authenticated `parents.edit.own_contact` or own profile |

Request body:

- Create/update: `fullName`, `email`, `phone`, `roleId`, `branchId`, `status`, optional linked `parentId` or `teacherId`.

Response body:

- `userProfile`
- `role`
- `permissions`

Validation:

- Email unique and valid.
- Role exists and active.
- Admin cannot create, edit, disable, archive, restore, or assign Super Admin.
- User status must be valid account status.

Audit:

- Log create, update, activate, disable, archive, restore, role assignment.

List filters/sorting:

- Filters: `query`, `roleId`, `status`, `branchId`.
- Sort: `full_name`, `email`, `status`, `created_at`, `updated_at`.

---

# 7. Registration

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Submit public registration | `/api/registrations/public` | POST | Website registration intake | Public, rate-limited |
| Import registrations | `importRegistrationsAction` | Server Action | Import Google/Tally/manual submissions | Admin `registrations.import.all` |
| List submissions | `listRegistrationSubmissionsAction` | Server Action | Review queue | Admin `registrations.manage.all` |
| Get submission | `getRegistrationSubmissionAction` | Server Action | Submission detail | Admin `registrations.manage.all` |
| Review submission | `reviewRegistrationSubmissionAction` | Server Action | Mark in review, add notes | Admin `registrations.manage.all` |
| Approve submission | `approveRegistrationSubmissionAction` | Server Action | Approve registration | Admin `registrations.approve.all` |
| Reject submission | `rejectRegistrationSubmissionAction` | Server Action | Reject registration | Admin `registrations.approve.all` |
| Convert submission | `convertRegistrationSubmissionAction` | Server Action | Create/reuse parent, student, enrollment, class assignment, invoice, portal account | Admin `registrations.manage.all` |
| Resolve duplicate | `resolveRegistrationDuplicateAction` | Server Action | Link to existing parent/student or mark duplicate | Admin `registrations.manage.all` |

Request body:

- Public submit: `parent`, `student`, `requestedCourseId`, `source`, consent flags.
- Convert: `submissionId`, `parentStrategy`, `studentStrategy`, `courseId`, `classId`, `invoiceOptions`, `createPortalAccount`.

Response body:

- `registrationSubmission`
- Conversion returns `parent`, `student`, `enrollment`, optional `invoice`, optional `userProfile`.

Validation:

- Parent name and phone required.
- Student name and date of birth required.
- Source must be `website`, `google_form`, `tally`, `manual`, or `other`.
- Duplicate parent/student checks required before conversion.
- Class capacity must be checked before enrollment.

Error cases:

- Duplicate parent/student unresolved.
- Requested course/class unavailable.
- Class capacity reached.
- Invalid registration source.

Audit:

- Log public submission, import, review, duplicate resolution, approve, reject, convert.

List filters/sorting:

- Filters: `source`, `status`, `dateFrom`, `dateTo`, `requestedCourseId`.
- Sort: `created_at`, `status`, `source`.

---

# 8. Students

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List students | `listStudentsAction` | Server Action | Paginated student table | Admin `students.manage.all`; Teacher `students.view.assigned_students`; Parent `students.view.own_child` |
| Get student | `getStudentAction` | Server Action | Student profile tabs | Same visibility as list |
| Create student | `createStudentAction` | Server Action | Create student | Admin `students.manage.all` |
| Update student | `updateStudentAction` | Server Action | Edit student profile | Admin `students.manage.all` |
| Archive student | `archiveStudentAction` | Server Action | Soft archive | Admin `students.manage.all` |
| Restore student | `restoreStudentAction` | Server Action | Restore archived student | Admin `students.manage.all` |
| Link parent | `linkParentToStudentAction` | Server Action | Create parent-student relationship | Admin `students.assign.all` |
| Unlink parent | `unlinkParentFromStudentAction` | Server Action | Archive relationship | Admin `students.assign.all` |
| Update medical info | `updateStudentMedicalInfoAction` | Server Action | Edit medical notes/allergies/emergency notes | Admin `medical_records.manage.all` |
| Update emergency contacts | `updateStudentEmergencyContactsAction` | Server Action | Manage emergency contacts | Admin `students.manage.all` |

Request body:

- Student: `firstName`, `lastName`, `dateOfBirth`, `gender`, `primaryLanguage`, `schoolName`, `status`.
- Medical: `medicalNotes`, `allergies`, `emergencyNotes`.
- Parent link: `studentId`, `parentId`, `relationshipType`, `isPrimaryContact`, `canPickUp`, `receivesInvoices`, `receivesAnnouncements`.

Response body:

- `student`
- Related `parents`, `enrollments`, `classes`, `attendanceSummary`, `documents` where authorized.

Validation:

- Name and date of birth required.
- Date of birth cannot be future.
- Student number must be unique per branch.
- Parent link must be unique when active.
- Medical fields must not be returned to unauthorized users.

Audit:

- Log create, update, archive, restore, parent link/unlink, medical updates, emergency contact updates.

List filters/sorting:

- Filters: `query`, `status`, `courseId`, `classId`, `teacherId`, `parentId`, `ageFrom`, `ageTo`.
- Sort: `full_name`, `student_number`, `date_of_birth`, `created_at`, `updated_at`, `status`.

---

# 9. Parents

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List parents | `listParentsAction` | Server Action | Paginated parent table | Admin `parents.manage.all`; Teacher limited assigned contacts |
| Get parent | `getParentAction` | Server Action | Parent profile | Admin; Parent own profile |
| Create parent | `createParentAction` | Server Action | Create parent | Admin `parents.manage.all` |
| Update parent | `updateParentAction` | Server Action | Edit parent | Admin `parents.manage.all`; Parent `parents.edit.own_contact` limited fields |
| Archive parent | `archiveParentAction` | Server Action | Soft archive parent | Admin `parents.manage.all` |
| Restore parent | `restoreParentAction` | Server Action | Restore parent | Admin `parents.manage.all` |
| Get children | `getParentChildrenAction` | Server Action | Parent-child overview | Admin; Parent own |
| Update contact details | `updateParentContactDetailsAction` | Server Action | Parent portal profile update | Parent `parents.edit.own_contact` |

Request body:

- `firstName`, `lastName`, `email`, `phone`, `alternatePhone`, `address`, `preferredLanguage`, `communicationPreferences`, `portalStatus`.

Response body:

- `parent`
- `children`
- Admin may receive invoices/payments summary; Teacher receives only limited contact fields.

Validation:

- First name, last name, phone required.
- Email valid and unique when present.
- Parent cannot update school-managed relationships or financial records.

Audit:

- Log create, update, archive, restore, portal contact update.

List filters/sorting:

- Filters: `query`, `status`, `portalStatus`, `studentId`.
- Sort: `full_name`, `email`, `created_at`, `updated_at`, `status`.

---

# 10. Teachers

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List teachers | `listTeachersAction` | Server Action | Paginated teacher table | Admin `teachers.manage.all`; Parent linked child's teachers |
| Get teacher | `getTeacherAction` | Server Action | Teacher profile | Admin; Teacher own; Parent child's teacher |
| Create teacher | `createTeacherAction` | Server Action | Create teacher | Admin `teachers.manage.all` |
| Update teacher | `updateTeacherAction` | Server Action | Edit teacher | Admin; Teacher own limited profile |
| Archive teacher | `archiveTeacherAction` | Server Action | Soft archive teacher | Admin `teachers.manage.all` |
| Restore teacher | `restoreTeacherAction` | Server Action | Restore teacher | Admin `teachers.manage.all` |
| Assign classes | `assignTeacherClassesAction` | Server Action | Add class assignments | Admin `teachers.assign.all` |
| Update schedule | `updateTeacherScheduleAction` | Server Action | Manage assignments/availability | Admin `teachers.manage.all` |
| Get timetable | `getTeacherTimetableAction` | Server Action | Teacher schedule | Admin; Teacher own |

Request body:

- Teacher: `firstName`, `lastName`, `email`, `phone`, `qualifications`, `availabilityNotes`, `status`.
- Assignment: `teacherId`, `classId`, `assignmentType`, `startDate`, `endDate`.

Response body:

- `teacher`
- `assignedClasses`
- `assignedCourses`
- `upcomingSessions`

Validation:

- Teacher number unique per branch.
- Email unique when present.
- Assignment cannot duplicate an active class-teacher assignment.
- Date range must be valid.

Audit:

- Log create, update, archive, restore, assignment changes, schedule changes.

List filters/sorting:

- Filters: `query`, `status`, `courseId`, `classId`.
- Sort: `full_name`, `teacher_number`, `created_at`, `status`.

---

# 11. Courses

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List courses | `listCoursesAction` | Server Action | Paginated courses | Admin; Teacher assigned; Parent own child |
| Get course | `getCourseAction` | Server Action | Course detail | Same visibility as list |
| Create course | `createCourseAction` | Server Action | Create course/program | Admin `courses.manage.all` |
| Update course | `updateCourseAction` | Server Action | Edit course | Admin |
| Archive course | `archiveCourseAction` | Server Action | Soft archive course | Admin |
| Restore course | `restoreCourseAction` | Server Action | Restore course | Admin |

Request body:

- `name`, `slug`, `courseType`, `description`, `ageMinMonths`, `ageMaxMonths`, `defaultCapacity`, `defaultPrice`, `currency`, `status`.

Response body:

- `course`
- Optional `classes`, `enrollmentCount`.

Validation:

- Name, slug, course type required.
- Slug unique per branch.
- Course type must match schema values.
- Age and price values must be valid.

Audit:

- Log create, update, archive, restore.

List filters/sorting:

- Filters: `query`, `courseType`, `status`.
- Sort: `name`, `course_type`, `created_at`, `status`.

---

# 12. Classes

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List classes | `listClassesAction` | Server Action | Paginated classes | Admin; Teacher assigned; Parent own child |
| Get class | `getClassAction` | Server Action | Class detail | Same visibility as list |
| Create class | `createClassAction` | Server Action | Create class/cohort | Admin `classes.manage.all` |
| Update class | `updateClassAction` | Server Action | Edit class | Admin |
| Archive class | `archiveClassAction` | Server Action | Soft archive class | Admin |
| Restore class | `restoreClassAction` | Server Action | Restore class | Admin |
| Assign teacher | `assignTeacherToClassAction` | Server Action | Add teacher assignment | Admin `classes.assign.all` |
| Assign students | `assignStudentsToClassAction` | Server Action | Move/create enrollments into class | Admin `classes.assign.all` |

Request body:

- Class: `courseId`, `roomId`, `name`, `code`, `capacity`, `startDate`, `endDate`, `status`.
- Assign teacher: `classId`, `teacherId`, `assignmentType`, `startDate`, `endDate`.
- Assign students: `classId`, `studentIds` or `enrollmentIds`.

Response body:

- `class`
- `course`
- `teachers`
- `students`
- `sessions`

Validation:

- Course must exist and be active.
- Capacity must be greater than zero.
- Code unique per branch.
- Student count cannot exceed capacity unless waitlist policy is explicitly used.

Audit:

- Log create, update, archive, restore, teacher assignment, student assignment.

List filters/sorting:

- Filters: `query`, `status`, `courseId`, `teacherId`, `roomId`.
- Sort: `name`, `code`, `start_date`, `created_at`, `status`.

---

# 13. Sessions

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List sessions | `listSessionsAction` | Server Action | Calendar/session list | Admin; Teacher assigned; Parent own child |
| Get session | `getSessionAction` | Server Action | Session detail | Same visibility as list |
| Create session | `createSessionAction` | Server Action | Create class occurrence | Admin `classes.manage.all` |
| Update session | `updateSessionAction` | Server Action | Edit date/time/room/teacher/status | Admin |
| Cancel session | `cancelSessionAction` | Server Action | Cancel class occurrence | Admin |
| Restore session | `restoreSessionAction` | Server Action | Restore archived/cancelled where allowed | Admin |

Request body:

- `classId`, `roomId`, `teacherId`, `sessionDate`, `startsAt`, `endsAt`, `status`, `cancellationReason`.

Response body:

- `session`
- `class`
- `teacher`
- `room`
- Optional `attendanceSession`.

Validation:

- End time must be after start time.
- Class must be active.
- Prevent duplicate session for same class/start time.
- Cancellation reason required when cancelling.

Audit:

- Log create, update, cancel, restore.

List filters/sorting:

- Filters: `classId`, `teacherId`, `roomId`, `status`, `dateFrom`, `dateTo`.
- Sort: `starts_at`, `session_date`, `status`.

---

# 14. Enrollments

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List enrollments | `listEnrollmentsAction` | Server Action | Enrollment list | Admin; Teacher assigned; Parent own child |
| Get enrollment | `getEnrollmentAction` | Server Action | Enrollment detail | Same visibility as list |
| Create enrollment | `createEnrollmentAction` | Server Action | Enroll student in course/class | Admin `enrollments.manage.all` |
| Update enrollment | `updateEnrollmentAction` | Server Action | Change status/class/teacher/dates | Admin |
| Transfer enrollment | `transferEnrollmentAction` | Server Action | Move student to another class | Admin `enrollments.assign.all` |
| Archive enrollment | `archiveEnrollmentAction` | Server Action | Archive enrollment | Admin |
| Restore enrollment | `restoreEnrollmentAction` | Server Action | Restore enrollment | Admin |

Request body:

- `studentId`, `courseId`, `classId`, `primaryTeacherId`, `registrationSource`, `status`, `startDate`, `endDate`, `notes`.

Response body:

- `enrollment`
- `student`
- `course`
- `class`
- Optional `invoice`.

Validation:

- Student and course required.
- Registration source must be valid.
- Active duplicate enrollment not allowed.
- Class capacity must be checked.
- Date range must be valid.

Audit:

- Log create, update, transfer, archive, restore.

List filters/sorting:

- Filters: `studentId`, `courseId`, `classId`, `teacherId`, `status`, `dateFrom`, `dateTo`.
- Sort: `start_date`, `status`, `created_at`.

---

# 15. Attendance

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List attendance sessions | `listAttendanceSessionsAction` | Server Action | Attendance session list | Admin; Teacher assigned; Parent own child summary |
| Get attendance session | `getAttendanceSessionAction` | Server Action | Attendance grid | Admin; Teacher assigned |
| Start attendance | `startAttendanceSessionAction` | Server Action | Create attendance session for class session | Admin; Teacher `attendance.create.assigned_classes` |
| Mark attendance | `markAttendanceAction` | Server Action | Create/update student records | Admin; Teacher assigned same-day |
| Submit attendance | `submitAttendanceAction` | Server Action | Submit for management review | Teacher assigned; Admin |
| Review attendance | `reviewAttendanceAction` | Server Action | Review/lock attendance | Admin `attendance.approve.all` |
| Correct attendance | `correctAttendanceRecordAction` | Server Action | Historical correction | Admin `attendance.edit.all` |
| Delete attendance draft | `deleteAttendanceDraftAction` | Server Action | Delete draft only | Admin; Teacher own draft |

Request body:

- Start: `sessionId`, `classId`.
- Mark: `attendanceSessionId`, `records: [{ studentId, enrollmentId, status, arrivalTime, notes }]`.
- Correct: `attendanceRecordId`, `status`, `arrivalTime`, `correctionReason`.

Response body:

- `attendanceSession`
- `attendanceRecords`
- `summary`

Validation:

- Status must be valid attendance status.
- Teacher must be assigned to session/class.
- Teacher can edit only same-day and unlocked records.
- Student must belong to class/enrollment.
- Correction reason required for historical correction.

Audit:

- Log start, mark, submit, review, lock, correction, delete draft.

List filters/sorting:

- Filters: `studentId`, `classId`, `teacherId`, `status`, `dateFrom`, `dateTo`.
- Sort: `session_date`, `status`, `created_at`.

---

# 16. Teacher Remarks

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List remarks | `listTeacherRemarksAction` | Server Action | Remark list/approval queue | Admin; Teacher own assigned; Parent approved own child |
| Get remark | `getTeacherRemarkAction` | Server Action | Remark detail | Same visibility as list |
| Create remark | `createTeacherRemarkAction` | Server Action | Draft or submit remark | Teacher `teacher_remarks.create.assigned_students`; Admin |
| Update remark | `updateTeacherRemarkAction` | Server Action | Edit draft/pending | Teacher own pending; Admin |
| Submit remark | `submitTeacherRemarkAction` | Server Action | Move to pending approval | Teacher own assigned |
| Approve remark | `approveTeacherRemarkAction` | Server Action | Approve parent visibility | Admin `teacher_remarks.approve.all` |
| Reject remark | `rejectTeacherRemarkAction` | Server Action | Reject remark | Admin |
| Archive remark | `archiveTeacherRemarkAction` | Server Action | Archive remark | Admin |

Request body:

- `studentId`, `classId`, `sessionId`, `title`, `body`, `status`.
- Review: `remarkId`, `reviewNotes`.

Response body:

- `teacherRemark`

Validation:

- Body required.
- Teacher must be assigned to student.
- Parent can only see approved remarks for own child.
- Teacher cannot edit approved remarks.

Audit:

- Log create, update, submit, approve, reject, archive.

List filters/sorting:

- Filters: `studentId`, `teacherId`, `classId`, `status`, `dateFrom`, `dateTo`.
- Sort: `created_at`, `submitted_at`, `reviewed_at`, `status`.

---

# 17. Homework, Lesson Notes, Lesson Progress

These modules support teacher workflows. If database tables are added later, they must follow the same permission and audit rules.

| Module | Operation | Server Action | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Homework | List | `listHomeworkAction` | Homework by class/student | Admin; Teacher assigned; Parent own child published |
| Homework | Create | `createHomeworkAction` | Assign homework | Teacher `homework.manage.assigned_classes`; Admin |
| Homework | Update | `updateHomeworkAction` | Edit homework | Teacher own assigned draft; Admin |
| Homework | Archive | `archiveHomeworkAction` | Archive homework | Teacher own assigned; Admin |
| Lesson Notes | List | `listLessonNotesAction` | Notes by class/session | Admin; Teacher assigned |
| Lesson Notes | Create | `createLessonNoteAction` | Add note | Teacher `lesson_notes.manage.assigned_classes`; Admin |
| Lesson Notes | Update | `updateLessonNoteAction` | Edit own note | Teacher own; Admin |
| Lesson Progress | List | `listLessonProgressAction` | Progress by student/class | Admin; Teacher assigned; Parent visible own child |
| Lesson Progress | Create/Update | `upsertLessonProgressAction` | Record progress | Teacher `lesson_progress.edit.assigned_students`; Admin |

Request body:

- Homework: `classId`, `studentIds`, `title`, `description`, `dueDate`, `attachments`, `status`, `visibleToParent`.
- Lesson note: `classId`, `sessionId`, `title`, `body`, `attachments`, `visibility`.
- Progress: `studentId`, `courseId`, `classId`, `progressDate`, `level`, `summary`, `visibleToParent`.

Response body:

- Module record plus related class/student/session summary.

Validation:

- Teacher must be assigned.
- Parent-visible content must not contain internal notes.
- Due dates and progress dates must be valid.

Audit:

- Log create, update, archive, publish/visibility changes.

List filters/sorting:

- Filters: `studentId`, `classId`, `teacherId`, `status`, `visibleToParent`, `dateFrom`, `dateTo`.
- Sort: `created_at`, `due_date`, `progress_date`, `status`.

---

# 18. Workshops, Holiday Camps, Drama Classes

Workshops, holiday camps, and drama classes may use `courses`, `classes`, `sessions`, `workshops`, `workshop_teachers`, and `workshop_registrations`.

| Module | Operation | Server Action | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Workshops | List | `listWorkshopsAction` | Workshop list/calendar | Admin; Teacher assigned; Parent own child |
| Workshops | Get | `getWorkshopAction` | Workshop detail | Same visibility as list |
| Workshops | Create | `createWorkshopAction` | Create activity | Admin `workshops.manage.all` |
| Workshops | Update | `updateWorkshopAction` | Edit activity | Admin |
| Workshops | Archive/Restore | `archiveWorkshopAction`, `restoreWorkshopAction` | Soft archive/restore | Admin |
| Workshops | Register student | `registerStudentForWorkshopAction` | Create registration | Admin |
| Workshops | Assign teacher | `assignWorkshopTeacherAction` | Add teacher/staff | Admin |
| Holiday Camps | Manage | `createHolidayCampAction`, `updateHolidayCampAction` | Holiday camp as workshop type | Admin |
| Drama Classes | Manage | `createDramaClassAction`, `updateDramaClassAction` | Drama class as course/class type | Admin |

Request body:

- Workshop: `courseId`, `roomId`, `title`, `workshopType`, `description`, `startsAt`, `endsAt`, `capacity`, `price`, `currency`, `status`.
- Registration: `workshopId`, `studentId`, `parentId`, `invoiceId`, `status`.
- Teacher assignment: `workshopId`, `teacherId`, `assignmentType`.

Response body:

- `workshop`
- `registrations`
- `teachers`
- `capacitySummary`

Validation:

- End time after start time.
- Capacity greater than zero.
- Workshop type must be valid.
- Duplicate active registration not allowed.
- Capacity/waitlist rules must be enforced.

Audit:

- Log create, update, archive, restore, registration, cancellation, teacher assignment.

List filters/sorting:

- Filters: `workshopType`, `status`, `teacherId`, `studentId`, `dateFrom`, `dateTo`.
- Sort: `starts_at`, `title`, `status`, `created_at`.

---

# 19. Nursery

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List nursery enrollments | `listNurseryEnrollmentsAction` | Server Action | Nursery roster | Admin; Teacher assigned; Parent own child |
| Get nursery enrollment | `getNurseryEnrollmentAction` | Server Action | Nursery enrollment detail | Same visibility as list |
| Create enrollment | `createNurseryEnrollmentAction` | Server Action | Enroll child in nursery | Admin `nursery.manage.all` |
| Update enrollment | `updateNurseryEnrollmentAction` | Server Action | Edit nursery details | Admin |
| Archive/restore enrollment | `archiveNurseryEnrollmentAction`, `restoreNurseryEnrollmentAction` | Server Action | Archive/restore | Admin |
| List daily notes | `listNurseryDailyNotesAction` | Server Action | Daily notes | Admin; Teacher assigned; Parent visible own child |
| Create daily note | `createNurseryDailyNoteAction` | Server Action | Add note | Teacher assigned; Admin |
| Update daily note | `updateNurseryDailyNoteAction` | Server Action | Edit note | Teacher own assigned; Admin |

Request body:

- Enrollment: `studentId`, `courseId`, `classId`, `roomId`, `primaryTeacherId`, `startDate`, `endDate`, `schedulePattern`, `status`, `notes`.
- Daily note: `nurseryEnrollmentId`, `studentId`, `noteDate`, `summary`, `meals`, `napNotes`, `activities`, `incidentNotes`, `visibleToParent`.

Response body:

- `nurseryEnrollment`
- `dailyNotes`
- `student`
- `teacher`

Validation:

- Student required.
- Date range valid.
- Teacher must be assigned to create notes.
- Parent sees only `visibleToParent` notes and no internal incident details unless explicitly shared.

Audit:

- Log enrollment create/update/archive/restore and daily note create/update/visibility changes.

List filters/sorting:

- Filters: `studentId`, `classId`, `teacherId`, `status`, `dateFrom`, `dateTo`.
- Sort: `start_date`, `note_date`, `created_at`, `status`.

---

# 20. Birthday Events

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List birthday events | `listBirthdayEventsAction` | Server Action | Birthday calendar/list | Admin; Teacher assigned; Parent own child |
| Get birthday event | `getBirthdayEventAction` | Server Action | Event detail | Same visibility as list |
| Create birthday event | `createBirthdayEventAction` | Server Action | Schedule event | Admin `birthday_events.manage.all` |
| Update birthday event | `updateBirthdayEventAction` | Server Action | Edit event | Admin |
| Confirm birthday event | `confirmBirthdayEventAction` | Server Action | Confirm booking | Admin |
| Cancel birthday event | `cancelBirthdayEventAction` | Server Action | Cancel booking | Admin |
| Archive/restore event | `archiveBirthdayEventAction`, `restoreBirthdayEventAction` | Server Action | Archive/restore | Admin |
| Assign staff | `assignBirthdayEventStaffAction` | Server Action | Assign teacher/user staff | Admin `birthday_events.assign.all` |

Request body:

- `studentId`, `parentId`, `roomId`, `invoiceId`, `title`, `eventDate`, `startsAt`, `endsAt`, `packageName`, `guestCount`, `decorationNotes`, `specialRequests`, `status`.
- Staff: `birthdayEventId`, `teacherId` or `userId`, `role`.

Response body:

- `birthdayEvent`
- `staff`
- `invoice`

Validation:

- Student and parent must be linked.
- End time after start time.
- Guest count non-negative.
- Room/time conflicts must be checked.
- Cancellation reason recommended when cancelling.

Audit:

- Log create, update, confirm, cancel, archive, restore, staff assignment.

List filters/sorting:

- Filters: `studentId`, `parentId`, `teacherId`, `status`, `dateFrom`, `dateTo`.
- Sort: `event_date`, `starts_at`, `status`, `created_at`.

---

# 21. Announcements

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List announcements | `listAnnouncementsAction` | Server Action | Announcement feed | Admin; Teacher audience; Parent audience |
| Get announcement | `getAnnouncementAction` | Server Action | Announcement detail | Same visibility as list |
| Create announcement | `createAnnouncementAction` | Server Action | Draft announcement | Admin `announcements.manage.all` |
| Update announcement | `updateAnnouncementAction` | Server Action | Edit draft/scheduled | Admin |
| Publish announcement | `publishAnnouncementAction` | Server Action | Publish now | Admin |
| Schedule announcement | `scheduleAnnouncementAction` | Server Action | Schedule publish | Admin |
| Archive announcement | `archiveAnnouncementAction` | Server Action | Archive | Admin |
| Mark read | `markAnnouncementReadAction` | Server Action | Recipient read tracking | Authenticated recipient |

Request body:

- `title`, `body`, `audienceType`, `classId`, `priority`, `status`, `publishAt`.
- Mark read: `announcementId`.

Response body:

- `announcement`
- `recipientStatus`

Validation:

- Title/body required.
- Audience type must be valid.
- Class required for class audience.
- Publish date required for scheduled announcements.

Audit:

- Log create, update, publish, schedule, archive.
- Read tracking does not require audit unless needed for compliance.

List filters/sorting:

- Filters: `audienceType`, `classId`, `priority`, `status`, `dateFrom`, `dateTo`.
- Sort: `publish_at`, `published_at`, `priority`, `created_at`.

---

# 22. Notifications

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List notifications | `listNotificationsAction` | Server Action | User notification inbox | Authenticated own |
| Get notification | `getNotificationAction` | Server Action | Notification detail | Recipient own; Admin |
| Create notification | `createNotificationAction` | Server Action | Manual/system notification | Admin `notifications.manage.all`; service role |
| Create bulk notifications | `createBulkNotificationsAction` | Server Action | Bulk send | Admin |
| Mark read | `markNotificationReadAction` | Server Action | Mark own notification read | Authenticated own |
| Archive notification | `archiveNotificationAction` | Server Action | Archive own notification | Authenticated own; Admin |

Request body:

- `recipientUserId`, `title`, `body`, `notificationType`, `sourceTable`, `sourceId`, `deliveryChannels`.
- Bulk: `recipientUserIds` or audience selector.

Response body:

- `notification`
- Bulk returns counts.

Validation:

- Recipient must exist.
- Notification type must be valid.
- Users can update only own read/archive state.

Audit:

- Log admin/system create and bulk create.
- Own read/archive does not require audit.

List filters/sorting:

- Filters: `status`, `notificationType`, `dateFrom`, `dateTo`.
- Sort: `created_at`, `status`.

---

# 23. Documents and File Uploads

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Request upload URL | `/api/files/upload-url` | POST | Generate signed upload target | Authorized uploader |
| Confirm upload | `confirmDocumentUploadAction` | Server Action | Create `documents` metadata row | Authorized uploader |
| List documents | `listDocumentsAction` | Server Action | Document list | Admin; Teacher permitted; Parent permitted |
| Get document | `getDocumentAction` | Server Action | Metadata detail | Authorized viewer |
| Request download URL | `/api/files/download-url` | POST | Generate signed download URL | Authorized viewer/downloader |
| Archive document | `archiveDocumentAction` | Server Action | Soft archive metadata | Admin; owner workflow where allowed |
| Restore document | `restoreDocumentAction` | Server Action | Restore metadata | Admin |
| Delete physical file | `deleteStoredFileAction` | Server Action | Physical delete | Super Admin/service only |

Request body:

- Upload URL: `bucketName`, `fileName`, `mimeType`, `fileSizeBytes`, `documentType`, `ownerType`, `ownerId`, `visibility`.
- Confirm: upload metadata plus `storagePath`.
- Download: `documentId`.

Response body:

- Upload: `uploadUrl`, `storagePath`, constraints.
- Download: `downloadUrl`, `expiresAt`.
- Metadata: `document`.

Validation:

- Allowed MIME types: JPG, PNG, PDF.
- Maximum file size 10 MB.
- Bucket must match document type.
- Owner record must exist and be visible/assignable to user.
- Visibility must be valid.

Audit:

- Log upload confirmation, sensitive downloads, archive, restore, physical delete.

List filters/sorting:

- Filters: `ownerType`, `ownerId`, `documentType`, `visibility`, `status`.
- Sort: `created_at`, `file_name`, `document_type`.

---

# 24. Invoices and Invoice Items

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List invoices | `listInvoicesAction` | Server Action | Invoice table/parent portal | Admin; Parent own family |
| Get invoice | `getInvoiceAction` | Server Action | Invoice detail | Admin; Parent own family |
| Create invoice | `createInvoiceAction` | Server Action | Create invoice with items | Admin `invoices.manage.all` |
| Update invoice | `updateInvoiceAction` | Server Action | Edit draft/sent invoice | Admin |
| Void invoice | `voidInvoiceAction` | Server Action | Void invoice | Admin |
| Archive/restore invoice | `archiveInvoiceAction`, `restoreInvoiceAction` | Server Action | Archive/restore | Admin |
| Add invoice item | `addInvoiceItemAction` | Server Action | Add item | Admin |
| Update invoice item | `updateInvoiceItemAction` | Server Action | Edit item | Admin |
| Remove invoice item | `removeInvoiceItemAction` | Server Action | Remove item from draft | Admin |
| Download invoice PDF | `/api/invoices/[id]/download` | GET | Download PDF | Admin; Parent own family |

Request body:

- Invoice: `parentId`, `studentId`, `enrollmentId`, `issueDate`, `dueDate`, `currency`, `notes`, `internalNotes`, `items`.
- Item: `invoiceId`, `courseId`, `classId`, `enrollmentId`, `description`, `quantity`, `unitPrice`, `discountAmount`, `taxAmount`.

Response body:

- `invoice`
- `items`
- `balance`
- Optional `downloadUrl`.

Validation:

- Parent required.
- Student must be linked to parent when present.
- Due date must be on/after issue date.
- Amounts non-negative; quantity positive.
- Totals must be calculated server-side.
- Parent cannot access another family's invoice.

Audit:

- Log create, update, void, archive, restore, item changes, PDF download.

List filters/sorting:

- Filters: `parentId`, `studentId`, `status`, `dateFrom`, `dateTo`, `dueDateFrom`, `dueDateTo`, `balanceDue`.
- Sort: `invoice_number`, `issue_date`, `due_date`, `status`, `balance_due`, `created_at`.

---

# 25. Payments, Receipts, Refunds, Discounts

## 25.1 Payments

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List payments | `listPaymentsAction` | Server Action | Payment history | Admin; Parent own family |
| Get payment | `getPaymentAction` | Server Action | Payment detail | Admin; Parent own family |
| Record payment | `recordPaymentAction` | Server Action | Record invoice payment | Admin `payments.manage.all` |
| Update payment | `updatePaymentAction` | Server Action | Edit pending/manual payment | Admin |
| Cancel payment | `cancelPaymentAction` | Server Action | Cancel payment | Admin |

Request body:

- `invoiceId`, `parentId`, `studentId`, `amount`, `currency`, `paymentMethod`, `paymentDate`, `reference`, `notes`.

Response body:

- `payment`
- Updated `invoice`
- Optional generated `receipt`.

Validation:

- Amount must be positive.
- Invoice must exist and be payable.
- Payment amount cannot exceed remaining balance unless overpayment policy exists.
- Payment method must be valid.

Audit:

- Log record, update, cancel.

## 25.2 Receipts

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Generate receipt | `generateReceiptAction` | Server Action | Generate receipt for payment | Admin `receipts.manage.all` |
| List receipts | `listReceiptsAction` | Server Action | Receipt list | Admin; Parent own family |
| Get receipt | `getReceiptAction` | Server Action | Receipt detail | Admin; Parent own family |
| Download receipt | `/api/receipts/[id]/download` | GET | Download PDF | Admin; Parent own family |
| Void receipt | `voidReceiptAction` | Server Action | Void receipt | Admin |

Validation:

- Payment must be completed.
- One receipt per payment unless void/regenerate policy is documented.

Audit:

- Log generation, void, download.

## 25.3 Refunds

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List refunds | `listRefundsAction` | Server Action | Refund list | Admin; Parent own family status |
| Request refund | `requestRefundAction` | Server Action | Create refund request | Admin `refunds.manage.all` |
| Approve refund | `approveRefundAction` | Server Action | Approve refund | Admin `refunds.approve.all` |
| Reject refund | `rejectRefundAction` | Server Action | Reject refund | Admin |
| Process refund | `processRefundAction` | Server Action | Mark processed | Admin |
| Cancel refund | `cancelRefundAction` | Server Action | Cancel request | Admin |

Validation:

- Amount positive and not greater than refundable payment amount.
- Reason required.
- Status transitions must be valid.

Audit:

- Log request, approve, reject, process, cancel.

## 25.4 Discounts

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Apply discount | `applyInvoiceDiscountAction` | Server Action | Apply invoice discount | Admin `discounts.manage.all` |
| Remove discount | `removeInvoiceDiscountAction` | Server Action | Remove discount | Admin |
| Approve discount | `approveDiscountAction` | Server Action | Approve high-value discount if required | Admin `discounts.approve.all` |

Validation:

- Discount amount non-negative.
- Discount cannot exceed subtotal.
- Approval required when policy threshold is exceeded.

Audit:

- Log apply, remove, approve.

List filters/sorting for finance:

- Filters: `parentId`, `studentId`, `invoiceId`, `status`, `paymentMethod`, `dateFrom`, `dateTo`.
- Sort: `payment_date`, `issued_at`, `amount`, `status`, `created_at`.

---

# 26. Reports

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Generate report | `generateReportAction` | Server Action | Generate report data/PDF/export | Admin `reports.export.all`; Teacher own reports; Parent own child |
| List report runs | `listReportRunsAction` | Server Action | Export/report history | Admin; user own runs |
| Download report | `/api/reports/[id]/download` | GET | Download generated report | Authorized requester |
| Export CSV | `/api/reports/[type]/export.csv` | GET | CSV export | Permission by report type |
| Export Excel | `/api/reports/[type]/export.xlsx` | GET | Excel export | Permission by report type |
| Export PDF | `/api/reports/[type]/export.pdf` | GET | PDF export | Permission by report type |

Report types:

- `students`
- `attendance`
- `payments`
- `revenue`
- `teachers`
- `workshops`
- `birthdays`
- `enrollments`

Request body/query:

- `reportType`, `format`, `filters`, `sort`, `dateFrom`, `dateTo`.

Response body:

- `reportRun`
- `downloadUrl` when generated
- `data` for on-screen reports

Validation:

- Report type and format must be allowed.
- User must have export/download permission for report type.
- Parent/Teacher scope must be enforced.

Audit:

- Log report generation and download/export.

---

# 27. Dashboard

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Get management dashboard | `getManagementDashboardAction` | Server Action | KPIs and operational widgets | Admin/Super Admin |
| Get teacher dashboard | `getTeacherDashboardAction` | Server Action | Assigned classes, sessions, remarks, notifications | Teacher |
| Get parent dashboard | `getParentDashboardAction` | Server Action | Children, attendance, invoices, remarks, announcements | Parent |

Request body:

- Optional `date`, `dateFrom`, `dateTo`, `branchId` for authorized roles.

Response body:

- Management: student/parent/teacher counts, today's classes, attendance summary, revenue, outstanding invoices, upcoming birthdays/workshops, registrations, pending remarks, announcements, notifications.
- Teacher: today's classes, weekly schedule, assigned students, pending attendance, remarks, announcements.
- Parent: children, schedules, attendance summary, invoices, payment history, approved remarks, announcements.

Validation:

- Dashboard must match role.
- Parent/Teacher ownership scopes enforced.
- Branch filters allowed only to authorized roles.

Audit:

- No audit for normal dashboard reads.
- Audit only if dashboard includes export/download.

---

# 28. Global Search

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| Global search | `globalSearchAction` | Server Action | Search across authorized entities | Authenticated, scoped by role |

Request body:

```json
{
  "query": "string",
  "entities": ["students", "parents", "teachers", "courses", "workshops", "payments", "announcements"],
  "filters": {},
  "page": 1,
  "pageSize": 20,
  "sort": "relevance",
  "direction": "desc"
}
```

Response body:

- Results with `entityType`, `entityId`, `title`, `subtitle`, `status`, `createdAt`.

Validation:

- Query required, minimum 2 characters.
- Entity list must be allowed.
- Sensitive entities require permission.
- Teachers never receive finance results.
- Parents receive only own-family/own-child results.

Audit:

- No normal audit.
- Audit if search includes sensitive finance or medical exports in future.

---

# 29. Audit Logs

| Operation | Server Action / Route | Method | Purpose | Role / Permission |
| --- | --- | --- | --- | --- |
| List audit logs | `listAuditLogsAction` | Server Action | Audit log table | Super Admin `audit_logs.view.all`; Admin if granted |
| Get audit log | `getAuditLogAction` | Server Action | Audit detail | Same as list |
| Export audit logs | `/api/audit-logs/export` | GET | Export audit logs | Super Admin/Admin with `audit_logs.export.*` |

Request body/query:

- `actorUserId`, `action`, `entityTable`, `entityId`, `branchId`, `dateFrom`, `dateTo`, pagination/sort.

Response body:

- `auditLogs`
- Redacted values according to role.

Validation:

- Teacher and Parent have no access.
- Admin branch scope enforced when multi-branch is enabled.
- Sensitive values must be redacted.

Audit:

- Audit log viewing/export must itself be audited.

List filters/sorting:

- Filters: `actorUserId`, `action`, `entityTable`, `entityId`, `branchId`, `dateFrom`, `dateTo`.
- Sort: `created_at`, `action`, `entity_table`.

---

# 30. Module Summary Table

This table provides quick routing guidance. Detailed validation remains in module sections above.

| Module | Primary Server Actions | Route Handlers |
| --- | --- | --- |
| Authentication | `loginAction`, `logoutAction`, `forgotPasswordAction`, `resetPasswordAction`, `getCurrentUserAction` | None required |
| User Management | `listUsersAction`, `createUserAction`, `updateUserAction`, `assignUserRoleAction` | None required |
| Registration | `listRegistrationSubmissionsAction`, `convertRegistrationSubmissionAction` | `POST /api/registrations/public` |
| Students | `listStudentsAction`, `createStudentAction`, `updateStudentAction`, `archiveStudentAction` | None required |
| Parents | `listParentsAction`, `updateParentContactDetailsAction` | None required |
| Teachers | `listTeachersAction`, `assignTeacherClassesAction` | None required |
| Courses/Classes/Sessions | `listCoursesAction`, `listClassesAction`, `listSessionsAction` | None required |
| Enrollments | `createEnrollmentAction`, `transferEnrollmentAction` | None required |
| Attendance | `startAttendanceSessionAction`, `markAttendanceAction`, `reviewAttendanceAction` | None required |
| Remarks | `createTeacherRemarkAction`, `approveTeacherRemarkAction` | None required |
| Events | `createWorkshopAction`, `createBirthdayEventAction`, `createNurseryEnrollmentAction` | None required |
| Announcements/Notifications | `publishAnnouncementAction`, `markNotificationReadAction` | None required |
| Documents | `confirmDocumentUploadAction`, `archiveDocumentAction` | `POST /api/files/upload-url`, `POST /api/files/download-url` |
| Finance | `createInvoiceAction`, `recordPaymentAction`, `generateReceiptAction`, `approveRefundAction` | invoice/receipt download routes |
| Reports | `generateReportAction`, `listReportRunsAction` | report export/download routes |
| Dashboard/Search/Audit | dashboard actions, `globalSearchAction`, audit actions | audit export route |

---

# 31. API Testing Requirements

Every API operation must be tested for:

- Success response.
- Validation failure.
- Unauthenticated access.
- Forbidden access.
- Ownership violation.
- Archived record behavior.
- Duplicate record behavior.
- Pagination/filtering/sorting where applicable.
- Audit log creation for sensitive actions.
- RLS direct-access equivalent where applicable.

Critical tests:

- Parent cannot view another child.
- Teacher cannot view unassigned student.
- Teacher cannot access finance APIs.
- Parent cannot see pending/rejected remarks.
- Admin cannot modify Super Admin.
- Teacher cannot edit locked attendance.
- Parent can download only own invoices/receipts.
- Audit logs are inaccessible to Teacher/Parent.

---

# 32. Final Goal

The API layer must provide a consistent, secure, and auditable contract for every feature in the Little London Management System.

Every operation must be strongly typed, validated, permission-checked, RLS-aligned, and tested before release.
