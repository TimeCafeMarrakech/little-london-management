# Phase 14A.6 Monthly Financial Summary Completion Report

## Summary

Phase 14A.6 has implemented the first Financial Reports deliverable:

- Monthly Financial Summary PDF

The implementation adds a management-only `/cashbook/reports` page with month selection and actions to preview, download, and print the Monthly Financial Summary PDF.

No separate supporting reports were built in this step.

## Files Created

- `app/(dashboard)/cashbook/reports/page.tsx`
- `app/(dashboard)/cashbook/reports/monthly-financial-summary/pdf/route.ts`
- `services/financial-reports/financial-report-service.ts`
- `services/financial-reports/monthly-financial-summary-pdf.ts`
- `docs/PHASE_14A6_MONTHLY_FINANCIAL_SUMMARY_COMPLETION_REPORT.md`

## Files Modified

- `components/cashbook/cashbook-tabs.tsx`

## Routes

Created:

- `/cashbook/reports`
- `/cashbook/reports/monthly-financial-summary/pdf`

PDF route query parameters:

- `month=YYYY-MM`
- `download=1`

Recommended filename:

- `little-london-monthly-financial-summary-YYYY-MM.pdf`

## Data Sources

The report reuses approved existing data sources:

- `cashbook_monthly_summary_view`
- `cashbook_target_progress_view`
- `payments`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `business_areas`
- `cashbook_expense_categories`
- `invoices`
- `payment_allocations`
- `parents`
- `students`

No new SQL view or migration was created.

## Financial Formulas

Total income:

```text
Invoice Payments Received + Recorded Cashbook Income
```

Net profit:

```text
Total Income - Recorded Expenses
```

Profit margin:

```text
Net Profit / Total Income * 100
```

Outstanding invoices are shown separately and are not counted as received income.

Payment allocations are used only to calculate outstanding invoice balances and are not counted as income.

## PDF Layout

The PDF uses the approved Phase 13 Business Documents PDF foundation:

- `SimplePdfDocument`
- shared Business Documents header
- shared Business Documents footer
- shared section title helper
- shared summary card helper
- shared table header helper
- shared route response helper
- Premium Boutique Dashboard v3 colour palette

PDF sections:

1. Header
2. Management Summary narrative
3. Executive KPI summary
4. Income vs Expenses overview
5. Target Performance
6. Income Analysis
7. Expense Analysis
8. Outstanding Invoices
9. Business Area Performance
10. Footer

## Executive Summary Logic

The report includes a short deterministic management summary.

The narrative is built only from approved calculations:

- income movement versus previous month
- positive or negative net profit
- revenue target status where available
- expense budget status where available
- outstanding invoice count

No AI or external service is used.

## Page-Break Handling

The PDF uses the existing `ensureDocumentSpace()` helper to add new pages where needed.

The implementation avoids orphan sections where possible and repeats the document header/footer on new pages.

Long names are wrapped or truncated safely inside table rows.

## Security

Financial Reports are management-only.

Allowed:

- Super Admin
- Admin

Blocked:

- Teacher
- Parent

Access is checked server-side through:

- `canViewFinancialReports(profile)`
- `business_performance.view.all`

The PDF route also performs server-side authentication and authorization before loading report data.

No public report URLs were added.

## Accuracy Safeguards

Implemented safeguards:

- Month input is validated as `YYYY-MM`.
- Month boundaries are generated from date-only year/month/day parts.
- No local-midnight `toISOString()` conversion is used for report month boundaries.
- Cashbook income includes only `status = recorded` and `deleted_at is null`.
- Cashbook expenses include only `status = recorded` and `deleted_at is null`.
- Outstanding invoices include only `issued` and `partially_paid`.
- Draft, cancelled, deleted and archived invoices are excluded.
- Previous-month zero values show neutral comparison text.
- Missing targets show `Not set`.
- Unknown or historical payment methods are grouped as `Other`.
- Invoice income remains labelled as `Invoice Income / Unassigned`.

## Known Limitations

- Only Monthly Financial Summary is implemented.
- Income vs Expenses, Profit and Loss, Outstanding Invoices, and Target Achievement as separate reports remain deferred.
- Cash Movement, Business Area Performance, and Payment Method Summary as standalone reports remain deferred.
- No report history was created.
- No stored PDF snapshots were created.
- Email sending is not included.
- WhatsApp sending is not included.
- Quarterly and yearly reports are not included.
- Parent and Teacher access are intentionally not included.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
