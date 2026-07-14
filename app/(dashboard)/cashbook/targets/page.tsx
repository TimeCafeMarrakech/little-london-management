import Link from "next/link";

import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { CashbookTargetEmptyState } from "@/components/cashbook/cashbook-target-empty-state";
import { CashbookTargetFilters } from "@/components/cashbook/cashbook-target-filters";
import { CashbookTargetSummaryCards } from "@/components/cashbook/cashbook-target-summary-cards";
import { CashbookTargetTable } from "@/components/cashbook/cashbook-target-table";
import { Button } from "@/components/ui/button";
import { cashbookTargetListQuerySchema } from "@/features/cashbook/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canManageBusinessTargets,
  canViewBusinessTargets,
  listCashbookBusinessAreas,
  listCashbookTargets,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookTargetsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CashbookTargetsPage({ searchParams }: CashbookTargetsPageProps) {
  const profile = await requireUserProfile();

  if (!canViewBusinessTargets(profile)) {
    return (
      <CashbookErrorState
        title="Access denied"
        message="Monthly targets are available to Super Admin and Admin users only. Teachers and parents do not have access to Cashbook targets."
      />
    );
  }

  const params = await searchParams;
  const filters = cashbookTargetListQuerySchema.parse({
    query: firstParam(params.query),
    targetMonth: firstParam(params.targetMonth),
    targetType: firstParam(params.targetType),
    businessAreaId: firstParam(params.businessAreaId),
    status: firstParam(params.status),
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    sort: firstParam(params.sort),
    direction: firstParam(params.direction),
  });

  try {
    const [result, businessAreas] = await Promise.all([
      listCashbookTargets(profile, filters),
      listCashbookBusinessAreas(profile),
    ]);
    const canManage = canManageBusinessTargets(profile);

    return (
      <div className="space-y-7">
        <CashbookTabs active="targets" />
        <section className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
              <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Monthly Targets</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#5b6f82]">
                Track revenue, profit, expense budgets, and active student targets against live Cashbook performance.
              </p>
            </div>
            {canManage ? (
              <Button asChild className="rounded-2xl bg-[#f24a3a] text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]">
                <Link href="/cashbook/targets/new">+ Create Target</Link>
              </Button>
            ) : null}
          </div>
        </section>

        <CashbookTargetSummaryCards progressCards={result.progressCards} />
        <CashbookTargetFilters businessAreas={businessAreas} filters={filters} />

        {result.targets.length > 0 ? (
          <CashbookTargetTable canManage={canManage} targets={result.targets} />
        ) : (
          <CashbookTargetEmptyState canManage={canManage} />
        )}
      </div>
    );
  } catch (error) {
    return (
      <CashbookErrorState
        message={
          error instanceof Error && error.message.includes("relation")
            ? "The Phase 14A.1 Supabase migration has not been applied yet. Apply the cashbook migration, then reload this page."
            : "Monthly targets could not be loaded. Please try again."
        }
        title="Targets unavailable"
      />
    );
  }
}
