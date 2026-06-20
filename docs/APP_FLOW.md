# Little London Management System

# APP_FLOW.md

Version: 1.0

---

# Application Overview

The Little London Management System serves three primary user groups:

* Management
* Teachers
* Parents

Each user has a dedicated dashboard, permissions, and workflows.

The application should always redirect users to the appropriate dashboard after login based on their assigned role.

---

# Global Application Flow

Landing Page

↓

Login

↓

Authentication

↓

Role Detection

↓

Redirect to User Dashboard

↓

Daily Operations

↓

Logout

---

# Login Flow

User opens application

↓

Login Screen

↓

Enter Email & Password

↓

Authentication

↓

Role Verification

↓

Redirect

Management → Management Dashboard

Teacher → Teacher Dashboard

Parent → Parent Portal

---

# Password Recovery Flow

Forgot Password

↓

Enter Email

↓

Receive Reset Email

↓

Create New Password

↓

Login

---

# Management Portal

## Dashboard

Dashboard is the command center.

Widgets include:

* Student Count
* Parent Count
* Teacher Count
* Today's Classes
* Attendance Summary
* Revenue Overview
* Outstanding Invoices
* Upcoming Birthdays
* Upcoming Workshops
* Announcements
* Recent Registrations
* Quick Actions

From the dashboard, management can navigate to every module.

---

# Student Management Flow

Dashboard

↓

Students

↓

Student List

↓

Search / Filter

↓

Student Profile

↓

Tabs

* Personal Information
* Parent Information
* Courses
* Attendance
* Payments
* Invoices
* Teacher Remarks
* Documents

↓

Edit Student

↓

Save Changes

---

# Parent Management Flow

Dashboard

↓

Parents

↓

Parent List

↓

Parent Profile

↓

Children

↓

Invoices

↓

Payments

↓

Contact Information

↓

Communication History

---

# Teacher Management Flow

Dashboard

↓

Teachers

↓

Teacher List

↓

Teacher Profile

↓

Assigned Classes

↓

Schedule

↓

Attendance Records

↓

Remarks

↓

Payroll (Future)

---

# Registration Flow

New Registration

↓

Choose Registration Method

* Website Form
* Google Form
* Tally Form
* Manual Registration

↓

Create Parent

↓

Create Student

↓

Assign Course

↓

Assign Class

↓

Assign Teacher

↓

Generate Invoice

↓

Create Parent Portal Account

↓

Registration Complete

---

# Course Management Flow

Dashboard

↓

Courses

↓

Course List

↓

Create Course

↓

Assign Teacher

↓

Assign Classroom

↓

Schedule

↓

Enroll Students

↓

Publish

---

# Attendance Flow

Dashboard

↓

Attendance

↓

Choose Class

↓

Today's Students

↓

Mark Attendance

↓

Save

↓

Attendance History

↓

Reports

---

# Payment Flow

Dashboard

↓

Payments

↓

Outstanding Invoices

↓

Receive Payment

↓

Generate Receipt

↓

Update Invoice Status

↓

Parent Portal Updated

---

# Invoice Flow

Dashboard

↓

Invoices

↓

Create Invoice

↓

Add Items

↓

Calculate Total

↓

Save

↓

Email Parent

↓

Visible in Parent Portal

---

# Teacher Portal

Teacher Login

↓

Teacher Dashboard

Teacher can access:

* Today's Classes
* Weekly Schedule
* Student Lists
* Attendance
* Homework
* Remarks
* Announcements
* Personal Profile

Teachers cannot access financial data.

---

# Teacher Attendance Workflow

Dashboard

↓

My Classes

↓

Select Class

↓

Student List

↓

Mark Attendance

↓

Submit

↓

Management Review

↓

Attendance Reports Updated

---

# Teacher Remarks Workflow

Student

↓

Add Remark

↓

Submit

↓

Management Approval Queue

↓

Approved

↓

Visible to Parents

OR

Rejected

↓

Visible only to Management

---

# Parent Portal

Parent Login

↓

Parent Dashboard

Parent can view:

* Children
* Class Schedule
* Attendance
* Approved Teacher Remarks
* Announcements
* Invoices
* Payment History
* Download Receipts
* Profile Settings

Parents cannot edit school records.

---

# Announcement Flow

Management

↓

Create Announcement

↓

Choose Audience

* Everyone
* Teachers
* Parents
* Specific Class

↓

Publish

↓

Visible on Dashboards

↓

Push Notification (Future)

---

# Workshop Flow

Dashboard

↓

Workshops

↓

Create Workshop

↓

Capacity

↓

Assign Teacher

↓

Register Students

↓

Attendance

↓

Completion

---

# Birthday Event Flow

Dashboard

↓

Birthday Events

↓

Create Event

↓

Select Child

↓

Choose Package

↓

Assign Staff

↓

Generate Invoice

↓

Confirm Booking

---

# Nursery Flow

Dashboard

↓

Nursery

↓

Enroll Child

↓

Assign Classroom

↓

Assign Teacher

↓

Attendance

↓

Daily Notes

↓

Parent View

---

# Reports Flow

Dashboard

↓

Reports

↓

Select Report

Student Report

Attendance Report

Financial Report

Teacher Report

Workshop Report

Birthday Report

↓

Filters

↓

Generate

↓

Export

PDF

Excel

CSV

---

# Settings Flow

Dashboard

↓

Settings

↓

General

↓

Users

↓

Roles

↓

Permissions

↓

Branding

↓

System Configuration

↓

Save

---

# Notifications Flow

Management Action

↓

Notification Created

↓

Stored in Database

↓

Visible in Dashboard

↓

Email (Future)

↓

WhatsApp (Future)

↓

Mobile Push (Future)

---

# Logout Flow

User Menu

↓

Logout

↓

Session Cleared

↓

Return to Login

---

# Future Flows

The application architecture should support future additions without restructuring.

Future workflows include:

* Online Course Booking
* Online Payments
* WhatsApp Notifications
* SMS Reminders
* AI Student Reports
* AI Lesson Planning
* QR Attendance
* Parent Mobile App
* Teacher Mobile App
* Multi-Branch Management
* Inventory Management
* Staff Leave Requests
* Calendar Integration

---

# User Experience Principles

Every task should require as few clicks as possible.

Users should always know:

* Where they are
* What they can do next
* What action has been completed

Navigation should remain consistent across all modules.

The application should prioritize speed, clarity, accessibility, and simplicity.

Every workflow should feel intuitive and require minimal training.
