"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  correctAttendanceRecordAction,
  lockAttendanceSessionAction,
  reviewAttendanceSessionAction,
  submitAttendanceSessionAction,
  updateAttendanceRecordsAction,
} from "@/features/attendance/actions";
import type { AttendanceActionState, AttendanceRecordItem, AttendanceSessionDetail } from "@/features/attendance/types";

type AttendanceDetailPanelProps = {
  session: AttendanceSessionDetail;
};

const initialState: AttendanceActionState = { success: false, message: "" };
const statusOptions = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
  { value: "sick", label: "Sick" },
] as const;

function SubmitButton({ children, variant = "default" }: { children: string; variant?: "default" | "outline" | "destructive" }) {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit" variant={variant}>{pending ? "Saving..." : children}</Button>;
}

function ActionMessage({ state }: { state: AttendanceActionState }) {
  if (!state.message) {
    return null;
  }

  return <p className={state.success ? "mt-3 rounded-md bg-secondary/25 px-3 py-2 text-sm text-primary" : "mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"}>{state.message}</p>;
}

function SessionActionForm({
  attendanceSessionId,
  action,
  label,
  variant = "outline",
}: {
  attendanceSessionId: string;
  action: (previousState: AttendanceActionState, formData: FormData) => Promise<AttendanceActionState>;
  label: string;
  variant?: "default" | "outline" | "destructive";
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <input name="attendanceSessionId" type="hidden" value={attendanceSessionId} />
      <SubmitButton variant={variant}>{label}</SubmitButton>
      <ActionMessage state={state} />
    </form>
  );
}

function CorrectionForm({ attendanceSessionId, record }: { attendanceSessionId: string; record: AttendanceRecordItem }) {
  const [state, action] = useActionState(correctAttendanceRecordAction, initialState);

  return (
    <form action={action} className="mt-3 rounded-md border bg-background p-3">
      <input name="attendanceSessionId" type="hidden" value={attendanceSessionId} />
      <input name="attendanceRecordId" type="hidden" value={record.id} />
      <div className="grid gap-3 md:grid-cols-[150px_1fr_auto] md:items-end">
        <label className="block">
          <span className="text-xs font-medium">Correction</span>
          <select className="mt-2 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={record.status} name="newStatus">
            {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium">Reason</span>
          <input className="mt-2 h-9 w-full rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="correctionReason" placeholder="Why is this correction needed?" />
        </label>
        <SubmitButton variant="outline">Correct</SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}

export function AttendanceDetailPanel({ session }: AttendanceDetailPanelProps) {
  const [saveState, saveAction] = useActionState(updateAttendanceRecordsAction, initialState);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Session controls</h2>
            <p className="mt-1 text-sm text-muted-foreground">Save drafts before submitting. Management can review, lock, and correct attendance.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.canSubmit ? <SessionActionForm action={submitAttendanceSessionAction} attendanceSessionId={session.id} label="Submit attendance" /> : null}
            {session.canReview ? <SessionActionForm action={reviewAttendanceSessionAction} attendanceSessionId={session.id} label="Review" /> : null}
            {session.canLock ? <SessionActionForm action={lockAttendanceSessionAction} attendanceSessionId={session.id} label="Lock" variant="destructive" /> : null}
          </div>
        </div>
      </section>

      <form action={saveAction} className="rounded-lg border bg-card p-5 shadow-soft">
        <input name="attendanceSessionId" type="hidden" value={session.id} />
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Student roster</h2>
            <p className="mt-1 text-sm text-muted-foreground">{session.recordCount} enrolled students loaded from the class roster.</p>
          </div>
          {session.canEdit ? <SubmitButton>Save draft</SubmitButton> : null}
        </div>
        <div className="mt-5 space-y-3">
          {session.records.map((record) => (
            <article className="rounded-md bg-muted/45 p-4" key={record.id}>
              <input name="recordId" type="hidden" value={record.id} />
              <div className="grid gap-4 lg:grid-cols-[1fr_170px_130px_1fr] lg:items-end">
                <div>
                  <p className="font-semibold">{record.studentName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{record.studentNumber}</p>
                  <Button asChild className="mt-3" size="sm" variant="outline"><Link href={`/students/${record.studentId}`}>View student</Link></Button>
                </div>
                <label className="block">
                  <span className="text-sm font-medium">Status</span>
                  <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={record.status} disabled={!session.canEdit} name={`status_${record.id}`}>
                    {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Arrival</span>
                  <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={record.arrivalTime ?? ""} disabled={!session.canEdit} name={`arrivalTime_${record.id}`} type="time" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Notes</span>
                  <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={record.notes ?? ""} disabled={!session.canEdit} name={`notes_${record.id}`} placeholder="Optional note" />
                </label>
              </div>
            </article>
          ))}
        </div>
        <ActionMessage state={saveState} />
      </form>

      {session.canCorrect ? (
        <section className="rounded-lg border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Corrections</h2>
          <p className="mt-1 text-sm text-muted-foreground">Correction forms are separate from draft saving and require a reason.</p>
          <div className="mt-4 space-y-3">
            {session.records.map((record) => (
              <article className="rounded-md bg-muted/45 p-4" key={record.id}>
                <div>
                  <p className="font-semibold">{record.studentName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Current status: {record.status}</p>
                </div>
                <CorrectionForm attendanceSessionId={session.id} record={record} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Correction history</h2>
        <div className="mt-4 space-y-3">
          {session.corrections.length > 0 ? session.corrections.map((correction) => (
            <article className="rounded-md bg-muted/45 p-4" key={correction.id}>
              <p className="text-sm font-semibold capitalize">{correction.previousStatus} to {correction.newStatus}</p>
              <p className="mt-1 text-sm text-muted-foreground">{correction.correctionReason}</p>
              <p className="mt-2 text-xs text-muted-foreground">{correction.correctedAt}</p>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No corrections recorded.</p>}
        </div>
      </section>
    </div>
  );
}
