# Phase 14A.1 Review

## Summary

Phase 14A.1 was reviewed against the approved Cashbook & Business Performance plan, the Phase 14A.1 completion report, the new Supabase migration, the existing Phase 12 reporting security pattern, and the existing authentication, permissions, invoices, payments, and user profile schema.

The migration is well aligned with the intended management-only cashbook foundation. It creates the expected tables, seed data, permissions, helper functions, RLS policies, and reporting views without altering the existing invoice or payment workflow.

However, the review found important issues in the target progress calculations and RLS policy granularity that should be fixed before applying the migration in Supabase.

**Decision: Requires fixes**

## Files Reviewed

- `docs/PHASE_14A_CASHBOOK_BUSINESS_PERFORMANCE_PLAN.md`
- `docs/PHASE_14A1_COMPLETION_REPORT.md`
- `supabase/migrations/202606200017_cashbook_business_performance.sql`
- `supabase/migrations/202606200014_reports_security_fix.sql`
- `supabase/migrations/202606200001_auth_foundation.sql`
- `supabase/migrations/202606200008_finance_payments_invoices.sql`
- `supabase/migrations/202606200015_payment_recording_rpc_fix.sql`
- `supabase/migrations/202606200016_payment_recording_lock_fix.sql`

## Verification Results

### Tables, Constraints, and Relationships

The migration creates the required Phase 14A.1 tables:

- `business_areas`
- `cashbook_income_categories`
- `cashbook_expense_categories`
- `cashbook_income_entries`
- `cashbook_expense_entries`
- `monthly_business_targets`
- `cashbook_daily_reconciliations`

Primary keys, foreign keys, required fields, amount checks, status checks, payment method checks, timestamp fields, soft-delete columns, and branch-ready columns are present.

The migration does not alter existing `invoices`, `payments`, `payment_allocations`, or `user_profiles` tables.

### Seed Safety

Seed inserts are idempotent in practice because unique active indexes are created before the seed inserts, and the seed statements use `on conflict do nothing`.

### Permissions

Permission keys are inserted with the expected modules, actions, scopes, and descriptions.

Role permission assignments are limited to:

- `admin`
- `super_admin`

No Teacher or Parent permissions are inserted.

### RLS and Helper Functions

RLS is enabled on every new table.

The helper functions:

- `public.can_manage_cashbook()`
- `public.can_view_cashbook_reports()`

follow the existing helper style by requiring `auth.uid()`, an active Super Admin/Admin role, and relevant permissions.

Teacher and Parent users do not satisfy these helper checks.

### Reporting View Security

The cashbook reporting views follow the hardened Phase 12 pattern:

- `security_invoker = true`
- `security_barrier = true`
- explicit `public.can_view_cashbook_reports()` predicates
- broad revoke from `anon`, `authenticated`, and `public`
- authenticated `select` grant guarded by management-only predicates

This is consistent with `public.can_view_management_reports()` in the Phase 12 security fix.

### Income and Expense Calculations

The daily and monthly summary views correctly calculate total income from:

```text
payments.amount + recorded cashbook income
```

Payment allocations are not joined into the income summary, so payment income is not double-counted through allocation rows.

Cashbook income and expenses correctly exclude rows where:

- `deleted_at is not null`
- `status <> 'recorded'`

### Daily Reconciliation

Generated reconciliation columns are internally consistent:

- `expected_cash = opening_cash + cash_invoice_payments + cashbook_cash_income - cash_expenses`
- `difference = actual_cash - expected_cash`
- `closing_cash = actual_cash`

## Blockers

None found that clearly prevents the migration from being parsed or applied.

## Important Issues

1. Target progress calculations do not correctly handle past and future target months.

Evidence: `cashbook_target_progress_view` calculates `days_remaining`, `projected_month_end_value`, and `average_required_per_remaining_day` using `current_date` and `extract(day from current_date)` regardless of whether `target_month` is current, past, or future.

Why this matters: A past month can still use today's day-of-month for projection math, and a future month can show days remaining through the end of that future month even though that period has not started. The review requirement explicitly asks that current, past, future, zero-target, and zero-elapsed-day cases be handled correctly.

Expected fix: Make target progress period-aware. For past months, projections should be final actuals with zero days remaining. For future months, current/projection should not imply live progress before the month starts. For the current month, use elapsed days and remaining days for that month only.

2. Business-area targets are not scoped to the selected business area.

Evidence: `monthly_business_targets.business_area_id` exists and is surfaced in `cashbook_target_progress_view`, but revenue, profit, and expense budget `current_value` are sourced from `cashbook_monthly_summary_view`, which is branch/month-wide and does not filter by `mbt.business_area_id`.

Why this matters: A target for one business area can display whole-school revenue, profit, or expenses, producing incorrect target status.

Expected fix: When `business_area_id` is set, use business-area-specific income/profit data. For expense budgets, either use area-scoped expenses where available or document and enforce that area-specific expense budgets are not supported yet.

3. RLS policies are too broad for edit, void, archive, and restore workflows.

Evidence: The income and expense entry policies are created `for all`. Their `using` clauses grant access based on view/manage permissions, while `with check` grants writes based on create/manage permissions.

Why this matters: The migration creates separate permissions such as `cashbook.edit.all`, `cashbook.void.all`, `cashbook.archive.all`, `cashbook.restore.all`, and the matching expense permissions, but the RLS policies do not enforce those actions independently. In the current MVP, Admin and Super Admin receive all permissions, so the practical exposure is limited. Still, the policy model is not implementation-ready for the requested archive/void workflows or future granular management roles.

Expected fix: Split RLS policies by operation where practical:

- `select` requires view/manage.
- `insert` requires create/manage.
- `update` requires edit/manage, with additional service-level or policy-level status guards for void/archive/restore workflows.
- hard delete should remain unavailable or Super Admin-only if ever needed.

4. `can_manage_cashbook()` is broader than the name implies.

Evidence: `public.can_manage_cashbook()` returns true when the user has any of `cashbook.manage.all`, `expenses.manage.all`, `business_targets.manage.all`, or `cash_reconciliation.manage.all`.

Why this matters: Category and business area policies use this helper for write access. If future roles receive only one manage permission, such as reconciliation management, they may be able to manage shared category/business-area records more broadly than intended.

Expected fix: Either rename/split helper functions by domain or use domain-specific helper checks for business areas, income categories, expense categories, targets, and reconciliations.

## Medium Issues

1. Payment method summary excludes existing `card` and `other` payments from the payment-method breakdown.

Evidence: Existing `payments.payment_method` allows `cash`, `card`, `bank_transfer`, `cheque`, and `other`, while `cashbook_payment_method_summary_view` filters invoice payment methods to `cash`, `bank_transfer`, and `cheque`.

Why this matters: The core income totals include all `payments.amount`, but the payment-method summary excludes any historical or future `card`/`other` payments. This is acceptable if Little London is intentionally restricting active reporting to Cash, Bank Transfer, and Cheque, but the view may not reconcile with total income if older data includes other methods.

2. Daily reconciliation values are manual totals and can drift from source records.

Evidence: `cashbook_daily_reconciliations` stores `cash_invoice_payments`, `cashbook_cash_income`, and `cash_expenses` manually instead of deriving them from `payments`, `cashbook_income_entries`, and `cashbook_expense_entries`.

Why this matters: This is reasonable for a cash-count workflow, but the future service layer should validate or prefill these values to avoid reconciliation drift.

3. Expense budget target progress wording may be confusing.

Evidence: `percentage_achieved` is calculated as `current_value / target_value * 100` for all target types, including `expense_budget`.

Why this matters: For an expense budget, lower spending is good. The status logic correctly treats overspending as bad, but the label `percentage_achieved` may be interpreted as progress toward a positive goal rather than budget consumed.

## Minor Issues

1. The daily reconciliation unique index filters on `status <> 'archived'`, but the table status check only allows `open`, `closed`, and `adjusted`.

This is harmless but redundant. If archived reconciliations are intended, the status check should include `archived`; otherwise the index predicate can be simplified to `deleted_at is null`.

2. `on conflict do nothing` seed inserts are safe, but explicit conflict targets would make the retry behavior clearer.

The current approach is acceptable because the relevant unique indexes are created before the seed statements.

3. The reporting views expose `recorded_by` in `cashbook_daily_reconciliation_view`.

This is management-only and not a security issue, but it should be intentional because it exposes a user profile identifier to report consumers.

## Passed Items

- New tables and relationships are structurally valid against existing schema dependencies.
- Seed inserts are retry-safe.
- Permissions are assigned only to Super Admin/Admin.
- Teacher and Parent receive no cashbook permissions.
- Reporting views follow the Phase 12 hardened reporting pattern.
- `security_invoker` and `security_barrier` usage matches the existing Phase 12 approved approach.
- Income summaries count `payments.amount` once and do not double-count payment allocations.
- Cashbook income and expenses exclude voided, archived, and deleted records.
- Existing invoice/payment workflows and tables are not altered.
- Migration ordering is safe relative to the existing auth, finance, and reports migrations.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed

## Approval Decision

**Requires fixes**

The migration should be revised before applying in Supabase. The most important fixes are the target-progress calculation edge cases and the RLS policy split for view/create/edit/void/archive/restore workflows.
