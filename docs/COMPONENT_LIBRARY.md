# Little London Management System

# COMPONENT_LIBRARY.md

Version: 1.0

---

# Purpose

This document defines every reusable UI component that should be built for the Little London Management System.

Every component must be reusable, accessible, responsive, and follow the design language defined in `UI_UX_GUIDELINES.md`.

The application should avoid duplicate components. If a similar component already exists, it should be extended rather than recreated.

---

# Design Principles

All components must be:

* Reusable
* Responsive
* Accessible (WCAG compliant)
* Type-safe (TypeScript)
* Theme-aware (Light & Dark Mode)
* Built using shadcn/ui where appropriate
* Styled with Tailwind CSS
* Animated subtly with Framer Motion when beneficial

---

# Foundation Components

## Buttons

Variants:

* Primary
* Secondary
* Outline
* Ghost
* Destructive
* Success
* Warning
* Icon Button

States:

* Default
* Hover
* Active
* Focus
* Disabled
* Loading

---

## Input Fields

* Text Input
* Email Input
* Password Input
* Phone Input
* Number Input
* Search Input
* URL Input
* Currency Input

Features:

* Validation
* Icons
* Error messages
* Helper text
* Prefix/Suffix support

---

## Text Areas

Used for:

* Teacher remarks
* Notes
* Announcements
* Descriptions

---

## Select Components

* Single Select
* Multi Select
* Searchable Select
* Async Select

---

## Checkbox

Reusable checkbox component.

---

## Radio Group

Reusable radio selection component.

---

## Toggle Switch

Used for:

* Active / Inactive
* Enable / Disable
* Settings

---

## Date Components

* Date Picker
* Date Range Picker
* Time Picker
* Calendar

---

## Avatar

Supports:

* Profile image
* Initials
* Status indicator

---

# Layout Components

## Sidebar

Features:

* Collapse
* Expand
* Icons
* Nested navigation
* Role-aware menu

---

## Top Navigation

Includes:

* Search
* Notifications
* User Profile
* Theme Switch
* Logout

---

## Page Header

Contains:

* Title
* Subtitle
* Breadcrumbs
* Action Buttons

---

## Container

Responsive page container.

---

## Grid Layout

Reusable responsive grid system.

---

# Card Components

## Statistic Card

Displays:

* Title
* Value
* Icon
* Trend
* Percentage

---

## Student Card

Displays:

* Student Photo
* Name
* Age
* Current Course
* Status

---

## Parent Card

Displays:

* Parent Name
* Contact Details
* Number of Children

---

## Teacher Card

Displays:

* Teacher Information
* Assigned Classes
* Availability

---

## Course Card

Displays:

* Course Name
* Teacher
* Capacity
* Schedule

---

## Workshop Card

Displays workshop information.

---

## Event Card

Displays birthday event details.

---

## Announcement Card

Displays:

* Title
* Description
* Date
* Priority

---

# Table Components

Reusable Data Table

Supports:

* Search
* Sorting
* Filters
* Pagination
* Sticky Header
* Row Selection
* Bulk Actions
* Export CSV
* Responsive Layout

---

# Form Components

## Registration Wizard

Multi-step registration including:

* Parent Details
* Student Details
* Course Selection
* Class Assignment
* Payment Information
* Confirmation

---

## Login Form

Reusable login component.

Supports:

* Parent Login
* Teacher Login
* Management Login

---

## Profile Form

Reusable profile editing component.

---

# Modal Components

* Confirmation Dialog
* Delete Dialog
* Success Dialog
* Warning Dialog
* Full-screen Modal

---

# Drawer Components

Used for:

* Quick Edit
* Quick View
* Mobile Navigation

---

# Notification Components

Toast Notifications

Variants:

* Success
* Error
* Warning
* Information

---

# Badge Components

Used for:

* Paid
* Pending
* Overdue
* Active
* Inactive
* Completed
* Draft

---

# Timeline Component

Used for:

* Student History
* Payment History
* Activity Logs

---

# Attendance Components

Attendance Grid

Attendance Calendar

Attendance Summary

Attendance Badge

---

# Financial Components

Invoice Card

Payment Summary

Revenue Card

Outstanding Balance Card

Receipt Viewer

---

# Dashboard Widgets

Student Count

Teacher Count

Parent Count

Today's Classes

Revenue Overview

Attendance Summary

Upcoming Birthdays

Upcoming Workshops

Recent Payments

Recent Registrations

Pending Approvals

Announcements

Quick Actions

---

# Charts

Use Recharts.

Components:

* Line Chart
* Bar Chart
* Area Chart
* Pie Chart
* Donut Chart
* Attendance Heatmap

---

# File Components

Document Upload

Image Upload

PDF Preview

Download Button

---

# Search Components

Global Search

Student Search

Teacher Search

Parent Search

Course Search

---

# Filter Components

Status Filter

Date Filter

Teacher Filter

Course Filter

Branch Filter (Future)

---

# Empty State Components

Illustration

Title

Description

Primary Action Button

---

# Loading Components

Skeleton Cards

Skeleton Tables

Skeleton Forms

Loading Spinner

Progress Bar

---

# Error Components

Friendly Error Message

Retry Button

Contact Support Link

---

# Mobile Components

Bottom Navigation

Floating Action Button

Mobile Drawer

Responsive Tables

---

# Future Components

QR Scanner

WhatsApp Chat Button

AI Assistant Panel

Calendar Scheduler

Kanban Board

Inventory Tracker

Media Gallery

Parent Messaging Center

Teacher Lesson Planner

---

# Naming Convention

Component names should follow PascalCase.

Examples:

StudentCard

AttendanceTable

PaymentSummary

DashboardHeader

RegistrationWizard

InvoicePreview

TeacherRemarksPanel

---

# Folder Structure

components/

ui/

layout/

dashboard/

students/

parents/

teachers/

attendance/

payments/

invoices/

forms/

charts/

tables/

shared/

---

# Final Goal

Every component should be reusable, consistent, scalable, and production-ready.

The component library should enable rapid development while maintaining a unified visual identity across the entire Little London Management System.
