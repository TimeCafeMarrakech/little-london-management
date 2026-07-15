import Link from "next/link";

import type { CashbookPerformancePeriod } from "@/features/cashbook/types";

type CashbookPerformancePeriodSelectorProps = {
  activePeriod: CashbookPerformancePeriod;
};

const periods: Array<{ id: CashbookPerformancePeriod; label: string }> = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
];

export function CashbookPerformancePeriodSelector({ activePeriod }: CashbookPerformancePeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-[#eadfce] bg-white/86 p-2" aria-label="Business performance period">
      {periods.map((period) => (
        <Link
          aria-current={activePeriod === period.id ? "page" : undefined}
          className={
            activePeriod === period.id
              ? "rounded-xl bg-[#f24a3a] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_22px_rgba(242,74,58,0.2)]"
              : "rounded-xl px-4 py-2 text-sm font-semibold text-[#5b6f82] hover:bg-[#fff8ee] hover:text-[#0f2d47]"
          }
          href={`/cashbook/performance?period=${period.id}`}
          key={period.id}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
