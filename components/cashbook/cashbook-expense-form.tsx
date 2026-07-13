"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createCashbookExpenseAction, updateCashbookExpenseAction } from "@/features/cashbook/actions";
import type { CashbookActionState, CashbookExpenseDetail, CashbookOption } from "@/features/cashbook/types";

type CashbookExpenseFormProps = {
  businessAreas: CashbookOption[];
  categories: CashbookOption[];
  expense?: CashbookExpenseDetail;
};

const initialState: CashbookActionState = { success: false, message: "" };

function SubmitButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-2xl bg-[#f24a3a] px-6 text-white shadow-[0_14px_28px_rgba(242,74,58,0.22)] hover:bg-[#dc3729]" disabled={pending} type="submit">
      {pending ? "Saving..." : editing ? "Save changes" : "Record expense"}
    </Button>
  );
}

function fieldError(errors: Record<string, string[]> | undefined, key: string): string | null {
  return errors?.[key]?.[0] ?? null;
}

export function CashbookExpenseForm({ businessAreas, categories, expense }: CashbookExpenseFormProps) {
  const action = expense ? updateCashbookExpenseAction.bind(null, expense.id) : createCashbookExpenseAction;
  const [state, formAction] = useActionState(action, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
        <h2 className="text-xl font-bold text-[#0f2d47]">Expense details</h2>
        <p className="mt-2 text-sm text-[#5b6f82]">
          Record operational expenses such as salaries, rent, utilities, teaching materials, snacks, repairs, or marketing.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Expense Date</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.expenseDate ?? today} name="expenseDate" required type="date" />
            {fieldError(state.fieldErrors, "expenseDate") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "expenseDate")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Amount</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.amount} min="0.01" name="amount" required step="0.01" type="number" />
            {fieldError(state.fieldErrors, "amount") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "amount")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Expense Category</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.expenseCategoryId ?? ""} name="expenseCategoryId" required>
              <option value="">Choose a category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
            </select>
            {fieldError(state.fieldErrors, "expenseCategoryId") ? <p className="mt-1 text-xs text-[#c53227]">{fieldError(state.fieldErrors, "expenseCategoryId")}</p> : null}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Business Area (optional)</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.businessAreaId ?? ""} name="businessAreaId">
              <option value="">No business area selected</option>
              {businessAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Payment Method</span>
            <select className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.paymentMethod ?? "cash"} name="paymentMethod" required>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-[#0f2d47]">Supplier / Staff Member (optional)</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.supplierOrStaffName ?? ""} name="supplierOrStaffName" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#0f2d47]">Description (optional)</span>
            <input className="mt-2 h-11 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.description} name="description" placeholder="Leave blank to auto-generate from category and supplier" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-semibold text-[#0f2d47]">Notes (optional)</span>
            <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-[#dde5ec] bg-[#fffaf3] px-4 py-3 text-sm outline-none focus:border-[#f24a3a] focus:ring-2 focus:ring-[#f24a3a]/15" defaultValue={expense?.notes ?? ""} name="notes" />
          </label>
        </div>
      </section>

      {state.message ? (
        <p className={state.success ? "rounded-2xl bg-[#e6f4ec] px-4 py-3 text-sm text-[#24734d]" : "rounded-2xl bg-[#f24a3a]/10 px-4 py-3 text-sm text-[#c53227]"}>
          {state.message}
        </p>
      ) : null}

      <SubmitButton editing={Boolean(expense)} />
    </form>
  );
}
