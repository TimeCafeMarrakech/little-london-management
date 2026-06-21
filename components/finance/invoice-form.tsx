"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createInvoiceAction, updateInvoiceAction } from "@/features/finance/actions";
import type { FinanceActionState, FinanceOption, InvoiceDetail } from "@/features/finance/types";

type InvoiceFormProps = {
  parents: FinanceOption[];
  students: FinanceOption[];
  invoice?: InvoiceDetail;
};

const initialState: FinanceActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Saving..." : "Save invoice"}</Button>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

export function InvoiceForm({ parents, students, invoice }: InvoiceFormProps) {
  const action = invoice ? updateInvoiceAction.bind(null, invoice.id) : createInvoiceAction;
  const [state, formAction] = useActionState(action, initialState);
  const itemRows: Array<{ description?: string; quantity?: number; unitPrice?: number }> = [
    ...(invoice?.items ?? []),
    ...Array.from({ length: 5 }, () => ({})),
  ].slice(0, 5);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Invoice details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Invoice number</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.invoiceNumber} name="invoiceNumber" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.status ?? "draft"} name="status">
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Parent</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.parentId ?? ""} name="parentId" required>
              <option value="">Choose a parent</option>
              {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.label} ({parent.helper})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Student</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.studentId ?? ""} name="studentId" required>
              <option value="">Choose a student</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.label} ({student.helper})</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Issue date</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.issueDate ?? today()} name="issueDate" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Due date</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.dueDate ?? defaultDueDate()} name="dueDate" required type="date" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={invoice?.notes ?? ""} name="notes" />
        </label>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Invoice items</h2>
        <div className="mt-4 space-y-3">
          {itemRows.map((item, index) => (
            <div className="grid gap-3 md:grid-cols-[1fr_130px_150px]" key={index}>
              <input className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={item?.description ?? ""} name="itemDescription" placeholder="Description" />
              <input className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={item?.quantity ?? ""} min="0" name="itemQuantity" placeholder="Qty" step="0.01" type="number" />
              <input className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={item?.unitPrice ?? ""} min="0" name="itemUnitPrice" placeholder="Unit price" step="0.01" type="number" />
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
