"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { TeacherActionState, TeacherDetail } from "@/features/teachers/types";

type TeacherFormProps = {
  action: (previousState: TeacherActionState, formData: FormData) => Promise<TeacherActionState>;
  mode: "create" | "edit";
  teacher?: TeacherDetail;
};

const initialState: TeacherActionState = {
  success: false,
  message: "",
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : mode === "create" ? "Create teacher" : "Save changes"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-1 text-sm text-destructive">{errors[0]}</p>;
}

export function TeacherForm({ action, mode, teacher }: TeacherFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.message}
        </div>
      ) : null}

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Teacher profile</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Teacher number</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.teacherNumber} name="teacherNumber" required />
            <FieldError errors={state.fieldErrors?.teacherNumber} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">First name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.firstName} name="firstName" required />
            <FieldError errors={state.fieldErrors?.firstName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Last name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.lastName} name="lastName" required />
            <FieldError errors={state.fieldErrors?.lastName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.email ?? ""} name="email" type="email" />
            <FieldError errors={state.fieldErrors?.email} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.phone ?? ""} name="phone" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Employment information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Employment type</span>
            <select
              className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue={teacher?.employmentType ?? "part_time"}
              name="employmentType"
            >
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contractor">Contractor</option>
              <option value="substitute">Substitute</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Hire date</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.hireDate ?? ""} name="hireDate" type="date" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Qualifications</span>
            <textarea className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.qualifications ?? ""} name="qualifications" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Availability notes</span>
            <textarea className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.availabilityNotes ?? ""} name="availabilityNotes" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Bio</span>
            <textarea className="mt-2 min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={teacher?.bio ?? ""} name="bio" />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
