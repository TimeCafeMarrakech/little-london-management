"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { archiveCashbookTargetAction } from "@/features/cashbook/actions";
import type { CashbookActionState } from "@/features/cashbook/types";

type CashbookTargetActionsProps = {
  targetId: string;
  canManage: boolean;
  status: string;
};

const initialState: CashbookActionState = { success: false, message: "" };

function ArchiveButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-2xl" disabled={pending} type="submit" variant="destructive">
      {pending ? "Archiving..." : "Archive target"}
    </Button>
  );
}

export function CashbookTargetActions({ targetId, canManage, status }: CashbookTargetActionsProps) {
  const [state, action] = useActionState(archiveCashbookTargetAction, initialState);

  if (!canManage || status !== "active") {
    return null;
  }

  return (
    <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-5 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <h2 className="text-lg font-bold text-[#0f2d47]">Target actions</h2>
      <p className="mt-1 text-sm text-[#5b6f82]">Archive soft-hides this monthly target while preserving target history.</p>
      <form action={action} className="mt-4">
        <input name="targetId" type="hidden" value={targetId} />
        <ArchiveButton />
      </form>
      {state.message ? <p className="mt-3 rounded-2xl bg-[#fff8ee] px-4 py-3 text-sm text-[#5b6f82]">{state.message}</p> : null}
    </section>
  );
}
