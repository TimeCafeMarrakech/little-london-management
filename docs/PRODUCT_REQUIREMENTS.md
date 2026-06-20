# Little London Management System

# PRODUCT_REQUIREMENTS.md

## Version 1.0

---

# 1. Product Vision

## Mission

Little London aims to provide a modern digital platform that manages every aspect of the children's learning center while delivering an exceptional experience for parents, teachers, and management.

The application should eliminate paper-based administration, reduce manual work, improve communication, and provide real-time information to all authorized users.

The software should be intuitive enough that a new employee can learn it within a few hours.

---

# 2. Business Overview

Little London is an English learning and children's activity center that offers educational and recreational programs for children of different ages.

Services include:

* English Language Classes
* Nursery
* Drop & Play
* Arts & Crafts Workshops
* Baking Workshops
* Drama Classes
* Birthday Party Packages
* Holiday Camps
* Seasonal Workshops
* Educational Events

Children may participate in multiple services simultaneously.

Each child may have one or more parents or guardians.

Each teacher may teach multiple classes.

Each course may contain multiple sessions.

---

# 3. Primary Users

The platform will support three user types.

## Management

Responsible for operating the entire business.

Responsibilities include:

* Register students
* Register parents
* Assign teachers
* Create classes
* Manage payments
* Generate invoices
* Publish announcements
* Review teacher remarks
* Manage attendance reports
* Manage workshops
* Manage nursery
* Manage birthday bookings
* View business analytics

---

## Teachers

Teachers manage classroom activities.

Responsibilities include:

* View assigned classes
* Mark attendance
* Add daily remarks
* Upload homework
* Record student progress
* View teaching schedule

Teachers cannot access financial information.

---

## Parents

Parents access information related only to their own children.

Parents can:

* View child profile
* View attendance
* View enrolled courses
* Download invoices
* View payment history
* Receive announcements
* View approved teacher comments
* View schedules

Parents cannot modify academic or financial records.

---

# 4. Registration Workflow

The registration process should support multiple entry points.

Registration sources include:

* Website Registration Form
* Google Form
* Tally Form
* Manual Registration by Management

The workflow is:

Parent submits registration

↓

Management reviews registration

↓

Parent record is created

↓

Student record is created

↓

Course enrollment is assigned

↓

Class assignment is created

↓

Teacher assignment is linked

↓

Invoice is generated

↓

Parent Portal account is activated

↓

Student appears on dashboards

The process should avoid duplicate parent or student records.

---

# 5. Core Functional Modules

The full product roadmap will contain the following major modules. This list describes the complete product vision, not the first build scope. The scope section below defines which modules are included in MVP, later roadmap phases, and future expansion.

### Dashboard

Business overview, KPIs, quick actions, notifications, and recent activity.

### Parent Management

Manage parent profiles, contact information, linked children, invoices, and communication history.

### Student Management

Complete student profiles including personal details, emergency contacts, medical notes, allergies, attendance, enrollments, and progress.

### Teacher Management

Teacher profiles, schedules, assigned classes, qualifications, and availability.

### Course Management

Create, edit, archive, and schedule English classes, nursery programs, workshops, drama sessions, and holiday camps.

### Attendance

Daily attendance tracking with reports, late arrivals, absences, and attendance history.

### Finance

Invoices, payments, discounts, refunds, payment status, and financial reports.

### Announcements

Management can publish announcements visible to teachers, parents, or both.

### Teacher Remarks

Teachers submit remarks about students. Management reviews and approves remarks before parents can view them.

### Events

Manage birthday parties, workshops, seasonal events, and special activities.

### Reports

Generate reports for attendance, finances, registrations, and business performance.

---

# 6. MVP Scope and Phase Boundaries

The product must be built incrementally. A module listed as "core" is part of the complete product vision, but it is not automatically included in the first build.

Scope labels:

* MVP / Phase 1-3: Included in the first build.
* Phase 4-6: Planned immediately after MVP, but not part of the first build.
* Later: Planned in the core roadmap after Phase 6.
* Future: Advanced expansion after the core platform is stable.

## 6.1 MVP / Phase 1-3

The first build includes the platform foundation, secure access, and role-based dashboard framework.

Included:

* Foundation and infrastructure.
* Supabase project connection and environment setup.
* Authentication with email/password login, logout, password reset, session handling, and protected routes.
* Role-based access control for Super Admin, Admin, Teacher, and Parent.
* Role-aware navigation and dashboard shell.
* Management Dashboard, Teacher Dashboard, and Parent Portal dashboard framework.
* Dashboard widgets, quick actions, and notification placeholders where supporting data exists.
* Theme, layout, sidebar, top navigation, loading states, empty states, and access denied states.

Not included in the first build:

* Full student, parent, or teacher management.
* Courses, classes, sessions, enrollments, attendance, finance, events, announcements, teacher remarks, and reporting workflows.
* WhatsApp, AI reports, online payments, native mobile apps, and operational multi-branch management.

## 6.2 Phase 4-6

Phase 4-6 adds the first operational management modules. These are early roadmap modules, but they are not part of the first build.

Included:

* Students: full student profiles, medical information, allergies, emergency contacts, documents, search, filters, archive/restore, and course/class assignment readiness.
* Parents: parent profiles, contact details, child linking, parent-student relationships, communication history, and parent portal account readiness.
* Teachers: teacher profiles, qualifications, availability, timetable basics, assigned classes, assigned courses, and teacher account linking.
* Registration review support where required to create parents, students, and portal access without duplicates.

Excluded until later phases:

* Full course/class scheduling.
* Attendance taking and attendance reports.
* Invoice generation, payments, receipts, discounts, and refunds.
* Workshops, nursery, birthday events, announcements, teacher remarks, and reports.

## 6.3 Later

Later phases are still part of the core product roadmap. They should be implemented after Phase 4-6 and before the platform is considered complete for full daily operations.

Included:

* Courses, classes, sessions, enrollments, capacity management, teacher assignment, student assignment, and scheduling in Phase 7.
* Attendance sessions, attendance records, teacher attendance workflow, late arrivals, history, corrections, review, and reports in Phase 8.
* Invoices, invoice items, manual payments, receipts, outstanding balances, payment history, basic discounts, manual refund tracking, and financial dashboard in Phase 9.
* Workshops, arts and crafts, baking workshops, drama classes, holiday camps, nursery programs, birthday events, staff assignment, bookings, and attendance in Phase 10.
* Announcements, in-app notifications, teacher remarks, teacher remark approval workflow, homework, lesson notes, and lesson progress in Phase 11.
* Reports and analytics for students, attendance, finance, enrollments, workshops, birthdays, teachers, exports, and report history in Phase 12.
* Performance optimization, accessibility review, mobile web improvements, testing, UAT, and production deployment in Phase 13-15.

## 6.4 Future

Future items must be designed for, but they are not part of the first build or the core operational roadmap.

Future features:

* WhatsApp notifications and WhatsApp communication history.
* SMS reminders.
* Email campaigns and advanced delivery automation.
* Online payment gateway and automated payment reconciliation.
* Online payment refunds through a payment provider.
* AI-generated student reports.
* AI lesson planning.
* Parent mobile app.
* Teacher mobile app.
* Full multi-branch management, branch-level roles, branch transfer workflows, and branch-specific settings.
* Online booking for workshops, birthday parties, and activities.
* QR attendance.
* Inventory management.
* Calendar synchronization.
* Digital consent forms.
* Media gallery.
* Parent messaging center.

## 6.5 Module Scope Summary

| Module | Scope | First Build? | Notes |
| --- | --- | --- | --- |
| Authentication | MVP / Phase 1-3 | Yes | Email/password, password reset, sessions, protected routes, RBAC. |
| Dashboard | MVP / Phase 1-3 | Yes | Role-aware shell and widgets; data depth grows as modules are added. |
| Students | Phase 4-6 | No | Full management begins in Phase 4. |
| Parents | Phase 4-6 | No | Full management and child linking begin in Phase 5. |
| Teachers | Phase 4-6 | No | Full management and assignment readiness begin in Phase 6. |
| Courses | Later | No | Phase 7. |
| Classes | Later | No | Phase 7. |
| Attendance | Later | No | Phase 8. |
| Invoices | Later | No | Phase 9. |
| Payments | Later | No | Manual payment tracking in Phase 9; online payments are Future. |
| Announcements | Later | No | Phase 11. |
| Teacher Remarks | Later | No | Phase 11 with management approval before parent visibility. |
| Workshops | Later | No | Phase 10. |
| Nursery | Later | No | Phase 10. |
| Birthday Events | Later | No | Phase 10. |
| Reports | Later | No | Phase 12. |
| WhatsApp | Future | No | Integration after core platform stability. |
| AI Reports | Future | No | Advanced feature after core reporting exists. |
| Online Payments | Future | No | Manual payments come first in Phase 9. |
| Mobile App | Future | No | Responsive web is required throughout; native apps are future. |
| Multi-Branch | Future | No | Database and permissions should be branch-ready from the start; full operations are future. |

## 6.6 Scope Resolution Rules

To resolve contradictions between current and future scope:

* "Core module" means part of the overall product roadmap, not necessarily the MVP.
* "First build" means MVP / Phase 1-3 only.
* In-app notifications are part of the dashboard and communication roadmap; WhatsApp, SMS, email campaigns, and push notifications are future delivery channels.
* Manual invoice and payment tracking is Later; online payment processing is Future.
* Basic discounts and manual refund tracking belong with Later finance; automated gateway refunds are Future.
* Homework, lesson notes, and lesson progress are Later teacher workflows, not MVP.
* Multi-branch support must be considered in schema, permissions, and architecture from the start, but full branch management is Future.
* Responsive mobile web is required for every phase; native mobile applications are Future.

---

# 7. Dashboard Requirements

The Management Dashboard should display:

* Total Students
* Total Parents
* Total Teachers
* Today's Attendance
* Today's Classes
* Outstanding Payments
* Revenue This Month
* Upcoming Birthdays
* Active Workshops
* Recent Registrations
* Pending Teacher Remarks
* Latest Announcements

The dashboard should also provide quick action buttons for:

* Register Student
* Create Invoice
* Add Course
* Add Teacher
* Create Announcement

---

# 8. User Experience Goals

The application must feel modern, friendly, and easy to use.

Every important action should require as few clicks as possible.

Forms should include validation, helpful error messages, and auto-save where appropriate.

Search and filtering should be available across all major data tables.

The interface should remain responsive on desktop, tablet, and mobile devices.

---

# 9. Non-Functional Requirements

* Fast page loading
* Responsive design
* Secure authentication
* Role-based permissions
* Accessible interface
* Clean navigation
* Scalable architecture
* Maintainable codebase
* Audit logging for important actions

---

# 10. Future Expansion

The platform should be designed to support future features without major architectural changes. These items are not part of the first build unless explicitly moved into the roadmap later.

Potential future additions include:

* Multi-branch support
* WhatsApp notifications
* Email campaigns
* Online payment gateway
* Mobile applications
* AI-generated student progress reports
* Inventory management
* Parent messaging
* Calendar synchronization
* QR code attendance
* Digital consent forms
* Media gallery
* Online booking for workshops and birthday parties

---

# 11. Success Criteria

The project will be considered successful when:

* Management can run daily operations entirely through the platform.
* Teachers can efficiently manage classes and attendance.
* Parents can easily monitor their children's activities and payments.
* All information is securely stored and accessible according to user roles.
* The interface is clean, intuitive, and enjoyable to use.
* The architecture supports future growth without requiring major redesign.
