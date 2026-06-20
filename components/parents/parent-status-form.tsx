"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ParentActionState, ParentDetail } from "@/features/parents/types";

type ParentStatusFormProps = {
  action: (previousState: ParentActionState, formData: FormData) => Promise<ParentActionState>;
  parent: ParentDetail;
};

const initialState: ParentActionState = {
  success: false,
  message: "",
};

function StatusButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit" variant="outline">
      {pending ? "Updating..." : "Update status"}
    </Button>
  );
}

export function ParentStatusForm({ action, parent }: ParentStatusFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border bg-card p-5 shadow-soft">
      <h2 className="text-lg font-semibold">Archive and restore</h2>
      <p className="mt-1 text-sm text-muted-foreground">Archiving hides the parent from daily lists while preserving linked student history.</p>
      {state.message ? (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${state.success ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-destructive/10 text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
        <label>
          <span className="sr-only">Parent status</span>
          <select className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent.status} name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Status reason</span>
          <input className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="reason" placeholder="Reason for status change" />
        </label>
        <StatusButton />
      </div>
    </form>
  );
}
