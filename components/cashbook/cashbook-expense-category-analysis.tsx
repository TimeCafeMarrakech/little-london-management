import type { CashbookExpenseCategoryAnalysis } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookExpenseCategoryAnalysisProps = {
  analysis: CashbookExpenseCategoryAnalysis;
};

export function CashbookExpenseCategoryAnalysis({ analysis }: CashbookExpenseCategoryAnalysisProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Expense Analysis</p>
      <h2 className="mt-2 text-xl font-bold text-[#0f2d47]">Category movement</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#fff8ee] p-4">
          <p className="text-sm font-semibold text-[#5b6f82]">Largest category</p>
          <p className="mt-2 text-lg font-bold text-[#0f2d47]">{analysis.largestCategory?.name ?? "No expenses"}</p>
          <p className="mt-1 text-sm text-[#5b6f82]">{analysis.largestCategory ? `${formatMoney(analysis.largestCategory.total)} (${analysis.largestCategory.percentOfExpenses}%)` : "No recorded expenses in this period"}</p>
        </div>
        <div className="rounded-2xl bg-[#fff8ee] p-4">
          <p className="text-sm font-semibold text-[#5b6f82]">Salary total</p>
          <p className="mt-2 text-lg font-bold text-[#0f2d47]">{formatMoney(analysis.salaryTotal)}</p>
          <p className="mt-1 text-sm text-[#5b6f82]">Management-safe aggregate only</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {analysis.categories.length > 0 ? analysis.categories.map((category) => (
          <div className="space-y-2" key={category.id}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="font-semibold text-[#0f2d47]">{category.name}</span>
              <span className="text-[#5b6f82]">{formatMoney(category.total)} · {category.percentOfExpenses}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#fff2cf]">
              <div className="h-full bg-[#f24a3a]" style={{ width: `${Math.min(category.percentOfExpenses, 100)}%` }} />
            </div>
          </div>
        )) : null}
      </div>
    </article>
  );
}
