"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createCashbookIncomeAction, updateCashbookIncomeAction } from "@/features/cashbook/actions";
import type { CashbookActionState, CashbookIncomeDetail, CashbookOption } from "@/features/cashbook/types";

type CashbookIncomeFormProps = {
  businessAreas: CashbookOption[];
  categories: CashbookOption[];
  parents: CashbookOption[];
  students: CashbookOption[];
  entry?: CashbookIncomeDetail;
};

const initialState: CashbookActionState = { success: false, message: "" };

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-2xl bg-[#f24a3a] px-6 text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]" disabled={pending} type="submit">
      {pending ? "Saving..." : editing ? "Save changes" : "Record income"}
    </Button>
  );
}

function fieldError(errors: Record<string, string[]> | undefined, key: string): string | null {
  return errors?.[key]?.[0] ?? null;
}

export function CashbookIncomeForm({ businessAreas, categories, parents, students, entry }: CashbookIncomeFormProps) {
  const action = entry ? updateCashbookIncomeAction.bind(null, entry.id) : createCashbookIncomeAction;
  const [state, formAction] = useActionState(action, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-xl font-bold text-[#0f2d47]">Income details</h2>
        <p className="mt-2 text-sm text-[#5b6f82]">Use this form for income received outside the invoice system.</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Income Date</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.incomeDate ?? today} name="incomeDate" required type="date" />
            {fieldError(state.fieldErrors, "incomeDate") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "incomeDate")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Amount</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.amount} min="0.01" name="amount" required step="0.01" type="number" />
            {fieldError(state.fieldErrors, "amount") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "amount")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Business Area</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.businessAreaId ?? ""} name="businessAreaId" required>
              <option value="">Choose a business area</option>
              {businessAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
            </select>
            {fieldError(state.fieldErrors, "businessAreaId") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "businessAreaId")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Income Category</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.incomeCategoryId ?? ""} name="incomeCategoryId" required>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
            {fieldError(state.fieldErrors, "incomeCategoryId") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "incomeCategoryId")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Payment Method</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.paymentMethod ?? "cash"} name="paymentMethod" required>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Parent (optional)</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.parentId ?? ""} name="parentId">
              <option value="">No parent selected</option>
              {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.label}{parent.helper ? ` (${parent.helper})` : ""}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Student (optional)</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.studentId ?? ""} name="studentId">
              <option value="">No student selected</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.label}{student.helper ? ` (${student.helper})` : ""}</option>)}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#0f2d47]">Description</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.description} name="description" required />
            {fieldError(state.fieldErrors, "description") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "description")}</p> : null}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#0f2d47]">Notes</span>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={entry?.notes ?? ""} name="notes" />
          </label>
        </div>
      </section>

      {state.message ? (
        <p className={state.success ? "rounded-2xl bg-[#e6f4ec] px-4 py-3 text-sm text-[#24734d]" : "rounded-2xl bg-[#f24a3a]/10 px-4 py-3 text-sm text-[#c53227]"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton editing={Boolean(entry)} />
    </form>
  );
}
