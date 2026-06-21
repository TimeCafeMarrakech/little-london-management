"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { recordPaymentAction } from "@/features/finance/actions";
import type { FinanceActionState, FinanceOption } from "@/features/finance/types";

type PaymentFormProps = {
  parents: FinanceOption[];
  students: FinanceOption[];
  invoices: FinanceOption[];
};

const initialState: FinanceActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Recording..." : "Record payment"}</Button>;
}

export function PaymentForm({ parents, students, invoices }: PaymentFormProps) {
  const [state, formAction] = useActionState(recordPaymentAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Payment details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Payment number</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="paymentNumber" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Payment method</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="paymentMethod">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Parent</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="parentId" required>
              <option value="">Choose a parent</option>
              {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.label} ({parent.helper})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Student</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="studentId" required>
              <option value="">Choose a student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.label} ({student.helper})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Payment date</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={today} name="paymentDate" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Amount</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" min="0.01" name="amount" required step="0.01" type="number" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Reference number</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="referenceNumber" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="notes" />
        </label>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Invoice allocations</h2>
        <p className="mt-1 text-sm text-muted-foreground">Optional. Leave blank to record an unallocated payment.</p>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="grid gap-3 md:grid-cols-[1fr_170px]" key={index}>
              <select className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="allocationInvoiceId">
                <option value="">Choose invoice</option>
                {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.label} ({invoice.helper})</option>)}
              </select>
              <input className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" min="0" name="allocationAmount" placeholder="Amount" step="0.01" type="number" />
            </div>
          ))}
        </div>
      </section>

      {state.message ? (
        <p className={state.success ? "rounded-md bg-secondary/25 px-4 py-3 text-sm text-primary" : "rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
