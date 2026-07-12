# Phase 14A Cashbook & Business Performance Plan

## 1. Purpose

Phase 14A introduces a practical Cashbook and Business Performance module for Little London.

The goal is to give management a clear daily and monthly view of real money received, expenses paid, profit, and targets without turning the system into a full accounting platform.

The module must answer:

- How much money came in today?
- How much came from invoice payments?
- How much came from non-invoice daily income?
- How much was spent today?
- What is today's profit?
- Are we on track for this month's revenue and profit targets?
- Which business areas are performing best?
- Which expense categories need attention?

This module should follow the existing Premium Boutique Dashboard v3 design language and reuse the existing Finance, Payments, Reports, and Dashboard patterns where possible.

---

## 2. Business Context

Little London receives money through two main channels:

1. Invoice payments already managed by the Finance module.
2. Daily income that may not require a formal invoice.

Examples of daily income:

- Play & Learn hourly childcare
- Drop-in sessions
- Workshops
- Holiday camps
- Birthday parties
- Merchandise
- Snacks
- Other small income

The system must calculate income based on money actually received, not invoice totals.

Monthly income formula:

```text
Invoice payments received
+
Daily cashbook income
=
Total monthly income
```

Profit formula:

```text
Total income
-
Expenses
=
Net profit
```

---

## 3. Scope

Phase 14A should include:

- Daily income entries without invoice linkage.
- Expense entries.
- Salary records as an expense category.
- Business areas.
- Monthly performance targets.
- Cashbook dashboard widgets.
- Management reporting views.
- Admin/Super Admin-only management access.

Phase 14A should not include:

- Full accounting ledger.
- Double-entry bookkeeping.
- VAT/tax filing.
- Bank reconciliation.
- Payroll calculations.
- Payslip generation.
- Supplier management module.
- Receipt attachment upload.
- Parent Portal access.
- Teacher access.
- Export automation.

---

## 4. Daily Income Without Invoice

Daily income entries record received money that does not originate from an invoice.

Examples:

- Play & Learn hourly childcare
- Drop-in sessions
- Workshops
- Camps
- Birthday parties
- Merchandise
- Snacks
- Other income

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Date | date | yes | Date money was received |
| Amount | numeric | yes | Must be greater than 0 |
| Category | text or FK | yes | Income category |
| Business area | FK | yes | Example: Play & Learn, Workshops |
| Payment method | text | yes | Cash, Bank Transfer, Cheque |
| Parent/customer | FK nullable | no | Optional parent link |
| Student | FK nullable | no | Optional student link |
| Description | text | yes | Short operational description |
| Notes | text nullable | no | Internal management notes |
| Recorded by | FK | yes | Current user profile |

Important rules:

- Daily income must not duplicate invoice payments.
- If an invoice exists, payment should be recorded through the existing Payments module.
- Parent and student links are optional because not all daily income is family-specific.
- Business area is required for performance reporting.

---

## 5. Expenses

Expenses record operational costs paid by Little London.

Examples:

- Salaries
- Rent
- Utilities
- Internet
- Cleaning
- Teaching materials
- Arts and crafts
- Marketing
- Repairs
- Equipment
- Other expenses

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Date | date | yes | Date expense was paid or recorded |
| Amount | numeric | yes | Must be greater than 0 |
| Category | text or FK | yes | Expense category |
| Supplier/staff member | text nullable | no | Free text for MVP |
| Payment method | text | yes | Cash, Bank Transfer, Cheque |
| Description | text | yes | Short operational description |
| Notes | text nullable | no | Internal management notes |
| Recorded by | FK | yes | Current user profile |

Important rules:

- Expenses reduce profit when recorded as paid.
- Receipt attachment is deferred.
- Salary payments should be supported as a category but not as a payroll system.

---

## 6. Salary Records

Phase 14A should treat salary payments as expense entries.

Recommended MVP approach:

- Expense category: `Salaries`
- Supplier/staff member: teacher/staff name as free text or optional future FK
- Payment method: Cash, Bank Transfer, Cheque
- Description: salary month or period
- Notes: optional management-only notes

Future payroll support may add:

- Staff contracts
- Salary schedules
- Bonuses
- Deductions
- Payslips
- Approval workflows
- Payroll reports

Those are deferred.

---

## 7. Business Areas

Business areas group revenue and performance by activity type.

Recommended initial areas:

- English Classes
- Play & Learn
- Workshops
- Holiday Camps
- Birthday Parties
- Theatre
- Other

Usage:

- Daily income must select a business area.
- Invoice payments may infer business area from invoice items, class/course data, or use `Unassigned` until deeper mapping exists.
- Event-related daily income can map to Workshops, Holiday Camps, Birthday Parties, Theatre, or Other.

Future enhancement:

- Link invoice items to business areas.
- Link courses/classes/events directly to business areas.
- Add business area targets.

---

## 8. Total Income Calculations

Total income must be calculated from received payments only.

Sources:

1. Existing `payments.amount`
2. New daily income entries

Formula:

```text
Total income = sum(payments.amount) + sum(cashbook_income.amount)
```

Rules:

- Do not count invoice totals as income until payment is received.
- Do not count unpaid invoices.
- Do not count deleted/archived payment records.
- Do not count cancelled/reversed cashbook entries.
- Count each payment once, even when allocated to multiple invoices.
- Payment allocations affect invoice balances, not total income.

Supported payment methods:

- Cash
- Bank Transfer
- Cheque

---

## 9. Profit Calculations

Profit should be calculated from actual income and actual expenses.

Formula:

```text
Net profit = total income - total expenses
```

Required summaries:

- Daily income, expenses, net profit
- Monthly income, expenses, net profit
- Yearly income, expenses, net profit

Recommended display:

- Today
- This week
- This month
- This year
- Custom date range later

---

## 10. Monthly Targets

Phase 14A should introduce configurable monthly performance targets.

Target types:

- Revenue
- Profit
- Expense budget
- Active students optional

Target fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Month | date/month | yes | Use first day of month |
| Target type | text | yes | revenue, profit, expense_budget, active_students |
| Target amount/value | numeric | yes | Money or count |
| Business area | FK nullable | no | Optional future business-area target |
| Status | text | yes | active, archived |
| Created by | FK | yes | Management user |

Dashboard target widget must show:

- Target
- Current result
- Remaining amount
- Percentage achieved
- Progress bar
- Days remaining
- Projected month-end result
- Status: On Track, Needs Attention, At Risk, Achieved

Target status rules:

- Achieved: current result >= target for revenue/profit/active students, or expenses <= budget at month end.
- On Track: projected month-end result meets target.
- Needs Attention: projected result is slightly below target or expense budget is trending high.
- At Risk: projected result is materially below target or expenses exceed expected pace.

Expense budget target should invert normal progress logic:

- Lower spending is good.
- Exceeding budget is bad.

---

## 11. Cashbook Dashboard

Dashboard widgets should show:

- Today's invoice payments
- Today's cashbook income
- Today's total income
- Today's expenses
- Today's profit
- Monthly totals
- Revenue target progress
- Profit target progress
- Income by business area
- Expenses by category

Recommended widget layout:

1. Cashbook hero summary
   - Today income
   - Today expenses
   - Today profit
   - Month-to-date income

2. KPI cards
   - Invoice payments today
   - Daily cashbook income today
   - Expenses today
   - Net profit today

3. Target progress cards
   - Revenue target
   - Profit target
   - Expense budget

4. Analytics panels
   - Income by business area
   - Expenses by category
   - Daily income trend
   - Monthly profit trend

5. Recent activity
   - Recent daily income entries
   - Recent expenses

UI should follow Premium Boutique Dashboard v3:

- Warm cream surfaces
- Navy headings
- Coral action accents
- Sage positive/profit states
- Warm yellow attention states
- Soft rounded cards
- Clear charts

---

## 12. Proposed Database Tables

No code or migrations are created in this planning step. The following tables are recommended for the implementation phase.

### 12.1 `business_areas`

Purpose: Defines revenue/business grouping areas.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `name text not null`
- `code text not null`
- `description text null`
- `status text not null default 'active'`
- `sort_order integer not null default 0`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz null`
- `created_by uuid null`
- `updated_by uuid null`
- `deleted_by uuid null`

Constraints:

- Unique active `(branch_id, code)` where not deleted.
- Check status in `active`, `inactive`, `archived`.

Relationships:

- One business area has many cashbook income entries.
- One business area may have many monthly targets.

### 12.2 `cashbook_income_categories`

Purpose: Defines daily income categories.

Seed examples:

- Play & Learn hourly childcare
- Drop-in session
- Workshop
- Holiday camp
- Birthday party
- Merchandise
- Snacks
- Other income

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `name text not null`
- `code text not null`
- `description text null`
- `status text not null default 'active'`
- common timestamps and soft delete columns

### 12.3 `cashbook_expense_categories`

Purpose: Defines expense categories.

Seed examples:

- Salaries
- Rent
- Utilities
- Internet
- Cleaning
- Teaching materials
- Arts and crafts
- Marketing
- Repairs
- Equipment
- Other expenses

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `name text not null`
- `code text not null`
- `description text null`
- `status text not null default 'active'`
- common timestamps and soft delete columns

### 12.4 `cashbook_income_entries`

Purpose: Records received non-invoice income.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `income_date date not null`
- `amount numeric(12,2) not null`
- `income_category_id uuid not null references cashbook_income_categories(id)`
- `business_area_id uuid not null references business_areas(id)`
- `payment_method text not null`
- `parent_id uuid null references parents(id)`
- `student_id uuid null references students(id)`
- `description text not null`
- `notes text null`
- `status text not null default 'recorded'`
- `recorded_by uuid not null references user_profiles(id)`
- common timestamps and soft delete columns

Constraints:

- `amount > 0`
- `payment_method in ('cash','bank_transfer','cheque')`
- `status in ('recorded','void','archived')`
- If both parent and student are provided, service logic should verify active parent-student relationship.

Indexes:

- `idx_cashbook_income_date`
- `idx_cashbook_income_business_area`
- `idx_cashbook_income_category`
- `idx_cashbook_income_payment_method`
- `idx_cashbook_income_parent_id`
- `idx_cashbook_income_student_id`
- `idx_cashbook_income_deleted_at`

### 12.5 `cashbook_expense_entries`

Purpose: Records paid expenses.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `expense_date date not null`
- `amount numeric(12,2) not null`
- `expense_category_id uuid not null references cashbook_expense_categories(id)`
- `supplier_or_staff_name text null`
- `payment_method text not null`
- `description text not null`
- `notes text null`
- `status text not null default 'recorded'`
- `recorded_by uuid not null references user_profiles(id)`
- common timestamps and soft delete columns

Constraints:

- `amount > 0`
- `payment_method in ('cash','bank_transfer','cheque')`
- `status in ('recorded','void','archived')`

Indexes:

- `idx_cashbook_expense_date`
- `idx_cashbook_expense_category`
- `idx_cashbook_expense_payment_method`
- `idx_cashbook_expense_deleted_at`

### 12.6 `monthly_business_targets`

Purpose: Stores configurable monthly targets.

Fields:

- `id uuid primary key default gen_random_uuid()`
- `branch_id uuid nullable/future required`
- `target_month date not null`
- `target_type text not null`
- `target_value numeric(12,2) not null`
- `business_area_id uuid null references business_areas(id)`
- `status text not null default 'active'`
- `notes text null`
- common timestamps and soft delete columns

Constraints:

- `target_month` should be first day of month.
- `target_type in ('revenue','profit','expense_budget','active_students')`
- `target_value >= 0`
- Unique active `(branch_id, target_month, target_type, business_area_id)` where not deleted.

---

## 13. Relationships

Recommended relationships:

- `business_areas` 1:many `cashbook_income_entries`
- `cashbook_income_categories` 1:many `cashbook_income_entries`
- `cashbook_expense_categories` 1:many `cashbook_expense_entries`
- `parents` 1:many optional `cashbook_income_entries`
- `students` 1:many optional `cashbook_income_entries`
- `user_profiles` 1:many income and expense entries through `recorded_by`
- `business_areas` 1:many optional `monthly_business_targets`

Existing payment relationship:

- `payments` remains the source for invoice payment income.
- `payment_allocations` remains invoice-balance logic only.

---

## 14. RBAC and Permissions

Recommended new permissions:

- `cashbook.view.all`
- `cashbook.create.all`
- `cashbook.edit.all`
- `cashbook.archive.all`
- `cashbook.restore.all`
- `cashbook.manage.all`
- `expenses.view.all`
- `expenses.create.all`
- `expenses.edit.all`
- `expenses.archive.all`
- `expenses.restore.all`
- `expenses.manage.all`
- `business_targets.view.all`
- `business_targets.manage.all`
- `business_performance.view.all`

Role access:

| Role | Access |
| --- | --- |
| Super Admin | Full access |
| Admin | Full operational access |
| Teacher | No access |
| Parent | No access |

Notes:

- Finance/cashbook data is management-only.
- Teachers must not see income, expenses, targets, or profit.
- Parents must not see cashbook or business performance dashboards.
- Future branch roles may include Accountant or Branch Manager.

---

## 15. RLS Strategy

RLS should be enabled on all new tables.

Policies:

- Super Admin: full access.
- Admin: full access in MVP, branch-scoped later.
- Teacher: no access.
- Parent: no access.

Recommended helper checks:

- `public.is_super_admin()`
- `public.has_permission('cashbook.manage.all')`
- `public.has_permission('expenses.manage.all')`
- `public.has_permission('business_targets.manage.all')`
- `public.has_permission('business_performance.view.all')`

View security:

- Reporting views must be management-only.
- Follow the Phase 12 report security pattern.
- Do not grant `authenticated` broad access to business performance views.

Sensitive fields:

- Expense notes and supplier/staff fields are management-only.
- Salary-related entries must never be visible to teachers or parents.

---

## 16. UI Pages Needed

Recommended routes:

- `/cashbook`
- `/cashbook/income/new`
- `/cashbook/income/[incomeEntryId]/edit`
- `/cashbook/expenses/new`
- `/cashbook/expenses/[expenseEntryId]/edit`
- `/cashbook/targets`
- `/cashbook/targets/new`
- `/cashbook/targets/[targetId]/edit`

Alternative MVP:

- Single `/cashbook` page with tabs:
  - Overview
  - Daily Income
  - Expenses
  - Targets

Recommended MVP route approach:

- Start with one management page `/cashbook`.
- Use modal or inline forms only if the existing app pattern supports it.
- Use dedicated `new/edit` pages if consistent with current finance modules.

Navigation:

- Add `Cashbook` under management navigation for Super Admin/Admin only.
- Do not show to Teacher or Parent.

---

## 17. Components Needed

Recommended components:

- `CashbookDashboardWidgets`
- `CashbookSummaryCards`
- `IncomeEntryForm`
- `ExpenseEntryForm`
- `MonthlyTargetForm`
- `IncomeEntryCard`
- `ExpenseEntryCard`
- `CashbookFilters`
- `TargetProgressCard`
- `IncomeByBusinessAreaChart`
- `ExpensesByCategoryChart`
- `DailyProfitTrendChart`
- `CashbookEmptyState`
- `CashbookErrorState`
- `CashbookLoadingState`

Shared patterns to reuse:

- Existing dashboard cards.
- Existing finance empty/error states where appropriate.
- Existing Premium Dashboard v3 chart styling.
- Existing permission-gated page pattern.

---

## 18. Validation Rules

Income validation:

- Date required.
- Amount required and greater than 0.
- Category required.
- Business area required.
- Payment method must be Cash, Bank Transfer, or Cheque.
- Description required.
- Parent optional.
- Student optional.
- If student is selected with parent, verify active relationship.
- Do not allow archived parents/students.

Expense validation:

- Date required.
- Amount required and greater than 0.
- Expense category required.
- Payment method must be Cash, Bank Transfer, or Cheque.
- Description required.
- Supplier/staff member optional.

Target validation:

- Month required.
- Target type required.
- Target value required and non-negative.
- Duplicate active targets should be prevented.
- Expense budget target can be 0 only intentionally.

Archive/void rules:

- Prefer status `void` for mistaken financial entries.
- Preserve original records for audit.
- Do not hard delete production financial entries.

---

## 19. Reporting Views

Recommended views:

### `cashbook_daily_summary_view`

Fields:

- `summary_date`
- `invoice_payment_total`
- `cashbook_income_total`
- `total_income`
- `expense_total`
- `net_profit`

### `cashbook_monthly_summary_view`

Fields:

- `summary_month`
- `invoice_payment_total`
- `cashbook_income_total`
- `total_income`
- `expense_total`
- `net_profit`

### `cashbook_income_by_business_area_view`

Fields:

- `summary_month`
- `business_area_id`
- `business_area_name`
- `cashbook_income_total`
- `invoice_payment_total` future/optional
- `total_income`

### `cashbook_expenses_by_category_view`

Fields:

- `summary_month`
- `expense_category_id`
- `expense_category_name`
- `expense_total`

### `cashbook_target_progress_view`

Fields:

- `target_id`
- `target_month`
- `target_type`
- `target_value`
- `current_value`
- `remaining_value`
- `percentage_achieved`
- `days_remaining`
- `projected_month_end_value`
- `target_status`

Important:

- Views must be management-only.
- Views must not expose salary/staff notes to unauthorized users.
- Views should include only aggregated data unless the user has cashbook detail permissions.

---

## 20. Dashboard Integration

Management dashboard additions:

- Add a Cashbook section or integrate cashbook cards into the existing dashboard.
- Show today's income/expenses/profit.
- Show monthly revenue/profit target progress.
- Show income by business area.
- Show expenses by category.

Reports page additions:

- Add a Business Performance section.
- Include daily/monthly/yearly income and profit summaries.
- Include payment method split across invoice payments and cashbook income.
- Include target progress summaries.

Finance page additions:

- Add link to Cashbook module.
- Keep invoice/payment workflows unchanged.

---

## 21. Server Actions and Services

Recommended service functions:

- `canManageCashbook(profile)`
- `canViewBusinessPerformance(profile)`
- `getCashbookDashboard(profile, filters)`
- `listCashbookIncome(profile, filters)`
- `createCashbookIncome(profile, input)`
- `updateCashbookIncome(profile, id, input)`
- `voidCashbookIncome(profile, id)`
- `listCashbookExpenses(profile, filters)`
- `createCashbookExpense(profile, input)`
- `updateCashbookExpense(profile, id, input)`
- `voidCashbookExpense(profile, id)`
- `listMonthlyTargets(profile, filters)`
- `createMonthlyTarget(profile, input)`
- `updateMonthlyTarget(profile, id, input)`
- `archiveMonthlyTarget(profile, id)`

Implementation should follow existing Finance service patterns:

- `noStore()` for dynamic financial data.
- Server-side permission checks.
- Zod validation.
- Friendly error handling.
- Revalidate relevant routes.

---

## 22. Audit and Data Integrity

Audit should be added when shared audit logs are available.

For Phase 14A MVP:

- Preserve `created_by`, `updated_by`, `deleted_by`.
- Avoid hard deletes.
- Use status `void` or `archived` for corrections.
- Record who entered each income/expense.

Future audit log actions:

- `cashbook.income.created`
- `cashbook.income.updated`
- `cashbook.income.voided`
- `cashbook.expense.created`
- `cashbook.expense.updated`
- `cashbook.expense.voided`
- `business_target.created`
- `business_target.updated`
- `business_target.archived`

---

## 23. Implementation Order

Recommended safe order:

1. Create Phase 14A migration with tables, constraints, indexes, seed categories, RLS policies, and views.
2. Add permission seed data for management-only access.
3. Create Zod schemas and TypeScript types.
4. Build service layer with permission checks.
5. Build server actions.
6. Build `/cashbook` dashboard page.
7. Build daily income list/create/edit.
8. Build expense list/create/edit.
9. Build monthly target management.
10. Add dashboard widgets.
11. Add reports integration.
12. Run lint, type-check, build.
13. Create completion report.
14. Review and fix blockers before approval.

---

## 24. Risks

### Double-counting income

Risk:

- Counting invoice totals and payments together would inflate revenue.

Mitigation:

- Income must use payments received, not invoice totals.
- Daily cashbook income must be separate from invoice payments.

### Mixing event bookings and daily income

Risk:

- Event bookings may already be linked to invoices or payment statuses.

Mitigation:

- If an event has an invoice, record payment through invoice/payment flow.
- Use daily income for simple non-invoiced payments only.

### Salary privacy

Risk:

- Salary expense entries expose staff-sensitive information.

Mitigation:

- Management-only access.
- No teacher/parent visibility.
- Avoid detailed payroll fields in MVP.

### Accounting expectations

Risk:

- Users may expect formal accounting features.

Mitigation:

- Name this module Cashbook & Business Performance, not Accounting.
- Defer bank reconciliation, tax, payroll, and exports.

### Branch scope

Risk:

- Future multi-branch support needs branch-aware summaries.

Mitigation:

- Include `branch_id` from the start.
- Use branch-ready indexes and RLS structure.

---

## 25. Success Criteria

Phase 14A is successful when:

- Admin/Super Admin can record non-invoice daily income.
- Admin/Super Admin can record expenses.
- Salary payments can be recorded as an expense category.
- Total income equals invoice payments received plus daily cashbook income.
- Invoice totals are not counted as income until payment is received.
- Net profit equals total income minus expenses.
- Daily, monthly, and yearly summaries are available.
- Monthly targets can be configured.
- Target widgets show current progress, remaining amount, percentage achieved, days remaining, projection, and status.
- Cashbook dashboard shows today's income, expenses, profit, and monthly performance.
- Income can be grouped by business area.
- Expenses can be grouped by category.
- Teachers and Parents have no access.
- RLS and service-layer permissions are management-only.
- Lint, type-check, and build pass.

---

## 26. Deferred Items

Deferred from Phase 14A:

- Receipt attachment upload.
- Supplier management.
- Detailed payroll.
- Payslips.
- Staff salary contracts.
- Bank reconciliation.
- Tax/VAT reports.
- Accounting exports.
- Cash drawer opening/closing.
- Approval workflows.
- Parent Portal visibility.
- Teacher visibility.
- Automated email or WhatsApp reports.
- Advanced forecasting.
- Multi-branch financial consolidation.

---

## 27. Final Recommendation

Build Phase 14A as a lightweight, management-only Cashbook & Business Performance module.

The most important design rule is to protect the revenue calculation:

```text
Invoice payments received + daily cashbook income = total income
```

The second most important rule is to preserve trust:

```text
Total income - expenses = net profit
```

The module should feel practical, fast, and premium. It should help Little London management understand daily performance without introducing the complexity of a full accounting system.
