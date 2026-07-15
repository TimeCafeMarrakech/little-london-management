# Phase 14A.5 Completion Report

## Summary

Phase 14A.5 Business Performance Dashboard has been implemented as a management-only Cashbook dashboard at `/cashbook/performance`.

The dashboard gives Super Admin and Admin users a Premium Boutique Dashboard v3 view of received income, cashbook income, expenses, net profit, monthly targets, payment methods, business-area performance, student KPIs, cash movement, and deterministic management insights.

No database schema, migrations, invoice/payment workflows, Daily Income workflows, Daily Expenses workflows, Monthly Target workflows, authentication, RBAC model, or business document workflows were changed.

## Files Created

- `app/(dashboard)/cashbook/performance/page.tsx`
- `components/cashbook/cashbook-performance-period-selector.tsx`
- `components/cashbook/cashbook-performance-summary-cards.tsx`
- `components/cashbook/cashbook-performance-targets.tsx`
- `components/cashbook/cashbook-performance-trend-card.tsx`
- `components/cashbook/cashbook-business-area-performance.tsx`
- `components/cashbook/cashbook-expense-category-analysis.tsx`
- `components/cashbook/cashbook-payment-method-breakdown.tsx`
- `components/cashbook/cashbook-cash-movement.tsx`
- `components/cashbook/cashbook-student-kpis.tsx`
- `components/cashbook/cashbook-management-insights.tsx`
- `docs/PHASE_14A5_COMPLETION_REPORT.md`

## Files Modified

- `components/cashbook/cashbook-tabs.tsx`
- `features/cashbook/schemas.ts`
- `features/cashbook/types.ts`
- `services/cashbook/cashbook-service.ts`

## Route

- `/cashbook/performance`

The route is dynamic and server-rendered. It uses server-side profile loading and permission checks before loading performance data.

## Permissions Used

The page and service use:

- `business_performance.view.all`

Allowed:

- Super Admin
- Admin

Blocked:

- Teacher
- Parent

Teachers and Parents receive no navigation access through the existing Cashbook management navigation and are blocked server-side if they try to access the route directly.

## Data Sources

The implementation reuses existing Phase 14A.1 tables and reporting views:

- `cashbook_daily_summary_view`
- `cashbook_monthly_summary_view`
- `cashbook_target_progress_view`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `business_areas`
- `cashbook_expense_categories`
- `payments`
- `invoices`
- `payment_allocations`
- `students`

No new migration was required.

## Financial Formulas

Total Income:

```text
Invoice Payments Received + Recorded Cashbook Income
```

Net Profit:

```text
Total Income - Recorded Expenses
```

Profit Margin:

```text
Net Profit / Total Income * 100
```

Cash Movement:

```text
Cash invoice payments + Cashbook cash income - Cash expenses
```

Outstanding invoices are shown separately and are not counted as income.

## Period Handling

Supported periods:

- Today
- This Week
- This Month
- This Year

Period boundaries are generated using local date components instead of `toISOString()` to avoid timezone shifting.

Comparison periods:

- Today vs yesterday
- This Week vs previous week
- This Month vs previous month
- This Year vs previous year

If the previous period is zero, the dashboard shows a neutral comparison instead of an infinite percentage.

## Target Integration

The dashboard reuses `cashbook_target_progress_view` for:

- Revenue
- Profit
- Expense Budget
- Active Students

The Today’s Business Goal card uses the current-month Revenue target and labels the run-rate metric as:

```text
Average required per remaining day
```

Target calculations are not recalculated in React.

## Business-Area Limitations

Cashbook income and tagged cashbook expenses are mapped by `business_area_id`.

Invoice payments remain grouped as:

```text
Invoice Income / Unassigned
```

This avoids unreliable inference from invoice descriptions or loose labels. Reliable invoice-to-business-area mapping remains deferred.

Unassigned expenses remain grouped as:

```text
Unassigned Expenses
```

## Payment-Method Handling

The dashboard shows:

- Cash
- Bank Transfer
- Cheque
- Other, when historical payment methods exist

For each method it shows:

- Invoice payment income
- Cashbook income
- Expense outflow
- Net movement

The implementation does not silently omit `card` or other historical payment methods; they are grouped as `Other`.

## Student KPI Limitations

The dashboard shows:

- Current active students
- New active students this month

Archived or inactivated student counts are documented as deferred because the current model does not yet expose a dedicated status-change reporting view for reliable monthly movement.

## Outstanding Invoice Summary

Outstanding invoices are calculated from issued and partially paid invoices only.

The summary excludes:

- Draft invoices
- Cancelled invoices
- Deleted invoices

Payment allocations are used only to calculate remaining balances and are not counted as additional income.

## Manager's Insights

The Manager’s Insights panel is deterministic. It uses approved data only and does not call AI or external services.

Insights include:

- Best-performing business area
- Largest expense category
- Income movement
- Profit movement
- Revenue run-rate
- Profit projection
- Outstanding invoice warning

## Security Confirmation

The Business Performance service checks `business_performance.view.all` before reading data.

No Teacher or Parent access was added.

No auth, RBAC, database, migration, route permission model, invoice/payment workflow, receipt workflow, or business document workflow was changed.

## Known Limitations

- Monthly PDF performance report generation is reserved for Phase 14A.7.
- Cash Movement is not labelled as Cash Available because opening cash and reconciliation are not implemented in this phase.
- Invoice payments are not allocated to business areas until a reliable mapping exists.
- Archived/inactivated student movement is deferred pending a reliable status-change reporting view.
- Working-day calendar configuration and advanced forecasting are deferred.

## Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run lint` | Passed |
| `npm.cmd run type-check` | Passed |
| `npm.cmd run build` | Passed |

Note: the first build attempt compiled successfully but timed out while finalizing build traces. It was rerun with a longer timeout and completed successfully.
