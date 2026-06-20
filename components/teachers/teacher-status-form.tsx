"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { TeacherActionState, TeacherDetail } from "@/features/teachers/types";

type TeacherStatusFormProps = {
  action: (previousState: TeacherActionState, formData: FormData) => Promise<TeacherActionState>;
  teacher: TeacherDetail;
};

const initialState: TeacherActionState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="outline">
      {pending ? "Updating..." : "Update status"}
    </Button>
  );
}

export function TeacherStatusForm({ action, teacher }: TeacherStatusFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <div>
          <h2 className="text-lg font-semibold">Archive / restore</h2>
          <p className="mt-1 text-sm text-muted-foreground">Archiving hides the teacher from daily lists while preserving future assignment history.</p>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Teacher status</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher.status} name="status">
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
