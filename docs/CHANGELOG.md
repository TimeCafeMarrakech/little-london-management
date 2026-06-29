# Changelog

All notable changes to the Little London Management System will be documented in this file.

This project follows semantic versioning.

---

## v0.13.0

### Release Name

Business Documents Foundation

### Date

June 30, 2026

### Added

- PDF Engine Foundation
- Student Registration Form PDF
- Premium Invoice PDF
- Business Documents workflow
- Registration Form PDF actions (Preview, Download, Print, Prepare Email, Copy WhatsApp Message)
- Invoice PDF actions (Preview, Download, Print, Prepare Email, Copy WhatsApp Message)

### Improved

- Premium branded business documents
- Shared reusable PDF Engine
- Premium document styling consistent with Premium Boutique Dashboard v3
- Parent-safe document generation workflow

### Security

- Server-side PDF generation
- Management-only access to Registration Form PDFs
- Management-only access to Invoice PDFs

### Technical

- Reusable PDF generation engine
- No database schema changes
- No migration changes
- Lint passes
- Type-check passes
- Build passes

### Notes

Phase 13A (Registration Form PDF) and Phase 13B (Premium Invoice PDF) complete the initial Business Documents Foundation.

Future document work will build on this reusable PDF Engine, beginning with Phase 13C (Premium Receipt PDF).

---

## v0.12.0

### Release Name

Premium Dashboard v3

### Date

June 25, 2026

### Added

- Reports & Analytics
- Management reporting views
- Parent Portal
- Role-aware dashboard
- Premium Dashboard v3
- Premium Login Experience

### Improved

- Dashboard UI
- Sidebar
- Header
- Navigation
- Reports UI
- Authentication UI
- Responsive layouts
- Accessibility
- Documentation

### Fixed

- Reporting view security
- Navigation consistency
- Responsive hero heading
- Sidebar role label
- Dashboard layout
- Reports migrations
- Parent portal helper functions

### Security

- Management-only reporting views
- Parent-safe portal views
- Role-based dashboard navigation
- RLS improvements

### Technical

- Lint passes
- Type-check passes
- Build passes

### Notes

Premium Dashboard v3 is now the approved UI baseline.

Future UI work should follow the Premium Boutique Dashboard v3 design language.
