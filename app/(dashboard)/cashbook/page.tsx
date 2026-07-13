import Link from "next/link";
import { Plus } from "lucide-react";

import { CashbookEmptyState } from "@/components/cashbook/cashbook-empty-state";
import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookFilters } from "@/components/cashbook/cashbook-filters";
import { CashbookIncomeTable } from "@/components/cashbook/cashbook-income-table";
import { CashbookSummaryCards } from "@/components/cashbook/cashbook-summary-cards";
import { Button } from "@/components/ui/button";
import { cashbookIncomeListQuerySchema } from "@/features/cashbook/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canCreateCashbookIncome,
  canEditCashbookIncome,
  canViewCashbookIncome,
  listCashbookBusinessAreas,
  listCashbookIncome,
  listCashbookIncomeCategories,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CashbookPage({ searchParams }: CashbookPageProps) {
  const profile = await requireUserProfile();

  if (!canViewCashbookIncome(profile)) {
    return (
      <CashbookErrorState
        title="Access denied"
        message="Cashbook is available to Super Admin and Admin users only. Teachers and parents do not have access to daily income records."
      />
    );
  }

  const rawSearchParams = (await searchParams) ?? {};
  const filters = cashbookIncomeListQuerySchema.parse({
    query: firstValue(rawSearchParams.query),
    dateFrom: firstValue(rawSearchParams.dateFrom),
    dateTo: firstValue(rawSearchParams.dateTo),
    businessAreaId: firstValue(rawSearchParams.businessAreaId),
    incomeCategoryId: firstValue(rawSearchParams.incomeCategoryId),
    paymentMethod: firstValue(rawSearchParams.paymentMethod),
    status: firstValue(rawSearchParams.status),
    page: firstValue(rawSearchParams.page),
    pageSize: firstValue(rawSearchParams.pageSize),
    sort: firstValue(rawSearchParams.sort),
    direction: firstValue(rawSearchParams.direction),
  });

  try {
    const [result, businessAreas, categories] = await Promise.all([
      listCashbookIncome(profile, filters),
      listCashbookBusinessAreas(profile),
      listCashbookIncomeCategories(profile),
    ]);
    const canCreate = canCreateCashbookIncome(profile);

    return (
      <div className="space-y-7">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Finance</p>
              <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Cashbook</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">
                Record daily business income received outside the invoice system.
              </p>
            </div>
            {canCreate ? (
              <Button asChild className="rounded-2xl bg-[#f24a3a] text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]">
                <Link href="/cashbook/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Record Income
                </Link>
              </Button>
            ) : null}
          </div>
        </section>

        <CashbookSummaryCards summary={result.summary} />
        <CashbookFilters businessAreas={businessAreas} categories={categories} filters={filters} />

        {result.entries.length > 0 ? (
          <CashbookIncomeTable canEdit={canEditCashbookIncome(profile)} entries={result.entries} />
        ) : (
          <CashbookEmptyState canCreate={canCreate} />
        )}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between rounded-[1.25rem] border border-[#eadfce] bg-white/88 px-4 py-3 text-sm text-[#5b6f82]">
            <span>
              Page {result.page} of {result.totalPages}
            </span>
            <span>{result.totalRecords} records</span>
          </div>
        ) : null}
      </div>
    );
  } catch (error) {
    return (
      <CashbookErrorState
        message={
          error instanceof Error && error.message.includes("relation")
            ? "The Phase 14A.1 Supabase migration has not been applied yet. Apply the cashbook migration, then reload this page."
            : "Daily income could not be loaded. Please check the database connection and cashbook permissions."
        }
      />
    );
  }
}
