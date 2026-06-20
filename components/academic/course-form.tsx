"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { AcademicActionState, CourseDetail } from "@/features/academic/types";

type CourseFormProps = {
  action: (previousState: AcademicActionState, formData: FormData) => Promise<AcademicActionState>;
  mode: "create" | "edit";
  course?: CourseDetail;
};

const initialState: AcademicActionState = { success: false, message: "" };

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Saving..." : mode === "create" ? "Create course" : "Save changes"}</Button>;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="mt-1 text-sm text-destructive">{errors[0]}</p> : null;
}

export function CourseForm({ action, mode, course }: CourseFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{state.message}</div> : null}
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Course details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Course code</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.courseCode} name="courseCode" required />
            <FieldError errors={state.fieldErrors?.courseCode} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Course name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.name} name="name" required />
            <FieldError errors={state.fieldErrors?.name} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Level</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.level ?? ""} name="level" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Minimum age</span>
              <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.minimumAge ?? ""} min={0} name="minimumAge" type="number" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Maximum age</span>
              <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.maximumAge ?? ""} min={0} name="maximumAge" type="number" />
              <FieldError errors={state.fieldErrors?.maximumAge} />
            </label>
          </div>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea className="mt-2 min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={course?.description ?? ""} name="description" />
          </label>
        </div>
      </section>
      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
