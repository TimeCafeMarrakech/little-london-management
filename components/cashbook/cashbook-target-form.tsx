"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createCashbookTargetAction, updateCashbookTargetAction } from "@/features/cashbook/actions";
import type { CashbookActionState, CashbookOption, CashbookTargetDetail } from "@/features/cashbook/types";

type CashbookTargetFormProps = {
  businessAreas: CashbookOption[];
  target?: CashbookTargetDetail;
};

const initialState: CashbookActionState = { success: false, message: "" };

function fieldError(errors: CashbookActionState["fieldErrors"], field: string): string | undefined {
  return errors?.[field]?.[0];
}

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-2xl bg-[#f24a3a] px-6 text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]" disabled={pending} type="submit">
      {pending ? "Saving..." : editing ? "Save changes" : "Create target"}
    </Button>
  );
}

function monthValue(value?: string): string {
  if (value) {
    return value.slice(0, 7);
  }

  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function CashbookTargetForm({ businessAreas, target }: CashbookTargetFormProps) {
  const action = target ? updateCashbookTargetAction.bind(null, target.id) : createCashbookTargetAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Target Month</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={monthValue(target?.targetMonth)} name="targetMonth" required type="month" />
            {fieldError(state.fieldErrors, "targetMonth") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "targetMonth")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Target Type</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={target?.targetType ?? "revenue"} name="targetType" required>
              <option value="revenue">Revenue</option>
              <option value="profit">Profit</option>
              <option value="expense_budget">Expense Budget</option>
              <option value="active_students">Active Students</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Target Value</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={target?.targetValue ?? ""} min="0" name="targetValue" required step="0.01" type="number" />
            {fieldError(state.fieldErrors, "targetValue") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "targetValue")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Business Area (optional)</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={target?.businessAreaId ?? ""} name="businessAreaId">
              <option value="">Whole business</option>
              {businessAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#0f2d47]">Notes (optional)</span>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={target?.notes ?? ""} name="notes" />
          </label>
        </div>
      </section>

      {state.message ? (
        <p className={state.success ? "rounded-2xl bg-[#e6f4ec] px-4 py-3 text-sm text-[#24734d]" : "rounded-2xl bg-[#ffe4df] px-4 py-3 text-sm text-[#c53227]"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton editing={Boolean(target)} />
    </form>
  );
}
