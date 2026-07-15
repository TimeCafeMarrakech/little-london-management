import type { CashbookBusinessAreaPerformanceItem } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookBusinessAreaPerformanceProps = {
  areas: CashbookBusinessAreaPerformanceItem[];
};

export function CashbookBusinessAreaPerformance({ areas }: CashbookBusinessAreaPerformanceProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Business Areas</p>
      <h2 className="mt-2 text-xl font-bold text-[#0f2d47]">Performance by area</h2>
      <p className="mt-2 text-sm text-[#5b6f82]">Invoice payments are shown as Invoice Income / Unassigned until a reliable business-area mapping exists.</p>
      <div className="mt-5 space-y-3">
        {areas.length > 0 ? areas.map((area) => (
          <div className="rounded-2xl border border-[#eadfce] bg-[#fff8ee] p-4" key={area.id}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-bold text-[#0f2d47]">{area.name}</h3>
                <p className="text-sm text-[#5b6f82]">{area.shareOfTotalIncome}% of total income</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#5b6f82]">{area.targetStatus}</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
              <span><strong className="block text-[#0f2d47]">{formatMoney(area.income)}</strong>Income</span>
              <span><strong className="block text-[#0f2d47]">{formatMoney(area.expenses)}</strong>Expenses</span>
              <span><strong className="block text-[#0f2d47]">{formatMoney(area.profit)}</strong>Profit</span>
              <span><strong className="block text-[#0f2d47]">{area.profitMargin === null ? "Neutral" : `${area.profitMargin}%`}</strong>Margin</span>
            </div>
          </div>
        )) : (
          <p className="rounded-2xl bg-[#fff8ee] p-4 text-sm text-[#5b6f82]">No business-area performance data is available for this period.</p>
        )}
      </div>
    </article>
  );
}
