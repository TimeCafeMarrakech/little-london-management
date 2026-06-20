# Little London School Management System

# FOLDER_STRUCTURE.md

Version: 1.0

---

# Purpose

This document defines the folder architecture and organizational standards for the Little London School Management System.

The goal is to maintain a clean, scalable, and maintainable codebase that supports future growth and additional features without becoming difficult to manage.

Every developer and AI coding assistant must follow this structure.

---

# Architecture Philosophy

The application follows:

* Feature-Based Architecture
* Component-Driven Development
* Clean Architecture Principles
* Separation of Concerns
* Reusable Components
* Strong Type Safety

The codebase should remain organized even as the platform grows.

---

# Root Structure

```text
/

app/
components/
features/
hooks/
lib/
services/
supabase/
types/
utils/
public/
styles/
docs/

package.json
README.md
```

---

# app/

Contains all Next.js routes and pages.

```text
app/

(auth)/
(dashboard)/

students/
parents/
teachers/
attendance/
payments/
invoices/
workshops/
birthdays/
reports/
settings/

layout.tsx
page.tsx
```

Responsibilities:

* Route definitions
* Layouts
* Server Components
* Page composition

Avoid placing business logic directly inside pages.

---

# components/

Contains reusable UI components.

```text
components/

ui/
layout/
dashboard/
forms/
tables/
charts/
navigation/
shared/
```

---

# components/ui/

Low-level reusable components.

Examples:

* Button
* Input
* Select
* Modal
* Card
* Badge
* Avatar
* Tooltip

These should be generic and reusable throughout the application.

---

# components/layout/

Layout-related components.

Examples:

* Sidebar
* Header
* Footer
* PageContainer
* Breadcrumbs

---

# components/dashboard/

Dashboard-specific widgets.

Examples:

* StudentCountCard
* RevenueCard
* AttendanceWidget
* UpcomingBirthdays
* QuickActions

---

# components/forms/

Reusable forms.

Examples:

* LoginForm
* StudentForm
* ParentForm
* TeacherForm
* CourseForm

---

# components/tables/

Reusable table components.

Examples:

* StudentsTable
* TeachersTable
* PaymentsTable
* AttendanceTable

---

# components/charts/

Charts and visualizations.

Examples:

* RevenueChart
* AttendanceChart
* EnrollmentChart

Use Recharts.

---

# features/

Contains business modules.

```text
features/

auth/
students/
parents/
teachers/
attendance/
payments/
invoices/
workshops/
birthdays/
reports/
announcements/
```

Each feature should contain:

```text
feature/

components/
hooks/
services/
types/
validators/
```

---

# hooks/

Custom React hooks.

Examples:

```text
hooks/

useAuth.ts
useStudents.ts
useAttendance.ts
useInvoices.ts
usePermissions.ts
```

Hooks should be reusable and focused.

---

# lib/

Application-wide libraries and configuration.

Examples:

```text
lib/

auth.ts
permissions.ts
constants.ts
validators.ts
date-utils.ts
```

---

# services/

Contains business logic and database operations.

Examples:

```text
services/

student.service.ts
parent.service.ts
teacher.service.ts
attendance.service.ts
payment.service.ts
```

Rules:

* Business logic belongs here.
* Pages should never contain business logic.

---

# supabase/

Supabase configuration.

```text
supabase/

client.ts
server.ts
middleware.ts
```

Responsibilities:

* Authentication
* Database connections
* Storage
* Realtime subscriptions

---

# types/

Global TypeScript types.

Examples:

```text
types/

student.ts
parent.ts
teacher.ts
invoice.ts
attendance.ts
```

No duplicate type definitions.

---

# utils/

Utility functions.

Examples:

```text
utils/

formatCurrency.ts
formatDate.ts
generateInvoice.ts
calculateAge.ts
```

Utilities should remain pure.

---

# public/

Static assets.

```text
public/

images/
icons/
logos/
documents/
```

Examples:

* Logo
* Illustrations
* Marketing Assets

---

# styles/

Global styles.

```text
styles/

globals.css
theme.css
```

Use TailwindCSS as primary styling solution.

Avoid large custom CSS files.

---

# docs/

Project documentation.

Contains:

* MASTER_PROMPT.md
* PRODUCT_REQUIREMENTS.md
* DATABASE_SCHEMA.md
* UI_UX_GUIDELINES.md
* APP_FLOW.md
* COMPONENT_LIBRARY.md
* API_REQUIREMENTS.md
* AUTHENTICATION.md
* PERMISSIONS.md
* DEVELOPMENT_RULES.md
* TESTING.md
* DEPLOYMENT.md
* ROADMAP.md

---

# Naming Conventions

Files:

kebab-case

Examples:

```text
student-form.tsx

attendance-table.tsx

invoice-service.ts
```

Components:

PascalCase

Examples:

```text
StudentForm

AttendanceTable

RevenueChart
```

Hooks:

camelCase

Examples:

```text
useAuth

useAttendance

useStudents
```

---

# Import Rules

Prefer absolute imports.

Example:

```typescript
import { StudentForm } from "@/components/forms/student-form";
```

Avoid deeply nested relative imports.

---

# Future Expansion

The structure should support future modules:

* Mobile App
* WhatsApp Integration
* AI Assistant
* Multi-Branch Support
* Inventory Management
* Online Payments
* Parent Messaging
* Calendar Integration

Without requiring major restructuring.

---

# Final Goal

The folder structure should make the codebase easy to understand, easy to scale, and easy to maintain.

A new developer should be able to understand the project structure within minutes.

Every feature should have a clear and predictable location within the application.
