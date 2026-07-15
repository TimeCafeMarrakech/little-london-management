import { CircleDollarSign, FileClock, PiggyBank, ReceiptText, TrendingDown, TrendingUp } from "lucide-react";

import type { CashbookExecutiveSummaryMetric } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookPerformanceSummaryCardsProps = {
  cards: CashbookExecutiveSummaryMetric[];
};

const iconMap = {
  invoice_payments: ReceiptText,
  cashbook_income: CircleDollarSign,
  total_income: TrendingUp,
  expenses: TrendingDown,
  net_profit: PiggyBank,
  outstanding_invoices: FileClock,
  profit_margin: TrendingUp,
};

const toneClass = {
  coral: "bg-[#ffe4df] text-[#f24a3a]",
  sage: "bg-[#e6f4ec] text-[#24734d]",
  yellow: "bg-[#fff2cf] text-[#a46f00]",
  navy: "bg-[#ddeaf5] text-[#0f2d47]",
};

function formatValue(card: CashbookExecutiveSummaryMetric): string {
  if (card.valueType === "percent") {
    return `${card.value.toLocaleString("en-GB", { maximumFractionDigits: 1 })}%`;
  }

  return formatMoney(card.value);
}

function comparisonText(card: CashbookExecutiveSummaryMetric): string {
  if (!card.comparison) {
    return "No comparison";
  }

  if (card.comparison.isNeutral) {
    return card.comparison.label;
  }

  const difference = card.valueType === "percent" ? `${Math.abs(card.comparison.difference).toLocaleString("en-GB", { maximumFractionDigits: 1 })} pts` : formatMoney(Math.abs(card.comparison.difference));
  return `${card.comparison.difference >= 0 ? "+" : "-"}${difference} · ${card.comparison.label}`;
}

export function CashbookPerformanceSummaryCards({ cards }: CashbookPerformanceSummaryCardsProps) {
  const visibleCards = cards.filter((card) => card.id !== "profit_margin");

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Executive performance summary">
      {visibleCards.map((card) => {
        const Icon = iconMap[card.id];
        const isNegative = (card.comparison?.difference ?? 0) < 0;

        return (
          <article className="min-h-[9.25rem] rounded-[1.35rem] border border-[#eadfce] bg-white/90 p-4 shadow-[0_14px_34px_rgba(15,45,71,0.06)]" key={card.id}>
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClass[card.tone]}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="min-h-10 text-sm font-bold leading-5 text-[#0f2d47]">{card.label}</p>
              </div>
              <div>
                <p className={`text-2xl font-bold tabular-nums ${card.id === "net_profit" && card.value < 0 ? "text-[#f24a3a]" : "text-[#0f2d47]"}`}>{formatValue(card)}</p>
                <p className={`mt-2 text-xs font-semibold ${card.comparison?.isNeutral ? "text-[#5b6f82]" : isNegative ? "text-[#f24a3a]" : "text-[#2f9f69]"}`}>
                  {comparisonText(card)}
                </p>
                {card.id === "outstanding_invoices" ? (
                  <p className="mt-1 text-xs leading-5 text-[#5b6f82]">{card.helper}</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
