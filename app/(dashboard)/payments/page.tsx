import Link from "next/link";

import { FinanceDashboardWidgets } from "@/components/finance/finance-dashboard-widgets";
import { FinanceEmptyState } from "@/components/finance/finance-empty-state";
import { FinanceErrorState } from "@/components/finance/finance-error-state";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { PaymentCard } from "@/components/finance/payment-card";
import { Button } from "@/components/ui/button";
import { paymentListQuerySchema } from "@/features/finance/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageFinance, listPayments } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type PaymentsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const profile = await requireUserProfile();

  if (!canManageFinance(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Finance management is available to Super Admin and Admin roles only.</p>
      </section>
    );
  }

  const params = await searchParams;
  const filters = paymentListQuerySchema.parse({
    query: getFirstParam(params.query),
    method: getFirstParam(params.method),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });

  try {
    const result = await listPayments(profile, filters);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Finance</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Payments</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Record payments and allocate them to outstanding family invoices.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href="/invoices">Invoices</Link></Button>
              <Button asChild><Link href="/payments/new">Record payment</Link></Button>
            </div>
          </div>
        </section>
        <FinanceDashboardWidgets metrics={result.metrics} />
        <FinanceFilters
          placeholder="Search payment number"
          query={filters.query}
          selectLabel="Method"
          selectName="method"
          selectOptions={[
            { value: "all", label: "All methods" },
            { value: "cash", label: "Cash" },
            { value: "card", label: "Card" },
            { value: "bank_transfer", label: "Bank transfer" },
            { value: "cheque", label: "Cheque" },
            { value: "other", label: "Other" },
          ]}
          selectValue={filters.method}
        />
        {result.payments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.payments.map((payment) => <PaymentCard key={payment.id} payment={payment} />)}
          </div>
        ) : (
          <FinanceEmptyState actionHref="/payments/new" actionLabel="Record payment" description="Payments matching the current filters will appear here." title="No payments found" />
        )}
      </div>
    );
  } catch {
    return <FinanceErrorState message="The Phase 9 Supabase migration may not be applied yet. Apply the finance migration, then reload this page." />;
  }
}
