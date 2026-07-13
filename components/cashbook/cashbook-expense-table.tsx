import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { CashbookExpenseListItem } from "@/features/cashbook/types";

type CashbookExpenseTableProps = {
  expenses: CashbookExpenseListItem[];
  canEdit: boolean;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

function formatMethod(method: string): string {
  return method.replace("_", " ");
}

function statusClass(status: CashbookExpenseListItem["status"]): string {
  if (status === "recorded") {
    return "bg-[#e6f4ec] text-[#24734d]";
  }

  if (status === "void") {
    return "bg-[#fff2cf] text-[#9b6b0f]";
  }

  return "bg-[#f24a3a]/10 text-[#c53227]";
}

export function CashbookExpenseTable({ expenses, canEdit }: CashbookExpenseTableProps) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#eadfce] bg-white/92 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead className="bg-[#fff8ee] text-xs font-bold uppercase tracking-[0.12em] text-[#5b6f82]">
            <tr>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Description</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Business Area</th>
              <th className="px-5 py-4">Supplier / Staff Member</th>
              <th className="px-5 py-4">Payment Method</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Recorded By</th>
              <th className="px-5 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eadfce]">
            {expenses.map((expense) => (
              <tr className="text-[#0f2d47] hover:bg-[#fff8ee]/70" key={expense.id}>
                <td className="whitespace-nowrap px-5 py-4 font-medium">{expense.expenseDate}</td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{expense.description}</p>
                  <p className="mt-1 text-xs text-[#5b6f82]">{expense.notes ?? "No notes"}</p>
                </td>
                <td className="px-5 py-4">{expense.expenseCategoryName}</td>
                <td className="px-5 py-4">{expense.businessAreaName ?? "Not assigned"}</td>
                <td className="px-5 py-4">{expense.supplierOrStaffName ?? "Not recorded"}</td>
                <td className="px-5 py-4 capitalize">{formatMethod(expense.paymentMethod)}</td>
                <td className="whitespace-nowrap px-5 py-4 font-bold">{formatMoney(expense.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(expense.status)}`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-5 py-4">{expense.recordedByName}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-xl" size="sm" variant="outline">
                      <Link href={`/cashbook/expenses/${expense.id}`}>View</Link>
                    </Button>
                    {canEdit && expense.status === "recorded" && !expense.deletedAt ? (
                      <Button asChild className="rounded-xl" size="sm">
                        <Link href={`/cashbook/expenses/${expense.id}/edit`}>Edit</Link>
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
