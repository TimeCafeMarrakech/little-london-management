import Link from "next/link";
import { notFound } from "next/navigation";

import { CashbookIncomeActions } from "@/components/cashbook/cashbook-income-actions";
import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canArchiveCashbookIncome,
  canEditCashbookIncome,
  canViewCashbookIncome,
  canVoidCashbookIncome,
  getCashbookIncomeDetail,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookIncomeDetailPageProps = {
  params: Promise<{ incomeId: string }>;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatMethod(method: string): string {
  return method.replace("_", " ");
}

export default async function CashbookIncomeDetailPage({ params }: CashbookIncomeDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canViewCashbookIncome(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to view daily income." />;
  }

  const { incomeId } = await params;
  const entry = await getCashbookIncomeDetail(profile, incomeId);

  if (!entry) {
    notFound();
  }

  const fields = [
    ["Date", entry.incomeDate],
    ["Description", entry.description],
    ["Business Area", entry.businessAreaName],
    ["Category", entry.incomeCategoryName],
    ["Payment Method", formatMethod(entry.paymentMethod)],
    ["Amount", formatMoney(entry.amount)],
    ["Status", entry.status],
    ["Parent", entry.parentName ?? "Not linked"],
    ["Student", entry.studentName ?? "Not linked"],
    ["Recorded By", entry.recordedByName],
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Daily Income</p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">{entry.description}</h1>
            <p className="mt-2 text-sm text-[#5b6f82]">{entry.incomeDate} - {formatMoney(entry.amount)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/cashbook">Back to cashbook</Link>
            </Button>
            {canEditCashbookIncome(profile) && entry.status === "recorded" && !entry.deletedAt ? (
              <Button asChild className="rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
                <Link href={`/cashbook/${entry.id}/edit`}>Edit</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fields.map(([label, value]) => (
          <article className="rounded-[1.25rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_32px_rgba(15,45,71,0.07)]" key={label}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#5b6f82]">{label}</p>
            <p className="mt-2 text-lg font-semibold capitalize text-[#0f2d47]">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-lg font-bold text-[#0f2d47]">Notes</h2>
        <p className="mt-3 rounded-2xl bg-[#fff8ee] px-4 py-3 text-sm text-[#5b6f82]">{entry.notes ?? "No notes recorded."}</p>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-lg font-bold text-[#0f2d47]">Audit history</h2>
        <div className="mt-4 grid gap-3 text-sm text-[#5b6f82] md:grid-cols-2">
          <p>Created at: <span className="font-semibold text-[#0f2d47]">{entry.createdAt}</span></p>
          <p>Updated at: <span className="font-semibold text-[#0f2d47]">{entry.updatedAt}</span></p>
          <p>Created by: <span className="font-semibold text-[#0f2d47]">{entry.createdBy ?? "Not recorded"}</span></p>
          <p>Updated by: <span className="font-semibold text-[#0f2d47]">{entry.updatedBy ?? "Not recorded"}</span></p>
          <p>Deleted at: <span className="font-semibold text-[#0f2d47]">{entry.deletedAt ?? "Not archived"}</span></p>
          <p>Deleted by: <span className="font-semibold text-[#0f2d47]">{entry.deletedBy ?? "Not archived"}</span></p>
        </div>
      </section>

      <CashbookIncomeActions
        canArchive={canArchiveCashbookIncome(profile)}
        canVoid={canVoidCashbookIncome(profile)}
        incomeId={entry.id}
        status={entry.status}
      />
    </div>
  );
}
