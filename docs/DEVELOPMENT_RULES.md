# Little London School Management System

# DEVELOPMENT_RULES.md

Version: 1.0

---

# Purpose

This document defines the engineering standards, coding practices, architecture principles, and development rules for the Little London School Management System.

Every developer, AI coding assistant, and future contributor must follow these rules.

The objective is to ensure the application remains:

* Maintainable
* Scalable
* Secure
* Performant
* Consistent
* Production Ready

---

# Core Development Philosophy

Before writing code:

Understand the requirement.

↓

Review documentation.

↓

Identify business rules.

↓

Identify database impact.

↓

Identify permissions.

↓

Identify reusable components.

↓

Plan implementation.

↓

Write code.

Never code first and think later.

---

# Technology Standards

Mandatory Stack

Frontend

* Next.js 15
* React
* TypeScript
* TailwindCSS
* shadcn/ui
* Framer Motion

Backend

* Supabase
* PostgreSQL

Deployment

* Vercel

Repository

* GitHub

No alternative frameworks should be introduced without approval.

---

# TypeScript Rules

TypeScript is mandatory.

Requirements:

✓ Strict Mode

✓ Explicit Types

✓ Shared Interfaces

✓ Shared Enums

✓ Shared Types

Not Allowed:

✗ any

✗ ts-ignore

✗ Unnecessary type assertions

Every function should have proper typing.

---

# Component Rules

Components must be:

* Small
* Reusable
* Focused
* Typed
* Accessible

Avoid giant components.

If a component exceeds approximately 300 lines, evaluate splitting it into smaller components.

---

# Reusability Rules

Before creating a component:

Check whether a similar component already exists.

Examples:

Do not create:

StudentButton

TeacherButton

ParentButton

Instead create:

PrimaryButton

with configurable props.

---

# Business Logic Rules

Business logic must never live inside UI components.

Incorrect:

```tsx id="fh1v2x"
StudentPage.tsx

fetch database
calculate invoice
validate payment
```

Correct:

```tsx id="57u8zq"
student.service.ts

handles business logic
```

UI components should only display information.

---

# Services Layer

All business logic belongs in:

```text id="7b0yzm"
services/
```

Examples:

```text id="gcbtrc"
student.service.ts

parent.service.ts

attendance.service.ts

invoice.service.ts
```

Responsibilities:

* Validation
* Database calls
* Business rules
* Calculations

---

# Hooks Rules

Custom hooks belong inside:

```text id="sgspw5"
hooks/
```

Examples:

```text id="12z3k8"
useAuth

useStudents

useAttendance

useInvoices
```

Hooks should:

* Have one responsibility
* Be reusable
* Remain predictable

---

# State Management

Preferred order:

1. React Server Components
2. URL State
3. React State
4. React Query
5. Global State (only when necessary)

Avoid unnecessary global state.

---

# Server Components

Use Server Components by default.

Only use Client Components when:

* Interactivity is required.
* Browser APIs are needed.
* State management is necessary.

Server-first architecture is preferred.

---

# Data Fetching Rules

Use:

* Server Actions
* React Query
* Supabase

Avoid:

* Duplicate requests
* Excessive client-side fetching

Every query should be optimized.

---

# Error Handling

Every operation must handle:

* Loading
* Success
* Error
* Empty State

Examples:

Student List

Loading → Skeleton

Success → Data

Empty → Empty State

Error → Retry Option

Never leave users without feedback.

---

# Form Standards

Every form must include:

* Validation
* Error Messages
* Loading State
* Success State
* Accessible Labels

Use:

* React Hook Form
* Zod

Validation must exist both client-side and server-side.

---

# Table Standards

Every table must support:

* Search
* Sorting
* Filtering
* Pagination
* Empty State
* Loading State

Large datasets should never be loaded entirely.

---

# Accessibility Rules

Every feature must meet WCAG AA standards.

Requirements:

* Keyboard navigation
* Focus indicators
* ARIA labels
* Screen reader support
* Color contrast compliance

Accessibility is not optional.

---

# Performance Rules

Optimize:

* Images
* Database Queries
* Bundle Size
* Rendering

Use:

* Lazy Loading
* Dynamic Imports
* Pagination
* Caching

Avoid:

* Unnecessary re-renders
* Large client bundles

---

# Security Rules

Never trust client-side input.

Validate everything.

Every request must:

* Verify authentication
* Verify permissions
* Sanitize inputs

Never expose:

* Tokens
* Passwords
* Internal errors

---

# Authentication Rules

Every protected action must verify:

1. User is authenticated
2. User has correct role
3. User has required permission

Never rely on frontend checks alone.

---

# Permission Rules

Permissions are controlled through:

PERMISSIONS.md

Every module must enforce permissions at:

* UI level
* API level
* Database level

---

# Logging Rules

Log important actions:

* Login
* Logout
* Student Creation
* Attendance Updates
* Invoice Changes
* Payment Updates
* Permission Changes

Logs should support future auditing.

---

# Database Rules

All database changes must:

* Use migrations
* Preserve data integrity
* Use foreign keys
* Use indexes where appropriate

Never modify production data directly.

---

# Naming Conventions

Files

kebab-case

Examples:

```text id="j9l0h2"
student-form.tsx

invoice-service.ts
```

Components

PascalCase

Examples:

```text id="clvh4v"
StudentForm

InvoiceTable
```

Hooks

camelCase

Examples:

```text id="w7fgsd"
useAuth

useStudents
```

---

# Documentation Rules

Every major feature should include:

* Purpose
* Inputs
* Outputs
* Business Rules

Complex logic should be documented.

Avoid redundant comments.

---

# Testing Requirements

Every feature must be tested.

Minimum:

* Unit Tests
* Integration Tests
* Permission Tests
* Validation Tests

Critical workflows require end-to-end testing.

---

# Mobile Requirements

Every page must be:

* Responsive
* Touch Friendly
* Tested on mobile

Parents will primarily access the portal from phones.

---

# UI Consistency Rules

Follow:

UI_UX_GUIDELINES.md

Use:

* Existing components
* Existing spacing
* Existing typography

Never create inconsistent UI patterns.

---

# AI Development Rules

Before implementing any feature:

1. Read all documentation.
2. Review related modules.
3. Identify reusable components.
4. Verify permissions.
5. Verify database impact.
6. Implement.
7. Test.
8. Refactor.

Never generate placeholder code.

Never skip validation.

Never skip error handling.

Never skip accessibility.

---

# Code Review Checklist

Before completing a feature:

✓ Typed

✓ Reusable

✓ Accessible

✓ Secure

✓ Responsive

✓ Tested

✓ Error Handling

✓ Loading States

✓ Permission Checks

✓ Documentation Updated

---

# Final Goal

The Little London School Management System should be built to production standards from the beginning.

Every line of code should contribute to a maintainable, scalable, secure, and high-quality application that can support the business for many years and expand into multiple branches in the future.
