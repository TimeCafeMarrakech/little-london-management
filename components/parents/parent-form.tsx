"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { ParentActionState, ParentDetail } from "@/features/parents/types";

type ParentFormProps = {
  action: (previousState: ParentActionState, formData: FormData) => Promise<ParentActionState>;
  mode: "create" | "edit";
  parent?: ParentDetail;
};

const initialState: ParentActionState = {
  success: false,
  message: "",
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : mode === "create" ? "Create parent" : "Save changes"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-1 text-sm text-destructive">{errors[0]}</p>;
}

export function ParentForm({ action, mode, parent }: ParentFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.message}
        </div>
      ) : null}

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Parent profile</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">First name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.firstName} name="firstName" required />
            <FieldError errors={state.fieldErrors?.firstName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Last name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.lastName} name="lastName" required />
            <FieldError errors={state.fieldErrors?.lastName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.phone} name="phone" required />
            <FieldError errors={state.fieldErrors?.phone} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Alternate phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.alternatePhone ?? ""} name="alternatePhone" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.email ?? ""} name="email" type="email" />
            <FieldError errors={state.fieldErrors?.email} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Preferred language</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.preferredLanguage ?? ""} name="preferredLanguage" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Portal status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.portalStatus ?? "not_invited"} name="portalStatus">
              <option value="not_invited">Not invited</option>
              <option value="invited">Invited</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Contact address</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Address line 1</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.addressLine1 ?? ""} name="addressLine1" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Address line 2</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.addressLine2 ?? ""} name="addressLine2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.city ?? ""} name="city" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Country</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={parent?.country ?? "Morocco"} name="country" />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
