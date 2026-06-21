"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { archiveInvoiceAction } from "@/features/finance/actions";
import type { FinanceActionState } from "@/features/finance/types";

type InvoiceArchiveFormProps = {
  invoiceId: string;
};

const initialState: FinanceActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} size="sm" type="submit" variant="destructive">{pending ? "Archiving..." : "Archive invoice"}</Button>;
}

export function InvoiceArchiveForm({ invoiceId }: InvoiceArchiveFormProps) {
  const [state, action] = useActionState(archiveInvoiceAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input name="invoiceId" type="hidden" value={invoiceId} />
      <SubmitButton />
      {state.message ? <p className="text-sm text-muted-foreground">{state.message}</p> : null}
    </form>
  );
}
