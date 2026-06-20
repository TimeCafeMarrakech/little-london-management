# Little London School Management System

# PERMISSIONS.md

Version: 1.0

---

# Purpose

This document defines the Role-Based Access Control (RBAC) model for the Little London School Management System.

Every authenticated user belongs to a specific role, and each role has clearly defined permissions. Users must only access information and perform actions that are appropriate for their role.

---

# System Roles

The application supports four primary roles:

* Super Admin
* Admin (Management)
* Teacher
* Parent

Future roles:

* Accountant
* Receptionist
* Marketing
* Branch Manager

---

# Permission Levels

Each module supports the following permission types:

* View
* Create
* Edit
* Delete
* Approve
* Export
* Manage

Not every role has every permission.

---

# Super Admin

The Super Admin has unrestricted access.

Permissions:

✓ View Everything

✓ Create Everything

✓ Edit Everything

✓ Delete Everything

✓ Manage Users

✓ Assign Roles

✓ Manage Settings

✓ Manage Branches (Future)

✓ Access Reports

✓ Export Data

✓ View Financial Reports

✓ Manage Database

✓ Restore Archived Records

✓ Manage Authentication

---

# Admin (Management)

Management controls the daily operation of the school.

Permissions include:

Students

✓ View

✓ Create

✓ Edit

✓ Archive

✓ Transfer

Parents

✓ View

✓ Create

✓ Edit

✓ Archive

Teachers

✓ View

✓ Create

✓ Edit

✓ Assign Classes

✓ View Schedule

Courses

✓ Create

✓ Edit

✓ Delete

✓ Assign Teacher

Attendance

✓ View All

✓ Edit

✓ Correct Attendance

Payments

✓ View

✓ Record

✓ Generate Invoice

✓ Mark Paid

✓ Refund (Future)

Announcements

✓ Create

✓ Publish

✓ Edit

✓ Delete

Teacher Remarks

✓ View

✓ Approve

✓ Reject

Birthday Events

✓ Create

✓ Edit

✓ Assign Staff

Drama Classes

✓ Manage

Reports

✓ Generate

✓ Export PDF

✓ Export Excel

Settings

Limited access.

Cannot change authentication settings.

---

# Teacher

Teachers only access information related to their assigned classes.

Students

✓ View Assigned Students

✗ Create

✗ Delete

Parents

View Contact Information Only

Courses

✓ View Assigned Courses

✓ Upload Lesson Notes

✓ Update Lesson Progress

Attendance

✓ Mark Attendance

✓ Edit Same-Day Attendance

✗ Delete Attendance History

Homework (Future)

✓ Assign Homework

Teacher Remarks

✓ Create

✓ Edit Until Approved

✗ Delete After Approval

Announcements

View Only

Calendar

View Assigned Schedule

Birthday Events

View Participation Schedule

Reports

View Personal Performance Reports

Cannot view financial information.

Cannot manage users.

---

# Parent

Parents only access information for their own children.

Dashboard

✓ View

Children

✓ View Child Profile

✓ View Attendance

✓ View Progress

Courses

✓ View Enrolled Courses

✓ View Schedule

Teachers

View Teacher Information

Cannot edit teacher data.

Attendance

View Only

Invoices

✓ View

✓ Download PDF

Payments

✓ View Payment History

Announcements

✓ View Published Announcements

Teacher Remarks

Only approved remarks are visible.

Parents cannot see pending or rejected remarks.

Calendar

View Upcoming Classes

View Holidays

View Events

Birthday Events

View Booking Status

Future:

Request booking online.

---

# Permissions Matrix

| Module          | Super Admin | Admin   | Teacher       | Parent         |
| --------------- | ----------- | ------- | ------------- | -------------- |
| Dashboard       | Full        | Full    | Own           | Own            |
| Students        | CRUD        | CRUD    | View Assigned | View Own Child |
| Parents         | CRUD        | CRUD    | Contact Only  | Own Profile    |
| Teachers        | CRUD        | CRUD    | Own Profile   | View Teacher   |
| Courses         | CRUD        | CRUD    | Assigned      | View           |
| Attendance      | CRUD        | CRUD    | Assigned      | View           |
| Payments        | CRUD        | CRUD    | None          | View           |
| Invoices        | CRUD        | CRUD    | None          | View           |
| Announcements   | CRUD        | CRUD    | View          | View           |
| Teacher Remarks | CRUD        | Approve | Create        | Approved Only  |
| Reports         | Full        | Full    | Own           | Child Only     |
| Settings        | Full        | Limited | None          | None           |

---

# Approval Workflow

Teacher creates a remark.

↓

Remark status becomes:

Pending Approval

↓

Management reviews.

↓

Approve

or

Reject

↓

If Approved

↓

Visible to Parent

If Rejected

↓

Visible only to Teacher and Management.

---

# Attendance Permissions

Teacher

Can mark attendance only for:

Assigned Class

Assigned Date

Assigned Students

Management

Can edit attendance history.

Super Admin

Can modify any attendance.

Parents

Read Only.

---

# Financial Permissions

Only:

Super Admin

Admin

can access:

Invoices

Payments

Receipts

Financial Reports

Refunds

Outstanding Balances

Teachers cannot view payment information.

Parents only view invoices related to their own children.

---

# Student Permissions

Teachers cannot:

Delete students

Transfer students

Archive students

Only Management may perform these actions.

---

# Parent Restrictions

Parents cannot:

Edit attendance

Edit teacher remarks

Edit grades

View other students

View other parents

View internal notes

View financial records of other families

---

# Teacher Restrictions

Teachers cannot:

Delete students

Delete parents

Approve remarks

Edit invoices

Manage users

Access settings

Access financial reports

View other teachers' private notes

---

# Admin Restrictions

Management cannot:

Delete Super Admin

Modify authentication system

Change global security settings

Access server infrastructure

These actions are reserved for the Super Admin.

---

# Data Visibility Rules

Every database query must respect permissions.

Parents

Only their children.

Teachers

Only assigned classes.

Management

Entire school.

Super Admin

Everything.

---

# API Authorization

Every API endpoint must verify:

Authentication

↓

Role

↓

Permission

↓

Ownership (where applicable)

Only then execute the request.

---

# UI Permissions

The interface must hide features the user cannot access.

Example:

Teachers should never see:

Finance Menu

User Management

Settings

Parents should never see:

Teacher Management

Student Management

Reports

Administration

Hidden features must also be protected by backend authorization.

---

# Ownership Rules

Parents own access only to their linked children.

Teachers own access only to assigned classes.

Management owns operational data.

Super Admin owns the complete platform.

---

# Audit Logging

Every sensitive action must be logged.

Examples:

Student Deleted

Attendance Modified

Invoice Edited

Role Changed

Payment Updated

Teacher Remark Approved

Logs include:

Timestamp

User

Role

Action

Affected Record

---

# Future Permissions

Prepare support for:

Custom Roles

Permission Groups

Branch-Level Permissions

Department Permissions

Read-Only Accounts

Temporary Access

Time-Limited Permissions

External Auditors

---

# Security Principles

The system must follow the Principle of Least Privilege.

Users receive only the permissions required to perform their responsibilities.

No permission should be granted by default.

All authorization checks must be enforced on both the frontend and backend.

---

# Final Goal

The permission system must be secure, scalable, and maintainable. Every feature in the Little London School Management System should rely on this centralized RBAC model to ensure consistent authorization across the entire platform.
