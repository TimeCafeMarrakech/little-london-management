"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { AcademicActionState, ClassDetail, SelectOption } from "@/features/academic/types";

type ClassFormProps = {
  action: (previousState: AcademicActionState, formData: FormData) => Promise<AcademicActionState>;
  mode: "create" | "edit";
  courses: SelectOption[];
  classItem?: ClassDetail;
};

const initialState: AcademicActionState = { success: false, message: "" };

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Saving..." : mode === "create" ? "Create class" : "Save changes"}</Button>;
}

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? <p className="mt-1 text-sm text-destructive">{errors[0]}</p> : null;
}

export function ClassForm({ action, mode, courses, classItem }: ClassFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{state.message}</div> : null}
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Class details</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Class code</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.classCode} name="classCode" required />
            <FieldError errors={state.fieldErrors?.classCode} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Class name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.name} name="name" required />
            <FieldError errors={state.fieldErrors?.name} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Course</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.courseId ?? ""} name="courseId" required>
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.label} ({course.helper})
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.courseId} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Capacity</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.capacity ?? 12} min={1} name="capacity" required type="number" />
            <FieldError errors={state.fieldErrors?.capacity} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Start date</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.startDate ?? ""} name="startDate" type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End date</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={classItem?.endDate ?? ""} name="endDate" type="date" />
            <FieldError errors={state.fieldErrors?.endDate} />
          </label>
        </div>
      </section>
      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
