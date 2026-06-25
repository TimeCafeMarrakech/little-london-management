# System Smoke Test Checklist

## Purpose

This document defines the official manual acceptance test checklist for the Little London Management System before every production deployment.

Every release should complete this checklist before approval.

---

## Authentication

□ Login

Expected Result: User can sign in with valid credentials and is redirected to the correct dashboard for their role.

□ Logout

Expected Result: User can log out successfully and is redirected away from protected areas.

□ Forgot Password

Expected Result: User can request a password reset without errors and receives the expected reset flow from Supabase.

□ Reset Password

Expected Result: User can set a new password using a valid reset session and then log in with the updated password.

□ Session Expired

Expected Result: Expired sessions show the session expired page and prompt the user to sign in again.

□ Access Denied

Expected Result: Users without permission see the access denied page instead of restricted content.

---

## Dashboard

□ Dashboard loads

Expected Result: Dashboard opens successfully for the signed-in user role.

□ KPI cards

Expected Result: KPI cards display clearly without layout overlap or missing values.

□ Hero section

Expected Result: Hero section displays Premium Dashboard v3 styling, correct text, and no clipping.

□ Notifications

Expected Result: Notification panel displays correctly and remains visually aligned.

□ Charts

Expected Result: Charts render without blank states or visual overflow.

□ Sidebar

Expected Result: Sidebar displays role-aware navigation and remains scrollable if needed.

□ Header

Expected Result: Header displays search, language pill, user details, and logout correctly.

□ User menu

Expected Result: User details and logout action are visible and usable.

---

## Students

□ List

Expected Result: Student list loads successfully.

□ Search

Expected Result: Search returns matching students and handles no-results states.

□ Filters

Expected Result: Filters update the student list correctly.

□ Create

Expected Result: Authorized users can create a student with valid data.

□ Edit

Expected Result: Authorized users can edit student details with valid data.

□ Archive

Expected Result: Authorized users can archive a student and active lists exclude archived students.

□ Restore

Expected Result: Authorized users can restore archived students.

□ Student profile

Expected Result: Student profile displays core details, relationships, medical information, emergency contacts, enrolments, and attendance summary where available.

---

## Parents

□ List

Expected Result: Parent list loads successfully.

□ Search

Expected Result: Search returns matching parents and handles no-results states.

□ Create

Expected Result: Authorized users can create a parent with valid data.

□ Edit

Expected Result: Authorized users can edit parent details with valid data.

□ Archive

Expected Result: Authorized users can archive a parent.

□ Restore

Expected Result: Authorized users can restore archived parents.

---

## Teachers

□ List

Expected Result: Teacher list loads successfully.

□ Search

Expected Result: Search returns matching teachers and handles no-results states.

□ Create

Expected Result: Authorized users can create a teacher profile with valid data.

□ Edit

Expected Result: Authorized users can edit teacher details with valid data.

---

## Courses

□ List

Expected Result: Course list loads successfully.

□ Create

Expected Result: Authorized users can create a course with valid data.

□ Edit

Expected Result: Authorized users can edit course details with valid data.

---

## Classes

□ List

Expected Result: Class list loads successfully.

□ Create

Expected Result: Authorized users can create a class with valid data.

□ Assign teacher

Expected Result: Authorized users can assign teachers to classes without duplicate or invalid assignments.

---

## Enrolments

□ Create

Expected Result: Authorized users can enrol an active student into an available class.

□ Edit

Expected Result: Authorized users can update enrolment status or details where supported.

□ Archive

Expected Result: Authorized users can remove or archive enrolments without breaking student or class records.

---

## Attendance

□ Sessions

Expected Result: Attendance sessions load and can be created by authorized users for valid classes.

□ Records

Expected Result: Attendance records load for enrolled students and can be marked according to role permissions.

□ Corrections

Expected Result: Authorized users can submit corrections with valid reasons and status changes.

□ Reports

Expected Result: Attendance report data displays accurately in reports and dashboard summaries.

---

## Finance

□ Invoices

Expected Result: Authorized users can view, create, edit, and archive invoices according to status rules.

□ Payments

Expected Result: Authorized users can record payments with valid parent/student relationships.

□ Allocations

Expected Result: Payments allocate to invoices without over-allocation or balance inconsistencies.

### Payment Methods

□ Cash

Expected Result: Cash payments can be recorded and appear in payment reporting.

□ Bank Transfer

Expected Result: Bank transfer payments can be recorded and appear in payment reporting.

□ Cheque

Expected Result: Cheque payments can be recorded and appear in payment reporting.

---

## Events

□ Events

Expected Result: Event list and event detail pages load successfully.

□ Bookings

Expected Result: Authorized users can book linked students into events without duplicate active bookings.

□ Capacity

Expected Result: Event capacity rules prevent overbooking.

□ Staff assignment

Expected Result: Authorized users can assign and remove staff or teachers from events.

---

## Reports

□ Dashboard

Expected Result: Reports dashboard loads for authorized management users.

□ Attendance

Expected Result: Attendance reports display expected summaries and breakdowns.

□ Finance

Expected Result: Finance reports display invoice, payment, balance, and payment method summaries.

□ Enrolments

Expected Result: Enrolment reports display trends, course demand, class demand, and capacity information.

□ Events

Expected Result: Event reports display booking, category, payment status, and capacity summaries.

---

## Parent Portal

□ Login

Expected Result: Parent users can log in and are restricted to parent-safe portal views.

□ Children

Expected Result: Parent users can view only their own linked children.

□ Attendance

Expected Result: Parent users can view only their own child attendance history without internal notes.

□ Finance

Expected Result: Parent users can view only their own family finance information without internal notes.

□ Events

Expected Result: Parent users can view only their own child event bookings and upcoming event visibility.

---

## Responsive

□ Desktop

Expected Result: All pages render correctly on desktop with no unwanted overlap, clipping, or horizontal overflow.

□ Tablet

Expected Result: Tablet layouts remain readable and usable.

□ Mobile

Expected Result: Mobile navigation, forms, cards, and lists remain usable without horizontal overflow.

---

## Security

□ RBAC

Expected Result: Each role sees only the pages and actions allowed by the permission model.

□ Route protection

Expected Result: Protected routes redirect unauthenticated users and block unauthorized users.

□ Parent restrictions

Expected Result: Parent users cannot access management modules or unrelated family data.

□ Teacher restrictions

Expected Result: Teacher users can access only allowed teacher views and assigned-scope data.

---

## Build Verification

□ `npm.cmd run lint`

Expected Result: Command passes without errors.

□ `npm.cmd run type-check`

Expected Result: Command passes without TypeScript errors.

□ `npm.cmd run build`

Expected Result: Production build completes successfully.

---

## Deployment

□ Environment variables verified

Expected Result: Required environment variables are present and no secrets are exposed in logs or documentation.

□ Supabase connected

Expected Result: Application can connect to Supabase successfully.

□ Production login works

Expected Result: Production authentication works for approved test users.

□ Reports work

Expected Result: Reports load correctly for Super Admin and Admin users only.

□ Parent Portal works

Expected Result: Parent Portal loads for parent users and remains read-only.

---

## Release Approval

Version:

Reviewer:

Date:

□ Approved

□ Not Approved
