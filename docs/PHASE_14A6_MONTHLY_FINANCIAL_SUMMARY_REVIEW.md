# Phase 14A.6 Monthly Financial Summary Review

## Summary

The Phase 14A.6 Monthly Financial Summary implementation has been reviewed against the approved Financial Reports plan and completion report.

The implementation is management-only, server-side, and uses the approved Phase 13 PDF engine and Business Documents helpers. It creates a focused `/cashbook/reports` page and one Monthly Financial Summary PDF route without adding separate reports, report history, email sending, WhatsApp sending, migrations, or new database schema.

Financial formulas follow the approved Phase 14A rules:

```text
Total Income = Invoice Payments Received + Recorded Cashbook Income
Net Profit = Total Income - Recorded Expenses
```

Invoice totals are not counted as income, and payment allocations are used only for outstanding invoice balance calculations.

## Files Reviewed

- `docs/PHASE_14A6_FINANCIAL_REPORTS_PLAN.md`
- `docs/PHASE_14A6_MONTHLY_FINANCIAL_SUMMARY_COMPLETION_REPORT.md`
- `app/(dashboard)/cashbook/reports/page.tsx`
- `app/(dashboard)/cashbook/reports/monthly-financial-summary/pdf/route.ts`
- `services/financial-reports/financial-report-service.ts`
- `services/financial-reports/monthly-financial-summary-pdf.ts`
- `components/cashbook/cashbook-tabs.tsx`
- `services/business-documents/pdf-layout.ts`
- `services/business-documents/pdf-route.ts`
- `services/business-documents/pdf-formatters.ts`
- `services/business-documents/pdf-theme.ts`
- `supabase/migrations/202606200017_cashbook_business_performance.sql`
- existing reports and finance service patterns

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

## Passed Items

1. `/cashbook/reports` is management-only through `requireUserProfile()` and `canViewFinancialReports(profile)`.
2. The PDF route is management-only and checks authentication and authorization before loading report data.
3. Teacher and Parent access is blocked server-side because `canViewFinancialReports()` requires Super Admin/Admin role plus `business_performance.view.all`.
4. Month validation accepts only `YYYY-MM` values through `normalizeFinancialReportMonth()`.
5. Month boundaries are timezone-safe and generated from explicit year/month/day date-only strings.
6. Invoice payments are counted once from `payments.amount` via the existing monthly summary view and report service payment queries.
7. Invoice totals are not counted as received income.
8. Payment allocations are not double-counted as income.
9. Cashbook income includes only `status = recorded` and `deleted_at is null`.
10. Expenses include only `status = recorded` and `deleted_at is null`.
11. Net profit and profit margin calculations are correct and guarded against divide-by-zero.
12. Outstanding invoices include only `issued` and `partially_paid` invoices.
13. Draft, cancelled, archived and deleted invoices are excluded.
14. Outstanding balances use payment allocation totals and are clamped to non-negative balances.
15. Previous-month comparisons handle zero previous values with a neutral label.
16. Missing targets display `Not set`.
17. Historical payment methods such as `card` and unknown values are grouped under `Other`.
18. Invoice income remains labelled as `Invoice Income / Unassigned`.
19. The management narrative is deterministic and uses only approved calculations.
20. Detailed salary notes and staff-sensitive notes are not exposed; only aggregate salary total is shown.
21. PDF page-break checks prevent rows from overlapping the footer area.
22. Page numbers and footers are added through the shared Business Documents footer helper.
23. Long table values are constrained with wrapping/truncation to avoid overflow.
24. Preview, download and print actions use the correct PDF route and filename pattern.
25. No database, migration, RBAC, invoice, payment, cashbook or target workflow changes were introduced.
26. Lint, type-check and build pass.

## Blockers

None.

## Important Issues

None.

## Medium Issues

### 1. Continued table pages do not redraw table headers

The PDF uses `ensureDocumentSpace()` before table rows, so rows should not overlap the footer. However, if a long table crosses onto a new page, the document header/footer are redrawn but the table header row is not repeated on the continuation page.

Impact:

- This does not affect calculations, access control, or data safety.
- It may reduce readability for long printed reports, especially outstanding invoice or business-area sections.

Recommended follow-up:

- Add a reusable PDF table helper that redraws the active table header after page breaks.

## Minor Issues

### 1. Report page silently defaults invalid month query values

The PDF route correctly rejects invalid `month` values with a friendly `400` response. The `/cashbook/reports` page defaults invalid month query values back to the current month.

Impact:

- Low. The page remains usable and does not expose data incorrectly.

Recommended follow-up:

- Optionally show a small friendly validation message on the page if an invalid month query is supplied.

### 2. Long table names are constrained rather than fully wrapped

Long parent, student, category, and business-area labels are constrained to avoid overflow. Some table cells use the first wrapped line only.

Impact:

- Low. This prevents visual overflow but may shorten very long labels in the PDF.

Recommended follow-up:

- If full labels become important in printed reports, add multi-line table row rendering.

## Security Review

The implementation does not add Teacher or Parent access.

The following remain management-only:

- report page
- PDF route
- report data service
- salary aggregate visibility
- profit and expense visibility
- outstanding invoice detail

No public report URLs or stored PDF snapshots were added.

## Accuracy Review

The report uses approved financial rules:

- payments are counted once
- invoice totals are excluded from income
- payment allocations are used only for balances
- recorded cashbook income and expenses are filtered correctly
- outstanding invoices are separate from received income
- missing targets and no-data months are handled safely

## Approval Decision

Approved.

The Monthly Financial Summary is safe to proceed with as the approved first Financial Reports deliverable. The medium and minor issues are non-blocking polish items for a later PDF table-helper refinement.

