# Phase 14A.6 Financial Reports Module Plan

## 1. Purpose

Phase 14A.6 plans a management-only Financial Reports module for Little London.

The goal is to produce accurate, premium, printable PDF reports from already approved finance and cashbook data. These reports should support:

- monthly management review
- printing
- saving locally
- sharing with an accountant
- business planning discussions

This phase must not change existing calculations, invoice/payment workflows, Daily Income, Expenses, Targets, the Business Performance dashboard, Business Documents, Parent Portal, authentication, RBAC or RLS.

The module should reuse the approved Phase 13 Business Documents PDF engine and the Phase 14A.1 cashbook reporting foundation.

## 2. MVP Report List

### MVP Reports

The first Financial Reports implementation should include:

1. Monthly Financial Summary
2. Income vs Expenses Report
3. Profit and Loss Summary
4. Outstanding Invoices Report
5. Target Achievement Report

These reports cover the core management questions without turning the module into a full accounting suite.

### Deferred Reports

The following should be planned but deferred until the MVP is approved:

1. Cash Movement Report
2. Business Area Performance Report
3. Payment Method Summary

Reason for deferral:

- These are useful, but the first release should focus on the reports most likely to be printed, saved, and shared for monthly management review.
- Business-area reporting has known limitations because invoice income is not yet reliably mapped to business areas.
- Cash movement is useful but should not be confused with full bank or cash reconciliation.

## 3. Report Routes

Recommended management-only route:

```text
/cashbook/reports
```

Recommended future PDF route pattern:

```text
/cashbook/reports/monthly-financial-summary/pdf
/cashbook/reports/income-vs-expenses/pdf
/cashbook/reports/profit-loss/pdf
/cashbook/reports/outstanding-invoices/pdf
/cashbook/reports/target-achievement/pdf
```

Routes should accept safe query parameters such as:

- `month=YYYY-MM`
- `year=YYYY`
- `reportType=monthly_financial_summary`

Cashbook tabs should become:

- Daily Income
- Expenses
- Targets
- Performance
- Reports

Visible only to:

- Super Admin
- Admin

Blocked:

- Teacher
- Parent

Teachers and Parents must have:

- no navigation access
- no route access
- no data access

## 4. Filters

MVP filters:

- Month
- Year
- Report type

Deferred filters:

- Quarter
- Custom date range
- Business area
- Payment method

### Date Handling

Use timezone-safe date strings.

Do:

- Use `YYYY-MM` for month selection.
- Convert selected month to `YYYY-MM-01` and the last day of that month using explicit year/month/day parts.
- Keep date boundaries as date-only strings.

Do not:

- Use `toISOString()` from local midnight.
- Compare a `YYYY-MM` string directly to a database date field.
- Let browser timezone conversion shift the selected month.

## 5. Financial Formulas

Financial reports must use the approved Phase 14A formula rules.

### Total Income

```text
Invoice Payments Received
+
Recorded Cashbook Income
=
Total Income
```

Rules:

- Count each payment once.
- Count `payments.amount`, not invoice totals.
- Count recorded `cashbook_income_entries.amount`.
- Do not count payment allocations as additional income.
- Payment allocations affect invoice balance only.

### Net Profit

```text
Total Income
-
Recorded Expenses
=
Net Profit
```

### Outstanding Invoices

Outstanding invoices must be shown separately.

Rules:

- Outstanding invoices are not received income.
- Include issued and partially paid invoices with remaining balance.
- Exclude draft, cancelled, archived and deleted invoices.

### Exclusions

All reports must exclude:

- deleted records
- archived records
- void records
- cancelled records
- reversed records where applicable

## 6. Data Sources

### Existing Views Usable As-Is

The following Phase 14A.1 reporting views should be reused where possible:

- `cashbook_daily_summary_view`
- `cashbook_monthly_summary_view`
- `cashbook_target_progress_view`
- `cashbook_income_by_business_area_view`
- `cashbook_expenses_by_category_view`
- `cashbook_payment_method_summary_view`
- `cashbook_business_area_profit_view`

These views already follow management-only reporting patterns and should remain the preferred source for cashbook summaries.

### Existing Tables Needed for Detail

Some reports require detail queries from existing tables:

- `invoices`
- `invoice_items`
- `payments`
- `payment_allocations`
- `students`
- `parents`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `business_areas`
- `cashbook_income_categories`
- `cashbook_expense_categories`

### Sources Usable With Service-Layer Queries

These should be handled in the service layer:

- largest outstanding invoices
- invoice remaining balances
- payment method subtotals for a selected month
- previous-month comparisons
- active student count
- salary total
- largest expense category

### New SQL View Need

No new SQL view is required for the planning step.

For MVP implementation, prefer service-layer composition using current views and tables.

Add new reporting views only if:

- service queries become slow
- multiple reports duplicate the same complex calculation
- a view can safely enforce management-only access

## 7. Monthly Financial Summary Layout

The Monthly Financial Summary should be the main premium report.

Format:

- A4 portrait
- multi-page capable
- printable
- management-only
- Premium Boutique Dashboard v3 styling
- generated with existing Phase 13 PDF engine

### Header

Include:

- Little London Play & Learn branding
- `Financial Report`
- report month
- generated date
- `Confidential Management Report`

### Executive Summary

Include:

- Invoice payments received
- Cashbook income
- Total income
- Total expenses
- Net profit
- Profit margin
- Outstanding invoices
- Active students where useful

### Income Analysis

Include:

- Invoice income
- Cashbook income
- Income by business area
- Income by payment method
- Comparison with previous month

Important:

Invoice income that cannot be reliably mapped must remain:

```text
Invoice Income / Unassigned
```

### Expense Analysis

Include:

- Total expenses
- Expenses by category
- Salary total
- Largest expense category
- Payment method breakdown
- Comparison with previous month

### Target Performance

Include:

- Revenue target
- Profit target
- Expense budget
- Active student target
- Actual vs target
- Percentage achieved
- Status

Missing targets should show `Not set`, not `On Track`.

### Outstanding Invoices

Include:

- total outstanding balance
- invoice count
- oldest invoice age
- optional short list of largest outstanding invoices

### Business Area Performance

Include:

- area
- income
- expenses
- profit
- profit margin

Add a clear note when invoice income remains unassigned.

### Footer

Include:

- Little London Play & Learn
- reporting period
- page number
- `Confidential Management Report`

## 8. Other Report Layouts

### Income vs Expenses Report

Purpose:

- Show received income and expenses for the selected month.

Sections:

- summary cards
- income sources
- expense categories
- daily or weekly trend
- previous month comparison

MVP:

- Include PDF generation.

### Profit and Loss Summary

Purpose:

- Provide a simple management P&L, not a formal accounting statement.

Sections:

- invoice payments received
- cashbook income
- total income
- expenses by category
- salary total
- net profit
- profit margin

MVP:

- Include PDF generation.

### Outstanding Invoices Report

Purpose:

- Help management follow up on unpaid or partially paid invoices.

Sections:

- total outstanding balance
- invoice count
- oldest invoice age
- invoice list
- parent/student details
- due date
- balance due
- status

MVP:

- Include PDF generation.

### Target Achievement Report

Purpose:

- Show monthly target progress for revenue, profit, expense budget and active students.

Sections:

- target cards
- actual values
- remaining values
- percentage achieved
- projected month-end value
- status

MVP:

- Include PDF generation using `cashbook_target_progress_view`.

### Cash Movement Report

Deferred.

Purpose:

- Show cash received, cash expenses and net cash movement.

Reason for deferral:

- This should not be confused with full reconciliation or bank balance.

### Business Area Performance Report

Deferred.

Purpose:

- Show income, expenses and profit by business area.

Reason for deferral:

- Invoice income is currently not reliably mapped to business areas.

### Payment Method Summary

Deferred.

Purpose:

- Show cash, bank transfer and cheque movement.

Reason for deferral:

- Useful for management, but less urgent than monthly summary and outstanding invoices.

## 9. PDF Engine Reuse

Financial Reports should reuse the Phase 13 Business Documents PDF foundation.

Existing reusable pieces:

- `SimplePdfDocument`
- `addBusinessDocumentHeader`
- `addBusinessDocumentFooter`
- `ensureDocumentSpace`
- `drawSectionTitle`
- `drawStatusBadge`
- `drawSummaryCard`
- `drawTableHeader`
- shared PDF theme colours
- shared PDF route response helper

Do not create a new PDF engine.

Financial reports may need additional shared helpers later:

- report metric cards
- multi-page table rendering
- repeated table headers
- report section dividers
- positive/negative money formatting
- percentage comparison formatting

These should extend the existing Business Documents helpers rather than replacing them.

## 10. Services / Components

### Service Functions

Recommended service functions:

- `canViewFinancialReports(profile)`
- `getMonthlyFinancialReportData(profile, month)`
- `getIncomeExpenseReportData(profile, month)`
- `getProfitLossReportData(profile, month)`
- `getOutstandingInvoiceReportData(profile, month)`
- `getTargetAchievementReportData(profile, month)`
- `generateMonthlyFinancialReportPdf(data)`

All financial calculations must remain server-side.

### Components

Recommended UI components:

- `FinancialReportTypeCards`
- `FinancialReportFilters`
- `FinancialReportGeneratePanel`
- `FinancialReportPreviewActions`
- `FinancialReportEmptyState`
- `FinancialReportRecentPlaceholder`

### PDF Templates

Recommended PDF files:

- `services/financial-reports/monthly-financial-summary-pdf.ts`
- `services/financial-reports/income-expenses-report-pdf.ts`
- `services/financial-reports/profit-loss-report-pdf.ts`
- `services/financial-reports/outstanding-invoices-report-pdf.ts`
- `services/financial-reports/target-achievement-report-pdf.ts`

These templates should reuse Phase 13 PDF layout helpers.

## 11. Security

Financial Reports are management-only.

Allowed:

- Super Admin
- Admin

Blocked:

- Teacher
- Parent

Use:

- `business_performance.view.all`
- existing Cashbook reporting permission helpers

Every route and service must verify access before loading data.

Reports may contain:

- salaries
- expenses
- profit
- outstanding invoices
- business performance data

These must never be visible to Teachers or Parents.

Security rules:

- no public URLs
- no broad authenticated report access
- no Parent Portal access
- no Teacher access
- no report data in client components before server-side permission checks
- no stored PDF snapshots in MVP
- no email or WhatsApp sending

## 12. Page-Break Rules

PDF reports should support multi-page output.

Rules:

- A4 portrait.
- Repeat table headers on new pages where required.
- Keep executive summary cards together.
- Keep totals blocks together.
- Avoid splitting a single table row across pages.
- Avoid orphan section headings at the bottom of a page.
- Show footer and page number on each page.
- Use black-and-white readable borders and typography.
- Keep long parent, student, invoice and category names wrapped safely.

Tables that may need multi-page support:

- outstanding invoices
- income by business area
- expenses by category
- invoice/payment lists

## 13. Accuracy Checks

Each implementation review must verify:

### Income Formula

```text
Total income = payments.amount + recorded cashbook income
```

Checks:

- payments counted once
- no invoice total counted as income
- no payment allocation double-counting

### Expense Exclusions

Checks:

- only recorded expenses included
- void expenses excluded
- archived/deleted expenses excluded

### Outstanding Invoices

Checks:

- draft invoices excluded
- cancelled invoices excluded
- deleted/archived invoices excluded
- issued and partially paid invoices included
- balance uses allocations/payments correctly

### Previous Month Comparisons

Checks:

- previous month boundaries are correct
- zero previous value does not show infinite growth
- negative profit is labelled clearly

### No-Data Months

Checks:

- report can generate with zero income and zero expenses
- missing targets show `Not set`
- empty tables show calm empty states

### Historical Payment Methods

Checks:

- cash, bank transfer and cheque shown clearly
- unknown or old values grouped as `Other` if they exist

### Unassigned Business Areas

Checks:

- invoice income remains `Invoice Income / Unassigned`
- no unreliable business-area inference from descriptions

## 14. View / Data Gaps

### Usable Without New SQL

The following can be delivered from existing views and service-layer queries:

- Monthly Financial Summary
- Income vs Expenses
- Profit and Loss
- Outstanding Invoices
- Target Achievement

### Potential Future View Gaps

New views may be helpful later for:

- monthly outstanding invoice aging
- report-ready payment method summaries
- report-ready business-area performance across custom periods
- long-term trend rollups
- stored report history

No SQL should be created during planning.

## 15. Safe Implementation Order

### Phase 14A.6.1 - Financial Reports UI Shell

Build:

- `/cashbook/reports`
- report type cards
- month/year filters
- generate actions
- recent report placeholder

Do not generate PDFs yet unless the route shell is approved.

### Phase 14A.6.2 - Monthly Financial Summary PDF

Build:

- report data service
- PDF template
- preview/download/print routes
- accuracy tests through manual review checklist

### Phase 14A.6.3 - MVP Supporting Reports

Build:

- Income vs Expenses Report
- Profit and Loss Summary
- Outstanding Invoices Report
- Target Achievement Report

### Phase 14A.6.4 - Review and Polish

Verify:

- calculations
- PDF layout
- page breaks
- management-only access
- no data leaks

### Later

Build deferred reports:

- Cash Movement
- Business Area Performance
- Payment Method Summary

## 16. Risks

### Double-Counting Income

Risk:

- Counting invoice totals or payment allocations as income.

Mitigation:

- Count `payments.amount` once.
- Use payment allocations only for invoice balances.

### Business-Area Misclassification

Risk:

- Invoice income is assigned to the wrong area.

Mitigation:

- Keep invoice income as `Invoice Income / Unassigned`.

### Sensitive Data Exposure

Risk:

- Salary, profit or outstanding invoice details visible to Teacher/Parent.

Mitigation:

- Management-only routes and services.
- Reuse existing reporting permission helpers.

### PDF Overflow

Risk:

- Long tables or names overflow in print.

Mitigation:

- Add page-break helpers.
- Wrap long text.
- Repeat table headers.

### Zero Previous Values

Risk:

- Infinite or misleading percentage comparisons.

Mitigation:

- Show neutral labels such as `No previous period`.

### Scope Creep

Risk:

- Financial Reports become accounting exports or tax reports.

Mitigation:

- Keep MVP focused on management review and printable summaries.

## 17. Success Criteria

Phase 14A.6 is successful when:

- `/cashbook/reports` is management-only.
- Teachers and Parents cannot access reports.
- Monthly Financial Summary can be generated as a premium A4 PDF.
- Income vs Expenses can be generated from approved data.
- Profit and Loss Summary can be generated from approved data.
- Outstanding Invoices Report can be generated from approved data.
- Target Achievement Report can be generated from approved data.
- Total income uses received money only.
- Payment allocations are not double-counted.
- Expenses exclude voided, archived and deleted records.
- Outstanding invoices are shown separately.
- Missing targets and no-data months are handled gracefully.
- PDFs follow Premium Boutique Dashboard v3.
- PDF page breaks work cleanly.
- Lint, type-check and build pass.

## 18. Deferred Items

Deferred from Phase 14A.6:

- Quarterly/yearly Business Planning module
- advanced analytics
- AI insights
- payroll
- VAT/tax reporting
- bank reconciliation
- accounting exports
- stored PDF snapshots
- report scheduling
- email delivery
- WhatsApp delivery
- Parent access
- Teacher access
- full cash reconciliation
- custom date range reporting
- Cash Movement Report
- Business Area Performance Report
- Payment Method Summary

