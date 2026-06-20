"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { AcademicActionState } from "@/features/academic/types";

type AcademicStatusFormProps = {
  action: (previousState: AcademicActionState, formData: FormData) => Promise<AcademicActionState>;
  title: string;
  description: string;
  currentStatus: "active" | "inactive" | "archived";
};

const initialState: AcademicActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit" variant="outline">{pending ? "Updating..." : "Update status"}</Button>;
}

export function AcademicStatusForm({ action, title, description, currentStatus }: AcademicStatusFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Status</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={currentStatus} name="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <SubmitButton />
      </div>
      {state.message ? <p className={state.success ? "mt-3 text-sm text-primary" : "mt-3 text-sm text-destructive"}>{state.message}</p> : null}
    </form>
  );
}
