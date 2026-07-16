import Link from "next/link";
import { Download, Eye, FileText, Printer } from "lucide-react";

import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import { canViewFinancialReports, normalizeFinancialReportMonth } from "@/services/financial-reports/financial-report-service";

export const dynamic = "force-dynamic";

type CashbookReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CashbookReportsPage({ searchParams }: CashbookReportsPageProps) {
  const profile = await requireUserProfile();

  if (!canViewFinancialReports(profile)) {
    return (
      <CashbookErrorState
        title="Access denied"
        message="Financial Reports are available to Super Admin and Admin users only. Teachers and parents do not have access to management reports."
      />
    );
  }

  const params = (await searchParams) ?? {};
  let selectedMonth: string;

  try {
    selectedMonth = normalizeFinancialReportMonth(firstValue(params.month));
  } catch {
    selectedMonth = normalizeFinancialReportMonth();
  }

  const pdfHref = `/cashbook/reports/monthly-financial-summary/pdf?month=${selectedMonth}`;
  const downloadHref = `${pdfHref}&download=1`;

  return (
    <div className="space-y-7">
      <CashbookTabs active="reports" />

      <section className="overflow-hidden rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">Financial Reports</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6f82]">
              Generate a professional monthly summary of Little London&apos;s income, expenses, profit, targets and outstanding invoices.
            </p>
          </div>
          <form className="flex flex-col gap-3 rounded-[1.25rem] border border-[#eadfce] bg-white/80 p-3 sm:flex-row sm:items-end" action="/cashbook/reports">
            <label className="grid gap-1 text-sm font-bold text-[#0f2d47]">
              Report month
              <input
                className="h-11 rounded-2xl border border-[#eadfce] bg-white px-4 text-sm font-semibold text-[#0f2d47] outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15"
                defaultValue={selectedMonth}
                name="month"
                type="month"
              />
            </label>
            <Button className="h-11 rounded-2xl bg-[#f24a3a] px-5 text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]" type="submit">
              Generate Report
            </Button>
          </form>
        </div>
      </section>

      <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_16px_38px_rgba(15,45,71,0.06)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f24a3a]/12 text-[#f24a3a]">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Monthly Report</p>
              <h2 className="mt-2 text-2xl font-bold text-[#0f2d47]">Monthly Financial Summary</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b6f82]">
                A complete management overview of received income, expenses, net profit, target performance and outstanding invoices.
              </p>
              <p className="mt-3 text-sm font-semibold text-[#5b6f82]">
                Selected month: <span className="text-[#0f2d47]">{selectedMonth}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="rounded-2xl border border-[#eadfce] bg-white px-5 text-[#0f2d47] hover:bg-[#fff8ee]" variant="outline">
              <Link href={pdfHref} target="_blank">
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview
              </Link>
            </Button>
            <Button asChild className="rounded-2xl border border-[#eadfce] bg-white px-5 text-[#0f2d47] hover:bg-[#fff8ee]" variant="outline">
              <Link href={pdfHref} target="_blank">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print
              </Link>
            </Button>
            <Button asChild className="rounded-2xl bg-[#f24a3a] px-5 text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]">
              <Link href={downloadHref}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </Link>
            </Button>
          </div>
        </div>
      </article>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-[#fff8ee] p-5 text-sm leading-6 text-[#5b6f82]">
        <p className="font-bold text-[#0f2d47]">Report accuracy note</p>
        <p className="mt-2">
          Total income is based on received invoice payments plus recorded Cashbook income. Invoice totals and payment allocations are not counted as additional income.
        </p>
      </section>
    </div>
  );
}
