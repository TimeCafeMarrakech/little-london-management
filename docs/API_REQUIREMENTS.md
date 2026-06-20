# Little London School Management System

# API_REQUIREMENTS.md

Version: 1.0

---

# Purpose

This document defines the API architecture and standards for the Little London School Management System.

The API layer must be secure, scalable, consistent, and easy to maintain. Every feature within the application must communicate through well-defined APIs or Server Actions.

The application will use **Supabase** as the backend service for authentication, database, storage, and real-time functionality. Business logic should be encapsulated in reusable services.

---

# API Architecture

Technology Stack

* Next.js App Router
* TypeScript
* Supabase
* PostgreSQL
* Server Actions
* Route Handlers
* Supabase Storage

---

# API Design Principles

Every API must:

* Return consistent responses.
* Validate all input.
* Authenticate users before accessing protected data.
* Authorize users based on role.
* Log important operations.
* Handle errors gracefully.
* Never expose sensitive information.
* Follow RESTful naming conventions where Route Handlers are used.
* Prefer Server Actions for internal application operations.

---

# Standard Response Format

Success

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": []
}
```

---

# Authentication APIs

## Login

Purpose

Authenticate a user using email and password.

Input

* email
* password

Output

* User profile
* Role
* Session
* Access token

---

## Logout

Purpose

Terminate current session securely.

---

## Forgot Password

Purpose

Send password reset email.

---

## Reset Password

Purpose

Allow user to create a new password using a secure reset token.

---

## Refresh Session

Purpose

Refresh authentication session automatically.

---

## Get Current User

Returns

* User information
* Assigned role
* Permissions

---

# User Management APIs

Operations

* Create User
* Get User
* Update User
* Disable User
* Activate User
* Delete User
* Change Password
* Update Profile

---

# Student APIs

Operations

* Register Student
* View Student
* Edit Student
* Delete Student
* Archive Student
* Restore Student
* Upload Student Photo
* Update Medical Information
* View Attendance
* View Progress
* Assign Parent
* Assign Class
* Assign Teacher

---

# Parent APIs

Operations

* Register Parent
* Update Parent
* Delete Parent
* Link Parent to Student
* View Children
* View Payment History
* View Attendance
* View Reports
* Update Contact Details

---

# Teacher APIs

Operations

* Register Teacher
* Update Teacher
* Delete Teacher
* Assign Classes
* Assign Courses
* Update Schedule
* Upload Profile Photo
* View Timetable
* View Assigned Students

---

# Course APIs

Operations

* Create Course
* Edit Course
* Delete Course
* View Courses
* Assign Teacher
* Set Capacity
* Manage Schedule

---

# Class APIs

Operations

* Create Class
* Update Class
* Delete Class
* View Class
* Assign Students
* Assign Teacher

---

# Attendance APIs

Operations

* Mark Attendance
* Update Attendance
* Delete Attendance
* View Daily Attendance
* View Monthly Attendance
* Generate Attendance Report

---

# Payment APIs

Operations

* Create Invoice
* Update Invoice
* Delete Invoice
* Record Payment
* Generate Receipt
* View Outstanding Balance
* Refund Payment

---

# Workshop APIs

Operations

* Create Workshop
* Update Workshop
* Delete Workshop
* Register Students
* Attendance
* Capacity Management

---

# Birthday Event APIs

Operations

* Schedule Birthday
* Update Birthday Event
* Cancel Event
* Assign Staff
* Manage Decorations
* View Calendar

---

# Announcement APIs

Operations

* Create Announcement
* Publish Announcement
* Schedule Announcement
* Edit Announcement
* Archive Announcement
* Delete Announcement

---

# Dashboard APIs

Dashboard should provide:

* Student Count
* Parent Count
* Teacher Count
* Active Courses
* Attendance Summary
* Revenue Summary
* Recent Registrations
* Upcoming Birthdays
* Upcoming Workshops
* Pending Payments
* Notifications

---

# Search APIs

Global Search

Search should include

* Students
* Parents
* Teachers
* Courses
* Workshops
* Payments
* Announcements

Search must support:

* Partial Matching
* Filters
* Sorting
* Pagination

---

# Notification APIs

Support

* Email
* In-App Notifications
* Push Notifications (Future)

Operations

* Create Notification
* Mark as Read
* Delete Notification
* Send Bulk Notification

---

# File Upload APIs

Support

* Student Photos
* Teacher Photos
* Parent Documents
* Birth Certificates
* Medical Reports
* PDF Reports
* Invoices
* Receipts

Allowed Formats

* JPG
* PNG
* PDF

Maximum File Size

10 MB

Store all uploads in Supabase Storage.

---

# Report APIs

Generate reports for

* Students
* Attendance
* Payments
* Revenue
* Teachers
* Workshops
* Birthdays

Reports should support:

* PDF Export
* Excel Export
* CSV Export
* Print

---

# Pagination Standard

Every list endpoint must support

* page
* pageSize
* totalRecords
* totalPages

Default page size

20

Maximum page size

100

---

# Filtering Standard

Every data list should support filtering.

Examples

* Date
* Status
* Teacher
* Course
* Payment Status
* Active / Inactive

---

# Sorting Standard

Support sorting by

* Name
* Date Created
* Updated Date
* Status

Ascending and descending order.

---

# Validation Rules

Every API must validate

* Required fields
* Email format
* Phone number format
* Duplicate records
* File size
* File type
* User permissions

---

# Security Requirements

Every protected API must

* Require authentication
* Verify user role
* Validate permissions
* Prevent SQL injection
* Prevent XSS
* Prevent CSRF
* Sanitize inputs
* Log sensitive actions

---

# Error Handling

Return meaningful errors.

Examples

* Unauthorized
* Forbidden
* Validation Failed
* Resource Not Found
* Duplicate Record
* Invalid Input
* Internal Server Error

Never expose database errors to users.

---

# Logging

Log

* Login
* Logout
* User Creation
* Student Registration
* Attendance Updates
* Payment Processing
* Invoice Generation
* Permission Changes
* System Errors

---

# Future APIs

Prepare the architecture for future modules.

* WhatsApp Integration
* SMS Gateway
* AI Assistant
* Calendar Integration
* Zoom Integration
* Online Payments
* Parent Mobile App
* Teacher Mobile App

---

# Development Standards

* TypeScript only.
* Strong typing for all requests and responses.
* No use of `any`.
* Reusable service functions.
* Centralized error handling.
* Consistent naming conventions.
* Production-ready code only.

---

# Final Goal

The API layer must be secure, scalable, maintainable, and capable of supporting future expansion without major architectural changes. Every new feature should integrate seamlessly with the existing API structure while maintaining consistency across the application.
