import type { CashbookTrendPoint } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookPerformanceTrendCardProps = {
  trends: CashbookTrendPoint[];
};

function maxValue(trends: CashbookTrendPoint[]): number {
  return Math.max(1, ...trends.flatMap((point) => [point.totalIncome, point.expenses, Math.abs(point.netProfit)]));
}

function barHeight(value: number, max: number): string {
  return `${Math.max(8, Math.round((Math.abs(value) / max) * 170))}px`;
}

export function CashbookPerformanceTrendCard({ trends }: CashbookPerformanceTrendCardProps) {
  const max = maxValue(trends);

  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0f2d47]">Income vs Expenses Trend</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#5b6f82]">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#78bf91]" /> Income</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#f24a3a]" /> Expenses</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#d6b36a]" /> Profit</span>
        </div>
      </div>
      {trends.length > 0 ? (
        <div className="mt-6 overflow-x-auto pb-2">
          <div className="flex min-w-[620px] items-end justify-center gap-8">
            {trends.map((point) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={point.date}>
                <div className="flex h-44 items-end gap-1">
                  <span className="w-3 rounded-t-full bg-[#78bf91]" style={{ height: barHeight(point.totalIncome, max) }} title={`Income ${formatMoney(point.totalIncome)}`} />
                  <span className="w-3 rounded-t-full bg-[#f24a3a]" style={{ height: barHeight(point.expenses, max) }} title={`Expenses ${formatMoney(point.expenses)}`} />
                  <span className="w-3 rounded-t-full bg-[#2f80ed]" style={{ height: barHeight(point.netProfit, max) }} title={`Profit ${formatMoney(point.netProfit)}`} />
                </div>
                <span className="text-xs font-semibold text-[#5b6f82]">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-[#fff8ee] p-4 text-sm text-[#5b6f82]">No trend data is available for this period yet.</p>
      )}
    </article>
  );
}
