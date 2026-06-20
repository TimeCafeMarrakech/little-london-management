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

The system will contain the following major modules:

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

# 6. Dashboard Requirements

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

# 7. User Experience Goals

The application must feel modern, friendly, and easy to use.

Every important action should require as few clicks as possible.

Forms should include validation, helpful error messages, and auto-save where appropriate.

Search and filtering should be available across all major data tables.

The interface should remain responsive on desktop, tablet, and mobile devices.

---

# 8. Non-Functional Requirements

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

# 9. Future Expansion

The platform should be designed to support future features without major architectural changes.

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

# 10. Success Criteria

The project will be considered successful when:

* Management can run daily operations entirely through the platform.
* Teachers can efficiently manage classes and attendance.
* Parents can easily monitor their children's activities and payments.
* All information is securely stored and accessible according to user roles.
* The interface is clean, intuitive, and enjoyable to use.
* The architecture supports future growth without requiring major redesign.
