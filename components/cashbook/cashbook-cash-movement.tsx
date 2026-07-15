import { Banknote } from "lucide-react";

import type { CashbookCashMovement } from "@/features/cashbook/types";

import { formatMoney } from "./cashbook-target-utils";

type CashbookCashMovementProps = {
  cashMovement: CashbookCashMovement;
};

export function CashbookCashMovement({ cashMovement }: CashbookCashMovementProps) {
  return (
    <article className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_14px_34px_rgba(15,45,71,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#0f2d47]">Cash Movement</h2>
          <p className={`mt-5 text-3xl font-bold leading-tight tabular-nums ${cashMovement.netCashMovement < 0 ? "text-[#f24a3a]" : "text-[#0f2d47]"}`}>{formatMoney(cashMovement.netCashMovement)}</p>
        </div>
        <span className="rounded-2xl bg-[#e6f4ec] p-3 text-[#24734d]">
          <Banknote className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-[#5b6f82]">Cash received</span>
          <strong className="max-w-[9rem] text-right leading-5 tabular-nums text-[#0f2d47]">{formatMoney(cashMovement.cashReceived)}</strong>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-[#5b6f82]">Cash expenses</span>
          <strong className="max-w-[9rem] text-right leading-5 tabular-nums text-[#0f2d47]">{formatMoney(cashMovement.cashExpenses)}</strong>
        </div>
        <div className="flex justify-between gap-3 border-t border-[#eadfce] pt-3">
          <span className="font-semibold text-[#0f2d47]">Net Movement</span>
          <strong className={`max-w-[9rem] text-right leading-5 tabular-nums ${cashMovement.netCashMovement < 0 ? "text-[#f24a3a]" : "text-[#0f2d47]"}`}>{formatMoney(cashMovement.netCashMovement)}</strong>
        </div>
      </div>
    </article>
  );
}
