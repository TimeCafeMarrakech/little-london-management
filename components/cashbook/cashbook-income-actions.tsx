"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { archiveCashbookIncomeAction, voidCashbookIncomeAction } from "@/features/cashbook/actions";
import type { CashbookActionState } from "@/features/cashbook/types";

type CashbookIncomeActionsProps = {
  incomeId: string;
  canArchive: boolean;
  canVoid: boolean;
  status: string;
};

const initialState: CashbookActionState = { success: false, message: "" };

function ActionButton({ label, pendingLabel, variant }: { label: string; pendingLabel: string; variant?: "outline" | "destructive" }) {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-2xl" disabled={pending} type="submit" variant={variant}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function CashbookIncomeActions({ incomeId, canArchive, canVoid, status }: CashbookIncomeActionsProps) {
  const [archiveState, archiveAction] = useActionState(archiveCashbookIncomeAction, initialState);
  const [voidState, voidAction] = useActionState(voidCashbookIncomeAction, initialState);
  const canAct = status === "recorded";

  if (!canAct || (!canArchive && !canVoid)) {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <h2 className="text-lg font-bold text-[#0f2d47]">Record actions</h2>
      <p className="mt-1 text-sm text-[#5b6f82]">Void keeps the record visible for history. Archive soft-hides the record from normal active lists.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {canVoid ? (
          <form action={voidAction}>
            <input name="incomeId" type="hidden" value={incomeId} />
            <ActionButton label="Mark void" pendingLabel="Voiding..." variant="outline" />
          </form>
        ) : null}
        {canArchive ? (
          <form action={archiveAction}>
            <input name="incomeId" type="hidden" value={incomeId} />
            <ActionButton label="Archive" pendingLabel="Archiving..." variant="destructive" />
          </form>
        ) : null}
      </div>
      {[archiveState.message, voidState.message].filter(Boolean).map((message) => (
        <p className="mt-3 rounded-2xl bg-[#fff8ee] px-4 py-3 text-sm text-[#5b6f82]" key={message}>{message}</p>
      ))}
    </section>
  );
}
