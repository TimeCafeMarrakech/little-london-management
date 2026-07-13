import { CalendarDays, ReceiptText, TrendingUp, WalletCards } from "lucide-react";

import type { CashbookIncomeSummary } from "@/features/cashbook/types";

type CashbookSummaryCardsProps = {
  summary: CashbookIncomeSummary;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

export function CashbookSummaryCards({ summary }: CashbookSummaryCardsProps) {
  const cards = [
    { label: "Today's Income", value: formatMoney(summary.todayIncome), helper: "Daily income only", icon: WalletCards, tone: "text-[#f24a3a]", bg: "bg-[#f24a3a]/10" },
    { label: "This Week", value: formatMoney(summary.weekIncome), helper: "Recorded income this week", icon: TrendingUp, tone: "text-[#68a783]", bg: "bg-[#e6f4ec]" },
    { label: "This Month", value: formatMoney(summary.monthIncome), helper: "Cashbook income this month", icon: CalendarDays, tone: "text-[#d89d1d]", bg: "bg-[#fff2cf]" },
    { label: "Total Records", value: String(summary.totalRecords), helper: "Active recorded rows", icon: ReceiptText, tone: "text-[#0f2d47]", bg: "bg-[#ddeaf5]" },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Cashbook daily income summary">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article className="rounded-[1.35rem] border border-[#eadfce] bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]" key={card.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5b6f82]">{card.label}</p>
                <p className="mt-4 text-2xl font-bold text-[#0f2d47]">{card.value}</p>
                <p className="mt-2 text-sm text-[#5b6f82]">{card.helper}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-full ${card.bg} ${card.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
