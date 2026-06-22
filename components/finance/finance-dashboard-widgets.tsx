import { CreditCard, ReceiptText, TrendingUp, WalletCards } from "lucide-react";

import type { FinanceMetrics } from "@/features/finance/types";

type FinanceDashboardWidgetsProps = {
  metrics: FinanceMetrics;
};

function formatMoney(value: number): string {
  return `${value.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 })} MAD`;
}

const cards = [
  { key: "totalRevenue", label: "Total revenue", icon: TrendingUp, tone: "text-primary" },
  { key: "outstandingInvoices", label: "Outstanding invoices", icon: ReceiptText, tone: "text-sky-700" },
  { key: "overdueInvoices", label: "Overdue invoices", icon: WalletCards, tone: "text-accent" },
  { key: "paymentsThisMonth", label: "Payments this month", icon: CreditCard, tone: "text-primary" },
] as const;

export function FinanceDashboardWidgets({ metrics }: FinanceDashboardWidgetsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const rawValue = metrics[card.key];
        const value = card.key === "outstandingInvoices" || card.key === "overdueInvoices" ? rawValue.toString() : formatMoney(rawValue);

        return (
          <section className="ll-card-premium p-5" key={card.key}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
              </div>
              <span className="rounded-full bg-secondary/25 p-3 shadow-inner-soft">
                <Icon className={`h-5 w-5 ${card.tone}`} aria-hidden="true" />
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}
