import Link from "next/link";
import { notFound } from "next/navigation";

import { CashbookErrorState } from "@/components/cashbook/cashbook-error-state";
import { CashbookExpenseActions } from "@/components/cashbook/cashbook-expense-actions";
import { CashbookTabs } from "@/components/cashbook/cashbook-tabs";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/session";
import {
  canArchiveCashbookExpenses,
  canEditCashbookExpenses,
  canViewCashbookExpenses,
  canVoidCashbookExpenses,
  getCashbookExpenseDetail,
} from "@/services/cashbook/cashbook-service";

export const dynamic = "force-dynamic";

type CashbookExpenseDetailPageProps = {
  params: Promise<{ expenseId: string }>;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatMethod(method: string): string {
  return method.replace("_", " ");
}

export default async function CashbookExpenseDetailPage({ params }: CashbookExpenseDetailPageProps) {
  const profile = await requireUserProfile();

  if (!canViewCashbookExpenses(profile)) {
    return <CashbookErrorState title="Access denied" message="You do not have permission to view expenses." />;
  }

  const { expenseId } = await params;
  const expense = await getCashbookExpenseDetail(profile, expenseId);

  if (!expense) {
    notFound();
  }

  const fields = [
    ["Expense Date", expense.expenseDate],
    ["Description", expense.description],
    ["Category", expense.expenseCategoryName],
    ["Business Area", expense.businessAreaName ?? "Not assigned"],
    ["Supplier / Staff Member", expense.supplierOrStaffName ?? "Not recorded"],
    ["Payment Method", formatMethod(expense.paymentMethod)],
    ["Amount", formatMoney(expense.amount)],
    ["Status", expense.status],
    ["Recorded By", expense.recordedByName],
  ];

  return (
    <div className="space-y-6">
      <CashbookTabs active="expenses" />
      <section className="rounded-[1.75rem] border border-[#eadfce] bg-[#fff8ee] p-6 shadow-[0_20px_55px_rgba(15,45,71,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Daily Expense</p>
            <h1 className="mt-2 text-3xl font-bold text-[#0f2d47]">{expense.description}</h1>
            <p className="mt-2 text-sm text-[#5b6f82]">{expense.expenseDate} - {formatMoney(expense.amount)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-2xl" variant="outline">
              <Link href="/cashbook/expenses">Back to expenses</Link>
            </Button>
            {canEditCashbookExpenses(profile) && expense.status === "recorded" && !expense.deletedAt ? (
              <Button asChild className="rounded-2xl bg-[#f24a3a] text-white hover:bg-[#dc3729]">
                <Link href={`/cashbook/expenses/${expense.id}/edit`}>Edit</Link>
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
        <p className="mt-3 rounded-2xl bg-[#fff8ee] px-4 py-3 text-sm text-[#5b6f82]">{expense.notes ?? "No notes recorded."}</p>
      </section>

      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-lg font-bold text-[#0f2d47]">Audit history</h2>
        <div className="mt-4 grid gap-3 text-sm text-[#5b6f82] md:grid-cols-2">
          <p>Created at: <span className="font-semibold text-[#0f2d47]">{expense.createdAt}</span></p>
          <p>Updated at: <span className="font-semibold text-[#0f2d47]">{expense.updatedAt}</span></p>
          <p>Created by: <span className="font-semibold text-[#0f2d47]">{expense.createdBy ?? "Not recorded"}</span></p>
          <p>Updated by: <span className="font-semibold text-[#0f2d47]">{expense.updatedBy ?? "Not recorded"}</span></p>
          <p>Deleted at: <span className="font-semibold text-[#0f2d47]">{expense.deletedAt ?? "Not archived"}</span></p>
          <p>Deleted by: <span className="font-semibold text-[#0f2d47]">{expense.deletedBy ?? "Not archived"}</span></p>
        </div>
      </section>

      <CashbookExpenseActions
        canArchive={canArchiveCashbookExpenses(profile)}
        canVoid={canVoidCashbookExpenses(profile)}
        expenseId={expense.id}
        status={expense.status}
      />
    </div>
  );
}
