# Changelog

All notable changes to the Little London Management System will be documented in this file.

This project follows semantic versioning.

---

## v0.13.1

### Release Name

Payment Recording Stability Fix

### Date

June 30, 2026

### Added

- Improved payment recording diagnostics
- Structured server-side logging for payment RPC failures
- Friendly error mapping for known payment allocation errors

### Improved

- Payment recording reliability
- Payment allocation validation
- Database locking strategy for invoice allocations
- Server-side finance error visibility

### Fixed

- Partial payment recording failure
- PostgreSQL locking error: FOR UPDATE is not allowed with DISTINCT clause
- Invoice allocation processing for partial payments
- Payment recording RPC drift by recreating record_payment_with_allocations in a new migration

### Technical

- Added follow-up Supabase migration for payment recording RPC
- Added PostgreSQL-compatible invoice row locking
- Preserved transaction safety and allocation validation
- Lint passes
- Type-check passes
- Build passes

### Notes

Payment recording has been validated for creating a 5,000 MAD invoice and recording a 2,000 MAD partial cash payment. The invoice balance updates to 3,000 MAD and status becomes partially paid.

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
