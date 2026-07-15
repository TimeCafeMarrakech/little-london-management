import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { CashbookBusinessAreaPerformance } from "@/components/cashbook/cashbook-business-area-performance";
import { CashbookCashMovement } from "@/components/cashbook/cashbook-cash-movement";
import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookExpenseCategoryAnalysis } from "@/components/cashbook/cashbook-expense-category-analysis";
import { CashbookManagementInsights } from "@/components/cashbook/cashbook-management-insights";
import { CashbookPaymentMethodBreakdown } from "@/components/cashbook/cashbook-payment-method-breakdown";
import { CashbookPerformancePeriodSelector } from "@/components/cashbook/cashbook-performance-period-selector";
import { CashbookPerformanceSummaryCards } from "@/components/cashbook/cashbook-performance-summary-cards";
import { CashbookPerformanceTargets } from "@/components/cashbook/cashbook-performance-targets";
import { CashbookPerformanceTrendCard } from "@/components/cashbook/cashbook-performance-trend-card";
import { CashbookStudentKpis } from "@/components/cashbook/cashbook-student-kpis";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { Button } from "@/components/ui/button";
import { cashbookPerformancePeriodSchema } from "@/features/cashbook/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canViewBusinessPerformance, getBusinessPerformanceDashboard } from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookPerformancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CashbookPerformancePage({ searchParams }: CashbookPerformancePageProps) {
  const profile = await requireUserProfile();

  if (!canViewBusinessPerformance(profile)) {
    return (
      <CashbookErrorState
        title="Access denied"
        message="Business Performance is available to Super Admin and Admin users only. Teachers and parents do not have access to performance reporting."
      />
    );
  }

  const params = (await searchParams) ?? {};
  const period = cashbookPerformancePeriodSchema.parse(firstValue(params.period) ?? "month");

  try {
    const dashboard = await getBusinessPerformanceDashboard(profile, period);

    return (
      <div className="space-y-7">
        <CashbookTabs active="performance" />

        <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#f24a3a]">Cashbook</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-[#0f2d47]">Business Performance</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5b6f82]">
                A clear view of income, expenses, profit, targets and business activity.<br className="hidden sm:block" />
                Income is based on money received, not invoice totals.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#5b6f82]">
                Period: {dashboard.periodLabel} ({dashboard.currentRange.start} to {dashboard.currentRange.end})
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CashbookPerformancePeriodSelector activePeriod={dashboard.period} />
              <Button disabled className="rounded-2xl border border-[#eadfce] bg-white/80 px-5 text-[#5b6f82] hover:bg-white" variant="outline">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Generate Monthly Report
              </Button>
            </div>
          </div>
        </section>

        <CashbookPerformanceSummaryCards cards={dashboard.summaryCards} />

        <CashbookPerformanceTargets revenueGoal={dashboard.todayBusinessGoal.revenueTarget} targets={dashboard.monthlyTargets} />

        <div className="space-y-5">
          <CashbookPerformanceTrendCard trends={dashboard.trends} />
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            <CashbookCashMovement cashMovement={dashboard.cashMovement} />
            <CashbookStudentKpis kpis={dashboard.studentKpis} />
            <CashbookPaymentMethodBreakdown methods={dashboard.paymentMethods} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <CashbookBusinessAreaPerformance areas={dashboard.businessAreas} />
          <CashbookExpenseCategoryAnalysis analysis={dashboard.expenseAnalysis} />
        </div>

        <div className="space-y-5">
          <CashbookManagementInsights insights={dashboard.insights} />
          <article className="rounded-[1.5rem] border border-[#eadfce] bg-[#fff8ee] p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Supporting Detail</p>
            <h2 className="mt-2 text-xl font-bold text-[#0f2d47]">Open operational records</h2>
            <p className="mt-2 text-sm leading-6 text-[#5b6f82]">
              Use the approved Cashbook workflows to review the source entries behind this dashboard. Performance reporting is read-only in this phase.
            </p>
            <div className="mt-5 grid gap-3">
              <Link className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white/86 px-4 py-3 text-sm font-bold text-[#0f2d47]" href="/cashbook">
                Daily Income <ArrowRight className="h-4 w-4 text-[#f24a3a]" aria-hidden="true" />
              </Link>
              <Link className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white/86 px-4 py-3 text-sm font-bold text-[#0f2d47]" href="/cashbook/expenses">
                Expenses <ArrowRight className="h-4 w-4 text-[#f24a3a]" aria-hidden="true" />
              </Link>
              <Link className="flex items-center justify-between rounded-2xl border border-[#eadfce] bg-white/86 px-4 py-3 text-sm font-bold text-[#0f2d47]" href="/cashbook/targets">
                Monthly Targets <ArrowRight className="h-4 w-4 text-[#f24a3a]" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <CashbookErrorState
        message={
          error instanceof Error && error.message.includes("relation")
            ? "The Phase 14A.1 Supabase migration has not been applied yet. Apply the cashbook migration, then reload this page."
            : "Business Performance could not be loaded. Please check the cashbook reporting permissions and database connection."
        }
        title="Performance unavailable"
      />
    );
  }
}
