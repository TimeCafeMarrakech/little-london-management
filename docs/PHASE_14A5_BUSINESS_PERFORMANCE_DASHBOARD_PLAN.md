# Phase 14A.5 Business Performance Dashboard Plan

## 1. Purpose

Phase 14A.5 will add a management-only Business Performance Dashboard for Little London.

The dashboard should give Super Admin and Admin users a calm, premium overview of real business performance:

- Actual money received
- Cashbook income
- Expenses
- Net profit
- Outstanding invoices
- Monthly target progress
- Business-area performance
- Payment method movement
- Practical management insights

This phase must not become a full accounting system. It should remain a clear operational dashboard for day-to-day and month-to-month decisions.

## 2. Current Data Sources

The approved Phase 14A.1 foundation already provides the core database tables and reporting views.

### Operational Tables

- `payments`
- `invoices`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `business_areas`
- `cashbook_income_categories`
- `cashbook_expense_categories`
- `monthly_business_targets`

### Existing Reporting Views

- `cashbook_daily_summary_view`
- `cashbook_monthly_summary_view`
- `cashbook_income_by_business_area_view`
- `cashbook_expenses_by_category_view`
- `cashbook_target_progress_view`
- `cashbook_payment_method_summary_view`
- `cashbook_business_area_profit_view`

These views are management-only and follow the existing security pattern using permission checks inside the view definitions.

## 3. Financial Calculation Rules

### Total Income

Total Income must be calculated from received money only:

```text
Invoice Payments Received
+
Recorded Cashbook Income
=
Total Income
```

Rules:

- Count `payments.amount` once.
- Count recorded `cashbook_income_entries.amount`.
- Do not count invoice totals as income.
- Do not count unpaid invoices.
- Do not count payment allocations as extra income.
- Payment allocations affect invoice balances only.
- Exclude deleted, archived, void, cancelled, or reversed records where applicable.

### Expenses

Expenses come from recorded `cashbook_expense_entries`.

Rules:

- Include only `status = recorded`.
- Exclude deleted, archived, and void records.
- Salary records remain management-only expense records.

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

- Outstanding invoices are not income.
- Outstanding total should include issued and partially paid invoices with remaining balance.
- Draft, cancelled, archived, and deleted invoices should be excluded.

### Profit Margin

```text
Net Profit / Total Income * 100
```

If total income is zero, profit margin should display as neutral rather than dividing by zero.

## 4. Dashboard Sections

The `/cashbook/performance` page should contain:

1. Header and period selector
2. Executive summary cards
3. Monthly target progress
4. Income vs Expenses trend
5. Business area performance
6. Expense category analysis
7. Payment method breakdown
8. Management insights
9. Recent activity or supporting detail links

The layout should follow Premium Boutique Dashboard v3:

- warm cream surfaces
- navy headings
- coral actions
- sage success states
- warm yellow caution states
- soft cards
- spacious but not sparse dashboard layout

## 5. Period / Filter Rules

Supported periods:

- Today
- This Week
- This Month
- This Year

Optional later:

- Previous Month comparison
- Custom date range

Custom ranges should remain deferred unless the service layer can support them safely without ambiguous month-based reporting.

### Date Boundaries

All boundaries should be generated using timezone-safe date strings, not `toISOString()` from local midnight.

Recommended helpers:

- Today: local `YYYY-MM-DD`
- Week start: Monday local date
- Week end: Sunday local date
- Month start: `YYYY-MM-01`
- Month end: calculated in local date components
- Year start: `YYYY-01-01`
- Year end: `YYYY-12-31`

Implementation should avoid timezone conversion shifting the selected period.

### Comparison Periods

For each period, comparison should use the previous comparable period:

- Today compares to yesterday.
- This Week compares to the previous week.
- This Month compares to the previous month.
- This Year compares to the previous year.

If previous value is zero:

- show neutral text such as `No previous period`
- do not show misleading infinite percentage changes

## 6. Target Integration

Reuse the existing `cashbook_target_progress_view`.

Do not duplicate target calculations in React if the database view already provides:

- target value
- current value
- remaining value
- percentage achieved
- days remaining
- projected month-end value
- average required per remaining day
- status

Current-month targets to display:

- Revenue
- Profit
- Expense Budget
- Active Students

Status labels:

- Achieved
- On Track
- Needs Attention
- At Risk

Expense Budget must use inverted visual logic:

- lower spending is good
- near budget is warning
- over budget is danger

The dashboard should show text labels, not colour alone.

## 7. Business-Area Mapping Rules

Business areas:

- English Classes
- Play & Learn
- Workshops
- Holiday Camps
- Birthday Parties
- Theatre
- Other

### Cashbook Income

Cashbook income has `business_area_id` and can be mapped directly.

### Cashbook Expenses

Cashbook expenses may have `business_area_id`.

Rules:

- If an expense has a business area, include it in that area.
- If an expense has no business area, show it as `Unassigned Expenses`.
- Do not force unassigned expenses into a business area.

### Invoice Payment Income

Existing invoice payments do not yet have a guaranteed reliable business-area mapping.

Preferred approach for Phase 14A.5:

- Include invoice payments in total income.
- Show invoice payment income as `Invoice Income / Unassigned` in business-area analysis unless a reliable existing relationship is present.
- Do not infer business area from invoice text or loose labels.
- Do not invent inaccurate allocations.

Future mapping can be introduced when invoice items, courses, classes, events, or business areas have a reliable relationship.

### Business-Area Profit

Existing `cashbook_business_area_profit_view` can be reused for cashbook income and tagged expenses.

Important limitation:

- It does not currently allocate invoice payment income to business areas.
- This is acceptable if clearly labelled.

## 8. Payment-Method Rules

Required payment methods:

- Cash
- Bank Transfer
- Cheque

Show for each method:

- invoice payment income
- cashbook income
- expense outflow
- net movement

Formula:

```text
Net movement =
Invoice payment income
+
Cashbook income
-
Expense outflow
```

### Historical Other Methods

If historical payment methods exist outside Cash, Bank Transfer, and Cheque:

- include them in an `Other` category
- do not silently omit them
- include `Other` in reconciliation totals

Existing `cashbook_payment_method_summary_view` currently focuses on Cash, Bank Transfer, and Cheque for income. It should be reviewed before implementation to ensure `Other` methods and expense outflows are represented.

## 9. Required Services and Components

### Services

Add a management-only service layer, likely inside:

- `services/cashbook/cashbook-service.ts`

Recommended service functions:

- `canViewBusinessPerformance(profile)`
- `getBusinessPerformanceSummary(profile, period)`
- `getBusinessPerformanceTrends(profile, period)`
- `getBusinessPerformanceTargets(profile)`
- `getBusinessAreaPerformance(profile, period)`
- `getPaymentMethodBreakdown(profile, period)`
- `getExpenseCategoryAnalysis(profile, period)`
- `getBusinessPerformanceInsights(profile, period)`

### Components

Recommended components:

- `cashbook-performance-period-selector.tsx`
- `cashbook-performance-summary-cards.tsx`
- `cashbook-performance-targets.tsx`
- `cashbook-performance-trend-card.tsx`
- `cashbook-business-area-performance.tsx`
- `cashbook-expense-category-analysis.tsx`
- `cashbook-payment-method-breakdown.tsx`
- `cashbook-management-insights.tsx`
- `cashbook-performance-empty-state.tsx`
- `cashbook-performance-error-state.tsx`

Reuse existing Cashbook cards, filters, badges, and Premium Dashboard v3 styling.

## 10. Required Routes

Create:

- `/cashbook/performance`

Extend Cashbook tabs:

- Daily Income
- Expenses
- Targets
- Performance

The existing sidebar remains flat:

- Cashbook

No nested Finance navigation is required.

## 11. Permissions and RLS

Allowed:

- Super Admin
- Admin

Not allowed:

- Teacher
- Parent

Required permission:

- `business_performance.view.all`

Recommended helper:

- `canViewBusinessPerformance(profile)`

Server-side checks must be applied in:

- page route
- service/data loader

The implementation should reuse the existing reporting view permission pattern:

- `can_view_cashbook_reports()`
- management-only RLS
- no broad authenticated data exposure

Salary and staff-sensitive expense information must remain management-only.

## 12. Existing Views to Reuse

### `cashbook_daily_summary_view`

Reuse for:

- daily invoice payments
- daily cashbook income
- daily total income
- daily expenses
- daily net profit
- trend charts for Today/This Week views

### `cashbook_monthly_summary_view`

Reuse for:

- monthly totals
- yearly month-by-month charts
- previous month comparisons

### `cashbook_income_by_business_area_view`

Reuse for:

- cashbook income by business area

Limitation:

- excludes invoice payment income.

### `cashbook_expenses_by_category_view`

Reuse for:

- expense category analysis
- largest expense category insight

### `cashbook_target_progress_view`

Reuse for:

- current-month target cards
- target progress section
- required per day
- projected month-end values

### `cashbook_business_area_profit_view`

Reuse for:

- cashbook business-area income
- business-area expenses
- business-area net profit

Limitation:

- does not include invoice payment income unless it can be mapped later.

### `cashbook_payment_method_summary_view`

Partially reuse for:

- invoice payment income by method
- cashbook income by method

Needs review before implementation:

- expense outflows by method are not included in the current summary.
- methods outside Cash, Bank Transfer, and Cheque may need an `Other` bucket.

## 13. View Gaps or Required Later Fixes

Do not modify views in this planning step.

Likely follow-up view/service gaps:

1. Outstanding invoice summary
   - Existing finance services may already calculate balances.
   - If not, add a management-only query or view later.

2. Payment method net movement
   - Existing view does not include expense outflow.
   - Add service-layer expense query or a follow-up view.

3. Other payment method bucket
   - Existing payment method view filters invoice payment methods to Cash, Bank Transfer, and Cheque.
   - Historical methods should be grouped under `Other` if they exist.

4. Business-area invoice payment mapping
   - Defer until reliable relationships exist.
   - Do not approximate from invoice descriptions.

5. Current period summaries beyond monthly views
   - Daily view supports dates.
   - Service layer can aggregate daily rows for week/month/year periods.
   - A new period summary view is optional, not required at first.

## 14. UI / UX Design

The dashboard should feel like Premium Boutique Dashboard v3, not an accounting ledger.

### Header

Title:

`Business Performance`

Subtitle:

`A calm view of income, expenses, profit, targets, and business activity.`

Controls:

- Period selector: Today, This Week, This Month, This Year
- Optional secondary link to Targets

### Executive Summary Cards

Cards:

- Invoice Payments Received
- Cashbook Income
- Total Income
- Expenses
- Net Profit
- Outstanding Invoices
- Profit Margin

Each card should show:

- current value
- difference from previous comparable period
- percentage change where valid
- neutral state where previous value is zero

### Monthly Targets

Use cards similar to Phase 14A.4:

- Revenue
- Profit
- Expense Budget
- Active Students

### Trend Charts

Charts:

- income trend
- expense trend
- net profit trend

Use navy, coral, sage, warm yellow, and cream.

Avoid dense tables as the primary view.

### Business Area Performance

Use scannable cards or a clean table.

Fields:

- income
- expenses
- profit
- profit margin
- percentage of total income
- target status if a business-area target exists

Invoice income should appear as `Invoice Income / Unassigned` unless reliably mapped.

### Expense Category Analysis

Show:

- largest expense category
- category totals
- share of total expenses

### Payment Method Breakdown

Show:

- Cash
- Bank Transfer
- Cheque
- Other if present

Fields:

- invoice payment income
- cashbook income
- expense outflow
- net movement

### Management Insights

Derived insights:

- best-performing business area
- largest expense category
- revenue change from previous month
- profit change from previous month
- amount required per remaining day
- projected month-end revenue
- projected month-end profit

Each insight must state what it is based on.

## 15. Responsive Behaviour

Desktop:

- multi-column dashboard
- summary cards in a responsive grid
- charts side-by-side where space allows

Tablet:

- two-column card layout
- charts stack when needed

Mobile:

- single-column layout
- horizontal scrolling only for optional supporting tables
- period selector should remain easy to tap
- charts should stack cleanly

No horizontal page overflow.

## 16. Risks

1. Double-counting income
   - Avoid by counting `payments.amount` once and not counting allocations.

2. Misleading business-area allocation
   - Avoid by showing invoice income as unassigned unless reliably mapped.

3. Payment method omissions
   - Avoid by adding an `Other` bucket for unsupported historical methods.

4. Timezone period drift
   - Avoid `toISOString()` for local period starts.

5. Staff-sensitive salary expenses
   - Keep route and data management-only.

6. Overly dense UI
   - Keep the page visual, guided, and dashboard-first.

## 17. Safe Implementation Order

1. Add server-side permission helper for Business Performance.
2. Add period utility helpers with timezone-safe date boundaries.
3. Build service functions using existing views.
4. Add `/cashbook/performance` route with server-side protection.
5. Extend Cashbook tabs with Performance.
6. Add executive summary cards.
7. Add current-month target progress.
8. Add trend charts from daily/monthly summary views.
9. Add business-area performance section with clear unassigned invoice income handling.
10. Add expense category analysis.
11. Add payment method breakdown.
12. Add management insights.
13. Validate lint, type-check, build.
14. Create completion report.

## 18. Success Criteria

Phase 14A.5 is successful when:

- `/cashbook/performance` is available only to Super Admin/Admin.
- Teacher and Parent users cannot access the route or data.
- Total income equals invoice payments received plus recorded cashbook income.
- Invoice totals are not counted as income.
- Payment allocations are not double-counted.
- Expenses exclude voided, archived, and deleted records.
- Net profit equals total income minus expenses.
- Outstanding invoices are shown separately.
- Monthly target progress reuses `cashbook_target_progress_view`.
- Business-area performance clearly labels unassigned invoice income.
- Payment method breakdown includes Cash, Bank Transfer, Cheque, and Other if present.
- UI follows Premium Boutique Dashboard v3.
- Lint, type-check, and build pass.

## 19. What Is Deferred

Deferred items:

- Monthly/Quarterly/Yearly Business Goals redesign
- PDF performance reports
- Daily reconciliation workflow
- Payroll
- Payslips
- Supplier management
- Receipt attachments
- Bank reconciliation
- VAT/tax handling
- Accounting exports
- Parent Portal visibility
- Teacher visibility
- Advanced forecasting beyond simple run-rate projection
- Reliable invoice-to-business-area mapping unless existing relationships are formalized
