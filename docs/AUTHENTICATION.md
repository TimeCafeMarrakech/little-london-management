# Little London School Management System

# AUTHENTICATION.md

Version: 1.0

---

# Purpose

This document defines the authentication and authorization architecture for the Little London School Management System.

The application must use secure authentication, role-based authorization, protected routes, and session management to ensure that users can only access resources appropriate to their role.

Authentication will be powered by **Supabase Auth**.

---

# Authentication Provider

Provider:

* Supabase Authentication

Supported Methods:

* Email & Password
* Password Reset via Email

Future Support:

* Google Login
* Apple Login
* Microsoft Login
* Magic Link
* Multi-Factor Authentication (MFA)

---

# User Roles

The system supports the following roles:

* Super Admin
* Admin
* Teacher
* Parent

Each authenticated user must have exactly one primary role.

Permissions are controlled through Role-Based Access Control (RBAC).

---

# Authentication Flow

User visits the application.

↓

User enters email and password.

↓

Supabase validates credentials.

↓

Session is created.

↓

User profile is retrieved from the database.

↓

Role is determined.

↓

Permissions are loaded.

↓

User is redirected to the appropriate dashboard.

---

# Login Requirements

Users must provide:

* Email Address
* Password

Validation Rules:

* Email is required.
* Password is required.
* Email must be valid.
* Password cannot be empty.
* Trim leading and trailing spaces.
* Display friendly validation messages.

---

# Login Success

On successful login:

* Create secure session.
* Load user profile.
* Load role.
* Load permissions.
* Redirect to dashboard.
* Display welcome notification.

---

# Login Failure

Display user-friendly errors.

Examples:

* Invalid email or password.
* Account disabled.
* Account locked.
* Session expired.
* Network error.

Never expose internal authentication details.

---

# Logout

Logout must:

* Destroy current session.
* Clear cached user data.
* Redirect to Login page.
* Prevent access to protected pages.

---

# Session Management

The application must:

* Automatically restore valid sessions.
* Refresh expired access tokens.
* Handle session expiration gracefully.
* Detect invalid sessions.
* Redirect unauthenticated users to Login.

---

# Password Policy

Passwords must:

* Be at least 8 characters long.
* Contain at least one uppercase letter.
* Contain at least one lowercase letter.
* Contain at least one number.
* Special characters are recommended.

Passwords must never be stored in plaintext.

---

# Forgot Password

Users may request a password reset by entering their registered email.

Flow:

User enters email.

↓

System sends secure reset email.

↓

User clicks reset link.

↓

User enters new password.

↓

Password updated.

↓

Redirect to Login.

---

# Password Reset Rules

Reset links:

* Single use
* Time limited
* Securely generated
* Automatically expire

---

# Email Verification

Future feature.

New accounts should verify email before first login.

Verification emails should expire after a configurable period.

---

# Remember Me

Support persistent login sessions.

When enabled:

* Extend session duration.
* Store session securely.
* Respect browser security policies.

---

# Protected Routes

The following areas require authentication:

* Dashboard
* Students
* Parents
* Teachers
* Attendance
* Courses
* Payments
* Reports
* Settings

Unauthenticated users attempting to access protected routes must be redirected to the Login page.

---

# Role-Based Routing

After login:

Super Admin

→ Admin Dashboard

Admin

→ Management Dashboard

Teacher

→ Teacher Dashboard

Parent

→ Parent Portal

Users must never access dashboards belonging to other roles.

---

# Route Guards

Every protected route must verify:

* User is authenticated.
* Session is valid.
* Role is authorized.
* Required permissions exist.

Unauthorized access must return an appropriate error or redirect.

---

# Account Status

Supported account states:

* Active
* Pending
* Suspended
* Disabled
* Archived

Only Active accounts may log in.

---

# Security Rules

The authentication system must:

* Use HTTPS in production.
* Never expose tokens to client-side logs.
* Never expose passwords.
* Never store sensitive credentials in local storage.
* Validate every authenticated request.
* Sanitize user input.
* Use secure cookies where applicable.

---

# Token Management

Supabase manages:

* Access Token
* Refresh Token

The application should:

* Refresh tokens automatically.
* Detect expired sessions.
* Prompt users to log in again if required.

---

# Authentication Middleware

Middleware must:

* Protect private routes.
* Redirect unauthenticated users.
* Verify user session.
* Verify user role.
* Prevent unauthorized access.

---

# User Profile Loading

After successful login, load:

* User ID
* Full Name
* Email
* Role
* Profile Photo
* Status
* Branch (future)
* Assigned Classes (Teachers)
* Linked Students (Parents)

---

# Login Page Requirements

The login page must include:

* School Logo
* Welcome Message
* Email Input
* Password Input
* Show/Hide Password
* Remember Me Checkbox
* Forgot Password Link
* Login Button
* Loading State
* Error Messages

The interface must be responsive and accessible.

---

# Session Timeout

Inactive sessions should automatically expire after a configurable period.

When a session expires:

* Display a notification.
* Save unsaved work where possible.
* Redirect to Login.
* Require re-authentication.

---

# Audit Logging

Record authentication events including:

* Login Success
* Login Failure
* Logout
* Password Reset Request
* Password Changed
* Account Locked
* Account Disabled

Logs should include:

* Timestamp
* User ID
* IP Address (where available)
* Device Information (future)

---

# Future Enhancements

Prepare the architecture for:

* Google Sign-In
* Apple Sign-In
* Microsoft Sign-In
* Multi-Factor Authentication (MFA)
* Biometric Login (Mobile)
* QR Code Login
* Single Sign-On (SSO)
* Organization-based Authentication

---

# Development Standards

Authentication code must:

* Use TypeScript only.
* Follow Supabase best practices.
* Avoid duplicate authentication logic.
* Use reusable authentication hooks and services.
* Centralize permission checks.
* Handle loading and error states consistently.
* Be fully typed with no use of `any`.

---

# Final Goal

The authentication system must provide a secure, scalable, and user-friendly experience while enforcing strict access control throughout the Little London School Management System. It should be designed to support future authentication methods and organizational growth without requiring major architectural changes.
