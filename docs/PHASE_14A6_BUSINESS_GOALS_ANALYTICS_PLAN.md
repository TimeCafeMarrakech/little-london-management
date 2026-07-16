# Phase 14A.6 Business Goals & Analytics Plan

## 1. Purpose

Phase 14A.6 plans a management-only Business Goals & Analytics module for Little London.

The module should extend the existing Cashbook and Business Performance foundation from monthly targets into a broader goal and analytics layer covering:

- Monthly goals
- Quarterly goals
- Yearly goals
- Whole-business goals
- Business-area goals
- Historical goal performance
- Growth analysis
- Period comparisons

This plan must preserve the approved Phase 14A.4 Monthly Targets feature and the Phase 14A.5 Business Performance dashboard. Existing target cards, current-month summaries, and `cashbook_target_progress_view` should continue working exactly as they do today.

Phase 14A.6 should remain practical and management-first. It should not become an accounting system, payroll system, forecasting engine, or AI analytics module.

## 2. Current Monthly Target Architecture

The current target implementation is based on:

- `monthly_business_targets`
- `cashbook_target_progress_view`
- `/cashbook/targets`
- `/cashbook/performance`
- `business_targets.view.all`
- `business_targets.manage.all`
- `business_performance.view.all`

Current table behavior:

- `target_month` is a `date`.
- `target_month` must be the first day of the month.
- Supported target types are:
  - `revenue`
  - `profit`
  - `expense_budget`
  - `active_students`
- `business_area_id` is nullable.
  - `null` means whole-business target.
  - non-null means business-area target.
- Active duplicate targets are prevented by month, type, branch scope, and business area.
- Status currently supports `active` and `archived`.
- Restore remains deferred.

Current progress view behavior:

- Uses `cashbook_monthly_summary_view` for whole-business monthly values.
- Uses `cashbook_business_area_profit_view` for business-area revenue, expenses, and profit.
- Uses active student counts for `active_students`.
- Future monthly targets return zero current progress.
- Past monthly targets use final actual values.
- Current monthly targets use simple run-rate projection.
- The view is management-only through `can_view_cashbook_reports()`.

Current UI behavior:

- `/cashbook/targets` displays monthly target management.
- Current-month summary cards show whole-business targets only.
- Business-area targets appear in list and detail views.
- `/cashbook/performance` consumes existing monthly target progress and does not recalculate target progress in React.

This architecture is stable and should be protected.

## 3. Recommended Database Strategy

### Options Reviewed

#### Option A: Extend `monthly_business_targets`

Possible additions:

- `period_type`
- `period_start`
- `period_end`
- `target_year`
- `target_quarter`

Benefits:

- Reuses current table name.
- Reuses some current service patterns.

Risks:

- The table name becomes misleading.
- Existing monthly views and UI would need careful filtering to avoid reading quarterly/yearly rows.
- `target_month` constraints would become awkward.
- Existing unique indexes would need redesign.
- Current Phase 14A.4 and Phase 14A.5 behavior could be accidentally broken.
- Backward compatibility would be more fragile.

#### Option B: Create New `business_goals` Table

Recommended.

Benefits:

- Preserves `monthly_business_targets` unchanged.
- Keeps existing `/cashbook/targets` and `cashbook_target_progress_view` safe.
- Allows monthly, quarterly, and yearly goals without overloading month-specific fields.
- Supports future analytics without forcing current monthly target workflows to change.
- Keeps migration/backfill optional and reviewable.
- Allows a clean period model with explicit `period_type`, `period_start`, and `period_end`.

Risks:

- There may be temporary duplication between monthly targets and new business goals.
- Services must make clear which pages use legacy monthly targets versus generalized goals.
- If existing monthly targets are later migrated, a careful backfill plan is required.

### Recommendation

Create a new generalized `business_goals` table in a future follow-up migration.

Do not edit old migrations.
Do not alter `monthly_business_targets` during the first Business Goals foundation step.
Do not replace `cashbook_target_progress_view` until the generalized goal views are reviewed and approved.

Recommended transition model:

1. Keep Phase 14A.4 Monthly Targets as the stable current-month operational target system.
2. Introduce `business_goals` for monthly, quarterly, and yearly goals.
3. Add new views for generalized goal progress.
4. Keep `/cashbook/targets` working against `monthly_business_targets`.
5. Build `/cashbook/goals` as the new generalized goals area.
6. Later, after approval, decide whether to backfill existing monthly targets into `business_goals`.

## 4. Period Model

Goals should use explicit period boundaries.

Recommended fields:

| Field | Type | Notes |
| --- | --- | --- |
| `period_type` | text | `monthly`, `quarterly`, `yearly` |
| `period_start` | date | Inclusive first day of period |
| `period_end` | date | Inclusive last day of period |
| `target_year` | integer | Calendar year |
| `target_quarter` | integer nullable | `1`, `2`, `3`, `4` for quarterly goals only |
| `target_month` | integer nullable | `1` to `12` for monthly goals only, if useful |

### Monthly

Representation:

- UI label: `YYYY-MM`
- `period_type = monthly`
- `period_start = YYYY-MM-01`
- `period_end = last day of month`
- `target_year = YYYY`
- `target_month = MM`
- `target_quarter = null`

Example:

```text
2026-07
period_start = 2026-07-01
period_end = 2026-07-31
```

### Quarterly

Representation:

- UI label: `Q1 2026`, `Q2 2026`, `Q3 2026`, `Q4 2026`
- `period_type = quarterly`
- `target_year = YYYY`
- `target_quarter = 1..4`
- `period_start` and `period_end` derived from year and quarter

Quarter boundaries:

- Q1: Jan 1 - Mar 31
- Q2: Apr 1 - Jun 30
- Q3: Jul 1 - Sep 30
- Q4: Oct 1 - Dec 31

### Yearly

Representation:

- UI label: `YYYY`
- `period_type = yearly`
- `period_start = YYYY-01-01`
- `period_end = YYYY-12-31`
- `target_year = YYYY`
- `target_month = null`
- `target_quarter = null`

### Timezone Safety

Use date-only strings and server/database date arithmetic.

Do:

- Store `date` values in PostgreSQL.
- Generate dates from explicit year/month/day parts.
- Use helpers that return `YYYY-MM-DD` directly.

Do not:

- Use local-midnight `toISOString()` conversions for goal periods.
- Compare `YYYY-MM` strings directly to date fields.
- Infer periods from browser timezone conversions.

## 5. Goal Types

Supported goal types:

- Revenue
- Profit
- Expense Budget
- Active Students

Recommended stored values:

- `revenue`
- `profit`
- `expense_budget`
- `active_students`

### Goal Scope

Each goal may apply to:

- Whole business
- Business area

Business areas:

- English Classes
- Play & Learn
- Workshops
- Holiday Camps
- Birthday Parties
- Theatre
- Other

Recommended scope fields:

| Field | Type | Notes |
| --- | --- | --- |
| `business_area_id` | uuid nullable | `null` means whole business |
| `branch_id` | uuid nullable | Future branch support |

## 6. Goal Workflows

### Create Goal

Management users can create goals for:

- Monthly period
- Quarterly period
- Yearly period
- Whole business
- Specific business area

Validation:

- Period type is required.
- Period start and end must match the selected period type.
- Goal type is required.
- Target value must be greater than or equal to zero.
- Business area is optional.
- Duplicate active goals should be prevented for:
  - branch
  - period type
  - period start
  - period end
  - goal type
  - business area

### Edit Goal

Allowed while goal status is active.

Editable fields:

- Target value
- Notes
- Business area, if the goal has not yet been materially used in reporting
- Period fields only if safe and no duplicate would be created

Safer MVP recommendation:

- Allow editing target value and notes.
- Require archive and recreate for changing period type, period, goal type, or business area.

### Archive Goal

Soft archive only.

Rules:

- Set status to `archived`.
- Preserve created/updated metadata.
- Do not hard delete.
- Archived goals should not appear in active dashboard cards.
- Archived goals may appear in historical audit views if explicitly filtered.

### View Goal Detail

The goal detail page should show:

- Goal type
- Period
- Business area
- Target
- Actual
- Remaining
- Percentage achieved
- Forecast
- Status
- Period elapsed
- Period remaining
- Notes
- Created by
- Created at
- Updated at
- Archived metadata

### Filtering

Goal list filters:

- Period type
- Year
- Quarter
- Month
- Goal type
- Business area
- Status
- Search

### Historical Achievement

Historical goal view should show:

- Achieved goals
- Missed goals
- Achievement percentage
- Actual versus target
- Difference amount
- Final status

Restore remains deferred.

## 7. Routes and Pages

Recommended route:

- `/cashbook/goals`

Recommended child routes:

- `/cashbook/goals/new`
- `/cashbook/goals/[goalId]`
- `/cashbook/goals/[goalId]/edit`

Recommended navigation:

- Keep Cashbook as a flat management-only sidebar item.
- Use Cashbook tabs internally:
  - Daily Income
  - Expenses
  - Targets
  - Performance
  - Goals

The current `/cashbook/targets` page should remain available as the approved monthly target workflow until a later migration plan replaces it.

### Goals Page Structure

The `/cashbook/goals` page should include:

1. Premium page header
2. Period type selector:
   - Monthly
   - Quarterly
   - Yearly
3. Summary cards
4. Goal filters
5. Goal list/table
6. Historical goal achievement panel
7. Growth analytics preview
8. Business-area analytics panel

Goal table columns:

- Goal type
- Period
- Business area
- Target
- Actual
- Remaining
- Percentage achieved
- Forecast
- Status
- Actions

## 8. Analytics

Analytics should provide practical management comparisons without overcomplicating the interface.

Recommended analytics:

- Month-over-month revenue growth
- Month-over-month profit growth
- Month-over-month expense change
- Month-over-month active student change
- Quarter-over-quarter revenue growth
- Quarter-over-quarter profit growth
- Year-over-year revenue growth
- Year-over-year profit growth
- Goal achievement rate
- Best-performing month
- Best-performing quarter
- Best-performing business area
- Expense trend
- Revenue trend
- Profit trend

### Comparison Rules

Previous values of zero must be handled safely.

If previous value is zero and current value is positive:

- Do not show infinite growth.
- Show neutral copy such as `No previous period`.

If previous value is zero and current value is zero:

- Show `No movement`.

If values are negative, such as profit:

- Compare absolute change and clearly label whether the movement improved or worsened.

For expense budgets:

- Increased expense is usually negative.
- Reduced expense is usually positive.

## 9. Forecasting Rules

Use simple run-rate forecasting only.

Do not build:

- AI forecasting
- seasonal forecasting
- weighted forecasts
- external analytics services
- complex predictive models

### Monthly Forecast

Use elapsed calendar days in the month.

```text
projected = actual / elapsed_days * days_in_month
```

### Quarterly Forecast

Use elapsed days in the quarter.

```text
projected = actual / elapsed_days_in_quarter * days_in_quarter
```

### Yearly Forecast

Use elapsed days in the year.

```text
projected = actual / elapsed_days_in_year * days_in_year
```

### Safety Rules

- If elapsed days is zero, projection should be zero.
- Future periods should not show a projection.
- Past periods should show final actual value, not forecast.
- Never divide by zero.

## 10. Status Rules

Supported statuses:

- Achieved
- On Track
- Needs Attention
- At Risk
- Missed
- Upcoming
- No Data

### Past Periods

Past periods are final.

Rules:

- No forecast.
- Revenue, profit, and active student goals:
  - Achieved if actual >= target.
  - Missed if actual < target.
- Expense budget:
  - Achieved if actual <= target.
  - Missed if actual > target.

### Current Period

Current periods use run-rate forecast.

Revenue, profit, and active student goals:

- Achieved if actual >= target.
- On Track if forecast >= target.
- Needs Attention if forecast is close but below target.
- At Risk if forecast is materially below target.

Expense budget:

- Achieved only at period end if actual <= target.
- On Track if forecast <= target.
- Needs Attention if forecast is near budget.
- At Risk if actual or forecast exceeds budget.

Suggested thresholds:

- Revenue/profit/student:
  - On Track: projected >= 100% of target
  - Needs Attention: projected >= 65% and < 100%
  - At Risk: projected < 65%
- Expense budget:
  - On Track: projected <= 85% of budget
  - Needs Attention: projected > 85% and <= 100%
  - At Risk: projected > 100%

### Future Periods

Future periods should show:

- Actual: 0
- Forecast: none
- Status: Upcoming

Future periods must not imply progress before the period begins.

### No Data

Use `No Data` when:

- Required actual data cannot be calculated reliably.
- A business-area goal depends on unavailable mapping.
- The period has no relevant records and no meaningful run-rate can be calculated.

## 11. Business-Area Limitations

Cashbook income and cashbook expenses can be grouped by `business_area_id`.

Invoice income currently remains:

```text
Invoice Income / Unassigned
```

unless a reliable invoice-to-business-area mapping exists.

Do not infer business area from:

- invoice descriptions
- invoice item text
- class names
- course names
- manual string labels

### Impact on Area Revenue Goals

Business-area revenue goals can safely include:

- cashbook income tagged to that business area

Business-area revenue goals should not include invoice payments until reliable mapping exists.

The UI must explain this clearly:

```text
Invoice payments are currently reported as Invoice Income / Unassigned unless linked to a verified business area in a future phase.
```

### Impact on Area Profit Goals

Business-area profit can safely calculate:

```text
cashbook income tagged to area - expenses tagged to area
```

It should not imply that invoice income has been allocated by business area.

### Impact on Quarterly and Yearly Analytics

Quarterly and yearly business-area analytics should aggregate the same safe tagged cashbook records.

Invoice income remains unassigned until mapping is implemented.

## 12. Permissions and RLS

Phase 14A.6 should remain management-only.

Allowed:

- Super Admin
- Admin

Blocked:

- Teacher
- Parent

### Existing Permissions

Current permissions:

- `business_targets.view.all`
- `business_targets.manage.all`
- `business_performance.view.all`

These are sufficient for an MVP if generalized business goals are treated as the next version of business targets.

### Recommended Future Permissions

If more granular roles are expected, add new permissions in a future migration:

- `business_goals.view.all`
- `business_goals.create.all`
- `business_goals.edit.all`
- `business_goals.archive.all`
- `business_goals.manage.all`
- `business_analytics.view.all`

Recommendation:

- For Phase 14A.6.1, reuse existing management-only roles and consider adding new explicit permissions only if the implementation creates a new table.
- Do not grant Teacher or Parent any goal or analytics access.
- Keep reporting views protected by management-only helper functions.

### RLS Principles

Future `business_goals` RLS should use operation-specific policies:

- SELECT requires view/manage.
- INSERT requires create/manage.
- UPDATE requires edit/manage or archive/manage depending on workflow.
- DELETE should be blocked.

Views should follow the existing Phase 12 and Phase 14A.1 management-only security pattern and must not grant broad authenticated access.

## 13. Reporting Views

New reporting views are recommended.

Suggested views:

- `business_goal_progress_view`
- `business_goal_period_summary_view`
- `business_goal_growth_analytics_view`
- `business_goal_achievement_history_view`
- `business_area_goal_performance_view`

### Existing Views to Reuse

Existing views can feed the new views:

- `cashbook_monthly_summary_view`
- `cashbook_business_area_profit_view`
- `cashbook_payment_method_summary_view`
- `cashbook_income_by_business_area_view`
- `cashbook_expenses_by_category_view`
- `cashbook_target_progress_view` for legacy monthly target screens only

### Views to Leave Untouched

Keep these untouched during Phase 14A.6 foundation:

- `cashbook_target_progress_view`
- current monthly summary views used by `/cashbook/performance`
- existing report views

### Security

Every `business_goal_*` view should:

- expose only management-safe fields
- exclude internal notes unless explicitly management-only
- exclude deleted records
- use management-only helper functions
- avoid broad `authenticated` access

## 14. Migration / Backfill Considerations

Do not edit old migrations.

If Phase 14A.6 implementation proceeds, create a new migration.

Recommended migration approach:

1. Create `business_goals`.
2. Create helper functions and RLS policies.
3. Create management-only progress views.
4. Do not alter `monthly_business_targets`.
5. Optionally backfill current `monthly_business_targets` into `business_goals` only after review.

### Backfill Options

#### No Backfill Initially

Recommended for first implementation.

Benefits:

- Lowest risk.
- Existing monthly targets remain untouched.
- New goals can be tested independently.

#### One-Time Backfill

Possible later:

- Copy active monthly targets into `business_goals`.
- Preserve target month as monthly period.
- Mark source as `monthly_business_targets`.
- Keep original monthly targets intact.

Requires:

- duplicate prevention
- migration report
- review of UI duplication

#### Live Sync

Not recommended for MVP.

Live sync between `monthly_business_targets` and `business_goals` risks inconsistent behavior and hidden coupling.

## 15. UI / UX

Follow Premium Boutique Dashboard v3.

The interface should feel:

- clean
- calm
- spacious
- easy to scan
- management-first
- not like an accounting ledger

Recommended page sections:

1. Page header
2. Period selector
3. Goal summary cards
4. Goal list
5. Historical goal achievement
6. Growth analytics
7. Business-area analytics
8. Insights

### Page Header

Title:

```text
Business Goals & Analytics
```

Subtitle:

```text
Track monthly, quarterly and yearly goals across Little London.
```

Primary action:

```text
+ Create Goal
```

### Period Selector

Use segmented controls:

- Monthly
- Quarterly
- Yearly

Then show relevant selector:

- Month picker
- Quarter picker
- Year picker

### Goal Summary Cards

Cards:

- Revenue Goal
- Profit Goal
- Expense Budget
- Active Students

Each card should show:

- Target
- Actual
- Remaining
- Percentage
- Status badge
- Forecast where applicable

### Goal List

Use a table or card-list hybrid with:

- strong hierarchy
- no cramped financial text
- badges for status
- clearly visible period labels

### Historical Goal Achievement

Show:

- achieved versus missed count
- achievement rate
- recent missed goals
- best period

### Growth Analytics

Use simple, readable charts:

- revenue trend
- profit trend
- expenses trend
- active students trend

Avoid dense chart legends and overlapping labels.

### Insights

Insights should be deterministic, not AI-generated.

Examples:

- "Revenue is ahead of the monthly run-rate."
- "Expense budget is at risk this quarter."
- "Play & Learn is the strongest tagged cashbook area."

## 16. Risks

### Breaking Current Monthly Targets

Risk:

- Generalizing the existing table could break `/cashbook/targets` or `/cashbook/performance`.

Mitigation:

- Use a new `business_goals` table.
- Leave current monthly target table and view untouched.

### Duplicate Goals

Risk:

- Users may create overlapping goals for the same period/type/scope.

Mitigation:

- Add unique active index for branch, period type, period range, goal type, and business area.

### Incorrect Period Boundaries

Risk:

- Timezone conversion shifts dates.

Mitigation:

- Use date-only strings and database date fields.
- Avoid `toISOString()` from local midnight.

### Double-Counting Income

Risk:

- Payment allocations could be counted as income.

Mitigation:

- Count `payments.amount` once.
- Count cashbook income once.
- Use allocations only for invoice balances.

### Misleading Future Forecasts

Risk:

- Future goals show artificial progress.

Mitigation:

- Future period status is `Upcoming`.
- Forecast is blank or null.

### Business-Area Mapping Inaccuracy

Risk:

- Invoice revenue is incorrectly assigned to business areas.

Mitigation:

- Keep invoice revenue as `Invoice Income / Unassigned`.
- Only use explicit `business_area_id` cashbook records.

### Zero Previous-Period Percentages

Risk:

- Analytics show infinite percentages.

Mitigation:

- Return neutral comparison labels when previous value is zero.

### Overly Complex UI

Risk:

- Goals and analytics become cluttered.

Mitigation:

- Use progressive disclosure.
- Keep summaries at the top and details on drill-down pages.

### Slow Reporting Queries

Risk:

- Quarterly/yearly rollups become expensive.

Mitigation:

- Add indexes on period fields.
- Use views carefully.
- Avoid querying unnecessary historical ranges by default.

## 17. Safe Implementation Order

### Phase 14A.6.1 - Database / Generalized Goals Foundation

Build:

- `business_goals` table
- goal helper functions
- RLS policies
- duplicate active goal constraints
- management-only reporting views

Do not modify:

- `monthly_business_targets`
- `cashbook_target_progress_view`
- existing monthly targets UI
- Business Performance dashboard

### Phase 14A.6.2 - Goals Management UI

Build:

- `/cashbook/goals`
- create/edit/detail/archive workflows
- period selectors
- filters
- empty/loading/error states

Keep:

- `/cashbook/targets` unchanged.

### Phase 14A.6.3 - Historical Analytics and Comparisons

Build:

- goal achievement history
- month-over-month comparisons
- quarter-over-quarter comparisons
- year-over-year comparisons
- business-area analytics panels

### Phase 14A.6.4 - Business Performance Dashboard Integration

Add selected generalized goal cards to `/cashbook/performance` only after the dedicated goals module is approved.

Do not replace the existing monthly target cards until the new goal system is validated.

### Phase 14A.7 - PDF Reports Preparation

Use approved goals and analytics data for future monthly/quarterly/yearly PDF reports.

## 18. Success Criteria

Phase 14A.6 is successful when:

- Monthly goals continue working.
- Quarterly goals can be created and tracked.
- Yearly goals can be created and tracked.
- Whole-business and business-area goals are supported safely.
- Historical goal achievement is visible.
- Month-over-month analytics are available.
- Quarter-over-quarter analytics are available.
- Year-over-year analytics are available.
- Future periods show `Upcoming` rather than misleading progress.
- Past periods show final `Achieved` or `Missed` status.
- Expense budget uses inverted logic.
- Teacher and Parent access remains blocked.
- Existing finance calculations remain unchanged.
- Existing monthly target UI remains unchanged until intentionally migrated.
- Existing Business Performance dashboard remains stable.
- Lint, type-check, and build pass.

## 19. Deferred Items

Deferred from Phase 14A.6:

- AI forecasting
- advanced forecasting
- payroll
- accounting exports
- tax/VAT reporting
- parent portal analytics
- teacher analytics access
- automatic invoice-to-business-area mapping
- receipt attachments
- cash reconciliation UI
- generated PDF business reports
- email or WhatsApp delivery
- custom date range analytics beyond approved period selectors
- restore workflow

