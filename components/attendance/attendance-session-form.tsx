"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createAttendanceSessionAction } from "@/features/attendance/actions";
import type { AttendanceActionState, AttendanceClassOption } from "@/features/attendance/types";

type AttendanceSessionFormProps = {
  classes: AttendanceClassOption[];
};

const initialState: AttendanceActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Creating..." : "Create session"}</Button>;
}

export function AttendanceSessionForm({ classes }: AttendanceSessionFormProps) {
  const [state, action] = useActionState(createAttendanceSessionAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-medium">Class</span>
          <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="classId" required>
            <option value="">Choose a class</option>
            {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.label} ({classItem.helper})</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Session date</span>
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={today} name="sessionDate" type="date" required />
        </label>
        <SubmitButton />
      </div>
      {state.message ? <p className="mt-3 text-sm text-destructive">{state.message}</p> : null}
    </form>
  );
}
