import Link from "next/link";

import { FinanceDashboardWidgets } from "@/components/finance/finance-dashboard-widgets";
import { FinanceEmptyState } from "@/components/finance/finance-empty-state";
import { FinanceErrorState } from "@/components/finance/finance-error-state";
import { FinanceFilters } from "@/components/finance/finance-filters";
import { InvoiceCard } from "@/components/finance/invoice-card";
import { Button } from "@/components/ui/button";
import { invoiceListQuerySchema } from "@/features/finance/schemas";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageFinance, listInvoices } from "@/services/finance/finance-service";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
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
  const filters = invoiceListQuerySchema.parse({
    query: getFirstParam(params.query),
    status: getFirstParam(params.status),
    page: getFirstParam(params.page),
    pageSize: getFirstParam(params.pageSize),
    sort: getFirstParam(params.sort),
    direction: getFirstParam(params.direction),
  });

  try {
    const result = await listInvoices(profile, filters);

    return (
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent">Finance</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Invoices</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Track family billing, balances, and invoice history with calm operational clarity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href="/payments">Payments</Link></Button>
              <Button asChild><Link href="/invoices/new">Create invoice</Link></Button>
            </div>
          </div>
        </section>
        <FinanceDashboardWidgets metrics={result.metrics} />
        <FinanceFilters
          placeholder="Search invoice number"
          query={filters.query}
          selectLabel="Status"
          selectName="status"
          selectOptions={[
            { value: "all", label: "All active" },
            { value: "draft", label: "Draft" },
            { value: "issued", label: "Issued" },
            { value: "partially_paid", label: "Partially paid" },
            { value: "paid", label: "Paid" },
            { value: "cancelled", label: "Cancelled" },
            { value: "archived", label: "Archived" },
          ]}
          selectValue={filters.status}
        />
        {result.invoices.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.invoices.map((invoice) => <InvoiceCard invoice={invoice} key={invoice.id} />)}
          </div>
        ) : (
          <FinanceEmptyState actionHref="/invoices/new" actionLabel="Create invoice" description="Invoices matching the current filters will appear here." title="No invoices found" />
        )}
      </div>
    );
  } catch {
    return <FinanceErrorState message="The Phase 9 Supabase migration may not be applied yet. Apply the finance migration, then reload this page." />;
  }
}
