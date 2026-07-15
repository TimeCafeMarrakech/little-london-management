import type { CashbookPaymentMethodBreakdownItem } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookPaymentMethodBreakdownProps = {
  methods: CashbookPaymentMethodBreakdownItem[];
};

export function CashbookPaymentMethodBreakdown({ methods }: CashbookPaymentMethodBreakdownProps) {
  const totalReceived = methods.reduce((sum, method) => sum + method.invoicePaymentIncome + method.cashbookIncome, 0);
  const colours = ["#2f9f69", "#2f80ed", "#8b5cf6", "#f59e0b"];
  let offset = 0;
  const segments = methods.map((method, index) => {
    const value = method.invoicePaymentIncome + method.cashbookIncome;
    const percent = totalReceived > 0 ? (value / totalReceived) * 100 : 0;
    const segment = { ...method, percent, dash: `${percent} ${100 - percent}`, offset: -offset, colour: colours[index] ?? "#5b6f82" };
    offset += percent;
    return segment;
  });

  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
      <h2 className="text-base font-bold text-[#0f2d47]">Payment Methods</h2>
      <div className="mt-5 grid items-center gap-5 xl:grid-cols-[10rem_1fr]">
        <div className="relative mx-auto h-40 w-40">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#f3eee6" strokeWidth="5" />
            {segments.map((segment) => (
              <circle
                cx="18"
                cy="18"
                fill="none"
                key={segment.method}
                r="14"
                stroke={segment.colour}
                strokeDasharray={segment.dash}
                strokeDashoffset={segment.offset}
                strokeLinecap="round"
                strokeWidth="5"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="max-w-24 text-lg font-bold leading-5 tabular-nums text-[#0f2d47]">{formatMoney(totalReceived).replace(" MAD", "")}</span>
            <span className="text-xs font-semibold text-[#5b6f82]">MAD</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {segments.map((method) => (
            <div className="flex items-start justify-between gap-3 text-sm" key={method.method}>
              <span className="flex min-w-0 items-center gap-2 text-[#0f2d47]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: method.colour }} /><span className="leading-5">{method.label}</span></span>
              <strong className="max-w-[8rem] text-right leading-5 tabular-nums text-[#0f2d47]">{formatMoney(method.invoicePaymentIncome + method.cashbookIncome)}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
