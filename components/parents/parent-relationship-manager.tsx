"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  linkStudentToParentAction,
  unlinkStudentFromParentAction,
  updateParentStudentRelationshipAction,
} from "@/features/parents/actions";
import type { AvailableStudentOption, LinkedStudentSummary, ParentActionState } from "@/features/parents/types";

type ParentRelationshipManagerProps = {
  parentId: string;
  linkedStudents: LinkedStudentSummary[];
  availableStudents: AvailableStudentOption[];
};

const initialState: ParentActionState = {
  success: false,
  message: "",
};

const relationshipOptions = [
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

function SubmitButton({ children, variant = "default" }: { children: string; variant?: "default" | "outline" | "destructive" }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit" variant={variant}>
      {pending ? "Saving..." : children}
    </Button>
  );
}

function ActionMessage({ state }: { state: ParentActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p className={state.success ? "rounded-md bg-secondary/25 px-3 py-2 text-sm text-primary" : "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"}>
      {state.message}
    </p>
  );
}

export function ParentRelationshipManager({ parentId, linkedStudents, availableStudents }: ParentRelationshipManagerProps) {
  const [linkState, linkAction] = useActionState(linkStudentToParentAction, initialState);
  const [updateState, updateAction] = useActionState(updateParentStudentRelationshipAction, initialState);
  const [unlinkState, unlinkAction] = useActionState(unlinkStudentFromParentAction, initialState);

  return (
    <div className="space-y-5">
      <form action={linkAction} className="rounded-md border bg-background p-4">
        <input name="parentId" type="hidden" value={parentId} />
        <div className="grid gap-3 md:grid-cols-[1fr_180px_auto] md:items-end">
          <label className="block">
            <span className="text-sm font-medium">Link student</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="studentId" required>
              <option value="">Choose a student</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName} ({student.studentNumber})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Relationship</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="relationshipType" required>
              {relationshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton>Link student</SubmitButton>
        </div>
        {availableStudents.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No unlinked active students are available.</p> : null}
        <div className="mt-3">
          <ActionMessage state={linkState} />
        </div>
      </form>

      <div className="grid gap-3 md:grid-cols-2">
        {linkedStudents.length > 0 ? (
          linkedStudents.map((student) => (
            <article className="rounded-md bg-muted/45 p-4" key={student.relationshipId}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{student.fullName}</p>
                {student.isPrimaryContact ? <span className="rounded-full bg-secondary/30 px-2 py-1 text-xs font-semibold text-primary">Primary</span> : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {student.studentNumber} - {student.relationshipType} - {student.status}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-background px-2 py-1">Pickup: {student.canPickUp ? "Yes" : "No"}</span>
                <span className="rounded-full bg-background px-2 py-1">Invoices: {student.receivesInvoices ? "Yes" : "No"}</span>
                <span className="rounded-full bg-background px-2 py-1">Announcements: {student.receivesAnnouncements ? "Yes" : "No"}</span>
              </div>
              <form action={updateAction} className="mt-4 flex flex-wrap items-end gap-2">
                <input name="parentId" type="hidden" value={parentId} />
                <input name="relationshipId" type="hidden" value={student.relationshipId} />
                <label className="block min-w-36 flex-1">
                  <span className="text-xs font-medium text-muted-foreground">Relationship type</span>
                  <select className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student.relationshipType} name="relationshipType">
                    {relationshipOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <SubmitButton variant="outline">Update</SubmitButton>
              </form>
              <form action={unlinkAction} className="mt-2">
                <input name="parentId" type="hidden" value={parentId} />
                <input name="relationshipId" type="hidden" value={student.relationshipId} />
                <SubmitButton variant="destructive">Unlink student</SubmitButton>
              </form>
            </article>
          ))
        ) : (
          <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">
            No linked students yet. Use the link form above to connect an active student to this parent.
          </p>
        )}
      </div>

      <ActionMessage state={updateState} />
      <ActionMessage state={unlinkState} />
    </div>
  );
}
